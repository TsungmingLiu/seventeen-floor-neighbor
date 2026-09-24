import test from 'node:test';
import assert from 'node:assert/strict';
import { ProgressStore } from '../src/progress.js';

class MemoryStorage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

const chapter = {
  id: 'progress-fixture',
  initialState: { warmth: 0, trust: 0 },
  nodes: {
    start: {},
    shallow: {},
    branchA: {},
    branchB: {},
    deep: {},
    returnPoint: {}
  }
};

const memories = {
  events: [
    { id: 'mem.start', order: 10, progressRank: 0, replayNode: 'start', unlockNodes: ['start'] },
    { id: 'mem.shallow', order: 20, progressRank: 100, replayNode: 'shallow', unlockNodes: ['shallow'] },
    { id: 'mem.branchA', order: 30, progressRank: 150, replayNode: 'branchA', unlockNodes: ['branchA'] },
    { id: 'mem.branchB', order: 40, progressRank: 150, replayNode: 'branchB', unlockNodes: ['branchB'] },
    { id: 'mem.deep', order: 50, progressRank: 300, replayNode: 'deep', unlockNodes: ['deep'] }
  ]
};

function state(overrides = {}) {
  return { warmth: 0, trust: 0, flags: new Set(), ...overrides };
}

function snap(nodeId, warmth = 0) {
  return { nodeId, stats: { warmth, trust: 0 }, flags: [], returnNodes: [] };
}

test('capture isolates snapshots while cursor and frontier advance independently', () => {
  const storage = new MemoryStorage();
  const store = new ProgressStore(chapter, memories, storage);
  const mutableState = state({ warmth: 3, flags: new Set(['met']) });
  const returnNodes = ['returnPoint'];

  store.capture('shallow', mutableState, returnNodes);
  mutableState.warmth = 99;
  mutableState.flags.add('mutated');
  returnNodes.push('start');

  assert.equal(store.data.cursor.nodeId, 'shallow');
  assert.equal(store.data.frontier.nodeId, 'shallow');
  assert.equal(store.data.frontierMemoryEventId, 'mem.shallow');
  assert.equal(store.data.frontierRank, 100);

  const restored = store.restore(store.data.checkpoints.shallow);
  assert.deepEqual(restored.state, { warmth: 3, trust: 0, flags: new Set(['met']) });
  assert.deepEqual(restored.returnNodes, ['returnPoint']);

  const persisted = JSON.parse(storage.getItem(store.key));
  assert.equal(persisted.version, 2);
  assert.equal(persisted.cursor.nodeId, 'shallow');
  assert.equal(persisted.frontier.nodeId, 'shallow');
});

test('replaying older content changes cursor without regressing frontier', () => {
  const store = new ProgressStore(chapter, memories, new MemoryStorage());
  store.capture('start', state(), []);
  store.capture('deep', state({ warmth: 8 }), []);
  const oldStart = store.data.checkpoints.start;

  store.setCursor(oldStart);
  store.capture('start', state(), []);

  assert.equal(store.data.cursor.nodeId, 'start');
  assert.equal(store.data.frontier.nodeId, 'deep');
  assert.equal(store.data.frontierMemoryEventId, 'mem.deep');
  assert.equal(store.data.frontierRank, 300);
});

test('same-rank alternate memories do not replace the established frontier', () => {
  const store = new ProgressStore(chapter, memories, new MemoryStorage());
  store.capture('branchA', state({ warmth: 1 }), []);
  store.capture('branchB', state({ warmth: 2 }), []);

  assert.equal(store.data.cursor.nodeId, 'branchB');
  assert.equal(store.data.frontier.nodeId, 'branchA');
  assert.equal(store.data.frontierMemoryEventId, 'mem.branchA');
});

test('v1 save migration keeps current as cursor but chooses deepest checkpoint as frontier', () => {
  const storage = new MemoryStorage({
    'progress-fixture:journey:v1': JSON.stringify({
      version: 1,
      current: snap('shallow', 2),
      checkpoints: {
        start: snap('start'),
        shallow: snap('shallow', 2),
        deep: snap('deep', 9)
      },
      edges: [['start', 'shallow'], ['shallow', 'deep']]
    })
  });

  const store = new ProgressStore(chapter, memories, storage);
  assert.equal(store.data.cursor.nodeId, 'shallow');
  assert.equal(store.data.frontier.nodeId, 'deep');
  assert.equal(store.data.frontierMemoryEventId, 'mem.deep');
  assert.equal(store.data.frontierRank, 300);
  assert.equal(JSON.parse(storage.getItem('progress-fixture:journey:v2')).version, 2);
});

test('constructor discards malformed snapshots and deleted-node edges', () => {
  const storage = new MemoryStorage({
    'progress-fixture:journey:v2': JSON.stringify({
      version: 2,
      cursor: { nodeId: 'deleted', stats: { warmth: 4, trust: 0 }, flags: [], returnNodes: [] },
      frontier: snap('deep', 8),
      frontierMemoryEventId: 'mem.deep',
      frontierRank: 300,
      checkpoints: {
        start: snap('start'),
        deleted: { nodeId: 'deleted', stats: { warmth: 2, trust: 0 }, flags: [], returnNodes: [] },
        malformed: { nodeId: 'branchA', stats: { warmth: 'bad', trust: 0 }, flags: [], returnNodes: [] },
        badFlags: { nodeId: 'branchB', stats: { warmth: 2, trust: 0 }, flags: ['ok', 7], returnNodes: [] },
        badReturn: { nodeId: 'returnPoint', stats: { warmth: 2, trust: 0 }, flags: [], returnNodes: ['deleted'] },
        deep: snap('deep', 8)
      },
      edges: [['start', 'shallow'], ['deleted', 'start'], ['start', 'deleted'], ['start'], ['start', 'missing']]
    })
  });

  const store = new ProgressStore(chapter, memories, storage);
  assert.equal(store.data.cursor, null);
  assert.deepEqual(Object.keys(store.data.checkpoints).sort(), ['deep', 'start']);
  assert.deepEqual(store.data.edges, [['start', 'shallow']]);
  assert.equal(store.data.frontier.nodeId, 'deep');
});

test('connect deduplicates edges and storage failures remain non-blocking', () => {
  const store = new ProgressStore(chapter, memories, new MemoryStorage());
  store.connect('start', 'shallow');
  store.connect('start', 'shallow');
  store.connect('start', 'start');
  store.connect('', 'branchA');
  assert.deepEqual(store.data.edges, [['start', 'shallow']]);

  const failingStorage = {
    getItem() { return null; },
    setItem() { throw new Error('quota exceeded'); }
  };
  const failingStore = new ProgressStore(chapter, memories, failingStorage);
  assert.doesNotThrow(() => failingStore.capture('start', state(), []));
  assert.equal(failingStore.persisted, false);
});
