# TODO.md

> 專案執行清單（Execution Board）
>
> Updated: 2026-09-23
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
- [x] W4 Player UI / Memories / CG Gallery 的產品與資料契約已寫入 `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`，**但尚未實作**。

## 0.2 現在 package scripts 的真實狀態

目前 `package.json` 只有：

```text
npm test
npm run validate
npm run build
npm run assets:check
npm run assets:build
npm run assets:plan
npm run context
```

目前**沒有**：

```text
npm run dev
npm run preview
npm run checkpoint
npm run release
```

不要在文件或交接中假裝這些 command 已存在。

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

- [ ] Codespaces canonical devcontainer。
- [ ] Codespaces one-command preview。
- [ ] fresh Codespace restore + playtest acceptance。
- [ ] W4 Player UI / Memories / CG Gallery implementation。
- [ ] cloud-complete verification/checkpoint command。
- [ ] SFW / Full compile-time pruning。
- [ ] production release command / deployment provenance。
- [ ] 多女主 scale test。
- [ ] 大量 legacy node IDs semantic migration。
- [ ] React/TypeScript/Vite migration（目前 intentionally deferred）。

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

# 3. NEXT — W3 Codespaces Development & Preview

> **這是現在唯一的立即優先項。不要先做 W4 UI。**

## W3 目標

Fresh GitHub Codespace 在沒有本地 Mac repo、沒有本地 asset cache、沒有私人 Drive credential 的前提下，可以：

```text
open Codespace
→ build
→ start preview
→ forwarded URL
→ human playtest
→ AI review when intentionally shared
→ edit
→ verify
→ commit / push
```

## W3.1 Devcontainer：環境必須可重現

### AI 要做

- [x] 新增 `.devcontainer/`。
- [x] pin Node.js major version，與 CI 對齊為 Node 22。
- [x] 確保 `ffmpeg` / `ffprobe` 在 Codespace 可用。
- [x] 不要求使用者手動安裝 project-specific system dependencies。
- [ ] devcontainer rebuild 後：
  - [ ] `node --version` 符合預期；
  - [ ] `ffmpeg -version` 可執行；
  - [ ] `ffprobe -version` 可執行。
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
- [x] `npm run preview`：
  - [x] 執行 clean/production-like build；
  - [x] 啟動同一 port；
  - [x] 用於 milestone acceptance/review。
- [x] 不為了取得 dev server 而 migration 到 React/TypeScript/Vite。
- [x] 若使用第三方 server package，必須有明確收益；否則優先 Node built-ins。

### Acceptance

- [ ] forwarded URL 能載入 title。
- [ ] JS/CSS/module path 正常。
- [ ] image/video/runtime assets 正常。
- [ ] refresh/reload 不 404。
- [ ] cinematic 可載入。
- [ ] console 無 blocking runtime error。

## W3.3 Fresh Codespace restore

### AI 要做

用**全新 Codespace**驗證，不得依賴舊 generated cache：

- [ ] repository checkout 完整。
- [ ] `npm run assets:check`
- [ ] `npm run assets:build`
- [ ] `npm run build`
- [ ] `npm run validate`
- [ ] `npm test`
- [ ] `npm run preview`
- [ ] 確認 Drive runtime assets 由 remote source 重新取得並驗 hash。
- [ ] 確認 existing Git-backed `assets-src/` sources 正常可用。
- [ ] 確認不需要 Mac 上任何檔案。
- [ ] 確認不需要 Google private credential 才能 build playable runtime。

### Human acceptance

在 forwarded preview 快速走：

- [ ] title。
- [ ] start。
- [ ] continue。
- [ ] reload → continue。
- [ ] 許棠主線。
- [ ] OL branch。
- [ ] gallery。
- [ ] branch/history view（現行版本）。
- [ ] cinematic。
- [ ] ending。
- [ ] return to title。
- [ ] narrow/mobile width smoke test。

## W3.4 localStorage 行為

- [ ] 同一 forwarded origin reload 後，save/CG/endings/mute 等現行 localStorage 狀態保留。
- [ ] 新 Codespace / 新 forwarded origin 沒有舊 browser localStorage，視為預期行為，不是 restore bug。
- [x] W3 不新增 cloud save。
- [x] W3 不新增帳號/OAuth。

## W3.5 Work / cloud-browser review

- [ ] 驗證 reviewer 無法使用 private forwarded port 時的實際行為。
- [ ] 若需要 Work 直接打開：
  - [ ] 暫時將 4173 設為 public；
  - [ ] 打開 forwarded URL；
  - [ ] 完成 smoke playtest；
  - [ ] review 後恢復 private/停止 port。
