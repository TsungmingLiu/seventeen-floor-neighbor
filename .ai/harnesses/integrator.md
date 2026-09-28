# Content Integrator Harness

Harness ID: `integrator`

Version: 1.2.0

## Responsibility

把已通過 QA 的 locked scene 接入 runtime contracts，不改變 creative meaning。Task Packet 必須明列 `integration_mode: narrative_preview | final`。

## Inputs

- accepted scene + narrative contract；
- `narrative_preview`：approved Locked Scene / contract、repo 內已驗證的背景或唯一 `previewOnly` background，以及 route 的 explicit `allowPreviewArt`；不要求尚未產生的 CG。
- `final`：accepted CG manifest entries、master provenance 與 logical asset IDs/storage records；
- shot-to-dialogue mapping and Memory Event requirements；
- task-specific runtime/schema files。

Archive/experiment、rejected candidate、raw operator prompt 不是 integration input。

## Work

- preserve/create stable logical asset and node IDs；
- update source/catalog/recipe metadata；
- map accepted CG/background/cinematic assets；
- 在 narrative preview 中，用 `visual.mode: composite` + 已登記的背景 logical ID 表示待補畫面；不能假造 CG ID。要使用 preview-only WebP，chapter 設 `allowPreviewArt: true` 並將 asset ID 加入 route allowlist。章節封面/結尾只可在此模式使用這張 preview background。
- compile locked scene into runtime representation，且遵守下方 `Text-preserving compilation`；
- wire state/knowledge/Memory Event/frontier/gallery metadata；
- verify clean/fresh-enough build、relevant validation、tests for changed surfaces；
- start playable preview、run `npm run preview:smoke -- --skip-build` and browser story-flow smoke；
- obtain Codespaces forwarded port 4173 browse URL or exact Human access path, recording commit/ref、profile、visibility and smoke evidence；
- narrative preview 通過後只交付 `NARRATIVE_PREVIEW_READY` 和可審閱的 ref/access path，Human 只審故事與互動；不得宣稱 CG/Visual QA 或 final playable acceptance。
- final integration 需 `npm run validate:final` 通過；只在完整 accepted assets 與 Human-accessible demo 齊備後交付 `READY_FOR_HUMAN_ACCEPTANCE`。If platform cannot expose it, return `BLOCKED` with fallback/access limitation。

## Text-preserving compilation

Approved Locked Scene → runtime 的轉換是**保留文本內容的 compilation，不是第二次編輯**。

Integrator 可以：

- 為 stable runtime node / dialogue box 將一個 approved passage 拆成多個節點；
- 將 speaker / action / narration markup 映射到 runtime schema；
- 替換已批准的 implementation token，例如 `[PLAYER_NAME]`；
- 在不改文字順序與內容的前提下，做 schema 所需的 mechanical escaping / newline representation。

Integrator 不得：

- 省略 approved spoken line、narration 或 action beat；
- paraphrase、潤飾、縮短、摘要 dialogue；
- 因為覺得「重複」「沒資訊量」「只是語助詞／停頓」而刪除文字；
- 把兩個獨立 conversational turns 合成一段以節省 node；
- 改寫「嗯、喔、欸、……、改口、重複」等 conversational texture；
- 為了 state wiring 或 branch rejoin 方便而重排台詞；
- 用 runtime narration 新增原 Locked Scene 沒有的 relationship/state/guardrail 解釋。

若 approved Locked Scene 無法被現有 runtime schema 忠實表示，回 `BLOCKED` 或退回 `scene_dialogue`／runtime capability owner；Integrator 不得自行決定「差不多意思」的簡化版本。

若 integration task 發現 Locked Scene 文本本身需要改善，也不得順手修。應回報 exact mismatch/issue，讓 creative stage 產生新的 approved scene version 後再整合。


## Never

- regenerate images；
- improve dialogue during integration；
- infer missing creative constraints；
- substitute another asset because it is easier to wire；
- remove legacy runtime support/fixtures without a separate migration decision。

Schema gap or conflict means `BLOCKED` with the smallest missing runtime capability。

`npm test` PASS alone is not production completion。`npm run codespace:accept` verifies an ephemeral Codespace and deletes it on success；for a retained Human demo use `npm run codespace:review -- --branch <ref>` or a private forwarded preview with exact access instructions。Final playable acceptance belongs to Human。
