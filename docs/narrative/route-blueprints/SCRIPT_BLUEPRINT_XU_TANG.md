# Script Blueprint — Xu Tang / 許棠 Route

> Lifecycle: **CANONICAL**
>
> Version: 0.1
>
> Updated: 2026-09-26
>
> Scope: XT-04 → XT-14 + Xu endings / after story / codas.
>
> Parent sources: `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`, `PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`.

# 1. Route dramatic spine

許棠線不是「獨立女性最後學會依賴男人」，而是兩個高度自理的人學會：

- 幫忙之前先問；
- 需要別人時可以明確說；
- 有需求不等於有權替對方決定；
- 尊重邊界也不等於永遠裝作自己沒有需要；
- intimacy 的核心是共同決策，不是誰更會照顧誰。

男主的 route-specific flaw 是：他很容易把 care 轉成 solution，把失望藏成「沒事」，最後又因為沒有被需要而退回工作。

許棠的 route-specific flaw 是：她過去被「關心」逐步侵入生活，所以有時把「我不要被管理」擴大成「我最好什麼都不要欠任何人」。

Good route 要讓兩人都修，不是其中一人被教育。

# 2. Early route

## XT-04 — 中山書店

**Entry condition**
- 已有 `contact_xu=true`。
- 仍是熟悉鄰居，不是正式約會關係。
- 可以是 OPEN-A 第一或第二個 major slot。

**Immediate setup**
許棠傳訊息說週末要去中山看一本設計／攝影書，順口問男主要不要一起。她不稱它為 date；男主也不需要替它下定義。

**Dramatic job**
建立許棠的「自己的 pace」，並第一次讓玩家選擇是跟上她、管理行程，還是用幽默陪她。

**Scene progression**
1. 兩人在捷運出口碰面，許棠比平常稍微有準備，但不是「盛裝赴約」。
2. 她本來說只看一本書，進店後很快停在另一區。
3. 男主原本心裡有一個「逛完 → 咖啡 → 下一站」的小行程。
4. 許棠開始翻一本攝影集，時間明顯超過預期。
5. 玩家第一次被迫面對：要不要提醒她「我們不是還要去……」。
6. 若陪她慢慢看，她會自然開始把書頁轉向男主，分享真正有興趣的細節。
7. 若提醒行程，她不生氣，只會問「你比較想去哪？」；這是 compatibility，而不是 moral test。
8. 若幽默說「妳是不是打算住這」，她依 chemistry 可以回一句很乾的吐槽。
9. 原定下一站逐漸變得不重要。
10. 最重要的主動 beat：許棠自己問「要不要找地方喝東西？」延長相處。

**Choice forks**
- 陪她慢慢看：`xt_respected_pace=true`, compatibility 上升。
- 提醒行程：顯示男主偏計畫型；若口氣正常，不是 bad choice。
- 用玩笑打破時間焦慮：chemistry variant。

**Reactive variants**
- 若玩家先前經常 practical：許棠可能說「你是不是都會先排好？」。
- 若玩家偏 humorous：她更容易把下一段咖啡變成 banter。

**Rejoin**
都會去附近坐一下，只是許棠是否覺得「和他在一起不需要被趕」不同。

**Exit state**
- 至少 `F_XT +1`。
- 健康路徑提高 `K/T`。
- 若再投資 Xu，XT-05 開啟。

**Next hook**
她之後傳一張今天看到的書頁／設計，讓「一起待著」比活動本身更有記憶。

---

## XT-05 — 同一張桌子

**Entry condition**
- XT-04 或足夠 Xu familiarity。
- 關係仍沒有明確 romance label。

**Immediate setup**
兩人在樓下或附近咖啡店各做自己的工作。不是專門約會，而是「你要不要一起坐」的生活型邀約。

**Dramatic job**
建立 comfortable silence；第一次讓許棠反過來看穿男主「能力很強，所以什麼都不用別人管」的 facade。

