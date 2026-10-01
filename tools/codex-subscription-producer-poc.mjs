import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const harnessPaths = { content_qa: '.ai/harnesses/content-qa.md' };
const statuses = new Set(['PASS', 'NEEDS_REVIEW', 'BLOCKED', 'FAIL']);

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function flag(name) {
  return process.argv.includes(`--${name}`);
}

function insist(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function git(...args) {
  return execFileSync('git', ['-C', projectRoot, ...args], { encoding: 'utf8' }).trim();
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

function safeName(value) {
  insist(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value), `unsafe identifier: ${value}`);
  return value;
}

function bundlePath(index, canonicalPath, suffix = '') {
  const base = canonicalPath.replace(/[^a-zA-Z0-9._-]+/g, '_');
  return `sources/${String(index).padStart(3, '0')}-${base}${suffix}`;
}

export async function buildWorkerBundle(packet, { root = projectRoot } = {}) {
  insist(packet?.task_type === 'narrative_review', 'subscription POC currently supports narrative_review only');
  insist(packet?.harness === 'content_qa' && packet?.pass === 'narrative_review',
    'subscription POC requires content_qa / narrative_review');
  insist(packet.required_acquisition?.images?.length === 0, 'first subscription POC is text-only');
  insist(Array.isArray(packet.required_acquisition?.markdown) && packet.required_acquisition.markdown.length > 0,
    'Task Packet has no bounded markdown acquisition');

  const files = [];
  const sourceIndex = [];
  let ordinal = 1;
  for (const source of packet.required_acquisition.markdown) {
    const canonicalPath = source.path;
    insist(typeof canonicalPath === 'string' && !canonicalPath.startsWith('/') &&
      canonicalPath.split('/').every((part) => part && part !== '.' && part !== '..'),
    `unsafe canonical path: ${canonicalPath}`);
    const text = await readFile(path.join(root, canonicalPath), 'utf8');
    insist(text.length > 0, `empty source: ${canonicalPath}`);
    const blob = execFileSync('git', ['-C', root, 'rev-parse',
      `${packet.source_binding.github.ref}:${canonicalPath}`], { encoding: 'utf8' }).trim();
    insist(blob === source.git_blob_sha, `Git blob mismatch while bundling ${canonicalPath}`);

    if (source.excerpts?.length) {
      for (const excerpt of source.excerpts) {
        const body = sliceExcerpt(text, excerpt);
        const relative = bundlePath(ordinal++, canonicalPath,
          `__L${excerpt.start_line}-L${excerpt.end_line}.md`);
        files.push({ relative, text: body });
        sourceIndex.push({
          canonical_source: `${canonicalPath}#L${excerpt.start_line}-L${excerpt.end_line}`,
          canonical_path: canonicalPath,
          worker_path: relative,
          git_blob_sha: source.git_blob_sha,
          excerpt_sha256: excerpt.sha256
        });
      }
    } else {
      const relative = bundlePath(ordinal++, canonicalPath);
      files.push({ relative, text });
      sourceIndex.push({
        canonical_source: canonicalPath,
        canonical_path: canonicalPath,
        worker_path: relative,
        git_blob_sha: source.git_blob_sha
      });
    }
  }

  const harnessPath = harnessPaths[packet.harness];
  insist(harnessPath, `unsupported harness: ${packet.harness}`);
  const [harness, handoffSchemaText] = await Promise.all([
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
      { relative: 'control/task.packet.json', text: packetText },
      { relative: 'control/harness.md', text: harness },
      { relative: 'control/handoff-schema.md', text: handoffSchemaText },
      { relative: 'sources/index.json', text: indexText },
      ...files
    ],
    sourceIndex,
    packetSha256: sha256(packetText)
  };
}

function versionKey(value) {
  return JSON.stringify({ id: value?.id, version: value?.version, location: value?.location });
}

export function validateNarrativeHandoff(packet, handoff) {
  insist(handoff && typeof handoff === 'object' && !Array.isArray(handoff), 'handoff must be a JSON object');
  insist(handoff.run_id === packet.run_id, 'handoff run_id mismatch');
  insist(handoff.task_id === packet.task_id, 'handoff task_id mismatch');
  insist(statuses.has(handoff.status), `invalid handoff status: ${handoff.status}`);
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
  insist(handoff.canon_changes?.none === true, 'review worker must not report canon changes');
  insist(Array.isArray(handoff.known_issues), 'handoff known_issues must be an array');
  insist(Array.isArray(handoff.invalidates), 'handoff invalidates must be an array');
  return true;
}

export function handoffOutputSchema() {
  const version = {
    type: 'object',
    additionalProperties: false,
    properties: {
      id: { type: 'string' },
      version: { type: 'string' },
      location: { type: 'string' }
    },
    required: ['id', 'version', 'location']
  };
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      run_id: { type: 'string' },
      task_id: { type: 'string' },
      status: { enum: ['PASS', 'NEEDS_REVIEW', 'BLOCKED', 'FAIL'] },
      workflow_version: { type: 'string' },
      harness: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          version: { type: 'string' },
          pass: { type: ['string', 'null'] }
        },
        required: ['id', 'version', 'pass']
      },
      inputs_used: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: { source: { type: 'string' }, version: { type: 'string' } },
          required: ['source', 'version']
        }
      },
      attachments_used: { type: 'array', maxItems: 0 },
      outputs: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            source_identity: { type: 'string' }
          },
          required: ['id', 'location', 'description', 'source_identity']
        }
      },
      input_versions: { type: 'array', items: version },
      output_versions: { type: 'array', items: version, minItems: 1, maxItems: 1 },
      qa: {
        type: 'object',
        additionalProperties: false,
        properties: {
          checks: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string' },
                result: { enum: ['PASS', 'NEEDS_REVIEW', 'FAIL', 'BLOCKED'] }
              },
              required: ['name', 'result']
            }
          },
          failure_reason: { type: ['string', 'null'] }
        },
        required: ['checks', 'failure_reason']
      },
      canon_changes: {
        type: 'object',
        additionalProperties: false,
        properties: { none: { const: true } },
        required: ['none']
      },
      known_issues: { type: 'array', items: { type: 'string' } },
      invalidates: { type: 'array', items: { type: 'string' } },
      next_recommended_stage: {
        type: 'object',
        additionalProperties: false,
        properties: {
          harness: { type: ['string', 'null'] },
          pass: { type: ['string', 'null'] }
        },
        required: ['harness', 'pass']
      },
      human_gate_required: {
        enum: ['none', 'major_story_direction', 'canonical_character_design',
          'accepted_master_image_selection', 'narrative_preview_review', 'final_playable_acceptance']
      }
    },
    required: ['run_id', 'task_id', 'status', 'workflow_version', 'harness', 'inputs_used',
      'attachments_used', 'outputs', 'input_versions', 'output_versions', 'qa', 'canon_changes',
      'known_issues', 'invalidates', 'next_recommended_stage', 'human_gate_required']
  };
}

