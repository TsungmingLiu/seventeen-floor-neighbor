# W4 Player UI / Memories / CG Gallery 規格

> 狀態：**已確認的產品／UX 方向，待實作**
>
> 更新：2026-09-23
>
> 本文件記錄 2026-09-23 對話中已確認的 W4 介面、存檔語意、回憶頁與 CG 收藏設計。它的目的不是保存 mockup，而是讓新的 ChatGPT / Codex / Claude / 人類協作者在沒有聊天紀錄的情況下，也能理解「為什麼這樣設計、資料怎麼表示、現有程式要改哪裡、什麼算完成」。
>
> 如本文件與當前程式碼不同，代表 W4 尚未完全落地；不要把現況誤認為目標行為。Canonical architecture 仍以根目錄 `ARCHITECTURE.zh-TW.md` 為準，本文件是 W4 的功能級詳細規格。

---

## 1. W4 目標

W4 要把目前偏 prototype / debug 的玩家介面，整理成真正適合多女主都市戀愛遊戲的產品介面。

核心目標：

1. **CG 是主畫面，UI 退到第二層。** 遊戲中的對話框與選項不能再像一個巨大的固定框遮住大量畫面。
2. **標題畫面只保留三個核心入口：繼續／開始、回憶、CG。**
3. **取消玩家心智模型中的「New Game / Save Slot」。** 重玩舊節點由「回憶」完成。
4. **回憶頁不是工程師的 node graph。** 它是玩家看得懂的一頁式回憶時間線。
5. **多女主分支不得造成無限橫向地圖。** 玩家主要行為永遠是向下滑。
6. **重玩舊回憶不能讓主進度倒退。** 必須分離「目前正在玩的 cursor」與「歷史最深的 frontier」。
7. **回憶頁本身要有情緒與角色辨識。** 單女主事件使用對應事件 CG 的淡化、臉部聚焦背景；共通事件使用場景 CG / background。
8. **CG Gallery 保持簡單。** 它是收藏牆，不承擔 story graph 的責任。

---

## 2. W4 不做什麼

本輪不要因為 UI 重構而引入不必要的 framework 或 backend。

非目標：

- 不新增 backend。
- 不新增 cloud save / OAuth。
- 不做自由拖曳、縮放的巨大 2D 劇情地圖。
- 不把完整 engine graph 直接展示給玩家。
- 不要求為每個回憶事件重新生成一張專用圖片。
- 不重寫故事引擎。
- 不把每一句 dialogue node 都變成一張回憶卡。
- 不把 CG Gallery 做成第二套回憶頁。
- 不因為 W4 而切換到 Unity / Godot / PixiJS。

W4 應該建立在既有 data-driven story / logical asset ID / localStorage / CG unlock 能力上。

---

# 3. 最終資訊架構

玩家看到的頂層資訊架構固定為：

```text
                      TITLE
                        │
            ┌───────────┼───────────┐
            │           │           │
         CONTINUE     MEMORIES      CG
            │           │           │
         frontier   one-page      gallery
                     timeline
                        │
                     replay
                        │
                 unlock new path
```

三個入口的心理模型：

- **Continue / Start = 現在**
- **Memories = 過去，以及從過去重新做選擇**
- **CG = 收藏**

不要再另外暴露「分支」、「New Game」、「Load Slot」等會和這三個概念競爭的頂層入口。

---

# 4. 標題／主介面

## 4.1 按鈕結構

主介面採用「一大兩小」。

```text
17樓的
新鄰居

有些相遇，
從一場小小的意外開始。

目前進度 · 許棠
星期日早晨

┌─────────────────────────┐
│        繼續遊戲          │
└─────────────────────────┘

┌────────────┐ ┌────────────┐
│    回憶    │ │     CG     │
│   31 / 74  │ │   9 / 28   │
└────────────┘ └────────────┘
```

規則：

