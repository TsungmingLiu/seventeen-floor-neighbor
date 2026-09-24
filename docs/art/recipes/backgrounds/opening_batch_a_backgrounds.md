# Opening / Vertical Slice Batch A — Reusable Background Recipes

> Status: generated / runtime WebP uploaded; all 9 Opening Vertical Slice logical backgrounds complete, including the locked elevator `restart_dim` variant
>
> Date: 2026-09-24
>
> Visual contract: mobile-first 9:16, 1080 × 1920 runtime WebP, realistic high-end urban romance VN environment art, empty scene, lower ~25% dialogue-safe, sprite-overlay friendly.
>
> Canonical inputs: `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`, `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`, `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`.
>
> Scene sources read: all currently existing files under `docs/narrative/scenes/vertical-slice/`: `COM-00.md`, `COM-01X.md`, `COM-01J.md`, `COM-02X.md`, and `COM-02J.md`, in addition to the canonical art matrix and braided narrative spec. `XT-04`, `JYC-05`, and `JYC-06` do not yet have locked scene files, so their backgrounds follow `PROTOTYPE_ART_REQUIREMENTS.md` plus the braided narrative spec without inventing scene-specific blocking. Locked scene staging takes precedence wherever it exists.

## Shared production rules

- Backgrounds are environments, not event CGs: no characters, silhouettes, or protagonist body parts.
- Preserve reusable left/right sprite zones and a visually calm lower dialogue area.
- Use realistic Taipei spatial language without copying a named business, copyrighted IP, or recognizable branded layout.
- No readable signage, product labels, book titles, door numbers, captions, UI, logos, trademarks, or watermarks.
- Keep perspective and furniture scale believable; avoid fisheye, Dutch angles, impossible reflections, and concept-art spectacle.
- `BG-APT-17F-NIGHT` is the architectural master for `BG-APT-17F-RAIN`; geometry and camera are intentionally matched.

---

## BG-APT-17F-RAIN

- **Asset ID:** `BG-APT-17F-RAIN`
- **Narrative use:** Opening move-in background. Establishes the 17th-floor shared-life motif while leaving the actual door-holding and box interaction to sprites / `CG-COM-01`.
- **Scene mapping:** `COM-00` primary; reusable for later rainy return-home transitions if no scene-specific locked staging conflicts.
- **Time / weather / mood:** Rainy night; heavy rain outside, dry interior; warm residential light against cool storm-blue city ambience; quiet new-beginning mood.
- **Composition:** 9:16 eye-level corridor view with strong depth toward elevator/window; open central path; clear sprite zones on both sides; restrained moving boxes at the left edge; lower 25% mostly reflective floor for dialogue UI.
- **Key visual elements:** Warm-gray walls, dark apartment doors, understated stone/wood, elevator recess, generic Taipei high-rises through rain-streaked glass, subtle wet-shoe reflections, unlabelled moving boxes.
- **Prompt / recipe:**

  ~~~text
  Use BG-APT-17F-NIGHT as the exact architectural master. Preserve corridor layout, camera height, doors, elevator, walls, floor, perspective, and sprite-safe composition. Change only weather, exterior ambience, and small reusable move-in cues: heavy rain through the far window, soft wet-city bokeh, cool blue spill near the far end, subtle damp shoe reflections near the elevator/window transition, and a small cluster of plain moving boxes against one foreground edge. Keep the indoor corridor dry. Realistic high-end urban romance VN environment art; photographic polished game-cinematic realism; 9:16 vertical; lower 25% dialogue-safe.
  ~~~

- **Negative constraints:** No indoor rainfall or flooding; no people; no silhouettes; no readable labels or door numbers; no landmark tower; no horror lighting; no extreme luxury; no blocked sprite lanes; no watermark.
- **Final filename:** `runtime-public/bg/bg-apt-17f-rain-v1.webp`
- **Runtime metadata:** Google Drive file ID `1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun`; 1080 × 1920; 139,816 bytes; SHA-256 `b42ec3d876b7009fcc84c66ed5feaa7cf62917024c52be8c68e920f00faf79d9`.

---

## BG-APT-17F-NIGHT

