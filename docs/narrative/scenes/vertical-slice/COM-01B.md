# COM-01B — 週末前的方向

## Status

- Production stage: **Narrative Design / DRAFT**；既有書店 go 路徑的已接受文字保留，新增 action／skip passage 待獨立 scene dialogue 與 `content_qa / narrative_review`。
- Scope: Opening Chapter 1 / common bridge between `COM-01X` and `COM-01J`.
- Memory ownership: `common`；不新增獨立 Memory 或 route 分歧。
- Lock rule: 電梯那晚已在 17 樓分開。本幕是週末前另一晚、大樓外的短暫偶遇；許棠給路，不陪同，也不讀出男主未說出的心情。

## Canonical inputs

- `docs/narrative/scenes/vertical-slice/COM-01X.md`
- `docs/narrative/scenes/vertical-slice/COM-01J.md`

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-01B.json`，本輪僅修入店前 discovery 邊界。
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
next: COM-01J
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

**Protagonist (thought)**：週末正好要看《逆光航路》新版設定集的實體增補。那家店，去看看吧。

### Design boundary: before `common_bookstore_bridge_weekend_transition`

此處是新 action choice 的**設計大綱，尚非 Locked dialogue／最終選項文案**。接在 `common_bookstore_bridge_rejoin` 之後、任何「走進台北地下街／來到店」敘述之前；保留三個 `com01b_*` 提問選項及其全部原字與 rejoin。玩家此時只知道許棠推薦的地點，仍未去過，也未見江雨澄。

- **書店 go**：選擇實際前往；執行下方原有 `common_bookstore_bridge_weekend_transition` 原字及 `COM-01J` 既有初遇，不改其節點、三個作品表達選擇、姓名／contact 邊界或已接受的視覺事件。書店初遇之後，同一次外出**必定**去咖啡店，作有因果的 `COM-02J` 重逢；具體時序與後續交談由其獨立修訂擁有。
- **書店 skip**：不執行下方入店 transition／`COM-01J`，不取得其作品 topic 或江雨澄推薦；再給玩家一個實際**去咖啡店／不去咖啡店**的 action choice。去店則在 `COM-02J` 設計一場有界線的首次相遇，建立當場實際取得的姓名及共同話題；不去則無江雨澄相遇、姓名或 contact，繼續 Xu／個人生活路徑。去咖啡店可由男主自己想坐下休息／處理事情及許棠先前給的普通上層咖啡線索支持，不假裝江雨澄已推薦北邊出口店。
- **Cafe/contact 邊界**：兩種有實際相遇的 cafe 走法，只有在自然繼續交談、雙方有意且同意時才可交換聯絡；Warm／Candid／Playful 都有同一 knowledge 與可能性。拒絕聯絡是普通道別，不能生成 romantic closure、RE 或負面分數。此處只交代 downstream prerequisite，不寫咖啡店對白。

### `common_bookstore_bridge_weekend_transition`

**Time transition**：同週末，約 15:40。

**Action**：我走進台北地下街，來到那家以設定集與周邊為主的 ACG 店。我想查《逆光航路》新版究竟增補了什麼。

→ `COM-01J` / `common_acg_first_meet_enter`；其既有對白和首次相遇保持原樣。

## Downstream owning revisions (not authored in this Design pass)

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
