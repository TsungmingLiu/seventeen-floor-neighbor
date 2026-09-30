import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('live review does not promote an old QA decision after scene inputs change', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'production-review-current-'));
  const checkout = path.join(temporary, 'repo');
  let added = false;
  try {
    await run('git', ['-C', root, 'worktree', 'add', '--detach', checkout, 'HEAD']);
    added = true;
    await copyFile(path.join(root, 'tools/production-review.mjs'),
      path.join(checkout, 'tools/production-review.mjs'));
    const command = ['--input-type=module', '-e',
      "import { buildProductionReviewModel } from './tools/production-review.mjs'; " +
      "const m = await buildProductionReviewModel('COM-00'); " +
      "console.log(JSON.stringify({ qa: m.production.narrativeQa, visual: m.production.visualQa, " +
      "status: m.production.staleStatus, evidence: m.provenance.narrativeQa }));"];
    const { stdout } = await run(process.execPath, command, { cwd: checkout });
    const result = JSON.parse(stdout);
    assert.equal(result.qa, 'REVIEW_REQUIRED');
    assert.equal(result.visual, 'UNRECORDED');
    assert.equal(result.status, 'NARRATIVE_QA_REVIEW_REQUIRED');
    assert.deepEqual(result.evidence, { status: 'REVIEW_REQUIRED' });
    const receipt = path.join(checkout,
      'content/production/runs/issue16-com00-nqa-20260926/NQA-COM00-001.decision.json');
    const original = await readFile(receipt, 'utf8');
    assert.match(original, /NQA-FUNCTION-01/);
    await writeFile(receipt, original.replace('NQA-FUNCTION-01', 'NQA-FUNCTION-99'));
    await assert.rejects(run(process.execPath, command, { cwd: checkout }),
      (error) => error.stderr?.includes('decision source differs from committed HEAD'));
  } finally {
    if (added) await run('git', ['-C', root, 'worktree', 'remove', '--force', checkout]);
    await rm(temporary, { recursive: true, force: true });
  }
});
