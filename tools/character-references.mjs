import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
const packs = read('content/assets/character-reference-packs.json');
const catalog = read('content/assets/source-catalog.json');
const roles = { 'face.01': 'primary_face_identity', 'expression.02': 'expression', 'body.03': 'body_proportions', 'production.04': 'production_consistency', 'wardrobe.a': 'wardrobe', 'wardrobe.b': 'wardrobe' };
function insist(value, message) { if (!value) throw new Error(message); }

/** Canonical options are semantic-only; legacy duplicate keys become aliases. */
export function wardrobeInventory(characterId, registry = packs) {
  const pack = registry.characters[characterId];
  insist(pack, `unknown character reference pack: ${characterId}`);
  const rows = [];
  for (const [key, item] of Object.entries(pack.wardrobes)) {
    if (item.aliasOf) {
      const target = pack.wardrobes[item.aliasOf];
      insist(target && !target.aliasOf && target.sourceId === item.sourceId && target.look === item.look,
        `${characterId} ${key}: invalid wardrobe alias`);
      continue;
    }
    const existing = rows.find(row => row.sourceId === item.sourceId && row.look === item.look);
    if (existing) existing.aliases.push(key);
    else rows.push({ wardrobeKey: key, sourceId: item.sourceId, look: item.look, aliases: [] });
  }
  for (const [key, item] of Object.entries(pack.wardrobes)) if (item.aliasOf) {
    const row = rows.find(row => row.wardrobeKey === item.aliasOf);
    insist(row, `${characterId} ${key}: alias must target a canonical look`);
    row.aliases.push(key);
  }
  return rows;
}

export function writerWardrobeOptions(characterId, registry = packs) {
  return wardrobeInventory(characterId, registry).map(({ wardrobeKey, look, aliases }) => ({ wardrobe_key: wardrobeKey, look, aliases }));
}

export function wardrobeVariantForShot(shotSize) {
  insist(['extreme_wide', 'wide', 'medium_wide', 'medium'].includes(shotSize), `unsupported exact-look shot_size: ${shotSize}`);
  return shotSize === 'medium' ? 'upper' : 'full';
}

export function validateWardrobeDerivation(source, { characterId, wardrobeKey, variant, sourceRef }, sourceCatalog = catalog, registry = packs) {
  const row = wardrobeInventory(characterId, registry).find(row => row.wardrobeKey === wardrobeKey || row.aliases.includes(wardrobeKey));
  insist(row, `unknown wardrobe key for ${characterId}: ${wardrobeKey}`);
  const original = sourceCatalog.files[row.sourceId];
  const d = source?.derivation;
  insist(original?.characterId === characterId && original.role === 'wardrobe' && original.status === 'active-production'
    && source?.characterId === characterId && source.role === 'wardrobe' && source.status === 'active-production'
    && source.mimeType === 'image/png' && source.verifiedDecode === true
    && Number.isInteger(source.width) && source.width > 0 && Number.isInteger(source.height) && source.height > 0
    && typeof source.sourcePath === 'string' && source.sourcePath.startsWith('assets-src/') && !source.sourcePath.split('/').includes('..')
    && path.basename(source.sourcePath) === source.name
    && d?.sourceId === row.sourceId && d.sourcePath === original.sourcePath
    && typeof d.sourceRef === 'string' && d.sourceRef.trim() && !d.sourceRef.startsWith('-') && !/[\s\x00]/.test(d.sourceRef)
    && (!sourceRef || d.sourceRef === sourceRef)
    && d.wardrobeKey === row.wardrobeKey && d.variant === variant && ['full', 'upper'].includes(variant),
  `${characterId} ${wardrobeKey}: exact-look provenance/character/variant/status mismatch`);
  const r = d.rect;
  insist(r && ['left', 'top', 'width', 'height'].every(key => Number.isInteger(r[key]))
    && r.left >= 0 && r.top >= 0 && r.width > 0 && r.height > 0
    && r.left + r.width <= original.width && r.top + r.height <= original.height
    && source.width === r.width && source.height === r.height,
  `${characterId} ${wardrobeKey}: invalid native crop rectangle/dimensions`);
  return source;
}

