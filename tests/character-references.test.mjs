import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { selectCharacterReferences, validateCharacterReferencePacks, validateCharacterReferencePackReceipt, validateCharacterWardrobeReplacementReceipt } from '../tools/character-references.mjs';
import { buildPackets, adaptApi, adaptChatManual, adaptWorkBatch, validateManifest, sha256 } from '../tools/render-cg-packets.mjs';

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const catalog = read('content/assets/source-catalog.json');
const registry = read('content/assets/character-reference-packs.json');

function syntheticExactLookPack() {
  const characterId = 'synthetic_character';
  const wardrobeKey = 'SYNTHETIC-LOOK';
  const files = {};
  const sheets = {};
  const roles = { 'face.01': 'primary_face_identity', 'expression.02': 'expression', 'body.03': 'body_proportions', 'production.04': 'production_consistency', 'wardrobe.a': 'wardrobe', 'wardrobe.b': 'wardrobe' };
  for (const [sheet, role] of Object.entries(roles)) {
    const id = `ref.${characterId}.${sheet}`;
    sheets[sheet] = id;
    files[id] = { characterId, role, status: 'active-production', mimeType: 'image/png',
      name: `${sheet}.png`, sourcePath: `assets-src/synthetic/${sheet}.png`, width: 10, height: 10 };
  }
  const generationRefs = {};
  for (const [variant, sourceRef] of [['full', 'ac26b68c4c792c358812df4fabf0d1ef99085170'], ['upper', 'a81e549ed8965572adc57b487ae9664e39101893']]) {
    const id = `ref.${characterId}.look.${variant}`;
    generationRefs[variant] = id;
    files[id] = { characterId, role: 'wardrobe', status: 'active-production', mimeType: 'image/png',
      verifiedDecode: true, name: `${variant}.png`, sourcePath: `assets-src/synthetic/${variant}.png`, width: 4, height: 4,
      derivation: { sourceId: sheets['wardrobe.b'], sourcePath: files[sheets['wardrobe.b']].sourcePath,
        sourceRef, wardrobeKey, variant, rect: { left: 1, top: 1, width: 4, height: 4 } } };
  }
  return { characterId, wardrobeKey, generationRefs, catalog: { files },
    registry: { schemaVersion: 1, lifecycle: 'CANONICAL', characters: {
      [characterId]: { sheets, wardrobes: { [wardrobeKey]: { sourceId: sheets['wardrobe.b'], look: 'Synthetic look', generationRefs } } }
    } } };
}

test('exact-look full and upper retain distinct original-acquisition refs', () => {
  const fixture = syntheticExactLookPack();
  assert.doesNotThrow(() => validateCharacterReferencePacks(fixture.catalog, fixture.registry));
  for (const [shotSize, variant] of [['wide', 'full'], ['medium', 'upper']]) {
    const selection = selectCharacterReferences({ characterId: fixture.characterId, wardrobeKey: fixture.wardrobeKey,
      wardrobeReferenceMode: 'exact_look', shotSize }, fixture.catalog, fixture.registry);
    assert.equal(selection[2].source_id, fixture.generationRefs[variant]);
    assert.throws(() => selectCharacterReferences({ characterId: fixture.characterId, wardrobeKey: fixture.wardrobeKey,
      wardrobeReferenceMode: 'exact_look', shotSize, sourceRef: 'later-candidate-ref' }, fixture.catalog, fixture.registry), /provenance/);
  }
});

test('distinct acquisition refs do not waive exact-look provenance or native geometry', () => {
  const mutations = {
    missing_derivation: source => { delete source.derivation; },
    missing_ref: source => { delete source.derivation.sourceRef; },
    empty_ref: source => { source.derivation.sourceRef = ''; },
    whitespace_ref: source => { source.derivation.sourceRef = 'bad ref'; },
    option_ref: source => { source.derivation.sourceRef = '-invalid'; },
    null_ref: source => { source.derivation.sourceRef = null; },
    wrong_original_id: source => { source.derivation.sourceId = 'ref.synthetic_character.wardrobe.a'; },
    wrong_original_path: source => { source.derivation.sourcePath = 'assets-src/synthetic/wrong.png'; },
    wrong_key: source => { source.derivation.wardrobeKey = 'OTHER-LOOK'; },
    wrong_variant: source => { source.derivation.variant = 'other'; },
    cross_character: source => { source.characterId = 'other_character'; },
    wrong_role: source => { source.role = 'expression'; },
    pending_status: source => { source.status = 'pending-independent-crop-qa'; },
    resized_dimensions: source => { source.width = 8; },
    outside_original: source => { source.derivation.rect.left = 9; }
  };
  for (const variant of ['full', 'upper']) for (const [problem, mutate] of Object.entries(mutations)) {
    const fixture = syntheticExactLookPack();
    mutate(fixture.catalog.files[fixture.generationRefs[variant]]);
    assert.throws(() => validateCharacterReferencePacks(fixture.catalog, fixture.registry), /provenance|native crop/, `${variant}: ${problem}`);
  }
  for (const field of ['characterId', 'role', 'status']) {
    const fixture = syntheticExactLookPack();
    fixture.catalog.files[fixture.registry.characters[fixture.characterId].sheets['wardrobe.b']][field] = 'unapproved';
    assert.throws(() => validateCharacterReferencePacks(fixture.catalog, fixture.registry), /mismatch/, `original: ${field}`);
  }
});

