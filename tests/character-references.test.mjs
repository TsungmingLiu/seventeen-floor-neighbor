import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { selectCharacterReferences, validateCharacterReferencePacks, validateCharacterReferencePackReceipt } from '../tools/character-references.mjs';
import { buildPackets, adaptApi, adaptChatManual, adaptWorkBatch, validateManifest } from '../tools/render-cg-packets.mjs';

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const catalog = read('content/assets/source-catalog.json');
const registry = read('content/assets/character-reference-packs.json');

test('Lin Ruoqing receipt rejects missing, duplicate, foreign and altered source evidence', () => {
  const receipt = read('content/assets/ingest-receipts/lin-ruoqing-reference-pack-20261003.json');
  assert.equal(validateCharacterReferencePackReceipt(receipt, 'lin_ruoqing').length, 6);
  for (const problem of ['missing', 'duplicate', 'foreign', 'sha256', 'role', 'runtime']) {
    const forged = structuredClone(receipt);
    if (problem === 'missing') forged.references.pop();
    if (problem === 'duplicate') forged.references[1] = structuredClone(forged.references[0]);
    if (problem === 'foreign') forged.references[0].sourceId = 'ref.xu_tang.face.01';
    if (problem === 'sha256') forged.references[0].sha256 = '0'.repeat(64);
    if (problem === 'role') forged.references[0].role = 'wardrobe';
    if (problem === 'runtime') forged.runtimeMasterAcceptance = 'ACCEPTED';
    assert.throws(() => validateCharacterReferencePackReceipt(forged, 'lin_ruoqing'), /receipt/);
  }
});

test('Lin Ruoqing selection resolves the actual A/B looks and optional shot needs', () => {
  const a = selectCharacterReferences({ characterId: 'lin_ruoqing', wardrobeKey: 'LRQ-WARDROBE-A-TEACHER-TROUSERS' });
  assert.deepEqual(a.map(item => item.source_id), ['ref.lin_ruoqing.face.01', 'ref.lin_ruoqing.production.04', 'ref.lin_ruoqing.wardrobe.a']);
  const b = selectCharacterReferences({ characterId: 'lin_ruoqing', wardrobeKey: 'LRQ-WARDROBE-B-BADMINTON', expression: true, body: true });
  assert.equal(b.length, 5);
  assert.ok(b.every(item => item.source_id.startsWith('ref.lin_ruoqing.')));
  assert.ok(b.some(item => item.source_id === 'ref.lin_ruoqing.wardrobe.b'));
  assert.ok(!b.some(item => item.source_id === 'ref.lin_ruoqing.wardrobe.a'));
  assert.throws(() => selectCharacterReferences({ characterId: 'lin_ruoqing', wardrobeKey: 'JYC-WARDROBE-B-CUTE-DATE' }), /unknown wardrobe/);
});
function manifestWithSelection(characterId, wardrobeKey, { expression = false, body = false } = {}) {
  const manifest = read('content/production/cg-manifests/opening-ch1.json');
  manifest.entries = [manifest.entries[0]];
  const entry = manifest.entries[0];
  entry.status = 'render_ready';
  const character = entry.characters[0];
  character.character_id = characterId;
  character.wardrobe_key = wardrobeKey;
  character.reference_requirements = { production_consistency: true, expression, body_proportions: body };
  character.reference_bindings = selectCharacterReferences({ characterId, wardrobeKey, expression, body });
  entry.reference_transport.attachments = [...character.reference_bindings, entry.environment.reference_binding]
    .filter(Boolean).map((binding) => ({ ...binding, pixels_must_be_visible: true }));
  return manifest;
}

test('both complete six-sheet packs are cataloged with uploaded byte fingerprints', () => {
  validateCharacterReferencePacks(catalog, registry);
  const receipt = read('content/assets/ingest-receipts/character-reference-packs-20260930.json');
  assert.equal(receipt.references.length, 12);
  assert.equal(new Set(receipt.references.map((record) => record.sourceId)).size, 12);
  for (const record of receipt.references) {
    assert.deepEqual(catalog.files[record.sourceId], Object.fromEntries(Object.entries(record).filter(([key]) => !['sourceId', 'uploadedFilename'].includes(key))));
  }
});

test('default and critical-shot stacks select one wardrobe and only the visible heroine', () => {
  const basic = selectCharacterReferences({ characterId: 'xu_tang', wardrobeKey: 'XT-WARDROBE-A-WEEKDAY-NEIGHBOR' });
  assert.equal(basic.length, 3);
  assert.ok(basic.every((binding) => binding.source_id.startsWith('ref.xu_tang.')));
  const extended = selectCharacterReferences({ characterId: 'jiang_yucheng', wardrobeKey: 'JYC-WARDROBE-B-CUTE-DATE', expression: true, body: true });
  assert.equal(extended.length, 5);
  assert.ok(extended.some((binding) => binding.source_id === 'ref.jiang_yucheng.wardrobe.b'));
  assert.ok(!extended.some((binding) => binding.source_id.endsWith('wardrobe.a')));
  assert.throws(() => selectCharacterReferences({ characterId: 'xu_tang', wardrobeKey: 'JYC-WARDROBE-B-CUTE-DATE' }), /unknown wardrobe/);
});

