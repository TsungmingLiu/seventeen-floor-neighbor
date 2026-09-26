# COM-01B — 週末前的方向

## Status

- Production stage: **S4 Script Lock / S5 State Contract**；待 `content_qa / narrative_review`。
- Scope: Opening Chapter 1 / common bridge between `COM-01X` and `COM-01J`.
- Memory ownership: `common`；不新增獨立 Memory 或 route 分歧。
- Lock rule: 電梯那晚已在 17 樓分開。本幕是週末前另一晚、大樓外的短暫偶遇；許棠給路，不陪同，也不讀出男主未說出的心情。

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-01B.json`，內容保持原樣。
- Entry: 男主與許棠能自然聊幾句，仍是有界線的鄰居；男主尚未見過江雨澄。
- Exit: 關係與數值不升級；男主多知道一處可自行去逛的店，週末仍為自己的《逆光航路》找書目的出門。

## Scene summary

電梯重啟那晚之後、同週末前的另一個晚上，男主在公寓外遇見正要繼續往前走的許棠。兩人停下說幾句日常話。男主在新城市認識的人不多，見話題快結束，問附近有沒有能一個人逛的去處。玩家可從逛店、找書、吃喝三個自然切口提問。許棠都指向步行約十分鐘的地下街設定集／周邊書店，補一句出口上層有咖啡可坐。她道晚安，照原來的方向離開。男主把謝意說得明亮，笑容收起後留下一點寂寞。週末白天，他因本來就想查《逆光航路》新版設定集的實體增補內容而前往地下街，接上 `COM-01J`。

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
| 01B.6 週末接續 | 同週末約 15:40，男主為《逆光航路》新版設定集走入地下街，停在 ACG 設定集／周邊店入口；`COM-01J` 原開場隨後開始。 | no Jiang contact yet |

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

**Protagonist**：總算不用每次回家都像在搬第二輪。

**Xu Tang**：進度不錯。

**Action**：她往自己要走的方向看了一眼。這段話到了可以自然結束的地方。

**Narration**：搬來以後，能這樣接上兩句話的人還不多。我想起週末本來要出去找書，便多問了一句。

### `common_bookstore_bridge_choice`

1. `com01b_browse_shops` — **「這附近有沒有適合一個人慢慢逛的店？」**
2. `com01b_find_books` — **「附近有能翻設定集的書店嗎？週末想去找一本書。」**
3. `com01b_food_or_coffee` — **「想找個地方吃點東西、喝杯咖啡，再順路逛逛。這附近有方向嗎？」**

#### Branch `com01b_browse_shops`

**Protagonist**：這附近有沒有適合一個人慢慢逛的店？

**Xu Tang**：有。從這裡走大概十分鐘，地下街有家主要賣設定集和周邊的書店。要坐一下，附近出口往上也有咖啡。

**Xu Tang**：晚安。

**Protagonist**：這個方向很好。謝謝，晚安！

→ Rejoin `common_bookstore_bridge_rejoin`

#### Branch `com01b_find_books`

**Protagonist**：附近有能翻設定集的書店嗎？週末想去找一本書。

**Xu Tang**：有。從這裡走大概十分鐘，地下街有家主要賣設定集和周邊的書店。要坐一下，附近出口往上也有咖啡。

**Xu Tang**：晚安。

**Protagonist**：正好。謝謝，晚安！

→ Rejoin `common_bookstore_bridge_rejoin`

#### Branch `com01b_food_or_coffee`

**Protagonist**：想找個地方吃點東西、喝杯咖啡，再順路逛逛。這附近有方向嗎？

**Xu Tang**：吃的我不替你保證。從這裡走大概十分鐘，地下街有家主要賣設定集和周邊的書店。要坐一下，附近出口往上也有咖啡。

**Xu Tang**：晚安。

**Protagonist**：有地方逛就夠了。謝謝，晚安！

→ Rejoin `common_bookstore_bridge_rejoin`

### `common_bookstore_bridge_rejoin`

**Action**：許棠繼續往原來的方向走，沒有回頭，也沒有等我同行。

**Narration**：我剛才把那句謝謝說得比平常亮一點。等笑意慢慢收下來，街上又只剩自己的腳步聲；有一點空，但還不至於讓人停在原地。

**Narration**：週末找《逆光航路》新版設定集的實體增補內容，現在多了一個可以去看看的地方。

### `common_bookstore_bridge_weekend_transition`

**Time transition**：同週末，約 15:40。

**Action**：男主走進台北地下街，來到那家以設定集與周邊為主的 ACG 店。他要查《逆光航路》新版究竟增補了什麼。此刻尚未與江雨澄相遇。

→ `COM-01J` / `common_acg_first_meet_enter`；其既有對白和首次相遇保持原樣。

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
- 本幕只增加男主對地點的大致認識；若實作需要回顧，使用本幕完成紀錄或 choice history，不新增必需的 relationship flag。
- `COM-01J` 的 `met_jiang_yucheng`、`F_JYC`、`heard_station_cafe_from_jyc` 與 `jyc_first_topic` 仍由該幕處理。

## Semantic Visual Beats

- 大樓外另一晚的普通擦肩停步；兩人保持行人間自然距離。
- 許棠給方向時只短暫停留；男主以明亮的表情道謝，她繼續走。
- 許棠離開後，男主的表情回到平常，讓一點孤單存在但不誇張。
- 同週末白天的地下街店入口，男主帶著自己的找書目標入店；江雨澄尚未進入本幕畫面或對話。

以上只描述敘事可見事件；本幕不指定 camera、CG 數量、prompt 或 reference binding。

## Continuity boundary

- `COM-01X` 的垃圾室資訊、17 樓到站及各自回門結尾不變。
- 許棠沒有說出咖啡店名、北邊出口、平日下午安靜程度、窗邊、插座或店員習慣；這些具體資訊仍由 `COM-01J` 中江雨澄提供。
- 男主沒有邀許棠同行、交換聯絡方式或把推薦當成私人邀請。許棠不知道他道謝之後的寂寞。
- `COM-01J` 仍在週末約 15:40 的地下街 ACG 店，以男主和江雨澄互不相識、共同作品的具體比較開場。