**Scene progression**
1. 兩人各自打開 laptop / tablet。
2. 前二十分鐘幾乎沒說話，但不是冷場。
3. 許棠收到 client 改稿訊息，先只皺眉，過一陣才吐槽。
4. 她不是請男主解決，只是在分享 frustration。
5. 玩家可以直接分析 client、問她要不要聽建議、或只回應她的情緒。
6. 核心差別不是「安慰 vs 解決」，而是是否先確認 support mode。
7. 不久後男主收到 production escalation。
8. 他說「五分鐘」，結果四十分鐘。
9. 許棠沒有鬧脾氣；她自己工作，中間去拿飲料，也順便替他帶一杯。
10. incident 結束後，她先問一個非常普通的技術狀況，確認他真的忙完。
11. 然後才問：「你每次都是這樣嗎？」
12. 男主第一反應可以是「工作就這樣」。
13. 她不講大道理，只說自己看他剛剛整整四十分鐘連水都沒喝。
14. 她最後留下：「你看起來好像什麼都不用人管。」
15. 男主未必當場理解，只覺得這句話卡在心裡。

**Choice forks**
- 先問她想要建議還是只想抱怨：`xt_asked_support_mode=true`。
- 直接進 problem-solving：不是立即扣 trust，但留下 control-style seed。
- 男主 incident 後若真的承認累：讓她看到一點 vulnerability。
- 若強行說「沒事，小事」：保留 competence mask。

**Rejoin**
兩人仍一起離開咖啡店；沒有 confession。

**Exit state**
- `xt_saw_competence_mask=true`。
- healthy path：`T/K +1`。

**Next hook**
後續夜市／電影時，許棠會開始偶爾主動照顧男主，但不使用「照顧你」語言。

# 3. Midgame attraction and trust

## XT-06 — 臨江街夜市

**Entry condition**
- Xu familiarity 足夠。
- 可在 OPEN-B 早段出現。

**Immediate setup**
原本只是晚餐訊息：「吃了嗎？」最後臨時變成一起去夜市。

**Dramatic job**
純粹讓玩家喜歡兩人相處，建立身體距離與 chemistry；不急著談創傷。

**Scene progression**
1. 兩人下班後碰面，都沒有完整規劃。
2. 許棠先說想吃某樣，到了才發現排隊太長。
3. 兩人邊走邊換主意，呼應「共同決策」但保持輕。
4. 她記得男主上次提過不吃／喜歡什麼。
5. 玩家可以注意到她記得，但不要把它說成重大浪漫證據。
6. 經過一個小攤位遊戲，她意外熟練，第一次明顯有「我贏了」的孩子氣。
7. 男主輸掉／被她吐槽。
8. 人潮突然變密，兩人距離自然縮短。
9. 身體互動 choice 出現：讓她走內側、短暫扶手臂、直接牽手。
10. 許棠的反應依 trust/reciprocal signal 不同。
11. 如果直接牽手過早，她不是戲劇性甩開，只會抽回手並繼續走，氣氛短暫變薄。
12. 若時機成熟，短暫接觸可以停留一秒，再自然放開。
13. 最後兩人帶著小戰利品回家，仍住在同一層。

**Choice forks**
- safety-aware but non-possessive：小幅 trust。
- physical escalation matched to state：chemistry。
- push beyond reciprocity：`xt_boundary_strikes +1`。

**Rejoin**
夜市結束後兩人都能正常說晚安；單次失誤不斷線。

**Exit state**
- 更新 `xt_physical_comfort`。
- repeated push 才可能形成 `xt_physical_push_pattern`。

---

## XT-07 — 電影＋末班捷運

**Entry condition**
- 已有一定 chemistry / familiarity。
- 至少一次真正 1-on-1 outing。

**Immediate setup**
兩人約看一部都有興趣但觀點容易分歧的電影。

**Dramatic job**
測試「不同意也能舒服」，並讓 date-like 氣氛明確上升。

**Scene progression**
1. 電影前短暫吃東西，互動已比早期自然。
2. 散場後許棠先對一個角色做出和男主不同的判斷。
3. 男主本能想辯。
4. 玩家可選擇證明她錯、問她為什麼這樣看、或用玩笑略過。
5. 若真的問，她用一段具體劇情解釋，而不是抽象價值觀。
6. 男主不一定被說服，但開始理解她看重「自己選」。
7. 兩人聊到差點錯過末班車。
8. 車廂很空，疲倦讓對話變短。
9. 兩人坐得比以前近，玻璃倒影比正面更容易注意到距離。
10. 許棠可能把手機畫面給他看，肩膀自然碰到。
11. 若 chemistry 足夠，分開前有一個「是不是已經很像 date」的未說出口感。
12. 仍不告白。

