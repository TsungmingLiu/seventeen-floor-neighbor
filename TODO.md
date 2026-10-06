# Technical TODO

> 本文件是 **technical execution board**。
>
> 專案 milestone 與優先順序由 [`ROADMAP.md`](ROADMAP.md) 決定；本文件只記錄工程上需要實際執行的工作。
>
> 劇情、美術與 content-production progress 見 `docs/narrative/CONTENT_PRODUCTION_TODO.md`。
>
> 已驗證的 milestone 基線見 `ROADMAP.md`；實際工程契約見 `ARCHITECTURE.md` 與 code/tests。

---

# Current Milestone

## M1 — Gameplay Validation

目前唯一 active technical milestone。C0 核對基線為 2026-10-06 main `0b48183…`；PR #45 `e28e45d…` 是歷史 title snapshot，包含 title CG／預填姓名與 prospective final derivative/display QA policy；已核對的是 exact PR head `43db3a2…` 的 [Verify run 37034831902](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/37034831902)，Verify job `110930333722`、deploy／smoke job `110933137975` success，不推定 post-merge main CI 或新的 pixel QA。M0 已於 2026-10-02 由 PR #43 main `c5251cd…` 的 132/132 Verify、deployment／smoke 與既有 Human playable acceptance 關閉，見 [收尾證據](docs/migration/M0_FOUNDATION_ACCEPTANCE.md)。title 原 VQA NEEDS_REVIEW／final Human playable acceptance pending 與既有 art release constraints 保持。

目標是將選定的 30–60 分鐘 slice 接成真正可玩的流程，驗證注意力 trade-off、人物互動與可見 consequence；不擴張成通用 model-checking 或新 production engine。詳細產品 gate 由 `ROADMAP.md` 定義。

---

# M1 Current Work

M0 已完成；本輪只處理 [M1 slice scope](docs/narrative/M1_GAMEPLAY_VALIDATION_SLICE.md) 需要的工程與驗證。

