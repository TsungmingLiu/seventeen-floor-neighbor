# Task Packet Schema

Version: 0.1.0

Every specialist task should be representable by this contract.

```yaml
task_id: unique-stable-id
task_type: scene_write | shot_plan | cg_generate | asset_qa | integrate
workflow_version: 0.1.0
harness: cg_artist
objective: one sentence describing exactly one deliverable

allowed_sources:
  - exact/path/or/connector-object
forbidden_sources:
  - optional explicit exclusions

inputs:
  global_pack: optional
  character_packs: []
  environment_pack: optional
  scene_pack: optional
  shot_pack: optional
  continuity_pack: optional

constraints:
  locked: []
  must_not_change: []
  output_format: ...

deliverables:
  - id: ...
    destination: ...

acceptance:
  - machine-checkable or reviewable criterion

handoff_to: asset_qa
```

## Rules

- A Task Packet is routing metadata, not a place to duplicate whole canon.
- `allowed_sources` is an allowlist.
- A worker may not add sources on its own.
- If the task would require a second independent objective, split it into another Task Packet.
