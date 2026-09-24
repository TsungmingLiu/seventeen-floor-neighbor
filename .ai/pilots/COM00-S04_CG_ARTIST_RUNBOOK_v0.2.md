# Harness Pilot Runbook — COM00-S04 CG Artist v0.2

This replaces the v0.1 runbook for retry.

## Fresh-session command

> 使用 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` 的 `main` branch，執行 `.ai/pilots/tasks/COM00-S04-cg-artist-v0.2.md`。先逐項確認所有指定 Markdown 真的讀到內容、所有指定 Google Drive 圖真的取得像素並可見；任何一項拿不到就立刻 BLOCKED，不要假設、不要補資料、不要生圖。只有 preflight 全部 PASS 才生成一張 candidate，且不得自行重試。

## What counts as PASS before generation

The worker must prove:
- exact repo = TsungmingLiu/seventeen-floor-neighbor;
- exact ref = main;
- required Markdown contents are non-empty and each has a blob SHA;
- all 5 exact Drive files were fetched;
- observed filenames/MIME/bytes match;
- actual pixels were visually inspected;
- every image has `pixels_visible_to_worker: true`;
- the visible corridor image is actually an indoor rainy-night apartment corridor;
- the visible face/wardrobe sheets are actually Xu Tang.

If any proof is absent, STOP.
