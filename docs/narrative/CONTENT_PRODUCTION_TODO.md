# Content Production TODO

> Lifecycle: **CANONICAL** creative-production backlog
>
> Version: 1.3.1
>
> Updated: 2026-09-30

這份文件只記 production progress、review gate 與 blocker。它不複製 scene spec、CG prompt 或 operator instructions。

完整 request 由 Production Coordinator 依 `.ai/PRODUCTION_ORCHESTRATION.md` 建 Task Packet；fresh worker 先讀 `.ai/WORKFLOW_MANIFEST.yaml` 與該 packet。不得把本 backlog 當成 source bundle。

## Current objective

穩定 `Narrative Design → Scene/Dialogue → Visual Production → Runtime Integration` 單一路徑，同時允許 **narrative production 主動跑在 visual production 前面**。當前依 `ROADMAP.md` 收尾 M0：優先完成 COM-02X 正式 CG／替換驗證與剩餘工程 gate；並行準備 M1 的 30–60 分鐘 validation slice 範圍。後續 narrative batch 不受缺少 CG 阻塞，按 milestone 分批推進。

## Opening Vertical Slice

最新 main 為 `f5e650b…`（PR #37），[PR #37 ledger](../../content/production/runs/pr37-review-fixes-20260930/ledger.json)記錄批准的 COM-00 長段對白、江雨澄介紹前姓名修正、統一旁白／自白正體、玩家姓名 nametag，以及 Human 敘事預覽品質 PASS。既有 PR #33 敘事／POV／姓名輸入批准沿用；未記錄的 migration schema/usability 與 final visual gate 仍按各自範圍追蹤。最新遠端驗證見 `ROADMAP.md`；[舊驗收證據索引](../migration/CURRENT_PLAYABLE_ACCEPTANCE.md)只作歷史快照。工作優先順序以 M0 為準。

| Scene | Script/state | Playable demo | Canonical art completeness | Next review |
| --- | --- | --- | --- | --- |
| `COM-00` | locked + continuity contract; PR #37 approved long dialogue; Human preview quality PASS | integrated; stable node/save IDs preserved | demo-minimal accepted + manifest-bound | final visual acceptance 獨立追蹤 |
| `COM-01X` | locked + continuity contract; PR #33 narrative/POV accepted | integrated | base/reaction family manifest-bound | 未記錄的 schema/usability／visual scope 獨立追蹤 |
| `COM-01B` | locked + continuity contract; PR #33 accepted; PR #37 removes premature Jiang name | integrated bridge; 同屬 elevator Memory | existing runtime CG; production manifest entries `render_ready` | 後續 production visual gate 獨立追蹤 |
| `COM-01J` | locked + continuity contract; PR #33 accepted; PR #37 first-sight naming corrected | integrated | provisional wardrobe drift recorded in manifest | repair art only in later scoped task |
| `COM-02X` | locked + continuity contract; PR #33 narrative/POV accepted | locally integrated accepted-as-is BG, recognition and later microwave CG; Memory rank 160、可 replay | exact Human-selected masters registered; historical per-image VQA FAIL retained; recognition and microwave CG are in Gallery; walk has character-only approved reference | walking street-angle revision/full master selection and PR Cloudflare deployment smoke/final Human playable acceptance remain; do not repeat approved story review |
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
- [x] COM-02X 原兩張與新增 microwave accepted-as-is masters 已接入正式 runtime；83 nodes／四 choices／文本/state／Memory rank 160 invariant checks 通過。完整角色參考包清理已合併，walk component 僅人物批准；本批 build/assets、production validation／validate:final、preview smoke 通過；host Node 25 full tests 87/91，四項受 temporary checkout symlink／mmap 限制，fresh Node 22 verification 尚待 PR 推送，remote Cloudflare preview smoke 待 PR 推送。
- [ ] M0：沿用本地 COM-02X 整合結果，完成 PR Cloudflare preview 與最終 playable review；Visual QA 歷史 FAIL 不改寫。
- [ ] M1 準備：圈定 30–60 分鐘 validation slice 與 playtest 問題；預先選定兩幕未參與校準的許棠情境，正式執行時依 calibration policy 驗證品質／工時／修正次數。
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
