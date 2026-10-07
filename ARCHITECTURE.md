# 程式與內容架構

> CANONICAL runtime / content / asset / build contract。更新：2026-09-27。
>
> 本文件記錄已實作、修改程式時須維持的邊界。當前 milestone 見 `ROADMAP.md`；待辦見 `TODO.md`；內容生產的 authority 見 `.ai/WORKFLOW_MANIFEST.yaml` 與 `docs/CONTENT_PRODUCTION_SOURCE_MAP.md`。實際欄位以 code、JSON 與 validator 為準。

## 1. 目前的系統

遊戲是 browser-native JavaScript 的靜態站點，沒有 backend 或 database。`content/routes/index.json` 目前只註冊 `opening-demo`。舊 `xu-tang` 原型 route 及其專用資產已退役；角色分支由故事節點處理，標題不提供平行 route selector。

| 層 | 來源 | 職責 |
| --- | --- | --- |
| UI shell | `public/index.html`、`public/styles.css` | 標題、遊戲、Memories、CG Gallery |
| Runtime | `src/` | 播放、visuals、progress、Memories、branch graph helper |
| Route registry / packages | `content/routes/index.json`、`content/routes/<id>/` | default route、story/scene files、asset allowlist、Memory Events |
| Route data | `content/routes/opening-demo/` | 現行 Chapter 1 playable route |
| Character metadata | `content/characters/` | 已登記角色的設計／依賴資料 |
| Production values | `content/production/` | Narrative Continuity Contract、Canonical CG Manifest |
| Asset metadata | `content/assets/manifest.json`、`source-map.json`、`source-catalog.json`、`content/recipes/assets.json` | logical ID、runtime provider、master provenance、recipe/dependency |
| Binary source | `assets-src/` | repo-backed source references and accepted runtime objects |
| Build / QA | `tools/`、`tests/`、`.github/workflows/` | asset check/build、content validation、preview、acceptance |
| Output | `dist/`、`generated/` | 可重建，不能當 source of truth |

## 2. Story、route 與 visual 邊界

- Route 的 `storyFiles` / `sceneFiles` 在 build 時合併；每個 route 只能使用其 `assetIds` 列出的 logical assets。進入 runtime/save contract 的 node ID 與 logical asset ID 要穩定；換 physical filename/provider 不應改 story JSON。
- `src/engine.js` 播放節點、choices、random scene return 與 ending；`src/visuals.js` 解析 logical asset、顯示畫面並提供載入失敗 fallback；`src/app.js` 載入 package。
- 每個 node 的 visual mode 只能是 `composite`（背景與可選 sprites）、`cg`（完整圖片）或 `cinematic`（MP4 primary、WebM fallback、poster）。CG/cinematic 不能混入 composite sprites。`allowPreviewArt: true` 的 chapter 可明確引用 `previewOnly` background 作劇情審閱佔位圖，不能當成已驗收 CG；新 production art 依 `docs/art/PRODUCTION_VISUAL_DIRECTION.md` 採 CG-first / 16:9。
- `src/branches.js` 保留 graph helper 供 debug/validation，不是玩家的 route UI。

Choice metadata is opt-in on a choice node through `choiceType: "expression" | "action"`. Tagged options require stable lowercase `id` values and `consequenceClass: "local" | "echo" | "structural"`; expression options also require one each of `stance: "warm" | "candid" | "playful"` and exactly three options. Action options have no fixed count or stance. These fields are authoring and validation metadata: the runtime does not use them as scores, route authority, or player-facing labels. Untagged legacy choices retain their existing contract.
- 修改局部 route 可先用 `npm run context -- --route <id> --node <id>` 取得相關 nodes、assets、角色與 recipe。角色設計變更可用 `npm run assets:plan -- <character-id>` 查依賴。

## 3. Player UI / Memories / save（已實作 W4 contract）

標題使用一個主要 Start/Continue 按鈕及 Memories、CG 入口。沒有 player-facing save slots 或獨立 route selector；標題背景依已探索的 frontier Memory metadata 選擇，不由 speaker 推測，cinematic 只用 poster、不 autoplay。遊戲畫面讓 scene/CG 保持主體：desktop 對話和 choices 分開，mobile 堆疊；safe zone 不可遮擋臉、手部劇情動作或關鍵物件。CG Gallery 是收藏與 viewer，不承擔故事導覽。

