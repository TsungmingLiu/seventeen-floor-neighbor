# Content Production TODO

> 狀態：Canonical creative-production backlog
>
> 版本：0.1
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
> - `docs/proposals/urban-dating-sim-setting-proposal.md`
> - `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`（只有涉及 Memories / replay / frontier 時）
>
> 原則：**這份 TODO 只記「做到哪裡」，不複製 scene spec。** 所有內容細節仍回 canonical spec 查。

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

在 W3/W4 尚未完成時，正常進度可以先做到 **S9**；S10–S12 後補。

---

# 3. Production batches

## Batch A — Voice Lock

**建議用一個獨立 session 完成，不要拆成三個 chat。**

### COM-00 — 雨夜搬家

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

### COM-01X — 電梯重啟

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

### COM-01J — 地下街初遇

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

### Batch A gate

- [ ] 男主第一人稱／旁白 tone 定稿
- [ ] 許棠初期 speech style 定稿
- [ ] 江雨澄初期 speech style 定稿
- [ ] 三人都沒有「AI 心理諮商口吻」
- [ ] opening 3 scenes 合起來 pacing 合理
- [ ] 第一批 art direction 可接受

---

## Batch B — Contact & Contrast

**第二個內容 session。**

### COM-02X — 深夜便利店
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

### COM-02J — 咖啡店重逢
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
- [ ] 許棠 approved identity sheet 最終確認仍適用
- [ ] 江雨澄 canonical identity pack 最終確認
- [ ] 兩位角色 production reference filenames / Drive IDs 整理

## A1 — Opening reusable backgrounds

- [ ] BG-APT-17F-RAIN
- [ ] BG-APT-17F-NIGHT
- [ ] BG-APT-ELEVATOR
- [ ] BG-ACG-SHOP
- [ ] BG-CONVENIENCE-NIGHT
- [ ] BG-CAFE-STATION
- [ ] BG-BOOKSTORE
- [ ] BG-ACG-CORRIDOR
- [ ] BG-PC-HOME-LIVING

## A2 — Opening sprite sets

- [ ] XT-SPR-WEEKDAY
- [ ] XT-SPR-LATE-CASUAL
- [ ] XT-SPR-BOOKSTORE
- [ ] JYC-SPR-CAMPUS
- [ ] JYC-SPR-CAFE
- [ ] JYC-SPR-ACG
- [ ] JYC-SPR-GAMING
- [ ] JYC-SPR-CASUAL

## A3 — Vertical Slice CG queue

- [ ] CG-COM-01 — 雨夜搬家 — P0
- [ ] CG-XT-01 — 書店午後 — P0
- [ ] CG-JYC-01 — ACG 主場 — P0
- [ ] CG-JYC-03 — Gaming Night — P0
- [ ] CG-SH-01 — 17樓三人第一次同框 — P1
- [ ] CG-COM-02 — 地下街初遇 — P1
- [ ] CG-COM-03 — 深夜便利店 — P1
- [ ] CG-COM-04 — 咖啡店畫圖 — P1
- [ ] CG-JYC-02 — 小周邊 reward — P1

---

# 5. Structured-content skeleton

這條工作可與 W3/W4 並行，但**不要接 runtime player**。

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
