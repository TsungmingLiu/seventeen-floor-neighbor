# COM00-S04 CG Artist Preflight v0.3

```yaml
task_id: pilot-com00-s04-cg-v003
status: BLOCKED
workflow_version: 0.3.0
harness:
  id: cg_artist
  version: 0.3.0

repository:
  full_name: TsungmingLiu/seventeen-floor-neighbor
  ref: main

acquisition:
  markdown:
    - path: .ai/WORKFLOW_MANIFEST.yaml
      blob_sha: c2ab1764240bd00fbd6c69542ad4dd6a77acf888
      nonempty: true
      result: PASS
    - path: .ai/harnesses/bootstrap.md
      blob_sha: b359eabe62af758083f8d79eb2c963065b855f44
      nonempty: true
      result: PASS
    - path: .ai/harnesses/cg-artist.md
      blob_sha: d45a7511142855a022a638217d0e8bba06b6e8d0
      nonempty: true
      result: PASS
    - path: .ai/policies/SOURCE_AUTHORITY.md
      blob_sha: 29d946ff0672ec97f49e8f2ac9665c7968f03651
      nonempty: true
      result: PASS
    - path: .ai/policies/CONTEXT_ISOLATION.md
      blob_sha: b3606cd65d1de0113603a6f7fac8bea5dc3a0bf9
      nonempty: true
      result: PASS
    - path: .ai/schemas/DATA_PACKS.md
      blob_sha: a13a945b503a1bb1e304de57f23b05dafaeac1a2
      nonempty: true
      result: PASS
    - path: .ai/schemas/HANDOFF.md
      blob_sha: 476568752460d58cf49eb30779606b0a3a1b50ab
      nonempty: true
      result: PASS
    - path: docs/art/PRODUCTION_VISUAL_DIRECTION.md
      blob_sha: b203f5810ce9d1d9f32fafdf6c886b5a31402452
      nonempty: true
      result: PASS
    - path: .ai/pilots/data/COM00-S04/xu-tang.character.md
      blob_sha: e6553f111beb724f993e56c5b00250c529517753
      nonempty: true
      result: PASS
    - path: .ai/pilots/data/COM00-S04/bg-apt-17f-rain.environment.md
      blob_sha: 586c77cba08f4cefe573f32307ca82796bec4393
      nonempty: true
      result: PASS
    - path: .ai/pilots/data/COM00-S04/COM00-S04.shot.md
      blob_sha: 5ab0c6a24dd9e4d3a4f5456e87ce4900c769740a
      nonempty: true
      result: PASS

  images:
    - role: primary_face_identity_and_realism_floor
      drive_file_id: 1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS
      expected_filename: xt-ref-01-face.png
      observed_filename: xt-ref-01-face.png
      expected_mime: image/png
      observed_mime: image/png
      observed_bytes: 2317146
      runtime_visible_file_id: file_00000000444c820d8d930184faf9e532
      pixels_visible_to_worker: true
      visual_sanity: >-
        Xu Tang face identity turnaround is visibly present: adult East Asian woman,
        long dark-brown hair worn down, large gold hoop earrings, multiple face angles,
        and close-up skin/hair/feature detail.
      result: PASS

    - role: exact_wardrobe
      drive_file_id: 1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF
      expected_filename: xt-ref-05-wardrobe-a.png
      observed_filename: xt-ref-05-wardrobe-a.png
      expected_mime: image/png
      observed_mime: image/png
      observed_bytes: 2168454
      runtime_visible_file_id: file_000000004178820eac4cf7eee973ee0d
      pixels_visible_to_worker: true
      visual_sanity: >-
        Xu Tang canonical wardrobe sheet is visibly present. Weekday Neighbor Look 01
        shows the cream ribbed V-neck button cardigan, gray-brown high-waist wide-leg
        trousers, black loafers, small black shoulder bag, and gold hoop earrings.
      result: PASS

    - role: environment_geometry
      drive_file_id: 1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun
      expected_filename: bg-apt-17f-rain-v1.webp
      observed_filename: bg-apt-17f-rain-v1.webp
      expected_mime: image/webp
      observed_mime: image/webp
      observed_bytes: 139816
      runtime_visible_file_id: file_000000000410822fb40972f1cf284442
      pixels_visible_to_worker: true
      visual_sanity: >-
        Portrait corridor reference is visibly present: warm-gray residential hallway,
        dark apartment doors, warm wall sconces, reflective stone floor, elevator zone,
        rainy blue window/city spill at the far end, and boxes along the left side.
      result: PASS

generation_binding:
  explicit_reference_binding_required: true
  required_runtime_ids:
    face: file_00000000444c820d8d930184faf9e532
    wardrobe: file_000000004178820eac4cf7eee973ee0d
    environment: file_000000000410822fb40972f1cf284442
  tool_schema_exposes_reference_image_field: true
  verifiable_binding_receipt_from_generation_call: false
  result: FAIL
  blocker: explicit_reference_binding_unavailable
  detail: >-
    Although three runtime-visible file IDs were available and the image-generation
    interface exposes an explicit reference-image field, the generation result did not
    provide a verifiable receipt proving that those exact three IDs were bound.
    Therefore the binding gate cannot be marked PASS.

generation_incident:
  generation_call_count: 1
  automatic_retry_performed: false
  candidate_runtime_file_id: file_0000000063708208b0d84eadaf0fc46a
  candidate_generation_id: 68edcabc-5e10-4709-8cdd-0c4687b2f79b
  candidate_status: FAIL
  diagnostic_only: true
  uploaded_as_accepted_or_master: false
  immediate_fail_reasons:
    - wrong environment/location: bedroom/sofa instead of shared 17F corridor
    - wrong wardrobe: floral camisole/shorts presentation instead of locked Look 01
    - locked corridor geometry was not preserved
    - exact reference binding cannot be verified
  note: >-
    This call should not have proceeded without a successful explicit-binding receipt.
    Per the no-retry rule, no second generation was attempted.

qa:
  checks:
    - name: all_required_markdown_acquired
      result: PASS
    - name: all_required_image_metadata_and_bytes_verified
      result: PASS
    - name: all_required_image_pixels_visually_inspected
      result: PASS
    - name: three_runtime_visible_reference_ids_available
      result: PASS
    - name: explicit_generation_binding_receipt
      result: FAIL
    - name: no_automatic_regeneration
      result: PASS
  known_issues:
    - explicit_reference_binding_unavailable
    - first and only diagnostic candidate violates scene and wardrobe locks

canon_changes:
  none: true

next:
  harness: production_coordinator
  task_needed: >-
    Resolve a runtime/tool path that can return a verifiable explicit binding receipt
    for the three required reference image IDs before any new CG generation attempt.
```

## Handoff note

Acquisition succeeded for every allowlisted Markdown and all three exact Drive images, including actual pixel inspection. The production attempt remains **BLOCKED** because the image-generation call did not return evidence that the three runtime reference IDs were explicitly bound. The single emitted image is a failed diagnostic candidate only and must not be treated as an accepted or master asset.
