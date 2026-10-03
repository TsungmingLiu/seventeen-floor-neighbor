import test from 'node:test';
import assert from 'node:assert/strict';
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

for (const choiceIndex of [0, 1, 2]) {
  test(`Opening name labels follow the exchange on fresh branch ${choiceIndex + 1}`, () => {
    installBrowserMocks();
    const runtime = openingRuntime();
    const engine = instantEngine(runtime);
    engine.progress.setPlayerName('小雨');
    engine.startGame();
    let xuRevealed = false;
    let anonymousXu = 0;
    let anonymousJyc = 0;
    for (let step = 0; step < 150 && engine.nodeId !== 'common_convenience_xu_enter'; step++) {
      const node = runtime.chapter.nodes[engine.nodeId];
      if (engine.nodeId === 'common_movein_rain_names') xuRevealed = true;
      if (node.speaker === '許棠') {
        assert.equal(engine.els.speaker.textContent, xuRevealed ? '許棠' : '女生', engine.nodeId);
        if (!xuRevealed) anonymousXu++;
      }
      if (node.speaker === '江雨澄') {
        assert.equal(engine.els.speaker.textContent, '女生', engine.nodeId);
        anonymousJyc++;
      }
      if (node.choices) {
        engine.enterChoiceMode(node.choices);
        engine.els.choices.children[choiceIndex].click();
      } else engine.advance();
    }
    assert.equal(engine.nodeId, 'common_convenience_xu_enter');
    assert.ok(xuRevealed && anonymousXu > 0 && anonymousJyc > 0);
    assert.equal(engine.state.player_knows_xu_name, 1, 'existing choice effects are preserved');
    assert.equal(engine.progress.data.playerDisplayName, '小雨');
  });
}

test('Opening reload keeps moment labels before and after both name exchanges', () => {
  for (const [nodeId, label] of [
    ['common_movein_rain_move', '女生'],
    ['common_movein_rain_joke_locked_01', '女生'],
    ['common_movein_rain_names', '許棠'],
    ['common_movein_rain_names_locked_01', '許棠'],
    ['common_acg_first_meet_observation_locked_01', '女生'],
    ['common_station_cafe_jyc_drawing_03', '女生'],
    ['common_station_cafe_jyc_names_02', '江雨澄'],
    ['common_station_cafe_jyc_names_05', '江雨澄']
  ]) {
    installBrowserMocks();
    const runtime = openingRuntime();
    let engine = instantEngine(runtime);
    engine.progress.setPlayerName('小雨');
    // Choice-time knowledge and later flags cannot reveal an earlier label.
    const stats = { ...runtime.chapter.initialState, player_knows_xu_name: 1, F_XT: 7 };
    engine.resumeGame({ nodeId, stats, flags: ['player_knows_jyc_name', 'world-retained'], returnNodes: [] });
    const before = structuredClone(engine.progress.data.cursor);
    assert.equal(engine.els.speaker.textContent, label, nodeId);
    engine = instantEngine(runtime);
    engine.startFromTitle();
    assert.equal(engine.els.speaker.textContent, label, nodeId);
    assert.deepEqual(engine.progress.data.cursor, before);
    assert.equal(engine.progress.data.playerDisplayName, '小雨');
  }
});

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

