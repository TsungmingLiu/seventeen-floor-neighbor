# TODO.md

> 專案執行清單（Execution Board）
>
> Updated: 2026-09-25
>
> 本檔案回答一件事：**現在下一步到底做什麼，以及什麼才算完成。**
>
> 產品／技術設計以 `ARCHITECTURE.zh-TW.md` 為 canonical architecture，`PROJECT_STATE.md` 記錄目前狀態，本檔案記錄精確執行順序。2026-09-23 起 canonical development workflow 已完整同步為 **Codespaces-only**。

---

# 0. 現在的專案狀態

## 0.1 已完成且已驗證

- [x] W1 — Source Asset Boundary。
- [x] W2 — Strict Asset Check / Asset Build。
- [x] `dist/` 可 clean rebuild；`dist/assets/` 是 generated output，不再是 binary source of truth。
- [x] `assets-src/` 保留現有 Git-backed legacy/preservation sources。
- [x] Google Drive 已建立：
  - [x] `source-private/`：Restricted canonical masters。
  - [x] `runtime-public/`：Anyone-with-link optimized runtime objects。
- [x] `content/assets/source-catalog.json` 記錄已恢復 private masters 的 provenance/hash/dimensions。
- [x] `content/assets/source-map.json` 支援 `gdrive-public` runtime provider、URL、bytes、SHA-256。
- [x] GitHub Actions 可在沒有 Google Drive credential 的情況下匿名下載 remote runtime assets、驗 hash、full decode、build、validate、test。
- [x] 三張 date CG 的 damaged GitHub originals 已由完整 master 恢復，runtime WebP 已放入 Drive。
- [x] 許棠 identity v2 與 first-kiss keyframes 的完整 masters 已恢復並記錄。
- [x] W4 Player UI / Memories / CG Gallery 的產品與資料契約已寫入 `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`，且已在既有 playable fixture 落地。
- [x] 雙女主 production narrative 已升級為 Braided Narrative v0.5；canonical scene/route/state/art 規格已拆入 `docs/narrative/` 與 `docs/art/`。
- [x] 許棠／江雨澄 6-sheet production reference packs 已通過 QA，Drive canonical manifest 已記錄於 `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`。
- [x] Opening Vertical Slice 已定義為第一個 production-grade content sample，production board 位於 `docs/narrative/CONTENT_PRODUCTION_TODO.md`。
- [x] AI production harness v0.1 control layer：manifest、bootstrap、source lifecycle、context isolation、Task/Data/Handoff contracts、specialist harnesses。
- [x] 新 production visual direction：CG-first、16:9 landscape-first、CG Sequence；舊 sprites/9:16 保留作 fixture，不再擴產。

## 0.2 現在 package scripts 的真實狀態

目前已實作：

```text
npm test
npm run validate
npm run build
npm run dev
npm run preview
npm run preview:smoke
npm run codespace:accept
npm run codespace:review
npm run assets:check
npm run assets:build
npm run assets:plan
npm run context
```

目前尚未實作：

```text
npm run checkpoint
npm run release
```

`codespace:accept` / `codespace:review` 需要執行端已用 GitHub CLI 完成可管理 Codespaces 的 authentication；一般 repo connector 本身不等於這個 lifecycle permission。

## 0.3 現行 playable baseline

- [x] 一個共用故事入口。
- [x] 許棠完整主線。
- [x] 辦公族 OL 暫用短分支。
- [x] title start/continue。
- [x] node resume。
- [x] branch history。
- [x] CG gallery。
- [x] cinematic。
- [x] context tooling。
- [x] runtime/save tests。

## 0.4 仍未完成

- [x] Codespaces canonical devcontainer。
- [x] Codespaces one-command preview。
- [x] AI-operated ephemeral Codespace lifecycle tooling。
- [x] 在具有 Codespaces lifecycle 權限的 authenticated `gh` operator 上跑一次 end-to-end `codespace:accept`（run `35932727909`）。
- [x] AI cloud-browser UI / localStorage / playable-flow acceptance（Browser Acceptance run `35933586244`）。
- [x] W4 Player UI / Memories / CG Gallery implementation。
- [ ] cloud-complete verification/checkpoint command。
- [ ] SFW / Full compile-time pruning。
- [ ] production release command / deployment provenance。
- [ ] 多女主 scale test。
- [ ] 大量 legacy node IDs semantic migration。
- [ ] React/TypeScript/Vite migration（目前 intentionally deferred）。

## 0.5 Opening demo UI follow-ups（本輪只記錄，不實作）

- [ ] choice node 的 `text: ""` 不應顯示空 dialogue box。
- [ ] 釐清 narrator + character content 同框時的閱讀層級與切分方式。
- [ ] 決定 choice 是否移除自動 `A/B/C` prefix。

