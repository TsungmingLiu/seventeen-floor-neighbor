# 《17 樓的新鄰居》

一款純前端、可靜態部署的都市戀愛視覺小說。玩家搬進 1703 的第一晚，因為一連串小事故認識住在 1702 的許棠；故事透過對話選項累積關係數值，進入不同結局。遊戲包含模組化角色設定、CG／立繪／動態回憶資產、可重生的生成配方、分支劇情、結局判定與回憶收藏功能。

> **新對話／新協作者的第一條規則：** GitHub `main` 是專案備份與交接的基準。修改前先讀本 README、拉取最新 `main`，修改後執行 `npm run build` 與 `npm run validate`，並將來源資料、建置產物及新增圖片一起提交。

## 目前版本快照

| 項目 | 目前狀態 |
| --- | --- |
| 可玩故事 | 一個共用入口，許棠完整分支＋辦公族 OL 暫用短分支 |
| 角色 | 許棠，以及待完善人設的成年辦公族 OL；林澄設定已封存 |
| 劇情節點 | 原有許棠節點保留，新增 OL 分支；即時數量見 `npm run validate` |
| 章節進度標籤 | 12：雨夜、初遇、停電、靠近、隔壁、咖啡、約會、天台、1702、真心、確認、清晨 |
| 結局 | 許棠原四結局＋OL 暫用結局 |
| 視覺資產 | 沿用既有 CG／背景／立繪，OL 暫借既有黑絲辦公造型；全量重製尚未開始 |
| 視覺生成配方 | manifest 與 recipe 一對一，封存內容不進入可玩收藏 |
| 約會池 | 3 個可複用場景，每輪隨機抽 2 個且不重複 |
| 運行方式 | 瀏覽器原生 JavaScript，無後端、無資料庫 |
| 玩家資料 | 節點快照、已走連線、CG、結局、靜音設定存於瀏覽器 `localStorage` |
| 靜態輸出 | `dist/` |

## 快速開始

需要 Node.js；目前沒有第三方套件依賴。

```bash
npm run validate
npm run build
```

本機預覽可用任意靜態伺服器指向 `dist/`，例如：

```bash
python3 -m http.server 8000 --directory dist
```

然後開啟 `http://localhost:8000`。

### 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run validate` | 驗證角色版本、資產引用、生成配方、劇情連線、CG 規則與實體圖片 |
| `npm run build` | 驗證後，將內容 JSON 與運行程式複製到 `dist/` |
| `npm run assets:plan -- xu_tang` | 列出許棠人設變動會影響的所有立繪／CG，並標記版本是否過期 |
| `npm run context -- --route xu-tang --node contact` | 輸出指定節點的前後關係、素材、配方、角色與路線脈絡 |

## 架構總覽

專案採取「角色設定 → 生成配方 → 邏輯資產 → 劇情引用 → 通用引擎」的資料驅動設計。替換角色、新增服裝或加入角色時，原則上不需要改引擎。

| 層 | 位置 | 職責 |
| --- | --- | --- |
| 角色設定 | `content/characters/*.json` | 身分不變項、造型版本、髮型、服裝、妝容、表情與參考圖 |
| 資產清單 | `content/assets/manifest.json` | 將穩定的邏輯素材 ID 對應到實際圖片及角色版本依賴 |
| 生成配方 | `content/recipes/assets.json` | 記錄每張背景、立繪、CG 與動態回憶的提示詞、構圖、運鏡與角色依賴 |
| 路線登錄 | `content/routes/index.json` | 宣告所有可玩路線與預設路線 |
| 路線模組 | `content/routes/<route-id>/` | 路線介面文字、故事檔、場景檔、素材白名單與交接 context |
| 場景模板 | `content/scenes/*.json`、各路線 `scenes.json` | 與角色分離的場景、互動節點與隨機池 |
| 劇情資料 | 路線設定中的 `storyFiles` | 節點、台詞、選項、數值、分支、結局與畫面模式；建置時合併 |
| 遊戲引擎 | `src/` | 通用播放、打字效果、分支、結局、立繪渲染、影片播放、回憶收藏及音效 |
| 靜態介面 | `dist/index.html`、`dist/styles.css` | 標題、遊戲、結局、收藏與檢視器 UI |
| 發布輸出 | `dist/` | 可直接交給靜態託管服務的完整網站 |
| 驗證與工具 | `tools/` | 建置、內容驗證與人設影響分析 |

