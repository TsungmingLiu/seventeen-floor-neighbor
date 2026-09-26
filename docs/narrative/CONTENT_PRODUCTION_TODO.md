# Content Production TODO

> Lifecycle: **CANONICAL** creative-production backlog
>
> Version: 1.1.0
>
> Updated: 2026-09-26

這份文件只記 production progress、review gate 與 blocker。它不複製 scene spec、CG prompt 或 operator instructions。

完整 request 由 Production Coordinator 依 `.ai/PRODUCTION_ORCHESTRATION.md` 建 Task Packet；fresh worker 先讀 `.ai/WORKFLOW_MANIFEST.yaml` 與該 packet。不得把本 backlog 當成 source bundle。

## Current objective

穩定 `Narrative Design → Scene/Dialogue → Visual Production → Runtime Integration` 單一路徑，同時允許 **narrative production 主動跑在 visual production 前面**。當前 priority 是先把完整 braided route 做到可逐 scene authoring / narrative QA，不讓缺少 CG 阻塞後續劇情設計與對白生產；CG 在 locked narrative 穩定後再按批次補齊。

## Opening Vertical Slice

| Scene | Script/state | Playable demo | Canonical art completeness | Next review |
| --- | --- | --- | --- | --- |
| `COM-00` | locked + continuity contract | integrated | demo-minimal accepted + manifest-bound | Human schema/usability review |
| `COM-01X` | locked + continuity contract | integrated | base/reaction family manifest-bound | Human schema/usability review |
| `COM-01J` | locked + continuity contract | integrated | provisional wardrobe drift recorded in manifest | repair art only in later scoped task |
| `COM-02X` | locked | not in Chapter 1 demo | partial | future production batch |
| `COM-02J` | locked | not in Chapter 1 demo | partial | future production batch |
| `COM-03X` | S1 candidate | not integrated | not art-locked | Human narrative review before art |

## Production gates

每個 scene 依序通過：

1. `Narrative Contract`：scene function、entry/exit relationship state、information gain、required payoff、`must_not`。
2. `Locked Scene`：dialogue、choice intent、state mutation、semantic visual beats。
3. `Narrative QA`：character voice、pacing、knowledge、relationship progression、branch/rejoin consistency。
4. `Canonical CG Manifest`：render-ready entries + `Visual Continuity State`。
5. `Render Packet`：由 deterministic projection 產生；Chat manual / Work batch / API 共用內容。
6. `Visual QA`：identity、continuity、story beat、composition、reference provenance。
7. `Runtime Integration`：stable asset/node IDs、Memory Events、build/validate/tests。
8. `Playable Review`：pacing、choice readability、visual continuity、Human acceptance。

前一 gate 未通過時，後一 gate 不得自行補寫缺失的 creative decision。

## Next production work after this refactor

- [x] 將雙女主 macro outline 展開成 canonical detailed pre-script blueprints：common/shared、Xu、JYC、overlap/endings。
- [ ] Human review Opening Chapter 1 migration artifacts for schema usability（machine migration/validation complete）。
- [ ] 依 `docs/narrative/route-blueprints/` 從剩餘 common scenes 開始批量推進 `Narrative Design → Scene/Dialogue → Narrative QA`；**不要等待 CG 完成才寫下一個 scene**。
- [ ] 接著完成 Xu early/mid route（XT-04 → XT-12）與 JYC early/mid route（JYC-05 → JYC-12）的 Locked Scene / dialogue batch。
- [ ] 再完成 COMMIT / honest-overlap / deception / DECIDE / late lock / ending / coda 的 script batch。
- [ ] Narrative batch 穩定後，再以 approved Locked Scene 分批進 `CG Planner → Render Packet → Render / Visual QA`；缺少 CG 不應反向改寫 narrative。
- [ ] 以獨立 scope 處理 COM01J provisional wardrobe drift。

## Explicit non-goals

- 不建立 orchestration engine、automatic retry 或 image scoring。
- 不做 W5、new UI、character reference system redesign。
- 不維護 Chat/Work/API 三套 creative prompt。
- 不從 archive/experiment 重新啟動 sprite-first 或 9:16 pipeline。

舊 S1–S12 board、copy-paste prompts 與 demo operator text 已保存於 `docs/archive/narrative/CONTENT_PRODUCTION_TODO_v0.3.md`，只作歷史紀錄。
