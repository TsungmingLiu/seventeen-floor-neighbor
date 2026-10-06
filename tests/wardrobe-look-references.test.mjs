import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { wardrobeInventory, writerWardrobeOptions, selectCharacterReferences, validateCharacterReferencePacks, validateCharacterReferenceSelection } from '../tools/character-references.mjs';
import { inventory, validateCropPlan, materializeCropPlan } from '../tools/wardrobe-look-references.mjs';
import { buildPackets, adaptChatManual, adaptApi, adaptWorkBatch } from '../tools/render-cg-packets.mjs';
const read = name => JSON.parse(fs.readFileSync(new URL(`../${name}`, import.meta.url)));
const registry = read('content/assets/character-reference-packs.json');
const catalog = read('content/assets/source-catalog.json');
const ref = '1938dc7effeadd3d4e2042ae1bdeccdfaf6356ef';
const characterId = 'xu_tang', wardrobeKey = 'XT-WARDROBE-A-LATE-NIGHT-CONVENIENCE-STORE';
function fixture() {
  const r = structuredClone(registry), c = structuredClone(catalog);
  const item = r.characters[characterId].wardrobes[wardrobeKey];
  item.generationRefs = {};
  for (const variant of ['full', 'upper']) {
    const id = `ref.xu_tang.look.test.${variant}`;
    item.generationRefs[variant] = id;
    c.files[id] = { name: `test-${variant}.png`, sourcePath: `assets-src/test-${variant}.png`, characterId, role: 'wardrobe', status: 'active-production', mimeType: 'image/png', verifiedDecode: true, width: 8, height: variant === 'full' ? 8 : 4,
      derivation: { sourceId: item.sourceId, sourcePath: c.files[item.sourceId].sourcePath, sourceRef: ref, wardrobeKey, variant, rect: { left: 0, top: 0, width: 8, height: variant === 'full' ? 8 : 4 } } };
  }
  return { r, c };
}
test('inventory deduplicates 34 canonical looks/68 variants and writer options leak no image metadata', () => {
  const rows = inventory();
  assert.equal(rows.length, 34);
  assert.equal(rows.flatMap(row => row.variants).length, 68);
  const options = writerWardrobeOptions(characterId);
  assert.equal(options.length, 8);
  assert.deepEqual(options.find(row => row.wardrobe_key === wardrobeKey).aliases, ['xu_tang_grey_home_sweater_casual_evening']);
  assert.ok(options.every(row => Object.keys(row).sort().join() === 'aliases,look,wardrobe_key'));
  const r = structuredClone(registry);
  r.characters[characterId].wardrobes.xu_tang_grey_home_sweater_casual_evening.aliasOf = wardrobeKey;
  assert.equal(wardrobeInventory(characterId, r).length, 8);
  r.characters[characterId].wardrobes.xu_tang_grey_home_sweater_casual_evening.aliasOf = 'missing';
  assert.throws(() => wardrobeInventory(characterId, r), /alias/);
});
test('opt-in full/upper selection keeps face/production and declared body/expression policies', () => {
  const { r, c } = fixture();
  validateCharacterReferencePacks(c, r);
  for (const shotSize of ['extreme_wide', 'wide', 'medium_wide', 'medium']) {
    const bindings = selectCharacterReferences({ characterId, wardrobeKey, wardrobeReferenceMode: 'exact_look', shotSize, body: true, expression: true }, c, r);
    assert.equal(bindings.length, 5);
    assert.equal(bindings[2].source_id, r.characters[characterId].wardrobes[wardrobeKey].generationRefs[shotSize === 'medium' ? 'upper' : 'full']);
    const entry = { entry_id: 'synthetic', status: 'render_ready', camera: { shot_size: shotSize }, reference_transport: { mode: 'new_base' }, characters: [{ character_id: characterId, wardrobe_key: wardrobeKey, wardrobe_reference_mode: 'exact_look', reference_requirements: { production_consistency: true, expression: true, body_proportions: true }, reference_bindings: bindings }] };
    assert.doesNotThrow(() => validateCharacterReferenceSelection(entry, c, r));
    entry.characters[0].reference_bindings[2] = selectCharacterReferences({ characterId, wardrobeKey }, c, r)[2];
    assert.throws(() => validateCharacterReferenceSelection(entry, c, r), /selection must match/);
  }
  const alias = selectCharacterReferences({ characterId, wardrobeKey: 'xu_tang_grey_home_sweater_casual_evening', wardrobeReferenceMode: 'exact_look', shotSize: 'medium' }, c, r);
  assert.equal(alias[2].source_id, r.characters[characterId].wardrobes[wardrobeKey].generationRefs.upper);
  assert.deepEqual(selectCharacterReferences({ characterId, wardrobeKey }, c, r), selectCharacterReferences({ characterId, wardrobeKey }));
});
test('exact-look rejects missing, swapped same-character look, variant, path, ref, decode, status and unsupported shots', () => {
  for (const problem of ['missing', 'key', 'variant', 'path', 'ref', 'decode', 'status', 'character', 'rect']) {
    const { r, c } = fixture();
    const id = r.characters[characterId].wardrobes[wardrobeKey].generationRefs.upper;
    if (problem === 'missing') delete c.files[id];
    if (problem === 'key') c.files[id].derivation.wardrobeKey = 'XT-WARDROBE-A-WEEKDAY-NEIGHBOR';
    if (problem === 'variant') c.files[id].derivation.variant = 'full';
    if (problem === 'path') c.files[id].derivation.sourcePath = 'assets-src/wrong.png';
    if (problem === 'ref') c.files[id].derivation.sourceRef = 'bad ref';
    if (problem === 'decode') c.files[id].verifiedDecode = false;
    if (problem === 'status') c.files[id].status = 'pending-independent-crop-qa';
    if (problem === 'character') c.files[id].characterId = 'jiang_yucheng';
    if (problem === 'rect') c.files[id].derivation.rect.left = 0.5;
    assert.throws(() => selectCharacterReferences({ characterId, wardrobeKey, wardrobeReferenceMode: 'exact_look', shotSize: 'medium' }, c, r), /exact-look|crop/);
  }
  const { r, c } = fixture();
  for (const shotSize of ['close', 'medium_close', 'extreme_close', 'full_body', undefined]) assert.throws(() => selectCharacterReferences({ characterId, wardrobeKey, wardrobeReferenceMode: 'exact_look', shotSize }, c, r), /unsupported/);
  assert.throws(() => selectCharacterReferences({ characterId, wardrobeKey, wardrobeReferenceMode: 'exact_look', shotSize: 'medium', sourceRef: '0'.repeat(40) }, c, r), /provenance/);
});
test('crop plan rebuilds native pixels, preserves source, decodes output and refuses overwrite', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wardrobe-crop-'));
  try {
    fs.mkdirSync(path.join(root, 'assets-src'));
    const { r, c } = fixture();
    const sourceId = r.characters[characterId].wardrobes[wardrobeKey].sourceId;
    c.files[sourceId] = { ...c.files[sourceId], sourcePath: 'assets-src/original.png', name: 'original.png', width: 8, height: 8 };
    const input = path.join(root, 'assets-src/original.png');
    execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=8x8', '-frames:v', '1', '-threads', '1', input]);
    const before = fs.readFileSync(input);
    const crop = { characterId, wardrobeKey, variant: 'upper', derivedSourceId: 'ref.xu_tang.look.crop.upper', outputPath: 'assets-src/crop.png', sourceId, sourcePath: c.files[sourceId].sourcePath, sourceRef: 'WORKTREE', rect: { left: 1, top: 2, width: 5, height: 3 } };
    const plan = { schemaVersion: 1, crops: [crop] };
    assert.equal(validateCropPlan(plan, { sourceRef: 'WORKTREE', catalog: c, registry: r }).length, 1);
    const branchPlan = structuredClone(plan); branchPlan.crops[0].sourceRef = 'main';
    assert.equal(validateCropPlan(branchPlan, { sourceRef: 'main', catalog: c, registry: r }).length, 1);
    assert.throws(() => validateCropPlan(plan, { sourceRef: '0'.repeat(40), catalog: c, registry: r }), /provenance/);
    assert.throws(() => validateCropPlan({ schemaVersion: 1, crops: [crop, crop] }, { sourceRef: 'WORKTREE', catalog: c, registry: r }), /duplicate/);
    const outputs = materializeCropPlan(plan, { repoRoot: root, sourceRef: 'WORKTREE', catalog: c, registry: r });
    assert.equal(outputs[0].status, 'pending-independent-crop-qa');
    assert.equal(outputs[0].width, 5);
    assert.equal(outputs[0].height, 3);
    assert.deepEqual(fs.readFileSync(input), before);
    assert.throws(() => materializeCropPlan(plan, { repoRoot: root, sourceRef: 'WORKTREE', catalog: c, registry: r }), /already exists/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('exact-look deterministic packet and all adapters route the selected derived PNG only', () => {
  const { r, c } = fixture();
  const manifest = read('content/production/cg-manifests/opening-ch1.json');
  manifest.entries = [manifest.entries[0]];
  const entry = manifest.entries[0];
  entry.status = 'render_ready';
  entry.camera.shot_size = 'medium';
  const character = entry.characters[0];
  character.wardrobe_key = wardrobeKey;
  character.wardrobe_reference_mode = 'exact_look';
  character.reference_bindings = selectCharacterReferences({ characterId, wardrobeKey, wardrobeReferenceMode: 'exact_look', shotSize: 'medium' }, c, r);
  entry.reference_transport.attachments = [...character.reference_bindings, entry.environment.reference_binding].filter(Boolean).map(binding => ({ ...binding, pixels_must_be_visible: true }));
  const packets = buildPackets(manifest, { catalog: c, registry: r });
  assert.match(packets[0].shared_prompt, /wardrobe_reference_mode: exact_look/);
  assert.match(adaptChatManual(packets), /test-upper.png/);
  assert.deepEqual(JSON.parse(adaptApi(packets)).jobs[0].input.reference_transport.attachments, entry.reference_transport.attachments);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wardrobe-adapter-'));
  try {
    const isolated = { sourceCatalogVersion: 2, provider: 'repo', files: {} };
    for (const binding of entry.reference_transport.attachments) {
      const source = { ...c.files[binding.source_id], sourcePath: `assets-src/${binding.expected_filename}`, width: 8, height: 4, verifiedDecode: true };
      isolated.files[binding.source_id] = source;
      fs.mkdirSync(path.join(root, 'assets-src'), { recursive: true });
      execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=8x4', '-frames:v', '1', '-threads', '1', path.join(root, source.sourcePath)]);
    }
    const work = JSON.parse(adaptWorkBatch(packets, { catalog: isolated, repoRoot: root }));
    assert.deepEqual(work.reference_acquisition.required_bindings, entry.reference_transport.attachments);
    assert.ok(work.reference_acquisition.resolved_files.some(item => item.source_id.endsWith('test.upper')));
    assert.ok(!work.reference_acquisition.resolved_files.some(item => item.source_id === 'ref.xu_tang.wardrobe.a'));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
