# 程式與內容架構

> CANONICAL runtime / content / asset / build contract。更新：2026-09-25。
>
> 本文件記錄已實作、修改程式時須維持的邊界。當前進度見 `PROJECT_STATE.md`；待辦見 `TODO.md`；內容生產的 authority 見 `.ai/WORKFLOW_MANIFEST.yaml` 與 `docs/CONTENT_PRODUCTION_SOURCE_MAP.md`。實際欄位以 code、JSON 與 validator 為準。

## 1. 目前的系統

遊戲是 browser-native JavaScript 的靜態站點，沒有 backend 或 database。`content/routes/index.json` 指定唯一可玩的 default route，目前為 `opening-demo`。`xu-tang` 保留作舊內容、save 與引擎 regression fixture；角色分支由故事節點處理，標題不提供平行 route selector。

| 層 | 來源 | 職責 |
| --- | --- | --- |
| UI shell | `public/index.html`、`public/styles.css` | 標題、遊戲、Memories、CG Gallery |
| Runtime | `src/` | 播放、visuals、progress、Memories、branch graph helper |
| Route registry / packages | `content/routes/index.json`、`content/routes/<id>/` | default route、story/scene files、asset allowlist、Memory Events |
| Route data | `content/routes/opening-demo/`、`content/routes/xu-tang/` | 現行 Chapter 1；舊長篇 regression fixture（含 date pool） |
| Character metadata | `content/characters/` | 已登記角色的設計／依賴資料 |
| Production values | `content/production/` | Narrative Continuity Contract、Canonical CG Manifest |
| Asset metadata | `content/assets/manifest.json`、`source-map.json`、`source-catalog.json`、`content/recipes/assets.json` | logical ID、runtime provider、master provenance、recipe/dependency |
| Binary source | `assets-src/` | repo-backed source references and accepted runtime objects |
| Build / QA | `tools/`、`tests/`、`.github/workflows/` | asset check/build、content validation、preview、acceptance |
| Output | `dist/`、`generated/` | 可重建，不能當 source of truth |

## 2. Story、route 與 visual 邊界

- Route 的 `storyFiles` / `sceneFiles` 在 build 時合併；每個 route 只能使用其 `assetIds` 列出的 logical assets。進入 runtime/save contract 的 node ID 與 logical asset ID 要穩定；換 physical filename/provider 不應改 story JSON。
- `src/engine.js` 播放節點、choices、random scene return 與 ending；`src/visuals.js` 解析 logical asset、顯示畫面並提供載入失敗 fallback；`src/app.js` 載入 package。
- 每個 node 的 visual mode 只能是 `composite`（背景與可選 sprites）、`cg`（完整圖片）或 `cinematic`（MP4 primary、WebM fallback、poster）。CG/cinematic 不能混入 composite sprites。保留 composite 與舊 sprites 以支援現有 fixture；新 production art 依 `docs/art/PRODUCTION_VISUAL_DIRECTION.md` 採 CG-first / 16:9。
- `src/branches.js` 保留 graph helper 供 debug/validation，不是玩家的 route UI。
- 修改局部 route 可先用 `npm run context -- --route <id> --node <id>` 取得相關 nodes、assets、角色與 recipe。角色設計變更可用 `npm run assets:plan -- <character-id>` 查依賴。

## 3. Player UI / Memories / save（已實作 W4 contract）

標題使用一個主要 Start/Continue 按鈕及 Memories、CG 入口。沒有 player-facing save slots 或獨立 route selector；標題背景依已探索的 frontier Memory metadata 選擇，不由 speaker 推測，cinematic 只用 poster、不 autoplay。遊戲畫面讓 scene/CG 保持主體：desktop 對話和 choices 分開，mobile 堆疊；safe zone 不可遮擋臉、手部劇情動作或關鍵物件。CG Gallery 是收藏與 viewer，不承擔故事導覽。

`content/routes/<id>/memories.json` 明確定義 `sections[]` 與 `events[]`。一個 Memory Event 是玩家可辨識的敘事單元，可覆蓋多個 engine nodes；它包含 stable `id`、`order`、`progressRank`、`replayNode`、`unlockNodes`、`kind`、`characterIds`、`cover`、`galleryAssets` 等欄位。新增或修改 event 時，以相鄰 JSON 實例和 `tools/validate-content.mjs` 為實際欄位契約：

- `replayNode` 必須存在並有可恢復 snapshot；`unlockNodes` 決定 event 何時解鎖。
- `progressRank` 表示敘事進度，不是 node count、DOM index 或最近播放時間。跨分支的 rank 由內容作者協調。
- `cover.mode = character` 用角色 event 的淡化、face-focused CG；`scene` 用環境／共通事件。封面由 content metadata 指定，不由 speaker 推測。Cinematic cover 使用 poster，背景圖可作 scene cover。
- 未探索 event 隱藏標題與分支細節；Memories 是單頁縱向 timeline，可 inline 表示分岔，不能洩漏未走路徑。封面 lazy-load，手機不得出現 page-level horizontal scroll。
- Timeline 的 filter、回到目前進度及 cursor/frontier 標記以 Memory Events 為單位，而非 engine nodes。背景圖直接復用 runtime asset、用 focus/overlay 保持文字可讀；不得把 speaker 名稱作角色封面分類依據。
- CG Gallery 顯示已解鎖圖與影片 poster、未解鎖 placeholder；viewer 支援圖片 contain、影片播放、方向鍵／觸控切換。Gallery 不管理 replay 或 route graph。

