import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { interpolatePlayerName } from '../src/player-name.js';

const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const chapter = json('../content/routes/opening-demo/chapter-01.json');
const route = json('../content/routes/opening-demo/route.json');
const memory = json('../content/routes/opening-demo/memories.json');
const nodes = chapter.nodes;

test('all four COM-02X paths preserve ordered locked turns and converge', () => {
  const scene = readFileSync(new URL('../docs/narrative/scenes/vertical-slice/COM-02X.md', import.meta.url), 'utf8');
  const locked = scene.split('## Locked playable script\n')[1].split('## State contract\n')[0];
  const expected = [...locked.matchAll(/\*\*(Narration|Action|Protagonist|Xu Tang(?:（off-screen）)?)\*\*：(.+)/g)]
    .map(match => match[2]);
  const actual = Object.entries(nodes).filter(([id]) => id.startsWith('common_convenience_xu_'))
    .filter(([, node]) => node.text).map(([, node]) => node.text);
  // Source order includes choice branches before the shared rejoin, matching the inserted node order.
  assert.deepEqual(actual, expected);
  const choices = nodes.common_convenience_xu_choice.choices;
  assert.deepEqual(choices.map(choice => choice.id),
    ['com02x_ask_food', 'com02x_share_work', 'com02x_tease_same', 'com02x_tell_eat_better']);
  for (const choice of choices) {
    let id = choice.next;
    while (id !== 'common_convenience_xu_work') id = nodes[id].next;
    assert.equal(id, 'common_convenience_xu_work');
  }
  assert.equal(nodes.common_convenience_xu_exit_08.next, 'opening_demo_complete');
});

test('preview uses the one registered background and excludes it from Gallery', () => {
  assert.equal(route.story.allowPreviewArt, true);
  assert.ok(route.assetIds.includes('bg.narrative_preview.placeholder'));
  for (const [id, node] of Object.entries(nodes)) {
    if (!id.startsWith('common_convenience_xu_')) continue;
    assert.deepEqual(node.visual, { mode: 'composite', background: 'bg.narrative_preview.placeholder', sprites: [] });
  }
  const event = memory.events.find(e => e.id === 'mem.opening.ch1.convenience-xu');
  assert.equal(event.progressRank, 160);
  assert.deepEqual(event.galleryAssets, []);
  assert.deepEqual(nodes.common_convenience_xu_exit_08.entryEffects, { F_XT: 1 });
  assert.deepEqual(nodes.common_convenience_xu_exit_08.entryFlags,
    ['player_knows_xu_freelance_creative_work', 'xu_knows_player_remote_tech_work']);
});

test('player name token requires a central value and never leaks raw', () => {
  assert.equal(interpolatePlayerName('[PLAYER_NAME]？', '測試姓名'), '測試姓名？');
  assert.throws(() => interpolatePlayerName('[PLAYER_NAME]？'), /display name is required/);
  assert.equal(interpolatePlayerName('原文。', undefined), '原文。');
});