- 沒有任何有效進度時，大按鈕顯示 **「開始遊戲」**。
- 已有有效進度時，大按鈕顯示 **「繼續遊戲」**。
- 「回憶」與「CG」是兩個同級的小按鈕。
- 聲音／設定不再占用第四個主按鈕位置；放到角落 icon / HUD。
- 不提供獨立「重新開始」按鈕。要從頭開始，就在回憶頁選故事起點重玩。

## 4.2 標題背景

有進度時，標題背景要反映玩家目前最深的故事進度，而不是固定 title art。

優先順序：

1. frontier 對應 Memory Event 顯式指定的 `titleBackdropAsset`；
2. frontier 是單女主事件時，使用該事件 `cover.asset`；
3. 沿目前 frontier 所在故事路徑向前尋找最近一張已解鎖、標記為 heart/highlight 的 CG；
4. frontier 自身的 scene cover / visual；
5. chapter / route 的預設 title art。

如果 frontier 是 cinematic，標題背景使用 poster，不 autoplay 影片。

**不要只根據 speaker 名稱猜背景。** 背景選擇應由 memory/content metadata 驅動。

---

# 5. 遊戲內 UI

## 5.1 設計原則

遊戲畫面的視覺主角是 CG / scene，而不是 dialogue panel。

目前 prototype 的大面積 bottom glass card 要縮小、拆分。

Desktop 建議：

- dialogue panel 放左下；
- 約佔畫面寬度 40–50%；
- speaker 為獨立的小 badge / tab；
- choices 與 dialogue 分離，可放右下或 dialogue 上方；
- HUD 只保留必要進度、回標題／回憶、聲音等輕量控制；
- 大部分 CG 應保持可見。

概念：

```text
┌─────────────────────────────────────────────┐
│  progress                             ♪  ⋯  │
│                                             │
│                    CG                       │
│                                             │
│                                             │
│ ┌ 許棠 ┐                  ┌ A ........... ┐ │
│ ┌────────────────┐        ├ B ........... ┤ │
│ │ 你知道嗎？     │        └ C ........... ┘ │
│ │ 正常人這時候… │                          │
│ └────────────────┘                          │
└─────────────────────────────────────────────┘
```

Mobile：

- dialogue 回到畫面下方全寬；
- speaker badge 仍獨立；
- choices 在 dialogue 上方或其後堆疊；
- 不要求保持 desktop 的左右分欄；
- 所有按鈕 touch target 約 44px 以上；
- 不得產生 page-level horizontal scroll；
- 遮罩應集中在文字附近，不要把整張 CG 全域壓暗。

## 5.2 Safe-zone 原則

W4 不能只靠 CSS 補救壞構圖。現有 asset recipe 的 focal point / object position / safe zone 概念仍然有效。

對話框、choices、HUD 不應遮擋：

- 臉；
- 手部關鍵動作；
- 劇情物件；
- 角色互動焦點。

---

# 6. 回憶頁：核心產品決策

## 6.1 取消二級 Route Detail

**不建立「Memories Overview → Route Detail → Node Graph」三級資訊架構。**

原因：

- 玩家要理解多一個介面層級；
- route detail 仍然容易變成工程 graph；
- 多女主時，玩家需要在 overview 與 route detail 之間反覆跳轉；
- 回憶的情緒連續性被切斷。

W4 採用：

> **單頁回憶時間線（One-page Memories Timeline）**

玩家進入「回憶」後，主要操作永遠是 **往下滑**。

## 6.2 玩家看到的是 Memory Event，不是 Story Node

Engine 可能需要 8 個 node 完成一個 scene：

```text
dialogue
→ choice
→ response
→ branch
→ narration
→ state update
→ dialogue
→ next
```

玩家不應看到 8 張卡。

在回憶頁可能只有：

```text
♥ 屋頂夜色
警報之後，你們第一次真正單獨留了下來。
```

因此：

> **Story Node 是 runtime / authoring primitive。Memory Event 是 player-facing narrative primitive。**

兩者不能被視為一對一關係。

---

# 7. 回憶頁視覺語法

## 7.1 共通主線事件

共通事件直接存在縱向主時間線：

```text
● 搬進 17 樓
│
● 雨夜的初遇
│
● 第一次真正聊起彼此
│
...
```

