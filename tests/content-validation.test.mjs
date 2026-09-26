import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../tools/content-lib.mjs';

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
