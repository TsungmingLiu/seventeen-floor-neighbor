# M0 asset coverage and exit gate review

Lifecycle: **GENERATED** engineering evidence, not art/QA/Human authority.
Audited 2026-10-02 against PR #43 source head
`720843ec9cc6914ede5ef45d5515a9cf705d4d1e` (main base `e0c3a86…`).
No runtime, narrative, art, asset registry, QA or Human decision bytes changed.

`npm run assets:coverage` emits deterministic JSON from current registry,
source-map/catalog metadata, the exact five supported ingest receipts, their
three recorded COM02X Human decisions, and runtime bindings. Catalog production
status alone cannot grant acceptance. Missing, conflicting or hash/identity
mismatched adoption evidence becomes `unverified`; runtime evidence/binding
errors exit nonzero. Receipt and decision document SHA-256s are included.
Image bytes/pixels are not acquired by this report (`binaryBytesVerified: false`);
existing build and production validators retain their byte/media checks.

| Status | Registered inventory | Runtime bound |
| --- | ---: | ---: |
| placeholder | 1 | 0 |
| provisional | 2 | 2 |
| accepted | 17 | 17 |
| unverified | 0 | 0 |
| Total | 20 | 19 |

All 19 runtime-bound assets are both allowlisted and actually referenced.
The one unused asset is `bg.narrative_preview.placeholder`; its preview-only
receipt remains registered, but it is not a missing-CG runtime binding.
Runtime references include chapter title/ending, individual ending art,
composite/CG/cinematic nodes, and Memory covers/backdrops/Gallery assets.
Declared and referenced assets are reported separately; an unknown binding,
missing allowlist entry, kind mismatch or contradictory adoption fails closed.

The two `COM01J` wardrobe-drift entries remain `provisional` despite the broad
repo demo-adoption receipt. Four COM02X entries remain `accepted` within their
exact Human `ACCEPTED_AS_IS` scope, with independent Visual QA `FAIL` preserved.
`cg.opening-ch1.com01b.02` is also accepted with its recorded accessory drift.
These **seven** runtime assets carry release coverage constraints. Their
acceptance is neither silently revoked nor widened into release readiness.

`npm run validate:release` first runs existing `validate:final`, then strict
coverage. It rejects runtime placeholder/provisional/unverified/known-issue
assets, including preview assets that are only in the route allowlist or a
route that still opts into preview art. Its current exit **1** is expected:
`coverageClear: false`, seven constrained assets, zero binding errors.
The normal report exits **0** because these known scopes are valid demo inputs.
CI runs the report and tests, not the strict release command.

All asset `releaseReadiness` values remain `not_recorded` and
`playableAcceptance` is `not_assessed`. Even a strict PASS means only
`runtime_asset_coverage_clear_only`; it does not create a release decision,
independent Visual QA PASS or Human playable acceptance. `validate:final` still
checks existing structural/production requirements and excludes preview art;
its success output now describes that scope explicitly.

## Verification

Node **22.23.3**: new coverage tests **15/15 PASS**; existing content-validation
and context-packet regression tests **15/15 PASS**. Build (21 media files),
`validate`, `validate:final` and `production:storage:check` passed.
The actual chained `validate:release` exited **1** after successful final
validation with seven constrained runtime assets and no binding/provenance
errors. The preceding PR head's clean **117/117** full-suite CI is recorded in
the stale audit; it does not stand in for this extension's full-suite CI.

Use Node 22:

```bash
npm run assets:coverage --silent > /tmp/asset-coverage.json
npm run validate:release
node --test tests/asset-coverage.test.mjs tests/content-validation.test.mjs
npm run build
npm run validate
npm run production:storage:check
git diff --check
```

Full packets, source acquisition identities, reports, test logs and worker
Handoff remain ignored under `generated/session-cache/m0-asset-coverage/`.
The report binds document SHA-256s rather than a moving branch name, and can be
rebuilt from the unchanged canonical inputs. This audited report SHA-256 is
`95f3f06399319d8af42b60f8bd1eab2ca96593a09620ce9644b5e32f18370720`.
The Coordinator verified all 29 packet source blob identities and all 12 worker
output SHA-256s against the bounded Handoff.

## M0 Exit Gate review

This table preserves the original audit checkpoint; subsequent closure is linked below.

| M0 criterion | Evidence and remaining gate |
| --- | --- |
| Accepted scenes use registered runtime art | PR #39 COM02X exact bindings and checkpoint; current coverage verifies 19 runtime identities |
| Missing CG can use canonical playable placeholder | Existing COM02X preview-stage evidence and preview contract tests; placeholder remains available |
| Placeholder cannot count as release complete | Separate inventory/runtime counts and strict coverage rejection; readiness not inferred |
| Real scene material change produces bounded stale rejection | Current COM02X controlled edits and integration preflight in [stale gate audit](M0_CURRENT_SCENE_STALE_GATE.md) |
| Active docs/runtime/build describe one production path | Repo-native baseline preserved; architecture/source-map/scripts/CI describe the new coverage contract |
| Main checks and fresh playable acceptance | PR #43's prior head passed Verify 624 (117/117, deployment/smoke); this extension still needs new-head CI and merge/main verification. COM02X final Human playable acceptance remains unrecorded |

At this audit checkpoint, the M0 engineering mechanism was complete on the
branch, with main verification and final Human playable acceptance still open.
The subsequent merged baseline and actual Human acceptance are recorded in
[M0 foundation acceptance](M0_FOUNDATION_ACCEPTANCE.md). Known provisional/accepted-as-is
art remains visible for later scoped quality work; M0 does not require this
maintenance task to regenerate it. The subsequent M1 scope proposal is recorded
separately from this coverage audit. Issue #27 orchestration and M4 full release
acceptance remain outside this change.
