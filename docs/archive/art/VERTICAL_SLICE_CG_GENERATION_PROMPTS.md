# Vertical Slice CG Generation Prompts

> Lifecycle: **ARCHIVED — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical one-off prompts and batch instructions. Do not execute, excerpt into a new Task Packet, or use as renderer input.


> Historical status at time of archive: production-ready prompt pack
>
> 版本：1.0
>
> 更新：2026-09-23
>
> Scope：Opening Vertical Slice only。
>
> Character reference authority：`docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`
>
> Scene art intent：`docs/archive/art/PROTOTYPE_ART_REQUIREMENTS.md`
>
> 若對應 production scene file 已存在：`docs/narrative/scenes/vertical-slice/<SCENE_ID>.md` 的 locked staging / expression / CG timing 優先於本文件早期預設。

---

# 1. Mandatory generation workflow

每次生成角色 CG：

1. 先用 Google Drive connector **實際 fetch** 本 prompt 指定的 reference images。
2. 確認模型看得到 image content，不只知道檔名。
3. Primary face sheet 是 identity 最高 authority。
4. Production sheet 用來維持 hair / hands / props / lighting robustness。
5. Wardrobe sheet 只控制 outfit，不得改臉。
6. Expression/body sheet 只在 prompt 明確要求時加。
7. 生成一張 CG 後做 identity / hands / wardrobe / composition / 9:16 crop QA。
8. 不合格就從 canonical refs 重新生成；不要只拿失敗 CG 自我迭代造成 generational drift。

---

# 2. Canonical reference URLs

## Xu Tang

`XT_FACE`  
`https://drive.google.com/file/d/1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS/view`

`XT_EXPRESSION`  
`https://drive.google.com/file/d/19kDLngndmnc4eT4EzdxTpjCUwiMo7M3T/view`

`XT_BODY`  
`https://drive.google.com/file/d/1iqAzlOSU7shHNrrntNhqWytWyqSWjVPl/view`

`XT_PRODUCTION`  
`https://drive.google.com/file/d/1dTvm8uC5m2jaq8OUDDzaloOUrzeWBHIx/view`

`XT_WARDROBE_A`  
`https://drive.google.com/file/d/1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF/view`

`XT_WARDROBE_B`  
`https://drive.google.com/file/d/1Ls-1LSF_9rUs7ZkQydvB2K7w9P-Aimp4/view`

## Jiang Yucheng

`JYC_FACE`  
`https://drive.google.com/file/d/13AI1sD0iUm6NpMBnVtlK8Zl5PN0UPsMQ/view`

`JYC_EXPRESSION`  
`https://drive.google.com/file/d/1uiyGTWLqnjsdtTOHalEwfyooy-_-1Xkz/view`

`JYC_BODY`  
`https://drive.google.com/file/d/1OfAOJTafTrfMzljAGa3KsOGLOPXggw8j/view`

`JYC_PRODUCTION`  
`https://drive.google.com/file/d/10EH0fmMV0UzFED2-tnf62TYOJexJQK4_/view`

`JYC_WARDROBE_A`  
`https://drive.google.com/file/d/1FqxmDU0BqzAb6AFmZfebcx6NUaKCUw-A/view`

`JYC_WARDROBE_B`  
`https://drive.google.com/file/d/19lOGj4CYsC2HD7lx0AoBmZynipPYMKPZ/view`

---

# 3. Global CG style contract

所有 Vertical Slice CG 共通：

- mobile-first **9:16 vertical**
- recommended master 1440×2560 or equivalent high-resolution 9:16
- realistic high-end urban romance visual-novel event CG
- photographic realism / polished game cinematic realism
- natural skin texture; no plastic doll skin
- shallow-to-moderate depth of field depending scene
- no embedded captions / UI / labels / watermarks
- no character-sheet layout; this is a finished narrative event image
- faces primarily in upper 20–60% of frame where practical
- reserve lower ~25% from critical face/hand information for dialogue overlay unless scene file specifies another safe zone
- use environment to tell story; do not produce studio portrait posing
- character should usually look at the scene/action/other person, not camera
- no identity drift
- no age drift
- no random hair-length changes
- no hand deformities
- no extra fingers
- no random wardrobe changes
- Player/MC has no locked face bible yet: use first-person POV, hands, shoulder, partial back/silhouette only; do not invent a canonical male face

