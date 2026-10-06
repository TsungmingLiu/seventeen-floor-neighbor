import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fixture, candidateFixture } from './production-preflight.test.mjs';
import { generateHandoff, verifyHandoff } from '../tools/production-handoff.mjs';
import { writeCache } from '../tools/production-task-io.mjs';

async function prepared() {
  const f = await fixture(); await writeFile(path.join(f.root, 'output.json'), '{"implemented":true}\n');
  const facts = { status: 'NEEDS_REVIEW', inputs_used: [{ source: 'input', version: f.packet.input_versions[0].version }], outputs: [{ id: 'implementation', location: 'output.json' }], qa: { checks: [{ name: 'machine', result: 'PASS' }], failure_reason: null } };
  const options = { root: f.root, packetPath: f.packetPath, facts, bindingPath: 'generated/session-cache/run/binding.json' };
  const result = await generateHandoff(options); await writeCache(f.root, options.bindingPath, result.inputBinding);
  return { ...f, facts, options, ...result };
}
test('compact and full legacy Handoffs verify exact sources/outputs and preserve status', async () => {
  const f = await prepared(); try {
    const report = await verifyHandoff({ ...f.options, handoff: f.handoff }); assert.equal(report.status, 'NEEDS_REVIEW'); assert.equal(report.production_approval, false);
    const legacy = structuredClone(f.handoff); delete legacy.format; delete legacy.input_binding; legacy.input_versions = f.packet.input_versions;
    assert.equal((await verifyHandoff({ ...f.options, handoff: legacy })).verified, true);
    legacy.output_versions[0].version = f.git('hash-object', 'output.json'); legacy.outputs[0].source_identity = 'legacy-manifest-provenance';
    assert.equal((await verifyHandoff({ ...f.options, handoff: legacy })).verified, true);
    legacy.input_versions[0].version = '0'.repeat(40); await assert.rejects(verifyHandoff({ ...f.options, handoff: legacy }));
  } finally { await f.cleanup(); }
});
test('tampered packet, input binding, output, harness and gates are rejected', async () => {
  const f = await prepared(); try {
    for (const mutate of [h => h.task_id = 'OTHER', h => h.harness.version = '0.0.0', h => h.human_gate_required = 'final_playable_acceptance', h => h.input_binding.sha256 = '0'.repeat(64), h => h.output_versions[0].version = 'sha256:' + '0'.repeat(64), h => h.outputs[0].source_identity = 'wrong', h => h.outputs[0].location = '../output.json', h => h.outputs[0].location = 'scene.md']) {
      const h = structuredClone(f.handoff); mutate(h); await assert.rejects(verifyHandoff({ ...f.options, handoff: h }));
    }
    await writeFile(path.join(f.root, 'output.json'), 'tampered'); await assert.rejects(verifyHandoff({ ...f.options, handoff: f.handoff }), /output bytes/);
    await writeFile(path.join(f.root, 'output.json'), '{"implemented":true}\n');
    const packetBytes = await readFile(path.join(f.root, f.packetPath)); await writeFile(path.join(f.root, f.packetPath), Buffer.concat([packetBytes, Buffer.from(' ')]));
    await assert.rejects(verifyHandoff({ ...f.options, handoff: f.handoff }), /binding mismatch/);
  } finally { await f.cleanup(); }
});
test('missing worker facts, false PASS and undeclared used sources are not generated', async () => {
  const f = await prepared(); try {
    for (const mutate of [facts => delete facts.status, facts => delete facts.inputs_used, facts => facts.inputs_used[0].version = 'wrong', facts => delete facts.qa, facts => { facts.status = 'PASS'; facts.qa.checks[0].result = 'FAIL'; }, facts => { facts.status = 'PASS'; facts.outputs = []; }]) {
      const facts = structuredClone(f.facts); mutate(facts); await assert.rejects(generateHandoff({ ...f.options, facts }));
    }
  } finally { await f.cleanup(); }
});
test('engineering outputs can change acquired worktree sources while input identity stays pinned', async () => {
  const f = await prepared(); try {
    await writeFile(path.join(f.root, 'input.json'), '{"changed_output":true}');
    assert.equal((await verifyHandoff({ ...f.options, handoff: f.handoff })).verified, true);
    // The binding remains exact to the dispatched immutable source, not changed bytes.
    assert.equal(f.inputBinding.sources[0].git_blob_sha, f.packet.input_versions[0].version);
  } finally { await f.cleanup(); }
});

test('compact and legacy returns resolve transient candidate locators', async () => {
  const f = await candidateFixture(); try {
    const facts = { status: 'NEEDS_REVIEW', inputs_used: ['candidate', 'AGENTS.md'], outputs: [{ id: 'review-evidence', location: 'output.json' }], qa: { checks: [{ name: 'pixel_review', result: 'NOT_RUN' }] } };
    await writeFile(path.join(f.root, 'output.json'), '{"review_pending":true}');
    const options = { root: f.root, packetPath: f.packetPath, facts, bindingPath: 'generated/session-cache/run/candidate-binding.json' };
    const result = await generateHandoff(options); await writeCache(f.root, options.bindingPath, result.inputBinding);
    assert.equal(result.handoff.inputs_used[0].version, `WORKTREE:${f.image.path}`);
    assert.equal((await verifyHandoff({ ...options, handoff: result.handoff })).status, 'NEEDS_REVIEW');
    const legacy = structuredClone(result.handoff); delete legacy.format; delete legacy.input_binding; legacy.input_versions = f.packet.input_versions;
    assert.equal((await verifyHandoff({ ...options, handoff: legacy })).verified, true);
    await writeFile(path.join(f.root, f.image.path), 'tampered'); await assert.rejects(verifyHandoff({ ...options, handoff: result.handoff })); await assert.rejects(verifyHandoff({ ...options, handoff: legacy }));
  } finally { await f.cleanup(); }
});
