# Prototype Braided Narrative Spec

> 狀態：**Canonical prototype narrative plan / pre-script**
>
> 版本：0.5
>
> 更新：2026-09-23
>
> 範圍：只涵蓋許棠、江雨澄雙女主 prototype。現有 playable story 僅為技術驗證，不是本文件的劇情 canonical。
>
> 上位規格：世界觀與人物基礎見 `docs/proposals/urban-dating-sim-setting-proposal.md`；runtime/content 架構見 `ARCHITECTURE.zh-TW.md`；玩家回憶／replay 顯示規格見 `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`。
>
> 配套文件：
> - `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`：route DAG、dependencies、state/knowledge flags。
> - `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`：背景、立繪、特殊 CG 與逐 scene asset mapping。
>
> 本文件的目的，是讓後續 writer 可以逐 scene 打磨台詞，讓 implementation session 可以把 scene 拆成 stable story nodes，而不必重新推導劇情意圖。

---

## Canonical prototype cast facts

- 男主：31 歲。
- 許棠：**27 歲 / 約 170 cm**，自由接案視覺設計師，17 樓隔壁。
- 江雨澄：23 歲 / 約 160 cm，纖細小骨架、腿相對偏長，研究生＋兼職插畫師。

角色年齡與身高若和舊 runtime fixture / 舊 asset recipe 衝突，以本節、setting proposal 與 Character Bible 最新版本為準。

# 1. Narrative pillars

## 1.1 核心體驗

Prototype 不採「Chapter 3 選一位女主後另一位消失」的傳統 route lock。

玩家前中期可以：

- 同時認識兩人；
- 在有限社交時間中偏向其中一人；
- 改變主意並重新靠近另一人；
- 因自然生活交集再次偶遇；
- 讓兩位女主逐漸知道彼此存在；
- 在尚未 exclusivity 前同時約會，這本身不視為錯誤；
- 若在關係已需要承諾時仍刻意隱瞞，可進入 overlap / confrontation；
- 最終才進入 late route lock。

設計核心：

> **玩家不是在選攻略角色，而是在幾週的生活裡分配時間、注意力與誠實程度。直到某一天，「不選擇」本身也成為選擇。**

## 1.2 男主共通弧線

男主 31 歲，Senior Software Engineer / Tech Lead。能力強、生活有秩序、習慣自己處理問題。

他的問題不是不懂戀愛，而是：

- 用 competence 掩蓋 vulnerability；
- 把衝突當 debug；
- 不舒服時投入工作；
- 把「尊重對方」變成不表達自己的需求；
- 在不確定時傾向保留所有 option，而非做明確選擇。

許棠與江雨澄都必須反過來看穿他，而不是只有男主「正確理解女主」。

## 1.3 許棠主題

> 親密不等於管理；自主也不等於永遠不需要任何人。

她要學的是 bounded support 與共同決策；男主要學的是先詢問、也要誠實表達自己的失望與需要。

## 1.4 江雨澄主題

> 安全感不是永遠躲在匿名／線上版本後面，而是知道自己可以決定何時、向誰、以什麼程度被看見。

她不需要被「治好社恐」。男主也必須承認自己只是用工作與成熟表現做另一種 hiding。

---

# 2. Relationship model

每位女主獨立維護：

~~~text
F = familiarity
T = trust
C = chemistry
K = compatibility
~~~

一般 choice 建議變動 `-1 / 0 / +1`；核心行為可 `±2`。數值不直接顯示。

Ending 不得單靠數值。還要結合：

- repeated behavior pattern；
- heroine-specific flags；
- repair 是否成功；
- relationship intent；
- exclusivity / overlap / deception 狀態；
- 女主對另一人的 knowledge。

## 2.1 行為 pattern 原則

單次犯錯通常不直接判死刑。

例如許棠真正介意的是反覆 pattern：

~~~text
unsolicited_advice
+ decided_for_her
+ reorganized_her_space
+ defended_action_with_result
→ control_pattern
~~~

江雨澄同理：

~~~text
spoke_for_her
+ exposed_alias
+ pushed_public_visibility
+ treated_shyness_as_problem
→ pressure_pattern
~~~

重大錯誤之後若有真實 repair，仍可進入 Good/Friend；反覆不理解才推向 Distance。

---

# 3. Dialogue rules for later writing

本 spec 記錄的是 **dialogue intent，不是 final dialogue**。

後續 writer 必須遵守：

1. 不讓人物直接說出完整心理學診斷。
2. 衝突中多使用停頓、改口、短句、誤解、第二天才說清楚。
3. 「最體貼」的選項不應總是正解。
4. 三個選項應盡量都是成年人可能真的會說／做的事。
5. 好選項的價值應來自理解人物與累積 context，而不是一眼看出 moral answer。
6. 許棠生氣時更平靜、更短，不大喊。
7. 江雨澄線上比線下更快、更毒舌；熟悉後線下也會逐步出現同一人格。
8. 男主不能永遠 emotionally articulate。尤其第一次衝突時，他應先說「沒事」或試圖合理化，再被迫承認自己其實在意。
9. 女主必須多次主動、照顧或看穿男主，關係才是雙向。
10. Friendship ending 不是「沒達標」；它要回答為什麼兩人重要但此刻不成為戀人。

---

# 4. Macro pacing

故事約跨 6–7 週，不使用硬核 calendar simulator，但 scene text 可以自然標示時間。

~~~text
COMMON
  ↓
OPEN DATING A
  ↓
EARLY 1-ON-1
  ↓
FIRST CROSSOVER
  ↓
OPEN DATING B / RE-APPROACH
  ↓
SECOND CROSSOVER
  ↓
BRAIDED INTIMACY
  ↓
HEROINE CONFLICTS
  ↓
REPAIR INVITATIONS
  ↓
COMMITMENT GATE
  ├─ honest Xu focus
  ├─ honest JYC focus
  ├─ honest overlap
  └─ deceptive overlap → confrontation
  ↓
LATE LOCK
  ↓
Good / Friend / Distance
~~~

真正的 route lock 約在整體 65–75% 之後。

---

# 5. Scene specifications

以下 ID 是 **authoring-level scene / gate IDs**。Implementation 時每個 scene 仍會拆成多個 stable runtime node；不要把 scene ID 當成唯一 runtime node。

## 5.1 COMMON

### COM-00 — 雨夜搬家

**時間／地點**：Week 1，雨夜，17 樓走廊。  
**Entry**：遊戲起點。男主剛搬回台北，新家仍是紙箱。  
**Dramatic question**：這是一個新開始，但他真正要讓什麼進入生活？

**Beats**
1. 搬家公司已走，男主自己處理最後幾箱。
2. 防火門／走廊門快關上，許棠回來順手扶門。
3. 她幫忙挪一個卡住的箱子，但不熱心到主動留下幫搬家。
4. 短暫自我介紹；知道是隔壁住戶。
5. 她進門，男主回到安靜新家。

