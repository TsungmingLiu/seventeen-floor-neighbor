# COM00-S04 Human-Attachment CG Pilot v0.4

> Lifecycle: **EXPERIMENTAL — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical pilot material. Do not execute as a production task.

## Human setup

Start a completely new ChatGPT conversation.

Attach exactly these three files, and no other images:

1. `xt-ref-01-face.png`
2. `xt-ref-05-wardrobe-a.png`
3. `bg-apt-17f-rain-v1.webp`

Do not attach:
- previous generated CGs;
- Jiang Yucheng;
- expression/production sheets;
- screenshots;
- other background images.

Then send only:

> 使用 GitHub repo `TsungmingLiu/seventeen-floor-neighbor` 的 `main` branch，執行 `.ai/experiments/pilots/tasks/COM00-S04-cg-artist-human-attach-v0.4.md`。這是一個 Human Reference Attachment Gate 測試：只允許使用我在本對話手動附上的 3 張圖片作為生圖 reference。先逐張確認附件像素、角色、服裝和環境都正確，並確認本對話沒有其他圖片；任何一項不符就 BLOCKED，不要從 Google Drive 自動抓圖替代。全部 PASS 才生成 exactly 1 張 candidate，不得自行重試。

## Expected outcome

PASS means the generated image:
- reads as the same realistic Xu Tang identity;
- preserves exact Weekday Neighbor Look 01;
- uses the rainy-night 17F corridor;
- contains no protagonist;
- stays realistic/PBR rather than animation/cartoon styling.

If it fails, return the image plus FAIL reason; do not retry.
