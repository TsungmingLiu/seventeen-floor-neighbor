import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKET_VERSION = '1.0.0';
const ADAPTERS = new Set(['chat_manual', 'work_batch', 'api']);
const DEFAULT_STATUSES = new Set(['render_ready']);
const FORBIDDEN_SOURCE_ROOTS = ['.ai/archive/', '.ai/experiments/', 'docs/archive/'];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function requireKeys(object, keys, context) {
  invariant(object && typeof object === 'object' && !Array.isArray(object), `${context} must be an object`);
  for (const key of keys) invariant(Object.hasOwn(object, key), `${context}.${key} is required`);
}

function requireNonEmptyStrings(values, context) {
  invariant(Array.isArray(values) && values.length > 0, `${context} must be a non-empty array`);
  values.forEach((value, index) => invariant(isNonEmpty(value), `${context}[${index}] must be a non-empty string`));
}

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function collectStrings(value, output = []) {
  if (typeof value === 'string') output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, output));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, output));
  return output;
}

function validateReferenceBinding(binding, context) {
  requireKeys(binding, ['role', 'source_id', 'expected_filename'], context);
  for (const key of ['role', 'source_id', 'expected_filename']) {
    invariant(isNonEmpty(binding[key]), `${context}.${key} must be a non-empty string`);
  }
}

function referenceKey(binding) {
  return `${binding.role}\u0000${binding.source_id}\u0000${binding.expected_filename}`;
}

