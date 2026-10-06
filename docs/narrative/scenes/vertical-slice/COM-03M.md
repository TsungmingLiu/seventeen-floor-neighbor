# COM-03M — 一週訊息 montage → OPEN-A

## Current authorized weekend/weekday design — ND-ARC-001

- Lifecycle: **CANONICAL** task-local Narrative Design amendment, 2026-10-04. Source ref: `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9`. Human 授權本輪方向與必要改寫；本 pass 沒有新 final prose、QA、runtime 或 CG acceptance。
- Owning design: `docs/narrative/JYC_WEEKEND_WEEKDAY_REVISION.md`；current contract: `content/production/narrative/opening-ch1/COM-03M.json`。此 design section 與 current JSON 取代下方 baseline 的衝突時序／gate；下方舊 Locked prose 與其歷史 binding 完整保留作局部改寫或相容性參考，不是本輪新 Script Lock。
- 保留訊息，永久排除先於 contact：不需 dialogue rewrite。所有共同／Xu prose、單 contact 節奏與雙 contact body 保留。Jiang 段落與雙通知條件先 !jyc_permanently_excluded 再 actual contact；street 只能 Xu-only／自身生活，不偽造姓名或共通話題；不因進入 montage 重設 exclusion。
- Stable ID plan：無新 IDs；COM03M-* 全保留。
- 永久排除：本輪 `com01b_weekday_street_walk` 才寫 `jyc_permanently_excluded=true`。此 flag 先於 contact/history，永不由 merge、reload、scheduler、public shared scene 或 ordinary invite 清除。Memory replay 限自己的 snapshot，不向 live 主線寫入；改走前一分岔屬另一 playthrough，不是本輪 reopening。
- Semantic visual impact 與四個必要 dialogue units 見 owning design；現有 accepted image bytes、QA/Human 歷史都保留。獨立下游才裁決哪些畫面可重用。

## Preserved pre-revision baseline


> Lifecycle: **CANONICAL**
>
> Status: **LOCKED — scene-dialogue authored；獨立 Narrative QA 待審**。LOCKED 表示本幕完整文字與分支提交下游，不代表 Narrative QA、CG 或 Human preview acceptance。
>
> Production stage: Scene / Dialogue — Script Lock
>
> Task: CW-COM03M-001 / content_writer / scene_dialogue；source ref: `571cb23b50e1910510f6705f147a1cabf55aa09c`。

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-03M.json` （SHA-256 `1ea9cd0f3a91a47a6de566b5308a7063dda313af1362cc031571f03b963f811d`）。本幕沿用已批准的 entry／exit、intent、payoff 與 must_not；不修改 contract。COM-03X 的 Line／普通鄰居前事與 COM-03J 的 Discord／推薦前事只對實際 contact 方成立。

## Canonical inputs

- `content/production/narrative/opening-ch1/COM-03M.json`
- `content/production/narrative/opening-ch1/COM-03X.json`
- `content/production/narrative/opening-ch1/COM-03J.json`
- `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_COMMON.md`（限 packet 的 L13–L21、L184–L243）
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`（限 packet 的 L195–L328、L400–L415）
- `docs/narrative/NARRATIVE_INTERACTION_AND_STORY_MAP_SPEC.md`（限 packet 的 L80–L238、L304–L375）
- `docs/art/characters/xu-tang.md`（限 packet 的 L11–L60）
- `docs/art/characters/jiang-yucheng.md`（限 packet 的 L11–L62）

## 執行與文字邊界

以下「旁白」是第一人稱玩家可見文字；「我」「許棠」「江雨澄」是訊息 sender。括號內的傳送內容是玩家可見訊息媒體說明，須保留其文字。段落 ID、條件、箭頭與其他 metadata 不顯示。

入口必須 `contact_xu || contact_jyc`。兩者 false：不執行本幕，不新增 contact。Xu-only（包括 Jiang never_met、known-but-not-contacted）執行所有共同段及 X 段，完全略過 J 段與雙通知；Jiang-only 完全略過 X 段。Both 執行兩方段落與唯一 action choice。Jiang never_met 與 known-but-not-contacted 的原狀態保持各自原值，不能在合流時互換。

