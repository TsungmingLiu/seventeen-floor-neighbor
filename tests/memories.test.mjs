import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../tools/content-lib.mjs';
import {
  memoryCoverVisual,
  titleBackdropVisual
} from '../src/memories.js';
import { resolveVisual } from '../src/visuals.js';

function progress(frontierMemoryEventId, frontierRank, checkpoints = {}) {
  return { data: { frontierMemoryEventId, frontierRank, checkpoints } };
}

test('title backdrop follows explicit, heroine, highlight, then scene fallback order', () => {
  const assets = {
    scene: { kind: 'background', src: 'scene.jpg', focus: { x: 50, y: 45 } },
    heroine: { kind: 'cg', src: 'heroine.jpg', focus: { x: 60, y: 40 } },
    heart: { kind: 'cg', src: 'heart.jpg', focus: { x: 55, y: 35 } },
    explicit: { kind: 'cg', src: 'explicit.jpg', focus: { x: 52, y: 34 } }
  };
  const library = {
    events: [
      {
        id: 'heart', order: 10, progressRank: 100, replayNode: 'heart-node',
        unlockNodes: ['heart-node'], characterIds: ['xu_tang'], highlight: true,
        cover: { asset: 'heart', mode: 'character', focus: { x: 55, y: 35 } }
      },
      {
        id: 'common', order: 20, progressRank: 200, replayNode: 'common-node',
        unlockNodes: ['common-node'], characterIds: [],
        cover: { asset: 'scene', mode: 'scene', focus: { x: 50, y: 45 } }
      },
      {
        id: 'heroine', order: 30, progressRank: 300, replayNode: 'heroine-node',
        unlockNodes: ['heroine-node'], characterIds: ['xu_tang'],
        cover: { asset: 'heroine', mode: 'character', focus: { x: 60, y: 40 } }
      },
      {
        id: 'explicit', order: 40, progressRank: 400, replayNode: 'explicit-node',
        unlockNodes: ['explicit-node'], characterIds: ['xu_tang'], titleBackdropAsset: 'explicit',
        cover: { asset: 'heroine', mode: 'character', focus: { x: 60, y: 40 } }
      }
    ]
  };

  let visual = titleBackdropVisual(
    library,
    progress('common', 200, { 'heart-node': { nodeId: 'heart-node' }, 'common-node': { nodeId: 'common-node' } }),
    assets
  );
  assert.equal(visual.asset, 'heart');

  visual = titleBackdropVisual(library, progress('heroine', 300), assets);
  assert.equal(visual.asset, 'heroine');

  visual = titleBackdropVisual(library, progress('explicit', 400), assets);
  assert.equal(visual.asset, 'explicit');

  const noHighlightLibrary = { events: library.events.filter((event) => event.id !== 'heart') };
  visual = titleBackdropVisual(noHighlightLibrary, progress('common', 200), assets);
  assert.equal(visual.background, 'scene');
});

test('cinematic Memory cover resolves to poster rather than autoplay source', () => {
  const assets = {
    cinematic: {
      kind: 'cinematic',
      poster: 'poster.jpg',
      sources: { webm: 'movie.webm', mp4: 'movie.mp4' },
      focus: { x: 50, y: 40 }
    }
  };
  const event = {
    cover: { asset: 'cinematic', mode: 'character', focus: { x: 50, y: 40 } }
  };
  const visual = memoryCoverVisual(event, assets);
  assert.equal(visual.mode, 'cinematic');
  assert.equal(resolveVisual(visual, assets).src, 'poster.jpg');
});

test('Memory validation rejects missing replay nodes, missing covers, and invalid character focus', async () => {
  const content = await loadContent();
  const route = content.routes.find((item) => item.config.id === content.routeIndex.defaultRoute);
  const original = structuredClone(route.memoryLibrary);

  route.memoryLibrary.events[0].replayNode = 'does-not-exist';
  route.memoryLibrary.events[1].cover.asset = 'does-not-exist';
  route.memoryLibrary.events[2].cover.focus = { x: 150, y: 40 };

  const errors = await validateContent(content);
  assert.ok(errors.some((error) => error.includes('unknown replayNode does-not-exist')));
  assert.ok(errors.some((error) => error.includes('unknown cover asset does-not-exist')));
  assert.ok(errors.some((error) => error.includes('character cover requires valid focus')));

  route.memoryLibrary = original;
});

test('scene covers accept scene/background assets in the canonical content', async () => {
  const content = await loadContent();
  const errors = await validateContent(content);
  assert.deepEqual(errors, []);
  const route = content.routes.find((item) => item.config.id === content.routeIndex.defaultRoute);
  const start = route.memoryLibrary.events.find((event) => event.replayNode === route.chapter.startNode);
  assert.equal(start.cover.mode, 'scene');
  assert.equal(route.assetManifest.assets[start.cover.asset].kind, 'background');
});
