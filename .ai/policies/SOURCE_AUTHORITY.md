# Source Authority and Document Lifecycle

Version: 1.1.0

Canonical inventory: `docs/CONTENT_PRODUCTION_SOURCE_MAP.md`.

End-to-end routing、dependency/invalidation 與 resume 由 `.ai/PRODUCTION_ORCHESTRATION.md` 定義；Production Run Ledger 是 `GENERATED` execution evidence，不是新的 creative authority。Coordinator 遇到 canonical conflict 需 `BLOCKED`，不得為解釋衝突擴讀 archive。

## 1. Conflict order

1. `.ai/WORKFLOW_MANIFEST.yaml` — workflow routing and source classes.
2. `ROADMAP.md` — current milestone and work priority; it does not override task-specific accepted artifacts or domain contracts.
3. Task-specific locked artifact — approved scene, canonical CG manifest entry, accepted asset receipt.
4. Domain canon — narrative, visual, character identity, runtime contracts.
5. A bounded supporting excerpt explicitly named by the Task Packet.

This order applies only when two sources claim the same decision. `ROADMAP.md` owns milestone priority, never scene facts or technical schema; a locked artifact owns its approved task-local values, and domain canon owns its declared rules. A lower layer never overrides a higher layer within the same domain. Conflicting sources at the same authority level require `BLOCKED`; the worker must not invent a compromise.

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

## 4. Runtime fixtures

Assets referenced by the manifest/source map, composite rendering, stable IDs, generic video support, and save/migration behavior remain available until intentionally migrated. The old `xu-tang` route and its exclusive assets were retired by an explicit Owner decision; its archived pointers are historical evidence, not production inputs. Removing obsolete guidance does not itself authorize deleting any other used capability or asset.

## Production storage

Formal CG/narrative specifications and adopted asset/QA/Human evidence remain source. Generated full job/attempt state is non-authoritative and belongs in ignored `generated/job-artifacts/`; only compact durable checkpoints/decisions may enter `content/production/runs/`. The Run Ledger schema defines legacy immutable storage projections and recovery. Hash-verified historical Git evidence is not permission to load creative history or infer a new PASS. Authorized engineering maintenance does not create a new art-production run.
