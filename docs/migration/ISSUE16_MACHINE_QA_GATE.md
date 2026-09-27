# Issue #16 — machine preflight before narrative QA

> Engineering evidence, 2026-09-26. This gate does not approve narrative or visual content.

## Before state

Baseline work branch: `cd057245f67d74f29cfc517a9142229cb3d952f4`; `main`: `3a9ab8fa449b4d3485d695d7debbea58f2f90a49`.

The existing `npm run validate` already checked narrative contract structure and Locked Scene backlinks, the Opening CG manifest, accepted receipt/reference bindings, route node targets and reachability, asset IDs, and Memory node existence. The COM-00 `narrative_review` packet from Gate 5 verified committed source bytes, but neither packet creation nor dispatch verification invoked these existing validators. A fresh worker could therefore receive a structurally broken runtime or manifest unless the Coordinator remembered a separate command. The validators also did not reject an undeclared choice state write, a Memory unlock target preceding its replay anchor, an absent route terminal, or a *non-first* CG entry bound to a different existing scene file.

## Change

For `npm run context -- --task narrative_review ...`, packet creation and `--verify-packet <path>` now run the existing runtime/content and production-contract validators before printing PASS or handing out a packet. Failed machine checks return `BLOCKED` and do not release a new packet. The standalone `npm run validate` and `npm run production:validate` invoke the same production checks; the latter was made importable instead of building a parallel validator.

The shared runtime validator now checks numeric initial state and choice writes, numeric branch/ending comparisons, replay anchors and forward-reachable Memory unlock nodes, and reachable route terminal/default ending. Production validation checks **every** CG manifest entry's `source_scene` against its scene's Narrative Continuity Contract, including COM-01B; the existing Opening scene backlink rule remains in place. These are structural checks. Whether a payoff is convincing, a visual beat is complete, character voice is right, or a branch feels emotionally plausible remains independent semantic/visual QA; the machine cannot infer those facts from prose without new creative metadata.

No story node, stable ID, asset, save format, or active registry changed. The legacy `--route`/`--node` context interface still works. The generated Task Packet remains a gitignored session artifact: rerun `--verify-packet` at dispatch because it performs current machine checks as well as its immutable source/hash check. No Human/QA PASS is synthesized from these results.

## Acceptance evidence

- Focused tests: 9/9 PASS, covering unknown/non-numeric choice effect; Memory unlock bound before its replay anchor or missing the anchor; route with no reachable terminal; and a non-first CG entry whose `source_scene` names the wrong but existing scene.
- Isolated copy CLI injection: `unknown_state`, `bad_memory` and `wrong_scene` each returned `BLOCKED` from both packet creation and verification of an existing packet. No failed creation wrote a packet. After restoring the three sources, the existing packet verified again (SHA-256 `06544f4c001c41a0cec645c90a1843b4042d87d83784b21340c0a6c816c7a98e`).
- Full local regression: `npm run assets:check`, `npm run assets:build`, `npm run build`, `npm run validate`, `npm test`, `npm run preview:smoke` and `git diff --check` all PASS; the default Opening route and regression fixtures remain readable.
- Fresh checkout with empty session cache and unavailable Drive must generate and verify the COM-00 packet, then pass the offline build and validators. Record the remote checkpoint and this readback before closing the gate.

This gate does not assert full Issue #16 acceptance. Semantic visual-beat coverage, future-scene production binding, Human Review Bundle, artifact-level invalidation, persistent gate decisions and real-run session recovery still require separate verified work.
