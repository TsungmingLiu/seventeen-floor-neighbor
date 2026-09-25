# CG Execution Adapters

> Lifecycle: **CANONICAL** tooling contract
>
> Version: 1.0.0

`tools/render-cg-packets.mjs` 從 Canonical CG Manifest 做 deterministic projection。它不呼叫 LLM、不改寫 prompt、不生圖、不 retry、不評分。

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

Migration/reproducibility check 可明確選 accepted entries：

```bash
node tools/render-cg-packets.mjs \
  --manifest <manifest.json> \
  --include-status accepted \
  --adapter api
```

## Determinism guarantee

同一個 manifest values + entry ID 會得到 identical `shared_prompt`、`manifest_sha256`、`shared_prompt_sha256`。

Object key insertion order 不影響 manifest hash。Array order 是 canonical ordering 的一部分，會影響 prompt/hash。

## Validation beyond JSON shape

Tool 另外檢查：

- entry/output IDs unique；
- source scene exists and belongs to manifest scene set；
- forbidden source roots absent；
- all required visual continuity fields present；
- Human Attachment Gate attachments exactly match declared character/environment bindings；
- Reaction CG includes Accepted Base、previous entry、locked fields、allowed changes；
- references to previous entry resolve；
- exactly one output。

Adapters 不得 fork template；任何 transport-specific creative default 都是 bug。
