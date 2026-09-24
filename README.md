# 《17 樓的新鄰居》

一款 **純前端、可靜態部署的台北都市成人戀愛視覺小說**。目前 production prototype 聚焦兩位女主——許棠與江雨澄——採用 braided narrative：玩家在前中期可以自然同時認識、約會、重新靠近兩人，直到較晚的 commitment gate 才真正收束關係。

> **新對話／新協作者第一條規則：** 先讀 `PROJECT_STATE.md`、`TODO.md`、`AGENTS.md`。GitHub `main` 是 code / content / metadata / history source of truth；Google Drive 保存 canonical master/runtime assets；GitHub Codespaces 是 canonical 開發、build、test、preview 環境。不要依賴 earlier chat 或某台本地電腦的 working copy。

## 專案目前在哪裡

| 項目 | 目前狀態 |
| --- | --- |
| Engine / build foundation | **W1–W3 完成**：source/output boundary、Drive-backed asset build、strict media validation、Codespaces-only development、ephemeral Codespace acceptance、Playwright browser acceptance 已驗證 |
| Current technical milestone | **W4 — Player UI / Memories / CG Gallery**；產品與 data contract 已批准，runtime implementation 是目前下一個工程里程碑 |
| Canonical production story | **Braided Narrative v0.5**；約 66 個 authoring-level scene / gate / ending / after-story 單元，詳見 `docs/narrative/` |
| Prototype heroines | **許棠**：27 歲、約 170 cm、自由接案視覺設計師；**江雨澄**：23 歲、約 160 cm、研究生＋兼職插畫／ACG creator |
| Character visual identity | 許棠、江雨澄的 **6-sheet production reference packs 均已 QA PASS**；canonical Drive manifest 見 `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` |
| Current creative milestone | **Opening Vertical Slice**：COM-00 → SH-01，按 Batch A–D 生產 script / state / CG；進度板在 `docs/narrative/CONTENT_PRODUCTION_TODO.md` |
| Current playable runtime | 仍保留舊 **123-node Xu Tang + temporary office-OL branch** 作為 engine / migration / W4 regression fixture；**它不是新的 canonical production story ordering** |
| Runtime | Browser-native JavaScript，無 backend、無 database；save/progress 使用 `localStorage` |
| Asset storage | GitHub 保存 metadata / legacy Git-backed sources；Drive `source-private` 保存 accepted masters，`runtime-public` 保存 optimized runtime objects |
| Static output | `dist/`，由 build 產生；不要把 `dist/` 當 source of truth |

## Canonical creative direction

Prototype 的核心不是傳統「早期選一位女主後另一位消失」。玩家是在幾週的都市生活中分配 **時間、注意力與誠實程度**：

- 前中期允許同時和兩位女主建立關係；
- recent focus、knowledge flags、re-approach 與 crossover 製造低成本的 braided feel；
- 尚未 exclusivity 前的 overlap 不自動視為欺騙；
- deliberate deception 與 honest overlap 分開處理；
- late commitment 才真正 route-lock；
- Good ending 後還有 Relationship After Story，而不是 runtime 立即終止。

世界觀、五位 future heroine 的較大產品設定與角色庫見 `docs/proposals/urban-dating-sim-setting-proposal.md`；許棠／江雨澄 prototype 的 production authority 則以 `docs/narrative/` 與 `docs/art/` 最新文件為準。

## 現在的兩條工作線

### 1. Technical track — W4

W4 把目前偏 prototype/debug 的玩家介面升級成真正適合多女主 VN 的產品介面：

- Title：一個大 Start/Continue + Memories + CG；
- Game UI：縮小 dialogue chrome，讓 CG / scene 成為視覺主體；
- Memories：一頁式 vertical timeline，玩家看到的是 Memory Event，不是 engine node graph；
- Save semantics：分離 replay/current cursor 與 deepest story frontier，重播舊回憶不會讓 Continue 倒退；
- CG Gallery：維持單純收藏牆，不承擔 route graph 職責。

詳細規格：`docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`。

### 2. Creative track — Opening Vertical Slice

第一個 production-grade 內容樣本不是一次把整個 66-scene story 寫完，而是先完成 opening vertical slice：

```text
COM-00  雨夜搬家
COM-01X 電梯重啟
COM-01J 地下街初遇
COM-02X 深夜便利店
COM-02J 咖啡店重逢
COM-03X 包裹 / Line
COM-03J 推薦 / Discord
COM-03M 一週訊息 montage
XT-04   中山書店
JYC-05  ACG：她的主場
JYC-06  Gaming Night
SH-01   17樓第一次同框
```