- **Asset ID:** `BG-APT-17F-NIGHT`
- **Narrative use:** Core 17th-floor night background for neighbor encounters, physical crossover, conflict distance, repair, commitment, and ending echo.
- **Scene mapping:** `SH-01`, `XT-11`, `XT-14`, `XT-G`, `XT-D`, `BOTH-D`, `BOTH-DC`; optional night variant for `COM-03X` and later shared / confrontation transitions.
- **Time / weather / mood:** Clear ordinary night; warm homecoming light with restrained cool city glow; quiet, clean, intimate, emotionally neutral enough for both romance and distance.
- **Composition:** Same 9:16 corridor master as the rain variant; eye-level, long believable perspective, open center, left/right full-body sprite zones, calm reflective floor under the dialogue area.
- **Key visual elements:** Warm-gray textured walls, dark residential doors, indirect wall lights, stone elevator surround, potted plant, generic Taipei residential skyline.
- **Prompt / recipe:**

  ~~~text
  Empty 17th-floor corridor in a contemporary Taipei high-rise apartment at night. Believable upper-middle residential building, not hotel-like: warm-gray walls, dark apartment doors, understated wood and stone, warm wall lights, elevator recess, and a distant window with generic high-rise city glow. Realistic high-end urban romance VN environment art; photographic polished game-cinematic realism. 9:16 vertical eye-level view with corridor depth, open center, clear full-body sprite zones on both sides, and a low-detail lower 25% for dialogue UI.
  ~~~

- **Negative constraints:** No people or reflections of people; no readable door numbers; no named landmark; no logos or signage; no fisheye; no horror tone; no hotel corridor styling; no extreme luxury; no watermark.
- **Final filename:** `runtime-public/bg/bg-apt-17f-night-v1.webp`
- **Runtime metadata:** Google Drive file ID `1UtU2PNgY09hmQXrVO51_4p7LH-qL-MpK`; 1080 × 1920; 137,276 bytes; SHA-256 `a446593edca64110ca1d7a1a98b55a2ad3c15affb992b4142c6abc0020626a24`.

---

## BG-APT-ELEVATOR

- **Asset ID:** `BG-APT-ELEVATOR`
- **Narrative use:** Reusable two-person enclosure for awkward silence, dry humor, ordinary neighbor contact, and distance / closure transitions. This file is the locked normal-light architectural master; `COM-01X` additionally calls for a same-layout `restart_dim` lighting variant.
- **Scene mapping:** `COM-01X`, `XT-DC`; reusable for apartment transition beats and Distance echoes.
- **Time / weather / mood:** Interior / time-neutral; warm-white practical light; restrained, intimate, slightly enclosed but safe.
- **Composition:** 9:16 frontal eye-level view toward closed doors; symmetrical but not sterile; two side sprite zones; subdued central surface; lower 25% simple stone floor for UI.
- **Key visual elements:** Deep-gray brushed metal, warm-gray stone side panels, subtle bronze trim, soft ceiling panel, simple handrails, restrained control panel, controlled reflections.
- **Prompt / recipe:**

  ~~~text
  Empty contemporary Taipei residential elevator interior for repeated two-character VN dialogue. Deep-gray brushed metal, warm-gray stone accents, subtle bronze trim, warm-white ceiling light, closed doors, simple handrails, restrained control panel, believable seams and floor. Realistic high-end urban romance VN environment art; photographic polished game-cinematic realism. 9:16 vertical, frontal eye-level, moderately wide without fisheye; preserve left/right character zones and a calm lower 25% for dialogue UI.
  ~~~

- **Negative constraints:** No mirror wall; no duplicated sprite reflections; no readable floor labels or numbers; no people; no logos; no impossible reflections; no hotel-lobby scale; no horror; no watermark.
- **Final filename:** `runtime-public/bg/bg-apt-elevator-v1.webp`
- **Runtime metadata:** Google Drive file ID `1bDN18sR5dO_goUtz5XF8CDBKzBM4SBzR`; 1080 × 1920; 164,942 bytes; SHA-256 `6be99b6609009c445df3d4d58230ba918a3cf24f84b36066c905635483874f18`.


### Variant — BG-APT-ELEVATOR.restart_dim

