import { FALLBACK_ART } from './visuals.js';

export function orderedMemoryEvents(library) {
  return [...(library?.events || [])].sort((a, b) => a.order - b.order);
}

export function memoryEventForNode(library, nodeId) {
  if (!nodeId) return null;
  const matches = orderedMemoryEvents(library).filter((event) =>
    event.replayNode === nodeId || (event.unlockNodes || []).includes(nodeId)
  );
  return matches.sort((a, b) => b.progressRank - a.progressRank || b.order - a.order)[0] || null;
}

export function memoryEventById(library, id) {
  return (library?.events || []).find((event) => event.id === id) || null;
}

export function isMemoryUnlocked(event, progress, startNode) {
  if (!event) return false;
  if (event.replayNode === startNode) return true;
  const checkpoints = progress?.data?.checkpoints || {};
  return [event.replayNode, ...(event.unlockNodes || [])].some((nodeId) => !!checkpoints[nodeId]);
}

export function memoryStats(library, progress, startNode) {
  const events = orderedMemoryEvents(library);
  const unlocked = events.filter((event) => isMemoryUnlocked(event, progress, startNode));
  return { unlocked: unlocked.length, total: events.length };
}

export function memoryCoverVisual(event, assets) {
  if (!event?.cover?.asset) return null;
  const asset = assets[event.cover.asset];
  if (!asset) return null;
  const focus = event.cover.focus || asset.focus || { x: 50, y: 45 };
  if (asset.kind === 'background') {
    return { mode: 'composite', background: event.cover.asset, sprites: [], focus };
  }
  if (asset.kind === 'cinematic') {
    return { mode: 'cinematic', asset: event.cover.asset, focus };
  }
  return { mode: 'cg', asset: event.cover.asset, focus };
}

export function titleBackdropVisual(library, progress, assets) {
  const frontierEvent = memoryEventById(library, progress?.data?.frontierMemoryEventId);
  if (!frontierEvent) return null;

  if (frontierEvent.titleBackdropAsset) {
    const explicit = {
      ...frontierEvent,
      cover: { ...(frontierEvent.cover || {}), asset: frontierEvent.titleBackdropAsset }
    };
    const visual = memoryCoverVisual(explicit, assets);
    if (visual) return visual;
  }

  if ((frontierEvent.characterIds || []).length === 1) {
    const visual = memoryCoverVisual(frontierEvent, assets);
    if (visual) return visual;
  }

  const highlight = orderedMemoryEvents(library)
    .filter((event) =>
      event.highlight
      && event.progressRank <= (progress?.data?.frontierRank ?? -1)
      && isMemoryUnlocked(event, progress)
      && ['cg', 'cinematic'].includes(assets[event.cover?.asset]?.kind)
    )
    .sort((a, b) => b.progressRank - a.progressRank || b.order - a.order)[0];
  if (highlight) {
    const visual = memoryCoverVisual(highlight, assets);
    if (visual) return visual;
  }

  return memoryCoverVisual(frontierEvent, assets);
}

function coverSource(event, assets) {
  const asset = assets[event?.cover?.asset];
  if (!asset) return FALLBACK_ART;
  return asset.kind === 'cinematic' ? asset.poster : (asset.src || FALLBACK_ART);
}

function eventMatchesFilter(event, filter) {
  if (filter === 'all') return true;
  if (filter === 'highlight') return !!event.highlight;
  return (event.characterIds || []).includes(filter);
}

function sectionVisible(section, unlockedEvents, filter) {
  if (filter === 'all') return unlockedEvents.length > 0 || section.kind === 'common';
  return unlockedEvents.some((event) => eventMatchesFilter(event, filter));
}

