import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildNarrativeReviewPacket, verifyNarrativeReviewPacket } from './context-packet.mjs';
import { checkSessionCache, scratchRoot } from './check-session-cache.mjs';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bootstrapSources = ['AGENTS.md', '.ai/WORKFLOW_MANIFEST.yaml', '.ai/harnesses/bootstrap.md',
  '.ai/policies/SOURCE_AUTHORITY.md', '.ai/policies/CONTEXT_ISOLATION.md',
  'docs/CONTENT_PRODUCTION_SOURCE_MAP.md', '.ai/harnesses/content-qa.md', '.ai/schemas/HANDOFF.md'];
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const bytes = (text) => Buffer.byteLength(text);
function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
}
function commit(root, ref) {
  if (!ref || ref.startsWith('-')) throw new Error('An explicit base/source ref is required');
  return git(root, 'rev-parse', '--verify', `${ref}^{commit}`).trim();
}

// Committed inputs only. The existing resolver also rejects changed source bytes,
// symlinks, archive sources, missing contracts and undeclared canon.
export async function compileReviewContext({ root = defaultRoot, sceneId = 'COM-02X', base, ref = 'HEAD' } = {}) {
  root = path.resolve(root);
  const sourceRef = commit(root, ref);
  const baseRef = commit(root, base);
  const packet = await buildNarrativeReviewPacket({ root, sceneId, ref: sourceRef,
    runId: 'quota-poc', taskId: `NQA-${sceneId}` });
  await verifyNarrativeReviewPacket(packet, { root });
  const sources = [];
  for (const acquisition of packet.required_acquisition.markdown) {
    const full = git(root, 'show', `${sourceRef}:${acquisition.path}`);
    const selected = acquisition.excerpts?.length
      ? acquisition.excerpts.map((part) => full.split('\n').slice(part.start_line - 1, part.end_line).join('\n')).join('\n\n')
      : full;
    sources.push({ path: acquisition.path, git_blob_sha: acquisition.git_blob_sha,
      excerpts: acquisition.excerpts || [], full_bytes: bytes(full), selected_bytes: bytes(selected), text: selected });
  }
  // Diff is an attention hint for full-scene review, never an approval or delta-QA gate.
  const changedPaths = git(root, 'diff', '--no-ext-diff', '--name-only', '-z', baseRef, sourceRef, '--')
    .split('\0').filter(Boolean).sort();
  const sourcePaths = sources.map((source) => source.path);
  const relevantChanges = changedPaths.filter((relative) => sourcePaths.includes(relative));
  const diff = git(root, 'diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--unified=0',
    baseRef, sourceRef, '--', ...sources.filter((source) => !source.excerpts.length).map((source) => source.path));
  const hunksByPath = new Map();
  let diffPath;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) diffPath = line.slice(6);
    if (line.startsWith('@@ ') && diffPath) {
      if (!hunksByPath.has(diffPath)) hunksByPath.set(diffPath, []);
      hunksByPath.get(diffPath).push(line.match(/^@@ .*? @@/)?.[0]);
    }
  }
  const changedHunks = [...hunksByPath].map(([relative, ranges]) => ({ path: relative, ranges }));
  const packetBody = `${JSON.stringify(packet, null, 2)}\n`;
  const worker = [
    '# Disposable narrative_review input (Quota Efficiency POC)',
    'GENERATED: rebuild from canonical sources; never commit this file. Full-scene review only.',
    'Read the mandatory bootstrap, content_qa harness and HANDOFF schema separately. This projection does not waive them.',
    'No QA task was executed by this compiler. Do not infer PASS, Human approval or permission to rewrite from this bundle.',
    '## Exact Task Packet (compact JSON)', JSON.stringify(packet),
    '## Git diff attention hint',
    JSON.stringify({ base_ref: baseRef, source_ref: sourceRef, changed_allowed_sources: relevantChanges,
      excluded_changed_path_count: changedPaths.length - relevantChanges.length,
      full_source_changed_hunks: changedHunks,
      excerpted_canon_changes: relevantChanges.filter((relative) => sources.find((source) => source.path === relative).excerpts.length)
    }),
    'Hunk ranges are navigation hints, not semantic classifications. Excerpted canon changes require full allowed-excerpt review; old prose is not authoring authority.',
    ...sources.flatMap((source) => [`## ${source.path}`, JSON.stringify({ git_blob_sha: source.git_blob_sha,
      excerpts: source.excerpts, selected_sha256: sha256(source.text) }), source.text])
  ].join('\n\n') + '\n';
  // Keep mandatory shared instructions in BOTH totals. The bounded baseline uses
  // the existing packet's excerpts, so we do not claim their prior savings as new.
  const shared = [];
  for (const relative of bootstrapSources) {
    const text = await readFile(path.join(root, relative), 'utf8');
    if (text !== git(root, 'show', `${sourceRef}:${relative}`)) throw new Error(`bootstrap source differs from ref: ${relative}`);
    shared.push({ path: relative, bytes: bytes(text) });
  }
  const sharedBytes = shared.reduce((sum, item) => sum + item.bytes, 0);
  const fullBytes = sources.reduce((sum, item) => sum + item.full_bytes, 0);
  const selectedBytes = sources.reduce((sum, item) => sum + item.selected_bytes, 0);
  const oldFull = sharedBytes + bytes(packetBody) + fullBytes;
  const bounded = sharedBytes + bytes(packetBody) + selectedBytes;
  const compiled = sharedBytes + bytes(worker);
  const metrics = {
    lifecycle: 'GENERATED', scene_id: sceneId, base_ref: baseRef, source_ref: sourceRef,
    compiler_sha256: sha256(await readFile(fileURLToPath(import.meta.url))),
    resolver_sha256: sha256(await readFile(path.join(root, 'tools/context-packet.mjs'))),
    packet_sha256: sha256(packetBody), worker_input_sha256: sha256(worker),
    sources: sources.map(({ text, ...source }) => source), shared_instructions: shared,
    comparison: {
      unit: 'UTF-8 bytes; context-volume proxy, NOT measured tokens or billed quota',
      full_source_baseline: { files: shared.length + sources.length + 1, bytes: oldFull },
      existing_bounded_baseline: { files: shared.length + sources.length + 1, bytes: bounded },
      compiled_input: { files: shared.length + 1, bytes: compiled },
      reduction_vs_full_percent: Number((100 * (oldFull - compiled) / oldFull).toFixed(2)),
      reduction_vs_existing_bounded_percent: Number((100 * (bounded - compiled) / bounded).toFixed(2))
    },
    diff: { changed_paths: changedPaths, changed_allowed_sources: relevantChanges, full_source_changed_hunks: changedHunks, sha256: sha256(diff) },
    semantic_qa: 'NOT_RUN', delta_qa: 'NOT_IMPLEMENTED'
  };
  return { packetBody, worker, metrics };
}

