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

## M0 — Foundation Stable

目前唯一 active technical milestone。

目標不是繼續擴張 architecture；PR #21 的 repo-native asset / workflow migration 已合併，接下來驗證 Narrative-first、Art-later playable baseline 的其餘 Exit Gates。

詳細產品定義與 Exit Gate 見 `ROADMAP.md`。

2026-09-30 最新 main 基線為 `f5e650b…`（PR #37）；最新敘事／UI／Human 品質 PASS 見 [PR #37 ledger](content/production/runs/pr37-review-fixes-20260930/ledger.json)。[舊驗收證據索引](docs/migration/CURRENT_PLAYABLE_ACCEPTANCE.md)僅記 `9b0066f…` 的歷史結果。下列勾選只代表指定項目有證據，不代表全部 M0 Exit Gate 通過；已批准的敘事直接沿用。

---

## M0 Critical Path

### 1. Repo-native visual asset migration

- [x] 完成 PR #21 的 visual asset migration 與舊 route 退役。
- [x] 確認 active runtime/build path 只有一套 canonical asset paradigm。
- [x] 保留仍有用途的 master / reference assets，且不讓歷史資料形成第二套 runtime authority。
- [x] 確認 story 仍只依賴 stable logical asset IDs，而不是 physical provider/path。

### 2. Missing-CG placeholder contract

- [x] 登記唯一的 preview-only WebP，並由現有 asset registry / validator 驗證其身分。
- [x] COM-02X 已以真實 Locked Scene／continuity contract 接入 Opening `narrative_preview`；四分支、Memory replay、Gallery 排除與 main Node 22 驗證有證據。
- [ ] final CG 補上後，不需要修改 narrative node structure。
- [x] placeholder 狀態 machine-visible；現有 `validate:final` 不接受仍啟用 preview art 的 route。
- [ ] release-oriented validation 能區分 placeholder / provisional / accepted coverage。

### 3. Narrative → visual stale dependency

M0 先以一個真實 scene 的受控修改，證明定點影響報告可供整合前判斷。多 task DAG 的自動阻擋與 checkpoint 恢復由下方 [Issue #27](https://github.com/TsungmingLiu/seventeen-floor-neighbor/issues/27) 另行處理。

- [x] 已在 `.ai/PRODUCTION_ORCHESTRATION.md` 定義 upstream narrative／visual 變更的失效範圍與 `no_visual_impact` 證據要求。
- [x] source scene/revision、entry spec/reference/output hashes 與 read-only impact／run reconciliation 已實作；證據範圍見索引及 `docs/migration/ISSUE16_INVALIDATION_GATE.md`。
- [ ] 補目前 scene 的受控 material-change 驗證：舊 visual artifact 不可被當作 current。既有受控 gate／11 個 pinned historical suites 僅作歷史回歸證據。
- [ ] 補該輪整合前的 machine-readable stale report 與停止使用失效 visual artifact 的實證；read-only report 不等於自動 integration blocking。

### 4. Active source-authority cleanup

- [x] 完成 GitHub Issue #23：清理 active docs 中過期的 Google Drive `runtime-public` 描述（PR #21）。
- [x] `README.md`、`ROADMAP.md`、`ARCHITECTURE.md`、`.ai/WORKFLOW_MANIFEST.yaml` 與實際 runtime/build behavior 一致。
- [x] 區分 runtime asset、accepted master、generation reference 與 legacy/archive provenance。
- [x] 保留純歷史 archive；不讓它進入 active workflow。

### 5. M0 baseline verification

目前 main 的已驗證快照（詳細版本／環境／job links 見索引）；後續 material change 再補跑受影響項目：

- [x] `npm run build`（main Node 22 Verify）
- [x] `npm run validate`（main Node 22 Verify；不是 `validate:final`）
- [x] `npm test`（PR #37 83/83；最新 main Node 22 Verify 成功，含 pinned historical suites wrapper）
- [x] `git diff --check`（main Verify；本次文件 diff 另查）
- [x] 必要 asset validation（main Verify 26/26）
- [x] Opening 現有 CG 與 COM-02X placeholder 同一流程可玩（最新 main 遠端 Chromium acceptance；不推定 final visual acceptance）
- [x] 修正 Browser Acceptance checkout history，取得 [main Node 22 遠端 Chromium acceptance](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36788149811)。
- [x] Cloudflare PR 自動 build／部署與公開試玩驗收；依 Owner 決定取代必要的 fresh Codespace acceptance。
- [x] 最新 main [Cloudflare 部署後 smoke](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36788149966)成功；PR #37 公開 alias 的內容 bytes 與 7/7 browser 已核對，見 ledger。舊 HTTP 403 不作當前 blocker。
- [x] PR #37：江雨澄介紹前姓名、旁白／自白正體、玩家姓名 nametag，以及 title-screen Memory／CG 啟動時序修正。
- [ ] COM-02X accepted final CG 替換後的 stable nodes／save／Memory／Gallery／`validate:final` 證據
- [ ] 當前 scene material-change 與實際 stale integration blocking case

全部通過後，依 `ROADMAP.md` 判定 M0 是否可以結束。

---

# NEXT — M1 Gameplay Validation 技術準備

以下工作屬於下一個 milestone。

在 M0 Exit Gate 通過前，不應搶占目前 critical path。

## Gameplay Validation Slice integration

- [ ] 將 M1 選定的 30–60 分鐘 validation slice 接成真正 playable flow。
- [ ] 允許 incomplete art 使用 M0 placeholder contract。
- [ ] 保持 narrative integration 與 final CG production 解耦。

## Lightweight graph / state validation

先實作足夠支撐 M1 的最小版本：

- [ ] unreachable node detection
- [ ] dangling target detection
- [ ] impossible gate detection
- [ ] dead / invalid state detection
- [ ] obvious knowledge contradiction detection
- [ ] invalid transition detection

不要在沒有實際需求前擴張成通用 model-checking framework。

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
- 缺檔、hash mismatch、decode failure 應 fail closed；
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
