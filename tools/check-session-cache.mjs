import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const scratchRoot = 'generated/session-cache';
const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function checkSessionCache(root = defaultRoot) {
  const ignore = await readFile(path.join(root, '.gitignore'), 'utf8');
  if (!ignore.split(/\r?\n/).includes(`${scratchRoot}/`)) {
    throw new Error(`.gitignore must explicitly ignore ${scratchRoot}/`);
  }
  const tracked = execFileSync('git', ['-C', root, 'ls-files', '--cached', '-z'], { encoding: 'utf8' })
    .split('\0').filter((name) => name === scratchRoot || name.startsWith(`${scratchRoot}/`));
  if (tracked.length) throw new Error(`Scratch data is staged/tracked; remove it from the index: ${tracked.join(', ')}`);
  // --no-index also checks ignore behavior when a file was force-added.
  execFileSync('git', ['-C', root, 'check-ignore', '--no-index', '-q', `${scratchRoot}/poc/probe.json`], { stdio: 'pipe' });
  return true;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await checkSessionCache();
    console.log(`PASS: ${scratchRoot}/ is ignored and contains no staged/tracked paths`);
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}
