import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, projectRoot, readJson } from './content-lib.mjs';
import { approxEqual, inspectMedia, mediaKind, ratio, requireMediaTools } from './media-lib.mjs';

const generatedRoot = path.join(projectRoot, 'generated');
const cacheRoot = path.join(generatedRoot, 'asset-check-cache');
const reportPath = path.join(generatedRoot, 'asset-report.json');

function normalizedSource(entry) {
  return typeof entry === 'string'
    ? { provider: 'local', source: entry, transform: 'copy' }
    : { provider: 'local', transform: 'copy', ...entry };
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function addUsage(map, assetId, value) {
  if (!assetId) return;
  if (!map.has(assetId)) map.set(assetId, new Set());
  map.get(assetId).add(value);
}

function collectUsages(content) {
  const result = new Map();
  for (const route of content.routes) {
    const routeId = route.config.id;
    addUsage(result, route.chapter.titleArt, `${routeId}:titleArt`);
    addUsage(result, route.chapter.endingArt, `${routeId}:endingArt`);
    for (const [endingId, ending] of Object.entries(route.chapter.endings || {})) {
      addUsage(result, ending.art, `${routeId}:ending:${endingId}`);
    }
    for (const [nodeId, node] of Object.entries(route.chapter.nodes || {})) {
      const visual = node.visual;
      if (!visual) continue;
      addUsage(result, visual.asset, `${routeId}:node:${nodeId}`);
      addUsage(result, visual.background, `${routeId}:node:${nodeId}`);
      for (const sprite of visual.sprites || []) addUsage(result, sprite.asset, `${routeId}:node:${nodeId}`);
    }
  }
  return result;
}

function runtimeContexts(content) {
  const contexts = [];
  const sourceMap = content.assetSources.files || {};
  const recipes = new Map((content.recipes.recipes || []).map((recipe) => [recipe.outputAsset, recipe.id]));
  const usages = collectUsages(content);

  for (const [assetId, asset] of Object.entries(content.manifest.assets || {})) {
    const declared = asset.kind === 'cinematic'
      ? [
          {
            runtimePath: asset.poster,
            role: 'poster',
            expectedDuration: null,
            expectedWidth: asset.posterWidth ?? null,
            expectedHeight: asset.posterHeight ?? null
          },
          ...Object.entries(asset.sources || {}).map(([format, runtimePath]) => ({
            runtimePath,
            role: `cinematic:${format}`,
            expectedDuration: asset.duration ?? null,
            expectedWidth: asset.width ?? null,
            expectedHeight: asset.height ?? null
          }))
        ]
      : [{
          runtimePath: asset.src,
          role: asset.kind,
          expectedDuration: null,
          expectedWidth: asset.width ?? null,
          expectedHeight: asset.height ?? null
        }];

    for (const item of declared) {
      const sourceEntry = sourceMap[item.runtimePath];
      const normalized = sourceEntry ? normalizedSource(sourceEntry) : null;
      contexts.push({
        category: 'runtime-source',
        logicalAssetId: assetId,
        role: item.role,
        runtimePath: item.runtimePath,
        provider: normalized?.provider || null,
        sourcePath: normalized?.source || normalized?.url || null,
        sourceEntry: normalized,
        recipe: recipes.get(assetId) || null,
        usage: [...(usages.get(assetId) || [])],
        expected: {
          width: item.expectedWidth,
          height: item.expectedHeight,
          ratio: ratio(item.expectedWidth, item.expectedHeight),
          duration: item.expectedDuration
        },
        blocking: true
      });
    }
  }
  return contexts;
}

function preservationContexts(content, coveredRuntimePaths) {
  const result = [];
  for (const [runtimePath, rawEntry] of Object.entries(content.assetSources.files || {})) {
    if (coveredRuntimePaths.has(runtimePath)) continue;
    const entry = normalizedSource(rawEntry);
    result.push({
      category: 'preservation-source',
      logicalAssetId: `preservation:${runtimePath}`,
      role: 'unreferenced-preservation',
      runtimePath,
      provider: entry.provider,
      sourcePath: entry.source || entry.url || null,
      sourceEntry: entry,
      recipe: null,
      usage: ['source-map only; not referenced by active manifest'],
      expected: { width: null, height: null, ratio: null, duration: null },
      blocking: false
    });
  }
  return result;
}

function catalogContexts(sourceCatalog) {
  return Object.entries(sourceCatalog.files || {}).map(([sourceId, entry]) => ({
    category: 'private-master-catalog',
    logicalAssetId: sourceId,
    role: 'private-master',
    runtimePath: null,
    provider: 'gdrive-private-catalog',
    sourcePath: `gdrive-private:${entry.fileId}`,
    sourceEntry: entry,
    recipe: null,
    usage: ['private Drive master; verified at ingest'],
    expected: {
      width: entry.width ?? null,
      height: entry.height ?? null,
      ratio: ratio(entry.width, entry.height),
      duration: entry.duration ?? null
    },
    blocking: true
  }));
}

async function walkFiles(root) {
  const files = [];
  async function visit(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch (error) {
      if (error?.code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(full);
      else if (entry.isFile() && mediaKind(full)) files.push(full);
    }
  }
  await visit(root);
  return files;
}

async function authoringTreeContexts() {
  const result = [];
  for (const root of ['content/references', 'content/cinematics']) {
    for (const absolute of await walkFiles(path.join(projectRoot, root))) {
      const sourcePath = path.relative(projectRoot, absolute).split(path.sep).join('/');
      result.push({
        category: 'legacy-authoring-source',
        logicalAssetId: `authoring:${sourcePath}`,
        role: sourcePath.startsWith('content/cinematics/') ? 'cinematic-source' : 'reference-source',
        runtimePath: null,
        provider: 'local',
        sourcePath,
        sourceEntry: { provider: 'local', source: sourcePath },
        recipe: null,
        usage: [path.dirname(sourcePath)],
        expected: { width: null, height: null, ratio: null, duration: null },
        blocking: true
      });
    }
  }
  return result;
}

async function downloadToCache(context) {
  const entry = context.sourceEntry;
  const response = await fetch(entry.url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`remote fetch failed ${response.status} ${response.statusText}: ${entry.url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (entry.bytes != null && buffer.length !== entry.bytes) {
    throw new Error(`byte-size mismatch: expected ${entry.bytes}, received ${buffer.length}`);
  }
  if (entry.sha256 && sha256(buffer) !== entry.sha256) {
    throw new Error('SHA-256 mismatch for public Drive runtime asset');
  }
  const safeName = context.runtimePath.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const target = path.join(cacheRoot, safeName);
  await writeFile(target, buffer);
  return target;
}

function formatContext(context, observed, errors) {
  return { ...context, observed, ok: errors.length === 0, errors };
}

export async function checkAssets({ print = true } = {}) {
  const tools = await requireMediaTools();
  const content = await loadContent();
  const sourceCatalog = await readJson('content/assets/source-catalog.json');
  await rm(cacheRoot, { recursive: true, force: true });
  await mkdir(cacheRoot, { recursive: true });

  const contexts = runtimeContexts(content);
  const coveredRuntimePaths = new Set(contexts.map((item) => item.runtimePath).filter(Boolean));
  contexts.push(...preservationContexts(content, coveredRuntimePaths));
  contexts.push(...catalogContexts(sourceCatalog));
  contexts.push(...await authoringTreeContexts());

  const results = [];
  for (const context of contexts) {
    const errors = [];
    let observed = null;

    try {
      if (!context.sourceEntry) throw new Error(`no source mapping for runtime path ${context.runtimePath}`);

      if (context.provider === 'gdrive-private-catalog') {
        const entry = context.sourceEntry;
        if (!entry.fileId || !entry.sha256 || !entry.bytes) errors.push('private master catalog requires fileId, sha256, and bytes');
        if (!entry.verifiedDecode) errors.push('private master has not been verified by full decode at ingest');
        observed = {
          bytes: entry.bytes,
          width: entry.width ?? null,
          height: entry.height ?? null,
          duration: entry.duration ?? null,
          format: entry.mimeType || null,
          codec: 'ingest-verified'
        };
      } else {
        let absolute;
        if (context.provider === 'gdrive-public') {
          absolute = await downloadToCache(context);
        } else if (context.provider === 'local') {
          absolute = path.join(projectRoot, context.sourceEntry.source);
          const info = await stat(absolute);
          if (!info.isFile()) throw new Error('path is not a regular file');
        } else {
          throw new Error(`unsupported provider: ${context.provider}`);
        }

        const info = await stat(absolute);
        observed = { bytes: info.size, ...(await inspectMedia(absolute)) };
      }

      if (context.expected.width && observed.width !== context.expected.width) {
        errors.push(`width mismatch: expected ${context.expected.width}, observed ${observed.width}`);
      }
      if (context.expected.height && observed.height !== context.expected.height) {
        errors.push(`height mismatch: expected ${context.expected.height}, observed ${observed.height}`);
      }
      const observedRatio = ratio(observed.width, observed.height);
      if (!approxEqual(context.expected.ratio, observedRatio, 0.01)) {
        errors.push(
          `aspect ratio mismatch: expected ${context.expected.ratio?.toFixed(4)}, observed ${observedRatio?.toFixed(4)}`
        );
      }
      if (
        context.expected.duration != null &&
        observed.duration != null &&
        Math.abs(observed.duration - context.expected.duration) > Math.max(0.5, context.expected.duration * 0.1)
      ) {
        errors.push(`duration mismatch: expected ~${context.expected.duration}s, observed ${observed.duration.toFixed(3)}s`);
      }
      if (context.role === 'cinematic:mp4' && !String(observed.format || '').includes('mp4')) {
        errors.push(`container mismatch: primary MP4 source probed as ${observed.format || 'unknown'}`);
      }
    } catch (error) {
      errors.push(error?.message || String(error));
    }

    results.push(formatContext(context, observed, errors));
  }

  const failures = results.filter((item) => !item.ok && item.blocking);
  const warnings = results.filter((item) => !item.ok && !item.blocking);
  const report = {
    reportVersion: 2,
    generatedAt: new Date().toISOString(),
    tools,
    summary: {
      checked: results.length,
      passed: results.filter((item) => item.ok).length,
      blockingFailures: failures.length,
      warnings: warnings.length
    },
    results
  };

  await mkdir(generatedRoot, { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  if (print) {
    console.log(
      `Asset media check: ${report.summary.passed}/${report.summary.checked} passed, ` +
      `${report.summary.blockingFailures} blocking failure(s), ${report.summary.warnings} warning(s).`
    );
    for (const failure of failures) {
      console.error('\n[BLOCKING ASSET ERROR]');
      console.error(`asset: ${failure.logicalAssetId}`);
      console.error(`role: ${failure.role}`);
      console.error(`provider: ${failure.provider || 'unknown'}`);
      console.error(`source: ${failure.sourcePath || '(missing mapping)'}`);
      if (failure.runtimePath) console.error(`runtime: ${failure.runtimePath}`);
      if (failure.recipe) console.error(`recipe: ${failure.recipe}`);
      if (failure.usage?.length) console.error(`usage: ${failure.usage.join(', ')}`);
      const expected = failure.expected || {};
      console.error(
        `expected: ${expected.width && expected.height ? `${expected.width}x${expected.height}` : 'decodable or attested media'}` +
        `${expected.ratio ? ` ratio=${expected.ratio.toFixed(4)}` : ''}` +
        `${expected.duration != null ? ` duration~${expected.duration}s` : ''}`
      );
      if (failure.observed) {
        console.error(
          `observed: bytes=${failure.observed.bytes} format=${failure.observed.format || 'unknown'} ` +
          `codec=${failure.observed.codec || 'unknown'} size=${failure.observed.width || '?'}x${failure.observed.height || '?'} ` +
          `duration=${failure.observed.duration ?? '?'}`
        );
      }
      for (const error of failure.errors) console.error(`error: ${error}`);
      console.error('blocking: yes');
    }
    for (const warning of warnings) {
      console.warn('\n[NON-BLOCKING ASSET WARNING]');
      console.warn(`asset: ${warning.logicalAssetId}`);
      console.warn(`source: ${warning.sourcePath}`);
      for (const error of warning.errors) console.warn(`warning: ${error}`);
    }
    console.log(`\nReport: ${path.relative(projectRoot, reportPath)}`);
  }

  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = await checkAssets();
  if (report.summary.blockingFailures) process.exitCode = 1;
}
