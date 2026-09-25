# COM-00 Shot Plan — v0.1

> Lifecycle: **EXPERIMENTAL — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical pilot material. Do not execute as a production task.

> Task: pilot-com00-shot-plan-v001  
> Harness: shot_planner v0.1.0  
> Workflow: seventeen-floor-production v0.1.0  
> Scene: COM-00 — 雨夜搬家  
> Production contract: CG-first, 16:9 landscape master, responsive full viewport  
> Canon changes: none

## 1. Planning boundary

This plan converts the locked COM-00 scene into CG-first visual coverage only.

Locked and preserved:
- narrative beats 00.1–00.8;
- all existing dialogue, narration, choice wording, branch semantics, state values, and knowledge flags;
- Week 1 rainy-night 17F corridor geography;
- Xu Tang is the only visible heroine;
- Xu Tang helps only enough to clear the door/box problem, then leaves;
- no contact exchange or romantic escalation;
- Protagonist full face remains undefined;
- Xu Tang wardrobe remains Weekday Neighbor / Look 01.

Superseded rendering assumptions are not carried forward:
- no 9:16 production master;
- no reusable sprite requirement;
- no sprite/composite return;
- no dissolve-back-to-sprite instruction.

### Visual identifiers used in this plan

- Environment ID: BG-APT-17F-RAIN
- Heroine: Xu Tang / 許棠
- Protagonist: Protagonist / [PLAYER_NAME]
- Heroine wardrobe key: Weekday Neighbor / Look 01

The Protagonist may appear only as first-person-adjacent partial hands/arms/shoulder when needed for action legibility. His full face is never shown.

## 2. Shot economy

COM-00 uses six shot slots. This is enough to cover the complete scene without one-image-per-line behavior and without relying on reusable character sprites.

No CG Sequence is required in this pilot plan: the door/box action is short and can be read cleanly as a held event CG, while the later emotional/geographic changes justify distinct cuts. This does not preclude runtime cut, crossfade, subtle pan/zoom, ambience, or SFX timing.

## 3. Ordered shot plan

### COM00-S01 — Rainy-night arrival / box problem setup

- CG class: background_cg
- Dialogue / beat coverage:
  - 00.1 新家的聲音
  - 00.2 箱角卡門, through the moment immediately before Xu Tang's intervention
  - Runtime coverage: common_movein_rain_open → opening action of common_movein_rain_door
- Visible character IDs:
  - none required
  - optional Protagonist partial hand/forearm only if needed to make the caught-box action readable
- Environment ID: BG-APT-17F-RAIN
- Framing / camera:
  - 16:9, Protagonist eye-height establishing view down the 17F corridor
  - foreground boxes occupy one side rather than blocking the full frame
  - fire-door line and corridor depth are readable
  - no Protagonist face
- Action:
  - establish the three remaining boxes and the dry corridor
  - transition visually from orderly unpacking to one box corner catching the rebounding fire door
  - the problem reads as awkward, not dangerous
- Expression / emotional read:
  - no heroine expression
  - visual tone is quiet, practical, slightly awkward; no loneliness melodrama
- Wardrobe key:
  - none
- Continuity anchors:
  - Week 1, approximately 21:10, rain continuing outside
  - corridor interior remains dry
  - rain presence comes from distant window light, sound context, and restrained floor/shoe reflection cues
  - three boxes are present before the door problem is cleared
  - 1702/1703 corridor geography must remain compatible with later shots
- Focus / safe-zone / crop intent:
  - focal priority: caught box corner + fire-door line + corridor depth
  - keep critical box/door interaction out of the bottom 25%
  - preserve a clean lower dialogue-safe region
  - moderate horizontal crop must still preserve the box/door relationship
- CG-sequence membership: none
- Forbidden changes:
  - no visible heroine yet
  - no additional movers or residents
  - no flooded/wet indoor corridor
  - no severe accident or blocked-escape emergency framing
  - no readable brand/logo/text inserted into the image
  - no Protagonist full face

### COM00-S02 — Xu Tang clears the door problem with him

