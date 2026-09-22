import test from 'node:test';
import assert from 'node:assert/strict';
import { graphOrder, outgoing, renderBranches } from '../src/branches.js';

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...names) { names.forEach((name) => this.values.add(name)); }
  remove(...names) { names.forEach((name) => this.values.delete(name)); }
  toggle(name, force) {
    const next = force === undefined ? !this.values.has(name) : force;
    if (next) this.values.add(name); else this.values.delete(name);
    return next;
  }
  contains(name) { return this.values.has(name); }
}

class FakeElement {
  constructor() {
    this.tagName = 'div';
    this.children = [];
    this.classList = new FakeClassList();
    this.style = { setProperty() {} };
    this.textContent = '';
    this.disabled = false;
    this.listeners = new Map();
  }

  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  setAttribute() {}
  querySelectorAll() { return this.children; }
}

globalThis.document = {
  createElement(tagName) {
    const element = new FakeElement();
    element.tagName = tagName;
    return element;
  }
};

const fixture = {
  startNode: 'start',
  chapterLabels: ['開始'],
  nodes: {
    start: { choices: [{ text: '左邊', next: 'left' }, { text: '右邊', next: 'right' }] },
    left: { mapLabel: '左邊秘密', next: 'join' },
    right: { mapLabel: '右邊秘密', next: 'join' },
    join: { type: 'random', pool: 'pool', after: 'after' },
    after: { next: 'finish' },
    finish: { type: 'route' },
    e1: { next: 'return' },
    e2: { next: 'return' },
    return: { type: 'return' }
  }
};

const pools = { pool: { entries: [{ entryNode: 'e1' }, { entryNode: 'e2' }] } };

test('outgoing and graphOrder include random entries and visit reconvergent nodes once', () => {
  assert.deepEqual(outgoing(fixture.nodes.join, pools), ['after', 'e1', 'e2']);
  const rows = graphOrder(fixture, pools);
  const ids = rows.map((row) => row.id);
  assert.deepEqual(ids, ['start', 'left', 'join', 'after', 'finish', 'e1', 'return', 'e2', 'right']);
  assert.equal(ids.filter((id) => id === 'join').length, 1);
  assert.deepEqual(rows.find((row) => row.id === 'start').next, ['left', 'right']);
  assert.ok(rows.find((row) => row.id === 'right'), 'both sides of a reconvergent branch remain represented');
});

test('renderBranches hides unexplored node labels and disables their buttons', () => {
  const container = new FakeElement();
  const summary = new FakeElement();
  const progress = { data: { checkpoints: { start: { nodeId: 'start' } }, current: null, edges: [] } };
  const chapter = {
    ...fixture,
    nodes: {
      ...fixture.nodes,
      left: { mapLabel: '左側秘密', next: 'join' },
      right: { mapLabel: '右側秘密', next: 'join' }
    }
  };

  renderBranches({ chapter, pools, assets: {}, progress, unlocked: new Set(), container, summary, onResume() {} });
  const leftButton = container.children.find((button) => button.children[0]?.textContent.includes('左側秘密'));
  const rightButton = container.children.find((button) => button.children[0]?.textContent.includes('右側秘密'));
  assert.equal(leftButton, undefined);
  assert.equal(rightButton, undefined);
  const locked = container.children.find((button) => button.children[0]?.textContent.includes('未探索'));
  assert.ok(locked);
  assert.equal(locked.disabled, true);
  assert.equal(locked.children[0].textContent, '2 · 未探索');
  assert.match(summary.textContent, /已走過 1 \/ /);
});

test('renderBranches shows a traversed connection without exposing unvisited node resume', () => {
  const container = new FakeElement();
  const summary = new FakeElement();
  const progress = {
    data: {
      checkpoints: { start: { nodeId: 'start' } },
      current: null,
      edges: [['start', 'left']]
    }
  };
  renderBranches({ chapter: fixture, pools, assets: {}, progress, unlocked: new Set(), container, summary, onResume() {} });
  const leftButton = container.children.find((button) => button.children[0]?.textContent.includes('左邊'));
  assert.ok(leftButton);
  assert.equal(leftButton.disabled, true);
  assert.match(leftButton.children[0].textContent, /左邊/);
  assert.equal(leftButton.children[1].textContent, '分支連接點');
});
