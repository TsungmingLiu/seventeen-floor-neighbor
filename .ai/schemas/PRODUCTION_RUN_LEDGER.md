# Production Run Ledger Schema

Version: 1.1.0

Lifecycle: **GENERATED** execution record. `.ai/PRODUCTION_ORCHESTRATION.md` owns behavior；ledger only records facts and never overrides canon. Persist actual runs at `content/production/runs/<run_id>/ledger.json` with adjacent Task Packets and Handoffs. Do not create a run for a hypothetical example.

```json
{
  "run_id": "chapter-update-001",
  "workflow_version": "1.1.0",
  "source_ref": "commit SHA or immutable ref",
  "human_request": { "summary": "bounded directive", "gate_status": "none" },
  "status": "ACTIVE",
  "tasks": [
    {
      "task_id": "ND-001",
      "task_type": "narrative_design",
      "depends_on": [],
      "status": "PASS",
      "packet": "content/production/runs/chapter-update-001/ND-001.packet.json",
      "handoff": "content/production/runs/chapter-update-001/ND-001.handoff.json",
      "input_versions": [],
      "output_versions": [
        { "id": "contract:scene-id", "version": "git blob SHA", "location": "exact path" }
      ],
      "human_gate": "none",
      "reason": null
    }
  ],
  "invalidation_events": [],
  "preview": null
}
```

Task `status`: `PENDING`、`READY`、`RUNNING`、`PASS`、`NEEDS_REVIEW`、`FAIL`、`BLOCKED`、`STALE`、`SKIPPED`。Run `status`: `ACTIVE`、`BLOCKED`、`READY_FOR_HUMAN_ACCEPTANCE`、`ACCEPTED`。Each dependency is a task ID in the same acyclic run. `READY` requires all dependencies `PASS` and approved/gated outputs. `SKIPPED` requires explicit reason and cannot satisfy a required dependency. `PASS` requires a Handoff, verified output version, and passing acceptance. `RUNNING` without recoverable Handoff must be reconciled on resume. Every task attempt has a stable ID; reruns get a new attempt ID or a clearly versioned packet/handoff, preserving prior evidence.

`input_versions[]` / `output_versions[]` use `{id, version, location}`. `version` is immutable: Git blob SHA, canonical content SHA-256, packet hash, accepted asset receipt/hash, or explicit equivalent. Unknown versions are recorded as `unknown` and block dependent dispatch until resolved. The ledger stores identities, not artifact contents.

`invalidation_events[]` records `{changed_artifact_id, old_version, new_version, affected_task_ids, decision, evidence}`. `decision` is `STALE` or documented `no_visual_impact` after fresh Narrative QA. Scope only descendants that actually consume the changed artifact. `preview` records `{commit, profile, url_or_access_path, visibility, build, validation, tests, smoke}`; `READY_FOR_HUMAN_ACCEPTANCE` requires all evidence and a Human-accessible demo.
