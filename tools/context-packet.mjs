import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyProductionRun } from './verify-production-run.mjs';
import { buildPackets, validateManifest, validateRepoSourceCatalog } from './render-cg-packets.mjs';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractRoot = 'content/production/narrative';

function insist(condition, message) {
  if (!condition) throw new Error(message);
}

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
}

function safePath(value, forbiddenRoots = []) {
  insist(typeof value === 'string' && value.length > 0 && !value.includes('\\') &&
    !value.startsWith('/') && !value.includes('://') &&
    value.split('/').every((part) => part && part !== '.' && part !== '..') &&
    !forbiddenRoots.some((root) => value.startsWith(root)), `forbidden or invalid source path: ${value}`);
  return value;
}

async function trackedText(root, ref, relative, forbiddenRoots = []) {
  safePath(relative, forbiddenRoots);
  const absolute = path.resolve(root, relative);
  insist((await realpath(absolute)) === absolute, `source is a symlink: ${relative}`);
  insist((await stat(absolute)).isFile(), `source is not a file: ${relative}`);
  const bytes = await readFile(absolute);
  insist(bytes.length > 0, `empty source: ${relative}`);
  const expected = git(root, 'rev-parse', `${ref}:${relative}`);
  const actual = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  insist(expected === actual, `source differs from committed ref: ${relative}`);
  return { text: bytes.toString('utf8'), blob: actual };
}

async function contractPaths(root) {
  async function visit(relative) {
    const entries = await readdir(path.join(root, relative), { withFileTypes: true });
    const children = await Promise.all(entries.map(async (entry) => {
      const child = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) return visit(child);
      return entry.isFile() && child.endsWith('.json') ? [child] : [];
    }));
    return children.flat();
  }
  return (await visit(contractRoot)).sort();
}

function excerpt(lines, start, end, label) {
  insist(start >= 0 && end > start, `missing ${label} excerpt`);
  return {
    label,
    start_line: start + 1,
    end_line: end,
    sha256: createHash('sha256').update(lines.slice(start, end).join('\n')).digest('hex')
  };
}

