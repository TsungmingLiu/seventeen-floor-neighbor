import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/engine.js';

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...names) { names.forEach((name) => this.values.add(name)); }
  remove(...names) { names.forEach((name) => this.values.delete(name)); }
  toggle(name, force) {
    const next = force === undefined ? !this.values.has(name) : force;
    if (next) this.values.add(name); else this.values.delete(name);
    return next;
  }
}

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.children = [];
    this.classList = new FakeClassList();
    this.style = { setProperty() {} };
    this.dataset = {};
    this.listeners = new Map();
    this.textContent = '';
    this.disabled = false;
    this.complete = false;
    this.open = false;
    this.muted = false;
  }

  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  setAttribute() {}
  focus() {}
  pause() {}
  play() { return Promise.resolve(); }
  load() {}
  showModal() { this.open = true; }
  close() { this.open = false; this.listeners.get('close')?.(); }
  querySelectorAll(selector) {
    return selector === 'button' ? this.children.filter((child) => child.tagName === 'button') : this.children;
  }
  querySelector(selector) {
    return this.querySelectorAll(selector)[0];
  }
  click() { this.listeners.get('click')?.({ stopPropagation() {} }); }
}

function installBrowserMocks() {
  globalThis.localStorage = new MemoryStorage();
  const elements = new Map();
  globalThis.document = {
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, new FakeElement());
      return elements.get(selector);
    },
    createElement(tagName) { return new FakeElement(tagName); }
  };
  globalThis.window = {
    matchMedia() { return { matches: false }; }
  };
  return elements;
}

function chapter(nodes, startNode = 'start') {
  return {
    id: `engine-${Math.random().toString(36).slice(2)}`,
    startNode,
    initialState: { warmth: 0, trust: 0 },
    chapterLabels: ['開始'],
    nodes,
    endings: {},
    endingRules: []
  };
}

function engineFor(story, sceneLibrary = {}) {
  installBrowserMocks();
  return new GameEngine({ chapter: story, assetManifest: { assets: {} }, sceneLibrary });
}

test('resuming a choice-entry checkpoint does not apply its effects a second time', () => {
  const story = chapter({
    start: { next: 'choice' },
    choice: {
      text: '選一個回應',
      choices: [{ text: '溫柔一點', next: 'after', effects: { warmth: 2 }, addFlags: ['kind'] }]
    },
    after: { text: '繼續', next: 'finish' },
    finish: { type: 'route' }
  });
  const engine = engineFor(story);
  engine.nodeId = 'choice';
  engine.render();

  const checkpoint = engine.progress.data.checkpoints.choice;
  assert.ok(checkpoint);
  assert.equal(checkpoint.stats.warmth, 0);
  assert.deepEqual(checkpoint.flags, []);

  engine.resumeGame(checkpoint);
  assert.equal(engine.nodeId, 'choice');
  assert.equal(engine.state.warmth, 0);
  assert.deepEqual(engine.state.flags, new Set());
});

test('random entries restore at the selected scene with their return destination intact', () => {
  const story = chapter({
    start: { next: 'random' },
    random: { type: 'random', pool: 'pool', after: 'after' },
    entry: { text: '隨機片段', next: 'return' },
    return: { type: 'return' },
    after: { text: '回到主線', next: 'finish' },
    finish: { type: 'route' }
  });
  const originalRandom = Math.random;
  let randomCalls = 0;
  Math.random = () => { randomCalls += 1; return 0; };
  try {
    const engine = engineFor(story, { pools: { pool: { entries: [{ entryNode: 'entry', unlockFlag: 'seen-entry' }] } } });
    engine.nodeId = 'random';
    engine.render();
    assert.equal(engine.nodeId, 'entry');
    assert.deepEqual(engine.returnNodes, ['after']);
    assert.ok(engine.state.flags.has('seen-entry'));
    assert.equal(randomCalls, 1);

    const checkpoint = engine.progress.data.current;
    engine.resumeGame(checkpoint);
    assert.equal(engine.nodeId, 'entry');
    assert.deepEqual(engine.returnNodes, ['after']);
    assert.ok(engine.state.flags.has('seen-entry'));
    assert.equal(randomCalls, 1, 'resume starts at the captured entry instead of rolling random again');

    engine.nodeId = 'return';
    engine.render();
    assert.equal(engine.nodeId, 'after');
    assert.deepEqual(engine.returnNodes, []);
  } finally {
    Math.random = originalRandom;
  }
});
