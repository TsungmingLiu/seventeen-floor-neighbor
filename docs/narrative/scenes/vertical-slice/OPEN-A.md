# OPEN-A — 第一個空檔

## Current authorized weekend/weekday design — ND-ARC-001

- Lifecycle: **CANONICAL** task-local Narrative Design amendment, 2026-10-04. Source ref: `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9`. Human 授權本輪方向與必要改寫；本 pass 沒有新 final prose、QA、runtime 或 CG acceptance。
- Owning design: `docs/narrative/JYC_WEEKEND_WEEKDAY_REVISION.md`；current contract: `content/production/narrative/opening-ch1/OPEN-A.json`。此 design section 與 current JSON 取代下方 baseline 的衝突時序／gate；下方舊 Locked prose 與其歷史 binding 完整保留作局部改寫或相容性參考，不是本輪新 Script Lock。
- 保留有界線邀約入口，封閉街頭江線：不需 dialogue rewrite。現有第一 window、兩 slot 總量、pending 與 solo/rest/wait prose 保留；J eligible 必須先 !jyc_permanently_excluded 再 contact/知識/前事/closure/harm。street 完全略過 Jiang options、通知、later discovery 及 RE；未排除者仍按既有下一合法 slot、唯一 reopening window 和 familiarity gates，不免費升級。
- Stable ID plan：無新 IDs；OPEN-A-* 全保留。
- 永久排除：本輪 `com01b_weekday_street_walk` 才寫 `jyc_permanently_excluded=true`。此 flag 先於 contact/history，永不由 merge、reload、scheduler、public shared scene 或 ordinary invite 清除。Memory replay 限自己的 snapshot，不向 live 主線寫入；改走前一分岔屬另一 playthrough，不是本輪 reopening。
- Semantic visual impact 與四個必要 dialogue units 見 owning design；現有 accepted image bytes、QA/Human 歷史都保留。獨立下游才裁決哪些畫面可重用。

## Preserved pre-revision baseline


> Lifecycle: **CANONICAL** task-local scene artifact
>
> Status: **LOCKED — scene dialogue authored; independent Narrative QA pending**
>
> Production stage: **Script Lock**
>
> Pass: `content_writer / scene_dialogue`。本幕僅第一 window 入口；尚無 runtime integration、CG acceptance 或 Human story-preview acceptance。

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/OPEN-A.json`
- 原 approved JSON 不改。關係維持普通熟人邊界；knowledge 僅來自本次實際訊息。下列 prose、action choices 與 semantic boundaries 是本 pass 的完整交付，不將上游 design pass 的完成狀態當作本 pass 的 QA。

## Canonical inputs

- `content/production/narrative/opening-ch1/OPEN-A.json`
- `content/production/narrative/opening-ch1/COM-03M.json`
- `content/production/narrative/opening-ch1/COM-03X.json`
- `content/production/narrative/opening-ch1/COM-03J.json`
- `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_COMMON.md` — bounded L230–243 only。
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` — bounded L296–328、L400–415 only。
- `docs/narrative/NARRATIVE_INTERACTION_AND_STORY_MAP_SPEC.md` — bounded L154–238 only。
- `docs/art/characters/xu-tang.md` — bounded L11–60 only。
- `docs/art/characters/jiang-yucheng.md` — bounded L11–62 only。

## Dialogue／choice／state contract

