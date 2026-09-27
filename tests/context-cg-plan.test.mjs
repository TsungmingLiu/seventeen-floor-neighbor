import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { projectRoot } from '../tools/content-lib.mjs';
import { buildCgPlanPacket, verifyCgPlanPacket } from '../tools/context-packet.mjs';

const args = { sceneId: 'COM-00', runId: 'cg-plan-check', taskId: 'CGP-COM00-001',
  upstreamRunId: 'issue16-com00-nqa-20260926', upstreamTaskId: 'NQA-COM00-001',
  referenceIds: ['ref.xu_tang.face.01', 'ref.xu_tang.wardrobe.a', 'source.opening.ch1.bg.apt_17f_rain'] };

test('COM-00 CG plan is deterministic, strict-replay verifiable, and carries image provenance', async () => {
  const packet = await buildCgPlanPacket(args);
  assert.deepEqual(await buildCgPlanPacket(args), packet);
  assert.equal(await verifyCgPlanPacket(packet), true);
  assert.equal(packet.harness, 'cg_planner');
  assert.equal(packet.pass, null);
  assert.equal(packet.inputs.narrative_contract, 'content/production/narrative/opening-ch1/COM-00.json');
  assert.equal(packet.inputs.locked_scene, 'docs/narrative/scenes/vertical-slice/COM-00.md');
  assert.equal(packet.inputs.accepted_outputs[0].approved_locked_scene_git_blob,
    execFileSync('git', ['-C', projectRoot, 'rev-parse', 'HEAD:docs/narrative/scenes/vertical-slice/COM-00.md'], { encoding: 'utf8' }).trim());
  assert.equal(packet.reference_transport.mode, 'references_required');
  assert.equal(packet.human_gate, 'none');
  assert.deepEqual(packet.depends_on, []);
  assert.equal(packet.required_acquisition.images.length, 3);
  assert.ok(packet.required_acquisition.images.every((image) => image.pixels_must_be_visible && image.git_blob_sha));
  assert.deepEqual(packet.required_acquisition.images.map((image) => image.role),
    ['primary_face_identity', 'wardrobe', 'environment_background']);
  assert.ok(packet.allowed_sources.includes('assets-src/references/xu-tang/xt-ref-01-face.png'));
  assert.ok(packet.allowed_sources.some((source) => source.startsWith('docs/art/CHARACTER_REFERENCE_PACK_SPEC.md#L')));
  assert.ok(!packet.allowed_sources.some((source) => /WORKFLOW_MANIFEST|source-catalog|assets\/manifest|jiang-yucheng/i.test(source)));
  assert.ok(!packet.input_versions.some((item) => item.location === 'content/assets/source-catalog.json'));
  assert.ok(!packet.input_versions.some((item) => item.location === 'content/assets/manifest.json'));
  assert.ok(!packet.allowed_sources.includes('content/production/cg-manifests/opening-ch1.json'));
  const tampered = structuredClone(packet);
  tampered.required_acquisition.images[0].filename = 'other.png';
  await assert.rejects(verifyCgPlanPacket(tampered), /differ from canonical sources/);
});

test('planner blocks missing, duplicate, or unrelated character/environment references', async () => {
  for (const referenceIds of [
    ['ref.xu_tang.wardrobe.a', 'source.opening.ch1.bg.apt_17f_rain'],
    [...args.referenceIds, 'ref.xu_tang.face.01'],
    [...args.referenceIds, 'ref.jiang_yucheng.face.01'],
    ['ref.xu_tang.face.01', 'ref.xu_tang.wardrobe.a']
  ]) await assert.rejects(buildCgPlanPacket({ ...args, referenceIds }));
});

