# Content Integrator Harness

Harness ID: `integrator`

Version: 1.4.0

## Responsibility

把已通過 QA 的 locked scene 接入 runtime contracts，不改變 creative meaning。Task Packet 必須明列 `integration_mode: narrative_preview | final | governance_maintenance`。

## Inputs

- accepted scene + narrative contract；
- `narrative_preview`：approved Locked Scene / contract、repo 內已驗證的背景或唯一 `previewOnly` background，以及 route 的 explicit `allowPreviewArt`；不要求尚未產生的 CG。
- `final`：accepted CG manifest entries、master provenance 與 logical asset IDs/storage records；
- shot-to-dialogue mapping and Memory Event requirements；
- task-specific runtime/schema files。

Archive/experiment、rejected candidate、raw operator prompt 不是 integration input。

## Work

- 對已有 accepted runtime 圖的 scene，在 final wiring/build 前執行 `npm run production:integration:check -- --scene <id> --from <packet 明列的已核對整合基線 commit> --to <commit|WORKTREE>`；基線須來自 accepted-output/checkpoint identity，不得任意改成當前 HEAD 以消除差異。非零 exit／來源取得失敗／`BLOCKED_STALE_INTEGRATION` 即停止，不繼續使用失效圖。`NO_STALE_DIFF` 只檢查版本差異，不取代獨立 QA 或 Human gates；對無 accepted CG 的 narrative preview，仍依 preview contract，不套用此 accepted-asset 檢查。
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
- final integration 需 `npm run validate:final` 通過；只在完整 accepted assets、下方 independent final derivative/display QA 與 Human-accessible demo 齊備後交付 `READY_FOR_HUMAN_ACCEPTANCE`。If platform cannot expose it, return `BLOCKED` with fallback/access limitation。

## Final derivative/display QA handoff

For prospective final integration, preserve the adopted original bytes/hash and source QA/Human outcome. Identify the actual runtime derivative separately: exact path/asset ID, width/height/MIME, byte count/SHA-256, original linkage and conversion settings when available. Record the actual runtime ref/build and render/crop screenshots with hashes, explicit approved desktop, mobile landscape and portrait CSS viewport width/height, orientation, DPR, image display area, fit/crop, focus and dialogue/UI state. Use approved profiles, not invented universal dimensions. Build/validator/smoke PASS and an uncompressed original do not prove final compression/display quality.

If derivatives or display screenshots become available during integration, hand these exact identities/evidence to Coordinator for a **fresh bounded `content_qa / visual_review` task** using existing `review_scope: candidate` and explicit packet acquisitions, `input_versions`, `constraints.locked` and `acceptance`. Integrator may return its implementation Handoff while that gate is pending, but must not self-award independent QA or advance `READY_FOR_HUMAN_ACCEPTANCE` before hash/profile/build-matching PASS of `VQA-COMPRESSION-ARTIFACTS`, `VQA-DESKTOP-DISPLAY` and `VQA-MOBILE-PORTRAIT-DISPLAY`, alongside required source-quality provenance/checks. If matching independent evidence already covers unchanged derivative/profile/build inputs, Coordinator may verify it instead of repeating unaffected checks. Missing pixels, profiles or provenance are `BLOCKED`/`NEEDS_REVIEW`, never inferred PASS or 4K/retina claims.

Compression/crop/focus/UI implementation failure returns to integrator with affected bytes/profile evidence; retain the original master. Raw-image defects route to renderer/planner as appropriate. Corrected derivative or runtime presentation requires a fresh bounded review of affected checks. No automatic redraw/retry; do not reinterpret accepted-as-is or historical QA as a new quality PASS. This prospective gate does not rewrite existing assets, accepted manifests or QA/Human records, or apply final-visual claims to narrative preview/governance maintenance.

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

## Governance maintenance

`integration_mode: governance_maintenance` is an explicitly authorized engineering/policy task. Audit dependencies using machine-only identities, preserve creative/runtime bytes and Human gates, and run build/validate/final plus relevant tool tests. Storage cleanup may project historical execution metadata into exact immutable Git locators; it must not change recorded QA outcomes or acceptance. Put its packet, audit, logs and full Handoff in ignored session cache; do not create an art-production run for repository maintenance. Playable/demo checks are required only when runtime behavior changes.

## Prospective tooling return

The Coordinator uses `production:preflight` before dispatch, including the applicable accepted-output dependencies and exact final display profile source/projection. Integrator supplies actual implementation status/QA/used-source facts to `production:handoff`; Coordinator verifies the full compact binding and new output bytes before recording its short result. These tools cannot self-award independent derivative/display QA, accepted-master selection, `READY_FOR_HUMAN_ACCEPTANCE`, or final Human acceptance. Governance maintenance returns cache-only evidence and creates no art-production run. See `docs/PRODUCTION_WORKFLOW_TOOLS.md`.