- Entry requires COM-03M completed、`open_dating_unlocked=true`、至少一個真實 contact。首次進入 `OPEN-A-ENTRY` 才一次性建立 `open_a_entered=true`、`open_a_entry_outcome=unresolved`、`open_a_window1_consumed=false`；恢復中途存檔不重設。
- 許棠段落／選項限 `contact_xu=true` 且既有 prerequisites、harm/closure 容許邀約；雨澄同理限 `contact_jyc=true` 且 eligible。未見與見過未 contact 雨澄均完全略過其訊息／選項。已有 contact 但不 eligible 的互動入口也略過，不修復或重開。下文以「X eligible／J eligible」簡稱這些 read-only checks，不新增 eligibility flag。
- 一次只進一個邀約 thread。選了 J 或生活 action，不向 X 發送任何自動回覆，也不在該走法生成新的 X 同行邀請；反之亦然。原 COM-03M 活動分享不是需回覆的已答應安排。
- 許棠 incoming／player-initiated 是同一 action 的兩個互斥 local entry cuts：本幕預設 incoming cut；若編譯採 player-initiated cut，替換 X action 文案與 `OPEN-A-X-START`，不疊加兩次邀請、不增加選人或發起者選單、不以 focus／分數選版本。兩個 cut 均完整寫於下文，合流 `OPEN-A-X-REPLY`，只用同一原下午。這是 authoring variant，無新存檔 state／calendar authority。
- 所有選項皆 action choice；送訊息只發生在所選分支。邀約開始後不返回 entry 試另一人。未成行合流 `OPEN-A-LIFE`，生活 action 選一次後到其獨立 boundary。
- `jyc_com03j_reply_style` 本稿不需額外 callback：所有可信 style 與未知 history 均採已收到限定展資訊的中性接話，不補前次題目、回覆或作品身份。
- contact、romanticSignal、relationship scores、focusHistory/recentFocus、harm/closure、overlap/exclusivity/deception、RE／cooling 及跨人物 knowledge 均保持 entry 值。沒有 major investment、date completion、未來預約或第二 window 開啟。
- 本文所有段落 ID 為 text-preserving compilation 的 semantic IDs，尚非已建立的 runtime nodes。段內「旁白」與訊息為完整玩家可見文字；導向、條件、mutation 與 boundary 說明不顯示為故事 narration。

## 完整 scene

### OPEN-A-ENTRY — 實際入口／共通

**旁白**

吃完午餐，我把碗放進水槽。桌上還攤著工作用的筆記本電腦，不過下午沒有新的事排進來。

椅子往後一挪，又碰到了箱子。

搬來時留下的幾箱東西，現在已經很自然地變成了椅子後面、床邊和門口的一部分。我把擋住椅子的那箱推開，總算能坐下來。

下午可以出去走走。也可以趁今天，把房間收一收。

**條件段落 — X eligible 才顯示**

**旁白**

Line 裡，許棠提過的中山設計書話題還在。我有點想翻翻看，找本能慢慢看的書。

**條件段落 — J eligible 才顯示**

**旁白**

雨澄傳來的限定展資訊也還留在 Discord。我又看了一眼，裡面的作品，放大到現場看應該會不太一樣。

**旁白／共通**

我拿起手機，想了一下今天要怎麼過。

**Action choice `OPEN-A-ENTRY-ACTION`**

| Option ID | 玩家可見文案 | 顯示條件 | 導向 |
| --- | --- | --- | --- |
| `OPEN-A-ACT-X` | 看看許棠今天去中山看書的安排。 | X eligible；預設 incoming cut | `OPEN-A-X-START-INCOMING` |
| `OPEN-A-ACT-X`（替換文案） | 問許棠下午要不要一起去中山看設計書。 | X eligible；僅 player-initiated cut | `OPEN-A-X-START-PLAYER` |
| `OPEN-A-ACT-J` | 問雨澄下午要不要一起去看她傳的限定展。 | J eligible | `OPEN-A-J-START` |
| `OPEN-A-ACT-LIFE` | 今天先安排自己的時間。 | always | `OPEN-A-LIFE-DIRECT` |

> X 兩列是同一 option 的互斥編譯版本，不同時顯示。單 contact 只有該人具體 action＋生活；雙 contact 有 X、J、生活；無 eligible invite 時直接進 `OPEN-A-LIFE-DIRECT`，不顯示單選按鈕。

### OPEN-A-X-START-INCOMING — 許棠主動／Line

**旁白**

我打開對話，正好看見她新傳的一句。

**Line-許棠／Line**

我下午要去中山看設計書。你有空的話，要不要一起？

**旁白**

我看了一眼還擋在床邊的箱子。出門回來再收，好像也來得及。

→ `OPEN-A-X-REPLY`

### OPEN-A-X-START-PLAYER — 男主主動／Line

**我／Line**

妳之前說中山那邊的設計書，我想去看看。今天下午有空，要一起去嗎？

**旁白**

訊息送出去後，我先把水槽裡的碗洗了。擦乾手回來，手機亮著。

