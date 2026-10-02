import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { access, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildObservation, observationScenes, summarizeObservation, runObservation } from '../tools/observe-review-dispatch.mjs';
import { writeScratchFiles } from '../tools/compile-review-context.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prepared = await buildObservation({ ref: 'HEAD' });
const mockRecords = () => prepared.manifest.tasks.map((task) => ({ scene_id: task.scene_id,
  existing: { ok: true, stdout: 'PASS', stderr: '' }, preflight: { report: { dispatch_allowed: true, stages: [],
    status: 'READY_FOR_SEMANTIC_QA', semantic_qa: 'NOT_RUN', bindings: { packet_sha256: task.packet_sha256 } } },
  mechanical_ms: { existing_verifier: 1, preflight: 2 }, worker: { name: task.scene_id, input_sha256: task.input_sha256,
    instructions_sha256: task.instructions_sha256, tool_calls: 0, usage: { input_tokens: 100, output_tokens: 10,
      cached_input_tokens: 50, reasoning_output_tokens: 5 }, total_tokens: 110, elapsed_ms: 20,
    result: { status: 'PASS', naturalism: 'PASS', findings: [] } } }));

test('three unmodified canonical scenes rebuild with identical payloads and full mandatory instructions', async () => {
  assert.deepEqual(prepared, await buildObservation({ ref: prepared.manifest.source_ref }));
  assert.deepEqual(prepared.manifest.tasks.map((item) => item.scene_id), observationScenes);
  const files = new Map(prepared.files);
  for (const task of prepared.manifest.tasks) {
    assert.equal(task.baseline_payload_sha256, task.preflight_payload_sha256);
    assert.equal(task.sources.filter((item) => item.kind === 'mandatory_instruction').length, 8);
    assert.ok(files.get(task.instructions).includes('NQA-DIALOGUE-NATURALISM'));
    const packet = JSON.parse(files.get(task.packet));
    const scene = await readFile(path.join(root, packet.inputs.locked_scene), 'utf8');
    assert.ok(files.get(task.input).includes(scene)); // Actual full canon, no injected candidates.
  }
});

test('observed usage is distinct from counterfactual baseline and never counts cached/reasoning twice', () => {
  const summary = summarizeObservation(prepared.manifest, mockRecords());
  assert.equal(summary.actual_total_tokens, 330);
  assert.equal(summary.actual_usage.cached_input_tokens, 150);
  assert.equal(summary.actual_usage.reasoning_output_tokens, 15);
  assert.equal(summary.counts.actual_model_calls, 3);
  assert.equal(summary.counts.additional_blocks_vs_existing_verifier, 0);
  assert.equal(summary.baseline_tokens, null);
  assert.equal(summary.token_reduction, 'NOT_ESTIMABLE_UNPAIRED');
  assert.equal(summary.production_approval, false);
  assert.ok(summary.tasks.every((task) => task.logs_forwarded_to_worker_bytes === 0));
  assert.ok(summary.repeated_source_deliveries.find((item) => item.path === 'AGENTS.md').deliveries === 3);
});

test('mechanical blocks prevent modeled dispatch; missing/duplicate records, wrong hashes or fictional accounting are rejected', () => {
  const records = mockRecords();
  records[0].preflight.report.dispatch_allowed = false;
  assert.throws(() => summarizeObservation(prepared.manifest, records), /mechanical gate/);
  records[0].worker = null;
  assert.equal(summarizeObservation(prepared.manifest, records).counts.actual_model_calls, 2);
  assert.equal(summarizeObservation(prepared.manifest, records).counts.additional_blocks_vs_existing_verifier, 1);
  assert.throws(() => summarizeObservation(prepared.manifest, records.slice(1)), /missing\/duplicate/);
  assert.throws(() => summarizeObservation(prepared.manifest, [records[0], records[0], records[2]]), /missing\/duplicate/);
  const wrong = mockRecords(); wrong[1].worker.input_sha256 = 'wrong';
  assert.throws(() => summarizeObservation(prepared.manifest, wrong), /binding/);
  const inflated = mockRecords(); inflated[1].worker.total_tokens = 999;
  assert.throws(() => summarizeObservation(prepared.manifest, inflated), /accounting/);
});

test('prepared input drift or symlinks stop before execution lock, settings acquisition and paid calls', async () => {
  const id = `test-${randomUUID()}`, relative = `generated/session-cache/quota-observation/${id}`;
  try {
    await writeScratchFiles(relative, prepared.files);
    const input = path.join(root, relative, prepared.manifest.tasks[0].input);
    await writeFile(input, 'tampered');
    await assert.rejects(runObservation({ runId: id }), /prepared observation drift/);
    await assert.rejects(access(path.join(root, relative, 'execution.json')), /ENOENT/);
    await rm(input);
    await symlink(path.join(root, relative, prepared.manifest.tasks[1].input), input);
    await assert.rejects(runObservation({ runId: id }), /prepared observation drift/);
    await assert.rejects(access(path.join(root, relative, 'execution.json')), /ENOENT/);
  } finally { await rm(path.join(root, relative), { recursive: true, force: true }); }
});
