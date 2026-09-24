# Task Packet Schema

Version: 0.4.0

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

reference_transport:
  mode: human_attachment_required | edit_from_accepted_base
  fresh_chat_required: true
  no_unrelated_images_allowed: true
  required_attachments:
    - role: primary_face_identity
      expected_filename: ...
      canonical_source:
        drive_file_id: ...
        drive_url: ...
      pixels_must_be_visible: true
  accepted_base_attachment:
    required: false
    asset_id: ...

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
- For base-CG image tasks, the supported production transport is `human_attachment_required`.
- Connector-fetched image runtime IDs are provenance/discovery aids, not autonomous generation references.
- A valid base-CG session must be fresh and contain only the exact required Human-attached images.
- For Reaction CGs, prefer `edit_from_accepted_base` with the accepted base image attached as the edit target.
- Missing/contaminated attachment context means BLOCKED.
- `allowed_sources` is an allowlist.
- A worker may not add sources on its own.
- If the task would require a second independent objective, split it into another Task Packet.