這三項不是 Content Production Stabilization refactor 的 acceptance gate；需另開 UI/runtime scope，並保持 existing playable behavior 可回歸驗證。

---

# 1. 2026-09-23 架構決策：Codespaces-only canonical development

這是目前正式工作流，不再維持 Local + Cloud 雙軌。

## 1.1 Source of truth

```text
GitHub
= code / content / metadata / history source of truth

Google Drive source-private
= accepted private master asset source of truth

Google Drive runtime-public
= optimized remote runtime object store

GitHub Codespaces
= canonical development / build / test environment

Codespaces forwarded preview
= human + AI shared review surface
```

## 1.2 Local machine 的新定位

- [x] **Local development 不再是 supported/canonical workflow。**
- [x] 不再把「Mac 能不能跑」列入任何 milestone acceptance。
- [x] 不再要求維護 local Node / ffmpeg / repo / asset cache 與 Codespaces 的環境一致性。
- [x] 使用者人在電腦前時，可用：
  - browser Codespaces；或
  - Desktop VS Code 連到同一個 Codespace。
- [x] local clone 若存在，只是 emergency/advanced fallback；不保證、不測試、不作為 release input。

## 1.3 Asset 規則

- [x] 現有 `assets-src/` 中 Git-tracked legacy assets 可繼續使用；它們不是 Mac-only，因此 Codespace 可取得。
- [ ] **新的 accepted master asset 不得只存在某台本地電腦。**
- [ ] 新 accepted master 優先進 `source-private/`，並更新 catalog。
- [ ] 需要 remote build 的 optimized runtime 進 `runtime-public/`，並更新 source-map/hash。
- [ ] 若 image/video generation tool 先把檔案產在本機，該檔只算 staging；在 master 被保存到 canonical store 前，不得視為完成。

## 1.4 Preview security 規則

GitHub Codespaces forwarded ports 預設是 private。

- [ ] Human 自己 playtest：保持 private。
- [ ] ChatGPT Work / 其他未共享 GitHub authentication 的 reviewer 需要直接打開 preview 時：
  - [ ] 僅在 review 期間把 preview port 暫時設為 public；
  - [ ] 不在 preview 中放 secrets、private masters 或未打算暴露的資料；
  - [ ] review 完成後恢復 private／停止 port。
- [ ] 不把 forwarded URL 寫死進 source code 或 tests。
- [ ] Codespace/port 重新建立後 URL 或 visibility 可能改變；不得把它當 permanent deployment URL。

---

# 2. 已完成 migration foundation

## W1 — Source Asset Boundary ✅

### 已完成

- [x] 建立 `assets-src/` 與 source categories。
- [x] 建立 `generated/runtime-assets/`、`generated/source-cache/` disposable workspace。
- [x] 建立 `content/assets/source-map.json`。
- [x] 建立 asset inventory。
- [x] static shell source 移到 `public/`。
- [x] build 先清除再完整重建 `dist/`。
- [x] validator 不再把 `dist/assets/` 當 source。
- [x] 加入 GitHub Actions Verify。
- [x] CI run `35807627568` 驗證 build / validate / tests / diff / reproducibility。

### 保留規則

- [x] 不為了「看起來更乾淨」刪除唯一 binary source。
- [x] logical asset IDs 不因 physical storage/provider 改變。

---

## W2 — Asset Check + Asset Build ✅

### 已完成

- [x] `npm run assets:check`
- [x] `npm run assets:build`
- [x] ffprobe + ffmpeg full-decode validation。
- [x] logical asset / recipe / source mapping / dimensions / media metadata validation。
- [x] 證實並處理已知 damaged assets。
- [x] Drive `source-private` / `runtime-public` 基礎建立。
- [x] `gdrive-public` runtime provider。
- [x] remote bytes / SHA-256 / decode 驗證。
- [x] CI run `35812177697`：44/44 media checks、3 Drive downloads、9/9 tests，build/validate/reproducibility 全通過。

### 重要編號修正

舊 TODO 曾把「Google Drive Asset Store」稱為 W4。**這個編號已廢止。**

Drive-first asset storage 是 **W2 已建立的基礎能力**，不是現在的 W4。

真正的 W4 是：

> **W4 — Player UI / Memories / CG Gallery**

並以 `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md` 為功能級規格。

---

# 3. W3 Codespaces Development & Preview ✅

> **狀態：完成。** Fresh Codespace engineering acceptance 與 deterministic Chromium browser acceptance 都已通過；W4 已解除 blocker。

## W3 目標

W3 的 acceptance 不再依賴 Human 手動建立／重建 Codespace。Canonical 目標改成：

