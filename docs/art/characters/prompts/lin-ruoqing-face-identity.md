# Lin Ruoqing — Sheet 01 Face Identity Prompt

> Lifecycle: **CANONICAL**
>
> Prompt role: executable projection of `docs/art/characters/lin-ruoqing.md`
>
> Output status: candidate only; Human acceptance required

## Isolation precondition

- Read only `docs/art/characters/lin-ruoqing.md` and this prompt.
- Do not load any other heroine specification, reference image, prompt or generated candidate.
- Do not use Jiang Yucheng as a visual reference; the collision guard below is textual exclusion only.
- Generate exactly one candidate image.

## Copy-ready prompt

```text
Create one production-grade, photorealistic cinematic game-character reference sheet for Lin Ruoqing, a 27-year-old adult East Asian woman and elementary-school teacher. She must look slightly youthful for her age, bright, healthy and energetic, while remaining unmistakably adult.

IDENTITY:
- round-oval adult face with recognizable cheeks and natural smile muscles;
- natural jaw, not a tiny pointed V-line;
- medium-to-slightly-large eyes in realistic human proportion, direct and lively gaze;
- naturally curved expressive eyebrows, natural straight nose, warm natural coral lips;
- neutral-warm skin with subtle outdoor healthy tone and visible real skin texture;
- dark brown-black collarbone-length hair gathered into her primary signature: a realistic medium-high ponytail with natural weight and movement;
- a few long natural strands around the forehead and ears, no blunt bangs;
- small simple stud earrings;
- calm neutral expression with an underlying approachable, active energy;
- simple unbranded white crew-neck top, shoulders visible.

SHEET LAYOUT:
Show the exact same woman with the exact same hairstyle, makeup, lighting and neutral expression in: front view, left 30 degrees, left 45 degrees, left profile, right 30 degrees, right 45 degrees, right profile, and back view of the ponytail. Add clean close-up crops of both eyes, nose, lips, ear and hair texture. Keep head scale consistent across views.

STYLE AND CAMERA:
Photorealistic cinematic game-character reference photography; truthful East Asian adult anatomy; 85mm-equivalent lens; eye-level camera; neutral warm-gray studio background; soft even frontal studio light; sharp detail in every panel; natural pores, under-eye shading, fine hair and lip texture; no shallow-focus blur; clean grid with no text.

HARD EXCLUSIONS:
No short bob, no chin-length hair, no short curls, no round fluffy animal-like hairstyle, no ACG styling, no school uniform, no student-idol styling, no oversized anime eyes, no tiny upturned childlike nose, no pointed chin, no doll skin, no excessive whitening, no petite childlike frame, no cute hair clips, no bows, no over-knee socks or hosiery motifs, no shy guarded expression, no illustration or anime linework, no poster typography, no city background.

The result must read as a lively adult woman whose ponytail, healthy presence and direct gaze remain recognizable even without clothing context.
```

## Acceptance gate

Reject the candidate if any item fails:

- The default hairstyle is not a medium-high ponytail.
- The loose hair length implied by the ponytail is not approximately collarbone length.
- She reads as underage, a university freshman, an idol or an anime heroine.
- The face is a small pointed-face beauty template rather than a round-oval adult face.
- The body/neck styling implies Jiang Yucheng's petite, fragile, shy silhouette.
- Any angle changes identity, jaw, nose, eye spacing, hairline or ear structure.
- The sheet contains generated labels, slogans or decorative scenery.

Passing this prompt produces only a Sheet 01 candidate. It does not create an accepted source ID or authorize later sheets.
