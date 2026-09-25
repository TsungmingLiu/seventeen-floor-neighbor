# Task Packet Schema

Version: 1.1.0

Task Packet routes exactly one active harness/pass and one deliverable。

```yaml
run_id: unique-production-run-id
task_id: unique-stable-id
task_type: narrative_design | scene_dialogue | narrative_review | cg_plan | cg_render | visual_review | integrate
depends_on: [upstream-task-id]
workflow_version: 1.1.0
harness: content_writer | cg_planner | cg_renderer | content_qa | integrator
pass: narrative_design | scene_dialogue | narrative_review | visual_review | null
objective: one sentence describing exactly one deliverable

source_binding:
  github:
    repository_full_name: owner/repo
    repository_url: https://github.com/owner/repo
    ref: main

required_acquisition:
  markdown:
    - path: exact/canonical/path.md
      expected_nonempty: true
  images:
    - role: primary_face_identity
      expected_filename: exact-file.png
      canonical_source: exact asset/Drive identity
      pixels_must_be_visible: true

allowed_sources:
  - exact canonical source
forbidden_source_roots:
  - .ai/archive/
  - .ai/experiments/
  - docs/archive/

inputs:
  narrative_contract: optional
  locked_scene: optional
  cg_manifest: optional
  cg_entry_id: optional
  render_packet: optional
  references: []
  accepted_outputs: []
input_versions:
  - id: canonical-artifact-id
    version: immutable hash / Git blob SHA / accepted asset receipt
    location: exact path or source ID

reference_transport:
  mode: references_required | edit_from_accepted_base | not_applicable
  fresh_session_required: true
  no_unrelated_images_allowed: true
  accepted_base_asset_id: optional

constraints:
  locked: []
  must_not_change: []
  output_format: exact contract

deliverables:
  - id: stable-id
    destination: exact path or handoff target

acceptance:
  - machine-checkable or reviewable criterion

handoff_to: active harness or human gate
human_gate: none | major_story_direction | canonical_character_design | accepted_master_image_selection | final_playable_acceptance
```

## Rules

- Routing metadata 不複製 whole canon。
- `run_id`、`task_id`、`depends_on` 對應 Production Run Ledger；只有 dependencies `PASS` 且 input versions verified 才 dispatch。One Task Packet = one bounded fresh worker task；reuse harness 不等於 reuse worker context。
- `allowed_sources` 是完整 allowlist；worker 不可自行加來源。
- Production Task Packet 不得 allowlist archive/experiment。
- Markdown acquisition 要有 exact repo/ref/path + non-empty contents + blob SHA when available。
- Image acquisition 要有 exact role/identity + visible pixels；metadata-only 不成立。
- `cg_renderer` packet 必須只指定 one independent manifest entry、its deterministic packet and references；只有 manifest 明列並符合 sequence 條件的 linked sequence 可作一個 bounded task。
- Base CG 使用 `references_required`；Reaction CG 優先 `edit_from_accepted_base`。Reference acquisition 由所選 execution adapter 負責。
- 第二個獨立 objective 必須拆成另一個 Task Packet。
