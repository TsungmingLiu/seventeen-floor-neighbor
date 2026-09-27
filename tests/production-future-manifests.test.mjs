import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceManifest = 'content/production/cg-manifests/opening-ch1-com01b.json';
const injectedManifest = 'content/production/cg-manifests/future/chapter-two.json';

async function isolatedRepository(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'production-future-manifest-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await cp(repository, root, { recursive: true, filter: (source) => !source.includes(`${path.sep}.git`) && !source.includes(`${path.sep}node_modules`) });
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
