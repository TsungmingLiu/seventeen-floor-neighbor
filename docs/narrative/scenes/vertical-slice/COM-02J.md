# COM-02J — 咖啡店重逢

> **Rendering supersession notice (2026-09-24):** this scene remains canonical for narrative, state, staging, wardrobe, expression, action timing, and continuity. Any older **9:16 / sprite / composite-rendering instruction** in this file is superseded for NEW production by `docs/art/PRODUCTION_VISUAL_DIRECTION.md` and the current Shot Planner harness. Do not rewrite narrative staging merely to preserve the old rendering mode.


## Status

- Production stage: **S4 Script Lock / S5 State Contract / S6 Art Shot Lock**
- Scope: Opening Vertical Slice / Jiang contact-and-contrast
- Memory ownership: `common`
- Progress band: `180`
- Estimated play time: 6–8 minutes
- Lock rule:重逢的因果固定為 COM-01J 的咖啡店推薦＋男主實際需要工作空間；她先認出男主並主動打招呼，兩人本幕正式交換姓名，但不交換聯絡方式。

## Canonical inputs

- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` — COM-02J
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
- `docs/art/PRODUCTION_VISUAL_DIRECTION.md`
- `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`
- `docs/narrative/scenes/vertical-slice/COM-01J.md`

## Scene summary

Week 2 平日下午，男主在台北車站附近辦完事，還有一段遠端會議前的空檔，需要可靠的插座與安靜座位。他想起地下街那位陌生女生提過的咖啡店，便進店工作。江雨澄坐在窗邊用 tablet 畫圖；男主先認出她投入創作的側影，她抬頭後也認出他，猶豫兩秒才用上次作品作為招呼。兩人正式交換姓名。一般寒暄仍短，一談到圖像設計與作品，她的句子又變長，讓男主第一次看見她在熟悉主場並不是「安靜的人」。兩人各自回到工作，留下第三次聯絡的可能，不急著拿聯絡方式。

## Scene goal / dramatic question

- 玩家感受：第二次見面不是命運硬推，而是記住對方一項實用建議後，生活路線自然重疊。
- 男主目標：找到可工作的座位、完成自己的工作；確認是不是上次的人，但不打斷她到必須社交。
- 雨澄目標：完成手上的圖；她其實想承認記得男主，所以冒一點被認不出的風險先打招呼。
- Dramatic question：離開 ACG 書架後，兩人的連結還能不能存在？答案是可以，但仍需要共同題目與各自可退回的工作。

## Unlock / entrance condition

```yaml
requires:
  - COM-01J completed
  - met_jiang_yucheng == true
  - heard_station_cafe_from_jyc == true
