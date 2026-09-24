# Content Production TODO

> 狀態：Canonical creative-production backlog
>
> 版本：0.3
>
> 更新：2026-09-23
>
> 這份文件只追蹤 **劇情／scene／對話／美術 production**。
>
> **不要把 W3/W4/engine/CI/Codespaces 工作塞進這裡。** 技術工作仍以 repo root `TODO.md`、`PROJECT_STATE.md`、`ARCHITECTURE.zh-TW.md` 為準。
>
> Canonical inputs：
> - `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`
> - `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
> - `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`
> - `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`
> - `docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md`（CG production）
> - `docs/proposals/urban-dating-sim-setting-proposal.md`
> - `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`（只有涉及 Memories / replay / frontier 時）
>
> 原則：**這份 TODO 只記「做到哪裡」，不複製 scene spec。** 所有內容細節仍回 canonical spec 查。

## 2026-09-23 Master reconciliation snapshot

- W4 runtime 已完成並在 `main` 驗證通過；本 tracker 不再把「等待 W4 完成」列為 S10 前置。Production content 仍必須先滿足各自 S4–S9 gate，才進 runtime integration。
- Vertical Slice scene files 實際存在 5 / 12：`COM-00`、`COM-01X`、`COM-01J`、`COM-02X`、`COM-02J`，五幕均已到 S6；其餘 7 幕尚未建立。
- Drive `runtime-public/bg` 已有 6 張 1080×1920 WebP；其中 5 個 logical backgrounds 可視為 generated + QA documented，`BG-APT-ELEVATOR` 仍缺 scene-locked `restart_dim` same-layout variant。
- Drive `runtime-public/sprites` 已有 10 張透明 WebP production candidates；identity / wardrobe 視覺 QA 無 blocking drift，但四個已生成 set 的 expression coverage 與後來鎖定的 scene files 不完整對齊，因此 A2 保持未完成，需補 expression / semantic naming。
- Opening CG 尚無新 production asset；目前可進 generation 的 locked scenes 為 `CG-COM-01`、`CG-COM-02`、`CG-COM-03`、`CG-COM-04`。其餘 CG 等對應 scene S4/S6。
- Storage deviation：canonical 6-sheet character refs 目前實際位於共享的 `runtime-public` folder；這與 `ARCHITECTURE.zh-TW.md` 的 accepted-master → `source-private` 契約不一致。現有 Drive IDs 暫維持為 generation authority，避免破壞 worker references；後續須用一次原子 migration 同步 source-private/catalog/spec，不得平行建立第二套 authority。
- Drive `runtime-public` root 有未被 repo reference 的 `test.mp4`；視為 orphan/staging drift，未計入任何 production progress。

---

# 1. Current production goal

先完成一個可以直接餵給 W4 的 **Opening Vertical Slice**，不要一次製作完整 66-node story。

目標範圍：

~~~text
COM-00  雨夜搬家
COM-01X 電梯重啟
COM-01J 地下街初遇
COM-02X 深夜便利店
COM-02J 咖啡店重逢
COM-03X 包裹 / Line
COM-03J 推薦 / Discord
COM-03M 一週訊息 montage
XT-04   中山書店
JYC-05  ACG：她的主場
JYC-06  Gaming Night
SH-01   17樓第一次同框
~~~

這一批要回答：

1. 男主語氣是否成立？
2. 許棠與江雨澄是否在前 30–45 分鐘就明顯是不同的人？
3. 玩家是否會自然同時對兩人產生興趣？
4. online/offline messaging 是否好玩？
5. 第一次 crossover 是否自然，而不是人工修羅場？
6. 9:16 背景／立繪／CG 是否真的適合 W4 UI？
7. 圖片與台詞放在一起後，有沒有大量多餘旁白？

---

# 2. Scene production definition of done

每個 major scene 完成時，依序勾：

- [ ] **S1 — Script v1**：完整 narration / dialogue / choices / local branch。
- [ ] **S2 — Player-perspective review**：只從第一次玩的玩家視角 review pacing、可信度、吸引力。
- [ ] **S3 — Character/continuity review**：確認語氣、已知資訊、knowledge flags、前後 continuity。
- [ ] **S4 — Script lock candidate**：修掉 therapy-speak、obvious-good-choice、重複資訊。
- [ ] **S5 — State contract**：scene entry、exit、stats、flags、reactive variants 明確。
- [ ] **S6 — Art shot list lock**：BG / sprite / expression / CG timing 對應 art spec。
- [ ] **S7 — Generation recipe ready**：需要生成的 asset 有 prompt/reference/camera/safe-zone/filename。
- [ ] **S8 — Asset generated & selected**：Human 生成、挑選 accepted master。
- [ ] **S9 — Asset QA**：identity / hands / wardrobe / continuity / 9:16 crop 通過。
- [ ] **S10 — Runtime integration ready**：等 W4/content schema 接入，不要求現在改 player。
- [ ] **S11 — In-game playtest**：W4 可用後實機測。
- [ ] **S12 — Final polish**：依 playtest 回改 script / art。

W4 runtime 現已完成；正常 production 仍先做到 **S9**。只有 scene/script/art contract 已鎖且對應 assets 通過 S8/S9 後，才進 S10 integration；S11/S12 仍需實機與 Human review。

---

# 3. Production batches

## Batch A — Voice Lock

**建議用一個獨立 session 完成，不要拆成三個 chat。**

### COM-00 — 雨夜搬家

- [x] S1
- [x] S2
- [x] S3
- [x] S4
- [x] S5
- [x] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### COM-01X — 電梯重啟

- [x] S1
- [x] S2
- [x] S3
- [x] S4
- [x] S5
- [x] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### COM-01J — 地下街初遇

- [x] S1
- [x] S2
- [x] S3
- [x] S4
- [x] S5
- [x] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### Batch A gate

- [x] 男主第一人稱／旁白 tone 定稿
- [x] 許棠初期 speech style 定稿
- [x] 江雨澄初期 speech style 定稿
- [x] 三人都沒有「AI 心理諮商口吻」
- [x] opening 3 scenes 合起來 pacing 合理
- [ ] 第一批 art direction 可接受

---

## Batch B — Contact & Contrast

**第二個內容 session。**

### COM-02X — 深夜便利店
- [x] S1
- [x] S2
- [x] S3
- [x] S4
- [x] S5
- [x] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### COM-02J — 咖啡店重逢
- [x] S1
- [x] S2
- [x] S3
- [x] S4
- [x] S5
- [x] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### COM-03X — 包裹 / Line
- [ ] S1
- [ ] S2
- [ ] S3
- [ ] S4
- [ ] S5
- [ ] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### COM-03J — 推薦 / Discord
- [ ] S1
- [ ] S2
- [ ] S3
- [ ] S4
- [ ] S5
- [ ] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### COM-03M — 一週訊息 montage
- [ ] S1
- [ ] S2
- [ ] S3
- [ ] S4
- [ ] S5
- [ ] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### Batch B gate

- [ ] 許棠 message rhythm 與真人對話明顯一致
- [ ] 江雨澄 online/offline 反差有趣但不是人格分裂
- [ ] 玩家在沒有 route select UI 的情況下理解兩條關係都在進展
- [ ] COM-03M 不拖、也不只是 exposition slideshow

---

## Batch C — First Romantic Proof

**第三個內容 session。**

### XT-04 — 中山書店
- [ ] S1
- [ ] S2
- [ ] S3
- [ ] S4
- [ ] S5
- [ ] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### JYC-05 — ACG：她的主場
- [ ] S1
- [ ] S2
- [ ] S3
- [ ] S4
- [ ] S5
- [ ] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### JYC-06 — Gaming Night
- [ ] S1
- [ ] S2
- [ ] S3
- [ ] S4
- [ ] S5
- [ ] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### Batch C gate

- [ ] 玩家會想繼續約許棠，不只是因為她「條件好」
- [ ] 玩家會想繼續約雨澄，不只是因為她「宅／可愛」
- [ ] 至少各有一個真正 enjoyable、不是 character-therapy 的 moment
- [ ] CG reward cadence 不過密

---

## Batch D — First Crossover

### SH-01 — 17樓第一次同框
- [ ] S1
- [ ] S2
- [ ] S3
- [ ] S4
- [ ] S5
- [ ] S6
- [ ] S7
- [ ] S8
- [ ] S9
- [ ] S10
- [ ] S11
- [ ] S12

### Batch D gate / Vertical Slice content complete

- [ ] 不靠旁白說「尷尬」，玩家自己能感覺 tension
- [ ] knowledge flags 完全符合實際看到／聽到的資訊
- [ ] 兩位女主沒有互相敵視
- [ ] 這一幕讓 braided route 的價值變得明顯
- [ ] Opening Vertical Slice S1–S9 全部完成

---

# 4. Parallel asset work

不要等所有 script 完成才開始生圖，也不要一次生成完整遊戲。

## A0 — Identity preflight

- [x] 許棠 canonical metadata = 27 歲 / 約 170 cm
- [x] 許棠 approved 6-sheet canonical identity pack 最終確認
- [x] 江雨澄 approved 6-sheet canonical identity pack 最終確認（23 歲 / 約 160 cm）
- [x] 兩位角色 production reference filenames / Drive IDs 已整理至 `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`

## A1 — Opening reusable backgrounds

- [x] BG-APT-17F-RAIN — generated / Drive runtime WebP / QA documented
- [x] BG-APT-17F-NIGHT — generated / Drive runtime WebP / QA documented
- [ ] BG-APT-ELEVATOR — normal master generated / QA documented；仍缺 `restart_dim` locked variant
- [x] BG-ACG-SHOP — generated / Drive runtime WebP / QA documented
- [x] BG-CONVENIENCE-NIGHT — generated / Drive runtime WebP / QA documented
- [x] BG-CAFE-STATION — generated / Drive runtime WebP / QA documented；physical filename 保留 `bg-cafe-station-day-v1.webp`
- [ ] BG-BOOKSTORE — missing
- [ ] BG-ACG-CORRIDOR — missing
- [ ] BG-PC-HOME-LIVING — missing

## A2 — Opening sprite sets

> 2026-09-23 reconciliation：現有 10 張候選圖已通過 identity / alpha / wardrobe 基本 QA，但 set completion 以 **locked scene expression contract** 為準；不得把「已有 base sprite」等同 set 完成。

- [ ] XT-SPR-WEEKDAY — 3 candidates 已有；需對齊 `neutral_observant / polite_smile / dry_playful / mild_surprise / soft_goodnight`，至少補缺少 acting variants 並統一 semantic names
- [ ] XT-SPR-LATE-CASUAL — `tired` 已有；仍缺 `caught_off_guard / small_smile / teasing / sleepy_annoyed`
- [ ] XT-SPR-BOOKSTORE — missing
- [ ] JYC-SPR-CAMPUS — 3 candidates 已有；需對齊 `neutral_shy / hesitant / thinking_before_reply / small_smile / surprised`，不可用近義檔名默默代替
- [ ] JYC-SPR-CAFE — 3 candidates 已有；需對齊 `focused_drawing / caught_drawing / interested / talking_about_art / tiny_laugh`
- [ ] JYC-SPR-ACG — missing
- [ ] JYC-SPR-GAMING — missing
- [ ] JYC-SPR-CASUAL — missing

## A3 — Vertical Slice CG queue

> Narrative gate 已開：`CG-COM-01/02/03/04` 對應 scene 均已 S4/S6，可進 generation。其餘 CG 不得提前生成。

- [ ] CG-COM-01 — 雨夜搬家 — P0 — **ready to generate**
- [ ] CG-XT-01 — 書店午後 — P0
- [ ] CG-JYC-01 — ACG 主場 — P0
- [ ] CG-JYC-03 — Gaming Night — P0
- [ ] CG-SH-01 — 17樓三人第一次同框 — P1
- [ ] CG-COM-02 — 地下街初遇 — P1 — **ready to generate**
- [ ] CG-COM-03 — 深夜便利店 — P1 — **ready to generate**
- [ ] CG-COM-04 — 咖啡店畫圖 — P1 — **ready to generate**
- [ ] CG-JYC-02 — 小周邊 reward — P1

---

# 5. Structured-content skeleton

W4 runtime 已完成；這條 structured-content 工作可獨立進行，但在 Opening Vertical Slice production gate 未滿足前，**不要為了搶進度改 player/framework**。

- [ ] 為 66 個 authoring IDs 建立 machine-readable skeleton
- [ ] 每個 item 至少包含 stable authoring ID
- [ ] kind：scene / gate / reactive / window / ending / afterstory / coda
- [ ] hard prerequisites
- [ ] soft/reactive inputs
- [ ] main state outputs
- [ ] Memory Event ownership / none
- [ ] required BG IDs
- [ ] required sprite sets
- [ ] required CG IDs
- [ ] SFW/full profile availability
- [ ] validator 可以檢查 dangling authoring dependency
- [ ] **暫不**把 final dialogue 全塞進 skeleton
- [ ] **暫不**改 W3/W4 player

這項可以在 Opening Vertical Slice script tone 鎖定後做；不要先做，否則很容易把還在變的 scene 結構過早固化。

---

# 6. Session strategy

## Recommended

**一個 production batch = 一個新 session。**

不要：
- 一個 scene 一個 session：context 太碎。
- 一個 session 寫完整 66 nodes：語料過長、review 品質下降。
- 用 root technical session 同時寫 W3/W4 和 romance dialogue：容易 context pollution。

建議：

~~~text
Session 1 — Content Production / Batch A
COM-00 + COM-01X + COM-01J

Session 2 — Content Production / Batch B
COM-02X + COM-02J + COM-03X + COM-03J + COM-03M

Session 3 — Content Production / Batch C
XT-04 + JYC-05 + JYC-06

Session 4 — Content Production / Batch D
SH-01 + Vertical Slice holistic review
~~~

每個新 session 首句只需要說：

> 依照 `docs/narrative/CONTENT_PRODUCTION_TODO.md` 繼續目前下一個未完成的 Content Production batch。先讀 canonical narrative / route / art specs，再開始；不要改 W3/W4 技術線，除非內容需求證明目前架構無法表達。

AI 必須自己從 repo 找 current state，不要求 Human 重述前文。

## Why not subagent as primary writer

Creative scene work需要：
- Human 對語氣的快速 feedback；
- 同一批 scene 互相比較；
- 角色微小用詞 continuity；
- 「我作為玩家喜不喜歡」這種高主觀 review。

因此主 narrative writer 應在你能直接互動的 session。

未來可把 subagent / Work 類型的 parallel task 用在：
- continuity audit；
- asset inventory；
- consistency scan；
- flag/dependency QA；
- alternate dialogue critique；
- script lint / repetitive phrase detection。

但不要讓它獨立決定 canonical dialogue。

---

# 7. Stop condition before expanding beyond vertical slice

以下未全部成立前，不開始 XT-06 之後的大量 production：

- [ ] Opening Vertical Slice S1–S9 完成
- [ ] 許棠與江雨澄 identity consistency 通過
- [ ] 兩人的 dialogue voice 已穩定
- [ ] 至少一輪 holistic player-perspective narrative review
- [ ] 9:16 art 在真實 UI mock / W4 中不被裁壞
- [ ] SH-01 證明 braided crossover 是加分而不是噱頭
- [ ] CG production 成本實測可接受
- [ ] structured content 能表達 basic focus / knowledge state
- [ ] 沒有因 Vertical Slice 真實需求而發現 architecture blocker


---

# 8. Production script storage contract

為避免每個新 session 把成品放在不同地方，Opening Vertical Slice 的 scene production 文件固定放：

~~~text
docs/narrative/scenes/vertical-slice/
  COM-00.md
  COM-01X.md
  COM-01J.md
  COM-02X.md
  COM-02J.md
  COM-03X.md
  COM-03J.md
  COM-03M.md
  XT-04.md
  JYC-05.md
  JYC-06.md
  SH-01.md
~~~

每個 scene 文件建議固定包含：

~~~text
# <ID> — <title>

Status
Canonical inputs
Scene goal
Entry state
Exit state
Runtime/Memory intent

## Script
- narration
- dialogue
- choice text
- local branch variants
- reactive variants

## State contract
- conditions
- stats
- flags
- knowledge changes
- next nodes

## Art direction
- background
- sprites / expressions
- CG timing
- shot list

## Generation queue
- asset IDs
- reference inputs
- prompt status
- safe-zone / focal notes

## Review log
- player-perspective findings
- character / continuity findings
- unresolved questions
~~~

規則：

- scene production 文件可以逐步修改；
- `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` 仍負責整體劇情 intent，不把完整台詞倒灌回總 spec；
- `PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` 仍負責跨 scene dependency / state authority；
- `PROTOTYPE_ART_REQUIREMENTS.md` 仍負責 reusable visual specification；
- scene file 可以引用這三份文件，但不要複製整段造成 drift；
- 每次 AI 完成一個 S-step 後，更新本 TODO 對應 checkbox；
- **沒有 Human review，不要把 S2/S4/S12 自動勾完。**

---

# 9. Copy-paste AI prompts

以下每段都設計成 **全新 ChatGPT / Work / AI coding session 可以直接複製貼上**。Prompt 已包含 repo、canonical docs、工作邊界、輸出與完成條件。

如果 AI 有 GitHub repo access，應直接讀 repo，不要求 Human 把文件重新貼一次。

---

## P-A — Batch A / Voice Lock session

~~~text
我們要繼續製作 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` 的遊戲內容。

