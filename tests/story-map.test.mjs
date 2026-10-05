import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compileStoryMap, runtimeTargets } from '../tools/story-map.mjs';
import { storyMapView, groupForNode } from '../src/story-map.js';
const read = async file => JSON.parse(await readFile(new URL(file, import.meta.url), 'utf8'));
const story = await read('../content/routes/opening-demo/chapter-01.json');
const config = await read('../content/routes/opening-demo/route.json');
const chapter = { ...config.story, nodes: story.nodes };
const memoryLibrary = await read('../content/routes/opening-demo/memories.json');
const definition = await read('../content/storyboards/opening-demo.json');
const assetManifest = await read('../content/assets/manifest.json');
const route = { chapter, memoryLibrary, sceneLibrary: { pools: {} }, assetManifest };
const map = compileStoryMap(route, definition);
const snapshot = id => ({ nodeId: id, stats: chapter.initialState, flags: [], returnNodes: [] });
const progress = ids => ({ data: { checkpoints: Object.fromEntries(ids.map(id => [id, snapshot(id)])), edges: [], cursor: null, frontier: null } });

test('café variants occupy one scene and keep existing replay/Memory identity', () => {
  const café = map.groups.find(g => g.id === 'cafe');
  assert.equal(café.variants.length, 2);
  assert.equal(groupForNode(map, 'common_station_cafe_jyc_first_enter').id, 'cafe');
  const save = progress(['common_station_cafe_jyc_first_enter']);
  const before = JSON.stringify(save);
  const view = storyMapView(map, memoryLibrary, chapter, save);
  const shown = view.groups.find(g => g.id === 'cafe');
  assert.equal(shown.variants.length, 1);
  assert.equal(shown.variants[0].id, 'first');
  assert.equal(shown.memoryId, 'mem.opening.ch1.first-cafe-jyc');
  assert.equal(JSON.stringify(save), before);
});

test('player projection does not expose names or variants of unknown scenes', () => {
  const view = storyMapView(map, memoryLibrary, chapter, progress([]));
  assert.deepEqual(view.groups.filter(g => !g.locked).map(g => g.id), ['movein']);
  assert.ok(view.groups.filter(g => g.locked).every(g => g.variants.length === 0));
  assert.equal(view.groups.some(g => g.id === 'cafe'), false);
  assert.deepEqual(view.edges, []);
});

test('connections require observed journey edges, never two unrelated checkpoints', () => {
  const save = progress(['common_movein_rain_open', 'common_elevator_restart_enter']);
  assert.deepEqual(storyMapView(map, memoryLibrary, chapter, save).edges, []);
  save.data.edges = [['common_movein_rain_open', 'common_elevator_restart_enter']];
  assert.deepEqual(storyMapView(map, memoryLibrary, chapter, save).edges, [{ from: 'movein', to: 'elevator' }]);
});

test('parcel is a separate scene and does not unlock from the earlier shared Memory', () => {
  const save = progress(['common_convenience_xu_enter']);
  assert.equal(storyMapView(map, memoryLibrary, chapter, save).groups.some(g => g.id === 'parcel'), false);
  save.data.checkpoints.common_package_xu_arrive = snapshot('common_package_xu_arrive');
  save.data.frontier = snapshot('common_package_xu_arrive');
  const parcel = storyMapView(map, memoryLibrary, chapter, save).groups.find(g => g.id === 'parcel');
  assert.equal(parcel.frontier, true);
  assert.equal(parcel.memoryId, null);
  assert.deepEqual(parcel.variants[0].galleryAssets, []); // Shared Memory never lends convenience-store CGs to the parcel scene.
});

test('review projection exposes all entry versions without modifying gameplay', () => {
  const save = progress([]), before = JSON.stringify(save);
  const view = storyMapView(map, memoryLibrary, chapter, save, true);
  assert.equal(view.groups.length, map.groups.length);
  assert.ok(view.groups.every(g => !g.locked));
  assert.equal(JSON.stringify(save), before);
  assert.ok(view.edges.find(e => e.from === 'weekend' && e.to === 'bookstore').label.includes('書店'));
  assert.equal(view.edges.some(e => e.from === 'bookstore' && e.to === 'weekend'), false);
});

test('source revisions change chronology only when every required entry exists', () => {
  const fake = structuredClone(chapter);
  const rev = definition.revisions[0];
  for (const id of rev.whenNodes) fake.nodes[id] = { text: '', next: 'common_package_xu_arrive' };
  const revised = compileStoryMap({ ...route, chapter: fake }, definition);
  assert.equal(revised.revision, 'weekday-jyc');
  assert.ok(revised.groups.find(g => g.id === 'convenience').row < revised.groups.find(g => g.id === 'cafe').row);
  assert.equal(revised.groups.find(g => g.id === 'weekday').variants[0].entry, 'common_weekday_outing_work');
  const save = progress(['common_convenience_xu_weekend_home']);
  const shown = storyMapView(revised, memoryLibrary, fake, save).groups.find(g => g.id === 'convenience');
  assert.deepEqual(shown.variants.map(v => v.id), ['work']);
  const historical = storyMapView(revised, memoryLibrary, fake, progress(['common_convenience_xu_enter'])).groups.find(g => g.id === 'convenience');
  assert.deepEqual(historical.variants.map(v => v.id), ['historical']);
  delete fake.nodes[rev.whenNodes[0]];
  assert.equal(compileStoryMap({ ...route, chapter: fake }, definition).revision, 'current');
});

