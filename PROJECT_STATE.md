# Project state

Updated: 2026-09-25

## 已完成的基礎

- W1–W3：source/output boundary、strict asset check/build、GitHub Codespaces development/preview/acceptance 已實作。`dist/` 可 clean rebuild。Canonical engineering environment 是 Codespaces；local clone 是 fallback。
- W4：Player UI、Memories、CG Gallery、journey v2 cursor/frontier、v1 save migration、browser acceptance 已完成。實際 code/data contract 見 `ARCHITECTURE.zh-TW.md`、`src/` 與 route `memories.json`。
- Asset storage：GitHub 保存 code/content/metadata 與既有 Git-backed legacy sources；Google Drive `source-private` 保存 accepted masters，Drive `runtime-public` 保存目前由 source-map 使用的 optimized runtime objects。本地 repo `runtime-public/` 已退出，不是 build input。
- 預設 playable route 是 `opening-demo`；`xu-tang` 舊 package 保留作 runtime/save/regression fixture，不代表新的 production story ordering。已廢棄的 office OL 臨時支線已完整移除。

## 現在的 creative production

- Prototype 採 Braided Narrative v0.5：前中期允許 honest overlap，later commitment 才收束；Good 後規劃 Relationship After Story。宏觀敘事與 route/state authority 分別在 `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`、`PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`。
- 許棠（27 歲、約 170 cm）與江雨澄（23 歲、約 160 cm）的 6-sheet identity references 已 QA PASS；精確檔案/Drive IDs 在 `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`。新 art 採 CG-first、16:9 landscape-first，見 `docs/art/PRODUCTION_VISUAL_DIRECTION.md`。
- Opening Chapter 1 的 `COM-00`、`COM-01X`、`COM-01J` 已在 playable demo；三份 Narrative Continuity Contracts 位於 `content/production/narrative/opening-ch1/`，八筆 accepted CG manifest entries 位於 `content/production/cg-manifests/opening-ch1.json`。`npm run production:validate` 查 scene binding、receipt/route/asset ID 與 active source boundary。
- COM01J 既有 demo CG 有 provisional wardrobe drift，僅為 accepted migration asset 的 `known_issues`；未來 rerender 應依 canonical wardrobe，不沿用此偏差。
- Chat manual 由 Human 附指定 reference；Work batch 可從授權 connected source 自動取得。兩者使用同一 Canonical CG Manifest 與 deterministic shared prompt，generation 前均須檢查實際像素、role、filename。

## 現行工作入口

- AI content work：先讀 `.ai/WORKFLOW_MANIFEST.yaml`。完整 production request 由 parent Work session 依 `.ai/PRODUCTION_ORCHESTRATION.md` 作 control-plane-only Production Coordinator，以 DAG、bounded Task Packet、fresh worker、Handoff/ledger 推進；五個 active harnesses 是 Content Writer、CG Planner、CG Renderer、Content QA、Integrator；Narrative QA 是 review pass。
- Source lifecycle / precedence / conflict authority：`.ai/policies/SOURCE_AUTHORITY.md`；domain source inventory：`docs/CONTENT_PRODUCTION_SOURCE_MAP.md`。Archived/experimental guidance 不進 production Task Packet；舊 runtime fixture 僅在仍被 code/tests 使用時保留。
- Technical next actions：`TODO.md`。Creative batch/review gates：`docs/narrative/CONTENT_PRODUCTION_TODO.md`。已實作 runtime、Memory/save、asset/build contract：`ARCHITECTURE.zh-TW.md`。
