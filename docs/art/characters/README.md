# Future Heroine Character Settings

> Lifecycle: **CANONICAL**
>
> Status: **text-only character design authority; no accepted image reference pack**
>
> Updated: 2026-10-02

本目錄保存尚未進入目前雙女主 prototype 的 future heroine 文字設定，以及由設定投影出的 reference-pack generation prompt。

目前收錄：

- `lin-ruoqing.md` — 林若晴的人物、視覺與造型權威設定。
- `shen-zhixia.md` — 沈知夏的人物、視覺與造型權威設定。
- `prompts/lin-ruoqing-face-identity.md` — 林若晴 Sheet 01 Face Identity Turnaround prompt。
- `prompts/shen-zhixia-face-identity.md` — 沈知夏 Sheet 01 Face Identity Turnaround prompt。

## Authority boundary

1. 角色事實以各自的 character spec 為準；prompt 只是可執行投影，不擁有新的角色事實。
2. 本目錄不表示角色已加入 runtime、route 或 `content/characters/`。
3. 在 6-sheet reference pack 經 Human review、入庫並登記到 `content/assets/source-catalog.json` 前，角色沒有可供正式 CG manifest 綁定的 accepted image reference。
4. 本次對話中曾生成的任何候選圖均未入庫、未驗收，也不是 production authority。
5. 若 prompt 與 character spec 衝突，必須停止生成並以 character spec 修正 prompt，不得自行折衷。

## Character-isolation contract

- 一個 generation task 只可讀取一位角色的 spec 與對應 prompt。
- 禁止同時載入林若晴與沈知夏的資料作為「風格參考」。
- 禁止載入許棠或江雨澄的 reference pixels 來塑造新角色；既有角色只能出現在文字 collision guard 中。
- 禁止以剛生成的候選圖取代文字 identity contract，或把未驗收候選圖當下一張圖的唯一來源。
- 每次只生成一張 candidate；Human 明示接受前不得繼續下一張 sheet。

## Current character separation

| Character | Signature silhouette | Core energy | Must not collapse into |
| --- | --- | --- | --- |
| 林若晴 | 鎖骨長髮綁中高馬尾；健康輕運動型 | 年輕、明亮、直接、一直在行動 | 江雨澄的短髮小骨架 ACG 女大生感 |
| 沈知夏 | 墨黑直髮、俐落低馬尾；垂直結構輪廓 | 精準、清醒、克制、有主見 | 許棠的柔和長波浪與鬆弛鄰家輕熟女感 |

Active reference-pack 的通用格式與入庫規則仍以 `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` 為準。
