# M1 Gameplay Validation Slice：雙線核心與可錯過的生活入口

> Lifecycle: **GENERATED**
>
> 狀態：v0.7 C0 bounded consistency review PASS（`REVIEW-M1-C0-FINAL-001`；2026-10-06，source HEAD `1b7b7a1181a519a3ff13a01af110521ac7ffbcfb`）；三組必要 source annotations 與兩項 focused correction 已核對。不是 Scene Contract、Locked Scene、Narrative QA 或 playable acceptance。
>
> 來源基線：`0b48183fa2b630f2f31cb38dba2bb3b00d0704f0`；2026-10-06。
>
> Task：`ND-M1-C0-001`（原 plan）／`REVIEW-M1-C0-FINAL-001`（bounded final consistency）；`content_writer`／`narrative_design`。

## 1. 要驗證的核心體驗

M1 保留雙女主實質互動、兩個 major anchors、attention allocation、JYC-06 → SH-01 crossover、具體 friction 與真 early repair 的完整核心 coverage。每輪不強迫見兩人；未遇見江雨澄的較短許棠／個人生活路徑同樣有效，不能為 coverage 假造她的訊息或結局。

**30–60 分鐘是包含 Opening 的首輪測量目標，尚無 playtest 數據。**不靠晚期 scenes 或 exposition 湊時長。RE 是重新投入；friction repair 必須另有指名錯誤、承認、詢問 cue、停止越界與她接受／拒絕，不能把 RE 點開算修好。

| 核心體驗 | 既有承載點 | 玩家可看見的結果 |
| --- | --- | --- |
| 不同人格／主動性 | XT-04 書店 pace、JYC-05 作品主場 | 她分享書頁／自己帶路，非選對加分 |
| 男主生活與需求 | XT-05 incident；slot 的 solo/rest/wait | 工作、疲累與想相處均有內容 |
| 有限注意力 | OPEN-A 兩 slots；OPEN-B 三 slots | 未去的活動保留前事，不能同一時段全玩 |
| crossover | JYC-06 → SH-01 | 實際介紹才知彼此存在／許棠是鄰居 |
| friction → repair | XT-04→05、JYC-05→06、JYC-06 散場 | 指名越界被承認且停止，女主可拒絕 |
| return / closure | contextual 首邀、RE、唯一 reopening | 下一未玩場景或可見 dormant/closure，非免費親密 |

## 2. 合法入口、安排與停點

保留唯一 playable entry、所有既有 stable IDs 與 accepted Opening 前事；discovery 與第一個 window 入口已交付；完整 scheduler／anchors 仍是規劃，不改 Locked Scene 或 runtime。Scene-local authoring 以各 blueprint 为 owner，不複製新規格。

| 承載點 | 實際／規劃状态 | M1 的 entry → handoff |
| --- | --- | --- |
| COM-00/01X/01B/01J/02X | 既有 integrated/locked baseline | 沿用现有 flow；COM-01B 不自行新增 gate |
| COM-02J | 已整合的 cafe reunion／first-meet；逐版 QA／Human scope 保留 | 實際姓名／作品討論；互相同意交換才 contact_jyc，再接 COM-03X→COM-03J |
| COM-03X | 已整合；既有 Human story PASS scope 保留 | 從 COM-02X 包裹/設計話題取得 contact_xu；不是戀愛 milestone |
| COM-03J | **已整合；不新增 Human acceptance** | 只承接 COM-02J 真實 contact 的同晚訊息；無 contact bypass |
| COM-03M | 已整合 contact-gated montage | 僅已 contact 方訊息；雙方皆有才雙 notification → OPEN-A |
| 第二 discovery | 已交付平日 cafe first-meet | 週末留家後 COM-02X→平日居家工作；cafe 首遇或街頭独走→COM-03X。不再排 OPEN-A→OPEN-B 第三次 discovery |
| OPEN-A | 第一 window 入口已整合；完整 scheduler 待製作 | 兩個 major slots；XJ/JX/XX/JJ、solo/rest/wait，無第三 slot |
| OPEN-B | bounded return/continuation plan | 三 slots；第一合法 slot 可補未玩 XT-04/JYC-05，後續按各自 predecessor |
| XT-04→05 | scene plan | 普通鄰居第一次書店→同桌；擅排程 unresolved 先短 repair 再邀同桌 |
| JYC-05→06 | scene plan | contact/作品首邀→線上 co-op 前事→她同意家訪；代答 unresolved 先 repair |
| SH-01 | scene plan | JYC-06 與 contact_xu 成立才介紹；不送 date/alias/status knowledge |
| RE-X/J | reactive plan | 真 prior investment/accepted missed plan 且 cooling/dormant、open、無 harm才一次自然 offer |