- **Logical asset ID:** `BG-APT-ELEVATOR.restart_dim`
- **Parent asset / variant ID:** `BG-APT-ELEVATOR` / `restart_dim`
- **Scene mapping:** `COM-01X` locked Shot B / `common_elevator_restart_stop`.
- **Narrative use:** 6–8 second control-system restart state. The cabin remains safe and readable; the event must not visually escalate into a blackout, alarm, or horror beat.
- **Layout authority:** exact decoded pixels of accepted `runtime-public/bg/bg-apt-elevator-v1.webp` (SHA-256 `6be99b6609009c445df3d4d58230ba918a3cf24f84b36066c905635483874f18`). No crop, resize, warp, focal-length change, redecorating, or geometry regeneration was used for the accepted variant.
- **Accepted recipe:** image-generation relighting was attempted first and **rejected** because wall panels, control panel, floor texture, and camera geometry drifted. The accepted variant instead uses a deterministic 1:1 pixel-coordinate lighting transform of the normal master: reduce main cabin exposure, dim the large ceiling practical more strongly, preserve the two small ceiling/emergency practical pools and control-panel luminance, and add one subtle neutral-warm powered indicator inside the existing panel display area. No text, red alarm light, or new object is introduced.
- **Negative constraints:** No full darkness; no red emergency wash; no horror contrast; no broken panel; no new text; no person; no changed wall/floor/door/handrail/panel geometry; no reflection edits that move structure.
- **Master:** `source-private/bg-apt-elevator-restart-dim-master-v1.png` — Drive file ID `1gsXt8wZgRvWfXHG4db8igByNJZL_J9Yd`; https://drive.google.com/file/d/1gsXt8wZgRvWfXHG4db8igByNJZL_J9Yd/view ; 1080 × 1920; 1,228,131 bytes; SHA-256 `5f571069a7d7cd3e713502ac82d1f6043d582de9ba5d0da0eaac12016052dfe4`.
- **Runtime:** `runtime-public/bg/bg-apt-elevator-restart-dim-v1.webp` — Drive file ID `1KfWruN_mrRDywfgt_7SrxD5iVViPPMGS`; https://drive.google.com/file/d/1KfWruN_mrRDywfgt_7SrxD5iVViPPMGS/view ; 1080 × 1920; 90,702 bytes; SHA-256 `57a5f82c0c03c9587d82f247ad917ba882ce8b74116dc115d538af451bfa631e`.
- **QA:** **Pass.** Full decode passed. Runtime dimensions/aspect match the normal background exactly. Geometry comparison is structurally exact by construction: every output pixel maps to the same source coordinate; no geometric transform occurred. Door seams, wall panels, floor grout/marbling, handrails, and control-panel position remain unchanged. Main illumination is visibly reduced while emergency/panel practicals remain powered; lower dialogue zone and sprite zones remain usable.
- **Known limitation:** No higher-resolution normal elevator master was present in `source-private`; the lossless PNG master for this variant is therefore derived from the accepted 1080 × 1920 runtime normal image. Future remastering should relight a higher-resolution architectural master if one becomes available, but must preserve this exact composition.

---

## BG-ACG-SHOP

- **Asset ID:** `BG-ACG-SHOP`
- **Narrative use:** Jiang Yucheng's first-interest and in-her-element environment. Supports browsing, comparing art books, merchandise reward beats, and return visits without pre-staging a specific action.
- **Scene mapping:** `COM-01J`, `JYC-05`; reusable with `BG-ACG-CORRIDOR` for transitions within the same outing.
- **Time / weather / mood:** Artificially lit underground retail environment; time-neutral; curious, energetic, welcoming, never overwhelming.
- **Composition:** 9:16 eye-level central aisle; primary art-book shelf at middle depth; enough open aisle for full-body or three-quarter sprites; balanced shelf masses on both sides; lower 25% largely open floor.
- **Key visual elements:** Fictional art books, generic model boxes, acrylic displays, capsule-toy machine, orderly shelves, exposed retail ceiling, glimpse into underground mall circulation.
- **Prompt / recipe:**

  ~~~text
  Empty Taipei underground ACG art-book and merchandise shop, production-ready for repeated VN conversations. Compact believable specialty retail: shelves of fictional art books and setting collections, generic model boxes, acrylic displays, a few capsule-toy elements, restrained colorful shelf lighting, and a glimpse of the underground shopping corridor. Realistic high-end urban romance VN environment art; photographic polished game-cinematic realism. 9:16 vertical, eye-level, calm central aisle, readable left/right sprite zones, lower 25% low-detail for dialogue UI.
  ~~~