**Choice forks**
- insist on winning：compatibility 降。
- curious disagreement：`K/T +1`。
- avoidance：關係不退，但錯過 deeper connection。

**Exit state**
- attraction signal 可明顯化。
- 為 XT-08 trust conversation 鋪墊。

---

## XT-08 — 河濱：過去

**Entry condition**
- trust 足夠。
- 許棠已看過男主不只 competence 的一點裂縫。

**Immediate setup**
不是「我有創傷要告訴你」。兩人散步時，因一個很小的現在事件提到過去。

**Dramatic job**
讓玩家理解她對 autonomy 的敏感來源，但不妖魔化前任、不把她定義成受害者。

**Scene progression**
1. 河濱傍晚，前半仍是普通聊天。
2. 男主提到某件「我幫你先問好不是比較快？」式小事。
3. 許棠沉默一下，說這句她以前聽過很多次。
4. 她講第一個具體例子：「那個案子不要接。」
5. 再講一個：「妳到了為什麼不跟我說？」
6. 她最初也覺得對方只是關心，問題是每一件都越來越像被接管。
7. 玩家可以直接罵前任、承諾自己不會、或問「最難受的是哪一段？」
8. 若問得好，她不是給 thesis，而是說「到最後我自己都會先想，他會不會不高興。」
9. 男主若立刻保證「我不會」，她只回「大家一開始都不會。」
10. 這句不是攻擊，是她仍保留風險感。
11. 男主可以用自己更具體的行為承諾：例如「那我不替妳決定，妳要我幫再說。」
12. 許棠不給獎勵式感動，只是記住。
13. 回程氣氛比較安靜，但更近。

**Choice forks**
- demonize ex：理解停在表面。
- ask what she fears repeating：`xt_understands_autonomy=true`, `T +2`。
- sweeping promise：neutral；後續看行為。

**Exit state**
- trust gate 通過。
- 後續 XT-09 私人空間合理成立。

# 4. Braided intimacy / core conflict

## XT-09 — 門裡面

**Entry condition**
- Xu trust / compatibility viable。
- relationship 已有明顯 private/date-like momentum。
- 另一 heroine 可同時存在；不影響 scene 主體。

**Immediate setup**
許棠 deadline，男主帶晚餐或順路送一樣她明確知道的東西。她第一次不只站門口，而是說「進來吧」。

**Dramatic job**
私人空間 milestone；測試男主是否能在她的空間裡不接管。

**Scene progression**
1. 門打開時她明顯忙，沒有整理迎客。
2. 男主第一次看到她家真實狀態：工作痕跡、杯子、衣服、紙樣。
3. 許棠自己先說「有點亂」，不是道歉，只是 factual。
4. 玩家可不評論、開乾式玩笑、或下意識幫她整理。
5. 若開始整理，她會很平靜地說「那個先不要動。」
6. 健康路徑是男主把自己的 laptop / 手機拿出來，坐一旁做自己的事。
7. 一段長時間兩人各忙各的。
8. 許棠抬頭問：「你不無聊嗎？」
9. 男主如果說「我又不是來給妳監工」，她會笑。
10. 更核心的 healthy answer 是「我本來也有事做；待這裡就好。」
11. 她第一次理解他不是每次靠近都要求互動回報。
12. 她可能主動把腳勾到他椅邊／把一包零食丟給他，作非常小的 intimacy。
13. 臨走前，她說下次不用帶東西也可以來。

**Choice forks**
- respect space：trust/compatibility。
- playful comment：chemistry。
- reorganize：`K -1`，若有既往 pattern 則 boundary strike。

**Exit state**
- `xt_home_opened=true`。
- healthy path：`T +1~2`。

**Next hook**
兩人已經接近「像情侶但還沒說」；因此 XT-10 的取消才真正有重量。

