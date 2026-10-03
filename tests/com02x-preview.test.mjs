import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { interpolatePlayerName } from '../src/player-name.js';

const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const chapter = json('../content/routes/opening-demo/chapter-01.json');
const route = json('../content/routes/opening-demo/route.json');
const memory = json('../content/routes/opening-demo/memories.json');
const nodes = chapter.nodes;

test('all four COM-02X paths preserve ordered locked turns and converge', () => {
  const scene = readFileSync(new URL('../docs/narrative/scenes/vertical-slice/COM-02X.md', import.meta.url), 'utf8');
  const locked = scene.split('## Locked playable script\n')[1].split('## State contract\n')[0];
  const groups = [...locked.matchAll(/(?:### `([^`]+)`|#### Branch `([^`]+)`)([\s\S]*?)(?=### `|#### Branch |$)/g)];
  const end = {
    common_convenience_xu_enter: 'common_convenience_xu_recognize',
    common_convenience_xu_recognize: 'common_convenience_xu_choice',
    com02x_ask_food: 'common_convenience_xu_work',
    com02x_share_work: 'common_convenience_xu_work',
    com02x_tease_same: 'common_convenience_xu_work',
    com02x_tell_eat_better: 'common_convenience_xu_work',
    common_convenience_xu_work: 'common_convenience_xu_checkout',
    common_convenience_xu_checkout: 'common_convenience_xu_exit',
    common_convenience_xu_exit: 'opening_demo_complete'
  };
  for (const [, heading, branch, body] of groups) {
    const key = heading || branch;
    if (!(key in end)) continue;
    const approved = [...body.matchAll(/\*\*(Narration|Action|Protagonist|Xu Tang(?:（off-screen）)?)\*\*：(.+)/g)];
    const start = branch ? nodes.common_convenience_xu_choice.choices.find(choice => choice.id === branch).next : key;
    let id = start;
    const compiled = [];
    while (id !== end[key]) {
      assert.ok(nodes[id], `missing ${id}`);
      compiled.push(nodes[id]);
      assert.ok(compiled.length < 40, `cycle after ${start}`);
      id = nodes[id].next;
    }
    assert.equal(compiled.map(node => node.text).join(''), approved.map(match => match[2]).join(''), key);
    assert.deepEqual(compiled.filter(node => node.speaker !== '旁白').map(node => [node.speaker, node.text]),
      approved.filter(match => !['Narration', 'Action'].includes(match[1]))
        .map(match => [match[1].startsWith('Xu Tang') ? '許棠' : '你', match[2]]), key);
  }
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

test('formal COM-02X integration binds accepted CG and scene art without preview dependencies', () => {
  const assets = json('../content/assets/manifest.json').assets;
  const catalog = json('../content/assets/source-catalog.json').files;
  const receipt = json('../content/assets/ingest-receipts/com02x-accepted-masters-v1.json');
  assert.equal(route.story.allowPreviewArt, true);
  assert.equal(route.story.endingArt, 'bg.narrative_preview.placeholder');
  assert.ok(route.assetIds.includes('bg.narrative_preview.placeholder'));
  assert.ok(Object.entries(nodes).filter(([id]) => id.startsWith('common_package_xu_') || /^com03x_(?:ask|recall|joke)_/.test(id))
    .every(([, node]) => node.visual?.background === 'bg.narrative_preview.placeholder'));
  assert.ok(route.assetIds.includes('bg.opening.com02x.convenience_night'));
  assert.ok(route.assetIds.includes('cg.opening.com02x.recognition'));
  assert.ok(route.assetIds.includes('cg.opening.com02x.microwave_wait'));
  for (const [id, node] of Object.entries(nodes)) {
    if (!id.startsWith('common_convenience_xu_')) continue;
    if (id === 'common_convenience_xu_choice' || id === 'common_convenience_xu_recognize' || id.startsWith('common_convenience_xu_recognize_')
      || /^common_convenience_xu_(ask_food|share_work|tease_same)(_|$)/.test(id)
      || /^common_convenience_xu_tell_eat_better(?:_0[23])?$/.test(id)) {
      assert.deepEqual(node.visual, { mode: 'cg', asset: 'cg.opening.com02x.recognition' });
    } else if (/^common_convenience_xu_work_(0[2-9]|1[0-5])$/.test(id)) {
      assert.deepEqual(node.visual, { mode: 'cg', asset: 'cg.opening.com02x.microwave_wait' });
    } else if (/^common_convenience_xu_checkout_(0[4-9]|1[0-3])$/.test(id)) {
      assert.deepEqual(node.visual, { mode: 'cg', asset: 'cg.opening.com02x.walk_home' });
    } else if (['common_convenience_xu_exit', 'common_convenience_xu_exit_02'].includes(id)) {
      assert.deepEqual(node.visual, { mode: 'composite', background: 'bg.opening.com02x.return_elevator_trial', sprites: [] });
    } else if (id === 'common_convenience_xu_checkout_14' || id.startsWith('common_convenience_xu_exit')) {
      assert.deepEqual(node.visual, { mode: 'composite', background: 'bg.opening.ch1.apt_elevator', sprites: [] });
    } else {
      assert.deepEqual(node.visual, { mode: 'composite', background: 'bg.opening.com02x.convenience_night', sprites: [] });
    }
  }
  assert.equal(assets['bg.opening.com02x.convenience_night'].kind, 'background');
  assert.equal(assets['cg.opening.com02x.recognition'].kind, 'cg');
  assert.equal(assets['cg.opening.com02x.recognition'].gallery.title, '深夜便利店');
  assert.equal(catalog['source.com02x.bg-01'].sha256, '88cc22c254fbbd5149cda25e34db0637cb5938b44f882ad04c14036f723363bf');
  assert.equal(catalog['source.com02x.dlg-01'].sha256, 'c3b980c003dd2bcfb4dcabb769438fe67d85751f75f5fed20ceedf4ad0c3ea65');
  assert.equal(receipt.humanDecision.decision, 'PASS');
  assert.equal(receipt.assets.length, 2);
  const microwave = json('../content/assets/ingest-receipts/com02x-microwave-accepted-master-v1.json');
  assert.equal(assets['cg.opening.com02x.microwave_wait'].kind, 'cg');
  assert.ok(assets['cg.opening.com02x.microwave_wait'].gallery);
  assert.equal(catalog['source.com02x.microwave'].sha256, '7b8a6f5eb9dd8bfc102229e42aaf1e82a1182f20b807d3dc134df79f5e95a392');
  assert.equal(microwave.assets[0].visualQaStatus, 'FAIL');
  assert.equal(microwave.assets[0].humanDisposition, 'ACCEPTED_AS_IS');
  assert.ok(receipt.assets.every(asset => asset.visualQaStatus === 'FAIL' && asset.humanDisposition === 'ACCEPTED_AS_IS'));
  const event = memory.events.find(e => e.id === 'mem.opening.ch1.convenience-xu');
  assert.equal(event.progressRank, 160);
  assert.deepEqual(event.galleryAssets, ['cg.opening.com02x.recognition', 'cg.opening.com02x.microwave_wait', 'cg.opening.com02x.walk_home']);
  assert.equal(event.cover.asset, 'bg.opening.com02x.convenience_night');
  assert.deepEqual(nodes.common_convenience_xu_exit_08.entryEffects, { F_XT: 1 });
  assert.deepEqual(nodes.common_convenience_xu_exit_08.entryFlags,
    ['player_knows_xu_freelance_creative_work', 'xu_knows_player_remote_tech_work']);
});

test('player name token requires a central value and never leaks raw', () => {
  assert.equal(interpolatePlayerName('[PLAYER_NAME]？', '測試姓名'), '測試姓名？');
  assert.throws(() => interpolatePlayerName('[PLAYER_NAME]？'), /display name is required/);
  assert.equal(interpolatePlayerName('原文。', undefined), '原文。');
});

test('walking-home adoption uses exact v3 bytes and retains failed visual QA', () => {
  const receipt = json('../content/assets/ingest-receipts/com02x-walk-adopted-master-v3.json');
  const asset = receipt.assets[0];
  const manifest = json('../content/assets/manifest.json').assets;
  const hash = path => createHash('sha256').update(readFileSync(new URL(`../${path}`, import.meta.url))).digest('hex');
  assert.equal(hash(asset.masterPath), 'a1aa0d08023cc19a42b3c9260bca732059e77eb5dd37c8578afb82bd7dd82400');
  assert.equal(hash(asset.derivativePath), asset.derivativeSha256);
  assert.equal(asset.width, 1672);
  assert.equal(asset.height, 941);
  assert.equal(asset.visualQaStatus, 'FAIL');
  assert.equal(receipt.visualQa.status, 'FAIL');
  assert.equal(receipt.humanDecision.status, 'HUMAN_ACCEPTED_AS_IS');
  assert.equal(receipt.humanDecision.decision, undefined);
  assert.ok(asset.acceptedKnownIssues.some(issue => issue.startsWith('FAIL:')));
  assert.ok(asset.acceptedKnownIssues.some(issue => issue.startsWith('NEEDS_REVIEW:')));
  assert.ok(route.assetIds.includes('cg.opening.com02x.walk_home'));
  assert.equal(manifest['cg.opening.com02x.walk_home'].kind, 'cg');
  assert.ok(manifest['cg.opening.com02x.walk_home'].gallery);
  let nodeId = 'common_convenience_xu_checkout_03';
  const walked = [];
  while (nodeId !== 'common_convenience_xu_checkout_14') {
    if (nodeId !== 'common_convenience_xu_checkout_03') {
      assert.deepEqual(nodes[nodeId].visual, { mode: 'cg', asset: 'cg.opening.com02x.walk_home' });
      walked.push(nodeId);
    }
    nodeId = nodes[nodeId].next;
    assert.ok(walked.length <= 10);
  }
  assert.equal(walked.length, 10);
  assert.deepEqual(nodes.common_convenience_xu_checkout_03.visual, { mode: 'composite', background: 'bg.opening.com02x.convenience_night', sprites: [] });
  assert.deepEqual(nodes[nodeId].visual, { mode: 'composite', background: 'bg.opening.ch1.apt_elevator', sprites: [] });
});