入口與有限停點證據：[INT-OPENING-ENTRY-BATCH-001](../../content/production/runs/m1-com03m-20261003/INT-OPENING-ENTRY-BATCH-001.decision.json)（historical 226/226、26/26；不是 current-head rerun）、[NQA-OPENA-001](../../content/production/runs/m1-com03m-20261003/NQA-OPENA-001.decision.json)（exact 第一 window scene scope）。ROADMAP §4／§10 記錄 #71／#69 已交付與 Owner review 的限定範圍；舊 receipts 的 Human pending 不回寫，未列新 scene approval 仍未知。pending X/J 未消耗 slot，solo/rest/wait 只消耗第一 slot，並非完整 OPEN-A。

**累積 eligibility ≠ 当次前事**：依 [ND-FEEDBACK-002](../../content/production/runs/feedback-20261005/ND-FEEDBACK-002.decision.json) 及 COM-01B／02J／03J contracts，真正書店或 cafe 首遇可累積解鎖；只書店初遇資格可進 cafe reunion，cafe-only replay 仍 initial。街頭 snapshot 保留，但不撤銷已取得資格；不補姓名、購書、topic、contact、consent 或 investment。未交換 contact 不補第三次相遇，也不能進 J 邀約／SH01／RE。

major outing／anchor／下一次同桌各使用一個合法 slot；同次咖啡、遊戲散場修復、SH-01 紹介是 continuation，不另送 major investment。short discovery/contact 橋接不送 date slot。COM-03M 回复先后和 shared events 不當作 major attention 投入。

## 3. 兩條完整雙女主主路徑

**核心 A**：Opening/contact → OPEN-A X04、J05 → 收尾有實際被擱置 Xu plan 才 RE-X（可接受或錯過）→ OPEN-B 第一 slot J06 → 同次散場 repair（若一直教）→ SH01 → 下一剩餘 slot X05（RE-X 已接受，或錯過後本 window 唯一 player reopening）。無該 plan/history 則正常續邀 X05，不假造 RE。X04 曾擅排程则 X05 入場前必承認並停止；她接受才同桌。許棠書店的自主延長、雨澄帶路與家中競爭、三人介紹、男主 incident 皆可在此連續讀到。

**核心 B**：Opening/contact → OPEN-A J05、X04 → 收尾有實際被擱置 J plan 才 RE-J → OPEN-B 第一 slot X05（含 X04 短 repair）→ RE-J 接受或 missed 後唯一 player reopening 接下一剩餘 slot J06（先處理 J05 代答且已有 co-op）→ J06 散場 repair → SH01。沒有實際 cooling/missed plan 時，這個 return 是普通正常續邀，不為 recentFocus 假造 RE。

兩條均演完整 crossover/friction/repair 主路徑；repair success 的主測先承認具體行為、問她希望怎樣幫／何時不要幫、下一 beat 真停止、讓她說是否接受。補測她拒絕後不進親密 continuation，不能用主路徑標全部分支都 repaired。early repair 不設 XT/JYC late repair_completed，不挪用 -12。

| 其他合法 allocation | 入口與可達內容 |
| --- | --- |
| XX：X04→X05 | ordinary contacted J 的 contextual 首邀於 OPEN-B 第一合法 slot → 未玩 J05→co-op→J06→SH01；不是 RE，不追加 OPEN-A slot |
| JJ：J05→J06→SH01 | ordinary contacted X 於 OPEN-B 第一合法 slot 首邀未玩 X04→X05；不從家訪跳 midgame，不憑空回放 anchor |
| 實際另一方 accepted plan 被擱置 | 明列那次 plan/missed response 才 cooling，可自然 RE；history 不靠兩次 focus 推定 |
| 未遇見 J | 週末書店與平日 cafe 均錯過且未 earned 初遇 → X04/05 或 solo/rest/wait；bypass J訊息／J scenes／SH01，不頒 J-F/D |
| 由合法 earned replay 選到 J | 合法初遇→COM02J 真實同意交換→COM03J，普通首邀在 OPEN-B 合法 slot 才 J05；若已無 slot 就停生活前景，不加 slot |

