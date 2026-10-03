import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
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
    inventory: 21, runtimeBound: 21, declared: 21, referenced: 21, unused: 0,
    inventoryStatuses: { placeholder: 1, provisional: 2, accepted: 18, unverified: 0 },
    runtimeStatuses: { placeholder: 1, provisional: 2, accepted: 18, unverified: 0 },
    blockedRuntimeAssets: 9, bindingErrors: 1, coverageClear: false
  });
  assert.equal(asset(result, preview).status, 'placeholder');
  assert.equal(asset(result, preview).runtimeBound, true);
  assert.deepEqual(result.bindingErrors, [{ code: 'PREVIEW_ROUTE_OPT_IN', routeId: 'opening-demo' }]);
  const previewBindings = asset(result, preview).references.map(ref => ref.binding);
  assert.equal(previewBindings.length, 85);
  assert.equal(previewBindings.filter(binding => binding.startsWith('node:')).length, 83);
  assert.deepEqual(previewBindings.filter(binding => !binding.startsWith('node:')), ['ending:demo_complete', 'endingArt']);
  assert.ok(previewBindings.filter(binding => binding.startsWith('node:')).every(binding =>
    /^node:(common_package_xu_|com03x_)/.test(binding)));
  assert.ok(result.assets.filter(item => item.references.some(ref => /^node:common_convenience_xu_/.test(ref.binding)))
    .every(item => item.status === 'accepted' && item.assetId !== preview));
  assert.equal(coverageExitCode(result), 0);
  assert.equal(coverageExitCode(result, { strict: true }), 1);
  assert.equal(result.scope.releaseReadiness, 'not_recorded');
  assert.equal(result.scope.playableAcceptance, 'not_assessed');
  assert.equal(result.scope.binaryBytesVerified, false);
  for (const item of result.assets) assert.equal(item.releaseReadiness, 'not_recorded');
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

test('as-is decisions retain exact acceptance, QA FAIL and known issues', () => {
  const result = report();
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

test('corrupt receipt identities, master/runtime hashes and duplicate provenance fail closed', () => {
  for (const mutate of [
    (input) => { document(input, gatePath).gate = 'unknown'; },
    (input) => { document(input, gatePath).acceptedAssets.find((v) => v.logicalAssetId === accepted).sha256 = '0'.repeat(64); },
    (input) => { document(input, catalogPath).files[document(input, manifestPath).assets[accepted].masterSourceId].logicalAssetId = 'wrong'; },
    (input) => { document(input, sourceMapPath).files[document(input, manifestPath).assets[accepted].src].sha256 = '0'.repeat(64); },
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
    (input, receipt) => { document(input, receipt.humanDecision.path).accepted_assets[0].sha256 = '0'.repeat(64); updateDecisionHash(input, batchPath); },
    (input, receipt) => { document(input, receipt.humanDecision.path).accepted_assets[0].visual_qa_status = 'PASS'; updateDecisionHash(input, batchPath); }
  ]) {
    const input = clone(); mutate(input, document(input, batchPath));
    assert.equal(asset(report(input), 'bg.opening.com02x.convenience_night').status, 'unverified');
  }
});

test('walking adopted receipt requires exact output version and preserves original FAIL', () => {
  const input = clone();
  const receipt = document(input, walkPath);
  document(input, receipt.humanDecision.path).output_versions[0].version = '0'.repeat(64);
  updateDecisionHash(input, walkPath);
  assert.ok(asset(report(input), 'cg.opening.com02x.walk_home').provenanceErrors.includes('HUMAN_MASTER_HASH_MISMATCH'));
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

test('unknown preview receipt scope and missing runtime fingerprint fail closed', () => {
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
  assert.equal(JSON.parse(first.stdout).summary.runtimeBound, 21);
});
function fileURL() { return new URL('../tools/asset-coverage.mjs', import.meta.url).pathname; }


test('initial title background preserves as-is QA and fails closed for corrupt provenance or story use', () => {
  const id = 'bg.opening.title.17f_doorlight';
  const path = 'content/assets/ingest-receipts/title-master-native-v1.json';
  const title = asset(report(), id);
  assert.equal(title.status, 'accepted'); assert.equal(title.visualQaStatus, 'NEEDS_REVIEW');
  assert.deepEqual(title.references.map((r) => r.binding), ['initialTitleArt']);
  for (const mutate of [
    (input) => { document(input, path).assets[0].sha256 = '0'.repeat(64); },
    (input) => { document(input, path).visualQa.status = 'PASS'; },
    (input) => { document(input, path).humanDecision.sha256 = '0'.repeat(64); },
    (input) => { document(input, storyPath).nodes.fixture = { visual: { mode: 'composite', background: id } }; }
  ]) {
    const input = clone(); mutate(input); assert.equal(asset(report(input), id).status, 'unverified');
  }
  const missing = clone(); document(missing, routePath).assetIds = document(missing, routePath).assetIds.filter((v) => v !== id);
  assert.ok(report(missing).bindingErrors.some((e) => e.code === 'ASSET_NOT_ALLOWLISTED' && e.binding === 'initialTitleArt'));
});
