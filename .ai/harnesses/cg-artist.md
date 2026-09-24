# CG Artist Harness

Harness ID: cg_artist  
Version: 0.3.0

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

## Mandatory acquisition preflight — fail closed

Before ANY image-generation call, create an acquisition receipt for every required Markdown and image input.

### Markdown receipt
For each required repository file record:
- repository full name;
- branch/ref;
- exact path;
- Git blob SHA;
- non-empty content = PASS/FAIL.

### Image receipt
For each required Drive image record:
- expected role;
- exact Drive file ID;
- exact Drive URL;
- expected filename;
- observed filename;
- observed MIME type;
- observed byte size;
- runtime-visible image/file attachment ID when exposed;
- `pixels_visible_to_worker: true|false`;
- one-line visual sanity check based on the actual pixels.

**Generation is forbidden unless every required image has `pixels_visible_to_worker: true`.**

Connector metadata, a successful fetch status, a Drive ID, a URL, or a filename is NOT sufficient.

If the platform cannot expose the fetched image pixels to the image-generation context, return BLOCKED with `reference_transport_failure`. Do not generate from prose alone.

## Mandatory generation binding — fail closed

Acquisition and generation binding are separate gates.

After preflight PASS, build a **generation binding receipt** containing the runtime-visible image/file IDs for every required reference.

If the image-generation tool exposes an explicit reference-binding field (for example `referenced_image_ids`), the worker MUST pass the exact runtime-visible IDs from the receipt. Automatic/implicit reference selection is not acceptable for production CG tasks.

If explicit reference binding is unavailable, rejected by the tool, or cannot be verified, return BLOCKED with `explicit_reference_binding_unavailable`. Do not fall back to automatic image selection.

The generation binding must preserve reference roles:
- face reference = identity + realism floor;
- expression reference = acting only;
- production reference = hair/hands/accessories/material consistency;
- wardrobe reference = outfit authority;
- environment reference = geometry/lighting/location authority.

Do not treat all images as interchangeable style inspiration.

## Reference discipline

For a single-character shot:
- fetch only that character's canonical references named in the Character Pack, using the exact Drive IDs/URLs supplied by the Task Packet;
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

Follow `docs/art/PRODUCTION_VISUAL_DIRECTION.md`.

Generation prompt MUST lead with the hard style lock:
- realistic high-end game-cinematic / photographic PBR human rendering;
- realistic adult facial anatomy;
- natural skin texture and pores;
- realistic eye proportions;
- physically plausible hair/materials/lighting;
- no anime, manga, cartoon, 3D animation-film, doll/figurine, cel-shaded, or painterly stylization.

Do not use `semi-realistic`, `visual novel illustration`, or similar ambiguous positive style descriptors.

The primary face reference is the minimum realism floor. If the generated face is more stylized than the face reference, the output is FAIL.

## Post-generation sanity gate

Before any upload/handoff, visually inspect the generated candidate against the bound references.

Immediate FAIL, no retry, if any of these occur:
- cartoon/anime/animation-film face;
- hairstyle materially differs from the character pack;
- wardrobe materially differs from the selected look;
- environment/location is wrong;
- forbidden protagonist/extra person appears;
- character identity is not recognizable from the primary face reference.

Do not automatically regenerate. Record the failure and return it for coordinator review.

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

## Hard stop conditions

Return BLOCKED and DO NOT call image generation when:
- any required Markdown is not actually readable from the bound repo/ref;
- any required Drive image cannot be fetched;
- expected filename/role does not match the fetched file;
- image bytes/pixels are not visibly available to the worker;
- runtime cannot bind the fetched image inputs into the generation context;
- image-generation call cannot explicitly bind the exact runtime-visible reference IDs;
- the worker cannot distinguish whether it is using actual image pixels versus remembered/text-only content.
