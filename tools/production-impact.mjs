import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectRoot } from './content-lib.mjs';
import { projectEntry, sha256, stableStringify } from './render-cg-packets.mjs';

const narrativeRoot = 'content/production/narrative';
const manifestRoot = 'content/production/cg-manifests';
const receiptPath = 'content/assets/ingest-receipts/repo-source-gate3-v1.json';

function requireCondition(condition, reason) {
  if (!condition) throw new Error(reason);
}

function safePath(value) {
  requireCondition(typeof value === 'string' && value.length > 0 && !value.includes('\\') &&
    !value.startsWith('/') && !value.includes('://') &&
    value.split('/').every((part) => part && part !== '.' && part !== '..'),
  `invalid repository path: ${value}`);
  return value;
}

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trimEnd();
}

function version(value) {
  return sha256(typeof value === 'string' ? value : stableStringify(value));
}

async function listWorktreeJson(root, relative) {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const children = await Promise.all(entries.map(async (entry) => {
    const name = path.posix.join(relative, entry.name);
    return entry.isDirectory() ? listWorktreeJson(root, name) : entry.isFile() && name.endsWith('.json') ? [name] : [];
  }));
  return children.flat().sort();
}

export function readerFor(root, ref) {
  const commit = ref === 'WORKTREE' ? null : git(root, 'rev-parse', '--verify', `${ref}^{commit}`);
  const readBytes = async (name) => {
    safePath(name);
    return commit ? execFileSync('git', ['-C', root, 'show', `${commit}:${name}`], { maxBuffer: 64 * 1024 * 1024 }) : readFile(path.join(root, name));
  };
  return {
    label: commit || 'WORKTREE',
    readBytes,
    async text(name) { return (await readBytes(name)).toString('utf8'); },
    async json(name) { return JSON.parse(await this.text(name)); },
    async jsonFiles(relative) {
      safePath(relative);
      if (!commit) return listWorktreeJson(root, relative);
      return git(root, 'ls-tree', '-r', '--name-only', commit, '--', relative)
        .split('\n').filter((name) => name.endsWith('.json')).sort();
    }
  };
}

