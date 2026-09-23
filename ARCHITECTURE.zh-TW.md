# ARCHITECTURE.zh-TW.md

> 本專案的 Canonical Architecture 與開發工作流。
>
> **Canonical 主版本：本檔案 `ARCHITECTURE.zh-TW.md`。** `ARCHITECTURE.md` 是英文 mirror；若兩者內容衝突，以本中文版為準。
>
> 這份檔案是專案的權威規格（authoritative project specification）。歷史 Google Docs、聊天紀錄、prototype 與其他生成筆記都只作參考。若與本檔案衝突，除非使用者明確批准架構變更，否則以本檔案為準。

---

## 1. 專案目標

建立一套可重用、Web-first 的互動視覺小說／戀愛遊戲平台，並針對「單人開發者 + AI 協作」的工作方式最佳化。

本專案不是要做一款一次性的遊戲，而是建立一套可持續重用的系統：

```text
Human + AI Authoring
        ↓
Structured Content
        ↓
Content Compiler
        ↓
Verified Manifest + Runtime Assets
        ↓
Web Player
        ↓
Preview / Distribution Adapters
        ↓
Sites / Pages / Other Platforms
```

MVP 的成功標準是：能以低摩擦的方式，完成一條約 10–15 分鐘的完整 route，並走完「設計 → 生成 → 驗證 → 遊玩 → 修改 → 發布」的完整循環。

不要因為某個引擎功能在技術上很有趣，就擴充 framework。任何新的 engine/framework 工作，都必須由現有架構無法乾淨表達的真實內容需求來驅動。

---

## 2. 核心原則

### 2.1 Web First

- 第一優先裝置：手機直向 9:16。
- Desktop：置中、自適應的 9:16 viewport。
- 優先使用 static hosting。
- 在真正出現需求之前，不引入常駐 backend。
- 遊戲本身必須能獨立在 browser 內執行；AI 是 authoring / development 工具，不是 runtime dependency。

### 2.2 Content 與 Player 分離

Player 不應知道：

- 內容是哪個 AI 寫的；
- 某條 route 屬於哪個角色；
- source assets 是在哪個平台生成的；
- 最後發布到哪個平台。

Player 只理解：

- 編譯後的 story / state data；
- logical asset IDs；
- runtime asset manifest；
- generic visual primitives；
- audio commands；
- save data。

### 2.3 Build Output 必須可丟棄

以下操作必須永遠安全：

```bash
rm -rf dist
rm -rf generated
npm run build
```

任何不可再生的人工作品或 AI master asset，都不能只存在 `dist/` 或其他 generated directory。

### 2.4 Browser Assets 視為可被提取

不要把 client-side encryption 當作真正 DRM。

Content hash 可用於：

- immutable URL；
- cache busting；
- 避免語意化檔名直接曝光；
- integrity / version tracking。

但它不是 security boundary。

---

## 3. Canonical Repository 結構

目標目錄：

```text
game/
├── ARCHITECTURE.md
├── ARCHITECTURE.zh-TW.md
├── README.md
├── package.json
│
├── src/
│   ├── engine/
│   ├── components/
│   ├── services/
│   └── adapters/
│
├── content/
│   ├── characters/
│   ├── routes/
│   ├── chapters/
│   ├── shared/
│   ├── recipes/
│   └── schemas/
│
├── assets-src/
│   ├── characters/
│   ├── backgrounds/
│   ├── cg/
│   ├── video/
│   └── audio/
│
├── scripts/
│   ├── content-compile.*
│   ├── story-validate.*
│   ├── asset-check.*
│   ├── asset-build.*
│   ├── checkpoint.*
│   ├── asset-fetch.*
│   └── release.*
│
├── generated/
│   ├── runtime-assets/
│   ├── source-cache/
│   └── game.manifest.json
│
├── public/
└── dist/
```

### 目錄規則

`src/`
: Runtime player 與通用 engine code。

`content/`
: 角色、route、scene、recipe、schema、dialogue、branch 與 metadata 的 structured source-of-truth。

`assets-src/`
: 使用者在本地電腦開發時，用於高頻迭代的 master image / video / audio staging area。

`generated/`
: Disposable compiler/cache output。必須可重建。

`dist/`
: Disposable production build output。禁止手動放入不可再生的 source file。

---