export function validateCharacterReferencePacks(sourceCatalog = catalog, registry = packs) {
  insist(registry.schemaVersion === 1 && registry.lifecycle === 'CANONICAL', 'invalid character reference pack registry');
  for (const [characterId, pack] of Object.entries(registry.characters)) {
    insist(Object.keys(pack.sheets).length === 6 && new Set(Object.values(pack.sheets)).size === 6, `${characterId} must have exactly six reference sheets`);
    for (const [sheet, role] of Object.entries(roles)) {
      const source = sourceCatalog.files[pack.sheets[sheet]];
      insist(source?.characterId === characterId && source.role === role && source.status === 'active-production' && source.mimeType === 'image/png', `${characterId} ${sheet} reference role/character/status/format mismatch`);
    }
    wardrobeInventory(characterId, registry);
    for (const [key, wardrobe] of Object.entries(pack.wardrobes)) {
      insist([pack.sheets['wardrobe.a'], pack.sheets['wardrobe.b']].includes(wardrobe.sourceId) && typeof wardrobe.look === 'string' && wardrobe.look.trim(), `${characterId} ${key} wardrobe must resolve to an exact pack sheet and look`);
      if (wardrobe.generationRefs !== undefined) {
        insist(!wardrobe.aliasOf && wardrobe.generationRefs && Object.keys(wardrobe.generationRefs).length === 2
          && ['full', 'upper'].every(variant => typeof wardrobe.generationRefs[variant] === 'string'), `${characterId} ${key}: generationRefs requires full and upper`);
        for (const variant of ['full', 'upper']) validateWardrobeDerivation(sourceCatalog.files[wardrobe.generationRefs[variant]],
          { characterId, wardrobeKey: key, variant }, sourceCatalog, registry);
        insist(wardrobe.generationRefs.full !== wardrobe.generationRefs.upper, `${characterId} ${key}: duplicate generation refs`);
        insist(sourceCatalog.files[wardrobe.generationRefs.full].derivation.sourceRef === sourceCatalog.files[wardrobe.generationRefs.upper].derivation.sourceRef, `${characterId} ${key}: full/upper source ref mismatch`);
      }
    }
  }
  return registry;
}

/** A new pack receipt must attest exactly the six registered production sources. */
export function validateCharacterReferencePackReceipt(receipt, characterId, sourceCatalog = catalog, registry = packs) {
  const pack = registry.characters[characterId];
  insist(pack && receipt.receiptVersion === 1 && receipt.gate === 'complete-character-reference-pack'
    && receipt.characterId === characterId && receipt.canonicalProfile === pack.canonicalProfile
    && receipt.sourceCatalog === 'content/assets/source-catalog.json'
    && receipt.referencePackRegistry === 'content/assets/character-reference-packs.json'
    && receipt.acceptanceScope === 'character_reference_pack_only'
    && receipt.runtimeMasterAcceptance === 'NOT_ACCEPTED', `${characterId}: invalid reference pack receipt identity/scope`);
  const expected = new Set(Object.values(pack.sheets));
  insist(Array.isArray(receipt.references) && receipt.references.length === 6, `${characterId}: receipt requires six sheets`);
  for (const item of receipt.references) {
    insist(expected.delete(item.sourceId), `${characterId}: duplicate or unrelated receipt source: ${item.sourceId}`);
    insist(typeof item.uploadedFilename === 'string' && item.uploadedFilename.trim(), `${characterId}: missing uploaded filename`);
    const source = sourceCatalog.files[item.sourceId];
    for (const key of ['name', 'sourcePath', 'width', 'height', 'mimeType', 'verifiedDecode', 'status', 'characterId', 'role', 'provenance']) {
      insist(source?.[key] === item[key], `${characterId}: reference receipt ${key} mismatch: ${item.sourceId}`);
    }
    insist(source.verifiedDecode === true, `${characterId}: reference receipt requires verified decode`);
  }
  insist(expected.size === 0, `${characterId}: unreceipted reference sheet`);
  if (pack.heightLabelPolicy || receipt.heightLabelOverride) {
    const override = receipt.heightLabelOverride;
    insist(pack.heightLabelPolicy === 'canonical_profile_prevails'
      && override?.policy === pack.heightLabelPolicy
      && override.canonicalHeightCm === pack.canonicalHeightCm
      && override.embeddedHeightLabelCm === pack.embeddedHeightLabelCm
      && override.scope === 'embedded_height_labels_only'
      && typeof override.humanDecision === 'string' && override.humanDecision.trim()
      && /^[a-f0-9]{64}$/.test(receipt.canonicalProfileSha256)
      && Array.isArray(override.sourceIds) && override.sourceIds.length === 6
      && new Set(override.sourceIds).size === 6
      && override.sourceIds.every(id => Object.values(pack.sheets).includes(id)),
    `${characterId}: invalid reference receipt height-label override`);
  }
  validateCharacterReferencePacks(sourceCatalog, registry);
  return receipt.references.map(item => item.sourceId);
}