export async function writeScratchFiles(relative, files, { root = defaultRoot } = {}) {
  if (!relative.startsWith(`${scratchRoot}/`) || relative.split('/').some((part) => !/^[a-zA-Z0-9_-]+$/.test(part)) ||
      files.some(([name]) => !/^[a-zA-Z0-9_.-]+$/.test(name) || name === '.' || name === '..')) {
    throw new Error('invalid scratch destination');
  }
  await checkSessionCache(root);
  // There is deliberately no arbitrary --out option. Reject every symlink in
  // the output path so an ignored directory cannot redirect writes into canon.
  root = path.resolve(root);
  if (await realpath(root) !== root) throw new Error('output root is a symlink');
  let current = root;
  for (const component of relative.split('/')) {
    current = path.join(current, component);
    try { await mkdir(current); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    if (!(await lstat(current)).isDirectory() || await realpath(current) !== current) throw new Error('scratch directory is a symlink or non-directory');
  }
  for (const [name, content] of files) {
    // Exclusive creation refuses existing files, symlinks and hard links.
    // Rebuild into an empty cache rather than truncating any existing target.
    await writeFile(path.join(current, name), content, { flag: 'wx' });
  }
  return relative;
}

export async function writeReviewContext(result, options = {}) {
  return writeScratchFiles(`${scratchRoot}/quota-poc/${result.metrics.scene_id}`,
    [['task.packet.json', result.packetBody], ['worker-input.md', result.worker],
      ['metrics.json', `${JSON.stringify(result.metrics, null, 2)}\n`]], options);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  function argument(name) {
    const index = process.argv.indexOf(`--${name}`);
    return index < 0 ? undefined : process.argv[index + 1];
  }
  try {
    if (process.argv.slice(2).some((arg, index) => index % 2 === 0 && !['--scene', '--base', '--ref'].includes(arg)) ||
        process.argv.slice(2).length % 2) throw new Error('Usage: --scene COM-02X --base <commit> --ref <commit>');
    const result = await compileReviewContext({ sceneId: argument('scene'), base: argument('base'), ref: argument('ref') });
    const { loadAndValidate } = await import('./content-lib.mjs');
    const { validateProductionContracts } = await import('./validate-production-contracts.mjs');
    await loadAndValidate();
    validateProductionContracts();
    const destination = await writeReviewContext(result);
    console.log(JSON.stringify({ destination, packet_sha256: result.metrics.packet_sha256,
      worker_input_sha256: result.metrics.worker_input_sha256, comparison: result.metrics.comparison }, null, 2));
  } catch (error) {
    console.error(`BLOCKED: ${error.message}`);
    process.exitCode = 1;
  }
}
