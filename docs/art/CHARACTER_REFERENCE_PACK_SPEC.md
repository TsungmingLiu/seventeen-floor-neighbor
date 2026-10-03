# Character Reference Pack Specification

> **CANONICAL identity/reference manifest.**
>
> AI workflow rule: this document records multiple characters for catalog purposes, but a CG manifest entry binds only the visible character reference(s). Do not load both heroines' references into a single-character render task.
> Mentions of sprite production are historical/general capability notes; new production is CG-first per `docs/art/PRODUCTION_VISUAL_DIRECTION.md`.


> 狀態：**Canonical character-image reference contract**
>
> 版本：1.5
>
> 更新：2026-10-03
>
> 目的：定義所有可進 production 的戀愛角色，在大量生成 CG 前必須具備的 6-sheet reference pack；同時記錄目前已入庫、可供 generation 綁定的參考圖與缺失項目。
>
> 本文件負責「角色設定圖如何製作、哪張圖是什麼 authority、生成 CG 時該載入哪些 reference」。  
> Scene-local intent 由 locked scene file 負責；global visual rules 由 `docs/art/PRODUCTION_VISUAL_DIRECTION.md` 負責。Archived art matrix / prompt pack 不再是 production input。

---

# 1. Production status

2026-09-23 QA review 記錄兩套角色 reference pack 通過設計驗收。該歷史 QA 狀態不表示目前所有圖檔均可取得。當前可綁定檔案與缺失項目以第 2–4 節與第 4.2–4.3 節的 repository status 為準。

非阻擋性注意：

- Expression sheet 允許少量自然頭部微偏，不要求像 3D scan 一樣完全機械固定；真正的 authority 仍是 `ref-01-face`。
- Reference sheet 中出現的品牌／ACG圖樣只作角色設計參考；實際遊戲 asset 是否保留由最終 production / legal 決定。
- **不要把上一張生成 CG 當下一張 CG 的唯一 identity source。**

---

# 2. Current repository reference availability

Production adapters resolve source IDs through `content/assets/source-catalog.json` to its `sourcePath` and verify the file, MIME, SHA-256, role, and visible pixels before generation. Historical provider metadata is not an active acquisition binding.

Both six-sheet packs are now available as original PNG files under `assets-src/references/xu-tang/` and `assets-src/references/jiang-yucheng/`. The Owner supplied all 12 files on 2026-09-30. Four already stored face/Wardrobe A sheets match the uploads byte-for-byte; seven missing sheets have been restored, and Xu Tang's temporary body JPEG has been superseded by the supplied PNG.

Exact filenames, roles, character IDs, MIME, dimensions, byte counts and SHA-256 are recorded in `content/assets/source-catalog.json` and `content/assets/ingest-receipts/character-reference-packs-20260930.json`. The original Gate 3 receipt remains historical evidence; its JPEG fingerprint is verified through the explicit supersession record, not presented as the new PNG's fingerprint.

`content/assets/character-reference-packs.json` is the machine-readable six-sheet and wardrobe-look index. Runtime character metadata lists all six sources for integrated characters; future characters resolve through this registry without requiring runtime integration. Reference images are production inputs and are not copied into the playable runtime asset bundle.

---

# 3. Xu Tang canonical reference manifest

Canonical character facts：

- Name：Xu Tang / 許棠
- Age：27
- Height：約 170 cm
- Visual direction：成熟、精緻、克制的都市輕熟女
- Signature accessory：大型金色 hoop earrings
- Signature home piece：灰色居家毛衣上衣

