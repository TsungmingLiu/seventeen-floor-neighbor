import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { crc32 } from 'node:zlib';
import { candidateFixture, fixture } from './production-preflight.test.mjs';
import { sourceIdentities, verifyTaskPacket } from '../tools/production-preflight.mjs';
import { generateHandoff, verifyHandoff } from '../tools/production-handoff.mjs';
import { isImage, writeCache } from '../tools/production-task-io.mjs';
import { validateRepoSourceCatalog } from '../tools/render-cg-packets.mjs';
import { readerFor, snapshotScene, compareSceneSnapshots } from '../tools/production-impact.mjs';

// Insert an inert PNG text chunk before IEND; image pixels and geometry stay identical.
const replacement = (bytes) => {
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return bytes;
  const payload = Buffer.from('fixture\0locator replacement'), chunk = Buffer.alloc(payload.length + 12);
  chunk.writeUInt32BE(payload.length); chunk.write('tEXt', 4); payload.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.subarray(4, -4)), chunk.length - 4);
  const end = bytes.indexOf(Buffer.from('IEND')) - 4;
  return Buffer.concat([bytes.subarray(0, end), chunk, bytes.subarray(end)]);
};
test('committed images acquire by path/ref with missing or stale digest and expected bytes', async () => {
  const f = await fixture();
  try {
    const image = { path: 'assets-src/reference.png', ref: f.packet.source_binding.github.ref, source_id: 'source.fixture.reference',
      role: 'environment', filename: 'reference.png', mime_type: 'image/png', width: 1, height: 1, pixels_must_be_visible: true };
    f.packet.required_acquisition.images.push(image); f.packet.allowed_sources.push(image.path);
    f.packet.input_versions.push({ id: 'image', location: image.path, version: `${image.ref}:${image.path}` });
    f.packet.preflight_requirements.reference_catalog = { path: 'catalog.json', version: (await f.acquire('catalog.json')).git_blob_sha };
    await writeFile(path.join(f.root, image.path), replacement(await readFile(path.join(f.root, image.path))));
    for (const legacy of [{}, { sha256: 'invalid legacy digest', git_blob_sha: 'stale', bytes: -1 }]) {
      Object.assign(image, legacy);
      const binding = await verifyTaskPacket(f.packet, { root: f.root });
      const acquired = binding.sources.find((item) => item.path === image.path);
      assert.equal(acquired.ref, image.ref); assert.equal(acquired.sha256, undefined); assert.equal(acquired.git_blob_sha, undefined);
    }
    const wrongRef = structuredClone(f.packet); wrongRef.input_versions.at(-1).version = `other-ref:${image.path}`;
    await assert.rejects(verifyTaskPacket(wrongRef, { root: f.root }), /image locator mismatch/);
    for (const bad of [{ filename: 'wrong.png' }, { mime_type: 'image/jpeg' }, { path: '../bad.png' }]) {
      const p = structuredClone(f.packet); Object.assign(p.required_acquisition.images[0], bad);
      await assert.rejects(verifyTaskPacket(p, { root: f.root }));
    }
    const goodImage = await readFile(path.join(f.root, image.path));
    await writeFile(path.join(f.root, 'input.json'), '{"tampered":true}');
    await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /source differs from ref/);
    await writeFile(path.join(f.root, 'input.json'), f.git('show', `${image.ref}:input.json`));
    await writeFile(path.join(f.root, image.path), 'invalid image');
    await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }));
    await writeFile(path.join(f.root, 'input.json'), '{"tampered":true}');
    await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }));
  } finally { await f.cleanup(); }
});

