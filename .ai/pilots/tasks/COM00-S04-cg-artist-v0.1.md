# Pilot Task Packet — COM00-S04 CG Artist

```yaml
task_id: pilot-com00-s04-cg-v001
task_type: cg_generate
workflow_version: 0.1.0
harness: cg_artist
objective: >
  Generate exactly one production candidate for COM00-S04 using only the isolated
  Xu Tang, environment, shot, and global visual packs. This pilot tests identity
  isolation and style stability, not final asset acceptance.

allowed_sources:
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
  - gdrive:1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS
  - gdrive:19kDLngndmnc4eT4EzdxTpjCUwiMo7M3T
  - gdrive:1dTvm8uC5m2jaq8OUDDzaloOUrzeWBHIx
  - gdrive:1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF
  - gdrive:1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun

forbidden_sources:
  - docs/art/CHARACTER_REFERENCE_PACK_SPEC.md
  - docs/art/PROTOTYPE_ART_REQUIREMENTS.md
  - docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md
  - docs/art/recipes/
  - docs/proposals/
  - docs/narrative/scenes/
  - .ai/pilots/results/COM-00-shot-plan-v0.1.md
  - any Jiang Yucheng reference or data
  - any unrelated heroine reference or data
  - any previous generated Xu Tang CG not explicitly listed
  - runtime-public/sprites/
  - prior conversation memory as production authority

inputs:
  global_pack: docs/art/PRODUCTION_VISUAL_DIRECTION.md
  character_packs:
    - .ai/pilots/data/COM00-S04/xu-tang.character.md
  environment_pack: .ai/pilots/data/COM00-S04/bg-apt-17f-rain.environment.md
  shot_pack: .ai/pilots/data/COM00-S04/COM00-S04.shot.md
  continuity_pack: null

execution:
  candidate_count: 1
  automatic_regeneration: false
  image_generation_required: true
  reference_fetch_required: true
  reference_rule: >
    Fetch exactly the five allowlisted Drive images. Confirm all four Xu Tang references
    and the environment reference are visible image inputs before generation.
  prompt_construction: >
    Construct the generation instruction only from the supplied packs and global visual
    contract. Do not browse for inspiration or retrieve broader canon.
  output_target:
    preferred_drive_folder_id: 1-KdOiPN-6tEHZO3f2_-psM1kvfw7wf-M
    preferred_filename: pilot-com00-s04-candidate-v001.png
    rule: >
      If the runtime exposes a connector-compatible file reference for the generated image,
      upload the candidate to this Drive staging folder. If it does not, do not invent an
      upload or claim success; leave the image as the conversation artifact and report the
      transport limitation on the next handoff-capable turn.

constraints:
  locked:
    - exactly one visible heroine: Xu Tang
    - no protagonist face/body in frame
    - Weekday Neighbor / Look 01
    - 16:9 landscape
    - medium to medium-wide
    - neutral_observant transitioning to a restrained polite smile
    - 17F rainy-night corridor, interior dry
    - enough 1702/1703 geography to read neighboring apartments
  must_not_change:
    - character identity
    - wardrobe
    - scene meaning
    - environment identity
    - game-wide visual style

deliverables:
  - id: com00-s04-candidate-v001
    type: image
    requirement: exactly one candidate image
  - id: com00-s04-preflight-v001
    destination: .ai/pilots/results/COM00-S04-cg-artist-preflight-v0.1.md
    requirement: >
      Before image generation, write source/version audit, references actually fetched,
      pack IDs, and the final concise generation brief. This file must not contain unrelated
      character/story context.

acceptance:
  - only allowlisted GitHub and Drive sources are used
  - all four Xu Tang references are actually fetched as visible image inputs
  - no Jiang Yucheng or unrelated heroine data is loaded
  - environment reference is used for geometry/lighting only, not old 9:16 framing
  - exactly one candidate is generated
  - candidate is 16:9 landscape
  - Xu Tang identity, age read, long dark-brown hair, gold hoops, and Look 01 wardrobe are preserved
  - style is cinematic realistic/semi-realistic urban romance, not manga/comic
  - no reusable sprite or character-sheet composition
  - no canon changes
  - image is not self-accepted as production master

handoff_to: asset_qa
```

## Pilot rule

This test intentionally withholds the original character catalog, scene, old CG prompt,
other heroine data, and prior CGs. If the supplied packs are insufficient, return BLOCKED;
do not widen the context.
