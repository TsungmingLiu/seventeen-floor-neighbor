# Script Blueprint — Common / Shared Route

> Lifecycle: **CANONICAL**
>
> Version: 0.2
>
> Updated: 2026-10-03
>
> Parent sources: `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`, `PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`.
>
> Existing Locked Scene files override this blueprint for the same scene.

# 1. Common opening contract

Common opening 建立生活半徑；以下是雙入口核心 coverage，不強迫每輪發現兩人：

- 許棠先進入男主「住家 / 日常」。
- 江雨澄先進入男主「興趣 / 線上」。
- 男主在兩條線都只是被生活帶到一個可繼續認識的關係，不是立即 romance。
- COM-03M 只呈現已取得 contact 的訊息；兩方都認識才有兩種 notification，沒有 exclusivity 壓力。

## COM-00 — 雨夜搬家

**Entry condition**：遊戲開始；男主剛搬回台北，生活尚未真正重新落地。

**Immediate setup**：搬家公司剛走，走廊仍有幾箱未收。雨聲與空房形成「新生活尚未填滿」的基調。

**Dramatic job**：讓許棠成為一個自然存在於生活半徑內的人，而不是被安排好的戀愛對象。

**Scene progression**
1. 男主自己處理最後的箱子，先建立他「習慣自己搞定」。
2. 箱子短暫卡住公共通道，防火門正要回彈。
3. 許棠回來，順手扶門；先處理實際問題，再看男主。
4. 她幫他把那一箱挪到不擋路的位置，但不主動加入搬家。
5. 兩人交換最基本的名字與「原來住隔壁」資訊。
6. 男主可以正式道謝、自嘲、或只先把東西收好。
7. 許棠的回應依 tone 微調，但都保持成年人初識的邊界。
8. 她進門，男主第一次注意到隔壁門關上的聲音。
9. 回到空屋後，手機沒有訊息，走廊也恢復安靜。

**Choice forks**
- 正式：建立男主克制、可靠的第一印象。
- 自嘲：讓許棠第一次顯出短暫笑意。
- 實務優先：不扣關係，只讓互動更短。

**Rejoin**：都以「知道彼此名字、住隔壁」結束。

**Exit state**：`met_xu_tang=true`。

**Next hook**：幾天內再次在電梯碰到，讓第一次真正聊天有自然理由。

---

## COM-01X — 電梯重啟

**Entry condition**：只知道彼此是鄰居，尚未有私下聯絡。

**Immediate setup**：平日晚間，同乘電梯。短暫停頓只是一個 forcing function，不是災難事件。

**Dramatic job**：證明兩人即使沒有「事件」也聊得下去。

**Scene progression**
1. 進電梯前已有一兩句生活化寒暄。
2. 電梯短停、燈閃。
3. 男主本能看控制面板；許棠先用乾式一句話打破尷尬。
4. 系統其實很快恢復，因此沒有英雄救美空間。
5. 對話轉到大樓、附近吃飯、回台北多久等低風險話題。
6. 許棠提供一個具體但不過度熱心的生活資訊。
7. 男主依 tone 回應：幽默、實際、安靜。
8. 到 17 樓後兩人自然各自回家，不強行延長。
9. 男主回頭時她已在開自己的門，留下「下次可以再聊」的感覺。

**Choice forks**：只塑造 tone；不產生 route lock。

**Exit state**：熟悉的生活前事成立。

**Next hook**：深夜便利店讓她第一次以比較放鬆、非通勤狀態出現。

---

## COM-01J — 地下街初遇

**Entry condition**：男主與江雨澄完全不認識。Opening 的生活行動入口可去地下街買設定集，也可先回家／休息；未去只保留後續第二 discovery，不先設 met/contact。這是後續 migration 的短 entry plan，既有 locked Opening facts 不改。

**Immediate setup**：男主有自己的 ACG / 設定集購買目的，因此接近不是以她為目標。

