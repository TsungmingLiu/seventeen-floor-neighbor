# Issue #16: committed Narrative QA in the Human Review Bundle

Gate 10 joins the existing read-only production review page to the actual COM-00 Narrative QA run from Gate 9. Before this change, `production:review -- --scene COM-00` showed `UNRECORDED` for Narrative QA even though the repository had a committed PASS ledger and decision receipt. COM-01X has no equivalent run and must still show `UNRECORDED`.

The generator discovers ledger files under the existing `content/production/runs/` root. For the requested scene it requires an unambiguous `narrative_review` task and calls the existing `verifyProductionRun` checker. That checker regenerates the Task Packet from its pinned source commit and verifies the packet SHA-256, current committed inputs and Locked Scene output, and the committed decision receipt. Only `CURRENT_PASS` becomes `PASS_CURRENT` on the review page. The page lists run/task ID, receipt path and SHA-256, packet and input digest SHA-256, input/output identities and the five QA codes. These are evidence for **Narrative QA of COM-00 alone**.

The same page still reports Visual QA and Human decision as `UNRECORDED` and overall readiness as `NOT_READY`. Its stale field reads `NARRATIVE_QA_CURRENT_OTHER_GATES_UNKNOWN`, rather than claiming the whole scene or accepted art has been re-reviewed. Manifest `accepted`, valid WebP bytes, route bindings and a passing validator remain separate facts. For a scene with no matching run, the earlier unknown statuses stay intact. An orphaned run with no durable decision requires review; a dirty receipt, changed reviewed input, missing source commit or ambiguous matching run blocks generation and removes an older generated page.

The output is the same gitignored, self-contained HTML from `tools/production-review.mjs`; no new registry, approval record, authoring UI, remote request or content change was added. The existing renderer escapes the displayed provenance fields. Its status footer now reflects the model rather than a fixed `UNKNOWN_NO_RUN_LEDGER` sentence.

## Gate verification

- Focused tests compare real COM-00 `PASS_CURRENT` with COM-01X `UNRECORDED`, confirm Visual/Human/readiness stay unchanged, and tamper with the committed receipt in an isolated worktree. The tamper must block generation and remove the prior page.
- Rebuild the page from a fresh Git checkout with an empty session cache and Drive credentials removed. Confirm the committed run/receipt, the current source versions and offline static HTML; then run the repository's asset, build, validation, test and preview smoke commands.
- This gate displays the actual Narrative QA decision. Artifact-level reconciliation of the run's task statuses with future changed inputs remains a separate production gate; the review page does not write `STALE` to the ledger.
