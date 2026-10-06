import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { wardrobeInventory, validateWardrobeDerivation } from './character-references.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
const insist = (condition, message) => { if (!condition) throw new Error(message); };
const defaultRegistry = read('content/assets/character-reference-packs.json');
const defaultCatalog = read('content/assets/source-catalog.json');
const sameRectList = (a, b) => a === undefined || b === undefined ? a === b
  : Array.isArray(a) && Array.isArray(b) && a.length === b.length
    && a.every((rect, index) => ['left', 'top', 'width', 'height'].every(key => rect[key] === b[index]?.[key]));

export function inventory(registry = defaultRegistry) {
  return Object.keys(registry.characters).flatMap(characterId => wardrobeInventory(characterId, registry)
    .map(row => ({ characterId, ...row, variants: ['full', 'upper'] })));
}

/** A generated plan is reproducibility evidence, never a second registry or acceptance. */
export function validateCropPlan(plan, { sourceRef = 'WORKTREE', catalog = defaultCatalog, registry = defaultRegistry, rebuild = false } = {}) {
  insist(plan?.schemaVersion === 1 && Array.isArray(plan.crops) && plan.crops.length > 0, 'invalid crop plan');
  insist(typeof sourceRef === 'string' && sourceRef.trim() && !sourceRef.startsWith('-') && !/[\s\x00]/.test(sourceRef), 'canonical source branch/ref or WORKTREE required');
  const seen = new Set(), outputs = new Set(), ids = new Set();
  return plan.crops.map(crop => {
    const { characterId, wardrobeKey, variant, derivedSourceId, outputPath, rect } = crop;
    const canonical = wardrobeInventory(characterId, registry).find(row => row.wardrobeKey === wardrobeKey);
    insist(canonical, `crop requires canonical wardrobe key: ${wardrobeKey}`);
    const identity = `${characterId}:${wardrobeKey}:${variant}`;
    insist(!seen.has(identity) && !outputs.has(outputPath) && !ids.has(derivedSourceId), 'duplicate crop identity/output/source ID');
    seen.add(identity); outputs.add(outputPath); ids.add(derivedSourceId);
    insist(typeof derivedSourceId === 'string' && derivedSourceId.startsWith(`ref.${characterId}.`), 'derived source ID must be character scoped');
    const registered = catalog.files[derivedSourceId];
    insist(!registered || rebuild, 'derived source ID must be new unless explicitly rebuilding');
    insist(typeof outputPath === 'string' && outputPath.endsWith('.png') && path.posix.normalize(outputPath) === outputPath && !outputPath.includes('\\'), 'crop output must be PNG');
    const derivation = { sourceId: crop.sourceId, sourcePath: crop.sourcePath, sourceRef: crop.sourceRef, wardrobeKey, variant, rect };
    if (Object.hasOwn(crop, 'excludeRects')) derivation.excludeRects = crop.excludeRects;
    const source = { name: path.posix.basename(outputPath), sourcePath: outputPath, characterId, role: 'wardrobe',
      mimeType: 'image/png', width: rect?.width, height: rect?.height, verifiedDecode: true, status: 'active-production',
      derivation };
    validateWardrobeDerivation(source, { characterId, wardrobeKey, variant, sourceRef }, catalog, registry);
    if (registered) {
      insist(registered.derivation && registered.status === 'optional-reference', 'rebuild requires an optional derived reference; deactivate active references first');
      validateWardrobeDerivation({ ...registered, status: 'active-production' }, { characterId, wardrobeKey, variant, sourceRef }, catalog, registry);
      insist(['name', 'sourcePath', 'characterId', 'role', 'mimeType', 'width', 'height'].every(key => registered[key] === source[key])
        && ['sourceId', 'sourcePath', 'sourceRef', 'wardrobeKey', 'variant'].every(key => registered.derivation[key] === source.derivation[key])
        && ['left', 'top', 'width', 'height'].every(key => registered.derivation.rect[key] === rect[key])
        && sameRectList(registered.derivation.excludeRects, source.derivation.excludeRects), 'rebuild must match exact registered crop identity');
    }
    insist(!Object.entries(catalog.files).some(([id, item]) => id !== derivedSourceId && item.sourcePath === outputPath), 'crop cannot overwrite a cataloged source');
    return { derivedSourceId, source };
  });
}

function contained(root, relative) {
  const absolute = path.resolve(root, relative);
  insist(absolute.startsWith(`${path.resolve(root, 'assets-src')}${path.sep}`), 'crop path escapes assets-src');
  return absolute;
}
function probe(filename, expected, runCommand) {
  const result = JSON.parse(runCommand('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height', '-of', 'json', filename], { encoding: 'utf8' })).streams?.[0];
  insist(result?.codec_name === 'png' && result.width === expected.width && result.height === expected.height, 'crop PNG dimensions/MIME mismatch');
}
function decode(filename, expected, runCommand) {
  probe(filename, expected, runCommand);
  runCommand('ffmpeg', ['-v', 'error', '-xerror', '-i', filename, '-f', 'null', '-'], { stdio: 'pipe' });
}

