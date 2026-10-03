import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import {
  adaptApi,
  adaptChatManual,
  adaptWorkBatch,
  buildPackets,
  projectEntry,
  stableStringify,
  sha256,
  validateManifest,
  validateRepoSourceCatalog
} from '../tools/render-cg-packets.mjs';

const sourceCatalog = JSON.parse(fs.readFileSync(new URL('../content/assets/source-catalog.json', import.meta.url), 'utf8'));

function baseEntry() {
  return {
    entry_id: 'TEST-S01-BASE',
    scene_id: 'COM-00',
    source_scene: 'docs/narrative/scenes/vertical-slice/COM-00.md',
    status: 'render_ready',
    cg_class: 'dialogue_cg',
    sequence_id: null,
    beat_range: '00.6',
    narrative: {
      purpose: '建立剛認識的鄰居距離。',
      must_show: ['她站在自己的回家動線上。'],
      must_not_imply: ['不得暗示即時戀愛吸引。']
    },
    characters: [
      {
        character_id: 'xu_tang',
        screen_side: 'right',
        body_orientation: 'three_quarter_left',
        pose: '自然站立，肩膀放鬆。',
        gaze: '看向 off-camera protagonist，短暫後回到門線。',
        expression: 'neutral_observant',
        wardrobe_key: 'XT-WARDROBE-A-WEEKDAY-NEIGHBOR',
        held_objects: [],
        reference_bindings: [
          { role: 'primary_face_identity', source_id: 'ref.xu_tang.face.01', expected_filename: 'xt-ref-01-face.png' },
          { role: 'wardrobe', source_id: 'ref.xu_tang.wardrobe.a', expected_filename: 'xt-ref-05-wardrobe-a.png' },
          { role: 'production_consistency', source_id: 'ref.xu_tang.production.04', expected_filename: 'xt-ref-04-production.png' }
        ]
      }
    ],
    environment: {
      location_id: 'BG-APT-17F-RAIN',
      time_of_day: '21:10',
      weather: 'rain',
      lighting: 'warm corridor practicals with cool rainy ambient spill',
      persistent_props: ['moving_box'],
      reference_binding: { role: 'environment', source_id: 'source.opening.ch1.bg.apt_17f_rain', expected_filename: 'bg-apt-17f-rain-16x9-v1.webp' }
    },
    camera: {
      shot_size: 'medium_wide',
      angle: 'eye_level',
      pov: 'protagonist',
      axis_id: 'COM00-CORRIDOR-AXIS-A',
      camera_side: 'door_1703_side',
      lens_intent: 'natural perspective with readable corridor geography'
    },
    continuity: {
      previous_entry_id: null,
      locked_fields: [],
      allowed_changes: []
    },
    composition: {
      focus: { x: 72, y: 38 },
      dialogue_safe_zone: 'lower_left_to_lower_center',
      framing_notes: ['臉、手與箱角不可落入最底 25%。']
    },
    render_constraints: {
      include: ['一名 27 歲成年東亞女性。'],
      exclude: ['男主完整身體或臉。'],
      text_policy: 'No readable text, captions, logos, UI, or watermark.'
    },
    reference_transport: {
      mode: 'references_required',
      fresh_session_required: true,
      no_unrelated_images_allowed: true,
      accepted_base_asset_id: null,
      attachments: [
        { role: 'primary_face_identity', source_id: 'ref.xu_tang.face.01', expected_filename: 'xt-ref-01-face.png', pixels_must_be_visible: true },
        { role: 'wardrobe', source_id: 'ref.xu_tang.wardrobe.a', expected_filename: 'xt-ref-05-wardrobe-a.png', pixels_must_be_visible: true },
        { role: 'production_consistency', source_id: 'ref.xu_tang.production.04', expected_filename: 'xt-ref-04-production.png', pixels_must_be_visible: true },
        { role: 'environment', source_id: 'source.opening.ch1.bg.apt_17f_rain', expected_filename: 'bg-apt-17f-rain-16x9-v1.webp', pixels_must_be_visible: true }
      ]
    },
    output: {
      canonical_asset_id: 'TEST-S01-BASE',
      logical_asset_id: 'cg.test.s01.base',
      master_filename: 'test-s01-base-v1.png',
      quantity: 1
    },
    acceptance: ['Identity, wardrobe, camera axis and environment match the entry.']
  };
}

