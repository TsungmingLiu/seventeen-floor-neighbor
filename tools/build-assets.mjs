import { copyFile, mkdir, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, projectRoot } from './content-lib.mjs';
import { checkAssets } from './check-assets.mjs';

const execFileAsync = promisify(execFile);
const generatedAssetsRoot = path.join(projectRoot, 'generated/runtime-assets');

function normalizedSource(entry) {
  return typeof entry === 'string'
    ? { source: entry, transform: 'copy' }
    : { transform: 'copy', ...entry };
}

async function convertWebp(source, destination, quality = 82) {
  await execFileAsync(
    'ffmpeg',
    [
      '-v', 'error',
      '-y',
      '-i', source,
      '-frames:v', '1',
      '-c:v', 'libwebp',
      '-quality', String(quality),
      destination
    ],
    { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 }
  );
}

export async function buildAssets({ check = true } = {}) {
  if (check) {
    const report = await checkAssets();
    if (report.summary.blockingFailures) {
      throw new Error(`Asset build blocked by ${report.summary.blockingFailures} media validation failure(s).`);
    }
  }

  const sourceMap = await readJson('content/assets/source-map.json');
  await rm(generatedAssetsRoot, { recursive: true, force: true });
  await mkdir(generatedAssetsRoot, { recursive: true });

  let copied = 0;
  let converted = 0;
  for (const [runtimePath, rawEntry] of Object.entries(sourceMap.files || {})) {
    const entry = normalizedSource(rawEntry);
    const source = path.join(projectRoot, entry.source);
    const destination = path.join(generatedAssetsRoot, runtimePath);
    await mkdir(path.dirname(destination), { recursive: true });

    if (entry.transform === 'copy') {
      await copyFile(source, destination);
      copied += 1;
    } else if (entry.transform === 'webp') {
      if (!runtimePath.toLowerCase().endsWith('.webp')) {
        throw new Error(`webp transform requires a .webp runtime path: ${runtimePath}`);
      }
      await convertWebp(source, destination, entry.quality ?? 82);
      converted += 1;
    } else {
      throw new Error(`Unsupported asset transform "${entry.transform}" for ${runtimePath}`);
    }
  }

  console.log(`Built ${copied + converted} runtime asset file(s): ${copied} copied, ${converted} converted.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await buildAssets();
}
