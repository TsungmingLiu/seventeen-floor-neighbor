import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), 'utf8'));
}

function mergeNamedCollections(documents, key, sourceLabel) {
  const merged = {};
  for (const document of documents) {
    for (const [id, value] of Object.entries(document[key] || {})) {
      if (id in merged) throw new Error(`${sourceLabel}: duplicate ${key.slice(0, -1)} ${id}`);
      merged[id] = value;
    }
  }
  return merged;
}

async function loadRoute(entry, manifest) {
  const config = await readJson(entry.config);
  if (config.id !== entry.id) throw new Error(`route index ${entry.id}: config id is ${config.id}`);
  const storyParts = await Promise.all((config.storyFiles || []).map(readJson));
  const sceneParts = await Promise.all((config.sceneFiles || []).map(readJson));
  const nodes = mergeNamedCollections(storyParts, 'nodes', `route ${config.id}`);
  const pools = mergeNamedCollections(sceneParts, 'pools', `route ${config.id}`);
  const chapter = { ...config.story, id: config.story.id || config.id, nodes };
  const assets = {};
  for (const id of config.assetIds || []) {
    if (manifest.assets?.[id]) assets[id] = manifest.assets[id];
  }
  return {
    entry,
    config,
    chapter,
    sceneLibrary: { pools },
    assetManifest: { manifestVersion: manifest.manifestVersion, assets }
  };
}

export async function loadContent() {
  const characterFiles = (await readdir(path.join(projectRoot, 'content/characters')))
    .filter((name) => name.endsWith('.json'));
  const characterList = await Promise.all(
    characterFiles.map((name) => readJson(`content/characters/${name}`))
  );
  const [manifest, recipes, routeIndex] = await Promise.all([
    readJson('content/assets/manifest.json'),
    readJson('content/recipes/assets.json'),
    readJson('content/routes/index.json')
  ]);
  const routes = await Promise.all((routeIndex.routes || []).map((entry) => loadRoute(entry, manifest)));
  return {
    manifest,
    recipes,
    routeIndex,
    routes,
    characters: Object.fromEntries(characterList.map((character) => [character.id, character]))
  };
}

