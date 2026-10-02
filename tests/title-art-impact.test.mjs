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

test('accepted scene CGs still compare against the explicit verified baseline', async () => {
  const report = await buildProductionImpact({ root: projectRoot, sceneId: 'COM-00',
    from: 'c5251cd2ac58e8daca0d034a0799b60c456dd7d7', to: 'WORKTREE' });
  assert.deepEqual(report.changes, []);
  assert.ok(!report.would_invalidate.includes('integration:COM-00'));
  assert.ok(report.excluded_reference_entry_ids.includes('TITLE-17F-DOORLIGHT-01'));
  assert.ok(!report.compared_entry_ids.includes('TITLE-17F-DOORLIGHT-01'));
  assert.ok(report.compared_entry_ids.length > 0);
});
