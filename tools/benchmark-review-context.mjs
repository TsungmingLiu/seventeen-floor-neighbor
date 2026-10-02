import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { compileReviewContext, writeScratchFiles } from './compile-review-context.mjs';

const rootDefault = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = (text) => createHash('sha256').update(text).digest('hex');
const encode = (value) => `${JSON.stringify(value, null, 2)}\n`;
const size = (value) => Buffer.byteLength(value);
export const arms = ['baseline', 'continuity', 'digest', 'combined'];
const continuityHeadings = {
  'COM-00.md': ['## Scene summary', '### `common_movein_rain_names`', '### `common_movein_rain_goodnight`',
    '## State contract', '## Dialogue writing notes', '## End state'],
  'COM-01X.md': ['## Scene summary', '### `common_elevator_restart_smalltalk`', '### `common_elevator_restart_exit`',
    '## State contract', '## Dialogue writing notes', '## End state']
};

export function selectHeadings(text, headings) {
  const lines = text.split('\n');
  return headings.map((heading) => {
    const matches = lines.flatMap((line, i) => line === heading ? [i] : []);
    if (matches.length !== 1) throw new Error(`missing/ambiguous continuity heading: ${heading}`);
    const start = matches[0], level = heading.match(/^#+/)[0].length;
    let end = lines.findIndex((line, i) => i > start && /^#+ /.test(line) && line.match(/^#+/)[0].length <= level);
    if (end < 0) end = lines.length;
    const selected = lines.slice(start, end).join('\n');
    return { label: heading, start_line: start + 1, end_line: end, sha256: hash(selected), text: selected };
  });
}

function replaceOnce(text, before, after) {
  if (text.split(before).length !== 2) throw new Error(`fixture anchor missing/ambiguous: ${before}`);
  return text.replace(before, after);
}

// Recipes only are tracked. Candidates and the hidden scoring key live in scratch.
export function makeCases(scene) {
  const line = '**Protagonist**：欸，許棠。妳也下來買東西？';
  const branch = '#### Branch `com02x_ask_food`';
  const branchStart = scene.indexOf(branch), branchEnd = scene.indexOf('#### Branch `com02x_share_work`');
  if (branchStart < 0 || branchEnd < branchStart) throw new Error('missing branch fixture boundary');
  const branchText = scene.slice(branchStart, branchEnd);
  const brokenBranch = replaceOnce(branchText, '→ Rejoin `common_convenience_xu_work`', '→ Rejoin `common_convenience_xu_exit`');
  let unnatural = scene;
  for (const [before, after] of [
    ['**Xu Tang**：喔，我懂。', '**Xu Tang**：你的行為清楚呈現都市居住者在晚間時間配置上的共同困境，我完全理解並認同你的選擇。'],
    ['**Xu Tang**：喔。那差不多。', '**Xu Tang**：經過比較，我們目前的需求與解決方案具有高度一致性，因此可得出相近的結論。'],
    ['**Xu Tang**：喔。至少今天結束了。', '**Xu Tang**：既然今日工作的執行流程已告終，我們應肯定任務完成的成果，並為下一階段保留充足精力。']
  ]) unnatural = replaceOnce(unnatural, before, after);
  return [
    { id: 'T01', text: scene, gold: { kind: 'control', category: null, node: null } },
    { id: 'T02', text: replaceOnce(scene, '對。我剛剛挑半天，結果只是挑了比較快的。', '對。我剛剛挑了半天，結果只是挑了比較快的。'), gold: { kind: 'control', category: null, node: null } },
    { id: 'T03', text: replaceOnce(scene, line, '**Protagonist**：欸，許棠。昨天妳給我的手機號碼，我已經存好了。'),
      gold: { kind: 'hard', category: 'knowledge', node: 'common_convenience_xu_recognize' } },
    { id: 'T04', text: replaceOnce(scene, '**Action**：我也看了她手上的餐盒。兩人停了半秒，冷藏櫃壓縮機重新響起來。',
      '**Action**：我牽起許棠的手。她靠在我肩上，說今晚是我們的第一次約會。'),
      gold: { kind: 'hard', category: 'relationship', node: 'common_convenience_xu_recognize' } },
    { id: 'T05', text: scene.slice(0, branchStart) + brokenBranch + scene.slice(branchEnd),
      gold: { kind: 'hard', category: 'choices', node: 'com02x_ask_food' } },
    { id: 'T06', text: unnatural, gold: { kind: 'advisory', category: 'naturalism', node: null } }
  ];
}

export const resultSchema = {
  type: 'object', additionalProperties: false, required: ['status', 'naturalism', 'findings'], properties: {
    status: { type: 'string', enum: ['PASS', 'NEEDS_REVIEW', 'FAIL', 'BLOCKED'] },
    naturalism: { type: 'string', enum: ['PASS', 'NEEDS_REVIEW', 'FAIL', 'BLOCKED'] },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['category', 'severity', 'node', 'evidence', 'reason'], properties: {
        category: { type: 'string', enum: ['knowledge', 'relationship', 'choices', 'naturalism', 'other'] },
        severity: { type: 'string', enum: ['hard', 'advisory'] }, node: { type: 'string' },
        evidence: { type: 'string' }, reason: { type: 'string' }
      } } }
  }
};