function validateStoryRoute(route, fail) {
  const { config, chapter, sceneLibrary, assetManifest } = route;
  const assets = assetManifest.assets || {};
  const nodes = chapter.nodes || {};
  const scenePools = sceneLibrary.pools || {};
  const requireAsset = (id, kind, where) => {
    const asset = assets[id];
    if (!asset) {
      fail(`route ${config.id} ${where}: undeclared or unknown asset ${id}`);
      return null;
    }
    if (kind && asset.kind !== kind) fail(`route ${config.id} ${where}: ${id} must be ${kind}, got ${asset.kind}`);
    return asset;
  };

  if (!config.label || !config.context) fail(`route ${config.id}: label and context are required`);
  if (!nodes[chapter.startNode]) fail(`route ${config.id}: unknown start node ${chapter.startNode}`);
  requireAsset(chapter.titleArt, 'cg', 'titleArt');
  requireAsset(chapter.endingArt, 'cg', 'endingArt');
  Object.entries(chapter.endings || {}).forEach(([id, ending]) => {
    if (ending.art) requireAsset(ending.art, 'cg', `ending ${id}`);
  });

  const galleryOrders = new Set();
  for (const [id, asset] of Object.entries(assets)) {
    if (!['cg', 'cinematic'].includes(asset.kind)) continue;
    if (!asset.gallery?.title || !asset.gallery?.chapter || !Number.isFinite(asset.gallery?.order)) {
      fail(`route ${config.id} asset ${id}: gallery asset requires title, chapter, and numeric order`);
    } else if (galleryOrders.has(asset.gallery.order)) {
      fail(`route ${config.id} asset ${id}: duplicate gallery order ${asset.gallery.order}`);
    } else {
      galleryOrders.add(asset.gallery.order);
    }
  }

  for (const [id, node] of Object.entries(nodes)) {
    if (node.next && !nodes[node.next]) fail(`route ${config.id} node ${id}: unknown next node ${node.next}`);
    for (const choice of node.choices || []) {
      if (!nodes[choice.next]) fail(`route ${config.id} node ${id}: choice points to unknown node ${choice.next}`);
    }
    if (node.type === 'branch') {
      if (!nodes[node.default]) fail(`route ${config.id} node ${id}: unknown default branch ${node.default}`);
      for (const branch of node.cases || []) {
        if (!nodes[branch.next]) fail(`route ${config.id} node ${id}: branch points to unknown node ${branch.next}`);
        for (const condition of branch.conditions || []) {
          if (!(condition.stat in (chapter.initialState || {}))) fail(`route ${config.id} node ${id}: unknown stat ${condition.stat}`);
          if (!['>=', '>', '<=', '<', '=='].includes(condition.operator)) fail(`route ${config.id} node ${id}: unsupported operator ${condition.operator}`);
        }
      }
      continue;
    }
    if (node.type === 'random') {
      const pool = scenePools[node.pool];
      if (!pool) {
        fail(`route ${config.id} node ${id}: unknown random pool ${node.pool}`);
      } else {
        for (const entry of pool.entries || []) {
          if (!nodes[entry.entryNode]) fail(`route ${config.id} pool ${node.pool}: unknown entry node ${entry.entryNode}`);
          if (!entry.unlockFlag) fail(`route ${config.id} pool ${node.pool}: entry ${entry.id} requires unlockFlag`);
        }
      }
      if (!nodes[node.after]) fail(`route ${config.id} node ${id}: unknown random return target ${node.after}`);
      continue;
    }
    if (node.type === 'return' || node.type === 'route') continue;
    const visual = node.visual;
    if (!visual) {
      fail(`route ${config.id} node ${id}: missing visual`);
      continue;
    }
    if (visual.mode === 'cg') {
      requireAsset(visual.asset, 'cg', `node ${id}`);
      if ('background' in visual || 'sprites' in visual) fail(`route ${config.id} node ${id}: CG cannot include composite fields`);
    } else if (visual.mode === 'composite') {
      requireAsset(visual.background, 'background', `node ${id}`);
      (visual.sprites || []).forEach((sprite) => requireAsset(sprite.asset, 'sprite', `node ${id}`));
      if ('asset' in visual) fail(`route ${config.id} node ${id}: composite cannot include CG asset field`);
    } else if (visual.mode === 'cinematic') {
      requireAsset(visual.asset, 'cinematic', `node ${id}`);
      if ('background' in visual || 'sprites' in visual) fail(`route ${config.id} node ${id}: cinematic cannot include composite fields`);
    } else {
      fail(`route ${config.id} node ${id}: unsupported visual mode ${visual.mode}`);
    }
  }

  const reachable = new Set();
  const pending = [chapter.startNode];
  while (pending.length) {
    const id = pending.pop();
    if (!id || reachable.has(id) || !nodes[id]) continue;
    reachable.add(id);
    const node = nodes[id];
    pending.push(
      node.next,
      ...(node.choices || []).map((choice) => choice.next),
      node.default,
      ...(node.cases || []).map((branch) => branch.next),
      node.after,
      ...((node.type === 'random' ? scenePools[node.pool]?.entries : []) || []).map((entry) => entry.entryNode)
    );
  }
  for (const id of Object.keys(nodes)) if (!reachable.has(id)) fail(`route ${config.id} node ${id}: unreachable`);
  for (const rule of chapter.endingRules || []) {
    if (!chapter.endings?.[rule.ending]) fail(`route ${config.id} ending rule: unknown ending ${rule.ending}`);
    for (const condition of rule.conditions || []) {
      if (!(condition.stat in (chapter.initialState || {}))) fail(`route ${config.id} ending rule: unknown stat ${condition.stat}`);
      if (!['>=', '>', '<=', '<', '=='].includes(condition.operator)) fail(`route ${config.id} ending rule: unsupported operator ${condition.operator}`);
    }
  }
}

