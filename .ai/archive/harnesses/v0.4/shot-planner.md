# Shot Planner Harness

> Lifecycle: **ARCHIVED — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical harness retained for provenance. Do not resolve or execute it.

Harness ID: shot_planner  
Version: 0.1.1

## Responsibility

Convert one locked scene into a CG-first visual plan. This harness is the boundary between narrative and image production.

## Inputs

- current Global Visual Pack;
- one locked Scene Pack;
- allowed Environment Pack(s);
- task-relevant character identifiers/wardrobe keys;
- immediate visual continuity when needed.

Old scene notes about 9:16 or sprites are historical rendering instructions and MUST NOT be copied forward when they conflict with the current visual contract.

## Output

Create a compact ordered shot list. Each shot defines:
- shot ID;
- CG class;
- dialogue/beat range covered;
- visible character IDs;
- environment ID;
- framing/camera;
- action;
- expression/emotional read;
- wardrobe key;
- continuity anchors;
- focus/safe-zone intent;
- whether it belongs to a CG Sequence;
- forbidden changes.

## Shot economy

Do not create one image per line.

Default:
- normal scene: about 3–6 **actual render deliverables**, not merely narrative shot slots;
- important scene: about 6–10 actual render deliverables only when justified;
- motion: use a 2–6 frame CG Sequence when still cuts cannot communicate it cleanly.

### Reaction / branch-variant gate

A branch-specific render variant counts as a separate production asset, but asset economy is driven by **visible beat change**, not by branch count alone.

In a CG-first game without reusable sprites, a new Reaction CG is appropriate when the visible emotional/behavioral state materially changes, including for example:
- a restrained smile appearing;
- genuine surprise or realization;
- a meaningful silence / pause;
- gaze breaking or re-engaging;
- embarrassment, hurt, guardedness, relief, or a clear shift in interpersonal distance;
- a choice causing the heroine to respond with a visibly different emotional read.

Do **not** create a separate CG merely because wording, stat delta, or branch ID differs when the visible state is effectively the same.

For branch-specific variants:
- if two branches produce materially different visible reactions, separate CG variants are valid and expected;
- if the reaction is visually equivalent, reuse the same CG and let dialogue/audio/timing carry the branch difference;
- if the change is small but narratively meaningful, prefer a Reaction CG rather than suppressing it solely to save assets.

The planner should optimize for **emotional legibility first, then asset economy**.

Every shot plan must report both:
- narrative shot-slot count;
- estimated distinct render-asset count;
- which extra assets are justified specifically as Reaction CGs.

## Never

- generate the image;
- rewrite dialogue to fit a preferred shot;
- load image references for unrelated characters;
- invent a new character design;
- promote ordinary motion to video without a task-level decision.

Handoff one Shot Pack at a time to CG Artist.
