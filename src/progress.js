import { memoryEventForNode } from './memories.js';

// Snapshots store node-entry state: choices are applied only when the player chooses.
export class ProgressStore {
  constructor(chapter, memoriesOrStorage = null, storage = globalThis.localStorage) {
    this.chapter = chapter;
    if (memoriesOrStorage?.getItem && typeof memoriesOrStorage.getItem === 'function') {
      this.memories = { events: [] };
      this.storage = memoriesOrStorage;
    } else {
      this.memories = memoriesOrStorage || { events: [] };
      this.storage = storage;
    }
    this.key = `${chapter.id}:journey:v2`;
    this.legacyKey = `${chapter.id}:journey:v1`;
    this.data = this.emptyData();
    this.load();
  }

  emptyData() {
    return {
      version: 2,
      cursor: null,
      frontier: null,
      frontierMemoryEventId: null,
      frontierRank: -1,
      checkpoints: {},
      edges: []
    };
  }

  parse(key) {
    try { return JSON.parse(this.storage.getItem(key)); }
    catch { return null; }
  }

  valid(snapshot) {
    return !!snapshot && !!this.chapter.nodes[snapshot.nodeId]
      && snapshot.stats && Object.keys(this.chapter.initialState).every(key => Number.isFinite(snapshot.stats[key]))
      && Array.isArray(snapshot.flags) && snapshot.flags.every(flag => typeof flag === 'string')
      && Array.isArray(snapshot.returnNodes) && snapshot.returnNodes.every(id => this.chapter.nodes[id]);
  }

  clone(snapshot) {
    if (!this.valid(snapshot)) return null;
    return {
      nodeId: snapshot.nodeId,
      stats: { ...snapshot.stats },
      flags: [...snapshot.flags],
      returnNodes: [...snapshot.returnNodes]
    };
  }

  sanitizeCheckpoints(checkpoints) {
    return Object.fromEntries(Object.entries(checkpoints || {})
      .filter(([id, snapshot]) => id === snapshot?.nodeId && this.valid(snapshot))
      .map(([id, snapshot]) => [id, this.clone(snapshot)]));
  }

  sanitizeEdges(edges) {
    return (Array.isArray(edges) ? edges : [])
      .filter(edge => Array.isArray(edge) && edge.length === 2 && edge.every(id => this.chapter.nodes[id]));
  }

  eventForSnapshot(snapshot) {
    return snapshot ? memoryEventForNode(this.memories, snapshot.nodeId) : null;
  }

  deepestSnapshot(checkpoints, preferred = null) {
    const candidates = [...Object.values(checkpoints || {})];
    if (preferred && this.valid(preferred)) candidates.push(preferred);
    let best = null;
    for (const snapshot of candidates) {
      const event = this.eventForSnapshot(snapshot);
      if (!event) continue;
      if (!best || event.progressRank > best.event.progressRank) best = { snapshot, event };
    }
    return best;
  }

  load() {
    const saved = this.parse(this.key);
    if (saved?.version === 2) {
      this.data.checkpoints = this.sanitizeCheckpoints(saved.checkpoints);
      this.data.cursor = this.clone(saved.cursor);
      this.data.frontier = this.clone(saved.frontier);
      this.data.edges = this.sanitizeEdges(saved.edges);
      const frontierEvent = this.eventForSnapshot(this.data.frontier);
      if (frontierEvent) {
        this.data.frontierMemoryEventId = frontierEvent.id;
        this.data.frontierRank = frontierEvent.progressRank;
      } else {
        const deepest = this.deepestSnapshot(this.data.checkpoints, this.data.cursor);
        if (deepest) {
          this.data.frontier = this.clone(deepest.snapshot);
          this.data.frontierMemoryEventId = deepest.event.id;
          this.data.frontierRank = deepest.event.progressRank;
        }
      }
      return;
    }

    const legacy = this.parse(this.legacyKey);
    if (legacy?.version !== 1) return;
    this.data.checkpoints = this.sanitizeCheckpoints(legacy.checkpoints);
    this.data.cursor = this.clone(legacy.current);
    this.data.edges = this.sanitizeEdges(legacy.edges);
    const deepest = this.deepestSnapshot(this.data.checkpoints, this.data.cursor);
    if (deepest) {
      this.data.frontier = this.clone(deepest.snapshot);
      this.data.frontierMemoryEventId = deepest.event.id;
      this.data.frontierRank = deepest.event.progressRank;
    } else if (this.data.cursor) {
      this.data.frontier = this.clone(this.data.cursor);
    }
    this.flush();
  }

  capture(nodeId, state, returnNodes) {
    const stats = Object.fromEntries(Object.keys(this.chapter.initialState)
      .map(key => [key, state[key] ?? this.chapter.initialState[key]]));
    const snapshot = { nodeId, stats, flags: [...state.flags], returnNodes: [...returnNodes] };
    this.data.cursor = this.clone(snapshot);
    this.data.checkpoints[nodeId] = this.clone(snapshot);
    const event = memoryEventForNode(this.memories, nodeId);
    if (event && (!this.data.frontier || event.progressRank > this.data.frontierRank)) {
      this.data.frontier = this.clone(snapshot);
      this.data.frontierMemoryEventId = event.id;
      this.data.frontierRank = event.progressRank;
    } else if (!this.data.frontier) {
      this.data.frontier = this.clone(snapshot);
    }
    this.flush();
    return snapshot;
  }

  setCursor(snapshot) {
    const next = this.clone(snapshot);
    if (!next) return false;
    this.data.cursor = next;
    this.flush();
    return true;
  }

  connect(from, to) {
    if (!from || !to || from === to) return;
    if (!this.data.edges.some(edge => edge[0] === from && edge[1] === to)) {
      this.data.edges.push([from, to]);
      this.flush();
    }
  }

  restore(snapshot) {
    const next = this.clone(snapshot);
    if (!next) return null;
    return {
      nodeId: next.nodeId,
      state: { ...next.stats, flags: new Set(next.flags) },
      returnNodes: [...next.returnNodes]
    };
  }

  flush() {
    try { this.storage.setItem(this.key, JSON.stringify(this.data)); this.persisted = true; }
    catch { this.persisted = false; }
  }
}