- CG class: event_cg
- Dialogue / beat coverage:
  - 00.3 許棠扶門
  - 00.4 合力挪箱
  - Runtime coverage: Xu Tang's intervention in common_movein_rain_door through the box clearing the door line
- Visible character IDs:
  - Xu Tang
  - Protagonist partial hand/arm only; full face excluded
- Environment ID: BG-APT-17F-RAIN
- Framing / camera:
  - 16:9 first-person-adjacent framing from the Protagonist side of the box
  - Xu Tang sits in the center-right / right-central composition band
  - foreground box provides depth; fire door and Xu Tang's supporting hand remain legible
  - the camera observes collaboration rather than staging a face-to-face romantic tableau
- Action:
  - Xu Tang braces/holds the door
  - she assists only at the stuck corner while the Protagonist rotates/lifts the box
  - by the end of the held shot, the box clears the door line
- Expression / emotional read:
  - neutral_observant
  - attention begins on the box/door problem and may briefly lift toward the Protagonist
  - restrained courtesy; no romantic astonishment
- Wardrobe key:
  - Weekday Neighbor / Look 01
- Continuity anchors:
  - same rain-night corridor lighting as S01
  - same box is the problem box from S01
  - Xu Tang is on her normal route home toward 1702
  - she does not take over the move
  - after the action, the fire-door line is clear
- Focus / safe-zone / crop intent:
  - critical region: Xu Tang face + door-support hand + stuck/clearing box corner
  - keep all three critical regions away from extreme edges and above the bottom 25%
  - dialogue-safe area should remain left-lower to lower-center
  - moderate horizontal crop must retain Xu Tang's face and the helping action
- CG-sequence membership: none
- Forbidden changes:
  - no long eye-lock or model-facing gaze
  - no flirtatious body contact, hand-holding, catching/falling pose, or prolonged touch
  - no drenched clothing
  - no luxury-penthouse reinterpretation
  - no extra movers
  - no romantic escalation or contact exchange
  - no Protagonist full face
  - no character redesign

### COM00-S03 — Choice response reaction slot

- CG class: reaction_cg
- Dialogue / beat coverage:
  - 00.5 Player choice only
  - Runtime coverage: common_movein_rain_choice and its three local branches, ending immediately before common_movein_rain_names
- Visible character IDs:
  - Xu Tang
  - Protagonist remains off-camera
- Environment ID: BG-APT-17F-RAIN
- Framing / camera:
  - 16:9 medium single-character shot
  - box is now clear of the fire-door line and may remain as a secondary foreground/context object
  - Xu Tang remains in the corridor, not inside or approaching 1703
- Action:
  - she has released or is finishing releasing the door
  - she checks the box/door clearance while responding to the player's selected tone
  - no new action beyond the already locked branch behavior
- Expression / emotional read:
  - branch-resolved render variant under the same narrative shot slot:
    - COM00-S03-FORMAL: polite_smile
    - COM00-S03-JOKE: dry_playful, with the first small smile kept restrained
    - COM00-S03-PRACTICAL: neutral_observant / mild-surprise-level attentiveness, without reading the choice as bravado
  - each runtime branch must receive only its matching variant; this is not a reusable sprite layer
- Wardrobe key:
  - Weekday Neighbor / Look 01
- Continuity anchors:
  - door line is clear after S02
  - physical distance remains that of two new neighbors solving a small hallway problem
  - no relationship/state implication beyond the already locked branch outputs
- Focus / safe-zone / crop intent:
  - focus on Xu Tang's restrained facial read and her glance toward the cleared box/door line
  - keep face inside central safe composition band
  - preserve lower third for dialogue UI
  - crop tolerance must not convert the shot into an intimate close-up
- CG-sequence membership: none
- Forbidden changes:
  - do not alter choice wording or branch semantics
  - do not imply that the humorous branch is the "correct" romantic choice
  - no added flirtation, appearance compliment, invitation, personal questioning, or contact exchange
  - no reusable sprite assumption
  - no Protagonist face or body reveal
  - no character redesign

### COM00-S04 — Names and 1702/1703 geography

