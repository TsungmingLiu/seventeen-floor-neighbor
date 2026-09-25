# Production Visual Direction

> Status: **CANONICAL visual-production contract**
>
> Version: 1.1
>
> Updated: 2026-09-25
>
> This file supersedes older 9:16 mobile-first and sprite-first production instructions wherever they conflict.

## 1. Production model: CG-first

New production content uses the following visual hierarchy:

1. **Background CG** — no visible heroine; environment/storytelling frame.
2. **Dialogue CG** — normal character scene; one image may carry multiple dialogue beats.
3. **Reaction CG** — meaningful expression/framing change.
4. **CG Sequence** — 2–6 tightly continuous keyframes for ordinary motion.
5. **Event / Hero CG** — high-value dramatic image.
6. **Video** — MP4/WebM support remains in the engine, but production video is reserved for special events when resources justify it.

New production scenes do **not** require reusable character sprites. Existing sprites remain valid runtime/regression fixtures until intentionally migrated.

## 2. Canvas and device strategy

Canonical production master is **16:9 landscape**.

Recommended masters:
- 1920×1080 minimum;
- 2560×1440 preferred when generation quality supports it.

Target play surfaces:
- desktop browser: responsive full viewport;
- laptop/tablet landscape: responsive;
- phone: landscape-first, with rotate-device guidance where appropriate.

Portrait 9:16 assets already produced may remain as legacy fixtures or be selectively reused, but they are not the default target for new production generation.

## 3. Responsive composition contract

Every accepted CG should preserve:
- a focal point;
- crop tolerance;
- dialogue-safe region;
- critical face/hand/object region;
- optional runtime focus metadata `focusX` / `focusY`.

Do not rely on center-crop alone.

General guidance:
- keep principal character/action inside a central safe composition band where possible;
- allow asymmetric framing, but record focal metadata;
- avoid putting essential faces/hands against extreme edges;
- two-character shots must remain readable under moderate horizontal crop.

## 4. Style contract

### Hard rendering target

New character CGs must read as **realistic high-end game-cinematic / photographic PBR character rendering**, not as an illustration genre.

Required:
- realistic adult human facial anatomy and proportions;
- eye size and eyelid structure within realistic human range;
- visible natural skin texture / pores / fine tonal variation;
- physically plausible hair strands and material response;
- physically plausible cloth, leather, metal, and indoor lighting;
- photographic lens/depth-of-field logic;
- cinematic but believable exposure and color;
- facial realism must be at least as realistic as the canonical primary face reference.

Do NOT use the following positive style descriptors in generation prompts:
- semi-realistic;
- anime-influenced;
- visual-novel illustration style;
- stylized illustration;
- animation-film look.

These terms are too ambiguous and may trigger unwanted stylization.

### Hard style failures

Reject immediately if the output shows:
- anime/manga facial proportions;
- oversized eyes or simplified nose/mouth anatomy;
- Pixar/Disney-like or generic 3D animation-film facial design;
- doll-like / figurine-like / game-avatar face;
- plastic airbrushed skin with no realistic texture;
- chibi or exaggerated anime expression;
- comic/manga panel language, ink-line drift, screentone, cel-shading;
- painterly/cartoon illustration replacing realistic PBR rendering;
- generic studio character-sheet posing in a narrative CG;
- unrelated character identity traits;
- embedded captions, UI, watermarks, or logos.

### Reference-based realism floor

For every character CG, the canonical primary face reference is both:
1. identity authority; and
2. the minimum realism/style floor for facial anatomy, skin, hair, and eye proportions.

The generated face must not become more stylized/cartoon-like than that source.

Environment art must use the same realistic material/lighting standard.

## 5. Identity and reference isolation

Character identity authority remains `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`.

For a single-character shot:
- use only that character's canonical references;
- never load another heroine's reference images;
- do not use another heroine as a style or body comparison.

Default reference stack should be minimal:
- primary face;
- production consistency sheet;
- relevant wardrobe;
- expression/body only when the shot requires them.

A previous generated CG may help immediate continuity but must never replace canonical identity references.

## 6. Shot economics

Do not generate one CG per dialogue line.

Typical normal scene target:
- roughly 3–6 visual shots.

Important scene:
- roughly 6–10 visual shots when justified.

A shot may cover multiple dialogue beats until camera, action, emotional read, or continuity materially changes.

## 7. CG sequence contract

Use CG Sequence for short movement that does not justify video:
- same character set;
- same wardrobe;
- same environment;
- consecutive action;
- stable camera logic unless the sequence intentionally cuts.

Examples: opening a door, looking up, turning, reaching, stepping closer.

Runtime presentation may use cut, crossfade, subtle pan/zoom, shake, blur/focus, SFX, ambience, and music timing.

## 8. Legacy supersession map

The following archived instructions are not production sources:
- `ARCHITECTURE*.md`: mobile portrait 9:16 as primary visual target;
- `docs/archive/art/PROTOTYPE_ART_REQUIREMENTS.md`: background + sprite as default scene construction;
- `docs/archive/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md`: 9:16 output and all-in-one batch-session workflow;
- `docs/archive/art/recipes/`: old background/sprite production recipes.

Historical location IDs and accepted asset provenance remain visible through current canonical scene/asset records; production workers must not load the archived files.
