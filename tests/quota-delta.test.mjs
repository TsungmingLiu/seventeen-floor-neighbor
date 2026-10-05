import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { buildDelta, deltaCases, planDelta, projectDelta, requiresFull, sceneGraph, scoreDelta } from '../tools/delta-review-poc.mjs';

const ref = '013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9';
const scene = execFileSync('git', ['show', `${ref}:docs/narrative/scenes/vertical-slice/COM-02X.md`], { encoding: 'utf8' });

test('dialogue shape is only provisional; dependency projection retains siblings, shared payoff tail and exact evidence', () => {
  const [first, second, hard] = deltaCases(scene);
  const plan = planDelta(first.before, first.text);
  assert.equal(plan.mode, 'DELTA_PROVISIONAL');
  assert.equal(plan.final_full_required, true);
  assert.ok(plan.selected_nodes.includes('common_convenience_xu_work'));
  assert.ok(plan.selected_nodes.includes('common_convenience_xu_checkout'));
  assert.ok(plan.selected_nodes.includes('common_convenience_xu_exit'));
  const branchPlan = planDelta(second.before, second.text);
  for (const id of ['com02x_ask_food', 'com02x_share_work', 'com02x_tease_same', 'com02x_tell_eat_better', 'common_convenience_xu_choice', 'common_convenience_xu_recognize']) assert.ok(branchPlan.selected_nodes.includes(id));
  const projected = projectDelta(first.text, plan);
  assert.ok(projected.text.includes('晚安！'));
  assert.ok(projected.text.includes('我大部分時間在家工作'));
  assert.ok(projected.text.includes('contact_xu: false'));
  assert.ok(projected.text.includes('## Dialogue writing notes'));
  for (const part of projected.excerpts) {
    assert.ok(projected.text.includes(first.text.split('\n').slice(part.start_line - 1, part.end_line).join('\n')));
    assert.match(part.sha256, /^[0-9a-f]{64}$/);
  }
  // Deliberate semantic counterexample: shape checks cannot certify meaning.
  assert.equal(planDelta(hard.before, hard.text).mode, 'DELTA_PROVISIONAL');
});

test('topology, state, narrator/action, identities, fact cues, source drift and broad edits fail closed to full review', () => {
  const mutate = (a, b) => planDelta(scene, scene.replace(a, b));
  assert.equal(mutate('→ Rejoin `common_convenience_xu_work`', '→ Rejoin `common_convenience_xu_exit`').mode, 'FULL_REQUIRED');
  assert.equal(mutate('contact_xu: false', 'contact_xu: true').mode, 'FULL_REQUIRED');
  assert.equal(mutate('### `common_convenience_xu_exit`', '### `new_exit`').mode, 'FULL_REQUIRED');
  assert.equal(mutate('**Xu Tang**：嗯。你還沒吃？', '**Other Person**：嗯。你還沒吃？').mode, 'FULL_REQUIRED');
  assert.equal(mutate('**Protagonist**：欸，許棠。妳也下來買東西？', '**Protagonist**：我已經存好妳的電話號碼。').mode, 'FULL_REQUIRED');
  assert.equal(mutate('晚上十一點多', '晚上十二點多').mode, 'FULL_REQUIRED');
  assert.equal(planDelta(scene, deltaCases(scene)[0].text, { changedSources: ['canon.json'] }).mode, 'FULL_REQUIRED');
  assert.equal(planDelta(scene, scene).mode, 'NO_CHANGE');
  const twoBlocks = deltaCases(scene)[0].text.replace('**Xu Tang**：喔，我懂。', '**Xu Tang**：嗯，我懂。');
  assert.equal(planDelta(scene, twoBlocks).mode, 'FULL_REQUIRED');
  assert.throws(() => sceneGraph(scene.replace('### `common_convenience_xu_exit`', '### `common_convenience_xu_work`')), /duplicate/);
});

test('delta fixtures and full/delta/final inputs rebuild exactly with no gold in model view', async () => {
  const result = await buildDelta({ ref });
  assert.deepEqual(result, await buildDelta({ ref }));
  const files = new Map(result.files);
  assert.equal(result.manifest.trial_schedule.length, 8);
  assert.equal(result.manifest.matrix.length, 6);
  assert.ok(files.get('foundation.input.md').includes(scene));
  assert.ok(files.get('final.input.md').includes(deltaCases(scene)[1].text));
  for (const item of deltaCases(scene)) {
    assert.ok(files.get(`full-${item.id}.input.md`).includes(item.text));
    assert.ok(!files.get(`delta-${item.id}.input.md`).includes('scoring-key'));
    assert.ok(!files.get(`delta-${item.id}.input.md`).includes('"kind": "hard"'));
  }
  assert.ok(files.get('instructions.md').includes('meaning'));
  assert.ok(files.get('instructions.md').includes('NQA-DIALOGUE-NATURALISM'));
  assert.ok(files.get('delta-D03.input.md').includes('在辦公室工作'));
});

test('inclusive budget charges fallback and final full, reports regressions and never auto-approves adoption', () => {
  const names = ['foundation', 'full-D01', 'delta-D01', 'delta-D02', 'full-D02', 'delta-D03', 'full-D03', 'final'];
  const key = deltaCases(scene).map(({ before, text, ...item }) => item);
  const records = names.map((name) => ({ name, total_tokens: name.startsWith('delta-') ? 60 : 100,
    result: { status: name.endsWith('D03') ? 'FAIL' : 'PASS', naturalism: 'PASS', findings: name.endsWith('D03')
      ? [{ category: 'knowledge', severity: 'hard', node: 'common_convenience_xu_work', evidence: 'office', reason: 'contradiction' }] : [] } }));
  const score = scoreDelta(records, key);
  assert.deepEqual(score.low_risk_iteration_budget, { full_tokens: 400, delta_tokens: 420, reduction_percent: -5, required_intermediate_full_reviews: ['full-D01'], includes_foundation_and_final_full: true });
  assert.equal(score.mixed_probe_budget.full_tokens, 500);
  assert.equal(score.mixed_probe_budget.delta_tokens, 580);
  assert.equal(score.mixed_probe_budget.reduction_percent, -16);
  assert.equal(score.actual_unique_trial_tokens, 680);
  assert.equal(score.mechanical_threshold_met, false);
  assert.equal(score.adoption, 'NOT_APPROVED');
  assert.equal(requiresFull({ status: 'NEEDS_REVIEW', findings: [] }), true);
  assert.equal(requiresFull({ status: 'PASS', findings: [{ severity: 'hard' }] }), true);
  assert.throws(() => scoreDelta(records.slice(1), key), /eight/);
  const missed = structuredClone(records);
  missed.find((row) => row.name === 'delta-D03').result.findings = [];
  missed.find((row) => row.name === 'delta-D03').result.status = 'PASS';
  assert.equal(scoreDelta(missed, key).mechanical_threshold_met, false);
  const fallbackBase = structuredClone(records);
  fallbackBase.find((row) => row.name === 'delta-D01').result.status = 'NEEDS_REVIEW';
  // full-D01 is already mandatory as D02's base; do not charge it twice.
  assert.equal(scoreDelta(fallbackBase, key).low_risk_iteration_budget.delta_tokens, 420);
});
