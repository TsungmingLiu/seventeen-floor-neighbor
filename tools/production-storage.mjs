import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const LEGACY_STORAGE_REF = 'aebda00d92f8dc614a8bdc6e1671541fd4d660ce';
export const JOB_ARTIFACT_ROOT = 'generated/job-artifacts/';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trees = new Map();
const artifactRoots = ['generated/session-cache/', 'generated/render-packets/',
  'generated/reviews/', JOB_ARTIFACT_ROOT];
const projectionFormat = 'production-ledger-projection-v1';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const blob = (bytes) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
function ensure(condition, message) { if (!condition) throw new Error(`production storage: ${message}`); }
function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { maxBuffer: 8 * 1024 * 1024 });
}
function tree(root, ref) {
  ensure(/^[0-9a-f]{40}$/.test(ref), 'archive ref must be an exact commit');
  const key = `${root}:${ref}`;
  if (!trees.has(key)) {
    const entries = git(root, 'ls-tree', '-r', '-z', ref).toString().split('\0').filter(Boolean);
    trees.set(key, new Map(entries.map((entry) => {
      const [metadata, relative] = entry.split('\t');
      return [relative, metadata.split(' ')[2]];
    })));
  }
  return trees.get(key);
}
function verifyLocator(root, locator) {
  ensure(locator && /^[0-9a-f]{64}$/.test(locator.sha256) &&
    Number.isInteger(locator.bytes) && locator.bytes >= 0 &&
    typeof locator.path === 'string' && locator.path.startsWith('content/production/runs/') &&
    !locator.path.split('/').some((part) => !part || part === '.' || part === '..'),
  'invalid immutable run-record locator');
  ensure(tree(root, locator.ref).get(locator.path) === locator.git_blob_sha,
    `archive path/blob mismatch: ${locator.path}`);
}
export function readArchivedRecords(locators, { root = ROOT } = {}) {
  locators.forEach((locator) => verifyLocator(root, locator));
  if (!locators.length) return [];
  const output = execFileSync('git', ['-C', root, 'cat-file', '--batch'], {
    input: locators.map((item) => item.git_blob_sha).join('\n') + '\n', maxBuffer: 8 * 1024 * 1024
  });
  let offset = 0;
  return locators.map((locator) => {
    const end = output.indexOf(10, offset);
    const [object, type, length] = output.subarray(offset, end).toString().split(' ');
    ensure(object === locator.git_blob_sha && type === 'blob' && Number(length) === locator.bytes,
      `archive object mismatch: ${locator.path}`);
    const bytes = output.subarray(end + 1, end + 1 + Number(length));
    offset = end + 2 + Number(length);
    ensure(digest(bytes) === locator.sha256, `archive SHA-256 mismatch: ${locator.path}`);
    return bytes;
  });
}

// Restore identities in memory only. Historical archive evidence is never new QA.
export function hydrateProductionLedger(ledger, { root = ROOT } = {}) {
  const storage = ledger.storage_resolution;
  if (storage?.format !== projectionFormat) return ledger;
  ensure(JSON.stringify(storage.omitted_task_fields) === JSON.stringify(['input_versions', 'output_versions']),
    'unsupported ledger projection fields');
  const [bytes] = readArchivedRecords([storage.original], { root });
  const original = JSON.parse(bytes);
  ensure(ledger.run_id === original.run_id && ledger.tasks.length === original.tasks.length,
    'ledger projection identity/task count mismatch');
  const hydrated = structuredClone(ledger);
  delete hydrated.storage_resolution;
  hydrated.tasks.forEach((task, index) => {
    ensure(task.task_id === original.tasks[index].task_id, 'ledger projection changed task ordering');
    for (const field of storage.omitted_task_fields) {
      if (Object.hasOwn(original.tasks[index], field)) task[field] = original.tasks[index][field];
    }
  });
  // Property order is immaterial; values and gates must be identical after hydration.
  const normalize = (item) => Array.isArray(item) ? item.map(normalize) : item && typeof item === 'object'
    ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, normalize(item[key])])) : item;
  ensure(JSON.stringify(normalize(hydrated)) === JSON.stringify(normalize(original)),
    'ledger projection changed original task/status/dependency/Human semantics');
  readArchivedRecords(storage.archived_records, { root });
  return hydrated;
}

export function assertArtifactOutputPath(destination, { root = ROOT } = {}) {
  const relative = path.relative(root, path.resolve(destination)).split(path.sep).join('/');
  // External temporary directories are allowed; any output in this checkout uses an artifact root.
  ensure(relative.startsWith('../') || artifactRoots.some((prefix) => relative.startsWith(prefix)),
    `temporary output must use ${JOB_ARTIFACT_ROOT}: ${relative}`);
}

const checkpointKeys = new Set(['schema_version', 'storage_class', 'run_id', 'workflow_version',
  'source_ref', 'human_request', 'status', 'tasks', 'invalidation_events', 'preview', 'human_decisions']);
const taskKeys = new Set(['task_id', 'task_type', 'scene_id', 'depends_on', 'status', 'packet',
  'decision_receipt', 'human_gate', 'reason', 'review_scope', 'entry_ids', 'upstream_run_id', 'upstream_task_id']);
