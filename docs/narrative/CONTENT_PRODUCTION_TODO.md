# Content Production TODO

> Lifecycle: **CANONICAL** creative-production backlog
>
> Version: 1.3.3
>
> Updated: 2026-10-02

這份文件只記 production progress、review gate 與 blocker。它不複製 scene spec、CG prompt 或 operator instructions。

完整 request 由 Production Coordinator 依 `.ai/PRODUCTION_ORCHESTRATION.md` 建 Task Packet；fresh worker 先讀 `.ai/WORKFLOW_MANIFEST.yaml` 與該 packet。不得把本 backlog 當成 source bundle。

## Current objective

當前 milestone 為 **M1 Gameplay Validation**。M0 foundation 已由 merged-main checks 與實際 Human playable acceptance 完成，見 [M0 收尾](../migration/M0_FOUNDATION_ACCEPTANCE.md)。優先將 [M1 slice scope proposal](M1_GAMEPLAY_VALIDATION_SLICE.md) 的 scene/state dependencies 轉成有界 Narrative Design → Dialogue → QA → text-first playable integration；缺少 CG 不阻塞敘事，不能宣稱尚未製作的 slice 已可玩或已達 30–60 分鐘。

## Opening Vertical Slice

最新 main 為 `c5251cd…`（PR #43）；Node 22 main Verify 132/132、Cloudflare deployment／smoke PASS。COM-02X 的八個 runtime outputs 與原 `ba5f832…` checkpoint 相同，[HUMAN-COM02X-PLAYABLE-009](../../content/production/runs/com02x-visual-bindings-20261001/HUMAN-COM02X-PLAYABLE-009.decision.json) 記錄 Owner「我測了可玩性，沒有可見問題」，existing checkpoint 現為 `ACCEPTED`。原 PR #33／#37 敘事與 UI 批准沿用；provisional／獨立 Visual QA FAIL／safe-zone NEEDS_REVIEW 保持，未記錄的 final visual scope 另行追蹤。

| Scene | Script/state | Playable demo | Canonical art completeness | Next review |
| --- | --- | --- | --- | --- |
| `COM-00` | locked + continuity contract; PR #37 approved long dialogue; Human preview quality PASS | integrated; stable node/save IDs preserved | demo-minimal accepted + manifest-bound | final visual acceptance 獨立追蹤 |
| `COM-01X` | locked + continuity contract; PR #33 narrative/POV accepted | integrated | base/reaction family manifest-bound | 未記錄的 schema/usability／visual scope 獨立追蹤 |
| `COM-01B` | locked + continuity contract; PR #33 accepted; PR #37 removes premature Jiang name | integrated bridge; 同屬 elevator Memory | existing runtime CG; production manifest entries `render_ready` | 後續 production visual gate 獨立追蹤 |
| `COM-01J` | locked + continuity contract; PR #33 accepted; PR #37 first-sight naming corrected | integrated | provisional wardrobe drift recorded in manifest | repair art only in later scoped task |
| `COM-02X` | locked + continuity contract; PR #33 narrative/POV accepted | PR #39 integrated BG／recognition／microwave／walk v3; forward flow／reload／Gallery verified; Memory rank 160、可 replay | exact Human accepted-as-is masters registered; original per-image VQA FAIL／safe-zone NEEDS_REVIEW preserved | Human playable acceptance recorded; original art/QA caveats remain |
| `COM-02J` | locked | not in Chapter 1 demo | partial | future production batch |
| `COM-03X` | S1 candidate | not integrated | not art-locked | Human narrative review before art |

## Production gates

每個 scene 的共同依賴與兩個驗收點：

1. `Narrative Contract`：scene function、entry/exit relationship state、information gain、required payoff、`must_not`。
2. `Locked Scene`：dialogue、choice intent、state mutation、semantic visual beats。
3. `Narrative QA`：character voice、pacing、knowledge、relationship progression、branch/rejoin consistency。
4. 可選 `Narrative Preview`：以已登記背景或明示 preview-only WebP 接入 runtime，驗證 branch/state/save/Memory，供 Human 審閱劇情；這一點不等於視覺完工。
5. `Canonical CG Manifest`：以已批准 Locked Scene 為輸入，產生 render-ready entries + `Visual Continuity State`。
6. `Render Packet`：由 deterministic projection 產生；Chat manual / Work batch / API 共用內容。
7. `Visual QA`：identity、continuity、story beat、composition、reference provenance。
8. `Final Runtime Integration`：以 accepted CG 替換預覽畫面，保留 stable node/asset IDs，驗證 Gallery/Memory/build/tests 與 `npm run validate:final`。
9. `Playable Review`：pacing、choice readability、visual continuity、Human final acceptance。

Narrative Preview 與視覺分支都依賴 Narrative QA；任一分支不可自行補寫上游 creative decision。CG 尚未完成時，仍可開始下一個 scene 的劇本工作。

## Production backlog（依 ROADMAP milestone 排序）

- [x] 將雙女主 macro outline 展開成 canonical detailed pre-script blueprints：common/shared、Xu、JYC、overlap/endings。
- [x] COM-02X 已接入 Opening Chapter 1 敘事預覽，四分支匯流、Memory／Gallery 契約與 build/tests 有有效證據；敘事接受沿用 PR #33。
- [x] PR #37 已接入批准的 COM-00 長段對白及姓名／UI 修正；Human 已給敘事預覽品質 PASS。限定用途的兩份批准示例保留，原始候選／回饋／重複快照由 Git 歷史追溯。
- [x] PR #39：COM-02X BG／recognition／microwave／walk v3 accepted-as-is masters 接入正式 runtime；83 nodes／四 choices／文本/state／stable save IDs／Memory rank 160 保持。Node 22 104/104、Chromium 11/11 與固定 Cloudflare preview bytes／forward flow／reload／Gallery PASS，見 [驗證決策](../../content/production/runs/com02x-visual-bindings-20261001/VERIFY-COM02X-VISUAL-BINDINGS-008.decision.json)。
- [x] M0 工程 coverage 分類已區分 placeholder／provisional／accepted 與 release readiness；COM01J provisional 和 COM02X accepted-as-is／VQA FAIL 保持，嚴格 release coverage 尚未通過。見 [coverage review](../migration/M0_ASSET_COVERAGE.md)。
- [x] M0：COM-02X 最終 Human playable acceptance 已記錄；checkpoint `ACCEPTED`，Visual QA 歷史 FAIL／safe-zone NEEDS_REVIEW 不改寫。
- [x] M1：建立 [30–60 分鐘 slice scope proposal](M1_GAMEPLAY_VALIDATION_SLICE.md) 與 playtest／branch coverage；所列新 scenes 尚未通過 production gates。
- [ ] M1：依 scope 的第一個場景與批次順序，完成 Narrative Design → Dialogue → QA → preview integration。
- [ ] 校準另案：預先固定兩幕未參與選樣／修正的許棠情境，依 calibration policy 驗證品質／工時／修正次數；不取代 M1 external playtest。
- [ ] 僅對尚未記錄的 Opening migration schema/usability scope 補 review（machine migration/validation complete）；不重新要求 PR #33 已批准的 dialogue／POV／姓名輸入接受。
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