每個 major scene 使用 `docs/narrative/CONTENT_PRODUCTION_TODO.md` 的 S1–S12 Definition of Done。W4/content schema 尚未穩定時，creative production 可以先完成 script、continuity、state contract、shot list、CG generation 與 asset QA；真正 runtime integration / playtest / final polish 在 W4 可承接後完成。

## Canonical documents

| 文件 | Authority |
| --- | --- |
| `PROJECT_STATE.md` | 現在正在做什麼、最新 milestone / migration / acceptance 狀態 |
| `TODO.md` | 技術執行順序、milestones、hard gates，以及長期 AI Game Director / Content Factory North Star |
| `ARCHITECTURE.zh-TW.md` | canonical runtime / content / asset / build architecture |
| `AGENTS.md` | 新 AI session 的最低工作規則 |
| `docs/narrative/CONTENT_PRODUCTION_TODO.md` | creative production batch board；只記進度，不重複 scene spec |
| `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` | prototype scene/beat/character arc/pre-script authority |
| `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` | route DAG、relationship/knowledge/deception state contract |
| `docs/art/PROTOTYPE_ART_REQUIREMENTS.md` | backgrounds、sprites、CG slots、scene-to-asset mapping、production priorities |
| `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` | 角色 6-sheet identity/body/wardrobe reference contract + Drive manifest |
| `docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md` | Opening Vertical Slice 的具體 CG generation input |
| `docs/proposals/urban-dating-sim-setting-proposal.md` | 世界觀、產品定位、future heroine packs、較大內容方向 |
| `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md` | W4 UI / Memories / replay / frontier data contract |

## 快速開始：GitHub Codespaces

Repository 已包含 `.devcontainer/`，canonical environment 使用 Node 22、ffmpeg/ffprobe 與 port 4173。Local clone 只視為 emergency/advanced fallback，不是 acceptance target。

1. GitHub → **Code → Codespaces → Create codespace on main**（或 resume 現有 Codespace）。
2. 執行：

```bash
npm run dev
```

3. 打開 Ports 面板的 **Game Preview (4173)**。
4. milestone / production-like preview 使用：

```bash
npm run preview
```

Forwarded port 預設保持 private；只有主觀 UI/視覺 reviewer 無法使用 GitHub authentication 時才暫時 public，review 後立即恢復 private／刪除 ephemeral Codespace。不要把 forwarded URL hardcode 到任何 source、content 或 tests。

### AI-operated fresh Codespace acceptance

工程 acceptance 不要求 Human 手動建立測試環境：

```bash
npm run codespace:accept
```

它會建立一次性 Codespace，透過 SSH 跑 clean asset/build/validate/test、啟動 preview、private-tunnel smoke，成功後刪除環境。

需要主觀 browser review 時：

```bash
npm run codespace:review
```

W3 的 canonical engineering proof 已完成；GitHub Actions 的 Browser Acceptance 也已用 Chromium 驗證 start/continue/reload/localStorage、gallery/branch fixture、cinematic、ending persistence、mobile layout 與 blocking browser errors。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | Codespaces 日常 inner loop：build、serve 4173、watch/rebuild |
| `npm run preview` | production-like clean build + preview |
| `npm run preview:smoke -- --skip-build` | static/runtime HTTP smoke |
| `npm run codespace:accept` | ephemeral fresh Codespace engineering acceptance |
| `npm run codespace:review` | acceptance 後建立 temporary public review surface |
| `npm run validate` | content graph / logical assets / recipes / character dependency validation |
| `npm run assets:check` | media mapping/hash/metadata/full-decode 檢查 |
| `npm run assets:build` | 從 Git/Drive canonical sources 建立 runtime assets |
| `npm run build` | clean rebuild `dist/` |
| `npm run assets:plan -- <character-id>` | 列出 character/design change 影響的 assets |
| `npm run context -- --route <route-id> --node <node-id>` | 產生局部修改 context packet |

## 架構摘要

專案採用 data-driven content architecture：故事引用穩定 logical IDs；角色、圖片、CG、state 與 route 都透過 metadata/config 連接，避免新增內容時改寫 engine。