const durableKeys = new Set(['schema_version', 'storage_class', 'evidence_purpose', 'run_id', 'task_id',
  'scene_id', 'task_type', 'status', 'harness', 'source_ref', 'packet_sha256', 'input_digest_sha256',
  'input_versions', 'output_versions', 'qa_codes', 'known_issues', 'human_gate_required', 'invalidates']);
export function assertDurableDecision(record, bytes = Buffer.from(JSON.stringify(record))) {
  ensure(bytes.length <= 16384 && record.schema_version === '2.0.0' &&
    record.storage_class === 'durable_decision' &&
    ['adopted_asset', 'qa_decision', 'human_decision', 'resume_checkpoint'].includes(record.evidence_purpose),
  'new run record must be a compact durable decision (schema 2.0.0, <=16 KiB)');
  ensure(Object.keys(record).every((key) => durableKeys.has(key)), 'run record contains full attempt/transport fields');
  ensure(typeof record.run_id === 'string' && typeof record.task_id === 'string' &&
    ['PASS', 'FAIL', 'NEEDS_REVIEW', 'BLOCKED', 'HUMAN_ACCEPTED_AS_IS'].includes(record.status) &&
    ['narrative_review', 'visual_review', 'human_decision', 'integrate'].includes(record.task_type) &&
    Array.isArray(record.output_versions) && Array.isArray(record.qa_codes), 'invalid durable decision identity');
  for (const field of ['input_versions', 'output_versions']) {
    ensure(!record[field] || record[field].every((item) =>
      Object.keys(item).every((key) => ['id', 'version', 'location'].includes(key)) &&
      ['id', 'version', 'location'].every((key) => typeof item[key] === 'string')),
    'durable decisions carry identities only');
  }
}

export function validateProductionStorage({ root = ROOT } = {}) {
  // Both the index and working tree are checked, including forced additions of ignored files.
  const listed = git(root, 'ls-files', '-z', '--cached', '--others', '--exclude-standard')
    .toString().split('\0').filter(Boolean);
  const files = [...new Set(listed)];
  let legacy;
  const baseline = () => legacy ??= tree(root, LEGACY_STORAGE_REF);
  for (const relative of files) {
    ensure(!relative.startsWith('generated/'), `versioned transient artifact: ${relative}`);
    if (!fs.existsSync(path.join(root, relative))) continue; // an authorized deletion in the worktree
    if (!relative.startsWith('content/')) continue;
    ensure(!/(?:^|\/)(?:prompts?|api-payloads?|candidates|rejected|logs|attempts)(?:\/|\.)|\.(?:packet|handoff|prompt|api-payload|log|ndjson|jsonl)(?:\.|$)/i.test(relative),
      `transient artifact in source: ${relative}`);
    if (relative.startsWith('content/production/cg-manifests/')) {
      ensure(relative.endsWith('.json'), `only formal JSON specs belong in CG manifest source: ${relative}`);
    }
    if (relative.endsWith('.json')) {
      const source = JSON.parse(fs.readFileSync(path.join(root, relative)));
      ensure(!(source.allowed_sources && source.deliverables) &&
        !(source.outputs && source.qa && source.harness) &&
        !Object.hasOwn(source, 'shared_prompt') && !Object.hasOwn(source, 'api_payload') &&
        !Object.hasOwn(source, 'full_handoff') &&
        !(Array.isArray(source.jobs) && source.jobs.some((job) => job?.input?.prompt)), `full task/transport artifact in source: ${relative}`);
    }
    if (!relative.startsWith('content/production/runs/')) continue;
    const bytes = fs.readFileSync(path.join(root, relative));
    const record = JSON.parse(bytes);
    if (baseline().get(relative) === blob(bytes)) continue; // immutable legacy durable evidence
    ensure(/^content\/production\/runs\/[^/]+\/(?:ledger\.json|[^/]+\.decision\.json)$/.test(relative),
      `disposable workflow record in source: ${relative}`);
    if (record.storage_resolution?.format === projectionFormat) {
      ensure(relative === record.storage_resolution.original.path && relative.endsWith('/ledger.json'),
        'projection must identify its original ledger path');
      hydrateProductionLedger(record, { root });
    } else if (baseline().get(relative) !== blob(bytes)) {
      if (relative.endsWith('/ledger.json')) {
        ensure(bytes.length <= 32768 && record.storage_class === 'durable_checkpoint' &&
          record.schema_version === '2.0.0' && Object.keys(record).every((key) => checkpointKeys.has(key)) &&
          Array.isArray(record.tasks) && record.tasks.every((task) =>
            Object.keys(task).every((key) => taskKeys.has(key)) &&
            (!task.packet || Object.keys(task.packet).every((key) => ['generator', 'sha256'].includes(key)))),
        'new ledger must be a compact durable checkpoint; full attempt state belongs in job artifacts');
      } else assertDurableDecision(record, bytes);
    }
  }
  return { checkedFiles: files.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = validateProductionStorage();
    process.stdout.write(`Production storage boundary passed (${result.checkedFiles} source paths).\n`);
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