```text
AI / authenticated gh operator
→ create disposable Codespace
→ wait for devcontainer
→ SSH
→ clean restore / asset fetch / build / validate / tests
→ start preview
→ private forwarded-port smoke
→ optional temporary public review URL
→ AI browser review
→ delete Codespace
```

Human 只保留真正需要主觀判斷的 UX／劇情／視覺 approval；環境 lifecycle 與工程 acceptance 應由 AI 自動處理。

## W3.1 Devcontainer：環境必須可重現

### AI 要做

- [x] 新增 `.devcontainer/`。
- [x] pin Node.js major version，與 CI 對齊為 Node 22。
- [x] 確保 `ffmpeg` / `ffprobe` 在 Codespace 可用。
- [x] 不要求使用者手動安裝 project-specific system dependencies。
- [x] devcontainer rebuild 後：
  - [x] `node --version` 符合預期；
  - [x] `ffmpeg -version` 可執行；
  - [x] `ffprobe -version` 可執行。
- [x] 自動 forward 固定 preview port。
- [x] 給 preview port 清楚 label。

### Hard rule

- [x] 不以「我的 Mac 已經裝好了」作為任何 dependency 的解法。

## W3.2 Preview command

### 決策

- Canonical interactive command：`npm run dev`
- Acceptance / production-like preview：`npm run preview`
- 固定 preview port：**4173**，除非實作中發現明確 blocker；若改 port 必須同步 docs/devcontainer/tests。

### AI 要做

- [x] 新增 dependency-light 或 dependency-free static dev server。
- [x] server bind `0.0.0.0`，讓 Codespaces forwarding 正常。
- [x] `npm run dev`：
  - [x] 能從目前 source 建立可玩的 `dist/`；
  - [x] 啟動 port 4173；
  - [x] 適合高頻 edit → refresh loop。
- [x] production preview contract：clean build 後以同一 preview server / port 4173 serve `dist/`（acceptance 使用 `--skip-build` 避免重複 build）。：
  - [x] 執行 clean/production-like build；
  - [x] 啟動同一 port；
  - [x] 用於 milestone acceptance/review。
- [x] 不為了取得 dev server 而 migration 到 React/TypeScript/Vite。
- [x] 若使用第三方 server package，必須有明確收益；否則優先 Node built-ins。

### Acceptance

以下由 fresh Codespace private-tunnel smoke + Chromium browser acceptance 聯合證明：

- [x] preview origin 能載入 title。
- [x] JS/CSS/module path 正常。
- [x] image/video/runtime assets 正常。
- [x] refresh/reload 不 404。
- [x] cinematic 可載入並取得約 10 秒 metadata。
- [x] console/page 無 blocking runtime error。

## W3.3 AI-operated ephemeral Codespace acceptance

### Lifecycle tooling

- [x] 新增 `npm run codespace:accept`。
- [x] 新增 `npm run codespace:review`。
- [x] 以 GitHub CLI 編排 create / list / view / SSH / ports / delete。
- [x] 成功 acceptance 預設刪除 ephemeral Codespace。
- [x] failure 預設保留短時間環境供除錯，並使用 20m idle / 1h retention 限制成本。
- [x] private acceptance 使用 `gh codespace ports forward` tunnel，不需要把 4173 公開。
- [x] review mode 才暫時把 4173 設 public，並輸出 review URL。
- [x] devcontainer 加入 SSH server，讓外部 AI operator 可用 `gh codespace ssh`。
- [x] CI 對 lifecycle command 執行 `--dry-run` syntax/plan check。
- [x] 提供 optional `Codespace Acceptance` workflow_dispatch；若 repository 一次性配置 `CODESPACES_TOKEN`，GitHub Actions 可直接建立 fresh Codespace。
- [x] 在真實 authenticated `gh` context 執行一次 `npm run codespace:accept` end-to-end；run `35932727909` 完成 create → SSH → clean verification → preview → private tunnel smoke → delete。
- [x] fine-grained PAT 權限已實測：`Codespaces: read/write` + `Codespaces metadata: read`。
- [x] Codespace create 已改為 REST/non-interactive machine selection，不依賴 TTY。
- [x] first-kiss cinematic 的舊 Git binary portability 問題已由四張 canonical Drive keyframe 重建 10 秒 MP4/WebM 修復；commit `6455239542e950ea54686b434a1a6c52a76e1feb`，ffmpeg 5.1 devcontainer 與 GitHub Actions ffmpeg 6.1 均 full-decode 通過。

### 真實 acceptance 必須驗證

由 script 在**全新 Codespace**完成，不得依賴舊 generated cache：