function validateEntry(entry, manifest, entryIds, outputIds) {
  const context = `entry ${entry?.entry_id ?? '<missing>'}`;
  requireKeys(entry, [
    'entry_id', 'scene_id', 'source_scene', 'status', 'cg_class', 'beat_range', 'narrative',
    'characters', 'environment', 'camera', 'continuity', 'composition', 'render_constraints',
    'reference_transport', 'output', 'acceptance'
  ], context);

  for (const key of ['entry_id', 'scene_id', 'source_scene', 'status', 'cg_class', 'beat_range']) {
    invariant(isNonEmpty(entry[key]), `${context}.${key} must be a non-empty string`);
  }
  invariant(['planned', 'render_ready', 'candidate', 'accepted', 'rejected', 'blocked'].includes(entry.status), `${context}.status is invalid`);
  invariant(['background_cg', 'dialogue_cg', 'reaction_cg', 'event_cg', 'cg_sequence_keyframe'].includes(entry.cg_class), `${context}.cg_class is invalid`);
  invariant(!entryIds.has(entry.entry_id), `duplicate entry_id: ${entry.entry_id}`);
  entryIds.add(entry.entry_id);
  invariant(manifest.source_scene_ids.includes(entry.scene_id), `${context}.scene_id is not listed in source_scene_ids`);
  invariant(fs.existsSync(path.resolve(entry.source_scene)), `${context}.source_scene does not exist: ${entry.source_scene}`);

  requireKeys(entry.narrative, ['purpose', 'must_show', 'must_not_imply'], `${context}.narrative`);
  invariant(isNonEmpty(entry.narrative.purpose), `${context}.narrative.purpose must be non-empty`);
  requireNonEmptyStrings(entry.narrative.must_show, `${context}.narrative.must_show`);
  requireNonEmptyStrings(entry.narrative.must_not_imply, `${context}.narrative.must_not_imply`);

  invariant(Array.isArray(entry.characters), `${context}.characters must be an array`);
  if (entry.cg_class === 'background_cg') invariant(entry.characters.length === 0, `${context} background_cg must not declare characters`);
  else invariant(entry.characters.length > 0, `${context} ${entry.cg_class} requires at least one character`);

  const declaredReferences = [];
  const characterIds = new Set();
  entry.characters.forEach((character, index) => {
    const characterContext = `${context}.characters[${index}]`;
    requireKeys(character, [
      'character_id', 'screen_side', 'body_orientation', 'pose', 'gaze', 'expression',
      'wardrobe_key', 'held_objects', 'reference_bindings'
    ], characterContext);
    invariant(isNonEmpty(character.character_id), `${characterContext}.character_id must be non-empty`);
    invariant(!characterIds.has(character.character_id), `${context} repeats character ${character.character_id}`);
    characterIds.add(character.character_id);
    for (const key of ['screen_side', 'body_orientation', 'pose', 'gaze', 'expression', 'wardrobe_key']) {
      invariant(isNonEmpty(character[key]), `${characterContext}.${key} must be non-empty`);
    }
    invariant(Array.isArray(character.held_objects), `${characterContext}.held_objects must be an array`);
    invariant(Array.isArray(character.reference_bindings) && character.reference_bindings.length > 0, `${characterContext}.reference_bindings must be non-empty`);
    character.reference_bindings.forEach((binding, bindingIndex) => {
      validateReferenceBinding(binding, `${characterContext}.reference_bindings[${bindingIndex}]`);
      declaredReferences.push(binding);
    });
  });

  requireKeys(entry.environment, ['location_id', 'time_of_day', 'weather', 'lighting', 'persistent_props', 'reference_binding'], `${context}.environment`);
  for (const key of ['location_id', 'time_of_day', 'weather', 'lighting']) {
    invariant(isNonEmpty(entry.environment[key]), `${context}.environment.${key} must be non-empty`);
  }
  invariant(Array.isArray(entry.environment.persistent_props), `${context}.environment.persistent_props must be an array`);
  if (entry.environment.reference_binding !== null) {
    validateReferenceBinding(entry.environment.reference_binding, `${context}.environment.reference_binding`);
    declaredReferences.push(entry.environment.reference_binding);
  }

  requireKeys(entry.camera, ['shot_size', 'angle', 'pov', 'axis_id', 'camera_side', 'lens_intent'], `${context}.camera`);
  for (const key of ['shot_size', 'angle', 'pov', 'axis_id', 'camera_side', 'lens_intent']) {
    invariant(isNonEmpty(entry.camera[key]), `${context}.camera.${key} must be non-empty`);
  }

  requireKeys(entry.continuity, ['previous_entry_id', 'locked_fields', 'allowed_changes'], `${context}.continuity`);
  invariant(entry.continuity.previous_entry_id === null || isNonEmpty(entry.continuity.previous_entry_id), `${context}.continuity.previous_entry_id must be null or non-empty`);
  invariant(Array.isArray(entry.continuity.locked_fields), `${context}.continuity.locked_fields must be an array`);
  invariant(Array.isArray(entry.continuity.allowed_changes), `${context}.continuity.allowed_changes must be an array`);
  for (const pointer of entry.continuity.locked_fields) invariant(pointer.startsWith('/'), `${context} locked field is not a JSON Pointer: ${pointer}`);

  requireKeys(entry.composition, ['focus', 'dialogue_safe_zone', 'framing_notes'], `${context}.composition`);
  requireKeys(entry.composition.focus, ['x', 'y'], `${context}.composition.focus`);
  for (const key of ['x', 'y']) {
    invariant(Number.isFinite(entry.composition.focus[key]) && entry.composition.focus[key] >= 0 && entry.composition.focus[key] <= 100, `${context}.composition.focus.${key} must be 0..100`);
  }
  invariant(isNonEmpty(entry.composition.dialogue_safe_zone), `${context}.composition.dialogue_safe_zone must be non-empty`);
  requireNonEmptyStrings(entry.composition.framing_notes, `${context}.composition.framing_notes`);

  requireKeys(entry.render_constraints, ['include', 'exclude', 'text_policy'], `${context}.render_constraints`);
  requireNonEmptyStrings(entry.render_constraints.include, `${context}.render_constraints.include`);
  requireNonEmptyStrings(entry.render_constraints.exclude, `${context}.render_constraints.exclude`);
  invariant(isNonEmpty(entry.render_constraints.text_policy), `${context}.render_constraints.text_policy must be non-empty`);

  const transport = entry.reference_transport;
  requireKeys(transport, ['mode', 'fresh_session_required', 'no_unrelated_images_allowed', 'accepted_base_asset_id', 'attachments'], `${context}.reference_transport`);
  invariant(['human_attachment_required', 'edit_from_accepted_base', 'none'].includes(transport.mode), `${context}.reference_transport.mode is invalid`);
  invariant(Array.isArray(transport.attachments), `${context}.reference_transport.attachments must be an array`);
  transport.attachments.forEach((binding, index) => {
    validateReferenceBinding(binding, `${context}.reference_transport.attachments[${index}]`);
    invariant(binding.pixels_must_be_visible === true, `${context}.reference_transport.attachments[${index}].pixels_must_be_visible must be true`);
  });

  if (transport.mode === 'human_attachment_required') {
    invariant(transport.fresh_session_required === true, `${context} Human Attachment Gate requires a fresh session`);
    invariant(transport.no_unrelated_images_allowed === true, `${context} Human Attachment Gate forbids unrelated images`);
    invariant(transport.accepted_base_asset_id === null, `${context} base render cannot declare accepted_base_asset_id`);
    const declared = new Set(declaredReferences.map(referenceKey));
    const attached = new Set(transport.attachments.map(referenceKey));
    invariant(declared.size === attached.size && [...declared].every((key) => attached.has(key)), `${context} attachments must exactly match character/environment reference bindings`);
  } else if (transport.mode === 'edit_from_accepted_base') {
    invariant(entry.cg_class === 'reaction_cg' || entry.cg_class === 'cg_sequence_keyframe', `${context} edit mode is only valid for reaction/sequence entries`);
    invariant(isNonEmpty(transport.accepted_base_asset_id), `${context} edit mode requires accepted_base_asset_id`);
    invariant(entry.continuity.previous_entry_id !== null, `${context} edit mode requires previous_entry_id`);
    invariant(entry.continuity.locked_fields.length > 0, `${context} edit mode requires locked_fields`);
    invariant(entry.continuity.allowed_changes.length > 0, `${context} edit mode requires allowed_changes`);
    invariant(transport.attachments.some((binding) => binding.source_id === transport.accepted_base_asset_id), `${context} attachments must include accepted base`);
  } else {
    invariant(entry.cg_class === 'background_cg', `${context} mode none is only valid for background_cg`);
    invariant(transport.attachments.length === 0, `${context} mode none cannot declare attachments`);
    invariant(transport.accepted_base_asset_id === null, `${context} mode none cannot declare accepted base`);
  }

  requireKeys(entry.output, ['canonical_asset_id', 'logical_asset_id', 'master_filename', 'quantity'], `${context}.output`);
  for (const key of ['canonical_asset_id', 'logical_asset_id', 'master_filename']) {
    invariant(isNonEmpty(entry.output[key]), `${context}.output.${key} must be non-empty`);
  }
  invariant(entry.output.quantity === 1, `${context}.output.quantity must be 1`);
  invariant(!outputIds.has(entry.output.logical_asset_id), `duplicate logical_asset_id: ${entry.output.logical_asset_id}`);
  outputIds.add(entry.output.logical_asset_id);
  requireNonEmptyStrings(entry.acceptance, `${context}.acceptance`);
  if (entry.known_issues !== undefined) {
    invariant(Array.isArray(entry.known_issues), `${context}.known_issues must be an array`);
    entry.known_issues.forEach((issue, index) => invariant(isNonEmpty(issue), `${context}.known_issues[${index}] must be non-empty`));
    invariant(entry.status === 'accepted', `${context}.known_issues is migration-only and requires accepted status`);
  }
}

