# COM-01J — 地下街初遇

> **Rendering supersession notice (2026-09-24):** this scene remains canonical for narrative, state, staging, wardrobe, expression, action timing, and continuity. Any older **9:16 / sprite / composite-rendering instruction** in this file is superseded for NEW production by `docs/art/PRODUCTION_VISUAL_DIRECTION.md` and the current Shot Planner harness. Do not rewrite narrative staging merely to preserve the old rendering mode.


## Status

- Production stage: **S4 Script Lock / S5 State Contract / S6 Art Shot Lock**
- Scope: Opening Vertical Slice / common Jiang entry
- Memory ownership: `common`
- Progress band: `140`
- Estimated play time: 5–7 minutes
- Lock rule:相遇必須由共同興趣成立；不得加入碰撞、掉東西、英雄救美、外貌搭訕或本幕交換姓名／聯絡方式。

## Canonical inputs

- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` — COM-01J
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
- `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`
- `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`
- `docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md` — CG-COM-02
- `docs/proposals/urban-dating-sim-setting-proposal.md`
- `docs/narrative/scenes/vertical-slice/COM-00.md`
- `docs/narrative/scenes/vertical-slice/COM-01X.md`

## Scene summary

同週末，男主為補齊一套自己真的關注的虛構科幻遊戲設定集，來到台北地下街的 ACG 店。江雨澄站在同一排書架前，比較《逆光航路》兩本不同內容的畫冊。男主不是對她搭話，而是針對版本差異說出一項具體、可驗證的觀察；她先短答，確認他不是硬找話題後，才補上自己在意的美術判斷。兩人聊到足以記住對方，卻沒有交換姓名或聯絡方式。離開前，她順口提到附近一間適合坐著翻書、畫圖的安靜咖啡店，為 COM-02J 建立 causal geography。

## Scene goal / dramatic question

- 玩家感受：雨澄安靜不是沒有觀點；她先判斷談話是否值得，再決定多說多少。
- 男主目標：找到正確版本的設定集；若談話成立就交換作品看法，不把互動轉成搭訕。
- 雨澄目標：比較兩本資料的實際內容；避免被店員／陌生人推銷式搭話，同時不錯過少見的具體作品討論。
- Dramatic question：兩個陌生人能否只靠對同一作品的具體興趣產生一段不帶社交債的連結？

## Unlock / entrance condition

```yaml
requires:
  - met_xu_tang == true
