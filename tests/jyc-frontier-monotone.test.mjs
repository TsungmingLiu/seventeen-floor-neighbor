import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ProgressStore } from '../src/progress.js';
import { isMemoryUnlocked } from '../src/memories.js';

const readJson = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const route = readJson('content/routes/opening-demo/route.json');
const chapter = {
  ...route.story,
  nodes: readJson('content/routes/opening-demo/chapter-01.json').nodes
};
const memories = readJson('content/routes/opening-demo/memories.json');
const cafeMemory = memories.events.find(event => event.id === 'mem.opening.ch1.station-cafe-jyc');
const streetMemory = memories.events.find(event => event.id === 'mem.opening.ch1.taipei-street');

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

const snapshotState = (metJyc, flags) => ({
  ...chapter.initialState,
  met_jiang_yucheng: metJyc,
  flags: new Set(flags)
});

function partialFrontierReplay() {
  const storage = new MemoryStorage();
  const progress = new ProgressStore(chapter, memories, storage);

  progress.capture('common_station_cafe_jyc_names_02', snapshotState(1, [
    'weekend_book_purchased',
    'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_go'
  ]), []);
  const originalCafeFrontier = structuredClone(progress.data.frontier);

  progress.beginReplay({
    nodeId: 'common_weekday_outing_work',
    stats: { ...chapter.initialState, met_jiang_yucheng: 0 },
    flags: ['history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip'],
    returnNodes: []
  });
  progress.capture('common_weekday_outing_work', snapshotState(0, [
    'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip'
  ]), []);
  progress.capture('common_weekday_outing_street_enter', snapshotState(0, [
    'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip',
    'jyc_permanently_excluded'
  ]), []);

  return { progress, storage, originalCafeFrontier };
}

test('street rank 185 replay cannot replace the original known-JYC cafe rank 180 frontier', () => {
  const { progress, originalCafeFrontier } = partialFrontierReplay();

  assert.equal(originalCafeFrontier.nodeId, 'common_station_cafe_jyc_names_02');
  assert.equal(progress.data.frontierRank, 180);
  assert.equal(progress.data.frontierMemoryEventId, cafeMemory.id);
  assert.equal(progress.data.frontier.nodeId, 'common_station_cafe_jyc_names_02');
});

test('the replay cursor keeps its actual unknown and excluded street state', () => {
  const { progress } = partialFrontierReplay();
  const local = progress.restore(progress.data.cursor);

  assert.equal(local.nodeId, 'common_weekday_outing_street_enter');
  assert.equal(local.state.met_jiang_yucheng, 0);
  assert.equal(local.state.flags.has('jyc_permanently_excluded'), true);
  assert.equal(local.state.flags.has('contact_jyc'), false);
  assert.equal(local.state.flags.has('player_knows_jyc_name'), false);
});

test('reload keeps both earned Memories and the original main frontier', () => {
  const { progress, storage } = partialFrontierReplay();
  assert.equal(isMemoryUnlocked(cafeMemory, progress, chapter.startNode), true);
  assert.equal(isMemoryUnlocked(streetMemory, progress, chapter.startNode), true);

  const reloaded = new ProgressStore(chapter, memories, storage);
  assert.equal(isMemoryUnlocked(cafeMemory, reloaded, chapter.startNode), true);
  assert.equal(isMemoryUnlocked(streetMemory, reloaded, chapter.startNode), true);
  assert.equal(reloaded.data.frontier.nodeId, 'common_station_cafe_jyc_names_02');
  assert.equal(reloaded.data.frontierRank, 180);
  assert.equal(reloaded.data.frontierMemoryEventId, cafeMemory.id);
});

test('reload retains the street cursor as local unknown and excluded state', () => {
  const { storage } = partialFrontierReplay();
  const reloaded = new ProgressStore(chapter, memories, storage);
  const local = reloaded.restore(reloaded.data.cursor);
  assert.equal(local.nodeId, 'common_weekday_outing_street_enter');
  assert.equal(local.state.met_jiang_yucheng, 0);
  assert.equal(local.state.flags.has('jyc_permanently_excluded'), true);
});

test('first-ever street capture earns its street Memory without opening JYC Memory', () => {
  const progress = new ProgressStore(chapter, memories, new MemoryStorage());
  progress.capture('common_weekday_outing_street_enter', snapshotState(0, [
    'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip',
    'jyc_permanently_excluded'
  ]), []);

  assert.equal(isMemoryUnlocked(streetMemory, progress, chapter.startNode), true);
  assert.equal(isMemoryUnlocked(cafeMemory, progress, chapter.startNode), false);
  if (Object.hasOwn(progress.data, 'jycEverUnlocked')) {
    assert.equal(progress.data.jycEverUnlocked, false);
  }
});

test('a persistent JYC unlock, when represented, never clears during the excluded replay', () => {
  const { progress, storage } = partialFrontierReplay();
  if (!Object.hasOwn(progress.data, 'jycEverUnlocked')) return;

  assert.equal(progress.data.jycEverUnlocked, true);
  const reloaded = new ProgressStore(chapter, memories, storage);
  assert.equal(reloaded.data.jycEverUnlocked, true);
});
