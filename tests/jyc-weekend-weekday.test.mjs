import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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
function play(choices={},storage=new Storage(),options={},stopAt=null) {
  const e=makeEngine(storage);e.progress.setPlayerName('小雨');e.startGame(options);
  const visited=[];
  for(let step=0;step<1500;step++) {
    const id=e.nodeId;visited.push(id);
    if(id===stopAt || chapter.nodes[id].type==='route') return {e,visited,storage};
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


const defaults = {
  'common_bookstore_bridge_weekend_decision': 'com01b_bookstore_skip',
  'common_weekday_outing_decision': 'com01b_weekday_street_walk',
  'common_station_cafe_jyc_contact_choice': 'com02j_offer_discord',
  'OPEN-A-ENTRY-ACTION-X': 'OPEN-A-ACT-LIFE',
  'OPEN-A-ENTRY-ACTION-BOTH': 'OPEN-A-ACT-LIFE',
  'OPEN-A-LIFE-ACTION': 'OPEN-A-LIFE-SOLO'
};
const pathChoices = path => ({ ...defaults,
  'common_bookstore_bridge_weekend_decision': path === 'A' ? 'com01b_bookstore_go' : 'com01b_bookstore_skip',
  'common_weekday_outing_decision': path === 'C' ? 'com01b_weekday_street_walk' : 'com01b_weekday_cafe_first'
});
function order(visited, ids) {
  let previous = -1;
  for (const id of ids) { const position = visited.indexOf(id); assert.ok(position > previous, id); previous = position; }
}
for (const path of ['A','B','C']) {
  test(`full path ${path} has the approved cadence and truthful contact state`, () => {
    const { e, visited } = play(pathChoices(path));
    order(visited, [path === 'A' ? 'common_acg_first_meet_purchase' : 'common_weekend_home_enter',
      'common_convenience_xu_enter', path === 'A' ? 'common_convenience_xu_weekend_book' : 'common_convenience_xu_weekend_home',
      'common_weekday_outing_work', 'common_weekday_outing_tired',
      path === 'A' ? 'common_station_cafe_jyc_enter' : path === 'B' ? 'common_station_cafe_jyc_first_enter' : 'common_weekday_outing_street_enter',
      'common_package_xu_arrive', 'COM03M-S01', 'OPEN-A-ENTRY']);
    assert.equal(e.state.flags.has('weekend_book_purchased'), path === 'A');
    assert.equal(e.state.flags.has('contact_jyc'), path !== 'C');
    assert.equal(e.state.flags.has('jyc_permanently_excluded'), path === 'C');
    assert.equal(e.nodeId, 'OPEN-A-ENTRY-SOLO');
    assert.ok(e.state.flags.has('open_a_window1_consumed'));
    if (path === 'C') {
      assert.equal(e.state.met_jiang_yucheng, 0);
      assert.ok(!visited.some(id => /acg_first_meet|cafe_jyc|discord_jyc|COM03M-J|COM03M-BJ|OPEN-A-J/.test(id)));
    }
  });
}
for (const path of ['A','B']) {
  test(`path ${path} ordinary cafe nonexchange preserves acquaintance, then Xu-only continuation`, () => {
    const { e, visited } = play({ ...pathChoices(path), common_station_cafe_jyc_contact_choice: 'com02j_leave_without_contact' });
    assert.equal(e.state.met_jiang_yucheng, 1);
    assert.ok(!e.state.flags.has('contact_jyc'));
    assert.ok(!e.state.flags.has('jyc_permanently_excluded'));
    assert.ok(!visited.some(id => /discord_jyc_enter|COM03M-J|OPEN-A-J/.test(id)));
    assert.ok(![...e.state.flags].some(flag => /cooling|reopening|romanticSignal/.test(flag)));
  });
}
test('permanent street exclusion defeats imported contact, names, topics and every current Jiang content entry', () => {
  const flags = ['jyc_permanently_excluded', 'contact_jyc', 'contact_xu', 'preview:com02j-complete', 'player_knows_jyc_name', 'jyc_knows_player_name', 'jyc_creator_work_seen', 'jyc_second_topic:her_art', 'history:jyc_first_topic:worldbuilding'];
  const e = makeEngine(); e.progress.setPlayerName('小雨'); e.state = { ...chapter.initialState, met_jiang_yucheng: 1, flags: new Set(flags) };
  e.nodeId = 'com03x_preview_complete'; e.render();
  for (let i=0;i<300 && chapter.nodes[e.nodeId].type!=='route';i++) {
    assert.ok(!/COM03M-J(?!.*GATE)|COM03M-BJ|discord_jyc|OPEN-A-J/.test(e.nodeId), e.nodeId);
    const node=chapter.nodes[e.nodeId];
    if(node.choices) { e.enterChoiceMode(node.choices); const idx=node.choices.findIndex(c => c.id === defaults[e.nodeId]); e.els.choices.children[idx >= 0 ? idx : 0].click(); }
    else e.advance();
  }
  assert.equal(e.nodeId,'OPEN-A-ENTRY-SOLO');
  assert.ok(e.state.flags.has('jyc_permanently_excluded'));
  for (const id of Object.keys(chapter.nodes).filter(id => /^(common_acg_first_meet_|common_station_cafe_jyc_|com02j_|common_recommend_discord_jyc_|OPEN-A-J-)/.test(id))) {
    const fresh=makeEngine();fresh.progress.setPlayerName('小雨');fresh.state={...chapter.initialState,flags:new Set(flags)};fresh.nodeId=id;fresh.render();
    assert.ok(!/^(common_acg_first_meet_|common_station_cafe_jyc_|com02j_|common_recommend_discord_jyc_|OPEN-A-J-)/.test(fresh.nodeId),id);
  }
});
for (const path of ['A','B','C']) {
  test(`path ${path} reload preserves exact work, tired, cafe/street cursor and state without rank rewind`, () => {
    const {e}=play(pathChoices(path));
    const ids=Object.keys(e.progress.data.checkpoints).filter(id => /^(common_weekday_outing_(work|tired|decision|street)|common_station_cafe_jyc_(enter|first_enter|names|first_names|parallel|share|exit))/.test(id));
    assert.ok(ids.length > 8);
    for (const id of ids) {
      const snapshot=structuredClone(e.progress.data.checkpoints[id]);
      const storage=new Storage();storage.setItem(e.progress.key,JSON.stringify({version:2,playerDisplayName:'小雨',cursor:snapshot,frontier:snapshot,checkpoints:{[id]:snapshot},edges:[]}));
      const reload=makeEngine(storage);
      assert.equal(reload.progress.data.frontier.nodeId,id,id);
      assert.deepEqual(reload.progress.restore(reload.progress.data.frontier).state.flags,new Set(snapshot.flags));
      reload.startFromTitle(); assert.equal(reload.nodeId,id,id);
      assert.equal(reload.progress.data.com02jSupplement,null);
    }
  });
}
test('Memory IDs, ownership and ranks retain legacy identities while chronological progress increases', () => {
  const byId=id=>memoryLibrary.events.find(e=>e.id==='mem.opening.ch1.'+id);
  assert.equal(memoryLibrary.events.length,10);
  assert.equal(byId('weekend-home').progressRank,140);
  assert.equal(byId('convenience-xu').progressRank,160);
  assert.equal(byId('weekday-outing').progressRank,170);
  for(const id of ['station-cafe-jyc','first-cafe-jyc']) assert.equal(byId(id).progressRank,180);
  assert.equal(byId('taipei-street').progressRank,185);
  for(const id of ['weekend-home','weekday-outing','taipei-street']) {
    const event=byId(id);assert.ok(event.unlockNodes.includes(event.replayNode));assert.deepEqual(event.galleryAssets,[]);
  }
});
test('old v1/v2 cafe skip/refusal and excluded late saves migrate without inventing an irreversible choice', () => {
  for(const version of [1,2])for(const excluded of [false,true]) {
    const storage=new Storage();const snap={nodeId:excluded?'common_recommend_discord_jyc_enter':'com01b_cafe_skip_after_bookstore_skip',stats:{...chapter.initialState},flags:excluded?['jyc_permanently_excluded','contact_jyc','contact_xu']:['contact_xu'],returnNodes:[]};
    storage.setItem(`${chapter.id}:journey:v${version}`,JSON.stringify(version===1?{version,current:snap,checkpoints:{[snap.nodeId]:snap}}:{version,cursor:snap,frontier:snap,checkpoints:{[snap.nodeId]:snap}}));
    const reload=makeEngine(storage);
    assert.equal(reload.progress.data.cursor.flags.includes('jyc_permanently_excluded'),excluded);
    assert.equal(reload.progress.data.com02jSupplement,null);
    if(excluded)assert.equal(reload.progress.data.cursor.nodeId,'COM03M-ENTRY');
  }
});
test('snapshot replay of an earlier alternative leaves excluded live frontier and permanent flag unchanged', () => {
  const {e}=play(pathChoices('C'));const frontier=structuredClone(e.progress.data.frontier);
  e.progress.beginReplay(e.progress.data.checkpoints.common_weekday_outing_decision);
  e.nodeId='common_weekday_outing_decision';e.state=e.progress.restore(e.progress.data.cursor).state;e.render();
  e.enterChoiceMode(chapter.nodes[e.nodeId].choices);e.els.choices.children[0].click();
  assert.equal(e.nodeId,'com01b_weekday_cafe_first');
  assert.deepEqual(e.progress.data.frontier,frontier);
  assert.ok(e.progress.data.frontier.flags.includes('jyc_permanently_excluded'));
});

test('book-page choice replaces stale drawing topic without inventing a drawing callback', () => {
  const e=makeEngine();e.progress.setPlayerName('小雨');e.nodeId='common_station_cafe_jyc_choice_worldbuilding';
  e.state={...chapter.initialState,flags:new Set(['jyc_second_topic:her_art','history:jyc_first_topic:worldbuilding'])};
  e.enterChoiceMode(chapter.nodes[e.nodeId].choices);e.els.choices.children[0].click();
  assert.ok(!e.state.flags.has('jyc_second_topic:her_art'));
  assert.ok(e.state.flags.has('jyc_second_topic:shared_work'));
});

test('active revised passages retain every turn in approved order along their actual paths', () => {
  const role=/^\*\*(Narration|Action|Protagonist(?: \(thought\))?|Xu Tang(?:（off-screen）)?|Jiang Yucheng)\*\*：(.+)$/gm;
  for(const scene of ['COM-01B','COM-01J','COM-02X']) {
    let prose=readFileSync(new URL(`../docs/narrative/scenes/vertical-slice/${scene}.md`,import.meta.url),'utf8');
    prose=scene==='COM-01B'?prose.split('### Current playable script\n')[1].split('### Semantic visual change report')[0]:prose.split('## Locked playable script')[1].split('## State contract')[0];
    for(const block of prose.matchAll(/^#{3,4} (?:Branch )?`([^`]+)`[^\n]*\n([\s\S]*?)(?=^#{3,4} |(?![\s\S]))/gm)) {
      const [,anchor,body]=block;
      if(!chapter.nodes[anchor] || /choice|decision|share_work/.test(anchor))continue;
      const expected=[...body.matchAll(role)].map(m=>m[2]);if(!expected.length)continue;
      let id=anchor,actual=[];
      for(let i=0;i<expected.length+4;i++) {
        const node=chapter.nodes[id];assert.ok(node,anchor);
        if(node.text)actual.push(node.text);
        if(actual.length===expected.length)break;
        id=node.type==='branch'?node.default:node.next;
      }
      assert.deepEqual(actual,expected,`${scene}/${anchor}`);
    }
  }
});

test('approved thought turns use thought presentation without changing their prose', () => {
  for (const scene of ['COM-01B','COM-01J']) {
    let prose=readFileSync(new URL(`../docs/narrative/scenes/vertical-slice/${scene}.md`,import.meta.url),'utf8');
    prose=scene==='COM-01B'?prose.split('### Current playable script\n')[1].split('### Semantic visual change report')[0]:prose.split('## Locked playable script')[1].split('## State contract')[0];
    for (const [,text] of prose.matchAll(/^\*\*Protagonist \(thought\)\*\*：(.+)$/gm)) {
      const turns=Object.values(chapter.nodes).filter(node=>node.text===text);
      assert.ok(turns.length,text);
      assert.ok(turns.every(node=>node.speaker==='內心'||node.presentation==='thought'),text);
    }
  }
});

test('legacy convenience cursors continue to package without fabricated weekend history or permanent exclusion', () => {
  for (const version of [1,2]) for (const nodeId of ['common_convenience_xu_exit_08','opening_demo_complete']) {
    const storage=new Storage();const snap={nodeId,stats:{...chapter.initialState,met_xu_tang:1},flags:['contact_xu','preview:com02x-complete'],returnNodes:[]};
    const frontier=nodeId==='opening_demo_complete'?{...snap,nodeId:'common_convenience_xu_exit_08'}:snap;
    storage.setItem(`${chapter.id}:journey:v${version}`,JSON.stringify(version===1?{version,current:snap,checkpoints:{[nodeId]:snap}}:{version,cursor:snap,frontier,checkpoints:{[frontier.nodeId]:frontier,[nodeId]:snap},runComplete:nodeId==='opening_demo_complete'}));
    const e=makeEngine(storage);e.progress.setPlayerName('小雨');e.startFromTitle();
    for(let i=0;i<20 && e.nodeId!=='common_package_xu_arrive';i++)e.advance();
    assert.equal(e.nodeId,'common_package_xu_arrive',`${version}/${nodeId}`);
    assert.ok(![...e.state.flags].some(flag=>flag.startsWith('history:common_bookstore_bridge_weekend_decision:')));
    assert.ok(!e.state.flags.has('jyc_permanently_excluded'));
  }
});

test('live week/window cursors and all five review boundaries Continue exactly after v1/v2 reload', () => {
  const outcomes = [
    {'OPEN-A-ENTRY-ACTION-BOTH':'OPEN-A-ACT-X','OPEN-A-X-REPLY':'OPEN-A-X-ACCEPT'},
    {'OPEN-A-ENTRY-ACTION-BOTH':'OPEN-A-ACT-J','OPEN-A-J-TIME':'OPEN-A-J-ACCEPT'},
    ...['SOLO','REST','WAIT'].map(outcome=>({'OPEN-A-LIFE-ACTION':`OPEN-A-LIFE-${outcome}`}))
  ];
  const endpoints=new Set();
  for (const choices of outcomes) {
    const {e,storage}=play({...pathChoices('A'),...choices});endpoints.add(e.nodeId);
    assert.equal(e.progress.data.frontier.nodeId,e.nodeId);
    assert.equal(e.progress.data.frontierMemoryEventId,null);
    assert.equal(e.progress.data.frontierRank,260);
    const finalSnapshot=structuredClone(e.progress.data.frontier);
    const reload=makeEngine(storage);reload.refreshTitle();assert.equal(reload.els.startButton.textContent,'繼續遊戲');reload.startFromTitle();
    assert.equal(reload.nodeId,e.nodeId);assert.deepEqual([...reload.state.flags],finalSnapshot.flags);
    for (const [nodeId,snapshot] of Object.entries(e.progress.data.checkpoints).filter(([id])=>/^(COM03M-|OPEN-A-)/.test(id))) {
      for(const version of [1,2]) {
        const saved=new Storage();saved.setItem(`${chapter.id}:journey:v${version}`,JSON.stringify(version===1
          ?{version,current:snapshot,checkpoints:{[nodeId]:snapshot}}
          :{version,playerDisplayName:'小雨',cursor:snapshot,frontier:snapshot,checkpoints:{[nodeId]:snapshot}}));
        const resumed=makeEngine(saved);resumed.progress.setPlayerName('小雨');resumed.startFromTitle();
        assert.equal(resumed.nodeId,nodeId,`${version}/${nodeId}`);
        assert.deepEqual([...resumed.state.flags],snapshot.flags,`${version}/${nodeId}`);
      }
    }
  }
  assert.deepEqual([...endpoints].sort(),['OPEN-A-ENTRY-PENDING-J','OPEN-A-ENTRY-PENDING-X','OPEN-A-ENTRY-REST','OPEN-A-ENTRY-SOLO','OPEN-A-ENTRY-WAIT']);
});

test('week/window Memory replay cannot replace the excluded live frontier or clear its permanent flag', () => {
  const {e}=play(pathChoices('C'));const live=structuredClone(e.progress.data.frontier);
  e.progress.beginReplay(e.progress.data.checkpoints['COM03M-S01']);
  e.progress.capture('OPEN-A-ENTRY', {...chapter.initialState,flags:new Set(['contact_jyc'])}, []);
  assert.deepEqual(e.progress.data.frontier,live);assert.ok(e.progress.data.frontier.flags.includes('jyc_permanently_excluded'));
});

test('bookstore eligibility routes later home replays to reunion while refusal and greatest main survive', () => {
  const { e, storage } = play(pathChoices('A'));
  const frontier = structuredClone(e.progress.data.frontier);
  const unlocked = memoryLibrary.events.filter(event => isMemoryUnlocked(event,e.progress,chapter.startNode)).map(event=>event.id);
  assert.equal(e.progress.data.jycEverUnlocked,true);
  for (const choices of [pathChoices('C'), pathChoices('B')].map(path => ({...path,common_station_cafe_jyc_contact_choice:'com02j_leave_without_contact'}))) {
    const replay = play(choices,storage,{freshRun:true}).e;
    assert.equal(replay.progress.data.jycEverUnlocked,true);
    assert.deepEqual(replay.progress.data.frontier,frontier);
    assert.ok(!replay.state.flags.has('contact_jyc'));
    assert.ok(!replay.state.flags.has('weekend_book_purchased'));
    assert.equal(replay.state.met_jiang_yucheng,1);
    assert.equal(replay.progress.data.bookstoreEverEarned,true);
    assert.ok(replay.state.flags.has('history:cafe-bookstore-reunion'));
    assert.ok(!replay.state.flags.has('jyc_permanently_excluded'));
    for(const id of unlocked) assert.ok(isMemoryUnlocked(memoryLibrary.events.find(event=>event.id===id),replay.progress,chapter.startNode),id);
    const reload=makeEngine(storage);
    assert.equal(reload.progress.data.jycEverUnlocked,true);
    assert.deepEqual(reload.progress.data.frontier,frontier);
    const local=replay.progress.data.checkpoints.common_weekday_outing_work;
    reload.resumeGame(local,{replay:true});
    assert.equal(reload.state.met_jiang_yucheng,0);
    assert.ok(!reload.state.flags.has('contact_jyc'));
  }
  const imported=JSON.parse(storage.getItem(e.progress.key));
  imported.cursor={...structuredClone(frontier),nodeId:'common_recommend_discord_jyc_enter_02',flags:frontier.flags.filter(flag=>flag!=='contact_jyc')};
  imported.restartActive=false;
  const migratedStorage=new Storage();migratedStorage.setItem(e.progress.key,JSON.stringify(imported));
  const migrated=makeEngine(migratedStorage);
  assert.deepEqual(migrated.progress.data.frontier,frontier);
  assert.equal(migrated.progress.data.frontierRank,260);
  assert.equal(migrated.progress.data.jycEverUnlocked,true);
  assert.equal(migrated.progress.data.cursor.nodeId,'common_recommend_discord_jyc_no_contact_exit');
});

test('first-ever unseen street remains locally and persistently unacquainted', () => {
  const { e, storage }=play(pathChoices('C'));
  assert.equal(e.progress.data.jycEverUnlocked,false);
  assert.equal(makeEngine(storage).progress.data.jycEverUnlocked,false);
  for(const event of memoryLibrary.events.filter(event=>event.characterIds.includes('jiang_yucheng'))) assert.ok(!isMemoryUnlocked(event,e.progress,chapter.startNode),event.id);
});

for (const freshRun of [false, true]) {
  test(`actual ${freshRun ? 'fresh restart' : 'weekday Memory replay'} preserves partial known cafe main through street and package`, () => {
    const { e, storage } = play(pathChoices('B'), new Storage(), {}, 'common_station_cafe_jyc_first_names_01');
    const main = structuredClone(e.progress.data.frontier);
    assert.equal(e.progress.data.frontierRank, 180);
    assert.equal(main.stats.met_jiang_yucheng, 1);
    assert.ok(!main.flags.includes('weekend_book_purchased'));
    assert.ok(main.flags.includes('history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip'));
    assert.equal(e.progress.data.bookstoreEverEarned,false);
    let local;
    if (freshRun) {
      local = play(pathChoices('C'), storage, { freshRun: true }, 'common_package_xu_arrive').e;
    } else {
      const homeRun = play(pathChoices('C'), new Storage(), {}, 'common_weekday_outing_work');
      const home = homeRun.e.progress.data.cursor;
      assert.equal(home.stats.met_jiang_yucheng, 0);
      assert.ok(homeRun.visited.includes('common_weekend_home_enter'));
      assert.ok(home.flags.includes('history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip'));
      e.resumeGame(home, { replay: true });
      const visited = [];
      for (let step = 0; step < 200 && e.nodeId !== 'common_package_xu_arrive'; step++) {
        visited.push(e.nodeId);
        const node = chapter.nodes[e.nodeId];
        if (node.choices) {
          e.enterChoiceMode(node.choices);
          const index = node.choices.findIndex(choice => choice.id === pathChoices('C')[e.nodeId]);
          e.els.choices.children[index < 0 ? 0 : index].click();
        } else e.advance();
      }
      assert.ok(visited.includes('common_weekday_outing_street_enter'));
      local = e;
    }
    assert.equal(local.nodeId, 'common_package_xu_arrive');
    const cursor = structuredClone(local.progress.data.cursor);
    assert.equal(local.progress.progressRank(cursor), 200);
    assert.deepEqual(local.progress.data.frontier, main);
    assert.equal(local.progress.data.frontierRank, 180);
    assert.equal(local.progress.data.frontierMemoryEventId, 'mem.opening.ch1.first-cafe-jyc');
    assert.equal(local.progress.replaying, true);
    assert.equal(local.progress.data.restartActive, freshRun);
    const reload = makeEngine(storage);
    assert.deepEqual(reload.progress.data.frontier, main);
    assert.deepEqual(reload.progress.data.cursor, cursor);
    assert.equal(reload.progress.replaying, true);
    assert.equal(reload.progress.data.restartActive, freshRun);
    for (const store of [local.progress, reload.progress]) {
      assert.equal(store.data.jycEverUnlocked, true);
      const actual = store.restore(store.data.cursor).state;
      assert.equal(actual.met_jiang_yucheng, 0);
      assert.ok(actual.flags.has('jyc_permanently_excluded'));
      for (const flag of ['contact_jyc', 'player_knows_jyc_name', 'weekend_book_purchased']) assert.ok(!actual.flags.has(flag));
      for (const id of ['mem.opening.ch1.first-cafe-jyc', 'mem.opening.ch1.taipei-street']) {
        assert.ok(isMemoryUnlocked(memoryLibrary.events.find(event => event.id === id), store, chapter.startNode));
      }
    }
    reload.startFromTitle();
    assert.equal(reload.nodeId, freshRun ? cursor.nodeId : main.nodeId);
    assert.deepEqual(reload.progress.data.frontier, main);
    assert.equal(reload.state.met_jiang_yucheng, freshRun ? 0 : 1);
  });
}

test('real baseline v1/v2 saves continue without invented purchase/home-work or retroactive exclusion', () => {
  const fixture=read('tests/fixtures/jyc-pre-revision-save.json');
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
  for(const [path,identity] of Object.entries(fixture.sources)) {
    const bytes=execFileSync('git',['show',`${fixture.baseline}:${path}`]);
    assert.equal(hash(bytes),identity.sha256);
    assert.equal(execFileSync('git',['rev-parse',`${fixture.baseline}:${path}`],{encoding:'utf8'}).trim(),identity.git_blob);
  }
  assert.equal(fixture.cases.length,30);
  for(const item of fixture.cases) for(const version of [1,2]) {
    const storage=new Storage();const snapshot=structuredClone(item.snapshot);
    storage.setItem(`${chapter.id}:journey:v${version}`,JSON.stringify(version===1
      ?{version,current:snapshot,checkpoints:item.checkpoints}
      :{version,playerDisplayName:'小雨',cursor:snapshot,frontier:snapshot,checkpoints:item.checkpoints}));
    const e=makeEngine(storage);e.progress.setPlayerName('小雨');e.startFromTitle();
    const visited=[];
    for(let step=0;step<1200&&chapter.nodes[e.nodeId].type!=='route';step++) {
      visited.push(e.nodeId);const node=chapter.nodes[e.nodeId];
      if(node.choices) {
        const requested=item.choices[e.nodeId] || defaults[e.nodeId] || node.choices[0].id;
        e.enterChoiceMode(node.choices);const index=node.choices.findIndex(choice=>choice.id===requested);
        e.els.choices.children[index<0?0:index].click();
      } else e.advance();
    }
    assert.equal(chapter.nodes[e.nodeId].type,'route',`${version}/${item.id}`);
    assert.ok(!visited.some(id=>/weekend_home|weekday_outing|acg_first_meet_purchase|convenience_xu_weekend_(book|home)/.test(id)),item.id);
    assert.ok(!e.state.flags.has('weekend_book_purchased'),item.id);
    assert.ok(!e.state.flags.has('jyc_permanently_excluded'),item.id);
    assert.ok(![...e.state.flags].some(flag=>flag.startsWith('entry-effect:common_weekend_home_')),item.id);
    if(snapshot.flags.includes('preview:com02j-complete')&&!snapshot.flags.includes('contact_jyc')) assert.ok(!e.state.flags.has('contact_jyc'),item.id);
  }
});

test('untouched baseline nodes retain exact structural parity outside the approved impacted prefixes', () => {
  const fixture=read('tests/fixtures/jyc-pre-revision-parity.json');
  const bytes=execFileSync('git',['show',`${fixture.baseline}:content/routes/opening-demo/chapter-01.json`]);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),fixture.baseline_chapter_sha256);
  const baseline=JSON.parse(bytes).nodes;
  for(const [id,node] of Object.entries(baseline)) {
    if(!fixture.impacted_prefixes.some(prefix=>id.startsWith(prefix))&&!fixture.explicit_policy_nodes.includes(id)) {
      const current = structuredClone(chapter.nodes[id]);
      if (current.speaker === '許棠' && current.channel === 'LINE') {
        assert.equal(current.speakerLabel,'Line-許棠',id);
        delete current.channel; delete current.speakerLabel;
      }
      assert.deepEqual(current,node,id);
    }
  }
  assert.deepEqual(fixture.unexpected_changed_nodes,[]);
});

function walkEngine(e, choices = {}, stopAt) {
  const visited = [];
  for (let step = 0; step < 1500; step++) {
    const id = e.nodeId; visited.push(id);
    if (id === stopAt || chapter.nodes[id].type === 'route') return visited;
    const node = chapter.nodes[id];
    if (node.choices) {
      const requested = choices[id] ?? node.choices[0].id;
      const index = node.choices.findIndex(choice => choice.id === requested);
      assert.ok(index >= 0, `${id} has choice ${requested}`);
      e.enterChoiceMode(node.choices); e.els.choices.children[index].click();
    } else e.advance();
    assert.notEqual(e.nodeId, id, `stuck at ${id}`);
  }
  assert.fail(`route did not finish: ${e.nodeId}`);
}

test('cafe-only first play and actual cafe Memory replay never earn bookstore reunion', () => {
  const {e,storage} = play(pathChoices('B'));
  assert.equal(e.progress.data.jycEverUnlocked,true);
  assert.equal(e.bookstoreEligible(),false);
  const main = structuredClone(e.progress.data.frontier);
  const reload = makeEngine(storage); reload.progress.setPlayerName('小雨');
  reload.replayMemory(memoryLibrary.events.find(event=>event.id==='mem.opening.ch1.first-cafe-jyc'));
  assert.equal(reload.nodeId,'common_station_cafe_jyc_first_enter');
  const visited = walkEngine(reload, {common_station_cafe_jyc_contact_choice:'com02j_leave_without_contact'}, 'common_station_cafe_jyc_complete');
  assert.ok(visited.includes('common_station_cafe_jyc_first_drawing_02'));
  assert.ok(!visited.includes('common_station_cafe_jyc_drawing_02'));
  assert.equal(reload.bookstoreEligible(),false);
  assert.ok(!reload.state.flags.has('weekend_book_purchased'));
  assert.ok(!reload.state.flags.has('contact_jyc'));
  assert.deepEqual(reload.progress.data.frontier,main);
});

test('street main then actual bookstore replay earns durable eligibility without replacing greatest continuation', () => {
  const {e,storage} = play(pathChoices('C'));
  const main = structuredClone(e.progress.data.frontier);
  const weekday = structuredClone(e.progress.data.checkpoints.common_weekday_outing_work);
  const bookEntry = {nodeId:'common_acg_first_meet_enter', stats:{...chapter.initialState},flags:['preview:jyc-weekend-weekday','history:common_bookstore_bridge_weekend_decision:com01b_bookstore_go'],returnNodes:[]};
  e.resumeGame(bookEntry,{replay:true});
  assert.equal(e.bookstoreEligible(),false);
  walkEngine(e,{},'common_acg_first_meet_worldbuilding');
  assert.equal(e.bookstoreEligible(),false,'choosing topic is not completed encounter');
  walkEngine(e,{},'common_acg_first_meet_purchase');
  assert.equal(e.bookstoreEligible(),true);
  assert.ok(!e.state.flags.has('weekend_book_purchased'));
  assert.deepEqual(e.progress.data.frontier,main);
  const reload=makeEngine(storage); reload.progress.setPlayerName('小雨');
  assert.equal(reload.bookstoreEligible(),true);
  assert.deepEqual(reload.progress.data.frontier,main);
  reload.resumeGame(weekday,{replay:true});
  const visited=walkEngine(reload,{common_station_cafe_jyc_contact_choice:'com02j_leave_without_contact'},'common_station_cafe_jyc_complete');
  assert.ok(visited.includes('common_station_cafe_jyc_drawing_02'));
  assert.ok(!visited.includes('common_station_cafe_jyc_first_enter'));
  assert.ok(!visited.includes('common_weekday_outing_decision'));
  for(const flag of ['weekend_book_purchased','contact_jyc','history:jyc_first_topic:worldbuilding']) assert.ok(!reload.state.flags.has(flag),flag);
  assert.ok(reload.state.flags.has('history:cafe-bookstore-reunion'));
  assert.deepEqual(reload.progress.data.frontier,main);
  assert.ok(main.flags.includes('jyc_permanently_excluded'));
  const future=play(pathChoices('B'),storage,{freshRun:true});
  assert.ok(future.visited.includes('common_recommend_discord_jyc_enter'));
  assert.ok(future.e.state.flags.has('contact_jyc'),'only actual accepted cafe exchange earns contact');
  assert.ok(!future.e.state.flags.has('weekend_book_purchased'));
  assert.deepEqual(future.e.progress.data.frontier,main);
});


test('v1/v2 legacy migration distinguishes completed bookstore proof from premature or cafe-only records', () => {
  const source=play(pathChoices('A')).e;
  const completed=structuredClone(source.progress.data.checkpoints.common_acg_first_meet_purchase);
  completed.flags=completed.flags.filter(flag=>!flag.startsWith('bookstore-encounter-complete')&&!flag.startsWith('entry-effect:common_acg_first_meet_exit_locked_02'));
  const premature=structuredClone(source.progress.data.checkpoints.common_acg_first_meet_worldbuilding);
  const cafe=play(pathChoices('B')).e.progress.data.frontier;
  for(const version of [1,2]) for(const [snapshot,earned] of [[completed,true],[premature,false],[cafe,false]]) {
    const storage=new Storage();storage.setItem(`${chapter.id}:journey:v${version}`,JSON.stringify(version===1
      ?{version,current:snapshot,checkpoints:{[snapshot.nodeId]:snapshot}}
      :{version,cursor:snapshot,frontier:snapshot,checkpoints:{[snapshot.nodeId]:snapshot},jycEverUnlocked:true}));
    const reload=makeEngine(storage);
    assert.equal(reload.bookstoreEligible(),earned,`${version}/${snapshot.nodeId}`);
    assert.equal(reload.progress.data.cursor.flags.includes('weekend_book_purchased'),snapshot.flags.includes('weekend_book_purchased'));
    assert.equal(reload.progress.data.cursor.flags.includes('contact_jyc'),snapshot.flags.includes('contact_jyc'));
    assert.equal(makeEngine(storage).bookstoreEligible(),earned,'reload monotone');
  }
});

test('actual engine shows Line-許棠 on remote package and later messages while face-to-face stays 許棠', () => {
  const e=makeEngine();e.progress.setPlayerName('小雨');
  for(const id of ['common_package_xu_first_message_02','COM03M-X01','COM03M-X05','OPEN-A-X-START-INCOMING_01']) {
    e.nodeId=id;e.render();assert.equal(e.els.speaker.textContent,'Line-許棠',id);
  }
  e.nodeId='common_package_xu_line';e.render();assert.equal(e.els.speaker.textContent,'許棠');
});


test('cafe-initial earns future availability across excluded replay while bookstore reunion and contact stay distinct', () => {
  const {e,storage}=play({...pathChoices('B'),common_station_cafe_jyc_contact_choice:'com02j_leave_without_contact'});
  assert.equal(e.bookstoreEligible(),false);
  assert.equal(e.progress.hasJiangEligibility(),true);
  assert.ok(!e.state.flags.has('contact_jyc'));
  const main=structuredClone(e.progress.data.frontier);
  const reload=makeEngine(storage);reload.progress.setPlayerName('小雨');
  const local={nodeId:'common_station_cafe_jyc_first_enter',stats:{...chapter.initialState},flags:['preview:jyc-weekend-weekday','jyc_permanently_excluded','history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip'],returnNodes:[]};
  reload.resumeGame(local,{replay:true});
  assert.equal(reload.nodeId,'common_station_cafe_jyc_first_enter');
  const visited=walkEngine(reload,{common_station_cafe_jyc_contact_choice:'com02j_leave_without_contact'},'common_station_cafe_jyc_complete');
  assert.ok(visited.includes('common_station_cafe_jyc_first_drawing_02'));
  assert.ok(!visited.includes('common_station_cafe_jyc_drawing_02'));
  assert.ok(reload.state.flags.has('jyc_permanently_excluded'));
  assert.ok(!reload.state.flags.has('contact_jyc'));
  assert.ok(!reload.state.flags.has('weekend_book_purchased'));
  assert.equal(reload.bookstoreEligible(),false);
  assert.equal(reload.progress.hasJiangEligibility(),true);
  assert.deepEqual(reload.progress.data.frontier,main);
  const again=makeEngine(storage);
  assert.equal(again.progress.hasJiangEligibility(),true);
  assert.equal(again.bookstoreEligible(),false);
  assert.deepEqual(again.progress.data.frontier,main);
  assert.ok(again.progress.data.cursor.flags.includes('jyc_permanently_excluded'));
});

test('ordinary new play shares persisted bookstore gate and Continue retains greatest main', () => {
  const {e,storage}=play(pathChoices('A'));
  const main=structuredClone(e.progress.data.frontier);
  e.startGame({freshRun:true});
  const visited=walkEngine(e,pathChoices('B'),'common_station_cafe_jyc_enter_02');
  assert.ok(!visited.includes('common_weekday_outing_decision'));
  assert.equal(e.bookstoreEligible(),true);
  assert.equal(e.progress.hasJiangEligibility(),true);
  assert.equal(e.state.met_jiang_yucheng,0);
  assert.ok(!e.state.flags.has('weekend_book_purchased'));
  assert.ok(!e.state.flags.has('contact_jyc'));
  assert.deepEqual(e.progress.data.frontier,main);
  const reload=makeEngine(storage);
  assert.equal(reload.bookstoreEligible(),true);
  reload.startFromTitle();
  assert.equal(reload.nodeId,e.nodeId);
  assert.deepEqual(reload.progress.data.frontier,main);
});

test('reunion local book playback never fabricates an unearned cafe recommendation', () => {
  const e=makeEngine();e.progress.setPlayerName('小雨');
  e.progress.data.bookstoreEverEarned=true;
  e.progress.data.initialEncounterEverEarned=true;
  e.state={...chapter.initialState,flags:new Set(['weekend_book_purchased'])};
  e.nodeId='common_weekday_outing_reunion_rev_01';e.render();
  assert.equal(e.nodeId,'common_station_cafe_jyc_enter_02');
  assert.equal(e.state.heard_station_cafe_from_jyc,0);
  assert.ok(!e.state.flags.has('contact_jyc'));
});

test('earned reunion plays local recommendation action without inventing a purchased book', () => {
  const e=makeEngine();e.progress.setPlayerName('小雨');
  e.progress.data.bookstoreEverEarned=true;
  e.progress.data.initialEncounterEverEarned=true;
  e.state={...chapter.initialState,heard_station_cafe_from_jyc:1,flags:new Set()};
  e.nodeId='common_weekday_outing_selector';e.render();
  assert.equal(e.nodeId,'common_weekday_outing_reunion_rev_02');
  e.advance();assert.equal(e.nodeId,'common_station_cafe_jyc_enter_02');
  assert.ok(!e.state.flags.has('weekend_book_purchased'));
  assert.ok(!e.state.flags.has('contact_jyc'));
});

for (const path of ['A', 'B']) {
  test(`earned path ${path} restores local met zero into actual shared choices without fabricating contact`, () => {
    const {e,storage}=play({...pathChoices(path),common_station_cafe_jyc_contact_choice:'com02j_leave_without_contact'});
    const main=structuredClone(e.progress.data.frontier);
    const reload=makeEngine(storage);reload.progress.setPlayerName('小雨');
    const local={nodeId:'common_weekday_outing_selector',stats:{...chapter.initialState},flags:[
      'preview:jyc-weekend-weekday','jyc_permanently_excluded',
      'history:common_bookstore_bridge_weekend_decision:com01b_bookstore_skip'
    ],returnNodes:[]};
    reload.resumeGame(local,{replay:true});
    assert.equal(reload.state.met_jiang_yucheng,0);
    assert.ok(!reload.state.flags.has('contact_jyc'));
    assert.ok(!reload.state.flags.has('weekend_book_purchased'));
    const visited=walkEngine(reload,pathChoices('B'),'common_station_cafe_jyc_contact_choice');
    assert.equal(reload.nodeId,'common_station_cafe_jyc_contact_choice');
    assert.ok(visited.includes(path==='A'?'common_station_cafe_jyc_enter_02':'common_station_cafe_jyc_first_enter'));
    assert.ok(!visited.includes('common_weekday_outing_street_enter'));
    const choices=chapter.nodes[reload.nodeId].choices;
    reload.enterChoiceMode(choices);
    assert.equal(reload.els.choices.children.length,2,'actual bounded exchange/refusal choices render');
    assert.deepEqual(choices.map(choice=>choice.id),['com02j_offer_discord','com02j_leave_without_contact']);
    assert.ok(!reload.state.flags.has('contact_jyc'));
    assert.deepEqual(reload.progress.data.frontier,main);
    reload.els.choices.children[1].click();
    walkEngine(reload,{},'common_station_cafe_jyc_complete');
    assert.ok(!reload.state.flags.has('contact_jyc'),'actual refusal callback retains no contact');
    const noContact={...local,nodeId:'OPEN-A-ENTRY-ACTION-GATE'};
    reload.resumeGame(noContact,{replay:true});
    assert.equal(reload.nodeId,'OPEN-A-LIFE-DIRECT','earned eligibility alone cannot enable a contact-dependent invitation');
    reload.resumeGame({...local,nodeId:'COM03M-J01-GATE'},{replay:true});
    assert.equal(reload.nodeId,'COM03M-S02','earned eligibility alone cannot manufacture remote messages');
    assert.equal(reload.state.met_jiang_yucheng,0);
    assert.ok(!reload.state.flags.has('contact_jyc'));
    assert.deepEqual(reload.progress.data.frontier,main);
  });
}
