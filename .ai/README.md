# AI Production Control Layer

> Lifecycle: **CANONICAL**

這個目錄是 AI-assisted content production 的唯一入口。

## Start here

1. Read `.ai/WORKFLOW_MANIFEST.yaml`。
2. Follow `.ai/harnesses/bootstrap.md`。
3. Resolve exactly one active harness/pass。
4. Load only the Task Packet allowlist。
5. Return `.ai/schemas/HANDOFF.md` handoff。

不要從舊聊天、operator prompt、pilot 或整個 repo 開始。

## Active roles

| Role | Owns |
| --- | --- |
| `content_writer` | `narrative_design` 或 `scene_dialogue`，一次一個 pass |
| `cg_planner` | locked scene → canonical render-ready CG manifest |
| `cg_renderer` | one manifest entry + declared references → one candidate |
| `content_qa` | `narrative_review` 或 `visual_review` |
| `integrator` | accepted outputs → runtime contract |

`Narrative QA` 是 `content_qa` 的 pass，不是第六個 creative role。Bootstrap 是 routing procedure，不是 production role。

## Layer boundary

```text
Narrative Design
  → Scene / Dialogue
  → Narrative Review
  → Canonical CG Manifest
  → Deterministic Render Packet
  → Render / Visual Review
  → Integration
```

Renderer 不讀 narrative/project policy；CG manifest entry 必須已含 execution-critical constraints。Chat manual、Work batch、future API 只使用不同 adapter envelope，共享同一 spec 和 prompt projection。

## Lifecycle boundary

- `.ai/harnesses/` / `.ai/schemas/`：active canonical control layer。
- `.ai/archive/`：historical only。
- `.ai/experiments/`：pilot/research only。

Active Task Packet 不得引用後兩者。