- **Negative constraints:** No recognizable anime characters or copyrighted IP; no real brands; no readable Japanese / Chinese / Latin titles; no people or mannequins; no random captions; no arcade-neon overload; no warped shelves; no fisheye; no watermark.
- **Final filename:** `runtime-public/bg/bg-acg-shop-v1.webp`
- **Runtime metadata:** Google Drive file ID `1A64MyWEun8U4rOjM-FVgktCngPY7aHwi`; 1080 × 1920; 237,936 bytes; SHA-256 `fd768069315e34ce506595f96d1471e008bbf8716d47edf303711d3ca06af9c1`.

---

## BG-CONVENIENCE-NIGHT

- **Asset ID:** `BG-CONVENIENCE-NIGHT`
- **Narrative use:** Low-pressure everyday intimacy: late meals, coffee, work-schedule talk, brief re-approach, and ending drink setup. Props remain generic so the scene can support different purchases.
- **Scene mapping:** `COM-02X`; reusable for `RE-X` and Jiang ending / rainy-night drink transitions where continuity calls for a convenience store.
- **Time / weather / mood:** Around 23:00 on a wet night; cold-white store light, muted blue city exterior, warm street reflections; ordinary, tired, quietly intimate.
- **Composition:** 9:16 gently diagonal aisle view; refrigerators left, restrained shelves and eat-in ledge right, open center floor for sprite placement; lower 25% calm reflective tile.
- **Key visual elements:** Generic refrigerated drinks, simple late-night food shelves, eat-in stools, large rain-streaked windows, wet residential street and apartment blocks outside.
- **Prompt / recipe:**

  ~~~text
  Empty unbranded convenience store in a Taipei residential neighborhood around 23:00. Cool-white interior lighting, refrigerated drink cases, restrained shelves of generic late-night food, a simple eat-in ledge, and large windows showing wet city pavement and soft night lights. Everyday neighborhood store, not a flagship. Realistic high-end urban romance VN environment art; photographic polished game-cinematic realism. 9:16 eye-level diagonal view with open floor, two readable sprite zones, and a calm lower 25% for dialogue UI.
  ~~~

- **Negative constraints:** No staff or customers; no people in reflections; no readable packaging, prices, posters, or labels; no real chain colors or branded layout; no logos; no crime-noir mood; no clutter overload; no fisheye; no watermark.
- **Final filename:** `runtime-public/bg/bg-convenience-night-v1.webp`
- **Runtime metadata:** Google Drive file ID `1dlSssyBzc_xI44OBi_16Kk79s87hKAaG`; 1080 × 1920; 259,386 bytes; SHA-256 `80b9c5563382ebd2570a20d4dfb58e562dbea8b327c7e1efcb92bb98c23aa487`.

---

## BG-CAFE-STATION

- **Asset ID:** `BG-CAFE-STATION`
- **Physical variant:** daytime master; keep the generated filename explicit as `bg-cafe-station-day-v1.webp`. The logical ID is canonical and must remain `BG-CAFE-STATION` in future content/runtime mapping.
- **Narrative use:** Quiet transit-adjacent café corner for Jiang Yucheng's second meeting, drawing conversation, re-approach, and friendship continuation. The environment suggests a tablet-friendly seat without baking a tablet or personal belongings into the background.
- **Scene mapping:** `COM-02J`, `RE-J`; optional `JYC-F` / `JYC-FC` café variant.
- **Time / weather / mood:** Daytime; soft window light plus warm café practicals and cool underground transit ambience; calm, safe, observant, slightly anonymous.
- **Composition:** 9:16 eye-level view across a window-side table; booth left and empty chair right support seated or three-quarter sprites; distant concourse and tiny anonymous passersby stay strongly defocused; foreground tabletop provides a low-detail dialogue-safe zone.
- **Key visual elements:** Warm wood, concrete / stone, window-side table, empty chair, restrained plant, practical power outlet, neutral cup, blurred transit concourse and subtle far-background human flow beyond glass.
- **Prompt / recipe:**

  ~~~text
  Empty quiet café corner near Taipei Main Station / an underground transit mall during daytime. Compact independent-feeling interior with warm wood and stone, one calm window-side table suitable for a tablet, practical seating and a subtle power outlet. Beyond the glass, a softly blurred underground concourse with cool public lighting and only a few tiny, anonymous, strongly defocused passersby to establish transit flow. Realistic high-end urban romance VN environment art; photographic polished game-cinematic realism. 9:16 eye-level framing, seated / three-quarter sprite zones, foreground tabletop kept visually calm for dialogue UI, reusable for reunion and friendship scenes.
  ~~~

