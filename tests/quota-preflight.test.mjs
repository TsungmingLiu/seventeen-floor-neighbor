import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildNarrativeReviewPacket } from '../tools/context-packet.mjs';
import { diagnostics, digest, preflightReview, writePreflight, hash } from '../tools/preflight-review.mjs';
import { benchmarkPreflight, writeBenchmark } from '../tools/benchmark-preflight.mjs';

const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();

test('preflight stops mechanical faults before a simulated handoff, while semantic contradictions remain QA work', async () => {
  const { summary, raw } = await benchmarkPreflight();
  assert.deepEqual(summary.counts, { cases: 10, mechanical_blocked: 8, agent_first_hypothetical_dispatches: 10,
    existing_packet_verifier_ready: 3, preflight_ready: 2, actual_model_calls: 0 });
  assert.deepEqual(summary.dispatch_spy, ['valid', 'semantic_only_contradiction']);
  for (const item of raw) {
    assert.equal(item.report.semantic_qa, 'NOT_RUN');
    assert.equal(item.report.production_approval, false);
    if (item.id === 'bootstrap_drift') assert.equal(item.existing.ok, true);
    if (item.report.blocked_stage) assert.equal(item.report.stages.at(-1).status, 'BLOCKED');
  }
  const runtime = summary.cases.find((item) => item.id === 'broken_runtime_edges');
  assert.equal(runtime.preflight.diagnostics.truncated, true);
  assert.ok(runtime.preflight.diagnostics.total_lines >= 13);
  assert.ok(runtime.diagnostics_excerpt_bytes < runtime.diagnostics_full_bytes);
  assert.deepEqual(runtime.completed_stages, ['scratch', 'packet', 'content']); // No later production check.
  const forced = summary.cases.find((item) => item.id === 'force_added_scratch');
  assert.deepEqual(forced.completed_stages, ['scratch']);
});

test('diagnostic projection is bounded and retains an honest truncation marker', () => {
  const excerpt = diagnostics(Array.from({ length: 100 }, () => `\x00${'錯'.repeat(1000)}`).join('\n'));
  assert.equal(excerpt.total_lines, 100);
  assert.equal(excerpt.truncated, true);
  assert.equal(excerpt.lines.length, 3);
  assert.ok(excerpt.lines.every((line) => [...line].length === 180 && !line.includes('\x00')));
});

test('valid reports rebuild exactly; packet/output symlinks, path escapes, overwrite and unsafe scratch are rejected', async () => {
  const temporary = await realpath(await mkdtemp(path.join(os.tmpdir(), 'preflight-boundary-')));
  const root = path.join(temporary, 'checkout');
  try {
    git(process.cwd(), 'clone', '-q', '--local', '--no-hardlinks', '--single-branch', process.cwd(), root);
    const relative = 'generated/session-cache/input/task.packet.json';
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    const packet = await buildNarrativeReviewPacket({ root, sceneId: 'COM-02X', runId: 'fixture', taskId: 'fixture', ref: git(root, 'rev-parse', 'HEAD') });
    const body = `${JSON.stringify(packet, null, 2)}\n`;
    await writeFile(path.join(root, relative), body);
    const first = await preflightReview({ root, packetPath: relative });
    assert.equal(first.report.status, 'READY_FOR_SEMANTIC_QA');
    assert.equal(digest(first.report).packet_sha256, hash(body));
    assert.deepEqual(await preflightReview({ root, packetPath: relative }), first);
    const destination = await writePreflight(first, 'rebuild', { root });
    const original = await readFile(path.join(root, destination, 'report.json'));
    await assert.rejects(writePreflight(first, 'rebuild', { root }), /EEXIST/);
    await rm(path.join(root, destination), { recursive: true });
    await writePreflight(await preflightReview({ root, packetPath: relative }), 'rebuild', { root });
    assert.deepEqual(await readFile(path.join(root, destination, 'report.json')), original);
    assert.equal(git(root, 'status', '--porcelain'), '');
    for (const invalid of ['../AGENTS.md', 'generated/session-cache/../../AGENTS.md', '/tmp/outside.json']) {
      const result = await preflightReview({ root, packetPath: invalid });
      assert.equal(result.report.dispatch_allowed, false);
      assert.equal(result.report.blocked_stage, 'packet');
    }
    const alias = 'generated/session-cache/input/alias.json';
    await symlink(path.join(root, relative), path.join(root, alias));
    assert.equal((await preflightReview({ root, packetPath: alias })).report.dispatch_allowed, false);
    await symlink(path.join(root, 'docs'), path.join(root, 'generated/session-cache/quota-preflight/redirect'));
    await assert.rejects(writePreflight(first, 'redirect', { root }), /symlink/);
    await assert.rejects(writeBenchmark({ summary: {}, raw: [] }, '../escape', { root }), /invalid run-id/);
    await writeFile(path.join(root, '.gitignore'), '');
    const unsafe = await preflightReview({ root, packetPath: relative });
    assert.equal(unsafe.report.blocked_stage, 'scratch');
    assert.equal(await writePreflight(unsafe, 'unsafe', { root }), null);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