### 路線包

標題畫面只載入 `dist/content/routes/index.json` 的預設故事；角色分線由劇情中的選擇決定，網址不再切換平行路線。每個來源 route config 宣告：

- 標題畫面文字、色彩與無障礙替代文字。
- `storyFiles`：一或多個節點檔；建置時合併，節點 ID 不可重複。
- `sceneFiles`：一或多個場景池檔；建置時合併，場景池 ID 不可重複。
- `assetIds`：此路線可使用的素材白名單，也決定收藏頁內容。
- `context`：新對話或局部修改前應讀取的角色弧線與連續性規則。

新增角色分支時，把獨立故事檔接入預設包的 `storyFiles`，再由既有節點接出選項；不應修改 `src/` 或 `tools/`。預設故事保留 `chapter-01` 作為存檔、結局及收藏命名空間。

### 來源檔與建置產物

以下檔案是內容來源，應優先修改：

- `content/assets/manifest.json`
- `content/routes/index.json`
- `content/routes/*/route.json`
- 各路線 `storyFiles`、`sceneFiles` 與 `context.md`
- `content/chapters/chapter-01.json`
- `content/characters/*.json`
- `content/scenes/*.json`
- `content/references/*.png`
- `content/cinematics/`（動態回憶的可重建關鍵幀）
- `content/recipes/assets.json`
- `src/app.js`
- `src/engine.js`
- `src/progress.js`、`src/visuals.js`、`src/branches.js`

`npm run build` 會驗證全部路線，然後為每條路線建立獨立運行包：

| 來源 | 輸出 |
| --- | --- |
| `content/routes/index.json` 與路線介面設定 | `dist/content/routes/index.json` |
| 路線的 `assetIds` | `dist/content/routes/<route-id>/assets.json` |
| 路線的 `storyFiles` | `dist/content/routes/<route-id>/chapter.json` |
| 路線的 `sceneFiles` | `dist/content/routes/<route-id>/scenes.json` |
| `src/app.js` | `dist/app.js` |
| `src/engine.js` | `dist/engine.js` |

所有 `src/*.js` 都會編譯至 `dist/`；建置會在模組匯入、HTML 的程式入口與樣式網址加上內容雜湊，避免部署後混用舊快取。請勿手動修改 `dist/*.js`。

`dist/index.html`、`dist/styles.css` 與 `dist/assets/` 不由建置腳本生成；修改 UI 或加入圖片時需直接維護並提交。不要只改 `dist/content/*.json`，因為下一次建置會用 `content/` 覆蓋它們。

## 角色模組

目前可玩角色為許棠與暫用辦公族 OL。OL 的人設及正式 CG 待後續設計；舊林澄檔案只供封存參考。

### 許棠的核心設定

- 22 歲東亞女性，約 170 公分。
- 橢圓臉、柔和下頜線、偏狹長杏眼、深棕瞳孔、纖細鼻樑、淡玫瑰色嘴唇。
- 深棕長髮；髮量、長度及臉側自然碎髮固定，場景可切換髮型模組。
- 小型銀色耳釘與極細銀色素圈戒指；不使用醒目項鍊。
- 修長清瘦但比例自然，不幼態化、不動漫化、不過度磨皮，也不誇張強調身材。
- 性格清冷、安靜而鬆弛；擅長替別人化解尷尬，但通常會順手補一刀。關心別人時習慣說成「順便」或「住戶義務」。
- 主要身份參考圖記錄在角色 JSON 的 `references`，Library ID 為 `libfile_c00164e0e34c8191b2ad04a9b51941fd`，檔名 `IMG_9458.jpeg`。
- 四角度臉部錨點存於 `content/references/xu-tang-identity-v2.png`。所有新CG必須同時引用原始人設圖與此錨點；錨點只鎖定臉，不能覆蓋服裝、髮型與場景設定。
- 禁止把上一張CG當成下一張CG的唯一身份來源，以免多代生成造成五官逐步漂移。

