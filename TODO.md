# TODO.md

> 專案執行清單（Execution Board）
>
> Canonical architecture：`ARCHITECTURE.zh-TW.md`
>
> Current implementation：`IMPLEMENTATION.md`
>
> Migration strategy：`MIGRATION_PLAN.md`
>
> 本檔案用來追蹤「下一步到底做什麼」。完成一項就更新 checkbox 與相關備註；不要只在聊天裡宣布完成。

---

# 0. 當前狀態

## 已完成

- [x] 將新的 canonical architecture 寫入 repo。
- [x] `ARCHITECTURE.zh-TW.md` 設為中文 canonical 主版本。
- [x] `ARCHITECTURE.md` 保留英文 mirror。
- [x] 舊版 implementation architecture 保存為 `IMPLEMENTATION.md`。
- [x] `AGENTS.md` 更新為新的 AI 接手順序。
- [x] 建立 `MIGRATION_PLAN.md`。
- [x] 目前 playable baseline：
  - 一個共用入口；
  - 許棠完整主線；
  - 辦公族 OL 暫用短分支；
  - title start/continue；
  - node resume；
  - branch history；
  - CG gallery；
  - cinematic；
  - context tooling；
  - runtime/save tests。

## 當前 hard truth

目前 repo **還沒有**完全符合 canonical architecture：

- source binaries 仍主要存在 `dist/assets/`；
- validator/build 仍把 `dist/` 視為 asset source 的一部分；
- 還沒有正式 `assets-src/ → generated/ → dist/` pipeline；
- 還沒有：
  - `npm run assets:check`
  - `npm run assets:build`
  - `npm run preview`
  - `npm run checkpoint`
  - `npm run assets:fetch`
  - `npm run release`
- 還沒有 private R2 source checkpoint；
- 還沒有 public R2 runtime publishing；
- 還沒有 SFW / Full compile-time pruning；
- 仍有大量 legacy node IDs 不是 semantic IDs；
- runtime 目前仍是 plain JavaScript，而不是 React/TypeScript/Vite。

## 本週架構決策

- [x] **本週不做 React/TypeScript/Vite migration。**
- [x] 先把現有 runtime 做成：
  - 可重建；
  - 可 checkpoint；
  - 可 remote restore；
  - 可 remote preview；
  - 可 release。
- [x] 不因新增女主而重寫 engine。
- [x] 不在確認 source copy 安全前刪除／移動 binary assets。

---

# 1. 今天 — 文件與執行基線

## 1.1 Canonical docs 入 repo

**Owner：AI**

- [x] 新增／更新 `ARCHITECTURE.zh-TW.md`
- [x] 保留 `ARCHITECTURE.md` 英文 mirror
- [x] 保存舊 implementation notes 至 `IMPLEMENTATION.md`
- [x] 更新 `AGENTS.md`
- [x] 新增 `MIGRATION_PLAN.md`
- [x] 新增本 `TODO.md`

### 驗收

- [x] 新對話能清楚分辨：
  - target architecture；
  - current implementation；
  - current project state；
  - migration steps；
  - daily execution checklist。

---

# 2. 本週 — Milestone：Cloud-capable Development Pipeline

> 目標：把 Local → Cloud Checkpoint → Remote Working → Preview → Release 真正跑通。
>
> 本週禁止把注意力分散到 3–4 女主、全面美術重做或 renderer 重寫。

---

## W1 — Source Asset Boundary ✅

### 目標

把現在「`dist/assets/` 同時兼 source + runtime」的 legacy 狀態拆開。

### AI 已完成

- [x] 建立 `assets-src/`
- [x] 建立 preservation source categories：
  - [x] `assets-src/characters/`
  - [x] `assets-src/backgrounds/`
  - [x] `assets-src/cg/`
  - [x] `assets-src/video/`
  - [x] `assets-src/ui/`
- [x] 建立／保留 disposable workspace：
  - [x] `generated/runtime-assets/`
  - [x] `generated/source-cache/`
- [x] 新增 `.gitignore`：
  - [x] 忽略 disposable generated/cache；
  - [x] 忽略 local secrets；
  - [x] 不誤忽略 version-controlled metadata。
