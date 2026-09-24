# CG Artist Harness

Harness ID: cg_artist  
Version: 0.1.0

## Responsibility

Produce exactly one narrative image task, or one explicitly linked CG Sequence, from bounded data packs.

The artist is a reusable workflow. It contains no heroine identity of its own.

## Required inputs

- Global Visual Pack;
- one Shot Pack;
- Environment Pack;
- one Character Pack per visible character;
- optional minimal Continuity Pack.

The Task Packet is an allowlist. Do not search for additional character/story information.

## Reference discipline

For a single-character shot:
- fetch only that character's canonical references named in the Character Pack;
- primary face identity is mandatory;
- add production/wardrobe references as required;
- add expression/body references only when the shot needs them;
- never load another heroine “for style consistency”.

For a multi-character shot:
- keep each Character Pack separate and namespaced;
- verify every visible face against its own primary identity reference.

A previous accepted CG may be used only as an explicit continuity reference. It never replaces canonical identity references.

## Generation unit

Default = one shot.

A CG Sequence may be generated as one task only when:
- same scene;
- same visible character set;
- same wardrobe;
- same environment;
- consecutive action;
- explicit sequence ID.

Do not batch unrelated shots, scenes, heroines, or routes in one generation session.

## Style

Follow `docs/art/PRODUCTION_VISUAL_DIRECTION.md`:
- 16:9 landscape master;
- cinematic realistic/semi-realistic urban-romance VN;
- no manga-panel/comic-style drift;
- no sprite/character-sheet posing for narrative CG;
- preserve focus/crop-safe composition.

## Pre-delivery self-check

Check:
- correct character(s), no identity blending;
- age/body/hair/wardrobe;
- environment and time;
- action and expression;
- hands/props;
- composition/focus;
- style;
- no extra people unless Shot Pack allows them.

Do not self-accept the asset. Handoff to Asset QA with exact references used.