**Choice intent**
- 正式道謝：偏克制。
- 自嘲堵住公共走廊：偏幽默，`C_XT +1`。
- 專注收箱子：neutral。
不設明顯最佳答案。

**Exit**
- `met_xu_tang = true`
- 解鎖 COM-01X / COM-01J。

**Memory**：common / scene cover，progress band 100。  
**Art**：BG-APT-17F-RAIN；XT-SPR-WEEKDAY；CG-COM-01。

---

### COM-01X — 電梯重啟

**時間／地點**：3–4 天後，公寓電梯。  
**Entry**：`met_xu_tang`。  
**Purpose**：第一次真正聊天；不是大事故。

**Beats**
1. 兩人剛好同乘。
2. 電梯短暫停住／燈閃，系統數秒後重啟。
3. 許棠用乾式幽默解除尷尬。
4. 兩人交換附近生活資訊。
5. 到 17 樓自然分開。

**Choice**
幽默／實際／安靜陪等，只塑造男主 tone。

**Exit**：`F_XT +1`。  
**Memory**：common。  
**Art**：BG-APT-ELEVATOR；XT-SPR-WEEKDAY；停電近景 CG 為 P2 optional。

---

### COM-01J — 地下街初遇

**時間／地點**：同週末，台北地下街 ACG 店。  
**Purpose**：用共同興趣，而不是英雄救美，建立江雨澄入口。

**Beats**
1. 男主真的在找設定集／遊戲相關物。
2. 江雨澄在同一架比較兩本書。
3. 男主針對作品本身講一句具體看法。
4. 她起初短答，發現他真的懂後多說兩句。
5. 不交換名字與聯絡方式。

**Constraints**
- 不撞到她。
- 不撿東西。
- 不因外貌搭訕。
- 不把她寫成可愛小動物。

**Exit**
- `met_jiang_yucheng = true`
- `F_JYC +1`

**Memory**：common。  
**Art**：BG-ACG-SHOP；JYC-SPR-CAMPUS；CG-COM-02 P1。

---

### COM-02X — 深夜便利店

**地點**：樓下無品牌便利店，約 23:00。  
**Purpose**：把許棠從「漂亮鄰居」變成有疲憊、晚餐、deadline 的普通人。

**Beats**
1. 男主買宵夜。
2. 許棠居家 casual，拿咖啡與簡單晚餐。
3. 她第一次叫出男主名字。
4. 聊附近食物與工作作息。
5. 她不需要解釋為什麼這麼晚吃飯。

**Choice**
問附近吃什麼／聊工作／半開玩笑她也才吃。直接說「妳應該好好吃飯」會產生輕微界線訊號但不扣大分。

**Exit**：`F_XT +1`。  
**Art**：BG-CONVENIENCE-NIGHT；XT-SPR-LATE-CASUAL；CG-COM-03。

---

### COM-02J — 咖啡店重逢

**地點**：地下街／台北車站附近咖啡店。  
**Continuity**：第一次見面時她曾提過這家店比較安靜，故第二次相遇不是純巧合。男主因需要找地方工作而進店。

**Beats**
1. 江雨澄在窗邊用 tablet 畫圖。
2. 她先看到男主，猶豫數秒才打招呼。
3. 正式交換名字。
4. 普通聊天仍短；談作品、角色設計後話變多。
5. 男主第一次看到她「有主場時不是安靜的人」。

**Choices**
問她畫什麼／延續上次作品／泛稱「好厲害」。前兩者提供更具體連結。

**Exit**：`F_JYC +1`，可進 COM-03J。  
**Art**：BG-CAFE-STATION；JYC-SPR-CAFE；CG-COM-04。

---

### COM-03X — 包裹 / Line

**地點**：17 樓。  
**Purpose**：自然交換聯絡方式。

**Beats**
1. 許棠的印刷樣本被放錯在男主門口。
2. 男主送回／她來敲門。
3. 包裹本身透露她的工作。
4. 門口聊超過五分鐘。
5. 她要傳附近店家／大樓資訊，交換 Line。

**Exit**
- `contact_xu = true`
- `F_XT +1`

**Memory**：可被 COM-03M 壓縮，不必獨立卡。  
**Art**：BG-APT-17F-DAY/NIGHT；XT-SPR-WEEKDAY。

---

### COM-03J — 推薦 / Discord

**Presentation**：聊天 UI + 短現實段落。  
**Purpose**：正式建立 Offline JYC / Online JYC 對比。

**Beats**
1. 她想到一個作品／遊戲推薦。
2. 線下只說幾句，之後加 Discord/Line。
3. 晚上訊息突然變長：meme、截圖、連發分析。
4. 男主發現文字裡的她比本人吵很多。

**Exit**
- `contact_jyc = true`
- `F_JYC +1`

**Art**：聊天 UI；JYC avatar；不需要 CG。

---

### COM-03M — 一週訊息 montage

**Purpose**：用低成本讓時間與期待成立。

**Xu montage**
- 包裹／大樓資訊；
- 附近吃飯；
- 偶爾「吃了嗎」；
- 訊息短但越來越私人。

**JYC montage**
- meme；
- artwork；
- 遊戲；
- 深夜長篇；
- 線上反差。

**Player-facing effect**
玩家開始期待兩種完全不同的 notification。

**Exit**
- `open_dating_unlocked = true`
- 進 OPEN-A。

**Memory**：common / highlight=false。  
**Art**：message montage UI。

---

## 5.2 OPEN DATING A

### OPEN-A — Open Dating Window A

**不是傳統 scene，而是第一個有限 attention window。**

**時間**：Week 2–3。  
**Slots**：建議 2 個 major social slots。

可選 early anchors：
- XT-04 中山書店
- JYC-05 ACG 主場

玩家可以兩個都玩，只是順序不同。若先選一人，另一人不關閉。

**State**
- 更新 `focusHistory[]`
- `recentFocus`
- `lastMajorDate`
- 同時 dating 在此階段不增加 deception。

**W4**：玩家 Memories 不顯示「Open Dating Window」工程名，可壓縮成「那幾個星期六」。

---

### XT-04 — 中山書店

**Purpose**：許棠第一次真正 1-on-1；建立 pace compatibility。

**Beats**
1. 約在捷運出口。
2. 兩人都沒有稱它為 date。
3. 許棠看設計／攝影書看得比預期久。
4. 原本下一站逐漸不重要。
5. 她自己提出再喝咖啡，等於主動延長相處。

**Choice pattern**
- 陪她慢慢看：`K +2, T +1, xt_respected_pace=true`
- 提醒行程：`F +1, K -1`，不算壞。
- 幽默說她要住進書店：高 chemistry 時 `C +1`。

