import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiBase = 'https://api.openai.com/v1';
const harnessPaths = {
  content_qa: '.ai/harnesses/content-qa.md'
};
const statusValues = new Set(['PASS', 'NEEDS_REVIEW', 'BLOCKED', 'FAIL']);

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function flag(name) {
  return process.argv.includes(`--${name}`);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function git(...args) {
  return execFileSync('git', ['-C', projectRoot, ...args], { encoding: 'utf8' }).trim();
}

function insist(condition, message) {
  if (!condition) throw new Error(message);
}

export function sliceExcerpt(text, excerpt) {
  const lines = text.split('\n');
  const start = excerpt.start_line - 1;
  const end = excerpt.end_line;
  insist(Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end > start && end <= lines.length,
    `invalid excerpt range L${excerpt.start_line}-L${excerpt.end_line}`);
  const body = lines.slice(start, end).join('\n');
  insist(sha256(body) === excerpt.sha256,
    `excerpt SHA-256 mismatch for L${excerpt.start_line}-L${excerpt.end_line}`);
  return body;
}

function safeWorkspaceName(index, canonicalPath, suffix = '') {
  const base = canonicalPath.replace(/[^a-zA-Z0-9._-]+/g, '_');
  return `/workspace/sources/${String(index).padStart(3, '0')}-${base}${suffix}`;
}

function inlineFile(pathname, text) {
  return {
    type: 'inline',
    path: pathname,
    data: Buffer.from(text, 'utf8').toString('base64')
  };
}

export async function buildSandboxBundle(packet, { root = projectRoot } = {}) {
  insist(packet?.task_type === 'narrative_review', 'POC currently supports narrative_review only');
  insist(packet?.harness === 'content_qa' && packet?.pass === 'narrative_review',
    'POC requires content_qa / narrative_review');
  insist(Array.isArray(packet.required_acquisition?.markdown) && packet.required_acquisition.markdown.length > 0,
    'Task Packet has no bounded markdown acquisition');

  const sourceFiles = [];
  const sourceIndex = [];
  let ordinal = 1;

  for (const source of packet.required_acquisition.markdown) {
    const canonicalPath = source.path;
    insist(typeof canonicalPath === 'string' && !canonicalPath.startsWith('/') && !canonicalPath.includes('..'),
      `unsafe canonical path: ${canonicalPath}`);
    const absolute = path.join(root, canonicalPath);
    const text = await readFile(absolute, 'utf8');
    insist(text.length > 0, `empty source: ${canonicalPath}`);
    const blob = execFileSync('git', ['-C', root, 'rev-parse', `${packet.source_binding.github.ref}:${canonicalPath}`],
      { encoding: 'utf8' }).trim();
    insist(blob === source.git_blob_sha, `Git blob mismatch while packaging ${canonicalPath}`);

    if (source.excerpts?.length) {
      for (const excerpt of source.excerpts) {
        const body = sliceExcerpt(text, excerpt);
        const workspacePath = safeWorkspaceName(ordinal++, canonicalPath,
          `__L${excerpt.start_line}-L${excerpt.end_line}.md`);
        sourceFiles.push(inlineFile(workspacePath, body));
        sourceIndex.push({
          canonical_source: `${canonicalPath}#L${excerpt.start_line}-L${excerpt.end_line}`,
          canonical_path: canonicalPath,
          workspace_path: workspacePath,
          git_blob_sha: source.git_blob_sha,
          excerpt_sha256: excerpt.sha256
        });
      }
    } else {
      const workspacePath = safeWorkspaceName(ordinal++, canonicalPath);
      sourceFiles.push(inlineFile(workspacePath, text));
      sourceIndex.push({
        canonical_source: canonicalPath,
        canonical_path: canonicalPath,
        workspace_path: workspacePath,
        git_blob_sha: source.git_blob_sha
      });
    }
  }

  const harnessPath = harnessPaths[packet.harness];
  insist(harnessPath, `unsupported harness: ${packet.harness}`);
  const [harness, handoffSchema] = await Promise.all([
    readFile(path.join(root, harnessPath), 'utf8'),
    readFile(path.join(root, '.ai/schemas/HANDOFF.md'), 'utf8')
  ]);
  const packetText = `${JSON.stringify(packet, null, 2)}\n`;
  const indexText = `${JSON.stringify({
    task_id: packet.task_id,
    source_ref: packet.source_binding.github.ref,
    allowed_sources: sourceIndex
  }, null, 2)}\n`;

  return {
    files: [
      inlineFile('/workspace/control/task.packet.json', packetText),
      inlineFile('/workspace/control/harness.md', harness),
      inlineFile('/workspace/control/handoff-schema.md', handoffSchema),
      inlineFile('/workspace/sources/index.json', indexText),
      ...sourceFiles
    ],
    sourceIndex,
    packetSha256: sha256(packetText)
  };
}

function versionKey(value) {
  return JSON.stringify({
    id: value?.id,
    version: value?.version,
    location: value?.location
  });
}

export function validateNarrativeHandoff(packet, handoff) {
  insist(handoff && typeof handoff === 'object' && !Array.isArray(handoff), 'handoff must be a JSON object');
  insist(handoff.run_id === packet.run_id, 'handoff run_id mismatch');
  insist(handoff.task_id === packet.task_id, 'handoff task_id mismatch');
  insist(statusValues.has(handoff.status), `invalid handoff status: ${handoff.status}`);
  insist(handoff.workflow_version === packet.workflow_version, 'handoff workflow_version mismatch');
  insist(handoff.harness?.id === packet.harness && handoff.harness?.pass === packet.pass,
    'handoff harness/pass mismatch');
  insist(Array.isArray(handoff.input_versions), 'handoff input_versions must be an array');
  insist(handoff.input_versions.length === packet.input_versions.length &&
    handoff.input_versions.every((value, index) => versionKey(value) === versionKey(packet.input_versions[index])),
  'handoff input_versions differ from Task Packet');

  const reviewed = packet.input_versions.find((value) => value.location === packet.inputs.locked_scene);
  insist(reviewed, 'Task Packet has no locked-scene input version');
  insist(Array.isArray(handoff.output_versions) && handoff.output_versions.length === 1,
    'narrative_review handoff must report exactly one reviewed output version');
  const output = handoff.output_versions[0];
  insist(output.location === reviewed.location && output.version === reviewed.version,
    'narrative_review output must identify the exact reviewed Locked Scene bytes');

  insist(Array.isArray(handoff.qa?.checks) && handoff.qa.checks.length > 0,
    'handoff must contain semantic QA checks');
  insist(handoff.qa.checks.every((check) => typeof check?.name === 'string' &&
    ['PASS', 'NEEDS_REVIEW', 'FAIL', 'BLOCKED'].includes(check?.result)),
  'handoff contains invalid QA checks');
  insist(handoff.canon_changes?.none === true, 'POC worker must not report canon changes');
  insist(Array.isArray(handoff.known_issues), 'handoff known_issues must be an array');
  insist(Array.isArray(handoff.invalidates), 'handoff invalidates must be an array');
  return true;
}

function modelFor(packet) {
  if (process.env.AGENTS_POC_MODEL) return process.env.AGENTS_POC_MODEL;
  return packet.execution_policy?.model_tier === 'capable' ? 'gpt-6.1-sol' : 'gpt-6-luna';
}

function workerInstructions() {
  return [
    'You are a fresh bounded production worker, not the Production Coordinator.',
    'Perform exactly one content_qa / narrative_review task.',
    'Read /workspace/control/task.packet.json, /workspace/control/harness.md, and /workspace/control/handoff-schema.md.',
    'Read /workspace/sources/index.json and only the source files explicitly mapped there.',
    'Do not search the internet, inspect unrelated workspace files, expand scope, rewrite canon, or modify any source.',
    'Do not delegate to subagents. This POC tests one fresh worker per Task Packet.',
    'Treat machine preflight and immutable input versions as already verified by the caller.',
    'Write exactly one JSON handoff to /workspace/outputs/handoff.json matching the handoff schema.',
    'For output_versions, report the exact reviewed Locked Scene input version/location; review does not mutate it.',
    'Do not write any other output artifact.'
  ].join(' ');
}

function findSessionId(value) {
  if (!value || typeof value !== 'object') return null;
  if (typeof value.session_id === 'string') return value.session_id;
  if (value.object === 'agent.session' && typeof value.id === 'string') return value.id;
  if (value.session && typeof value.session.id === 'string') return value.session.id;
  for (const child of Object.values(value)) {
    const found = findSessionId(child);
    if (found) return found;
  }
  return null;
}

async function apiFetch(pathname, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  insist(apiKey, 'OPENAI_API_KEY is required unless --dry-run is used');
  const response = await fetch(`${apiBase}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'agents=v1',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Agents API ${response.status}: ${body.slice(0, 2000)}`);
  }
  return response;
}

