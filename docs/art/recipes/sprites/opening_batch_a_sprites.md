# Opening / Vertical Slice — Batch A Sprite Recipe

> 狀態：**production candidate complete**
>
> 日期：2026-09-23
>
> 範圍：Opening / Vertical Slice 最小可用集，共 4 個 sprite set、10 個可重複使用的 expression assets。

## 1. Authority 與共通規格

- Identity、body、production detail 與 wardrobe authority 均來自 `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` 記錄的 canonical 6-sheet reference pack。
- Outfit 以 approved wardrobe sheet 為最終 authority；若 `PROTOTYPE_ART_REQUIREMENTS.md` 的舊 prose 與 wardrobe sheet 不同，以 wardrobe sheet 為準。
- 每次生成均重新載入該角色的 canonical references；任何上一張生成圖只可協助 continuity，不可單獨作為 identity source。
- 輸出為透明背景、直式 1024 × 1536 RGBA master；runtime 以 WebP（保留 alpha）交付。
- 全組固定相同臉型、眼型、鼻唇比例、髮色、髮際線、身高感及骨架比例。不得因表情或 outfit 換臉。
- 角色需為明確成年女性：許棠 27 歲、約 170 cm；江雨澄 23 歲、約 160 cm、纖細小骨架、腿相對偏長，不幼女化。
- 構圖保留髮頂、鞋底與輪廓 padding；避免裁切手、鞋、包袋或 tablet。姿態保持對話立繪可重複使用，不做單一劇情限定的誇張演出。
- Negative constraints：no text, no logo, no watermark, no environment, no extra person, no duplicate limb, no fused fingers, no broken prop, no face drift, no wardrobe redesign, no exaggerated anime expression, no pin-up pose。

### Canonical reference stack

| Character | References used | Authority |
|---|---|---|
| 許棠 / Xu Tang | `xt-ref-01-face.png` (`1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS`), `xt-ref-02-expression.png` (`19kDLngndmnc4eT4EzdxTpjCUwiMo7M3T`), `xt-ref-03-body.png` (`1iqAzlOSU7shHNrrntNhqWytWyqSWjVPl`), `xt-ref-04-production.png` (`1dTvm8uC5m2jaq8OUDDzaloOUrzeWBHIx`), `xt-ref-05-wardrobe-a.png` (`1W4t7ICYHx3obH_S03BEyD80ykzy3M9aF`) | face > body > production > wardrobe > expression |
| 江雨澄 / Jiang Yucheng | `jyc-ref-01-face.png` (`13AI1sD0iUm6NpMBnVtlK8Zl5PN0UPsMQ`), `jyc-ref-02-expression.png` (`1uiyGTWLqnjsdtTOHalEwfyooy-_-1Xkz`), `jyc-ref-03-body.png` (`1OfAOJTafTrfMzljAGa3KsOGLOPXggw8j`), `jyc-ref-04-production.png` (`10EH0fmMV0UzFED2-tnf62TYOJexJQK4_`), `jyc-ref-05-wardrobe-a.png` (`1FqxmDU0BqzAb6AFmZfebcx6NUaKCUw-A`) | face > body > production > wardrobe > expression |

## 2. XT-SPR-WEEKDAY

- **asset id**：`XT-SPR-WEEKDAY`
- **character**：許棠 / Xu Tang
- **canonical references used**：XT ref-01 face、ref-02 expression、ref-03 body、ref-04 production、ref-05 Wardrobe A。
- **wardrobe source**：XT Wardrobe A / Look 01 — Weekday Neighbor。奶油色羅紋 V 領排扣 cardigan、灰褐高腰寬褲、黑色 loafers、小型黑色肩背包、大型金色 hoop earrings。不得改用舊 prose 的霧藍上衣版本。
- **framing**：3/4-to-full body；透明直式 canvas；完整保留鞋與肩背包輪廓。
- **pose direction**：身體輕微左 3/4，重心自然落在單側；肩背包作為固定 silhouette cue；雙手放鬆，保留 VN dialogue 的正面可讀性。
- **expression set**：
  - `neutral`：平靜、成熟、可作任何日常對話底圖。
  - `observant`：視線稍集中、正在判斷狀況，不顯得冷酷。
  - `polite-soft`：克制而真誠的小幅微笑，不露齒或只極輕微露齒。
