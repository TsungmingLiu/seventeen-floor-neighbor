# Narrative Interaction and Story Map Spec

> Lifecycle: **CANONICAL**
>
> Version: 1.0.0
>
> Updated: 2026-10-03
>
> Scope: Player choice authoring、narrative consequence、Story Map topology、relationship-state authority、replay semantics。  
> Implementation tracking: GitHub Issue #52。  
> Story Map UX / scalability prototype: GitHub Issue #50。

## 1. Purpose

本文件定義《17樓公寓鄰居》的核心互動敘事規則。

產品不是用「選正確答案 → 累積好感度 → 達門檻開 route」作為主要玩法。玩家的選擇應該先表達：

> **我現在要怎麼回應眼前這個人？**

然後由具體行為形成兩人共同歷史。角色可以記得玩家以前做過什麼；真正改變可玩故事集合的事件才成為 structural branch，並可投影到 Story Map。

Story Map 不是故事寫完後才套上的裝飾性 flowchart。Narrative topology 在 authoring 階段就必須考慮：

- 哪些事件值得成為玩家能記住的 Memory；
- 哪些 choice 只是 local reaction；
- 哪些歷史只需要在未來 callback；
- 哪些決策真的改變故事；
- 哪些 branch 可以真實 merge；
- 玩家日後如何從 Story Map 理解「我們怎麼走到這裡」。

工程上仍保持 authority 分層：runtime graph 決定 gameplay；Memory Events 是玩家語義單元；Story Map 是 projection。UI navigation 不得反向改寫 gameplay state。

---

## 2. Authority and transition boundary

本文件擁有以下 cross-cutting narrative-system authority：

- expression / action choice 分類；
- Warm / Candid / Playful authoring taxonomy；
- Local / Echo / Structural consequence 分類；
- Structural Branch Locality；
- no relationship-score narrative authority；
- Map-worthy branch 判定原則；
- Narrative topology ↔ Memory Event ↔ Story Map 的 authoring boundary；
- replay 對 narrative authoring 的成本原則。

既有 Locked Scene、runtime JSON、save、Memory mapping 在被明確 migration 前仍保持已批准／已整合狀態；本文件不因自身存在就自動修改 stable IDs、existing saves 或 accepted asset bindings。

目前部分 active narrative/runtime source 仍包含 `F/T/C/K`、relationship threshold、tone counter 等舊模型。這些值在 migration 完成前只可視為：

1. 現有已整合內容的 compatibility state；或
2. 尚待 Phase 1 reconciliation 的 legacy tuning description。

**不得以它們建立新的 scene prerequisite、route unlock、ending gate 或新故事 creative truth。**

任何正式新場景 production 若同時依賴本文件與尚未 reconciliation 的舊數值 gate，應在 narrative-design preflight 中回報 conflict / BLOCKED，而不是自行折衷。

---

## 3. Product pillars

### 3.1 Player Expression

玩家的重要回答應讓玩家選擇「自己怎麼說」，而不是猜作者認定的正解。

### 3.2 Narrative Consequence

選擇的後果應能用具體事件、knowledge、memory、repair、commitment 或行為 pattern 描述，而不是只用抽象分數。

### 3.3 Story Map Discovery

Story Map 應讓玩家看見已經發生的共同歷史、真正的 structural divergence、未探索可能與 replay anchor。

三者必須一起設計。

---

## 4. Choice classes

每個 player-facing choice 必須先被分類為：

- `expression`
- `action`

不得因 UI 剛好都是按鈕而混成同一種設計規則。

### 4.1 Expression choice

Expression choice 回答：

> **男主這一刻怎麼回應？**

預設必須 exactly 3 個選項，使用 internal authoring stances：

- `warm`
- `candid`
- `playful`

這三個 stance 是 writer / QA metadata，不是玩家可見人格屬性。

#### Warm

重點是：

- 接住對方；
- 願意投入；
- 表達關心／肯定／陪伴。

Warm **不等於討好或無腦稱讚**。

#### Candid

重點是：

- 直接；
- 說出自己的判斷；
- 保留立場；
- 不把所有差異藏掉。

Candid **不等於負面、攻擊或故意傷人**。

#### Playful

