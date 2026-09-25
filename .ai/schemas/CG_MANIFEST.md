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
- story boundary：`narrative.purpose`、`must_show[]`、`must_not_imply[]`；
- visible people：`characters[]` + exact `reference_bindings[]`；
- environment：location/reference/time/weather/lighting/props；
- camera：shot size/axis/camera side/angle/POV/lens；
- continuity：previous/locked/allowed changes；
- composition：focus/safe zone/framing notes；
- hard constraints：ordered `include[]` / `exclude[]`；
- transport：Human Attachment Gate / Accepted Base / attachments；
- output and acceptance。

`background_cg` may have an empty `characters[]`; other classes require visible character constraints at planning/validation time。

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
