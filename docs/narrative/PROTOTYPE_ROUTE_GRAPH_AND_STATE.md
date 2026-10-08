# Prototype Route Graph and State Contract

> 狀態：**Canonical narrative dependency spec / implementation input**
>
> 版本：0.6
>
> 更新：2026-10-03
>
> 目的：把 `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` 的劇情意圖轉成可實作的 route graph、scene dependencies、dating state 與 knowledge state。這不是 runtime schema 最終格式；實作時應服從 `ARCHITECTURE.md` 的 stable semantic IDs、content compiler、conditions/actions 與 W4 Memory Event contract。
>
> 重要：**本文件描述 authoring graph，不要求玩家 UI 顯示完整 DAG。** 已實作的玩家 UI／Memories contract 見 `ARCHITECTURE.md`；玩家看到的是單頁縱向 Memories timeline。

> v0.6 為 Human 明示批准的 #52 / #55 reconciliation：本文件擁有精確 availability、scheduler、return / clarity gates；互動分類由 `NARRATIVE_INTERACTION_AND_STORY_MAP_SPEC.md` 擁有，角色弧線由 braided spec 擁有。既有 Locked Scene、runtime/save/Memory/asset IDs 不自動 migration。下層 blueprint 的舊數值／固定雙入口／固定 COMMIT 描述須後續對齊，不可作新 production authority。

---

# 1. Scope envelope

v0.5 的規模估算保留作 planning envelope（不是 v0.6 必走流程）：

- 約 66 個 authoring-level scene/gate/ending/after-story nodes；
- 約 48 個 Memory / Ending / Coda candidates before W4 compression；
- scripting 完成後約 390–680 個 runtime story nodes；
- 約 38+ 個明確特殊 CG slot（含 post-ending reward / profile-gated mature slots）；
- braided core 相較 v0.3 真正新增的完整獨立 scene 約 6–9 個；v0.5 另加入 11 個 post-ending After Story / coda nodes。其餘複雜度主要由 conditional dialogue variants 提供。

這個數量是 scope planning envelope，不是 validator 必須鎖死的 node count。

---

# 2. Core graph

圖為可用 scene family 的概觀，非強制 traversal；所有箭頭須符合 §7–9 gates。未見另一人可走較短路徑；SH-01/02、雙線 conflict、COMMIT 不自動插入。