- [x] 盤點目前 `dist/assets/` 共 36 個 binary。
- [x] 使用**原 Git blob SHA**把 36 個 binary byte-identical 複製至 `assets-src/`，沒有重新上傳或重編碼。
- [x] 新增 `content/assets/source-map.json`，把 runtime path 與 source path 分離。
- [x] 新增 `content/assets/ASSET_INVENTORY.md`，記錄 preservation 狀態與疑似截斷素材。
- [x] 把靜態 shell source 從 `dist/` 抽離：
  - [x] `public/index.html`
  - [x] `public/styles.css`
- [x] refactor validator：實體 binary validation 改看 `assets-src/` source mapping，不再要求 `dist/assets/` 是 source。
- [x] refactor build：
  - [x] 先完整刪除 `dist/`；
  - [x] 從 `public/` 重建 HTML/CSS；
  - [x] 從 `assets-src/` 重建 mapped binaries；
  - [x] 從 `src/` 重建 JS；
  - [x] 從 `content/` 重建 route package。
- [x] 清除 3 個已不再由現行 route index 生成的 stale `dist/content/routes/lin-cheng/*` generated files；source archive 不刪。
- [x] 保持所有 logical asset IDs 與 story references 不變。
- [x] 新增最小 GitHub Actions `Verify` workflow，讓 remote branch 可以自動跑 build/validate/tests/reproducibility。

### Human

- [x] W1 不需要 Human 操作。
- [ ] 疑似截斷素材的原圖恢復留到 W2／美術重製流程；若 GitHub source 已壞而本地有好檔，屆時需要 Human 提供本地完整檔。

### Hard gate

- [x] 沒有為了 migration 刪除任何唯一 binary source。
- [x] W1 source copy 使用既有 Git blob，不經 plugin binary upload。
- [x] 已知／疑似壞檔只被標記，不假裝已修復。

### CI 驗證

GitHub Actions run `35807627568`：

- [x] `npm run build`
- [x] `npm run validate`
- [x] `npm test`
- [x] `git diff --check`
- [x] clean build 後 `git diff --exit-code`

### 驗收

- [x] `rm -rf dist && npm run build` 的等價 clean-build 流程已由 CI 驗證。
- [x] `dist/` 已成為可重建 output。
- [x] static shell、binary preservation source、runtime output 邊界已分離。
- [x] W1 不改 story/engine behavior。

## W2 — Asset Check + Asset Build

### 目標

建立可自動驗證與生成 runtime asset 的 pipeline。

### AI 要做

- [ ] 新增 `npm run assets:check`
- [ ] 新增 `npm run assets:build`
- [ ] `assets:check` 驗證：
  - [ ] logical asset ID；
  - [ ] expected source path；
  - [ ] file exists；
  - [ ] file decode 完整；
  - [ ] width；
  - [ ] height；
  - [ ] aspect ratio；
  - [ ] expected format；
  - [ ] recipe exists；
  - [ ] version dependency；
  - [ ] duplicate output；
  - [ ] cinematic poster/source 完整性。
- [ ] `assets:build`：
  - [ ] PNG/JPEG master → WebP runtime；
  - [ ] 保留必要 transparency；
  - [ ] 產生 runtime filename；
  - [ ] 優先 immutable/content-hashed naming；
  - [ ] 產生／更新 runtime metadata。
- [ ] Video：
  - [ ] primary runtime target = H.264 MP4；
  - [ ] 驗證 resolution / duration；
  - [ ] 保留 poster；
  - [ ] legacy WebM 可暫留相容，但不作長期強制 requirement。
- [ ] missing/bad asset error 必須包含：
  - [ ] asset ID；
  - [ ] scene/recipe；
  - [ ] expected path；
  - [ ] expected size；
  - [ ] expected ratio；
  - [ ] 是否 blocking。

### Human 要做

- [ ] 如果某張圖需要重生，依 AI 給的 Generation Queue 重新生成／挑選。

### 驗收

- [ ] 所有 runtime image 可由 master 重建。
- [ ] bad/corrupt file 能被明確抓出。
- [ ] build error 對人可讀，不只是 stack trace。

---

## W3 — Unified Local / Codespaces Preview

### 目標

Local 和 Codespace 使用同一套 preview command。

### AI 要做

- [ ] 新增 `npm run preview`
- [ ] 新增／統一 `npm run dev`
- [ ] 選擇輕量 static/dev server，不要求先 migration React。
- [ ] 固定／記錄 preview port。
- [ ] 確認：
  - [ ] local machine 可開；
  - [ ] Codespace 可 forward；
  - [ ] static asset path 正常；
  - [ ] reload 不 404；
  - [ ] localStorage 行為正常。