test('transient image inputs and image Handoff outputs survive valid replacement without hashes', async () => {
  const f = await candidateFixture();
  try {
    delete f.image.sha256; f.image.bytes = 1;
    f.packet.input_versions.find((item) => item.id === 'candidate').version = 'invalid legacy image digest';
    await writeFile(path.join(f.root, f.packetPath), JSON.stringify(f.packet));
    await writeFile(path.join(f.root, f.image.path), replacement(await readFile(path.join(f.root, f.image.path))));
    const options = { root: f.root, packetPath: f.packetPath, bindingPath: 'generated/session-cache/run/image-binding.json',
      facts: { status: 'NEEDS_REVIEW', inputs_used: ['candidate'], outputs: [{ id: 'image-output', location: f.image.path, ref: 'WORKTREE' }], qa: { checks: [] } } };
    const { handoff, inputBinding } = await generateHandoff(options); await writeCache(f.root, options.bindingPath, inputBinding);
    assert.equal(handoff.inputs_used[0].version, `WORKTREE:${f.image.path}`);
    assert.equal(handoff.output_versions[0].version, `WORKTREE:${f.image.path}`);
    assert.equal(handoff.output_versions[0].bytes, undefined);
    await writeFile(path.join(f.root, f.image.path), replacement(await readFile(path.join(f.root, f.image.path))));
    assert.equal((await verifyHandoff({ ...options, handoff })).verified, true);
    const legacy = structuredClone(handoff); legacy.output_versions[0].version = 'sha256:stale'; legacy.output_versions[0].bytes = 1; legacy.outputs[0].source_identity = 'old-image-checksum';
    assert.equal((await verifyHandoff({ ...options, handoff: legacy })).verified, true);
    const wrong = structuredClone(handoff); wrong.output_versions[0].version = 'other:assets-src/other.png';
    await assert.rejects(verifyHandoff({ ...options, handoff: wrong }));
    await writeFile(path.join(f.root, f.image.path), 'invalid');
    await assert.rejects(verifyHandoff({ ...options, handoff }));
  } finally { await f.cleanup(); }
});

test('image suffixes in JSON selectors never classify the document as an image', () => {
  assert.equal(isImage('content/assets/source-map.json#assets/image.webp'), false);
  assert.equal(isImage('images/ref.png#metadata'), true);
});

test('catalog decode validates current pixels while stale image hash/byte metadata is inert', async () => {
  const f = await fixture();
  try {
    const catalog = JSON.parse(await readFile(path.join(f.root, 'catalog.json')));
    const source = catalog.files['source.fixture.reference']; source.sha256 = 'not a digest'; source.bytes = 0;
    await writeFile(path.join(f.root, source.sourcePath), replacement(await readFile(path.join(f.root, source.sourcePath))));
    assert.equal(validateRepoSourceCatalog(catalog, { repoRoot: f.root }), catalog);
    source.sourcePath = 'assets-src/missing.png'; source.name = 'missing.png';
    assert.throws(() => validateRepoSourceCatalog(catalog, { repoRoot: f.root }));
  } finally { await f.cleanup(); }
});

test('integration impact ignores image byte identity and notices actual locator changes', async () => {
  const base = readerFor(path.resolve(import.meta.dirname, '..'), 'WORKTREE');
  const before = await snapshotScene(base, 'COM-01X');
  const replaced = { ...base, readBytes: async (name) => /\.(png|webp)$/.test(name) ? replacement(await base.readBytes(name)) : base.readBytes(name) };
  const after = await snapshotScene(replaced, 'COM-01X');
  assert.deepEqual(compareSceneSnapshots(before, after).changes, []);
  const moved = structuredClone(after);
  const id = Object.keys(moved.images)[0]; moved.images[id].asset.master.sourcePath = 'assets-src/changed.webp';
  assert.ok(compareSceneSnapshots(before, moved).changes.some((item) => item.reason === 'accepted_asset_locator_or_mapping_changed'));
});

