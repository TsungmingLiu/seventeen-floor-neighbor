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
function play(choices={},storage=new Storage()) {
  const e=makeEngine(storage);e.progress.setPlayerName('小雨');e.startGame();
  const visited=[];
  for(let step=0;step<1500;step++) {
    const id=e.nodeId;visited.push(id);
    if(chapter.nodes[id].type==='route') return {e,visited,storage};
    const node=chapter.nodes[id];
    if(node.choices) {
      const requested=choices[id]??node.choices[0].id;
      const index=node.choices.findIndex(c=>c.id===requested);
      assert.ok(index>=0,`${id} has choice ${requested}`);
      e.enterChoiceMode(node.choices);e.els.choices.children[index].click();
    } else e.advance();
    assert.notEqual(e.nodeId,id,`stuck at ${id}`);
  }
  assert.fail(`route did not finish: ${e.nodeId}`);
}

test('real Opening bookstore visit reaches mandatory cafe and contact before the finite Xu arrangement',()=>{
  const {e,visited}=play({'common_bookstore_bridge_weekend_decision':'com01b_bookstore_go','common_station_cafe_jyc_contact_choice':'com02j_offer_discord','OPEN-A-ENTRY-ACTION-BOTH':'OPEN-A-ACT-X','OPEN-A-X-REPLY':'OPEN-A-X-ACCEPT'});
  assert.ok(visited.indexOf('common_acg_first_meet_enter')<visited.indexOf('common_station_cafe_jyc_enter'));
  assert.ok(visited.indexOf('common_station_cafe_jyc_enter')<visited.indexOf('common_convenience_xu_enter'), visited.filter(id => /cafe_jyc_enter|convenience_xu_enter|acg_first_meet_exit|opening_demo_complete/.test(id)).join(','));
  assert.ok(visited.includes('common_recommend_discord_jyc_enter'));
  assert.ok(visited.includes('COM03M-S01'));
  assert.equal(e.nodeId,'OPEN-A-ENTRY-PENDING-X');
  assert.ok(e.state.flags.has('contact_jyc'));
  assert.ok(e.state.flags.has('open_a_entered'));
  assert.ok(!e.state.flags.has('open_a_window1_consumed'));
});

test('real Opening skip-both route keeps Jiang unseen and reaches a consumed solo boundary',()=>{
  const {e,visited}=play({'common_bookstore_bridge_weekend_decision':'com01b_bookstore_skip','common_bookstore_bridge_cafe_decision':'com01b_cafe_skip_after_bookstore_skip','OPEN-A-ENTRY-ACTION-X':'OPEN-A-ACT-LIFE','OPEN-A-LIFE-ACTION':'OPEN-A-LIFE-SOLO'});
  assert.equal(e.nodeId,'OPEN-A-ENTRY-SOLO');
  assert.equal(e.state.met_jiang_yucheng,0);
  assert.ok(!e.state.flags.has('contact_jyc'));
  assert.ok(!visited.some(id=>id.startsWith('common_acg_first_meet_')||id.startsWith('common_station_cafe_jyc_')||id.startsWith('common_recommend_discord_jyc_')));
  assert.ok(!e.progress.data.checkpoints.common_acg_first_meet_enter);
  assert.ok(!e.progress.data.checkpoints.common_station_cafe_jyc_first_enter);
  assert.ok(!e.progress.data.checkpoints.common_recommend_discord_jyc_enter);
});

test('first cafe meeting with refused contact keeps Memory truthful and bypasses Discord',()=>{
  const {e,visited}=play({'common_bookstore_bridge_weekend_decision':'com01b_bookstore_skip','common_bookstore_bridge_cafe_decision':'com01b_cafe_go_after_bookstore_skip','common_station_cafe_jyc_contact_choice':'com02j_leave_without_contact','OPEN-A-ENTRY-ACTION-X':'OPEN-A-ACT-LIFE','OPEN-A-LIFE-ACTION':'OPEN-A-LIFE-REST'});
  assert.equal(e.nodeId,'OPEN-A-ENTRY-REST');
  assert.ok(visited.includes('common_station_cafe_jyc_first_enter'));
  assert.ok(!visited.includes('common_acg_first_meet_enter'));
  assert.ok(!visited.includes('common_recommend_discord_jyc_enter'));
  assert.equal(e.state.met_jiang_yucheng,1);
  assert.ok(!e.state.flags.has('contact_jyc'));
  const byId=id=>memoryLibrary.events.find(event=>event.id===id);
  assert.ok(isMemoryUnlocked(byId('mem.opening.ch1.first-cafe-jyc'),e.progress,chapter.startNode));
  assert.ok(!isMemoryUnlocked(byId('mem.opening.ch1.station-cafe-jyc'),e.progress,chapter.startNode));
  assert.ok(!isMemoryUnlocked(byId('mem.opening.ch1.recommend-discord-jyc'),e.progress,chapter.startNode));
  assert.equal(e.progress.data.frontierMemoryEventId,'mem.opening.ch1.convenience-xu');
});