```

- 時間：Week 2，平日 14:30–16:00。
- 地點：台北車站／地下街附近的 `BG-CAFE-STATION`。
- 男主有真實進店理由：附近行程結束，下一個遠端 meeting 前需 60–90 分鐘工作；不是來找她。
- 雨澄在窗邊角落，用 tablet 畫虛構創作；桌上有飲料與一兩張參考縮圖，沒有攤滿到替她宣傳身份。
- 兩人尚不知道彼此姓名、學校、精確職業、聯絡方式。

## Beat sheet

| Beat | Runtime intent | Action / dialogue intent | Visual / expression | State |
| --- | --- | --- | --- | --- |
| 02J.1 Causal arrival | establishing | 男主進店前以一個短 callback 想起「平日下午比較安靜」；店內確實有空位與插座。他沒有期待遇見雨澄。 | `BG-CAFE-STATION` wide；交通人流在遠景、角落安靜。 | none |
| 02J.2 Creator focus | visual introduction | 男主找座位時先看到一個熟悉側影；她正放大線稿、調整構圖，不是隨便塗鴉。旁白只確認「上次書架前的人」，不評價天分。 | **CG-COM-04 trigger**；`focused_drawing`。 | none |
| 02J.3 She sees him | agency beat | 她在停筆／喝水時抬頭，視線碰到男主。她有 1–2 秒可假裝沒看到，最後主動問：「那本後來有買嗎？」 | CG expression transition `focused → surprised recognition`，後切 sprite `hesitant`。 | none |
| 02J.4 Names | formal introduction | 男主回答上次的書，再補「我叫——」。她停半拍說「江雨澄」。名字交換短，不寫成正式握手。 | `polite`, `small_smile`。 | name flags |
| 02J.5 Seat boundary | blocking | 男主先問旁邊座位是否有人／是否會打擾；她明確說可以，但自己等一下還要畫。這同時給兩人退路。 | 兩人共享窗邊桌或鄰桌，不坐成正面約會 framing。 | none |
| 02J.6 Player topic choice | local branch | 玩家問她畫的具體內容、延續上次作品觀點，或給一個普通稱讚。三條都可接受，但連結深度不同。 | expressions vary。 | stats / callback |
| 02J.7 Her field becomes visible | payoff | 在具體分支，她會說到角色 silhouette、色彩腳本或畫面閱讀方向，並反問男主為何注意那一點；普通稱讚分支則只謝謝，靠她稍後自己補一句救回談話。 | `talking_about_art`, `tiny_laugh`, `interested`。 | `jyc_creator_work_seen=true` |
| 02J.8 Parallel work preview | intimacy texture | 對話停下後兩人各自工作 10–20 分鐘；玩家用 1–2 nodes 感受她不是需要一直被問話才舒服。她偶爾把 tablet 轉一點確認光線，不是展示給男主求肯定。 | wide table composite；screen/tablet light subtle。 | none |
| 02J.9 Small return | reciprocity | 她在男主收電腦前主動問一句上次選的設定集內容／他的工作是不是都能在外面做。她也在觀察他，不是只被訪問。 | `curious`, `asking_real_question` 等效。 | none |
| 02J.10 Leave with names | exit | 男主因會議／行程先走，或雨澄先收 tablet；兩人以姓名道別。沒有人臨時說「加個 Line 吧」。 | `small_smile`；窗邊位留空 transition。 | `F_JYC +=1`; unlock COM-03J |

## Emotion arc

```text
男主：把上次的實用推薦帶進日常
  → 意外認出她的創作狀態
  → 等她決定是否承認彼此
  → 名字讓「書架前的人」變成可記住的個體
  → 看見她談作品時的速度與能力
  → 在不必持續聊天的同桌狀態裡留下下一次空間

江雨澄：在自己選的安靜角落工作
  → 認出上次能談作品的人
  → 猶豫是否主動
  → 用共同作品開口，成功被認出
  → 在具體問題裡進入主場
  → 主動回問一件關於男主的事，再回到自己的節奏
