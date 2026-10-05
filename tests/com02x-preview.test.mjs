import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadContent, validateContent } from '../tools/content-lib.mjs';
const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url)));
const nodes = json('content/routes/opening-demo/chapter-01.json').nodes;
const memories = json('content/routes/opening-demo/memories.json');
const preview = 'bg.narrative_preview.placeholder';
test('current weekend convenience dialogue and both day variants are compiled verbatim', () => {
  const locked = readFileSync(new URL('../docs/narrative/scenes/vertical-slice/COM-02X.md', import.meta.url), 'utf8').split('## Locked playable script')[1].split('## State contract')[0];
  const actual = new Set(Object.values(nodes).filter(n => n.visual?.background === preview).map(n => n.text));
  const lines = [...locked.matchAll(/^\*\*(?:Narration|Action|Protagonist|Xu Tang(?:（off-screen）)?)\*\*：(.+)$/gm)];
  assert.ok(lines.length > 80);
  for (const [, line] of lines) assert.ok(actual.has(line), line);
  assert.equal(nodes.common_convenience_xu_weekend_book.type, undefined);
  assert.equal(nodes.common_convenience_xu_weekend_home.type, undefined);
});
test('revised convenience art and Memory are truthful preview; old trial is an inert fixture', async () => {
  for (const [id, node] of Object.entries(nodes)) {
    if (!id.startsWith('common_convenience_xu_') || !node.visual || node.type === 'branch') continue;
    assert.equal(node.visual.background, preview, id);
  }
  for (const id of ['common_convenience_xu_exit', 'common_convenience_xu_exit_02']) {
    assert.equal(nodes[id].type, 'branch');
    assert.equal(nodes[nodes[id].default].visual.background, preview);
  }
  const event = memories.events.find(e => e.id === 'mem.opening.ch1.convenience-xu');
  assert.equal(event.cover.asset, preview);
  assert.deepEqual(event.galleryAssets, []);
  assert.deepEqual(await validateContent(await loadContent()), []);
});