- **narrative usage**：`COM-00`、`COM-01X`、`COM-03X`、`SH-01`、一般 17 樓鄰居場景；三張可覆蓋初見、觀察、禮貌回應。
- **final filename convention**：`runtime-public/sprites/xt/xt-spr-weekday-{expression}-v1.webp`
- **delivered files**：
  - `xt-spr-weekday-neutral-v1.webp`
  - `xt-spr-weekday-observant-v1.webp`
  - `xt-spr-weekday-polite-soft-v1.webp`
- **prompt / recipe**：以 XT face 為最高 identity anchor，body sheet 鎖定約 170 cm 的成熟修長比例，production sheet 鎖定長髮、手部與金色 hoop，Wardrobe A Look 01 逐項還原。生成單人透明背景 production sprite，柔和棚拍式中性光、寫實遊戲角色質感、自然站姿。只以眼神、眉毛、嘴角和極小頭部角度區分三個 expression，不改變服裝、身體、相機高度或臉部結構。

## 3. XT-SPR-LATE-CASUAL

- **asset id**：`XT-SPR-LATE-CASUAL`
- **character**：許棠 / Xu Tang
- **canonical references used**：XT ref-01 face、ref-02 expression、ref-03 body、ref-04 production、ref-05 Wardrobe A。
- **wardrobe source**：XT Wardrobe A / Look 02 — Late-night Convenience Store。灰色 V 領長袖居家上衣、灰色抽繩短褲與白色滾邊、白色休閒鞋、米白 tote、大型金色 hoop earrings；此 approved look 覆蓋舊 prose 的 hoodie／長褲描述。
- **framing**：full body production sprite；透明直式 canvas；腿、鞋與 tote 完整入鏡。
- **pose direction**：身體輕微右 3/4，步伐剛停下的放鬆重心；一手固定 tote 肩帶，另一手自然下垂。
- **expression set**：
  - `tired`：深夜疲倦、警覺下降但仍有許棠的成熟克制；不是生病或哭泣。
- **narrative usage**：`COM-02X` 深夜便利店，以及同 outfit 的深夜偶遇 reuse。
- **final filename convention**：`runtime-public/sprites/xt/xt-spr-late-casual-{expression}-v1.webp`
- **delivered file**：`xt-spr-late-casual-tired-v1.webp`
- **prompt / recipe**：使用 XT 四項 identity/body/production/expression authority 與 Wardrobe A Look 02。完整還原灰色居家套裝、白鞋、tote 與 hoop earrings；以較柔和、近素顏妝感和微垂眼神表現疲倦。保持自然腿型與身高感，最終修訂版僅將腿部線條收細少量，其餘臉、衣服、姿勢、道具、光線與構圖不變。避免性感化、誇張睡眼與 pin-up 姿勢。

## 4. JYC-SPR-CAMPUS

- **asset id**：`JYC-SPR-CAMPUS`
- **character**：江雨澄 / Jiang Yucheng
- **canonical references used**：JYC ref-01 face、ref-02 expression、ref-03 body、ref-04 production、ref-05 Wardrobe A。
- **wardrobe source**：JYC Wardrobe A / Look 01 — Campus / Graduate Student。象牙白 cable-knit cardigan、白色有領襯衫與棕灰 ribbon bow、深棕格紋百褶裙、白色過膝襪、棕色厚底 loafers、肩背包與小型 plush charm。依 canonical sheet 呈現為 23 歲研究生造型，不作幼態制服化。
- **framing**：full body production sprite；透明直式 canvas；襪裝、鞋、包袋與 charm 完整可讀。
- **pose direction**：接近正面、微右 3/4；肩線稍收、重心克制，保留慢熱性格但不縮成兒童姿態。
- **expression set**：
  - `neutral-guarded`：安靜、有禮但仍保持距離。
  - `shy-polite`：輕微靦腆的禮貌笑，情緒幅度小。
  - `curious-glance`：眼神側移、被有興趣的事物吸引，適合初遇與 ACG 話題前奏。
- **narrative usage**：`COM-01J` 地下街初遇、一般初期互動；三張覆蓋防備、禮貌與興趣萌芽。
- **final filename convention**：`runtime-public/sprites/jyc/jyc-spr-campus-{expression}-v1.webp`
- **delivered files**：
  - `jyc-spr-campus-neutral-guarded-v1.webp`
  - `jyc-spr-campus-shy-polite-v1.webp`
  - `jyc-spr-campus-curious-glance-v1.webp`
