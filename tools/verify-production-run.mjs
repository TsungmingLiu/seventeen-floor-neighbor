import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectRoot } from './content-lib.mjs';
import { buildNarrativeReviewPacket, verifyNarrativeReviewPacket } from './context-packet.mjs';

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

export async function verifyProductionRun(runId, { root = projectRoot } = {}) {
  safeName(runId);
  const ledgerPath = `content/production/runs/${runId}/ledger.json`;
  const ledger = await committedJson(root, ledgerPath);
  requireCondition(ledger.schema_version === '1.3.0' && ledger.run_id === runId &&
    /^[0-9a-f]{40}$/.test(ledger.source_ref) &&
    Array.isArray(ledger.tasks) && ledger.tasks.length === 1,
  'invalid production run ledger identity or task count');
  const task = ledger.tasks[0];
  requireCondition(task.task_type === 'narrative_review' &&
    /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(task.scene_id || '') &&
    /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(task.task_id || '') &&
    Array.isArray(task.depends_on) && task.depends_on.length === 0 &&
    task.packet?.generator === 'tools/context.mjs:narrative_review' &&
    task.human_gate === 'none', 'unsupported or malformed bounded task');
  const packet = await buildNarrativeReviewPacket({
    sceneId: task.scene_id, runId, taskId: task.task_id, ref: ledger.source_ref, root
  });
  await verifyNarrativeReviewPacket(packet, { root });
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
    git(root, 'rev-parse', `HEAD:${output.location}`) === output.version,
  'approved Locked Scene output differs from reviewed source bytes');
  return { run_id: runId, source_ref: ledger.source_ref, packet_sha256: packetSha256,
    task_id: task.task_id, task_status: 'CURRENT_PASS', run_status: ledger.status,
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