export async function buildBenchmark({ root = rootDefault, base, ref } = {}) {
  const compiled = await compileReviewContext({ root, sceneId: 'COM-02X', base, ref });
  const packet = JSON.parse(compiled.packetBody);
  const shared = [];
  for (const item of compiled.metrics.shared_instructions) shared.push(`## Mandatory instruction: ${item.path}\n${await readFile(path.join(root, item.path), 'utf8')}`);
  const instructions = [
    'You are a fresh, isolated content_qa / narrative_review worker in a READ-ONLY ENGINEERING EXPERIMENT.',
    'All required instructions and allowlisted source text are inline below. Do not use tools, browse, read files or rewrite content. Review only this supplied candidate and evidence.',
    'The packet binds the immutable BASE canon. The supplied GENERATED candidate replaces only the target Locked Scene for this experiment; its digest is separately recorded. Do not reject it merely because it differs from the base hash.',
    'This experiment is not production dispatch: no production ledger, approval, standard production handoff or Human gate is created. Existing production packets/verifiers remain unchanged. The source projection is experimental.',
    'Return ONLY JSON matching the result schema: status, naturalism, findings. Findings: category knowledge/relationship/choices/naturalism/other; severity hard/advisory; exact node or branch; short verbatim evidence; short reason. At most 8 findings. Explicitly evaluate NQA-DIALOGUE-NATURALISM in naturalism. Do not guess planted errors or force a FAIL.',
    'Apply the full narrative_review harness to the entire target scene. Do not review CG aesthetics or archived art implementation. distinguish tentative naturalism advice from hard canon/continuity errors. Prose itself must earn its contract payoffs.',
    ...shared
  ].join('\n\n') + '\n';
  const sourceRef = compiled.metrics.source_ref;
  const sources = compiled.metrics.sources.map((item) => {
    const full = execFileSync('git', ['-C', root, 'show', `${sourceRef}:${item.path}`], { encoding: 'utf8' });
    const selected = item.excerpts.length ? item.excerpts.map((part) => full.split('\n').slice(part.start_line - 1, part.end_line).join('\n')).join('\n\n') : full;
    return { ...item, full, selected };
  });
  const target = sources.find((source) => source.path === packet.inputs.locked_scene);
  const cases = makeCases(target.full);
  const { required_acquisition, allowed_sources, input_versions, source_binding, ...routing } = packet;
  const compactMetadata = { ...routing, source_binding }; // Source rows below carry each version once.
  const files = [['instructions.md', instructions], ['result.schema.json', encode(resultSchema)], ['base.packet.json', compiled.packetBody]];
  const matrix = [];
  const audits = [];
  for (const arm of arms) {
    const sliced = arm === 'continuity' || arm === 'combined';
    const digest = arm === 'digest' || arm === 'combined';
    const projected = sources.map((source) => {
      const headings = continuityHeadings[path.posix.basename(source.path)];
      const excerpts = sliced && headings ? selectHeadings(source.full, headings) : source.excerpts;
      const text = sliced && headings ? excerpts.map((part) => part.text).join('\n\n') : source.selected;
      return { path: source.path, git_blob_sha: source.git_blob_sha,
        excerpts: excerpts.map(({ text: _text, ...part }) => part), text };
    });
    audits.push({ arm, sources: projected.map(({ text, ...source }) => ({ ...source, selected_sha256: hash(text), bytes: size(text) })) });
    for (const candidate of cases) {
      const metadata = digest ? JSON.stringify(compactMetadata) : compiled.packetBody;
      const binding = encode({ base_ref: sourceRef, candidate_sha256: hash(candidate.text), projection: 'EXPERIMENTAL' });
      const body = [metadata, binding, ...projected.map((source) => {
        const text = source.path === target.path ? candidate.text : source.text;
        const locator = { path: source.path, git_blob_sha: source.git_blob_sha, excerpts: source.excerpts,
          supplied_sha256: hash(text) };
        return `## Source: ${source.path}\n${digest ? JSON.stringify(locator) : encode(locator)}\n${text}`;
      })].join('\n\n') + '\n';
      const filename = `${arm}-${candidate.id}.input.md`;
      files.push([filename, body]);
      matrix.push({ arm, case_id: candidate.id, input: filename, sha256: hash(body),
        task_bytes: size(body), shared_bytes: size(instructions), total_bytes: size(body) + size(instructions) });
    }
  }
  const comparison = arms.map((arm) => {
    const row = matrix.find((item) => item.arm === arm && item.case_id === 'T01');
    const baseline = matrix.find((item) => item.arm === 'baseline' && item.case_id === 'T01');
    return { arm, bytes: row.total_bytes, reduction_percent: Number((100 * (baseline.total_bytes - row.total_bytes) / baseline.total_bytes).toFixed(2)) };
  });
  const manifest = { lifecycle: 'GENERATED_EXPERIMENT', source_ref: sourceRef, base_ref: compiled.metrics.base_ref,
    tool_sha256: hash(await readFile(fileURLToPath(import.meta.url))), instructions_sha256: hash(instructions),
    compiler_sha256: compiled.metrics.compiler_sha256, resolver_sha256: compiled.metrics.resolver_sha256,
    schema_sha256: hash(encode(resultSchema)), base_packet_sha256: hash(compiled.packetBody), matrix, comparison,
    threshold: { hard_recall: 1, minimum_total_token_reduction_percent: 20 }, human_blind_review: 'PENDING' };
  files.push(['manifest.json', encode(manifest)], ['source-audit.json', encode(audits)], ['scoring-key.json', encode(cases.map(({ text: _text, ...item }) => item))]);
  return { manifest, files };
}

