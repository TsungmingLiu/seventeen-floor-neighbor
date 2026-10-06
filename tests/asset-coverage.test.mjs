import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { loadCoverageInputs, createCoverageReport, coverageExitCode, sha256 } from '../tools/asset-coverage.mjs';

const base = await loadCoverageInputs();
const manifestPath = 'content/assets/manifest.json';
const routePath = 'content/routes/opening-demo/route.json';
const storyPath = 'content/routes/opening-demo/chapter-01.json';
const memoriesPath = 'content/routes/opening-demo/memories.json';
const catalogPath = 'content/assets/source-catalog.json';
const sourceMapPath = 'content/assets/source-map.json';
const gatePath = 'content/assets/ingest-receipts/repo-source-gate3-v1.json';
const batchPath = 'content/assets/ingest-receipts/com02x-accepted-masters-v1.json';
const walkPath = 'content/assets/ingest-receipts/com02x-walk-adopted-master-v3.json';
const preview = 'bg.narrative_preview.placeholder';
const accepted = 'cg.opening.com00.s02_door_assist';
const report = (input = base) => createCoverageReport(input);
const document = (input, location) => input.documents[location].value;
const asset = (result, id) => result.assets.find((item) => item.assetId === id);
function clone() { return structuredClone(base); }
function updateDecisionHash(input, receiptPath) {
  const receipt = document(input, receiptPath);
  const decision = input.documents[receipt.humanDecision.path];
  decision.sha256 = sha256(JSON.stringify(decision.value));
  receipt.humanDecision.sha256 = decision.sha256;
}
// Accepted-as-is regression bindings belong to the exact pre-revision fixture.
function historicalBindings() {
  const input = clone();
  for (const location of [routePath, storyPath, memoriesPath]) {
    const value = JSON.parse(execFileSync('git', ['show', `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9:${location}`], { encoding: 'utf8' }));
    input.documents[location].value = value;
  }
  return input;
}
function clearFixture() {
  const input = clone();
  const route = document(input, routePath);
  route.assetIds = [accepted];
  route.story = { titleArt: accepted, endingArt: accepted };
  document(input, storyPath).nodes = { fixture: { visual: { mode: 'cg', asset: accepted } } };
  document(input, memoriesPath).events = [{ id: 'memory.fixture', cover: { asset: accepted }, galleryAssets: [accepted] }];
  return input;
}

