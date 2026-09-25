# Document Status and Cleanup Map

> Lifecycle: **CANONICAL** human-readable index
>
> Updated: 2026-09-25

Machine routing authority lives in `.ai/WORKFLOW_MANIFEST.yaml`; conflict rules live in `.ai/policies/SOURCE_AUTHORITY.md`. Full inventory and runtime-fixture boundary：`docs/CONTENT_PRODUCTION_SOURCE_MAP.md`。

## Lifecycle vocabulary

Production documents use exactly four lifecycle labels：`CANONICAL`、`EXPERIMENTAL`、`GENERATED`、`ARCHIVED`。

| Lifecycle | Meaning |
| --- | --- |
| `CANONICAL` | current authority within a declared domain |
| `EXPERIMENTAL` | pilot/research input or result; never production authority |
| `GENERATED` | deterministic output derived from canonical source; replaceable |
| `ARCHIVED` | historical record; never production authority |

`LEGACY-FIXTURE` describes runtime assets/capabilities, not document authority.

## Active authorities

| Area | Current authority |
| --- | --- |
| AI workflow | `.ai/WORKFLOW_MANIFEST.yaml` + active `.ai/harnesses/` + `.ai/schemas/` |
| Current milestone | `PROJECT_STATE.md` |
| Source/lifecycle map | `docs/CONTENT_PRODUCTION_SOURCE_MAP.md` |
| Narrative design | `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` |
| Route/state | `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` |
| Locked scene facts | `docs/narrative/scenes/vertical-slice/*.md` |
| Visual production | `docs/art/PRODUCTION_VISUAL_DIRECTION.md` |
| Character identity references | `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` |
| Creative progress | `docs/narrative/CONTENT_PRODUCTION_TODO.md` |
| Runtime architecture | `ARCHITECTURE.zh-TW.md` + applicable feature spec |

Locked scene files own narrative staging and semantic visual beats; they do not own render prompt syntax. Render-mode leftovers inside older scenes are historical annotations and cannot override the active visual/CG contract.

## Archived or experimental

| Path | Lifecycle | Notes |
| --- | --- | --- |
| `docs/archive/` | `ARCHIVED` | old art plan, prompt pack, recipe and backlog history |
| `.ai/archive/` | `ARCHIVED` | completed one-off operator material |
| `.ai/experiments/` | `EXPERIMENTAL` | pilots, capability tests, failure evidence |
| `docs/proposals/urban-dating-sim-setting-proposal.md` | `ARCHIVED` by default | bounded excerpts may be cited as supporting input; never overrides canon |

Active harnesses and Task Packets must not reference archive/experiment paths. Provenance receipts may point to an archived source that actually produced an asset.

## Cleanup rule

- Moving guidance to archive changes authority, not runtime capability.
- Do not delete composite/sprite/background/video support or binary fixtures merely to match the CG-first authoring model.
- Do not use a historical prompt as input to a new production task.
- New canonical contracts must be registered atomically in the workflow manifest and source map.
