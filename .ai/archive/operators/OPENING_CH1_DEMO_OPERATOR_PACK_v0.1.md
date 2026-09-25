# Opening Chapter 1 Demo — Human Operator Production Pack v0.1

> Lifecycle: **ARCHIVED — NOT A PRODUCTION SOURCE OF TRUTH**
> Historical status: completed demo operator pack
> Updated: 2026-09-24  
> Workflow: seventeen-floor-production v0.4  
> Scope: `COM-00 → COM-01X → COM-01J`  
> Goal: produce a 12–18 minute playable opening demo before full visual/text polish.

## 0. Why this pack exists

Capability testing established:

- GitHub/Drive source acquisition works.
- ChatGPT image generation is accurate when the Human manually attaches the intended reference images in a fresh chat.
- Connector-fetched images cannot currently be proven hard-bound into image generation; autonomous connector → generation is therefore not a supported production path.
- Base character CGs use the Human Reference Attachment Gate.
- Reaction CGs use edit-from-accepted-base whenever possible.
- Background generation is one task / one image / one generation call. Batch planning is allowed; batch image generation is not.

This operator pack is the Human-facing execution surface. Each prompt below is intended to be copied into a fresh ChatGPT session exactly as written.

## 1. Demo scope

Chapter 1 contains three already locked production scenes:

- `COM-00 — 雨夜搬家` — 4–6 min
- `COM-01X — 電梯重啟` — 3–5 min
- `COM-01J — 地下街初遇` — 5–7 min

The narrative scripts/state contracts are already S4/S5/S6. **Do not rewrite them before the first playable demo.** Runtime integration may line-compress only where technically necessary without changing beat/choice/state meaning.

Demo completion means:
- all three scenes are playable in order;
- both heroines have a distinct first impression;
- three choice points work;
- W4 Start/Continue + Memories work;
- new CG-first visual assets render without legacy sprite dependency;
- build/validate/tests pass;
- Human can play the chapter end-to-end.

## 2. Existing provisional demo assets — do not regenerate now

The Human already generated these assets successfully using manual references:

### `BG-APT-17F-RAIN-16X9`
Suggested filename:
`bg-apt-17f-rain-16x9-v1.png`

Use:
- COM-00 opening/coda environment;
- environment reference for COM-00 character CGs.

Status:
- provisional accepted for demo;
- 16:9 landscape;
- empty rainy-night 17F corridor.

### `COM00-S04-BASE-NEUTRAL`
Suggested filename:
`cg-com00-s04-base-neutral-v1.png`

Use:
- COM-00 name / neighbor exchange;
- neutral-observant dialogue base.

Status:
- provisional accepted for demo;
- source generation was 3:2; runtime ingest may perform a deterministic 16:9 crop for demo use while preserving the original master.

### `COM00-S04-R01-POLITE-SMILE`
Suggested filename:
`cg-com00-s04-r01-polite-smile-v1.png`

Use:
- COM-00 polite-smile reaction.

Status:
- Reaction edit PASS;
- keep the exact same runtime crop as the neutral base.

Do not regenerate these before the first demo unless ingest/QA discovers a blocking defect.

---

# 3. Human image-generation rules

For every image task:

- use a fresh ChatGPT conversation unless the task is an edit of the image just attached;
- attach **only** the images explicitly listed under REQUIRED ATTACHMENTS;
- no unrelated screenshots, prior failures, other heroine refs, or old CGs;
- generate exactly one independent image;
- never request a batch/contact sheet/grid;
- no automatic retry;
- save the result using the suggested filename;
- if the output is clearly wrong, mark it failed and move on; polishing happens after the playable demo.

For base character CGs, the Human attachment is the production reference transport. The worker must not fetch Drive images as a substitute.

---

# 4. IMAGE TASK 01 — 16:9 elevator background

Asset ID:
`BG-APT-ELEVATOR-16X9`

Suggested filename:
`bg-apt-elevator-16x9-v1.png`

