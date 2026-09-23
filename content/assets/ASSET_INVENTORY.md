# Asset Inventory — W2 Verified State

Updated: 2026-09-23 (America/New_York)

## Summary

W2 使用 ffprobe + full ffmpeg decode 驗證 media 完整性。

先前約 786 KB 的 PNG 已確認是真實 truncation。8 張完整原圖已從 ChatGPT Library 找回，保存至 Google Drive `source-private`，完成 full decode，並記錄於 `content/assets/source-catalog.json`。

先前同樣可疑的 first-kiss MP4/WebM 則通過完整 decode，因此目前不判定為損壞。

## Recovered canonical masters

| Source ID | Drive file ID | Bytes | Dimensions | SHA-256 |
| --- | --- | ---: | --- | --- |
| `source.xu_tang.date.bookstore` | `1aNhLrHoUIzJZ1aR9BeXrkKeKLsjeYkd_` | 2,048,531 | 1672×941 | `6cb2ac03a23a0c605d997a6edef50adf5c9f8de32cd655a3a63a96d82a8f672a` |
| `source.xu_tang.date.riverwalk` | `1YC570Awhyx6yoxIHzynwLzI4oqkr6W3S` | 2,355,224 | 1672×941 | `8a9f586a70696b210e1805aa9b4a07b116e6f0efbcad68e586b01273b905022a` |
| `source.xu_tang.date.night_market` | `1SasHV1J51Cc2zbcgoeb3XO1YBlq6uLhZ` | 2,075,970 | 1672×941 | `a533e6182a1c0b7409a5aa204c48362548164bde8e252f9d1de72b445df3ee76` |
| `source.xu_tang.identity_v2` | `13PhBIrjxhES-GMXJHj8hDEjdQJA6_qmi` | 2,336,962 | 2048×768 | `d3c9927b79922ce85414b193b16e6a5635316ecf572710e07b8c2ac0b5001f19` |
| `source.xu_tang.first_kiss.keyframe_01` | `17Zebv_FKd7A-XerSTLj6FNAfN8HMB0Kq` | 2,020,032 | 1672×941 | `367cb2e80aaa8a946194ec0597ff77ad67806cbdf35491f95ddf11aae163c1a5` |
| `source.xu_tang.first_kiss.keyframe_02` | `1AyH4vQ2qAgyuW2gpWH9Vt-ftBMrHEITb` | 1,993,026 | 1672×941 | `11b2dc20efa161974ec0d6c1c333f7596b2ef7e2f7009ba9cd711e2d1daa42be` |
| `source.xu_tang.first_kiss.keyframe_03` | `1fNii8tv799rtiVeU4JfgvnQggizlDS0C` | 2,010,974 | 1672×941 | `57808c32349a6a7842acf7ca63d2196a8c4df83f918aee8279aa5d1c76b2c7e4` |
| `source.xu_tang.first_kiss.keyframe_04` | `1C84RKdUHGfK13zQDz-h58ZBZWiQLFfY5` | 1,922,739 | 1672×941 | `13f3aead934cc51ac3f2da0e29d7522e3c7f234e08f036f2be42b5efa56011a4` |

## Runtime replacements

| Runtime path | Drive file ID | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `assets/cg-date-bookstore.webp` | `1IuuvVNQrNOlK9R3ZYr2quaNOHH5CoaTj` | 143,762 | `92d854021e3b7d83081d9cf1307e2c4677101ae1b87da62bda98727f23efb779` |
| `assets/cg-date-riverwalk.webp` | `1cAMdIu-AALAlJ1QW5ja8N5q62imzjunX` | 229,018 | `4419c6d7cadfbf61a18d9876df63b8b8737ad29fef35ee5a430498e13d0fcd9a` |
| `assets/cg-date-night-market.webp` | `10LLYD2_wxAmxVgLGjk6RDOcA-Rhtz1d7` | 155,166 | `de67b8be103b5dfe5d4eabc987d24b0b9395b4fa146457f99a46d867df149b25` |

GitHub Actions 已在無 Google credential 的情況下下載這三個 object、驗 SHA-256 並 full-decode。

## GitHub binary policy after W2

- 8 個 corrupt legacy PNG 在確認 Drive 完整 master 後已從 W2 branch 移除。
- `dist/assets/` 是 generated/ignored。
- 新生成的大型 binary 優先進 Google Drive，不經 GitHub text/file write wrapper。
- 現有正常 legacy binary 可逐步遷移，不需要為了架構一次性重寫。

## Video result

`mv-first-kiss.mp4` 與 `mv-first-kiss.webm` 都通過 strict full decode。

MP4/H.264 現在是 required primary cinematic runtime format；WebM 為 optional legacy fallback。
