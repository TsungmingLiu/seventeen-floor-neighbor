# Script Blueprint — Overlap / Commitment / Endings

> Lifecycle: **CANONICAL**
>
> Version: 0.1
>
> Updated: 2026-09-26
>
> Scope: TENSION → COMMIT → HONEST-X / HONEST-J / BOTH-H / BOTH-L → OV / SHURA → DECIDE → late-route handoff + BOTH-D.
>
> Parent sources: `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`, `PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`.

# 1. What this branch is about

這一段不是「修羅場玩法」，而是男主共通弧線的真正 payoff：

> 他習慣用能力與模糊處理不確定，也習慣保留 option。當兩段關係都變得重要時，繼續不做選擇本身就開始傷人。

核心區分：

- **honest overlap**：尚未 exclusivity，兩邊都知道狀況。可能尷尬、可能有人退出，但不是 moral failure。
- **deceptive overlap**：男主為了維持兩邊，說了可追溯的謊、製造互相矛盾的印象，或在已有 commitment 後繼續隱瞞 escalation。
- 女主真正受傷的點必須回到各自人物弧線，而不是「你怎麼可以同時喜歡兩個人」。

# 2. TENSION — Relationship Tension Check

**Kind**：state gate；不作 player-facing scene。

**Inputs**
- 兩邊 F/T/C/K；
- romantic signals；
- recentFocus；
- conflict / repair 狀態；
- boundary / pressure patterns；
- knowledge flags；
- exclusivity；
- deception / rebound evidence。

**Outputs**
1. **只有 Xu repair invitation viable**
   - 不製造假的同日 collision。
   - 直接把故事推向 Xu late focus。
   - JYC 若仍重要，可有 honest closure / Friend / Distance variant。
2. **只有 JYC viable**
   - 鏡像處理。
3. **兩邊都 viable**
   - 進 COMMIT。
4. **兩邊 romantic viability 都低**
   - 可以提早讓 relationship intent 收斂到 Friend/Distance。
   - 不需要硬演一場 COMMIT 才讓玩家失敗。

**Authoring rule**
TENSION 只決定「哪些後續合理」，不應偷偷替角色生成 knowledge。

# 3. COMMIT — 同一個星期六

**Entry condition**
- XT-12 / JYC-12 的 late invitations 都成立。
- 玩家對兩邊都有足夠深度，使同一個星期六真的有意義。

**Immediate setup**
兩個 invitation 都是各自 arc 的 payoff：
- 許棠：補回 bounded-support 後真正由兩人共同規劃的一天。
- 雨澄：她主動參與的小型 creator table，需要男主以她指定方式出現。

兩者不應被寫成一個「重要活動」和一個「可隨便取消活動」，否則 choice 失去重量。

**Dramatic job**
第一次把「我可以晚點再決定」變成不可能。

**Scene progression**
1. 玩家先收到其中一個已確認的邀約。
2. 另一個邀約晚些到達，時間明確衝突。
3. UI / narration 不顯示 heroine score 或 moral hint。
4. 男主短暫嘗試想 logistics：能不能都去、能不能前後切。
5. 逐步明確這不是交通問題，而是兩邊都需要他真正 উপস্থিত在場。
6. 玩家可選四種行為：
   - 向雨澄說明自己已答應許棠，選 Xu。
   - 向許棠說明自己已答應雨澄，選 JYC。
   - 坦白自己和另一人也走得近，要求重新協調／承認還沒決定。
   - 對兩邊都說「沒問題」，刻意讓彼此以為自己是唯一安排。
7. 男主在前三種裡都必須承擔 awkwardness；不能因「誠實」就免費獲得理解。
8. 第四種需要明確存在 deception，不只是「我想都參加」。

**Exit**
- HONEST-X
- HONEST-J
- BOTH-H
- BOTH-L

# 4. HONEST-X — 坦白選許棠

**Dramatic job**
late lock 的品質取決於男主如何結束另一邊的 romantic ambiguity，而不是按下「Xu route」。

