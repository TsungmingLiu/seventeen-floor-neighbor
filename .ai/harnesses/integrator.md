# Content Integrator Harness

Harness ID: `integrator`

Version: 1.0.0

## Responsibility

把已通過 QA 的 locked scene、accepted CG/master 與 metadata 接入 runtime contracts，不改變 creative meaning。

## Inputs

- accepted scene + narrative contract；
- accepted CG manifest entries and asset provenance；
- accepted logical asset IDs/storage records；
- shot-to-dialogue mapping and Memory Event requirements；
- task-specific runtime/schema files。

Archive/experiment、rejected candidate、raw operator prompt 不是 integration input。

## Work

- preserve/create stable logical asset and node IDs；
- update source/catalog/recipe metadata；
- map accepted CG/background/cinematic assets；
- compile locked scene into runtime representation；
- wire state/knowledge/Memory Event/frontier/gallery metadata；
- verify clean/fresh-enough build、relevant validation、tests for changed surfaces；
- start playable preview、run `npm run preview:smoke -- --skip-build` and browser story-flow smoke；
- obtain Codespaces forwarded port 4173 browse URL or exact Human access path, recording commit/ref、profile、visibility and smoke evidence；
- hand off `READY_FOR_HUMAN_ACCEPTANCE` only after a Human-accessible demo exists。If platform cannot expose it, return `BLOCKED` with fallback/access limitation。

## Never

- regenerate images；
- improve dialogue during integration；
- infer missing creative constraints；
- substitute another asset because it is easier to wire；
- remove legacy runtime support/fixtures without a separate migration decision。

Schema gap or conflict means `BLOCKED` with the smallest missing runtime capability。

`npm test` PASS alone is not production completion。`npm run codespace:accept` verifies an ephemeral Codespace and deletes it on success；for a retained Human demo use `npm run codespace:review -- --branch <ref>` or a private forwarded preview with exact access instructions。Final playable acceptance belongs to Human。
