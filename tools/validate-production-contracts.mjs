import { validateProductionStorage } from './production-storage.mjs';
import { validateCharacterReferencePacks, validateCharacterReferencePackReceipt, validateCharacterWardrobeReplacementReceipt, validateWardrobeDerivation } from './character-references.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  adaptApi,
  adaptChatManual,
  adaptWorkBatch,
  buildPackets,
  validateManifest,
  validateRepoSourceCatalog,
  sha256
} from './render-cg-packets.mjs';

const NARRATIVE_ROOT = 'content/production/narrative';
const CG_MANIFEST_ROOT = 'content/production/cg-manifests';
const OPENING_MANIFEST = 'content/production/cg-manifests/opening-ch1.json';
const COM01B_MANIFEST = 'content/production/cg-manifests/opening-ch1-com01b.json';
const OPENING_RECEIPT = 'content/assets/ingest-receipts/opening-ch1-demo-v0.1.json';
const OPENING_ROUTE = 'content/routes/opening-demo/route.json';
const SOURCE_CATALOG = 'content/assets/source-catalog.json';
const GATE3_RECEIPT = 'content/assets/ingest-receipts/repo-source-gate3-v1.json';
const COM02X_REFERENCE_RECEIPT = 'content/assets/ingest-receipts/com02x-environment-reference-v1.json';
const COM02X_ACCEPTED_MASTERS_RECEIPT = 'content/assets/ingest-receipts/com02x-accepted-masters-v1.json';
export const RETURN_ELEVATOR_TRIAL_RECEIPT = 'content/assets/ingest-receipts/return-elevator-trial-v1.json';
export const RETURN_ELEVATOR_TRIAL_HUMAN = 'content/production/runs/cafe-narration-and-elevator-trial-20261003/HUMAN-ELEVATOR-TRIAL-004.decision.json';
export const RETURN_ELEVATOR_TRIAL_QA = 'content/production/runs/opening-feedback-20261003/VQA-COM02X-ELEVATOR-SOURCE-017.decision.json';
const ORCHESTRATION = '.ai/PRODUCTION_ORCHESTRATION.md';
const SOURCE_MAP = 'docs/CONTENT_PRODUCTION_SOURCE_MAP.md';
const DRY_RUN = 'tests/fixtures/production-orchestration-dry-run.json';
const FORBIDDEN_ROOTS = ['.ai/archive/', '.ai/experiments/', 'docs/archive/'];
const OLD_ACTIVE_PATHS = [
  'docs/art/PROTOTYPE_ART_REQUIREMENTS.md',
  'docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md',
  '.ai/operators/',
  '.ai/pilots/'
];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function listJsonFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listJsonFiles(entryPath) : entry.name.endsWith('.json') ? [entryPath] : [];
  }).sort();
}

function requireKeys(object, expected, context) {
  invariant(object && typeof object === 'object' && !Array.isArray(object), `${context} must be an object`);
  const actual = Object.keys(object).sort();
  const wanted = [...expected].sort();
  invariant(JSON.stringify(actual) === JSON.stringify(wanted), `${context} keys must be exactly ${wanted.join(', ')}`);
}

function requireNonEmptyString(value, context) {
  invariant(typeof value === 'string' && value.trim(), `${context} must be a non-empty string`);
}

function requireNonEmptyStringArray(value, context) {
  invariant(Array.isArray(value) && value.length > 0, `${context} must be a non-empty array`);
  value.forEach((item, index) => requireNonEmptyString(item, `${context}[${index}]`));
}

function validateState(state, context) {
  requireKeys(state, ['relationships', 'knowledge', 'constraints'], context);
  invariant(Array.isArray(state.relationships) && state.relationships.length > 0, `${context}.relationships must be non-empty`);
  state.relationships.forEach((relationship, index) => {
    const item = `${context}.relationships[${index}]`;
    requireKeys(relationship, ['subject', 'toward', 'label', 'constraints'], item);
    requireNonEmptyString(relationship.subject, `${item}.subject`);
    requireNonEmptyString(relationship.toward, `${item}.toward`);
    requireNonEmptyString(relationship.label, `${item}.label`);
    invariant(/^[a-z][a-z0-9_]*$/.test(relationship.label), `${item}.label must be an English snake_case semantic label`);
    requireNonEmptyStringArray(relationship.constraints, `${item}.constraints`);
  });
  invariant(Array.isArray(state.knowledge) && state.knowledge.length > 0, `${context}.knowledge must be non-empty`);
  state.knowledge.forEach((knowledge, index) => {
    const item = `${context}.knowledge[${index}]`;
    requireKeys(knowledge, ['holder', 'knows', 'does_not_know'], item);
    requireNonEmptyString(knowledge.holder, `${item}.holder`);
    invariant(Array.isArray(knowledge.knows), `${item}.knows must be an array`);
    invariant(Array.isArray(knowledge.does_not_know), `${item}.does_not_know must be an array`);
    knowledge.knows.forEach((value, valueIndex) => requireNonEmptyString(value, `${item}.knows[${valueIndex}]`));
    knowledge.does_not_know.forEach((value, valueIndex) => requireNonEmptyString(value, `${item}.does_not_know[${valueIndex}]`));
  });
  invariant(Array.isArray(state.constraints), `${context}.constraints must be an array`);
  state.constraints.forEach((value, index) => requireNonEmptyString(value, `${context}.constraints[${index}]`));
}

function semanticKeys(value, keys = []) {
  if (Array.isArray(value)) value.forEach((item) => semanticKeys(item, keys));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      keys.push(key);
      semanticKeys(item, keys);
    }
  }
  return keys;
}