- [ ] 在 README / AGENTS / TODO 記錄用法。

### Human 要做

- [ ] 在本地打開 preview。
- [ ] 快速走：
  - [ ] title；
  - [ ] start；
  - [ ] continue；
  - [ ] 許棠主線；
  - [ ] OL branch；
  - [ ] gallery；
  - [ ] branch view；
  - [ ] cinematic。

### 驗收

- [ ] Local：一個 command 起 preview。
- [ ] Codespace：同一個 command 產生 forwarded HTTPS URL。
- [ ] Work 能從 cloud browser 打開 forwarded URL。

---

## W4 — Cloudflare Private R2 Source Store

### 目標

建立 Cloud Checkpoint 的 master asset cloud storage。

### Human 要做

- [ ] 確認／建立 Cloudflare account。
- [ ] 建立 private R2 bucket。
- [ ] 建議名稱：
  - [ ] `seventeen-floor-source`
- [ ] 建立 least-privilege R2 credential。
- [ ] 準備 secret：
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
  - [ ] `R2_ACCESS_KEY_ID`
  - [ ] `R2_SECRET_ACCESS_KEY`
- [ ] 把 secret 放到：
  - [ ] 本地 `.env` 或 OS secret store；
  - [ ] GitHub Codespaces Secrets。
- [ ] **不要**把 secret value：
  - [ ] commit 到 GitHub；
  - [ ] 寫入 markdown；
  - [ ] 貼進 source code。

### AI 要做

- [ ] 決定 object key layout。
- [ ] 設計 checkpoint metadata schema。
- [ ] 設計 content hash / version mapping。
- [ ] 寫 R2 upload/download tooling。
- [ ] 使用環境變數讀 credentials。
- [ ] 不在 runtime browser 暴露 private credentials。

### 建議 object key

```text
source/
  <asset-id>/
    <hash-or-version>/
      master.png
      source.mp4
      ...
```

### 驗收

- [ ] private source object 可由 authorized tooling upload/download。
- [ ] anonymous public access 不可直接取得 private masters。
- [ ] credential 不存在 repo。

---

## W5 — `npm run checkpoint`

### 目標

把「目前 local working state」轉成「cloud-complete version」。

### AI 要做

- [ ] 新增 `npm run checkpoint`
- [ ] checkpoint 前自動執行：
  - [ ] content validation；
  - [ ] asset check；
  - [ ] build/test（依成本決定完整或必要 subset）。
- [ ] 找出：
  - [ ] referenced master assets；
  - [ ] 自上次 checkpoint 之後 changed assets；
  - [ ] 尚未上傳 private R2 的 assets。
- [ ] upload accepted master assets。
- [ ] 記錄：
  - [ ] Git commit；
  - [ ] content version；
  - [ ] asset logical ID；
  - [ ] source hash；
  - [ ] R2 object key；
  - [ ] size；
  - [ ] MIME/type；
  - [ ] checkpoint ID；
  - [ ] created time。
- [ ] 驗證所有 referenced master assets 都有 remote copy。
- [ ] 產生 checkpoint metadata。
- [ ] checkpoint metadata 要可 version-control，但不可包含 secret。

### Human 要做

- [ ] 在準備關 Mac、出門、交給 Work 接手之前執行 checkpoint。
- [ ] 如果 script 發現 local-only source，確認是否上傳。

### Cloud-complete 定義

只有同時具備：

```text
GitHub commit
+
所有 referenced master assets in private R2
```

才算 cloud-complete。

### 驗收

- [ ] checkpoint 完成後 Mac 可以關機。
- [ ] fresh environment 能知道要抓哪些 source assets。
- [ ] checkpoint 有明確 ID，可以追溯。

---

## W6 — `npm run assets:fetch` / Remote Restore

### 目標

讓全新 Codespace 不依賴本地 Mac 就能 build / preview。

### AI 要做

- [ ] 新增 `npm run assets:fetch`
- [ ] 根據 checkpoint metadata：
  - [ ] 找 source object；
  - [ ] download；
  - [ ] verify hash；
  - [ ] 放到 `generated/source-cache/` 或其他 ignored cache。
- [ ] 不 commit downloaded binaries。
- [ ] 確保 cache 可以完全刪掉重抓。
- [ ] fresh Codespace 測試：
  - [ ] `git pull`
  - [ ] `npm run assets:fetch`
  - [ ] `npm run assets:build`
  - [ ] `npm run build`
  - [ ] `npm run dev`