test('planner blocks a tampered current QA receipt/scene and invalid image bytes in a fresh checkout', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'context-cg-plan-'));
  const checkout = path.join(temp, 'checkout');
  execFileSync('git', ['-C', projectRoot, 'worktree', 'add', '--detach', checkout, 'HEAD'], { stdio: 'pipe' });
  try {
    const invoke = () => buildCgPlanPacket({ ...args, root: checkout });
    assert.equal((await invoke()).required_acquisition.images.length, 3);
    const receipt = path.join(checkout, `content/production/runs/${args.upstreamRunId}/${args.upstreamTaskId}.decision.json`);
    const originalReceipt = await readFile(receipt);
    await writeFile(receipt, `${originalReceipt}\n`);
    await assert.rejects(invoke(), /differs from committed HEAD/);
    await writeFile(receipt, originalReceipt);
    const scene = path.join(checkout, 'docs/narrative/scenes/vertical-slice/COM-00.md');
    const originalScene = await readFile(scene);
    await writeFile(scene, `${originalScene}\nstale\n`);
    await assert.rejects(invoke(), /source differs from committed ref/);
    await writeFile(scene, originalScene);
    const image = path.join(checkout, 'assets-src/references/xu-tang/xt-ref-01-face.png');
    const originalImage = await readFile(image);
    await writeFile(image, Buffer.from('not an image'));
    await assert.rejects(invoke(), /byte count mismatch|SHA-256 mismatch|MIME does not match|failed full image decode/);
    await writeFile(image, originalImage);
    const catalogPath = path.join(checkout, 'content/assets/source-catalog.json');
    const originalCatalog = await readFile(catalogPath, 'utf8');
    const changedCatalog = JSON.parse(originalCatalog);
    changedCatalog.files['ref.xu_tang.face.01'].role = 'wardrobe';
    await writeFile(catalogPath, `${JSON.stringify(changedCatalog, null, 2)}\n`);
    await assert.rejects(invoke(), /differs from committed ref/);
    await writeFile(catalogPath, originalCatalog);
  } finally {
    execFileSync('git', ['-C', projectRoot, 'worktree', 'remove', '--force', checkout], { stdio: 'pipe' });
    await rm(temp, { recursive: true, force: true });
  }
});

test('selected record versions survive unrelated committed catalog edits but reject a committed role mismatch', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'context-cg-record-'));
  const checkout = path.join(temp, 'checkout');
  execFileSync('git', ['-C', projectRoot, 'worktree', 'add', '--detach', checkout, 'HEAD'], { stdio: 'pipe' });
  const commit = (message) => {
    execFileSync('git', ['-C', checkout, 'add', 'content/assets/source-catalog.json'], { stdio: 'pipe' });
    execFileSync('git', ['-C', checkout, '-c', 'user.name=Packet Test',
      '-c', 'user.email=packet-test@example.invalid', 'commit', '-qm', message], { stdio: 'pipe' });
  };
  try {
    const original = await buildCgPlanPacket({ ...args, root: checkout });
    const catalogPath = path.join(checkout, 'content/assets/source-catalog.json');
    const changed = JSON.parse(await readFile(catalogPath, 'utf8'));
    changed.note += ' Unrelated metadata checkpoint.';
    await writeFile(catalogPath, `${JSON.stringify(changed, null, 2)}\n`);
    commit('Update unrelated catalog note');
    const afterUnrelated = await buildCgPlanPacket({ ...args, root: checkout });
    assert.notEqual(afterUnrelated.source_binding.github.ref, original.source_binding.github.ref);
    assert.deepEqual(afterUnrelated.input_versions.filter(({ id }) => id.startsWith('catalog-record:')),
      original.input_versions.filter(({ id }) => id.startsWith('catalog-record:')));
    changed.files['ref.xu_tang.face.01'].role = 'wardrobe';
    await writeFile(catalogPath, `${JSON.stringify(changed, null, 2)}\n`);
    commit('Inject reference role mismatch');
    await assert.rejects(buildCgPlanPacket({ ...args, root: checkout }), /reference role, character, or status mismatch/);
  } finally {
    execFileSync('git', ['-C', projectRoot, 'worktree', 'remove', '--force', checkout], { stdio: 'pipe' });
    await rm(temp, { recursive: true, force: true });
  }
});