| Role | File | Repository status | Authority |
|---|---|---|---|
| Primary face identity | `xt-ref-01-face.png` | Available: `assets-src/references/xu-tang/xt-ref-01-face.png` | **Highest** |
| Expression / acting | `xt-ref-02-expression.png` | Available: `assets-src/references/xu-tang/xt-ref-02-expression.png` | Secondary |
| Body / proportions | `xt-ref-03-body.png` | Available: `assets-src/references/xu-tang/xt-ref-03-body.png` | Body authority |
| Hair / hands / props / lighting | `xt-ref-04-production.png` | Available: `assets-src/references/xu-tang/xt-ref-04-production.png` | Production consistency |
| Early/mid wardrobe | `xt-ref-05-wardrobe-a.png` | Available: `assets-src/references/xu-tang/xt-ref-05-wardrobe-a.png` | Wardrobe A |
| Late/after-story wardrobe | `xt-ref-06-wardrobe-b.png` | Available: `assets-src/references/xu-tang/xt-ref-06-wardrobe-b.png` | Wardrobe B |

## 3.1 Xu wardrobe semantics

Wardrobe A：

1. Weekday Neighbor
2. Late-night Convenience Store — **灰色居家毛衣**
3. Bookstore / Café Date — **黑色透膚絲襪**
4. Weekend / Night Out — 較成熟時髦

Wardrobe B：

1. Riverside / Rainy Date — trench + black tights
2. Work / Deadline Home — 灰色居家毛衣
3. Repair / Ending / Serious Date — refined mature look + black tights
4. After Story / Weekend Morning — relaxed girlfriend look

---

# 4. Jiang Yucheng canonical reference manifest

Canonical character facts：

- Name：Jiang Yucheng / 江雨澄
- Age：23
- Height：約 **160 cm**
- Body：纖細、輕盈、小骨架、腿相對偏長
- Visual direction：可愛、精緻、有成年女大生／研究生感，ACG/creator 主場時更靈動
- Wardrobe signature：黑絲、白絲、過膝襪可高頻出現；但角色 identity 不依賴單一襪裝

| Role | File | Repository status | Authority |
|---|---|---|---|
| Primary face identity | `jyc-ref-01-face.png` | Available: `assets-src/references/jiang-yucheng/jyc-ref-01-face.png` | **Highest** |
| Expression / acting | `jyc-ref-02-expression.png` | Available: `assets-src/references/jiang-yucheng/jyc-ref-02-expression.png` | Secondary |
| Body / proportions | `jyc-ref-03-body.png` | Available: `assets-src/references/jiang-yucheng/jyc-ref-03-body.png` | Body authority |
| Hair / hands / props / lighting | `jyc-ref-04-production.png` | Available: `assets-src/references/jiang-yucheng/jyc-ref-04-production.png` | Production consistency |
| Early/mid wardrobe | `jyc-ref-05-wardrobe-a.png` | Available: `assets-src/references/jiang-yucheng/jyc-ref-05-wardrobe-a.png` | Wardrobe A |
| Late/after-story wardrobe | `jyc-ref-06-wardrobe-b.png` | Available: `assets-src/references/jiang-yucheng/jyc-ref-06-wardrobe-b.png` | Wardrobe B |

## 4.1 JYC wardrobe semantics

Wardrobe A：

1. Campus / Graduate Student — white over-knee socks
2. Café / Creator — black stockings
3. ACG Outing — black over-knee / stocking look
4. Gaming / Home Casual — soft casual socks

Wardrobe B：

1. Cute Date — black semi-sheer stockings
2. Creator Event — white tights
3. Signature Campus — white over-knee socks
4. After Story / Weekend Morning — cozy long socks

---

## 4.2 Lin Ruoqing registered production reference pack

Owner 已明確要求把六張已完成設定圖登錄為 production references；2026-10-03 逐張確認可見內容、PNG signature、完整 decode、尺寸、bytes 與 SHA-256，並原樣入庫。這是 reference-pack registration，沒有新增 runtime CG 或獨立 Visual QA PASS。

人物背景／個性 authority：`docs/art/characters/lin-ruoqing.md`（內容保持不變）。圖片 authority：`content/assets/character-reference-packs.json` 的 `lin_ruoqing` + `content/assets/source-catalog.json`。入庫證據：`content/assets/ingest-receipts/lin-ruoqing-reference-pack-20261003.json`。

所有原圖均為 `image/png`、1672 × 941，未裁切或重採樣。路徑前綴為 `assets-src/references/lin-ruoqing/`。

