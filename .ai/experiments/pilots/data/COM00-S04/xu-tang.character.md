# Character Pack — Xu Tang / COM00-S04

> Lifecycle: **EXPERIMENTAL — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical pilot material. Do not execute as a production task.

```yaml
pack_id: char-xu-tang-com00-s04-v001
pack_type: character
character_id: xu_tang
character_name: Xu Tang / 許棠
scope: COM00-S04 only

identity:
  age: 27
  height_cm: 170
  ethnicity: East Asian
  visual_direction:
    - mature
    - refined
    - restrained
    - realistic urban woman
    - calm, slightly distant but naturally warm when appropriate
  face:
    - adult facial structure
    - refined but not idol-like
    - no childish or overly sweet read
  hair:
    color: dark brown
    length: long
    texture: softly wavy / natural
  signature_accessory:
    - large gold hoop earrings

wardrobe:
  key: Weekday Neighbor / Look 01
  locked_items:
    - cream ribbed V-neck button cardigan
    - gray-brown high-waist wide-leg trousers
    - black loafers
    - small black shoulder bag
    - large gold hoop earrings
  rule: wardrobe reference image is final visual authority

expression:
  start: neutral_observant
  end_read: polite_smile
  target:
    - calm and mildly warm
    - small restrained smile
    - socially bounded
    - no flirtatious gaze
    - no broad idol smile

references:
  - role: primary_face_identity
    file: xt-ref-01-face.png
    drive_file_id: 1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS
    authority: highest
    required: true
  - role: expression_acting
    file: xt-ref-02-expression.png
    drive_file_id: 19kDLngndmnc4eT4EzdxTpjCUwiMo7M3T
    authority: expression_only
    required: false
  - role: production_consistency
    file: xt-ref-04-production.png
    drive_file_id: 1dTvm8uC5m2jaq8OUDDzaloOUrzeWBHIx
    authority: hair_hands_accessory_lighting
    required: false
  - role: wardrobe
    file: xt-ref-05-wardrobe-a.png
    drive_file_id: 1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF
    authority: outfit
    required: true

reference_loading:
  rule: >
    Use the smallest reference stack required by the Shot Task. For COM00-S04 v0.3,
    fetch ONLY xt-ref-01-face.png and xt-ref-05-wardrobe-a.png. Do not fetch expression
    or production sheets unless a later shot explicitly needs them.
  selected_stack_for_com00_s04_v003:
    - xt-ref-01-face.png
    - xt-ref-05-wardrobe-a.png
  identity_priority:
    - xt-ref-01-face.png
    - xt-ref-05-wardrobe-a.png
  previous_generated_cg_as_identity_source: forbidden

forbidden_identity_traits:
  - short or bobbed hair
  - youthful graduate-student styling
  - childish face
  - overly cute idol expression
  - traits from any other heroine
  - random accessory replacement
  - random wardrobe redesign
  - manga/chibi exaggeration

compiled_from:
  - source: docs/art/CHARACTER_REFERENCE_PACK_SPEC.md
    git_blob_sha: 249620a6959236329ef0bacfba2912dee3761578
  - source: docs/art/recipes/sprites/opening_batch_a_sprites.md
    git_blob_sha: 55707eb89d314fb475042ea9dee4c1e058d3210d
    usage: wardrobe Look 01 text extraction only; sprite/rendering instructions discarded
```