recommended_previous: COM-01X
```

- 時間：Week 1 週末，約 15:40。
- 地點：台北地下街虛構 ACG 設定集／周邊店。
- 男主不是陪人或隨便逛：他要找虛構遊戲《逆光航路》的新版世界設定集，知道舊版電子資料與實體增補版差異。
- 雨澄手上各拿一本：世界設定增補版、機械／角色設計稿。她在比較雨港篇素材與印刷色彩，不是選「哪本封面比較可愛」。
- 兩人互不知姓名、職業、住處。

## Fictional IP lock

- 系列暫名：`《逆光航路》`。
- 可談元素：雨港篇、殖民站、機械設計、色彩腳本、刪除場景設定。
- 所有封面、海報、模型在美術中只呈現虛構圖形，不生成可讀長文或近似真實 IP 的 logo。
- 後續若更換 fictional IP 名稱，COM-02J／COM-03J 必須同步，不可只改本幕。

## Beat sheet

| Beat | Runtime intent | Action / dialogue intent | Visual / expression | State |
| --- | --- | --- | --- | --- |
| 01J.1 男主有自己的目的 | establishing | 男主沿書架找特定系列，短旁白說明自己缺的是哪種內容，不用「我其實也很宅」自我標籤。 | `BG-ACG-SHOP`；無人物或雨澄作遠景 silhouette。 | none |
| 01J.2 同一格書架 | spatial setup | 雨澄已站在架前，兩本書各翻到索引／跨頁。男主停在不侵入她閱讀空間的位置，先看書脊與桌上展示本。 | `JYC-SPR-CAMPUS neutral_shy / thinking_before_reply`。 | none |
| 01J.3 Specific observation | inciting dialogue | 男主注意她正比較的兩版，說一句只針對作品的具體資訊；語法可像自言自語或禮貌提示，讓她能不回。禁止「妳也喜歡這個？」 | 她先看書，再側頭。**CG-COM-02 trigger**。 | none |
| 01J.4 Social latency | character beat | 她停 1–2 秒，先用短句確認：「你看過舊版？」男主只回答事實，不趁機介紹自己。 | CG hold；`hesitant → interested`。 | none |
| 01J.5 Player topic choice | local branch | 玩家從世界設定、視覺設計、版本實用性三個角度回答。每條都證明真實興趣，但揭示不同 tone。 | dissolve 回 sprite；表情依分支。 | tone + optional topic record |
| 01J.6 她的判斷變長 | payoff | 雨澄不只同意；她提出一個具體不同意見或補充，例如新版色彩腳本完整，但機械圖註釋被縮得難讀。語速稍快，說到一半才意識自己講多。 | `talking_about_art` 等效表情；campus set 使用 `small_smile / thinking_before_reply`。 | none |
| 01J.7 留退路 | respect beat | 男主可以接一個追問或在對話自然停點收住。即使玩家選繼續聊，也只多 2–3 來回，不問私人資訊。 | 兩人仍分站書架兩側。 | none |
| 01J.8 Cafe seed | causal bridge | 男主提到想找地方坐著比較版本／還要處理一點工作。雨澄說地下街出口附近有間車站咖啡店，平日下午窗邊較安靜、店員不趕人；像實用推薦，不像邀約。 | `polite` / `small_smile`。 | `heard_station_cafe_from_jyc=true` |
| 01J.9 No-name exit | exit | 她先拿定其中一本或放回一本；人流讓兩人自然錯開。只說「那本如果只看雨港篇比較值得」之類作品收尾。男主沒有追上問名字。 | JYC sprite 淡出至地下街走道 transition。 | `met_jiang_yucheng=true`; `F_JYC +=1` |

## Emotion arc

```text
男主：專注找書
  → 注意到另一個人正在做同樣具體的比較
  → 試探性提供作品資訊
  → 發現她有比自己更細的視覺判斷
  → 想繼續，但接受談話停在作品

江雨澄：在熟悉內容裡專注
  → 陌生人出聲，先防備／評估
  → 確認對方真的看過作品
  → 觀點被啟動，說得比原本預期多
  → 在仍安全的節點主動結束