export function validateManifest(manifest) {
  requireKeys(manifest, ['schema_version', 'manifest_id', 'manifest_version', 'lifecycle', 'source_scene_ids', 'style_contract', 'entries'], 'manifest');
  invariant(manifest.schema_version === '1.0.0', 'manifest.schema_version must be 1.0.0');
  invariant(manifest.lifecycle === 'CANONICAL', 'manifest.lifecycle must be CANONICAL');
  invariant(isNonEmpty(manifest.manifest_id), 'manifest.manifest_id must be non-empty');
  invariant(isNonEmpty(manifest.manifest_version), 'manifest.manifest_version must be non-empty');
  requireNonEmptyStrings(manifest.source_scene_ids, 'manifest.source_scene_ids');
  invariant(new Set(manifest.source_scene_ids).size === manifest.source_scene_ids.length, 'manifest.source_scene_ids must be unique');

  requireKeys(manifest.style_contract, ['style_id', 'positive', 'negative', 'aspect_ratio', 'output_count'], 'manifest.style_contract');
  invariant(isNonEmpty(manifest.style_contract.style_id), 'manifest.style_contract.style_id must be non-empty');
  requireNonEmptyStrings(manifest.style_contract.positive, 'manifest.style_contract.positive');
  requireNonEmptyStrings(manifest.style_contract.negative, 'manifest.style_contract.negative');
  invariant(manifest.style_contract.aspect_ratio === '16:9', 'manifest.style_contract.aspect_ratio must be 16:9');
  invariant(manifest.style_contract.output_count === 1, 'manifest.style_contract.output_count must be 1');
  invariant(Array.isArray(manifest.entries) && manifest.entries.length > 0, 'manifest.entries must be non-empty');

  for (const value of collectStrings(manifest)) {
    invariant(!FORBIDDEN_SOURCE_ROOTS.some((root) => value.includes(root)), `manifest contains forbidden source root: ${value}`);
  }

  const entryIds = new Set();
  const outputIds = new Set();
  manifest.entries.forEach((entry) => validateEntry(entry, manifest, entryIds, outputIds));
  for (const entry of manifest.entries) {
    const previous = entry.continuity.previous_entry_id;
    invariant(previous === null || entryIds.has(previous), `entry ${entry.entry_id} references missing previous_entry_id ${previous}`);
    invariant(previous !== entry.entry_id, `entry ${entry.entry_id} cannot reference itself as previous_entry_id`);
    if (entry.reference_transport.mode === 'edit_from_accepted_base') {
      const previousEntry = manifest.entries.find((candidate) => candidate.entry_id === previous);
      const acceptedBase = entry.reference_transport.accepted_base_asset_id;
      invariant(
        acceptedBase === previousEntry.output.canonical_asset_id || acceptedBase === previousEntry.output.logical_asset_id,
        `entry ${entry.entry_id} accepted_base_asset_id must identify previous entry output`
      );
      invariant(
        entry.reference_transport.attachments.some((binding) => binding.role === 'accepted_base' && binding.source_id === acceptedBase),
        `entry ${entry.entry_id} must bind accepted base with role accepted_base`
      );
    }
  }
  return manifest;
}

