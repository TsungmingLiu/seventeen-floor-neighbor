import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectRoot } from './content-lib.mjs';
import { buildNarrativeReviewPacket, verifyNarrativeReviewPacket,
  buildManifestUsabilityPacket, verifyManifestUsabilityPacket } from './context-packet.mjs';

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
}

function safeName(value) {
  requireCondition(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value || ''), `invalid run ID: ${value}`);
  return value;
}

function versionListEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function committedJson(root, relative) {
  const bytes = await readFile(path.join(root, relative));
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  requireCondition(git(root, 'rev-parse', `HEAD:${relative}`) === blob,
    `decision source differs from committed HEAD: ${relative}`);
  return JSON.parse(bytes);
}

export function versionIdentity(item) {
  return { id: item.id, version: item.version,
    // Excerpt line numbers may shift when an unrelated entry is edited.
    location: item.location.replace(/#L\d+-L\d+$/, '#excerpt') };
}

async function verifyManifestUsabilityRun({ runId, root, ledger, task, sourceRoot, requireCurrent }) {
  requireCondition(task.scene_id === 'COM-00' && task.review_scope === 'manifest_usability' &&
    task.task_type === 'visual_review' && task.task_id === 'MUA-COM00-001' &&
    Array.isArray(task.depends_on) && task.depends_on.length === 0 &&
    task.packet?.generator === 'tools/context.mjs:manifest_usability' &&
    task.upstream_run_id === 'issue16-com00-nqa-20260926' &&
    task.upstream_task_id === 'NQA-COM00-001' &&
    Array.isArray(task.entry_ids) && task.entry_ids.length === 3 &&
    new Set(task.entry_ids).size === 3 && task.human_gate === 'none',
  'unsupported or malformed manifest usability task');
  let temporary;
  let packetRoot = sourceRoot ?? root;
  try {
    if (!sourceRoot && git(root, 'rev-parse', 'HEAD') !== ledger.source_ref) {
      temporary = await mkdtemp(path.join(os.tmpdir(), 'manifest-usability-source-'));
      packetRoot = path.join(temporary, 'source');
      git(root, 'worktree', 'add', '--detach', packetRoot, ledger.source_ref);
    }
    const packet = await buildManifestUsabilityPacket({ sceneId: task.scene_id,
      runId, taskId: task.task_id, ref: ledger.source_ref,
      upstreamRunId: task.upstream_run_id, upstreamTaskId: task.upstream_task_id,
      entryIds: task.entry_ids, root: packetRoot });
    await verifyManifestUsabilityPacket(packet, { root: packetRoot });
    const packetSha256 = sha256(`${JSON.stringify(packet, null, 2)}\n`);
    requireCondition(packetSha256 === task.packet.sha256 &&
      versionListEqual(packet.input_versions, task.input_versions),
    'manifest usability packet hash or recorded input identities differ');
    if (task.status === 'RUNNING' && task.decision_receipt === null) {
      return { run_id: runId, source_ref: ledger.source_ref, packet_sha256: packetSha256,
        task_id: task.task_id, task_status: 'ORPHAN_RUNNING_REVIEW_REQUIRED', run_status: ledger.status,
        next_action: 'dispatch fresh bounded manifest usability QA; no PASS evidence' };
    }
    requireCondition(task.status === 'PASS' && ledger.status === 'ACTIVE' &&
      task.decision_receipt === `content/production/runs/${runId}/${task.task_id}.decision.json`,
    'manifest usability run has no verified PASS decision receipt');
    const receipt = await committedJson(root, task.decision_receipt);
    const selected = packet.input_versions.filter((item) => item.id.startsWith('manifest-entry:'));
    const output = { id: `manifest-usability-qa:${task.scene_id}`,
      version: sha256(JSON.stringify(selected.map(({ id, version }) => ({ id, version })))),
      location: `${packet.inputs.cg_manifest}#${task.scene_id}` };
    requireCondition(receipt.schema_version === '1.0.0' && receipt.run_id === runId &&
      receipt.task_id === task.task_id && receipt.scene_id === task.scene_id &&
      receipt.status === 'PASS' && receipt.review_scope === task.review_scope &&
      receipt.harness?.id === 'content_qa' && receipt.harness?.pass === 'visual_review' &&
      receipt.packet_sha256 === packetSha256 &&
      versionListEqual(receipt.input_versions, task.input_versions) &&
      receipt.input_digest_sha256 === sha256(JSON.stringify(task.input_versions)) &&
      receipt.human_gate_required === 'none' && Array.isArray(receipt.qa_codes) &&
      receipt.qa_codes.length > 0 && receipt.qa_codes.every(({ result, code }) =>
        result === 'PASS' && /^MUA-[A-Z0-9-]+$/.test(code)) &&
      versionListEqual(task.output_versions, [output]) &&
      versionListEqual(receipt.output_versions, [output]) &&
      /^[0-9a-f]{64}$/.test(receipt.worker_handoff_sha256) &&
      Array.isArray(receipt.invalidates) && receipt.invalidates.length === 0,
    'manifest usability decision receipt conflicts with QA, packet, or selected output versions');
    if (!sourceRoot || requireCurrent) {
      const current = await buildManifestUsabilityPacket({ sceneId: task.scene_id,
        runId, taskId: task.task_id, ref: git(root, 'rev-parse', 'HEAD'),
        upstreamRunId: task.upstream_run_id, upstreamTaskId: task.upstream_task_id,
        entryIds: task.entry_ids, root });
      requireCondition(versionListEqual(current.input_versions.map(versionIdentity),
        packet.input_versions.map(versionIdentity)),
      'reviewed manifest usability inputs differ from current committed content');
    }
    return { run_id: runId, source_ref: ledger.source_ref, packet_sha256: packetSha256,
      task_id: task.task_id, task_status: sourceRoot && !requireCurrent ? 'RECORDED_PASS' : 'CURRENT_PASS',
      run_status: ledger.status, qa_codes: receipt.qa_codes.map(({ code }) => code),
      next_action: 'manifest usability QA is complete; candidate Visual QA and Human gates remain independent' };
  } finally {
    if (temporary) {
      try { git(root, 'worktree', 'remove', '--force', packetRoot); } finally {
        await rm(temporary, { recursive: true, force: true });
      }
    }
  }
}

export async function verifyProductionRun(runId, { root = projectRoot, sourceRoot, requireCurrent = false } = {}) {
  safeName(runId);
  const ledgerPath = `content/production/runs/${runId}/ledger.json`;
  const ledger = await committedJson(root, ledgerPath);
  requireCondition(ledger.schema_version === '1.3.0' && ledger.run_id === runId &&
    /^[0-9a-f]{40}$/.test(ledger.source_ref) &&
    Array.isArray(ledger.tasks) && ledger.tasks.length === 1,
  'invalid production run ledger identity or task count');
  const task = ledger.tasks[0];
  if (sourceRoot !== undefined) {
    sourceRoot = path.resolve(sourceRoot);
    const targetRoot = await realpath(root);
    const historicalRoot = await realpath(sourceRoot);
    requireCondition(targetRoot !== historicalRoot, 'historical sourceRoot must be separate from target root');
    requireCondition(git(sourceRoot, 'rev-parse', 'HEAD') === ledger.source_ref,
      'historical sourceRoot HEAD differs from ledger source_ref');
    let symbolicHead = '';
    try { symbolicHead = git(sourceRoot, 'symbolic-ref', '-q', 'HEAD'); } catch { /* detached HEAD */ }
    requireCondition(!symbolicHead, 'historical sourceRoot must be a detached checkout');
  }
  const packetRoot = sourceRoot ?? root;
  if (task.task_type === 'visual_review') return verifyManifestUsabilityRun({
    runId, root, ledger, task, sourceRoot, requireCurrent });
  requireCondition(task.task_type === 'narrative_review' &&
    /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(task.scene_id || '') &&
    /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(task.task_id || '') &&
    Array.isArray(task.depends_on) && task.depends_on.length === 0 &&
    task.packet?.generator === 'tools/context.mjs:narrative_review' &&
    task.human_gate === 'none', 'unsupported or malformed bounded task');
  const packet = await buildNarrativeReviewPacket({
    sceneId: task.scene_id, runId, taskId: task.task_id, ref: ledger.source_ref, root: packetRoot
  });
  await verifyNarrativeReviewPacket(packet, { root: packetRoot });
  const packetSha256 = sha256(`${JSON.stringify(packet, null, 2)}\n`);
  requireCondition(packetSha256 === task.packet.sha256 &&
    versionListEqual(packet.input_versions, task.input_versions),
  'packet hash or recorded input identities differ');

  if (task.status === 'RUNNING' && task.decision_receipt === null) {
    return { run_id: runId, source_ref: ledger.source_ref, packet_sha256: packetSha256,
      task_id: task.task_id, task_status: 'ORPHAN_RUNNING_REVIEW_REQUIRED', run_status: ledger.status,
      next_action: 'regenerate packet and dispatch fresh bounded Narrative QA; no PASS evidence' };
  }
  requireCondition(task.status === 'PASS' && ledger.status === 'ACTIVE' &&
    task.decision_receipt === `content/production/runs/${runId}/${task.task_id}.decision.json`,
  'run has no verified PASS decision receipt');
  const receipt = await committedJson(root, task.decision_receipt);
  requireCondition(receipt.schema_version === '1.0.0' && receipt.run_id === runId &&
    receipt.task_id === task.task_id && receipt.scene_id === task.scene_id &&
    receipt.status === 'PASS' && receipt.harness?.id === 'content_qa' &&
    receipt.harness?.pass === 'narrative_review' &&
    receipt.packet_sha256 === packetSha256 &&
    versionListEqual(receipt.input_versions, task.input_versions) &&
    receipt.input_digest_sha256 === sha256(JSON.stringify(task.input_versions)) &&
    receipt.human_gate_required === 'none' && Array.isArray(receipt.qa_codes) &&
    receipt.qa_codes.length > 0 && receipt.qa_codes.every(({ result, code }) =>
      result === 'PASS' && /^[A-Z][A-Z0-9_-]+$/.test(code)) &&
    versionListEqual(receipt.output_versions, task.output_versions) &&
    receipt.output_versions.length === 1 &&
    Array.isArray(receipt.invalidates) && receipt.invalidates.length === 0,
  'decision receipt conflicts with recorded QA, packet, or input/output versions');
  const output = receipt.output_versions[0];
  requireCondition(output.id === `approved_locked_scene:${task.scene_id}` &&
    output.location === packet.inputs.locked_scene &&
    output.version === packet.input_versions.find((item) => item.location === output.location)?.version &&
    git(packetRoot, 'rev-parse', `${sourceRoot ? ledger.source_ref : 'HEAD'}:${output.location}`) === output.version,
  'approved Locked Scene output differs from reviewed source bytes');
  if (sourceRoot && requireCurrent) requireCondition(
    git(root, 'rev-parse', `HEAD:${output.location}`) === output.version,
    'approved Locked Scene output differs from current target checkout');
  return { run_id: runId, source_ref: ledger.source_ref, packet_sha256: packetSha256,
    task_id: task.task_id, task_status: sourceRoot && !requireCurrent ? 'RECORDED_PASS' : 'CURRENT_PASS', run_status: ledger.status,
    qa_codes: receipt.qa_codes.map(({ code }) => code),
    next_action: 'this Narrative QA task is complete; other production and Human gates remain independent' };
}

export async function writeProductionRunCheck(runId, { root = projectRoot } = {}) {
  safeName(runId);
  const relative = `generated/session-cache/${runId}/resume.json`;
  const destination = path.join(root, relative);
  await rm(destination, { force: true });
  const report = await verifyProductionRun(runId, { root });
  await mkdir(path.dirname(destination), { recursive: true });
  const data = `${JSON.stringify(report, null, 2)}\n`;
  const temporary = `${destination}.${process.pid}.tmp`;
  await writeFile(temporary, data, { flag: 'wx' });
  try { await rename(temporary, destination); } catch (error) { await rm(temporary, { force: true }); throw error; }
  return { path: relative, sha256: sha256(data), report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    requireCondition(process.argv.length === 4 && process.argv[2] === '--run-id',
      'usage: npm run production:run:check -- --run-id <run-id>');
    const { path: reportPath, sha256: hash, report } = await writeProductionRunCheck(process.argv[3]);
    console.log(`Run check: ${reportPath} SHA-256 ${hash}; ${report.task_status}`);
  } catch (error) {
    console.error(`BLOCKED: ${error.message}`);
    process.exitCode = 1;
  }
}