test('MIME-classified image returns normalize legacy full inputs and reject explicit locator conflicts', async () => {
  for (const suffix of ['data', 'json']) {
    const f = await candidateFixture();
    try {
      const oldPath = f.image.path, location = oldPath.replace(/png$/, suffix);
      await writeFile(path.join(f.root, location), await readFile(path.join(f.root, oldPath)));
      f.image.path = location; f.image.filename = path.basename(location);
      f.packet.allowed_sources = f.packet.allowed_sources.map((p) => p === oldPath ? location : p);
      f.packet.input_versions.find((item) => item.id === 'candidate').location = location;
      f.packet.input_versions.find((item) => item.id === 'candidate').version = 'sha256:historical';
      await writeFile(path.join(f.root, f.packetPath), JSON.stringify(f.packet));
      const options = { root: f.root, packetPath: f.packetPath, bindingPath: 'generated/session-cache/run/mime-binding.json',
        facts: { status: 'NEEDS_REVIEW', inputs_used: [{ source: 'candidate', version: 'sha256:stale' }],
          outputs: [{ id: 'image', location }], qa: { checks: [] } } };
      const { handoff, inputBinding } = await generateHandoff(options);
      await writeCache(f.root, options.bindingPath, inputBinding);
      assert.equal(handoff.inputs_used[0].version, `WORKTREE:${location}`);
      assert.equal(handoff.output_versions[0].version, `WORKTREE:${location}`);
      assert.equal(handoff.outputs[0].mime_type, 'image/png');
      assert.equal(handoff.output_versions[0].mime_type, 'image/png');
      assert.equal(handoff.output_versions[0].bytes, undefined);
      for (const mime_type of ['', null]) {
        const facts = structuredClone(options.facts); facts.outputs[0].mime_type = mime_type;
        const detected = await generateHandoff({ ...options, facts });
        assert.equal(detected.handoff.output_versions[0].version, `WORKTREE:${location}`);
        assert.equal(detected.handoff.output_versions[0].mime_type, 'image/png');
        assert.equal(detected.handoff.output_versions[0].bytes, undefined);
      }
      for (const mime_type of ['image/jpeg', 'text/plain', 'application/json']) {
        const facts = structuredClone(options.facts); facts.outputs[0].mime_type = mime_type;
        await assert.rejects(generateHandoff({ ...options, facts }), /invalid output image MIME/);
      }
      const wrongRefFacts = structuredClone(options.facts); wrongRefFacts.outputs[0].ref = 'bogus';
      wrongRefFacts.outputs[0].mime_type = 'text/plain';
      await assert.rejects(generateHandoff({ ...options, facts: wrongRefFacts }), /local image output ref must be WORKTREE/);
      const full = structuredClone(handoff); delete full.format; delete full.input_binding;
      full.input_versions = structuredClone(f.packet.input_versions);
      for (const digest of [undefined, 'old-digest', 'sha256:different']) {
        const image = full.input_versions.find((item) => item.id === 'candidate'); image.version = digest; image.bytes = -1;
        assert.equal((await verifyHandoff({ ...options, handoff: full })).verified, true);
      }
      for (const mutate of [h => h.inputs_used[0].version = `wrong:${location}`,
        h => h.outputs[0].source_identity = `other:${location}`, h => h.outputs[0].ref = 'bogus', h => h.outputs[0].mime_type = 'image/jpeg',
        h => h.outputs[0].mime_type = 'text/plain', h => h.outputs[0].mime_type = 'application/json',
        h => h.outputs[0].ref = f.git('hash-object', oldPath), h => h.output_versions[0].version = 'WORKTREE:wrong.json']) {
        const wrong = structuredClone(handoff); mutate(wrong);
        await assert.rejects(verifyHandoff({ ...options, handoff: wrong }));
      }
      const wrongText = structuredClone(full); wrongText.input_versions[0].version = '0'.repeat(40);
      await assert.rejects(verifyHandoff({ ...options, handoff: wrongText }), /legacy full input versions/);
      const wrongAcquisition = structuredClone(f.packet); wrongAcquisition.required_acquisition.images[0].ref = 'bogus';
      await assert.rejects(verifyTaskPacket(wrongAcquisition, { root: f.root }), /transient image ref/);
      await writeFile(path.join(f.root, location), 'not decoded pixels');
      await assert.rejects(verifyHandoff({ ...options, handoff }));
    } finally { await f.cleanup(); }
  }
});

test('genuine JSON, text and code Handoff outputs retain exact hashes and reject changed bytes', async () => {
  const f = await fixture();
  try {
    const outputs = [
      { id: 'json', location: 'generated/session-cache/run/result.json', mime_type: 'application/json', content: '{"result":true}\n' },
      { id: 'text', location: 'generated/session-cache/run/result.txt', mime_type: 'text/plain', content: 'synthetic result\n' },
      { id: 'code', location: 'generated/session-cache/run/result.mjs', content: 'export const result = true;\n' }
    ];
    for (const output of outputs) await writeFile(path.join(f.root, output.location), output.content);
    const options = { root: f.root, packetPath: f.packetPath, bindingPath: 'generated/session-cache/run/non-image-binding.json',
      facts: { status: 'NEEDS_REVIEW', inputs_used: ['input'], outputs, qa: { checks: [] } } };
    const { handoff, inputBinding } = await generateHandoff(options);
    await writeCache(f.root, options.bindingPath, inputBinding);
    for (const [index, output] of outputs.entries()) {
      assert.equal(handoff.output_versions[index].version, `sha256:${createHash('sha256').update(output.content).digest('hex')}`);
      assert.equal(handoff.output_versions[index].bytes, Buffer.byteLength(output.content));
    }
    assert.equal((await verifyHandoff({ ...options, handoff })).verified, true);
    for (const output of outputs) {
      await writeFile(path.join(f.root, output.location), output.content.replace('true', 'false').replace('result\n', 'edited\n'));
      await assert.rejects(verifyHandoff({ ...options, handoff }), /output bytes\/version mismatch/);
      await writeFile(path.join(f.root, output.location), output.content);
    }
  } finally { await f.cleanup(); }
});