| 層 | 位置 | 職責 |
| --- | --- | --- |
| Product / narrative specs | `docs/` | 世界觀、scene plan、route/state、art requirement、W4 UX contract |
| Character definitions | `content/characters/*.json` | production identity / invariants / design versions |
| Asset manifest | `content/assets/manifest.json` | logical asset ID → runtime asset metadata |
| Source catalog / map | `content/assets/source-catalog.json`、`source-map.json` | accepted master provenance + runtime provider/hash mapping |
| Asset recipes | `content/recipes/assets.json` | 可重建的 prompt / dependencies / camera / generation metadata |
| Route registry | `content/routes/index.json` | 可玩 package 登錄與 default route |
| Route packages | `content/routes/<route-id>/` | storyFiles / sceneFiles / asset whitelist / route context |
| Shared scenes | `content/scenes/*.json` | reusable pools / scene templates |
| Runtime engine | `src/` | playback、branching、save/progress、visuals、gallery、memories |
| Static UI source | `public/` | HTML/CSS shell |
| Tooling | `tools/` | build / validation / context / asset / Codespace automation |
| Generated output | `dist/` | disposable static site build |

### Source-of-truth boundary

```text
GitHub
  code / structured content / metadata / history

Google Drive source-private
  accepted private master assets

Google Drive runtime-public
  optimized runtime objects

GitHub Codespaces
  canonical build / test / preview environment

dist/
  generated deployable output, not source of truth
```

新的 accepted master 不得只存在某台 Mac/PC；需要 remote build 的 runtime object 必須有 provider/file ID(or URL)/bytes/SHA-256 metadata。Physical storage 可以改，但 story 中的 logical asset IDs 不應跟著改。

## 內容與美術 production contract

目前 manual production loop：

```text
Canonical story/state specs
        ↓
scene / batch scope
        ↓
script + choices + state contract
        ↓
art shot list + generation recipe
        ↓
CG/background/sprite generation + Human selection
        ↓
canonical master ingest + runtime derivative
        ↓
story JSON / asset metadata integration
        ↓
build / validate / browser acceptance
        ↓
Codespaces playable review
```

這條 loop 是未來自動化的 interface，不代表現在就要建立 orchestration system。`TODO.md` 已記錄長期 **AI Game Director → Planner → Writer/CG → Integrator → QA → GitHub PR/Playable Preview** North Star；在第一個完整 vertical slice 與數個 manual batches 跑通前，不實作 Content Factory。

## Character / CG identity rules

- 許棠與江雨澄 production asset 必須使用各自 approved reference pack；不可從另一角色演變。
- `ref-01-face` 是最高 identity authority；full-body / wardrobe / expression 視 shot 按需加入。
- **禁止把上一張 CG 當下一張 CG 的唯一 identity source**，避免多代生成漂移。
- Canonical runtime 是 mobile-first 9:16；CG/BG 要保存 focal point、safe zone、face/hand/object composition。
- story 只引用 logical asset ID，不直接耦合 physical filename/provider。

完整 contract 見 `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` 與 `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`。

## 驗證與 Definition of Done

一般 coherent code/content change 至少執行：

```bash
npm run build
npm run validate
npm test
git diff --check
```

Asset change 另外執行：

```bash
npm run assets:check
npm run assets:build
```

涉及 milestone / runtime 行為時，還需要對應 Browser Acceptance / Codespace proof。涉及 creative scene 時，使用 `CONTENT_PRODUCTION_TODO.md` 的 S1–S12 gate，而不是只因 JSON 可 build 就視為完成。

## Long-term direction

專案的最終 production model 是把 Human 提升到 Creative Director / Product Owner 層：Human 可以只提出「擴寫約會池」「新增女主」「補強某一 Act」這類高階需求，AI Game Director 自動讀取 repo inventory / constraints、拆成 production batches、調度一次性 Planner/Writer/CG/Integrator/QA workers，最後交付 GitHub PR + playable preview + QA summary。

**目前這只是 North Star，不是當前 implementation milestone。** 先把 W4 與第一批真實 production content/CG 整合跑通，讓 manual workflow 的 input/output contract 穩定，再自動化重複部分。完整 prerequisites 與 phased roadmap 見 `TODO.md`。

## 新 session 的建議讀取順序

### 工程 / runtime

1. `PROJECT_STATE.md`
2. `TODO.md`
3. `AGENTS.md`
4. `ARCHITECTURE.zh-TW.md`
5. 正在修改的 feature spec（W4 等）

### 劇情 / production content

1. `PROJECT_STATE.md`
2. `docs/narrative/CONTENT_PRODUCTION_TODO.md`
3. `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`
4. `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
5. `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`
6. `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`
7. 需要 CG 時再讀 `docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md`

不要為了「完整 context」把所有舊聊天塞進新 session；應以 repo canonical docs + task-local context packet 為準。

## Repository

- GitHub：`TsungmingLiu/seventeen-floor-neighbor`
- Default branch：`main`
- Canonical development：GitHub Codespaces
- Pre-commercial asset store：Google Drive
- Backend：none
- Deployment target：static hosting（release pipeline 尚在後續 milestone）
