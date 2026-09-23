# Prototype Route Graph and State Contract

> 狀態：**Canonical narrative dependency spec / implementation input**
>
> 版本：0.4
>
> 更新：2026-09-23
>
> 目的：把 `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` 的劇情意圖轉成可實作的 route graph、scene dependencies、dating state 與 knowledge state。這不是 runtime schema 最終格式；實作時應服從 `ARCHITECTURE.zh-TW.md` 的 stable semantic IDs、content compiler、conditions/actions 與 W4 Memory Event contract。
>
> 重要：**本文件描述 authoring graph，不要求玩家 UI 顯示完整 DAG。** 玩家仍依 `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md` 看到單頁縱向 Memories timeline。

---

# 1. Scope envelope

v0.4 目標規模：

- 約 55 個 authoring-level scene/gate/ending nodes；
- 約 37 個 Memory / Ending candidates before W4 compression；
- scripting 完成後約 330–560 個 runtime story nodes；
- 約 30+ 個明確特殊 CG slot；
- 相較 v0.3 真正新增的完整獨立 scene 約 6–9 個；其餘複雜度主要由 conditional dialogue variants 提供。

這個數量是 scope planning envelope，不是 validator 必須鎖死的 node count。

---

# 2. Core graph

~~~mermaid
flowchart TD
  COM00["COM-00 雨夜搬家"] --> COM01X["COM-01X 電梯重啟"]
  COM01X --> COM01J["COM-01J 地下街初遇"]
  COM01J --> COM02X["COM-02X 深夜便利店"]
  COM02X --> COM02J["COM-02J 咖啡店重逢"]
  COM02J --> COM03X["COM-03X 包裹 / Line"]
  COM03X --> COM03J["COM-03J 推薦 / Discord"]
  COM03J --> COM03M["COM-03M 一週訊息 montage"]
  COM03M --> OPENA{"OPEN-A Open Dating Window A"}

  OPENA --> XT04["XT-04 中山書店"]
  OPENA --> JYC05["JYC-05 ACG：她的主場"]
  XT04 --> XT05["XT-05 同一張桌子"]
  JYC05 --> JYC06["JYC-06 Gaming Night"]

  XT05 -. conditional .-> SH01["SH-01 17樓第一次同框"]
  JYC06 -. conditional .-> SH01
  XT05 --> OPENB{"OPEN-B Open Dating Window B"}
  JYC06 --> OPENB
  SH01 --> OPENB

  OPENB --> XT06["XT-06 臨江街夜市"]
  OPENB --> XT07["XT-07 電影＋末班捷運"]
  OPENB --> XT08["XT-08 河濱：過去"]
  OPENB --> JYC06B["JYC-06B 雨天改行程"]
  OPENB --> JYC07["JYC-07 那個帳號"]
  OPENB --> JYC08["JYC-08 你星期六有空嗎？"]

  XT06 -. recent focus .-> REJ["RE-J 雨澄重新靠近"]
  XT07 -. recent focus .-> REJ
  JYC06B -. recent focus .-> REX["RE-X 許棠重新靠近"]
  JYC07 -. recent focus .-> REX

  XT08 --> SH02["SH-02 創作者 / 設計活動同場"]
  JYC08 --> SH02
  REX --> SH02
  REJ --> SH02
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

  XT12 --> COMMIT{"COMMIT 同一個星期六"}
  JYC12 --> COMMIT

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

  XT13 --> XT14{"XT-14 17樓：說清楚"}
  XT14 --> XTG(["XT-G Good"])
  XT14 --> XTF(["XT-F Friend"])
  XT14 --> XTD(["XT-D Distance"])

  JYC13 --> JYC14{"JYC-14 雨後：說清楚"}
  JYC14 --> JYCG(["JYC-G Good"])
  JYC14 --> JYCF(["JYC-F Friend"])
  JYC14 --> JYCD(["JYC-D Distance"])
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
  overlapLevel: 0 | 1 | 2
  exclusiveWith: null | xu_tang | jiang_yucheng
  deception: boolean
  possibleReboundFrom: null | heroineId
~~~

不要求 runtime 一定嵌套成這個 object；重點是語意。

## 4.1 recentFocus

代表最近 2–3 個 major social investment 的傾向。

建議：

- 最近兩個主要 heroine scene 都同一人 → 該 heroine；
- 一人一個 → balanced；
- common/shared event 不改 recentFocus；
- re-approach scene 本身只有在玩家實際投入時才改 focus。

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

兩邊各自持有：

~~~text
relationship.<heroine>:
  familiarity
  trust
  chemistry
  compatibility
  romanticSignal
  repairCompleted
  majorViolationCount
~~~

Prototype 不需要公開數值 UI。

## 5.1 Xu-specific flags

建議至少：