段落順序為 S01 → X01（若有）→ J01（若有）→ S02 → X02（若有）→ J02（若有）→ S03 → 一個忙碌分支 → S04 → X04（若有）→ J04（若有）→ S05 → X05（若有）→ J05（若有）→ S06 → EXIT。下列條件段是完整 authored 文字，不能摘要、合併訊息、只留下通知或改成玩家回憶過的共同外出。

## 完整 playable prose

### COM03M-S01｜共同：頭一兩天

旁白：早上開工前，我把最後一箱雜物推到牆邊，替椅子空出能往後退的位置。

旁白：桌面總算放得下水杯。插座還藏在箱子後面，先將就一下。

旁白：開完上午的會，我去廚房熱昨晚剩下的飯，等微波爐響。

### COM03M-X01｜contact_xu：Line

Line-許棠：樓下公告換地方了，在電梯旁邊。剛剛差點沒看到。

我：喔，我還在看原來那塊。謝謝。

Line-許棠：我也是走過去才發現。上面有收件的說明，你有空再看。

旁白：飯熱好了。我先端回桌上，吃完才下樓看公告。

我：看到了，下次包裹可以少找一圈。

Line-許棠：嗯。我先出門了。

我：好。

### COM03M-J01｜contact_jyc：Discord

J01 首訊息按可信 replay-local `jyc_com03j_reply_style` 恰選一條；未知／缺失選 neutral。選後接 J01-COMMON。四條只調整主動餘裕，沒有 topic 回填或額外效果。

- continue_content：江雨澄：我又看了一下之前傳的推薦。後面那段有個地方，你看這張。
- warm_close：江雨澄：之前那個推薦，我補一張圖。你有空再看就好。
- save_for_later：江雨澄：之前那個推薦，先把這張放這裡。之後看到這段可以對一下。
- neutral：江雨澄：之前傳的推薦，補一張截圖。這裡的背景我滿喜歡的。

#### COM03M-J01-COMMON

江雨澄：（截圖：畫面右側是一扇明亮的門，左邊的走道只露出一小段。）

旁白：我把圖放大，看了看那一小段走道。

我：我的視線一直先跑到門那邊。左邊是不是也能過去？

江雨澄：可以，所以我第一次也漏掉了。

江雨澄：它沒有完全藏住，只是右邊太亮。左邊其實還有一個很小的路標。

我：喔，看到了。剛剛以為那是牆上的污漬。

江雨澄：對，看起來很像。

旁白：下午的會議提醒跳出來。我縮小圖片，拿起耳機。

我：我要開會了，剩下的晚點看。

江雨澄：好，我也先去弄自己的事。

### COM03M-S02｜共同：又過了幾天

旁白：幾天後，箱子少了兩個。剩下那箱裝著書，底下壓了一捆找很久的延長線。

旁白：我坐在地上，把書一本一本拿出來。翻到半途有張購物小票掉下來，日期早得讓我愣了一下。

旁白：本來只想分好類。我靠著沙發看了一會兒，等腿麻了才起身。

### COM03M-X02｜contact_xu：普通生活分享

Line-許棠：（照片：路邊一隻貓趴在機車座墊上。）

Line-許棠：剛剛買東西看到的。這樣車主怎麼走。

我：感覺要先跟牠談一下。

Line-許棠：牠完全沒醒。

我：哈哈，那先讓牠睡吧。

旁白：訊息停在那裡。我把書搬上架，又挪了兩次，才讓最後一本塞進去。

Line-許棠：後來牠自己跳走了。我買完東西回來就不在。

我：喔，那車主應該不用等太久。

### COM03M-J02｜contact_jyc：作品到遊戲小事

江雨澄：（遊戲截圖：角色卡在矮牆旁，一條明顯的路就在旁邊。）

江雨澄：我在這裡繞了好久。結果根本不用跳。

我：旁邊那條路？

