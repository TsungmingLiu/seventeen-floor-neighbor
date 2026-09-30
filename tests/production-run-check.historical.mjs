import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { projectRoot } from '../tools/content-lib.mjs';
import { verifyProductionRun, writeProductionRunCheck } from '../tools/verify-production-run.mjs';

const runId = 'issue16-com00-nqa-20260926';
const com01xRunId = 'issue16-com01x-nqa-20260927';

test('the real COM-00 decision reconstructs as a current QA PASS without session cache', async () => {
  const result = await verifyProductionRun(runId);
  assert.equal(result.task_status, 'CURRENT_PASS');
  assert.equal(result.run_status, 'ACTIVE');
  assert.equal(result.packet_sha256, '7d04cc37570c82c0b64446775e8e4abe20b8ad71b2aec95d6f9f543890388730');
  assert.equal(result.qa_codes.length, 5);
});

test('narrative QA ignores unrelated document text but invalidates a reviewed scene excerpt', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'production-run-scope-'));
  const checkout = path.join(temp, 'checkout');
  execFileSync('git', ['-C', projectRoot, 'worktree', 'add', '--detach', checkout, 'HEAD'], { stdio: 'pipe' });
  const relative = 'docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md';
  const commit = (message) => {
    execFileSync('git', ['-C', checkout, 'add', relative], { stdio: 'pipe' });
    execFileSync('git', ['-C', checkout, '-c', 'user.name=Production Test',
      '-c', 'user.email=production-test@example.invalid', 'commit', '-qm', message], { stdio: 'pipe' });
  };
  try {
    const source = path.join(checkout, relative);
    const original = await readFile(source, 'utf8');
    await writeFile(source, `<!-- routing note outside the reviewed COM-00 excerpt -->\n${original}`);
    commit('Unrelated narrative document heading');
    assert.equal((await verifyProductionRun(runId, { root: checkout })).task_status, 'CURRENT_PASS');

    const updated = await readFile(source, 'utf8');
    assert.ok(updated.includes('**Entry**：遊戲起點。'));
    await writeFile(source, updated.replace('**Entry**：遊戲起點。', '**Entry**：不同的劇情起點。'));
    commit('Change reviewed COM-00 narrative beat');
    await assert.rejects(verifyProductionRun(runId, { root: checkout }),
      /reviewed narrative inputs differ from current committed content/);
  } finally {
    execFileSync('git', ['-C', projectRoot, 'worktree', 'remove', '--force', checkout], { stdio: 'pipe' });
    await rm(temp, { recursive: true, force: true });
  }
});

test('the committed COM-01X decision resumes as a current PASS and rejects receipt tampering', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'production-run-check-com01x-'));
  const checkout = path.join(temp, 'checkout');
  execFileSync('git', ['-C', projectRoot, 'worktree', 'add', '--detach', checkout, 'HEAD'], { stdio: 'pipe' });
  try {
    const result = await verifyProductionRun(com01xRunId, { root: checkout });
    assert.equal(result.task_status, 'CURRENT_PASS');
    assert.equal(result.run_status, 'ACTIVE');
    assert.equal(result.task_id, 'NQA-COM01X-001');
    assert.equal(result.qa_codes.length, 5);

    const output = path.join(checkout, `generated/session-cache/${com01xRunId}/resume.json`);
    assert.equal((await writeProductionRunCheck(com01xRunId, { root: checkout })).report.task_status, 'CURRENT_PASS');
    assert.equal(JSON.parse(await readFile(output, 'utf8')).task_status, 'CURRENT_PASS');

    const receipt = path.join(checkout,
      `content/production/runs/${com01xRunId}/NQA-COM01X-001.decision.json`);
    const original = await readFile(receipt);
    const changed = JSON.parse(original);
    changed.qa_codes[0].result = 'FAIL';
    await writeFile(receipt, `${JSON.stringify(changed, null, 2)}\n`);
    await assert.rejects(writeProductionRunCheck(com01xRunId, { root: checkout }),
      /decision source differs from committed HEAD/);
    await assert.rejects(readFile(output), { code: 'ENOENT' });
  } finally {
    execFileSync('git', ['-C', projectRoot, 'worktree', 'remove', '--force', checkout], { stdio: 'pipe' });
    await rm(temp, { recursive: true, force: true });
  }
});

