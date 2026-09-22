import { loadContent } from './content-lib.mjs';

const characterId = process.argv[2];
if (!characterId) {
  console.error('Usage: npm run assets:plan -- <character-id>');
  process.exit(1);
}

const { characters, manifest, recipes } = await loadContent();
const character = characters[characterId];
if (!character) {
  console.error(`Unknown character: ${characterId}`);
  process.exit(1);
}

const affected = recipes.recipes
  .filter((recipe) => (recipe.dependencies || []).some((dependency) => dependency.character === characterId))
  .map((recipe) => {
    const dependency = recipe.dependencies.find((item) => item.character === characterId);
    const asset = manifest.assets[recipe.outputAsset];
    const outfitVersion = dependency.outfit ? character.outfits?.[dependency.outfit]?.version : undefined;
    const makeupVersion = dependency.makeup ? character.makeups?.[dependency.makeup]?.version : undefined;
    const hairstyleVersion = dependency.hairstyle ? character.hairstyles?.[dependency.hairstyle]?.version : undefined;
    const stale = Boolean(dependency.designVersion !== character.designVersion ||
      (dependency.outfit && dependency.outfitVersion !== outfitVersion) ||
      (dependency.makeup && dependency.makeupVersion !== makeupVersion) ||
      (dependency.hairstyle && dependency.hairstyleVersion !== hairstyleVersion) ||
      (asset?.designVersion && asset.designVersion !== character.designVersion) ||
      (dependency.outfit && asset?.outfitVersion && asset.outfitVersion !== outfitVersion) ||
      (dependency.makeup && asset?.makeupVersion && asset.makeupVersion !== makeupVersion) ||
      (dependency.hairstyle && asset?.hairstyleVersion && asset.hairstyleVersion !== hairstyleVersion));
    return {
      recipe: recipe.id,
      outputAsset: recipe.outputAsset,
      kind: recipe.type,
      stale
    };
  });

console.log(JSON.stringify({
  character: characterId,
  designVersion: character.designVersion,
  affectedCount: affected.length,
  affected
}, null, 2));
