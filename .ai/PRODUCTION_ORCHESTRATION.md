# Production Orchestration Contract

> Lifecycle: **CANONICAL**
>
> Version: 1.1.0

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
  → preview/smoke → READY_FOR_HUMAN_ACCEPTANCE → Human final acceptance
```

上游未 `PASS` 且 artifact 未 approved/locked 時下游不可 `READY`。`PASS` 僅表示該 task 的 acceptance 達成，不取代 final Human acceptance。`NEEDS_REVIEW`/`BLOCKED`/`FAIL`/`STALE` 都不可滿足 dependency。對有 Human gate 的 task，gate 通過前不得釋放下游。`SKIPPED` 只用於明確判定不需要的 optional task，附理由；不能跳過 required review。

**Parallelism is an optimization, never a correctness requirement.** 只有 dependency-independent task 可並行。已 approved manifest 中彼此獨立的 CG entries 可由不同 fresh render workers 並行；unrelated scene QA 亦可。Scene writing 不能與其 narrative design、CG planning 不能與其 scene approval、render 不能與其 manifest approval、integration 不能與所需 asset acceptance 並行。Dependency 不清楚時 sequential。

**One independent CG Manifest Entry = one fresh renderer task.** 唯有 manifest 明列 `sequence_id` 且同 scene、visible characters、wardrobe、environment、consecutive action 並寫明 continuity benefit 的 linked sequence，才能共用一個 bounded renderer context；sequence 內的 entry dependency 仍須遵守。CG continuity 由 Canonical CG Manifest、Visual Continuity State 和明確引用的 previous accepted asset 維持，不靠 renderer 記憶。不得把六個 unrelated entries 裝進單一 renderer task。Renderer 不改 manifest/Render Packet，不 self-accept，不 automatic retry。


## 2.1 Cost-aware model routing

Coordinator 為每個 Task Packet 指定抽象 `model_tier`；exact model name 由 execution adapter 依當前可用模型映射，避免 workflow 綁死產品型號。**Default is `economical`.** Coordinator 應使用能可靠完成 bounded task 的最低成本 tier，而不是因 task「重要」就直接使用最強模型。

若 execution runtime 可選 parent Coordinator 的 reasoning tier，Coordinator 本身優先使用 `capable`，因其工作包含 DAG decomposition、routing、invalidation 與 escalation judgment；這是 control-plane guidance，不代表 production worker 預設也使用 `capable`。

### Baseline workload routing

以下是 Coordinator 的預設 routing matrix。它是 baseline，不取代下方的 ambiguity / cross-system / escalation 規則；若一個 Task Packet 同時包含多種工作，以**整個 bounded objective 所需的最高 reasoning requirement**決定 tier。Mechanical work 若只是 capable creative task 內的必要步驟，不應再拆出額外 capable worker。

| Workload | Baseline tier | Notes |
| --- | --- | --- |
| Production Coordinator / DAG decomposition（runtime 可選時） | `capable` | Control-plane reasoning only；不親自做 production stage。 |
| Narrative design | `capable` | Scene function、relationship state、character intent、emotional arc。 |
| Scene dialogue / prose | `capable` | Voice、subtext、pacing 與 bounded creative execution。 |
| CG planning / shot design | `capable` | Composition、visual storytelling、continuity-sensitive shot judgment。 |
| Cross-scene continuity review / reconciliation | `capable` | 跨 scene / character state / artifact synthesis。 |
| Final high-impact QA | `capable` | 錯誤會造成大範圍 downstream rework 時。 |
| Narrative review（single bounded scene） | `economical` | Checklist/contract review；遇 material ambiguity 再升級。 |
| Manifest usability / pre-render review | `economical` | Bounded schema/reference/shot-contract validation。 |
| CG render orchestration wrapper | `economical` | 只做 acquisition/binding/call orchestration；真正 image-generation capability 不由此 tier 指定。 |
| Visual review（single candidate） | `economical` | Identity/wardrobe/framing/checklist 初篩；borderline judgment 可升級。 |
| Integration / runtime wiring | `economical` | 已接受 artifacts 的 deterministic wiring；缺 creative decision 時回 upstream。 |
| Repo/source extraction | `economical` | Exact path/ref/content retrieval、摘要與 bounded extraction。 |
| Character/environment spec extraction | `economical` | 從 canonical source 投影已存在的 identity/environment facts。 |
| Deterministic render-prompt compilation | `economical` | 已鎖定規格 → compact render packet；不重新做 creative design。 |
| Filename / manifest / inventory bookkeeping | `economical` | Stable IDs、mapping、receipt、inventory。 |
| Schema transformation | `economical` | 已定義 contract 間的結構化轉換。 |
| Bounded checklist validation | `economical` | Machine-checkable / reviewable criteria。 |

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

每個 end-to-end request 建一個 `run_id`，以 `.ai/schemas/PRODUCTION_RUN_LEDGER.md` 的 GENERATED `Production Run Ledger` 記錄。建議持久路徑為 `content/production/runs/<run_id>/ledger.json`，Task Packets/Handoffs 放同 run 目錄；僅在真的執行 production 時建立，不把本輪 dry-run 當成 story artifact。Ledger 保存 task graph/status、packet/handoff path、input/output versions、gate/invalidation/preview evidence；不保存 full prose、pixels、prompt 或 worker conversation。

Coordinator loop：

1. Bootstrap 只讀 routing/policy/source map 與現有 run record；若 workflow authority conflict，`BLOCKED`，不搜尋 archive。
2. 建 DAG。為第一個 `READY` task 寫 exact Task Packet；後續 packet 在 dependencies `PASS` 且 immutable input versions 已知後才完成並派送。
3. 派給 fresh worker；記 `RUNNING`。只有所有 required acquisition verified 才執行。收到 `.ai/schemas/HANDOFF.md` 後核對 `run_id`、`task_id`、harness/pass、input versions、outputs 與 QA；不完整者 `BLOCKED`。
4. 記錄結果、artifact identity/version、Human gate。重新計算 runnable tasks；不得由 worker 自動 retry。Coordinator 若依 §2.1 建 corrective redispatch / escalation，必須建立新的 Task Packet attempt 並記 routing reason。
5. 完成 integration/preview 後記 `READY_FOR_HUMAN_ACCEPTANCE`；Human final acceptance 才記 `ACCEPTED`。

跨 Work session 恢復時，fresh Coordinator 只讀 ledger、Task Packets、Handoffs 和 canonical artifact versions。核對每個 `PASS` 的 output identity 是否仍存在、其 input identity 是否仍匹配；重新標記 `STALE`/`READY`/`BLOCKED`，先處理任何 orphan `RUNNING` task（以 Handoff/evidence 確認完成或退回 `READY`），再派下一個 runnable task。不可依賴前一 parent chat memory。若平台無法真正建立 fresh bounded worker 或持久化必要 artifact，記 `BLOCKED: worker_isolation_unavailable`，不可改由 parent 直接做 creative stage。

## 4. Provenance and invalidation

每個 output 記 exact input identity：Git blob SHA、canonical manifest content hash、Render Packet SHA-256、accepted asset ID/receipt/hash 或相應 immutable version。最小追蹤鏈：

`Narrative Continuity Contract → Locked Scene → Canonical CG Manifest → Render Packet → Candidate → Accepted Asset → integrated runtime content`。

Coordinator 比對 Task Packet/Handoff/ledger 的 versions。上游改變時先標記受影響 descendant `STALE`，停止 dispatch；逐項判斷是否仍依賴改變的語意，保留無關 branch 的 `PASS`。不可默認 downstream 仍有效，也不可盲目重跑整批。`STALE` 的已接受 artifact 不能再供 integration 使用，直到重新 review/reconcile。整份 manifest hash/version 變動時，先 deterministic reproject：若某 independent entry 的 `render_spec_sha256`（該 entry 除 status + root style contract）與 reference/output identities 均相同，可記錄新 manifest version 與原 candidate/asset provenance 的 reconciliation，保留該 entry 的 accepted result；原始 generation manifest hash 不得改寫。即使 shared prompt hash 只因 manifest version header 改變，也不可因此無理由重畫。若 entry spec 或 referenced accepted base 改變，該 entry 下游仍 `STALE`。

- Dialogue typo 若確實不改 semantic visual beat、timing、branch、narrative state：由 fresh Narrative QA 確認並記錄 `no_visual_impact` 判定、舊/新 scene hash、受影響 scope，才可保留 manifest；沒有此 evidence 則依一般 scene change invalidation。
- Locked Scene semantic beat/meaning 改變：相關 `cg_plan`、manifest entries、Render Packets、unaccepted candidates、asset acceptance/integration 全部 `STALE`；其他 scene/entry 不受影響。
- Visual-only manifest 修正：相關 render packet、candidate、asset/integration `STALE`，narrative artifacts 保持有效。
- 單一 candidate renderer defect：只退回該 `cg_render`，其他 independent entries 保持 `PASS`。

重跑從最早受影響 stage 開始，重新出版本與 Handoff；舊版本留作 provenance，不覆蓋成看似同一 identity。`STALE` 不是自動重試授權。

## 5. Rejection routing and Human gates

Narrative QA `FAIL`：scene execution defect 回 `scene_dialogue`；contract/relationship direction 問題回 `narrative_design`。Manifest usability/QA `FAIL` 回 `cg_plan`。Visual QA 若 image expression、screen side、identity 等執行 defect，回同 entry 的 fresh `cg_render`，沿用 approved manifest；若 manifest 本身錯，回 `cg_plan` 並 invalidate 該 entry 的 packet/candidate。Integration 缺 creative decision 時回對應 upstream worker，不由 integrator 補寫。每次重派需新 Task Packet/task attempt、記 failure reason、依賴版本與 `execution_policy`；遵守 §2.1 的一次 focused corrective redispatch + bounded escalation，不 automatic infinite retry 或 automatic image scoring。CG renderer 仍不得自行 retry。Retry/Human gate 次數按現有 policy。

Human gates：major story direction、canonical character design、需要 Human 選擇的 accepted master image、final playable acceptance。Coordinator 可停在 gate，記 `NEEDS_REVIEW`/`BLOCKED` 和明確問題。Scene splitting、dialogue detail、filename/asset ID、既有 canon wardrobe、continuity inheritance、camera implementation、build wiring 由 canonical workflow 解決，無需反覆詢問 Human。

## 6. Playable Definition of Done

`integrator` fresh worker 接受完整 accepted batch，完成 runtime wiring、clean/fresh-enough build、relevant validation 與 tests。之後由同一 bounded integration/preview task 執行或交付可驗證的 preview procedure：啟動 `npm run preview`、執行 `npm run preview:smoke -- --skip-build`、檢查故事主流程，依環境 forward Codespaces port 4173 並取得可供 Human 使用的 browse URL/明確 access path。`npm run codespace:accept -- --branch <ref>` 是會刪除成功 Codespace 的驗證模式；需要留給 Human 的 demo 可用 `npm run codespace:review -- --branch <ref>` 或維持 private Codespaces access，記錄 visibility、commit/ref、profile、URL、smoke evidence。不得 hardcode URL；如平台無法提供 Human-accessible URL/access path，run `BLOCKED` 並記可用 fallback，不宣稱 done。

完整 request 需要 accepted narrative + accepted CG/assets + runtime integration + build + validation + tests + playable preview + Human-accessible demo，才能 `READY_FOR_HUMAN_ACCEPTANCE`。`npm test` PASS 不等於 production complete。最後由 Human 驗收 playable demo。
