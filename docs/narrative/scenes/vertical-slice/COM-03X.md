# COM-03X — 包裹 / Line

> **Rendering boundary:** this scene remains canonical for narrative/state/staging and semantic visual beats. Older 9:16/sprite/composite instructions are historical annotations; new render-ready decisions belong to the canonical CG manifest produced by `cg_planner`.


## Status

- Production stage: **S1 Script v1 — awaiting Human review**
- Scope: Opening Vertical Slice / common Xu contact establishment
- Memory ownership: **compressed into COM-03M candidate; no standalone W4 Memory card required**
- Suggested progress band: 200 (final W4 compression/rank remains a later integration decision)
- Estimated play time: 5–7 minutes
- In-world duration: about 7–10 minutes
- Lock rule: **This file is not S4/S6 locked.** Dialogue, state contract, and art shot intent are S1 review candidates only. Human review must happen before S2/S4/S5/S6 can advance.

## Canonical inputs

- PROJECT_STATE.md
- docs/narrative/CONTENT_PRODUCTION_TODO.md
- docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md — COM-03X
- docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md
- docs/art/PRODUCTION_VISUAL_DIRECTION.md
- docs/art/CHARACTER_REFERENCE_PACK_SPEC.md
- ARCHITECTURE.zh-TW.md
- Locked voice / continuity sources: COM-00, COM-01X, COM-01J, COM-02X, COM-02J

## Scene summary

Week 2 中後段的平日晚間，男主回到 17 樓時，在 1703 門口看見一個硬質印刷打樣封套。收件人清楚寫著許棠／1702，只是被快遞放錯一扇門。

男主沒有拆，也沒有把這件事當成找許棠聊天的藉口；他直接拿去敲 1702。許棠確認封套沒有折到後，在自己門口拆開最上層打樣，順手檢查紙張與顏色。這讓 COM-02X 裡只到「自由接案／印刷前最後一輪」的職業輪廓第一次變成具體、可見的工作細節。

兩人從「又送錯門」聊到打樣、上次的 deadline、大樓那些不太尊重直覺的動線。許棠也記得男主之前找不到垃圾室的小事。她這週還有兩批打樣會送到；為了下次如果又放錯門，不必彼此在走廊等人，她主動提出交換 Line。加完後，她順手把 COM-02X 提過的深夜粥店位置傳給男主。

整幕的感覺應是：**聯絡方式只是兩個已經能聊幾句的鄰居，為了讓現實生活更方便，自然多開了一條通道。** 沒有人把它說成關係升級儀式。

## Scene goal / dramatic question

- 玩家感受：和許棠的熟悉感第一次跨出「碰到才聊天」，但原因仍然非常生活化。
- 男主當下目標：把誤送的包裹完整交回；不侵犯內容，也不藉機拖延。
- 許棠當下目標：確認打樣沒有損傷、快速看一眼成品狀況；處理「之後可能還會送錯」這個實際問題。
- Secondary goal：讓玩家更具體理解許棠做的是會落到紙張、顏色、客戶與 deadline 的視覺設計工作，而不是抽象的「設計師」標籤。
- Dramatic question：兩個人已經熟到什麼程度，才會自然覺得「有事可以直接傳訊息」？本幕答案是：不需要浪漫宣告，只需要幾次可靠的生活互動。

## Entry state

### Structural position

Opening Vertical Slice 固定呈現順序中，本幕位於 COM-02J 之後、COM-03J 之前。

Heroine-local dependency 以 canonical route/state spec 為準：許棠 thread 需要先完成 COM-02X。

### Conditions

requires:
- COM-02X completed
- met_xu_tang == true
- player_knows_xu_freelance_creative_work == true

forbids:
- contact_xu == true

Authoring ordering note:
- Opening sequence places this after COM-02J.
- This note does not require a new runtime field; integration must use the existing content graph/schema.

### Known information on entry

