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

execution_policy:
  model_tier: economical | capable
  routing_reason: default_bounded | creative_judgment | material_ambiguity_or_conflict | cross_scene_or_cross_system_reasoning | final_high_impact_qa | validation_escalation
  attempt: 1
  correction_of: optional prior task attempt id
  escalation_from: optional prior task attempt id

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
      canonical_source: exact repository path or asset identity
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
- `execution_policy.model_tier` 是 adapter-independent tier，不綁 exact model name。預設 `economical`；只有 orchestration contract 明列的 capable 條件才可使用 `capable`。Task importance、source count、output length 不得單獨成為升級理由。
- `routing_reason: default_bounded` 只能搭配 `economical`。`validation_escalation` 只用於 cheaper attempt + 最多一次 focused corrective redispatch 仍未通過 validation 之後；每次重派都增加 `attempt` 並明確填 `correction_of` 或 `escalation_from`。
- Worker 不得自行切換 tier 或自行 retry。CG generation 的既有 no-automatic-retry 規則優先；model routing 不構成自動重畫授權。
- `run_id`、`task_id`、`depends_on` 對應 Production Run Ledger；只有 dependencies `PASS` 且 input versions verified 才 dispatch。One Task Packet = one bounded fresh worker task；reuse harness 不等於 reuse worker context。
- `allowed_sources` 是完整 allowlist；worker 不可自行加來源。
- Production Task Packet 不得 allowlist archive/experiment。
- Markdown acquisition 要有 exact repo/ref/path + non-empty contents + blob SHA when available。
- Image acquisition 要有 exact role/filename/MIME/repository path/SHA-256 + visible pixels；metadata-only 不成立。
- `cg_renderer` packet 必須只指定 one independent manifest entry、its deterministic packet and references；只有 manifest 明列並符合 sequence 條件的 linked sequence 可作一個 bounded task。
- Base CG 使用 `references_required`；Reaction CG 優先 `edit_from_accepted_base`。Reference acquisition 由所選 execution adapter 從 repository-relative catalog binding 負責。
- 第二個獨立 objective 必須拆成另一個 Task Packet。