export function parseWorkerEvents(jsonl) {
  const events = jsonl.split('\n').filter(Boolean).map((line) => JSON.parse(line));
  const turns = events.filter((item) => item.type === 'turn.completed');
  if (turns.length !== 1 || events.some((item) => ['turn.failed', 'error'].includes(item.type))) throw new Error('worker did not complete exactly one successful turn');
  const usage = turns[0].usage;
  if (!usage || !['input_tokens', 'output_tokens', 'cached_input_tokens'].every((key) => Number.isFinite(usage[key]) && usage[key] >= 0)) throw new Error('missing real worker usage');
  const text = events.filter((item) => item.type === 'item.completed' && item.item?.type === 'agent_message').at(-1)?.item.text;
  const result = JSON.parse(text);
  if (!['PASS', 'NEEDS_REVIEW', 'FAIL', 'BLOCKED'].includes(result.status) ||
      !['PASS', 'NEEDS_REVIEW', 'FAIL', 'BLOCKED'].includes(result.naturalism) || !Array.isArray(result.findings) || result.findings.length > 8 ||
      result.findings.some((finding) => !['knowledge', 'relationship', 'choices', 'naturalism', 'other'].includes(finding.category) ||
        !['hard', 'advisory'].includes(finding.severity) || !['node', 'evidence', 'reason'].every((key) => typeof finding[key] === 'string' && finding[key].trim()))) throw new Error('invalid worker QA result');
  const tools = events.filter((item) => item.type === 'item.completed' && ['command_execution', 'mcp_tool_call', 'web_search', 'file_change'].includes(item.item?.type));
  if (tools.length) throw new Error('worker expanded scope with tools; experiment invalid');
  return { usage, total_tokens: usage.input_tokens + usage.output_tokens, tool_calls: tools.length, result };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b), mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function scoreTrial(records, key) {
  if (records.length !== 12 || new Set(records.map((row) => `${row.arm}:${row.case_id}`)).size !== 12 ||
      records.some((row) => !['baseline', 'combined'].includes(row.arm) || !key.some((item) => item.id === row.case_id))) throw new Error('trial must contain all 12 unique paired records');
  const scores = ['baseline', 'combined'].map((arm) => {
    const rows = records.filter((row) => row.arm === arm);
    const hard = key.filter((item) => item.gold.kind === 'hard');
    const detected = hard.filter((item) => rows.find((row) => row.case_id === item.id).result.findings.some((finding) =>
      finding.category === item.gold.category && finding.severity === 'hard' && finding.node.includes(item.gold.node) && finding.evidence.trim() && finding.reason.trim()));
    const controls = key.filter((item) => item.gold.kind === 'control').map((item) => ({ case_id: item.id,
      hard_findings: rows.find((row) => row.case_id === item.id).result.findings.filter((finding) => finding.severity === 'hard') }));
    return { arm, hard_detected: detected.length, hard_total: hard.length, missed_cases: hard.filter((item) => !detected.includes(item)).map((item) => item.id),
      controls_pending_human_adjudication: controls, total_tokens: rows.reduce((sum, row) => sum + row.total_tokens, 0),
      median_tokens: median(rows.map((row) => row.total_tokens)),
      naturalism_probe_detected: rows.find((row) => row.case_id === 'T06').result.findings.some((finding) => finding.category === 'naturalism') };
  });
  const reduction = Number((100 * (scores[0].median_tokens - scores[1].median_tokens) / scores[0].median_tokens).toFixed(2));
  return { scores, paired_reduction_percent: records.filter((row) => row.arm === 'baseline').map((row) => ({ case_id: row.case_id,
    percent: Number((100 * (row.total_tokens - records.find((other) => other.arm === 'combined' && other.case_id === row.case_id).total_tokens) / row.total_tokens).toFixed(2)) })),
    median_total_token_reduction_percent: reduction, mechanical_threshold_met: reduction >= 20 && scores.every((score) => score.hard_detected === score.hard_total),
    human_blind_review: 'PENDING', adoption: 'NOT_APPROVED', quota_reduction: 'NOT_MEASURED', note: 'Single paired pilot; token usage includes system/tool overhead. Cached tokens are an input subset; reasoning is not added again. Quality and false positives require Human adjudication.' };
}