---

# 4. DEPRECATED historical batch-generation prompt — DO NOT RUN FOR NEW PRODUCTION

可直接把以下整段貼到一個新 AI session：

~~~text
我們要為 GitHub repo TsungmingLiu/seventeen-floor-neighbor 製作 Opening Vertical Slice event CG。

開始前：
1. 讀 docs/art/CHARACTER_REFERENCE_PACK_SPEC.md
2. 讀 docs/archive/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md
3. 讀 docs/archive/art/PROTOTYPE_ART_REQUIREMENTS.md
4. 若 docs/narrative/scenes/vertical-slice/ 中已有對應 scene file，先讀 scene file，使用最新 locked staging / outfit / expression / CG timing。
5. 透過 Google Drive connector 實際 fetch 每張 prompt 指定的 canonical reference images。不能只看檔名或URL。

生成規則：
- 一次只生成一個 CG，不做九宮格、不做 collage。
- 每一張重新從 canonical refs 開始。
- 不用上一張 CG 作唯一 identity reference。
- 9:16 vertical, high-resolution master。
- 男主沒有 canonical face，使用 POV / hand / shoulder / partial silhouette。
- 生完每張先做 identity / hands / outfit / composition / safe-zone QA；若 FAIL，重生成後才進下一張。
- 不自行修改 canonical character design。
- 若 scene file 與這份 prompt pack 有差異，以已 Human-approved 的 scene file 為準。

Queue：
1. CG-COM-01
2. CG-XT-01
3. CG-JYC-01
4. CG-JYC-03
5. CG-SH-01
6. CG-COM-02
7. CG-COM-03
8. CG-COM-04
9. CG-JYC-02

每張使用 VERTICAL_SLICE_CG_GENERATION_PROMPTS.md 中對應的 Individual Prompt。
完成一張後告訴我：reference files used、QA結果、是否建議 accept/retry，然後再處理下一張。
~~~

---

# 5. Individual prompts

## CG-COM-01 — 雨夜搬家 — P0

**References to fetch**

- `XT_FACE`
- `XT_PRODUCTION`
- `XT_WARDROBE_A`

~~~text
Generate event CG: CG-COM-01 / 雨夜搬家.

Use the fetched Xu Tang canonical references:
- xt-ref-01-face.png = absolute face identity authority
- xt-ref-04-production.png = hair, hoop earrings, hands, body-language consistency
- xt-ref-05-wardrobe-a.png = use Look 01 Weekday Neighbor outfit direction

Xu Tang is 27, ~170cm, mature urban East Asian woman. Preserve her exact face identity, long dark-brown softly wavy hair and signature large gold hoop earrings.

Scene:
Contemporary Taipei high-rise apartment, 17th-floor corridor, rainy night. The protagonist has just moved in. Several realistic moving boxes sit in the foreground/side of corridor without blocking the entire frame. Xu Tang has just returned home and naturally holds a heavy corridor/fire door with one hand while helping nudge one stuck box aside with the other. She is only being a normal neighbor, not posing or flirting.

Composition:
9:16 vertical cinematic event CG.
First-person protagonist viewpoint slightly inside/near the corridor entrance.
Xu Tang at roughly upper-right or center-right of frame, visible from about knees/waist upward depending composition.
One protagonist hand/box edge may appear in foreground, but no male face.
Maintain believable corridor depth toward elevator.
Reserve lower-left/lower-center area for dialogue UI.

Expression:
neutral-observant with the faintest polite softness; no seductive gaze, no dramatic smile.

Lighting:
warm residential corridor practical light contrasted with cool rainy blue city/window ambience. Subtle wet-shoe reflections near elevator/window area, but indoor corridor itself is dry.

Narrative feeling:
quiet first encounter, ordinary kindness, slight curiosity. Not “destined lovers”.

