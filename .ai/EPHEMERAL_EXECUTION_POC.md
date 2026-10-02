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
billed quota**. This initial compiler comparison has no model usage telemetry;
the separate Phase 2 trial below collects it. File-read consolidation alone does
not prove quota savings, and
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
new validator framework or delta QA is part of the initial compiler prototype.
The separate experimental Phase 3 below tests a delta QA hypothesis.


## Phase 2: paired reduction benchmark

The read-only engineering experiment uses `npm run context:benchmark`. It does
not change production packets, verifier semantics, harnesses or dispatch gates.
It prepares four arms from the **existing bounded baseline**, with the same full
mandatory instructions and full COM-02X candidate in every arm:

- `baseline`: exact packet and the existing allowed sources/excerpts.
- `continuity`: COM-00/COM-01X use deterministic verbatim sections: scene summary,
  state contract, voice notes, end state and exact name/late-conversation/exit nodes.
  Missing or duplicate headings block preparation. Original line ranges and hashes
  are retained; there is no AI summary or inferred character fact.
- `digest`: routing/constraints remain, but duplicate acquisition, allowlist and
  input-version metadata is removed from the experimental worker view. Each source
  carries its original blob, excerpt ranges and supplied-content hash once. The
  exact unchanged base packet remains in scratch for machine verification.
- `combined`: both projections.

Existing validator success output is already short. No additional validator-log
saving is claimed in this experiment, and no synthetic verbose log is introduced
as a convenient baseline. Full errors/events stay in scratch; the runner prints
only completion/status/usage. Worker tools are forbidden in **both** arms so tool
round-trip reduction is not tested here.

```sh
npm run context:benchmark -- --prepare --run-id trial-01 --base <base-commit> --ref <source-commit>
# Explicitly runs 12 fresh model sessions and consumes account usage:
npm run context:benchmark -- --run --run-id trial-01
node tools/review-quota-trial.mjs --run-id trial-01
```

`--prepare` is deterministic and makes no model calls. Output is exclusive-created
under `generated/session-cache/quota-benchmark/<run-id>/`. It contains 24 generated
inputs, one common instruction file, an exact base packet, schema, source audit,
measurement manifest and a hidden scoring key. Only fixture **recipes** are tracked.
Preparation validates actual canonical content first. Experimental candidates do
not pass themselves off as canon or production-verifier-approved rewrites.

`--run` checks every prepared byte against a rebuild before spending quota, uses
saved CLI authentication without reading/copying auth credentials, and preserves
user-configured model/reasoning settings. It records these settings/CLI version,
checks config drift, runs one isolated read-only ephemeral session per case/arm,
interleaves order and stops on any failure, malformed answer, scope expansion or
missing usage. No automatic retry and no continuation of a previous worker.
The model's single-turn JSONL usage includes system/tool-schema overhead. Cached
input is a subset of input tokens; reasoning output is recorded separately as
reported, never added a second time to total input + output. Missing fields remain
missing, not fabricated zeroes. One run ID cannot overwrite a prior trial.

The six opaque cases are original, harmless local wording, contact-knowledge leak,
premature romance, a branch bypassing shared required payoffs, and repeated unnatural
formal dialogue. Workers never receive case labels, gold expectations, audit,
comparison table, usage results or answers from other workers. Canonical scenes,
continuity JSON, game/runtime and other worktrees are never mutated. Fixtures are
semantic probes; production validators validate the base canon, not their injected
prose. This is not delta QA or a new production validator.

Three known hard errors are scored by category, severity and affected node/branch
with nonempty evidence/reason; misses remain misses rather than relabeling the
probe after seeing results. Original/harmless hard findings are **false-positive
candidates**, requiring adjudication, not automatically declared false positives.
The naturalism probe remains advisory/Human-scored. The threshold is all hard
probes detected in both arms plus at least 20% median total-token reduction.
Even meeting that mechanical threshold does not approve adoption: independent
Human blind comparison must confirm quality and absence of new material false
positives. The generated blind HTML shows candidate text and X/Y answers without
arm identity, usage or gold. Record Human judgment separately; never invent it.

A single pair per case is a pilot, not a statistical quality or quota guarantee.
Report cumulative and per-case tokens, cached/reasoning counts, elapsed time,
misses and control findings. Subscription quota reduction remains unmeasured.
Keep all raw outputs and blind label keys ignored. Record only reusable tooling,
regeneration instructions and a concise outcome in the PR.

## Versioned comparisons after updating main

Keep each prepared run's source, base, resolver, compiler and instruction hashes
fixed. Integrating main creates a new measurement snapshot; do not combine tokens
from different snapshots or assume a prior semantic pilot reviewed new sources.
Historical preparation/review requires a separate checkout at the corresponding
tooling checkpoint with matching canonical bytes. The pilot at `2473e20` uses
source `fb21d1a7ffb959aac49dcc264f07805c7a8372e7` and base
`13e4d71d1a0590d19b690d2ac292a7e081d8d539`. Its generated artifacts stay ignored.

