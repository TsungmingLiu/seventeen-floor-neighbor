# COM-01B — 週末前的方向

## Current authorized weekend/weekday design — ND-ARC-001

- Lifecycle: **CANONICAL** task-local Narrative Design amendment, 2026-10-04. Source ref: `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9`. Human 授權本輪方向與必要改寫；本 pass 沒有新 final prose、QA、runtime 或 CG acceptance。
- Owning design: `docs/narrative/JYC_WEEKEND_WEEKDAY_REVISION.md`；current contract: `content/production/narrative/opening-ch1/COM-01B.json`。此 design section 與 current JSON 取代下方 baseline 的衝突時序／gate；下方舊 Locked prose 與其歷史 binding 完整保留作局部改寫或相容性參考，不是本輪新 Script Lock。
- 週末／平日行動入口：四個 dialogue unit 之一；只改週末 decision 以後及新增平日 transition，保留前晚問路完整 prose。週末晴朗，在家作 go/home action；home 拆箱與工作，bookstore 接 COM-01J→實際購書→回家，兩支都 COM-02X。同幕所屬 common_weekday_outing_* 在 COM-02X 後才執行：平日下午居家工作疲累、出門；bookstore-met 直接 cafe reunion，home 才 cafe-first/street choice。street 獨走台北、感受熟悉又陌生、回家接 COM-03X，並永久排除江線。
- Stable ID plan：common_weekend_home_enter/work/exit；common_weekday_outing_work/tired/decision/street_enter/street_return；com01b_weekday_cafe_first/com01b_weekday_street_walk。既有 weekend go/skip IDs 保留；舊 common_bookstore_bridge_cafe_decision 與 cafe_skip IDs 不挪作永久排除意圖，保留歷史兼容但新走法不播放。
- 永久排除：本輪 `com01b_weekday_street_walk` 才寫 `jyc_permanently_excluded=true`。此 flag 先於 contact/history，永不由 merge、reload、scheduler、public shared scene 或 ordinary invite 清除。Memory replay 限自己的 snapshot，不向 live 主線寫入；改走前一分岔屬另一 playthrough，不是本輪 reopening。
- Semantic visual impact 與四個必要 dialogue units 見 owning design；現有 accepted image bytes、QA/Human 歷史都保留。獨立下游才裁決哪些畫面可重用。

## Preserved pre-revision baseline


## Status

- Production stage: **Scene Dialogue / LOCKED (Script Lock)**；新增入店前 action／skip passage 待獨立 `content_qa / narrative_review`，並由下游獨立判定視覺影響。
- Scope: Opening Chapter 1 / common bridge between `COM-01X` and `COM-01J`.
- Memory ownership: `common`；不新增獨立 Memory 或 route 分歧。
- Lock rule: 電梯那晚已在 17 樓分開。本幕是週末前另一晚、大樓外的短暫偶遇；許棠給路，不陪同，也不讀出男主未說出的心情。

## Canonical inputs

- `docs/narrative/scenes/vertical-slice/COM-01X.md`
- `docs/narrative/scenes/vertical-slice/COM-01J.md`
- Approved owning design: `ND-BOOKGATE-003`，來源版本 `30278ca09cc65c2d3505417ffae8ff59690860c1`；本幕設計來源為本檔該版本（Git blob `0cc5010298ec6387fd2d123c08f3c059cf602d33`）。
- Immediate continuity: `COM-01X` 已分開；`COM-01J` 只由書店 go 進入。後續 cafe encounter/contact 由獨立 `COM-02J`／`COM-03J` 修訂承擔。

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-01B.json`，Git blob `670d61aeb9c59f92809f60c57336e27d6a005bae`；本輪僅完成其入店前 discovery 邊界，不改 contract。
- Entry: 男主與許棠能自然聊幾句，仍是有界線的鄰居；男主尚未見過江雨澄。
- Exit: 關係與數值不升級；男主多知道一處可自行去逛的店。實際到訪須經週末入店前 action choice；本幕不先設江雨澄相遇或聯絡。

## Scene summary

電梯重啟那晚之後、同週末前的另一個晚上，男主在公寓外遇見正要繼續往前走的許棠。兩人停下說幾句日常話。男主在新城市認識的人不多，見話題快結束，問附近有沒有能一個人逛的去處。玩家可從逛店、找書、吃喝三個自然切口提問。許棠都指向步行約十分鐘的地下街設定集／周邊書店，補一句出口上層有咖啡可坐。她道晚安，照原來的方向離開。男主把謝意說得明亮，笑容收起後留下一點寂寞。週末白天，他因本來就想查《逆光航路》新版設定集的實體增補內容，先決定要不要去地下街書店。去才接上 `COM-01J`；不去則另外選擇要不要去咖啡店。

## Scene goal / dramatic question

- 男主：用一個實際問題讓少有的熟悉對話多留一兩句；取得方向後自己決定去，不提出同行。
- 許棠：給新鄰居一個實用推薦，保持自己的行程與普通鄰里距離。
- Dramatic question：普通的問路能否承載一點想多說話的心情，卻不讓對方負責安慰？答案是可以；男主自己帶著那點心情往前走。

## Unlock / entrance condition

```yaml
requires:
  - COM-01X complete
