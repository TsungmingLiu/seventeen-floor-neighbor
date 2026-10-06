import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { projectRoot } from './content-lib.mjs';
import { projectEntry, sha256, stableStringify, imageMagic } from './render-cg-packets.mjs';
import { verifyProductionRun, versionIdentity, narrativeReviewContentIdentities } from './verify-production-run.mjs';
import { buildManifestUsabilityPacket, buildNarrativeReviewPacket } from './context-packet.mjs';

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

function assetBinding({ manifest, sourceMap, catalog, acceptedAssets }, entry) {
  const logicalId = entry.output.logical_asset_id;
  const asset = manifest.assets[logicalId];
  const mapped = asset?.src && sourceMap.files[asset.src];
  const master = mapped?.masterSourceId && catalog.files[mapped.masterSourceId];
  const matches = acceptedAssets.filter((item) => item.canonicalAssetId === entry.output.canonical_asset_id);
  const accepted = matches[0];
  requireCondition(matches.length === 1 && asset && mapped && master && accepted &&
    asset.canonicalAssetId === entry.output.canonical_asset_id && accepted.logicalAssetId === logicalId &&
    accepted.sourceId === mapped.masterSourceId && accepted.repoPath === master.sourcePath &&
    mapped.source === (accepted.derivativePath || master.sourcePath) &&
    (!accepted.runtimePath || asset.src === accepted.runtimePath),
  `asset binding mismatch: ${logicalId}`);
  return { logicalId, asset, mapped, master, accepted };
}

// Read the existing receipt formats without inventing a QA PASS or a new ledger.
async function acceptedAssetReceipts(reader, sceneId) {
  const legacy = await reader.json(receiptPath);
  const acceptedAssets = [...legacy.acceptedAssets];
  for (const file of await reader.jsonFiles('content/assets/ingest-receipts')) {
    if (file === receiptPath) continue;
    const receipt = await reader.json(file);
    if (receipt.sceneId !== sceneId || !['human-accepted-master-batch', 'human-adopted-master-batch'].includes(receipt.receiptType)) continue;
    requireCondition(receipt.receiptVersion === 1 && receipt.humanDecision?.disposition === 'ACCEPTED_AS_IS' &&
      (receipt.humanDecision.decision === 'PASS' || receipt.humanDecision.status === 'HUMAN_ACCEPTED_AS_IS') &&
      Array.isArray(receipt.assets), `invalid accepted-master receipt: ${file}`);
    const decisionPath = receipt.humanDecision.path;
    requireCondition([
      'content/production/runs/com02x-cg-20260930/HUMAN-COM02X-MASTER-001.decision.json',
      'content/production/runs/com02x-cg-20260930/HUMAN-COM02X-MASTER-002.decision.json',
      'content/production/runs/com02x-visual-bindings-20261001/HUMAN-COM02X-WALK-ADOPTION-003.decision.json'
    ].includes(decisionPath), `unsupported accepted-master decision binding: ${file}`);
    const decisionBytes = await reader.readBytes(decisionPath);
    requireCondition(sha256(decisionBytes) === receipt.humanDecision.sha256,
      `accepted-master Human decision hash mismatch: ${file}`);
    const decision = JSON.parse(decisionBytes.toString('utf8'));
    requireCondition(decision.scene_id === sceneId &&
      ((decision.decision === 'PASS' && decision.gate === 'accepted_master_image_selection' &&
        decision.decision_id === receipt.humanDecision.id) ||
       (decision.status === 'HUMAN_ACCEPTED_AS_IS' && decision.task_id === receipt.humanDecision.id)),
      `accepted-master Human decision identity mismatch: ${file}`);
    for (const item of receipt.assets) {
      requireCondition(item.humanDisposition === 'ACCEPTED_AS_IS' &&
        item.derivativePath,
      `incomplete accepted-master receipt: ${file}`);
      const exactSelection = decision.accepted_assets?.find((selection) => selection.entry_id === item.entryId);
      const adoptedOutput = decision.output_versions?.find((output) => output.id === `accepted-master:${item.entryId}:v3`);
      requireCondition(exactSelection ? exactSelection.filename === item.filename && exactSelection.width === item.width &&
        exactSelection.height === item.height && exactSelection.visual_qa_status === item.visualQaStatus &&
        exactSelection.human_disposition === item.humanDisposition : [item.masterPath || item.repoPath, `candidate:${item.entryId}:v3`].includes(adoptedOutput?.location),
      `accepted-master exact Human selection mismatch: ${file}`);
      acceptedAssets.push({ ...item, receiptPath: file, humanDecision: receipt.humanDecision, canonicalAssetId: item.canonicalId,
        logicalAssetId: item.logicalId, repoPath: item.masterPath });
    }
  }
  return acceptedAssets;
}

