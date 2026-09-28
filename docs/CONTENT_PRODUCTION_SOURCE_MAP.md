# Content Production Source Map

> Lifecycle: **CANONICAL**
>
> Version: 1.2.0
>
> Updated: 2026-09-26

這份文件只做 **source inventory / routing index**：告訴 fresh worker 某個 domain 的 canonical source 在哪裡，以及該 source 擁有什麼。

- Lifecycle、conflict order、archive/read rules：以 `.ai/policies/SOURCE_AUTHORITY.md` 為唯一 authority。
- Current milestone / priority：只看 `ROADMAP.md`；已實作工程行為看 `ARCHITECTURE.md`、code/tests；歷史遷移對照看 `docs/migration/`，不作 active production 指令。
- Technical/UI backlog：只看 `TODO.md`；creative production progress 只看 `docs/narrative/CONTENT_PRODUCTION_TODO.md`。
- Task-local worker 仍只能讀 Task Packet 明確 allowlist 的最小來源；這張 map 本身不授權擴讀。

## 1. Active source-of-truth inventory

| Domain | Canonical source | Owns | Does not own |
| --- | --- | --- | --- |
| Workflow entry | `.ai/WORKFLOW_MANIFEST.yaml` | pipeline routing、active harness/schema registry、execution defaults | story facts、shot content |
| Production orchestration | `.ai/PRODUCTION_ORCHESTRATION.md` | parent control plane、DAG、invalidation、resume、playable DoD | creative production stage |
| Run ledger | `.ai/schemas/PRODUCTION_RUN_LEDGER.md` + `content/production/runs/<run_id>/` | GENERATED task/identity/status evidence | creative authority、worker memory |
| Source policy | `.ai/policies/SOURCE_AUTHORITY.md` | lifecycle、precedence、conflict/read rules、fixture policy | task content |
| Context policy | `.ai/policies/CONTEXT_ISOLATION.md` | bounded acquisition、character/scene isolation | creative decisions |
| Milestone / priority | `ROADMAP.md` | current milestone、已驗證的產品基線、優先順序與 exit criteria | task-specific accepted values、工程實作契約 |
| Narrative macro design | `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` | macro arc、scene purpose、relationship pacing | final render prompt |
| Detailed route pre-script | `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_INDEX.md` + sibling blueprint files | pre-dialogue scene progression、branch intent、rejoin logic、transition hooks | final dialogue prose、camera、CG planning |
| Route/state | `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` | route graph、knowledge/state semantics | dialogue prose、camera |
| Production layer contract | `docs/narrative/CONTENT_PRODUCTION_SPEC.md` | Narrative Design → Scene/Dialogue → Visual Production boundaries | story facts |
| Locked scene | `docs/narrative/scenes/vertical-slice/*.md` | scene-local narrative facts、dialogue、semantic visual beats | image-generation prompt syntax |
| Narrative contract values | `content/production/narrative/<chapter>/<scene>.json` | approved scene-local continuity values | dialogue prose、camera |
| Creative backlog | `docs/narrative/CONTENT_PRODUCTION_TODO.md` | production progress、gates、known blockers | duplicated prompt/spec |
| Visual direction | `docs/art/PRODUCTION_VISUAL_DIRECTION.md` | global visual contract、shot economy、responsive composition | scene-specific narrative choice |
| Character identity | `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` | identity/wardrobe/reference authority | scene purpose、camera |
| CG production | `docs/art/CG_PRODUCTION_SPEC.md` + `.ai/schemas/CG_MANIFEST.md` | render-ready manifest contract、projection boundary | narrative rewrite |
| CG manifest values | `content/production/cg-manifests/<chapter>.json` | approved render-ready entries、reference bindings | global policy、renderer transport |
| CG execution | `docs/art/CG_EXECUTION_ADAPTERS.md` + `tools/render-cg-packets.mjs` | deterministic render-packet projection / transport envelopes | creative decisions |
| Asset metadata / provenance | `content/assets/manifest.json` + `content/assets/source-map.json` + `content/assets/source-catalog.json` + `content/assets/ingest-receipts/` + `content/recipes/assets.json` | logical asset IDs、runtime source/provider metadata、accepted-master provenance、ingest evidence、rebuild dependencies | creative canon、visual policy |
| Continuity schemas | `.ai/schemas/NARRATIVE_CONTINUITY.md` + `.ai/schemas/VISUAL_CONTINUITY.md` | semantic/visual continuity fields | scene-specific values |
| Runtime | `ARCHITECTURE.md` + current code/JSON/tests | implementation、data、save、build constraints | creative canon |

Machine validation shapes：`.ai/schemas/narrative-continuity.schema.json`、`.ai/schemas/cg-manifest.schema.json`。Cross-file validation：`tools/validate-production-contracts.mjs` recursively discovers every JSON manifest under `content/production/cg-manifests/`, checks its scene/contract and repo reference bindings, and rejects duplicate IDs across manifest files before a production Task Packet is released. The Opening acceptance receipt remains scoped to its original manifest.

`npm run production:review -- --scene <id>` 由上述既有 sources 重建 `generated/reviews/<id>/index.html`，僅作 Human 唯讀檢視。只有匹配的 run ledger、decision receipt 和來源版本通過 `production:run:check`，才顯示該項 Narrative QA `PASS_CURRENT` 或已記錄候選圖 Visual QA `CURRENT_FAIL`；每張候選圖的結果互不推定。沒有獨立 Visual QA/Human 決定時，已驗收圖片或 validator PASS 仍不代表 production-ready。該頁不是新的 source of truth。

## 2. Non-production roots

| Root | Lifecycle | Production rule |
| --- | --- | --- |
| `.ai/archive/` | `ARCHIVED` | historical operators/harnesses only；not Task Packet input |
| `.ai/experiments/` | `EXPERIMENTAL` | pilots/capability evidence only；not Task Packet input |
| `docs/archive/` | `ARCHIVED` | historical specs/prompts/recipes/proposals/content only；not Task Packet input |

A provenance receipt may point into these roots as historical evidence. That pointer does not make the target executable guidance. A bounded research/migration task may inspect them only under the exception rules in `.ai/policies/SOURCE_AUTHORITY.md`.

## 3. Runtime fixture note

Runtime fixtures are not production-authoring guidance. The former `content/routes/xu-tang/` package and its exclusive media have been retired; the active Opening route and CG identity references remain registered. Removing any other used fixture requires an explicit migration decision. The fixture rule lives in `.ai/policies/SOURCE_AUTHORITY.md`.