重點是：

- 跳脫 literal frame；
- 調侃；
- creative reframing；
- flirt / banter；
- 用輕盈方式處理尷尬。

Playful **不等於每次講笑話**。在沉重情境中，好的 playful 可能是遞台階、改變場面壓力，而不是拿對方的痛點開玩笑。

### 4.2 Expression choice hard rules

- exactly 3 options；
- 三種 stance 各一次；
- 不固定 player-facing 排序；
- UI 不顯示 stance label；
- 三個都是合理成年人可能選的回答；
- 不得有 obvious best answer；
- 不得用一個故意白痴／殘酷的答案充數；
- 不要求三條都造成相同效果；
- 但普通 expression choice 不應因為作者想增加分支而被強行 structuralize。

若某個 beat 無法寫出三個都有真實價值的 response，應先問：

> 這裡真的需要 choice 嗎？

而不是硬湊三句。

### 4.3 Action choice

Action choice 回答：

> **玩家要做什麼？**

例如：

- 接受哪個邀請；
- 是否留下；
- 是否坦白；
- 是否替對方做決定；
- 是否修復；
- COMMIT 如何處理；
- relationship intent。

Action choice：

- 不強制 3 options；
- 不強制 Warm / Candid / Playful；
- option count 由故事需要決定；
- player-facing wording 應描述具體行動，而不是抽象 route label。

例如 COMMIT 不應只寫：

- 選許棠
- 選雨澄

而應寫玩家實際做的事：

- 告訴雨澄自己已答應許棠；
- 告訴許棠自己已答應雨澄；
- 坦白兩邊都在發展並重新協調；
- 對兩邊都說沒問題並隱瞞衝突。

---

## 5. Consequence classes

Choice consequence 分成三類：

### 5.1 Local

同一場景內產生：

- immediate reaction；
- 1–5 個 dialogue / action beats；
- expression / subtext 差異；
- 然後 rejoin。

Local consequence 通常不改 Story Map topology。

### 5.2 Echo

過去選擇被未來角色記得，但主要改變：

- callback；
- dialogue wording；
- reaction；
- joke / inside joke；
- scene subtext；
- knowledge-aware variant；
- Inspector 中本次 playthrough 的 memory summary。

Echo consequence **通常不改變這個未來 scene 是否存在**。

其目的不是「解鎖內容」，而是：

> **讓角色真的記得。**

### 5.3 Structural

真的改變後續可用的 Memory Event / scene 集合，例如：

- 另一場活動發生；
- repair opportunity 出現／錯過；
- disclosure 導致不同 confrontation；
- commitment 分流；
- ending / coda / after-story 分流。

只有 Structural consequence 才預設有資格成為 Story Map topology。

---

## 6. Structural Branch Locality

### 6.1 Default rule

普通 expression choice **不得單獨控制遙遠 structural content**。

以下預設禁止：

> Chapter 1 一句普通 playful 回答  
> → Chapter 4 才偷偷解鎖一場 secret date。

問題：

- 因果不可理解；
- replay 成本過高；
- 玩家被迫查攻略；
- Story Map 變成 checklist；
- 玩家開始猜作者，而不是理解角色。

### 6.2 Preferred long-range use

Long-range history 優先用於：

- callback；
- dialogue variant；
- remembered line；
- scene interpretation；
- knowledge；
- relationship subtext；
- evidence-backed pattern recognition。

例如：

COM-02X 玩家曾經對許棠做 unsolicited advice。  
XT-09 她可以回扣：

> 「你又要叫我早點吃飯是不是？」

但 XT-09 本身仍然存在。

### 6.3 Structural timing

一般 structural branch 的主要後果應在：

- 同一 Memory Event；或
- 接下來約 1–2 個 Memory Events

內可被玩家感知。

這不是硬性的 engine hop limit，而是 narrative locality 原則。

### 6.4 Allowed long divergence

以下 major decision 可合理造成較長 divergence：

- attention allocation；
- explicit invitation acceptance；
- repair acceptance / rejection；
- deception / disclosure；
- exclusivity / commitment；
- final relationship intent。

因為玩家清楚知道自己做的是人生層級決策。

---

## 7. Relationship-state authority

