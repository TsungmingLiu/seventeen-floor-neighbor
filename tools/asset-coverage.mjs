import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateReturnElevatorTrial, RETURN_ELEVATOR_TRIAL_RECEIPT, RETURN_ELEVATOR_TRIAL_HUMAN, RETURN_ELEVATOR_TRIAL_QA } from './validate-production-contracts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = 'content/assets/manifest.json';
const SOURCES = 'content/assets/source-map.json';
const CATALOG = 'content/assets/source-catalog.json';
const INDEX = 'content/routes/index.json';
const RECEIPTS = [
  'content/assets/ingest-receipts/repo-source-gate3-v1.json',
  'content/assets/ingest-receipts/narrative-preview-placeholder-v1.json',
  'content/assets/ingest-receipts/com02x-accepted-masters-v1.json',
  'content/assets/ingest-receipts/com02x-microwave-accepted-master-v1.json',
  'content/assets/ingest-receipts/com02x-walk-adopted-master-v3.json',
  'content/assets/ingest-receipts/title-master-native-v1.json',
  RETURN_ELEVATOR_TRIAL_RECEIPT
];
// Deliberately bounded: catalog statuses and unrelated receipts cannot grant adoption.
const DECISIONS = [
  'content/production/runs/com02x-cg-20260930/HUMAN-COM02X-MASTER-001.decision.json',
  'content/production/runs/com02x-cg-20260930/HUMAN-COM02X-MASTER-002.decision.json',
  'content/production/runs/com02x-visual-bindings-20261001/HUMAN-COM02X-WALK-ADOPTION-003.decision.json',
  'content/production/runs/title-key-visual-20261002/HUMAN-TITLE-MASTER-001.decision.json',
  RETURN_ELEVATOR_TRIAL_HUMAN,
  RETURN_ELEVATOR_TRIAL_QA
];
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sorted = (values) => [...new Set(values)].sort();
const issues = (values = []) => values.map((value) => typeof value === 'string' ? value : JSON.stringify(value));

export async function loadCoverageInputs(projectRoot = root) {
  const documents = {};
  const sourceErrors = [];
  const acquire = async (location, runtime = false) => {
    if (documents[location]) return documents[location].value;
    if (typeof location !== 'string' || !/^(content\/routes\/)[A-Za-z0-9_./-]+\.json$/.test(location) || location.split('/').includes('..')) {
      if (![ASSETS, SOURCES, CATALOG, ...RECEIPTS, ...DECISIONS].includes(location)) {
        sourceErrors.push({ code: 'SOURCE_PATH_INVALID', location: location ?? null, runtime });
        return null;
      }
    }
    try {
      const bytes = await readFile(path.join(projectRoot, location));
      const value = JSON.parse(bytes.toString('utf8'));
      documents[location] = { value, sha256: sha256(bytes) };
      return value;
    } catch {
      sourceErrors.push({ code: 'SOURCE_MISSING_OR_INVALID', location, runtime });
      return null;
    }
  };
  await Promise.all([ASSETS, SOURCES, CATALOG, ...RECEIPTS, ...DECISIONS].map((p) => acquire(p)));
  const index = await acquire(INDEX, true);
  for (const entry of index?.routes || []) {
    const config = await acquire(entry.config, true);
    for (const location of [...(config?.storyFiles || []), ...(config?.sceneFiles || []), ...(config?.memoryFile ? [config.memoryFile] : [])]) {
      await acquire(location, true);
    }
  }
  return { documents, sourceErrors };
}

