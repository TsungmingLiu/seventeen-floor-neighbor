# COM-01B — 週末前的方向

## Current authorized weekend/weekday design — ND-ARC-001

- Lifecycle: **CANONICAL** task-local Narrative Design amendment, 2026-10-04. Source ref: `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9`. Human 授權本輪方向與必要改寫；本 pass 沒有新 final prose、QA、runtime 或 CG acceptance。
- Owning design: `docs/narrative/JYC_WEEKEND_WEEKDAY_REVISION.md`；current contract: `content/production/narrative/opening-ch1/COM-01B.json`。此 design section 與 current JSON 取代下方 baseline 的衝突時序／gate；下方舊 Locked prose 與其歷史 binding 完整保留作局部改寫或相容性參考，不是本輪新 Script Lock。
- 週末／平日行動入口：四個 dialogue unit 之一；只改週末 decision 以後及新增平日 transition，保留前晚問路完整 prose。週末晴朗，在家作 go/home action；home 拆箱與工作，bookstore 接 COM-01J→實際購書→回家，兩支都 COM-02X。同幕所屬 common_weekday_outing_* 在 COM-02X 後才執行：平日下午居家工作疲累、出門；曾真正取得書店初遇（含 replay）直接 cafe reunion，未取得者才 cafe-first/street choice。street 獨走台北、感受熟悉又陌生、回家接 COM-03X；保留當次排除事實，後續江線 eligibility 依實際取得的書店或 cafe 首遇累積判定。
- Stable ID plan：common_weekend_home_enter/work/exit；common_weekday_outing_work/tired/decision/street_enter/street_return；com01b_weekday_cafe_first/com01b_weekday_street_walk。既有 weekend go/skip IDs 保留；舊 common_bookstore_bridge_cafe_decision 與 cafe_skip IDs 不挪作永久排除意圖，保留歷史兼容但新走法不播放。
- 永久排除：本輪 `com01b_weekday_street_walk` 才寫 `jyc_permanently_excluded=true`。此 flag 保留當次街頭選擇事實，不由 merge、reload、scheduler、public shared scene 或 ordinary invite 清除。尚未真正取得任何初遇時阻擋後續江線；初次遊玩或 replay 真正完成 COM-01J 書店初遇或 COM-02J cafe 首遇可累積取得後續 eligibility。replay 保留自己的 cursor、snapshot、refusal／consent 及購書／contact 事實；只有實際取得的 eligibility 持久化，不覆寫 greatest-progress frontier／主線 Continue。cafe reunion 仍只認書店初遇，cafe-only replay 保持 initial。
- Semantic visual impact 與四個必要 dialogue units 見 owning design；現有 accepted image bytes、QA/Human 歷史都保留。獨立下游才裁決哪些畫面可重用。

## Current Script Lock — CW-COM-01B-001

- Stage: **Scene Dialogue / LOCKED, NEEDS_REVIEW**；2026-10-04。本節是本輪唯一 active playable script；待 fresh `content_qa / narrative_review`，尚無新 runtime、visual 或 Human preview acceptance。
- 本節保留原前晚偶遇、三個問路分支、晚安與 rejoin 的文字和 stable IDs。週末 decision 以後依 ND-ARC-001 改寫；下方 `Preserved pre-revision baseline` 全部是歷史原文，不可由其舊 next/state/cafe blocks 編譯本輪主線。
- Canonical contract 與 owning arc design 不變。接續標記是 integration 用的精確 authoring mapping；不宣稱 runtime 已寫入或永久排除已測試。

### Entry / selectors / state markers

JSON 中 `history` 以 choice-node ID 為 key，value 為實際選中的 choice ID；`completed` 表示實際完成的 scene，`flags` 表示實際事件狀態。這是本幕可直接解析的 selector/state 表達，不新增重複的 route enum 或分數。`all`／`any`／`not` 僅是 bounded authoring condition；整合者負責編譯成現有 engine schema。`jyc_bookstore_ever_earned` 只由初次遊玩或 replay 真正完成 COM-01J 初遇取得；不是 go、一般 met/contact 或 cafe 首遇。GAME 與 replay 共用下列 decision tree，累積 eligibility 不合併當次 story facts。

