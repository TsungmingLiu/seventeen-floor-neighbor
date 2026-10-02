# Production Orchestration Contract

> Lifecycle: **CANONICAL**
>
> Version: 1.3.0

本文件是 end-to-end content request 的唯一 orchestration authority。它不是第六個 harness 或 creative role；五個 active production harness 仍由 `.ai/WORKFLOW_MANIFEST.yaml` 登記。

**Continuity lives in canonical artifacts, not worker memory.**

**The parent Work session is control-plane only. Production stages execute in fresh bounded workers.**

## 1. Production Coordinator boundary

收到完整 production request 時，parent Work session 擔任 `Production Coordinator`。它解讀 Human directive、界定受影響 story scope、建立 dependency DAG 與 bounded Task Packets、選 harness/pass、派給 fresh worker、等待 dependency、接收 structured Handoff、記錄 immutable artifact identity/status、處理 `STALE`、將拒絕工作路由回正確 stage、派出 integration/preview 並回報 Human。它可以讀 workflow routing、source map、run ledger、packet/handoff 摘要與 artifact identity；只有 worker 按 allowlist 讀 creative source。

Coordinator **MUST NOT** 親自做 narrative design、prose/dialogue writing、narrative QA、CG planning、CG generation、visual QA、runtime integration 或 creative reinterpretation；不得因方便而讀完整 narrative canon、visual policy、scene prose、reference pixels、render prompts、image candidates 或 previous worker conversations 後代工。Parent **MUST NOT directly generate CG candidates** for an end-to-end request。Human 單獨指定 exactly one CG 的單一 stage request 才可直接以 bounded renderer task 執行；此例外不授權 parent 把完整 production request 變成 renderer。

Coordinator 保留：Human directive、`run_id`、DAG/task IDs、dependency/status、path/asset ID/hash/blob SHA、簡短 Handoff、failure/invalidation/Human gate。不得持續累積完整 worker conversation 或 chain-of-thought。Worker 間只傳 canonical artifact、exact Task Packet、structured Handoff、明列的 accepted reference/asset 與 immutable provenance；不傳 conversation history。

## 2. Dependency DAG and fresh execution

Each independent production task **MUST execute in a fresh bounded worker**。同一 reusable harness 可供不同 fresh worker 使用，例如 `content_writer / narrative_design` 與 `content_writer / scene_dialogue`；兩個 pass 不能沿用同一 execution context。`scene_dialogue != narrative_review`、`cg_planner != cg_renderer`、`cg_renderer != visual_review`、`integrator != creative worker`。

正常 task unit：`narrative_design` = 一個 coherent requested change/small arc；`scene_dialogue` = 一個 scene；`narrative_review` = 一個 scene（必要時 tightly linked group）；`cg_plan` = 一個 approved Locked Scene；`cg_render` = 一個 independent CG Manifest Entry；`visual_review` = 一個 candidate/explicit linked sequence；`integrate` = 一個 accepted production batch。`cg_plan` 後還有 manifest usability review gate，由 fresh `content_qa / visual_review` worker 對 manifest 作 pre-render review；沒有 candidate 時只檢查 manifest，不得假稱 image QA PASS。

```text
Human request → narrative_design → scene_dialogue → narrative_review
  → approved Locked Scene → cg_plan → manifest usability review
  → CG Manifest Entry → deterministic Render Packet → cg_render → visual_review
  → accepted asset(s) + accepted narrative → integrate → build/validate/tests
  → preview/smoke + independent final derivative/display visual_review
  → READY_FOR_HUMAN_ACCEPTANCE → Human final acceptance
```

**Optional narrative-preview branch:** approved Locked Scene / Narrative QA 後，可另派同一個 `integrator` harness 的 `integration_mode: narrative_preview` task。它只依賴已批准的故事、明列的現有 repo 背景或唯一 `previewOnly` background；scene node 用既有 `composite` visual 與穩定 node ID。需要共用佔位圖時，route 的 `assetIds` 必須列入該 logical ID，chapter 明示 `allowPreviewArt: true`。沒有 CG 時仍可驗證 choices、state、save/reload、Continue 和文本節奏；不得創建假的 CG ID、Gallery entry、accepted-master receipt 或假裝完成 Visual QA。此 task 通過 build/validate/tests/preview smoke 後可記 `NARRATIVE_PREVIEW_READY`，供 Human 審閱劇情，並允許下一個獨立 narrative scene 繼續。CG plan/render/Visual QA/Asset Ingest 仍從 approved Locked Scene 走原有視覺分支；最終 integration/`READY_FOR_HUMAN_ACCEPTANCE` 仍須所有必要的 accepted assets。這是同一 DAG 的可選早期預覽，不建立第二套 authoring pipeline。

