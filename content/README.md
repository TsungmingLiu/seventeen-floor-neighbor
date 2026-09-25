# Content data boundary

> CANONICAL directory map。這裡只描述資料身份；工作流程與 policy 以 `.ai/WORKFLOW_MANIFEST.yaml`、`docs/CONTENT_PRODUCTION_SOURCE_MAP.md` 為準。

| Path | Identity | 用途 |
| --- | --- | --- |
| `routes/index.json` | runtime registry | `opening-demo` 是 default playable；`xu-tang` 是仍註冊的 legacy regression route。只有列在此索引的 package 會進 build。 |
| `routes/opening-demo/` | current playable integration | Opening Chapter 1 節點、route config、Memories；creative source 仍是 locked scene 與 approved contracts。 |
| `production/narrative/` | CANONICAL production values | 少量 semantic state 與跨場連續性；不存 dialogue prose。 |
| `production/cg-manifests/` | CANONICAL production values | render-ready CG entries；Render Packet 由工具重建，不手改回寫。 |
| `routes/xu-tang/` | LEGACY-FIXTURE | 舊 123-node 長篇、OL 臨時支線、date pool、Memories；保留 stable IDs 供 runtime/save/測試。不是新劇情或 CG 的起點。 |
| `characters/` | runtime dependency metadata | 已登記角色設計版本與 asset dependency；角色故事方向以 narrative canon 為準。 |
| `assets/`、`recipes/` | runtime/provenance metadata | manifest、source-map、source-catalog、ingest receipt、recipe。`source-map` 仍包含 preservation-only 來源；其存在不代表該圖可供新 production 使用。 |

未註冊且缺少當前 asset binding 的早期林澄短篇，已移至 `docs/archive/content/lin-cheng/`，明確標為 **NOT A PRODUCTION SOURCE OF TRUTH**。不要為新場景直接複製舊 route JSON、sprite-heavy visual 或 trust-score 範式。

新增 scene 的路徑是 Narrative Design → locked scene/dialogue → approved CG manifest → asset acceptance → `routes/opening-demo/` 或後繼可玩 package。具體 schema 與檢查指令見 `docs/narrative/CONTENT_PRODUCTION_SPEC.md`、`.ai/schemas/`、`tools/validate-production-contracts.mjs`。