```json
{
  "scene_id": "COM-01B",
  "active_script_section": "Current Script Lock — CW-COM-01B-001",
  "initial_entry": {
    "all": [
      {"completed": "COM-01X"},
      {"flag": "met_xu_tang", "equals": true},
      {"flag": "met_jiang_yucheng", "equals": false}
    ],
    "next": "common_bookstore_bridge_enter"
  },
  "weekend": {
    "node": "common_bookstore_bridge_weekend_decision",
    "time": "sunny_weekend_afternoon_before_departure_from_home",
    "choice_class": "action",
    "choices": [
      {
        "id": "com01b_bookstore_go",
        "history_write": {"common_bookstore_bridge_weekend_decision": "com01b_bookstore_go"},
        "set": {},
        "next": "common_bookstore_bridge_weekend_transition",
        "handoff": "COM-01J/common_acg_first_meet_enter",
        "after_actual_purchase_and_home_return": "COM-02X"
      },
      {
        "id": "com01b_bookstore_skip",
        "history_write": {"common_bookstore_bridge_weekend_decision": "com01b_bookstore_skip"},
        "set": {},
        "next": "common_weekend_home_enter",
        "sequence": ["common_weekend_home_enter", "common_weekend_home_work", "common_weekend_home_exit"],
        "handoff": "COM-02X"
      }
    ]
  },
  "weekday_resume": {
    "all": [{"completed": "COM-02X"}],
    "next": "common_weekday_outing_work",
    "sequence": ["common_weekday_outing_work", "common_weekday_outing_tired"],
    "selectors": [
      {
        "id": "reunion_after_bookstore",
        "all": [
          {"eligibility": "jyc_bookstore_ever_earned", "equals": true}
        ],
        "set": {},
        "handoff": "COM-02J:bookstore_reunion"
      },
      {
        "id": "home_no_bookstore",
        "all": [
          {"eligibility": "jyc_bookstore_ever_earned", "equals": false}
        ],
        "next": "common_weekday_outing_decision"
      }
    ],
    "unmatched_history": "BLOCKED_INCONSISTENT_SAVE_NO_FABRICATED_ENCOUNTER_OR_FLAG_RESET"
  },
  "weekday_home_choices": {
    "node": "common_weekday_outing_decision",
    "selector": "home_no_bookstore",
    "choice_class": "action",
    "choices": [
      {
        "id": "com01b_weekday_cafe_first",
        "history_write": {"common_weekday_outing_decision": "com01b_weekday_cafe_first"},
        "set": {},
        "handoff": "COM-02J:cafe_first_meet"
      },
      {
        "id": "com01b_weekday_street_walk",
        "history_write": {"common_weekday_outing_decision": "com01b_weekday_street_walk"},
        "set_once_at_selection": {"jyc_permanently_excluded": true},
        "sequence": ["common_weekday_outing_street_enter", "common_weekday_outing_street_return"],
        "handoff": "COM-03X"
      }
    ]
  },
  "historical_unplayed_ids": [
    "common_bookstore_bridge_cafe_decision",
    "com01b_cafe_go_after_bookstore_skip",
    "com01b_cafe_skip_after_bookstore_skip"
  ],
  "unchanged_here": [
    "met_jiang_yucheng", "contact_jyc", "weekend_book_purchased",
    "heard_station_cafe_from_jyc", "jyc_first_topic", "all_relationship_values"
  ],
  "permanent_exclusion": {
    "precedence": "local_street_exclusion_blocks_future_Jiang_only_without_genuinely_earned_initial_encounter_COM01J_or_COM02J_cafe_first",
    "may_reset_in_this_playthrough": false,
    "memory_replay": "persist_only_actually_earned_monotone_eligibility_preserve_cursor_snapshot_local_facts_refusal_consent_and_greatest_main_continue",
    "future_eligibility": "any_actual_initial_encounter_in_first_play_or_replay_bookstore_or_cafe_first",
    "cafe_reunion_eligibility": "actual_COM01J_bookstore_initial_encounter_ever_only_not_cafe_first_generic_met_contact_or_go",
    "legacy_cafe_skip_sets_exclusion": false
  }
}
```

