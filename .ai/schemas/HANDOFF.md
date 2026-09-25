# Worker Handoff Schema

Version: 1.0.0

Every worker returns a concise, structured handoff.

```yaml
task_id: ...
status: PASS | NEEDS_REVIEW | BLOCKED | FAIL
workflow_version: 1.0.0
harness:
  id: cg_renderer
  version: 1.0.0
  pass: null

inputs_used:
  - source: exact source identifier
    version: git_blob_sha | drive_file_id | other immutable version when available

attachments_used:
  - role: primary_face_identity
    observed_filename: ...
    canonical_source: drive_file_id | asset_id | other
    pixels_verified: true | false

outputs:
  - id: ...
    location: ...
    description: ...
    source_identity: manifest_version/hash | git_blob_sha | other

qa:
  checks:
    - name: ...
      result: PASS | FAIL
  known_issues: []

canon_changes:
  none: true

next:
  harness: content_qa
  pass: visual_review
  task_needed: ...
```

## Handoff rules

- Report only sources actually used.
- For GitHub files, include the blob SHA when available.
- For Google Drive references, include the exact Drive file ID.
- If immutable/version identity is unavailable, say so explicitly instead of omitting provenance.
- For image tasks, report only reference pixels actually passed to generation and their assigned roles; note whether each was Human-attached or fetched through a connected source.
- Do not claim a Drive image was used for generation merely because its canonical Drive ID is known; distinguish canonical source provenance from the runtime image input.
- Never claim a file/upload/commit occurred unless it occurred.
- Do not smuggle new creative decisions into `known_issues`.
- If a worker detects a canon conflict, stop and return BLOCKED with both conflicting sources.
- Provenance must make it possible to identify which workflow/harness version produced an artifact.
