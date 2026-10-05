# COM-02X — 深夜便利店

## Current authorized weekend/weekday design — ND-ARC-001

- Lifecycle: **CANONICAL** task-local Narrative Design amendment, 2026-10-04. Source ref: `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9`. Human 授權本輪方向與必要改寫；本 pass 沒有新 final prose、QA、runtime 或 CG acceptance。
- Owning design: `docs/narrative/JYC_WEEKEND_WEEKDAY_REVISION.md`；current contract: `content/production/narrative/opening-ch1/COM-02X.json`。此 design section 與 current JSON 取代下方 baseline 的衝突時序／gate；下方舊 Locked prose 與其歷史 binding 完整保留作局部改寫或相容性參考，不是本輪新 Script Lock。
- 同週末晚間兩種生活的合流：四個 dialogue unit 之一。改 Week 2 為同週末約 23:00，bookstore 支聊原本想買且已買的書、許棠接話；home 支聊拆箱／居家工作。食物／微波／送印 deadline／互知工作輪廓／各自結帳與回家保留。share_work choice 和 shared work 依實際日程改局部 prose，bookstore 支不能假稱剛工作收工。原 choice IDs 全保留；下游包裹所需職業與她 deadline 資訊兩支必有。出口回 common_weekday_outing_work。
- Stable ID plan：common_convenience_xu_weekend_book/home/merge；所有舊 common_convenience_xu_* 和 com02x_* IDs 保留。
- 永久排除：本輪 `com01b_weekday_street_walk` 才寫 `jyc_permanently_excluded=true`。此 flag 先於 contact/history，永不由 merge、reload、scheduler、public shared scene 或 ordinary invite 清除。Memory replay 限自己的 snapshot，不向 live 主線寫入；改走前一分岔屬另一 playthrough，不是本輪 reopening。
- Semantic visual impact 與四個必要 dialogue units 見 owning design；現有 accepted image bytes、QA/Human 歷史都保留。獨立下游才裁決哪些畫面可重用。

## Current bounded scene dialogue — CW-COM-02X-001

- 本輪只修 COM-02X 的週末時序、實際日程 variant 與合流話題；下方 playable script 是本輪待獨立 Narrative QA 的 scene-dialogue output，不繼承舊 Script Lock／Art Lock approval。
- `common_convenience_xu_weekend_book`、`common_convenience_xu_weekend_home` 是可各自投影的入口；`common_convenience_xu_weekend_merge` 是真實合流。所有原 `common_convenience_xu_*`／`com02x_*` IDs 保留。
- 一次 bounded naturalization sweep 已完成。只調整口語銜接、避免互斥日程與重複 disclosure；未改 current Narrative Continuity Contract、choice effects、runtime 或 accepted image bytes。


> **Rendering boundary:** this scene remains canonical for narrative/state/staging and semantic visual beats. Older 9:16/sprite/composite instructions are historical annotations; new render-ready decisions belong to the canonical CG manifest produced by `cg_planner`.


## Status

- Production stage: **S4 Script Lock**（本輪 scene-dialogue 結構與文字已定稿；independent Narrative QA pending）。此標記不授予本輪 Narrative QA／visual／runtime／Human acceptance；下方舊 S5/S6／art annotations 保留其歷史 scope。
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

## Narrative Continuity Contract

- Canonical contract：`content/production/narrative/opening-ch1/COM-02X.json`。
- Entry / exit 都維持 `familiar_neighbors_with_boundaries`；本幕增加的是生活質地與有限工作資訊，不交換聯絡方式，也不產生 romantic signal。
- Runtime 的 `F_XT` / `T_XT` / `C_XT` / `K_XT` 與 `xt_advice_tendency` 只屬 implementation mapping，不定義創作上的親密層級。
## Scene summary

同一個晴天週末，約 23:00。男主下午買到原本想找的設定集、回家看書，或留在家拆箱後工作，晚間下樓買宵夜，在無品牌便利店的冷藏櫃前遇見穿居家 casual 的許棠。她手上是黑咖啡與一份簡單晚餐，先自然叫出男主名字。兩人先聊食物，等微波時男主提到各自實際發生的週末生活；許棠接話，再由手機通知、微波等待與送印期限自然交換有限的工作輪廓。她不需要替晚餐時間辯解；玩家可以好奇、分享或輕鬆吐槽，也可以說出帶管理意味的關心，讓她用一句短回覆示範界線。

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
  - weekend choice completed: com01b_bookstore_go | com01b_bookstore_skip
  - bookstore path only: weekend_book_purchased == true