### Human 要做

- [ ] R2 / Codespaces Secrets 設定完成後，原則上不需介入。

### 驗收

- [ ] Local Mac 關機時，Codespace 可完整 rebuild。
- [ ] Work 可打開 forwarded preview。
- [ ] 刪除 Codespace 後，新 Codespace 仍可從 GitHub + R2 重建。

---

## W7 — SFW / Full Build Profiles

### 目標

讓 SFW build 在 compile/build 階段真正排除不該發布的 content/assets。

### AI 要做

- [ ] 定義 profile：
  - [ ] `sfw`
  - [ ] `full`
- [ ] schema/metadata 能標記內容 profile。
- [ ] compiler/build 根據 profile prune：
  - [ ] story nodes；
  - [ ] dialogue；
  - [ ] CG；
  - [ ] video；
  - [ ] route references；
  - [ ] manifest entries。
- [ ] 防止 dangling target。
- [ ] 防止被排除 asset 仍被打包。
- [ ] 新增 automated leakage test。

### Human 要做

- [ ] 對 AI 無法明確判斷的 scene 決定：
  - [ ] SFW；
  - [ ] Full；
  - [ ] 兩者都保留但素材不同。

### 驗收

- [ ] SFW output 不包含 excluded text。
- [ ] SFW output 不包含 excluded image/video binary。
- [ ] SFW route graph 完整可玩。
- [ ] Full build 不被 SFW pruning 破壞。

---

## W8 — ChatGPT Sites Review

### 目標

在正式 milestone 前，用 ChatGPT Sites 做 stage-level review。

### AI 要做

- [ ] 建立可 review 的 build。
- [ ] Publish 到 ChatGPT Sites。
- [ ] 記錄：
  - [ ] Git commit；
  - [ ] checkpoint ID；
  - [ ] build/profile；
  - [ ] publish time。
- [ ] 確認 Sites build 與 local/Codespace 同版本。

### Human 要做

完整 playtest：

- [ ] Title UI
- [ ] Start
- [ ] Continue
- [ ] Reload / resume
- [ ] Xu Tang main route
- [ ] Office OL branch
- [ ] Branch history
- [ ] CG gallery
- [ ] Cinematic
- [ ] Ending
- [ ] Return to title
- [ ] iPhone portrait
- [ ] Small-width layout
- [ ] Long dialogue
- [ ] Multiple choices
- [ ] Slow media loading / fallback

### Human feedback 格式不要求技術化

直接說：

- [ ] 「這句不像她」
- [ ] 「這裡太慢」
- [ ] 「這張圖不對」
- [ ] 「這個選項沒意思」
- [ ] 「這裡按了沒反應」
- [ ] 「手機上被遮住」

AI 負責判斷問題屬於：

- [ ] Content
- [ ] Asset
- [ ] Compiler
- [ ] Player
- [ ] Preview / Deployment

### 驗收

- [ ] 沒有 blocking bug。
- [ ] 沒有明顯 regression。
- [ ] build 可追溯到 commit + checkpoint。

---

## W9 — 本週 Migration Milestone

### AI 要做

- [ ] 執行：
  - [ ] `npm run build`
  - [ ] `npm run validate`
  - [ ] `npm test`
  - [ ] `git diff --check`
- [ ] 如新增新 command，補 package scripts。
- [ ] 更新：
  - [ ] `PROJECT_STATE.md`
  - [ ] `IMPLEMENTATION.md`
  - [ ] `README.md`
  - [ ] `TODO.md`
- [ ] commit verified milestone。
- [ ] push `main`。
- [ ] 視情況新增 tag / release note。

### Human 要做

- [ ] Sites review 通過後明確 approve milestone。

### Milestone 完成定義

從這個 milestone 開始，正式使用：

```text
Local Working
→ Cloud Checkpoint
→ Remote Working
→ Sites Review
→ Cloud Release
```

---

# 3. 這個月 — 3–4 女主 Scale Test

> 目的不是單純加內容，而是驗證架構真的能讓「新增角色 ≈ content production」，而不是每次都改 engine。

---

## M1 — 確定女主 roster

### 目標

總數達到 3–4 位女主。

### AI 要做

