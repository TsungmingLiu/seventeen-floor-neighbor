import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdir, readFile, mkdir, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAndValidate, projectRoot } from './content-lib.mjs';
import { validateProductionContracts } from './validate-production-contracts.mjs';
import { renderProductionReview } from './production-review-render.mjs';

const narrativeRoot = 'content/production/narrative';
const manifestRoot = 'content/production/cg-manifests';
const receiptPath = 'content/assets/ingest-receipts/repo-source-gate3-v1.json';

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function git(...args) {
  return execFileSync('git', ['-C', projectRoot, ...args], { encoding: 'utf8' }).trim();
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

// A review of a dirty source must not appear to describe the committed checkpoint.
async function committedSource(relative, sources) {
  requireCondition(typeof relative === 'string' && !relative.includes('\\') &&
    !relative.startsWith('/') && !relative.includes('://') &&
    relative.split('/').every((part) => part && part !== '.' && part !== '..'),
  `invalid review source path: ${relative}`);
  const bytes = await readFile(path.join(projectRoot, relative));
  const actualBlob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  const expectedBlob = git('rev-parse', `HEAD:${relative}`);
  requireCondition(actualBlob === expectedBlob, `review source differs from committed HEAD: ${relative}`);
  if (!sources.has(relative)) sources.set(relative, { path: relative, sha256: sha256(bytes) });
  return bytes.toString('utf8');
}

async function committedJson(relative, sources) {
  return JSON.parse(await committedSource(relative, sources));
}

async function jsonPaths(relative) {
  const entries = await readdir(path.join(projectRoot, relative), { withFileTypes: true });
  const paths = await Promise.all(entries.map(async (entry) => {
    const item = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) return jsonPaths(item);
    return entry.isFile() && entry.name.endsWith('.json') ? [item] : [];
  }));
  return paths.flat().sort();
}

