const narrativeConditions = {
  met_jiang_yucheng: ['已認識雨澄', '尚未認識雨澄'],
  jyc_permanently_excluded: ['這次選擇街景獨行，接續沒有雨澄的劇情', '這次仍可接續雨澄的劇情'],
  weekend_book_purchased: ['週末已買到想要的書', '週末沒有去書店買書'],
  'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_go': ['週末選擇去書店', '週末沒有選擇去書店'],
  'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip': ['週末選擇留在家', '週末沒有選擇留在家'],
  'history:cafe-continue-topic': ['咖啡店曾接續書店的話題', '咖啡店沒有接續書店的話題'],
  contact_jyc: ['已與雨澄交換聯絡方式', '尚未與雨澄交換聯絡方式'],
  contact_xu: ['已與許棠交換聯絡方式', '尚未與許棠交換聯絡方式'],
  'preview:com02j-complete': ['已走過雨澄咖啡店場景', '尚未走過雨澄咖啡店場景'],
  'history:jyc_first_topic:visual_design': ['書店曾聊畫面設計'],
  'history:jyc_first_topic:worldbuilding': ['書店曾聊世界設定'],
  'history:jyc_first_topic:edition_value': ['書店曾聊版本差異'],
  'jyc_second_topic:her_art': ['咖啡店曾問她的畫'],
  'jyc_second_topic:shared_work': ['咖啡店曾接續聊共同作品'],
  'jyc_second_topic:general_praise': ['咖啡店曾簡單稱讚她的畫'],
  'entry-effect:common_station_cafe_jyc_first_drawing_02': ['初遇時已聊過她的畫'],
  'jyc_com03j_reply_style:continue_content': ['訊息選擇繼續聊作品'],
  'jyc_com03j_reply_style:warm_close': ['訊息選擇溫暖收尾'],
  'jyc_com03j_reply_style:save_for_later': ['訊息選擇留待之後再看']
};
export function narrativeCondition(conditions) {
  return (conditions || []).map(c => {
    if (c.stat === 'jyc_first_topic') return ({1: '書店曾聊世界設定', 2: '書店曾聊畫面設計', 3: '書店曾聊版本差異'})[c.value] || '書店沒有延伸聊這個話題';
    if (c.stat === 'met_jiang_yucheng') return ((c.operator === '==' && c.value === 0) || c.operator === '<') ? '尚未認識雨澄' : '已認識雨澄';
    const label = narrativeConditions[c.flag];
    return label ? (c.present === false ? label[1] || '先前沒有走過這段互動' : label[0]) : '依先前互動接續';
  }).join('；');
}

// Presentation mapping only. Gameplay and Memory/save IDs keep their existing authority.
function inactiveCase({ conditions = [] }) {
  const flags = new Map();
  for (const condition of conditions) {
    if (!condition.flag) continue;
    const present = condition.present !== false;
    if (condition.flag === 'legacy:disabled' && present) return true;
    if (flags.has(condition.flag) && flags.get(condition.flag) !== present) return true;
    flags.set(condition.flag, present);
  }
  return false;
}

export function runtimeTargets(node, pools = {}) {
  if (node.choices) return node.choices.map(c => c.next);
  if (node.type === 'branch') return [...(node.cases || [])
    .filter(c => !inactiveCase(c))
    .map(c => c.next), node.default].filter(Boolean);
  if (node.type === 'random') return [...(pools[node.pool]?.entries || []).map(e => e.entryNode), node.after].filter(Boolean);
  return [node.next].filter(Boolean);
}