export function createCoverageReport({ documents, sourceErrors = [] }) {
  const get = (location) => documents[location]?.value;
  const assets = get(ASSETS)?.assets || {};
  const sources = get(SOURCES)?.files || {};
  const catalog = get(CATALOG)?.files || {};
  const bindingErrors = [];
  const declared = new Map();
  const references = new Map();
  const routes = [];
  const error = (code, details = {}) => bindingErrors.push({ code, ...details });
  for (const location of [ASSETS, SOURCES, CATALOG, INDEX]) {
    if (!get(location)) error('CORE_SOURCE_MISSING', { location });
  }
  for (const item of sourceErrors.filter((item) => item.runtime)) error(item.code, { location: item.location });
  const index = get(INDEX);
  if (!Array.isArray(index?.routes) || !index.routes.length) error('ROUTE_INDEX_INVALID');
  if (!index?.routes?.some((entry) => entry.id === index.defaultRoute)) error('DEFAULT_ROUTE_MISSING');
  const routeIds = new Set();
  for (const entry of index?.routes || []) {
    const config = get(entry.config);
    if (!config) continue;
    if (config.id !== entry.id || routeIds.has(entry.id)) error('ROUTE_ID_MISMATCH', { routeId: entry.id });
    routeIds.add(entry.id);
    const chapter = config.story || {};
    const allowed = new Set(config.assetIds || []);
    if (!Array.isArray(config.assetIds)) error('ROUTE_ALLOWLIST_INVALID', { routeId: entry.id });
    if (chapter.allowPreviewArt === true) error('PREVIEW_ROUTE_OPT_IN', { routeId: entry.id });
    const declaredIds = sorted(allowed);
    for (const assetId of declaredIds) {
      if (!declared.has(assetId)) declared.set(assetId, []);
      declared.get(assetId).push(entry.id);
      if (!assets[assetId]) error('UNKNOWN_DECLARED_ASSET', { routeId: entry.id, assetId });
    }
    const routeReferences = [];
    const use = (assetId, binding, expectedKinds) => {
      if (assetId == null || assetId === '') return error('ASSET_BINDING_MISSING', { routeId: entry.id, binding });
      const reference = { routeId: entry.id, binding };
      if (!references.has(assetId)) references.set(assetId, []);
      references.get(assetId).push(reference);
      routeReferences.push(assetId);
      if (!assets[assetId]) error('UNKNOWN_REFERENCED_ASSET', { ...reference, assetId });
      if (!allowed.has(assetId)) error('ASSET_NOT_ALLOWLISTED', { ...reference, assetId });
      if (assets[assetId] && expectedKinds && !expectedKinds.includes(assets[assetId].kind)) error('ASSET_KIND_MISMATCH', { ...reference, assetId });
    };
    if (chapter.initialTitleArt !== undefined) use(chapter.initialTitleArt, 'initialTitleArt', ['cg', 'background']);
    use(chapter.titleArt, 'titleArt', ['cg', 'background']);
    use(chapter.endingArt, 'endingArt', ['cg', 'background']);
    for (const [id, ending] of Object.entries(chapter.endings || {})) if (ending.art) use(ending.art, `ending:${id}`, ['cg', 'background']);
    const nodeIds = new Set();
    for (const location of config.storyFiles || []) {
      const story = get(location);
      if (!story?.nodes) error('STORY_NODES_MISSING', { routeId: entry.id, location });
      for (const [nodeId, node] of Object.entries(story?.nodes || {})) {
        if (nodeIds.has(nodeId)) error('DUPLICATE_NODE', { routeId: entry.id, nodeId });
        nodeIds.add(nodeId);
        const visual = node.visual;
        if (!visual) continue;
        if (visual.mode === 'composite') {
          use(visual.background, `node:${nodeId}:background`, ['background']);
          for (const [i, sprite] of (visual.sprites || []).entries()) use(sprite.asset, `node:${nodeId}:sprite:${i}`, ['sprite']);
        } else if (['cg', 'cinematic'].includes(visual.mode)) use(visual.asset, `node:${nodeId}:asset`, [visual.mode]);
        else error('VISUAL_MODE_UNKNOWN', { routeId: entry.id, nodeId });
      }
    }
    const memory = config.memoryFile ? get(config.memoryFile) : { events: [] };
    const eventIds = new Set();
    for (const event of memory?.events || []) {
      if (eventIds.has(event.id)) error('DUPLICATE_MEMORY', { routeId: entry.id, eventId: event.id });
      eventIds.add(event.id);
      use(event.cover?.asset, `memory:${event.id}:cover`);
      if (event.titleBackdropAsset) use(event.titleBackdropAsset, `memory:${event.id}:titleBackdrop`);
      for (const [i, assetId] of (event.galleryAssets || []).entries()) use(assetId, `memory:${event.id}:gallery:${i}`, ['cg', 'cinematic']);
    }
    routes.push({ routeId: entry.id, declaredAssetIds: declaredIds, referencedAssetIds: sorted(routeReferences) });
  }

  const inventory = Object.keys(assets).sort().map((assetId) => {
    const asset = assets[assetId];
    const source = catalog[asset.masterSourceId];
    const runtime = sources[asset.src];
    const provenanceErrors = [];
    const check = (condition, code) => { if (!condition) provenanceErrors.push(code); };
    const candidates = [];
    for (const receiptPath of RECEIPTS) {
      const receipt = get(receiptPath);
      for (const item of receipt?.acceptedAssets || receipt?.assets || []) {
        if ((item.logicalAssetId || item.logicalId) === assetId) candidates.push({ receiptPath, receipt, item });
      }
      if (receipt?.logicalAssetId === assetId) candidates.push({ receiptPath, receipt, item: receipt });
    }
    check(candidates.length === 1, candidates.length ? 'CONTRADICTORY_RECEIPTS' : 'ADOPTION_RECEIPT_MISSING');
    check(runtime?.source, 'RUNTIME_LOCATOR_MISSING');
    const evidence = [];
    const knownIssues = [...issues(asset.knownIssues), ...issues(source?.knownIssues)];
    let status = 'unverified';
    let adoptionScope = 'unverified';
    let disposition = null;
    let visualQaStatus = 'not_recorded';
    if (candidates.length === 1) {
      const { receiptPath, receipt, item } = candidates[0];
      evidence.push({ location: receiptPath, sha256: documents[receiptPath].sha256 });
      check(receipt.receiptVersion === 1, 'RECEIPT_VERSION_UNKNOWN');
      if (receiptPath === RETURN_ELEVATOR_TRIAL_RECEIPT) {
        status = 'placeholder';
        adoptionScope = 'narrative_preview_only';
        disposition = 'trial-only';
        visualQaStatus = 'FAIL';
        knownIssues.push(...issues(receipt.knownIssues), 'VISUAL_QA_FAIL');
        for (const location of [RETURN_ELEVATOR_TRIAL_HUMAN, RETURN_ELEVATOR_TRIAL_QA]) {
          if (documents[location]) evidence.push({ location, sha256: documents[location].sha256 });
        }
        const route = get('content/routes/opening-demo/route.json');
        try {
          validateReturnElevatorTrial({ catalog: get(CATALOG), manifest: get(ASSETS), sourceMap: get(SOURCES), route,
            chapter: get('content/routes/opening-demo/chapter-01.json'), receipt,
            memories: get('content/routes/opening-demo/memories.json'),
            human: get(RETURN_ELEVATOR_TRIAL_HUMAN), qa: get(RETURN_ELEVATOR_TRIAL_QA),
            decisionHashes: { human: documents[RETURN_ELEVATOR_TRIAL_HUMAN]?.sha256, qa: documents[RETURN_ELEVATOR_TRIAL_QA]?.sha256 }
          }, { verifyFiles: false });
        } catch {
          check(false, 'TRIAL_PROVENANCE_MISMATCH');
        }
        check(assetId === 'bg.opening.com02x.return_elevator_trial' && (references.get(assetId) || []).length === 2 &&
          (references.get(assetId) || []).every(ref => ref.routeId === 'opening-demo' && ['node:common_convenience_xu_exit:background', 'node:common_convenience_xu_exit_02:background'].includes(ref.binding)), 'TRIAL_RUNTIME_SCOPE_MISMATCH');
      } else if (receiptPath === RECEIPTS[1]) {
        status = 'placeholder';
        adoptionScope = 'narrative_preview_only';
        check(receipt.lifecycle === 'PREVIEW-ONLY' && asset.previewOnly === true, 'PREVIEW_SCOPE_MISMATCH');
        check(asset.src === item.runtimePath && runtime?.source === item.repoPath, 'PREVIEW_BINDING_MISMATCH');
      } else {
        status = 'accepted';
        adoptionScope = 'exact_receipted_master';
        knownIssues.push(...issues(item.knownIssues), ...issues(item.acceptedKnownIssues));
        check(source?.sourcePath && source.verifiedDecode === true, 'MASTER_LOCATOR_MISSING');
        check(asset.masterSourceId === item.sourceId, 'MASTER_SOURCE_ID_MISMATCH');
        check(asset.canonicalAssetId === (item.canonicalAssetId || item.canonicalId), 'CANONICAL_ID_MISMATCH');
        check(source?.sourcePath === (item.repoPath || item.masterPath), 'MASTER_BINDING_MISMATCH');
        check(source?.name === (item.acceptedFilename || item.filename), 'MASTER_FILENAME_MISMATCH');
        check(runtime?.masterSourceId === item.sourceId && runtime?.transform === 'copy', 'RUNTIME_MASTER_MISMATCH');
        if (receiptPath === RECEIPTS[0]) {
          adoptionScope = 'repo_demo_representation';
          check(receipt.gate === 'repo-production-reference-gate3' && receipt.sourceCatalog === CATALOG, 'REPO_RECEIPT_SCOPE_MISMATCH');
          check(asset.src?.startsWith('assets/') && runtime?.source === item.repoPath, 'RUNTIME_BINDING_MISMATCH');
          check(source?.logicalAssetId === assetId && source?.canonicalAssetId === asset.canonicalAssetId, 'CATALOG_ID_MISMATCH');
          check(source?.status === 'active-production', 'CATALOG_STATUS_CONTRADICTION');
          if (issues(item.knownIssues).includes('demo-approved provisional wardrobe drift')) {
            status = 'provisional';
            adoptionScope = 'demo_only_provisional_wardrobe';
          }
        } else {
          adoptionScope = 'human_accepted_as_is';
          disposition = item.humanDisposition;
          visualQaStatus = item.visualQaStatus || 'not_recorded';
          check(['PASS', 'FAIL', 'NEEDS_REVIEW'].includes(visualQaStatus), 'QA_STATUS_UNKNOWN');
          const human = receipt.humanDecision;
          const decision = get(human?.path);
          if (DECISIONS.includes(human?.path) && documents[human.path]) evidence.push({ location: human.path, sha256: documents[human.path].sha256 });
          check(['human-accepted-master-batch', 'human-adopted-master-batch', 'human-adopted-title-master'].includes(receipt.receiptType), 'HUMAN_RECEIPT_TYPE_UNKNOWN');
          check(DECISIONS.includes(human?.path) && decision && documents[human.path]?.sha256 === human.sha256, 'HUMAN_DECISION_HASH_MISMATCH');
          check(decision && (decision.decision_id || decision.task_id) === human?.id && decision.run_id === receipt.runId && decision.scene_id === receipt.sceneId, 'HUMAN_DECISION_ID_MISMATCH');
          check(human?.disposition === 'ACCEPTED_AS_IS' && disposition === 'ACCEPTED_AS_IS' && human?.qaHistoryPreserved === true, 'HUMAN_DISPOSITION_MISMATCH');
          if (receipt.receiptType === 'human-adopted-title-master') {
            check(receiptPath === RECEIPTS[5] && assetId === 'bg.opening.title.17f_doorlight' && asset.kind === 'background' && !asset.gallery && receipt.sceneId === 'COM-00', 'TITLE_SCOPE_MISMATCH');
            check(decision?.status === 'HUMAN_ACCEPTED_AS_IS' && human?.status === decision.status, 'HUMAN_ADOPTION_STATUS_MISMATCH');
            check(decision?.output_versions?.some((v) => v.id === 'TITLE-17F-DOORLIGHT-01-selected-master' && v.location === item.masterPath), 'HUMAN_MASTER_LOCATOR_MISMATCH');
            check(item.visualQaStatus === 'NEEDS_REVIEW' && receipt.visualQa?.status === 'NEEDS_REVIEW' && decision?.input_versions?.some((v) => v.id === 'VQA-TITLE-17F-001-original-review' && v.version === receipt.visualQa.sha256 && v.location === item.visualQaReceipt), 'QA_HISTORY_MISMATCH');
            check(asset.focus?.x === 50 && asset.focus?.y === 40 && receipt.renderProvenance?.originalGenerationRef === 'a4e6e1b6e89c3d6dc180755842343230398e3403', 'TITLE_PROVENANCE_MISMATCH');
            check((references.get(assetId) || []).every((r) => r.binding === 'initialTitleArt'), 'TITLE_RUNTIME_SCOPE_MISMATCH');
          } else if (receipt.receiptType === 'human-adopted-master-batch') {
            check(decision?.status === 'HUMAN_ACCEPTED_AS_IS' && human?.status === decision.status && !('decision' in human), 'HUMAN_ADOPTION_STATUS_MISMATCH');
            check(decision?.output_versions?.some((v) => v.id === `accepted-master:${item.entryId}:v3` && [item.masterPath, `candidate:${item.entryId}:v3`].includes(v.location)), 'HUMAN_MASTER_LOCATOR_MISMATCH');
            check(decision?.qa_codes?.some((q) => q.result === visualQaStatus && q.code === 'VQA-COM02X-WALK-003') && receipt.visualQa?.status === visualQaStatus, 'QA_HISTORY_MISMATCH');
          } else {
            const selection = decision?.accepted_assets?.filter((v) => v.entry_id === item.entryId) || [];
            check(decision?.decision === 'PASS' && human?.decision === 'PASS' && decision?.gate === 'accepted_master_image_selection' && decision?.qa_history_preserved === true, 'HUMAN_ACCEPTANCE_STATUS_MISMATCH');
            check(selection.length === 1 && selection[0].filename === item.filename && selection[0].human_disposition === disposition, 'HUMAN_MASTER_LOCATOR_MISMATCH');
            check(selection.length === 1 && selection[0].visual_qa_status === visualQaStatus && selection[0].visual_qa_receipt === item.visualQaReceipt, 'QA_HISTORY_MISMATCH');
            knownIssues.push(...issues(selection[0]?.accepted_known_issues));
          }
          check(source?.status === 'human-accepted-as-is', 'CATALOG_STATUS_CONTRADICTION');
          check(asset.src === item.runtimePath && runtime?.source === item.derivativePath, 'DERIVATIVE_BINDING_MISMATCH');
          if (visualQaStatus !== 'PASS') knownIssues.push(`VISUAL_QA_${visualQaStatus.toUpperCase()}`);
          const coverage = receipt.runtimeCoverage;
          if (coverage && receipt.receiptType !== 'human-adopted-title-master') {
            for (const nodeId of coverage.nodeIds || []) check((references.get(assetId) || []).some((r) => r.binding === `node:${nodeId}:asset`), 'RECEIPTED_NODE_BINDING_MISMATCH');
            check((references.get(assetId) || []).some((r) => r.binding.startsWith(`memory:${coverage.memoryEventId}:`)), 'RECEIPTED_MEMORY_BINDING_MISMATCH');
          }
        }
      }
    }
    // Any unsupported/contradictory provenance prevents an acceptance claim.
    if (provenanceErrors.length) status = 'unverified';
    const releaseConstraints = [];
    if (asset.previewOnly || status === 'placeholder') releaseConstraints.push('PREVIEW_ONLY');
    if (status === 'provisional') releaseConstraints.push('PROVISIONAL_DEMO_SCOPE');
    if (status === 'unverified') releaseConstraints.push('UNVERIFIED_PROVENANCE');
    if (knownIssues.length) releaseConstraints.push('KNOWN_ISSUES');
    const declaredInRoutes = sorted(declared.get(assetId) || []);
    const refs = (references.get(assetId) || []).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'en'));
    return { assetId, canonicalAssetId: asset.canonicalAssetId || null, kind: asset.kind, runtimePath: asset.src, masterSourceId: asset.masterSourceId || null,
      status, adoptionScope, disposition, visualQaStatus, evidence, knownIssues: sorted(knownIssues), provenanceErrors: sorted(provenanceErrors),
      declaredInRoutes, references: refs, runtimeBound: declaredInRoutes.length > 0 || refs.length > 0,
      releaseReadiness: 'not_recorded', coverageClear: releaseConstraints.length === 0, releaseConstraints };
  });
  const runtimeInventory = inventory.filter((asset) => asset.runtimeBound);
  const blocked = runtimeInventory.filter((asset) => !asset.coverageClear);
  const errors = bindingErrors.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'en'));
  const count = (rows) => Object.fromEntries(['placeholder', 'provisional', 'accepted', 'unverified'].map((status) => [status, rows.filter((a) => a.status === status).length]));
  const coverageClear = errors.length === 0 && blocked.length === 0;
  return {
    schemaVersion: 1,
    scope: { verification: 'metadata_receipt_and_runtime_bindings', binaryBytesVerified: false, releaseReadiness: 'not_recorded',
      playableAcceptance: 'not_assessed', strictPassMeans: 'runtime_asset_coverage_clear_only' },
    summary: { inventory: inventory.length, runtimeBound: runtimeInventory.length, declared: declared.size, referenced: references.size,
      unused: inventory.length - runtimeInventory.length, inventoryStatuses: count(inventory), runtimeStatuses: count(runtimeInventory),
      blockedRuntimeAssets: blocked.length, bindingErrors: errors.length, coverageClear },
    routes: routes.sort((a, b) => a.routeId.localeCompare(b.routeId, 'en')),
    assets: inventory,
    bindingErrors: errors,
    sourceErrors: sourceErrors.slice().sort((a, b) => String(a.location).localeCompare(String(b.location), 'en')),
    sources: Object.keys(documents).sort().map((location) => ({ location, sha256: documents[location].sha256 }))
  };
}

export function coverageExitCode(report, { strict = false } = {}) {
  if (report.bindingErrors.some((e) => e.code !== 'PREVIEW_ROUTE_OPT_IN') || report.assets.some((a) => a.runtimeBound && a.provenanceErrors.length)) return 1;
  return strict && !report.summary.coverageClear ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--strict')) {
    console.error('Usage: node tools/asset-coverage.mjs [--strict]');
    process.exitCode = 2;
  } else {
    const report = createCoverageReport(await loadCoverageInputs());
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exitCode = coverageExitCode(report, { strict: args.includes('--strict') });
  }
}
