# COM00-S04 Human-Attachment CG v0.4 — Failure Record

> Lifecycle: **EXPERIMENTAL — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical pilot material. Do not execute as a production task.

Status: **FAIL — candidate rejected; do not use as accepted/master**

```yaml
task_id: pilot-com00-s04-human-attach-v004
status: FAIL
workflow_version: 0.4.0
harness:
  id: cg_artist
  version: 0.4.0

attachment_gate:
  result: PASS
  fresh_generation_chat: true
  unrelated_image_attachment_count: 0
  attachments:
    - expected_filename: xt-ref-01-face.png
      observed_platform_filename: xt-ref-01-face(1).jpeg
      role: primary_face_identity_and_realism_floor
      canonical_drive_file_id: 1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS
      pixels_verified: true
      observed_dimensions: 1055x1491
      visual_sanity: Xu Tang adult East Asian face turnaround; long dark-brown hair down; large gold hoop earrings; realistic facial anatomy.
      required_attachment_present: true
    - expected_filename: xt-ref-05-wardrobe-a.png
      observed_platform_filename: xt-ref-05-wardrobe-a(1).jpeg
      role: exact_wardrobe
      canonical_drive_file_id: 1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF
      pixels_verified: true
      observed_dimensions: 1055x1491
      visual_sanity: Wardrobe A sheet; Weekday Neighbor Look 01 is cream ribbed V-neck button cardigan, gray-brown high-waist wide-leg trousers, black loafers, small black shoulder bag, large gold hoop earrings.
      required_attachment_present: true
    - expected_filename: bg-apt-17f-rain-v1.webp
      observed_platform_filename: bg-apt-17f-rain-v1(1).webp
      role: environment_geometry
      canonical_drive_file_id: 1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun
      pixels_verified: true
      observed_dimensions: 1080x1920
      visual_sanity: Empty indoor apartment corridor at rainy night with warm-gray walls, dark doors, warm sconces, reflective stone floor, and cool rainy-blue exterior spill.
      required_attachment_present: true

generation:
  candidate_count: 1
  automatic_retry: false
  runtime_generation_id: a0f61230-94bd-48d6-8f47-5247fed72d9d
  runtime_file_id: file_0000000095cc81f6ab4ba4c9f7078815
  runtime_path: /mnt/data/a_realistic_cinematic_high_quality_photoreal_cg.png
  observed_dimensions: 1024x1536

post_generation_gate:
  result: FAIL
  checks:
    - name: identity_and_realism
      result: PASS
    - name: long_dark_brown_hair_worn_down
      result: PASS
    - name: Weekday_Neighbor_Look_01
      result: PASS
    - name: rainy_night_shared_corridor
      result: PASS
    - name: protagonist_or_extra_person_absent
      result: PASS
    - name: framing_16_9_landscape
      result: FAIL
      evidence: Generated candidate is 1024x1536 portrait rather than the required 16:9 landscape master.
    - name: 1702_1703_neighbor_geography_readability
      result: FAIL
      evidence: Portrait crop does not preserve enough two-door corridor geography to satisfy the locked shot composition.
  retry_performed: false
  accepted_as_master: false

canon_changes:
  none: true

next:
  harness: asset_qa
  task_needed: Review failure record only. Candidate must not be accepted/master; any future regeneration requires a new explicitly authorized task because this packet forbids self-retry.
```

## Required GitHub inputs used

- `.ai/WORKFLOW_MANIFEST.yaml` — `f93a4375599281d8cb808afee7a9f815ab1e94f8`
- `.ai/harnesses/bootstrap.md` — `b359eabe62af758083f8d79eb2c963065b855f44`
- `.ai/harnesses/cg-artist.md` — `8f1b7af8b65c0e8cb63000b5eaacbfa4fc22e5f3`
- `.ai/policies/SOURCE_AUTHORITY.md` — `29d946ff0672ec97f49e8f2ac9665c7968f03651`
- `.ai/policies/CONTEXT_ISOLATION.md` — `b3606cd65d1de0113603a6f7fac8bea5dc3a0bf9`
- `.ai/schemas/DATA_PACKS.md` — `a13a945b503a1bb1e304de57f23b05dafaeac1a2`
- `.ai/schemas/HANDOFF.md` — `c9a1c04703822b6f7a73cb0834c161aacaf7fc1e`
- `docs/art/PRODUCTION_VISUAL_DIRECTION.md` — `b203f5810ce9d1d9f32fafdf6c886b5a31402452`
- `.ai/experiments/pilots/data/COM00-S04/xu-tang.character.md` — `e6553f111beb724f993e56c5b00250c529517753`
- `.ai/experiments/pilots/data/COM00-S04/bg-apt-17f-rain.environment.md` — `586c77cba08f4cefe573f32307ca82796bec4393`
- `.ai/experiments/pilots/data/COM00-S04/COM00-S04.shot.md` — `5ab0c6a24dd9e4d3a4f5456e87ce4900c769740a`
- Task packet `.ai/experiments/pilots/tasks/COM00-S04-cg-artist-human-attach-v0.4.md` — `0b8567195cefec37c816a03111740e9d7b5e342a`

No Google Drive image was fetched or used as generation input. The only image references were the three Human-attached images present in this fresh chat.
