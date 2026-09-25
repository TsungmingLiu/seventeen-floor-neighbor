# Production Orchestration Dry Run

> Lifecycle: **GENERATED** validation example. No story, CG, or production run is created.

Hypothetical Human directive: 「在 COM-01J 後增加一個短 scene，讓江雨澄從 `interested_but_bounded` 走到願意下次繼續聊天；仍不交換聯絡方式。完成 narrative、dialogue、CG、integration 與 playable demo。」Coordinator 只將此 directive、scene scope 與 constraints 放入 Task Packet，不自行寫 scene 或決定 shot。

## Packets and dependency DAG

`tests/fixtures/production-orchestration-dry-run.json` 是可驗證的 DAG fixture。每列代表一個獨立 fresh worker/task；真正執行時 Coordinator 按 `.ai/schemas/TASK_PACKET.md` 補 `run_id`、exact source binding/allowlist/acquisition、immutable input versions、deliverable、acceptance、handoff/Human gate。以下是 bounded source policy，不是已寫好的 production packet。

| Task Packet | Depends on | Worker sees | Worker cannot see |
| --- | --- | --- | --- |
| `ND-001` narrative_design | Human directive | relevant narrative canon/state、COM-01J immediate continuity | image prompt、unrelated heroine、archive |
| `SC-001` scene_dialogue | `ND-001` PASS | approved Narrative Continuity Contract、voice/state excerpt、immediate scene continuity | CG manifest、render/reference pixels、ND conversation |
| `NQA-001` narrative_review | `SC-001` PASS | contract、one scene、same bounded canon excerpts | renderer inputs、full repo |
| `CGP-001` cg_plan | `NQA-001` PASS | approved Locked Scene、visual contract、visible-character/environment refs、Visual Continuity State | unrelated routes、writer conversation、archive |
| `MQA-001` manifest usability | `CGP-001` PASS | manifest entries and required reference identities | candidate pixels（尚未生成）、full story |
| `CGR-001/002/003` cg_render | `MQA-001` PASS | each worker only its own entry、deterministic Render Packet、entry-declared pixels/accepted base | other entries/candidates、scene、canon、prior renderer chat |
| `VQA-001/002/003` visual_review | corresponding render PASS | one candidate、entry、actual reference binding、optional accepted base | other candidates、writer conversation |
| `INT-001` integrate | `NQA-001` and all three VQA PASS / accepted assets | locked narrative、accepted assets/receipts、runtime contract | rejected candidates、raw render prompts、creative rewrite |

`ND → SC → NQA → CGP → MQA` 是 sequential。Manifest approval 後，三筆假設彼此 independent、`sequence_id: null`，可派三個不同 fresh render workers 並行；各自 VQA 僅等待自己的 render。若 manifest 明列合法 linked sequence，才把該 sequence 視為一個 bounded render task，並遵守 sequence 內 dependency。Integration 等全部 required outputs accepted。Unknown dependency 預設 sequential。

## Handoff, provenance, and interruption

每個 worker 回 `.ai/schemas/HANDOFF.md`：`run_id`、`task_id`、`status`、`inputs_used`、`input_versions`、`outputs`、`output_versions`、QA、`invalidates`、`next_recommended_stage`、Human gate。Coordinator 核對 packet/版本後更新 ledger，不傳 full conversation。CG render handoff 額外記 manifest/entry/hash、Render Packet hash、實際 pixels/roles、candidate ID；CG continuity 來自 manifest/Visual Continuity State/明列 accepted base。

假設 `CG02` image screen side 錯而 manifest 正確：`VQA-002 FAIL`，只重派 `CGR-002` 的 fresh attempt；`CG01/03` 保持 PASS。若 manifest screen side 錯：回 `CGP-001` 修 affected entry，`CG02` packet/candidate/VQA/集成標 `STALE`；`CG01/03` 經 `render_spec_sha256`、refs/output identity 核對後保留 PASS，並在 ledger 記錄整份 manifest version reconciliation，不改原始 generation provenance。若 Locked Scene semantic beat 改變：`CGP/MQA` 與依賴其內容的 render/QA/integration 全部 `STALE`，重新判斷受影響 entry。純 typo 需 fresh Narrative QA 的 `no_visual_impact` evidence 才可保留 manifest。

Parent session 中斷後，新的 Coordinator 從 ledger、Task Packets、Handoffs、canonical versions 核對 `PASS`、`READY`、`STALE`、`BLOCKED`，處理 orphan `RUNNING`，再派下一個 task；不讀前一聊天。最終 fresh Integrator 完成 runtime wiring、clean/fresh-enough build、validate/tests、preview server、Codespaces port 4173/access path、story smoke。Coordinator 記錄 URL/ref/visibility/evidence，標 `READY_FOR_HUMAN_ACCEPTANCE`；Human 才做 final playable acceptance。若無可用 demo path，記 `BLOCKED`。

## Acceptance scenarios

| Scenario | Expected Coordinator decision |
| --- | --- |
| A normal success | `ND → SC → NQA → CGP → MQA → 3 CGR/VQA → INT → preview → READY_FOR_HUMAN_ACCEPTANCE`；parent 全程只 routing/status/provenance。 |
| B one CG fails | `CG02` renderer defect 僅新派 `CGR-002` attempt；`CG01/03` 留存。 |
| C manifest wrong | `CG02` screen side source error 回 `CGP`；其 packet/candidate stale；unrelated entries 經 hash reconciliation 留存。 |
| D narrative revision | semantic beat 改變使 affected CG plan/render/QA/integration stale；不假設舊圖可用。 |
| E parent interrupted | fresh Coordinator 從 ledger、packets、handoffs、versions 恢復，無需 previous chat。 |
| F parallel rendering | 三個 independent entries 可三個 fresh workers 同時 render；explicit linked sequence 才可共用 bounded context。 |
