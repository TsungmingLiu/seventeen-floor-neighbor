// Snapshots store node-entry state: choices are applied only when the player chooses.
export class ProgressStore {
  constructor(chapter, storage = globalThis.localStorage) {
    this.chapter = chapter;
    this.storage = storage;
    this.key = `${chapter.id}:journey:v1`;
    this.data = { version: 1, current: null, checkpoints: {}, edges: [] };
    try {
      const saved = JSON.parse(storage.getItem(this.key));
      if (saved?.version === 1) {
        this.data.checkpoints = Object.fromEntries(Object.entries(saved.checkpoints || {})
          .filter(([id, snapshot]) => id === snapshot?.nodeId && this.valid(snapshot)));
        this.data.current = this.valid(saved.current) ? saved.current : null;
        this.data.edges = (Array.isArray(saved.edges) ? saved.edges : [])
          .filter(edge => Array.isArray(edge) && edge.length === 2 && edge.every(id => chapter.nodes[id]));
      }
    } catch { /* A damaged save must not block a fresh start. */ }
  }

  valid(snapshot) {
    return !!snapshot && !!this.chapter.nodes[snapshot.nodeId]
      && snapshot.stats && Object.keys(this.chapter.initialState).every(key => Number.isFinite(snapshot.stats[key]))
      && Array.isArray(snapshot.flags) && snapshot.flags.every(flag => typeof flag === 'string')
      && Array.isArray(snapshot.returnNodes) && snapshot.returnNodes.every(id => this.chapter.nodes[id]);
  }

  capture(nodeId, state, returnNodes) {
    const stats = Object.fromEntries(Object.keys(this.chapter.initialState).map(key => [key, state[key] ?? this.chapter.initialState[key]]));
    const snapshot = { nodeId, stats, flags: [...state.flags], returnNodes: [...returnNodes] };
    this.data.current = snapshot;
    this.data.checkpoints[nodeId] = snapshot;
    this.flush();
    return snapshot;
  }

  connect(from, to) {
    if (!from || !to || from === to) return;
    if (!this.data.edges.some(edge => edge[0] === from && edge[1] === to)) this.data.edges.push([from, to]);
  }

  restore(snapshot) {
    if (!this.valid(snapshot)) return null;
    return { nodeId: snapshot.nodeId, state: { ...snapshot.stats, flags: new Set(snapshot.flags) }, returnNodes: [...snapshot.returnNodes] };
  }

  flush() {
    try { this.storage.setItem(this.key, JSON.stringify(this.data)); this.persisted = true; }
    catch { this.persisted = false; }
  }
}
