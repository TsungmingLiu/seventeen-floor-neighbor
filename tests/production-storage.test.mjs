import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProductionStorage, hydrateProductionLedger, readArchivedRecords,
  assertArtifactOutputPath, LEGACY_STORAGE_REF } from '../tools/production-storage.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'production-storage-'));
  git(directory, 'init', '-q');
  // Historical objects are read-only; mutations use this isolated fixture's index.
  const common = path.resolve(root, git(root, 'rev-parse', '--git-common-dir'));
  fs.mkdirSync(path.join(directory, '.git/objects/info'), { recursive: true });
  fs.writeFileSync(path.join(directory, '.git/objects/info/alternates'), `${common}/objects\n`);
  fs.copyFileSync(path.join(root, '.gitignore'), path.join(directory, '.gitignore'));
  const put = (relative, bytes, force = false) => {
    fs.mkdirSync(path.dirname(path.join(directory, relative)), { recursive: true });
    fs.writeFileSync(path.join(directory, relative), bytes);
    git(directory, 'add', ...(force ? ['-f'] : []), relative);
  };
  return { directory, put, close: () => fs.rmSync(directory, { recursive: true, force: true }) };
}

function durableDecision(overrides = {}) {
  return {
    schema_version: '2.0.0', storage_class: 'durable_decision', evidence_purpose: 'qa_decision',
    run_id: 'test', task_id: 'QA-001', task_type: 'visual_review', status: 'NEEDS_REVIEW',
    harness: { id: 'content_qa', version: '1.3.0', pass: 'visual_review' },
    input_versions: [{ id: 'fixture-spec', version: 'a'.repeat(64), location: 'external:fixture-spec' }],
    output_versions: [{ id: 'fixture-candidate', version: 'b'.repeat(64), location: 'external:fixture' }],
    qa_codes: [{ name: 'fixture-only', result: 'FAIL', code: 'FIXTURE' }],
    known_issues: ['fixture issue'], human_gate_required: 'accepted_master_image_selection', invalidates: [],
    ...overrides
  };
}

test('storage boundary accepts formal specs and compact adoption evidence, rejects forced job artifacts', () => {
  const f = fixture();
  try {
    f.put('content/production/cg-manifests/formal.json',
      fs.readFileSync(path.join(root, 'content/production/cg-manifests/opening-ch1-com02x-walk.json')));
    f.put('content/production/runs/test/QA-001.decision.json', JSON.stringify({
      schema_version: '2.0.0', storage_class: 'durable_decision', evidence_purpose: 'qa_decision',
      run_id: 'test', task_id: 'QA-001', task_type: 'visual_review', status: 'NEEDS_REVIEW',
      output_versions: [{ id: 'fixture-candidate', version: 'sha256:' + 'a'.repeat(64), location: 'external:fixture' }],
      qa_codes: [{ name: 'fixture-only', result: 'FAIL', code: 'FIXTURE' }]
    }));
    assert.ok(validateProductionStorage({ root: f.directory }).checkedFiles >= 2);
    f.put('generated/job-artifacts/test/attempt.json', '{"prompt":"fixture"}', true);
    assert.throws(() => validateProductionStorage({ root: f.directory }), /versioned transient artifact/);
    // Deleting a forced addition from disk must not hide the dangerous index path.
    fs.unlinkSync(path.join(f.directory, 'generated/job-artifacts/test/attempt.json'));
    assert.throws(() => validateProductionStorage({ root: f.directory }), /versioned transient artifact/);
  } finally { f.close(); }
});

test('storage guard rejects source packets, full handoffs, payloads, rejected candidates and stage records', () => {
  for (const [relative, payload] of [
    ['content/production/runs/test/TASK.packet.json', {}],
    ['content/production/cg-manifests/payload.api-payload.json', {}],
    ['content/production/runs/test/logs/attempt.log', {}],
    ['content/production/runs/test/candidates/rejected.json', {}],
    ['content/production/runs/test/RENDER-001.decision.json', { task_type: 'cg_render', status: 'PASS' }],
    ['content/production/narrative/hidden.json', { outputs: [], qa: {}, harness: {} }],
    ['content/production/narrative/packet.json', { allowed_sources: [], deliverables: [] }],
    ['content/production/cg-manifests/hidden-api.json', { jobs: [{ input: { prompt: 'fixture' } }] }]
  ]) {
    const f = fixture();
    try {
      f.put(relative, JSON.stringify(payload), true);
      assert.throws(() => validateProductionStorage({ root: f.directory }), /production storage:/, relative);
    } finally { f.close(); }
  }
});

