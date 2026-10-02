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
  contains(name) { return this.values.has(name); }
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
    if (selector === '.cg-viewer-canvas') return new FakeElement();
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
    addEventListener() {},
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

test('shared scene exit applies base state once and preserves it across Continue', () => {
  const story = chapter({
    start: { next: 'exit' },
    exit: { text: '晚安。', entryEffects: { warmth: 1 }, entryFlags: ['work-known'], next: 'finish' },
    finish: { type: 'route' }
  });
  const engine = engineFor(story);
  engine.nodeId = 'exit';
  engine.render();
  assert.equal(engine.state.warmth, 1);
  assert.equal(engine.progress.data.cursor.stats.warmth, 1);
  engine.resumeGame(engine.progress.data.cursor);
  assert.equal(engine.state.warmth, 1);
  assert.ok(engine.state.flags.has('work-known'));
});

test('title navigation after Memory replay preserves frontier and distinguishes Continue from a completed Start', () => {
  for (const completed of [false, true]) {
    const story = chapter({
      start: { text: 'Opening', next: 'replay' },
      replay: { text: 'Memory', next: 'alternate' },
      alternate: { text: 'Replay choice', next: 'deep' },
      deep: { text: 'Current story', next: 'finish' },
      finish: { type: 'route' }
    });
    const memoryLibrary = { events: [
      { id: 'opening', replayNode: 'start', unlockNodes: ['start'], progressRank: 0 },
      { id: 'deep', replayNode: 'replay', unlockNodes: ['replay', 'alternate', 'deep'], progressRank: 160 }
    ] };
    const engine = engineFor(story);
    engine.memoryLibrary = engine.progress.memories = memoryLibrary;
    engine.progress.capture('replay', { warmth: 1, trust: 0, flags: new Set(['earlier']) }, []);
    engine.progress.capture('deep', { warmth: 8, trust: 4, flags: new Set(['known']) }, []);
    const frontier = structuredClone(engine.progress.data.frontier);
    if (completed) {
      engine.progress.capture('finish', engine.progress.restore(frontier).state, []);
      engine.progress.finishRun();
    }
    engine.replayMemory({ replayNode: 'replay' });
    engine.state.warmth = 2;
    engine.nodeId = 'alternate';
    engine.render();
    assert.equal(engine.progress.data.cursor.nodeId, 'alternate');
    assert.deepEqual(engine.progress.data.frontier, frontier);

    const reloaded = new GameEngine({ chapter: story, assetManifest: { assets: {} }, sceneLibrary: {}, memoryLibrary });
    reloaded.refreshTitle();
    assert.equal(reloaded.els.startButton.textContent, completed ? '開始遊戲' : '繼續遊戲');
    assert.equal(reloaded.progress.data.cursor.nodeId, 'alternate', 'reload preserves the replay cursor before title entry');
    reloaded.bindEvents();
    reloaded.els.startButton.click();
    assert.equal(reloaded.nodeId, completed ? 'start' : 'deep');
    assert.equal(reloaded.state.warmth, completed ? 0 : 8);
    assert.deepEqual(reloaded.state.flags, new Set(completed ? [] : ['known']));
    assert.deepEqual(reloaded.progress.data.frontier, frontier);
    assert.equal(reloaded.progress.data.restartActive, completed);
    assert.equal(reloaded.progress.data.runComplete, false);

    if (completed) {
      reloaded.nodeId = 'replay';
      reloaded.render();
      const continued = new GameEngine({ chapter: story, assetManifest: { assets: {} }, sceneLibrary: {}, memoryLibrary });
      continued.refreshTitle();
      assert.equal(continued.els.startButton.textContent, '繼續遊戲');
      continued.startFromTitle();
      assert.equal(continued.nodeId, 'replay', 'an explicit fresh run resumes its own cursor after reload');
      assert.deepEqual(continued.progress.data.frontier, frontier);
    }
  }
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

    const checkpoint = engine.progress.data.cursor;
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


test('pure choice nodes render choices without an empty dialogue panel', () => {
  const story = chapter({
    start: {
      choices: [{ text: '回答她', next: 'after' }]
    },
    after: { text: '繼續', next: 'finish' },
    finish: { type: 'route' }
  });
  const engine = engineFor(story);
  engine.nodeId = 'start';
  engine.render();

  assert.equal(engine.els.dialoguePanel.classList.values.has('is-hidden'), true);
  assert.equal(engine.els.choices.classList.values.has('is-hidden'), false);
  assert.equal(engine.els.choices.children.length, 1);
  assert.equal(engine.els.speaker.textContent, '');
  assert.equal(engine.els.stage.dataset.presentation, 'choice');
});

test('captioned choice nodes finish the caption before switching to exclusive choice mode', () => {
  const story = chapter({
    start: {
      speaker: '旁白',
      text: '她停下來，看著我。',
      choices: [{ text: '開口', next: 'after' }]
    },
    after: { text: '繼續', next: 'finish' },
    finish: { type: 'route' }
  });
  const engine = engineFor(story);
  engine.nodeId = 'start';
  engine.render();
  engine.revealText();

  assert.equal(engine.awaitingChoiceReveal, true);
  assert.equal(engine.els.dialoguePanel.classList.values.has('is-hidden'), false);
  assert.equal(engine.els.choices.classList.values.has('is-hidden'), true);
  assert.equal(engine.els.stage.dataset.presentation, 'narration');

  engine.advance();

  assert.equal(engine.awaitingChoiceReveal, false);
  assert.equal(engine.els.dialoguePanel.classList.values.has('is-hidden'), true);
  assert.equal(engine.els.choices.classList.values.has('is-hidden'), false);
  assert.equal(engine.els.stage.dataset.presentation, 'choice');
});


test('Start name form gates entry and the saved name survives Continue and Memory replay', () => {
  const story = chapter({
    start: { speaker: '我', text: '我叫[PLAYER_NAME]。', next: 'continueLine' },
    continueLine: { speaker: '你', text: '[PLAYER_NAME]又想起這件事。', next: 'narration' },
    narration: { speaker: '旁白', text: '[PLAYER_NAME]站在門口。', next: 'thought' },
    thought: { speaker: '內心', text: '我還有話沒說。', presentation: 'thought', next: 'end' },
    end: { type: 'route' }
  });
  const engine = engineFor(story);
  const memoryLibrary = { events: [{ id: 'opening', replayNode: 'start', unlockNodes: ['start'], progressRank: 0 }, { id: 'later', replayNode: 'narration', unlockNodes: ['narration'], progressRank: 1 }] };
  engine.progress.memories = memoryLibrary;
  engine.bindEvents();
  engine.els.startButton.click();
  assert.equal(engine.els.nameDialog.open, true);
  assert.equal(engine.progress.data.cursor, null, 'opening is not captured before name entry');
  const submit = engine.els.nameForm.listeners.get('submit');
  engine.els.nameInput.value = '   ';
  submit({ preventDefault() {} });
  assert.equal(engine.els.nameDialog.open, true);
  assert.equal(engine.progress.data.cursor, null);
  engine.els.nameInput.value = '  小雨  ';
  submit({ preventDefault() {} });
  assert.equal(engine.els.nameDialog.open, false);
  assert.equal(engine.els.speaker.textContent, '小雨');
  engine.revealText();
  assert.equal(engine.els.text.textContent, '我叫小雨。');
  engine.advance();
  assert.equal(engine.els.speaker.textContent, '小雨');
  engine.revealText();
  assert.equal(engine.els.text.textContent, '小雨又想起這件事。');
  engine.advance();
  assert.equal(engine.els.stage.dataset.presentation, 'narration');

  const reloaded = new GameEngine({ chapter: story, assetManifest: { assets: {} }, sceneLibrary: {}, memoryLibrary });
  reloaded.startFromTitle();
  reloaded.revealText();
  assert.equal(reloaded.nodeId, 'narration');
  assert.equal(reloaded.els.text.textContent, '小雨站在門口。');
  assert.equal(reloaded.els.stage.dataset.presentation, 'narration');
  assert.equal(reloaded.els.nameDialog.open, false);
  reloaded.replayMemory({ replayNode: 'start' });
  assert.equal(reloaded.els.speaker.textContent, '小雨');
  reloaded.revealText();
  assert.equal(reloaded.els.text.textContent, '我叫小雨。');
  reloaded.advance();
  assert.equal(reloaded.els.speaker.textContent, '小雨');
  reloaded.revealText();
  reloaded.advance();
  assert.equal(reloaded.els.stage.dataset.presentation, 'narration');
  reloaded.revealText();
  reloaded.advance();
  assert.equal(reloaded.els.stage.dataset.presentation, 'thought');
  assert.equal(reloaded.els.dialoguePanel.dataset.mode, 'thought');
  assert.equal(story.nodes.narration.speaker, '旁白');
  assert.equal(story.nodes.thought.speaker, '內心');
  assert.equal(reloaded.progress.data.playerDisplayName, '小雨');
});

test('protagonist name tag falls back safely when a stored name is invalid', () => {
  const story = chapter({ start: { speaker: '你', text: '我有話要說。' } });
  const engine = engineFor(story);
  engine.progress.data.playerDisplayName = '   ';
  engine.render();

  assert.equal(engine.els.speaker.textContent, '你');
  assert.equal(engine.els.speaker.classList.contains('is-protagonist'), true);
});

test('unnamed old save keeps its checkpoint while Continue and replay wait for the name form', () => {
  const story = chapter({ start: { text: '[PLAYER_NAME]。' }, old: { text: '舊進度。' } });
  const engine = engineFor(story);
  engine.progress.capture('old', { warmth: 4, trust: 2, flags: new Set(['known']) }, []);
  engine.bindEvents();
  const before = structuredClone(engine.progress.data);
  engine.startFromTitle();
  assert.equal(engine.els.nameDialog.open, true);
  assert.deepEqual(engine.progress.data, before);
  engine.els.nameCancel.click();
  engine.replayMemory({ replayNode: 'old' });
  assert.equal(engine.els.nameDialog.open, true);
  assert.deepEqual(engine.progress.data, before);
  engine.els.nameInput.value = '阿明';
  engine.els.nameForm.listeners.get('submit')({ preventDefault() {} });
  assert.equal(engine.nodeId, 'old');
  assert.equal(engine.state.warmth, 4);
  assert.deepEqual(engine.state.flags, new Set(['known']));
});


test('missing name at a rendered token clears stale text and cannot silently advance past the line', () => {
  const story = chapter({ start: { text: '我叫[PLAYER_NAME]。', next: 'after' }, after: { text: '下一句。' } });
  const engine = engineFor(story);
  engine.bindEvents();
  engine.els.text.textContent = '上一句。';
  engine.render();
  assert.equal(engine.els.text.textContent, '');
  assert.equal(engine.isTyping, false);
  assert.equal(engine.els.nameDialog.open, true);
  engine.advance();
  assert.equal(engine.nodeId, 'start');
  engine.els.nameCancel.click();
  engine.advance();
  assert.equal(engine.nodeId, 'start');
  assert.equal(engine.progress.data.cursor, null);
});
