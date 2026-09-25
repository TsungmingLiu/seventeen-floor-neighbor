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
- verify build/validate/tests for changed surfaces。

## Never

- regenerate images；
- improve dialogue during integration；
- infer missing creative constraints；
- substitute another asset because it is easier to wire；
- remove legacy runtime support/fixtures without a separate migration decision。

Schema gap or conflict means `BLOCKED` with the smallest missing runtime capability。
