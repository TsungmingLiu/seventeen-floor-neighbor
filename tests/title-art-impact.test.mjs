import test from 'node:test';
import assert from 'node:assert/strict';
import { isIndependentTitleArtwork, readerFor, buildProductionImpact } from '../tools/production-impact.mjs';
import { projectRoot } from '../tools/content-lib.mjs';

const titlePath = 'content/production/cg-manifests/title-screen.json';
const assetsPath = 'content/assets/manifest.json';
const routePath = 'content/routes/opening-demo/route.json';
const receiptPath = 'content/assets/ingest-receipts/title-master-native-v1.json';
const base = readerFor(projectRoot, 'WORKTREE');
async function fixture(overrides = {}) {
  const reader = { ...base, async json(file) { return overrides[file] || base.json(file); } };
  const title = await reader.json(titlePath);
  const candidate = { file: titlePath, entry: title.entries[0], manifest: title };
  const entries = (await Promise.all((await reader.jsonFiles('content/production/cg-manifests')).map(async (file) => {
    const manifest = await reader.json(file); return manifest.entries.map((entry) => ({ file, entry, manifest }));
  }))).flat();
  return () => isIndependentTitleArtwork(reader, candidate, overrides[assetsPath] || null, {}, {}, {}, entries);
}
async function run(overrides = {}) {
  overrides[assetsPath] ||= await base.json(assetsPath);
  return (await fixture(overrides))();
}

test('independent adopted title excludes only exact title identity and verifies its own Human receipt', async () => {
  assert.equal(await run(), true);
  const changed = structuredClone(await base.json(titlePath)); changed.entries[0].entry_id = 'OTHER-RENDER-READY';
  assert.equal(await run({ [titlePath]: changed }), false);
  const receipt = structuredClone(await base.json(receiptPath)); receipt.humanDecision.sha256 = '0'.repeat(64);
  await assert.rejects(run({ [receiptPath]: receipt }), /Human master identity mismatch/);
});

test('title exclusion rejects story, Memory, Gallery, chapter card and accepted-base use', async () => {
  const id = 'bg.opening.title.17f_doorlight';
  for (const location of ['content/routes/opening-demo/chapter-01.json', 'content/routes/opening-demo/memories.json']) {
    const value = structuredClone(await base.json(location)); value.forbiddenTitleBinding = id;
    await assert.rejects(run({ [location]: value }), /story or Memory\/Gallery/);
  }
  const route = structuredClone(await base.json(routePath)); route.story.titleArt = id;
  await assert.rejects(run({ [routePath]: route }), /chapter cards or endings/);
  const assets = structuredClone(await base.json(assetsPath)); assets.assets[id].gallery = { title: 'Forbidden' };
  await assert.rejects(run({ [assetsPath]: assets }), /without Gallery/);
  for (const source of [id, 'TITLE-17F-DOORLIGHT-01', 'source.opening.title.17f_doorlight.master']) {
    const location = 'content/production/cg-manifests/opening-ch1-com02x.json';
    const manifest = structuredClone(await base.json(location));
    manifest.entries[0].reference_transport.attachments.push({ role: 'accepted_base', source_id: source });
    await assert.rejects(run({ [location]: manifest }), /cannot be an accepted base/);
  }
});

test('accepted scene CGs retain the historical shared-route impact and exact title exclusion', async () => {
  const report = await buildProductionImpact({ root: projectRoot, sceneId: 'COM-00',
    from: 'c5251cd2ac58e8daca0d034a0799b60c456dd7d7', to: 'WORKTREE' });
  // COM-03X changes shared ending/config; the title exemption must not hide that change.
  // These digests are computed from the historical/current scene route projections.
  assert.deepEqual(report.changes, [{
    changed_artifact_id: 'route_binding:COM-00',
    old_version: '7067bd963e0ee4ce38550c2d10c09ac27f51ed369370f7f93e92d6c14fad4240',
    new_version: '3b6468b600d0c9a301ff98cad735f3338f7b919fd47b74dfca362de02511cbcc',
    reason: 'route_allowlist_or_config_changed',
    would_invalidate: ['integration:COM-00', 'playable_review:COM-00']
  }]);
  assert.deepEqual(report.would_invalidate, ['integration:COM-00', 'playable_review:COM-00']);
  assert.deepEqual(report.excluded_reference_entry_ids, ['TITLE-17F-DOORLIGHT-01']);
  assert.ok(!report.compared_entry_ids.includes('TITLE-17F-DOORLIGHT-01'));
  assert.ok(report.compared_entry_ids.length > 0);
});