~~~text
xt_respected_pace
xt_asked_support_mode
xt_saw_competence_mask
xt_understands_autonomy
xt_home_opened
xt_stated_own_need
xt_respected_bounded_help
xt_repair_completed

xt_boundary_strikes
xt_withdrew_when_hurt
xt_physical_push_pattern
xt_control_pattern
~~~

## 5.2 JYC-specific flags

建議至少：

~~~text
jyc_seen_in_element
jyc_home_space_comfort
jyc_saw_practical_deflection
jyc_alias_private
jyc_alias_exposed
jyc_invited_player
jyc_followed_social_cue
jyc_stated_offline_need
jyc_named_competence_mask
jyc_repair_completed

jyc_pressure_strikes
jyc_pressure_pattern
~~~

---

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
| COM-01X | COM-00 | tone | F_XT |
| COM-01J | COM-00 | none | met_jyc, F_JYC |
| COM-02X | COM-01X | none | F_XT |
| COM-02J | COM-01J | first encounter detail | F_JYC |
| COM-03X | COM-02X | package/work clue | contact_xu |
| COM-03J | COM-02J | interest choice | contact_jyc |
| COM-03M | contact_xu + contact_jyc | message style | open_dating_unlocked |
| OPEN-A | COM-03M | none | focus history |
| XT-04 | OPEN-A | recentFocus | xt_respected_pace |
| XT-05 | XT-04 or sufficient Xu F | prior support style | xt_saw_competence_mask |
| JYC-05 | OPEN-A | recentFocus | jyc_seen_in_element |
| JYC-06 | JYC-05 or sufficient JYC F | game competence | jyc_home_space_comfort |
| SH-01 | JYC-06 + contact_xu | romantic signals | mutual existence knowledge |
| OPEN-B | early anchor completed | SH-01 optional | midgame slots |
| XT-06 | Xu F threshold | physical comfort | chemistry / pattern |
| XT-07 | Xu F/C threshold | prior dates | K/T |
| XT-08 | Xu T threshold | control pattern | xt_understands_autonomy |
| JYC-06B | JYC F threshold | male self-disclosure | jyc_saw_practical_deflection |
| JYC-07 | JYC T threshold | alias discovery manner | alias flags |
| JYC-08 | JYC F/T threshold | prior response | jyc_invited_player |
| RE-X | recentFocus=jyc + Xu viable | missed time | recentFocus may change |
| RE-J | recentFocus=xu + JYC viable | possible rebound | recentFocus may change |
| SH-02 | Xu work known + JYC creator known | knowledge flags | knows_is_close variants |
| BRAID-C | midgame progress | both relationship states | unlock core conflicts |
| XT-09 | Xu T/K viable | recent focus/overlap | xt_home_opened |
| XT-10 | XT-09 or strong Xu investment | male needs / control pattern | conflict flags |
| XT-11 | XT-10 | strike count | tension severity |
| JYC-09 | JYC creator arc viable | alias flags | social pressure outcome |
| JYC-10 | JYC-09 | male hiding pattern | conflict flags |
| JYC-11 | JYC-10 | trust severity | tension severity |
| TENSION | at least one core conflict state | all relationship + knowledge | repair availability |
| XT-12 | Xu repair viable | other heroine status | xt_repair_completed |
| JYC-12 | JYC repair viable | other heroine status | jyc_repair_completed |
| COMMIT | both late invitations viable | recentFocus/knowledge | commitment branch |
| HONEST-X | COMMIT | JYC depth | Xu late lock + JYC closure variant |
| HONEST-J | COMMIT | Xu depth | JYC late lock + Xu closure variant |
| BOTH-H | COMMIT | overlap L1 | deception=false |
| BOTH-L | COMMIT | overlap L1+ | deception=true, overlap L2 |
| OV-01 | BOTH-H | focus balance | increased decision pressure |
| OV-02 | OV-01 | knowledge asymmetry | DECIDE |
| SHURA-01 | BOTH-L or equivalent lie collision | exact lies/knowledge | major trust damage |
| SHURA-02 | SHURA-01 | heroine-specific wounds | repair viability |
| DECIDE | OV-02 or SHURA-02 | all state | late route or BOTH-D |
| XT-13 | honest Xu or DECIDE Xu | repair | final Xu compatibility payoff |
| XT-14 | XT-13 | stats/flags | ending intent |
| JYC-13 | honest JYC or DECIDE JYC | repair | final JYC vulnerability |
| JYC-14 | JYC-13 | stats/flags | ending intent |
| XT-G/F/D | XT-14 | evaluation | unlock ending |
| JYC-G/F/D | JYC-14 | evaluation | unlock ending |
| BOTH-D | DECIDE | deception/trust | unlock ending |

---

# 8. Attention window semantics

## 8.1 Why windows exist

我們要模擬「時間有限」，但不做 day-by-day life sim。

