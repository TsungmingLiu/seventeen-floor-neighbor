import { execFileSync } from 'node:child_process';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileReviewContext, writeScratchFiles } from './compile-review-context.mjs';
import { preflightReview, runCheck, digest, hash } from './preflight-review.mjs';
import { configuredTrial, readonlyWorker } from './readonly-quota-worker.mjs';
import { resultSchema, parseWorkerEvents } from './benchmark-review-context.mjs';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const encode = (value) => `${JSON.stringify(value, null, 2)}\n`;
const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
const size = (text) => Buffer.byteLength(text);
export const observationScenes = ['COM-00', 'COM-01X', 'COM-02X'];
function destination(runId) {
  if (!/^[a-zA-Z0-9_-]+$/.test(runId || '')) throw new Error('invalid run ID');
  return `generated/session-cache/quota-observation/${runId}`;
}

export async function buildObservation({ root = defaultRoot, ref = 'origin/main' } = {}) {
  if (typeof ref !== 'string' || ref.startsWith('-')) throw new Error('invalid source ref');
  const sourceRef = git(root, 'rev-parse', '--verify', `${ref}^{commit}`);
  const files = [['result.schema.json', encode(resultSchema)]], tasks = [];
  for (const sceneId of observationScenes) {
    const compiled = await compileReviewContext({ root, sceneId, base: sourceRef, ref: sourceRef });
    const packet = JSON.parse(compiled.packetBody);
    const shared = await Promise.all(compiled.metrics.shared_instructions.map(async (item) => {
      const text = await readFile(path.join(root, item.path), 'utf8');
      return { path: item.path, text, sha256: hash(text), bytes: size(text), kind: 'mandatory_instruction' };
    }));
    const instructions = [
      'You are one fresh content_qa / narrative_review worker in a READ-ONLY ENGINEERING OBSERVATION of a real committed scene.',
      'All mandatory instructions and exact allowlisted source text are supplied inline. The Coordinator completed the required existing machine preflight immediately before dispatch. Do not use tools, browse, read files, expand scope, or rewrite any content.',
      'The scene is unchanged committed canon, not a synthetic fault or alternate draft. Apply the full narrative_review harness, including NQA-DIALOGUE-NATURALISM, to the whole target scene. Do not force a finding or infer another character\'s knowledge.',
      'This observation creates no production QA receipt, Handoff, ledger, scene approval or Human decision. Return only the diagnostic JSON schema: status, naturalism, and at most 8 findings (category, severity, exact node/branch, short verbatim evidence, reason). Distinguish advisory suggestions from hard conflicts.',
      ...shared.map((item) => `## Mandatory instruction: ${item.path}\n${item.text}`)
    ].join('\n\n') + '\n';
    const sources = compiled.metrics.sources.map((item) => {
      const full = execFileSync('git', ['-C', root, 'show', `${sourceRef}:${item.path}`], { encoding: 'utf8' });
      const text = item.excerpts.length ? item.excerpts.map((part) => full.split('\n').slice(part.start_line - 1, part.end_line).join('\n')).join('\n\n') : full;
      return { path: item.path, text, sha256: hash(text), bytes: size(text), git_blob_sha: item.git_blob_sha,
        excerpts: item.excerpts, kind: 'allowlisted_canon' };
    });
    const input = [`# ${sceneId} narrative_review`, '## Canonical Task Packet', compiled.packetBody,
      ...sources.map(({ text, ...item }) => `## ${item.path}\n${JSON.stringify(item)}\n${text}`)].join('\n\n') + '\n';
    const payloadHash = hash(`${instructions}\n${input}`);
    tasks.push({ scene_id: sceneId, packet: `${sceneId}.packet.json`, instructions: `${sceneId}.instructions.md`,
      input: `${sceneId}.input.md`, packet_sha256: hash(compiled.packetBody), instructions_sha256: hash(instructions),
      input_sha256: hash(input), baseline_payload_sha256: payloadHash, preflight_payload_sha256: payloadHash,
      payload_bytes: size(instructions + '\n' + input), shared_instruction_bytes: size(instructions),
      sources: [...shared, ...sources].map(({ text, ...item }) => item) });
    files.push([`${sceneId}.packet.json`, compiled.packetBody], [`${sceneId}.instructions.md`, instructions], [`${sceneId}.input.md`, input]);
  }
  const tools = {};
  for (const name of ['observe-review-dispatch.mjs', 'preflight-review.mjs', 'readonly-quota-worker.mjs',
    'compile-review-context.mjs', 'context-packet.mjs', 'benchmark-review-context.mjs']) {
    tools[name] = hash(await readFile(path.join(root, 'tools', name)));
  }
  const manifest = { lifecycle: 'GENERATED_ENGINEERING_OBSERVATION', source_ref: sourceRef, tools, tasks,
    sampling: 'Three retrospective real canonical scenes, one fresh diagnostic review per eligible scene, no synthetic fault, no retry.',
    comparison: 'Both existing pre-dispatch verifier and new preflight run outside the model. Same exact semantic payload for both paths. Only one path invokes a worker; no paired token reduction estimate.',
    production_approval: false };
  files.push(['manifest.json', encode(manifest)]);
  return { manifest, files };
}