```

- 時間：同一個晴天週末，23:00 左右；不新增當晚下雨的前事。
- 地點：公寓步行範圍的無品牌便利店。
- 雙方知道彼此姓名與住處；不知道對方精確職業。
- 許棠的衣著是從家裡臨時下樓可接受的完整居家 casual，不性感化。

## Beat sheet

| Beat | Runtime intent | Action / dialogue intent | Visual / expression | State |
| --- | --- | --- | --- | --- |
| 02X.1 Late aisle | establishing | 男主在冷藏櫃前比較兩個都稱不上晚餐的選項；旁白輕寫他把做飯排除在今晚之外。 | 深夜冷白光；窗外普通乾燥夜景。舊濕夜畫面須獨立 review。 | none |
| 02X.2 Name first | recognition | 許棠從飲料櫃另一側先叫男主名字，語氣像確認，不像驚喜。男主轉身看到她手裡的咖啡與餐盒。 | **CG-COM-03 trigger**；`tired → caught_off_guard`。 | none |
| 02X.3 Mutual evidence | grounding | 她看一眼男主手上的宵夜，他也看一眼她的；兩人都沒有資格評論對方。半秒沉默後，她只說「喔。那差不多。」 | CG hold → sprite。`teasing / small_smile`。 | none |
| 02X.4 Player choice | local branch | 玩家談附近食物、分享工作拖晚、開輕微同盟玩笑，或提出規訓式關心。 | expressions vary。 | stats/pattern，見下表 |
| 02X.5 Weekend texture / work rejoin | conditional → true merge | 等微波時，購書支聊原本想買且今日已買的設定集；留家支聊拆箱與工作。她接話；手機通知引出男主軟體／居家工作輪廓，再自然合流到許棠「明早客戶看／過了送印」與視覺設計澄清。 | 普通站等、餐盒／黑咖啡／手機；購書支的書已留家，不必顯示新書 prop。 | actual day retained |
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

Choice 出現在許棠說「喔。那差不多。」、畫面切回 BG + sprite 之後。

| Choice ID | Player-facing intent | Xu response intent | Stats / flags | Rejoin |
| --- | --- | --- | --- | --- |
| `com02x_ask_food` | 「附近這個時間，還有別的能吃嗎？」 | 她先給一個方向／位置輪廓；具體店家資訊留到 shared walk-back，確保不是只有此 branch 才成立。 | `F_XT +1` bonus; `mc_tone_practical +=1` | 02X.5 |
| `com02x_share_work` | 購書支「我下午出去了，回來也沒煮。現在能微波就算有煮了。」；留家支保留「我也剛收工。現在能微波就算有煮了。」 | 她接住實際日程；不獨占 remote/tech knowledge，所有 choice 都經過週末 variant 與共享工作段。 | `T_XT +1`; `mc_tone_humorous +=1` | 02X.5 |
| `com02x_tease_same` | 「至少妳那盒看起來比我的像晚餐。」 | 她看兩份餐盒，給一個很普通、沒有刻意做 punchline 的比較。 | `C_XT +1` | 02X.5 |
| `com02x_tell_eat_better` | 「妳如果常常都這麼晚吃，還是要注意一下吧。」 | 她用事實校正「沒有常常，今天而已」，不升級衝突；男主也不漂亮地把話圓回來。 | `K_XT -1`; `xt_advice_tendency +=1`; **不增加** `xt_boundary_strikes` | 02X.5 |

Base scene exit 另有 `F_XT +1`；`com02x_ask_food` 的 bonus 保持鎖定，代表玩家主動進入 neighborhood-knowledge 對話，而不是只有該路徑才取得必要店家資訊。

## Locked playable script

Current scene-dialogue revision；independent Narrative QA pending。本標題只供既有 canonical packet generator 擷取定稿文字，不代替新 QA／Human approval。

### Exact variant selector / rejoin markers

以下是本 scene 的確定 authoring selector；`choice_history` 指既有實際 choice history，不新增 `weekend_route` runtime 欄位。Integrator 依現有 schema 編譯條件，保留原 node／choice IDs。

```yaml
selector:
  source: choice_history
  choice_node: common_bookstore_bridge_weekend_decision
  cases:
    com01b_bookstore_go:
      requires: { weekend_book_purchased: true }
      entry: common_convenience_xu_weekend_book
    com01b_bookstore_skip:
      entry: common_convenience_xu_weekend_home
  on_unknown: blocked_missing_actual_weekend_history
