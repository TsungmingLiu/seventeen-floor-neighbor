# CG Planner Harness

Harness ID: `cg_planner`

Version: 1.2.0

## Responsibility

把一個 locked scene 的 semantic visual beats 轉成 canonical、render-ready `CG Manifest` entries。這是 narrative 與 renderer 的唯一邊界。

Planner 決定「哪個 beat 值得一張圖、如何呈現、如何連貫」，但不得改寫 dialogue、choice、state 或 relationship progression。

## Allowed inputs

- one locked scene + approved Narrative Continuity Contract；
- global visual contract；
- only the visible characters' identity/reference records；
- allowed environment facts/references；
- immediate Visual Continuity State when relevant；
- accepted asset IDs needed for edit/continuity provenance。

不得讀 archive/experiment、unrelated heroine、historical prompt pack。

## Required output

輸出符合 `.ai/schemas/CG_MANIFEST.md` 與 `.ai/schemas/cg-manifest.schema.json` 的 Canonical CG Manifest，不輸出自由格式 prompt。每個 entry 必須 self-contained，至少包含：

- stable `entry_id` / `scene_id` / `beat_range` / `cg_class`；
- narrative purpose、`must_show`、`must_not_imply`；
- visible character constraints and exact reference bindings；
- `Visual Continuity State`：screen side、body orientation、gaze、wardrobe、held object、camera axis/side、shot size、location、lighting、time/weather；
- framing/composition/focus/safe zone；
- hard `include` / `exclude` constraints；
- base/edit reference transport；
- output identity and acceptance checks。

Reference selection uses `content/assets/character-reference-packs.json` and `npm run cg:references -- --character <visible_id> --wardrobe <exact_key> [--expression] [--body]`. Include the returned `reference_requirements`, `reference_bindings`, and `attachments` in the entry. Select only the visible character's face, production consistency, and relevant A/B wardrobe; add acting/body sheets when the shot requires them. An omitted production sheet needs an explicit reason. Never attach every sheet indiscriminately. Validate before review; renderer adapters cannot repair missing bindings after approval.

Renderer 不得再讀 scene 或 project policy，所以任何 execution-critical constraint 缺失都必須在 planning 階段 `BLOCKED`。

### Self-contained native/quality requirements

Project the full prospective requirements into fields already included in deterministic packets, not a pointer to global visual prose:

- `render_constraints.include[]`: prefer largest supported native 16:9 output and highest available quality with integer-pixel rounding; respect approved aspect/reference/edit constraints; use exposed supported size/quality controls when compatible, otherwise record `not exposed`; no fixed 1672×941/1920×1080 floor, invented API arguments, universal provider-cap claim or manual upscale labeled native/high-definition. Requested settings do not guarantee returned dimensions.
- `composition.framing_notes[]`, `composition.focus` and `composition.dialogue_safe_zone`: explicit task-approved desktop, mobile landscape and portrait display profiles, including CSS viewport width/height, orientation, DPR, expected display area/fit/crop, critical regions and UI occlusion tolerance. Use approved task/runtime values; unresolved profile information is `BLOCKED`, not a fabricated universal default.
- `acceptance[]` (the existing acceptance-check strings): actual returned width/height/MIME and untouched original bytes/byte count/SHA-256; native-size clarity/artifact inspection; separately hash-bound runtime derivative compression and actual runtime display/crop/focus/UI QA at those profiles. Spell out `VQA-NATIVE-PROVENANCE`, `VQA-SOURCE-CLARITY`, `VQA-COMPRESSION-ARTIFACTS`, `VQA-DESKTOP-DISPLAY` and `VQA-MOBILE-PORTRAIT-DISPLAY` with their required evidence; raw-image defects route to renderer/planner as appropriate, derivative compression/runtime crop defects to integrator. Absent required evidence means `BLOCKED`/`NEEDS_REVIEW`, evidenced quality failure means `FAIL`/`NEEDS_REVIEW`, with no automatic redraw/retry or final PASS/4K/retina claim.

Do not add schema fields or rewrite accepted manifests for this policy revision. For future tasks, Task Packet `constraints.locked`/`acceptance` and its exact source acquisitions must retain these requirements and distinguish source review from the later independent final derivative/display gate. Renderer receives the complete approved entry, not planner memory. Missing execution-critical fields block manifest usability/render dispatch.

## Shot economy

- normal scene 約 3–6 distinct render deliverables；
- important scene 約 6–10，必須有 narrative justification；
- small but meaningful expression/gaze change 使用 `reaction_cg` edit；
- wording/stat/branch ID 不同但 visual state 相同時 reuse；
- sequence 只在 same scene/characters/wardrobe/environment/consecutive action 下成立。

## Never

- write a render prompt；
- generate/select an image；
- copy historical prompt wording；
- compress an unresolved narrative ambiguity into visual prose；
- choose an easier image by changing the story。

完成後先由 `content_qa` 檢查 manifest usability，再交給 deterministic projection / `cg_renderer`。

## Explicit Scene Embodiment POC opt-in

Use schema `1.1.0` only when the bounded Task Packet explicitly requests this engineering capability; `1.0.0` remains the compatibility path. Author the exact `scene_embodiment` contract in `.ai/schemas/CG_MANIFEST.md` from approved scene facts: captured instant, per-visible-character before/during/after action, environment-anchored dialogue or active event interaction, physical support/contact/weight/material response and depth planes/separation. No inferred scene rewrite or generic posing substitutes for authored evidence. Unsupported reaction/sequence/close-up/inheritance/exception work is `BLOCKED`, not silently downgraded. Obtain independent manifest-usability review; neither schema validity nor these fields authorize pixels/adoption/general rollout.
