# 辦公族 OL 臨時支線 Context

> LEGACY-FIXTURE。只用於 `xu-tang` 舊 route 的相容性與回歸檢查，不是新人物或劇情的 production authority。

這是一段掛在許棠主線早期選項上的短篇支線。它使用專案現有的黑絲 OL 立繪與走廊 CG 作為暫代素材，角色只以「辦公族 OL（暫代）」稱呼，不建立尚未確認的長期人設。

## 不可破壞的連續性

- 故事時間仍是週五 23:41；角色是剛加完班回家的成年辦公族女性。
- 支線由 `chapter-01.choice1` 的第四個選項進入，並在自己的 `office_route` 節點結束。
- `officeRoute >= 1` 只用來觸發 `office_teaser` 結局；許棠原有四個結局規則保持不變。
- `sprite.office_ol.office.*` 與 `cg.office_ol.hallway` 都標記為臨時重用素材，之後可直接替換 manifest 對應檔案與配方，不改劇情節點。

## 劇情來源

- `content/routes/xu-tang/office-ol-story.json`
- `content/characters/office_ol.json`