test('current deterministic inventory distinguishes scene-local preview and adopted caveats', () => {
  const result = report();
  assert.equal(JSON.stringify(result), JSON.stringify(report()));
  assert.deepEqual(result.summary, {
    inventory: 22, runtimeBound: 20, declared: 20, referenced: 14, unused: 2,
    inventoryStatuses: { placeholder: 2, provisional: 2, accepted: 16, unverified: 2 },
    runtimeStatuses: { placeholder: 2, provisional: 2, accepted: 16, unverified: 0 },
    blockedRuntimeAssets: 8, bindingErrors: 1, coverageClear: false
  });
  for (const id of ['cg.opening.com02x.microwave_wait', 'cg.opening.com02x.walk_home']) {
    assert.equal(asset(result, id).runtimeBound, false);
    assert.deepEqual(asset(result, id).declaredInRoutes, []);
    assert.deepEqual(asset(result, id).references, []);
  }
  assert.equal(asset(result, preview).status, 'placeholder');
  assert.equal(asset(result, preview).runtimeBound, true);
  assert.deepEqual(result.bindingErrors, [{ code: 'PREVIEW_ROUTE_OPT_IN', routeId: 'opening-demo' }]);
  const allPreviewBindings = asset(result, preview).references.map(ref => ref.binding);
  const com03jBindings = allPreviewBindings.filter(binding =>
    binding.startsWith('node:common_recommend_discord_jyc_') || binding.startsWith('memory:mem.opening.ch1.recommend-discord-jyc:'));
  const previewBindings = allPreviewBindings.filter(binding => !com03jBindings.includes(binding));
  assert.ok(allPreviewBindings.length > 253, 'the five approved preview scenes add bound turns');
  assert.ok(com03jBindings.filter(binding => binding.startsWith('node:')).length >= 90);
  assert.deepEqual(com03jBindings.filter(binding => !binding.startsWith('node:')), [
    'memory:mem.opening.ch1.recommend-discord-jyc:cover',
    'memory:mem.opening.ch1.recommend-discord-jyc:titleBackdrop'
  ]);
  assert.deepEqual(previewBindings.filter(binding => !binding.startsWith('node:')), [
    'ending:demo_complete', 'endingArt',
    'memory:mem.opening.ch1.convenience-xu:cover', 'memory:mem.opening.ch1.convenience-xu:titleBackdrop',
    ...['first-cafe-jyc', 'station-cafe-jyc'].map(id => `memory:mem.opening.ch1.${id}:cover`),
    ...['taipei-street', 'weekday-outing', 'weekend-home'].flatMap(id => [`memory:mem.opening.ch1.${id}:cover`,`memory:mem.opening.ch1.${id}:titleBackdrop`])
  ]);
  for (const prefix of ['common_bookstore_bridge_', 'common_station_cafe_jyc_', 'common_recommend_discord_jyc_', 'COM03M-', 'OPEN-A-']) {
    assert.ok(allPreviewBindings.some(binding => binding.startsWith(`node:${prefix}`)), prefix);
  }
  assert.ok(allPreviewBindings.filter(binding => binding.startsWith('node:')).every(binding =>
    /^node:(common_package_xu_|com03x_|common_station_cafe_jyc_|com02j_|common_bookstore_bridge_|com01b_|common_acg_first_meet_(purchase|home_return)|common_weekend_home_|common_weekday_outing_|common_convenience_xu_|common_recommend_discord_jyc_|com03j_|COM03M-|OPEN-A-)/.test(binding)));
  assert.ok(result.assets.filter(item => item.references.some(ref => /^node:common_convenience_xu_/.test(ref.binding)))
    .every(item => item.assetId === preview || item.assetId === 'bg.opening.com02x.return_elevator_trial'));
  assert.equal(coverageExitCode(result), 0);
  assert.deepEqual(result.assets.filter(item => item.status === 'unverified').map(item => item.assetId), ['cg.opening.com02x.microwave_wait', 'cg.opening.com02x.walk_home']);
  assert.equal(coverageExitCode(result, { strict: true }), 1);
  assert.equal(result.scope.releaseReadiness, 'not_recorded');
  assert.equal(result.scope.playableAcceptance, 'not_assessed');
  assert.equal(result.scope.binaryBytesVerified, false);
  for (const item of result.assets) assert.equal(item.releaseReadiness, 'not_recorded');
});

test('reactivating a retired asset with an actual runtime reference binds it and fails provenance closed', () => {
  const input = clone();
  const id = 'cg.opening.com02x.microwave_wait';
  document(input, routePath).assetIds.push(id);
  const nodes = document(input, storyPath).nodes;
  nodes[Object.keys(nodes)[0]].visual = { mode: 'cg', asset: id };
  const result = report(input);
  assert.equal(asset(result, id).runtimeBound, true);
  assert.ok(asset(result, id).references.some((reference) => reference.binding.startsWith('node:')));
  assert.ok(asset(result, id).provenanceErrors.length > 0);
  assert.equal(coverageExitCode(result), 1);
  assert.equal(coverageExitCode(result, { strict: true }), 1);
});

test('controlled clear coverage passes strict without granting release/playable acceptance', () => {
  const result = report(clearFixture());
  assert.equal(result.summary.coverageClear, true);
  assert.equal(result.summary.runtimeBound, 1);
  assert.equal(coverageExitCode(result, { strict: true }), 0);
  assert.equal(asset(result, accepted).status, 'accepted');
  assert.equal(asset(result, accepted).releaseReadiness, 'not_recorded');
  assert.equal(result.scope.strictPassMeans, 'runtime_asset_coverage_clear_only');
});

