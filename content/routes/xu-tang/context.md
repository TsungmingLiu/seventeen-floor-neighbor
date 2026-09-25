# 許棠舊路線 Context

> LEGACY-FIXTURE。這是仍被 route index 註冊的 runtime/save regression package，不是新 content production 的 narrative authority。

完整主線。玩家住 1703，許棠住 1702。核心語氣是都市日常、克制曖昧與帶刺的幽默。

## 不可破壞的連續性

- 許棠關心別人時會說成「順便」或「住戶義務」，被看穿後通常先反擊。
- `heart` 表示浪漫好感，`trust` 表示坦率與信任，`chaos` 表示喜劇傾向，`comfort` 表示相處安全感。
- `relationship >= 1` 永遠優先進入正式交往結局。
- `cinematic.ch04.first_kiss` 前後服裝、時間與 1702 室內光線必須連續。

## 路由提示

- 劇情來源：`content/routes/xu-tang/chapter-01.json`
- 約會池：`content/routes/xu-tang/date-pool.json`
- 角色設定：`content/characters/xu_tang.json`
- 針對單一節點工作時，先執行 `npm run context -- --route xu-tang --node <node-id>`。
