# Technical TODO

> CANONICAL technical execution board。更新：2026-09-25。
>
> 已完成的 W1–W4 狀態在 `PROJECT_STATE.md`；已實作的 code/data contract 在 `ARCHITECTURE.zh-TW.md`。劇情、美術與 scene 進度在 `docs/narrative/CONTENT_PRODUCTION_TODO.md`。本檔只追未完成的技術工作與驗收 gate。

## 下一個交會點：Opening Vertical Slice

- [ ] 依 `docs/narrative/CONTENT_PRODUCTION_TODO.md` 完成下一批 locked scene、Narrative/Visual Continuity、CG manifest、Visual QA 與 accepted asset ingest。
- [ ] 以 accepted outputs 更新 route nodes、`assetIds`、asset manifest/recipe/source map、Memory Events 與 ingest receipt；保持 stable IDs。
- [ ] 在 fresh Codespace clean build/validate/test/preview，跑 browser 主流程；Human 檢查 pacing、角色 voice、CG continuity、UI safe zones 後接受 playable slice。
- [ ] 用第一個 net-new scene 試用 `.ai/PRODUCTION_ORCHESTRATION.md` 的 DAG / Task Packet / Handoff / ledger contract，記錄 fresh worker dispatch、reconciliation 與返工原因；不要擴張成 orchestration engine。

## Opening demo UI follow-ups

以下是獨立 UI 改善；未在 content-production refactor 實作：

- [ ] Choice node 的 `text: ""` 不顯示空 dialogue box（COM-01X、COM-01J 可重現）。
- [ ] 調整 narrator 與 character 同框時的閱讀層級。
- [ ] 評估移除 choice 前的自動 `A/B/C` prefix。

## W5 — Cloud-complete Verification

- [ ] 定義一次性驗證：GitHub commit、每個 accepted master 的 canonical storage/provenance、每個 required runtime object 的 provider/bytes/SHA-256、fresh Codespace clean rebuild 必須對得上。
- [ ] 缺檔、hash mismatch、未 full-decode 或只存在單一本機的 accepted master 應 fail closed。
- [ ] 保留驗證 receipt；`checkpoint` 若作命令名稱，只代表 verification/provenance，不代表本機同步。

## W6 — SFW / Full Build Profiles

- [ ] Build 時實際 prune profile 不適用的 nodes、assets、Memory/Gallery metadata；禁止 dangling targets 和 profile leakage。
- [ ] SFW 保有自然的劇情連續性；不能只在 UI 隱藏 mature content。
- [ ] 對兩種 profile 做 clean build、schema/graph/media、save/replay 與 browser regression。

## W7 — Review / Release

- [ ] 穩定 review URL 綁定明確 commit 與 profile；preview 與 release 分開。
- [ ] 提供 deterministic release command/workflow、smoke 與 release receipt。

## 之後：內容規模化

- [ ] Opening Vertical Slice 完整 loop 被接受後，再跑至少 1–2 個跨許棠／江雨澄的 bounded production batches。
- [ ] 當 scene/story schema、Memory metadata、asset IDs、Task Packet 與 QA gate 已穩定，再決定 Content Factory MVP 的最小 automation scope。
- [ ] 將 3–4 女主規模的壓力測試建立在實際 bottleneck 上；不要預先為未知複雜度改寫引擎。

## 固定 gate

- 不刪除唯一安全 master；`dist/`、`generated/` 不作 source of truth。
- 不提交 secrets，不 hardcode Codespaces forwarded URL。
- 開發以 Codespaces 為 canonical；code/content integration 至少跑 build、validate、diff check，runtime/save 變更再跑 tests。
- Human 保留 major story direction、角色設計、關鍵 CG acceptance 與 final playable acceptance。Reference acquisition 可依 execution adapter 自動化，但 image pixels、role 與 provenance 必須可驗證。