for (const [index, tone] of ['mc_tone_observant', 'mc_tone_practical', 'mc_tone_humorous'].entries()) {
  test(`old completed Opening Continue preserves state through COM03X branch ${index + 1}, reload and one-time payoff`, () => {
    installBrowserMocks();
    const runtime = openingRuntime();
    const saved = completedOpeningSave(runtime);
    localStorage.setItem(`${runtime.chapter.id}:journey:v2`, JSON.stringify(saved));
    let engine = instantEngine(runtime);
    engine.refreshTitle();
    assert.equal(engine.els.startButton.textContent, '繼續遊戲');
    engine.startFromTitle();
    assert.equal(engine.nodeId, 'common_station_cafe_jyc_enter');
    assert.deepEqual(engine.state, { ...saved.cursor.stats, flags: new Set(saved.cursor.flags) });
    const seen = new Set();
    let reloaded = false;
    for (let step = 0; step < 180 && engine.nodeId !== 'common_recommend_discord_jyc_enter'; step += 1) {
      seen.add(engine.nodeId);
      if (engine.nodeId === 'common_package_xu_proof_10' && !reloaded) {
        const before = structuredClone(engine.progress.data.cursor);
        engine = instantEngine(runtime);
        engine.startFromTitle();
        assert.deepEqual(engine.progress.data.cursor, before);
        reloaded = true;
      }
      const node = runtime.chapter.nodes[engine.nodeId];
      if (node.choices) {
        engine.enterChoiceMode(node.choices);
        engine.els.choices.children[engine.nodeId.startsWith('common_station_cafe_jyc_choice_') ? 0 : index].click();
      } else engine.advance();
    }
    assert.equal(reloaded, true);
    assert.equal(engine.nodeId, 'common_recommend_discord_jyc_enter');
    for (const id of ['common_package_xu_proof', 'common_package_xu_callback', 'common_package_xu_line', 'common_package_xu_exit', 'common_package_xu_first_message']) assert.ok(seen.has(id));
    const expected = { ...saved.cursor.stats, F_XT: 8, F_JYC: saved.cursor.stats.F_JYC + 1, T_JYC: saved.cursor.stats.T_JYC + 1, [tone]: saved.cursor.stats[tone] + 1 };
    assert.deepEqual(engine.progress.data.cursor.stats, expected);
    assert.ok(saved.cursor.flags.every(flag => engine.state.flags.has(flag)));
    assert.ok(engine.state.flags.has('contact_xu'));
    assert.equal(engine.progress.data.runComplete, false);
    assert.equal(engine.progress.data.playerDisplayName, '小雨');
    assert.ok(saved.edges.every(edge => engine.progress.data.edges.some(actual => actual.join() === edge.join())));
    engine.resumeGame(engine.progress.data.checkpoints.common_package_xu_first_message_06);
    assert.equal(engine.state.F_XT, 8, 'reloading payoff does not repeat familiarity');
    assert.deepEqual(engine.progress.data.cursor.stats, expected);
    engine.advance();
    for (let step = 0; step < 100 && engine.nodeId !== 'com03j_preview_complete'; step++) {
      const node = runtime.chapter.nodes[engine.nodeId];
      if (node.choices) { engine.enterChoiceMode(node.choices); engine.els.choices.children[0].click(); }
      else engine.advance();
    }
    assert.equal(engine.nodeId, 'com03j_preview_complete');
    assert.equal(engine.state.F_JYC, expected.F_JYC + 1);
    const actualComplete = instantEngine(runtime);
    actualComplete.refreshTitle();
    assert.equal(actualComplete.els.startButton.textContent, '開始遊戲');
    actualComplete.startFromTitle();
    assert.equal(actualComplete.nodeId, runtime.chapter.startNode);
    assert.equal(actualComplete.state.F_XT, 0);
    assert.equal(actualComplete.progress.data.restartActive, true);
  });
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

test('actual complete Opening Memory reload still offers Start and invalid historical cursor retains fallback', () => {
  for (const nodeId of ['com03j_preview_complete', 'deleted-node']) {
    installBrowserMocks();
    const runtime = openingRuntime();
    const saved = completedOpeningSave(runtime, nodeId);
    localStorage.setItem(`${runtime.chapter.id}:journey:v2`, JSON.stringify(saved));
    const engine = instantEngine(runtime);
    if (nodeId === 'com03j_preview_complete') {
      engine.progress.beginReplay();
      engine.progress.capture('common_convenience_xu_enter', { ...runtime.chapter.initialState, flags: new Set(['earlier']) }, []);
      const reloaded = instantEngine(runtime);
      reloaded.refreshTitle();
      assert.equal(reloaded.progress.data.runComplete, true);
      assert.equal(reloaded.els.startButton.textContent, '開始遊戲');
      reloaded.startFromTitle();
      assert.equal(reloaded.nodeId, runtime.chapter.startNode);
    } else {
      assert.equal(engine.progress.data.cursor, null);
      assert.equal(engine.progress.data.runComplete, true);
      engine.startFromTitle();
      assert.equal(engine.nodeId, runtime.chapter.startNode);
    }
  }
});

test('a historical terminal Memory cursor cannot reopen or regress a completed appended world on reload', () => {
  installBrowserMocks();
  const runtime = openingRuntime();
  const saved = completedOpeningSave(runtime);
  saved.frontier = { ...saved.cursor, nodeId: 'com03j_preview_complete', stats: { ...saved.cursor.stats, F_XT: 99 }, flags: ['contact_xu', 'new-world'] };
  saved.checkpoints.com03j_preview_complete = saved.frontier;
  localStorage.setItem(`${runtime.chapter.id}:journey:v2`, JSON.stringify(saved));
  const engine = instantEngine(runtime);
  assert.equal(engine.progress.data.runComplete, true);
  assert.deepEqual(engine.progress.data.frontier, saved.frontier);
  engine.refreshTitle();
  assert.equal(engine.els.startButton.textContent, '開始遊戲');
  engine.startFromTitle();
  assert.equal(engine.nodeId, runtime.chapter.startNode);
  assert.deepEqual(engine.progress.data.frontier, saved.frontier);
});

for (const topic of [0, 1, 2, 3, 99]) {
  for (const choiceIndex of [0, 1, 2]) {
    test(`COM02J actual engine topic ${topic} choice ${choiceIndex} preserves reveal, callbacks, effects and reload`, () => {
      installBrowserMocks();
      const runtime = openingRuntime();
      let engine = instantEngine(runtime);
      engine.progress.setPlayerName('小雨');
      const stats = { ...runtime.chapter.initialState, jyc_first_topic: topic, F_JYC: 10 };
      engine.resumeGame({ nodeId: 'common_station_cafe_jyc_enter', stats, flags: [], returnNodes: [] });
      const variant = ({ 1: 'worldbuilding', 2: 'visual_design', 3: 'edition_value' })[topic] || 'neutral';
      const seen = [];
      let reloaded = false;
      for (let step = 0; step < 70 && engine.nodeId !== 'common_package_xu_arrive'; step++) {
        seen.push(engine.nodeId);
        const node = runtime.chapter.nodes[engine.nodeId];
        if (engine.nodeId === 'common_station_cafe_jyc_drawing_03') assert.equal(engine.els.speaker.textContent, '女生');
        if (engine.nodeId === 'common_station_cafe_jyc_names') assert.equal(engine.els.text.textContent, '上次忘了問。我叫 小雨。');
        if (engine.nodeId === 'common_station_cafe_jyc_names_02') assert.equal(engine.els.speaker.textContent, '江雨澄');
        if (node.choices) {
          assert.equal(engine.nodeId, `common_station_cafe_jyc_choice_${variant}`);
          engine.enterChoiceMode(node.choices);
          engine.els.choices.children[choiceIndex].click();
          const before = structuredClone(engine.progress.data.cursor);
          engine = instantEngine(runtime);
          engine.startFromTitle();
          assert.deepEqual(engine.progress.data.cursor, before);
          reloaded = true;
        } else engine.advance();
      }
      assert.equal(reloaded, true);
      assert.equal(engine.nodeId, 'common_package_xu_arrive');
      assert.equal(engine.state.F_JYC, 11 + Number(choiceIndex === 1));
      assert.equal(engine.state.T_JYC, Number(choiceIndex === 0));
      assert.equal(engine.state.C_JYC, Number(choiceIndex === 2));
      assert.equal(engine.state.jyc_first_topic, topic, 'neutral never invents first history');
      assert.ok(engine.state.flags.has(`jyc_second_topic:${['her_art','shared_work','general_praise'][choiceIndex]}`));
      for (const flag of ['player_knows_jyc_name','jyc_knows_player_name','jyc_creator_work_seen','jyc_initiated_second_contact']) assert.ok(engine.state.flags.has(flag));
      for (const forbidden of ['contact_jyc','jyc_alias_private','jyc_alias_exposed','jyc_seen_in_element','relationship.jyc.romanticSignal','contact_xu']) assert.equal(engine.state.flags.has(forbidden), false);
      assert.ok(seen.includes('common_station_cafe_jyc_reciprocity_02'));
      if (choiceIndex === 1) {
        assert.ok(seen.includes(`com02j_continue_topic_${variant}`));
        assert.equal(seen.filter(id => /^com02j_continue_topic_(visual_design|worldbuilding|edition_value|neutral)$/.test(id)).length, 1);
      }
      assert.equal(engine.progress.data.frontierRank, 200);
      const frontier = structuredClone(engine.progress.data.frontier);
      const entry = engine.progress.data.checkpoints.common_station_cafe_jyc_enter;
      entry.stats.jyc_first_topic = 0;
      engine.state.jyc_first_topic = 3;
      engine.replayMemory({ replayNode: 'common_station_cafe_jyc_enter' });
      for (let step = 0; step < 70 && !engine.els.game.classList.contains('is-hidden'); step++) {
        const node = runtime.chapter.nodes[engine.nodeId];
        if (node.choices) {
          assert.equal(engine.nodeId, 'common_station_cafe_jyc_choice_neutral');
          engine.enterChoiceMode(node.choices);engine.els.choices.children[1].click();
        } else engine.advance();
      }
      assert.equal(engine.nodeId, 'common_station_cafe_jyc_complete');
      assert.equal(engine.els.title.classList.contains('is-hidden'), false);
      assert.deepEqual(engine.progress.data.frontier, frontier);
      engine = instantEngine(runtime);engine.startFromTitle();
      assert.equal(engine.nodeId, frontier.nodeId);
      assert.deepEqual(engine.progress.data.frontier, frontier);
    });
  }
}

for (const nodeId of ['com03x_preview_complete','common_package_xu_proof_10','common_package_xu_first_message_06']) {
  test(`COM02J actual engine supplements old ${nodeId}, retains name/return point and never doubles COM03X payoff`, () => {
    installBrowserMocks();
    const runtime = openingRuntime();
    const stats = { ...runtime.chapter.initialState, F_XT: 9, F_JYC: 4, jyc_first_topic: 1 };
    const flags = ['contact_xu','entry-effect:common_package_xu_first_message_06','world-retained'];
    const snapshot = { nodeId, stats, flags, returnNodes: [] };
    localStorage.setItem(`${runtime.chapter.id}:journey:v2`, JSON.stringify({ version: 2, playerDisplayName: '小雨', cursor: snapshot, frontier: snapshot,
      runComplete: nodeId === 'com03x_preview_complete', checkpoints: { [nodeId]: snapshot }, edges: [] }));
    let engine = instantEngine(runtime);engine.startFromTitle();
    assert.equal(engine.nodeId, 'common_station_cafe_jyc_enter');
    const target = nodeId === 'com03x_preview_complete' ? 'common_recommend_discord_jyc_enter' : nodeId;
    let reloaded = false;
    for (let step = 0; step < 70 && engine.nodeId !== target; step++) {
      const node = runtime.chapter.nodes[engine.nodeId];
      if (node.choices) {
        engine.enterChoiceMode(node.choices);engine.els.choices.children[2].click();
        const cursor = structuredClone(engine.progress.data.cursor);
        engine = instantEngine(runtime);engine.startFromTitle();
        assert.deepEqual(engine.progress.data.cursor,cursor);
        reloaded = true;
      } else engine.advance();
    }
    assert.equal(reloaded,true);
    assert.equal(engine.nodeId,target);
    assert.equal(engine.state.F_XT,9);
    assert.equal(engine.state.F_JYC,5);
    assert.equal(engine.state.C_JYC,1);
    assert.equal(engine.progress.data.playerDisplayName,'小雨');
    assert.ok(flags.every(flag => engine.state.flags.has(flag)));
    assert.equal(engine.progress.data.com02jSupplement,null);
    const reload = instantEngine(runtime);reload.refreshTitle();
    assert.equal(reload.els.startButton.textContent,'繼續遊戲');
    assert.equal(reload.progress.data.com02jSupplement,null);
  });
}

const com03jPrefix = 'common_recommend_discord_jyc_';
const com03jEntryFlags = ['preview:com02j-complete','entry-effect:common_station_cafe_jyc_complete','player_knows_jyc_name','jyc_knows_player_name','jyc_creator_work_seen'];
const com03jCallbacks = [
  ['her_art', ['jyc_second_topic:her_art']],
  ['shared_visual_design',['jyc_second_topic:shared_work','history:jyc_first_topic:visual_design']],
  ['shared_worldbuilding',['jyc_second_topic:shared_work','history:jyc_first_topic:worldbuilding']],
  ['shared_edition_value',['jyc_second_topic:shared_work','history:jyc_first_topic:edition_value']],
  ['shared_neutral',['jyc_second_topic:shared_work']],
  ['general_praise',['jyc_second_topic:general_praise']],
  ['neutral',[]]
];
for (const [variant,history] of com03jCallbacks) for (const choiceIndex of [0,1,2]) {
  test(`COM03J actual engine ${variant}, closing ${choiceIndex}, reload at callback/contact/choice/close/exit is once`,()=>{
    installBrowserMocks();const runtime=openingRuntime();let engine=instantEngine(runtime);engine.progress.setPlayerName('小雨');
    const flags=[...com03jEntryFlags,...history,'contact_xu','world-retained'];
    const stats={...runtime.chapter.initialState,F_XT:17,F_JYC:6,jyc_first_topic:99,T_JYC:3,C_JYC:4};
    engine.resumeGame({nodeId:com03jPrefix+'enter',stats,flags,returnNodes:[]});
    const seen=[],reloads=new Set();let selected=false;
    for(let step=0;step<110&&engine.nodeId!=='com03j_preview_complete';step++){
      const id=engine.nodeId,node=runtime.chapter.nodes[id];seen.push(id);
      if([com03jPrefix+'callback_'+variant,com03jPrefix+'contact',com03jPrefix+'choice',com03jPrefix+['continue_close','warm_close','save_for_later'][choiceIndex],com03jPrefix+'exit'].includes(id)&&!reloads.has(id)){
        reloads.add(id);const cursor=structuredClone(engine.progress.data.cursor);engine=instantEngine(runtime);engine.startFromTitle();assert.deepEqual(engine.progress.data.cursor,cursor);
      }
      if(node.choices){engine.advance();assert.equal(engine.els.dialoguePanel.classList.contains('is-hidden'),true);engine.els.choices.children[choiceIndex].click();selected=true;}else engine.advance();
    }
    assert.equal(engine.nodeId,'com03j_preview_complete');assert.equal(selected,true);assert.equal(reloads.size,5);
    assert.equal(seen.filter(id=>/^common_recommend_discord_jyc_callback_[a-z_]+$/.test(id)).length,1);
    assert.ok(seen.includes(com03jPrefix+'callback_'+variant));
    assert.deepEqual({...engine.state,flags:undefined},{...stats,F_JYC:7,flags:undefined});
    assert.ok(engine.state.flags.has('contact_jyc'));assert.ok(flags.every(flag=>engine.state.flags.has(flag)));
    assert.equal([...engine.state.flags].filter(f=>f.startsWith('jyc_com03j_reply_style:')).length,1);
    assert.ok(engine.state.flags.has('jyc_com03j_reply_style:'+['continue_content','warm_close','save_for_later'][choiceIndex]));
    assert.equal(engine.progress.data.frontierRank,220);assert.equal(engine.progress.data.runComplete,true);
    const saved=structuredClone(engine.progress.data.frontier);engine=instantEngine(runtime);assert.deepEqual(engine.progress.data.frontier,saved);engine.startFromTitle();
    assert.equal(engine.nodeId,runtime.chapter.startNode);assert.equal(engine.state.F_JYC,0);
  });
}

test('COM03J callbacks reject counter inference, contradictory local identities and missing provenance',()=>{
  for(const history of [['jyc_second_topic:shared_work'],['jyc_second_topic:her_art','jyc_second_topic:general_praise'],['jyc_second_topic:shared_work','history:jyc_first_topic:worldbuilding','history:jyc_first_topic:visual_design'],['jyc_second_topic:unknown']]){
    installBrowserMocks();const runtime=openingRuntime();const engine=instantEngine(runtime);engine.progress.setPlayerName('小雨');
    engine.resumeGame({nodeId:com03jPrefix+'callback',stats:{...runtime.chapter.initialState,jyc_first_topic:2},flags:[...com03jEntryFlags,...history],returnNodes:[]});
    const shared=history[0]==='jyc_second_topic:shared_work';assert.equal(engine.nodeId,com03jPrefix+'callback_'+(shared?'shared_neutral':'neutral'));
  }
  installBrowserMocks();const runtime=openingRuntime();const engine=instantEngine(runtime);engine.progress.setPlayerName('小雨');
  engine.resumeGame({nodeId:com03jPrefix+'callback',stats:runtime.chapter.initialState,flags:['jyc_second_topic:her_art'],returnNodes:[]});assert.equal(engine.nodeId,com03jPrefix+'callback_neutral');
  assert.throws(()=>engine.resumeGame({nodeId:com03jPrefix+'enter',stats:runtime.chapter.initialState,flags:[],returnNodes:[]}),/COM03J entry requires/);
});

for(const unknown of [false,true])test(`COM03J Memory local history ${unknown?'unknown':'trusted'} survives reload and discards local closing/effects`,()=>{
  installBrowserMocks();const runtime=openingRuntime();let engine=instantEngine(runtime);engine.progress.setPlayerName('小雨');
  const entry={nodeId:com03jPrefix+'enter',stats:{...runtime.chapter.initialState,F_JYC:6},flags:[...com03jEntryFlags,...(unknown?[]:['jyc_second_topic:shared_work','history:jyc_first_topic:worldbuilding'])],returnNodes:[]};
  engine.progress.capture(entry.nodeId,engine.progress.restore(entry).state,[]);
  const state={...runtime.chapter.initialState,F_JYC:7,F_XT:24,flags:new Set([...com03jEntryFlags,'contact_jyc','preview:com03j-complete','jyc_second_topic:her_art','jyc_com03j_reply_style:warm_close','live-private'])};
  engine.progress.capture('com03j_preview_complete',state,[]);engine.progress.finishRun();
  const before=structuredClone(engine.progress.data);
  engine.replayMemory({replayNode:entry.nodeId});let reloaded=false,callback;
  for(let step=0;step<100&&!engine.els.game.classList.contains('is-hidden');step++){
    const id=engine.nodeId,node=runtime.chapter.nodes[id];if(/^common_recommend_discord_jyc_callback_[a-z_]+$/.test(id))callback=id;
    if(id===com03jPrefix+'meme'&&!reloaded){const cursor=structuredClone(engine.progress.data.cursor);engine=instantEngine(runtime);engine.startFromTitle();assert.deepEqual(engine.progress.data.cursor,cursor);reloaded=true;}
    if(node.choices){engine.advance();engine.els.choices.children[0].click();}else engine.advance();
  }
  assert.equal(callback,com03jPrefix+'callback_'+(unknown?'neutral':'shared_worldbuilding'));assert.equal(reloaded,true);
  assert.equal(engine.els.memories.classList.contains('is-hidden'),false);assert.equal(engine.progress.data.com03jReplay,null);
  assert.deepEqual(engine.progress.data.frontier,before.frontier);assert.deepEqual(engine.progress.data.cursor,before.cursor);assert.deepEqual(engine.progress.data.checkpoints,before.checkpoints);assert.deepEqual(engine.progress.data.edges,before.edges);assert.equal(engine.progress.data.runComplete,true);
  assert.equal(engine.state.F_XT,24);assert.ok(engine.state.flags.has('live-private'));assert.equal(engine.state.flags.has('jyc_com03j_reply_style:continue_content'),false);
});

for(const index of [0,1,2])test(`fresh full Opening records first-topic provenance on actual choice ${index} and enters COM03J naturally`,()=>{
  installBrowserMocks();const runtime=openingRuntime();const engine=instantEngine(runtime);engine.progress.setPlayerName('小雨');engine.startGame();
  let selectedFirst=false,entered=false;
  for(let step=0;step<550&&engine.nodeId!=='com03j_preview_complete';step++){
    const id=engine.nodeId,node=runtime.chapter.nodes[id];if(id===com03jPrefix+'enter')entered=true;
    if(node.choices){engine.enterChoiceMode(node.choices);engine.els.choices.children[id==='common_acg_first_meet_choice'?index:id.startsWith('common_station_cafe_jyc_choice_')?1:0].click();if(id==='common_acg_first_meet_choice')selectedFirst=true;}else engine.advance();
  }
  assert.equal(selectedFirst,true);assert.equal(entered,true);assert.equal(engine.nodeId,'com03j_preview_complete');assert.ok(engine.state.flags.has('contact_xu'));assert.ok(engine.state.flags.has('contact_jyc'));
  const topic=['worldbuilding','visual_design','edition_value'][index];assert.ok(engine.state.flags.has('history:jyc_first_topic:'+topic));
  assert.ok(engine.progress.data.checkpoints[com03jPrefix+'callback_shared_'+topic]);
});

test('COM03J missing entry snapshot starts a complete neutral Memory from surviving local facts, never live history',()=>{
  installBrowserMocks();const runtime=openingRuntime();const engine=instantEngine(runtime);engine.progress.setPlayerName('小雨');
  const flags=[...com03jEntryFlags,'contact_jyc','preview:com03j-complete','entry-effect:common_recommend_discord_jyc_exit','jyc_second_topic:her_art','history:jyc_first_topic:visual_design','jyc_com03j_reply_style:warm_close'];
  const state={...runtime.chapter.initialState,F_JYC:8,F_XT:18,flags:new Set(flags)};
  engine.progress.capture('com03j_preview_complete',state,[]);engine.progress.finishRun();const world=structuredClone(engine.progress.data.frontier);
  const event=runtime.memoryLibrary.events.find(e=>e.id==='mem.opening.ch1.recommend-discord-jyc');
  engine.replayMemory(event);assert.equal(engine.nodeId,com03jPrefix+'enter');assert.equal(engine.state.F_JYC,7);
  while(!engine.nodeId.startsWith(com03jPrefix+'callback_'))engine.advance();
  assert.equal(engine.nodeId,com03jPrefix+'callback_neutral');assert.deepEqual(engine.progress.data.frontier,world);
  for(let step=0;step<100&&!engine.els.game.classList.contains('is-hidden');step++){
    const node=runtime.chapter.nodes[engine.nodeId];if(node.choices){engine.enterChoiceMode(node.choices);engine.els.choices.children[2].click();}else engine.advance();
  }
  assert.equal(engine.els.memories.classList.contains('is-hidden'),false);assert.deepEqual(engine.progress.data.frontier,world);assert.equal(engine.state.F_JYC,8);assert.equal(engine.progress.data.runComplete,true);
});

test('COM03J isolated Memory reload restores the active fresh-run cursor and restart mode alongside historical frontier',()=>{
  installBrowserMocks();const runtime=openingRuntime();let engine=instantEngine(runtime);engine.progress.setPlayerName('小雨');
  const entry={nodeId:com03jPrefix+'enter',stats:{...runtime.chapter.initialState,F_JYC:6},flags:[...com03jEntryFlags,'jyc_second_topic:her_art'],returnNodes:[]};
  engine.progress.capture(entry.nodeId,engine.progress.restore(entry).state,[]);
  engine.progress.capture('com03j_preview_complete',{...runtime.chapter.initialState,F_XT:21,F_JYC:7,flags:new Set([...com03jEntryFlags,'contact_jyc','live-completed'])},[]);engine.progress.finishRun();
  engine.startFromTitle();assert.equal(engine.progress.data.restartActive,true);const before=structuredClone(engine.progress.data);
  engine.replayMemory({replayNode:entry.nodeId});let reloaded=false;
  for(let step=0;step<100&&!engine.els.game.classList.contains('is-hidden');step++){
    const node=runtime.chapter.nodes[engine.nodeId];if(engine.nodeId===com03jPrefix+'meme'&&!reloaded){engine=instantEngine(runtime);engine.startFromTitle();reloaded=true;}
    if(node.choices){engine.enterChoiceMode(node.choices);engine.els.choices.children[1].click();}else engine.advance();
  }
  assert.equal(reloaded,true);assert.equal(engine.progress.data.restartActive,true);assert.equal(engine.progress.data.runComplete,false);assert.equal(engine.progress.replaying,true);
  assert.deepEqual(engine.progress.data.frontier,before.frontier);assert.deepEqual(engine.progress.data.cursor,before.cursor);assert.deepEqual(engine.progress.data.checkpoints,before.checkpoints);assert.equal(engine.state.F_XT,0);assert.equal(engine.state.F_JYC,0);assert.equal(engine.state.flags.has('contact_jyc'),false);
  engine=instantEngine(runtime);engine.startFromTitle();assert.equal(engine.nodeId,runtime.chapter.startNode);assert.equal(engine.progress.data.restartActive,true);assert.equal(engine.state.F_JYC,0);assert.deepEqual(engine.progress.data.frontier,before.frontier);
});
