import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
