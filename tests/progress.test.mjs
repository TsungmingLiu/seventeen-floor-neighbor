import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

test('an explicit fresh run resets current frontier while retaining collectible checkpoints', () => {
  const terminalChapter = structuredClone(chapter);
  terminalChapter.nodes.deep.type = 'route';
  const storage = new MemoryStorage();
  const store = new ProgressStore(terminalChapter, memories, storage);
  store.capture('deep', state({ warmth: 8 }), []);
  store.finishRun();
  assert.equal(store.data.runComplete, true);
  store.beginFreshRun();
  store.capture('start', state(), []);

  const reloaded = new ProgressStore(terminalChapter, memories, storage);
  assert.equal(reloaded.data.restartActive, true);
  assert.equal(reloaded.data.runComplete, false);
  assert.equal(reloaded.replaying, false);
  assert.equal(reloaded.data.cursor.nodeId, 'start');
  assert.equal(reloaded.data.frontier.nodeId, 'start');

  assert.equal(reloaded.data.checkpoints.deep.nodeId, 'deep');
  assert.deepEqual(reloaded.data.earnedProgress, []);
  reloaded.beginReplay(reloaded.data.checkpoints.start);
  assert.equal(reloaded.data.restartActive, false);
  assert.equal(reloaded.data.frontier.nodeId, 'start');
});

test('older v2 saves with a terminal cursor are recognized as completed', () => {
  const terminalChapter = structuredClone(chapter);
  terminalChapter.nodes.deep.type = 'route';
  const storage = new MemoryStorage({
    'progress-fixture:journey:v2': JSON.stringify({
      version: 2,
      cursor: snap('deep', 8),
      frontier: snap('shallow', 2),
      checkpoints: { deep: snap('deep', 8), shallow: snap('shallow', 2) },
      edges: []
    })
  });

  const store = new ProgressStore(terminalChapter, memories, storage);
  assert.equal(store.data.runComplete, true);
  assert.equal(store.data.frontier.nodeId, 'shallow');
});

test('replaying an earlier node in the frontier event does not rewind Continue', () => {
  const event = memories.events.find((candidate) => candidate.id === 'mem.shallow');
  event.unlockNodes.push('returnPoint');

  try {
    const store = new ProgressStore(chapter, memories, new MemoryStorage());
    store.capture('shallow', state({ warmth: 1 }), []);
    store.capture('returnPoint', state({ warmth: 4 }), []);
    const frontier = store.data.frontier;

    store.setCursor(store.data.checkpoints.shallow);
    store.capture('shallow', state({ warmth: 1 }), []);

    assert.equal(store.data.cursor.nodeId, 'shallow');
    assert.deepEqual(store.data.frontier, frontier);
  } finally {
    event.unlockNodes.pop();
  }
});

test('normal play continues updating the frontier within one Memory Event', () => {
  const event = memories.events.find((candidate) => candidate.id === 'mem.shallow');
  event.unlockNodes.push('returnPoint');

  try {
    const store = new ProgressStore(chapter, memories, new MemoryStorage());
    store.capture('shallow', state({ warmth: 1 }), []);
    store.capture('returnPoint', state({ warmth: 4 }), []);

    assert.equal(store.data.frontier.nodeId, 'returnPoint');
    assert.equal(store.data.frontierMemoryEventId, 'mem.shallow');
  } finally {
    event.unlockNodes.pop();
  }
});

test('a replay that reaches a higher-ranked event advances the frontier', () => {
  const store = new ProgressStore(chapter, memories, new MemoryStorage());
  store.capture('shallow', state({ warmth: 1 }), []);
  const replay = store.data.checkpoints.shallow;

  store.setCursor(replay);
  store.capture('deep', state({ warmth: 9 }), []);

  assert.equal(store.data.cursor.nodeId, 'deep');
  assert.equal(store.data.frontier.nodeId, 'deep');
  assert.equal(store.data.frontierMemoryEventId, 'mem.deep');
  assert.equal(store.data.frontierRank, 300);
});

