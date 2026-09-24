# IMPLEMENTATION.md

> Current prototype implementation notes.
>
> This file documents how the repository works **today**. It is not the target architecture. For architectural decisions and migration direction, follow `ARCHITECTURE.zh-TW.md` (canonical) and `ARCHITECTURE.md` (English mirror).

# 模組化內容架構

遊戲現在分成七層，替換角色或增加角色時不必改動引擎或建置工具。

| 層 | 位置 | 職責 |
| --- | --- | --- |
| 角色設定 | `content/characters/` | 身分特徵、造型版本、服裝、妝容與表情 |
| 素材清單 | `content/assets/manifest.json` | 邏輯素材 ID 對應實際圖檔與角色版本 |
| 生成配方 | `content/recipes/assets.json` | 每張立繪、背景、CG 與動態回憶的提示詞及依賴 |
| 路線包 | `content/routes/` | 路線登錄、介面文字、story／scene 檔案、素材白名單與局部 context |
| 場景模板 | `content/scenes/` | 可由不同角色複用的地點、互動節拍與隨機場景池 |
| 劇情資料 | `content/chapters/` | 節點、台詞、選項、數值與畫面模式 |
| 遊戲引擎 | `src/` | 通用播放、分支、結局、圖片與影片渲染 |

## 路線載入

`content/routes/index.json` 指定唯一可玩的預設故事。每個 `route.json` 可以引用多個 `storyFiles` 與 `sceneFiles`；建置時會合併、驗證並輸出至 `dist/content/routes/<route-id>/`。角色分支是同一節點圖內的選擇；主界面及網址不再提供平行路線切換。預設包保留 `chapter-01` 的舊收藏／結局鍵。

針對單一節點工作時，使用 `npm run context -- --route <route-id> --node <node-id>` 取得前後節點、引用素材、生成配方與角色設定，避免新對話重讀整條路線。

## 畫面規則

- `src/visuals.js` 負責邏輯素材解析、共用立繪顯示及載入失敗回退；標題與遊戲共用同一個節點畫面定義。
- `src/progress.js` 保存 journey v2 node-entry snapshot、cursor、最深 frontier 的 Memory Event/rank、節點快照、數值、旗標、返回堆疊與已走連線，並遷移 journey v1。
- `src/memories.js` 以內容定義的 Memory Event 顯示一頁式回憶時間線，處理場景／角色封面、解鎖、篩選與標題背景。`src/branches.js` 保留工程用 graph helper，不再是玩家入口。
- `src/engine.js` 協調播放／存檔／收藏；`src/app.js` 只負責載入。
- 建置為 JS 模組匯入、HTML 入口和樣式加上內容雜湊，內容 JSON 重新驗證快取，避免更新後載入新介面卻沿用舊程式。HTML 本身仍應由主機設定為重新驗證快取。

一般 Continue 會回到 frontier 節點開頭，不保存打字到第幾個字或影片時間。抵達結局後，主按鈕改為「開始遊戲」；玩家明確從此按鈕開始新一輪後，Continue 恢復該輪 cursor，歷史 frontier 仍不倒退。Memories replay 改變 cursor 與當輪數值／旗標；只有進入更高 rank 的 Memory Event 才推進 frontier。節點快照以最後一次走到該節點的狀態為準，並非多存檔槽。CG／結局收藏跨重玩保留；journey v1 的有效 checkpoint 會遷移，無有效快照的玩家由起點開始。

圖片檔名只存在 manifest。換圖保留邏輯 ID 並更新版本、配方、尺寸和焦點；程式與節點不用跟著換檔名。`dist/assets/unavailable.svg` 是介面內建的錯誤替代畫面，不是可收藏的劇情素材。回退只保障執行不中斷，不代表壞圖已修復。

每個劇情節點只能使用一種模式：

- `composite`：一張背景，可加零至多張透明立繪。
- `cg`：只顯示一張完整 CG，引擎會自動清空所有立繪。
- `cinematic`：播放 MP4／WebM 動態回憶，使用海報圖作載入與低動態回退，並自動清空立繪。