forbids:
  - met_jiang_yucheng == true
previous: COM-01X
next: COM-01J if bookstore go; COM-02J if bookstore skip and cafe go; Xu／個人生活 if both skip
```

- 時間：`COM-01X` 到站分開後，週末前的另一晚。不是電梯或 17 樓門口的續談。
- 地點：公寓外的街邊；兩人都在行經途中，沒有約好碰面。
- 男主已知道許棠的姓名、門牌和垃圾室走法；不知道她的工作或聯絡方式。
- 男主本來就想找《逆光航路》新版設定集的實體增補內容，尚未見過江雨澄。

## Beat sheet

| Beat | Action / dialogue intent | State |
| --- | --- | --- |
| 01B.1 另晚偶遇 | 在大樓外互道晚上好，確立不是 `COM-01X` 的同一場對話。 | none |
| 01B.2 話題將盡 | 一來一回的生活話停住；男主想在新地方多聽一句熟悉的聲音，但不用旁白替許棠解讀。 | none |
| 01B.3 日常提問 | 玩家從逛店、找書、吃喝選一個切口；三者都是可獨自實行的需求。 | choice history only |
| 01B.4 同一推薦 | 每條都由許棠指出步行約十分鐘的地下街設定集／周邊書店，以及附近出口上層可坐的咖啡；不給特定店名或使用條件。 | location knowledge only |
| 01B.5 有界線的晚安 | 許棠道晚安並繼續原本行程；男主刻意明亮地道謝。她沒有察覺他的微弱寂寞。 | no relationship change |
| 01B.6 週末決定 | 同週末白天，先作書店 go/not-go action；go 才執行既有入店 transition 與 `COM-01J`，skip 則再作咖啡店 go/not-go action。 | choice history；本幕尚無 Jiang encounter/contact |

## Player choice / local branch

三個選項只記錄提問口吻，不給 heroine 數值、特殊路線或更好的地點。每條在許棠說完晚安、男主回答後，才匯入同一個 `common_bookstore_bridge_rejoin`。下列每條推薦指的是**同一家**地下街設定集／周邊書店。

| Choice ID | 提問切口 | Xu response intent | Rejoin |
| --- | --- | --- | --- |
| `com01b_browse_shops` | 一個人慢慢逛店 | 給可逛的地下街店與上層咖啡資訊。 | `common_bookstore_bridge_rejoin` |
| `com01b_find_books` | 找書、翻設定集 | 給同一店與上層咖啡資訊。 | `common_bookstore_bridge_rejoin` |
| `com01b_food_or_coffee` | 吃點東西或喝咖啡後順路逛 | 不保證餐廳品質；給同一店與上層咖啡資訊。 | `common_bookstore_bridge_rejoin` |

## Locked playable script

### `common_bookstore_bridge_enter`

**Narration**：電梯重啟那晚已經過去。週末前的另一個晚上，我在大樓外碰見許棠；她正沿著街邊往前走。

**Protagonist**：晚上好。

**Xu Tang**：晚上好。今天沒提袋子？

**Protagonist**：今天終於空手了。家裡還有幾箱不想面對的。

**Xu Tang**：喔，那很正常。

**Action**：她往原本要走的方向看了一眼。兩人安靜了片刻。

**Protagonist (thought)**：搬來以後，能這樣隨口聊兩句的人還不多。週末正好要出去找書，不如問問附近能去哪裡。

### `common_bookstore_bridge_choice`

1. `com01b_browse_shops` — **「這附近有沒有適合一個人慢慢逛的店？」**
2. `com01b_find_books` — **「附近有能翻設定集的書店嗎？週末想去找一本書。」**
3. `com01b_food_or_coffee` — **「這附近有沒有什麼吃的？想喝杯咖啡，等一下再隨便逛逛。」**

#### Branch `com01b_browse_shops`

**Protagonist**：這附近有沒有適合一個人慢慢逛的店？

**Xu Tang**：慢慢逛的話，地下街有家書店，主要賣設定集跟周邊。從這裡走過去大概十分鐘。

**Protagonist**：喔，地下街啊。

**Xu Tang**：嗯。逛累了，附近出口上去也有咖啡可以坐。

**Action**：她稍微挪了挪腳步，轉回原本要走的方向。

**Xu Tang**：那我先走了，晚安。

**Protagonist**：好，謝啦。晚安！

→ Rejoin `common_bookstore_bridge_rejoin`

#### Branch `com01b_find_books`

**Protagonist**：附近有能翻設定集的書店嗎？週末想去找一本書。

**Xu Tang**：設定集？地下街有家書店主要賣這個，也有周邊。從這裡走過去大概十分鐘。

**Protagonist**：喔，那可以去翻翻看。

**Xu Tang**：嗯。附近出口上去也有咖啡，想坐一下的話。

**Action**：她稍微挪了挪腳步，轉回原本要走的方向。

**Xu Tang**：那我先走了，晚安。

**Protagonist**：好，謝謝。晚安！

→ Rejoin `common_bookstore_bridge_rejoin`

#### Branch `com01b_food_or_coffee`

**Protagonist**：這附近有沒有什麼吃的？想喝杯咖啡，等一下再隨便逛逛。

**Xu Tang**：吃的我不太熟。你說逛的話，地下街有家賣設定集跟周邊的書店，從這裡走過去大概十分鐘。

**Protagonist**：喔，地下街啊。那我可以去逛逛。

**Xu Tang**：咖啡的話，附近出口上去也有地方可以坐。

**Action**：她稍微挪了挪腳步，轉回原本要走的方向。

**Xu Tang**：那我先走了，晚安。

**Protagonist**：好，我去看看。謝謝，晚安！

→ Rejoin `common_bookstore_bridge_rejoin`

### `common_bookstore_bridge_rejoin`

**Action**：許棠沿著原來的方向走遠。剛才道謝時，我笑得很明亮；等她離開，笑意才慢慢收下來。

**Narration**：街上又只剩我的腳步聲。那一小段路忽然安靜了些，我還是繼續往前走。

**Protagonist (thought)**：週末正好要看《逆光航路》新版設定集的實體增補。那家店會有嗎？

### `common_bookstore_bridge_weekend_decision`

**Time transition**：同週末，白天。

**Narration**：出門時，我想起許棠說過的地下街書店。新版設定集的增補還沒看過。今天要去翻翻嗎？

1. `com01b_bookstore_go` — **「去地下街書店翻翻設定集。」**
2. `com01b_bookstore_skip` — **「今天先不去書店。」**

#### Branch `com01b_bookstore_go`

**Protagonist (thought)**：都出門了，去找找那本書吧。

→ `common_bookstore_bridge_weekend_transition`；之後執行 `COM-01J`。書店初遇後，同一次外出必定前往咖啡店；咖啡店的重逢由 `COM-02J` 承接，本幕不預演相遇或聯絡。

#### Branch `com01b_bookstore_skip`

**Protagonist (thought)**：書改天再找。現在先走走，也不用為了出門硬排一站。

**Action**：我沿街慢慢走。想起許棠說出口上層有咖啡可以坐，但我還沒決定要不要過去。

→ `common_bookstore_bridge_cafe_decision`；不執行 `common_bookstore_bridge_weekend_transition` 或 `COM-01J`。

### `common_bookstore_bridge_cafe_decision`（僅書店 skip）

1. `com01b_cafe_go_after_bookstore_skip` — **「去附近找間咖啡店坐一會兒。」**
2. `com01b_cafe_skip_after_bookstore_skip` — **「今天不喝咖啡，先回去。」**

#### Branch `com01b_cafe_go_after_bookstore_skip`

**Protagonist (thought)**：找個地方坐一下好了，順便把手邊的事理一理。

**Action**：我往地下街附近走，沿街找一間能坐下的咖啡店。

→ `COM-02J` 的書店 skip／咖啡店首次相遇入口。此時我只知道許棠提過上層有咖啡，尚未到訪書店，亦不認識江雨澄。

#### Branch `com01b_cafe_skip_after_bookstore_skip`

**Protagonist (thought)**：今天這樣走走就夠了，回去吧。

**Action**：我轉回住處，沒有去地下街書店，也沒有走進咖啡店。

→ Xu／個人生活續線；江雨澄仍未與我相遇。

### `common_bookstore_bridge_weekend_transition`

**Time transition**：同週末，約 15:40。

**Action**：我走進台北地下街，來到那家以設定集與周邊為主的 ACG 店。我想查《逆光航路》新版究竟增補了什麼。

→ `COM-01J` / `common_acg_first_meet_enter`；其既有對白和首次相遇保持原樣。

## Downstream owning revisions (outside this Script Lock)

- `COM-01J`：只加外部 go gate 與同次外出 cafe 因果出口；保留原有書架初遇、無姓名／無 contact 的事件、topic truth、IDs 與已接受 visual beats。書店 skip 時整幕不執行。
- `COM-02J`：獨立修正原本 Week 2 cafe 重逢時序為書店 go 後同次外出必經的重逢，並處理書店 skip + cafe go 的**首次**相遇變體。後者不能使用店內舊識、Jiang 推薦、先前 topic 或既有姓名；兩條都在實際談話後才取得各自真實姓名／共同話題，並提供不依 tone 成績的持續交談與聯絡同意／拒絕結局。只需一個有界線的 authored 首遇，不另造隨機在場或 cafe 無人變體。
- `COM-03J`：現有第三次咖啡店外碰面與必得 Discord contact 與前述可於 cafe 自然交換的 timing 衝突。獨立縮成只在有真實 cafe contact 後的後續分享／推薦，或對無 contact 的路徑保留誠實的不聯絡出口；任何 callback 必須按實際 topic history 選用。不得用第三次相遇補造先前 consent。
- `COM-02X`／`COM-03X` 的 Xu 前置與 contact 仍獨立成立；`COM-03M` 的 contact-gated／never-met 變體與其後 `OPEN-A` 維持現有事實邊界。這些檔案均非本輪寫入。

## State contract

```yaml
requires:
  - COM-01X complete
  - met_xu_tang == true