**Dramatic job**：建立「共同語言先於外貌吸引」。

**Scene progression**
1. 男主在比較設定集版本，看到同架另一人也在找。
2. 兩人因同一本書短暫讓位／確認版本，仍不是搭訕。
3. 男主針對內容講一個足夠具體的差異。
4. 江雨澄先用最短答案測試他是不是隨口裝懂。
5. 發現他知道上下文後，她多補一兩個細節。
6. 她的語速與句子明顯比最初自然，但仍保持社交邊界。
7. 男主若問具體作品問題，她會投入；若泛稱「妳很懂」，反而讓對話短一點。
8. 店內人流或結帳自然中斷。
9. 兩人沒有交換姓名，只有「可能再遇到也認得」的程度。

**Choice forks**
- 具體延伸作品：留下具體共同話題。
- 泛泛稱讚：不冒犯，但沒建立共同語言。
- 過度追問私人資訊：她會禮貌收尾。

**Exit state**：`met_jiang_yucheng=true`；共同作品話題成立。

**Next hook**：她之前提過一間相對安靜的咖啡店，使 COM-02J 的再次相遇不只是純巧合。

---

## COM-02X — 深夜便利店

**Entry condition**：與許棠只聊過兩次，知道是鄰居。

**Immediate setup**：兩人都因工作拖晚而下樓買東西。

**Dramatic job**：把許棠從「外表完整、很有距離感的鄰居」拉回普通生活。

**Scene progression**
1. 男主先在貨架前猶豫宵夜。
2. 許棠拿咖啡與簡單晚餐，穿較居家的衣服。
3. 她先叫出男主名字，顯示有記住。
4. 兩人互相看對方手上的「晚餐」，有一點成年人自嘲。
5. 對話落到附近吃飯、工作 deadline、住這區多久。
6. 男主如果直接糾正她飲食，許棠不吵，只用一句話把界線放回來。
7. 若男主只是交換「我也常這樣」，互動更自然。
8. 結帳後一起走到大樓，再自然分開。
9. 回到 17 樓時，不需要額外製造浪漫停頓。

**Rejoin**：她開始從「隔壁的人」變成「生活裡常碰到的人」。

**Exit state**：熟悉的生活前事成立。

---

## COM-02J — 咖啡店重逢

**Entry condition**：只在地下街聊過一次。

**Immediate setup**：男主因工作找安靜地方，真的去了她先前提過的咖啡店。

**Dramatic job**：第一次看到她在熟悉主題中有明顯 personality。

**Scene progression**
1. 男主先看到她用 tablet 畫圖，但不立即走過去。
2. 江雨澄先認出他；猶豫幾秒後主動打招呼。
3. 兩人正式交換名字。
4. 前幾句仍偏客套。
5. 男主提到上次作品，她很快進入更具體的分析。
6. 她甚至會反駁男主的一個看法；男主如果不防衛，對話變得更有火花。
7. 男主注意到她不是「不會講話」，而是需要有東西值得講。
8. 咖啡店逐漸變吵或她要離開，對話自然結束。
9. 她主動補一個推薦，成為後續聯絡理由。

**Exit state**：共同作品脈絡成立。

**Next hook**：COM-03J 由「我想到你上次講的那個」開始，而不是突然索取聯絡方式。

---

## COM-03X — 包裹 / Line

**Entry condition**：男主與許棠已有數次生活化互動。

**Immediate setup**：她的印刷樣本被誤放到男主門口。

**Dramatic job**：交換聯絡方式，同時第一次把她的職業具體化。

**Scene progression**
1. 男主注意到包裹姓名，確認不是自己的。
2. 他敲門或她來找，沒有「偷看內容」。
3. 她接過包裹時提到這批樣本趕 client deadline。
4. 男主從包裹與一句抱怨理解她是接案設計師。
5. 對話從包裹延伸到附近印刷店／大樓收件混亂。
6. 她提到可以把店家資訊傳給男主，或男主下次遇到錯放可以直接 Line 她。
7. 交換聯絡方式時不要製造成戀愛 milestone；越自然越好。
8. 她關門前仍有一個短短的「謝了」，比第一次熟悉。
9. 晚一點她真的把資訊傳來，證明交換不是藉口。

