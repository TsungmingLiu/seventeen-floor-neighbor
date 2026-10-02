import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const nodes = JSON.parse(readFileSync(new URL('../content/routes/opening-demo/chapter-01.json', import.meta.url))).nodes;
const memories = JSON.parse(readFileSync(new URL('../content/routes/opening-demo/memories.json', import.meta.url))).events;
const scenes = [
  ['COM-00', 'common_elevator_restart_enter'],
  ['COM-01X', 'common_bookstore_bridge_enter'],
  ['COM-01B', 'common_acg_first_meet_enter'],
  ['COM-01J', 'common_convenience_xu_enter'],
  ['COM-02X', 'opening_demo_complete']
];
const speaker = {
  Narration: '旁白', Action: '旁白', 'Time transition': '旁白',
  Protagonist: '你', 'Protagonist (thought)': '內心',
  'Xu Tang': '許棠', 'Xu Tang（off-screen）': '許棠',
  'Jiang Yucheng': '江雨澄'
};

for (const [sceneId, sceneEnd] of scenes) {
  test(`${sceneId} compiles every approved passage and conversational turn in branch order`, () => {
    const source = readFileSync(new URL(`../docs/narrative/scenes/vertical-slice/${sceneId}.md`, import.meta.url), 'utf8');
    const locked = source.split('## Locked playable script')[1].split('## State contract')[0];
    const groups = [...locked.matchAll(/(?:### `([^`]+)`|#### Branch `([^`]+)`)([\s\S]*?)(?=### `|#### Branch |$)/g)]
      .map(([, main, branch, body]) => ({ key: main || branch, branch: !!branch, body }));
    const mains = groups.filter(group => !group.branch).map(group => group.key);
    const branchChoice = new Map();
    for (const group of groups) {
      if (!group.key.endsWith('_choice')) continue;
      const ids = [...group.body.matchAll(/^\d+\. `([^`]+)` — \*\*([^*]+)\*\*/gm)];
      assert.deepEqual(nodes[group.key].choices.map(choice => choice.text), ids.map(match => match[2]));
      for (const [index, match] of ids.entries()) branchChoice.set(match[1], nodes[group.key].choices[index].next);
    }
    let currentChoiceIndex = -1;
    for (const group of groups) {
      if (group.key.endsWith('_choice')) currentChoiceIndex = mains.indexOf(group.key);
      if (group.key.endsWith('_choice')) continue;
      // A branch rejoins the next top-level section after its preceding choice.
      const mainIndex = group.branch ? currentChoiceIndex : mains.indexOf(group.key);
      const end = mains[mainIndex + 1] ?? sceneEnd;
      const start = group.branch ? branchChoice.get(group.key) : group.key;
      assert.ok(start, `missing branch target for ${group.key}`);
      const compiled = [];
      let id = start;
      while (id !== end) {
        assert.ok(nodes[id], `missing node ${id} while traversing ${group.key}`);
        assert.ok(compiled.length < 80, `cycle in ${group.key}`);
        compiled.push(nodes[id]);
        id = nodes[id].next;
      }
      const expected = [...group.body.matchAll(/^\*\*([^*]+)\*\*：(.+)$/gm)]
        .filter(match => speaker[match[1]]);
      assert.equal(compiled.map(node => node.text).join(''), expected.map(match => match[2].trim()).join(''), group.key);
      const exactTurns = expected.filter(match => !['旁白'].includes(speaker[match[1]]))
        .map(match => [speaker[match[1]], match[2].trim()]);
      assert.deepEqual(compiled.filter(node => node.speaker !== '旁白')
        .map(node => [node.speaker, node.text]), exactTurns, group.key);
      for (const node of compiled.filter(node => node.speaker === '內心')) assert.equal(node.presentation, 'thought');
    }
  });
}

// Baseline IDs are saved checkpoints from before the approved dialogue compilation.
const originalNodeIds = `
common_movein_rain_open common_movein_rain_open_chair common_movein_rain_door
common_movein_rain_assist common_movein_rain_move common_movein_rain_choice
common_movein_rain_formal common_movein_rain_joke common_movein_rain_practical
common_movein_rain_names common_movein_rain_name_reply common_movein_rain_goodnight
common_movein_rain_coda common_elevator_restart_enter common_elevator_restart_greeting
common_elevator_restart_stop common_elevator_restart_dry common_elevator_restart_choice
common_elevator_restart_match_dry common_elevator_restart_check_panel common_elevator_restart_wait
common_elevator_restart_resume common_elevator_restart_smalltalk
common_elevator_restart_smalltalk_reply common_elevator_restart_exit common_acg_first_meet_enter
common_acg_first_meet_shelf common_acg_first_meet_observation common_acg_first_meet_confirm
common_acg_first_meet_choice common_acg_first_meet_worldbuilding common_acg_first_meet_visual_design
common_acg_first_meet_buying_practical common_acg_first_meet_rejoin common_acg_first_meet_cafe_seed
common_acg_first_meet_cafe_reply common_acg_first_meet_exit common_acg_first_meet_coda
opening_demo_complete common_bookstore_bridge_enter common_bookstore_bridge_greeting
common_bookstore_bridge_xu_greeting common_bookstore_bridge_bags_reply
common_bookstore_bridge_progress common_bookstore_bridge_pause common_bookstore_bridge_choice
com01b_browse_shops com01b_browse_shops_recommendation com01b_browse_shops_goodnight
com01b_browse_shops_thanks com01b_find_books com01b_find_books_recommendation
com01b_find_books_goodnight com01b_find_books_thanks com01b_food_or_coffee
com01b_food_or_coffee_recommendation com01b_food_or_coffee_goodnight com01b_food_or_coffee_thanks
common_bookstore_bridge_rejoin common_bookstore_bridge_quiet common_bookstore_bridge_book_goal
common_bookstore_bridge_weekend_transition common_convenience_xu_enter
common_convenience_xu_enter_02 common_convenience_xu_enter_03 common_convenience_xu_recognize
common_convenience_xu_recognize_02 common_convenience_xu_recognize_03
common_convenience_xu_recognize_04 common_convenience_xu_recognize_05
common_convenience_xu_recognize_06 common_convenience_xu_recognize_07
common_convenience_xu_recognize_08 common_convenience_xu_recognize_09
common_convenience_xu_recognize_10 common_convenience_xu_recognize_11
common_convenience_xu_recognize_12 common_convenience_xu_ask_food common_convenience_xu_ask_food_02
common_convenience_xu_ask_food_03 common_convenience_xu_ask_food_04
common_convenience_xu_ask_food_05 common_convenience_xu_ask_food_06
common_convenience_xu_ask_food_07 common_convenience_xu_share_work
common_convenience_xu_share_work_02 common_convenience_xu_share_work_03
common_convenience_xu_share_work_04 common_convenience_xu_share_work_05
common_convenience_xu_share_work_06 common_convenience_xu_tease_same
common_convenience_xu_tease_same_02 common_convenience_xu_tease_same_03
common_convenience_xu_tease_same_04 common_convenience_xu_tease_same_05
common_convenience_xu_tease_same_06 common_convenience_xu_tease_same_07
common_convenience_xu_tell_eat_better common_convenience_xu_tell_eat_better_02
common_convenience_xu_tell_eat_better_03 common_convenience_xu_tell_eat_better_04
common_convenience_xu_tell_eat_better_05 common_convenience_xu_tell_eat_better_06
common_convenience_xu_tell_eat_better_07 common_convenience_xu_work common_convenience_xu_work_02
common_convenience_xu_work_03 common_convenience_xu_work_04 common_convenience_xu_work_05
common_convenience_xu_work_06 common_convenience_xu_work_07 common_convenience_xu_work_08
common_convenience_xu_work_09 common_convenience_xu_work_10 common_convenience_xu_work_11
common_convenience_xu_work_12 common_convenience_xu_work_13 common_convenience_xu_work_14
common_convenience_xu_work_15 common_convenience_xu_work_16 common_convenience_xu_work_17
common_convenience_xu_checkout common_convenience_xu_checkout_02 common_convenience_xu_checkout_03
common_convenience_xu_checkout_04 common_convenience_xu_checkout_05
common_convenience_xu_checkout_06 common_convenience_xu_checkout_07
common_convenience_xu_checkout_08 common_convenience_xu_checkout_09
common_convenience_xu_checkout_10 common_convenience_xu_checkout_11
common_convenience_xu_checkout_12 common_convenience_xu_checkout_13
common_convenience_xu_checkout_14 common_convenience_xu_exit common_convenience_xu_exit_02
common_convenience_xu_exit_03 common_convenience_xu_exit_04 common_convenience_xu_exit_05
common_convenience_xu_exit_06 common_convenience_xu_exit_07 common_convenience_xu_exit_08
common_convenience_xu_choice
`.trim().split(/\s+/);

test('saved node IDs, choice destinations and effects remain stable', () => {
  assert.equal(originalNodeIds.length, 144);
  for (const id of originalNodeIds) assert.ok(nodes[id], `deleted save node ${id}`);
  const choiceEdges = Object.fromEntries(
    Object.entries(nodes).filter(([, node]) => node.choices).map(([id, node]) => [id,
      node.choices.map(choice => Object.fromEntries(
        ['id', 'next', 'effects', 'addFlags'].filter(key => key in choice).map(key => [key, choice[key]])
      ))
    ])
  );
  assert.equal(createHash('sha256').update(JSON.stringify(choiceEdges)).digest('hex'),
    '916447c4992ef40cb1215f1dc02d213d80c36f4013865795d45d4e8a22dec94f');
  assert.deepEqual(nodes.common_convenience_xu_exit_08.entryEffects, { F_XT: 1 });
  assert.deepEqual(nodes.common_convenience_xu_exit_08.entryFlags,
    ['player_knows_xu_freelance_creative_work', 'xu_knows_player_remote_tech_work']);
});

test('expanded boxes keep the existing Memory and visual boundaries', () => {
  const membership = new Map();
  for (const event of memories) {
    for (const id of event.unlockNodes) {
      assert.ok(!membership.has(id), `duplicate Memory assignment ${id}`);
      membership.set(id, event.id);
    }
  }
  for (const id of Object.keys(nodes)) {
    if (id === 'opening_demo_complete') continue;
    assert.ok(membership.has(id), `unmapped Memory node ${id}`);
    if (id.startsWith('common_convenience_xu_')) {
      assert.notEqual(nodes[id].visual?.background, 'bg.narrative_preview.placeholder');
      if (id === 'common_convenience_xu_choice' || id === 'common_convenience_xu_recognize' || id.startsWith('common_convenience_xu_recognize_')
      || /^common_convenience_xu_(ask_food|share_work|tease_same)(_|$)/.test(id)
      || /^common_convenience_xu_tell_eat_better(?:_0[23])?$/.test(id)) {
        assert.deepEqual(nodes[id].visual, { mode: 'cg', asset: 'cg.opening.com02x.recognition' });
      } else if (/^common_convenience_xu_work_(0[2-9]|1[0-5])$/.test(id)) {
        assert.deepEqual(nodes[id].visual, { mode: 'cg', asset: 'cg.opening.com02x.microwave_wait' });
      } else if (/^common_convenience_xu_checkout_(0[4-9]|1[0-3])$/.test(id)) {
        assert.deepEqual(nodes[id].visual, { mode: 'cg', asset: 'cg.opening.com02x.walk_home' });
      } else {
        assert.ok(['bg.opening.com02x.convenience_night', 'bg.opening.ch1.apt_elevator']
          .includes(nodes[id].visual?.background), `COM-02X node ${id} uses registered scene coverage`);
      }
    } else {
      assert.notEqual(nodes[id].visual?.background, 'bg.narrative_preview.placeholder');
    }
  }
  assert.equal(nodes.common_movein_rain_move.text, '欸，等一下。右邊先抬高一點，我扶門。');
  assert.equal(nodes.common_movein_rain_move.visual.mode, 'composite');
  assert.equal(nodes.common_movein_rain_door_locked_00.visual.asset,
    'cg.opening.com00.s02_door_assist');
  assert.equal(nodes.common_movein_rain_door_locked_00.visual.effects.push, true);
  assert.equal(nodes.common_elevator_restart_stop.visual.asset, 'cg.opening.com01x.r01_restart');
  assert.equal(nodes.common_acg_first_meet_observation_locked_00.visual.asset,
    'cg.opening.com01j.base_guarded');
});
