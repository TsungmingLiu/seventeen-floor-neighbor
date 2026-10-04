import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const nodes=JSON.parse(read('content/routes/opening-demo/chapter-01.json')).nodes;
const memories=JSON.parse(read('content/routes/opening-demo/memories.json')).events;
test('bookstore action IDs reach only their authored destinations',()=>{
  assert.deepEqual(nodes.common_bookstore_bridge_weekend_decision.choices.map(c=>c.id),['com01b_bookstore_go','com01b_bookstore_skip']);
  assert.equal(nodes.common_bookstore_bridge_weekend_transition_locked_00.next,'common_acg_first_meet_enter');
  assert.equal(nodes.common_acg_first_meet_exit_locked_04.next,'common_station_cafe_jyc_enter');
  assert.equal(nodes.com01b_cafe_go_after_bookstore_skip_01.next,'common_station_cafe_jyc_first_enter');
  assert.equal(nodes.com01b_cafe_skip_after_bookstore_skip_01.next,'common_convenience_xu_enter');
});
test('all approved COM-01B spoken, narration and action text is retained',()=>{
  const script=read('docs/narrative/scenes/vertical-slice/COM-01B.md').split('## Locked playable script')[1].split('## Downstream owning revisions')[0];
  const lines=[...script.matchAll(/^\*\*(?:Narration|Action|Time transition|Protagonist(?: \(thought\))?|Xu Tang)\*\*：(.+)$/gm)].map(x=>x[1]);
  const actual=new Set(Object.values(nodes).map(node=>node.text));
  for(const line of lines)assert.ok(actual.has(line),line);
});
test('stale bookstore art is absent from affected preview beats and Gallery metadata',()=>{
  for(const [id,node] of Object.entries(nodes))if(id.startsWith('common_bookstore_bridge_')||id.startsWith('com01b_'))if(node.visual)assert.equal(node.visual.background,'bg.narrative_preview.placeholder',id);
  for(const event of memories)assert.ok(!event.galleryAssets.some(id=>id.startsWith('cg.opening-ch1.com01b.')));
  assert.equal(nodes.common_convenience_xu_work_02.visual.asset,'cg.opening.com02x.microwave_wait');
});
