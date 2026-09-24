import { ProgressStore } from './progress.js';
import { paintPreview, paintSprites, resolveVisual, setImage } from './visuals.js';
import { memoryEventById, memoryStats, renderMemories, titleBackdropVisual } from './memories.js';

export class GameEngine {
  constructor({ chapter, assetManifest, sceneLibrary, memoryLibrary }) {
    this.chapter = chapter;
    this.assets = assetManifest.assets;
    this.scenePools = sceneLibrary.pools || {};
    this.memoryLibrary = memoryLibrary || { schemaVersion: 1, sections: [], events: [] };
    this.memoryFilter = 'all';
    this.nodeId = chapter.startNode;
    this.state = this.createInitialState();
    this.isTyping = false;
    this.typingToken = 0;
    this.muted = localStorage.getItem('neighborMuted') === '1';
    this.audioContext = null;
    this.currentSpriteSignature = '';
    this.returnNodes = [];
    this.progress = new ProgressStore(chapter, this.memoryLibrary);
    this.previousNode = null;
    this.cgStorageKey = `${chapter.id}:cgUnlocks`;
    this.galleryEntries = Object.entries(this.assets)
      .filter(([, asset]) => ['cg', 'cinematic'].includes(asset.kind) && asset.gallery)
      .map(([id, asset]) => ({ id, ...asset }))
      .sort((a, b) => a.gallery.order - b.gallery.order);
    this.viewerIndex = -1;
    this.isCinematic = false;
    this.pendingMoment = '';
    this.els = this.collectElements();
  }

  collectElements() {
    const $ = (selector) => document.querySelector(selector);
    return {
      title: $('#title-screen'),
      game: $('#game-shell'),
      ending: $('#ending-screen'),
      gallery: $('#gallery-screen'),
      stage: $('#stage'),
      scene: $('#scene-image'),
      sceneVideo: $('#scene-video'),
      characterLayer: $('#character-layer'),
      dialoguePanel: $('#dialogue-panel'),
      speaker: $('#speaker'),
      text: $('#dialogue-text'),
      hint: $('#advance-hint'),
      choices: $('#choice-list'),
      track: $('#chapter-track'),
      moment: $('#moment-card'),
      titleArt: $('#title-art'),
      titleCharacters: $('#title-character-layer'),
      resumeLabel: $('#resume-label'),
      memories: $('#memories-screen'),
      memoriesButton: $('#memories-button'),
      memoriesTitleCount: $('#memories-title-count'),
      memoriesBack: $('#memories-back'),
      memoriesCurrent: $('#memories-current'),
      memoryList: $('#memory-list'),
      memorySummary: $('#memory-summary'),
      memoryFilters: $('#memory-filters'),
      gameMemories: $('#game-memories-button'),
      endingArt: $('#ending-art'),
      endingTitle: $('#ending-title'),
      endingText: $('#ending-text'),
      endingCount: $('#ending-count'),
      startButton: $('#start-button'),
      titleMute: $('#title-mute'),
      muteButton: $('#mute-button'),
      cinematicSkip: $('#cinematic-skip'),
      galleryButton: $('#gallery-button'),
      galleryTitleCount: $('#gallery-title-count'),
      galleryProgress: $('#gallery-progress'),
      galleryGrid: $('#cg-grid'),
      galleryBack: $('#gallery-back'),
      viewer: $('#cg-viewer'),
      viewerImage: $('#cg-viewer-image'),
      viewerVideo: $('#cg-viewer-video'),
      viewerTitle: $('#cg-viewer-title'),
      viewerChapter: $('#cg-viewer-chapter'),
      viewerPosition: $('#cg-viewer-position'),
      viewerClose: $('#cg-viewer-close'),
      viewerPrev: $('#cg-viewer-prev'),
      viewerNext: $('#cg-viewer-next')
    };
  }

  createInitialState() {
    return { ...this.chapter.initialState, flags: new Set() };
  }