~~~mermaid
flowchart TD
  COM00["COM-00 雨夜搬家"] --> COM01X["COM-01X 電梯重啟"]
  COM01X --> COM02X["COM-02X 深夜便利店"]
  COM02X --> COM03X["COM-03X 包裹 / Line"]
  COM00 -. weekend optional bookstore .-> COM01J["COM-01J 地下街初遇"]
  COM01J -. COM-02X bridge / weekday cafe .-> COM02J["COM-02J 咖啡初遇或書店資格重逢"]
  COM02J -. actual mutual Discord / COM-03X .-> COM03J["COM-03J 同晚線上延續 / contact read-only"]
  COM03X --> COM03M["COM-03M 已有 contacts 的 montage"]
  COM03J -. if encountered .-> COM03M
  COM03M --> OPENA{"OPEN-A 有限 attention window"}

  OPENA --> XT04["XT-04 中山書店"]
  OPENA --> JYC05["JYC-05 ACG：她的主場"]
  XT04 --> XT05["XT-05 同一張桌子"]
  JYC05 --> JYC06["JYC-06 Gaming Night"]

  XT05 -. conditional .-> SH01["SH-01 17樓第一次同框"]
  JYC06 -. conditional .-> SH01
  XT05 --> OPENB{"OPEN-B Open Dating Window B"}
  JYC06 --> OPENB
  SH01 --> OPENB

  OPENB -. ordinary contacted Xu: accepted first invitation .-> XT04
  OPENB -. ordinary contacted JYC: accepted first invitation .-> JYC05

  OPENB --> XT06["XT-06 臨江街夜市"]
  OPENB --> XT07["XT-07 電影＋末班捷運"]
  OPENB --> XT08["XT-08 河濱：過去"]
  OPENB --> JYC06B["JYC-06B 雨天改行程"]
  OPENB --> JYC07["JYC-07 那個帳號"]
  OPENB --> JYC08["JYC-08 你星期六有空嗎？"]

  XT06 -. actual prior plan/investment + cooling gate .-> REJ["RE-J 雨澄重新靠近"]
  XT07 -. same RE gate .-> REJ
  JYC06B -. actual prior plan/investment + cooling gate .-> REX["RE-X 許棠重新靠近"]
  JYC07 -. same RE gate .-> REX

  XT08 --> SH02["SH-02 創作者 / 設計活動同場"]
  JYC08 --> SH02
  REX -. accepted: next unplayed Xu prerequisite .-> XT04
  REX -. both arcs eligible .-> SH02
  REJ -. accepted: next unplayed JYC prerequisite .-> JYC05
  REJ -. both arcs eligible .-> SH02
  SH02 --> BRAIDC{"BRAID-C Braided Intimacy Window"}

  BRAIDC --> XT09["XT-09 門裡面"]
  XT09 --> XT10["XT-10 沒有去成的星期六"]
  XT10 --> XT11["XT-11 兩天沒有敲門"]

  BRAIDC --> JYC09["JYC-09 Too Many Eyes"]
  JYC09 --> JYC10["JYC-10 回到螢幕後面"]
  JYC10 --> JYC11["JYC-11 Offline"]

  XT11 --> TENSION{"TENSION Relationship Tension Check"}
  JYC11 --> TENSION
  XT10 -. other arc absent .-> TENSION
  JYC10 -. other arc absent .-> TENSION

  TENSION --> XT12["XT-12 可以幫我一件事嗎？"]
  TENSION --> JYC12["JYC-12 我想試一次"]

  XT12 -. optional real collision .-> COMMIT{"COMMIT 同一個星期六"}
  JYC12 -. optional real collision .-> COMMIT
  XT12 -. repaired + romantic clarity resolved .-> XT13
  JYC12 -. repaired + romantic clarity resolved .-> JYC13

  COMMIT --> HONESTX{"HONEST-X 坦白選許棠"}
  COMMIT --> HONESTJ{"HONEST-J 坦白選雨澄"}
  COMMIT --> BOTHH{"BOTH-H 兩邊都說實話"}
  COMMIT --> BOTHL{"BOTH-L 兩邊都答應並隱瞞"}

  HONESTX --> XT13["XT-13 補回來的星期六"]
  HONESTJ --> JYC13["JYC-13 散場"]

  BOTHH --> OV01["OV-01 Overlap：時間與注意力"]
  OV01 --> OV02["OV-02 三人同場：誰知道多少？"]
  OV02 --> DECIDE{"DECIDE 不選擇也是選擇"}

  BOTHL --> SHURA01["SHURA-01 撞見"]
  SHURA01 --> SHURA02["SHURA-02 分開談"]
  SHURA02 --> DECIDE

  DECIDE --> XT13
  DECIDE --> JYC13
  DECIDE --> BOTHD(["BOTH-D 雙 Distance"])

  TENSION -. Xu repair refused / unavailable with closure .-> XUCLOSE{"Xu closure handoff（非新 scene ID）"}
  TENSION -. JYC repair refused / unavailable with closure .-> JYCCLOSE{"JYC closure handoff（非新 scene ID）"}
  XT12 -. friendship / distance / repair refusal .-> XUCLOSE
  JYC12 -. friendship / distance / repair refusal .-> JYCCLOSE
  HONESTJ -. actual Xu relationship closure .-> XUCLOSE
  HONESTX -. actual JYC relationship closure .-> JYCCLOSE
  DECIDE -. heroine-specific closure .-> XUCLOSE
  DECIDE -. heroine-specific closure .-> JYCCLOSE
  XUCLOSE -->|mutual friendship| XTF
  XUCLOSE -->|distance / unresolved harm| XTD
  JYCCLOSE -->|mutual friendship| JYCF
  JYCCLOSE -->|distance / unresolved harm| JYCD

  XT13 --> XT14{"XT-14 17樓：說清楚"}
  XT14 --> XTG(["XT-G Good"])
  XT14 --> XTF(["XT-F Friend"])
  XT14 --> XTD(["XT-D Distance"])

  JYC13 --> JYC14{"JYC-14 雨後：說清楚"}
  JYC14 --> JYCG(["JYC-G Good"])
  JYC14 --> JYCF(["JYC-F Friend"])
  JYC14 --> JYCD(["JYC-D Distance"])

  XTG --> XTAF01["XT-AF-01 今晚不用回隔壁"]
  XTAF01 --> XTAF02["XT-AF-02 星期日早晨"]
  XTAF02 --> XTAF03["XT-AF-03 一個月後：留位置"]
  XTF --> XTFC["XT-FC 樓下，還是隔壁"]
  XTD --> XTDC["XT-DC 又一次電梯"]

  JYCG --> JYCAF01["JYC-AF-01 最後一班車之後"]
  JYCAF01 --> JYCAF02["JYC-AF-02 不用切換帳號"]
  JYCAF02 --> JYCAF03["JYC-AF-03 公開前先給你看"]
  JYCF --> JYCFC["JYC-FC 先給你看：幾週後"]
  JYCD --> JYCDC["JYC-DC 新 handle"]

  BOTHD --> BOTHDC["BOTH-DC 春天的17樓"]
~~~

---

# 3. What is structural vs reactive

## 3.1 Structural branch

真正改變後續可用 scene 集合：

- OPEN-A / OPEN-B slot allocation；
- BRAID-C 可用 heroine arc；
- COMMIT 行為；
- honest overlap vs deception；
- DECIDE；
- final relationship intent / endings。

這些應明確存在於 content graph / conditions。

## 3.2 Reactive variant

**不要**為以下每種組合各複製一個 scene：

- 最近比較常找誰；
- 另一位女主是否存在；
- 另一位女主是否已被介紹；
- 是否知道曾經 date；
- 是否剛跟另一人吵架；
- 是否有輕度 jealousy；
- 玩家以前有沒有說過某句模糊話。

以上優先在同一 scene 內以 conditions 切換少量 dialogue / narration / choice wording。

這是避免 combinatorial explosion 的主要規則。

---

# 4. Suggested global state

概念上可表達為：

~~~text
datingState:
  recentFocus: none | xu_tang | jiang_yucheng | balanced
  focusHistory: [heroineId...]
  lastMajorDate: sceneId | null
  overlapLevel: 0 | 1 | 2  # semantic categories, never a score
  exclusiveWith: null | xu_tang | jiang_yucheng
  deception: boolean
  possibleReboundFrom: null | heroineId
~~~

