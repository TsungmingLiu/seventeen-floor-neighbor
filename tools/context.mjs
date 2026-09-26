import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile, link, unlink } from 'node:fs/promises';
import path from 'node:path';
import { loadAndValidate, projectRoot } from './content-lib.mjs';

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function outgoing(node, route) {
  const poolEntries = node.type === 'random'
    ? route.sceneLibrary.pools?.[node.pool]?.entries?.map((entry) => entry.entryNode) || []
    : [];
  return [
    node.next,
    ...(node.choices || []).map((choice) => choice.next),
    node.default,
    ...(node.cases || []).map((branch) => branch.next),
    node.after,
    ...poolEntries
  ].filter(Boolean);
}

function assetIds(node) {
  if (!node?.visual) return [];
  return [node.visual.asset, node.visual.background, ...(node.visual.sprites || []).map((sprite) => sprite.asset)].filter(Boolean);
}

if (argument('task') || argument('verify-packet')) {
  const { buildNarrativeReviewPacket, verifyNarrativeReviewPacket } = await import('./context-packet.mjs');
  try {
    if (argument('verify-packet')) {
      const packet = JSON.parse(await readFile(path.resolve(argument('verify-packet')), 'utf8'));
      await verifyNarrativeReviewPacket(packet);
      console.log(`PASS: ${packet.task_id} sources, bindings and hashes match the committed canon`);
    } else {
      if (argument('task') !== 'narrative_review') throw new Error('Only narrative_review Task Packet generation is supported');
      const packet = await buildNarrativeReviewPacket({
        sceneId: argument('scene'), runId: argument('run-id'), taskId: argument('task-id')
      });
      const relative = `generated/session-cache/${packet.run_id}/${packet.task_id}.packet.json`;
      const destination = path.join(projectRoot, relative);
      const body = `${JSON.stringify(packet, null, 2)}\n`;
      await mkdir(path.dirname(destination), { recursive: true });
      const temporary = `${destination}.${process.pid}.tmp`;
      await writeFile(temporary, body, { flag: 'wx' });
      try {
        try {
          await link(temporary, destination);
        } catch (error) {
          if (error.code !== 'EEXIST' || await readFile(destination, 'utf8') !== body) {
            throw new Error(`Task Packet destination conflict: ${relative}`);
          }
        }
      } finally {
        await unlink(temporary);
      }
      console.log(`Packet: ${relative} SHA-256 ${createHash('sha256').update(body).digest('hex')}`);
    }
    process.exit(0);
  } catch (error) {
    console.error(`BLOCKED: ${error.message}`);
    process.exit(1);
  }
}

const routeId = argument('route');
const nodeId = argument('node');
const content = await loadAndValidate();
const route = content.routes.find((candidate) => candidate.config.id === routeId);

if (!route) {
  console.error(`Unknown or missing --route. Available: ${content.routes.map((candidate) => candidate.config.id).join(', ')}`);
  process.exit(1);
}

const context = await readFile(path.join(projectRoot, route.config.context), 'utf8');
const nodes = route.chapter.nodes;
const selected = nodeId ? nodes[nodeId] : null;
if (nodeId && !selected) {
  console.error(`Unknown node ${nodeId}. Route ${routeId} has ${Object.keys(nodes).length} nodes.`);
  process.exit(1);
}

const incoming = nodeId
  ? Object.entries(nodes).filter(([, node]) => outgoing(node, route).includes(nodeId)).map(([id]) => id)
  : [];
const adjacentIds = selected ? [...new Set([...incoming, ...outgoing(selected, route)])] : [];
const adjacent = Object.fromEntries(adjacentIds.map((id) => [id, nodes[id]]));
const usedAssets = [...new Set([
  ...assetIds(selected),
  ...Object.values(adjacent).flatMap(assetIds)
])];
const assets = Object.fromEntries(usedAssets.map((id) => [id, content.manifest.assets[id]]));
const recipes = content.recipes.recipes.filter((recipe) => usedAssets.includes(recipe.outputAsset));
const characterIds = new Set();
for (const asset of Object.values(assets)) {
  if (asset?.character) characterIds.add(asset.character);
  for (const participant of asset?.participants || []) characterIds.add(participant.character);
}
const characters = Object.fromEntries([...characterIds].map((id) => [id, content.characters[id]]));

console.log(`# Route context: ${route.config.label}`);
console.log(`\n- Route ID: \`${route.config.id}\``);
console.log(`- Nodes: ${Object.keys(nodes).length}`);
console.log(`- Story files: ${route.config.storyFiles.map((file) => `\`${file}\``).join(', ')}`);
console.log(`- Scene files: ${route.config.sceneFiles.map((file) => `\`${file}\``).join(', ') || 'none'}`);
console.log(`\n${context.trim()}`);

if (selected) {
  console.log(`\n## Target node: ${nodeId}`);
  console.log(`\nIncoming: ${incoming.length ? incoming.map((id) => `\`${id}\``).join(', ') : 'none'}`);
  console.log(`\nOutgoing: ${outgoing(selected, route).length ? outgoing(selected, route).map((id) => `\`${id}\``).join(', ') : 'none'}`);
  console.log(`\n\`\`\`json\n${JSON.stringify(selected, null, 2)}\n\`\`\``);
  console.log(`\n## Adjacent nodes\n\n\`\`\`json\n${JSON.stringify(adjacent, null, 2)}\n\`\`\``);
  console.log(`\n## Referenced assets\n\n\`\`\`json\n${JSON.stringify(assets, null, 2)}\n\`\`\``);
  console.log(`\n## Relevant recipes\n\n\`\`\`json\n${JSON.stringify(recipes, null, 2)}\n\`\`\``);
  console.log(`\n## Relevant characters\n\n\`\`\`json\n${JSON.stringify(characters, null, 2)}\n\`\`\``);
}
