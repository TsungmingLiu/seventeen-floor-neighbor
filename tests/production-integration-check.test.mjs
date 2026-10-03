import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { access, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { projectRoot } from '../tools/content-lib.mjs';
import { sha256 } from '../tools/render-cg-packets.mjs';

const contract = 'content/production/narrative/opening-ch1/COM-02X.json';
const manifest = 'content/production/cg-manifests/opening-ch1-com02x.json';
const legacyManifest = 'content/production/cg-manifests/opening-ch1.json';
const gateReport = 'generated/session-cache/integration-check/COM-02X/check.json';
const acceptedReceipt = 'content/assets/ingest-receipts/com02x-accepted-masters-v1.json';
const assetManifest = 'content/assets/manifest.json';
const humanDecision = 'content/production/runs/com02x-cg-20260930/HUMAN-COM02X-MASTER-001.decision.json';
const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();

// Actual current unadopted runtime stays blocked. Historical accepted-entry scenarios use
// a disposable local Git baseline; its commits are never production approval.
test('current COM-02X pre-integration gate rejects stale or incomplete inputs', async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'current-scene-stale-'));
  const checkout = path.join(temporary, 'checkout');
  const productionRef = git(projectRoot, 'rev-parse', 'HEAD');
  let sourceRef = productionRef;
  const evidence = { task_id: 'M0-CURRENT-SCENE-STALE-001', source_ref: sourceRef,
    node_version: process.version, scenarios: [], inputs: {}, outputs: {} };
  const files = [contract, manifest, legacyManifest, acceptedReceipt, humanDecision, assetManifest,
    'docs/narrative/scenes/vertical-slice/COM-02X.md',
    'tools/production-impact.mjs', 'tools/production-integration-check.mjs'];
  const originals = new Map();
  try {
    git(projectRoot, 'clone', '--quiet', '--no-hardlinks', '--no-checkout', projectRoot, checkout);
    git(checkout, 'checkout', '--quiet', '--detach', productionRef);
    for (const file of ['tools/production-impact.mjs', 'tools/production-integration-check.mjs']) {
      await copyFile(path.join(projectRoot, file), path.join(checkout, file));
    }
    for (const file of files) {
      const bytes = await readFile(path.join(checkout, file));
      originals.set(file, bytes);
      evidence.inputs[file] = sha256(bytes);
    }
    const readJson = async (file) => JSON.parse(await readFile(path.join(checkout, file), 'utf8'));
    const editJson = async (file, edit) => {
      const value = await readJson(file); edit(value);
      await writeFile(path.join(checkout, file), `${JSON.stringify(value, null, 2)}\n`);
    };
    const restore = async () => {
      for (const [file, bytes] of originals) await writeFile(path.join(checkout, file), bytes);
    };
    const run = () => spawnSync(process.execPath, ['tools/production-integration-check.mjs',
      '--scene', 'COM-02X', '--from', sourceRef, '--to', 'WORKTREE'], { cwd: checkout, encoding: 'utf8' });
    const record = async (name, result, expected) => {
      assert.equal(result.error, undefined, result.error?.message);
      assert.equal(result.status, expected, `${name}: ${result.stdout}${result.stderr}`);
      let bytes = null;
      try { bytes = await readFile(path.join(checkout, gateReport)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      const report = bytes ? JSON.parse(bytes) : null;
      evidence.scenarios.push({ name, exit_code: result.status, report_sha256: bytes && sha256(bytes),
        status: report?.status || 'SOURCE_ACQUISITION_BLOCKED',
        changes: report?.impact.changes, would_invalidate: report?.impact.would_invalidate,
        stderr: result.stderr.trim() });
      return report;
    };
    await t.test('actual current unadopted runtime entry remains blocked before historical fixture isolation', async () => {
      const result = run();
      await record('actual_current_unadopted_runtime', result, 1);
      assert.match(result.stderr, /runtime CG entry has no accepted asset binding: COM02X-RETURN-ELEVATOR-01/);
      await assert.rejects(access(path.join(checkout, gateReport)), { code: 'ENOENT' });
    });
    const acceptedIds = ['COM02X-BG-01', 'COM02X-DLG-01', 'COM02X-DLG-02-MICROWAVE', 'COM02X-WALK-01'];
    const referenceId = 'COM02X-ENV-CONVENIENCE-NIGHT-REFERENCE';
    const excluded = [];
    const fixtureManifests = git(checkout, 'ls-files', 'content/production/cg-manifests/*.json').split('\n');
    for (const file of fixtureManifests) {
      const value = await readJson(file);
      const retained = value.entries.filter((entry) => entry.scene_id !== 'COM-02X' ||
        acceptedIds.includes(entry.entry_id) || entry.entry_id === referenceId);
      const removed = value.entries.filter((entry) => !retained.includes(entry));
      if (!removed.length) continue;
      assert.ok(removed.every((entry) => entry.status !== 'accepted'));
      excluded.push(...removed.map((entry) => entry.entry_id));
      await editJson(file, (fixture) => { fixture.entries = retained; });
      assert.deepEqual((await readJson(file)).entries, retained);
      git(checkout, 'add', '--', file);
      originals.set(file, await readFile(path.join(checkout, file)));
    }
    assert.ok(excluded.includes('COM02X-RETURN-ELEVATOR-01'));
    git(checkout, '-c', 'user.name=Disposable integration fixture', '-c', 'user.email=fixture@localhost',
      'commit', '--quiet', '--no-verify', '-m', 'Isolate historical accepted COM02X entries for CLI regression');
    sourceRef = git(checkout, 'rev-parse', 'HEAD');
    originals.set(manifest, await readFile(path.join(checkout, manifest)));
    evidence.fixture_baseline = { production_ref: productionRef, isolated_fixture_ref: sourceRef,
      production_approval: false, compared_runtime_entry_ids: acceptedIds,
      excluded_unadopted_entry_ids: excluded,
      accepted_entry_and_receipt_bytes: 'unchanged; only disposable manifest membership isolated' };
    await t.test('unchanged bindings include four runtime entries and exact reference exclusion', async () => {
      const report = await record('unchanged', run(), 0);
      assert.equal(report.status, 'NO_STALE_DIFF');
      assert.deepEqual(report.impact.compared_entry_ids, ['COM02X-BG-01', 'COM02X-DLG-01', 'COM02X-DLG-02-MICROWAVE', 'COM02X-WALK-01']);
      assert.deepEqual(report.impact.excluded_reference_entry_ids, ['COM02X-ENV-CONVENIENCE-NIGHT-REFERENCE']);
      assert.deepEqual(report.impact.changes, []);
    });
    await t.test('material contract change blocks integration and scene visual descendants', async () => {
      await editJson(contract, (value) => { value.exit_state.relationships[0].label += '_controlled_material_edit'; });
      const report = await record('material_contract', run(), 1);
      assert.ok(report.impact.would_invalidate.includes('narrative_review:COM-02X'));
      for (const id of report.impact.compared_entry_ids) assert.ok(report.impact.would_invalidate.includes(`candidate:${id}`));
      assert.ok(report.impact.would_invalidate.includes('integration:COM-02X'));
      assert.ok(report.impact.would_invalidate.every((id) => !/COM-0[01]|COM01/.test(id)));
      // The documented integration sequence runs the real build only after a successful CLI preflight.
      const sequence = spawnSync('bash', ['-c', '"$1" tools/production-integration-check.mjs --scene COM-02X --from HEAD --to WORKTREE && "$1" tools/build.mjs', 'preflight-build', process.execPath],
        { cwd: checkout, encoding: 'utf8' });
      assert.equal(sequence.status, 1, sequence.stderr);
      await assert.rejects(access(path.join(checkout, 'dist')), { code: 'ENOENT' });
      evidence.scenarios.push({ name: 'preflight_then_actual_build', exit_code: sequence.status, build_output_created: false });
      await restore();
    });
    await t.test('one visual-only entry change rejects old integration with bounded visual scope', async () => {
      await editJson(manifest, (value) => { value.entries.find((e) => e.entry_id === 'COM02X-DLG-01').camera.lens_intent += ' controlled edit'; });
      const report = await record('single_visual_entry', run(), 1);
      assert.deepEqual(report.impact.changes.map((c) => c.changed_artifact_id), ['cg_manifest_entry:COM02X-DLG-01']);
      assert.ok(report.impact.would_invalidate.includes('integration:COM-02X'));
      assert.ok(!report.impact.would_invalidate.includes('narrative_review:COM-02X'));
      assert.ok(report.impact.would_invalidate.filter((id) => id.startsWith('candidate:')).every((id) => id === 'candidate:COM02X-DLG-01'));
      await restore();
    });
    await t.test('unrelated scene and header changes need provenance reconciliation without stale integration', async () => {
      await editJson(manifest, (value) => { value.manifest_version += '-controlled-header'; });
      await editJson(legacyManifest, (value) => { value.entries.find((e) => e.scene_id !== 'COM-02X').camera.lens_intent += ' unrelated edit'; });
      const report = await record('unrelated_and_header', run(), 0);
      assert.deepEqual(report.impact.changes, []);
      assert.ok(report.impact.manifest_reconciliation_required.length > 0);
      await restore();
    });
    await t.test('runtime render-ready entry is rejected instead of globally filtered', async () => {
      await editJson(manifest, (value) => { value.entries[0].status = 'render_ready'; });
      await record('runtime_render_ready', run(), 1);
      await assert.rejects(access(path.join(checkout, gateReport)), { code: 'ENOENT' });
      await restore();
    });
    await t.test('accepted-base dependency prevents reference-only bypass', async () => {
      await editJson(manifest, (value) => { value.entries[0].reference_transport.accepted_base_asset_id = 'COM02X-ENV-CONVENIENCE-NIGHT-REFERENCE'; });
      await record('reference_accepted_base_dependency', run(), 1);
      await restore();
    });
    await t.test('other-scene accepted-base dependencies and registry keys prevent exclusion', async () => {
      await editJson(legacyManifest, (value) => {
        value.entries.find((e) => e.scene_id !== 'COM-02X').reference_transport.accepted_base_asset_id = 'COM02X-ENV-CONVENIENCE-NIGHT-REFERENCE';
      });
      await record('other_scene_reference_dependency', run(), 1);
      await restore();
      await editJson(assetManifest, (value) => { value.assets['ref.com02x.convenience-night.environment'] = { kind: 'background' }; });
      await record('reference_registry_key', run(), 1);
      await restore();
    });
    await t.test('missing source clears prior success report and fails closed', async () => {
      await record('fresh_success_before_missing', run(), 0);
      await rm(path.join(checkout, contract));
      await record('missing_contract', run(), 1);
      await assert.rejects(access(path.join(checkout, gateReport)), { code: 'ENOENT' });
      await restore();
    });
    await t.test('tampered Human decision and receipt hashes reject', async () => {
      await writeFile(path.join(checkout, humanDecision), Buffer.concat([originals.get(humanDecision), Buffer.from('\n')]));
      await record('tampered_human_decision', run(), 1);
      await restore();
      await editJson(acceptedReceipt, (value) => { value.assets[0].sha256 = '0'.repeat(64); });
      await record('tampered_receipt_hash', run(), 1);
      await restore();
    });
    await t.test('rehashed Human receipt still requires the exact adopted asset selection', async () => {
      await editJson(humanDecision, (value) => { value.accepted_assets[0].sha256 = '0'.repeat(64); });
      const modifiedHash = sha256(await readFile(path.join(checkout, humanDecision)));
      await editJson(acceptedReceipt, (value) => { value.humanDecision.sha256 = modifiedHash; });
      await record('mismatched_exact_human_selection', run(), 1);
      await restore();
    });
    await t.test('tampered derivative and accepted master fail acquisition', async () => {
      const asset = (await readJson(acceptedReceipt)).assets[0];
      for (const [name, file] of [['tampered_derivative', asset.derivativePath], ['tampered_master', asset.masterPath]]) {
        const bytes = await readFile(path.join(checkout, file));
        try {
          const altered = Buffer.from(bytes); altered[altered.length - 1] ^= 1;
          await writeFile(path.join(checkout, file), altered);
          await record(name, run(), 1);
          await assert.rejects(access(path.join(checkout, gateReport)), { code: 'ENOENT' });
        } finally { await writeFile(path.join(checkout, file), bytes); }
      }
    });
    await t.test('tampered reference bytes cannot use a prior clean report', async () => {
      const catalog = await readJson('content/assets/source-catalog.json');
      const file = catalog.files['ref.com02x.environment.convenience_night'].sourcePath;
      const bytes = await readFile(path.join(checkout, file));
      try {
        const altered = Buffer.from(bytes); altered[altered.length - 1] ^= 1;
        await writeFile(path.join(checkout, file), altered);
        await record('tampered_reference', run(), 1);
      } finally { await writeFile(path.join(checkout, file), bytes); }
    });
    for (const [file, bytes] of originals) assert.equal(sha256(await readFile(path.join(checkout, file))), sha256(bytes));
    evidence.source_cleanup = 'RESTORED_AND_DISPOSABLE_FIXTURE_REPOSITORY_REMOVED';
  } finally {
    await rm(temporary, { recursive: true, force: true });
    const destination = path.join(projectRoot, 'generated/session-cache/m0-current-scene-stale/controlled-edit.audit.json');
    for (const file of ['tools/production-impact.mjs', 'tools/production-integration-check.mjs', 'tests/production-integration-check.test.mjs']) {
      evidence.outputs[file] = sha256(await readFile(path.join(projectRoot, file)));
    }
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, `${JSON.stringify(evidence, null, 2)}\n`);
  }
});
