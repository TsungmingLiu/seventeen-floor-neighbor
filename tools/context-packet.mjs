import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyProductionRun } from './verify-production-run.mjs';
import { validateRepoSourceCatalog } from './render-cg-packets.mjs';

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
  const contextPaths = [...new Set([...section.matchAll(/^- `([^`]+)`/gm)].map((match) => match[1])
    .filter((relative) => relative.startsWith('docs/narrative/')))];
  insist(contextPaths.length > 0, `${scenePath} declares no narrative canon`);
  contextPaths.forEach((relative) => insist(isCanonicalNarrative(relative), `noncanonical narrative input: ${relative}`));

  const sources = [contractPath, scenePath, ...contextPaths];
  const markdown = [];
  for (const relative of sources) {
    const source = await trackedText(root, ref, relative, forbiddenRoots);
    const excerpts = sourceExcerpts(relative, source.text, sceneId);
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
    input_versions: markdown.map((source) => ({ id: `file:${source.path}`, version: source.git_blob_sha, location: source.path })),
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
    referenceIds.includes('source.opening.ch1.bg.apt_17f_rain'), 'Xu Tang face, wardrobe and COM-00 environment references are required');
  insist(referenceIds.every((id) => ['ref.xu_tang.face.01', 'ref.xu_tang.wardrobe.a',
    'ref.xu_tang.body.03', 'source.opening.ch1.bg.apt_17f_rain'].includes(id)),
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
      'ref.xu_tang.body.03': ['body_proportions', 'optional-reference'],
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