這個 session 只做 Content Production Batch A：`COM-00 雨夜搬家`、`COM-01X 電梯重啟`、`COM-01J 地下街初遇`，目標是鎖定男主、許棠、江雨澄三人的 opening voice。

開始前請直接從 repo 讀取：
1. `PROJECT_STATE.md`
2. `docs/narrative/CONTENT_PRODUCTION_TODO.md`
3. `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`
4. `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
5. `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`
6. `docs/proposals/urban-dating-sim-setting-proposal.md`

如果內容與舊 playable prototype 衝突，以 braided narrative v0.5 與上述 canonical docs 為準。許棠 canonical profile 是 27 歲 / 約170cm；江雨澄 23 歲；男主 31 歲。

工作邊界：
- 不要修改 root `TODO.md` 的 W3/W4/engine 工作。
- 不要碰 W3/W4 技術實作，除非 scene 真實需求證明現有架構無法表達；若發現 blocker，只記錄，不要自行重構 engine。
- 不要一次把 Batch A 三幕全部寫完再讓我看。
- 從 `COM-00` 開始，一幕一幕做。
- 每幕先做到 S1 Script v1，展示給我 review；收到我的 feedback 後再做 S2–S7。
- 沒有我的明確 review，不要把 S2/S4 自動標完成。
- 成品放到 `docs/narrative/scenes/vertical-slice/<SCENE_ID>.md`，依 CONTENT_PRODUCTION_TODO 的 storage contract。
- 每完成一個 S-step，回寫 `docs/narrative/CONTENT_PRODUCTION_TODO.md` checkbox。
- 不要用 AI 心理諮商式台詞，不要讓人物把自己的 theme 說得太完整。
- Choices 必須像成年人真的可能說／做的事，不要一眼看出「作者認證正解」。
- 保持 dialogue、silence、動作、CG timing 互相分工；圖片已能表達的情緒不要再用旁白重複說一次。

Batch A 的最終 gate：
- 男主第一人稱／旁白 tone 成立；
- 許棠初期語氣自然、乾、不過度熱情；
- 江雨澄初期害羞但不是 infantilized；
- 三幕合起來 pacing 像真實都市生活，不像角色輪流登場的攻略教學；
- art direction 可以支援 9:16 W4 UI。

現在只先處理 `COM-00 雨夜搬家`：
1. 根據 canonical spec 展開成完整可玩的 Script v1；
2. 包含 narration、dialogue、2–3 個 local choices、短 branch response、最後 rejoin；
3. 標註每段需要的 sprite expression / BG / CG timing；
4. 寫明 entry/exit state 與 stats/flags；
5. 優先追求自然、克制、可信，不急著製造命定戀愛感；
6. 完成後把 Script v1 寫進 repo scene file，將 COM-00 的 S1 勾起；
7. 然後把可讀版完整呈現給我，停在這裡等我 review，不要自行開始 COM-01X。
~~~

---

## P-B — Batch B / Contact & Contrast session

~~~text
我們要繼續 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` 的 Content Production。