---

## XT-10 — 沒有去成的星期六

**Entry condition**
- 高 Xu investment。
- 原本已安排一整天近郊行程。
- 過去至少有一次工作小幅打亂私人時間。

**Immediate setup**
出發前或前一晚，許棠的 client crisis 變成必須取消。

**Dramatic job**
第一次讓男主自己的需要成為 conflict。問題不是她工作忙，而是兩人都擅長用各自的方式避免真正談需求。

**Scene progression**
1. 前一晚兩人還在確認集合時間。
2. 當天許棠先傳「可能要晚一點」。
3. 很快變成「今天大概不行」。
4. 她解釋 client 突然要求改一批東西，語氣偏實務。
5. 男主第一反應是說「沒事」。
6. 但玩家知道這次他其實非常期待。
7. Choice A：立刻找人脈／想替她解決 client。
8. Choice B：說「沒事妳忙」後明顯變冷。
9. Choice C：先卡住，最後承認「我知道不是妳故意，但我其實很失望。」
10. 許棠在 A 會感到被接管；在 B 會感到他用沉默懲罰；在 C 也會一開始防衛，因為她把他的需求聽成「妳應該把我排在工作前」。
11. 男主若走 healthy path，也不會立刻完美表達；可以說出一句笨拙的：「我有時候不知道，我算不算是可以麻煩妳的人。」
12. 許棠停住，因為這和她以為的 complaint 不一樣。
13. 她也說錯一句，例如「我不是叫你等我」，傷到男主。
14. 男主回：「我知道。所以我才不知道要不要說。」
15. 兩人都沒有解決。
16. 許棠最後只說自己要先把工作處理完。
17. 通話／訊息結束後，男主把原本準備好的東西收起來。

**Choice forks**
- problem solver：可能累積 `control_pattern`。
- fake respect / withdrawal：`xt_withdrew_when_hurt=true`。
- honest but imperfect：`xt_stated_own_need=true`，仍進 conflict。

**Important**
健康路徑不能立即甜蜜化；否則 XT-11 無意義。

**Exit state**
- conflict active。
- 進 XT-11。

---

## XT-11 — 兩天沒有敲門

**Entry condition**
- XT-10 conflict unresolved。

**Dramatic job**
用 absence 表現關係已經改變；讓 repair 有價值。

**Scene progression**
1. 第一晚，兩人都沒有再發完整訊息。
2. 許棠可能只回一個工作完成的簡短訊息。
3. 男主打出一句「還好嗎」又刪掉。
4. 第二天他經過她門口，第一次明確想到敲門但沒有。
5. 電梯 timing 錯開；生活仍正常，正因正常而顯得空。
6. 若 `xt_withdrew_when_hurt`，男主會合理化自己是在尊重她。
7. 若 `xt_control_pattern` 高，許棠的訊息更正式。
8. 若 healthy path，兩人不是冷戰，只是不知道下一句怎麼說。
9. 一個 very small shared-life cue（她門口的包裹、樓下咖啡、雨聲）提醒 opening。
10. scene 不由玩家用一個「傳訊息道歉」按鈕直接修完。

**Exit state**
- healthy path：repair invitation viable。
- high strikes：Xu may cool toward ordinary-neighbor mode。

**Next hook**
XT-12 必須由許棠主動開第一個縫。

# 5. Repair

## XT-12 — 可以幫我一件事嗎？

**Entry condition**
- Xu repair viable。
- 她仍願意把男主留在生活裡。
- 若 prior control pattern 高，使用 cooler variant。

**Immediate setup**
她有一包印刷樣本必須在特定時間拿，但自己卡在工作。這個需求是 bounded、具體、可拒絕。

**Dramatic job**
讓她主動練習求助；讓男主練習「只做被請求的部分」。

