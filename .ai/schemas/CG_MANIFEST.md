# Canonical CG Manifest

Version: 1.0.0

Machine schema：`.ai/schemas/cg-manifest.schema.json`。

## Root

- `schema_version`：contract version。
- `manifest_id` / `manifest_version`：stable identity + revision。
- `lifecycle`：must be `CANONICAL`。
- `source_scene_ids[]`：covered locked scenes。
- `style_contract`：manifest-contained rendering target/negative style/aspect/output count。
- `entries[]`：render deliverables。

Root `style_contract` 是 CG spec 的一部分，讓 renderer 不需要讀 global art prose。

## Entry

Required groups：

- identity：`entry_id`、`scene_id`、`status`、`cg_class`、`beat_range`；
- linked sequence exception：non-null `sequence_id` 需有 `sequence_continuity_benefit`，同一 sequence 的 entries 必須同 scene、visible characters、wardrobe、environment，並以 `continuity.previous_entry_id` 表示 consecutive action；否則仍各自使用 fresh renderer task；
- optional `known_issues[]`：只記錄 accepted migration asset 的已知偏差；不是新的 design intent；
- story boundary：`narrative.purpose`、`must_show[]`、`must_not_imply[]`；
- visible people：`characters[]` + exact `reference_bindings[]`；
- environment：location/reference/time/weather/lighting/props；
- camera：shot size/axis/camera side/angle/POV/lens；
- continuity：previous/locked/allowed changes；
- composition：focus/safe zone/framing notes；
- hard constraints：ordered `include[]` / `exclude[]`；
- transport：`references_required` / `edit_from_accepted_base` / `none`，以及完整的 reference bindings；
- output and acceptance。

`background_cg` may have an empty `characters[]`; other classes require visible character constraints at planning/validation time。

`reference_transport.attachments[]` 列出 image-generation call 必須得到的精確 image inputs，並不指定由誰上傳。`chat_manual` 由 Human 提供；`work_batch` 依 source ID 從授權 connected source 取得。兩者均須做 pixel/role preflight。

## Status

- `planned`：not executable；
- `render_ready`：complete and approved for projection；
- `candidate`：rendered, not accepted；
- `accepted`：Human/QA accepted；
- `rejected`：do not reuse；
- `blocked`：input conflict/missing dependency。

Projection normally selects `render_ready`; migration validation may project `accepted` entries to prove reproducibility without regenerating them。

## Authority

- Canonical manifest may be edited only by CG Planner + review。
- Render Packet and adapter envelopes are `GENERATED` and must never be hand-edited into authority。
- Candidate image does not change manifest facts。
- Accepted asset receipt records outcome/provenance, not new creative instructions。