本 session 只做 Batch B：
- COM-02X 深夜便利店
- COM-02J 咖啡店重逢
- COM-03X 包裹 / Line
- COM-03J 推薦 / Discord
- COM-03M 一週訊息 montage

請先直接讀：
- `PROJECT_STATE.md`
- `docs/narrative/CONTENT_PRODUCTION_TODO.md`
- Batch A 已完成的 `docs/narrative/scenes/vertical-slice/COM-00.md`、`COM-01X.md`、`COM-01J.md`
- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
- `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`
- setting proposal

先確認 Batch A 的人物 voice，不要重新發明語氣。

工作方式：
- 一幕一幕做，從 TODO 中第一個未完成 scene 開始。
- 每幕先完成 S1 Script v1 並讓我 review，再推 S2–S7。
- 沒有人類 review 不自動完成 S2/S4。
- scene 成品寫到 `docs/narrative/scenes/vertical-slice/<ID>.md`。
- 每個完成步驟回寫 CONTENT_PRODUCTION_TODO。
- 不碰 W3/W4 技術線。

Batch B 的核心不是「再讓兩個女生出場一次」，而是建立不同 relationship texture：
- 許棠：現實日常、鄰居距離、訊息短而生活化。
- 江雨澄：線下停頓多，線上突然變吵、會丟 meme / screenshot / 長分析，但仍必須像同一個人。
- 交換聯絡方式必須有實用理由，不能像 dating app onboarding。
- COM-03M 必須讓玩家開始期待兩種 notification tone，但不能做成 exposition slideshow。
- 不要讓每次巧遇都像編劇強迫角色碰面；尤其 COM-02J 要遵守「第一次她提過安靜咖啡店，所以男主後來去那裡工作」的 causal geography。

