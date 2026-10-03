import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ProgressStore } from '../src/progress.js';
import { loadContent, validateContent } from '../tools/content-lib.mjs';

const json = file => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url)));
const route = json('content/routes/opening-demo/route.json');
const nodes = json('content/routes/opening-demo/chapter-01.json').nodes;
const chapter = { ...route.story, nodes };
const memories = json('content/routes/opening-demo/memories.json');
const script = readFileSync(new URL('../docs/narrative/scenes/vertical-slice/COM-02J.md', import.meta.url), 'utf8').split('## Locked playable script\n')[1].split('## State contract')[0];
const supplementEnd = 'common_station_cafe_jyc_complete';
const marker = 'preview:com02j-complete';
class Storage {
  constructor(saved) { this.value = saved ? JSON.stringify(saved) : null; }
  getItem(key) { return key.endsWith(':v2') ? this.value : null; }
  setItem(key, value) { if (key.endsWith(':v2')) this.value = value; }
}
const snapshot = (nodeId, stats = {}, flags = []) => ({ nodeId, stats: { ...chapter.initialState, ...stats }, flags, returnNodes: [] });
const savedAt = (nodeId, complete = false) => {
  const frontier = snapshot(nodeId, { F_XT: 20, F_JYC: 6, T_JYC: 2, C_JYC: 3, jyc_first_topic: 2 }, ['contact_xu','world-history']);
  return { version: 2, playerDisplayName: '小雨', cursor: frontier, frontier, runComplete: complete, checkpoints: { [nodeId]: frontier }, edges: [] };
};