```

與許棠 COM-02X 的差異：許棠的親近來自共同生活作息與短句同行；雨澄的親近來自「我可以先開口」以及同桌各做各的、在熟悉題目上句子變長。

## Player choice / local branch

Choice 在名字交換、男主確認可以坐下之後出現。

| Choice ID | Player-facing intent（可微調字句） | JYC response intent | Stats / flags | Rejoin |
| --- | --- | --- | --- | --- |
| `com02j_ask_drawing` | 「這幾張是在抓同一個角色的動作嗎？」 | 她確認是同一角色，談 silhouette 與姿態差異；會問男主怎麼看出來。問題具體但仍保留猜錯空間，不像窺看螢幕後直接下結論。 | `T_JYC +1`; `jyc_second_topic=her_art` | 02J.7 |
| `com02j_continue_topic` | 依 COM-01J choice 回扣雨港篇的色彩／設定用途。 | 她接得更快，指出自己正在試相似的冷暖分區，但作品不是 fan art。 | `F_JYC +1` bonus; `jyc_second_topic=shared_work` | 02J.7 |
| `com02j_simple_praise` | 「看起來很厲害。線很乾淨。」 | 她說「還沒畫完，看起來乾淨是因為我把亂的關掉了。」小小自嘲；短停後由她自己補一項具體內容。 | `C_JYC +1`; `jyc_second_topic=general_praise` | 02J.7 |

Choice design notes：

- 第三項不是笨蛋答案；它較泛，但雨澄不因此懲罰玩家，反而用她自己的乾式 self-edit humor 建立一點 chemistry。
- 第一項不能寫成男主站在她背後偷看很久；他只從公開可見的 tablet 構圖提出可退出的問題。
- 第二項必須讀 choice history，沒有可用 callback 時不要硬顯示。

## Locked playable script

### `common_station_cafe_jyc_enter`

**Visual**：`BG-CAFE-STATION` wide。先呈現空位、插座與窗邊區域。

**Narration**：下一個會議還有一個多小時。我需要插座、桌子，最好再少一點車站廣播。

**Narration**：地下街那個女生提過北邊出口的咖啡店。至少「不太趕人」這一點是真的。

**Action**：男主拿著 laptop bag 找座位，在窗邊看見熟悉的短髮側影。

### `common_station_cafe_jyc_drawing`

**Visual**：切入 `CG-COM-04`。雨澄低頭畫圖，tablet 上只顯示不可讀的虛構角色構圖。

**Narration**：她在畫圖。不是隨手記幾筆；幾個相似輪廓排在一起，旁邊還有反覆調整過的色塊。

**Action**：她停筆喝水，抬眼看見男主。兩人視線碰上。她停了兩秒。

**Jiang Yucheng**：那本……後來有買嗎？

**Visual**：回 BG + `JYC-SPR-CAFE.caught_drawing`。

**Protagonist**：買了舊版。暫時只買一本。

**Jiang Yucheng**：暫時。

**Protagonist**：妳上次說得很準。

### `common_station_cafe_jyc_names`

**Protagonist**：上次忘了問。我叫 [PLAYER_NAME]。

**Jiang Yucheng**：江雨澄。

**Action**：沒有握手。男主指向她旁邊的空位。

**Protagonist**：這裡有人嗎？如果妳要專心，我坐別邊。

**Jiang Yucheng**：沒有人。

**Jiang Yucheng**：我等一下還要畫，可能不太說話。

**Protagonist**：正好。我也要工作。

**Action**：男主坐在斜對角，不直接面向她的 tablet。

### `common_station_cafe_jyc_choice`

1. `com02j_ask_drawing` — **「這幾張是在抓同一個角色的動作嗎？」**
2. `com02j_continue_topic` — **依 COM-01J choice 回扣上次談過的作品細節。**
3. `com02j_simple_praise` — **「看起來很厲害。線很乾淨。」**

#### Branch `com02j_ask_drawing`

**Protagonist**：這幾張是在抓同一個角色的動作嗎？

**Visual**：`JYC-SPR-CAFE.caught_drawing`。

**Jiang Yucheng**：嗯。要讓她換衣服、換姿勢，還是看得出來是同一個人。

**Protagonist**：所以先找不會變的地方。

**Jiang Yucheng**：輪廓、重心，還有她站著的習慣。臉反而不是第一個。

**Jiang Yucheng**：你怎麼看出來是同一個角色？

**Protagonist**：肩膀和手的位置很像。也可能我猜錯。

**Jiang Yucheng**：沒有，猜對了。

→ Rejoin `common_station_cafe_jyc_parallel`

#### Branch `com02j_continue_topic`

**Condition**：依 `jyc_first_topic` 顯示一條，不顯示其他版本。

**Variant — visual_design**

**Protagonist**：妳這張夜景，也是在處理上次說的暗部嗎？

**Jiang Yucheng**：有一點。但我不想把東西藏在黑色裡，所以亮的地方要更少。

**Protagonist**：讓視線自己走過去。

**Jiang Yucheng**：對。不是把整張圖拉亮。

**Variant — worldbuilding**

**Protagonist**：這個角色的環境，看起來也有雨港那種分區。

**Jiang Yucheng**：氣氛有參考，設定不是。她住的地方更乾，而且更窄。

**Protagonist**：所以不是 fan art。

**Jiang Yucheng**：不是。是我自己的。

**Variant — edition_value**

**Protagonist**：妳自己的圖，註釋會放到看得清楚嗎？

**Jiang Yucheng**：會。被那本機械稿氣過之後一定會。

**Protagonist**：看來買錯版本也有用途。

**Jiang Yucheng**：教材反面。

→ Rejoin `common_station_cafe_jyc_parallel`

#### Branch `com02j_simple_praise`

**Protagonist**：看起來很厲害。線很乾淨。

**Visual**：`JYC-SPR-CAFE.tiny_laugh`。

**Jiang Yucheng**：還沒畫完。現在看起來乾淨，是因為我把亂的圖層關掉了。

**Protagonist**：那我剛好在正確的時間看到。

**Jiang Yucheng**：大概三十秒後就不是了。

**Action**：她重新打開參考圖層，畫面變得複雜；她沒有急著證明自己。

→ Rejoin `common_station_cafe_jyc_parallel`

### `common_station_cafe_jyc_parallel`

**Visual**：窗邊桌 wide composite；雨澄用 tablet，男主開 laptop，兩人不正面相對。

**Narration**：接下來十幾分鐘，我們各自看著自己的螢幕。

**Narration**：她改了幾次線。我回完兩封訊息。沒有人負責把沉默變成話題。

**Audio**：咖啡機、遠處人流、stylus 輕觸聲。

**Action**：男主闔上 laptop 準備離開；雨澄先抬頭。

### `common_station_cafe_jyc_reciprocity`

**Jiang Yucheng**：你的工作都可以這樣帶著走？

**Protagonist**：大部分。好處是在哪裡都能做。

**Jiang Yucheng**：壞處也是？

**Protagonist**：也會跟著回家。

**Jiang Yucheng**：那確實不只一個好處。

**Visual**：`JYC-SPR-CAFE.interested`；語氣是輕吐槽，不是分析男主逃避工作。

### `common_station_cafe_jyc_exit`

**Protagonist**：我得進會議了。今天謝謝妳分桌子。

**Jiang Yucheng**：這本來也不是我的桌子。

**Protagonist**：那謝謝妳沒有趕人。

**Jiang Yucheng**：店員也沒有。

**Action**：男主背起 laptop bag。雨澄把 stylus 放回筆槽。

**Protagonist**：下次見，江雨澄。

**Jiang Yucheng**：……下次見。

**Narration**：這次我們有了名字。還沒有非得交換其他東西的理由。

**End actions**：設定姓名與 creator-work knowledge；套用 choice stats；`relationship.jyc.familiarity +=1`；解鎖 `COM-03J`。

## State contract

### Conditions

```yaml
requires:
  - COM-01J completed
  - met_jiang_yucheng == true
  - heard_station_cafe_from_jyc == true