男主知道：
- 許棠住 1702；
- 她做自由接案／視覺設計相關工作；
- 她最近有一個要進印刷的案子；
- 她偶爾 deadline 晚、但不代表固定作息；
- 她曾告訴他垃圾室正確走法與附近深夜粥店。

許棠知道：
- 男主住 1703；
- 他是可遠端工作的科技從業者；
- 他曾遇過垃圾室動線問題；
- 他能正常接受短暫幫忙，也不會硬把鄰居互動延長。

雙方目前：
- contact_xu == false；
- 不知道對方完整履歷、收入、客戶、私人感情史；
- 沒有 exclusivity / romantic commitment；
- 沒有 Xu/JYC cross-knowledge。

## Time / place / wardrobe continuity

- 時間：Week 2 中後段，平日約 19:30–20:00。
- 地點：17 樓 1702／1703 門口走廊。
- Background：**BG-APT-17F-NIGHT**。
- Reason：canonical art spec 允許 BG-APT-17F-DAY/NIGHT；本 S1 選 NIGHT，因現有 A1 accepted background 已可直接 reuse，不為本幕新增 DAY blocker。
- Xu wardrobe：**XT-SPR-WEEKDAY / XT Wardrobe A / Look 01 Weekday Neighbor**。
- 男主剛回樓層，仍是一般平日晚間外出／工作後狀態；不需要固定可見 sprite。

## Beat sheet

| Beat | Runtime intent | Action / dialogue intent | Visual / expression | State |
| --- | --- | --- | --- | --- |
| 03X.1 誤送一扇門 | establishing | 男主在 1703 門口看到硬質封套；先讀到收件人許棠／1702，確認只是放錯門。 | BG-APT-17F-NIGHT，無角色；封套靠門但不擋動線。 | none |
| 03X.2 直接送回 | action | 男主不拆、不拍內容，拿起封套敲 1702。許棠開門後先看封套，再看男主。 | XT-SPR-WEEKDAY.neutral_observant | none |
| 03X.3 工作變具體 | reveal | 她確認角沒有折到，在自己門邊拆開，抽出最上層印刷 proof；說是 COM-02X 那個案子的打樣。 | neutral_observant → polite_smile；proof 只作生活 prop。 | knowledge only |
| 03X.4 Player choice | local branch | 玩家可回扣她上次的「最後版本」、具體問打樣用途、或拿大樓動線開一個乾式玩笑。 | polite_smile / neutral_observant / dry_playful | tone only |
| 03X.5 五分鐘不是靠硬聊 | rejoin | 她一邊在走廊燈下比兩張 proof，一邊和男主聊螢幕與紙張差異；男主只問他真的不懂的部分，不主動替她評稿。 | neutral_observant 為主。 | none |
| 03X.6 她記得小事 | reciprocity | 許棠問垃圾室後來有沒有再走錯；男主說已經不用靠運氣。她回「那這棟樓現在只剩快遞在迷路。」 | dry_playful | callback only |
| 03X.7 實用理由交換 Line | contact beat | 她說本週還有兩批打樣可能送來；如果又放 1703，傳訊息比彼此等在走廊方便。她先問介不介意，再亮 Line QR。 | polite_smile；手機在中段，不做戀愛特寫。 | contact_xu=true |
| 03X.8 第一條訊息不是告白 | contact payoff | 加完後，她把先前提過的深夜粥店位置傳過去，理由是店名相近、第一次容易找錯。男主回一句務實短訊息。 | 極簡 notification overlay；不要求新 chat asset。 | none |
| 03X.9 各回各家 | exit | 她收好 proofs，沒有邀男主進 1702；兩人道晚安。男主回 1703 後手機再震一下：她補一句「週三真的沒開。」 | polite_smile；走廊空景收尾。 | F_XT +1 |

## Complete playable script — S1 v1

### common_package_xu_arrive

**Visual**：BG-APT-17F-NIGHT。無人物。1703 門側靠著一個薄而硬的牛皮紙封套。