- **prompt / recipe**：以 JYC face 鎖定茶褐短波浪、小瓜子臉與成年女性五官，body sheet 鎖定約 160 cm、纖細小骨架與偏長腿比例，production sheet 鎖定髮絲、手與包袋處理，Wardrobe A Look 01 逐項還原。透明背景、自然站姿、安靜的 production lighting。三張只調整眼神、眉形、嘴角與極小頭部角度，不改變身體、鏡位、衣著或年齡感。

## 5. JYC-SPR-CAFE

- **asset id**：`JYC-SPR-CAFE`
- **character**：江雨澄 / Jiang Yucheng
- **canonical references used**：JYC ref-01 face、ref-02 expression、ref-03 body、ref-04 production、ref-05 Wardrobe A。
- **wardrobe source**：JYC Wardrobe A / Look 02 — Café / Creator。灰粉／dusty-mauve 露肩羅紋針織上衣與肩部蝴蝶結、黑色裙、半透明黑絲襪、黑色厚底 loafers；固定 props 為 tablet + stylus。此 approved look 覆蓋舊 prose 的 cardigan／長裙描述。
- **framing**：3/4-to-full body；透明直式 canvas；tablet、stylus、絲襪與鞋保持完整或清楚可辨。
- **pose direction**：身體微左 3/4，tablet 穩定托在胸腹前、stylus 為自然工作握法；表情需在道具存在時仍清楚可讀。
- **expression set**：
  - `focused`：專注畫圖、視線落在 tablet，可作安靜工作底圖。
  - `surprised-look-up`：被叫到後抬眼，驚訝幅度克制，不張大嘴。
  - `reserved-interest`：願意繼續交流但仍慢熱，微小興趣與警戒並存。
- **narrative usage**：`COM-02J` 車站咖啡店重逢；三張構成 drawing → 被注意 → 願意交談的完整小段落，也可重用於後續 creator/cafe 對話。
- **final filename convention**：`runtime-public/sprites/jyc/jyc-spr-cafe-{expression}-v1.webp`
- **delivered files**：
  - `jyc-spr-cafe-focused-v1.webp`
  - `jyc-spr-cafe-surprised-look-up-v1.webp`
  - `jyc-spr-cafe-reserved-interest-v1.webp`
- **prompt / recipe**：使用 JYC canonical face/body/production/expression stack 與 Wardrobe A Look 02。逐項鎖定灰粉針織、黑裙、半透明黑絲襪、厚底 loafers、tablet 與 stylus。道具手勢需可信：手指數量正確、stylus 不穿手、tablet 透視不扭曲。表情以 creator 工作狀態為核心，只改變視線、眉眼、嘴角及微小抬頭角度，維持同一 identity、outfit、身體和鏡位。

## 6. Runtime 與 source 檔案

- Runtime WebP：`runtime-public/sprites/xt/`、`runtime-public/sprites/jyc/`
- Local lossless masters：`assets-src/characters/opening-batch-a/*-master.png`
- Google Drive：`runtime-public/sprites/xt` 4 張、`runtime-public/sprites/jyc` 6 張；檔名與本文件 delivered files 一致。
- Alpha QA：10 張 WebP 均保留透明背景；尺寸均為 1024 × 1536。

## 7. Deferred follow-up

本批先完成 opening 真正使用的最小集。下列內容尚未生成：

- `JYC-SPR-ACG`：建議下一批先做 `excited`、`nerd-focus`、`talking-fast`。
- `JYC-SPR-GAMING`：建議下一批先做 `guest-mode-stiff`、`relaxed`、`competitive`。
- `XT-SPR-LATE-CASUAL` 後續可補 `caught-off-guard`、`small-smile`、`teasing`、`sleepy-annoyed`。
- 四個已完成 set 若進入完整 route production，再依 canonical requirements 擴充其餘 expression，不用重畫已穩定的 body/outfit base。

## 8. Narrative source note

本次製作依 `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` 與 `PROTOTYPE_ART_REQUIREMENTS.md` 的 scene/asset mapping 鎖定 `COM-00` 至 `COM-03` 與 `SH-01` 用途。任務開始時，指定的 `docs/narrative/scenes/vertical-slice/*.md` 在目前 checkout 中不存在，因此未引用不存在的 scene 細節，也未自行補造。