REQUIRED ATTACHMENTS:
- none

COPY/PASTE PROMPT:

~~~text
你現在是 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` 的 Background Production Worker。

這次只生成一張背景圖，不是 batch，不是 contact sheet，不是九宮格。

使用 branch `main`，只讀：
- `.ai/WORKFLOW_MANIFEST.yaml`
- `.ai/harnesses/bootstrap.md`
- `docs/art/PRODUCTION_VISUAL_DIRECTION.md`
- `docs/art/recipes/backgrounds/opening_batch_a_backgrounds.md`
- `docs/narrative/scenes/vertical-slice/COM-01X.md`

TASK:
重新製作 `BG-APT-ELEVATOR` 的新 production master。

OUTPUT:
- exactly 1 image
- 16:9 landscape
- one continuous elevator interior
- empty scene, absolutely no people
- no grid / split screen / multiple versions / inset panels

SCENE:
Contemporary Taipei upper-middle residential elevator interior. Deep-gray brushed metal, warm-gray stone accents, subtle bronze trim, warm-white practical ceiling light, closed elevator doors, simple handrails, restrained control panel, believable seams/materials, safe ordinary residential scale.

COMPOSITION:
- eye-level moderately wide camera
- readable shared elevator interior
- enough horizontal breathing room for later dialogue CG staging
- lower area usable behind VN dialogue UI
- no fisheye
- no mirror wall
- no visible camera/person reflection

STYLE:
realistic high-end game-cinematic / photographic architectural rendering; believable PBR metal/stone/glass/light; not anime, cartoon, painterly concept art, luxury-hotel spectacle, horror, or liminal-space imagery.

Do not create the restart/dim variant yet.
Do not generate multiple candidates.
After exactly one image, stop.
~~~

---

# 5. IMAGE TASK 02 — COM-00 door-assist event CG

Asset ID:
`COM00-S02-DOOR-ASSIST`

Suggested filename:
`cg-com00-s02-door-assist-v1.png`

REQUIRED ATTACHMENTS:
1. `xt-ref-01-face.png`
2. `xt-ref-05-wardrobe-a.png`
3. `bg-apt-17f-rain-16x9-v1.png`

COPY/PASTE PROMPT:

~~~text
你現在要生成 exactly 1 張 `COM00-S02-DOOR-ASSIST` event CG。

只允許使用本對話手動附上的 3 張圖片：
1. `xt-ref-01-face.png` = 許棠 face identity / realism authority
2. `xt-ref-05-wardrobe-a.png` = Weekday Neighbor Look 01 authority
3. `bg-apt-17f-rain-16x9-v1.png` = 17F rainy corridor environment authority

如果不是 exactly 3 張、任何一張內容不符、或存在其他圖片，BLOCKED，不要生圖。

使用 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` main，只讀：
- `.ai/WORKFLOW_MANIFEST.yaml`
- `.ai/harnesses/cg-artist.md`
- `docs/art/PRODUCTION_VISUAL_DIRECTION.md`
- `docs/narrative/scenes/vertical-slice/COM-00.md`
- `.ai/experiments/pilots/results/COM-00-shot-plan-v0.1.md`

只使用 COM00-S02 的 locked intent。

生成 exactly 1 張 16:9 landscape narrative event CG：

- 許棠是唯一完整可見的人物。
- 27 歲成年東亞女性，身份與寫實程度嚴格沿用 face attachment。
- 長深棕髮放下，大號金色 hoop earrings。
- Weekday Neighbor Look 01 嚴格沿用 wardrobe attachment。
- 同一 attached 17F 雨夜走廊。
- foreground 有搬家紙箱與防火門問題。
- 許棠一手扶住/撐住回彈的門，另一側只在卡住的箱角提供剛好足夠的協助。
- 她的注意力主要在箱子/門，不是對鏡頭擺 pose。
- neutral_observant、克制、功能性協助，不是 romantic astonishment。
- 男主最多只允許必要的局部手/前臂協助動作；不得出現臉、頭、肩、背或完整身體。
- 不要碰手、跌倒、接住、壁咚或任何曖昧肢體 framing。