**Narration**：電梯門在身後關上。我摸到鑰匙，才看見門邊多了一件東西。

**Action**：男主低頭確認外部物流標籤；不拆封。

**Narration**：收件人是許棠。1702。

**Narration**：快遞把樓層送對了，最後一公尺選錯答案。

**Action**：男主拿起封套，走到隔壁 1702，敲門。

### common_package_xu_door

**Visual**：XT-SPR-WEEKDAY.neutral_observant，許棠站在 1702 自己的門口。

**Action**：門開。許棠先看到男主，再看到他手上的封套。

**Xu Tang**：放你那邊了？

**Protagonist**：嗯。上面是妳的名字。

**Action**：男主把封套遞給她；許棠接過後先看四角和封口。

**Xu Tang**：謝謝。還好沒折到。

**Protagonist**：重要的？

**Xu Tang**：打樣。上次那個印刷案。

**Action**：她在自己門邊拆開封套，抽出最上面兩張 proof。紙上只有抽象版面、色塊、裁切／印刷標記；不出現可辨識客戶名稱或品牌。

**Visual**：XT-SPR-WEEKDAY.polite_smile。

**Xu Tang**：至少它真的變成紙了。

### common_package_xu_choice

**Choice prompt**：她把兩張 proof 疊在一起，借走廊燈看了一眼。

1. com03x_recall_deadline — **「上次那兩個『最後版本』，這就是其中一個？」**
2. com03x_ask_proof — **「打樣主要是在看螢幕上看不準的東西？」**
3. com03x_joke_building — **「這棟樓現在連快遞也不太尊重直覺。」**

#### Branch com03x_recall_deadline

**Protagonist**：上次那兩個「最後版本」，這就是其中一個？

**Visual**：XT-SPR-WEEKDAY.polite_smile。

**Xu Tang**：其中一個。

**Xu Tang**：它現在有實體了。臨時要改，至少會比較有罪惡感。

**Protagonist**：對誰？

**Xu Tang**：理論上是客戶。

**Action**：她低頭把兩張 proof 對齊。

→ Rejoin common_package_xu_proof

#### Branch com03x_ask_proof

**Protagonist**：打樣主要是在看螢幕上看不準的東西？

**Visual**：XT-SPR-WEEKDAY.neutral_observant。

**Xu Tang**：顏色、紙，還有字小到哪裡會開始難看。

**Xu Tang**：螢幕很會替人說好話。

**Protagonist**：跟 demo 差不多。

**Xu Tang**：差不多。只是這個出錯會比較佔桌面。

**Action**：她用拇指壓住紙角，不讓 proof 捲起來。

→ Rejoin common_package_xu_proof

#### Branch com03x_joke_building

**Protagonist**：這棟樓現在連快遞也不太尊重直覺。

**Visual**：XT-SPR-WEEKDAY.dry_playful。

**Xu Tang**：你終於進到進階部分了。

**Protagonist**：垃圾室只是新手教學？

**Xu Tang**：那個至少沒有寄錯收件人。

**Action**：她看了一眼封套上的 1702，再看男主身後的 1703。

→ Rejoin common_package_xu_proof

### common_package_xu_proof

**Visual**：XT-SPR-WEEKDAY.neutral_observant。許棠仍站在自己門口；沒有邀男主進屋。

**Action**：她把兩張 proof 並排，微微偏向走廊燈，比較同一塊灰色在兩種紙上的差異。

**Xu Tang**：這張還是偏綠。

**Protagonist**：我看起來只覺得兩張都是灰的。

**Xu Tang**：這其實是比較幸福的看法。

**Protagonist**：那我不破壞它。

**Action**：她換一個角度看紙面，停了兩秒。

**Xu Tang**：印刷廠那邊覺得已經很接近。

**Protagonist**：妳覺得沒有。

**Xu Tang**：我覺得「接近」通常是 deadline 快到了才會出現的單位。

