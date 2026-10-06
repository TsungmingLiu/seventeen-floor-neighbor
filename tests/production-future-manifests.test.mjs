import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, mkdir, writeFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { validateReturnElevatorTrial, RETURN_ELEVATOR_TRIAL_RECEIPT, RETURN_ELEVATOR_TRIAL_HUMAN, RETURN_ELEVATOR_TRIAL_QA } from '../tools/validate-production-contracts.mjs';
import { createHash } from 'node:crypto';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceManifest = 'content/production/cg-manifests/opening-ch1-com01b.json';
const injectedManifest = 'content/production/cg-manifests/future/chapter-two.json';

async function isolatedRepository(t) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'production-future-manifest-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await cp(repository, root, { recursive: true, filter: (source) => !source.split(path.sep).includes('.git') && !source.includes(`${path.sep}node_modules`) });
  // The source boundary checks the index and immutable legacy Git objects.
  execFileSync('git', ['-C', root, 'init', '-q']);
  const common = execFileSync('git', ['-C', repository, 'rev-parse', '--git-common-dir'], { encoding: 'utf8' }).trim();
  await mkdir(path.join(root, '.git/objects/info'), { recursive: true });
  await writeFile(path.join(root, '.git/objects/info/alternates'),
    `${path.resolve(repository, common)}/objects\n`);
  return root;
}