- **Negative constraints:** No foreground people, identifiable faces, crisp crowd figures, or human reflections in the café glass; no pre-placed tablet, bag, or personal belongings; no readable menu or station sign; no logos; no influencer-café styling; no oversaturated décor; no fisheye; no watermark.
- **Final filename:** `runtime-public/bg/bg-cafe-station-day-v1.webp`
- **Runtime metadata:** Google Drive file ID `1gtUUfGl-gT7REoUZUBO_n6dWRYA1dr5S`; 1080 × 1920; 174,868 bytes; SHA-256 `e9aa7ca3c1dffe414615f26bc6f9abf7c17f097b4af3f0a3e2101197e00faff3`.

---


## BG-BOOKSTORE

- **Logical asset ID:** `BG-BOOKSTORE`
- **Scene mapping:** `XT-04` primary; optional reuse in `JYC-06B` only if later locked staging requests it.
- **Narrative use:** Zhongshan independent art/design bookstore for Xu Tang's first true one-on-one scene; supports slow browsing, large-format design/photography books, and multiple standing/3/4 sprite placements without baking in a specific interaction.
- **Composition / lighting:** Narrow but comfortable portrait aisle, warm wood shelving, concrete floor, natural afternoon side/back light, restrained track/pendant practicals, clear central depth, browsing positions along both shelves, and a visually calm lower ~25% floor zone.
- **Accepted prompt / recipe:**

  ~~~text
  Empty Taipei Zhongshan independent art / photography / design bookstore in the afternoon. Narrow but comfortable contemporary shop, warm wood shelves, concrete floor, curated photography and design books with abstract or unreadable covers, restrained plants and display objects, natural afternoon side light plus warm practicals. High-end realistic urban-romance VN environment, photographic game-cinematic realism, portrait 9:16, eye-level perspective, enough depth and open aisle for Xu Tang full-body or 3/4 sprites and several browsing positions. Keep the lower 25% visually calm for dialogue UI. Mature and understated rather than a chain store or influencer photo shop.
  ~~~

- **Negative constraints:** No people; no real bookstore branding; no real or readable book titles; no readable cover text as focal content; no café-chain identity; no excessive lifestyle staging; no fisheye; no Dutch angle; no impossible reflections; no watermark.
- **Master:** `source-private/bg-bookstore-master-v1.png` — Drive file ID `1TrROVx2vMs5_W2KMFj4lvv1NMtBVaPuQ`; https://drive.google.com/file/d/1TrROVx2vMs5_W2KMFj4lvv1NMtBVaPuQ/view ; 940 × 1672; 2,147,965 bytes; SHA-256 `422a865f15f9f4fe12abd5516dbdf27d5dd3e34a83d77eceb504926cbec0da31`.
- **Runtime:** `runtime-public/bg/bg-bookstore-v1.webp` — Drive file ID `1QXptJ1k59WURZlE2NmbaEUmvHUj4Wj_M`; https://drive.google.com/file/d/1QXptJ1k59WURZlE2NmbaEUmvHUj4Wj_M/view ; 1080 × 1920; 269,236 bytes; SHA-256 `22565033d7786b6c9b105e3afa7c6d218ac0f05f23546d139e5466b9a2ef248c`.
- **QA:** **Pass.** Full decode passed; runtime is exactly 1080 × 1920. Central aisle and side shelves provide reusable sprite/browsing zones; lower quarter is predominantly low-detail floor. No people, visible logos, or readable book-title focus. Perspective and furniture scale are coherent.
- **Known limitation:** Several tiny cover/spine marks read as abstract print texture at runtime scale; if a future sharpening/remaster makes pseudo-text legible, those covers should be simplified rather than preserved.

---

## BG-ACG-CORRIDOR