STYLE:
realistic high-end game-cinematic / photographic PBR human rendering；自然皮膚、正常成年人眼睛比例、真實髮絲與衣料。禁止 anime / manga / cartoon / 3D animation-film / doll face / plastic skin。

這不是 fashion portrait。
這是正在發生動作的 narrative CG。

只生成 1 張，不得重試，完成後停止。
~~~

---

# 6. IMAGE TASK 03 — COM-01X elevator dialogue base

Asset ID:
`COM01X-BASE-NORMAL`

Suggested filename:
`cg-com01x-base-normal-v1.png`

REQUIRED ATTACHMENTS:
1. `xt-ref-01-face.png`
2. `xt-ref-05-wardrobe-a.png`
3. `bg-apt-elevator-16x9-v1.png`

COPY/PASTE PROMPT:

~~~text
生成 exactly 1 張 `COM01X-BASE-NORMAL` dialogue CG。

只允許使用本對話手動附上的 3 張圖片：
1. Xu Tang face identity
2. Xu Tang Weekday Neighbor Look 01 wardrobe
3. new 16:9 BG-APT-ELEVATOR environment

任何附件缺失/內容不符/存在額外圖片 → BLOCKED。

使用 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` main，只讀：
- `.ai/WORKFLOW_MANIFEST.yaml`
- `.ai/harnesses/cg-artist.md`
- `docs/art/PRODUCTION_VISUAL_DIRECTION.md`
- `docs/narrative/scenes/vertical-slice/COM-01X.md`

SCENE:
COM-01X normal elevator ride before the brief restart.

OUTPUT:
- exactly 1 image
- 16:9 landscape
- realistic narrative dialogue CG
- Xu Tang is the only visible person
- protagonist completely absent, including reflection

COMPOSITION:
- eye-level moderately wide shared-elevator composition
- Xu Tang stands naturally on the right/right-center side
- preserve ordinary neighbor distance and empty space on the opposite side
- do not frame as fashion portrait or romantic close-up
- keep environment clearly readable

CHARACTER:
- exact Xu Tang identity from face reference
- long dark-brown hair down
- gold hoop earrings
- exact Weekday Neighbor Look 01
- calm neutral_observant, slight recognition warmth
- natural everyday posture, not posing

LIGHT:
normal warm-white residential elevator lighting.

STYLE:
realistic photographic/PBR game-cinematic adult human rendering.
No anime/cartoon/animation-film/doll/plastic-skin look.

Generate one image only. No retry.
~~~

---

# 7. IMAGE TASK 04 — COM-01X restart reaction edit

Asset ID:
`COM01X-R01-RESTART`

Suggested filename:
`cg-com01x-r01-restart-v1.png`

REQUIRED ATTACHMENTS:
1. `cg-com01x-base-normal-v1.png` only

COPY/PASTE PROMPT:

~~~text
這是一個單張 Reaction CG edit，不是重新生成。

唯一 edit target：
`cg-com01x-base-normal-v1.png`

生成 exactly 1 張：
`COM01X-R01-RESTART`

只允許改兩類東西：

1. LIGHTING
- elevator main practical light 明顯但克制地 dim 下來
- 保留安全/面板微弱供電感
- 不是全黑
- 不是紅色 emergency wash
- 不是 horror

2. XU TANG REACTION
- neutral_observant → very mild surprise / attentive pause
- 眼神短暫移向樓層/控制面板方向
- 不害怕、不靠近鏡頭、不尋求安慰

除此之外全部鎖死：
identity、face anatomy、hair、wardrobe、body、pose、camera、crop、elevator geometry、panel position、materials。

不要新增男主或反射人物。
不要改成另一個電梯。
不要自行重試。

只輸出 exactly 1 edited image。
~~~

---

# 8. IMAGE TASK 05 — COM-01X dry-humor reaction edit

Asset ID:
`COM01X-R02-DRY-SMILE`

Suggested filename:
`cg-com01x-r02-dry-smile-v1.png`

REQUIRED ATTACHMENTS:
1. `cg-com01x-base-normal-v1.png` only

COPY/PASTE PROMPT:

~~~text
這是一個 Reaction CG edit。

唯一 edit target：
`cg-com01x-base-normal-v1.png`

生成 exactly 1 張：
`COM01X-R02-DRY-SMILE`

只改：
- 嘴角形成非常輕微、克制的 dry playful smile
- 眼神稍微更有「乾式吐槽」的神采
- 可以非常輕微看向樓層面板方向

不要變成：
- 大笑
- 可愛笑
- flirtatious smile
- idol smile
- cartoon/anime expression

其他全部不變：
identity、hair、wardrobe、pose、hands、camera、normal elevator lighting、environment、crop、color grading。

exactly 1 image。
不得重試。
~~~

---

# 9. IMAGE TASK 06 — 16:9 ACG shop background

Asset ID:
`BG-ACG-SHOP-16X9`

Suggested filename:
`bg-acg-shop-16x9-v1.png`

REQUIRED ATTACHMENTS:
- none

COPY/PASTE PROMPT:

~~~text
你現在是 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` 的 Background Production Worker。