上游未 `PASS` 且 artifact 未 approved/locked 時下游不可 `READY`。`PASS` 僅表示該 task 的 acceptance 達成，不取代 final Human acceptance。`NEEDS_REVIEW`/`BLOCKED`/`FAIL`/`STALE` 都不可滿足 dependency。對有 Human gate 的 task，gate 通過前不得釋放下游。`SKIPPED` 只用於明確判定不需要的 optional task，附理由；不能跳過 required review。

**Parallelism is an optimization, never a correctness requirement.** 只有 dependency-independent task 可並行。已 approved manifest 中彼此獨立的 CG entries 可由不同 fresh render workers 並行；unrelated scene QA 亦可。Scene writing 不能與其 narrative design、CG planning 不能與其 scene approval、render 不能與其 manifest approval、final integration 不能與所需 asset acceptance 並行。Narrative preview 只依賴已批准的 scene 與 repo preview/background bytes；它不是 final integration。Dependency 不清楚時 sequential。

**One independent CG Manifest Entry = one fresh renderer task.** 唯有 manifest 明列 `sequence_id` 且同 scene、visible characters、wardrobe、environment、consecutive action 並寫明 continuity benefit 的 linked sequence，才能共用一個 bounded renderer context；sequence 內的 entry dependency 仍須遵守。CG continuity 由 Canonical CG Manifest、Visual Continuity State 和明確引用的 previous accepted asset 維持，不靠 renderer 記憶。不得把六個 unrelated entries 裝進單一 renderer task。Renderer 不改 manifest/Render Packet，不 self-accept，不 automatic retry。


## 2.1 Cost-aware model routing

Coordinator 為每個 Task Packet 指定抽象 `model_tier`；exact model name 由 execution adapter 依當前可用模型映射，避免 workflow 綁死產品型號。**Default is `economical`.** Coordinator 應使用能可靠完成 bounded task 的最低成本 tier，而不是因 task「重要」就直接使用最強模型。

若 execution runtime 可選 parent Coordinator 的 reasoning tier，Coordinator 本身優先使用 `capable`，因其工作包含 DAG decomposition、routing、invalidation 與 escalation judgment；這是 control-plane guidance，不代表 production worker 預設也使用 `capable`。

### Baseline workload routing

Baseline values are owned by `.ai/WORKFLOW_MANIFEST.yaml` at `execution.model_routing.baseline_workloads`; this contract defines how to interpret and override them rather than duplicating the table.

Coordinator starts from that manifest baseline. If a bounded objective combines multiple workload classes, use the highest reasoning requirement required by the objective. Mechanical substeps inside a capable creative task do not require separate capable workers. `cg_render_orchestration: economical` applies only to acquisition/binding/call orchestration; actual image-generation capability/model selection is outside this worker tier.

只有至少一項成立時可直接指定 `capable`：

- task 需要 material creative judgment，而不是照已鎖定 contract 做機械轉換；
- requirements/canonical sources 存在實質 ambiguity 或 conflict，需要推理後才能安全繼續；
- 需要跨 scene、跨角色狀態或跨系統 artifact 做 synthesis/reconciliation；
- 是 final high-impact QA，錯誤會造成大範圍 downstream rework；
- 同一 bounded objective 已由 `economical` worker 完成一次 focused corrective redispatch，仍未通過 validation，作為 `validation_escalation`。

以下情況**不得單獨構成升級理由**：task importance、source/file count、output length。Mechanical extraction、schema transformation、deterministic prompt compilation、manifest/inventory update、bounded checklist review、runtime wiring 等，若沒有上述 capable 條件，維持 `economical`。

每個 Task Packet 的 `execution_policy` 必須記 `model_tier`、`routing_reason`、`attempt`；corrective redispatch / escalation 另記 `correction_of` / `escalation_from`。Worker 不自行換 model tier，也不自行 retry。