test('every reachable Opening passage has a scene in the presentation mapping', () => {
  const mapped = new Set(map.groups.flatMap(group => group.variants.flatMap(variant => variant.nodeIds)));
  const seen = new Set(), pending = [chapter.startNode];
  while (pending.length) {
    const id = pending.pop();
    if (!id || seen.has(id) || !chapter.nodes[id]) continue;
    seen.add(id);
    assert.ok(mapped.has(id), `Unmapped reachable passage: ${id}`);
    pending.push(...runtimeTargets(chapter.nodes[id]));
  }
  assert.ok(seen.size > 700);
});

test('current branch conditions have readable narrative labels', () => {
  const seen = new Set(), pending = [chapter.startNode];
  while (pending.length) {
    const id = pending.pop();
    if (!id || seen.has(id) || !chapter.nodes[id]) continue;
    seen.add(id);
    for (const label of Object.values(map.branchLabels[id] || {})) {
      assert.ok(label && !label.includes('依先前互動接續'), `Untranslated condition at ${id}: ${label}`);
      assert.equal(/history:|contact_|jyc_|preview:/.test(label), false);
    }
    pending.push(...runtimeTargets(chapter.nodes[id]));
  }
});

test('an unreachable compatibility node cannot lend artwork or connections to the current scene', () => {
  const altered = structuredClone(chapter);
  altered.nodes.common_convenience_xu_legacy_art_test = {
    text: 'retired fixture', visual: { mode: 'cg', asset: 'cg.opening.com01x.base_normal' }, next: chapter.startNode
  };
  const compiled = compileStoryMap({ ...route, chapter: altered }, definition);
  const scene = compiled.groups.find(g => g.id === 'convenience');
  assert.ok(scene.variants.every(v => !v.galleryAssets.includes('cg.opening.com01x.base_normal')));
  assert.equal(compiled.edges.some(edge => edge.from === 'convenience' && edge.to === 'movein'), false);
});

test('a scene version does not borrow the other version’s bound picture', () => {
  const changed = structuredClone(chapter);
  for (const id of definition.revisions[0].whenNodes) changed.nodes[id] = { next: 'common_package_xu_arrive' };
  changed.nodes.common_convenience_xu_enter = { next: 'common_convenience_xu_variant_test' };
  changed.nodes.common_convenience_xu_variant_test = { type: 'branch', cases: [{ next: 'common_convenience_xu_weekend_book' }], default: 'common_convenience_xu_weekend_home' };
  changed.nodes.common_convenience_xu_weekend_book.visual = { mode: 'cg', asset: 'cg.opening.com01j.base_guarded' };
  changed.nodes.common_convenience_xu_weekend_home.visual = { mode: 'cg', asset: 'cg.opening.com01x.base_normal' };
  const scene = compileStoryMap({ ...route, chapter: changed }, definition).groups.find(g => g.id === 'convenience');
  assert.deepEqual(scene.variants.find(v => v.id === 'book').galleryAssets, ['cg.opening.com01j.base_guarded']);
  assert.deepEqual(scene.variants.find(v => v.id === 'work').galleryAssets, ['cg.opening.com01x.base_normal']);
});

test('contradictory compatibility cases cannot add artwork, branch labels or review connections', () => {
  const altered = structuredClone(chapter);
  altered.nodes.common_convenience_xu_enter = {
    type: 'branch',
    cases: [{ conditions: [{ flag: 'closed', present: true }, { flag: 'closed', present: false }], next: 'common_convenience_xu_retired_picture' }],
    default: 'common_package_xu_arrive'
  };
  altered.nodes.common_convenience_xu_retired_picture = {
    text: 'retired fixture', visual: { mode: 'cg', asset: 'cg.opening.com01x.base_normal' }, next: chapter.startNode
  };
  const compiled = compileStoryMap({ ...route, chapter: altered }, definition);
  assert.deepEqual(compiled.branchLabels.common_convenience_xu_enter, {});
  assert.equal(compiled.edges.some(e => e.from === 'convenience' && e.to === 'movein'), false);
  assert.ok(compiled.groups.find(g => g.id === 'convenience').variants.every(v => !v.galleryAssets.includes('cg.opening.com01x.base_normal')));
});

test('a runtime stop sentinel cannot advertise its schema fallback as a playable continuation', () => {
  const changed = structuredClone(chapter), blockedId = 'common_convenience_xu_stop_fixture';
  changed.nodes.common_convenience_xu_enter = { type: 'branch', cases: [], default: blockedId };
  changed.nodes[blockedId] = { next: chapter.startNode };
  const compiled = compileStoryMap({ ...route, chapter: changed }, { ...definition, reviewBlockedNodes: [blockedId] });
  assert.ok(compiled.reviewBlockedNodes.includes(blockedId));
  assert.equal(groupForNode(compiled, blockedId).id, 'convenience');
  assert.equal(compiled.edges.some(e => e.from === 'convenience' && e.to === 'movein'), false);
});
