// A street playthrough cannot recover Jiang availability from imported contact
// or topic flags. Keep the guard shared by playback and snapshot migration.
export function jiangExcluded(state, initialEncounterEligible = false) {
  if (initialEncounterEligible) return false;
  const flags = state?.flags;
  return flags instanceof Set ? flags.has('jyc_permanently_excluded')
    : Array.isArray(flags) && flags.includes('jyc_permanently_excluded');
}

export function excludedJiangDestination(nodeId, state, initialEncounterEligible = false) {
  if (!jiangExcluded(state, initialEncounterEligible)) return null;
  if (nodeId?.startsWith('common_acg_first_meet_')) return 'common_convenience_xu_enter';
  if (nodeId?.startsWith('common_station_cafe_jyc_') || nodeId?.startsWith('com02j_')) return 'common_package_xu_arrive';
  if (nodeId?.startsWith('common_recommend_discord_jyc_') || nodeId === 'com03j_preview_complete') return 'COM03M-ENTRY';
  const montage = /^COM03M-J(01|02|04|05)(?!-GATE)/.exec(nodeId || '');
  if (montage) return `COM03M-S${{ '01': '02', '02': '03', '04': '05', '05': '06' }[montage[1]]}`;
  if (nodeId === 'COM03M-BOTH-NOTIFY' || nodeId === 'COM03M-C01'
    || nodeId?.startsWith('COM03M-BJ') || nodeId?.startsWith('COM03M-BW')
    || (nodeId?.startsWith('COM03M-BX') && !nodeId.startsWith('COM03M-BX-ONLY'))) {
    const flags = state.flags;
    const contactXu = flags instanceof Set ? flags.has('contact_xu') : flags?.includes('contact_xu');
    return contactXu ? 'COM03M-BX-ONLY' : 'opening_contactless_preview_complete';
  }
  if (nodeId?.startsWith('OPEN-A-ENTRY-J-TOPIC')) return 'OPEN-A-ENTRY-CLOSE';
  if (nodeId?.startsWith('OPEN-A-J-') || nodeId === 'OPEN-A-ENTRY-PENDING-J') return 'OPEN-A-LIFE-DIRECT';
  if (nodeId === 'OPEN-A-ENTRY-ACTION-BOTH' || nodeId === 'OPEN-A-ENTRY-ACTION-J') {
    const flags = state.flags;
    const contactXu = flags instanceof Set ? flags.has('contact_xu') : flags?.includes('contact_xu');
    return contactXu ? 'OPEN-A-ENTRY-ACTION-X' : 'OPEN-A-LIFE-DIRECT';
  }
  return null;
}

export function outgoing(node, pools) {
  return [...new Set([node.next, ...(node.choices || []).map(choice => choice.next), node.default,
    ...(node.cases || []).map(branch => branch.next), node.after,
    ...(node.type === 'random' ? (pools[node.pool]?.entries || []).map(entry => entry.entryNode) : [])].filter(Boolean))];
}

export function graphOrder(chapter, pools) {
  const rows = [];
  const seen = new Set();
  function visit(id, depth) {
    if (!chapter.nodes[id] || seen.has(id)) return;
    seen.add(id);
    const next = outgoing(chapter.nodes[id], pools);
    rows.push({ id, depth, next });
    next.forEach(nextId => visit(nextId, depth + (next.length > 1 ? 1 : 0)));
  }
  visit(chapter.startNode, 0);
  return rows;
}

export function renderBranches({ chapter, pools, assets, progress, unlocked, container, summary, onResume }) {
  const rows = graphOrder(chapter, pools);
  const numbers = new Map(rows.map((row, index) => [row.id, index + 1]));
  const checkpoints = progress.data.checkpoints;
  const traversed = new Set(progress.data.edges.flat());
  container.replaceChildren();
  const total = rows.filter(row => chapter.nodes[row.id].visual || chapter.nodes[row.id].type === 'route').length;
  summary.textContent = `已走過 ${Object.keys(checkpoints).length} / ${total} 個劇情節點 · 點起點可重新開始，已走過的節點可續玩`;
  for (const { id, depth, next } of rows) {
    const node = chapter.nodes[id];
    const visited = !!checkpoints[id];
    const known = visited || traversed.has(id) || id === chapter.startNode;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `branch-node${known ? '' : ' is-locked'}${progress.data.current?.nodeId === id ? ' is-current' : ''}`;
    button.style.setProperty('--branch-depth', Math.min(depth, 2));
    button.disabled = !visited && id !== chapter.startNode;
    const title = document.createElement('span');
    const excerpt = node.text?.replace(/\s+/g, ' ').slice(0, 24);
    const label = node.mapLabel || node.moment || (node.type === 'route' ? '本輪結局' : excerpt) || '分支連接點';
    title.textContent = `${numbers.get(id)} · ${known ? label : '未探索'}`;
    const meta = document.createElement('small');
    const assetId = node.visual?.asset;
    const cg = assets[assetId]?.gallery;
    meta.textContent = id === chapter.startNode ? '故事起點 · 從頭開始'
      : progress.data.current?.nodeId === id ? '目前續玩點'
      : visited ? '已走過 · 從此續玩' : known ? '分支連接點' : '尚未解鎖';
    if (cg && known) meta.textContent += ` · CG ${unlocked.has(assetId) ? '已解鎖' : '未解鎖'}`;
    button.append(title, meta);
    if (known && next.length) {
      const connections = document.createElement('small');
      connections.className = 'branch-connections';
      connections.textContent = next.map((target, index) => {
        const taken = progress.data.edges.some(edge => edge[0] === id && edge[1] === target);
        const choice = node.choices?.[index];
        return `${taken ? '✓' : '◇'} ${choice ? choice.text : '前往'} → ${numbers.get(target)}`;
      }).join(' ／ ');
      button.append(connections);
    }
    if (!button.disabled) button.addEventListener('click', () => onResume(id));
    container.append(button);
  }
}