function containsIdentity(value, identities) {
  if (typeof value === 'string') return identities.has(value);
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, item]) => identities.has(key) || containsIdentity(item, identities));
}

// This exact supporting reference has no runtime acceptance. Never filter all render-ready entries.
async function isSupportingEnvironmentReference(reader, candidate, manifest, config, nodes, memory, allEntries) {
  const { file, entry } = candidate;
  if (file !== 'content/production/cg-manifests/opening-ch1-com02x-environment.json' ||
    entry.entry_id !== 'COM02X-ENV-CONVENIENCE-NIGHT-REFERENCE' || entry.scene_id !== 'COM-02X' ||
    entry.status !== 'render_ready' || entry.output?.logical_asset_id !== 'ref.com02x.convenience-night.environment' ||
    entry.output?.canonical_asset_id !== 'BG-CONVENIENCE-NIGHT-REFERENCE') return false;
  const identities = new Set([entry.output.logical_asset_id, entry.output.canonical_asset_id, entry.entry_id]);
  const receipt = await reader.json('content/assets/ingest-receipts/com02x-environment-reference-v1.json');
  return receipt.receiptType === 'supporting-environment-reference-source' &&
    receipt.sourceId === 'ref.com02x.environment.convenience_night' &&
    receipt.acceptanceScope === 'supporting_environment_reference_only' &&
    receipt.runtimeMasterAcceptance === 'NOT_ACCEPTED' &&
    !allEntries.some(({ entry: other }) => other.reference_transport?.accepted_base_asset_id === entry.entry_id ||
      other.reference_transport?.attachments?.some((binding) => binding.role === 'accepted_base' && identities.has(binding.source_id))) &&
    !containsIdentity(manifest, identities) && !containsIdentity(config, identities) &&
    !containsIdentity(nodes, identities) && !containsIdentity(memory, identities);
}

