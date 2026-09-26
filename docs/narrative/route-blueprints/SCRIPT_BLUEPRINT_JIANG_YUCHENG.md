# Script Blueprint — Jiang Yucheng / 江雨澄 Route

> Lifecycle: **CANONICAL**
>
> Version: 0.1
>
> Updated: 2026-09-26
>
> Scope: JYC-05 → JYC-14 + Jiang endings / after story / codas.
>
> Parent sources: `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`, `PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`.

# 1. Route dramatic spine

江雨澄線不是「成熟男主把內向女孩帶出舒適圈」，而是兩個都很會 hiding、只是 hiding 方式不同的人，逐步讓彼此看到完整版本。

江雨澄：
- 線下在陌生環境慢熱；
- 在線上、熟悉興趣與創作領域非常有主見；
- 匿名不是病，也不是謊言，而是她選擇 visibility 的工具；
- 她真正害怕的是：別人喜歡一個 imagined creator，卻不喜歡現實的自己。

男主：
- 看起來比她 social-functional；
- 但遇到脆弱時會躲進工作、能力、實務答案；
- 他若要求她「勇敢一點」，必須同時面對自己其實也在逃。

Good route 的完成不是她變外向，而是：
- 她能選擇何時被看見；
- 男主能說自己真正想要的是 offline + online 都存在的關係；
- 她不需要在男主面前切換成兩個版本。

# 2. Early route

## JYC-05 — ACG：她的主場

**Entry condition**
- 已有 `contact_jyc=true`。
- 可作 OPEN-A 第一或第二個 major slot。
- 她和男主已有穩定線上聊天，但 offline 仍偏克制。

**Immediate setup**
兩人因一個限定展／地下街活動約出來。這次是明確共同興趣，不是男主陪她做「她的宅興趣」。

**Dramatic job**
第一次讓玩家在線下看到「Online JYC」的同一人格，只是出現在她熟悉的場域。

**Scene progression**
1. 兩人在入口碰面，她一開始仍有一點客人模式。
2. 進到展區後，她很快走到男主前面，自然開始講版本、設定、作者差異。
3. 她會直接否定男主一個錯誤記憶，語氣和 Discord 上一樣。
4. 男主第一次被她帶路，而不是反過來。
5. 她在某個收藏／版本判斷上明顯比他強。
6. 玩家可以認真跟上、裝懂、或一直稱讚她「好厲害」。
7. 真正好的 interaction 是具體參與她的判斷，而不是把她當可愛導遊。
8. 和店員互動時她偶爾卡一下，但能自己處理。
9. 若男主一看到她停頓就替她答，她會接受結果，但事後變安靜一點。
10. 一個小周邊／抽選提供純 reward beat；她可能因抽到東西真的高興。
11. 結束時她主動提「下次有另一個……」，但又改口說只是隨便講。
12. 男主若自然接住，不必把邀約放大成 confession。

**Choice forks**
- 讓她帶路：`jyc_seen_in_element=true`, `K +2`。
- 真正參與：chemistry。
- 代替她社交：`T -1`；若重複才形成 pressure pattern。

**Rejoin**
都以「線下的她開始更像訊息裡的她」結束。

**Next hook**
線上 co-op 從共同興趣自然延伸到 JYC-06。

---

## JYC-06 — Gaming Night

**Entry condition**
- JYC-05 或足夠 familiarity。
- 線上已玩過一兩次。

**Immediate setup**
原本只是線上 co-op；因設備、新遊戲、延遲或想看同一畫面，最後改成男主家同空間玩。

**Dramatic job**
建立江雨澄版本的 domestic intimacy：她不是被照顧，而是在安全空間裡把完整 personality 放出來。