export function codexExecArgs({ workspace, schemaPath, outputPath, model } = {}) {
  const permissionTable =
    'permissions.poc-worker.filesystem={":root"="deny",":minimal"="read",":tmpdir"="deny",":slash_tmp"="deny",":workspace_roots"={"."="read"}}';
  const args = [
    'exec',
    '--ephemeral',
    '--skip-git-repo-check',
    '--ignore-user-config',
    '--ignore-rules',
    '--color', 'never',
    '--cd', workspace,
    '--output-schema', schemaPath,
    '--output-last-message', outputPath,
    '-c', 'approval_policy="never"',
    '-c', 'forced_login_method="chatgpt"',
    '-c', 'history.persistence="none"',
    '-c', 'default_permissions="poc-worker"',
    '-c', permissionTable,
    '-c', 'permissions.poc-worker.network={enabled=false}',
    '-c', 'web_search="disabled"',
    '-c', 'tools.web_search=false',
    '-c', 'features.apps=false',
    '-c', 'features.multi_agent=false',
    '-c', 'features.memories=false',
    '-c', 'features.skill_mcp_dependency_install=false',
    '-c', 'shell_environment_policy.include_only=["PATH"]'
  ];
  if (model) args.push('--model', model);
  args.push('-');
  return args;
}

function sanitizedCodexEnv() {
  const env = { ...process.env };
  delete env.OPENAI_API_KEY;
  delete env.CODEX_API_KEY;
  delete env.CODEX_ACCESS_TOKEN;
  return env;
}