江雨澄：嗯。我以為太明顯，應該不是。

江雨澄：（迷因圖：一個人盯著敞開的門，仍堅持翻窗。）

我：剛剛拆箱找到延長線，我也找了兩天。一直以為跟電腦放一起。

江雨澄：結果在哪？

我：書底下。

江雨澄：那個真的猜不到。

旁白：她又傳了一個笑臉。我把延長線接好，終於不用每次起身都跨過充電線。

### COM03M-S03｜共同：忙碌的一天

旁白：那天傍晚，工作快收尾時又找到一個問題。改完了，還得把檢查跑完才能交出去。

旁白：水杯已經空了。我倒了半杯水，回來看進度，還有最後幾項。

### COM03M-BOTH-NOTIFY｜contact_xu && contact_jyc

旁白：手機亮了一下，電腦右下角也跳出一則訊息。

Line-許棠：吃了嗎？我等下出去買飯，樓下那間今天有開。

江雨澄：（遊戲截圖：剛更新的選單，多了一個小小的提示圖示，被圈了起來。）

江雨澄：它終於把提示放出來了。我昨天找的時候怎麼沒有。

#### COM03M-C01｜唯一玩家 choice

分類：action。Consequence：Local。三個選項全都回覆兩方，只改變當地先後與工作節奏。沒有 expression stance、分數、Echo 或 Structural effects。

| choice ID | 玩家可見文字 | target |
| --- | --- | --- |
| COM03M-C01-X | 先回許棠的晚餐訊息 | COM03M-BX |
| COM03M-C01-J | 先看雨澄傳的更新 | COM03M-BJ |
| COM03M-C01-W | 把最後幾項檢查做完再回 | COM03M-BW |

#### COM03M-BX｜先回 Line

我：還沒，剛倒完水。等最後幾項跑完就去買。

Line-許棠：喔，好。我出門看看要吃什麼。

旁白：我把手機放在水杯旁，核對最後一項結果，送出工作訊息。再打開剛才那張遊戲截圖。

我：昨天沒有的話，也太晚了。

江雨澄：對啊。偏偏今天第一眼就看到了。

我：我剛交完東西，現在要去買晚餐。晚點再看更新內容。

江雨澄：好，先吃。

→ COM03M-S04。

#### COM03M-BJ｜先看 Discord

旁白：我點開截圖，找到她圈起來的小圖示。

我：昨天沒有的話，也太晚了。

江雨澄：對啊。偏偏今天第一眼就看到了。

我：還有最後一點工作，等下要先去吃飯。

江雨澄：好，更新其實沒多少。我也要去吃了。

旁白：我縮回工作視窗，核對完結果才送出。手機上的晚餐訊息還在。

我：還沒吃，剛交完東西。等下去樓下買。

Line-許棠：好，我已經出門了。今天人還好。

我：嗯，我收一下桌子就下去。

→ COM03M-S04。

#### COM03M-BW｜工作做完再回

旁白：我把手機翻過去，先核對檢查結果。最後一項通過，工作訊息也送出了。

旁白：椅子往後滑了一點。我伸完懶腰，才把手機拿起來。

我：剛忙完，還沒吃。等下去買。

Line-許棠：嗯，我剛買好。那間今天有開。

我：好，謝謝。

旁白：我再打開電腦上的截圖，找到她圈起來的提示。

我：昨天沒有的話，也太晚了。

江雨澄：對啊。我已經關掉了，晚點再看。

我：我也要去吃飯，先離開電腦一下。

江雨澄：好。

→ COM03M-S04。

### COM03M-BX-ONLY｜contact_xu && !contact_jyc

Line-許棠：吃了嗎？我等下出去買飯，樓下那間今天有開。

旁白：我看到訊息，先核對剩下的結果。工作訊息送出去，才拿起手機。

我：剛忙完，還沒吃。等下去買。

Line-許棠：嗯，我剛買好。那間今天有開。

我：好，謝謝。

→ COM03M-S04。不顯示 C01。

### COM03M-BJ-ONLY｜contact_jyc && !contact_xu

