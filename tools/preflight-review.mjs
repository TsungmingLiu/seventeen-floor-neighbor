import { createHash } from 'node:crypto';
import { execFileSync, execFile } from 'node:child_process';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { checkSessionCache, scratchRoot } from './check-session-cache.mjs';
import { verifyNarrativeReviewPacket } from './context-packet.mjs';
import { bootstrapSources, writeScratchFiles } from './compile-review-context.mjs';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exec = promisify(execFile);
export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
export function diagnostics(raw) {
  // Diagnostics are untrusted source data, not worker instructions. Full details
  // stay in scratch; output is bounded even for hundreds of validation failures.
  const lines = raw.split(/\r?\n/).map((line) => line.replace(/[\x00-\x1f\x7f]/g, ' ').trim()).filter(Boolean);
  return { lines: lines.slice(0, 3).map((line) => [...line].slice(0, 180).join('')),
    total_lines: lines.length, truncated: lines.length > 3 || lines.some((line) => [...line].length > 180) };
}

export async function runCheck(root, script, args = []) {
  try {
    const result = await exec(process.execPath, [path.join(root, script), ...args],
      { cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, timeout: 60_000 });
    return { ok: true, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return { ok: false, stdout: error.stdout || '', stderr: error.stderr || error.message };
  }
}

export async function preflightReview({ root = defaultRoot, packetPath } = {}) {
  root = path.resolve(root);
  const stages = [], logs = [], bindings = {};
  let stage = 'scratch';
  let scratchSafe = false;
  const record = (id, result) => {
    const raw = `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`;
    logs.push([`${id}.log`, raw]);
    stages.push({ id, status: result.ok ? 'PASS' : 'BLOCKED', log_sha256: hash(raw),
      diagnostics: result.ok ? { lines: [], total_lines: 0, truncated: false } : diagnostics(result.stderr || result.stdout) });
  };
  try {
    if (await realpath(root) !== root) throw new Error('checkout root is a symlink');
    await checkSessionCache(root);
    scratchSafe = true;
    bindings.preflight_sha256 = hash(await readFile(fileURLToPath(import.meta.url)));
    bindings.packet_verifier_sha256 = hash(await readFile(path.join(root, 'tools/context-packet.mjs')));
    record(stage, { ok: true, stdout: 'Scratch ignore and Git index checks passed.', stderr: '' });
    stage = 'packet';
    if (typeof packetPath !== 'string' || !packetPath.startsWith(`${scratchRoot}/`) ||
        packetPath.split('/').some((part) => !/^[a-zA-Z0-9_.-]+$/.test(part) || part === '.' || part === '..')) {
      throw new Error('packet must be a relative file under generated/session-cache/');
    }
    const absolute = path.join(root, packetPath);
    if (await realpath(absolute) !== absolute || !(await stat(absolute)).isFile()) throw new Error('packet is a symlink or not a file');
    if ((await stat(absolute)).size > 1024 * 1024) throw new Error('packet exceeds 1 MiB');
    const body = await readFile(absolute);
    const packet = JSON.parse(body.toString('utf8'));
    if (packet.task_type !== 'narrative_review') throw new Error('POC supports narrative_review only');
    const ref = packet.source_binding?.github?.ref;
    if (typeof ref !== 'string' || !/^[0-9a-f]{40}$/.test(ref)) throw new Error('packet must pin an immutable Git commit');
    await verifyNarrativeReviewPacket(packet, { root });
    const shared = [];
    for (const relative of bootstrapSources) {
      const location = path.join(root, relative);
      if (await realpath(location) !== location) throw new Error(`bootstrap source is a symlink: ${relative}`);
      const bytes = await readFile(location);
      const committed = execFileSync('git', ['-C', root, 'show', `${ref}:${relative}`], { stdio: ['ignore', 'pipe', 'pipe'] });
      if (!bytes.equals(committed)) throw new Error(`bootstrap source differs from ref: ${relative}`);
      shared.push({ path: relative, sha256: hash(bytes) });
    }
    Object.assign(bindings, { source_ref: ref, packet_sha256: hash(body), shared_instructions: shared,
      checkout_head: git(root, 'rev-parse', 'HEAD'), index_sha256: hash(git(root, 'ls-files', '--stage', '-z')) });
    record(stage, { ok: true, stdout: 'Existing canonical packet verifier and mandatory instruction bindings passed.', stderr: '' });
    for (const [id, script] of [['content', 'tools/validate-content.mjs'], ['production', 'tools/validate-production-contracts.mjs']]) {
      stage = id;
      const result = await runCheck(root, script);
      bindings[id] = { script, sha256: hash(await readFile(path.join(root, script))) };
      record(id, result);
      if (!result.ok) break;
    }
  } catch (error) {
    record(stage, { ok: false, stdout: '', stderr: error.message });
  }
  const blocked = stages.find((item) => item.status === 'BLOCKED');
  return { report: { version: 1, status: blocked ? 'BLOCKED' : 'READY_FOR_SEMANTIC_QA',
    blocked_stage: blocked?.id || null, dispatch_allowed: !blocked, semantic_qa: 'NOT_RUN',
    production_approval: false, scratch_safe: scratchSafe, bindings, stages,
    note: 'Engineering preflight only. Revalidate immediately before dispatch; mandatory context, independent semantic QA and Human gates still apply.' }, logs };
}

export function digest(report) {
  const failure = report.stages.find((item) => item.status === 'BLOCKED');
  return { status: report.status, blocked_stage: report.blocked_stage, dispatch_allowed: report.dispatch_allowed,
    semantic_qa: report.semantic_qa, production_approval: false,
    ...(failure ? { diagnostics: failure.diagnostics, log_sha256: failure.log_sha256 } :
      { packet_sha256: report.bindings.packet_sha256, source_ref: report.bindings.source_ref }) };
}

export async function writePreflight(result, runId, { root = defaultRoot } = {}) {
  if (!/^[a-zA-Z0-9_-]+$/.test(runId || '')) throw new Error('invalid run-id');
  if (!result.report.scratch_safe) return null; // An unsafe scratch boundary cannot receive logs.
  return writeScratchFiles(`${scratchRoot}/quota-preflight/${runId}`,
    [...result.logs, ['report.json', `${JSON.stringify(result.report, null, 2)}\n`]], { root });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 4 || args[0] !== '--packet' || args[2] !== '--run-id') throw new Error('Usage: --packet <scratch-packet> --run-id <new-id>');
    const result = await preflightReview({ packetPath: args[1] });
    const destination = await writePreflight(result, args[3]);
    console.log(JSON.stringify({ ...digest(result.report), report: destination ? `${destination}/report.json` : null }));
    if (!result.report.dispatch_allowed) process.exitCode = 1;
  } catch (error) {
    console.log(JSON.stringify({ status: 'BLOCKED', dispatch_allowed: false, semantic_qa: 'NOT_RUN', diagnostics: diagnostics(error.message) }));
    process.exitCode = 1;
  }
}