**Narration**：我們就在兩扇門中間聊了幾分鐘。她看紙，我看她指出來的位置。沒有誰需要把話題撐住。

**Protagonist**：所以這一輪看完，還要回去改？

**Xu Tang**：可能只改色值。也可能客戶明早突然覺得標題應該再大一點。

**Protagonist**：最後版本。

**Xu Tang**：你已經會用了。

### common_package_xu_callback

**Visual**：XT-SPR-WEEKDAY.dry_playful。

**Xu Tang**：對了。垃圾室後來找得到吧？

**Protagonist**：已經不用靠運氣了。

**Xu Tang**：那很好。

**Action**：她把 proofs 收回封套，看了一眼 1703 門邊。

**Xu Tang**：這棟樓現在只剩快遞在迷路。

### common_package_xu_line

**Visual**：XT-SPR-WEEKDAY.polite_smile。

**Xu Tang**：我這週還有兩批打樣會送來。

**Xu Tang**：管理室有時候直接讓快遞上樓。要是又放到你那邊，你傳我一下就好。

**Xu Tang**：你介意加 Line 嗎？

**Protagonist**：不介意。

**Action**：許棠拿出手機，亮出自己的 Line QR。男主掃碼；不拍攝她手機內容。

**Audio**：一次很輕的新增聯絡人提示音。

**Xu Tang**：好了。

**Protagonist**：下次可以省掉敲門流程。

**Xu Tang**：最好連送錯流程一起省。

### common_package_xu_first_message

**Action**：許棠低頭在手機上點幾下。男主手機震動。

**Runtime overlay intent**：只需要簡潔 notification / text bubble，不必切完整 chat scene。

**Xu Tang (message)**：那間粥店的位置。

**Xu Tang (message)**：名字跟另外一家很像，第一次容易走錯。

**Protagonist**：妳連這個都記得。

**Xu Tang**：你上次真的有問附近能吃什麼。

**Protagonist**：那我收下導航。

**Xu Tang**：比直覺可靠。

### common_package_xu_exit

**Action**：許棠把 proofs 收回封套，往自己門內退半步。

**Xu Tang**：我先把這兩張拍給客戶。

**Protagonist**：希望這次真的是最後一版。

**Visual**：XT-SPR-WEEKDAY.polite_smile。

**Xu Tang**：你還保留著那種樂觀。

**Protagonist**：晚安。

**Xu Tang**：晚安。

**Action**：1702 門關上。男主回到 1703。

**Visual**：走廊空景 → 1703 室內方向的短 transition；不建立新 BG。

**Audio**：手機再震一下。

**Xu Tang (message)**：週三真的沒開。

**Protagonist (message)**：收到。這次先看地圖。

**Narration**：我把手機收進口袋，順手把門邊空出來。

**Narration**：如果下一件又送錯，至少不用再猜她在不在家。

**End actions**：套用本幕 base state；前往 COM-03J。

## Player choice / branch contract

| Choice ID | Player-facing intent | Xu response | Relationship effect | Telemetry | Rejoin |
| --- | --- | --- | --- | --- | --- |
| com03x_recall_deadline | 記得她上次 deadline 的具體細節 | 她承認是同一案子，乾乾談「實體化後比較難臨時改」 | no extra heroine stat | mc_tone_observant +=1 | 03X.5 |
| com03x_ask_proof | 對她的工作流程提出具體、可退出的問題 | 她解釋 color / paper / readability，男主用 demo 做有限類比 | no extra heroine stat | mc_tone_practical +=1 | 03X.5 |
| com03x_joke_building | 用大樓既有 callback 做輕微乾式幽默 | 她接垃圾室／門牌的回扣，不擴成 witty banter | no extra heroine stat | mc_tone_humorous +=1 | 03X.5 |

