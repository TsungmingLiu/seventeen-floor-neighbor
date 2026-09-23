import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, projectRoot } from './content-lib.mjs';
import { approxEqual, inspectMedia, mediaKind, ratio, requireMediaTools } from './media-lib.mjs';

const generatedRoot = path.join(projectRoot, 'generated');
const reportPath = path.join(generatedRoot, 'asset-report.json');

function normalizedSource(entry) {
  return typeof entry === 'string'
    ? { source: entry, transform: 'copy' }
    : { transform: 'copy', ...entry };
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

function runtimeContexts(content) {
  const contexts = [];
  const reverseSource = content.assetSources.files || {};
  const recipes = new Map((content.recipes.recipes || []).map((recipe) => [recipe.outputAsset, recipe.id]));
  const usages = collectUsages(content);

  for (const [assetId, asset] of Object.entries(content.manifest.assets || {})) {
    const declared = asset.kind === 'cinematic'
      ? [
          { runtimePath: asset.poster, role: 'poster', expectedDuration: null },
          ...Object.entries(asset.sources || {}).map(([format, runtimePath]) => ({
            runtimePath,
            role: `cinematic:${format}`,
            expectedDuration: asset.duration ?? null
          }))
        ]
      : [{ runtimePath: asset.src, role: asset.kind, expectedDuration: null }];

    for (const item of declared) {
      const sourceEntry = reverseSource[item.runtimePath];
      const normalized = sourceEntry ? normalizedSource(sourceEntry) : null;
      contexts.push({
        category: 'runtime-source',
        logicalAssetId: assetId,
        role: item.role,
        runtimePath: item.runtimePath,
        sourcePath: normalized?.source || null,
        transform: normalized?.transform || null,
        recipe: recipes.get(assetId) || null,
        usage: [...(usages.get(assetId) || [])],
        expected: {
          width: asset.width ?? null,
          height: asset.height ?? null,
          ratio: ratio(asset.width, asset.height),
          duration: item.expectedDuration
        },
        blocking: true
      });
    }
  }

  return contexts;
}

function referenceContexts(content) {
  const result = [];
  for (const character of Object.values(content.characters)) {
    for (const reference of character.references || []) {
      if (!reference.path || !mediaKind(reference.path)) continue;
      result.push({
        category: 'authoring-reference',
        logicalAssetId: `reference.${character.id}.${reference.role || 'unknown'}`,
        role: reference.role || 'reference',
        runtimePath: null,
        sourcePath: reference.path,
        transform: null,
        recipe: null,
        usage: [`character:${character.id}:${reference.role || 'reference'}`],
        expected: { width: null, height: null, ratio: null, duration: null },
        blocking: true
      });
    }
  }
  return result;
}

async function authoringTreeContexts(covered) {
  const roots = ['content/references', 'content/cinematics'];
  const result = [];
  for (const root of roots) {
    for (const absolute of await walkFiles(path.join(projectRoot, root))) {
      const sourcePath = path.relative(projectRoot, absolute).split(path.sep).join('/');
      if (covered.has(sourcePath)) continue;
      result.push({
        category: 'authoring-source',
        logicalAssetId: `authoring:${sourcePath}`,
        role: sourcePath.startsWith('content/cinematics/') ? 'cinematic-source' : 'reference-source',
        runtimePath: null,
        sourcePath,
        transform: null,
        recipe: null,
        usage: [path.dirname(sourcePath)],
        expected: { width: null, height: null, ratio: null, duration: null },
        blocking: true
      });
    }
  }
  return result;
}

function formatContext(context, observed, errors) {
  return {
    ...context,
    observed,
    ok: errors.length === 0,
    errors
  };
}

export async function checkAssets({ print = true } = {}) {
  const tools = await requireMediaTools();
  const content = await loadContent();
  const contexts = runtimeContexts(content);
  const covered = new Set([
    ...contexts.map((item) => item.sourcePath).filter(Boolean),
    ...referenceContexts(content).map((item) => item.sourcePath).filter(Boolean)
  ]);
  contexts.push(...referenceContexts(content));
  contexts.push(...await authoringTreeContexts(covered));

  const results = [];
  for (const context of contexts) {
    const errors = [];
    let observed = null;

    if (!context.sourcePath) {
      errors.push(`no source mapping for runtime path ${context.runtimePath}`);
      results.push(formatContext(context, observed, errors));
      continue;
    }

    const absolute = path.join(projectRoot, context.sourcePath);
    try {
      const info = await stat(absolute);
      if (!info.isFile()) throw new Error('path is not a regular file');
      observed = { bytes: info.size, ...(await inspectMedia(absolute)) };

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
        errors.push(
          `duration mismatch: expected ~${context.expected.duration}s, observed ${observed.duration.toFixed(3)}s`
        );
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
  const report = {
    reportVersion: 1,
    generatedAt: new Date().toISOString(),
    tools,
    summary: {
      checked: results.length,
      passed: results.length - failures.length,
      blockingFailures: failures.length
    },
    results
  };

  await mkdir(generatedRoot, { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  if (print) {
    console.log(`Asset media check: ${report.summary.passed}/${report.summary.checked} passed.`);
    for (const failure of failures) {
      console.error('\n[BLOCKING ASSET ERROR]');
      console.error(`asset: ${failure.logicalAssetId}`);
      console.error(`role: ${failure.role}`);
      console.error(`source: ${failure.sourcePath || '(missing mapping)'}`);
      if (failure.runtimePath) console.error(`runtime: ${failure.runtimePath}`);
      if (failure.recipe) console.error(`recipe: ${failure.recipe}`);
      if (failure.usage?.length) console.error(`usage: ${failure.usage.join(', ')}`);
      const expected = failure.expected || {};
      console.error(
        `expected: ${expected.width && expected.height ? `${expected.width}x${expected.height}` : 'decodable media'}` +
        `${expected.ratio ? ` ratio=${expected.ratio.toFixed(4)}` : ''}` +
        `${expected.duration != null ? ` duration~${expected.duration}s` : ''}`
      );
      if (failure.observed) {
        console.error(
          `observed: bytes=${failure.observed.bytes} ` +
          `format=${failure.observed.format || 'unknown'} codec=${failure.observed.codec || 'unknown'} ` +
          `size=${failure.observed.width || '?'}x${failure.observed.height || '?'} ` +
          `duration=${failure.observed.duration ?? '?'}`
        );
      }
      for (const error of failure.errors) console.error(`error: ${error}`);
      console.error('blocking: yes');
    }
    console.log(`\nReport: ${path.relative(projectRoot, reportPath)}`);
  }

  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = await checkAssets();
  if (report.summary.blockingFailures) process.exitCode = 1;
}