test('declaring an unused preview blocks strict coverage and preview opt-in blocks strict', () => {
  const input = clearFixture();
  document(input, routePath).assetIds.push(preview);
  let result = report(input);
  assert.equal(asset(result, preview).references.length, 0);
  assert.equal(asset(result, preview).runtimeBound, true);
  assert.equal(coverageExitCode(result), 0);
  assert.equal(coverageExitCode(result, { strict: true }), 1);
  document(input, routePath).assetIds.pop();
  document(input, routePath).story.allowPreviewArt = true;
  result = report(input);
  assert.ok(result.bindingErrors.some((error) => error.code === 'PREVIEW_ROUTE_OPT_IN'));
  assert.equal(coverageExitCode(result), 0);
  assert.equal(coverageExitCode(result, { strict: true }), 1);
});

test('title, ending, composite, sprite, cinematic and all Memory bindings are counted', () => {
  const input = clearFixture();
  const route = document(input, routePath);
  route.assetIds.push(preview);
  route.story.titleArt = preview;
  route.story.endings = { fixture: { art: accepted } };
  document(input, storyPath).nodes = {
    fixture: { visual: { mode: 'composite', background: preview, sprites: [{ asset: accepted }] } },
    movie: { visual: { mode: 'cinematic', asset: accepted } }
  };
  document(input, memoriesPath).events[0].titleBackdropAsset = preview;
  const result = report(input);
  const refs = asset(result, preview).references.map((ref) => ref.binding);
  assert.deepEqual(refs, ['memory:memory.fixture:titleBackdrop', 'node:fixture:background', 'titleArt']);
  assert.ok(asset(result, accepted).references.some((ref) => ref.binding === 'ending:fixture'));
  assert.ok(asset(result, accepted).references.some((ref) => ref.binding === 'memory:memory.fixture:gallery:0'));
  assert.ok(result.bindingErrors.some((error) => error.code === 'ASSET_KIND_MISMATCH'));
});

test('provisional receipt restriction overrides active-production catalog status', () => {
  const result = report();
  for (const id of ['cg.opening.com01j.base_guarded', 'cg.opening.com01j.r01_interested']) {
    assert.equal(asset(result, id).status, 'provisional');
    assert.equal(asset(result, id).adoptionScope, 'demo_only_provisional_wardrobe');
    assert.ok(asset(result, id).releaseConstraints.includes('PROVISIONAL_DEMO_SCOPE'));
  }
});

test('as-is decisions retain exact acceptance, QA FAIL and known issues in their historical bindings', () => {
  const result = report(historicalBindings());
  for (const id of ['bg.opening.com02x.convenience_night', 'cg.opening.com02x.recognition', 'cg.opening.com02x.microwave_wait', 'cg.opening.com02x.walk_home']) {
    const item = asset(result, id);
    assert.equal(item.status, 'accepted');
    assert.equal(item.disposition, 'ACCEPTED_AS_IS');
    assert.equal(item.visualQaStatus, 'FAIL');
    assert.ok(item.knownIssues.includes('VISUAL_QA_FAIL'));
    assert.equal(item.evidence.length, 2);
    assert.ok(item.evidence.every((v) => /^[a-f0-9]{64}$/.test(v.sha256)));
    assert.equal(item.coverageClear, false);
  }
});

test('missing receipt and catalog acceptance alone fail closed', () => {
  const input = clearFixture();
  delete input.documents[gatePath];
  const result = report(input);
  assert.equal(asset(result, accepted).status, 'unverified');
  assert.ok(asset(result, accepted).provenanceErrors.includes('ADOPTION_RECEIPT_MISSING'));
  assert.equal(coverageExitCode(result), 1);
});

test('corrupt receipt identities, master/runtime locators and duplicate provenance fail closed', () => {
  for (const mutate of [
    (input) => { document(input, gatePath).gate = 'unknown'; },
    (input) => { document(input, gatePath).acceptedAssets.find((v) => v.logicalAssetId === accepted).repoPath = 'assets-src/wrong.webp'; },
    (input) => { document(input, catalogPath).files[document(input, manifestPath).assets[accepted].masterSourceId].logicalAssetId = 'wrong'; },
    (input) => { document(input, sourceMapPath).files[document(input, manifestPath).assets[accepted].src].source = 'assets-src/wrong.webp'; },
    (input) => { const rows = document(input, gatePath).acceptedAssets; rows.push(structuredClone(rows.find((v) => v.logicalAssetId === accepted))); }
  ]) {
    const input = clearFixture(); mutate(input);
    const result = report(input);
    assert.equal(asset(result, accepted).status, 'unverified');
    assert.equal(coverageExitCode(result, { strict: true }), 1);
  }
});

