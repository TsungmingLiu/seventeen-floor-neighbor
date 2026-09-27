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

test('cg_plan CLI verifies the packet and rejects a conflicting session cache artifact', async () => {
  const runId = `cg-plan-cli-${process.pid}-${Date.now()}`;
  const relative = `generated/session-cache/${runId}/CGP-COM00-001.packet.json`;
  const destination = path.join(projectRoot, relative);
  try {
    const args = ['--task', 'cg_plan', '--scene', 'COM-00', '--run-id', runId,
      '--task-id', 'CGP-COM00-001', '--upstream-run-id', 'issue16-com00-nqa-20260926',
      '--upstream-task-id', 'NQA-COM00-001', '--reference-ids',
      'ref.xu_tang.face.01,ref.xu_tang.wardrobe.a,source.opening.ch1.bg.apt_17f_rain'];
    const created = context(...args);
    assert.equal(created.status, 0, created.stderr);
    assert.match(created.stdout, /Packet: .* SHA-256 [0-9a-f]{64}/);
    const original = await readFile(destination, 'utf8');
    const verified = context('--verify-packet', destination);
    assert.equal(verified.status, 0, verified.stderr);
    const changed = JSON.parse(original);
    changed.objective = 'Forged planner objective';
    const conflictingBody = `${JSON.stringify(changed, null, 2)}\n`;
    await writeFile(destination, conflictingBody);
    const conflict = context(...args);
    assert.equal(conflict.status, 1);
    assert.match(conflict.stderr, /BLOCKED: Task Packet destination conflict/);
    assert.equal(await readFile(destination, 'utf8'), conflictingBody);
    const invalid = context('--verify-packet', destination);
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /BLOCKED: .*differ from canonical sources/);
  } finally {
    await rm(path.join(projectRoot, 'generated/session-cache', runId), { recursive: true, force: true });
  }
});