Choice design guardrails：
- 三個選項都合理，沒有「最懂設計」才是正解。
- 不提供「我幫妳看」、「妳可以把檔案傳我」、「這麼晚還工作要注意身體」等主動接管型選項。
- 本幕不因某個 choice 加速 romantic signal；真正的 payoff 是聯絡方式變成自然生活工具。
- COM-02X 若曾選 com02x_tell_eat_better，本幕也不追加懲罰或冷淡 variant；單次不完美行為仍只留在 pattern telemetry。

## Rejoin

三個 choice 均回到 common_package_xu_proof。

Rejoin 的功能：
1. 讓玩家看到許棠的工作 competence 是具體判斷，不是「她是設計師」旁白；
2. 建立 in-world 5+ 分鐘的自然停留；
3. 由她主動回問男主一個前幕生活小細節；
4. 再進入 Line exchange 的實用理由。

## Exit

- 許棠留在 1702 繼續處理 proof；
- 男主回 1703；
- 兩人都沒有邀請對方進家、沒有延長成臨時約會；
- Line 已建立，並有一則很普通的地點資訊＋一句 callback；
- 下一幕 COM-03J 可以建立另一種 contact channel，而不讓兩條線的聯絡方式取得方式同質化。

## State contract — S1 candidate

### Conditions

requires:
- COM-02X completed
- met_xu_tang == true
- player_knows_xu_freelance_creative_work == true

forbids:
- contact_xu == true

### Stats

base:
- relationship.xu.familiarity: +1

choice-local:
- com03x_recall_deadline: no heroine stat delta
- com03x_ask_proof: no heroine stat delta
- com03x_joke_building: no heroine stat delta

Canonical shorthand: F_XT +1.

Unchanged:
- relationship.xu.trust
- relationship.xu.chemistry
- relationship.xu.compatibility
- relationship.xu.romanticSignal
- recentFocus
- overlapLevel
- exclusiveWith
- deception

### Flags

set:
- contact_xu: true

unchanged:
- relationship.xu.romanticSignal: false
- xt_boundary_strikes: 0

Do not add xu_has_player_line / player_has_xu_line duplicate booleans. contact_xu is the canonical gate.

### Knowledge changes

Machine-gating knowledge:
- no new boolean required.

Narrative knowledge only:
- 男主現在具體知道許棠的視覺設計工作包含 physical print proof / color / paper / client review；
- 許棠知道男主會在誤收她的包裹時直接送回、不拆、不自行處理；
- 兩人知道可以用 Line 處理小型生活 logistics。

除非後續 locked scene 真正需要查詢，不新增 player_knows_xu_print_process 等一次性旗標。

### Next structural target

- Opening Vertical Slice fixed order: COM-03J.
- COM-03M 的 Xu montage prerequisite 之一 contact_xu=true 在本幕滿足。
- 不解鎖 OPEN-A；仍需 contact_jyc=true 並完成 COM-03M。

## Runtime / Memory intent

### Runtime nodes

建議 9–12 個 stable nodes，前綴 common_package_xu_*。

Suggested anchors:
- common_package_xu_arrive
- common_package_xu_door
- common_package_xu_choice
- common_package_xu_proof
- common_package_xu_callback
- common_package_xu_line
- common_package_xu_first_message
- common_package_xu_exit

Choice branches 各 1–2 node 即可，不把每句 dialogue 拆成獨立 authoring scene。

### W4 Memory intent

Canonical total spec 已允許本幕被 COM-03M 壓縮，因此 S1 建議：
- **不建立 standalone player-facing Memory Event。**
- COM-03X 仍是 stable authoring scene / replay checkpoint candidate。
- 到 COM-03M 時，以「開始有了訊息」之類 common Memory summary 吸收本幕 contact establishment。
- 不因本幕沒有獨立 Memory card 就省略 contact_xu snapshot / replay correctness。
- Gallery: no CG unlock.

## Art needs — S1 candidate

### Required BG logical IDs

Primary / required:
- **BG-APT-17F-NIGHT**

Variants:
- none

