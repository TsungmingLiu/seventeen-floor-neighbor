# Project Roadmap

> 本文件定義專案的產品與工程里程碑，以及目前應該優先完成的工作。
>
> 詳細技術工作見 `TODO.md`；內容生產進度見 `docs/narrative/CONTENT_PRODUCTION_TODO.md`；AI production 執行方式見 `.ai/WORKFLOW_MANIFEST.yaml`。
>
> 目前版本與有效／歷史證據見 [目前可玩版本驗收證據索引](docs/migration/CURRENT_PLAYABLE_ACCEPTANCE.md)（2026-09-30 main `9b0066f…`）；本次對齊不代表 M0 完成。
>
> Roadmap 不追蹤每一個 task。它只回答三個問題：
>
> 1. 我們現在在哪裡？
> 2. 下一個可驗證的產品成果是什麼？
> 3. 什麼條件達成後，才應該往下一階段走？

---

## 1. Product North Star

做出一款以都市成年人關係為核心的戀愛視覺小說：

- 玩家不是一開始就選定攻略角色；
- 前中期可以同時認識並接近不同角色；
- 玩家分配的是時間、注意力與誠實程度；
- choice 的重點是人物理解與 trade-off，而不是猜「標準答案」；
- 劇情、CG 與程式可以異步生產，但遊戲始終保持可玩；
- 最終內容規模建立在已被 playtest 驗證的玩法上。

---

# 2. Milestone Overview

| Milestone | 核心成果 | Exit Gate | 狀態 |
| --- | --- | --- | --- |
| **M0 — Foundation Stable** | 建立穩定、單一的 production / asset baseline | migration 完成，placeholder / stale dependency / build contract 穩定 | **NOW** |
| **M1 — Gameplay Validation** | 完成 30–60 分鐘可驗證核心戀愛玩法的 playable slice | 外部 playtest 證明核心 loop 基本成立 | **NEXT** |
| **M2 — Narrative Alpha** | 從遊戲開始到主要 endings 全部 playable | 主 narrative graph、state、save/replay 可 end-to-end 運作 | **LATER** |
| **M3 — Content Complete** | 劇情基本 freeze，正式視覺與內容覆蓋接近完整 | 無必要 placeholder，主要內容通過完整 playtest | **LATER** |
| **M4 — Release Candidate** | 得到可以公開發佈的候選版本 | release / device / performance / build QA 全部通過 | **LATER** |

---

# 3. M0 — Foundation Stable

**狀態：NOW**

## 已驗證的基線

- W1–W4 的 source/output、嚴格 asset check/build、Codespaces 開發與驗收，以及 Player UI、Memories、CG Gallery、journey v2 / v1 save migration 已實作；實際契約見 [`ARCHITECTURE.md`](ARCHITECTURE.md) 與 code/tests。
- PR #21 已將 active runtime 圖片遷至 repo，退役舊 `xu-tang` playable route；目前只有 `opening-demo` 註冊為 playable route。資產逐項 hash 與歷史對照見 `docs/migration/GATE2_REPO_RUNTIME_ASSETS.md`，現行檔案與使用範圍以 asset registry、route 與 build 為準。
- PR #33 已將 COM-02X 接入 Opening 可玩流程，使用已登記的 preview-only WebP；Memory 可重播，預覽圖不進 Gallery，既有敘事／POV／姓名輸入批准沿用。其餘 scene progress 由 `docs/narrative/CONTENT_PRODUCTION_TODO.md` 維護。
- main `9b0066f…` 的 Node 22 Verify（82/82）與 Cloudflare deployment／部署時 smoke 已查證；同一 runtime 的本地 Chromium 5/5 receipt 可沿用。遠端 Browser Acceptance 在 shallow checkout 缺歷史 commit 的前置測試失敗、Chromium skipped；目前 alias 可達性與 fresh Codespace 尚未查證。來源與限制見驗收證據索引。
- 定點 read-only impact／provenance 已實作，有 pinned 歷史受控檢查；目前 scene 的 material-change／實際整合阻擋證據與 preview → final CG 替換實證仍待補齊。既有工具契約見 `ARCHITECTURE.md`、`.ai/WORKFLOW_MANIFEST.yaml` 與對應工具；此基線不代表 M0 Exit Gate 已完成。

## Outcome

建立一個可信任的 `main` baseline。

完成後：

- Narrative 可以先於 CG 開發；
- 缺 CG 不會阻塞 playable integration；
- 正式 CG 補上後不需要改寫 narrative/runtime 結構；
- visual asset 只有一套 active production/runtime paradigm；
- 上游內容修改時，指定 scene 的 visual artifact 會在整合前接受明確的 stale 影響檢查。

## Scope

M0 只處理目前已經開始的 production / asset architecture 收尾工作：

