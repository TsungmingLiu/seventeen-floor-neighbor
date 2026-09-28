import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProductionImpact, compareSceneSnapshots, readerFor, snapshotScene, writeProductionImpact } from '../tools/production-impact.mjs';
import { projectRoot } from '../tools/content-lib.mjs';
import { sha256, stableStringify } from '../tools/render-cg-packets.mjs';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root = projectRoot;
const manifestPath = 'content/production/cg-manifests/opening-ch1.json';
const contractPath = 'content/production/narrative/opening-ch1/COM-01X.json';
const chapterPath = 'content/routes/opening-demo/chapter-01.json';
const lockedPath = 'docs/narrative/scenes/vertical-slice/COM-01X.md';

function editedReader(edits = {}) {
  const base = readerFor(root, 'HEAD');
  return {
    ...base,
    async json(name) {
      const value = await base.json(name);
      return edits[name]?.json ? edits[name].json(value) : value;
    },
    async text(name) {
      const value = await base.text(name);
      return edits[name]?.text ? edits[name].text(value) : value;
    }
  };
}

async function snapshot(reader = editedReader()) {
  return snapshotScene(reader, 'COM-01X');
}

function modifyManifest(entryId, edit) {
  return (manifest) => {
    const entry = manifest.entries.find((candidate) => candidate.entry_id === entryId);
    assert.ok(entry, `missing real manifest entry ${entryId}`);
    edit(entry, manifest);
    return manifest;
  };
}

const affects = (impact, predicate) => impact.would_invalidate.filter(predicate).sort();
const visualEntry = (id) => (value) => value.endsWith(`:${id}`) || value === `accepted_asset:${id}`;

test('runtime dialogue text change leaves CG artifacts intact', async () => {
  const before = await snapshot();
  const after = await snapshot(editedReader({
    [chapterPath]: { json: (chapter) => {
      chapter.nodes.common_elevator_restart_choice.text += '（測試文字變更）';
      return chapter;
    } }
  }));
  const impact = compareSceneSnapshots(before, after);
  assert.ok(impact.changes.some((item) => item.changed_artifact_id === 'runtime_dialogue:COM-01X'));
  assert.deepEqual(affects(impact, (item) => item.startsWith('manifest_review:') || item.startsWith('render_packet:') || item.startsWith('candidate:') || item.startsWith('accepted_asset:')), []);
  assert.ok(affects(impact, (item) => item === 'runtime_dialogue:COM-01X').length === 1);
});

test('R01 expression edit affects only R01 visual descendants and no narrative work', async () => {
  const before = await snapshot();
  const after = await snapshot(editedReader({
    [manifestPath]: { json: modifyManifest('COM01X-R01-RESTART', (entry) => { entry.characters[0].expression += '_test_edit'; }) }
  }));
  const impact = compareSceneSnapshots(before, after);
  for (const artifact of ['manifest_review:COM01X-R01-RESTART', 'render_packet:COM01X-R01-RESTART', 'candidate:COM01X-R01-RESTART']) {
    assert.ok(impact.would_invalidate.includes(artifact), `${artifact} should be invalidated`);
  }
  assert.ok(affects(impact, visualEntry('COM01X-R01-RESTART')).length > 0);
  assert.deepEqual(affects(impact, visualEntry('COM01X-BASE-NORMAL')), []);
  assert.deepEqual(affects(impact, visualEntry('COM01X-R02-DRY-SMILE')), []);
  assert.deepEqual(affects(impact, (item) => item.startsWith('narrative_review:') || item.startsWith('runtime_state:')), []);
});

