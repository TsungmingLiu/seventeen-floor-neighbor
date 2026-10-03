import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { assertDurableDecision } from './production-storage.mjs';
import { buildPackets, validateRepoSourceCatalog } from './render-cg-packets.mjs';
import { checkSessionCache } from './check-session-cache.mjs';
import { runCheck, diagnostics } from './preflight-review.mjs';
import { defaultRoot, hash, jsonHash, git, safePath, readSafe, writeCache, cliArgs, boundVersion, requireCondition as insist } from './production-task-io.mjs';

const harnessPaths = { content_writer: '.ai/harnesses/content-writer.md', content_qa: '.ai/harnesses/content-qa.md',
  cg_planner: '.ai/harnesses/cg-planner.md', cg_renderer: '.ai/harnesses/cg-renderer.md', integrator: '.ai/harnesses/integrator.md' };
const routes = { narrative_design: ['content_writer', 'narrative_design'], scene_dialogue: ['content_writer', 'scene_dialogue'],
  narrative_review: ['content_qa', 'narrative_review'], cg_plan: ['cg_planner', null], cg_render: ['cg_renderer', null],
  visual_review: ['content_qa', 'visual_review'], integrate: ['integrator', null] };
const mandatory = ['AGENTS.md', '.ai/WORKFLOW_MANIFEST.yaml', '.ai/harnesses/bootstrap.md', '.ai/policies/SOURCE_AUTHORITY.md',
  '.ai/policies/CONTEXT_ISOLATION.md', 'docs/CONTENT_PRODUCTION_SOURCE_MAP.md', '.ai/schemas/HANDOFF.md'];

