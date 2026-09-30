import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { projectRoot } from '../tools/content-lib.mjs';
import { verifyProductionRun, writeProductionRunCheck } from '../tools/verify-production-run.mjs';

const runId = 'issue16-com00-mua-20260927';
const receiptPath = `content/production/runs/${runId}/MUA-COM00-001.decision.json`;

async function withCheckout(run) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'manifest-usability-run-'));
  const checkout = path.join(temporary, 'checkout');
  execFileSync('git', ['-C', projectRoot, 'worktree', 'add', '--detach', checkout, 'HEAD'], { stdio: 'pipe' });
  try { await run(checkout); }
  finally {
    execFileSync('git', ['-C', projectRoot, 'worktree', 'remove', '--force', checkout], { stdio: 'pipe' });
    await rm(temporary, { recursive: true, force: true });
  }
}

test('the real COM-00 manifest review reconstructs from its source ref without session cache', async () => {
  const result = await verifyProductionRun(runId);
  assert.equal(result.task_status, 'CURRENT_PASS');
  assert.equal(result.packet_sha256, '8d3b6107eb705590c3f2adff22b9ca7ea644f12d305b6c9f337defa85171563f');
  assert.equal(result.qa_codes.length, 7);
  assert.equal(result.run_status, 'ACTIVE');
});

test('manifest review rejects a tampered receipt and a changed selected source, removing prior resume output', async () => {
  await withCheckout(async (checkout) => {
    const output = path.join(checkout, `generated/session-cache/${runId}/resume.json`);
    assert.equal((await writeProductionRunCheck(runId, { root: checkout })).report.task_status, 'CURRENT_PASS');
    const receipt = path.join(checkout, receiptPath);
    const originalReceipt = await readFile(receipt);
    const changedReceipt = JSON.parse(originalReceipt);
    changedReceipt.qa_codes[0].result = 'FAIL';
    await writeFile(receipt, `${JSON.stringify(changedReceipt, null, 2)}\n`);
    await assert.rejects(writeProductionRunCheck(runId, { root: checkout }), /decision source differs from committed HEAD/);
    await assert.rejects(readFile(output), { code: 'ENOENT' });
    await writeFile(receipt, originalReceipt);

    const manifestPath = path.join(checkout, 'content/production/cg-manifests/opening-ch1.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    manifest.entries.find((entry) => entry.entry_id === 'COM00-S04-BASE-NEUTRAL').narrative.purpose += ' altered';
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await assert.rejects(writeProductionRunCheck(runId, { root: checkout }), /source differs from committed ref/);
    await assert.rejects(readFile(output), { code: 'ENOENT' });
  });
});

test('an unrelated committed manifest entry edit preserves the COM-00 decision', async () => {
  await withCheckout(async (checkout) => {
    const manifestPath = path.join(checkout, 'content/production/cg-manifests/opening-ch1.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    manifest.entries.find((entry) => entry.scene_id === 'COM-01X').narrative.purpose += ' unrelated';
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    execFileSync('git', ['-C', checkout, 'add', 'content/production/cg-manifests/opening-ch1.json'], { stdio: 'pipe' });
    execFileSync('git', ['-C', checkout, '-c', 'user.name=Packet Test', '-c', 'user.email=packet-test@example.invalid',
      'commit', '-qm', 'test unrelated manifest entry edit'], { stdio: 'pipe' });
    const current = await verifyProductionRun(runId, { root: checkout });
    assert.equal(current.task_status, 'CURRENT_PASS');
    const source = path.join(path.dirname(checkout), 'source');
    const ledger = JSON.parse(await readFile(path.join(checkout, `content/production/runs/${runId}/ledger.json`)));
    execFileSync('git', ['-C', checkout, 'worktree', 'add', '--detach', source, ledger.source_ref], { stdio: 'pipe' });
    try {
      assert.equal((await verifyProductionRun(runId, { root: checkout, sourceRoot: source })).task_status, 'RECORDED_PASS');
      assert.equal((await verifyProductionRun(runId, { root: checkout, sourceRoot: source,
        requireCurrent: true })).task_status, 'CURRENT_PASS');
    } finally {
      execFileSync('git', ['-C', checkout, 'worktree', 'remove', '--force', source], { stdio: 'pipe' });
    }
  });
});
