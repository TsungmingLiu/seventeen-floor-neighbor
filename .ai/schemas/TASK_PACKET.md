# Task Packet Schema

Version: 1.3.0

Task Packet routes exactly one active harness/pass and one deliverable。

```yaml
run_id: unique-production-run-id
task_id: unique-stable-id
scene_id: one explicit scene when task is scene-scoped
task_type: narrative_design | scene_dialogue | narrative_review | cg_plan | cg_render | visual_review | integrate
depends_on: [upstream-task-id]
workflow_version: 1.3.0
harness: content_writer | cg_planner | cg_renderer | content_qa | integrator
pass: narrative_design | scene_dialogue | narrative_review | visual_review | null
integration_mode: narrative_preview | final  # required only for integrator
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
      git_blob_sha: exact committed Git blob SHA
      excerpts: [] # optional [{label, start_line, end_line, sha256}], 1-based inclusive lines
  images:
    - role: primary_face_identity
      source_id: exact existing source-catalog ID
      path: exact repository path
      filename: exact-file.png
      mime_type: image/png
      sha256: SHA-256 of source bytes
      git_blob_sha: committed Git blob SHA
      width: 1055
      height: 1491
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
human_gate: none | major_story_direction | canonical_character_design | accepted_master_image_selection | narrative_preview_review | final_playable_acceptance
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
- `narrative_review` 的既有 scene 可由 `npm run context -- --task narrative_review --scene <id> --run-id <id> --task-id <id> --ref <ledger.source_ref>` 產生 JSON Task Packet。明列 scene、contract 與該 scene 的 narrative canon 範圍及 Git blob/excerpt hashes；`--verify-packet <path>` 在派工前 fail closed，並執行既有 runtime/content 與 production machine validators。`--ref` 固定已記錄的 source commit，使空 cache 的全新 checkout 可重建完全相同的 packet bytes。來源從 Locked Scene / Narrative Contract 的既有 binding 解析，不另建 registry。Packet 留在 gitignored session cache；Ledger 持久化 generator 與 packet SHA-256，不持久化 cache path。這僅準備獨立 QA task，不偽造上游 PASS 或 Human approval；後續任務仍須 Ledger 與 gate 審核。
- `cg_plan` 目前限 `COM-00`，使用同一個 `context.mjs`：明列 current PASS 的外部 Narrative QA run/task 與所選 `--reference-ids`。這些 IDs 是 Coordinator 的明確輸入；不可從既有 CG manifest 反推。工具核對已提交的上游 ledger/decision receipt、目前 Locked Scene、選定的 source-catalog rows、repo 圖片 bytes/完整解碼及背景的 asset manifest row；只把契約、Locked Scene、全域視覺規格、許棠 reference pack 節錄、CG schema 和選定圖片列入 worker allowlist。上游在另一個 run，記在 `inputs.accepted_outputs`，`depends_on` 保持本 run 內 task IDs 的語意；不得偽造跨 run 依賴。這個 packet 是待審的 planning proposal，並非新 CG manifest、CG QA、人類決策或 production run。現階段 source ref 必須是目前 HEAD；跨其他 commit 後重建時，先按選定來源的 hash 與上游 QA 核對並重新派發，不將 repo ref 變更直接等同重畫已接受 CG。
- Image acquisition 要有 exact role/filename/MIME/repository path/SHA-256 + visible pixels；metadata-only 不成立。
- `cg_renderer` packet 必須只指定 one independent manifest entry、its deterministic packet and references；只有 manifest 明列並符合 sequence 條件的 linked sequence 可作一個 bounded task。
- Base CG 使用 `references_required`；Reaction CG 優先 `edit_from_accepted_base`。Reference acquisition 由所選 execution adapter 從 repository-relative catalog binding 負責。
- 第二個獨立 objective 必須拆成另一個 Task Packet。
- `integration_mode: narrative_preview` 只依賴 approved Locked Scene 與已核對 repo bytes 的 background/preview-only WebP；Task Packet 必須列明 logical ID、route allowlist、預覽狀態與 review ref。`integration_mode: final` 要求所有必要 accepted CG 與 `npm run validate:final`，不得以 preview-only asset 滿足視覺驗收。
