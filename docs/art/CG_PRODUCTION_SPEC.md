# CG Production Specification

> Lifecycle: **CANONICAL**
>
> Version: 1.0.0
>
> Updated: 2026-09-25

本文件定義 `Locked Scene → Canonical CG Manifest → Render Packet → Candidate → Accepted Asset`。Machine-valid shape 以 `.ai/schemas/cg-manifest.schema.json` 為準；欄位語意見 `.ai/schemas/CG_MANIFEST.md`。

## 1. Authority boundary

- Locked Scene 決定 narrative truth 與 Semantic Visual Beat。
- CG Planner 決定 render selection、camera、composition、Visual Continuity State、Reference Binding。
- Canonical CG Manifest 是 renderer 的唯一 creative input。
- Render Packet 是 manifest 的 GENERATED projection，不是第二份 spec。
- Renderer 只執行，不重新摘要 story/policy。
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
| `work_batch` | machine-readable job envelope / ordering | shared prompt、entry identity、refs |
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
- render packet hash；
- references actually used；
- accepted base identity when applicable；
- candidate/accepted asset ID。

Accepted asset receipt 可以指向 archived operator provenance，但 active rendering 不可沿該 link 取得 prompt。