| Upload | Repository filename | Source ID | Role / authority |
| --- | --- | --- | --- |
| `LRQ-1.png` | `lrq-ref-01-face.png` | `ref.lin_ruoqing.face.01` | `primary_face_identity` / highest facial authority |
| `LRQ-2.png` | `lrq-ref-02-expression.png` | `ref.lin_ruoqing.expression.02` | `expression` / acting |
| `LRQ-3.png` | `lrq-ref-03-body.png` | `ref.lin_ruoqing.body.03` | `body_proportions` / body authority |
| `LRQ-4.png` | `lrq-ref-04-production.png` | `ref.lin_ruoqing.production.04` | `production_consistency` / hair, hands, props, lighting |
| `LRQ-5.png` | `lrq-ref-05-wardrobe-a.png` | `ref.lin_ruoqing.wardrobe.a` | `wardrobe` / Wardrobe A |
| `LRQ-6.png` | `lrq-ref-06-wardrobe-b.png` | `ref.lin_ruoqing.wardrobe.b` | `wardrobe` / Wardrobe B |

Wardrobe keys reflect the labels on the supplied pixels, not an earlier prompt:

| Key | Exact sheet look |
| --- | --- |
| `LRQ-WARDROBE-A-TEACHER-TROUSERS` | Teacher / Trousers |
| `LRQ-WARDROBE-A-CARDIGAN-EVERYDAY` | Cardigan / Everyday |
| `LRQ-WARDROBE-A-TEACHER-PRESENTATION` | Teacher / Presentation |
| `LRQ-WARDROBE-A-HOODIE-WEEKEND` | Hoodie / Weekend |
| `LRQ-WARDROBE-A-FLORAL-DATE` | Floral / Date |
| `LRQ-WARDROBE-A-AUTUMN-OUTING` | Autumn / Outing |
| `LRQ-WARDROBE-B-FITNESS-ACTIVE` | Fitness / Active |
| `LRQ-WARDROBE-B-BADMINTON` | Badminton |
| `LRQ-WARDROBE-B-HOME-REST` | Home / Rest |
| `LRQ-WARDROBE-B-POOL-SWIM` | Pool / Swim |

Select only the required sheets, for example:

~~~sh
npm run cg:references -- --character lin_ruoqing --wardrobe LRQ-WARDROBE-B-BADMINTON --expression --body
~~~

---

## 4.3 Shen Yingxue registered production reference pack

Owner 於 2026-10-03 明確要求啟用六張沈映雪設定圖；逐張確認可見內容、PNG signature、完整 decode、尺寸、bytes 與 SHA-256，並原樣入庫。登錄僅限 production references，沒有新增 runtime CG 或獨立 Visual QA PASS。

人物背景／個性與身高 authority：`docs/art/characters/shen-yingxue.md`（byte-for-byte 保持不變，身高約 **172 cm**）。六張原圖都標示 `HEIGHT 175 CM`；Owner 明確決定：「維持172，圖就不管了，直接啟用。」此 override 僅接受原圖內嵌身高標示，**不把角色身高改為 175 cm**，也不修改 PNG。CG planning／人物尺度仍以 canonical **172 cm** 為準。

圖片 authority：`content/assets/character-reference-packs.json` 的 `shen_yingxue` + `content/assets/source-catalog.json`。入庫與 override 證據：`content/assets/ingest-receipts/shen-yingxue-reference-pack-20261003.json`。所有原圖均為 `image/png`、1672 × 941，未裁切或重採樣；路徑前綴為 `assets-src/references/shen-yingxue/`。