- **Logical asset ID:** `BG-ACG-CORRIDOR`
- **Scene mapping:** `JYC-05` primary; `COM-01J` optional 1–2 node entrance/exit transitions.
- **Narrative use:** Public circulation space outside/around the existing `BG-ACG-SHOP`, showing Jiang Yucheng naturally leading through her ACG environment while preserving a central walking axis and side sprite room.
- **Continuity:** Uses the existing `BG-ACG-SHOP` as material/lighting reference: exposed retail ceiling, bright public lighting, pale reflective tile, warm/cool shop spill, fictional books/figures/gacha visual language. It is deliberately a public corridor, not a duplicate of the shop interior.
- **Accepted prompt / recipe:**

  ~~~text
  Empty Taipei underground ACG shopping corridor, visually continuous with the accepted BG-ACG-SHOP but clearly outside the store. Relatively low exposed ceiling, bright artificial public lighting, polished pale-gray tile, dense small specialty storefronts on both sides, fictional anime/illustration posters, generic figures/model kits, art books and capsule machines. Energetic but believable retail color, not cyberpunk. Strong central walking depth, eye-level 9:16 framing, side room for Jiang Yucheng sprite placement, and a low-detail lower 25% for dialogue UI. No live pedestrians.
  ~~~

- **Negative constraints:** No people or human silhouettes; no real copyrighted characters; no real shop logos; no readable signage focus; no brand-identifiable gacha/property design; no cyberpunk neon tunnel; no fisheye; no Dutch angle; no watermark.
- **Generation note:** First draft had distant live-human silhouettes and was rejected. Second draft removed all live pedestrians and is the accepted master.
- **Master:** `source-private/bg-acg-corridor-master-v1.png` — Drive file ID `1M7344Nsr5Ir-rbEvkBsGFN8FxU3SkL77`; https://drive.google.com/file/d/1M7344Nsr5Ir-rbEvkBsGFN8FxU3SkL77/view ; 940 × 1672; 2,388,629 bytes; SHA-256 `d8d091b582d4cc1e9c8d10d89cfd4ca1c7ee61bf2fd69e72e6c69b7f15d66c2b`.
- **Runtime:** `runtime-public/bg/bg-acg-corridor-v1.webp` — Drive file ID `18uwnII_DvCeLV3HcYouHF0xE5m-cMksx`; https://drive.google.com/file/d/18uwnII_DvCeLV3HcYouHF0xE5m-cMksx/view ; 1080 × 1920; 314,700 bytes; SHA-256 `76c20ffbbe1fd7d9d1efb5d61770a1dd473d264177e9a7f3f75e8d24ca303b7f`.
- **QA:** **Pass after one retry.** Full decode passed; runtime is exactly 1080 × 1920. No live people remain. Central vanishing path is clear, lower quarter is calm tile, and shop masses leave usable sprite lanes. Visual language matches the existing ACG shop without cloning its interior.
- **Known limitation:** Fictional poster/merchandise art is intentionally dense; no existing IP was identifiable in visual QA, but a later high-resolution remaster should repeat the IP-resemblance and pseudo-signage check.

---

## BG-PC-HOME-LIVING

- **Logical asset ID:** `BG-PC-HOME-LIVING`
- **Scene mapping:** `JYC-06` primary; later reusable for `JYC-07` variant and `JYC-10`.
- **Narrative use:** Protagonist's Taipei living/work room for Gaming Night and later domestic-intimacy scenes. It must read as a financially comfortable 31-year-old senior software engineer / tech lead's home, not a CEO fantasy or gamer showroom.
- **Composition / staging:** Work desk and dual monitors on the left, restrained gaming gear, sofa/low seating on the right, central coffee table/rug, and a broad open wood-floor foreground. A few unpacking boxes and partially filled shelves signal a recent return to Taipei. Two adults can plausibly game in the same room, and the open floor/sofa area supports `JYC-SPR-GAMING`.
- **Accepted prompt / recipe:**

  ~~~text
  Empty contemporary Taipei apartment living room / work area at night for a 31-year-old senior software engineer / tech lead. Comfortable upper-middle income but ordinary apartment scale: clean organized work desk with dual monitors, ergonomic chair and warm task light; subtle gaming setup and generic controller; sofa / low seating, coffee table and rug; broad open floor for two adults to game in the same room. A few plain unpacking boxes and only partly filled shelves show he recently moved back to Taipei. Warm practical lamps against cool generic residential high-rise night outside. Lived-in and gradually settling, not a showroom. High-end realistic urban-romance VN environment, 9:16, lower 25% calm and sprite-safe.
  ~~~

