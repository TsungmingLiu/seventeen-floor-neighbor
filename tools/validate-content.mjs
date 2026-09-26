import { loadContent, validateContent } from './content-lib.mjs';

try {
  if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--final-visuals')) {
    throw new Error('usage: node tools/validate-content.mjs [--final-visuals]');
  }
  const content = await loadContent();
  const errors = await validateContent(content, { finalVisuals: process.argv[2] === '--final-visuals' });
  if (errors.length) throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
  const { manifest, recipes, characters, routes } = content;
  const nodeCount = routes.reduce((sum, route) => sum + Object.keys(route.chapter.nodes).length, 0);
  console.log(
    `Validated ${routes.length} route(s), ${Object.keys(characters).length} character(s), ` +
    `${Object.keys(manifest.assets).length} asset(s), ${recipes.recipes.length} recipe(s), ` +
    `and ${nodeCount} story node(s)${process.argv[2] === '--final-visuals' ? ' for final visual acceptance' : ''}.`
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