| Upload | Repository filename | Source ID | Role / authority |
| --- | --- | --- | --- |
| `SYX-1.png` | `syx-ref-01-face.png` | `ref.shen_yingxue.face.01` | `primary_face_identity` / highest facial authority |
| `SYX-2.png` | `syx-ref-02-expression.png` | `ref.shen_yingxue.expression.02` | `expression` / acting |
| `SYX-3.png` | `syx-ref-03-body.png` | `ref.shen_yingxue.body.03` | `body_proportions` / body authority, canonical height 172 cm |
| `SYX-4.png` | `syx-ref-04-production.png` | `ref.shen_yingxue.production.04` | `production_consistency` / technical reference |
| `SYX-5.png` | `syx-ref-05-wardrobe-a.png` | `ref.shen_yingxue.wardrobe.a` | `wardrobe` / Work & Public Wardrobe |
| `SYX-6.png` | `syx-ref-06-wardrobe-b.png` | `ref.shen_yingxue.wardrobe.b` | `wardrobe` / Private & Leisure Wardrobe |

Wardrobe keys follow the supplied sheet labels:

| Key | Exact sheet look |
| --- | --- |
| `SYX-WARDROBE-A-STRATEGY-WORK` | Strategy Work |
| `SYX-WARDROBE-A-CLIENT-FORMAL-DAY` | Client / Formal Day |
| `SYX-WARDROBE-A-CITY-EVENING` | City / Evening |
| `SYX-WARDROBE-A-CAFE-WEEKEND` | Café / Weekend |
| `SYX-WARDROBE-B-LEISURE-CAFE` | Leisure / Café |
| `SYX-WARDROBE-B-WORKOUT-GYM` | Workout / Gym |
| `SYX-WARDROBE-B-HOME-LOUNGE` | Home / Lounge |
| `SYX-WARDROBE-B-QUIET-EVENING-SLEEPWEAR` | Quiet Evening / Sleepwear |

~~~sh
npm run cg:references -- --character shen_yingxue --wardrobe SYX-WARDROBE-A-STRATEGY-WORK --body
~~~

---

# 5. Reference priority contract

## 5.1 Never use all references indiscriminately

更多 reference 不一定更穩。

Default CG reference stack：

~~~text
1. ref-01-face          ALWAYS
2. ref-04-production    USUALLY
3. relevant wardrobe    ALWAYS when outfit matters
4. ref-02-expression    only when expression is important
5. ref-03-body          only for full-body / leg / scale-sensitive shots
~~~

典型 single-character event CG：

~~~text
3 images:
ref-01-face
ref-04-production
ref-05 OR ref-06 wardrobe
~~~

Expression-critical close-up：

~~~text
4 images:
ref-01-face
ref-02-expression
ref-04-production
relevant wardrobe
~~~

Full-body / leg-focused CG：

~~~text
4 images:
ref-01-face
ref-03-body
ref-04-production
relevant wardrobe
~~~

Shared two-heroine CG 若 generator reference 上限較低：

~~~text
minimum 4:
XT ref-01 + relevant XT wardrobe
JYC ref-01 + relevant JYC wardrobe

preferred 6:
再加入 XT ref-04 + JYC ref-04
~~~

## 5.2 Machine selection and enforcement

Before releasing a new base render entry, select the visible character's references with:

~~~sh
npm run cg:references -- --character xu_tang --wardrobe XT-WARDROBE-A-WEEKDAY-NEIGHBOR
npm run cg:references -- --character jiang_yucheng --wardrobe JYC-WARDROBE-B-CUTE-DATE --expression --body
~~~

The selector returns `reference_requirements`, `reference_bindings`, and transport `attachments`; copy them into the canonical entry before its review. It selects face + production consistency + exactly the wardrobe sheet owning the requested look, with expression/body only when requested. The registry records the exact look within each sheet; the planner projects outfit details into the entry's `wardrobe_key` and render constraints rather than treating all four looks as interchangeable.

New base entries default to face + production + wardrobe. `reference_requirements.expression` and `body_proportions` declare additional shot needs. Full-body/long-shot camera values also require the body sheet. Omitting production consistency requires `production_consistency: false` and a non-empty `production_omission_reason`. Manifest validation blocks wrong character/role/filename, wrong A/B wardrobe, missing or unnecessary sheets and duplicate bindings. Render transport must match the declared images exactly; adapters do not silently add references after manifest approval.