不要求 runtime 一定嵌套成這個 object；重點是語意。overlapLevel 的 0/1/2 是下列事件類別，不累加分數或創建 threshold。

## 4.1 recentFocus

代表最近兩個實際 major social investment 的傾向（精確規則見 §8）。

建議：

- 最近兩個主要 heroine scene 都同一人 → 該 heroine；
- 一人一個 → balanced；
- common/shared event 不改 recentFocus；
- RE hook／接受邀請本身不改 focus；實際赴約的 major scene 才記投入。

用途：
- RE-X / RE-J；
- 某些「最近很忙？」台詞；
- title/memory metadata 不應直接拿它推測 heroine ownership。

## 4.2 overlapLevel

### 0 — Exploring

- 尚未建立雙邊明顯 romantic signal；
- 同時約會完全正常；
- 不顯示 moral penalty。

### 1 — Ambiguous overlap

典型條件：
- 許棠與雨澄都已有 `romanticSignal=true`；
- 尚未 exclusivity；
- 兩邊都進入較私人／date-like 內容。

效果：
- knowledge-aware subtext；
- jealousy / honesty variants；
- COMMIT 可出現。

### 2 — Deceptive / commitment overlap

至少符合其一：
- `exclusiveWith != null` 後仍對另一人 romantic escalation；
- 明確對兩邊說互相矛盾的假話；
- COMMIT 選 BOTH-L。

效果：
- confrontation 可用；
- Good ending 需要 stronger repair，部分情況不可恢復。

## 4.3 deception

**只有刻意誤導才設 true。**

不應因：
- 和兩人吃飯；
- 和兩人約會；
- 尚未 exclusivity；
- 未主動詳細報告 dating history；

就自動設 true。

可設 true 的例子：
- 對許棠說「最近都在加班」但其實刻意隱瞞正在和雨澄 date；
- 對兩邊都說「我那天只留給妳」；
- 明確承諾 exclusivity 後仍同樣 romantic escalation。

---

# 5. Heroine relationship state

每人分開記錄下列 authoring semantics；不是新 runtime schema：

| State | Exact evidence / meaning |
| --- | --- |
| discovery: never_met / known | 真正初遇才改 known；known 不等於 contactable 或 romantic |
| engagement: ordinary / active / cooling / dormant | ordinary 未建立 romantic 推進；active 已接受具體後續；cooling 是已約定回覆／安排的機會被擱置；dormant 是該 authored window 結束仍未續約，停止主動 romantic invites |
| closure: open / romantic_closed | 雙方明說不再 romantic、拒絕 reopening 或 late lock 已作出排他決定才 closed；與 dormant 不混用 |
| harm: none / unresolved / addressed | 指向具體事件與處理 outcome；與 engagement、closure 獨立，休息或邀約不清除 harm |
| clarity: not_due / due / resolved | heroine-specific scene 的明確需要與 promise／期待已提出才 due；雙方釐清 romantic / friendship / distance 與未決承諾才 resolved |
| natural_reapproach | not_offered / accepted / missed：每人最多一次；拒絕 romantic 本身直接 closure |
| player_reopening | not_open / open(windowId) / consumed / expired：只在 §9 的唯一 window 使用 |

保留 exact events：`xt_respected_pace`、`xt_asked_support_mode`、`xt_saw_competence_mask`、`xt_understands_autonomy`、`xt_home_opened`、`xt_stated_own_need`、`xt_respected_bounded_help`、`xt_repair_completed`；以及 `jyc_seen_in_element`、`jyc_home_space_comfort`、`jyc_saw_practical_deflection`、`jyc_alias_private/exposed`、`jyc_invited_player`、`jyc_followed_social_cue`、`jyc_stated_offline_need`、`jyc_named_competence_mask`、`jyc_repair_completed`。

control / physical-push / pressure / withdrawal patterns 必須列出 scene/choice evidence 與角色當地反應，不能以 strike counter 代替。F/T/C/K、majorViolationCount、boundary/pressure strikes 僅可保留於已整合舊內容的 compatibility state，禁止新增 threshold、隱藏加權或 renamed score gate。

# 6. Knowledge flags

這組 state 是 braided narrative 的高槓桿工具。

## 6.1 Xu knowledge

~~~text
xu_knows_jyc_exists
xu_knows_jyc_is_close
xu_knows_player_dated_jyc
xu_suspects_romantic_overlap
~~~

## 6.2 JYC knowledge

~~~text
jyc_knows_xu_exists
jyc_knows_xu_is_neighbor
jyc_knows_xu_is_close
jyc_knows_player_dated_xu
jyc_suspects_romantic_overlap
~~~

## 6.3 Rules

- knowledge 只能由實際 scene / message / honest disclosure 更新。
- 不允許 heroine 因作者方便而全知。
- 「存在」和「很親近」必須分開。
- 三人 scene 的 tension 取決於誰知道多少，而不是固定同一句。
- SHURA-01 的傷害必須能追溯到玩家先前說過／隱瞞過的具體事實。

---

# 7. Node dependency table