function headingExcerpt(text, heading, label) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.startsWith(heading));
  insist(start >= 0, `missing ${label} heading`);
  const level = heading.match(/^#+/)[0].length;
  let end = lines.findIndex((line, index) => index > start && /^#+ /.test(line) && line.match(/^#+/)[0].length <= level);
  if (end < 0) end = lines.length;
  return excerpt(lines, start, end, label);
}

function sourceExcerpts(relative, text, sceneId) {
  if (relative.endsWith('/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md')) {
    const heading = text.split('\n').find((line) => line.startsWith(`### ${sceneId} `));
    insist(heading, `macro narrative has no ${sceneId} section`);
    return [headingExcerpt(text, heading, `macro:${sceneId}`)];
  }
  if (relative.endsWith('/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md')) {
    const lines = text.split('\n');
    const row = lines.findIndex((line) => line.startsWith(`| ${sceneId} |`));
    insist(row >= 0, `route/state table has no ${sceneId} row`);
    return [headingExcerpt(text, '# 6. Knowledge flags', 'knowledge-rules'),
      excerpt(lines, row, row + 1, `state-row:${sceneId}`)];
  }
  return [];
}

function allowedSource(item) {
  if (!item.excerpts?.length) return [item.path];
  return item.excerpts.map((part) => `${item.path}#L${part.start_line}-L${part.end_line}`);
}

function manifestList(text, label) {
  const section = text.match(new RegExp(`^  ${label}:\\n((?:    - [^\\n]+\\n)+)`, 'm'))?.[1];
  insist(section, `workflow manifest has no ${label} list`);
  return [...section.matchAll(/^    - (.+)$/gm)].map((match) => match[1]);
}

function narrativeSelections(section, isCanonicalNarrative, forbiddenRoots) {
  const selections = new Map();
  // Only the leading source list on a standard bullet is authority. Backtick
  // references in provenance prose (including historical candidates) are not.
  for (const bullet of section.matchAll(/^- (`[^`]+`(?:,[ \t]*`[^`]+`)*)/gm)) {
    for (const token of bullet[1].matchAll(/`([^`]+)`/g)) {
      const [relative, fragment, ...extra] = token[1].split('#');
      safePath(relative, forbiddenRoots);
      if (!relative.startsWith('docs/narrative/')) continue;
      insist(isCanonicalNarrative(relative), `noncanonical narrative input: ${relative}`);
      insist(!extra.length && (fragment === undefined || /^L[1-9][0-9]*-L[1-9][0-9]*$/.test(fragment)),
        `invalid narrative source selector: ${token[1]}`);
      const selected = selections.get(relative) || new Set();
      selected.add(fragment);
      insist(!(selected.has(undefined) && selected.size > 1), `mixed full-file and excerpt input: ${relative}`);
      selections.set(relative, selected);
    }
  }
  return selections;
}

export async function buildNarrativeReviewPacket({ sceneId, runId, taskId, root = defaultRoot, ref } = {}) {
  insist(/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(sceneId || ''), 'invalid scene ID');
  insist(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(runId || ''), 'invalid run ID');
  insist(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(taskId || ''), 'invalid task ID');
  root = path.resolve(root);
  ref = ref || git(root, 'rev-parse', 'HEAD');
  insist(/^[0-9a-f]{40}$/.test(ref), 'source ref must be a commit SHA');
  git(root, 'cat-file', '-e', `${ref}^{commit}`);
  const manifest = await trackedText(root, ref, '.ai/WORKFLOW_MANIFEST.yaml');
  const forbiddenRoots = manifestList(manifest.text, 'forbidden_source_roots');
  const narrativeCanon = manifestList(manifest.text, 'narrative_canon');
  const workflowVersion = manifest.text.match(/^  version: ([0-9]+\.[0-9]+\.[0-9]+)$/m)?.[1];
  const repositoryFullName = manifest.text.match(/^    full_name: ([\w-]+\/[\w-]+)$/m)?.[1];
  const repositoryUrl = manifest.text.match(/^    url: (https:\/\/github\.com\/[^\s]+)$/m)?.[1];
  insist(workflowVersion && repositoryFullName && repositoryUrl && repositoryUrl.endsWith(repositoryFullName), 'workflow version/repository binding is invalid');

  const contracts = await contractPaths(root);
  const matched = [];
  for (const relative of contracts) {
    let parsed;
    try {
      parsed = JSON.parse(await readFile(path.join(root, relative), 'utf8'));
    } catch (error) {
      if (path.posix.basename(relative) === `${sceneId}.json`) throw new Error(`invalid scene contract: ${relative}: ${error.message}`);
      continue;
    }
    if (parsed.scene_id === sceneId) {
      const source = await trackedText(root, ref, relative, forbiddenRoots);
      matched.push({ relative, parsed: JSON.parse(source.text) });
    }
  }
  insist(matched.length === 1, `expected one Narrative Continuity Contract for ${sceneId}; found ${matched.length}`);
  const [{ relative: contractPath, parsed: contract }] = matched;
  const scenePath = safePath(contract.source_scene, forbiddenRoots);
  const isCanonicalNarrative = (relative) => narrativeCanon.some((canon) => canon.endsWith('/') ? relative.startsWith(canon) : relative === canon);
  insist(scenePath.startsWith('docs/narrative/scenes/') && isCanonicalNarrative(scenePath), `scene is outside canonical narrative root: ${scenePath}`);
  const scene = await trackedText(root, ref, scenePath, forbiddenRoots);
  insist(scene.text.includes(`\`${contractPath}\``), `${scenePath} does not bind its Narrative Continuity Contract`);
  insist(/Production stage:.*Script Lock/.test(scene.text), `${scenePath} is not a Locked Scene`);
  const section = scene.text.match(/^## Canonical inputs\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1];
  insist(section, `${scenePath} has no canonical input list`);
  const selections = narrativeSelections(section, isCanonicalNarrative, forbiddenRoots);
  const contextPaths = [...selections.keys()];
  insist(contextPaths.length > 0, `${scenePath} declares no narrative canon`);

  const sources = [contractPath, scenePath, ...contextPaths];
  const markdown = [];
  for (const relative of sources) {
    const source = await trackedText(root, ref, relative, forbiddenRoots);
    const selected = selections.get(relative);
    const explicit = selected && !selected.has(undefined);
    const excerpts = explicit ? [...selected].map((fragment) => {
      const [, start, end] = fragment.match(/^L([0-9]+)-L([0-9]+)$/);
      const lines = source.text.split('\n');
      insist(Number.isSafeInteger(Number(start)) && Number.isSafeInteger(Number(end)) &&
        Number(start) <= Number(end) && Number(end) <= lines.length, `out-of-range narrative excerpt: ${relative}#${fragment}`);
      return excerpt(lines, Number(start) - 1, Number(end), `declared:${fragment}`);
    }) : sourceExcerpts(relative, source.text, sceneId);
    markdown.push({ path: relative, expected_nonempty: true, git_blob_sha: source.blob,
      ...(excerpts.length ? { excerpts } : {}) });
  }
  return {
    run_id: runId,
    task_id: taskId,
    scene_id: sceneId,
    task_type: 'narrative_review',
    depends_on: [],
    workflow_version: workflowVersion,
    harness: 'content_qa',
    pass: 'narrative_review',
    objective: `Independently review the existing locked ${sceneId} scene and its Narrative Continuity Contract; return one QA handoff.`,
    execution_policy: { model_tier: 'economical', routing_reason: 'default_bounded', attempt: 1 },
    source_binding: { github: {
      repository_full_name: repositoryFullName,
      repository_url: repositoryUrl,
      ref
    } },
    required_acquisition: { markdown, images: [] },
    allowed_sources: markdown.flatMap(allowedSource),
    forbidden_source_roots: forbiddenRoots,
    inputs: { narrative_contract: contractPath, locked_scene: scenePath, references: [], accepted_outputs: [] },
    input_versions: markdown.flatMap((source) => selections.get(source.path)?.has(undefined) === false
      ? source.excerpts.map((part) => ({ id: `excerpt:${source.path}:${part.label}`, version: part.sha256,
        location: `${source.path}#L${part.start_line}-L${part.end_line}` }))
      : [{ id: `file:${source.path}`, version: source.git_blob_sha, location: source.path }]),
    reference_transport: { mode: 'not_applicable', fresh_session_required: true, no_unrelated_images_allowed: true },
    constraints: {
      locked: [`Review only ${sceneId} and the declared canon excerpts; use the approved scene semantics as written.`],
      must_not_change: ['Do not rewrite narrative/CG/runtime source or expand the allowlist.'],
      output_format: '.ai/schemas/HANDOFF.md'
    },
    deliverables: [{ id: `narrative-qa:${sceneId}`, destination: `generated/session-cache/${runId}/${taskId}.handoff.json` }],
    acceptance: ['Record PASS, NEEDS_REVIEW, FAIL or BLOCKED with concrete scene/contract evidence for voice, pacing, knowledge, choices, state and visual beats.'],
    handoff_to: 'production_coordinator',
    human_gate: 'none'
  };
}

export async function verifyNarrativeReviewPacket(packet, { root = defaultRoot } = {}) {
  insist(packet && typeof packet === 'object' && !Array.isArray(packet), 'packet must be an object');
  const ref = packet.source_binding?.github?.ref;
  const rebuilt = await buildNarrativeReviewPacket({
    sceneId: packet.scene_id, runId: packet.run_id, taskId: packet.task_id, root, ref
  });
  insist(JSON.stringify(packet) === JSON.stringify(rebuilt), 'Task Packet fields, allowlist or input hashes differ from canonical sources');
  return true;
}

const cgInputs = [
  '.ai/WORKFLOW_MANIFEST.yaml',
  'content/production/narrative/opening-ch1/COM-00.json',
  'docs/narrative/scenes/vertical-slice/COM-00.md',
  'docs/art/PRODUCTION_VISUAL_DIRECTION.md',
  'docs/art/CHARACTER_REFERENCE_PACK_SPEC.md',
  '.ai/schemas/CG_MANIFEST.md',
  '.ai/schemas/cg-manifest.schema.json'
];

async function committedSource(root, ref, relative) {
  const value = await trackedText(root, ref, relative);
  return { path: relative, text: value.text, blob: value.blob };
}