function lockedNodes(markdown) {
  const script = markdown.match(/^## Locked playable script\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1] || '';
  const nodes = [...script.matchAll(/^### `([a-z0-9_]+)`\s*$/gm)].map((match) => match[1]);
  requireCondition(nodes.length > 0 && new Set(nodes).size === nodes.length, 'Locked Scene has no unique playable nodes');
  return nodes;
}

function withoutDialogue(value) {
  const { text: _text, choices, ...rest } = value;
  return { ...rest, ...(choices && { choices: choices.map(({ text: _choiceText, ...choice }) => choice) }) };
}

function dialogue(value) {
  return { text: value.text, choices: value.choices?.map((choice) => choice.text) || [] };
}

function assetBinding({ manifest, sourceMap, catalog, receipt }, entry) {
  const logicalId = entry.output.logical_asset_id;
  const asset = manifest.assets[logicalId];
  const mapped = asset?.src && sourceMap.files[asset.src];
  const master = mapped?.masterSourceId && catalog.files[mapped.masterSourceId];
  const accepted = receipt.acceptedAssets.find((item) => item.canonicalAssetId === entry.output.canonical_asset_id);
  requireCondition(asset && mapped && master && accepted && accepted.logicalAssetId === logicalId &&
    accepted.sourceId === mapped.masterSourceId && mapped.source === master.sourcePath &&
    mapped.bytes === master.bytes && mapped.sha256 === master.sha256 &&
    accepted.repoPath === master.sourcePath &&
    accepted.bytes === master.bytes && accepted.sha256 === master.sha256,
  `asset binding mismatch: ${logicalId}`);
  return { logicalId, asset, mapped, master, accepted };
}

function acceptedIdentity(binding) {
  if (!binding) return null;
  const { logicalId, asset, mapped, master, accepted, bytesSha256 } = binding;
  return {
    logicalId, canonicalAssetId: asset.canonicalAssetId,
    masterSourceId: mapped.masterSourceId,
    sourcePath: master.sourcePath, sha256: master.sha256, bytes: master.bytes,
    mimeType: master.mimeType, width: master.width, height: master.height,
    accepted, bytesSha256
  };
}

function runtimeIdentity(binding) {
  return binding && { asset: binding.asset, runtime: binding.mapped };
}

export async function snapshotScene(reader, sceneId) {
  requireCondition(/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(sceneId), `invalid scene ID: ${sceneId}`);
  const contracts = await Promise.all((await reader.jsonFiles(narrativeRoot)).map(async (file) =>
    ({ file, value: await reader.json(file) })));
  const found = contracts.filter(({ value }) => value.scene_id === sceneId);
  requireCondition(found.length === 1, `expected one contract for ${sceneId}; found ${found.length}`);
  const contract = found[0].value;
  const locked = await reader.text(contract.source_scene);
  const nodeIds = lockedNodes(locked);
  const manifestFiles = await reader.jsonFiles(manifestRoot);
  const manifests = await Promise.all(manifestFiles.map(async (file) => ({ file, value: await reader.json(file) })));
  const entries = manifests.flatMap(({ file, value }) => (value.entries || [])
    .filter((entry) => entry.scene_id === sceneId)
    .map((entry) => ({ file, entry, manifest: value })));
  requireCondition(entries.every(({ entry }) => entry.status === 'accepted'),
    `${sceneId}: render-ready CG entries have no accepted asset binding; this gate compares accepted Opening entries`);
  const entryById = new Map(entries.map(({ entry }) => [entry.entry_id, entry]));

  const index = await reader.json('content/routes/index.json');
  const matches = [];
  for (const route of index.routes) {
    const config = await reader.json(route.config);
    if (!config.memoryFile) continue;
    const memories = await reader.json(config.memoryFile);
    for (const memory of memories.events || []) {
      if (memory.unlockNodes?.includes(nodeIds[0])) matches.push({ config, memory });
    }
  }
  requireCondition(matches.length === 1, `expected one route/Memory binding for ${sceneId}; found ${matches.length}`);
  const { config, memory } = matches[0];
  const nodes = {};
  for (const file of config.storyFiles) {
    const chapter = await reader.json(file);
    for (const id of nodeIds) if (Object.hasOwn(chapter.nodes || {}, id)) {
      requireCondition(!Object.hasOwn(nodes, id), `duplicate runtime node: ${id}`);
      nodes[id] = chapter.nodes[id];
    }
  }
  requireCondition(Object.keys(nodes).length === nodeIds.length, `${sceneId}: Locked Scene runtime nodes missing`);
  const [manifest, sourceMap, catalog, receipt] = await Promise.all([
    reader.json('content/assets/manifest.json'), reader.json('content/assets/source-map.json'),
    reader.json('content/assets/source-catalog.json'), reader.json(receiptPath)
  ]);
  requireCondition(catalog.provider === 'repo', 'active reference catalog is not repository backed');
  const projectionToolSha256 = sha256(await reader.readBytes('tools/render-cg-packets.mjs'));
  const images = {};
  for (const { entry, manifest: cgManifest } of entries) {
    requireCondition(!images[entry.entry_id], `duplicate CG entry: ${entry.entry_id}`);
    const binding = assetBinding({ manifest, sourceMap, catalog, receipt }, entry);
    const bytes = await reader.readBytes(binding.master.sourcePath);
    requireCondition(bytes.length === binding.master.bytes && sha256(bytes) === binding.master.sha256,
      `accepted WebP bytes differ: ${binding.logicalId}`);
    const references = {};
    for (const attachment of entry.reference_transport.attachments || []) {
      const baseEntry = attachment.role === 'accepted_base' ? entryById.get(attachment.source_id) : null;
      const baseBinding = baseEntry ? assetBinding({ manifest, sourceMap, catalog, receipt }, baseEntry) : null;
      const source = baseBinding?.master || catalog.files[attachment.source_id];
      requireCondition(source && source.sourcePath, `${entry.entry_id}: missing reference ${attachment.source_id}`);
      requireCondition(!baseEntry || baseEntry.output.master_filename === attachment.expected_filename,
        `${entry.entry_id}: accepted base filename mismatch`);
      const referenceBytes = await reader.readBytes(source.sourcePath);
      requireCondition(referenceBytes.length === source.bytes && sha256(referenceBytes) === source.sha256,
        `${entry.entry_id}: reference bytes differ: ${attachment.source_id}`);
      references[attachment.source_id] = {
        binding: attachment,
        source: Object.fromEntries(['name', 'mimeType', 'sourcePath', 'bytes', 'width', 'height',
          'sha256', 'verifiedDecode', 'status'].map((key) => [key, source[key]])),
        bytesSha256: sha256(referenceBytes)
      };
    }
    const projection = projectEntry(cgManifest, entry);
    images[entry.entry_id] = {
      logicalId: binding.logicalId,
      renderSpecSha256: projection.render_spec_sha256,
      manifestSha256: projection.manifest_sha256,
      status: entry.status,
      baseEntryId: entry.reference_transport.accepted_base_asset_id,
      references,
      asset: { ...binding, bytesSha256: sha256(bytes) }
    };
  }
  const ids = new Set(nodeIds);
  const logicalIds = new Set(entries.map(({ entry }) => entry.output.logical_asset_id));
  return {
    sceneId,
    source: reader.label,
    projectionToolSha256,
    paths: { contract: found[0].file, locked: contract.source_scene },
    contract,
    locked,
    nodeIds,
    nodes,
    // A shared Memory may contain following scenes. Fingerprint only this scene's bindings.
    memory: {
      id: memory.id, title: memory.title, summary: memory.summary,
      replayNode: memory.replayNode,
      unlockNodes: memory.unlockNodes.filter((id) => ids.has(id)),
      cover: logicalIds.has(memory.cover?.asset) ? memory.cover : null,
      galleryAssets: memory.galleryAssets.filter((id) => logicalIds.has(id))
    },
    route: {
      id: config.id, story: config.story, allowPreviewArt: config.allowPreviewArt,
      assetIds: config.assetIds.filter((id) => logicalIds.has(id))
    },
    images
  };
}

function event(artifactId, oldVersion, newVersion, reason, affected) {
  return {
    changed_artifact_id: artifactId,
    old_version: oldVersion,
    new_version: newVersion,
    reason,
    would_invalidate: [...new Set(affected)].sort()
  };
}

function hashChange(artifactId, oldHash, newHash, reason, affected) {
  return oldHash === newHash ? null : event(artifactId, oldHash, newHash, reason, affected);
}

function visualDescendants(images, seed) {
  const impacted = new Set([seed]);
  let priorSize;
  do {
    priorSize = impacted.size;
    for (const [id, image] of Object.entries(images)) if (impacted.has(image.baseEntryId)) impacted.add(id);
  } while (impacted.size !== priorSize);
  return [...impacted].sort();
}

function visualArtifacts(images, ids) {
  return ids.flatMap((id) => {
    const logicalId = images[id]?.logicalId;
    return [
      `manifest_review:${id}`, `render_packet:${id}`, `candidate:${id}`,
      ...(logicalId ? [`accepted_asset:${logicalId}`] : [])
    ];
  });
}

function dialogueScope(sceneId) {
  return [`narrative_review:${sceneId}`, `runtime_dialogue:${sceneId}`,
    `integration:${sceneId}`, `playable_review:${sceneId}`];
}

function visualScope(sceneId, images, entryIds) {
  return [...visualArtifacts(images, entryIds), `integration:${sceneId}`, `playable_review:${sceneId}`];
}

// This is an impact plan between versions, never a mutation of a run's PASS/STALE ledger.
export function compareSceneSnapshots(before, after, { noVisualImpactEvidence = null } = {}) {
  requireCondition(before.sceneId === after.sceneId, 'different scene IDs');
  const id = after.sceneId;
  const entries = [...new Set([...Object.keys(before.images), ...Object.keys(after.images)])].sort();
  const allVisual = visualScope(id, after.images, entries);
  const events = [];
  const change = (artifact, oldValue, newValue, reason, scope) => {
    const a = version(oldValue), b = version(newValue);
    if (a !== b) events.push(event(artifact, a, b, reason, scope));
  };
  const contractSemantic = ({ implementation_mapping: _implementation, ...semantic }) => semantic;
  change(`contract:${id}`, before.contract, after.contract, 'narrative_contract_changed',
    [`narrative_review:${id}`, `runtime_state:${id}`, ...allVisual]);
  const contractSemanticChanged = version(contractSemantic(before.contract)) !== version(contractSemantic(after.contract));
  if (events.some((item) => item.changed_artifact_id === `contract:${id}`) && !contractSemanticChanged) {
    events.at(-1).reason = 'implementation_mapping_changed';
    events.at(-1).would_invalidate = [`integration:${id}`, `playable_review:${id}`, `runtime_state:${id}`];
  }

  const lockedOld = version(before.locked), lockedNew = version(after.locked);
  if (lockedOld !== lockedNew) {
    const recognized = noVisualImpactEvidence?.scene_id === id &&
      noVisualImpactEvidence?.old_scene_sha256 === lockedOld &&
      noVisualImpactEvidence?.new_scene_sha256 === lockedNew &&
      noVisualImpactEvidence?.decision === 'no_visual_impact' &&
      noVisualImpactEvidence?.verified_from_persisted_qa === true;
    events.push(event(`locked_scene:${id}`, lockedOld, lockedNew,
      recognized ? 'dialogue_only_qa_confirmed' : 'locked_scene_change_requires_fresh_narrative_qa',
      recognized ? dialogueScope(id) : [...dialogueScope(id), ...allVisual]));
    if (recognized) events.at(-1).evidence = noVisualImpactEvidence.handoff;
  }

  const oldStructure = Object.fromEntries(Object.entries(before.nodes).map(([nodeId, node]) => [nodeId, withoutDialogue(node)]));
  const newStructure = Object.fromEntries(Object.entries(after.nodes).map(([nodeId, node]) => [nodeId, withoutDialogue(node)]));
  const oldDialogue = Object.fromEntries(Object.entries(before.nodes).map(([nodeId, node]) => [nodeId, dialogue(node)]));
  const newDialogue = Object.fromEntries(Object.entries(after.nodes).map(([nodeId, node]) => [nodeId, dialogue(node)]));
  change(`runtime_dialogue:${id}`, oldDialogue, newDialogue, 'dialogue_text_changed', dialogueScope(id));
  change(`runtime_structure:${id}`, { nodes: oldStructure, nodeIds: before.nodeIds },
    { nodes: newStructure, nodeIds: after.nodeIds }, 'runtime_state_or_branch_changed',
    [`narrative_review:${id}`, `runtime_state:${id}`, ...allVisual]);
  change(`route_binding:${id}`, before.route, after.route, 'route_allowlist_or_config_changed',
    [`integration:${id}`, `playable_review:${id}`]);
  change(`memory:${after.memory.id}`, before.memory, after.memory, 'scene_memory_binding_changed',
    [`integration:${id}`, `playable_review:${id}`]);

  for (const entryId of entries) {
    const old = before.images[entryId], current = after.images[entryId];
    const descendants = visualDescendants(after.images, entryId);
    const scope = visualScope(id, after.images, descendants);
    const specChange = hashChange(`cg_manifest_entry:${entryId}`, old?.renderSpecSha256 || null,
      current?.renderSpecSha256 || null, 'entry_render_spec_changed', scope);
    if (specChange) {
      specChange.dependent_entries = descendants.filter((dependent) => dependent !== entryId);
      events.push(specChange);
    }
    change(`cg_status:${entryId}`, old?.status || null, current?.status || null,
      'entry_acceptance_status_changed', [`accepted_asset:${current?.logicalId || old?.logicalId}`, `integration:${id}`, `playable_review:${id}`]);
    change(`reference_bindings:${entryId}`, old?.references || null, current?.references || null,
      'reference_pixels_or_binding_changed', scope);
    change(`accepted_asset_binding:${entryId}`, acceptedIdentity(old?.asset), acceptedIdentity(current?.asset),
      'accepted_asset_bytes_or_mapping_changed',
      [...visualScope(id, after.images, descendants.filter((name) => name !== entryId)),
        `accepted_asset:${current?.logicalId || old?.logicalId}`, `integration:${id}`, `playable_review:${id}`]);
    change(`runtime_asset_binding:${entryId}`, runtimeIdentity(old?.asset), runtimeIdentity(current?.asset),
      'runtime_asset_metadata_or_path_changed', [`integration:${id}`, `playable_review:${id}`]);
  }
  const projectionChange = hashChange('render_projection:tools/render-cg-packets.mjs',
    before.projectionToolSha256, after.projectionToolSha256,
    'renderer_tool_version_changed_requires_review', allVisual);
  if (projectionChange) events.push(projectionChange);
  const wouldInvalidate = [...new Set(events.flatMap((item) => item.would_invalidate))].sort();
  const trackedVisual = visualArtifacts(after.images, Object.keys(after.images));
  const manifestReconciliation = entries.filter((entryId) => {
    const old = before.images[entryId], current = after.images[entryId];
    return old && current && old.manifestSha256 !== current.manifestSha256 &&
      old.renderSpecSha256 === current.renderSpecSha256 &&
      version(old.references) === version(current.references) &&
      version(acceptedIdentity(old.asset)) === version(acceptedIdentity(current.asset)) &&
      old.status === current.status;
  }).map((entryId) => ({
    entry_id: entryId,
    old_manifest_sha256: before.images[entryId].manifestSha256,
    new_manifest_sha256: after.images[entryId].manifestSha256,
    render_spec_sha256: after.images[entryId].renderSpecSha256,
    action: 'RECONCILE_WITH_RECORDED_RUN_PROVENANCE'
  }));
  return {
    schema_version: '1.0.0',
    kind: 'READ_ONLY_VERSION_IMPACT',
    scene_id: id,
    from: before.source,
    to: after.source,
    qa_status: 'UNKNOWN_NO_RUN_LEDGER',
    ledger_mutated: false,
    changes: events,
    accepted_base_edges: Object.entries(after.images)
      .filter(([, image]) => image.baseEntryId)
      .map(([entryId, image]) => ({ from: image.baseEntryId, to: entryId })).sort((a, b) => a.to.localeCompare(b.to)),
    manifest_reconciliation_required: manifestReconciliation,
    would_invalidate: wouldInvalidate,
    visual_artifacts_not_impacted_by_diff: trackedVisual.filter((artifact) => !wouldInvalidate.includes(artifact)).sort()
  };
}

async function verifiedQaEvidence(reader, handoffPath, before, after) {
  requireCondition(reader.label !== 'WORKTREE', 'QA decision requires a committed target ref');
  requireCondition(/^content\/production\/runs\/[^/]+\/[^/]+\.handoff\.json$/.test(handoffPath),
    'QA handoff must be under a production run');
  const handoff = await reader.json(handoffPath);
  const runId = handoffPath.split('/')[3];
  const ledger = await reader.json(`content/production/runs/${runId}/ledger.json`);
  const task = ledger.tasks?.find((item) => item.task_id === handoff.task_id);
  const decision = handoff.invalidation_decision;
  requireCondition(ledger.run_id === runId && handoff.run_id === runId && task?.status === 'PASS' &&
    task.handoff === handoffPath && handoff.status === 'PASS' &&
    handoff.harness?.id === 'content_qa' && handoff.harness?.pass === 'narrative_review' &&
    handoff.qa?.checks?.some((check) => check.name === 'no_visual_impact' && check.result === 'PASS') &&
    decision?.decision === 'no_visual_impact' && decision.scene_id === before.sceneId &&
    decision.old_scene_sha256 === version(before.locked) && decision.new_scene_sha256 === version(after.locked),
  'missing or mismatched persisted Narrative QA no_visual_impact decision');
  return { ...decision, verified_from_persisted_qa: true, handoff: handoffPath };
}

export async function buildProductionImpact({ sceneId, from = 'HEAD', to = 'WORKTREE', qaHandoff = null, root = projectRoot }) {
  const previous = await snapshotScene(readerFor(root, from), sceneId);
  const targetReader = readerFor(root, to);
  const current = await snapshotScene(targetReader, sceneId);
  const evidence = qaHandoff ? await verifiedQaEvidence(targetReader, qaHandoff, previous, current) : null;
  return compareSceneSnapshots(previous, current, { noVisualImpactEvidence: evidence });
}

export async function writeProductionImpact(options) {
  const { sceneId, root = projectRoot } = options;
  const destination = path.join(root, `generated/session-cache/impact/${sceneId}/impact.json`);
  await rm(destination, { force: true });
  const impact = await buildProductionImpact(options);
  const data = `${JSON.stringify(impact, null, 2)}\n`;
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${process.pid}.tmp`;
  await writeFile(temporary, data, { flag: 'wx' });
  try { await rename(temporary, destination); } catch (error) { await rm(temporary, { force: true }); throw error; }
  return { path: path.relative(root, destination), sha256: sha256(data), impact };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    requireCondition(args.length % 2 === 0 && args.every((_, index) => index % 2 === 1 ||
      ['--scene', '--from', '--to', '--qa-handoff'].includes(args[index])),
    'usage: npm run production:impact -- --scene COM-01X --from HEAD --to WORKTREE [--qa-handoff path]');
    const options = Object.fromEntries(Array.from({ length: args.length / 2 }, (_, index) =>
      [args[2 * index].slice(2).replaceAll('-', ''), args[2 * index + 1]]));
    requireCondition(options.scene && args.filter((arg) => arg === '--scene').length === 1 &&
      new Set(args.filter((_, index) => index % 2 === 0)).size === args.length / 2 &&
      options.from !== 'WORKTREE' && options.from !== '' && options.to !== '', 'invalid arguments');
    const result = await writeProductionImpact({ sceneId: options.scene,
      ...(options.from && { from: options.from }), ...(options.to && { to: options.to }),
      ...(options.qahandoff && { qaHandoff: options.qahandoff }) });
    console.log(`Impact: ${result.path} SHA-256 ${result.sha256}; ${result.impact.changes.length} changed artifact(s); QA ${result.impact.qa_status}`);
  } catch (error) {
    console.error(`BLOCKED: ${error.message}`);
    process.exitCode = 1;
  }
}
