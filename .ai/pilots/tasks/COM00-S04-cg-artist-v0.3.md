# Pilot Task Packet — COM00-S04 CG Artist v0.3

> This task supersedes v0.2. v0.2 successfully verified the correct Markdown and image pixels, but the generated candidate still drifted into a 3D-animation/cartoon face, wrong hairstyle/wardrobe, and showed the protagonist. The remaining failure mode is generation-time reference binding and style ambiguity.

```yaml
task_id: pilot-com00-s04-cg-v003
task_type: cg_generate
workflow_version: 0.3.0
harness: cg_artist
objective: >
  Generate exactly one COM00-S04 candidate only after both acquisition PASS and explicit
  reference-binding PASS. The generation call must explicitly bind the exact runtime-visible
  IDs of all required reference images.

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
    - role: primary_face_identity_and_realism_floor
      drive_file_id: 1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS
      drive_url: https://drive.google.com/file/d/1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS/view
      expected_filename: xt-ref-01-face.png
      expected_mime: image/png
      pixels_must_be_visible: true
    - role: exact_wardrobe
      drive_file_id: 1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF
      drive_url: https://drive.google.com/file/d/1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF/view
      expected_filename: xt-ref-05-wardrobe-a.png
      expected_mime: image/png
      pixels_must_be_visible: true
    - role: environment_geometry
      drive_file_id: 1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun
      drive_url: https://drive.google.com/file/d/1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun/view
      expected_filename: bg-apt-17f-rain-v1.webp
      expected_mime: image/webp
      pixels_must_be_visible: true

generation_binding:
  explicit_reference_binding_required: true
  binding_receipt_required: true
  required_roles:
    - primary_face_identity_and_realism_floor
    - exact_wardrobe
    - environment_geometry
  hard_stop: >
    After acquisition, collect the runtime-visible file/image IDs for all three images.
    The image-generation tool call MUST explicitly bind those exact IDs in its reference-image
    argument if the tool exposes one. If explicit binding is unavailable, unsupported, rejected,
    or cannot be verified, return BLOCKED with explicit_reference_binding_unavailable.
    Do not rely on automatic reference selection.

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
  - the failed v0.1/v0.2 candidate images
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
  required:
    - exact repo/ref/path verification for all Markdown
    - exact Drive ID/filename/MIME/bytes verification for all images
    - actual pixel inspection for all three images
    - runtime-visible file/image ID receipt for all three images
    - explicit generation binding receipt
  hard_stop: >
    Any missing acquisition or explicit binding evidence means BLOCKED. Do not generate.

execution:
  candidate_count: 1
  automatic_regeneration: false
  prompt_style_lock: >
    REALISTIC HIGH-END GAME-CINEMATIC / PHOTOGRAPHIC PBR HUMAN RENDERING.
    Preserve realistic adult human facial anatomy, realistic eye size, natural skin pores
    and tonal variation, physically plausible hair strands, cloth, metal, and indoor light.
    The primary face reference is both identity authority and the minimum realism floor. Do not stylize the face.
    NO anime, manga, cartoon, Pixar/Disney-like 3D animation-film face, doll/figurine face,
    oversized eyes, simplified nose/mouth, plastic airbrushed skin, cel shading, painterly
    illustration, or stylized visual-novel illustration.
  content_lock: >
    Exactly one visible heroine, Xu Tang. Keep her long dark-brown hair DOWN as shown in
    the face and wardrobe references; do not create a bun/updo/ponytail. Preserve large gold hoop
    earrings and Weekday Neighbor Look 01 exactly: cream ribbed V-neck button cardigan,
    gray-brown high-waist wide-leg trousers, black loafers, small black shoulder bag.
    The camera is disembodied, not an over-the-shoulder shot. The protagonist is fully absent:
    no face, head, shoulder, back, hand, arm, silhouette, reflection, or body part.
  scene_lock: >
    Indoor dry SHARED 17F apartment corridor on a rainy night. Medium to medium-wide 16:9
    eye-level composition. Xu Tang stands outside 1702 in the shared corridor; apartment
    interior is not visible and no open-door interior view is allowed. Use the corridor
    reference for geometry/lighting/location, not its old portrait crop.
  output_target:
    preferred_drive_folder_id: 1-KdOiPN-6tEHZO3f2_-psM1kvfw7wf-M
    preferred_filename: pilot-com00-s04-candidate-v003.png

post_generation_gate:
  no_retry: true
  immediate_fail_if:
    - anime/cartoon/3d-animation-film face
    - oversized eyes or simplified facial anatomy
    - updo/bun/ponytail instead of long hair down
    - wrong wardrobe
    - missing gold hoop earrings
    - protagonist or extra person visible
    - wrong environment/location
    - portrait framing
  action_on_fail: >
    Record FAIL, do not retry, do not upload as accepted/master, and return the candidate
    only for coordinator diagnosis.

deliverables:
  - id: com00-s04-preflight-v003
    destination: .ai/pilots/results/COM00-S04-cg-artist-preflight-v0.3.md
    requirement: acquisition + explicit binding receipts
  - id: com00-s04-candidate-v003
    type: image
    requirement: exactly one candidate only after all gates PASS

acceptance:
  - all acquisition and explicit binding gates PASS
  - candidate is realistically rendered at least as realistically as the primary face reference
  - exactly three reference images were explicitly bound
  - Xu Tang identity/hair/wardrobe/accessories are preserved
  - protagonist is entirely absent
  - bound indoor corridor is preserved
  - no self-acceptance

handoff_to: asset_qa
```

## Operator rule

If the runtime cannot explicitly bind the five exact reference-image IDs into the image-generation call, the correct outcome is **BLOCKED**.