## 4. Story 與 Content Model

### 4.1 Stable Semantic IDs

所有可被存檔或跳轉的 story node，都必須使用 stable semantic ID。

好的例子：

```text
xu_ch01_elevator_intro_01
xu_ch01_noodle_choice
xu_ch02_rooftop_confession
```

不好的例子：

```text
intro1
choice2
node37
c1a
```

Array position、暫時 index 或產生順序，都不能成為永久 save identifier。

### 4.2 Content Schema

Content model 至少要支援：

- character profile；
- outfit / hairstyle / makeup versions；
- route；
- chapter；
- scene；
- node；
- dialogue；
- narration；
- choices；
- conditions；
- actions；
- flags；
- numeric variables；
- affection；
- background；
- character layers；
- CG；
- scene video；
- BGM；
- SFX；
- schema/content metadata；
- Memory Section / Memory Event（玩家可理解的回憶單位，與 engine node 非一對一）。

### 4.3 Story Engine State

Runtime store 應只持有通用 state，例如：

```text
currentNodeId
variables
flags
characterState
affection
choiceHistory
dialogueQueue
settings
```

Store 不應依賴 React component、DOM 結構或 source asset file format。

---

## 5. Content Compiler

Content Compiler 是 authoring 與 runtime 之間的強制邊界。

至少要執行：

- JSON/schema validation；
- stable ID uniqueness check；
- `goto` / choice target validation；
- reachability check；
- orphan node check；
- illegal/dead terminal check；
- condition/action validation；
- asset reference validation；
- build-profile filtering；
- runtime asset mapping；
- manifest generation；
- 可讀、可定位的 build errors。

當 required content 不一致時，必須明確失敗，不允許 silent fallback。

### 5.1 Build Profiles

最低需要：

```text
sfw
full
```

未來可擴充：

```text
demo
press
platform-specific
```

被排除的內容必須在 compile/build 階段真正移除，而不是只用 runtime UI 隱藏。

不要在 React component 到處散落：

```ts
if (mode === "sfw") { ... }
```

---

## 6. Player 與 Rendering

### 6.1 MVP Stack

使用：

- React；
- TypeScript；
- Vite；
- CSS / Tailwind CSS；
- 一般 DOM media elements。

MVP 不使用 Unity、Godot 或 PixiJS。

### 6.2 Stage Boundary

`StageViewport` 負責：

- background；
- character layers；
- CG；
- scene video；
- generic visual modifiers。

`DialogueOverlay` 負責：

- speaker；
- dialogue；
- narration；
- choices；
- backlog；
- auto；
- skip；
- settings。

`AudioService` 負責：

- BGM lifecycle；
- SFX；
- mute；
- volume；
- scene transitions。

### 6.3 Visual Primitives

MVP 固定四種主要 primitive：

```text
background
characterLayer
cg
sceneVideo
```

以下效果應做成可組合 modifier：

```text
fade
shake
slide
zoom
```

不要為單一 scene 寫專屬 rendering path。

### 6.4 什麼時候才考慮 PixiJS

只有在以下條件同時成立時，才考慮 PixiJS / WebGL：

1. 已有真實可玩的產品。
2. DOM/CSS 已出現可量測的 bottleneck 或表現限制。
3. 經驗證的內容需求真的需要 shader、particle、skeletal animation 或大量 simultaneous sprites。

即使 renderer 未來被替換，也不應要求重寫 Story Schema。

---

## 7. Visual Asset Pipeline

### 7.1 Images

Master source 可以是 PNG/JPEG。

Runtime target：

```text
WebP
```

Pipeline：

```text
master source
    ↓
asset validation
    ↓
automatic conversion
    ↓
generated/runtime-assets/*.webp
    ↓
manifest
```

AVIF 不是 MVP 必需。只有實測確認值得才加入。

### 7.2 Video

不要把 transparent-character video compositing 當作預設架構。

一般對話：

```text
static background
+ static character art
```

重要情緒／cinematic moment：

```text
scene-based full-frame short video
```

建議 runtime video：

- 9:16；
- 預設 720×1280；
- H.264 MP4；
- loop 影片約 2–4 秒；
- 預設 silent；
- 提供 poster / static fallback；
- `playsinline`；
- `muted`；
- 適合時使用 `loop` / `autoplay`。