- Home branch 保留實際的未購書／未相遇狀態，不寫入書店 topic、姓名、咖啡推薦或 contact。`weekend_book_purchased` 只由 COM-01J 真正購書後設立；COM-01B 不用 go choice 代替購書事實。
- 平日 reunion 不顯示 cafe/street 選項。咖啡店的初遇／重逢、名字、話題與聯絡同意仍由 COM-02J 演出；此處只交真實入口。兩個咖啡出口都交 COM-03X，保留各自 contact/noncontact 事實。
- 街頭選擇時設 `jyc_permanently_excluded=true` 並保留當次未相遇事實。尚未真正取得任何初遇時，後續 Jiang scenes、訊息、通知、再 discovery、RE-J、reopening、邀約、public/shared presence、ending、afterstory/coda 受此排除。初次遊玩或任何 replay 真正完成 COM-01J 書店初遇或 COM-02J cafe 首遇後，累積 eligibility 可解除後續江線排除，不清除或合併街頭 snapshot。cafe reunion 仍只認 COM-01J，cafe-only 重複 replay 保持 initial。merge、reload、scheduler 和普通邀請不可假造取得；replay 不補姓名、購書、topic、contact、consent 或承諾。低進度／街頭／未交換 replay 不減少累積解鎖，不覆寫 greatest-progress frontier／主線 Continue；拒絕／未交換安全邊界與一次有界線 RE／reopening gate 繼續成立。舊 cafe skip 不可反推此 flag。
- COM-02X 是同週末約 23:00 的真事件 merge；書店支接「買到原本想找的書」的當日話題，home 支接拆箱／工作。COM-03X 是同平日晚間的真事件 merge；不補齊任何 Jiang 姓名、topic、contact 或 availability。
- 書店與咖啡是可錯過的生活機會；新 action 沒有 stance 分數或好壞答案。街頭不授予江線 Friend/Distance ending。非 street 仍遵守既有 familiarity、有限投入、consent、repair／clarity 與一次有界線 reapproach/reopening gates。

### Current playable script

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

**Time transition**：同週末，晴朗的午後；我還在家。

**Narration**：陽光從窗簾邊照進來，落在還沒拆完的紙箱上。我挪開椅子上的衣服，坐了一下。手機裡還留著《逆光航路》新版設定集的介紹；網頁那幾張預覽，看不太出增補了多少。

### `common_bookstore_bridge_weekend_decision`

**Protagonist (thought)**：去許棠說的那家店翻翻，應該比盯著這幾張照片清楚。不過箱子也擱好幾天了，還有工作要整理……先做哪一邊？

1. `com01b_bookstore_go` — **「去地下街書店翻翻設定集。」**
2. `com01b_bookstore_skip` — **「留在家拆箱，整理一下工作。」**

#### Branch `com01b_bookstore_go`

**Protagonist (thought)**：先去找找那本書好了。

**Action**：我把手機收進口袋，拿了鑰匙。門邊那只紙箱擋住一點路，我用腳把它推回牆邊，穿上鞋出門。

→ `common_bookstore_bridge_weekend_transition`。

#### Branch `com01b_bookstore_skip`

**Protagonist (thought)**：今天先把家裡弄好一點。書晚點再找。

**Action**：我放下鑰匙，把手機擺到桌上，從最近的一只紙箱撕開膠帶。

→ `common_weekend_home_enter`。不播放書店 transition 或任何週末 cafe choice。

### `common_weekend_home_enter`

**Narration**：這箱裝的是杯子和一些雜物。搬家前塞進去的時候沒分清楚，現在得一樣一樣拿出來。

**Action**：我先把杯子洗好，放進櫃子。幾條纏在一起的線攤了一桌，其中一條找不到要接的東西，只好先收進抽屜。

**Narration**：拆空的箱子壓平後靠到門邊，地板總算多出一塊能直接走過去的地方。我站著看了看，又把椅子移回桌前。

→ `common_weekend_home_work`。

### `common_weekend_home_work`

**Action**：我打開筆記本電腦，把之前沒整理完的工作檔案叫出來。原本只想列一下要改的地方，看到其中一段，又順手改了下去。

**Narration**：水杯放在鍵盤旁邊，喝完了才發現已經坐了很久。我起身再倒一杯，經過門邊時，順便把剛才掉在地上的膠帶撿起來。

**Protagonist (thought)**：剩這一段，弄完再休息。

**Narration**：存好檔案時，窗邊的光已經移走了。我伸了個懶腰，隨便弄了點東西吃，晚些又回到桌前，把下一次要做的項目補齊。紙箱還剩幾只，不過今晚找杯子和充電線都不用翻箱了。

