import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdir, readFile, mkdir, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAndValidate, projectRoot } from './content-lib.mjs';
import { validateProductionContracts } from './validate-production-contracts.mjs';
import { verifyProductionRun } from './verify-production-run.mjs';
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
async function committedBytes(relative, sources) {
  requireCondition(typeof relative === 'string' && !relative.includes('\\') &&
    !relative.startsWith('/') && !relative.includes('://') &&
    relative.split('/').every((part) => part && part !== '.' && part !== '..'),
  `invalid review source path: ${relative}`);
  const bytes = await readFile(path.join(projectRoot, relative));
  const actualBlob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  const expectedBlob = git('rev-parse', `HEAD:${relative}`);
  requireCondition(actualBlob === expectedBlob, `review source differs from committed HEAD: ${relative}`);
  if (!sources.has(relative)) sources.set(relative, { path: relative, sha256: sha256(bytes) });
  return bytes;
}

async function committedSource(relative, sources) {
  return (await committedBytes(relative, sources)).toString('utf8');
}

async function committedJson(relative, sources) {
  return JSON.parse(await committedSource(relative, sources));
}

// Classify runs from HEAD so an unrelated in-progress ledger does not contaminate
// the review. Only the selected evidence is read from (and checked against) disk.
function headJson(relative) {
  return JSON.parse(git('show', `HEAD:${relative}`));
}