forbids:
  - contact_jyc == true
```

### Stats

```yaml
base:
  relationship.jyc.familiarity: +1
choice_local:
  ask_drawing: { trust: +1 }
  continue_topic: { familiarity: +1 }
  simple_praise: { chemistry: +1 }
```

### Flags / knowledge

```yaml
set:
  player_knows_jyc_name: true
  jyc_knows_player_name: true
  jyc_creator_work_seen: true
  jyc_initiated_second_contact: true
  jyc_second_topic: her_art | shared_work | general_praise
unchanged:
  contact_jyc: false
  jyc_alias_private: false
  jyc_alias_exposed: false
  relationship.jyc.romanticSignal: false
```

- `jyc_creator_work_seen` 只表示看過她在畫圖；不代表知道匿名帳號、商業委託或完整繪師身份。
- 不設 `jyc_seen_in_element`；該旗標保留給 JYC-05 的完整 ACG 主場。

### Next structural targets

- 解鎖 `COM-03J`（推薦／Discord）。
- 本幕與 COM-02X 都完成後，common sequence 可進 `COM-03X`／`COM-03J` 的聯絡方式建立。

## Runtime / Memory intent

- 建議拆成 12–15 個 nodes，前綴 `common_station_cafe_jyc_*`。
- Memory title：**咖啡店重逢**。
- Memory cover：`CG-COM-04`；未生成時用 cafe BG + `JYC-SPR-CAFE focused_drawing` composite。
- Replay choice callback 需讀 replay-local COM-01J choice snapshot；若產品不保存局部歷史，使用不指定 topic 的中性版本。

## Art needs

### Background

- `BG-CAFE-STATION` — P0。
- 比樓下 cafe 更有 transit 人流感，但窗邊角落保持安靜；插座、桌面深度與兩人各放一台裝置的空間要可信。
- 玻璃反射不得生成第二張錯誤人臉；背景招牌與菜單不可有真品牌／亂碼焦點。

### Sprite

- `JYC-SPR-CAFE` — Wardrobe A / Look 02 Café / Creator。
- Required expressions：`focused_drawing`, `caught_drawing`, `interested`, `talking_about_art`, `tiny_laugh`，均取自 canonical Café set。
- Props：tablet + stylus；坐姿版或 3/4 身 placement 必須與桌面高度相容。
- 若 wardrobe crop 顯示黑色絲襪，依 canonical sheet 自然呈現；不得以腿為主要焦點。

### CG

- `CG-COM-04` — P1。
- 價值：同時表現 creator competence、被認出前的專注與主動打招呼前的一秒猶豫，這些是單一 standing sprite 無法完成的轉折。

## Art shot lock

### Shot A — Cafe entry / recognition（locked）

- Camera：男主進店 POV，先看到可工作的環境，再在窗邊認出雨澄；避免像鏡頭直接搜尋 heroine。
- Focal order：空位／插座 → 窗邊 tablet → 熟悉側影。
- UI safe zone：下方 25%；桌上裝置在中段。

### Shot B — CG-COM-04（locked）

- Trigger：男主認出她、尚未決定是否打招呼時；她從 focused drawing 停筆抬頭的瞬間。
- Camera：9:16 seated 3/4，男主 POV 略站在桌側；可有 laptop bag 邊緣，不得出男主臉。
- Composition：臉在上半，tablet/stylus 在中段，窗光從側邊進；背景人流柔焦。
- Head pose / gaze：開始下巴微收、視線在 tablet；抬眼認出男主後頭部只小幅轉動，不用誇張驚訝。
- Expression：`focused_drawing → surprised recognition → hesitant interest`；最後的招呼留到 sprite。
- Hand lock：stylus grip 符合實際繪圖；另一手可扶 tablet／放桌面，不出現漂浮手指。
- Wardrobe：JYC Wardrobe A Look 02；服裝完整，腿部若入鏡只作坐姿 continuity。
- Lighting：柔窗光＋暖 cafe practical；screen glow 輕微，不把臉打藍。
- Safe zone：下方中央不放手、stylus tip 或 tablet 主要內容。
- Negative constraints：無性感畫畫 pose、無小學生感、無亂碼佔滿螢幕、無錯誤 stylus 手、無男主固定臉。
- Hold / exit：持續到她視線碰上男主；她開口前切回 sprite，讓猶豫節奏可由 dialogue timing 控制。

### Shot C — Parallel work composite（locked）

- 兩人不是面對面 date seating；優先同側斜角／相鄰桌位，能各自看自己的螢幕。
- 雨澄 tablet 與男主 laptop 形成視覺平衡，但不把畫面拍成兩位專業人士廣告。
- 10–20 分鐘以 2–3 個短 dissolve / ambient nodes 表現，不另外生 montage CG。

## Dialogue writing notes

### Jiang Yucheng

- 主動打招呼是重要 agency：她不是被男主叫住後才被動應答。
- 她用上次共同作品作安全入口，不說「好巧」三次。
- 名字句可以短，甚至像補交上次忘記做的事；不需要握手。
- 談作品時語速與句長上升，內容要有 craft：silhouette、色彩、畫面閱讀、版本取捨，不能只說「我喜歡畫畫」。
- 她主動回問男主一件具體事，確保 reciprocity。

### Male protagonist

- 他記得 cafe 是因為資訊實用，不因「她說過所以特地來找她」。
- 先問座位／打擾與否，不自行坐下；但不要把基本禮貌寫成聖人舉動。
- 他能看出畫面元素，不等於理解她的匿名身份或害怕被看見。
- 工作期間願意安靜，不一直用問題填空。

### Sample line intents（非最終逐字稿）

- 雨澄主動句：「那本……後來有買嗎？」停頓是找共同入口，不是口吃。
- 姓名交換：「上次忘了問。我叫——。」／「江雨澄。」
- 普通稱讚回應：「還沒畫完。現在看起來乾淨，是因為我把亂的圖層關掉了。」
- 她的回問應針對男主當下工作狀態，不診斷他「總是在工作」。

### Prohibited beats

- 男主把去 cafe 說成「我記得妳，所以特地來」。
- 站在她背後偷看、碰 tablet、要求看完整作品。
- 她否認所有能力，等男主鼓勵「妳很有才華」。
- 本幕揭露匿名帳號或交換 Discord／Line。
- 兩人直接把同桌定義成約會。

## End state

- 雙方正式知道姓名；雨澄主動完成第二次 contact。
- `F_JYC +1` base，玩家選擇再增加一項小幅 relationship texture。
- 男主知道她會畫圖、對角色／視覺設計有實際能力；不知道匿名身份。
- 雨澄知道男主在科技工作、能遠端處理事情，且可以與她同桌不強迫持續聊天。
- `COM-03J` 可用作品推薦作下一次聯絡理由，而不是突然索取帳號。

## Review log

- Player-perspective pass：重逢由記住實用推薦驅動；即使沒有雨澄在店內，男主來此工作也成立。
- Character/continuity pass：COM-01J 的 topic 與 cafe seed 均可回扣；姓名在此才交換，contact 仍保留到 COM-03J。
- Reciprocity pass：雨澄先打招呼、後回問，避免整幕只有男主理解／引導她。
- Choice pass：三個選項皆可形成正常互動，差異在 connection texture，不是能力測驗。
- Art pass：CG timing 與 canonical prompt 的「creator focus → recognition」一致，scene file 鎖定她抬眼後主動開口。
- Locked unresolved items：若 runtime 不支援跨 scene choice callback，COM-01J 的 specific topic 改為中性「上次那套設定集」版本，不新增旗標替代。
