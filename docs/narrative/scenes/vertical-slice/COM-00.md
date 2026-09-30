# COM-00 — 雨夜搬家

> **Rendering boundary:** this scene remains canonical for narrative/state/staging and semantic visual beats. Older 9:16/sprite/composite instructions are historical annotations; new render-ready decisions belong to the canonical CG manifest produced by `cg_planner`.


## Status

- Production stage: **S4 Script Lock / S5 State Contract / S6 Art Shot Lock**
- Scope: Opening Vertical Slice / common opening
- Memory ownership: `common`
- Progress band: `100`
- Estimated play time: 4–6 minutes
- Lock rule: dialogue may be line-edited during runtime integration, but beats, choice intent, state output, and locked art shots must not change without continuity review.

## Canonical inputs

- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` — COM-00
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
- `docs/art/PRODUCTION_VISUAL_DIRECTION.md`
- `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`

## Narrative Continuity Contract

- Canonical contract：`content/production/narrative/opening-ch1/COM-00.json`。
- 本 scene file owns dialogue、choice、state mapping 與 Semantic Visual Beat；machine contract owns entry/exit relationship/knowledge boundary。
- Runtime flags 是 implementation mapping，不是 relationship score。

## Scene summary

Week 1 的雨夜，31 歲男主剛搬回台北，搬家公司離開後獨自整理走廊上的最後幾箱。防火門回彈，一只箱角卡住門線；剛回家的隔壁鄰居許棠順手扶門，和他一起把箱子挪開。兩人只交換姓名與住戶位置，沒有搭訕、聯絡方式或命定感。她回 1702，男主回到仍顯空的新家。

Scene 的作用不是展示「第一女主」，而是同時建立三件事：男主用動手處理事情代替感受新生活；許棠會幫忙，但幫到明確邊界就離開；17 樓是兩人往後反覆相遇的生活空間。

## Scene goal / dramatic question

- 玩家感受：一個安靜、可信、稍有餘韻的都市生活開場。
- 男主當下目標：在不妨礙公共動線的前提下，把最後幾箱搬進 1703。
- 許棠當下目標：回家；順手處理眼前會卡門的麻煩，但不接管陌生鄰居的搬家。
- Dramatic question：男主把生活安排得井然有序之後，是否還留了讓別人進來的位置？本幕只埋題，不回答。

## Unlock / entrance condition

- Root scene，無前置旗標。
- 時間：Week 1，約 21:10，持續下雨的平日晚間。
- 地點：17 樓電梯廳至 1702／1703 走廊。
- 男主已知：自己的門牌是 1703；除此之外不認識任何住戶。
- 許棠已知：1703 最近空出、今晚有人搬入；不知道男主姓名與背景。
- 初始畫面狀態：`BG-APT-17F-RAIN`；無角色立繪；走廊有三只箱子，其中一只靠近防火門但未真正堵死逃生通道。

## Beat sheet

| Beat | Runtime intent | Action / dialogue intent | Visual / expression | State |
| --- | --- | --- | --- | --- |
| 00.1 新家的聲音 | 2–3 個短 narration nodes | 電梯遠去、雨聲隔著窗、膠帶被扯開。旁白只寫可感知事物與男主的實際判斷，不宣布「我很孤單」。 | BG establishing；紙箱在前景；不出角色。 | none |
| 00.2 箱角卡門 | action node | 男主試圖一手撐門、一手轉箱；問題笨拙但不危險。 | BG closer crop；可有箱角／男主手部。 | none |
| 00.3 許棠扶門 | entrance + CG trigger | 一只手先把門撐住。許棠只說功能性短句，例如「你先轉，我扶著。」她等男主回應，不直接拿走箱子。 | **CG-COM-01**；`neutral_observant`。 | none |
| 00.4 合力挪箱 | short exchange | 男主調整箱子，她推開卡住的角；動作在數秒內完成。她看門線確認沒有再卡住。 | CG hold 1–2 dialogue advances，之後回 sprite composite。 | none |
| 00.5 Player choice | local branch | 玩家決定第一個回應的 tone：正式、乾式幽默、實際克制。三條均為成年人合理反應。 | `polite_smile` / `dry_playful` / `mild_surprise`。 | tone/stat，見下表 |
| 00.6 名字與門牌 | rejoin | 許棠確認他是 1703 的住戶；兩人交換名字，她指向 1702。不再重述箱角怎麼過門。 | 中景雙門構圖；`neutral_observant → polite_smile`。 | `met_xu_tang=true` |
| 00.7 到此為止 | exit beat | 她以「那以後門口見」或同等低壓語意收尾，進 1702。若前面走幽默分支，她可留一句乾式回扣；其他分支只自然道晚安。 | `soft_goodnight`；門關上，不停留回望。 | base exit |
| 00.8 安靜新家 | coda | 男主把最後一箱拖進門，騰出空間後把椅子側過來搬進 1703。旁白不判斷她是否對自己有興趣；只記住名字與隔壁有人。 | 無人物；門口到室內的短 transition。 | unlock outputs |

## Emotion arc

```text
男主：任務模式／陌生城市
  → 一秒狼狽被看見
  → 有人提供剛好足夠的協助
  → 好奇，但沒有理由延長
  → 回到安靜，空間不再完全匿名

