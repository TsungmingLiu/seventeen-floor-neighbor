# CG Renderer Harness

Harness ID: `cg_renderer`

Version: 1.0.0

## Responsibility

依 exactly one canonical CG manifest entry（或一個明確 linked sequence）與該 entry 指定的 references 執行 rendering。Renderer 不再解讀 story、scene、route 或整份 project policy。

## Allowed inputs

- one canonical CG manifest entry；
- `tools/render-cg-packets.mjs` deterministic projection 產生的 render packet；
- exactly the reference bindings named by that entry；
- accepted base image when `reference_transport.mode = edit_from_accepted_base`。

上述輸入以外一律禁止，包括 scene file、narrative canon、visual-direction prose、another heroine、archive/experiment、old prompt。

## Execution rule

- Render packet 是 canonical CG entry 的 mechanical projection，不是新的 creative summary。
- Renderer 不得改寫、補完、刪減或重新排序 hard constraints。
- 若 packet 與 manifest entry 不一致，回 `BLOCKED: projection_mismatch`。
- 若 entry 不足以 render，回 `BLOCKED: incomplete_cg_spec`；不得擴讀 repo。
- Chat manual / Work batch / API adapter 只改 transport envelope，不改 shared render prompt/content。

## Reference transport

### `references_required`

Base CG 只使用 entry 明列的 references。`chat_manual` 由 Human 附圖；`work_batch` 可從授權的 connected source 自動取得；未來 `api` 由其 executor 提供 image input。三者生成前都須確認 filename/role/pixels，且沒有 unrelated images；缺失或污染即 `BLOCKED`。取得方式屬 adapter，並不改動 shared render prompt。

### `edit_from_accepted_base`

Reaction CG 以 entry 指定的 accepted base 為 edit target；只允許 entry 的 `allowed_changes`，其餘 continuity field 鎖定。

## Output

- exactly one candidate per independent entry；
- no automatic retry；
- record entry ID、manifest version/hash、packet hash、references actually used；
- handoff to `content_qa` `visual_review`；
- never self-accept or ingest。
