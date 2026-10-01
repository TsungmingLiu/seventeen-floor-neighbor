import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { sliceExcerpt, validateNarrativeHandoff } from '../tools/agents-api-producer-poc.mjs';

const digest = (value) => createHash('sha256').update(value).digest('hex');

test('sliceExcerpt enforces the exact Task Packet excerpt bytes', () => {
  const text = ['zero', 'one', 'two', 'three'].join('\n');
  const body = ['one', 'two'].join('\n');
  assert.equal(sliceExcerpt(text, {
    start_line: 2,
    end_line: 3,
    sha256: digest(body)
  }), body);
  assert.throws(() => sliceExcerpt(text, {
    start_line: 2,
    end_line: 3,
    sha256: digest('different')
  }), /SHA-256 mismatch/);
});

function fixture() {
  const locked = {
    id: 'file:docs/narrative/scenes/vertical-slice/COM-00.md',
    version: 'abc123',
    location: 'docs/narrative/scenes/vertical-slice/COM-00.md'
  };
  const packet = {
    run_id: 'agents-poc-test',
    task_id: 'NQA-COM00-AGENTS-POC-001',
    workflow_version: '1.3.0',
    harness: 'content_qa',
    pass: 'narrative_review',
    inputs: { locked_scene: locked.location },
    input_versions: [
      { id: 'file:content/production/narrative/opening-ch1/COM-00.json', version: 'def456',
        location: 'content/production/narrative/opening-ch1/COM-00.json' },
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
    outputs: [{ id: 'narrative-qa:COM-00', location: 'generated/session-cache/test/handoff.json',
      description: 'review', source_identity: locked.version }],
    input_versions: packet.input_versions,
    output_versions: [{ id: 'approved_locked_scene:COM-00', version: locked.version, location: locked.location }],
    qa: { checks: [{ name: 'NQA-DIALOGUE-NATURALISM', result: 'PASS' }], failure_reason: null },
    canon_changes: { none: true },
    known_issues: [],
    invalidates: [],
    next_recommended_stage: { harness: 'cg_planner', pass: null },
    human_gate_required: 'none'
  };
  return { packet, handoff };
}

test('validateNarrativeHandoff accepts an isolated review of the exact locked bytes', () => {
  const { packet, handoff } = fixture();
  assert.equal(validateNarrativeHandoff(packet, handoff), true);
});

test('validateNarrativeHandoff rejects stale or broadened worker output', () => {
  const { packet, handoff } = fixture();
  const stale = structuredClone(handoff);
  stale.input_versions[1].version = 'changed';
  assert.throws(() => validateNarrativeHandoff(packet, stale), /input_versions differ/);

  const mutated = structuredClone(handoff);
  mutated.output_versions[0].version = 'new-prose';
  assert.throws(() => validateNarrativeHandoff(packet, mutated), /exact reviewed Locked Scene bytes/);

  const canonChange = structuredClone(handoff);
  canonChange.canon_changes.none = false;
  assert.throws(() => validateNarrativeHandoff(packet, canonChange), /must not report canon changes/);
});