建置驗證會拒絕 CG／cinematic 與立繪同時出現，避免完整畫面再次重疊。

## 動態回憶

`cinematic` 資產在 manifest 中保存 `cinematicVersion`、`poster`、`sources.mp4`、可選的 `sources.webm`、`duration` 與收藏資料；可重建關鍵幀放在 `content/cinematics/`。播放器優先選 MP4，WebM 作 fallback。引擎播放時暫時隱藏對話框，提供跳過按鈕，結束後隱藏影片、露出 poster 並顯示本節文字；收藏檢視器可再次播放。首段 `cinematic.ch04.first_kiss` 使用四張身份鎖定的第一視角近距離關鍵幀，依序呈現對視、撩髮、閉眼與微嘟嘴靠近；先以動作補償插值至 48fps，再重定時為 24fps／10 秒，以兼顧動作連續與臉部一致性。

## 約會場景池

`content/scenes/date-pool.json` 保存與角色分離的約會模板。章節使用 `type: "random"` 抽取未出現的場景，場景末端以 `type: "return"` 回到主線；目前每輪從三個場景中抽兩個且不重複。新增角色時可複用地點與節拍，但應提供該角色自己的台詞、服裝、髮型與CG。

## 角色身份與鏡頭一致性

- 原始人設圖是最高優先級身份來源；`source.xu_tang.identity_v2`（記錄於 `content/assets/source-catalog.json`，binary 位於 Google Drive `source-private`）是多角度臉部錨點。
- 新圖不得只沿用上一張CG作身份參考，避免多代漂移。
- 每個CG recipe 必須宣告 `headPose`，分別控制頭部俯仰、轉向、視線落點與頸部姿態。
- 同批CG應輪換低頭、平視側面、收下巴回望及只用眼神上看等姿態，不可反覆仰頭直視鏡頭。

## 更新角色

1. 更新角色 JSON，並提高 `designVersion`；服裝或妝容改版則提高各自的 `version`。
2. 執行素材影響清單，列出該角色涉及的全部立繪與 CG。
3. 依生成配方批次重生列出的素材。
4. 更新 manifest 與 recipe 的版本依賴，再執行建置。

背景等不依賴角色的素材不會被重生。新增角色時，只需增加角色 JSON、其素材與生成配方，再在劇情節點引用新的邏輯素材 ID。


## W1 source/output boundary

The canonical migration now treats `dist/` as fully disposable.

Current source boundaries after W1:

- static shell source: `public/index.html`, `public/styles.css`;
- binary preservation source: `assets-src/`;
- runtime-path mapping: `content/assets/source-map.json`;
- JS source: `src/`;
- content source: `content/`;
- generated/runtime output: `dist/`.

`npm run build` removes and recreates `dist/`, copies static shell files from `public/`, copies mapped binary assets from `assets-src/`, then emits route packages and JS modules.

The W1 binary copies are preservation copies of the old runtime blobs. W2 is responsible for decode/dimension checks and true runtime optimization/conversion.


## W2 media validation and Drive asset provider

- `npm run assets:check` 使用 ffprobe + full ffmpeg decode，並驗證尺寸、比例、duration/container、bytes 與 SHA-256。
- `npm run assets:build` 支援 local source 與 `gdrive-public` runtime object。
- Google Drive `source-private` 保存 canonical accepted masters；`content/assets/source-catalog.json` 保存 file ID、hash、尺寸等 provenance。
- Google Drive `runtime-public` 保存 optimized WebP/MP4；CI/Codespaces 可以匿名抓取。
- `dist/assets/` 是 ignored/generated output。
- 三張 date CG 保持原 logical asset ID，但 physical runtime path 改為 WebP。
- 新的大型 binary 不應透過 GitHub text/file write wrapper 寫入。
- Cinematic MP4/H.264 是 required primary source；WebM 是 optional legacy fallback。

## W3 — Codespaces Development / Preview implementation

2026-09-23 起，canonical development environment 改為 GitHub Codespaces；local clone 不再是 supported acceptance target。

目前實作：

