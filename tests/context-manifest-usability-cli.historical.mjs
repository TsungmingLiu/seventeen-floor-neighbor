import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { projectRoot } from '../tools/content-lib.mjs';

function context(...args) {
  return spawnSync(process.execPath, ['tools/context.mjs', ...args], {
    cwd: projectRoot, encoding: 'utf8', timeout: 180_000
  });
}

test('pre-render COM-00 visual_review CLI verifies scoped packet and blocks a cache conflict', async () => {
  const runId = `manifest-review-cli-${process.pid}-${Date.now()}`;
  const relative = `generated/session-cache/${runId}/MUA-COM00-001.packet.json`;
  const destination = path.join(projectRoot, relative);
  try {
    const args = ['--task', 'visual_review', '--review-scope', 'manifest_usability', '--scene', 'COM-00',
      '--run-id', runId, '--task-id', 'MUA-COM00-001',
      '--upstream-run-id', 'issue16-com00-nqa-20260926', '--upstream-task-id', 'NQA-COM00-001',
      '--entry-ids', 'COM00-S02-DOOR-ASSIST,COM00-S04-BASE-NEUTRAL,COM00-S04-R01-POLITE-SMILE'];
    const created = context(...args);
    assert.equal(created.status, 0, created.stderr);
    assert.match(created.stdout, /Packet: .* SHA-256 [0-9a-f]{64}/);
    const original = await readFile(destination, 'utf8');
    const packet = JSON.parse(original);
    assert.equal(packet.review_scope, 'manifest_usability');
    assert.equal(packet.required_acquisition.images.length, 0);
    assert.equal(packet.human_gate, 'none');
    assert.equal(context('--verify-packet', destination).status, 0);
    packet.objective = 'Forged manifest review';
    const forged = `${JSON.stringify(packet, null, 2)}\n`;
    await writeFile(destination, forged);
    const conflict = context(...args);
    assert.equal(conflict.status, 1);
    assert.match(conflict.stderr, /BLOCKED: Task Packet destination conflict/);
    assert.equal(await readFile(destination, 'utf8'), forged);
    const invalid = context('--verify-packet', destination);
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /BLOCKED: .*differ from canonical sources/);
  } finally {
    await rm(path.join(projectRoot, 'generated/session-cache', runId), { recursive: true, force: true });
  }
});