async function verifiedPreparation(root, relative) {
  const manifestPath = path.join(root, relative, 'manifest.json');
  if (await realpath(manifestPath) !== manifestPath) throw new Error('prepared manifest is a symlink');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const rebuilt = await buildObservation({ root, ref: manifest.source_ref });
  for (const [name, expected] of rebuilt.files) {
    const location = path.join(root, relative, name);
    if (await realpath(location) !== location || !(await stat(location)).isFile() || await readFile(location, 'utf8') !== expected) {
      throw new Error(`prepared observation drift: ${name}`);
    }
  }
  return rebuilt.manifest;
}

export function summarizeObservation(manifest, records) {
  if (records.length !== manifest.tasks.length || new Set(records.map((item) => item.scene_id)).size !== records.length ||
      records.some((item) => !manifest.tasks.some((task) => task.scene_id === item.scene_id))) throw new Error('missing/duplicate observation records');
  const tasks = manifest.tasks.map((task) => {
    const record = records.find((item) => item.scene_id === task.scene_id);
    if (task.baseline_payload_sha256 !== task.preflight_payload_sha256) throw new Error('comparison payloads differ');
    const ready = record.existing.ok && record.preflight.report.dispatch_allowed;
    if (Boolean(record.worker) !== ready) throw new Error('dispatch record violates mechanical gate');
    if (record.worker && (record.worker.input_sha256 !== task.input_sha256 || record.worker.instructions_sha256 !== task.instructions_sha256)) {
      throw new Error('worker input binding mismatch');
    }
    if (record.worker && (record.worker.name !== task.scene_id || record.worker.tool_calls !== 0 ||
        record.worker.total_tokens !== record.worker.usage.input_tokens + record.worker.usage.output_tokens)) throw new Error('invalid worker accounting');
    return { scene_id: task.scene_id, existing_verifier_ready: record.existing.ok,
      preflight_ready: record.preflight.report.dispatch_allowed, worker_dispatched: Boolean(record.worker),
      same_semantic_payload: task.baseline_payload_sha256 === task.preflight_payload_sha256,
      payload_bytes: task.payload_bytes, existing_coordinator_log_bytes: size(record.existing.stdout + record.existing.stderr),
      preflight_coordinator_digest_bytes: size(JSON.stringify(digest(record.preflight.report)) + '\n'),
      logs_forwarded_to_worker_bytes: 0, new_tool_acquisitions: record.worker?.tool_calls || 0,
      mechanical_ms: record.mechanical_ms, semantic_status: record.worker?.result.status || 'NOT_DISPATCHED',
      naturalism: record.worker?.result.naturalism || 'NOT_DISPATCHED', usage: record.worker?.usage || null,
      total_tokens: record.worker?.total_tokens || 0, elapsed_ms: record.worker?.elapsed_ms || 0,
      findings: record.worker?.result.findings || [] };
  });
  const repeated = new Map();
  for (const task of manifest.tasks) for (const source of task.sources) {
    const key = `${source.path}:${source.sha256}`;
    const row = repeated.get(key) || { ...source, deliveries: 0 };
    row.deliveries++; repeated.set(key, row);
  }
  const usage = {};
  for (const name of ['input_tokens', 'output_tokens', 'cached_input_tokens', 'reasoning_output_tokens']) {
    usage[name] = tasks.reduce((sum, task) => sum + (task.usage?.[name] || 0), 0);
  }
  return { source_ref: manifest.source_ref, tasks, counts: {
    tasks: tasks.length, existing_verifier_ready: tasks.filter((item) => item.existing_verifier_ready).length,
    preflight_ready: tasks.filter((item) => item.preflight_ready).length,
    actual_model_calls: tasks.filter((item) => item.worker_dispatched).length,
    blocked_before_model: tasks.filter((item) => !item.worker_dispatched).length,
    additional_blocks_vs_existing_verifier: tasks.filter((item) => item.existing_verifier_ready && !item.preflight_ready).length },
    actual_usage: usage, actual_total_tokens: usage.input_tokens + usage.output_tokens,
    repeated_source_deliveries: [...repeated.values()].filter((item) => item.deliveries > 1),
    unit: 'Repeated inline deliveries, not observed file reads, attention, or automatically removable context. Cached/reasoning tokens are subsets, never added twice.',
    baseline_tokens: null, token_reduction: 'NOT_ESTIMABLE_UNPAIRED', quota_reduction: 'NOT_MEASURED', production_approval: false,
    conclusion: 'Observation only. Existing workflow already runs machine checks before dispatch. No fictional mechanical-agent baseline. Mandatory context remains in every fresh worker. No formal QA adoption or production failure-frequency estimate.' };
}