test('contract exit relationship label and runtime route effect change affect narrative and this scene CG only', async () => {
  const before = await snapshot();
  const after = await snapshot(editedReader({
    [contractPath]: { json: (contract) => {
      contract.exit_state.relationships[0].label += '_changed';
      return contract;
    } },
    [chapterPath]: { json: (chapter) => {
      chapter.nodes.common_elevator_restart_choice.choices[0].effects.changed_route = true;
      return chapter;
    } }
  }));
  const impact = compareSceneSnapshots(before, after);
  assert.ok(affects(impact, (item) => item === 'narrative_review:COM-01X' || item === 'runtime_state:COM-01X').length > 0);
  for (const id of ['COM01X-BASE-NORMAL', 'COM01X-R01-RESTART', 'COM01X-R02-DRY-SMILE']) {
    assert.ok(affects(impact, visualEntry(id)).length > 0, `${id} should be invalidated`);
  }
  assert.deepEqual(affects(impact, (item) => item.includes('COM-01B') || item.includes('COM-01J')), []);
});

test('base camera edit invalidates base and both reaction images', async () => {
  const before = await snapshot();
  const after = await snapshot(editedReader({
    [manifestPath]: { json: modifyManifest('COM01X-BASE-NORMAL', (entry) => { entry.camera.lens_intent += ' (test edit)'; }) }
  }));
  const impact = compareSceneSnapshots(before, after);
  for (const id of ['COM01X-BASE-NORMAL', 'COM01X-R01-RESTART', 'COM01X-R02-DRY-SMILE']) {
    assert.ok(affects(impact, visualEntry(id)).length > 0, `${id} should be invalidated`);
  }
  assert.deepEqual(affects(impact, (item) => item.startsWith('narrative_review:') || item.startsWith('runtime_state:')), []);
});

test('locked scene change is conservative without QA and narrows with synthetic evidence only', async () => {
  const before = await snapshot();
  const after = await snapshot(editedReader({ [lockedPath]: { text: (text) => `${text}\nsynthetic text edit` } }));
  const conservative = compareSceneSnapshots(before, after);
  assert.ok(conservative.changes.some((item) => item.reason === 'locked_scene_change_requires_fresh_narrative_qa'));
  assert.ok(affects(conservative, visualEntry('COM01X-BASE-NORMAL')).length > 0);

  // This exercises the comparison gate only; it is not persisted QA and makes no PASS claim.
  const version = (value) => sha256(typeof value === 'string' ? value : stableStringify(value));
  const evidence = {
    scene_id: before.sceneId,
    old_scene_sha256: version(before.locked),
    new_scene_sha256: version(after.locked),
    decision: 'no_visual_impact',
    verified_from_persisted_qa: true,
    receipt: 'content/production/runs/synthetic/qa.decision.json'
  };
  const narrowed = compareSceneSnapshots(before, after, { noVisualImpactEvidence: evidence });
  assert.ok(narrowed.changes.some((item) => item.reason === 'dialogue_only_qa_confirmed'));
  assert.deepEqual(affects(narrowed, (item) => item.startsWith('manifest_review:') || item.startsWith('render_packet:') || item.startsWith('candidate:') || item.startsWith('accepted_asset:')), []);
  assert.equal(narrowed.qa_status, 'UNKNOWN_NO_RUN_LEDGER');
  assert.equal(narrowed.ledger_mutated, false);
});

test('whole-manifest version and another scene entry do not invalidate COM-01X', async () => {
  const before = await snapshot();
  const after = await snapshot(editedReader({
    [manifestPath]: { json: (manifest) => {
      manifest.manifest_version = 'synthetic unrelated version';
      const otherSceneEntry = manifest.entries.find((entry) => entry.scene_id !== 'COM-01X');
      assert.ok(otherSceneEntry, 'fixture must contain an unrelated scene entry');
      otherSceneEntry.camera.lens_intent += ' (unrelated scene edit)';
      return manifest;
    } }
  }));
  const impact = compareSceneSnapshots(before, after);
  assert.deepEqual(impact.changes, []);
  assert.equal(impact.manifest_reconciliation_required.length, 3);
  assert.ok(impact.manifest_reconciliation_required.every((item) =>
    item.action === 'RECONCILE_WITH_RECORDED_RUN_PROVENANCE'));
  assert.ok(before.images['COM01X-BASE-NORMAL']);
});

test('comparison fails closed for scene mismatch without mutating snapshots', async () => {
  const before = await snapshot();
  const after = { ...before, sceneId: 'COM-01J' };
  assert.throws(() => compareSceneSnapshots(before, after), /different scene IDs/);
  assert.equal(before.source, readerFor(root, 'HEAD').label);
  assert.equal(before.sceneId, 'COM-01X');
});