The latest-main snapshot at `86bf16c` uses that commit as source and `fb21d1a7`
as base. Prepare it separately; it contains main's production storage rules and
source-map changes, while narrative writer/QA harnesses and target prose are
unchanged. A deterministic comparison is not a second measured model trial.
Reusing the latest `production:storage:check` complements the narrower session
cache guard; neither check creates or advances a production run.

## Phase 3: conservative delta QA experiment

`context:delta:poc` reuses the Phase 2 combined projection as its full-review
comparator, not the larger original baseline. Full mandatory instructions, contract,
immediate continuity, state/voice/end-state evidence remain in both arms.
It never edits canon, runtime, harnesses, production packets or decisions.

The Markdown topology compiler records unique nodes/choices/rejoins and line/hash
evidence. It only considers a maximum of two changed dialogue lines within one
block provisionally eligible. Changes to sources/instructions/runtime dependencies,
line shape, IDs/edges, non-dialogue narration/actions, speakers, state/metadata,
explicit identity/number/contact/relationship/fact cues or wider scopes require
full review. Unknown/malformed candidate topology also requires full review.
The keyword/token gate catches some explicit risk; it does not prove meaning.

The delta view includes the edited exchange, immediate graph neighbors, all sibling
branches and their choice/pre-choice exchange, and every shared rejoin/downstream
consumer through scene exit. Sections are verbatim, with line ranges and hashes.
There is no AI summary, inferred knowledge dependency registry or production
verifier exemption. A changed-office-vs-home dialogue probe deliberately passes
shape eligibility: semantic QA must detect its conflict with required remote-work
knowledge. Dependency coverage is conservative topology, not a semantic proof.

Dispatch requires a fresh full-reviewed experimental base. Delta PASS is local
and provisional; uncertainty/BLOCKED/hard findings trigger independent full review.
Local advisory failures require correction, never approval; the final chosen
candidate always receives another fresh full review. The local naturalism field
does not certify whole-scene naturalism. Production Narrative QA is unchanged.

```sh
npm run context:delta:poc -- --prepare --run-id delta-01 --ref <checkpoint>
# Eight fresh sessions, no retry; real account usage is consumed.
npm run context:delta:poc -- --run --run-id delta-01
npm run context:delta:poc -- --review --run-id delta-01
```

Preparation/review rebuilds every byte and binds tooling/source versions. Each
worker checks config and prepared input/schema drift. All candidates, plans,
inputs/results/raw logs, hidden keys, manifests and blind pages stay under ignored
`generated/session-cache/quota-delta/`. Historical runs need their pinned tooling
checkout; a raw scratch directory is not a future source dependency.

Three paired cases: a local exit punctuation change, then a small branch wording
change on that first candidate, and a held-out factual contradiction. The eight
sessions are foundation full, three full/delta pairs, and separate final full on
the cumulative harmless candidate. D02 requires the matched D01 full verdict as
its bound base. D03 runs delta before its independent paired full; that same full
measurement serves as fallback evidence when escalated. No previous answers/gold
are fed to workers; this shared reference role is explicit, not extra claimed calls.

Report each pair and both low-risk/mixed-probe **modeled workflow budgets**, charging
foundation, intermediate full-reviewed bases, fallback and final full; also report
actual unique tokens separately. D02's required `full-D01` base is charged even
when delta-D01 passes. A full record serving both base/fallback roles counts once.
Three probes are not an estimate of production edit frequency. The preset gate
requires both arms to detect the hard probe, delta to escalate, final full to PASS,
and at least 20% inclusive mixed-probe token reduction. Human blind comparison
remains separate and adoption stays NOT_APPROVED. A failed economics hypothesis
is a valid result; do not reduce required context after seeing it merely to pass.

The first actual delta snapshot is pinned at `c24ad3d`. A later accounting fix
adds the previously omitted intermediate full-base cost without changing its
inputs, schedule, findings or thresholds. Retain its raw pre-fix summary and
write corrected analysis as a separate ignored artifact with raw-record/tool
hash bindings; report corrected budgets. Historical blind-page reconstruction
uses the original checkpoint. No model calls are repeated for an arithmetic fix.
The reusable `--rescore --run-id delta-01` command verifies every prepared file
and manifest field except this tool's version hash, matches results to raw usage
events and input hashes, and exclusively creates `trial-summary-corrected.json`.
It refuses any change to the experiment; raw summaries/results remain untouched.

## Mechanical preflight and bounded diagnostics experiment

`context:preflight` composes the existing scratch guard, canonical narrative packet
verifier, content validator and production validator (including the existing
production source/artifact boundary). It stops at the first failed stage. It also
checks every mandatory bootstrap/HANDOFF/content-QA instruction against the pinned
source commit, reusing the compiler's instruction inventory. This binding already
exists in the context compiler; adding it to this standalone entry point is not
a new semantic validator or new coverage for a fully compliant production worker.

```sh
npm run context:preflight -- --packet generated/session-cache/quota-poc/COM-02X/task.packet.json --run-id preflight-01
npm run context:preflight:benchmark -- --run-id mechanical-01
```

