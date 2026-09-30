# 對話校準：小規模人工試跑

> Lifecycle: **CANONICAL**（只規範校準流程，不新增角色或場景 canon）
>
> Version: 1.2.1
>
> Updated: 2026-09-30

此流程讓 Human 用完整互動比較「是否像這個人在這個情境下說話」，再由既有 `content_writer` 與獨立 `content_qa` 使用明確批准的少量參考。不是新的 harness、學習系統或 scene approval gate。Source authority、context isolation、Task Packet 與 orchestration 的既有規則優先。

Human 已提供兩份自行修訂的情境參考，依下列契約保存精確版本及有限 scope；實際可用項目以 approved bank 與版本核對為準。這不代表已完成兩幕 held-out 評估、驗證改善效果或 voice 全面校準。

## 1. 資料邊界與批准

- Production 樣本庫：`content/production/voice/approved-examples.json`。只有 Human 明確批准的特定版本、特定用途樣本可以進入；批准範圍外沒有 authority。
- 候選、A/B 比較、退稿與未確認標籤留在非 production 工作區；production worker 不得讀取。歷史原始 evidence 與空白範本只保存在不可變 Git 歷史中，不是 production input。
- Human 對比較可選 `A`、`B`、`tie`、`neither`，也可以自行提供修訂／混合版本，記為 `human_revision`；可選填一句原因或指出回合，不要求 Human 重寫台詞。純偏好不代表批准：tie 不批准兩份，neither 不產生正向樣本。
- AI 先展示固定版本的完整 A/B 互動、情境及擬用 scope，再負責所有 provenance／context／版本紀錄。Human 可一次回「偏好 B，B 可作本頁情境的參考」，這已明示批准展示版本及範圍，**不需第二輪確認**。只有純偏好時才沒有批准，不自行推定。既有 Locked Scene、QA PASS、模型評分或自動摘要都不能代替 Human 決定。
- Human 在該比較情境直接交付替代全文，並說「我觉得比较合适」等明示採用意圖，可一次授權把**該精確修訂版本**作本情境參考，無需另問批准。AI 原樣保存文字與版本，不把修訂／混合稿標成 A 或 B，也不順手潤飾；這不是 scene integration 授權。AI 補出的 context／tag 仍是 provisional，除非另有明確來源，不能隨文字批准變成 canon。
- 已批准 baseline 保留原內容與版本；新候選不能自動覆蓋。新批准版本另建紀錄，並保留前版關聯。撤回／縮限由 Human 明示，撤回項移出可用集合，歷史仍由 Git／批准紀錄保存，不能再派作 input。
- 不能從候選、退稿、一次偏好或模型推論自動抽取「角色永遠如何說話」的規則。任何擴大用途或 canon 變更都需要既有 Human gate。

## 2. 輕量資料契約（人工核對，非新增 validator）

樣本庫根物件固定包含 `schema_version`（原始資料格式為 `1.1.0`；目前儲存投影為 `1.2.0`）、`policy_path`、`examples` 陣列。`examples: []` 仍是有效狀態；沒有適用樣本時維持既有 writer／QA 流程，不自行造樣本。每筆 entry 必須具備下表欄位，空字串不能當作已確認資料。

