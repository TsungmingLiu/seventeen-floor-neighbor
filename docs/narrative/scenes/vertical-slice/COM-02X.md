# COM-02X — 深夜便利店

> **Rendering boundary:** this scene remains canonical for narrative/state/staging and semantic visual beats. Older 9:16/sprite/composite instructions are historical annotations; new render-ready decisions belong to the canonical CG manifest produced by `cg_planner`.


## Status

- Production stage: **S4 Script Lock / S5 State Contract / S6 Art Shot Lock**
- Scope: Opening Vertical Slice / Xu contact-and-contrast
- Memory ownership: `common`
- Progress band: `160`
- Estimated play time: 5–7 minutes
- Lock rule:生活感優先；許棠叫出男主姓名的來源固定為 COM-00 的互相介紹，不得改成偷看包裹、管理室資料或神秘記憶力展示。

## Canonical inputs

- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` — COM-02X
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
- `docs/art/PRODUCTION_VISUAL_DIRECTION.md`
- `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`
- `docs/narrative/scenes/vertical-slice/COM-00.md`
- `docs/narrative/scenes/vertical-slice/COM-01X.md`

## Scene summary

Week 2 前段，約 23:00。男主結束遠端工作後下樓買宵夜，在無品牌便利店的冷藏櫃前遇見穿居家 casual 的許棠。她手上是黑咖啡與一份簡單晚餐，先自然叫出男主名字。談話從附近還開著的食物、各自晚吃的原因，帶到自由接案與遠端工作的零碎作息。她不需要替晚餐時間辯解；玩家可以好奇、分享或輕鬆吐槽，也可以說出帶管理意味的關心，讓她用一句短回覆示範界線。

## Scene goal / dramatic question

- 玩家感受：許棠從雨夜 key visual 裡的漂亮鄰居，變成有 deadline、咖啡與便利店晚餐的普通成年人。
- 男主目標：買一份不需要烹調的宵夜；維持剛形成的鄰居熟悉感。
- 許棠目標：買晚餐回去收尾工作；可以聊幾分鐘，但不接受陌生熟人對她的作息下指導棋。
- Dramatic question：日常疲憊被看見時，對方會一起待在現實裡，還是立刻把它當成需要修正的問題？本幕只給輕微訊號，不做核心考題。

## Unlock / entrance condition

```yaml
requires:
  - COM-01X completed
  - met_xu_tang == true
```

- 時間：Week 2，平日 23:00 左右。
- 地點：公寓步行範圍的無品牌便利店。
- 雙方知道彼此姓名與住處；不知道對方精確職業。
- 許棠的衣著是從家裡臨時下樓可接受的完整居家 casual，不性感化。

## Beat sheet

| Beat | Runtime intent | Action / dialogue intent | Visual / expression | State |
| --- | --- | --- | --- | --- |
| 02X.1 Late aisle | establishing | 男主在冷藏櫃前比較兩個都稱不上晚餐的選項；旁白輕寫他把做飯排除在今晚之外。 | `BG-CONVENIENCE-NIGHT`；冷白光、窗外濕夜。 | none |
| 02X.2 Name first | recognition | 許棠從飲料櫃另一側先叫男主名字，語氣像確認，不像驚喜。男主轉身看到她手裡的咖啡與餐盒。 | **CG-COM-03 trigger**；`tired → caught_off_guard`。 | none |
| 02X.3 Mutual evidence | grounding | 她看一眼男主手上的宵夜，他也看一眼她的；兩人都沒有資格評論對方。她可乾乾說「看來不是只有我把晚餐拖到現在。」 | CG hold → sprite。`teasing / small_smile`。 | none |
| 02X.4 Player choice | local branch | 玩家談附近食物、分享工作拖晚、開輕微同盟玩笑，或提出規訓式關心。 | expressions vary。 | stats/pattern，見下表 |
| 02X.5 Work texture | rejoin | 許棠只透露「客戶明早要看／印刷前要改完」等具體工作情境；男主以自己剛結束 deployment／review 的等量資訊交換。兩人都不講完整履歷。 | `tired`, `dry_resignation`, `small_smile`。 | none |
| 02X.6 Nearby recommendation | relationship texture | 她指出附近某間粥店／麵店其實還開著，但今晚自己懶得繞；男主可記住。這不是她替他安排晚餐。 | aisle-to-checkout blocking。 | none |
| 02X.7 Checkout split | exit | 兩人前後結帳；不安排「我請妳」。走到店外後一起走同一小段回公寓，再因步速／拿東西自然錯半步。 | night exterior transition；`sleepy_annoyed` 可用於自嘲 deadline，不對男主。 | `F_XT +=1` |
| 02X.8 Elevator/lobby goodbye | coda | 她說「先走了，我還有兩個版本要改。」男主不提出幫她看設計。 | `soft small_smile`；不另進 COM-01X 電梯重演。 | exit |

## Emotion arc

```text
彼此撞見不精緻的深夜狀態
  → 一秒「你也差不多」的平等感
  → 用食物／工作交換有限私人資訊
  → choice 顯示男主把關心當陪伴、好奇或管理
  → 許棠保留自己的決定，仍願意一起走回去
  → 熟悉度增加，但沒有被照顧成戀愛事件
