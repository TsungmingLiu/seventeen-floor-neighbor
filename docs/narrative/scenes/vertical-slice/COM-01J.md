# COM-01J — 地下街初遇

## Current authorized weekend/weekday design — ND-ARC-001

- Lifecycle: **CANONICAL** task-local Narrative Design amendment, 2026-10-04. Source ref: `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9`. Human 授權本輪方向與必要改寫；本 pass 沒有新 final prose、QA、runtime 或 CG acceptance。
- Owning design: `docs/narrative/JYC_WEEKEND_WEEKDAY_REVISION.md`；current contract: `content/production/narrative/opening-ch1/COM-01J.json`。此 design section 與 current JSON 取代下方 baseline 的衝突時序／gate；下方 enter→rejoin 舊 Locked prose 原文保留；本輪僅改 cafe_seed／exit 並加入 purchase／home_return。舊 coda 保留於文末歷史區，不參與編譯；本輪稿待獨立 Narrative QA。
- 保留初遇，修改購書出口：四個 dialogue unit 之一，限 cafe_seed／exit coda 的時間意圖及購書／回家結尾。從 enter 到 rejoin、三個 topic 分支全部保留。咖啡推薦是供後續平日使用，刪除同次外出立刻去 cafe 的承諾。雨澄離開後，我實際買到原本想要的世界設定增補版並回家；同週末接 COM-02X。無姓名／contact。
- Stable ID plan：common_acg_first_meet_purchase/home_return；現有 common_acg_first_meet_* 及三個 com01j_* topic IDs 保留。
- 永久排除：本輪 `com01b_weekday_street_walk` 才寫 `jyc_permanently_excluded=true`。此 flag 先於 contact/history，永不由 merge、reload、scheduler、public shared scene 或 ordinary invite 清除。Memory replay 限自己的 snapshot，不向 live 主線寫入；改走前一分岔屬另一 playthrough，不是本輪 reopening。
- Semantic visual impact 與四個必要 dialogue units 見 owning design；現有 accepted image bytes、QA/Human 歷史都保留。獨立下游才裁決哪些畫面可重用。

## Current dialogue revision — CW-COM-01J-001


> **Rendering boundary:** this scene remains canonical for narrative/state/staging and semantic visual beats. Older 9:16/sprite/composite instructions are historical annotations; new render-ready decisions belong to the canonical CG manifest produced by `cg_planner`.


## Status

- Current production stage: **scene_dialogue complete / writer PASS**；本輪沒有新 QA 或 Art Shot acceptance。
- Historical production stage: **S4 Script Lock / S5 State Contract / S6 Art Shot Lock**。
- Scope: Opening Vertical Slice / common Jiang entry
- Memory ownership: `common`
- Progress band: `140`
- Estimated play time: 5–7 minutes
- Lock rule:相遇必須由共同興趣成立；不得加入碰撞、掉東西、英雄救美、外貌搭訕或本幕交換姓名／聯絡方式。

## Canonical inputs

- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` — COM-01J
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
- `docs/art/PRODUCTION_VISUAL_DIRECTION.md`
- `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`
- `docs/narrative/scenes/vertical-slice/COM-00.md`
- `docs/narrative/scenes/vertical-slice/COM-01X.md`

## Narrative Continuity Contract

- Canonical contract：`content/production/narrative/opening-ch1/COM-01J.json`。
- Exit label 是 `strangers_with_specific_shared_context`；`interested_but_bounded` 只描述作品討論被打開，不是 romantic attraction。

## Scene summary

同週末，男主為補齊一套自己真的關注的虛構科幻遊戲設定集，來到台北地下街的 ACG 店。江雨澄站在同一排書架前，比較《逆光航路》兩本不同內容的畫冊。男主不是對她搭話，而是針對版本差異說出一項具體、可驗證的觀察；她先短答，確認他不是硬找話題後，才補上自己在意的美術判斷。兩人聊到足以記住對方，卻沒有交換姓名或聯絡方式。離開前，她順口提到附近一間適合坐著翻書的咖啡店，留下後續平日下午可用的地理資訊。她離開後，我買好原本想找的世界設定增補版，帶回家翻閱，再接同週末晚間 COM-02X。

## Scene goal / dramatic question

- 玩家感受：雨澄安靜不是沒有觀點；她先判斷談話是否值得，再決定多說多少。
- 男主目標：找到正確版本的設定集；若談話成立就交換作品看法，不把互動轉成搭訕。
- 雨澄目標：比較兩本資料的實際內容；避免被店員／陌生人推銷式搭話，同時不錯過少見的具體作品討論。
- Dramatic question：兩個陌生人能否只靠對同一作品的具體興趣產生一段不帶社交債的連結？

## Unlock / entrance condition

```yaml
requires:
  - met_xu_tang == true
  - jyc_permanently_excluded == false
