# COM-00 — 雨夜搬家

> **Rendering supersession notice (2026-09-24):** this scene remains canonical for narrative, state, staging, wardrobe, expression, action timing, and continuity. Any older **9:16 / sprite / composite-rendering instruction** in this file is superseded for NEW production by `docs/art/PRODUCTION_VISUAL_DIRECTION.md` and the current Shot Planner harness. Do not rewrite narrative staging merely to preserve the old rendering mode.


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
- `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`
- `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`
- `docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md` — CG-COM-01
- `docs/proposals/urban-dating-sim-setting-proposal.md`

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
| 00.6 名字與門牌 | rejoin | 許棠用「剛搬來？」確認，而非盤問。兩人交換名字；她指向 1702，男主說 1703。她不問工作、收入或感情狀態。 | 中景雙門構圖；`neutral_observant → polite_smile`。 | `met_xu_tang=true` |
| 00.7 到此為止 | exit beat | 她以「那以後門口見」或同等低壓語意收尾，進 1702。若前面走幽默分支，她可留一句乾式回扣；其他分支只自然道晚安。 | `soft_goodnight`；門關上，不停留回望。 | base exit |
| 00.8 安靜新家 | coda | 男主把最後一箱拖進門。旁白不判斷她是否對自己有興趣；只記住名字與隔壁有人。 | 無人物；門口到室內的短 transition。 | unlock outputs |

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
| `com00_thank_formal` | 「謝謝，第一天就麻煩妳。」 | 她說只是剛好，並看一眼箱子是否已離門線。溫和但不擴張話題。 | `mc_tone_formal += 1` | 00.6 |
| `com00_joke_corridor` | 「入住第一晚，先從不佔用逃生路線開始。」 | 她停半拍，乾乾回一句類似「目標很務實。」出現第一個小笑。 | `mc_tone_humorous += 1`; `C_XT += 1` | 00.6 |
| `com00_take_weight` | 「我來抬就好，妳幫我留著門。」 | 她接受分工，不把這讀成逞強；回一句「好，那你往裡一點。」 | `mc_tone_practical += 1` | 00.6 |

Branch guardrails：

- 不提供稱讚外貌、索取聯絡方式或邀她進門的選項。
- 不因選擇正式／實際就扣關係值；幽默分支的 `C_XT +1` 是微小火花，不是正解。
- 許棠不說「你很有趣」或任何快速 romantic validation。

## Locked playable script

以下為 S4 使用的完整精簡稿。`[PLAYER_NAME]` 是 implementation token；若 prototype 不允許玩家命名，應在 content integration 時一次替換為 canonical 男主姓名，不得逐幕改成不同稱呼。

### `common_movein_rain_open`

**Visual**：`BG-APT-17F-RAIN`，無人物。遠處電梯門關上；前景三只紙箱。

**Audio**：隔窗雨聲、膠帶被扯開、電梯下行。

**Narration**：搬家公司走了十分鐘。走廊上還剩三箱，和一張怎麼都過不了門框的椅子。

**Narration**：我先處理箱子。椅子可以留給明天的自己後悔。

### `common_movein_rain_door`

**Action**：男主抬起紙箱右側；箱角卡住正在回彈的防火門。

**Narration**：我用肩膀頂住門，箱子卻選了另一個方向。

**Xu Tang（off-screen）**：等一下。

**Visual**：切入 `CG-COM-01`。

**Xu Tang**：你先把右邊抬高。我扶著門。

**Protagonist**：好。

**Action**：箱子向內轉過門線。許棠只在箱角仍卡住時推了一下。

**Xu Tang**：再一點。

**Protagonist**：過了。

### `common_movein_rain_choice`

**Choice prompt**：箱子落地後，許棠鬆開門。

1. `com00_thank_formal` — **「謝謝，第一天就麻煩妳。」**
2. `com00_joke_corridor` — **「入住第一晚，先從不佔用逃生路線開始。」**
3. `com00_take_weight` — **「我來抬就好，妳幫我留著門。」**

#### Branch `com00_thank_formal`

**Visual**：回 `BG-APT-17F-RAIN` + `XT-SPR-WEEKDAY.polite_smile`。

**Xu Tang**：只是剛好。

**Xu Tang**：不過這箱再往裡一點，門才關得上。

**Action**：男主把箱子推離門線。