| Node | Hard prerequisites | Soft/reactive inputs | Main outputs |
|---|---|---|---|
| COM-00 | root | none | met_xu_tang |
| COM-01X | COM-00 | expression history | ordinary neighbor encounter |
| COM-01J | 週末實際選書店 | 首遇／實際購書，經 COM-02X 接平日 | met_jyc；真正書店初遇資格 |
| COM-02X | COM-01X | encounter history | work/life knowledge |
| COM-02J | 平日 cafe；真正書店資格為 reunion，否則 initial（cafe-only replay 仍 initial） | 當次名字／作品／mutual Discord consent | name / shared-interest knowledge；同意交換才 contact_jyc |
| COM-03X | COM-02X | package/work clue | contact_xu |
| COM-03J | COM-02J 實際 mutual contact，經同晚 COM-03X | actual online exchange；無 contact bypass | contact_jyc read-only；不新增相遇／交換 |
| COM-03M | at least one actual contact | message style | open_dating_unlocked |
| OPEN-A | COM-03M | none | focus history |
| XT-04 | contact_xu + OPEN-A entered + eligible current slot (§8) | recentFocus | xt_respected_pace |
| XT-05 | XT-04 completed + accepted shared-table invitation | prior support style | xt_saw_competence_mask |
| JYC-05 | contact_jyc + stable online exchange + OPEN-A entered + eligible current slot (§8) | recentFocus | jyc_seen_in_element |
| JYC-06 | JYC-05 completed + accepted gaming invitation | game competence | jyc_home_space_comfort |
| SH-01 | JYC-06 + contact_xu | romantic signals | mutual existence knowledge |
| OPEN-B | early anchor completed or OPEN-A solo/rest/wait exhausted | SH-01 optional | midgame slots |
| XT-06 | XT-04 + XT-05 + accepted ordinary-date plan | physical comfort | reciprocal physical cue / exact boundary evidence |
| XT-07 | XT-06 + mutually accepted date-like plan | prior dates | disagreement / curiosity history |
| XT-08 | XT-07 + her willingness to share past | control pattern | xt_understands_autonomy |
| JYC-06B | JYC-05 + JYC-06 + accepted changed-date plan | male self-disclosure | jyc_saw_practical_deflection |
| JYC-07 | JYC-06B + actual alias clues | alias discovery manner | alias flags |
| JYC-08 | JYC-07 + her chosen offline invitation | prior response | jyc_invited_player |
| RE-X | §9 gate + concrete Xu shared context | missed time | recentFocus may change |
| RE-J | §9 gate + concrete JYC shared context | possible rebound | recentFocus may change |
| SH-02 | Xu work known + JYC creator known | knowledge flags | knows_is_close variants |
| BRAID-C | eligible arc completed midgame sequence (§8) | both relationship states | unlock core conflicts |
| XT-09 | XT-08 + her explicit home invitation + open closure | recent focus/overlap | xt_home_opened |
| XT-10 | XT-09 + established shared plan | male needs / control pattern | conflict flags |
| XT-11 | XT-10 | specific boundary / withdrawal evidence | tension severity |
| JYC-09 | JYC-07 + JYC-08 + actual creator event + open closure | alias flags | social pressure outcome |
| JYC-10 | JYC-09 | male hiding pattern | conflict flags |
| JYC-11 | JYC-10 | specific pressure / withdrawal evidence | tension severity |
| TENSION | at least one played core conflict | all relationship + knowledge | repair availability |
| XT-12 | XT-10 + XT-11 + she permits bounded repair + no final closure | other heroine status | xt_repair_completed |
| JYC-12 | JYC-09 + JYC-10 + JYC-11 + she permits visibility-safe repair + no final closure | other heroine status | jyc_repair_completed |
| COMMIT | both meaningful late invitations + real time conflict (optional) | recentFocus/knowledge | commitment branch |
| HONEST-X | Xu clarity decision (COMMIT or local) | actual JYC history | Xu late lock + JYC closure variant |
| HONEST-J | JYC clarity decision (COMMIT or local) | actual Xu history | JYC late lock + Xu closure variant |
| BOTH-H | COMMIT or local clarity with both romantic expectations | overlap L1 | deception=false |
| BOTH-L | COMMIT or equivalent concrete misleading promise | overlap L1+ | deception=true, overlap L2 |
| OV-01 | BOTH-H | focus balance | increased decision pressure |
| OV-02 | OV-01 | knowledge asymmetry | DECIDE |
| SHURA-01 | BOTH-L or equivalent lie collision | exact lies/knowledge | major trust damage |
| SHURA-02 | SHURA-01 | heroine-specific wounds | repair viability |
| DECIDE | OV-02 or SHURA-02 | all state | late route or BOTH-D |
| XT-13 | Xu clarity resolved romantic + XT-12 outcome permits continuation | repair | final Xu compatibility payoff |
| XT-14 | XT-13 | exact arc/repair/intent history | ending intent |
| JYC-13 | JYC clarity resolved romantic + JYC-12 outcome permits continuation | repair | final JYC vulnerability |
| JYC-14 | JYC-13 | exact arc/repair/intent history | ending intent |
| XT-G | XT-14 + Good evidence (§13) | exact repaired romantic history | unlock Good |
| JYC-G | JYC-14 + Good evidence (§13) | exact repaired romantic history | unlock Good |
| XT-F / XT-D | Xu closure handoff (§11), or XT-14 final intent | actual relationship + mutual friendship or distance outcome | unlock existing F/D ending |
| JYC-F / JYC-D | JYC closure handoff (§11), or JYC-14 final intent | actual relationship + mutual friendship or distance outcome | unlock existing F/D ending |
| BOTH-D | DECIDE | exact deception/accountability outcomes | unlock ending |
| XT-AF-01 | XT-G | build profile, intimacy tone | first stayover / afterstory progress |
| XT-AF-02 | XT-AF-01 | sfw/full branch rejoins here | domestic fan-service memory |
| XT-AF-03 | XT-AF-02 | none | Xu afterstory completion |
| XT-FC | XT-F | none | friend coda |
| XT-DC | XT-D | none | distance coda |
| JYC-AF-01 | JYC-G | build profile, intimacy tone | first stayover / afterstory progress |
| JYC-AF-02 | JYC-AF-01 | sfw/full branch rejoins here | online/offline domestic payoff |
| JYC-AF-03 | JYC-AF-02 | none | JYC afterstory completion |
| JYC-FC | JYC-F | none | friend coda |
| JYC-DC | JYC-D | none | distance coda |
| BOTH-DC | BOTH-D | none | double-distance coda |

