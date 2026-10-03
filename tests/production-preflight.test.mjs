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
  await writeFile(path.join(root, 'approval.json'), JSON.stringify({ run_id: 'upstream', task_id: 'QA', scene_id: 'SCENE-1', task_type: 'visual_review', human_gate_required: 'none', status: 'PASS', input_versions: [inputVersion, { id: 'manifest', version: git('hash-object', 'manifest.json'), location: 'manifest.json' }], harness: { id: 'content_qa', pass: 'visual_review' }, qa_codes: [{ name: 'manifest_usability', code: 'MUA-FIXTURE', result: 'PASS' }] }));
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
async function commitFixtureReceipt(f, receipt, relative = 'approval.json') {
  await writeFile(path.join(f.root, relative), JSON.stringify(receipt));
  f.git('add', relative); f.git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'synthetic prerequisite evidence');
  const ref = f.git('rev-parse', 'HEAD'); f.packet.source_binding.github.ref = ref;
  f.acquire = async (location) => ({ path: location, git_blob_sha: f.git('rev-parse', `${ref}:${location}`),
    sha256: hash(await readFile(path.join(f.root, location))), expected_nonempty: true });
  return { receipt: relative, version: (await f.acquire(relative)).git_blob_sha, run_id: receipt.run_id,
    task_id: receipt.task_id, input_versions: receipt.input_versions, output_versions: receipt.output_versions };
}
async function narrativePrerequisiteFixture(gate = 'narrative_review', humanGate = 'none') {
  const f = await fixture();
  Object.assign(f.packet, gate === 'narrative_design' ? { task_type: 'scene_dialogue', harness: 'content_writer',
    pass: 'scene_dialogue', integration_mode: undefined, scene_id: 'SCENE-1' } : { integration_mode: 'narrative_preview', scene_id: 'SCENE-1' });
  const scene = await f.acquire('scene.md');
  f.packet.required_acquisition.markdown.push(scene); f.packet.allowed_sources.push(scene.path);
  f.packet.input_versions.push({ id: 'scene', version: scene.git_blob_sha, location: scene.path });
  f.packet.inputs = { narrative_contract: 'input.json', locked_scene: 'scene.md' };
  const writer = gate === 'narrative_design';
  const receipt = { schema_version: '2.0.0', storage_class: 'durable_decision', evidence_purpose: 'qa_decision',
    run_id: 'upstream', task_id: 'QA', scene_id: 'SCENE-1', task_type: gate, status: 'PASS',
    harness: { id: writer ? 'content_writer' : 'content_qa', version: '1.0.0', pass: gate },
    input_versions: writer ? [f.packet.input_versions[1]] : f.packet.input_versions.map((input) => ({ ...input, id: `reviewed:${input.id}` })),
    output_versions: [{ id: writer ? 'narrative_contract:SCENE-1' : 'approved_locked_scene:SCENE-1',
      location: writer ? 'input.json' : 'scene.md', version: writer ? f.packet.input_versions[0].version : scene.git_blob_sha }],
    qa_codes: [{ name: 'fixture', code: writer ? 'DESIGN-FIXTURE' : 'NQA-FIXTURE', result: 'PASS' }],
    human_gate_required: humanGate, invalidates: [] };
  f.packet.preflight_requirements.dependencies = [{ ...await commitFixtureReceipt(f, receipt), gate,
    required_qa_codes: [receipt.qa_codes[0].code] }];
  return { ...f, receipt };
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

  test('narrative approval must cover both consumed sources; design may bind its contract output', async () => {
    for (const gate of ['narrative_review', 'narrative_design']) {
      const f = await narrativePrerequisiteFixture(gate); try {
        assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
        const omitted = clone(f.receipt);
        if (gate === 'narrative_review') omitted.input_versions = omitted.input_versions.filter((input) => input.location !== 'scene.md');
        else omitted.output_versions = [];
        f.packet.preflight_requirements.dependencies[0] = { ...f.packet.preflight_requirements.dependencies[0], ...await commitFixtureReceipt(f, omitted) };
        await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /does not cover consumed inputs/);
      } finally { await f.cleanup(); }
    }
  });
  test('every prior stage rejects substituted task type, harness, pass and unknown gate', async () => {
    for (const gate of ['narrative_design', 'narrative_review', 'manifest_usability', 'visual_review']) {
      const f = ['narrative_design', 'narrative_review'].includes(gate) ? await narrativePrerequisiteFixture(gate) : await candidateFixture();
      try {
        let original = f.receipt || JSON.parse(await readFile(path.join(f.root, 'approval.json'), 'utf8'));
        if (gate === 'visual_review') {
          original = { ...original, input_versions: f.packet.input_versions, qa_codes: [{ name: 'fixture', code: 'VQA-FIXTURE', result: 'PASS' }] };
          // This is an explicitly declared additional gate; manifest usability remains independently required.
          f.packet.preflight_requirements.dependencies.push({ ...await commitFixtureReceipt(f, original, 'visual.json'), gate, required_qa_codes: ['VQA-FIXTURE'] });
        }
        assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
        const index = gate === 'visual_review' ? 1 : 0;
        const changes = [r => r.task_type = 'integrate', r => r.harness.id = 'cg_planner', r => r.harness.pass = 'scene_dialogue',
          r => { r.task_type = 'visual_review'; r.harness = { id: 'content_qa', version: '1.0.0', pass: 'visual_review' }; r.qa_codes = [{ name: 'fixture', code: 'MUA-FIXTURE', result: 'PASS' }]; }];
        for (const change of gate === 'manifest_usability' ? changes.slice(0, 3) : changes) {
          // For manifest usability this last shape is already the correct stage.
          const wrong = clone(original); change(wrong);
          if (JSON.stringify(wrong) === JSON.stringify(original)) continue;
          const declaration = await commitFixtureReceipt(f, wrong, gate === 'visual_review' ? 'visual.json' : 'approval.json');
          f.packet.preflight_requirements.dependencies[index] = { ...declaration, gate, required_qa_codes: [wrong.qa_codes[0].code] };
          await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /provenance|scope/);
        }
        f.packet.preflight_requirements.dependencies[index] = { ...await commitFixtureReceipt(f, original, gate === 'visual_review' ? 'visual.json' : 'approval.json'), gate: 'unknown_approval', required_qa_codes: [original.qa_codes[0].code] };
        await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /unsupported dependency approval gate/);
      } finally { await f.cleanup(); }
    }
  });
  test('narrative design rejects visual approval even with all consumed identities matching', async () => {
    const f = await narrativePrerequisiteFixture('narrative_design'); try {
      assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
      const wrong = { ...f.receipt, task_type: 'visual_review', harness: { id: 'content_qa', version: '1.0.0', pass: 'visual_review' },
        input_versions: f.packet.input_versions, qa_codes: [{ name: 'fixture', code: 'MUA-FIXTURE', result: 'PASS' }] };
      f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f, wrong), gate: 'narrative_design', required_qa_codes: ['MUA-FIXTURE'] };
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /dependency stage provenance mismatch/);
    } finally { await f.cleanup(); }
  });
  test('manifest and visual review coverage cannot omit consumed manifest or candidate evidence', async () => {
    const f = await candidateFixture(); try {
      const original = JSON.parse(await readFile(path.join(f.root, 'approval.json'), 'utf8'));
      assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
      const omitted = { ...original, input_versions: original.input_versions.filter((input) => input.location !== 'manifest.json') };
      f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f, omitted), gate: 'manifest_usability', required_qa_codes: ['MUA-FIXTURE'] };
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /does not cover consumed inputs/);
      f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f, original), gate: 'manifest_usability', required_qa_codes: ['MUA-FIXTURE'] };
      const visual = { ...original, input_versions: f.packet.input_versions, qa_codes: [{ name: 'fixture', code: 'VQA-FIXTURE', result: 'PASS' }] };
      f.packet.preflight_requirements.dependencies.push({ ...await commitFixtureReceipt(f, visual, 'visual.json'), gate: 'visual_review', required_qa_codes: ['VQA-FIXTURE'] });
      assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
      const wrong = { ...visual, input_versions: visual.input_versions.filter((input) => input.location !== f.image.path) };
      f.packet.preflight_requirements.dependencies[1] = { ...await commitFixtureReceipt(f, wrong, 'visual.json'), gate: 'visual_review', required_qa_codes: ['VQA-FIXTURE'] };
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /does not cover consumed inputs/);
    } finally { await f.cleanup(); }
  });
  test('visual QA covers each derivative, screenshot and profile; Human accepted-as-is stays independent', async () => {
    const f = await candidateFixture(); try {
      const original = JSON.parse(await readFile(path.join(f.root, 'approval.json'), 'utf8'));
      for (const artifact_role of ['runtime_derivative', 'runtime_screenshot']) {
        const relative = `generated/session-cache/run/${artifact_role}.png`;
        await writeFile(path.join(f.root, relative), await readFile(path.join(f.root, f.image.path)));
        const image = { ...f.image, path: relative, filename: path.basename(relative), source_id: artifact_role, role: 'evidence', artifact_role };
        f.packet.required_acquisition.images.push(image); f.packet.allowed_sources.push(relative);
        f.packet.input_versions.push({ id: artifact_role, location: relative, version: image.sha256 });
      }
      const profile = await f.acquire('profiles.json'); f.packet.required_acquisition.markdown.push(profile);
      f.packet.allowed_sources.push(profile.path); f.packet.input_versions.push({ id: 'profiles', location: profile.path, version: profile.git_blob_sha });
      f.packet.preflight_requirements.display_profiles_source = { path: profile.path, version: profile.git_blob_sha };
      const visual = { ...original, input_versions: f.packet.input_versions, qa_codes: [{ name: 'fixture', code: 'VQA-FIXTURE', result: 'PASS' }] };
      f.packet.preflight_requirements.dependencies.push({ ...await commitFixtureReceipt(f, visual, 'visual.json'), gate: 'visual_review', required_qa_codes: ['VQA-FIXTURE'] });
      assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
      for (const id of ['runtime_derivative', 'runtime_screenshot', 'profiles']) {
        const omitted = { ...visual, input_versions: visual.input_versions.filter((input) => input.id !== id) };
        f.packet.preflight_requirements.dependencies[1] = { ...await commitFixtureReceipt(f, omitted, 'visual.json'), gate: 'visual_review', required_qa_codes: ['VQA-FIXTURE'] };
        await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /does not cover consumed inputs/);
      }
      f.packet.preflight_requirements.dependencies[1] = { ...await commitFixtureReceipt(f, visual, 'visual.json'), gate: 'visual_review', required_qa_codes: ['VQA-FIXTURE'] };
      const human = { schema_version: '2.0.0', storage_class: 'durable_decision', evidence_purpose: 'human_decision',
        run_id: 'upstream', task_id: 'HUMAN', scene_id: 'SCENE-1', task_type: 'human_decision', status: 'HUMAN_ACCEPTED_AS_IS',
        input_versions: f.packet.input_versions.filter((input) => ['manifest', 'candidate'].includes(input.id)),
        output_versions: [], qa_codes: [], human_gate_required: 'accepted_master_image_selection', invalidates: [] };
      f.packet.preflight_requirements.dependencies.push({ ...await commitFixtureReceipt(f, human, 'human.json'), gate: 'accepted_master_image_selection' });
      assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
      const wrong = { ...human, input_versions: human.input_versions.filter((input) => input.id !== 'candidate') };
      f.packet.preflight_requirements.dependencies[2] = { ...await commitFixtureReceipt(f, wrong, 'human.json'), gate: 'accepted_master_image_selection' };
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /does not cover consumed inputs/);
    } finally { await f.cleanup(); }
  });
  test('upstream Human gate requires existing decision bound to exact receipt, sources and outputs', async () => {
    const f = await narrativePrerequisiteFixture('narrative_review', 'major_story_direction'); try {
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /unresolved upstream Human gate/);
      const upstream = f.packet.preflight_requirements.dependencies[0];
      const human = { schema_version: '2.0.0', storage_class: 'durable_decision', evidence_purpose: 'human_decision',
        run_id: 'upstream', task_id: 'HUMAN', scene_id: 'SCENE-1', task_type: 'human_decision', status: 'PASS',
        input_versions: [{ id: 'upstream_receipt', location: upstream.receipt, version: upstream.version }],
        output_versions: f.receipt.output_versions, qa_codes: [], human_gate_required: 'major_story_direction', invalidates: [] };
      const declare = async (receipt) => { f.packet.preflight_requirements.dependencies[1] = { ...await commitFixtureReceipt(f, receipt, 'human.json'), gate: 'major_story_direction' }; };
      await declare(human); assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
      for (const change of [h => h.scene_id = 'OTHER', h => h.human_gate_required = 'canonical_character_design', h => h.status = 'NEEDS_REVIEW',
        h => h.input_versions[0].version = '0'.repeat(40),
        h => h.input_versions = [{ id: 'same_scene', location: 'scene.md', version: f.packet.input_versions[1].version }]]) {
        const wrong = clone(human); change(wrong); await declare(wrong);
        await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /wrong scene|missing Human|absent|stale|does not bind/);
      }
      const unresolvedOutput = { ...f.receipt, output_versions: [] };
      f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f, unresolvedOutput), gate: 'narrative_review', required_qa_codes: ['NQA-FIXTURE'] };
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /unresolved output identities/);
      f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f, f.receipt), gate: 'narrative_review', required_qa_codes: ['NQA-FIXTURE'] };
      await declare(human);
      const otherTask = { ...f.receipt, task_id: 'OTHER-QA' };
      f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f, otherTask), gate: 'narrative_review', required_qa_codes: ['NQA-FIXTURE'] };
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /stale dependency QA source/);
    } finally { await f.cleanup(); }
  });
  test('unsupported historical selectors and missing upstream Human identity fail closed', async () => {
    const f = await narrativePrerequisiteFixture(); try {
      const unknown = clone(f.receipt); delete unknown.human_gate_required;
      f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f, unknown), gate: 'narrative_review', required_qa_codes: ['NQA-FIXTURE'] };
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /missing upstream Human gate identity/);
      const selected = clone(f.receipt); selected.input_versions[0].location = 'input.json#metadata_selector';
      f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f, selected), gate: 'narrative_review', required_qa_codes: ['NQA-FIXTURE'] };
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /unsupported dependency identity selector/);
    } finally { await f.cleanup(); }
  });

  test('consumed accepted outputs resolve acquired current bytes even without a Human gate', async () => {
    const f = await narrativePrerequisiteFixture(); try {
      const output = f.receipt.output_versions[0];
      f.packet.inputs.accepted_outputs = [{ run_id: 'upstream', task_id: 'QA', id: output.id, version: output.version }];
      assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
      const declare = async (outputs) => {
        f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f, { ...f.receipt, output_versions: outputs }),
          gate: 'narrative_review', required_qa_codes: ['NQA-FIXTURE'] };
        f.packet.inputs.accepted_outputs[0].version = outputs[0].version;
      };
      for (const [wrong, error] of [
        [{ ...output, location: 'missing.json' }, /outside acquired allowlist/],
        [{ ...output, location: 'capability.json', version: (await f.acquire('capability.json')).git_blob_sha }, /outside acquired allowlist/],
        [{ ...output, version: '0'.repeat(64) }, /stale or unsupported version/],
        [{ ...output, location: 'scene.md#metadata_selector' }, /unsupported\/stale input excerpt/],
        [{ ...output, location: 'scene.md#L1-L1', version: hash('synthetic fixture only') }, /unsupported\/stale input excerpt/]
      ]) {
        await declare([wrong]); await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), error);
      }
      // Historical outputs absent from this task's context do not require hydration.
      await declare([output, { id: 'unconsumed', location: 'missing-history.json', version: '0'.repeat(64) }]);
      assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
      const mismatched = clone(f.packet); mismatched.inputs.accepted_outputs[0].location = 'input.json';
      await assert.rejects(verifyTaskPacket(mismatched, { root: f.root }), /lacks exact dependency evidence/);
      await writeFile(path.join(f.root, 'scene.md'), 'tampered');
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /source differs from ref/);
      await rm(path.join(f.root, 'scene.md'));
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /ENOENT/);
    } finally { await f.cleanup(); }
  });
  test('excerpt-only manual inputs and accepted outputs retain exact selected-line boundaries', async () => {
    const f = await narrativePrerequisiteFixture(); try {
      const selected = { start_line: 1, end_line: 1, sha256: hash('synthetic fixture only') };
      f.packet.required_acquisition.markdown[1].excerpts = [selected];
      f.packet.allowed_sources[1] = 'scene.md#L1-L1';
      f.packet.input_versions[1] = { id: 'scene', location: 'scene.md#L1-L1', version: selected.sha256 };
      const output = { ...f.receipt.output_versions[0], location: 'scene.md#L1-L1', version: selected.sha256 };
      f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f,
        { ...f.receipt, input_versions: clone(f.packet.input_versions), output_versions: [output] }),
        gate: 'narrative_review', required_qa_codes: ['NQA-FIXTURE'] };
      f.packet.inputs.accepted_outputs = [{ run_id: 'upstream', task_id: 'QA', id: output.id, version: output.version }];
      const binding = await verifyTaskPacket(f.packet, { root: f.root });
      assert.equal(binding.kind, 'manual');
      assert.equal(binding.sources[1].git_blob_sha, f.packet.required_acquisition.markdown[1].git_blob_sha);
      for (const [location, version, error] of [
        ['scene.md', f.packet.required_acquisition.markdown[1].git_blob_sha, /full-file input outside acquired excerpt boundary/],
        ['scene.md#L2-L2', selected.sha256, /unsupported\/stale input excerpt/],
        ['scene.md#L1-L1', '0'.repeat(64), /unsupported\/stale input excerpt/]
      ]) {
        const p = clone(f.packet); p.input_versions[1] = { id: 'scene', location, version };
        await assert.rejects(verifyTaskPacket(p, { root: f.root }), error);
      }
      const staleAcquisition = clone(f.packet); staleAcquisition.required_acquisition.markdown[1].excerpts[0].sha256 = '0'.repeat(64);
      await assert.rejects(verifyTaskPacket(staleAcquisition, { root: f.root }), /stale excerpt/);
      const fullOutput = f.receipt.output_versions[0];
      f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f,
        { ...f.receipt, input_versions: clone(f.packet.input_versions), output_versions: [fullOutput] }),
        gate: 'narrative_review', required_qa_codes: ['NQA-FIXTURE'] };
      f.packet.inputs.accepted_outputs[0].version = fullOutput.version;
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /full-file input outside acquired excerpt boundary/);
    } finally { await f.cleanup(); }
  });
  test('consumed transient accepted output uses actual SHA-only acquired material', async () => {
    const f = await candidateFixture(); try {
      const image = f.packet.required_acquisition.images[0];
      const receipt = JSON.parse(await readFile(path.join(f.root, 'approval.json'), 'utf8'));
      const output = { id: 'candidate', location: image.path, version: `sha256:${image.sha256}` };
      const declare = async (version) => {
        f.packet.preflight_requirements.dependencies[0] = { ...await commitFixtureReceipt(f,
          { ...receipt, output_versions: [{ ...output, version }] }), gate: 'manifest_usability', required_qa_codes: ['MUA-FIXTURE'] };
        f.packet.inputs.accepted_outputs = [{ run_id: 'upstream', task_id: 'QA', id: output.id, version }];
      };
      await declare(output.version); assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
      await declare(f.git('hash-object', image.path));
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /stale dependency transient SHA-256/);
      await declare(`sha256:${'0'.repeat(64)}`);
      await assert.rejects(verifyTaskPacket(f.packet, { root: f.root }), /stale dependency transient SHA-256/);
    } finally { await f.cleanup(); }
  });
  test('multiple acquired excerpts each require an exact selected input identity', async () => {
    const f = await fixture(); try {
      const source = await f.acquire('.ai/WORKFLOW_MANIFEST.yaml');
      const lines = (await readFile(path.join(f.root, source.path), 'utf8')).split('\n');
      source.excerpts = [[1, 2], [3, 4]].map(([start_line, end_line]) => ({ start_line, end_line,
        sha256: hash(lines.slice(start_line - 1, end_line).join('\n')) }));
      f.packet.required_acquisition.markdown = [source];
      f.packet.allowed_sources = source.excerpts.map((part) => `${source.path}#L${part.start_line}-L${part.end_line}`);
      f.packet.input_versions = source.excerpts.map((part, index) => ({ id: `excerpt-${index}`,
        location: f.packet.allowed_sources[index], version: part.sha256 }));
      assert.equal((await verifyTaskPacket(f.packet, { root: f.root })).kind, 'manual');
      for (const index of [0, 1]) {
        const p = clone(f.packet); p.input_versions.splice(index, 1);
        await assert.rejects(verifyTaskPacket(p, { root: f.root }), /missing input version: .*#L/);
      }
    } finally { await f.cleanup(); }
  });

}
