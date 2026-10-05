import { isMemoryUnlocked, memoryEventById, renderMemories } from './memories.js';
/* STORY_MAP_REVIEW_IMPORT */

// Projection only: this module never writes ProgressStore or evaluates gameplay choices.
export function groupForNode(map, nodeId) {
  return map?.groups.find(group => group.variants.some(variant => variant.nodeIds.includes(nodeId)));
}

export function storyMapView(map, library, chapter, progress, review = false) {
  const checkpoints = progress.data.checkpoints;
  const firstForMemory = new Map();
  for (const group of map.groups) for (const variant of group.variants) {
    if (variant.memoryId && !firstForMemory.has(variant.memoryId)) firstForMemory.set(variant.memoryId, group.id);
  }
  const firstLocked = library.events.toSorted((a, b) => a.order - b.order)
    .find(event => !isMemoryUnlocked(event, progress, chapter.startNode));
  const frontierGroup = groupForNode(map, progress.data.frontier?.nodeId)?.id;
  const cursorGroup = groupForNode(map, progress.data.cursor?.nodeId)?.id;
  const groups = map.groups.flatMap(group => {
    const variants = group.variants.filter(variant => review || (!variant.checkpointOnly && variant.memoryId && firstForMemory.get(variant.memoryId) === group.id
      ? isMemoryUnlocked(memoryEventById(library, variant.memoryId), progress, chapter.startNode)
      : (variant.unlockNodes || variant.nodeIds).some(id => checkpoints[id])));
    if (!review && !variants.length && group.variants.every(v => v.checkpointOnly)) {
      const known = group.variants.find(v => isMemoryUnlocked(memoryEventById(library, v.memoryId), progress, chapter.startNode));
      if (known) variants.push({ ...known, id: 'historical', label: '已讀部分', condition: undefined,
        entry: memoryEventById(library, known.memoryId).replayNode });
    }
    const locked = !review && !variants.length;
    if (locked && !group.variants.some(v => v.memoryId === firstLocked?.id && firstForMemory.get(v.memoryId) === group.id)) return [];
    const shown = locked ? [] : variants;
    const memory = shown.map(v => memoryEventById(library, v.memoryId)).find(Boolean);
    return [{ ...group, variants: shown, locked,
      memoryId: memory && firstForMemory.get(memory.id) === group.id ? memory.id
        : locked ? firstLocked.id : null,
      frontier: group.id === frontierGroup || (!frontierGroup && group.variants.some(v => v.memoryId === progress.data.frontierMemoryEventId)),
      reading: group.id === cursorGroup && cursorGroup !== frontierGroup }];
  });
  if (review) return { groups, edges: map.edges };
  // Only journeys actually traversed get a line. Checkpoints alone do not imply a connection.
  const next = new Map();
  for (const [from, to] of progress.data.edges || []) {
    if (!next.has(from)) next.set(from, []);
    next.get(from).push(to);
  }
  const edges = [];
  for (const [from, targets] of next) {
    const source = groupForNode(map, from)?.id;
    if (!source) continue;
    const pending = targets.map(id => ({ id, label: chapter.nodes[from]?.choices?.find(c => c.next === id)?.text })), seen = new Set();
    while (pending.length) {
      const { id, label } = pending.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      const target = groupForNode(map, id)?.id;
      if (target && target !== source) {
        if (groups.some(g => g.id === target && !g.locked) && !edges.some(e => e.from === source && e.to === target)) edges.push({ from: source, to: target, ...(label ? { label } : {}) });
      } else if (!target) pending.push(...(next.get(id) || []).map(id => ({ id, label })));
    }
  }
  return { groups, edges };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function button(text, action, className = 'text-button') {
  const node = el('button', className, text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

export function createStoryMap(engine) {
  const inspector = document.querySelector('#story-inspector');
  const controls = document.querySelector('#story-map-controls');
  let layout = window.matchMedia('(max-width: 760px)').matches ? 'list' : 'flow';
  let selected = null, selectedVariant = null, lastOptions, frame = 0;
  const controller = { review: false, notes: {}, render, refresh: () => engine.renderMemoryList() };
  const layoutButtons = ['flow', 'list'].map(mode => {
    const control = button(mode === 'flow' ? '流程圖' : '章節清單', () => {
      layout = mode;
      render(lastOptions);
    }, 'memory-filter');
    controls.append(control);
    return control;
  });
  const reviewInstaller = /* STORY_MAP_REVIEW_FACTORY */ null;
  reviewInstaller?.(controller, controls, engine.chapter);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !inspector.hidden && !engine.els.memories.classList.contains('is-hidden')) {
      inspector.querySelector('.story-inspector-close')?.click();
    }
  });
  const resize = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(drawLines);
  });
  resize.observe(engine.els.memoryList);
  engine.els.memoryList.addEventListener('toggle', () => requestAnimationFrame(drawLines), true);

  function render(options) {
    lastOptions = options;
    controller.revision = options.map?.revision || 'current';
    if (!options.map) return renderMemories(options);
    // Keep the existing character filters, disclosures and explored counts.
    // The temporary legacy cards never enter the visible DOM.
    const scratch = el('div');
    const stats = renderMemories({ ...options, container: scratch });
    if (controller.review) {
      options.filters.replaceChildren();
      const filterValues = [['all', '全部'], ...Object.entries(options.library.characterLabels || {}), ['highlight', '心動']];
      for (const [value, label] of filterValues) {
        const control = button(label, () => options.onFilter(value), 'memory-filter');
        control.setAttribute('aria-pressed', String(value === options.activeFilter)); options.filters.append(control);
      }
      options.filters.parentElement.querySelector('.memory-character-context')?.remove();
    }
    const view = storyMapView(options.map, options.library, options.chapter, options.progress, controller.review);
    const filter = options.activeFilter;
    const visible = view.groups.filter(group => filter === 'all' || group.variants.some(v => {
      const event = memoryEventById(options.library, v.memoryId);
      return filter === 'highlight' ? event?.highlight : v.characterIds.includes(filter);
    }));
    options.container.classList.add('story-map-list');
    options.container.dataset.layout = layout;
    layoutButtons.forEach((control, i) => control.setAttribute('aria-pressed', String(layout === ['flow', 'list'][i])));
    options.container.replaceChildren();
    for (const section of options.library.sections) {
      const groups = visible.filter(g => g.variants[0]?.sectionId === section.id || g.locked);
      if (!groups.length) continue;
      const details = el('details', 'memory-section-disclosure');
      const defaultSections = options.expandedSections || new Set([section.id]);
      details.open = defaultSections.has(section.id);
      details.addEventListener('toggle', () => options.onToggleSection(section.id, details.open, defaultSections));
      const heading = el('summary', 'memory-section-heading');
      heading.append(el('h3', '', section.title), el('span', 'memory-section-meta', controller.review ? '完整劇情・唯讀審閱' : `已探索 ${groups.filter(g => !g.locked).length} 個場景`));
      const canvas = el('div', 'story-map-canvas');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('story-map-lines');
      svg.setAttribute('aria-hidden', 'true');
      canvas.append(svg);
      const rows = [...new Set(groups.map(g => g.row))].sort((a,b) => a-b);
      for (const rowNumber of rows) {
        const row = el('div', 'story-map-row');
        for (const group of groups.filter(g => g.row === rowNumber)) {
          const card = el('button', `memory-card story-scene${group.locked ? ' is-locked' : ''}${group.frontier ? ' is-frontier' : ''}${group.reading ? ' is-reading' : ''}`);
          card.type = 'button';
          card.dataset.groupId = group.id;
          if (group.memoryId) card.dataset.memoryId = group.memoryId;
          card.dataset.lane = group.lane;
          card.disabled = group.locked;
          card.setAttribute('aria-label', group.locked ? '尚未發生的回憶' : `檢視場景：${group.title}`);
          card.setAttribute('aria-pressed', String(selected === group.id));
          const body = el('span', 'memory-card-body');
          body.append(el('span', 'memory-card-meta', group.locked ? '尚未發生' : controller.review ? '已實作' : '已探索'), el('strong', '', group.locked ? '???' : group.title), el('span', 'memory-card-summary', group.locked ? '故事還會繼續。' : group.summary));
          if (controller.review && controller.notes[group.id]) body.append(el('span', 'story-pending-badge', '待修改'));
          if (controller.review) for (const v of group.variants.filter(v => v.condition)) {
            body.append(el('span', 'story-condition-badge', `${group.variants.length > 1 ? `${v.label}：` : ''}${v.condition}`));
          }
          if (group.variants.length > 1) body.append(el('span', 'story-variant-count', `${group.variants.length} 個入口版本`));
          card.append(body);
          if (!group.locked) card.addEventListener('click', () => {
            selected = group.id; selectedVariant = null;
            options.container.querySelectorAll('.story-scene').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.groupId === selected)));
            showDetails(group, options);
            inspector.querySelector('.story-inspector-close').focus({ preventScroll: true });
          });
          row.append(card);
        }
        canvas.append(row);
      }
      const continuations = el('div', 'story-continuations');
      for (const edge of view.edges) {
        const from = groups.find(g => g.id === edge.from), to = visible.find(g => g.id === edge.to);
        if (!from || !to || (layout === 'flow' && to.row === from.row + 1)) continue;
        continuations.append(button(`${to.row < from.row ? '返回場景：' : ''}${from.title} → ${to.title}${edge.label ? `：${edge.label}` : ''}`, () => {
          const card = options.container.querySelector(`[data-group-id="${to.id}"]`);
          if (card && !card.disabled) { card.focus({ preventScroll: true }); card.click(); }
        }, 'story-continuation'));
      }
      details.append(heading, canvas, continuations);
      options.container.append(details);
    }
    options.summary.textContent = controller.review ? '完整故事流程・切換場景檢視現有劇本' : `已探索 ${view.groups.filter(g => !g.locked).length} 個場景`;
    if (selected) {
      const current = visible.find(g => g.id === selected && !g.locked);
      if (current) showDetails(current, options);
      else { selected = null; inspector.hidden = true; inspector.replaceChildren(); }
    }
    requestAnimationFrame(drawLines);
    return stats;
  }

  function showDetails(group, options) {
    inspector.hidden = false;
    inspector.replaceChildren();
    inspector.scrollTop = 0;
    const close = button('關閉詳情', () => {
      inspector.hidden = true; selected = null;
      const card = options.container.querySelector(`[data-group-id="${group.id}"]`);
      card?.setAttribute('aria-pressed', 'false'); card?.focus({ preventScroll: true }); inspector.replaceChildren();
    }, 'text-button story-inspector-close');
    inspector.append(close, el('p', 'eyebrow', 'SCENE'), el('h3', '', group.title), el('p', '', group.summary));
    const variants = el('div', 'story-variant-tabs');
    const variant = group.variants.find(v => v.id === selectedVariant) || group.variants[0];
    if (group.variants.length > 1) for (const v of group.variants) {
      const tab = button(v.label, () => { selectedVariant = v.id; showDetails(group, options); }, 'memory-filter');
      tab.setAttribute('aria-pressed', String(v.id === variant.id)); variants.append(tab);
    }
    inspector.append(variants);
    if (variant.condition && controller.review) inspector.append(el('p', 'story-condition', variant.condition));
    if (controller.review && controller.notes[group.id]) {
      inspector.append(el('h4', '', '待修改・尚未實作'), el('p', 'story-plan', controller.notes[group.id]));
    }
    const event = memoryEventById(options.library, variant.memoryId);
    const hasSnapshot = variant.nodeIds.some(id => options.progress.data.checkpoints[id]);
    if (!controller.review && hasSnapshot) {
      const replay = { ...(event || {}), replayNode: variant.entry, unlockNodes: variant.nodeIds };
      inspector.append(button('從此入口重玩', () => options.onReplay(replay), 'primary-button story-replay'));
    }
    const assets = variant.galleryAssets.filter(id => controller.review || options.unlockedCGs.has(id));
    if (assets.length) {
      inspector.append(el('h4', '', '場景畫面'));
      for (const id of assets) {
        const asset = options.assets[id];
        if (!asset) continue;
        const img = el('img', 'story-detail-art'); img.alt = asset.gallery?.title || '已解鎖場景畫面';
        img.src = asset.kind === 'cinematic' ? asset.poster : asset.src; img.loading = 'lazy';
        inspector.append(img);
      }
    } else if (controller.review) inspector.append(el('p', 'story-note', '本段未綁定 Gallery 圖；預覽背景不代表最終 CG。'));
    inspector.append(el('h4', '', controller.review ? '現有完整劇本與選項' : '已讀劇情'));
    const script = el('div', 'story-script');
    const allIds = new Set(group.variants.flatMap(v => v.nodeIds));
    let introStops = null;
    function walk(id, host, depth = 0, visited = new Set()) {
      if (introStops?.has(id)) return;
      if (!allIds.has(id) || visited.has(id) || depth > 1000) return;
      if (!controller.review && !options.progress.data.checkpoints[id]) return;
      visited.add(id);
      const node = options.chapter.nodes[id];
      if (!node) return;
      if (node.text) {
        const passage = el('p', 'story-passage');
        if (node.speaker) passage.append(el('b', '', `${node.speaker}　`));
        passage.append(document.createTextNode(node.text)); host.append(passage);
      }
      if (controller.review && node.choices) {
        for (const choice of node.choices) {
          const branch = el('details', 'story-choice');
          branch.append(el('summary', '', choice.text));
          walk(choice.next, branch, depth + 1, new Set(visited)); host.append(branch);
        }
      } else if (controller.review && node.type === 'branch') {
        const targets = [...(node.cases || []).filter(c => !(c.conditions || []).some(x => x.flag === 'legacy:disabled' && x.present)).map(c => c.next), node.default].filter(Boolean);
        if (targets.length === 1) walk(targets[0], host, depth + 1, visited);
        else for (const target of targets) {
          const branch = el('details', 'story-choice');
          branch.append(el('summary', '', options.map.branchLabels?.[id]?.[target] || '其他前事的版本'));
          walk(target, branch, depth + 1, new Set(visited)); host.append(branch);
        }
      } else if (!controller.review) {
        for (const [from, to] of options.progress.data.edges || []) if (from === id) walk(to, host, depth + 1, visited);
      } else if (node.next) walk(node.next, host, depth + 1, visited);
    }
    const read = new Set();
    if (variant.introEntry && variant.introEntry !== variant.entry) {
      script.append(el('h5', '', '場景共同開頭'));
      introStops = new Set(group.variants.map(v => v.entry));
      walk(variant.introEntry, script, 0, read);
      introStops = null;
      script.append(el('h5', '', variant.label));
    }
    walk(variant.entry, script, 0, read);
    // Historical saves can retain a later checkpoint while losing the scene entry.
    if (!controller.review) for (const id of variant.nodeIds) walk(id, script, 0, read);
    if (!script.childNodes.length) script.append(el('p', 'story-note', controller.review ? '本入口沒有對白。接續請看流程圖。' : '尚未讀到此段對白。'));
    inspector.append(script);
    const view = storyMapView(options.map, options.library, options.chapter, options.progress, controller.review);
    const exits = view.edges.filter(edge => edge.from === group.id);
    if (exits.length) {
      inspector.append(el('h4', '', '後續接續'));
      for (const edge of exits) {
        const next = view.groups.find(g => g.id === edge.to);
        if (next) inspector.append(button(`${edge.label ? `${edge.label} → ` : ''}${next.title}`, () => {
          selected = next.id; selectedVariant = null; render(options);
          inspector.querySelector('.story-inspector-close')?.focus({ preventScroll: true });
        }, 'story-continuation'));
      }
    }
  }

  function drawLines() {
    if (!lastOptions?.map || layout !== 'flow') return;
    const view = storyMapView(lastOptions.map, lastOptions.library, lastOptions.chapter, lastOptions.progress, controller.review);
    for (const canvas of engine.els.memoryList.querySelectorAll('.story-map-canvas')) {
      const svg = canvas.querySelector('svg'); svg.replaceChildren();
      const rect = canvas.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${rect.width || 1} ${rect.height || 1}`);
      for (const edge of view.edges) {
        const from = canvas.querySelector(`[data-group-id="${edge.from}"]`), to = canvas.querySelector(`[data-group-id="${edge.to}"]`);
        const aGroup = view.groups.find(g => g.id === edge.from), bGroup = view.groups.find(g => g.id === edge.to);
        if (!from || !to || bGroup.row !== aGroup.row + 1) continue;
        const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
        const x1 = a.left + a.width/2 - rect.left, y1 = a.bottom - rect.top;
        const x2 = b.left + b.width/2 - rect.left, y2 = b.top - rect.top;
        const path = document.createElementNS(svg.namespaceURI, 'path');
        path.setAttribute('d', `M${x1},${y1} C${x1},${(y1+y2)/2} ${x2},${(y1+y2)/2} ${x2},${y2}`);
        svg.append(path);
        if (edge.label) {
          const label = document.createElementNS(svg.namespaceURI, 'text');
          label.setAttribute('x', String(x2)); label.setAttribute('y', String(y2 - 10));
          label.setAttribute('text-anchor', 'middle'); label.textContent = edge.label;
          svg.append(label);
        }
      }
    }
  }
  return controller;
}