after_each_local_choice_reply: selector
rejoin:
  common_convenience_xu_weekend_book: common_convenience_xu_weekend_merge
  common_convenience_xu_weekend_home: common_convenience_xu_weekend_merge
  common_convenience_xu_weekend_merge: common_convenience_xu_work
exit_next: common_weekday_outing_work
```

`com02x_share_work` 的 menu wording 與 spoken response 使用同一 selector；不以未來的咖啡 contact／遇見狀態猜測週末日程。購書 variant 不向許棠透露第三人的存在。兩支只合流共同工作與食物 knowledge，不覆寫實際日程 history。

### `common_convenience_xu_enter`

**Visual**：便利店冷白光與冷藏櫃，窗外普通深夜街景。無人物；不宣告舊濕夜 asset 可直接 reuse。

**Narration**：晚上十一點多，我打開冰箱看了一遍，又關上。裡面的東西不是不能吃，只是都得先開火。

**Narration**：便利店冷藏櫃裡有兩盒看起來差不多的飯。我把其中一盒放回去，拿了標著加熱四分鐘的那盒。

**Xu Tang（off-screen）**：[PLAYER_NAME]？

### `common_convenience_xu_recognize`

**Visual**：切入 `CG-COM-03`。

**Action**：我轉身。許棠一手拿黑咖啡，另一手提著簡單餐盒。

**Protagonist**：欸，許棠。妳也下來買東西？

**Xu Tang**：嗯。你還沒吃？

**Protagonist**：還沒。本來想在家弄點什麼，打開冰箱又關起來了。

**Xu Tang**：喔，我懂。

**Action**：她低頭看了一眼我手上的餐盒，又看看自己那盒。

**Action**：我也看了她手上的餐盒。兩人停了半秒，冷藏櫃壓縮機重新響起來。

**Xu Tang**：你那盒也要加熱？

**Protagonist**：對。我剛剛挑半天，結果只是挑了比較快的。

**Xu Tang**：喔。那差不多。

**Visual**：回 BG + `XT-SPR-LATE-CASUAL.teasing`。

### `common_convenience_xu_choice`

1. `com02x_ask_food` — **「附近這個時間，還有別的店開著嗎？我每次下來都只看到這間。」**
2. `com02x_share_work` — **購書支：「我下午出去了，回來也沒煮。現在能微波就算有煮了。」／留家支：「我也剛收工。現在能微波就算有煮了。」**
3. `com02x_tease_same` — **「妳那盒至少比我這個像一餐。」**
4. `com02x_tell_eat_better` — **「妳如果常常都拖到這麼晚才吃，還是要注意一下吧。」**

#### Branch `com02x_ask_food`

**Protagonist**：附近這個時間，還有別的店開著嗎？我每次下來都只看到這間。

**Xu Tang**：有啊，過了前面那個路口還有一間。等出去比較好指。

**Action**：她往玻璃門外看了一眼，又看回我手裡的餐盒。

**Xu Tang**：不過你已經拿了。是想現在去吃嗎？

**Protagonist**：沒有，今天就這盒了。我是想下次別又站在這裡挑半天。

**Xu Tang**：喔。這附近白天看不太出來，晚上還有幾家沒收。

**Protagonist**：我搬來之後，晚上真的沒走過別條路。

→ 依 exact weekend selector 進入 `common_convenience_xu_weekend_book` 或 `common_convenience_xu_weekend_home`。

#### Branch `com02x_share_work`

**When `com01b_bookstore_go` + `weekend_book_purchased == true`**：

**Protagonist**：我下午出去了，回來也沒煮。現在能微波就算有煮了。

**Xu Tang**：嗯。我剛剛也在想要不要出來，坐著想了好一會兒。

**Protagonist**：結果還是都來了。

**Action**：許棠點點頭，把餐盒往自己手裡攏了攏。

**When `com01b_bookstore_skip`**：

**Protagonist**：我也剛收工。現在能微波就算有煮了。

**Xu Tang**：你也是忙到現在？

**Protagonist**：剛才才關電腦。原本想叫外送，又覺得下樓可能快一點。

**Xu Tang**：嗯。我剛剛也在想要不要出來，坐著想了好一會兒。

**Protagonist**：結果還是都來了。

**Action**：許棠點點頭，把餐盒往自己手裡攏了攏。

→ 各自進入 `common_convenience_xu_weekend_book`／`common_convenience_xu_weekend_home`；不增加額外 choice effect。

#### Branch `com02x_tease_same`

**Protagonist**：妳那盒至少比我這個像一餐。

**Xu Tang**：是嗎？我拿的時候還嫌它小盒。

**Protagonist**：至少有點綠色的。我這盒從外面看只有飯。

**Action**：許棠低頭看了一眼透明盒蓋。

**Xu Tang**：那是蔥。只有蔥。

**Protagonist**：喔，我沒看清。

**Xu Tang**：嗯。也算有一點綠色啦。

**Action**：她嘴角動了一下。我低頭把手上的餐盒轉了半圈，還是看不出裡面有什麼菜。

→ 依 exact weekend selector 進入 `common_convenience_xu_weekend_book` 或 `common_convenience_xu_weekend_home`。

#### Branch `com02x_tell_eat_better`

**Protagonist**：妳如果常常都拖到這麼晚才吃，還是要注意一下吧。

**Visual**：`XT-SPR-LATE-CASUAL.tired`，笑意收回，但不進 conflict expression。

**Xu Tang**：沒有常常。今天有事趕，才弄到現在。

**Protagonist**：喔。是我亂猜了。

**Action**：許棠把咖啡換到另一隻手，往旁邊讓了一點，給要拿商品的人過。

**Xu Tang**：嗯。

**Action**：兩人各自看了幾秒架上的東西。我把餐盒拿穩，沒有再接這句。

→ 依 exact weekend selector 進入 `common_convenience_xu_weekend_book` 或 `common_convenience_xu_weekend_home`。

### `common_convenience_xu_weekend_book`

**When**：`choice_history[common_bookstore_bridge_weekend_decision] == com01b_bookstore_go` 且 `weekend_book_purchased == true`。

**Action**：櫃檯前的人拿走加熱好的晚餐，店員問下一盒是誰的。我應了一聲，把餐盒遞過去。許棠跟著往前挪，等另一台微波爐空出來。

**Protagonist**：對了，我下午去了妳說的那間書店。

**Xu Tang**：喔。有找到要買的嗎？

**Protagonist**：有，我本來就想買的那本設定集，今天買到了。回家一直翻，晚餐就沒弄。

**Xu Tang**：設定集？遊戲的那種？

**Protagonist**：嗯。有地圖、角色設定，還有一些遊戲裡沒講到的東西。

**Xu Tang**：那應該滿厚的吧？

**Protagonist**：滿厚的。我本來想先看一小段，結果又翻到別的地方去。

**Xu Tang**：嗯，翻著翻著就看下去了。

**Action**：我點點頭，往微波爐的計時器看了一眼。手機亮了一下；我看過通知，按暗螢幕。

**Xu Tang**：你還得回去忙喔？

**Protagonist**：不用，這個明天再看。我做軟體的，大部分時間在家工作，訊息有時候晚上還會來。

**Xu Tang**：喔。我以為有事找你。

**Protagonist**：對啊，我也先看了一下。今天不用管了。

→ Rejoin `common_convenience_xu_weekend_merge`

### `common_convenience_xu_weekend_home`

**When**：`choice_history[common_bookstore_bridge_weekend_decision] == com01b_bookstore_skip`。

**Action**：櫃檯前的人拿走加熱好的晚餐，店員問下一盒是誰的。我應了一聲，把餐盒遞過去。許棠跟著往前挪，等另一台微波爐空出來。

**Protagonist**：我今天拆了幾個箱子，後來又坐回電腦前面。其他東西還堆在那邊。

**Xu Tang**：桌子弄好了？

**Protagonist**：嗯，至少能坐下來了。不然之前找條線都要開好幾個箱子。

**Xu Tang**：喔，那好一點了。其他的慢慢放吧。

**Action**：我把手上的手機換到另一邊。螢幕亮了一下；我看過通知，按暗螢幕。

**Xu Tang**：你還得回去忙喔？

**Protagonist**：不用，這個明天再看。我做軟體的，今晚有東西要上線，review 來回了幾次，剛剛才算弄完。

**Xu Tang**：喔。至少今天結束了。

**Protagonist**：對。我大部分時間在家工作，忙起來就一直坐在那邊，連下樓都拖到現在。

**Xu Tang**：難怪。我還想說你看起來像剛從電腦前面站起來。

**Protagonist**：這麼明顯？

**Xu Tang**：沒有啦。我也差不多。

→ Rejoin `common_convenience_xu_weekend_merge`

### `common_convenience_xu_weekend_merge`

**Action**：微波爐轉了一圈。我往計時器看了一眼。

**Xu Tang**：我那個還沒做完，做到一半才發現家裡沒東西吃。

→ `common_convenience_xu_work`

### `common_convenience_xu_work`

**Visual**：許棠疲憊，黑咖啡與餐盒仍在普通等候動線；沿用原 expression intent，不授予新 visual acceptance。

**Protagonist**：妳那個很趕嗎？

**Xu Tang**：明早客戶要看最後一輪，過了就要送印。所以今晚得改完。

**Protagonist**：妳做印刷的？

**Xu Tang**：不是啦，我做視覺設計，自己接案。只是這次做的東西剛好要印出來。

**Protagonist**：啊，我一聽到送印就猜那邊去了。

**Xu Tang**：嗯，常有人這樣以為。

**Action**：微波爐提示音響起。許棠抬頭看了一眼，店員從另一台取出她的餐盒。

**Xu Tang**：我的好了。

### `common_convenience_xu_checkout`

**Action**：許棠先拿回自己的餐盒，和咖啡一起結帳。我的餐盒晚一步加熱好；等我結完帳走出店門，她正站在騎樓邊把收據塞進袋子。

**Action**：兩人往同一個方向走。路口的燈還亮著，前半段誰也沒有特地找話。

**Action**：走到巷口，右邊一塊白色招牌還亮著。許棠朝那邊抬了抬下巴。

**Xu Tang**：喏，那間是粥店，開到十二點。你下次要是又這個時間下來，可以走過去看看。

**Protagonist**：喔，那間。我一直以為它九點就收了。

**Xu Tang**：週三休就是了。我上次週三走過去，看到門關著才記住。

**Protagonist**：白跑一趟啊。

**Xu Tang**：嗯。所以今天我不繞了，這盒都買了。

**Action**：過了路口後，兩人又安靜了一小段。許棠提著袋子，走到公寓前才稍微慢下來，讓我先推開玻璃門。

### `common_convenience_xu_exit`

**Action**：進大樓後，兩人一起搭電梯上 17 樓。這次一路正常，沒有人特地把沉默填滿。

**Action**：電梯門打開。許棠走到 1702 前，從袋子裡摸出鑰匙。

**Xu Tang**：我先進去了。還有兩個版本等著改。

**Protagonist**：喔，那妳快去吧。晚安。

**Visual**：`XT-SPR-LATE-CASUAL.small_smile`。

**Xu Tang**：嗯，晚安。

**Action**：她進 1702。我繼續往 1703 走。

**End actions**：套用原 choice compatibility stats；`relationship.xu.familiarity +=1`；設定雙方工作輪廓 knowledge；前往 `common_weekday_outing_work`。週末 choice history／`weekend_book_purchased` 只讀；本幕不設定或清除 `jyc_permanently_excluded`。

## State contract

### Conditions

```yaml
requires:
  - COM-01X completed
  - met_xu_tang == true
  - actual weekend choice and matching variant established
  - com01b_bookstore_go requires weekend_book_purchased == true
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

