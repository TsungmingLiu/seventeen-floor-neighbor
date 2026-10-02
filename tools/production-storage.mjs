import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const LEGACY_STORAGE_REF = 'aebda00d92f8dc614a8bdc6e1671541fd4d660ce';
// The committed cleanup tree fixes the retired path set independently of mutable ledgers.
const STORAGE_CLEANUP_REF = 'b35e4910f85809a0b9ef97e972444f90f48d3c2f';
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
function archivedRunPaths(root) {
  const retained = tree(root, STORAGE_CLEANUP_REF);
  return new Set([...tree(root, LEGACY_STORAGE_REF).keys()].filter((relative) =>
    relative.startsWith('content/production/runs/') && !retained.has(relative)));
}
function readBlobs(root, identities) {
  if (!identities.length) return [];
  const output = execFileSync('git', ['-C', root, 'cat-file', '--batch'], {
    input: identities.join('\n') + '\n', maxBuffer: 8 * 1024 * 1024
  });
  let offset = 0;
  return identities.map((identity) => {
    const end = output.indexOf(10, offset);
    const [object, type, length] = output.subarray(offset, end).toString().split(' ');
    ensure(object === identity && type === 'blob' && /^\d+$/.test(length),
      `invalid indexed/archive blob: ${identity}`);
    const bytes = output.subarray(end + 1, end + 1 + Number(length));
    ensure(bytes.length === Number(length), `incomplete indexed/archive blob: ${identity}`);
    offset = end + 2 + Number(length);
    return bytes;
  });
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
  return readBlobs(root, locators.map((item) => item.git_blob_sha)).map((bytes, index) => {
    const locator = locators[index];
    ensure(bytes.length === locator.bytes, `archive object mismatch: ${locator.path}`);
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
  ensure(storage.original?.ref === LEGACY_STORAGE_REF && typeof storage.original.path === 'string',
    'ledger projection must bind the immutable legacy storage ref');
  const prefix = path.posix.dirname(storage.original.path) + '/';
  const expected = [...archivedRunPaths(root)].filter((relative) => relative.startsWith(prefix)).sort();
  ensure(Array.isArray(storage.archived_records) && storage.archived_records.every((item) =>
    item.ref === LEGACY_STORAGE_REF) && JSON.stringify(storage.archived_records.map((item) => item.path).sort()) ===
    JSON.stringify(expected), 'ledger projection changed immutable archived record set');
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
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isScalar = (value) => value === null || ['string', 'boolean'].includes(typeof value) ||
  (typeof value === 'number' && Number.isFinite(value));
const stringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string');
const scalarMetadata = (value) => isObject(value) && Object.values(value).every((item) =>
  isScalar(item) || (Array.isArray(item) && item.every(isScalar)));
function rejectTransportMetadata(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    ensure(!/^(?:prompt|prompts|shared_prompt|api_payload|api_request|request_body|messages|jobs|input|inputs|outputs|full_handoff|allowed_sources|deliverables|logs|attempts|candidates|rejected_candidates)$/i.test(key),
      `durable metadata contains nested task/transport field: ${key}`);
    rejectTransportMetadata(item);
  }
}
function assertCheckpoint(record, bytes) {
  rejectTransportMetadata(record);
  ensure(bytes.length <= 32768 && record.storage_class === 'durable_checkpoint' &&
    record.schema_version === '2.0.0' && Object.keys(record).every((key) => checkpointKeys.has(key)) &&
    ['run_id', 'workflow_version', 'source_ref', 'status'].every((key) => typeof record[key] === 'string') &&
    (record.human_request === undefined || scalarMetadata(record.human_request)) &&
    (record.preview == null || scalarMetadata(record.preview)) &&
    (record.human_decisions === undefined || (Array.isArray(record.human_decisions) &&
      record.human_decisions.every((item) => typeof item === 'string' || scalarMetadata(item)))) &&
    (record.invalidation_events === undefined || (Array.isArray(record.invalidation_events) &&
      record.invalidation_events.every(scalarMetadata))) &&
    Array.isArray(record.tasks) && record.tasks.every((task) => isObject(task) &&
      Object.keys(task).every((key) => taskKeys.has(key)) &&
      ['task_id', 'task_type', 'status'].every((key) => typeof task[key] === 'string') &&
      Object.entries(task).every(([key, value]) => {
        if (['depends_on', 'entry_ids'].includes(key)) return stringArray(value);
        if (key === 'packet') return isObject(value) &&
          Object.keys(value).every((name) => ['generator', 'sha256'].includes(name)) &&
          ['generator', 'sha256'].every((name) => typeof value[name] === 'string');
        return value === null || typeof value === 'string';
      })), 'new ledger must be a compact durable checkpoint; full attempt state belongs in job artifacts');
}
export function assertDurableDecision(record, bytes = Buffer.from(JSON.stringify(record))) {
  rejectTransportMetadata(record);
  ensure(bytes.length <= 16384 && isObject(record) && record.schema_version === '2.0.0' &&
    record.storage_class === 'durable_decision' &&
    ['adopted_asset', 'qa_decision', 'human_decision', 'resume_checkpoint'].includes(record.evidence_purpose),
  'new run record must be a compact durable decision (schema 2.0.0, <=16 KiB)');
  ensure(Object.keys(record).every((key) => durableKeys.has(key)), 'run record contains full attempt/transport fields');
  ensure(typeof record.run_id === 'string' && typeof record.task_id === 'string' &&
    ['PASS', 'FAIL', 'NEEDS_REVIEW', 'BLOCKED', 'HUMAN_ACCEPTED_AS_IS'].includes(record.status) &&
    ['narrative_review', 'visual_review', 'human_decision', 'integrate'].includes(record.task_type) &&
    Array.isArray(record.output_versions) && Array.isArray(record.qa_codes), 'invalid durable decision identity');
  for (const field of ['input_versions', 'output_versions']) {
    ensure(record[field] === undefined || (Array.isArray(record[field]) && record[field].every((item) => isObject(item) &&
      Object.keys(item).every((key) => ['id', 'version', 'location'].includes(key)) &&
      ['id', 'version', 'location'].every((key) => typeof item[key] === 'string'))),
    'durable decisions carry identities only');
  }
  ensure(record.qa_codes.every((item) => isObject(item) &&
    Object.keys(item).every((key) => ['name', 'code', 'result'].includes(key)) &&
    ['name', 'code', 'result'].every((key) => typeof item[key] === 'string')) &&
    (record.harness === undefined || (isObject(record.harness) &&
      Object.keys(record.harness).every((key) => ['id', 'version', 'pass'].includes(key)) &&
      typeof record.harness.id === 'string' && typeof record.harness.version === 'string' &&
      (record.harness.pass == null || typeof record.harness.pass === 'string'))) &&
    (record.known_issues === undefined || (Array.isArray(record.known_issues) &&
      record.known_issues.every((item) => typeof item === 'string' || scalarMetadata(item)))) &&
    (record.invalidates === undefined || stringArray(record.invalidates)) &&
    Object.entries(record).filter(([key]) => !['harness', 'input_versions', 'output_versions',
      'qa_codes', 'known_issues', 'invalidates'].includes(key)).every(([, value]) =>
      value === null || typeof value === 'string'), 'durable decisions carry typed compact metadata only');
}

export function validateProductionStorage({ root = ROOT } = {}) {
  // Both the index and working tree are checked, including forced additions of ignored files.
  const indexed = git(root, 'ls-files', '--stage', '-z').toString().split('\0').filter(Boolean).map((entry) => {
    const separator = entry.indexOf('\t');
    const metadata = entry.slice(0, separator);
    const relative = entry.slice(separator + 1);
    const [mode, identity, stage] = metadata.split(' ');
    ensure(stage === '0', `unmerged source index: ${relative}`);
    return { relative, mode, identity };
  });
  const untracked = git(root, 'ls-files', '-z', '--others', '--exclude-standard').toString().split('\0').filter(Boolean);
  const files = [...new Set([...indexed.map((item) => item.relative), ...untracked])];
  const archivedPaths = archivedRunPaths(root);
  const indexedContent = indexed.filter((item) => item.relative.startsWith('content/'));
  indexedContent.forEach((item) => ensure(['100644', '100755'].includes(item.mode),
    `source index must contain regular files: ${item.relative}`));
  const indexedBytes = new Map(readBlobs(root, indexedContent.map((item) => item.identity))
    .map((bytes, index) => [indexedContent[index].relative, bytes]));
  let legacy;
  const baseline = () => legacy ??= tree(root, LEGACY_STORAGE_REF);
  for (const relative of files) {
    ensure(!relative.startsWith('generated/'), `versioned transient artifact: ${relative}`);
    ensure(!archivedPaths.has(relative), `archived attempt record must not be restored into source: ${relative}`);
    if (!relative.startsWith('content/')) continue;
    ensure(!/(?:^|\/)(?:prompts?|api-payloads?|candidates|rejected|logs|attempts)(?:\/|\.)|\.(?:packet|handoff|prompt|api-payload|log|ndjson|jsonl)(?:\.|$)/i.test(relative),
      `transient artifact in source: ${relative}`);
    if (relative.startsWith('content/production/cg-manifests/')) {
      ensure(relative.endsWith('.json'), `only formal JSON specs belong in CG manifest source: ${relative}`);
    }
    const versions = [];
    if (indexedBytes.has(relative)) versions.push(indexedBytes.get(relative));
    const absolute = path.join(root, relative);
    if (fs.existsSync(absolute)) {
      const bytes = fs.readFileSync(absolute);
      if (!versions.some((item) => item.equals(bytes))) versions.push(bytes);
    }
    for (const bytes of versions) {
      if (relative.endsWith('.json')) {
        const source = JSON.parse(bytes);
        ensure(!(source.allowed_sources && source.deliverables) &&
          !(source.outputs && source.qa && source.harness) &&
          !Object.hasOwn(source, 'shared_prompt') && !Object.hasOwn(source, 'api_payload') &&
          !Object.hasOwn(source, 'full_handoff') &&
          !(Array.isArray(source.jobs) && source.jobs.some((job) => job?.input?.prompt)), `full task/transport artifact in source: ${relative}`);
      }
      if (!relative.startsWith('content/production/runs/')) continue;
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
          assertCheckpoint(record, bytes);
        } else assertDurableDecision(record, bytes);
      }
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
