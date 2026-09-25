# CG Planner Harness

Harness ID: `cg_planner`

Version: 1.0.0

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

輸出 canonical CG manifest，不輸出自由格式 prompt。每個 entry 必須 self-contained，至少包含：

- stable `entry_id` / `scene_id` / `beat_range` / `cg_class`；
- narrative purpose、`must_show`、`must_not_imply`；
- visible character constraints and exact reference bindings；
- `Visual Continuity State`：screen side、body orientation、gaze、wardrobe、held object、camera axis/side、shot size、location、lighting、time/weather；
- framing/composition/focus/safe zone；
- hard `include` / `exclude` constraints；
- base/edit reference transport；
- output identity and acceptance checks。

Renderer 不得再讀 scene 或 project policy，所以任何 execution-critical constraint 缺失都必須在 planning 階段 `BLOCKED`。

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
