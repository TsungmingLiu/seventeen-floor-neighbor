# Canonical CG Manifest

Version: 1.1.0

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

### Prospective native-size and quality semantics

Use existing fields; do not add JSON schema/transport fields or rewrite accepted entries:

- `render_constraints.include[]` states prefer largest supported native 16:9 output and highest available quality, integer-pixel rounding, approved aspect/reference/edit compatibility, exposed supported size/quality controls or explicit `not exposed`, no fixed 1672×941/1920×1080 floor, no invented arguments/universal tool cap and no upscale represented as native/high-definition. Actual dimensions must be verified, not inferred from preference.
- `composition.framing_notes[]`, `focus` and `dialogue_safe_zone` state approved target desktop, mobile landscape and portrait CSS viewport width/height, orientation, DPR, image display area, fit/crop/focus, critical regions and UI occlusion constraints. Missing approved profile values block future planning; there are no universal viewport/DPR defaults.
- `acceptance[]` contains the acceptance checks: preserve untouched returned bytes/location, verify width/height/MIME/byte count/SHA-256, inspect native-size source clarity/artifacts, and separately inspect hash-bound runtime derivative compression plus actual render/crop/focus/UI evidence at all profiles. Spell out `VQA-NATIVE-PROVENANCE`, `VQA-SOURCE-CLARITY`, `VQA-COMPRESSION-ARTIFACTS`, `VQA-DESKTOP-DISPLAY` and `VQA-MOBILE-PORTRAIT-DISPLAY` and their evidence, with bounded routing: raw defects to renderer/planner; derivative/runtime defects to integrator. Missing required evidence is `BLOCKED`/`NEEDS_REVIEW`, evidenced quality failure is `FAIL`/`NEEDS_REVIEW`; no automatic redraw/retry, missing-evidence PASS or unverified 4K/retina claims. Final derivative/display QA requires an independent fresh review after integration if the evidence did not yet exist.

These strings already enter deterministic packets. They are not a new `acceptance_checks` field, generated-packet edit or permission for renderer to read global prose. Future Task Packets retain the requirements in existing `constraints.locked`/`acceptance` and hash-bound acquisitions. Manifest-usability review blocks incomplete projection before execution; this documentation revision does not add machine enforcement or invalidate historical acceptance by itself.

`reference_transport.attachments[]` 列出 image-generation call 必須得到的精確 image inputs，並不指定由誰上傳。`chat_manual` 由 Human 提供；`work_batch` 依 source ID 從 repo source catalog 指向的檔案取得。兩者均須做 hash、完整解碼、pixel/role preflight；缺件則 `BLOCKED`。

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

## Character reference selection

`characters[].reference_requirements` optionally records boolean `production_consistency`, `expression`, and `body_proportions`; all three keys are required when the object is present. A false production flag requires `production_omission_reason`. New base entries without the object default to face + production consistency + relevant wardrobe. Full-body/long-shot camera values require body proportions. Use `content/assets/character-reference-packs.json` and `tools/character-references.mjs` to select exact source IDs/filenames; validation checks the character, role, wardrobe A/B and exact required subset before any adapter can project the entry. Accepted entries retain historical bindings; edit tasks acquire accepted base plus explicitly declared supplementary images.