**Bounded escalation:** validation `FAIL` 時，Coordinator 最多可對同一 objective 建立一次 fresh、focused corrective redispatch，沿用原 tier 並只帶 failure evidence；若再次失敗，且失敗屬 capability/reasoning limitation，下一個 fresh attempt 才可升為 `capable`，理由記為 `validation_escalation`。不得 infinite retry。若第一次 failure 已明確是 source conflict/material ambiguity，Coordinator 可依上述 capable 條件直接升級，不需浪費 correction attempt。

此 policy 不授權自動重畫 CG。Image generation 仍遵守 `cg_renderer` 的 **no automatic retry / no automatic image scoring**；Visual QA rejection 只能依既有 rejection routing 建新的 explicit renderer attempt。

## 3. Run record and dispatch loop

每個 end-to-end request 建一個 `run_id`，以 `.ai/schemas/PRODUCTION_RUN_LEDGER.md` 的 GENERATED `Production Run Ledger` 記錄。只有必要的 compact resumable checkpoint 與 Human/QA/adoption 短決策 receipt 持久保存在 `content/production/runs/<run_id>/`；完整 Task Packet/Handoff 留在 gitignored `generated/session-cache/`；full job state、attempt receipts、render prompts/API payloads、logs/rejected candidates 留在 gitignored `generated/job-artifacts/<run_id>/`。Checkpoint 保存 task graph/status、packet generator/sha256、必要決策 receipt path、gate/invalidation/preview evidence；input/output versions 只在必要 durable decisions 保存，其他重複 attempt snapshots 留在 job artifacts；不保存 full prose、pixels、prompt 或 worker conversation。僅在真的執行 production 時建立，不把 dry-run 當成 story artifact。

Coordinator loop：

1. Bootstrap 只讀 routing/policy/source map 與現有 run record；若 workflow authority conflict，`BLOCKED`，不搜尋 archive。
2. 建 DAG。為第一個 `READY` task 寫 exact Task Packet；後續 packet 在 dependencies `PASS` 且 immutable input versions 已知後才完成並派送。已 Locked 的 scene 需要獨立 `narrative_review` 時，使用現有 `npm run context -- --task narrative_review --scene <id> --run-id <id> --task-id <id> --ref <source_ref>` 產生 gitignored session-cache packet，派工前 `--verify-packet <path>`；此工具只核對確定性的來源/版本/binding，不聲稱上游 QA/Human gate 已 PASS。COM-00 已有可核對的跨 run Narrative QA 時，`cg_plan` 可用同一入口，明列 `--upstream-run-id`、`--upstream-task-id` 與由 Coordinator 選定的 `--reference-ids`；工具必須先驗證上游 committed PASS、scene/contract、圖片 bytes 與 reference 角色，並限制 worker 只看該 scene/角色。跨 run 的既有 QA 證據放在 `inputs.accepted_outputs`；`depends_on` 仍只含本 run 的 task IDs。Packet 本身不執行 CG planning，也不批准或覆蓋既有 manifest。其他 task 仍按 Task Packet schema 準備，直到另有驗證過的 generator。
3. 派給 fresh worker；記 `RUNNING`。只有所有 required acquisition verified 才執行。對 `narrative_review` generated packet，`npm run context -- --verify-packet <path>` 是派工前必需的 machine preflight：執行既有 content/runtime、production validators，檢查 scene/manifest/asset/Memory 結構及 immutable input；FAIL 即 `BLOCKED`，不交給 semantic worker。收到 `.ai/schemas/HANDOFF.md` 後核對 `run_id`、`task_id`、harness/pass、input versions、outputs 與 QA；不完整者 `BLOCKED`。只把必要的核對結果與 decision receipt 寫入 Git；cache 中的完整 worker Handoff 不在跨 session 時被要求存在。
4. 記錄結果、artifact identity/version、Human gate。重新計算 runnable tasks；不得由 worker 自動 retry。Coordinator 若依 §2.1 建 corrective redispatch / escalation，必須建立新的 Task Packet attempt 並記 routing reason。
5. Narrative-only preview 只記 `NARRATIVE_PREVIEW_READY` 與 Human 劇情審閱結果；完成 final integration/preview 後才記 `READY_FOR_HUMAN_ACCEPTANCE`；Human final acceptance 才記 `ACCEPTED`。