- **Negative constraints:** No people; no visible branded hardware logos; no giant penthouse; no floor-to-ceiling luxury fantasy; no RGB gamer cave; no server-room aesthetic; no readable desktop UI/text; no fisheye; no Dutch angle; no watermark.
- **Master:** `source-private/bg-pc-home-living-master-v1.png` — Drive file ID `15o5MiG3vQSIojk1ZSpZW1vT0WdAzl_eV`; https://drive.google.com/file/d/15o5MiG3vQSIojk1ZSpZW1vT0WdAzl_eV/view ; 941 × 1672; 1,923,699 bytes; SHA-256 `67bafba67807072ec74f54161b74142a92a1edb670d48c8b9d2a75182477fc5a`.
- **Runtime:** `runtime-public/bg/bg-pc-home-living-v1.webp` — Drive file ID `1wSc3PRnPWYU7pEfArVa_pu-fZZQZaVc_`; https://drive.google.com/file/d/1wSc3PRnPWYU7pEfArVa_pu-fZZQZaVc_/view ; 1080 × 1920; 207,046 bytes; SHA-256 `fca2f4b398a0b8b4bff951e626ca1ca104679a7184bf2b2eb28281ffc598b804`.
- **QA:** **Pass.** Full decode passed; runtime is exactly 1080 × 1920. Work/gaming/living functions are all readable without luxury excess; open foreground and sofa staging are usable; moving boxes communicate early move-in continuity; no visible brand logo or readable UI is a focal element.
- **Known limitation:** This accepted asset is a night-state base suited to `JYC-06`; later scenes that explicitly lock a different time of day should request a same-layout lighting variant rather than regenerating the apartment geometry.

---

## Batch QA summary

| Asset | Composition / UI | Reuse | Blocking rework | Optional polish |
|---|---|---|---|---|
| BG-APT-17F-RAIN | Pass | Pass | None | Re-render only if later scene staging requires boxes on the opposite side. |
| BG-APT-17F-NIGHT | Pass | Pass | None | None. |
| BG-APT-ELEVATOR.normal | Pass | Pass | None | None. |
| BG-APT-ELEVATOR.restart_dim | Pass; 1:1 geometry lock | Pass for COM-01X restart beat | None | Remaster only if a higher-resolution normal architectural master becomes available. |
| BG-ACG-SHOP | Pass | Pass | None | Inspect at final device scale; regenerate shelf art if any pseudo-title becomes legible after future sharpening. |
| BG-CONVENIENCE-NIGHT | Pass | Pass | None | Inspect product labels after any higher-resolution remaster; keep them abstract. |
| BG-CAFE-STATION | Pass; distant transit flow remains strongly defocused | Pass for seated / 3/4 staging | None | Consider a wider open-floor alternate only if later implementation requires two simultaneous full-body sprites. |
| BG-BOOKSTORE | Pass | Pass for XT-04 browsing / 3/4 staging | None | Simplify tiny cover marks if later sharpening makes pseudo-text legible. |
| BG-ACG-CORRIDOR | Pass after one retry | Pass with BG-ACG-SHOP continuity | None | Repeat IP-resemblance / pseudo-signage QA after any remaster. |
| BG-PC-HOME-LIVING | Pass | Pass for JYC-06 domestic gaming staging | None | Derive same-layout lighting variants if later locked scenes require other times of day. |

## Scene readiness

- **Background-ready now:** all currently locked common Opening Vertical Slice background beats, including the full `COM-01X` normal → `restart_dim` → normal sequence; plus planned `XT-04`, `JYC-05`, and `JYC-06` environment IDs from the canonical art/narrative specs.
- **A1 background blocker status:** none. All nine required logical backgrounds are present in `runtime-public/bg`; `BG-APT-ELEVATOR` has both required locked variants.
- **Reusable with scene-level staging confirmation:** `COM-03X`, `RE-X`, `RE-J`, `SH-01`, later Xu/JYC apartment, bookstore, ACG, café, and convenience transitions. Do not invent additional variants until a locked scene/art spec explicitly requires one.
- Background-only readiness does not imply the complete scene is art-ready; required sprites, expressions, CG timing, and runtime manifest integration remain separate gates. No scene S8/S9 status is advanced by this background batch alone.