Avoid:
fashion pose, looking directly into camera like a model, excessive glamour lighting, soaked indoor clothing, exaggerated body proportions, changing earrings, changing face, extra hands/fingers, luxury penthouse aesthetic.
~~~

---

## CG-XT-01 — 書店午後 — P0

**References to fetch**

- `XT_FACE`
- `XT_PRODUCTION`
- `XT_WARDROBE_A`

~~~text
Generate event CG: CG-XT-01 / 書店午後.

Use Xu Tang canonical refs:
- face identity = xt-ref-01-face
- production consistency = xt-ref-04-production
- outfit = xt-ref-05-wardrobe-a, specifically Look 03 Bookstore / Café Date

Preserve Xu Tang's exact 27-year-old face, 170cm mature slender proportions, long dark-brown softly wavy hair, large gold hoop earrings. Preserve the elegant black-top/plaid-skirt/black-sheer-tights bookstore-date design language unless the locked XT-04 scene file specifies a refined variant.

Scene:
Warm independent Zhongshan-style Taipei bookstore, afternoon. Wooden shelves, art/design/photography books, soft side-window light. Xu Tang is absorbed in a large-format design or photography book. She is not performing for the protagonist; the attraction comes from catching her genuinely interested in something.

Composition:
9:16 vertical.
3/4 or side view of Xu Tang standing by shelves/table, book open in both hands.
Frame should show her full visual rhythm enough to read the refined outfit and black sheer tights without turning the CG into leg fetish posing.
Camera approximately protagonist eye level, natural observational distance.
Face in upper half, book/hands clearly readable, lower UI-safe area free of essential detail.

Expression:
focused, quietly interested; possibly a tiny unconscious smile at the page. Eyes mostly on book, not camera.

Lighting:
warm natural afternoon + soft bookstore practicals.

Narrative feeling:
“I like seeing what she looks like when she forgets to manage the interaction.”

Avoid:
front-facing fashion pose, exaggerated leg emphasis, seductive camera angle, fake bookstore text, random logos, identity drift, broken book/hand anatomy.
~~~

---

## CG-JYC-01 — ACG 主場 — P0

**References to fetch**

- `JYC_FACE`
- `JYC_PRODUCTION`
- `JYC_WARDROBE_A`

~~~text
Generate event CG: CG-JYC-01 / ACG 主場.

Use Jiang Yucheng canonical refs:
- jyc-ref-01-face = absolute identity
- jyc-ref-04-production = short-hair construction, props, body language
- jyc-ref-05-wardrobe-a = Look 03 ACG Outing direction

Jiang Yucheng is 23, ~160cm, slender/light small frame with relatively long legs, adult graduate student and ACG creator. Preserve exact face and short tea-brown bob.

Scene:
Taipei underground ACG shopping area. She is in her element, walking half a step ahead of the protagonist while animatedly explaining a setting/art/design detail. Generic/anime-style merchandise and shop lights around her. She carries a small bag/merch item naturally.

Composition:
9:16 vertical dynamic candid frame.
JYC around center/upper-center, turning back toward protagonist while still moving forward.
One hand may gesture with a book/merch item; the other controls bag/strap.
Protagonist only implied by viewpoint or partial hand.
Enough body visible to read her ACG outfit and long-leg silhouette, but no low-angle voyeur shot.
Background has colorful ACG density with shallow depth of field.

Expression:
bright-eyed, talking faster than usual, confident/nerdy excitement. This should visibly contrast with her shy early scenes.

Lighting:
bright indoor underground-mall/store lighting, slightly colorful reflections, realistic skin.

Narrative feeling:
“This is what she looks like when the environment belongs to her.”

Avoid:
helpless/shy pose, childlike proportions, cosplay takeover, giant anime eyes, camera-model pose, identity drift, malformed merchandise/hands.
~~~

---

## CG-JYC-03 — Gaming Night — P0

**References to fetch**

- `JYC_FACE`
- `JYC_PRODUCTION`
- `JYC_WARDROBE_A`

~~~text
Generate event CG: CG-JYC-03 / Gaming Night.