`content/routes/<id>/memories.json` 明確定義 `sections[]` 與 `events[]`。一個 Memory Event 是玩家可辨識的敘事單元，可覆蓋多個 engine nodes；它包含 stable `id`、`order`、`progressRank`、`replayNode`、`unlockNodes`、`kind`、`characterIds`、`cover`、`galleryAssets` 等欄位。新增或修改 event 時，以相鄰 JSON 實例和 `tools/validate-content.mjs` 為實際欄位契約：

- `replayNode` 必須存在並有可恢復 snapshot；`unlockNodes` 決定 event 何時解鎖。
- `progressRank` 表示敘事進度，不是 node count、DOM index 或最近播放時間。跨分支的 rank 由內容作者協調。
- `cover.mode = character` 用角色 event 的淡化、face-focused CG；`scene` 用環境／共通事件。封面由 content metadata 指定，不由 speaker 推測。Cinematic cover 使用 poster，背景圖可作 scene cover。
- 未探索 event 隱藏標題與分支細節；Memories 是單頁縱向 timeline，可 inline 表示分岔，不能洩漏未走路徑。封面 lazy-load，手機不得出現 page-level horizontal scroll。
- Memories 以 authored section disclosure 顯示可探索事件；目前 frontier 所在章節預設展開，角色 focus 不隱藏其他已探索角色的探索數摘要。回到目前進度會清除 filter、展開 frontier 章節、聚焦 exact frontier Memory 並只捲動 map 容器；cursor 閱讀位置在與 frontier 不同時以獨立標記顯示。這些瀏覽操作不改 gameplay cursor/frontier/snapshot。Timeline filter 與標記以 Memory Events 為單位，而非 engine nodes。背景圖直接復用 runtime asset、用 focus/overlay 保持文字可讀；不得把 speaker 名稱作角色封面分類依據。
- CG Gallery 顯示已解鎖圖與影片 poster、未解鎖 placeholder；viewer 支援圖片 contain、影片播放、方向鍵／觸控切換。Gallery 不管理 replay 或 route graph。

`src/progress.js` 使用 `localStorage` 的 `<chapter-id>:journey:v2`：

- `cursor` 是目前這輪的 node-entry snapshot，可因 replay/新一輪改變；`frontier` 是歷史最深的正式敘事進度。Continue 通常從 frontier 恢復，重播較早 event 不讓 frontier 倒退。
- Replay 從 event 的 snapshot 恢復 stats、flags、return stack，可探索新選擇；只有進入更高 `progressRank` 的 Memory Event 才推進 frontier。同 rank 的其他分支可解鎖，但不覆蓋既有 frontier。
- 抵達 terminal ending 後主按鈕顯示 Start；明確開始新一輪後，Continue 使用該輪 cursor，歷史 frontier 仍保留。
- v1 save migration 保留可用的 checkpoint、CG/ending unlock；無效或已刪除 node 的 snapshot 有安全 fallback。修改 progress、node IDs 或 Memory mapping 時，必須加/更新 migration regression tests。
- `[PLAYER_NAME]` 使用玩家首次進入故事時輸入的名字，統一驗證後存於 v2 journey 的 `playerDisplayName`；Continue 與 Memory replay 共用同一值。舊 save 缺名字時先顯示輸入視窗，取消不改進度。未知 token 保留原樣，不靜默刪除。
- Opening COM-02X 新增的 `T_XT`、`K_XT`、`xt_advice_tendency` 可在舊 snapshot 缺值時補 initialState default；既有必填 stat 缺值或任何已提供的新 stat 非有限數字仍拒絕，不改 node ID。
- Save 是本機便利功能，不是永久資料保證。未來非 terminal 的 relationship ending / After Story 需由 content 和 runtime contract 明確實作；不得從既有 demo terminal ending 推斷已支援。

## 4. Asset storage 與 build

