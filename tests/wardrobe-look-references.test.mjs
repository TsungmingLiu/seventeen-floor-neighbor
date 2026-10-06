import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { wardrobeInventory, writerWardrobeOptions, selectCharacterReferences, validateCharacterReferencePacks, validateCharacterReferenceSelection } from '../tools/character-references.mjs';
import { validateDerivedWardrobeSources } from '../tools/validate-production-contracts.mjs';
import { inventory, validateCropPlan, materializeCropPlan } from '../tools/wardrobe-look-references.mjs';
import { buildPackets, adaptChatManual, adaptApi, adaptWorkBatch } from '../tools/render-cg-packets.mjs';
const read = name => JSON.parse(fs.readFileSync(new URL(`../${name}`, import.meta.url)));
const registry = read('content/assets/character-reference-packs.json');
const catalog = read('content/assets/source-catalog.json');
const ref = '1938dc7effeadd3d4e2042ae1bdeccdfaf6356ef';
const characterId = 'xu_tang', wardrobeKey = 'XT-WARDROBE-A-LATE-NIGHT-CONVENIENCE-STORE';
function fixture({ isolateRegisteredDerivatives = false } = {}) {
  const r = structuredClone(registry), c = structuredClone(catalog);
  if (isolateRegisteredDerivatives) {
    for (const [id, source] of Object.entries(c.files)) {
      if (source.derivation) delete c.files[id];
    }
    for (const pack of Object.values(r.characters)) {
      for (const wardrobe of Object.values(pack.wardrobes)) delete wardrobe.generationRefs;
    }
  }
  const item = r.characters[characterId].wardrobes[wardrobeKey];
  if (!isolateRegisteredDerivatives) {
    item.generationRefs = {};
    for (const variant of ['full', 'upper']) {
      const id = `ref.xu_tang.look.test.${variant}`;
      item.generationRefs[variant] = id;
      c.files[id] = { name: `test-${variant}.png`, sourcePath: `assets-src/test-${variant}.png`, characterId, role: 'wardrobe', status: 'active-production', mimeType: 'image/png', verifiedDecode: true, width: 8, height: variant === 'full' ? 8 : 4,
        derivation: { sourceId: item.sourceId, sourcePath: c.files[item.sourceId].sourcePath, sourceRef: ref, wardrobeKey, variant, rect: { left: 0, top: 0, width: 8, height: variant === 'full' ? 8 : 4 } } };
    }
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

test('masked crop fills declared native area white, preserves figure pixels and binds masks to rebuild identity', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wardrobe-masked-crop-'));
  try {
    fs.mkdirSync(path.join(root, 'assets-src'));
    const { r, c } = fixture();
    const sourceId = r.characters[characterId].wardrobes[wardrobeKey].sourceId;
    c.files[sourceId] = { ...c.files[sourceId], sourcePath: 'assets-src/original.png', name: 'original.png', width: 8, height: 8 };
    const input = path.join(root, 'assets-src/original.png');
    execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=8x8:r=1,format=rgb24', '-frames:v', '1', '-threads', '1', input]);
    const before = fs.readFileSync(input);
    const crop = { characterId, wardrobeKey, variant: 'upper', derivedSourceId: 'ref.xu_tang.look.masked.upper', outputPath: 'assets-src/masked.png',
      sourceId, sourcePath: 'assets-src/original.png', sourceRef: 'WORKTREE', rect: { left: 1, top: 2, width: 5, height: 3 },
      excludeRects: [{ left: 2, top: 3, width: 2, height: 1 }] };
    const plan = { schemaVersion: 1, crops: [crop] };
    const options = { repoRoot: root, sourceRef: 'WORKTREE', catalog: c, registry: r };
    assert.equal(validateCropPlan(plan, options)[0].source.derivation.excludeRects[0].left, 2);
    for (const invalid of [
      [{ left: 2.5, top: 3, width: 2, height: 1 }],
      [{ left: 0, top: 3, width: 2, height: 1 }],
      [{ left: 2, top: 3, width: 0, height: 1 }],
      [{ left: 2, top: 3, width: 2, height: 1, color: 'black' }],
    ]) {
      const malformed = structuredClone(plan);
      malformed.crops[0].excludeRects = invalid;
      assert.throws(() => validateCropPlan(malformed, options), /exclusion rectangle/);
    }
    const [output] = materializeCropPlan(plan, options);
    const pixels = filename => execFileSync('ffmpeg', ['-v', 'error', '-i', filename, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1024 * 1024 });
    const originalPixels = pixels(input), cropPixels = pixels(path.join(root, 'assets-src/masked.png'));
    const pixel = (bytes, x, y, width) => [...bytes.subarray((y * width + x) * 4, (y * width + x) * 4 + 4)];
    assert.deepEqual(pixel(cropPixels, 1, 1, 5), [255, 255, 255, 255]);
    assert.deepEqual(pixel(cropPixels, 2, 1, 5), [255, 255, 255, 255]);
    assert.deepEqual(pixel(cropPixels, 0, 0, 5), pixel(originalPixels, 1, 2, 8));
    assert.deepEqual(pixel(cropPixels, 4, 2, 5), pixel(originalPixels, 5, 4, 8));
    assert.deepEqual(fs.readFileSync(input), before);
    const { derivedSourceId, ...derived } = output;
    c.files[derivedSourceId] = { ...derived, status: 'optional-reference' };
    assert.doesNotThrow(() => validateCropPlan(plan, { ...options, rebuild: true }));
    const changed = structuredClone(plan);
    changed.crops[0].excludeRects[0].left++;
    assert.throws(() => validateCropPlan(changed, { ...options, rebuild: true }), /exact registered crop identity/);
    assert.equal(materializeCropPlan(plan, { ...options, rebuild: true })[0].status, 'pending-independent-crop-qa');
    assert.deepEqual(fs.readFileSync(input), before);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('transparent RGBA masks replace RGB and alpha with default white or declared gray while preserving every neighbor', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wardrobe-rgba-mask-'));
  try {
    fs.mkdirSync(path.join(root, 'assets-src'));
    const { r, c } = fixture();
    const sourceId = r.characters[characterId].wardrobes[wardrobeKey].sourceId;
    c.files[sourceId] = { ...c.files[sourceId], sourcePath: 'assets-src/original.png', name: 'original.png', width: 8, height: 8 };
    const input = path.join(root, 'assets-src/original.png');
    const native = Buffer.alloc(8 * 8 * 4);
    for (let i = 0; i < 64; i++) native.set([17 + i, 90 + i, 200 - i, [0, 37, 128, 255][i % 4]], i * 4);
    execFileSync('ffmpeg', ['-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', '8x8', '-i', 'pipe:0', '-frames:v', '1', '-threads', '1', input], { input: native });
    const before = fs.readFileSync(input);
    const crop = { characterId, wardrobeKey, variant: 'upper', derivedSourceId: 'ref.xu_tang.look.rgba.upper', outputPath: 'assets-src/rgba.png',
      sourceId, sourcePath: 'assets-src/original.png', sourceRef: 'WORKTREE', rect: { left: 1, top: 2, width: 5, height: 3 },
      excludeRects: [{ left: 4, top: 3, width: 1, height: 1 }, { left: 2, top: 3, width: 1, height: 1, fill: '#e7E7e7' }] };
    const plan = { schemaVersion: 1, crops: [crop] }, options = { repoRoot: root, sourceRef: 'WORKTREE', catalog: c, registry: r };
    const [output] = materializeCropPlan(plan, options);
    assert.equal(output.derivation.excludeRects[1].fill, '#e7E7e7');
    const bytes = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(root, crop.outputPath), '-f', 'rawvideo', '-pix_fmt', 'rgba', '-']);
    for (let y = 0; y < 3; y++) for (let x = 0; x < 5; x++) {
      const expected = y === 1 && x === 3 ? [255, 255, 255, 255] : y === 1 && x === 1 ? [231, 231, 231, 255]
        : [...native.subarray(((y + 2) * 8 + x + 1) * 4, ((y + 2) * 8 + x + 1) * 4 + 4)];
      assert.deepEqual([...bytes.subarray((y * 5 + x) * 4, (y * 5 + x) * 4 + 4)], expected, `native pixel ${x},${y}`);
    }
    assert.deepEqual(fs.readFileSync(input), before);
    const { derivedSourceId, ...derived } = output;
    c.files[derivedSourceId] = { ...derived, status: 'optional-reference' };
    assert.doesNotThrow(() => validateCropPlan(plan, { ...options, rebuild: true }));
    for (const fill of ['#e8e8e8', undefined]) {
      const changed = structuredClone(plan);
      if (fill === undefined) delete changed.crops[0].excludeRects[1].fill;
      else changed.crops[0].excludeRects[1].fill = fill;
      assert.throws(() => validateCropPlan(changed, { ...options, rebuild: true }), /exact registered crop identity/);
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('crop and exclusion geometry rejects unsafe integers and fill accepts only fixed RGB hex syntax', () => {
  const { r, c } = fixture();
  const sourceId = r.characters[characterId].wardrobes[wardrobeKey].sourceId;
  c.files[sourceId].width = c.files[sourceId].height = Number.MAX_SAFE_INTEGER * 2;
  const crop = { characterId, wardrobeKey, variant: 'upper', derivedSourceId: 'ref.xu_tang.look.geometry.upper', outputPath: 'assets-src/geometry.png',
    sourceId, sourcePath: c.files[sourceId].sourcePath, sourceRef: 'WORKTREE', rect: { left: 0, top: 0, width: 8, height: 8 },
    excludeRects: [{ left: 1, top: 1, width: 1, height: 1 }] };
  const options = { sourceRef: 'WORKTREE', catalog: c, registry: r };
  for (const field of ['left', 'top', 'width', 'height']) {
    const changed = structuredClone(crop);
    changed.rect[field] = Number.MAX_SAFE_INTEGER + 1;
    assert.throws(() => validateCropPlan({ schemaVersion: 1, crops: [changed] }, options), /crop rectangle|provenance/);
    const maskChanged = structuredClone(crop);
    maskChanged.rect.width = maskChanged.rect.height = Number.MAX_SAFE_INTEGER;
    maskChanged.excludeRects[0][field] = Number.MAX_SAFE_INTEGER + 1;
    assert.throws(() => validateCropPlan({ schemaVersion: 1, crops: [maskChanged] }, options), /exclusion rectangle/);
  }
  for (const fill of ['white', '#fff', '#ffffffff', '#gggggg', '#ffffff:replace=0', '#ffffff\n', '', null, 123]) {
    const changed = structuredClone(crop);
    changed.excludeRects[0].fill = fill;
    assert.throws(() => validateCropPlan({ schemaVersion: 1, crops: [changed] }, options), /exclusion rectangle/, String(fill));
  }
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

// Exact proposed native rectangles from the bounded engineering corrective packet.
const proposedCrops = [["xu_tang","XT-WARDROBE-A-WEEKDAY-NEIGHBOR","full",2,194,256,884],["xu_tang","XT-WARDROBE-A-WEEKDAY-NEIGHBOR","upper",2,194,256,346],["xu_tang","XT-WARDROBE-A-LATE-NIGHT-CONVENIENCE-STORE","full",264,194,259,884],["xu_tang","XT-WARDROBE-A-LATE-NIGHT-CONVENIENCE-STORE","upper",264,194,259,346],["xu_tang","XT-WARDROBE-A-BOOKSTORE-CAFE-DATE","full",529,194,266,884],["xu_tang","XT-WARDROBE-A-BOOKSTORE-CAFE-DATE","upper",529,194,266,346],["xu_tang","XT-WARDROBE-A-WEEKEND-NIGHT-OUT","full",800,194,252,884],["xu_tang","XT-WARDROBE-A-WEEKEND-NIGHT-OUT","upper",800,194,252,346],["xu_tang","XT-WARDROBE-B-RIVERSIDE-RAINY-DATE","full",2,194,256,871],["xu_tang","XT-WARDROBE-B-RIVERSIDE-RAINY-DATE","upper",2,194,256,346],["xu_tang","XT-WARDROBE-B-WORK-DEADLINE-HOME","full",264,194,259,871],["xu_tang","XT-WARDROBE-B-WORK-DEADLINE-HOME","upper",264,194,259,346],["xu_tang","XT-WARDROBE-B-REPAIR-ENDING-SERIOUS-DATE","full",529,194,266,871],["xu_tang","XT-WARDROBE-B-REPAIR-ENDING-SERIOUS-DATE","upper",529,194,266,346],["xu_tang","XT-WARDROBE-B-AFTER-STORY-WEEKEND-MORNING","full",800,194,252,871],["xu_tang","XT-WARDROBE-B-AFTER-STORY-WEEKEND-MORNING","upper",800,194,252,346],["jiang_yucheng","JYC-WARDROBE-A-CAMPUS-GRADUATE-STUDENT","full",0,180,251,850],["jiang_yucheng","JYC-WARDROBE-A-CAMPUS-GRADUATE-STUDENT","upper",0,180,251,420],["jiang_yucheng","JYC-WARDROBE-A-CAFE-CREATOR","full",401,186,224,843],["jiang_yucheng","JYC-WARDROBE-A-CAFE-CREATOR","upper",401,186,224,399],["jiang_yucheng","JYC-WARDROBE-A-ACG-OUTING","full",762,186,228,842],["jiang_yucheng","JYC-WARDROBE-A-ACG-OUTING","upper",762,186,228,399],["jiang_yucheng","JYC-WARDROBE-A-GAMING-HOME-CASUAL","full",1131,186,224,842],["jiang_yucheng","JYC-WARDROBE-A-GAMING-HOME-CASUAL","upper",1131,186,224,404],["jiang_yucheng","JYC-WARDROBE-B-CUTE-DATE","full",14,132,232,898],["jiang_yucheng","JYC-WARDROBE-B-CUTE-DATE","upper",14,132,232,453],["jiang_yucheng","JYC-WARDROBE-B-CREATOR-EVENT","full",376,132,239,898],["jiang_yucheng","JYC-WARDROBE-B-CREATOR-EVENT","upper",376,132,239,458],["jiang_yucheng","JYC-WARDROBE-B-SIGNATURE-CAMPUS","full",754,132,226,898],["jiang_yucheng","JYC-WARDROBE-B-SIGNATURE-CAMPUS","upper",754,132,226,468],["jiang_yucheng","JYC-WARDROBE-B-AFTER-STORY-WEEKEND-MORNING","full",1118,132,230,898],["jiang_yucheng","JYC-WARDROBE-B-AFTER-STORY-WEEKEND-MORNING","upper",1118,132,230,468],["lin_ruoqing","LRQ-WARDROBE-A-TEACHER-TROUSERS","full",20,54,270,734],["lin_ruoqing","LRQ-WARDROBE-A-TEACHER-TROUSERS","upper",20,54,270,411],["lin_ruoqing","LRQ-WARDROBE-A-CARDIGAN-EVERYDAY","full",294,54,267,734],["lin_ruoqing","LRQ-WARDROBE-A-CARDIGAN-EVERYDAY","upper",294,54,267,411],["lin_ruoqing","LRQ-WARDROBE-A-TEACHER-PRESENTATION","full",565,54,269,734],["lin_ruoqing","LRQ-WARDROBE-A-TEACHER-PRESENTATION","upper",565,54,269,306],["lin_ruoqing","LRQ-WARDROBE-A-HOODIE-WEEKEND","full",839,54,267,734],["lin_ruoqing","LRQ-WARDROBE-A-HOODIE-WEEKEND","upper",839,54,267,406],["lin_ruoqing","LRQ-WARDROBE-A-FLORAL-DATE","full",1109,54,270,734],["lin_ruoqing","LRQ-WARDROBE-A-FLORAL-DATE","upper",1109,54,270,428],["lin_ruoqing","LRQ-WARDROBE-A-AUTUMN-OUTING","full",1382,54,269,734],["lin_ruoqing","LRQ-WARDROBE-A-AUTUMN-OUTING","upper",1382,54,269,428],["lin_ruoqing","LRQ-WARDROBE-B-FITNESS-ACTIVE","full",20,54,406,686],["lin_ruoqing","LRQ-WARDROBE-B-FITNESS-ACTIVE","upper",20,54,406,315],["lin_ruoqing","LRQ-WARDROBE-B-BADMINTON","full",429,54,406,686],["lin_ruoqing","LRQ-WARDROBE-B-BADMINTON","upper",429,54,406,316],["lin_ruoqing","LRQ-WARDROBE-B-HOME-REST","full",839,54,405,686],["lin_ruoqing","LRQ-WARDROBE-B-HOME-REST","upper",839,54,405,388],["lin_ruoqing","LRQ-WARDROBE-B-POOL-SWIM","full",1247,54,405,686],["lin_ruoqing","LRQ-WARDROBE-B-POOL-SWIM","upper",1247,54,405,346],["shen_yingxue","SYX-WARDROBE-A-STRATEGY-WORK","full",55,97,234,659],["shen_yingxue","SYX-WARDROBE-A-STRATEGY-WORK","upper",55,97,234,308],["shen_yingxue","SYX-WARDROBE-A-CLIENT-FORMAL-DAY","full",442,97,249,659],["shen_yingxue","SYX-WARDROBE-A-CLIENT-FORMAL-DAY","upper",442,97,249,285],["shen_yingxue","SYX-WARDROBE-A-CITY-EVENING","full",855,97,242,659],["shen_yingxue","SYX-WARDROBE-A-CITY-EVENING","upper",855,97,242,293],["shen_yingxue","SYX-WARDROBE-A-CAFE-WEEKEND","full",1258,97,242,659],["shen_yingxue","SYX-WARDROBE-A-CAFE-WEEKEND","upper",1258,97,242,288],["shen_yingxue","SYX-WARDROBE-B-LEISURE-CAFE","full",17,98,255,678],["shen_yingxue","SYX-WARDROBE-B-LEISURE-CAFE","upper",17,98,255,327],["shen_yingxue","SYX-WARDROBE-B-WORKOUT-GYM","full",434,98,255,678],["shen_yingxue","SYX-WARDROBE-B-WORKOUT-GYM","upper",434,98,255,312],["shen_yingxue","SYX-WARDROBE-B-HOME-LOUNGE","full",850,98,250,678],["shen_yingxue","SYX-WARDROBE-B-HOME-LOUNGE","upper",850,98,250,322],["shen_yingxue","SYX-WARDROBE-B-QUIET-EVENING-SLEEPWEAR","full",1260,98,255,678],["shen_yingxue","SYX-WARDROBE-B-QUIET-EVENING-SLEEPWEAR","upper",1260,98,255,342]];
function proposedCatalog() {
  const { r, c } = fixture({ isolateRegisteredDerivatives: true });
  for (const [characterId, wardrobeKey, variant, left, top, width, height] of proposedCrops) {
    const sourceId = wardrobeInventory(characterId, registry).find(row => row.wardrobeKey === wardrobeKey).sourceId;
    const sourcePath = c.files[sourceId].sourcePath;
    c.files[`ref.${characterId}.look.${wardrobeKey}.${variant}`] = {
      name: `${variant}.png`, sourcePath: `${path.posix.dirname(sourcePath)}/wardrobe-looks/${wardrobeKey}/${variant}.png`,
      characterId, role: 'wardrobe', mimeType: 'image/png', width, height, verifiedDecode: true, status: 'optional-reference',
      derivation: { sourceId, sourcePath, sourceRef: ref, wardrobeKey, variant, rect: { left, top, width, height } }
    };
  }
  return { r, c };
}
test('all 68 optional crops validate without changing originals or claiming active QA', () => {
  const { r, c } = proposedCatalog(), before = structuredClone(c);
  assert.equal(validateDerivedWardrobeSources(c, r).length, 68);
  assert.deepEqual(c, before);
  for (const [id, source] of Object.entries(catalog.files)) {
    if (!source.derivation) assert.deepEqual(c.files[id], source);
  }
});
test('derived catalog rejects invalid original, identity, geometry, path and status', () => {
  for (const problem of ['missing', 'derived-original', 'self', 'character', 'key', 'variant', 'dimensions', 'bounds', 'path', 'collision', 'decode', 'status', 'duplicate']) {
    const { r, c } = proposedCatalog();
    const id = Object.keys(c.files).find(id => c.files[id].derivation), source = c.files[id], d = source.derivation;
    if (problem === 'missing') delete c.files[d.sourceId];
    if (problem === 'derived-original') c.files[d.sourceId].derivation = { ...d };
    if (problem === 'self') d.sourceId = id;
    if (problem === 'character') source.characterId = 'jiang_yucheng';
    if (problem === 'key') d.wardrobeKey = 'XT-WARDROBE-B-RIVERSIDE-RAINY-DATE';
    if (problem === 'variant') d.variant = 'side';
    if (problem === 'dimensions') source.width++;
    if (problem === 'bounds') d.rect.left = c.files[d.sourceId].width;
    if (problem === 'path') source.sourcePath = 'assets-src/../crop.png';
    if (problem === 'collision') { source.sourcePath = c.files[d.sourceId].sourcePath; source.name = c.files[d.sourceId].name; }
    if (problem === 'decode') source.verifiedDecode = false;
    if (problem === 'status') source.status = 'pending-independent-crop-qa';
    if (problem === 'duplicate') c.files[`${id}.duplicate`] = { ...structuredClone(source), name: 'duplicate.png', sourcePath: 'assets-src/duplicate.png' };
    assert.throws(() => validateDerivedWardrobeSources(c, r), undefined, problem);
  }
});
test('explicit rebuild requires exact optional registration and acquires/decodes each original once per invocation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wardrobe-rebuild-'));
  try {
    fs.mkdirSync(path.join(root, 'assets-src'));
    const { r, c } = fixture();
    const sourceId = r.characters[characterId].wardrobes[wardrobeKey].sourceId;
    c.files[sourceId] = { ...c.files[sourceId], sourcePath: 'assets-src/original.png', name: 'original.png', width: 8, height: 8 };
    execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=8x8', '-frames:v', '1', '-threads', '1', path.join(root, 'assets-src/original.png')]);
    const plan = { schemaVersion: 1, crops: ['full', 'upper'].map(variant => ({
      characterId, wardrobeKey, variant, derivedSourceId: `ref.xu_tang.look.rebuild.${variant}`, outputPath: `assets-src/${variant}.png`,
      sourceId, sourcePath: 'assets-src/original.png', sourceRef: 'main', rect: { left: 0, top: 0, width: 8, height: variant === 'full' ? 8 : 4 }
    })) };
    const calls = [];
    const runCommand = (command, args, options) => {
      calls.push({ command, args });
      // Synthetic original stands in for the committed locator; no repository pixels are read.
      if (command === 'git') return fs.readFileSync(path.join(root, 'assets-src/original.png'));
      return execFileSync(command, args, options);
    };
    const options = { repoRoot: root, sourceRef: 'main', catalog: c, registry: r, runCommand };
    const first = materializeCropPlan(plan, options);
    assert.equal(calls.filter(call => call.command === 'git').length, 1);
    assert.equal(calls.filter(call => call.command === 'ffmpeg' && call.args.includes('-filter_complex')).length, 1);
    for (const output of first) { const { derivedSourceId, ...source } = output; c.files[derivedSourceId] = { ...source, status: 'optional-reference' }; }
    assert.throws(() => validateCropPlan(plan, options), /explicitly rebuilding/);
    for (const field of ['outputPath', 'sourcePath', 'sourceRef', 'wardrobeKey', 'variant', 'rect']) {
      const changed = structuredClone(plan);
      if (field === 'rect') changed.crops[0].rect.left++;
      else changed.crops[0][field] = field === 'variant' ? 'upper' : 'changed';
      assert.throws(() => validateCropPlan(changed, { ...options, rebuild: true }), undefined, field);
    }
    c.files[first[0].derivedSourceId].status = 'active-production';
    assert.throws(() => validateCropPlan(plan, { ...options, rebuild: true }), /deactivate/);
    c.files[first[0].derivedSourceId].status = 'optional-reference';
    const before = fs.readFileSync(path.join(root, 'assets-src/original.png'));
    calls.length = 0;
    const rebuilt = materializeCropPlan(plan, { ...options, rebuild: true });
    assert.ok(rebuilt.every(row => row.status === 'pending-independent-crop-qa'));
    assert.equal(calls.filter(call => call.command === 'git').length, 1);
    assert.equal(calls.filter(call => call.command === 'ffmpeg' && call.args.includes('-filter_complex')).length, 1);
    assert.deepEqual(fs.readFileSync(path.join(root, 'assets-src/original.png')), before);
    fs.unlinkSync(path.join(root, 'assets-src/full.png'));
    fs.symlinkSync(path.join(root, 'assets-src/original.png'), path.join(root, 'assets-src/full.png'));
    assert.throws(() => materializeCropPlan(plan, { ...options, rebuild: true }), /regular derived file/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
