import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildProductionReviewModel, writeProductionReview } from '../tools/production-review.mjs';
import { renderProductionReview } from '../tools/production-review-render.mjs';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const modelPromise = buildProductionReviewModel('COM-01X');

test('COM-01X review binds its contract, accepted WebP bytes, route choices, Memory replay, and next scene', async () => {
  const model = await modelPromise;
  assert.equal(model.scene.id, 'COM-01X');
  assert.equal(model.scene.source_scene, 'docs/narrative/scenes/vertical-slice/COM-01X.md');
  assert.ok(model.provenance.sources.some((source) => source.path === model.scene.source_scene));

  assert.equal(model.visuals.length, 3);
  for (const visual of model.visuals) {
    assert.equal(visual.status, 'accepted');
    assert.match(visual.thumbnailDataUrl, /^data:image\/webp;base64,/);
    const bytes = Buffer.from(visual.thumbnailDataUrl.slice('data:image/webp;base64,'.length), 'base64');
    assert.equal(bytes.toString('base64'), visual.thumbnailDataUrl.slice('data:image/webp;base64,'.length));
    assert.equal(sha256(bytes), visual.sha256);
    assert.ok(bytes.length > 12 && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP');
    assert.ok(visual.repoPath.endsWith('.webp'));
  }

  assert.equal(model.choices.length, 1);
  assert.equal(model.choices[0].nodeId, 'common_elevator_restart_choice');
  assert.equal(model.choices[0].items.length, 3);
  assert.deepEqual(model.choices[0].items.map((item) => item.next), [
    'common_elevator_restart_match_dry',
    'common_elevator_restart_check_panel',
    'common_elevator_restart_wait'
  ]);
  assert.equal(model.runtime.memory.replayNode, 'common_elevator_restart_enter');
  assert.ok(model.runtime.memory.galleryAssets.includes('cg.opening.com01x.base_normal'));
  assert.deepEqual(model.runtime.nextScenes, [{ sceneId: 'COM-01B', nodeId: 'common_bookstore_bridge_enter' }]);
});

test('COM-01X shows independently verified Narrative QA while Visual QA and Human remain unknown', async () => {
  const model = await modelPromise;
  const { production } = model;
  assert.equal(production.readiness, 'NOT_READY');
  assert.equal(production.narrativeQa, 'PASS_CURRENT');
  assert.equal(production.visualQa, 'UNRECORDED');
  assert.equal(production.humanGate, 'UNRECORDED');
  assert.equal(production.staleStatus, 'NARRATIVE_QA_CURRENT_OTHER_GATES_UNKNOWN');
  assert.equal(model.provenance.narrativeQa.runId, 'issue16-com01x-nqa-20260927');
  assert.equal(model.provenance.narrativeQa.taskId, 'NQA-COM01X-001');
});

test('COM-00 shows independently verified Narrative QA and one candidate Visual QA failure', async () => {
  const model = await buildProductionReviewModel('COM-00');
  assert.equal(model.production.narrativeQa, 'PASS_CURRENT');
  assert.equal(model.production.visualQa, 'CURRENT_FAIL');
  assert.equal(model.production.humanGate, 'UNRECORDED');
  assert.equal(model.production.readiness, 'NOT_READY');
  assert.equal(model.production.staleStatus, 'CANDIDATE_VISUAL_QA_CURRENT_FAIL_OTHER_GATES_UNKNOWN');
  assert.equal(model.provenance.narrativeQa.runId, 'issue16-com00-nqa-20260926');
  assert.equal(model.provenance.narrativeQa.taskId, 'NQA-COM00-001');
  assert.equal(model.provenance.narrativeQa.sourceRef, 'ea788a958c83851cfa0cca235825552fa66f2cb2');
  assert.equal(model.provenance.narrativeQa.qaCodes.length, 5);
  assert.equal(model.provenance.candidateVisualQa.length, 1);
  const candidate = model.provenance.candidateVisualQa[0];
  assert.equal(candidate.status, 'CURRENT_FAIL');
  assert.equal(candidate.entryId, 'COM00-S04-BASE-NEUTRAL');
  assert.equal(candidate.runId, 'issue16-com00-vqa-recovery-20260927');
  assert.equal(candidate.taskId, 'VQA-COM00-S04-BASE-002');
  assert.equal(candidate.candidateSha256, '7f18dccd8483498adc196c144cc6edafeff6bdd0f6db573bee288b32152862ea');
  assert.ok(candidate.qaCodes.includes('VQA-DIALOGUE-SAFE-ZONE'));
  assert.ok(model.provenance.sources.some((source) => source.path === candidate.receiptPath));
  const html = renderProductionReview(model);
  assert.match(html, /Narrative QA evidence/);
  assert.match(html, /NQA-PROVENANCE-01/);
  assert.match(html, /Candidate Visual QA evidence/);
  assert.match(html, /CURRENT_FAIL/);
  assert.match(html, /VQA-DIALOGUE-SAFE-ZONE/);
  assert.match(html, /Human decision<\/dt><dd>UNRECORDED/);
  assert.doesNotMatch(html, /stale status is UNKNOWN_NO_RUN_LEDGER/);
});

test('tampered committed QA receipt blocks and removes prior page in isolated worktree', async () => {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'production-review-'));
  const worktree = path.join(temporary, 'repo');
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
  let added = false;
  try {
    git('worktree', 'add', '--detach', worktree, 'HEAD');
    added = true;
    for (const file of ['tools/production-review.mjs', 'tools/production-review-render.mjs']) {
      await copyFile(path.join(repo, file), path.join(worktree, file));
    }
    const run = (...args) => execFileSync('node', args, { cwd: worktree, encoding: 'utf8' });
    run('tools/production-review.mjs', '--scene', 'COM-00');
    const page = path.join(worktree, 'generated/reviews/COM-00/index.html');
    assert.match(await readFile(page, 'utf8'), /PASS_CURRENT/);
    const receipt = path.join(worktree, 'content/production/runs/issue16-com00-nqa-20260926/NQA-COM00-001.decision.json');
    const original = await readFile(receipt, 'utf8');
    await writeFile(receipt, original.replace('NQA-FUNCTION-01', 'NQA-FUNCTION-99'));
    assert.throws(() => run('tools/production-review.mjs', '--scene', 'COM-00'),
      (error) => error.stderr?.toString().includes('decision source differs from committed HEAD'));
    await assert.rejects(readFile(page), { code: 'ENOENT' });
  } finally {
    if (added) git('worktree', 'remove', '--force', worktree);
    await rm(temporary, { recursive: true, force: true });
  }
});

