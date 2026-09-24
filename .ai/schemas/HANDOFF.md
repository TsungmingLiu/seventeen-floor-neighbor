# Worker Handoff Schema

Version: 0.1.1

Every worker returns a concise, structured handoff.

```yaml
task_id: ...
status: PASS | NEEDS_REVIEW | BLOCKED | FAIL
workflow_version: 0.1.0
harness:
  id: cg_artist
  version: 0.1.0

inputs_used:
  - source: exact source identifier
    version: git_blob_sha | drive_file_id | other immutable version when available

outputs:
  - id: ...
    location: ...
    description: ...

qa:
  checks:
    - name: ...
      result: PASS | FAIL
  known_issues: []

canon_changes:
  none: true

next:
  harness: asset_qa
  task_needed: ...
```

## Handoff rules

- Report only sources actually used.
- For GitHub files, include the blob SHA when available.
- For Google Drive references, include the exact Drive file ID.
- If immutable/version identity is unavailable, say so explicitly instead of omitting provenance.
- Never claim a file/upload/commit occurred unless it occurred.
- Do not smuggle new creative decisions into `known_issues`.
- If a worker detects a canon conflict, stop and return BLOCKED with both conflicting sources.
- Provenance must make it possible to identify which workflow/harness version produced an artifact.