function validManifest() {
  return {
    schema_version: '1.0.0',
    manifest_id: 'test-cg-manifest',
    manifest_version: '1.0.0',
    lifecycle: 'CANONICAL',
    source_scene_ids: ['COM-00'],
    style_contract: {
      style_id: 'realistic-game-cinematic-v1',
      positive: ['realistic adult facial anatomy', 'natural skin texture', 'photographic PBR lighting'],
      negative: ['anime', 'cartoon', 'doll-like face'],
      aspect_ratio: '16:9',
      output_count: 1
    },
    entries: [baseEntry()]
  };
}

test('projects byte-identical shared prompt and hash', () => {
  const manifest = validManifest();
  const first = projectEntry(manifest, manifest.entries[0]);
  const second = projectEntry(structuredClone(manifest), structuredClone(manifest.entries[0]));
  assert.equal(first.shared_prompt, second.shared_prompt);
  assert.equal(first.shared_prompt_sha256, second.shared_prompt_sha256);
  assert.equal(first.manifest_sha256, second.manifest_sha256);
  assert.match(first.shared_prompt, /screen_side: right/);
  assert.match(first.shared_prompt, /axis_id: COM00-CORRIDOR-AXIS-A/);
  assert.match(first.shared_prompt, /weather: rain/);
});

test('stableStringify ignores object key insertion order', () => {
  assert.equal(stableStringify({ b: 2, a: { d: 4, c: 3 } }), stableStringify({ a: { c: 3, d: 4 }, b: 2 }));
});

test('unrelated manifest entry revision preserves independent render spec identity', () => {
  const manifest = validManifest();
  const other = structuredClone(manifest.entries[0]);
  other.entry_id = 'TEST-S02-OTHER';
  other.output.canonical_asset_id = other.entry_id;
  other.output.logical_asset_id = 'cg.test.s02.other';
  other.output.master_filename = 'test-s02-other-v1.png';
  manifest.entries.push(other);
  const before = projectEntry(manifest, manifest.entries[0]);
  manifest.manifest_version = '1.0.1';
  other.characters[0].screen_side = 'left';
  const after = projectEntry(manifest, manifest.entries[0]);
  assert.notEqual(before.manifest_sha256, after.manifest_sha256);
  assert.notEqual(before.shared_prompt_sha256, after.shared_prompt_sha256);
  assert.equal(before.render_spec_sha256, after.render_spec_sha256);
  manifest.entries[0].status = 'accepted';
  assert.equal(after.render_spec_sha256, projectEntry(manifest, manifest.entries[0]).render_spec_sha256);
});

test('Chat manual, Work batch and API adapters share one prompt', () => {
  const packets = buildPackets(validManifest());
  const expected = packets[0].shared_prompt;

  const chat = adaptChatManual(packets);
  const chatPrompt = `${chat.split('```text\n')[1].split('\n```')[0]}\n`;
  const work = JSON.parse(adaptWorkBatch(packets).trim());
  const api = JSON.parse(adaptApi(packets));

  assert.equal(chatPrompt, expected);
  assert.equal(work.shared_prompt, expected);
  assert.equal(work.reference_acquisition.method, 'repo_file');
  assert.deepEqual(work.reference_acquisition.required_bindings, packets[0].reference_transport.attachments);
  assert.deepEqual(work.reference_acquisition.resolved_files.map((file) => file.source_id), ['ref.xu_tang.face.01', 'ref.xu_tang.wardrobe.a', 'ref.xu_tang.production.04', 'source.opening.ch1.bg.apt_17f_rain']);
  assert.equal(work.reference_acquisition.resolved_files.length, packets[0].reference_transport.attachments.length);
  assert.ok(work.reference_acquisition.resolved_files.every((file) => file.sourcePath.startsWith('assets-src/')));
  assert.match(chat, /Attachment checklist/);
  assert.equal(api.jobs[0].input.prompt, expected);
  assert.equal(work.shared_prompt_sha256, packets[0].shared_prompt_sha256);
  assert.equal(api.jobs[0].provenance.shared_prompt_sha256, packets[0].shared_prompt_sha256);
});