test('Shen Yingxue receipt requires the scoped Owner height-label override', () => {
  const receipt = read('content/assets/ingest-receipts/shen-yingxue-reference-pack-20261003.json');
  assert.equal(validateCharacterReferencePackReceipt(receipt, 'shen_yingxue').length, 6);
  assert.equal(receipt.heightLabelOverride.humanDecision, '維持172，圖就不管了，直接啟用。');
  assert.equal(receipt.heightLabelOverride.canonicalHeightCm, 172);
  assert.equal(receipt.heightLabelOverride.embeddedHeightLabelCm, 175);
  const registryWithoutOverride = structuredClone(registry);
  delete registryWithoutOverride.characters.shen_yingxue.heightLabelPolicy;
  assert.throws(() => validateCharacterReferencePackReceipt(receipt, 'shen_yingxue', catalog, registryWithoutOverride), /receipt/);
  for (const problem of ['missing', 'height', 'scope', 'quote', 'sources', 'profile', 'runtime']) {
    const forged = structuredClone(receipt);
    if (problem === 'missing') delete forged.heightLabelOverride;
    if (problem === 'height') forged.heightLabelOverride.canonicalHeightCm = 175;
    if (problem === 'scope') forged.heightLabelOverride.scope = 'canonical_character_design';
    if (problem === 'quote') forged.heightLabelOverride.humanDecision = '';
    if (problem === 'sources') forged.heightLabelOverride.sourceIds[0] = forged.heightLabelOverride.sourceIds[1];
    if (problem === 'profile') delete forged.canonicalProfileSha256;
    if (problem === 'runtime') forged.runtimeMasterAcceptance = 'ACCEPTED';
    assert.throws(() => validateCharacterReferencePackReceipt(forged, 'shen_yingxue'), /receipt/);
  }
});

test('Shen Yingxue selection isolates exact public/private looks and shot needs', () => {
  const pack = registry.characters.shen_yingxue;
  assert.equal(Object.keys(pack.wardrobes).length, 8);
  for (const [wardrobeKey, look] of Object.entries(pack.wardrobes)) {
    const selection = selectCharacterReferences({ characterId: 'shen_yingxue', wardrobeKey });
    assert.deepEqual(selection.map(item => item.source_id), ['ref.shen_yingxue.face.01', 'ref.shen_yingxue.production.04', look.sourceId]);
  }
  const extended = selectCharacterReferences({ characterId: 'shen_yingxue', wardrobeKey: 'SYX-WARDROBE-B-WORKOUT-GYM', expression: true, body: true });
  assert.equal(extended.length, 5);
  assert.ok(extended.every(item => item.source_id.startsWith('ref.shen_yingxue.')));
  assert.ok(!extended.some(item => item.source_id === 'ref.shen_yingxue.wardrobe.a'));
  assert.throws(() => selectCharacterReferences({ characterId: 'shen_yingxue', wardrobeKey: 'LRQ-WARDROBE-B-BADMINTON' }), /unknown wardrobe/);
});