---

# 8. Attention window semantics

每 window blueprint 必須指名可回覆／續約的 deadline 與錯過後的生活反應；不是任意忽略幾次就扣點。

Window 是有限 authored scheduler，不是自由 calendar。OPEN-A 固定兩個 major slots，OPEN-B 固定三個；solo／rest／wait 有生活片段且消耗當前 slot，不保證收到邀請。短訊息／RE hook 不另送 major slot。BRAID-C 按已進入的 heroine arc 順序演出核心私人與 conflict scenes，不把每個必要 payoff 擠成六選三；blueprint 必須標明各 scene 是 major slot、同次安排的 continuation 或 phase 必要後續。

每 slot 先檢查 discovery/contact、該 scene prerequisites、closure/harm、當地行程，再呈現 contextual player invite、已有 incoming invite、solo/rest/wait。接受才排入具體 scene；counteroffer 只可轉至已 authored 同 window 空 slot，沒有則保留未成行 outcome；婉拒時間不等於拒絕關係。玩家／女主發起只改短入口，rejoin 同一 date scene；不保證成功。

OPEN-A entered 是歷史 gate，不是「尚有 OPEN-A slot」。XX 後若雨澄只是 ordinary contacted acquaintance，採 bounded first invitation，accepted 後可在下一 window（OPEN-B）第一個合法 slot 玩未玩 JYC-05，再按 prerequisites 走 JYC-06；JJ 後普通許棠熟人對稱以 first invitation 返回 XT-04 → XT-05。只有實際 prior investment／已約未成的 plan，且現為 cooling/dormant 者，才可依 §9 使用 RE-J／RE-X；first invitation 不消耗或生成 RE offer/missed/window 歷史。原 OPEN-A 不加第三 slot，不 replay 已完成 anchor，不跳到 midgame。若先前只建立 contact，返回 anchor 仍從初次一對一開始。J 邀約須本 playthrough 實際取得的 COM-02J mutual contact 與 COM-03J 線上前事（首玩或 replay 均可）；不能用 RE 或只有初遇資格替代。

早期 mixed discovery（#71／ND-FEEDBACK-002）：週末 optional bookstore／留家 → COM-02X → 平日工作後 cafe initial／reunion 或 solo street → COM-03X → contact-only COM-03J。真正書店初遇才走 reunion；cafe-only replay 仍 initial。兩次初遇機會均錯過後不補 OPEN-A→OPEN-B discovery，可走較短許棠／生活路徑。任一真正初遇資格在同一 playthrough 保留；street flag/snapshot 不清除，有效排除只在本 playthrough 無 earned initial encounter 時成立。初遇本身不補 contact、購書、knowledge、consent 或 investment；另在實際首玩／replay 取得的 contact／completed 前事按下列獨立 gate 供未來場景讀取。沒有 hard active-heroine cap。

OPEN-B entry：至少一條 early anchor/continuation 已演出，或玩家完成 OPEN-A 的 solo/rest/wait；另一條可合法補 anchor。BRAID-C entry：該 heroine midgame 必要 scenes／knowledge 已演出且她接受私人推進；各自可用，SH-02 另須雙方工作／creator knowledge，缺另一人就 bypass crossover。TENSION → repair → clarity → late lock 按 exact outcomes，不依百分比「深度」。

focusHistory 只記實際 major investment：最近兩次同人 → 該人；一人一次 → balanced；零次 none，一次為該人。短回／讀訊息／RE hook 不記；RE accepted 之後實際赴約才記，solo/shared 不改 focus。recentFocus 僅供 callback 與 RE motive，不能單獨判 cooling、availability、closure 或 exclusivity。

## 8.1 同一 playthrough 的獨立 earned progression（2026-10-08 Human amendment）

主線保留目前位置，但可繼承同一 playthrough 首玩／Memory replay 真正取得的 pivotal 進展。每項 occurred／completed／accepted-exchange 各自記錄；沒有互相推定或 blanket flags union。共享的是已發生的前事，不是 replay 的當地口吻、購書／topic callback、邀約接受、目前關係狀態或 slot。未來場景逐項檢查 shared prerequisites **加上**當前 consent、closure/harm、availability 與合法 slot；不是從 Memory 收藏／已看見人物推定。