test('an invalid saved frontier falls back to the deepest valid mapped checkpoint', () => {
  const storage = new MemoryStorage({
    'progress-fixture:journey:v2': JSON.stringify({
      version: 2,
      cursor: snap('shallow', 2),
      frontier: { nodeId: 'deleted', stats: { warmth: 7, trust: 0 }, flags: [], returnNodes: [] },
      frontierMemoryEventId: 'missing',
      frontierRank: 999,
      checkpoints: {
        start: snap('start'),
        shallow: snap('shallow', 2),
        deep: snap('deep', 8)
      },
      edges: []
    })
  });

  const store = new ProgressStore(chapter, memories, storage);
  assert.equal(store.data.cursor.nodeId, 'shallow');
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

test('v1 migration prefers current when checkpoints share the deepest Memory rank', () => {
  const event = memories.events.find((candidate) => candidate.id === 'mem.deep');
  event.unlockNodes.push('returnPoint');
  const storage = new MemoryStorage({
    'progress-fixture:journey:v1': JSON.stringify({
      version: 1,
      current: snap('returnPoint', 9),
      checkpoints: {
        deep: snap('deep', 8),
        returnPoint: snap('returnPoint', 9)
      },
      edges: [['deep', 'returnPoint']]
    })
  });

  try {
    const store = new ProgressStore(chapter, memories, storage);
    assert.equal(store.data.frontier.nodeId, 'returnPoint');
    assert.equal(store.data.frontierMemoryEventId, 'mem.deep');
  } finally {
    event.unlockNodes.pop();
  }
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


test('genuine pre-COM02X v2 shape normalizes only approved additive stats and retains frontier/checkpoints', () => {
  const route = JSON.parse(fs.readFileSync(new URL('../content/routes/opening-demo/route.json', import.meta.url)));
  const source = JSON.parse(fs.readFileSync(new URL('../content/routes/opening-demo/chapter-01.json', import.meta.url)));
  const current = { ...route.story, nodes: source.nodes };
  const original = structuredClone(current);
  for (const key of ['T_XT', 'K_XT', 'xt_advice_tendency']) delete original.initialState[key];
  const storage = new MemoryStorage();
  const oldStore = new ProgressStore(original, storage);
  oldStore.capture('common_elevator_restart_greeting', { ...original.initialState, F_XT: 2, flags: new Set(['test-flag']) }, []);
  const migrated = new ProgressStore(current, storage);
  assert.equal(migrated.data.cursor.nodeId, 'common_elevator_restart_greeting');
  assert.equal(migrated.data.frontier.nodeId, 'common_elevator_restart_greeting');
  assert.equal(Object.keys(migrated.data.checkpoints).length, 1);
  assert.equal(migrated.data.cursor.stats.F_XT, 2);
  assert.deepEqual(migrated.data.cursor.flags, ['test-flag']);
  for (const key of ['T_XT', 'K_XT', 'xt_advice_tendency']) assert.equal(migrated.data.cursor.stats[key], current.initialState[key]);

  const malformed = structuredClone(oldStore.data.cursor);
  malformed.stats.T_XT = null;
  assert.equal(migrated.clone(malformed), null, 'present invalid new stat is rejected');
  malformed.stats.T_XT = Infinity;
  assert.equal(migrated.clone(malformed), null);
  delete malformed.stats.T_XT;
  delete malformed.stats.F_XT;
  assert.equal(migrated.clone(malformed), null, 'missing historical stat is rejected');
  const otherChapter = { ...current, id: 'unrelated-chapter' };
  assert.equal(new ProgressStore(otherChapter, new MemoryStorage()).clone(oldStore.data.cursor), null);
});

test('saved player name is validated independently without discarding valid old progress', () => {
  const storage = new MemoryStorage();
  const store = new ProgressStore(chapter, memories, storage);
  store.capture('deep', state({ warmth: 8 }), []);
  assert.equal(store.setPlayerName('  小雨  '), true);
  assert.equal(new ProgressStore(chapter, memories, storage).data.playerDisplayName, '小雨');
  assert.equal(store.setPlayerName('[PLAYER_NAME]'), false);
  const saved = JSON.parse(storage.getItem(store.key));
  saved.playerDisplayName = '[bad]';
  storage.setItem(store.key, JSON.stringify(saved));
  const reloaded = new ProgressStore(chapter, memories, storage);
  assert.equal(reloaded.data.playerDisplayName, null);
  assert.equal(reloaded.data.cursor.nodeId, 'deep');
});

test('only a valid historical Opening terminal continuation reopens completion and retains the exact snapshot', () => {
  const base = { ...structuredClone(chapter), id: 'opening-demo-chapter-01' };
  base.nodes.opening_demo_complete = { type: 'branch', default: 'deep' };
  base.nodes.current_complete = { type: 'route' };
  base.nodes.common_convenience_xu_exit_08 = {};
  const library = structuredClone(memories);
  library.events.find(event => event.id === 'mem.deep').unlockNodes.push('opening_demo_complete', 'common_convenience_xu_exit_08', 'current_complete');
  const snapshot = { ...snap('opening_demo_complete', 8), flags: ['known'], returnNodes: ['returnPoint'] };
  const saved = { version: 2, playerDisplayName: '小雨', runComplete: true, cursor: snapshot, frontier: snap('common_convenience_xu_exit_08', 2),
    checkpoints: { opening_demo_complete: snapshot, shallow: snap('shallow', 2) }, edges: [['shallow', 'opening_demo_complete']] };
  const storageFor = value => new MemoryStorage({ [`${base.id}:journey:v2`]: JSON.stringify(value) });
  const store = new ProgressStore(base, library, storageFor(saved));
  assert.equal(store.data.runComplete, false);
  assert.deepEqual(store.data.cursor, snapshot);
  assert.deepEqual(store.data.frontier, snapshot);
  assert.deepEqual(store.data.checkpoints, saved.checkpoints);
  assert.deepEqual(store.data.edges, saved.edges);
  assert.equal(store.data.playerDisplayName, '小雨');
  assert.equal(store.data.version, 2);

  for (const kind of ['missing-target', 'still-terminal', 'deleted-cursor', 'ordinary-replay', 'current-terminal', 'completed-world-replay', 'restart']) {
    const story = structuredClone(base);
    const value = structuredClone(saved);
    if (kind === 'missing-target') story.nodes.opening_demo_complete.default = 'deleted';
    if (kind === 'still-terminal') story.nodes.opening_demo_complete = { type: 'route' };
    if (kind === 'deleted-cursor') delete story.nodes.opening_demo_complete;
    if (kind === 'ordinary-replay') value.cursor.nodeId = 'shallow';
    if (kind === 'current-terminal') value.cursor.nodeId = 'current_complete';
    if (kind === 'completed-world-replay') value.frontier = snap('current_complete', 99);
    if (kind === 'restart') value.restartActive = true;
    const negative = new ProgressStore(story, library, storageFor(value));
    assert.equal(negative.data.runComplete, true, kind);
    assert.deepEqual(negative.data.frontier, value.frontier, kind);
  }
});

test('earned progress full-save load isolation and conservative markerless migration', () => {
  const story = structuredClone(chapter);
  story.nodes.start.earnedStart = 'met';
  story.nodes.shallow.earnedComplete = 'met';
  story.nodes.deep.earnedComplete = 'specific-repair';
  story.nodes.deep.earnedRequires = ['specific-conflict'];
  const storage = new MemoryStorage();
  let store = new ProgressStore(story, memories, storage);
  const live = state();
  store.performed('start', live);
  store.capture('shallow', live, []);
  store = new ProgressStore(story, memories, storage);
  const restored = store.restore(store.data.cursor);
  store.performed('shallow', restored.state);
  store.capture('shallow', restored.state, []);
  assert.deepEqual(store.data.earnedProgress, ['met']);
  const fullSave = storage.getItem(store.key);
  store.beginFreshRun();
  store.capture('start', state(), []);
  assert.deepEqual(new ProgressStore(story, memories, storage).data.earnedProgress, []);
  storage.setItem(store.key, fullSave); // Existing full-save import restores its own run.
  store = new ProgressStore(story, memories, storage);
  assert.deepEqual(store.data.earnedProgress, ['met']);
  const older = JSON.parse(fullSave);
  delete older.earnedProgress;
  older.bookstoreEverEarned = older.initialEncounterEverEarned = true;
  older.checkpoints.deep = snap('deep', 9, ['contact_jyc', 'late_conflict', 'repair_completed']);
  storage.setItem(store.key, JSON.stringify(older));
  store = new ProgressStore(story, memories, storage);
  assert.deepEqual(store.data.earnedProgress, []);
  assert.deepEqual(new ProgressStore(story, memories, storage).data.earnedProgress, []);
  const fake = state(); fake.flags.add('live-earned:specific-repair');
  store.performed('deep', fake);
  assert.equal(store.hasEarned('specific-repair'), false, 'a named missing conflict independently locks repair');
  store.capture('deep', fake, []);
  assert.equal(store.hasEarned('specific-repair'), false);
});

test('markerless migration scrubs frontier, deepest checkpoint and legacy return proof before continuation', () => {
  const story=structuredClone(chapter);
  story.nodes.start.earnedStart='met';story.nodes.shallow.earnedComplete='met';
  const snapshot=snap('shallow',3);
  snapshot.flags=['live-earned:met','ordinary-local-fact'];
  for (const version of [1,2]) for (const deepest of [false,true]) {
    const storage=new MemoryStorage();
    const saved={version,checkpoints:{shallow:snapshot},
      ...(version===1?{current:deepest?null:snapshot}:{cursor:deepest?null:snapshot,frontier:deepest?null:snapshot})};
    storage.setItem(`${story.id}:journey:v${version}`,JSON.stringify(saved));
    const store=new ProgressStore(story,memories,storage);
    assert.equal(store.data.frontier.nodeId,'shallow');
    for (const entry of [store.data.cursor,store.data.frontier,store.data.checkpoints.shallow].filter(Boolean)) {
      assert.ok(!entry.flags.includes('live-earned:met'));
      assert.ok(entry.flags.includes('ordinary-local-fact'));
    }
    const restored=store.restore(store.data.frontier);
    store.performed('shallow',restored.state);store.capture('shallow',restored.state,[]);
    assert.deepEqual(store.data.earnedProgress,[]);
    assert.deepEqual(new ProgressStore(story,memories,storage).data.earnedProgress,[]);
  }
  const malformed={cursor:{...snapshot,flags:[3,'live-earned:met']}};
  const malformedStore=new ProgressStore(story,memories,new MemoryStorage());
  assert.doesNotThrow(()=>malformedStore.discardUnscopedProof(malformed));
  assert.equal(malformedStore.valid(malformed.cursor),false);
  const returns={c1Replay:{returnCursor:structuredClone(snapshot)},com03jReplay:{returnCursor:structuredClone(snapshot)},
    com02jSupplement:{returnSnapshot:structuredClone(snapshot),entrySnapshot:structuredClone(snapshot)}};
  const store=new ProgressStore(story,memories,new MemoryStorage());
  store.discardUnscopedProof(returns);
  for (const entry of [returns.c1Replay.returnCursor,returns.com03jReplay.returnCursor,
    returns.com02jSupplement.returnSnapshot,returns.com02jSupplement.entrySnapshot]) {
    assert.deepEqual(entry.flags,['ordinary-local-fact']);
  }
});
