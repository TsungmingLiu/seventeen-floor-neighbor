import { memoryEventForNode } from './memories.js';
import { normalizePlayerName } from './player-name.js';
import { excludedJiangDestination, jiangExcluded, c1Outing } from './branches.js';

// Only these additive Opening preview stats may default in historical saves.
const OPENING_ADDITIVE_STATS = new Set(['T_XT', 'K_XT', 'xt_advice_tendency', 'T_JYC', 'C_JYC']);

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
    this.replaying = false;
    this.data = this.emptyData();
    this.load();
  }

  emptyData() {
    return {
      version: 2,
      playerDisplayName: null,
      cursor: null,
      frontier: null,
      restartActive: false,
      replayActive: false,
      runComplete: false,
      frontierMemoryEventId: null,
      frontierRank: -1,
      jycEverUnlocked: false,
      bookstoreEverEarned: false,
      initialEncounterEverEarned: false,
      unlockedMemoryEventIds: [],
      checkpoints: {},
      edges: [],
      com02jSupplement: null,
      com03jReplay: null,
      c1Replay: null
    };
  }

  parse(key) {
    try { return JSON.parse(this.storage.getItem(key)); }
    catch { return null; }
  }

  normalizeStats(stats) {
    if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return null;
    const normalized = { ...stats };
    for (const [key, value] of Object.entries(this.chapter.initialState)) {
      if (!Object.hasOwn(stats, key) && this.chapter.id === 'opening-demo-chapter-01' && OPENING_ADDITIVE_STATS.has(key)) {
        normalized[key] = value;
      }
      if (!Number.isFinite(normalized[key])) return null;
    }
    return normalized;
  }

  setPlayerName(value) {
    const name = normalizePlayerName(value);
    if (!name) return false;
    this.data.playerDisplayName = name;
    this.flush();
    return true;
  }

  valid(snapshot) {
    return !!snapshot && !!this.chapter.nodes[snapshot.nodeId]
      && this.normalizeStats(snapshot.stats)
      && Array.isArray(snapshot.flags) && snapshot.flags.every(flag => typeof flag === 'string')
      && Array.isArray(snapshot.returnNodes) && snapshot.returnNodes.every(id => this.chapter.nodes[id]);
  }

  clone(snapshot) {
    if (!this.valid(snapshot)) return null;
    return {
      nodeId: this.chapter.id === 'opening-demo-chapter-01'
        ? excludedJiangDestination(snapshot.nodeId, snapshot, this.hasJiangEligibility()) || snapshot.nodeId : snapshot.nodeId,
      stats: this.normalizeStats(snapshot.stats),
      flags: [...snapshot.flags],
      returnNodes: [...snapshot.returnNodes]
    };
  }

  isLegacyOpeningSnapshot(snapshot) {
    return this.chapter.id === 'opening-demo-chapter-01' && this.chapter.nodes.common_weekday_outing_selector
      && /^(common_acg_first_meet_|common_station_cafe_jyc_|com02j_|common_convenience_xu_|com01b_(bookstore_skip|cafe_))/.test(snapshot?.nodeId || '')
      && !snapshot.flags.some(flag => flag === 'preview:jyc-weekend-weekday' || flag === 'weekend_book_purchased'
        || flag === 'jyc_permanently_excluded' || flag.startsWith('history:common_bookstore_bridge_weekend_decision:')
        || flag.startsWith('entry-effect:common_weekend_home_'));
  }

  sanitizeCheckpoints(checkpoints) {
    return Object.fromEntries(Object.entries(checkpoints || {})
      .filter(([id, snapshot]) => id === snapshot?.nodeId && this.valid(snapshot))
      .filter(([id, snapshot]) => this.chapter.id !== 'opening-demo-chapter-01'
        || !excludedJiangDestination(id, snapshot, this.hasJiangEligibility()))
      .map(([id, snapshot]) => [id, this.clone(snapshot)]));
  }

  sanitizeEdges(edges) {
    return (Array.isArray(edges) ? edges : [])
      .filter(edge => Array.isArray(edge) && edge.length === 2 && edge.every(id => this.chapter.nodes[id]));
  }

  eventForSnapshot(snapshot) {
    if (!snapshot) return null;
    const event = memoryEventForNode(this.memories, snapshot.nodeId);
    if (this.chapter.id !== 'opening-demo-chapter-01' || !this.isCom02j(snapshot.nodeId)) return event;
    // Shared cafe tails belong to the actual encounter, with no live-state fallback.
    const first = !snapshot.flags.includes('history:cafe-bookstore-reunion') && (snapshot.nodeId.startsWith('common_station_cafe_jyc_first_')
      || snapshot.flags.includes('entry-effect:common_station_cafe_jyc_first_drawing_02')
      || snapshot.flags.includes('history:common_weekday_outing_decision:com01b_weekday_cafe_first')
      || (this.isLegacyOpeningSnapshot(snapshot) && snapshot.stats.jyc_first_topic === 0
        && !snapshot.flags.includes('jyc_initiated_second_contact')));
    const id = first ? 'mem.opening.ch1.first-cafe-jyc' : 'mem.opening.ch1.station-cafe-jyc';
    return this.memories.events.find(item => item.id === id) || event;
  }

  progressRank(snapshot, event = this.eventForSnapshot(snapshot)) {
    if (this.isLegacyOpeningSnapshot(snapshot) && snapshot.nodeId.startsWith('com01b_')) return 140;
    if (this.chapter.id === 'opening-demo-chapter-01' && c1Outing(snapshot?.nodeId)) return 280;
    const continuationRank = this.openingContinuationRank(snapshot?.nodeId);
    if (continuationRank >= 0) return continuationRank;
    // COM03X keeps its accepted Memory/art binding; its continuation is later
    // than the convenience-store card even though that card's rank is 160.
    if (this.chapter.id === 'opening-demo-chapter-01' && this.isCom03x(snapshot?.nodeId)) return 200;
    return event?.progressRank ?? -1;
  }

  openingContinuationRank(nodeId) {
    if (this.chapter.id !== 'opening-demo-chapter-01' || !this.chapter.nodes[nodeId]) return -1;
    if (nodeId.startsWith('COM03M-')) return 240;
    if (nodeId.startsWith('OPEN-A-')) return 260;
    return -1;
  }

  isOpeningReviewBoundary(nodeId) {
    return this.chapter.id === 'opening-demo-chapter-01'
      && (/^OPEN-A-ENTRY-(?:PENDING-[XJ]|SOLO|REST|WAIT)$/.test(nodeId || '')
        || ['XT-04-COMPLETED-PREVIEW-STOP', 'JYC-05-COMPLETED-PREVIEW-STOP'].includes(nodeId));
  }

  isCom03x(nodeId) {
    return nodeId?.startsWith('common_package_xu_') || nodeId?.startsWith('com03x_');
  }

  isCom02j(nodeId) {
    return nodeId?.startsWith('common_station_cafe_jyc_') || nodeId?.startsWith('com02j_');
  }

  isCom03j(nodeId) {
    return nodeId?.startsWith('common_recommend_discord_jyc_') || nodeId === 'com03j_preview_complete';
  }

  resumeUncontactedCom03j() {
    if (this.chapter.id !== 'opening-demo-chapter-01' || !this.chapter.nodes.common_recommend_discord_jyc_no_contact_exit) return;
    let redirected = false;
    let frontierRedirected = false;
    let pruned = false;
    for (const [id, snapshot] of Object.entries(this.data.checkpoints)) {
      if (this.isCom03j(id) && !snapshot.flags.includes('contact_jyc')) {
        delete this.data.checkpoints[id];
        pruned = true;
      }
    }
    for (const key of ['cursor', 'frontier']) {
      const snapshot = this.data[key];
      if (this.isCom03j(snapshot?.nodeId) && !snapshot.flags.includes('contact_jyc')) {
        snapshot.nodeId = 'common_recommend_discord_jyc_no_contact_exit';
        if (key === 'frontier') {
          frontierRedirected = true;
          this.data.runComplete = false;
        }
        redirected = true;
      }
    }
    if (frontierRedirected) {
      this.data.frontierMemoryEventId = null;
      this.data.frontierRank = -1;
    }
    if (redirected || pruned) this.flush();
  }

  reopenCom03jAppend() {
    if (this.chapter.id !== 'opening-demo-chapter-01' || this.data.restartActive
      || this.data.com02jSupplement || this.data.com03jReplay) return;
    const frontier = this.data.frontier;
    if (this.data.runComplete && frontier?.nodeId === 'com03x_preview_complete'
      && this.chapter.nodes.com03x_preview_complete?.type === 'branch'
      && frontier.flags.includes('preview:com02j-complete')) {
      this.data.runComplete = false;
      this.flush();
    }
  }

  finishCom03jReplay() {
    const replay = this.data.com03jReplay;
    if (!replay) return null;
    this.data.cursor = this.clone(replay.returnCursor);
    this.data.com03jReplay = null;
    this.data.restartActive = replay.returnRestartActive === true;
    this.replaying = this.data.restartActive;
    this.flush();
    return this.restore(this.data.restartActive ? this.data.cursor : this.data.frontier || this.data.cursor);
  }

  loadCom02jSupplement(saved) {
    if (this.chapter.id !== 'opening-demo-chapter-01' || !this.chapter.nodes.common_station_cafe_jyc_enter) return;
    const pending = saved.com02jSupplement;
    if (pending && this.valid(pending.returnSnapshot) && this.valid(pending.entrySnapshot)
      && !jiangExcluded(pending.returnSnapshot) && !jiangExcluded(pending.entrySnapshot)
      && this.isCom03x(pending.returnSnapshot.nodeId) && pending.entrySnapshot.nodeId === 'common_station_cafe_jyc_enter') {
      this.data.com02jSupplement = { returnSnapshot: this.clone(pending.returnSnapshot), entrySnapshot: this.clone(pending.entrySnapshot), wasComplete: pending.wasComplete === true };
      this.data.runComplete = false;
      return;
    }
    const { cursor, frontier, restartActive, runComplete } = this.data;
    // Earlier ordinary Memory cursors and explicit restarts never reopen a world.
    if (restartActive || !cursor || !frontier || !this.isCom03x(cursor.nodeId)
      || cursor.nodeId !== frontier.nodeId || cursor.flags.includes('preview:com02j-complete')
      || frontier.flags.includes('preview:com02j-complete')
      || jiangExcluded(cursor) || jiangExcluded(frontier)
      || frontier.stats.met_jiang_yucheng <= 0) return;
    if (runComplete && this.chapter.nodes[cursor.nodeId]?.type !== 'route'
      && cursor.nodeId !== 'com03x_preview_complete') return;
    const predecessor = this.data.checkpoints.common_convenience_xu_exit_08;
    const entry = predecessor ? this.clone(predecessor) : {
      nodeId: 'common_station_cafe_jyc_enter', stats: { ...this.chapter.initialState,
        jyc_first_topic: frontier.stats.jyc_first_topic,
        met_jiang_yucheng: frontier.stats.met_jiang_yucheng,
        heard_station_cafe_from_jyc: frontier.stats.heard_station_cafe_from_jyc }, flags: [], returnNodes: []
    };
    entry.nodeId = 'common_station_cafe_jyc_enter';
    this.data.com02jSupplement = { returnSnapshot: this.clone(frontier), entrySnapshot: entry, wasComplete: runComplete };
    this.data.cursor = this.clone(entry);
    this.data.runComplete = false;
    this.flush();
  }

  completeCom02jSupplement(state) {
    const pending = this.data.com02jSupplement;
    if (!pending) return null;
    const returned = this.clone(pending.returnSnapshot);
    for (const key of ['F_JYC', 'T_JYC', 'C_JYC']) {
      returned.stats[key] += state[key] - pending.entrySnapshot.stats[key];
    }
    const added = [...state.flags].filter(flag => flag.startsWith('jyc_second_topic:')
      || ['contact_jyc', 'player_knows_jyc_name', 'jyc_knows_player_name', 'jyc_creator_work_seen', 'jyc_initiated_second_contact', 'preview:com02j-complete'].includes(flag));
    returned.flags = [...new Set([...returned.flags.filter(flag => !flag.startsWith('jyc_second_topic:')), ...added])];
    this.data.frontier = this.clone(returned);
    this.data.cursor = this.clone(returned);
    this.data.checkpoints[returned.nodeId] = this.clone(returned);
    this.data.com02jSupplement = null;
    this.data.runComplete = pending.wasComplete;
    this.reopenCom03jAppend();
    this.flush();
    return this.restore(returned);
  }

  deepestSnapshot(checkpoints, preferred = null) {
    const candidates = Object.values(checkpoints || {})
      .map((snapshot) => ({ snapshot, preferred: false }));
    if (preferred && this.valid(preferred)) candidates.push({ snapshot: preferred, preferred: true });
    let best = null;
    for (const candidate of candidates) {
      const { snapshot } = candidate;
      const event = this.eventForSnapshot(snapshot);
      if (!event && this.openingContinuationRank(snapshot.nodeId) < 0 && !this.isLegacyOpeningSnapshot(snapshot)) continue;
      if (
        !best
        || this.progressRank(snapshot, event) > this.progressRank(best.snapshot, best.event)
        || (this.progressRank(snapshot, event) === this.progressRank(best.snapshot, best.event) && candidate.preferred && !best.preferred)
      ) {
        best = { snapshot, event, preferred: candidate.preferred };
      }
    }
    return best;
  }

  load() {
    const saved = this.parse(this.key);
    if (saved?.version === 2) {
      this.data.jycEverUnlocked = saved.jycEverUnlocked === true;
      this.data.bookstoreEverEarned = saved.bookstoreEverEarned === true;
      this.data.initialEncounterEverEarned = saved.initialEncounterEverEarned === true || this.data.bookstoreEverEarned;
      this.data.unlockedMemoryEventIds = [...new Set((Array.isArray(saved.unlockedMemoryEventIds)
        ? saved.unlockedMemoryEventIds : []).filter(id => this.memories.events.some(event => event.id === id)))];
      this.data.playerDisplayName = normalizePlayerName(saved.playerDisplayName);
      this.data.checkpoints = this.sanitizeCheckpoints(saved.checkpoints);
      this.data.cursor = this.clone(saved.cursor);
      this.data.frontier = this.clone(saved.frontier);
      this.data.restartActive = saved.restartActive === true
        && !!this.data.cursor
        && this.chapter.nodes[this.data.cursor.nodeId]?.type !== 'route';
      this.replaying = this.data.restartActive || saved.replayActive === true;
      this.data.runComplete = saved.runComplete === true
        || (!this.data.restartActive && this.chapter.nodes[this.data.cursor?.nodeId]?.type === 'route');
      // This stable former Opening terminal now redirects to appended content.
      // Ordinary Memory replay cursors and actual route terminals remain complete.
      const cursorNode = this.chapter.nodes[this.data.cursor?.nodeId];
      if (this.chapter.id === 'opening-demo-chapter-01' && !this.replaying
        && saved.runComplete === true && this.data.cursor?.nodeId === 'opening_demo_complete'
        && this.data.frontier?.nodeId === 'common_convenience_xu_exit_08'
        && cursorNode?.type === 'branch' && this.chapter.nodes[cursorNode.default]) {
        this.data.runComplete = false;
        this.data.frontier = this.clone(this.data.cursor);
      }
      if (this.chapter.id === 'opening-demo-chapter-01' && !this.replaying
        && saved.runComplete === true && this.data.cursor?.nodeId === 'com03j_preview_complete'
        && cursorNode?.type === 'branch') {
        this.data.runComplete = false;
        this.data.frontier = this.clone(this.data.cursor);
      }
      this.data.edges = this.sanitizeEdges(saved.edges);
      const frontierEvent = this.eventForSnapshot(this.data.frontier);
      if (frontierEvent) {
        this.data.frontierMemoryEventId = frontierEvent.id;
        this.data.frontierRank = this.progressRank(this.data.frontier, frontierEvent);
      } else if (this.openingContinuationRank(this.data.frontier?.nodeId) >= 0) {
        this.data.frontierMemoryEventId = null;
        this.data.frontierRank = this.progressRank(this.data.frontier);
      } else if (this.isLegacyOpeningSnapshot(this.data.frontier)) {
        this.data.frontierMemoryEventId = null;
        this.data.frontierRank = this.progressRank(this.data.frontier);
      } else if (this.data.frontier?.nodeId !== 'common_recommend_discord_jyc_no_contact_exit') {
        const deepest = this.deepestSnapshot(this.data.checkpoints, this.data.cursor);
        if (deepest) {
          this.data.frontier = this.clone(deepest.snapshot);
          this.data.frontierMemoryEventId = deepest.event?.id || null;
          this.data.frontierRank = this.progressRank(deepest.snapshot, deepest.event);
        }
      }
      this.rememberUnlocks();
      this.loadCom02jSupplement(saved);
      this.resumeUncontactedCom03j();
      if (saved.com03jReplay && this.isCom03j(this.data.cursor?.nodeId)
        && this.valid(saved.com03jReplay.returnCursor) && !this.data.restartActive) {
        this.data.com03jReplay = { returnCursor: this.clone(saved.com03jReplay.returnCursor),
          returnRestartActive: saved.com03jReplay.returnRestartActive === true };
        this.replaying = true;
      }
      if (saved.c1Replay && (c1Outing(this.data.cursor?.nodeId)
        || this.openingContinuationRank(this.data.cursor?.nodeId) >= 0
        || this.chapter.nodes[this.data.cursor?.nodeId]?.type === 'route')
        && this.valid(saved.c1Replay.returnCursor) && !this.data.restartActive) {
        this.data.c1Replay = { returnCursor: this.clone(saved.c1Replay.returnCursor),
          returnRestartActive: saved.c1Replay.returnRestartActive === true,
          returnRunComplete: saved.c1Replay.returnRunComplete === true,
          returnReplayActive: saved.c1Replay.returnReplayActive === true };
        this.data.runComplete = this.data.c1Replay.returnRunComplete;
        this.replaying = true;
        // Older saves may have finished a predecessor replay without clearing
        // its protected return. A terminal cursor cannot resume that replay.
        if (this.chapter.nodes[this.data.cursor.nodeId].type === 'route') this.finishC1Replay();
      }
      if (!this.replaying && /^OPEN-A-ENTRY-PENDING-[XJ]$/.test(this.data.cursor?.nodeId || '')
        && this.chapter.nodes[this.data.cursor.nodeId]?.type === 'branch') this.data.runComplete = false;
      this.reopenCom03jAppend();
      this.rememberUnlocks();
      this.flush();
      return;
    }

    const legacy = this.parse(this.legacyKey);
    if (legacy?.version !== 1) return;
    this.data.checkpoints = this.sanitizeCheckpoints(legacy.checkpoints);
    this.data.cursor = this.clone(legacy.current);
    this.data.runComplete = this.chapter.nodes[this.data.cursor?.nodeId]?.type === 'route'
      || (this.chapter.id === 'opening-demo-chapter-01' && this.data.cursor?.nodeId === 'com03x_preview_complete');
    this.data.edges = this.sanitizeEdges(legacy.edges);
    const deepest = this.deepestSnapshot(this.data.checkpoints, this.data.cursor);
    if (deepest) {
      this.data.frontier = this.clone(deepest.snapshot);
      this.data.frontierMemoryEventId = deepest.event?.id || null;
      this.data.frontierRank = this.progressRank(deepest.snapshot, deepest.event);
    } else if (this.data.cursor) {
      this.data.frontier = this.clone(this.data.cursor);
    }
    this.rememberUnlocks();
    this.loadCom02jSupplement(legacy);
    this.resumeUncontactedCom03j();
    this.reopenCom03jAppend();
    this.rememberUnlocks();
    this.flush();
  }

  hasBookstoreEligibility() {
    return this.chapter.id === 'opening-demo-chapter-01' && this.data.bookstoreEverEarned;
  }

  hasJiangEligibility() {
    return this.chapter.id === 'opening-demo-chapter-01' && this.data.initialEncounterEverEarned;
  }

  earnedInitialEncounterSnapshot(snapshot) {
    if (this.earnedBookstoreSnapshot(snapshot)) return true;
    if (this.chapter.id !== 'opening-demo-chapter-01' || !this.valid(snapshot)) return false;
    return snapshot.stats.met_jiang_yucheng > 0
      && snapshot.flags.includes('jyc_creator_work_seen')
      && (snapshot.flags.includes('entry-effect:common_station_cafe_jyc_first_drawing_02')
        || (!jiangExcluded(snapshot) && snapshot.flags.includes('player_knows_jyc_name')
          && snapshot.flags.includes('jyc_knows_player_name')
          && snapshot.stats.jyc_first_topic === 0));
  }

  earnedBookstoreSnapshot(snapshot) {
    if (this.chapter.id !== 'opening-demo-chapter-01' || !this.valid(snapshot)) return false;
    if (snapshot.flags.includes('bookstore-encounter-complete')) return true;
    // Historical saves must prove the completed bookstore scene, never merely
    // its entry card, a selected topic, generic acquaintance or cafe contact.
    const completed = snapshot.nodeId === 'common_acg_first_meet_exit_locked_02'
      || snapshot.nodeId.startsWith('common_acg_first_meet_purchase')
      || !snapshot.nodeId.startsWith('common_acg_first_meet_');
    return completed && snapshot.stats.met_jiang_yucheng > 0
      && [1, 2, 3].includes(snapshot.stats.jyc_first_topic)
      && snapshot.stats.heard_station_cafe_from_jyc > 0
      && !jiangExcluded(snapshot);
  }

  rememberUnlocks(snapshot = null) {
    const snapshots = snapshot ? [snapshot] : [this.data.cursor, this.data.frontier, ...Object.values(this.data.checkpoints)];
    for (const item of snapshots.filter(item => this.valid(item))) {
      if (this.earnedBookstoreSnapshot(item)) this.data.bookstoreEverEarned = true;
      if (this.earnedInitialEncounterSnapshot(item)) this.data.initialEncounterEverEarned = true;
      if (this.chapter.id === 'opening-demo-chapter-01' && !jiangExcluded(item, this.hasJiangEligibility())
        && (item.stats.met_jiang_yucheng > 0 || item.flags.includes('contact_jyc'))) this.data.jycEverUnlocked = true;
      const event = this.eventForSnapshot(item);
      if ((this.isCom03j(item.nodeId) && !item.flags.includes('contact_jyc'))
        || (jiangExcluded(item, this.hasJiangEligibility()) && event?.characterIds?.includes('jiang_yucheng'))) continue;
      if (event && !this.data.unlockedMemoryEventIds.includes(event.id)) this.data.unlockedMemoryEventIds.push(event.id);
    }
  }

  canExtendMain(snapshot) {
    const main = this.data.frontier;
    if (!main || !this.replaying || this.chapter.id !== 'opening-demo-chapter-01') return true;
    // Rank orders scenes in time, not mutually exclusive playthroughs. A replay
    // may own later main progress only when it retains the main branch's facts.
    // Compare narrative facts, never relationship scores or merged snapshots.
    for (const key of ['met_xu_tang', 'met_jiang_yucheng']) {
      if (main.stats[key] > 0 && !(snapshot.stats[key] > 0)) return false;
    }
    if (!jiangExcluded(main) && jiangExcluded(snapshot)
      && (main.stats.met_jiang_yucheng > 0 || main.flags.includes('contact_jyc'))) return false;
    const retainedFacts = new Set(['weekend_book_purchased', 'jyc_permanently_excluded',
      'contact_xu', 'contact_jyc', 'player_knows_jyc_name', 'jyc_knows_player_name',
      'jyc_creator_work_seen']);
    return main.flags.every(flag => !(flag.startsWith('history:') || retainedFacts.has(flag))
      || snapshot.flags.includes(flag));
  }

  capture(nodeId, state, returnNodes) {
    const stats = Object.fromEntries(Object.keys(this.chapter.initialState)
      .map(key => [key, state[key] ?? this.chapter.initialState[key]]));
    const snapshot = { nodeId, stats, flags: [...state.flags], returnNodes: [...returnNodes] };
    this.rememberUnlocks(snapshot);
    this.data.cursor = this.clone(snapshot);
    if (!this.data.com03jReplay && !this.data.c1Replay) this.data.checkpoints[nodeId] = this.clone(snapshot);
    const event = this.eventForSnapshot(snapshot);
    const rank = this.progressRank(snapshot, event);
    // Week/window nodes have no Memory card. Persist their actual live cursor
    // without assigning it to the preceding Discord or convenience event.
    const continuation = this.openingContinuationRank(nodeId) >= 0
      && (!this.replaying || this.data.restartActive);
    const advancesFrontier = (event || continuation) && rank > this.data.frontierRank;
    if (!this.data.com02jSupplement && !this.data.com03jReplay && !this.data.c1Replay && this.canExtendMain(snapshot) && (event || continuation) && (
      !this.data.frontier
      || advancesFrontier
      || (!this.replaying && rank >= this.data.frontierRank && (continuation || event?.id === this.data.frontierMemoryEventId))
    )) {
      this.data.frontier = this.clone(snapshot);
      this.data.frontierMemoryEventId = event?.id || null;
      this.data.frontierRank = rank;
      if (this.replaying && advancesFrontier) {
        this.replaying = false;
        this.data.runComplete = false;
      }
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
    this.replaying = true;
    this.flush();
    return true;
  }

  beginReplay(snapshot = null) {
    // Opening continuation entries can replay into either C1 outing. Save the
    // live return before setCursor replaces it, and keep it on predecessor reload.
    const c1Entry = c1Outing(snapshot?.nodeId)
      || (this.openingContinuationRank(snapshot?.nodeId) >= 0
        && (this.data.c1Replay || c1Outing(this.data.cursor?.nodeId)));
    if (this.data.c1Replay && !c1Entry) this.finishC1Replay();
    if (this.chapter.id === 'opening-demo-chapter-01' && c1Entry
      && !this.data.c1Replay && this.valid(this.data.cursor || this.data.frontier)) {
      this.data.c1Replay = { returnCursor: this.clone(this.data.cursor || this.data.frontier),
        returnRestartActive: this.data.restartActive, returnRunComplete: this.data.runComplete,
        returnReplayActive: this.replaying };
    }
    if (this.chapter.id === 'opening-demo-chapter-01' && this.isCom03j(snapshot?.nodeId)
      && !this.data.com03jReplay && this.valid(this.data.cursor || this.data.frontier)) {
      this.data.com03jReplay = { returnCursor: this.clone(this.data.cursor || this.data.frontier),
        returnRestartActive: this.data.restartActive };
    }
    if (snapshot && !this.setCursor(snapshot)) return false;
    this.data.restartActive = false;
    this.replaying = true;
    this.flush();
    return true;
  }

  finishC1Replay() {
    const replay = this.data.c1Replay;
    if (!replay) return null;
    this.data.cursor = this.clone(replay.returnCursor);
    this.data.c1Replay = null;
    this.data.restartActive = replay.returnRestartActive;
    this.data.runComplete = replay.returnRunComplete;
    this.replaying = replay.returnReplayActive;
    this.flush();
    return this.restore(this.data.cursor);
  }

  beginFreshRun() {
    this.data.c1Replay = null;
    this.data.com03jReplay = null;
    this.data.restartActive = true;
    this.data.runComplete = false;
    this.replaying = true;
    this.flush();
  }

  finishRun() {
    this.data.restartActive = false;
    this.data.runComplete = true;
    this.replaying = false;
    this.flush();
  }

  endReplay() {
    if (this.data.c1Replay) this.finishC1Replay();
    this.replaying = false;
    this.flush();
  }

  connect(from, to) {
    if (this.data.com03jReplay || this.data.c1Replay) return;
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
    this.data.replayActive = this.replaying;
    try { this.storage.setItem(this.key, JSON.stringify(this.data)); this.persisted = true; }
    catch { this.persisted = false; }
  }
}