| 獨立 gate | 實際取得條件 | 不能推定 |
| --- | --- | --- |
| 江：書店初遇 | 完成實際書店初遇；選 go／入口不足 | cafe-only 不是書店重逢前事；不送 contact |
| 江：cafe completed | 真正完成 cafe 初遇／重逢、姓名與作品交流 | 不送購書、特定 topic 或聯絡交換 |
| 許／江：contact | 各自實際完成聯絡交換；江須玩家提出且她同意交換 | met／分享作品不是 contact；contact 不是邀約同意 |
| 江：online exchange | 有真正 contact，實際選 COM-03J 回覆並完成其反應／收尾 | 通知、imported reply style、no-contact bypass 不足 |
| 許／江：first outing completed | 合法 pending／prerequisites 下實際完成 XT-04／JYC-05 | pending 不是完成；另一人的完成不替代 |
| 指名 friction／conflict occurred | 只有實際選到並演出的該事件 | 正常 outing／meeting 不生成 early 或 late conflict |
| 指名 addressed／repair accepted | 該事件的具體承認、詢問 cue、真停止行為及她接受 | RE、另一事件修復、early addressed 不設 late repair_completed |

例：主線中途未識江，replay 完成 cafe、互相交換及線上前事後，回同一位置可在下一個仍合法的 invitation opportunity 邀她；meeting alone 仍不越過 contact／online gate。主線後期只 replay 到認識／contact、未演指名 late conflict，late repair 仍鎖。future friction／repair 尚未實作；作者必須列 exact predecessor、completion 和接受／拒絕結果，不能預先設值或以泛稱「已認識／吵過架」替代。

共享完成不改主線 active／cooling／dormant／romantic_closed、不退款／追加 slot、不複製 replay focusHistory 或 missed plan、不重生 RE／唯一 reopening window。RE 仍查 §9 的主線投入／已約未成與 current status；普通首邀不是強制 romantic reopening。主線已 consumed 的 slot／pending plan 保留，下一場只能用未來合法 slot；replay 自己的 slot consumption 不併回主線。正常 replay 分支不能清掉 unresolved；精確 repair 只可按該幕 contract 處理它指名的事件，不能清其他 harm 或 closure。

New Game 清除本 playthrough 全部 earned gates、當前主線／window／relationship state 和 pending replay；Memory／CG 收藏保留。舊 collectible checkpoints、discovery、ever-unlocked 不能在新 playthrough 重建 gate。restore／synthetic entry seeds 本身不是實際遊玩證據；gate 只由新完成的 chosen/performed beat commit，reload 不重複。最小 save／migration 邊界見 ARCHITECTURE §3.1。

# 9. Re-approach and one-window reopening

| Situation | Allowed transition / next content |
| --- | --- |
| never_met | discovery opportunity only；不邀未知人物，不補寫共同歷史 |
| known, ordinary, contactable | contextual first invitation；accepted → next unplayed anchor，非「恢复 romance」 |
| active, open, no unresolved harm | 正常邀約；missed promised response / plan 在該 window 可轉 cooling |
| actual prior investment / missed plan + cooling/dormant, open, no unresolved harm, natural offer unused | heroine 可自然 RE 一次；accepted → 下一合法 slot 的 next unplayed prerequisite；不回應／錯過 → missed + dormant |
| natural offer missed | 下一個 authored attention window 是唯一 player-reopening window；僅有合法 slot、contact/context、clarity not_due、未 late lock、無 harm/closure 時可主動一次 |
| player-reopening accepted / counteroffer | consumed；next legal slot 的 next unplayed scene，counteroffer 不另開 window |
| player-reopening declined for timing / unanswered | consumed，保持 dormant；不 respawn 浪漫 hook；ordinary life 可留 |
| 明確拒絕 romantic reopening | romantic_closed，本輪不可再浪漫 reopening，仍可普通生活碰面 |
| 唯一 window 到期 / clarity due / late lock | expired，無補發／滾動延期；先處理 clarity，不能普通 invite 繞過 |
| unresolved harm 或已 closure | 普通邀約／RE 不可清除；harm 只由指名事件的 repair outcome 處理，closure 本輪不可浪漫重開 |

RE 必須能指名先前實際投入或已接受卻未成行的安排及轉 cooling/dormant 的事件；contact 或 recentFocus 指向另一人本身不構成 RE。普通熟人的首次邀請仍受有限 slot、當前 availability 與 prerequisites 約束，不是另一套反覆 respawn 的浪漫 hook。

每位 heroine 的唯一 player window 是 natural offer missed 後**緊接的下一個 attention window**，不是任選未來 window；blueprint 須給 offer/miss scene、window ID、開／關界點與 next legal scene。若窗口無合法 slot，機會到期，不臨時加 slot。錯過 second discovery 不自動生成 romantic RE。

Xu motive：她原本就要看設計／攝影書，提起共同聊過的店，邀他同行且保留自己 pace；player reopen 可回到該 shared topic，不能以幫忙接管她生活作捷徑。JYC motive：共同遊戲更新／作品話題讓她想再一起玩或去展；player reopen 引用實際 exchange，以她選的 offline exposure 程度提案。短入口均 merge 既有 anchor / next scene。

早期 repair boundary：RE 只處理缺席後重新投入；XT-04 擅排程、JYC-05 代答、JYC-06 一直教等摩擦如被 scene 標 unresolved，blueprint 必須在相鄰 continuation 寫出具体承認、詢問 support/cue、停止該行為及她的接受／拒絕 outcome，才可 addressed。此為同一場／下一場短 repair variant，不挪用 XT-12/JYC-12、不 set late repair_completed、不消除 alias exposure 等重大 harm；重大事件留 heroine-specific repair/closure gate。possibleReboundFrom 只引用真實 conflict history，另一人無取得 knowledge 不可讀心。