這次只生成一張背景：
`BG-ACG-SHOP`

不要 batch、不要九宮格、不要 contact sheet、不要多方案。

使用 main，只讀：
- `.ai/WORKFLOW_MANIFEST.yaml`
- `.ai/harnesses/bootstrap.md`
- `docs/art/PRODUCTION_VISUAL_DIRECTION.md`
- `docs/art/recipes/backgrounds/opening_batch_a_backgrounds.md`
- `docs/narrative/scenes/vertical-slice/COM-01J.md`

OUTPUT:
exactly 1 image, 16:9 landscape, one continuous empty retail scene.

SCENE:
A believable compact Taipei underground ACG art-book / merchandise specialty shop. Main emphasis is an art-book/setting-collection shelf where two people could stand on opposite sides and compare books. Include fictional/unreadable art books, generic model boxes, restrained acrylic displays/capsule-toy accents, clean retail ceiling lights, and a glimpse toward underground mall circulation.

COMPOSITION:
- eye-level
- useful central/mid-depth art-book shelf
- enough aisle space for later single-character CG staging
- lower region visually calm enough for VN dialogue UI
- not a symmetrical catalog/product photo
- no people, silhouettes, mannequins, reflections of people

STYLE:
realistic high-end game-cinematic / photographic PBR retail environment.
No anime-background illustration, cartoon, painterly concept art, arcade-neon overload, fisheye, warped shelves.

IP/TEXT:
No recognizable copyrighted characters.
No real brands.
No readable Chinese/Japanese/Latin titles, labels, price cards, logos or watermark.

Generate one image only and stop.
~~~

---

# 10. IMAGE TASK 07 — COM-01J guarded-curiosity base CG

Asset ID:
`COM01J-BASE-GUARDED`

Suggested filename:
`cg-com01j-base-guarded-v1.png`

REQUIRED ATTACHMENTS:
1. `jyc-ref-01-face.png`
2. `jyc-ref-05-wardrobe-a.png`
3. `bg-acg-shop-16x9-v1.png`

Canonical reference provenance:
- JYC face Drive ID: `13AI1sD0iUm6NpMBnVtlK8Zl5PN0UPsMQ`
- JYC Wardrobe A Drive ID: `1FqxmDU0BqzAb6AFmZfebcx6NUaKCUw-A`

COPY/PASTE PROMPT:

~~~text
生成 exactly 1 張 `COM01J-BASE-GUARDED` narrative CG。

