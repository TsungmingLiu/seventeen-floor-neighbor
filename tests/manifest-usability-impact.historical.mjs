import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { projectRoot } from '../tools/content-lib.mjs';
import { writeProductionImpact } from '../tools/production-impact.mjs';

const runId = 'issue16-com00-mua-20260927';
const manifestPath = 'content/production/cg-manifests/opening-ch1.json';

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { stdio: 'pipe', encoding: 'utf8' }).trim();
}

async function checkoutFor(task) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'manifest-impact-'));
  const checkout = path.join(temporary, 'checkout');
  git(projectRoot, 'worktree', 'add', '--detach', checkout, 'HEAD');
  try {
    const ledger = JSON.parse(await readFile(path.join(checkout,
      `content/production/runs/${runId}/ledger.json`)));
    const impact = () => writeProductionImpact({ sceneId: 'COM-00',
      from: ledger.source_ref, to: 'HEAD', runId, root: checkout });
    const commit = (relative) => {
      git(checkout, 'add', '--', relative);
      git(checkout, '-c', 'user.name=Impact Test', '-c', 'user.email=impact@example.invalid',
        'commit', '-qm', `Change ${relative} for manifest impact test`);
    };
    await task({ checkout, ledger, impact, commit });
  } finally {
    git(projectRoot, 'worktree', 'remove', '--force', checkout);
    await rm(temporary, { recursive: true, force: true });
  }
}

test('actual manifest usability decision reconciles as current with no scene changes', async () => {
  await checkoutFor(async ({ impact }) => {
    const { impact: report } = await impact();
    assert.equal(report.qa_status, 'VERIFIED_RECORDED_MANIFEST_USABILITY_QA');
    assert.equal(report.run_reconciliation.task_id, 'MUA-COM00-001');
    assert.equal(report.run_reconciliation.recorded_status, 'RECORDED_PASS');
    assert.equal(report.run_reconciliation.target_status, 'CURRENT_PASS');
    assert.deepEqual(report.run_reconciliation.changed_versions, []);
    assert.equal(report.ledger_mutated, false);
  });
});

test('dialogue-only and another scene entry edit leave selected COM-00 review current', async () => {
  await checkoutFor(async ({ checkout, impact, commit }) => {
    const chapterPath = 'content/routes/opening-demo/chapter-01.json';
    const chapter = JSON.parse(await readFile(path.join(checkout, chapterPath)));
    chapter.nodes.common_movein_rain_open.text += ' dialogue test';
    await writeFile(path.join(checkout, chapterPath), `${JSON.stringify(chapter, null, 2)}\n`);
    commit(chapterPath);
    const dialogue = (await impact()).impact;
    assert.equal(dialogue.run_reconciliation.target_status, 'CURRENT_PASS');
    assert.ok(dialogue.changes.some((item) => item.changed_artifact_id === 'runtime_dialogue:COM-00'));
    assert.ok(!dialogue.would_invalidate.some((item) => item.startsWith('manifest_review:')));

    const manifest = JSON.parse(await readFile(path.join(checkout, manifestPath)));
    manifest.entries.find((entry) => entry.scene_id === 'COM-01X').narrative.purpose += ' unrelated test';
    await writeFile(path.join(checkout, manifestPath), `${JSON.stringify(manifest, null, 2)}\n`);
    commit(manifestPath);
    const unrelated = (await impact()).impact;
    assert.equal(unrelated.run_reconciliation.target_status, 'CURRENT_PASS');
    assert.deepEqual(unrelated.run_reconciliation.changed_versions, []);
  });
});

test('a selected visual entry edit proposes stale review and its accepted-base descendants', async () => {
  await checkoutFor(async ({ checkout, impact, commit }) => {
    const manifest = JSON.parse(await readFile(path.join(checkout, manifestPath)));
    manifest.entries.find((entry) => entry.entry_id === 'COM00-S04-BASE-NEUTRAL').camera.lens_intent += ' changed visual intent';
    await writeFile(path.join(checkout, manifestPath), `${JSON.stringify(manifest, null, 2)}\n`);
    commit(manifestPath);
    const { impact: report } = await impact();
    assert.equal(report.run_reconciliation.target_status, 'STALE_PROPOSED');
    assert.ok(report.run_reconciliation.changed_versions.some((item) =>
      item.id === 'manifest-entry:COM00-S04-BASE-NEUTRAL'));
    assert.ok(report.run_reconciliation.changed_versions.some((item) =>
      item.id === 'manifest-usability-qa:COM-00' && item.kind === 'output_versions'));
    assert.ok(report.would_invalidate.includes('manifest_review:COM00-S04-BASE-NEUTRAL'));
    assert.ok(report.would_invalidate.includes('manifest_review:COM00-S04-R01-POLITE-SMILE'));
    assert.ok(!report.would_invalidate.includes('narrative_review:COM-00'));
    assert.equal(report.ledger_mutated, false);
  });
});

