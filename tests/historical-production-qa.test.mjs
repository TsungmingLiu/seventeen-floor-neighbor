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
// Last checkpoint before the Opening dialogue rewrites invalidated these QA inputs.
const historicalRef = 'bfe5058a46ac9eab0d860b921fc8cf7a20f6abe2';
const suites = [
  'candidate-visual-run', 'context-candidate-visual', 'context-cg-plan-cli',
  'context-cg-plan', 'context-manifest-usability-cli', 'context-manifest-usability',
  'manifest-usability-impact', 'manifest-usability-run', 'production-impact',
  'production-review', 'production-run-check'
];

test('historical QA contracts run against their pinned pre-rewrite source', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'historical-production-qa-'));
  const checkout = path.join(temporary, 'repo');
  try {
    // Isolated clone keeps shared worktree metadata outside the fixture untouched.
    await run('git', ['clone', '--quiet', '--no-hardlinks', '--no-checkout', root, checkout]);
    await run('git', ['-C', checkout, 'checkout', '--quiet', '--detach', historicalRef]);
    const { stdout } = await run('git', ['-C', checkout, 'rev-parse', 'HEAD']);
    assert.equal(stdout.trim(), historicalRef);
    for (const name of suites) {
      await copyFile(path.join(root, 'tests', `${name}.historical.mjs`),
        path.join(checkout, 'tests', `${name}.test.mjs`));
    }
    // Exercise the current read-only review implementation against the old QA fixture.
    await copyFile(path.join(root, 'tools/production-review.mjs'),
      path.join(checkout, 'tools/production-review.mjs'));
    try {
      // A nested `node --test` inherits this marker from its parent test worker.
      // In that mode Node can exit 0 without executing or reporting the suites.
      const env = { ...process.env };
      delete env.NODE_TEST_CONTEXT;
      const { stdout } = await run(process.execPath,
        ['--test', '--test-reporter=tap',
          ...suites.map((name) => `tests/${name}.test.mjs`)],
        { cwd: checkout, env, maxBuffer: 4 * 1024 * 1024 });
      const count = stdout.match(/^# tests (\d+)$/m);
      assert.ok(count && Number(count[1]) >= suites.length,
        `Expected at least ${suites.length} historical tests to run:\n${stdout}`);
      assert.match(stdout, /^# fail 0$/m);
    } catch (error) {
      assert.fail(`Pinned historical QA failed at ${historicalRef} (${error.code ?? 'unknown code'}): ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`);
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
