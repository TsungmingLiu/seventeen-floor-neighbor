# Visual Continuity State

Version: 1.0.0

`Visual Continuity State` 是每個 CG Manifest Entry 的必填狀態，不是自由 notes。

## Character fields

每個 visible character 都必須保存：

- `screen_side`：`left | center | right | offscreen`；
- `body_orientation`：例如 `three_quarter_left`、`profile_right`；
- `gaze`：target + direction/read；
- `wardrobe_key`：stable canonical key；
- `held_objects[]`：stable object IDs/semantic names，無物件時使用 empty array；
- `pose` / `expression`：當前可見狀態；
- `reference_bindings[]`：exact identity/wardrobe/other refs。

## Camera fields

- `axis_id`：scene-local stable axis identifier；
- `camera_side`：camera 位於 axis 哪側，禁止 reaction variant 無意跨軸；
- `shot_size`：`extreme_wide | wide | medium_wide | medium | medium_close | close | extreme_close`；
- `angle`：eye/high/low/overhead 等；
- `pov`：`objective | protagonist | character:<id>`；
- `lens_intent`：natural perspective / compression / depth intent。

## Environment fields

- `location_id`；
- `lighting`；
- `time_of_day`；
- `weather`；
- `persistent_props[]`；
- optional exact environment `reference_binding`。

## Link fields

- `previous_entry_id`：需要 immediate continuity 時必填，否則 `null`；
- `locked_fields[]`：JSON Pointer list，reaction/sequence 必須明列；
- `allowed_changes[]`：只有 edit entry 可非空；未列欄位視為 locked。

## Continuity rule

Planner 改變 axis、screen side、wardrobe、held object、location、time/weather 或 lighting continuity 時，必須在 entry 的 narrative/composition 中有可 review 的理由；Renderer 不得自行修正或「讓畫面更好看」而改變。
