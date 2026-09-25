# CG Artist Harness

> Lifecycle: **ARCHIVED — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical harness retained for provenance. Do not resolve or execute it.

Harness ID: cg_artist  
Version: 0.4.0

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

## Reference transport modes

The current ChatGPT image-generation surface cannot provide a hard, auditable guarantee that connector-fetched images are explicitly bound into a generation call. Do not retry or work around that limitation.

### Mode A — base CG: `human_attachment_required`

Use for a new base CG.

The Task Packet must specify the exact reference files a Human must attach to a **fresh image-generation chat**.

Before generation:
- verify the current conversation contains every required attachment;
- verify each attachment's visible pixels match its assigned role;
- verify there are no unrelated image attachments in the conversation;
- do not fetch replacement/reference images through Drive for the generation step;
- do not use prior conversation images, model memory, web images, or connector-fetched runtime images as generation references.

If any required attachment is missing, visually wrong, ambiguous, or mixed with unrelated image context, return BLOCKED with `waiting_for_reference_attachment` or `attachment_context_contaminated`.

For a valid fresh session, the required Human-attached images are the complete eligible image context for the generation call.

### Mode B — Reaction CG / close variant: `edit_from_accepted_base`

Use when an accepted base CG already exists and the requested change is bounded, such as:
- expression change;
- gaze shift;
- small hand/pose adjustment;
- subtle emotional reaction.

The Human must attach the accepted base CG as the explicit edit target. Canonical identity/wardrobe references may also be attached only when needed to protect identity.

Do not regenerate a Reaction CG from scratch when a controlled edit can preserve composition and continuity.

### Capability boundary

The previous `explicit_reference_binding` connector path is considered unsupported for autonomous production until a future capability test proves otherwise.

## Reference discipline

For a single-character base shot:
- the Task Packet selects the smallest canonical reference set;
- the Human attaches exactly those selected files in a fresh chat;
- primary face identity is mandatory;
- wardrobe/environment are attached only when the shot needs them;
- never attach another heroine “for style consistency”.

For a multi-character shot:
- keep each Character Pack separate and namespaced;
- verify every visible face against its own primary identity reference.

A previous accepted CG may be used as the explicit edit target for a Reaction CG or continuity variant. For new base CG generation it does not replace canonical identity references.

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

## Attachment preflight receipt

For `human_attachment_required`, record before generation:
- expected filename;
- observed attachment filename when available;
- assigned role;
- `pixels_visible_to_worker: true|false`;
- one-line visual sanity check;
- `required_attachment_present: true|false`;
- count of unrelated image attachments in the current conversation.

Generation is authorized only when every required attachment is present and visually verified and unrelated-image count is zero.

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
- any required Markdown is not readable from the bound repo/ref;
- a base-CG task uses connector-fetched images instead of the required Human attachments;
- any required Human attachment is absent or visually does not match its role;
- unrelated images are present in the fresh generation chat;
- the worker cannot determine which attached image is the intended reference;
- a Reaction CG task lacks its accepted base edit target;
- the worker is tempted to substitute memory, prose-only identity, web images, or an unrelated prior CG.

