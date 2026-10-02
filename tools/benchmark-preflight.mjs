import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildNarrativeReviewPacket } from './context-packet.mjs';
import { writeScratchFiles } from './compile-review-context.mjs';
import { preflightReview, runCheck, digest, hash } from './preflight-review.mjs';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scene = 'docs/narrative/scenes/vertical-slice/COM-02X.md';
const packetPath = 'generated/session-cache/preflight-fixture/task.packet.json';
const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

// Fault recipes are reusable tooling. Altered canonical bytes exist only in a
// temporary independent clone, never in the user's worktrees or game branch.
export const preflightCases = [
  { id: 'valid', stage: null },
  { id: 'invalid_packet_json', stage: 'packet' },
  { id: 'tampered_allowlist', stage: 'packet' },
  { id: 'dirty_scene', stage: 'packet' },
  { id: 'missing_scene', stage: 'packet' },
  { id: 'force_added_scratch', stage: 'scratch' },
  { id: 'broken_runtime_edges', stage: 'content' },
  { id: 'invalid_contract_schema', stage: 'production' },
  { id: 'bootstrap_drift', stage: 'packet' },
  { id: 'semantic_only_contradiction', stage: null }
];

async function mutate(root, id, packet) {
  const put = (relative, bytes) => writeFile(path.join(root, relative), bytes);
  if (id === 'invalid_packet_json') return put(packetPath, '{ invalid');
  if (id === 'tampered_allowlist') {
    packet.allowed_sources.push('docs/archive/forbidden.md');
    return put(packetPath, json(packet));
  }
  if (id === 'dirty_scene') return put(scene, `${await readFile(path.join(root, scene), 'utf8')}\nDirty fixture.\n`);
  if (id === 'missing_scene') return rm(path.join(root, scene));
  if (id === 'force_added_scratch') return git(root, 'add', '-f', packetPath);
  if (id === 'broken_runtime_edges') {
    const relative = 'content/routes/opening-demo/chapter-01.json';
    const chapter = JSON.parse(await readFile(path.join(root, relative), 'utf8'));
    for (const node of Object.values(chapter.nodes).filter((node) => node.next).slice(0, 12)) node.next = 'missing_preflight_fixture_node';
    return put(relative, json(chapter));
  }
  if (id === 'invalid_contract_schema') {
    const relative = 'content/production/narrative/opening-ch1/COM-00.json';
    const contract = JSON.parse(await readFile(path.join(root, relative), 'utf8'));
    contract.schema_version = 'fixture_invalid';
    return put(relative, json(contract));
  }
  if (id === 'bootstrap_drift') return put('.ai/harnesses/content-qa.md', `${await readFile(path.join(root, '.ai/harnesses/content-qa.md'), 'utf8')}\nFixture drift.\n`);
  if (id === 'semantic_only_contradiction') {
    const before = await readFile(path.join(root, scene), 'utf8');
    const after = before.replace('我大部分時間在家工作，忙起來', '我大部分時間在辦公室工作，忙起來');
    if (after === before) throw new Error('semantic fixture anchor missing');
    await put(scene, after);
    git(root, 'add', scene);
    git(root, 'commit', '-qm', 'isolated semantic counterexample');
    const rebuilt = await buildNarrativeReviewPacket({ root, sceneId: 'COM-02X', runId: 'fixture', taskId: 'fixture', ref: git(root, 'rev-parse', 'HEAD') });
    await put(packetPath, json(rebuilt));
  }
}