**Exit state**：`contact_xu=true`。

---

## COM-03J — 推薦 / Discord

**Entry condition**：咖啡店重逢後，兩人已有共同作品脈絡。

**Immediate setup**：江雨澄想到一個上次沒講完的遊戲／作品，線下只來得及簡單說。

**Dramatic job**：建立 Offline JYC / Online JYC 的對比，但不把兩者寫成兩個人格。

**Scene progression**
1. 她先主動提「我回去找到了」。
2. 為了傳連結／截圖交換 Discord 或 Line。
3. 線下告別仍很普通。
4. 晚上她第一則訊息非常克制。
5. 男主回了一個真正懂內容的點後，她連續傳更多分析。
6. 接著出現 meme、截圖、補充、更正自己前一句。
7. 男主有一個小停頓：原來她打字是這樣。
8. 若玩家跟上她節奏，兩人聊到偏晚；若只回短句，也保留未來。
9. 最後她用一句「我是不是講太多」收束，男主回應可決定她下一次主動程度。

**Exit state**：`contact_jyc=true`。

---

## COM-03M — 一週訊息 montage

**Entry condition**：至少一方已有 contact。

**Dramatic job**：在不消耗大量 scene 的前提下，讓「相識」變成「開始期待對方出現」。

**Progression**（以下各 heroine beat 只在其 contact 已成立時呈現；單 contact 不補另一方訊息）
1. 第一兩天訊息仍有明確理由：包裹、推薦、附近資訊。
2. 許棠開始偶爾丟一句生活訊息，不一定等男主先開話題。
3. 雨澄則從作品延伸到 meme、遊戲、零碎抱怨。
4. 男主工作忙的一天，若雙 contact 兩邊訊息同時出現；玩家第一次感到「我現在想先回誰」。
5. 不在這裡做 route lock；只記錄回覆傾向與 tone。
6. 許棠可能用「吃了嗎」作為非常輕的關心。
7. 雨澄可能深夜丟一段長分析，再補「不用現在回」。
8. 男主開始主動分享一些自己遇到的小事，而不只是被動回覆。
9. montage 最後由已 contact 方形成自然邀約入口；單方也可進 OPEN-A。

**Exit state**：`open_dating_unlocked=true`。

**Next hook**：OPEN-A。

# 2. Attention windows

## OPEN-A — Week 2–3

**Entry / scene function**：COM-03M 後兩個 authored major slots。已知/contactable 且 eligible 的人可邀；XX/JJ、XJ/JX 與 solo/rest/wait 均合法，不以 focus 當承諾。

**具體入口**：许棠提週末中山設計書；玩家也可引用 COM-03X 的設計話題問同行，接 XT-04。雨澄分享限定展資訊；玩家可引用 Discord 作品討論邀同行，接 JYC-05。普通熟人接受的是第一次一對一，沒有「復合」台詞。女主接受、提同 window 合法時間／較低曝光地點或婉拒；改期不另送 slot，未成行不假造 anchor 完成。

**生活選擇**：solo 整理搬家箱／獨自逛書店；rest 處理工作後早睡；wait 看完作品、放下手機，訊息不保證到來。這些有男主生活內容並消耗當前 slot；漏回已答應的安排才留下 cooling 事件，不因休息本身扣關係。

**第二 discovery**：若 Opening 未去地下街，OPEN-A 兩 slot 後至 OPEN-B 開始前，男主因自己的設定集購買再入地下街，COM-01J 短 first-entry variant 去掉「以前見過」前提，仍只聊作品不交換姓名；merge COM-02J 正式交換名字，再 COM-03J 取得 contact。這是最後一次自然 discovery 機會，可選回家而未遇見；不送額外 date slot、不生成 RE 歷史。既有已整合 Opening 不被此規劃改寫。