**Exit**：若之後再投資許棠，XT-05 優先開。  
**Art**：BG-BOOKSTORE；XT-SPR-BOOKSTORE；CG-XT-01。

---

### XT-05 — 同一張桌子

**Purpose**：建立「不互相表演也舒服」，並第一次讓許棠看穿男主。

**Beats A：parallel work**
1. 樓下咖啡店再次同桌。
2. 男主 coding，她做 client work。
3. 二十多分鐘不必說話。
4. 她抱怨 client 多次改稿。

**Choice**
幫看／帶晚餐／讓她忙完再叫自己，三者都合理；核心看玩家是否先確認 support mode。

**Beats B：男主 incident**
1. 男主收到 production escalation。
2. 說「五分鐘」，最後四十分鐘。
3. 許棠沒生氣，自己做事，順便帶回一杯飲料。
4. 事情結束後她問：「你每次都是這樣嗎？」
5. 她逐步指出他「看起來什麼都不用人管」。

**State**
- `xt_asked_support_mode` 依前半 choice。
- `xt_saw_competence_mask = true`
- 健康互動：`T +1~2, K +1`

**Art**：BG-CAFE-GROUND-DAY；XT-SPR-BOOKSTORE/WORK；CG-XT-02。

---

### JYC-05 — ACG：她的主場

**Purpose**：展示她不是「沒話說」，而是很多環境不是她的主場。

**Beats**
1. 一起去限定展／地下街。
2. 她自然走前面、講設定、比較版本。
3. 和店員互動時偶爾仍卡，但不是 helpless。
4. 她在作品判斷、遊戲知識上明顯比男主強。
5. 小周邊／抽選形成純 reward beat。

**Choices**
- 讓她帶路：`K +2`
- 認真參與她的興趣：`C +1~2`
- 她一停頓就替她答：`T -1`

**State**
- `jyc_seen_in_element=true`

**Art**：BG-ACG-CORRIDOR/SHOP；JYC-SPR-ACG；CG-JYC-01、CG-JYC-02(P1)。

---

### JYC-06 — Gaming Night

**Purpose**：建立江雨澄版本的 domestic intimacy。

**Beats**
1. 先線上 co-op。
2. 因設備／新遊戲改成男主家同空間。
3. 她進門時客人模式很強。
4. 玩十分鐘後完全放鬆：抱靠枕、吐槽、跟男主競爭。
5. 結束後兩人各滑手機，安靜也舒服。

**Choices**
- 認真跟她競爭：可 `C +1`
- 故意讓她：被發現後 `K -1`
- 一直教：`K -1`
- 接受她比自己強：`K +1`

**State**
- `jyc_home_space_comfort=true`

**Art**：BG-PC-HOME-LIVING；JYC-SPR-GAMING；CG-JYC-03。

---

### SH-01 — 17樓第一次同框

**Trigger**
- JYC-06 已發生；
- 許棠至少 COM-03X；
- 可在雨澄來／離開男主家時觸發。

**Purpose**：第一次讓兩條生活線物理重疊；不製造戲劇，只建立 knowledge。

**Beats**
1. 電梯門開／17 樓走廊。
2. 許棠剛回家。
3. 男主自然介紹兩人。
4. 只有數十秒寒暄。
5. 玩家自己感受到尷尬，不由劇本硬說「修羅場」。

**State**
- `xu_knows_jyc_exists=true`
- `jyc_knows_xu_exists=true`
- `jyc_knows_xu_is_neighbor=true`

若玩家此前對其中一方已有明顯 romantic signal，增加其 awareness suspicion，但不扣分。

**Memory**：shared；只在觸發後顯示。  
**Art**：BG-APT-17F-NIGHT；XT-SPR-WEEKDAY + JYC-SPR-CASUAL；CG-SH-01 optional。

---

## 5.3 OPEN DATING B / MIDGAME

### OPEN-B — Open Dating Window B

**時間**：Week 3–4。  
**Slots**：建議 3 個 major social slots。

可用 scene pool：
- XT-06 夜市
- XT-07 電影＋末班捷運
- XT-08 河濱
- JYC-06B 雨天改行程
- JYC-07 Alias
- JYC-08 主動邀約

不是所有 scene 都必須由玩家菜單直接選；部分可由前置狀態／訊息邀請觸發。

**核心規則**
- 同一女主可連續兩次，形成 recent focus。
- 偏一邊後另一邊可透過 RE-X/RE-J 回到前景。
- 不能因一次沒選就永久關閉。
- 世界要記得玩家最近把時間花在哪裡。

---

### XT-06 — 臨江街夜市

**Purpose**：純粹好玩；在沉重主題前先讓玩家喜歡她。

**Beats**
- 臨時「吃飯了嗎」變成夜市。
- 分享食物。
- 許棠意外擅長一個攤位遊戲。
- 她記得男主飲食偏好。
- 人群中距離縮短。

**Physical choice**
讓她走內側／短暫扶手臂／直接牽住。最後一個只有高 T/C 且已有 reciprocal signal 才不造成 boundary strike。

**State**
- `xt_physical_comfort`
- repeated push 才形成 `xt_physical_push_pattern`

**Art**：BG-LINJIANG；XT-SPR-NIGHT-MARKET；CG-XT-03、CG-XT-04。

---

### XT-07 — 電影＋末班捷運

**Purpose**：明確 date-like、但不急著告白；測試「不同意也能相處」。

**Beats**
1. 電影內容只作話題。
2. 散場後兩人對角色／結局理解不同。
3. 男主可辯到底，也可真的問她為何這樣看。
4. 末班前的車廂很空。
5. 窗戶倒影裡兩人坐得很近。

**State**
- curiosity response：`K +1, T +1`
- insist-on-winning：`K -1`
- attraction signal 可 `C +1`

**Art**：BG-CINEMA-LOBBY、BG-MRT-CAR-NIGHT；XT-SPR-RIVER/RAIN；CG-XT-05。

---

### XT-08 — 河濱：過去

**Purpose**：許棠 trust gate；解釋但不妖魔化前任。

**Reveal**
前任逐步把「關心」變成報備、安排與替她做決定。她真正怕的是關係逐漸要求她交出生活主導權。

**Dialogue intent**
不要讓她完整講出 thesis。她可以用具體往事：
- 「那個案子不要接。」
- 「妳到了為什麼不跟我說？」
- 「我都幫妳問好了。」

**Choice**
- 只罵前任：理解表面。
- 問她最怕哪一部分再次發生：`T +2, xt_understands_autonomy=true`
- 立刻承諾「我絕對不會」：neutral。

**Art**：BG-RIVERSIDE-DUSK；XT-SPR-RIVER/RAIN；CG-XT-06。

