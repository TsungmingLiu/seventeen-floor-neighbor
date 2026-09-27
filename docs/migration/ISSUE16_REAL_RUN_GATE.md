# Issue #16: COM-00 Narrative QA run checkpoint

Gate 9 records one actual independent Narrative QA task. Its source is the Gate 8 commit `ea788a958c83851cfa0cca235825552fa66f2cb2`; the run ID is `issue16-com00-nqa-20260926` and task ID is `NQA-COM00-001`. The run remains `ACTIVE`. Narrative QA is `PASS`; this does not approve CG, runtime integration, playable review, or a Human gate.

| Evidence | Value |
| --- | --- |
| Deterministic packet SHA-256 | `7d04cc37570c82c0b64446775e8e4abe20b8ad71b2aec95d6f9f543890388730` |
| Decision receipt | `content/production/runs/issue16-com00-nqa-20260926/NQA-COM00-001.decision.json` |
| Receipt SHA-256 | `bdad253cef91ce22e2af60a5f2d9058e2b137662d7761c5367e0f4f2c165ff92` |
| Reviewed output | `approved_locked_scene:COM-00`, Git blob `4c8b9396fdf43556b474f9cbf7a90813ef533309` |
| QA results | `NQA-FUNCTION-01`, `NQA-VOICE-01`, `NQA-CHOICE-01`, `NQA-BOUNDARY-01`, `NQA-PROVENANCE-01`: PASS |

The fresh bounded worker verified the packet and the four committed inputs, reviewed only its allowed scene/contract and canon excerpts, then wrote its full handoff to the ignored session cache. The Coordinator checked the handoff, matched the output to the reviewed Locked Scene, and committed only the short decision receipt and ledger. The Handoff's SHA-256 is informational; no cache path is needed to resume.

From a fresh checkout with Git history containing the pinned `source_ref`, and with an empty `generated/session-cache/`, run:

```bash
npm run context -- --task narrative_review --scene COM-00 --run-id issue16-com00-nqa-20260926 --task-id NQA-COM00-001 --ref ea788a958c83851cfa0cca235825552fa66f2cb2
npm run context -- --verify-packet generated/session-cache/issue16-com00-nqa-20260926/NQA-COM00-001.packet.json
npm run production:run:check -- --run-id issue16-com00-nqa-20260926
```

The regenerated packet must match the ledger hash byte for byte; the run check must report `CURRENT_PASS`. It reads the committed ledger and receipt, checks input/output identities against Git, and writes only an ignored resume report. A missing/tampered decision, changed input, or absent pinned source commit blocks this conclusion. An orphaned `RUNNING` task with no durable decision yields `ORPHAN_RUNNING_REVIEW_REQUIRED`; it requires fresh bounded QA, never inferred PASS. The next production gate remains separate.

For a future *real* no-visual-impact finding, `production:impact --qa-decision <committed decision receipt>` checks the receipt, run task, QA code, old/new Locked Scene SHA-256 and reviewed output. Without this evidence, a changed Locked Scene conservatively invalidates visual descendants. Full worker handoffs and rejected candidates stay in the ignored session cache; the old `--qa-handoff` option is retired.