async function putManifest(root, manifest) {
  const target = path.join(root, injectedManifest);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`);
}

function validate(root) {
  return spawnSync('npm', ['run', 'production:validate'], { cwd: root, encoding: 'utf8' });
}

async function baseManifest(root) {
  return JSON.parse(await readFile(path.join(root, sourceManifest), 'utf8'));
}

function withUniqueIdentities(manifest) {
  const idMap = new Map([[manifest.manifest_id, 'future-chapter-two']]);
  for (const [index, entry] of manifest.entries.entries()) {
    idMap.set(entry.entry_id, `FUTURE-CG-${String(index + 1).padStart(2, '0')}`);
    idMap.set(entry.output.canonical_asset_id, `cg.future.chapter-two.${String(index + 1).padStart(2, '0')}`);
    idMap.set(entry.output.logical_asset_id, `future_chapter_two_scene_${String(index + 1).padStart(2, '0')}`);
  }
  const rewrite = (value) => {
    if (Array.isArray(value)) return value.map(rewrite);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewrite(item)]));
    return typeof value === 'string' ? idMap.get(value) ?? value : value;
  };
  return rewrite(manifest);
}

test('walking as-is exception rejects invented QA PASS and unknown catalog sources', async (t) => {
  const root = await isolatedRepository(t);
  const receiptPath = path.join(root, 'content/assets/ingest-receipts/com02x-walk-adopted-master-v3.json');
  const originalReceipt = await readFile(receiptPath, 'utf8');
  const forgedReceipt = JSON.parse(originalReceipt);
  forgedReceipt.assets[0].visualQaStatus = 'PASS';
  await writeFile(receiptPath, `${JSON.stringify(forgedReceipt, null, 2)}\n`);
  const inventedPass = validate(root);
  assert.notEqual(inventedPass.status, 0, `${inventedPass.stdout}\n${inventedPass.stderr}`);
  assert.match(inventedPass.stderr, /walking acceptance exceeds its exact as-is scope/);
  await writeFile(receiptPath, originalReceipt);
  const catalogPath = path.join(root, 'content/assets/source-catalog.json');
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
  catalog.files['source.unreceipted.walk-copy'] = structuredClone(catalog.files['source.com02x.walk-v3']);
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  const unknownSource = validate(root);
  assert.notEqual(unknownSource.status, 0, `${unknownSource.stdout}\n${unknownSource.stderr}`);
  assert.match(unknownSource.stderr, /source catalog contains an unknown or unreceipted source/);
});

test('production validation discovers nested future manifests and rejects a mismatched scene source', async (t) => {
  const root = await isolatedRepository(t);
  const manifest = withUniqueIdentities(await baseManifest(root));
  manifest.entries[0].source_scene = 'docs/narrative/scenes/vertical-slice/COM-01J.md';
  await putManifest(root, manifest);

  const result = validate(root);
  assert.notEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stderr, /future\/chapter-two\.json/);
  assert.match(result.stderr, /source_scene does not match/);
});

test('production validation rejects identity collisions across manifest files', async (t) => {
  const root = await isolatedRepository(t);
  const manifest = await baseManifest(root);
  manifest.manifest_id = 'future-chapter-two';
  await putManifest(root, manifest);

  const result = validate(root);
  assert.notEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stderr, /duplicate.*(?:manifest_id|entry_id|canonical_asset_id|logical_asset_id)/i);
  assert.match(result.stderr, /future\/chapter-two\.json/);
});

test('a valid nested future manifest with unique identities passes production validation', async (t) => {
  const root = await isolatedRepository(t);
  const uniqueManifest = withUniqueIdentities(await baseManifest(root));
  await putManifest(root, uniqueManifest);

  const result = validate(root);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});


test('return elevator trial rejects altered provenance, quality claims and expanded runtime scope', async () => {
  const json = async file => JSON.parse(await readFile(path.join(repository, file), 'utf8'));
  const data = {
    catalog: await json('content/assets/source-catalog.json'), manifest: await json('content/assets/manifest.json'),
    sourceMap: await json('content/assets/source-map.json'), route: await json('content/routes/opening-demo/route.json'),
    chapter: await json('content/routes/opening-demo/chapter-01.json'), memories: await json('content/routes/opening-demo/memories.json'),
    receipt: await json(RETURN_ELEVATOR_TRIAL_RECEIPT), human: await json(RETURN_ELEVATOR_TRIAL_HUMAN), qa: await json(RETURN_ELEVATOR_TRIAL_QA),
    decisionHashes: { human: createHash('sha256').update(await readFile(path.join(repository, RETURN_ELEVATOR_TRIAL_HUMAN))).digest('hex'),
      qa: createHash('sha256').update(await readFile(path.join(repository, RETURN_ELEVATOR_TRIAL_QA))).digest('hex') }
  };
  assert.equal(validateReturnElevatorTrial(data), 1);
  for (const mutate of [
    d => { d.receipt.original.sha256 = '0'.repeat(64); },
    d => { d.receipt.derivative.sha256 = '0'.repeat(64); }
  ]) {
    const changed = structuredClone(data); mutate(changed);
    assert.equal(validateReturnElevatorTrial(changed), 1);
  }
  for (const mutate of [
    d => { d.receipt.humanDecision.sha256 = '0'.repeat(64); },
    d => { d.decisionHashes.qa = '0'.repeat(64); },
    d => { d.receipt.sourceQa.status = 'PASS'; },
    d => { d.qa.status = 'PASS'; },
    d => { d.receipt.lifecycle = 'ACCEPTED'; },
    d => { d.receipt.scope.independentDisplayQa = 'PASS'; },
    d => { d.receipt.knownIssues = []; },
    d => { d.receipt.original.sourcePath = 'assets-src/opening-ch1-preview/other.png'; },
    d => { d.receipt.derivative.conversion.resize = 'upscale'; },
    d => { d.route.story.allowPreviewArt = false; },
    d => { d.chapter.nodes.common_convenience_xu_exit_preview.visual.background = 'bg.opening.com02x.return_elevator_trial'; },
    d => { d.chapter.nodes.common_convenience_xu_exit.visual = { mode: 'cg', asset: 'bg.opening.com02x.return_elevator_trial' }; },
    d => { d.manifest.assets['bg.opening.com02x.return_elevator_trial'].gallery = { title: 'Forbidden' }; },
    d => { d.memories.events[0].cover.asset = 'bg.opening.com02x.return_elevator_trial'; }
  ]) {
    const changed = structuredClone(data); mutate(changed);
    assert.throws(() => validateReturnElevatorTrial(changed), /return elevator trial:/);
  }
});

test('nested opt-in future manifest cannot evade required embodiment validation', async (t) => {
  const root = await isolatedRepository(t);
  const manifest = withUniqueIdentities(await baseManifest(root));
  manifest.schema_version = '1.1.0';
  await putManifest(root, manifest);
  const result = validate(root);
  assert.notEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stderr, /scene_embodiment/);
});
