# Script Blueprint — Common / Shared Route

> Lifecycle: **CANONICAL**
>
> Version: 0.1
>
> Updated: 2026-09-26
>
> Parent sources: `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`, `PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`.
>
> Existing Locked Scene files override this blueprint for the same scene.

# 1. Common opening contract

Common opening 的任務不是讓玩家立刻選女主，而是建立兩個不同但同樣可信的入口：

- 許棠先進入男主「住家 / 日常」。
- 江雨澄先進入男主「興趣 / 線上」。
- 男主在兩條線都只是被生活帶到一個可繼續認識的關係，不是立即 romance。
- 到 COM-03M 前，玩家應已能感覺兩種 notification 有不同期待感，但還沒有任何 exclusivity 壓力。

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

**Exit state**：`F_XT +1`。

**Next hook**：深夜便利店讓她第一次以比較放鬆、非通勤狀態出現。

---

## COM-01J — 地下街初遇

**Entry condition**：男主與江雨澄完全不認識。

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
- 具體延伸作品：增加 familiarity。
- 泛泛稱讚：不冒犯，但沒建立共同語言。
- 過度追問私人資訊：她會禮貌收尾。

**Exit state**：`met_jiang_yucheng=true`, `F_JYC +1`。

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

**Exit state**：`F_XT +1`。

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

**Exit state**：`F_JYC +1`。

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

**Exit state**：`contact_xu=true`, `F_XT +1`。

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

**Exit state**：`contact_jyc=true`, `F_JYC +1`。

---

## COM-03M — 一週訊息 montage

**Entry condition**：兩邊都已有 contact。

**Dramatic job**：在不消耗大量 scene 的前提下，讓「相識」變成「開始期待對方出現」。

**Progression**
1. 第一兩天訊息仍有明確理由：包裹、推薦、附近資訊。
2. 許棠開始偶爾丟一句生活訊息，不一定等男主先開話題。
3. 雨澄則從作品延伸到 meme、遊戲、零碎抱怨。
4. 男主工作忙的一天，兩邊訊息同時出現；玩家第一次感到「我現在想先回誰」。
5. 不在這裡做 route lock；只記錄回覆傾向與 tone。
6. 許棠可能用「吃了嗎」作為非常輕的關心。
7. 雨澄可能深夜丟一段長分析，再補「不用現在回」。
8. 男主開始主動分享一些自己遇到的小事，而不只是被動回覆。
9. montage 最後形成兩個自然邀約入口。

**Exit state**：`open_dating_unlocked=true`。

**Next hook**：OPEN-A。

# 2. Attention windows

## OPEN-A — Week 2–3

OPEN-A 是 scheduler，不是菜單劇情。

**Narrative contract**
- 玩家有兩個 major social slots。
- XT-04 與 JYC-05 都可成為第一個 anchor。
- 若第一個 slot 投資某 heroine，第二位不因此消失；她仍可透過訊息存在。
- 若兩個 slot 都投同一 heroine，另一位只降低近期 momentum，不關線。

**Presentation suggestion**
1. 先由兩個不同 invitation 進場。
2. 玩家做具體行動選擇，而不是按「許棠線／雨澄線」。
3. slot 間用工作日 montage 讓時間流逝。
4. 第二個 slot 根據第一個選擇改 wording：另一位可以提「你最近好像很忙」，但不能憑空知道對方存在。

**Exit**：進入 early 1-on-1 progression；更新 `recentFocus` / `focusHistory`。

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
8. 分開後，若 romantic signal 已高，對應 heroine 可有一條 very light follow-up。
9. follow-up 不問「她是誰」審訊，只是讓玩家感覺 awareness 已存在。

**Exit state**：
- `xu_knows_jyc_exists=true`
- `jyc_knows_xu_exists=true`
- `jyc_knows_xu_is_neighbor=true`

---

## OPEN-B — Week 3–4

**Narrative contract**
- 三個 major slots。
- pool：XT-06 / XT-07 / XT-08 / JYC-06B / JYC-07 / JYC-08。
- prerequisites 仍有效；不是六選三。
- 同一 heroine 可連續出現兩次，形成 focus。
- 未 focus heroine 必須保留 re-approach path。

**Scene-to-scene rhythm**
1. 一個純好玩 / 日常 scene。
2. 一個更私人或 date-like scene。
3. 一個 trust / vulnerability scene。
4. 若玩家連續投同一人，第三 slot 前插入 RE-X 或 RE-J 的輕量提醒。
5. 不要用系統文字說「你忽略了某人」；由訊息頻率和人物行為表現。

---

## RE-X — 許棠重新靠近

**Entry condition**：`recentFocus=jyc` 且 Xu 線仍 viable。

**Best default version**
1. 17樓偶遇。
2. 許棠很自然問「你最近是不是很忙」。
3. 男主知道她其實是在確認彼此是否還會繼續約，但她不會直接問。
4. 她提到之前聊過的一家店／一件小事。
5. 玩家可以順勢約回來、只聊天、或繼續模糊。
6. 若玩家主動，下一個 Xu major scene 恢復 invitation momentum。
7. 若不主動，她也不生氣，只把距離調回普通鄰居一點。

**Rejoin**：不直接加大量 trust/chemistry；只恢復可用的 narrative momentum。

---

## RE-J — 雨澄重新靠近

**Entry condition**：`recentFocus=xu` 且 JYC 線仍 viable。

**Best default version**
1. 她丟一張更新後的遊戲／新作品截圖。
2. 表面完全是原本聊天風格。
3. 幾輪後才出現一句「你最近是不是沒在玩」。
4. 若男主積極回來，她會快速恢復原本節奏。
5. 若男主剛從 Xu conflict 過來且突然異常熱絡，加入 `possibleReboundFrom=xu` subtext。
6. 她不會問「是不是跟隔壁吵架」除非她已真的知道許棠存在且接近。
7. 她只可能說「你今天很閒？」或「你今天怪怪的」。

**Rejoin**：重新解鎖 JYC major scene，但不是免費恢復 romantic depth。

---

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
- XT-09→10→11 與 JYC-09→10→11 都可以在同一 phase 活著。
- 系統不要求玩家先完整跑完一條再開另一條。
- 若兩邊都深，允許「一邊剛有 conflict，另一邊仍正常」的生活感。
- conflict 後切到另一 heroine 不自動等於背叛；只有刻意拿對方當替代且形成 deceptive behavior 才影響後續。
- 真正 late lock 仍在 COMMIT / DECIDE。

**Recommended sequencing**
- balanced route：XT-09 → JYC-09 → XT-10 → JYC-10 → XT-11 / JYC-11。
- Xu-focus：XT-09→10→11，中間保留一個 JYC message / RE-J。
- JYC-focus：JYC-09→10→11，中間保留一個 Xu encounter / RE-X。
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
