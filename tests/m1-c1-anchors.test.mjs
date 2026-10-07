import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/engine.js';
import { isMemoryUnlocked } from '../src/memories.js';

const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url)));
const route = read('content/routes/opening-demo/route.json');
const chapter = { ...route.story, nodes: read('content/routes/opening-demo/chapter-01.json').nodes };
const assetManifest = read('content/assets/manifest.json');
const memoryLibrary = read('content/routes/opening-demo/memories.json');
class Storage {
  values = new Map();
  getItem(k) { return this.values.get(k) ?? null; }
  setItem(k,v) { this.values.set(k,String(v)); }
}
class Classes {
  values = new Set();
  add(...v) { v.forEach(x => this.values.add(x)); }
  remove(...v) { v.forEach(x => this.values.delete(x)); }
  contains(v) { return this.values.has(v); }
  toggle(v,on) { if (on ?? !this.contains(v)) this.add(v); else this.remove(v); }
}
class Element {
  constructor(tagName='div') { this.tagName=tagName; this.children=[]; this.classList=new Classes(); this.style={setProperty(){}}; this.dataset={}; this.listeners=new Map(); this.textContent='';this.complete=false;this.open=false;this.disabled=false;this.muted=false; }
  append(...x) { this.children.push(...x); }
  replaceChildren(...x) { this.children=x; }
  addEventListener(t,fn) { this.listeners.set(t,fn); }
  setAttribute() {}
  focus() {}
  pause() {}
  play() { return Promise.resolve(); }
  load() {}
  showModal() { this.open=true; }
  close() { this.open=false; }
  querySelectorAll() { return this.children; }
  querySelector() { return this.children[0] ?? new Element(); }
  click() { this.listeners.get('click')?.({stopPropagation(){}}); }
}
function makeEngine(storage=new Storage()) {
  globalThis.localStorage=storage;
  const els=new Map();
  globalThis.document={querySelector(s){if(!els.has(s))els.set(s,new Element());return els.get(s);},createElement(tag){return new Element(tag);}};
  globalThis.window={addEventListener(){},matchMedia(){return {matches:false};}};
  const e=new GameEngine({chapter,assetManifest,sceneLibrary:{},memoryLibrary});
  e.typeText=function(text){this.els.text.textContent=text;this.isTyping=false;this.awaitingChoiceReveal=!!this.chapter.nodes[this.nodeId].choices;};
  return e;
}

