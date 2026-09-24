# Harness Pilot Runbook — COM00-S04 CG Artist

Status: ready after merge  
Purpose: test isolated single-character image generation.

## What this pilot tests

- same reusable CG Artist harness;
- only Xu Tang task data;
- exact canonical reference loading;
- no cross-character contamination;
- current 16:9 cinematic visual contract;
- no legacy batch prompt;
- no reliance on full scene/repo context.

## Fresh-session command

> 按 repo 最新 AI production workflow，執行 `.ai/pilots/tasks/COM00-S04-cg-artist-v0.1.md`。嚴格遵守 source allowlist，只生成一張 candidate，不要自行重試或擴讀資料；先完成 preflight，再按 Task Packet 生圖。

Do not paste Xu Tang's biography or any old prompt into the new chat.

## Expected interaction

The worker should:
1. bootstrap from the repo;
2. load the CG Artist harness;
3. load only the three isolated packs + global visual pack;
4. fetch exactly four Xu Tang Drive refs + one environment ref;
5. write the preflight source audit to GitHub;
6. generate exactly one 16:9 candidate;
7. not self-accept it.

Because image-generation surfaces may not expose a connector-uploadable file reference in the
same turn, Drive upload is best-effort in this pilot. Failure to upload is not an art-quality
failure if the worker reports it accurately.

## Human return path

After generation, return to the coordinator with the generated image available/attached.
We will review:
- identity match;
- style drift;
- wardrobe;
- age read;
- environmental integration;
- framing/crop;
- whether the bounded packs were sufficient.

If PASS, the next pilot is a Reaction CG in the same Shot Family so we can test expression
change while preserving identity/composition.