test('all adapters preserve the selected expression/body/production pixel bindings', () => {
  const manifest = manifestWithSelection('jiang_yucheng', 'JYC-WARDROBE-B-CUTE-DATE', { expression: true, body: true });
  const packets = buildPackets(manifest);
  const work = JSON.parse(adaptWorkBatch(packets).trim());
  const api = JSON.parse(adaptApi(packets));
  assert.deepEqual(work.reference_acquisition.required_bindings, packets[0].reference_transport.attachments);
  assert.equal(work.reference_acquisition.resolved_files.length, 6);
  assert.deepEqual(api.jobs[0].input.reference_transport, packets[0].reference_transport);
  for (const binding of packets[0].reference_transport.attachments) assert.ok(adaptChatManual(packets).includes(binding.expected_filename));
});

test('blocks cross-character references, wrong wardrobe sheet, missing acting and full-body input', () => {
  const original = manifestWithSelection('xu_tang', 'XT-WARDROBE-A-WEEKDAY-NEIGHBOR', { expression: true });
  for (const problem of ['other_character', 'wardrobe_b', 'missing_expression', 'full_body']) {
    const manifest = structuredClone(original);
    const entry = manifest.entries[0];
    const character = entry.characters[0];
    if (problem === 'other_character') character.reference_bindings[0] = selectCharacterReferences({ characterId: 'jiang_yucheng', wardrobeKey: 'JYC-WARDROBE-B-CUTE-DATE' })[0];
    if (problem === 'wardrobe_b') character.reference_bindings[2] = { role: 'wardrobe', source_id: 'ref.xu_tang.wardrobe.b', expected_filename: 'xt-ref-06-wardrobe-b.png' };
    if (problem === 'missing_expression') character.reference_bindings.pop();
    if (problem === 'full_body') entry.camera.shot_size = 'full_body';
    entry.reference_transport.attachments = [...character.reference_bindings, entry.environment.reference_binding].filter(Boolean).map((binding) => ({ ...binding, pixels_must_be_visible: true }));
    assert.throws(() => validateManifest(manifest), /reference role\/character\/filename mismatch|reference selection must match/);
  }
});

test('retired demo sources cannot be copied back into the runtime bundle', () => {
  const sourceMap = read('content/assets/source-map.json');
  const receipt = read('content/assets/ingest-receipts/character-reference-packs-20260930.json');
  for (const item of receipt.removedDeprecatedAssets) {
    assert.equal(fs.existsSync(new URL(`../${item.path}`, import.meta.url)), false);
    assert.ok(!JSON.stringify(sourceMap).includes(item.path));
  }
});

test('production omission requires a reason and repeated pixel attachments are rejected', () => {
  const manifest = manifestWithSelection('xu_tang', 'XT-WARDROBE-A-WEEKDAY-NEIGHBOR');
  const character = manifest.entries[0].characters[0];
  character.reference_requirements.production_consistency = false;
  character.reference_bindings = character.reference_bindings.filter((binding) => binding.role !== 'production_consistency');
  manifest.entries[0].reference_transport.attachments = manifest.entries[0].reference_transport.attachments.filter((binding) => binding.role !== 'production_consistency');
  assert.throws(() => validateManifest(manifest), /production omission requires a reason/);
  character.reference_requirements.production_omission_reason = 'Tightly framed neutral face insert; production detail is outside the frame.';
  assert.doesNotThrow(() => validateManifest(manifest));
  manifest.entries[0].reference_transport.attachments.push(manifest.entries[0].reference_transport.attachments[0]);
  assert.throws(() => validateManifest(manifest), /duplicate reference attachments/);
});

test('Human-approved COM-02X character component supplements the canonical sheets without replacing them', () => {
  const manifest = manifestWithSelection('xu_tang', 'XT-WARDROBE-A-LATE-NIGHT-CONVENIENCE-STORE');
  const entry = manifest.entries[0];
  const component = { role: 'accepted_character_continuity', source_id: 'ref.com02x.walk.character_continuity_v1', expected_filename: 'com02x-walk-character-continuity-v1.png' };
  entry.characters[0].reference_bindings.push(component);
  entry.reference_transport.attachments.push({ ...component, pixels_must_be_visible: true });
  assert.doesNotThrow(() => validateManifest(manifest));
  const missingProduction = structuredClone(manifest);
  missingProduction.entries[0].characters[0].reference_bindings = entry.characters[0].reference_bindings.filter(binding => binding.role !== 'production_consistency');
  missingProduction.entries[0].reference_transport.attachments = entry.reference_transport.attachments.filter(binding => binding.role !== 'production_consistency');
  assert.throws(() => validateManifest(missingProduction), /reference selection must match/);
  const wrongRole = structuredClone(manifest);
  wrongRole.entries[0].characters[0].reference_bindings.at(-1).role = 'primary_face_identity';
  wrongRole.entries[0].reference_transport.attachments.at(-1).role = 'primary_face_identity';
  assert.throws(() => validateManifest(wrongRole), /reference role\/character\/filename mismatch/);
  const assets = read('content/assets/manifest.json').assets;
  assert.ok(!Object.values(assets).some(asset => asset.masterSourceId === component.source_id));
  const receipt = read('content/assets/ingest-receipts/com02x-walk-character-continuity-v1.json');
  assert.equal(receipt.runtimeMasterAcceptance, 'NOT_ACCEPTED');
  assert.equal(receipt.backgroundAcceptance, 'REJECTED');
});