**Line-許棠／Line**

可以啊，我本來下午就要去。

**Line-許棠／Line**

一起去好了。

→ `OPEN-A-X-REPLY`

### OPEN-A-X-REPLY — 同一原下午提議

**Action choice `OPEN-A-X-TIME`**

| Option ID | 玩家可見文案 | 導向 |
| --- | --- | --- |
| `OPEN-A-X-ACCEPT` | 好，下午一起去。 | `OPEN-A-X-CONFIRM` |
| `OPEN-A-X-EARLIER` | 問她能不能提早一點。 | `OPEN-A-X-COUNTER` |
| `OPEN-A-X-DECLINE` | 今天先不約，我想留在家整理。 | `OPEN-A-X-CLOSE` |

### OPEN-A-X-COUNTER — 詢問／拒絕提早

**我／Line**

可以提早一點嗎？我想早點回來收一下箱子。

**Line-許棠／Line**

提早不太行，我前面還有自己的事。

**Line-許棠／Line**

下午原來那個時間可以。你看看方不方便。

**旁白**

我望向那幾箱東西。真要整理，現在也可以先拆一箱。

**Action choice `OPEN-A-X-COUNTER-REPLY`**

| Option ID | 玩家可見文案 | 導向 |
| --- | --- | --- |
| `OPEN-A-X-KEEP-TIME` | 那就原來下午的時間，我先整理一下。 | `OPEN-A-X-CONFIRM-COUNTER` |
| `OPEN-A-X-NO-PLAN` | 今天先不約了，我留在家。 | `OPEN-A-X-CLOSE-COUNTER` |

### OPEN-A-X-CONFIRM — 接原時段

**我／Line**

好，下午一起去中山看書。

**Line-許棠／Line**

好，那就下午。

**旁白**

我把手機放到桌角，伸手把箱子往外挪了一點。等一下要出門，至少先把路空出來。

→ `OPEN-A-ENTRY-PENDING-X`。到此停；不演出門、碰面或 XT-04。

### OPEN-A-X-CONFIRM-COUNTER — 接回原時段

**我／Line**

那就原來下午的時間，一起去中山看書。我先整理一下。

**Line-許棠／Line**

嗯，好。

**Line-許棠／Line**

那下午見。

**旁白**

我放下手機，蹲到離門最近的箱子旁邊。膠帶貼得很牢，我用指甲摳了兩下，還是起身去找剪刀。

→ `OPEN-A-ENTRY-PENDING-X`。這只是出門前局部動作，不是 solo completion；不演 XT-04。

### OPEN-A-X-CLOSE — 婉拒／當地 acknowledgement

**我／Line**

今天先不約好了。我想留在家，把剩下的東西整理一下。

**Line-許棠／Line**

好啊，那你忙。

**Line-許棠／Line**

我自己去逛逛。

→ `OPEN-A-LIFE-AFTER-X`

### OPEN-A-X-CLOSE-COUNTER — 時間不合／當地 acknowledgement

**我／Line**

那今天先不約了，我留在家。妳照原來的時間去就好。

**Line-許棠／Line**

嗯，好。

**Line-許棠／Line**

那我下午自己去。

→ `OPEN-A-LIFE-AFTER-X`

### OPEN-A-LIFE-AFTER-X — 合流橋接

**旁白**

我回了個「好」，把手機放下。房間很安靜，窗外偶爾有車開過。

不用出門了，下午便多出一段完整的時間。

→ `OPEN-A-LIFE`

### OPEN-A-J-START — 實際詢問／Discord

**我／Discord**

妳傳的限定展，我今天想去看看。下午早一點有空，要不要一起？

**旁白**

我把手機擱在電腦旁，收起午餐墊。過了一會兒，訊息才跳出來。

**雨澄／Discord**

早一點不行欸，我手上還有一張要畫完。

**雨澄／Discord**

下午晚一點可以。你可以那個時間再去嗎？

**旁白**

我還沒準備出門。晚一點去，倒是能先做些別的事。

**Action choice `OPEN-A-J-TIME`**