### 髮型模組

| ID | 用途 |
| --- | --- |
| `low_bun` | 初遇／辦公造型，低位鬆散髮髻 |
| `half_up_waves` | 週末咖啡，半束自然波浪 |
| `high_pony_claw` | 洗衣房，抓夾偏高馬尾 |
| `polished_chignon` | 畫廊／正式晚間，俐落低髮髻 |
| `loose_waves` | 私人晚間場景，完全放下的長波浪 |
| `tousled_low_pony` | 星期日清晨，鬆散低馬尾 |
| `loose_side_braid` | 書店約會，鬆散低側辮 |
| `wind_low_pony` | 雨後河畔，帶風感的低馬尾 |
| `ribbon_high_pony` | 夜市約會，黑色緞帶高馬尾 |

### 服裝模組

| ID | 用途與重要不變項 |
| --- | --- |
| `office` v2 | 霧霾藍毛絨針織衫、米白修身吊帶、象牙白高腰闊腿長褲 |
| `coffee_weekend` v1 | 象牙白垂墜襯衫、灰藍高腰中長裙、窄版灰褐皮帶 |
| `home_laundry` v1 | 炭灰連帽外套、白色羅紋圓領背心、霧藍居家長褲 |
| `evening_rooftop` v1 | 深海軍藍緞面中長裙，黑色剪裁西裝外套披肩穿；搭配正式飲品 |
| `evening_private` v1 | 同一件深海軍藍細肩帶／方領緞面中長晚裝，室內脫下外套；前後 CG 必須保持一致 |
| `sunday_morning` v1 | 白色亞麻襯衫、深海軍藍圓領背心與居家短褲 |
| `bookstore_soft` v1 | 霧藍細針織上衣、象牙白高腰闊腿長褲 |
| `rain_walk` v1 | 石灰色及膝風衣、海軍藍針織中長裙與短靴 |
| `night_market` v1 | 靛藍短版牛仔外套、奶油白上衣與炭灰闊腿褲 |

妝容與表情也使用獨立模組。任何模組變更都應提高該模組的 `version`；臉、身形或整體人設變更則提高角色 `designVersion`。

## 邏輯資產與圖片規則

劇情只引用穩定的邏輯 ID，不直接引用檔名。例如：

```json
{
  "visual": {
    "mode": "cg",
    "asset": "cg.ch04.bedroom_challenge",
    "effects": { "push": true }
  }
}
```

`content/assets/manifest.json` 再把 `cg.ch04.bedroom_challenge` 對應到實際檔案 `dist/assets/cg-ch04-take-my-hand.jpg`。因此圖片可換版而不必大改劇情。

### 畫面模式是互斥的

每個一般劇情節點必須且只能採用一種模式：

- `composite`：一張背景，可加零至多張透明立繪。
- `cg`：一張完整 CG；引擎會自動清空立繪層。
- `cinematic`：播放一段 MP4／WebM 動態回憶；播放時隱藏對話框，結束後才恢復文字與選項。

CG 與 cinematic 節點不可同時宣告 `background` 或 `sprites`；`composite` 節點不可宣告 `asset`。這條規則避免完整畫面又疊立繪的舊問題，驗證器會直接拒絕違規內容。

### Manifest 欄位

- `kind`：`background`、`sprite`、`cg` 或 `cinematic`。
- `src`：相對於 `dist/` 的圖片路徑。
- `poster`、`sources`、`duration`：cinematic 的封面、WebM／MP4 來源與秒數。
- `width`、`height`：實際像素尺寸。
- `focus`：圖片在響應式裁切時的焦點百分比。
- `participants`：CG 中角色的人設、服裝、髮型、妝容及版本依賴。
- `gallery`：回憶收藏的標題、章節和唯一排序值。

每個 manifest 資產都必須存在於 `dist/`，且在 `content/recipes/assets.json` 中恰好有一份生成配方。

## 圖像生成配方

每份 recipe 包含：