| 欄位 | 必填內容與邊界 |
| --- | --- |
| `id`, `version`, `status` | 穩定 ID、不可變版本、固定 `human_approved`。內容／scope 改動要新版本與重新批准。 |
| `context.characters` | 出現／說話者的 stable character IDs 與角色；不能帶未列出的角色資料。 |
| `context.prior_events`, `context.knowledge` | 前事與每位說話者當時知道／不知道什麼，附來源；不能由台詞猜出的 knowledge 冒充 canon。 |
| `context.familiarity`, `context.trust`, `context.attraction` | 各角色對另一人的方向性關係描述與依據；熟悉、信任、吸引各自記錄，不能互相代替。 |
| `context.energy`, `context.place`, `context.topic` | 各說話者當時精力／疲勞、地點／主客場、話題與正在做的事。 |
| `interaction` | 有序完整回合陣列；每項含 `turn_id`, `kind`（`dialogue`／`action`／`silence`／`narration`）, `speaker_id`（無說話者可為 null）, `text`。保留發起、反應、停頓、改口與收束；若有選擇，明列所走分支與 rejoin。不可只摘金句。 |
| `source_revision` | 原始完整互動的 repository/path/commit/blob SHA 或可稽核外部來源 ID／不可變內容 hash；精確回合／行範圍及 branch binding。Human 替代／混合稿固定 `source_type: human_authored_revision`，綁定原始 Human 訊息及精確文字 hash，不能聲稱來自 Locked Scene 或 A/B 原稿。 |
| `human_feedback` | AI 記比較 ID、A/B 各自版本／hash、`outcome`（`A`／`B`／`tie`／`neither`／`human_revision`）、reviewer、時間、原始回覆位置／hash；原因可為 null。`human_revision` 另記 `revision_binding`（Human 修訂 ID/version/hash），不能只填選 A/B。回覆可同時明示批准，但不能由純偏好推定。 |
| `approved_scope` | 批准的 character IDs、pass（僅 `scene_dialogue`／`narrative_review`）、關係／knowledge 邊界、精力／地點／話題等適用條件、禁止外推範圍；Human 明示允許的有限類比。不能只寫「通用」。 |
| `approval` | AI 從 Human 明示回覆記 identity、時間、批准原文、展示的 entry 版本／scope、decision receipt 的位置／不可變版本；不要求 Human 填 metadata。批准的是該 entry 及 scope，並非整個 scene。 |
| `provenance` | 提案 task/run ID、產生方式／版本、完整候選來源 binding、整理者、批准紀錄 binding、前一 approved 版本 ID（沒有則 null）；來源變更如何重新核對。紀錄可指向實驗 evidence，但 worker 不可沿指標讀取該內容。 |

每個 context 標籤採同一格式：`{ value, certainty, evidence }`，其中 `certainty` 僅可為 `confirmed`／`tentative`／`unknown`，`evidence` 記精確來源與版本；unknown 用 `value: null`，tentative 明列推論理由。確認本身也要有來源，Human 批准一段口語不等於批准所有推測出的 relationship labels。這些是情境描述，不引入 affection/trust 分數或 runtime state。

### 儲存投影

目前 approved bank 是純儲存投影：每筆 entry 保留互動、ID/version/status、完整 approved_scope 與所有非 evidence context 值／certainty；為避免重複，context 內的 evidence payload、approval 內重複的 scope，以及 provenance 中重複的候選描述由投影省略。storage_projection 指向不可變來源 bank 的精確 Git ref/path/blob/SHA；bank 共用 storage_resolution 對照表可解析舊 evidence 路徑。完整原始 bank 與原始 evidence 仍可由該 ref 重建。此 locator 僅供 provenance 核對，不是批准、scope 或 production input 的擴張；不改變 Human decision hashes。

若適用判斷依賴 tentative／unknown 標籤，不能當作符合條件；要先取得已批准 contract／canon 的依據或回報無適用樣本。Human 可把仍有未知的樣本限縮到不依賴該未知的用途，但必須寫明。Confirmed 標籤仍不能覆蓋更高 authority 的當前 contract。

## 3. 有界派工：只投送適用且批准的 entry

Coordinator 在每次派工前核對 bank、批准紀錄、原始來源及當前 scene contract 版本；來源／scope 變更使原批准依據失效時停止使用，重新核對或送 Human，不把舊批准當作 current。批准紀錄對 worker 只提供必要的批准證據；raw candidate／rejection 不能夾在 evidence 中送入。

`scene_dialogue` 或另外明列的校準 preflight 可用人工準備的 exact allowlist packet；政策本身也必須列入，不因 harness link 而擴讀。使用既有 Task Packet 欄位，不改 generator 或 schema：