export async function buildCgPlanPacket({ sceneId, runId, taskId, ref, upstreamRunId,
  upstreamTaskId, referenceIds, root = defaultRoot } = {}) {
  insist(sceneId === 'COM-00', 'CG planner supports COM-00 only');
  insist(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(runId || ''), 'invalid run ID');
  insist(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(taskId || ''), 'invalid task ID');
  insist(Array.isArray(referenceIds) && new Set(referenceIds).size === referenceIds.length,
    'referenceIds must be a duplicate-free array');
  insist(referenceIds.includes('ref.xu_tang.face.01') && referenceIds.includes('ref.xu_tang.wardrobe.a') &&
    referenceIds.includes('ref.xu_tang.production.04') &&
    referenceIds.includes('source.opening.ch1.bg.apt_17f_rain'), 'Xu Tang face, production, wardrobe and COM-00 environment references are required');
  insist(referenceIds.every((id) => ['ref.xu_tang.face.01', 'ref.xu_tang.wardrobe.a',
    'ref.xu_tang.body.03', 'ref.xu_tang.expression.02', 'ref.xu_tang.production.04', 'ref.xu_tang.wardrobe.b', 'source.opening.ch1.bg.apt_17f_rain'].includes(id)),
  'unsupported or unrelated reference ID');
  root = path.resolve(root);
  ref = ref || git(root, 'rev-parse', 'HEAD');
  insist(/^[0-9a-f]{40}$/.test(ref), 'source ref must be a commit SHA');
  insist(git(root, 'rev-parse', 'HEAD') === ref, 'source ref must be current HEAD');
  const upstream = await verifyProductionRun(upstreamRunId, { root, requireCurrent: true });
  insist(upstream.task_status === 'CURRENT_PASS', 'upstream Narrative QA is not CURRENT_PASS');
  const ledger = JSON.parse((await readFile(path.join(root,
    `content/production/runs/${upstreamRunId}/ledger.json`))).toString());
  const qaTask = ledger.tasks.find((item) => item.task_id === upstreamTaskId);
  insist(qaTask?.task_type === 'narrative_review' && qaTask.scene_id === sceneId && qaTask.status === 'PASS',
    'upstream task ID does not identify the committed COM-00 Narrative QA PASS');
  const sources = {};
  for (const relative of cgInputs) sources[relative] = await committedSource(root, ref, relative);
  const workflow = sources['.ai/WORKFLOW_MANIFEST.yaml'].text;
  const workflowVersion = workflow.match(/^  version: ([0-9]+\.[0-9]+\.[0-9]+)$/m)?.[1];
  const repositoryFullName = workflow.match(/^    full_name: ([\w-]+\/[\w-]+)$/m)?.[1];
  const repositoryUrl = workflow.match(/^    url: (https:\/\/github\.com\/[^\s]+)$/m)?.[1];
  const forbiddenRoots = manifestList(workflow, 'forbidden_source_roots');
  insist(workflowVersion && repositoryFullName && repositoryUrl?.endsWith(repositoryFullName),
    'workflow version/repository binding is invalid');
  const catalogSource = await committedSource(root, ref, 'content/assets/source-catalog.json');
  const assetManifestSource = await committedSource(root, ref, 'content/assets/manifest.json');
  const catalog = JSON.parse(catalogSource.text);
  validateRepoSourceCatalog(catalog, { repoRoot: root });
  const manifest = JSON.parse(assetManifestSource.text);
  const contract = JSON.parse(sources[cgInputs[1]].text);
  insist(contract.scene_id === sceneId && contract.lifecycle === 'CANONICAL' &&
    contract.source_scene === cgInputs[2], 'COM-00 contract identity or Locked Scene binding is invalid');
  insist(Array.isArray(contract.character_intent) &&
    contract.character_intent.some((item) => item.character_id === 'xu_tang') &&
    contract.character_intent.every((item) => ['xu_tang', 'protagonist'].includes(item.character_id)),
  'COM-00 contract character intent conflicts with Xu Tang-only references');
  const sceneText = sources[cgInputs[2]].text;
  insist(sceneText.includes(`\`${cgInputs[1]}\``) && /Production stage:.*Script Lock/.test(sceneText),
    'COM-00 scene is not a bound Locked Scene');
  const sceneCanon = sceneText.match(/^## Canonical inputs\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1];
  insist(sceneCanon && [cgInputs[3], cgInputs[4]].every((relative) =>
    sceneCanon.includes(`\`${relative}\``)), 'Locked Scene lacks the declared contract or visual inputs');
  const bg = catalog.files['source.opening.ch1.bg.apt_17f_rain'];
  const backgroundAsset = manifest.assets?.[bg?.logicalAssetId];
  insist(bg?.status === 'active-production' && backgroundAsset?.masterSourceId === 'source.opening.ch1.bg.apt_17f_rain' &&
    backgroundAsset.canonicalAssetId === bg.canonicalAssetId && sceneText.includes(`\`${bg.logicalAssetId}\``),
    'COM-00 environment is not registered as active in the asset manifest');
  const selectedRecords = [];
  const images = referenceIds.map((id) => {
    const item = catalog.files[id];
    insist(item, `unknown source-catalog ID: ${id}`);
    const roleById = { 'ref.xu_tang.face.01': ['primary_face_identity', 'active-production'],
      'ref.xu_tang.wardrobe.a': ['wardrobe', 'active-production'],
      'ref.xu_tang.body.03': ['body_proportions', 'active-production'],
      'ref.xu_tang.expression.02': ['expression', 'active-production'],
      'ref.xu_tang.production.04': ['production_consistency', 'active-production'],
      'ref.xu_tang.wardrobe.b': ['wardrobe', 'active-production'],
      'source.opening.ch1.bg.apt_17f_rain': ['environment_background', 'active-production'] };
    const [expectedRole, expectedStatus] = roleById[id] ?? [];
    if (id.startsWith('ref.')) insist(item.characterId === 'xu_tang' && item.role === expectedRole && item.status === expectedStatus,
      `reference role, character, or status mismatch: ${id}`);
    else insist(id === 'source.opening.ch1.bg.apt_17f_rain' && expectedRole === 'environment_background' &&
      item.status === expectedStatus && item.logicalAssetId === 'bg.opening.ch1.apt_17f_rain',
    `environment is not the registered COM-00 background: ${id}`);
    selectedRecords.push({ id, record: item });
    const imageRecord = { source_id: id, role: expectedRole, path: item.sourcePath, filename: item.name,
      mime_type: item.mimeType, sha256: item.sha256, git_blob_sha: git(root, 'rev-parse', `${ref}:${item.sourcePath}`),
      width: item.width, height: item.height, pixels_must_be_visible: true };
    return imageRecord;
  });
  const workerMarkdownPaths = [cgInputs[1], cgInputs[2], cgInputs[3], cgInputs[4], cgInputs[5], cgInputs[6]];
  const markdown = workerMarkdownPaths.map((relative) => ({ path: relative, expected_nonempty: true,
    git_blob_sha: sources[relative].blob, ...(relative.endsWith('CHARACTER_REFERENCE_PACK_SPEC.md') ? {
      excerpts: [headingExcerpt(sources[relative].text, '# 3. Xu Tang canonical reference manifest', 'xu-tang-reference-spec')]
    } : {}) }));
  const backgroundRecordHash = createHash('sha256').update(JSON.stringify(backgroundAsset)).digest('hex');
  const selectedCatalogVersions = selectedRecords.map(({ id, record }) => ({
    id: `catalog-record:${id}`, version: createHash('sha256').update(JSON.stringify(record)).digest('hex'),
    location: `content/assets/source-catalog.json#${id}`
  }));
  return {
    run_id: runId, task_id: taskId, scene_id: sceneId, task_type: 'cg_plan', depends_on: [],
    workflow_version: workflowVersion,
    harness: 'cg_planner', pass: null,
    objective: 'Propose a COM-00 CG plan from the exact locked scene and approved current inputs; do not author or overwrite a canonical manifest.',
    execution_policy: { model_tier: 'capable', routing_reason: 'creative_judgment', attempt: 1 },
    source_binding: { github: { repository_full_name: repositoryFullName, repository_url: repositoryUrl, ref } },
    required_acquisition: { markdown, images },
    allowed_sources: [...markdown.flatMap((item) => item.excerpts?.length ? item.excerpts.map((excerpt) =>
      `${item.path}#L${excerpt.start_line}-L${excerpt.end_line}`) : [item.path]), ...images.map((image) => image.path)],
    forbidden_source_roots: forbiddenRoots,
    inputs: { narrative_contract: cgInputs[1], locked_scene: cgInputs[2], references: referenceIds,
      accepted_outputs: [{ id: `narrative-qa:${sceneId}`, run_id: upstreamRunId,
        task_id: upstreamTaskId, status: 'CURRENT_PASS', approved_locked_scene_git_blob: qaTask.output_versions[0].version }] },
    input_versions: [...markdown.flatMap((item) => item.excerpts?.length
      ? item.excerpts.map((excerpt) => ({ id: `excerpt:${item.path}:${excerpt.label}`, version: excerpt.sha256,
        location: `${item.path}#L${excerpt.start_line}-L${excerpt.end_line}` }))
      : [{ id: `file:${item.path}`, version: item.git_blob_sha, location: item.path }]),
      ...images.map((item) => ({ id: `image:${item.source_id}`, version: item.git_blob_sha, location: item.path })),
      ...selectedCatalogVersions,
      { id: 'asset-record:bg.opening.ch1.apt_17f_rain', version: backgroundRecordHash,
        location: 'content/assets/manifest.json#bg.opening.ch1.apt_17f_rain' },
      { id: `receipt:${upstreamRunId}/${upstreamTaskId}`, version: git(root, 'rev-parse', `${ref}:content/production/runs/${upstreamRunId}/${upstreamTaskId}.decision.json`), location: `content/production/runs/${upstreamRunId}/${upstreamTaskId}.decision.json` }],
    reference_transport: { mode: 'references_required', fresh_session_required: true, no_unrelated_images_allowed: true },
    constraints: { locked: ['COM-00 only; Xu Tang is the only visible heroine.', 'Use supplied references; pixels must be visible to the planner.'],
      must_not_change: ['Do not generate images or claim QA PASS.', 'Do not read an existing CG manifest as planning input or overwrite canonical manifest.'],
      output_format: '.ai/schemas/CG_MANIFEST.md' },
    deliverables: [{ id: `cg-plan:${sceneId}`, destination: `generated/session-cache/${runId}/${taskId}.cg-plan.json`, kind: 'cache_proposal' }],
    acceptance: ['Return a proposed COM-00 plan conforming to the CG manifest schema; independent manifest usability QA is required before canonical adoption.'],
    handoff_to: 'production_coordinator', human_gate: 'none'
  };
}

export async function verifyCgPlanPacket(packet, { root = defaultRoot } = {}) {
  insist(packet && typeof packet === 'object' && !Array.isArray(packet), 'packet must be an object');
  const rebuilt = await buildCgPlanPacket({ sceneId: packet.scene_id, runId: packet.run_id,
    taskId: packet.task_id, ref: packet.source_binding?.github?.ref,
    upstreamRunId: packet.inputs?.accepted_outputs?.[0]?.run_id,
    upstreamTaskId: packet.inputs?.accepted_outputs?.[0]?.task_id,
    referenceIds: packet.inputs?.references, root });
  insist(JSON.stringify(packet) === JSON.stringify(rebuilt), 'CG Plan Packet fields, allowlist or input hashes differ from canonical sources');
  return true;
}

const manifestUsabilityPaths = {
  contract: 'content/production/narrative/opening-ch1/COM-00.json',
  scene: 'docs/narrative/scenes/vertical-slice/COM-00.md',
  visual: 'docs/art/PRODUCTION_VISUAL_DIRECTION.md',
  character: 'docs/art/CHARACTER_REFERENCE_PACK_SPEC.md',
  schema: '.ai/schemas/CG_MANIFEST.md',
  manifest: 'content/production/cg-manifests/opening-ch1.json',
  catalog: 'content/assets/source-catalog.json'
};

function exactJsonLineExcerpt(text, selector, label) {
  const lines = text.split('\n');
  const start = selector(lines);
  insist(Number.isInteger(start) && start >= 0, `missing ${label} excerpt`);
  let depth = 0, inString = false, escaped = false, started = false, end = -1;
  for (let i = start; i < lines.length; i++) {
    for (const char of `${lines[i]}\n`) {
      if (inString) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') inString = false;
      } else if (char === '"') inString = true;
      else if (char === '{') { depth++; started = true; }
      else if (char === '}') {
        depth--;
        if (started && depth === 0) { end = i; break; }
      }
    }
    if (end >= 0) break;
  }
  insist(end >= start, `unparseable ${label} excerpt`);
  const fragment = lines.slice(start, end + 1).join('\n');
  try { JSON.parse((fragment.trimStart().startsWith('{') ? fragment : `{${fragment}}`).replace(/,\s*}$/, '}').replace(/,\s*$/, '')); }
  catch (error) { throw new Error(`${label} excerpt does not parse as a complete manifest object: ${error.message}`); }
  return excerpt(lines, start, end + 1, label);
}