async function streamSession(payload, { verbose = false } = {}) {
  const response = await apiFetch('/agents/sessions', {
    method: 'POST',
    body: JSON.stringify({ ...payload, stream: true })
  });
  insist(response.body, 'Agents API returned no event stream');

  const decoder = new TextDecoder();
  let buffer = '';
  let sessionId = null;
  let failure = null;

  const consume = (block) => {
    const lines = block.split(/\r?\n/);
    const eventName = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
    const data = lines.filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n');
    if (!data || data === '[DONE]') return;
    let parsed;
    try { parsed = JSON.parse(data); } catch { return; }
    sessionId ||= findSessionId(parsed);
    const type = parsed.type || eventName || '';
    if (verbose) console.error(`[agents] ${type || 'event'}`);
    if (String(type).includes('failed')) failure = parsed.error || parsed;
  };

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let split;
    while ((split = buffer.search(/\r?\n\r?\n/)) >= 0) {
      const block = buffer.slice(0, split);
      const match = buffer.slice(split).match(/^\r?\n\r?\n/)[0];
      buffer = buffer.slice(split + match.length);
      consume(block);
    }
  }
  buffer += decoder.decode();
  if (buffer.trim()) consume(buffer);
  insist(sessionId, 'could not determine Agents API session ID');
  if (failure) throw new Error(`agent session failed: ${JSON.stringify(failure).slice(0, 2000)}`);
  return sessionId;
}