Reuse:
- **Yes** — existing accepted A1 background.
- 本幕不要求新增 BG-APT-17F-DAY。若 Human 後續改成白天，才重新檢查 DAY asset readiness，不在 S1 預建 blocker。

### Required sprite set

- **XT-SPR-WEEKDAY**
- Canonical wardrobe: XT Wardrobe A / Look 01 Weekday Neighbor.

### EXACT required expression semantic names

本幕只要求：
1. **XT-SPR-WEEKDAY.neutral_observant**
2. **XT-SPR-WEEKDAY.polite_smile**
3. **XT-SPR-WEEKDAY.dry_playful**

不新增近義命名；asset pipeline 必須沿用 opening locked semantic contract，不以 neutral / observant / polite-soft 在 scene integration 時默默替代。

### Props

Required narrative props:
- 薄、硬質、無品牌的 kraft print-proof mailer；
- 兩張無真實客戶資訊的印刷 proof：抽象版面／色塊／crop or registration 類印刷標記；
- 許棠手機，用於 Line QR / 傳 map link。

Asset policy:
- S1 不建立新的 prop logical ID。
- props 優先由簡單 foreground layer、sprite hand prop 或低細節 runtime overlay 解決。
- 若 S6 review 發現手持 proof 對 sprite composite 不可靠，再由 Art Worker 建立 dedicated prop recipe；現在不提前擴 asset graph。

### CG

- Required CG IDs: **none**
- CG trigger: **none**
- Gallery unlock: none

Reason:
- 本 scene 的 current art intent 明確為 reuse / no CG；
- 本幕價值在「門口聊得比以前久 + contact channel 自然建立」，不值得用 hero CG 把生活 logistics 拍成戀愛大事件。

## Art Shot List — S1 proposed, NOT S6-locked

> 依 production workflow，本節在 S1 只提供足夠精確的 shot intent。**Human script review 前不得將其標為 S6 Art Shot Lock。**

### Shot A — Misdelivered proof at 1703

- Asset: BG-APT-17F-NIGHT reuse.
- Camera：男主自然視高，沿 1702／1703 走廊看向自家門；不得改變既有 door geography。
- Focal：1703 門邊的薄硬封套；它只佔中下段一小塊，不像神秘包裹 thriller。
- Safe zone：最底 25% 保持 dialogue 可讀；封套不可完全落在 UI 下。
- Characters: none.
- Duration: 2–3 narration/action advances.

### Shot B — Xu at her own doorway

- Asset: BG-APT-17F-NIGHT + XT-SPR-WEEKDAY.
- Blocking：許棠站在 1702 自己門線附近；男主 POV 位於走廊，不跨進她家。
- Expression flow: neutral_observant → polite_smile.
- Prop：她接過 mailer 後先檢查角，再拆；不把 proof 朝鏡頭展示成商品廣告。
- Safe zone：臉位於上半 25–55%；手與 mailer 在中段；下方 25% 不放必要手勢。
- No new interior：1702 室內只允許門後低資訊暗部／暖光，不藉此偷偷設計她家 layout.

### Shot C — Proof comparison / conversation hold

- Asset：同 BG + sprite。
- Expression：neutral_observant 為 base；幽默 branch 切 dry_playful。
- Blocking：她把兩張 proof 並排靠近走廊燈查看；男主不伸手拿稿。
- Focal：她在「看工作」而不是「被男主看」。
- Time intent：支撐 in-world 5+ 分鐘，但 runtime 不需真的 idle 五分鐘。
- Safe zone：proof 上任何抽象版面不應被誤讀成真品牌／可讀 client copy.

### Shot D — Line exchange without romantic close-up

- Asset：同 BG + polite_smile。
- Trigger：許棠說「你介意加 Line 嗎？」後拿手機。
- Camera：仍是一般門口 medium composition；**不切手指碰手機的戀愛特寫**。
- Phone：QR 只需 abstract／runtime-generated pattern；不要生成真實可掃 ID。
- Safe zone：手機在中段；臉在上半；dialogue area 保持乾淨。
- Duration: 1–2 advances.

