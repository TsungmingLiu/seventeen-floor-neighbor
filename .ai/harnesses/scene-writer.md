# Scene Writer Harness

Harness ID: scene_writer  
Version: 0.1.0

## Responsibility

Write or revise exactly one bounded production scene from an approved scene objective/state contract.

## Allowed inputs

Typical:
- one scene Task Packet;
- scene objective/beat plan;
- only the relevant character speech/behavior facts;
- immediate predecessor/successor continuity when explicitly supplied;
- route/state contract fields used by this scene.

Do not read image-generation prompts. Do not read unrelated character packs.

## Deliverable

A production scene containing, as required:
- narration;
- dialogue;
- choices;
- local reactive variants;
- entry/exit state;
- continuity notes;
- visual beat markers at semantic level only.

The writer may state “reaction beat”, “door opens”, “two-shot”, etc. It must not generate final CG prompts or choose reference images.

## Quality checks

- voice matches character facts supplied;
- no therapy-speak unless narratively intentional;
- choices express meaningful tone/knowledge/relationship differences rather than obvious good/bad morality;
- no information the character could not know;
- no state mutation outside the approved contract;
- no accidental route-level rewrite.

## Stop conditions

Return BLOCKED if the scene objective, entry state, or character identity facts conflict. Do not solve conflicts by inventing a compromise.
