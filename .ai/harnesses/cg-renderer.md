# CG Renderer Harness

Harness ID: `cg_renderer`

Version: 1.1.0

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

## Native output and quality

- For future tasks, require the self-contained entry/packet to specify **prefer the largest supported native 16:9 output and highest available quality**, permitting integer-pixel rounding and respecting approved aspect/reference/edit constraints. Neither 1672×941 nor 1920×1080 is a fixed minimum. Missing execution-critical requirements return `BLOCKED: incomplete_cg_spec`; do not read global visual prose to repair them.
- Use only exposed supported size/quality transport controls compatible with those constraints. Record supported choices, chosen values and their capability evidence. If either control is absent, record `not exposed` and the entry's prompt preference; do not invent API arguments, assert a universal tool cap or guarantee dimensions from prompt wording. Shared prompt/content remains identical across adapters.
- Verify actual returned width/height and MIME against the returned file, retain the original returned bytes unchanged, and record byte count, SHA-256 and immutable location. Requested settings and actual returned dimensions are separate evidence. Never manually upscale and label the result native/high-definition; any later conversion/scaling is a separately identified derivative.
- Handoff records source-quality evidence and any unavailable evidence. Renderer does not grant Visual QA PASS: fresh `content_qa / visual_review` must inspect original pixels at native size for clarity/artifacts and actual derivative/runtime display evidence at explicit desktop and mobile/portrait CSS viewport/DPR profiles, including crop, focus and dialogue/UI occlusion. A source-only review cannot claim final compression/display QA; missing evidence cannot become PASS or an unverified 4K/retina claim.
- Raw-image quality defects return to a bounded renderer attempt when the approved spec is correct, or planner when it is deficient. Derivative compression/runtime crop defects return to integrator; missing pixels/profiles/provenance are `BLOCKED`/`NEEDS_REVIEW`, evidenced quality failure is `FAIL`/`NEEDS_REVIEW`. No automatic redraw/retry.

## Candidate handoff

- exactly one candidate per independent entry；
- no automatic retry；
- record entry ID、manifest version/hash、packet hash、references actually used；
- handoff to `content_qa` `visual_review`；
- never self-accept or ingest。

This gate is prospective: preserve existing adopted original bytes, accepted manifests and recorded QA/Human outcomes; do not relabel historical QA as a review under this harness version.

## Explicit Scene Embodiment POC packets

For an explicitly opted-in schema `1.1.0` entry, execute the fixed projected Scene Embodiment section verbatim with the rest of the packet. Do not invent action/coupling/physical/depth details or resolve inheritance/exceptions. Unsupported POC classes/framing/continuity block before projection. `1.0.0` packets remain unchanged. Field completeness is not pixel QA or Human adoption; preserve all existing reference, quality and stop rules.