只允許使用本對話手動附上的 3 張圖片：
1. `jyc-ref-01-face.png` = Jiang Yucheng / 江雨澄 identity authority
2. `jyc-ref-05-wardrobe-a.png` = JYC Wardrobe A authority
3. `bg-acg-shop-16x9-v1.png` = environment authority

存在其他圖片或任何附件不符 → BLOCKED。

使用 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` main，只讀：
- `.ai/WORKFLOW_MANIFEST.yaml`
- `.ai/harnesses/cg-artist.md`
- `docs/art/PRODUCTION_VISUAL_DIRECTION.md`
- `docs/narrative/scenes/vertical-slice/COM-01J.md`

SCENE:
男主剛針對《逆光航路》版本差異說出一個具體觀察。雨澄還沒有回答，正從書頁抬起眼睛確認這個陌生人是不是「真的看過」。

CHARACTER:
- Jiang Yucheng, 23-year-old adult East Asian woman
- ~160 cm, slim/light/small frame, relatively long legs
- identity strictly follows face attachment
- use Wardrobe A ACG Outing look from attached wardrobe sheet
- clearly adult graduate-student / creator feel; never school-uniform/childlike

ACTION:
- 3/4 stance near art-book shelf
- holding/comparing two fictional art/setting books; one can be slightly open
- head still slightly oriented toward page
- eyes lift first toward the off-camera protagonist
- guarded curiosity, evaluating, not shy crush
- protagonist completely off-camera; at most an insignificant book corner may imply POV if necessary, no body part

COMPOSITION:
- 16:9 landscape
- medium / medium-wide narrative shot
- preserve shelf and shop depth
- physical distance remains at least ordinary stranger distance
- not a glamour portrait
- lower dialogue-safe area

STYLE:
realistic photographic/PBR game-cinematic adult human rendering.
No anime/cartoon/3D-animation-film/doll/oversized-eye/plastic-skin style.

TEXT/IP:
book covers abstract/unreadable fictional graphics only; no real IP or readable fake text as focal content.

Generate exactly 1 image. No retry.
~~~

---

# 11. IMAGE TASK 08 — COM-01J interested/small-smile reaction

Asset ID:
`COM01J-R01-INTERESTED`

Suggested filename:
`cg-com01j-r01-interested-v1.png`

REQUIRED ATTACHMENTS:
1. `cg-com01j-base-guarded-v1.png` only

COPY/PASTE PROMPT:

~~~text
這是一個 Reaction CG edit。

唯一 edit target：
`cg-com01j-base-guarded-v1.png`

生成 exactly 1 張：
`COM01J-R01-INTERESTED`

故事狀態：
雨澄已確認對方真的懂這個作品，開始從短答轉成有內容的討論。

只允許做小幅 reaction edit：
- guarded curiosity → genuinely interested
- eyes slightly more engaged
- very small natural smile
- conversational attention increases
- optional very small head/gaze adjustment consistent with continuing to discuss the book

不要：
- blush
- instant crush
- broad cute smile
- exaggerated anime reaction
- 靠近對方
- 改成正面模特 pose

必須保持：
identity、age read、hair、wardrobe、books、hands as much as possible、body position、camera、shop geometry、lighting、crop、realistic rendering。

exactly 1 image。
不得自行重試。
~~~

---

# 12. DEMO ASSET SET after image production

Required visual set for the first playable demo:

Already available:
- `BG-APT-17F-RAIN-16X9`
- `COM00-S04-BASE-NEUTRAL`
- `COM00-S04-R01-POLITE-SMILE`

Generate:
- `BG-APT-ELEVATOR-16X9`
- `COM00-S02-DOOR-ASSIST`
- `COM01X-BASE-NORMAL`
- `COM01X-R01-RESTART`
- `COM01X-R02-DRY-SMILE`
- `BG-ACG-SHOP-16X9`
- `COM01J-BASE-GUARDED`
- `COM01J-R01-INTERESTED`

This is intentionally **demo-minimal**, not final S9 art completeness. Missing branch-specific reactions and cinematic refinements may reuse the nearest valid base/reaction for the first playtest and be polished after the demo proves pacing.

---

# 13. ASSET INGEST TASK — run once after all images are ready

After the Human has all 11 files above, open a new ChatGPT session and attach all finalized/provisional demo images. This is an ingest task, not generation, so multi-image attachment is allowed.

COPY/PASTE PROMPT:

~~~text
你現在是 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` 的 Demo Asset Ingest Worker。