history_requires:
  common_bookstore_bridge_weekend_decision: com01b_bookstore_go
recommended_previous: COM-01B
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
| 01J.8 Cafe seed | causal bridge | 男主問附近是否有地方能安靜翻書。雨澄給平日下午可用的咖啡店推薦；男主留待往後，當日不赴 cafe。 | `polite` / `small_smile`。 | `heard_station_cafe_from_jyc=true` |
| 01J.9 No-name exit | exit | 她先拿定其中一本或放回一本；人流讓兩人自然錯開。只說「那本如果只看雨港篇比較值得」之類作品收尾。男主沒有追上問名字。 | JYC sprite 淡出至地下街走道 transition。 | `met_jiang_yucheng=true`; `F_JYC +=1` |
| 01J.10 Purchase | actual purchase | 她離開後，我繼續翻完展示本，為原本的閱讀目的選世界設定增補版，付錢帶走。 | 購書、收據與書袋的 semantic beat；不指定畫面。 | `weekend_book_purchased=true`，只在付錢完成後 |
| 01J.11 Home return | scene handoff | 我帶書回家，拆封對照電子版。當晚約 23:00 接 COM-02X 的購書分支。 | 晴朗週末回家、已購書在桌上；不指定畫面。 | 保留本幕實際知識 |

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

> Enter→rejoin retains its previous locked dialogue/action. The revised coda and local state markers await independent Narrative QA. Any `Visual` line below is a historical runtime transcript, not a current render instruction；new rendering uses `content/production/cg-manifests/opening-ch1.json` only。

### `common_acg_first_meet_enter`

**Visual**：`BG-ACG-SHOP`。無角色近景；先看見設定集書架與虛構商品。

**Narration**：《逆光航路》的新版設定集比電子版晚了半年。設定集區擺著世界設定增補版，旁邊是機械／角色設計稿。

**Protagonist (thought)**：網路上都說印得漂亮。我想看的倒是雨港篇究竟補了什麼。

**Action**：我走到設定集區。一位女生已站在書架前，手上各翻著一本書。

**Visual**：`JYC-SPR-CAMPUS.thinking_before_reply`，3/4 側面，不看男主。

### `common_acg_first_meet_observation`

**Action**：她翻到其中一本索引，再對照另一本跨頁。我停在書架另一側，不靠近她手邊。

**Protagonist**：雨港篇的話，那本新版少了舊版兩張色彩稿。

**Visual**：切入 `CG-COM-02`。

**Action**：她的眼睛先離開書頁，過了一拍才微微側過頭。

**Jiang Yucheng**：你看過舊版？

**Protagonist**：嗯，電子版。排版有點難翻，不過雨港那幾頁我記得。

### `common_acg_first_meet_choice`

1. `com01j_worldbuilding` — **「舊版雨港那段比較完整。新版補了殖民站，我以為重點移過去了。」**
2. `com01j_visual_design` — **「我想看實體印刷。電子版夜景暗的地方都糊在一起。」**
3. `com01j_buying_practical` — **「只買一本的話，機械稿比較像查資料；世界那本適合從頭翻。」**

