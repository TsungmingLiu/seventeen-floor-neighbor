# Issue #16 — independent COM-01X Narrative QA checkpoint

This gate exercises the existing `tools/context.mjs` narrative-review path on a second real Locked Scene. It does not revise narrative prose, runtime content, CG bytes, visual QA, or Human acceptance.

| Identity | Verified value |
| --- | --- |
| Pinned source commit | `df2eb3e4c17d4b25fde64bedf166fb44e030ef7b` |
| Scene / task | `COM-01X` / `NQA-COM01X-001` |
| Run | `issue16-com01x-nqa-20260927` |
| Deterministic packet SHA-256 | `dcca09647592c9b27dbe3382e09fdf0a67b110971fe54e439258cafed8105e12` |
| QA handoff SHA-256 | `ca1ca63dc67fde51c88baacc71b93f1321427c8873e4715073954d33cbae11c2` |
| Short decision receipt SHA-256 | `f1c6c7851effedf1156646b54dc75d9d887016988d52602120e20a9300971064` |
| Reviewed output | `approved_locked_scene:COM-01X`, Git blob `f9be677e0c589bab2c7c49560e1fe882b553ec2e` |

The Coordinator generated and verified one packet before dispatch. A fresh GPT-6 Luna `content_qa / narrative_review` worker read only its five committed sources and exact canon excerpts, then returned PASS for scene function/exit, voice/knowledge/pacing, choice/rejoin/state, must-not/visual boundary, and provenance. The initial handoff omitted `output_versions`, so the Coordinator withheld acceptance. The same bounded worker completed that field against the packet's immutable Locked Scene blob; the completed handoff, packet, source versions, QA codes and output identity were independently checked before the short receipt and ledger were written. Only the receipt and ledger are in Git. The complete handoff remains in the ignored session cache and is not required for recovery.

From a new full-history checkout with an empty session cache, `npm run production:run:check -- --run-id issue16-com01x-nqa-20260927` reconstructs the packet from its pinned commit and must return `CURRENT_PASS`. `npm run production:review -- --scene COM-01X` then shows independently verified Narrative QA, with Visual QA and Human decision still `UNRECORDED` and overall readiness `NOT_READY`. A changed decision receipt or Locked Scene must fail closed; a PASS here does not approve another scene or any CG.

COM-01B still lacks the `Canonical inputs` binding required to generate its narrative-review Task Packet. That separate scene is not marked reviewed by this checkpoint.