Map-worthy：接受 return → 下一場未玩 anchor、拒絕 reopening → 當地 closure、wait → window 結束仍 dormant、clarity 回答 → 下一場 late continuation／closure，均在當場或接下來 1–2 個 Memory Events 可見。只有 wording/callback 的 initiator variant 真 merge；不同 eligibility/closure 保留不同可達集合。

# 10. Crossover scene rules

## SH-01

低強度：
- 只建立「彼此存在」；
- 不揭露 relationship status；
- 不使用 jealousy music / slapstick。

## SH-02

中強度：
- 兩位女主可以自然聊得來；
- 她們各自有進場理由；
- 讓 player-facing tension 來自「她們交換了多少資訊」。

## OV-02 / SHURA-01

高強度：
- only after meaningful overlap；
- honest overlap 與 deception 必須寫成不同 tone；
- 女主不應聯手變成裁判團。

---

# 11. Relationship clarity and optional COMMIT

clarity 是每位 heroine 自己的需求，不是全局星期六開關。Xu 在 bounded-support／共同安排後，要知道親密是否仍尊重自主、男主是否願意表達需求；JYC 在 visibility-safe creator participation 後，要知道男主是否願意 online/offline 都在而不替她決定曝光。該 arc 必要 conflict 與 repair outcome 已演出、她明確提出關係期待時 clarity due；先回答／處理未決承諾，才可 late lock。不允許以普通 date invite 延後 due。

| Gate | Entry / consequence |
| --- | --- |
| repair | exact harm、雙方允許處理；接受邀請只是進 repair scene，具體 accountability / changed behavior / heroine response 才決定 outcome |
| local clarity | 一方 due 即可；romantic continuation、friend 或 distance 由雙方 intent 與 repair outcome 決定；另一方按實際歷史處理，不憑空發 ending |
| COMMIT | optional 特定 scene，僅雙方 meaningful late invitations + 合理實際時間衝突；不是雙方 available 就強迫同日 |
| HONEST-X/J | 可從 COMMIT 或相應 local clarity 決定進；坦白既有承諾，另一方可受傷／退出，不保證友情 |
| BOTH-H → OV → DECIDE | 双方 romantic expectations 已建立、誠實披露並允許有限釐清期；不保证接受，无 automatic moral penalty |
| BOTH-L / equivalent concrete lie → SHURA | 明確誤導或違反排他承諾，逐項記 lie / promise / knowledge；不靠同時吃飯判欺騙 |
| late lock → XT-13/14 or JYC-13/14 | 該 heroine clarity resolved、必要 arc/repair outcomes 允許繼續、對其他既有 romantic commitment 已具體處理；新 romantic reopening 關閉 |

COMMIT wording 是行動：坦白已答應另一邊、協調並承認未決、或明知矛盾仍對兩邊答應且隱瞞。若只有一邊可用或無實際衝突，走 heroine-local clarity。重大 deception 不能由一句道歉清除；SHURA recovery 必須 heroine-specific accountability 且她仍願意，不保證 Good。

Xu closure handoff / JYC closure handoff 是現有 TENSION、repair outcome、local clarity、HONEST-X/J 或 DECIDE 的當地收束分支名稱，非新 scene／Memory／runtime ID。實際已有互相重視的關係、雙方明確同意友情且具體 harm 已處理或雙方接受其後果 → 該 heroine 既有 -F；明確要求距離、拒絕 repair 或她因未處理 harm 不願繼續 → 既有 -D。Repair refusal 不自動生成友情。HONEST-X/J 對另一方僅在真實關係 history 足以收束時使用此 handoff；ordinary/dormant 只交代生活現況。

XT/JYC-13 → -14 是必要 repaired romantic Good spine；較早明確 friendship/distance 或 repair refusal 直接經上述 closure handoff 到既有 F/D，不要求假造 -13 date、repair_completed 或 romantic intent。若已合法玩到 -14 才改變 final intent，仍可由 -14 進 F/D。閉合分支保留各 heroine 的 autonomy／visibility 回應與相應 coda，不複製完整人物弧線。

# 12. Post-ending reward state

Relationship resolution ending 不再等同 runtime terminal。

## 12.1 Good unlocks

~~~text
ending.xu.good
→ afterstory.xu.unlocked
→ XT-AF-01 → XT-AF-02 → XT-AF-03

ending.jyc.good
→ afterstory.jyc.unlocked
→ JYC-AF-01 → JYC-AF-02 → JYC-AF-03
~~~

Good After Story 是 reward phase：
- 不再以「選錯就掉 ending」為主要遊戲壓力；
- choice 主要改變 tone、fan-service beat、哪張 optional CG 解鎖；
- 可以有 relationship micro-conflict，但不應把已建立關係重新變成第二套攻略考試。

## 12.2 Friend / Distance codas

~~~text
XT-F → XT-FC
XT-D → XT-DC
JYC-F → JYC-FC
JYC-D → JYC-DC
BOTH-D → BOTH-DC
~~~

Coda 是 closure / continuation，不改寫原 ending classification。

## 12.3 SFW / Full profile

`sfw`：
- romantic intimacy；
- kiss / cuddle / stayover；
- fade-to-black；
- morning-after / aftercare continuity；
- 不保留任何可推測「少了一張成人 CG」的 locked placeholder。