test('tampered candidate decision blocks review and removes an earlier failure page', async () => {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'production-review-candidate-'));
  const worktree = path.join(temporary, 'repo');
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
  let added = false;
  try {
    git('worktree', 'add', '--detach', worktree, 'HEAD');
    added = true;
    const run = (...args) => execFileSync('node', args, { cwd: worktree, encoding: 'utf8' });
    run('tools/production-review.mjs', '--scene', 'COM-00');
    const page = path.join(worktree, 'generated/reviews/COM-00/index.html');
    assert.match(await readFile(page, 'utf8'), /Candidate Visual QA evidence/);
    const receipt = path.join(worktree,
      'content/production/runs/issue16-com00-vqa-recovery-20260927/VQA-COM00-S04-BASE-002.decision.json');
    const original = await readFile(receipt, 'utf8');
    await writeFile(receipt, original.replace('VQA-DIALOGUE-SAFE-ZONE', 'VQA-UNKNOWN-FORGED-CODE'));
    assert.throws(() => run('tools/production-review.mjs', '--scene', 'COM-00'),
      (error) => error.stderr?.toString().includes('decision source differs from committed HEAD'));
    await assert.rejects(readFile(page), { code: 'ENOENT' });
  } finally {
    if (added) git('worktree', 'remove', '--force', worktree);
    await rm(temporary, { recursive: true, force: true });
  }
});

test('review HTML is deterministic, self-contained, and contains three WebP thumbnails', async () => {
  const model = await modelPromise;
  const first = renderProductionReview(model);
  assert.equal(renderProductionReview(model), first);
  assert.equal((first.match(/src="data:image\/webp;base64,/g) || []).length, 3);
  assert.doesNotMatch(first, /<script\b|\son[a-z]+\s*=|(?:src|href)="https?:\/\//i);
  assert.doesNotMatch(first, /https?:\/\//i);
});

test('review renderer escapes injected markup and rejects unsafe thumbnail sources', async () => {
  const model = structuredClone(await modelPromise);
  model.scene.title = 'x\"><script>alert(1)</script>';
  model.visuals[0].logicalId = 'id\"><img src=x onerror=alert(1)>';
  model.visuals[0].thumbnailDataUrl = 'data:image/svg+xml,<svg onload=alert(1)>';
  const html = renderProductionReview(model);
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.doesNotMatch(html, /<script\b|<img src=x|<[^>]*\sonerror=/);
  assert.equal((html.match(/src="data:image\/webp;base64,/g) || []).length, 2);
  assert.ok(html.includes('UNRECORDED thumbnail'));
});

test('failed regeneration removes a stale generated page when its contract is missing', async () => {
  const directory = 'generated/reviews/COM-99X';
  const page = `${directory}/index.html`;
  let createdDirectory = false;
  try {
    await mkdir('generated/reviews', { recursive: true });
    await mkdir(directory);
    createdDirectory = true;
    await writeFile(page, '<!doctype html><title>stale</title>');
    await assert.rejects(writeProductionReview('COM-99X'), /expected one Narrative Continuity Contract/);
    await assert.rejects(readFile(page), { code: 'ENOENT' });
  } finally {
    if (createdDirectory) await rm(directory, { recursive: true, force: true });
  }
});