Window 是 narrative scheduler，不一定顯示成 calendar。

## 8.2 OPEN-A

建議 2 個 major slot。

玩家可：
- XT → JYC；
- JYC → XT；
- XT → XT（若第二個許棠 scene 已被邀請觸發）；
- JYC → JYC。

但至少保留一次讓未 focus heroine 重新進場的訊息／偶遇。

## 8.3 OPEN-B

建議 3 個 major slot。

Scene 本身仍有 prerequisite，所以不是六選三的硬菜單。

可使用：
- character invitation；
- message card；
- weekend choice；
- automatic encounter。

## 8.4 BRAID-C

不是「自由選一個」，而是允許兩條 heroine arc 的核心私人／衝突 scene 在同一 phase 共存。

目標是讓玩家可能處於：
- 許棠剛吵完；
- 雨澄仍在線上；
- 或反過來；

而不是先把一條完整跑完才開始另一條。

---

# 9. Re-approach semantics

RE-X / RE-J 的目的不是送免費好感，而是避免未 focus heroine 從世界消失。

規則：

1. 最多使用少量模板 family，不為每個時間點寫獨立完整 scene。
2. 可以有偶遇／message／生活小事三種 presentation。
3. 必須引用最近 focus，讓對話有時間感。
4. 若玩家剛與另一人 conflict 後突然高強度靠近，標 `possibleReboundFrom`。
5. Rebound 不是自動負分；它只讓對方有機會察覺「今天的你不太一樣」。
6. 真正 relationship progression 仍需進入她自己的 major scene。

---

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

# 11. Commitment Gate contract

COMMIT 是 prototype 最重要的 structural choice。

## 11.1 Trigger

理想：
- `xt_repair_invite_available`
- `jyc_repair_invite_available`
- 兩者時間衝突合理成立。

若只有一邊可用，不要硬生成 collision；直接自然進 late focus。

## 11.2 Player choices are actions

UI wording不要是：

~~~text
[選許棠]
[選江雨澄]
~~~

而應是具體行動：
- 告訴雨澄自己已經答應許棠；
- 告訴許棠自己答應了雨澄；
- 坦白兩邊都在發展，試圖重新協調；
- 對兩邊都說「沒問題」。

## 11.3 Honest overlap

不保證女主接受，但不判 moral failure。

可以導致：
- 一方主動退出 romantic race；
- 兩人都要求玩家想清楚；
- DECIDE 前短暫觀察期。

## 11.4 Deceptive overlap

真正的 conflict source 是「誠實」而非「一夫一妻制遊戲規則」。

SHURA 的台詞要引用玩家實際的 lie/omission，不能抽象指控。

---

# 12. Ending evaluation

數值只作調參。推薦 starting tuning：

## 12.1 Good candidate

~~~text
F >= 6
T >= 6
C >= 4
K >= 5
repairCompleted = true
majorViolationCount <= 1
relationshipIntent = romantic
~~~

若從 SHURA 回來：
- 必須有 explicit accountability；
- heroine-specific trust 必須仍有 recovery path；
- 一句選擇不能清除 deception。

## 12.2 Friend candidate

可能來自：
- T/K 高但 C/intent 低；
- repair 成功但 readiness 不一致；
- 玩家主動選 friendship；
- overlap 後雙方認為不宜立刻戀愛，但仍重視彼此。

## 12.3 Distance

可能來自：
- repeated boundary / pressure pattern；
- repair 被拒絕；
- deception + refusal to own it；
- 明確選擇距離。

Distance 不顯示 BAD END。

---

# 13. W4 Memory mapping

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
- COMMIT 同一個星期六（到達後）
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

# 14. Suggested progression bands

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
1100+    Endings
~~~

同 phase 的不同 heroine Memory 可以共用接近 rank。Replay frontier 比較的是 player-facing progression，不是誰的 route ID 比較大。

---

# 15. Implementation guardrails

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

---

# 16. Testing matrix for later implementation

至少測：

- XT-first → JYC-second → honest Xu lock；
- JYC-first → XT-second → honest JYC lock；
- balanced dating → BOTH-H → choose Xu；
- balanced dating → BOTH-H → choose JYC；
- BOTH-L → SHURA → accountability → one heroine still Friend/Good viable；
- BOTH-L → SHURA → deflect blame → BOTH-D；
- early focus Xu → RE-J → JYC becomes primary；
- early focus JYC → RE-X → Xu becomes primary；
- only one repair invite available → no fake COMMIT collision；
- SH-01 not triggered → later heroine does not mysteriously know the other is neighbor；
- replay older Memory → knowledge/frontier semantics remain correct per W4；
- Distance on one heroine does not automatically erase legitimate friendship state with the other unless scene causality requires it。

這些案例通過後，braided route 才算 implementation-complete。