現在從 TODO 中 Batch B 第一個未完成 scene 開始，先只做 S1，寫進 repo並呈現給我 review；不要一次跳到下一幕。
~~~

---

## P-C — Batch C / First Romantic Proof session

~~~text
繼續 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` 的 Content Production。這個 session 只做 Batch C：

- XT-04 中山書店
- JYC-05 ACG：她的主場
- JYC-06 Gaming Night

先直接讀：
- `PROJECT_STATE.md`
- `docs/narrative/CONTENT_PRODUCTION_TODO.md`
- 已完成的 vertical-slice scene files
- `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`
- `PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
- `PROTOTYPE_ART_REQUIREMENTS.md`
- setting proposal

這一批的目標不是推主線，而是證明玩家真的會因「和這個人相處本身有趣」而想繼續，而不是因為系統告訴玩家她是 heroine。

要求：
- 一幕一幕做，從 TODO 第一個未完成 scene 開始。
- 每幕 S1 先讓我 review，再做後續 S2–S7。
- scene file 固定寫到 `docs/narrative/scenes/vertical-slice/<ID>.md`。
- 每完成一個 production step 回寫 TODO。
- 不碰 W3/W4 技術線。

XT-04：
- 不叫它正式約會。
- 許棠花比預期久的時間看設計／攝影書；真正吸引力來自她投入時的樣子。
- choice 不能只是「陪她=好、催她=壞」，提醒行程也可以是合理成年人行為，只是顯示 compatibility 差異。
- 結尾由她主動延長到咖啡，讓 attraction 是 reciprocal。

JYC-05：
- 她在 ACG 場域必須變得明顯有主場感、判斷快、吐槽多。
- 不把她寫成「宅所以可愛」；她要在作品判斷、角色設計、遊戲知識上真有能力。
- 玩家不能因她偶爾卡住就自動替她說話。
- 應該有一個純 enjoyable reward beat，例如周邊／抽選，但不能幼態化。

JYC-06：
- gaming competence 必須真實，她可以比男主強。
- 不要把「故意讓她贏」寫成體貼。
- 最大親密感是「不用一直聊天也舒服」。
- 她從客人模式變成抱靠枕、吐槽、各滑手機的 relaxed state，要循序漸進。
- 此 scene 也是 SH-01 可能觸發的前置，所以離開／進17樓的時間與狀態要留好 continuity。

現在從 TODO 中 Batch C 第一個未完成 scene 開始，只做 S1，寫入 repo並給我完整可讀版本 review。
~~~

---

## P-D — Batch D / First Crossover + holistic review

~~~text
繼續 `TsungmingLiu/seventeen-floor-neighbor` 的 Content Production。這個 session 做 Batch D：

1. SH-01 — 17樓第一次同框
2. 完成後做整個 Opening Vertical Slice 的 holistic player-perspective review