- `id`：配方 ID。
- `outputAsset`：要生成的邏輯資產 ID。
- `type`：需與 manifest 的 `kind` 相同。
- `dependencies`：角色設計、服裝、髮型和妝容版本。
- `prompt`：場景、動作、鏡頭、光線與限制。
- `prompt.headPose`：每張CG必填，明確指定頭部俯仰、左右轉向、視線落點與頸部姿態。
- cinematic 配方使用 `prompt.keyframes`、`motionPlan` 與 `audio` 保存關鍵幀、剪輯和聲音設計。

角色資產必須宣告依賴；只有純背景可以沒有角色依賴。改人設後，可先執行：

```bash
npm run assets:plan -- xu_tang
```

輸出會列出所有受影響的立繪、CG 與動態回憶。重新生成後，必須同步更新實體圖片／影片、manifest 和 recipe 中的版本依賴。

### 身份一致性流程

1. 原始人設圖是最高優先級身份來源，四角度錨點補足正面、左右三分之四與側面資訊。
2. 先生成場景、服裝、姿勢與光線，再做一次只修臉部身份的校正；不要在同一步同時重設所有元素。
3. 身份校正時，場景CG只負責構圖與服裝，錨點只負責臉型、眼距、鼻尖、唇形、下巴和頭骨比例。
4. 每批CG以接觸表並排檢查；明顯漂移或反覆使用同一仰頭角度的圖片不得進入遊戲。

## 劇情資料模型

章節檔頂層包含：

- `startNode`：起始節點。
- `titleArt`、`endingArt`：舊版相容素材及預設結局圖；主界面實際使用續玩節點的 `visual`。
- `chapterLabels`：進度軌標籤。
- `initialState`：數值初始狀態。
- `endingRules`、`endings`：結局判定與結局內容。
- `nodes`：完整節點圖。

### 一般節點

```json
{
  "speaker": "許棠",
  "text": "台詞",
  "chapter": 10,
  "tone": "soft",
  "moment": "可選的短暫提示",
  "visual": { "mode": "cg", "asset": "cg.ch04.bedroom_challenge" },
  "next": "next_node"
}
```

`tone` 會觸發對應的輕量 Web Audio 提示音；`visual.effects` 目前支援 `push`、`dark` 和 `flicker`。

### 選項節點

```json
{
  "speaker": "你",
  "text": "",
  "chapter": 10,
  "visual": { "mode": "cg", "asset": "cg.ch04.bedroom_challenge" },
  "choices": [
    {
      "text": "選項文字",
      "next": "result_node",
      "effects": { "heart": 2, "trust": 1 },
      "addFlags": ["optional_flag"]
    }
  ]
}
```

### 分支與結束

- `type: "branch"`：依 `conditions` 檢查狀態，否則走 `default`。
- `type: "random"`：從 `content/scenes/` 指定的場景池抽一個未使用項目，並把 `after` 壓入返回堆疊。
- `type: "return"`：場景結束後回到最近一次 `random.after`；同一輪抽取會優先避開已見場景。
- `type: "route"`：結束本輪並依 `endingRules` 選擇結局。
- 支援比較運算：`>=`、`>`、`<=`、`<`、`==`。

目前狀態值：

| Stat | 意義 |
| --- | --- |
| `heart` | 浪漫好感 |
| `trust` | 信任與坦率 |
| `chaos` | 玩笑、意外與喜劇傾向 |
| `comfort` | 相處安全感 |
| `relationship` | 是否正式確認關係；達 1 優先進入 `lover` |

結局規則依陣列順序判定；OL 分支先判定其暫用結局，許棠內部仍依 `lover` → `heart` → `chaos` → `neighbor`。

## 回憶收藏

CG 或動態回憶會在故事第一次顯示時自動解鎖，資料沿用 `localStorage` 的 `${chapter.id}:cgUnlocks`，以相容舊存檔。收藏頁支援圖片前後瀏覽及影片重播；`migrateCGUnlocks()` 會補上相容的解鎖紀錄。

`cinematic.ch04.first_kiss` v2 採第一視角近距離構圖，由四張身份鎖定關鍵幀組成：對視並抬手撩髮、髮絲撥到耳後、閉眼微抿嘴唇、向鏡頭靠近。重建素材位於 `content/cinematics/first-kiss-v2/`，成品同時輸出 MP4、WebM 與收藏海報。

