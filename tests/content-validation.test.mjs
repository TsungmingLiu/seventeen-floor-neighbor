import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../tools/content-lib.mjs';
import { GameEngine } from '../src/engine.js';
import { resolveVisual } from '../src/visuals.js';

function clone(value) { return structuredClone(value); }

function recipe(content, suffix) {
  return content.recipes.recipes.find((item) => item.outputAsset === `cg.opening-ch1.com01b.${suffix}`);
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

test('opt-in expression and action choice metadata is validated without constraining legacy choices', async () => {
  const base = await loadContent();
  const routeFor = (content) => content.routes.find((item) => item.config.id === 'opening-demo');
  const taggedFixture = (choiceType) => {
    const content = clone(base);
    const node = routeFor(content).chapter.nodes.common_movein_rain_choice;
    node.choiceType = choiceType;
    node.choices.forEach((choice, index) => Object.assign(choice, {
      id: `${choiceType}-${index + 1}`,
      consequenceClass: 'local',
      ...(choiceType === 'expression' ? { stance: ['warm', 'candid', 'playful'][index] } : {})
    }));
    return { content, node };
  };

  const expression = clone(base);
  const expressionNode = routeFor(expression).chapter.nodes.common_movein_rain_choice;
  expressionNode.choiceType = 'expression';
  expressionNode.choices.forEach((choice, index) => {
    Object.assign(choice, {
      id: `response-${index + 1}`,
      stance: ['warm', 'candid', 'playful'][index],
      consequenceClass: ['local', 'echo', 'structural'][index]
    });
  });
  assert.deepEqual(await validateContent(expression), []);

  const action = clone(base);
  const actionNode = routeFor(action).chapter.nodes.common_movein_rain_choice;
  actionNode.choiceType = 'action';
  actionNode.choices.push(clone(actionNode.choices[0]));
  actionNode.choices.forEach((choice, index) => Object.assign(choice, {
    id: `action-${index + 1}`,
    stance: ['warm', 'candid', 'playful', 'warm'][index],
    consequenceClass: 'local'
  }));
  assert.deepEqual(await validateContent(action), []);

  const malformed = [
    { type: 'action', mutate: (node) => { node.choiceType = 'mood'; }, diagnostic: 'choiceType must be expression or action' },
    { type: 'action', mutate: (node) => { node.choices[0].id = 'Bad ID'; }, diagnostic: 'id must be a stable lowercase identifier' },
    { type: 'action', mutate: (node) => { node.choices[1].id = node.choices[0].id; }, diagnostic: 'duplicate choice option id action-1' },
    { type: 'action', mutate: (node) => { node.choices[0].consequenceClass = 'route'; }, diagnostic: 'consequenceClass must be local, echo, or structural' },
    { type: 'expression', mutate: (node) => { node.choices[1].stance = 'warm'; }, diagnostic: 'expression stances must be warm, candid, and playful exactly once' },
    { type: 'expression', mutate: (node) => { node.choices.pop(); }, diagnostic: 'expression choice requires exactly 3 options' }
  ];
  for (const { type, mutate, diagnostic } of malformed) {
    const { content, node } = taggedFixture(type);
    mutate(node);
    assert.ok((await validateContent(content)).some((error) => error.includes(diagnostic)), diagnostic);
  }

  assert.deepEqual(await validateContent(base), []);
});



test('pure choice nodes omit placeholder speaker/text and legacy shapes are rejected', async () => {
  const base = await loadContent();
  const route = base.routes.find((item) => item.config.id === 'opening-demo');
  for (const id of [
    'common_elevator_restart_choice',
    'common_acg_first_meet_choice',
    'common_bookstore_bridge_choice'
  ]) {
    assert.equal('speaker' in route.chapter.nodes[id], false);
    assert.equal('text' in route.chapter.nodes[id], false);
    assert.ok(route.chapter.nodes[id].choices.length > 0);
  }

  const legacy = clone(base);
  const node = legacy.routes.find((item) => item.config.id === 'opening-demo')
    .chapter.nodes.common_elevator_restart_choice;
  node.speaker = '你';
  node.text = '';
  assert.ok((await validateContent(legacy)).some((error) =>
    error.includes('pure choice nodes must omit speaker and empty text')
  ));
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
  for (const [id, node] of Object.entries(route.chapter.nodes)) {
    if (node.type === 'route') route.chapter.nodes[id] = {
      speaker: '旁白', text: 'cycle fixture', chapter: 2,
      visual: { mode: 'composite', background: 'bg.narrative_preview.placeholder', sprites: [] }, next: id
    };
  }
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

test('all COM-01B questions rejoin after goodnight at the actual bookstore decision', async () => {
  const content = await loadContent();
  const route = content.routes.find((item) => item.config.id === 'opening-demo');
  const nodes = route.chapter.nodes;
  let elevatorExit = 'common_elevator_restart_exit';
  while (nodes[elevatorExit].next !== 'common_bookstore_bridge_enter') {
    elevatorExit = nodes[elevatorExit].next;
    assert.match(elevatorExit, /^common_elevator_restart_exit_locked_/);
  }
  assert.equal(nodes.common_bookstore_bridge_weekend_transition_locked_00.next, 'common_acg_first_meet_enter');
  assert.deepEqual(nodes.common_bookstore_bridge_weekend_decision.choices.map(choice => choice.id),
    ['com01b_bookstore_go', 'com01b_bookstore_skip']);
  assert.equal(nodes.com01b_bookstore_go.next, 'common_bookstore_bridge_weekend_transition');
  assert.notEqual(nodes.com01b_bookstore_skip.next, 'common_acg_first_meet_enter');
  assert.equal(nodes.common_bookstore_bridge_choice.choices.length, 3);
  for (const choice of nodes.common_bookstore_bridge_choice.choices) {
    assert.equal(choice.effects, undefined);
    let current = choice.next;
    const visited = [];
    while (current !== 'common_bookstore_bridge_weekend_decision') {
      assert.ok(nodes[current], `missing node ${current}`);
      assert.ok(!visited.includes(current), `cycle at ${current}`);
      visited.push(current);
      assert.equal(nodes[current].effects, undefined);
      current = nodes[current].next;
    }
    assert.ok(visited.includes(choice.next + '_goodnight'));
    assert.ok(visited.includes(choice.next + '_thanks'));
    assert.ok(visited.includes('common_bookstore_bridge_rejoin'));
    assert.ok(visited.includes('common_bookstore_bridge_weekend_decision_time'));
  }
  assert.deepEqual(route.chapter.initialState, content.routes.find((item) => item.config.id === 'opening-demo').config.story.initialState);
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


test('initialTitleArt is optional and validates allowed asset kind and route membership', async () => {
  const base = await loadContent();
  const route = base.routes.find((r) => r.config.id === 'opening-demo');
  assert.equal(route.chapter.initialTitleArt, 'bg.opening.title.17f_doorlight');
  assert.deepEqual(await validateContent(base), []);
  delete route.chapter.initialTitleArt;
  assert.deepEqual(await validateContent(base), []);
  const missing = clone(base); missing.routes[0].chapter.initialTitleArt = 'not.allowlisted';
  assert.ok((await validateContent(missing)).some((e) => e.includes('initialTitleArt: undeclared or unknown asset')));
  const invalid = clone(base); const id = 'bg.opening.title.17f_doorlight';
  invalid.routes[0].chapter.initialTitleArt = id; invalid.routes[0].assetManifest.assets[id].kind = 'sprite';
  assert.ok((await validateContent(invalid)).some((e) => e.includes('initialTitleArt: must be background or cg')));
});

test('preview contract permits only the two exact background paths and rejects final-art disguises', async () => {
  const base = await loadContent();
  const id = 'bg.opening.com02x.return_elevator_trial';
  for (const mutate of [
    asset => { delete asset.previewOnly; },
    asset => { asset.previewOnly = false; },
    asset => { asset.src = 'assets/ui/narrative-preview-v1.webp'; },
    asset => { asset.kind = 'cg'; },
    asset => { asset.gallery = { title: 'Forbidden' }; },
    asset => { asset.participants = []; },
    asset => { asset.canonicalCgEntry = 'COM02X-RETURN-ELEVATOR-01'; }
  ]) {
    const content = clone(base); mutate(content.manifest.assets[id]);
    assert.ok((await validateContent(content)).some(error => error.startsWith(`asset ${id}:`) && /previewOnly must remain true|invalid preview-only asset contract/.test(error)));
  }
  const unknown = clone(base);
  unknown.manifest.assets['bg.unregistered.preview'] = clone(base.manifest.assets[id]);
  assert.ok((await validateContent(unknown)).includes('asset bg.unregistered.preview: invalid preview-only asset contract'));
});