`content/assets/manifest.json` 讓 story 只引用 logical ID。`source-map.json` 將每個 runtime path 映射到 Git 追蹤的 `assets-src/` 檔案；新入庫檔案另記錄 bytes 與 SHA-256。`content/recipes/assets.json` 記錄依賴與重建資訊。已驗收的 WebP 保留原位元組，已驗收的 PNG/JPG 透過 `tools/asset-ingest.mjs` 以固定參數轉檔，更新既有 manifest、source map 及 receipt；build 只複製 repo 內檔案。`source-catalog.json` 以 source ID 對應的 repository-relative `sourcePath` 綁定 generation references 與 accepted masters，供 renderer adapter 解析；catalog 不參與 runtime build。Generation reference PNG/JPEG 保持原格式，runtime accepted CG/background objects 使用 WebP。

`npm run assets:check` 驗證本地 runtime 來源、已釘選的 bytes/hash、尺寸/比例與媒體 full decode；active generation source catalog 另由 production validation 核對 repo 原圖。`npm run assets:build` 只複製 repo 檔案到 generated output；`npm run build` clean rebuild `dist/`，包含 UI、JS、route packages 與 runtime assets。缺少 runtime object 時應阻擋 build，不得用舊 sprite 或暫存圖悄悄替代。唯一共用的 `bg.narrative_preview.placeholder` 是 manifest/source map 明示、hash 釘選的 preview-only WebP，不是 remote fallback，也不進 CG Gallery。`dist/`、`generated/` 可丟棄。

Cloudflare Pages 只接收 Verify 在 fresh GitHub runner 上通過檢查後保存的 `dist/`；`main` 對應 production，repo 內 PR 對應 `pr-<number>` preview branch alias。Pages 不是內容或 build source of truth。靜態站點的相對 URL 以根目錄為 base，使 SPA fallback 的深層路徑重新整理後仍能載入 JS、route JSON 與素材。帳號設定及操作見 `docs/CLOUDFLARE_DEPLOYMENT.md`。

舊 `xu-tang` route 專用的 sprite、日期 CG、背景與影片均已移除。Opening 的 CG、背景和 preview-only WebP 仍依既有 manifest/source map 驗證；角色 PNG/JPEG 仍是 production references。引擎的通用 composite 與 cinematic 能力保留，不宣稱舊影片仍可玩。

## 5. Content production 與 runtime integration

Narrative Design → Scene/Dialogue → Visual Production 的規則在 `docs/narrative/CONTENT_PRODUCTION_SPEC.md`。Approved narrative values 位於 `content/production/narrative/`，render-ready CG values 位於 `content/production/cg-manifests/`。Planner 將 locked scene 的 visual beat 轉為 Canonical CG Manifest；`tools/render-cg-packets.mjs` 依固定欄位順序投影同一份 render prompt；execution adapters 只改 repository-file reference acquisition 和 transport envelope。

Renderer 只讀一個 CG entry、其 packet、declared references；Visual QA 後才選 Accepted Asset。Integrator 把 accepted outputs 接入 route asset allowlist、manifest、recipe、Memory Events、節點與 ingest receipt；不能改 narrative beat 以方便生圖。`npm run production:validate` 會查 Opening Chapter 1 contracts、scene/asset bindings 與 source boundary。

Narrative QA 通過後，Integrator 可先接 `narrative_preview`：用已登記背景或 preview-only WebP 與 `composite` node visual 讓對白、選項、狀態及保存可試玩。章節封面/結尾只在明示 `allowPreviewArt` 時接受該 background；Gallery 不登記它。後續正式 CG 接入仍使用穩定 node/asset IDs，完成前執行 `npm run validate:final`，其會拒絕仍允許 preview art 的 route。

資產 coverage 與 playable acceptance 分開判斷。`npm run assets:coverage` 由目前 registry、runtime bindings 與精確採用 receipts 重建機器可讀報告，區分 `placeholder`、`provisional`、`accepted` 與無法核對的 `unverified`；catalog 的 production status 本身不是採用證據。報告分開列出登記、route allowlist 與實際 title／ending／node／Memory 引用，未使用的 preview placeholder 不計入實際 coverage 缺口。既有 COM01J provisional wardrobe drift 與 COM02X accepted-as-is／QA FAIL 記錄保持。

`npm run validate:release` 在既有 final 結構／production validation 後執行嚴格 coverage 檢查，拒絕 runtime 中的 placeholder、provisional、未核對採用或已記錄的 known issues。這是 release coverage 的必要檢查；通過只表示 coverage clear，不會建立獨立 Visual QA PASS、release-ready 決定或 Human playable acceptance。沒有正式 release 決定的資產仍顯示 readiness 未記錄。M0 只要求這些狀態可辨識並受到檢查，不要求本輪重畫所有已知 provisional 圖。