→ `common_weekend_home_exit`。

### `common_weekend_home_exit`

**Time transition**：同週末，約 23:00。

**Action**：我存好最後一份檔案，合上電腦。杯子裡剩一點涼水，我喝完，才注意到肚子又餓了。

**Protagonist (thought)**：下樓買點吃的吧。

**Action**：我從桌邊拿起鑰匙。門邊騰出的地方很好走，這次不用側身擠過紙箱。

→ `COM-02X` 的 home-work 當日版本；該幕演出深夜便利店事件。未去書店、未買設定集、未遇江雨澄。

### `common_bookstore_bridge_weekend_transition`

**Time transition**：同週末，約 15:40。

**Action**：我走進台北地下街，來到那家以設定集與周邊為主的 ACG 店。我想查《逆光航路》新版究竟增補了什麼。

→ `COM-01J` / `common_acg_first_meet_enter`；作品對話、實際購書及回家由該幕演出，再交同週末約 23:00 `COM-02X` 的 purchased-book 當日版本。本日不交 COM-02J。

### `common_weekday_outing_work`

**Entry marker**：只在 `COM-02X` 真正完成後 resume；不從上述週末 decision 直接跳入。

**Time transition**：接下來的一個平日，午後；家裡。

**Narration**：工作檔案佔滿螢幕。我把上午留下的修改逐項做完，回頭核對時，又找到一處漏掉的地方。

**Action**：我補上那一處，存檔，再把今天做完的項目記下來。桌邊的杯子已經空了；起身拿水時，肩膀才慢慢鬆開。

→ `common_weekday_outing_tired`。

### `common_weekday_outing_tired`

**Narration**：坐回去以後，我盯著下一份檔案，讀了兩次開頭，還是沒讀進去。窗外有車子經過，我抬頭看了一下，才發現下午已經過了一半。

**Protagonist (thought)**：出去一下好了。換個地方，晚點再看。

**Action**：我把筆記本電腦收進包裡，拔下充電線。水杯留在桌角，等回來再洗。

#### Selector `reunion_after_bookstore`

**Local-fact playback marker**：此 selector 的 COM-02J handoff 只由真正取得的書店初遇 eligibility 決定，不要求本次 go、購書或 met/contact，也不受本次街頭排除撤銷。以下既有設定集 narration 僅在本次實際購書時播放；書店推薦 thought 同時要求本次實際購書及真實取得該推薦；北出口 action 僅在本次真實取得該推薦時播放。replay 只有 eligibility 時不匯入這些 local facts／文字，以已成立的外出 intent 交 COM-02J；不新增 spoken prose。

**Narration**：那本週末買回來的設定集放在桌子另一邊，書籤還夾在增補的部分。我把它也放進包裡。

**Protagonist (thought)**：上次書店那個女生提過的咖啡店，可以去坐坐。書也還沒翻完。

**Action**：我穿好鞋，帶著包出門，往地下街北邊出口的方向走。

→ `COM-02J:bookstore_reunion`。不預演她是否在場，不顯示 `common_weekday_outing_decision`；相遇由 COM-02J 的 approved reunion entry 演出。

#### Selector `home_no_bookstore`

**Selector marker**：名稱保留為 stable authoring ID；條件為尚未真正取得書店初遇 eligibility，包含 cafe-only 初次遊玩／replay。不是一般 met/contact 的反面。以下文字只述本次已成立的許棠地理資訊。

**Narration**：拉上包的拉鍊時，我想起許棠提過，地下街附近出口上層有咖啡可以坐。要找個地方坐下，還是先在街上走走？

→ `common_weekday_outing_decision`。

### `common_weekday_outing_decision`

**Visibility marker**：僅 `home_no_bookstore`，即未真正取得書店初遇 eligibility；此時仍在家門內。本次未到訪書店／未初遇的 local facts 保留；cafe-only 曾取得的累積 eligibility 不改為 bookstore reunion，也不併入姓名／contact。

1. `com01b_weekday_cafe_first` — **「去附近找間咖啡店坐一會兒。」**
2. `com01b_weekday_street_walk` — **「在台北街上走走，再回家。」**

#### Branch `com01b_weekday_cafe_first`