export function compileStoryMap(route, definition) {
  if (definition.schemaVersion !== 1) throw new Error('Story Map: unsupported schema');
  const { chapter, memoryLibrary, sceneLibrary } = route;
  const revision = (definition.revisions || []).find(r => r.whenNodes.every(id => chapter.nodes[id]));
  // Runtime may deliberately stop at a compatibility/error sentinel. Its JSON
  // fallback is not a playable story connection; retain IDs for old saves only.
  const reviewBlockedNodes = [...new Set([
    ...(definition.reviewBlockedNodes || []), ...(revision?.reviewBlockedNodes || [])
  ])];
  const blocked = new Set(reviewBlockedNodes);
  const targets = node => runtimeTargets(node, sceneLibrary.pools).filter(id => !blocked.has(id));
  const definitions = revision ? definition.groups.map(group => ({ ...group, ...(revision.groups[group.id] || {}) })).concat(revision.addGroups || []) : definition.groups;
  const events = new Map(memoryLibrary.events.map(e => [e.id, e]));
  const nodeToGroup = new Map();
  const groups = definitions.map(group => {
    const variants = group.variants.map(variant => {
      const event = variant.memoryId ? events.get(variant.memoryId) : null;
      if (variant.memoryId && !event) throw new Error(`Story Map: unknown Memory ${variant.memoryId}`);
      if (!chapter.nodes[variant.entry]) throw new Error(`Story Map: unknown entry ${variant.entry}`);
      const ids = Object.keys(chapter.nodes).filter(id =>
        (variant.prefixes || []).some(p => id.startsWith(p))
        && !(variant.excludePrefixes || []).some(p => id.startsWith(p)));
      // The two café entry versions deliberately share their later dialogue.
      if (group.id === 'cafe' && event) ids.push(event.replayNode, ...event.unlockNodes);
      const nodeIds = [...new Set(ids)];
      for (const id of nodeIds) {
        if (!chapter.nodes[id]) throw new Error(`Story Map: unknown node ${id}`);
        if (nodeToGroup.has(id) && nodeToGroup.get(id) !== group.id) throw new Error(`Story Map: overlapping group for ${id}`);
        nodeToGroup.set(id, group.id);
      }
      const reachable = new Set(), pending = [variant.introEntry, variant.entry].filter(Boolean);
      const allowed = new Set(nodeIds);
      const otherEntries = new Set(group.variants.filter(v => v.id !== variant.id).map(v => v.entry));
      while (pending.length) {
        const id = pending.pop();
        if (reachable.has(id) || !allowed.has(id) || otherEntries.has(id) || blocked.has(id)) continue;
        reachable.add(id); pending.push(...targets(chapter.nodes[id]));
      }
      const usedAssets = new Set([...reachable].flatMap(id => {
        const visual = chapter.nodes[id].visual || {};
        return [visual.asset, visual.background];
      }).filter(Boolean));
      return { ...variant, nodeIds, sectionId: event?.sectionId || memoryLibrary.sections[0]?.id,
        characterIds: event?.characterIds || [], cover: usedAssets.has(event?.cover?.asset) ? event.cover : undefined,
        galleryAssets: [...usedAssets].filter(id => route.assetManifest?.assets?.[id]?.gallery || event?.galleryAssets?.includes(id)) };
    });
    return { ...group, variants };
  });
  // Keep retired compatibility IDs available for historical saves, while the
  // review graph follows only passages reachable from the current story entry.
  const currentNodes = new Set(), pendingNodes = [chapter.startNode];
  while (pendingNodes.length) {
    const id = pendingNodes.pop();
    if (!id || currentNodes.has(id) || !chapter.nodes[id] || blocked.has(id)) continue;
    currentNodes.add(id);
    pendingNodes.push(...targets(chapter.nodes[id]));
  }
  const edges = [];
  for (const group of groups) {
    const visited = new Set();
    const pending = group.variants.flatMap(v => v.nodeIds).filter(id => currentNodes.has(id)).flatMap(id => targets(chapter.nodes[id]).map(target => ({ id: target, label: chapter.nodes[id].choices?.find(c => c.next === target)?.text })));
    while (pending.length) {
      const { id, label } = pending.pop();
      if (!id || visited.has(id) || !chapter.nodes[id]) continue;
      visited.add(id);
      const target = nodeToGroup.get(id);
      if (target && target !== group.id) {
        if (!edges.some(e => e.from === group.id && e.to === target)) edges.push({ from: group.id, to: target, ...(label ? { label } : {}) });
      } else if (!target) pending.push(...targets(chapter.nodes[id]).map(target => ({ id: target, label })));
    }
  }
  const branchLabels = Object.fromEntries(Object.entries(chapter.nodes).filter(([,node]) => node.type === 'branch').map(([id,node]) => [id,
    Object.fromEntries((node.cases || []).filter(c => !inactiveCase(c) && !blocked.has(c.next)).map(c => [c.next, narrativeCondition(c.conditions)]))
  ]));
  return { schemaVersion: 1, revision: revision?.id || 'current', reviewBlockedNodes, groups, edges, branchLabels };
}
