# Document Status and Cleanup Map

> Status: **CANONICAL human-readable lifecycle index**
>
> Updated: 2026-09-24
>
> Machine/agent workflow authority lives in `.ai/WORKFLOW_MANIFEST.yaml` and `.ai/policies/SOURCE_AUTHORITY.md`.

## Current authorities

| Area | Current authority | Status |
| --- | --- | --- |
| AI work method | `.ai/WORKFLOW_MANIFEST.yaml` + `.ai/harnesses/` | CANONICAL |
| Current project state | `PROJECT_STATE.md` | CANONICAL |
| Runtime architecture | `ARCHITECTURE.zh-TW.md` | CANONICAL |
| Narrative plan | `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` | CANONICAL |
| Route/state | `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` | CANONICAL |
| Locked scene facts | `docs/narrative/scenes/vertical-slice/*.md` | CANONICAL within each scene, except rendering instructions superseded below |
| Visual production | `docs/art/PRODUCTION_VISUAL_DIRECTION.md` | CANONICAL |
| Character visual identity | `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` | CANONICAL catalog; per-task isolation required |
| W4 Memories/player contract | `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md` | CANONICAL |

## Partially superseded but retained

| File / area | Keep for | Do NOT use for |
| --- | --- | --- |
| `docs/art/PROTOTYPE_ART_REQUIREMENTS.md` | location inventory, old asset IDs, broad art intent | 9:16 master, sprite-first production |
| `docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md` | historical shot intent / wording | batch-session execution, 9:16 generation |
| existing scene rendering notes | narrative staging, wardrobe, expression, action timing | old sprite/9:16 rendering mode |
| `docs/art/recipes/backgrounds/opening_batch_a_backgrounds.md` | provenance for already-generated 9:16 assets | default spec for new background generation |
| `docs/art/recipes/sprites/` | provenance / runtime regression fixture | new production requirement |

## Supporting only

`docs/proposals/urban-dating-sim-setting-proposal.md` is world/product/future-character supporting context. Specialist workers load only explicitly allowed sections. It cannot override prototype narrative, route/state, visual direction, or locked scene facts.

## Cleanup policy

Phase 1 (current):
- establish manifest, harnesses, lifecycle labels, and supersession notices;
- stop new work from depending on stale instructions;
- preserve runtime fixtures and provenance.

Phase 2 (after harness pilot passes):
- extract reusable character/environment/task data into normalized packs;
- remove duplicate production instructions from old docs;
- move clearly historical material into an archive namespace when no runtime/tool references depend on path;
- update links atomically.

Phase 3:
- add validation/linting for forbidden stale production references (for example new tasks requesting sprite-first or 9:16 masters);
- automate Task Packet construction only after manual harness runs are stable.

Do not physically delete legacy files merely because they are no longer production authority.