**Progression**
1. 男主先回覆雨澄，而不是消失。
2. 他說自己那天已答應許棠。
3. 若和雨澄關係已深，他需要再多說一句：自己不想用工作／臨時有事敷衍她。
4. 不必交代完整 dating history，也不能過度 detail 讓對方承擔他的 guilt。
5. 雨澄若早已知道許棠很近，會更快理解，但仍可能受傷。
6. 若她不知情，會有「原來是這樣」的安靜停頓。
7. 她可問「你是已經決定了嗎？」。
8. 男主如果已決定，就必須說「是」；不能再回「我也不知道」。
9. 她不必祝福，也不必翻臉。
10. 高 trust 路徑可保留 friendship；低 trust / 高 ambiguity 可變 distance。
11. 男主之後去找許棠時，情緒不是「贏了」，而是第一次真正做了一個會失去 option 的選擇。

**Exit**
- Xu late lock → XT-13。
- JYC closure variant recorded。

# 5. HONEST-J — 坦白選雨澄

**Dramatic job**
鏡像 HONEST-X，但許棠的傷點不同：她不要求男主報備，但會介意自己被長期放在模糊狀態。

**Progression**
1. 男主主動告訴許棠自己已答應雨澄。
2. 不用「公司有事」這種假理由。
3. 若 Xu relationship 深，她會先很平靜地確認：「所以你是決定了？」
4. 男主若回答清楚，她接受這個資訊。
5. 她可能說自己不喜歡的是「如果你其實已經知道，還讓我猜」。
6. 若此前玩家一直 honest，這句會較輕；若曾模糊，較重。
7. 她不以鄰居身份威脅未來生活。
8. 高 trust 可保留 ordinary friendship / neighbor connection。
9. 男主離開時知道自己真的關掉一個可能性。

**Exit**
- JYC late lock → JYC-13。
- Xu closure variant recorded。

# 6. BOTH-H — 兩邊都說實話

**Entry meaning**
玩家承認：
- 尚未 exclusivity；
- 確實與另一位也走得近；
- 自己還沒做完決定。

這不是「後宮選項」，而是選擇把 ambiguity 從隱藏狀態變成共享資訊。

**Dramatic job**
測試玩家是否能接受：誠實不等於所有人都願意繼續等。

**Progression**
1. 男主分別對兩人說清楚，不建議三人一起談。
2. 許棠的第一反應是確認她是否一直被放在不知道規則的狀態。
3. 雨澄的第一反應是確認男主之前說過的私人話是否仍是真的。
4. 若玩家過去其實沒有說謊，兩人都可能認為狀況很不舒服，但不等於 betrayal。
5. 某一位可以降低主動、要求男主自己想清楚。
6. 某一位也可以說她暫時不想知道更多 detail。
7. 玩家沒有「說對話術」可以讓兩人都開心。
8. state 進 `overlapLevel=1`, `deception=false`。
9. 之後以時間、注意力、對比與 knowledge asymmetry 形成 OV-01 / OV-02。
10. 若其中一位在此直接退出 romantic possibility，DECIDE 可縮短，不硬保留三角形。

# 7. OV-01 — Overlap：時間與注意力

**Entry condition**
- BOTH-H。
- 至少兩邊仍保留 romantic viability。

**Dramatic job**
讓 honest overlap 有真實成本，不必靠大事件。

**Scene structure**
OV-01 可以是一組 3–5 個短 vignette，而不是一個長 scene。

**Vignette A — overlapping notifications**
1. 男主正在和一位聊天，另一位訊息進來。
2. 玩家可以稍後回，但開始意識到自己每次都在分配注意力。

**Vignette B — calendar friction**
1. 一位提出平日晚餐。
2. 另一位同週已有 arrangement。
3. 沒有誰做錯，但時間真的不夠。

**Vignette C — comparison**
1. 男主在某個 moment 下意識把兩種相處方式拿來比較。
2. narration 不下 verdict，只讓玩家看到自己在比較。

**Vignette D — reduced initiative**
1. 知情後，某 heroine 比以前少主動一次。
2. 不是 manipulation，而是把選擇權放回男主。

