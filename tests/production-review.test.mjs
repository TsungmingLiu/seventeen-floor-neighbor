import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { buildProductionReviewModel, writeProductionReview } from '../tools/production-review.mjs';
import { renderProductionReview } from '../tools/production-review-render.mjs';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const modelPromise = buildProductionReviewModel('COM-01X');

test('COM-01X review binds its contract, accepted WebP bytes, route choices, Memory replay, and next scene', async () => {
  const model = await modelPromise;
  assert.equal(model.scene.id, 'COM-01X');
  assert.equal(model.scene.source_scene, 'docs/narrative/scenes/vertical-slice/COM-01X.md');
  assert.ok(model.provenance.sources.some((source) => source.path === model.scene.source_scene));

  assert.equal(model.visuals.length, 3);
  for (const visual of model.visuals) {
    assert.equal(visual.status, 'accepted');
    assert.match(visual.thumbnailDataUrl, /^data:image\/webp;base64,/);
    const bytes = Buffer.from(visual.thumbnailDataUrl.slice('data:image/webp;base64,'.length), 'base64');
    assert.equal(bytes.toString('base64'), visual.thumbnailDataUrl.slice('data:image/webp;base64,'.length));
    assert.equal(sha256(bytes), visual.sha256);
    assert.ok(bytes.length > 12 && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP');
    assert.ok(visual.repoPath.endsWith('.webp'));
  }

  assert.equal(model.choices.length, 1);
  assert.equal(model.choices[0].nodeId, 'common_elevator_restart_choice');
  assert.equal(model.choices[0].items.length, 3);
  assert.deepEqual(model.choices[0].items.map((item) => item.next), [
    'common_elevator_restart_match_dry',
    'common_elevator_restart_check_panel',
    'common_elevator_restart_wait'
  ]);
  assert.equal(model.runtime.memory.replayNode, 'common_elevator_restart_enter');
  assert.ok(model.runtime.memory.galleryAssets.includes('cg.opening.com01x.base_normal'));
  assert.deepEqual(model.runtime.nextScenes, [{ sceneId: 'COM-01B', nodeId: 'common_bookstore_bridge_enter' }]);
});

test('production review preserves unknown QA, human, and stale status as not ready', async () => {
  const { production } = await modelPromise;
  assert.equal(production.readiness, 'NOT_READY');
  assert.equal(production.narrativeQa, 'UNRECORDED');
  assert.equal(production.visualQa, 'UNRECORDED');
  assert.equal(production.humanGate, 'UNRECORDED');
  assert.equal(production.staleStatus, 'UNKNOWN_NO_RUN_LEDGER');
});

test('review HTML is deterministic, self-contained, and contains three WebP thumbnails', async () => {
  const model = await modelPromise;
  const first = renderProductionReview(model);
  assert.equal(renderProductionReview(model), first);
  assert.equal((first.match(/src="data:image\/webp;base64,/g) || []).length, 3);
  assert.doesNotMatch(first, /<script\b|\son[a-z]+\s*=|(?:src|href)="https?:\/\//i);
  assert.doesNotMatch(first, /https?:\/\//i);
});

test('review renderer escapes injected markup and rejects unsafe thumbnail sources', async () => {
  const model = structuredClone(await modelPromise);
  model.scene.title = 'x\"><script>alert(1)</script>';
  model.visuals[0].logicalId = 'id\"><img src=x onerror=alert(1)>';
  model.visuals[0].thumbnailDataUrl = 'data:image/svg+xml,<svg onload=alert(1)>';
  const html = renderProductionReview(model);
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.doesNotMatch(html, /<script\b|<img src=x|<[^>]*\sonerror=/);
  assert.equal((html.match(/src="data:image\/webp;base64,/g) || []).length, 2);
  assert.ok(html.includes('UNRECORDED thumbnail'));
});

test('failed regeneration removes a stale generated page when its contract is missing', async () => {
  const directory = 'generated/reviews/COM-99X';
  const page = `${directory}/index.html`;
  let createdDirectory = false;
  try {
    await mkdir('generated/reviews', { recursive: true });
    await mkdir(directory);
    createdDirectory = true;
    await writeFile(page, '<!doctype html><title>stale</title>');
    await assert.rejects(writeProductionReview('COM-99X'), /expected one Narrative Continuity Contract/);
    await assert.rejects(readFile(page), { code: 'ENOENT' });
  } finally {
    if (createdDirectory) await rm(directory, { recursive: true, force: true });
  }
});
