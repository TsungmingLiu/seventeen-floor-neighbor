import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
const packs = read('content/assets/character-reference-packs.json');
const catalog = read('content/assets/source-catalog.json');
const roles = { 'face.01': 'primary_face_identity', 'expression.02': 'expression', 'body.03': 'body_proportions', 'production.04': 'production_consistency', 'wardrobe.a': 'wardrobe', 'wardrobe.b': 'wardrobe' };
function insist(value, message) { if (!value) throw new Error(message); }

export function validateCharacterReferencePacks(sourceCatalog = catalog, registry = packs) {
  insist(registry.schemaVersion === 1 && registry.lifecycle === 'CANONICAL', 'invalid character reference pack registry');
  for (const [characterId, pack] of Object.entries(registry.characters)) {
    insist(Object.keys(pack.sheets).length === 6 && new Set(Object.values(pack.sheets)).size === 6, `${characterId} must have exactly six reference sheets`);
    for (const [sheet, role] of Object.entries(roles)) {
      const source = sourceCatalog.files[pack.sheets[sheet]];
      insist(source?.characterId === characterId && source.role === role && source.status === 'active-production' && source.mimeType === 'image/png', `${characterId} ${sheet} reference role/character/status/format mismatch`);
    }
    for (const [key, wardrobe] of Object.entries(pack.wardrobes)) {
      insist([pack.sheets['wardrobe.a'], pack.sheets['wardrobe.b']].includes(wardrobe.sourceId) && typeof wardrobe.look === 'string' && wardrobe.look.trim(), `${characterId} ${key} wardrobe must resolve to an exact pack sheet and look`);
    }
  }
  return registry;
}

/** Explicit, bounded selection; never attach all sheets or infer acting from scene prose. */
export function selectCharacterReferences({ characterId, wardrobeKey, expression = false, body = false, production = true }, sourceCatalog = catalog, registry = packs) {
  const pack = registry.characters[characterId];
  insist(pack, `unknown character reference pack: ${characterId}`);
  const wardrobe = pack.wardrobes[wardrobeKey];
  insist(wardrobe, `unknown wardrobe key for ${characterId}: ${wardrobeKey}`);
  const ids = [pack.sheets['face.01'], ...(production ? [pack.sheets['production.04']] : []), wardrobe.sourceId,
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
    // Accepted entries retain their original render provenance. New edits inherit the
    // accepted base and only acquire explicitly declared supplementary references.
    if (entry.status === 'accepted' || entry.reference_transport.mode === 'edit_from_accepted_base') continue;
    const requirements = character.reference_requirements ?? { production_consistency: true, expression: false, body_proportions: false };
    insist(requirements && typeof requirements === 'object' && !Array.isArray(requirements), `${context}: invalid reference_requirements`);
    for (const key of ['production_consistency', 'expression', 'body_proportions']) insist(typeof requirements[key] === 'boolean', `${context}: reference_requirements.${key} must be boolean`);
    if (!requirements.production_consistency) insist(typeof requirements.production_omission_reason === 'string' && requirements.production_omission_reason.trim(), `${context}: production omission requires a reason`);
    const needsBody = requirements.body_proportions || /(?:full[_ -]?body|long[_ -]?shot|全身)/i.test(entry.camera.shot_size);
    const expected = selectCharacterReferences({ characterId: character.character_id, wardrobeKey: character.wardrobe_key,
      production: requirements.production_consistency, expression: requirements.expression, body: needsBody }, sourceCatalog, registry);
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
      else if (args[index] === '--expression') options.expression = true;
      else if (args[index] === '--body') options.body = true;
      else throw new Error(`unknown argument: ${args[index]}`);
    }
    const reference_bindings = selectCharacterReferences(options);
    process.stdout.write(`${JSON.stringify({ reference_requirements: { production_consistency: true, expression: !!options.expression, body_proportions: !!options.body }, reference_bindings,
      attachments: reference_bindings.map((binding) => ({ ...binding, pixels_must_be_visible: true })) }, null, 2)}\n`);
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