test('a new checkout rejects altered receipt and source bytes, clearing any prior resume report', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'production-run-check-'));
  const checkout = path.join(temp, 'checkout');
  execFileSync('git', ['-C', projectRoot, 'worktree', 'add', '--detach', checkout, 'HEAD'], { stdio: 'pipe' });
  try {
    const output = path.join(checkout, `generated/session-cache/${runId}/resume.json`);
    assert.equal((await writeProductionRunCheck(runId, { root: checkout })).report.task_status, 'CURRENT_PASS');
    assert.equal(JSON.parse(await readFile(output, 'utf8')).task_status, 'CURRENT_PASS');

    const receipt = path.join(checkout, `content/production/runs/${runId}/NQA-COM00-001.decision.json`);
    const originalReceipt = await readFile(receipt);
    const changed = JSON.parse(originalReceipt);
    changed.qa_codes[0].result = 'FAIL';
    await writeFile(receipt, `${JSON.stringify(changed, null, 2)}\n`);
    await assert.rejects(writeProductionRunCheck(runId, { root: checkout }), /decision source differs from committed HEAD/);
    await assert.rejects(readFile(output), { code: 'ENOENT' });
    await writeFile(receipt, originalReceipt);

    const scene = path.join(checkout, 'docs/narrative/scenes/vertical-slice/COM-00.md');
    await writeFile(scene, `${await readFile(scene, 'utf8')}\nchanged after QA\n`);
    await assert.rejects(writeProductionRunCheck(runId, { root: checkout }), /source differs from committed ref/);
    await assert.rejects(readFile(output), { code: 'ENOENT' });
  } finally {
    execFileSync('git', ['-C', projectRoot, 'worktree', 'remove', '--force', checkout], { stdio: 'pipe' });
    await rm(temp, { recursive: true, force: true });
  }
});

test('historical verification records the committed PASS from its exact detached source ref', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'production-run-history-'));
  const target = path.join(temp, 'target');
  const source = path.join(temp, 'source');
  const ledger = JSON.parse(await readFile(path.join(projectRoot,
    `content/production/runs/${runId}/ledger.json`), 'utf8'));
  execFileSync('git', ['-C', projectRoot, 'worktree', 'add', '--detach', target, 'HEAD'], { stdio: 'pipe' });
  execFileSync('git', ['-C', projectRoot, 'worktree', 'add', '--detach', source, ledger.source_ref], { stdio: 'pipe' });
  try {
    const historical = await verifyProductionRun(runId, { root: target, sourceRoot: source });
    assert.equal(historical.task_status, 'RECORDED_PASS');
    assert.equal(historical.packet_sha256, '7d04cc37570c82c0b64446775e8e4abe20b8ad71b2aec95d6f9f543890388730');
    await assert.rejects(verifyProductionRun(runId, { root: target, sourceRoot: target }), /separate from target root/);
    await assert.rejects(verifyProductionRun(runId, { root: target, sourceRoot: projectRoot }), /HEAD differs from ledger source_ref/);

    const scene = path.join(source, 'docs/narrative/scenes/vertical-slice/COM-00.md');
    const originalScene = await readFile(scene);
    await writeFile(scene, `${originalScene}\nchanged after QA\n`);
    await assert.rejects(verifyProductionRun(runId, { root: target, sourceRoot: source }), /source differs from committed ref/);
    await writeFile(scene, originalScene);
  } finally {
    execFileSync('git', ['-C', projectRoot, 'worktree', 'remove', '--force', source], { stdio: 'pipe' });
    execFileSync('git', ['-C', projectRoot, 'worktree', 'remove', '--force', target], { stdio: 'pipe' });
    await rm(temp, { recursive: true, force: true });
  }
});