test('relationship changes mark reviewed contract stale; a changed Locked Scene requires fresh upstream QA', async () => {
  await checkoutFor(async ({ checkout, impact, commit }) => {
    const contractPath = 'content/production/narrative/opening-ch1/COM-00.json';
    const contract = JSON.parse(await readFile(path.join(checkout, contractPath)));
    contract.exit_state.relationships[0].label += ' relationship test';
    await writeFile(path.join(checkout, contractPath), `${JSON.stringify(contract, null, 2)}\n`);
    commit(contractPath);
    const relationship = (await impact()).impact;
    assert.equal(relationship.run_reconciliation.target_status, 'STALE_PROPOSED');
    assert.equal(relationship.run_reconciliation.requires_fresh_upstream_narrative_qa, true);
    assert.ok(relationship.run_reconciliation.changed_versions.some((item) => item.location === contractPath));
    assert.ok(relationship.would_invalidate.some((item) => item.startsWith('manifest_review:COM00')));

    const scenePath = 'docs/narrative/scenes/vertical-slice/COM-00.md';
    await writeFile(path.join(checkout, scenePath), `${await readFile(path.join(checkout, scenePath), 'utf8')}\nNew test dialogue.\n`);
    commit(scenePath);
    const scene = (await impact()).impact;
    assert.equal(scene.run_reconciliation.target_status, 'STALE_PROPOSED');
    assert.equal(scene.run_reconciliation.requires_fresh_upstream_narrative_qa, true);
    assert.ok(scene.run_reconciliation.changed_versions.some((item) => item.location === scenePath));
  });
});

test('manifest review ignores unrelated canon text and stales on a reviewed upstream beat', async () => {
  await checkoutFor(async ({ checkout, impact, commit }) => {
    const baseline = (await impact()).impact;
    assert.equal(baseline.run_reconciliation.target_status, 'CURRENT_PASS');
    const relative = 'docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md';
    await writeFile(path.join(checkout, relative), `${await readFile(path.join(checkout, relative), 'utf8')}\nUnrelated test note.\n`);
    commit(relative);
    const { impact: unrelated } = await impact();
    assert.deepEqual(unrelated.changes, baseline.changes);
    assert.equal(unrelated.run_reconciliation.target_status, 'CURRENT_PASS');
    assert.deepEqual(unrelated.run_reconciliation.changed_versions, []);

    const source = path.join(checkout, relative);
    const original = await readFile(source, 'utf8');
    assert.ok(original.includes('**Entry**：遊戲起點。'));
    await writeFile(source, original.replace('**Entry**：遊戲起點。', '**Entry**：不同的劇情起點。'));
    commit(relative);
    const { impact: report } = await impact();
    assert.deepEqual(report.changes, baseline.changes);
    assert.equal(report.run_reconciliation.target_status, 'STALE_PROPOSED');
    assert.equal(report.run_reconciliation.requires_fresh_upstream_narrative_qa, true);
    assert.ok(report.run_reconciliation.changed_versions.some((item) =>
      item.kind === 'upstream_input_versions' && item.location === relative));
  });
});

test('wrong ref and tampered committed decision block and remove a stale impact report', async () => {
  await checkoutFor(async ({ checkout, ledger, impact, commit }) => {
    const destination = path.join(checkout, 'generated/session-cache/impact/COM-00/impact.json');
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, 'stale');
    await assert.rejects(writeProductionImpact({ sceneId: 'COM-00', from: 'HEAD',
      to: 'HEAD', runId, root: checkout }), /--from must equal ledger\.source_ref/);
    await assert.rejects(readFile(destination), { code: 'ENOENT' });

    const upstreamPath = 'content/production/runs/issue16-com00-nqa-20260926/NQA-COM00-001.decision.json';
    const originalUpstream = await readFile(path.join(checkout, upstreamPath));
    const upstream = JSON.parse(originalUpstream);
    upstream.status = 'FAIL';
    await writeFile(path.join(checkout, upstreamPath), `${JSON.stringify(upstream, null, 2)}\n`);
    commit(upstreamPath);
    await writeFile(destination, 'stale');
    await assert.rejects(impact(), /upstream Narrative QA ledger or receipt differs/);
    await assert.rejects(readFile(destination), { code: 'ENOENT' });
    await writeFile(path.join(checkout, upstreamPath), originalUpstream);
    commit(upstreamPath);

    const receiptPath = `content/production/runs/${runId}/MUA-COM00-001.decision.json`;
    const receipt = JSON.parse(await readFile(path.join(checkout, receiptPath)));
    receipt.qa_codes[0].result = 'FAIL';
    await writeFile(path.join(checkout, receiptPath), `${JSON.stringify(receipt, null, 2)}\n`);
    commit(receiptPath);
    await writeFile(destination, 'stale');
    await assert.rejects(impact(), /manifest usability decision receipt conflicts/);
    await assert.rejects(readFile(destination), { code: 'ENOENT' });
    assert.equal(ledger.tasks[0].status, 'PASS', 'read-only impact must not mutate the run ledger');
  });
});
