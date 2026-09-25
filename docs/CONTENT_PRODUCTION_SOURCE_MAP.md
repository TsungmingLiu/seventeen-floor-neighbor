# Content Production Source Map

> Lifecycle: **CANONICAL**
>
> Version: 1.0.0
>
> Updated: 2026-09-25

這份 map 回答 fresh worker 的第一個問題：**這次工作唯一可以信什麼？**

## 1. Document lifecycle

Production 文件只有四種 lifecycle：

| Lifecycle | Meaning | Worker rule |
| --- | --- | --- |
| `CANONICAL` | 對特定 domain 的現行 authority | 只有 Task Packet 明確 allowlist 後才可讀 |
| `EXPERIMENTAL` | capability test / pilot / 尚未採用的設計 | 不得用於 production |
| `GENERATED` | 由 canonical input deterministic 產生的輸出 | 可重建，不可反向覆蓋 source |
| `ARCHIVED` | 歷史記錄、舊 prompt、已退出 policy 的 guidance | 不得用於 production |

`LEGACY-FIXTURE` 是 runtime asset/capability 狀態，不是第五種文件 authority。保留 fixture 不表示保留舊 production guidance。

## 2. Conflict order

由高至低：

1. `.ai/WORKFLOW_MANIFEST.yaml`：workflow routing、allowed source classes、active harness/schema registry。
2. `PROJECT_STATE.md`：current milestone 與已接受的 superseding decision。
3. task-specific locked artifact：approved scene、canonical CG manifest entry、accepted asset receipt。
4. domain canon：narrative、visual、runtime contract。
5. Task Packet 中明確引用的 supporting excerpt。

若兩個同層 `CANONICAL` 文件互斥，worker 必須 `BLOCKED`；不得自行折衷。`EXPERIMENTAL`、`GENERATED`、`ARCHIVED` 永遠不能覆蓋 `CANONICAL`。

## 3. Active source-of-truth inventory

| Domain | Canonical source | Owns | Does not own |
| --- | --- | --- | --- |
| Workflow entry | `.ai/WORKFLOW_MANIFEST.yaml` | pipeline routing、active roles、schema paths | story facts、shot content |
| Source policy | `.ai/policies/SOURCE_AUTHORITY.md` | authority/lifecycle/conflict handling | task content |
| Context policy | `.ai/policies/CONTEXT_ISOLATION.md` | bounded acquisition、character/scene isolation | creative decisions |
| Current state | `PROJECT_STATE.md` | milestone、accepted decisions、migration state | reusable workflow detail |
| Narrative design | `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` | macro arc、scene purpose、relationship pacing | final render prompt |
| Production layer contract | `docs/narrative/CONTENT_PRODUCTION_SPEC.md` | Narrative Design → Scene/Dialogue → Visual Production boundaries and terminology | story facts |
| Route/state | `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` | route graph、knowledge/state semantics | dialogue prose、camera |
| Locked scene | `docs/narrative/scenes/vertical-slice/*.md` | scene-local narrative facts、dialogue、entry/exit intent、semantic visual beats | image-generation prompt syntax |
| Creative backlog | `docs/narrative/CONTENT_PRODUCTION_TODO.md` | progress、gates、known blockers | duplicated prompt/spec |
| Visual direction | `docs/art/PRODUCTION_VISUAL_DIRECTION.md` | global visual contract、shot economy、responsive composition | scene-specific narrative choice |
| Character identity | `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` | reference authority、identity/wardrobe mapping | scene purpose、camera |
| CG production | `docs/art/CG_PRODUCTION_SPEC.md` + `.ai/schemas/CG_MANIFEST.md` | render-ready manifest、projection、adapter boundary | narrative rewrite |
| Continuity schemas | `.ai/schemas/NARRATIVE_CONTINUITY.md` + `.ai/schemas/VISUAL_CONTINUITY.md` | required semantic and visual continuity fields | scene-specific values |
| Runtime | `ARCHITECTURE.zh-TW.md` and applicable feature spec | implementation/data/save constraints | creative canon |
| Document index | `docs/DOCUMENT_STATUS.md` | human-readable lifecycle inventory | workflow execution |

Active production roles are limited to `content_writer`、`cg_planner`、`cg_renderer`、`content_qa`、`integrator`。Bootstrap is routing only；Narrative QA is a `content_qa` pass。

Machine validation shapes：`.ai/schemas/narrative-continuity.schema.json`、`.ai/schemas/cg-manifest.schema.json`。

## 4. Non-active inventory

| Path | Lifecycle | Reason retained |
| --- | --- | --- |
| `docs/archive/art/PROTOTYPE_ART_REQUIREMENTS.md` | `ARCHIVED` | historical asset/location matrix and sprite-first plan |
| `docs/archive/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md` | `ARCHIVED` | historical one-off prompt wording and batch plan |
| `docs/archive/art/recipes/` | `ARCHIVED` | provenance for already-generated background/sprite assets |
| `docs/archive/narrative/CONTENT_PRODUCTION_TODO_v0.3.md` | `ARCHIVED` | old backlog plus copy-paste prompts |
| `.ai/archive/operators/OPENING_CH1_DEMO_OPERATOR_PACK_v0.1.md` | `ARCHIVED` | completed one-off demo operator procedure |
| `.ai/experiments/pilots/` | `EXPERIMENTAL` | capability tests, pilot packets/results, failure evidence |
| `docs/proposals/urban-dating-sim-setting-proposal.md` | `ARCHIVED` by default | early ideation; a Task Packet may cite a bounded excerpt as supporting input |

## 5. Runtime fixture boundary

以下能力仍由 runtime/tests 使用，這次不得因文件清理而刪除：

- composite visual mode、existing sprites/backgrounds；
- `xu-tang` / old OL content package and stable IDs；
- current asset manifest/source map/recipe provenance；
- MP4/WebM playback；
- save/migration/Memory Event compatibility。

它們可繼續作 regression/migration fixture，但新的 production authoring 不再從舊 sprite/background prompt pipeline 開始。

## 6. Opening Chapter 1 current facts

- Narrative source：`COM-00 → COM-01X → COM-01J` 三個 locked scene files。
- Playable integration：`content/routes/opening-demo/`。
- Accepted asset provenance：`content/assets/ingest-receipts/opening-ch1-demo-v0.1.json`。
- Archived operator provenance：`.ai/archive/operators/OPENING_CH1_DEMO_OPERATOR_PACK_v0.1.md`。
- Known visual issue：COM01J demo asset 保留 provisional wardrobe drift；這是 asset issue，不是修改 narrative canon 的理由。

## 7. UI items explicitly out of scope

本輪只記錄、不修 UI：

- choice node 的 `text: ""` 仍顯示空 dialogue box；
- narrator + character content 同框時的閱讀分工不清；
- choice 自動顯示 `A/B/C` prefix。

追蹤位置：root `TODO.md` 的 `Opening demo UI follow-ups`。
