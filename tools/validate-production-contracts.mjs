import fs from 'node:fs';
import path from 'node:path';

import {
  adaptApi,
  adaptChatManual,
  adaptWorkBatch,
  buildPackets,
  validateManifest
} from './render-cg-packets.mjs';

const NARRATIVE_ROOT = 'content/production/narrative';
const OPENING_MANIFEST = 'content/production/cg-manifests/opening-ch1.json';
const OPENING_RECEIPT = 'content/assets/ingest-receipts/opening-ch1-demo-v0.1.json';
const OPENING_ROUTE = 'content/routes/opening-demo/route.json';
const SOURCE_CATALOG = 'content/assets/source-catalog.json';
const ORCHESTRATION = '.ai/PRODUCTION_ORCHESTRATION.md';
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

function validateNarrativeContract(contract, file) {
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

  const sceneText = readText(contract.source_scene);
  invariant(sceneText.includes(file), `${contract.source_scene} does not bind narrative contract ${file}`);
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
    OPENING_MANIFEST
  ];
  const activeText = activeFiles.map(readText).join('\n');
  for (const oldPath of OLD_ACTIVE_PATHS) invariant(!activeText.includes(oldPath), `active production source references obsolete path: ${oldPath}`);
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
  for (const [name, value] of [['bootstrap', bootstrap], ['context isolation', isolation], ['orchestration', contract]]) {
    invariant(/fresh bounded worker|fresh worker\/session/.test(value), `${name} lost fresh-worker requirement`);
  }
  invariant(contract.includes('Continuity lives in canonical artifacts, not worker memory.'), 'orchestration lost artifact continuity principle');
  invariant(contract.includes('MUST NOT directly generate CG candidates'), 'orchestration lost parent renderer prohibition');
  invariant(contract.includes('READY_FOR_HUMAN_ACCEPTANCE') && contract.includes('preview:smoke'), 'orchestration lost playable definition of done');
  for (const field of ['run_id:', 'task_id:', 'task_type:', 'depends_on:', 'harness:', 'pass:', 'objective:', 'required_acquisition:', 'allowed_sources:', 'input_versions:', 'constraints:', 'deliverables:', 'acceptance:', 'handoff_to:', 'human_gate:']) {
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

function validateOpeningMigration(contracts, manifest) {
  const contractSceneIds = new Set(contracts.map((contract) => contract.scene_id));
  invariant(manifest.source_scene_ids.every((sceneId) => contractSceneIds.has(sceneId)), 'CG manifest scene has no Narrative Continuity Contract');

  for (const sceneId of manifest.source_scene_ids) {
    const sourceScene = manifest.entries.find((entry) => entry.scene_id === sceneId)?.source_scene;
    invariant(sourceScene, `manifest has no entry for ${sceneId}`);
    const sceneText = readText(sourceScene);
    invariant(sceneText.includes(OPENING_MANIFEST), `${sourceScene} does not bind ${OPENING_MANIFEST}`);
  }

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
    invariant(entry.output.master_filename === receiptItem.canonicalFilename, `${entry.entry_id} master filename does not match receipt`);
    invariant(Boolean(entry.known_issues?.length) === Boolean(receiptItem.knownIssues?.length), `${entry.entry_id} known issue state does not match receipt`);
  }

  const route = readJson(OPENING_ROUTE);
  const routeAssets = new Set(route.assetIds);
  invariant([...manifestLogicalIds].every((id) => routeAssets.has(id)), 'Opening route does not allow every manifest logical asset ID');
  invariant(manifest.entries.every((entry) => entry.status === 'accepted'), 'Opening migration entries must represent accepted demo assets');

  const catalogFiles = readJson(SOURCE_CATALOG).files;
  for (const entry of manifest.entries) {
    for (const binding of entry.reference_transport.attachments) {
      if (binding.source_id.startsWith('gdrive:')) {
        invariant(binding.source_id.length > 'gdrive:'.length, `${entry.entry_id} has an empty Drive reference ID`);
      } else if (binding.source_id.startsWith('source.')) {
        const source = catalogFiles[binding.source_id];
        invariant(source?.fileId && source.name === binding.expected_filename, `${entry.entry_id} source catalog reference cannot be resolved exactly: ${binding.source_id}`);
      } else if (binding.role === 'accepted_base') {
        const matches = Object.values(catalogFiles).filter((source) => source.canonicalAssetId === binding.source_id);
        invariant(matches.length === 1 && matches[0].fileId && matches[0].name === binding.expected_filename, `${entry.entry_id} accepted base cannot be resolved exactly: ${binding.source_id}`);
      } else {
        invariant(false, `${entry.entry_id} has unsupported Work reference source: ${binding.source_id}`);
      }
    }
  }

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
  invariant(workBatch.reference_acquisition.method === 'connected_source', 'Work batch adapter did not request connected-source acquisition');
  invariant(workBatch.reference_acquisition.source_catalog === SOURCE_CATALOG, 'Work batch adapter points to the wrong source catalog');
  invariant(JSON.stringify(workBatch.reference_acquisition.required_bindings) === JSON.stringify(packet.reference_transport.attachments), 'Work batch adapter changed required reference bindings');
  invariant(apiJob.input.prompt === packet.shared_prompt, 'API adapter changed the canonical shared prompt');
  invariant(workBatch.shared_prompt_sha256 === apiJob.provenance.shared_prompt_sha256, 'adapter prompt hashes differ');
}

function main() {
  validateActiveWorkflowBoundary();
  validateOrchestrationContract();
  const narrativeFiles = listJsonFiles(NARRATIVE_ROOT);
  invariant(narrativeFiles.length > 0, 'no Narrative Continuity Contracts found');
  const contracts = narrativeFiles.map((file) => validateNarrativeContract(readJson(file), file));
  const manifest = validateManifest(readJson(OPENING_MANIFEST));
  validateOpeningMigration(contracts, manifest);
  process.stdout.write(`Validated ${contracts.length} Narrative Continuity Contracts and ${manifest.entries.length} Opening Chapter 1 CG Manifest Entries.\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