Accepted entries retain their original render bindings as provenance. COM-01B's stale `render_ready` metadata is corrected to `accepted` against its existing Gate 3 accepted receipt, without changing render fields. New reaction/sequence edits inherit the accepted base; additional identity/acting references must be explicitly declared and attached. This restoration does not imply that previously rendered CGs used the newly recovered sheets.

## 5.3 Authority conflict

若 references 彼此看起來略有差異：

1. Face identity → `ref-01`
2. Body proportion → `ref-03`
3. Hair mechanics / hands / recurring props → `ref-04`
4. Outfit → `ref-05/ref-06`
5. Expression style → `ref-02`

**不可讓 wardrobe sheet 覆蓋 primary face identity。**

---

# 6. CG generation reference transport contract

Canonical CG Manifest 的 `reference_transport.attachments[]` 指定 generation 必須收到的 image inputs。取得方式由 `Execution Adapter` 決定，不是角色 reference pack 的設計決策：

1. `chat_manual`：依 source catalog 的 repository-relative path 取得 entry 指定的圖，並在 fresh image-generation chat 附上；worker 逐張確認 pixels、role、filename、MIME 與 SHA-256。
2. `work_batch`：依 source catalog 的 repository-relative path 取得 entry 指定的 files；逐張確認 pixels、role、filename、MIME 與 SHA-256 後送進 generation call。
3. `api`：未來 executor 以相同 bindings 提供 image inputs，並留下實際使用的來源紀錄。

任何 adapter 遇到缺失、錯誤或 unrelated images 都須 `BLOCKED`。只知道 path、hash 或檔名，不算已把像素送進 generation。每個獨立 image task 只生成一張 candidate；previous generated CG 不可取代新 base CG 的 canonical identity refs。

Reaction CG / close continuity variant 優先以 Accepted Base 作 edit target；executor 依 adapter 從 repository catalog 提供這張 base。只有 manifest 明列時，才另外加入 identity/wardrobe refs。

每次 generation 輸出仍須經 Visual Review 確認 image quality 與 continuity。Generation reference files retain their source PNG/JPEG formats; accepted runtime CG/background bases use their repository WebP objects.

---

# 7. Six-sheet Gold Standard for future characters

每個 production heroine / romanceable adult character 都應建立相同 6-sheet pack。

## Sheet 01 — Face Identity Turnaround

目的：primary identity anchor。

必須：

- front
- left 30°
- left 45°
- left profile
- right 30°
- right 45°
- right profile
- back hair
- eye / nose / lips / ear / hair / skin detail

控制：

- same neutral expression
- same hair
- same makeup
- same lighting
- same focal length
- same face proportions

## Sheet 02 — Strict Expression Sheet

建議 12 expressions。

必須盡量保持：

- same camera
- same head angle
- same shoulder placement
- same hair
- same lighting

表情應根據角色 personality 客製，而不是每人完全相同。

## Sheet 03 — Full-body Proportion Turnaround

必須：

- front
- 3/4 front
- side
- back
- 3/4 back
- height scale
- simple neutral fitted clothes

目的：

- height
- head-to-body ratio
- shoulder
- torso
- waist/hip
- leg length
- silhouette

## Sheet 04 — Production Consistency

固定五區：

A. hair construction  
B. hands / recurring props  
C. accessories / daily items  
D. characteristic body language  
E. same-identity lighting check

至少測：

- neutral studio
- warm indoor
- cool/night

## Sheet 05 — Canonical Wardrobe A

4 套前中期高頻 outfit。

必須由角色生活與 route 決定，不使用固定模板硬套。

## Sheet 06 — Canonical Wardrobe B

4 套中後期／ending／after-story outfit。

可包含更有 fan-service / relationship reward 的造型，但要保持角色本人的 design language。

---

# 8. Reusable master prompt template

以下 prompt 用於未來新增角色。方括號內容必須先由角色 spec 填實，不得留空讓模型自由發明。

~~~text
請根據我提供的現有角色 identity reference，製作一套完整、整齊、可供後續大量 AI 生圖鎖定 identity 的 production-grade character reference pack。

