# Data Pack Contracts

Version: 0.1.0

Data packs contain task content. Harnesses contain reusable behavior.

## Global Visual Pack

Contains only game-wide production rules:
- current aspect ratio and responsive/crop policy;
- rendering/style contract;
- global negative style constraints;
- dialogue safe-zone guidance;
- output/master/runtime requirements;
- CG / CG-sequence / video semantics.

Current authority: `docs/art/PRODUCTION_VISUAL_DIRECTION.md`.

## Character Pack

Exactly one character per pack.

Required concepts:
- stable character ID;
- canonical age/body/face/hair facts needed for visual identity;
- reference asset IDs/URLs;
- wardrobe selection for the task;
- task-relevant expression/behavior constraints;
- forbidden identity traits.

Do not include another character for comparison.

## Environment Pack

Contains:
- location ID;
- time/weather;
- persistent layout facts;
- lighting;
- scene-specific props;
- composition constraints;
- continuity anchors.

No character identity data.

## Scene Pack

Contains only the narrative facts needed for one scene:
- objective;
- entry/exit state;
- dialogue/narration/choices as applicable;
- locked staging;
- continuity facts;
- intended emotional beats.

No generation workflow instructions.

## Shot Pack

One visual shot or one explicitly linked CG sequence.

Required concepts:
- shot ID;
- scene ID;
- visible character IDs;
- CG class: background_cg | dialogue_cg | reaction_cg | event_cg | cg_sequence_keyframe;
- framing/camera/action;
- expression;
- wardrobe key;
- environment ID;
- continuity;
- focus point / safe-zone intent;
- dialogue beat range;
- forbidden changes.

Old 9:16 or sprite notes in scene files are not copied into new Shot Packs.

## Continuity Pack

Optional and minimal:
- immediately previous accepted shot ID;
- stable physical facts that must persist;
- props/positions/lighting state.

It is not a substitute for canonical character references.