export async function runObservation({ root = defaultRoot, runId } = {}) {
  const relative = destination(runId);
  const manifest = await verifiedPreparation(root, relative);
  const settings = await configuredTrial();
  // Exclusive creation prevents replaying paid calls after an interrupted run.
  await writeScratchFiles(relative, [['execution.json', encode({ tooling_ref: git(root, 'rev-parse', 'HEAD'), settings,
    automatic_retry: false, maximum_calls: observationScenes.length })]], { root });
  const records = [];
  for (const task of manifest.tasks) {
    await verifiedPreparation(root, relative); // Source, schema, instructions and tooling must still match.
    let started = Date.now();
    const existing = await runCheck(root, 'tools/context.mjs', ['--verify-packet', `${relative}/${task.packet}`]);
    const existingMs = Date.now() - started;
    started = Date.now();
    const preflight = await preflightReview({ root, packetPath: `${relative}/${task.packet}` });
    const record = { scene_id: task.scene_id, existing, preflight,
      mechanical_ms: { existing_verifier: existingMs, preflight: Date.now() - started }, worker: null };
    await writeScratchFiles(relative, [[`${task.scene_id}.dispatch.json`, encode(record)]], { root });
    if (existing.ok && preflight.report.dispatch_allowed) {
      const instructions = await readFile(path.join(root, relative, task.instructions), 'utf8');
      const input = await readFile(path.join(root, relative, task.input), 'utf8');
      record.worker = await readonlyWorker({ root, relative, name: task.scene_id, instructions, input, settings });
    }
    records.push(record);
  }
  const summary = summarizeObservation(manifest, records);
  await writeScratchFiles(relative, [['observation-summary.json', encode(summary)]], { root });
  return summary;
}