### Shot E — Empty corridor coda

- Asset: BG-APT-17F-NIGHT.
- Trigger：1702 門關上、男主回 1703。
- Character: none.
- Audio/overlay：一次手機 vibration + 許棠「週三真的沒開。」短訊息。
- Purpose：把 contact payoff 收回普通生活，不用戀愛音樂 stinger / CG。

## Generation Queue notes — S1 candidate

### New generation required by this scene

- BG: none.
- CG: none.
- New wardrobe: none.
- New sprite set: none.
- New dedicated prop: none at S1.

### Reuse dependencies

- BG-APT-17F-NIGHT: existing A1 accepted asset.
- XT-SPR-WEEKDAY requires exact semantic expressions:
  - neutral_observant
  - polite_smile
  - dry_playful

A2 不因本 scene 自動完成；sprite worker 仍需按全 opening locked expression contract 做 semantic alignment / missing acting variant completion.

### Queue priority implication

COM-03X 不新增任何 A3 CG queue item。

等 Human review + S4/S5/S6 後，只需確認：
1. existing NIGHT BG geography 合格；
2. three required Xu expressions 可用且命名一致；
3. proof/phone props 能以非 hero asset 方式可信呈現。

## Dialogue writing notes

### Male protagonist

- 看包裹外部標籤是正常物流判斷，不拆、不偷看 client info。
- 幽默最多一來一回；不要把快遞、印刷、工程師類比每句都變成段子。
- 可以問「打樣是在看什麼」，但不因此突然成為設計專家。
- 不說「我可以幫妳看」「妳工作太辛苦了」「下次我幫妳收」等接管型台詞。
- Line exchange 後不在旁白寫「終於拿到她的聯絡方式」。

### Xu Tang

- 先處理 proof 是否折損，再聊天；competence 透過動作出現。
- 解釋工作時仍短而具體：顏色、紙、字、deadline。
- 她記得男主垃圾室的小事，表示她有在聽，不需要 narration 宣告她很細心。
- Line 是她主動提出，但語氣是「這樣比較方便」，不是曖昧試探。
- 她願意順手傳粥店位置，代表 shared reality 正在擴大；不需要愛心、曖昧貼圖或秒回描寫。

### Prohibited beats

- 男主拆開她的包裹才發現工作內容。
- 包裹裡是私人衣物／曖昧物件。
- 快遞誤送被寫成「命運安排」。
- 許棠因男主送回包裹過度感激、請客或邀進家。
- 交換 Line 後任何一方立刻開始情感長聊。
- 旁白把聯絡方式當「攻略進度」。
- 用工作問題教育許棠該如何管理客戶或 deadline。
- 因 COM-02X 一次 boundary telemetry 直接讓她拒絕 contact。

## End state

- contact_xu=true.
- relationship.xu.familiarity +=1.
- 男主更具體理解許棠的 freelance visual-design 工作，但沒有新增不必要 gating flag。
- 許棠記住男主先前生活細節，且願意主動把 communication channel 從走廊延伸到 Line。
- 兩人仍是能自然往來的鄰居，不把本幕命名為 date / romantic escalation。
- 玩家得到第一個 Xu message rhythm sample：短、實用、帶一點乾式 callback。
- 下一步是 Human review；**不要開始 COM-03J。**

## S1 Human review questions

1. 「還有兩批打樣可能再送錯門」是否足夠支撐 Line exchange，還是希望更弱／更強的實用理由？
2. proof conversation 的專業細節是否剛好，沒有讓男主或許棠突然 exposition？
3. 三個 choice 是否都像成年人真的會說的話，且沒有隱藏正解感？
4. 最後那條「週三真的沒開。」是否保留；它的目的只是提前建立 Xu 短訊息節奏。
5. 是否接受本幕固定使用 BG-APT-17F-NIGHT，以避免為 COM-03X 新增 DAY background blocker？