已存在的 COM-00 canonical manifest 可由 `context.mjs --task visual_review --review-scope manifest_usability` 準備一個 scene-scoped pre-render QA packet，明列三個 COM-00 entry IDs 與上游已驗證的 Narrative QA run/task。Packet 只帶 manifest 中的 style contract 與這三個 entry 的精確節錄；QA worker 不讀其他場景的 entry。這是舊 manifest 的獨立 usability 審查入口，不補造當年的 planner 決策、candidate image review、Human acceptance 或新 run PASS。只有 fresh worker 實際完成審查並經 Coordinator 核對 Handoff/receipt 後，才能記錄該 task 的 QA 結果；未有 manifest usability 決策時狀態仍為 `UNRECORDED`。

`COM00-S04-BASE-NEUTRAL` 的既有 repo WebP 可由同一入口的 `review_scope: candidate` 獨立派給 fresh Visual QA worker；四張候選／參考圖必須實際可見。Candidate `FAIL` 同樣留下可從 Git 重建的短 receipt 和 `BLOCKED` run ledger，但不把既有 manifest `accepted` 欄位當成 pixel QA 通過，也不自動修改可玩 demo 或重畫圖片。後續是否另建 renderer attempt 依 §5 處理；Human accepted-master 選擇仍是另一個 gate。

Human 檢視既有 scene 時，可執行 `npm run production:review -- --scene <id>` 重建 gitignored 的 `generated/reviews/<id>/index.html`。這是唯讀的來源/CG/Memory/route/hashes 彙整，不是另一個 ledger、authoring UI 或 approval gate。頁面所示的 validator PASS、manifest `accepted` 與 repo WebP bytes 不等於獨立 Narrative/Visual QA 或 Human 決定；僅在 run ledger/決策 receipt、Packet SHA 和當前輸入/輸出全部核對後，才顯示該 task 的 Narrative QA `PASS_CURRENT` 或明列候選圖的 Visual QA `CURRENT_FAIL`。未記錄的其他 CG/Human gate 仍顯示 `UNRECORDED`；任一 candidate FAIL 不得升為全場景 readiness，保持 `NOT_READY`。具體 baseline 與實際 receipt 接入見 `docs/migration/ISSUE16_REVIEW_BUNDLE_GATE.md`、`docs/migration/ISSUE16_REVIEW_RECEIPT_GATE.md`、`docs/migration/ISSUE16_CANDIDATE_DECISION_GATE18.md`。

跨 Work session 恢復時，fresh Coordinator 只讀 ledger、Git 中的 decision receipts 和 canonical artifact versions；依 ledger 的 source_ref 與 packet generator 重建 cache 中的 Task Packet，再核對 SHA-256。核對每個 `PASS` 的 decision receipt、output identity 與 input identity 是否仍匹配；重新標記 `STALE`/`READY`/`BLOCKED`，先處理任何 orphan `RUNNING` task（只有持久 receipt 才可確認完成，否則退回 `READY` 並重新做 bounded review），再派下一個 runnable task。不可依賴前一 parent chat memory 或前一 session cache。若平台無法真正建立 fresh bounded worker 或持久化必要 artifact，記 `BLOCKED: worker_isolation_unavailable`，不可改由 parent 直接做 creative stage。

## 4. Provenance and invalidation

每個 output 記 exact input identity：Git blob SHA、canonical manifest content hash、Render Packet SHA-256、accepted asset ID/receipt/hash 或相應 immutable version。最小追蹤鏈：

`Narrative Continuity Contract → Locked Scene → Canonical CG Manifest → Render Packet → Candidate → Accepted Asset → integrated runtime content`。

Coordinator 比對 Task Packet/Handoff/ledger 的 versions。上游改變時先標記受影響 descendant `STALE`，停止 dispatch；逐項判斷是否仍依賴改變的語意，保留無關 branch 的 `PASS`。不可默認 downstream 仍有效，也不可盲目重跑整批。`STALE` 的已接受 artifact 不能再供 integration 使用，直到重新 review/reconcile。整份 manifest hash/version 變動時，先 deterministic reproject：若某 independent entry 的 `render_spec_sha256`（該 entry 除 status + root style contract）與 reference/output identities 均相同，可記錄新 manifest version 與原 candidate/asset provenance 的 reconciliation，保留該 entry 的 accepted result；原始 generation manifest hash 不得改寫。即使 shared prompt hash 只因 manifest version header 改變，也不可因此無理由重畫。若 entry spec 或 referenced accepted base 改變，該 entry 下游仍 `STALE`。

