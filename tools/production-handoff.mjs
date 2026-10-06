import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { imageMagic } from './render-cg-packets.mjs';
import { fileURLToPath } from 'node:url';
import { sourceIdentities, verifyTaskPacket } from './production-preflight.mjs';
import { defaultRoot, hash, jsonHash, git, isImage, imageVersion, requireImageVersion, normalizeVersions, readSafe, readJson, writeCache, safePath, cliArgs, boundVersion, matchesAllowlist, requireCondition as insist } from './production-task-io.mjs';

const statuses = ['PASS', 'NEEDS_REVIEW', 'BLOCKED', 'FAIL'];
const versionEqual = (a, b) => jsonHash(a) === jsonHash(b);
async function packetBinding(root, packetPath) {
  const bytes = await readSafe(root, packetPath, { cache: true, maxBytes: 1024 * 1024 });
  const packet = JSON.parse(bytes.toString('utf8'));
  // Review workers cannot mutate their inputs; engineering outputs may overlap inputs.
  const checkWorktree = packet.task_type !== 'integrate' && packet.task_type !== 'scene_dialogue' && packet.task_type !== 'narrative_design';
  let binding;
  if (!packet.preflight_requirements && !['narrative_review', 'cg_plan', 'visual_review'].includes(packet.task_type)) {
    // Legacy dispatched manual packets remain verifiable returns; this path cannot dispatch.
    binding = { ...await sourceIdentities(packet, { root, checkWorktree: false }), kind: 'legacy-manual-return' };
    for (const input of packet.input_versions) {
      safePath(input.location);
      insist(binding.sources.some((source) => source.path === input.location), 'legacy manual input lacks acquired identity');
      const source = binding.sources.find((item) => item.path === input.location);
      if (isImage(input.location, source.media_type || '')) { requireImageVersion(input.version, input.location, source.ref); continue; }
      if (source.storage === 'transient') insist([source.sha256, `sha256:${source.sha256}`].includes(input.version), 'legacy transient input version must be exact SHA-256');
      else boundVersion(git(root, 'show', `${binding.source_ref}:${input.location}`), input.version, input.location);
    }
  } else binding = await verifyTaskPacket(packet, { root, checkWorktree });
  return { packet, binding, packet_sha256: hash(bytes) };
}
function harnessVersion(packet, root) {
  const filename = { content_writer: 'content-writer', content_qa: 'content-qa', cg_planner: 'cg-planner', cg_renderer: 'cg-renderer', integrator: 'integrator' }[packet.harness];
  const text = git(root, 'show', `${packet.source_binding.github.ref}:.ai/harnesses/${filename}.md`).toString('utf8');
  const version = text.match(/^Version: ([0-9.]+)$/m)?.[1]; insist(version, 'harness version missing'); return version;
}
function usedIdentity(source, packet, binding) {
  const input = packet.input_versions.find((item) => source === item.id || source === item.location);
  if (input) return { source, version: isImage(input.location, binding.sources.find((item) => item.path === input.location)?.media_type || '') ? imageVersion(input.location, binding.sources.find((item) => item.path === input.location)?.ref || binding.source_ref) : input.version };
  const shared = binding.shared_instructions.find((item) => source === item.path);
  if (shared) return { source, version: shared.git_blob_sha };
  throw new Error(`used source does not match packet or mandatory context: ${source}`);
}
function checkFacts(facts, packet, binding) {
  insist(statuses.includes(facts.status), 'worker must explicitly supply actual status');
  insist(Array.isArray(facts.inputs_used), 'worker must explicitly supply actual used sources');
  const seen = new Set();
  for (const used of facts.inputs_used) {
    insist(!seen.has(used.source), 'duplicate used source'); seen.add(used.source);
    const identity = usedIdentity(used.source, packet, binding);
    const input = packet.input_versions.find((item) => used.source === item.id || used.source === item.location);
    if (input && isImage(input.location, binding.sources.find((item) => item.path === input.location)?.media_type || '')) requireImageVersion(used.version, input.location, binding.sources.find((item) => item.path === input.location)?.ref || binding.source_ref);
    else insist(identity.version === used.version, `used source does not match packet: ${used.source}`);
  }
  insist(facts.qa && Array.isArray(facts.qa.checks) && facts.qa.checks.every((check) => typeof check.name === 'string' && check.name && ['PASS', 'FAIL', 'NOT_RUN', 'BLOCKED', 'NEEDS_REVIEW'].includes(check.result)), 'worker must supply QA facts');
  insist(facts.status !== 'PASS' || (!facts.qa.checks.some((check) => ['FAIL', 'BLOCKED', 'NEEDS_REVIEW'].includes(check.result)) && !facts.qa.failure_reason), 'PASS conflicts with reported failures');
  insist(Array.isArray(facts.outputs), 'worker must explicitly supply outputs');
  insist(facts.status !== 'PASS' || facts.outputs.length > 0, 'PASS requires actual outputs');
  insist(Array.isArray(facts.attachments_used || []), 'invalid attachment facts');
  for (const attachment of facts.attachments_used || []) {
    insist(packet.required_acquisition.images.some((image) => image.path === attachment.canonical_source && image.role === attachment.role && image.filename === attachment.observed_filename) && typeof attachment.pixels_verified === 'boolean', 'attachment facts mismatch');
  }
}
async function outputIdentities(outputs, packet, root) {
  const seen = new Set();
  return Promise.all(outputs.map(async (output) => {
    safePath(output.location);
    insist(output.id && !seen.has(output.id), 'missing/duplicate output ID'); seen.add(output.id);
    const allowed = packet.write_allowlist ? matchesAllowlist(output.location, packet.write_allowlist) :
      packet.deliverables?.some((deliverable) => deliverable.id === output.id && deliverable.destination === output.location);
    insist(allowed, `unallowlisted output: ${output.location}`);
    const bytes = await readSafe(root, output.location);
    insist(bytes.length, `empty output: ${output.location}`);
    const mime = imageMagic(bytes);
    const image = Boolean(mime) || isImage(output.location, output.mime_type || '');
    if (image) {
      insist(!output.ref || output.ref === 'WORKTREE', 'local image output ref must be WORKTREE');
      insist(mime && (!output.mime_type || mime === output.mime_type), 'invalid output image MIME');
      execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', path.join(root, output.location), '-map', '0:v:0', '-an', '-sn', '-dn', '-f', 'null', '-'], { stdio: 'pipe', timeout: 60000 });
    }
    return image ? { id: output.id, location: output.location, version: imageVersion(output.location, 'WORKTREE'), mime_type: mime } : { id: output.id, location: output.location, version: `sha256:${hash(bytes)}`, bytes: bytes.length };
  }));
}
export async function generateHandoff({ root = defaultRoot, packetPath, facts, bindingPath } = {}) {
  insist(bindingPath, 'compact handoff requires an exact cache binding path'); safePath(bindingPath, { cache: true });
  const { packet, binding, packet_sha256 } = await packetBinding(root, packetPath);
  facts = { ...facts, inputs_used: Array.isArray(facts?.inputs_used) ? facts.inputs_used.map((used) => {
    if (typeof used === 'string') return usedIdentity(used, packet, binding);
    const input = packet.input_versions.find((item) => used.source === item.id || used.source === item.location);
    if (input && isImage(input.location, binding.sources.find((item) => item.path === input.location)?.media_type || '')) {
      requireImageVersion(used.version, input.location, binding.sources.find((item) => item.path === input.location)?.ref || binding.source_ref);
      return usedIdentity(used.source, packet, binding);
    }
    return used;
  }) : facts?.inputs_used };
  checkFacts(facts, packet, binding);
  const output_versions = await outputIdentities(facts.outputs, packet, root);
  const inputBinding = { version: 1, packet_sha256, ...binding };
  const handoff = { format: 'production-handoff-compact-v1', run_id: packet.run_id, task_id: packet.task_id,
    status: facts.status, workflow_version: packet.workflow_version,
    harness: { id: packet.harness, version: harnessVersion(packet, root), pass: packet.pass },
    ...(packet.integration_mode ? { integration_mode: packet.integration_mode } : {}),
    input_binding: { location: bindingPath, sha256: jsonHash(inputBinding), packet_sha256, input_digest_sha256: binding.input_digest_sha256 },
    inputs_used: facts.inputs_used, attachments_used: facts.attachments_used || [],
    outputs: facts.outputs.map((output, index) => ({ id: output.id, location: output.location, description: output.description || '', ...(output_versions[index].mime_type ? { ref: 'WORKTREE', mime_type: output_versions[index].mime_type } : {}), source_identity: output_versions[index].version })),
    output_versions, qa: facts.qa, canon_changes: facts.canon_changes || { none: true }, known_issues: facts.known_issues || [],
    invalidates: facts.invalidates || [], next_recommended_stage: facts.next_recommended_stage || null,
    human_gate_required: packet.human_gate };
  return { handoff, inputBinding };
}
export async function verifyHandoff({ root = defaultRoot, packetPath, handoff } = {}) {
  const { packet, binding, packet_sha256 } = await packetBinding(root, packetPath);
  insist(handoff.run_id === packet.run_id && handoff.task_id === packet.task_id && handoff.workflow_version === packet.workflow_version &&
    handoff.harness?.id === packet.harness && handoff.harness?.pass === packet.pass && handoff.harness?.version === harnessVersion(packet, root), 'Handoff packet/harness identity mismatch');
  insist(!packet.integration_mode || handoff.integration_mode === packet.integration_mode, 'integration mode mismatch');
  insist(handoff.human_gate_required === packet.human_gate, 'Human gate mismatch');
  checkFacts(handoff, packet, binding);
  if (handoff.format === 'production-handoff-compact-v1') {
    const stored = await readJson(root, handoff.input_binding?.location);
    const expected = { version: 1, packet_sha256, ...binding };
    insist(versionEqual(stored, expected) && jsonHash(stored) === handoff.input_binding.sha256 &&
      handoff.input_binding.packet_sha256 === packet_sha256 && handoff.input_binding.input_digest_sha256 === binding.input_digest_sha256, 'compact source/packet/input binding mismatch');
  } else {
    insist(!handoff.format && !handoff.input_binding, 'unknown Handoff format');
    insist(versionEqual(normalizeVersions(handoff.input_versions, binding.sources, binding.source_ref), normalizeVersions(packet.input_versions, binding.sources, binding.source_ref)), 'legacy full input versions mismatch');
  }
  const actual = await outputIdentities(handoff.outputs, packet, root);
  insist(Array.isArray(handoff.output_versions) && handoff.output_versions.length === actual.length, 'missing output versions');
  for (const output of actual) {
    const recorded = handoff.output_versions.find((item) => item.id === output.id && item.location === output.location);
    const image = isImage(output.location, output.mime_type || '');
    if (image && recorded?.mime_type) insist(recorded.mime_type === output.mime_type, 'output recorded MIME mismatch');
    insist(recorded && (image || recorded.bytes === undefined || recorded.bytes === output.bytes), 'output bytes/version mismatch');
    if (image) requireImageVersion(recorded.version, output.location, handoff.outputs.find((item) => item.id === output.id)?.ref || 'WORKTREE');
    else boundVersion(await readSafe(root, output.location), recorded.version, 'output bytes/version mismatch');
    const declared = handoff.outputs.find((item) => item.id === output.id);
    if (image) requireImageVersion(declared.source_identity, output.location, declared.ref || 'WORKTREE');
    if (!image && handoff.format === 'production-handoff-compact-v1') insist(declared.source_identity === recorded.version, 'output source identity mismatch');
  }
  // Integrity verification records the worker outcome; it never changes status or grants a gate.
  return { verified: true, status: handoff.status, run_id: packet.run_id, task_id: packet.task_id, packet_sha256,
    input_digest_sha256: binding.input_digest_sha256, output_versions: actual, human_gate_required: packet.human_gate, production_approval: false };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = cliArgs(process.argv.slice(2), ['--packet', '--facts', '--out', '--binding', '--verify']);
    if (args.verify) {
      insist(!args.facts && !args.out && !args.binding, 'verify cannot generate artifacts');
      const report = await verifyHandoff({ packetPath: args.packet, handoff: await readJson(defaultRoot, args.verify) });
      console.log(JSON.stringify({ verified: report.verified, status: report.status, task_id: report.task_id,
        packet_sha256: report.packet_sha256, input_digest_sha256: report.input_digest_sha256, output_count: report.output_versions.length, production_approval: false }));
    } else {
      insist(args.out && args.binding && args.out !== args.binding && args.out !== args.packet && args.binding !== args.packet, 'distinct cache output/binding paths required');
      const result = await generateHandoff({ packetPath: args.packet, facts: await readJson(defaultRoot, args.facts), bindingPath: args.binding });
      await writeCache(defaultRoot, args.binding, result.inputBinding); await writeCache(defaultRoot, args.out, result.handoff);
      console.log(JSON.stringify({ handoff: args.out, status: result.handoff.status, input_digest_sha256: result.handoff.input_binding.input_digest_sha256, output_count: result.handoff.outputs.length, production_approval: false }));
    }
  } catch (error) { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; }
}