test('missing or corrupt Human decision hash/identity cannot grant as-is adoption', () => {
  for (const mutate of [
    (input, receipt) => { delete input.documents[receipt.humanDecision.path]; },
    (input, receipt) => { input.documents[receipt.humanDecision.path].sha256 = '0'.repeat(64); },
    (input, receipt) => { document(input, receipt.humanDecision.path).decision_id = 'wrong'; updateDecisionHash(input, batchPath); },
    (input, receipt) => { document(input, receipt.humanDecision.path).accepted_assets[0].filename = 'wrong.png'; updateDecisionHash(input, batchPath); },
    (input, receipt) => { document(input, receipt.humanDecision.path).accepted_assets[0].visual_qa_status = 'PASS'; updateDecisionHash(input, batchPath); }
  ]) {
    const input = clone(); mutate(input, document(input, batchPath));
    assert.equal(asset(report(input), 'bg.opening.com02x.convenience_night').status, 'unverified');
  }
});

test('walking adopted receipt requires exact output locator and preserves original FAIL', () => {
  const input = clone();
  const receipt = document(input, walkPath);
  document(input, receipt.humanDecision.path).output_versions[0].location = 'assets-src/wrong.png';
  updateDecisionHash(input, walkPath);
  assert.ok(asset(report(input), 'cg.opening.com02x.walk_home').provenanceErrors.includes('HUMAN_MASTER_LOCATOR_MISMATCH'));
  const changed = clone();
  document(changed, walkPath).visualQa.status = 'PASS';
  assert.ok(asset(report(changed), 'cg.opening.com02x.walk_home').provenanceErrors.includes('QA_HISTORY_MISMATCH'));
});

test('derivative, receipted node and receipted Memory bindings cannot drift', () => {
  for (const mutate of [
    (input) => { document(input, walkPath).assets[0].derivativeSha256 = '0'.repeat(64); },
    (input) => { document(input, storyPath).nodes.common_convenience_xu_checkout_04.visual.asset = accepted; },
    (input) => { document(input, memoriesPath).events.find((event) => event.id === 'mem.opening.ch1.convenience-xu').galleryAssets = []; }
  ]) {
    const input = clone(); mutate(input);
    assert.equal(asset(report(input), 'cg.opening.com02x.walk_home').status, 'unverified');
  }
});

test('unknown declared/reference assets, unallowlisted Memory and route identity fail', () => {
  for (const mutate of [
    (input) => { document(input, routePath).assetIds.push('unknown.asset'); },
    (input) => { document(input, routePath).story.titleArt = 'unknown.asset'; },
    (input) => { document(input, memoriesPath).events[0].titleBackdropAsset = preview; },
    (input) => { document(input, routePath).id = 'wrong-route'; }
  ]) {
    const input = clearFixture(); mutate(input);
    assert.ok(report(input).bindingErrors.length > 0);
    assert.equal(coverageExitCode(report(input)), 1);
  }
});

test('unknown preview receipt scope and missing runtime locator fail closed', () => {
  const input = clone();
  document(input, 'content/assets/ingest-receipts/narrative-preview-placeholder-v1.json').lifecycle = 'ACCEPTED';
  assert.equal(asset(report(input), preview).status, 'unverified');
  const missing = clearFixture();
  delete document(missing, sourceMapPath).files[document(missing, manifestPath).assets[accepted].src];
  assert.equal(asset(report(missing), accepted).status, 'unverified');
});