test('Work batch resolves accepted bases by one canonical asset ID', () => {
  const [packet] = buildPackets(validManifest());
  const source = sourceCatalog.files['source.opening.ch1.cg.com00_s04_base_neutral'];
  packet.reference_transport.attachments = [{ role: 'accepted_base', source_id: source.canonicalAssetId, expected_filename: source.name, pixels_must_be_visible: true }];
  const work = JSON.parse(adaptWorkBatch([packet], { catalog: sourceCatalog }).trim());
  assert.equal(work.reference_acquisition.resolved_files.length, 1);
  assert.equal(work.reference_acquisition.resolved_files[0].source_id, 'source.opening.ch1.cg.com00_s04_base_neutral');
  assert.equal(work.reference_acquisition.resolved_files[0].canonicalAssetId, source.canonicalAssetId);
});

test('repository source catalog rejects hash tampering, path traversal and remote bindings', () => {
  const badHash = structuredClone(sourceCatalog);
  badHash.files['ref.xu_tang.face.01'].sha256 = '0'.repeat(64);
  assert.throws(() => validateRepoSourceCatalog(badHash), /SHA-256 mismatch/);

  const traversal = structuredClone(sourceCatalog);
  traversal.files['ref.xu_tang.face.01'].sourcePath = 'assets-src/../../outside.png';
  traversal.files['ref.xu_tang.face.01'].name = 'outside.png';
  assert.throws(() => validateRepoSourceCatalog(traversal), /escapes assets-src/);

  const remote = structuredClone(sourceCatalog);
  remote.files['ref.xu_tang.face.01'].fileId = 'fake-drive-id';
  assert.throws(() => validateRepoSourceCatalog(remote), /fileId is forbidden remote metadata/);
});

test('Work batch blocks Drive IDs and mismatched filenames', () => {
  const [packet] = buildPackets(validManifest());
  packet.reference_transport.attachments[0].source_id = 'gdrive:abc123';
  assert.throws(() => adaptWorkBatch([packet], { catalog: sourceCatalog }), /Drive reference source is forbidden/);

  const [otherPacket] = buildPackets(validManifest());
  otherPacket.reference_transport.attachments[0].expected_filename = 'wrong.png';
  assert.throws(() => adaptWorkBatch([otherPacket], { catalog: sourceCatalog }), /reference filename mismatch/);
});

test('rejects missing required reference binding', () => {
  const manifest = validManifest();
  manifest.entries[0].reference_transport.attachments.pop();
  assert.throws(() => validateManifest(manifest), /attachments must exactly match/);
});

test('rejects reaction CG without an Accepted Base', () => {
  const manifest = validManifest();
  const entry = manifest.entries[0];
  entry.cg_class = 'reaction_cg';
  entry.reference_transport.mode = 'edit_from_accepted_base';
  entry.reference_transport.accepted_base_asset_id = null;
  entry.continuity.previous_entry_id = 'TEST-S01-BASE';
  entry.continuity.locked_fields = ['/camera'];
  entry.continuity.allowed_changes = ['/characters/0/expression'];
  assert.throws(() => validateManifest(manifest), /requires accepted_base_asset_id/);
});

test('accepts a narrowly scoped reaction edit bound to the previous Accepted Base', () => {
  const manifest = validManifest();
  manifest.entries[0].status = 'accepted';
  const reaction = structuredClone(manifest.entries[0]);
  reaction.entry_id = 'TEST-S01-R01';
  reaction.status = 'render_ready';
  reaction.cg_class = 'reaction_cg';
  reaction.characters[0].expression = 'small_polite_smile';
  reaction.continuity.previous_entry_id = 'TEST-S01-BASE';
  reaction.continuity.locked_fields = ['/camera', '/environment', '/characters/0/wardrobe_key'];
  reaction.continuity.allowed_changes = ['/characters/0/expression'];
  reaction.reference_transport = {
    mode: 'edit_from_accepted_base',
    fresh_session_required: true,
    no_unrelated_images_allowed: true,
    accepted_base_asset_id: 'TEST-S01-BASE',
    attachments: [
      {
        role: 'accepted_base',
        source_id: 'TEST-S01-BASE',
        expected_filename: 'test-s01-base-v1.png',
        pixels_must_be_visible: true
      }
    ]
  };
  reaction.output = {
    canonical_asset_id: 'TEST-S01-R01',
    logical_asset_id: 'cg.test.s01.r01',
    master_filename: 'test-s01-r01-v1.png',
    quantity: 1
  };
  manifest.entries.push(reaction);
  assert.doesNotThrow(() => validateManifest(manifest));
  assert.deepEqual(buildPackets(manifest).map((packet) => packet.entry_id), ['TEST-S01-R01']);
});

