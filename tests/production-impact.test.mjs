import test from 'node:test';
import assert from 'node:assert/strict';
import { compareSceneSnapshots, snapshotScene, readerFor } from '../tools/production-impact.mjs';
import { projectRoot } from '../tools/content-lib.mjs';
import { sha256, stableStringify } from '../tools/render-cg-packets.mjs';

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
    handoff: 'content/production/runs/synthetic/qa.handoff.json'
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