function snapshot(outing, nodeId = `OPEN-A-ENTRY-PENDING-${outing === 'xt04' ? 'X' : 'J'}`) {
  return {nodeId, stats:{...chapter.initialState, met_xu_tang:1, met_jiang_yucheng:1}, flags:[
    'contact_xu','contact_jyc','open_a_entered',`open_a_entry_outcome:pending_${outing === 'xt04' ? 'xu' : 'jyc'}`,
    'preview:com02j-complete','player_knows_jyc_name','jyc_knows_player_name','jyc_creator_work_seen','jyc_com03j_reply_style:warm_close','unrelated:preserved'
  ], returnNodes:[]};
}
function seeded(outing,version=2,mutate=()=>{}) {
  const storage = new Storage(), snap=snapshot(outing);mutate(snap);
  storage.setItem(`${chapter.id}:journey:v${version}`,JSON.stringify(version===2
    ? {version,playerDisplayName:'小雨',cursor:snap,frontier:snap,runComplete:true,checkpoints:{[snap.nodeId]:snap},edges:[]}
    : {version,current:snap,checkpoints:{[snap.nodeId]:snap},edges:[]}));
  const e=makeEngine(storage);e.progress.setPlayerName('小雨');e.startFromTitle();return {e,storage};
}
function walk(e, choices={}, stop=game=>chapter.nodes[game.nodeId].type==='route') {
  const visited=[];
  for(let i=0;i<350;i++) {
    visited.push(e.nodeId);if(stop(e)) return visited;
    const node=chapter.nodes[e.nodeId];
    if(node.choices) {
      const id=choices[e.nodeId]??node.choices[0].id, index=node.choices.findIndex(c=>c.id===id);
      assert.ok(index>=0,`${e.nodeId}: ${id}`);e.enterChoiceMode(node.choices);e.els.choices.children[index].click();
    } else e.advance();
  }
  assert.fail(`stuck at ${e.nodeId}`);
}
const stopId = outing => `${outing==='xt04'?'XT-04':'JYC-05'}-COMPLETED-PREVIEW-STOP`;
const memory = outing => memoryLibrary.events.find(x=>x.id===`mem.opening.ch1.${outing==='xt04'?'xt-04':'jyc-05'}`);
const paceChoices = {
  shared_pace:{},schedule_negotiated:{'XT-04-PACE':'xt-04-ask-plan'},
  local_humor:{'XT-04-PACE':'xt-04-joke-wait'},
  unresolved_imposed_plan:{'XT-04-PACE':'xt-04-ask-plan','XT-04-SCHEDULE-ACTION':'xt-04-impose'}
};
for (const version of [1,2]) for(const outing of ['xt04','jyc05']) test(`old v${version} ${outing} pending Continue reaches true outing without confirming again`,()=>{
  const {e}=seeded(outing,version);
  assert.equal(e.nodeId,outing==='xt04'?'XT-04-ARRIVE':'JYC-05-ENTRY');
  assert.ok(!e.state.flags.has('open_a_window1_consumed'));
  const visited=walk(e);assert.equal(e.nodeId,stopId(outing));
  assert.ok(!visited.some(id=>id.startsWith('OPEN-A-')));
  assert.ok(e.state.flags.has(`open_a_window1_completed:${outing}`));
  assert.ok(e.state.flags.has('open_a_window1_consumed'));
  assert.ok(e.state.flags.has('unrelated:preserved'));
});
for(const [outcome,choices] of Object.entries(paceChoices)) for(const duration of ['short','finish']) test(`Xu ${outcome}, ${duration}: distinct continuation and once-only reload`,()=>{
  let {e,storage}=seeded('xt04');
  assert.ok(isMemoryUnlocked(memory('xt04'),e.progress,chapter.startNode));
  assert.ok(!isMemoryUnlocked(memory('jyc05'),e.progress,chapter.startNode));
  const selected={...choices,'XT-04-DRINK-DURATION':`xt-04-drink-${duration}`};
  walk(e,selected,g=>g.nodeId==='XT-04-DRINK-LOCAL-'+outcome);
  assert.ok(!e.state.flags.has('open_a_window1_consumed'));
  const mid=structuredClone(e.progress.data.cursor);
  e=makeEngine(storage);e.startFromTitle();assert.deepEqual(e.progress.data.cursor,mid);
  const visited=walk(e,selected);assert.ok(!visited.some(id=>id.includes('DRINK-LOCAL-')&&!id.includes(outcome)));
  assert.ok(e.state.flags.has('xt04_pace_outcome:'+outcome));
  assert.equal(e.state.flags.has('xt_respected_pace'),outcome==='shared_pace');
  const complete=structuredClone(e.progress.data.frontier);e.render();assert.deepEqual(e.progress.data.frontier,complete);
  e=makeEngine(storage);e.startFromTitle();assert.equal(e.nodeId,stopId('xt04'));assert.deepEqual(e.progress.data.frontier,complete);
});
for(const stance of ['candid','playful','warm']) for(const support of ['wait','answer']) test(`Jiang ${stance}/${support} keeps its shop and exit facts`,()=>{
  const {e}=seeded('jyc05');const visited=walk(e,{'JYC-05-COMPARE':`jyc-05-${stance}`,'JYC-05-SUPPORT':`jyc-05-${support}`});
  const suffix=support.toUpperCase();assert.ok(visited.includes('JYC-05-SHOP-'+suffix));assert.ok(visited.includes('JYC-05-EXIT-'+suffix));
  assert.ok(!visited.includes('JYC-05-EXIT-'+(suffix==='WAIT'?'ANSWER':'WAIT')));
  assert.ok(e.state.flags.has('jyc_seen_in_element'));
  assert.ok(e.state.flags.has('jyc05_support_outcome:'+(support==='wait'?'waited_for_her_answer':'answered_for_her')));
  assert.ok(!e.state.flags.has('repair_completed'));
});
for(const outing of ['xt04','jyc05']) for(const harmfulLive of [false,true]) test(`${outing} opposite branch replay and reload preserve exact live checkpoint`,()=>{
  let {e,storage}=seeded(outing);
  const harm=outing==='xt04'?paceChoices.unresolved_imposed_plan:{'JYC-05-SUPPORT':'jyc-05-answer'};
  walk(e,harmfulLive?harm:{});
  const live=structuredClone({frontier:e.progress.data.frontier,cursor:e.progress.data.cursor,checkpoints:e.progress.data.checkpoints,edges:e.progress.data.edges,rank:e.progress.data.frontierRank,complete:e.progress.data.runComplete});
  e.replayMemory(memory(outing));assert.ok(e.progress.data.c1Replay);
  walk(e,harmfulLive?{}:harm,g=>g.nodeId===(outing==='xt04'?'XT-04-LEAVE':'JYC-05-REWARD'));
  e=makeEngine(storage);assert.ok(e.progress.data.c1Replay);assert.ok(e.progress.replaying);e.startFromTitle();
  walk(e,harmfulLive?{}:harm,g=>!g.progress.data.c1Replay);
  assert.deepEqual({frontier:e.progress.data.frontier,cursor:e.progress.data.cursor,checkpoints:e.progress.data.checkpoints,edges:e.progress.data.edges,rank:e.progress.data.frontierRank,complete:e.progress.data.runComplete},live);
  assert.equal(e.progress.replaying,false);
  e=makeEngine(storage);assert.equal(e.progress.replaying,false);e.startFromTitle();assert.equal(e.nodeId,stopId(outing));assert.deepEqual(e.progress.data.frontier,live.frontier);
});
for(const [name,mutate] of [
  ['missing real Xu contact',s=>s.flags=s.flags.filter(f=>f!=='contact_xu')],
  ['wrong pending plan',s=>s.flags=s.flags.map(f=>f==='open_a_entry_outcome:pending_xu'?'open_a_entry_outcome:pending_jyc':f)],
  ['consumed life slot',s=>s.flags.push('open_a_window1_consumed','open_a_entry_outcome:solo')],
  ['mixed completion',s=>s.flags.push('open_a_window1_completed:xt04','open_a_window1_completed:jyc05','open_a_window1_consumed')],
  ['direct unearned completion',s=>s.nodeId=stopId('xt04')]
]) test(`C1 rejects ${name} before completion effects`,()=>{
  assert.throws(()=>seeded('xt04',2,mutate),/BLOCKED_C1/);
});
for(const [name,mutate] of [
 ['no contact',s=>s.flags=s.flags.filter(f=>f!=='contact_jyc')],
 ['nevermet',s=>s.stats.met_jiang_yucheng=0],
 ['excluded',s=>{s.flags.push('jyc_permanently_excluded');s.flags=s.flags.filter(f=>!['jyc_creator_work_seen','player_knows_jyc_name','jyc_knows_player_name'].includes(f));}],
 ['missing online predecessor',s=>s.flags=s.flags.filter(f=>!f.startsWith('jyc_com03j_reply_style:'))]
]) test(`C1 Jiang ${name} cannot mint outing completion`,()=>{
  if(name==='excluded') {
    const {e}=seeded('jyc05',2,mutate);assert.ok(!e.nodeId.startsWith('JYC-05'));assert.ok(!e.state.flags.has('open_a_window1_consumed'));
  } else assert.throws(()=>seeded('jyc05',2,mutate),/BLOCKED_C1/);
});
test('completion storage failure exposes persistence failure without half-consuming a saved slot',()=>{
  const {e,storage}=seeded('xt04');walk(e,{},g=>g.nodeId==='XT-04-END_08');
  const before=storage.getItem(e.progress.key);const save=storage.setItem.bind(storage);storage.setItem=(key,value)=>{if(key===e.progress.key)throw Error('quota');save(key,value);};e.advance();
  assert.equal(e.progress.persisted,false);assert.ok(e.state.flags.has('open_a_window1_consumed'));
  assert.equal(storage.getItem(e.progress.key),before);
  const reload=makeEngine(storage);assert.ok(!reload.progress.data.cursor.flags.includes('open_a_window1_consumed'));
});