許棠：下班／回家
  → 看見走廊小麻煩
  → 確認對方能協作、不會把幫忙視為理所當然
  → 記住新鄰居的名字
  → 回到自己的生活
```

情緒峰值是「兩個陌生人一起把箱子挪正」，不是對視或外貌描寫。

## Player choice / local branch

Choice prompt 應出現在箱子已挪開、許棠準備鬆手時。不要使用 UI 標籤「幽默／認真／實際」。

| Choice ID | Player-facing intent（可微調字句） | Xu response intent | Stats / flags | Rejoin |
| --- | --- | --- | --- | --- |
| `com00_thank_formal` | 「謝謝。才第一天就麻煩妳。」 | 她說只是剛好，並看一眼箱子是否已離門線。溫和但不擴張話題。 | `mc_tone_formal += 1` | 00.6 |
| `com00_joke_corridor` | 「入住第一晚，差點先把逃生路線堵了。」 | 她停半拍，乾乾回一句，出現第一個小笑。 | `mc_tone_humorous += 1`; `C_XT += 1` | 00.6 |
| `com00_take_weight` | 「我把這箱往裡挪，妳幫我看一下門線。」 | 她接受分工，不把這讀成逞強；看著門線提醒他再挪一點。 | `mc_tone_practical += 1` | 00.6 |

Branch guardrails：

- 不提供稱讚外貌、索取聯絡方式或邀她進門的選項。
- 不因選擇正式／實際就扣關係值；幽默分支的 `C_XT +1` 是微小火花，不是正解。
- 許棠不說「你很有趣」或任何快速 romantic validation。

## Locked playable script

> Dialogue/action/state remain locked. Any `Visual` line below is a historical runtime transcript, not a current render instruction；new rendering uses `content/production/cg-manifests/opening-ch1.json` only。

以下為 S4 使用的完整稿。`[PLAYER_NAME]` 是 implementation token；若 prototype 不允許玩家命名，應在 content integration 時一次替換為 canonical 男主姓名，不得逐幕改成不同稱呼。

### `common_movein_rain_open`

**Visual**：`BG-APT-17F-RAIN`，無人物。遠處電梯門關上；前景三只紙箱。

**Audio**：隔窗雨聲、膠帶被扯開、電梯下行。

**Narration**：搬家公司走了十來分鐘。電梯下去後，十七樓的走廊又聽得見窗外的雨。

**Narration**：還有三只紙箱，一張過不了門框的椅子。先把箱子搬進去，門口空了，再來想椅子的事。

### `common_movein_rain_door`

**Action**：我抬起紙箱右側，箱角卻卡住正在回彈的防火門。我用肩膀頂著門，箱子又往外歪了一點。

**Xu Tang（off-screen）**：欸，等一下。右邊先抬高一點，我扶門。

**Visual**：切入 `CG-COM-01`。

**Protagonist**：喔，好。等我一下……這樣嗎？

**Xu Tang**：嗯，再高一點。你先轉。

**Action**：我把箱子往裡轉。箱角還卡著，她推了一下，門邊終於空出一點餘地。

**Xu Tang**：再一點點。

**Protagonist**：好……好了，過了。

**Action**：箱子落地，她鬆開門。我這才不用再拿肩膀頂著。

### `common_movein_rain_choice`

**Choice prompt**：箱子落地後，許棠鬆開門。

1. `com00_thank_formal` — **「謝謝。才第一天就麻煩妳。」**
2. `com00_joke_corridor` — **「入住第一晚，差點先把逃生路線堵了。」**
3. `com00_take_weight` — **「我把這箱往裡挪，妳幫我看一下門線。」**

#### Branch `com00_thank_formal`

**Visual**：回 `BG-APT-17F-RAIN` + `XT-SPR-WEEKDAY.polite_smile`。

**Xu Tang**：沒事，我剛好要過來。這箱再往裡一點好嗎？門等一下會碰到。

**Protagonist**：啊，對。我以為過了就好了。

**Action**：我把箱子往裡推，讓開門線。

**Protagonist**：這樣呢？

**Xu Tang**：可以了。

**Protagonist**：好，謝謝。這下門能關了。

→ Rejoin `common_movein_rain_names`

#### Branch `com00_joke_corridor`

**Visual**：`XT-SPR-WEEKDAY.dry_playful`。

**Xu Tang**：還好沒成功。

**Protagonist**：嗯，差一點。

**Xu Tang**：再往裡一點就沒事了。不然它還是會碰到。

**Protagonist**：喔，對。我以為過線就好了。

**Action**：我把箱子推離門線。

→ Rejoin `common_movein_rain_names`

#### Branch `com00_take_weight`

**Visual**：`XT-SPR-WEEKDAY.neutral_observant`。

**Xu Tang**：好。再一點點。

**Action**：我把箱子挪離門線；她確認門線淨空。

**Protagonist**：這樣可以嗎？

**Xu Tang**：嗯，可以了。

→ Rejoin `common_movein_rain_names`

### `common_movein_rain_names`

**Xu Tang**：嗯，現在就沒事了。你是 1703 的吧？

**Protagonist**：對，1703。我叫 [PLAYER_NAME]，剛才都忘了介紹自己。

**Action**：她朝隔壁那扇門抬了抬下巴。

**Xu Tang**：我叫許棠，住 1702，就隔壁。

**Protagonist**：喔，原來我們就住隔壁。你好。

**Xu Tang**：你好。

**Visual**：`XT-SPR-WEEKDAY.polite_smile`。

### `common_movein_rain_goodnight`

**Protagonist**：那我先把剩下的搬進去。

**Xu Tang**：好，那你慢慢搬。晚安。

**Protagonist**：好，晚安。

**Action**：許棠刷卡進了 1702。我把最後一箱拖進 1703，門口總算騰出空間。把椅子側過來，椅背斜進門框，椅腳也跟著進去了。

**Visual**：無人物；走廊恢復空景。

**Narration**：門關上後，走廊又只剩雨聲。

**Narration**：至少現在，我知道隔壁住的是誰。

**End actions**：套用本幕 choice state；設定 `met_xu_tang=true` 與姓名／鄰居 knowledge flags；前往 common sequence next target。

## State contract

### Conditions

```yaml
requires: []
forbids: []
```

### Stats

- Base：無 relationship stat 變動。
- Choice-local：僅幽默分支 `C_XT +1`。
- `F_XT` 不在本幕增加；「見過」由旗標表達，下一幕才建立真正熟悉度。

### Flags / knowledge

```yaml
set:
  met_xu_tang: true
  xu_knows_player_name: true
  player_knows_xu_name: true
  xu_knows_player_is_neighbor_1703: true
  player_knows_xu_is_neighbor_1702: true