function scriptGroups() {
  const groups = [];
  for (const [, anchor, body] of script.matchAll(/^### `(\w+)`\n([\s\S]*?)(?=^### |(?![\s\S]))/gm)) {
    if (anchor !== 'common_station_cafe_jyc_choice') groups.push([anchor, body]);
    else {
      for (const [, id, branch] of body.matchAll(/^#### Branch `(\w+)`\n([\s\S]*?)(?=^#### |(?![\s\S]))/gm)) {
        if (id !== 'com02j_continue_topic') groups.push([id, branch]);
        else for (const [, variant, local] of branch.matchAll(/^\*\*Variant — (\w+)\*\*\n([\s\S]*?)(?=^\*\*Variant |(?![\s\S]))/gm)) groups.push([`${id}_${variant}`, local]);
      }
    }
  }
  return groups;
}

test('COM02J compiles all 61 approved turns, speaker timing, labels and rejoins exactly', () => {
  let turns = 0;
  for (const [anchor, body] of scriptGroups()) {
    const approved = [...body.matchAll(/^\*\*(Narration|Action|Protagonist|Jiang Yucheng)\*\*：(.*)$/gm)];
    let id = anchor;
    for (const [index, [, role, text]] of approved.entries()) {
      const node = nodes[id];
      assert.equal(node.text, text, `${anchor} turn ${index}`);
      assert.equal(node.speaker, role === 'Protagonist' ? '你' : role === 'Jiang Yucheng' ? anchor === 'common_station_cafe_jyc_drawing' ? '女生' : '江雨澄' : '旁白');
      assert.deepEqual(node.visual, { mode: 'composite', background: 'bg.narrative_preview.placeholder', sprites: [] });
      if (index < approved.length - 1) id = node.next;
      turns++;
    }
    if (anchor.startsWith('com02j_')) assert.equal(nodes[id].next, 'common_station_cafe_jyc_parallel');
  }
  assert.equal(turns, 61);
  assert.equal(nodes.common_station_cafe_jyc_parallel_02.audioCue, '咖啡機、遠處人流、stylus 輕觸聲。');
  for (const variant of ['visual_design', 'worldbuilding', 'edition_value', 'neutral']) {
    const choices = nodes[`common_station_cafe_jyc_choice_${variant}`].choices;
    assert.deepEqual(choices.map(c => c.id), ['com02j_ask_drawing', 'com02j_continue_topic', 'com02j_simple_praise']);
    assert.equal(choices[1].text, nodes[`com02j_continue_topic_${variant}`].text);
    assert.equal(choices[1].next, 'com02j_continue_topic');
  }
  assert.equal(nodes.opening_demo_complete.default, 'common_station_cafe_jyc_enter');
  assert.equal(nodes[supplementEnd].default, 'common_package_xu_arrive');
});

test('all existing accepted runtime nodes, art, Memory IDs/order and COM03X 83 turns remain byte-equivalent to exact d4ab4bd baseline', () => {
  const baseline = 'd4ab4bd0ffc4bec97f81ad288a52194bc3a883bd';
  const prior = file => JSON.parse(execFileSync('git', ['show', `${baseline}:content/routes/opening-demo/${file}`], { encoding: 'utf8' }));
  const old = prior('chapter-01.json').nodes;
  for (const [id, node] of Object.entries(old)) {
    if (id === 'opening_demo_complete') continue;
    assert.deepEqual(nodes[id], node, `accepted node changed: ${id}`);
  }
  assert.equal(Object.entries(old).filter(([id,node]) => (id.startsWith('common_package_xu_') || id.startsWith('com03x_')) && node.text).length, 83);
  assert.deepEqual(memories.events.slice(0,4), prior('memories.json').events);
  assert.deepEqual(route.assetIds, prior('route.json').assetIds);
});

for (const nodeId of ['com03x_preview_complete', 'common_package_xu_choice', 'com03x_ask_proof_02', 'common_package_xu_first_message_06']) {
  test(`COM02J supplement ${nodeId} survives reload and merges only local effects without replaying world counters`, () => {
    const saved = savedAt(nodeId, nodeId === 'com03x_preview_complete');
    const storage = new Storage(saved);
    let progress = new ProgressStore(chapter, memories, storage);
    assert.equal(progress.data.playerDisplayName, '小雨');
    assert.deepEqual(progress.data.frontier, saved.frontier);
    assert.equal(progress.data.frontierRank, 200);
    assert.equal(progress.data.runComplete, false);
    assert.equal(progress.data.cursor.nodeId, 'common_station_cafe_jyc_enter');
    assert.equal(progress.data.cursor.flags.includes('contact_xu'), false, 'future world flags do not enter local Memory');
    const state = progress.restore(progress.data.cursor).state;
    state.F_JYC += 2;
    state.flags.add('jyc_second_topic:shared_work');
    for (const flag of nodes[supplementEnd].entryFlags) state.flags.add(flag);
    progress.capture('com02j_continue_topic_visual_design_02', state, []);
    progress = new ProgressStore(chapter, memories, storage);
    assert.equal(progress.data.cursor.nodeId, 'com02j_continue_topic_visual_design_02');
    assert.deepEqual(progress.data.frontier, saved.frontier);
    const returned = progress.completeCom02jSupplement(state);
    assert.equal(returned.nodeId, nodeId);
    assert.equal(returned.state.F_XT, 20);
    assert.equal(returned.state.F_JYC, 8);
    assert.equal(returned.state.T_JYC, 2);
    assert.equal(returned.state.C_JYC, 3);
    assert.equal(returned.state.flags.has('contact_xu'), true);
    assert.equal(progress.data.runComplete, saved.runComplete);
    assert.equal(progress.completeCom02jSupplement(state), null, 'merge is exactly once');
    const reload = new ProgressStore(chapter, memories, storage);
    assert.equal(reload.data.com02jSupplement, null);
    assert.deepEqual(reload.data.frontier, progress.data.frontier);
  });
}

test('newer complete worlds, ordinary Memory cursors, restart and predecessor saves never reopen as COM02J upgrades', () => {
  for (const kind of ['newer', 'memory', 'restart', 'predecessor']) {
    const saved = savedAt('com03x_preview_complete', true);
    if (kind === 'newer') saved.frontier.flags.push(marker);
    if (kind === 'memory') saved.cursor = snapshot('common_convenience_xu_exit_08');
    if (kind === 'restart') { saved.restartActive = true; saved.cursor = snapshot(chapter.startNode); }
    if (kind === 'predecessor') { saved.frontier = saved.cursor = snapshot('opening_demo_complete'); saved.runComplete = false; }
    const progress = new ProgressStore(chapter, memories, new Storage(saved));
    assert.equal(progress.data.com02jSupplement, null, kind);
  }
});

test('fresh chronology preserves a later COM03X frontier across isolated COM02J Memory replay and reload', () => {
  const storage = new Storage();
  const progress = new ProgressStore(chapter, memories, storage);
  const state = { ...chapter.initialState, flags: new Set([marker]) };
  progress.capture('common_convenience_xu_exit_08', state, []);
  assert.equal(progress.data.frontierRank, 160);
  progress.capture('common_station_cafe_jyc_enter', state, []);
  assert.equal(progress.data.frontierRank, 180);
  progress.capture('common_package_xu_line', state, []);
  assert.equal(progress.data.frontierRank, 200);
  const world = structuredClone(progress.data.frontier);
  progress.beginReplay(progress.data.checkpoints.common_station_cafe_jyc_enter);
  progress.capture('common_station_cafe_jyc_exit', { ...state, F_JYC: 99, jyc_first_topic: 0 }, []);
  assert.deepEqual(progress.data.frontier, world);
  const reload = new ProgressStore(chapter, memories, storage);
  assert.deepEqual(reload.data.frontier, world);
  assert.equal(reload.data.com02jSupplement, null);
  assert.equal(reload.restore(reload.data.cursor).state.jyc_first_topic, 0);
});

test('COM02J placeholder remains opted in and excluded from Gallery/final acceptance', async () => {
  const content = await loadContent();
  assert.deepEqual(await validateContent(content), []);
  assert.ok((await validateContent(content, { finalVisuals: true })).some(error => error.includes('final visual acceptance forbids allowPreviewArt')));
  assert.deepEqual(memories.events.at(-1).galleryAssets, []);
});

test('historical v1 COM03X terminal supplements through the same bounded path and defaults only new additive stats', () => {
  const current=savedAt('com03x_preview_complete',true).cursor;
  delete current.stats.T_JYC;delete current.stats.C_JYC;
  const values=new Map([[`${chapter.id}:journey:v1`,JSON.stringify({version:1,current,checkpoints:{[current.nodeId]:current},edges:[]})]]);
  const storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
  const store=new ProgressStore(chapter,memories,storage);
  assert.equal(store.data.com02jSupplement.wasComplete,true);
  assert.equal(store.data.cursor.nodeId,'common_station_cafe_jyc_enter');
  assert.equal(store.data.frontier.stats.F_XT,20);
  assert.equal(store.data.frontier.stats.T_JYC,0);
  assert.equal(store.data.frontier.stats.C_JYC,0);
  const reloaded=new ProgressStore(chapter,memories,storage);
  assert.deepEqual(reloaded.data.com02jSupplement,store.data.com02jSupplement);
  const state=reloaded.restore(reloaded.data.cursor).state;
  state.F_JYC+=1;state.T_JYC+=1;
  state.flags.add('preview:com02j-complete');
  state.flags.add('jyc_second_topic:her_art');
  const returned=reloaded.completeCom02jSupplement(state);
  assert.equal(returned.state.F_XT,20);
  assert.equal(returned.state.F_JYC,7);
  assert.equal(returned.state.T_JYC,1);
  assert.equal(returned.state.C_JYC,0);
  assert.ok(['F_JYC','T_JYC','C_JYC'].every(key=>Number.isFinite(returned.state[key])));
});


test('sparse historical v2 supplementation keeps finite deltas and uses neutral absent creator/history facts', () => {
  const saved=savedAt('com03x_preview_complete',true);
  delete saved.cursor.stats.T_JYC;delete saved.cursor.stats.C_JYC;
  saved.cursor.stats.jyc_first_topic=0;saved.cursor.flags=['contact_xu','unrelated-player-flag'];
  const store=new ProgressStore(chapter,memories,new Storage(saved));
  assert.equal(store.data.cursor.stats.jyc_first_topic,0);
  assert.deepEqual(store.data.cursor.flags,[]);
  const state=store.restore(store.data.cursor).state;state.F_JYC+=1;state.C_JYC+=1;
  state.flags.add('preview:com02j-complete');state.flags.add('jyc_second_topic:general_praise');
  const returned=store.completeCom02jSupplement(state);
  assert.equal(returned.state.F_XT,20);
  assert.equal(returned.state.F_JYC,7);
  assert.equal(returned.state.T_JYC,0);
  assert.equal(returned.state.C_JYC,1);
  assert.equal(returned.state.flags.has('unrelated-player-flag'),true);
  assert.ok(['F_JYC','T_JYC','C_JYC'].every(key=>Number.isFinite(returned.state[key])));
});