- [ ] 不把「永久 public dev port」當成 architecture requirement。
- [ ] 若 GitHub policy 阻止 public port，記錄限制，改用 Sites/review deployment；不要繞過 policy。

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

只有以下全部成立才可把 W3 標成完成：

- [ ] fresh Codespace 可自給自足 build。
- [x] `npm run dev` 存在且可用。
- [x] `npm run preview` 存在且可用。
- [ ] 4173 forwarded preview 可 play。
- [ ] current runtime smoke path 通過。
- [ ] reload/localStorage 通過。
- [ ] AI reviewer sharing path 已實測或有明確 fallback。
- [x] minimum verification 全通過。
- [x] canonical docs 不再把 Local Working 描述為正式流程。
- [x] verified commit 已 push。

---

# 4. W4 — Player UI / Memories / CG Gallery

> 狀態：**spec approved，未實作。**
>
> Canonical feature spec：`docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`

W4 必須在 W3 完成後開始，避免 UI refactor 與開發環境 migration 混在同一個 milestone。

## W4.1 Title / navigation

- [ ] title 改成：
  - [ ] 一個大 Start/Continue；
  - [ ] Memories；
  - [ ] CG。
- [ ] 移除玩家層級的 standalone Branches 入口。
- [ ] 不新增 New Game / save-slot mental model。
- [ ] sound/settings 移到輕量 icon/HUD。
- [ ] title backdrop 依 frontier/memory metadata 決定。

## W4.2 In-game UI

- [ ] desktop dialogue panel 縮小並讓 CG 成為視覺主體。
- [ ] speaker badge 分離。
- [ ] choices 與 dialogue panel 分離。
- [ ] mobile 保持清楚 touch targets 與無 horizontal scroll。
- [ ] safe zone 不遮臉、手、關鍵互動與劇情物件。

## W4.3 Memories

- [ ] 一頁式 vertical Memories timeline。
- [ ] 不做二級 Route Detail。
- [ ] player-facing primitive = Memory Event，不等同 engine node。
- [ ] 共通事件使用 scene/background cover。
- [ ] 單女主事件使用事件 CG 淡化、face-focused backdrop。
- [ ] 支援 locked / discovered / replayable state。
- [ ] replay old memory 不得讓 deepest progress 倒退。

## W4.4 Save semantics

- [ ] 分離：
  - [ ] current/replay cursor；
  - [ ] deepest story frontier。
- [ ] Continue 永遠依 frontier，不被 replay regression。
- [ ] 舊 save migration 保留合理可遷移的 progress / CG / endings。
- [ ] 新增對應 automated tests。

## W4.5 CG Gallery

- [ ] 保持簡單 collection wall。
- [ ] locked/unlocked。
- [ ] full viewer。
- [ ] 不承擔 story graph responsibility。

## W4 DoD

- [ ] spec 的資料契約已落地。
- [ ] desktop/mobile UI smoke test 通過。
- [ ] replay/frontier tests 通過。
- [ ] old save migration tests 通過。
- [ ] existing story paths 無 regression。
- [ ] docs/state/TODO 更新並 push verified commit。

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

## M1 Roster / Character Bible

- [ ] 確認總 roster。
- [ ] 每位角色有 stable ID / designVersion / identity / speech / behavior / arc / constraints。
- [ ] 角色差異化通過 Human review。

## M2 Identity References

- [ ] 每位女主有 canonical identity sheet / face / full-body / angles / neutral expression。
- [ ] accepted masters 進 canonical asset storage。
- [ ] Character Bible / asset metadata 更新。

## M3 Asset Production

- [ ] sprites / CG / backgrounds / cinematic keyframes / posters inventory。
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

---

# 13. 下一個立即要做的項目

> **不要跳步。**

- [ ] **NEXT: W3 — Codespaces Development & Preview**
  - [x] 建立 Node 22 + ffmpeg 的 devcontainer。
  - [x] 固定 forwarded preview port 4173。
  - [x] 新增 `npm run dev`。
  - [x] 新增 `npm run preview`。
  - [ ] fresh Codespace clean restore/build。
  - [ ] forwarded preview smoke test。
  - [ ] localStorage reload test。
  - [ ] temporary public-port / Work review path test。
  - [x] 同步所有 canonical workflow docs。
  - [x] verify、commit、push。
- [ ] **THEN: W4 — Player UI / Memories / CG Gallery**
