import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { projectRoot } from './content-lib.mjs';
const root = path.join(projectRoot, 'dist');
const profile = process.env.STORY_MAP_PROFILE || 'player';
const exists = async relative => { try { await access(path.join(root, relative)); return true; } catch { return false; } };
const module = await readFile(path.join(root, 'story-map.js'), 'utf8');
const routes = JSON.parse(await readFile(path.join(root, 'content/routes/index.json'), 'utf8'));
assert.equal(await exists('story-map-review.js'), profile === 'review');
assert.equal(module.includes("from './story-map-review.js"), profile === 'review');
assert.equal(module.includes('STORY_MAP_REVIEW_FACTORY'), false);
for (const route of routes.routes) {
  assert.equal(await exists(`content/routes/${route.id}/story-map-review.json`), profile === 'review');
  const map = JSON.parse(await readFile(path.join(root, `content/routes/${route.id}/story-map.json`), 'utf8'));
  assert.ok(map.groups.length);
}
console.log(`Story Map ${profile} build boundary passed.`);
