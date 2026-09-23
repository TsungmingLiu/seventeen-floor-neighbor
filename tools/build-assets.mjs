import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
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
    ? { provider: 'local', source: entry, transform: 'copy' }
    : { provider: 'local', transform: 'copy', ...entry };
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function downloadRemote(entry, destination) {
  const response = await fetch(entry.url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Drive runtime download failed ${response.status} ${response.statusText}: ${entry.url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (entry.bytes != null && buffer.length !== entry.bytes) {
    throw new Error(`Drive runtime byte-size mismatch: expected ${entry.bytes}, received ${buffer.length}`);
  }
  if (entry.sha256 && sha256(buffer) !== entry.sha256) {
    throw new Error(`Drive runtime SHA-256 mismatch for ${entry.fileId || entry.url}`);
  }
  await writeFile(destination, buffer);
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
  let downloaded = 0;

  for (const [runtimePath, rawEntry] of Object.entries(sourceMap.files || {})) {
    const entry = normalizedSource(rawEntry);
    const destination = path.join(generatedAssetsRoot, runtimePath);
    await mkdir(path.dirname(destination), { recursive: true });

    if (entry.provider === 'gdrive-public') {
      if (entry.transform !== 'copy') {
        throw new Error(`Remote Drive runtime source must currently use transform=copy: ${runtimePath}`);
      }
      await downloadRemote(entry, destination);
      downloaded += 1;
      continue;
    }

    if (entry.provider !== 'local') {
      throw new Error(`Unsupported asset provider "${entry.provider}" for ${runtimePath}`);
    }

    const source = path.join(projectRoot, entry.source);
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

  console.log(
    `Built ${copied + converted + downloaded} runtime asset file(s): ` +
    `${copied} local copies, ${converted} local conversions, ${downloaded} Drive downloads.`
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await buildAssets();
}
