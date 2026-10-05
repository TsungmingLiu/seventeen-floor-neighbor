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

function partialFrontierReplay({ freshRun = false } = {}) {
  const storage = new MemoryStorage();
  const progress = new ProgressStore(chapter, memories, storage);

  progress.capture('common_station_cafe_jyc_names_02', snapshotState(1, [
    'weekend_book_purchased',
    'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_go'
  ]), []);
  const originalCafeFrontier = structuredClone(progress.data.frontier);

  const home = {
    nodeId: 'common_weekday_outing_work',
    stats: { ...chapter.initialState, met_jiang_yucheng: 0 },
    flags: ['history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip'],
    returnNodes: []
  };
  if (freshRun) {
    progress.beginFreshRun();
    progress.capture(chapter.startNode, snapshotState(0, []), []);
  } else progress.beginReplay(home);
  progress.capture(home.nodeId, progress.restore(home).state, []);
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
  assert.deepEqual(progress.data.frontier, originalCafeFrontier);
  assert.equal(progress.replaying, true);
  assert.equal(progress.data.restartActive, false);
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
  const { progress, storage, originalCafeFrontier } = partialFrontierReplay();
  assert.equal(isMemoryUnlocked(cafeMemory, progress, chapter.startNode), true);
  assert.equal(isMemoryUnlocked(streetMemory, progress, chapter.startNode), true);

  const reloaded = new ProgressStore(chapter, memories, storage);
  assert.equal(isMemoryUnlocked(cafeMemory, reloaded, chapter.startNode), true);
  assert.equal(isMemoryUnlocked(streetMemory, reloaded, chapter.startNode), true);
  assert.deepEqual(reloaded.data.frontier, originalCafeFrontier);
  assert.equal(reloaded.data.frontierRank, 180);
  assert.equal(reloaded.data.frontierMemoryEventId, cafeMemory.id);
  assert.equal(reloaded.replaying, true);
});

test('reload retains the street cursor as local unknown and excluded state', () => {
  const { storage } = partialFrontierReplay();
  const reloaded = new ProgressStore(chapter, memories, storage);
  const local = reloaded.restore(reloaded.data.cursor);
  assert.equal(local.nodeId, 'common_weekday_outing_street_enter');
  assert.equal(local.state.met_jiang_yucheng, 0);
  assert.equal(local.state.flags.has('jyc_permanently_excluded'), true);
  assert.equal(local.state.flags.has('contact_jyc'), false);
  assert.equal(local.state.flags.has('player_knows_jyc_name'), false);
  assert.equal(local.state.flags.has('weekend_book_purchased'), false);
  assert.equal(reloaded.replaying, true);
});

test('first-ever street capture earns its street Memory without opening JYC Memory', () => {
  const progress = new ProgressStore(chapter, memories, new MemoryStorage());
  progress.capture('common_weekday_outing_street_enter', snapshotState(0, [
    'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip',
    'jyc_permanently_excluded'
  ]), []);

  assert.equal(isMemoryUnlocked(streetMemory, progress, chapter.startNode), true);
  assert.equal(isMemoryUnlocked(cafeMemory, progress, chapter.startNode), false);
  assert.equal(progress.data.jycEverUnlocked, false);
  assert.equal(new ProgressStore(chapter, memories, progress.storage).data.jycEverUnlocked, false);
});

test('the persistent JYC unlock never clears during the excluded replay', () => {
  const { progress, storage } = partialFrontierReplay();

  assert.equal(progress.data.jycEverUnlocked, true);
  const reloaded = new ProgressStore(chapter, memories, storage);
  assert.equal(reloaded.data.jycEverUnlocked, true);
});

for (const freshRun of [false, true]) {
  test(`${freshRun ? 'fresh restart' : 'Memory replay'} street and package rank 200 preserve the partial cafe main across reload`, () => {
    const { progress, storage, originalCafeFrontier } = partialFrontierReplay({ freshRun });
    const street = structuredClone(progress.data.cursor);
    let current = progress;
    for (const nodeId of ['common_package_xu_arrive', 'common_package_xu_arrive_02']) {
      current = new ProgressStore(chapter, memories, storage);
      assert.equal(current.replaying, true);
      assert.equal(current.data.restartActive, freshRun);
      current.capture(nodeId, current.restore(street).state, []);
      assert.equal(current.progressRank(current.data.cursor), 200);
      assert.deepEqual(current.data.frontier, originalCafeFrontier);
      assert.equal(current.data.frontierRank, 180);
      assert.equal(current.data.frontierMemoryEventId, cafeMemory.id);
      assert.equal(current.replaying, true);
      assert.equal(current.data.restartActive, freshRun);
      assert.equal(current.data.cursor.stats.met_jiang_yucheng, 0);
      assert.ok(current.data.cursor.flags.includes('jyc_permanently_excluded'));
      for (const flag of ['contact_jyc', 'player_knows_jyc_name', 'weekend_book_purchased']) {
        assert.ok(!current.data.cursor.flags.includes(flag), flag);
      }
      for (const event of [cafeMemory, streetMemory]) assert.ok(isMemoryUnlocked(event, current, chapter.startNode));
      assert.equal(current.data.jycEverUnlocked, true);
    }
    const reload = new ProgressStore(chapter, memories, storage);
    assert.deepEqual(reload.data.frontier, originalCafeFrontier);
    assert.deepEqual(reload.data.cursor, current.data.cursor);
    assert.equal(reload.replaying, true);
    assert.equal(reload.data.restartActive, freshRun);
    for (const event of [cafeMemory, streetMemory]) assert.ok(isMemoryUnlocked(event, reload, chapter.startNode));
  });
}

test('another known-JYC branch cannot replace purchased-book main history by rank alone', () => {
  const { progress, originalCafeFrontier } = partialFrontierReplay();
  progress.capture('common_package_xu_arrive', snapshotState(1, [
    'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip',
    'history:common_weekday_outing_decision:com01b_weekday_cafe_first'
  ]), []);
  assert.deepEqual(progress.data.frontier, originalCafeFrontier);
  assert.equal(progress.replaying, true);
  assert.equal(progress.data.cursor.stats.met_jiang_yucheng, 1);
  assert.ok(!progress.data.cursor.flags.includes('weekend_book_purchased'));
});

for (const replay of [false, true]) {
  test(`${replay ? 'compatible replay' : 'ordinary main play'} advances from partial cafe to package with its actual state`, () => {
    const progress = new ProgressStore(chapter, memories, new MemoryStorage());
    const state = snapshotState(1, ['weekend_book_purchased',
      'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_go']);
    progress.capture('common_station_cafe_jyc_names_02', state, []);
    if (replay) progress.beginReplay(progress.data.frontier);
    state.F_JYC = 3;
    state.flags.add('contact_jyc');
    progress.capture('common_package_xu_arrive', state, []);
    assert.equal(progress.data.frontierRank, 200);
    assert.deepEqual(progress.data.frontier, progress.data.cursor);
    assert.equal(progress.data.frontier.stats.F_JYC, 3);
    assert.equal(progress.replaying, false);
    state.F_JYC = 4;
    progress.capture('common_package_xu_arrive_02', state, []);
    assert.deepEqual(progress.data.frontier, progress.data.cursor);
    assert.equal(progress.data.frontier.stats.F_JYC, 4);
    const reload = new ProgressStore(chapter, memories, progress.storage);
    assert.deepEqual(reload.data.frontier, progress.data.frontier);
    assert.equal(reload.replaying, false);
  });
}
