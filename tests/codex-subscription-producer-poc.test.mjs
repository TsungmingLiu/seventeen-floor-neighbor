import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  codexExecArgs,
  handoffOutputSchema,
  sliceExcerpt,
  validateNarrativeHandoff
} from '../tools/codex-subscription-producer-poc.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const digest = (value) => createHash('sha256').update(value).digest('hex');

test('sliceExcerpt enforces exact bounded bytes', () => {
  const text = ['zero', 'one', 'two', 'three'].join('\n');
  const body = ['one', 'two'].join('\n');
  assert.equal(sliceExcerpt(text, { start_line: 2, end_line: 3, sha256: digest(body) }), body);
  assert.throws(() => sliceExcerpt(text,
    { start_line: 2, end_line: 3, sha256: digest('wrong') }), /SHA-256 mismatch/);
});

function fixture() {
  const locked = {
    id: 'file:docs/narrative/scenes/vertical-slice/COM-00.md',
    version: 'abc123',
    location: 'docs/narrative/scenes/vertical-slice/COM-00.md'
  };
  const packet = {
    run_id: 'subscription-poc-test',
    task_id: 'NQA-COM00-SUB-POC-001',
    workflow_version: '1.3.0',
    harness: 'content_qa',
    pass: 'narrative_review',
    inputs: { locked_scene: locked.location },
    input_versions: [
      { id: 'file:content/production/narrative/opening-ch1/COM-00.json',
        version: 'def456', location: 'content/production/narrative/opening-ch1/COM-00.json' },
      locked
    ]
  };
  const handoff = {
    run_id: packet.run_id,
    task_id: packet.task_id,
    status: 'PASS',
    workflow_version: packet.workflow_version,
    harness: { id: packet.harness, version: '1.4.0', pass: packet.pass },
    inputs_used: [],
    attachments_used: [],
    outputs: [{ id: 'narrative-qa:COM-00', location: 'handoff', description: 'review',
      source_identity: locked.version }],
    input_versions: packet.input_versions,
    output_versions: [{ id: 'reviewed_locked_scene:COM-00', version: locked.version, location: locked.location }],
    qa: { checks: [{ name: 'NQA-DIALOGUE-NATURALISM', result: 'PASS' }], failure_reason: null },
    canon_changes: { none: true },
    known_issues: [],
    invalidates: [],
    next_recommended_stage: { harness: 'cg_planner', pass: null },
    human_gate_required: 'none'
  };
  return { packet, handoff };
}

test('handoff validator accepts exact reviewed bytes and rejects stale output', () => {
  const { packet, handoff } = fixture();
  assert.equal(validateNarrativeHandoff(packet, handoff), true);
  const stale = structuredClone(handoff);
  stale.input_versions[1].version = 'stale';
  assert.throws(() => validateNarrativeHandoff(packet, stale), /input_versions differ/);
  const mutation = structuredClone(handoff);
  mutation.output_versions[0].version = 'rewritten';
  assert.throws(() => validateNarrativeHandoff(packet, mutation), /exact reviewed Locked Scene bytes/);
});

test('Codex exec command is ephemeral, schema-constrained and uses permission profiles instead of legacy sandbox', () => {
  const args = codexExecArgs({
    workspace: '/isolated/worker',
    schemaPath: '/isolated/worker/control/schema.json',
    outputPath: '/isolated/worker/handoff.json'
  });
  assert.deepEqual(args.slice(0, 2), ['exec', '--ephemeral']);
  assert.ok(args.includes('--ignore-user-config'));
  assert.ok(args.includes('--ignore-rules'));
  assert.ok(args.includes('--output-schema'));
  assert.ok(args.includes('--output-last-message'));
  assert.ok(!args.includes('--sandbox'));
  assert.ok(args.includes('forced_login_method="chatgpt"'));
  assert.ok(args.includes('history.persistence="none"'));
  assert.ok(args.includes('default_permissions="poc-worker"'));
  assert.ok(args.some((value) => value.includes('":root"="deny"')));
  assert.ok(args.some((value) => value.includes('":workspace_roots"={"."="read"}')));
  assert.ok(args.includes('permissions.poc-worker.network={enabled=false}'));
  assert.ok(args.includes('web_search="disabled"'));
  assert.ok(args.includes('tools.web_search=false'));
  assert.ok(args.includes('features.multi_agent=false'));
  assert.equal(args.at(-1), '-');
});

test('handoff output schema forbids extra top-level fields', () => {
  const schema = handoffOutputSchema();
  assert.equal(schema.additionalProperties, false);
  assert.ok(schema.required.includes('input_versions'));
  assert.ok(schema.required.includes('qa'));
  assert.equal(schema.properties.attachments_used.maxItems, 0);
});

test('dry-run exercises real Task Packet generation and bounded subscription command planning', async () => {
  const runId = `subscription-poc-dry-${process.pid}-${Date.now()}`;
  const taskId = 'NQA-COM00-SUB-POC-DRY';
  const cache = path.join(projectRoot, 'generated/session-cache', runId);
  try {
    const result = spawnSync(process.execPath, [
      'tools/codex-subscription-producer-poc.mjs',
      '--scene', 'COM-00',
      '--run-id', runId,
      '--task-id', taskId,
      '--dry-run'
    ], { cwd: projectRoot, encoding: 'utf8', timeout: 180_000 });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const summary = JSON.parse(result.stdout);
    assert.equal(summary.execution_backend, 'codex exec');
    assert.equal(summary.scene_id, 'COM-00');
    assert.equal(summary.filesystem_policy, 'deny root; read only workspace + minimal runtime');
    assert.equal(summary.network_access, false);
    assert.equal(summary.web_search, false);
    assert.equal(summary.subagents, false);
    assert.equal(summary.session_persistence, false);
    assert.ok(summary.source_count > 0);
    assert.equal(summary.source_count, summary.source_index.length);
    assert.ok(summary.source_index.some((s) =>
      s.canonical_path === 'docs/narrative/scenes/vertical-slice/COM-00.md'));
    assert.ok(summary.source_index.some((s) =>
      s.canonical_path === 'content/production/narrative/opening-ch1/COM-00.json'));
  } finally {
    await rm(cache, { recursive: true, force: true });
  }
});