test('rejects archive and experiment paths anywhere in canonical manifest', () => {
  const manifest = validManifest();
  manifest.entries[0].source_scene = 'docs/archive/example.md';
  assert.throws(() => validateManifest(manifest), /forbidden source root/);
});

test('allows known issues only on accepted migration assets', () => {
  const manifest = validManifest();
  manifest.entries[0].known_issues = ['Existing accepted asset has a documented wardrobe drift.'];
  assert.throws(() => validateManifest(manifest), /known_issues is migration-only and requires accepted status/);
  manifest.entries[0].status = 'accepted';
  assert.doesNotThrow(() => validateManifest(manifest));
});

test('defaults to render_ready entries only', () => {
  const manifest = validManifest();
  const accepted = structuredClone(manifest.entries[0]);
  accepted.entry_id = 'TEST-S02-ACCEPTED';
  accepted.status = 'accepted';
  accepted.output.canonical_asset_id = 'TEST-S02-ACCEPTED';
  accepted.output.logical_asset_id = 'cg.test.s02.accepted';
  manifest.entries.push(accepted);
  assert.deepEqual(buildPackets(manifest).map((packet) => packet.entry_id), ['TEST-S01-BASE']);
  assert.deepEqual(buildPackets(manifest, { statuses: new Set(['accepted']) }).map((packet) => packet.entry_id), ['TEST-S02-ACCEPTED']);
});

test('linked sequence requires explicit benefit and consecutive matching entries', () => {
  const manifest = validManifest();
  const first = manifest.entries[0];
  first.sequence_id = 'TEST-SEQ-01';
  first.sequence_continuity_benefit = 'Preserve the same corridor geography through consecutive action.';
  const second = structuredClone(first);
  second.entry_id = 'TEST-S01-NEXT';
  second.continuity.previous_entry_id = first.entry_id;
  second.output.canonical_asset_id = second.entry_id;
  second.output.logical_asset_id = 'cg.test.s01.next';
  second.output.master_filename = 'test-s01-next-v1.png';
  manifest.entries.push(second);
  assert.doesNotThrow(() => validateManifest(manifest));
  second.characters[0].wardrobe_key = 'XT-WARDROBE-A-LATE-NIGHT-CONVENIENCE-STORE';
  assert.throws(() => validateManifest(manifest), /must keep scene, characters, wardrobe and environment/);
  second.characters[0].wardrobe_key = first.characters[0].wardrobe_key;
  second.continuity.previous_entry_id = null;
  assert.throws(() => validateManifest(manifest), /consecutive linked entries/);
  second.continuity.previous_entry_id = first.entry_id;
  delete second.sequence_continuity_benefit;
  assert.throws(() => validateManifest(manifest), /sequence_continuity_benefit is required/);
});

