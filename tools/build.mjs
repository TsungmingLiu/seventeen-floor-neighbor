import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { loadAndValidate, projectRoot } from './content-lib.mjs';

const content = await loadAndValidate();
const routesRoot = path.join(projectRoot, 'dist/content/routes');
await mkdir(routesRoot, { recursive: true });

const publicIndex = {
  schemaVersion: content.routeIndex.schemaVersion,
  defaultRoute: content.routeIndex.defaultRoute,
  routes: content.routes.map(({ entry, config }) => ({
    id: entry.id,
    label: config.label,
    titlePrefix: config.titlePrefix,
    titleMain: config.titleMain,
    eyebrow: config.eyebrow,
    premise: config.premise,
    startLabel: config.startLabel,
    hint: config.hint,
    titleAlt: config.titleAlt,
    endingAlt: config.endingAlt,
    accent: config.accent
  }))
};
await writeFile(path.join(routesRoot, 'index.json'), `${JSON.stringify(publicIndex, null, 2)}\n`);

for (const route of content.routes) {
  const output = path.join(routesRoot, route.config.id);
  await mkdir(output, { recursive: true });
  await Promise.all([
    writeFile(path.join(output, 'chapter.json'), `${JSON.stringify(route.chapter, null, 2)}\n`),
    writeFile(path.join(output, 'scenes.json'), `${JSON.stringify(route.sceneLibrary, null, 2)}\n`),
    writeFile(path.join(output, 'assets.json'), `${JSON.stringify(route.assetManifest, null, 2)}\n`)
  ]);
}

const modules = (await readdir(path.join(projectRoot, 'src'))).filter(name => name.endsWith('.js'));
const sources = await Promise.all(modules.map(name => readFile(path.join(projectRoot, 'src', name), 'utf8')));
const css = await readFile(path.join(projectRoot, 'dist/styles.css'), 'utf8');
const revision = createHash('sha256').update(sources.join('\n') + css).digest('hex').slice(0, 12);
await Promise.all(modules.map((name, index) => writeFile(path.join(projectRoot, 'dist', name),
  sources[index].replace(/from '(\.\/[^']+\.js)'/g, `from '$1?v=${revision}'`))));
const htmlPath = path.join(projectRoot, 'dist/index.html');
const html = await readFile(htmlPath, 'utf8');
await writeFile(htmlPath, html.replace(/(src="app\.js|href="styles\.css)(?:\?v=[^"]*)?"/g, `$1?v=${revision}"`));
console.log(`Built ${content.routes.length} route package(s) in dist/content/routes/.`);