- [x] repository checkout 完整。
- [x] Node 22 / ffmpeg / ffprobe / sshd 可用。
- [x] `npm run assets:check`
- [x] `npm run assets:build`
- [x] `npm run build`
- [x] `npm run validate`
- [x] `npm test`
- [x] `git diff --check` / deterministic generated output。
- [x] `npm run preview`
- [x] Drive runtime assets 由 remote source 重新取得並驗 hash。
- [x] existing Git-backed `assets-src/` sources 正常可用。
- [x] 不需要 Mac 上任何檔案。
- [x] 不需要 Google private credential 才能 build playable runtime。
- [x] 4173 private tunnel 可載入 HTML/CSS/JS/route JSON，extensionless fallback 與 missing-asset 404 正常。
- [x] acceptance 成功後 ephemeral Codespace 被自動刪除。

### Automated Chromium browser acceptance

GitHub Actions `Browser Acceptance` 以 clean runtime + Playwright Chromium 執行 deterministic browser acceptance。Canonical proof：run `35933586244`。

- [x] title / fresh start。
- [x] continue。
- [x] same-origin reload → continue。
- [x] save/localStorage persistence。
- [x] mute persistence。
- [x] OL branch through real choice UI。
- [x] gallery。
- [x] branch/history view。
- [x] cinematic 兩個 source、真實 metadata、skip、gallery playback。
- [x] ending resolution + completion/endings persistence。
- [x] return to title。
- [x] 320px viewport title/game 無 horizontal overflow。
- [x] console/page 無 blocking error。

`npm run codespace:review` 仍保留作為 optional 主觀 UX/視覺 review surface；它不再是 W3 engineering gate。

### Human role

- [x] Human **不再需要**手動 create/rebuild Codespace 作為 W3 gate。
- [ ] Human 只在主觀 UX、劇情節奏、視覺品質需要時做 final approval。

## W3.4 localStorage 行為

- [x] 同一 browser origin reload 後，save/continue 與 mute persistence 已由 Chromium acceptance 驗證。
- [x] ending/completion persistence 已由 Chromium acceptance 驗證。
- [x] 新 Codespace / 新 forwarded origin 沒有舊 browser localStorage，視為預期行為，不是 restore bug。
- [x] W3 不新增 cloud save。
- [x] W3 不新增帳號/OAuth。

## W3.5 Work / cloud-browser review

- [x] `npm run codespace:review` 保留為 optional reviewer surface，而不是 W3 blocker。
- [x] private engineering acceptance 不需要 public port。
- [x] 只有主觀 reviewer 需要直接開 URL 時，才暫時將 4173 設 public。
- [x] deterministic browser correctness 已移到 GitHub Actions Chromium acceptance，不依賴 Work UI automation。
- [x] review 用 public URL 必須是 temporary；review 後刪除/停止 Codespace。
- [x] 不把「永久 public dev port」當成 architecture requirement。
- [x] 若 GitHub policy 阻止 public port，使用 Browser Acceptance / Sites review；不要繞過 policy。

## W3.6 文件同步

W3 實作完成時，必須同一 milestone 更新：

- [x] `ARCHITECTURE.zh-TW.md`：移除/改寫 canonical Hybrid Local/Cloud workflow。
- [x] `ARCHITECTURE.md`：同步英文 mirror。
- [x] `MIGRATION_PLAN.md`：改成 Codespaces-only migration history/plan。
- [x] `PROJECT_STATE.md`：W3 狀態與下一 milestone。
- [x] `AGENTS.md`：新對話接手不得假設 local Mac。
- [x] `README.md`：移除 canonical localhost setup，改成 Codespaces usage。
- [x] `IMPLEMENTATION.md`：記錄實際 devcontainer/server/port。
- [x] 本 `TODO.md`：勾選完成項目。

## W3 Definition of Done

- [x] `npm run dev` / `npm run preview` 存在且可用。
- [x] AI-operated Codespace lifecycle command 已實作。
- [x] private tunnel acceptance 與 temporary-public review mode 已實作。
- [x] minimum verification / devcontainer verification 全通過。
- [x] canonical docs 不再把 Local Working 描述為正式流程。
- [x] authenticated AI operator 成功 create fresh Codespace → SSH → clean build/test → preview → delete（run `35932727909`）。
- [x] 4173 真實 private forwarded-tunnel static acceptance 通過。
- [x] Chromium 完成 reload/localStorage 與主要 playable flows（run `35933586244`）。
- [x] cinematic/browser/mobile/console acceptance 通過。
- [x] Human 不需參與 environment lifecycle；只保留 subjective product approval。
- [x] W3 verified implementation 已 push；**W3 complete**。

---

# 4. W4 — Player UI / Memories / CG Gallery