// Exact projections captured before edits at pinned 05c35687966e1cc20945860be91de97880cbb068.
const pinnedLegacyControls = [
  {
    "file": "opening-ch1.json",
    "entry_id": "COM00-S02-DOOR-ASSIST",
    "prompt": "cf5dca1233fd4821c345e9293ceeb63b492427e06ce89685f391141b62bc6850",
    "spec": "b2fe79cb3a4c0dbb0dda86bda2252bd2d81bdf43979fbc99c6b527d09c8a3a0c",
    "packet": "fc1a7e3c17a84b86389c209c30db93243b67651f39180b3e321d3e694a739516"
  },
  {
    "file": "opening-ch1.json",
    "entry_id": "COM00-S04-BASE-NEUTRAL",
    "prompt": "a30a13268d4e55ab8a2d9beba1de100843d6e8102092d5d6ed5867c4dad7f7a7",
    "spec": "a78b4b422c1d0d8b6f4321fd80d1ffaec3ac458f3e2a590603a0b9a386d7481c",
    "packet": "81eb564f4c31b800590c2abfb081f8276782ad1ee65f08d0d8631fa0ebfdaebc"
  },
  {
    "file": "opening-ch1.json",
    "entry_id": "COM00-S04-R01-POLITE-SMILE",
    "prompt": "e0dc3145877bd75399a3fb951d888dc82cdec90458ac983115af8974abba52e7",
    "spec": "b1ecf0ed52d8f5ab92fb242a059fb84c23c2334b9f0585dd16259c0b48fe8360",
    "packet": "12c4b4b173a3ad761c1b625aa48399d9ad06b6355528d19d86cfa34db0013bcf"
  },
  {
    "file": "opening-ch1.json",
    "entry_id": "COM01X-BASE-NORMAL",
    "prompt": "92f6c8f6d48a0ef3ce28ffd8bc14d428f00a97afa28a50a4da2e8839f3aa94df",
    "spec": "08d8887ccdf4eb181bcc667be9412aff299b27e2a9315985a08259667c4ae720",
    "packet": "a961378bdb0b779fcc03ffa942b9563ccd303f9f891e557115dcccf9209dc91d"
  },
  {
    "file": "opening-ch1.json",
    "entry_id": "COM01X-R01-RESTART",
    "prompt": "76ee87fa42f3b506a630f786df9642fd01a53b759b8502e443bf54e7fa4b01a8",
    "spec": "2db79b60a8f57413ba89c7540450b6acba0689457437193a8b432d2082fc8445",
    "packet": "214fa48435a0bfef9aee827d4d378554e2a0259ec44c40176167f029718d57b3"
  },
  {
    "file": "opening-ch1.json",
    "entry_id": "COM01X-R02-DRY-SMILE",
    "prompt": "a749184c89d636b240d43d9e5bc7a87eb5f8681c36f7729ac65b66eccc964a0c",
    "spec": "1d45f5cae9f69fee715a9e6ca8787a14a2470789bb22e1ee7b309d43c8e8c3dc",
    "packet": "65fdb35bf9c3a357c83dbc224bc499cb2a0f02292b2b4cd617200d964bb539e0"
  },
  {
    "file": "opening-ch1-com01b.json",
    "entry_id": "COM-01B-CG-01",
    "prompt": "f0eb435938689dc4ea69906c4943529e0f9ac0c70459412bfe6aaa7b4c23ee4b",
    "spec": "13058d2edc98e71903281b82790012c42d567211bc256542f1ae217e69369235",
    "packet": "395684246563ace1b2be0639fa25c82bd8463685764045309cd8f61703fcb7d7"
  },
  {
    "file": "opening-ch1-com01b.json",
    "entry_id": "COM-01B-CG-02",
    "prompt": "5099c460f168e7c43ac375108e5d0af92b561c2e78d79932b56e618e734556ad",
    "spec": "bd3caf96dad50dd2f8b29af790d9d8882e208a5b69a5c4a7fd1338d88b19d6db",
    "packet": "a555dfe592099a329ff7fb716d1ab36e097e09bbd3b1f87f4cb91087ee2301d2"
  },
  {
    "file": "opening-ch1-com02x-microwave.json",
    "entry_id": "COM02X-DLG-02-MICROWAVE",
    "prompt": "f5b6bb65f7776c36ef92105903e3d8488740d5f78932fd6327d5f34a5d91c763",
    "spec": "ca784198cc74c073d5547e82537f4e26ad5ecbf68cc339d78e6a15fe089317a9",
    "packet": "72f8dd5bc47501b93ffe0c317777e79bbf6f200545cbd20b0ec91f836275359f"
  }
];