Use:
- jyc-ref-01-face for exact identity
- jyc-ref-04-production for controller/relaxed body language
- jyc-ref-05-wardrobe-a Look 04 Gaming / Home Casual for outfit

Scene:
Protagonist's clean but lived-in Taipei apartment at night. Gaming monitor/TV casts soft cool screen light, supplemented by warm room lamp. Jiang Yucheng has moved past stiff guest mode and is genuinely relaxed: sitting naturally on sofa/floor seating, controller in hand, a cushion close by, a few ordinary snacks/drinks nearby.

Composition:
9:16 vertical.
Prefer 3/4 candid angle from protagonist side/POV.
Her face and controller both readable.
Player hand/controller can appear at lower edge; no male face.
Body language relaxed, slightly curled/comfortable but anatomically natural.
Do not over-stage her body toward camera.

Expression:
competitive amusement / “I know I’m beating you” small smile, or mid-laugh depending locked scene beat.

Lighting:
screen-blue + warm practical lamp; realistic mixed lighting, preserve face identity.

Narrative feeling:
domestic intimacy appears because they can occupy the same space without performing.

Avoid:
sexualizing first home visit, bedroom framing, lingerie, childlike pajamas, deliberate pin-up pose, broken controller fingers, identity drift.
~~~

---

## CG-SH-01 — 17樓三人第一次同框 — P1

**References to fetch**

Minimum:
- `XT_FACE`
- `XT_WARDROBE_A`
- `JYC_FACE`
- `JYC_WARDROBE_A`

Preferred if reference limit allows:
- plus `XT_PRODUCTION`
- plus `JYC_PRODUCTION`

~~~text
Generate shared event CG: CG-SH-01 / 17樓第一次同框.

Two established adult female identities must remain distinct:
Xu Tang:
- exact identity from xt-ref-01-face
- 27, 170cm, mature, long dark-brown hair, large gold hoop earrings
- use appropriate Weekday Neighbor look from XT wardrobe unless locked scene says otherwise

Jiang Yucheng:
- exact identity from jyc-ref-01-face
- 23, 160cm, slender small-frame, short tea-brown bob
- use Gaming/Home Casual or current visit outfit from JYC wardrobe according to locked JYC-06/SH-01 continuity

Scene:
17th-floor residential corridor at night. Jiang Yucheng is arriving at or leaving the protagonist's apartment after Gaming Night. Elevator opens / corridor timing naturally brings Xu Tang home. The protagonist introduces them briefly.

Composition:
9:16 vertical.
Xu and JYC both clearly visible and unmistakably different in height, silhouette, hair, age vibe and wardrobe.
Use corridor spatial separation to create subtext:
- JYC closer to protagonist's door side
- Xu closer to elevator/her own apartment side
- protagonist represented only by partial shoulder/hand/POV between them if useful
Do not pose them like a group photo.
Do not make either woman glare at the other.

Expressions:
Xu: polite-neutral, observant, maybe a tiny “noted” pause.
JYC: polite, slightly cautious/curious.
Neither is hostile.

Lighting:
warm corridor practical light + subtle cool city/elevator spill.

Narrative feeling:
three seconds of adult social awkwardness; “these two parts of the protagonist’s life now know the other exists.”
Not a shura scene. Not jealousy comedy.

Avoid:
catfight body language, crossed arms, angry stares, exaggerated height error, merging faces, swapping hairstyles, duplicate body shapes, protagonist face invention.
~~~

---

## CG-COM-02 — 地下街初遇 — P1

**References to fetch**

- `JYC_FACE`
- `JYC_PRODUCTION`
- `JYC_WARDROBE_A`

~~~text
Generate event CG: CG-COM-02 / 地下街初遇.

Use Jiang Yucheng canonical refs. Use a restrained Campus/Graduate Student look or lightly ACG-coded early look from jyc-ref-05-wardrobe-a according to locked COM-01J scene; do not use the most elaborate ACG-outing look unless scene file specifically selects it.

Scene:
Taipei underground ACG shop. Jiang Yucheng stands at a shelf comparing two setting/art books. The protagonist makes one specific comment about the work. She lifts her eyes/turns her head toward him for the first time.