function numbered(lines) {
  return lines.map((line, index) => `${index + 1}. ${line}`);
}

function section(title, lines) {
  return [`## ${title}`, ...lines, ''];
}

export function projectEntry(manifest, entry) {
  validateManifest(manifest);
  invariant(manifest.entries.some((candidate) => candidate.entry_id === entry.entry_id), `entry is not part of manifest: ${entry.entry_id}`);

  const lines = [
    `# RENDER TASK ${entry.entry_id}`,
    '',
    ...section('OUTPUT IDENTITY', [
      `Manifest: ${manifest.manifest_id}@${manifest.manifest_version}`,
      `Scene: ${entry.scene_id}`,
      `Beat range: ${entry.beat_range}`,
      `CG class: ${entry.cg_class}`,
      `Canonical asset ID: ${entry.output.canonical_asset_id}`,
      `Logical asset ID: ${entry.output.logical_asset_id}`,
      `Master filename: ${entry.output.master_filename}`,
      'Generate exactly 1 image.'
    ]),
    ...section('STYLE CONTRACT', [
      `Style ID: ${manifest.style_contract.style_id}`,
      ...numbered(manifest.style_contract.positive),
      `Aspect ratio: ${manifest.style_contract.aspect_ratio}`,
      'Hard negative style:',
      ...numbered(manifest.style_contract.negative)
    ]),
    ...section('NARRATIVE BOUNDARY', [
      `Purpose: ${entry.narrative.purpose}`,
      'Must show:',
      ...numbered(entry.narrative.must_show),
      'Must not imply:',
      ...numbered(entry.narrative.must_not_imply)
    ])
  ];

  if (entry.characters.length === 0) {
    lines.push(...section('CHARACTERS', ['No visible characters.']));
  } else {
    const characterLines = [];
    entry.characters.forEach((character) => {
      characterLines.push(`Character ${character.character_id}:`);
      characterLines.push(`- screen_side: ${character.screen_side}`);
      characterLines.push(`- body_orientation: ${character.body_orientation}`);
      characterLines.push(`- pose: ${character.pose}`);
      characterLines.push(`- gaze: ${character.gaze}`);
      characterLines.push(`- expression: ${character.expression}`);
      characterLines.push(`- wardrobe_key: ${character.wardrobe_key}`);
      characterLines.push(`- held_objects: ${character.held_objects.length ? character.held_objects.join(' | ') : 'none'}`);
      characterLines.push('- Reference Bindings:');
      character.reference_bindings.forEach((binding) => characterLines.push(`  - ${binding.role}: ${binding.source_id} (${binding.expected_filename})`));
    });
    lines.push(...section('CHARACTERS', characterLines));
  }

  const environmentLines = [
    `location_id: ${entry.environment.location_id}`,
    `time_of_day: ${entry.environment.time_of_day}`,
    `weather: ${entry.environment.weather}`,
    `lighting: ${entry.environment.lighting}`,
    `persistent_props: ${entry.environment.persistent_props.length ? entry.environment.persistent_props.join(' | ') : 'none'}`,
    `environment_reference: ${entry.environment.reference_binding ? `${entry.environment.reference_binding.source_id} (${entry.environment.reference_binding.expected_filename})` : 'none'}`
  ];
  lines.push(...section('ENVIRONMENT', environmentLines));

  lines.push(...section('CAMERA AND COMPOSITION', [
    `shot_size: ${entry.camera.shot_size}`,
    `angle: ${entry.camera.angle}`,
    `pov: ${entry.camera.pov}`,
    `axis_id: ${entry.camera.axis_id}`,
    `camera_side: ${entry.camera.camera_side}`,
    `lens_intent: ${entry.camera.lens_intent}`,
    `focus: x=${entry.composition.focus.x}, y=${entry.composition.focus.y}`,
    `dialogue_safe_zone: ${entry.composition.dialogue_safe_zone}`,
    ...numbered(entry.composition.framing_notes)
  ]));

  lines.push(...section('VISUAL CONTINUITY STATE', [
    `previous_entry_id: ${entry.continuity.previous_entry_id ?? 'none'}`,
    `locked_fields: ${entry.continuity.locked_fields.length ? entry.continuity.locked_fields.join(' | ') : 'none'}`,
    `allowed_changes: ${entry.continuity.allowed_changes.length ? entry.continuity.allowed_changes.join(' | ') : 'none'}`
  ]));

  lines.push(...section('HARD INCLUDE', numbered(entry.render_constraints.include)));
  lines.push(...section('HARD EXCLUDE', numbered(entry.render_constraints.exclude)));
  lines.push(...section('TEXT POLICY', [entry.render_constraints.text_policy]));

  const referenceLines = [
    `mode: ${entry.reference_transport.mode}`,
    `fresh_session_required: ${entry.reference_transport.fresh_session_required}`,
    `no_unrelated_images_allowed: ${entry.reference_transport.no_unrelated_images_allowed}`,
    `accepted_base_asset_id: ${entry.reference_transport.accepted_base_asset_id ?? 'none'}`,
    'Required attachments:'
  ];
  if (entry.reference_transport.attachments.length === 0) referenceLines.push('- none');
  else entry.reference_transport.attachments.forEach((binding) => referenceLines.push(`- ${binding.role}: ${binding.source_id} (${binding.expected_filename}); pixels_must_be_visible=true`));
  lines.push(...section('REFERENCE PREFLIGHT', referenceLines));

  lines.push(...section('ACCEPTANCE', numbered(entry.acceptance)));
  if (entry.known_issues?.length) {
    lines.push(...section('KNOWN ACCEPTED-ASSET ISSUES — DO NOT REPRODUCE AS DESIGN INTENT', numbered(entry.known_issues)));
  }
  lines.push(...section('STOP RULE', [
    'Do not reinterpret the scene or load additional project policy.',
    'If any required field/reference is missing or conflicting, stop with BLOCKED: incomplete_cg_spec.',
    'Generate exactly one candidate. Do not retry automatically. Do not self-accept or ingest.'
  ]));

  const sharedPrompt = `${lines.join('\n').trimEnd()}\n`;
  const manifestSha256 = sha256(stableStringify(manifest));
  const sharedPromptSha256 = sha256(sharedPrompt);
  return {
    packet_version: PACKET_VERSION,
    lifecycle: 'GENERATED',
    manifest_id: manifest.manifest_id,
    manifest_version: manifest.manifest_version,
    manifest_sha256: manifestSha256,
    entry_id: entry.entry_id,
    entry_status: entry.status,
    shared_prompt: sharedPrompt,
    shared_prompt_sha256: sharedPromptSha256,
    reference_transport: entry.reference_transport,
    output: entry.output
  };
}