---

### JYC-06B — 雨天改行程

**新增目的**：避免江雨澄 route 被 ACG / social anxiety 吃滿；兩人只是普通約會。

**Beats**
1. 原定活動因雨／排隊取消。
2. 臨時改成書店、漢堡、騎樓等雨。
3. 第一次聊研究所、家庭、畢業、工作方向。
4. 她反問男主為什麼回台北。
5. 男主先給 practical answer：「工作在哪都可以。」
6. 她指出：「這不是答案吧。」

**State**
- `jyc_saw_practical_deflection=true`
- 玩家若真正談自己的空白／不確定：`T_JYC +1`

**Art**：BG-RAIN-AWNING-DAY 或 BG-CASUAL-EATERY；JYC-SPR-CASUAL；CG-JYC-04A optional/P1。

---

### JYC-07 — 那個帳號

**Purpose**：匿名身份 vulnerability。

**Set-up**
男主從畫風、簽名習慣、之前聊天內容逐步推斷她是自己曾看過的小型匿名插畫帳號。

**Choices**
- 等她自己說：`T +2, jyc_alias_private=true`
- 私下溫和確認：`T +1`
- 在別人面前提：`T -3, jyc_alias_exposed=true, pressure_strike+1`

**Reveal**
她怕的不是作品不夠好，而是別人喜歡 imagined creator，不喜歡現實中的她。

**Art**：BG-CAFE / PC-HOME；JYC-SPR-ALIAS；CG-JYC-04。

---

### JYC-08 — 你星期六有空嗎？

**Purpose**：第一個真正由她發起的 offline invitation。

**Presentation**
可以用 typing / delete rhythm：
- 問有沒有空；
- 說有一個展；
- 補「沒空也沒關係」；
- 差點撤回。

不要把她寫成完全沒有主見；她是真的想邀，只是不習慣承擔被拒絕的風險。

**State**
- `jyc_invited_player=true`
- 接受但不過度放大：`T/C +1`

**Art**：chat UI。CG 非必需。

---

### RE-X — 許棠重新靠近

**Kind**：reactive scene family，不是固定一個劇情。  
**Trigger**：`recentFocus=jyc` 且許棠仍有足夠 familiarity。

**可用表現**
- 17 樓偶遇；
- 許棠傳「你最近是不是很忙」；
- 便利店碰到；
- 她提起之前沒去成／還沒去的地方。

**Purpose**
讓玩家可以回頭，但許棠記得自己前陣子不是 focus。

**State**
- 若玩家主動重新投資，更新 recentFocus。
- 不自動恢復 romantic momentum；需靠後續 scene。

**Art**：既有 17F / convenience BG + XT sprite，不需要新 CG。

---

### RE-J — 雨澄重新靠近

**Trigger**：`recentFocus=xu` 且雨澄仍有聯絡。

**可用表現**
- 傳新遊戲更新；
- 丟一張圖；
- 問「你最近是不是沒在玩了」；
- 咖啡店自然碰到。

若玩家剛和許棠 conflict 後立刻突然對雨澄非常積極，可加 `possible_rebound` variant；她會察覺男主今天不太一樣，但不會讀心。

**Art**：UI / cafe BG + JYC sprite。

---

### SH-02 — 創作者／設計活動同場

**Trigger**
許棠已透露設計工作 + 雨澄已進入 creator/alias 線。

**Purpose**
證明兩位女主的世界有自己的理由相交，不是只圍著男主轉。

**Beats**
1. 設計／插畫／文創相關活動。
2. 許棠因工作或朋友到場。
3. 雨澄因作品／興趣到場。
4. 兩人第一次有稍長對話。
5. 許棠對雨澄作品給具體、平等的專業評價。
6. 雨澄放鬆一些。
7. 自然出現「你們怎麼認識的？」這類低強度 tension。

**State**
依男主回答更新：
- `xu_knows_jyc_is_close`
- `jyc_knows_xu_is_close`
- honesty impression。

**Memory**：shared highlight。  
**Art**：BG-CREATOR-EVENT；兩人 event sprites；CG-SH-02。

---

### BRAID-C — Braided Intimacy Window

**時間**：Week 4–5。  
**Purpose**：允許兩邊在 late lock 前都走到約 60% 深度。

Available：
- XT-09 → XT-10 → XT-11
- JYC-09 → JYC-10 → JYC-11

玩家不一定兩組都完整觸發，但若兩邊 romantic investment 高，系統應允許兩個核心 conflict 同時存在，這才是 overlap 的壓力來源。

**Implementation note**
這不是全排列。各 heroine arc 仍有內部順序；window 只決定哪條先發生與另一條是否仍開放。

---

## 5.4 許棠中後段

### XT-09 — 門裡面

**Purpose**：私人空間 milestone。

**Set-up**
她 deadline 忙；男主帶晚餐／順路送東西。她第一次直接說「進來吧」。

**Environment**
設計書、紙樣、tablet、杯子、植物、椅背外套；有生活痕跡，不是 staged apartment。

**Choice**
- 不評論凌亂；
- 乾式玩笑；
- 下意識開始整理（`K -1`）。

**Key line intent**
她問「你不無聊嗎？」潛台詞是她不確定自己是否必須一直提供 girlfriend performance。

健康 response 是男主本來也有自己的事，待在這裡就夠。

**State**
- `xt_home_opened=true`
- `T +1~2`

**Art**：BG-XT-HOME-STUDIO；XT-SPR-HOME-WORK；CG-XT-07。

---

### XT-10 — 沒有去成的星期六

**Purpose**：核心 conflict；男主自己的 needs 進入故事。

**Set-up**
原定整天近郊行程。許棠 client crisis 取消，而且並非第一次工作打亂私人時間。

**Choice families**
1. Problem solver：立即找關係／替她處理 → 容易踩 autonomy。
2. Fake respect：「沒事，妳忙」後冷掉 → `xt_withdrew_when_hurt`。
3. Honest but imperfect：先說「沒事」再承認自己其實失望，最後說出「我有時候不知道自己算不算可以靠近妳的人」。

第三種不是完美 therapy script；必須寫得有停頓與笨拙。

**Conflict**
即使健康路徑也不立刻和好。許棠會把他的需要暫時聽成另一種要求；男主也會防衛。

**State**
- `xt_stated_own_need` 或其他 pattern flags
- 進 XT-11。

**Art**：BG-XT-HOME-STUDIO/17F；XT-SPR-CONFLICT；CG-XT-08。

---

### XT-11 — 兩天沒有敲門

**Purpose**：給第一次真正 conflict 留空氣。

**Beats**
- Line 比以前少。
- 電梯錯開。
- 男主走過她門口沒敲。
- 依先前 choice 使用不同 internal narration。