export async function validateContent(content) {
  const errors = [];
  const { manifest, recipes, characters, routeIndex, routes } = content;
  const assets = manifest.assets || {};
  const fail = (message) => errors.push(message);
  const validateDependency = (dependency, where) => {
    const character = characters[dependency.character];
    if (!character) return fail(`${where}: unknown character ${dependency.character}`);
    if (dependency.designVersion !== character.designVersion) fail(`${where}: character design version ${dependency.designVersion} != ${character.designVersion}`);
    if (dependency.outfit) {
      const outfit = character.outfits?.[dependency.outfit];
      if (!outfit) return fail(`${where}: unknown outfit ${dependency.outfit}`);
      if (dependency.outfitVersion !== outfit.version) fail(`${where}: outfit version ${dependency.outfitVersion} != ${outfit.version}`);
    }
    if (dependency.makeup) {
      const makeup = character.makeups?.[dependency.makeup];
      if (!makeup) return fail(`${where}: unknown makeup ${dependency.makeup}`);
      if (dependency.makeupVersion !== makeup.version) fail(`${where}: makeup version ${dependency.makeupVersion} != ${makeup.version}`);
    }
    if (dependency.hairstyle) {
      const hairstyle = character.hairstyles?.[dependency.hairstyle];
      if (!hairstyle) return fail(`${where}: unknown hairstyle ${dependency.hairstyle}`);
      if (dependency.hairstyleVersion !== hairstyle.version) fail(`${where}: hairstyle version ${dependency.hairstyleVersion} != ${hairstyle.version}`);
    }
  };

  if (!routes.some((route) => route.config.id === routeIndex.defaultRoute)) fail(`route index: unknown default route ${routeIndex.defaultRoute}`);
  const routeIds = new Set();
  for (const route of routes) {
    if (routeIds.has(route.config.id)) fail(`route index: duplicate route ${route.config.id}`);
    routeIds.add(route.config.id);
  }

  for (const [id, asset] of Object.entries(assets)) {
    const files = asset.kind === 'cinematic' ? [asset.poster, ...Object.values(asset.sources || {})] : [asset.src];
    for (const file of files) {
      if (!file) {
        fail(`asset ${id}: missing required file declaration`);
        continue;
      }
      try {
        await access(path.join(projectRoot, 'dist', file));
      } catch {
        fail(`asset ${id}: missing dist/${file}`);
      }
    }
    if (asset.kind === 'sprite') validateDependency(asset, `asset ${id}`);
    (asset.participants || []).forEach((participant) => validateDependency(participant, `asset ${id}`));
    if (asset.kind === 'cinematic') {
      if (!asset.sources?.mp4 || !asset.sources?.webm) fail(`asset ${id}: cinematic requires MP4 and WebM sources`);
      if (!Number.isFinite(asset.duration) || asset.duration <= 0) fail(`asset ${id}: cinematic requires positive duration`);
    }
  }

  const recipeOutputs = new Set();
  for (const recipe of recipes.recipes || []) {
    const asset = assets[recipe.outputAsset];
    if (!asset) fail(`recipe ${recipe.id}: unknown asset ${recipe.outputAsset}`);
    else if (asset.kind !== recipe.type) fail(`recipe ${recipe.id}: ${recipe.outputAsset} must be ${recipe.type}, got ${asset.kind}`);
    if (recipeOutputs.has(recipe.outputAsset)) fail(`duplicate recipe output ${recipe.outputAsset}`);
    recipeOutputs.add(recipe.outputAsset);
    (recipe.dependencies || []).forEach((dependency) => validateDependency(dependency, `recipe ${recipe.id}`));
    if (asset?.kind !== 'background' && !(recipe.dependencies || []).length) fail(`recipe ${recipe.id}: character asset requires dependencies`);
    if (recipe.type === 'cg' && !recipe.prompt?.headPose) fail(`recipe ${recipe.id}: CG prompt requires an explicit headPose`);
  }
  for (const id of Object.keys(assets)) {
    if (!recipeOutputs.has(id)) fail(`asset ${id}: no generation recipe`);
    if (!routes.some((route) => route.config.assetIds?.includes(id))) fail(`asset ${id}: not assigned to any route`);
  }
  for (const route of routes) {
    for (const id of route.config.assetIds || []) if (!assets[id]) fail(`route ${route.config.id}: unknown asset ${id}`);
    validateStoryRoute(route, fail);
  }
  return errors;
}

export async function loadAndValidate() {
  const content = await loadContent();
  const errors = await validateContent(content);
  if (errors.length) throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
  return content;
}