BGM 應由 `AudioService` 管理，不要塞進 scene video。

### 7.3 Composition Contract

所有生成素材都必須服從 UI safe zone。

每個 asset recipe 應能描述：

- aspect ratio；
- width / height；
- focal point；
- object position；
- dialogue safe zone；
- crop tolerance；
- 重要 face / hand / object region。

目標是整條 route 的一致性，而不是追求單張圖最漂亮。

---

## 8. Character Bible 與 Asset Recipes

每個主要角色都應有 canonical Character Bible，至少描述：

- physical identity；
- face characteristics；
- hair；
- body proportions；
- signature clothing；
- personality；
- speech style；
- emotional tells；
- behavioral constraints；
- relationship dynamics；
- route arc；
- outfit versions；
- hairstyle versions；
- makeup versions；
- identity/reference images；
- generation metadata。

Reference identity image 是角色身份錨點。

不要只用上一張 CG 當下一張 CG 的唯一 reference，否則會產生 generational drift。

### 8.1 Asset Recipe Contract

所有需要使用者去第三方服務人工生成的 asset，在 handoff 前都必須有完整 recipe。

最低欄位：

```text
assetId
type
character
designVersion
outfitVersion
hairstyleVersion
makeupVersion
referenceInputs
prompt
negativeConstraints
camera
headPose
action
lighting
aspectRatio
width
height
safeZone
focalPoint
objectPosition
sourcePath
runtimeId
runtimeFormat
```

例如：

```yaml
assetId: cg.xu_tang.ch03.window_confession
sourcePath: assets-src/cg/xu_tang/ch03/window_confession.png
aspectRatio: 9:16
width: 1080
height: 1920
runtimeId: cg.xu_tang.ch03.window_confession
runtimeFormat: webp
```

Human operator 最理想只需要：

1. 生成；
2. 挑選；
3. 存到指定 path。

不需要自己維護 manifest、runtime path 或 story JSON。

---

## 9. Human / AI 分工

操作模式是：

```text
Human Creative Director
+
AI Production Engineer
```

### 9.1 Human Responsibilities

使用者負責決定：

- 要做哪個角色 / route / scene；
- 角色概念；
- 外型；
- 個性；
- chemistry；
- route 方向；
- visual taste；
- pacing；
- CG/video 是否接受；
- build 是否可以 release。

使用者也負責目前仍需人工操作的第三方生成：

- 上傳角色 reference；
- 貼 prompt；
- 生成候選；
- 選最好的一版；
- 存到指定 path。

### 9.2 AI Responsibilities

AI 負責：

- Character Bible 更新；
- route design；
- scene design；
- dialogue；
- branching；
- JSON/content editing；
- stable IDs；
- asset planning；
- generation prompts；
- 預定 filename/path；
- validation；
- story graph testing；
- asset checking；
- asset conversion；
- build；
- preview preparation；
- bug fixing；
- iteration；
- 在授權環境裡執行 Git commit/push；
- 執行 release pipeline。

理想的 human → AI handoff 是：

> 「圖都好了。」

從這一刻起，AI 應能接管後續 integration。

---

## 10. 標準 Content Production Workflow

### Step 1 — 決定要做什麼

例如：

- 新角色；
- 新 route；
- 新 chapter；
- 新 scene；
- 新 branch。

Human 與 AI 一起決定：

- character hook；
- backstory；
- appearance；
- personality；
- relationship dynamic；
- route arc；
- outfits；
- key scenes；
- visual motifs；
- 需要的 identity/reference images。

### Step 2 — AI 建立 Story + Asset Plan

AI 更新：

- Character Bible；
- content JSON；
- route/chapter/scene data；
- stable semantic node IDs；
- dialogue；
- choices；
- conditions；
- state changes；
- endings；
- Asset Recipes。

AI 同時產出 Generation Queue。

每個 queue item 都必須清楚回答：

```text
要生成什麼？
要用哪張角色 reference？
要貼什麼 prompt？
尺寸／比例是什麼？
最後要存在哪個 path？
```

### Step 3 — Human 生成 Assets

使用者：

1. 打開指定 generation service。
2. 上傳指定 identity/reference image。
3. 使用 AI 提供的 prompt/settings。
4. 生成候選。
5. 挑選最好的結果。
6. 候選素材可先留在生成工具／暫存位置；Human 接受後，將 master 保存到 canonical asset storage，並由 AI 更新 catalog/runtime mapping。

