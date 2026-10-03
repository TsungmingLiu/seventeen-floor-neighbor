# Bootstrap Harness

Harness ID: `bootstrap`

Version: 1.1.0

## Purpose

從 exact repository/ref 啟動一個 bounded production stage。Bootstrap 不產生 story、art 或 runtime change。完整 production request 先由 parent Work session 依 `.ai/PRODUCTION_ORCHESTRATION.md` 建 DAG/ledger/Task Packets；parent 只做 control plane，不執行 production stage。

## Required procedure

1. Resolve exact repository/ref；本 repo canonical target 是 `TsungmingLiu/seventeen-floor-neighbor` / `main`。
2. Read `.ai/WORKFLOW_MANIFEST.yaml`，確認 repository identity。
3. Read `.ai/policies/SOURCE_AUTHORITY.md`、`.ai/policies/CONTEXT_ISOLATION.md` 與 `docs/CONTENT_PRODUCTION_SOURCE_MAP.md`。
4. Coordinator 派出後，fresh worker 才 classify exactly one stage：`content_writer`、`cg_planner`、`cg_renderer`、`content_qa`、`integrator`。
5. Read that active harness and one Task Packet。
6. Reject any production packet that allowlists a root declared under manifest `forbidden_source_roots`。
7. Acquire every required source, verify exact path/ref/non-empty content and record immutable version when available。
8. Run `npm run production:preflight -- --packet <ignored packet.json> --scene <expected scene> --out <new ignored preflight.json>` immediately before dispatch/execution (omit scene only for a non-scene task). Existing generated packet verifiers remain mandatory; manual v1 declarations and support limits are in `docs/PRODUCTION_WORKFLOW_TOOLS.md`. Nonzero exit / denied dispatch means `BLOCKED`. Preflight does not prove source pixels visible, semantic QA or Human approval. Execute only after acquisition passes；missing/conflicting input means `BLOCKED`，not context expansion。
9. Supply actual status/QA/used-source facts and run `npm run production:handoff -- --packet <packet.json> --facts <facts.json> --binding <new binding.json> --out <new handoff.json>`; Coordinator verifies with `--packet <packet.json> --verify <handoff.json>` before recording a result. Legacy full Handoffs remain supported. Return only a concise status/digest/output/gate summary to parent context; full source/version binding stays in ignored cache。

Each independent production task MUST execute in a fresh bounded worker。Multi-stage work follows dependency DAG；only dependency-independent tasks may run in parallel。Passing one stage does not authorize later stages to inherit earlier worker/parent full context。若 worker isolation 不可用，回 `BLOCKED`，不由 parent 代工。

## Renderer exception boundary

`cg_renderer` receives only one canonical CG manifest entry、its deterministic render packet and declared references. It does not read `ROADMAP.md`、scene/narrative docs or global art policy；those decisions must already be projected into the entry。

## Source acquisition gate

Text source PASS requires exact repo/ref/path、non-empty returned content and blob SHA when available。

Image reference PASS requires exact expected role/filename/MIME、non-empty pixels visible to the worker and an auditable runtime attachment/binding. Metadata-only acquisition fails。