export function renderMemories({
  library,
  chapter,
  assets,
  progress,
  unlockedCGs,
  container,
  summary,
  filters,
  activeFilter = 'all',
  onFilter,
  onReplay
}) {
  const sections = [...(library?.sections || [])].sort((a, b) => a.order - b.order);
  const events = orderedMemoryEvents(library);
  const unlocked = new Set(events.filter((event) => isMemoryUnlocked(event, progress, chapter.startNode)).map((event) => event.id));
  const stats = { unlocked: unlocked.size, total: events.length };
  summary.textContent = `已解鎖 ${stats.unlocked} / ${stats.total} 段回憶`;

  const unlockedEvents = events.filter((event) => unlocked.has(event.id));
  const characterIds = [...new Set(unlockedEvents.flatMap((event) => event.characterIds || []))];

  filters.replaceChildren();
  const filterOptions = [
    ['all', '全部'],
    ...characterIds.map((id) => [id, library.characterLabels?.[id] || id]),
    ...(unlockedEvents.some((event) => event.highlight) ? [['highlight', '心動']] : [])
  ];
  for (const [value, label] of filterOptions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `memory-filter${activeFilter === value ? ' is-active' : ''}`;
    button.textContent = label;
    button.setAttribute('aria-pressed', String(activeFilter === value));
    button.addEventListener('click', () => onFilter(value));
    filters.append(button);
  }

  container.replaceChildren();
  for (const section of sections) {
    const sectionEvents = events.filter((event) => event.sectionId === section.id);
    const sectionUnlocked = sectionEvents.filter((event) => unlocked.has(event.id));
    if (!sectionVisible(section, sectionUnlocked, activeFilter)) continue;

    const visibleUnlocked = sectionUnlocked.filter((event) => eventMatchesFilter(event, activeFilter));
    const firstLocked = activeFilter === 'all'
      ? sectionEvents.find((event) => !unlocked.has(event.id))
      : null;
    const visibleEvents = [...visibleUnlocked, ...(firstLocked && (sectionUnlocked.length || section.kind === 'common') ? [firstLocked] : [])]
      .sort((a, b) => a.order - b.order);
    if (!visibleEvents.length) continue;

    const sectionEl = document.createElement('section');
    sectionEl.className = 'memory-section';
    const heading = document.createElement('div');
    heading.className = 'memory-section-heading';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = section.kind === 'common' ? 'STORY' : section.kind === 'heroine' ? 'RELATIONSHIP' : 'SIDE MEMORY';
    const title = document.createElement('h3');
    title.textContent = section.title;
    heading.append(eyebrow, title);

    const cards = document.createElement('div');
    cards.className = 'memory-cards';
    for (const event of visibleEvents) {
      const isUnlocked = unlocked.has(event.id);
      const isFrontier = progress.data.frontierMemoryEventId === event.id;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `memory-card${isUnlocked ? '' : ' is-locked'}${isFrontier ? ' is-frontier' : ''}`;
      card.dataset.memoryId = event.id;
      card.disabled = !isUnlocked;
      card.setAttribute('aria-label', isUnlocked ? `重玩回憶：${event.title}` : '尚未發生的回憶');

      if (isUnlocked) {
        const image = document.createElement('img');
        image.className = 'memory-card-art';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.alt = '';
        image.src = coverSource(event, assets);
        const focus = event.cover?.focus || { x: 50, y: 45 };
        const mobileFocus = event.cover?.mobileFocus || focus;
        image.style.setProperty('--memory-focus-x', `${focus.x}%`);
        image.style.setProperty('--memory-focus-y', `${focus.y}%`);
        image.style.setProperty('--memory-mobile-focus-x', `${mobileFocus.x}%`);
        image.style.setProperty('--memory-mobile-focus-y', `${mobileFocus.y}%`);
        image.onerror = () => { image.onerror = null; image.src = FALLBACK_ART; };
        card.append(image);
      }

      const shade = document.createElement('span');
      shade.className = 'memory-card-shade';
      const body = document.createElement('span');
      body.className = 'memory-card-body';
      const meta = document.createElement('span');
      meta.className = 'memory-card-meta';
      meta.textContent = isUnlocked
        ? [event.highlight ? '♥ 心動回憶' : '已解鎖', isFrontier ? '目前最深進度' : '可重玩']
            .filter(Boolean).join(' · ')
        : '◇ 尚未發生的回憶';
      const cardTitle = document.createElement('strong');
      cardTitle.textContent = isUnlocked ? event.title : '???';
      const description = document.createElement('span');
      description.className = 'memory-card-summary';
      description.textContent = isUnlocked ? event.summary : '故事還會繼續。';
      body.append(meta, cardTitle, description);

      if (isUnlocked && (event.galleryAssets || []).length) {
        const cg = document.createElement('span');
        cg.className = 'memory-card-cg';
        const unlockedCount = event.galleryAssets.filter((id) => unlockedCGs.has(id)).length;
        cg.textContent = `CG ${unlockedCount} / ${event.galleryAssets.length}`;
        body.append(cg);
      }
      card.append(shade, body);
      if (isUnlocked) card.addEventListener('click', () => onReplay(event));
      cards.append(card);
    }
    sectionEl.append(heading, cards);
    container.append(sectionEl);
  }
  return stats;
}