**Vignette E — self-recognition**
男主第一次意識到自己一直想等到「答案自然浮現」，但這種等待本身也在消耗別人的時間。

**Exit**
- 進 OV-02。

# 8. OV-02 — 三人同場：誰知道多少？

**Entry condition**
- honest overlap；
- knowledge flags 可能 asymmetric。

**Immediate setup**
咖啡店／creator event follow-up 等合理場合，三人短暫同場。

**Dramatic job**
把「大家知道多少」具象化，但不爆炸。

**Scene progression**
1. 兩位女主都知道對方存在；知道多深依 flags。
2. 三人先有普通話題，證明她們不是只剩競爭身份。
3. 某個自然細節揭露一段 shared memory。
4. 若另一位早知道，只是安靜接住。
5. 若她不知道，會有一秒停頓。
6. 男主 instinct 可能想趕快解釋。
7. healthy behavior 是只補必要資訊，不把兩人當需要安撫的局面。
8. 許棠與雨澄可直接彼此說話，不要求男主翻譯。
9. 她們不聯手審判男主，也不互嗆。
10. 最 uncomfortable 的 moment 是男主看到兩段關係在同一空間都是真實的。
11. 場面自然結束後，其中一位可說：「你應該想清楚了。」
12. 另一位未必要說同一句；角色語氣保持不同。

**Exit**
- DECIDE。

# 9. BOTH-L — 兩邊都答應並隱瞞

**Entry meaning**
必須有具體 deception，例如：
- 對兩邊都說自己整天只有她；
- 編造工作／家庭理由遮掩另一個 date；
- 已有 exclusivity 卻繼續同等 romantic escalation。

**Dramatic job**
把男主核心 flaw 推到最差版本：他用 logistics 以為可以延後 choice，結果變成 truth problem。

**Progression**
1. 男主先安排「兩邊都去」。
2. 一開始可能真的看起來能運作。
3. 他需要切換訊息語氣、時間、地點。
4. narration 顯示壓力來自維持兩個不同版本的 truth。
5. 一個 small inconsistency 出現，例如時間、照片、地點、突然離開。
6. 玩家仍有最後一次提前坦白的 escape hatch；若使用，可降級回 honest-overlap repair，而不是一定 SHURA。
7. 若繼續隱瞞，進 SHURA-01。

**Exit state**
- `deception=true`
- `overlapLevel=2`

# 10. SHURA-01 — 撞見

**Tone**
安靜、都市、難堪；不 slapstick、不兩女爭男。

**Immediate setup**
其中一位在一個完全合理的地方看見男主與另一位。scene 必須能引用前面具體謊言。

**Preferred default**
男主之前對許棠說「最近工作忙」，實際上正和雨澄在咖啡店／活動後坐著；許棠剛好來。

**Scene progression**
1. 許棠進場，先看見男主。
2. 接著看見雨澄。
3. 若三人以前認識，完全不需要重新介紹。
4. 男主第一個生理反應是站起來／手機放下。
5. 許棠不提高音量，只叫一聲「鄰居」或名字。
6. 她可能對雨澄正常點頭。
7. 她不問「你們什麼關係」，因為真正需要處理的是男主說過的話。
8. 男主如果立刻編第三個理由，trust damage 加深。
9. 最有力的版本是她只說「你們慢慢聊」，然後離開。
10. 雨澄在她離開後也意識到自己可能不知道完整 truth。
11. 她不立刻替男主找理由。
12. scene 結束時兩邊都不是「生氣值」，而是 truth model 被破壞。

**Alternate orientation**
若先對雨澄說謊、由雨澄撞見許棠，保留同樣結構但傷點改成「我以為我知道你給我的是真實版本」。

**Exit**
- relevant major trust damage。
- SHURA-02。

# 11. SHURA-02 — 分開談

**Dramatic job**
把三角形拆回兩段不同關係；避免女主變成共同裁判團。

## Xu conversation

**Her issue**
不是「你不能約別人」，而是：
- 你明明可以說不確定；
- 你卻選擇替我決定我應該知道多少；
- 這和她過去最敏感的「別人替她管理現實」形成 echo。

