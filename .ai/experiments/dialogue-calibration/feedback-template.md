# 對話校準人工回饋（空白範本）

> Lifecycle: **EXPERIMENTAL** — 不可用於 production Task Packet。
>
> 契約：`docs/narrative/DIALOGUE_CALIBRATION.md`。本範本沒有候選、角色 facts 或批准。

由 AI 複製到該 pilot 的非 production 工作區，填妥 context／版本／擬用 scope 後展示 A/B。完整互動及原始回饋留在此區；Human 可一次回「偏好 B，B 可作本頁情境的參考」，也可交付替代／混合全文並明示「我觉得比较合适」，直接授權精確修訂版本作該情境參考，不需再確認或填 metadata。純偏好不代表批准，任何樣本批准都不授權 scene integration。AI 負責下方所有 bookkeeping，Human 原因選填，也不必寫新台詞。

- Pilot / comparison ID：
- Source commit；policy／harness／bank 版本：
- 人工檢視開始／結束／實際分鐘數（10–15 分鐘為目標）：
- 時間／成本上限；停止條件：
- 已批准 baseline ID / version（未有則明記無）：
- A 完整互動位置／hash；B 完整互動位置／hash；顯示順序 mapping：
- 前事、各角色 knowledge 與來源：
- 熟悉度／信任／吸引（分開；方向性；confirmed/tentative/unknown 與依據）：
- 精力／地點／主客場／話題／正在做的事：
- Human reviewer / 時間：
- Human 原始回覆／outcome（A / B / tie / neither / human_revision；可同時明示批准版本／scope）：
- Human 替代／混合稿精確全文位置、revision ID/version/hash；source_type: human_authored_revision（若有，不標成 A/B，也不潤飾）：
- 原因或回合（選填）：

**AI 從回覆記錄的批准（無明示文字代表未批准）**

- Human 明示批准的完整互動 ID/version/hash（可為無；不由上方偏好推定）：
- 允許 character IDs / pass / context scope；禁止外推範圍：
- 尚未確認的 labels 及不依賴它們的用途：
- AI 推定的 context／tags（provisional；不隨修訂文字批准升格）：
- Approval identity / 時間 / 原文 / receipt 位置與版本：
- Provenance / 提案 task/run / 產生方式版本 / 整理者 / 前版關聯：

**試跑驗證（不批准 scene）**

- 預先固定的兩幕 held-out IDs / contract versions；未參與選樣或修正的確認：
- 各幕 baseline / revised versions；machine QA 與獨立 semantic QA receipts：
- Hard errors（knowledge/relationship/choice/rejoin/runtime/provenance）：
- Advisory 與尚待查證推論：
- Human directive 的有限適用範圍；未來角色／熟悉度語域方向（尚未由樣本實證，不跨角色派入）：
- Held-out Human feedback；檢視負擔；是否有可辨識改善：
- 一次 focused correction 的目標／版本／結果（無則明記）：
- 停止或繼續準備的人工決定；未過 hard checks 的 blocker：