test('replay from a still-live first outing returns to the exact unconsumed main mode',()=>{
  let {e,storage}=seeded('xt04');walk(e,{},g=>g.nodeId==='XT-04-BOOKS');
  const main=structuredClone(e.progress.data.cursor);assert.equal(e.progress.data.runComplete,false);
  e.replayMemory(memory('xt04'));walk(e,paceChoices.unresolved_imposed_plan,g=>!g.progress.data.c1Replay);
  assert.deepEqual(e.progress.data.cursor,main);assert.deepEqual(e.progress.data.frontier,main);
  assert.equal(e.progress.data.runComplete,false);assert.equal(e.progress.replaying,false);
  e=makeEngine(storage);e.startFromTitle();assert.equal(e.nodeId,main.nodeId);assert.ok(!e.state.flags.has('open_a_window1_consumed'));
});
test('explicit fresh run never imports a collected C1 completion',()=>{
  const {e}=seeded('xt04');walk(e);const frontier=structuredClone(e.progress.data.frontier);
  e.startGame({freshRun:true});assert.ok(![...e.state.flags].some(f=>f.startsWith('open_a_window1_completed:')));assert.deepEqual(e.progress.data.frontier,frontier);
});

const canonical = e => structuredClone({cursor:e.progress.data.cursor,frontier:e.progress.data.frontier,
  checkpoints:e.progress.data.checkpoints,edges:e.progress.data.edges,rank:e.progress.data.frontierRank,
  event:e.progress.data.frontierMemoryEventId,complete:e.progress.data.runComplete,
  restart:e.progress.data.restartActive,replay:e.progress.replaying});
