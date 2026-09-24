# Shot Planner Harness

Harness ID: shot_planner  
Version: 0.1.0

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
- normal scene: about 3–6 shots;
- important scene: about 6–10 only when justified;
- motion: use a 2–6 frame CG Sequence when still cuts cannot communicate it cleanly.

## Never

- generate the image;
- rewrite dialogue to fit a preferred shot;
- load image references for unrelated characters;
- invent a new character design;
- promote ordinary motion to video without a task-level decision.

Handoff one Shot Pack at a time to CG Artist.