test('dependency input/output image fingerprints are inert while text, receipt and locator identities stay exact', async () => {
  const f = await candidateFixture();
  try {
    const oldPath = f.image.path, newPath = oldPath.replace(/png$/, 'data');
    await writeFile(path.join(f.root, newPath), await readFile(path.join(f.root, oldPath)));
    f.image.path = newPath; f.image.filename = path.basename(newPath);
    f.packet.allowed_sources = f.packet.allowed_sources.map((p) => p === oldPath ? newPath : p);
    f.packet.input_versions.find((item) => item.id === 'candidate').location = newPath;
    const receipt = JSON.parse(await readFile(path.join(f.root, 'approval.json')));
    const version = { id: 'candidate', location: f.image.path, version: 'sha256:historical', bytes: 1 };
    receipt.input_versions.push(version); receipt.output_versions = [version];
    await writeFile(path.join(f.root, 'approval.json'), JSON.stringify(receipt));
    f.git('add', 'approval.json'); f.git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'synthetic image evidence');
    f.packet.source_binding.github.ref = f.git('rev-parse', 'HEAD');
    const dependency = f.packet.preflight_requirements.dependencies[0];
    dependency.version = f.git('rev-parse', 'HEAD:approval.json'); dependency.input_versions = structuredClone(receipt.input_versions);
    dependency.output_versions = structuredClone(receipt.output_versions);
    f.packet.inputs.accepted_outputs = [{ run_id: 'upstream', task_id: 'QA', id: 'candidate', location: f.image.path }];
    for (const digest of [undefined, 'different', 'sha256:stale']) {
      dependency.input_versions.at(-1).version = digest; dependency.input_versions.at(-1).bytes = 999;
      dependency.output_versions[0].version = digest; dependency.output_versions[0].bytes = 999;
      assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
    }
    for (const mutate of [p => p.preflight_requirements.dependencies[0].input_versions[0].version = '0'.repeat(40),
      p => p.preflight_requirements.dependencies[0].version = '0'.repeat(40),
      p => p.preflight_requirements.dependencies[0].output_versions[0].version = `other:${f.image.path}`,
      p => p.inputs.accepted_outputs[0].version = `other:${f.image.path}`,
      p => p.inputs.accepted_outputs[0].ref = 'other', p => p.inputs.accepted_outputs[0].location = 'different.png']) {
      const wrong = structuredClone(f.packet); mutate(wrong);
      await assert.rejects(verifyTaskPacket(wrong, { root: f.root }));
    }
  } finally { await f.cleanup(); }
});