共通事件的背景使用：

- 場景 CG；
- background art；
- 事件環境圖。

例如：

- 17 樓走廊；
- 電梯；
- 咖啡店；
- 城市停電；
- 便利商店；
- 夜市。

共通事件不應因為某句 dialogue 是某位女主說的，就自動變成角色大頭背景。

## 7.2 單女主事件

單女主 Memory Event 使用該事件的 CG 作為淡化背景。

視覺規則：

- `object-fit: cover`；
- focus 到角色臉部／上半身，而不是平均置中；
- saturation / contrast 適度降低；
- brightness 降低；
- 加深色 gradient overlay；
- 文字保持高對比；
- 可以保留角色代表 accent，但不能讓整個頁面變成高飽和拼貼。

概念：

```text
┌────────────────────────────────┐
│ [淡化、臉部 focus 的事件 CG]    │
│                                │
│  許棠                          │
│  ♥ 屋頂夜色                    │
│  關係明顯靠近 · CG 已解鎖      │
│                                │
└────────────────────────────────┘
```

這不是另產一張圖片；初版直接重用既有 runtime asset。

## 7.3 分岔

小型分岔可以直接嵌在單頁 timeline 裡。

例如：

```text
        星期六咖啡
             │
      這次可以去哪裡？
     ┌──────┼──────┐
     │      │      │
   書店    河畔    ???
     │      │
     └──┬───┘
        │
     洗衣房
```

但這是 **視覺壓縮後的 player memory**，不是要求一比一畫出所有 engine edge。

規則：

- Desktop 可用 2–3 column 小卡。
- Mobile 改成單欄 stack。
- 不允許整頁橫向 scroll。
- 分支太多時，壓縮成一個 cluster，例如「約會回憶 3 / 6」，而不是畫 6–10 條 lane。

## 7.4 匯合

故事分支重新回到共通節點時，可以用很輕的「支線重新匯合」視覺提示，但不要展示 engineering edge IDs。

## 7.5 未探索內容

未探索內容只顯示足夠形成期待的 placeholder：

```text
◇ ???
尚未發生的回憶
```

禁止提前展示：

- 後面到底還有幾條 branch；
- branch 名稱；
- branch 最後會在哪裡匯合；
- hidden ending 數量；
- 未解鎖角色事件名稱。

目標是避免劇透，也避免未探索 subtree 把頁面拉得非常長。

---

# 8. 回憶頁導覽

即使只有一頁，仍需避免玩家在長頁面裡迷失。

## 8.1 Filter

頁面上方可提供同頁 filter：

- 全部
- 許棠
- 江雨澄
- 其他已解鎖女主
- 心動 CG
- 未探索（如需要）

Filter 只改變目前頁面顯示，不導向次級 route page。

未解鎖女主不應因 filter 名稱提前劇透；角色 filter 只有角色已正式解鎖後才出現。

## 8.2 回到目前進度

回憶頁提供明確的：

> **回到目前進度**

功能。

它 scroll 到 frontier Memory Event，而不是改變遊戲存檔。

## 8.3 Current / Frontier 標示

frontier event 必須有清楚但不刺眼的狀態，例如：

```text
目前最深已解鎖回憶
CONTINUE
```

玩家不需要自己推理「哪個節點才是繼續點」。

---

# 9. Replay：回憶就是 New Game / Chapter Select

已解鎖 Memory Event 可以重玩。

Replay 行為：

1. 使用該 event 的 `replayNode` / checkpoint snapshot 進入遊戲；
2. 恢復當時需要的 stats / flags / return stack；
3. 不清除 CG unlock；
4. 不清除 ending unlock；
5. 不清除已探索 memories；
6. 不讓 global frontier 倒退；
7. 玩家可以從舊節點走不同選擇；
8. 若新路徑真的抵達比舊 frontier 更深的 event，才推進 frontier。

故事起點本身也是一個 Memory Event。

因此「重新開局」就是：

> 回憶 → 故事起點 → 從這裡重玩

不需要另外維護 New Game UI。

---

