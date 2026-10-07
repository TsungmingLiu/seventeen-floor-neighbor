# JYC-05 — ACG：她的主場

> Lifecycle: **CANONICAL** narrative design only.
> Status: **ND-only outline pending dialogue** — 尚非 Locked Scene、Narrative QA 或 Human acceptance。
> Scope: exactly JYC-05；不含 playable narration／dialogue、camera、CG 或 runtime implementation。

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/JYC-05.json`
- 本文是上述 scene-local contract 的 bounded dialogue handoff；若後續需改 entry/exit 或 scene function，先回 narrative_design。

## Exact predecessor and entry

只承接 `OPEN-A-ENTRY-PENDING-J` 的已確認安排：她已傳限定展，男主詢問早一點同行，她因手上那張畫提出晚一點；雙方確認第一 window 的較晚下午，男主先做自己的事。此 pending 邊界尚未出門或完成 outing，原第一 slot 尚未消耗。工作依她自己的安排處理，不 invent 畫作題目、委託人或男主介入。

當地入場仍須真實 `contact_jyc`、COM-02J mutual contact 和 COM-03J online 前事及既有 consent／harm／closure checks。不能從 earned initial encounter 推定這些事實。此版本沒有重新邀約、發起者選單、RE 或 OPEN-B return 入口。已完成的邀約訊息不重送。

## Writer-owned wardrobe

- Character: `jiang_yucheng`
- wardrobe_key: `JYC-WARDROBE-A-ACG-OUTING`
- Existing look: `ACG Outing`
- 由 task-character-only writer-safe options 選取；Planner unchanged carry-through。無 image、provider 或 reference metadata，也不新增 wardrobe runtime state 或故事 lore。

## Scene outline — no dialogue

1. 較晚下午在限定展入口碰面。保留首次同行的客氣、等候與方向確認；她不必主動交代工作內容，男主不檢查那張畫完成品質。
2. 進展區後她自然走在前面，選擇先看的部分，講出版本／設定差別。男主一個錯誤記憶被她直接糾正；語氣顯出和既有 online 互動同一人的投入，但不補未給出的 COM-03J 問答。
3. 以一個實際收藏／版本比較展現她的判斷。作品名字與差異的最終細節由 dialogue 在 task-local canon 邊界內完成；不把展品或她的筆名對上匿名 creator 身份。
4. 作品討論保留不懂、承認記錯、不同偏好或普通稱讚的空間。具體參與有局部火花，裝懂或泛讚可能接不下去；不是親密積分或是否解鎖下一幕的測驗。
5. 店員向她問商品／版本選擇，她稍停一下。此處給下面的 action choice，讓玩家的介入確實改變她當地表達與之後的分享量。
6. 小周邊／抽選由她自己選擇參與，所有完成支都有單純高興的 reward。物件是展會小物，不是情侶紀念或最佳回答獎品；不需要指定稀有價值。
7. 出展區時，她試探性提到另一個共同興趣活動，再降低邀約力度。男主可以接住而不放大成告白；co-op 是 future hook，尚未確認 gaming／家訪安排。代答支可分享短小興趣反應，但不恢復成毫無摩擦的共同 canon。
8. 實際 outing completion 到單一 scene boundary；保留 action 結果。尚未 authored 的 continuation 前顯示明示 preview stop；不開下一 window。

## Choice and consequence design

作品比較若使用 expression choice，exactly 3 stances 各一次：warm 以具體追問／肯定接住她；candid 說自己偏好或承認不懂；playful 以剛才記錯的版本做輕鬆自我改口。三者皆為合理成年人回應，不固定順序、不顯示 stance，也不要求 punchline。這是 Local；具體回應可保留 Echo，不改 distant scene 集合。單純自動對話亦可承擔普通稱讚／裝懂的短落空，不另造 structural stance test。

| Action at shop | Immediate outcome | Persisted semantic consequence |
| --- | --- | --- |
| 等她把自己的商品／版本選擇說完 | 她短暫停頓後自行回答，完成互動並繼續比較 | 沒有本次代答 evidence；不保證高親密或 future invitation |
| 在她停頓時先替她回答 | 男主以為能讓交易快一點；結果可辦妥，但她收回原本要補充的話、接下來分享較少 | 保存 exact JYC-05 店員版本提問的代答事件，early friction unresolved；不能視為她同意長期代理 |

Action 不強制三選，不使用 Warm/Candid/Playful label。這是一個有情境理由但可能不合適的幫忙選擇，非故意羞辱充數。此 choice 的 Local 反應立即可見；因 unresolved 導致相鄰家訪入口需 repair variant 的差異須明列，不能真 merge 抹去。outline 不預寫任何台詞。

## Rejoin, adjacent obligation, and stop

共同完成事實：她被看見在熟悉領域帶路、比較並表達判斷，`jyc_seen_in_element=true`；有一次實際共同展覽。合流只共用時間／離展動作與 completion；不統一互相默契、分享量或 unresolved。

代答支的下一個短 continuation 在家訪邀約前，必須承認那次搶答、詢問她希望何時／如何幫忙、停止接管，並在下一次店員／訊息回覆讓她自己完成。她接受才 addressed；拒絕不進家訪，可留普通聊天或明確 closure。普通未代答支不虛構 repair。這是同場後段／相鄰 continuation 的早期 boundary obligation，尚未產出本輪 successor，不 set 後期 `repair_completed`，不讀或代寫 JYC-06。

## Minimal implementation handoff

- JSON 的兩項 flags 是 **實際 JYC-05 completion 才一次性 套用的 proposed mutation**，不因 ND 文件落地、確認訊息或入場就寫入。沒有 runtime edits。
- `jyc_seen_in_element=true`：所有完成支；只表明實際觀察到她的主場。
- `open_a_window1_consumed=true`：消耗原第一 major slot exactly once。既有 `open_a_entry_outcome=pending_jyc` 保留其 entry 歷史語意，不 invent 新 outcome enum 或以它作未來 eligibility。completion 還須由 integrator 依現有框架記錄真正 scene completion／major investment；不在本 pass 擴寫 focus schema。
- Action outcome 需 scene-local choice history／exact event evidence 記錄 `waited_for_her_answer` 或 `answered_for_her`；若使用旗標，由後續 runtime schema 明確映射，不新增 relationship score。未代答不能帶 unresolved；代答不能默認 addressed。
- Save/load 保留當地 choice／semantic node 與 completion 狀態，不重送 OPEN-A 訊息、不重跑入口或重複消耗；Memory replay 使用 replay-local snapshot，不寫 live flags。
- Completion 後目前 preview 到此；不自動進 JYC-06／OPEN-B、不新 discovery、不多一個 slot。

## Source and acceptance boundary

來源限 ND-JYC-05 packet 的 pinned `a2967d98cd7118c690cc1adada8035182594cc55` excerpts、continuity schemas、DATA_PACKS 和 single-character writer-safe wardrobe projection。既有 OPEN-A bytes untouched。下一 gate 是 fresh `content_writer / scene_dialogue`，再經獨立 `content_qa / narrative_review`；本 outline 不授予 Script Lock 或 preview integration。

## Canonical inputs

- `docs/narrative/CONTENT_PRODUCTION_SPEC.md#L13-L53`
- `docs/narrative/CONTENT_PRODUCTION_SPEC.md#L60-L91`
- `docs/narrative/CONTENT_PRODUCTION_SPEC.md#L135-L137`
- `docs/narrative/NARRATIVE_INTERACTION_AND_STORY_MAP_SPEC.md#L80-L190`
- `docs/narrative/NARRATIVE_INTERACTION_AND_STORY_MAP_SPEC.md#L191-L353`
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L400-L415`
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L437-L439`
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L342-L343`
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L344-L345`
- `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_JIANG_YUCHENG.md#L1-L74`
- `docs/art/characters/jiang-yucheng.md#L1-L62`
- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md#L441-L463`
- `docs/narrative/scenes/vertical-slice/OPEN-A.md#L3-L11`
- `docs/narrative/scenes/vertical-slice/OPEN-A.md#L40-L50`
- `docs/narrative/scenes/vertical-slice/OPEN-A.md#L241-L293`
- `docs/narrative/scenes/vertical-slice/OPEN-A.md#L398-L413`
