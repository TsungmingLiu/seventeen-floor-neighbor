import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../tools/content-lib.mjs';
import { GameEngine } from '../src/engine.js';
import { resolveVisual } from '../src/visuals.js';
import { ProgressStore } from '../src/progress.js';

function clone(value) { return structuredClone(value); }

function recipe(content, suffix) {
  return content.recipes.recipes.find((item) => item.outputAsset === `cg.opening-ch1.com01b.${suffix}`);
}

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

test('accepted character-free CGs pass without invented character dependencies or head poses', async () => {
  const content = await loadContent();
  assert.deepEqual(await validateContent(content), []);
  for (const suffix of ['03', '04']) {
    assert.deepEqual(recipe(content, suffix).dependencies, []);
    assert.equal(recipe(content, suffix).prompt.headPose, undefined);
  }
});

test('environment CG exception requires empty participants and a matching character-free manifest entry', async () => {
  const base = await loadContent();
  const withParticipant = clone(base);
  withParticipant.manifest.assets['cg.opening-ch1.com01b.03'].participants = [{ character: 'xu_tang', designVersion: 2, outfit: 'weekday_neighbor', outfitVersion: 1 }];
  assert.ok((await validateContent(withParticipant)).some((error) => error.includes('recipe.cg.opening.com01b.03: character asset requires dependencies')));

  const wrongEntry = clone(base);
  wrongEntry.manifest.assets['cg.opening-ch1.com01b.03'].canonicalCgEntry = 'COM-01B-CG-01';
  wrongEntry.recipes.recipes.find((item) => item.outputAsset === 'cg.opening-ch1.com01b.03').canonicalCgEntry = 'COM-01B-CG-01';
  assert.ok((await validateContent(wrongEntry)).some((error) => error.includes('recipe.cg.opening.com01b.03: character asset requires dependencies')));
});

test('character-bearing CGs still require dependencies and headPose', async () => {
  const base = await loadContent();
  const missingDependency = clone(base);
  recipe(missingDependency, '01').dependencies = [];
  assert.ok((await validateContent(missingDependency)).some((error) => error.includes('recipe.cg.opening.com01b.01: character asset requires dependencies')));

  const missingHeadPose = clone(base);
  delete recipe(missingHeadPose, '02').prompt.headPose;
  assert.ok((await validateContent(missingHeadPose)).some((error) => error.includes('recipe.cg.opening.com01b.02: CG prompt requires an explicit headPose')));
});

test('Opening choice effects must use finite amounts for declared state keys', async () => {
  const base = await loadContent();
  const undeclaredState = clone(base);
  undeclaredState.routes.find((item) => item.config.id === 'opening-demo')
    .chapter.nodes.common_movein_rain_choice.choices[0].effects.undeclared_flag = 1;
  assert.ok((await validateContent(undeclaredState)).some((error) => error.includes('choice writes undeclared stat undeclared_flag')));

  const nonfiniteAmount = clone(base);
  nonfiniteAmount.routes.find((item) => item.config.id === 'opening-demo')
    .chapter.nodes.common_movein_rain_choice.choices[0].effects.C_XT = Number.NaN;
  assert.ok((await validateContent(nonfiniteAmount)).some((error) => error.includes('choice effect C_XT must be a finite number')));
});

test('route node effects must use finite amounts for declared state keys', async () => {
  const base = await loadContent();
  const undeclaredState = clone(base);
  undeclaredState.routes.find((item) => item.config.id === 'opening-demo')
    .chapter.nodes.common_convenience_xu_work.effects.undeclared_flag = 1;
  assert.ok((await validateContent(undeclaredState)).some((error) => error.includes('node effect writes undeclared stat undeclared_flag')));

  const nonfiniteAmount = clone(base);
  nonfiniteAmount.routes.find((item) => item.config.id === 'opening-demo')
    .chapter.nodes.common_convenience_xu_exit.effects.F_XT = Number.NaN;
  assert.ok((await validateContent(nonfiniteAmount)).some((error) => error.includes('node effect F_XT must be a finite number')));
});