# 10. Progress Store：Cursor 與 Frontier 必須分離

這是 W4 最重要的底層語意改變。

目前 prototype 的 `progress.data.current` 同時承擔「我現在在哪裡」與「我最遠玩到哪裡」的角色。加入 replay 後這兩個概念會衝突。

例如：

```text
玩家曾玩到 Chapter 8
        ↓
回憶頁重玩 Chapter 2
        ↓
玩家回到標題
```

錯誤行為：

```text
繼續遊戲 → Chapter 2
```

正確行為：

```text
繼續遊戲 → 原本 Chapter 8 frontier
```

## 10.1 新語意

### cursor

玩家**這一刻正在玩的 snapshot**。

概念：

```text
cursorSnapshot
```

Replay 會自由改變 cursor。

### frontier

玩家歷史上已解鎖的「最靠近 route 結局」的正式主進度 snapshot。

概念：

```text
frontierSnapshot
frontierMemoryEventId
frontierRank
```

Replay 舊內容不能讓 frontier 下降。

## 10.2 Frontier 的比較不能靠「最近玩的時間」

「最後點過的 node」不等於「最深進度」。

因此 Memory Event 應提供內容定義的 monotonic progression metadata：

```json
{
  "progressRank": 420
}
```

原則：

- rank 越高，代表越接近該可玩故事的後段；
- rank 是 player-facing narrative progression，不是 DOM index；
- 不要求每個 engine node 都有 rank；
- rank 放在 Memory Event 層即可；
- 多女主 route 的 rank 由內容作者按敘事階段協調，讓「最靠近結局」有明確定義；
- optional side event 可以共享／落在同一 progression band，不必因 node 數量多就被誤判更深。

## 10.3 Replay Mode

從舊 Memory Event replay 時：

- cursor 立即移到 replay snapshot；
- frontier 保持原值；
- 在 replay 尚未超過 frontierRank 前，不覆蓋 frontier；
- 一旦進入 `progressRank > frontierRank` 的新 Memory Event，更新 frontier；
- 如果新 branch 只是解鎖同深度的另一個事件，保留原 frontier，但新增 memory / edge / CG unlock。

## 10.4 Save Migration

現有玩家資料不得因 W4 被清空。

新 schema 必須：

- 能從目前 journey v1 checkpoint / current / edges 遷移；
- 將舊 `current` 作為初始 cursor；
- 在可合理判斷時，把舊 `current` 對應 Memory Event 當作初始 frontier；
- 若無法對應，使用安全 fallback（例如最深已解鎖 memory event）；
- 保留現有 CG unlock / endings；
- migration 必須有 automated tests。

---

# 11. Memory Event Content Model

W4 建議新增明確的 Memory Event source data，不要從 Story Node DOM/文案臨時推導玩家 UI。

具體檔名可在實作時依 current compiler layout 決定；邏輯上至少需要以下結構。

## 11.1 Memory Section

用來描述一段視覺上的故事區塊。

範例：

```json
{
  "id": "xu-after-rain",
  "kind": "heroine",
  "characterId": "xu_tang",
  "title": "許棠 · 雨夜之後",
  "order": 40
}
```

共通主線可以使用 `kind: "common"`，或直接讓 event 不屬於 heroine section。

## 11.2 Memory Event

建議欄位：

```json
{
  "id": "mem.xu.rooftop",
  "sectionId": "xu-after-rain",
  "order": 70,
  "progressRank": 420,

  "title": "屋頂夜色",
  "summary": "警報之後，你們第一次真正單獨留了下來。",

  "characterIds": ["xu_tang"],

  "replayNode": "rooftop_intro",
  "unlockNodes": ["rooftop_intro", "rooftop_line"],

  "kind": "scene",
  "highlight": true,

  "cover": {
    "asset": "cg.ch02.rooftop_night",
    "mode": "character",
    "focus": { "x": 68, "y": 24 },
    "mobileFocus": { "x": 63, "y": 22 },
    "overlay": "dark-soft"
  },

  "galleryAssets": ["cg.ch02.rooftop_night"]
}
```