forbids:
  - met_jiang_yucheng == true
set: {}
unchanged:
  relationship.xu.familiarity: 0
  relationship.xu.trust: 0
  relationship.xu.chemistry: 0
  relationship.xu.compatibility: 0
  relationship.xu.romanticSignal: false
  relationship.jyc.familiarity: 0
  relationship.jyc.trust: 0
  relationship.jyc.chemistry: 0
  relationship.jyc.compatibility: 0
  relationship.jyc.romanticSignal: false
  contact_xu: false
  contact_jyc: false
  met_jiang_yucheng: false
  recentFocus: unchanged
  cross_knowledge: unchanged
```

- 上述 relationship 數字 `0` 表示**本幕增量為零**，不覆寫先前累積值。
- 本幕只增加男主對地點的大致認識；書店 go/skip 及 skip 後 cafe go/skip 用 choice history 保存真實行動，不新增 relationship score 或人物好感門檻。兩處 skip 時 `met_jiang_yucheng=false`、`contact_jyc=false`。
- Choice history：`common_bookstore_bridge_weekend_decision` 記 `com01b_bookstore_go|com01b_bookstore_skip`；只有後者進入 `common_bookstore_bridge_cafe_decision`，記 `com01b_cafe_go_after_bookstore_skip|com01b_cafe_skip_after_bookstore_skip`。書店 go 才有 `COM-01J`，且由其後續必經 cafe；書店 skip／cafe go 才由 `COM-02J` 首遇；兩處 skip 不觸發江雨澄相遇。以上是本幕 choice-history／接續映射，不新增 graph scene row。
- `COM-01J` 的 `met_jiang_yucheng`、`F_JYC`、`heard_station_cafe_from_jyc` 與 `jyc_first_topic` 仍由該幕處理。

## Semantic Visual Beats

- 大樓外另一晚的普通擦肩停步；兩人保持行人間自然距離。
- 許棠給方向時只短暫停留；男主以明亮的表情道謝，她繼續走。
- 許棠離開後，男主的表情回到平常，讓一點孤單存在但不誇張。
- 同週末白天的地下街店入口，男主帶著自己的找書目標入店；江雨澄尚未進入本幕畫面或對話。

上述最後一項僅書店 go 有資格播放；skip 路徑需獨立 visual impact review。

以上只描述敘事可見事件；本幕不指定 camera、CG 數量、prompt 或 reference binding。

## Continuity boundary

- `COM-01X` 的垃圾室資訊、17 樓到站及各自回門結尾不變。
- 許棠沒有說出咖啡店名、北邊出口、平日下午安靜程度、窗邊、插座或店員習慣；這些具體資訊仍由 `COM-01J` 中江雨澄提供。
- 男主沒有邀許棠同行、交換聯絡方式或把推薦當成私人邀請。許棠不知道他道謝之後的寂寞。
- `COM-01J` 僅書店 go 時在週末約 15:40 的地下街 ACG 店，以男主和江雨澄互不相識、共同作品的具體比較開場；skip 時不得沿用其相遇／咖啡推薦。

## Accepted COM-01B art boundary

現有四個已接受 COM-01B CG identity 均保留；大樓外偶遇、許棠指路、明亮道謝後的孤單，以及原有書店 go 入口的視覺含義不改。此 Design pass 不宣稱新 skip 路徑的視覺 QA 或 `no_visual_impact`；由獨立 NQA 查看相關既有像素與條件播放後判定。
