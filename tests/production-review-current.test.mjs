import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rewrittenRef = 'a4940e0112cf32a61263564f41b3e576ed697084';

test('live review does not promote an old QA decision after scene inputs change', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'production-review-current-'));
  const checkout = path.join(temporary, 'repo');
  let added = false;
  try {
    await run('git', ['-C', root, 'worktree', 'add', '--detach', checkout, rewrittenRef]);
    added = true;
    await copyFile(path.join(root, 'tools/production-review.mjs'),
      path.join(checkout, 'tools/production-review.mjs'));
    const { stdout } = await run(process.execPath,
      ['--input-type=module', '-e',
        "import { buildProductionReviewModel } from './tools/production-review.mjs'; " +
        "const m = await buildProductionReviewModel('COM-00'); " +
        "console.log(JSON.stringify({ qa: m.production.narrativeQa, visual: m.production.visualQa, " +
        "status: m.production.staleStatus, evidence: m.provenance.narrativeQa }));"],
      { cwd: checkout });
    const result = JSON.parse(stdout);
    assert.equal(result.qa, 'REVIEW_REQUIRED');
    assert.equal(result.visual, 'UNRECORDED');
    assert.equal(result.status, 'NARRATIVE_QA_REVIEW_REQUIRED');
    assert.deepEqual(result.evidence, { status: 'REVIEW_REQUIRED' });
  } finally {
    if (added) await run('git', ['-C', root, 'worktree', 'remove', '--force', checkout]);
    await rm(temporary, { recursive: true, force: true });
  }
});
