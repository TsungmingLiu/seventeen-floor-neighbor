# Ephemeral execution layer — engineering POC

Reusable tooling and scratch rules are tracked; compiler outputs are **GENERATED**
and disposable. This engineering prototype adds no creative authority and does not
replace the existing bootstrap, harnesses, Task Packet schema, run ledger or gates.

## Storage and commit rule

Use the existing `generated/session-cache/` execution layer for Task Packets, full
handoffs, context bundles, logs and QA scratch. Never force-add anything in it.
No second `.ai/work/` directory or tracked per-task registry is needed.

Run `npm run scratch:check` before committing. It checks the actual Git index,
including force-added/previously tracked files, requires the explicit ignore rule,
and checks ignore behavior. `npm run validate` and the Verify CI job also run it;
CI fails if a commit contains tracked scratch. This is a deterministic guard, not
an installed Git hook: a local commit made without checks is caught by validation/CI.
Enforcing it at merge requires the repository's existing required-check settings.

Canonical scene/contract/tooling and verified short decisions remain in their
existing locations. Actual production ledgers and necessary concise decisions
retain the durability required by `.ai/PRODUCTION_ORCHESTRATION.md`; this POC
neither relocates nor deletes them. Dry runs do not create production ledgers,
QA receipts or Human approvals.

## COM-02X narrative_review demonstration

From a checkout with canonical sources matching the selected immutable ref:

```sh
npm run context:poc -- --scene COM-02X --base <base-commit> --ref <source-commit>
npm run context -- --verify-packet generated/session-cache/quota-poc/COM-02X/task.packet.json
npm run scratch:check
```

For the initial real example, base is
`13e4d71d1a0590d19b690d2ac292a7e081d8d539` (before the existing first-person scene
revision), source is `fb21d1a7ffb959aac49dcc264f07805c7a8372e7` (main at POC start).
The compiler uses that real committed diff; it makes no narrative edits.

The prototype calls the existing `buildNarrativeReviewPacket` resolver/verifier
and the existing content/production validators. Scene/contract bindings determine
the allowed sources and existing excerpt boundaries; no new content registry,
AI summarizer or hand-maintained character facts are introduced. Dirty, missing,
uncommitted or symlinked canonical inputs are rejected. Commit-to-commit diffs only:
uncommitted rewrites and staged diffs are not supported in this POC.

Three files are created exclusively under
`generated/session-cache/quota-poc/<scene>/`:

- `task.packet.json`: the existing exact Task Packet, compatible with its verifier.
- `worker-input.md`: that packet plus verbatim full sources/approved excerpts and
  changed-file/hunk navigation hints. No old prose or unrelated diff content is
  added. Canon changes outside selected excerpts are named, never silently exposed
  as new worker context. Hints do not classify semantic impact or select delta QA.
- `metrics.json`: source sizes/hashes, immutable refs, tool hashes and comparisons.

There is no arbitrary output-path option. Existing files and output symlinks are
refused; delete only this POC's ignored scene directory to rebuild. Compare all
three files' hashes before/after an empty-cache regeneration with the same refs
and compiler version. A new checkout at this POC branch can do the same because
canonical source bytes remain unchanged; fetching the referenced commits may be
needed in a shallow clone. Scratch state is never required for reconstruction.

## Worker boundary and measurement

The worker's task-local input is `worker-input.md`. All mandatory bootstrap,
source/context policies, source map, full `content_qa` harness and HANDOFF schema
remain separate required reads. This POC does not dispatch a worker or record a
semantic QA result; `quota-poc` is a dry-run identifier, not an approved run ledger.
Production dispatch still needs the existing ledger/dependency/gate checks.

Metrics count those shared reads in **both** baselines and the compiled input:

- Full-source baseline: shared instructions + original packet + all allowed files
  in full (the repeated whole-file reading pattern under investigation).
- Existing bounded baseline: the same shared instructions/packet + only the
  excerpts already allowed by `context.mjs`.
- Compiled input: the same shared instructions + inline bundle including hashes
  and Git diff hints. Metrics and the duplicate scratch packet need not be fed to
  the worker; feeding them too would increase context.

UTF-8 byte counts measure input volume, **not tokens, model inference overhead or
billed quota**. No model usage telemetry or repeated fresh-worker A/B trial is
available here. File-read consolidation alone does not prove quota savings, and
the existing excerpt resolver's benefits must not be attributed to new tooling.
The initial results and validation evidence belong in the PR description rather
than tracked per-run measurement files.

## Follow-up boundary

Reusing deterministic validators is worthwhile; duplicating them is not. Consider
scene/node dependency mapping and a focused delta-QA experiment next, with changed
node evidence, explicit escalation to full review on semantic/state/knowledge or
dependency changes, and final independent full Narrative QA. Establish a bounded
baseline and collect real model usage plus review-quality results first. Git hunk
ranges alone cannot prove unaffected continuity or preserved QA quality.

No narrative content, runtime, CG, harness refactor, production gate changes,
new validator framework or delta QA is part of this prototype.