**Scene progression**
1. 她到男主家時明顯先進入「第一次去別人家」模式。
2. 鞋子、包包、坐哪裡都很規矩。
3. 男主不特別招待到讓她更緊張，只簡單交代飲料／網路／controller。
4. 遊戲開始五到十分鐘後，她逐漸忘掉客人模式。
5. 她開始吐槽男主操作，甚至搶主導。
6. 若男主故意讓她，她很快看出來並嫌棄。
7. 若男主一直教，她會用線上的語氣反擊：「你先顧好你自己。」
8. 最有 chemistry 的路徑是兩人真的競爭。
9. 中途可能一起叫外送；誰點什麼都保持普通生活感。
10. 遊戲結束後沒有立刻送客，兩人各自滑手機／看內容。
11. 這段安靜不是尷尬；她甚至可以把腳縮上沙發、抱靠枕。
12. 她突然意識到時間晚了，短暫恢復客人模式。
13. 男主不拿「這麼晚了」暗示留宿，只正常送她離開。
14. 她回家後在線上丟一句比平常更自然的吐槽，證明 intimacy 沒有因出門而 reset。

**Choice forks**
- 認真競爭：chemistry。
- 故意讓：`K -1`。
- 一直指導：`K -1`。
- 接受她強：`K +1`。

**Exit state**
- `jyc_home_space_comfort=true`。

**Next hook**
此 scene 使 SH-01「從男主家離開時撞見許棠」合理。

# 3. Midgame ordinary dating and vulnerability

## JYC-06B — 雨天改行程

**Entry condition**
- JYC familiarity 足夠。
- 至少一次 1-on-1 outing。
- 不要求 alias arc 已開。

**Immediate setup**
原定戶外／展覽因雨或排隊臨時失敗。

**Dramatic job**
證明兩人的關係不只建立在 ACG；把話題拉到研究所、家庭、未來與男主回台北的原因。

**Scene progression**
1. 原行程取消，兩人站在騎樓下看雨。
2. 男主提幾個替代方案，江雨澄也提出一個很普通的選擇：書店、漢堡、小店。
3. 兩人最後沒有追求「最好的約會」，只是找地方坐。
4. 因沒有活動可聊，第一次真正聊到研究所與畢業。
5. 她對未來有不確定，不被寫成「等男主給方向」。
6. 她問男主為什麼回台北。
7. 男主先答 practical version：工作遠端／哪裡都能做／家人或生活方便。
8. 她停一下說：「這不是答案吧。」
9. 玩家可以繼續打太極、反問她、或承認自己其實也不知道。
10. healthy path 不需要 traumatic confession；只要說出「我那時候想換個地方，但我也不知道是不是在逃」之類的不確定。
11. 江雨澄沒有立刻安慰，反而覺得他第一次不像「什麼都有答案」。
12. 雨停後兩人都沒有急著走，形成 ordinary-date intimacy。

**Choice forks**
- practical deflection：保留 mask。
- 真正承認 uncertainty：`T_JYC +1`。
- 把問題丟回她：若語氣 defensive，connection 降低。

**Exit state**
- `jyc_saw_practical_deflection=true`。
- healthy variant 開始讓她看穿男主。

---

## JYC-07 — 那個帳號

**Entry condition**
- trust 足夠。
- 男主已看過她多次作品／聊天內容。
- alias discovery 必須有可信線索，不可神推理。

**Immediate setup**
男主逐步意識到她可能就是自己以前看過的一個小型匿名插畫帳號。

**Dramatic job**
把 visibility / identity 變成真正的 vulnerability；測試玩家是否尊重她決定揭露程度的權利。

**Scene progression**
1. 男主先注意到一個畫風習慣，沒有立刻確定。
2. 後來一個簽名方式／用詞／曾提過的小細節再次重合。
3. 玩家開始有三種行為空間：等、私下問、在別人面前直接說。
4. 等她自己說的路徑：下一次聊到作品時，她會主動把帳號連結丟來，然後很快補一句「不要轉給別人」。
5. 私下確認路徑：男主先說自己只是猜，如果她不想談就當沒問。
6. 她會短暫緊張，然後問「你什麼時候發現的？」
7. 公開提起路徑：即使旁人沒有惡意，她也會迅速關閉話題。
8. healthy conversation 進入她真正擔心的部分：不是作品被嫌，而是別人對帳號建立了想像。
9. 她可能說：「網路上那個人比較好聊。」
10. 男主若回「那不也是妳嗎」，不要立刻解決；她會反問：「你是因為現在認識我才這樣說。」
11. 她承認自己喜歡匿名提供的 control。
12. 男主最健康的回應不是勸她公開，而是尊重「妳想讓誰知道，本來就可以自己選」。