const transientRoots = ['generated/session-cache/', 'generated/job-artifacts/'];
const transientRoles = ['deterministic_render_packet', 'renderer_capability', 'candidate_original', 'runtime_derivative', 'runtime_screenshot'];
function transientPath(relative) { return transientRoots.some((prefix) => relative.startsWith(prefix)); }
async function inputBytes(root, ref, source) {
  return source.storage === 'transient' ? readSafe(root, source.path) : git(root, 'show', `${ref}:${source.path}`);
}
function validateTransientImage(root, item, bytes) {
  const signatures = { 'image/png': bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    'image/jpeg': bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
    'image/webp': bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' };
  insist(signatures[item.mime_type] && item.filename === path.posix.basename(item.path) && item.source_id && item.role && item.pixels_must_be_visible === true, 'incomplete transient image identity/signature');
  const absolute = path.join(root, item.path);
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height', '-of', 'json', absolute], { encoding: 'utf8', stdio: 'pipe', timeout: 60000 }));
  execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', absolute, '-map', '0:v:0', '-an', '-sn', '-dn', '-f', 'null', '-'], { stdio: 'pipe', timeout: 60000 });
  const stream = probe.streams?.[0];
  insist(stream && stream.width === item.width && stream.height === item.height && stream.codec_name === ({ 'image/png': 'png', 'image/jpeg': 'mjpeg', 'image/webp': 'webp' })[item.mime_type], 'transient image dimension/codec mismatch');
}

export async function sourceIdentities(packet, { root = defaultRoot, checkWorktree = true } = {}) {
  const ref = packet.source_binding?.github?.ref;
  insist(/^[0-9a-f]{40}$/.test(ref || ''), 'packet must pin an immutable source commit');
  git(root, 'cat-file', '-e', `${ref}^{commit}`);
  const manifest = git(root, 'show', `${ref}:.ai/WORKFLOW_MANIFEST.yaml`).toString('utf8');
  const repo = manifest.match(/^    full_name: (.+)$/m)?.[1], url = manifest.match(/^    url: (.+)$/m)?.[1];
  insist(packet.source_binding.github.repository_full_name === repo && packet.source_binding.github.repository_url === url,
    'wrong repository identity');
  insist(packet.workflow_version === manifest.match(/^  version: (.+)$/m)?.[1], 'stale workflow version');
  const route = routes[packet.task_type];
  insist(route && packet.harness === route[0] && packet.pass === route[1], 'wrong harness/pass');
  for (const id of ['run_id', 'task_id']) insist(/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(packet[id] || ''), `invalid ${id}`);
  insist(packet.task_type !== 'integrate' || ['governance_maintenance', 'final', 'narrative_preview'].includes(packet.integration_mode), 'integration mode is required');
  const sources = [], acquisitions = [...(packet.required_acquisition?.markdown || []), ...(packet.required_acquisition?.images || [])];
  insist(Array.isArray(packet.allowed_sources) && Array.isArray(packet.input_versions) && acquisitions.length, 'missing source declarations');
  const seen = new Set();
  for (const allowed of packet.allowed_sources) safePath(allowed, { fragment: true });
  for (const item of acquisitions) {
    safePath(item.path); insist(!seen.has(item.path), `duplicate acquisition: ${item.path}`); seen.add(item.path);
    const excerpts = item.excerpts || [];
    const allowed = excerpts.length ? excerpts.map((part) => `${item.path}#L${part.start_line}-L${part.end_line}`) : [item.path];
    insist(allowed.every((value) => packet.allowed_sources.includes(value)), `unallowlisted acquisition: ${item.path}`);
    const transient = transientPath(item.path);
    let bytes, identity;
    if (transient) {
      insist(transientRoles.includes(item.artifact_role) && !item.git_blob_sha && /^[0-9a-f]{64}$/.test(item.sha256 || '') && !item.excerpts?.length, 'transient source requires explicit artifact role/SHA only');
      insist(!git(root, 'ls-files', '--', item.path).length, 'transient source must not be tracked');
      const image = (packet.required_acquisition.images || []).includes(item);
      insist(image ? ['candidate_original', 'runtime_derivative', 'runtime_screenshot'].includes(item.artifact_role) && ((packet.harness === 'content_qa' && packet.pass === 'visual_review' && packet.review_scope === 'candidate') || (packet.harness === 'integrator' && packet.integration_mode === 'final')) :
        ['deterministic_render_packet', 'renderer_capability'].includes(item.artifact_role) && packet.harness === 'cg_renderer', 'transient artifact role is outside task boundary');
      bytes = await readSafe(root, item.path); identity = { storage: 'transient', artifact_role: item.artifact_role, sha256: hash(bytes), bytes: bytes.length };
      if (image) validateTransientImage(root, item, bytes);
    } else {
      bytes = git(root, 'show', `${ref}:${item.path}`);
      insist(typeof item.git_blob_sha === 'string', `missing Git identity: ${item.path}`);
      identity = { storage: 'git', ...boundVersion(bytes, item.git_blob_sha, item.path) };
    }
    insist(bytes.length, `empty source: ${item.path}`);
    if (item.sha256) insist(identity.sha256 === item.sha256, `tampered SHA: ${item.path}`);
    if (checkWorktree && !transient) insist(bytes.equals(await readSafe(root, item.path)), `source differs from ref: ${item.path}`);
    for (const part of excerpts) {
      const lines = bytes.toString('utf8').split('\n');
      insist(Number.isInteger(part.start_line) && Number.isInteger(part.end_line) && part.start_line >= 1 && part.end_line >= part.start_line && part.end_line <= lines.length,
        `invalid excerpt: ${item.path}`);
      insist(hash(lines.slice(part.start_line - 1, part.end_line).join('\n')) === part.sha256, `stale excerpt: ${item.path}`);
    }
    sources.push({ path: item.path, ...identity, excerpts });
  }
  insist(packet.allowed_sources.every((allowed) => acquisitions.some((item) => (item.excerpts?.length ? item.excerpts.map((part) => `${item.path}#L${part.start_line}-L${part.end_line}`) : [item.path]).includes(allowed))), 'allowed source lacks an acquisition identity');
  // Mandatory context is bound independently; it is not copied into every Task Packet.
  const shared = [];
  for (const relative of [...new Set([...mandatory, harnessPaths[packet.harness]])]) {
    const bytes = git(root, 'show', `${ref}:${relative}`);
    insist(bytes.length, `empty mandatory context: ${relative}`);
    if (checkWorktree) insist(bytes.equals(await readSafe(root, relative)), `mandatory context differs from ref: ${relative}`);
    shared.push({ path: relative, sha256: hash(bytes), git_blob_sha: git(root, 'rev-parse', `${ref}:${relative}`).toString().trim() });
  }
  const tools = [];
  for (const relative of ['tools/production-preflight.mjs', 'tools/production-handoff.mjs', 'tools/production-task-io.mjs', 'tools/context-packet.mjs']) {
    tools.push({ path: relative, sha256: hash(await readFile(new URL(`../${relative}`, import.meta.url))) });
  }
  return { source_ref: ref, sources, shared_instructions: shared, tools, input_versions: packet.input_versions,
    input_digest_sha256: jsonHash(packet.input_versions) };
}

function neededGates(packet) {
  if (packet.integration_mode === 'governance_maintenance') return [];
  return ({ scene_dialogue: ['narrative_design'], cg_plan: ['narrative_review'], cg_render: ['manifest_usability'],
    visual_review: packet.review_scope === 'candidate' ? ['manifest_usability'] : ['narrative_review'],
    integrate: packet.integration_mode === 'final' ? ['narrative_review', 'visual_review', 'accepted_master_image_selection'] : ['narrative_review'] })[packet.task_type] || [];
}
async function manualRequirements(packet, { root, checkWorktree, binding }) {
  const requirements = packet.preflight_requirements;
  insist(requirements?.version === 1 && Array.isArray(requirements.dependencies), 'manual packet requires preflight_requirements v1/dependencies');
  binding.machine_evidence = [];
  const images = (packet.required_acquisition.images || []).filter((image) => !transientPath(image.path));
  if (images.length) {
    const catalogSource = requirements.reference_catalog;
    insist(catalogSource?.path && catalogSource.version, 'manual image task requires exact reference catalog identity');
    safePath(catalogSource.path);
    const bytes = git(root, 'show', `${binding.source_ref}:${catalogSource.path}`);
    const identity = boundVersion(bytes, catalogSource.version, catalogSource.path);
    insist(bytes.equals(await readSafe(root, catalogSource.path)), 'reference catalog differs from ref');
    const catalog = JSON.parse(bytes.toString('utf8')), selected = {};
    for (const image of images) {
      const record = catalog.files?.[image.source_id];
      insist(record && record.sourcePath === image.path && record.name === image.filename && record.mimeType === image.mime_type && record.sha256 === image.sha256 && record.width === image.width && record.height === image.height, 'image catalog identity mismatch');
      selected[image.source_id] = record;
    }
    validateRepoSourceCatalog({ sourceCatalogVersion: catalog.sourceCatalogVersion, provider: catalog.provider, files: selected }, { repoRoot: root });
    binding.machine_evidence.push({ path: catalogSource.path, ...identity });
  }
  const locations = new Set();
  for (const input of packet.input_versions) {
    const relative = safePath(input.location, { fragment: true });
    insist(!locations.has(input.id), 'duplicate input ID'); locations.add(input.id);
    const acquisition = binding.sources.find((source) => source.path === relative);
    insist(acquisition, `input outside acquired allowlist: ${input.location}`);
    const bytes = await inputBytes(root, binding.source_ref, acquisition);
    if (acquisition.storage === 'transient') insist([acquisition.sha256, `sha256:${acquisition.sha256}`].includes(input.version), 'transient input version must be exact SHA-256');
    if (input.location.includes('#')) {
      const fragment = input.location.split('#')[1], excerpt = acquisition.excerpts.find((part) => fragment === `L${part.start_line}-L${part.end_line}`);
      insist(excerpt && input.version === excerpt.sha256, `unsupported/stale input excerpt: ${input.location}`);
    } else boundVersion(bytes, input.version, input.location);
  }
  for (const source of binding.sources) insist(packet.input_versions.some((input) => input.location.split('#')[0] === source.path), `missing input version: ${source.path}`);
  if (packet.inputs?.narrative_contract) {
    const relative = safePath(packet.inputs.narrative_contract);
    insist(binding.sources.some((source) => source.path === relative), 'contract not acquired');
    const contract = JSON.parse(git(root, 'show', `${binding.source_ref}:${relative}`).toString('utf8'));
    insist(contract.scene_id === packet.scene_id && (!packet.inputs.locked_scene || contract.source_scene === packet.inputs.locked_scene), 'wrong scene/contract binding');
  }
  if (packet.integration_mode !== 'governance_maintenance') insist(typeof packet.scene_id === 'string' && packet.scene_id.length, 'manual creative/scene task requires explicit scene ID');
  for (const key of ['locked_scene', 'cg_manifest', 'render_packet']) if (packet.inputs?.[key]) {
    const relative = safePath(packet.inputs[key]);
    insist(binding.sources.some((source) => source.path === relative), `unacquired input: ${key}`);
  }
  if (['scene_dialogue', 'cg_plan'].includes(packet.task_type) || (packet.task_type === 'integrate' && packet.integration_mode !== 'governance_maintenance')) {
    insist(packet.inputs?.narrative_contract && packet.inputs?.locked_scene, 'manual scene task requires explicit acquired contract and Locked Scene');
  }
  if (packet.task_type === 'visual_review') {
    insist(['candidate', 'manifest_usability'].includes(packet.review_scope) && packet.inputs?.cg_manifest && packet.inputs?.cg_entry_id, 'manual visual review requires one explicit manifest entry/scope');
    const manifest = JSON.parse(git(root, 'show', `${binding.source_ref}:${packet.inputs.cg_manifest}`).toString('utf8'));
    const entry = manifest.entries?.find((item) => item.entry_id === packet.inputs.cg_entry_id);
    insist(entry?.scene_id === packet.scene_id, 'wrong visual review scene/entry');
    if (packet.review_scope === 'candidate') insist(packet.required_acquisition.images.some((image) => image.source_id === packet.inputs.candidate_source_id && image.role === 'candidate'), 'manual candidate review requires explicit acquired candidate');
  }
  const dependencyGates = new Set();
  for (const dependency of requirements.dependencies) {
    safePath(dependency.receipt); insist(dependency.run_id && dependency.task_id && dependency.gate, 'incomplete dependency');
    const bytes = git(root, 'show', `${binding.source_ref}:${dependency.receipt}`);
    const receiptIdentity = boundVersion(bytes, dependency.version, dependency.receipt);
    binding.machine_evidence.push({ path: dependency.receipt, ...receiptIdentity });
    if (checkWorktree) insist(bytes.equals(await readSafe(root, dependency.receipt)), 'dependency receipt differs from ref');
    const receipt = JSON.parse(bytes.toString('utf8'));
    if (receipt.schema_version === '2.0.0') assertDurableDecision(receipt, bytes);
    insist(receipt.run_id === dependency.run_id && receipt.task_id === dependency.task_id && (receipt.status === 'PASS' || (dependency.gate === 'accepted_master_image_selection' && receipt.status === 'HUMAN_ACCEPTED_AS_IS')) &&
      (!packet.scene_id || receipt.scene_id === packet.scene_id), 'dependency approval is absent or wrong scene/task');
    insist(Array.isArray(dependency.input_versions) && dependency.input_versions.length &&
      jsonHash(receipt.input_versions) === jsonHash(dependency.input_versions), 'stale dependency QA input versions');
    for (const version of dependency.input_versions) {
      const relative = safePath(version.location, { fragment: true });
      const current = git(root, 'show', `${binding.source_ref}:${relative}`);
      if (version.location.includes('#')) {
        const range = version.location.split('#')[1].match(/^L([0-9]+)-L([0-9]+)$/);
        insist(range, 'unsupported dependency identity selector');
        const lines = current.toString('utf8').split('\n'), start = Number(range[1]), end = Number(range[2]);
        insist(start >= 1 && end >= start && end <= lines.length && hash(lines.slice(start - 1, end).join('\n')) === version.version, 'stale dependency QA excerpt');
      } else boundVersion(current, version.version, 'stale dependency QA source');
      const consuming = packet.input_versions.filter((input) => input.location === version.location);
      insist(!consuming.length || consuming.some((input) => input.version === version.version), 'QA inputs do not cover current inputs');
    }
    if (dependency.gate === 'accepted_master_image_selection') insist(receipt.evidence_purpose === 'human_decision' && receipt.task_type === 'human_decision' && receipt.human_gate_required === dependency.gate, 'missing Human approval');
    else {
      const codes = receipt.qa_codes;
      insist(Array.isArray(codes) && codes.length && codes.every((check) => check.result === 'PASS') && Array.isArray(dependency.required_qa_codes) && dependency.required_qa_codes.length && dependency.required_qa_codes.every((code) => codes.some((check) => check.code === code && check.result === 'PASS')), 'missing dependency QA outcome');
      if (['narrative_review', 'visual_review', 'manifest_usability'].includes(dependency.gate)) insist(receipt.harness?.id === 'content_qa' && receipt.harness.pass === (dependency.gate === 'narrative_review' ? 'narrative_review' : 'visual_review') && dependency.required_qa_codes.every((code) => code.startsWith(dependency.gate === 'manifest_usability' ? 'MUA-' : dependency.gate === 'narrative_review' ? 'NQA-' : 'VQA-')), 'dependency QA scope mismatch');
    }
    if (dependency.output_versions) insist(jsonHash(receipt.output_versions) === jsonHash(dependency.output_versions), 'dependency output versions mismatch');
    dependencyGates.add(dependency.gate);
  }
  for (const accepted of packet.inputs?.accepted_outputs || []) insist(requirements.dependencies.some((dependency) => dependency.run_id === accepted.run_id && dependency.task_id === accepted.task_id && dependency.output_versions?.some((output) => output.id === accepted.id && output.version === accepted.version)), 'accepted output lacks exact dependency evidence');
  for (const gate of neededGates(packet)) insist(dependencyGates.has(gate), `missing required dependency approval: ${gate}`);
  for (const task of packet.depends_on || []) insist(requirements.dependencies.some((dependency) => dependency.run_id === packet.run_id && dependency.task_id === task), `unverified dependency: ${task}`);
  if (packet.harness === 'cg_renderer') {
    insist(packet.inputs?.cg_entry_id && !packet.inputs.cg_entry_ids && !packet.inputs.locked_scene && !packet.inputs.narrative_contract && packet.inputs.cg_manifest && packet.inputs.render_packet, 'manual renderer supports one manifest entry/packet only');
    const capability = requirements.renderer;
    const references = packet.required_acquisition.images || [];
    insist(capability?.adapter && typeof capability.capability_source === 'string' && Number.isInteger(capability.max_reference_images) && capability.max_reference_images >= 1,
      'missing renderer max-reference capability');
    insist(references.length > 0 && references.length <= capability.max_reference_images, 'renderer reference limit exceeded or references absent');
    insist(new Set(references.map((item) => item.source_id)).size === references.length && references.every((item) => item.role && item.source_id && item.filename === path.posix.basename(item.path) && item.mime_type && item.sha256 && item.pixels_must_be_visible === true), 'incomplete renderer reference metadata');
    insist(Array.isArray(packet.inputs?.references) && jsonHash([...packet.inputs.references].sort()) === jsonHash(references.map((item) => item.source_id).sort()), 'renderer declared reference mismatch');
    const manifest = JSON.parse(git(root, 'show', `${binding.source_ref}:${packet.inputs.cg_manifest}`).toString('utf8'));
    const [projected] = buildPackets(manifest, { entryIds: [packet.inputs.cg_entry_id], statuses: ['render_ready', 'accepted'] });
    const entry = manifest.entries.find((item) => item.entry_id === packet.inputs.cg_entry_id);
    insist(entry.scene_id === packet.scene_id, 'wrong renderer scene/entry');
    const actualPacket = JSON.parse((await inputBytes(root, binding.source_ref, binding.sources.find((source) => source.path === packet.inputs.render_packet))).toString('utf8'));
    insist(jsonHash(actualPacket) === jsonHash(projected), 'deterministic render packet mismatch');
    const declared = projected.reference_transport.attachments;
    insist(declared.length === references.length && declared.every((attachment) => references.some((reference) => reference.source_id === attachment.source_id && reference.role === attachment.role && reference.filename === attachment.expected_filename)), 'render entry reference mismatch');
    const sourceAcquisition = packet.required_acquisition.markdown.find((source) => source.path === packet.inputs.cg_manifest);
    if (manifest.entries.length > 1) {
      insist(sourceAcquisition?.excerpts?.length, 'multi-entry manifest requires selected entry excerpts');
      const lines = git(root, 'show', `${binding.source_ref}:${packet.inputs.cg_manifest}`).toString('utf8').split('\n');
      const selected = sourceAcquisition.excerpts.map((part) => lines.slice(part.start_line - 1, part.end_line).join('\n')).join('\n');
      const ids = [...selected.matchAll(/"entry_id"\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
      insist(ids.length === 1 && ids[0] === packet.inputs.cg_entry_id, 'renderer excerpts include unrelated or missing entries');
    }
    const capabilityPath = safePath(capability.capability_source);
    const source = binding.sources.find((item) => item.path === capabilityPath);
    insist(source, 'renderer capability evidence is not acquired');
    const evidence = JSON.parse((await inputBytes(root, binding.source_ref, source)).toString('utf8'));
    insist(evidence.adapter === capability.adapter && evidence.max_reference_images === capability.max_reference_images, 'renderer capability evidence mismatch');
  }
  const displayNeeded = packet.integration_mode === 'final' || requirements.display_profiles_required === true;
  if (displayNeeded) {
    const profiles = requirements.display_profiles;
    insist(Array.isArray(profiles) && profiles.length, 'missing approved display profiles');
    for (const kind of ['desktop', 'mobile_landscape', 'mobile_portrait']) insist(profiles.some((profile) => profile.kind === kind), `missing required display profile: ${kind}`);
    insist(new Set(profiles.map((profile) => profile.id)).size === profiles.length, 'duplicate display profile ID');
    const profileSource = requirements.display_profiles_source;
    insist(profileSource?.path && profileSource.version, 'missing canonical display profile source identity');
    const relative = safePath(profileSource.path);
    insist(binding.sources.some((source) => source.path === relative), 'display profiles source is not acquired');
    const bytes = git(root, 'show', `${binding.source_ref}:${relative}`);
    boundVersion(bytes, profileSource.version, relative);
    const evidence = JSON.parse(bytes.toString('utf8'));
    insist(Array.isArray(evidence.display_profiles), 'canonical source has no structured display profiles');
    for (const profile of profiles) {
      insist(profile.id && ['desktop', 'mobile_landscape', 'mobile_portrait'].includes(profile.kind) &&
        Number.isFinite(profile.width) && profile.width > 0 && Number.isFinite(profile.height) && profile.height > 0 && Number.isFinite(profile.dpr) && profile.dpr > 0 &&
        profile.orientation === (profile.width >= profile.height ? 'landscape' : 'portrait') && (profile.kind === 'mobile_portrait' ? profile.orientation === 'portrait' : profile.orientation === 'landscape'), 'invalid display profile');
      insist(evidence.display_profiles.some((approved) => jsonHash(approved) === jsonHash(profile)), 'display profile projection differs from canonical source');
    }
  }
}

export async function verifyTaskPacket(packet, { root = defaultRoot, kind, expectedScene, checkWorktree = true } = {}) {
  const generatedType = packet.task_type === 'narrative_review' || (packet.task_type === 'cg_plan' && packet.scene_id === 'COM-00') ||
    (packet.task_type === 'visual_review' && ((packet.review_scope === 'manifest_usability' && packet.scene_id === 'COM-00') ||
      (packet.review_scope === 'candidate' && packet.inputs?.cg_entry_id === 'COM00-S04-BASE-NEUTRAL')));
  kind ||= packet.preflight_requirements ? 'manual' : 'generated';
  insist(['manual', 'generated'].includes(kind), 'invalid packet kind');
  if (expectedScene) insist(packet.scene_id === expectedScene, 'wrong dispatched scene');
  const binding = await sourceIdentities(packet, { root, checkWorktree });
  if (generatedType) {
    insist(checkWorktree, 'generated packet requires unchanged checkout and supported generator');
    const module = await import('./context-packet.mjs');
    const verifier = packet.task_type === 'narrative_review' ? module.verifyNarrativeReviewPacket : packet.task_type === 'cg_plan' ? module.verifyCgPlanPacket :
      packet.review_scope === 'manifest_usability' ? module.verifyManifestUsabilityPacket : packet.review_scope === 'candidate' ? module.verifyCandidateVisualReviewPacket : null;
    insist(verifier, 'unsupported generated review scope'); await verifier(packet, { root });
    if (kind === 'manual') await manualRequirements(packet, { root, checkWorktree, binding });
  } else {
    insist(kind === 'manual' && packet.packet_origin === 'manual-v1', 'unsupported generated route; explicit manual-v1 origin required');
    await manualRequirements(packet, { root, checkWorktree, binding });
  }
  return { ...binding, kind };
}

export async function preflightProduction({ root = defaultRoot, packetPath, kind, expectedScene } = {}) {
  const stages = []; let stage = 'cache';
  const report = { version: 1, dispatch_allowed: false, status: 'BLOCKED', semantic_qa: 'NOT_RUN', pixels_verified: false, production_approval: false, stages };
  try {
    await checkSessionCache(root); stage = 'packet';
    const bytes = await readSafe(root, packetPath, { cache: true, maxBytes: 1024 * 1024 });
    const packet = JSON.parse(bytes.toString('utf8'));
    if (packet.scene_id && packet.integration_mode !== 'governance_maintenance') insist(expectedScene, 'scene-scoped dispatch requires --scene to bind Coordinator intent');
    report.binding = { packet_sha256: hash(bytes), ...await verifyTaskPacket(packet, { root, kind, expectedScene }) };
    stages.push({ id: stage, status: 'PASS' });
    for (const [id, script] of [['content', 'tools/validate-content.mjs'], ['production', 'tools/validate-production-contracts.mjs']]) {
      stage = id; const result = await runCheck(root, script);
      stages.push({ id, status: result.ok ? 'PASS' : 'BLOCKED', script_sha256: hash(await readFile(path.join(root, script))),
        log_sha256: hash(`${result.stdout}\n${result.stderr}`), log: { stdout: result.stdout, stderr: result.stderr }, diagnostics: diagnostics(result.ok ? '' : result.stderr || result.stdout) });
      if (!result.ok) return report;
    }
    report.dispatch_allowed = true; report.status = 'DISPATCH_ALLOWED';
  } catch (error) { stages.push({ id: stage, status: 'BLOCKED', diagnostics: diagnostics(error.message) }); }
  return report;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = cliArgs(process.argv.slice(2), ['--packet', '--kind', '--scene', '--out']);
    insist(args.out, 'preflight requires --out <new cache report>');
    const report = await preflightProduction({ packetPath: args.packet, kind: args.kind, expectedScene: args.scene });
    if (args.out) await writeCache(defaultRoot, args.out, report);
    console.log(JSON.stringify({ status: report.status, dispatch_allowed: report.dispatch_allowed, semantic_qa: report.semantic_qa,
      production_approval: false, packet_sha256: report.binding?.packet_sha256, report: args.out || null,
      blocked: report.stages.find((stage) => stage.status === 'BLOCKED') }));
    if (!report.dispatch_allowed) process.exitCode = 1;
  } catch (error) { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; }
}
