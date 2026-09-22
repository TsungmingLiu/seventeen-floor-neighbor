import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadAndValidate, projectRoot } from './content-lib.mjs';

await loadAndValidate();
await mkdir(path.join(projectRoot, 'dist/content'), { recursive: true });

const copies = [
  ['content/assets/manifest.json', 'dist/content/assets.json'],
  ['content/chapters/chapter-01.json', 'dist/content/chapter-01.json'],
  ['content/scenes/date-pool.json', 'dist/content/date-pool.json'],
  ['src/app.js', 'dist/app.js'],
  ['src/engine.js', 'dist/engine.js']
];
await Promise.all(copies.map(([source, target]) =>
  copyFile(path.join(projectRoot, source), path.join(projectRoot, target))
));
console.log(`Built ${copies.length} runtime file(s) in dist/.`);