```

## Player choice / local branch

Choice 出現在許棠說「看來不是只有我」之後。

| Choice ID | Player-facing intent（可微調字句） | Xu response intent | Stats / flags | Rejoin |
| --- | --- | --- | --- | --- |
| `com02x_ask_food` | 「附近這個時間，除了這裡還有能吃的嗎？」 | 她給一個真正實用的選項，順便說自己今晚不想多走五分鐘。 | `F_XT +1` bonus; `mc_tone_practical +=1` | 02X.5 |
| `com02x_share_work` | 「我也是剛收工。現在煮飯已經超出今晚的版本範圍。」 | 她問一句「你也在家工作？」讓職業輪廓自然出現；乾回「那我們都選擇先能運作。」 | `T_XT +1`; `mc_tone_humorous +=1` | 02X.5 |
| `com02x_tease_same` | 「至少妳拿的看起來比我的像晚餐。」 | 她比較兩份餐盒，回一句不過度熱絡的勝負判定。 | `C_XT +1` | 02X.5 |
| `com02x_tell_eat_better` | 「妳這樣常常太晚吃，身體會撐不住。」 | 她平靜回「今天晚，不等於每天晚。」然後把話題轉回男主手上的宵夜；沒有爆氣。 | `K_XT -1`; `xt_advice_tendency +=1`; **不增加** `xt_boundary_strikes` | 02X.5 |

Base scene exit 另有 `F_XT +1`；`com02x_ask_food` 的 bonus 代表共享 neighborhood knowledge，因此該路徑本幕鎖定為合計 `F_XT +2`。

## Locked playable script

### `common_convenience_xu_enter`

**Visual**：`BG-CONVENIENCE-NIGHT`，冷藏櫃近景，窗外濕夜。無人物。

**Narration**：晚上十一點，做飯已經從選項降成了明天的待辦事項。

**Narration**：我在兩份微波食品前站了太久，仍然沒有得到比較成熟的答案。

**Xu Tang（off-screen）**：[PLAYER_NAME]？

### `common_convenience_xu_recognize`

**Visual**：切入 `CG-COM-03`。

**Action**：男主轉身。許棠一手拿黑咖啡，另一手提著簡單餐盒。

**Protagonist**：嗨。

**Xu Tang**：你也現在才吃？

**Protagonist**：看來是。

**Xu Tang**：那至少不是只有我把晚餐拖到宵夜。

**Visual**：回 BG + `XT-SPR-LATE-CASUAL.teasing`。

### `common_convenience_xu_choice`

1. `com02x_ask_food` — **「附近這個時間，除了這裡還有能吃的嗎？」**
2. `com02x_share_work` — **「我也是剛收工。現在煮飯已經超出今晚的版本範圍。」**
3. `com02x_tease_same` — **「至少妳拿的看起來比我的像晚餐。」**
4. `com02x_tell_eat_better` — **「妳這樣常常太晚吃，身體會撐不住。」**

#### Branch `com02x_ask_food`

**Protagonist**：附近這個時間，除了這裡還有能吃的嗎？

**Xu Tang**：巷口那間粥店開到十二點。

**Xu Tang**：但要多走五分鐘。我今晚沒有那五分鐘。

**Protagonist**：這個條件很有說服力。

→ Rejoin `common_convenience_xu_work`

#### Branch `com02x_share_work`

**Protagonist**：我也是剛收工。現在煮飯已經超出今晚的版本範圍。

**Xu Tang**：你也在家工作？

**Protagonist**：大部分時間。剛才有一個上線前的問題。

**Xu Tang**：那我們都選擇先能運作。

→ Rejoin `common_convenience_xu_work`

#### Branch `com02x_tease_same`

**Protagonist**：至少妳拿的看起來比我的像晚餐。

**Action**：許棠看一眼兩人手上的餐盒。

**Xu Tang**：我的有兩種顏色。暫時領先。

**Protagonist**：我接受判定。

→ Rejoin `common_convenience_xu_work`

#### Branch `com02x_tell_eat_better`

**Protagonist**：妳這樣常常太晚吃，身體會撐不住。

**Visual**：`XT-SPR-LATE-CASUAL.tired`，笑意收回，但不進 conflict expression。

**Xu Tang**：今天晚，不等於每天晚。

**Action**：她看向男主手上的微波食品。

**Xu Tang**：而且你現在好像不太適合做這個提醒。

**Protagonist**：公平。

→ Rejoin `common_convenience_xu_work`

### `common_convenience_xu_work`

**Visual**：`XT-SPR-LATE-CASUAL.sleepy_annoyed`。

**Xu Tang**：客戶明早要看最後一版。

**Protagonist**：所以咖啡是工作配備。

**Xu Tang**：咖啡是錯誤決策。工作配備在家裡。

**Protagonist**：設計案？

**Xu Tang**：嗯，印刷前最後一輪。通常「最後」不是很準。

**Narration**：她沒有把案子說得很慘。我也沒有問一個剛認識的鄰居，為什麼不早點做完。

### `common_convenience_xu_checkout`

**Action**：兩人前後結帳，各付各的。走出店門後，同方向往公寓走。

**Xu Tang**：你如果哪天真的想吃熱的，剛才那間粥店週三休。

**Protagonist**：這個資訊比營業時間更重要。

**Xu Tang**：我也是白走一次才知道。

### `common_convenience_xu_exit`

**Action**：到公寓門口，許棠抬了抬手裡的咖啡。

**Xu Tang**：我先上去。還有兩個「最後版本」。

**Protagonist**：祝它們真的是最後。

**Xu Tang**：你剛搬來，還可以保留這種樂觀。

**Visual**：`XT-SPR-LATE-CASUAL.small_smile`。

**Protagonist**：晚安。

**Xu Tang**：晚安。

**End actions**：套用 choice stats；`relationship.xu.familiarity +=1`；設定雙方工作輪廓 knowledge；前往 common sequence next target。

## State contract

### Conditions

```yaml
requires:
  - COM-01X completed
  - met_xu_tang == true