export function buildPackets(manifest, { entryIds = [], statuses = DEFAULT_STATUSES } = {}) {
  validateManifest(manifest);
  const requestedEntries = new Set(entryIds);
  const allowedStatuses = statuses instanceof Set ? statuses : new Set(statuses);
  const selected = manifest.entries.filter((entry) => (
    (requestedEntries.size === 0 || requestedEntries.has(entry.entry_id)) && allowedStatuses.has(entry.status)
  ));
  for (const entryId of requestedEntries) {
    invariant(manifest.entries.some((entry) => entry.entry_id === entryId), `unknown entry_id: ${entryId}`);
  }
  invariant(selected.length > 0, 'no manifest entries matched the requested IDs/statuses');
  return selected.map((entry) => projectEntry(manifest, entry));
}

export function adaptChatManual(packets) {
  return packets.map((packet) => {
    const attachments = packet.reference_transport.attachments.length
      ? packet.reference_transport.attachments.map((binding) => `- ${binding.role}: \`${binding.expected_filename}\` (${binding.source_id})`).join('\n')
      : '- none';
    return [
      `# Chat Manual Render Packet — ${packet.entry_id}`,
      '',
      `Manifest SHA-256: \`${packet.manifest_sha256}\``,
      `Prompt SHA-256: \`${packet.shared_prompt_sha256}\``,
      '',
      '## Attachment checklist',
      '',
      attachments,
      '',
      '## Shared render prompt',
      '',
      '```text',
      packet.shared_prompt.trimEnd(),
      '```',
      ''
    ].join('\n');
  }).join('\n---\n\n');
}

