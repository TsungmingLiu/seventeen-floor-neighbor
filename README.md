# 《17 樓的新鄰居》

台北都市成人戀愛視覺小說。Browser-native JavaScript 靜態站點；目前 prototype 聚焦許棠與江雨澄的 braided narrative。W1–W4 技術基礎已完成，`opening-demo` 是預設 playable route；後續 scene/CG production 與 W5–W7 仍在進行。

## 從哪裡開始

- 修改 code、route、Memory/save 或 assets：讀 [程式與內容架構](ARCHITECTURE.zh-TW.md)，再讀相關實際 JSON/code。
- 查當前狀態：讀 [PROJECT_STATE.md](PROJECT_STATE.md)。查未完成技術事項：讀 [TODO.md](TODO.md)。
- 寫劇情／對白／CG：先讀 `.ai/WORKFLOW_MANIFEST.yaml`，依 Bootstrap 選一個 active harness/pass 與 bounded Task Packet；[source-of-truth map](docs/CONTENT_PRODUCTION_SOURCE_MAP.md) 列出各 domain authority。[Creative TODO](docs/narrative/CONTENT_PRODUCTION_TODO.md) 只記 production 進度。
- 新故事採 Braided Narrative v0.5、CG-first / 16:9。宏觀故事、route/state、visual 與 CG 契約分別在 `docs/narrative/`、`docs/art/`；Chapter 1 的 machine-readable values 在 `content/production/`。
- `content/` 的現行 production values、playable route、legacy fixture 與 asset metadata 分界見 [Content data boundary](content/README.md)。未註冊的早期林澄短篇已歸檔，不是新林澄線的 canon。

舊 `xu-tang` / OL playable package、sprites/backgrounds 與 composite rendering 留作 runtime/save regression fixture。已退出 production policy 的 prompt、operator 與 pilot 放在 `docs/archive/`、`.ai/archive/`、`.ai/experiments/`。

## 開發與驗證

Canonical engineering environment 是 GitHub Codespaces：Node 22、ffmpeg/ffprobe、preview port 4173。Local clone 可作 fallback，但 fresh acceptance 以 Codespaces 為準。

```bash
npm run dev                    # build、serve 4173、watch
npm run preview                # clean build + preview
npm run build                  # clean rebuild dist/
npm run validate               # route/content + production contracts
npm test                       # runtime/projection regression
npm run preview:smoke -- --skip-build
```

其他工具：`npm run assets:check` 做 full-decode/hash validation；`npm run assets:build` 取用 runtime objects；`npm run context -- --route <id> --node <id>` 建立局部 context；`npm run cg:packet -- --manifest <path> --check` 檢查 CG manifest；`npm run codespace:accept` 做一次性 fresh Codespace acceptance。實際命令以 `package.json` 為準。

## Source boundary

| 位置 | 用途 |
| --- | --- |
| `public/`、`src/` | UI shell 與 runtime engine |
| `content/routes/`、`content/production/` | playable data 與 approved production contracts |
| `content/assets/`、`content/recipes/` | logical asset、source/provider/hash、recipe metadata |
| `assets-src/` | 仍由 source-map 使用的本地 legacy binary sources |
| Google Drive `source-private` | accepted private master images |
| Google Drive `runtime-public` | 目前仍由 source-map 使用的 optimized runtime objects |
| `dist/`、`generated/` | 可重建的 output/cache，不作 source of truth |

Repo 舊的本地 `runtime-public/` 目錄已移除；它與上表中的 Google Drive folder 不是同一個來源。Story 只引用 stable logical asset ID，不直接引用 physical filename 或 storage provider。