> 狀態：**已完成。** W4 Verify `35948336731` 與 Browser Acceptance `35948336719` 通過；post-demo 修正再由 Verify `35951991571` 與 Browser Acceptance `35951991567` 驗證。
>
> Canonical feature spec：`docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`

W3 已完成；W4 已用現有 123-node playable fixture 完成 runtime / migration / browser acceptance。新 Braided Narrative 內容仍由 Opening Vertical Slice production track 接入。

## W4.1 Title / navigation

- [x] title 改成：
  - [x] 一個大 Start/Continue；
  - [x] Memories；
  - [x] CG。
- [x] 移除玩家層級的 standalone Branches 入口。
- [x] 不新增 New Game / save-slot mental model。
- [x] sound/settings 移到輕量 icon/HUD。
- [x] title backdrop 依 frontier/memory metadata 決定。

## W4.2 In-game UI

- [x] desktop dialogue panel 縮小並讓 CG 成為視覺主體。
- [x] speaker badge 分離。
- [x] choices 與 dialogue panel 分離。
- [x] mobile 保持約 44px touch targets 與無 horizontal scroll。
- [x] 既有 fixture 的 panel/choice 位置與 asset focus 一起處理 safe zone；新 production CG 仍需逐張視覺 QA。

## W4.3 Memories

- [x] 一頁式 vertical Memories timeline。
- [x] 不做二級 Route Detail。
- [x] player-facing primitive = Memory Event，不等同 engine node。
- [x] 共通事件使用 scene/background cover。
- [x] 單女主事件使用事件 CG 淡化、face-focused backdrop。
- [x] 支援 locked / discovered / replayable state。
- [x] replay old memory 不得讓 deepest progress 倒退，含同一 Memory Event 內較早的 node。

## W4.4 Save semantics

- [x] 分離：
  - [x] current/replay cursor；
  - [x] deepest story frontier。
- [x] 一般 Continue 依 frontier，不被 Memories replay regression；結局後 Start 開啟新一輪時，該輪 Continue 依 cursor，歷史 frontier 保留。
- [x] 結局後主按鈕回到 Start，不再重播終點節點。
- [x] 舊 save migration 保留合理可遷移的 progress / CG / endings。
- [x] 新增對應 automated tests。

## W4.5 CG Gallery

- [x] 保持簡單 collection wall。
- [x] locked/unlocked。
- [x] full viewer，含鍵盤與觸控左右切換。
- [x] cinematic 優先 MP4、WebM fallback；播完退回 poster，不把最後一幀永久留在場景。已以 `runtime-public/test.mp4` 臨時替換驗證同一播放器可播放，正式素材未替換。
- [x] 不承擔 story graph responsibility。

## W4 DoD

- [x] spec 的資料契約已落地。
- [x] desktop/mobile UI smoke test 通過。
- [x] replay/frontier tests 通過。
- [x] old save migration tests 通過。
- [x] existing story paths 無 regression。
- [x] docs/state/TODO 更新並 push verified commit。

---

# 5. W5 — Cloud-complete Verification / Checkpoint

Codespaces-only 後，`checkpoint` **不再是「關 Mac 前同步」工具**。

它的用途改成：

> 對一個準備 review/release 的 commit，證明 GitHub + Drive 所需資料完整、可重建、可追溯。

## AI 要做

- [ ] 決定是否保留命令名 `npm run checkpoint`；若保留，語意固定為 cloud-complete verification。
- [ ] 驗證：
  - [ ] content/schema；
  - [ ] asset full decode；
  - [ ] tests；
  - [ ] required private masters 有 catalog entry；
  - [ ] required remote runtime 有 provider/file ID/URL/bytes/hash；
  - [ ] remote runtime 可下載；
  - [ ] clean build 可重現。
- [ ] 產生/記錄：
  - [ ] Git commit；
  - [ ] content/build version；
  - [ ] profile；
  - [ ] verification timestamp；
  - [ ] optional checkpoint ID。

## Cloud-complete 定義

```text
GitHub commit
+
all required accepted master assets safely represented in canonical storage
+
all required remote runtime objects resolvable from metadata
+
matching hashes / validation
+
fresh Codespace clean build succeeds
```

**不再有「Mac 關機前 checkpoint」這個概念。**

---

# 6. W6 — SFW / Full Build Profiles

## AI 要做

- [ ] 定義 `sfw` / `full`。
- [ ] schema/metadata 可標記 profile。
- [ ] compile/build prune：
  - [ ] nodes；
  - [ ] dialogue；
  - [ ] CG；
  - [ ] video；
  - [ ] route references；
  - [ ] manifest entries。
- [ ] dangling target detection。
- [ ] excluded asset leakage test。
- [ ] full profile regression test。