export function validateNarrativeContract(contract, file) {
  requireKeys(contract, [
    'schema_version', 'scene_id', 'lifecycle', 'source_scene', 'entry_state', 'scene_function',
    'character_intent', 'player_information_gain', 'emotional_arc', 'required_payoffs',
    'exit_state', 'must_not', 'implementation_mapping'
  ], file);
  invariant(contract.schema_version === '1.0.0', `${file}.schema_version must be 1.0.0`);
  invariant(contract.lifecycle === 'CANONICAL', `${file}.lifecycle must be CANONICAL`);
  requireNonEmptyString(contract.scene_id, `${file}.scene_id`);
  requireNonEmptyString(contract.source_scene, `${file}.source_scene`);
  invariant(fs.existsSync(contract.source_scene), `${file}.source_scene does not exist`);
  invariant(!FORBIDDEN_ROOTS.some((root) => contract.source_scene.includes(root)), `${file}.source_scene uses forbidden root`);
  validateState(contract.entry_state, `${file}.entry_state`);
  validateState(contract.exit_state, `${file}.exit_state`);
  for (const key of ['scene_function', 'player_information_gain', 'emotional_arc', 'required_payoffs', 'must_not']) {
    requireNonEmptyStringArray(contract[key], `${file}.${key}`);
  }
  invariant(Array.isArray(contract.character_intent) && contract.character_intent.length > 0, `${file}.character_intent must be non-empty`);
  contract.character_intent.forEach((intent, index) => {
    requireKeys(intent, ['character_id', 'intent'], `${file}.character_intent[${index}]`);
    requireNonEmptyString(intent.character_id, `${file}.character_intent[${index}].character_id`);
    requireNonEmptyString(intent.intent, `${file}.character_intent[${index}].intent`);
  });
  requireKeys(contract.implementation_mapping, ['runtime_only', 'flags'], `${file}.implementation_mapping`);
  invariant(contract.implementation_mapping.runtime_only === true, `${file}.implementation_mapping.runtime_only must be true`);
  invariant(contract.implementation_mapping.flags && typeof contract.implementation_mapping.flags === 'object' && !Array.isArray(contract.implementation_mapping.flags), `${file}.implementation_mapping.flags must be an object`);

  const semantic = { ...contract };
  delete semantic.implementation_mapping;
  const bannedKey = semanticKeys(semantic).find((key) => /(?:^|_)(?:trust|affection|intimacy)?_?score$/i.test(key));
  invariant(!bannedKey, `${file} contains banned semantic score key: ${bannedKey}`);

  const sceneLines = readText(contract.source_scene).split(/\r?\n/);
  const headings = sceneLines.flatMap((line, index) => /^## Narrative Continuity Contract\s*$/.test(line) ? [index] : []);
  invariant(headings.length === 1, `${contract.source_scene} must have exactly one Narrative Continuity Contract section`);
  const sectionEnd = sceneLines.findIndex((line, index) => index > headings[0] && /^##\s/.test(line));
  const section = sceneLines.slice(headings[0] + 1, sectionEnd < 0 ? undefined : sectionEnd);
  const bindings = section.filter((line) => /^- Canonical contract(?:\s|:|：)/.test(line));
  invariant(bindings.length === 1, `${contract.source_scene} must have exactly one Canonical contract binding in Narrative Continuity Contract`);
  const binding = bindings[0].match(/^- Canonical contract[:：]\s*`([^`]+)`(?:[。。，]|\s|$)/);
  invariant(binding, `${contract.source_scene} has a malformed Canonical contract binding`);
  invariant(binding[1] === file, `${contract.source_scene} Canonical contract binding does not match ${file}`);
  return contract;
}

function validateActiveWorkflowBoundary() {
  const activeHarnesses = fs.readdirSync('.ai/harnesses').filter((name) => name.endsWith('.md')).sort();
  const expectedHarnesses = [
    'bootstrap.md',
    'cg-planner.md',
    'cg-renderer.md',
    'content-qa.md',
    'content-writer.md',
    'integrator.md'
  ];
  invariant(JSON.stringify(activeHarnesses) === JSON.stringify(expectedHarnesses), 'active harness set does not match the five-role workflow plus bootstrap');
  const activeHarnessText = activeHarnesses.map((name) => readText(path.join('.ai/harnesses', name))).join('\n');
  invariant(!FORBIDDEN_ROOTS.some((root) => activeHarnessText.includes(root)), 'active harness references archive/experiment path');

  const activeFiles = [
    '.ai/WORKFLOW_MANIFEST.yaml',
    'docs/narrative/CONTENT_PRODUCTION_SPEC.md',
    'docs/art/CG_PRODUCTION_SPEC.md',
    ...listJsonFiles(NARRATIVE_ROOT),
    ...listJsonFiles(CG_MANIFEST_ROOT)
  ];
  const activeText = activeFiles.map(readText).join('\n');
  for (const oldPath of OLD_ACTIVE_PATHS) invariant(!activeText.includes(oldPath), `active production source references obsolete path: ${oldPath}`);

  const sourceMap = readText(SOURCE_MAP);
  invariant(sourceMap.includes('source inventory / routing index'), 'source map must remain an inventory, not a duplicate policy');
  invariant(sourceMap.includes('.ai/policies/SOURCE_AUTHORITY.md') && sourceMap.includes('ROADMAP.md') && sourceMap.includes('TODO.md') && sourceMap.includes('ARCHITECTURE.md'), 'source map must route policy/milestone/backlog/runtime to their owning documents');
  invariant(sourceMap.includes('Asset metadata / provenance') && sourceMap.includes('content/assets/manifest.json') && sourceMap.includes('content/assets/source-catalog.json') && sourceMap.includes('content/assets/ingest-receipts/'), 'source map must route asset metadata/provenance sources');
  for (const duplicateSection of ['## 1. Document lifecycle', '## 2. Conflict order', 'Opening Chapter 1 current facts', 'UI items explicitly out of scope']) {
    invariant(!sourceMap.includes(duplicateSection), `source map reintroduced duplicated section: ${duplicateSection}`);
  }
}

function validateOrchestrationContract() {
  const requiredFiles = [
    ORCHESTRATION,
    '.ai/schemas/TASK_PACKET.md',
    '.ai/schemas/HANDOFF.md',
    '.ai/schemas/PRODUCTION_RUN_LEDGER.md',
    '.ai/policies/CONTEXT_ISOLATION.md',
    'docs/PRODUCTION_ORCHESTRATION_DRY_RUN.md'
  ];
  requiredFiles.forEach((file) => invariant(fs.existsSync(file) && readText(file).trim(), `missing orchestration contract: ${file}`));
  const manifest = readText('.ai/WORKFLOW_MANIFEST.yaml');
  const bootstrap = readText('.ai/harnesses/bootstrap.md');
  const isolation = readText('.ai/policies/CONTEXT_ISOLATION.md');
  const contract = readText(ORCHESTRATION);
  const packet = readText('.ai/schemas/TASK_PACKET.md');
  const handoff = readText('.ai/schemas/HANDOFF.md');
  const ledger = readText('.ai/schemas/PRODUCTION_RUN_LEDGER.md');
  invariant(manifest.includes(`orchestration_contract: ${ORCHESTRATION}`), 'manifest does not identify canonical orchestration contract');
  invariant(manifest.includes('each_independent_task_requires_fresh_worker: true'), 'manifest must require fresh task workers');
  invariant(manifest.includes('parent_role: production_coordinator_control_plane_only'), 'manifest must keep parent control-plane-only');
  invariant(manifest.includes('render_task_unit: one_independent_manifest_entry_or_explicit_linked_sequence'), 'manifest lost one-entry render boundary');
  invariant(manifest.includes('default_tier: economical'), 'manifest must default delegated work to economical model tier');
  invariant(manifest.includes('allowed_tiers: [economical, capable]'), 'manifest must keep bounded economical/capable model tiers');
  invariant(manifest.includes('coordinator_if_runtime_selectable: capable'), 'manifest must preserve capable Coordinator guidance when runtime-selectable');
  const baselineRouting = {
    narrative_design: 'capable',
    scene_dialogue: 'capable',
    cg_plan: 'capable',
    cross_scene_continuity_review: 'capable',
    final_high_impact_qa: 'capable',
    narrative_review: 'economical',
    manifest_usability_review: 'economical',
    cg_render_orchestration: 'economical',
    visual_review: 'economical',
    integrate: 'economical',
    source_extraction: 'economical',
    character_environment_spec_extraction: 'economical',
    deterministic_prompt_compilation: 'economical',
    filename_manifest_inventory: 'economical',
    schema_transformation: 'economical',
    bounded_checklist_validation: 'economical',
    runtime_wiring: 'economical'
  };
  for (const [workload, tier] of Object.entries(baselineRouting)) {
    invariant(manifest.includes(`${workload}: ${tier}`), `manifest baseline routing missing ${workload}: ${tier}`);
  }
  invariant(manifest.includes('coordinator_corrective_redispatch_limit: 1'), 'manifest must bound same-tier corrective redispatch to one attempt');
  invariant(manifest.includes('renderer_automatic_retry: false'), 'model routing must not authorize automatic renderer retry');
  for (const [name, value] of [['bootstrap', bootstrap], ['context isolation', isolation], ['orchestration', contract]]) {
    invariant(/fresh bounded worker|fresh worker\/session/.test(value), `${name} lost fresh-worker requirement`);
  }
  invariant(contract.includes('Continuity lives in canonical artifacts, not worker memory.'), 'orchestration lost artifact continuity principle');
  invariant(contract.includes('MUST NOT directly generate CG candidates'), 'orchestration lost parent renderer prohibition');
  invariant(contract.includes('Default is `economical`.'), 'orchestration lost economical-first model routing');
  invariant(contract.includes('### Baseline workload routing'), 'orchestration lost baseline workload routing guidance');
  invariant(contract.includes('execution.model_routing.baseline_workloads'), 'orchestration must reference manifest-owned baseline workloads');
  invariant(contract.includes('cg_render_orchestration: economical') && contract.includes('actual image-generation capability/model selection is outside this worker tier'), 'orchestration must distinguish render orchestration tier from image-generation capability');
  invariant(contract.includes('validation_escalation') && contract.includes('最多可對同一 objective 建立一次'), 'orchestration lost bounded escalation policy');
  invariant(contract.includes('no automatic retry / no automatic image scoring'), 'orchestration model routing must preserve renderer retry prohibition');
  invariant(contract.includes('READY_FOR_HUMAN_ACCEPTANCE') && contract.includes('preview:smoke'), 'orchestration lost playable definition of done');
  invariant(manifest.includes('narrative_preview:') && manifest.includes('preview_asset_property: previewOnly') &&
    contract.includes('NARRATIVE_PREVIEW_READY') && contract.includes('npm run validate:final') &&
    packet.includes('integration_mode: narrative_preview | final') && ledger.includes('NARRATIVE_PREVIEW_READY'),
    'orchestration lost the bounded text-first preview gate');
  for (const field of ['run_id:', 'task_id:', 'task_type:', 'depends_on:', 'harness:', 'pass:', 'objective:', 'execution_policy:', 'model_tier:', 'routing_reason:', 'attempt:', 'required_acquisition:', 'allowed_sources:', 'input_versions:', 'constraints:', 'deliverables:', 'acceptance:', 'handoff_to:', 'human_gate:']) {
    invariant(packet.includes(field), `Task Packet cannot represent ${field}`);
  }
  for (const field of ['run_id:', 'task_id:', 'status:', 'outputs:', 'input_versions:', 'output_versions:', 'qa:', 'known_issues:', 'invalidates:', 'next_recommended_stage:', 'human_gate_required:']) {
    invariant(handoff.includes(field), `Handoff cannot represent ${field}`);
  }
  for (const status of ['PENDING', 'READY', 'RUNNING', 'PASS', 'NEEDS_REVIEW', 'FAIL', 'BLOCKED', 'STALE', 'SKIPPED']) {
    invariant(ledger.includes(`\`${status}\``), `run ledger missing ${status}`);
  }
  for (const root of FORBIDDEN_ROOTS) {
    invariant(manifest.includes(`- ${root}`) && packet.includes(`- ${root}`), `forbidden root not preserved: ${root}`);
  }

  const example = readJson(DRY_RUN);
  invariant(example.hypothetical_only === true && example.run_id, 'dry-run fixture must be hypothetical');
  const tasks = new Map(example.tasks.map((task) => [task.task_id, task]));
  invariant(tasks.size === example.tasks.length, 'dry-run task IDs must be unique');
  const modelTiers = new Set(['economical', 'capable']);
  const routingReasons = new Set([
    'default_bounded',
    'creative_judgment',
    'material_ambiguity_or_conflict',
    'cross_scene_or_cross_system_reasoning',
    'final_high_impact_qa',
    'validation_escalation'
  ]);
  for (const task of example.tasks) {
    requireKeys(task.execution_policy, ['model_tier', 'routing_reason', 'attempt', 'correction_of', 'escalation_from'], `${task.task_id}.execution_policy`);
    invariant(modelTiers.has(task.execution_policy.model_tier), `${task.task_id} has invalid model tier`);
    invariant(routingReasons.has(task.execution_policy.routing_reason), `${task.task_id} has invalid routing reason`);
    invariant(Number.isInteger(task.execution_policy.attempt) && task.execution_policy.attempt >= 1, `${task.task_id} has invalid attempt`);
    invariant(task.execution_policy.routing_reason !== 'default_bounded' || task.execution_policy.model_tier === 'economical', `${task.task_id} cannot use capable for default_bounded routing`);
  }
  invariant(['ND-001', 'SC-001', 'CGP-001'].every((id) => tasks.get(id).execution_policy.model_tier === 'capable'), 'dry-run creative judgment tasks should demonstrate capable routing');
  invariant(['NQA-001', 'MQA-001', 'CGR-001', 'CGR-002', 'CGR-003', 'VQA-001', 'VQA-002', 'VQA-003', 'INT-001'].every((id) => tasks.get(id).execution_policy.model_tier === 'economical'), 'dry-run bounded tasks should demonstrate economical-first routing');
  const boundedFailure = example.routing_cases.find((item) => item.case === 'bounded_visual_review_failure');
  invariant(
    boundedFailure &&
      boundedFailure.initial_tier === 'economical' &&
      boundedFailure.corrective_redispatch_tier === 'economical' &&
      boundedFailure.post_correction_failure_tier === 'capable' &&
      boundedFailure.post_correction_reason === 'validation_escalation' &&
      boundedFailure.max_corrective_redispatches === 1,
    'dry-run must demonstrate one same-tier correction before validation escalation'
  );
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    invariant(tasks.has(id), `dry-run dependency missing: ${id}`);
    invariant(!visiting.has(id), `dry-run DAG cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of tasks.get(id).depends_on) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const task of example.tasks) visit(task.task_id);
  function ancestors(id, found = new Set()) {
    for (const dependency of tasks.get(id).depends_on) {
      found.add(dependency);
      ancestors(dependency, found);
    }
    return found;
  }
  for (const group of example.parallel_groups) {
    for (const id of group) {
      invariant(tasks.has(id), `parallel task missing: ${id}`);
      for (const other of group) if (id !== other) invariant(!ancestors(id).has(other), `parallel tasks have dependency: ${id} -> ${other}`);
    }
  }
  const renders = example.tasks.filter((task) => task.task_type === 'cg_render');
  invariant(renders.length === 3 && new Set(renders.map((task) => task.entry_id)).size === renders.length, 'dry-run must allocate one independent entry per fresh render task');
  invariant(tasks.get('CGP-001').depends_on.includes('NQA-001') && renders.every((task) => task.depends_on.includes('MQA-001')), 'dry-run cannot render before approved scene/manifest');
  invariant(tasks.get('INT-001').depends_on.every((id) => tasks.has(id)) && ['VQA-001', 'VQA-002', 'VQA-003'].every((id) => tasks.get('INT-001').depends_on.includes(id)), 'integration must await all required visual reviews');
  for (const scenario of example.invalidation_cases) {
    invariant(scenario.stale.every((id) => tasks.has(id)), `invalid stale task in ${scenario.change}`);
    invariant((scenario.preserve || []).every((id) => tasks.has(id) && !scenario.stale.includes(id)), `invalidation crosses preserved task in ${scenario.change}`);
  }
}

// This exact Human-authorized trial adds no canonical accepted source or quality PASS.
export function validateReturnElevatorTrial({ catalog, manifest, sourceMap, route, chapter, memories, receipt, human, qa, decisionHashes }, { verifyFiles = true } = {}) {
  const check = (value, reason) => invariant(value, `return elevator trial: ${reason}`);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const id = 'bg.opening.com02x.return_elevator_trial';
  const sourceId = 'source.opening.com02x.return_elevator_trial.original';
  const originalPath = 'assets-src/opening-ch1-preview/return-elevator-trial-v1.png';
  const derivativePath = 'assets-src/opening-ch1-preview/return-elevator-trial-v1.webp';
  const runtimePath = 'assets/opening-ch1-preview/return-elevator-trial-v1.webp';
  const originalHash = '886c78b86000350d289c5e6544f97d1727dcd506d676d8523d28c474fb854bac';
  const humanHash = 'dd7f3e8404504704a677a2b8226936a13d69fbaf7fcbee18a538084ef5802a5b';
  const qaHash = '20e91ab22294b3767742e306bd3afaeca728fc13a64bad0e0d46871eee4d7928';
  const nodeIds = ['common_convenience_xu_exit', 'common_convenience_xu_exit_02'];
  const conversion = { encoder: 'ffmpeg/libwebp', quality: 88, compressionLevel: 6, lossless: false, pixelFormat: 'rgb24', resize: null };
  check(receipt?.receiptVersion === 1 && receipt.receiptType === 'human-authorized-preview-trial' && receipt.lifecycle === 'PREVIEW-ONLY' && receipt.integrationMode === 'narrative_preview' && receipt.logicalAssetId === id && receipt.sourceId === sourceId, 'receipt identity/scope mismatch');
  const original = receipt.original;
  const derivative = receipt.derivative;
  check(original?.sourcePath === originalPath && original.filename === 'return-elevator-trial-v1.png' && original.width === 1672 && original.height === 941 && original.mimeType === 'image/png', 'selected original mismatch');
  check(derivative?.sourcePath === derivativePath && derivative.runtimePath === runtimePath && derivative.width === 1672 && derivative.height === 941 && derivative.mimeType === 'image/webp' && same(derivative.conversion, conversion), 'derivative identity/settings mismatch');
  check(receipt.humanDecision?.path === RETURN_ELEVATOR_TRIAL_HUMAN && receipt.humanDecision.sha256 === humanHash && decisionHashes?.human === humanHash && receipt.humanDecision.id === 'HUMAN-ELEVATOR-TRIAL-004' && receipt.humanDecision.status === 'HUMAN_ACCEPTED_AS_IS' && receipt.humanDecision.scope === 'TRIAL_ONLY', 'Human decision fingerprint/scope mismatch');
  check(human?.task_id === 'HUMAN-ELEVATOR-TRIAL-004' && human.status === 'HUMAN_ACCEPTED_AS_IS' && human.scene_id === 'COM-02X' && human.output_versions?.length === 1 && human.output_versions[0].id === 'selected-trial-original:COM02X-RETURN-ELEVATOR-01', 'Human selection mismatch');
  check(receipt.sourceQa?.path === RETURN_ELEVATOR_TRIAL_QA && receipt.sourceQa.sha256 === qaHash && decisionHashes?.qa === qaHash && receipt.sourceQa.id === 'VQA-COM02X-ELEVATOR-SOURCE-017' && receipt.sourceQa.status === 'FAIL' && qa?.task_id === 'VQA-COM02X-ELEVATOR-SOURCE-017' && qa.status === 'FAIL', 'source QA FAIL history mismatch');
  check(same(receipt.knownIssues, qa.known_issues), 'known issues mismatch');
  check(receipt.scope?.chapterId === 'opening-demo-chapter-01' && same(receipt.scope.nodeIds, nodeIds) && receipt.scope.gallery === false && receipt.scope.canonicalMasterAcceptance === 'NOT_ADOPTED' && receipt.scope.independentDisplayQa === 'PENDING', 'trial scope exceeds authorization');
  const source = catalog?.files?.[sourceId];
  check(source?.sourcePath === originalPath && source.name === original.filename && source.width === 1672 && source.height === 941 && source.mimeType === 'image/png' && source.status === 'preview-only-trial' && source.role === 'human_selected_preview_trial_original' && source.verifiedDecode === true && !source.canonicalAssetId && same(source.knownIssues, qa.known_issues), 'catalog original mismatch');
  const asset = manifest?.assets?.[id];
  check(asset?.kind === 'background' && asset.previewOnly === true && !asset.gallery && !asset.canonicalAssetId && !asset.canonicalCgManifest && !asset.canonicalCgEntry && asset.masterSourceId === sourceId && asset.src === runtimePath && asset.width === 1672 && asset.height === 941 && same(asset.knownIssues, qa.known_issues), 'preview asset mismatch');
  const mapped = sourceMap?.files?.[runtimePath];
  check(mapped?.source === derivativePath && mapped.transform === 'copy' && mapped.masterSourceId === sourceId && same(mapped.conversion, conversion), 'runtime derivative mapping mismatch');
  check(route?.story?.allowPreviewArt === true && route.assetIds?.filter(value => value === id).length === 1, 'route preview opt-in/allowlist mismatch');
  check(!JSON.stringify(route.story).includes(id) && memories && !JSON.stringify(memories).includes(id), 'trial cannot bind title/ending/Memory/Gallery');
  const bindings = Object.entries(chapter?.nodes || {}).filter(([, node]) => node.visual?.background === id || node.visual?.asset === id);
  check(same(bindings.map(([nodeId]) => nodeId), nodeIds) && bindings.every(([, node]) => same(node.visual, { mode: 'composite', background: id, sprites: [] })), 'exact two composite node bindings mismatch');
  if (verifyFiles) {
    for (const file of [original, derivative]) {
      const bytes = fs.readFileSync(file.sourcePath);
      check(bytes.length > 0, 'empty image source');
    }
  }
  return 1;
}

/** Optional crops are reproducible references, not original ingest receipts or QA approval. */
export function validateDerivedWardrobeSources(catalog, registry = readJson('content/assets/character-reference-packs.json')) {
  const identities = new Set(), paths = new Set();
  const derived = Object.entries(catalog.files).filter(([, source]) => source.derivation !== undefined);
  for (const [id, source] of derived) {
    const d = source.derivation;
    invariant(source.status === 'optional-reference' || source.status === 'active-production', `invalid derived reference status: ${id}`);
    invariant(id.startsWith(`ref.${source.characterId}.`) && id !== d?.sourceId
      && catalog.files[d?.sourceId] && !catalog.files[d.sourceId].derivation, `invalid derived original source: ${id}`);
    invariant(source.sourcePath?.endsWith('.png') && path.posix.normalize(source.sourcePath) === source.sourcePath
      && !source.sourcePath.includes('\\') && !Object.entries(catalog.files).some(([otherId, other]) => otherId !== id && other.sourcePath === source.sourcePath), `derived reference path collision/format: ${id}`);
    validateWardrobeDerivation({ ...source, status: 'active-production' },
      { characterId: source.characterId, wardrobeKey: d.wardrobeKey, variant: d.variant }, catalog, registry);
    const identity = `${source.characterId}:${d.wardrobeKey}:${d.variant}`;
    invariant(!identities.has(identity) && !paths.has(source.sourcePath), `duplicate derived reference identity/path: ${id}`);
    identities.add(identity); paths.add(source.sourcePath);
  }
  return derived.map(([id]) => id);
}

function validateGate3RepositorySources(catalog) {
  validateRepoSourceCatalog(catalog);
  const receipt = readJson(GATE3_RECEIPT);
  invariant(receipt.receiptVersion === 1 && receipt.gate === 'repo-production-reference-gate3', 'Gate 3 repository source receipt identity is invalid');
  invariant(receipt.sourceCatalog === SOURCE_CATALOG, 'Gate 3 receipt must bind the active source catalog');
  invariant(Array.isArray(receipt.acceptedAssets) && receipt.acceptedAssets.length === 15, 'Gate 3 receipt must contain 15 accepted Opening assets');
  invariant(Array.isArray(receipt.references) && receipt.references.length === 5, 'Gate 3 receipt must contain four PNG references and the optional supplied JPEG');
  const acceptedIds = new Set();
  for (const item of receipt.acceptedAssets) {
    invariant(!acceptedIds.has(item.canonicalAssetId), `duplicate accepted canonicalAssetId: ${item.canonicalAssetId}`);
    acceptedIds.add(item.canonicalAssetId);
    const source = catalog.files[item.sourceId];
    invariant(source && source.canonicalAssetId === item.canonicalAssetId && source.logicalAssetId === item.logicalAssetId, `accepted receipt identity mismatch: ${item.sourceId}`);
    invariant(source.sourcePath === item.repoPath && source.name === item.acceptedFilename, `accepted receipt path/name mismatch: ${item.sourceId}`);
    invariant(JSON.stringify(source.knownIssues ?? []) === JSON.stringify(item.knownIssues), `accepted receipt knownIssues mismatch: ${item.sourceId}`);
  }
  const restoration = readJson('content/assets/ingest-receipts/character-reference-packs-20260930.json');
  invariant(restoration.receiptVersion === 1 && restoration.gate === 'complete-character-reference-packs' && restoration.sourceCatalog === SOURCE_CATALOG, 'invalid character pack restoration receipt');
  invariant(restoration.references.length === 12, 'restoration receipt requires 12 PNG sheets');
  const wardrobeReplacement = readJson('content/assets/ingest-receipts/jiang-yucheng-wardrobe-replacement-20261003.json');
  const previousWardrobes = validateCharacterWardrobeReplacementReceipt(wardrobeReplacement, restoration,
    sha256(fs.readFileSync('content/assets/ingest-receipts/character-reference-packs-20260930.json')), catalog);
  const restoredIds = new Set();
  for (const item of restoration.references) {
    invariant(!restoredIds.has(item.sourceId), `duplicate restored source ID: ${item.sourceId}`);
    restoredIds.add(item.sourceId);
    const source = previousWardrobes.get(item.sourceId) ?? catalog.files[item.sourceId];
    for (const key of ['name', 'sourcePath', 'width', 'height', 'mimeType', 'status', 'characterId', 'role']) invariant(source?.[key] === item[key], `restored reference ${key} mismatch: ${item.sourceId}`);
  }
  validateCharacterReferencePacks(catalog);
  const linRuoqingReceipt = readJson('content/assets/ingest-receipts/lin-ruoqing-reference-pack-20261003.json');
  const linRuoqingIds = validateCharacterReferencePackReceipt(linRuoqingReceipt, 'lin_ruoqing', catalog);
  const shenYingxueReceipt = readJson('content/assets/ingest-receipts/shen-yingxue-reference-pack-20261003.json');
  const shenYingxueIds = validateCharacterReferencePackReceipt(shenYingxueReceipt, 'shen_yingxue', catalog);
  invariant(shenYingxueReceipt.heightLabelOverride?.canonicalHeightCm === 172 && shenYingxueReceipt.heightLabelOverride?.embeddedHeightLabelCm === 175, 'Shen Yingxue requires the explicit 172 cm canonical / 175 cm embedded-label override');
  invariant(sha256(fs.readFileSync(shenYingxueReceipt.canonicalProfile)) === shenYingxueReceipt.canonicalProfileSha256, 'Shen Yingxue canonical profile changed after the scoped height-label override');
  const referenceIds = new Set();
  for (const item of receipt.references) {
    invariant(!referenceIds.has(item.sourceId), `duplicate reference sourceId: ${item.sourceId}`);
    referenceIds.add(item.sourceId);
    const superseded = restoration.supersededReferences.find((record) => record.sourceId === item.sourceId);
    if (superseded) invariant(catalog.files[item.sourceId]?.sourcePath === restoration.references.find((current) => current.sourceId === item.sourceId)?.sourcePath, `superseded replacement locator mismatch: ${item.sourceId}`);
    const source = superseded?.previous ?? previousWardrobes.get(item.sourceId) ?? catalog.files[item.sourceId];
    invariant(source && item.sourceId.startsWith('ref.'), `reference receipt source is missing or invalid: ${item.sourceId}`);
    for (const [receiptKey, catalogKey] of [['repoPath', 'sourcePath'], ['width', 'width'], ['height', 'height'], ['mimeType', 'mimeType'], ['status', 'status'], ['characterId', 'characterId'], ['role', 'role']]) {
      invariant(source[catalogKey] === item[receiptKey], `reference receipt ${receiptKey} mismatch: ${item.sourceId}`);
    }
  }
  invariant([...referenceIds].some((id) => id === 'ref.xu_tang.body.03'), 'Gate 3 receipt must include the user-provided Xu Tang body JPEG');
  invariant(receipt.references.filter((item) => item.mimeType === 'image/png').length === 4 && receipt.references.filter((item) => item.mimeType === 'image/jpeg').length === 1, 'Gate 3 references must be four PNGs plus one JPEG');
  invariant(acceptedIds.size === 15 && referenceIds.size === 5, 'Gate 3 accepted source IDs must be unique');
  const currentReference = readJson(COM02X_REFERENCE_RECEIPT);
  const currentId = 'ref.com02x.environment.convenience_night';
  const currentSource = catalog.files[currentId];
  invariant(currentReference.receiptVersion === 1 && currentReference.receiptType === 'supporting-environment-reference-source', 'COM-02X reference receipt identity is invalid');
  invariant(currentReference.sourceId === currentId && currentReference.role === 'environment_reference', 'COM-02X reference receipt source identity is invalid');
  invariant(currentReference.acceptanceScope === 'supporting_environment_reference_only' && currentReference.runtimeMasterAcceptance === 'NOT_ACCEPTED', 'COM-02X reference receipt exceeds supporting-reference scope');
  invariant(currentReference.currentReferenceQa?.taskId === 'VQA-ENV-COM02X-002' && currentReference.currentReferenceQa?.result === 'PASS', 'COM-02X reference receipt lacks the current QA decision');
  invariant(currentSource && currentSource.role === currentReference.role && currentSource.sourcePath === currentReference.sourcePath && currentSource.name === currentReference.filename, 'COM-02X reference catalog identity mismatch');
  for (const key of ['mimeType', 'width', 'height']) invariant(currentSource[key] === currentReference[key], `COM-02X reference catalog ${key} mismatch`);
  invariant(currentSource.status === 'optional-reference' && currentSource.verifiedDecode === true, 'COM-02X source must remain a decoded optional reference');
  const acceptedBatch = readJson(COM02X_ACCEPTED_MASTERS_RECEIPT);
  invariant(acceptedBatch.receiptVersion === 1 && acceptedBatch.receiptType === 'human-accepted-master-batch', 'COM-02X accepted-master receipt identity is invalid');
  invariant(acceptedBatch.sceneId === 'COM-02X' && acceptedBatch.taskId === 'INTEGRATE-COM02X-001', 'COM-02X accepted-master receipt scope is invalid');
  invariant(acceptedBatch.humanDecision?.decision === 'PASS' && acceptedBatch.humanDecision?.disposition === 'ACCEPTED_AS_IS', 'COM-02X accepted-master receipt lacks the explicit Human override');
  invariant(Array.isArray(acceptedBatch.assets) && acceptedBatch.assets.length === 2, 'COM-02X accepted-master receipt must contain exactly two assets');
  const batchIds = new Set();
  for (const item of acceptedBatch.assets) {
    invariant(!batchIds.has(item.sourceId) && item.sourceId.startsWith('source.com02x.'), `duplicate or invalid COM-02X accepted source: ${item.sourceId}`);
    batchIds.add(item.sourceId);
    const source = catalog.files[item.sourceId];
    invariant(source && source.name === item.filename && source.sourcePath === item.masterPath, `COM-02X accepted source path/name mismatch: ${item.sourceId}`);
    for (const key of ['width', 'height', 'mimeType']) invariant(source[key] === item[key], `COM-02X accepted source ${key} mismatch: ${item.sourceId}`);
    invariant(source.verifiedDecode === true && source.status === 'human-accepted-as-is', `COM-02X accepted source status/decode mismatch: ${item.sourceId}`);
    invariant(item.width === 1672 && item.height === 941 && item.mimeType === 'image/png', `COM-02X source exceeds scoped acceptance: ${item.sourceId}`);
    invariant(item.visualQaStatus === 'FAIL' && item.humanDisposition === 'ACCEPTED_AS_IS', `COM-02X QA history/override mismatch: ${item.sourceId}`);
  }
  invariant(batchIds.size === 2 && batchIds.has('source.com02x.bg-01') && batchIds.has('source.com02x.dlg-01'), 'COM-02X accepted source set changed');
  const component = readJson('content/assets/ingest-receipts/com02x-walk-character-continuity-v1.json');
  const componentId = 'ref.com02x.walk.character_continuity_v1';
  const componentSource = catalog.files[componentId];
  invariant(component.receiptVersion === 1 && component.receiptType === 'human-approved-character-component-reference-source' && component.sourceId === componentId, 'COM-02X character component receipt identity is invalid');
  invariant(component.acceptanceScope === 'character_appearance_expression_pose_only' && component.runtimeMasterAcceptance === 'NOT_ACCEPTED' && component.backgroundAcceptance === 'REJECTED' && component.runtimeAssetId === null && component.galleryAssetId === null, 'COM-02X character component receipt exceeds Human scope');
  invariant(componentSource?.name === component.filename && componentSource?.sourcePath === component.sourcePath && componentSource?.status === 'optional-reference' && componentSource?.verifiedDecode === true && componentSource?.role === 'accepted_character_continuity' && componentSource?.characterId === 'xu_tang', 'COM-02X character component catalog identity mismatch');
  for (const key of ['mimeType', 'width', 'height']) invariant(componentSource[key] === component[key], 'COM-02X character component catalog ' + key + ' mismatch');
  const componentHuman = readJson(component.humanDecision.decisionPath);
  invariant(sha256(fs.readFileSync(component.humanDecision.decisionPath)) === component.humanDecision.sha256 && componentHuman.gate === 'accepted_character_component_reference' && componentHuman.decision === 'PASS' && componentHuman.character_changes_authorized === false, 'COM-02X character component Human approval mismatch');
  const microwave = readJson('content/assets/ingest-receipts/com02x-microwave-accepted-master-v1.json');
  invariant(microwave.receiptVersion === 1 && microwave.receiptType === 'human-accepted-master-batch' && microwave.sceneId === 'COM-02X' && microwave.taskId === 'INTEGRATE-COM02X-CLEANUP-005' && microwave.assets.length === 1, 'COM-02X microwave receipt identity/scope is invalid');
  const microwaveHuman = readJson(microwave.humanDecision.path);
  invariant(sha256(fs.readFileSync(microwave.humanDecision.path)) === microwave.humanDecision.sha256 && microwaveHuman.decision === 'PASS' && microwaveHuman.qa_history_preserved === true, 'COM-02X microwave Human approval mismatch');
  const microwaveAsset = microwave.assets[0];
  const microwaveSelection = microwaveHuman.accepted_assets.find((asset) => asset.entry_id === microwaveAsset.entryId);
  const microwaveSource = catalog.files[microwaveAsset.sourceId];
  invariant(microwaveAsset.sourceId === 'source.com02x.microwave' && microwaveAsset.entryId === 'COM02X-DLG-02-MICROWAVE' && microwaveAsset.logicalId === 'cg.opening.com02x.microwave_wait' && microwaveAsset.canonicalId === 'CG-COM02X-MICROWAVE-WAIT', 'COM-02X microwave accepted source identity mismatch');
  invariant(microwaveSelection?.human_disposition === microwaveAsset.humanDisposition && microwaveAsset.humanDisposition === 'ACCEPTED_AS_IS' && microwaveSelection.visual_qa_status === microwaveAsset.visualQaStatus && microwaveAsset.visualQaStatus === 'FAIL', 'COM-02X microwave QA history/override mismatch');
  invariant(JSON.stringify(microwaveSelection.accepted_known_issues) === JSON.stringify(microwaveAsset.acceptedKnownIssues), 'COM-02X microwave known issue scope mismatch');
  invariant(microwaveSource?.name === microwaveAsset.filename && microwaveSource?.sourcePath === microwaveAsset.masterPath && microwaveSource?.status === 'human-accepted-as-is' && microwaveSource?.verifiedDecode === true, 'COM-02X microwave catalog identity/status mismatch');
  for (const key of ['mimeType', 'width', 'height']) invariant(microwaveSource[key] === microwaveAsset[key], 'COM-02X microwave catalog ' + key + ' mismatch');
  invariant(microwaveAsset.width === microwaveSelection.width && microwaveAsset.height === microwaveSelection.height && microwaveAsset.mimeType === 'image/png', 'COM-02X microwave accepted dimensions/format mismatch');
  invariant(fs.statSync(microwaveAsset.derivativePath).isFile() && fs.statSync(microwaveAsset.derivativePath).size > 0, 'COM-02X microwave derivative fingerprint mismatch');
  const microwaveManifest = readJson('content/production/cg-manifests/opening-ch1-com02x-microwave.json');
  invariant(microwaveManifest.entries.length === 1 && microwaveManifest.entries[0].entry_id === microwaveAsset.entryId && microwaveManifest.entries[0].status === 'accepted', 'COM-02X microwave manifest accepted status mismatch');
  invariant(JSON.stringify(microwaveManifest.entries[0].known_issues) === JSON.stringify(microwaveAsset.acceptedKnownIssues.map((issue) => issue.code + ': ' + issue.detail)), 'COM-02X microwave manifest accepted issues mismatch');
  const walk = readJson('content/assets/ingest-receipts/com02x-walk-adopted-master-v3.json');
  invariant(walk.receiptVersion === 1 && walk.receiptType === 'human-adopted-master-batch' && walk.sceneId === 'COM-02X' && walk.taskId === 'INTEGRATE-COM02X-VISUAL-BINDINGS-006' && walk.assets.length === 1, 'COM-02X walking adoption receipt scope is invalid');
  const walkHuman = readJson(walk.humanDecision.path);
  const walkAsset = walk.assets[0];
  const walkSource = catalog.files[walkAsset.sourceId];
  const walkSha = 'a1aa0d08023cc19a42b3c9260bca732059e77eb5dd37c8578afb82bd7dd82400';
  invariant(sha256(fs.readFileSync(walk.humanDecision.path)) === walk.humanDecision.sha256 && walkHuman.task_id === 'HUMAN-COM02X-WALK-ADOPTION-003' && walkHuman.status === 'HUMAN_ACCEPTED_AS_IS' && walkHuman.output_versions.some(item => item.id === 'accepted-master:COM02X-WALK-01:v3'), 'COM-02X exact walking Human adoption mismatch');
  invariant(walk.humanDecision.status === walkHuman.status && !Object.hasOwn(walk.humanDecision, 'decision') && walk.humanDecision.qaHistoryPreserved === true, 'COM-02X walking adoption must not invent a literal Human PASS');
  invariant(walkAsset.sourceId === 'source.com02x.walk-v3' && walkAsset.entryId === 'COM02X-WALK-01' && walkAsset.logicalId === 'cg.opening.com02x.walk_home' && walkAsset.canonicalId === 'CG-COM02X-WALK-01', 'COM-02X walking identity mismatch');
  invariant(walkAsset.width === 1672 && walkAsset.height === 941 && walkAsset.mimeType === 'image/png' && walkAsset.visualQaStatus === 'FAIL' && walkAsset.humanDisposition === 'ACCEPTED_AS_IS', 'COM-02X walking acceptance exceeds its exact as-is scope');
  invariant(walkSource?.name === walkAsset.filename && walkSource?.sourcePath === walkAsset.masterPath && walkSource?.status === 'human-accepted-as-is' && walkSource?.verifiedDecode === true, 'COM-02X walking catalog identity/status mismatch');
  for (const key of ['mimeType', 'width', 'height']) invariant(walkSource[key] === walkAsset[key], 'COM-02X walking catalog ' + key + ' mismatch');
  const walkQa = readJson(walk.visualQa.path);
  invariant(sha256(fs.readFileSync(walk.visualQa.path)) === walk.visualQa.sha256 && walkQa.task_id === 'VQA-COM02X-WALK-003' && walkQa.status === 'FAIL' && walk.visualQa.status === 'FAIL' && walkAsset.visualQaReceipt === walk.visualQa.path, 'COM-02X original walking Visual QA must remain FAIL');
  invariant(JSON.stringify(walkAsset.acceptedKnownIssues) === JSON.stringify(walkQa.known_issues), 'COM-02X walking known issues changed');
  invariant(fs.statSync(walkAsset.masterPath).isFile() && fs.statSync(walkAsset.masterPath).size > 0, 'COM-02X walking original PNG fingerprint mismatch');
  invariant(fs.statSync(walkAsset.derivativePath).isFile() && fs.statSync(walkAsset.derivativePath).size > 0, 'COM-02X walking derivative fingerprint mismatch');
  const walkManifest = readJson('content/production/cg-manifests/opening-ch1-com02x-walk.json');
  invariant(walkManifest.entries.length === 1 && walkManifest.entries[0].entry_id === walkAsset.entryId && walkManifest.entries[0].status === 'accepted' && JSON.stringify(walkManifest.entries[0].known_issues) === JSON.stringify(walkQa.known_issues), 'COM-02X walking manifest adoption/issues mismatch');
  const titleSourceCount = validateTitleMasterSource(catalog);
  const trialSourceCount = validateReturnElevatorTrial({ catalog, manifest: readJson('content/assets/manifest.json'), sourceMap: readJson('content/assets/source-map.json'), route: readJson(OPENING_ROUTE), chapter: readJson('content/routes/opening-demo/chapter-01.json'), memories: readJson('content/routes/opening-demo/memories.json'), receipt: readJson(RETURN_ELEVATOR_TRIAL_RECEIPT), human: readJson(RETURN_ELEVATOR_TRIAL_HUMAN), qa: readJson(RETURN_ELEVATOR_TRIAL_QA), decisionHashes: { human: sha256(fs.readFileSync(RETURN_ELEVATOR_TRIAL_HUMAN)), qa: sha256(fs.readFileSync(RETURN_ELEVATOR_TRIAL_QA)) } });
  const derivedIds = validateDerivedWardrobeSources(catalog);
  invariant(trialSourceCount === 1 && Object.keys(catalog.files).length === acceptedIds.size + restoredIds.size + linRuoqingIds.length + shenYingxueIds.length + 1 + batchIds.size + 1 + 1 + 1 + titleSourceCount + trialSourceCount + derivedIds.length, 'source catalog contains an unknown or unreceipted source');
  return receipt;
}

function validateTitleMasterSource(catalog) {
  const receiptPath = 'content/assets/ingest-receipts/title-master-native-v1.json';
  if (!fs.existsSync(receiptPath)) return 0;
  const receipt = readJson(receiptPath);
  const item = receipt.assets?.[0];
  invariant(receipt.receiptVersion === 1 && receipt.receiptType === 'human-adopted-title-master' && receipt.assets.length === 1 &&
    receipt.sceneId === 'COM-00' && receipt.runId === 'title-key-visual-20261002' && receipt.taskId === 'INTEGRATE-TITLE-MASTER-001', 'invalid title adoption scope');
  invariant(item?.sourceId === 'source.opening.title.17f_doorlight.master' && item.entryId === 'TITLE-17F-DOORLIGHT-01' &&
    item.logicalId === 'bg.opening.title.17f_doorlight' && item.canonicalId === 'BG-TITLE-17F-DOORLIGHT-01' &&
    item.masterPath === 'assets-src/opening-title/title-17f-doorlight-v1.png' && item.width === 1672 && item.height === 941 && item.mimeType === 'image/png', 'title native master identity mismatch');
  const source = catalog.files[item.sourceId];
  invariant(source?.sourcePath === item.masterPath && source?.name === item.filename && source?.status === 'human-accepted-as-is' && source?.verifiedDecode === true, 'title catalog identity mismatch');
  for (const key of ['width', 'height', 'mimeType']) invariant(source[key] === item[key], 'title catalog ' + key + ' mismatch');
  invariant(receipt.humanDecision.path === 'content/production/runs/title-key-visual-20261002/HUMAN-TITLE-MASTER-001.decision.json' &&
    sha256(fs.readFileSync(receipt.humanDecision.path)) === receipt.humanDecision.sha256, 'title Human decision hash mismatch');
  const human = readJson(receipt.humanDecision.path);
  invariant(human.task_id === receipt.humanDecision.id && human.status === 'HUMAN_ACCEPTED_AS_IS' && human.run_id === receipt.runId && human.scene_id === receipt.sceneId &&
    receipt.humanDecision.status === human.status && receipt.humanDecision.disposition === 'ACCEPTED_AS_IS' && receipt.humanDecision.qaHistoryPreserved === true &&
    human.output_versions.some((v) => v.id === 'TITLE-17F-DOORLIGHT-01-selected-master' && v.location === item.masterPath), 'title exact Human selection mismatch');
  invariant(receipt.visualQa.path === 'content/production/runs/title-key-visual-20261002/VQA-TITLE-17F-001.decision.json' &&
    sha256(fs.readFileSync(receipt.visualQa.path)) === receipt.visualQa.sha256 && readJson(receipt.visualQa.path).status === 'NEEDS_REVIEW' &&
    receipt.visualQa.status === 'NEEDS_REVIEW' && item.visualQaStatus === 'NEEDS_REVIEW' && item.visualQaReceipt === receipt.visualQa.path, 'title historical QA must remain NEEDS_REVIEW');
  invariant(JSON.stringify(item.acceptedKnownIssues) === JSON.stringify(readJson(receipt.visualQa.path).known_issues), 'title QA issue history mismatch');
  const asset = readJson('content/assets/manifest.json').assets[item.logicalId];
  const mapped = readJson('content/assets/source-map.json').files[asset?.src];
  invariant(asset?.kind === 'background' && !asset.gallery && !asset.previewOnly && asset.canonicalAssetId === item.canonicalId && asset.masterSourceId === item.sourceId &&
    asset.focus?.x === 50 && asset.focus?.y === 40 && asset.src === item.runtimePath && mapped?.source === item.derivativePath && mapped.masterSourceId === item.sourceId &&
    mapped.transform === 'copy', 'title runtime background binding mismatch');
  invariant(fs.statSync(item.derivativePath).isFile() && fs.statSync(item.derivativePath).size > 0, 'title derivative fingerprint mismatch');
  const title = readJson('content/production/cg-manifests/title-screen.json');
  invariant(title.entries.length === 1 && title.entries[0].status === 'accepted' && title.entries[0].entry_id === item.entryId, 'title adoption manifest mismatch');
  invariant(receipt.renderProvenance.originalGenerationRef === 'a4e6e1b6e89c3d6dc180755842343230398e3403' &&
    receipt.renderProvenance.originalGenerationManifestSha256 === '3ac8f4d3e48a9a6b8c0a32b2c1c66dabb16323ce59c4accd2517396a965ce196' &&
    receipt.renderProvenance.originalRenderPacketSha256 === 'eec7d64265347a8961e9d3cf3db42ed1b52306f3460f4e02ef8433d84428bff9', 'title original generation provenance mismatch');
  return 1;
}

function validateManifestRepositoryReferences(manifest, catalog, context) {
  for (const entry of manifest.entries) {
    for (const binding of entry.reference_transport.attachments) {
      invariant(!binding.source_id.startsWith('gdrive:'), `${context} ${entry.entry_id} cannot use a Drive reference`);
      if (binding.role === 'accepted_base') {
        const matches = Object.values(catalog.files).filter((source) => source.canonicalAssetId === binding.source_id);
        invariant(matches.length === 1 && matches[0].name === binding.expected_filename, `${context} ${entry.entry_id} accepted base cannot be resolved exactly: ${binding.source_id}`);
      } else {
        invariant(binding.source_id.startsWith('source.') || binding.source_id.startsWith('ref.'), `${context} ${entry.entry_id} has unsupported repository reference: ${binding.source_id}`);
        const source = catalog.files[binding.source_id];
        invariant(source?.name === binding.expected_filename, `${context} ${entry.entry_id} repository reference cannot be resolved exactly: ${binding.source_id}`);
      }
    }
  }
}

export function validateManifestSceneBindings(manifest, manifestPath, contracts, { requireSceneBacklink = false } = {}) {
  const byScene = new Map(contracts.map((contract) => [contract.scene_id, contract]));
  for (const sceneId of manifest.source_scene_ids) {
    invariant(byScene.has(sceneId), `${manifestPath}: scene ${sceneId} has no Narrative Continuity Contract`);
    invariant(manifest.entries.some((entry) => entry.scene_id === sceneId), `${manifestPath}: no entry for ${sceneId}`);
  }
  for (const entry of manifest.entries) {
    const expectedScene = byScene.get(entry.scene_id)?.source_scene;
    invariant(entry.source_scene === expectedScene, `${manifestPath} entry ${entry.entry_id}: source_scene does not match ${entry.scene_id} Narrative Continuity Contract`);
    if (requireSceneBacklink) {
      invariant(readText(expectedScene).includes(manifestPath), `${expectedScene} does not bind ${manifestPath}`);
    }
  }
}

function validateManifestIdentities(manifests) {
  const identities = new Map();
  function unique(kind, id, file) {
    const key = `${kind}\u0000${id}`;
    const previous = identities.get(key);
    invariant(!previous, `${file}: duplicate ${kind} ${id} in ${previous}`);
    identities.set(key, file);
  }
  for (const [file, manifest] of manifests) {
    unique('manifest_id', manifest.manifest_id, file);
    for (const entry of manifest.entries) {
      unique('entry_id', entry.entry_id, file);
      unique('canonical_asset_id', entry.output.canonical_asset_id, file);
      unique('logical_asset_id', entry.output.logical_asset_id, file);
    }
  }
}

function validateOpeningMigration(manifest, catalog, gate3Receipt) {
  const receipt = readJson(OPENING_RECEIPT);
  const receiptCgs = receipt.inventory.filter((item) => item.kind === 'cg');
  const receiptCanonicalIds = new Set(receiptCgs.map((item) => item.canonicalAssetId));
  const receiptLogicalIds = new Set(receiptCgs.map((item) => item.logicalAssetId));
  const manifestCanonicalIds = new Set(manifest.entries.map((entry) => entry.output.canonical_asset_id));
  const manifestLogicalIds = new Set(manifest.entries.map((entry) => entry.output.logical_asset_id));
  invariant(receiptCanonicalIds.size === manifestCanonicalIds.size && [...receiptCanonicalIds].every((id) => manifestCanonicalIds.has(id)), 'manifest canonical CG IDs do not exactly match Opening Chapter 1 receipt');
  invariant(receiptLogicalIds.size === manifestLogicalIds.size && [...receiptLogicalIds].every((id) => manifestLogicalIds.has(id)), 'manifest logical CG IDs do not exactly match Opening Chapter 1 receipt');
  for (const receiptItem of receiptCgs) {
    const entry = manifest.entries.find((candidate) => candidate.output.canonical_asset_id === receiptItem.canonicalAssetId);
    invariant(Boolean(entry.known_issues?.length) === Boolean(receiptItem.knownIssues?.length), `${entry.entry_id} known issue state does not match receipt`);
  }

  const route = readJson(OPENING_ROUTE);
  const routeAssets = new Set(route.assetIds);
  invariant([...manifestLogicalIds].every((id) => routeAssets.has(id)), 'Opening route does not allow every manifest logical asset ID');
  invariant(manifest.entries.every((entry) => entry.status === 'accepted'), 'Opening migration entries must represent accepted demo assets');
  invariant(manifest.entries.length === 8, 'Opening canonical CG manifest must contain eight accepted CG entries');
  for (const entry of manifest.entries) {
    const accepted = gate3Receipt.acceptedAssets.find((item) => item.canonicalAssetId === entry.output.canonical_asset_id);
    invariant(accepted && accepted.logicalAssetId === entry.output.logical_asset_id, `${entry.entry_id} is not a Gate 3 accepted asset`);
    invariant(entry.output.master_filename === accepted.acceptedFilename, `${entry.entry_id} output filename does not match Gate 3 accepted representation`);
  }
  validateManifestRepositoryReferences(manifest, catalog, 'Opening manifest');

  const [packet] = buildPackets(manifest, {
    entryIds: ['COM01X-BASE-NORMAL'],
    statuses: new Set(['accepted'])
  });
  const chatManual = adaptChatManual([packet]);
  const workBatch = JSON.parse(adaptWorkBatch([packet]).trim());
  const apiJob = JSON.parse(adaptApi([packet])).jobs[0];
  invariant(chatManual.includes(packet.shared_prompt.trimEnd()), 'Chat manual adapter changed the canonical shared prompt');
  invariant(chatManual.includes('Attachment checklist'), 'Chat manual adapter lost the Human attachment checklist');
  invariant(workBatch.shared_prompt === packet.shared_prompt, 'Work batch adapter changed the canonical shared prompt');
  invariant(workBatch.reference_acquisition.method === 'repo_file', 'Work batch adapter did not request repository-file acquisition');
  invariant(workBatch.reference_acquisition.source_catalog === SOURCE_CATALOG, 'Work batch adapter points to the wrong source catalog');
  invariant(JSON.stringify(workBatch.reference_acquisition.required_bindings) === JSON.stringify(packet.reference_transport.attachments), 'Work batch adapter changed required reference bindings');
  invariant(workBatch.reference_acquisition.resolved_files.length === packet.reference_transport.attachments.length, 'Work batch adapter resolved unrelated or missing files');
  invariant(workBatch.reference_acquisition.resolved_files.every((file) => file.sourcePath.startsWith('assets-src/')), 'Work batch adapter returned a non-repository reference path');
  invariant(apiJob.input.prompt === packet.shared_prompt, 'API adapter changed the canonical shared prompt');
  invariant(workBatch.shared_prompt_sha256 === apiJob.provenance.shared_prompt_sha256, 'adapter prompt hashes differ');
}

export function validateProductionContracts() {
  validateProductionStorage();
  validateActiveWorkflowBoundary();
  validateOrchestrationContract();
  const narrativeFiles = listJsonFiles(NARRATIVE_ROOT);
  invariant(narrativeFiles.length > 0, 'no Narrative Continuity Contracts found');
  const contracts = narrativeFiles.map((file) => validateNarrativeContract(readJson(file), file));
  const manifestFiles = listJsonFiles(CG_MANIFEST_ROOT);
  invariant(manifestFiles.includes(OPENING_MANIFEST) && manifestFiles.includes(COM01B_MANIFEST),
    'required Opening CG manifest is missing');
  const manifests = manifestFiles.map((file) => [file, validateManifest(readJson(file))]);
  validateManifestIdentities(manifests);
  const catalog = readJson(SOURCE_CATALOG);
  const gate3Receipt = validateGate3RepositorySources(catalog);
  for (const [file, manifest] of manifests) {
    validateManifestSceneBindings(manifest, file, contracts, { requireSceneBacklink: file === OPENING_MANIFEST });
    validateManifestRepositoryReferences(manifest, catalog, file);
  }
  const manifest = manifests.find(([file]) => file === OPENING_MANIFEST)[1];
  validateOpeningMigration(manifest, catalog, gate3Receipt);
  return { narrativeContracts: contracts.length,
    cgEntries: manifests.reduce((count, [, item]) => count + item.entries.length, 0) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { narrativeContracts, cgEntries } = validateProductionContracts();
    process.stdout.write(`Validated ${narrativeContracts} Narrative Continuity Contracts and ${cgEntries} CG Manifest Entries.\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
