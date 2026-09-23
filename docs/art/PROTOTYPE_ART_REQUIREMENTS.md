# Prototype Art Requirements

> 狀態：**Canonical prototype art plan / generation input**
>
> 版本：0.5
>
> 更新：2026-09-23
>
> 對應劇情：`docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`
>
> 對應 graph/state：`docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
>
> Character references：`docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`
>
> Opening Vertical Slice CG prompts：`docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md`
>
> 本文件定義雙女主 prototype 所需的 **scene backgrounds、character sprites、special CG**，以及每個 authoring node 的 asset mapping。角色 canonical Drive reference IDs/URLs 以 `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` 為準；後續真正寫入 `content/recipes/assets.json` 時，再補 recipe 尺寸、hash 與 runtime metadata。
>
> 本文件不是說所有圖片都必須一次生成。優先順序以 P0/P1/P2 控制。

---

# 1. Canonical visual assumptions

## 1.1 Mobile-first composition

Canonical runtime 是 9:16。

推薦 master：
- 1080 × 1920 minimum；
- 若生成工具適合更高解析，可先 1440 × 2560 或接近比例，再裁切／縮小；
- runtime 轉 WebP。

所有背景與 CG 必須能提供：
- focal point；
- mobile focus；
- dialogue safe zone；
- crop tolerance；
- face / hand / important object region。

## 1.2 UI safe zone

一般 dialogue 在手機下方，因此：
- 關鍵臉部盡量位於畫面上半部 20–60%；
- 關鍵手部互動避免落在最底 25%；
- 若 CG 的戲劇重點就是手部，需在 Memory / dialogue overlay 指定特殊 safe zone；
- 不要把人物臉長期固定正中央，允許左右構圖以支援文字。

## 1.3 Identity policy

角色 CG / sprites：
- 必須以 canonical identity reference 為第一優先；
- 可使用 expression/outfit sheet 輔助；
- **禁止只拿上一張 CG 當下一張唯一 reference**；
- 同一 heroine 不因場景換臉、換頭骨比例、換眼型。

## 1.4 Xu Tang canonical profile

Canonical story / Character Bible identity 已同步：
- 許棠 **27 歲**；
- 約 **170 cm**；
- 自由接案視覺設計師；
- approved face identity / identity sheet 繼續作為視覺錨點。

年齡與身高的調整不代表換臉；後續新 sprites / CG 必須讓角色呈現成熟的 27 歲都市女性氣質。

## 1.5 Jiang Yucheng identity

江雨澄已有通過 QA 的 canonical 6-sheet identity pack，不可用許棠 reference 演變。完整 Drive manifest 見 `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`。

核心：
- 23 歲成年東亞女性；
- 約 160 cm；
- 纖細、輕盈、小骨架、腿相對偏長；
- 茶褐色短髮／短波浪；
- 小瓜子臉；
- 安靜、慢熱、不是幼女化；
- 霧藍、灰紫、黑、粉灰為主要 palette；
- 穿搭偏年輕 creative casual，但不要把「宅／害羞」等同 infantilized。

---

# 2. Background library

背景原則：**背景盡量無人物**，讓 sprites 可重用。重要 cinematic 才讓人物進 CG。

## BG-APT-17F-DAY — 17樓走廊白天 — P0

現代台北高樓住宅。暖灰牆面、深色住戶門、低調木質／石材細節、柔和間接照明。1702/1703 可有簡潔門牌，但不要像旅館。走廊寬度可信，沒有過度豪宅化。9:16 視角沿走廊略有透視，左右都保留可站全身人物的位置。

用途：COM-03X、RE-X、一般鄰居 scene。

## BG-APT-17F-NIGHT — 17樓走廊夜間 — P0

同一建築夜間版本。室內暖黃壁燈，遠端窗戶／電梯口有冷色城市夜光。安靜、乾淨、有回家感。Ending 要能和 opening 呼應。

用途：XT-11、XT-14、XT-D、SH-01、部分 SHURA 後續。

## BG-APT-17F-RAIN — 雨夜17樓 — P0

同一走廊，但靠近電梯／窗戶處能感覺外部大雨；地面可有微弱濕鞋反光，前景允許放紙箱。不要讓室內真的淋雨。

用途：COM-00 key visual。

## BG-APT-ELEVATOR — 公寓電梯 — P0

深灰金屬＋暖灰石材，暖白頂燈，不要鏡面到充滿錯誤反射。構圖可支援兩人站在不同側。另需 lighting variant：正常／短暫停電手機光。

用途：COM-01X、Distance transition。

## BG-CONVENIENCE-NIGHT — 深夜便利店 — P0

台北住宅區無品牌便利店。冷白室內燈、冷藏櫃、簡單餐食區；窗外是濕潤城市夜景。所有包裝不可有可辨識商標／文字。

用途：COM-02X、JYC ending 飲料前置。

## BG-CAFE-GROUND-DAY — 樓下咖啡店 — P0

大安／信義住宅區小型 cafe。木材、石材、大窗、長桌、插座感；適合兩人長時間各自工作。不要過度網紅店。

用途：XT-05、RE-X、OV/SHURA variant。

## BG-CAFE-STATION — 車站咖啡店 — P0

比樓下 cafe 更有 transit 人流感，但角落安靜。窗邊適合 tablet 畫圖。可以有模糊地下街／商場光線。

用途：COM-02J、RE-J、JYC-F optional。

## BG-ACG-CORRIDOR — 地下街走道 — P0

台北地下商場氛圍：低天花、明亮人工照明、店舖密集、廣告色彩豐富，但所有 IP / 商標完全虛構。中央留步行空間。

用途：JYC-05、COM-01J transitions。

## BG-ACG-SHOP — ACG 設定集／周邊店 — P0

書架、畫冊、模型盒、壓克力展示與少量轉蛋元素。內容不可對應真實作品。視角要能讓角色站在書架前，支援半身與全身 sprite。

用途：COM-01J、JYC-05。

## BG-BOOKSTORE — 中山獨立書店 — P0

暖木書架、藝術／攝影／設計書、自然午後窗光。店面偏窄但舒服，不像大型連鎖。書封不可有可讀真實標題。

用途：XT-04、JYC-06B optional。

## BG-LINJIANG — 夜市 — P0

臨江街風格但不複製真店。暖色攤位燈、蒸氣、人群景深、食物攤，招牌模糊不可讀。9:16 中央留行走縱深；角色上半身不要被招牌吃掉。

用途：XT-06。

## BG-CINEMA-LOBBY — 都市電影院 — P1

信義商圈風格 multiplex lobby。夜間、玻璃、燈箱、虛構電影海報。主要用作短轉場，不值得過度投入。

用途：XT-07。

## BG-MRT-CAR-NIGHT — 夜間捷運車廂 — P0

台北捷運語彙但無 logo。晚間較空，金屬扶桿、座椅、窗戶可產生反射。畫面重點是兩人距離與窗影。

用途：XT-07、JYC-09、JYC-13。

## BG-MRT-PLATFORM-NIGHT — 捷運月台／出口 — P1

夜晚人流較少，冷白公共照明，出口外有城市雨光。可銜接 JYC ending。

## BG-RIVERSIDE-DUSK — 河濱黃昏 — P0

台北河濱步道，遠處城市燈與橋／住宅輪廓，不需著名地標。天色從暖轉藍，風感明顯，適合長談。

用途：XT-08。

## BG-PC-HOME-LIVING — 男主家客廳 — P0

31 歲科技從業者、收入不差，但不要霸總。乾淨簡約、工作桌、螢幕、遊戲設備、沙發／地墊、少量搬回台北後逐漸增加的生活物件。初期可稍空，後期稍有生活痕跡。

用途：JYC-06、JYC-07 variant、JYC-10。

## BG-XT-HOME-STUDIO — 許棠家工作室／客廳 — P0

小而舒服的都市 apartment。設計書、色票、printed proofs、tablet、植物、杯子、外套搭椅背；有 deadline 狀態的凌亂但不髒。不能像精心 staged showroom。

用途：XT-09、XT-10、XT-12。

## BG-PRINT-SHOP — 印刷打樣店 — P1

小型專業數位印刷／設計打樣空間。紙張樣本、色票、裁切台、包裝樣品。無品牌。

用途：XT-12 pickup。

## BG-DAYTRIP-ARCADE — 近郊雨天騎樓 — P0

北投／近郊都市步行區。雨天騎樓、小店、溫泉區／舊街的輕微質感即可，不需要明確觀光地標。濕地反射、兩人共傘／臨時改行程很自然。

用途：XT-13。

## BG-CREATOR-EVENT — 中型設計／插畫活動 — P0

文創／插畫展會，中等人流，白色或木質攤位、prints、zines、作品牆。所有 artwork 必須抽象／虛構。走道要有景深，支援三人同框。

用途：SH-02、JYC-09。

## BG-CREATOR-SMALL — 小型 creator gathering — P0

比上一個明顯更小、更安靜。獨立活動空間／社區展間，桌距寬、人少、每桌少量 prints。江雨澄選擇的「安全但真實」難度。

用途：JYC-12。

## BG-RAIN-AWNING-DAY — 雨天騎樓白天 — P1

城市雨天、普通餐館／書店附近、騎樓等雨。不要浪漫化過度。適合 JYC-06B。

## BG-RAIN-AWNING-NIGHT — 雨後騎樓夜間 — P0

捷運出口／普通便利店附近。濕地反射、暖色店光、冷色城市背景，小角落可站或坐。視覺要親密但不是高級約會地點。

用途：JYC-13、JYC-14、JYC-G。

## BG-CASUAL-EATERY — 漢堡／簡餐店 — P1

無壓力、小型連鎖感但無品牌。木桌、托盤、窗邊座位。用於 JYC-06B 普通約會。

## BG-CITY-NIGHT-QUIET — 台北安靜夜路 — P1

住宅／商業混合街道，少量機車、關店招牌、路燈、潮濕空氣。適合 overlap / ending transition。

---

## BG-XT-HOME-NIGHT — 許棠家夜間 couple variant — P1

以 BG-XT-HOME-STUDIO 為同一空間，只改夜間 practical lighting：工作燈、桌燈、窗外城市夜色。桌面可以比 deadline scene 整齊一點，代表關係進入生活後而不是危機中。若 pipeline 支援可靠 lighting variant，可不另產一張完全不同 layout。

用途：XT-AF-01。

## BG-XT-HOME-MORNING — 許棠家／男主家清晨 variant — P1

柔和自然晨光，生活物件、杯子、衣物與充電線等都保持克制，不做 hotel suite。可由既有 interior master 衍生。

用途：XT-AF-02 / XT-AF-03。

## BG-PC-HOME-NIGHT — 男主家夜間 couple variant — P1

以 BG-PC-HOME-LIVING 為同一空間，screen glow + 暖色小燈。Gaming equipment 仍存在，但畫面比 JYC-06 更像已經熟悉的 shared space。

用途：JYC-AF-01。

## BG-PC-HOME-MORNING — 男主家週末早晨 variant — P1

自然晨光、沙發／遊戲設備、兩杯飲料或早餐細節。空間要讓早期 JYC-06 與交往後 JYC-AF-02 能做 before/after 對照。

用途：JYC-AF-02 / JYC-AF-03。

---

# 2.5 Canonical wardrobe mapping

Wardrobe visual authority is the approved Drive pack in `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`.  
If an older prose description below differs from the approved wardrobe sheet, **the approved wardrobe sheet wins** unless a locked scene explicitly defines a variant.

## Xu Tang

| Sprite / use | Canonical wardrobe source |
|---|---|
| XT-SPR-WEEKDAY | XT Wardrobe A / Look 01 Weekday Neighbor |
| XT-SPR-LATE-CASUAL | XT Wardrobe A / Look 02 Late-night Convenience Store |
| XT-SPR-BOOKSTORE | XT Wardrobe A / Look 03 Bookstore / Café Date |
| XT-SPR-NIGHT-MARKET | XT Wardrobe A / Look 04 Weekend / Night Out, or locked scene variant |
| XT-SPR-RIVER-RAIN | XT Wardrobe B / Look 01 Riverside / Rainy Date |
| XT-SPR-HOME-WORK | XT Wardrobe B / Look 02 Work / Deadline Home |
| XT-SPR-CONFLICT | reuse the scene's current canonical outfit; expression changes only |
| XT-SPR-REPAIR-DAYTRIP | XT Wardrobe B / Look 03 Repair / Ending / Serious Date |
| XT-SPR-ENDING | XT Wardrobe B / Look 03 unless locked scene chooses a continuity variant |
| XT-SPR-AFTER-STORY | XT Wardrobe B / Look 04 After Story / Weekend Morning |

## Jiang Yucheng

| Sprite / use | Canonical wardrobe source |
|---|---|
| JYC-SPR-CAMPUS | JYC Wardrobe A / Look 01 Campus / Graduate Student |
| JYC-SPR-CAFE | JYC Wardrobe A / Look 02 Café / Creator |
| JYC-SPR-ACG | JYC Wardrobe A / Look 03 ACG Outing |
| JYC-SPR-GAMING | JYC Wardrobe A / Look 04 Gaming / Home Casual |
| JYC-SPR-CASUAL | choose A Look 01/02 or B Look 01 based on locked scene tone |
| JYC-SPR-ALIAS | reuse current scene outfit; identity/expression change only |
| JYC-SPR-CREATOR | JYC Wardrobe B / Look 02 Creator Event |
| JYC-SPR-CONFLICT | reuse current scene outfit; expression changes only |
| JYC-SPR-CREATOR-TABLE | JYC Wardrobe B / Look 02 Creator Event / small-table variant |
| JYC-SPR-ENDING | JYC Wardrobe B / Look 01 Cute Date or locked continuity variant |
| JYC-SPR-AFTER-STORY | JYC Wardrobe B / Look 04 After Story / Weekend Morning |

This mapping is deliberately semantic: future scene-specific variants may change coat/bag/accessory, but they must still derive from the canonical outfit family rather than invent a new unrelated character design.

---

# 3. Xu Tang sprite sets

所有 Xu sprite 須符合 **27 歲成年女性、約170cm敘事設定**，並保留 approved identity face。

每組至少產出透明背景全身／3/4身 production master；若成本允許，同 outfit 共用身體、表情用 face variants。

## XT-SPR-WEEKDAY — P0

**用途**：COM-00/01X/03X、SH-01、一般17樓。  
**服裝**：低飽和霧藍／暖灰針織或柔軟襯衫，奶油白內搭，象牙／灰褐長褲；簡潔低跟鞋／平底鞋。  
**髮型**：低鬆髮髻或自然長髮低束，臉側碎髮。  
**Expression set**：
- neutral_observant
- polite_smile
- dry_playful
- mild_surprise
- guarded
- soft_goodnight

## XT-SPR-LATE-CASUAL — P0

**用途**：COM-02X、深夜偶遇。  
**服裝**：炭灰 hoodie 或寬鬆 cardigan、白色羅紋上衣、霧藍舒適長褲、休閒鞋。  
**妝髮**：近素顏；隨意低馬尾／抓夾。  
**Expressions**：
- tired
- caught_off_guard
- small_smile
- teasing
- sleepy_annoyed

## XT-SPR-BOOKSTORE — P0

**用途**：XT-04、XT-05 前段。  
**服裝**：霧藍細針織長袖＋象牙白高腰闊腿褲／灰藍中長裙；不過度正式。  
**髮型**：鬆側辮／半束波浪。  
**Expressions**：
- focused_on_book
- interested
- small_smile
- teasing
- blush_subtle

## XT-SPR-WORK — P0

**用途**：XT-05、工作話題。  
**服裝**：可沿用 Bookstore 或更日常的細針織＋長褲。  
**Expressions**：
- concentrated
- frustrated_client
- dry_resignation
- grateful_but_not_saying
- watching_player_work

## XT-SPR-NIGHT-MARKET — P0

**服裝**：靛藍短版牛仔外套敞開、奶油白圓領上衣、炭灰高腰闊腿褲、白色低筒鞋。  
**髮型**：高馬尾／緞帶高馬尾，但不要過度少女。  
**Expressions**：
- bright_smile
- laugh
- competitive
- surprised
- playful_challenge
- blush

## XT-SPR-RIVER-RAIN — P0

**用途**：XT-07/08、XT-13 可部分重用。  
**服裝**：石灰色風衣＋低飽和海軍藍針織裙／長褲＋短靴。  
**髮型**：低馬尾，風中自然髮絲。  
**Expressions**：
- thoughtful
- distant_look
- vulnerable
- soft_smile
- quietly_hurt

## XT-SPR-HOME-WORK — P0

**用途**：XT-09/10/12。  
**服裝**：寬鬆居家針織／白T、柔軟長褲；完整成年居家服，不內衣化。  
**髮型**：抓夾高馬尾／鬆低馬尾。  
**Expressions**：
- focused
- deadline_tired
- frustrated
- embarrassed_mess
- quietly_happy
- asking_for_help

## XT-SPR-CONFLICT — P0

可共用 HOME-WORK 身體，新增：
- closed_off
- restrained_angry
- disappointed
- hurt_but_calm
- emotionally_tired

規則：許棠真正生氣時更平靜，不使用動漫怒臉。

## XT-SPR-REPAIR-DAYTRIP — P0

**服裝**：雨天 casual / 風衣，色彩柔和。  
**Expressions**：
- hesitant
- relieved
- warm
- playful
- sharing_decision
- romantic_soft

## XT-SPR-ENDING — P0

可沿用 day-trip 或 weekday 服裝，新增：
- direct
- nervous_soft
- blush
- mutual_decision
- post_kiss_smile

---

## XT-SPR-AFTER-STORY — P0

**用途**：XT-AF-01 / 02 / 03。  
**方向**：交往後的居家／週末狀態，比 XT-SPR-HOME-WORK 更放鬆，不再是 deadline 服裝。

**Wardrobe variants**
- evening_cozy：柔軟長袖／針織＋完整居家短褲或長褲。
- morning_borrowed：可合理穿男主較大的白襯衫／T-shirt，但必須搭完整居家短褲；不要變成只靠裸露的 pin-up。
- weekend_soft：寬鬆襯衫＋舒適長褲，適合一個月後日常。

**Expressions**
- girlfriend_teasing
- lingering_look
- kiss_afterglow
- sleepy
- no_makeup_smile
- mock_annoyed
- quietly_content

---

# 4. Jiang Yucheng sprite sets

## JYC-SPR-CAMPUS — P0

**用途**：COM-01J、一般初期。  
**服裝**：霧灰藍 oversized knit / sweatshirt、簡單裙或短褲、球鞋、tote。所有造型明確成年研究生，不使用幼態學生制服。  
**髮型**：茶褐短髮／短波浪，耳側自然碎髮。  
**Expressions**：
- neutral_shy
- polite
- hesitant
- small_smile
- surprised
- thinking_before_reply

## JYC-SPR-CAFE — P0

**用途**：COM-02J。  
**服裝**：薄針織外套＋簡單上衣＋長裙／長褲。  
**Props**：tablet + stylus。  
**Expressions**：
- focused_drawing
- caught_drawing
- interested
- talking_about_art
- tiny_laugh

## JYC-SPR-ACG — P0

**用途**：JYC-05。  
**服裝**：無真 IP graphic tee、overshirt / cropped jacket、裙或寬鬆長褲、sneakers、小型 tote。  
**Expressions**：
- excited
- nerd_focus
- talking_fast
- laugh
- teasing
- victorious
- mock_disappointed

## JYC-SPR-GAMING — P0

**用途**：JYC-06。  
**服裝**：寬鬆 hoodie / T-shirt、舒適長褲或中長短褲，不性感化。  
**Expressions**：
- guest_mode_stiff
- relaxed
- competitive
- annoyed_funny
- laugh
- sleepy

## JYC-SPR-CASUAL — P0

**用途**：JYC-06B、RE-J。  
**服裝**：年輕都市 casual，霧紫外套、簡潔內搭、黑／灰裙或長褲。  
**Expressions**：
- quiet
- curious
- unexpectedly_direct
- amused
- asking_real_question

## JYC-SPR-ALIAS — P0

可沿用 cafe/casual body，新增：
- guarded
- nervous
- eyes_away
- embarrassed
- quietly_hurt
- deciding_whether_to_tell

## JYC-SPR-CREATOR — P0

**用途**：SH-02、JYC-09。  
**服裝**：比平常稍整理過的 creative casual；layered top、寬褲／裙、小配件、tote。不是 cosplay。  
**Expressions**：
- anticipating
- freeze
- overwhelmed
- forced_polite
- socially_exhausted

## JYC-SPR-CONFLICT — P0

可重用 CASUAL / CREATOR body：
- defensive
- hurt
- frustrated
- calling_player_out
- quiet_after_argument

## JYC-SPR-CREATOR-TABLE — P0

**用途**：JYC-12。  
**服裝**：保留自己的 creator look，可有一件她真的喜歡的小配件。  
**Expressions**：
- nervous_but_trying
- focused
- small_proud_smile
- relieved
- searching_for_player
- tired_happy

## JYC-SPR-ENDING — P0

**用途**：JYC-13/14。  
**服裝**：creator outfit + 輕外套；夜雨合理。  
**Expressions**：
- socially_drained
- vulnerable
- direct
- awkward_blush
- post_kiss_stunned
- happy_embarrassed

---

## JYC-SPR-AFTER-STORY — P0

**用途**：JYC-AF-01 / 02 / 03。  
**方向**：交往後不再進入「客人模式」，保留年輕 creative casual。

**Wardrobe variants**
- late_gaming：寬鬆 T-shirt / hoodie + 舒適下身。
- morning_borrowed：可穿借來的 oversized hoodie / T-shirt + 完整居家短褲。
- creator_weekend：自己的 casual outfit + tablet / stylus。

**Expressions**
- awkward_flirty
- trying_not_to_blush
- sleepy
- smug_meme_energy
- relaxed_realself
- post_kiss_stunned
- happy_embarrassed

---

# 5. Special CG catalog

CG 分級：
- **P0 Hero/Story CG**：必做。
- **P1 Heart/Reward CG**：強烈建議，提升 Gallery 與戀愛 reward cadence。
- **P2 Optional**：有餘裕再補。

每張均以 9:16 master 為主。若 scene 需要第一人稱，玩家不得突然出現固定臉；可只見手、肩、外套或使用 side-cinematic 不完整露臉。

## Common / Shared CG

### CG-COM-01 — 雨夜搬家 — P0

**Scene**：COM-00。  
**Composition**：17F 雨夜走廊，紙箱形成前景深度。許棠一手扶門／幫挪箱子，人物約在畫面上半右側；左下留 dialogue safe zone。  
**Emotion**：只是自然幫忙，不做命定戀愛眼神。  
**Lighting**：暖色走廊燈 vs 冷藍窗外雨夜。  
**Key**：作品 opening visual，可反覆在 title / Memory 使用。

### CG-COM-02 — 地下街第一次側頭 — P1

**Scene**：COM-01J。  
江雨澄站在設定集架前比較兩本畫冊；聽到玩家對作品的具體評論後，從書上抬眼／側頭。不是驚艷式凝視。背景人工光、人群模糊。

### CG-COM-03 — 深夜便利店 — P1

**Scene**：COM-02X。  
許棠居家 casual，手裡是咖啡與簡單晚餐；冷白便利店光讓她看起來稍疲憊。重點是生活感，不是 sexy convenience-store pinup。

### CG-COM-04 — 咖啡店畫圖 — P1

**Scene**：COM-02J。  
江雨澄靠窗用 tablet 畫到投入，玩家站到桌邊後她才抬頭。Stylus 手勢自然，螢幕內容抽象不可讀。

### CG-SH-01 — 17樓三人第一次同框 — P1

**Scene**：SH-01。  
9:16 走廊。雨澄靠近男主家一側，許棠在自己門前／電梯方向，男主僅以肩／手或第一人稱存在。三人距離自然，沒有怒視。畫面 tension 來自空間配置。

### CG-SH-02 — 同一個創作者活動 — P0

**Scene**：SH-02。  
許棠正在看江雨澄桌上／手中的作品，給具體意見；雨澄一開始拘謹但逐漸專注。男主可在側前景。畫面應讓玩家感覺「她們其實可能聊得來」，反而增加緊張。

### CG-OV-01 — 三人同場 / 誰知道多少 — P1

**Scene**：OV-02。  
咖啡店或活動休息區，三人坐／站在同一空間。不是 catfight；兩位女生各自自然，男主反而是最不自在的人。可用視線方向呈現 asymmetric knowledge。

### CG-SHURA-01 — 撞見 — P0

**Scene**：SHURA-01。  
安靜型修羅場。例：男主和雨澄坐 cafe，許棠取外帶時看見。許棠表情克制、準備離開；雨澄尚未完全理解；男主視角瞬間僵住。不要誇張怒氣、眼淚或指責手勢。

---

## Xu Tang CG

### CG-XT-01 — 書店午後 — P0

**Scene**：XT-04。  
暖木書架與午後側光。許棠側身翻大型設計／攝影畫冊，下巴微收，眼神落在書頁，不要直視鏡頭。畫面要讓玩家因她投入的樣子而覺得好看。

### CG-XT-02 — Parallel Work — P1

**Scene**：XT-05。  
長桌兩個工作區。許棠從 laptop / proofs 抬頭看玩家，桌上兩杯咖啡。背景可見男主筆電邊緣。情緒是「各忙各的也舒服」。

### CG-XT-03 — 夜市回頭 — P0

**Scene**：XT-06。  
許棠拿小吃走在前方半步，轉頭催玩家跟上。暖色攤燈、蒸氣、人群虛化。動態抓拍感，頭髮／外套有步行動勢。

### CG-XT-04 — 攤位贏獎品 — P1

**Scene**：XT-06 optional reward。  
她剛意外贏下普通小獎品，笑得比平常明顯。不要擺拍，不要直接對鏡頭比 V。玩家可只見伸手接獎品。

### CG-XT-05 — 末班捷運窗影 — P1

**Scene**：XT-07。  
兩人坐得很近但沒碰。主要看許棠側臉與窗上倒影；玩家肩膀可在前景。城市／隧道光帶過。強曖昧但沒有接吻。

### CG-XT-06 — 河濱 vulnerability — P0

**Scene**：XT-08。  
她坐河邊／靠欄杆，視線在遠方城市，不看玩家。風帶動長髮與風衣。表情不是哭，而是安靜、稍微疲憊與坦白。

### CG-XT-07 — 工作室日常 — P0

**Scene**：XT-09。  
許棠盤腿或自然坐在工作桌前，印刷樣本、色票、外送晚餐。頭髮隨意收起。玩家可只見另一台 laptop / 手。這張應有強「進入她真正生活」的 domestic intimacy。

### CG-XT-08 — Conflict / 關閉 — P0

**Scene**：XT-10。  
許棠在工作桌或自己門邊。沒有大吵，肩膀與視線變得封閉，頭部略轉開。燈光仍日常，正因沒有戲劇化才痛。

### CG-XT-09 — 接過印刷樣本 — P1

**Scene**：XT-12。  
她從玩家手中接過樣本袋／紙包，兩人手同時碰在包裝邊緣；她先看物件，再抬眼。情緒是 hesitation + relief，不是告白。

### CG-XT-10 — 雨中小旅行 — P0

**Scene**：XT-13。  
近郊雨天騎樓／共傘。原行程改變後兩人並肩決定下一步。可以讓她把傘稍微偏向男主，象徵共享而非依賴。濕地反光、自然街景。

### CG-XT-11 — 17樓 First Kiss — P0 Hero

**Scene**：XT-14 / XT-G。  
同 opening 走廊。構圖呼應 CG-COM-01，但紙箱消失、人物距離消失。第一人稱近景或 side cinematic；互相靠近、自然閉眼／停頓，不做 wedding-photo posture。手部若入鏡要克制：手臂／袖口／肩頸即可。

### CG-XT-AF-01 — 今晚不用回隔壁 — P0 Reward

**Scene**：XT-AF-01。  
許棠家／男主家夜間。兩人已是戀人，從沙發／門口自然延續到更長的吻與擁抱；人物距離明顯比 XT-G 更放鬆。構圖重點是她也主動靠近／拉住袖口或衣領，呈現 reciprocity，不做單向被觀看的 pin-up。

**SFW framing**：完整衣著或自然居家服，親密但不露骨；可作 fade-to-black 前最後一張。

### CG-XT-AF-M1 — Mature intimacy extension — FULL ONLY

**Scene**：XT-AF-01 / 02 profile-gated extension。  
此 asset slot 僅存在於 `full` profile。General art plan 只固定：
- 成年、互相同意的 established couple；
- identity / body consistency；
- private interior continuity；
- 角色有主動性與互動感；
- 不得讓 mature CG 成為理解角色弧線的唯一資訊。

具體成人向構圖在 mature-content authoring 時另行定義；`sfw` build 不保留 locked placeholder。

### CG-XT-AF-02 — 星期日早晨 — P0 Reward

**Scene**：XT-AF-02。  
柔和晨光。許棠散髮／鬆亂低馬尾、近素顏，穿自己的 cozy outfit 或借來的 oversized shirt/T-shirt + 完整居家短褲。她拿咖啡、靠在門框／沙發邊，神情是已經把男主當生活一部分的自然熟悉。可有從背後短暫抱住、靠肩或晨吻的 variant。

### CG-XT-AF-03 — 一個月後：留位置 — P1 Reward

**Scene**：XT-AF-03。  
兩人各自工作或準備出門，同一畫面有彼此常用物件：她的咖啡／充電線、他的杯子／外套，但沒有搬家式合併。重點是「獨立生活裡出現固定位置」。

### CG-XT-FC-01 — Friend Coda Coffee — P2

**Scene**：XT-FC。  
兩人樓下 cafe，各自有工作物，聊天自在但構圖不做 couple intimacy。若 production scope 要縮可不用。

---

## Jiang Yucheng CG

### CG-JYC-01 — ACG 主場 — P0

**Scene**：JYC-05。  
她抱著設定集／少量戰利品走在前面，回頭快速講話。眼神亮、手勢自然。和平常安靜 sprite 形成強反差。

### CG-JYC-02 — 小周邊 reward — P1

**Scene**：JYC-05 optional。  
兩人一起看剛抽到的虛構周邊；她露出得意／不甘心的真實反應。不要幼態化。

### CG-JYC-03 — Gaming Night — P0

**Scene**：JYC-06。  
男主家，screen glow。她抱靠枕／盤腿坐或自然蜷在沙發一側，完全 relaxed；控制器或 keyboard 正確。零食、飲料有生活感。玩家只露手／控制器即可。

### CG-JYC-04A — 雨天普通約會 — P1

**Scene**：JYC-06B。  
兩人在普通漢堡店／騎樓等雨。沒有 ACG props。她托著飲料或看街雨，突然認真問男主「你為什麼回來？」。這張的價值是證明她不只是一個 fandom heroine。

### CG-JYC-04 — Alias Reveal — P0

**Scene**：JYC-07。  
tablet／手機在前景，作品縮圖抽象。她一隻手停在螢幕上，視線沒有完全看玩家，像正在決定要不要承認。空氣比表情更重要。

### CG-JYC-05 — Too Many Eyes — P0

**Scene**：JYC-09。  
中型活動，人群景深外。一個熟悉 creator 正在遲疑辨認她。雨澄身體僵住、手抓 tote／sketchbook，沒有誇張驚恐。

### CG-JYC-06 — MRT Social Battery 0% — P1

**Scene**：JYC-09。  
回程捷運。她靠窗／椅背，整個人沒電，視線低下；玩家在旁但不強行安慰。這張要漂亮但不 posing。

### CG-JYC-07 — Small Creator Table — P0

**Scene**：JYC-12。  
她第一次坐在自己的小桌後，桌上少量 prints/zines。雙手整理物件，緊張但確實在做。周圍人不多。

### CG-JYC-08 — Across the Room — P0 Heart

**Scene**：JYC-12。  
玩家照她要求沒有守在旁邊，從較遠處看她自己和訪客說話。她抬頭在人群中找到玩家，露出非常小但明顯安心的笑。這是 route 最重要的非 kiss reward CG 之一。

### CG-JYC-09 — Rainy First Kiss — P0 Hero

**Scene**：JYC-14 / JYC-G。  
雨後騎樓／捷運出口，濕地反光、暖色便利店燈。她有點緊張但沒有後退，甚至由她先停下／靠近半步。第一人稱或 side cinematic。氛圍年輕、笨拙、城市夜晚。

### CG-JYC-AF-01 — 最後一班車之後 — P0 Reward

**Scene**：JYC-AF-01。  
男主家夜間 gaming。遊戲已停，她和玩家距離比 JYC-06 明顯靠近；可以是她放下 controller 後仍坐在旁邊、先抓住玩家袖口／靠過去，進入更長的吻。保留一點 nervous laugh，不能讓她變成完全被成熟男主主導。

**SFW framing**：居家衣著完整，親密但不露骨，作 fade-to-black 前 key art。

### CG-JYC-AF-M1 — Mature intimacy extension — FULL ONLY

**Scene**：JYC-AF-01 / 02 profile-gated extension。  
僅 `full` profile。General constraints：
- 23 歲成年女性 + 31 歲成年男主；
- established relationship；
- mutual consent 明確；
- 雨澄仍有主動選擇與節奏；
- 不把害羞誤寫成拒絕。

具體成人向構圖另由 mature-content source 定義；`sfw` build 完全 prune。

### CG-JYC-AF-02 — 不用切換帳號 — P0 Reward

**Scene**：JYC-AF-02。  
週末早晨。她頭髮睡亂、穿 borrowed oversized hoodie/T-shirt + 完整居家短褲，坐在沙發上搶 controller 或明明在旁邊還傳 meme 給玩家。表情是她 online persona 已自然出現在現實。Cozy fan-service，比裸露更重要的是「她毫無客人模式」。

### CG-JYC-AF-03 — 公開前先給你看 — P1 Reward

**Scene**：JYC-AF-03。  
咖啡店或男主家，她在畫準備公開的新作品，男主在旁工作／做自己的事。她把 tablet 稍微轉向玩家。和 XT parallel life 有視覺呼應，但這邊保留 screen/tablet/young creative atmosphere。

### CG-JYC-FC-01 — Friend Coda / First Look — P2

**Scene**：JYC-FC。  
她把新作品轉向玩家看，沒有 kiss/couple framing。若 scope 緊可用 UI 取代。

---

# 6. Per-node asset matrix

此表保證 **每個 authoring node 都有 art decision**。  
「reuse」代表不要因此新增圖片。

| Node | Background | Sprite | Special CG | Notes |
|---|---|---|---|---|
| COM-00 | BG-APT-17F-RAIN | XT-SPR-WEEKDAY | CG-COM-01 P0 | Opening key visual |
| COM-01X | BG-APT-ELEVATOR | XT-SPR-WEEKDAY | optional elevator close P2 | 可只立繪 |
| COM-01J | BG-ACG-SHOP | JYC-SPR-CAMPUS | CG-COM-02 P1 | 初遇 |
| COM-02X | BG-CONVENIENCE-NIGHT | XT-SPR-LATE-CASUAL | CG-COM-03 P1 | 日常 reward |
| COM-02J | BG-CAFE-STATION | JYC-SPR-CAFE | CG-COM-04 P1 | tablet 必須自然 |
| COM-03X | BG-APT-17F-DAY/NIGHT | XT-SPR-WEEKDAY | none | reuse |
| COM-03J | chat UI | JYC avatar/campus | none | UI scene |
| COM-03M | chat montage UI | avatars | none | no new art |
| OPEN-A | UI / Memory scheduler | none | none | 不玩家-facing 工程名 |
| XT-04 | BG-BOOKSTORE | XT-SPR-BOOKSTORE | CG-XT-01 P0 | |
| XT-05 | BG-CAFE-GROUND-DAY | XT-SPR-WORK | CG-XT-02 P1 | 男主 incident 同 scene |
| JYC-05 | BG-ACG-CORRIDOR/SHOP | JYC-SPR-ACG | CG-JYC-01 P0 + 02 P1 | |
| JYC-06 | BG-PC-HOME-LIVING | JYC-SPR-GAMING | CG-JYC-03 P0 | |
| SH-01 | BG-APT-17F-NIGHT | XT-WEEKDAY + JYC-CASUAL | CG-SH-01 P1 | 三人同框 |
| OPEN-B | UI | none | none | |
| XT-06 | BG-LINJIANG | XT-SPR-NIGHT-MARKET | CG-XT-03 P0 + 04 P1 | |
| XT-07 | BG-CINEMA + BG-MRT | XT-SPR-RIVER-RAIN | CG-XT-05 P1 | |
| XT-08 | BG-RIVERSIDE-DUSK | XT-SPR-RIVER-RAIN | CG-XT-06 P0 | |
| JYC-06B | BG-RAIN-AWNING-DAY / CASUAL-EATERY | JYC-SPR-CASUAL | CG-JYC-04A P1 | |
| JYC-07 | BG-CAFE or PC-HOME | JYC-SPR-ALIAS | CG-JYC-04 P0 | |
| JYC-08 | chat UI | JYC avatar | none | typing/delete animation 可用 UI |
| RE-X | reuse 17F/convenience/cafe | matching XT sprite | none | reactive only |
| RE-J | reuse cafe/UI | matching JYC sprite | none | reactive only |
| SH-02 | BG-CREATOR-EVENT | XT-WORK/EVENT + JYC-CREATOR | CG-SH-02 P0 | |
| BRAID-C | UI/state only | none | none | |
| XT-09 | BG-XT-HOME-STUDIO | XT-SPR-HOME-WORK | CG-XT-07 P0 | |
| XT-10 | BG-XT-HOME / 17F | XT-SPR-CONFLICT | CG-XT-08 P0 | |
| XT-11 | BG-APT-17F-NIGHT | optional XT silhouette | none | 空走廊也可 |
| JYC-09 | BG-CREATOR-EVENT + MRT | JYC-SPR-CREATOR | CG-JYC-05 P0 + 06 P1 | |
| JYC-10 | chat UI / BG-PC-HOME | JYC-SPR-CONFLICT | none | dialogue-driven |
| JYC-11 | chat UI | none/avatar | none | online silence |
| TENSION | no player scene | none | none | gate |
| XT-12 | BG-PRINT-SHOP + XT-HOME | XT-SPR-REPAIR | CG-XT-09 P1 | |
| JYC-12 | BG-CREATOR-SMALL | JYC-SPR-CREATOR-TABLE | CG-JYC-07 P0 + 08 P0 | |
| COMMIT | UI/message + shared day transition | current sprites | optional P2 | 重點是 choice |
| HONEST-X | reuse message/cafe | JYC current sprite | none | closure variant |
| HONEST-J | reuse 17F/cafe | XT current sprite | none | closure variant |
| BOTH-H | UI / neutral city | current sprites | none | |
| BOTH-L | UI | current sprites | none | |
| OV-01 | reuse city/cafe/message | both as needed | none | conditional montage |
| OV-02 | BG-CAFE / EVENT | both | CG-OV-01 P1 | |
| SHURA-01 | BG-CAFE-GROUND or event | both | CG-SHURA-01 P0 | |
| SHURA-02 | separate heroine BGs | XT-CONFLICT / JYC-CONFLICT | none | 兩段談話分開 |
| DECIDE | UI / neutral transition | none | none | gate |
| XT-13 | BG-DAYTRIP-ARCADE | XT-SPR-REPAIR-DAYTRIP | CG-XT-10 P0 | |
| XT-14 | BG-APT-17F-NIGHT | XT-SPR-ENDING | CG-XT-11 P0 | first kiss |
| JYC-13 | BG-MRT + RAIN-AWNING-NIGHT | JYC-SPR-ENDING | CG-JYC-09 setup/keyframe | |
| JYC-14 | BG-RAIN-AWNING-NIGHT | JYC-SPR-ENDING | CG-JYC-09 P0 | first kiss |
| XT-G | BG-APT-17F-NIGHT | XT-SPR-ENDING | CG-XT-11 P0 | relationship resolution / first kiss |
| XT-F | cafe/17F | XT weekday | none | relationship resolution; coda carries optional CG |
| XT-D | BG-APT-17F-NIGHT | XT guarded | none | |
| JYC-G | BG-RAIN-AWNING-NIGHT | JYC-SPR-ENDING | CG-JYC-09 P0 | relationship resolution / first kiss |
| JYC-F | UI/cafe | JYC casual | none | relationship resolution; coda carries optional CG |
| JYC-D | UI | avatar only | none | |
| BOTH-D | BG-17F empty + phone UI | none | none | empty-life motif |
| XT-AF-01 | BG-XT-HOME-NIGHT | XT-SPR-AFTER-STORY | CG-XT-AF-01 P0 + full-only M1 | relationship reward / first stayover |
| XT-AF-02 | BG-XT-HOME-MORNING | XT-SPR-AFTER-STORY | CG-XT-AF-02 P0 | domestic fan-service |
| XT-AF-03 | BG-XT-HOME-MORNING / cafe | XT-SPR-AFTER-STORY | CG-XT-AF-03 P1 | one-month relationship coda |
| XT-FC | cafe / 17F | XT weekday | CG-XT-FC-01 P2 | warm friendship continuation |
| XT-DC | BG-APT-ELEVATOR + 17F | XT weekday | none | closure |
| JYC-AF-01 | BG-PC-HOME-NIGHT | JYC-SPR-AFTER-STORY | CG-JYC-AF-01 P0 + full-only M1 | relationship reward / first stayover |
| JYC-AF-02 | BG-PC-HOME-MORNING | JYC-SPR-AFTER-STORY | CG-JYC-AF-02 P0 | online/offline fan-service payoff |
| JYC-AF-03 | BG-PC-HOME-MORNING / cafe | JYC-SPR-AFTER-STORY | CG-JYC-AF-03 P1 | creative relationship coda |
| JYC-FC | cafe / creator event | JYC casual | CG-JYC-FC-01 P2 | friendship continuation |
| JYC-DC | UI / city night | avatar only | none | closure |
| BOTH-DC | BG-APT-17F-NIGHT + phone UI | none | none | double-distance coda |

---

# 7. Priority / production batches

## Batch A — Identity and reusable sprites

先做：
1. Xu Character Bible metadata correction + identity anchors確認。
2. Jiang identity turnaround。
3. Xu P0 sprite sets。
4. Jiang P0 sprite sets。

若角色 identity 不穩，禁止先大量生 CG。

## Batch B — P0 backgrounds

優先：
- 17F day/night/rain
- elevator
- convenience
- two cafes
- ACG shop/corridor
- bookstore
- night market
- MRT night
- riverside
- player home
- Xu home
- creator event
- creator small
- daytrip rain
- rainy awning night

## Batch C — Early attraction CG

- CG-COM-01
- CG-XT-01
- CG-JYC-01
- CG-JYC-03
- CG-XT-03

先用這批測整體 game art direction。

## Batch D — Vulnerability / conflict

- CG-XT-06
- CG-XT-07
- CG-XT-08
- CG-JYC-04
- CG-JYC-05
- CG-SH-02

## Batch E — Repair / route reward

- CG-XT-09/10
- CG-JYC-07/08
- CG-OV-01
- CG-SHURA-01

## Batch F — Relationship resolution + After Story

- CG-XT-11
- CG-JYC-09
- CG-XT-AF-01 / 02 / 03
- CG-JYC-AF-01 / 02 / 03
- optional Friend Coda CGs
- full-only mature slots最後單獨製作，不與 SFW queue 混在一起

---

# 8. CG quality checklist

每張人物 CG 接受前檢查：

- identity 是否與 canonical face 一致；
- 年齡是否正確；
- 身高／身材比例是否 consistent；
- 髮型是否符合該 scene；
- outfit 是否符合 wardrobe version；
- 手指／握物／接觸是否正確；
- 角色視線是否符合動作，而非每張都看鏡頭；
- head pose 是否與相鄰 CG 重複；
- scene lighting 是否一致；
- 不可出現真商標、真 IP、亂碼文字；
- 9:16 裁切後 face / hands / key prop 不被 UI 擋；
- CG 是否真的增加情緒／收藏價值，而不是只是把 sprite 合成背景。
- full-only mature asset 必須有明確 profile tag，且不被 SFW Gallery count / placeholder 洩漏。
- After Story fan-service 必須表現 established relationship 的互相主動，而不是只換成更裸露服裝。

---

# 9. Suggested production tracker

**GitHub 本文件 = what/why canonical。**

正式生圖追蹤建議 Google Sheet，每行一個 asset：

| Column | Meaning |
|---|---|
| assetId | semantic ID |
| type | background / sprite / cg |
| route | common / xu / jyc / shared |
| sceneId | narrative node |
| priority | P0/P1/P2 |
| shortDescription | quick lookup |
| identityRef | canonical identity source |
| outfitVersion | version |
| hairstyleVersion | version |
| expression | expression |
| camera | framing / angle |
| headPose | explicit pose |
| action | physical action |
| lighting | lighting |
| safeZone | UI-safe metadata |
| recipeStatus | todo / ready |
| generationStatus | todo / candidates / retry |
| selected | yes/no |
| QA | identity/hands/composition/continuity |
| driveSourceId | accepted master |
| runtimeAssetId | logical ID |
| integrated | yes/no |
| notes | freeform |

完整 generation prompt 最終應寫進 `content/recipes/assets.json`，**不要讓 Google Sheet 成為唯一 prompt source-of-truth**。

---

# 10. Asset ID naming direction

正式 recipe 可收斂成：

~~~text
bg.prototype.apt_17f.night
sprite.xu_tang.weekday.neutral
sprite.jiang_yucheng.acg.excited
cg.prototype.common.movein_rain
cg.prototype.xu.bookstore
cg.prototype.jyc.gaming_night
cg.prototype.shared.creator_event
cg.prototype.overlap.caught
~~~

具體 naming 可在 implementation 時配合既有 asset manifest 慣例，但一旦進存檔／gallery metadata 就必須 stable。

---

# 11. Definition of art-ready scene

一個 scene 可以交給生圖 pipeline 前，必須：

- narrative scene spec 已確認；
- location 已有 BG ID；
- heroine outfit / hairstyle set 已確認；
- expression list 足以支援主要 dialogue beats；
- 如果需要 CG，已寫清楚「為什麼值得 CG」；
- CG action / camera / headPose / lighting / safe zone 都有方向；
- 沒有與相鄰 scene 重複到只換背景；
- identity reference 已準備好；
- accepted master 要保存到 canonical Drive storage，不能只留在生成服務／本機。

達成後再把該 item 轉成正式 asset recipe。