export async function reviewObservation({ root = defaultRoot, runId } = {}) {
  const relative = destination(runId), directory = path.join(root, relative);
  const manifest = await verifiedPreparation(root, relative);
  const records = [], evidence = [];
  for (const task of manifest.tasks) {
    const body = await readFile(path.join(directory, `${task.scene_id}.dispatch.json`), 'utf8');
    const record = JSON.parse(body);
    if (record.scene_id !== task.scene_id) throw new Error('dispatch identity drift');
    if (record.existing.ok && record.preflight.report.dispatch_allowed) {
      const raw = await readFile(path.join(directory, `${task.scene_id}.events.jsonl`), 'utf8');
      const workerBody = await readFile(path.join(directory, `${task.scene_id}.result.json`), 'utf8');
      record.worker = JSON.parse(workerBody);
      const parsed = parseWorkerEvents(raw);
      if (record.worker.name !== task.scene_id || JSON.stringify(parsed.usage) !== JSON.stringify(record.worker.usage) ||
          JSON.stringify(parsed.result) !== JSON.stringify(record.worker.result) || parsed.total_tokens !== record.worker.total_tokens ||
          parsed.tool_calls !== record.worker.tool_calls) throw new Error('raw worker/result drift');
      evidence.push({ scene_id: task.scene_id, events_sha256: hash(raw), result_sha256: hash(workerBody), dispatch_sha256: hash(body) });
    } else evidence.push({ scene_id: task.scene_id, dispatch_sha256: hash(body) });
    records.push(record);
  }
  const summary = summarizeObservation(manifest, records);
  if (encode(summary) !== await readFile(path.join(directory, 'observation-summary.json'), 'utf8')) throw new Error('summary drift');
  const report = ['# 真實場景派工觀測', '', `來源：${summary.source_ref}。三幕 unchanged canonical scenes；工程觀測，不是正式 QA／Human approval。`, '',
    '| 場景 | 原有 verifier | 新 preflight | 唯讀 review | Naturalism | Reported tokens |',
    '| --- | --- | --- | --- | --- | ---: |', ...summary.tasks.map((task) => `| ${task.scene_id} | ${task.existing_verifier_ready ? 'READY' : 'BLOCKED'} | ${task.preflight_ready ? 'READY' : 'BLOCKED'} | ${task.semantic_status} | ${task.naturalism} | ${task.total_tokens.toLocaleString('en-US')} |`), '',
    `實際模型呼叫 ${summary.counts.actual_model_calls} 次；新增攔截 ${summary.counts.additional_blocks_vs_existing_verifier} 次。Input ${summary.actual_usage.input_tokens} + output ${summary.actual_usage.output_tokens} = ${summary.actual_total_tokens} reported tokens。Cached input ${summary.actual_usage.cached_input_tokens}、reasoning output ${summary.actual_usage.reasoning_output_tokens} 是子集，不另加總。`, '',
    '兩種入口的 semantic payload SHA 相同；這輪只跑一份真實 review，沒有多跑 baseline 模型。因此沒有 paired token reduction／quota 減幅。兩種入口都在模型外跑既有 validators，不捏造多一個 mechanical agent 的 baseline。', '',
    'Worker 的 raw logs 輸入為 0；所有工具取檔事件為 0（所需 sources 與 mandatory instructions 已 inline）。重複 sources 的統計是 inline deliveries，不是多餘取檔，也不表示能刪除 fresh-worker 必讀規則。', '',
    '這是三個 retrospective real-scene tasks，不能推估日常 production failure frequency。工程觀測會多跑兩套機械入口作比較；並非建議正式 workflow 重複執行兩套 checks。', '',
    '## 唯讀 review findings', '', ...summary.tasks.flatMap((task) => [`### ${task.scene_id}`, '', '```json', encode(task.findings).trim(), '```', '']),
    '## 完全相同來源的重複投遞', '', '| Path | Kind | 次數 | 每次 bytes |', '| --- | --- | ---: | ---: |',
    ...summary.repeated_source_deliveries.map((item) => `| ${item.path} | ${item.kind} | ${item.deliveries} | ${item.bytes} |`), '',
    '沒有改稿、CG generation、runtime 或 production ledger／receipt。結果仍需 Human 判讀，不能覆蓋既有 acceptance。', ''].join('\n');
  await writeScratchFiles(relative, [['observation-report.md', report], ['evidence.json', encode({ manifest_sha256: hash(encode(manifest)), evidence })]], { root });
  return { relative, summary };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (![3, 5].includes(args.length) || !['--prepare', '--run', '--review'].includes(args[0]) || args[1] !== '--run-id' ||
        (args.length === 5 && (args[0] !== '--prepare' || args[3] !== '--ref'))) throw new Error('Usage: --prepare|--run|--review --run-id <id> [--ref <commit>]');
    const relative = destination(args[2]);
    if (args[0] === '--prepare') {
      const prepared = await buildObservation({ ref: args[4] });
      await writeScratchFiles(relative, prepared.files);
      console.log(encode({ relative, source_ref: prepared.manifest.source_ref, tasks: prepared.manifest.tasks.map(({ scene_id, payload_bytes }) => ({ scene_id, payload_bytes })) }));
    } else if (args[0] === '--run') {
      const summary = await runObservation({ runId: args[2] }); console.log(encode({ counts: summary.counts, actual_usage: summary.actual_usage, actual_total_tokens: summary.actual_total_tokens }));
    } else { const result = await reviewObservation({ runId: args[2] }); console.log(`Verified report: ${result.relative}/observation-report.md`); }
  } catch (error) { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; }
}