unset_or_unchanged:
  contact_xu: false
  relationship.xu.romanticSignal: false
```

### Next structural targets

- 解鎖 `COM-01X`。
- `COM-01J` 的 hard prerequisite 也已滿足；Opening Slice 的建議呈現順序仍是先 `COM-01X`、再 `COM-01J`。
- 本幕不改 `recentFocus`、`overlapLevel` 或 exclusivity。

## Runtime / Memory intent

- 建議 runtime 拆成 8–11 個 stable nodes；不要以 `COM-00` 直接當唯一 runtime node ID。
- 建議前綴：`common_movein_rain_*`，例如 `common_movein_rain_door`, `common_movein_rain_choice`, `common_movein_rain_goodnight`。
- Memory title：**雨夜搬家**。
- Current playable Memory cover：`bg.opening.ch1.apt_17f_rain`；Gallery assets 由 Opening Chapter 1 manifest/route mapping 管理。
- Replay anchor：00.1；replay 結束回到本幕既有 frontier，不覆寫後續 knowledge。

## Semantic Visual Beats / CG Manifest Binding

Canonical manifest：`content/production/cg-manifests/opening-ch1.json`。

- `COM00-S02-DOOR-ASSIST`：功能性扶門／挪箱，不是 romantic contact。
- `COM00-S04-BASE-NEUTRAL`：名字與門牌交換的 bounded neighbor distance。
- `COM00-S04-R01-POLITE-SMILE`：base 的小幅 reaction edit。

Camera、screen side、gaze、wardrobe、held object、location、lighting、time/weather、references、include/exclude 與 output identity 只由上述 CG Manifest Entries 決定；本 scene 不再維護第二套 render instructions。

## Dialogue writing notes

### Male protagonist voice lock

- 旁白以觀察、動作與低調自嘲為主；每段 1–2 句。
- 他可以承認「這個角度不太行」，但不把狼狽變成表演。
- 不分析許棠「很有界線感」「外冷內熱」；此時他沒有足夠資訊。
- 不用「漂亮得讓人忘記呼吸」之類 heroine introduction prose。

### Xu Tang voice lock

- 先說可執行的小句：「你先轉。」「再往裡一點。」
- 問句少而具體，不做新鄰居訪談。
- 乾式笑點靠停半拍和短回句，不靠連續吐槽。
- 她幫忙後主動離開，這是角色魅力的一部分，不用旁白解釋。

### Sample line intents（非最終逐字稿）

- 許棠第一句：功能性指示，不是自我介紹。
- 名字交換：許棠確認 1703，男主報上姓名；她才回姓名與 1702。搬入時間已在部分選項中說過，共同段不再追問。
- 收尾：語意是「以後會在門口遇見」，不是「期待再見」。

### Prohibited beats

- 許棠留下幫忙搬完整晚。
- 男主猜中她的工作、個性或感情史。
- 任何聯絡方式交換。
- 英雄救美、肢體失衡接住、長時間碰手。
- 用內心旁白保證這次相遇很重要。

## End state

- 男主與許棠知道彼此姓名、門號位置，仍是幾乎陌生的鄰居。
- 許棠對男主的第一印象由 choice 決定 tone，但沒有 romantic commitment。
- 玩家理解男主能社交，卻不會為延長互動硬找藉口。
- 畫面回到 1703 的紙箱與安靜，留下「生活開始有一個可辨認的隔壁人」的輕微變化。

## Review log

- Player-perspective pass：三個選項都不會讓第一次玩家感到明顯選錯；opening hook 來自生活質地與人物節制，而非事故。
- Character/continuity pass：姓名、門牌與後續便利店叫名均有來源；沒有提前取得工作或聯絡資訊。
- Therapy-speak pass：無人物直接說出 autonomy / intimacy 主題。
- Art redundancy pass：雨夜色彩、許棠外型與物理距離交給 CG；旁白只補聲音、動作與男主決策。
- Locked unresolved items：無。實際逐字台詞仍可在 runtime authoring 時做字數壓縮，但不可改變 voice 與 branch intent。