### 7.1 Prohibited narrative authority

未來 narrative design 不應使用下列概念作 route authority：

- affection meter；
- trust score；
- chemistry score；
- compatibility score；
- `F_XT / T_XT / C_XT / K_XT`；
- `F_JYC / T_JYC / ...`；
- `majorViolationCount >= N`；
- 「刷夠 N 次某 stance」。

這些若為 telemetry / tuning 暫時存在，不得決定 canon。

### 7.2 Preferred state forms

#### Exact event flags

例如：

- `xt.home_opened`
- `xt.player_stated_own_need`
- `xt.repair_completed`
- `jyc.alias_exposed`
- `jyc.followed_visibility_cue`
- `jyc.repair_completed`

#### Semantic state vars

例如：

```text
exclusiveWith:
  none | xu_tang | jiang_yucheng

relationshipIntent.xu:
  unresolved | romantic | friend | distance
```

#### Knowledge

角色只能知道實際場景中取得的資訊。

#### Choice history

保存具體：

```text
choice-node-id -> selected-choice-id
```

用於 callback、variant、QA、replay 與歷史追溯。

#### Evidence-backed pattern flags

若要表示 pattern，必須能追溯具體 evidence。

例如：

`xt.pattern.care_became_management`

不能只是：

`control_score >= 2`

而應能指出先前至少哪些具體事件構成這個判斷。

---

## 8. Ending principles

### 8.1 Good

Good 不是完美答題。

允許：

- 說錯話；
- boundary mistake；
- awkward conflict；
- jealousy；
- misunderstanding。

只要後面有真正：

- accountability；
- repair；
- changed behavior；
- clear relationship intent。

### 8.2 Friend

Friend 是完整 relationship resolution，不是：

> 分數不夠，所以只能 Friend。

Friend 不得靠曖昧吻或「其實很快會在一起」否定自身完整性。

### 8.3 Distance

Distance 是 closure，不顯示 BAD END。

它可以來自：

- 玩家明確選擇距離；
- pattern 沒有被理解／修復；
- deception trust collapse；
- repair 被拒絕。

Distance 仍要保留角色尊嚴與生活延續。

---

## 9. Story Map as narrative design

### 9.1 Four layers

```text
Narrative Design Topology
        ↓
Canonical Runtime Graph
        ↓ authored mapping
Memory Events
        ↓ projection
Interactive Story Map
```

### 9.2 Narrative Design Topology

Writer / narrative designer 在 scene planning 階段就應知道：

- 這幕是不是 Memory-worthy；
- 是否 local-only；
- 是否 fork entry；
- 是否 branch event；
- 是否 true merge；
- 是否 continuation portal；
- 是否 ending / coda / after-story。

### 9.3 Canonical Runtime Graph

Runtime authority：

- engine nodes；
- choices；
- conditions；
- state mutation；
- call / return；
- endings。

Story Map 不重新執行條件，也不自行解鎖 story。

### 9.4 Memory Events

Memory Event 是玩家可辨識的故事單元，可以覆蓋多個 engine nodes。

Memory 的名字應像人會記得的事情：

- 深夜便利店
- 沒有去成的星期六
- 兩天沒有敲門
- Too Many Eyes
- 可以幫我一件事嗎？

而不是：

- branch_03B
- warm_response_2
- relationship_gate_7

### 9.5 Story Map Projection

沿用 Issue #50：

- Global Spine + Collapsible Routes；
- vertical chronology；
- chapter segmentation；
- character focus；
- route / ending compound nodes；
- max 3 visual lanes；
- semantic zoom；
- desktop inspector / mobile sheet；
- current/frontier jump；
- spoiler-safe projection；
- truthful edge provenance；
- shared Memory Event multi-character membership。

Character focus 是：

> 重新投影同一段人生中「我和這個人的共同歷史」。

不是 route selector。

---

## 10. Map significance

每個 planned scene / Memory Event 應能分類：

- `linear_event`
- `local_reaction_only`
- `fork_entry`
- `branch_event`
- `merge`
- `continuation_portal`
- `ending`
- `coda`
- `after_story`

這些名稱是 design vocabulary；具體 machine schema 在 Phase 2 才決定，不能把本文件示例直接當已實作欄位。

