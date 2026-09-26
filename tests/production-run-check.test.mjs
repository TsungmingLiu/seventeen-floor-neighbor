import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { projectRoot } from '../tools/content-lib.mjs';
import { verifyProductionRun, writeProductionRunCheck } from '../tools/verify-production-run.mjs';

const runId = 'issue16-com00-nqa-20260926';

test('the real COM-00 decision reconstructs as a current QA PASS without session cache', async () => {
  const result = await verifyProductionRun(runId);
  assert.equal(result.task_status, 'CURRENT_PASS');
  assert.equal(result.run_status, 'ACTIVE');
  assert.equal(result.packet_sha256, '7d04cc37570c82c0b64446775e8e4abe20b8ad71b2aec95d6f9f543890388730');
  assert.equal(result.qa_codes.length, 5);
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