**Scene progression**
1. 許棠先傳「你今天會不會經過 XX？」
2. 男主回覆後，她停一陣。
3. 她打「算了沒事」或準備收回。
4. 男主只問「怎麼了？」而不是自行查。
5. 她才說明樣本要拿。
6. 她把需求講得很清楚：幫拿、放她門口／帶上來；沒有要他替她和廠商處理。
7. 男主 choice：照做、加碼幫處理、因受傷而拒絕。
8. 健康路徑裡，他只是去拿，沒有「順便幫妳都談好了」。
9. 把東西交給她時兩人第一次在 conflict 後真正面對面。
10. 許棠先說「謝謝」後又停住。
11. 她承認自己那天有把他的失望聽成「你要管我」。
12. 男主也承認自己真的有想立刻幫她把 problem 解掉，因為那是他最熟悉的方式。
13. 她說自己有時候只要感覺有人需要她，就會先往後退。
14. 他說自己也會因為怕變成負擔而乾脆不說。
15. 兩人沒有建立新的情侶規則，只先講清楚：要幫就問；不開心也可以說。
16. 她最後把下一個邀約主動留給自己：「那個沒去成的……之後再補？」

**Choice forks**
- 做 exactly requested：`xt_respected_bounded_help=true`, repair 成功。
- over-help：重新觸發核心問題。
-拒絕只是為了報復：repair viability 下降。

**Exit state**
- successful：`xt_repair_completed=true`。
- 可能建立 late invitation。

# 6. Late lock

## XT-13 — 補回來的星期六

**Entry condition**
- HONEST-X 或 DECIDE → Xu。
- repair viable，最好 `xt_repair_completed=true`。

**Immediate setup**
兩人把之前取消的 outing 補回來，但不把它當「考試重來」。

**Dramatic job**
展示 conflict 後真的改變了互動方式：共享 control，而不是誰讓步給誰。

**Scene progression**
1. 出發前兩人一起確認大方向，但刻意不排滿。
2. 中途出現天氣／交通小變化。
3. 男主本能拿出手機想直接重新規劃。
4. 許棠也本能說「隨便都可以」，兩人都意識到這是舊模式。
5. 男主問她想要什麼；她反問他。
6. 兩人提出不同選項，再一起選一個都不是原計畫的地方。
7. 過程中不談大道理，只讓合作自然發生。
8. 許棠會主動照顧一個男主的小需求，例如知道他餓／累。
9. 男主沒有說「不用」，而是接受。
10. 某一站她自然說：「下一站你決定。」
11. 這句不是 surrender，而是她信任 shared control。
12. 回程時兩人都知道必須談 relationship intent。

**Exit state**
- relationship ready for XT-14 evaluation。

---

## XT-14 — 17樓：說清楚

**Entry condition**
- late Xu lock。
- 主要 conflict 已有 repair or accepted consequence。

**Immediate setup**
回到 17 樓夜間，構圖／情緒呼應開場。這一次兩人不是陌生鄰居。

**Dramatic job**
讓男主停止用「看妳」逃避 commitment；也讓許棠主動說自己要什麼。

**Scene progression**
1. 兩人走到各自門前，像很多次一樣應該說晚安。
2. 誰都沒有立刻開門。
3. 許棠先提「我們最近好像一直……」但說不完整。
4. 男主可再次用「妳覺得呢」把決定推回去，也可說清楚自己的 intent。
5. 健康 romance path：他說自己想正式成為戀人，不要求她放棄獨立、不保證永遠不犯錯。
6. 許棠不立刻答「好」，而是問一個很具體的 concern，例如「那你不高興的時候會說嗎？」
7. 男主承認自己大概還是會先說沒事，但願意不要把沉默當尊重。
8. 她也承認自己可能還是會先往後退。
9. 兩人把 relationship 定義成可以持續協商的東西，不是完美安全區。
10. Friend intent：玩家明確說珍惜她但不想升級，許棠可接受，前提是前面不是欺騙。
11. Distance intent / low trust：她不再要求繼續靠近。
12. Good path 中，許棠也必須主動把關係說出口，而不是被告白後被動點頭。
13. First kiss 要在雙方 intent 清楚後，安靜、互相靠近。

**Exit**
- evaluation → XT-G / XT-F / XT-D。

# 7. Xu endings

## XT-G — Good：隔壁

**Meaning**
兩人沒有「治好」彼此，只建立一個能說需求、能問 support mode、能共享決策的關係。