對已有 accepted runtime 圖的 scene，整合前執行 `npm run production:integration:check -- --scene <id> --from <已核對的整合基線 commit> --to <commit|WORKTREE>`。每次重新取得來源、核對 accepted master／runtime derivative／reference bytes 與 receipt，再用既有 impact logic 判斷；影響 `integration:<scene>` 時以非零 exit code 拒絕整合。JSON 位於 ignored `generated/session-cache/integration-check/<scene>/check.json`；來源失敗時移除前次報告。`NO_STALE_DIFF` 只表示指定版本之間未發現 stale 差異，不能代替 QA／Human acceptance，也不能把任意 `HEAD` 當成已驗收基線。這是必須由 Integrator 在 wiring/build 前執行的定點檢查，普通 `npm run build` 不自動選擇 production baseline；不實作多 task DAG 或自動重審。COM-02X 的當前受控驗證見 `docs/migration/M0_CURRENT_SCENE_STALE_GATE.md`。

## 6. 開發、驗證與未來變更

Canonical engineering environment 是 GitHub Codespaces（Node 22、ffmpeg/ffprobe、port 4173）。`npm run dev` watch/rebuild；`npm run preview` clean build 後 serve；`npm run preview:smoke -- --skip-build` 驗 HTTP/Range 等 preview contract。`npm run codespace:accept` 建立並刪除一次性 Codespace 作 fresh engineering acceptance；`codespace:review` 提供短暫 browser review surface。Local clone 可作 fallback，但不替代 fresh acceptance。

每次 code/content integration 至少跑 `npm run build`、`npm run validate`、`git diff --check`；runtime/save 修改加跑 `npm test`。CI Verify 與 Browser Acceptance 提供 clean build、media、preview 與玩家主流程檢查。當前命令以 `package.json` 為準，下一步與 hard gates 見 `TODO.md`。

未來 W5 需證明 GitHub commit、accepted master、runtime objects 與 fresh Codespace rebuild 的 cloud-complete 一致性。W6 的 `sfw` / `full` profile 必須在 build 時真正 prune 不適用的 nodes/assets，並拒絕 dangling targets；不能只隱藏 UI。W7 的 review/release 要綁定明確 commit/profile，產生可重現的驗證紀錄。這些是待做 contract，不能寫成現有功能。

## C1 首次 outing 的有限 completion／replay

XT-04／JYC-05 只接穩定 `OPEN-A-ENTRY-PENDING-X/J`，原確認訊息不重送。依 [M1 pending／slot contract](docs/narrative/M1_PENDING_SLOT_RUNTIME_CONTRACT.md) 保留 pending outcome；actual completion 同次寫入 `open_a_window1_completed:xt04|jyc05`、`open_a_window1_consumed` 與 entry-effect marker。guard 檢查當地 contact／COM-02J／COM-03J 前事、互斥 slot identity；不以 discovery 補 contact。正常行程協商與共同書頁、當地玩笑、擅排 unresolved 分支分開；JYC 代答支獨立 exit，reward／completion 不清除 unresolved。沒有第二 slot／scheduler 或尚未製作的 continuation。

現有 Memory replay 可在更高 rank 推進 frontier／改 checkpoints，因此本批在同一 v2 envelope 增加 bounded `c1Replay`（returnCursor／returnRestartActive／returnRunComplete／returnReplayActive）。保護兩幕及從 live C1 重玩 OPEN-A／COM03M 前事期間的 main frontier、canonical checkpoints、edges 與 mode；累積合法 seen／Memory unlocks 維持原機制。所有實際 terminal（含自身生活／無聯絡出口）回復原 cursor/mode 並清除 context；invalid C1 entry 先回復、仍拋出原 BLOCKED error。中途 reload 保留 context，已落在 terminal 的舊殘留 context 在 load 回復；舊缺欄位 saves 默認 null。無新 schema version、通用 replay／scheduler subsystem、wardrobe runtime state 或 art change。唯一 registered preview background；公開 preview／Human／CG acceptance 仍待 gates。
