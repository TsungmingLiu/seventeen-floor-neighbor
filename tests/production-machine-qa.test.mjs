import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateManifestSceneBindings } from '../tools/validate-production-contracts.mjs';

const manifestPath = 'content/production/cg-manifests/opening-ch1.json';
const contractPaths = [
  'content/production/narrative/opening-ch1/COM-00.json',
  'content/production/narrative/opening-ch1/COM-01X.json',
  'content/production/narrative/opening-ch1/COM-01J.json'
];

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

test('Opening manifest scene bindings pass and reject mismatched or missing contracts', async () => {
  const manifest = await readJson(manifestPath);
  const contracts = await Promise.all(contractPaths.map(readJson));

  assert.doesNotThrow(() => validateManifestSceneBindings(manifest, manifestPath, contracts));

  const wrongSource = structuredClone(manifest);
  const entry = wrongSource.entries.find((candidate) => candidate.scene_id === 'COM-01X' && candidate.entry_id !== wrongSource.entries[0].entry_id);
  assert.ok(entry, 'expected a non-first COM-01X manifest entry');
  entry.source_scene = contracts.find((contract) => contract.scene_id === 'COM-01J').source_scene;
  assert.throws(
    () => validateManifestSceneBindings(wrongSource, manifestPath, contracts),
    (error) => error.message.includes(entry.entry_id) && error.message.includes('source_scene')
  );

  const missingContract = contracts.filter((contract) => contract.scene_id !== 'COM-01J');
  assert.throws(
    () => validateManifestSceneBindings(manifest, manifestPath, missingContract),
    /COM-01J.*no Narrative Continuity Contract/
  );
});