這次不要生圖、不要改圖的內容、不要寫新劇情。

我已手動附上 Opening Chapter 1 demo 所需的 finalized/provisional image files。

使用 repo `TsungmingLiu/seventeen-floor-neighbor`, branch `main`，先讀：
- `.ai/WORKFLOW_MANIFEST.yaml`
- `.ai/policies/SOURCE_AUTHORITY.md`
- `.ai/schemas/HANDOFF.md`
- `ARCHITECTURE.zh-TW.md`
- `IMPLEMENTATION.md`
- `content/assets/manifest.json`
- `content/assets/source-catalog.json`
- `content/assets/source-map.json`
- `content/recipes/assets.json`

TASK:
1. 逐張檢查附件實際像素與 filename，建立 ingest inventory。
2. 保留 Human-generated original 作 master；不得把 runtime compressed file 反過來當 master。
3. 對需要 runtime normalization 的圖（例如 3:2 COM00-S04 base/reaction），可以做 deterministic 16:9 crop/resize/format conversion，但不得 AI 重繪內容。base/reaction 必須使用完全一致 crop。
4. 上傳 master 到 Google Drive `source-private` 下適合的 Opening Demo staging/canonical folder；如果 folder 不存在，可建立單一清楚命名 folder，不要平行建立重複 authority。
5. 產生/上傳 runtime WebP 到 `runtime-public` 的適合位置。
6. 更新 repo 的 source catalog、source map、asset manifest 與 recipes/provenance，使用新的 stable logical asset IDs。
7. 不刪除 legacy fixture assets。
8. 建立 branch + PR，不要直接覆蓋 main。
9. 執行 repo-required asset checks/build/validate/tests。
10. 回報每張 master Drive ID、runtime Drive ID、sha256、dimensions、logical asset ID、PR URL 和 verification results。

如果某張附件缺失或無法 decode，BLOCKED 該 asset；不要猜測或以舊圖替代。
~~~

---

# 14. TEXT STATUS — no separate writing task before demo

Do **not** spend a production session rewriting Chapter 1 before integration.

Text authorities:
- `docs/narrative/scenes/vertical-slice/COM-00.md`
- `docs/narrative/scenes/vertical-slice/COM-01X.md`
- `docs/narrative/scenes/vertical-slice/COM-01J.md`

All three already contain locked playable scripts, choices, state contracts, voice notes, and Memory intent.

If the in-game playtest later reveals pacing/word-count problems, create one Scene Writer task per affected scene after the demo.

---

# 15. INTEGRATION TASK — build the playable Chapter 1 demo

Run only after the asset-ingest PR is merged.

COPY/PASTE PROMPT:

~~~text
你現在是 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` 的 Content & CG Integrator。

目標：把已鎖定的 Opening Chapter 1 做成一個真正可玩的 demo。

使用 branch `main`，遵守最新 `.ai/WORKFLOW_MANIFEST.yaml` 與 `.ai/harnesses/integrator.md`。

DEMO NARRATIVE SCOPE 只包含：
1. `COM-00 — 雨夜搬家`
2. `COM-01X — 電梯重啟`
3. `COM-01J — 地下街初遇`

必讀：
- `.ai/WORKFLOW_MANIFEST.yaml`
- `.ai/harnesses/bootstrap.md`
- `.ai/harnesses/integrator.md`
- `.ai/policies/SOURCE_AUTHORITY.md`
- `.ai/policies/CONTEXT_ISOLATION.md`
- `PROJECT_STATE.md`
- `ARCHITECTURE.zh-TW.md`
- `IMPLEMENTATION.md`
- `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
- `docs/narrative/scenes/vertical-slice/COM-00.md`
- `docs/narrative/scenes/vertical-slice/COM-01X.md`
- `docs/narrative/scenes/vertical-slice/COM-01J.md`
- current `content/routes/index.json`
- current `content/routes/xu-tang/route.json` and memories fixture only as runtime/schema examples
- current asset manifest/source map/catalog/recipes