不需要把每一個候選 asset 都上傳 Drive；但 **accepted master 不得只存在某台本地電腦**。Git-tracked legacy source 可繼續留在 `assets-src/`，新的 accepted master 優先進 Google Drive `source-private/`.

### Step 4 — AI Integrate + Validate

目標 pipeline：

```text
assets-src
    ↓
asset check
    ↓
size / aspect / filename validation
    ↓
image / video optimization
    ↓
generated runtime assets
    ↓
content compile
    ↓
story graph tests
    ↓
build
    ↓
preview
```

Missing asset error 必須直接指出：

- logical asset ID；
- 對應 scene/recipe；
- expected source path；
- expected size/aspect ratio；
- 是否阻擋 build。

### Step 5 — Human Playtest

使用者可以直接用自然語言回饋，例如：

- 「這句不像她。」
- 「這裡進展太快。」
- 「這個 choice 沒意義。」
- 「這張 CG 換掉。」
- 「手機上按鈕被遮住。」
- 「這個 scene 沒往下走。」

AI 必須判斷問題真正屬於哪一層：

```text
Content
Asset
Compiler
Player
```

不要用 one-off hardcode 掩蓋 architecture defect。

### Step 6 — Version / Release

使用者接受後：

- run validation；
- run build；
- run smoke tests；
- commit；
- push；
- 如需 review/release，確認 cloud-complete verification；
- 透過 Distribution Adapter 發布。

---


## 11. Codespaces-only Development Model

本專案的 canonical development environment 是 **GitHub Codespaces**。不再維護 Local Working 與 Remote Working 兩套等價流程。

### 11.1 各系統的唯一職責

#### GitHub

GitHub 是以下內容的 canonical history/source：

- code；
- structured content；
- build/validation tooling；
- devcontainer；
- asset metadata；
- Git history。

#### GitHub Codespaces

Codespace 是唯一 supported development / build / test working environment。

它必須能從 GitHub checkout 加上公開可解析的 runtime asset metadata 完成：

```text
edit
→ validate
→ build
→ preview
→ test
→ commit / push
```

Codespace 是 disposable environment；任何必須永久保存的 accepted master 不得只存在 Codespace filesystem。

#### Google Drive `source-private/`

目前 pre-commercial canonical master vault。

- Restricted；
- 保存 accepted master；
- 用 catalog 記錄 file ID / hash / dimensions / provenance。

#### Google Drive `runtime-public/`

目前 remote-build runtime store。

- Anyone with the link / Viewer；
- 只放 optimized runtime objects；
- build 以 URL/file ID/byte size/SHA-256 驗證後使用；
- 不存 secrets。

#### ChatGPT Work / 其他 AI operator

可操作 GitHub、Codespace 與 review surface。它不是另一份 working copy，也不得假設存在 Mac-only source。

#### ChatGPT Sites / Distribution Adapter

用於 stable review 或 release，不取代 Codespaces inner loop。

### 11.2 Local machine 的定位

本機不再是 canonical dev environment。

使用者人在電腦前可：

- 用 browser 開 Codespace；或
- 用 Desktop VS Code 連到 Codespace。

Local clone 可以作為 emergency/advanced fallback，但：

- 不列入 acceptance；
- 不要求環境一致；
- 不得成為唯一 accepted asset/source；
- 不得作為 release provenance。

### 11.3 Reproducible Codespace

Repository 必須提供 `.devcontainer/`：

- Node major 與 CI 對齊；
- 安裝 ffmpeg/ffprobe；
- forward 固定 preview port；
- project-specific system dependency 不要求 Human 手動安裝。

目前 W3 固定 Node 22 與 port 4173。

---

## 12. Operating Modes

### Mode A — Codespace Working

日常開發唯一 canonical mode：

```text
GitHub
→ Codespace
→ npm run dev
→ forwarded preview
→ edit / playtest
→ verify
→ commit / push
```

未 commit 的 working tree 可以存在，但它只存在當前 Codespace；coherent change 完成後應驗證並 push。

### Mode B — Verified Milestone

準備 stable review/release 時，對明確 commit 執行 cloud-complete verification：