#### Branch `com01j_worldbuilding`

**Visual**：回 BG + `JYC-SPR-CAMPUS.small_smile`。

**Protagonist**：舊版雨港那段比較完整。新版補了殖民站，我以為重點移過去了。

**Jiang Yucheng**：嗯……可是你看這張。雨港停電那段的色彩腳本，是新版才有的。

**Action**：她指著自己手上那本書的一角，沒有把書遞過來。

**Protagonist**：喔，目錄沒寫。我只看了目錄。

**Jiang Yucheng**：對。前面兩章的光從哪裡來，看這張才講得通。殖民站是補得比較多啦，但雨港也不只是重印。

**Protagonist**：那我剛剛講太早了。

**Jiang Yucheng**：也沒有。目錄真的看不出來。

**Action**：她翻回目錄，手指還停在剛才那張圖的頁碼上。

→ Rejoin `common_acg_first_meet_rejoin`

#### Branch `com01j_visual_design`

**Visual**：回 BG + `JYC-SPR-CAMPUS.small_smile`。

**Protagonist**：我想看實體印刷。電子版夜景暗的地方都糊在一起。

**Action**：她這次立刻抬眼看了我一下，又低頭看書頁。

**Jiang Yucheng**：對，暗部幾乎黏在一起。實體這本分得開，可是紙又太亮；你看，燈正好照在這裡。

**Action**：她把書頁偏離頂燈，示意反光位置；沒有把書遞給我。

**Protagonist**：喔，真的。要一直避著燈翻？

**Jiang Yucheng**：在這裡可能要。我也是剛剛才發現，顏色印回來了，翻起來又有點累。

**Protagonist**：嗯，這樣選還是很難。

**Action**：她看了那頁片刻，沒有急著把書闔上。

→ Rejoin `common_acg_first_meet_rejoin`

#### Branch `com01j_buying_practical`

**Visual**：回 BG + `JYC-SPR-CAMPUS.thinking_before_reply`。

**Protagonist**：只買一本的話，機械稿比較像查資料；世界那本適合從頭翻。

**Jiang Yucheng**：嗯，機械稿的索引比較好。

**Action**：她用手指沿著索引往下一行，再翻到圖旁的註釋。

**Jiang Yucheng**：可是註釋縮得太小了。朋友買的那本我翻過，查一個零件要湊很近，看到一半就先放回去。

**Protagonist**：可是妳現在還在看這本。

**Jiang Yucheng**：圖還是有用啊。就是……買之前想再看一次。

**Action**：她又翻回索引，像是還沒替自己決定好。

→ Rejoin `common_acg_first_meet_rejoin`

### `common_acg_first_meet_rejoin`

**Visual**：`JYC-SPR-CAMPUS.small_smile`。

**Jiang Yucheng**：所以……你要買哪本？

**Protagonist**：我本來只打算找世界設定那本。現在有點難說。

**Jiang Yucheng**：嗯。我也是還沒決定。

**Action**：她把其中一本闔上，仍留在自己手裡。

### `common_acg_first_meet_cafe_seed`

**Protagonist**：這兩本我可能還要想一下。這附近有哪裡能坐著翻書、不太吵的嗎？

**Jiang Yucheng**：北邊出口那間可以去看看。

**Jiang Yucheng**：週末這時候我不太確定會不會吵。平日下午窗邊滿安靜的，插座也有。坐久一點，店員不太會趕。

**Protagonist**：好，謝謝。平日有空再去看看。

**Jiang Yucheng**：嗯。這裡人太多，翻一頁要讓一次路。

**Visual**：她話音一停，表情回到 `polite`；不要 blush。

### `common_acg_first_meet_exit`

**Action**：有人從兩人中間的走道經過。雨澄往結帳方向退半步，我讓開書架。

**Jiang Yucheng**：如果主要看雨港篇，舊版還是比較值得。

**Protagonist**：好，我回去再翻舊的。謝謝。