// This exact independent title artwork never participates in playable scene invalidation.
// The exclusion is fail-closed for every story, Memory, Gallery and accepted-base binding.
export async function isIndependentTitleArtwork(reader, candidate, manifest, config, nodes, memory, allEntries) {
  const { file, entry } = candidate;
  if (file !== 'content/production/cg-manifests/title-screen.json' ||
      entry.entry_id !== 'TITLE-17F-DOORLIGHT-01' || entry.scene_id !== 'COM-00' ||
      entry.cg_class !== 'background_cg' ||
      entry.output?.logical_asset_id !== 'bg.opening.title.17f_doorlight' ||
      entry.output?.canonical_asset_id !== 'BG-TITLE-17F-DOORLIGHT-01' ||
      !['render_ready', 'accepted'].includes(entry.status)) return false;
  const id = entry.output.logical_asset_id;
  const identities = new Set([id, entry.output.canonical_asset_id, entry.entry_id, 'source.opening.title.17f_doorlight.master']);
  requireCondition(!allEntries.some(({ entry: other }) =>
    identities.has(other.reference_transport?.accepted_base_asset_id) ||
    other.reference_transport?.attachments?.some((binding) => binding.role === 'accepted_base' && identities.has(binding.source_id))),
  'independent title artwork cannot be an accepted base');
  const index = await reader.json('content/routes/index.json');
  for (const route of index.routes) {
    const routeConfig = await reader.json(route.config);
    const { assetIds, story, ...rest } = routeConfig;
    const { initialTitleArt, ...chapter } = story || {};
    requireCondition(!containsIdentity(rest, identities) && !containsIdentity(chapter, identities),
      'independent title artwork cannot bind chapter cards or endings');
    requireCondition(!identities.has(initialTitleArt) || initialTitleArt === id, 'initial title binding must use logical asset ID');
    if (initialTitleArt === id) requireCondition(assetIds?.includes(id), 'initial title artwork is not allowlisted');
    for (const location of [...(routeConfig.storyFiles || []), ...(routeConfig.sceneFiles || []), ...(routeConfig.memoryFile ? [routeConfig.memoryFile] : [])]) {
      requireCondition(!containsIdentity(await reader.json(location), identities), 'independent title artwork cannot bind story or Memory/Gallery');
    }
  }
  const asset = manifest.assets?.[id];
  if (entry.status === 'render_ready') {
    requireCondition(!asset, 'unadopted title artwork has runtime registration');
    return true;
  }
  requireCondition(asset?.kind === 'background' && !asset.gallery && !asset.previewOnly,
    'independent title artwork must remain a production background without Gallery');
  const receipt = await reader.json('content/assets/ingest-receipts/title-master-native-v1.json');
  const item = receipt.assets?.[0];
  requireCondition(receipt.receiptVersion === 1 && receipt.receiptType === 'human-adopted-title-master' &&
    receipt.assets.length === 1 && receipt.sceneId === 'COM-00' &&
    receipt.humanDecision?.path === 'content/production/runs/title-key-visual-20261002/HUMAN-TITLE-MASTER-001.decision.json' &&
    receipt.humanDecision.disposition === 'ACCEPTED_AS_IS' && receipt.humanDecision.qaHistoryPreserved === true,
  'invalid title adoption receipt');
  const humanBytes = await reader.readBytes(receipt.humanDecision.path);
  const human = JSON.parse(humanBytes.toString('utf8'));
  requireCondition(sha256(humanBytes) === receipt.humanDecision.sha256 &&
    human.status === 'HUMAN_ACCEPTED_AS_IS' && human.task_id === receipt.humanDecision.id &&
    human.run_id === receipt.runId && human.scene_id === receipt.sceneId &&
    human.output_versions?.some((v) => v.id === 'TITLE-17F-DOORLIGHT-01-selected-master' && v.location === item.masterPath),
  'title Human master identity mismatch');
  const qaBytes = await reader.readBytes(receipt.visualQa.path);
  requireCondition(receipt.visualQa.path === 'content/production/runs/title-key-visual-20261002/VQA-TITLE-17F-001.decision.json' &&
    sha256(qaBytes) === receipt.visualQa.sha256 && JSON.parse(qaBytes.toString('utf8')).status === 'NEEDS_REVIEW' &&
    receipt.visualQa.status === 'NEEDS_REVIEW' && item.visualQaStatus === 'NEEDS_REVIEW', 'title QA history mismatch');
  const binding = assetBinding({ manifest, sourceMap: await reader.json('content/assets/source-map.json'),
    catalog: await reader.json('content/assets/source-catalog.json'), acceptedAssets: [{ ...item,
      canonicalAssetId: item.canonicalId, logicalAssetId: item.logicalId, repoPath: item.masterPath }] }, entry);
  for (const location of [binding.master.sourcePath, binding.mapped.source]) {
    const actual = await reader.readBytes(location);
    requireCondition(actual.length > 0 && imageMagic(actual), 'empty title master/derivative');
  }
  requireCondition(asset.focus?.x === 50 && asset.focus?.y === 40 &&
    receipt.renderProvenance?.originalGenerationRef === 'a4e6e1b6e89c3d6dc180755842343230398e3403' &&
    receipt.renderProvenance.originalGenerationManifestSha256 === '3ac8f4d3e48a9a6b8c0a32b2c1c66dabb16323ce59c4accd2517396a965ce196',
  'title framing/generation provenance mismatch');
  return true;
}

