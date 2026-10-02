# CG Production Specification

> Lifecycle: **CANONICAL**
>
> Version: 1.2.0
>
> Updated: 2026-10-02

本文件定義 `Locked Scene → Canonical CG Manifest → Render Packet → Candidate → Accepted Asset`。Machine-valid shape 以 `.ai/schemas/cg-manifest.schema.json` 為準；欄位語意見 `.ai/schemas/CG_MANIFEST.md`。Execution adapter contract and CLI 見 `docs/art/CG_EXECUTION_ADAPTERS.md`、`tools/render-cg-packets.mjs`。

## 1. Authority boundary

- Locked Scene 決定 narrative truth 與 Semantic Visual Beat。
- CG Planner 決定 render selection、camera、composition、Visual Continuity State、Reference Binding。
- Canonical CG Manifest 是 renderer 的唯一 creative input。
- Render Packet 是 manifest 的 GENERATED projection，不是第二份 spec。
- Renderer 只執行，不重新摘要 story/policy。
- 每個 independent CG Manifest Entry 由一個 fresh bounded renderer task 執行；僅 manifest 明列、符合 `.ai/PRODUCTION_ORCHESTRATION.md` 條件的 linked sequence 可共用 context。
- Candidate 經 Visual Review 與 Human selection 後才可成為 Accepted Asset。

## 2. Render-ready definition

一個 entry 只有在以下都完整時才可設為 `render_ready`：

- `narrative.purpose`、`must_show`、`must_not_imply`；
- visible characters + exact references；
- character continuity：`screen_side`、`body_orientation`、`gaze`、`wardrobe_key`、`held_objects`；
- camera continuity：`axis_id`、`camera_side`、`shot_size`、`angle`、`pov`；
- environment continuity：`location_id`、`lighting`、`time_of_day`、`weather`；
- composition/focus/safe zone；
- ordered `include` / `exclude`；
- reference transport and attachments/base；
- output identity and acceptance checks。

缺一項不得讓 renderer 讀 scene 補完；回 `incomplete_cg_spec`。

For future entries, render-ready also requires the complete native-size/quality contract in existing projected fields: `render_constraints.include[]` prefers the largest supported native 16:9 output and highest available quality, allows integer-pixel rounding and approved aspect/reference/edit compatibility, uses exposed supported controls or records `not exposed`, and rejects fixed 1672×941/1920×1080 floors and upscales labeled native. `composition.framing_notes[]` plus focus/safe-zone fields carry explicit task-approved desktop, mobile landscape and portrait CSS viewport/DPR/display-area/crop/UI profiles; missing approved values block planning rather than invent universal numbers. `acceptance[]` carries actual returned dimensions/MIME, untouched original bytes/byte count/SHA-256, native-size clarity/artifact inspection, separate derivative compression and runtime display/crop/focus/UI checks, evidence limits and renderer/planner/integrator rejection routing. These are acceptance-check strings, not new JSON fields. Renderer cannot repair missing requirements by loading global policy.

## 3. Deterministic projection

Projection 依固定 section 順序逐欄位輸出：

1. task/output identity；
2. root style contract；
3. narrative purpose / must show / must not imply；
4. character and reference bindings；
5. environment；
6. camera + composition；
7. Visual Continuity State / locked fields / allowed changes；
8. include / exclude；
9. reference preflight；
10. acceptance and stop rule。

不得使用 LLM 自由摘要或「prompt compiler agent」。同一 manifest version + entry ID 必須產生 byte-identical shared prompt 與 packet hash。

## 4. Adapter rule

| Adapter | Changes | Must stay identical |
| --- | --- | --- |
| `chat_manual` | Human-facing attachment checklist + copy/paste envelope | shared prompt、entry identity、refs |
| `work_batch` | machine-readable job envelope / ordering / verified repo-file reference acquisition | shared prompt、entry identity、refs |
| `api` | future request body fields | shared prompt、entry identity、refs |

Adapter 不得擁有自己的 prompt template 或 creative defaults。

## 5. Reaction CG

`reaction_cg` 優先 `edit_from_accepted_base`：

- exact accepted base 必填；
- `locked_fields` 明列 identity、wardrobe、body、camera、crop、environment 等；
- `allowed_changes` 只列 expression/gaze/small pose adjustment；
- 未列的欄位視為 locked；
- 不因 branch wording 不同自動生新 asset。

## 6. Provenance

Renderer/QA handoff 至少記錄：

- manifest ID/version；
- entry ID；
- canonical manifest content hash；
- `render_spec_sha256`（root style contract + one entry）；
- render packet hash；
- references actually used；
- accepted base identity when applicable；
- candidate/accepted asset ID。

Future rendering additionally records exposed-control capability evidence, requested size/quality or `not exposed`, actual returned width/height/MIME, original byte count/SHA-256 and immutable untouched-byte location. Prompt preference does not prove actual dimensions; no invented API arguments or universal cap claim. Every derivative has a separate identity/dimensions/MIME/byte count/hash and conversion settings when available. Native original quality and final runtime WebP/compression/display quality are distinct: source-only QA cannot establish the latter. Final derivative/runtime screenshot evidence produced in integration goes to fresh bounded `content_qa / visual_review` using existing candidate scope and explicit packet constraints/acquisitions; its independent PASS is required before `READY_FOR_HUMAN_ACCEPTANCE`. Missing evidence cannot become PASS or a 4K/retina claim. Do not alter original pixels or force redraw to correct derivative/runtime defects.

This prospective policy revision preserves accepted manifests, adopted originals and recorded QA/Human outcomes; historical QA is not newly reviewed evidence under these checks.

Accepted asset receipt 可以指向 archived operator provenance，但 active rendering 不可沿該 link 取得 prompt。

Manifest/entry version 改變時，相關 Render Packet、candidate、accepted asset/integration 由 Production Coordinator 依 `.ai/PRODUCTION_ORCHESTRATION.md` 標記 `STALE`；不影響的 independent entry 以 `render_spec_sha256` 與 reference/output identity 核對後保留，且保留原始 generation provenance。Continuity 由 manifest、Visual Continuity State 與明列 accepted base 維持，不由 renderer memory 維持。

Migration-only accepted entries 可帶 `known_issues[]` 記錄已知 asset drift。這個欄位是 future render 的 negative constraint，不是對 defect 的 canonical endorsement；新 `render_ready` entry 不應用它取代完整的 `must_not_imply`、continuity 或 acceptance criteria。