1. `allowed_sources` 明列本政策及所選已批准 entry 的最小 task-local 節錄；不是授權讀取整個 bank。節錄是一份固定 bytes 的 accepted reference，含完整互動、context、scope、批准與必要 provenance，不混入其他角色／樣本。
2. `input_versions` 固定政策、bank Git blob、entry ID/version、節錄 SHA-256、批准紀錄及當前 scene／contract 的不可變版本；`inputs.accepted_outputs` 明列 selected entry 與批准 binding。
3. `constraints.locked` 列選用 IDs、當前情境與 scope 的匹配依據及限制；`acceptance` 要求 handoff 記錄實際使用的 IDs/versions、適用判斷與無法套用的地方。JSON/reference acquisition 依 exact path/ref/hash 人工核對並留 handoff evidence，不冒充 markdown acquisition 或機器已驗證。
4. Writer 與獨立校準 preflight 各自取得有界 packet；preflight 可取得相同批准節錄，但不繼承 writer conversation、自評或 raw 比較。此人工核對的 preflight 不產生 production QA PASS；既有 machine QA 與正式 reviewer packet verification 仍必須執行。

目前 `context.mjs`／`context-packet.mjs` 的 `buildNarrativeReviewPacket` 只帶 scene/contract 與 scene 宣告的 narrative canon；沒有此政策或 bank。`verifyNarrativeReviewPacket` 重建並逐欄比對，手動加樣本／政策會驗證失敗。**本版不改這個邊界，也不把手改 packet 偽稱 verified**。

需要樣本比較時，另做有界校準 comparison/preflight，人工核對 exact allowlist 與 pins，回報 advisory evidence；它不是新的 production stage，也不滿足正式 QA gate。正式 `narrative_review` 仍使用未加料的 generated packet，先通過既有 verification／machine QA，再由獨立 fresh worker 審 scene 本身；它不讀此政策／bank。未來若要正式 reviewer 自動載入樣本，須另行工程任務，不能在這輪繞過 verifier。缺批准、缺版本或 scope 不符的 entry 不可派入；若它是任務必要 input 則 `BLOCKED`，若只是可選參考則明記省略。

樣本只幫助判斷當地回話節奏、禮貌、停頓與熟悉度如何互動，不能複製事件、用詞、joke 或固定句長。跨情境類比只限 Human 已明列的 scope；未確認推論永遠是待查意見，不能變成 hard rule。

本輪 Human directive 的有界寫作／審查要點：口語自然度與隨意程度分開判斷，有禮貌、有距離也可以是日常說話；第一人稱的當下觀察可增加在場感，但不能替他人斷言動機。語域依角色、熟悉度與情境，不依 filler 數量，也不強制一律加「沒有啦」。這些是 procedural guidance，適用仍由明列 directive／樣本 scope 決定，不新增每個角色的固定 canon。

本輪許棠初識情境的 Human inline 修正進一步指定：不熟悉主要限制主動性、話題深度與自我揭露，並非每句必須短；簡潔與省掉必要社交回應要分開判斷。搬家提問先建立雙方共享的前事橋接，不直接跳到箱子；acknowledgement 與普通鼓勵可以維持禮貌距離，不自行推成信任／浪漫提升。知道全名不等於見過一次就自然以全名當面稱呼；spoken address 與 narrator／speaker label 分開，依本情境 Human 方向使用適當稱呼或省略，不建立普遍姓氏／用字禁令。語氣詞回應當下，不按數量補齊。

Inline 修正只批准套用明示的文字／程序方向；少量修正不能冒充完整 approved interaction。原試稿尚未達到 Human 希望的分寸，不宣稱 transfer 成功。COM-01X 既已成為 corrective material，不能再算未來獨立 held-out test；另選未參與選樣／修正的場景。舊獨立 review 只適用原 v1，不自動覆蓋 deterministic 修訂的 v2；v2 仍待 Human 閱讀，沒有 production QA／scene acceptance。

Human 明確指定許棠熟悉後更直接、回合更長／較隨意，以及另一位女主較沒有拘束感。這是已確認的 Human 寫作方向；本輪尚未提供這些情境的具體示範，後續在各自的 bounded task 中校準表達分寸，而不是重新要求 Human 證明或批准該方向。不能把其他女主 facts 帶進許棠 task input，也不能從年齡推成所有角色都適用的 informality 規則。

## 4. 一次小試跑與停止條件

啟動前由 AI 固定：pilot ID、source commit、harness/policy/bank 版本、既有批准 baseline IDs（沒有則明記無）、兩幕 held-out scene IDs／contract 版本、成功與停止條件、時間／成本上限。兩幕必須在樣本整理及修正前選定，未參與樣本選擇／修正；只能測同一批摘錄不算驗證。