**Protagonist (thought)**：找個地方坐一下好了，順便把手邊的事理一理。

**Action**：我往地下街附近走，沿街找一間能坐下的咖啡店。

→ `COM-02J:cafe_first_meet`；只帶許棠的大致地理推薦，沒有書店前事、Jiang 推薦、姓名、作品話題或 contact。現場交談與聯絡 consent 由該幕演出；其 contact/noncontact 出口都接同平日晚間 COM-03X。

#### Branch `com01b_weekday_street_walk`

**State marker, before next node**：`history[common_weekday_outing_decision]=com01b_weekday_street_walk`；`jyc_permanently_excluded=true`，保留本次 snapshot；後續江線排除依真正取得的任何初遇 eligibility 判定，不以 eligibility 清除此 local flag。

**Protagonist (thought)**：今天先走走吧，電腦晚點再拿出來。

**Action**：我把包背上，鎖好門，走到樓下。

→ `common_weekday_outing_street_enter`。

### `common_weekday_outing_street_enter`

**Narration**：出了大樓，我先沿著平常走的方向過馬路，到下一個路口才轉彎。下午的台北有點熱，騎樓底下還留著一小段陰影。

**Narration**：前面的路口我記得。走近一點，才發現記憶裡的招牌已經不在了，原本熟悉的門面換成別的店。剛才還覺得不用看路，現在又停下來確認了一次路牌。

**Action**：綠燈亮了，我跟著行人過街。巷子裡停著一排機車，我把包往身前挪，側身走過較窄的地方。

**Narration**：路的方向還記得，沿路的店卻得重新看。轉出巷口時，車流的聲音又近了；那個等紅燈的位置有點熟悉，抬頭看到的樓面卻和印象裡不一樣。

**Protagonist (thought)**：大概走這邊能繞回去。再往前看一下好了。

**Action**：我沿著騎樓慢慢走，累了就在路口停一會兒，看車子一輛輛過去。包裡的電腦貼著背，有點重，我換了一邊肩膀。

→ `common_weekday_outing_street_return`。

### `common_weekday_outing_street_return`

**Time transition**：同平日，傍晚。

**Narration**：回程看到熟悉的大樓入口時，我才把手機收回口袋。剛才繞的那段路，在地圖上其實沒有多遠，走起來卻花了一陣子。

**Protagonist (thought)**：下次走到那個路口，應該不用再查了。

**Action**：我走進大樓，把肩上的包往上提了提，按下電梯的按鈕。

→ `COM-03X` 的包裹事件入口，保持本次未見／未聯絡江雨澄與街頭排除 snapshot；後續江線可玩 eligibility 可由任何真正取得的書店或 cafe 首遇（含 replay）累積解鎖，不匯入相遇／contact／consent，不覆寫主線 Continue。包裹、許棠 samples、Line 等事件仍由 COM-03X 演出；本幕不提前播放，也不加任何人影、舊識或補遇。

### Semantic visual change report / handoff boundary

- 保留前晚大樓外偶遇、指路、明亮道謝後的安靜，以及 go-only 約 15:40 地下街入口的事件含義和 usable 原文；未檢查或裁決已有 CG。
- 週末 decision 現在是晴朗午後的家內，選擇前尚未出門；新增撕開紙箱、收杯子與線材、工作、深夜拿鑰匙等生活事件。home 不播放書店入口。
- 新平日下午居家工作、完成修改、疲累、收電腦；reunion 另有已買設定集入包的真實 prop，home 則只有原本大致咖啡地理。新 solo Taipei 街景、路口與傍晚回大樓完全沒有 Jiang presence。
- 書店購書／回家、週末 Xu 當日談話、兩個 cafe 入口、包裹之後的條件播放由對應 scene/integrator 擁有，不在本稿另寫其 prose。既有 accepted image bytes 與 QA/Human 歷史保留，新的 semantic/conditional impact 交獨立下游。
- Naturalization sweep: **exactly one** bounded continuous read completed for this current script；不改 contract、knowledge timing、choice effects 或 approved beats。保留整段前晚原文；新版 home／weekday／street 用第一人稱當下觀察，沒有以旁白解釋人物隱藏動機、戀愛結果或 state guardrails。

## Preserved pre-revision baseline — historical only, unplayed conflicts


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
