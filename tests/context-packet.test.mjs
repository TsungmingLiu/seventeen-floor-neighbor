import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  buildNarrativeReviewPacket,
  verifyNarrativeReviewPacket
} from '../tools/context-packet.mjs';

const scenePath = 'docs/narrative/scenes/vertical-slice/COM-00.md';
const contractPath = 'content/production/narrative/opening-ch1/COM-00.json';
const canonPaths = [
  'docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md',
  'docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md'
];
const sources = [contractPath, scenePath, ...canonPaths];
const packetArgs = { sceneId: 'COM-00', runId: 'opening-gate-test', taskId: 'NQA-COM00-001' };

function blobSha(path) {
  return execFileSync('git', ['rev-parse', `HEAD:${path}`], { encoding: 'utf8' }).trim();
}

function excerptSha(path, excerpt) {
  const lines = execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8' }).split('\n');
  return createHash('sha256')
    .update(lines.slice(excerpt.start_line - 1, excerpt.end_line).join('\n'))
    .digest('hex');
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function gitIn(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
}

test('COM-00 narrative review packet is deterministic and binds exact canonical sources', async () => {
  const packet = await buildNarrativeReviewPacket(packetArgs);
  const regenerated = await buildNarrativeReviewPacket(packetArgs);

  assert.deepEqual(regenerated, packet);
  assert.equal(packet.scene_id, 'COM-00');

  const acquired = packet.required_acquisition.markdown;
  assert.deepEqual(acquired.map(({ path }) => path).sort(), [...sources].sort());
  const expectedAllowlist = acquired.flatMap((item) => item.excerpts?.length
    ? item.excerpts.map((part) => `${item.path}#L${part.start_line}-L${part.end_line}`)
    : [item.path]);
  assert.deepEqual(packet.allowed_sources, expectedAllowlist);
  for (const item of acquired) {
    assert.equal(item.expected_nonempty, true);
    assert.match(item.git_blob_sha, /^[0-9a-f]{40}$/);
    assert.equal(item.git_blob_sha, blobSha(item.path));
    for (const excerpt of item.excerpts || []) {
      assert.match(excerpt.sha256, /^[0-9a-f]{64}$/);
      assert.equal(excerpt.sha256, excerptSha(item.path, excerpt));
    }
  }

  for (const path of sources) {
    assert.ok(packet.input_versions.some((input) => input.location === path && input.version === blobSha(path)));
  }
  assert.equal(await verifyNarrativeReviewPacket(packet), true);
});

test('COM-00 narrative review packet rejects forbidden roots, bad hashes, and missing bindings', async () => {
  const packet = await buildNarrativeReviewPacket(packetArgs);

  const forbidden = deepClone(packet);
  forbidden.allowed_sources.push('docs/archive/old-scene.md');
  await assert.rejects(verifyNarrativeReviewPacket(forbidden));

  const badHash = deepClone(packet);
  badHash.input_versions[0].version = '0'.repeat(40);
  await assert.rejects(verifyNarrativeReviewPacket(badHash));

  const missingPath = deepClone(packet);
  missingPath.required_acquisition.markdown = missingPath.required_acquisition.markdown.filter((item) => item.path !== canonPaths[0]);
  await assert.rejects(verifyNarrativeReviewPacket(missingPath));

  const missingScene = deepClone(packet);
  delete missingScene.scene_id;
  await assert.rejects(verifyNarrativeReviewPacket(missingScene));
});

test('COM-00 packet verification blocks changed or missing source bytes in an isolated repo', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'context-packet-integrity-'));
  try {
    const copiedPaths = [...sources, '.ai/WORKFLOW_MANIFEST.yaml'];
    for (const relative of copiedPaths) {
      const target = path.join(root, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, await readFile(path.resolve(relative)));
    }
    gitIn(root, 'init', '-q');
    gitIn(root, 'config', 'user.name', 'Packet Test');
    gitIn(root, 'config', 'user.email', 'packet-test@example.invalid');
    gitIn(root, 'add', ...copiedPaths);
    gitIn(root, 'commit', '-qm', 'COM-00 packet integrity fixture');

    const packet = await buildNarrativeReviewPacket({ ...packetArgs, root });
    assert.equal(await verifyNarrativeReviewPacket(packet, { root }), true);

    const sceneFile = path.join(root, scenePath);
    const originalScene = await readFile(sceneFile);
    const changedScene = Buffer.from(originalScene);
    changedScene[0] = changedScene[0] === 0x23 ? 0x24 : 0x23;
    await writeFile(sceneFile, changedScene);
    await assert.rejects(verifyNarrativeReviewPacket(packet, { root }));

    await writeFile(sceneFile, originalScene);
    await rm(path.join(root, canonPaths[0]));
    await assert.rejects(verifyNarrativeReviewPacket(packet, { root }));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('COM-00 packet can be regenerated byte-identically from its pinned source ref after an unrelated checkpoint', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'context-packet-ref-'));
  try {
    const copiedPaths = [...sources, '.ai/WORKFLOW_MANIFEST.yaml'];
    for (const relative of copiedPaths) {
      const target = path.join(root, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, await readFile(path.resolve(relative)));
    }
    gitIn(root, 'init', '-q');
    gitIn(root, 'config', 'user.name', 'Packet Test');
    gitIn(root, 'config', 'user.email', 'packet-test@example.invalid');
    gitIn(root, 'add', ...copiedPaths);
    gitIn(root, 'commit', '-qm', 'COM-00 packet source checkpoint');
    const sourceRef = gitIn(root, 'rev-parse', 'HEAD');

    const pinnedPacket = await buildNarrativeReviewPacket({ ...packetArgs, root, ref: sourceRef });
    await writeFile(path.join(root, 'unrelated-checkpoint.txt'), 'checkpoint\n');
    gitIn(root, 'add', 'unrelated-checkpoint.txt');
    gitIn(root, 'commit', '-qm', 'unrelated checkpoint');
    assert.notEqual(gitIn(root, 'rev-parse', 'HEAD'), sourceRef);

    const regenerated = await buildNarrativeReviewPacket({ ...packetArgs, root, ref: sourceRef });
    assert.equal(pinnedPacket.source_binding.github.ref, sourceRef);
    assert.deepEqual(regenerated, pinnedPacket);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

const selectedCanon = 'docs/narrative/CONTENT_PRODUCTION_SPEC.md';
const selectedBlueprint = 'docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_COMMON.md';

async function withSelectionFixture(bullets, check) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'context-packet-selection-'));
  const scene = 'docs/narrative/scenes/vertical-slice/COM-TEST.md';
  const contract = 'content/production/narrative/opening-ch1/COM-TEST.json';
  try {
    const files = {
      '.ai/WORKFLOW_MANIFEST.yaml': await readFile('.ai/WORKFLOW_MANIFEST.yaml'),
      [contract]: JSON.stringify({ scene_id: 'COM-TEST', source_scene: scene }),
      [scene]: `# Parser fixture\n\nProduction stage: Script Lock\n\n## Canonical inputs\n\n- \`${contract}\`\n${bullets}\n\n## Parser boundary\n`,
      [selectedCanon]: 'policy one\npolicy two\npolicy three\npolicy four\npolicy five\n',
      [selectedBlueprint]: 'boundary one\nboundary two\nboundary three\n',
      [canonPaths[0]]: 'macro one\nmacro two\nmacro three\n',
      [canonPaths[1]]: 'state one\nstate two\nstate three\n'
    };
    for (const [relative, bytes] of Object.entries(files)) {
      await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
      await writeFile(path.join(root, relative), bytes);
    }
    gitIn(root, 'init', '-q');
    gitIn(root, 'config', 'user.name', 'Packet Test');
    gitIn(root, 'config', 'user.email', 'packet-test@example.invalid');
    gitIn(root, 'add', ...Object.keys(files));
    gitIn(root, 'commit', '-qm', 'Parser selection fixture');
    await check({ root, sceneId: 'COM-TEST', runId: 'selection-test', taskId: 'NQA-TEST-001' });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('explicit canonical selections retain all ranges, group files and bind only exact excerpt identities', async () => {
  const bullets = [
    `- \`${selectedCanon}#L2-L3\`, \`${selectedCanon}#L5-L5\`, \`${selectedBlueprint}#L1-L2\` — bounded selections; prose mentions \`${selectedCanon}\`.`,
    `- \`${selectedBlueprint}#L1-L2\` — another source.`,
    `- \`${selectedCanon}#L1-L1\`, \`${selectedCanon}#L2-L3\` — additional and duplicate selection.`,
    '- `content/characters/fixture.json#L1-L2` — not narrative canon.',
    '- Prior unapproved fixture at `deadbeef`: `docs/narrative/scenes/vertical-slice/OLD.md#L1-L999`.',
    `Provenance mentions \`${selectedCanon}\` without authorizing a full file.`
  ].join('\n');
  await withSelectionFixture(bullets, async (args) => {
    const packet = await buildNarrativeReviewPacket(args);
    const source = packet.required_acquisition.markdown.find((item) => item.path === selectedCanon);
    assert.deepEqual(source.excerpts.map((part) => [part.start_line, part.end_line]), [[2, 3], [5, 5], [1, 1]]);
    assert.equal(packet.required_acquisition.markdown.filter((item) => item.path === selectedCanon).length, 1);
    const expected = ['L2-L3', 'L5-L5', 'L1-L1'].map((range) => `${selectedCanon}#${range}`);
    assert.deepEqual(packet.allowed_sources.filter((item) => item.startsWith(selectedCanon)), expected);
    assert.ok(packet.allowed_sources.includes(`${selectedBlueprint}#L1-L2`));
    assert.ok(!packet.allowed_sources.some((item) => item.includes('OLD.md') || item.startsWith('content/characters/')));
    assert.ok(!packet.input_versions.some((item) => item.location === selectedCanon));
    const lines = (await readFile(path.join(args.root, selectedCanon), 'utf8')).split('\n');
    for (const part of source.excerpts) {
      const location = `${selectedCanon}#L${part.start_line}-L${part.end_line}`;
      const sha = createHash('sha256').update(lines.slice(part.start_line - 1, part.end_line).join('\n')).digest('hex');
      assert.equal(part.sha256, sha);
      assert.equal(packet.input_versions.find((item) => item.location === location).version, sha);
    }
    assert.equal(await verifyNarrativeReviewPacket(packet, { root: args.root }), true);
    const widened = deepClone(packet);
    widened.allowed_sources.push(selectedCanon);
    await assert.rejects(verifyNarrativeReviewPacket(widened, { root: args.root }));
    const tampered = deepClone(packet);
    tampered.input_versions.find((item) => item.location === expected[0]).version = '0'.repeat(64);
    await assert.rejects(verifyNarrativeReviewPacket(tampered, { root: args.root }));
    await writeFile(path.join(args.root, selectedCanon), `${lines.join('\n')}changed outside selection\n`);
    await assert.rejects(verifyNarrativeReviewPacket(packet, { root: args.root }), /source differs from committed ref/);
  });
});

test('invalid, out-of-range, noncanonical and mixed narrative selections fail closed', async () => {
  for (const [selection, expected] of [
    [`${selectedCanon}#L3-L2`, /out-of-range narrative excerpt/],
    [`${selectedCanon}#L1-L99`, /out-of-range narrative excerpt/],
    [`${selectedCanon}#L0-L2`, /invalid narrative source selector/],
    [`${selectedCanon}#section`, /invalid narrative source selector/],
    [`${selectedCanon}#L1-L2#L3-L4`, /invalid narrative source selector/],
    ['docs/narrative/UNREGISTERED.md#L1-L2', /noncanonical narrative input/],
    ['docs/narrative/../outside.md#L1-L2', /forbidden or invalid source path/],
    ['docs/archive/old.md#L1-L2', /forbidden or invalid source path/],
    ['.ai/experiments/old.md#L1-L2', /forbidden or invalid source path/]
  ]) {
    await withSelectionFixture(`- \`${selection}\``, (args) =>
      assert.rejects(buildNarrativeReviewPacket(args), expected));
  }
  await withSelectionFixture(`- \`${selectedCanon}\`, \`${selectedCanon}#L1-L2\``, (args) =>
    assert.rejects(buildNarrativeReviewPacket(args), /mixed full-file and excerpt input/));
});

test('unfragmented canonical bullets keep legacy full-file packet identities', async () => {
  await withSelectionFixture(`- \`${selectedCanon}\` — unfragmented source.`, async (args) => {
    const packet = await buildNarrativeReviewPacket(args);
    const source = packet.required_acquisition.markdown.find((item) => item.path === selectedCanon);
    assert.equal(source.excerpts, undefined);
    assert.ok(packet.allowed_sources.includes(selectedCanon));
    assert.deepEqual(packet.input_versions.find((item) => item.location === selectedCanon), {
      id: `file:${selectedCanon}`, version: gitIn(args.root, 'rev-parse', `HEAD:${selectedCanon}`), location: selectedCanon
    });
    assert.equal(await verifyNarrativeReviewPacket(packet, { root: args.root }), true);
  });
});

test('explicit macro and state excerpts override legacy scene-derived selections', async () => {
  await withSelectionFixture(`- \`${canonPaths[0]}#L1-L2\`, \`${canonPaths[1]}#L2-L2\``, async (args) => {
    const packet = await buildNarrativeReviewPacket(args);
    assert.deepEqual(packet.allowed_sources.slice(2), [`${canonPaths[0]}#L1-L2`, `${canonPaths[1]}#L2-L2`]);
    assert.equal(await verifyNarrativeReviewPacket(packet, { root: args.root }), true);
  });
});

const defaultReviewPolicy = { model_tier: 'economical', routing_reason: 'default_bounded', attempt: 1 };
const conflictReviewPolicy = { model_tier: 'capable', routing_reason: 'material_ambiguity_or_conflict', attempt: 1 };
const routingFixtureBullet = `- \`${selectedCanon}\``;

test('default review packet bytes retain the pre-routing generator contract', async () => {
  await withSelectionFixture(routingFixtureBullet, async (args) => {
    const packet = await buildNarrativeReviewPacket(args);
    const explicitDefault = await buildNarrativeReviewPacket({ ...args, executionPolicy: defaultReviewPolicy });
    assert.equal(JSON.stringify(explicitDefault, null, 2), JSON.stringify(packet, null, 2));
    const normalized = deepClone(packet);
    // The fixture commit timestamp varies; every other byte is the old generator's output.
    normalized.source_binding.github.ref = '<pinned-source-ref>';
    assert.equal(createHash('sha256').update(`${JSON.stringify(normalized, null, 2)}\n`).digest('hex'),
      '2f80e54f9db1050bae0da5765301ca2b87be045e0a52cc5cc095f51e29131dc0');
    assert.equal(await verifyNarrativeReviewPacket(packet, { root: args.root }), true);
  });
});

test('explicit review routing retains exact policy and all canonical source bindings', async () => {
  await withSelectionFixture(routingFixtureBullet, async (args) => {
    const baseline = await buildNarrativeReviewPacket(args);
    const policies = [
      conflictReviewPolicy,
      { ...defaultReviewPolicy, attempt: 2, correction_of: 'NQA-PRIOR-001' },
      { ...conflictReviewPolicy, attempt: 2, escalation_from: 'NQA-PRIOR-001' },
      { ...conflictReviewPolicy, attempt: 2, correction_of: 'NQA-PRIOR-001' },
      { ...conflictReviewPolicy, attempt: 2, correction_of: 'NQA-PRIOR-001', escalation_from: 'NQA-PRIOR-001' },
      { model_tier: 'capable', routing_reason: 'validation_escalation', attempt: 3, escalation_from: 'NQA-PRIOR-002' },
      ...['creative_judgment', 'cross_scene_or_cross_system_reasoning', 'final_high_impact_qa'].map((routing_reason) =>
        ({ ...conflictReviewPolicy, routing_reason }))
    ];
    for (const executionPolicy of policies) {
      const packet = await buildNarrativeReviewPacket({ ...args, executionPolicy });
      assert.deepEqual(packet.execution_policy, executionPolicy);
      assert.deepEqual({ ...packet, execution_policy: defaultReviewPolicy }, baseline);
      assert.equal(await verifyNarrativeReviewPacket(packet, { root: args.root }), true);
    }
  });
});

test('explicit invalid review policy and lineage fail closed in generation and exact verification', async () => {
  await withSelectionFixture(routingFixtureBullet, async (args) => {
    const packet = await buildNarrativeReviewPacket(args);
    const invalid = [null, false, [], {},
      { routing_reason: 'default_bounded', attempt: 1 },
      { model_tier: 'economical', attempt: 1 },
      { model_tier: 'economical', routing_reason: 'default_bounded' },
      { ...defaultReviewPolicy, model_tier: 'strongest-model' },
      { ...defaultReviewPolicy, model_tier: null },
      { ...conflictReviewPolicy, routing_reason: 'default_bounded' },
      ...['task_importance_alone', 'source_count_alone', 'output_length_alone', '', null].map((routing_reason) =>
        ({ ...conflictReviewPolicy, routing_reason })),
      ...[0, -1, 1.5, '2', null, Number.MAX_SAFE_INTEGER + 1].map((attempt) => ({ ...defaultReviewPolicy, attempt })),
      { ...defaultReviewPolicy, extra: true },
      { ...defaultReviewPolicy, attempt: 2 },
      { ...defaultReviewPolicy, correction_of: 'NQA-PRIOR-001' },
      { ...conflictReviewPolicy, escalation_from: 'NQA-PRIOR-001' },
      ...['', ' bad-id', '../NQA-PRIOR-001', 'run/task', args.taskId, null, 2, {}, ['NQA-PRIOR-001']].flatMap((lineage) =>
        ['correction_of', 'escalation_from'].map((key) => ({ ...conflictReviewPolicy, attempt: 2, [key]: lineage }))),
      { ...conflictReviewPolicy, attempt: 2, correction_of: 'NQA-PRIOR-001', escalation_from: null },
      { ...conflictReviewPolicy, routing_reason: 'validation_escalation' },
      { ...conflictReviewPolicy, routing_reason: 'validation_escalation', attempt: 2, escalation_from: 'NQA-PRIOR-001' },
      { ...conflictReviewPolicy, routing_reason: 'validation_escalation', attempt: 3, correction_of: 'NQA-PRIOR-002' },
      { ...defaultReviewPolicy, routing_reason: 'validation_escalation', attempt: 3, escalation_from: 'NQA-PRIOR-002' }
    ];
    for (const executionPolicy of invalid) {
      await assert.rejects(buildNarrativeReviewPacket({ ...args, executionPolicy }), /execution_policy|default_bounded|validation_escalation/);
      await assert.rejects(verifyNarrativeReviewPacket({ ...packet, execution_policy: executionPolicy }, { root: args.root }),
        /execution_policy|default_bounded|validation_escalation/);
    }
    const missing = deepClone(packet);
    delete missing.execution_policy;
    await assert.rejects(verifyNarrativeReviewPacket(missing, { root: args.root }), /execution_policy/);
  });
});

test('capable review routing cannot weaken exact allowlists, acquisition or source integrity', async () => {
  await withSelectionFixture(routingFixtureBullet, async (args) => {
    const packet = await buildNarrativeReviewPacket({ ...args, executionPolicy: conflictReviewPolicy });
    for (const mutate of [
      (value) => value.allowed_sources.push('docs/archive/old.md'),
      (value) => value.allowed_sources.push(selectedBlueprint),
      (value) => { value.input_versions[0].version = '0'.repeat(40); },
      (value) => { value.required_acquisition.markdown[0].git_blob_sha = '0'.repeat(40); },
      (value) => { value.required_acquisition.markdown.pop(); },
      (value) => { value.source_binding.github.repository_full_name = 'wrong/repo'; },
      (value) => { value.objective = 'Expanded objective'; }
    ]) {
      const changed = deepClone(packet);
      mutate(changed);
      await assert.rejects(verifyNarrativeReviewPacket(changed, { root: args.root }));
    }
    await writeFile(path.join(args.root, selectedCanon), 'changed source bytes\n');
    await assert.rejects(verifyNarrativeReviewPacket(packet, { root: args.root }), /source differs from committed ref/);
    await rm(path.join(args.root, selectedCanon));
    await assert.rejects(verifyNarrativeReviewPacket(packet, { root: args.root }));
  });
});

test('review CLI projects explicit routing and rejects incomplete, malformed or out-of-scope options', async () => {
  await withSelectionFixture(routingFixtureBullet, async (args) => {
    // Isolate CLI transport from domain validators; production checks run separately.
    const toolFiles = {
      'context.mjs': await readFile('tools/context.mjs'),
      'context-packet.mjs': await readFile('tools/context-packet.mjs'),
      'content-lib.mjs': `export const projectRoot = ${JSON.stringify(args.root)}; export async function loadAndValidate() {}`,
      'validate-production-contracts.mjs': 'export function validateProductionContracts() {}',
      'verify-production-run.mjs': 'export function verifyProductionRun() {}',
      'render-cg-packets.mjs': 'export function buildPackets() {} export function validateManifest() {} export function validateRepoSourceCatalog() {} export const stableStringify = JSON.stringify;'
    };
    await mkdir(path.join(args.root, 'tools'));
    for (const [name, bytes] of Object.entries(toolFiles)) await writeFile(path.join(args.root, 'tools', name), bytes);
    const run = (flags) => spawnSync(process.execPath, [path.join(args.root, 'tools/context.mjs'), ...flags],
      { cwd: args.root, encoding: 'utf8' });
    const baseFlags = ['--task', 'narrative_review', '--scene', args.sceneId, '--run-id', args.runId, '--task-id', args.taskId];
    const defaultResult = run(baseFlags);
    assert.equal(defaultResult.status, 0, defaultResult.stderr);
    const destination = path.join(args.root, `generated/session-cache/${args.runId}/${args.taskId}.packet.json`);
    assert.equal(await readFile(destination, 'utf8'), `${JSON.stringify(await buildNarrativeReviewPacket(args), null, 2)}\n`);
    await rm(destination);
    const explicit = ['--model-tier', 'capable', '--routing-reason', 'material_ambiguity_or_conflict', '--attempt', '2',
      '--correction-of', 'NQA-PRIOR-001'];
    const generated = run([...baseFlags, ...explicit]);
    assert.equal(generated.status, 0, generated.stderr);
    const packet = JSON.parse(await readFile(destination, 'utf8'));
    assert.deepEqual(packet, await buildNarrativeReviewPacket({ ...args,
      executionPolicy: { ...conflictReviewPolicy, attempt: 2, correction_of: 'NQA-PRIOR-001' } }));
    assert.equal(await verifyNarrativeReviewPacket(packet, { root: args.root }), true);
    const verified = run(['--verify-packet', destination]);
    assert.equal(verified.status, 0, verified.stderr);
    await rm(destination);
    const escalated = run([...baseFlags, '--model-tier', 'capable', '--routing-reason', 'validation_escalation',
      '--attempt', '3', '--escalation-from', 'NQA-PRIOR-002']);
    assert.equal(escalated.status, 0, escalated.stderr);
    const escalatedPacket = JSON.parse(await readFile(destination, 'utf8'));
    assert.deepEqual(escalatedPacket.execution_policy,
      { model_tier: 'capable', routing_reason: 'validation_escalation', attempt: 3, escalation_from: 'NQA-PRIOR-002' });
    assert.equal(await verifyNarrativeReviewPacket(escalatedPacket, { root: args.root }), true);
    const policyFlags = ['--model-tier', 'capable', '--routing-reason', 'material_ambiguity_or_conflict'];
    for (const flags of [
      [...baseFlags, '--model-tier', 'capable'],
      [...baseFlags, '--correction-of', 'NQA-PRIOR-001'],
      [...baseFlags, ...policyFlags, '--attempt'],
      [...baseFlags, ...policyFlags, '--attempt', '--correction-of', 'NQA-PRIOR-001'],
      ...['2oops', '1.5', '0', '01', '9007199254740992'].map((value) => [...baseFlags, ...policyFlags, '--attempt', value]),
      [...baseFlags, ...explicit, '--attempt', '2'],
      [...baseFlags, ...policyFlags, '--attempt', '2'],
      [...baseFlags, ...explicit, '--escalation-from', 'bad/id'],
      [...baseFlags, ...explicit, '--model-tier', 'unknown'],
      [...baseFlags, '--model-tier', 'unknown', '--routing-reason', 'default_bounded', '--attempt', '1'],
      [...baseFlags, '--model-tier', 'capable', '--routing-reason', 'task_importance_alone', '--attempt', '1'],
      ['--task', 'cg_plan', ...explicit],
      ['--task', 'visual_review', ...explicit],
      ['--verify-packet', destination, ...explicit]
    ]) {
      const result = run(flags);
      assert.equal(result.status, 1, `Unexpected CLI acceptance: ${flags.join(' ')}\n${result.stderr}`);
      assert.match(result.stderr, /BLOCKED:/);
    }
  });
});
