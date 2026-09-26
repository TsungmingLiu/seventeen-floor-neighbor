# Content Integrator Harness

Harness ID: `integrator`

Version: 1.1.0

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
- compile locked scene into runtime representation；
- wire state/knowledge/Memory Event/frontier/gallery metadata；
- verify clean/fresh-enough build、relevant validation、tests for changed surfaces；
- start playable preview、run `npm run preview:smoke -- --skip-build` and browser story-flow smoke；
- obtain Codespaces forwarded port 4173 browse URL or exact Human access path, recording commit/ref、profile、visibility and smoke evidence；
- narrative preview 通過後只交付 `NARRATIVE_PREVIEW_READY` 和可審閱的 ref/access path，Human 只審故事與互動；不得宣稱 CG/Visual QA 或 final playable acceptance。
- final integration 需 `npm run validate:final` 通過；只在完整 accepted assets 與 Human-accessible demo 齊備後交付 `READY_FOR_HUMAN_ACCEPTANCE`。If platform cannot expose it, return `BLOCKED` with fallback/access limitation。

## Never

- regenerate images；
- improve dialogue during integration；
- infer missing creative constraints；
- substitute another asset because it is easier to wire；
- remove legacy runtime support/fixtures without a separate migration decision。

Schema gap or conflict means `BLOCKED` with the smallest missing runtime capability。

`npm test` PASS alone is not production completion。`npm run codespace:accept` verifies an ephemeral Codespace and deletes it on success；for a retained Human demo use `npm run codespace:review -- --branch <ref>` or a private forwarded preview with exact access instructions。Final playable acceptance belongs to Human。