- 本幕出口一律為 COM-01B 所屬 `common_weekday_outing_work`；不直接進咖啡或包裹。
- 後續實際 weekday choice 與 contact history 決定 COM-02J／街道／COM-03X，不由本幕四個 Local choice 或既有數值決定。

## Runtime / Memory intent

- 建議拆成 10–13 個 nodes，前綴 `common_convenience_xu_*`。
- Memory title：**深夜便利店**。
- Memory cover：`CG-COM-03`；未生成時用 BG + `XT-SPR-LATE-CASUAL` composite。
- 本幕可在後續 RE-X 用「同一間便利店」作自然 callback。

## Art needs

下方舊 asset／shot annotations 是歷史 compatibility 資訊。Current semantic override：晴天週末的普通深夜，無本輪當晚雨景／濕地面前事；書只在購書支口頭談到，已留在家中，不新增手持書道具。冷白便利店、許棠居家 casual、餐盒／咖啡、微波等待及同行回公寓的動作保留。全部 reuse 候選交獨立 visual-impact review；不修改 accepted image bytes。

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
- Hold / exit：保留至兩人看過彼此餐盒、許棠說「喔。那差不多。」；choice 前切回 sprite composite。

### Shot C — Walk-back transition（locked）

- 不新增專用 BG／CG；以店外窗面與公寓方向的簡短 transition 表現一起走回去。
- 兩人不共傘、不牽手、不交換購物袋。

