import { loadAndValidate } from './content-lib.mjs';

try {
  const { manifest, recipes, characters, routes } = await loadAndValidate();
  const nodeCount = routes.reduce((sum, route) => sum + Object.keys(route.chapter.nodes).length, 0);
  console.log(
    `Validated ${routes.length} route(s), ${Object.keys(characters).length} character(s), ` +
    `${Object.keys(manifest.assets).length} asset(s), ${recipes.recipes.length} recipe(s), ` +
    `and ${nodeCount} story node(s).`
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
