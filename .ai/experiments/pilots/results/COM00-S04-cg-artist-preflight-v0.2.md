# COM00-S04 CG Artist Preflight v0.2

> Lifecycle: **EXPERIMENTAL — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical pilot material. Do not execute as a production task.

```yaml
task_id: pilot-com00-s04-cg-v002
status: PASS
workflow_version: 0.2.0
harness:
  id: cg_artist
  version: 0.2.0

repository:
  full_name: TsungmingLiu/seventeen-floor-neighbor
  ref: main
  task_packet:
    path: .ai/experiments/pilots/tasks/COM00-S04-cg-artist-v0.2.md
    blob_sha: 2bac18857dd5dfb1143ce97cc8e6a95cb513574d
    content_nonempty: PASS

markdown_receipts:
  - path: .ai/WORKFLOW_MANIFEST.yaml
    blob_sha: b78fe6a85863474a61ac1b51a1ee3dd187d3abfd
    content_nonempty: PASS
  - path: .ai/harnesses/bootstrap.md
    blob_sha: b359eabe62af758083f8d79eb2c963065b855f44
    content_nonempty: PASS
  - path: .ai/harnesses/cg-artist.md
    blob_sha: 17fced9408f3370b5678ee367e15e2987bbdd753
    content_nonempty: PASS
  - path: .ai/policies/SOURCE_AUTHORITY.md
    blob_sha: 29d946ff0672ec97f49e8f2ac9665c7968f03651
    content_nonempty: PASS
  - path: .ai/policies/CONTEXT_ISOLATION.md
    blob_sha: b3606cd65d1de0113603a6f7fac8bea5dc3a0bf9
    content_nonempty: PASS
  - path: .ai/schemas/DATA_PACKS.md
    blob_sha: a13a945b503a1bb1e304de57f23b05dafaeac1a2
    content_nonempty: PASS
  - path: .ai/schemas/HANDOFF.md
    blob_sha: 476568752460d58cf49eb30779606b0a3a1b50ab
    content_nonempty: PASS
  - path: docs/art/PRODUCTION_VISUAL_DIRECTION.md
    blob_sha: 46626d362584bf211b563b2a60986b2fc8e19f38
    content_nonempty: PASS
  - path: .ai/experiments/pilots/data/COM00-S04/xu-tang.character.md
    blob_sha: c8e3e826780bfd25c83324920bce8539df7dcb2a
    content_nonempty: PASS
  - path: .ai/experiments/pilots/data/COM00-S04/bg-apt-17f-rain.environment.md
    blob_sha: 586c77cba08f4cefe573f32307ca82796bec4393
    content_nonempty: PASS
  - path: .ai/experiments/pilots/data/COM00-S04/COM00-S04.shot.md
    blob_sha: 09c78721736ce4a81c0b05c91aee7a82c97a695b
    content_nonempty: PASS

drive_bindings:
  character_reference_root:
    folder_id: 1bZAb9Fzj-xzFvklYCDNG60SJLuA-28Xn
    observed_title: runtime-public
    result: PASS
  environment_folder:
    folder_id: 1GfEhIO-roX_4BWfAB0_wp3_zMDXmoES9
    observed_title: bg
    result: PASS
  output_staging:
    folder_id: 1-KdOiPN-6tEHZO3f2_-psM1kvfw7wf-M
    observed_title: pilot-candidates
    result: PASS

image_receipts:
  - role: primary_face_identity
    drive_file_id: 1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS
    drive_url: https://drive.google.com/file/d/1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS/view
    expected_filename: xt-ref-01-face.png
    observed_filename: xt-ref-01-face.png
    expected_mime: image/png
    observed_mime: image/png
    observed_bytes: 2317146
    runtime_visible_file_id: file_00000000ffd482088cb6d9946fa5264d
    pixels_visible_to_worker: true
    visual_sanity: "PASS — actual pixels show the XU TANG face identity turnaround: adult East Asian woman, long dark-brown hair, large gold hoop earrings, multiple face angles on a neutral sheet."
  - role: expression_acting
    drive_file_id: 19kDLngndmnc4eT4EzdxTpjCUwiMo7M3T
    drive_url: https://drive.google.com/file/d/19kDLngndmnc4eT4EzdxTpjCUwiMo7M3T/view
    expected_filename: xt-ref-02-expression.png
    observed_filename: xt-ref-02-expression.png
    expected_mime: image/png
    observed_mime: image/png
    observed_bytes: 2333430
    runtime_visible_file_id: file_000000008e20820ea7e7a44957299da0
    pixels_visible_to_worker: true
    visual_sanity: "PASS — actual pixels show an expression sheet for the same Xu Tang identity, including neutral and polite-small-smile states; not scenery or another character."
  - role: production_consistency
    drive_file_id: 1dTvm8uC5m2jaq8OUDDzaloOUrzeWBHIx
    drive_url: https://drive.google.com/file/d/1dTvm8uC5m2jaq8OUDDzaloOUrzeWBHIx/view
    expected_filename: xt-ref-04-production.png
    observed_filename: xt-ref-04-production.png
    expected_mime: image/png
    observed_mime: image/png
    observed_bytes: 2320597
    runtime_visible_file_id: file_0000000060d48211bde3f1d0e14d0006
    pixels_visible_to_worker: true
    visual_sanity: "PASS — actual pixels show Xu Tang production consistency material covering hair construction, hands/props, accessories, body language, and lighting."
  - role: wardrobe
    drive_file_id: 1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF
    drive_url: https://drive.google.com/file/d/1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF/view
    expected_filename: xt-ref-05-wardrobe-a.png
    observed_filename: xt-ref-05-wardrobe-a.png
    expected_mime: image/png
    observed_mime: image/png
    observed_bytes: 2168454
    runtime_visible_file_id: file_00000000ff1c820a9af23e28da4bd531
    pixels_visible_to_worker: true
    visual_sanity: "PASS — actual pixels show XU TANG CANONICAL WARDROBE A; Look 01 has a cream ribbed cardigan, taupe/gray-brown wide-leg trousers, black loafers, black shoulder bag, and gold hoop earrings."
  - role: environment_geometry
    drive_file_id: 1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun
    drive_url: https://drive.google.com/file/d/1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun/view
    expected_filename: bg-apt-17f-rain-v1.webp
    observed_filename: bg-apt-17f-rain-v1.webp
    expected_mime: image/webp
    observed_mime: image/webp
    observed_bytes: 139816
    runtime_visible_file_id: file_000000009974820e84c540a1b75f585c
    pixels_visible_to_worker: true
    visual_sanity: "PASS — actual pixels show an empty indoor apartment corridor at rainy night with warm wall lights, dark apartment doors, boxes on one side, and rain/city visible through the far window."

gate:
  all_required_markdown_loaded: PASS
  all_required_image_metadata_matched: PASS
  all_required_image_bytes_nonzero: PASS
  all_required_image_pixels_visible: PASS
  no_forbidden_source_used: PASS
  generation_authorized: true
  automatic_regeneration: false
```

## Preflight conclusion

**PASS.** All required Markdown contents were read from the exact bound repository/ref and all five exact Google Drive image files were fetched as non-empty image bytes and visually inspected from their actual pixels. Exactly one image-generation call is authorized.