test('loader records malformed JSON and rejects route path escapes without loading them', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'asset-coverage-'));
  try {
    await mkdir(path.join(dir, 'content/routes'), { recursive: true });
    await mkdir(path.join(dir, 'content/assets'), { recursive: true });
    await writeFile(path.join(dir, manifestPath), '{invalid');
    await writeFile(path.join(dir, 'content/routes/index.json'), JSON.stringify({ routes: [{ id: 'escape', config: '../outside.json' }], defaultRoute: 'escape' }));
    const input = await loadCoverageInputs(dir);
    assert.ok(input.sourceErrors.some((error) => error.code === 'SOURCE_PATH_INVALID'));
    assert.ok(input.sourceErrors.some((error) => error.location === manifestPath));
    assert.equal(coverageExitCode(report(input), { strict: true }), 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('CLI JSON is deterministic and strict mode returns expected failure', () => {
  const cli = fileURL();
  const first = spawnSync(process.execPath, [cli], { encoding: 'utf8' });
  const second = spawnSync(process.execPath, [cli], { encoding: 'utf8' });
  const strict = spawnSync(process.execPath, [cli, '--strict'], { encoding: 'utf8' });
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.stdout, first.stdout);
  assert.equal(strict.status, 1, strict.stderr);
  assert.equal(strict.stdout, first.stdout);
  assert.equal(JSON.parse(first.stdout).summary.runtimeBound, 20);
});
function fileURL() { return new URL('../tools/asset-coverage.mjs', import.meta.url).pathname; }


test('initial title background preserves as-is QA and fails closed for corrupt provenance or story use', () => {
  const id = 'bg.opening.title.17f_doorlight';
  const path = 'content/assets/ingest-receipts/title-master-native-v1.json';
  const title = asset(report(), id);
  assert.equal(title.status, 'accepted'); assert.equal(title.visualQaStatus, 'NEEDS_REVIEW');
  assert.deepEqual(title.references.map((r) => r.binding), ['initialTitleArt']);
  for (const mutate of [
    (input) => { document(input, path).assets[0].masterPath = 'assets-src/wrong.png'; },
    (input) => { document(input, path).visualQa.status = 'PASS'; },
    (input) => { document(input, path).humanDecision.sha256 = '0'.repeat(64); },
    (input) => { document(input, storyPath).nodes.fixture = { visual: { mode: 'composite', background: id } }; }
  ]) {
    const input = clone(); mutate(input); assert.equal(asset(report(input), id).status, 'unverified');
  }
  const missing = clone(); document(missing, routePath).assetIds = document(missing, routePath).assetIds.filter((v) => v !== id);
  assert.ok(report(missing).bindingErrors.some((e) => e.code === 'ASSET_NOT_ALLOWLISTED' && e.binding === 'initialTitleArt'));
});


test('exact elevator trial remains preview-only with FAIL history and strict release rejection', () => {
  const id = 'bg.opening.com02x.return_elevator_trial';
  const current = asset(report(), id);
  assert.equal(current.status, 'placeholder');
  assert.equal(current.adoptionScope, 'narrative_preview_only');
  assert.equal(current.disposition, 'trial-only');
  assert.equal(current.visualQaStatus, 'FAIL');
  assert.deepEqual(current.provenanceErrors, []);
  assert.deepEqual(current.references.map(ref => ref.binding).sort(), ['node:common_convenience_xu_exit:background', 'node:common_convenience_xu_exit_02:background'].sort());
  assert.equal(coverageExitCode(report()), 0);
  assert.equal(coverageExitCode(report(), { strict: true }), 1);
  const receiptPath = 'content/assets/ingest-receipts/return-elevator-trial-v1.json';
  for (const mutate of [
    input => { document(input, receiptPath).original.sourcePath = 'assets-src/wrong.png'; },
    input => { document(input, receiptPath).derivative.sourcePath = 'assets-src/wrong.webp'; },
    input => { document(input, receiptPath).humanDecision.sha256 = '0'.repeat(64); },
    input => { document(input, receiptPath).sourceQa.sha256 = '0'.repeat(64); },
    input => { document(input, receiptPath).sourceQa.status = 'PASS'; },
    input => { document(input, receiptPath).lifecycle = 'ACCEPTED'; },
    input => { document(input, receiptPath).scope.nodeIds.push('common_convenience_xu_exit_03'); },
    input => { document(input, routePath).story.allowPreviewArt = false; },
    input => { document(input, memoriesPath).events[0].galleryAssets.push(id); }
  ]) {
    const input = clone(); mutate(input);
    const changed = report(input);
    assert.equal(asset(changed, id).status, 'unverified');
    assert.ok(asset(changed, id).provenanceErrors.length);
    assert.equal(coverageExitCode(changed), 1);
  }
});