export async function buildManifestUsabilityPacket({ sceneId, runId, taskId, ref, upstreamRunId,
  upstreamTaskId, entryIds, root = defaultRoot } = {}) {
  insist(sceneId === 'COM-00', 'manifest usability supports COM-00 only');
  insist(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(runId || ''), 'invalid run ID');
  insist(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(taskId || ''), 'invalid task ID');
  insist(Array.isArray(entryIds) && new Set(entryIds).size === entryIds.length,
    'entryIds must be explicitly supplied and duplicate-free');
  root = path.resolve(root);
  ref = ref || git(root, 'rev-parse', 'HEAD');
  insist(/^[0-9a-f]{40}$/.test(ref), 'source ref must be a commit SHA');
  insist(git(root, 'rev-parse', 'HEAD') === ref, 'source ref must be current HEAD');
  const upstream = await verifyProductionRun(upstreamRunId, { root, requireCurrent: true });
  insist(upstream.task_status === 'CURRENT_PASS', 'upstream Narrative QA is not CURRENT_PASS');
  const ledger = JSON.parse(await readFile(path.join(root, `content/production/runs/${upstreamRunId}/ledger.json`), 'utf8'));
  const qaTask = ledger.tasks.find((item) => item.task_id === upstreamTaskId);
  insist(qaTask?.task_type === 'narrative_review' && qaTask.scene_id === sceneId && qaTask.status === 'PASS' &&
    qaTask.output_versions?.length === 1 && qaTask.output_versions[0].id === `approved_locked_scene:${sceneId}` &&
    qaTask.output_versions[0].location === manifestUsabilityPaths.scene,
  'upstream task ID does not identify the committed COM-00 Narrative QA PASS');

  const source = {};
  for (const [key, relative] of Object.entries(manifestUsabilityPaths)) source[key] = await committedSource(root, ref, relative);
  const workflow = await committedSource(root, ref, '.ai/WORKFLOW_MANIFEST.yaml');
  const workflowVersion = workflow.text.match(/^  version: ([0-9]+\.[0-9]+\.[0-9]+)$/m)?.[1];
  const repositoryFullName = workflow.text.match(/^    full_name: ([\w-]+\/[\w-]+)$/m)?.[1];
  const repositoryUrl = workflow.text.match(/^    url: (https:\/\/github\.com\/[^\s]+)$/m)?.[1];
  const forbiddenRoots = manifestList(workflow.text, 'forbidden_source_roots');
  insist(workflowVersion && repositoryFullName && repositoryUrl?.endsWith(repositoryFullName),
    'workflow version/repository binding is invalid');

  const manifest = JSON.parse(source.manifest.text);
  validateManifest(manifest);
  const selected = manifest.entries.filter((entry) => entry.scene_id === sceneId);
  const expectedIds = selected.map((entry) => entry.entry_id).sort();
  insist(selected.length === 3 && JSON.stringify([...entryIds].sort()) === JSON.stringify(expectedIds),
    'entryIds must exactly identify all three canonical COM-00 entries');
  insist(selected.every((entry) => entry.source_scene === manifestUsabilityPaths.scene && entry.status === 'accepted'),
    'every selected COM-00 entry must bind the Locked Scene and be accepted');
  insist(selected.every((entry) => entry.characters.length > 0 &&
    entry.characters.every((character) => character.character_id === 'xu_tang')),
  'COM-00 review cannot include an unrelated character');

  const catalog = JSON.parse(source.catalog.text);
  validateRepoSourceCatalog(catalog, { repoRoot: root });
  const neededRefs = new Map();
  const neededAssetIds = new Set();
  const assetManifestSource = await committedSource(root, ref, 'content/assets/manifest.json');
  const assetManifest = JSON.parse(assetManifestSource.text);
  const byOutputId = new Map(selected.flatMap((entry) => [[entry.output.canonical_asset_id, entry], [entry.output.logical_asset_id, entry]]));
  for (const entry of selected) {
    const outputAsset = assetManifest.assets?.[entry.output.logical_asset_id];
    const outputSources = Object.entries(catalog.files).filter(([, record]) =>
      record.canonicalAssetId === entry.output.canonical_asset_id);
    insist(outputSources.length === 1 && outputAsset?.canonicalAssetId === entry.output.canonical_asset_id &&
      outputAsset.masterSourceId === outputSources[0][0] &&
      outputSources[0][1].logicalAssetId === entry.output.logical_asset_id &&
      outputSources[0][1].name === entry.output.master_filename &&
      outputSources[0][1].status === 'active-production',
    `accepted output asset/source binding is invalid: ${entry.entry_id}`);
    neededAssetIds.add(entry.output.logical_asset_id);
    for (const character of entry.characters) for (const binding of character.reference_bindings) {
      const rec = catalog.files[binding.source_id];
      insist(rec && rec.role === binding.role && rec.name === binding.expected_filename && rec.characterId === character.character_id && rec.status === 'active-production',
        `reference binding differs from source catalog for ${entry.entry_id}`);
      neededRefs.set(binding.source_id, rec);
    }
    const binding = entry.environment.reference_binding;
    if (binding) {
      const rec = catalog.files[binding.source_id];
      insist(rec && binding.role === 'environment' && rec.name === binding.expected_filename &&
        rec.logicalAssetId === 'bg.opening.ch1.apt_17f_rain' &&
        entry.environment.location_id === 'BG-APT-17F-RAIN' && rec.status === 'active-production',
        `environment reference binding differs from source catalog for ${entry.entry_id}`);
      const registered = assetManifest.assets?.[rec.logicalAssetId];
      insist(registered?.masterSourceId === binding.source_id && registered.canonicalAssetId === rec.canonicalAssetId &&
        registered.kind === 'background' && typeof entry.environment.location_id === 'string',
      `environment asset registration differs from source catalog for ${entry.entry_id}`);
      neededRefs.set(binding.source_id, rec);
      neededAssetIds.add(rec.logicalAssetId);
    }
    const baseId = entry.reference_transport.accepted_base_asset_id;
    if (baseId) {
      const base = byOutputId.get(baseId);
      insist(base && base.status === 'accepted' && base.scene_id === sceneId &&
        entry.reference_transport.attachments.some((item) => item.role === 'accepted_base' && item.source_id === baseId),
      `accepted base is not one of the selected accepted COM-00 entries: ${entry.entry_id}`);
      const asset = assetManifest.assets?.[base.output.logical_asset_id];
      const catalogMatches = Object.entries(catalog.files).filter(([, record]) => record.canonicalAssetId === baseId);
      const baseAttachment = entry.reference_transport.attachments.find((item) => item.role === 'accepted_base' && item.source_id === baseId);
      insist(asset?.canonicalAssetId === base.output.canonical_asset_id && catalogMatches.length === 1 &&
        asset.masterSourceId === catalogMatches[0][0] && catalogMatches[0][1].name === base.output.master_filename &&
        catalogMatches[0][1].logicalAssetId === base.output.logical_asset_id && catalogMatches[0][1].status === 'active-production' &&
        baseAttachment?.expected_filename === catalogMatches[0][1].name,
      `accepted base asset/source binding is invalid: ${entry.entry_id}`);
      neededRefs.set(catalogMatches[0][0], catalogMatches[0][1]);
      neededAssetIds.add(base.output.logical_asset_id);
    }
  }
  const imageVersions = await Promise.all([...neededRefs].map(async ([id, record]) => {
    const bytes = await readFile(path.join(root, record.sourcePath));
    const blob = git(root, 'rev-parse', `${ref}:${record.sourcePath}`);
    const sha = createHash('sha256').update(Buffer.from(bytes)).digest('hex');
    insist(record.sha256 === sha, `source catalog SHA-256 mismatch: ${id}`);
    return { id, record, blob };
  }));

  const manifestLines = source.manifest.text.split('\n');
  const excerpts = [exactJsonLineExcerpt(source.manifest.text,
    (lines) => lines.findIndex((line) => /^  "style_contract": \{$/.test(line)), 'manifest-style-contract')];
  for (const entry of selected) excerpts.push(exactJsonLineExcerpt(source.manifest.text,
    (lines) => {
      const index = lines.findIndex((line) => line.trim() === `"entry_id": "${entry.entry_id}",`);
      return index > 0 && lines[index - 1]?.trim() === '{' ? index - 1 : -1;
    }, `manifest-entry:${entry.entry_id}`));
  const markdown = [
    { path: manifestUsabilityPaths.contract, expected_nonempty: true, git_blob_sha: source.contract.blob },
    { path: manifestUsabilityPaths.scene, expected_nonempty: true, git_blob_sha: source.scene.blob },
    { path: manifestUsabilityPaths.visual, expected_nonempty: true, git_blob_sha: source.visual.blob },
    { path: manifestUsabilityPaths.character, expected_nonempty: true, git_blob_sha: source.character.blob,
      excerpts: [headingExcerpt(source.character.text, '# 3. Xu Tang canonical reference manifest', 'xu-tang-reference-spec')] },
    { path: manifestUsabilityPaths.schema, expected_nonempty: true, git_blob_sha: source.schema.blob },
    { path: manifestUsabilityPaths.manifest, expected_nonempty: true, git_blob_sha: source.manifest.blob, excerpts }
  ];
  const contract = JSON.parse(source.contract.text);
  insist(contract.scene_id === sceneId && contract.source_scene === manifestUsabilityPaths.scene && contract.lifecycle === 'CANONICAL',
    'COM-00 scene contract identity or source binding is invalid');
  insist(Array.isArray(contract.character_intent) &&
    contract.character_intent.some((item) => item.character_id === 'xu_tang') &&
    contract.character_intent.every((item) => ['xu_tang', 'protagonist'].includes(item.character_id)),
  'COM-00 contract character intent conflicts with Xu Tang-only review');
  insist(source.scene.text.includes(`\`${manifestUsabilityPaths.contract}\``) && /Production stage:.*Script Lock/.test(source.scene.text),
    'COM-00 scene is not a bound Locked Scene');
  // Ensure each manifest excerpt parses to exactly the selected canonical object.
  for (const part of excerpts) {
    const slice = manifestLines.slice(part.start_line - 1, part.end_line).join('\n');
    const parsed = JSON.parse((slice.trimStart().startsWith('{') ? slice : `{${slice}}`).replace(/,\s*}$/, '}').replace(/,\s*$/, ''));
    if (part.label === 'manifest-style-contract') insist(JSON.stringify(parsed.style_contract) === JSON.stringify(manifest.style_contract), 'style excerpt differs from manifest object');
    else { const expected = selected.find((entry) => part.label === `manifest-entry:${entry.entry_id}`); insist(expected && JSON.stringify(parsed) === JSON.stringify(expected), `entry excerpt differs from manifest object: ${part.label}`); }
  }
  const sceneBlob = qaTask.output_versions[0].version;
  const acceptedOutput = { id: `narrative-qa:${sceneId}`, run_id: upstreamRunId, task_id: upstreamTaskId,
    status: 'CURRENT_PASS', approved_locked_scene_git_blob: sceneBlob };
  const catalogVersions = [...neededRefs].map(([id, record]) => ({ id: `catalog-record:${id}`,
    version: createHash('sha256').update(JSON.stringify(record)).digest('hex'), location: `${manifestUsabilityPaths.catalog}#${id}` }));
  const assetVersions = [...neededAssetIds].map((id) => {
    const asset = assetManifest.assets?.[id];
    insist(asset, `missing selected runtime asset record: ${id}`);
    return { id: `asset-record:${id}`, version: createHash('sha256').update(JSON.stringify(asset)).digest('hex'),
      location: `content/assets/manifest.json#${id}` };
  });
  const renderPackets = buildPackets(manifest, { entryIds: expectedIds, statuses: ['accepted'] });
  const entryVersions = renderPackets.map((renderPacket) => ({ id: `manifest-entry:${renderPacket.entry_id}`,
    version: renderPacket.render_spec_sha256, location: `${manifestUsabilityPaths.manifest}#${renderPacket.entry_id}` }));
  return {
    run_id: runId, task_id: taskId, scene_id: sceneId, task_type: 'visual_review', review_scope: 'manifest_usability', depends_on: [],
    workflow_version: workflowVersion, harness: 'content_qa', pass: 'visual_review',
    objective: 'Review whether the three accepted COM-00 canonical CG manifest entries provide complete, unambiguous render instructions and valid reference bindings.',
    execution_policy: { model_tier: 'economical', routing_reason: 'default_bounded', attempt: 1 },
    source_binding: { github: { repository_full_name: repositoryFullName, repository_url: repositoryUrl, ref } },
    required_acquisition: { markdown, images: [] },
    allowed_sources: markdown.flatMap(allowedSource), forbidden_source_roots: forbiddenRoots,
    inputs: { narrative_contract: manifestUsabilityPaths.contract, locked_scene: manifestUsabilityPaths.scene,
      cg_manifest: manifestUsabilityPaths.manifest, cg_entry_ids: expectedIds,
      references: [...neededRefs.keys()], accepted_outputs: [acceptedOutput] },
    input_versions: [
      ...markdown.flatMap((item) => item.excerpts?.length
        ? item.excerpts.map((part) => ({ id: `excerpt:${item.path}:${part.label}`, version: part.sha256,
          location: `${item.path}#L${part.start_line}-L${part.end_line}` }))
        : [{ id: `file:${item.path}`, version: item.git_blob_sha, location: item.path }]),
      ...entryVersions, ...imageVersions.map(({ id, record, blob }) => ({ id: `image:${id}`, version: blob, location: record.sourcePath })),
      ...catalogVersions, ...assetVersions, { id: `receipt:${upstreamRunId}/${upstreamTaskId}`,
        version: git(root, 'rev-parse', `${ref}:content/production/runs/${upstreamRunId}/${upstreamTaskId}.decision.json`),
        location: `content/production/runs/${upstreamRunId}/${upstreamTaskId}.decision.json` }
    ],
    reference_transport: { mode: 'not_applicable', fresh_session_required: true, no_unrelated_images_allowed: true },
    constraints: { locked: ['Review COM-00 manifest usability only; inspect the three supplied entry excerpts and declared reference IDs.', 'Reference IDs are machine evidence only; no candidate image or pixel QA is requested.'],
      must_not_change: ['Do not generate images, claim visual acceptance, or change canonical content.'], output_format: '.ai/schemas/HANDOFF.md' },
    deliverables: [{ id: `manifest-usability-qa:${sceneId}`, destination: `generated/session-cache/${runId}/${taskId}.handoff.json` }],
    acceptance: ['Return PASS, NEEDS_REVIEW, FAIL or BLOCKED with concrete entry-level evidence about render completeness, continuity and reference binding.'],
    handoff_to: 'production_coordinator', human_gate: 'none'
  };
}

