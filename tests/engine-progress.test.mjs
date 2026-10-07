import test from 'node:test';
import assert from 'node:assert/strict';
import { compileStoryMap } from '../tools/story-map.mjs';
import { c1Outing } from '../src/branches.js';
import { GameEngine } from '../src/engine.js';
import { readFileSync } from 'node:fs';

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
  focus() { this.focused = true; this.listeners.get('focus')?.(); }
  setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
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
  engine.els.nameInput.value = '[bad]';
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
  reloaded.progress.finishRun();
  reloaded.startFromTitle();
  assert.equal(reloaded.progress.data.playerDisplayName, '小雨', 'explicit restart retains the saved name');
  assert.equal(reloaded.els.nameDialog.open, false);
});

function namedEngine() {
  const engine = engineFor(chapter({ start: { speaker: '我', text: '我叫[PLAYER_NAME]。' } }));
  engine.bindEvents();
  engine.startFromTitle();
  return engine;
}

function nameEvent(engine, type, details = {}) {
  engine.els.nameInput.listeners.get(type)?.(details);
}

function submitName(engine) {
  engine.els.nameForm.listeners.get('submit')({ preventDefault() {} });
}

test('prefilled default survives autofocus and non-edit keys, then starts and persists without typing', () => {
  const engine = namedEngine();
  assert.equal(engine.els.nameInput.value, '劉樂');
  assert.equal(engine.els.nameInput.focused, true);
  engine.els.nameInput.focus();
  for (const key of ['Tab', 'ArrowLeft', 'Enter', 'Shift']) nameEvent(engine, 'keydown', { key });
  nameEvent(engine, 'keydown', { key: 'a', ctrlKey: true });
  assert.equal(engine.els.nameInput.value, '劉樂');
  assert.equal(engine.progress.data.playerDisplayName, null, 'no save mutation before confirmation');
  submitName(engine);
  engine.revealText();
  assert.equal(engine.els.nameDialog.open, false);
  assert.equal(engine.els.text.textContent, '我叫劉樂。');
  assert.equal(JSON.parse(localStorage.getItem(engine.progress.key)).playerDisplayName, '劉樂');
});

test('first pointer interaction clears once with a cursor and subsequent interactions retain custom text', () => {
  const engine = namedEngine();
  nameEvent(engine, 'pointerdown');
  nameEvent(engine, 'click');
  assert.equal(engine.els.nameInput.value, '');
  assert.equal(engine.els.nameInput.focused, true);
  assert.equal(engine.els.nameInput.selectionStart, 0);
  assert.equal(engine.els.nameInput.selectionEnd, 0);
  engine.els.nameInput.value = '小雨';
  for (const type of ['input', 'pointerdown', 'click', 'compositionstart', 'beforeinput']) nameEvent(engine, type);
  engine.els.nameInput.focus();
  assert.equal(engine.els.nameInput.value, '小雨');
  engine.els.nameCancel.click();
  assert.equal(engine.progress.data.cursor, null);
  engine.startFromTitle();
  assert.equal(engine.els.nameInput.value, '小雨', 'cancel/reopen retains the unsaved draft');
  nameEvent(engine, 'click');
  assert.equal(engine.els.nameInput.value, '小雨');
  submitName(engine);
  assert.equal(engine.progress.data.playerDisplayName, '小雨');
});

test('keyboard, IME, paste and native beforeinput clear default before editing without erasing later input', () => {
  for (const [type, details] of [
    ['keydown', { key: '雨' }], ['keydown', { key: 'Backspace' }], ['keydown', { key: 'Delete' }],
    ['compositionstart', {}], ['beforeinput', { inputType: 'insertText' }],
    ['paste', {}], ['cut', {}], ['drop', {}]
  ]) {
    const engine = namedEngine();
    nameEvent(engine, type, details);
    assert.equal(engine.els.nameInput.value, '', type);
    engine.els.nameInput.value = '樂';
    nameEvent(engine, 'beforeinput', { inputType: 'insertCompositionText' });
    nameEvent(engine, 'input', { isComposing: true });
    nameEvent(engine, 'compositionstart');
    nameEvent(engine, 'click');
    assert.equal(engine.els.nameInput.value, '樂', `${type} preserves ongoing edits`);
    submitName(engine);
    assert.equal(engine.progress.data.playerDisplayName, '樂');
  }
});