  asset(id, expectedKind) {
    const asset = this.assets[id];
    if (!asset) throw new Error(`Unknown asset: ${id}`);
    if (expectedKind && asset.kind !== expectedKind) {
      throw new Error(`Asset ${id} must be ${expectedKind}, received ${asset.kind}`);
    }
    return asset;
  }

  mount() {
    const endingArt = this.asset(this.chapter.endingArt, 'cg');
    setImage(this.els.endingArt, endingArt.src, endingArt.focus);
    this.migrateCGUnlocks();
    this.updateGalleryProgress();
    this.updateMemoryProgress();
    this.els.startButton.disabled = false;
    this.refreshTitle();
    this.bindEvents();
    this.updateMute();
  }

  bindEvents() {
    this.els.startButton.addEventListener('click', () => this.resumeGame());
    document.querySelector('#replay-button').addEventListener('click', () => this.openMemories());
    document.querySelector('#home-button').addEventListener('click', () => this.showOnly(this.els.title));
    document.querySelector('#game-home-button').addEventListener('click', () => this.showOnly(this.els.title));
    this.els.memoriesButton.addEventListener('click', () => this.openMemories());
    this.els.gameMemories.addEventListener('click', () => this.openMemories());
    this.els.memoriesBack.addEventListener('click', () => this.closeMemories());
    this.els.memoriesCurrent.addEventListener('click', () => this.scrollToFrontier());
    this.els.galleryButton.addEventListener('click', () => this.openGallery());
    this.els.galleryBack.addEventListener('click', () => this.closeGallery());
    this.els.viewerClose.addEventListener('click', () => this.closeViewer());
    this.els.cinematicSkip.addEventListener('click', () => this.finishCinematic(true));
    this.els.viewerPrev.addEventListener('click', () => this.moveViewer(-1));
    this.els.viewerNext.addEventListener('click', () => this.moveViewer(1));
    this.els.viewer.addEventListener('click', (event) => {
      if (event.target === this.els.viewer) this.closeViewer();
    });
    this.els.viewer.addEventListener('close', () => {
      this.els.viewerVideo.pause();
      this.viewerIndex = -1;
    });
    document.querySelector('#advance-zone').addEventListener('click', () => this.advance());
    this.els.dialoguePanel.addEventListener('click', (event) => {
      if (!event.target.closest('button')) this.advance();
    });
    [this.els.titleMute, this.els.muteButton].forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        this.muted = !this.muted;
        this.updateMute();
      });
    });
    window.addEventListener('keydown', (event) => {
      if (this.els.viewer.open) {
        if (event.key === 'ArrowLeft') this.moveViewer(-1);
        if (event.key === 'ArrowRight') this.moveViewer(1);
        return;
      }
      if (!this.els.gallery.classList.contains('is-hidden')) {
        if (event.key === 'Escape') this.closeGallery();
        return;
      }
      if (!this.els.memories.classList.contains('is-hidden')) {
        if (event.key === 'Escape') this.closeMemories();
        return;
      }
      if (this.els.game.classList.contains('is-hidden')) return;
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        this.advance();
      }
      if (/^[1-9]$/.test(event.key)) {
        this.els.choices.querySelectorAll('button')[Number(event.key) - 1]?.click();
      }
      if (event.key.toLowerCase() === 'm') {
        this.muted = !this.muted;
        this.updateMute();
      }
    });
  }

  showOnly(screen) {
    if (screen !== this.els.game) {
      this.typingToken += 1;
      this.isTyping = false;
      this.stopCinematic();
    }
    [this.els.title, this.els.game, this.els.ending, this.els.gallery, this.els.memories]
      .forEach((element) => element.classList.toggle('is-hidden', element !== screen));
    if (screen === this.els.title) {
      this.updateGalleryProgress();
      this.updateMemoryProgress();
      this.refreshTitle();
    }
  }

  updateMute() {
    this.els.titleMute.textContent = this.muted ? '×' : '♪';
    this.els.titleMute.setAttribute('aria-pressed', String(this.muted));
    this.els.titleMute.setAttribute('aria-label', this.muted ? '開啟聲音' : '關閉聲音');
    this.els.muteButton.textContent = this.muted ? '×' : '♪';
    this.els.muteButton.setAttribute('aria-pressed', String(this.muted));
    localStorage.setItem('neighborMuted', this.muted ? '1' : '0');
    this.els.sceneVideo.muted = this.muted;
    this.els.viewerVideo.muted = this.muted;
  }

  storedSet(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return new Set(Array.isArray(value) ? value : []);
    } catch (_) {
      return new Set();
    }
  }

  migrateCGUnlocks() {
    if (localStorage.getItem(this.cgStorageKey) !== null) return;
    const unlocked = new Set();
    const completed = localStorage.getItem(`${this.chapter.id}:completed`) === '1';
    const endings = this.storedSet(`${this.chapter.id}:endings`);
    if (completed) {
      this.galleryEntries
        .filter((entry) => entry.gallery.order <= 90)
        .forEach((entry) => unlocked.add(entry.id));
    }
    if (endings.has('heart') || endings.has('lover')) unlocked.add('cg.ch03.close_conversation');
    if (endings.has('lover')) {
      unlocked.add('cg.ch04.hallway_pause');
      unlocked.add('cg.ch04.sunday_morning');
    }
    localStorage.setItem(this.cgStorageKey, JSON.stringify([...unlocked]));
  }

  unlockedCGs() {
    return this.storedSet(this.cgStorageKey);
  }

  unlockCG(id) {
    const asset = this.assets[id];
    if (!asset?.gallery) return;
    const unlocked = this.unlockedCGs();
    if (!unlocked.has(id)) {
      unlocked.add(id);
      localStorage.setItem(this.cgStorageKey, JSON.stringify([...unlocked]));
    }
    this.updateGalleryProgress();
  }

  updateGalleryProgress() {
    const unlocked = this.unlockedCGs();
    const count = this.galleryEntries.filter((entry) => unlocked.has(entry.id)).length;
    const label = `${count} / ${this.galleryEntries.length}`;
    this.els.galleryTitleCount.textContent = label;
    this.els.galleryProgress.textContent = `已解鎖 ${label}`;
  }

  updateMemoryProgress() {
    const stats = memoryStats(this.memoryLibrary, this.progress, this.chapter.startNode);
    this.els.memoriesTitleCount.textContent = `${stats.unlocked} / ${stats.total}`;
  }

  openGallery() {
    this.renderGallery();
    this.showOnly(this.els.gallery);
    this.els.galleryBack.focus({ preventScroll: true });
  }

  closeGallery() {
    this.showOnly(this.els.title);
    this.els.galleryButton.focus({ preventScroll: true });
  }

  renderGallery() {
    const unlocked = this.unlockedCGs();
    this.els.galleryGrid.replaceChildren();
    this.galleryEntries.forEach((entry, index) => {
      const isUnlocked = unlocked.has(entry.id);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `cg-card${isUnlocked ? '' : ' is-locked'}`;
      card.disabled = !isUnlocked;
      card.setAttribute('aria-label', isUnlocked
        ? `查看 ${entry.gallery.title}`
        : `CG ${index + 1} 尚未解鎖`);

      const art = document.createElement('span');
      art.className = 'cg-card-art';
      if (isUnlocked) {
        const image = document.createElement('img');
        setImage(image, entry.kind === 'cinematic' ? entry.poster : entry.src, entry.focus);
        image.alt = '';
        image.loading = 'lazy';
        const focus = entry.focus || { x: 50, y: 50 };
        image.style.objectPosition = `${focus.x}% ${focus.y}%`;
        art.append(image);
      } else {
        const lock = document.createElement('span');
        lock.className = 'cg-lock';
        lock.textContent = '◇';
        lock.setAttribute('aria-hidden', 'true');
        art.append(lock);
      }

      const number = document.createElement('span');
      number.className = 'cg-card-number';
      number.textContent = entry.kind === 'cinematic'
        ? '動態回憶'
        : `CG ${String(index + 1).padStart(2, '0')}`;
      const meta = document.createElement('span');
      meta.className = 'cg-card-meta';
      const chapter = document.createElement('span');
      chapter.className = 'cg-card-chapter';
      chapter.textContent = isUnlocked ? entry.gallery.chapter : '？？？';
      const title = document.createElement('span');
      title.className = 'cg-card-title';
      title.textContent = isUnlocked ? entry.gallery.title : '尚未解鎖';
      meta.append(chapter, title);
      card.append(art, number, meta);
      if (isUnlocked) card.addEventListener('click', () => this.openViewer(entry.id));
      this.els.galleryGrid.append(card);
    });
    this.updateGalleryProgress();
  }

  unlockedGalleryEntries() {
    const unlocked = this.unlockedCGs();
    return this.galleryEntries.filter((entry) => unlocked.has(entry.id));
  }

  openViewer(id) {
    const entries = this.unlockedGalleryEntries();
    this.viewerIndex = entries.findIndex((entry) => entry.id === id);
    if (this.viewerIndex < 0) return;
    this.renderViewer();
    this.els.viewer.showModal();
    this.els.viewerClose.focus({ preventScroll: true });
  }

  closeViewer() {
    this.els.viewerVideo.pause();
    if (this.els.viewer.open) this.els.viewer.close();
    this.viewerIndex = -1;
  }

  moveViewer(direction) {
    const entries = this.unlockedGalleryEntries();
    const next = this.viewerIndex + direction;
    if (next < 0 || next >= entries.length) return;
    this.viewerIndex = next;
    this.renderViewer();
  }

  renderViewer() {
    const entries = this.unlockedGalleryEntries();
    const entry = entries[this.viewerIndex];
    if (!entry) return;
    this.els.viewerVideo.pause();
    if (entry.kind === 'cinematic') {
      this.els.viewerImage.classList.add('is-hidden');
      this.els.viewerVideo.classList.remove('is-hidden');
      this.els.viewerVideo.poster = entry.poster;
      this.els.viewerVideo.setAttribute('aria-label', entry.gallery.title);
      this.setVideoSources(this.els.viewerVideo, entry.sources);
      this.els.viewerVideo.muted = this.muted;
      this.els.viewerVideo.play().catch(() => {});
    } else {
      this.els.viewerVideo.classList.add('is-hidden');
      this.els.viewerImage.classList.remove('is-hidden');
      setImage(this.els.viewerImage, entry.src, entry.focus);
      this.els.viewerImage.alt = entry.gallery.title;
    }
    this.els.viewerTitle.textContent = entry.gallery.title;
    this.els.viewerChapter.textContent = entry.gallery.chapter;
    this.els.viewerPosition.textContent = `${this.viewerIndex + 1} / ${entries.length}`;
    this.els.viewerPrev.disabled = this.viewerIndex === 0;
    this.els.viewerNext.disabled = this.viewerIndex === entries.length - 1;
  }

  tone(kind = 'tap') {
    if (this.muted) return;
    try {
      this.audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const settings = {
        tap: [520, 0.06, 'sine'],
        choice: [620, 0.12, 'sine'],
        blackout: [90, 0.35, 'sawtooth'],
        soft: [440, 0.28, 'sine'],
        light: [760, 0.12, 'triangle'],
        message: [880, 0.16, 'sine']
      }[kind] || [520, 0.06, 'sine'];
      oscillator.type = settings[2];
      oscillator.frequency.value = settings[0];
      gain.gain.setValueAtTime(kind === 'blackout' ? 0.018 : 0.035, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + settings[1]);
      oscillator.connect(gain).connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + settings[1]);
    } catch (_) {
      // Audio is optional and must never block the story.
    }
  }

  preloadAssets() {
    Object.values(this.assets).forEach((asset) => {
      const src = asset.kind === 'cinematic' ? asset.poster : asset.src;
      if (!src) return;
      const image = new Image();
      image.src = src;
    });
  }

  setVideoSources(video, sources = {}) {
    const signature = JSON.stringify(sources);
    if (video.dataset.sources === signature) return;
    video.replaceChildren();
    Object.entries(sources).forEach(([type, src]) => {
      const source = document.createElement('source');
      source.src = src;
      source.type = `video/${type}`;
      video.append(source);
    });
    video.dataset.sources = signature;
    video.load();
  }

  startCinematic(asset, visual) {
    const pendingMoment = this.pendingMoment;
    this.stopCinematic();
    this.pendingMoment = pendingMoment;
    this.setScene(
      { src: asset.poster, focus: asset.focus },
      { ...visual, assetId: `${visual.asset}:poster` }
    );
    this.renderSprites([]);
    this.setVideoSources(this.els.sceneVideo, asset.sources);
    this.els.sceneVideo.poster = asset.poster;
    const focus = visual.focus || asset.focus || { x: 50, y: 45 };
    this.els.sceneVideo.style.setProperty('--focus-x', `${focus.x}%`);
    this.els.sceneVideo.style.setProperty('--focus-y', `${focus.y}%`);
    this.els.sceneVideo.muted = this.muted;
    this.els.sceneVideo.currentTime = 0;
    this.els.sceneVideo.classList.add('is-active');
    this.els.stage.classList.add('is-cinematic-playing');
    this.els.cinematicSkip.classList.remove('is-hidden');
    this.isCinematic = true;
    this.els.sceneVideo.onended = () => this.finishCinematic(false);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.els.sceneVideo.classList.remove('is-active');
      this.finishCinematic(false);
      return;
    }
    this.els.sceneVideo.play().catch(() => this.finishCinematic(false));
  }

  finishCinematic(skipped = false) {
    if (!this.isCinematic) return;
    this.isCinematic = false;
    this.els.sceneVideo.onended = null;
    if (skipped) {
      this.els.sceneVideo.pause();
      this.els.sceneVideo.classList.remove('is-active');
    }
    this.els.stage.classList.remove('is-cinematic-playing');
    this.els.cinematicSkip.classList.add('is-hidden');
    if (this.pendingMoment) {
      this.renderMoment(this.pendingMoment);
      this.pendingMoment = '';
    }
  }

  stopCinematic() {
    this.isCinematic = false;
    this.pendingMoment = '';
    this.els.sceneVideo.onended = null;
    this.els.sceneVideo.pause();
    this.els.sceneVideo.classList.remove('is-active');
    this.els.stage.classList.remove('is-cinematic-playing');
    this.els.cinematicSkip.classList.add('is-hidden');
  }

  setScene(asset, visual) {
    if (this.els.scene.dataset.assetId !== visual.assetId) {
      this.els.scene.classList.remove('is-loaded');
      setImage(this.els.scene, asset.src, visual.focus || asset.focus);
      this.els.scene.dataset.assetId = visual.assetId;
      this.els.scene.onload = () => this.els.scene.classList.add('is-loaded');
      if (this.els.scene.complete) this.els.scene.classList.add('is-loaded');
    }
    const focus = visual.focus || asset.focus || { x: 55, y: 42 };
    this.els.scene.style.setProperty('--focus-x', `${focus.x}%`);
    this.els.scene.style.setProperty('--focus-y', `${focus.y}%`);
  }

  renderSprites(sprites = []) {
    const signature = JSON.stringify(sprites);
    if (signature === this.currentSpriteSignature) return;
    this.currentSpriteSignature = signature;
    paintSprites(this.els.characterLayer, sprites, this.assets);
  }

  renderVisual(visual) {
    if (!visual) return;
    const resolved = resolveVisual(visual, this.assets);
    const effects = visual.effects || {};
    if (visual.mode === 'cg') {
      this.stopCinematic();
      const asset = this.asset(visual.asset, 'cg');
      this.unlockCG(visual.asset);
      this.setScene({ ...asset, src: resolved.src, focus: resolved.focus }, { ...visual, assetId: resolved.id });
      this.renderSprites([]);
    } else if (visual.mode === 'composite') {
      this.stopCinematic();
      const background = this.asset(visual.background, 'background');
      this.setScene({ ...background, src: resolved.src, focus: resolved.focus }, { ...visual, assetId: resolved.id });
      this.renderSprites(visual.sprites || []);
    } else if (visual.mode === 'cinematic') {
      const asset = this.asset(visual.asset, 'cinematic');
      this.unlockCG(visual.asset);
      this.startCinematic(asset, visual);
    } else {
      throw new Error(`Unsupported visual mode: ${visual.mode}`);
    }

    this.els.scene.classList.toggle('is-dark', !!effects.dark);
    this.els.scene.classList.remove('is-pushing');
    void this.els.scene.offsetWidth;
    if (effects.push) this.els.scene.classList.add('is-pushing');
    if (effects.flicker) {
      this.els.stage.classList.remove('is-flickering');
      void this.els.stage.offsetWidth;
      this.els.stage.classList.add('is-flickering');
    } else {
      this.els.stage.classList.remove('is-flickering');
    }
  }

  updateTrack(chapterIndex = 0) {
    this.els.track.replaceChildren();
    this.chapter.chapterLabels.forEach((label, index) => {
      const dot = document.createElement('span');
      dot.className = `chapter-dot${index === chapterIndex ? ' is-active' : ''}`;
      dot.title = label;
      this.els.track.append(dot);
    });
    this.els.track.setAttribute('aria-label', `故事進度：${this.chapter.chapterLabels[chapterIndex]}`);
  }

  async typeText(text) {
    const token = ++this.typingToken;
    this.isTyping = true;
    this.els.text.textContent = '';
    const characters = Array.from(text || '');
    for (let index = 0; index < characters.length; index += 1) {
      if (token !== this.typingToken) return;
      this.els.text.textContent += characters[index];
      if (index % 2 === 0) await new Promise((resolve) => setTimeout(resolve, 15));
    }
    if (token !== this.typingToken) return;
    this.isTyping = false;
    const node = this.chapter.nodes[this.nodeId];
    this.els.hint.textContent = node.choices ? '選擇回應' : '點擊繼續';
    if (node.choices) this.showChoices(node.choices);
  }

  revealText() {
    if (!this.isTyping) return false;
    this.typingToken += 1;
    this.isTyping = false;
    const node = this.chapter.nodes[this.nodeId];
    this.els.text.textContent = node.text || '';
    this.els.hint.textContent = node.choices ? '選擇回應' : '點擊繼續';
    if (node.choices) this.showChoices(node.choices);
    return true;
  }

  showChoices(choices) {
    this.els.choices.replaceChildren();
    this.els.choices.classList.remove('is-hidden');
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.innerHTML = `<small>${index + 1}</small>${choice.text}`;
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        Object.entries(choice.effects || {}).forEach(([key, value]) => {
          this.state[key] = (this.state[key] || 0) + value;
        });
        (choice.addFlags || []).forEach((flag) => this.state.flags.add(flag));
        this.tone('choice');
        this.nodeId = choice.next;
        this.render();
      });
      this.els.choices.append(button);
    });
    setTimeout(() => this.els.choices.querySelector('button')?.focus({ preventScroll: true }), 220);
  }

  renderMoment(text) {
    if (!text) {
      this.els.moment.classList.add('is-hidden');
      return;
    }
    this.els.moment.textContent = text;
    this.els.moment.classList.remove('is-hidden');
    setTimeout(() => this.els.moment.classList.add('is-hidden'), 2100);
  }

  render() {
    const node = this.chapter.nodes[this.nodeId];
    if (!node) throw new Error(`Unknown story node: ${this.nodeId}`);
    this.progress.connect(this.previousNode, this.nodeId);
    this.previousNode = this.nodeId;
    if (node.type === 'random') {
      const pool = this.scenePools[node.pool];
      if (!pool?.entries?.length) throw new Error(`Unknown or empty random pool: ${node.pool}`);
      const unseen = pool.entries.filter((entry) => !this.state.flags.has(entry.unlockFlag));
      const candidates = unseen.length ? unseen : pool.entries;
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      this.state.flags.add(selected.unlockFlag);
      this.returnNodes.push(node.after);
      this.nodeId = selected.entryNode;
      this.render();
      return;
    }
    if (node.type === 'return') {
      this.nodeId = this.returnNodes.pop();
      if (!this.nodeId) throw new Error('Return node has no pending destination');
      this.render();
      return;
    }
    if (node.type === 'branch') {
      const branchId = this.nodeId;
      const branch = (node.cases || []).find((candidate) =>
        (candidate.conditions || []).every((condition) => this.matchesCondition(condition))
      );
      this.nodeId = branch?.next || node.default;
      if (!this.nodeId) throw new Error(`Branch node ${branchId} has no matching destination`);
      this.render();
      return;
    }
    if (node.type === 'route') {
      this.progress.capture(this.nodeId, this.state, this.returnNodes);
      this.finish();
      return;
    }
    this.progress.capture(this.nodeId, this.state, this.returnNodes);
    this.els.choices.classList.add('is-hidden');
    this.els.choices.replaceChildren();
    this.els.speaker.textContent = node.speaker || '旁白';
    this.els.hint.textContent = '…';
    const isCinematicNode = node.visual?.mode === 'cinematic';
    if (isCinematicNode) this.pendingMoment = node.moment || '';
    this.renderVisual(node.visual);
    this.updateTrack(node.chapter || 0);
    if (!isCinematicNode) this.renderMoment(node.moment);
    if (node.tone) this.tone(node.tone);
    this.typeText(node.text);
  }

  advance() {
    const node = this.chapter.nodes[this.nodeId];
    if (!node || node.choices || this.isCinematic) return;
    if (this.revealText()) return;
    if (node.next) {
      this.tone('tap');
      this.nodeId = node.next;
      this.render();
    }
  }

  matchesCondition(condition) {
    const actual = this.state[condition.stat] || 0;
    const operations = {
      '>=': () => actual >= condition.value,
      '>': () => actual > condition.value,
      '<=': () => actual <= condition.value,
      '<': () => actual < condition.value,
      '==': () => actual === condition.value
    };
    return operations[condition.operator]?.() || false;
  }

  resolveEnding() {
    const rule = this.chapter.endingRules.find((candidate) =>
      candidate.default || candidate.conditions.every((condition) => this.matchesCondition(condition))
    );
    if (!rule) throw new Error('No ending rule matched');
    return rule.ending;
  }

  finish() {
    const key = this.resolveEnding();
    const ending = this.chapter.endings[key];
    const endingArt = this.asset(ending.art || this.chapter.endingArt, 'cg');
    this.unlockCG(ending.art || this.chapter.endingArt);
    const storageKey = `${this.chapter.id}:endings`;
    const unlocked = this.storedSet(storageKey);
    unlocked.add(key);
    localStorage.setItem(storageKey, JSON.stringify([...unlocked]));
    localStorage.setItem(`${this.chapter.id}:completed`, '1');
    this.els.endingTitle.textContent = ending.title;
    this.els.endingText.textContent = ending.text;
    setImage(this.els.endingArt, endingArt.src, endingArt.focus);
    const focus = endingArt.focus || { x: 55, y: 42 };
    this.els.endingArt.style.objectPosition = `${focus.x}% ${focus.y}%`;
    this.els.endingCount.textContent = `已解鎖 ${unlocked.size} / ${Object.keys(this.chapter.endings).length} 個結局`;
    this.showOnly(this.els.ending);
    this.tone('message');
  }

  startGame() {
    this.stopCinematic();
    this.state = this.createInitialState();
    this.returnNodes = [];
    this.nodeId = this.chapter.startNode;
    this.previousNode = null;
    this.showOnly(this.els.game);
    this.render();
  }

  resumeGame(snapshot = this.progress.data.frontier || this.progress.data.cursor) {
    const restored = this.progress.restore(snapshot);
    if (!restored) return this.startGame();
    this.stopCinematic();
    Object.assign(this, restored);
    this.previousNode = null;
    this.showOnly(this.els.game);
    this.render();
  }

  refreshTitle() {
    const snapshot = this.progress.data.frontier;
    const node = this.chapter.nodes[snapshot?.nodeId || this.chapter.startNode];
    const frontierEvent = memoryEventById(this.memoryLibrary, this.progress.data.frontierMemoryEventId);
    let visual = snapshot ? titleBackdropVisual(this.memoryLibrary, this.progress, this.assets) : null;
    let label = frontierEvent?.title
      || node?.mapLabel
      || node?.moment
      || this.chapter.chapterLabels[node?.chapter || 0]
      || '故事節點';

    if (!snapshot) {
      visual = { mode: 'cg', asset: this.chapter.titleArt };
      label = '搬進 17 樓';
    } else if (node?.type === 'route') {
      const restored = this.progress.restore(snapshot);
      if (restored) {
        const savedState = this.state;
        this.state = restored.state;
        const ending = this.chapter.endings[this.resolveEnding()];
        this.state = savedState;
        visual = { mode: 'cg', asset: ending.art || this.chapter.endingArt };
        label = ending.title;
      }
    }

    paintPreview(this.els.titleArt, this.els.titleCharacters, visual || node?.visual, this.assets);
    this.els.titleArt.alt = snapshot ? '目前最深故事進度的回憶畫面' : '17樓故事開場畫面';
    this.els.startButton.textContent = snapshot ? '繼續遊戲' : '開始遊戲';
    const characterId = frontierEvent?.characterIds?.[0];
    const characterLabel = characterId ? this.memoryLibrary.characterLabels?.[characterId] : null;
    this.els.resumeLabel.textContent = snapshot
      ? `目前進度 · ${characterLabel ? `${characterLabel} · ` : ''}${label}${this.progress.persisted === false ? '（儲存空間無法寫入）' : ''}`
      : '故事起點 · 搬進 17 樓';
  }

  renderMemoryList() {
    renderMemories({
      library: this.memoryLibrary,
      chapter: this.chapter,
      assets: this.assets,
      progress: this.progress,
      unlockedCGs: this.unlockedCGs(),
      container: this.els.memoryList,
      summary: this.els.memorySummary,
      filters: this.els.memoryFilters,
      activeFilter: this.memoryFilter,
      onFilter: (filter) => {
        this.memoryFilter = filter;
        this.renderMemoryList();
      },
      onReplay: (event) => this.replayMemory(event)
    });
    this.updateMemoryProgress();
  }

  openMemories() {
    this.renderMemoryList();
    this.showOnly(this.els.memories);
    this.els.memoriesBack.focus({ preventScroll: true });
  }

  closeMemories() {
    this.showOnly(this.els.title);
    this.els.memoriesButton.focus({ preventScroll: true });
  }

  scrollToFrontier() {
    const id = this.progress.data.frontierMemoryEventId;
    if (!id) return;
    this.els.memoryList.querySelector(`[data-memory-id="${id}"]`)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
  }

  replayMemory(event) {
    if (event.replayNode === this.chapter.startNode) {
      this.startGame();
      return;
    }
    const candidateIds = [event.replayNode, ...(event.unlockNodes || [])];
    const snapshot = candidateIds.map((id) => this.progress.data.checkpoints[id]).find(Boolean);
    if (snapshot) this.resumeGame(snapshot);
  }
}
