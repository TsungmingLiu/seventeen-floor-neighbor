import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preflightProduction, verifyTaskPacket } from '../tools/production-preflight.mjs';
import { buildPackets } from '../tools/render-cg-packets.mjs';
import { hash, writeCache } from '../tools/production-task-io.mjs';

export async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'production-tools-'));
  const files = { '.gitignore': 'generated/session-cache/\n', 'AGENTS.md': 'fixture guidance', '.ai/WORKFLOW_MANIFEST.yaml': 'workflow:\n  version: 1.3.0\n  repository:\n    full_name: owner/repo\n    url: https://github.com/owner/repo\n',
    '.ai/harnesses/bootstrap.md': 'Version: 1.0.0', '.ai/harnesses/integrator.md': 'Version: 1.4.0', '.ai/harnesses/content-writer.md': 'Version: 1.0.0', '.ai/harnesses/cg-renderer.md': 'Version: 1.0.0', '.ai/harnesses/content-qa.md': 'Version: 1.0.0', '.ai/harnesses/cg-planner.md': 'Version: 1.0.0',
    '.ai/policies/SOURCE_AUTHORITY.md': 'fixture', '.ai/policies/CONTEXT_ISOLATION.md': 'fixture', 'docs/CONTENT_PRODUCTION_SOURCE_MAP.md': 'fixture', '.ai/schemas/HANDOFF.md': 'fixture',
    'tools/validate-content.mjs': 'console.log("fixture machine content check")', 'tools/validate-production-contracts.mjs': 'console.log("fixture machine production check")',
    'input.json': JSON.stringify({ scene_id: 'SCENE-1', source_scene: 'scene.md' }), 'scene.md': 'synthetic fixture only',
    'capability.json': JSON.stringify({ adapter: 'fixture', max_reference_images: 1 }), 'manifest.json': '{}', 'render.json': '{}', 'assets-src/reference.png': Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7N8AAAAASUVORK5CYII=', 'base64'),
    'approval.json': JSON.stringify({ run_id: 'upstream', task_id: 'QA', scene_id: 'SCENE-1', status: 'PASS', input_versions: [], qa: { checks: [{ name: 'manifest_usability', result: 'PASS' }] } }) };
  for (const [relative, bytes] of Object.entries(files)) { await mkdir(path.dirname(path.join(root, relative)), { recursive: true }); await writeFile(path.join(root, relative), bytes); }
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
  const attachment = { role: 'environment', source_id: 'source.fixture.reference', expected_filename: 'reference.png', pixels_must_be_visible: true };
  const entry = { entry_id: 'FIXTURE-ENTRY', scene_id: 'SCENE-1', source_scene: path.join(root, 'scene.md'), status: 'render_ready', cg_class: 'background_cg', beat_range: 'fixture', characters: [],
    narrative: { purpose: 'fixture', must_show: ['fixture'], must_not_imply: ['fixture'] }, environment: { location_id: 'fixture', time_of_day: 'fixture', weather: 'fixture', lighting: 'fixture', persistent_props: [], reference_binding: attachment },
    camera: { shot_size: 'fixture', angle: 'fixture', pov: 'fixture', axis_id: 'fixture', camera_side: 'fixture', lens_intent: 'fixture' }, continuity: { previous_entry_id: null, locked_fields: [], allowed_changes: [] },
    composition: { focus: { x: 50, y: 50 }, dialogue_safe_zone: 'fixture', framing_notes: ['fixture'] }, render_constraints: { include: ['fixture'], exclude: ['fixture'], text_policy: 'fixture' },
    reference_transport: { mode: 'references_required', fresh_session_required: true, no_unrelated_images_allowed: true, accepted_base_asset_id: null, attachments: [attachment] }, output: { canonical_asset_id: 'FIXTURE', logical_asset_id: 'fixture.asset', master_filename: 'fixture.png', quantity: 1 }, acceptance: ['fixture'] };
  const manifest = { schema_version: '1.0.0', manifest_id: 'fixture', manifest_version: '1.0.0', lifecycle: 'CANONICAL', source_scene_ids: ['SCENE-1'], style_contract: { style_id: 'fixture', positive: ['fixture'], negative: ['fixture'], aspect_ratio: '16:9', output_count: 1 }, entries: [entry] };
  await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest));
  await writeFile(path.join(root, 'render.json'), JSON.stringify(buildPackets(manifest)[0]));
  await writeFile(path.join(root, 'assets-src/reference2.png'), await readFile(path.join(root, 'assets-src/reference.png')));
  const imageBytes = await readFile(path.join(root, 'assets-src/reference.png'));
  await writeFile(path.join(root, 'catalog.json'), JSON.stringify({ sourceCatalogVersion: 2, provider: 'repo', files: { 'source.fixture.second': { name: 'reference2.png', mimeType: 'image/png', sourcePath: 'assets-src/reference2.png', bytes: imageBytes.length, width: 1, height: 1, sha256: hash(imageBytes), verifiedDecode: true, status: 'active-production' }, 'source.fixture.reference': { name: 'reference.png', mimeType: 'image/png', sourcePath: 'assets-src/reference.png', bytes: imageBytes.length, width: 1, height: 1, sha256: hash(imageBytes), verifiedDecode: true, status: 'active-production' } } }));
  git('init');
  const inputVersion = { id: 'input', version: git('hash-object', 'input.json'), location: 'input.json' };
  await writeFile(path.join(root, 'approval.json'), JSON.stringify({ run_id: 'upstream', task_id: 'QA', scene_id: 'SCENE-1', status: 'PASS', input_versions: [inputVersion, { id: 'manifest', version: git('hash-object', 'manifest.json'), location: 'manifest.json' }], harness: { id: 'content_qa', pass: 'visual_review' }, qa_codes: [{ name: 'manifest_usability', code: 'MUA-FIXTURE', result: 'PASS' }] }));
  const profiles = [{ id: 'desktop', kind: 'desktop', width: 1920, height: 1080, dpr: 1, orientation: 'landscape' }, { id: 'landscape', kind: 'mobile_landscape', width: 844, height: 390, dpr: 3, orientation: 'landscape' }, { id: 'portrait', kind: 'mobile_portrait', width: 390, height: 844, dpr: 3, orientation: 'portrait' }];
  await writeFile(path.join(root, 'profiles.json'), JSON.stringify({ display_profiles: profiles }));
  git('add', '.'); git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'synthetic fixture');
  const ref = git('rev-parse', 'HEAD');
  const acquire = async (relative) => ({ path: relative, git_blob_sha: git('rev-parse', `${ref}:${relative}`), sha256: hash(await readFile(path.join(root, relative))), expected_nonempty: true });
  const source = await acquire('input.json');
  const packet = { run_id: 'run', task_id: 'TASK', packet_origin: 'manual-v1', task_type: 'integrate', harness: 'integrator', pass: null, integration_mode: 'governance_maintenance', workflow_version: '1.3.0',
    source_binding: { github: { repository_full_name: 'owner/repo', repository_url: 'https://github.com/owner/repo', ref } },
    required_acquisition: { markdown: [source], images: [] }, allowed_sources: ['input.json'], input_versions: [{ id: 'input', version: source.git_blob_sha, location: 'input.json' }],
    depends_on: [], preflight_requirements: { version: 1, dependencies: [] }, human_gate: 'none', write_allowlist: ['output.json', 'generated/session-cache/run/**'], deliverables: [] };
  const packetPath = 'generated/session-cache/run/packet.json';
  await writeCache(root, packetPath, packet);
  return { root, packet, packetPath, acquire, git, cleanup: () => rm(root, { recursive: true, force: true }) };
}
export async function candidateFixture() {
  const f = await fixture(), packet = structuredClone(f.packet);
  Object.assign(packet, { task_type: 'visual_review', harness: 'content_qa', pass: 'visual_review', integration_mode: undefined, scene_id: 'SCENE-1', review_scope: 'candidate' });
  const manifest = await f.acquire('manifest.json'); packet.required_acquisition.markdown.push(manifest); packet.allowed_sources.push(manifest.path); packet.input_versions.push({ id: 'manifest', version: manifest.git_blob_sha, location: manifest.path });
  const relative = 'generated/session-cache/run/candidate.png', bytes = await readFile(path.join(f.root, 'assets-src/reference.png'));
  await writeFile(path.join(f.root, relative), bytes);
  const image = { path: relative, sha256: hash(bytes), artifact_role: 'candidate_original', role: 'candidate', source_id: 'candidate.fixture', filename: 'candidate.png', mime_type: 'image/png', width: 1, height: 1, pixels_must_be_visible: true };
  packet.required_acquisition.images = [image]; packet.allowed_sources.push(relative); packet.input_versions.push({ id: 'candidate', version: image.sha256, location: relative });
  packet.inputs = { cg_manifest: manifest.path, cg_entry_id: 'FIXTURE-ENTRY', candidate_source_id: image.source_id };
  const receipt = JSON.parse(await readFile(path.join(f.root, 'approval.json'), 'utf8'));
  packet.preflight_requirements.dependencies = [{ gate: 'manifest_usability', required_qa_codes: ['MUA-FIXTURE'], run_id: 'upstream', task_id: 'QA', receipt: 'approval.json', version: (await f.acquire('approval.json')).git_blob_sha, input_versions: receipt.input_versions }];
  const packetPath = 'generated/session-cache/run/candidate-packet.json'; await writeCache(f.root, packetPath, packet);
  return { ...f, packet, packetPath, image };
}
const clone = (value) => structuredClone(value);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  test('manual preflight runs machine validators and only permits dispatch', async () => {
    const f = await fixture(); try {
      const report = await preflightProduction(f); assert.equal(report.dispatch_allowed, true); assert.equal(report.status, 'DISPATCH_ALLOWED'); assert.equal(report.production_approval, false); assert.equal(report.semantic_qa, 'NOT_RUN'); assert.equal(report.pixels_verified, false);
    } finally { await f.cleanup(); }
  });
  test('identity, version, scene and allowlist failures close dispatch', async () => {
    const f = await fixture(); try {
      for (const mutate of [p => p.source_binding.github.repository_full_name = 'wrong/repo', p => p.workflow_version = '0.0.0', p => p.required_acquisition.markdown[0].sha256 = '0'.repeat(64), p => p.required_acquisition.markdown[0].git_blob_sha = '0'.repeat(40), p => p.allowed_sources = [], p => p.allowed_sources.push('extra.md'), p => p.input_versions[0].version = '0'.repeat(40), p => delete p.preflight_requirements]) {
        const p = clone(f.packet); mutate(p); await assert.rejects(verifyTaskPacket(p, { root: f.root, kind: 'manual' }));
      }
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root, expectedScene: 'SCENE-OTHER' }), /wrong dispatched scene/);
      await writeFile(path.join(f.root, 'input.json'), '{}'); await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /differs from ref/);
    } finally { await f.cleanup(); }
  });
  test('unsafe paths, source symlinks and cache output links are refused', async () => {
    const f = await fixture(); try {
      for (const relative of ['../input.json', '/input.json', 'docs/archive/old.md', 'input.json#unexpected']) {
        const p = clone(f.packet); p.required_acquisition.markdown[0].path = relative; await assert.rejects(verifyTaskPacket(p, { root: f.root }));
      }
      await rm(path.join(f.root, 'input.json')); await symlink('scene.md', path.join(f.root, 'input.json')); await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /symlink/);
      await symlink(path.join(f.root, 'input.json'), path.join(f.root, 'generated/session-cache/run/linked.json')); await assert.rejects(writeCache(f.root, 'generated/session-cache/run/linked.json', {}));
      await assert.rejects(writeCache(f.root, 'output.json', {}), /unsafe/);
    } finally { await f.cleanup(); }
  });
  test('generated routes cannot downgrade to manual validation', async () => {
    const f = await fixture(); try {
      const packet = clone(f.packet); Object.assign(packet, { task_type: 'narrative_review', harness: 'content_qa', pass: 'narrative_review', scene_id: 'SCENE-1' });
      await assert.rejects(verifyTaskPacket(packet, { root: f.root, kind: 'manual' }));
    } finally { await f.cleanup(); }
  });
  test('manual scene binding, required approvals and stale QA fail closed', async () => {
    const f = await fixture(); try {
      const p = clone(f.packet); p.integration_mode = 'narrative_preview'; p.scene_id = 'SCENE-1'; p.inputs = { narrative_contract: 'input.json', locked_scene: 'scene.md' };
      const sceneSource = await f.acquire('scene.md'); p.required_acquisition.markdown.push(sceneSource); p.allowed_sources.push(sceneSource.path); p.input_versions.push({ id: 'scene', version: sceneSource.git_blob_sha, location: sceneSource.path });
      await assert.rejects(verifyTaskPacket(p, { root: f.root }), /missing required dependency/);
      p.scene_id = 'OTHER'; await assert.rejects(verifyTaskPacket(p, { root: f.root }), /wrong scene/); p.scene_id = 'SCENE-1';
      p.preflight_requirements.dependencies = [{ gate: 'narrative_review', run_id: 'upstream', task_id: 'QA', receipt: 'approval.json', version: (await f.acquire('approval.json')).git_blob_sha, input_versions: [{ ...p.input_versions[0], version: 'stale' }] }];
      await assert.rejects(verifyTaskPacket(p, { root: f.root }), /stale dependency QA/);
    } finally { await f.cleanup(); }
  });
  test('canonical display profiles require exact source/projection and all three profiles', async () => {
    const f = await fixture(); try {
      const g = clone(f.packet); g.preflight_requirements.display_profiles_required = true;
      await assert.rejects(verifyTaskPacket(g, { root: f.root }), /missing approved display/);
      const profiles = JSON.parse(await readFile(path.join(f.root, 'profiles.json'), 'utf8')).display_profiles;
      g.preflight_requirements.display_profiles = profiles.slice(0, 1);
      await assert.rejects(verifyTaskPacket(g, { root: f.root }), /missing required display profile/);
      g.preflight_requirements.display_profiles = profiles;
      await assert.rejects(verifyTaskPacket(g, { root: f.root }), /missing canonical display/);
      const source = await f.acquire('profiles.json'); g.required_acquisition.markdown.push(source); g.allowed_sources.push(source.path); g.input_versions.push({ id: 'profiles', version: source.git_blob_sha, location: source.path });
      g.preflight_requirements.display_profiles_source = { path: source.path, version: source.git_blob_sha };
      assert.equal((await verifyTaskPacket(g, { root: f.root })).kind, 'manual');
      const bad = clone(g); bad.preflight_requirements.display_profiles[0].width = 2000;
      await assert.rejects(verifyTaskPacket(bad, { root: f.root }), /projection differs/);
      bad.preflight_requirements.display_profiles[0].orientation = 'portrait'; await assert.rejects(verifyTaskPacket(bad, { root: f.root }), /invalid display/);
      const stale = clone(g); stale.preflight_requirements.display_profiles_source.version = '0'.repeat(40); await assert.rejects(verifyTaskPacket(stale, { root: f.root }), /stale/);
    } finally { await f.cleanup(); }
  });
  test('renderer verifies deterministic entry, reference capability and count after matching QA', async () => {
    const f = await fixture(); try {
      const r = clone(f.packet); Object.assign(r, { task_type: 'cg_render', harness: 'cg_renderer', integration_mode: undefined, scene_id: 'SCENE-1' });
      for (const relative of ['manifest.json', 'render.json', 'capability.json']) {
        const source = await f.acquire(relative); r.required_acquisition.markdown.push(source); r.allowed_sources.push(relative); r.input_versions.push({ id: relative === 'manifest.json' ? 'manifest' : relative, version: source.git_blob_sha, location: relative });
      }
      const image = { ...await f.acquire('assets-src/reference.png'), source_id: 'source.fixture.reference', role: 'environment', filename: 'reference.png', mime_type: 'image/png', width: 1, height: 1, pixels_must_be_visible: true };
      r.required_acquisition.images = [image]; r.allowed_sources.push(image.path); r.input_versions.push({ id: 'image', version: image.git_blob_sha, location: image.path });
      r.inputs = { cg_entry_id: 'FIXTURE-ENTRY', cg_manifest: 'manifest.json', render_packet: 'render.json', references: ['source.fixture.reference'] };
      const receipt = JSON.parse(await readFile(path.join(f.root, 'approval.json'), 'utf8'));
      r.preflight_requirements.reference_catalog = { path: 'catalog.json', version: (await f.acquire('catalog.json')).git_blob_sha };
      r.preflight_requirements.dependencies = [{ gate: 'manifest_usability', required_qa_codes: ['MUA-FIXTURE'], run_id: 'upstream', task_id: 'QA', receipt: 'approval.json', version: (await f.acquire('approval.json')).git_blob_sha, input_versions: receipt.input_versions }];
      await assert.rejects(verifyTaskPacket(r, { root: f.root }), /missing renderer max-reference/);
      r.preflight_requirements.renderer = { adapter: 'fixture', capability_source: 'capability.json', max_reference_images: 1 };
      assert.equal((await verifyTaskPacket(r, { root: f.root })).kind, 'manual');
      const cached = clone(r);
      for (const [original, artifact_role] of [['render.json', 'deterministic_render_packet'], ['capability.json', 'renderer_capability']]) {
        const relative = `generated/session-cache/run/${original}`, bytes = await readFile(path.join(f.root, original));
        await writeFile(path.join(f.root, relative), bytes);
        cached.required_acquisition.markdown = cached.required_acquisition.markdown.map((source) => source.path === original ? { path: relative, sha256: hash(bytes), artifact_role, expected_nonempty: true } : source);
        cached.allowed_sources = cached.allowed_sources.map((source) => source === original ? relative : source);
        cached.input_versions = cached.input_versions.map((source) => source.location === original ? { ...source, location: relative, version: hash(bytes) } : source);
        if (original === 'render.json') cached.inputs.render_packet = relative;
        else cached.preflight_requirements.renderer.capability_source = relative;
      }
      const cacheBinding = await verifyTaskPacket(cached, { root: f.root });
      assert.ok(cacheBinding.sources.some((source) => source.storage === 'transient' && !source.git_blob_sha));
      await writeFile(path.join(f.root, cached.inputs.render_packet), '{}');
      await assert.rejects(verifyTaskPacket(cached, { root: f.root }), /tampered SHA/);
      await writeFile(path.join(f.root, cached.inputs.render_packet), await readFile(path.join(f.root, 'render.json')));
      const fakeGit = clone(cached); fakeGit.required_acquisition.markdown.find((source) => source.artifact_role).git_blob_sha = '0'.repeat(40);
      await assert.rejects(verifyTaskPacket(fakeGit, { root: f.root }), /SHA only/);
      const count = clone(r); const second = { ...await f.acquire('assets-src/reference2.png'), source_id: 'source.fixture.second', role: 'environment', filename: 'reference2.png', mime_type: 'image/png', width: 1, height: 1, pixels_must_be_visible: true };
      count.required_acquisition.images.push(second); count.allowed_sources.push(second.path); count.input_versions.push({ id: 'second', location: second.path, version: second.git_blob_sha });
      await assert.rejects(verifyTaskPacket(count, { root: f.root }), /reference limit exceeded/);
      const inconsistent = clone(r); inconsistent.preflight_requirements.renderer.max_reference_images = 2; await assert.rejects(verifyTaskPacket(inconsistent, { root: f.root }), /capability evidence mismatch/);
      const wrongEntry = clone(r); wrongEntry.inputs.cg_entry_id = 'OTHER'; await assert.rejects(verifyTaskPacket(wrongEntry, { root: f.root }), /unknown entry/);
      const wrongScene = clone(r); wrongScene.scene_id = 'OTHER'; await assert.rejects(verifyTaskPacket(wrongScene, { root: f.root }), /wrong scene/);
      const undeclared = clone(r); undeclared.inputs.references = ['other']; await assert.rejects(verifyTaskPacket(undeclared, { root: f.root }), /reference mismatch/);
    } finally { await f.cleanup(); }
  });  test('uncommitted candidate/derivative/screenshots require exact role/hash/image bytes', async () => {
    const f = await candidateFixture(); try {
      const binding = await verifyTaskPacket(f.packet, { root: f.root });
      assert.ok(binding.sources.some((source) => source.path === f.image.path && source.storage === 'transient' && !source.git_blob_sha));
      for (const role of ['runtime_derivative', 'runtime_screenshot']) { const p = clone(f.packet); p.required_acquisition.images[0].artifact_role = role; assert.equal((await verifyTaskPacket(p, { root: f.root })).kind, 'manual'); }
      for (const mutate of [p => delete p.required_acquisition.images[0].artifact_role, p => p.required_acquisition.images[0].artifact_role = 'canonical_prose', p => p.required_acquisition.images[0].sha256 = '0'.repeat(64), p => p.required_acquisition.images[0].mime_type = 'image/jpeg', p => p.required_acquisition.images[0].width = 2, p => p.input_versions.at(-1).version = '0'.repeat(40)]) {
        const p = clone(f.packet); mutate(p); await assert.rejects(verifyTaskPacket(p, { root: f.root }));
      }
      await writeFile(path.join(f.root, f.image.path), 'tampered'); await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }));
    } finally { await f.cleanup(); }
  });

}