function staleReviewInputs(error, kind) {
  return error.message === `reviewed ${kind} inputs differ from current committed content`;
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

async function narrativeQaEvidence(sceneId, sources) {
  const root = 'content/production/runs';
  let directories;
  try { directories = await readdir(path.join(projectRoot, root), { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  const relevant = [];
  for (const directory of directories.filter((entry) => entry.isDirectory())) {
    const runId = directory.name;
    const ledgerPath = `${root}/${runId}/ledger.json`;
    let ledger;
    try { ledger = headJson(ledgerPath); }
    catch (error) { throw new Error(`cannot classify production run ${runId}: ${error.message}`); }
    requireCondition(Array.isArray(ledger.tasks), `cannot classify production run ${runId}: missing tasks`);
    // The run verifier supports one bounded task. Multi-stage ledgers cannot be
    // promoted to QA evidence until their individual tasks are independently verified.
    if (ledger.tasks.length === 1 && ledger.tasks[0]?.scene_id === sceneId &&
      ledger.tasks[0]?.task_type === 'narrative_review') {
      relevant.push({ runId, ledgerPath });
    }
  }
  if (!relevant.length) return null;
  const current = [];
  const stale = [];
  for (const { runId, ledgerPath } of relevant) {
    const ledger = await committedJson(ledgerPath, sources);
    let verified;
    try { verified = await verifyProductionRun(runId); }
    catch (error) {
      if (staleReviewInputs(error, 'narrative')) { stale.push(runId); continue; }
      throw error; // A malformed or forged decision must block, not disappear.
    }
    if (verified.task_status === 'CURRENT_PASS') current.push({ runId, task: ledger.tasks[0], verified });
    else stale.push(runId);
  }
  requireCondition(current.length <= 1,
    `ambiguous current Narrative QA evidence for ${sceneId}: ${current.map(({ runId }) => runId).join(', ')}`);
  if (!current.length) return stale.length ? { status: 'REVIEW_REQUIRED' } : null;
  const { runId, task, verified } = current[0];
  const result = {
    status: 'PASS_CURRENT',
    runId, taskId: task.task_id, sourceRef: verified.source_ref,
    packetSha256: verified.packet_sha256,
    inputVersions: task.input_versions.map(({ id, version }) => ({ id, version })),
    outputVersions: task.output_versions.map(({ id, version }) => ({ id, version })),
    qaCodes: verified.qa_codes || [], receiptPath: task.decision_receipt
  };
  const receipt = await committedJson(task.decision_receipt, sources);
  result.receiptSha256 = sources.get(task.decision_receipt).sha256;
  result.inputDigestSha256 = receipt.input_digest_sha256;
  return result;
}

async function candidateVisualQaEvidence(sceneId, visuals, sources) {
  const root = 'content/production/runs';
  let directories;
  try { directories = await readdir(path.join(projectRoot, root), { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const evidence = [];
  const seenEntries = new Set();
  for (const directory of directories.filter((entry) => entry.isDirectory())) {
    const runId = directory.name;
    const ledgerPath = `${root}/${runId}/ledger.json`;
    const ledger = headJson(ledgerPath);
    requireCondition(Array.isArray(ledger.tasks), `cannot classify production run ${runId}: missing tasks`);
    const matching = ledger.tasks.filter((task) => task?.scene_id === sceneId &&
      task?.task_type === 'visual_review' && task?.review_scope === 'candidate');
    for (const task of matching) {
      // A multi-task ledger has no task-level verification by this verifier.
      if (ledger.tasks.length !== 1) continue;
      await committedJson(ledgerPath, sources);
      requireCondition(!seenEntries.has(task.entry_id), `ambiguous candidate Visual QA for ${task.entry_id}`);
      let verified;
      try { verified = await verifyProductionRun(runId); }
      catch (error) {
        // Candidate packets include upstream narrative QA; either input drift
        // invalidates the candidate decision for the current scene.
        if (staleReviewInputs(error, 'candidate') || staleReviewInputs(error, 'narrative')) continue;
        throw error;
      }
      seenEntries.add(task.entry_id);
      requireCondition(verified.task_status === 'CURRENT_FAIL',
        `${runId}: candidate Visual QA does not have a current verified failure`);
      const visual = visuals.find((item) => item.entryId === task.entry_id);
      requireCondition(visual && task.output_versions?.length === 1 &&
        task.output_versions[0].location === visual.repoPath,
      `${runId}: candidate Visual QA does not identify the scene's current WebP`);
      const receipt = await committedJson(task.decision_receipt, sources);
      evidence.push({ status: 'CURRENT_FAIL', entryId: task.entry_id, runId,
        taskId: task.task_id, sourceRef: verified.source_ref, packetSha256: verified.packet_sha256,
        receiptPath: task.decision_receipt, receiptSha256: sources.get(task.decision_receipt).sha256,
        inputDigestSha256: receipt.input_digest_sha256, candidatePath: visual.repoPath,
        qaCodes: verified.qa_codes, knownIssues: receipt.known_issues });
    }
  }
  return evidence.sort((a, b) => a.entryId.localeCompare(b.entryId));
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
  const allEntries = manifests.flatMap(({ file, value }) =>
    (value.entries || []).map((entry) => ({ file, entry })));
  let entries = allEntries.filter(({ entry }) => entry.scene_id === sceneId);
  if (entries.some(({ file, entry }) => file === 'content/production/cg-manifests/title-screen.json' &&
      entry.entry_id === 'TITLE-17F-DOORLIGHT-01')) {
    // Historical review fixtures predate this helper. Load it only when the exact
    // title entry exists, and verify independence before omitting any scene data.
    const { isIndependentTitleArtwork } = await import('./production-impact.mjs');
    const reader = {
      json: (file) => committedJson(file, sources),
      readBytes: (file) => committedBytes(file, sources)
    };
    const manifest = await committedJson('content/assets/manifest.json', sources);
    const sceneEntries = [];
    for (const candidate of entries) {
      if (!await isIndependentTitleArtwork(reader, candidate, manifest, {}, {}, {}, allEntries)) {
        sceneEntries.push(candidate);
      }
    }
    entries = sceneEntries;
  }
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
    if (entry.status === 'accepted') {
      requireCondition(asset?.kind === 'cg' && route?.config.assetIds.includes(id),
        `${entry.entry_id}: accepted CG is not in the bound route asset allowlist`);
      requireCondition(binding && source && accepted && binding.source === source.sourcePath &&
        accepted.logicalAssetId === id && accepted.sourceId === binding.masterSourceId &&
        accepted.repoPath === source.sourcePath,
      `${entry.entry_id}: accepted CG receipt/catalog/runtime binding differs`);
      const bytes = await readFile(path.join(projectRoot, source.sourcePath));
      requireCondition(bytes.length > 0 &&
        source.mimeType === 'image/webp', `${entry.entry_id}: accepted thumbnail bytes differ`);
      thumbnailDataUrl = `data:image/webp;base64,${bytes.toString('base64')}`;
    }
    visuals.push({
      entryId: entry.entry_id, kind: entry.cg_class, status: entry.status, logicalId: id,
      repoPath, ref: 'WORKTREE', thumbnailDataUrl,
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
  const narrativeQa = await narrativeQaEvidence(sceneId, sources);
  const candidateVisualQa = await candidateVisualQaEvidence(sceneId, visuals, sources);
  return {
    scene: {
      id: sceneId, title, purpose: contract.scene_function,
      entry_state: contract.entry_state, exit_state: contract.exit_state,
      source_scene: contract.source_scene
    },
    choices,
    visuals,
    production: {
      readiness: 'NOT_READY', narrativeQa: narrativeQa?.status || 'UNRECORDED', manifestStatus,
      visualQa: candidateVisualQa.length ? 'CURRENT_FAIL' : 'UNRECORDED', integrationStatus,
      staleStatus: candidateVisualQa.length ? 'CANDIDATE_VISUAL_QA_CURRENT_FAIL_OTHER_GATES_UNKNOWN' :
        narrativeQa?.status === 'PASS_CURRENT' ? 'NARRATIVE_QA_CURRENT_OTHER_GATES_UNKNOWN' :
        narrativeQa ? 'NARRATIVE_QA_REVIEW_REQUIRED' : 'UNKNOWN_NO_RUN_LEDGER',
      validator: 'PASS_CURRENT_TREE',
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
    provenance: { commit: git('rev-parse', 'HEAD'), narrativeQa, candidateVisualQa,
      sources: [...sources.values()].sort((a, b) => a.path.localeCompare(b.path)) }
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