### 10.1 Map-worthy test

若要成為 structural map node，至少能回答：

> 玩家日後看到這個節點時，它代表了什麼有記憶點的事情？

若答案只有：

> 「這裡男主換了一句說法。」

就應該 collapse 成同一 Memory Event 的 local / echo variant。

### 10.2 No fake merge

UI 不能為了漂亮把兩條實際不會重合的故事畫成 merge。

沒有真 merge 時，用 continuation portal / grouped presentation。

---

## 11. Replay philosophy

### 11.1 Product principle

> **玩家應該重玩有變化的部分，而不是被迫重播大量已看內容。**

因此 Structural Branch Locality 是 replay UX 的第一層解法。

### 11.2 Cursor / frontier

沿用 runtime 已有語義：

- `cursor`：目前這輪 / replay 所在 snapshot；
- `frontier`：歷史最深正式進度。

Replay 早期 Memory：

- 不讓 frontier 倒退；
- 不把 Inspector selection 當 gameplay position；
- 不因 UI filter / collapse 改 save。

### 11.3 Alternate exploration

當玩家 replay 過去 choice 並走到真正不同的新 story：

- 新 branch 要實際遊玩後才算 discovered；
- 選到 trigger 不等於自動解鎖全部 downstream title / CG；
- spoiler policy 繼續有效。

### 11.4 Fast-forward

自動 inherited-choice / affected-node fast-forward 是可選未來 enhancement，不是本 overhaul 的前置條件。

第一版應優先靠：

- local / echo 不改 topology；
- structural branch consequence 近；
- major divergence 明確；

控制 replay 成本。

---

## 12. Reference patterns

### 12.1 COM-02X — Local / Echo reference

`深夜便利店` 適合作 expression choice reference。

三種回答可以：

- Warm：分享自己也剛收工；
- Candid：直接指出真的很晚；
- Playful：拿兩盒便利店晚餐作輕鬆 comparison。

不同 reaction 可被後面 callback。

但 Story Map 仍可只有：

> 深夜便利店

不得因其中一句普通回答單獨控制 Chapter 4 structural content。

### 12.2 JYC-09 — Nearby structural reference

`Too Many Eyes` 中 visibility 被現實人物碰到。

若玩家：

- 跟她 cue；
- 先幫她離場；
- 直接公開 alias；

可以合理導致同場或 JYC-10 的不同 damaged / repair topology。

因果短、清楚，可 Map-worthy。

### 12.3 XT-12 — Repair structural reference

`可以幫我一件事嗎？`

許棠請一個 bounded favor。

玩家：

- 只做她請的；
- 幫過頭；
- 因受傷而拒絕；

可直接形成不同 repair outcome / nearby story event。

### 12.4 COMMIT — Major structural reference

`同一個星期六`

玩家的 disclosure / commitment 行為可進：

- HONEST-X；
- HONEST-J；
- BOTH-H；
- BOTH-L；
- OV / SHURA / DECIDE。

這是合理長 divergence。

### 12.5 Anti-pattern

`COM-00` 一句 casual playful line：

```text
→ hidden playful flag
→ Chapter 4 secret date
```

若玩家無法從人物因果理解，只能查攻略得知，預設禁止。

---

## 13. Xu Tang mandatory arc

核心：

> **Autonomy ↔ Partnership**

不是：

> 獨立女性最後學會依賴男人。

### Xu-specific tension

男主：

- care → solution → takeover；
- hurt →「沒事」→ withdrawal。

許棠：

- 過去曾被「關心」逐步接管；
- 容易把「不要被管理」擴大成「最好什麼都不要欠」。

Good route 必須讓兩邊都修。

### Mandatory spine

保留：

- XT-04 中山書店；
- XT-05 同一張桌子；
- XT-06 臨江街夜市；
- XT-07 電影＋末班捷運；
- XT-08 河濱：過去；
- XT-09 門裡面；
- XT-10 沒有去成的星期六；
- XT-11 兩天沒有敲門；
- XT-12 可以幫我一件事嗎？；
- XT-13 補回來的星期六；
- XT-14 17樓：說清楚。

### Mandatory endings