Composition:
9:16.
Books/shelf form foreground and background layers.
JYC 3/4 view, holding two books naturally.
Capture the instant between “still evaluating the books” and “realizing this stranger actually knows the subject.”
No exchange of names yet.
No protagonist face; POV or partial book/hand only.

Expression:
small guarded curiosity, not instant crush, not shocked admiration.

Lighting:
clean artificial underground-shop light, realistic, colorful merchandise softly defocused.

Avoid:
collision/rescue trope, dropped books, dramatic sparkles, childlike face, fashion pose, unreadable hand anatomy.
~~~

---

## CG-COM-03 — 深夜便利店 — P1

**References to fetch**

- `XT_FACE`
- `XT_PRODUCTION`
- `XT_WARDROBE_A`

~~~text
Generate event CG: CG-COM-03 / 深夜便利店.

Use Xu Tang canonical identity. Outfit must use xt-ref-05-wardrobe-a Look 02 Late-night Convenience Store: signature gray home sweater/top with relaxed gray home shorts or locked-scene equivalent. Preserve gold hoop earrings if consistent with the final scene styling.

Scene:
Late-night neighborhood convenience store near the apartment. Cool-white fluorescent interior, glass refrigerator shelves, simple coffee and late dinner items. Outside window is wet Taipei night.

Xu Tang has coffee/simple dinner in hand/basket. She looks mildly tired and uncurated, but still unmistakably herself.

Composition:
9:16 candid waist-to-knee or fuller frame.
No glamour pose.
Store aisles/environment visible enough to sell real everyday life.
Face in upper half; food/coffee can sit mid-frame.
Dialogue-safe lower area.

Expression:
tired, slightly caught off guard, then faint familiar softness when addressing the protagonist by name.

Narrative feeling:
the attractive neighbor also eats late and works deadlines.

Avoid:
lingerie/homewear sexualization, bright beauty-commercial lighting, model stance, giant smile, identity drift, brand-logo focus.
~~~

---

## CG-COM-04 — 咖啡店畫圖 — P1

**References to fetch**

- `JYC_FACE`
- `JYC_PRODUCTION`
- `JYC_WARDROBE_A`

Optional if expression close-up is selected:
- `JYC_EXPRESSION`

~~~text
Generate event CG: CG-COM-04 / 咖啡店畫圖.

Use Jiang Yucheng exact canonical identity.
Wardrobe: jyc-ref-05-wardrobe-a Look 02 Café / Creator direction, including the refined soft creator styling / black stocking look if visible in the chosen crop.

Scene:
Station-area café, daytime/early afternoon. Jiang Yucheng is absorbed in drawing on a tablet near a window. The protagonist has just approached the table; she looks up only after being caught in full creator focus.

Composition:
9:16 vertical.
Tablet/stylus and her hand must be anatomically correct and visually readable.
Use seated 3/4 composition; face in upper half, tablet lower-mid frame.
If legs appear, black stockings must match wardrobe reference naturally, not become the image’s sole focus.
Protagonist may be represented by edge of laptop/bag/hand; no male face.

Expression:
transition from focused creator mode to slightly surprised recognition, then restrained interest.

Lighting:
soft window daylight + warm café ambience.

Narrative feeling:
the quiet girl has an active internal world and visible craft.

Avoid:
fake seductive drawing pose, looking at camera before protagonist arrives, broken stylus grip, childlike face, tablet screen gibberish dominating frame.
~~~

---

## CG-JYC-02 — 小周邊 reward — P1

**References to fetch**

- `JYC_FACE`
- `JYC_PRODUCTION`
- `JYC_WARDROBE_A`

~~~text
Generate event CG: CG-JYC-02 / 小周邊 reward.

Use the same canonical identity and ACG outing wardrobe continuity as CG-JYC-01.

Scene:
During the ACG outing, Jiang Yucheng and the protagonist have just opened/received a small piece of merchandise or random-draw item. The item itself is fictional/anime-style and secondary; the emotional reward is her unscripted reaction.

