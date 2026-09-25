# Production content contracts

> Lifecycle: **CANONICAL**

這個目錄只保存 machine-readable production source-of-truth：

- `narrative/<scope>/<SCENE_ID>.json`：Narrative Continuity Contract；
- `cg-manifests/<scope>.json`：Canonical CG Manifest。

它不保存 Render Packet。Chat manual / Work batch / API output 是 `GENERATED` artifact，應由 `tools/render-cg-packets.mjs` 重建，不得手改回 canonical source。

Opening Chapter 1：

- narrative：`content/production/narrative/opening-ch1/`；
- CG manifest：`content/production/cg-manifests/opening-ch1.json`；
- runtime package：`content/routes/opening-demo/`；
- accepted asset provenance：`content/assets/ingest-receipts/opening-ch1-demo-v0.1.json`。
