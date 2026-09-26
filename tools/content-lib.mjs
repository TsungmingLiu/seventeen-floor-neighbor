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
  const memoryLibrary = config.memoryFile
    ? await readJson(config.memoryFile)
    : { schemaVersion: 1, sections: [], events: [] };
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
    memoryLibrary,
    assetManifest: { manifestVersion: manifest.manifestVersion, assets }
  };
}

export async function loadContent() {
  const characterFiles = (await readdir(path.join(projectRoot, 'content/characters')))
    .filter((name) => name.endsWith('.json'));
  const characterList = await Promise.all(
    characterFiles.map((name) => readJson(`content/characters/${name}`))
  );
  const [manifest, recipes, routeIndex, assetSources, sourceCatalog] = await Promise.all([
    readJson('content/assets/manifest.json'),
    readJson('content/recipes/assets.json'),
    readJson('content/routes/index.json'),
    readJson('content/assets/source-map.json'),
    readJson('content/assets/source-catalog.json')
  ]);
  const routes = await Promise.all((routeIndex.routes || []).map((entry) => loadRoute(entry, manifest)));
  return {
    manifest,
    recipes,
    routeIndex,
    assetSources,
    sourceCatalog,
    routes,
    characters: Object.fromEntries(characterList.map((character) => [character.id, character]))
  };
}