```text
GitHub commit
+
accepted master catalog/storage
+
runtime object metadata/hashes
+
fresh clean build proof
```

這不是「關 Mac 前同步」；Codespaces-only 後沒有 local-to-cloud checkpoint mode。

### Mode C — Sites Review

需要穩定、可重複的人類 review URL 時：

```text
verified commit
→ review build
→ Sites
→ Human playtest
```

### Mode D — Release

只接受已驗證 input：

```text
verified commit
→ production build/profile
→ runtime distribution provider
→ Distribution Adapter
→ smoke test
→ release record
```

---

## 13. Preview Model

### 13.1 Codespaces Forwarded Preview

日常 development 的預設 preview。

```bash
npm run dev
```

- bind `0.0.0.0`；
- fixed port `4173`；
- Codespaces `forwardPorts` 自動轉發；
- Human 在同一 forwarded origin refresh/playtest；
- source/content 變更後 dev server rebuild，瀏覽器 refresh 看結果。

Production-like acceptance：

```bash
npm run preview
```

它先 clean build，再以同一 static server/port 提供 `dist/`。

Forwarded port 預設保持 private。只有需要讓未共享 GitHub authentication 的 reviewer 直接打開時，才在 review 期間暫時設為 public；review 後恢復 private/停止服務。

Forwarded URL 是 temporary review address：

- 不 hardcode；
- 不當 production URL；
- Codespace 重建／重新建立後可改變。

### 13.2 Preview Smoke

CI 使用：

```bash
npm run preview:smoke -- --skip-build
```

驗證：

- HTML/CSS/JS/route JSON；
- extensionless fallback；
- missing asset 404；
- video Range request/HTTP 206（存在 MP4 時）。

### 13.3 ChatGPT Sites Review Preview

Sites 是 stable milestone review surface，不是 high-frequency dev server。

用途：

- 較完整 human playtest；
- 手機 review；
- 對照已知 Git commit/build；
- milestone approval。

---

## 14. Asset Storage Model

### 14.1 Git-backed `assets-src/`

目前保留既有 legacy/preservation source，以及適合進 Git 的小型 source。因為它們存在 Git，不依賴某台 Mac。

不要為了形式統一而刪除尚未有安全 canonical replacement 的 source。

### 14.2 Google Drive `source-private/`

新的 accepted master 預設 canonical vault：

```text
Restricted
canonical master
not shipped directly to browser
```

accepted master 不得只留在本地電腦、Codespace ephemeral disk 或生成工具暫存區。

### 14.3 `generated/` / `source-cache/`

都是 disposable cache/output。

可以刪除並重建，不是 source of truth。

### 14.4 Google Drive `runtime-public/`

remote build 使用的 optimized runtime store。

`content/assets/source-map.json` 保存 provider/file ID/URL/bytes/SHA-256。CI/Codespace 下載後重新驗 hash/full-decode，再產生 `generated/runtime-assets/` 與 `dist/assets/`。

### 14.5 Provider Abstraction

Story/content 只依賴 logical asset IDs。

Storage provider 可演進：

```text
Git-backed source / Google Drive
→ future R2/CDN
```

provider 或 physical filename 改變不得迫使 story JSON 改變。

## 15. Save System

MVP 可使用 `localStorage`。

它是便利性的 local save，不是永久資料保證。

最低 save payload：

```json
{
  "schemaVersion": 1,
  "gameVersion": "0.1.0",
  "contentVersion": "0.1.0",
  "currentNodeId": "xu_ch01_elevator_intro_01",
  "variables": {},
  "flags": {},
  "affection": {},
  "choiceHistory": []
}
```

### Save Rules

- `currentNodeId` 必須是 stable semantic ID。
- Save schema 改動需要明確 migration path。
- 被移除的 node ID 需要 migration/fallback rule。
- 未來 Save Code 應先 compression，再 Base64URL encode。
- Base64 不是 compression，也不是 security。

Cloud save/account/OAuth 延後到真正有需求再做。

### 15.1 Replay Cursor 與 Story Frontier

當玩家可以從回憶頁重玩舊劇情後，「目前正在玩的節點」與「歷史最深主進度」必須分離。