**Progression**
1. 她先確認一個具體事實：「你那天說你在加班。」
2. 男主如果用「我們又沒 exclusive」辯護，回答不了這個事實。
3. 若他說「我怕妳會不高興」，她會回到 autonomy：那也是替她決定反應。
4. 有 repair chance 的回答不是 perfect apology，而是承認「我不想選，所以我想把兩邊都留著。」
5. 她可以說自己現在不能保證還願意繼續。
6. conversation 以她保留決定權結束。

## JYC conversation

**Her issue**
不是「你也喜歡她」，而是：
- 她已經冒險把更多 offline self 給男主；
- 現在她不知道哪些 conversation 是 truth、哪些是版本管理。

**Progression**
1. 她問一個很具體的矛盾點。
2. 若男主辯稱「妳也沒問」，她會指出 trust 不是靠 interrogation 建立。
3. 若男主說自己怕傷她，她可能回：「所以你決定讓我晚一點再知道？」
4. 有 repair chance 的回答同樣是承認 avoidance，而不是合理化。
5. 她不需要當場決定是否原諒。

**Exit**
- accountability viable → DECIDE with possible repair。
- deflection / blame → BOTH-D or heroine Distance probability sharply rises。

# 12. DECIDE — 不選擇也是選擇

**Entry condition**
- OV-02 或 SHURA-02。
- 也可在特殊 state 下由 long ambiguity 直接進入。

**Dramatic job**
把 structural choice 變成人物行為，而不是 route menu。

**Player-facing options**
1. 明確選擇和許棠繼續，並負責任關閉雨澄 romantic ambiguity。
2. 明確選擇和雨澄繼續，並處理許棠。
3. 承認自己目前不適合進 relationship。
4. 若玩家仍試圖維持模糊／拒絕承擔，兩邊都可退出。

**Scene progression**
1. 男主先獨處，沒有女主替他逼 answer。
2. narration 回收他一路的 pattern：work / practical answers / option keeping。
3. choice wording 應是具體行動，不是 heroine portrait button。
4. 選 Xu/JYC 後，另一邊 closure 必須真的發生。
5. 從 SHURA 進來時，選人不會清空 deception。
6. late Good viability 仍由 heroine-specific repair / trust 決定。
7. 選「不進任何 relationship」不是 coward-only bad end；若誠實承擔，可以進比較成熟的雙 Distance / closure。
8. 繼續模糊則是男主 flaw 的 failure version。

**Exit**
- XT-13
- JYC-13
- BOTH-D

# 13. BOTH-D — 雙 Distance：沒有誰輸

**Entry patterns**
- deception severe + refusal to own it；
- DECIDE 仍維持模糊；
- 或男主誠實承認自己現在不適合 relationship，而兩邊 romantic connection 都結束。

**Dramatic job**
完成男主共通弧線的失去，而不是讓兩位女主一起懲罰他。

**Resolution**
1. 許棠回到禮貌鄰居。
2. 雨澄退回 public creator / distant online space。
3. 男主生活重新很有秩序。
4. 行事曆沒有衝突，手機也安靜很多。
5. 這個「很方便」本身就是 ending 的 bittersweet point。
6. narration 不說「報應」。
7. 最後用一個非常普通的晚上收尾：17樓很安靜，手機沒有新的私人訊息。

**Unlock**
- BOTH-DC。

# 14. BOTH-DC — 春天的17樓

**Time jump**
數週／數月後。

**Progression**
1. 季節變暖。
2. 男主工作與生活都回到穩定節奏。
3. 在 17 樓遇到許棠，兩人正常打招呼。
4. 手機上偶爾刷到似乎是雨澄風格的作品。
5. 他沒有再靠近任何一邊。
6. 重點不是他孤單受罰，而是他終於理解：保留所有 option 並不等於保留所有 connection。
7. ending 在一個平靜、可繼續人生的畫面停下。

# 15. Path-level self-contained playthrough contracts

