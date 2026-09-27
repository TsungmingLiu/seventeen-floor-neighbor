# 《17 樓的新鄰居》

台北都市成人戀愛視覺小說。

Browser-native JavaScript 靜態站點；目前 prototype 聚焦許棠與江雨澄的 braided narrative。遊戲核心不是早期選定單一路線，而是在一段共同生活中分配時間、注意力與誠實程度，直到關係逐漸要求玩家做出真正的選擇。

---

## 專案文件怎麼讀

不同文件有明確分工。不要把某一份文件當成所有問題的 source of truth。

| 文件 | 用途 |
| --- | --- |
| [`ROADMAP.md`](ROADMAP.md) | 專案里程碑、目前優先級、下一階段與 Exit Gate |
| [`PROJECT_STATE.md`](PROJECT_STATE.md) | repo 當前已完成／已實作的客觀狀態 |
| [`TODO.md`](TODO.md) | 目前 milestone 的技術執行工作與 technical backlog |
| [`docs/narrative/CONTENT_PRODUCTION_TODO.md`](docs/narrative/CONTENT_PRODUCTION_TODO.md) | 劇情、美術與 playable content 的 production progress |
| [`.ai/WORKFLOW_MANIFEST.yaml`](.ai/WORKFLOW_MANIFEST.yaml) | AI content-production workflow、harness 與 worker execution contract |
| [`ARCHITECTURE.zh-TW.md`](ARCHITECTURE.zh-TW.md) | runtime、content、asset、save、build 等已實作工程 contract |
| [`docs/CONTENT_PRODUCTION_SOURCE_MAP.md`](docs/CONTENT_PRODUCTION_SOURCE_MAP.md) | Narrative / Art / Production 各 domain 的 source authority |

### 判斷「現在該做什麼」

先讀 `ROADMAP.md`。

Roadmap 決定目前 active milestone，以及哪些事情現在不應該做。

### 判斷「repo 現在到底是什麼狀態」

讀 `PROJECT_STATE.md`。

### 要修改程式、runtime、route、asset 或 save

先讀 `ARCHITECTURE.zh-TW.md`，再讀相關實際 code / JSON，以及 `TODO.md` 中目前 milestone 的技術工作。

### 要寫劇情、對白或製作 CG

先讀 `.ai/WORKFLOW_MANIFEST.yaml`。

具體 production progress 與 blocker 在 `docs/narrative/CONTENT_PRODUCTION_TODO.md`。

---

## Current Milestone

目前專案 milestone 以 [`ROADMAP.md`](ROADMAP.md) 為準。

不要從 README、TODO、舊 issue 或 archive 文件推導專案優先級。

一個 backlog item 即使仍然有效，也不代表現在應該執行。

---

## 專案結構

| 位置 | 用途 |
| --- | --- |
| `public/` | Browser UI shell |
| `src/` | Runtime engine、visual、progress、Memories 等 |
| `content/routes/` | Playable route / story data |
| `content/production/` | Approved narrative / CG production contracts |
| `content/assets/` | Logical asset 與 source/runtime metadata |
| `content/recipes/` | Asset dependency / rebuild metadata |
| `content/characters/` | Character metadata |
| `assets-src/` | Git 追蹤的 runtime WebP 與生成用 PNG/JPEG references |
| `docs/` | Architecture、narrative、art 與 production documentation |
| `.ai/` | AI production harness、policy、schema 與 orchestration contract |
| `tools/`、`tests/` | Build、validation、content / asset tooling 與 regression tests |
| `dist/`、`generated/` | 可重建 output / cache，不作 source of truth |

Asset 的實際 provider、master location、runtime source 與 migration 狀態容易隨 architecture 演進，不在 README 重複維護。

**當前實際狀態以 `PROJECT_STATE.md`、`ARCHITECTURE.zh-TW.md`、active asset metadata 與 validators 為準。**

---

## Content / Production Boundary

新 production content 使用單一 canonical workflow。

大致關係為：

```text
Narrative Design
→ Scene / Dialogue
→ Narrative QA
→ Visual Planning
→ Render / Visual QA
→ Runtime Integration
→ Playable Review
```

Narrative、runtime integration 與 final art 不要求完全同步推進。

具體 gate、dependency 與 worker contract 不在 README 重複描述，統一以：

- `.ai/WORKFLOW_MANIFEST.yaml`
- `docs/narrative/CONTENT_PRODUCTION_TODO.md`
- 相關 Narrative / Art specs

為準。

Archive、experiment、舊 operator 與舊 prompt 只保留歷史 provenance，不應作為新的 production authority。

---

## 開發環境

Canonical engineering environment 是 GitHub Codespaces。

目前主要環境：

- Node 22
- ffmpeg / ffprobe
- preview port `4173`

Local clone 可以作 fallback；需要 fresh environment acceptance 的工作以 Codespaces 為準。

常用命令：

```bash
npm run dev
npm run preview
npm run build
npm run validate
npm test
npm run preview:smoke -- --skip-build
```

其他工具包括：

```bash
npm run assets:check
npm run assets:build
npm run context -- --route <id> --node <id>
npm run cg:packet -- --manifest <path> --check
npm run codespace:accept
```

實際可用命令與 script contract 以 `package.json` 為準。

---

## 核心開發原則

- `main` 應維持可重建、可驗證。
- Story 依賴 stable logical IDs，而不是 physical storage filename。
- `dist/` 與 `generated/` 不作 source of truth。
- Production content 不從 archive / experiment 恢復成 active authority。
- Persistent runtime IDs 應保持穩定，避免破壞 save / replay。
- Human 保留重大故事方向、角色設計、關鍵 CG acceptance 與最終 playable acceptance。
- 新需求是否現在執行，由 `ROADMAP.md` 的 current milestone 與 Exit Gate 決定。