## Dialogue writing notes

### Xu Tang

- 疲憊時可以短，但不要把 `dry / reserved` 寫成每句都有 punchline；本幕允許她只回「喔」「嗯」，也允許她把一句話放著不接。
- 她叫名字自然，不加「居然又遇到你」；她在便利店的狀態是普通下樓買晚餐，不是被玩家撞見祕密的一面。
- 工作 disclosure 採生活語境逐步落地：先說「客戶明早看最後一版／過了要送印」，男主誤以為她做印刷後，她才校正成「視覺設計／自己接案」。這些資訊合起來才支撐 `player_knows_xu_freelance_creative_work`。
- 被規訓式關心時只校正「今天而已」，不說教，也不替男主把尷尬收漂亮；該 branch 必須真的留一小段沉默後才進 shared rejoin。
- 附近店家 knowledge 的完整落點在 shared walk-back；`ask_food` branch 只先打開「附近還有沒有東西吃」這個話題，不能獨占店名／營業資訊。

### Male protagonist

- 留家支可承認自己晚收工；購書支只談實際已買的設定集與回家看書。都吃微波食品，但不占據照顧高位；普通回應、沒接好、問得有點笨都可以。
- remote/tech knowledge 由手機通知與他自己的回答自然建立，所有四個 choice 都經過對應 variant：**大部分時間在家工作、做軟體**是共同事實；**今晚上線／review 收工**只在留家支成立。共享工作段保留許棠送印 deadline 與職業澄清。
- 對許棠工作資訊不要一次猜對；「妳做印刷的？」是允許的普通誤解，讓後續澄清自然建立 freelance / visual-design knowledge。
- 不猜她吃不飽、不替她買更健康的餐、不要求她回家報平安，也不主動提出看設計或解決 client 問題。

### Voice contrast target

- 許棠的熟悉感靠共享現實、停頓與少量回扣累積；一幕裡可以有一兩個乾點，但不能形成 setup → comeback 的連續節拍。
- 男主也不是每句都能接住；本幕刻意保留「……喔」、短暫誤解、話題落空與共同沉默。
- shared rejoin 不能變成履歷交換：必要 knowledge 被微波等待、短問答、誤解與更正拆開，資訊密度有高有低。
- 一起走回公寓的 ordinary silence 本身就是 relationship texture；不需要用 romantic narration 解釋它。
- 最後不交換聯絡方式、不邀約、不互相照顧，透過實際行為自然成立，不額外朗讀 production guardrail。

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
- Locked choice effects：`ask_food` 額外 `F +1` 保持不變；本次 corrective rewrite 不重開數值決策。