**Exit / handoff**：每 slot 演一個 major anchor/continuation 或生活片段。XT-04 → XT-05、JYC-05 → 先在線上 co-op → JYC-06，仍問當地願意與否。XX 後 ordinary 江雨澄可於 OPEN-B 第一合法 slot 首邀 JYC-05，JJ 對稱首邀 XT-04；OPEN-A entered 是歷史 gate，不能加第三 slot或跳到 midgame。未見雨澄者必先 discovery/contact chain；再次錯過則走較短許棠／個人生活路徑。

---

## SH-01 — 17樓第一次同框

**Entry condition**：JYC-06 已發生；許棠至少已有 contact；兩位都不知道完整 relationship status。

**Immediate setup**：雨澄從男主家離開或正要來，許棠剛好回到 17 樓。

**Dramatic job**：只建立 knowledge，不製造修羅場。

**Scene progression**
1. 電梯門開，許棠出現。
2. 男主與雨澄因站位顯示剛一起活動，但不必肢體親密。
3. 男主若反應自然，就直接互相介紹名字。
4. 許棠與雨澄只交換幾句生活化話。
5. 許棠可注意到雨澄拿著 controller / tote / 雨傘等 context，但不推理過頭。
6. 雨澄得知許棠是隔壁鄰居。
7. 三人沒有誰酸誰；真正 tension 是玩家開始知道這兩條線會碰到。
8. 分開後，若先前已有互相表達的 romantic signal，對應 heroine 可有一條 very light follow-up。
9. follow-up 不問「她是誰」審訊，只是讓玩家感覺 awareness 已存在。

**Exit state**：
- `xu_knows_jyc_exists=true`
- `jyc_knows_xu_exists=true`
- `jyc_knows_xu_is_neighbor=true`

---

## OPEN-B — Week 3–4

**Entry**：已有 early anchor/continuation，或 OPEN-A 的生活 slots 已用完。三個 major slots；未玩 anchor 可在第一合法 slot 返回，其餘按 prerequisites 接 XT-06/07/08、JYC-06B/07/08。major outing 各占 slot；同次咖啡／雨天替代地點是 continuation，不能再算一次投入。

**安排**：一幕好玩日常、一幕 date-like／更私人、一幕 trust；選同方時另一方只有實際 contact 的短訊息。曾投入／已接受未成行 plan 被擱置者，OPEN-A 結束可有一次 RE；未投入者保留 contextual first invitation。slot 間由工作、獨處與訊息回覆形成時間流逝，不用系統指責。

## RE-X / RE-J — 一次自然重新靠近

**Entry**：指名 prior investment 或已接受未成行 plan、其 missed response/arrangement 與 cooling/dormant；contact 或 recentFocus 指向另一人不夠。closure open、無 unresolved harm、natural offer unused 才進。

**RE-X progression**：OPEN-A 收尾17樓碰面，她拿著先前聊過書店的清單，本就要去，問要不要同行。男主可接受／提同一可用 window 時間／只聊兩句。接受 → 下一合法 slot 未玩 XT-04，已玩則 XT-05 或下一必要 scene；不提高親密。只聊天或錯過 → 她自己逛，訊息回到普通鄰居、dormant。

**RE-J progression**：同收尾她傳已共同玩過的更新截圖，先聊改動，再問要不要一起玩／去展，並選自己可接受的線下方式。接受 → 未玩 JYC-05 或下一必要 scene；不能跳过 co-op/家訪前事。短回或錯過 → 她照常玩，停止主動 romantic invites；不猜另一人的關係，rebound 只用真實 knowledge。