test('route node effects are rejected where the runtime cannot apply them', async () => {
  const base = await loadContent();
  const route = (content) => content.routes.find((item) => item.config.id === 'opening-demo');

  const choiceNode = clone(base);
  route(choiceNode).chapter.nodes.common_convenience_xu_choice.effects = { F_XT: 1 };
  assert.ok((await validateContent(choiceNode)).some((error) => error.includes('node effects require an advanceable narrative node')));

  const terminal = clone(base);
  route(terminal).chapter.nodes.opening_demo_complete.effects = { F_XT: 1 };
  assert.ok((await validateContent(terminal)).some((error) => error.includes('node effects require an advanceable narrative node')));

  const cinematic = clone(base);
  route(cinematic).chapter.nodes.common_convenience_xu_exit.visual.mode = 'cinematic';
  route(cinematic).chapter.nodes.common_convenience_xu_exit.effects = { F_XT: 1 };
  assert.ok((await validateContent(cinematic)).some((error) => error.includes('node effects require an advanceable narrative node')));
});

test('Opening memory unlock nodes must follow and include their replay anchor', async () => {
  const base = await loadContent();
  const earlierNode = clone(base);
  const elevator = earlierNode.routes.find((item) => item.config.id === 'opening-demo')
    .memoryLibrary.events.find((event) => event.id === 'mem.opening.ch1.elevator-restart');
  elevator.unlockNodes.unshift('common_movein_rain_door');
  assert.ok((await validateContent(earlierNode)).some((error) => error.includes('unlockNode common_movein_rain_door is not reachable from replayNode common_elevator_restart_enter')));

  const missingAnchor = clone(base);
  const missingReplay = missingAnchor.routes.find((item) => item.config.id === 'opening-demo')
    .memoryLibrary.events.find((event) => event.id === 'mem.opening.ch1.movein');
  missingReplay.unlockNodes = missingReplay.unlockNodes.filter((nodeId) => nodeId !== missingReplay.replayNode);
  assert.ok((await validateContent(missingAnchor)).some((error) => error.includes('unlockNodes must include its replayNode')));
});

test('Opening route must retain a terminal node and reject a reachable cycle in its place', async () => {
  const content = await loadContent();
  const route = content.routes.find((item) => item.config.id === 'opening-demo');
  route.chapter.nodes.opening_demo_complete = {
    speaker: '旁白',
    text: 'cycle fixture',
    chapter: 2,
    visual: { mode: 'cg', asset: 'cg.opening.com01j.r01_interested' },
    next: 'opening_demo_complete'
  };
  assert.ok((await validateContent(content)).some((error) => error.includes('no reachable route terminal')));
});

test('every reachable opening node must have a path to a terminal, including choice-only dead ends', async () => {
  const content = await loadContent();
  const route = content.routes.find((item) => item.config.id === 'opening-demo');
  const choiceNode = route.chapter.nodes.common_movein_rain_choice;
  const strandedChoiceTarget = choiceNode.choices[0].next;
  choiceNode.choices[0].next = strandedChoiceTarget;
  route.chapter.nodes[strandedChoiceTarget].next = strandedChoiceTarget;
  const errors = await validateContent(content);
  assert.ok(errors.some((error) => error.includes(`node ${strandedChoiceTarget}: no graph path to a route terminal`)));
  assert.ok(!errors.some((error) => error.includes('no reachable route terminal')));
});

test('route must declare exactly one default ending rule', async () => {
  const content = await loadContent();
  const route = content.routes.find((item) => item.config.id === 'opening-demo');
  route.chapter.endingRules.push(clone(route.chapter.endingRules.find((rule) => rule.default === true)));
  assert.ok((await validateContent(content)).some((error) => error.includes('endingRules require exactly one default ending (found 2)')));
});