對已接受的 Opening CG entries，可先執行 `npm run production:impact -- --scene COM-01X --from <baseline-commit> --to <target-commit|WORKTREE>`，取得 `generated/session-cache/impact/<scene>/impact.json` 的**唯讀版本差異與應失效範圍**。工具比較 scene 的 contract、Locked Scene、runtime dialogue/structure、route/Memory 的該 scene 切片、每個 CG entry 的 `render_spec_sha256`、reference pixels、accepted asset bytes 與 renderer tool hash；accepted base 的 Reaction 依賴會展開，其他 entry 或同一 Memory 中不屬於此 scene 的 node/gallery 不因整份檔案 hash 改變而被重畫。預設報告不寫 run ledger、不驗證歷史 QA PASS；沒有可核對的 run 記錄時 `qa_status` 一律為 `UNKNOWN_NO_RUN_LEDGER`，不得直接據此派工或宣稱既有 accepted master 仍經 QA 有效。新的 `render_ready` scene 在 accepted asset/receipt 尚未形成前會 `BLOCKED`；不得用這個受限入口跳過原有 production gate。細節與受控改動見 `docs/migration/ISSUE16_INVALIDATION_GATE.md`。

已有單一 `narrative_review` task 與持久 decision receipt 的 run，可加 `--run-id <id>`，並以 ledger 的 `source_ref` 作 `--from`、目前 committed `HEAD` 作 `--to`。工具從固定來源版本重建 Task Packet，核對目前 Git 中 ledger/receipt 的身份，再把該 task 記錄的 input/output blob versions 與目標 commit 比較，於同一唯讀報告附上 `run_reconciliation`。只有全部一致才建議該 **Narrative QA task** `CURRENT_PASS`；任一已記錄版本改變則建議 `STALE_PROPOSED`，交由 Coordinator 辦理 review。CG、Visual QA、Human 決定與未記在該 task 的 runtime/asset 變更仍依原本 `would_invalidate` 範圍另行審查；不能由這項 Narrative QA receipt 推論它們已通過。來源 commit 缺失、receipt 不符、scene/ref/target 錯誤時 `BLOCKED`，不修改 ledger、不沿用先前報告。此 bounded 核對不替代未來其他 task 類型的 reconciliation。

已有 accepted runtime CG 的 scene，在 final integration 前由 Integrator 執行 `npm run production:integration:check -- --scene <id> --from <已核對整合基線 commit> --to <commit|WORKTREE>`；Task Packet 必須明列該基線來源／版本，不能由 worker 任意選 HEAD。工具每次重新計算 impact，出現 `integration:<scene>` descendant 即以非零 exit code 阻擋後續 wiring/build；取得來源失敗時刪除前次 report。COM-02X 的四張 runtime accepted-as-is masters 透過原 ingest／Human adoption receipts 核對原 PNG 與 WebP derivative；唯一明示 reference-only、未被 runtime 或其他 entry 依賴的 environment production entry 不當成已接受 runtime 圖。其他未接受 entry 仍 `BLOCKED`。`NO_STALE_DIFF` 不判定 QA／Human acceptance、不修改 ledger；normal build 不自動選基線。這項定點 gate 不包含 Issue #27 的多 task DAG、跨階段自動 stale/recovery；當前驗證證據見 `docs/migration/M0_CURRENT_SCENE_STALE_GATE.md`。

- Dialogue typo 若確實不改 semantic visual beat、timing、branch、narrative state：由 fresh Narrative QA 確認並記錄 `no_visual_impact` 判定、舊/新 scene hash、受影響 scope，才可保留 manifest；沒有此 evidence 則依一般 scene change invalidation。
- Locked Scene semantic beat/meaning 改變：相關 `cg_plan`、manifest entries、Render Packets、unaccepted candidates、asset acceptance/integration 全部 `STALE`；其他 scene/entry 不受影響。
- Visual-only manifest 修正：相關 render packet、candidate、asset/integration `STALE`，narrative artifacts 保持有效。
- Preview runtime wiring 或 placeholder 變動：只讓使用它的 narrative preview task `STALE`；不讓已批准的 scene 或不依賴它的 CG 變 stale。後續正式 CG 替換佔位圖時保留 node IDs、save compatibility，更新 visual binding 與必要的 runtime QA。
- 單一 candidate renderer defect：只退回該 `cg_render`，其他 independent entries 保持 `PASS`。

