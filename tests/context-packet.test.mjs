import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  buildNarrativeReviewPacket,
  verifyNarrativeReviewPacket
} from '../tools/context-packet.mjs';

const scenePath = 'docs/narrative/scenes/vertical-slice/COM-00.md';
const contractPath = 'content/production/narrative/opening-ch1/COM-00.json';
const canonPaths = [
  'docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md',
  'docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md'
];
const sources = [contractPath, scenePath, ...canonPaths];
const packetArgs = { sceneId: 'COM-00', runId: 'opening-gate-test', taskId: 'NQA-COM00-001' };

function blobSha(path) {
  return execFileSync('git', ['rev-parse', `HEAD:${path}`], { encoding: 'utf8' }).trim();
}

function excerptSha(path, excerpt) {
  const lines = execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8' }).split('\n');
  return createHash('sha256')
    .update(lines.slice(excerpt.start_line - 1, excerpt.end_line).join('\n'))
    .digest('hex');
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function gitIn(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
}

test('COM-00 narrative review packet is deterministic and binds exact canonical sources', async () => {
  const packet = await buildNarrativeReviewPacket(packetArgs);
  const regenerated = await buildNarrativeReviewPacket(packetArgs);

  assert.deepEqual(regenerated, packet);
  assert.equal(packet.scene_id, 'COM-00');

  const acquired = packet.required_acquisition.markdown;
  assert.deepEqual(acquired.map(({ path }) => path).sort(), [...sources].sort());
  const expectedAllowlist = acquired.flatMap((item) => item.excerpts?.length
    ? item.excerpts.map((part) => `${item.path}#L${part.start_line}-L${part.end_line}`)
    : [item.path]);
  assert.deepEqual(packet.allowed_sources, expectedAllowlist);
  for (const item of acquired) {
    assert.equal(item.expected_nonempty, true);
    assert.match(item.git_blob_sha, /^[0-9a-f]{40}$/);
    assert.equal(item.git_blob_sha, blobSha(item.path));
    for (const excerpt of item.excerpts || []) {
      assert.match(excerpt.sha256, /^[0-9a-f]{64}$/);
      assert.equal(excerpt.sha256, excerptSha(item.path, excerpt));
    }
  }

  for (const path of sources) {
    assert.ok(packet.input_versions.some((input) => input.location === path && input.version === blobSha(path)));
  }
  assert.equal(await verifyNarrativeReviewPacket(packet), true);
});

test('COM-00 narrative review packet rejects forbidden roots, bad hashes, and missing bindings', async () => {
  const packet = await buildNarrativeReviewPacket(packetArgs);

  const forbidden = deepClone(packet);
  forbidden.allowed_sources.push('docs/archive/old-scene.md');
  await assert.rejects(verifyNarrativeReviewPacket(forbidden));

  const badHash = deepClone(packet);
  badHash.input_versions[0].version = '0'.repeat(40);
  await assert.rejects(verifyNarrativeReviewPacket(badHash));

  const missingPath = deepClone(packet);
  missingPath.required_acquisition.markdown = missingPath.required_acquisition.markdown.filter((item) => item.path !== canonPaths[0]);
  await assert.rejects(verifyNarrativeReviewPacket(missingPath));

  const missingScene = deepClone(packet);
  delete missingScene.scene_id;
  await assert.rejects(verifyNarrativeReviewPacket(missingScene));
});

test('COM-00 packet verification blocks changed or missing source bytes in an isolated repo', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'context-packet-integrity-'));
  try {
    const copiedPaths = [...sources, '.ai/WORKFLOW_MANIFEST.yaml'];
    for (const relative of copiedPaths) {
      const target = path.join(root, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, await readFile(path.resolve(relative)));
    }
    gitIn(root, 'init', '-q');
    gitIn(root, 'config', 'user.name', 'Packet Test');
    gitIn(root, 'config', 'user.email', 'packet-test@example.invalid');
    gitIn(root, 'add', ...copiedPaths);
    gitIn(root, 'commit', '-qm', 'COM-00 packet integrity fixture');

    const packet = await buildNarrativeReviewPacket({ ...packetArgs, root });
    assert.equal(await verifyNarrativeReviewPacket(packet, { root }), true);

    const sceneFile = path.join(root, scenePath);
    const originalScene = await readFile(sceneFile);
    const changedScene = Buffer.from(originalScene);
    changedScene[0] = changedScene[0] === 0x23 ? 0x24 : 0x23;
    await writeFile(sceneFile, changedScene);
    await assert.rejects(verifyNarrativeReviewPacket(packet, { root }));

    await writeFile(sceneFile, originalScene);
    await rm(path.join(root, canonPaths[0]));
    await assert.rejects(verifyNarrativeReviewPacket(packet, { root }));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