test('tampered accepted WebP bytes block the snapshot before an impact plan is produced', async () => {
  const before = await snapshot();
  const target = before.images['COM01X-BASE-NORMAL'].asset.master.sourcePath;
  const reader = editedReader();
  const original = reader.readBytes;
  reader.readBytes = async (name) => {
    const bytes = await original(name);
    if (name !== target) return bytes;
    const altered = Buffer.from(bytes);
    altered[altered.length - 1] ^= 1;
    return altered;
  };
  await assert.rejects(snapshot(reader), /accepted WebP bytes differ/);
});

const runId = 'issue16-com00-nqa-20260926';
const runLedgerPath = `content/production/runs/${runId}/ledger.json`;

function gitAt(checkout, ...args) {
  return execFileSync('git', ['-C', checkout, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
}

async function inDetachedCheckout(action) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'gate12-impact-'));
  const checkout = path.join(temporary, 'checkout');
  gitAt(root, 'worktree', 'add', '--detach', checkout, 'HEAD');
  try {
    const ledger = JSON.parse(await readFile(path.join(checkout, runLedgerPath), 'utf8'));
    return await action(checkout, ledger);
  } finally {
    gitAt(root, 'worktree', 'remove', '--force', checkout);
    await rm(temporary, { recursive: true, force: true });
  }
}

function commitChanged(checkout, relative) {
  gitAt(checkout, 'add', '--', relative);
  gitAt(checkout, '-c', 'user.name=Gate Test', '-c', 'user.email=gate@example.invalid',
    'commit', '-qm', `Change ${relative} for impact test`);
}

test('COM-00 recorded narrative PASS reconciles against the real decision without writing a ledger', async () => {
  await inDetachedCheckout(async (checkout, ledger) => {
    const options = { sceneId: 'COM-00', from: ledger.source_ref, to: 'HEAD', runId, root: checkout };
    const plain = await buildProductionImpact(options);
    const beforeLedger = await readFile(path.join(checkout, runLedgerPath));
    const { impact, path: reportPath } = await writeProductionImpact(options);
    assert.equal(impact.qa_status, 'VERIFIED_RECORDED_NARRATIVE_QA');
    assert.equal(impact.run_reconciliation.recorded_status, 'RECORDED_PASS');
    assert.equal(impact.run_reconciliation.target_status, 'CURRENT_PASS');
    assert.deepEqual(impact.run_reconciliation.changed_versions, []);
    assert.equal(impact.ledger_mutated, false);
    assert.deepEqual(impact.would_invalidate, plain.would_invalidate);
    assert.deepEqual(await readFile(path.join(checkout, runLedgerPath)), beforeLedger);
    assert.ok(reportPath.startsWith('generated/session-cache/impact/COM-00/'));
  });
});

test('changed committed Locked Scene proposes stale Narrative QA and conservative visual descendants', async () => {
  await inDetachedCheckout(async (checkout, ledger) => {
    const relative = 'docs/narrative/scenes/vertical-slice/COM-00.md';
    await writeFile(path.join(checkout, relative), `${await readFile(path.join(checkout, relative), 'utf8')}\nTest changed narrative beat.\n`);
    commitChanged(checkout, relative);
    const { impact } = await writeProductionImpact({ sceneId: 'COM-00', from: ledger.source_ref,
      to: 'HEAD', runId, root: checkout });
    assert.equal(impact.run_reconciliation.target_status, 'STALE_PROPOSED');
    assert.ok(impact.run_reconciliation.changed_versions.some((item) =>
      item.id === 'approved_locked_scene:COM-00' && item.old_version !== item.new_version));
    assert.ok(impact.changes.some((item) => item.reason === 'locked_scene_change_requires_fresh_narrative_qa'));
    assert.ok(impact.would_invalidate.includes('narrative_review:COM-00'));
    assert.ok(impact.would_invalidate.some((id) => id.startsWith('manifest_review:COM00')));
    assert.equal(impact.ledger_mutated, false);
  });
});

