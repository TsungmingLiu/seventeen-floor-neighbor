# Pilot Task Packet — COM00-S04 CG Artist v0.2

> This task supersedes v0.1. v0.1 failed because the generated image did not match the bound character/environment references despite a nominal preflight PASS.

```yaml
task_id: pilot-com00-s04-cg-v002
task_type: cg_generate
workflow_version: 0.2.0
harness: cg_artist
objective: >
  Generate exactly one COM00-S04 candidate, but ONLY after proving that every required
  GitHub Markdown source and every required Google Drive image is actually loaded and
  visible to the worker/generation context.

source_binding:
  github:
    repository_full_name: TsungmingLiu/seventeen-floor-neighbor
    repository_url: https://github.com/TsungmingLiu/seventeen-floor-neighbor
    ref: main
  drive:
    character_reference_root:
      folder_id: 1bZAb9Fzj-xzFvklYCDNG60SJLuA-28Xn
      url: https://drive.google.com/drive/folders/1bZAb9Fzj-xzFvklYCDNG60SJLuA-28Xn
      expected_title: runtime-public
    environment_folder:
      folder_id: 1GfEhIO-roX_4BWfAB0_wp3_zMDXmoES9
      url: https://drive.google.com/drive/folders/1GfEhIO-roX_4BWfAB0_wp3_zMDXmoES9
      expected_title: bg
    output_staging:
      folder_id: 1-KdOiPN-6tEHZO3f2_-psM1kvfw7wf-M
      url: https://drive.google.com/drive/folders/1-KdOiPN-6tEHZO3f2_-psM1kvfw7wf-M
      expected_title: pilot-candidates

required_acquisition:
  markdown:
    - path: .ai/WORKFLOW_MANIFEST.yaml
      expected_nonempty: true
    - path: .ai/harnesses/bootstrap.md
      expected_nonempty: true
    - path: .ai/harnesses/cg-artist.md
      expected_nonempty: true
    - path: .ai/policies/SOURCE_AUTHORITY.md
      expected_nonempty: true
    - path: .ai/policies/CONTEXT_ISOLATION.md
      expected_nonempty: true
    - path: .ai/schemas/DATA_PACKS.md
      expected_nonempty: true
    - path: .ai/schemas/HANDOFF.md
      expected_nonempty: true
    - path: docs/art/PRODUCTION_VISUAL_DIRECTION.md
      expected_nonempty: true
    - path: .ai/pilots/data/COM00-S04/xu-tang.character.md
      expected_nonempty: true
    - path: .ai/pilots/data/COM00-S04/bg-apt-17f-rain.environment.md
      expected_nonempty: true
    - path: .ai/pilots/data/COM00-S04/COM00-S04.shot.md
      expected_nonempty: true

  images:
    - role: primary_face_identity
      drive_file_id: 1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS
      drive_url: https://drive.google.com/file/d/1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS/view
      expected_filename: xt-ref-01-face.png
      expected_mime: image/png
      pixels_must_be_visible: true
      visual_sanity: >
        Must visibly be the XU TANG face identity turnaround: adult East Asian woman,
        long dark-brown hair, large gold hoop earrings, multiple face angles on a neutral sheet.
    - role: expression_acting
      drive_file_id: 19kDLngndmnc4eT4EzdxTpjCUwiMo7M3T
      drive_url: https://drive.google.com/file/d/19kDLngndmnc4eT4EzdxTpjCUwiMo7M3T/view
      expected_filename: xt-ref-02-expression.png
      expected_mime: image/png
      pixels_must_be_visible: true
      visual_sanity: >
        Must visibly be an expression sheet of the same Xu Tang identity, not scenery or another character.
    - role: production_consistency
      drive_file_id: 1dTvm8uC5m2jaq8OUDDzaloOUrzeWBHIx
      drive_url: https://drive.google.com/file/d/1dTvm8uC5m2jaq8OUDDzaloOUrzeWBHIx/view
      expected_filename: xt-ref-04-production.png
      expected_mime: image/png
      pixels_must_be_visible: true
      visual_sanity: >
        Must visibly be Xu Tang production consistency material for hair/hands/accessory/lighting.
    - role: wardrobe
      drive_file_id: 1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF
      drive_url: https://drive.google.com/file/d/1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF/view
      expected_filename: xt-ref-05-wardrobe-a.png
      expected_mime: image/png
      pixels_must_be_visible: true
      visual_sanity: >
        Must visibly be XU TANG CANONICAL WARDROBE A. Look 01 must show cream ribbed
        cardigan, taupe/gray-brown wide-leg trousers, black loafers, black shoulder bag,
        and gold hoop earrings.
    - role: environment_geometry
      drive_file_id: 1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun
      drive_url: https://drive.google.com/file/d/1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun/view
      expected_filename: bg-apt-17f-rain-v1.webp
      expected_mime: image/webp
      pixels_must_be_visible: true
      visual_sanity: >
        Must visibly be an empty indoor apartment corridor at rainy night with warm wall
        lights, dark apartment doors, boxes at one side, and rain/city visible through the
        far window. If the fetched image is outdoor scenery, a city panorama, a character,
        or anything else, STOP.

allowed_sources:
  - all required_acquisition entries above
forbidden_sources:
  - any other GitHub repository
  - any GitHub ref other than main
  - docs/art/CHARACTER_REFERENCE_PACK_SPEC.md
  - docs/art/PROTOTYPE_ART_REQUIREMENTS.md
  - docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md
  - docs/art/recipes/
  - docs/proposals/
  - docs/narrative/scenes/
  - .ai/pilots/results/COM-00-shot-plan-v0.1.md
  - any Jiang Yucheng reference or data
  - any unrelated heroine reference or data
  - any previous generated Xu Tang CG
  - web image search
  - prior conversation memory as production authority

inputs:
  global_pack: docs/art/PRODUCTION_VISUAL_DIRECTION.md
  character_packs:
    - .ai/pilots/data/COM00-S04/xu-tang.character.md
  environment_pack: .ai/pilots/data/COM00-S04/bg-apt-17f-rain.environment.md
  shot_pack: .ai/pilots/data/COM00-S04/COM00-S04.shot.md

preflight_gate:
  fail_closed: true
  before_generation:
    - verify exact GitHub repo name is TsungmingLiu/seventeen-floor-neighbor
    - verify exact ref is main
    - read every required Markdown and record blob SHA
    - fetch every required Drive image by exact file ID/URL
    - verify observed filename and MIME match expected values
    - verify nonzero bytes
    - record runtime-visible attachment/file ID when available
    - visually inspect actual pixels and write the required sanity check result
    - confirm pixels_visible_to_worker=true for all five images
  hard_stop: >
    If ANY check fails or if the worker cannot prove that actual image pixels are visible,
    write BLOCKED preflight and STOP. Do not call image generation. Do not substitute prose,
    memory, another file, another repo, or a model-invented reference.

execution:
  candidate_count: 1
  automatic_regeneration: false
  generation_input_requirement: >
    The one image-generation call must be made only after the five verified image inputs
    are present in the current worker context. The generation instruction must explicitly
    treat the four Xu Tang images as identity/wardrobe references and the corridor image
    as geometry/environment reference.
  output_target:
    preferred_drive_folder_id: 1-KdOiPN-6tEHZO3f2_-psM1kvfw7wf-M
    preferred_filename: pilot-com00-s04-candidate-v002.png

constraints:
  locked:
    - exactly one visible heroine: Xu Tang
    - no protagonist face/body in frame
    - Weekday Neighbor / Look 01
    - 16:9 landscape
    - medium to medium-wide
    - neutral_observant to restrained polite smile
    - indoor 17F rainy-night apartment corridor
    - interior dry
  must_not_change:
    - character identity
    - wardrobe
    - scene meaning
    - environment identity
    - realistic/semi-realistic cinematic urban-romance style

deliverables:
  - id: com00-s04-preflight-v002
    destination: .ai/pilots/results/COM00-S04-cg-artist-preflight-v0.2.md
    requirement: >
      Must contain exact repo/ref, Markdown blob SHAs, Drive IDs, observed filenames/MIME/bytes,
      runtime image/file IDs when exposed, pixels_visible_to_worker flags, and visual sanity checks.
  - id: com00-s04-candidate-v002
    type: image
    requirement: exactly one candidate, only if preflight PASS

acceptance:
  - preflight proves actual Markdown contents and actual image pixels were obtained
  - all five image sanity checks PASS
  - no fallback/assumption path is used
  - exactly one candidate is generated only after PASS
  - candidate depicts Xu Tang in the bound indoor corridor, not unrelated scenery
  - candidate is 16:9 and not manga/comic styled
  - image is not self-accepted as production master

handoff_to: asset_qa
```

## Operator rule

If you cannot see one of the required Markdown files or one of the five required images,
the correct output is **BLOCKED**, not a best-effort image.
