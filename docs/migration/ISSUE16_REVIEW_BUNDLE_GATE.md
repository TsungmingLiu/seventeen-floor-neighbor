# Issue #16 — Human Production Review Bundle

> Engineering gate, 2026-09-26. A generated review page is evidence for a Human to inspect, not a new approval record.

## Before state

Work branch baseline: `2e2202acf36fecab9ecfaa0561823ca79c440073`; `main`: `3a9ab8fa449b4d3485d695d7debbea58f2f90a49`.

For COM-01X, a reviewer previously had to open its Locked Scene, Narrative Continuity Contract, three CG manifest entries, accepted asset receipt/catalog, route chapter and Memory event separately. The playable route and accepted WebP bytes exist. No production run ledger, independent Narrative/Visual QA handoff, or persistent final Human decision exists in the branch. The Locked Scene's own review log and the manifest's `accepted` field do not prove those independent gates occurred.

## Generated surface

`npm run production:review -- --scene COM-01X` writes `generated/reviews/COM-01X/index.html`, a gitignored static, read-only HTML page. It draws the scene's purpose, entry/exit relationships and knowledge, actual runtime choices/state effects, CG specs, embedded thumbnails from SHA-verified accepted repo WebPs, known issues, Memory/replay/visual bindings, reachable next mapped scene, canonical planned targets, validator result and committed source hashes from the existing artifacts. It adds no metadata to the Narrative Contract, CG manifest or asset registry and makes no remote request.

The generator runs the existing content and production validators, then verifies that every displayed source matches committed `HEAD`. Accepted thumbnails must match the runtime manifest → source map → source catalog → accepted receipt identity and SHA-256. A missing or conflicting binding blocks generation; it does not draw an empty replacement. Regeneration removes the prior ignored page before validation so a failed command cannot leave an old page mistaken for current evidence. Output is deterministic for the same committed tree. The HTML escapes source text, allows only embedded WebP images and contains no script or writable controls.

Production status distinguishes **existing route binding and accepted asset bytes** from **independent decisions**. Without a persisted run/handoff, Narrative QA, Visual QA and Human approval say `UNRECORDED`; stale status is `UNKNOWN_NO_RUN_LEDGER`, so overall readiness remains `NOT_READY`. This is a truthful review surface for existing COM-01X, not a claim of final production acceptance. A later gate must persist real decisions and validate versions before showing PASS or recovering a run.

## Acceptance evidence

- COM-01X page contains three accepted CGs with embedded WebP bytes, the three alternatives at `common_elevator_restart_choice`, `mem.opening.ch1.elevator-restart` replaying from `common_elevator_restart_enter`, and reachable COM-01B via `common_bookstore_bridge_enter`. The same command also regenerated the other three existing Opening scene views without changing canon.
- Focused tests: 5/5 PASS. They verify actual thumbnail SHA-256, route choices/Memory/next scene, deterministic and offline HTML, escaping/unsafe thumbnail rejection, stale generated-page cleanup on failure, and `NOT_READY` with unrecorded decisions.
- In an isolated copy, a dirty COM-01X contract, a conflicting accepted receipt and a changed WebP byte each returned `BLOCKED` and removed the previous page. Restoring each source reproduced SHA-256 `06d8bd5c0ee721c97810fbc8831012a8dd4a180ef2c7f38fc4699b02f9896875` on the baseline commit.
- Full local regression: `npm run assets:check` **49/49**, `npm run assets:build` **49**, `npm run build` **2 routes / 49 assets**, `npm run validate` **2 routes / 4 narrative contracts / 8 Opening CG entries**, `npm test` **53/53**, `npm run preview:smoke` and `git diff --check`: **PASS**. A fresh offline checkout remains the final checkpoint check. Record the remote ref and Verify result in PR #21.

This gate does not produce a QA or Human decision, run ledger, artifact-level invalidation result, or a new playable scene.