async function fetchHandoffArtifact(sessionId) {
  let artifact;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await apiFetch(`/agents/sessions/${encodeURIComponent(sessionId)}/artifacts?limit=100&order=desc`);
    const listing = await response.json();
    artifact = listing.data?.find((item) => item.path === '/workspace/outputs/handoff.json');
    if (artifact) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  insist(artifact, 'completed session did not publish /workspace/outputs/handoff.json');
  const content = await apiFetch(
    `/agents/sessions/${encodeURIComponent(sessionId)}/artifacts/${encodeURIComponent(artifact.id)}/content`);
  return { artifact, text: await content.text() };
}

async function deleteSession(sessionId) {
  try {
    await apiFetch(`/agents/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
  } catch (error) {
    console.error(`WARN: could not delete Agents API session ${sessionId}: ${error.message}`);
  }
}

function generatePacket({ sceneId, runId, taskId, ref }) {
  const create = spawnSync(process.execPath, [
    'tools/context.mjs', '--task', 'narrative_review', '--scene', sceneId,
    '--run-id', runId, '--task-id', taskId, '--ref', ref
  ], { cwd: projectRoot, encoding: 'utf8', timeout: 180_000 });
  insist(create.status === 0, `Task Packet generation failed: ${create.stderr || create.stdout}`);
  const packetPath = path.join(projectRoot, 'generated/session-cache', runId, `${taskId}.packet.json`);
  const verify = spawnSync(process.execPath, ['tools/context.mjs', '--verify-packet', packetPath],
    { cwd: projectRoot, encoding: 'utf8', timeout: 180_000 });
  insist(verify.status === 0, `Task Packet verification failed: ${verify.stderr || verify.stdout}`);
  return packetPath;
}

async function main() {
  const sceneId = arg('scene');
  insist(sceneId, 'usage: npm run agents:poc -- --scene COM-00 [--run-id ... --task-id ... --dry-run]');
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const runId = arg('run-id') || `agents-poc-${sceneId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${stamp}`;
  const taskId = arg('task-id') || `NQA-${sceneId.replace(/[^A-Z0-9]+/g, '')}-AGENTS-POC-001`;
  const ref = arg('ref') || git('rev-parse', 'HEAD');
  insist(/^[0-9a-f]{40}$/.test(ref), '--ref must resolve to an exact commit SHA');

  const packetPath = generatePacket({ sceneId, runId, taskId, ref });
  const packet = JSON.parse(await readFile(packetPath, 'utf8'));
  const bundle = await buildSandboxBundle(packet);
  const model = modelFor(packet);

  if (flag('dry-run')) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      run_id: runId,
      task_id: taskId,
      scene_id: sceneId,
      source_ref: ref,
      model,
      packet_sha256: bundle.packetSha256,
      source_count: bundle.sourceIndex.length,
      source_index: bundle.sourceIndex,
      network_access: 'disabled',
      repo_write_access: false
    }, null, 2));
    return;
  }

  let sessionId;
  try {
    sessionId = await streamSession({
      agent: {
        model,
        instructions: workerInstructions()
      },
      environment: {
        type: 'openai_hosted',
        container_size: 'small',
        network: { access: 'disabled' },
        files: bundle.files
      },
      input: `Execute Task Packet ${taskId} for ${sceneId}. Produce only /workspace/outputs/handoff.json.`
    }, { verbose: flag('verbose') });

    const { artifact, text } = await fetchHandoffArtifact(sessionId);
    let handoff;
    try { handoff = JSON.parse(text); } catch (error) {
      throw new Error(`handoff artifact is not valid JSON: ${error.message}`);
    }
    validateNarrativeHandoff(packet, handoff);

    const handoffPath = path.join(projectRoot, 'generated/session-cache', runId, `${taskId}.handoff.json`);
    await mkdir(path.dirname(handoffPath), { recursive: true });
    await writeFile(handoffPath, `${JSON.stringify(handoff, null, 2)}\n`, { flag: 'wx' });

    console.log(JSON.stringify({
      status: handoff.status,
      run_id: runId,
      task_id: taskId,
      scene_id: sceneId,
      model,
      source_ref: ref,
      packet_sha256: bundle.packetSha256,
      handoff_sha256: sha256(`${JSON.stringify(handoff, null, 2)}\n`),
      handoff_path: path.relative(projectRoot, handoffPath),
      agent_session_id: sessionId,
      artifact_id: artifact.id,
      persisted_repo_state: false,
      next_step: 'Coordinator review only; this POC does not mutate a Production Run Ledger or create a decision receipt.'
    }, null, 2));
  } finally {
    if (sessionId && !flag('keep-session')) await deleteSession(sessionId);
  }
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  main().catch((error) => {
    console.error(`BLOCKED: ${error.message}`);
    process.exitCode = 1;
  });
}