- [ ] 提出／整理每位角色：
  - [ ] character hook；
  - [ ] 年齡／職業；
  - [ ] personality；
  - [ ] speech style；
  - [ ] emotional tells；
  - [ ] visual hook；
  - [ ] relationship chemistry；
  - [ ] route role；
  - [ ] ending direction；
  - [ ] 與現有角色差異化。
- [ ] 檢查角色是否過度重疊。
- [ ] 建議每位 route 的核心 fantasy / emotional payoff。

### Human 要做

- [ ] 決定最後保留哪 3–4 位。
- [ ] 最終確認外型方向。
- [ ] 最終確認 personality / chemistry。

### 驗收

- [ ] 每位女主有明確差異。
- [ ] 不只是換皮。
- [ ] 每位都有清楚 route hook。

---

## M2 — Character Bible 標準化

### AI 要做

每位女主建立完整 Character Bible：

- [ ] stable character ID
- [ ] designVersion
- [ ] face identity
- [ ] body proportions
- [ ] hair invariants
- [ ] outfit modules
- [ ] hairstyle modules
- [ ] makeup modules
- [ ] accessories
- [ ] speech style
- [ ] behavioral tells
- [ ] emotional boundaries
- [ ] relationship arc
- [ ] route payoff
- [ ] generation constraints
- [ ] reference metadata

### Human 要做

- [ ] Review 每位 Character Bible。
- [ ] 在大量生圖前 approve。

### 驗收

- [ ] AI 可以僅依 Character Bible 產生一致的 story + asset specs。

---

## M3 — Identity References

### AI 要做

每位女主產生 Generation Spec：

- [ ] identity sheet prompt
- [ ] face close-up
- [ ] front full body
- [ ] side full body
- [ ] back full body
- [ ] 3/4 left/right
- [ ] neutral expression
- [ ] canonical outfit
- [ ] canonical lighting/background
- [ ] negative constraints
- [ ] expected dimensions
- [ ] expected filename/path

### Human 要做

- [ ] 在第三方 image generation service 生成。
- [ ] 每位角色挑選 canonical identity reference。
- [ ] 如需要，多次重生直到身份穩定。

### AI 要做（asset ready 後）

- [ ] ingest references。
- [ ] 更新 Character Bible metadata。
- [ ] 更新 asset recipes。
- [ ] checkpoint accepted references。

### 驗收

- [ ] 每位女主都有可重用的 identity anchor。
- [ ] 後續 CG 不需要依賴上一張 CG 當唯一 reference。

---

## M4 — 立繪 / CG / Cinematic 全量重做

### AI 要做

- [ ] 盤點現有每條 route 所需：
  - [ ] sprites
  - [ ] backgrounds
  - [ ] CGs
  - [ ] cinematic keyframes
  - [ ] posters
- [ ] 為每個 asset 建 Asset Recipe。
- [ ] 產生 Generation Queue。
- [ ] 每項包含：
  - [ ] logical asset ID
  - [ ] reference image
  - [ ] prompt
  - [ ] negative
  - [ ] camera
  - [ ] headPose
  - [ ] action
  - [ ] lighting
  - [ ] aspect ratio
  - [ ] size
  - [ ] safe zone
  - [ ] focal point
  - [ ] source path
  - [ ] runtime format
- [ ] replacement 優先保持 logical asset ID 不變。
- [ ] physical filename 使用 version/hash。

### Human 要做

- [ ] 依 Generation Queue 生圖／生影片。
- [ ] 挑選最終素材。
- [ ] 保存到指定 `assets-src/` path。
- [ ] 告訴 AI：「圖都好了。」

### AI 要做（收到「圖都好了」）

- [ ] `assets:check`
- [ ] `assets:build`
- [ ] content validate
- [ ] story tests
- [ ] build
- [ ] preview
- [ ] checkpoint accepted batch

### 驗收

- [ ] 身份一致。
- [ ] 服裝/髮型版本對應正確。
- [ ] UI safe zone 正確。
- [ ] CG 不疊 sprite。
- [ ] cinematic 有 poster fallback。

---

## M5 — 對話與劇情支線

### AI 要做

每位女主：

- [ ] 建 route/context。
- [ ] 新 content 優先使用 semantic node IDs。
- [ ] 加 dialogue。
- [ ] 加 narration。
- [ ] 加 choices。
- [ ] 加 state changes。
- [ ] 加 branch conditions。
- [ ] 加 endings。
- [ ] 加 route-specific asset whitelist。
- [ ] 接到共用入口／共用節點。
- [ ] 不新增 title-screen route selector，除非 architecture 另行批准。
- [ ] 優先 content-only change。
- [ ] 不為單一女主新增 engine hack。