- 完成 repo-native visual asset migration；
- 建立 canonical placeholder asset contract；
- 區分 placeholder / provisional / accepted / release-ready；
- 以真實 scene 驗證 narrative → visual 的定點 stale detection 與整合前檢查；跨階段自動阻擋／恢復另由 [Issue #27](https://github.com/TsungmingLiu/seventeen-floor-neighbor/issues/27) 追蹤；
- 清理 active source-of-truth 文件中的過期 asset/storage 描述；
- 保持 build、validate、tests、fresh playable acceptance 通過。

## Exit Criteria

M0 完成時必須滿足：

- 有 accepted CG 的 scene 正常使用正式 asset；
- 沒有 CG 的 Locked Scene 可以使用 canonical placeholder 並正常遊玩；
- placeholder 不可能被誤認為 release-complete asset；
- 對一個真實 scene 的受控修改，機器可讀報告能指出相關 visual artifact 是否 stale，並作為該輪整合前的檢查依據；
- active docs、source map、runtime 與 build 行為描述一致；
- 不再存在兩套互相競爭的 active asset/runtime production path；
- `main` 通過相關 build、validation、tests 與 fresh playable acceptance。

## Not Now

M0 不做：

- 大批 narrative scene；
- bulk final CG；
- 新 gameplay system；
- production orchestration engine；
- automatic image scoring / retry；
- speculative scale optimization；
- 與目前 migration 無直接關係的 release engineering。

**M0 通過後，停止繼續擴張 production framework。**

---

# 4. M1 — Gameplay Validation

**狀態：NEXT**

## Outcome

完成一個約 **30–60 分鐘**的 Gameplay Validation Slice，第一次真正驗證：

**這款遊戲是否好玩，而不只是 production pipeline 是否能運作。**

## Slice 必須涵蓋

至少包含：

- 玩家與許棠、江雨澄都有實質互動；
- 一次 attention allocation / open dating 選擇；
- 每位女主至少一個 major interaction；
- 一次 crossover / shared-awareness scene；
- 一次 relationship friction；
- 一次 repair opportunity；
- 一次對關係或注意力具有實質影響的 decision。

Final CG 不是前置條件。

缺少美術的場景正常使用 M0 建立的 placeholder。

## 驗證重點

這個 milestone 要回答：

- 玩家是在做自己想做的決定，還是在猜正確答案？
- choice 是否有 trade-off？
- 許棠與江雨澄是否因具體人格而產生不同吸引力？
- 角色是否有超出核心心理主題之外的生活感？
- 男主是否具有自己的需求、缺點與人生方向？
- attention allocation 是否真的讓玩家感到自己的選擇改變了關係？
- crossover 是否產生自然 tension？
- conflict / repair 是否像真實人際互動？
- 玩家玩完之後是否想繼續？

## Engineering Scope

只增加支撐這個 playable slice 所必須的工程能力。

優先考慮最低限度的 graph/state validation：

- unreachable node；
- dangling target；
- impossible gate；
- dead / invalid state；
- knowledge contradiction；
- invalid transition。

不要提前做完整 model-checking framework。

## Exit Criteria

至少讓數名沒有閱讀專案 spec 的玩家完整 playtest。

完成後應能回答：

- 玩家最記得哪些 scene？
- 哪裡開始失去興趣？
- 哪些 choice 太像標準答案？
- 玩家具體喜歡／不喜歡兩位女主的什麼？
- 哪些 consequence 有感？
- 哪些 consequence 看不懂？
- 玩家是否想繼續？

如果核心玩法存在重大問題，在進入 M2 前修正。

---

# 5. M2 — Narrative Alpha

**狀態：LATER**

## Outcome

把 M1 已驗證的設計擴張成完整可玩的主要 narrative。

玩家可以從 Start 一路走到主要 relationship-resolution endings。

Final CG 可以落後，但 playable integration 不應長期落後 Narrative 太遠。

## Content Scope

完成主要故事骨架：

- Common introduction；
- Open Dating / attention phases；
- Xu early / mid route；
- Jiang Yucheng early / mid route；
- braided / crossover scenes；
- heroine conflicts；
- repair；
- commitment / overlap；
- late route lock；
- Good / Friend / Distance；
- 必要 coda。

## Production Strategy

使用 bounded playable batches，而不是整條 route 寫完才 integration。

每個 batch 應完成：

1. Narrative；
2. Narrative QA；
3. Runtime integration；
4. Playable review；
5. Correction；
6. 視需要進入 visual production。

Narrative 可以領先 Final Art。

Narrative 不應長期大幅領先 Playable Build。

## Engineering Scope

只根據實際規模增加能力：

- state / graph traversal；
- knowledge consistency；
- batch integration validation；
- save / replay regression；
- stable persistent IDs；
- dependency invalidation。

不為假想的 3–4 女主規模提前重寫引擎。

## Exit Criteria

M2 完成時：

- Start →主要 endings 全部 playable；
- 主要 branch 可以正常抵達；
- conflict / repair / commitment logic 完整；
- state progression 基本穩定；
- save / replay semantics 可支撐主要流程；
- remaining placeholder 都是已知且刻意存在；
- major narrative structure 足夠穩定，可以進入 freeze。

此版本稱為：

**Narrative Alpha**

---

# 6. M3 — Content Complete

**狀態：LATER**

## Outcome

將 Narrative Alpha 轉成內容基本完整、主要結構 freeze 的版本。

從這個 milestone 開始，大量投資 final art 與 polish 才具有較低返工風險。

## Scope

主要包括：

- final CG coverage；
- 高價值 reaction / event CG；
- visual continuity repair；
- dialogue polish；
- pacing polish；
- Memories / Gallery polish；
- 必要 UI/UX polish；
- 如果確定納入 v1，再完成 audio / music；
- 完整 route playtest；
- 刪除、壓縮或重寫低價值 scene。

Final CG investment 依照：

- 情緒價值；
- 敘事價值；
- 收藏價值；
- replay value；

排序，而不是每個 scene 平均配置。

## Exit Criteria

M3 完成時：

- major narrative 基本 freeze；
- 沒有影響完整體驗的必要 placeholder；
- final visual coverage 達到產品要求；
- route pacing 經過完整 playtest；
- 主要 UI / Memories / Gallery 體驗穩定；
- 不再預期大幅修改核心玩法或 narrative architecture。

此版本可以視為：

**Content Complete Beta**

---

# 7. M4 — Release Candidate

**狀態：LATER**

## Outcome

將 Content Complete Beta 轉成可公開發佈的 Release Candidate。

這個 milestone 只處理產品化、可靠性與 release readiness。

## Scope

視最終 release 需求完成：

- mobile / browser performance；
- asset loading / preload / caching；
- final save migration；
- clean/reproducible build；
- review / release workflow；
- hosting / CDN；
- device/browser regression；
- release smoke tests；
- 如果產品確實需要，再完成 SFW / Full profiles；
- 最終 external playtest。

W5 / W6 / W7 等既有 technical proposal 必須以 M4 開始時真正存在的 architecture 重新評估，不因舊 TODO 已存在就自動執行。

## Exit Criteria

Release Candidate 必須：

- 沒有非預期 placeholder；
- 沒有 stale production artifact；
- 主要 narrative paths 完整；
- final asset coverage 完整；
- technical/content validation 通過；
- target device performance 可接受；
- external playtest 完成；
- 可以從明確 source revision reproducibly build；
- 可以穩定 deploy。

---

# 8. Backlog Horizons

Roadmap 只維護工作所在的 horizon，不維護完整 task list。

## NOW

只包含直接幫助 **M0 Exit Gate** 的工作。

目前尚需：

- COM-02X 已證明真實 Locked Scene 可使用 placeholder 遊玩；尚需正式 CG 替換與 stable node/save/Memory/Gallery 驗證；
- 沿用已實作的定點 impact／provenance，補目前 scene 受控 material change 與實際整合阻擋的證據；
- 修正 Browser Acceptance 的 checkout history 並取得 Node 22 Chromium 結果；另補 fresh Codespace 與 alias 可達性證據。現有 main Verify／部署 smoke 與人工敘事批准直接引用，不重跑已驗證的敘事 QA。

Repo-native asset migration 與 active source-authority cleanup 已由 PR #21 完成；跨階段自動失效與恢復另列未來工作。

## NEXT

M1 Gameplay Validation Slice 所需工作。

例如：

- Validation Slice 的具體 scene 範圍；
- 最低限度 state traversal；
- playtest 設計與紀錄方式。

## LATER

M2–M4 已知但目前不應執行的工作。

例如：

- full narrative production；
- bulk CG production；
- final UI polish；
- performance optimization；
- release engineering。

## ICEBOX

目前沒有足夠實際需求支持的項目。

例如：

- 更多 heroine；
- achievements；
- 通用 Content Factory；
- 全自動 orchestration；
- 複雜 scoring / retry system；
- 其他建立在未來假設規模上的 framework。

---

# 9. Roadmap Rules

1. 同一時間只有一個 Active Milestone。
2. 新發現的問題不會自動進入 `NOW`。
3. 只有直接影響目前 Exit Gate 的工作才能插入 current scope。
4. 下一 Milestone 的工作可以準備，但不能搶占 current critical path。
5. Roadmap 追蹤 outcome，不追蹤每個 implementation task。
6. GitHub Issues、`TODO.md`、Content TODO 負責具體執行項目。
7. Milestone Exit Gate 通過後，才正式切換下一 Milestone。
8. 不因為某個 future feature 已經寫進 spec，就代表現在必須實作。

---

# 10. Current Position

**Active Milestone**

M0 — Foundation Stable

**Current Goal**

在已合併的 repo-native asset / workflow baseline 上，驗證 Narrative-first、Art-later 的 playable gate。

**Current Critical Path**

```text
COM-02X placeholder integration proved; final CG replacement proof pending
→ current material-change / stale integration evidence
→ Node 22 remote Chromium / fresh Codespace evidence
→ M0 Exit Gate review
```

**Next Milestone**

M1 — Gameplay Validation

M0 通過後，優先製作並 playtest Gameplay Validation Slice，而不是立即全面擴張 narrative 或 CG production。
