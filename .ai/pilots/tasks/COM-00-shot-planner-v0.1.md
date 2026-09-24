# Pilot Task Packet — COM-00 Shot Planner

```yaml
task_id: pilot-com00-shot-plan-v001
task_type: shot_plan
workflow_version: 0.1.0
harness: shot_planner
objective: >
  Convert the locked COM-00 scene into a current CG-first 16:9 visual shot plan
  without generating art, rewriting dialogue, or changing narrative/state canon.

allowed_sources:
  - .ai/WORKFLOW_MANIFEST.yaml
  - .ai/harnesses/bootstrap.md
  - .ai/harnesses/shot-planner.md
  - .ai/policies/SOURCE_AUTHORITY.md
  - .ai/policies/CONTEXT_ISOLATION.md
  - .ai/schemas/DATA_PACKS.md
  - .ai/schemas/HANDOFF.md
  - PROJECT_STATE.md
  - docs/art/PRODUCTION_VISUAL_DIRECTION.md
  - docs/narrative/scenes/vertical-slice/COM-00.md

forbidden_sources:
  - docs/art/CHARACTER_REFERENCE_PACK_SPEC.md
  - docs/art/PROTOTYPE_ART_REQUIREMENTS.md
  - docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md
  - docs/art/recipes/
  - docs/proposals/
  - docs/narrative/scenes/vertical-slice/COM-01X.md
  - docs/narrative/scenes/vertical-slice/COM-01J.md
  - docs/narrative/scenes/vertical-slice/COM-02X.md
  - docs/narrative/scenes/vertical-slice/COM-02J.md
  - docs/narrative/scenes/vertical-slice/COM-03X.md
  - runtime-public/
  - assets-src/
  - prior conversation memory as production authority

inputs:
  global_pack: docs/art/PRODUCTION_VISUAL_DIRECTION.md
  character_packs: []
  environment_pack: null
  scene_pack: docs/narrative/scenes/vertical-slice/COM-00.md
  shot_pack: null
  continuity_pack: null

constraints:
  locked:
    - COM-00 narrative beats 00.1 through 00.8
    - all COM-00 player-choice intent
    - all COM-00 state outputs and knowledge flags
    - Xu Tang is the only visible heroine in this scene
    - Week 1 rainy-night 17F corridor geography
    - Xu Tang helps only enough to clear the door/box problem, then leaves
    - no contact exchange or romantic escalation
    - MC full face remains undefined
    - Xu Tang wardrobe key remains Weekday Neighbor / Look 01
  must_not_change:
    - dialogue
    - narration
    - choice wording or branch semantics
    - relationship/state values
    - scene order
    - character design
    - runtime code
  superseded_inputs:
    - any 9:16 instruction inside COM-00
    - any sprite/composite requirement inside COM-00
    - any instruction to dissolve back to a sprite
  output_format: markdown shot plan plus structured handoff

deliverables:
  - id: com00-shot-plan-v001
    destination: .ai/pilots/results/COM-00-shot-plan-v0.1.md
    requirements:
      - 3 to 6 shots for the complete scene
      - each shot declares CG class
      - each shot declares dialogue/beat coverage
      - each shot declares visible character IDs
      - each shot declares environment ID
      - each shot declares framing/camera/action/expression
      - each shot declares wardrobe key when a heroine is visible
      - each shot declares continuity anchors
      - each shot declares focus/safe-zone/crop intent
      - each shot declares CG-sequence membership or none
      - each shot declares forbidden changes
      - no shot assumes a reusable sprite layer
      - do not generate any image
  - id: next-cg-pilot-candidate
    destination: same file
    requirements:
      - nominate exactly one single-Xu-Tang shot as the next isolated CG Artist pilot
      - explain why it is low ambiguity and useful for testing identity/style stability
      - do not generate art or load character references

acceptance:
  - source audit lists only allowed sources actually read
  - no forbidden source is read
  - no old 9:16 or sprite-first rendering instruction is copied into the new plan
  - complete COM-00 visual coverage uses 3 to 6 shots
  - scene can be played visually without reusable character sprites
  - output identifies exactly one next single-character CG pilot
  - standard Handoff schema is included
  - canon_changes.none is true

handoff_to: cg_artist
```

## Pilot-specific rule

This is a workflow test, not a creativity test. If the task appears under-specified, the worker must use only the information already present in the allowed sources or return BLOCKED. It must not broaden context to solve uncertainty.