這是方向性的 schema；實作前可以依既有 compiler/validator 命名微調，但下列語意不可丟失：

- stable memory ID；
- display order；
- progression rank；
- replay anchor；
- unlock mapping；
- character/common identity；
- cover asset + focus；
- highlight/heart moment；
- gallery association。

## 11.3 Cover Mode

### `character`

用於單女主事件。

要求：

- asset 通常是事件 CG / cinematic poster；
- focus 應明確指向臉／上半身；
- UI 套淡化與 dark overlay。

### `scene`

用於共通／環境事件。

要求：

- asset 使用 background / scene CG；
- focus 以場景構圖為主；
- 不強制拉到某個角色臉。

## 11.4 不要根據 speaker 自動判斷

錯誤：

```text
speaker === "許棠"
→ 自動把所有事件都變成許棠 character cover
```

正確：

```text
Memory Event content metadata
→ 明確決定 character / scene
```

理由：共通事件裡仍然會有女主說話；speaker 不是 narrative ownership。

---

# 12. 回憶背景圖片的工程策略

這個 feature 的視覺收益很高，但不應造成新的大型 asset pipeline。

## 12.1 初版不產生專用 crop

初版直接重用現有 logical asset ID。

Browser 端：

- 絕對定位一個 `<img>` 當背景層；
- `object-fit: cover`；
- `object-position` 使用 `cover.focus`；
- filter 降 saturation / brightness；
- 疊 gradient overlay；
- 文字層在上方。

不需要 Canvas，不需要 runtime image processing。

## 12.2 為什麼不要只用 CSS `background-image`

Memories 未來可能有 60–100 個 event。

為了 lazy loading，優先使用：

```html
<img loading="lazy" decoding="async">
```

作為卡片背景層，而不是讓所有 CSS background image 一進頁面就有機會載入。

## 12.3 Asset fallback

若指定 cover 不存在：

1. cinematic → poster；
2. event 的其他合法 CG；
3. event scene background；
4. neutral memory card，不要 crash。

Validator 應盡量在 build 時抓出缺失，不依賴 runtime fallback 掩蓋內容錯誤。

## 12.4 Future optimization

只有實測效能需要時才加入：

- `coverAsset` 專用低解析 WebP；
- responsive `srcset`；
- build-time crop；
- AVIF。

不要在 W4 第一版預先增加這些複雜度。

---

# 13. CG Gallery

CG 頁維持簡單。

## 13.1 Grid

同一個 grid 顯示：

- 已解鎖 CG；
- cinematic poster；
- 未解鎖 placeholder。

影片縮圖標示 `▶ VIDEO` 或等價視覺。

概念：

```text
CG COLLECTION                              12 / 31

[ CG ]   [ CG ]   [ ??? ]
雨夜     咖啡      未解鎖

[ CG ]   [ ▶ ]    [ ??? ]
屋頂     初吻      未解鎖
```

## 13.2 Viewer

點擊已解鎖內容後使用 full viewer：

- 圖片 contain 顯示；
- cinematic 可播放；
- 左右 arrow / swipe；
- Escape / close；
- 顯示 title / chapter / position。

## 13.3 Gallery 不承擔 Story Navigation

不要把以下功能塞進 Gallery：

- branch graph；
- replay tree；
- route progress map；
- story node list。

這些只屬於 Memories。

角色 filter 等到 Gallery 規模真的需要時再加即可。

---

# 14. 現有程式與 W4 的對應

截至本規格建立時，prototype 已有可重用能力：

- `ProgressStore`：node-entry snapshot、checkpoint、explored edges；
- `src/branches.js`：graph traversal / branch rendering；
- `GameEngine.refreshTitle()`：title preview；
- CG unlock storage；
- Gallery viewer；
- logical asset manifest；
- focus metadata；
- cinematic poster fallback。

W4 不需要把這些全部丟掉。

## 14.1 `src/progress.js`

主要修改：

- journey schema version 升級；
- `current` 拆成 cursor/frontier 語意；
- migration；
- frontier rank/event metadata；
- replay 不倒退 frontier；
- tests。