export async function benchmarkPreflight({ root = defaultRoot } = {}) {
  const temporary = await realpath(await mkdtemp(path.join(os.tmpdir(), 'quota-preflight-')));
  const clone = path.join(temporary, 'checkout');
  try {
    git(root, 'clone', '-q', '--local', '--no-hardlinks', '--single-branch', root, clone);
    git(clone, 'config', 'user.name', 'Preflight Fixture');
    git(clone, 'config', 'user.email', 'preflight@example.invalid');
    const ref = git(clone, 'rev-parse', 'HEAD');
    await mkdir(path.dirname(path.join(clone, packetPath)), { recursive: true });
    const initial = await buildNarrativeReviewPacket({ root: clone, sceneId: 'COM-02X', runId: 'fixture', taskId: 'fixture', ref });
    const cases = [], raw = [];
    const dispatchSpy = []; // Counts planned handoffs only; no model or API invocation.
    for (const recipe of preflightCases) {
      git(clone, 'reset', '--hard', '-q', ref);
      await mkdir(path.dirname(path.join(clone, packetPath)), { recursive: true });
      await writeFile(path.join(clone, packetPath), json(initial));
      await mutate(clone, recipe.id, structuredClone(initial));
      const existing = await runCheck(clone, 'tools/context.mjs', ['--verify-packet', packetPath]);
      const result = await preflightReview({ root: clone, packetPath });
      if (result.report.blocked_stage !== recipe.stage || result.report.dispatch_allowed !== (recipe.stage === null)) {
        throw new Error(`unexpected preflight outcome: ${recipe.id}: ${JSON.stringify(digest(result.report))}`);
      }
      if (result.report.dispatch_allowed) dispatchSpy.push(recipe.id);
      const view = digest(result.report);
      const failure = result.report.stages.find((item) => item.status === 'BLOCKED');
      const errorText = result.logs.find(([name]) => name === `${failure?.id}.log`)?.[1] || '';
      cases.push({ id: recipe.id, expected_stage: recipe.stage, existing_packet_verify: existing.ok ? 'READY' : 'BLOCKED',
        preflight: view, completed_stages: result.report.stages.map((item) => item.id),
        diagnostics_full_bytes: Buffer.byteLength(errorText),
        diagnostics_excerpt_bytes: Buffer.byteLength(json(failure?.diagnostics.lines || [])),
        existing_cli_output_bytes: Buffer.byteLength(existing.stdout + existing.stderr),
        digest_payload_bytes: Buffer.byteLength(`${JSON.stringify(view)}\n`), source_ref: result.report.bindings.source_ref || null });
      raw.push({ id: recipe.id, existing, report: result.report, logs: result.logs });
    }
    const summary = { source_checkpoint: ref, tooling_sha256: {
      benchmark: hash(await readFile(fileURLToPath(import.meta.url))),
      preflight: hash(await readFile(new URL('./preflight-review.mjs', import.meta.url))) },
      cases, counts: { cases: cases.length, mechanical_blocked: cases.filter((item) => item.expected_stage).length,
        agent_first_hypothetical_dispatches: cases.length,
        existing_packet_verifier_ready: cases.filter((item) => item.existing_packet_verify === 'READY').length,
        preflight_ready: dispatchSpy.length, actual_model_calls: 0 },
      dispatch_spy: dispatchSpy,
      conclusion: 'Coverage/dispatch simulation only, not measured tokens or quota. Existing validators already catch most faults. Bootstrap binding is additional to the standalone packet-verifier CLI, not a new semantic gate. Both valid and semantic-only fixtures still require independent semantic QA.',
      raw_sha256: hash(json(raw)) };
    return { summary, raw };
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

export async function writeBenchmark(result, runId, { root = defaultRoot } = {}) {
  if (!/^[a-zA-Z0-9_-]+$/.test(runId || '')) throw new Error('invalid run-id');
  return writeScratchFiles(`generated/session-cache/quota-preflight/${runId}`,
    [['benchmark.json', json(result.summary)], ['benchmark-raw.json', json(result.raw)]], { root });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 4 || process.argv[2] !== '--run-id') throw new Error('Usage: --run-id <new-id>');
    const result = await benchmarkPreflight();
    const destination = await writeBenchmark(result, process.argv[3]);
    console.log(JSON.stringify({ destination, counts: result.summary.counts, conclusion: result.summary.conclusion }));
  } catch (error) { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; }
}