export function adaptWorkBatch(packets) {
  return `${packets.map((packet) => JSON.stringify({
    adapter: 'work_batch',
    job_id: packet.entry_id,
    manifest_id: packet.manifest_id,
    manifest_version: packet.manifest_version,
    manifest_sha256: packet.manifest_sha256,
    shared_prompt_sha256: packet.shared_prompt_sha256,
    shared_prompt: packet.shared_prompt,
    reference_transport: packet.reference_transport,
    output: packet.output
  })).join('\n')}\n`;
}

export function adaptApi(packets) {
  return `${JSON.stringify({
    adapter: 'api',
    schema_version: '1.0.0',
    jobs: packets.map((packet) => ({
      job_id: packet.entry_id,
      provenance: {
        manifest_id: packet.manifest_id,
        manifest_version: packet.manifest_version,
        manifest_sha256: packet.manifest_sha256,
        shared_prompt_sha256: packet.shared_prompt_sha256
      },
      input: {
        prompt: packet.shared_prompt,
        reference_transport: packet.reference_transport
      },
      output: packet.output
    }))
  }, null, 2)}\n`;
}

export function adaptPackets(packets, adapter) {
  invariant(ADAPTERS.has(adapter), `unknown adapter: ${adapter}`);
  if (adapter === 'chat_manual') return adaptChatManual(packets);
  if (adapter === 'work_batch') return adaptWorkBatch(packets);
  return adaptApi(packets);
}

function parseArgs(argv) {
  const options = { entryIds: [], statuses: new Set(DEFAULT_STATUSES), check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--manifest') options.manifestPath = argv[++index];
    else if (argument === '--adapter') options.adapter = argv[++index];
    else if (argument === '--out') options.outPath = argv[++index];
    else if (argument === '--entry') options.entryIds.push(argv[++index]);
    else if (argument === '--include-status') options.statuses = new Set(argv[++index].split(',').filter(Boolean));
    else if (argument === '--check') options.check = true;
    else throw new Error(`unknown argument: ${argument}`);
  }
  invariant(isNonEmpty(options.manifestPath), '--manifest is required');
  if (!options.check) invariant(ADAPTERS.has(options.adapter), '--adapter must be chat_manual, work_batch, or api');
  return options;
}

export function loadManifest(manifestPath) {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifest = validateManifest(loadManifest(options.manifestPath));
  if (options.check) {
    process.stdout.write(`Validated ${manifest.manifest_id}@${manifest.manifest_version}: ${manifest.entries.length} entries.\n`);
    return;
  }
  const packets = buildPackets(manifest, options);
  const output = adaptPackets(packets, options.adapter);
  if (options.outPath) {
    fs.mkdirSync(path.dirname(options.outPath), { recursive: true });
    fs.writeFileSync(options.outPath, output);
  } else {
    process.stdout.write(output);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