## Human

- [ ] 對 ambiguous scene 決定 SFW / Full / alternate asset。

## DoD

- [ ] SFW output 不包含 excluded text/binary。
- [ ] SFW graph 完整可玩。
- [ ] Full build 不被 pruning 破壞。

---

# 7. W7 — Review / Release Pipeline

## 7.1 ChatGPT Sites review

- [ ] build 可 review artifact。
- [ ] publish Sites。
- [ ] 記錄 Git commit / build profile / verification identity。
- [ ] Human full playtest。
- [ ] blocking regressions 修完。

## 7.2 Production release

- [ ] `npm run release` 或等價 deterministic release workflow。
- [ ] 只接受 cloud-complete verified input。
- [ ] production runtime provider / CDN decision。
- [ ] static deployment。
- [ ] smoke test。
- [ ] release record。

## Cloudflare R2

- [x] 商業化前暫不需要。
- [ ] 當 Drive public runtime 的 CDN/cache-control/custom-domain/traffic 限制真的成為需求時再遷移。
- [ ] provider migration 不改 logical asset IDs / story content。

---

# 8. 之後 — 3–4 女主 Scale Test

> 目的：證明新增角色主要是 content/asset production，而不是 engine rewrite。
>
> 這一階段同時是未來 AI Content Factory 的 **manual proving ground**：先人工跑通幾次相同 production contract，再決定哪些步驟值得自動化。

## M1 Roster / Character Bible

- [ ] 確認總 roster。
- [ ] 每位角色有 stable ID / designVersion / identity / speech / behavior / arc / constraints。
- [ ] 角色差異化通過 Human review。

## M2 Identity References

- [ ] 每位女主有 canonical identity sheet / face / full-body / angles / neutral expression。
- [ ] accepted masters 進 canonical asset storage。
- [ ] Character Bible / asset metadata 更新。

## M3 Asset Production

- [ ] CG / backgrounds / CG-sequence keyframes / cinematic video/posters inventory；sprite 僅在真實需求證明必要時才重新引入。
- [ ] Asset Recipes。
- [ ] Generation Queue。
- [ ] logical asset IDs 穩定。
- [ ] accepted masters 保存。
- [ ] runtime optimization + validation。

## M4 Story Routes

- [ ] route/context。
- [ ] semantic node IDs for new content。
- [ ] dialogue/narration/choices/state/conditions/endings。
- [ ] route-specific asset whitelist。
- [ ] 共用入口接線。
- [ ] 不新增 title route selector。
- [ ] 不新增 heroine-specific engine hack。

## M5 Scale Validation

- [ ] all-route validation。
- [ ] save/resume。
- [ ] Memories/frontier。
- [ ] CG gallery。
- [ ] build profiles。
- [ ] context tooling。
- [ ] asset completeness。
- [ ] mobile memory/load size。
- [ ] 只有真的遇到 scale problem 才加 folding/filter/performance optimization。

### Architecture success

```text
Character Bible
→ Story / Route
→ Generation Queue
→ Asset Generation
→ Canonical Asset Ingest
→ Codespace Integration
→ Forwarded Preview
→ Review
→ Verified Commit
```

這條鏈本身就是未來 AI Content Factory 要自動編排的 contract；在 Scale Test 階段先以人工／半人工方式證明它穩定，**不要為了 automation 提前改寫尚未穩定的 scene/content schema**。

---

# 9. 固定日常工作流（W3 完成後）

## Canonical Working

```text
GitHub
  ↓
GitHub Codespace
  ↓
npm run dev
  ↓
Forwarded Preview
  ↓
edit / playtest
  ↓
verify
  ↓
commit / push
```

### 每次開始

- [ ] resume/create Codespace。
- [ ] 確認 branch / `git status`。
- [ ] sync remote history。
- [ ] 啟動 `npm run dev`。

### 開發中

- [ ] 修改 code/content。
- [ ] asset change 依 source-map/catalog 規則處理。
- [ ] browser refresh/playtest。
- [ ] 不在本機建立另一套 parallel working copy 當主要版本。

### 需要 AI browser review

- [ ] 視需要暫時公開 preview port。
- [ ] share forwarded URL。
- [ ] review。
- [ ] review 後恢復 private/停止 port。

### 完成一個 coherent change

至少執行：

```bash
npm run build
npm run validate
npm test
git diff --check
```

asset 相關 change 另外執行：

```bash
npm run assets:check
npm run assets:build
```

然後：

- [ ] inspect diff。
- [ ] commit。
- [ ] push。
- [ ] 更新相關 state/spec/TODO，不能只在 chat 說「完成」。

---

# 10. Owner Matrix