/** Verify the two current wardrobe replacements against immutable original evidence. */
export function validateCharacterWardrobeReplacementReceipt(receipt, previousReceipt, previousReceiptSha256, sourceCatalog = catalog, registry = packs) {
  const context = 'Jiang Yucheng wardrobe replacement receipt';
  const pack = registry.characters.jiang_yucheng;
  insist(pack && receipt.receiptVersion === 1 && receipt.gate === 'character-wardrobe-reference-replacement'
    && receipt.characterId === 'jiang_yucheng' && receipt.canonicalProfile === 'docs/art/characters/jiang-yucheng.md'
    && receipt.sourceCatalog === 'content/assets/source-catalog.json'
    && receipt.referencePackRegistry === 'content/assets/character-reference-packs.json'
    && receipt.acceptanceScope === 'wardrobe_reference_replacement_only'
    && receipt.runtimeMasterAcceptance === 'NOT_ACCEPTED', `${context}: invalid identity/scope`);
  insist(previousReceipt.receiptVersion === 1 && previousReceipt.gate === 'complete-character-reference-packs'
    && previousReceipt.sourceCatalog === receipt.sourceCatalog
    && receipt.previousReceipt?.path === 'content/assets/ingest-receipts/character-reference-packs-20260930.json'
    && /^[a-f0-9]{64}$/.test(previousReceiptSha256)
    && receipt.previousReceipt.sha256 === previousReceiptSha256, `${context}: invalid previous receipt binding`);
  const expected = new Set([pack.sheets['wardrobe.a'], pack.sheets['wardrobe.b']]);
  insist(expected.size === 2 && Array.isArray(receipt.references) && receipt.references.length === 2
    && Array.isArray(receipt.supersededReferences) && receipt.supersededReferences.length === 2,
  `${context}: requires exactly two replacements and supersessions`);
  const previousSources = new Map();
  for (const item of receipt.references) {
    insist(expected.delete(item.sourceId), `${context}: duplicate or unrelated source ${item.sourceId}`);
    insist(typeof item.uploadedFilename === 'string' && item.uploadedFilename.trim(), `${context}: missing uploaded filename`);
    const supersessions = receipt.supersededReferences.filter(record => record.sourceId === item.sourceId);
    const originals = previousReceipt.references.filter(record => record.sourceId === item.sourceId);
    insist(supersessions.length === 1 && originals.length === 1, `${context}: missing or duplicate supersession`);
    const previous = supersessions[0].previous;
    const original = Object.fromEntries(Object.entries(originals[0]).filter(([key]) => !['sourceId', 'uploadedFilename', 'sha256', 'bytes'].includes(key)));
    const previousIdentity = Object.fromEntries(Object.entries(previous || {}).filter(([key]) => !['sha256', 'bytes'].includes(key)));
    insist(previous && Object.keys(previousIdentity).length === Object.keys(original).length
      && Object.entries(original).every(([key, value]) => previousIdentity[key] === value), `${context}: altered previous evidence`);
    const source = sourceCatalog.files[item.sourceId];
    const current = Object.fromEntries(Object.entries(item).filter(([key]) => !['sourceId', 'uploadedFilename', 'sha256', 'bytes'].includes(key)));
    const active = Object.fromEntries(Object.entries(source || {}).filter(([key]) => !['sha256', 'bytes'].includes(key)));
    insist(source && Object.keys(active).length === Object.keys(current).length
      && Object.entries(active).every(([key, value]) => current[key] === value), `${context}: current catalog mismatch`);
    insist(source.characterId === 'jiang_yucheng' && source.role === 'wardrobe' && source.mimeType === 'image/png'
      && source.status === 'active-production' && source.verifiedDecode === true
      && ['name', 'sourcePath', 'characterId', 'role', 'mimeType', 'status'].every(key => source[key] === previous[key]), `${context}: invalid supersession chain`);
    previousSources.set(item.sourceId, previous);
  }
  insist(expected.size === 0, `${context}: unreceipted wardrobe`);
  validateCharacterReferencePacks(sourceCatalog, registry);
  return previousSources;
}

