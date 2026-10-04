import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compileStoryMap } from '../tools/story-map.mjs';
import { storyMapView, groupForNode } from '../src/story-map.js';
const read = async file => JSON.parse(await readFile(new URL(file, import.meta.url), 'utf8'));
const chapter = await read('../content/routes/opening-demo/chapter-01.json');
const memoryLibrary = await read('../content/routes/opening-demo/memories.json');
const definition = await read('../content/storyboards/opening-demo.json');
const route = { chapter, memoryLibrary, sceneLibrary: { pools: {} } };
const map = compileStoryMap(route, definition);
const snapshot = id => ({ nodeId: id, stats: chapter.initialState, flags: [], returnNodes: [] });
const progress = ids => ({ data: { checkpoints: Object.fromEntries(ids.map(id => [id, snapshot(id)])), edges: [], cursor: null, frontier: null } });

test('café variants occupy one scene and keep existing replay/Memory identity', () => {
  const café = map.groups.find(g => g.id === 'cafe');
  assert.equal(café.variants.length, 2);
  assert.equal(groupForNode(map, 'common_station_cafe_jyc_first_enter').id, 'cafe');
  const save = progress(['common_station_cafe_jyc_first_enter']);
  const before = JSON.stringify(save);
  const view = storyMapView(map, memoryLibrary, chapter, save);
  const shown = view.groups.find(g => g.id === 'cafe');
  assert.equal(shown.variants.length, 1);
  assert.equal(shown.variants[0].id, 'first');
  assert.equal(shown.memoryId, 'mem.opening.ch1.first-cafe-jyc');
  assert.equal(JSON.stringify(save), before);
});

test('player projection does not expose names or variants of unknown scenes', () => {
  const view = storyMapView(map, memoryLibrary, chapter, progress([]));
  assert.deepEqual(view.groups.filter(g => !g.locked).map(g => g.id), []);
  assert.ok(view.groups.filter(g => g.locked).every(g => g.variants.length === 0));
  assert.equal(view.groups.some(g => g.id === 'cafe'), false);
  assert.deepEqual(view.edges, []);
});

test('connections require observed journey edges, never two unrelated checkpoints', () => {
  const save = progress(['common_movein_rain_open', 'common_elevator_restart_enter']);
  assert.deepEqual(storyMapView(map, memoryLibrary, chapter, save).edges, []);
  save.data.edges = [['common_movein_rain_open', 'common_elevator_restart_enter']];
  assert.deepEqual(storyMapView(map, memoryLibrary, chapter, save).edges, [{ from: 'movein', to: 'elevator' }]);
});

test('parcel is a separate scene and does not unlock from the earlier shared Memory', () => {
  const save = progress(['common_convenience_xu_enter']);
  assert.equal(storyMapView(map, memoryLibrary, chapter, save).groups.some(g => g.id === 'parcel'), false);
  save.data.checkpoints.common_package_xu_arrive = snapshot('common_package_xu_arrive');
  save.data.frontier = snapshot('common_package_xu_arrive');
  const parcel = storyMapView(map, memoryLibrary, chapter, save).groups.find(g => g.id === 'parcel');
  assert.equal(parcel.frontier, true);
  assert.equal(parcel.memoryId, null);
});

test('review projection exposes all entry versions without modifying gameplay', () => {
  const save = progress([]), before = JSON.stringify(save);
  const view = storyMapView(map, memoryLibrary, chapter, save, true);
  assert.equal(view.groups.length, definition.groups.length);
  assert.ok(view.groups.every(g => !g.locked));
  assert.equal(JSON.stringify(save), before);
  assert.ok(view.edges.find(e => e.from === 'weekend' && e.to === 'bookstore').label.includes('書店'));
  assert.equal(view.edges.some(e => e.from === 'bookstore' && e.to === 'weekend'), false);
});