| 項目 | AI | Human | Joint |
| --- | :---: | :---: | :---: |
| Architecture / docs | ✓ | approve | |
| Devcontainer / preview tooling | ✓ | login/playtest | ✓ |
| Story / route / dialogue | ✓ | feedback | ✓ |
| Character concept | draft | final | ✓ |
| Character Bible | ✓ | approve | ✓ |
| Generation Queue | ✓ | | |
| Image/video generation | assist/tool-dependent | final generation when external tool required | ✓ |
| Asset selection | assist | final | ✓ |
| Canonical asset ingest / metadata | ✓ | provide/approve master when needed | ✓ |
| Validator/compiler/tooling | ✓ | | |
| Google Drive folder sharing changes | guide/tool if available | approve | ✓ |
| Codespace preview | ✓ | playtest | ✓ |
| Temporary public-port decision | | ✓ | ✓ |
| Sites/release review | ✓ | final playtest/approve | ✓ |
| Git verification/commit/push | ✓ | milestone approve | |
| Friend audience | | ✓ | |
| Feedback analysis | ✓ | collect/share | ✓ |

---

# 11. Hard Gates

- [ ] 不刪除尚未有安全 canonical copy 的唯一 master/source。
- [ ] 不把 `dist/` 當 source of truth。
- [ ] 不把 secrets commit 到 Git。
- [ ] 不讓 accepted new master 只存在某台 Mac/PC。
- [ ] 不把 temporary Codespaces public port 當 production hosting。
- [ ] 不把 forwarded URL hardcode 到 content/code/tests。
- [ ] 不為單一女主寫 route-specific engine hack。
- [ ] provider/physical filename 改變不得迫使 story logical IDs 改變。
- [ ] SFW 必須 compile-time prune，不只 UI hide。
- [ ] 沒有 fresh Codespace clean-build proof，不得稱 release input 為 cloud-complete。
- [ ] Sites/review 未通過前，不做 public friend-test release。
- [ ] friend test 前不優先做 monetization/backend/advanced renderer。

---

# 12. 暫時延後

只有明確需求證明必要時才做：

- [ ] React/TypeScript/Vite migration。
- [ ] PixiJS / WebGL renderer。
- [ ] Unity / Godot。
- [ ] transparent alpha video pipeline。
- [ ] full AVIF migration。
- [ ] voice acting。
- [ ] advanced Web Audio mixer。
- [ ] OAuth。
- [ ] player cloud save。
- [ ] paid entitlement。
- [ ] general backend。
- [ ] analytics platform。
- [ ] client-side AES DRM。
- [ ] speculative scaling architecture。
- [ ] AI Game Director / automated Content Factory implementation（North Star 已定義；下方 prerequisites 未滿足前不開工）。

---

# 13. Long-term North Star — AI Game Director / Content Factory

> **狀態：自動化 Content Factory 仍不實作；其前置的 manual/semiautomated harness contract 已於 2026-09-24 開始落地。**
>
> 目的不是建立一個永遠累積 context 的「超級主對話」，而是讓 GitHub 成為長期狀態與 canonical memory；AI workers 每次只拿完成任務所需的 context capsule，完成後把成果寫回 repo。
>
> Human 最終只需要下高階產品／創意命令，例如：「擴寫中期約會池」、「替兩位女主各增加一段關係升溫內容」、「新增一名與現有角色差異足夠大的女主」、「補強 Act 3，讓目前內容更豐富」。
>
> 系統則負責把需求推導成可驗收的 production batches，產出 GitHub change + playable preview；Human 主要保留方向、視覺選擇與最終成品驗收。

## 13.1 最終交付 contract

```text
Human directive
  做某個劇情分支／擴約會池／加女角色
        ↓
AI Game Director
  scope / inventory / constraints / production plan
        ↓
Planner
  story expansion / scene objectives / dependencies / state contract
        ↓
Writers + CG production workers
  dialogue / choices / art shot list / recipes / accepted assets
        ↓
Integrator
  story JSON / route graph / memory metadata / manifest / recipes
        ↓
QA
  schema / continuity / asset / graph / build / browser smoke
        ↓
GitHub branch / PR + Codespaces playable preview + QA summary
        ↓
Human acceptance
  approve → merge / next directive
  reject  → targeted revision batch
```

**Delivery surface 是 repo change + playable build，不是一堆需要 Human 手動搬運的 subagent 對話。**

## 13.2 Production role contract

現行 active roles 由 `.ai/WORKFLOW_MANIFEST.yaml` 註冊：

