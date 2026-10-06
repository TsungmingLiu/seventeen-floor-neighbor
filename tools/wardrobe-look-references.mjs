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

export function inventory(registry = defaultRegistry) {
  return Object.keys(registry.characters).flatMap(characterId => wardrobeInventory(characterId, registry)
    .map(row => ({ characterId, ...row, variants: ['full', 'upper'] })));
}

/** A generated plan is reproducibility evidence, never a second registry or acceptance. */
export function validateCropPlan(plan, { sourceRef = 'WORKTREE', catalog = defaultCatalog, registry = defaultRegistry } = {}) {
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
    insist(typeof derivedSourceId === 'string' && derivedSourceId.startsWith(`ref.${characterId}.`) && !catalog.files[derivedSourceId], 'derived source ID must be new and character scoped');
    insist(typeof outputPath === 'string' && outputPath.endsWith('.png') && !catalog.files[derivedSourceId], 'crop output must be PNG');
    const source = { name: path.posix.basename(outputPath), sourcePath: outputPath, characterId, role: 'wardrobe',
      mimeType: 'image/png', width: rect?.width, height: rect?.height, verifiedDecode: true, status: 'active-production',
      derivation: { sourceId: crop.sourceId, sourcePath: crop.sourcePath, sourceRef: crop.sourceRef, wardrobeKey, variant, rect } };
    validateWardrobeDerivation(source, { characterId, wardrobeKey, variant, sourceRef }, catalog, registry);
    insist(!Object.values(catalog.files).some(item => item.sourcePath === outputPath), 'crop cannot overwrite a cataloged source');
    return { derivedSourceId, source };
  });
}

function contained(root, relative) {
  const absolute = path.resolve(root, relative);
  insist(absolute.startsWith(`${path.resolve(root, 'assets-src')}${path.sep}`), 'crop path escapes assets-src');
  return absolute;
}
function decode(filename, expected) {
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height', '-of', 'json', filename], { encoding: 'utf8' })).streams?.[0];
  insist(probe?.codec_name === 'png' && probe.width === expected.width && probe.height === expected.height, 'crop PNG dimensions/MIME mismatch');
  execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', filename, '-f', 'null', '-'], { stdio: 'pipe' });
}

export function materializeCropPlan(plan, { repoRoot = ROOT, ...options } = {}) {
  const records = validateCropPlan(plan, options);
  const catalog = options.catalog ?? defaultCatalog;
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'wardrobe-source-'));
  try {
    const prepared = records.map(({ source }, index) => {
      let input = contained(repoRoot, source.derivation.sourcePath);
      if (source.derivation.sourceRef === 'WORKTREE') {
        insist(fs.realpathSync(input).startsWith(`${fs.realpathSync(path.join(repoRoot, 'assets-src'))}${path.sep}`), 'crop input symlink escapes assets-src');
      } else {
        const bytes = execFileSync('git', ['show', `${source.derivation.sourceRef}:${source.derivation.sourcePath}`], { cwd: repoRoot, maxBuffer: 64 * 1024 * 1024 });
        input = path.join(temporary, `${index}.png`);
        fs.writeFileSync(input, bytes, { flag: 'wx' });
      }
      decode(input, catalog.files[source.derivation.sourceId]);
      const output = contained(repoRoot, source.sourcePath);
      let existingParent = path.dirname(output);
      while (!fs.existsSync(existingParent)) existingParent = path.dirname(existingParent);
      const realExisting = fs.realpathSync(existingParent), assetRoot = fs.realpathSync(path.join(repoRoot, 'assets-src'));
      insist(realExisting === assetRoot || realExisting.startsWith(`${assetRoot}${path.sep}`), 'crop output ancestor escapes assets-src');
      fs.mkdirSync(path.dirname(output), { recursive: true });
      const realParent = fs.realpathSync(path.dirname(output)), realAssets = fs.realpathSync(path.join(repoRoot, 'assets-src'));
      insist(realParent === realAssets || realParent.startsWith(`${realAssets}${path.sep}`), 'crop output symlink escapes assets-src');
      insist(!fs.existsSync(output), 'crop output already exists');
      return { source, input, output };
    });
    for (const { source, input, output } of prepared) {
      const r = source.derivation.rect;
      execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-n', '-i', input, '-vf', `crop=${r.width}:${r.height}:${r.left}:${r.top}:exact=1`, '-frames:v', '1', '-threads', '1', output], { stdio: 'pipe' });
      decode(output, source);
    }
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
  return records.map(({ derivedSourceId, source }) => ({ derivedSourceId, ...source, status: 'pending-independent-crop-qa' }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--inventory') options.inventory = true;
      else if (args[i] === '--plan') options.plan = args[++i];
      else if (args[i] === '--source-ref') options.sourceRef = args[++i];
      else if (args[i] === '--materialize') options.materialize = true;
      else throw new Error(`unknown argument: ${args[i]}`);
    }
    insist(options.inventory !== !!options.plan && (!options.materialize || options.plan), 'choose --inventory or --plan [--materialize]');
    const plan = options.plan && JSON.parse(fs.readFileSync(options.plan, 'utf8'));
    const result = options.inventory ? inventory() : options.materialize ? materializeCropPlan(plan, options) : validateCropPlan(plan, options);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
