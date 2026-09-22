import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), 'utf8'));
}

export async function loadContent() {
  const characterFiles = (await readdir(path.join(projectRoot, 'content/characters')))
    .filter((name) => name.endsWith('.json'));
  const characterList = await Promise.all(
    characterFiles.map((name) => readJson(`content/characters/${name}`))
  );
  return {
    manifest: await readJson('content/assets/manifest.json'),
    chapter: await readJson('content/chapters/chapter-01.json'),
    sceneLibrary: await readJson('content/scenes/date-pool.json'),
    recipes: await readJson('content/recipes/assets.json'),
    characters: Object.fromEntries(characterList.map((character) => [character.id, character]))
  };
}

export async function validateContent(content) {
  const errors = [];
  const { manifest, chapter, sceneLibrary, recipes, characters } = content;
  const assets = manifest.assets || {};
  const nodes = chapter.nodes || {};
  const scenePools = sceneLibrary.pools || {};
  const fail = (message) => errors.push(message);
  const requireAsset = (id, kind, where) => {
    const asset = assets[id];
    if (!asset) {
      fail(`${where}: unknown asset ${id}`);
      return null;
    }
    if (kind && asset.kind !== kind) fail(`${where}: ${id} must be ${kind}, got ${asset.kind}`);
    return asset;
  };
  const validateDependency = (dependency, where) => {
    const character = characters[dependency.character];
    if (!character) return fail(`${where}: unknown character ${dependency.character}`);
    if (dependency.designVersion !== character.designVersion) {
      fail(`${where}: character design version ${dependency.designVersion} != ${character.designVersion}`);
    }
    if (dependency.outfit) {
      const outfit = character.outfits?.[dependency.outfit];
      if (!outfit) return fail(`${where}: unknown outfit ${dependency.outfit}`);
      if (dependency.outfitVersion !== outfit.version) {
        fail(`${where}: outfit version ${dependency.outfitVersion} != ${outfit.version}`);
      }
    }
    if (dependency.makeup) {
      const makeup = character.makeups?.[dependency.makeup];
      if (!makeup) return fail(`${where}: unknown makeup ${dependency.makeup}`);
      if (dependency.makeupVersion !== makeup.version) {
        fail(`${where}: makeup version ${dependency.makeupVersion} != ${makeup.version}`);
      }
    }
    if (dependency.hairstyle) {
      const hairstyle = character.hairstyles?.[dependency.hairstyle];
      if (!hairstyle) return fail(`${where}: unknown hairstyle ${dependency.hairstyle}`);
      if (dependency.hairstyleVersion !== hairstyle.version) {
        fail(`${where}: hairstyle version ${dependency.hairstyleVersion} != ${hairstyle.version}`);
      }
    }
  };

  const galleryOrders = new Set();
  for (const [id, asset] of Object.entries(assets)) {
    const files = asset.kind === 'cinematic'
      ? [asset.poster, ...Object.values(asset.sources || {})]
      : [asset.src];
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
    if (['cg', 'cinematic'].includes(asset.kind)) {
      if (!asset.gallery?.title || !asset.gallery?.chapter || !Number.isFinite(asset.gallery?.order)) {
        fail(`asset ${id}: gallery asset requires title, chapter, and numeric order`);
      } else if (galleryOrders.has(asset.gallery.order)) {
        fail(`asset ${id}: duplicate gallery order ${asset.gallery.order}`);
      } else {
        galleryOrders.add(asset.gallery.order);
      }
    }
  }

  const recipeOutputs = new Set();
  for (const recipe of recipes.recipes || []) {
    const asset = requireAsset(recipe.outputAsset, recipe.type, `recipe ${recipe.id}`);
    if (recipeOutputs.has(recipe.outputAsset)) fail(`duplicate recipe output ${recipe.outputAsset}`);
    recipeOutputs.add(recipe.outputAsset);
    (recipe.dependencies || []).forEach((dependency) => validateDependency(dependency, `recipe ${recipe.id}`));
    if (asset?.kind !== 'background' && !(recipe.dependencies || []).length) {
      fail(`recipe ${recipe.id}: character asset requires dependencies`);
    }
    if (recipe.type === 'cg' && !recipe.prompt?.headPose) {
      fail(`recipe ${recipe.id}: CG prompt requires an explicit headPose`);
    }
  }
  for (const id of Object.keys(assets)) {
    if (!recipeOutputs.has(id)) fail(`asset ${id}: no generation recipe`);
  }

  requireAsset(chapter.titleArt, 'cg', 'chapter titleArt');
  requireAsset(chapter.endingArt, 'cg', 'chapter endingArt');
  Object.entries(chapter.endings || {}).forEach(([id, ending]) => {
    if (ending.art) requireAsset(ending.art, 'cg', `ending ${id}`);
  });
  if (!nodes[chapter.startNode]) fail(`chapter: unknown start node ${chapter.startNode}`);
  for (const [id, node] of Object.entries(nodes)) {
    if (node.next && !nodes[node.next]) fail(`node ${id}: unknown next node ${node.next}`);
    for (const choice of node.choices || []) {
      if (!nodes[choice.next]) fail(`node ${id}: choice points to unknown node ${choice.next}`);
    }
    if (node.type === 'branch') {
      if (!nodes[node.default]) fail(`node ${id}: unknown default branch ${node.default}`);
      for (const branch of node.cases || []) {
        if (!nodes[branch.next]) fail(`node ${id}: branch points to unknown node ${branch.next}`);
        for (const condition of branch.conditions || []) {
          if (!(condition.stat in (chapter.initialState || {}))) fail(`node ${id}: unknown stat ${condition.stat}`);
          if (!['>=', '>', '<=', '<', '=='].includes(condition.operator)) fail(`node ${id}: unsupported operator ${condition.operator}`);
        }
      }
      continue;
    }
    if (node.type === 'random') {
      const pool = scenePools[node.pool];
      if (!pool) {
        fail(`node ${id}: unknown random pool ${node.pool}`);
      } else {
        for (const entry of pool.entries || []) {
          if (!nodes[entry.entryNode]) fail(`pool ${node.pool}: unknown entry node ${entry.entryNode}`);
          if (!entry.unlockFlag) fail(`pool ${node.pool}: entry ${entry.id} requires unlockFlag`);
        }
      }
      if (!nodes[node.after]) fail(`node ${id}: unknown random return target ${node.after}`);
      continue;
    }
    if (node.type === 'return' || node.type === 'route') continue;
    const visual = node.visual;
    if (!visual) {
      fail(`node ${id}: missing visual`);
      continue;
    }
    if (visual.mode === 'cg') {
      requireAsset(visual.asset, 'cg', `node ${id}`);
      if ('background' in visual || 'sprites' in visual) fail(`node ${id}: CG cannot include composite fields`);
    } else if (visual.mode === 'composite') {
      requireAsset(visual.background, 'background', `node ${id}`);
      (visual.sprites || []).forEach((sprite) => requireAsset(sprite.asset, 'sprite', `node ${id}`));
      if ('asset' in visual) fail(`node ${id}: composite cannot include CG asset field`);
    } else if (visual.mode === 'cinematic') {
      requireAsset(visual.asset, 'cinematic', `node ${id}`);
      if ('background' in visual || 'sprites' in visual) fail(`node ${id}: cinematic cannot include composite fields`);
    } else {
      fail(`node ${id}: unsupported visual mode ${visual.mode}`);
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
  for (const id of Object.keys(nodes)) if (!reachable.has(id)) fail(`node ${id}: unreachable`);
  for (const rule of chapter.endingRules || []) {
    if (!chapter.endings?.[rule.ending]) fail(`ending rule: unknown ending ${rule.ending}`);
    for (const condition of rule.conditions || []) {
      if (!(condition.stat in (chapter.initialState || {}))) fail(`ending rule: unknown stat ${condition.stat}`);
      if (!['>=', '>', '<=', '<', '=='].includes(condition.operator)) fail(`ending rule: unsupported operator ${condition.operator}`);
    }
  }

  return errors;
}

export async function loadAndValidate() {
  const content = await loadContent();
  const errors = await validateContent(content);
  if (errors.length) throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
  return content;
}
