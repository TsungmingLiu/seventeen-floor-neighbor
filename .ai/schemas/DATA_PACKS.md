# Production Data Boundaries

Version: 1.0.0

Harness 定義 reusable behavior；canonical artifacts 定義 task content。

## Narrative Continuity Contract

最小 semantic relationship/knowledge boundary + natural-language constraints。它不是 affection/trust scoring model，也不取代 runtime flags。

## Locked Scene

Exactly one scene 的 narration/dialogue/choices、state mapping、branch/rejoin、semantic visual beats。不得內嵌 render prompt。

## Character Reference Binding

Exactly one character per binding：stable character ID、identity/age/body/hair facts、reference IDs、wardrobe key、forbidden drift。Multi-character entry 分開 namespaced。

## Environment Binding

Location、time/weather、layout、lighting、persistent props、reference ID。不得混入 character identity。

## Visual Continuity State

保存 screen side、body orientation、gaze、wardrobe、held object、camera axis/side、shot size、location、lighting、time/weather，以及 immediate previous accepted entry when needed。

## Canonical CG Manifest Entry

Planner 的 render-ready source of truth。包含 narrative purpose、visible characters/references、Visual Continuity State、camera/composition、include/exclude、reference transport、output/acceptance。

Renderer 不讀其他 packs；deterministic projection 會把 entry 轉成 render packet。任何無法投影的 creative ambiguity 必須退回 Planner。

## Render Packet

`GENERATED` artifact：由 canonical CG entry 逐欄位 deterministic projection，包含 shared prompt、reference checklist、provenance。Adapter 可以包裝 packet，但不得摘要或修改 shared prompt。