test('compact COM02X ledger restores exact historical values and all deleted record bytes from Git', () => {
  const relative = 'content/production/runs/com02x-cg-20260930/ledger.json';
  const ledger = JSON.parse(fs.readFileSync(path.join(root, relative)));
  const original = JSON.parse(git(root, 'show', `${LEGACY_STORAGE_REF}:${relative}`));
  assert.deepEqual(hydrateProductionLedger(ledger), original);
  assert.equal(ledger.storage_resolution.archived_records.length, 44);
  const recovered = readArchivedRecords(ledger.storage_resolution.archived_records);
  recovered.forEach((bytes, index) => {
    const locator = ledger.storage_resolution.archived_records[index];
    assert.equal(createHash('sha256').update(bytes).digest('hex'), locator.sha256);
    assert.equal(fs.existsSync(path.join(root, locator.path)), false);
  });
  const tampered = structuredClone(ledger);
  tampered.tasks.find((task) => task.task_id === 'VQA-COM02X-WALK-003').status = 'PASS';
  assert.throws(() => hydrateProductionLedger(tampered), /changed original task\/status\/dependency\/Human semantics/);
  const wrongLocator = structuredClone(ledger.storage_resolution.archived_records[0]);
  wrongLocator.sha256 = '0'.repeat(64);
  assert.throws(() => readArchivedRecords([wrongLocator]), /archive SHA-256 mismatch/);
});

test('render writer permits artifact output and rejects source destinations', () => {
  assert.doesNotThrow(() => assertArtifactOutputPath(path.join(root, 'generated/job-artifacts/fixture/render.json')));
  assert.throws(() => assertArtifactOutputPath(path.join(root, 'content/production/runs/fixture/render.json')),
    /temporary output must use/);
});


test('exact legacy attempt blobs cannot be reintroduced after storage cleanup', () => {
  const f = fixture();
  try {
    const ledgerPath = 'content/production/runs/com02x-cg-20260930/ledger.json';
    const bytes = fs.readFileSync(path.join(root, ledgerPath));
    const ledger = JSON.parse(bytes);
    f.put(ledgerPath, bytes);
    assert.doesNotThrow(() => validateProductionStorage({ root: f.directory }));
    const archived = ledger.storage_resolution.archived_records.find((item) => item.path.endsWith('.decision.json'));
    const raw = execFileSync('git', ['-C', root, 'show', `${archived.ref}:${archived.path}`]);
    f.put(archived.path, raw);
    assert.throws(() => validateProductionStorage({ root: f.directory }), /archived attempt record must not be restored/);
  } finally { f.close(); }
});

test('removing an archive locator cannot authorize exact archived decision restoration', () => {
  const f = fixture();
  try {
    const ledgerPath = 'content/production/runs/com02x-cg-20260930/ledger.json';
    const ledger = JSON.parse(fs.readFileSync(path.join(root, ledgerPath)));
    const archived = ledger.storage_resolution.archived_records.find((item) => item.path.endsWith('.decision.json'));
    ledger.storage_resolution.archived_records = ledger.storage_resolution.archived_records.filter((item) => item.path !== archived.path);
    f.put(ledgerPath, JSON.stringify(ledger));
    f.put(archived.path, execFileSync('git', ['-C', root, 'show', `${archived.ref}:${archived.path}`]));
    assert.throws(() => validateProductionStorage({ root: f.directory }),
      /changed immutable archived record set|archived attempt record must not be restored/);
    // Removing the entire mutable map/ledger still cannot remove the historical deny list.
    git(f.directory, 'rm', '-f', ledgerPath);
    assert.throws(() => validateProductionStorage({ root: f.directory }), /archived attempt record must not be restored/);
  } finally { f.close(); }
});

test('staged archived decision is rejected after its worktree file is unlinked', () => {
  const f = fixture();
  try {
    const ledgerPath = 'content/production/runs/com02x-cg-20260930/ledger.json';
    const ledger = JSON.parse(fs.readFileSync(path.join(root, ledgerPath)));
    f.put(ledgerPath, JSON.stringify(ledger));
    const archived = ledger.storage_resolution.archived_records.find((item) => item.path.endsWith('.decision.json'));
    f.put(archived.path, execFileSync('git', ['-C', root, 'show', `${archived.ref}:${archived.path}`]));
    fs.unlinkSync(path.join(f.directory, archived.path));
    assert.throws(() => validateProductionStorage({ root: f.directory }), /archived attempt record must not be restored/);
  } finally { f.close(); }
});