**Resolution beats**
1. 17樓 first kiss。
2. kiss 後有一點不熟練的笑，不走煙火式高潮。
3. 許棠開自己門前停一下，問他明天要不要一起吃早餐／咖啡。
4. 男主沒有把「交往」變成搬家、交鑰匙、全面共享行程。
5. Ending card 留在「隔壁」這個意象：距離仍存在，但不再等於隔離。

**Unlock**
XT-AF-01 → 03。

---

## XT-F — Friend：樓下？

**Entry patterns**
- trust/compatibility 高，但 romance intent 不一致；
- repair 成功，但其中一人不 ready；
- 玩家明確選 friendship。

**Resolution beats**
1. 17樓對話仍誠實。
2. 一方說不想因為「已經很重要」就硬把它變戀愛。
3. 另一方沒有用「那以前算什麼」逼迫。
4. 幾天後由普通訊息證明關係沒有消失。
5. 最後以「要不要下樓喝咖啡？」作 closure。

**Important**
不要用曖昧 kiss 或「其實馬上就會在一起」否定 Friend ending。

---

## XT-D — Distance：17樓

**Entry patterns**
- repeated boundary/control pattern；
- repair 被拒絕或失敗；
- deception 後無法恢復 trust；
- 玩家明確選擇距離。

**Resolution beats**
1. 關係回到禮貌鄰居。
2. 不 block、不大吵、不搬家。
3. 電梯到 17 樓仍會點頭。
4. 最大差別是再也不敲門。

# 8. Xu Good After Story

## XT-AF-01 — 今晚不用回隔壁

**Entry**：Good 後 1–2 週。

**Dramatic job**
把「正式交往」轉成 reciprocal physical intimacy；不再當攻略考試。

**Progression**
1. 普通晚餐／工作／電影夜。
2. 兩人已自然分享沙發與生活用品。
3. 到該散場時，因只隔一道牆，兩人都可以很容易逃回自己家。
4. 這次許棠主動說出「你可以不用回去」。
5. 男主停一下，確認她是真的希望他留下。
6. 她可以吐槽他突然變得太正式。
7. 兩人更長地接吻、擁抱，中間有笑場或停頓。
8. `sfw` 在 intent 清楚後 fade-to-black。
9. 次日直接進 XT-AF-02。

**State**：`xt_first_stayover=true`。

---

## XT-AF-02 — 星期日早晨

**Dramatic job**
用 domestic intimacy 給 Good Ending reward，同時證明兩人仍是兩個完整生活。

**Progression**
1. 清晨自然醒。
2. 許棠不是工作／約會狀態。
3. 她自己找咖啡，開始把男主家當可自然使用的空間。
4. 她吐槽冰箱、咖啡豆或浴室順序。
5. 兩人可以有短吻、背後靠一下、搶被子等輕 intimacy。
6. 手機各自出現工作／生活訊息。
7. 沒有人因「交往」就取消自己的安排。
8. 最後約定晚上或下週再見，完全不需要戲劇化。

**State**：`xt_morning_routine_seen=true`。

---

## XT-AF-03 — 一個月後：留位置

**Dramatic job**
回答「兩個獨立的人交往後怎麼相處」。

**Progression**
1. 時間跳一個月。
2. 男主家有她固定喝的東西；她家有他的杯子／充電線。
3. 兩家仍分開。
4. 某天兩人各自忙，一方直接說今天只想安靜待著。
5. 另一方不把這解讀成拒絕。
6. 另一個晚上，男主直接說自己其實想有人陪。
7. 許棠沒有把需求當控制。
8. ending 用非常普通的下一個邀約收尾，例如「晚點來我這？」。
9. 這是 route theme 的完成：可以靠近，也保留自己的門。

# 9. Xu codas

## XT-FC — 樓下，還是隔壁

數週後兩人仍能自然敲門、喝咖啡、吐槽工作。scene 不暗示「Friend 只是還沒刷夠好感」；重點是兩人都對現在的位置舒服。

## XT-DC — 又一次電梯

一兩個月後，同一部電梯短暫停頓。兩人因記得第一次而笑一下。電梯恢復，17樓到了，各自回家。沒有 bitter speech；closure 來自「記得，但不再靠近」。