江雨澄：（遊戲截圖：剛更新的選單，多了一個小小的提示圖示，被圈了起來。）

江雨澄：它終於把提示放出來了。我昨天找的時候怎麼沒有。

旁白：檢查還剩幾項。我先核對完，送出工作訊息，才點開她圈起來的地方。

我：昨天沒有的話，也太晚了。

江雨澄：對啊。我已經關掉了，晚點再看。

我：我也要去吃飯，先離開電腦一下。

江雨澄：好。

→ COM03M-S04。不顯示 C01。

### COM03M-S04｜共同：離開桌子

旁白：我拿了鑰匙出門。走到樓下才想起沒帶購物袋，又懶得上去拿。

旁白：晚餐拎回來，我把電腦闔上，騰出桌子放飯。吃到一半才發現自己餓得比想像中厲害。

旁白：隔天晚上，最後一個搬家箱也空了。倒過來拍了兩下，掉出一張皺掉的便條紙。

旁白：上面是我搬家前寫的「這箱先拆」。

### COM03M-X04｜contact_xu：我主動分享

我：（照片：空紙箱旁放著寫了「這箱先拆」的便條紙。）

我：最後一箱。現在才看到這張。

Line-許棠：喔，還好裡面不是牙刷。

我：書跟延長線。牙刷那箱有先找到。

Line-許棠：那就好。

旁白：過了一會兒，她又傳來一則。

Line-許棠：我之前也有一箱一直沒拆。後來缺東西才想到。

我：我現在只想把紙箱壓平，其他明天再說。

Line-許棠：嗯，終於拆完了。

旁白：我蹲下來，沿著箱底撕開膠帶。剛才傳的照片還亮在桌上。

### COM03M-J04｜contact_jyc：我主動分享與休息

我：我把之前那張截圖又看了一下。其實我喜歡沒注意到路、自己繞回去的感覺，只是太久會煩。

旁白：我傳完就去洗碗。回來時，她已經回了兩段。

江雨澄：我也是喜歡自己找。但是繞到第三次，就會開始懷疑是不是不能走。

江雨澄：右邊那扇門的光真的太亮。不是說它應該全部標出來啦，只是左邊能再清楚一點。

我：對。我會先以為自己漏看，不會想到要換條路。

江雨澄：嗯。

旁白：我把水槽邊擦乾，拿了書坐到沙發上。快睡前，電腦又亮了一下。

江雨澄：剛想到，聲音也可以提示方向，不一定要改畫面。可是它前面一直有音樂，大概還是很難注意。

江雨澄：不用現在回，我只是先記一下。

我：看到了。我今天想早點睡，明天再聽那段。

江雨澄：好。我也差不多要關了。

我：晚安。

江雨澄：晚安。

### COM03M-S05｜共同：一週快過完

旁白：又過了一兩天，書都上架了，椅子後面也不再卡著箱子。

旁白：晚上工作結束，我沒有立刻關掉桌燈。順手翻了幾頁書，看到一個喜歡的版面，把頁角夾上書籤。

### COM03M-X05｜contact_xu：中山設計書話題

Line-許棠：週末想去中山看設計書。上次看到一本印刷的，沒時間翻完。

我：是看紙跟顏色那種嗎？

Line-許棠：有一部分。還有一些版面的例子，實物比較看得清楚。

我：我剛剛也在翻書。有一頁字沒多少，但看起來很舒服，說不出是哪裡。

Line-許棠：可以先看留白。也不一定要拆得很細，喜歡就多看一下。

我：嗯。我再翻翻。

Line-許棠：好，我先去洗澡。

### COM03M-J05｜contact_jyc：限定展資訊

江雨澄：（展覽資訊連結：限定展，展出作品的場景設計與相關圖稿。）

江雨澄：剛看到這個。展出的圖好像比網路上多。

我：有場景那區？

江雨澄：有。介紹裡寫會放一些比較早的版本，滿想看它改了什麼。

我：這個我也想看。網路上的圖有些太小了。

江雨澄：對，放大就糊掉。