- CG class: dialogue_cg
- Dialogue / beat coverage:
  - 00.6 名字與門牌
  - Runtime coverage: common_movein_rain_names
- Visible character IDs:
  - Xu Tang only
  - Protagonist is camera-side/off-camera
- Environment ID: BG-APT-17F-RAIN
- Framing / camera:
  - 16:9 medium-to-medium-wide single-character composition
  - both 1702 and 1703 spatial relationship must be understandable from architecture/door placement without requiring giant readable door-number text
  - Xu Tang stays on her own homeward path near 1702
- Action:
  - after confirming the new neighbor context, she identifies herself and indicates her door naturally
  - the shot supports the low-pressure name/neighbor exchange without turning into an interview
- Expression / emotional read:
  - neutral_observant transitioning in read toward polite_smile
  - calm, mildly warm, socially bounded
- Wardrobe key:
  - Weekday Neighbor / Look 01
- Continuity anchors:
  - box remains safely away from the fire-door line
  - Xu Tang does not move toward or enter 1703
  - 1702/1703 relationship established here must match all future corridor scenes
  - interaction remains neighbor-level; no contact information is exchanged
- Focus / safe-zone / crop intent:
  - primary focus: Xu Tang face/upper body
  - secondary focus: enough of the two-door geography to read spatial relation
  - preserve lower third for dialogue
  - under moderate horizontal crop, Xu Tang and the directional cue toward 1702 must remain readable
- CG-sequence membership: none
- Forbidden changes:
  - no work/income/relationship-status questioning
  - no phone/contact exchange
  - no romantic validation
  - no exaggerated glamour/model pose
  - no giant legible door-number typography used as a compositional crutch
  - no character redesign
  - no Protagonist full-face reveal

### COM00-S05 — Goodnight and return to 1702

- CG class: dialogue_cg
- Dialogue / beat coverage:
  - 00.7 到此為止
  - Runtime coverage: opening of common_movein_rain_goodnight through Xu Tang entering 1702
- Visible character IDs:
  - Xu Tang only
  - Protagonist remains off-camera
- Environment ID: BG-APT-17F-RAIN
- Framing / camera:
  - 16:9 medium-wide corridor composition biased toward the 1702 side
  - camera remains near the Protagonist/1703 side of the hall
  - enough negative space remains to make her departure feel final rather than inviting
- Action:
  - Xu Tang gives the low-pressure goodnight
  - she cards/enters 1702 and continues inside
  - no pause for a backward pose
- Expression / emotional read:
  - soft_goodnight
  - friendly but closed for the evening
- Wardrobe key:
  - Weekday Neighbor / Look 01
- Continuity anchors:
  - same corridor lighting and rain ambience
  - Xu Tang's path ends at 1702
  - the box problem is already resolved
  - she does not resume helping with the move
- Focus / safe-zone / crop intent:
  - focus on Xu Tang's natural departure action and 1702 threshold
  - keep face/hand/card action away from extreme edges
  - preserve lower dialogue-safe region
  - crop must not remove the fact that she is leaving into her own apartment
- CG-sequence membership: none
- Forbidden changes:
  - no lingering look back
  - no romantic invitation, contact exchange, or promise to meet
  - no approach toward 1703
  - no continued moving assistance
  - no staged pin-up/back-view pose
  - no character redesign

### COM00-S06 — Quiet corridor / new-home coda

- CG class: background_cg
- Dialogue / beat coverage:
  - 00.8 安靜新家
  - Runtime coverage: remainder of common_movein_rain_goodnight through scene end actions
- Visible character IDs:
  - none required
  - optional Protagonist partial hand/arm only if needed to show the final box being pulled through 1703
- Environment ID: BG-APT-17F-RAIN
- Framing / camera:
  - 16:9 quiet threshold/corridor composition from near 1703
  - 1702 is closed; 1703 and the last box carry the final visual change
  - no heroine remains in frame
- Action:
  - the last box moves into 1703
  - corridor returns to stillness
  - visual ending records that the neighboring door is now a known place, without romantic inference
- Expression / emotional read:
  - no heroine expression
  - restrained coda: quiet, slightly less anonymous, not sentimental
