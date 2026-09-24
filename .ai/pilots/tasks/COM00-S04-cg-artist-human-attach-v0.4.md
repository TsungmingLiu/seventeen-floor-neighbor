# Pilot Task Packet — COM00-S04 Human-Attachment Base CG v0.4

```yaml
task_id: pilot-com00-s04-human-attach-v004
task_type: cg_generate
workflow_version: 0.4.0
harness: cg_artist
objective: >
  Generate exactly one COM00-S04 base CG using a fresh chat whose only image context
  is the three exact Human-attached references listed below.

source_binding:
  github:
    repository_full_name: TsungmingLiu/seventeen-floor-neighbor
    repository_url: https://github.com/TsungmingLiu/seventeen-floor-neighbor
    ref: main

required_markdown:
  - .ai/WORKFLOW_MANIFEST.yaml
  - .ai/harnesses/bootstrap.md
  - .ai/harnesses/cg-artist.md
  - .ai/policies/SOURCE_AUTHORITY.md
  - .ai/policies/CONTEXT_ISOLATION.md
  - .ai/schemas/DATA_PACKS.md
  - .ai/schemas/HANDOFF.md
  - docs/art/PRODUCTION_VISUAL_DIRECTION.md
  - .ai/pilots/data/COM00-S04/xu-tang.character.md
  - .ai/pilots/data/COM00-S04/bg-apt-17f-rain.environment.md
  - .ai/pilots/data/COM00-S04/COM00-S04.shot.md

reference_transport:
  mode: human_attachment_required
  fresh_chat_required: true
  no_unrelated_images_allowed: true
  connector_images_may_be_used_for_generation: false
  required_attachments:
    - role: primary_face_identity_and_realism_floor
      expected_filename: xt-ref-01-face.png
      canonical_source:
        drive_file_id: 1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS
        drive_url: https://drive.google.com/file/d/1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS/view
      visual_sanity: >
        Xu Tang adult East Asian face turnaround; long dark-brown hair worn down;
        large gold hoop earrings; realistic facial anatomy.
    - role: exact_wardrobe
      expected_filename: xt-ref-05-wardrobe-a.png
      canonical_source:
        drive_file_id: 1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF
        drive_url: https://drive.google.com/file/d/1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF/view
      visual_sanity: >
        Xu Tang Wardrobe A; Weekday Neighbor Look 01 shows cream ribbed V-neck
        button cardigan, gray-brown high-waist wide-leg trousers, black loafers,
        small black shoulder bag, gold hoop earrings.
    - role: environment_geometry
      expected_filename: bg-apt-17f-rain-v1.webp
      canonical_source:
        drive_file_id: 1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun
        drive_url: https://drive.google.com/file/d/1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun/view
      visual_sanity: >
        Empty indoor apartment corridor at rainy night; warm-gray hallway, dark
        apartment doors, warm sconces, reflective stone floor, rainy-blue exterior spill.

attachment_gate:
  before_generation:
    - verify all three required attachments are present in the current conversation
    - visually inspect actual pixels of each attached image
    - assign exactly one required role to each attachment
    - confirm no unrelated image attachment exists in the conversation
    - confirm this is a fresh generation chat, not a reused art conversation
  hard_stop: >
    If any required attachment is absent, wrong, ambiguous, or mixed with unrelated
    image context, return BLOCKED and DO NOT generate. Do not fetch Drive images as a
    replacement generation input.

forbidden_sources:
  - any Jiang Yucheng image or character data
  - any previous failed COM00-S04 candidate
  - any other character image
  - web image search
  - connector-fetched image used as generation reference
  - prior conversation memory as production authority

generation:
  candidate_count: 1
  automatic_retry: false
  style: >
    Realistic high-end game-cinematic / photographic PBR adult human rendering.
    Realistic facial anatomy and eye size; natural skin texture and pores; physically
    plausible hair strands, cloth, metal and indoor lighting. Primary face attachment
    is the minimum realism floor. No anime, manga, cartoon, Pixar/Disney-like 3D
    animation-film face, doll/figurine face, oversized eyes, plastic skin, cel shading
    or painterly illustration.
  content: >
    Exactly one visible heroine: Xu Tang, age 27. Long dark-brown hair worn DOWN,
    large gold hoop earrings. Preserve Weekday Neighbor Look 01 exactly: cream ribbed
    V-neck button cardigan, gray-brown high-waist wide-leg trousers, black loafers,
    small black shoulder bag. Calm neutral-observant to restrained polite smile.
  scene: >
    16:9 landscape, eye-level medium to medium-wide shot in the dry shared 17F
    apartment corridor on a rainy night. Xu Tang stands outside 1702 on her homeward
    path. Keep enough corridor architecture to communicate 1702/1703 neighbor geography.
    1702 interior is not visible. Warm residential practical light plus restrained cool
    rainy-blue exterior spill.
  protagonist: >
    Completely absent. No face, head, shoulder, back, hand, arm, body, silhouette,
    reflection, or over-the-shoulder framing.

post_generation_gate:
  no_retry: true
  fail_if:
    - face is more stylized/cartoon-like than the face attachment
    - hair is not long dark-brown hair worn down
    - wardrobe differs materially from Weekday Neighbor Look 01
    - protagonist or another person appears
    - environment is not the shared rainy-night corridor
    - framing is not 16:9 landscape
  on_fail: >
    Mark FAIL and stop. Do not self-retry and do not treat the image as accepted/master.

deliverables:
  - exactly one candidate image if attachment gate PASS
  - concise handoff reporting attachment-gate PASS/FAIL and post-generation result

handoff_to: asset_qa
```

## Operator rule

This pilot is intentionally Human-assisted. The three required images must be manually
attached to the fresh ChatGPT conversation before the task is executed.
