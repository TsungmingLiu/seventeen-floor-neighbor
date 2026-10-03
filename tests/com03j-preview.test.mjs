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

test('COM03J preserves all 100 approved turns, their order, attachments, times, and choice labels', () => {
  const script=readFileSync(new URL('../docs/narrative/scenes/vertical-slice/COM-03J.md',import.meta.url),'utf8').split('## Locked playable script\n')[1].split('## Callback selector')[0];
  let anchor, next, variant, count=0;
  for (const line of script.split('\n')) {
    const heading=line.match(/^#{3,5} `(\w+)`$/);
    if (heading) { anchor=heading[1];next=anchor;variant=null; }
    const callback=line.match(/^#### Variant `(\w+)`$/);
    if(callback) { variant=callback[1];next=prefix+'callback_'+variant; }
    const turn=line.match(/^\*\*(Narration|Action|Protagonist(?: — message)?|Jiang Yucheng|Discord — Jiang Yucheng|Message attachment(?: — meme text)?)\*\*：(.*)$/);
    if(!turn)continue;
    const [,role,text]=turn;
    assert.equal(nodes[next].text,text,`${anchor}/${variant||''} turn ${count}`);
    assert.equal(nodes[next].speaker,role.startsWith('Protagonist')?'你':role==='Jiang Yucheng'?'江雨澄':role.startsWith('Discord')?'Discord — 江雨澄':'旁白');
    assert.deepEqual(nodes[next].visual,{mode:'composite',background:'bg.narrative_preview.placeholder',sprites:[]});
    next=nodes[next].next;count++;
  }
  assert.equal(count,100);
  assert.equal(nodes[prefix+'first_message'].moment,'20:48。');
  assert.equal(nodes[prefix+'continue_close'].moment,'23:06。');
  const choices=nodes[prefix+'choice'].choices;
  assert.deepEqual(choices.map(c=>c.id),['com03j_continue_content','com03j_warm_close','com03j_save_for_later']);
  for(const choice of choices) { assert.equal(choice.text,nodes[choice.next].text);assert.equal(choice.effects,undefined); }
  for(const suffix of ['callback_her_art_03','callback_shared_visual_design_03','callback_shared_worldbuilding_03','callback_shared_edition_value_03','callback_shared_neutral_03','callback_general_praise_03','callback_neutral_03'])assert.equal(nodes[prefix+suffix].next,prefix+'contact');
  assert.equal(nodes[prefix+'continue_12'].next,prefix+'continue_close');
  for(const suffix of ['continue_close_05','warm_close_05','save_for_later_06'])assert.equal(nodes[prefix+suffix].next,prefix+'exit');
  assert.deepEqual(nodes[prefix+'exit'].entryEffects,{F_JYC:1});
  assert.deepEqual(nodes[prefix+'exit'].entryFlags,['contact_jyc','preview:com03j-complete']);
});

test('COM03J appends to pinned runtime preserving all old prose, labels, effects, IDs and Memory/art bindings', () => {
  const base='2665e195410b96d6bc8b83db40ab72f7c8fc49e3';
  const prior=file=>JSON.parse(execFileSync('git',['show',`${base}:${file}`],{encoding:'utf8'}));
  const old=prior('content/routes/opening-demo/chapter-01.json').nodes;
  const approvedCafeText = {
    common_station_cafe_jyc_enter_03:'我拿著筆記本電腦包找座位，在窗邊看見熟悉的短髮側影。',
    common_station_cafe_jyc_drawing_02:'她停筆喝水，抬眼看見我。我們的視線碰上。她停了兩秒。',
    common_station_cafe_jyc_names_03:'我們沒有握手。我指向她旁邊的空位。',
    common_station_cafe_jyc_names_08:'我坐在斜對角，不直接面向她的平板電腦。',
    common_station_cafe_jyc_parallel_03:'我闔上筆記本電腦準備離開；雨澄先抬頭。',
    common_station_cafe_jyc_exit_05:'我背起筆記本電腦包。雨澄把畫筆放回筆槽。'
  };
  for(const [id,text] of Object.entries(approvedCafeText))old[id].text=text;
  const trialAsset='bg.opening.com02x.return_elevator_trial';
  for(const id of ['common_convenience_xu_exit','common_convenience_xu_exit_02'])old[id].visual.background=trialAsset;
  for(const [id,node] of Object.entries(old))assert.deepEqual(nodes[id],id==='com03x_preview_complete'?{type:'branch',default:prefix+'enter'}:node,id);
  assert.deepEqual(memories.events.slice(0,-1),prior('content/routes/opening-demo/memories.json').events);
  const oldRoute=prior('content/routes/opening-demo/route.json');
  const expected=structuredClone(oldRoute);expected.story.chapterLabels.push('推薦 / Discord');
  expected.assetIds.push(trialAsset);
  assert.deepEqual(route,expected);
  const event=memories.events.at(-1);
  assert.equal(event.id,'mem.opening.ch1.recommend-discord-jyc');assert.equal(event.progressRank,220);assert.equal(event.sectionId,'opening-ch1');
  assert.deepEqual(event.unlockNodes,Object.keys(nodes).filter(id=>id.startsWith(prefix)||id==='com03j_preview_complete'));
  assert.deepEqual(event.galleryAssets,[]);
});

for(const version of [1,2])test(`completed v${version} COM03X save enters appended frontier once without losing state`,()=>{
  const frontier=snap('com03x_preview_complete',[...entryFlags,'contact_xu','entry-effect:common_package_xu_first_message_06']);
  const saved=version===1?{version,current:frontier,checkpoints:{[frontier.nodeId]:frontier},edges:[]}:{version,playerDisplayName:'小雨',cursor:frontier,frontier,runComplete:true,checkpoints:{[frontier.nodeId]:frontier},edges:[]};
  const storage=new Storage(saved,version);let store=new ProgressStore(chapter,memories,storage);
  assert.equal(store.data.com02jSupplement,null);assert.equal(store.data.runComplete,false);assert.deepEqual(store.data.frontier,frontier);
  store.capture(prefix+'enter',store.restore(frontier).state,[]);
  assert.equal(store.data.frontierRank,220);
  const state=store.restore(store.data.cursor).state;state.F_JYC++;state.flags.add('contact_jyc');state.flags.add('preview:com03j-complete');
  store.capture('com03j_preview_complete',state,[]);store.finishRun();
  store=new ProgressStore(chapter,memories,storage);
  assert.equal(store.data.runComplete,true);assert.equal(store.data.frontier.nodeId,'com03j_preview_complete');assert.equal(store.data.frontier.stats.F_XT,20);assert.equal(store.data.frontier.stats.F_JYC,7);
});

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