- `.devcontainer/Dockerfile`：基於 Node 22 devcontainer image，安裝 ffmpeg/ffprobe。
- `.devcontainer/devcontainer.json`：自動 forward port 4173，label 為 `Game Preview`，建立後輸出 Node/ffmpeg/ffprobe 版本。
- `tools/preview-server.mjs`：dependency-free Node HTTP server。
  - `0.0.0.0:4173`；
  - MIME handling；
  - extensionless index fallback；
  - missing asset 404；
  - HEAD；
  - byte Range / HTTP 206，供 MP4/WebM browser playback/seek；
  - `Cache-Control: no-store` 方便 dev refresh。
- `npm run dev`：先 build，serve 4173，監看 `public/`、`src/`、`content/`、`assets-src/` 並 debounce rebuild。
- `npm run preview`：production-like clean build 後 serve 4173，不 watch。
- `npm run preview:smoke`：HTTP contract smoke；CI 在既有 build 後以 `--skip-build` 執行。
- GitHub Actions Verify 使用 Node 22 + ffmpeg，並加入 Preview server smoke。

W3 現在另外提供 AI-operated lifecycle：

- `tools/codespace-accept.mjs` 透過 GitHub CLI create/list/view/SSH/ports/delete 編排一次性 Codespace。
- `npm run codespace:accept`：clean restore/build/validate/test、啟動 preview、private `gh codespace ports forward` smoke，成功自動刪除。
- `npm run codespace:review`：先完成相同工程 acceptance，再暫時把 4173 設 public、輸出 browser review URL；review 後刪除。
- failure 環境預設保留供 debug，但以 20m idle + 1h retention 限制成本。
- `.github/workflows/codespace-acceptance.yml` 提供 optional workflow_dispatch；需一次性 `CODESPACES_TOKEN`。
- `Verify` 會執行 lifecycle command `--dry-run`，避免 script syntax/plan drift。

Human 不再需要手動 create/rebuild Codespace 作為 W3 gate。W3 fresh Codespace run `35932727909` 與 Chromium run `35933586244` 已完成工程驗收；主觀 UI/視覺 review 仍可按需使用 `codespace:review`。

## W4 — Player UI / Memories / CG Gallery implementation

- `content/routes/xu-tang/memories.json` 是目前 fixture 的 Memory Section / Event source。每個 event 有 stable ID、replay anchor、unlock node mapping、rank、角色／共通歸屬、cover/focus 與 gallery association。Build/validator 會檢查 node 與 logical asset references。
- `src/progress.js` 使用 `chapter-01:journey:v2`；有效 v1 `current` 變 cursor，最深 mapped checkpoint 變 frontier。同 rank 時優先舊 current。舊 CG unlock、endings 與 completed keys 不清除。
- Memories replay 從保存的 node-entry snapshot 恢復 stats、flags 與 return stack。Replay 中同 rank、較低 rank，或同一 event 較早 node 不回退 frontier；只有更高 rank event 更新 frontier。一般 Title Continue 使用 frontier；結局後顯示 Start，明確開啟新一輪後的 Continue 使用該輪 cursor，同時保留歷史 frontier。
- `src/memories.js` 將多個 engine nodes 壓成單一玩家事件；未解鎖卡隱藏標題／分支細節。單女主使用淡化的事件 CG 和 face focus，共通事件使用 scene/background。封面 lazy-load，cinematic 使用 poster。
- `public/index.html`／`public/styles.css` 提供一大兩小 title、單頁 vertical timeline、桌面分離的對話／選項、mobile 約 44px touch targets，以及簡單 CG 收藏牆／全畫面檢視器。回憶篩選後「回到目前進度」會恢復全部並定位 frontier；CG viewer 支援按鈕、方向鍵與左右觸控切換。
- `src/branches.js` 僅保留 graph helper，不再暴露玩家層級 Branches。
- `npm test` 有 22 個 Node tests；W4 Chromium Browser Acceptance run `35948336719` 和 Verify run `35948336731` 通過，post-demo 修正另由 Browser Acceptance `35951991567` 與 Verify `35951991571` 驗證。新 production content 接入時仍需依 W4 spec 建立新 Memory Events 並檢查每張 CG 的 safe zone。
