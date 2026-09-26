# Project state

Updated: 2026-09-26

## 已完成的基礎

- W1–W3：source/output boundary、strict asset check/build、GitHub Codespaces development/preview/acceptance 已實作。`dist/` 可 clean rebuild。Canonical engineering environment 是 Codespaces；local clone 是 fallback。
- W4：Player UI、Memories、CG Gallery、journey v2 cursor/frontier、v1 save migration、browser acceptance 已完成。實際 code/data contract 見 `ARCHITECTURE.zh-TW.md`、`src/` 與 route `memories.json`。
- Asset storage：Gate 2 已將 18 個遠端 runtime 映射遷入 Git；目前 48 個 runtime path 全部從 `assets-src/` 複製，clean build 不需遠端儲存。14 個 WebP 保留原位元組；四個已驗收 COM01B PNG 經唯一 Asset Ingest 轉成 WebP，logical ID 不變。對照與 hash 見 `docs/migration/GATE2_REPO_RUNTIME_ASSETS.md`。CG rendering inputs 現由 repository-relative catalog bindings 解析，generation refs 保留 PNG/JPEG；runtime accepted CG/background objects 使用既有 WebP。
- 預設 playable route 是 `opening-demo`；`xu-tang` 舊 package 保留作 runtime/save/regression fixture，不代表新的 production story ordering。已廢棄的 office OL 臨時支線已完整移除。

## 現在的 creative production

- Prototype 採 Braided Narrative v0.5：前中期允許 honest overlap，later commitment 才收束；Good 後規劃 Relationship After Story。宏觀敘事與 route/state authority 分別在 `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`、`PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`。
- 許棠（27 歲、約 170 cm）與江雨澄（23 歲、約 160 cm）的 identity/wardrobe contracts 見 `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`。目前 repo 可用 references 僅有許棠 face、optional body JPEG、Wardrobe A，以及江雨澄 face、Wardrobe A；其他七張 reference sheets unavailable，required 時必須 BLOCK。許棠 body JPEG SHA-256 為 `d436d6ceeda95a2cd8115087d6b49e39baa72ec2f7552909da2b9a2eb933cdd4`；它是使用者提供、替代舊失效 PNG 的新 JPEG bytes，不宣稱與舊 PNG 等價。新 art 採 CG-first、16:9 landscape-first，見 `docs/art/PRODUCTION_VISUAL_DIRECTION.md`。
- Opening Chapter 1 的 `COM-00`、`COM-01X`、`COM-01J` 已在 playable demo；三份 Narrative Continuity Contracts 位於 `content/production/narrative/opening-ch1/`，八筆 accepted CG manifest entries 位於 `content/production/cg-manifests/opening-ch1.json`。`npm run production:validate` 查 scene binding、receipt/route/asset ID 與 active source boundary。
- COM01J 既有 demo CG 有 provisional wardrobe drift，僅為 accepted migration asset 的 `known_issues`；未來 rerender 應依 canonical wardrobe，不沿用此偏差。
- Adapters 由 source catalog source ID 對應的 `sourcePath` 讀取 generation references；使用同一 Canonical CG Manifest 與 deterministic shared prompt，generation 前均須檢查實際像素、role、filename、MIME 與 SHA-256。
- 劇情先行預覽可使用 repo 內共用的 `bg.narrative_preview.placeholder` WebP 作 composite 背景；它是 `previewOnly` 功能性佔位圖，沒有任何 current scene 綁定，不是 accepted CG，也不進 Gallery。實際接入時需由 chapter 明示 `allowPreviewArt` 並列入 route `assetIds`；正式視覺驗收執行 `npm run validate:final`。目前尚未新增依賴此圖的劇情 scene。

## 現行工作入口

- AI content work：先讀 `.ai/WORKFLOW_MANIFEST.yaml`。完整 production request 由 parent Work session 依 `.ai/PRODUCTION_ORCHESTRATION.md` 作 control-plane-only Production Coordinator，以 DAG、bounded Task Packet、fresh worker、Handoff/ledger 推進；五個 active harnesses 是 Content Writer、CG Planner、CG Renderer、Content QA、Integrator；Narrative QA 是 review pass。
- Source lifecycle / precedence / conflict authority：`.ai/policies/SOURCE_AUTHORITY.md`；domain source inventory：`docs/CONTENT_PRODUCTION_SOURCE_MAP.md`。Archived/experimental guidance 不進 production Task Packet；舊 runtime fixture 僅在仍被 code/tests 使用時保留。
- Technical next actions：`TODO.md`。Creative batch/review gates：`docs/narrative/CONTENT_PRODUCTION_TODO.md`。已實作 runtime、Memory/save、asset/build contract：`ARCHITECTURE.zh-TW.md`。