**一次 player reopening**：上述收尾 offer missed 後，緊接 OPEN-B 入場才開唯一 window，OPEN-B 第三 slot 收尾即關。玩家在一個剩餘合法 slot 以那家書店／該遊戲更新主動詢問；接受或 counteroffer 消耗機會，merge 同一未玩主幕；timing decline／不答也 consumed 且 dormant。她明說不再浪漫嘗試 → 當地 closure，本輪不再重開；普通電梯點頭／公共作品訊息仍可存在。無 slot、clarity due 或 late lock 即 expired，無延展。若自然 offer 在 OPEN-B 收尾才 missed，唯一 window 是紧接 BRAID-C，僅在其既有合法安排且 prerequisite 已成立時返回，phase 收尾關，不能插 slot 或跳私人主弧線。

**repair boundary**：XT-04 擅排程或 JYC-05 代答等 unresolved 前事先接該 heroine 相鄰 continuation 的承認／停止越界／她的回應；RE 不作該 repair，也不設 late repair_completed。明確 romantic closure 不可用普通首邀繞回。

## SH-02 — 創作者／設計活動同場

**Entry condition**：許棠設計工作已成立；雨澄 creator / alias arc 已進入；knowledge flags 依 SH-01 與 honest disclosure 而定。

**Immediate setup**：兩人各自都有去 creator/design event 的獨立理由。

**Dramatic job**：證明兩位女主本來就能在同一城市、同一興趣產業自然交叉；同時讓「你們怎麼認識」變成 knowledge test。

**Scene progression**
1. 男主先和其中一位到場，另一位稍後因自己的活動目的出現。
2. 若 SH-01 發生過，兩人可先認出；否則重新正式介紹。
3. 許棠看雨澄作品，給具體而平等的專業 feedback。
4. 雨澄一開始拘謹，因話題具體逐漸放鬆。
5. 男主短暫變成旁觀者，讓兩位女主有不圍著他的交流。
6. 某個自然問題帶出「你們怎麼認識的」。
7. 男主依 knowledge / honesty state 回答。
8. 誠實回答不一定舒服，但不造成 immediate trust damage。
9. 模糊或不必要的遮掩會留下 impression flag，供後面 overlap 使用。
10. 活動結束後兩位女主各自回到自己的 arc，不變成固定三人團。

**Exit state**：可更新 `xu_knows_jyc_is_close`, `jyc_knows_xu_is_close`。

---

## BRAID-C — Week 4–5

**Narrative contract**
- XT-09→10→11 與 JYC-09→10→11 是各自必要 phase 後續；兩條均進入才交錯演出，不以三 slots 六選三漏掉 payoff。
- 缺另一方 arc/knowledge 就 bypass SH-02；單線仍完成自己的私人、conflict、repair 與 clarity。
- 系統不要求玩家先完整跑完一條再開另一條。
- 若兩邊都深，允許「一邊剛有 conflict，另一邊仍正常」的生活感。
- conflict 後切到另一 heroine 不自動等於背叛；只有刻意拿對方當替代且形成 deceptive behavior 才影響後續。
- late lock 在該 heroine repair outcome 與 local clarity resolved 後；COMMIT 僅實際 collision 可選。

**Recommended sequencing**
- balanced route：XT-09 → JYC-09 → XT-10 → JYC-10 → XT-11 / JYC-11。
- Xu-focus：XT-09→10→11，中間按實際 contact/eligibility 保留 JYC message / RE-J。
- JYC-focus：JYC-09→10→11，中間按實際 history/eligibility 保留 Xu encounter / RE-X。
- 不需要把每種順序寫成不同 scene，只切換 opening / follow-up lines。

# 3. Shared handoff to late game

進入 TENSION 前，writer 必須能回答：

- 哪一邊已出現 romantic signal？
- 哪一邊完成核心 conflict？
- 哪一邊仍有 repair viability？
- 兩位女主各自知道另一人的什麼？
- 男主是否曾為避免做選擇而說過具體謊話？
- 若目前只剩一條 viable romantic route，COMMIT collision 不得硬觸發。

這些答案由 route/state contract 控制；本 blueprint 不額外發明 hidden omniscience。