若 `xt_boundary_strikes >= 2`，她已接近退回普通鄰居；健康路徑則只是雙方消化。

**Art**：BG-APT-17F-NIGHT；可無人物。

---

## 5.5 江雨澄中後段

### JYC-09 — Too Many Eyes

**Purpose**：匿名世界與現實第一次撞在一起。

**Credibility rule**
認出她的人不是 random fan，而是和她 online 聊過一段時間、交換過創作資訊的另一位 creator。對方從聲音、sketchbook、特定談話逐步猜到。

**Beats**
1. creator event。
2. 對方：「等一下，你是不是……」
3. 對方並無惡意，察覺不舒服也會收手。
4. 雨澄 social battery 迅速歸零。
5. 原定晚餐取消，她只想回家。

**Player response**
- 替她說謊否認：仍是替她決定，`K -1`
- 很高興直接證實：`T -3, pressure+1`
- 看她 cue，讓她自己回、需要時自然帶走：`T +2, K +2`

**Art**：BG-CREATOR-EVENT、BG-MRT-CAR-NIGHT；JYC-SPR-CREATOR；CG-JYC-05、CG-JYC-06。

---

### JYC-10 — 回到螢幕後面

**Purpose**：核心 conflict，且必須雙向。

**Set-up**
幾天內她仍回 meme、打遊戲、分享東西，但拒絕所有 offline 邀請。

**男主 dilemma**
「尊重她」若等於永遠不說自己需要線下關係，也是一種 avoidance。

**Choices**
- 「妳不能一直逃」：`T -2`
- 「以後都 online 就好」：`K -2`
- 笨拙但誠實地說自己不知道怎麼靠近她：`K +2`

**Her counterattack**
她不能只是被說服。她反問男主：
- 他不舒服時是不是也去工作？
- 他是不是只是更會把 hiding 包成成熟？
- 「你只是比較不會被看出來而已。」

**State**
- `jyc_stated_offline_need`
- `jyc_named_competence_mask=true`
- 進 JYC-11。

**Art**：chat UI / BG-PC-HOME；JYC-SPR-ALIAS/CONFLICT；無必需 CG。

---

### JYC-11 — Offline

**Purpose**：江雨澄 route 的安靜 heartbreak beat。

**Presentation**
Discord 顯示她在線。男主開 chat 又關；她也沒有發來。

不需要旁白解釋太多。

若 trust 已很低，她可能直接減少 online 互動；若關係健康，則仍能看到她 online，形成「距離明明只有一個訊息」的感覺。

**Art**：UI-centric，不需要 CG。

---

## 5.6 Tension / Repair / Commitment

### TENSION — Relationship Tension Check

**Kind**：state gate，不是 player-facing menu。

計算：
- 兩邊 F/T/C/K；
- recentFocus；
- romantic signal；
- knowledge flags；
- conflict 是否發生；
- boundary/pressure patterns；
- 是否可能是 rebound；
- 是否已有 exclusivity。

輸出可用：
- XT-12 available / unavailable / cool version；
- JYC-12 available / unavailable / cool version；
- 兩個都 available → COMMIT collision；
- 只有一邊 → 可自然 late focus；
- 兩邊都不夠 → Friend/Distance 路徑提前變窄。

---

### XT-12 — 可以幫我一件事嗎？

**Purpose**：許棠主動 repair；不是「她終於承認男主是對的」。

**Beats**
1. 她先問男主會不會經過某處。
2. 幾秒後可能「算了沒事」。
3. 男主追問後，她才說有一包印刷樣本一定要拿。
4. 她本來想叫快遞，但最終選擇直接請他。
5. 這是她在練習 bounded support。

**Choices**
- 做她明確請求的事：`T +2, K +2`
- 自行再替她跟廠商談：`T -2`
- 因受傷而拒絕：`K -2`

**Repair dialogue intent**
她承認自己有時把「不要控制我」擴大成「不要需要任何人」；但不要一次說得太完整。男主也承認自己容易把 care 變成 solution。

**State**
- `xt_repair_completed=true` if successful。

**Art**：BG-PRINT-SHOP / XT-HOME；XT-SPR-REPAIR；CG-XT-09。

---

### JYC-12 — 我想試一次

**Purpose**：雨澄主動 repair；creator goal 是她早就想做的事，不是男主安排的 exposure therapy。

**Foreshadowing required**
在 JYC-05/JYC-07 之前就埋：
- 有人問過她要不要做 prints；
- 她想過小誌；
- 她一直沒答應擺攤。

**Beats**
1. 她主動回來。
2. 說自己決定去一個很小的 creator gathering。
3. 繼續使用筆名，不公開 real identity。
4. 她邀男主：「你可以來。」
5. 補充：「但不要一直站我旁邊。」

**Choice**
- 在附近，需要時才回來：`T +2, K +2`
- 全程守攤：`K -1`
- 替她招呼／代答：`T -1`

**State**
- `jyc_repair_completed=true`
- 她仍會累、仍不愛陌生人，沒有被「治好」。

**Art**：BG-CREATOR-SMALL；JYC-SPR-CREATOR-TABLE；CG-JYC-07、CG-JYC-08。

---

### COMMIT — 同一個星期六

**核心 structural branch。**

若兩邊 repair invitation 都成立，安排在同一個星期六：
- 許棠的 bounded-help 後續／補回來的小旅行邀請；
- 雨澄的小型 creator table。

兩個邀請都對 heroine arc 有真正意義，因此玩家無法用「這個活動比較好玩」簡單解題。

**Options are behaviors, not heroine buttons**
1. 對雨澄誠實、選擇許棠 → HONEST-X。
2. 對許棠誠實、選擇雨澄 → HONEST-J。
3. 坦白自己已答應另一邊／正在釐清 → BOTH-H。
4. 對兩邊都說完全有空，試圖硬排且刻意隱瞞 → BOTH-L。

這裡第一次讓「不選擇」成為男主 flaw 的正面議題。

---

### HONEST-X — 坦白選許棠

**Purpose**：late lock 的關鍵不是選許棠，而是如何對雨澄處理。

玩家不必向雨澄交代全部 dating history，但不能編造工作、家庭等理由。

**Outcomes**
- 誠實且尊重：雨澄 trust 可以保留，未必 Distance；進 XT-13。
- 已和雨澄發展很深時，她可能明確受傷，留下 future Friend/Distance memory。

---

### HONEST-J — 坦白選雨澄

HONEST-X 的鏡像，但許棠的反應符合她的人格：她不要求男主報備，但會在意他是否讓自己一直處在被模糊對待的位置。

誠實處理後進 JYC-13。

---

### BOTH-H — 兩邊都說實話

**Purpose**：成人 dating 的灰度。

玩家可以承認自己尚未 exclusivity、也確實和另一人走得近。這不自動判為海王，也不保證兩人願意繼續。