test('pinned legacy 1.0 controls reproduce exact prompts, render specs and entire packets', () => {
  for (const control of pinnedLegacyControls) {
    const manifest = JSON.parse(fs.readFileSync(new URL(`../content/production/cg-manifests/${control.file}`, import.meta.url)));
    const packet = projectEntry(manifest, manifest.entries.find(entry => entry.entry_id === control.entry_id));
    assert.equal(packet.shared_prompt_sha256, control.prompt);
    assert.equal(packet.render_spec_sha256, control.spec);
    assert.equal(sha256(stableStringify(packet)), control.packet);
  }
});

function embodimentManifest() {
  const manifest = validManifest();
  manifest.schema_version = '1.1.0';
  manifest.entries[0].scene_embodiment = {
    captured_moment: { before: 'Approaching the door.', during: 'Pausing at the threshold.', after: 'Continuing home.' },
    characters: [{
      character_id: 'xu_tang',
      action_flow: { before: 'Step toward the door.', during: 'Pause with hand at the handle.', after: 'Release the handle.' },
      environment_coupling: { mode: 'anchored', anchor: 'Door threshold.', interaction: 'Hand rests on door handle while talking.' },
      physical_cues: { support: 'Both feet on threshold floor.', contact: 'Fingers meet handle.', weight: 'Weight on rear foot.', material_response: 'Sleeve folds at bent elbow.' }
    }],
    depth_staging: { foreground: 'Near door edge.', midground: 'Character at threshold.', background: 'Hallway recedes.', subject_separation: 'Edge light against darker hallway.' }
  };
  return manifest;
}

