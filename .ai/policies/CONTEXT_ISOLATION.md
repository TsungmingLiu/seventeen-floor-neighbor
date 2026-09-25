# Context Isolation Policy

Version: 1.1.0

## Core rule

一個 worker 只取得完成 exactly one task 所需的最小 context。缺資料時 `BLOCKED`，不自行 browse repo 擴張來源。

Parent Work session 是 `.ai/PRODUCTION_ORCHESTRATION.md` 的 control-plane-only Production Coordinator。它只保留 directive、DAG/ledger、Task Packet/Handoff 摘要、artifact ID/version、gate/status，不累積 full canon、scene prose、reference pixels、render prompts、candidate images 或 worker conversation history。Continuity lives in canonical artifacts, not worker memory。

## Layer isolation

### Content Writer

- `narrative_design` 不讀 image-generation material。
- `scene_dialogue` 只讀 approved Narrative Continuity Contract、task-local canon/voice/state 與 immediate continuity。
- 不讀 CG manifest、reference image 或 archived prompt。

### CG Planner

- 只讀 one approved locked scene、global visual contract、visible characters/environment references、immediate continuity。
- 不讀 unrelated route/heroine、archive/experiment。
- 產生 self-contained canonical CG manifest entry，不產生 prompt。

### CG Renderer

- 只讀 one CG manifest entry、deterministic render packet、entry-declared references。
- 不讀 scene、route、`PROJECT_STATE.md`、global visual prose 或其他 character。
- 缺 execution-critical field 時 `BLOCKED: incomplete_cg_spec`。

### Content QA

- `narrative_review` 與 `visual_review` inputs 不混用。
- QA 不搜尋新資料來替作者/planner 解決 contradiction。

### Integrator

- 只接 accepted/locked artifacts 與 task-specific runtime contract。
- 不讀 rejected candidate 或 raw prompt 作替代來源。

## Character isolation

Single-character entry 只帶該角色 references/facts。Multi-character entry 每個角色分開 namespaced；任何未列在 entry 的人物都不可出現或被當成 style reference。

## Fresh-worker rule

Each independent production task MUST execute in a fresh bounded worker/session。Worker 不繼承 parent 或 previous worker conversation。One independent CG Manifest Entry = one fresh renderer task。只有 manifest 明列的 linked sequence 可共用 renderer context，且必須 same scene、visible characters、wardrobe、environment、consecutive action、sequence ID 與明確 continuity benefit。

## Forbidden source roots

Production task 禁止：`.ai/archive/`、`.ai/experiments/`、`docs/archive/`。Provenance receipt 指向 archive 不表示 worker 可以沿 link 載入內容。