export async function runTrial({ root = rootDefault, runId } = {}) {
  if (!/^[a-zA-Z0-9_-]+$/.test(runId || '')) throw new Error('invalid run ID');
  const relative = `generated/session-cache/quota-benchmark/${runId}`, directory = path.join(root, relative);
  const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8'));
  // Rebuild every prepared byte before spending quota, including hidden scoring key.
  const rebuilt = await buildBenchmark({ root, ref: manifest.source_ref, base: manifest.base_ref });
  for (const [name, expected] of rebuilt.files) if (await readFile(path.join(directory, name), 'utf8') !== expected) throw new Error(`prepared benchmark drift: ${name}`);
  const modelConfig = await readFile(path.join(os.homedir(), '.codex/config.toml'), 'utf8');
  const routing = modelConfig.split('\n').filter((line) => /^(model|model_reasoning_effort)\s*=/.test(line));
  if (routing.length !== 2) throw new Error('explicit configured model and reasoning effort required for matched trial');
  const version = execFileSync('codex', ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  await writeScratchFiles(relative, [['trial-settings.json', encode({ routing, codex_version: version, sampling: 'one pair per case', tools: 'forbidden', automatic_retry: false })]], { root });
  const records = [];
  for (let index = 0; index < 6; index++) {
    const caseId = `T0${index + 1}`;
    for (const arm of index % 2 ? ['combined', 'baseline'] : ['baseline', 'combined']) {
      const current = await readFile(path.join(os.homedir(), '.codex/config.toml'), 'utf8');
      if (hash(current) !== hash(modelConfig)) throw new Error('user config changed during trial; stop rather than compare unlike runs');
      const input = await readFile(path.join(directory, `${arm}-${caseId}.input.md`), 'utf8');
      const instructions = await readFile(path.join(directory, 'instructions.md'), 'utf8');
      const working = await mkdtemp(path.join('/private/tmp', 'quota-worker-'));
      const started = Date.now();
      let stdout = '', stderr = '';
      try {
        const exitCode = await new Promise((resolve, reject) => {
          const child = spawn('codex', ['exec', '--ephemeral', '--sandbox', 'read-only', '--skip-git-repo-check',
            '--json', '--output-schema', path.join(directory, 'result.schema.json'), '-C', working, '-'], { stdio: ['pipe', 'pipe', 'pipe'] });
          const timeout = setTimeout(() => child.kill('SIGTERM'), 300000);
          child.on('error', (error) => { clearTimeout(timeout); reject(error); });
          child.on('close', (code) => { clearTimeout(timeout); resolve(code); });
          child.stdout.on('data', (bytes) => { stdout += bytes; });
          child.stderr.on('data', (bytes) => { stderr += bytes; });
          child.stdin.end(`${instructions}\n${input}`);
        });
        await writeScratchFiles(relative, [[`${arm}-${caseId}.events.jsonl`, stdout], [`${arm}-${caseId}.stderr.log`, stderr]], { root });
        if (exitCode !== 0) throw new Error(`worker ${arm}/${caseId} failed (${exitCode}); inspect scratch logs; no automatic retry`);
        const record = { arm, case_id: caseId, elapsed_ms: Date.now() - started, ...parseWorkerEvents(stdout) };
        records.push(record);
        await writeScratchFiles(relative, [[`${arm}-${caseId}.result.json`, encode(record)]], { root });
        console.log(JSON.stringify({ completed: `${arm}/${caseId}`, status: record.result.status, usage: record.usage }));
      } finally { await rm(working, { recursive: true, force: true }); }
    }
  }
  const key = JSON.parse(await readFile(path.join(directory, 'scoring-key.json'), 'utf8'));
  const summary = scoreTrial(records, key);
  await writeScratchFiles(relative, [['trial-summary.json', encode(summary)]], { root });
  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const argument = (name) => args[args.indexOf(`--${name}`) + 1];
  try {
    const known = new Set(['--prepare', '--run', '--run-id', '--base', '--ref']);
    for (let i = 0; i < args.length; i++) {
      if (!known.has(args[i])) throw new Error(`unknown benchmark option: ${args[i]}`);
      if (!['--prepare', '--run'].includes(args[i]) && (!args[++i] || args[i].startsWith('--'))) throw new Error('missing option value');
    }
    const runId = args.includes('--run-id') ? argument('run-id') : 'trial-01';
    if (!/^[a-zA-Z0-9_-]+$/.test(runId) || args.includes('--prepare') === args.includes('--run')) throw new Error('Choose exactly --prepare or --run and a safe run ID');
    if (args.includes('--run')) console.log(encode(await runTrial({ runId })));
    else {
      const { loadAndValidate } = await import('./content-lib.mjs');
      const { validateProductionContracts } = await import('./validate-production-contracts.mjs');
      await loadAndValidate(); validateProductionContracts();
      const result = await buildBenchmark({ base: args.includes('--base') ? argument('base') : undefined, ref: args.includes('--ref') ? argument('ref') : 'HEAD' });
      await writeScratchFiles(`generated/session-cache/quota-benchmark/${runId}`, result.files);
      console.log(encode(result.manifest.comparison));
    }
  } catch (error) { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; }
}