Choose one natural beat according to locked JYC-05 script:
- she got something she genuinely likes and briefly drops her reserved demeanor, OR
- protagonist got the one she wanted and she gives him a mock-annoyed / competitive look.

Composition:
9:16 close-medium event CG.
Merch item visible in hand but not covering face.
JYC expression and hands are main storytelling elements.
Protagonist hand can hold the other item/package in foreground.
No male face.

Expression:
genuine amusement / pleased surprise / playful competitive annoyance. Adult but cute.

Lighting:
same ACG mall/shop continuity as CG-JYC-01.

Narrative feeling:
a low-stakes moment the player remembers because she forgot to be self-conscious.

Avoid:
chibi transformation, childish tantrum, oversized toy dominating composition, broken fingers, unrelated outfit, identity drift.
~~~

---

# 6. QA checklist after every CG

- [ ] face matches ref-01 at a glance
- [ ] age reads correctly
- [ ] body/height impression is plausible
- [ ] hair construction matches ref-04
- [ ] signature accessory continuity correct
- [ ] outfit matches selected wardrobe look
- [ ] hand/prop anatomy correct
- [ ] protagonist face not accidentally established
- [ ] scene action is credible
- [ ] image is a narrative moment, not a studio pose
- [ ] 9:16 crop works
- [ ] dialogue safe zone usable
- [ ] no critical text/logo gibberish
- [ ] collectible CG adds something sprite+BG could not

Only after PASS should an image be accepted as canonical master / moved into the asset integration pipeline.

---

# 7. Production results

> Generated 2026-09-24 under the canonical 16:9 visual contract. Runtime derivatives use a portrait-safe 1080×1920 container with the complete 16:9 frame preserved over a darkened blurred extension, so locked actions are not lost to a destructive 9:16 crop.

## CG-COM-01 — COM-00