## 14.2 `src/branches.js`

目前 branch list 是 player-facing debug graph。

W4 後：

- **不要再直接作為玩家「回憶」頁。**
- 可保留其中的 generic graph traversal helper 給 validation / dev debug；
- player rendering 建議移到新的 `memories.js` 或未來 component；
- 不要因為保留 helper 就繼續把 engine node graph 暴露給玩家。

## 14.3 `src/engine.js`

主要修改：

- title Start/Continue semantics；
- title backdrop resolver；
- open Memories；
- replay Memory Event；
- cursor/frontier 協調；
- CG gallery 既有功能大致保留。

## 14.4 HTML / CSS source

依目前 source/output boundary 修改 canonical static source，不要手改 generated `dist/`。

主要工作：

- 一大兩小 title actions；
- 精簡 game HUD；
- dialogue / choices overlay；
- one-page Memories timeline；
- memory card background layer；
- gallery polish；
- mobile 320px layout。

---

# 15. 建議實作順序

不要同時改所有 UI 和 save semantics。

## Phase 1 — Memory Content Contract

1. 定義 Memory Section / Event source data。
2. 加入 schema / validator。
3. 將現有許棠 route 的主要故事 scene 映射成 Memory Events。
4. 明確標記 replayNode、unlockNodes、progressRank、cover。
5. 先不改玩家 UI。

驗收：build 能產出穩定的 runtime memories data。

## Phase 2 — Progress v2

1. `cursorSnapshot`；
2. `frontierSnapshot`；
3. `frontierMemoryEventId` / rank；
4. replay mode；
5. journey v1 migration；
6. unit tests。

驗收：重玩舊事件後回標題，Continue 仍回原 frontier。

## Phase 3 — One-page Memories

1. 移除玩家-facing Branches page；
2. 建立單頁 timeline；
3. common scene / heroine section；
4. inline fork；
5. locked spoiler behavior；
6. current frontier indicator；
7. same-page filters；
8. 回到目前進度。

驗收：320px 寬度也只有垂直 scroll。

## Phase 4 — Memory Backdrops

1. single heroine → character CG cover；
2. common → scene cover；
3. focus / mobileFocus；
4. dark/fade overlay；
5. lazy image loading；
6. cinematic poster fallback。

驗收：文字可讀、角色臉不被錯誤裁切、長頁不一次載入全部大圖。

## Phase 5 — Title + In-game UI

1. title 一大兩小；
2. frontier heart CG backdrop；
3. dialogue panel 收窄；
4. choices 分離；
5. HUD 精簡；
6. desktop/mobile responsive。

## Phase 6 — Gallery Polish

保留現有能力，整理 grid / locked / video marker / viewer。

---

# 16. 驗收情境

W4 必須至少測以下情境。

## 16.1 無存檔

- Title 顯示「開始遊戲」。
- Memories 可顯示故事起點與合理的 locked state。
- CG 顯示 0 / N 或 migration 後正確數量。

## 16.2 正常推進

玩家一路玩到許棠「星期日早晨」。

預期：

- cursor = 星期日早晨附近 snapshot；
- frontier = 星期日早晨；
- title = 繼續遊戲；
- title backdrop = 對應 heart/highlight CG；
- Memories 將該 event 標為目前最深進度。

## 16.3 重玩早期回憶

玩家從「星期六咖啡」重玩，玩幾個 node 後回標題。

預期：

- cursor 在咖啡線；
- frontier 仍是星期日早晨；
- Continue 仍回星期日早晨；
- title backdrop 不倒退成咖啡；
- 已解鎖 CG / endings 不消失。

## 16.4 Replay 解鎖新 branch，但沒有更深

玩家重玩早期 date，首次解鎖「河畔」。

預期：

- 河畔 Memory Event 解鎖；
- 新 CG 解鎖；
- Memories 更新；
- frontier 若 rank 未超過原本最深進度，不改變。

## 16.5 Replay 真正超越 frontier

玩家走出以前沒有到達的後期 branch。