重跑從最早受影響 stage 開始，重新出版本與 Handoff；舊版本留作 provenance，不覆蓋成看似同一 identity。`STALE` 不是自動重試授權。

## 5. Rejection routing and Human gates

For prospective native/quality Visual QA, raw-image clarity/artifact defects return to the same entry's renderer when its approved spec is sufficient; deficient composition/quality requirements return to planner. Runtime derivative compression or crop/focus/UI implementation defects return to integrator, preserving adopted original bytes. Missing profiles/pixels/provenance return `BLOCKED`/`NEEDS_REVIEW` to their producing stage; evidenced quality failure returns `FAIL`/`NEEDS_REVIEW` with affected file/hash/region/profile. Corrected bytes or display inputs need a fresh bounded review of affected checks. No automatic redraw/retry; historical QA/Human outcomes are not relabeled as new quality PASS.

Narrative QA `FAIL`：scene execution defect 回 `scene_dialogue`；contract/relationship direction 問題回 `narrative_design`。Manifest usability/QA `FAIL` 回 `cg_plan`。Visual QA 若 image expression、screen side、identity 等執行 defect，回同 entry 的 fresh `cg_render`，沿用 approved manifest；若 manifest 本身錯，回 `cg_plan` 並 invalidate 該 entry 的 packet/candidate。Integration 缺 creative decision 時回對應 upstream worker，不由 integrator 補寫。每次重派需新 Task Packet/task attempt、記 failure reason、依賴版本與 `execution_policy`；遵守 §2.1 的一次 focused corrective redispatch + bounded escalation，不 automatic infinite retry 或 automatic image scoring。CG renderer 仍不得自行 retry。Retry/Human gate 次數按現有 policy。

Human gates：major story direction、canonical character design、需要 Human 選擇的 accepted master image、narrative-preview story review、final playable acceptance。Narrative-preview review 只批准故事與互動方向，不接受佔位圖為 CG。Coordinator 可停在 gate，記 `NEEDS_REVIEW`/`BLOCKED` 和明確問題。Scene splitting、dialogue detail、filename/asset ID、既有 canon wardrobe、continuity inheritance、camera implementation、build wiring 由 canonical workflow 解決，無需反覆詢問 Human。

向 Human 回報選圖問題時，附上候選圖本身（可直接顯示或提供可開啟的連結）及具體 QA 問題；若爭議在鏡頭／人物連貫性，並附同一條 continuity chain 的前後已核對圖片供比較。圖的 asset ID、repo path 與 hash 要與 receipt 對應；展示圖片不構成新的 QA PASS 或 Human accepted-master 決定。

## 6. Playable Definition of Done

### Prospective final derivative/display gate

Future planner/renderer packets must carry the full requirements through existing manifest `render_constraints.include[]`, `composition.framing_notes[]`/focus/safe zone and `acceptance[]`, and Task Packet `constraints.locked`/`acceptance`: largest supported native 16:9/highest available quality, integer-pixel rounding, approved aspect/reference/edit compatibility, exposed supported controls or `not exposed`, no fixed pixel floor or artificial upscale labeled native, actual returned dimensions and preserved original bytes/hash. Explicit approved desktop, mobile landscape and portrait CSS viewport/DPR/display-area/crop/focus/UI profiles are required; do not invent universal values or guarantee dimensions from prompt text. Incomplete projection blocks manifest usability/render dispatch.

Original-image QA and Human master selection cannot establish final WebP/compression/display PASS. Once final integration produces actual derivative pixels and runtime screenshots/render evidence, Coordinator dispatches another fresh bounded **`content_qa / visual_review` task using existing `review_scope: candidate`**, not a new harness/pass/creative pipeline. Its packet names exact accepted-original/derivative/screenshot identities and hashes via existing `inputs.accepted_outputs`, `required_acquisition`, `allowed_sources`, `input_versions`, `constraints.locked` and `acceptance`, plus runtime ref/build and approved CSS viewport/DPR/crop/focus/UI profiles. Existing context generators retain their documented limits; prepare a bounded packet under the existing schema where no generator supports these inputs, rather than claiming new automated support.

