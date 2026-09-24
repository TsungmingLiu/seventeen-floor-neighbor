# Task Packet Schema

Version: 0.3.0

Every specialist task should be representable by this contract.

```yaml
task_id: unique-stable-id
task_type: scene_write | shot_plan | cg_generate | asset_qa | integrate
workflow_version: 0.1.0
harness: cg_artist
objective: one sentence describing exactly one deliverable

source_binding:
  github:
    repository_full_name: owner/repo
    repository_url: https://github.com/owner/repo
    ref: main
  drive:
    named_folders:
      - role: ...
        folder_id: ...
        url: ...

required_acquisition:
  markdown:
    - path: exact/repo/path.md
      expected_nonempty: true
  images:
    - role: primary_face_identity
      drive_file_id: ...
      drive_url: ...
      expected_filename: ...
      expected_mime: image/png
      pixels_must_be_visible: true

generation_binding:
  explicit_reference_binding_required: true
  binding_receipt_required: true
  reference_roles:
    - runtime_visible_id: ...
      role: primary_face_identity

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
- `source_binding` is mandatory for tasks that use external repositories or Drive.
- `required_acquisition` is a pre-execution gate, not documentation.
- Markdown acquisition requires exact repo/ref/path + non-empty content + blob SHA.
- Image acquisition requires exact Drive ID/URL + filename/MIME/bytes + actual visible pixels.
- A successful connector response that exposes only metadata does not satisfy image acquisition.
- For image-generation tasks, acquisition PASS does not authorize generation by itself.
- If the image tool supports explicit reference IDs, the task must bind the exact runtime-visible IDs explicitly.
- Production image tasks must not rely on automatic/implicit reference-image selection.
- If explicit binding is unavailable, the correct result is BLOCKED.
- `allowed_sources` is an allowlist.
- A worker may not add sources on its own.
- If the task would require a second independent objective, split it into another Task Packet.
