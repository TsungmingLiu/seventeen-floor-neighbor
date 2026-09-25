# Task Packet Schema

Version: 1.0.0

Task Packet routes exactly one active harness/pass and one deliverable。

```yaml
task_id: unique-stable-id
task_type: narrative_design | scene_dialogue | narrative_review | cg_plan | cg_render | visual_review | integrate
workflow_version: 1.0.0
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

reference_transport:
  mode: human_attachment_required | edit_from_accepted_base | not_applicable
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
```

## Rules

- Routing metadata 不複製 whole canon。
- `allowed_sources` 是完整 allowlist；worker 不可自行加來源。
- Production Task Packet 不得 allowlist archive/experiment。
- Markdown acquisition 要有 exact repo/ref/path + non-empty contents + blob SHA when available。
- Image acquisition 要有 exact role/identity + visible pixels；metadata-only 不成立。
- `cg_renderer` packet 必須只指定 one manifest entry、its deterministic packet and references。
- Base CG 使用 `human_attachment_required`；Reaction CG 優先 `edit_from_accepted_base`。
- 第二個獨立 objective 必須拆成另一個 Task Packet。