test('all COM-01B questions rejoin after goodnight and reach the existing COM-01J opening', async () => {
  const content = await loadContent();
  const route = content.routes.find((item) => item.config.id === 'opening-demo');
  const nodes = route.chapter.nodes;
  assert.equal(nodes.common_elevator_restart_exit.next, 'common_bookstore_bridge_enter');
  assert.equal(nodes.common_bookstore_bridge_weekend_transition.next, 'common_acg_first_meet_enter');
  assert.equal(nodes.common_bookstore_bridge_choice.choices.length, 3);
  for (const choice of nodes.common_bookstore_bridge_choice.choices) {
    assert.equal(choice.effects, undefined);
    let current = choice.next;
    const visited = [];
    while (current !== 'common_acg_first_meet_enter') {
      assert.ok(nodes[current], `missing node ${current}`);
      assert.ok(!visited.includes(current), `cycle at ${current}`);
      visited.push(current);
      assert.equal(nodes[current].effects, undefined);
      current = nodes[current].next;
    }
    assert.ok(visited.includes(choice.next + '_goodnight'));
    assert.ok(visited.includes(choice.next + '_thanks'));
    assert.ok(visited.includes('common_bookstore_bridge_rejoin'));
    assert.ok(visited.includes('common_bookstore_bridge_weekend_transition'));
  }
  assert.deepEqual(route.chapter.initialState, content.routes.find((item) => item.config.id === 'opening-demo').config.story.initialState);
});

test('COM-02X is reachable after COM-01J and all four choice effects survive Continue with Memory unlocked', async () => {
  const content = await loadContent();
  const route = content.routes.find((item) => item.config.id === 'opening-demo');
  const nodes = route.chapter.nodes;
  const choiceNodeId = 'common_convenience_xu_choice';
  const choices = nodes[choiceNodeId].choices;
  assert.equal(nodes.common_acg_first_meet_coda.next, 'common_convenience_xu_enter');
  assert.equal(route.config.assetIds.includes('bg.narrative_preview.placeholder'), true);
  assert.equal(route.chapter.allowPreviewArt, true);
  assert.equal(route.config.premise.includes('深夜便利店'), true);
  assert.equal(route.config.hint.includes('四個選擇點'), true);
  assert.equal(route.config.eyebrow.includes('Narrative Preview'), true);
  assert.equal(route.chapter.endings.demo_complete.art, 'bg.narrative_preview.placeholder');
  assert.equal(route.chapter.endings.demo_complete.text.includes('深夜便利店'), true);

  const reachable = new Set([route.chapter.startNode]);
  const queue = [route.chapter.startNode];
  while (queue.length) {
    const id = queue.shift();
    const node = nodes[id];
    for (const next of [node.next, ...(node.choices || []).map((choice) => choice.next)]) {
      if (next && !reachable.has(next)) { reachable.add(next); queue.push(next); }
    }
  }
  assert.ok(reachable.has(choiceNodeId), 'COM-02X choice is reachable from the real route start');
  assert.equal(choices.length, 4);

  const memory = route.memoryLibrary.events.find((event) => event.id === 'mem.opening.ch1.convenience-xu');
  assert.ok(memory);
  assert.equal(memory.replayNode, 'common_convenience_xu_enter');
  assert.ok(memory.unlockNodes.includes(memory.replayNode));
  assert.deepEqual(memory.galleryAssets, []);
  const expected = [
    { F_XT: 1, mc_tone_practical: 1 },
    { T_XT: 1, mc_tone_humorous: 1 },
    { C_XT: 1 },
    { K_XT: -1, xt_advice_tendency: 1 }
  ];
  choices.forEach((choice, index) => assert.deepEqual(choice.effects, expected[index], choice.id));
  assert.deepEqual(nodes.common_convenience_xu_work.effects, {
    player_knows_xu_freelance_creative_work: 1, xu_knows_player_remote_tech_work: 1
  });
  assert.deepEqual(nodes.common_convenience_xu_exit.effects, { F_XT: 1 });

  for (const [index, choice] of choices.entries()) {
    assert.ok(reachable.has(choice.next), `${choice.id} branch is reachable`);
    let current = choice.next;
    const visited = new Set();
    while (current !== 'opening_demo_complete') {
      assert.ok(nodes[current] && !visited.has(current), `${choice.id} must reach the ending without a missing node or cycle`);
      visited.add(current);
      current = nodes[current].next;
    }
    assert.ok(visited.has('common_convenience_xu_exit'));

    const storage = new MemoryStorage();
    const state = { ...route.chapter.initialState, flags: new Set() };
    for (const [key, amount] of Object.entries(choice.effects)) state[key] = (state[key] || 0) + amount;
    const progress = new ProgressStore(route.chapter, route.memoryLibrary, storage);
    progress.capture(choice.next, state, []);
    const continued = new ProgressStore(route.chapter, route.memoryLibrary, storage);
    assert.equal(continued.data.cursor.nodeId, choice.next);
    assert.equal(continued.data.cursor.stats.F_XT, index === 0 ? 1 : 0);
    for (const [key, amount] of Object.entries(choice.effects)) assert.equal(continued.data.cursor.stats[key], amount);
    assert.equal(continued.data.cursor.stats.player_knows_xu_freelance_creative_work, 0);
    assert.equal(continued.data.cursor.stats.xu_knows_player_remote_tech_work, 0);
    assert.equal(continued.data.frontierMemoryEventId, memory.id);
    assert.equal(continued.data.frontierRank, memory.progressRank);
  }
});

