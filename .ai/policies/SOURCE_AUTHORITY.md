# Source Authority and Document Lifecycle

Version: 1.0.0

Canonical inventory: `docs/CONTENT_PRODUCTION_SOURCE_MAP.md`.

## 1. Conflict order

1. `.ai/WORKFLOW_MANIFEST.yaml` — workflow routing and source classes.
2. `PROJECT_STATE.md` — current milestone and accepted superseding decisions.
3. Task-specific locked artifact — approved scene, canonical CG manifest entry, accepted asset receipt.
4. Domain canon — narrative, visual, character identity, runtime contracts.
5. A bounded supporting excerpt explicitly named by the Task Packet.

A lower layer never overrides a higher layer. Conflicting sources at the same authority level require `BLOCKED`; the worker must not invent a compromise.

## 2. Lifecycle

Documents use exactly these lifecycle labels：

- **CANONICAL** — current authority in its declared domain.
- **EXPERIMENTAL** — pilot/capability work; never production input.
- **GENERATED** — deterministic output rebuilt from canonical source; never reverse authority.
- **ARCHIVED** — historical record only; never production input.

`LEGACY-FIXTURE` describes a runtime asset/capability that remains necessary for regression or migration. It does not make its old production document canonical.

## 3. Read rules

- A production Task Packet may allowlist only `CANONICAL` sources and the minimum task-specific accepted references.
- Active harnesses must not reference `.ai/archive/`, `.ai/experiments/`, or `docs/archive/`.
- A provenance receipt may retain a pointer to archived material that actually produced an asset; that pointer is evidence, not executable guidance.
- A research/migration task may read archive/experiment material only when its objective explicitly requires it. Its output still cannot silently change canon.
- `docs/proposals/urban-dating-sim-setting-proposal.md` is archived-by-default ideation. A Task Packet may cite a precise excerpt as supporting context, but it never overrides current narrative/route/scene facts.

## 4. Runtime fixtures

Existing sprite/background assets, composite rendering, legacy route packages, stable IDs, video support, and save/migration behavior remain available until intentionally migrated. Removing obsolete guidance never authorizes deleting these capabilities or assets.