**Choice forks**
- 等她說：`jyc_alias_private=true`, `T +2`。
- 私下確認：`T +1`。
- 公開曝光：`jyc_alias_exposed=true`, `pressure_strike +1`, `T -3`。

**Rejoin**
帳號存在繼續；Good route 不要求她最後公開真名。

**Next hook**
JYC-09 必須在 creator circle 中讓「線上與現實撞上」成為外部壓力。

---

## JYC-08 — 你星期六有空嗎？

**Entry condition**
- JYC familiarity / trust 足夠。
- 她已開始相信男主會尊重自己的 pacing。

**Immediate setup**
她想去一個展／活動，第一次明確想由自己邀男主。

**Dramatic job**
讓她承擔主動追求關係的風險；避免整條 route 都是男主拉她出門。

**Scene progression**
1. 聊天視窗出現 typing，停。
2. 她先問「星期六有空嗎」。
3. 在男主回之前又補活動資訊。
4. 再補一句「沒空也沒關係」。
5. 甚至一度刪掉某一句。
6. 玩家若接受，可以平常地問幾點／哪裡。
7. 若過度放大「妳居然主動約我」，她會立刻退回玩笑。
8. 若拒絕但提供真實理由，她能接受，不把一次拒絕寫成 abandonment。
9. 若模糊拖著不答，才讓她覺得自己不該主動。
10. acceptance 後她可能立刻恢復 online energy，發一長串活動資訊，證明她其實早就想去。

**Exit state**
- `jyc_invited_player=true`。
- healthy acceptance：`T/C +1`。

# 4. Braided intimacy / core conflict

## JYC-09 — Too Many Eyes

**Entry condition**
- creator/alias arc viable。
- alias 已被男主知道或至少 creator identity 有一定暴露。
- 若 `jyc_alias_exposed=true`，scene tension 更高。

**Immediate setup**
creator event 中，一位和她 online 聊過一段時間的創作者逐步認出她。

**Dramatic job**
讓她的 visibility choice 第一次在現實失去部分 control；測試男主是否跟隨她 cue，而不是搶著保護或曝光。

**Scene progression**
1. 活動前段正常，江雨澄狀態甚至不錯。
2. 一位 creator 和她聊作品時覺得某些細節很熟。
3. 對方從 sketchbook／聲音／前文逐步猜，不是 random fan 神認人。
4. 對方說：「等一下，你是不是……」
5. 江雨澄停住；沒有 dramatic panic，只是整個人明顯收起來。
6. 對方看到不舒服後也會收手，因此 conflict 不是惡人。
7. 玩家 response：
   - 直接替她否認；
   - 興奮證實；
   - 看她反應，讓她自己答，必要時自然改話題／帶走。
8. healthy path 中，她自己用一句模糊回答結束，不被男主代替。
9. 離開後 social battery 幾乎歸零。
10. 原定晚餐取消，她只想回家。
11. 男主如果追問「妳還好嗎」太多，她只會說「我想安靜一下」。
12. healthy response 是接受這句話，不把關心變 interrogation。
13. 捷運上兩人安靜坐著；她仍知道男主在旁邊。
14. 到站後她先走，晚點只發一個很短的「到了」。

**Choice forks**
- 替她說謊：仍替她做決定，`K -1`。
- 公開證實：`T -3`, `pressure+1`。
- 跟 cue：`T +2, K +2`。

**Exit state**
- visibility shock active。
- 進 JYC-10。

---

## JYC-10 — 回到螢幕後面

**Entry condition**
- JYC-09 後數日。
- 她仍在線上，不代表 offline 已恢復。

**Immediate setup**
她照常回 meme、遊戲、作品，但拒絕所有 offline 邀請。