`src/progress.js` 使用 `localStorage` 的 `<chapter-id>:journey:v2`：

- `cursor` 是目前這輪的 node-entry snapshot，可因 replay/新一輪改變；`frontier` 是歷史最深的正式敘事進度。Continue 通常從 frontier 恢復，重播較早 event 不讓 frontier 倒退。
- Replay 從 event 的 snapshot 恢復 stats、flags、return stack，可探索新選擇；只有進入更高 `progressRank` 的 Memory Event 才推進 frontier。同 rank 的其他分支可解鎖，但不覆蓋既有 frontier。
- 抵達 terminal ending 後主按鈕顯示 Start；明確開始新一輪後，Continue 使用該輪 cursor，歷史 frontier 仍保留。
- v1 save migration 保留可用的 checkpoint、CG/ending unlock；無效或已刪除 node 的 snapshot 有安全 fallback。修改 progress、node IDs 或 Memory mapping 時，必須加/更新 migration regression tests。
- Save 是本機便利功能，不是永久資料保證。未來非 terminal 的 relationship ending / After Story 需由 content 和 runtime contract 明確實作；不得從既有 demo terminal ending 推斷已支援。

## 4. Asset storage 與 build

`content/assets/manifest.json` 讓 story 只引用 logical ID。`source-map.json` 將每個 runtime path 映射到 Git 追蹤的 `assets-src/` 檔案；新入庫檔案另記錄 bytes 與 SHA-256。`content/recipes/assets.json` 記錄依賴與重建資訊。已驗收的 WebP 保留原位元組，已驗收的 PNG/JPG 透過 `tools/asset-ingest.mjs` 以固定參數轉檔，更新既有 manifest、source map 及 receipt；build 只複製 repo 內檔案。`source-catalog.json` 以 source ID 對應的 repository-relative `sourcePath` 綁定 generation references 與 accepted masters，供 renderer adapter 解析；catalog 不參與 runtime build。Generation reference PNG/JPEG 保持原格式，runtime accepted CG/background objects 使用 WebP。

`npm run assets:check` 驗證本地 runtime 來源、已釘選的 bytes/hash、尺寸/比例與媒體 full decode；catalog 中尚未遷移的私有 master 是歷史 metadata attestation，這一步不會重新下載或解碼它們。`npm run assets:build` 只複製 repo 檔案到 generated output；`npm run build` clean rebuild `dist/`，包含 UI、JS、route packages 與 runtime assets。缺少 runtime object 時應阻擋 build，不得用舊 sprite 或暫存圖悄悄替代。`dist/`、`generated/` 可丟棄。

本 repo 本地 `runtime-public/sprites/` 的十張舊候選圖未被 manifest、source-map、route 或 build 讀取，已退出 source tree。仍在使用的 `assets-src/characters/` 與舊路線影片仍作回歸 fixture，不能僅因非預設路線就刪除。

## 5. Content production 與 runtime integration

Narrative Design → Scene/Dialogue → Visual Production 的規則在 `docs/narrative/CONTENT_PRODUCTION_SPEC.md`。Approved narrative values 位於 `content/production/narrative/`，render-ready CG values 位於 `content/production/cg-manifests/`。Planner 將 locked scene 的 visual beat 轉為 Canonical CG Manifest；`tools/render-cg-packets.mjs` 依固定欄位順序投影同一份 render prompt；execution adapters 只改 repository-file reference acquisition 和 transport envelope。

Renderer 只讀一個 CG entry、其 packet、declared references；Visual QA 後才選 Accepted Asset。Integrator 把 accepted outputs 接入 route asset allowlist、manifest、recipe、Memory Events、節點與 ingest receipt；不能改 narrative beat 以方便生圖。`npm run production:validate` 會查 Opening Chapter 1 contracts、scene/asset bindings 與 source boundary。

## 6. 開發、驗證與未來變更

Canonical engineering environment 是 GitHub Codespaces（Node 22、ffmpeg/ffprobe、port 4173）。`npm run dev` watch/rebuild；`npm run preview` clean build 後 serve；`npm run preview:smoke -- --skip-build` 驗 HTTP/Range 等 preview contract。`npm run codespace:accept` 建立並刪除一次性 Codespace 作 fresh engineering acceptance；`codespace:review` 提供短暫 browser review surface。Local clone 可作 fallback，但不替代 fresh acceptance。

每次 code/content integration 至少跑 `npm run build`、`npm run validate`、`git diff --check`；runtime/save 修改加跑 `npm test`。CI Verify 與 Browser Acceptance 提供 clean build、media、preview 與玩家主流程檢查。當前命令以 `package.json` 為準，下一步與 hard gates 見 `TODO.md`。

未來 W5 需證明 GitHub commit、accepted master、runtime objects 與 fresh Codespace rebuild 的 cloud-complete 一致性。W6 的 `sfw` / `full` profile 必須在 build 時真正 prune 不適用的 nodes/assets，並拒絕 dangling targets；不能只隱藏 UI。W7 的 review/release 要綁定明確 commit/profile，產生可重現的驗證紀錄。這些是待做 contract，不能寫成現有功能。