test('schema2 QA codes reject a nested full API payload while typed Human and QA decisions pass', () => {
  const f = fixture();
  try {
    const relative = 'content/production/runs/test/QA-001.decision.json';
    f.put(relative, JSON.stringify(durableDecision()));
    f.put('content/production/runs/test/HUMAN-001.decision.json', JSON.stringify(durableDecision({
      task_id: 'HUMAN-001', task_type: 'human_decision', evidence_purpose: 'human_decision',
      status: 'HUMAN_ACCEPTED_AS_IS', harness: { id: 'human', version: '1', pass: null },
      qa_codes: [], known_issues: [{ human_directive: 'fixture selection', gate: 'accepted_master_image_selection',
        decision: 'accepted', sha256: 'b'.repeat(64) }], human_gate_required: 'none'
    })));
    assert.doesNotThrow(() => validateProductionStorage({ root: f.directory }));
    const payload = durableDecision({ qa_codes: [{ name: 'fixture-only', result: 'FAIL', code: 'FIXTURE',
      api_payload: { model: 'fixture', input: { prompt: 'fixture transport prompt' } } }] });
    f.put(relative, JSON.stringify(payload));
    assert.throws(() => validateProductionStorage({ root: f.directory }), /nested task\/transport field|typed compact metadata/);
    // A clean disk copy must not hide the unsafe staged blob.
    fs.writeFileSync(path.join(f.directory, relative), JSON.stringify(durableDecision()));
    assert.throws(() => validateProductionStorage({ root: f.directory }), /nested task\/transport field|typed compact metadata/);
    fs.unlinkSync(path.join(f.directory, relative));
    assert.throws(() => validateProductionStorage({ root: f.directory }), /nested task\/transport field|typed compact metadata/);
  } finally { f.close(); }
});

test('schema2 checkpoint accepts scalar Human metadata and rejects nested transport in each container', () => {
  const f = fixture();
  try {
    const relative = 'content/production/runs/test/ledger.json';
    const checkpoint = {
      schema_version: '2.0.0', storage_class: 'durable_checkpoint', run_id: 'test', workflow_version: '1.3.0',
      source_ref: LEGACY_STORAGE_REF, status: 'ACTIVE', human_request: { summary: 'fixture', gate_status: 'resolved' },
      tasks: [{ task_id: 'HUMAN-001', task_type: 'human_decision', status: 'PASS', depends_on: [],
        packet: { generator: 'fixture', sha256: 'a'.repeat(64) }, decision_receipt: 'fixture.decision.json', human_gate: 'none' }],
      invalidation_events: [{ changed_artifact_id: 'fixture', affected_task_ids: ['fixture-task'],
        old_version: 'a'.repeat(64), new_version: 'b'.repeat(64), decision: 'STALE', evidence: 'fixture' }],
      preview: null,
      human_decisions: [{ task_id: 'HUMAN-001', human_directive: 'fixture selection', gate: 'accepted_master_image_selection',
        decision: 'accepted', asset_id: 'fixture-candidate', sha256: 'b'.repeat(64) }]
    };
    f.put(relative, JSON.stringify(checkpoint));
    assert.doesNotThrow(() => validateProductionStorage({ root: f.directory }));
    for (const field of ['human_request', 'human_decisions', 'invalidation_events', 'preview', 'tasks']) {
      const unsafe = structuredClone(checkpoint);
      const payload = { api_payload: { input: { prompt: 'fixture' } } };
      unsafe[field] = Array.isArray(unsafe[field]) ? [payload] : payload;
      f.put(relative, JSON.stringify(unsafe));
      assert.throws(() => validateProductionStorage({ root: f.directory }), /nested task\/transport field/, field);
    }
  } finally { f.close(); }
});

test('indexed-only source JSON and staged payload overwritten on disk still undergo content checks', () => {
  const f = fixture();
  try {
    const relative = 'content/production/narrative/hidden.json';
    f.put(relative, JSON.stringify({ allowed_sources: [], deliverables: [] }));
    fs.writeFileSync(path.join(f.directory, relative), '{}');
    assert.throws(() => validateProductionStorage({ root: f.directory }), /full task\/transport artifact in source/);
    fs.unlinkSync(path.join(f.directory, relative));
    assert.throws(() => validateProductionStorage({ root: f.directory }), /full task\/transport artifact in source/);
  } finally { f.close(); }
});