- `cursorSnapshot`：玩家此刻正在玩的 snapshot；從舊回憶 replay 時可以向前或向後移動。
- `frontierSnapshot`：玩家歷史上最靠近結局的正式主進度；replay 舊內容不得讓它倒退。
- Continue / title backdrop 依 `frontierSnapshot`，不是依最近一次 replay 的 cursor。
- 玩家若從舊回憶走出真正更深的新 branch，進入比舊 frontier 更高的內容 progression rank 時，才推進 frontier。
- progression rank 應由 player-facing Memory Event content metadata 定義，不以「最後玩過的時間」或 raw node count 判定。
- Save schema 升級必須保留既有 CG unlock、ending unlock、checkpoint 與可合理遷移的 story progress。

玩家回憶介面採 Memory Event，而不是直接展示完整 story node graph。詳細 W4 行為與資料模型見 `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`。

---

## 16. Responsive UI

### Mobile

使用：

- `100dvh`；
- `env(safe-area-inset-top)`；
- `env(safe-area-inset-bottom)`；
- touch-friendly controls；
- safe dialogue/choice placement。

只有在 composition contract 已保護重要內容時，才放心使用 `object-fit: cover`。

### Desktop

優先使用 height-constrained 9:16 layout。

概念：

```css
height: 100dvh;
max-height: 100dvh;
aspect-ratio: 9 / 16;
width: auto;
max-width: 100vw;
```

不要只靠固定 `max-width`，否則在矮的 laptop viewport 可能產生過高畫面。

### 16.1 Player-facing Memories

玩家的回憶介面固定採單頁、縱向 timeline：

- 不提供需要自由 pan/zoom 的巨大劇情 DAG。
- 不建立 Memories Overview → Route Detail 的必要次級頁。
- Story Node 是 runtime primitive；Memory Event 是 player-facing narrative primitive。
- 重要 branch 可 inline 顯示；分支數量過多時壓縮成 cluster。
- 未探索 subtree 不預先完整展開，避免劇透與橫向爆炸。
- 單女主 Memory Event 可重用對應事件 CG 作淡化、face-focused backdrop；共通事件使用 scene/background art。
- 卡片背景優先用 lazy-loaded `<img>` + object-position/focus metadata，而不是一次載入全部 CSS background images。
- 手機不得產生 page-level horizontal scroll。

功能級規格與驗收案例見 `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`。

---

## 17. Audio

Prototype 階段：

- `AudioService` 可以先是 stub。

第一個對外可玩的 MVP 至少應有：

- 1 首一般 BGM；
- 1 首情緒／替代 BGM；
- 1 個基本 UI/choice SFX。

在沒有真實需求前，不做：

- voice acting；
- advanced mixing；
- complex Web Audio scheduling。

---

## 18. Validation 與 Release Gates

### Automated Story / Content Checks

至少包括：

- schema validation；
- duplicate IDs；
- dangling targets；
- unreachable/orphan nodes；
- invalid terminal states；
- missing assets；
- build-profile leakage；
- manifest completeness；
- save migration fixtures。

### Device QA

公開發布前至少測試：

- iPhone Safari；
- Android Chrome；
- desktop Chrome；
- desktop Safari；
- viewport height 變化；
- autoplay；
- video loop；
- poster fallback；
- reload/back；
- long dialogue；
- multiple-choice layout；
- slow-network transition。

### Content QA

每條 route 都要確認：

- character consistency；
- visual consistency；
- branching 是否真的有意義；
- pacing；
- CG/video placement；
- UI 是否遮擋 face / hand / important object。

---


## 19. Secrets

永遠不要 commit secrets。

Canonical development environment 使用：

```text
GitHub Codespaces Secrets
environment secrets
```

Repository 可以記錄 secret 名稱，但不能記錄 secret value。

目前 Drive-first runtime build 不需要 Google private credential；`runtime-public` 必須能由 CI/Codespace 依 metadata 匿名取得。

未來 R2 migration 時才可能加入：

```text
CLOUDFLARE_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
```

Preview / release scripts 只能從 environment 讀取 credentials。

---

## 20. Target Tooling Interface

目前已實作 command surface：

```bash
npm run validate
npm run assets:check
npm run assets:build
npm run build
npm run dev
npm run preview
npm run preview:smoke
npm run context -- --route <route-id> --node <node-id>
```

語意：

`validate`
: 驗證 structured content、story graph、asset references 等現行契約。