| Harness | Responsibility | Content isolation |
| --- | --- | --- |
| Content Writer | Narrative Design 或 Scene/Dialogue pass | 不讀 render material；一次只做一層 |
| CG Planner | locked scene → canonical CG manifest | 只讀 visible characters/environment + immediate continuity |
| CG Renderer | manifest entry + declared references → one candidate | 不讀 scene/route/project policy |
| Content QA | Narrative Review 或 Visual Review pass | 不在 QA 內重寫 creative authority |
| Integrator | accepted content/assets → runtime contracts | 不改劇情、不生圖 |

Harness = reusable behavior；canonical contract/manifest = content source。Conversation history 不是 source of truth。

## 13.3 Automation prerequisites / hard gates

以下條件滿足前，**不要開始寫 Content Factory orchestration**：

- [ ] W4 的 memory/frontier/content data contract 已實作並在真實內容上穩定。
- [ ] Opening Vertical Slice 至少完整跑通一次：plan → script → state contract → CG generation/selection → canonical asset ingest → story JSON integration → Codespaces playable preview → Human acceptance。
- [ ] 至少再跑 1–2 個跨許棠／江雨澄的 manual production batches，確認接口不是只適合單一案例。
- [ ] scene/story schema、logical asset ID、memory metadata 與 generation recipe 已不再高頻改形。
- [ ] context packet 足以讓新 session 在不讀舊聊天的情況下安全修改局部內容。
- [ ] validator/tests 能抓出 broken next target、unreachable scene、asset mismatch、save/frontier regression 等主要 integration failure。
- [ ] Human 已確認哪些 gate 必須保留人工判斷（至少 creative direction、關鍵 CG selection、final playable acceptance）。

## 13.4 演進順序

### Phase A — 現在：Framework + first production sample

- W4 Player UI / Memories / CG Gallery。
- Opening Vertical Slice script / CG production。
- 持續完善 canonical story/state/art/reference docs。
- 目標：得到第一個真正 production-quality、可玩的完整樣本。

### Phase B — 下一階段：Manual production loop stabilization

反覆跑：

```text
選定 content scope
→ plan
→ script
→ CG
→ JSON / asset integration
→ validate
→ Codespaces preview
→ Human review
```

這一階段的任務不是追求「全自動」，而是找出每一輪真正固定、可機械化的 input/output contract。

### Phase C — Content Factory MVP

第一版只自動化最穩定且風險最低的部分：

```text
batch descriptor
→ context capsule
→ Planner
→ Writer
→ story JSON assembler
→ validators/tests
→ GitHub PR
→ playable preview
```

CG 可以先維持 Human selection gate；不要讓圖片生成阻塞文字／JSON pipeline 的建立。

### Phase D — AI Game Director

當 Batch-level pipeline 已穩定，再往上一層：

```text
擴寫約會池
        ↓
Director 讀 inventory / roadmap / constraints
        ↓
自動定義多個 production batches
        ↓
逐批執行 Content Factory
        ↓
整合 + QA
        ↓
Human 驗收最終 feature
```

最終目標是 **Human 管產品方向與品質；AI 管 decomposition、production、integration 與重複性 QA**。

---

# 14. 當前執行順序

> **不要為了 North Star 跳過目前的 proving work。**

## Technical track — W4 complete

- [x] **W4 — Player UI / Memories / CG Gallery**
  - [x] 落地 memory-event / cursor / frontier data contract。
  - [x] 更新 title / in-game UI / Memories / CG Gallery。
  - [x] old-save migration。
  - [x] automated tests + browser acceptance。
  - [x] verified commit / docs synchronization。

## Creative track — 可與 W4 平行

- [ ] **Opening Vertical Slice production**
  - [ ] 依 `docs/narrative/CONTENT_PRODUCTION_TODO.md` 推進 Batch A–D。
  - [ ] W4 runtime contract 已穩定；各 scene 完成 S1–S9 後接入 runtime，續做 S10–S12。
  - [ ] 許棠／江雨澄 production CG 必須使用已批准 6-sheet canonical references。
  - [ ] 不把舊 123-node playable fixture 當成 production narrative ordering。

## First convergence milestone

- [ ] 把 Opening Vertical Slice 接入 W4 runtime（S10）。
- [ ] Codespaces playable integration / browser acceptance（S11）。
- [ ] Human 從玩家視角驗收 pacing、角色差異、CG/UI composition，完成 final polish（S12）。
- [ ] 將這一次完整 loop 的實際 input/output/返工原因記錄下來，作為 Content Factory interface 設計依據。

## THEN

- [ ] W5 — Cloud-complete Verification / Checkpoint。
- [ ] W6 — SFW / Full Build Profiles。
- [ ] W7 — Review / Release Pipeline。
- [ ] 3–4 女主 Scale Test。
- [ ] **只有在 13.3 prerequisites 成立後，才開始 Content Factory MVP。**