/** Explicit, bounded selection; never attach all sheets or infer acting from scene prose. */
export function selectCharacterReferences({ characterId, wardrobeKey, expression = false, body = false, production = true, wardrobeReferenceMode, shotSize, sourceRef }, sourceCatalog = catalog, registry = packs) {
  const pack = registry.characters[characterId];
  insist(pack, `unknown character reference pack: ${characterId}`);
  const wardrobe = pack.wardrobes[wardrobeKey];
  insist(wardrobe, `unknown wardrobe key for ${characterId}: ${wardrobeKey}`);
  insist(wardrobeReferenceMode === undefined || wardrobeReferenceMode === 'exact_look', 'invalid wardrobe_reference_mode');
  let wardrobeSourceId = wardrobe.sourceId;
  if (wardrobeReferenceMode === 'exact_look') {
    const variant = wardrobeVariantForShot(shotSize);
    const row = wardrobeInventory(characterId, registry).find(row => row.wardrobeKey === wardrobeKey || row.aliases.includes(wardrobeKey));
    wardrobeSourceId = pack.wardrobes[row.wardrobeKey].generationRefs?.[variant];
    insist(wardrobeSourceId, `${characterId} ${wardrobeKey}: missing exact-look ${variant} reference`);
    validateWardrobeDerivation(sourceCatalog.files[wardrobeSourceId], { characterId, wardrobeKey, variant, sourceRef }, sourceCatalog, registry);
  }
  const ids = [pack.sheets['face.01'], ...(production ? [pack.sheets['production.04']] : []), wardrobeSourceId,
    ...(expression ? [pack.sheets['expression.02']] : []), ...(body ? [pack.sheets['body.03']] : [])];
  return ids.map((id) => {
    const source = sourceCatalog.files[id];
    insist(source?.characterId === characterId && source.status === 'active-production', `missing or unrelated reference: ${id}`);
    return { role: source.role, source_id: id, expected_filename: source.name };
  });
}

