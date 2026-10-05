import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
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
