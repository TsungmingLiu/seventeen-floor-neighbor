import test from 'node:test';
import assert from 'node:assert/strict';
import { ProgressStore } from '../src/progress.js';

class MemoryStorage {
  constructor(entries = {}) {
    this.values = new Map(Object.entries(entries));
  }

  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

const chapter = {
  id: 'progress-fixture',
  initialState: { warmth: 0, trust: 0 },
  nodes: {
    start: {},
    branchA: {},
    branchB: {},
    returnPoint: {}
  }
};

function state(overrides = {}) {
  return { warmth: 0, trust: 0, flags: new Set(), ...overrides };
}

test('capture serializes node-entry state and restore returns isolated copies', () => {
  const storage = new MemoryStorage();
  const store = new ProgressStore(chapter, storage);
  const mutableState = state({ warmth: 3, flags: new Set(['met-lin']) });
  const returnNodes = ['returnPoint'];

  store.capture('branchA', mutableState, returnNodes);
  mutableState.warmth = 99;
  mutableState.flags.add('mutated-after-capture');
  returnNodes.push('start');

  const restored = store.restore(store.data.checkpoints.branchA);
  assert.deepEqual(restored.state, {
    warmth: 3,
    trust: 0,
    flags: new Set(['met-lin'])
  });
  assert.deepEqual(restored.returnNodes, ['returnPoint']);

  restored.state.warmth = 7;
  restored.state.flags.add('only-in-restored-copy');
  restored.returnNodes.push('branchB');
  const restoredAgain = store.restore(store.data.checkpoints.branchA);
  assert.equal(restoredAgain.state.warmth, 3);
  assert.deepEqual(restoredAgain.state.flags, new Set(['met-lin']));
  assert.deepEqual(restoredAgain.returnNodes, ['returnPoint']);

  const persisted = JSON.parse(storage.getItem(store.key));
  assert.equal(persisted.current.nodeId, 'branchA');
  assert.deepEqual(persisted.current.stats, { warmth: 3, trust: 0 });
  assert.deepEqual(persisted.current.flags, ['met-lin']);
});

test('snapshots from different branches retain independent stat and return-stack state', () => {
  const store = new ProgressStore(chapter, new MemoryStorage());

  store.capture('branchA', state({ warmth: 1 }), ['returnPoint']);
  store.capture('branchB', state({ warmth: 8, trust: 2 }), []);

  assert.equal(store.restore(store.data.checkpoints.branchA).state.warmth, 1);
  assert.deepEqual(store.restore(store.data.checkpoints.branchA).returnNodes, ['returnPoint']);
  assert.deepEqual(store.restore(store.data.checkpoints.branchB).state, {
    warmth: 8,
    trust: 2,
    flags: new Set()
  });
  assert.deepEqual(store.restore(store.data.checkpoints.branchB).returnNodes, []);
});

test('constructor discards malformed snapshots and edges pointing to deleted nodes', () => {
  const storage = new MemoryStorage({
    'progress-fixture:journey:v1': JSON.stringify({
      version: 1,
      current: { nodeId: 'deleted', stats: { warmth: 4, trust: 0 }, flags: [], returnNodes: [] },
      checkpoints: {
        start: { nodeId: 'start', stats: { warmth: 1, trust: 0 }, flags: [], returnNodes: [] },
        deleted: { nodeId: 'deleted', stats: { warmth: 2, trust: 0 }, flags: [], returnNodes: [] },
        malformed: { nodeId: 'branchA', stats: { warmth: 'not-a-number', trust: 0 }, flags: [], returnNodes: [] },
        badFlags: { nodeId: 'branchB', stats: { warmth: 2, trust: 0 }, flags: ['ok', 7], returnNodes: [] },
        badReturn: { nodeId: 'returnPoint', stats: { warmth: 2, trust: 0 }, flags: [], returnNodes: ['deleted'] }
      },
      edges: [['start', 'branchA'], ['deleted', 'start'], ['start', 'deleted'], ['start'], ['start', 'missing']]
    })
  });

  const store = new ProgressStore(chapter, storage);
  assert.equal(store.data.current, null);
  assert.deepEqual(Object.keys(store.data.checkpoints), ['start']);
  assert.deepEqual(store.data.edges, [['start', 'branchA']]);
});

test('connect deduplicates edges and flush marks storage failures without throwing', () => {
  const store = new ProgressStore(chapter, new MemoryStorage());
  store.connect('start', 'branchA');
  store.connect('start', 'branchA');
  store.connect('start', 'start');
  store.connect('', 'branchB');
  assert.deepEqual(store.data.edges, [['start', 'branchA']]);

  const failingStorage = {
    getItem() { return null; },
    setItem() { throw new Error('quota exceeded'); }
  };
  const failingStore = new ProgressStore(chapter, failingStorage);
  assert.doesNotThrow(() => failingStore.capture('start', state(), []));
  assert.equal(failingStore.persisted, false);
});
