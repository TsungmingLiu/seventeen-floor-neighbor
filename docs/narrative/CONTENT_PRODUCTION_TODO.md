# Content Production TODO

> Lifecycle: **CANONICAL** creative-production backlog
>
> Version: 1.0.0
>
> Updated: 2026-09-25

這份文件只記 production progress、review gate 與 blocker。它不複製 scene spec、CG prompt 或 operator instructions。

完整 request 由 Production Coordinator 依 `.ai/PRODUCTION_ORCHESTRATION.md` 建 Task Packet；fresh worker 先讀 `.ai/WORKFLOW_MANIFEST.yaml` 與該 packet。不得把本 backlog 當成 source bundle。

## Current objective

穩定 `Narrative Design → Scene/Dialogue → Visual Production → Runtime Integration` 單一路徑。當前 priority 是降低 CG 的返工成本，同時保護 story pacing、character voice 與跨 scene continuity。

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

- [ ] Human review Opening Chapter 1 migration artifacts for schema usability（machine migration/validation complete）。
- [ ] 在一個新 scene 上測試 `Content Writer → CG Planner → Render Packet`，避免只靠 migration fixture 證明流程。
- [ ] 以獨立 scope 處理 COM01J provisional wardrobe drift。
- [ ] 繼續 `COM-02X → COM-02J → COM-03X → COM-03J → COM-03M`，每次只處理一個 bounded scene/batch。
- [ ] Vertical Slice 穩定後再進 `XT-04 / JYC-05 / JYC-06 / SH-01`。

## Explicit non-goals

- 不建立 orchestration engine、automatic retry 或 image scoring。
- 不做 W5、new UI、character reference system redesign。
- 不維護 Chat/Work/API 三套 creative prompt。
- 不從 archive/experiment 重新啟動 sprite-first 或 9:16 pipeline。

舊 S1–S12 board、copy-paste prompts 與 demo operator text 已保存於 `docs/archive/narrative/CONTENT_PRODUCTION_TODO_v0.3.md`，只作歷史紀錄。