**State**
- `overlapLevel >= 1`
- `deception=false`
- heroine reactions based on T/K/knowledge。

進 OV-01。

---

### BOTH-L — 兩邊都答應並隱瞞

**Trigger meaning**
不是「同時有兩個約」本身，而是：
- 明知道兩邊都已 romantic；
- 對兩邊刻意製造「我那天只有你」的印象；
- 或明確說謊以維持兩邊。

**State**
- `deception=true`
- `overlapLevel=2`

進 SHURA-01。

---

## 5.7 Honest overlap / confrontation

### OV-01 — Overlap：時間與注意力

**Purpose**：讓 honest overlap 有真實成本，而不是免費後宮。

**Beats**
- 排時間變難；
- 訊息重疊；
- 玩家察覺自己在比較兩種相處；
- 女主各自可能減少主動，觀察男主是否會做選擇。

不需要每個 date 都新增 scene；大量使用既有場景 conditional dialogue。

**Exit**：進 OV-02。

---

### OV-02 — 三人同場：誰知道多少？

**Purpose**：知情程度成為戲劇張力。

推薦場景：咖啡店／創作者活動後續，三人短暫同場。

若玩家此前誠實：
- 尷尬但不爆炸；
- 兩位女主不互相敵視；
- 玩家必須面對「我其實一直讓所有選項保持開放」。

若 knowledge asymmetric，使用不同 subtext。

**Art**：BG-CAFE / EVENT；CG-OV-01。

**Exit**：DECIDE。

---

### SHURA-01 — 撞見

**Tone**：安靜、都市、難堪；禁止動漫式兩女爭男。

推薦：
- 男主和雨澄坐咖啡店／活動後休息；
- 許棠剛好來；
- 或反向。

如果玩家之前對許棠說「最近工作忙」，她看到 scene 後只需要：
「鄰居。」
「你們慢慢聊。」

真正的傷害來自玩家知道自己說過什麼。

**State**
- 相關 heroine `trust_damage_major=true`
- 進 SHURA-02。

**Art**：BG-CAFE-GROUND / CITY；三人立繪；CG-SHURA-01 P0。

---

### SHURA-02 — 分開談

**Purpose**：讓每位女主保持自己的問題，而不是共同「審判男主」。

**Xu conversation intent**
不是「你不能和別人約會」，而是：
> 她在意他為什麼要騙／模糊她。

**JYC conversation intent**
不是 jealousy gag，而是：
> 她先前已冒險把自己更多地交給現實關係，男主卻讓她無法判斷自己知道的是不是真實版本。

**Player response**
可：
- 承認害怕做選擇；
- 辯稱「我們又沒說 exclusive」；
- 把責任推給她們沒問清楚；
- 逃避。

只有第一種有機會進 DECIDE 後修復；其餘提高 BOTH-D / Distance 機率。

---

### DECIDE — 不選擇也是選擇

**Final pre-lock gate。**

Possible:
- 明確選擇許棠並對雨澄負責任地結束 romantic ambiguity。
- 明確選擇雨澄並對許棠同樣處理。
- 承認自己現在不適合進入任何 relationship。
- 高 deception / 低 trust 時，兩邊都不願再進入戀愛。

**Important**
不能讓玩家一句「選 A」瞬間洗掉前面欺瞞。Late route 是否能走 Good，要看 repair viability。

---

## 5.8 許棠 late lock

### XT-13 — 補回來的星期六

**Entry**
- honest Xu focus，或 DECIDE 選 Xu 且 repair viable。
- `xt_repair_completed=true` 最理想。

**Purpose**：不是補考原行程，而是展示兩人新的 decision-making。

**Beats**
- 北投／近郊。
- 下雨或小狀況使原計畫改變。
- 兩人一起決定改去哪，而非男主接管。
- 許棠第一次自然說：「下一站你決定。」

這不是 surrender，而是共享 control。

**Art**：BG-DAYTRIP-ARCADE；XT-SPR-REPAIR/DAYTRIP；CG-XT-10。

---

### XT-14 — 17樓：說清楚

**地點**：17 樓夜間，呼應 opening。

**Purpose**：男主不能再用「看妳」逃避 commitment。

**Intent choices**
- 明確想成為戀人 → ending evaluation。
- 明確珍惜但不想把關係升級 → Friend intent。
- 認為彼此應留距離 → Distance intent。

**Good beat**
許棠也必須主動談「我們現在算什麼」。兩人承認：
- 她可以接受支持而不失去自己；
- 他可以說出需要而不把它變成控制。

**Art**：BG-APT-17F-NIGHT；XT-SPR-ENDING；CG-XT-11。

---

### XT-G — Good：隔壁

**這不是故事終點，而是 relationship resolution。**

**First kiss**
17 樓，安靜、互相確認、沒有煙火。構圖呼應 COM-00：同一條走廊，opening 的距離消失。

**Unlock**
- `ending.xu.good`
- `afterstory.xu.unlocked=true`
- 解鎖 XT-AF-01 → XT-AF-03。
- 若 build profile = `full`，XT-AF-01 / 02 可包含 mature-only 延伸；`sfw` build 必須有完整、不突兀的替代流程。

**Art**：CG-XT-11 First Kiss；後日談 CG 見 After Story。

---

### XT-F — Friend：樓下？

**必要意義**
兩人 genuinely important，但此時 relationship investment / readiness / romantic intent 不一致。

可以由一方說明：
- 很喜歡現在對方在生活裡的位置；
- 不想因害怕失去而硬進戀愛。

最後仍會很自然地敲門問要不要喝咖啡。

**Unlock**：`XT-FC` Friend Coda。

**Art**：17F / cafe；可用專屬 P1 CG。

---

### XT-D — Distance：17樓

電梯到 17 樓。兩人禮貌打招呼，各自走向門。

沒有封鎖、沒有惡人。

最後意象：
> 再也不敲對方的門。

**Unlock**：`XT-DC` Distance Coda。

**Art**：BG-APT-17F-NIGHT；不必 CG。

---

## 5.9 江雨澄 late lock

### JYC-13 — 散場

**Entry**
- honest JYC focus，或 DECIDE 選 JYC 且 repair viable。
- creator table 已發生。

**Beats**
1. 活動結束，她累到幾乎不說話。
2. 搭捷運。
3. 出站本應各自回家。
4. 她主動說「還不想回去」。
5. 便利店飲料＋雨後騎樓。
6. 她談自己一直覺得 online version 比 real self 更值得喜歡。
7. 男主不能只回「妳很可愛」。核心是兩邊本來就是同一個人。

**Art**：BG-RAIN-AWNING-NIGHT；JYC-SPR-ENDING；CG-JYC-09 前置情緒版可由同組 keyframes。