### Human 要做

- [ ] Playtest：
  - [ ] 說話像不像她；
  - [ ] chemistry 是否成立；
  - [ ] 節奏；
  - [ ] 升溫速度；
  - [ ] choice 有沒有意義；
  - [ ] ending payoff；
  - [ ] 是否想繼續玩。

### 驗收

- [ ] route 可完整玩完。
- [ ] 至少一個 choice 真正改變後續內容或 state。
- [ ] 沒有角色-specific engine code。

---

## M6 — 3–4 女主 Scale Validation

### AI 要做

- [ ] 跑全 route validation。
- [ ] 跑 asset completeness。
- [ ] 跑 build profiles。
- [ ] 跑 save/resume。
- [ ] 跑 branch history。
- [ ] 跑 gallery。
- [ ] 測試 context command 在大內容量下是否仍好用。
- [ ] 如果 branch graph 太長，再實作：
  - [ ] role filter；
  - [ ] folding；
  - [ ] hidden locked-node compaction。
- [ ] 量測：
  - [ ] initial load；
  - [ ] runtime asset size；
  - [ ] peak video/image loading；
  - [ ] mobile memory。
- [ ] 只有實際造成問題才做 performance optimization。

### Architecture 成功標準

- [ ] 3–4 女主可共存。
- [ ] 新角色主要改 `content/`、`assets-src/`、recipes。
- [ ] `src/engine*` 幾乎不因角色本身而修改。
- [ ] 新女主 workflow 可重複：
  ```text
  Character Bible
  → Story / Route
  → Generation Queue
  → Human Asset Generation
  → AI Integration
  → Playtest
  → Checkpoint
  ```

---

# 4. 之後 — SFW 公網朋友測試

> 前提：3–4 女主 scale test 通過，Sites review 沒有 blocking issue。

---

## P1 — SFW Release Candidate

### AI 要做

- [ ] 產生 `sfw` profile build。
- [ ] 驗證 pruning：
  - [ ] excluded dialogue 不存在；
  - [ ] excluded node 不存在；
  - [ ] excluded asset 不存在；
  - [ ] graph 無 dangling target。
- [ ] production runtime assets 上傳 public R2/CDN。
- [ ] runtime URL 使用 version/hash。
- [ ] production manifest 產生完成。
- [ ] deploy static app 到 public host。
- [ ] 做 smoke test。

### Human 要做

- [ ] 決定 public URL / host。
- [ ] 決定測試朋友範圍。
- [ ] 最終 approve 發布。

### 驗收

- [ ] 手機直接開 URL 可玩。
- [ ] 無 login requirement。
- [ ] media 正常載入。
- [ ] reload / continue 正常。
- [ ] SFW filtering 正確。

---

## P2 — Friend Test Feedback

### 不要先問技術細節

優先收：

- [ ] 前 5 分鐘想不想繼續？
- [ ] 最喜歡哪位女主？
- [ ] 為什麼？
- [ ] 哪段無聊？
- [ ] 哪段太長？
- [ ] 哪個 choice 看不懂？
- [ ] 哪個 choice 感覺「選了也沒差」？
- [ ] 圖片／角色一致性有沒有跳掉？
- [ ] 手機操作哪裡不舒服？
- [ ] loading 有沒有明顯卡住？
- [ ] Continue 是否可靠？
- [ ] 玩完一條 route 後，想不想看另一位女主？

### AI 要做

- [ ] 整理 feedback。
- [ ] 區分：
  - [ ] content problem；
  - [ ] asset problem；
  - [ ] UX problem；
  - [ ] technical bug；
  - [ ] product direction。
- [ ] 只對重複／高影響問題排 priority。
- [ ] 不在第一輪 friend test 前做 monetization。
- [ ] 不在第一輪 friend test 前做 advanced engine feature。

---

# 5. 固定日常工作流

## Local Working

使用者在 Mac 前：

```text
Codex
+ local Git working copy
+ local assets-src/
+ local preview
```

### 流程

- [ ] `git pull`
- [ ] 修改 code/content。
- [ ] 新 asset 直接放 local `assets-src/`。
- [ ] `npm run assets:check`
- [ ] `npm run assets:build`
- [ ] `npm run preview`
- [ ] Human playtest。
- [ ] 反覆修改。

