# Gate 14 — scene-scoped manifest usability Task Packet

> Engineering preflight on an existing manifest. This gate does not review candidate pixels, generate art, change accepted assets, or record a Visual QA/Human decision.

Baseline: PR #21 checkpoint `8dbf9dc1cb310caa549a48fb6dfec4163f3f2842`. The COM-00 Locked Scene has an independently verified Narrative QA PASS in run `issue16-com00-nqa-20260926`; this receipt is evidence for the **scene only**. The existing chapter CG manifest contains three accepted COM-00 entries alongside other scenes. The human schema/usability review remains outstanding in `docs/narrative/CONTENT_PRODUCTION_TODO.md`.

## Existing source, bounded worker input

| Entry ID | Scene | Review input |
| --- | --- | --- |
| `COM00-S02-DOOR-ASSIST` | `COM-00` | Event CG entry |
| `COM00-S04-BASE-NEUTRAL` | `COM-00` | Base dialogue CG entry |
| `COM00-S04-R01-POLITE-SMILE` | `COM-00` | Reaction entry bound to its accepted base |

The Coordinator must name all three entry IDs. The same `tools/context.mjs` entrypoint validates the existing source manifest and extracts only these entries plus its shared style contract. A fresh reviewer receives exact Git/ref/path and hashed line ranges, the approved COM-00 scene/contract, global visual direction, Xu Tang's identity excerpt and the existing CG schema. It does not receive other scenes, their character specifications, a candidate image or unbounded chapter manifest. Reference/catalog and accepted-base image bytes are machine-checked before dispatch, but this packet does not claim pixel-level candidate QA.

At this baseline, the entire chapter manifest is 40,839 bytes. The selected style and three COM-00 entry ranges are 15,466 bytes (lines 11–27 and 29–423); no COM-01X/COM-01J entry is acquired by the reviewer. The full committed Git blob SHA is checked before slicing, while each entry's render spec has its own hash for later artifact-level comparison.

```bash
npm run context -- --task visual_review --review-scope manifest_usability --scene COM-00 --run-id <new-run-id> --task-id MUA-COM00-001 --upstream-run-id issue16-com00-nqa-20260926 --upstream-task-id NQA-COM00-001 --entry-ids COM00-S02-DOOR-ASSIST,COM00-S04-BASE-NEUTRAL,COM00-S04-R01-POLITE-SMILE --ref <current-HEAD>
npm run context -- --verify-packet generated/session-cache/<new-run-id>/MUA-COM00-001.packet.json
```

The generated packet and any future handoff stay in gitignored session cache. It binds the previously committed Narrative QA receipt as external evidence, and `depends_on` remains scoped to task IDs within the new run. Only a **separate, fresh** `content_qa / visual_review` worker can return a manifest usability result, followed by Coordinator validation and any required Human review; this engineering gate creates no ledger or PASS receipt. Candidate Visual QA is a different task with candidate pixels. No existing `accepted` manifest status can be used as a substitute for either review.

## Verification boundary

Focused tests check deterministic regeneration, entry and character isolation, committed source hashes, missing/duplicate/wrong-scene entry IDs, reaction accepted-base integrity, changed QA/scene/source bytes and tampered packet/cache conflicts. Full repository checks and a fresh remote checkout are recorded in the PR checkpoint.