---

### JYC-14 — 雨後：說清楚

**Purpose**：relationship intent。

Good path 必須讓男主清楚表示自己想要的是 offline + online 都存在的關係，而不是只當 Discord 上最親近的人。

她也需要主動：可以笨拙地留在原地、問「現在是不是……」，但不能被動等男主全做。

**Art**：BG-RAIN-AWNING-NIGHT；CG-JYC-09 First Kiss。

---

### JYC-G — Good：沒有第二個帳號

**這不是故事終點，而是 relationship resolution。**

她不公開真名、不刪匿名帳號、不突然變社牛。

改變是：
> 在男主面前不必維護兩個人格版本。

**Unlock**
- `ending.jyc.good`
- `afterstory.jyc.unlocked=true`
- 解鎖 JYC-AF-01 → JYC-AF-03。
- `full` profile 可在已明確建立關係、雙方成年且互相同意的前提下加入 mature-only intimacy extension；`sfw` 保留完整 romance / fade-to-black / morning-after continuity。

**Art**：CG-JYC-09 First Kiss；後日談 CG 見 After Story。

---

### JYC-F — Friend：先給你看

Friend ending 的核心可包含她的 readiness：
> 她不確定此刻答應戀愛是不是因為怕失去男主。

玩家若尊重「那就不要現在答應」，形成很完整的 Friend ending。

最後仍會傳新作品：
> 「先給你看。」

**Unlock**：`JYC-FC` Friend Coda。

**Art**：UI + optional quiet CG。

---

### JYC-D — Distance：最後上線

訊息逐漸變慢；匿名帳號某天換 handle。

男主偶爾看到熟悉畫風，但再也不能確定是不是她。

**Unlock**：`JYC-DC` Distance Coda。

**Art**：UI-centric；不需人物 CG。

---

### BOTH-D — 雙 Distance：沒有誰輸

**Trigger**
- deception 嚴重；
- SHURA-02 仍不承擔；
- 或 DECIDE 選擇維持模糊而兩邊都退出。

不是「兩個女人一起懲罰玩家」。

結尾應落在男主自己的 arc：
> 他成功保留了所有 option，最後也沒有真正選擇任何人。

之後 17 樓仍會遇到許棠；網路上也仍可能看到雨澄的公開作品，但兩段私人連結都關閉。

**Unlock**：`BOTH-DC` 雙 Distance Coda。

**Art**：17F empty / phone UI；不需要特殊 CG。

---

# 6. Post-ending Relationship Reward / Coda

## 6.1 Product principle

**Ending 是 relationship state resolution，不是玩家內容獎勵的終點。**

Prototype 的 post-ending 設計分三層：

1. **Good**：解鎖 3 個 After Story episodes，讓玩家真正看到「交往以後」；包含更高密度的親密、日常與 fan-service。
2. **Friend**：解鎖 1 個 coda，證明友情不是失敗版 Good。
3. **Distance / BOTH-D**：解鎖 1 個短 coda，提供時間推進與 closure，而不是突然黑屏 END。

After Story 應進入 W4 Memories / CG Gallery，成為通關後繼續收集與 replay 的內容。

## 6.2 Mature / NSFW content policy for this project

所有 romance participants 都是明確成年人。

若未來使用 `full` build profile加入成人向內容：

- 只在 **Good Ending 後、relationship 已明確成立** 的 After Story 中出現；
- 必須是雙方清醒、自願、可隨時停止的親密關係；
- 不使用酒醉、脅迫、權力交換或「不確定是否同意」作刺激點；
- 主線 relationship quality 不應要求玩家觀看 mature content 才能理解；
- `sfw` build 以吻、擁抱、留宿、fade-to-black、次日清晨／aftercare continuity 取代；
- `full` build 可插入更成人向的 extended intimacy nodes / CG slot，但需由 compiler 在 `sfw` 真正 prune，而不是 runtime 隱藏；
- 本 general narrative spec 先定義情緒、consent、進出狀態與 CG slot；具體成人描寫若製作，另在 profile-gated mature content source 中 author，不把露骨內容散落在共通 script。

這讓公開／朋友測試版與完整版可以共享同一 relationship arc。

---

## 6.3 Xu Good After Story

### XT-AF-01 — 今晚不用回隔壁

**時間**：Good Ending 後約 1–2 週。  
**地點**：許棠家／男主家，晚間。  
**Purpose**：把 First Kiss 的「承諾」轉成真正的 couple intimacy；fan-service reward，但仍呼應 autonomy / consent。

**Set-up**
兩人本來只是一起吃飯、工作或看電影。時間晚了。過去他們住隔壁，所以「要不要回自己家」一直是很容易逃走的 option。

**Beats**
1. 一個非常普通的晚上。
2. 兩人已經會自然靠近、碰肩、拿對方東西。
3. 到該散場的時間，其中一人半玩笑地指出：其實只隔一道牆。
4. 許棠第一次不是因 deadline / 方便，而是明確因為「想你留下」表達需求。
5. 男主不能把她的邀請當成理所當然；要有簡短 mutual check-in。
6. 親密升級：更長的吻、擁抱、停頓、笑場。
7. `sfw`：在雙方意圖清楚後 fade-to-black，直接銜接 XT-AF-02。
8. `full`：可插入 mature-only intimacy extension，再銜接同一 morning-after state。

**State**
- `xt_first_stayover=true`
- `relationship.xu.physicalIntimacy += 1`
- 無 ending risk；這是 reward episode，不再考玩家「正確答案」。

**Art**
- 晚間居家 couple CG。
- `full` profile 可有獨立 mature-only CG slot。
- 重點是 reciprocity、眼神與距離，不把角色變成單純 pin-up。

---

### XT-AF-02 — 星期日早晨

**Purpose**：Good Ending 後最直接的 domestic fan-service。

**Beats**
1. 清晨自然光。
2. 許棠不是精心打扮狀態：散髮／鬆亂低馬尾、近素顏。
3. 可以穿自己的寬鬆居家服，或合理地借男主較大的襯衫／T-shirt 搭完整短褲；不要只剩「性感服裝展示」。
4. 她第一次完全不把玩家當客人：自己去找咖啡、吐槽他的冰箱／咖啡豆、搶浴室順序等。
5. 可有擁抱、從背後靠一下、短吻等輕 fan-service。
6. 兩人仍各自有今天要做的事；關係沒有把生活吞掉。

**State**
- `xt_morning_routine_seen=true`

**Art**
- Morning reward CG，應是 Gallery 高價值收藏。
- 可有一張較曖昧的床邊／沙發晨光構圖，但不要求露骨。

---

### XT-AF-03 — 一個月後：留位置

**Purpose**：真正的後日談，回答「兩個很獨立的人交往後怎麼活」。

