import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ProgressStore } from '../src/progress.js';
import { loadContent, validateContent } from '../tools/content-lib.mjs';

const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url)));
const route = read('content/routes/opening-demo/route.json');
const nodes = read('content/routes/opening-demo/chapter-01.json').nodes;
const chapter = { ...route.story, nodes };
const memories = read('content/routes/opening-demo/memories.json');
const prefix = 'common_recommend_discord_jyc_';
const entryFlags = ['preview:com02j-complete','entry-effect:common_station_cafe_jyc_complete','player_knows_jyc_name','jyc_knows_player_name','jyc_creator_work_seen'];
const snap = (nodeId, flags = entryFlags) => ({ nodeId, stats: { ...chapter.initialState, F_XT: 20, F_JYC: 6 }, flags: [...flags], returnNodes: [] });
class Storage {
  constructor(saved, version=2) { this.values = new Map(saved ? [[`${chapter.id}:journey:v${version}`,JSON.stringify(saved)]] : []); }
  getItem(key) { return this.values.get(key) || null; }
  setItem(key,value) { this.values.set(key,value); }
}

test('flag selector validates strictly, preserves numeric cases and leaves final visual acceptance blocked',async()=>{
  const content=await loadContent();assert.deepEqual(await validateContent(content),[]);
  for(const condition of [{flag:'',present:true},{flag:'history',present:1},{present:true},{flag:'history',present:true,stat:'F_JYC',operator:'==',value:1}]){
    const copy=structuredClone(content);copy.routes[0].chapter.nodes[prefix+'callback'].cases[0].conditions=[condition];
    assert.ok((await validateContent(copy)).some(e=>e.includes('flag condition requires')));
  }
  const copy=structuredClone(content);copy.routes[0].chapter.nodes[prefix+'callback'].cases[0].conditions=[{stat:'F_JYC',operator:'==',value:1}];
  assert.deepEqual(await validateContent(copy),[]);
  assert.ok((await validateContent(content,{finalVisuals:true})).some(e=>e.includes('final visual acceptance forbids allowPreviewArt')));
});

const script=readFileSync(new URL('../docs/narrative/scenes/vertical-slice/COM-03J.md',import.meta.url),'utf8').split('## Locked playable script')[1].split('## Callback selector')[0];
test('approved evening turns, public attachment descriptions and reply actions are present verbatim',()=>{
  const lines=[...script.matchAll(/^\*\*(?:Narration|Action|Protagonist — message|Discord — Jiang Yucheng|Message attachment(?: — meme text)?)\*\*：(.+)$/gm)].map(x=>x[1]);
  assert.ok(lines.length>60);
  const actual=new Set(Object.values(nodes).map(x=>x.text));
  for(const line of lines)assert.ok(actual.has(line),line);
  assert.deepEqual(nodes.common_recommend_discord_jyc_choice.choices.map(x=>x.id),['com03j_continue_content','com03j_warm_close','com03j_save_for_later']);
  assert.equal(nodes.common_recommend_discord_jyc_first_message.moment,'20:48');
  assert.equal(nodes.common_recommend_discord_jyc_continue_close.moment,'23:06');
});
test('evening continuation is gated by actual cafe contact and grants no new contact',()=>{
  const gate=nodes.com03x_preview_complete;
  assert.deepEqual(gate.cases[0].conditions,[{flag:'contact_jyc',present:true}]);
  assert.equal(gate.cases[0].next,'common_recommend_discord_jyc_enter');
  assert.equal(gate.default,'COM03M-ENTRY');
  assert.equal(nodes.common_recommend_discord_jyc_no_contact_exit.default,'COM03M-ENTRY');
  assert.equal(nodes.common_recommend_discord_jyc_exit.entryFlags,undefined);
  assert.equal(nodes.com03j_preview_complete.default,'COM03M-S01');
});