test('1.1 shot sizes fail closed consistently in shared validation, projection and CLI', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cg-shot-size-'));
  const manifestPath = path.join(directory, 'manifest.json');
  const cli = new URL('../tools/render-cg-packets.mjs', import.meta.url);
  try {
    for (const shotSize of ['extreme_wide', 'wide', 'medium_wide', 'medium', 'medium_close', 'close', 'extreme_close', 'close_up', 'portrait', 'unknown']) {
      const manifest = embodimentManifest();
      manifest.entries[0].camera.shot_size = shotSize;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest));
      const result = spawnSync(process.execPath, [cli.pathname, '--manifest', manifestPath, '--check'], { encoding: 'utf8' });
      assert.ifError(result.error);
      if (['extreme_wide', 'wide', 'medium_wide', 'medium'].includes(shotSize)) {
        assert.doesNotThrow(() => validateManifest(manifest), shotSize);
        assert.doesNotThrow(() => projectEntry(manifest, manifest.entries[0]), shotSize);
        assert.equal(result.status, 0, `${shotSize}: ${result.stderr}`);
        assert.match(result.stdout, /Validated test-cg-manifest@1\.0\.0: 1 entries/);
      } else {
        assert.throws(() => validateManifest(manifest), /unsupported shot_size in POC/, shotSize);
        assert.throws(() => projectEntry(manifest, manifest.entries[0]), /unsupported shot_size in POC/, shotSize);
        assert.equal(result.status, 1, shotSize);
        assert.match(result.stderr, /unsupported shot_size in POC/, shotSize);
        assert.equal(result.stdout, '', shotSize);
      }
    }
    for (const shotSize of ['medium_close', 'close', 'extreme_close']) {
      const legacy = validManifest();
      legacy.entries[0].camera.shot_size = shotSize;
      assert.doesNotThrow(() => validateManifest(legacy), `legacy ${shotSize}`);
      assert.doesNotThrow(() => projectEntry(legacy, legacy.entries[0]), `legacy ${shotSize}`);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('opt-in embodiment projects every authored field identically through all adapters', () => {
  const manifest = embodimentManifest();
  const packets = buildPackets(manifest);
  const prompt = packets[0].shared_prompt;
  assert.ok(prompt.includes(stableStringify(manifest.entries[0].scene_embodiment)));
  assert.equal(`${adaptChatManual(packets).split('```text\n')[1].split('\n```')[0]}\n`, prompt);
  assert.equal(JSON.parse(adaptWorkBatch(packets)).shared_prompt, prompt);
  assert.equal(JSON.parse(adaptApi(packets)).jobs[0].input.prompt, prompt);
  assert.deepEqual(buildPackets(structuredClone(manifest)), packets);
});

test('version, incomplete embodiment, class and unresolved exception boundaries fail closed', () => {
  const cases = [
    [m => { m.schema_version = '2.0.0'; }, /schema_version/],
    [m => { m.schema_version = '1.0.0'; }, /requires schema_version/],
    [m => { delete m.entries[0].scene_embodiment; }, /must be an object/],
    [m => { m.entries[0].scene_embodiment.captured_moment.during = ' '; }, /during must be non-empty/],
    [m => { delete m.entries[0].scene_embodiment.characters[0].action_flow.after; }, /after is required/],
    [m => { delete m.entries[0].scene_embodiment.characters[0].physical_cues.weight; }, /weight is required/],
    [m => { delete m.entries[0].scene_embodiment.depth_staging.background; }, /background is required/],
    [m => { m.entries[0].scene_embodiment.characters = []; }, /exactly cover/],
    [m => { m.entries[0].scene_embodiment.characters[0].character_id = 'unknown'; }, /exactly cover/],
    [m => { m.entries[0].scene_embodiment.characters[0].environment_coupling.mode = 'none'; }, /mode is invalid/],
    [m => { m.entries[0].scene_embodiment.exception = 'portrait'; }, /unsupported fields/],
    [m => { m.entries[0].cg_class = 'reaction_cg'; }, /unsupported POC class/],
    [m => { m.entries[0].cg_class = 'cg_sequence_keyframe'; }, /unsupported POC class/],
    [m => { m.entries[0].camera.shot_size = 'close'; }, /close-up unsupported/],
    [m => { m.entries[0].continuity.previous_entry_id = m.entries[0].entry_id; }, /inheritance\/sequence unsupported/],
    [m => { m.entries[0].sequence_id = 'test'; m.entries[0].sequence_continuity_benefit = 'test'; }, /inheritance\/sequence unsupported/],
    [m => { m.entries[0].cg_class = 'event_cg'; }, /event requires active_interaction/]
  ];
  for (const [mutate, error] of cases) {
    const manifest = embodimentManifest(); mutate(manifest);
    assert.throws(() => validateManifest(manifest), error);
  }
});

test('event supports active interaction, background requires no character embodiment', () => {
  const event = embodimentManifest();
  event.entries[0].cg_class = 'event_cg';
  event.entries[0].scene_embodiment.characters[0].environment_coupling.mode = 'active_interaction';
  assert.doesNotThrow(() => validateManifest(event));
  const background = embodimentManifest(); const entry = background.entries[0];
  entry.cg_class = 'background_cg'; entry.characters = []; entry.scene_embodiment.characters = [];
  entry.reference_transport = { mode: 'none', fresh_session_required: true, no_unrelated_images_allowed: true, accepted_base_asset_id: null, attachments: [] };
  assert.doesNotThrow(() => validateManifest(background));
});

test('embodiment changes affect only the edited entry render spec and prompt', () => {
  const manifest = embodimentManifest();
  const second = structuredClone(manifest.entries[0]);
  second.entry_id = 'TEST-OTHER'; second.output.logical_asset_id = 'cg.test.other';
  manifest.entries.push(second);
  const before = manifest.entries.map(entry => projectEntry(manifest, entry));
  second.scene_embodiment.captured_moment.during = 'Another authored moment.';
  const after = manifest.entries.map(entry => projectEntry(manifest, entry));
  assert.equal(before[0].render_spec_sha256, after[0].render_spec_sha256);
  assert.equal(before[0].shared_prompt_sha256, after[0].shared_prompt_sha256);
  assert.notEqual(before[1].render_spec_sha256, after[1].render_spec_sha256);
  assert.notEqual(before[1].shared_prompt_sha256, after[1].shared_prompt_sha256);
  assert.notEqual(before[0].manifest_sha256, after[0].manifest_sha256);
});

test('POC projection cannot substitute an unvalidated object with an existing entry ID', () => {
  const manifest = embodimentManifest();
  const substitute = structuredClone(manifest.entries[0]);
  substitute.scene_embodiment.characters = [];
  assert.throws(() => projectEntry(manifest, substitute), /must match the validated manifest entry/);
});