test('Lin Ruoqing receipt rejects missing, duplicate, foreign and altered source evidence', () => {
  const receipt = read('content/assets/ingest-receipts/lin-ruoqing-reference-pack-20261003.json');
  assert.equal(validateCharacterReferencePackReceipt(receipt, 'lin_ruoqing').length, 6);
  for (const problem of ['missing', 'duplicate', 'foreign', 'path', 'role', 'runtime']) {
    const forged = structuredClone(receipt);
    if (problem === 'missing') forged.references.pop();
    if (problem === 'duplicate') forged.references[1] = structuredClone(forged.references[0]);
    if (problem === 'foreign') forged.references[0].sourceId = 'ref.xu_tang.face.01';
    if (problem === 'path') forged.references[0].sourcePath = 'assets-src/wrong.png';
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

test('both complete six-sheet packs are cataloged with canonical image locators', () => {
  validateCharacterReferencePacks(catalog, registry);
  const receipt = read('content/assets/ingest-receipts/character-reference-packs-20260930.json');
  assert.equal(receipt.references.length, 12);
  assert.equal(new Set(receipt.references.map((record) => record.sourceId)).size, 12);
  const replacement = read('content/assets/ingest-receipts/jiang-yucheng-wardrobe-replacement-20261003.json');
  const previous = validateCharacterWardrobeReplacementReceipt(replacement, receipt,
    sha256(fs.readFileSync(new URL('../content/assets/ingest-receipts/character-reference-packs-20260930.json', import.meta.url))));
  for (const record of receipt.references) {
    const locator = (value) => Object.fromEntries(Object.entries(value).filter(([key]) => !['sourceId', 'uploadedFilename', 'sha256', 'bytes'].includes(key)));
    assert.deepEqual(locator(previous.get(record.sourceId) ?? catalog.files[record.sourceId]), locator(record));
  }
});

test('Jiang Yucheng wardrobe replacement rejects forged supersession and scope evidence', () => {
  const receipt = read('content/assets/ingest-receipts/jiang-yucheng-wardrobe-replacement-20261003.json');
  const originalPath = new URL('../content/assets/ingest-receipts/character-reference-packs-20260930.json', import.meta.url);
  const originalBytes = fs.readFileSync(originalPath);
  const original = JSON.parse(originalBytes);
  const hash = sha256(originalBytes);
  const previous = validateCharacterWardrobeReplacementReceipt(receipt, original, hash);
  assert.deepEqual([...previous.keys()], ['ref.jiang_yucheng.wardrobe.a', 'ref.jiang_yucheng.wardrobe.b']);
  const gate3 = read('content/assets/ingest-receipts/repo-source-gate3-v1.json');
  const gate3A = gate3.references.find(item => item.sourceId === 'ref.jiang_yucheng.wardrobe.a');
  for (const key of ['sha256', 'bytes', 'width', 'height', 'mimeType', 'status', 'characterId', 'role']) assert.equal(previous.get(gate3A.sourceId)[key], gate3A[key]);
  assert.equal(previous.get(gate3A.sourceId).sourcePath, gate3A.repoPath);
  for (const problem of ['missing', 'duplicate', 'foreign', 'missing_supersession', 'duplicate_supersession', 'path', 'role', 'scope', 'runtime', 'receipt_hash', 'receipt_path']) {
    const forged = structuredClone(receipt);
    if (problem === 'missing') forged.references.pop();
    if (problem === 'duplicate') forged.references[1] = structuredClone(forged.references[0]);
    if (problem === 'foreign') forged.references[0].sourceId = 'ref.jiang_yucheng.face.01';
    if (problem === 'missing_supersession') forged.supersededReferences.pop();
    if (problem === 'duplicate_supersession') forged.supersededReferences[1] = structuredClone(forged.supersededReferences[0]);
    if (problem === 'old_hash') forged.supersededReferences[0].previous.sha256 = '0'.repeat(64);
    if (problem === 'new_hash') forged.supersededReferences[0].replacementSha256 = '0'.repeat(64);
    if (problem === 'catalog_hash') forged.references[0].sha256 = '0'.repeat(64);
    if (problem === 'path') forged.references[0].sourcePath = 'assets-src/references/jiang-yucheng/other.png';
    if (problem === 'role') forged.references[0].role = 'primary_face_identity';
    if (problem === 'scope') forged.acceptanceScope = 'character_reference_pack_only';
    if (problem === 'runtime') forged.runtimeMasterAcceptance = 'ACCEPTED';
    if (problem === 'receipt_hash') forged.previousReceipt.sha256 = '0'.repeat(64);
    if (problem === 'receipt_path') forged.previousReceipt.path = 'content/assets/ingest-receipts/repo-source-gate3-v1.json';
    assert.throws(() => validateCharacterWardrobeReplacementReceipt(forged, original, hash), /replacement receipt/);
  }
  const legacy = structuredClone(receipt);
  legacy.supersededReferences[0].previous.sha256 = 'invalid legacy'; legacy.references[0].sha256 = 'stale';
  legacy.supersededReferences[0].replacementSha256 = 'stale';
  assert.doesNotThrow(() => validateCharacterWardrobeReplacementReceipt(legacy, original, hash));
  const tamperedCatalog = structuredClone(catalog);
  tamperedCatalog.files[receipt.references[0].sourceId].sourcePath = 'assets-src/wrong.png';
  assert.throws(() => validateCharacterWardrobeReplacementReceipt(receipt, original, hash, tamperedCatalog), /catalog mismatch/);
  assert.throws(() => validateCharacterWardrobeReplacementReceipt(receipt, original, '0'.repeat(64)), /previous receipt binding/);
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