**M1 預覽停點**：在該走法最後已製作的 early continuation／SH01／return outcome 停止，清楚标 preview stop，不能虚构結局；接受邀約的下一幕尚未實作時也不能宣稱可玩。M1 不納入 BRAID-C、-10/11/12 late conflict、clarity、COMMIT/SHURA、late lock 或 endings；完整 arc 由 route blueprints 保留，30–60 分鐘不保證每輪覆蓋全部 variants。

## 4. 有界重新靠近與負向 boundary cases

M1 採共同 blueprint 的具體 placement：OPEN-A 收尾，許棠本要逛曾聊過的設計書店／江雨澄傳共同遊戲更新，符合 prior plan/investment 的 heroine 自然邀一次。接受→OPEN-B 下一合法 slot 的 next unplayed scene；她改同 window 時間不另送 slot。錯過後 dormant，**緊接 OPEN-B** 開唯一 player reopening，第三 slot 收尾關；玩家問那家店／已發生的遊戲 exchange，接受／counteroffer／timing decline／不答皆消耗唯一機會。無合法 slot或到期無補發；明確拒绝浪漫重開則本輪 romantic_closed，普通鄰居／公共作品接觸可留。

| 必測負向前事 | 必須看到的 boundary |
| --- | --- |
| never_met 或未 contact J | 不能邀未知人物；只能 discovery，不能 RE/共同歷史 |
| ordinary contact + XX/JJ | 首邀回未玩 anchor，RE offer/window 歷史不生成 |
| 只有 recentFocus 轉移、無 prior plan/investment | 不得觸發 RE |
| 擅排程／代答／指導仍 unresolved | 邀約/RE 被拒或留在短 repair，不能復原浪漫 availability |
| early repair 女主接受／拒絕 | 成功才 addressed；拒絕不設 late repair_completed、也不自动 friendship |
| 自然 offer missed，reopening timing decline/unanswered | consumed+dormant，不重生 hook |
| reopening 明確拒绝 | 當地 closure；之後普通邀約不得繞回 romantic |
| 全 slots 已用、window expired | 不補 slot、不滾動延期、未玩 scene 不當作已完成 |
| SH01 未發生 | 女主不知道另一人存在／鄰居關係；callback 不讀心 |

clarity due、late lock、曝光重大 harm／deception 的阻擋由 full-route blueprint 保留；M1 early run 不假造其发生或宣稱已跑 late boundary tests。Local 是當地反應、Echo 指實際書頁／cue callback、Structural 是接受 return→下一未玩主幕／拒绝→closure／wait→window 結束仍 dormant；當場或接下來 1–2 個 Memory Events 可感知。initiator wording variants 真 merge，closed 與 eligible 的可達集合不假 merge。

## 5. 後續製作與驗收界線

三組 source annotations 與兩項 focused correction 已按 #71／ND-FEEDBACK-002 獨立核對，C0 bounded consistency PASS；後續逐場 fresh bounded `Narrative Design → approval → Scene/Dialogue → Narrative QA → narrative preview integration → Human preview`。入口不重做；固定契約後 XT-04／JYC-05 可並行，完整有限 scheduler 與各 continuation／repair／SH01／return 依 ROADMAP §10 分批接入。已 locked 不無故重寫；CG 另排 downstream。

visible choices 都須有合法 target，保存/Memory replay 須維持 stable IDs、knowledge 與未完成場景 gate；runtime 工程與必要 graph/save checks 由後續任務實作，本輪不修改。M1 的內部 end-to-end／負向案例／Owner review 依 ROADMAP 與 Issue #78 V0/V1 驗證。依 Owner 最新指示，問卷、招募與正式外部研究不排在 M1；有完整路線且 M1 完成後，才由 Issue #78 D1 按需 ad-hoc 啟動。目前沒有新 external playtest 證據。

**Deferred／ad-hoc 研究備忘（不是 M1 task 或 exit gate）**：如 M1 完成後決定做正式研究，再計時記錄 entry、Opening 結束、實際 contact、slots 結束、SH01、repair/return outcome 與 preview stop；缺席節點標未觸發。報原始 elapsed、中斷與有效遊玩時間、min/median/max、實際走法。先問記得哪幕／哪裡失去興趣／是否想繼續，再問 choice 是否像標準答案、哪個 consequence 可讀、repair 是否可信。時間與外部品質未實測，不從 build/validate 推定通過；未安排此研究不阻擋 M1 關閉或 M2 啟動。

## 6. C0 findings 與下一批 prerequisite

**C0 consistency PASS（REVIEW-M1-C0-FINAL-001；ND-M1-C0-ALIGN-001 annotation 同步與一次 focused correction 已核對）**：