function imageMetadata(value) {
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !/sha256|bytes/i.test(key)));
}

function acceptedIdentity(binding) {
  if (!binding) return null;
  const { logicalId, asset, mapped, master, accepted } = binding;
  return {
    logicalId, canonicalAssetId: asset.canonicalAssetId,
    masterSourceId: mapped.masterSourceId,
    sourcePath: master.sourcePath,
    mimeType: master.mimeType, width: master.width, height: master.height,
    accepted: imageMetadata(accepted)
  };
}

function runtimeIdentity(binding) {
  return binding && { asset: imageMetadata(binding.asset), runtime: imageMetadata(binding.mapped) };
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
  const allEntries = manifests.flatMap(({ file, value }) => (value.entries || [])
    .map((entry) => ({ file, entry, manifest: value })));
  const sceneEntries = allEntries.filter(({ entry }) => entry.scene_id === sceneId);

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
  const [manifest, sourceMap, catalog, acceptedAssets] = await Promise.all([
    reader.json('content/assets/manifest.json'), reader.json('content/assets/source-map.json'),
    reader.json('content/assets/source-catalog.json'), acceptedAssetReceipts(reader, sceneId)
  ]);
  const entries = [];
  const excludedReferenceEntries = [];
  for (const candidate of sceneEntries) {
    if (await isSupportingEnvironmentReference(reader, candidate, manifest, config, nodes, memory, allEntries) ||
        await isIndependentTitleArtwork(reader, candidate, manifest, config, nodes, memory, allEntries)) {
      excludedReferenceEntries.push(candidate.entry.entry_id);
    } else {
      requireCondition(candidate.entry.status === 'accepted',
        `${sceneId}: runtime CG entry has no accepted asset binding: ${candidate.entry.entry_id}`);
      entries.push(candidate);
    }
  }
  requireCondition(entries.length > 0, `${sceneId}: no accepted runtime CG entries`);
  const entryById = new Map(entries.map(({ entry }) => [entry.entry_id, entry]));
  requireCondition(catalog.provider === 'repo', 'active reference catalog is not repository backed');
  const projectionToolSha256 = sha256(await reader.readBytes('tools/render-cg-packets.mjs'));
  const images = {};
  for (const { entry, manifest: cgManifest } of entries) {
    requireCondition(!images[entry.entry_id], `duplicate CG entry: ${entry.entry_id}`);
    const binding = assetBinding({ manifest, sourceMap, catalog, acceptedAssets }, entry);
    const bytes = await reader.readBytes(binding.master.sourcePath);
    requireCondition(bytes.length > 0 && imageMagic(bytes) === binding.master.mimeType,
      `accepted WebP bytes differ: ${binding.logicalId}`);
    const derivativeBytes = await reader.readBytes(binding.mapped.source);
    requireCondition(derivativeBytes.length > 0 && imageMagic(derivativeBytes),
      `runtime derivative bytes differ: ${binding.logicalId}`);
    const references = {};
    for (const attachment of entry.reference_transport.attachments || []) {
      const baseEntry = attachment.role === 'accepted_base' ? entryById.get(attachment.source_id) : null;
      const baseBinding = baseEntry ? assetBinding({ manifest, sourceMap, catalog, acceptedAssets }, baseEntry) : null;
      const source = baseBinding?.master || catalog.files[attachment.source_id];
      requireCondition(source && source.sourcePath, `${entry.entry_id}: missing reference ${attachment.source_id}`);
      requireCondition(baseEntry ? baseEntry.output.master_filename === attachment.expected_filename : source.name === attachment.expected_filename,
        `${entry.entry_id}: accepted base filename mismatch`);
      const referenceBytes = await reader.readBytes(source.sourcePath);
      requireCondition(referenceBytes.length > 0 && imageMagic(referenceBytes) === source.mimeType,
        `${entry.entry_id}: reference bytes differ: ${attachment.source_id}`);
      references[attachment.source_id] = {
        binding: attachment,
        source: Object.fromEntries(['name', 'mimeType', 'sourcePath', 'width', 'height', 'verifiedDecode', 'status'].map((key) => [key, source[key]]))
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
      asset: binding
    };
  }
  const ids = new Set(nodeIds);
  const logicalIds = new Set(entries.map(({ entry }) => entry.output.logical_asset_id));
  const sceneRouteStory = { ...config.story };
  if (sceneRouteStory.initialTitleArt === 'bg.opening.title.17f_doorlight') {
    const title = allEntries.find((candidate) => candidate.file === 'content/production/cg-manifests/title-screen.json' && candidate.entry.entry_id === 'TITLE-17F-DOORLIGHT-01');
    requireCondition(title && await isIndependentTitleArtwork(reader, title, manifest, config, nodes, memory, allEntries), 'invalid independent initial title binding');
    delete sceneRouteStory.initialTitleArt;
  }
  return {
    sceneId,
    excludedReferenceEntries,
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
      id: config.id, story: sceneRouteStory, allowPreviewArt: config.allowPreviewArt,
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
    if (recognized) events.at(-1).evidence = noVisualImpactEvidence.receipt;
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
      'reference_locator_or_metadata_changed', scope);
    change(`accepted_asset_binding:${entryId}`, acceptedIdentity(old?.asset), acceptedIdentity(current?.asset),
      'accepted_asset_locator_or_mapping_changed',
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
    compared_entry_ids: Object.keys(after.images).sort(),
    excluded_reference_entry_ids: after.excludedReferenceEntries || [],
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

async function verifiedQaEvidence(reader, decisionPath, before, after) {
  requireCondition(reader.label !== 'WORKTREE', 'QA decision requires a committed target ref');
  requireCondition(/^content\/production\/runs\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.decision\.json$/.test(decisionPath),
    'QA decision receipt must be under a production run');
  const receipt = await reader.json(decisionPath);
  const runId = decisionPath.split('/')[3];
  const ledger = await reader.json(`content/production/runs/${runId}/ledger.json`);
  const task = ledger.tasks?.find((item) => item.task_id === receipt.task_id);
  const decision = receipt.invalidation_decision;
  const sameVersions = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const output = receipt.output_versions?.find((item) => item.id === `approved_locked_scene:${before.sceneId}`);
  const input = receipt.input_versions?.find((item) => item.location === output?.location);
  const currentInputs = await Promise.all((receipt.input_versions || []).map(async (item) => {
    const bytes = await reader.readBytes(item.location);
    return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') === item.version;
  }));
  requireCondition(ledger.run_id === runId && receipt.run_id === runId &&
    receipt.scene_id === before.sceneId && task?.scene_id === before.sceneId &&
    task?.task_type === 'narrative_review' && task?.status === 'PASS' && ledger.status === 'ACTIVE' &&
    task.decision_receipt === decisionPath && receipt.status === 'PASS' &&
    receipt.harness?.id === 'content_qa' && receipt.harness?.pass === 'narrative_review' &&
    receipt.packet_sha256 === task.packet?.sha256 &&
    sameVersions(receipt.input_versions, task.input_versions) &&
    sameVersions(receipt.output_versions, task.output_versions) &&
    receipt.input_digest_sha256 === sha256(JSON.stringify(task.input_versions)) &&
    currentInputs.length > 0 && currentInputs.every(Boolean) &&
    receipt.qa_codes?.some((check) => check.name === 'no_visual_impact' && check.result === 'PASS') &&
    output?.version === input?.version &&
    decision?.decision === 'no_visual_impact' && decision.scene_id === before.sceneId &&
    decision.old_scene_sha256 === version(before.locked) && decision.new_scene_sha256 === version(after.locked),
  'missing or mismatched persisted Narrative QA no_visual_impact decision');
  return { ...decision, verified_from_persisted_qa: true, receipt: decisionPath };
}

export async function buildProductionImpact({ sceneId, from = 'HEAD', to = 'WORKTREE', qaDecision = null, root = projectRoot }) {
  const previous = await snapshotScene(readerFor(root, from), sceneId);
  const targetReader = readerFor(root, to);
  const current = await snapshotScene(targetReader, sceneId);
  const evidence = qaDecision ? await verifiedQaEvidence(targetReader, qaDecision, previous, current) : null;
  return compareSceneSnapshots(previous, current, { noVisualImpactEvidence: evidence });
}

async function reconcileRun(impact, runId, { root, from, to }) {
  requireCondition(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(runId), `invalid run ID: ${runId}`);
  const target = git(root, 'rev-parse', '--verify', `${to}^{commit}`);
  requireCondition(target === git(root, 'rev-parse', 'HEAD'), '--to must be committed current HEAD');
  const ledgerPath = `content/production/runs/${runId}/ledger.json`;
  const ledger = JSON.parse(execFileSync('git', ['-C', root, 'show', `${target}:${ledgerPath}`], { encoding: 'utf8' }));
  requireCondition(from === ledger.source_ref, '--from must equal ledger.source_ref');
  requireCondition(ledger.tasks?.length === 1 &&
    ['narrative_review', 'visual_review'].includes(ledger.tasks[0].task_type) &&
    ledger.tasks[0].scene_id === impact.scene_id && impact.scene_id === 'COM-00' &&
    (ledger.tasks[0].task_type !== 'visual_review' || ledger.tasks[0].review_scope === 'manifest_usability'),
  'only verified COM-00 narrative_review or manifest_usability tasks are supported');
  const task = ledger.tasks[0];
  const tempBase = await mkdtemp(path.join(tmpdir(), 'impact-source-'));
  const sourceRoot = path.join(tempBase, 'source');
  let added = false;
  let upstreamRoot;
  try {
    execFileSync('git', ['-C', root, 'worktree', 'add', '--detach', sourceRoot, ledger.source_ref], { stdio: 'pipe' });
    added = true;
    const run = await verifyProductionRun(runId, { root, sourceRoot });
    requireCondition(run.task_status === 'RECORDED_PASS' && run.task_id === task.task_id,
      'run does not have a verified recorded QA PASS');
    const changedVersions = [];
    if (task.task_type === 'narrative_review') {
      const packetArgs = { sceneId: task.scene_id, runId, taskId: task.task_id };
      const historical = await buildNarrativeReviewPacket({ ...packetArgs, root: sourceRoot, ref: ledger.source_ref });
      const current = await buildNarrativeReviewPacket({ ...packetArgs, root, ref: target });
      const reviewed = narrativeReviewContentIdentities(historical);
      const latest = narrativeReviewContentIdentities(current);
      requireCondition(reviewed.length === latest.length && reviewed.every((item, index) =>
        item.id === latest[index].id && item.location === latest[index].location),
      'narrative input identity set changed; fresh QA is required');
      for (let index = 0; index < reviewed.length; index++) {
        if (reviewed[index].version !== latest[index].version) changedVersions.push({
          kind: 'input_versions', id: reviewed[index].id, location: reviewed[index].location,
          old_version: reviewed[index].version, new_version: latest[index].version
        });
      }
      for (const item of task.output_versions) {
        safePath(item.location);
        const currentVersion = git(root, 'rev-parse', `${target}:${item.location}`);
        if (currentVersion !== item.version) changedVersions.push({
          kind: 'output_versions', id: item.id, location: item.location,
          old_version: item.version, new_version: currentVersion
        });
      }
    } else {
      const upstreamLedgerPath = `content/production/runs/${task.upstream_run_id}/ledger.json`;
      const upstreamReceipt = task.input_versions.find((item) => item.id ===
        `receipt:${task.upstream_run_id}/${task.upstream_task_id}`);
      requireCondition(upstreamReceipt &&
        git(root, 'rev-parse', `${ledger.source_ref}:${upstreamLedgerPath}`) ===
          git(root, 'rev-parse', `${target}:${upstreamLedgerPath}`) &&
        git(root, 'rev-parse', `${target}:${upstreamReceipt.location}`) === upstreamReceipt.version,
      'upstream Narrative QA ledger or receipt differs from recorded manifest review');
      const upstreamLedger = JSON.parse(execFileSync('git', ['-C', root, 'show',
        `${target}:${upstreamLedgerPath}`], { encoding: 'utf8' }));
      const upstreamTask = upstreamLedger.tasks?.find((item) => item.task_id === task.upstream_task_id);
      requireCondition(upstreamTask?.task_type === 'narrative_review' && upstreamTask.status === 'PASS' &&
        upstreamTask.scene_id === task.scene_id && task.output_versions?.length === 1,
        'manifest usability run is missing selected source or output identities');
      const selectedInputs = new Map(task.input_versions
        .filter((item) => item.id === `file:docs/narrative/scenes/vertical-slice/${task.scene_id}.md` ||
          item.id === `file:content/production/narrative/opening-ch1/${task.scene_id}.json`)
        .map((item) => [item.id, item]));
      requireCondition([...selectedInputs].every(([id, item]) =>
        upstreamTask.input_versions.find((upstream) => upstream.id === id)?.version === item.version),
      'selected scene/contract differs from recorded upstream Narrative QA');
      upstreamRoot = path.join(tempBase, 'upstream');
      execFileSync('git', ['-C', root, 'worktree', 'add', '--detach', upstreamRoot,
        upstreamLedger.source_ref], { stdio: 'pipe' });
      const packetArgs = { sceneId: task.scene_id, runId: task.upstream_run_id, taskId: task.upstream_task_id };
      const historical = await buildNarrativeReviewPacket({ ...packetArgs, root: upstreamRoot,
        ref: upstreamLedger.source_ref });
      const current = await buildNarrativeReviewPacket({ ...packetArgs, root, ref: target });
      const reviewed = narrativeReviewContentIdentities(historical);
      const latest = narrativeReviewContentIdentities(current);
      requireCondition(reviewed.length === latest.length && reviewed.every((item, index) =>
        item.id === latest[index].id && item.location === latest[index].location),
      'upstream narrative input identity set changed; fresh QA is required');
      for (let index = 0; index < reviewed.length; index++) {
        if (reviewed[index].version !== latest[index].version) changedVersions.push({
          kind: selectedInputs.has(reviewed[index].id) ? 'input_versions' : 'upstream_input_versions',
          id: reviewed[index].id, location: reviewed[index].location,
          old_version: reviewed[index].version, new_version: latest[index].version
        });
      }
      const upstreamStale = changedVersions.length > 0;
      if (!upstreamStale) {
        const packet = await buildManifestUsabilityPacket({ sceneId: task.scene_id,
          runId, taskId: task.task_id, ref: target, upstreamRunId: task.upstream_run_id,
          upstreamTaskId: task.upstream_task_id, entryIds: task.entry_ids, root });
        const recorded = task.input_versions.map(versionIdentity);
        const current = packet.input_versions.map(versionIdentity);
        requireCondition(recorded.length === current.length && recorded.every((item, index) =>
          item.id === current[index].id && item.location === current[index].location),
        'manifest usability input identity set changed; fresh QA is required');
        for (let index = 0; index < recorded.length; index++) {
          if (recorded[index].version !== current[index].version) changedVersions.push({
            kind: 'input_versions', id: recorded[index].id,
            location: packet.input_versions[index].location,
            old_version: recorded[index].version, new_version: current[index].version
          });
        }
        const selected = packet.input_versions.filter((item) => item.id.startsWith('manifest-entry:'));
        const currentOutput = sha256(JSON.stringify(selected.map(({ id, version }) => ({ id, version }))));
        if (task.output_versions[0].version !== currentOutput) changedVersions.push({
          kind: 'output_versions', id: task.output_versions[0].id,
          location: task.output_versions[0].location,
          old_version: task.output_versions[0].version, new_version: currentOutput
        });
      }
    }
    impact.run_reconciliation = {
      run_id: runId, task_id: task.task_id, task_type: task.task_type,
      ...(task.review_scope && { review_scope: task.review_scope }),
      source_ref: ledger.source_ref, decision_receipt: task.decision_receipt,
      recorded_status: 'RECORDED_PASS',
      target_status: changedVersions.length ? 'STALE_PROPOSED' : 'CURRENT_PASS',
      changed_versions: changedVersions,
      ...(task.task_type === 'visual_review' && changedVersions.some((item) =>
        item.kind === 'upstream_input_versions' || item.id ===
          `file:docs/narrative/scenes/vertical-slice/${task.scene_id}.md` || item.id ===
          `file:content/production/narrative/opening-ch1/${task.scene_id}.json`) &&
        { requires_fresh_upstream_narrative_qa: true })
    };
    impact.qa_status = task.task_type === 'narrative_review'
      ? 'VERIFIED_RECORDED_NARRATIVE_QA' : 'VERIFIED_RECORDED_MANIFEST_USABILITY_QA';
  } finally {
    try {
      if (upstreamRoot) execFileSync('git', ['-C', root, 'worktree', 'remove', '--force', upstreamRoot], { stdio: 'pipe' });
      if (added) execFileSync('git', ['-C', root, 'worktree', 'remove', '--force', sourceRoot], { stdio: 'pipe' });
    } finally {
      await rm(tempBase, { recursive: true, force: true });
    }
  }
  return impact;
}

export async function writeProductionImpact(options) {
  const { sceneId, root = projectRoot } = options;
  const destination = path.join(root, `generated/session-cache/impact/${sceneId}/impact.json`);
  await rm(destination, { force: true });
  requireCondition(!options.runId || !options.qaDecision, '--run-id cannot use an unrelated --qa-decision');
  if (options.runId) {
    requireCondition(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(options.runId), `invalid run ID: ${options.runId}`);
    requireCondition(options.from && options.to && options.to !== 'WORKTREE',
      '--run-id requires a recorded --from commit and committed --to HEAD');
  }
  const impact = await buildProductionImpact(options);
  if (options.runId) await reconcileRun(impact, options.runId, { root, from: options.from || 'HEAD', to: options.to || 'WORKTREE' });
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
      ['--scene', '--from', '--to', '--qa-decision', '--run-id'].includes(args[index])),
    'usage: npm run production:impact -- --scene <id> --from <commit> --to <commit|WORKTREE> [--qa-decision path] [--run-id id (one verified COM-00 QA task, from ledger.source_ref to HEAD)]');
    const options = Object.fromEntries(Array.from({ length: args.length / 2 }, (_, index) =>
      [args[2 * index].slice(2).replaceAll('-', ''), args[2 * index + 1]]));
    requireCondition(options.scene && args.filter((arg) => arg === '--scene').length === 1 &&
      new Set(args.filter((_, index) => index % 2 === 0)).size === args.length / 2 &&
      options.from !== 'WORKTREE' && options.from !== '' && options.to !== '', 'invalid arguments');
    const result = await writeProductionImpact({ sceneId: options.scene,
      ...(options.from && { from: options.from }), ...(options.to && { to: options.to }),
      ...(options.qadecision && { qaDecision: options.qadecision }), ...(options.runid && { runId: options.runid }) });
    console.log(`Impact: ${result.path} SHA-256 ${result.sha256}; ${result.impact.changes.length} changed artifact(s); QA ${result.impact.qa_status}`);
  } catch (error) {
    console.error(`BLOCKED: ${error.message}`);
    process.exitCode = 1;
  }
}
