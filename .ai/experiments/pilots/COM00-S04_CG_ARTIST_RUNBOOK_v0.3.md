# Harness Pilot Runbook — COM00-S04 CG Artist v0.3

> Lifecycle: **EXPERIMENTAL — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical pilot material. Do not execute as a production task.

## Fresh-session command

> 使用 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` 的 `main` branch，執行 `.ai/experiments/pilots/tasks/COM00-S04-cg-artist-v0.3.md`。除了確認 Markdown 與 Drive 圖真的讀到之外，生圖前還必須確認 image-generation call 能「顯式綁定」五個 runtime reference image IDs；如果只能靠自動選圖或無法證明綁定，立刻 BLOCKED，不要生圖。只生成一張，不得自行重試。

## Pass before generation

PASS requires both:
1. acquisition receipt PASS;
2. explicit generation binding receipt PASS.

A fetched/visible image that is not explicitly bound into the generation call does not count.

## Expected style

The output must stay at the realism level of the Xu Tang face reference:
- realistic adult human proportions;
- realistic eye size;
- natural skin/hair/materials;
- no animation-film/cartoon/anime stylization.

## Expected character lock

- long dark-brown hair down;
- large gold hoop earrings;
- cream ribbed V-neck button cardigan;
- gray-brown high-waist wide-leg trousers;
- black loafers;
- black shoulder bag;
- protagonist completely absent.