export function materializeCropPlan(plan, { repoRoot = ROOT, runCommand = execFileSync, ...options } = {}) {
  const records = validateCropPlan(plan, options);
  const catalog = options.catalog ?? defaultCatalog;
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'wardrobe-source-'));
  const stagingDirs = [];
  try {
    const groups = new Map();
    const prepared = records.map(({ derivedSourceId, source }) => {
      const output = contained(repoRoot, source.sourcePath);
      let existingParent = path.dirname(output);
      while (!fs.existsSync(existingParent)) existingParent = path.dirname(existingParent);
      const realExisting = fs.realpathSync(existingParent), assetRoot = fs.realpathSync(path.join(repoRoot, 'assets-src'));
      insist(realExisting === assetRoot || realExisting.startsWith(`${assetRoot}${path.sep}`), 'crop output ancestor escapes assets-src');
      fs.mkdirSync(path.dirname(output), { recursive: true });
      const realParent = fs.realpathSync(path.dirname(output));
      insist(realParent === assetRoot || realParent.startsWith(`${assetRoot}${path.sep}`), 'crop output symlink escapes assets-src');
      const replace = !!catalog.files[derivedSourceId] && options.rebuild === true;
      insist(!fs.existsSync(output) || replace, 'crop output already exists');
      if (replace && fs.existsSync(output)) insist(fs.lstatSync(output).isFile() && !fs.lstatSync(output).isSymbolicLink(), 'rebuild target must be a regular derived file');
      const staging = fs.mkdtempSync(path.join(realParent, '.wardrobe-crop-'));
      stagingDirs.push(staging);
      const item = { source, output, replace, staged: path.join(staging, 'crop.png') };
      const key = `${source.derivation.sourceRef}:${source.derivation.sourcePath}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
      return item;
    });
    let sourceIndex = 0;
    for (const group of groups.values()) {
      const d = group[0].source.derivation;
      const input = path.join(temporary, `${sourceIndex++}.png`);
      if (d.sourceRef === 'WORKTREE') {
        const original = contained(repoRoot, d.sourcePath);
        insist(fs.realpathSync(original).startsWith(`${fs.realpathSync(path.join(repoRoot, 'assets-src'))}${path.sep}`), 'crop input symlink escapes assets-src');
        fs.copyFileSync(original, input, fs.constants.COPYFILE_EXCL);
      } else {
        const bytes = runCommand('git', ['show', `${d.sourceRef}:${d.sourcePath}`], { cwd: repoRoot, maxBuffer: 64 * 1024 * 1024 });
        fs.writeFileSync(input, bytes, { flag: 'wx' });
      }
      probe(input, catalog.files[d.sourceId], runCommand);
      // One input decode fans out to every crop of this exact original/ref.
      const split = group.length > 1 ? `[0:v]split=${group.length}${group.map((_, i) => `[s${i}]`).join('')};` : '';
      const filters = group.map(({ source }, i) => {
        const r = source.derivation.rect;
        const base = `${group.length > 1 ? `[s${i}]` : '[0:v]'}crop=${r.width}:${r.height}:${r.left}:${r.top}:exact=1`;
        const masks = source.derivation.excludeRects ?? [];
        const fill = masks.map(mask => `drawbox=x=${mask.left - r.left}:y=${mask.top - r.top}:w=${mask.width}:h=${mask.height}:color=white@1.0:t=fill`);
        return `${base}${fill.length ? `,${fill.join(',')}` : ''}[o${i}]`;
      }).join(';');
      const args = ['-v', 'error', '-xerror', '-n', '-i', input, '-filter_complex', split + filters];
      group.forEach(({ staged }, i) => args.push('-map', `[o${i}]`, '-frames:v', '1', '-threads', '1', staged));
      runCommand('ffmpeg', args, { stdio: 'pipe' });
      for (const { source, staged } of group) decode(staged, source, runCommand);
    }
    // Only publish fully decoded outputs; replacement is atomic per derived file.
    for (const { output, staged, replace } of prepared) {
      if (replace) {
        if (fs.existsSync(output)) insist(fs.lstatSync(output).isFile() && !fs.lstatSync(output).isSymbolicLink(), 'rebuild target must be a regular derived file');
        fs.renameSync(staged, output);
      } else fs.linkSync(staged, output);
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
    for (const staging of stagingDirs) fs.rmSync(staging, { recursive: true, force: true });
  }
  return records.map(({ derivedSourceId, source }) => ({ derivedSourceId, ...source, status: 'pending-independent-crop-qa' }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--inventory') options.inventory = true;
      else if (args[i] === '--plan') options.plan = args[++i];
      else if (args[i] === '--source-ref') options.sourceRef = args[++i];
      else if (args[i] === '--rebuild') options.rebuild = true;
      else if (args[i] === '--materialize') options.materialize = true;
      else throw new Error(`unknown argument: ${args[i]}`);
    }
    insist(options.inventory !== !!options.plan && (!options.materialize || options.plan), 'choose --inventory or --plan [--materialize]');
    const plan = options.plan && JSON.parse(fs.readFileSync(options.plan, 'utf8'));
    const result = options.inventory ? inventory() : options.materialize ? materializeCropPlan(plan, options) : validateCropPlan(plan, options);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