**Jiang Yucheng**：嗯。

**Action**：她拿著選定的書走向結帳。我退回書架另一側，翻開展示本。

**Protagonist (thought)**：這兩本還得再翻一下。

**Narration**：結帳的人潮隔開了書架兩側。她帶著書走了，我還在展示本前翻頁。

**End actions**：`met_jiang_yucheng=true`；`relationship.jyc.familiarity +=1`；設定 `heard_station_cafe_from_jyc=true` 與 `jyc_first_topic`。

→ Next `common_acg_first_meet_purchase`

### `common_acg_first_meet_purchase`

**Action**：我把世界設定增補版的展示本翻到最後，再回頭看了幾頁。我把機械稿的展示本闔上放回原位，拿起旁邊封膜完整的增補版。

**Protagonist (thought)**：還是先買原本要找的這本。機械稿下次再說。

**Action**：我拿著世界設定增補版去結帳，付完錢，把書和收據一起收進袋子。

**Narration**：走出地下街，外面還亮著。我提好袋子，往回家的捷運入口走。

**End actions**：`weekend_book_purchased=true`。

→ Next `common_acg_first_meet_home_return`

### `common_acg_first_meet_home_return`

**Action**：回到家，我把書袋放在桌上，拆掉封膜。我把書攤平，從剛才在店裡翻過的幾頁開始看。

**Narration**：我翻了幾頁，又打開原本的電子版對照。窗邊的陽光落在桌上，我把書往裡挪了一點。

**Protagonist (thought)**：這頁果然還是看紙本舒服一點。

→ Scene handoff `COM-02X`，同週末約 23:00；使用已完成購書的 weekend-book variant。下一次咖啡店外出由後續平日工作段承接。

## State contract

### Conditions

```yaml
requires:
  - met_xu_tang == true
  - jyc_permanently_excluded == false
history_requires:
  common_bookstore_bridge_weekend_decision: com01b_bookstore_go
forbids:
  - met_jiang_yucheng == true
```

### Legacy compatibility stats（不作 narrative authority）

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
set_on_completed_purchase_only:
  weekend_book_purchased: true
unchanged:
  player_knows_jyc_name: false
  jyc_knows_player_name: false
  contact_jyc: false
  relationship.jyc.romanticSignal: false
  jyc_permanently_excluded: false