- [x] 準備 scene/dependency／production gap／playtest scope proposal；這不是已實作 playable slice。
- [x] COM-03X Narrative Design／Script Lock／獨立 Narrative QA PASS。
- [x] COM-03X 首批 narrative preview：三分支、舊完成存檔 Continue、姓名／state、reload／Memory isolation 已驗證；[公開試玩](https://7410c7f4.seventeen-floor-neighbor.pages.dev/) 綁定 PR #44 `d4ab4bd…`。[乾淨 Verify 656](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/37056543566) 172/172、deploy／deployed smoke PASS；Chromium 26 個案例已有原 23 + corrected 3/3 的通過證據。237 個既有 nonterminal nodes 與 COM-02X accepted media／canon 保持；歷史 shared route-binding stale 判定保留，本輪另做技術再審。原本地 169/172 失敗與 fixture 修正 10/10 紀錄不改寫。Human story review 已於 2026-10-02 PASS（Owner 試玩批准）；final art 與完整 30–60 分鐘 M1 slice pending；`validate:final` 仍依 preview art 拒絕。

- [x] COM-02J continuity contract／完整 locked script／獨立 QA（NQA-COM02J-008）通過；新劇情按 COM-02X → COM-02J → COM-03X 接入。舊 COM-03X 存檔可補讀並回到原進度；四張既有 Memory 與其媒體不改，新咖啡店 Memory rank 180。build／validate／smoke PASS，35 個 Chromium unique cases 有完整通過覆蓋；原 unit 195/199 與 4 個失敗的 focused PASS 證據保留，程式版本 `cb11e81…` 的 [Verify 668](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/37078425847) 201/201、deploy／deployed bytes smoke PASS；[公開試玩](https://070823e2.seventeen-floor-neighbor.pages.dev/)／[PR #47](https://github.com/TsungmingLiu/seventeen-floor-neighbor/pull/47)。見 [checkpoint](content/production/runs/com02j-m1-preview-20261002/ledger.json)。新 Human 劇情試玩／final art pending。

已交付入口以 ROADMAP §4／§10 為準：COM-03J／COM-03M／OPEN-A 第一 window 已整合，pending XT-04／JYC-05 尚未赴約，生活 outcomes 只完成第一 slot。C0 bounded consistency review 已於 2026-10-06 PASS（`REVIEW-M1-C0-FINAL-001`；source HEAD `1b7b7a1181a519a3ff13a01af110521ac7ffbcfb`）；舊 `0b48183…` 保留為來源比較基線。discovery／contact／exclusion annotations 已對齊 #71／ND-FEEDBACK-002，pending 邀約與已消耗生活 slot 分開。ROADMAP §10／[#76](https://github.com/TsungmingLiu/seventeen-floor-neighbor/issues/76) 四角色 34 canonical looks／68 refs 前置已完成，68 個 full／upper refs 已依獨立 fidelity PASS 啟用並保留原始裁切 provenance；下一步依 [#77](https://github.com/TsungmingLiu/seventeen-floor-neighbor/issues/77) C1 並行準備 XT-04／JYC-05 Narrative Design。 [#78](https://github.com/TsungmingLiu/seventeen-floor-neighbor/issues/78) 同步固定最小 pending／slot completion contract，整合前完成。changed declared sources 在實際下游使用時仍須 exact dependency／continuity checks 與必要 fresh full-scene Narrative QA；C0 不授予新 scene NQA、Human、pixel 或完整 M1 acceptance。詳細 coverage matrix 只留 #78。既有 NQA／Human／CI 保留 exact snapshot scope，不推定 current main 重跑或完整 slice acceptance。

## Gameplay Validation Slice integration

- [ ] 將 M1 選定的 30–60 分鐘 validation slice 接成真正 playable flow。
- [ ] 允許 incomplete art 使用 M0 placeholder contract。
- [ ] 保持 narrative integration 與 final CG production 解耦。

## Lightweight graph / state validation

先實作足夠支撐 M1 的最小版本：

- [x] unreachable node detection（既有 validator）
- [x] dangling target detection（既有 validator）
- [ ] impossible gate detection
- [ ] dead / invalid state detection
- [ ] obvious knowledge contradiction detection
- [ ] invalid transition detection

不要在沒有實際需求前擴張成通用 model-checking framework。

---

## Completed — M0 gate record

### 1. Repo-native visual asset migration

- [x] 完成 PR #21 的 visual asset migration 與舊 route 退役。
- [x] 確認 active runtime/build path 只有一套 canonical asset paradigm。
- [x] 保留仍有用途的 master / reference assets，且不讓歷史資料形成第二套 runtime authority。
- [x] 確認 story 仍只依賴 stable logical asset IDs，而不是 physical provider/path。

### 2. Missing-CG placeholder contract

- [x] 登記唯一的 preview-only WebP，並由現有 asset registry / validator 驗證其身分。
- [x] COM-02X 已以真實 Locked Scene／continuity contract 接入 Opening `narrative_preview`；四分支、Memory replay、Gallery 排除與 main Node 22 驗證有證據。
- [x] PR #39：COM-02X accepted-as-is BG／recognition／microwave／walk 已替換 preview bindings，不需修改 narrative node structure；同版本 `validate:final` 與公開 flow／reload／Gallery 有證據。
- [x] placeholder 狀態 machine-visible；現有 `validate:final` 不接受仍啟用 preview art 的 route。
- [x] `assets:coverage`／`validate:release` 區分 placeholder／provisional／accepted／unverified；release readiness 與 coverage clear 分開。既有 known issues 會阻擋嚴格 release coverage，不假造 QA 或 Human acceptance，見 [M0 coverage 與 Exit Gate review](docs/migration/M0_ASSET_COVERAGE.md)。

### 3. Narrative → visual stale dependency

M0 先以一個真實 scene 的受控修改，證明定點影響報告可供整合前判斷。多 task DAG 的自動阻擋與 checkpoint 恢復由下方 [Issue #27](https://github.com/TsungmingLiu/seventeen-floor-neighbor/issues/27) 另行處理。

- [x] 已在 `.ai/PRODUCTION_ORCHESTRATION.md` 定義 upstream narrative／visual 變更的失效範圍與 `no_visual_impact` 證據要求。
- [x] source scene/revision、entry spec/reference/output hashes 與 read-only impact／run reconciliation 已實作；證據範圍見索引及 `docs/migration/ISSUE16_INVALIDATION_GATE.md`。
- [x] COM-02X 當前 accepted-as-is 四張 runtime 圖的受控 material-change 驗證：contract 關係狀態變更使 scene visual descendants 失效，單張 CG 規格變更僅影響該 entry 下游。Node 22 focused 13/13，見 [當前 gate 證據](docs/migration/M0_CURRENT_SCENE_STALE_GATE.md)；11 個 pinned historical suites 仍僅作歷史回歸。
- [x] `production:integration:check` 重新取得來源／計算 machine-readable impact，以非零 exit code 拒絕 stale integration；實際串接的 build 未執行且無 `dist/` 產出。來源失敗移除舊 report；普通 build 不自動選擇 accepted baseline，Integrator 必須在 wiring/build 前呼叫。這不包含 Issue #27 的 DAG 自動失效／恢復。

### 4. Active source-authority cleanup

- [x] 完成 GitHub Issue #23：清理 active docs 中過期的 Google Drive `runtime-public` 描述（PR #21）。
- [x] `README.md`、`ROADMAP.md`、`ARCHITECTURE.md`、`.ai/WORKFLOW_MANIFEST.yaml` 與實際 runtime/build behavior 一致。
- [x] 區分 runtime asset、accepted master、generation reference 與 legacy/archive provenance。
- [x] 保留純歷史 archive；不讓它進入 active workflow。

### 5. M0 baseline verification

下列紀錄各自綁定 PR #37 或 PR #39 的驗證快照（版本／環境／job links 見相關 ledger），不推定每個新 main commit 已重跑全部檢查；後續 material change 再補跑受影響項目：

- [x] `npm run build`（PR #37 main Node 22 Verify）
- [x] `npm run validate`（PR #37 main Node 22 Verify；不是 `validate:final`）
- [x] `npm test`（PR #37 83/83；該 main Node 22 Verify 成功，含 pinned historical suites wrapper）
- [x] `git diff --check`（PR #37 main Verify；本次文件 diff 另查）
- [x] 必要 asset validation（PR #37 main Verify 26/26）
- [x] Opening 現有 CG 與 COM-02X placeholder 同一流程可玩（PR #37 main 遠端 Chromium acceptance；記錄 preview 階段，不推定 final visual acceptance）
- [x] 修正 Browser Acceptance checkout history，取得 [PR #37 main Node 22 遠端 Chromium acceptance](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36788149811)。
- [x] Cloudflare PR 自動 build／部署與公開試玩驗收；依 Owner 決定取代必要的 fresh Codespace acceptance。
- [x] PR #37 main [Cloudflare 部署後 smoke](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36788149966)成功；該 PR 公開 alias 的內容 bytes 與 7/7 browser 已核對，見 ledger。舊 HTTP 403 不作當前 blocker。
- [x] PR #37：江雨澄介紹前姓名、旁白／自白正體、玩家姓名 nametag，以及 title-screen Memory／CG 啟動時序修正。
- [x] PR #39：COM-02X BG／recognition／microwave／walk v3 accepted-as-is 整合；83 nodes／四 choices／文本/state／stable save IDs／Memory rank 160 保持；Node 22 104/104、Chromium 11/11 與固定 Cloudflare preview 的 bytes／forward flow／reload／Gallery PASS，見 [驗證決策](content/production/runs/com02x-visual-bindings-20261001/VERIFY-COM02X-VISUAL-BINDINGS-008.decision.json)。原 Visual QA FAIL／safe-zone NEEDS_REVIEW 不改寫。
- [x] COM-02X 最終 Human playable acceptance：2026-10-02 Owner 回報無可見問題，checkpoint 已為 `ACCEPTED`；見 [實際 Human receipt](content/production/runs/com02x-visual-bindings-20261001/HUMAN-COM02X-PLAYABLE-009.decision.json)。
- [x] COM-02X 當前 material-change／stale preflight → build 阻擋，以及 master／derivative／reference／Human decision 篡改與舊 report 清除 case（同上當前 gate 證據）。
- [x] PR #43 head `720843e…` 的 [Node 22 Verify run 624](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36966607788)：117/117 tests、build／validation、preview smoke、tracked-source integrity 及 Cloudflare deployment／deployed smoke PASS；該 head 當時尚未合併，不代表新 main 或 Human acceptance。

M0 已通過；歷史 PR #43 main `c5251cd…` Node 22 Verify 132/132、deployment／smoke PASS。詳見 [M0 foundation acceptance](docs/migration/M0_FOUNDATION_ACCEPTANCE.md)。

---

# Deferred Technical Backlog

以下事項仍然有效，但目前不是 `NOW`。

Roadmap milestone 到達相應階段後再重新確認 scope，不因為列在本文件中就自動執行。

## Issue #16 cross-stage workflow follow-up

**PR #21 已合併；按 [Issue #27](https://github.com/TsungmingLiu/seventeen-floor-neighbor/issues/27) 另行排期，不計入 PR #21 的驗收。**

- [ ] 以一個 multi-task scene DAG 驗證跨階段 artifact stale 決策、整合阻擋與空 session cache 的 checkpoint 恢復，維持 dialogue-only、visual-only、relationship/state 變更的精準失效範圍。
- [ ] 明確界定 visual beat 的機器 QA：只對 canonical 結構化 ID／binding 做存在、唯一性與依賴檢查；畫面是否表達劇情語意，仍由獨立 Visual QA 與 Human 驗收。
- [ ] 注入 stale integration、缺少 beat binding 與僅語意不符的候選畫面，記錄前兩者的機器阻擋與最後一者的人工審查邊界。

新 scene 的完整生產與 Locked Scene → runtime 效率實證另由 [Issue #26](https://github.com/TsungmingLiu/seventeen-floor-neighbor/issues/26) 追蹤。

## Opening demo UI follow-ups

較適合在 M1 playable validation 或 M3 polish 時重新評估：

- [ ] Choice node 的 `text: ""` 不顯示空 dialogue box。
- [ ] 調整 narrator 與 character 同框時的閱讀層級。
- [ ] 評估是否移除 choice 前的自動 `A/B/C` prefix。

若其中某項直接妨礙 M1 playtest，可提前提升為 M1 work。

---

## Cloud-complete / reproducibility

**預計 milestone：M4，除非更早成為 correctness blocker。**

既有方向保留：

- 驗證 source revision、required assets、hash/provenance 與 fresh rebuild 一致；
- 缺檔、canonical path/ref mismatch、decode failure 應 fail closed；
- 保留可重現 verification receipt。

實際方案必須依 M4 開始時的 asset architecture 重新確認，不沿用已過期 storage assumption。

---

## SFW / Full Build Profiles

**預計 milestone：M4；只有 release scope 確定需要時執行。**

若最終需要：

- build-time 真正 prune 不適用 nodes/assets/Memory/Gallery metadata；
- 禁止 dangling targets 與 profile leakage；
- SFW 必須保持自然 narrative continuity；
- 對各 profile 執行 clean build、graph、save/replay 與 browser regression。

不能只因舊設計中曾經規劃過，就視為 v1 必做功能。

---

## Review / Release

**預計 milestone：M4。**

可能包括：

- stable review URL 綁定 commit/profile；
- deterministic release build；
- release smoke；
- release receipt；
- hosting / CDN / cache；
- final production provider 決策。

等 Content Complete 後再依實際產品需求定案。

---

# Scaling Backlog

**預計 milestone：M2。**

只有 M1 Gameplay Validation 通過後才開始。

可能需要的 technical work：

- 擴張 graph/state traversal；
- batch integration validation；
- save/replay regression；
- knowledge/state consistency；
- stable persistent ID tooling；
- 大型 narrative graph 的 dependency validation。

不要為尚未存在的 3–4 女主規模提前重寫 runtime。

---

# Fixed Technical Gates

無論目前 milestone 為何，以下原則保持成立：

- 不刪除唯一安全 master。
- `dist/`、`generated/` 不作 source of truth。
- 不提交 secrets。
- 不 hardcode ephemeral Codespaces forwarded URL。
- Canonical engineering environment 以現行 architecture contract 為準；Human 試玩使用 Cloudflare PR preview，Codespaces 為可選工具。
- code/content integration 至少執行相應 build / validate / diff check。
- runtime/save 變更必須執行相應 regression tests。
- stable node / asset IDs 不應因 storage 或 presentation 改動任意重命名。
- archive / experiment 不自動恢復成 production authority。

---

# Task Placement Rule

新增 technical task 時：

**如果它直接影響目前 Roadmap Milestone 的 Exit Gate，放進 Current Milestone。**

否則：

- 下一 milestone 必須處理 → `NEXT`
- 已知之後有價值 → Deferred / 對應 milestone
- 純假想未來需求 → 不加入 active TODO，必要時記 GitHub Issue / Icebox

`TODO.md` 的長度不應隨所有未來想法無限制增加。