test('legacy mid Discord save without contact resumes through the honest no-contact exit',()=>{
  const storage=new Storage();
  const snapshot={nodeId:'common_recommend_discord_jyc_enter_02',stats:{...chapter.initialState,met_jiang_yucheng:1},flags:['contact_xu','preview:com02j-complete'],returnNodes:[]};
  storage.setItem(`${chapter.id}:journey:v2`,JSON.stringify({version:2,playerDisplayName:'小雨',cursor:snapshot,frontier:snapshot,runComplete:false,checkpoints:{[snapshot.nodeId]:snapshot},edges:[]}));
  const e=makeEngine(storage);
  assert.equal(e.progress.data.cursor.nodeId,'common_recommend_discord_jyc_no_contact_exit');
  assert.equal(e.progress.data.frontier.nodeId,'common_recommend_discord_jyc_no_contact_exit');
  e.startFromTitle();
  assert.equal(e.nodeId,'COM03M-S01');
  assert.ok(!e.state.flags.has('contact_jyc'));
});

test('finite arrangement and solo boundaries survive reload without consuming pending time',()=>{
  const pending=play({'common_bookstore_bridge_weekend_decision':'com01b_bookstore_go','common_station_cafe_jyc_contact_choice':'com02j_offer_discord','OPEN-A-ENTRY-ACTION-BOTH':'OPEN-A-ACT-J','OPEN-A-J-TIME':'OPEN-A-J-ACCEPT'});
  assert.equal(pending.e.nodeId,'OPEN-A-ENTRY-PENDING-J');
  const reloaded=makeEngine(pending.storage);
  assert.equal(reloaded.progress.data.cursor.nodeId,'OPEN-A-ENTRY-PENDING-J');
  assert.equal(reloaded.progress.data.runComplete,true);
  assert.ok(reloaded.progress.data.cursor.flags.includes('open_a_entered'));
  assert.ok(!reloaded.progress.data.cursor.flags.includes('open_a_window1_consumed'));
  const solo=play({'common_bookstore_bridge_weekend_decision':'com01b_bookstore_skip','common_bookstore_bridge_cafe_decision':'com01b_cafe_skip_after_bookstore_skip','OPEN-A-ENTRY-ACTION-X':'OPEN-A-ACT-LIFE','OPEN-A-LIFE-ACTION':'OPEN-A-LIFE-WAIT'});
  assert.equal(solo.e.nodeId,'OPEN-A-ENTRY-WAIT');
  const saved=makeEngine(solo.storage);
  assert.equal(saved.progress.data.cursor.nodeId,'OPEN-A-ENTRY-WAIT');
  assert.ok(saved.progress.data.cursor.flags.includes('open_a_entered'));
});

test('counteroffer stays pending while declined invitations return to an own-life slot',()=>{
  const counter=play({'common_bookstore_bridge_weekend_decision':'com01b_bookstore_go','common_station_cafe_jyc_contact_choice':'com02j_offer_discord','OPEN-A-ENTRY-ACTION-BOTH':'OPEN-A-ACT-X','OPEN-A-X-REPLY':'OPEN-A-X-EARLIER','OPEN-A-X-COUNTER-REPLY':'OPEN-A-X-KEEP-TIME'});
  assert.equal(counter.e.nodeId,'OPEN-A-ENTRY-PENDING-X');
  assert.ok(!counter.e.state.flags.has('open_a_window1_consumed'));
  for(const [invite,decline] of [['OPEN-A-ACT-X','OPEN-A-X-DECLINE'],['OPEN-A-ACT-J','OPEN-A-J-DECLINE']]){
    const choices={'common_bookstore_bridge_weekend_decision':'com01b_bookstore_go','common_station_cafe_jyc_contact_choice':'com02j_offer_discord','OPEN-A-ENTRY-ACTION-BOTH':invite,'OPEN-A-LIFE-ACTION':'OPEN-A-LIFE-REST'};
    choices[invite==='OPEN-A-ACT-X'?'OPEN-A-X-REPLY':'OPEN-A-J-TIME']=decline;
    const {e,visited}=play(choices);
    assert.equal(e.nodeId,'OPEN-A-ENTRY-REST');
    assert.ok(visited.includes('OPEN-A-LIFE-ACTION'));
    assert.ok(!e.state.flags.has('open_a_window1_consumed'));
  }
});

test('Discord Memory replay uses its contact snapshot and leaves the completed frontier intact',()=>{
  const {e}=play({'common_bookstore_bridge_weekend_decision':'com01b_bookstore_go','common_station_cafe_jyc_contact_choice':'com02j_offer_discord','OPEN-A-ENTRY-ACTION-BOTH':'OPEN-A-ACT-LIFE','OPEN-A-LIFE-ACTION':'OPEN-A-LIFE-SOLO'});
  const before=structuredClone(e.progress.data.frontier);
  const event=memoryLibrary.events.find(x=>x.id==='mem.opening.ch1.recommend-discord-jyc');
  e.replayMemory(event);
  assert.equal(e.nodeId,'common_recommend_discord_jyc_enter');
  assert.ok(e.state.flags.has('contact_jyc'));
  for(let step=0;step<110 && e.progress.data.com03jReplay;step++) {
    const node=chapter.nodes[e.nodeId];
    if(node.choices){e.enterChoiceMode(node.choices);e.els.choices.children[1].click();}
    else e.advance();
  }
  assert.equal(e.progress.data.com03jReplay,null);
  assert.deepEqual(e.progress.data.frontier,before);
  assert.ok(!e.progress.data.cursor.flags.includes('jyc_com03j_reply_style:warm_close'));
});