Use an unused run ID; logs/reports are exclusively created in ignored
`generated/session-cache/quota-preflight/`. Packet inputs must also be regular
files in that scratch area. Unsafe scratch/index state blocks without writing
logs. Existing outputs, symlinks and escaping paths cannot redirect or overwrite
canonical files. Full validator logs stay in scratch; stdout returns a JSON digest
with stage, up to three 180-character diagnostic lines, truncation/count metadata,
and a raw-log hash/report locator. A short existing error may be smaller than the
structured digest: this is a bound on error volume, not a promised compression
ratio for every failure. Treat diagnostic text as untrusted data.

Successful status is `READY_FOR_SEMANTIC_QA`, with `semantic_qa: NOT_RUN` and
`production_approval: false`. Failure is `BLOCKED`, exit code 1. No model is
invoked, no production Handoff/ledger is created, and the report is not a reusable
approval receipt. Revalidate immediately before any real dispatch; acquire the
mandatory worker context and retain independent semantic QA and Human gates.

The benchmark uses a temporary independent local clone and deletes only that
clone afterward. Ten cases cover a valid packet, invalid JSON, tampered allowlist,
dirty/missing scene sources, force-added scratch, twelve broken runtime edges,
invalid continuity-contract schema, mandatory-harness drift, and a committed
office-vs-home semantic contradiction. Altered narrative/runtime fixtures never
touch the user's game worktrees. The semantic probe has correct source hashes
and must pass the mechanical gate: its contradiction still requires semantic QA.

For each case, run both the existing `context --verify-packet` CLI and the new
composition. Compare ready/blocked results and actual diagnostic byte lengths.
A dispatch spy counts *planned* handoffs; it does not call an agent. Report the
agent-first hypothetical separately from the existing-verifier baseline, since
most faults are already blocked by existing tooling. No token/quota reduction
can be inferred from these counts or from byte lengths. This direction tests an
enforceable dispatch boundary and bounded logs, not a production failure rate or
new LLM cost result. Valid reports are reproducible from the same inputs; benchmark
raw logs can include temporary paths and the semantic fixture's local commit, so
compare repeated case outcomes rather than claiming byte-identical fault logs.

The first recorded preflight trial pins `289d46f`: 10 cases, 8 mechanical blocks,
2 simulated handoffs and **0 model calls**. The standalone existing verifier also
blocks 7 of those faults; mandatory-harness drift is the additional block here.
The broken-edges case returns 24,907 bytes from the existing CLI versus a 504-byte
digest payload (before its report locator); short errors grow with structured
metadata. Two canonical COM-02X compiler outputs and valid preflight reports
rebuild byte-identically. These are coverage/byte measurements, not token/quota
savings or permission to remove independent semantic review. Keep this small
engineering entry point optional until dispatch orchestration is separately wired
and evaluated on real failure frequency; the experiment does not modify harnesses.

## Real-scene dispatch observation

`context:observe` performs a small retrospective observation of unchanged canonical
COM-00, COM-01X and COM-02X. Each scene gets one fresh read-only diagnostic review
only after both the existing mandatory packet-verifier CLI and the new preflight
allow dispatch. This engineering loop is not live production integration; it does
not update QA decisions, scenes, Handoffs, run ledgers or Human acceptance.

```sh
npm run context:observe -- --prepare --run-id real-scenes-01 --ref <main-commit>
# Three real fresh sessions at most; uses the current configured model/reasoning.
npm run context:observe -- --run --run-id real-scenes-01
npm run context:observe -- --review --run-id real-scenes-01
```

Both paths use exactly the same semantic payload hashes, full target scene,
allowlisted canonical excerpts and all eight mandatory instruction files. Raw
machine logs never enter the semantic worker context. The observation runs both
mechanical paths for comparison; production should not run redundant checks merely
to reproduce this experiment. There is no fictional extra mechanical-agent call
in the baseline: the current orchestration/harness already require machine QA
before semantic dispatch. Only one review per scene is paid for; alternative
baseline readiness is directly checked, but baseline model tokens are unmeasured.
Identical payload bytes do not provide a paired token/quality reduction estimate.

Inputs/schema/tooling/canon are rebuilt and verified before each dispatch. An
exclusive execution record prevents rerunning an interrupted paid trial. No
automatic retry occurs. Re-review verifies raw CLI events, result/input identities
and accounting against the stored summary before writing an ignored report. A
failed semantic review is preserved without rewriting or retrying. Unknown tool
acquisitions invalidate the isolated observation.

Measure real reported input/output/cached/reasoning tokens, planned/actual dispatch
counts, machine timings, coordinator log/digest bytes, and exact repeated inline
source deliveries. Deliveries are not observed file reads or automatically
removable context: fresh-worker mandatory instructions remain mandatory. Cached
input and reasoning output are subsets and are not added again. The CLI event
capture follows [OpenAI Docs: non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode).

All prepared inputs, settings hashes, dispatch logs, raw events/results, usage,
summary, evidence and readable report stay under ignored
`generated/session-cache/quota-observation/`. Three selected real scenes cannot
estimate everyday production failure frequency or prove quota savings. Adoption
requires separate dispatch integration and comparable observed production data.