→ Rejoin `common_movein_rain_names`

#### Branch `com00_joke_corridor`

**Visual**：`XT-SPR-WEEKDAY.dry_playful`。

**Xu Tang**：目標很務實。

**Protagonist**：先從做得到的開始。

**Xu Tang**：那這箱再往裡一點。

**Action**：男主把箱子推離門線。

→ Rejoin `common_movein_rain_names`

#### Branch `com00_take_weight`

**Visual**：`XT-SPR-WEEKDAY.neutral_observant`。

**Xu Tang**：好。你往裡，我顧門。

**Protagonist**：三、二——

**Xu Tang**：不用數，已經過了。

**Action**：男主把箱子落地；她確認門線淨空。

→ Rejoin `common_movein_rain_names`

### `common_movein_rain_names`

**Xu Tang**：剛搬來？

**Protagonist**：嗯，1703。

**Narration**：我報了名字。她朝隔壁那扇門抬了抬下巴。

**Xu Tang**：許棠。1702。

**Protagonist**：謝謝，許小姐。

**Xu Tang**：叫許棠就好。住隔壁一直叫許小姐，會有點像管委會。

**Visual**：`XT-SPR-WEEKDAY.polite_smile`。

### `common_movein_rain_goodnight`

**Xu Tang**：那你繼續忙。晚安。

**Protagonist**：晚安。

**Action**：她刷卡進 1702，沒有回頭停留。男主把最後一箱拖進 1703。

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
- Memory cover：`CG-COM-01`。
- Replay anchor：00.1；replay 結束回到本幕既有 frontier，不覆寫後續 knowledge。

## Art needs

### Background

- `BG-APT-17F-RAIN` — P0，9:16。
- 同一 17 樓 layout 必須可與日後 `BG-APT-17F-NIGHT` 對位；1702／1703 空間關係在本幕鎖定。
- 室內走廊保持乾燥；雨感來自遠端窗光、雨聲與鞋底微反光。

### Sprite

- `XT-SPR-WEEKDAY` — Wardrobe A / Look 01 Weekday Neighbor。
- Required expressions：`neutral_observant`, `mild_surprise`, `polite_smile`, `dry_playful`, `soft_goodnight`。
- 角色為 27 歲、約 170 cm 的成熟都市女性；服裝與金色 hoop earrings 以 canonical reference pack 為準。

### CG

- `CG-COM-01` — P0 / opening hero image。
- 這張 CG 值得製作，因為它一次鎖定作品的都市雨夜質地、兩人的初始物理距離、許棠「協助但不接管」的動作。

## Art shot lock

### Shot A — Opening establishing（BG composite）

- Camera：男主視高，沿走廊略帶透視；箱子只佔前景一側。
- Focal point：卡門的箱角與尚未出現人物的走廊深度。
- UI safe zone：下方 25% 不放門牌或關鍵手勢。
- Duration：2–3 narration advances。

### Shot B — CG-COM-01（locked）

- Trigger：許棠的手撐住門，說完第一句功能性台詞後；在交換姓名以前。
- Camera：第一人稱，略靠近走廊入口；不得生成男主完整臉。
- Composition：許棠位於上半右側或中右；一手扶門、一手協助挪箱，動作重心可信。紙箱形成前景層次。
- Head pose / gaze：下巴自然，視線先落在箱角／男主手部，再短暫抬到男主；禁止正面模特凝視。
- Expression：`neutral_observant`，只有極淡禮貌柔和，不是戀愛驚艷。
- Lighting：暖色走廊 practical light 對冷藍雨夜 ambient light。
- Dialogue safe zone：左下至下中；臉、扶門手、箱角均不得落入最底 25%。
- Negative constraints：無濕透衣服、無豪宅 penthouse、無額外搬家工人、無品牌字樣、無多餘手指、無強烈曖昧 pose。
- Hold / exit：保留至箱子移開；姓名交換前 dissolve 回 sprite composite，避免整段對話被 CG 固定表情綁死。

### Shot C — Door geography lock（BG + sprite）

- 1702 與 1703 的相對位置要能一眼讀懂，但不以可讀大字門牌佔畫面。
- 許棠站在自己回家動線上；她不走近男主家門，也不回頭擺 pose。

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
- 名字交換：男主先說自己剛搬 1703；她才回姓名與 1702。
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