| 順序 | 邏輯 ID | 收藏標題 |
| ---: | --- | --- |
| 10 | `cg.ch01.hallway_meet` | 雨夜的初遇 |
| 20 | `cg.ch01.elevator_close` | 停電時的距離 |
| 30 | `cg.ch01.elevator_blush` | 燈亮之後 |
| 40 | `cg.ch01.phone_ending` | 交換聯絡方式 |
| 50 | `cg.ch02.cafe_morning` | 星期六的兩杯咖啡 |
| 52 | `cg.date.bookstore` | 同一本書 |
| 54 | `cg.date.riverwalk` | 傘下的距離 |
| 56 | `cg.date.night_market` | 分你一口 |
| 60 | `cg.ch02.laundry_room` | 凌晨的洗衣房 |
| 70 | `cg.ch02.rooftop_night` | 屋頂夜色 |
| 80 | `cg.ch03.living_room_wine` | 1702 的香檳 |
| 90 | `cg.ch03.art_wall` | 沒有展出的照片 |
| 100 | `cg.ch03.close_conversation` | 把距離交給彼此 |
| 103 | `cinematic.ch04.first_kiss` | 第一次接吻（10 秒動態回憶） |
| 105 | `cg.ch04.bedroom_challenge` | 坐近一點 |
| 110 | `cg.ch04.hallway_pause` | 走廊的暖光 |
| 120 | `cg.ch04.sunday_morning` | 星期日早晨 |

## 內容更新流程

### 修改或延伸劇情

1. 先執行 `npm run context -- --route <route-id> --node <node-id>`，取得局部上下文。
2. 依 route config 的 `storyFiles` 編輯對應故事檔；較大的路線可以加入更多節點檔，不需合回單一 JSON。
3. 若場景應由其他角色複用，在 route config 的 `sceneFiles` 加入共用場景檔，再由角色路線提供台詞、服裝與 CG。
4. 每個新節點使用路線內唯一 ID，並確保所有 `next`／`choices[].next` 可達。
5. 選擇 `cg` 或 `composite`，不要混用；新素材也要加入該路線的 `assetIds`。
6. 若加入新 CG，同步完成下一節的四項資產工作。
7. 執行 `npm run build && npm run validate`，並檢查 `dist/content/routes/<route-id>/` 已更新。

### 新增或替換 CG／立繪

1. 將最終圖片放進 `dist/assets/`；不要只留在暫存生成目錄。
2. 在 manifest 建立或更新邏輯資產 ID、尺寸、焦點、收藏及角色依賴。
3. 在 recipes 建立或更新一對一的生成配方。
4. 在劇情中引用邏輯 ID，而非圖片檔名。
5. CG 場景不要再疊加立繪。
6. 執行完整建置與驗證。

### 修改人設並批次更新圖片

1. 修改 `content/characters/<角色>.json`。
2. 若改臉、身形或整體識別，提高 `designVersion`；若只改服裝、妝容或髮型，提高對應模組 `version`。
3. 執行 `npm run assets:plan -- <角色 ID>`。
4. 依輸出與 recipe 批次重新生成受影響資產。
5. 保持同一角色的臉、五官比例、髮量及不變項一致；允許服裝、髮型、妝容、姿勢與鏡頭按場景改變。
6. 更新 manifest／recipe 版本後執行驗證。

### 新增角色

1. 新建 `content/characters/<id>.json`，使用唯一 `id`。
2. 定義 identity、invariants、hairstyles、outfits、makeups、expressions 和參考圖。
3. 新增該角色的立繪／CG、manifest 項目及 recipes。
4. 建立獨立分支故事檔及 context，接入預設故事的 `storyFiles`，並在共用節點增加選擇入口。
5. 在 route config 的 `assetIds` 宣告此路線可用素材；引擎與建置工具不需要為新角色修改。

## 驗證器會阻止的問題