| Option ID | 玩家可見文案 | 導向 |
| --- | --- | --- |
| `OPEN-A-J-ACCEPT` | 可以，那就下午晚一點一起去。 | `OPEN-A-J-CONFIRM` |
| `OPEN-A-J-DECLINE` | 今天晚一點不太方便，這次先不約。 | `OPEN-A-J-CLOSE` |

### OPEN-A-J-CONFIRM — 接替代時間

**我／Discord**

可以，那就下午晚一點一起去看展。我先做點自己的事。

**雨澄／Discord**

好，那就晚一點。

**雨澄／Discord**

我先把這張畫完。

**我／Discord**

嗯，等一下見。

**旁白**

我把對話關掉。離出門還有一段時間，桌上的東西可以先收一收。

→ `OPEN-A-ENTRY-PENDING-J`。到此停；不演出門、碰面或 JYC-05。

### OPEN-A-J-CLOSE — 拒絕替代時間／當地 acknowledgement

**我／Discord**

今天晚一點不太方便，這次先不約好了。

**雨澄／Discord**

喔，好。

**雨澄／Discord**

那我先繼續畫。

**我／Discord**

好。

**旁白**

我關掉對話，站起來伸了伸腰。想看的展還在那張資訊裡，今天的下午則空了下來。

→ `OPEN-A-LIFE`

### OPEN-A-LIFE-DIRECT — 不邀／生活橋接

**旁白**

我先放下手機。今天有點想待在家，不急著出去。

箱子、電腦，還有看到一半的作品，都還在眼前。

→ `OPEN-A-LIFE`

### OPEN-A-LIFE — 共通生活 action

**旁白**

我拉開窗簾，讓房間亮一點。要留在家，總得讓自己待得舒服些。

**Action choice `OPEN-A-LIFE-ACTION`**

| Option ID | 玩家可見文案 | 導向 |
| --- | --- | --- |
| `OPEN-A-LIFE-SOLO` | 把剩下的搬家箱整理好。 | `OPEN-A-SOLO` |
| `OPEN-A-LIFE-REST` | 做完手邊工作，今晚早點睡。 | `OPEN-A-REST` |
| `OPEN-A-LIFE-WAIT` | 看完收到的作品，再把手機放下。 | `OPEN-A-WAIT` |

### OPEN-A-SOLO — 整理完成

**旁白**

我把最上面那箱拖到空地上，沿著膠帶剪開。

明明寫著「書」，裡面卻先翻出兩條充電線。再往下才是書，還有搬家時拿來塞空隙的毛巾。

我索性把剩下幾箱也打開。書放上架，線捲好，毛巾送進浴室。原本打算用來放東西的矮桌，總算露出了整張桌面。

弄到後來，窗邊的光已經移到地板另一側。我把空箱壓扁，抱到門旁，再回來擦掉桌上的灰。

晚飯放上去的時候，不用再挪走什麼了。

我拉開椅子坐下。腳前少了那一箱，連坐著都寬了一點。

吃完飯，我洗了碗，把最後一小袋東西收進抽屜。房間沒有一下變得多漂亮，不過想用的地方，現在都能用了。

→ `OPEN-A-ENTRY-SOLO`。第一 window 生活完成；停在第二 window 前。

### OPEN-A-REST — 工作收束／早睡

**旁白**

我坐回桌前，把還沒收尾的工作打開。事情不多，只是先前一直留著，覺得晚一點再做也行。

我照著筆記逐項處理，改完最後一處，再從頭看了一遍。存好檔案後，桌上的那張待辦紙總算能翻過去了。

天色暗下來，我去弄了晚飯。吃到一半，手很習慣地伸向手機，又停了下來，先把飯吃完。

洗完澡，我把電腦關好，電線收到桌邊。箱子今天只挪了位置，明天還得繼續收。

躺下時比平常早了一些。我本來想再看點東西，眼睛卻已經有點睜不開。

我把床頭燈關掉，拉好被子。屋裡安靜下來，這次不用再起來開電腦了。

→ `OPEN-A-ENTRY-REST`。第一 window 生活完成；停在第二 window 前。

### OPEN-A-WAIT — 看完／放下手機

**旁白**

我把已經收到、先前還沒看完的作品打開，靠著椅背慢慢看。

有一段看得太快，我往回拉了一點。重看才發現，前面的畫面已經放了後來會用到的細節。