- XT-G Good：隔壁
- XT-F Friend：樓下？
- XT-D Distance：17樓

Good 後：

- XT-AF-01 今晚不用回隔壁
- XT-AF-02 星期日早晨
- XT-AF-03 一個月後：留位置

Coda：

- XT-FC 樓下，還是隔壁
- XT-DC 又一次電梯

### Route completion

許棠線最後應證明：

- 可以靠近；
- 可以要求幫忙；
- 可以說失望；
- 可以接受別人照顧；
- 也可以保留自己的門。

---

## 14. Jiang Yucheng mandatory arc

核心：

> **Visibility / Online Self ↔ Offline Self**

不是：

> 成熟男主把內向女孩帶出舒適圈。

### JYC-specific tension

江雨澄：

- 陌生線下慢熱；
- online / creator domain 非常有主見；
- anonymity 是 visibility control；
- 怕別人喜歡 imagined creator，卻不喜歡現實自己。

男主：

- social-functional；
- 用 work / competence / practical answer hiding vulnerability。

Good completion 不是她變外向，而是：

- 她能選擇何時被看見；
- 男主能承認自己想要 online + offline 都存在；
- 她不需要在男主面前切換成人格。

### Mandatory spine

保留：

- JYC-05 ACG：她的主場；
- JYC-06 Gaming Night；
- JYC-06B 雨天改行程；
- JYC-07 那個帳號；
- JYC-08 你星期六有空嗎？；
- JYC-09 Too Many Eyes；
- JYC-10 回到螢幕後面；
- JYC-11 Offline；
- JYC-12 我想試一次；
- JYC-13 散場；
- JYC-14 雨後：說清楚。

### Mandatory endings

- JYC-G Good：沒有第二個帳號
- JYC-F Friend：先給你看
- JYC-D Distance：最後上線

Good 後：

- JYC-AF-01 最後一班車之後
- JYC-AF-02 不用切換帳號
- JYC-AF-03 公開前先給你看

Coda：

- JYC-FC 先給你看：幾週後
- JYC-DC 新 handle

### Route completion

雨澄線最後應證明：

- privacy 和 intimacy 可以共存；
- anonymous identity 不需要被治好；
- offline silence 也屬於完整的她；
- 男主自己也可以不是永遠可靠、有答案的版本。

---

## 15. Shared / braided narrative principles

保留現有 braided direction：

- 玩家早期不選 route；
- 可以同時認識／約會；
- 未 exclusivity 前 simultaneous dating 不是 moral failure；
- deception 才是 conflict source；
- heroine knowledge 只能由實際 scene 更新；
- 未 focus heroine 不突然從世界消失；
- crossover 不把兩位女主寫成裁判團；
- late lock 才真正關閉 major romantic alternatives。

Structural choices 應以具體行動表達，尤其：

- OPEN attention allocation；
- repair；
- COMMIT；
- HONEST-X / HONEST-J；
- BOTH-H / BOTH-L；
- OV / SHURA；
- DECIDE。

---

## 16. Writer requirements

Narrative designer / scene writer 應在 relevant choice 上明確回答：

1. choice class 是 expression 還是 action？
2. 若 expression，三個 stance 是否各自成立？
3. consequence 是 Local / Echo / Structural 哪一類？
4. 若 Structural，為什麼值得改 Story Map topology？
5. consequence 在多遠之後可被玩家感知？
6. 是否違反 Structural Branch Locality？
7. future callback 是否引用 exact history，而不是模糊「高 trust」？
8. branch rejoin 是否真實成立？
9. 是否存在 obvious answer key？
10. Map node 能否以玩家會記住的事件命名？

---

## 17. QA requirements

Phase 2 應正式加入或等價實作以下 QA concepts：

- `NQA-CHOICE-TRIAD`
- `NQA-CHOICE-DISTINCTNESS`
- `NQA-CHOICE-NO-ANSWER-KEY`
- `NQA-REACTION-CONTEXT`
- `NQA-SEMANTIC-CONSEQUENCE`
- `NQA-STRUCTURAL-LOCALITY`
- `NQA-MAP-LEGIBILITY`
- `NQA-NO-RELATIONSHIP-SCORE-GATE`

