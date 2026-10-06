# Production Run Ledger Schema

Version: 1.3.0

Lifecycle: **GENERATED** execution record. `.ai/PRODUCTION_ORCHESTRATION.md` owns behavior；ledger only records facts and never overrides canon. Persist only necessary compact resumable checkpoints and Human/QA/adoption evidence at `content/production/runs/<run_id>/`; full actual-run state and stage attempts belong in ignored `generated/job-artifacts/<run_id>/`. Full worker Task Packets/Handoffs/logs stay in gitignored `generated/session-cache/`. Do not create a run for a hypothetical example.

```json
{
  "schema_version": "1.3.0",
  "run_id": "chapter-update-001",
  "workflow_version": "1.3.0",
  "source_ref": "commit SHA or immutable ref",
  "human_request": { "summary": "bounded directive", "gate_status": "none" },
  "status": "ACTIVE",
  "tasks": [
    {
      "task_id": "NQA-001",
      "task_type": "narrative_review",
      "scene_id": "COM-00",
      "depends_on": [],
      "status": "PASS",
      "packet": { "generator": "tools/context.mjs:narrative_review", "sha256": "SHA-256 of exact regenerated Task Packet bytes" },
      "decision_receipt": "content/production/runs/chapter-update-001/NQA-001.decision.json",
      "input_versions": [],
      "output_versions": [
        { "id": "approved_locked_scene:COM-00", "version": "git blob SHA", "location": "exact scene path" }
      ],
      "human_gate": "none",
      "reason": null
    }
  ],
  "invalidation_events": [],
  "preview": null
}
```

Task `status`: `PENDING`、`READY`、`RUNNING`、`PASS`、`NEEDS_REVIEW`、`FAIL`、`BLOCKED`、`STALE`、`SKIPPED`。Run `status`: `ACTIVE`、`NARRATIVE_PREVIEW_READY`、`BLOCKED`、`READY_FOR_HUMAN_ACCEPTANCE`、`ACCEPTED`。Narrative preview remains a resumable story-review checkpoint; it cannot satisfy dependencies on accepted CG/visual QA. Each dependency is a task ID in the same acyclic run. `READY` requires all dependencies `PASS` and approved/gated outputs. `SKIPPED` requires explicit reason and cannot satisfy a required dependency. `PASS` requires an actually reviewed worker Handoff at execution time, a committed decision receipt with matching input/output identities, verified output version, and passing acceptance. `RUNNING` without a durable decision receipt must be reconciled or reset to `READY` on resume; missing cache cannot prove PASS. Every task attempt has a stable ID; reruns get a new attempt ID or a clearly versioned packet/decision receipt, preserving prior evidence.

`packet.generator` identifies an existing deterministic generator; `packet.sha256` hashes exact JSON bytes including trailing newline. Regenerate using `source_ref`, verify the packet, and compare SHA-256. Canonical ledgers/receipts never store session URLs, absolute paths, or cache paths as required cross-session input. `decision_receipt` is a committed repo-relative JSON path, or `null` before the decision. It records only run/task/scene/status, packet SHA-256, input digest, output ID/path/hash, QA result codes, concise issues, Human gate and invalidation. It identifies the fresh worker harness/pass and matches this ledger's immutable input/output versions; it does not replace independent review. Full handoffs/packets stay in session cache; attempt records, prompts/API envelopes, logs and rejected candidates stay in job artifact storage.

`input_versions[]` / `output_versions[]` use `{id, version, location}`. `version` uses canonical path + branch/ref for images; non-image versions remain immutable Git blob SHA, canonical content SHA-256, packet hash, accepted decision receipt/hash, or explicit equivalent. Legacy image digest values are inert recorded metadata. Unknown versions are recorded as `unknown` and block dependent dispatch until resolved. The ledger stores identities, not artifact contents.

`invalidation_events[]` records `{changed_artifact_id, old_version, new_version, affected_task_ids, decision, evidence}`. `decision` is `STALE` or documented `no_visual_impact` after fresh Narrative QA. Scope only descendants that actually consume the changed artifact. `preview` records `{commit, profile, url_or_access_path, visibility, build, validation, tests, smoke}`; `READY_FOR_HUMAN_ACCEPTANCE` requires all evidence and a Human-accessible demo.

`npm run production:impact -- --scene <id> --from <commit> --to <commit|WORKTREE>` writes an ignored **read-only comparison**, not this ledger. Its `would_invalidate` and `visual_artifacts_not_impacted_by_diff` are proposed scopes between versions, not task statuses or proof of historical QA. A Coordinator may append a real `invalidation_events[]` entry and mark affected tasks `STALE` only after matching the comparison to this run's recorded immutable `input_versions`/`output_versions` and verifying its committed QA/Human decision receipts; otherwise status remains unknown/blocked. The tool compares accepted Opening entries now; it blocks render-ready entries lacking accepted bindings.

For a run containing exactly one recorded `narrative_review` task, `production:impact -- --scene <id> --from <ledger.source_ref> --to HEAD --run-id <id>` verifies the existing decision receipt and source Task Packet, then compares that task's recorded input/output blob versions to the committed target. Its `run_reconciliation` field reports `CURRENT_PASS` or `STALE_PROPOSED` **for that task only**; this is read-only advice, not an update to `tasks[].status`. It does not verify Visual QA/Human decisions or infer them from accepted assets. Wrong scene/ref/target, unverified receipt or absent source history blocks the report. Future task types require their own verified provenance mapping before they can use this option.

