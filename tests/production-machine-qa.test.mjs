import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validateManifestSceneBindings, validateNarrativeContract } from '../tools/validate-production-contracts.mjs';

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

test('machine validation blocks a real scene with a wrong canonical binding before semantic QA', async () => {
  const realScenePath = 'docs/narrative/scenes/vertical-slice/COM-01X.md';
  const sceneText = await readFile(realScenePath, 'utf8');
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'production-contract-binding-'));
  const mutatedScenePath = path.join(temporaryDirectory, 'COM-01X.md');
  try {
    const contractPath = contractPaths.find((file) => file.endsWith('/COM-01X.json'));
    const contract = await readJson(contractPath);
    assert.doesNotThrow(() => validateNarrativeContract(contract, contractPath));
    const originalBinding = `- Canonical contract：\`${contractPath}\`。`;
    assert.ok(sceneText.includes(originalBinding), 'expected the real scene formal binding');
    const wrongBinding = sceneText.replace(
      originalBinding,
      '- Canonical contract：`content/production/narrative/opening-ch1/COM-01J.json`。'
    );
    assert.notEqual(wrongBinding, sceneText, 'expected to mutate the real scene contract binding');
    await writeFile(mutatedScenePath, `${wrongBinding}\nIncidental path mention: ${contractPath}\n`);
    const changedContract = { ...contract, source_scene: mutatedScenePath };
    assert.throws(
      () => validateNarrativeContract(changedContract, contractPath),
      /Canonical contract binding does not match/
    );
    await writeFile(mutatedScenePath, `${sceneText.replace(originalBinding, '')}\nIncidental path mention: ${contractPath}\n`);
    assert.throws(() => validateNarrativeContract(changedContract, contractPath), /exactly one Canonical contract binding/);
    await writeFile(mutatedScenePath, sceneText.replace(originalBinding, `${originalBinding}\n${originalBinding}`));
    assert.throws(() => validateNarrativeContract(changedContract, contractPath), /exactly one Canonical contract binding/);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