```

與許棠 scenes 的節奏差異：許棠先處理共同生活空間，再用乾話縮短距離；雨澄先檢查對方是否尊重題目本身，安全後才把句子拉長。

## Player choice / local branch

Choice prompt 接在雨澄問「你看過舊版？」之後。

| Choice ID | Player-facing intent（可微調字句） | JYC response intent | Stats / flags | Rejoin |
| --- | --- | --- | --- | --- |
| `com01j_worldbuilding` | 「舊版的雨港篇比較完整；新版補的是殖民站。」 | 她指出新版其實補了一張關鍵色彩腳本，從設定完整度轉到敘事用途。 | `mc_tone_serious +=1`; `jyc_first_topic=worldbuilding` | 01J.6 |
| `com01j_visual_design` | 「我想看實體印刷。電子版把夜景的層次壓掉了。」 | 她第一次立刻看男主，接著談色階與紙張；這條最直接打開她的專業興趣，但不額外加分。 | `mc_tone_observant +=1`; `jyc_first_topic=visual_design` | 01J.6 |
| `com01j_buying_practical` | 「如果只買一本，機械稿比較像資料；另一本比較適合從頭翻。」 | 她認同「用途不同」，補充索引與註釋的優缺點。 | `mc_tone_practical +=1`; `jyc_first_topic=edition_value` | 01J.6 |

Choice design notes：

- 三條均建立 genuine shared interest，沒有「稱讚她」選項。
- 不因玩家選視覺設計就給隱藏正解；`F_JYC +1` 是 scene base。
- `jyc_first_topic` 建議為單一 enum / choice history，不建立三個 boolean。
- 若 runtime 暫不支援 enum，可只保留 choice history，COM-02J 用對應 callback。

## Locked playable script

### `common_acg_first_meet_enter`

**Visual**：`BG-ACG-SHOP`。無角色近景；先看見設定集書架與虛構商品。

**Narration**：《逆光航路》的新版設定集比電子版晚了半年。網路上的評價很一致：印得漂亮，補了什麼沒人說得清楚。

**Narration**：我來找的就是「補了什麼」。

**Action**：男主走到設定集區。江雨澄已站在書架前，手上各翻著一本書。

**Visual**：`JYC-SPR-CAMPUS.thinking_before_reply`，3/4 側面，不看男主。

### `common_acg_first_meet_observation`

**Action**：她翻到其中一本索引，再對照另一本跨頁。男主停在書架另一側，不靠近她手邊。

**Protagonist**：如果是找雨港篇，那本少了舊版兩張色彩稿。

**Visual**：切入 `CG-COM-02`。

**Action**：她的眼睛先離開書頁，頭才微微轉過來。

**Jiang Yucheng**：你看過舊版？

**Protagonist**：看過電子版。排版很舊，內容比較完整。

### `common_acg_first_meet_choice`

1. `com01j_worldbuilding` — **「舊版的雨港篇比較完整；新版補的是殖民站。」**
2. `com01j_visual_design` — **「我想看實體印刷。電子版把夜景的層次壓掉了。」**
3. `com01j_buying_practical` — **「如果只買一本，機械稿比較像資料；另一本比較適合從頭翻。」**

#### Branch `com01j_worldbuilding`

**Visual**：回 BG + `JYC-SPR-CAMPUS.small_smile`。

**Protagonist**：舊版的雨港篇比較完整；新版補的是殖民站。

**Jiang Yucheng**：可是新版多了雨港停電那張色彩腳本。

**Jiang Yucheng**：那張其實把前面兩章的光源都解釋了。不是只有殖民站。

**Protagonist**：所以目錄寫得比內容保守。

**Jiang Yucheng**：或者編輯根本沒看圖。

→ Rejoin `common_acg_first_meet_rejoin`

#### Branch `com01j_visual_design`

**Visual**：回 BG + `JYC-SPR-CAMPUS.small_smile`。

**Protagonist**：我想看實體印刷。電子版把夜景的層次壓掉了。

**Jiang Yucheng**：對。暗部全部糊在一起。

**Jiang Yucheng**：實體版好一點，但這本的紙又太亮，翻到燈下面會反光。

**Action**：她把書頁偏離頂燈，示意反光位置；沒有把書遞給男主。

**Protagonist**：所以兩版各自壞一半。

**Jiang Yucheng**：差不多。

→ Rejoin `common_acg_first_meet_rejoin`

#### Branch `com01j_buying_practical`

**Visual**：回 BG + `JYC-SPR-CAMPUS.thinking_before_reply`。

**Protagonist**：如果只買一本，機械稿比較像資料；另一本比較適合從頭翻。

**Jiang Yucheng**：機械稿的索引比較好。

**Jiang Yucheng**：可是註釋縮得很小。真的要拿來查，會先看得很生氣。

**Protagonist**：聽起來妳已經試過了。

**Jiang Yucheng**：看過朋友那本。

→ Rejoin `common_acg_first_meet_rejoin`

### `common_acg_first_meet_rejoin`

**Visual**：`JYC-SPR-CAMPUS.small_smile`。

**Jiang Yucheng**：所以……你要買哪本？

**Protagonist**：目前的結論是，出版社很會讓人買兩本。

**Jiang Yucheng**：這點沒有版本差異。

**Action**：她把其中一本闔上，仍留在自己手裡。

### `common_acg_first_meet_cafe_seed`

**Protagonist**：這附近有能坐著翻書的地方嗎？我晚點還要處理一點工作。

**Jiang Yucheng**：北邊出口有一間咖啡店。

**Jiang Yucheng**：平日下午窗邊比較安靜，插座也有。店員不太趕人。

**Protagonist**：聽起來比這裡適合做決定。

**Jiang Yucheng**：這裡只適合做錯決定。

**Visual**：她說完才意識到自己接了兩次玩笑，表情回到 `polite`；不要 blush。

### `common_acg_first_meet_exit`

**Action**：有人從兩人中間的走道經過。雨澄往結帳方向退半步，男主讓開書架。

**Jiang Yucheng**：如果只看雨港篇，舊版比較值得。

**Protagonist**：那我先省下一本。

**Jiang Yucheng**：暫時。

**Action**：她拿著選定的書走向結帳。兩人沒有交換姓名，也沒有回頭追問。

**Narration**：我記住了版本差異，也記住了北邊出口那間咖啡店。

**Narration**：至於她是誰，今天沒有一定要知道。

**End actions**：`met_jiang_yucheng=true`；`relationship.jyc.familiarity +=1`；設定 `heard_station_cafe_from_jyc=true` 與 `jyc_first_topic`。

## State contract

### Conditions

```yaml
requires:
  - met_xu_tang == true