Integrator's implementation Handoff is a dependency for this review, not permission to self-award QA. Before `READY_FOR_HUMAN_ACCEPTANCE`, verify required source checks and independent `VQA-COMPRESSION-ARTIFACTS`, `VQA-DESKTOP-DISPLAY` and `VQA-MOBILE-PORTRAIT-DISPLAY` PASS against the exact derivative/profile/build being demonstrated. Already matching independent evidence may be verified for unchanged inputs; new derivative bytes or crop/focus/UI/profile changes invalidate affected final checks and require fresh review. Missing pixels/profiles/provenance remain `BLOCKED`/`NEEDS_REVIEW`; uncompressed-original inspection, build/validator/smoke PASS and absent derivatives cannot yield final-quality PASS or 4K/retina claims.

This policy is prospective: preserve existing adopted pixels, accepted manifests and recorded QA/Human outcomes, without declaring old assets newly re-reviewed or forcing redraw. Narrative preview and governance maintenance do not claim final visual acceptance.

`NARRATIVE_PREVIEW_READY` 是部分進度：preview asset 必須是已登記、可解碼的 repo WebP `background`，其 `previewOnly` 身分與 route opt-in 可受機器檢查；`npm run build`、`npm run validate`、相關 tests、`npm run preview:smoke` 通過，並記明可供 Human 審閱的 ref/access path。它不算 CG/Visual QA、Gallery 解鎖或 final playable acceptance。`npm run validate:final` 在最終視覺驗收前必須通過，會拒絕仍啟用 `allowPreviewArt` 的 route。

`integrator` fresh worker 接受完整 accepted batch，完成 runtime wiring、clean/fresh-enough build、relevant validation 與 tests。之後由同一 bounded integration/preview task 執行或交付可驗證的 preview procedure：啟動 `npm run preview`、執行 `npm run preview:smoke -- --skip-build`、檢查故事主流程，依環境 forward Codespaces port 4173 並取得可供 Human 使用的 browse URL/明確 access path。`npm run codespace:accept -- --branch <ref>` 是會刪除成功 Codespace 的驗證模式；需要留給 Human 的 demo 可用 `npm run codespace:review -- --branch <ref>` 或維持 private Codespaces access，記錄 visibility、commit/ref、profile、URL、smoke evidence。不得 hardcode URL；如平台無法提供 Human-accessible URL/access path，run `BLOCKED` 並記可用 fallback，不宣稱 done。

完整 request 需要 accepted narrative + accepted CG/assets + runtime integration + build + validation + tests + playable preview + Human-accessible demo，才能 `READY_FOR_HUMAN_ACCEPTANCE`。`npm test` PASS 不等於 production complete。最後由 Human 驗收 playable demo。

## 7. Asynchronous artifact boundary

Rendering fits the same dependency DAG as an asynchronous job: prepare and verify one canonical entry plus reference hashes; write full job state/packet/transport envelope under `generated/job-artifacts/<run_id>/<attempt_id>/`; dispatch exactly one authorized generation; persist candidate bytes/provenance/logs there; send the immutable candidate identity to a fresh bounded Visual QA worker; await the explicit Human master gate; then promote only adopted master bytes, formal spec and small QA/Human/adoption evidence into source. Failures remain failures; retries require a new explicitly authorized attempt. Provider execution is not implemented by this storage change.

The Coordinator may save/transport this artifact directory through an existing workflow's artifacts, but must set retention explicitly and record artifact/run ID, expiry and byte digests. Active attempts and Human-pending candidates must remain available until the gate is resolved; verify durable recovery before deleting them. Expiring workflow artifacts cannot be the sole accepted-master or Human/QA proof: adopted bytes and compact acceptance identities stay durable in source; omitted legacy evidence uses verified immutable Git locators. Deleting an Actions run also deletes its artifacts. See [GitHub workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts) and [store/share workflow data](https://docs.github.com/en/actions/tutorials/store-and-share-data). No paid rendering service, new account, secret or image provider is introduced here.

Workers continue to use bounded packets. Neither archived execution records nor downloaded job bundles authorize creative context expansion. Maintenance audits/Handoffs stay cache-only, without a new art-production ledger. Writers must use the artifact boundary; `cg:packet --out` rejects source-directory destinations. Run `npm run production:storage:check` before review/commit; local production validators and Verify CI also enforce it.