先讀：
- `PROJECT_STATE.md`
- `docs/narrative/CONTENT_PRODUCTION_TODO.md`
- 所有已完成的 `docs/narrative/scenes/vertical-slice/*.md`
- `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`
- `PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
- `PROTOTYPE_ART_REQUIREMENTS.md`

SH-01 的原則：
- 不是修羅場。
- 不是兩女爭男。
- 沒有 jealousy music 式台詞。
- 雨澄因既有 Gaming Night / visiting continuity 出現在17樓；許棠因為自己住在17樓而自然出現。
- 兩女主第一次知道彼此存在，但只能知道 scene 中實際透露的資訊。
- 主要 tension 來自空間、停頓、稱呼、介紹方式和玩家已知的兩條關係，不要由旁白說「氣氛突然很尷尬」。
- 許棠與雨澄對彼此應基本有禮，甚至可能留下「她們其實會聊得來」的可能性。
- 更新 knowledge flags 必須精確。

先只做 SH-01 S1，寫入 `docs/narrative/scenes/vertical-slice/SH-01.md`，回寫 TODO，給我 review。收到我確認並完成 S2–S7 後，再做 holistic review。

Holistic review 必須把整個 Vertical Slice 當第一次玩的玩家體驗，回答：
- 前 30–45 分鐘是否抓人？
- 哪一幕最拖？
- 哪一幕太像編劇安排？
- 許棠和雨澄是否清楚不同？
- 男主是否有存在感但不搶戲？
- 是否真的會讓玩家想同時繼續了解兩人？
- 目前 choice 是否太像心理測驗？
- CG / sprite / narration 是否有重複表意？
- braided route 的價值是否在 SH-01 前後真正被感受到？
- 若要刪掉 10–15% 台詞，最該刪哪裡？
- 哪些 scene 必須回爐，哪些可以進 production lock？

Holistic review 不要直接大改所有文件。先提交診斷與具體修改建議給我，我批准後再改 canonical scene files。
~~~

---

# 10. Single-scene prompts

如果某一幕需要特別細磨，可不用 Batch prompt，直接開一個新 session 貼對應 prompt。

---

## P-COM-00 — 雨夜搬家

~~~text
請在 repo `TsungmingLiu/seventeen-floor-neighbor` 製作 Opening Vertical Slice scene `COM-00 雨夜搬家`。

先讀 `PROJECT_STATE.md`、`docs/narrative/CONTENT_PRODUCTION_TODO.md`、braided narrative spec、route/state spec、art requirements、setting proposal。不要依賴舊 playable story。

目標：這是作品開場，不是 heroine showcase。男主剛搬回台北，生活很有秩序但新家仍空；許棠只是住很久的隔壁鄰居，順手扶門／幫挪一個卡住的箱子。第一印象要自然、克制、有一點乾式幽默，不交換聯絡方式、不命定感、不過度曖昧。

請：
1. 建立／更新 `docs/narrative/scenes/vertical-slice/COM-00.md`。
2. 寫完整 S1：narration、dialogue、2–3 個合理 choice、每個 choice 的短 response 與 rejoin。
3. Choice 只塑造 tone / minor stats，不設明顯最佳答案。
4. 標註 BG-APT-17F-RAIN、XT-SPR-WEEKDAY expressions、CG-COM-01 出現 timing。
5. 寫 entry/exit state：`met_xu_tang=true` 等。
6. 控制文字，不要把 CG 已表現出的雨夜、距離、漂亮再旁白解釋一次。
7. 讓許棠像27歲、170cm、成熟都市女性，不是少女模板。
8. 完成後只勾 COM-00 S1，給我完整可讀版 review；不要自行進 S2 或下一 scene。
~~~

---

## P-COM-01X — 電梯重啟

~~~text
請製作 repo `TsungmingLiu/seventeen-floor-neighbor` 的 scene `COM-01X 電梯重啟`。

先讀 canonical production TODO、COM-00 已完成 scene file、braided narrative spec、route/state spec、art requirements。沿用已鎖定的人物 voice。

這是一個數天後的短 scene。電梯只是短暫停住／系統重啟，不是災難，也不要拿幽閉恐懼製造廉價親密。目的只是讓男主與許棠第一次真正聊天，建立她乾、自然、熟悉這棟樓的感覺。

請：
- 寫完整 S1 script；
- 2–3 個 tone choices：幽默／實際／安靜陪等，都必須合理；
- 不設「救她」「保護她」情節；
- 對話內容以大樓、附近生活、搬家第一週等低 stakes 話題為主；
- 結尾到17樓自然分開，不硬延長；
- 標註 BG-APT-ELEVATOR、XT-SPR-WEEKDAY expression changes；
- optional 停電手機光 CG 若不值得就明確標 P2，不為了有CG而有CG；
- 更新 state contract，但不要製造過多 flags；
- 寫入 `docs/narrative/scenes/vertical-slice/COM-01X.md`；
- 只勾 S1，呈現給我 review，停下等待。
~~~

---

## P-COM-01J — 地下街初遇

~~~text
請製作 `COM-01J 地下街初遇`，repo 是 `TsungmingLiu/seventeen-floor-neighbor`。

先讀 CONTENT_PRODUCTION_TODO、COM-00/COM-01X scene files、canonical braided narrative / route-state / art specs。

目的：江雨澄第一次登場必須靠「共同興趣」而不是搭訕 trope。男主是真心在看設定集／遊戲相關物；她也在同一架比較兩本。男主只針對作品講一句具體看法，她短答，發現他真的懂後才多講幾句。這次不交換名字、不交換聯絡方式。

要求：
- 江雨澄23歲成年研究生，不要幼態化、社恐萌化、英雄救美。
- 男主不能因她漂亮而硬搭話。
- 對話要讓玩家看到她對作品有具體判斷，但初期 social latency 仍存在。
- 2–3 個 local choices 應圍繞作品觀點／是否繼續聊，不是「稱讚她=加好感」。
- 標註 BG-ACG-SHOP、JYC-SPR-CAMPUS、CG-COM-02 timing。
- 所有 ACG IP / 書名保持虛構。
- 更新 `met_jiang_yucheng` / familiarity 等 state。
- 寫入 `docs/narrative/scenes/vertical-slice/COM-01J.md`。
- 只完成 S1 並回寫 TODO；完整呈現給我 review後停止。
~~~

---

## P-COM-02X — 深夜便利店

~~~text
請製作 `COM-02X 深夜便利店`。

Repo：`TsungmingLiu/seventeen-floor-neighbor`。先讀 CONTENT_PRODUCTION_TODO、前三個已完成 scene files、canonical narrative / route / art specs。

目的：讓許棠從「漂亮鄰居」變成有晚餐、咖啡、deadline、疲憊狀態的普通27歲成年人。她穿居家 casual，在樓下便利店遇到工作到晚的男主，第一次自然叫出他的名字。

要求：
- 生活感 > 戀愛事件感。
- 她叫得出名字要有合理來源，例如快遞／門牌，不要神秘全知。
- choice 可以談附近吃什麼、工作作息、輕鬆吐槽；「妳應該好好吃飯」可以是略有界線感但不是大扣分。
- 不要把居家服色情化。
- 標註 BG-CONVENIENCE-NIGHT、XT-SPR-LATE-CASUAL、CG-COM-03 timing。
- CG 重點是冷白便利店光下的真實疲憊，不是 pin-up。
- 寫入 COM-02X scene file，完成 S1，回寫 TODO，給我 review後停止。
~~~

---

## P-COM-02J — 咖啡店重逢

~~~text
請製作 `COM-02J 咖啡店重逢`。

先讀 repo canonical docs與 COM-01J。這次重逢不能只是第二次巧遇：第一次地下街 scene 要能支持「她曾隨口提過附近安靜的 cafe」，男主後來需要找地方工作所以去了，才看見她在畫圖。

目的：
- 正式交換名字；
- 看見她一談作品就變得比較有話；
- 建立她會先認出男主、但猶豫幾秒才打招呼的性格；
- 不急著曖昧。

要求：
- tablet/stylus 行為自然；
- choice 以「問她畫什麼／延續上次作品／泛稱好厲害」等現實互動為主；
- 具體興趣比泛稱稱讚更有 connection，但不要讓第三個選項像笨蛋答案；
- 標註 BG-CAFE-STATION、JYC-SPR-CAFE、CG-COM-04；
- 寫 state / Memory intent；
- 寫入 COM-02J.md，只完成 S1，更新 TODO，呈現給我 review後停止。
~~~

---

## P-COM-03X — 包裹 / Line

~~~text
請製作 `COM-03X 包裹 / Line`。

Repo：`TsungmingLiu/seventeen-floor-neighbor`。先讀已完成 COM-00/01X/02X scene files及 canonical specs。

目的：用自然實用理由交換許棠的 Line。她的印刷樣本／設計打樣被放錯在男主門口。包裹本身也讓玩家更具體知道她的工作。

要求：
- 門口聊天第一次超過五分鐘，但不能像突然站在門口深談人生。
- 交換 Line 的理由要實用：附近店家／大樓包裹資訊／她要把資料傳給男主等。
- 不要寫成男主「終於拿到電話」的攻略獎勵語氣。
- 許棠可以記得男主之前某個小細節，顯示她觀察力。
- 不需要新 CG，優先 reuse BG-APT-17F-DAY/NIGHT + XT-SPR-WEEKDAY。
- state 至少包含 `contact_xu=true`，不要濫建 flag。
- COM-03X 不一定有獨立 W4 Memory card，標註可被 COM-03M 壓縮。
- 寫入 COM-03X.md，完成 S1、回寫 TODO、給我 review後停止。
~~~

---

## P-COM-03J — 推薦 / Discord

~~~text
請製作 `COM-03J 推薦 / Discord`。

先讀 COM-01J、COM-02J、CONTENT_PRODUCTION_TODO 與 canonical specs。

目的：第一次完整展示 Offline Jiang Yucheng / Online Jiang Yucheng 的反差，但必須讓玩家覺得「這是同一個人有不同安全感」，不是人格切換 gimmick。

Beats：
- 她想到某個作品／遊戲推薦；
- 自然交換 Discord/Line；
- 晚上她在線上突然連發 meme、截圖、長篇分析；
- 男主第一次意識到文字裡的她比本人吵很多。

要求：
- 寫出真實聊天節奏：短訊、連發、刪改、回覆時間，而不是把 face-to-face dialogue 原樣塞進 chat bubble。
- 她熟悉的題材要有具體觀點與吐槽能力。
- 男主 response choices 應顯示幽默／認真／實際 style，不要有「理解她所以+好感」的心理測驗。
- UI scene 不需要 CG。
- state：`contact_jyc=true` 等。
- 寫入 COM-03J.md，只做 S1、更新 TODO、給我 review。
~~~

---

## P-COM-03M — 一週訊息 montage

~~~text
請製作 `COM-03M 一週訊息 montage`。

先讀 COM-03X / COM-03J 與前面所有 vertical-slice scene files。

這一幕不是 exposition dump，而是用一週碎片讓玩家開始期待兩種不同 notification：
- 許棠：包裹、大樓、附近吃飯、「吃了嗎」等短、生活化訊息；
- 江雨澄：meme、遊戲、作品、深夜長分析、線上反差。

要求：
- montage 要有時間感與節奏，不要只是列聊天截圖。
- 最少安排 3–4 個 Xu micro-beats、3–4 個 JYC micro-beats，穿插而非分成兩大段。
- 某些訊息可以沒有 player choice；只在真正能塑造互動 style 的地方給 choice。
- 不讓兩人同時一天到晚傳訊息，避免角色看起來沒生活。
- 玩家要開始感覺「看到 notification icon 就大概知道是誰」。
- 結尾自然解鎖 Open Dating，而不是跳出「請選 heroine」。
- 主要使用 chat montage UI，不需新 CG。
- 寫入 COM-03M.md，只完成 S1、回寫 TODO、呈現給我 review。
~~~

---

## P-XT-04 — 中山書店

~~~text
請製作 `XT-04 中山書店`。

先讀所有已完成 common vertical-slice scenes、CONTENT_PRODUCTION_TODO、canonical narrative / route / art specs。

這是許棠第一次真正 1-on-1，但兩人都不明說是 date。

目的：
- 玩家因她投入設計／攝影書的樣子喜歡她；
- 測 pace compatibility，但不要做「陪她=正解」心理題；
- 結尾由許棠主動把相處延長到咖啡，證明 attraction reciprocal。

要求：
- 有真實中山獨立書店節奏：找書、走散半個書架、翻大畫冊、原定下一站逐漸不重要。
- choice 至少包含：一起慢慢逛、合理提醒行程、帶點乾式玩笑；三者都要像正常成年人。
- 如果提醒行程，只表示生活節奏可能不同，不要立刻負面懲罰。
- 許棠要展現工作專業與審美，不是單純漂亮文青。
- 標註 BG-BOOKSTORE、XT-SPR-BOOKSTORE、CG-XT-01。
- CG timing 應在她投入書本的瞬間，而不是正面擺拍。
- 寫入 XT-04.md，只做 S1、回寫 TODO、給我 review。
~~~

---

## P-JYC-05 — ACG：她的主場

~~~text
請製作 `JYC-05 ACG：她的主場`。

先讀 common scenes、尤其 COM-01J/02J/03J/03M，保持江雨澄的 online/offline continuity。

目的：玩家第一次看到「她不是沒話說，只是大多數環境不是她的主場」。

要求：
- 她帶路、比較版本、講設定、批角色設計、吐槽商業決策，必須真的有 competence。
- 對店員仍可能卡，但不能因此變 helpless。
- 男主可以不懂某些細節，也可以被她糾正。
- choice 可包括認真跟上、提出不同作品觀點、下意識替她回店員；都需合理。
- 有一個純娛樂 reward beat，例如周邊／抽選；不要幼態化。
- 標註 BG-ACG-CORRIDOR/SHOP、JYC-SPR-ACG、CG-JYC-01 / optional CG-JYC-02。
- 在這一幕或附近埋下她曾想做 prints / 小誌 / creator table 的 very light foreshadowing，為 JYC-12 準備，但不要顯得在預告主線。
- 寫入 JYC-05.md，只完成 S1、回寫 TODO、呈現給我 review。
~~~

---

## P-JYC-06 — Gaming Night

~~~text
請製作 `JYC-06 Gaming Night`。

先讀 JYC 前序 scene files與 canonical specs。

目的：
- 由 online co-op 自然過渡到同空間 gaming；
- 她從 guest mode 慢慢變 relaxed；
- 建立「不需要一直說話也舒服」的 intimacy；
- 為 SH-01 第一次17樓同框提供自然 continuity。

要求：
- 江雨澄遊戲能力可以真的比男主強。
- 「故意讓她贏」「一直教她」都不應被當貼心。
- 互動要有 competition、吐槽、靠枕、零食、各自滑手機等生活細節。
- 不要把第一次到男主家寫成色情暗示主場；她有明確 agency / boundary。
- 需要明確決定她是來男主家還是其他可行場地，並確保離開時能自然觸發 SH-01。
- 標註 BG-PC-HOME-LIVING、JYC-SPR-GAMING、CG-JYC-03。
- 寫入 JYC-06.md，只完成 S1、更新 TODO、給我 review。
~~~

---

## P-SH-01 — 17樓第一次同框

~~~text
請製作 `SH-01 17樓第一次同框`。

先讀所有已完成 vertical-slice scene files，尤其 JYC-06、COM-03X 與 route/state spec。

目的：第一次讓兩條關係物理重疊，只建立 knowledge，不進入修羅場。

要求：
- 雨澄出現在17樓必須由 JYC-06 continuity 自然導出。
- 許棠出現是因為她住隔壁，不是劇本硬安排。
- 男主自然介紹兩人。
- 只有數十秒到一兩分鐘，不寫長談。
- 兩位女主基本禮貌，不敵視、不搶男主、不互嗆。
- 不使用「空氣凝固」「氣氛尷尬」等旁白代替寫作；讓停頓、稱呼、站位、誰先開門、誰先走來製造 tension。
- 精確更新：
  `xu_knows_jyc_exists=true`
  `jyc_knows_xu_exists=true`
  `jyc_knows_xu_is_neighbor=true`
  其他 knowledge 只有 scene 真正透露才更新。
- 標註 BG-APT-17F-NIGHT、兩人 sprites、CG-SH-01 optional/P1 timing。
- 寫入 SH-01.md，只完成 S1、回寫 TODO、給我 review。
~~~

---

# 11. Asset-production prompts

---

## P-A0 — Identity preflight

~~~text
請在 repo `TsungmingLiu/seventeen-floor-neighbor` 執行 Content Production 的 A0 Identity Preflight，不要生成新圖片，也不要改 W3/W4 engine。

先讀：
- `docs/narrative/CONTENT_PRODUCTION_TODO.md`
- `content/characters/xu_tang.json`
- 江雨澄目前所有 character metadata / reference entries
- `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`
- setting proposal
- 目前 asset recipes / source-map / Drive metadata 中與兩位 heroine identity 有關的項目

任務：
1. 確認許棠 canonical metadata 已完全一致：27歲 / 約170cm / approved face identity 不變。
2. 找出 repo 中任何殘留的舊年齡、身高、identity instruction。
3. 確認許棠 primary identity + canonical identity sheet 的引用仍有效且沒有 generational-drift workflow。
4. 確認江雨澄是否已有完整 canonical identity pack；若缺，列出缺少哪些 turnaround / expression / full-body / outfit anchors。
5. 整理兩位 heroine production reference filenames / source IDs / Drive IDs / recipe references。
6. 不要憑空發明不存在的 Drive ID；缺失就標 TODO。
7. 將結果寫入一個簡潔的 identity preflight section 或適當 canonical character metadata；不要另建競爭性 Character Bible。
8. 回寫 CONTENT_PRODUCTION_TODO A0 checkbox，只勾真正完成的項目。
9. 最後給我一個表格：Item / Current source / Status / Drift / Required action。

若需要我重新提供或選定 identity image，明確指出哪一張、為什麼；除此之外不要讓我重複已在 repo 的資訊。
~~~

---

## P-A1 — Opening reusable backgrounds

~~~text
請為 `TsungmingLiu/seventeen-floor-neighbor` Opening Vertical Slice 準備 A1 Background Production Pack。

先讀 CONTENT_PRODUCTION_TODO、所有已鎖定或最新 scene files、`PROTOTYPE_ART_REQUIREMENTS.md`、architecture 的 9:16 / safe-zone contract、現有 `content/recipes/assets.json`。

範圍只包含：
- BG-APT-17F-RAIN
- BG-APT-17F-NIGHT
- BG-APT-ELEVATOR
- BG-ACG-SHOP
- BG-CONVENIENCE-NIGHT
- BG-CAFE-STATION
- BG-BOOKSTORE
- BG-ACG-CORRIDOR
- BG-PC-HOME-LIVING

任務：
1. 逐項確認是否已有可接受 master / recipe；能 reuse 就不要重生。
2. 對需要新生成的 background，建立完整 generation recipe：
   assetId、scene用途、prompt、negative constraints、camera、lighting、9:16 aspect、resolution、focal point、dialogue safe zone、crop tolerance、source path、runtime ID。
3. 背景原則上無主要人物，避免把 scene-specific character 烤進 reusable BG。
4. 禁止真實商標、真 ACG IP、可讀亂碼招牌。
5. 同一地點的 variant 優先保持 layout continuity，不要每個時間段變成不同建築。
6. 將 recipe 寫入 repo canonical recipe source，而不是只在聊天裡給 prompt。
7. CONTENT_PRODUCTION_TODO A1 中，只有 recipe-ready 或 accepted-master 狀態明確時才更新對應進度；「寫了 prompt」不等於「圖片已生成」。
8. 最後輸出 Generation Queue，按 P0/可重用價值排序，讓我可以逐張去生成。

不要替我假裝完成 S8/S9；圖片必須由我實際生成/選定後才能勾。
~~~

---

## P-A2 — Opening sprite sets

~~~text
請為 `TsungmingLiu/seventeen-floor-neighbor` 準備 Opening Vertical Slice 的 A2 Sprite Production Pack，不生成圖片本身。

先讀：
- CONTENT_PRODUCTION_TODO
- 最新 scene files
- Xu/JYC canonical character metadata / identity references
- PROTOTYPE_ART_REQUIREMENTS
- 現有 asset recipes

範圍：
Xu:
- XT-SPR-WEEKDAY
- XT-SPR-LATE-CASUAL
- XT-SPR-BOOKSTORE

JYC:
- JYC-SPR-CAMPUS
- JYC-SPR-CAFE
- JYC-SPR-ACG
- JYC-SPR-GAMING
- JYC-SPR-CASUAL

任務：
1. 每個 set 定義 outfit、hair、makeup、props、full/3/4 framing、透明背景需求。
2. 每個 set 列出 Opening Vertical Slice 真正需要的 expressions，不要一口氣生成20個幾乎相同表情。
3. 對每個 expression 定義 head pose / gaze / emotional tell，避免所有圖都是同一三分之四抬頭角度。
4. 許棠固定為27歲/170cm成熟都市女性；江雨澄23歲/160cm、纖細小骨架、腿相對偏長的成年研究生，不幼態化。
5. 所有生成必須引用 primary identity + canonical identity sheet，禁止只以上一張 sprite 作唯一 identity source。
6. 建立/更新 canonical asset recipes，包括 prompt、negative constraints、safe-zone、source path、runtime ID。
7. 根據 scene reuse 次數排序 generation queue。
8. 不勾 S8/S9，直到 Human 真正生成並 QA。

最後給我一份可直接照順序生成的清單：asset ID → reference → prompt/recipe location → expressions → expected file path。
~~~

---

## P-A3 — Vertical Slice CG queue

~~~text
請為 `TsungmingLiu/seventeen-floor-neighbor` Opening Vertical Slice 準備 A3 Special CG Production Queue。

先讀所有最新 vertical-slice scene files，尤其每幕的 CG timing，再讀 `PROTOTYPE_ART_REQUIREMENTS.md`、`CHARACTER_REFERENCE_PACK_SPEC.md`、`VERTICAL_SLICE_CG_GENERATION_PROMPTS.md` 與 9:16 composition contract。

範圍：
P0：
- CG-COM-01 雨夜搬家
- CG-XT-01 書店午後
- CG-JYC-01 ACG 主場
- CG-JYC-03 Gaming Night

P1：
- CG-SH-01 17樓三人第一次同框
- CG-COM-02 地下街初遇
- CG-COM-03 深夜便利店
- CG-COM-04 咖啡店畫圖
- CG-JYC-02 小周邊 reward

任務：
1. 先判斷每張是否真的值得 CG；如果 scene lock 後某張變得重複，可建議降級／取消，但不要自行刪 canonical slot，先說明。
2. 對每張產生 production-ready recipe：
   - narrative purpose
   - exact scene beat / trigger timing
   - character reference inputs
   - outfit / hair / expression
   - camera / framing / head pose
   - body action / hand interaction
   - environment continuity
   - lighting
   - 9:16 safe zone / focal point
   - negative constraints
   - source path / runtime ID
3. 避免每張都正面看鏡頭、站著擺拍。
4. 玩家男主如果沒有完整 visual bible，優先使用 POV、手臂、肩背、局部 silhouette；不要忽然生成固定男主臉。
5. CG 必須提供「立繪+背景做不到的額外情緒」，否則不值得成本。
6. 把 recipe 寫進 repo canonical asset recipe source。
7. 最後給我按生成順序排列的 queue，先 P0，再 P1；每張附 identity QA / hands QA / crop QA 要點。
8. 不假裝圖片已生成；S8/S9 等我實際選圖後再更新。
~~~

---

# 12. Structured-content / QA / integration prompts

---

## P-SKELETON — 66-node machine-readable content skeleton

~~~text
請在 repo `TsungmingLiu/seventeen-floor-neighbor` 建立 braided narrative v0.5 的 machine-readable authoring skeleton，但暫時不要把它接入 W3/W4 runtime player。

開始前讀：
- ARCHITECTURE.zh-TW.md
- PROJECT_STATE.md
- root TODO.md
- docs/narrative/CONTENT_PRODUCTION_TODO.md
- PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md
- PROTOTYPE_ROUTE_GRAPH_AND_STATE.md
- PROTOTYPE_ART_REQUIREMENTS.md
- W4 Memories spec

前置 gate：只有在 Opening Vertical Slice 的 voice / scene structure 已經基本穩定時才做；如果 CONTENT_PRODUCTION_TODO 顯示還沒有達到這個階段，先停止並告訴我原因，不要過早固化。

目標：
為目前約66個 authoring-level IDs 建立 data skeleton，驗證 braided design 可以用現有 generic content architecture 表達。

每個 item 至少需要：
- stable authoring ID
- title
- kind: scene / gate / reactive / window / ending / afterstory / coda
- hard prerequisites
- soft/reactive inputs
- conditions
- main state outputs
- heroine relationship ownership / shared
- Memory Event mapping or none
- progress band/rank guidance
- required BG IDs
- required sprite sets
- required CG IDs
- sfw/full profile availability
- next structural targets

要求：
1. 不把 final dialogue 大量塞進 skeleton。
2. 不新增早期 `route_primary` 來破壞 braided model。
3. recentFocus ≠ exclusivity；dating two people ≠ deception。
4. knowledge flags 只能由真實 scene 更新。
5. full-only mature After Story node 必須能被 sfw compiler prune。
6. 先選最符合現有 repo architecture 的 content path/schema；若現有 schema 不足，提出最小增量，不要直接重寫 framework。
7. 加 validation：duplicate IDs、dangling dependencies、unknown asset refs、impossible structural targets。
8. 不修改 W3/W4 player rendering。
9. 更新 CONTENT_PRODUCTION_TODO 中 Structured-content skeleton checkbox。
10. 最後給我：檔案清單、schema decision、66-node coverage、validator結果、仍未表達的需求。

若發現 architecture 真 blocker，停在清楚的 design proposal，不要自行把 architecture 大改。
~~~

---

## P-VS-REVIEW — Opening Vertical Slice holistic review

~~~text
請對 `TsungmingLiu/seventeen-floor-neighbor` 的 Opening Vertical Slice 做一次嚴格的 holistic narrative review，不要直接重寫。

先讀：
- CONTENT_PRODUCTION_TODO
- 所有 `docs/narrative/scenes/vertical-slice/*.md`
- braided narrative spec
- route/state spec
- art requirements
- setting proposal

把它當成你第一次玩一款台北成人戀愛 VN，按實際順序閱讀：
COM-00 → COM-01X → COM-01J → COM-02X → COM-02J → COM-03X → COM-03J → COM-03M → XT-04 / JYC-05 / JYC-06 → SH-01。

請從以下維度診斷：
1. Hook：前5分鐘是否足以讓玩家繼續？
2. Pacing：哪裡拖、哪裡太快？
3. Coincidence credibility：哪次相遇最像編劇安排？
4. Voice：男主/許棠/雨澄是否能遮住名字仍辨認出來？
5. Attraction：玩家為什麼會喜歡各自？是否只靠外型/人設標籤？
6. Reciprocity：女主是否也在觀察、照顧、主動選擇男主？
7. Choice quality：是否有 obvious writer-approved option？
8. Therapy-speak：是否有人太會分析自己？
9. Braided feeling：另一位 heroine 是否在偏向一條線時仍像活在世界裡？
10. SH-01 是否是自然 tension，不是廉價修羅場？
11. Art economy：哪些 CG 真值得，哪些只是 expensive illustration？
12. Text-art redundancy：哪些旁白在重複圖片已經說的事？
13. Mobile/W4：9:16和Memory representation 是否有 narrative 問題？
14. Scope：若刪掉10–15%的文字，最該刪哪裡？

輸出：
- Executive diagnosis
- Must fix before production lock
- Strong but optional improvements
- Scene-by-scene notes
- Lines/beats most likely to cut
- Art changes
- Final recommendation: 哪些 scene 可 lock，哪些必須回爐

先只提供 review，不修改 canonical files。等我批准後再執行修改。
~~~

---

## P-S10 — Runtime integration when W4 is ready

~~~text
W3/W4 現在已經可供內容 integration。請把 `TsungmingLiu/seventeen-floor-neighbor` 的 Opening Vertical Slice 接入 runtime，但不要重新設計劇情。

先讀：
- PROJECT_STATE.md / root TODO.md / ARCHITECTURE.zh-TW.md
- W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md
- CONTENT_PRODUCTION_TODO.md
- 已 production-lock 的 vertical-slice scene files
- machine-readable braided skeleton（若已建立）
- art requirements / accepted asset metadata

只整合已達 S4–S9 且 Human 接受的 scene/assets；草稿不要進正式 runtime。

要求：
1. stable semantic runtime IDs。
2. 將 authoring scene 拆成 dialogue/narration/choice/action nodes，但保持 scene intent。
3. conditions/actions 對應 F/T/C/K、focus、knowledge flags。
4. Memory Event ≠ raw story node；依 W4 metadata 建立 replay anchors / progress ranks / cover assets。
5. replay cursor/frontier 語意不得倒退。
6. 不讓 early focus 關閉另一 heroine。
7. 接 accepted assets，驗證 logical asset IDs / safe-zone / focus metadata。
8. build/validate/test；不手改 generated dist。
9. 更新 CONTENT_PRODUCTION_TODO S10，只有真正整合成功的 scene 才勾。
10. 給我 playable entry / preview 方法與 integration diff summary。

若現有 W4 schema無法表達某一已批准內容需求，先提出最小架構修改並說明影響，不要用 one-off hardcode 掩蓋。
~~~

---

## P-S11 — In-game playtest session

~~~text
請對已整合到 `TsungmingLiu/seventeen-floor-neighbor` runtime 的 Opening Vertical Slice 做實際 player-perspective playtest。

先讀 canonical production docs，但這次 review 要以「實際遊戲體驗」優先，不要只看 Markdown。

請測：
- mobile 9:16 首要；
- desktop centered 9:16；
- title → Continue/Start；
- dialogue pacing；
- choice layout；
- sprite/CG切換；
- scene transitions；
- chat/montage表現；
- SH-01 crossover；
- Memories unlock / replay；
- CG Gallery unlock；
- reload/save；
- replay後frontier不倒退；
- 320px layout；
- slow-loading image fallback若可測。

Narrative QA：
- 哪句台詞在畫面裡顯得太長？
- 哪段因CG存在而應刪旁白？
- 哪個 choice 實際點起來比文檔看起來更明顯？
- 哪個 sprite expression 不合台詞？
- 哪一幕實際時間過長？
- 玩家是否自然想看下一幕？

把問題分成：
Content / Asset / Compiler / Player。

不要直接靠 hardcode 修問題。先修正真正所屬層，build/validate/test，更新對應 scene 的 S11 checkbox，只在實際通過時勾。

最後提供：
- critical blockers
- narrative polish
- asset issues
- UI/runtime issues
- scene-by-scene playtime estimate
- 是否可進 S12。
~~~

---

## P-S12 — Final polish / Vertical Slice lock

~~~text
請對 `TsungmingLiu/seventeen-floor-neighbor` Opening Vertical Slice 執行 S12 Final Polish，前提是 S11 playtest 已完成並有 review findings。

先讀：
- CONTENT_PRODUCTION_TODO
- production-lock scene files
- S11 playtest findings
- canonical narrative / route / art specs
- runtime implementation

任務：
1. 只處理已被實機 playtest 證明的問題，不重新大改整個故事。
2. 刪除冗餘旁白與重複台詞。
3. 修正太明顯的 choice wording。
4. 微調 sprite expression / CG timing / focus metadata。
5. 保持 character continuity 與 approved state contract。
6. 重新 build/validate/test。
7. 跑一次從 COM-00 到 SH-01 的 smoke playthrough。
8. 更新 CONTENT_PRODUCTION_TODO S12 與 Batch gate。
9. 若所有 Vertical Slice stop conditions 通過，明確標記「Opening Vertical Slice production-locked」。
10. 產出一份非常短的 handoff：locked scenes、asset set、known deferred issues、下一個 production batch（XT-06 之後）可以開始與否。

不要因為「還能更好」無限 polish；只有真實 blocker 才阻擋 lock。
~~~

---

# 13. Prompt usage rule

推薦優先順序：

~~~text
新內容 session：
P-A → P-B → P-C → P-D

如果其中一幕需要單獨重做：
用對應 P-COM-xx / P-XT-xx / P-JYC-xx / P-SH-xx

平行資產工作：
P-A0 → P-A1 / P-A2 → P-A3

內容結構穩定後：
P-SKELETON

Vertical Slice 全部 S1–S9：
P-VS-REVIEW

W4 ready：
P-S10 → P-S11 → P-S12
~~~

重要：

- **不要同時開兩個主 writer session 改同一個 scene。**
- Parallel agent 可以做 review / QA，但 canonical dialogue 最終只由一個主 session 合併。
- 每個 prompt 執行前，AI 都必須先讀 repo current state；不要假設本文件的 checkbox 還是最新。
- Prompt 裡寫的 scene 範圍若和 repo 最新 canonical spec 衝突，以最新 canonical spec 為準，並在動手前指出差異。
