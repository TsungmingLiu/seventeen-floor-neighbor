import assert from 'node:assert/strict';
import test from 'node:test';

import {
  adaptApi,
  adaptChatManual,
  adaptWorkBatch,
  buildPackets,
  projectEntry,
  stableStringify,
  validateManifest
} from '../tools/render-cg-packets.mjs';

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
          { role: 'primary_face_identity', source_id: 'ref.xt.face.01', expected_filename: 'xt-ref-01-face.png' },
          { role: 'wardrobe', source_id: 'ref.xt.wardrobe.a', expected_filename: 'xt-ref-05-wardrobe-a.png' }
        ]
      }
    ],
    environment: {
      location_id: 'BG-APT-17F-RAIN',
      time_of_day: '21:10',
      weather: 'rain',
      lighting: 'warm corridor practicals with cool rainy ambient spill',
      persistent_props: ['moving_box'],
      reference_binding: { role: 'environment', source_id: 'bg.apt.17f.rain', expected_filename: 'bg-apt-17f-rain-16x9-v1.jpg' }
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
      mode: 'human_attachment_required',
      fresh_session_required: true,
      no_unrelated_images_allowed: true,
      accepted_base_asset_id: null,
      attachments: [
        { role: 'primary_face_identity', source_id: 'ref.xt.face.01', expected_filename: 'xt-ref-01-face.png', pixels_must_be_visible: true },
        { role: 'wardrobe', source_id: 'ref.xt.wardrobe.a', expected_filename: 'xt-ref-05-wardrobe-a.png', pixels_must_be_visible: true },
        { role: 'environment', source_id: 'bg.apt.17f.rain', expected_filename: 'bg-apt-17f-rain-16x9-v1.jpg', pixels_must_be_visible: true }
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

test('Chat manual, Work batch and API adapters share one prompt', () => {
  const packets = buildPackets(validManifest());
  const expected = packets[0].shared_prompt;

  const chat = adaptChatManual(packets);
  const chatPrompt = `${chat.split('```text\n')[1].split('\n```')[0]}\n`;
  const work = JSON.parse(adaptWorkBatch(packets).trim());
  const api = JSON.parse(adaptApi(packets));

  assert.equal(chatPrompt, expected);
  assert.equal(work.shared_prompt, expected);
  assert.equal(api.jobs[0].input.prompt, expected);
  assert.equal(work.shared_prompt_sha256, packets[0].shared_prompt_sha256);
  assert.equal(api.jobs[0].provenance.shared_prompt_sha256, packets[0].shared_prompt_sha256);
});

test('rejects Human Attachment Gate mismatch', () => {
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