```

### Stats

```yaml
base:
  relationship.xu.familiarity: +1
choice_local:
  ask_food: { familiarity: +1 }
  share_work: { trust: +1 }
  tease_same: { chemistry: +1 }
  tell_eat_better: { compatibility: -1 }
```

### Flags / knowledge

```yaml
set:
  player_knows_xu_freelance_creative_work: true
  xu_knows_player_remote_tech_work: true
conditional:
  xt_advice_tendency: +1  # only tell_eat_better
unchanged:
  contact_xu: false
  xt_boundary_strikes: 0
  relationship.xu.romanticSignal: false
```

- 此處只知道職業輪廓，不知道公司、收入、客戶或完整背景。
- `xt_advice_tendency` 是早期 pattern telemetry；單次不構成 `control_pattern`。

### Next structural targets

- 許棠 thread 進入 `COM-03X`。
- Common ordering 轉至 `COM-02J`，讓兩位角色在相近時間各得到一幕日常質地。

## Runtime / Memory intent

- 建議拆成 10–13 個 nodes，前綴 `common_convenience_xu_*`。
- Memory title：**深夜便利店**。
- Memory cover：`CG-COM-03`；未生成時用 BG + `XT-SPR-LATE-CASUAL` composite。
- 本幕可在後續 RE-X 用「同一間便利店」作自然 callback。

## Art needs

### Background

- `BG-CONVENIENCE-NIGHT` — P0。
- 冷白店內、冷藏櫃、簡單餐食區；窗外濕潤台北夜景。
- 所有包裝與價牌無真實商標、不可讀亂碼不作焦點。

### Sprite

- `XT-SPR-LATE-CASUAL` — canonical Wardrobe A / Look 02 Late-night Convenience Store。
- Required expressions：`tired`, `caught_off_guard`, `small_smile`, `teasing`, `sleepy_annoyed`，均取自 canonical Late Casual set。
- Props：黑咖啡、簡單晚餐／餐盒、小型購物籃擇一；不要同時塞滿雙手。

### CG

- `CG-COM-03` — P1。
- 價值：讓玩家第一次看到許棠非「鄰居出場狀態」的疲憊生活面；服裝、燈光和餐盒共同敘事，不能拍成便利店 pin-up。

## Art shot lock

### Shot A — Refrigerator aisle establish（locked）

- Camera：男主 POV，冷藏櫃形成側向透視；男主手中餐盒可在畫面下緣但不遮 UI。
- 先讓玩家讀到「深夜買食物」，再讓許棠進場。

### Shot B — CG-COM-03（locked）

- Trigger：許棠第一次叫出男主姓名，他轉身的瞬間。
- Camera：9:16 candid，腰至膝以上或略廣；不生成男主臉。
- Composition：許棠在上半中右，手上咖啡／晚餐在中段；冷藏櫃與窗外濕夜同時可讀。
- Head pose / gaze：原先低頭確認商品，叫名時抬眼；視線不是模特直視，身體仍朝結帳／取物動線。
- Expression：`tired` 裡帶一點認出熟人的鬆動；不大笑、不明顯臉紅。
- Wardrobe：嚴格沿用 XT Wardrobe A Look 02；完整居家外出穿著，不裸露、不腿部 fetish framing。
- Lighting：冷白 fluorescent；窗外冷藍濕夜；不使用 beauty commercial rim light。
- Safe zone：下方 25% 保持低資訊；臉、餐盒與手在上中段。
- Negative constraints：無品牌、無性感 pose、無誇張胸腰比例、無高跟鞋臨時搭配、無錯誤手指。
- Hold / exit：保留至「看來不是只有我」；choice 前切回 sprite composite。

### Shot C — Walk-back transition（locked）

- 不新增專用 BG／CG；以店外窗面與公寓方向的簡短 transition 表現一起走回去。
- 兩人不共傘、不牽手、不交換購物袋。

## Dialogue writing notes

### Xu Tang

- 疲憊時語句更短，但不是脾氣差。
- 她叫名字自然，不加「居然又遇到你」。
- 談工作只給 deadline 的具體一角；不一次解釋 freelance 身份焦慮。
- 被規訓式關心時用事實校正，不上價值課：「今天晚，不等於每天晚。」

### Male protagonist

- 可以同樣承認自己的宵夜與晚收工，不占據高位照顧她。
- 不猜她吃不飽、替她買更健康的餐或要求她回家報平安。
- 不主動提出看設計／解決 client 問題；他目前不具備 context。

### Voice contrast target

- 許棠的日常談話靠共享現實與短回扣累積熟悉。
- 她不像雨澄因興趣而突然長篇；即使談工作也維持精簡，讓停頓與一起走回家承擔親近感。

### Prohibited beats

- 男主替她付錢、搶走餐盒、強迫換健康晚餐。
- 許棠為 23:00 吃飯道歉或交代完整原因。
- 居家服色情化、便利店偶遇拍成性感事件。
- 因一次界線選項直接重罰或改變 route。

## End state

- 雙方知道對方的工作輪廓與晚間作息偶爾不規則。
- `F_XT +1` base；choice 可增加一項小幅關係 texture。
- 許棠第一次在玩家面前以 tired/casual 狀態存在，仍保有決定自己晚餐與回家時間的主導權。
- 下一次包裹事件可從「她做設計／需要印刷樣本」自然延伸，不會像新資訊硬塞。

## Review log

- Player-perspective pass：相遇有地理必然性，談話長度符合兩個住同棟的人在深夜順路同行。
- Character/continuity pass：姓名來源回扣 COM-00；職業只揭露到能支撐 COM-03X。
- Choice pass：規訓式關心有可感知但可修復的差異，不是一鍵壞結局。
- Art pass：CG 以疲憊與生活物件敘事，不與 sprite 重複擺拍。
- Locked unresolved items：實際 tuning 時決定 `ask_food` 是否保留額外 `F +1`。