預期：

- 進入 `progressRank > old frontierRank` event 時 frontier 更新；
- Continue / title background 隨新 frontier 更新。

## 16.6 單女主 Event

- 使用該事件 CG；
- focus 到角色臉／上半身；
- 背景淡化；
- text contrast 達標；
- mobile crop 不切掉臉。

## 16.7 共通 Event

- 使用場景 CG / background；
- 不因 speaker 自動拉角色臉；
- 仍能清楚辨識事件地點。

## 16.8 Cinematic Event

- Memories 用 poster；
- Gallery 用 poster + video marker；
- title 也只用 poster，不 autoplay。

## 16.9 320px Mobile

- 無 page-level horizontal scroll；
- fork cards 改成 stack；
- filters 可局部橫向 scroll，但不造成整頁 overflow；
- text 不溢出；
- controls 可 tap。

---

# 17. Automated Tests / Validation

最低新增測試：

1. journey v1 → v2 migration；
2. invalid/corrupt frontier fallback；
3. replay old memory does not regress frontier；
4. higher-rank replay advances frontier；
5. equal/lower-rank unlock updates memories but not frontier；
6. missing replayNode validation；
7. missing cover logical asset validation；
8. character cover requires valid focus；
9. common cover accepts scene/background；
10. locked memory does not leak hidden labels；
11. title backdrop resolver fallback order；
12. cinematic uses poster；
13. root replay does not wipe gallery/endings。

如果 current compiler 有 reachability/context tooling，Memory Event 的 replayNode / unlockNodes 也必須加入引用驗證。

---

# 18. UX 原則：為什麼不是完整劇情樹

這是有意識的產品決策，不是因為做不出 graph。

完整 DAG 對 developer 有價值，但對玩家會帶來：

- 大量左右拖動；
- 支線越多越難找目前位置；
- 多女主 lane 爆炸；
- 未解鎖 structure 造成劇透；
- 玩家開始閱讀「graph topology」，而不是回憶故事。

因此 W4 的 player-facing Memories 採：

> **Narrative compression + progressive disclosure without secondary pages**

也就是：

- 重要 scene 才成為 Memory Event；
- branch 少時 inline 顯示；
- branch 多時 cluster；
- hidden subtree 不展開；
- 整體保持單頁縱向。

Developer 若仍需要完整 graph，可以保留 debug/validation tool，但不要與玩家 UI 混用。

---

# 19. 視覺風格原則

W4 的回憶頁不是普通 settings/list page。

希望達成的感覺：

> **一本會隨遊戲推進逐漸長出內容的視覺回憶錄。**

因此：

- 單女主 scene 的淡化臉部 CG 是核心視覺語言；
- 共通 scene 的場景圖提供地點記憶；
- heart moment 可以比一般事件稍強；
- locked event 保持安靜與模糊；
- 不要每張小 fork card 都塞大圖，避免畫面噪音；
- 內容層級比裝飾更重要。

---

# 20. 協作者交接摘要

新的 AI / developer 在實作 W4 前，應依序：

1. 讀 `ARCHITECTURE.zh-TW.md`。
2. 讀 `IMPLEMENTATION.md` 與 `PROJECT_STATE.md`。
3. 讀本文件。
4. 檢查 current main，不要假設本 spec 已實作。
5. 保留既有 logical asset IDs、CG unlock、ending unlock 與 valid checkpoints。
6. 先做 Memory Event data contract，再改 save，再做 UI。
7. 不要直接把 `src/branches.js` 的完整 node graph 美化後當作 Memories。
8. 不要讓 replay 改寫／倒退 frontier。
9. Memory cover 必須 content-driven，不以 speaker heuristic 代替。
10. 完成後執行 build、validate、tests、diff check 與 320px browser acceptance。

---

# 21. 一句話產品定義

W4 完成後，玩家應該感受到：

> **主畫面讓我回到「現在」，回憶頁讓我沿著自己和每個角色走過的故事往下看並重新選擇，CG 頁則保存我真正得到的畫面。**

這三者各自清楚，不互相搶功能。
