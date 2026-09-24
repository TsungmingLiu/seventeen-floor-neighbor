# COM00-S04 CG Artist v0.2 — Failure Record

Status: **FAIL — invalid candidate, do not reuse**

What v0.2 proved successfully:
- exact repo/ref/path binding worked;
- all required Markdown contents were actually read;
- all five exact Google Drive image files were fetched;
- filenames/MIME/byte sizes matched;
- actual image pixels were visible and visually sanity-checked.

Observed generation failure:
- output still used an obvious 3D-animation/cartoon facial style;
- eyes/facial anatomy were more stylized than the canonical face reference;
- hairstyle changed to an updo/bun instead of the canonical long hair down;
- wardrobe changed to a striped loose sweater rather than Weekday Neighbor Look 01;
- the protagonist's body/shoulder appeared despite being forbidden.

Diagnosis:
- source acquisition is no longer the primary failure;
- generation-time reference selection/binding was not proven explicit;
- the positive style wording `semi-realistic / visual-novel illustration` was too ambiguous and may permit unwanted stylization.

Corrective action in v0.3:
- require explicit runtime reference-image binding in the image-generation call;
- BLOCKED if explicit binding is unavailable;
- replace ambiguous style terms with realistic photographic/PBR game-cinematic style lock;
- primary face reference becomes minimum realism floor;
- add no-retry post-generation hard-fail gate.

Do not use the v0.2 candidate as identity, style, wardrobe, continuity, or composition reference.