其中 machine-checkable 與 semantic checks 必須分開。

Machine validation 可以保證：

- expression exactly 3；
- stance shape；
- prohibited schema/state pattern；
- target existence；
- map metadata shape；
- projection purity invariant。

Semantic QA 判斷：

- 三個答案是否真的都值得選；
- read-the-room；
- 是否像標準答案；
- branch 是否值得 Map；
- callback 是否自然；
- merge 是否在故事上誠實。

---

## 18. Current Opening migration guidance

這是 migration priority，不是自動重寫授權。

| Scene | Direction |
| --- | --- |
| COM-00 | Minor：現有三種 tone 已接近新模式；移除 numeric creative authority |
| COM-01X | Medium：整理成真正三種 response stance |
| COM-01B | Re-evaluate：目前三個 topic choice 若沒有 meaningful expression / action value，應簡化或移除 |
| COM-01J | Medium：避免只用三個 topic 代替 interpersonal expression |
| COM-02X | Major reference POC：從四 choice / F/T/C/K 改成 expression + semantic consequence |
| COM-02J | Medium：callback 留作 variant，不把 topic history當 hidden score |
| COM-03X | 在更高 lock 前按新規則重整 |
| COM-03J+ | 新內容直接遵守本文件 |

Narrative rewrite 不自動讓 CG stale。Visual impact 仍依 production impact / integration gate 判斷。

---

## 19. Story Map production invariants

沿用 Issue #50，並加上 narrative-authoring coupling：

1. UI graph 不等於 engine graph。
2. Map 只顯示玩家可理解事件。
3. Expression local branch 不自動成三條 lane。
4. Structural branch edge 必須有真實 source relation。
5. 無真 merge 不畫 merge。
6. Shared event 以 explicit membership 表達。
7. Character focus 不改 gameplay。
8. 未探索 branch 遵守 spoiler-safe metadata。
9. Current / cursor / frontier / selection 分開。
10. Replay 不讓 frontier 倒退。
11. Map presentation 可以 collapse，但不能改 eligibility。
12. Narrative authoring 必須能解釋每個 structural lane 的 story meaning。

---

## 20. Preflight gate for fresh implementation sessions

Issue #52 的 implementation session 在改任何 file 前，必須先做 read-only PRE-FLIGHT UNDERSTANDING REPORT 並 STOP。

最低內容：

1. Product goal。
2. Current-system problem。
3. Expression vs Action。
4. Warm / Candid / Playful。
5. Local / Echo / Structural。
6. Structural Branch Locality。
7. Map-worthy rule。
8. No relationship-score authority。
9. Replay / cursor / frontier。
10. Xu arc + endings。
11. JYC arc + endings。
12. Issue #50 authority vs fixture-only data。
13. Active repo contradictions。
14. Phase order。
15. Phase-1 expected files。
16. Non-goals。
17. Save / stable ID / Memory / CG risks。
18. Material ambiguity requiring Human decision。

必须正确分类：

- COM-02X playful → Chapter-4 secret date：默认不允许。
- JYC-09 alias exposure → immediate / next-event damaged branch：合理 structural。
- COM-02X history → XT-09 callback only：Echo。
- COMMIT deception → SHURA：合理 major structural。

未通过不得开工。

---

## 21. Implementation order

See Issue #52. High-level dependency order：

```text
Context Freeze / authority
→ Canonical narrative-state reconciliation
→ Harness / schema / validator
→ Runtime/save minimal migration
→ COM-02X reference implementation
→ Story Map production integration
→ Opening rewrite
→ M1 gameplay validation
```

不要把全部 overhaul 當成一個 monolithic PR。

---

## 22. Success criterion

成功不是「加入三個選項」或「畫出 Story Map」。

成功是：

- 玩家覺得自己在表達人格，不是在找正解；
- 角色能記得具體共同歷史；
- small response 不造成不可理解的遠距隱藏路線；
- meaningful decisions 真正改變故事；
- Story Map 能讓玩家理解自己的 playthrough；
- replay 不要求大量無意義重播；
- Good / Friend / Distance 都由具體人物歷史導出，而非 score threshold；
- fresh AI worker 不依賴舊聊天也能從 repo 正確執行這些原則。