**Dramatic job**
核心 conflict 必須雙向：她用 online safety 退回去；男主若把「尊重」當成什麼都不說，也在 hiding。

**Scene progression**
1. 前幾天線上互動看起來幾乎正常。
2. 男主邀吃飯，她說最近累。
3. 再一次邀約，她又用合理理由推掉。
4. 男主開始不確定：她是在休息，還是把自己退回純 online。
5. choice A：「妳不能一直逃。」
6. choice B：「那以後都 online 就好。」
7. choice C：承認「我不知道怎麼問才不會像在逼妳，但我其實想見妳。」
8. A 讓她覺得被當問題修。
9. B 表面尊重，實際上也否認男主自己的需求。
10. C 仍可能讓她不舒服，但給她真實資訊。
11. 她反問男主：他不舒服時是不是也都跑去工作。
12. 男主先否認／合理化。
13. 她指出：「你只是比較不會被看出來。」
14. 這句打到男主，因為 XT-05/雨天 scene 已可能有類似 evidence。
15. 男主可以第一次承認「對，我也會。」
16. 她不因此立刻答應出門。
17. 她說自己現在還是不想見很多人。
18. 男主 clarify：他不是要她見很多人；他只是需要知道兩人的關係不能永遠只存在螢幕裡。
19. 她沉默，沒有答案。
20. conversation 以 unresolved 但更誠實收尾。

**Choice forks**
- pressure：`T -2`。
- total retreat：`K -2`。
- honest need：`jyc_stated_offline_need=true`, `K +2`。

**State**
- `jyc_named_competence_mask=true`。
- 進 JYC-11。

---

## JYC-11 — Offline

**Entry condition**
- JYC-10 unresolved。

**Dramatic job**
用「明明在線，卻沒有說話」表達 heartbreak；不靠大量旁白。

**Scene progression**
1. Discord 顯示她 online。
2. 男主打開對話框。
3. 看見上一次 conversation 停在一個普通 meme，而不是吵架最後一句。
4. 他打字，刪掉。
5. 她的 status 一度切 game / idle，證明她生活正常進行。
6. 若 trust 高，她偶爾仍丟一個很短的內容，但沒有 offline invitation。
7. 若 trust 低，連 online frequency 都下降。
8. 男主第一次體會「尊重空間」和「什麼都不做」之間的差別。
9. scene 不讓玩家靠 spam messages repair。
10. 留白後由她在 JYC-12 主動回來。

**Exit state**
- healthy path：repair viable。
- high pressure pattern：可能只剩 cool/friend/distance version。

# 5. Repair

## JYC-12 — 我想試一次

**Entry condition**
- repair viable。
- 先前已 foreshadow prints / 小誌 / creator gathering。
- 她自己對這件事有既存目標。

**Immediate setup**
幾天後她主動聯絡，說自己決定參加一個很小的 creator gathering。

**Dramatic job**
她主動選擇增加 visibility，但掌握條件；男主學習「在附近」而不是「守著她」。

**Scene progression**
1. 她先傳活動資訊，沒有先談兩人 conflict。
2. 她說自己報名了。
3. 男主確認她是自己想去，不用問「是不是為了我」。
4. 她明確說仍用筆名、不公開 real identity。
5. 接著才說：「你可以來。」
6. 很快補：「但你不要一直站我旁邊。」
7. 這句可以帶一點她熟悉後的吐槽，證明 relationship 有恢復。
8. 活動當天她自己 setup、自己處理大部分互動。
9. 男主 choice：
   - 在附近，需要時才回來；
   - 全程守攤；
   - 替她招呼／代答。
10. healthy path 中，男主去附近逛／做自己的事。
11. 她需要短暫 break 時自己傳訊息叫他。
12. 他回來只帶水／陪她坐一下，不總結「妳今天做得很好」像 therapist。
13. 她主動說這次比想像中累，但不是後悔。
14. 兩人順勢談回前一次 conflict。
15. 她承認自己那幾天確實只想躲回螢幕後面。
16. 男主承認自己差點用「尊重」假裝自己不需要她出現在現實。
17. 她說她還是需要可以退回線上的日子。
18. 男主說可以，但不想讓那變成唯一版本。
19. 她接受這個差異，不承諾變外向。