export function validateCharacterReferenceSelection(entry, sourceCatalog = catalog, registry = packs) {
  for (const character of entry.characters) {
    const context = `${entry.entry_id} ${character.character_id}`;
    const seen = new Set();
    const supplementary = new Set();
    for (const binding of character.reference_bindings) {
      const source = sourceCatalog.files[binding.source_id];
      const namespacedRole = source && `${character.character_id}_${source.role}`;
      const wardrobeRole = `${character.character_id}_${binding.source_id.endsWith('.a') ? 'early_mid_wardrobe' : 'late_after_story_wardrobe'}`;
      insist(source?.characterId === character.character_id && (source.role === binding.role || binding.role === namespacedRole || (source.role === 'wardrobe' && binding.role === wardrobeRole)) && source.name === binding.expected_filename && (source.status === 'active-production' || (binding.role === 'accepted_character_continuity' && ['optional-reference', 'human-accepted-as-is'].includes(source.status))), `${context}: reference role/character/filename mismatch: ${binding.source_id}`);
      insist(!seen.has(binding.source_id), `${context}: duplicate reference ${binding.source_id}`);
      seen.add(binding.source_id);
      if (binding.role === 'accepted_character_continuity') supplementary.add(binding.source_id);
    }
    insist(character.wardrobe_reference_mode === undefined || character.wardrobe_reference_mode === 'exact_look', `${context}: invalid wardrobe_reference_mode`);
    // Accepted entries retain their original render provenance. New edits inherit the
    // accepted base and only acquire explicitly declared supplementary references.
    if (!character.wardrobe_reference_mode && (entry.status === 'accepted' || entry.reference_transport.mode === 'edit_from_accepted_base')) continue;
    const requirements = character.reference_requirements ?? { production_consistency: true, expression: false, body_proportions: false };
    insist(requirements && typeof requirements === 'object' && !Array.isArray(requirements), `${context}: invalid reference_requirements`);
    for (const key of ['production_consistency', 'expression', 'body_proportions']) insist(typeof requirements[key] === 'boolean', `${context}: reference_requirements.${key} must be boolean`);
    if (!requirements.production_consistency) insist(typeof requirements.production_omission_reason === 'string' && requirements.production_omission_reason.trim(), `${context}: production omission requires a reason`);
    const needsBody = requirements.body_proportions || /(?:full[_ -]?body|long[_ -]?shot|全身)/i.test(entry.camera.shot_size);
    const expected = selectCharacterReferences({ characterId: character.character_id, wardrobeKey: character.wardrobe_key,
      production: requirements.production_consistency, expression: requirements.expression, body: needsBody, wardrobeReferenceMode: character.wardrobe_reference_mode, shotSize: entry.camera.shot_size }, sourceCatalog, registry);
    insist(expected.length === seen.size - supplementary.size && expected.every((binding) => seen.has(binding.source_id)), `${context}: reference selection must match face, production, wardrobe and declared expression/body needs`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const options = {};
    for (let index = 0; index < args.length; index++) {
      if (args[index] === '--character') options.characterId = args[++index];
      else if (args[index] === '--wardrobe') options.wardrobeKey = args[++index];
      else if (args[index] === '--exact-look') options.wardrobeReferenceMode = 'exact_look';
      else if (args[index] === '--shot') options.shotSize = args[++index];
      else if (args[index] === '--options') options.options = true;
      else if (args[index] === '--expression') options.expression = true;
      else if (args[index] === '--body') options.body = true;
      else throw new Error(`unknown argument: ${args[index]}`);
    }
    if (options.options) { process.stdout.write(`${JSON.stringify(writerWardrobeOptions(options.characterId), null, 2)}\n`); process.exit(0); }
    const reference_bindings = selectCharacterReferences(options);
    process.stdout.write(`${JSON.stringify({ ...(options.wardrobeReferenceMode ? { wardrobe_reference_mode: options.wardrobeReferenceMode } : {}), reference_requirements: { production_consistency: true, expression: !!options.expression, body_proportions: !!options.body }, reference_bindings,
      attachments: reference_bindings.map((binding) => ({ ...binding, pixels_must_be_visible: true })) }, null, 2)}\n`);
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