- Wardrobe key:
  - none
- Continuity anchors:
  - Xu Tang is fully inside 1702
  - fire-door line remains clear
  - last box goes into 1703
  - rain continues outside; corridor remains dry
  - scene ends with no contact exchange and no romantic signal
- Focus / safe-zone / crop intent:
  - focus on 1703 threshold / final box with 1702 still spatially legible
  - keep key threshold/box information above bottom UI band
  - preserve lower dialogue-safe region for final narration
  - moderate horizontal crop must retain the "neighboring doors + final box" coda logic
- CG-sequence membership: none
- Forbidden changes:
  - no Xu Tang reappearance
  - no romantic-symbolic insert implying destiny or mutual attraction
  - no new props that imply contact exchange or a visit
  - no Protagonist full face
  - no rewritten state/narrative meaning

## 4. Branch rendering note

COM00-S03 is one narrative shot slot with three branch-resolved CG render variants. The variants exist only to preserve the locked reaction differences of the three player choices. They are not reusable character sprites, and no other scene should treat them as generic expression layers.

The remaining shots are branch-invariant and can be reused across all three local choice paths.

## 5. Next CG pilot candidate

Exactly one next isolated CG Artist pilot is nominated:

### Candidate: COM00-S04 — Names and 1702/1703 geography

Why this is the best next single-Xu-Tang pilot:
- single visible heroine only;
- no Protagonist body or face needs to be resolved;
- no branch-specific variant;
- no difficult contact, occlusion, or fast motion;
- expression is restrained and canonically bounded: neutral_observant → polite_smile read;
- wardrobe key is unambiguous: Weekday Neighbor / Look 01;
- the shot tests the two things the new pipeline needs to stabilize early: Xu Tang identity consistency and the game's current cinematic urban-romance rendering style;
- the corridor geography gives enough environmental context to test integrated character/environment lighting without introducing a second character.

This nomination does not generate art and does not load any character reference asset. A future CG Artist Task Packet must separately inject only Xu Tang's canonical Character Pack, the current Global Visual Pack, the required BG-APT-17F-RAIN environment data, and this one Shot Pack.

## 6. Source audit

Only the following Task Packet allowlisted sources were read for production authority:

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

No forbidden source was read. No character reference image or character reference pack was loaded. No image was generated.

## 7. Handoff

~~~yaml
task_id: pilot-com00-shot-plan-v001
status: PASS
workflow_version: 0.1.0
harness:
  id: shot_planner
  version: 0.1.0

inputs_used:
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

outputs:
  - id: com00-shot-plan-v001
    location: .ai/experiments/pilots/results/COM-00-shot-plan-v0.1.md
    description: Six-shot CG-first 16:9 visual plan covering COM-00 beats 00.1 through 00.8 without reusable sprites.
  - id: next-cg-pilot-candidate
    location: .ai/experiments/pilots/results/COM-00-shot-plan-v0.1.md
    description: COM00-S04 nominated as the sole next isolated single-Xu-Tang CG Artist pilot.

qa:
  checks:
    - name: source_allowlist_only
      result: PASS
    - name: no_forbidden_source_read
      result: PASS
    - name: no_image_generated
      result: PASS
    - name: cg_first_16_9_contract
      result: PASS
    - name: no_sprite_dependency
      result: PASS
    - name: complete_00_1_to_00_8_coverage
      result: PASS
    - name: shot_count_3_to_6
      result: PASS
    - name: exactly_one_next_single_xu_tang_pilot
      result: PASS
    - name: dialogue_choice_state_unchanged
      result: PASS
    - name: protagonist_full_face_undefined
      result: PASS
    - name: standard_handoff_included
      result: PASS
  known_issues: []

canon_changes:
  none: true

next:
  harness: cg_artist
  task_needed: >
    Build one bounded CG Artist Task Packet for COM00-S04 only. Inject the current
    Global Visual Pack, only Xu Tang's canonical Character Pack, the required
    BG-APT-17F-RAIN environment data, and the COM00-S04 Shot Pack. Do not load
    another heroine, unrelated prior CGs, or legacy batch-generation prompts.
~~~
