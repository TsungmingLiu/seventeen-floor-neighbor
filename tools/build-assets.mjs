import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, projectRoot } from './content-lib.mjs';
import { checkAssets } from './check-assets.mjs';

const generatedAssetsRoot = path.join(projectRoot, 'generated/runtime-assets');

function normalizedSource(entry) {
  return typeof entry === 'string'
    ? { provider: 'local', source: entry, transform: 'copy' }
    : { provider: 'local', transform: 'copy', ...entry };
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
  for (const [runtimePath, rawEntry] of Object.entries(sourceMap.files || {})) {
    const entry = normalizedSource(rawEntry);
    if (entry.provider !== 'local' || entry.transform !== 'copy' || !entry.source?.startsWith('assets-src/')) {
      throw new Error(`Runtime assets require an ingested repo source: ${runtimePath}`);
    }
    const destination = path.join(generatedAssetsRoot, runtimePath);
    await mkdir(path.dirname(destination), { recursive: true });
    const source = path.join(projectRoot, entry.source);
    await copyFile(source, destination);
    copied += 1;
  }
  console.log(`Built ${copied} runtime asset file(s) from ingested repo sources.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await buildAssets();
}
