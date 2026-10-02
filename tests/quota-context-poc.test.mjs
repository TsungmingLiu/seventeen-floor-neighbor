import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { compileReviewContext, writeReviewContext } from '../tools/compile-review-context.mjs';
import { checkSessionCache } from '../tools/check-session-cache.mjs';
import { buildNarrativeReviewPacket } from '../tools/context-packet.mjs';

const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
const scene = 'docs/narrative/scenes/vertical-slice/COM-02X.md';

async function fixture() {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'quota-context-')));
  const packet = await buildNarrativeReviewPacket({ sceneId: 'COM-02X', runId: 'fixture', taskId: 'fixture' });
  const files = new Set([...packet.required_acquisition.markdown.map((item) => item.path),
    'AGENTS.md', '.ai/WORKFLOW_MANIFEST.yaml', '.ai/harnesses/bootstrap.md', '.ai/policies/SOURCE_AUTHORITY.md',
    '.ai/policies/CONTEXT_ISOLATION.md', 'docs/CONTENT_PRODUCTION_SOURCE_MAP.md', '.ai/harnesses/content-qa.md',
    '.ai/schemas/HANDOFF.md', 'tools/context-packet.mjs', '.gitignore']);
  for (const file of files) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await writeFile(path.join(root, file), await readFile(file));
  }
  git(root, 'init', '-q');
  git(root, 'config', 'user.name', 'POC Test');
  git(root, 'config', 'user.email', 'poc@example.invalid');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'canonical fixture');
  return root;
}

test('COM-02X inline inputs rebuild byte-identically after emptying cache and an unrelated commit', async () => {
  const root = await fixture();
  try {
    const base = git(root, 'rev-parse', 'HEAD');
    await writeFile(path.join(root, scene), `${await readFile(scene, 'utf8')}\n<!-- test-only change -->\n`);
    const macro = 'docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md';
    await writeFile(path.join(root, macro), `${await readFile(macro, 'utf8')}\nUNRELATED_CANON_DIFF_SENTINEL\n`);
    git(root, 'add', scene, macro);
    git(root, 'commit', '-qm', 'isolated changed scene fixture');
    const ref = git(root, 'rev-parse', 'HEAD');
    const first = await compileReviewContext({ root, base, ref });
    assert.ok(first.metrics.diff.full_source_changed_hunks.some((hunk) => hunk.path === scene));
    assert.ok(first.metrics.shared_instructions.some((source) => source.path === '.ai/harnesses/content-qa.md')); // Full harness stays mandatory.
    for (const source of first.metrics.sources) {
      assert.ok(first.worker.includes(source.git_blob_sha));
      assert.ok(source.selected_bytes <= source.full_bytes);
    }
    assert.ok(!first.worker.includes('### COM-02J ')); // No unrelated macro scene leaks through excerpts/diff.
    assert.ok(!first.worker.includes('UNRELATED_CANON_DIFF_SENTINEL'));
    assert.ok(first.metrics.diff.changed_allowed_sources.includes(macro)); // Named without leaking out-of-scope diff prose.
    const destination = await writeReviewContext(first, { root });
    assert.equal(await checkSessionCache(root), true);
    assert.equal(git(root, 'status', '--porcelain'), '');
    const original = await readFile(path.join(root, destination, 'worker-input.md'));
    await rm(path.join(root, 'generated'), { recursive: true });
    await writeFile(path.join(root, 'unrelated.txt'), 'checkpoint\n');
    git(root, 'add', 'unrelated.txt');
    git(root, 'commit', '-qm', 'unrelated checkpoint');
    const second = await compileReviewContext({ root, base, ref });
    assert.deepEqual(second, first);
    await writeReviewContext(second, { root });
    assert.deepEqual(await readFile(path.join(root, destination, 'worker-input.md')), original);
    await assert.rejects(writeReviewContext(second, { root }), /EEXIST/);
    await writeFile(path.join(root, scene), 'dirty source');
    await assert.rejects(compileReviewContext({ root, base, ref }), /differs from committed ref/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('scratch guard catches force-added data and removal of the explicit ignore rule', async () => {
  const root = await fixture();
  try {
    const scratch = 'generated/session-cache/forced.packet.json';
    await mkdir(path.dirname(path.join(root, scratch)), { recursive: true });
    await writeFile(path.join(root, scratch), '{}');
    git(root, 'add', '-f', scratch);
    await assert.rejects(checkSessionCache(root), /staged\/tracked/);
    git(root, 'commit', '-qm', 'force-added scratch fixture');
    await assert.rejects(checkSessionCache(root), /staged\/tracked/); // Same failure in a clean CI checkout.
    git(root, 'rm', '--cached', scratch);
    assert.equal(await checkSessionCache(root), true);
    await writeFile(path.join(root, '.gitignore'), '');
    await assert.rejects(checkSessionCache(root), /explicitly ignore/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('scratch writes cannot redirect through a directory or output symlink', async () => {
  const root = await fixture();
  try {
    const ref = git(root, 'rev-parse', 'HEAD');
    const result = await compileReviewContext({ root, base: ref, ref });
    await mkdir(path.join(root, 'generated'));
    await symlink(path.join(root, 'docs'), path.join(root, 'generated/session-cache'));
    await assert.rejects(writeReviewContext(result, { root }), /symlink|symbolic link/);
    await rm(path.join(root, 'generated/session-cache'));
    const directory = path.join(root, 'generated/session-cache/quota-poc/COM-02X');
    await mkdir(directory, { recursive: true });
    const before = await readFile(path.join(root, scene));
    await symlink(path.join(root, scene), path.join(directory, 'task.packet.json'));
    await assert.rejects(writeReviewContext(result, { root }), /EEXIST/);
    assert.deepEqual(await readFile(path.join(root, scene)), before);
  } finally { await rm(root, { recursive: true, force: true }); }
});