- macro COM-01J／02J／03J、route/state graph／dependency／§8 與 common blueprint 入口／OPEN-A discovery annotations 已對齊：週末 optional bookstore／留家 → COM-02X → 平日 cafe initial／reunion 或 solo street；無 post-OPEN-A 第三 discovery。COM-02J 擁有 actual mutual Discord exchange，COM-03J 同晚 COM-03X 後只讀 contact。來源仍是 COM-01B `required_payoffs`、COM-02J／03J `entry_state`／`implementation_mapping` 與 ND-FEEDBACK-002。
- COM-03M／OPEN-A contracts 的 obsolete exclusion constraints／mappings、paired scene MD L1–L11 與 owning JYC revision L1–L36 已同步：street flag/snapshot 不清除，真正書店或 cafe 初遇累積資格判有效排除；local contact／knowledge／consent／closure／harm 分開。engine L732–786、progress L380–422 與 INT-FEEDBACK-002 的已交付行為不變；原 ND-ARC／NQA／Human／pixel scope 不擴張。

下一批 packet 使用同步後 exact excerpts；C0 已完成 bounded consistency review。changed contract／scene bytes 須依實際 declared dependencies 做 exact current-source dependency／continuity checks；下游必要的 fresh full-scene Narrative QA 不由 C0 免除，未授予 fresh NQA／Human／pixel 或完整 M1 acceptance，也不要求無故重寫 baseline prose。沒有需重新決定的 earned-discovery／contact rule；若改其意味則 BLOCKED 至明示 amendment。

| 工作／gate | 可開始的 bounded stage 與必要前事 |
| --- | --- |
| XT-04：READY for C1 ND | COM-03X 真實 contact_xu、OPEN-A pending X 或 OPEN-B 合法首邀／return slot；Xu blueprint L31–73。接受安排不等完成；anchor 完成只消耗一次，咖啡同次 continuation 不再記投入。仍須本幕 contract approval→dialogue→NQA→integration。 |
| JYC-05：READY for C1 ND | COM-02J 當次 mutual contact＋COM-03J 真實 online exchange＋合法 pending J／return slot；JYC blueprint L35–71。cumulative unlock 不提供線上前事。 |
| OPEN-A/B：C0 ALIGNED；#78 minimal pending／slot completion contract pending before integration | 已有第一 window 五個 distinct outcomes；續接 pending anchor 後只 consume 一次，生活支不重 consume；第二 slot、OPEN-B 三 slots／deadline／counteroffer／stop 尚須固定並製作，禁止第三 OPEN-A slot。route/state L400–414、OPEN-A `exit_state`。 |
| XT-05／co-op→JYC-06／early repair：BLOCKED on predecessors | 分別真實 X04／J05 completed、再同桌同意／已演出 online co-op 一兩次和家訪同意。unresolved 擅排程／代答／一直教須承認、問 cue、真停止、接受或拒絕；不設 late repair_completed。Xu L72–80；JYC L70–111。 |
| SH-01：BLOCKED on JYC-06 | 已發生 JYC-06＋真 contact_xu＋实际在場介紹；只建 existence／neighbor knowledge，不補 date／alias／status。repair 拒絕後可合理介紹但不當 repaired。common L244–266、JYC L111。 |
| 首邀／RE／reopening／closure：BLOCKED on authored history/window | ordinary 首邀回 next unplayed anchor；RE 另須真 prior investment／accepted missed plan＋cooling/dormant、open、無 unresolved harm、offer unused。OPEN-A 收尾 missed 後只緊接 OPEN-B，一次機會、第三 slot 收尾關；無 slot／timing decline／unanswered／明确拒絕／expiry 各有結果，不 respawn。common L276–286、route/state L418–439。 |

依 ROADMAP §10，#77 C1 的 XT-04／JYC-05 ND 可並行，#78 同步準備最小 pending／slot completion contract，整合前完成；#76 P0／P2 準備維持並行。詳細 coverage matrix 只留 Issue #78，不複製測項或把既有 test inventory 當新 PASS。以上 READY 指可製作 prerequisite，非 scene／Human acceptance；完整 core、負向 state/save/Memory cases 與 Owner end-to-end review 仍未完成。

本 plan 使用 C0 packet allowlist 的 exact canon excerpts、入口 contracts／decisions、ARCHITECTURE 与 ROADMAP。exact input/output hashes 由 ignored production handoff binding 保留；沒有新增 dialogue、NQA、CG 或 Human acceptance 證據。