**Choice forks**
- bounded support：`T +2, K +2`, repair。
- hover：`K -1`。
- speak for her：`T -1`。

**Exit state**
- `jyc_repair_completed=true` if successful。
- late invitation viable。

# 6. Late lock

## JYC-13 — 散場

**Entry condition**
- HONEST-J 或 DECIDE → JYC。
- creator table 已發生。
- repair viable。

**Immediate setup**
活動結束後她已經耗盡 social battery，但不想立刻把這一天關掉。

**Dramatic job**
讓她主動在 offline 世界延長相處；把「我現實的自己不值得喜歡」說到最接近核心的位置。

**Scene progression**
1. 收攤時她話很少，動作機械。
2. 男主幫忙的範圍只限她明確接受的部分。
3. 捷運上兩人並排坐，長時間不說話。
4. 出站後照理各自回家。
5. 她走幾步又停下，說：「我還不想回去。」
6. 兩人去便利店買飲料，在雨後騎樓坐一會。
7. 她承認今天被人看到、被喜歡作品、又被看見本人，感覺很奇怪。
8. 她說自己一直覺得「帳號裡那個人比較好」。
9. 男主若只回「現實的妳也很可愛」，她會笑一下但指出這不是她問的。
10. healthy path：男主說自己其實從沒把 meme、畫圖、線下停頓分成兩個人；只是不同情境下的同一個她。
11. 她反問：「那我一直不講話的時候呢？」
12. 男主可以說那也是她，不需要每次提供好玩的版本。
13. 反過來，她指出男主也不必每次提供可靠、有答案的版本。
14. 兩人坐到很晚，conversation 不是 confession，但已經沒有 early-route 的遮罩。
15. 她最後不是被送回去，而是自己說「走吧」，兩人一起站起來。

**Exit state**
- readiness for JYC-14。

---

## JYC-14 — 雨後：說清楚

**Entry condition**
- late JYC lock。
- core conflict 已 repair or accepted consequence。

**Immediate setup**
從 JYC-13 同一晚自然延續，不需要另造大事件。

**Dramatic job**
把 relationship intent 說清楚：男主要的是 online + offline 都存在；江雨澄也必須主動選擇，不是被成熟男主收下。

**Scene progression**
1. 兩人準備分開，雨後街道很安靜。
2. 男主如果只說「我們就像現在這樣也很好」，會再次把決定留在模糊地帶。
3. romance intent：他明確說想成為她的戀人。
4. 他 clarify：不是要求她公開帳號、不是要求她更 social。
5. 他要的是她想躲回線上時可以說，但兩人不假裝只有線上版本。
6. 江雨澄聽完會緊張、停頓，不立刻「嗯」。
7. 她反問一個非常實際的問題，例如「那我有時候不想出門呢？」
8. 男主答「那就不出門」，但加上「只是不要讓我猜你是不是不想見我。」
9. 她第一次自己說出需求：「那你也不要每次都說沒事。」
10. 男主承認大概還是會有第一次「沒事」，但可以學著第二次說真話。
11. 她因這個不完美答案反而放鬆。
12. Friend intent：可明確珍惜但不升級。
13. Distance intent / low trust：她選擇保留 online or public-only distance。
14. Good path 中，她不是被動等吻；可以用一句「現在是不是……」或乾脆往前半步。
15. first kiss 在雙方 intent 清楚後發生。

**Exit**
- evaluation → JYC-G / JYC-F / JYC-D。

# 7. Jiang endings

## JYC-G — Good：沒有第二個帳號

**Meaning**
她仍保留筆名、privacy、slow social battery；改變的是在男主面前不必維護「線上比較值得喜歡」的分裂。