function checkSubscriptionLogin() {
  const env = sanitizedCodexEnv();
  const version = spawnSync('codex', ['--version'], { encoding: 'utf8', env });
  insist(version.status === 0, 'Codex CLI is not installed or not runnable; install/update it first');
  const status = spawnSync('codex', ['login', 'status'], { encoding: 'utf8', env });
  insist(status.status === 0, `Codex is not logged in: ${status.stderr || status.stdout}`);
  const text = `${status.stdout}\n${status.stderr}`.trim();
  insist(!/api[ -]?key/i.test(text), `Codex is using API-key authentication, not ChatGPT subscription: ${text}`);
  insist(/chatgpt|oauth/i.test(text),
    `Could not verify ChatGPT subscription authentication from "codex login status": ${text}`);
  return { version: version.stdout.trim() || version.stderr.trim(), auth: text };
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

function workerPrompt(packet) {
  return [
    'You are a fresh bounded production worker, not the Production Coordinator.',
    'Perform exactly one content_qa / narrative_review task.',
    'Read control/task.packet.json, control/harness.md, control/handoff-schema.md, and sources/index.json.',
    'Use only the source files explicitly mapped by sources/index.json.',
    'Do not use web search, apps, connectors, subagents, memory, or sources outside this workspace.',
    'Do not modify files. This is a read-only semantic review.',
    'Machine preflight and immutable source verification were completed by the local coordinator.',
    'Return exactly one JSON object matching the provided output schema as your final response.',
    'input_versions must exactly preserve Task Packet order and values.',
    'For output_versions, report exactly the reviewed Locked Scene input version and location; review does not mutate it.',
    'Record concrete QA checks and concise issues. Do not rewrite canon or embed replacement prose.'
  ].join(' ');
}

async function materializeWorkspace(bundle, runId, taskId) {
  const base = path.join(os.homedir(), '.cache', 'seventeen-floor-neighbor', 'subscription-poc');
  await mkdir(base, { recursive: true });
  const workspace = path.join(base, `${safeName(runId)}--${safeName(taskId)}`);
  await mkdir(workspace, { recursive: false });
  for (const file of bundle.files) {
    const destination = path.join(workspace, file.relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.text, { flag: 'wx' });
  }
  const schemaPath = path.join(workspace, 'control', 'handoff-output.schema.json');
  await writeFile(schemaPath, `${JSON.stringify(handoffOutputSchema(), null, 2)}\n`, { flag: 'wx' });
  return { workspace, schemaPath, outputPath: path.join(workspace, 'handoff.json') };
}

async function persistHandoff(runId, taskId, handoff) {
  const destination = path.join(projectRoot, 'generated/session-cache', safeName(runId), `${safeName(taskId)}.handoff.json`);
  await mkdir(path.dirname(destination), { recursive: true });
  const body = `${JSON.stringify(handoff, null, 2)}\n`;
  await writeFile(destination, body, { flag: 'wx' });
  return { destination, body };
}

async function main() {
  const sceneId = arg('scene');
  insist(sceneId, 'usage: npm run subscription:poc -- --scene COM-00 [--run-id ... --task-id ... --dry-run]');
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const runId = arg('run-id') || `subscription-poc-${sceneId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${stamp}`;
  const taskId = arg('task-id') || `NQA-${sceneId.replace(/[^A-Z0-9]+/g, '')}-SUB-POC-001`;
  const ref = arg('ref') || git('rev-parse', 'HEAD');
  insist(/^[0-9a-f]{40}$/.test(ref), '--ref must resolve to an exact commit SHA');

  const packetPath = generatePacket({ sceneId, runId, taskId, ref });
  const packet = JSON.parse(await readFile(packetPath, 'utf8'));
  const bundle = await buildWorkerBundle(packet);
  const model = process.env.CODEX_POC_MODEL || null;

  if (flag('dry-run')) {
    const previewRoot = '/isolated/subscription-poc-worker';
    console.log(JSON.stringify({
      mode: 'dry-run',
      execution_backend: 'codex exec',
      billing_route: 'ChatGPT subscription login required for live run',
      run_id: runId,
      task_id: taskId,
      scene_id: sceneId,
      source_ref: ref,
      packet_sha256: bundle.packetSha256,
      source_count: bundle.sourceIndex.length,
      source_index: bundle.sourceIndex,
      worker_workspace: 'outside repository',
      filesystem_policy: 'deny root; read only workspace + minimal runtime',
      network_access: false,
      web_search: false,
      subagents: false,
      session_persistence: false,
      model_override: model,
      codex_args: codexExecArgs({
        workspace: previewRoot,
        schemaPath: `${previewRoot}/control/handoff-output.schema.json`,
        outputPath: `${previewRoot}/handoff.json`,
        model
      })
    }, null, 2));
    return;
  }

  const login = checkSubscriptionLogin();
  const materialized = await materializeWorkspace(bundle, runId, taskId);
  try {
    const result = spawnSync('codex', codexExecArgs({ ...materialized, model }), {
      cwd: materialized.workspace,
      input: workerPrompt(packet),
      encoding: 'utf8',
      env: sanitizedCodexEnv(),
      timeout: Number(process.env.CODEX_POC_TIMEOUT_MS || 900_000),
      maxBuffer: 16 * 1024 * 1024
    });
    insist(result.status === 0,
      `codex exec failed (exit ${result.status}): ${(result.stderr || result.stdout || '').slice(-4000)}`);
    let handoff;
    try {
      handoff = JSON.parse(await readFile(materialized.outputPath, 'utf8'));
    } catch (error) {
      throw new Error(`Codex final output is not valid handoff JSON: ${error.message}`);
    }
    validateNarrativeHandoff(packet, handoff);
    const persisted = await persistHandoff(runId, taskId, handoff);
    console.log(JSON.stringify({
      status: handoff.status,
      run_id: runId,
      task_id: taskId,
      scene_id: sceneId,
      execution_backend: 'codex exec',
      codex_version: login.version,
      auth: login.auth,
      source_ref: ref,
      packet_sha256: bundle.packetSha256,
      handoff_sha256: sha256(persisted.body),
      handoff_path: path.relative(projectRoot, persisted.destination),
      persisted_repo_state: false,
      next_step: 'Coordinator comparison only; this POC does not mutate a Production Run Ledger or create a decision receipt.'
    }, null, 2));
  } finally {
    if (!flag('keep-workspace')) await rm(materialized.workspace, { recursive: true, force: true });
  }
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  main().catch((error) => {
    console.error(`BLOCKED: ${error.message}`);
    process.exitCode = 1;
  });
}