角色：
- 名稱：[CHARACTER_NAME / ENGLISH_NAME]
- 年齡：[ADULT_AGE]
- 身高：[HEIGHT_CM]
- 身材與比例：[BODY_DESCRIPTION]
- 職業／生活身份：[ROLE]
- 核心氣質：[PERSONALITY_VISUAL]
- 臉部特徵：[FACE_DESCRIPTION]
- 髮型：[HAIR]
- 妝容：[MAKEUP]
- 固定 accessory：[SIGNATURE_ACCESSORIES]
- 色彩 palette：[PALETTE]
- wardrobe philosophy：[WARDROBE_DIRECTION]
- 必須保留的既有 visual continuity：[LOCKED_CONTINUITY]
- 禁止漂移方向：[DO_NOT_DRIFT]

最高優先要求：
1. 所有頁面必須是完全同一個成年人。
2. Primary identity reference 決定頭骨、臉型、眼型、眼距、鼻型、嘴型、下頜與整體年齡感。
3. 其他 references 只能補充表情、身體、髮型、服裝、道具；不得重新設計臉。
4. 統一 neutral studio reference-sheet visual language。
5. Identity consistency > 單張華麗程度。

請輸出 6 張獨立圖片：

PAGE 1 — [slug]-ref-01-face.png
FACE IDENTITY TURNAROUND
front / L30 / L45 / L profile / R30 / R45 / R profile / back hair
+ eye/nose/lip/ear/hair/skin detail crops
same neutral expression, same lighting, same styling.

PAGE 2 — [slug]-ref-02-expression.png
STRICT EXPRESSION SHEET
12 personality-specific expressions.
Keep camera/head/shoulder/hair/light as fixed as practical.
Only facial acting should change.

PAGE 3 — [slug]-ref-03-body.png
FULL BODY PROPORTION TURNAROUND
front / 3/4 / side / back / 3/4 back
height scale, neutral fitted clothing, natural standing pose.
Lock head-to-body ratio and body silhouette.

PAGE 4 — [slug]-ref-04-production.png
PRODUCTION CONSISTENCY
A hair construction
B hands / props
C accessories / daily items
D characteristic body language
E same-identity lighting: neutral / warm indoor / cool night

PAGE 5 — [slug]-ref-05-wardrobe-a.png
CANONICAL WARDROBE A
4 early/mid-game outfits:
[OUTFIT_A1]
[OUTFIT_A2]
[OUTFIT_A3]
[OUTFIT_A4]
Each outfit includes full-body main view + useful material/shoe/prop details.

PAGE 6 — [slug]-ref-06-wardrobe-b.png
CANONICAL WARDROBE B
4 late/ending/after-story outfits:
[OUTFIT_B1]
[OUTFIT_B2]
[OUTFIT_B3]
[OUTFIT_B4]

Global:
no identity drift
no age drift
no body proportion drift
no random hairstyle length changes
no random accessory changes
no broken hands
no unrelated fashion redesign
all pages clearly depict the same established adult character
~~~

---

# 9. QA acceptance checklist

一套 reference pack 只有全部通過才可設 canonical：

- [ ] 01 各角度可辨識為同一張臉
- [ ] 02 表情變化未造成 identity drift
- [ ] 03 身高／比例和 character spec 相符
- [ ] 04 髮型 construction 可重建
- [ ] 04 hands / props 足夠支援 route
- [ ] 04 warm/cool/neutral light 都維持 identity
- [ ] 05/06 outfit 仍像同一角色，而不是八個模特
- [ ] wardrobe 覆蓋早期、約會、工作/興趣、ending/after-story
- [ ] canonical signature element 一致
- [ ] filenames 完全符合 `<slug>-ref-01..06-*.png`
- [ ] Repository-relative source paths and immutable hashes are recorded in the catalog and manifest
- [ ] 後續 CG prompt 有明確 reference selection，不只寫「保持角色一致」

許棠與江雨澄均有上述 reference-pack QA 通過紀錄；當前本地可用影像仍以第 2–4 節為準。