`assets:check`
: 驗證 required source/runtime media、mapping、hash/metadata 與 full decode。

`assets:build`
: 從 Git-backed source 或 remote runtime provider 產生 `generated/runtime-assets/`。

`build`
: clean rebuild `dist/`。

`dev`
: Codespaces canonical inner loop；build 後 serve 4173 並監看 source/content 變更 rebuild。

`preview`
: production-like clean build 後 serve 4173，不進 watch loop。

`preview:smoke`
: CI static-server contract test。

未來再加入：

```bash
npm run checkpoint
npm run release
```

`checkpoint`
: W5 cloud-complete verification/provenance；不是 local-to-cloud sync。

`release`
: 只接受 cloud-complete verified input，建立 production release。

不需要獨立 `assets:fetch` 作為 W3 blocker；現行 `assets:build` 已能直接取得 `gdrive-public` runtime objects。

---

## 21. Current Prototype Migration Strategy

不要整個推翻 prototype。

已完成：

1. **W1 Source Asset Boundary** — `public/`、`assets-src/`、`generated/`、`dist/` 邊界建立，clean build 可重建。
2. **W2 Asset Check + Asset Build** — full-decode validation、Drive source/runtime store、remote hash verification 已建立。
3. **W3 core tooling** — Node 22 + ffmpeg devcontainer、4173 forwarded preview、`dev/preview/preview:smoke` 已加入；fresh Codespace + Human acceptance 是最後 gate。

接下來：

4. **W4 Player UI / Memories / CG Gallery** — 依 `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md` 實作。
5. **W5 Cloud-complete verification** — 對 commit + canonical assets + clean build 產生 provenance。
6. **W6 SFW / Full profiles** — compile-time pruning 與 leakage tests。
7. **W7 Review / Release pipeline** — Sites review、deterministic release。
8. 之後才做 3–4 女主 scale test 與必要的 semantic-ID/refactor work。

React/TypeScript/Vite 不是 W3 prerequisite；只有後續真實複雜度證明需要時再 migration。

## 22. MVP Non-Goals

除非出現已驗證的真實需求，否則不要加入：

- Unity；
- Godot；
- PixiJS 作為 primary renderer；
- transparent alpha video composition pipeline；
- WebM/HEVC multi-format matrix；
- 全面 AVIF migration；
- voice acting；
- advanced Web Audio mixing；
- OAuth；
- cloud save；
- 沒有明確問題要回答的 analytics platform；
- general backend；
- client-side AES DRM；
- speculative scaling architecture。

Cloudflare R2 migration 目前 deferred：Drive-first 先支援開發、Sites review 與小規模 friend test；準備商業化、需要正式 CDN / cache-control / custom domain / 更穩定流量時再遷移。

---


## 23. Version Concepts

永遠區分以下三種版本。

### Working Latest

目前 Codespace working tree。

可能包含：

- uncommitted code/content；
- experimental changes；
- 尚未通過完整 verification 的修改。

它不是 release provenance。

### Verified Latest

最新 cloud-complete verified commit：

```text
GitHub commit
+
required accepted masters safely represented in canonical storage
+
required runtime objects resolvable from metadata/hashes
+
fresh Codespace clean-build proof
```

### Release Latest

最新正式發布的 production manifest/build；必須可追溯到 Verified Latest 的明確 commit/profile。

---

## 24. New Conversation / New AI Handoff Protocol

任何新的 ChatGPT / Claude / Gemini / Codex session，在修改專案前必須：

1. 讀 `PROJECT_STATE.md`。
2. 讀 `TODO.md`。
3. 讀 `ARCHITECTURE.zh-TW.md`；需要英文時再讀 mirror。
4. 讀 `IMPLEMENTATION.md`。
5. 若涉及 Player UI / Memories / CG / replay/frontier，讀 `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`。
6. 檢查目前 Git branch/commit/status，不假設 earlier chat 是最新狀態。
7. node-specific work 先執行 `npm run context -- --route <route-id> --node <node-id>`。
8. 判斷本次是否需要新 binary master；accepted master 必須進 canonical storage。
9. 開發/測試使用 Codespace；不要建立 Local-vs-Remote 第二套 workflow。
10. 保留可運作 prototype，漸進 migration。

可重建的專案來源是：

```text
GitHub
+
Google Drive canonical asset metadata/storage
```

