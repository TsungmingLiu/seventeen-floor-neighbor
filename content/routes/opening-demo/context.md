# Opening Demo route context

Status: production demo route.

Canonical order:
1. COM-00 — 雨夜搬家
2. COM-01X — 電梯重啟
3. COM-01J — 地下街初遇

This package integrates the locked Vertical Slice scripts without changing their creative meaning. It intentionally uses the demo-minimal accepted CG set and no legacy character sprites.

State notes:
- `met_xu_tang`, name/neighbor knowledge, `xu_shared_building_tip`, `met_jiang_yucheng`, and `heard_station_cafe_from_jyc` are flat numeric 0/1 state values because the current engine's conditional state model is numeric.
- `jyc_first_topic` is a single numeric enum: 1 = worldbuilding, 2 = visual_design, 3 = edition_value.
- Scene outcome state is attached to the scene's mandatory local choice because the current runtime supports choice effects but not node-entry effects. No downstream node in this demo observes those values before the scene exits.
- `opening_demo_complete` is demo scaffolding only. It is not a relationship ending.

Known art issue:
- COM01J base/reaction retain the demo-approved provisional wardrobe drift recorded during ingest.