**Beats**
- 兩家仍然分開。
- 男主家開始固定有她愛喝的東西／充電線。
- 她家也自然出現他的杯子／常用物件。
- 不用交鑰匙、搬家作為幸福 shortcut。
- 她有工作，他也有 incident；這次兩人會直接說今天需要陪伴、安靜或各忙各的。
- 最後用非常日常的下一個邀約收尾。

**Art**：一張真正「已經在交往」的生活 CG，而不是再一次 confession pose。

---

## 6.4 Jiang Good After Story

### JYC-AF-01 — 最後一班車之後

**時間**：Good Ending 後約 1–2 週。  
**地點**：男主家，夜間 gaming / movie。  
**Purpose**：把她的 online/offline integration 推到身體距離與留宿選擇。

**Set-up**
兩人玩到很晚。不能用「不小心錯過末班車所以被迫留下」作唯一理由；她可以先看到時間，停一下後主動決定不急著走。

**Beats**
1. 已經是戀人，所以 gaming 時距離比 JYC-06 自然很多。
2. 她仍會因 physical escalation 緊張，但不是不願意。
3. 她可能用玩笑／吐槽掩飾：「你現在是不是突然很安靜。」
4. 雙方用很簡單的語句確認彼此想法，不變成 consent lecture。
5. 更長的吻、靠在一起、第一次留宿。
6. `sfw`：fade-to-black / 關燈 / next morning。
7. `full`：可插入 mature-only extension；仍必須保持她有主動性，而不是被成熟男主帶著走。

**State**
- `jyc_first_stayover=true`
- `relationship.jyc.physicalIntimacy += 1`

**Art**
- 夜間 gaming → couple closeness reward CG。
- mature-only slot 另行 profile gate。

---

### JYC-AF-02 — 不用切換帳號

**Purpose**：fan-service + character payoff。

**Beats**
1. 次日早晨／週末白天。
2. 她頭髮亂、穿借來的寬鬆 hoodie / T-shirt + 完整居家短褲或自己的衣物。
3. 她在現實裡開始出現和 Discord 同樣的嘴賤／meme energy。
4. 她可以搶 controller、偷看男主螢幕、躺在沙發另一端傳 meme 給「明明就在旁邊」的男主。
5. 這是最直接的「online/offline 不再切換人格」reward。

**Art**：高價值 cozy/fan-service CG；應與早期 JYC-06 Gaming Night 作 before/after 對照。

---

### JYC-AF-03 — 公開前先給你看

**Purpose**：真正的關係後日談。

**Beats**
- 她完成新作品。
- 不再把男主當秘密保管箱，而是自然分享。
- 她仍用筆名、仍有 privacy。
- 她準備公開前讓男主先看，只因想和戀人分享，不是求批准。
- 男主也在旁做自己的工作。
- 結尾可以是她在線上傳了一個 meme 給坐在旁邊的男主，兩人一起笑。

**Art**：CG-JYC-AF-03 / 可和原 CG-JYC-10 概念整合，避免重複。

---

## 6.5 Friend codas

### XT-FC — 樓下，還是隔壁

數週後。兩人仍會敲門、一起喝咖啡、互相吐槽工作。

不刻意製造「其實下一秒就能變 Good」來否定 Friend ending；可以保留一點未來開放性，但此刻兩人都對這個關係位置感到自在。

**Reward**：warm friendship CG optional。

### JYC-FC — 先給你看：幾週後

她邀男主去 creator event，這次用「朋友」身份很自然。她把新作品先傳給他，但沒有 romantic obligation。

**Reward**：quiet creator/cafe CG optional。

---

## 6.6 Distance codas

### XT-DC — 又一次電梯

一兩個月後。同一部電梯再短暫停頓一下。

兩人都笑了一下，因為記得第一次。

電梯恢復，17 樓到了，各自回家。

**Purpose**：讓 Distance 是完整 closure，不是 punishment screen。

### JYC-DC — 新 handle

幾週／幾個月後，男主在網路上看到一張很熟悉的畫。

帳號已換名字，他不確定是不是她，也不再去確認。

### BOTH-DC — 春天的17樓

雙 Distance 後時間跳轉。男主的生活重新非常有秩序；手機安靜，走廊也安靜。

這不是「報應」，而是把他的核心 flaw 完成成一個可理解的失去：他曾經把不做選擇當成最安全的選擇。

---

# 7. Memory Event guidance

W4 玩家看到的是 Memory Event，不是上述所有 authoring gates。

建議：
- COM-03X / COM-03J 可壓進 COM-03M；
- OPEN-A / OPEN-B / BRAID-C / TENSION 不顯示工程名稱；
- RE-X / RE-J 只有發生有情緒價值的版本才成 Memory；
- SH-01 / SH-02 是 shared memories；
- COMMIT 顯示為自然事件標題，例如「同一個星期六」；
- HONEST-X/J、BOTH-H/L 多數不必各自成卡，可由結果 scene 表示；
- 修羅場未解鎖前不得提前顯示名稱或數量；
- relationship resolution endings 各自獨立 unlock；
- Good After Story 建議成為該 heroine 的獨立 post-ending Memory Section；
- Friend / Distance coda 各自一張後續 Memory；
- mature-only Memory / CG 在 `sfw` build 必須 compile-time 移除，不能留下可推測數量的 locked placeholder。

Progress rank 使用 phase band，而不是 raw node count。兩女主同階段事件可以共享 rank band。

---

# 7. Script production order

建議後續逐 scene 打磨順序：

1. COM-00 → COM-03M：先鎖定整體語氣。
2. XT-04 → XT-08 與 JYC-05 → JYC-08：確保玩家真的先喜歡兩人。
3. SH-01 / SH-02：確認交織感自然。
4. XT-09 → XT-12、JYC-09 → JYC-12：打磨 conflict / repair，優先去除 therapy-speak。
5. COMMIT / overlap / shura：先做 decision logic，再寫台詞。
6. XT/JYC late lock + relationship resolution endings。
7. Good After Story / Friend / Distance codas。
8. 最後回頭補 reactive variants、re-approach、knowledge subtext。

---

# 8. Definition of narrative-ready

一個 scene 在轉成 production dialogue 前，至少要確認：

- Entry state 明確；
- 為什麼今天會發生這件事合理；
- 角色各自想要什麼；
- 戲劇問題不是單靠誤會；
- 至少一個 relationship 狀態有變化；
- choice 不只是 obvious good/bad；
- 若有失敗，失敗是 pattern 或有 repair 空間；
- exit / next dependencies 可表達；
- 所需背景、立繪、CG 已在 art spec 有對應 ID；
- 可對應一個 W4 Memory Event 或明確標註「不需要獨立 Memory」。

當上述條件成立後，才進入 final dialogue authoring。
