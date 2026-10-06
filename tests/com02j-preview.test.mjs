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

test('cafe after convenience preserves the later COM03X frontier across isolated Memory replay and reload', () => {
  const storage = new Storage();
  const progress = new ProgressStore(chapter, memories, storage);
  const state = { ...chapter.initialState, flags: new Set([marker]) };
  progress.capture('common_station_cafe_jyc_enter', state, []);
  assert.equal(progress.data.frontierRank, 180);
  progress.capture('common_convenience_xu_exit_08', state, []);
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

test('approved cafe dialogue and actions are represented verbatim on the two entrances',()=>{
  const text=[...script.matchAll(/^\*\*(?:Narration|Action|Protagonist|Jiang Yucheng)\*\*：(.+)$/gm)].map(m=>m[1]);
  assert.ok(text.length>100);
  const actual=new Set(Object.values(nodes).map(node=>node.text));
  for(const line of text)assert.ok(actual.has(line),line);
  for(const id of ['common_station_cafe_jyc_enter','common_station_cafe_jyc_first_enter','common_station_cafe_jyc_contact_choice','com02j_offer_discord','com02j_leave_without_contact'])assert.ok(nodes[id]);
});
test('cafe contact is established only by the accepted exchange and the no-contact exit stays clean',()=>{
  assert.deepEqual(nodes.common_station_cafe_jyc_contact_choice.choices.map(x=>x.id),['com02j_offer_discord','com02j_leave_without_contact']);
  assert.ok(nodes.com02j_offer_discord_04.entryFlags.includes('contact_jyc'));
  assert.ok(!JSON.stringify(nodes.com02j_leave_without_contact).includes('contact_jyc'));
  assert.equal(nodes.common_station_cafe_jyc_complete.default,'common_package_xu_arrive');
  assert.equal(nodes.common_station_cafe_jyc_first_drawing_02.entryEffects.met_jiang_yucheng,1);
  assert.equal(nodes.common_station_cafe_jyc_first_drawing_02.speakerLabel,'女生');
});
test('cafe preview uses registered placeholder and cannot satisfy final visual validation',async()=>{
  const content=await loadContent();
  for(const [id,node] of Object.entries(nodes))if((id.startsWith('common_station_cafe_jyc_')||id.startsWith('com02j_'))&&node.visual)assert.equal(node.visual.background,'bg.narrative_preview.placeholder');
  assert.deepEqual(await validateContent(content),[]);
  assert.ok((await validateContent(content,{finalVisuals:true})).some(e=>e.includes('final visual acceptance forbids allowPreviewArt')));
});