```

- 不更新任何 Xu/JYC cross-knowledge；兩人尚不知道彼此存在。
- 不更新 `recentFocus`；這是 common encounter，不是 major social investment。

### Next structural targets

- `common_acg_first_meet_exit` → `common_acg_first_meet_purchase` → `common_acg_first_meet_home_return` → 同週末晚間 `COM-02X`。
- `COM-02X` 使用 `weekend_book_purchased == true` 的已購書 variant；留家分支不進本幕。
- 後續 `common_weekday_outing_work` 才承接平日下午外出與 `COM-02J` 重遇；本幕不通往週末 cafe。

## Runtime / Memory intent

- 保留既有 `common_acg_first_meet_*` node IDs 與三個 topic choice IDs；新增 `common_acg_first_meet_purchase`／`common_acg_first_meet_home_return`。Topic branches 原 rejoin 完全不變，整合時可在此前綴內拆出必要 suffix nodes。
- Memory title：**地下街初遇**。
- Current playable Memory cover：`cg.opening.com01j.base_guarded`；title backdrop 可使用 accepted reaction。
- Replay 必須保留玩家原先 `jyc_first_topic` 或以 replay-local state 顯示，不改寫 frontier save。

## Semantic Visual Beats / CG Manifest Binding

Canonical manifest：`content/production/cg-manifests/opening-ch1.json`。

- `COM01J-BASE-GUARDED`：眼睛先離開書頁的 guarded curiosity。
- `COM01J-R01-INTERESTED`：base 的 expression/gaze bounded edit；interest 指向作品討論。

現有 accepted demo base/reaction 有 ingest receipt 記錄的 provisional wardrobe drift。Manifest 的 `known_issues` 保留這個事實，但 canonical wardrobe 仍是 `JYC-WARDROBE-A-ACG-OUTING`；未來 rerender 不得把 drift 當 design precedent。

### Current coda semantic visual changes

- 書架初遇核心與反應意義保留。Cafe seed 的去向意圖變成後續平日資訊，不新增相約或同行。
- 新增實際結帳、持書袋離開地下街、晴朗週末回家與已購入增補版拆封對照。這些取代立即去 cafe 的 coda；需下游 visual-impact review，不宣稱既有圖可直接覆蓋。
- 未讀取 CG 或圖片，未修改任何 accepted image bytes 或歷史 QA/Human evidence。

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
- 男主記住她提過的車站咖啡店，留待下一平日下午；本日已買好世界設定增補版並回家。
- `weekend_book_purchased=true` 來自完成結帳；她已先離開，此時不知道他最後買了哪本。

## Current writer checks（非獨立 QA）

- Exactly one bounded naturalization sweep：將完整互動連續重讀，僅檢查並自然化 affected coda；enter→rejoin 核心原文不動。Cafe seed 保留普通致謝與原有節奏，沒有新增履歷／親密推論；獨行 coda 用實際購書與回家 action 呈現結果。
- 三個既有 topic branches 的 playable prose 與 rejoin 原文保留；沒有新選項、分數 authority 或提前姓名／contact。
- 只完成 scene_dialogue；Narrative QA、visual-impact review 與 runtime integration 尚未完成。

## Historical review log（原記錄保留；不代表本輪 QA）

- Player-perspective pass：共同興趣具體到足以支撐交談，又不需要玩家真的了解虛構 IP 才能跟上。
- Character/continuity pass：無姓名／聯絡方式；COM-02J 的 cafe 來源已明確埋入。
- Choice pass：三項都是作品觀點，不存在「稱讚女生」式攻略按鈕。
- Voice contrast pass：與許棠的短乾生活語氣不同；雨澄在興趣打開後句長與資訊密度上升。
- Art pass：CG 捕捉認知轉折，不複製站立 sprite。
- Locked unresolved items：虛構 IP 名稱可在全體 content naming review 時替換，但必須跨 COM-01J／02J／03J 同步。

## Historical pre-revision coda（不參與本輪編譯）

以下原文只保留修訂前證據；其中立即去 cafe 的台詞／意圖已由 current coda 取代，不是可執行 node。

```text
### `common_acg_first_meet_cafe_seed`

**Protagonist**：這兩本我可能還要想一下。我晚點也得處理一點工作……這附近有哪裡能坐著翻書、不太吵的嗎？

**Jiang Yucheng**：北邊出口那間可以去看看。

**Jiang Yucheng**：週末這時候我不太確定會不會吵。平日下午窗邊滿安靜的，插座也有。坐久一點，店員不太會趕。

**Protagonist**：好，謝謝。我等一下去看看。

**Jiang Yucheng**：嗯。這裡人太多，翻一頁要讓一次路。

**Visual**：她話音一停，表情回到 `polite`；不要 blush。

### `common_acg_first_meet_exit`

**Action**：有人從兩人中間的走道經過。雨澄往結帳方向退半步，我讓開書架。

**Jiang Yucheng**：如果主要看雨港篇，舊版還是比較值得。

**Protagonist**：好，我回去再翻舊的。謝謝。

**Jiang Yucheng**：嗯。

**Action**：她拿著選定的書走向結帳。我退回書架另一側，翻開展示本。

**Protagonist (thought)**：這兩本還得再翻一下。北邊出口那間咖啡店，等一下也可以去看看。

**Narration**：結帳的人潮隔開了書架兩側。她帶著書走了，我還在展示本前翻頁。

**End actions**：`met_jiang_yucheng=true`；`relationship.jyc.familiarity +=1`；設定 `heard_station_cafe_from_jyc=true` 與 `jyc_first_topic`。

```