test('visual-only manifest edit preserves this run Narrative QA while proposing visual rework', async () => {
  await inDetachedCheckout(async (checkout, ledger) => {
    const relative = 'content/production/cg-manifests/opening-ch1.json';
    const manifest = JSON.parse(await readFile(path.join(checkout, relative), 'utf8'));
    const entry = manifest.entries.find((item) => item.scene_id === 'COM-00');
    assert.ok(entry);
    entry.camera.lens_intent += ' (controlled visual change)';
    await writeFile(path.join(checkout, relative), `${JSON.stringify(manifest, null, 2)}\n`);
    commitChanged(checkout, relative);
    const { impact } = await writeProductionImpact({ sceneId: 'COM-00', from: ledger.source_ref,
      to: 'HEAD', runId, root: checkout });
    assert.equal(impact.run_reconciliation.target_status, 'CURRENT_PASS');
    assert.deepEqual(impact.run_reconciliation.changed_versions, []);
    assert.ok(impact.would_invalidate.includes(`manifest_review:${entry.entry_id}`));
    assert.ok(!impact.would_invalidate.includes('narrative_review:COM-00'));
  });
});

test('unrelated canon text preserves QA, while a reviewed beat makes the task stale', async () => {
  await inDetachedCheckout(async (checkout, ledger) => {
    const relative = 'docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md';
    await writeFile(path.join(checkout, relative), `${await readFile(path.join(checkout, relative), 'utf8')}\nUnrelated test note.\n`);
    commitChanged(checkout, relative);
    const { impact: unrelated } = await writeProductionImpact({ sceneId: 'COM-00', from: ledger.source_ref,
      to: 'HEAD', runId, root: checkout });
    assert.deepEqual(unrelated.changes, []);
    assert.equal(unrelated.run_reconciliation.target_status, 'CURRENT_PASS');
    assert.deepEqual(unrelated.run_reconciliation.changed_versions, []);

    const source = path.join(checkout, relative);
    const original = await readFile(source, 'utf8');
    assert.ok(original.includes('**Entry**：遊戲起點。'));
    await writeFile(source, original.replace('**Entry**：遊戲起點。', '**Entry**：不同的劇情起點。'));
    commitChanged(checkout, relative);
    const { impact } = await writeProductionImpact({ sceneId: 'COM-00', from: ledger.source_ref,
      to: 'HEAD', runId, root: checkout });
    assert.deepEqual(impact.changes, []);
    assert.equal(impact.run_reconciliation.target_status, 'STALE_PROPOSED');
    assert.ok(impact.run_reconciliation.changed_versions.some((item) =>
      item.id.startsWith(`excerpt:${relative}:`) && item.old_version !== item.new_version));
  });
});

test('wrong source ref and tampered receipt BLOCK and clear any previous impact report', async () => {
  await inDetachedCheckout(async (checkout, ledger) => {
    const destination = path.join(checkout, 'generated/session-cache/impact/COM-00/impact.json');
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, 'stale');
    await assert.rejects(writeProductionImpact({ sceneId: 'COM-00', from: 'HEAD',
      to: 'HEAD', runId, root: checkout }), /--from must equal ledger\.source_ref/);
    await assert.rejects(readFile(destination), { code: 'ENOENT' });

    const receiptPath = `content/production/runs/${runId}/NQA-COM00-001.decision.json`;
    const receipt = JSON.parse(await readFile(path.join(checkout, receiptPath), 'utf8'));
    receipt.qa_codes[0].result = 'FAIL';
    await writeFile(path.join(checkout, receiptPath), `${JSON.stringify(receipt, null, 2)}\n`);
    commitChanged(checkout, receiptPath);
    await writeFile(destination, 'stale');
    await assert.rejects(writeProductionImpact({ sceneId: 'COM-00', from: ledger.source_ref,
      to: 'HEAD', runId, root: checkout }), /decision receipt conflicts/);
    await assert.rejects(readFile(destination), { code: 'ENOENT' });
  });
});