The existing `production:run:check` also verifies one actual `visual_review` task with `review_scope: manifest_usability` for the three explicit COM-00 entries. Its task records `upstream_run_id`, `upstream_task_id`, and `entry_ids` so the exact pinned Task Packet can be regenerated from `source_ref` in a detached worktree. The receipt's `manifest-usability-qa:COM-00` output version is SHA-256 of JSON.stringify of the packet's ordered `{id,version}` render-spec identities for those three entries, not a hash of the chapter manifest. Current verification reruns source validation at HEAD and compares selected input identities; unrelated entry edits may shift excerpt line numbers without invalidating the reviewed COM-00 content. A missing source ref, changed selected input, unverified receipt, or invalid accepted-base binding blocks. A manifest usability PASS never implies candidate image Visual QA, Human approval, or a PASS for other scenes.

For the one existing `COM00-S04-BASE-NEUTRAL` candidate, `production:run:check` also verifies a recorded `visual_review / candidate` **FAIL**. The receipt binds a fresh worker's Handoff SHA-256, all four pixel-visible image identities, selected render spec, packet/input digest, observed QA codes, and the reviewed candidate WebP path/ref. The ledger records `FAIL` with run status `BLOCKED`, not `PASS` or an accepted-master selection; an empty session cache reconstructs `CURRENT_FAIL` from the committed receipt and pinned source commit. A changed selected input or tampered receipt blocks. An unrelated manifest entry edit preserves the scoped failure. This result does not itself edit runtime art or authorize automatic generation or retry.

`production:impact -- --scene COM-00 --from <manifest-usability-ledger.source_ref> --to HEAD --run-id <id>` can also reconcile this **one verified manifest usability task**, without writing statuses. It checks the pinned source receipt, then regenerates selected inputs at the target commit and compares stable input IDs/versions and the three-entry output digest. Excerpt line positions can move when another scene's entry changes. A changed upstream Narrative QA input (including Locked Scene or contract) proposes stale review and explicitly requires fresh upstream Narrative QA; the report lists the known changed upstream versions before attempting to rebuild a worker packet. It never treats the old manifest decision as current or asserts other inputs were unchanged. Invalid current bindings or an unverified recorded/upstream receipt block the report. `VERIFIED_RECORDED_MANIFEST_USABILITY_QA` is historical evidence for the manifest gate only; candidate images and Human decisions remain independent.

## Storage boundary and new records

The v1.3 ledger shape above describes existing bounded verifiable evidence. Exact legacy records remain supported; it is not a requirement to commit every future attempt. New source decision receipts use `schema_version: "2.0.0"`, `storage_class: "durable_decision"`, and `evidence_purpose: adopted_asset | qa_decision | human_decision | resume_checkpoint`; they contain only stable IDs, status, harness, source/packet/input digests, `{id,version,location}` input/output identities, QA codes, short issues, Human gate and invalidation. Allowed fields are enforced by `assertDurableDecision` in `tools/production-storage.mjs`; receipts are at most 16 KiB. New source checkpoints use `schema_version: "2.0.0"`, `storage_class: "durable_checkpoint"`, at most 32 KiB and metadata-only tasks; full per-attempt input/output snapshots remain job artifacts. The current bounded `production:run:check` verifies legacy v1.3 narrative/manifest/candidate tasks only; schema 2.0 evidence does not gain a PASS from that verifier until a separately tested verifier supports it. Missing/expired job state cannot satisfy a gate.

`production-ledger-projection-v1` is a storage-only legacy projection. `storage_resolution.original` binds the original full ledger to `{ref,path,git_blob_sha,sha256,bytes}`; `omitted_task_fields` identifies repeated input/output identity snapshots; `archived_records` binds removed execution/candidate records to exact Git objects. `hydrateProductionLedger` restores the original values in memory and verifies that all statuses, dependencies, Human decisions and other fields are identical. `readArchivedRecords` verifies both commit/path/blob and SHA-256/byte length. Historical locators are evidence only, not worker authoring input or new acceptance.

A fresh Coordinator resumes the compact COM02X ledger by hydrating its metadata and verifying retained current receipts plus exact canonical/source identities. Deleted `decision_receipt` paths resolve through `storage_resolution.archived_records`; do not require those files on disk. Latest walking-v3 planning, manifest usability, packet, renderer/recovery and Visual QA receipts remain on disk, with the pending Human selection unchanged. Full Git history (`fetch-depth: 0`) is required. If the pinned Git objects are unavailable, return BLOCKED; never silently trust a missing archive. Before a later authorized status update, write new full job state to ignored artifacts and replace the historical projection with a compact schema-2 checkpoint plus the necessary current durable decisions; do not expand the old duplicated snapshot back into tracked source. The source guard rejects changes to the immutable projection's recorded semantics.

The storage guard checks versioned/index and unignored source paths, rejects forced tracked generated artifacts, transient filenames, full packet/Handoff/API shapes and disposable run records, and is invoked by production/local validation and CI. Existing legacy run files are grandfathered only while byte-identical to commit `aebda00d92f8dc614a8bdc6e1671541fd4d660ce`; changes/new records must meet the compact boundary. This is enforced validation, not a promise against deliberately disabling the guard or bypassing required checks.
