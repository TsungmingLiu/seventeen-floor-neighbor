# Content QA Harness

Harness ID: `content_qa`

Version: 1.4.0

## Responsibility

一個 QA role，兩種互斥 pass：`narrative_review` 或 `visual_review`。Narrative QA 是 review pass，不是新的 heavy agent。

## `narrative_review`

Inputs：one Narrative Continuity Contract、one scene、only the canon excerpts used to author them。

另做校準 preflight 時，只有 exact allowlist packet 明列 `docs/narrative/DIALOGUE_CALIBRATION.md` 才讀該政策，僅使用明列 ID/version/hash、Human 已批准且 context／scope 適用的完整互動節錄；不讀整個 bank、候選、退稿或 writer conversation。獨立核對適用邊界，區分 `hard_error` 與 `advisory`，不把 tentative 推論或樣本相似度當 hard rule。此 preflight 只回 advisory evidence，不滿足本 pass／Human scene gate。現有 generated `narrative_review` packet 不帶政策／樣本，verifier 不接受手動增加；正式 pass 保持原 packet 與機器／獨立 semantic QA。A/B/tie/neither 與樣本批准不批准 scene；兩幕 held-out 試跑最多一次 focused correction 後仍未過則人工診斷，成本／時間不豁免 hard checks。校準不適用 `visual_review`，不自動批准或替換 baseline。

同一有界 preflight 也可核對 `human_revision` 的精確版本／scope，不強迫把 Human 替代／混合稿歸為 A/B。明列 directive 適用時，分開評口語自然度與 informality，容許自然的禮貌／距離；觀察 narration 不冒充他人動機。AI tags 保持 provisional，未示範的未來語域方向不變成 hard rule；修訂參考批准仍不等於 scene acceptance。

明列本輪許棠初識 Human directive 時，檢查 initiative／話題深度／自我揭露，不以短答代表距離；區分 concise 與 socially incomplete。搬家提問是否有共享前事橋接、回應是否接住對方並容許普通鼓勵，都要按當地互動判斷，不自行推定 trust／romance。知道全名是否足以當面叫全名，與 narrator／speaker label 分開核對；不建立普遍稱呼禁令。語氣詞不按 quota 驗收。Human inline 修正後，原 v1 review 不涵蓋 v2；已作修正材料的 scene 不再算新的 held-out test。

Pre-dispatch：對 generated `narrative_review` Task Packet 先跑 `npm run context -- --verify-packet <path>`；runtime graph、state writes、Memory、asset IDs、contract／CG manifest bindings 和 source hashes 由 machine QA 阻擋，FAIL 不進此 semantic pass。Worker 專注以下敘事判斷，不以機器 PASS 代替 QA。

Checks：

- scene function / entry / exit / required payoff 完成；
- character voice、knowledge、relationship pace；
- choice/rejoin consistency；
- `must_not`、forbidden shortcut、premature reveal；
- semantic visual beats 未反向改寫 narrative；
- runtime state mapping 不冒充 creative truth；
- 中文 casual dialogue 的 conversational naturalism 成立。


### Conversational naturalism

對 dialogue-heavy scene，必須把稿件當成**真人連續說話**審一次，不能只確認每個 beat、state、payoff 都正確。

以下 pattern 若持續出現，至少回 `NEEDS_REVIEW`；若已明顯破壞角色可信度或 scene purpose，回 `FAIL`：

- 台詞被最佳化成高資訊密度，而不像人在當下說話；
- 反覆出現「問題 → 精準答案 → 下一問題」；
- 幾乎每輪都以 polished joke、乾式反擊、insight 或 character-defining line 收尾；
- 尚不熟的人表現出不合理的高度默契，沒有任何 acknowledgement、試探、停頓、改口、話題落空或 awkward small talk；
- `reserved`、`dry`、`quiet` 等 voice trait 被寫成固定句長或固定 verbal gimmick；
- required continuity facts 在 branch rejoin 後被集中傾倒，讓玩家看見 state contract；
- 角色說話像履歷／摘要，例如一次完整交代工作型態、職種、當前事件，只因未來 canon 都需要知道；
- narration 明講「沒有交換聯絡方式」「沒有浪漫意味」「各付各的」等 production guardrail，而 scene 行動本來已足夠證明；
- 中文出現明顯翻譯腔、書面摘要腔、過度工整對偶，與角色當時的口語情境不符。

反過來，**不要把 filler 數量當成自然度指標**。沒有語助詞不代表錯；短句也不代表錯。QA 要判斷的是：角色與關係階段是否允許這種 conversational efficiency，以及整幕是否有自然的節奏變化。

對具體提問或誤解作完整澄清，不因單一回合較長、用詞較正式或包含數項必要資訊就算履歷／摘要腔。先判斷這些資訊是否由當地問題自然引出、是否符合關係距離，再看整幕的反覆 pattern；不得為了降低資訊密度把合理回答機械拆短。

尤其注意：

- 許棠可以乾、可以短，但不應每次都像 prepared comeback。
- 江雨澄初識可以短答，但進入熟悉題目後應有可感知的語速／句長／修正方式變化。
- 男主不應永遠用最漂亮的方式接話；合理的「喔」「嗯」「不知道」「那……」或一句沒接好的話可以是正面品質。
- 尷尬、沉默、普通寒暄不是 narrative waste；若符合 scene function，它們可以是 relationship texture。

Narrative QA 的 structured QA / decision receipt 若支援 named QA code，必須將這一項獨立記為：

`NQA-DIALOGUE-NATURALISM`

不得只把它隱含在 `NQA-VOICE-AND-PACING` 中。沒有通過此項，不得因其他 continuity/state checks 都 PASS 就宣稱整體 Narrative QA PASS。


## `visual_review`

Inputs：one canonical CG manifest entry、candidate image、references actually used、optional accepted base。

在 rendering 前可用獨立 fresh `visual_review` task 檢查一個 scene 的 manifest usability（沒有 candidate 時只回 manifest gate，不宣稱 candidate QA）。Candidate review 仍為每個 candidate/linked sequence 的另一個 fresh task。

COM-00 的 pre-render review 可使用 `context.mjs` 產生、並以 `--verify-packet` 核對的 `review_scope: manifest_usability` packet；只讀該 packet 列出的 manifest entry/style 節錄與 scene/許棠資料。這個 packet 沒有 candidate pixels，不能用 manifest `accepted` 狀態或 machine PASS 代替獨立 QA/Human 決定。

`COM00-S04-BASE-NEUTRAL` 的單張既有 WebP 可使用 `context.mjs` 的 `review_scope: candidate` packet；派工前用 `--verify-packet` 核對，並讓 fresh worker 實際查看四張 repo 圖片的像素。候選圖與臉／服裝／背景參考的角色、檔名、MIME、SHA-256 及 Git blob 由 packet 限定；worker 回傳獨立的 Visual QA，Human accepted-master 選擇仍另行決定。

Checks：

- identity/age/body/hair/wardrobe/held object；
- screen side/body orientation/gaze/camera axis/shot size；
- location/lighting/time/weather continuity；
- requested action/emotional read without premature narrative implication；
- hands/props/composition/focus/safe zone/style；
- reference and packet provenance。

## Result

Return exactly one：`PASS`、`NEEDS_REVIEW`、`FAIL`、`BLOCKED`。

QA 列出 violation 與 affected field，但不重寫 scene、manifest 或 prompt 成為新的 creative authority。