forbids:
  - met_jiang_yucheng == true
```

### Stats

```yaml
relationship.jyc.familiarity: +1
relationship.jyc.trust: 0
relationship.jyc.chemistry: 0
relationship.jyc.compatibility: 0
```

### Flags / knowledge

```yaml
set:
  met_jiang_yucheng: true
  heard_station_cafe_from_jyc: true
  jyc_first_topic: worldbuilding | visual_design | edition_value
unchanged:
  player_knows_jyc_name: false
  jyc_knows_player_name: false
  contact_jyc: false
  relationship.jyc.romanticSignal: false
```

- 不更新任何 Xu/JYC cross-knowledge；兩人尚不知道彼此存在。
- 不更新 `recentFocus`；這是 common encounter，不是 major social investment。

### Next structural targets

- 解鎖 `COM-02J`。
- Common sequence 可先進 `COM-02X` 再回 `COM-02J`，以交錯方式建立兩條 texture。

## Runtime / Memory intent

- 建議拆成 10–13 個 nodes，前綴 `common_acg_first_meet_*`。
- Memory title：**地下街初遇**。
- Memory cover：`CG-COM-02`；若 P1 尚未生成，用 `BG-ACG-SHOP` + JYC sprite composite，不顯示空 CG slot。
- Replay 必須保留玩家原先 `jyc_first_topic` 或以 replay-local state 顯示，不改寫 frontier save。

## Art needs

### Background

- `BG-ACG-SHOP` — P0。
- 書架需支援兩人站在不同側、設定集握持與 3/4 sprite；所有 IP、書名、包裝文字保持虛構或不可讀。
- 可用 `BG-ACG-CORRIDOR` 作進出店的 1–2 node transition，但本幕不要求新增特殊 variant。

### Sprite

- `JYC-SPR-CAMPUS` — Wardrobe A / Look 01 Campus / Graduate Student。
- Required expressions：`neutral_shy`, `hesitant`, `thinking_before_reply`, `small_smile`, `surprised`（極輕），均取自 canonical Campus set。
- Props：兩本設定／美術書；握法必須能在 sprite composite 自然成立，若 prop 難以跟透明 sprite共用，改由 BG foreground layer 提供一本展示書。
- 年齡表現：23 歲成年研究生；禁止學生制服、過大頭身、幼女化姿勢。

### CG

- `CG-COM-02` — P1。
- 這張 CG 的價值是捕捉她從「比較書」到「發現陌生人真的懂」的轉折；若只能畫成持書正面立像，應退回重做而不是接受。

## Art shot lock

### Shot A — Shared shelf establishing（locked）

- Camera：男主 POV，與雨澄保持約一臂半以上距離；書架形成縱深。
- JYC position：畫面中段偏右；先只看到她 3/4 側面與手上兩本書。
- Focal：她在比索引／跨頁，而不是外型掃描。
- UI safe zone：下方 25%；書封關鍵構圖在中段，不依賴可讀字。

### Shot B — CG-COM-02（locked）

- Trigger：男主說完第一句具體作品觀察，她尚未回答的 1–2 秒。
- Camera：第一人稱自然視高；可見男主手邊一本書角，不得出現男主臉。
- Composition：雨澄 3/4 持兩本書，一本略開；書架／虛構商品前後分層。
- Head pose / gaze：頭仍微朝書頁，眼睛先抬向男主，再輕微側頭；禁止驚艷正視鏡頭。
- Expression：`guarded_curiosity`，不是害羞紅臉或 instant crush。
- Lighting：乾淨人工店光，背景彩色商品柔焦；膚色自然。
- Dialogue safe zone：下方中央；臉與握書手在上半／中段。
- Negative constraints：無掉書、無撞擊、無蹲下撿物、無幼態臉、無真 IP、無亂碼成為視覺焦點、無錯誤手指。
- Hold / exit：持續到她問「你看過舊版？」；玩家 choice 前 dissolve 回 sprite，以支援不同 topic 反應。

### Shot C — Conversation distance（locked）

- 雨澄談得變多時仍站在原位，不自動向男主靠近。
- 表情變化由 `hesitant → interested → small_smile` 完成；不使用 blush。
- 收尾時她先回到書本／結帳動線，讓 visual blocking 自然關閉談話。

## Dialogue writing notes

### Jiang Yucheng voice lock

- 對陌生人第一個回答短，常在答前停一拍；不是每句都「嗯……」。
- 安全感上升後，句子由 4–8 字變成 15–25 字，內容密度明顯提高。
- 她可以直接不同意男主，但會把不同意放在作品細節上，不先做社交鋪墊。
- 她的可愛感來自思考節奏與說多後自己收住，不靠口吃、臉紅、內八或小動物旁白。

### Male protagonist

- 他談自己真正在看的作品，不展示百科知識、不把每句都變 witty banter。
- 不猜她是繪師；目前只能知道她對視覺設計有判斷。
- 不把她短答讀成拒絕，也不把她多說兩句讀成喜歡自己。
- 對話到了自然停點就讓開書架，這是尊重，不是消極。

### Sample line intents（非最終逐字稿）

- 開場只說版本事實，例如：「如果妳是找雨港篇，那本少了舊版兩張色彩稿。」
- 她的確認：「你看過舊版？」
- 她的觀點必須能糾正／補充男主，而不只是「對，我也覺得」。
- Cafe seed：「出口那邊有一間平日下午比較安靜。要翻這種書，不會一直有人從後面經過。」

### Prohibited beats

- 撞到她、接住她、撿起掉落物。
- 因外貌而搭話或旁白長篇評價她「可愛」。
- 稱讚她懂很多、她立刻自卑否認。
- 問名字、學校、社群帳號、聯絡方式。
- 男主準確判斷她社恐、匿名繪師或內在矛盾。
- 雨澄像客服一樣完整介紹咖啡店地址；只給足以讓 COM-02J 合理的生活資訊。

## End state

- `met_jiang_yucheng=true`, `F_JYC +1`。
- 兩人仍不知道彼此姓名，但能靠《逆光航路》與第一次談到的 topic 認出對方。
- 玩家已看到雨澄的核心節奏：先短答、判斷安全、進入作品後句子變長、在自己選的節點退出。
- 男主記住她提過的車站咖啡店，讓下一次相遇是 causal reuse，而不是純巧合。

## Review log

- Player-perspective pass：共同興趣具體到足以支撐交談，又不需要玩家真的了解虛構 IP 才能跟上。
- Character/continuity pass：無姓名／聯絡方式；COM-02J 的 cafe 來源已明確埋入。
- Choice pass：三項都是作品觀點，不存在「稱讚女生」式攻略按鈕。
- Voice contrast pass：與許棠的短乾生活語氣不同；雨澄在興趣打開後句長與資訊密度上升。
- Art pass：CG 捕捉認知轉折，不複製站立 sprite。
- Locked unresolved items：虛構 IP 名稱可在全體 content naming review 時替換，但必須跨 COM-01J／02J／03J 同步。