- 缺失實體圖片或未知資產 ID。
- manifest 資產沒有 recipe，或多份 recipe 輸出同一資產。
- 角色、服裝、髮型、妝容不存在或版本不一致。
- CG 配方缺少明確的 `headPose`。
- 隨機場景池、入口節點、返回節點或 `unlockFlag` 不存在。
- CG 缺少收藏標題、章節、排序，或排序重複。
- `cg`／`composite` 欄位混用。
- `next`、選項、分支或結局引用不存在的節點／結局。
- 劇情節點從 `startNode` 無法到達。
- 使用未知狀態值或不支援的比較運算。

## 前端操作

- 滑鼠點擊對話區：顯示完整文字或前進。
- 數字鍵 `1`–`9`：選擇對話選項。
- 空白鍵／Enter：前進。
- `M`：切換聲音。
- 標題畫面：續玩（沒有存檔時為開始故事）、CG、分支；不提供重複的重開按鈕。
- 分支頁：垂直排列節點與目的節點編號；可回到已走過的節點，起點則重開本輪。收藏紀錄不會清除。
- 遊戲中的「回標題」會保留目前節點，標題顯示相同 CG 或背景＋立繪。影片節點顯示海報，續玩後從影片起點播放。
- 動態回憶播放時可使用右上角「跳過片段」；系統偏好低動態效果時自動退回海報圖。
- 收藏檢視器支援左右方向鍵與 Escape。

## 發布與備份

- GitHub 倉庫：`TsungmingLiu/seventeen-floor-neighbor`。
- 預設分支：`main`。
- `dist/` 是完整靜態站點，可部署到 GitHub Pages、Cloudflare Pages 或 OpenAI Sites。
- OpenAI Sites 設定記錄於 `.openai/hosting.json`；該檔案只存專案 ID 與靜態目錄，不應加入憑證或秘密。
- 圖像生成來源可能存在 ChatGPT Library，但遊戲運行所需的最終圖檔必須提交到 `dist/assets/`；不要依賴對話附件或暫存路徑。
- GitHub `main` 應同時保存可編輯來源與可立即部署的 `dist/`，以便新對話不需要重建歷史上下文。

### 每次提交前檢查

```bash
npm run build
npm run validate
git diff --check
git status --short
```

確認以下內容一起提交：

- `content/` 中的來源變更。
- `src/` 中的引擎變更。
- 對應的 `dist/content/` 或 `dist/*.js` 建置產物。
- 新增或替換的 `dist/assets/` 圖片與影片。
- 若架構、資料格式、角色版本、資產數量或工作流程改變，更新本 README。

## 新對話接手提示

可將以下內容直接貼給新的 Codex／ChatGPT Work 對話：

> 請讀取 GitHub 倉庫 `TsungmingLiu/seventeen-floor-neighbor` 的最新 `main` 和 `README.md`。以 GitHub `main` 為交接基準，保留目前資料驅動架構。修改 `content/` 或 `src/` 後執行 `npm run build`、`npm run validate` 和 `git diff --check`，並把來源、建置產物及新增圖片／影片一起推回 GitHub。CG 與 cinematic 節點不得疊加立繪；角色或服裝修改要遵循版本依賴與 `assets:plan` 批次更新流程。

針對單一節點工作時，建議把提示縮短為：

> 請在最新 `main` 執行 `npm run context -- --route <route-id> --node <node-id>`，只修改該節點及必要的相鄰節點；完成後執行 build、validate 與 diff check。

## 相關文件

- `README.md`：完整交接、設定、資料格式與工作流程（本文件）。
- `ARCHITECTURE.md`：模組化架構的精簡摘要。
- `PROJECT_STATE.md`：目前里程碑、可玩路線與下一個內容決策。
- `REFACTOR_PLAN.md`：本次分階段重構範圍、驗收與停點。
- `AGENTS.md`：Codex 新對話自動載入的精簡專案規則。


## Asset pipeline (W2)

```bash
npm run assets:check
npm run assets:build
npm run build
```

Current pre-commercial asset provider:

- Google Drive `source-private`: Restricted canonical masters.
- Google Drive `runtime-public`: anyone-with-link optimized runtime assets.

`content/assets/source-catalog.json` tracks private master provenance. `content/assets/source-map.json` tracks runtime provider/file ID/hash metadata. Build verifies remote bytes and produces disposable `dist/assets/`.

Cloudflare R2 migration is deferred until commercialization needs justify it.