function sceneNodeIds(text) {
  const script = text.match(/^## Locked playable script\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1] || '';
  return [...script.matchAll(/^### `([a-z0-9_]+)`\s*$/gm)].map((match) => match[1]);
}

function outgoing(node, route) {
  return [
    node?.next, ...(node?.choices || []).map((choice) => choice.next),
    node?.default, ...(node?.cases || []).map((branch) => branch.next),
    node?.after,
    ...((node?.type === 'random' ? route.sceneLibrary.pools[node.pool]?.entries : []) || []).map((entry) => entry.entryNode)
  ].filter(Boolean);
}

function nextScenes(route, exitNode, ownScene, nodeToScene) {
  if (!exitNode || !route.chapter.nodes[exitNode]) return [];
  const queue = outgoing(route.chapter.nodes[exitNode], route);
  const seen = new Set([exitNode]);
  const found = new Map();
  while (queue.length) {
    const nodeId = queue.shift();
    if (seen.has(nodeId) || !route.chapter.nodes[nodeId]) continue;
    seen.add(nodeId);
    const sceneId = nodeToScene.get(nodeId);
    if (sceneId && sceneId !== ownScene) {
      if (!found.has(sceneId)) found.set(sceneId, { sceneId, nodeId });
      continue;
    }
    queue.push(...outgoing(route.chapter.nodes[nodeId], route));
  }
  return [...found.values()].sort((a, b) => a.sceneId.localeCompare(b.sceneId));
}

function plannedTargets(text) {
  const section = text.match(/^### Next structural targets\s*\n([\s\S]*?)(?=^## |^### |$(?![\s\S]))/m)?.[1] || '';
  return [...section.matchAll(/^- (.+)$/gm)].map((match) => match[1].trim());
}

function resolveMemory(content, nodeIds) {
  const matches = [];
  for (const route of content.routes) {
    for (const event of route.memoryLibrary.events || []) {
      if (nodeIds.length && event.unlockNodes?.includes(nodeIds[0])) {
        matches.push({ route, event });
      }
    }
  }
  requireCondition(matches.length <= 1, 'review scene has ambiguous route / Memory bindings');
  return matches[0] || null;
}

export async function buildProductionReviewModel(sceneId) {
  requireCondition(/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(sceneId || ''), 'invalid scene ID');
  const content = await loadAndValidate();
  validateProductionContracts();
  const sources = new Map();
  const contracts = await Promise.all((await jsonPaths(narrativeRoot)).map(async (file) =>
    ({ file, value: await committedJson(file, sources) })));
  const match = contracts.filter(({ value }) => value.scene_id === sceneId);
  requireCondition(match.length === 1, `expected one Narrative Continuity Contract for ${sceneId}; found ${match.length}`);
  const contract = match[0].value;
  const locked = await committedSource(contract.source_scene, sources);
  const title = locked.match(/^# (.+)$/m)?.[1];
  requireCondition(title?.startsWith(sceneId), `${contract.source_scene}: title does not identify ${sceneId}`);
  const nodeIds = sceneNodeIds(locked);
  const nodeToScene = new Map();
  for (const { value } of contracts) {
    const text = value.scene_id === sceneId ? locked : await committedSource(value.source_scene, sources);
    for (const node of sceneNodeIds(text)) {
      requireCondition(!nodeToScene.has(node) || nodeToScene.get(node) === value.scene_id,
        `runtime node ${node} appears in more than one Locked Scene`);
      nodeToScene.set(node, value.scene_id);
    }
  }

  const manifests = await Promise.all((await jsonPaths(manifestRoot)).map(async (file) =>
    ({ file, value: await committedJson(file, sources) })));
  const entries = manifests.flatMap(({ file, value }) =>
    (value.entries || []).filter((entry) => entry.scene_id === sceneId).map((entry) => ({ file, entry })));
  const outputIds = entries.map(({ entry }) => entry.output.logical_asset_id);
  const bound = resolveMemory(content, nodeIds);
  const route = bound?.route;
  const memory = bound?.event;
  if (route) {
    await committedSource(route.entry.config, sources);
    for (const file of route.config.storyFiles) await committedSource(file, sources);
    if (route.config.memoryFile) await committedSource(route.config.memoryFile, sources);
    for (const nodeId of nodeIds) {
      requireCondition(route.chapter.nodes[nodeId] && memory.unlockNodes.includes(nodeId),
        `${sceneId} Locked Scene node ${nodeId} is not bound to its Memory event`);
    }
  }

  const receipt = await committedJson(receiptPath, sources);
  await committedSource('content/assets/manifest.json', sources);
  await committedSource('content/assets/source-map.json', sources);
  await committedSource('content/assets/source-catalog.json', sources);
  const visuals = [];
  for (const { entry } of entries) {
    const id = entry.output.logical_asset_id;
    const asset = content.manifest.assets[id];
    const binding = asset?.src && content.assetSources.files[asset.src];
    const source = binding?.masterSourceId && content.sourceCatalog.files[binding.masterSourceId];
    const accepted = receipt.acceptedAssets.find((item) => item.canonicalAssetId === entry.output.canonical_asset_id);
    let thumbnailDataUrl = null;
    let repoPath = source?.sourcePath || null;
    let assetHash = source?.sha256 || null;
    if (entry.status === 'accepted') {
      requireCondition(asset?.kind === 'cg' && route?.config.assetIds.includes(id),
        `${entry.entry_id}: accepted CG is not in the bound route asset allowlist`);
      requireCondition(binding && source && accepted && binding.source === source.sourcePath &&
        binding.sha256 === source.sha256 && binding.bytes === source.bytes &&
        accepted.logicalAssetId === id && accepted.sourceId === binding.masterSourceId &&
        accepted.repoPath === source.sourcePath && accepted.sha256 === source.sha256,
      `${entry.entry_id}: accepted CG receipt/catalog/runtime binding differs`);
      const bytes = await readFile(path.join(projectRoot, source.sourcePath));
      requireCondition(bytes.length === source.bytes && sha256(bytes) === source.sha256 &&
        source.mimeType === 'image/webp', `${entry.entry_id}: accepted thumbnail bytes differ`);
      thumbnailDataUrl = `data:image/webp;base64,${bytes.toString('base64')}`;
    }
    visuals.push({
      entryId: entry.entry_id, kind: entry.cg_class, status: entry.status, logicalId: id,
      repoPath, sha256: assetHash, thumbnailDataUrl,
      expression: (entry.characters || []).map((character) => character.expression).join(' / '),
      wardrobe: (entry.characters || []).map((character) => character.wardrobe_key).join(' / '),
      camera: entry.camera, acceptedBase: entry.reference_transport?.accepted_base_asset_id,
      knownIssues: [...new Set([...(entry.known_issues || []), ...(accepted?.knownIssues || [])])],
      purpose: entry.narrative?.purpose
    });
  }

  const choices = route ? nodeIds.flatMap((nodeId) => {
    const node = route.chapter.nodes[nodeId];
    return node.choices?.length ? [{ nodeId, items: node.choices.map((item) =>
      ({ text: item.text, next: item.next, effects: item.effects || {} })) }] : [];
  }) : [];
  const nodeBindings = route ? memory.unlockNodes.flatMap((nodeId) => {
    const id = route.chapter.nodes[nodeId]?.visual?.asset;
    return outputIds.includes(id) ? [{ nodeId, assetId: id }] : [];
  }) : [];
  const integrationStatus = !route ? 'UNBOUND' :
    outputIds.every((id) => nodeBindings.some((node) => node.assetId === id)) ? 'ROUTE_BOUND' : 'PARTIAL';
  const manifestStatus = !entries.length ? 'NO_CG_ENTRIES' :
    entries.every(({ entry }) => entry.status === 'accepted') ? 'ENTRIES_ACCEPTED' : 'IN_PROGRESS';
  return {
    scene: {
      id: sceneId, title, purpose: contract.scene_function,
      entry_state: contract.entry_state, exit_state: contract.exit_state,
      source_scene: contract.source_scene
    },
    choices,
    visuals,
    production: {
      readiness: 'NOT_READY', narrativeQa: 'UNRECORDED', manifestStatus,
      visualQa: 'UNRECORDED', integrationStatus,
      staleStatus: 'UNKNOWN_NO_RUN_LEDGER', validator: 'PASS_CURRENT_TREE',
      humanGate: 'UNRECORDED'
    },
    runtime: {
      routeId: route?.config.id || null,
      memory: memory ? {
        id: memory.id, title: memory.title, replayNode: memory.replayNode,
        coverAsset: memory.cover?.asset, galleryAssets: memory.galleryAssets || []
      } : null,
      nodeBindings,
      nextScenes: route ? nextScenes(route, nodeIds.at(-1), sceneId, nodeToScene) : [],
      plannedTargets: plannedTargets(locked)
    },
    provenance: { commit: git('rev-parse', 'HEAD'), sources: [...sources.values()].sort((a, b) => a.path.localeCompare(b.path)) }
  };
}

export async function writeProductionReview(sceneId) {
  requireCondition(/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(sceneId || ''), 'invalid scene ID');
  const relative = `generated/reviews/${sceneId}/index.html`;
  const destination = path.join(projectRoot, relative);
  // Remove the previous generated view before checking the current tree; failed
  // regeneration must not leave a stale page looking like a fresh review.
  try {
    await unlink(destination);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const model = await buildProductionReviewModel(sceneId);
  const html = renderProductionReview(model);
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${process.pid}.tmp`;
  await writeFile(temporary, html, { flag: 'wx' });
  try {
    await rename(temporary, destination);
  } catch (error) {
    await unlink(temporary);
    throw error;
  }
  return { path: relative, sha256: sha256(Buffer.from(html)), model };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    requireCondition(process.argv.length === 4 && process.argv[2] === '--scene',
      'usage: npm run production:review -- --scene COM-01X');
    const result = await writeProductionReview(process.argv[3]);
    console.log(`Review: ${result.path} SHA-256 ${result.sha256}; readiness ${result.model.production.readiness}`);
  } catch (error) {
    console.error(`BLOCKED: ${error.message}`);
    process.exitCode = 1;
  }
}