---

## 準備關機／遠端接手

- [ ] 確認 accepted assets。
- [ ] `npm run checkpoint`
- [ ] 確認 cloud-complete。
- [ ] push GitHub。
- [ ] Mac 可關機。

---

## Remote Working

```text
ChatGPT Work
→ GitHub Codespace
→ GitHub + private R2
```

### 流程

- [ ] `git pull`
- [ ] `npm run assets:fetch`
- [ ] `npm run assets:build`
- [ ] `npm run content:validate`
- [ ] `npm run dev`
- [ ] 打開 Codespaces Forwarded Preview URL。
- [ ] AI / Human review。
- [ ] 修改。
- [ ] build/test。
- [ ] commit。
- [ ] push。

---

## Sites Review

- [ ] 選定 cloud-complete commit。
- [ ] build review。
- [ ] publish Sites。
- [ ] 記錄 commit + checkpoint。
- [ ] Human playtest。
- [ ] 修 regression。

---

## Release

只接受：

```text
GitHub commit
+
private R2 checkpoint
```

### 流程

- [ ] validation
- [ ] asset optimization
- [ ] public R2 runtime publish
- [ ] production manifest
- [ ] production build
- [ ] distribution deploy
- [ ] smoke test
- [ ] release record

---

# 6. Owner Matrix

| 項目 | AI | Human | Joint |
| --- | :---: | :---: | :---: |
| Architecture / docs | ✓ | approve | |
| Story / route / dialogue | ✓ | feedback | ✓ |
| Character concept | draft | final | ✓ |
| Character Bible | ✓ | approve | ✓ |
| Generation Queue | ✓ | | |
| Image/video generation tool 操作 | | ✓ | |
| Asset selection | assist | final | ✓ |
| Asset ingest/build | ✓ | | |
| Validator/compiler/tooling | ✓ | | |
| R2 bucket/account approval | | ✓ | |
| R2 integration code | ✓ | | |
| Secrets placement | guide | ✓ | |
| Codespace preview setup | ✓ | login/approve if needed | |
| Sites publish | ✓ when capability available | playtest | ✓ |
| Git verification/commit/push | ✓ | milestone approve | |
| Public URL / friend audience | | ✓ | |
| Friend feedback analysis | ✓ | collect/share | ✓ |

---

# 7. Hard Gates

以下規則不可為了「先跑起來」而跳過：

- [ ] 不在確認 master/source 安全前刪除 binary。
- [ ] 不把 `dist/` 當長期 source of truth。
- [ ] 不把 secret commit 到 GitHub。
- [ ] 沒有 GitHub commit + private R2 master checkpoint，不得稱為 cloud-complete。
- [ ] required master 只存在關機 Mac 時，不得 remote release。
- [ ] 不為某一個女主寫 route-specific engine hack。
- [ ] 不因 provider URL 改變而改 story JSON。
- [ ] 不把 physical filename 當 story identity。
- [ ] SFW build 必須 compile-time prune，不只 UI hide。
- [ ] Sites review 未通過前，不做 public SFW friend-test release。
- [ ] friend test 前不優先做 monetization / backend / advanced renderer。

---

# 8. 暫時延後

只有實際需求證明必要時才做：

- [ ] React/TypeScript/Vite migration
- [ ] PixiJS / WebGL renderer
- [ ] Unity / Godot
- [ ] transparent alpha video pipeline
- [ ] full AVIF migration
- [ ] voice acting
- [ ] advanced Web Audio mixer
- [ ] OAuth
- [ ] player cloud save
- [ ] paid entitlement
- [ ] general backend
- [ ] analytics platform（除非有明確問題要回答）
- [ ] client-side AES DRM
- [ ] speculative scaling architecture

---

# 9. 每次提交前固定驗證

至少：

```bash
npm run build
npm run validate
npm test
git diff --check
```

在 asset pipeline 完成後，增加：

```bash
npm run assets:check
npm run assets:build
```

正式 release 前增加：

```bash
npm run checkpoint
npm run release
```

---

# 10. 下一個立即要做的項目

> 不要跳步。

- [ ] **NEXT: W1 — Source Asset Boundary**
  - [ ] 盤點 `dist/assets/`
  - [ ] 建 `assets-src/`
  - [ ] 建 `generated/`
  - [ ] refactor validator/build
  - [ ] 驗證 `dist/` 可刪除重建