`full`：
- 可在 XT-AF-01/02、JYC-AF-01/02 中插入 mature-only runtime nodes / CG；
- 必須以 compile-time profile pruning 移除；
- mature nodes 不得是理解核心人物弧線的唯一來源；
- all participants are adults and consent must be clear from scene context.

---
# 13. Ending evaluation

Good：必要 spine/payoffs 已演出，雙方明確 romantic intent，具體 harm 已 accountability / repair / changed behavior，heroine 願意继续；不是累積 stance 或通過隐藏分數。從 SHURA 回來須逐項處理真實欺騙且她仍允許 recovery。

Friend：有实际互相重視的歷史，雙方認可 friendship／readiness 不同，不以曖昧吻否定它。Distance：明確選擇距離、拒绝 repair、未處理 boundary/pressure pattern 或 deception；保留尊嚴，非 BAD END。

never_met、ordinary、dormant 僅交代生活現況，不偽造 earned Friend/Distance ending 或 unlock。兩邊都曾有關係且各自 closure 才有 BOTH-D。每個 Good 保留三幕 substantial After Story；不再做第二套攻略／再考 breakup，micro-conflict 與 intimacy choices 以 Local/Echo 為主。

# 14. W4 Memory mapping

玩家頁面不顯示所有 gate。

## Common / shared suggested cards

- COM-00 雨夜搬家
- COM-01X 電梯重啟
- COM-01J 地下街初遇
- COM-02X 深夜便利店
- COM-02J 咖啡店重逢
- COM-03M 通訊錄裡的人
- SH-01 第一次同框（觸發後）
- SH-02 同一個活動（觸發後）
- COMMIT 同一個星期六（僅實際 optional collision 到達後）
- OV-01/OV-02 可壓成 1–2 個 overlap memory
- SHURA-01 / SHURA-02 只有實際觸發後顯示
- BOTH-D ending

## Heroine cards

各 major heroine scene 基本可各一個 Memory Event；RE-X/RE-J 通常不獨立成卡。

## Spoiler rule

未探索的 overlap / shura subtree：
- 不顯示名稱；
- 不顯示數量；
- 可以完全 hidden，或只出現單一 `???`；
- 不讓 route graph 洩漏「其實有修羅場」。

---

# 15. Suggested progression bands

不是 runtime node index。

~~~text
100–299  Common / initial contacts
300–399  Open Dating A
400–549  Midgame / Open Dating B
550–699  Crossovers / braided intimacy
700–829  Core conflicts
830–899  Repair invitations
900–949  Commitment / overlap
950–1049 Late lock
1100–1149 Relationship resolution endings
1150–1299 After Story / Friend-Distance codas
~~~

同 phase 的不同 heroine Memory 可以共用接近 rank。Replay frontier 比較的是 player-facing progression，不是誰的 route ID 比較大。

---

# 16. Implementation guardrails

1. 不把每種 focus order 編譯成獨立 route file。
2. 不用單一 `route_primary` 在早期關閉另一人。
3. 不讓 `recentFocus` 等同 exclusivity。
4. 不把 `deception` 從「同時約會」自動推導。
5. 不讓 heroine 擁有未在 scene 中取得的 knowledge。
6. 不因一個 bad choice 直接 set terminal ending，除非是非常明確的 final intent。
7. 所有 major state mutation 都應能在 story validation / debug context packet 中被看見。
8. Shared scene 的 heroine ownership 必須由 Memory metadata 決定，不靠 speaker。
9. 整個 graph 必須能在 content compiler 做 reachability / dangling target / impossible gate 測試。
10. 實作時保留現有 playable prototype，逐步 migration；舊 story 可退役但不要用 one-off hardcode 把新 graph 塞進 renderer。
11. Ending unlock 與 runtime terminal 分開；Good after-story 應可自然接續 Continue / Memories replay。
12. `sfw/full` mature差異必須 compiler-level pruning，不用 CSS/hidden flag 假裝移除。

---

# 17. Testing matrix for later implementation

至少測：

- XT-first → JYC-second → honest Xu lock；
- JYC-first → XT-second → honest JYC lock；
- balanced dating → BOTH-H → choose Xu；
- balanced dating → BOTH-H → choose JYC；
- BOTH-L → SHURA → accountability → one heroine still Friend/Good viable；
- BOTH-L → SHURA → deflect blame → BOTH-D；
- early XX → ordinary JYC first invitation → JYC-05/06；另測 actual prior JYC plan/investment → cooling → RE-J → JYC becomes primary；
- early JJ → ordinary Xu first invitation → XT-04/05；另測 actual prior Xu plan/investment → cooling → RE-X → Xu becomes primary；
- only one repair invite available → no fake COMMIT collision；
- SH-01 not triggered → later heroine does not mysteriously know the other is neighbor；
- replay older Memory → knowledge/frontier semantics remain correct per W4；
- Distance on one heroine does not automatically erase legitimate friendship state with the other unless scene causality requires it。
- XT-G / JYC-G 解鎖後 Continue 可以進入對應 After Story，而不是永遠停在 ending card。
- `sfw` build 從 Good → After Story → morning/coda 流程完整，且沒有 dangling mature target。
- `full` build mature extension 能回到同一 after-story state，不改 ending classification。
- Friend / Distance coda replay 不倒退 W4 frontier。

這些案例通過後，braided route 才算 implementation-complete。
