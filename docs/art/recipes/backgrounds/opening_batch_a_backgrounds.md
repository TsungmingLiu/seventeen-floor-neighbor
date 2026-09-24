# Opening / Vertical Slice Batch A — Reusable Background Recipes

> Status: generated / runtime WebP uploaded; 5 logical backgrounds complete, elevator restart variant pending
>
> Date: 2026-09-23
>
> Visual contract: mobile-first 9:16, 1080 × 1920 runtime WebP, realistic high-end urban romance VN environment art, empty scene, lower ~25% dialogue-safe, sprite-overlay friendly.
>
> Canonical inputs: `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`, `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`, `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`.
>
> Scene sources read: `COM-00.md`, `COM-01X.md`, `COM-01J.md`, `COM-02X.md`, and `COM-02J.md` under `docs/narrative/scenes/vertical-slice/`, in addition to the canonical art matrix and braided narrative spec. The locked scene staging takes precedence where it is more specific.

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

## Batch QA summary

| Asset | Composition / UI | Reuse | Blocking rework | Optional polish |
|---|---|---|---|---|
| BG-APT-17F-RAIN | Pass | Pass | None | Re-render only if later scene staging requires boxes on the opposite side. |
| BG-APT-17F-NIGHT | Pass | Pass | None | None. |
| BG-APT-ELEVATOR | Pass | Pass | None for normal master | Derive the locked same-layout `restart_dim` variant before final `COM-01X` art acceptance. |
| BG-ACG-SHOP | Pass | Pass | None | Inspect at final device scale; regenerate shelf art if any pseudo-title becomes legible after future sharpening. |
| BG-CONVENIENCE-NIGHT | Pass | Pass | None | Inspect product labels after any higher-resolution remaster; keep them abstract. |
| BG-CAFE-STATION | Pass; distant transit flow remains strongly defocused | Pass for seated / 3/4 staging | None | Consider a wider open-floor alternate only if later implementation requires two simultaneous full-body sprites. |

## Scene readiness

- **Background-ready now:** `COM-00`, `COM-01X` normal-light beats, `COM-01J`, `COM-02X`, `COM-02J`, `SH-01`, `XT-11`, `XT-14`, `XT-G`, `XT-D`, `XT-DC`.
- **Known follow-up:** `COM-01X` still needs the locked same-layout `restart_dim` lighting variant; this is a seventh variant and was not among the six requested output filenames.
- **Reusable with scene-level staging confirmation:** `COM-03X` night variant, `JYC-05`, `RE-X`, `RE-J`, `BOTH-D`, `BOTH-DC`, `JYC-F`, `JYC-FC`, and later apartment / convenience transitions.
- Background-only readiness does not imply the complete scene is art-ready; required sprites, expressions, CG timing, and runtime manifest integration remain separate gates.