export async function verifyManifestUsabilityPacket(packet, { root = defaultRoot } = {}) {
  insist(packet && typeof packet === 'object' && !Array.isArray(packet), 'packet must be an object');
  const rebuilt = await buildManifestUsabilityPacket({ sceneId: packet.scene_id, runId: packet.run_id,
    taskId: packet.task_id, ref: packet.source_binding?.github?.ref,
    upstreamRunId: packet.inputs?.accepted_outputs?.[0]?.run_id,
    upstreamTaskId: packet.inputs?.accepted_outputs?.[0]?.task_id,
    entryIds: packet.inputs?.cg_entry_ids, root });
  insist(JSON.stringify(packet) === JSON.stringify(rebuilt), 'Manifest Usability Task Packet fields, allowlist or input hashes differ from canonical sources');
  return true;
}

/** Prepare one existing repository image for an independent, pixel-visible Visual QA pass. */
export async function buildCandidateVisualReviewPacket({ sceneId, runId, taskId, ref, upstreamRunId,
  upstreamTaskId, entryId, candidateSourceId, root = defaultRoot } = {}) {
  insist(sceneId === 'COM-00', 'candidate visual review supports COM-00 only');
  insist(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(runId || ''), 'invalid run ID');
  insist(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(taskId || ''), 'invalid task ID');
  insist(entryId === 'COM00-S04-BASE-NEUTRAL', 'candidate visual review is bounded to COM00-S04-BASE-NEUTRAL');
  root = path.resolve(root);
  ref = ref || git(root, 'rev-parse', 'HEAD');
  insist(/^[0-9a-f]{40}$/.test(ref) && git(root, 'rev-parse', 'HEAD') === ref,
    'source ref must be the current commit SHA');

  const upstream = await verifyProductionRun(upstreamRunId, { root, requireCurrent: true });
  insist(upstream.task_status === 'CURRENT_PASS', 'upstream Manifest Usability QA is not CURRENT_PASS');
  const ledger = JSON.parse((await committedSource(root, ref,
    `content/production/runs/${upstreamRunId}/ledger.json`)).text);
  const qaTask = ledger.tasks.find((task) => task.task_id === upstreamTaskId);
  insist(qaTask?.task_type === 'visual_review' && qaTask.review_scope === 'manifest_usability' &&
    qaTask.scene_id === sceneId && qaTask.status === 'PASS' && qaTask.entry_ids.includes(entryId) &&
    qaTask.output_versions?.length === 1, 'upstream task is not the committed COM-00 Manifest Usability PASS');
  const receiptPath = `content/production/runs/${upstreamRunId}/${upstreamTaskId}.decision.json`;
  const receipt = JSON.parse((await committedSource(root, ref, receiptPath)).text);
  insist(receipt.status === 'PASS' && receipt.packet_sha256 === upstream.packet_sha256 &&
    receipt.output_versions?.[0]?.version === qaTask.output_versions[0].version,
  'upstream manifest usability decision receipt differs from verified run');

  // Reuse the existing machine checks for the scene, canonical bindings, and complete image decode.
  const preflight = await buildManifestUsabilityPacket({ sceneId, runId, taskId, ref,
    upstreamRunId: qaTask.upstream_run_id, upstreamTaskId: qaTask.upstream_task_id,
    entryIds: qaTask.entry_ids, root });
  const manifest = JSON.parse((await committedSource(root, ref, manifestUsabilityPaths.manifest)).text);
  const entry = manifest.entries.find((item) => item.scene_id === sceneId && item.entry_id === entryId);
  insist(entry?.status === 'accepted' && entry.reference_transport.mode === 'references_required' &&
    entry.reference_transport.accepted_base_asset_id === null, 'selected candidate is not an accepted base CG entry');
  const catalog = JSON.parse((await committedSource(root, ref, manifestUsabilityPaths.catalog)).text);
  const assetManifest = JSON.parse((await committedSource(root, ref, 'content/assets/manifest.json')).text);
  const sourceMap = JSON.parse((await committedSource(root, ref, 'content/assets/source-map.json')).text);
  const candidate = catalog.files[candidateSourceId];
  const asset = assetManifest.assets?.[entry.output.logical_asset_id];
  insist(candidate?.status === 'active-production' && candidate.canonicalAssetId === entry.output.canonical_asset_id &&
    candidate.logicalAssetId === entry.output.logical_asset_id && candidate.name === entry.output.master_filename &&
    candidate.mimeType === 'image/webp' && asset?.masterSourceId === candidateSourceId &&
    asset.canonicalAssetId === entry.output.canonical_asset_id && asset.kind === 'cg',
  'candidate source ID, output, and asset registration do not match');
  const mapped = sourceMap.files?.[asset.src];
  insist(mapped?.source === candidate.sourcePath && mapped.transform === 'copy' &&
    mapped.sha256 === candidate.sha256 && mapped.bytes === candidate.bytes &&
    mapped.masterSourceId === candidateSourceId, 'candidate runtime source map differs from repo bytes');

  const bindings = [...entry.characters.flatMap((character) => character.reference_bindings),
    ...(entry.environment.reference_binding ? [entry.environment.reference_binding] : [])];
  insist(bindings.length === 3 && entry.characters.every((character) => character.character_id === 'xu_tang') &&
    JSON.stringify(bindings.map(({ role, source_id }) => [role, source_id])) === JSON.stringify([
      ['primary_face_identity', 'ref.xu_tang.face.01'],
      ['wardrobe', 'ref.xu_tang.wardrobe.a'],
      ['environment', 'source.opening.ch1.bg.apt_17f_rain']
    ]), 'selected candidate requires exactly the declared Xu Tang face, wardrobe and environment');
  const imageSpec = async (sourceId, role, filename) => {
    const record = catalog.files[sourceId];
    insist(record && record.name === filename && record.status === 'active-production',
      `invalid candidate/reference source binding: ${sourceId}`);
    const relative = safePath(record.sourcePath);
    insist(relative.startsWith('assets-src/'), `image is outside repository asset sources: ${relative}`);
    const absolute = path.join(root, relative);
    insist((await realpath(absolute)) === absolute, `source is a symlink: ${relative}`);
    const bytes = await readFile(absolute);
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    insist(blob === git(root, 'rev-parse', `${ref}:${relative}`) &&
      createHash('sha256').update(bytes).digest('hex') === record.sha256,
    `image bytes differ from committed source/catalog: ${sourceId}`);
    return { role, source_id: sourceId, path: relative, filename: record.name,
      mime_type: record.mimeType, sha256: record.sha256, git_blob_sha: blob,
      width: record.width, height: record.height, pixels_must_be_visible: true };
  };
  const images = [await imageSpec(candidateSourceId, 'candidate', candidate.name),
    ...await Promise.all(bindings.map((binding) => imageSpec(binding.source_id, binding.role, binding.expected_filename)))];
  const markdown = preflight.required_acquisition.markdown.map((item) => item.path !== manifestUsabilityPaths.manifest
    ? item : { ...item, excerpts: item.excerpts.filter((part) =>
      part.label === 'manifest-style-contract' || part.label === `manifest-entry:${entryId}`) });
  const sourceIds = new Set(images.map((item) => item.source_id));
  const assetIds = new Set([entry.output.logical_asset_id, catalog.files[bindings[2].source_id].logicalAssetId]);
  const inputVersions = preflight.input_versions.filter((item) =>
    !item.id.startsWith('manifest-entry:') || item.id === `manifest-entry:${entryId}`)
    .filter((item) => !item.id.startsWith('excerpt:') || markdown.some((source) =>
      source.excerpts?.some((part) => item.id === `excerpt:${source.path}:${part.label}`)))
    .filter((item) => !item.id.startsWith('image:') && !item.id.startsWith('catalog-record:') &&
      !item.id.startsWith('asset-record:') && !item.id.startsWith('receipt:'));
  inputVersions.push(...images.map((item) => ({ id: `image:${item.source_id}`, version: item.git_blob_sha, location: item.path })));
  inputVersions.push(...preflight.input_versions.filter((item) =>
    (item.id.startsWith('catalog-record:') && sourceIds.has(item.id.slice('catalog-record:'.length))) ||
    (item.id.startsWith('asset-record:') && assetIds.has(item.id.slice('asset-record:'.length)))));
  inputVersions.push({ id: `source-map:${asset.src}`,
    version: createHash('sha256').update(JSON.stringify(mapped)).digest('hex'),
    location: `content/assets/source-map.json#${asset.src}` });
  inputVersions.push({ id: `receipt:${upstreamRunId}/${upstreamTaskId}`,
    version: git(root, 'rev-parse', `${ref}:${receiptPath}`), location: receiptPath });
  return {
    run_id: runId, task_id: taskId, scene_id: sceneId, task_type: 'visual_review', review_scope: 'candidate', depends_on: [],
    workflow_version: preflight.workflow_version, harness: 'content_qa', pass: 'visual_review',
    objective: `Independently review the pixels of one existing ${entryId} candidate against its locked render instructions and exact references.`,
    execution_policy: { model_tier: 'economical', routing_reason: 'default_bounded', attempt: 1 },
    source_binding: preflight.source_binding,
    required_acquisition: { markdown, images },
    allowed_sources: [...markdown.flatMap(allowedSource), ...images.map((item) => item.path)],
    forbidden_source_roots: preflight.forbidden_source_roots,
    inputs: { narrative_contract: manifestUsabilityPaths.contract, locked_scene: manifestUsabilityPaths.scene,
      cg_manifest: manifestUsabilityPaths.manifest, cg_entry_id: entryId, candidate_source_id: candidateSourceId,
      candidate_asset_id: entry.output.logical_asset_id, render_spec_sha256: inputVersions.find((item) => item.id === `manifest-entry:${entryId}`).version,
      references: bindings.map((item) => item.source_id), accepted_outputs: [{ id: `manifest-usability-qa:${sceneId}`,
        run_id: upstreamRunId, task_id: upstreamTaskId, status: 'CURRENT_PASS',
        reviewed_manifest_entries_sha256: qaTask.output_versions[0].version }] },
    input_versions: inputVersions,
    reference_transport: { mode: 'references_required', fresh_session_required: true,
      no_unrelated_images_allowed: true },
    constraints: { locked: ['Review exactly one COM-00 base CG; inspect candidate and three reference images as actual pixels.',
      'Preserve Xu Tang identity, ordinary-neighbor distance, corridor axis and dialogue safe zone.'],
      must_not_change: ['Do not create, edit, accept, ingest or replace art or canonical content.',
        'Manifest accepted status and machine checks are not candidate QA or Human approval.'],
      output_format: '.ai/schemas/HANDOFF.md' },
    deliverables: [{ id: `candidate-visual-qa:${entryId}`,
      destination: `generated/session-cache/${runId}/${taskId}.handoff.json` }],
    acceptance: ['Return PASS, NEEDS_REVIEW, FAIL or BLOCKED with visual evidence about identity, wardrobe, framing, environment, continuity, anatomy and style.'],
    handoff_to: 'production_coordinator', human_gate: 'accepted_master_image_selection'
  };
}

export async function verifyCandidateVisualReviewPacket(packet, { root = defaultRoot } = {}) {
  insist(packet && typeof packet === 'object' && !Array.isArray(packet), 'packet must be an object');
  const rebuilt = await buildCandidateVisualReviewPacket({ sceneId: packet.scene_id, runId: packet.run_id,
    taskId: packet.task_id, ref: packet.source_binding?.github?.ref,
    upstreamRunId: packet.inputs?.accepted_outputs?.[0]?.run_id,
    upstreamTaskId: packet.inputs?.accepted_outputs?.[0]?.task_id,
    entryId: packet.inputs?.cg_entry_id, candidateSourceId: packet.inputs?.candidate_source_id, root });
  insist(JSON.stringify(packet) === JSON.stringify(rebuilt),
    'Candidate Visual QA Task Packet fields, allowlist or input hashes differ from canonical sources');
  return true;
}
