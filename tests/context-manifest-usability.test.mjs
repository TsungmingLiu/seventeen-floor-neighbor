import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildManifestUsabilityPacket, verifyManifestUsabilityPacket } from '../tools/context-packet.mjs';

const entryIds = ['COM00-S02-DOOR-ASSIST', 'COM00-S04-BASE-NEUTRAL', 'COM00-S04-R01-POLITE-SMILE'];
const args = { sceneId: 'COM-00', runId: 'mua-test', taskId: 'MUA-COM00-001',
  upstreamRunId: 'issue16-com00-nqa-20260926', upstreamTaskId: 'NQA-COM00-001', entryIds };
const clone = (value) => JSON.parse(JSON.stringify(value));

test('COM-00 manifest usability packet is deterministic, narrow, and independently verifiable', async () => {
  const packet = await buildManifestUsabilityPacket(args);
  assert.deepEqual(await buildManifestUsabilityPacket(args), packet);
  assert.equal(await verifyManifestUsabilityPacket(packet), true);
  assert.equal(packet.task_type, 'visual_review');
  assert.equal(packet.review_scope, 'manifest_usability');
  assert.deepEqual(packet.depends_on, []);
  assert.deepEqual(packet.required_acquisition.images, []);
  assert.equal(packet.reference_transport.mode, 'not_applicable');
  assert.deepEqual(packet.inputs.cg_entry_ids, [...entryIds].sort());
  assert.equal(packet.inputs.cg_manifest, 'content/production/cg-manifests/opening-ch1.json');
  const manifest = packet.required_acquisition.markdown.find((item) => item.path.endsWith('/opening-ch1.json'));
  assert.ok(manifest);
  assert.ok(manifest.excerpts.every((item) => item.sha256 && item.start_line > 0 && item.end_line >= item.start_line));
  assert.equal(packet.allowed_sources.includes(manifest.path), false);
  assert.equal(packet.input_versions.some((item) => item.location === manifest.path), false);
  for (const id of entryIds) assert.ok(packet.input_versions.some((item) => item.id === `manifest-entry:${id}`));
  assert.ok(packet.allowed_sources.some((item) => item.includes('CHARACTER_REFERENCE_PACK_SPEC.md#')));
  assert.equal(packet.allowed_sources.some((item) => /COM-01|COM-02|opening-ch1\.json$/.test(item)), false);
});

test('manifest usability verification rejects altered entry IDs, QA, bindings, and source versions', async () => {
  const packet = await buildManifestUsabilityPacket(args);
  const wrongIds = clone(packet);
  wrongIds.inputs.cg_entry_ids[0] = 'COM00-S04-UNRELATED';
  await assert.rejects(verifyManifestUsabilityPacket(wrongIds));

  const fakeQa = clone(packet);
  fakeQa.inputs.accepted_outputs[0].status = 'PASS';
  await assert.rejects(verifyManifestUsabilityPacket(fakeQa));

  const badAcceptedBase = clone(packet);
  badAcceptedBase.inputs.cg_entry_ids = ['COM00-S02-DOOR-ASSIST', 'COM00-S04-BASE-NEUTRAL', 'OTHER'];
  await assert.rejects(verifyManifestUsabilityPacket(badAcceptedBase));

  const alteredVersion = clone(packet);
  alteredVersion.input_versions.find((item) => item.id === 'manifest-entry:COM00-S04-BASE-NEUTRAL').version = '0'.repeat(64);
  await assert.rejects(verifyManifestUsabilityPacket(alteredVersion));
});

test('builder requires the exact duplicate-free COM-00 entry set', async () => {
  await assert.rejects(buildManifestUsabilityPacket({ ...args, entryIds: [...entryIds, entryIds[0]] }));
  await assert.rejects(buildManifestUsabilityPacket({ ...args, entryIds: entryIds.slice(0, 2) }));
  await assert.rejects(buildManifestUsabilityPacket({ ...args, entryIds: undefined }));
});

test('source-side accepted-base mapping faults block in an isolated committed worktree', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'manifest-usability-worktree-'));
  const worktree = path.join(root, 'checkout');
  const git = (...args) => execFileSync('git', ['-C', process.cwd(), ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
  try {
    git('worktree', 'add', '--detach', worktree, git('rev-parse', 'HEAD'));
    const catalogPath = path.join(worktree, 'content/assets/source-catalog.json');
    const originalCatalog = await readFile(catalogPath, 'utf8');
    const catalog = JSON.parse(originalCatalog);
    catalog.files['source.opening.ch1.cg.com00_s04_base_neutral'].logicalAssetId = 'cg.invalid.accepted_base';
    await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
    execFileSync('git', ['-C', worktree, 'add', 'content/assets/source-catalog.json'], { stdio: 'pipe' });
    execFileSync('git', ['-C', worktree, 'commit', '-m', 'test invalid accepted-base asset binding'], { stdio: 'pipe' });
    await assert.rejects(buildManifestUsabilityPacket({ ...args, root: worktree }), /accepted (?:base|output) asset\/source binding is invalid/);
    await writeFile(catalogPath, originalCatalog);
    execFileSync('git', ['-C', worktree, 'add', 'content/assets/source-catalog.json'], { stdio: 'pipe' });
    execFileSync('git', ['-C', worktree, 'commit', '-m', 'restore catalog'], { stdio: 'pipe' });
    const manifestPath = path.join(worktree, 'content/production/cg-manifests/opening-ch1.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    manifest.entries.find((entry) => entry.entry_id === entryIds[0]).characters[0].character_id = 'jiang_yucheng';
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    execFileSync('git', ['-C', worktree, 'add', 'content/production/cg-manifests/opening-ch1.json'], { stdio: 'pipe' });
    execFileSync('git', ['-C', worktree, 'commit', '-m', 'inject unrelated character into COM-00'], { stdio: 'pipe' });
    await assert.rejects(buildManifestUsabilityPacket({ ...args, root: worktree }), /unrelated character/);
  } finally {
    try { execFileSync('git', ['-C', process.cwd(), 'worktree', 'remove', '--force', worktree], { stdio: 'pipe' }); } catch {}
    await rm(root, { recursive: true, force: true });
  }
});