- Refs actually fetched: `xt-ref-01-face.png` (`1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS`), `xt-ref-04-production.png` (`1dTvm8uC5m2jaq8OUDDzaloOUrzeWBHIx`), `xt-ref-05-wardrobe-a.png` (`1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF`, Look 01 Weekday Neighbor).
- Accepted master: `cg-com-01-master-v1.png` — 2560×1440 PNG — Drive [`1gx1xKI9jW-JxKfQIGygx8B9pNNezAiLk`](https://drive.google.com/file/d/1gx1xKI9jW-JxKfQIGygx8B9pNNezAiLk/view) — SHA-256 `8184c5a9108804f23b04a2bbfdb1391ba2a0c1aee14ac01f3ca0bf03100b0f48`.
- Runtime: `cg-com-01-v1.webp` — 1080×1920 WebP — Drive [`1YoCB0FXzK9HhCcjyVTTwjw_tqze7-jhB`](https://drive.google.com/file/d/1YoCB0FXzK9HhCcjyVTTwjw_tqze7-jhB/view) — SHA-256 `19f67503fafc705427c5e6907af910e187abb6dd046507cd128204e4bd076002`.
- QA: **PASS** — identity, age, hair, earrings, Look 01, door/box/hand anatomy, POV, safe-zone, exact pre-name ordinary-neighbor beat, and no text/logo/watermark passed.
- Generation/version note: built-in image generation; second independent candidate accepted after the first candidate was rejected for dialogue-zone obstruction; canonical refs were freshly fetched again before retry.

## CG-COM-02 — COM-01J

- Refs actually fetched: `jyc-ref-01-face.png` (`13AI1sD0iUm6NpMBnVtlK8Zl5PN0UPsMQ`), `jyc-ref-04-production.png` (`10EH0fmMV0UzFED2-tnf62TYOJexJQK4_`), `jyc-ref-05-wardrobe-a.png` (`1FqxmDU0BqzAb6AFmZfebcx6NUaKCUw-A`, Look 01 Campus / Graduate Student).
- Accepted master: `cg-com-02-master-v1.png` — 2560×1440 PNG — Drive [`1tnVtYgpfHynmZlvDK0UhBtLpjeddYbWi`](https://drive.google.com/file/d/1tnVtYgpfHynmZlvDK0UhBtLpjeddYbWi/view) — SHA-256 `ff259f77dbe003a041cc6bf8c49dfbcd23af0585817392d1656f31b2dec119ca`.
- Runtime: `cg-com-02-v1.webp` — 1080×1920 WebP — Drive [`16T8iJKngA8zPPU5aAmDQXZToz_b2mPxu`](https://drive.google.com/file/d/16T8iJKngA8zPPU5aAmDQXZToz_b2mPxu/view) — SHA-256 `d226ea8c17d2bf5ae4b04d2f2da992dd51c0fa528a71c8059d0909deb3f05627`.
- QA: **PASS** — identity, adult age read, bob construction, Look 01, two-book/hand geometry, guarded-curiosity beat, protagonist POV, safe-zone, fictional art, and no extra people/text/logo/watermark passed.
- Generation/version note: built-in image generation; second independent candidate accepted after the first candidate was rejected for an unapproved background person; canonical refs were freshly fetched again before retry.

## CG-COM-03 — COM-02X

- Refs actually fetched: `xt-ref-01-face.png` (`1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS`), `xt-ref-04-production.png` (`1dTvm8uC5m2jaq8OUDDzaloOUrzeWBHIx`), `xt-ref-05-wardrobe-a.png` (`1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF`, Look 02 Late-night Convenience Store).
- Accepted master: `cg-com-03-master-v1.png` — 2560×1440 PNG — Drive [`1xXOD5Ktaw9pTZJIxcCrj9eaPa1M3bXGj`](https://drive.google.com/file/d/1xXOD5Ktaw9pTZJIxcCrj9eaPa1M3bXGj/view) — SHA-256 `a1c7cf49c50244ed702ca2ac629e9266c70bf855aeeb1a67f05d044e5c858f5f`.
- Runtime: `cg-com-03-v1.webp` — 1080×1920 WebP — Drive [`1LGV0AhMqm6PVYQI0zgJl8LAEAJ03WPYC`](https://drive.google.com/file/d/1LGV0AhMqm6PVYQI0zgJl8LAEAJ03WPYC/view) — SHA-256 `6511682cddca5aff6df3b1e73905d09573d5312876dbca9dc8663ce16b89295d`.
- QA: **PASS** — identity, age, hair, earrings, Look 02, coffee/meal/hand anatomy, wet-night convenience-store context, exact name-recognition beat, safe-zone, and no extra people/text/logo/watermark passed.
- Generation/version note: built-in image generation; first candidate accepted.

## CG-COM-04 — COM-02J

- Refs actually fetched: `jyc-ref-01-face.png` (`13AI1sD0iUm6NpMBnVtlK8Zl5PN0UPsMQ`), `jyc-ref-04-production.png` (`10EH0fmMV0UzFED2-tnf62TYOJexJQK4_`), `jyc-ref-05-wardrobe-a.png` (`1FqxmDU0BqzAb6AFmZfebcx6NUaKCUw-A`, Look 02 Café / Creator).
- Accepted master: `cg-com-04-master-v1.png` — 2560×1440 PNG — Drive [`1TNxS7cBf1jgC9DsxHDXcJ-Ndl7w1Clir`](https://drive.google.com/file/d/1TNxS7cBf1jgC9DsxHDXcJ-Ndl7w1Clir/view) — SHA-256 `8defcc44839e340dcbc81e5bb0b41e21668b38a53139413e50708879213c4c4b`.
- Runtime: `cg-com-04-v1.webp` — 1080×1920 WebP — Drive [`1qL2SiV0QrBbN55HAK7K0sBHpIpZ0SpvT`](https://drive.google.com/file/d/1qL2SiV0QrBbN55HAK7K0sBHpIpZ0SpvT/view) — SHA-256 `01f3d19cc25c677a03787f2adf518daa2540099336c33ffdf3dcb049dbf02381`.
- QA: **PASS** — identity, adult age read, bob construction, Look 02, stylus grip/tablet/support-hand geometry, creator-focus-to-recognition beat, safe-zone, non-fetish framing, and no extra people/real IP/text/logo/watermark passed.
- Generation/version note: built-in image generation; first candidate accepted.