Do NOT rewrite creative meaning. Use the locked playable scripts.

IMPLEMENTATION STRATEGY:
- preserve the existing `xu-tang` route/package as a regression fixture;
- create a new production demo route/package, suggested ID `opening-demo`;
- create a new Chapter 1 content file containing only these three scenes in canonical order:
  COM-00 → COM-01X → COM-01J;
- make `opening-demo` the default route for the demo while keeping the old fixture registered;
- map the newly ingested logical background/CG IDs;
- do not reintroduce sprites just because legacy fixture code supports them;
- use CG/background nodes compatible with current engine visual modes;
- where the demo-minimal art set lacks a unique branch reaction, reuse the closest explicitly valid base/reaction only for this demo; do not invent a new asset.

STATE:
Implement the locked state contracts:
- COM-00 sets Xu neighbor/name knowledge and its choice tone;
- COM-01X requires `met_xu_tang`, adds Xu familiarity + building-tip state;
- COM-01J requires Xu met and JYC not yet met, sets JYC first-meet/familiarity/cafe seed/topic.
Do not introduce early exclusivity/recentFocus semantics.

MEMORIES:
Create three new Memory Events:
- 雨夜搬家 — progress rank 100
- 電梯重啟 — progress rank 120
- 地下街初遇 — progress rank 140

Use stable IDs, replay anchors, unlockNodes, spoiler-safe summaries, and valid covers/focus according to W4.
The demo route may have a short non-canonical `Chapter 1 Complete / Demo End` runtime ending/return-to-title boundary if the engine requires an ending node; clearly mark it as demo scaffolding, not a relationship ending.

CHOICES:
All three canonical local choice sets must work and rejoin correctly.
Do not create obvious good/bad labels.

VERIFY:
- build
- validate
- tests
- asset checks
- preview smoke
- any repo-required browser/Codespace acceptance appropriate for the changed surfaces

Create a branch + PR.
Do not merge automatically.
Return:
- files changed
- route/start/end behavior
- node count
- Memory Event mapping
- assets used
- verification results
- PR URL
- any schema/runtime blocker

If the current runtime schema cannot represent the locked content without a design change, BLOCKED and report the smallest schema gap instead of silently changing narrative semantics.
~~~

---

# 16. HUMAN PLAYTEST TASK

After integration PR CI passes, launch the demo in Codespaces/browser and evaluate only:

- does the first 12–18 minutes flow without broken assets or dead ends?
- do Xu Tang and Jiang Yucheng immediately feel like different people?
- do all three choice sets feel reasonable rather than obvious good/bad?
- does the CG-first presentation feel alive enough without sprites?
- do reaction edits appear at meaningful beats?
- does Start/Continue/Memories behave correctly?
- is any text obviously too long when seen over the actual images?
- are any generated images so wrong that they distract from the scene?

Do not polish every imperfect line/image before answering these questions.

## 17. After demo

Only after the demo is playable:

- fix blocking/ugly art first;
- line-edit pacing problems revealed by actual play;
- add missing branch Reaction CGs where the emotional difference is visible;
- improve 16:9 crop/focus metadata;
- then apply the same operator pattern to `COM-02X → COM-02J → COM-03X → COM-03J → COM-03M`.

The repeatable production unit becomes:

`locked scene → minimal shot plan → Human attachment image tasks → ingest → integrate → playtest → polish`.
