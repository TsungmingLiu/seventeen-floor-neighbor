import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSessionCache, scratchRoot } from './check-session-cache.mjs';

export const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const requireCondition = (value, message) => { if (!value) throw new Error(message); };
export const jsonHash = (value) => hash(JSON.stringify(value));
export const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024 });
export const forbiddenRoots = ['.ai/archive/', '.ai/experiments/', 'docs/archive/'];
export function safePath(relative, { cache = false, fragment = false } = {}) {
  requireCondition(typeof relative === 'string', 'path must be a string');
  const [file, ...parts] = relative.split('#');
  requireCondition((fragment || !parts.length) && parts.length <= 1 && (!parts.length || parts[0].length), `invalid fragment: ${relative}`);
  requireCondition(file.split('/').every((part) => /^[A-Za-z0-9_.-]+$/.test(part) && part !== '.' && part !== '..') &&
    !forbiddenRoots.some((root) => file.startsWith(root)) && (!cache || file.startsWith(`${scratchRoot}/`)), `unsafe or forbidden path: ${relative}`);
  return file;
}
export async function readSafe(root, relative, options = {}) {
  const file = safePath(relative, options), absolute = path.resolve(root, file);
  requireCondition(await realpath(root) === path.resolve(root), 'root is a symlink');
  requireCondition(await realpath(absolute) === absolute && (await lstat(absolute)).isFile(), `symlink or non-file: ${file}`);
  const bytes = await readFile(absolute);
  if (options.maxBytes) requireCondition(bytes.length <= options.maxBytes, `file too large: ${file}`);
  return bytes;
}
export async function readJson(root, relative) {
  return JSON.parse((await readSafe(root, relative, { cache: true, maxBytes: 1024 * 1024 })).toString('utf8'));
}
export async function writeCache(root, relative, value) {
  safePath(relative, { cache: true });
  await checkSessionCache(root);
  requireCondition(await realpath(root) === path.resolve(root), 'root is a symlink');
  let current = root;
  for (const part of path.dirname(relative).split('/')) {
    current = path.join(current, part);
    await mkdir(current, { recursive: false }).catch((error) => { if (error.code !== 'EEXIST') throw error; });
    requireCondition(await realpath(current) === current && (await lstat(current)).isDirectory(), 'unsafe cache directory');
  }
  // Exclusive creation also rejects symlinks/hard links and accidental overwrite.
  await writeFile(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
  return relative;
}
export function cliArgs(argv, allowed) {
  requireCondition(argv.length % 2 === 0, 'arguments require explicit values');
  const result = {};
  for (let i = 0; i < argv.length; i += 2) {
    requireCondition(allowed.includes(argv[i]) && !Object.hasOwn(result, argv[i].slice(2)) && argv[i + 1], `invalid argument: ${argv[i]}`);
    result[argv[i].slice(2)] = argv[i + 1];
  }
  return result;
}
export function boundVersion(bytes, version, label) {
  const sha = hash(bytes), blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  requireCondition([sha, `sha256:${sha}`, blob].includes(version), `stale or unsupported version: ${label}`);
  return { sha256: sha, git_blob_sha: blob, bytes: bytes.length };
}
export function matchesAllowlist(relative, list = []) {
  return list.some((item) => item.endsWith('/**') ? relative.startsWith(item.slice(0, -2)) : relative === item);
}