test('autofill and native input retire default clearing even when they bypass beforeinput', () => {
  const autofilled = engineFor(chapter({ start: { text: '[PLAYER_NAME]。' } }));
  autofilled.bindEvents();
  autofilled.els.nameInput.value = '開啟前填入';
  autofilled.startFromTitle();
  nameEvent(autofilled, 'click');
  assert.equal(autofilled.els.nameInput.value, '開啟前填入', 'opening also preserves earlier browser autofill');
  for (const signalInput of [false, true]) {
    const engine = namedEngine();
    engine.els.nameInput.value = '自訂名字';
    if (signalInput) nameEvent(engine, 'input');
    for (const type of ['pointerdown', 'click', 'beforeinput', 'compositionstart']) nameEvent(engine, type);
    assert.equal(engine.els.nameInput.value, '自訂名字');
    submitName(engine);
    assert.equal(engine.progress.data.playerDisplayName, '自訂名字');
  }
  const engine = namedEngine();
  nameEvent(engine, 'input');
  nameEvent(engine, 'click');
  assert.equal(engine.els.nameInput.value, '劉樂', 'an input event also preserves a custom value equal to the default');
});

test('cleared and whitespace names quick-start with the default, invalid nonblank remains editable', () => {
  for (const value of ['', ' \t\u3000 ']) {
    const engine = namedEngine();
    nameEvent(engine, 'pointerdown');
    engine.els.nameInput.value = value;
    submitName(engine);
    assert.equal(engine.els.nameDialog.open, false);
    assert.equal(engine.progress.data.playerDisplayName, '劉樂');
  }
  const engine = namedEngine();
  nameEvent(engine, 'pointerdown');
  for (const value of ['[bad]', '雨'.repeat(21), '小\n雨']) {
    engine.els.nameInput.value = value;
    submitName(engine);
    assert.equal(engine.els.nameDialog.open, true);
    assert.equal(engine.progress.data.cursor, null);
    assert.equal(engine.progress.data.playerDisplayName, null);
    assert.ok(engine.els.nameError.textContent);
    nameEvent(engine, 'click');
    assert.equal(engine.els.nameInput.value, value, 'validation focus/click preserves custom input');
  }
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


test('dedicated initial title artwork is limited to zero progress and preserves legacy fallback', () => {
  const story = chapter({ start: { text: 'Start' }, deep: { text: 'Deep' }, finish: { type: 'route' } });
  story.titleArt = 'old'; story.endingArt = 'ending'; story.initialTitleArt = 'initial';
  story.endings = { done: { title: 'Done', art: 'ending' } };
  const assets = { initial: { kind: 'background', src: 'initial.webp', focus: { x: 50, y: 40 } },
    old: { kind: 'cg', src: 'old.webp' }, saved: { kind: 'cg', src: 'saved.webp' }, ending: { kind: 'cg', src: 'ending.webp' } };
  const engine = engineFor(story); engine.assets = assets;
  engine.refreshTitle();
  assert.equal(engine.els.titleArt.src, 'initial.webp');
  assert.equal(engine.els.titleArt.style.objectPosition, '50% 40%');
  assert.equal(engine.els.titleArt.classList.contains('is-initial-title-art'), true);
  delete story.initialTitleArt; engine.refreshTitle(); assert.equal(engine.els.titleArt.src, 'old.webp');
  story.initialTitleArt = 'initial';
  const library = { events: [{ id: 'deep', title: 'Deep', progressRank: 10, replayNode: 'deep', unlockNodes: ['deep'], titleBackdropAsset: 'saved' }] };
  engine.memoryLibrary = engine.progress.memories = library;
  engine.progress.capture('deep', engine.state, []);
  engine.refreshTitle(); assert.equal(engine.els.titleArt.src, 'saved.webp');
  assert.equal(engine.els.titleArt.classList.contains('is-initial-title-art'), false);
  const snapshot = engine.progress.data.cursor;
  engine.progress.data.frontier = null; engine.refreshTitle();
  assert.equal(engine.els.titleArt.src, 'old.webp', 'cursor-only progress keeps legacy title selection');
  engine.progress.data.frontier = snapshot;
  engine.progress.data.restartActive = true; engine.refreshTitle();
  assert.notEqual(engine.els.titleArt.src, 'initial.webp');
  engine.progress.data.restartActive = false; engine.progress.data.runComplete = true;
  engine.progress.data.cursor = { ...snapshot, nodeId: 'finish' };
  engine.resolveEnding = () => 'done'; engine.refreshTitle();
  assert.equal(engine.els.titleArt.src, 'ending.webp');
});

function openingRuntime() {
  const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
  const route = read('content/routes/opening-demo/route.json');
  const nodes = read('content/routes/opening-demo/chapter-01.json').nodes;
  return { chapter: { ...route.story, nodes }, sceneLibrary: {},
    assetManifest: read('content/assets/manifest.json'), memoryLibrary: read('content/routes/opening-demo/memories.json') };
}

function instantEngine(runtime) {
  const engine = new GameEngine(runtime);
  engine.typeText = function (text) {
    this.els.text.textContent = text;
    this.isTyping = false;
    this.awaitingChoiceReveal = !!this.chapter.nodes[this.nodeId].choices;
  };
  return engine;
}

test('Opening early Memory labels ignore later known-name frontier and survive replay reload', () => {
  installBrowserMocks();
  const runtime = openingRuntime();
  let engine = instantEngine(runtime);
  engine.progress.setPlayerName('小雨');
  const knownState = { ...runtime.chapter.initialState, player_knows_xu_name: 1, F_XT: 7,
    flags: new Set(['player_knows_jyc_name', 'world-retained']) };
  engine.progress.capture('common_acg_first_meet_enter', knownState, []);
  engine.progress.capture('common_station_cafe_jyc_names_05', knownState, []);
  const frontier = structuredClone(engine.progress.data.frontier);
  engine.replayMemory({ replayNode: runtime.chapter.startNode });
  while (engine.nodeId !== 'common_movein_rain_move') engine.advance();
  assert.equal(engine.els.speaker.textContent, '女生');
  engine.replayMemory({ replayNode: 'common_acg_first_meet_enter' });
  while (engine.nodeId !== 'common_acg_first_meet_observation_locked_01') engine.advance();
  assert.equal(engine.els.speaker.textContent, '女生');
  assert.ok(engine.state.flags.has('player_knows_jyc_name'));
  const replayCursor = structuredClone(engine.progress.data.cursor);
  engine = instantEngine(runtime);
  engine.resumeGame(engine.progress.data.cursor, { replay: true });
  assert.equal(engine.els.speaker.textContent, '女生');
  assert.deepEqual(engine.progress.data.cursor, replayCursor);
  assert.deepEqual(engine.progress.data.frontier, frontier);
  assert.equal(engine.progress.data.playerDisplayName, '小雨');
});

function completedOpeningSave(runtime, nodeId = 'opening_demo_complete') {
  const stats = { ...runtime.chapter.initialState, F_XT: 7, T_XT: 3, K_XT: 2, xt_advice_tendency: 1,
    mc_tone_observant: 4, mc_tone_practical: 5, mc_tone_humorous: 6 };
  const flags = ['player_knows_xu_freelance_creative_work', 'xu_knows_player_remote_tech_work', 'prior-boundary-history'];
  const snapshot = { nodeId, stats, flags, returnNodes: [] };
  return { version: 2, playerDisplayName: '小雨', cursor: snapshot,
    frontier: { ...snapshot, nodeId: 'common_convenience_xu_exit_08' }, restartActive: false, runComplete: true,
    checkpoints: { [nodeId]: snapshot }, edges: [['common_convenience_xu_exit_08', 'opening_demo_complete']] };
}

test('existing Memory stops before appended contact, preserving ongoing frontier and completion', () => {
  installBrowserMocks();
  const runtime = openingRuntime();
  const engine = instantEngine(runtime);
  engine.progress.setPlayerName('小雨');
  engine.progress.capture('common_convenience_xu_exit_08', { ...runtime.chapter.initialState, F_XT: 7, flags: new Set(['old']) }, []);
  engine.progress.capture('common_package_xu_proof', { ...runtime.chapter.initialState, F_XT: 7, flags: new Set(['old']) }, []);
  const frontier = structuredClone(engine.progress.data.frontier);
  engine.replayMemory({ replayNode: 'common_convenience_xu_exit_08' });
  engine.advance();
  assert.equal(engine.nodeId, 'opening_demo_complete');
  assert.equal(engine.els.title.classList.contains('is-hidden'), false);
  assert.deepEqual(engine.progress.data.frontier, frontier);
  assert.equal(engine.progress.data.runComplete, false);
  assert.equal(engine.state.flags.has('contact_xu'), false);
  const reloaded = instantEngine(runtime);
  assert.equal(reloaded.progress.data.runComplete, false);
  assert.deepEqual(reloaded.progress.data.frontier, frontier);
  reloaded.startFromTitle();
  assert.equal(reloaded.nodeId, 'common_package_xu_proof');
  assert.deepEqual(reloaded.state.flags, new Set(['old']));
});

function walkOpening(engine, choices = {}, stop = () => false) {
  for (let i = 0; i < 1800; i++) {
    if (stop(engine)) return;
    const node = engine.chapter.nodes[engine.nodeId];
    if (node.type === 'route') return;
    if (node.choices) {
      engine.enterChoiceMode(node.choices);
      const wanted = choices[engine.nodeId];
      const index = wanted ? node.choices.findIndex(c => c.id === wanted) : 0;
      assert.ok(index >= 0, `${engine.nodeId}: ${wanted}`);
      engine.els.choices.children[index].click();
    } else engine.advance();
  }
  assert.fail(`Opening traversal stuck at ${engine.nodeId}`);
}

test('modern cafe Memory contact continues through actual evening messages without owning main', () => {
  installBrowserMocks();
  const runtime = openingRuntime();
  const engine = instantEngine(runtime);
  engine.progress.setPlayerName('小雨');
  engine.startGame({ freshRun: true });
  walkOpening(engine, {
    common_bookstore_bridge_weekend_decision: 'com01b_bookstore_skip',
    common_weekday_outing_decision: 'com01b_weekday_cafe_first',
    common_station_cafe_jyc_contact_choice: 'com02j_leave_without_contact'
  });
  const main = structuredClone(engine.progress.data.frontier);
  engine.replayMemory(runtime.memoryLibrary.events.find(e => e.id.includes('first-cafe')));
  walkOpening(engine, { common_station_cafe_jyc_contact_choice: 'com02j_offer_discord' },
    e => e.nodeId === 'common_recommend_discord_jyc_choice');
  assert.equal(engine.nodeId, 'common_recommend_discord_jyc_choice');
  assert.ok(engine.state.flags.has('contact_jyc'));
  assert.ok(engine.progress.data.checkpoints.common_recommend_discord_jyc_enter);
  assert.deepEqual(engine.progress.data.frontier, main);
});

for (const kind of ['known-contact', 'known-no-contact', 'never-met']) for (const accept of [false, true]) {
  test(`actual ${kind} replay ${accept ? 'accepts' : 'declines'} contact, survives reload and restores protected main`, () => {
    installBrowserMocks();
    const runtime = openingRuntime();
    let engine = instantEngine(runtime);
    engine.progress.setPlayerName('小雨');
    engine.startGame({ freshRun: true });
    const life = { 'OPEN-A-ENTRY-ACTION-BOTH': 'OPEN-A-ACT-LIFE', 'OPEN-A-ENTRY-ACTION-X': 'OPEN-A-ACT-LIFE',
      'OPEN-A-LIFE-ACTION': 'OPEN-A-LIFE-SOLO' };
    walkOpening(engine, { ...life,
      ...(kind === 'known-contact' ? { 'OPEN-A-ENTRY-ACTION-BOTH': 'OPEN-A-ACT-X', 'OPEN-A-ENTRY-ACTION-X': 'OPEN-A-ACT-X' } : {}),
      common_bookstore_bridge_weekend_decision: 'com01b_bookstore_skip',
      common_weekday_outing_decision: kind === 'never-met' ? 'com01b_weekday_street_walk' : 'com01b_weekday_cafe_first',
      common_station_cafe_jyc_contact_choice: kind === 'known-contact' ? 'com02j_offer_discord' : 'com02j_leave_without_contact'
    });
    if (kind === 'known-contact') assert.ok(engine.progress.data.frontier.flags.includes('open_a_window1_consumed'));
    const main = structuredClone({ frontier: engine.progress.data.frontier, cursor: engine.progress.data.cursor,
      rank: engine.progress.data.frontierRank, runComplete: engine.progress.data.runComplete,
      restartActive: engine.progress.data.restartActive, checkpoints: engine.progress.data.checkpoints });
    const entry = kind === 'never-met' ? { replayNode: 'common_weekday_outing_work' }
      : runtime.memoryLibrary.events.find(e => e.id.includes('first-cafe'));
    engine.replayMemory(entry);
    walkOpening(engine, { common_weekday_outing_decision: 'com01b_weekday_cafe_first',
      common_station_cafe_jyc_contact_choice: accept ? 'com02j_offer_discord' : 'com02j_leave_without_contact'
    }, e => e.nodeId === 'common_package_xu_arrive');
    assert.equal(engine.state.flags.has('contact_jyc'), accept);
    assert.equal(engine.bookstoreEligible(), false);
    assert.deepEqual(engine.progress.data.frontier, main.frontier);
    assert.equal(engine.progress.data.runComplete, main.runComplete);
    engine = instantEngine(runtime);
    engine.startFromTitle();
    assert.equal(engine.state.flags.has('contact_jyc'), accept);
    assert.ok(engine.progress.data.c1Replay.exploration);
    const visited = [];
    const choices = accept ? { 'OPEN-A-ENTRY-ACTION-BOTH': 'OPEN-A-ACT-J', 'OPEN-A-ENTRY-ACTION-J': 'OPEN-A-ACT-J' } : life;
    // Continue to the actual route terminal, which returns to the original main.
    for (let i = 0; i < 1200 && engine.progress.data.c1Replay; i++) {
      visited.push(engine.nodeId);
      walkOpening(engine, choices, e => e.nodeId !== visited.at(-1) || !e.progress.data.c1Replay);
    }
    assert.equal(engine.progress.data.c1Replay, null);
    assert.equal(visited.includes('common_recommend_discord_jyc_choice'), accept);
    assert.equal(visited.includes('JYC-05-ENTRY'), accept);
    if (!accept) {
      assert.ok(visited.includes('COM03M-S01'));
      assert.ok(engine.progress.data.edges.some(([from, to]) => from === 'com03x_preview_complete'
        && to === 'common_recommend_discord_jyc_no_contact_exit'));
    }
    assert.deepEqual(engine.progress.data.frontier, main.frontier);
    assert.deepEqual(engine.progress.data.cursor, main.cursor);
    assert.equal(engine.progress.data.frontierRank, main.rank);
    assert.equal(engine.progress.data.runComplete, main.runComplete);
    assert.equal(engine.progress.data.restartActive, main.restartActive);
    for (const [id, snapshot] of Object.entries(main.checkpoints)) assert.deepEqual(engine.progress.data.checkpoints[id], snapshot);
    assert.equal(!!engine.progress.data.checkpoints['JYC-05-ENTRY'], accept);
    const reloaded = instantEngine(runtime);
    assert.deepEqual(reloaded.progress.data.frontier, main.frontier);
    assert.deepEqual(reloaded.progress.data.cursor, main.cursor);
  });
}


test('actual bookstore Map replay wrapper continues to earned contact and messages with protected main', () => {
  installBrowserMocks();
  const runtime = openingRuntime();
  let engine = instantEngine(runtime);
  engine.progress.setPlayerName('小雨');
  engine.startGame({ freshRun: true });
  const choices = { common_bookstore_bridge_weekend_decision: 'com01b_bookstore_go',
    common_weekday_outing_decision: 'com01b_weekday_cafe_first',
    common_station_cafe_jyc_contact_choice: 'com02j_leave_without_contact',
    'OPEN-A-ENTRY-ACTION-X': 'OPEN-A-ACT-LIFE', 'OPEN-A-LIFE-ACTION': 'OPEN-A-LIFE-SOLO' };
  walkOpening(engine, choices);
  const main = structuredClone(engine.progress.data.frontier);
  assert.ok(engine.progress.data.checkpoints.com01b_bookstore_go);
  engine.replayMemory({ replayNode: 'com01b_bookstore_go' });
  assert.ok(engine.progress.data.c1Replay.exploration);
  walkOpening(engine, { ...choices, common_station_cafe_jyc_contact_choice: 'com02j_offer_discord' },
    e => e.nodeId === 'common_recommend_discord_jyc_choice');
  assert.equal(engine.nodeId, 'common_recommend_discord_jyc_choice');
  assert.ok(engine.state.flags.has('contact_jyc'));
  assert.deepEqual(engine.progress.data.frontier, main);
  assert.ok(engine.progress.data.checkpoints.common_recommend_discord_jyc_enter);
  engine = instantEngine(runtime);
  engine.startFromTitle();
  assert.equal(engine.nodeId, 'common_recommend_discord_jyc_choice');
  walkOpening(engine, { 'OPEN-A-ENTRY-ACTION-BOTH': 'OPEN-A-ACT-J' }, e => e.nodeId === 'JYC-05-ENTRY');
  assert.equal(engine.nodeId, 'JYC-05-ENTRY');
  assert.deepEqual(engine.progress.data.frontier, main);
  engine.progress.endReplay();
  assert.deepEqual(engine.progress.data.frontier, main);
});


for (const path of ['bookstore', 'cafe-only', 'street']) test(`actual ${path} Map entries use current protected replay metadata, preserving direct C1`, () => {
  installBrowserMocks();
  const runtime = openingRuntime();
  let engine = instantEngine(runtime);
  engine.progress.setPlayerName('小雨');
  engine.startGame({ freshRun: true });
  walkOpening(engine, {
    common_bookstore_bridge_weekend_decision: path === 'bookstore' ? 'com01b_bookstore_go' : 'com01b_bookstore_skip',
    common_weekday_outing_decision: path === 'street' ? 'com01b_weekday_street_walk' : 'com01b_weekday_cafe_first',
    common_station_cafe_jyc_contact_choice: 'com02j_leave_without_contact',
    'OPEN-A-ENTRY-ACTION-X': path === 'bookstore' ? 'OPEN-A-ACT-X' : 'OPEN-A-ACT-LIFE',
    'OPEN-A-LIFE-ACTION': 'OPEN-A-LIFE-SOLO'
  });
  const main = structuredClone(engine.progress.data.frontier);
  const definition = JSON.parse(readFileSync(new URL('../content/storyboards/opening-demo.json', import.meta.url)));
  const map = compileStoryMap(runtime, definition);
  let entries = 0;
  for (const variant of map.groups.flatMap(g => g.variants)) {
    if (!engine.progress.data.checkpoints[variant.entry]) continue;
    engine = instantEngine(runtime);
    engine.replayMemory({ replayNode: variant.entry });
    assert.ok(engine.progress.data.c1Replay, `protected ${variant.entry}`);
    const preservedC1 = c1Outing(variant.entry)
      || (engine.progress.openingContinuationRank(variant.entry) >= 0 && c1Outing(main.nodeId));
    assert.equal(!!engine.progress.data.c1Replay.exploration, !preservedC1, variant.entry);
    assert.deepEqual(engine.progress.data.frontier, main);
    engine.progress.endReplay();
    assert.deepEqual(engine.progress.data.frontier, main);
    entries++;
  }
  assert.ok(entries >= 7, 'actual semantic entries are tested, including the start Memory');
});
