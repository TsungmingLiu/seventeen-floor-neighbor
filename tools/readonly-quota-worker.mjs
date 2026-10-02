import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseWorkerEvents } from './benchmark-review-context.mjs';
import { writeScratchFiles } from './compile-review-context.mjs';

export async function configuredTrial() {
  const config = await readFile(path.join(os.homedir(), '.codex/config.toml'), 'utf8');
  const routing = config.split('\n').filter((line) => /^(model|model_reasoning_effort)\s*=/.test(line));
  if (routing.length !== 2) throw new Error('explicit model/reasoning configuration required');
  return { config_sha256: createHash('sha256').update(config).digest('hex'), routing,
    codex_version: execFileSync('codex', ['--version'], { encoding: 'utf8' }).trim() };
}

export async function readonlyWorker({ root, relative, name, instructions, input, settings }) {
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error('invalid worker name');
  const current = await configuredTrial();
  if (JSON.stringify(current) !== JSON.stringify(settings)) throw new Error('model/config drift; trial stopped');
  const working = await mkdtemp(path.join('/private/tmp', 'delta-quota-worker-'));
  const started = Date.now();
  let stdout = '', stderr = '';
  try {
    const code = await new Promise((resolve, reject) => {
      const child = spawn('codex', ['exec', '--ephemeral', '--sandbox', 'read-only', '--skip-git-repo-check',
        '--json', '--output-schema', path.join(root, relative, 'result.schema.json'), '-C', working, '-'], { stdio: ['pipe', 'pipe', 'pipe'] });
      const timeout = setTimeout(() => child.kill('SIGTERM'), 300000);
      child.on('error', (error) => { clearTimeout(timeout); reject(error); });
      child.on('close', (status) => { clearTimeout(timeout); resolve(status); });
      child.stdout.on('data', (bytes) => { stdout += bytes; });
      child.stderr.on('data', (bytes) => { stderr += bytes; });
      child.stdin.end(`${instructions}\n${input}`);
    });
    await writeScratchFiles(relative, [[`${name}.events.jsonl`, stdout], [`${name}.stderr.log`, stderr]], { root });
    if (code !== 0) throw new Error(`worker ${name} failed (${code}); no automatic retry`);
    const digest = (value) => createHash('sha256').update(value).digest('hex');
    const record = { name, input_sha256: digest(input), instructions_sha256: digest(instructions),
      elapsed_ms: Date.now() - started, ...parseWorkerEvents(stdout) };
    await writeScratchFiles(relative, [[`${name}.result.json`, `${JSON.stringify(record, null, 2)}\n`]], { root });
    console.log(JSON.stringify({ completed: name, status: record.result.status, usage: record.usage }));
    return record;
  } finally { await rm(working, { recursive: true, force: true }); }
}
