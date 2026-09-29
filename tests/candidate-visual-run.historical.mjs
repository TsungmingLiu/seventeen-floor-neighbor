import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { projectRoot } from '../tools/content-lib.mjs';
import { verifyProductionRun, writeProductionRunCheck } from '../tools/verify-production-run.mjs';

const runId = 'issue16-com00-vqa-recovery-20260927';
const taskId = 'VQA-COM00-S04-BASE-002';
const receiptPath = `content/production/runs/${runId}/${taskId}.decision.json`;

async function withCheckout(run) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'candidate-visual-run-'));
  const checkout = path.join(temporary, 'checkout');
  execFileSync('git', ['-C', projectRoot, 'worktree', 'add', '--detach', checkout, 'HEAD'], { stdio: 'pipe' });
  try { await run(checkout); }
  finally {
    execFileSync('git', ['-C', projectRoot, 'worktree', 'remove', '--force', checkout], { stdio: 'pipe' });
    await rm(temporary, { recursive: true, force: true });
  }
}

test('fresh checkout reconstructs the independent candidate FAIL without session cache or false acceptance', async () => {
  await withCheckout(async (checkout) => {
    const result = await verifyProductionRun(runId, { root: checkout });
    assert.equal(result.task_status, 'CURRENT_FAIL');
    assert.equal(result.run_status, 'BLOCKED');
    assert.equal(result.packet_sha256, 'd098110fe85ac64ca6bf96160b23c85a7a78cfcb4db67014e4cea177d9b37abb');
    assert.ok(result.qa_codes.includes('VQA-DIALOGUE-SAFE-ZONE'));
    assert.match(result.next_action, /no automatic redraw/);
    assert.equal((await writeProductionRunCheck(runId, { root: checkout })).report.task_status, 'CURRENT_FAIL');
  });
});

test('tampered decision or changed candidate bytes blocks resume and removes prior report', async () => {
  await withCheckout(async (checkout) => {
    const output = path.join(checkout, `generated/session-cache/${runId}/resume.json`);
    await writeProductionRunCheck(runId, { root: checkout });
    const receipt = path.join(checkout, receiptPath);
    const original = await readFile(receipt);
    const changed = JSON.parse(original);
    changed.qa_codes.find((item) => item.result === 'FAIL').result = 'PASS';
    await writeFile(receipt, `${JSON.stringify(changed, null, 2)}\n`);
    await assert.rejects(writeProductionRunCheck(runId, { root: checkout }), /decision source differs from committed HEAD/);
    await assert.rejects(readFile(output), { code: 'ENOENT' });
    await writeFile(receipt, original);

    const candidate = path.join(checkout, 'assets-src/opening-ch1-demo/cg-com00-s04-base-neutral-v1.webp');
    const bytes = await readFile(candidate);
    bytes[bytes.length - 1] ^= 1;
    await writeFile(candidate, bytes);
    await assert.rejects(writeProductionRunCheck(runId, { root: checkout }),
      /SHA-256 mismatch|source differs from committed|image bytes differ/);
    await assert.rejects(readFile(output), { code: 'ENOENT' });
  });
});

test('unrelated committed manifest entry does not erase the selected candidate FAIL', async () => {
  await withCheckout(async (checkout) => {
    const relative = 'content/production/cg-manifests/opening-ch1.json';
    const manifest = JSON.parse(await readFile(path.join(checkout, relative), 'utf8'));
    manifest.entries.find((entry) => entry.scene_id === 'COM-01X').narrative.purpose += ' unrelated';
    await writeFile(path.join(checkout, relative), `${JSON.stringify(manifest, null, 2)}\n`);
    execFileSync('git', ['-C', checkout, 'add', relative], { stdio: 'pipe' });
    execFileSync('git', ['-C', checkout, '-c', 'user.name=Packet Test', '-c', 'user.email=packet-test@example.invalid',
      'commit', '-qm', 'test unrelated manifest entry edit'], { stdio: 'pipe' });
    const result = await verifyProductionRun(runId, { root: checkout });
    assert.equal(result.task_status, 'CURRENT_FAIL');
  });
});