// Focused repair: node --test --test-skip-pattern='current generators' tests/image-path-contract.test.mjs
// A negative --test-name-pattern can match the file ancestor and run this slow case; full CI includes it.
test('current generators consume a current-valid reference overlay and preserve pinned QA documents', async () => {
  const { execFileSync } = await import('node:child_process');
  const { mkdtemp, rm } = await import('node:fs/promises');
  const os = await import('node:os');
  const { buildCgPlanPacket, buildCandidateVisualReviewPacket } = await import('../tools/context-packet.mjs');
  const { verifyProductionRun } = await import('../tools/verify-production-run.mjs');
  const repo = path.resolve(import.meta.dirname, '..'), temporary = await mkdtemp(path.join(os.tmpdir(), 'current-image-generators-'));
  const root = path.join(temporary, 'repo');
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { stdio: 'pipe' });
  try {
    execFileSync('git', ['clone', '--quiet', '--no-hardlinks', '--no-checkout', repo, root], { stdio: 'pipe' });
    git('checkout', '--quiet', '--detach', 'bfe5058a46ac9eab0d860b921fc8cf7a20f6abe2');
    // Temporary current-valid reference overlay: this registered reference was absent
    // at the pinned checkpoint. No production receipt or canonical source is changed.
    const catalogPath = path.join(root, 'content/assets/source-catalog.json');
    const catalog = JSON.parse(await readFile(catalogPath));
    const original = catalog.files['ref.xu_tang.face.01'];
    const productionPath = 'assets-src/references/xu-tang/xt-ref-04-production.png';
    await writeFile(path.join(root, productionPath), await readFile(path.join(root, original.sourcePath)));
    catalog.files['ref.xu_tang.production.04'] = { ...original, sourcePath: productionPath, name: 'xt-ref-04-production.png', role: 'production_consistency' };
    await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
    git('add', 'content/assets/source-catalog.json', productionPath);
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'synthetic current reference overlay');
    const planning = await buildCgPlanPacket({ root, sceneId: 'COM-00', runId: 'current-plan', taskId: 'CGP-COM00-001',
      upstreamRunId: 'issue16-com00-nqa-20260926', upstreamTaskId: 'NQA-COM00-001',
      referenceIds: ['ref.xu_tang.face.01', 'ref.xu_tang.wardrobe.a', 'ref.xu_tang.production.04', 'source.opening.ch1.bg.apt_17f_rain'] });
    const candidate = await buildCandidateVisualReviewPacket({ root, sceneId: 'COM-00', runId: 'current-candidate', taskId: 'VQA-COM00-S04-BASE-001',
      upstreamRunId: 'issue16-com00-mua-20260927', upstreamTaskId: 'MUA-COM00-001',
      entryId: 'COM00-S04-BASE-NEUTRAL', candidateSourceId: 'source.opening.ch1.cg.com00_s04_base_neutral' });
    for (const packet of [planning, candidate]) {
      for (const image of packet.required_acquisition.images) {
        for (const field of ['sha256', 'git_blob_sha', 'bytes', 'expected_bytes']) assert.equal(image[field], undefined);
        assert.equal(image.ref, packet.source_binding.github.ref);
        assert.equal(packet.input_versions.find((item) => item.id === `image:${image.source_id}`).version, `${image.ref}:${image.path}`);
      }
      const binding = await sourceIdentities(packet, { root });
      assert.ok(binding.sources.filter((source) => source.media_type?.startsWith('image/')).every((source) => !source.sha256 && source.ref === packet.source_binding.github.ref));
      const conflict = structuredClone(packet); conflict.input_versions.find((item) => item.id.startsWith('image:')).version = 'other:assets-src/wrong.png';
      await assert.rejects(sourceIdentities(conflict, { root }), /image locator mismatch/);
      const tampered = structuredClone(packet); tampered.required_acquisition.markdown[0].git_blob_sha = '0'.repeat(40);
      await assert.rejects(sourceIdentities(tampered, { root }), /stale or unsupported version/);
    }
    // One full candidate replay and one planning Handoff round trip exercise both
    // supported boundaries; source identity negatives do not rebuild upstream QA.
    await verifyTaskPacket(candidate, { root });
    const packetPath = 'generated/session-cache/current/planning.json', bindingPath = 'generated/session-cache/current/planning.binding.json';
    await writeCache(root, packetPath, planning);
    const { handoff, inputBinding } = await generateHandoff({ root, packetPath, bindingPath,
      facts: { status: 'NEEDS_REVIEW', inputs_used: planning.required_acquisition.images.map((item) => `image:${item.source_id}`), outputs: [], qa: { checks: [] } } });
    await writeCache(root, bindingPath, inputBinding);
    assert.equal((await verifyHandoff({ root, packetPath, handoff })).verified, true);
    const run = 'issue16-com00-vqa-recovery-20260927';
    const image = candidate.required_acquisition.images[1];
    await writeFile(path.join(root, image.path), replacement(await readFile(path.join(root, image.path))));
    assert.equal((await verifyProductionRun(run, { root, requireCurrent: true })).task_status, 'CURRENT_FAIL');
    const receiptPath = `content/production/runs/${run}/VQA-COM00-S04-BASE-002.decision.json`;
    const narrativeRun = 'issue16-com00-nqa-20260926';
    const narrativeReceiptPath = `content/production/runs/${narrativeRun}/NQA-COM00-001.decision.json`;
    const narrativeReceipt = await readFile(path.join(root, narrativeReceiptPath));
    await writeFile(path.join(root, narrativeReceiptPath), Buffer.concat([narrativeReceipt, Buffer.from('\n')]));
    await assert.rejects(verifyProductionRun(narrativeRun, { root, requireCurrent: true }), /decision source differs/);
    await writeFile(path.join(root, narrativeReceiptPath), narrativeReceipt);
    const recordedReceipt = JSON.parse(git('show', `HEAD:${receiptPath}`).toString());
    recordedReceipt.output_versions[0].version = `other:${candidate.required_acquisition.images[0].path}`;
    await writeFile(path.join(root, receiptPath), JSON.stringify(recordedReceipt, null, 2) + '\n');
    git('add', receiptPath);
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'synthetic conflicting image output locator');
    await assert.rejects(verifyProductionRun(run, { root, requireCurrent: true }), /image locator mismatch/);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
