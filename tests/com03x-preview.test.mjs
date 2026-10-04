import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadContent, validateContent } from '../tools/content-lib.mjs';

const source = readFileSync(new URL('../docs/narrative/scenes/vertical-slice/COM-03X.md', import.meta.url), 'utf8');
const script = source.split('## Complete playable script\n')[1].split('## Player choice / rejoin contract')[0];

test('COM03X runtime preserves every approved turn, speaker, choice and branch rejoin in source order', async () => {
  const content = await loadContent();
  const route = content.routes.find(item => item.config.id === 'opening-demo');
  const nodes = route.chapter.nodes;
  let turns = 0;
  for (const block of script.matchAll(/^#{3,4} (?:Branch )?(\w+)\n([\s\S]*?)(?=^#{3,4} |(?![\s\S]))/gm)) {
    const [, anchor, body] = block;
    const approved = [...body.matchAll(/^\*\*(Narration|Action|Xu Tang(?: \(message\))?|Protagonist(?: \(message\))?|Choice prompt)\*\*：(.*)$/gm)];
    let id = anchor;
    for (const [index, [, role, text]] of approved.entries()) {
      const node = nodes[id];
      assert.equal(node.text, text, `${anchor} turn ${index}`);
      assert.equal(node.speaker, role.startsWith('Xu Tang') ? '許棠' : role.startsWith('Protagonist') ? '你' : '旁白');
      turns += 1;
      if (index < approved.length - 1) id = node.next;
    }
    const target = body.match(/→ (?:Rejoin )?(?:稍晚 )?`(\w+)`/);
    if (target) assert.equal(nodes[id].next, target[1]);
    if (anchor === 'common_package_xu_choice') {
      const choices = [...body.matchAll(/^\d\. `(\w+)` — \*\*「(.*)」\*\*/gm)];
      assert.deepEqual(nodes[anchor].choices.map(choice => [choice.id, choice.text, choice.next]), choices.map(([, id, text]) => [id, text, id]));
    }
  }
  assert.equal(turns, 83);
  assert.equal(nodes.common_package_xu_first_message_06.next, 'com03x_preview_complete');
  assert.deepEqual(nodes.common_package_xu_first_message_06.entryEffects, { F_XT: 1 });
  assert.deepEqual(nodes.common_package_xu_first_message_06.entryFlags, ['contact_xu']);
});

test('COM03X placeholder is opt-in, excluded from Gallery, and rejected by the final visual gate', async () => {
  const content = await loadContent();
  const route = content.routes.find(item => item.config.id === 'opening-demo');
  const preview = 'bg.narrative_preview.placeholder';
  assert.equal(route.chapter.allowPreviewArt, true);
  assert.ok(route.config.assetIds.includes(preview));
  assert.equal(route.assetManifest.assets[preview].previewOnly, true);
  assert.equal(route.assetManifest.assets[preview].gallery, undefined);
  for (const [id, node] of Object.entries(route.chapter.nodes)) {
    if (!id.startsWith('common_package_xu_') && !id.startsWith('com03x_')) continue;
    if (node.type === 'route' || node.type === 'branch') continue;
    assert.deepEqual(node.visual, { mode: 'composite', background: preview, sprites: [] });
  }
  assert.equal(route.memoryLibrary.events.length, 7, 'the first cafe meeting has its own truthful Memory card');
  assert.ok(route.memoryLibrary.events.every(event => !event.galleryAssets.includes(preview)));
  assert.deepEqual(await validateContent(content), []);
  const finalErrors = await validateContent(content, { finalVisuals: true });
  assert.ok(finalErrors.some(error => error.includes('final visual acceptance forbids allowPreviewArt')));
  const noOptIn = structuredClone(content);
  noOptIn.routes.find(item => item.config.id === 'opening-demo').chapter.allowPreviewArt = false;
  assert.ok((await validateContent(noOptIn)).some(error => error.includes('common_package_xu_arrive: preview art requires allowPreviewArt')));
});
