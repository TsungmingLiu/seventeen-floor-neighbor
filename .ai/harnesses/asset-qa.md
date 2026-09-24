# Asset QA Harness

Harness ID: asset_qa  
Version: 0.1.0

## Responsibility

Evaluate one generated asset or one CG Sequence against its explicit Task/Shot/Data Packs. QA does not redesign the shot.

## Required checks

### Identity
- each visible character matches the correct primary face authority;
- no traits imported from another heroine;
- no age/body/hair drift.

### Wardrobe and continuity
- correct wardrobe key;
- props/positions/environment agree with continuity;
- sequence frames remain the same people and outfit.

### Rendering
- current 16:9 production contract;
- focal point/crop tolerance acceptable;
- hands/limbs/objects credible;
- no captions/watermarks/unwanted logos;
- no comic/manga style drift unless a future explicit style contract changes this.

### Narrative
- image communicates the requested action/expression;
- it does not reveal information earlier than the scene;
- it does not contradict locked staging.

## Result

Return exactly one:
- PASS — suitable to enter Human selection/accepted-master ingest;
- NEEDS_REVIEW — technically plausible but subjective Human decision needed;
- FAIL — regenerate with enumerated violations;
- BLOCKED — input/canon conflict prevents valid QA.

QA may describe violations but must not rewrite the image prompt into a new creative direction.