test('narrative preview uses one local background without claiming CG or Gallery acceptance', async () => {
  const content = await loadContent();
  const id = 'bg.narrative_preview.placeholder';
  const asset = content.manifest.assets[id];
  assert.equal(asset.kind, 'background');
  assert.equal(asset.previewOnly, true);
  assert.equal(asset.gallery, undefined);

  const preview = clone(content);
  const route = preview.routes.find((item) => item.config.id === 'opening-demo');
  route.config.assetIds.push(id);
  route.assetManifest.assets[id] = clone(asset);
  route.chapter.allowPreviewArt = true;
  route.chapter.titleArt = id;
  route.chapter.endingArt = id;
  route.chapter.endings.demo_complete.art = id;
  route.chapter.nodes[route.chapter.startNode].visual = { mode: 'composite', background: id, sprites: [] };
  route.memoryLibrary.events[0].cover = { asset: id, mode: 'scene' };
  assert.deepEqual(await validateContent(preview), []);
  assert.ok((await validateContent(preview, { finalVisuals: true })).some((error) => error.includes('final visual acceptance forbids allowPreviewArt')));

  const engine = Object.create(GameEngine.prototype);
  engine.chapter = route.chapter;
  engine.assets = route.assetManifest.assets;
  const title = engine.chapterArtVisual(id);
  assert.equal(title.mode, 'composite');
  assert.equal(resolveVisual(title, engine.assets).src, 'assets/ui/narrative-preview-v1.webp');
  assert.equal(engine.assets[id].gallery, undefined);

  route.chapter.allowPreviewArt = false;
  const errors = await validateContent(preview);
  assert.ok(errors.some((error) => error.includes('titleArt: preview art requires allowPreviewArt')));
  assert.ok(errors.some((error) => error.includes(`node ${route.chapter.startNode}: preview art requires allowPreviewArt`)));
  assert.ok(errors.some((error) => error.includes('memory') && error.includes('preview art requires allowPreviewArt')));
  assert.throws(() => engine.chapterArtVisual(id), /enabled preview background/);

  route.chapter.allowPreviewArt = true;
  route.memoryLibrary.events[0].galleryAssets = [id];
  assert.ok((await validateContent(preview)).some((error) => error.includes(`gallery asset ${id} is missing or not gallery-enabled`)));

  const disguised = clone(content);
  disguised.manifest.assets[id].previewOnly = false;
  assert.ok((await validateContent(disguised, { finalVisuals: true })).some((error) => error.includes(`asset ${id}: previewOnly must remain true`)));
});