看完後，我還停在最後的畫面上，隔了一會兒才退出。原本想順手翻翻訊息，手指在螢幕上停了停，最後只是把手機放到桌上。

下午剩下的時間，我把桌面清出來，去洗了一次衣服。等衣服晾好，外面已經開始暗了。

我熱好晚飯，端回桌前。手機還在原來的地方。

先吃飯吧。看完的那一段還留在腦子裡，我吃了兩口，才發現自己又想回去看那個細節。

→ `OPEN-A-ENTRY-WAIT`。第一 window 生活完成；停在第二 window 前。作品只取當次實際收件，不新增名稱、私帳或未收到內容；本支無保證新訊息。

## Outcome boundaries／保存恢復

| Exact boundary ID | `open_a_entry_outcome` | `open_a_window1_consumed` | 固定重建與停止位置 |
| --- | --- | --- | --- |
| `OPEN-A-ENTRY-PENDING-X` | `pending_xu` | false | 中山設計書、第一 window 原下午，雙方已確認；停在未 authored XT-04 前。 |
| `OPEN-A-ENTRY-PENDING-J` | `pending_jyc` | false | 已收到限定展、第一 window 較晚下午，雙方已確認；停在未 authored JYC-05 前。 |
| `OPEN-A-ENTRY-SOLO` | `solo` | true | 剩下搬家箱整理片段完成；第二 window 未開。 |
| `OPEN-A-ENTRY-REST` | `rest` | true | 手邊工作收束、早睡完成；第二 window 未開。 |
| `OPEN-A-ENTRY-WAIT` | `wait` | true | 已收到作品看完、放下手機轉回晚間生活完成；第二 window 未開。 |

- 全 boundary 保留 `open_a_entered=true`。outcome 在 exact boundary 一次性 commit；三生活支在 completion 同時一次性消耗第一 window。pending 不消耗；只有將來真正 XT-04／JYC-05 completion 才可消耗一次。
- 中途 save 保留當下 semantic node／choice position及已發送訊息；load 不重送、不重跑 entry、不重置 outcome、不再次重演生活／消耗。boundary resume 直接恢復該 exact endpoint。Memory replay 用 replay-local snapshot，無主線旗標寫入。
- 固定活動與時段由 outcome 重建，沒有自由日期、deadline timer、future reservation 或 scheduler 欄位。當地回覆在開始出門／安排自己下午之前完成；本次沒有答應後不回或失約 action。
- 這五個 endpoint 都是 distinct reachable review boundaries；不要壓成抹掉結果的共用展示終點。待編譯的 preview boundary 可顯示「本段預覽到此」之類工具介面，不能把它寫作已完成約會或 OPEN-A completion。
- 不放行第二 window、OPEN-B、第三 slot、anchor continuation 或新 discovery；`open_a_entered` 只有歷史 entry 語意。

## Semantic visual beats／author checks

- 共通：午餐後的桌面、電腦與擋住椅子的搬家箱，男主看到自己的下午；聯絡介面只出現真實 eligible contact。
- X：既有設計書話題接實際同行提議，提早被拒後能保留原下午或收回；兩種發起版本合流同一確認。
- J：邀請送出、短暫做自己的事、收到她先完成作品的替代時間，玩家再決定；不以按鈕代替同意。
- pending：手機放下、出門前小動作即停。solo：箱子變平、桌面與住處能用。rest：工作存好、電腦收起、關燈。wait：看完作品、放下手機、晾衣與晚飯。僅 semantic action／情緒節奏，無 camera、CG 或 image prompt。
- Writer self-check：exact contract binding、contact/eligibility variants、兩種 X 起點與時段合流、J counteroffer/decline、生活重接與三完成支、五個 boundary 的 pending/consumed 差異均已逐項檢查。整幕作連續互動讀過，完成 exactly one bounded naturalization sweep；沒有逐句反覆生成。
- 本 pass 鎖定的是完整 scene wording／mapping。writer checks 不等於 independent Narrative QA；下一步由 fresh `content_qa / narrative_review` 檢查，再由下游整合與 Human story-preview review 驗證。未宣稱全 OPEN-A 可玩或已獲 Human acceptance。
