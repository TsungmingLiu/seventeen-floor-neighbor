import { loadAndValidate } from './content-lib.mjs';

try {
  const { manifest, chapter, recipes, characters } = await loadAndValidate();
  console.log(
    `Validated ${Object.keys(characters).length} character(s), ` +
    `${Object.keys(manifest.assets).length} asset(s), ` +
    `${recipes.recipes.length} recipe(s), and ${Object.keys(chapter.nodes).length} story node(s).`
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
