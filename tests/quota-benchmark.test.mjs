import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, realpath, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { buildBenchmark, makeCases, selectHeadings, parseWorkerEvents, scoreTrial } from '../tools/benchmark-review-context.mjs';
import { writeScratchFiles } from '../tools/compile-review-context.mjs';

const scenePath = 'docs/narrative/scenes/vertical-slice/COM-02X.md';
const scene = await readFile(scenePath, 'utf8');
const ref = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();

test('four-arm COM-02X benchmark preserves complete target and strict continuity evidence, without leaking gold', async () => {
  const result = await buildBenchmark({ base: ref, ref });
  const rebuilt = await buildBenchmark({ base: ref, ref });
  assert.deepEqual(result, rebuilt);
  assert.equal(result.manifest.matrix.length, 24);
  const files = new Map(result.files);
  const audit = JSON.parse(files.get('source-audit.json'));
  for (const arm of ['baseline', 'continuity', 'digest', 'combined']) {
    assert.ok(files.get(`${arm}-T01.input.md`).includes(scene));
    assert.ok(!files.get(`${arm}-T01.input.md`).includes('scoring-key'));
    assert.ok(!files.get(`${arm}-T01.input.md`).includes('hard_recall'));
    const armAudit = audit.find((item) => item.arm === arm);
    assert.equal(armAudit.sources.length, 6);
    if (['continuity', 'combined'].includes(arm)) {
      assert.ok(files.get(`${arm}-T01.input.md`).includes('我叫 [PLAYER_NAME]'));
      assert.ok(files.get(`${arm}-T01.input.md`).includes('common_elevator_restart_smalltalk'));
      for (const source of armAudit.sources.filter((item) => /COM-00.md|COM-01X.md/.test(item.path))) {
        assert.ok(source.excerpts.length >= 6);
        assert.ok(source.excerpts.every((part) => part.start_line > 0 && part.end_line >= part.start_line && /^[0-9a-f]{64}$/.test(part.sha256)));
        assert.ok(source.excerpts.some((part) => part.label === '## Dialogue writing notes'));
        assert.ok(source.excerpts.some((part) => part.label === '## State contract'));
      }
    }
  }
  assert.ok(files.get('instructions.md').includes('NQA-DIALOGUE-NATURALISM'));
  assert.ok(files.get('instructions.md').includes('Source Authority and Document Lifecycle'));
  assert.ok(result.manifest.comparison.find((row) => row.arm === 'combined').reduction_percent > 0);
});

test('fixture recipes fail on stale anchors and isolate known probes without editing canon', () => {
  const cases = makeCases(scene);
  assert.equal(cases.length, 6);
  assert.equal(cases[0].text, scene);
  assert.ok(cases[2].text.includes('手機號碼，我已經存好了'));
  assert.ok(cases[3].text.includes('第一次約會'));
  assert.equal(cases[4].text.split('→ Rejoin `common_convenience_xu_exit`').length, 2);
  assert.equal(cases.filter((row) => row.gold.kind === 'hard').length, 3);
  assert.throws(() => makeCases(scene.replace('對。我剛剛挑半天', '對。我挑半天')), /anchor/);
  assert.throws(() => selectHeadings('# title\n', ['## State contract']), /missing/);
  assert.throws(() => selectHeadings('## State contract\n## State contract\n', ['## State contract']), /ambiguous/);
});

const qa = { status: 'PASS', naturalism: 'PASS', findings: [] };
const events = (result = qa, usage = { input_tokens: 100, output_tokens: 20, cached_input_tokens: 40 }) => [
  { type: 'item.completed', item: { type: 'agent_message', text: JSON.stringify(result) } },
  { type: 'turn.completed', usage }
].map((item) => JSON.stringify(item)).join('\n');

test('trial usage is real and cached tokens are not double-counted; missing usage, tool use and failures block', () => {
  assert.equal(parseWorkerEvents(events()).total_tokens, 120);
  assert.throws(() => parseWorkerEvents(events(qa, {})), /usage/);
  assert.throws(() => parseWorkerEvents(`${events()}\n${JSON.stringify({ type: 'turn.failed' })}`), /successful/);
  assert.throws(() => parseWorkerEvents(`${events()}\n${JSON.stringify({ type: 'item.completed', item: { type: 'command_execution' } })}`), /scope/);
  assert.throws(() => parseWorkerEvents(events({ ...qa, naturalism: undefined })), /QA result/);
});

test('paired scorer requires matching category and location, reports misses, and never auto-approves quality', () => {
  const cases = makeCases(scene), key = cases.map(({ text, ...item }) => item);
  const records = ['baseline', 'combined'].flatMap((arm) => key.map((item) => ({ arm, case_id: item.id,
    total_tokens: arm === 'baseline' ? 100 : 70, result: { ...qa, findings: item.gold.kind === 'hard'
      ? [{ category: item.gold.category, severity: 'hard', node: item.gold.node, evidence: 'fixture evidence', reason: 'violates contract' }] : [] } })));
  const score = scoreTrial(records, key);
  assert.equal(score.median_total_token_reduction_percent, 30);
  assert.equal(score.mechanical_threshold_met, true);
  assert.equal(score.adoption, 'NOT_APPROVED');
  assert.equal(score.human_blind_review, 'PENDING');
  const missed = structuredClone(records);
  missed.find((row) => row.arm === 'combined' && row.case_id === 'T03').result.findings[0].node = 'wrong_node';
  assert.equal(scoreTrial(missed, key).mechanical_threshold_met, false);
  assert.throws(() => scoreTrial(records.slice(1), key), /12/);
});

test('shared scratch writer rejects path traversal and overwrites', async () => {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'quota-scratch-')));
  try {
    await assert.rejects(writeScratchFiles('generated/session-cache/../../canon', [['x', 'x']], { root }), /invalid/);
    await assert.rejects(writeScratchFiles('generated/session-cache/probe', [['../canon', 'x']], { root }), /invalid/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
