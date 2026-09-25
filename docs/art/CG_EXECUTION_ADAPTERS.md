# CG Execution Adapters

> Lifecycle: **CANONICAL** tooling contract
>
> Version: 1.0.0

`tools/render-cg-packets.mjs` 從 Canonical CG Manifest 做 deterministic projection。它不呼叫 LLM、不改寫 prompt、不生圖、不 retry、不評分。

Work batch envelope 仍由 `.ai/PRODUCTION_ORCHESTRATION.md` 控制 dispatch：one independent entry = one fresh renderer task；linked sequence 例外以 manifest 明列為準。Adapter JSONL 的多行不授權單一 renderer worker 連續處理 unrelated entries。

## Commands

Validate manifest：

```bash
node tools/render-cg-packets.mjs --manifest <manifest.json> --check
```

Project one `render_ready` entry：

```bash
node tools/render-cg-packets.mjs \
  --manifest <manifest.json> \
  --entry <ENTRY_ID> \
  --adapter chat_manual
```

Adapters：`chat_manual`、`work_batch`、`api`。`--out <path>` 可寫入 GENERATED artifact；未指定時輸出 stdout。

`chat_manual` 的 checklist 要求 Human 附上指定圖片。`work_batch` envelope 帶 `reference_acquisition.method = connected_source`、source catalog 路徑與完整 bindings；Work executor 可從已授權的來源取得每張 reference，逐張檢查像素、role、filename 後傳給 image generation。若來源不可用或圖片不符，回 `BLOCKED`。Adapter 只規定取得／傳送方式，不改 shared prompt。`api` envelope 保留相同 bindings，由未來 API executor 決定 image-input transport。

Work reference resolution：`gdrive:<file_id>` 直接指定 Drive file；`source.*` 以 `content/assets/source-catalog.json` 的 `files[source_id].fileId` 解析；`accepted_base` 以同一 catalog 的 `canonicalAssetId` 找到唯一 file。解析成功仍須實際 fetch 並檢查像素，不能只驗 ID。這份 JSONL 是執行輸入，並非一個會自行下載或呼叫 image generation 的背景服務。

Migration/reproducibility check 可明確選 accepted entries：

```bash
node tools/render-cg-packets.mjs \
  --manifest <manifest.json> \
  --include-status accepted \
  --adapter api
```

## Determinism guarantee

同一個 manifest values + entry ID 會得到 identical `shared_prompt`、`manifest_sha256`、`shared_prompt_sha256`、`render_spec_sha256`。最後一個 hash 只覆蓋 root style contract + 該 entry，供 Coordinator 在整份 manifest 修訂後判定 unrelated entry 可否保留；它不改寫原 generation manifest provenance。

Object key insertion order 不影響 manifest hash。Array order 是 canonical ordering 的一部分，會影響 prompt/hash。

## Validation beyond JSON shape

Tool 另外檢查：

- entry/output IDs unique；
- source scene exists and belongs to manifest scene set；
- forbidden source roots absent；
- all required visual continuity fields present；
- required image bindings exactly match declared character/environment bindings, independent of acquisition method；
- Reaction CG includes Accepted Base、previous entry、locked fields、allowed changes；
- references to previous entry resolve；
- exactly one output。

Adapters 不得 fork template；任何 transport-specific creative default 都是 bug。
