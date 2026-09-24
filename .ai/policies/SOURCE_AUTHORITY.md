# Source Authority and Document Lifecycle

Version: 0.1.0

## 1. Conflict order

When two sources conflict, use this order:

1. `.ai/WORKFLOW_MANIFEST.yaml` for **how work is performed** and which source class may be read.
2. `PROJECT_STATE.md` for **current milestone and superseding project decisions**.
3. Task-specific locked production artifact, such as an approved scene file, for **its narrative facts, staging, wardrobe, expression, state, and continuity**.
4. Domain canon:
   - narrative: braided narrative + route/state specs;
   - visual: `docs/art/PRODUCTION_VISUAL_DIRECTION.md` + character reference manifest;
   - runtime: `ARCHITECTURE.zh-TW.md` + applicable implementation contract.
5. Supporting documents.
6. Proposal, historical recipe, migration fixture, archived material.

A lower layer never overrides a higher layer.

## 2. Important partial supersession

Some files remain useful but contain obsolete production instructions.

### `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`
Useful for location inventory, historical asset IDs, scene intent, and broad art needs.

Superseded for:
- sprite-first composition;
- mobile portrait 9:16 as the production master;
- assumptions that empty background + character sprite is the default rendered scene.

### `docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md`
Useful as historical shot intent and old prompt wording.

Superseded for:
- 9:16 output;
- batch queue execution in one general session;
- direct use as an all-in-one worker prompt.

New CG work MUST be repacked through Shot Planner -> CG Artist.

### Sprite recipes and sprite assets
Retained as W4/runtime regression fixtures and historical candidates. They are not requirements for new production content.

## 3. Proposal status

`docs/proposals/urban-dating-sim-setting-proposal.md` is supporting world/product ideation. It must not be loaded by a specialist worker unless a Task Packet names a specific needed section. It never overrides current prototype narrative, route/state, visual direction, or locked scene files.

## 4. Lifecycle labels

Use these labels in documents when practical:

- **CANONICAL** — current authority in its declared domain.
- **SUPPORTING** — usable context, never allowed to override canon.
- **LEGACY-FIXTURE** — kept because current runtime/tests still use it.
- **DEPRECATED** — do not use for new work.
- **ARCHIVED** — historical record only.

Do not delete a LEGACY-FIXTURE merely to make the tree look cleaner.
