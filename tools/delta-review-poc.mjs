import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBenchmark, resultSchema, selectHeadings } from './benchmark-review-context.mjs';
import { writeScratchFiles } from './compile-review-context.mjs';
import { configuredTrial, readonlyWorker } from './readonly-quota-worker.mjs';

const rootDefault = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scenePath = 'docs/narrative/scenes/vertical-slice/COM-02X.md';
const hash = (text) => createHash('sha256').update(text).digest('hex');
const encode = (value) => `${JSON.stringify(value, null, 2)}\n`;
const dialogue = /^(\*\*(?:Protagonist|Xu Tang(?:（off-screen）)?)\*\*：)(.+)$/;
const tokens = (text) => text.match(/`[^`]+`|\[[^\]]+\]|\b[A-Za-z_][A-Za-z0-9_.-]*\b|\d+(?:[.:]\d+)*/g) || [];
const critical = (text) => text.match(/聯絡|電話|手機|號碼|約會|牽手|戀愛|告白|公司|收入|客戶/g) || [];

function replaceOnce(text, before, after) {
  if (text.split(before).length !== 2) throw new Error(`missing/ambiguous fixture anchor: ${before}`);
  return text.replace(before, after);
}

// Markdown topology only: no inferred knowledge/payoff semantics or new canon.
export function sceneGraph(text) {
  const lines = text.split('\n');
  const script = selectHeadings(text, ['## Locked playable script'])[0];
  const blocks = [];
  for (let i = script.start_line; i < script.end_line; i++) {
    const match = lines[i].match(/^(###|#### Branch) `([a-zA-Z0-9_]+)`$/);
    if (match) blocks.push({ id: match[2], kind: match[1] === '###' ? 'node' : 'branch', start_line: i + 1 });
    else if (/^#{3,} /.test(lines[i])) throw new Error('unsupported script heading');
  }
  if (!blocks.length || new Set(blocks.map((block) => block.id)).size !== blocks.length) throw new Error('missing/duplicate script IDs');
  blocks.forEach((block, index) => {
    block.end_line = (blocks[index + 1]?.start_line || script.end_line + 1) - 1;
    block.text = lines.slice(block.start_line - 1, block.end_line).join('\n');
  });
  const edges = [], nodes = blocks.filter((block) => block.kind === 'node');
  const branchParents = {};
  for (const block of blocks) {
    if (block.kind === 'branch') {
      const parent = nodes.filter((node) => node.start_line < block.start_line).at(-1);
      const rejoins = [...block.text.matchAll(/^→ Rejoin `([a-zA-Z0-9_]+)`$/gm)];
      if (!parent || rejoins.length !== 1 || !nodes.some((node) => node.id === rejoins[0][1])) throw new Error('unbound branch/rejoin');
      branchParents[block.id] = parent.id;
      edges.push([block.id, rejoins[0][1]]);
    }
  }
  for (const [index, node] of nodes.entries()) {
    const choices = [...node.text.matchAll(/^\d+\. `([a-zA-Z0-9_]+)`/gm)].map((match) => match[1]);
    const children = blocks.filter((block) => branchParents[block.id] === node.id).map((block) => block.id);
    if (JSON.stringify(choices.slice().sort()) !== JSON.stringify(children.slice().sort()) || new Set(choices).size !== choices.length) throw new Error('choice/branch mismatch');
    if (choices.length) edges.push(...choices.map((id) => [node.id, id]));
    else if (nodes[index + 1]) edges.push([node.id, nodes[index + 1].id]);
  }
  return { blocks, edges, branchParents, script };
}

export function planDelta(before, after, { changedSources = [] } = {}) {
  const full = (reason) => ({ mode: 'FULL_REQUIRED', reason, base_sha256: hash(before), candidate_sha256: hash(after) });
  if (changedSources.length) return full('canonical/source/instruction dependencies changed');
  const baseline = sceneGraph(before);
  let candidate;
  try { candidate = sceneGraph(after); } catch (error) { return full(`structure: ${error.message}`); }
  const oldLines = before.split('\n'), newLines = after.split('\n');
  if (oldLines.length !== newLines.length || JSON.stringify(baseline.edges) !== JSON.stringify(candidate.edges)) return full('line shape or graph changed');
  const structural = (graph) => graph.blocks.map(({ text: _text, ...block }) => block);
  if (JSON.stringify(structural(baseline)) !== JSON.stringify(structural(candidate))) return full('script IDs/ranges changed');
  const edits = [];
  for (let i = 0; i < oldLines.length; i++) {
    if (oldLines[i] === newLines[i]) continue;
    const old = oldLines[i].match(dialogue), next = newLines[i].match(dialogue);
    const block = baseline.blocks.find((item) => i + 1 >= item.start_line && i + 1 <= item.end_line);
    if (!block || !old || !next || old[1] !== next[1]) return full('non-dialogue, speaker, state, action or metadata changed');
    if (JSON.stringify(tokens(old[2])) !== JSON.stringify(tokens(next[2])) || JSON.stringify(critical(old[2])) !== JSON.stringify(critical(next[2]))) return full('explicit identity/state/contact/relationship/fact cue changed');
    edits.push({ node: block.id, line: i + 1, before: oldLines[i], after: newLines[i] });
  }
  if (!edits.length) return { ...full('no edits'), mode: 'NO_CHANGE' };
  if (edits.length > 2 || new Set(edits.map((edit) => edit.node)).size > 1) return full('edit exceeds the one-block/two-line pilot budget');
  const selected = new Set(edits.map((edit) => edit.node));
  for (const [from, to] of baseline.edges) {
    if (edits.some((edit) => edit.node === from)) selected.add(to);
    if (edits.some((edit) => edit.node === to)) selected.add(from);
  }
  // Include all sibling choices, their parent and its preceding exchange.
  for (const id of [...selected]) {
    const parent = baseline.branchParents[id];
    if (parent) {
      selected.add(parent);
      for (const [branch, owner] of Object.entries(baseline.branchParents)) if (owner === parent) selected.add(branch);
      for (const [from, to] of baseline.edges) if (to === parent) selected.add(from);
    }
  }
  // Keep every shared rejoin and all downstream consumers through scene exit.
  const tails = [...new Set(baseline.edges.filter(([from]) => baseline.branchParents[from]).map(([, to]) => to))];
  for (let i = 0; i < tails.length; i++) {
    selected.add(tails[i]);
    for (const [from, to] of baseline.edges) if (from === tails[i] && !tails.includes(to)) tails.push(to);
  }
  return { mode: 'DELTA_PROVISIONAL', reason: 'dialogue-only shape; meaning is NOT certified',
    base_sha256: hash(before), candidate_sha256: hash(after), edits,
    selected_nodes: candidate.blocks.filter((block) => selected.has(block.id)).map((block) => block.id),
    graph_edges: baseline.edges, requires_bound_full_base_review: true, final_full_required: true };
}

export function projectDelta(candidate, plan) {
  if (plan.mode !== 'DELTA_PROVISIONAL') throw new Error('not eligible for provisional delta projection');
  const graph = sceneGraph(candidate);
  const fixed = selectHeadings(candidate, ['## Scene summary', '## Scene goal / dramatic question',
    '## Unlock / entrance condition', '## Player choice / local branch', '## State contract', '## Dialogue writing notes', '## End state']);
  const blocks = graph.blocks.filter((block) => plan.selected_nodes.includes(block.id));
  const excerpts = [...fixed, ...blocks].map((part) => ({ label: part.label || part.id, start_line: part.start_line,
    end_line: part.end_line, sha256: hash(part.text) }));
  return { text: ['# GENERATED provisional delta view — not whole-scene QA',
    ...fixed.map((part) => part.text), '## Selected candidate exchanges (verbatim)', ...blocks.map((block) => block.text)].join('\n\n'), excerpts };
}

export function deltaCases(scene) {
  const first = replaceOnce(scene, '**Protagonist**：喔，那妳快去吧。晚安。', '**Protagonist**：喔，那妳快去吧。晚安！');
  const second = replaceOnce(first, '**Protagonist**：喔，我沒看清。', '**Protagonist**：喔，是我沒看清。');
  const hard = replaceOnce(scene, '我大部分時間在家工作，忙起來', '我大部分時間在辦公室工作，忙起來');
  return [
    { id: 'D01', before: scene, text: first, base_review: 'foundation', gold: { kind: 'control' } },
    { id: 'D02', before: first, text: second, base_review: 'full-D01', gold: { kind: 'control' } },
    { id: 'D03', before: scene, text: hard, base_review: 'foundation', gold: { kind: 'hard', category: 'knowledge', node: 'common_convenience_xu_work' } }
  ];
}

export function requiresFull(result) {
  return result.status === 'BLOCKED' || result.status === 'NEEDS_REVIEW' ||
    result.findings.some((finding) => finding.severity === 'hard') ||
    (result.status === 'FAIL' && !result.findings.length);
}

export async function buildDelta({ root = rootDefault, ref = 'HEAD', base = ref } = {}) {
  const benchmark = await buildBenchmark({ root, ref, base });
  const files = new Map(benchmark.files);
  const sourceRef = benchmark.manifest.source_ref;
  const scene = execFileSync('git', ['-C', root, 'show', `${sourceRef}:${scenePath}`], { encoding: 'utf8' });
  const packet = JSON.parse(files.get('base.packet.json'));
  const sourcePaths = [...packet.required_acquisition.markdown.map((item) => item.path), 'AGENTS.md', '.ai/WORKFLOW_MANIFEST.yaml', '.ai/harnesses/bootstrap.md',
    '.ai/policies/SOURCE_AUTHORITY.md', '.ai/policies/CONTEXT_ISOLATION.md', 'docs/CONTENT_PRODUCTION_SOURCE_MAP.md', '.ai/harnesses/content-qa.md', '.ai/schemas/HANDOFF.md',
    'content/routes/opening-demo/chapter-01.json', 'content/routes/opening-demo/route.json', 'content/routes/opening-demo/memories.json'];
  const changes = execFileSync('git', ['-C', root, 'diff', '--name-only', benchmark.manifest.base_ref, sourceRef], { encoding: 'utf8' }).trim().split('\n').filter((item) => sourcePaths.includes(item));
  const cases = deltaCases(scene);
  let instructions = files.get('instructions.md').replace(
    'Apply the full narrative_review harness to the entire target scene.',
    'Apply the full narrative_review harness to FULL inputs. For DELTA_PROVISIONAL, assess only the supplied exchanges and their full contract/context; this is not production narrative_review or whole-scene naturalism approval.');
  instructions += '\nFor DELTA_PROVISIONAL: shape eligibility does NOT certify unchanged meaning. If edited speech changes knowledge, relationship, required payoffs, or depends on missing context, report a hard finding (category other for context uncertainty), exact node and evidence. Use NEEDS_REVIEW/BLOCKED for uncertainty. PASS is only a provisional local verdict. Full independent review remains mandatory. Do not force a finding.\n';
  const template = files.get('combined-T01.input.md');
  const body = (candidate, view, scope, detail = {}) => {
    let value = replaceOnce(template, scene, view);
    value = replaceOnce(value, `"candidate_sha256": "${hash(scene)}"`, `"candidate_sha256": "${hash(candidate)}"`);
    value = replaceOnce(value, `"supplied_sha256":"${hash(scene)}"`, `"supplied_sha256":"${hash(view)}"`);
    return `${encode({ scope, candidate_sha256: hash(candidate), ...detail })}\n${value}`;
  };
  const generated = [['instructions.md', instructions], ['result.schema.json', encode(resultSchema)],
    ['base.packet.json', files.get('base.packet.json')], ['foundation.input.md', body(scene, scene, 'FULL')]];
  const matrix = [], plans = [];
  for (const item of cases) {
    const plan = planDelta(item.before, item.text, { changedSources: changes });
    if (plan.mode !== 'DELTA_PROVISIONAL') throw new Error(`pilot case ${item.id} requires full preparation: ${plan.reason}`);
    const projected = projectDelta(item.text, plan);
    plans.push({ case_id: item.id, ...plan, excerpts: projected.excerpts });
    for (const arm of ['full', 'delta']) {
      const input = body(item.text, arm === 'full' ? item.text : projected.text, arm === 'full' ? 'FULL' : 'DELTA_PROVISIONAL',
        arm === 'delta' ? { base_sha256: plan.base_sha256, edits: plan.edits, graph_edges: plan.graph_edges, excerpts: projected.excerpts } : {});
      const name = `${arm}-${item.id}.input.md`;
      generated.push([name, input]);
      matrix.push({ arm, case_id: item.id, input: name, sha256: hash(input), bytes: Buffer.byteLength(instructions + '\n' + input) });
    }
  }
  generated.push(['final.input.md', body(cases[1].text, cases[1].text, 'FULL')], ['plans.json', encode(plans)],
    ['scoring-key.json', encode(cases.map(({ before: _before, text: _text, ...item }) => item))]);
  const toolBindings = {};
  for (const tool of ['delta-review-poc.mjs', 'readonly-quota-worker.mjs', 'benchmark-review-context.mjs', 'compile-review-context.mjs', 'context-packet.mjs']) toolBindings[tool] = hash(await readFile(path.join(root, 'tools', tool)));
  const manifest = { lifecycle: 'GENERATED_EXPERIMENT', source_ref: sourceRef, base_ref: benchmark.manifest.base_ref,
    tool_bindings: toolBindings, instructions_sha256: hash(instructions), matrix,
    final_candidate_sha256: hash(cases[1].text), foundation_sha256: hash(scene),
    trial_schedule: ['foundation', 'full-D01', 'delta-D01', 'delta-D02', 'full-D02', 'delta-D03', 'full-D03', 'final'],
    threshold: { minimum_inclusive_token_reduction_percent: 20, hard_probe_detected_in_delta_and_full: true },
    adoption: 'NOT_APPROVED', note: 'Eight fresh sessions. D03 paired full also serves as the independent fallback if delta escalates; report this shared measurement role, never charge it twice as actually spent. Final full is always separate.' };
  generated.push(['manifest.json', encode(manifest)]);
  return { manifest, files: generated };
}

export function scoreDelta(records, key) {
  const names = ['foundation', 'full-D01', 'delta-D01', 'delta-D02', 'full-D02', 'delta-D03', 'full-D03', 'final'];
  if (records.length !== names.length || new Set(records.map((row) => row.name)).size !== names.length || names.some((name) => !records.some((row) => row.name === name))) throw new Error('all eight unique trial records required');
  const get = (name) => records.find((row) => row.name === name);
  const pairs = key.map((item) => {
    const full = get(`full-${item.id}`), delta = get(`delta-${item.id}`);
    const detects = (row) => item.gold.kind !== 'hard' ? null : row.result.findings.some((finding) => finding.category === item.gold.category && finding.severity === 'hard' && finding.node.includes(item.gold.node));
    const escalated = requiresFull(delta.result);
    return { case_id: item.id, full_tokens: full.total_tokens, delta_tokens: delta.total_tokens,
      fallback_required: escalated, delta_flow_tokens: delta.total_tokens + (escalated ? full.total_tokens : 0),
      full_hard_detected: detects(full), delta_hard_detected: detects(delta),
      control_hard_findings: item.gold.kind === 'control' ? { full: full.result.findings.filter((finding) => finding.severity === 'hard'), delta: delta.result.findings.filter((finding) => finding.severity === 'hard') } : null };
  });
  const fixed = get('foundation').total_tokens + get('final').total_tokens;
  const budget = (subset) => {
    const full = fixed + subset.reduce((sum, row) => sum + row.full_tokens, 0);
    const delta = fixed + subset.reduce((sum, row) => sum + row.delta_flow_tokens, 0);
    return { full_tokens: full, delta_tokens: delta, reduction_percent: Number((100 * (full - delta) / full).toFixed(2)), includes_foundation_and_final_full: true };
  };
  const mixed = budget(pairs), controls = budget(pairs.filter((row) => row.control_hard_findings !== null));
  const hardPassed = pairs.filter((row) => row.full_hard_detected !== null).every((row) => row.full_hard_detected && row.delta_hard_detected && row.fallback_required);
  return { pairs, low_risk_iteration_budget: controls, mixed_probe_budget: mixed,
    foundation_status: get('foundation').result.status, final_full_status: get('final').result.status,
    actual_unique_trial_tokens: records.reduce((sum, row) => sum + row.total_tokens, 0),
    mechanical_threshold_met: hardPassed && mixed.reduction_percent >= 20 && get('final').result.status === 'PASS' && get('final').result.naturalism === 'PASS',
    human_blind_review: 'PENDING', adoption: 'NOT_APPROVED', quota_reduction: 'NOT_MEASURED',
    note: 'Measured paired inputs, modeled workflow budgets. D03 paired full is also fallback evidence; its tokens count once in actual consumption. No semantic safety proof from Markdown topology. Final full is mandatory even when delta says PASS.' };
}

export async function runDelta({ root = rootDefault, runId } = {}) {
  if (!/^[a-zA-Z0-9_-]+$/.test(runId || '')) throw new Error('invalid run ID');
  const relative = `generated/session-cache/quota-delta/${runId}`, directory = path.join(root, relative);
  const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8'));
  const rebuilt = await buildDelta({ root, ref: manifest.source_ref, base: manifest.base_ref });
  for (const [name, value] of rebuilt.files) if (await readFile(path.join(directory, name), 'utf8') !== value) throw new Error(`prepared delta drift: ${name}`);
  const key = JSON.parse(await readFile(path.join(directory, 'scoring-key.json'), 'utf8'));
  const settings = await configuredTrial();
  await writeScratchFiles(relative, [['trial-settings.json', encode(settings)]], { root });
  const records = [];
  const expected = new Map(rebuilt.files);
  const instructions = await readFile(path.join(directory, 'instructions.md'), 'utf8');
  for (const name of manifest.trial_schedule) {
    if (name.startsWith('delta-')) {
      const item = key.find((row) => row.id === name.slice(6)), parent = records.find((row) => row.name === item.base_review);
      if (!parent || parent.result.status !== 'PASS' || parent.result.naturalism !== 'PASS' || parent.result.findings.some((finding) => finding.severity === 'hard')) throw new Error('full-reviewed experimental base unavailable; stop delta dispatch');
    }
    const input = await readFile(path.join(directory, `${name}.input.md`), 'utf8');
    if (input !== expected.get(`${name}.input.md`) || await readFile(path.join(directory, 'result.schema.json'), 'utf8') !== expected.get('result.schema.json')) throw new Error('per-worker input/schema drift; stop');
    records.push(await readonlyWorker({ root, relative, name, instructions, input, settings }));
    if (name === 'foundation' && records[0].result.status !== 'PASS') throw new Error('foundation full QA did not PASS; no delta dispatch');
  }
  const summary = scoreDelta(records, key);
  await writeScratchFiles(relative, [['trial-summary.json', encode(summary)]], { root });
  return summary;
}

export async function reviewDelta({ root = rootDefault, runId } = {}) {
  if (!/^[a-zA-Z0-9_-]+$/.test(runId || '')) throw new Error('invalid run ID');
  const relative = `generated/session-cache/quota-delta/${runId}`, directory = path.join(root, relative);
  const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8'));
  const rebuilt = await buildDelta({ root, ref: manifest.source_ref, base: manifest.base_ref });
  for (const [name, value] of rebuilt.files) if (await readFile(path.join(directory, name), 'utf8') !== value) throw new Error(`prepared delta drift: ${name}`);
  const scene = execFileSync('git', ['-C', root, 'show', `${manifest.source_ref}:${scenePath}`], { encoding: 'utf8' });
  const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const key = [], sections = [];
  for (const [index, item] of deltaCases(scene).entries()) {
    const arms = index % 2 ? ['delta', 'full'] : ['full', 'delta'];
    const responses = [];
    for (const [side, arm] of arms.entries()) {
      const result = JSON.parse(await readFile(path.join(directory, `${arm}-${item.id}.result.json`), 'utf8'));
      const label = side ? 'Y' : 'X';
      key.push({ case_id: item.id, label, arm });
      responses.push(`<article><h3>${label}</h3><pre>${escape(JSON.stringify(result.result, null, 2))}</pre></article>`);
    }
    sections.push(`<section><h2>${item.id}</h2><details><summary>完整待審候選稿</summary><pre>${escape(item.text)}</pre></details><div class="pair">${responses.join('')}</div><p>可回覆 X 較好／Y 較好／差不多／兩者不合格，並指出漏檢、誤報或證據問題。</p></section>`);
  }
  const html = `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Delta QA 盲評</title><style>body{font:16px/1.6 system-ui;max-width:1440px;margin:auto;padding:24px;background:#f6f5f1;color:#242424}section{background:white;border-radius:12px;padding:20px;margin:20px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}article{min-width:0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.6 ui-monospace,monospace;background:#f4f6f8;padding:16px}summary{cursor:pointer}@media(max-width:800px){.pair{grid-template-columns:1fr}}</style><h1>Delta QA 盲評</h1><p>工程實驗的三組獨立回答比較。組別、用量與 gold 已隱藏；沒有 production scene approval。請比較回答是否準確，而非一定選出勝者。</p><p><a href="https://github.com/TsungmingLiu/seventeen-floor-neighbor/blob/${manifest.source_ref}/${scenePath}">固定版本原稿與 canonical input links</a></p>${sections.join('')}</html>`;
  await writeScratchFiles(relative, [['blind-review.html', html], ['blind-label-key.json', encode(key)]], { root });
  return `${relative}/blind-review.html`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {};
    for (let i = 0; i < args.length; i++) {
      if (['--prepare', '--run', '--review'].includes(args[i])) { if (options.mode) throw new Error('choose one mode'); options.mode = args[i]; }
      else if (['--run-id', '--ref', '--base'].includes(args[i])) { const name = args[i].slice(2); if (!args[++i] || args[i].startsWith('--')) throw new Error('missing value'); options[name] = args[i]; }
      else throw new Error('unknown option');
    }
    if (!options.mode || !/^[a-zA-Z0-9_-]+$/.test(options['run-id'] || '')) throw new Error('usage: --prepare|--run|--review --run-id <id> [--ref <ref> --base <ref>]');
    if (options.mode === '--run') console.log(encode(await runDelta({ runId: options['run-id'] })));
    else if (options.mode === '--review') console.log(await reviewDelta({ runId: options['run-id'] }));
    else {
      const { loadAndValidate } = await import('./content-lib.mjs');
      const { validateProductionContracts } = await import('./validate-production-contracts.mjs');
      await loadAndValidate(); validateProductionContracts();
      const prepared = await buildDelta({ ref: options.ref, base: options.base || options.ref });
      await writeScratchFiles(`generated/session-cache/quota-delta/${options['run-id']}`, prepared.files);
      console.log(encode(prepared.manifest.matrix));
    }
  } catch (error) { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; }
}