function validateMemoryRoute(route, fail) {
  const { config, chapter, memoryLibrary, assetManifest } = route;
  const sections = memoryLibrary?.sections || [];
  const events = memoryLibrary?.events || [];
  const assets = assetManifest.assets || {};
  if (memoryLibrary?.schemaVersion !== 1) fail(`route ${config.id} memories: schemaVersion must be 1`);

  const sectionIds = new Set();
  for (const section of sections) {
    if (!section.id || sectionIds.has(section.id)) fail(`route ${config.id} memories: duplicate or missing section id ${section.id || '(missing)'}`);
    sectionIds.add(section.id);
    if (!Number.isFinite(section.order)) fail(`route ${config.id} memory section ${section.id}: numeric order required`);
    if (!['common', 'heroine', 'side'].includes(section.kind)) fail(`route ${config.id} memory section ${section.id}: unsupported kind ${section.kind}`);
  }

  const validFocus = (focus) =>
    !!focus
    && Number.isFinite(focus.x) && focus.x >= 0 && focus.x <= 100
    && Number.isFinite(focus.y) && focus.y >= 0 && focus.y <= 100;

  const eventIds = new Set();
  let hasStart = false;
  for (const event of events) {
    if (!event.id || eventIds.has(event.id)) fail(`route ${config.id} memories: duplicate or missing event id ${event.id || '(missing)'}`);
    eventIds.add(event.id);
    if (!sectionIds.has(event.sectionId)) fail(`route ${config.id} memory ${event.id}: unknown section ${event.sectionId}`);
    if (!Number.isFinite(event.order) || !Number.isFinite(event.progressRank)) fail(`route ${config.id} memory ${event.id}: numeric order/progressRank required`);
    if (!chapter.nodes[event.replayNode]) fail(`route ${config.id} memory ${event.id}: unknown replayNode ${event.replayNode}`);
    for (const nodeId of event.unlockNodes || []) {
      if (!chapter.nodes[nodeId]) fail(`route ${config.id} memory ${event.id}: unknown unlockNode ${nodeId}`);
    }
    if (event.replayNode === chapter.startNode) hasStart = true;
    if (!event.title || !event.summary) fail(`route ${config.id} memory ${event.id}: title and summary required`);
    if (!Array.isArray(event.characterIds)) fail(`route ${config.id} memory ${event.id}: characterIds must be an array`);
    const coverAsset = event.cover?.asset ? assets[event.cover.asset] : null;
    if (!event.cover?.asset || !coverAsset) fail(`route ${config.id} memory ${event.id}: unknown cover asset ${event.cover?.asset}`);
    if (coverAsset?.previewOnly && chapter.allowPreviewArt !== true) {
      fail(`route ${config.id} memory ${event.id}: preview art requires allowPreviewArt`);
    }
    if (!['character', 'scene'].includes(event.cover?.mode)) {
      fail(`route ${config.id} memory ${event.id}: cover mode must be character or scene`);
    } else if (event.cover.mode === 'character') {
      if (coverAsset && !['cg', 'cinematic'].includes(coverAsset.kind)) {
        fail(`route ${config.id} memory ${event.id}: character cover must use CG or cinematic asset`);
      }
      if (!validFocus(event.cover.focus)) {
        fail(`route ${config.id} memory ${event.id}: character cover requires valid focus x/y in 0..100`);
      }
    } else if (event.cover.mode === 'scene' && coverAsset && !['background', 'cg'].includes(coverAsset.kind)) {
      fail(`route ${config.id} memory ${event.id}: scene cover must use background or CG asset`);
    }
    if (event.cover?.mobileFocus && !validFocus(event.cover.mobileFocus)) {
      fail(`route ${config.id} memory ${event.id}: mobileFocus requires valid x/y in 0..100`);
    }
    if (event.titleBackdropAsset && !assets[event.titleBackdropAsset]) fail(`route ${config.id} memory ${event.id}: unknown titleBackdropAsset ${event.titleBackdropAsset}`);
    if (assets[event.titleBackdropAsset]?.previewOnly && chapter.allowPreviewArt !== true) {
      fail(`route ${config.id} memory ${event.id}: preview title backdrop requires allowPreviewArt`);
    }
    for (const assetId of event.galleryAssets || []) {
      if (!assets[assetId]?.gallery) fail(`route ${config.id} memory ${event.id}: gallery asset ${assetId} is missing or not gallery-enabled`);
    }
  }
  if (!hasStart) fail(`route ${config.id} memories: one event must replay chapter startNode ${chapter.startNode}`);
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

  const requireChapterArt = (id, where) => {
    const asset = assets[id];
    if (asset?.kind === 'background' && asset.previewOnly === true) {
      if (chapter.allowPreviewArt !== true) fail(`route ${config.id} ${where}: preview art requires allowPreviewArt`);
      return requireAsset(id, 'background', where);
    }
    return requireAsset(id, 'cg', where);
  };

  if (!config.label || !config.context) fail(`route ${config.id}: label and context are required`);
  if ('allowPreviewArt' in chapter && typeof chapter.allowPreviewArt !== 'boolean') {
    fail(`route ${config.id}: allowPreviewArt must be boolean`);
  }
  if (!nodes[chapter.startNode]) fail(`route ${config.id}: unknown start node ${chapter.startNode}`);
  requireChapterArt(chapter.titleArt, 'titleArt');
  requireChapterArt(chapter.endingArt, 'endingArt');
  Object.entries(chapter.endings || {}).forEach(([id, ending]) => {
    if (ending.art) requireChapterArt(ending.art, `ending ${id}`);
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
      const background = requireAsset(visual.background, 'background', `node ${id}`);
      if (background?.previewOnly && chapter.allowPreviewArt !== true) {
        fail(`route ${config.id} node ${id}: preview art requires allowPreviewArt`);
      }
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

export async function validateContent(content, { finalVisuals = false } = {}) {
  const errors = [];
  const { manifest, recipes, characters, routeIndex, routes, assetSources } = content;
  const assets = manifest.assets || {};
  const sourceFiles = assetSources?.files || {};
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

  if (![1, 2].includes(assetSources?.sourceMapVersion)) fail('asset source map: unsupported or missing sourceMapVersion');

  const normalizeSource = (entry) =>
    typeof entry === 'string' ? { provider: 'local', source: entry, transform: 'copy' } : { provider: 'local', transform: 'copy', ...entry };

  for (const [runtimePath, rawEntry] of Object.entries(sourceFiles)) {
    const entry = normalizeSource(rawEntry);
    if (!runtimePath.startsWith('assets/')) fail(`asset source map: runtime path must stay under assets/: ${runtimePath}`);
    if (entry.provider === 'local') {
      if (!entry.source?.startsWith('assets-src/')) fail(`asset source map: local source must stay under assets-src/: ${entry.source}`);
      if (entry.source?.split('/').includes('..') || entry.source?.includes('\\')) fail(`asset source map: invalid local path ${entry.source}`);
      if (entry.fileId || entry.url) fail(`asset source map: remote fields are forbidden on local source ${runtimePath}`);
      try {
        await access(path.join(projectRoot, entry.source));
      } catch {
        fail(`asset source map: missing local source ${entry.source} for ${runtimePath}`);
      }
    } else {
      fail(`asset source map: unsupported provider ${entry.provider} for ${runtimePath}`);
    }
    if (entry.provider === 'local') {
      if (entry.transform !== 'copy') fail(`asset source map: runtime conversion is not allowed for ${runtimePath}; ingest first`);
      if (entry.sha256 && !/^[0-9a-f]{64}$/.test(entry.sha256)) fail(`asset source map: invalid SHA-256 for ${runtimePath}`);
      if (entry.bytes != null && (!Number.isSafeInteger(entry.bytes) || entry.bytes <= 0)) fail(`asset source map: invalid byte count for ${runtimePath}`);
    }
  }

  for (const [id, asset] of Object.entries(assets)) {
    if (id === 'bg.narrative_preview.placeholder' && asset.previewOnly !== true) {
      fail(`asset ${id}: previewOnly must remain true`);
    }
    if (asset.previewOnly !== undefined) {
      if (asset.previewOnly !== true || id !== 'bg.narrative_preview.placeholder' || asset.kind !== 'background' ||
          asset.gallery || asset.participants || asset.canonicalCgEntry || asset.src !== 'assets/ui/narrative-preview-v1.webp') {
        fail(`asset ${id}: invalid preview-only asset contract`);
      }
    }
    const files = asset.kind === 'cinematic' ? [asset.poster, ...Object.values(asset.sources || {})] : [asset.src];
    for (const file of files) {
      if (!file) {
        fail(`asset ${id}: missing required file declaration`);
        continue;
      }
      const sourceEntry = sourceFiles[file];
      if (!sourceEntry) {
        fail(`asset ${id}: no source mapping for runtime file ${file}`);
        continue;
      }
      const normalized = typeof sourceEntry === 'string'
        ? { provider: 'local', source: sourceEntry }
        : { provider: 'local', ...sourceEntry };
      if (normalized.provider === 'local') {
        try {
          await access(path.join(projectRoot, normalized.source));
        } catch {
          fail(`asset ${id}: missing source ${normalized.source} for runtime file ${file}`);
        }
      }
    }
    if (asset.kind === 'sprite') validateDependency(asset, `asset ${id}`);
    (asset.participants || []).forEach((participant) => validateDependency(participant, `asset ${id}`));
    if (asset.kind === 'cinematic') {
      if (!asset.sources?.mp4) fail(`asset ${id}: cinematic requires an MP4 primary source`);
      if (!Number.isFinite(asset.duration) || asset.duration <= 0) fail(`asset ${id}: cinematic requires positive duration`);
    }
  }

  const recipeOutputs = new Set();
  const canonicalCgManifests = new Map();
  for (const recipe of recipes.recipes || []) {
    const asset = assets[recipe.outputAsset];
    if (!asset) fail(`recipe ${recipe.id}: unknown asset ${recipe.outputAsset}`);
    else if (asset.kind !== recipe.type) fail(`recipe ${recipe.id}: ${recipe.outputAsset} must be ${recipe.type}, got ${asset.kind}`);
    if (recipeOutputs.has(recipe.outputAsset)) fail(`duplicate recipe output ${recipe.outputAsset}`);
    recipeOutputs.add(recipe.outputAsset);
    (recipe.dependencies || []).forEach((dependency) => validateDependency(dependency, `recipe ${recipe.id}`));
    let environmentOnlyCg = false;
    if (recipe.type === 'cg' && !(recipe.dependencies || []).length && asset?.kind === 'cg') {
      const manifestPath = asset.canonicalCgManifest;
      if (manifestPath?.startsWith('content/production/cg-manifests/') && asset.canonicalCgEntry &&
          recipe.canonicalCgManifest === manifestPath && recipe.canonicalCgEntry === asset.canonicalCgEntry &&
          Array.isArray(asset.participants) && asset.participants.length === 0) {
        try {
          if (!canonicalCgManifests.has(manifestPath)) canonicalCgManifests.set(manifestPath, await readJson(manifestPath));
          const entry = canonicalCgManifests.get(manifestPath).entries?.find((item) => item.entry_id === asset.canonicalCgEntry);
          environmentOnlyCg = entry?.entry_id === asset.canonicalAssetId && entry.cg_class === 'background_cg' &&
            Array.isArray(entry.characters) && entry.characters.length === 0;
        } catch {
          environmentOnlyCg = false;
        }
      }
    }
    if (asset?.kind !== 'background' && !(recipe.dependencies || []).length && !environmentOnlyCg) fail(`recipe ${recipe.id}: character asset requires dependencies`);
    if (recipe.type === 'cg' && !environmentOnlyCg && !recipe.prompt?.headPose) fail(`recipe ${recipe.id}: CG prompt requires an explicit headPose`);
  }
  for (const id of Object.keys(assets)) {
    if (!recipeOutputs.has(id)) fail(`asset ${id}: no generation recipe`);
    if (!assets[id].previewOnly && !routes.some((route) => route.config.assetIds?.includes(id))) fail(`asset ${id}: not assigned to any route`);
  }
  for (const route of routes) {
    for (const id of route.config.assetIds || []) if (!assets[id]) fail(`route ${route.config.id}: unknown asset ${id}`);
    if (finalVisuals && (route.config.assetIds || []).some((id) => assets[id]?.previewOnly)) {
      fail(`route ${route.config.id}: final visual acceptance forbids preview asset allowlist entries`);
    }
    if (finalVisuals && route.chapter.allowPreviewArt === true) {
      fail(`route ${route.config.id}: final visual acceptance forbids allowPreviewArt`);
    }
    validateStoryRoute(route, fail);
    validateMemoryRoute(route, fail);
  }
  return errors;
}

export async function loadAndValidate() {
  const content = await loadContent();
  const errors = await validateContent(content);
  if (errors.length) throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
  return content;
}