這一節提供後續 writer / QA 用的「整條線讀起來是否成立」檢查，不取代 scene-level files。

## Path A — Xu-focused honest route

**Recommended spine**
COM opening
→ XT-04
→ XT-05
→ 至少一個 JYC early scene 保持 braided world
→ XT-06 / XT-07 / XT-08
→ SH-02 optional
→ XT-09
→ XT-10
→ XT-11
→ XT-12
→ 若只有 Xu late invite viable，直接 late focus；若雙 invite，COMMIT → HONEST-X
→ XT-13
→ XT-14
→ XT-G / F / D
→ corresponding after story / coda

**Emotional logic**
從「住隔壁很方便」變成「可以靠近但不接管」。中段 conflict 必須證明男主不只是理解她，也要承認自己有需求。

## Path B — JYC-focused honest route

**Recommended spine**
COM opening
→ JYC-05
→ JYC-06
→ SH-01 optional
→ JYC-06B / JYC-07 / JYC-08
→ SH-02 optional
→ JYC-09
→ JYC-10
→ JYC-11
→ JYC-12
→ single viable invite direct late focus or COMMIT → HONEST-J
→ JYC-13
→ JYC-14
→ JYC-G / F / D
→ corresponding after story / coda

**Emotional logic**
從「線上比較容易聊」變成「不同情境的她都是同一個人」。男主也必須停止用 competence 當自己的匿名層。

## Path C — Balanced honest overlap → Xu

**Recommended spine**
兩邊 early anchor
→ SH-01
→ OPEN-B 平衡投資
→ SH-02
→ XT conflict + JYC conflict 都至少部分發生
→ XT-12 + JYC-12
→ COMMIT → BOTH-H
→ OV-01
→ OV-02
→ DECIDE → Xu
→ responsible JYC closure
→ XT-13 / 14
→ Xu ending

**Emotional logic**
玩家不是因 cheat 被懲罰，而是發現兩段真實 connection 不能永遠靠「再看看」維持。選 Xu 仍要承認 JYC 的關係是真實且值得被好好結束。

## Path D — Balanced honest overlap → JYC

同 Path C 鏡像：
→ DECIDE → JYC
→ responsible Xu closure
→ JYC-13 / 14
→ JYC ending。

**Important**
許棠不能被寫成「輸掉」，雨澄也不能被寫成「搶贏」。late route 是男主決定與誰建立 relationship，不是角色競賽名次。

## Path E — Deceptive overlap → accountability → partial recovery

**Recommended spine**
兩邊高 investment
→ COMMIT → BOTH-L
→ SHURA-01
→ SHURA-02
→ 玩家承認自己為避免選擇而說謊
→ DECIDE
→ 選一人
→ heroine-specific repair viability check
→ Good only if prior trust + repair evidence 足夠；否則 Friend / Distance

**Emotional logic**
一句 apology 不能把 deception 洗掉。選擇一人只是停止繼續傷害，不等於自動恢復 trust。

## Path F — Deceptive overlap → deflection → BOTH-D

**Recommended spine**
BOTH-L
→ SHURA-01
→ SHURA-02
→ 「又沒 exclusive」／「你們也沒問」／繼續編理由
→ DECIDE still ambiguous or both decline
→ BOTH-D
→ BOTH-DC

**Emotional logic**
真正 failure 不是「同時喜歡兩人」，而是男主拒絕承認自己透過 deception 管理別人能看到的現實。

# 16. QA invariants

後續每一個 scene / dialogue batch 都應維持：

- honest overlap 不被寫成 cheating。
- deception 必須能指出具體 lie / omission。
- Xu 的 wound 以 autonomy / truth handling 為中心。
- JYC 的 wound 以 visibility / reality trust 為中心。
- 女主不互相羞辱。
- 三人 scene 不變成喜劇修羅場。
- DECIDE 不用一句 route choice 洗掉前面 state。
- 若只有一條 late invitation viable，不製造假的 COMMIT collision。
- Friend / Distance 必須有完整 closure。
- Good ending 是 relationship resolution；After Story 才是 reward phase。
