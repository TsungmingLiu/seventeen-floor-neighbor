import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildCandidateVisualReviewPacket, verifyCandidateVisualReviewPacket } from '../tools/context-packet.mjs';
import { projectRoot } from '../tools/content-lib.mjs';

const args = { sceneId: 'COM-00', runId: 'candidate-visual-test', taskId: 'VQA-COM00-S04-BASE-001',
  upstreamRunId: 'issue16-com00-mua-20260927', upstreamTaskId: 'MUA-COM00-001',
  entryId: 'COM00-S04-BASE-NEUTRAL', candidateSourceId: 'source.opening.ch1.cg.com00_s04_base_neutral' };

test('one candidate packet binds the existing WebP, real Xu Tang references and selected render spec', async () => {
  const packet = await buildCandidateVisualReviewPacket(args);
  assert.equal(packet.review_scope, 'candidate');
  assert.equal(packet.human_gate, 'accepted_master_image_selection');
  assert.deepEqual(packet.depends_on, []);
  assert.deepEqual(packet.required_acquisition.images.map(({ role }) => role),
    ['candidate', 'primary_face_identity', 'wardrobe', 'environment']);
  assert.equal(packet.required_acquisition.images[0].sha256,
    '7f18dccd8483498adc196c144cc6edafeff6bdd0f6db573bee288b32152862ea');
  for (const image of packet.required_acquisition.images) {
    assert.equal(image.pixels_must_be_visible, true);
    assert.equal(image.git_blob_sha, execFileSync('git', ['rev-parse', `HEAD:${image.path}`],
      { cwd: projectRoot, encoding: 'utf8' }).trim());
    assert.ok(packet.allowed_sources.includes(image.path));
  }
  assert.equal(packet.required_acquisition.markdown.find((item) => item.path.endsWith('/opening-ch1.json'))
    .excerpts.length, 2);
  assert.equal(packet.input_versions.filter((item) => item.id.startsWith('manifest-entry:')).length, 1);
  assert.equal(packet.inputs.accepted_outputs[0].status, 'CURRENT_PASS');
  assert.equal(await verifyCandidateVisualReviewPacket(packet), true);

  const forged = structuredClone(packet);
  forged.required_acquisition.images[1].role = 'unrelated_character';
  await assert.rejects(verifyCandidateVisualReviewPacket(forged), /differ from canonical sources/);
  await assert.rejects(buildCandidateVisualReviewPacket({ ...args, candidateSourceId: 'ref.xu_tang.face.01' }),
    /candidate source ID/);
});

test('candidate packet blocks an uncommitted changed binary and unrelated scene or entry', async () => {
  await assert.rejects(buildCandidateVisualReviewPacket({ ...args, sceneId: 'COM-01X' }), /COM-00 only/);
  await assert.rejects(buildCandidateVisualReviewPacket({ ...args, entryId: 'COM00-S04-R01-POLITE-SMILE' }),
    /bounded to COM00-S04-BASE-NEUTRAL/);
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'candidate-visual-corrupt-'));
  const checkout = path.join(temporary, 'checkout');
  try {
    execFileSync('git', ['-C', projectRoot, 'worktree', 'add', '--detach', checkout, 'HEAD'], { stdio: 'pipe' });
    const source = path.join(checkout, 'assets-src/opening-ch1-demo/cg-com00-s04-base-neutral-v1.webp');
    const bytes = await readFile(source);
    bytes[bytes.length - 1] ^= 1;
    await writeFile(source, bytes);
    await assert.rejects(buildCandidateVisualReviewPacket({ ...args, root: checkout }),
      /SHA-256 mismatch|source differs from committed|image bytes differ/);
  } finally {
    try { execFileSync('git', ['-C', projectRoot, 'worktree', 'remove', '--force', checkout], { stdio: 'pipe' }); } catch {}
    await rm(temporary, { recursive: true, force: true });
  }
});

test('candidate CLI creates only a session packet, verifies it and rejects a conflicting cache copy', async () => {
  const runId = `candidate-visual-cli-${process.pid}-${Date.now()}`;
  const destination = path.join(projectRoot, 'generated/session-cache', runId, `${args.taskId}.packet.json`);
  const cli = (...parts) => spawnSync(process.execPath, ['tools/context.mjs', ...parts],
    { cwd: projectRoot, encoding: 'utf8', timeout: 180_000 });
  const cliArgs = ['--task', 'visual_review', '--review-scope', 'candidate', '--scene', args.sceneId,
    '--run-id', runId, '--task-id', args.taskId, '--upstream-run-id', args.upstreamRunId,
    '--upstream-task-id', args.upstreamTaskId, '--entry-id', args.entryId,
    '--candidate-source-id', args.candidateSourceId];
  try {
    const generated = cli(...cliArgs);
    assert.equal(generated.status, 0, generated.stderr);
    assert.match(generated.stdout, /SHA-256 [0-9a-f]{64}/);
    assert.equal(cli('--verify-packet', destination).status, 0);
    const forged = JSON.parse(await readFile(destination, 'utf8'));
    forged.required_acquisition.images[0].sha256 = '0'.repeat(64);
    await writeFile(destination, `${JSON.stringify(forged, null, 2)}\n`);
    const conflict = cli(...cliArgs);
    assert.equal(conflict.status, 1);
    assert.match(conflict.stderr, /Task Packet destination conflict/);
  } finally {
    await rm(path.join(projectRoot, 'generated/session-cache', runId), { recursive: true, force: true });
  }
});