const plan = outing => ({'OPEN-A-ENTRY-ACTION-BOTH':outing==='xt04'?'OPEN-A-ACT-X':'OPEN-A-ACT-J'});
for(const outing of ['xt04','jyc05']) for(const completed of [false,true]) test(`${outing} ${completed?'completed':'middle'} predecessor replay protects return before/during/after C1 reload`,()=>{
  const storage=new Storage(), entry=snapshot(outing,'OPEN-A-ENTRY');
  entry.flags=entry.flags.filter(f=>!f.startsWith('open_a_entry_outcome:'));
  let e=makeEngine(storage);e.progress.setPlayerName('小雨');e.resumeGame(entry);
  const middle=outing==='xt04'?'XT-04-BOOKS':'JYC-05-EXHIBIT';
  const harmful=outing==='xt04'?paceChoices.unresolved_imposed_plan:{'JYC-05-SUPPORT':'jyc-05-answer'};
  walk(e,{...plan(outing),...harmful},g=>g.nodeId===(completed?stopId(outing):middle));
  const main=canonical(e), opposite=outing==='xt04'?'jyc05':'xt04';
  const replay={replayNode:'OPEN-A-ENTRY',unlockNodes:['OPEN-A-ENTRY']};
  e.replayMemory(replay);
  assert.ok(e.progress.data.c1Replay);assert.deepEqual(e.progress.data.c1Replay.returnCursor,main.cursor);
  e=makeEngine(storage);assert.ok(e.progress.data.c1Replay);e.startFromTitle();
  assert.equal(e.nodeId,'OPEN-A-ENTRY');assert.deepEqual(e.progress.data.checkpoints,main.checkpoints);
  walk(e,plan(opposite),g=>g.nodeId===(opposite==='xt04'?'XT-04-BOOKS':'JYC-05-EXHIBIT'));
  e=makeEngine(storage);e.startFromTitle();assert.ok(e.progress.data.c1Replay);
  assert.deepEqual(e.progress.data.frontier,main.frontier);assert.deepEqual(e.progress.data.checkpoints,main.checkpoints);
  walk(e,plan(opposite),g=>!g.progress.data.c1Replay);
  assert.deepEqual(canonical(e),main);
  assert.ok(e.progress.data.unlockedMemoryEventIds.includes(memory(opposite).id));
  e=makeEngine(storage);assert.deepEqual(canonical(e),main);e.startFromTitle();
  assert.equal(e.nodeId,main.cursor.nodeId);assert.deepEqual(canonical(e),main);
});
