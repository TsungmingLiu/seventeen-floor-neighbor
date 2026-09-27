# Issue #16: recorded run and artifact impact reconciliation

Gate 12 starts from verified Gate 11 ref `92a0317d9857b890ea82d7d773bb02b848064861`. It extends the existing read-only impact report for the **one actual COM-00 Narrative QA task**. No narrative, image, route, accepted asset, QA decision or run ledger is changed.

## Before state

- `production:run:check` rebuilt the committed COM-00 packet and decision receipt and returned `CURRENT_PASS` against an unchanged checkout. Its source commit is `ea788a958c83851cfa0cca235825552fa66f2cb2`.
- `production:impact -- --scene COM-00 --from <source-ref> --to HEAD` found zero changed artifacts but still reported `UNKNOWN_NO_RUN_LEDGER`. It never compared the actual task's recorded inputs and output to the impact target.
- The run checker previously needed the current checkout's Locked Scene bytes to match the old source. That prevented historical receipt verification before proposing what to review after a committed scene change.

## Gate boundary

With `--run-id issue16-com00-nqa-20260926`, the existing impact tool checks the target is committed `HEAD`, the comparison's `--from` exactly matches the ledger's `source_ref`, and the run contains the COM-00 `narrative_review` task. It rebuilds and checks the pinned Task Packet in a temporary detached checkout of that source commit. The ledger and decision receipt must be committed at the target and match the packet, approved Locked Scene version and QA codes. The detached checkout is removed after the check.

The report then compares that task's **recorded input and output Git blob versions** with the target commit. `run_reconciliation` records the run ID, task ID, decision receipt, verified historical `RECORDED_PASS`, and either `CURRENT_PASS` or `STALE_PROPOSED` for this task, including each changed recorded version. It does not write a task status or an invalidation event into the ledger. The preexisting artifact `changes` and `would_invalidate` retain their own scope. `VERIFIED_RECORDED_NARRATIVE_QA` describes only the historical Narrative QA evidence; it is no Visual QA, CG acceptance, or Human decision.

The fixed source commit must be present locally (a full-history checkout). A missing or forged receipt, wrong scene/ref/target, or altered source packet **blocks** generation; the previous ignored report is removed. Unsupported other run/task types remain blocked rather than inferred from this one example. The existing `production:run:check` output is unchanged.

## Controlled checks

| Committed target edit in an isolated checkout | Recorded COM-00 task | Artifact impact |
| --- | --- | --- |
| None | `CURRENT_PASS` | No changed artifacts |
| Locked Scene text | `STALE_PROPOSED` | Fresh Narrative QA and conservative visual descendants proposed; no unrecorded no-visual-impact waiver |
| COM-00 CG manifest camera only | `CURRENT_PASS` | Visual entry and descendants proposed; Narrative QA task remains current |
| Narrative canon file recorded as task input | `STALE_PROPOSED` | Scene impact projection alone sees no change; the recorded full-file input blob changed |
| Wrong source ref or tampered committed QA receipt | `BLOCKED` | No stale JSON report retained |

This run's full-file narrative canon blob is deliberately treated as changed even if the edited line is outside a scene excerpt; the current packet records the full Git blob as an input version. Narrowing that provenance requires its own verified packet contract. The report is a review plan; downstream dispatch still requires the relevant independent gate and accepted evidence.

## Local verification

The real COM-00 report from source ref to Gate 11 `HEAD` contains zero changed artifacts and `CURRENT_PASS` for `NQA-COM00-001`; its JSON SHA-256 is `f20c1db559cf121fca29ddcb9aff658d3edf09c91bc525aaf1e810bcf0eaefe5`. The unchanged `production:run:check` resume report SHA-256 is `f0625a7c507322a9a544c433d390505f8c67b4a9749b779ba5a23c99cf8db2d7`. An incorrect CLI `--from` exits nonzero with `BLOCKED`.

Focused run/impact tests **16/16 PASS**; full `npm test` **75/75 PASS**. `npm run assets:check` **49/49**, `npm run assets:build` **49**, `npm run build` **2 routes / 49 assets**, `npm run validate` **2 routes / 180 nodes / 4 Narrative Contracts / 8 CG entries**, `npm run preview:smoke` and `git diff --check` all pass. Remote checkout and Verify CI results belong to the corresponding PR checkpoint.