1. 用少量完整互動供 Human 作 A/B/tie/neither 比較或交付 `human_revision`；A/B 可以都是合理的新稿，也可以是一份既有稿與一份候選，不刻意做較差版本。原稿與既有批准 baseline 另存固定版本，不因 A/B 或修訂稿命名而被取代；尚無 approved baseline 也能試跑。AI 記顯示順序與版本 mapping。
2. Human 可直接選偏好、tie、neither 或自行修訂，但修訂不是義務，加原因是選填；人工檢視 **10–15 分鐘是試跑目標**，不是已測得效率、接受門檻或到時自動批准。記錄實際分鐘數與是否需要重寫／多次說明。
3. 經明確批准才收錄 entry；可用第 1 節的一次偏好＋批准回覆，不另要求 Human 整理 metadata。AI 不因勝出、沉默或時間到自動升格，也不為充滿 bank 擴寫角色 canon。
4. 在兩幕 held-out 場景比較無樣本的原 baseline 與有適用批准樣本的有界修訂。機器檢查後，獨立 fresh semantic QA 分別審完整 scene；記錄自然度、聲線、knowledge、relationship boundary、choice/rejoin 與 Human 偏好，不只列樣本相似度。
5. 最多 **一次 focused corrective redispatch**，只修已定位問題，保留 approved baseline 及所有版本；仍未通過或沒有可辨識改善就停止，交人工診斷。沒有修正必要時也不為湊次數改寫。這不是另一輪自動重試，也不授權 writer 超過既有一次 naturalization sweep。

結果分開記錄：`hard_error`（canon/knowledge/relationship 邊界、choice/rejoin、runtime、來源或批准失效）與 `advisory`（例如普通笑點的偏好、tentative 語氣推論）。Advisory 可以由 Human 作取捨，但持續破壞自然度／scene purpose 的 pattern 仍依既有 QA 回 `NEEDS_REVIEW`／`FAIL`。成本／時間／修正次數用完不得豁免任何 hard check，也不得將尚未通過的 scene 標為完成。

校準偏好、樣本批准、machine PASS 都不能批准 scene。原本的 machine QA、獨立 `narrative_review`（含 `NQA-DIALOGUE-NATURALISM`）與 Human playable／narrative gate 保持不變。試跑結果只回答是否值得繼續；不能直接更改 production 狀態。

## 5. 小型雙軌待辦

以 `ROADMAP.md`／`TODO.md` 的 M0 critical path 優先；本清單不宣稱已完成 placeholder proof，也不新建 milestone。任何後續工作先核對 current HEAD、清單／receipt 的實際狀態與版本，不因舊勾選或聊天記憶跳過。

| 軌道 | 下一個最小工作 | 版本與交付證據 |
| --- | --- | --- |
| M0 主線 | 由既有流程選一個真實 Locked Scene，核對 preview-only asset、替換路徑及 stale 檢查目前是否已有有效證明；若缺，另派 bounded task 驗證 placeholder → accepted CG 不改 narrative node structure。 | scene/contract/manifest/asset/ref pins；existing machine checks、替換與 stale report、fresh playable acceptance。通過才更新既有 TODO，校準不能代替 M0 gate。 |
| 圖像參考可用性盤點 | 另派 bounded inventory task，先核對既有 source catalog／asset registry 中角色 identity／wardrobe 與場地參考是否真的可取得、角色／用途是否正確；只交可用／缺失清單，不產生新圖或批次美術。這份工程流程文件不讀 reference pixels 或角色 prose。 | exact source IDs/path/ref/hash/MIME、需要時由獨立 worker 查看 pixels 的 acquisition evidence、角色／場地缺口與既有批准狀態；metadata-only 不算生成前取得成功。 |

對話校準是另外有界的小試跑，依第 4 節準備；有批准樣本也只使用與當前 task 相符的版本。不在這輪執行 bulk art、新 UI、全自動抽取／評分／學習或新增 production engine。若主線尚未完成，第二軌只做有界準備，不搶占 M0 gate。