**Resolution beats**
1. first kiss 後她可能因緊張先吐槽一句，保留她本來的人格。
2. 男主不把這當「終於攻略成功」。
3. 她回家後仍會發訊息，但內容可以是「你明明剛剛就在旁邊」式日常。
4. ending title 指向：她不需要第二個人格，不是不用匿名。
5. Unlock JYC-AF-01 → 03。

---

## JYC-F — Friend：先給你看

**Entry patterns**
- trust 很高但 romantic readiness 不一致；
- 她不確定答應戀愛是不是因害怕失去男主；
- 玩家明確選 friendship。

**Resolution beats**
1. 她把這個疑問說出來。
2. 玩家若尊重「那就不要現在答應」，關係反而穩定。
3. 沒有 consolation kiss。
4. 幾天後她傳新作品：「先給你看。」
5. 這句成為友情版本的完整 payoff。

---

## JYC-D — Distance：最後上線

**Entry patterns**
- repeated pressure pattern；
- alias exposure + refusal to own it；
- deception trust collapse；
- 玩家明確選 distance。

**Resolution beats**
1. 訊息慢慢變少，不需要 dramatic block。
2. 她逐漸只保留公共／作品層面的互動。
3. 某天匿名帳號換 handle。
4. 男主之後看到熟悉畫風，但不再確認。

# 8. Jiang Good After Story

## JYC-AF-01 — 最後一班車之後

**Entry**：Good 後 1–2 週。

**Dramatic job**
把 online/offline integration 推到身體距離與留宿；她必須有主動權。

**Progression**
1. 兩人在男主家 gaming / 看電影。
2. 距離比 JYC-06 自然很多。
3. 她先看到時間，知道末班車快到了。
4. 男主不拿交通當 forced-stay excuse。
5. 她看著時間停一下，主動說「我今天不急著走。」
6. 兩人都知道意思比「再打一局」多一點。
7. 她可能用吐槽掩飾緊張：「你現在怎麼突然不講話。」
8. 男主用短句確認她的意思，不變成 formal consent lecture。
9. 她也明確回應。
10. physical intimacy 升級，仍允許停頓、笑場、她主動拉近。
11. `sfw` fade-to-black / 關燈後接 next morning。
12. 不用「錯過末班車」替她做決定。

**State**
- `jyc_first_stayover=true`。

---

## JYC-AF-02 — 不用切換帳號

**Dramatic job**
最直接的 personality integration reward。

**Progression**
1. 次日早晨或週末白天。
2. 她頭髮亂、穿普通借來衣物／自己的居家服。
3. 線下開始完整出現 Discord 版嘴賤節奏。
4. 她搶 controller、吐槽男主早餐、躺在沙發另一端。
5. 最代表性的 beat：她傳一個 meme 給「明明就在旁邊」的男主。
6. 男主看手機，再看她。
7. 她忍笑說「有差嗎？」
8. 兩人一起笑。
9. 不需要任何「妳現在終於做自己」的總結台詞。

---

## JYC-AF-03 — 公開前先給你看

**Dramatic job**
回答她的創作、privacy、relationship 能否共存。

**Progression**
1. 一個月後，她完成新作品。
2. 她仍用筆名，仍控制公開方式。
3. 她把未公開版本先給男主看。
4. 不是請他批准，也不是求 reassurance，只是想和戀人分享。
5. 男主先正常看作品，再給具體 feedback。
6. 她可以不同意他的意見，證明 relationship 沒把創作變成 validation loop。
7. 男主旁邊也在做自己的工作。
8. 她發布作品。
9. 幾秒後又傳一個 meme 給坐在旁邊的男主。
10. route 以「線上和線下自然疊在一起」收尾。

# 9. Jiang codas

## JYC-FC — 先給你看：幾週後

她以朋友身份自然邀男主去 creator event，沒有 romantic obligation。新作品仍會先傳給他；這是信任留下，而不是 Good ending 的殘缺版。

## JYC-DC — 新 handle

幾週／幾個月後，男主在網路上看到一張很熟悉的畫。帳號名稱已變，他沒有再去確認。closure 來自尊重她最後保留下來的距離。