旁白：我點開她傳的頁面，看了一會兒展出內容。

我：我先把頁面留著。

江雨澄：嗯，我也還在看資訊。

### COM03M-S06｜共同：收束

旁白：我把書闔上，書籤留在剛才那一頁。

旁白：週末還沒有排好。也許可以出去走走，我想。桌邊空出的那塊地方，今晚先讓它空著。

旁白：關燈前，我又看了一眼手機，才把它接上充電線。

## Choice／state／rejoin contract

| 分流 | 真實內容與合流 | effects |
| --- | --- | --- |
| Both | S03 後 BOTH-NOTIFY → C01 → BX／BJ／BW，各支完整回覆兩人 → S04 | 只保存 C01 selected choice ID 的既有 choice history；當地先後不同 |
| Xu-only，Jiang never_met | S03 → BX-ONLY → S04；所有 J 段略過 | contact／discovery 保持 entry |
| Xu-only，Jiang known-but-not-contacted | 同 Xu-only 文字；不提她、不傳她訊息 | known 保持 known，contact_jyc 保持 false |
| Jiang-only | S03 → BJ-ONLY → S04；所有 X 段略過 | contact_xu 保持 false |
| 所有合法 variants | S06 → COM03M-EXIT → OPEN-A 的入口 handoff | 僅主線 exit 設 `open_dating_unlocked=true` |

BX、BJ、BW 不互相串接。各支剩餘訊息與工作都實際完成，S04 以離桌買飯作共同 bridge；無另一方追問、懲罰或虛構被錯過的承諾。單 contact 不先進 BOTH-NOTIFY 再隱藏選項。

`COM03M-EXIT` 是唯一 completion mutation 點。本幕不寫 `open_a_entered`、slot counters、major investment／focus、romanticSignal、availability、cooling、RE／reopening、repair、closure／harm、alias 或跨人物 knowledge，不延伸任何 numerical compatibility mutation。聯絡 gate 及 COM-03J reply style 都 read-only。活動話題沒有邀約答覆，也沒有保證同行。

J01 style selector 僅讀可信本次／replay-local snapshot；ordered branches 明列 continue_content、warm_close、save_for_later，最後無條件 neutral。缺失或未知不從 live state 補值，不推定先前有更長分析或已經聊過本幕新增遊戲細節。本幕所有討論的具體圖像都已在本幕實際傳出，不需 COM-01J／02J topic callback。

Memory replay 只依 scene-local contact snapshot 與可信 reply-style／choice history 重現同一 variant；缺 snapshot 不得用 live contact 補另一方。Replay completion 不向主線寫 `open_dating_unlocked` 或 contact。沒有雙 contact 的重播不生成 C01 choice history。

下游 text-first integration 須以這些 ID 作穩定 authoring anchors，使用既有 flags／ordered branches 投影，完整保留所有玩家可見文字；不得把選擇三支改為只顯示先回方、略掉晚回方或摘要 montage。實際 runtime node IDs 與 engine flag representation 由 integration 工作者綁定，不能為本幕新增 week calendar、route menu 或 scheduler field。

## Semantic visual beats

1. 住處桌面與搬家箱逐步整理；手機或電腦訊息穿插男主自己的工作、吃飯與讀書。
2. 已 contact Xu 的生活照片／Line 短回；已 contact Jiang 的遊戲截圖／Discord 補充。缺 contact 的媒介完全不出現。
3. 忙碌時兩個訊息媒介僅在 Both 同時亮起；Local 分支後共同離桌買晚餐。
4. 空箱與「這箱先拆」便條、沙發讀書和睡前收束；男主主動分享及實際休息。
5. 分別收到中山設計書／限定展話題，最後桌面空下來、書籤與充電中的手機。無赴約、共同外出或新人物畫面。

以上只定義 semantic beats，不含 camera、CG、render prompt 或 art authority。下一 stage 是 fresh independent content_qa / narrative_review；OPEN-A 實際入口、兩個 major slots、邀約接受／counteroffer／婉拒及 anchors 都留給其 owner。