處理一般 content 任務時，第一個真正有用的問題不應是：

> 「要用什麼 framework？」

而應該是：

> 「這次要改哪個角色、route、scene，或 pipeline capability？」

## 25. Architecture Change Policy

本文件是 canonical architecture。

只有以下條件成立時才改 architecture：

1. 新 requirement 是具體且真實的。
2. 現有 architecture 無法乾淨表達。
3. 已理解對 Content / Compiler / Player / Storage / Preview / Distribution 的影響。
4. 使用者明確接受變更。

批准後：

1. 先更新 `ARCHITECTURE.md` / `ARCHITECTURE.zh-TW.md`。
2. 再修改 code/tooling。
3. 再漸進 migration 既有 content。

不要讓 implementation drift 靜默地重新定義 architecture。

---


## 26. Quick Decision Rules

增加功能前先問：

```text
Is this Content?
Is this Compiler?
Is this Player?
Is this Asset Pipeline?
Is this Preview?
Is this Distribution?
```

如果答案不清楚，先不要寫 code。

日常開發：

```text
GitHub
→ Codespace
→ npm run dev
→ forwarded preview
→ verify
→ commit / push
```

新增角色：

```text
Character Bible
→ Story / Route
→ Generation Queue
→ Asset Generation
→ Canonical Asset Ingest
→ Codespace Integration
→ Playtest
→ Verified Commit
```

需要 AI/外部 reviewer 直接看 forwarded preview：

```text
4173 private by default
→ temporarily public only for review
→ restore private / stop after review
```

Stable build review：

```text
Verified commit
→ Sites review preview
```

正式 release：

```text
cloud-complete verified inputs only
```

---

## 27. Final Architecture Summary

專案最終應收斂為：

```text
Human Creative Direction
        +
AI Content / Engineering
        ↓
Character Bible
        ↓
Story / Route / Scene Specs
        ↓
Asset Recipes + Generation Queue
        ↓
Asset Generation
        ↓
Canonical Master Storage
        ↓
Content + Asset Validation
        ↓
Content Compiler
        ↓
Verified Manifest
        ↓
Web Player
        ↓
GitHub Codespace
        ↓
Forwarded Preview
        ↓
Verified Git Commit + Google Drive Assets
        ↓
Sites Review / Distribution Adapter
        ↓
Production
```

專案真正長期有價值的部分不是 renderer。

真正值得反覆優化的是這條可重用 pipeline：

```text
character idea
→ structured story
→ consistent assets
→ validated build
→ playable episode
```

並盡量降低每次新增角色、route、scene 時需要的人工作程成本。



增加功能前先問：

```text
Is this Content?
Is this Compiler?
Is this Player?
Is this Asset Pipeline?
Is this Preview?
Is this Distribution?
```

如果答案不清楚，先不要寫 code。

新增 route：

```text
prefer content-only changes
```

新增角色：

```text
Character Bible
→ Story / Route
→ Generation Queue
→ Human Asset Generation
→ AI Integration
→ Playtest
→ Checkpoint / Release
```

準備關 Mac：

```text
checkpoint first
```

Remote working：

```text
GitHub + Google Drive
→ Codespace
→ forwarded preview
```

Stable build review：

```text
Sites review preview
```

正式 release：

```text
cloud-complete inputs only
```

---

## 27. Final Architecture Summary

專案最終應收斂為：

```text
Human Creative Direction
        +
AI Content / Engineering
        ↓
Character Bible
        ↓
Story / Route / Scene Specs
        ↓
Asset Recipes + Generation Queue
        ↓
Human Third-Party Asset Generation
        ↓
Content + Asset Validation
        ↓
Content Compiler
        ↓
Verified Manifest
        ↓
React / TypeScript Web Player
        ↓
Local / Codespaces / Sites Preview
        ↓
Cloud Checkpoint
        ↓
GitHub + Google Drive
        ↓
Google Drive runtime-public（→ future R2）
        ↓
Distribution Adapter
        ↓
Production
```

專案真正長期有價值的部分不是 renderer。

真正值得反覆優化的是這條可重用 pipeline：

```text
character idea
→ structured story
→ consistent assets
→ validated build
→ playable episode
```

並盡量降低每次新增角色、route、scene 時需要的人工作程成本。