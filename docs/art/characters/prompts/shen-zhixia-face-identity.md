# Shen Zhixia — Sheet 01 Face Identity Prompt

> Lifecycle: **CANONICAL**
>
> Prompt role: executable projection of `docs/art/characters/shen-zhixia.md`
>
> Output status: candidate only; Human acceptance required

## Isolation precondition

- Read only `docs/art/characters/shen-zhixia.md` and this prompt.
- Do not load any other heroine specification, reference image, prompt or generated candidate.
- Do not use Xu Tang as a visual reference; the collision guard below is textual exclusion only.
- Generate exactly one candidate image.

## Copy-ready prompt

```text
Create one production-grade, photorealistic cinematic game-character reference sheet for Shen Zhixia, a 30-year-old adult East Asian woman working in international consulting / financial strategy. She is precise, self-possessed, intelligent and high-functioning, but not cold, domineering, seductive or emotionally blank.

IDENTITY:
- slightly long soft-diamond adult face with visible but not gaunt cheekbones and a clean natural jaw;
- medium-sized, relatively horizontal almond eyes with direct attentive gaze, no exaggerated upward tilt;
- straight well-groomed eyebrows with a restrained arch;
- natural straight nose, proportionate lips in muted cool rose / bean-paste tone;
- neutral-cool skin with realistic pores and natural under-eye, nose-wing and lip-area shading;
- near-black straight hair reaching the upper shoulder blades when loose, gathered into her primary public signature: a neat low ponytail close to the back of the head;
- center or very slight side part with minimal controlled face-framing strands;
- small geometric stud earrings;
- calm neutral evaluative expression with visible human warmth;
- simple unbranded cool-gray crew-neck top, shoulders visible.

SHEET LAYOUT:
Show the exact same woman with the exact same hairstyle, makeup, lighting and neutral expression in: front view, left 30 degrees, left 45 degrees, left profile, right 30 degrees, right 45 degrees, right profile, and back view of the low ponytail. Add clean close-up crops of both eyes, nose, lips, ear and hair texture. Keep head scale consistent across views.

STYLE AND CAMERA:
Photorealistic cinematic game-character reference photography; truthful East Asian adult anatomy; 85mm-equivalent lens; eye-level camera; neutral cool-gray studio background; soft even frontal studio light; sharp detail in every panel; natural pores, under-eye shading, fine hair and lip texture; no shallow-focus blur; clean grid with no text.

HARD EXCLUSIONS:
No warm dark-brown waves, no loose romantic curls, no half-up waves, no side braid, no abundant wispy face strands, no large gold hoop earrings, no soft neighbor-girl styling, no oversized anime eyes, no fox eyes, no extreme winged eyeliner, no pointed V-line chin, no filler-like lips, no influencer cosmetic-surgery template, no femme-fatale gaze, no domineering boss pose, no biting lips, no illustration or anime linework, no poster typography, no skyline or luxury-office background.

The result must read as a mature, clear-minded adult woman whose soft-diamond face, near-black straight low ponytail, horizontal attentive eyes and controlled presence remain distinct without clothing context.
```

## Acceptance gate

Reject the candidate if any item fails:

- The default hairstyle is not a neat low ponytail made from near-black straight hair.
- She resembles Xu Tang with a different expression or business styling.
- The face is a generic pointed-chin, fox-eye or cosmetic-surgery beauty template.
- She reads as a cold villain, seductive executive, domineering boss or emotionally blank mannequin.
- The face, jaw, nose, eye spacing, hairline or ear structure changes across angles.
- Large hoop earrings, warm brown waves or abundant loose face strands appear.
- The sheet contains generated labels, slogans, city scenery or luxury props.

Passing this prompt produces only a Sheet 01 candidate. It does not create an accepted source ID or authorize later sheets.
