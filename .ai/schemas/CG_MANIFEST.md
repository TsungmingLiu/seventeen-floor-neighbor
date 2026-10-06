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
- `acceptance[]` contains the acceptance checks: preserve untouched returned bytes/location, verify width/height/MIME/canonical path/ref, inspect native-size source clarity/artifacts, and separately inspect path/ref-bound runtime derivative compression plus actual render/crop/focus/UI evidence at all profiles. Spell out `VQA-NATIVE-PROVENANCE`, `VQA-SOURCE-CLARITY`, `VQA-COMPRESSION-ARTIFACTS`, `VQA-DESKTOP-DISPLAY` and `VQA-MOBILE-PORTRAIT-DISPLAY` and their evidence, with bounded routing: raw defects to renderer/planner; derivative/runtime defects to integrator. Missing required evidence is `BLOCKED`/`NEEDS_REVIEW`, evidenced quality failure is `FAIL`/`NEEDS_REVIEW`; no automatic redraw/retry, missing-evidence PASS or unverified 4K/retina claims. Final derivative/display QA requires an independent fresh review after integration if the evidence did not yet exist.

These strings already enter deterministic packets. They are not a new `acceptance_checks` field, generated-packet edit or permission for renderer to read global prose. Future Task Packets retain the requirements in existing `constraints.locked`/`acceptance` and type-aware acquisitions. Manifest-usability review blocks incomplete projection before execution; this documentation revision does not add machine enforcement or invalidate historical acceptance by itself.

`reference_transport.attachments[]` 列出 image-generation call 必須得到的精確 image inputs，並不指定由誰上傳。`chat_manual` 由 Human 提供；`work_batch` 依 source ID 從 repo source catalog 指向的檔案取得。兩者均須做 path/ref、完整解碼、pixel/role preflight；缺件則 `BLOCKED`。

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

## Opt-in Scene Embodiment technical POC (schema `1.1.0`)

`1.0.0` remains the production compatibility contract and rejects `scene_embodiment`; accepted entries, assets, receipts and their projection hashes remain unchanged. Selecting `1.1.0` explicitly opts a manifest into this bounded engineering capability. It is not a new dispatch default or an artistic approval. General rollout still requires microwave and sidewalk pixel evidence, independent QA and Human direction.

Every `1.1.0` entry requires the exact `scene_embodiment` object:

- `captured_moment`: non-empty `before`, `during`, `after` describe the selected instant and its immediate temporal context, not three rendered frames.
- `characters[]`: exactly one object for each visible `character_id`, no duplicate or undeclared IDs. Each has `action_flow` (`before`, `during`, `after`), `environment_coupling` (`mode`, `anchor`, `interaction`), and `physical_cues` (`support`, `contact`, `weight`, `material_response`). All text must be authored and non-empty. Coupling mode is `anchored` or `active_interaction`; ordinary dialogue must describe observable environment-anchored evidence, and event CG requires at least one active interaction. Names/text alone cannot prove semantic sufficiency.
- `depth_staging`: non-empty `foreground`, `midground`, `background`, `subject_separation` identify the authored spatial staging. An intentionally empty plane is described explicitly rather than omitted.

Supported classes are independent `background_cg`, `dialogue_cg`, `event_cg` with extreme-wide/wide/medium-wide/medium framing. Background has zero character embodiment records. Reaction, sequence keyframes, linked sequences, previous-entry inheritance, accepted-base edits, medium-close/close/extreme-close framing and additional exception fields fail closed in this POC. A future resolved inheritance/exception contract and independent validation are required to expand support; no fallback to legacy or generic pose prose.

The machine schema owns conditional shape/class/version rules; the existing repository validator additionally checks exact visible-character coverage and nonblank text. Existing narrative, identity, reference, wardrobe, composition and native/display-quality requirements remain mandatory. The projection adds one fixed Scene Embodiment section containing canonical key-sorted JSON verbatim; no summarization or adapter-specific defaults. POC render-spec hashes include schema version; legacy hashing stays byte-identical. A change in one entry changes its render spec/prompt and the manifest hash, not unrelated entry render specs. Changing manifest version still changes its projected identity text as in legacy behavior.

Manifest usability must separately report `MUA-CAPTURED-MOMENT`, `MUA-ACTION-FLOW`, `MUA-ENVIRONMENT-COUPLING`, `MUA-PHYSICAL-CUES`, `MUA-DEPTH-STAGING`. Candidate pixel review uses corresponding `VQA-` codes and records inspected candidate paths/refs/regions; a machine-valid or complete manifest is not a pixel PASS or Human preference/adoption. Missing pixels means `BLOCKED`/`NEEDS_REVIEW` for pixel checks. No new ledger status, schema registry or approval record is created by this POC.

## Opt-in exact-look wardrobe contract

Writer receives only task-local semantic `wardrobe_key`, existing `look` and alias options from `cg:references -- --character <id> --options`; no image paths, source IDs, pixels, provider/prompt metadata or inferred relationship gates. Writer owns the selected story key. Planner carries and validates it without changing it for backend/composition. New character bindings may explicitly set `wardrobe_reference_mode: exact_look`; absent mode preserves existing accepted/legacy contracts. `cg:references -- --character <id> --wardrobe <key> --exact-look --shot <shot_size>` uses full for extreme_wide/wide/medium_wide and upper for medium; existing unsupported shots remain unsupported. Missing/wrong key, character, variant, provenance or active reference rejects without legacy fallback. Face/production/expression/body and accepted-base policies remain applicable.
