# CG Renderer Harness

Harness ID: `cg_renderer`

Version: 1.0.0

## Responsibility

依 exactly one independent canonical CG manifest entry（或 manifest 明列且符合 `.ai/PRODUCTION_ORCHESTRATION.md` 條件的 linked sequence）與該 entry 指定的 references 執行 rendering。每個 independent entry 是一個 fresh renderer task；Renderer 不解讀 story、scene、route 或整份 project policy，也不依賴前一 renderer 的記憶。

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

Base CG 只使用 entry 明列的 references。所有 adapter 依 `content/assets/source-catalog.json` 中 source ID 對應的 `sourcePath` 綁定取得檔案；生成前確認 exact filename、role、MIME、SHA-256 和可見 pixels，且沒有 unrelated images。缺失或污染即 `BLOCKED`。取得方式屬 adapter，並不改動 shared render prompt。
Character generation references may be PNG or JPEG. Accepted CG/background base images use their cataloged WebP objects; validate MIME against the bound file rather than converting a reference during acquisition.

### `edit_from_accepted_base`

Reaction CG 以 entry 指定的 accepted base 為 edit target；只允許 entry 的 `allowed_changes`，其餘 continuity field 鎖定。

## Output

- exactly one candidate per independent entry；
- no automatic retry；
- record entry ID、manifest version/hash、packet hash、references actually used；
- handoff to `content_qa` `visual_review`；
- never self-accept or ingest。
