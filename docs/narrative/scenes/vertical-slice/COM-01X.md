# COM-01X — 電梯重啟

## Status

- Production stage: **S4 Script Lock / S5 State Contract / S6 Art Shot Lock**
- Scope: Opening Vertical Slice / common Xu thread
- Memory ownership: `common`
- Progress band: `120`
- Estimated play time: 3–5 minutes
- Lock rule:保留「短暫設備停頓、低 stakes 對話、到站即分開」；不得升級成受困、恐慌或救援事件。

## Canonical inputs

- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` — COM-01X
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
- `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`
- `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md`
- `docs/proposals/urban-dating-sim-setting-proposal.md`
- `docs/narrative/scenes/vertical-slice/COM-00.md`

## Scene summary

搬家後第 3 天晚間，男主與許棠從一樓同乘電梯回 17 樓。電梯在中段短暫頓住、燈光閃爍，面板顯示系統重啟；不到十秒便自行恢復。等待期間，許棠以熟住戶的乾式反應鬆開沉默，兩人第一次真正聊了幾句大樓與附近生活。電梯到站後，他們各自回門，沒有刻意延長。

這不是危機場景。它要證明兩人在沒有明確事件可做時也能維持自然節奏，並讓許棠的幽默、觀察力與生活熟悉感第一次被聽見。

## Scene goal / dramatic question

- 玩家感受：第二次遇見比第一次熟一點，但仍保有鄰居距離。
- 男主目標：回家；在設備停頓時判斷是否需要操作緊急通話。
- 許棠目標：回家；用一句乾話處理不必要的緊張，順便確認新鄰居住得是否順利。
- Dramatic question：沒有「幫忙」這個藉口時，兩人是否仍有話可說？答案是有一點，但不必勉強更多。

## Unlock / entrance condition

```yaml
requires:
  - met_xu_tang == true
recommended_previous: COM-00
```

- 時間：COM-00 後 3–4 天，約 19:20。
- 地點：公寓一樓電梯 → 17 樓。
- 男主知道：許棠姓名、住 1702。
- 許棠知道：男主姓名、住 1703、剛搬來。
- 兩人尚未交換聯絡方式，也不知道彼此工作。
- 電梯技術設定：在 9–12 樓間出現約 6–8 秒控制系統重啟；不是停電，不需要救援；緊急燈與面板仍工作。

## Beat sheet

| Beat | Runtime intent | Action / dialogue intent | Visual / expression | State |
| --- | --- | --- | --- | --- |
| 01X.1 Lobby recognition | entrance | 門即將關時許棠進來；兩人以姓名或「晚上好」確認記得對方。男主不說「又見面了」製造命定感。 | `BG-APT-ELEVATOR` normal；`neutral_observant → polite_smile`。 | none |
| 01X.2 Ordinary silence | pacing | 兩人站不同側；電梯上升。可有一則很短的搬家後續：「箱子清完了嗎？」男主給務實回答。 | wide two-position composition。 | none |
| 01X.3 Brief stop | event | 輕微頓感、頂燈閃一下、樓層數字停住；面板顯示重啟符號／提示音。男主先看面板，不碰許棠。 | lighting variant：normal → dim/emergency → normal。`mild_surprise`。 | none |
| 01X.4 Xu dry line | voice reveal | 許棠看著停住的樓層，說一句把情況縮回日常的乾式話，例如「它偶爾會先想一下。」不是裝鎮定，也不暗示恐懼。 | `dry_playful`，視線在面板。 | none |
| 01X.5 Player tone choice | local branch | 玩家可接幽默、確認系統、或安靜等待。三者都不觸發 hero/comfort framing。 | expression 依分支。 | tone only |
| 01X.6 Restart | rejoin | 男主尚未需要按緊急通話，電梯便恢復。許棠可補一句「比上次快」，顯示她熟悉大樓但不誇張老舊。 | lighting normal；小小失重感用畫面 transition，不用 CG。 | none |
| 01X.7 Nearby life | actual conversation | 許棠問「住得還習慣嗎？」男主回答一項具體生活摩擦；她提供一個有限、可驗證的附近資訊，例如垃圾室時段／樓下咖啡早上較空。她不一次介紹整個街區。 | `polite_smile`, `neutral_observant`。 | none |
| 01X.8 17F split | exit | 門開，許棠先按住開門鍵半秒讓男主拿大袋子，不搬他的東西。兩人各走向自己的門，道晚安。 | wide corridor-facing elevator shot；`soft_goodnight`。 | `F_XT += 1` |

## Emotion arc

```text
並肩但仍陌生
  → 機械停頓造成一點被迫共享的空白
  → 許棠用乾式一句話恢復日常尺度
  → 玩家選擇自己的相處 tone
  → 設備恢復，聊天反而自然開始
  → 17樓到站，剛好停在還想再知道一點的位置
```

許棠沒有等待男主安撫；男主也沒有「看穿她其實害怕」。

## Player choice / local branch

Choice 顯示時，電梯仍在重啟、面板與緊急通話可見。

| Choice ID | Player-facing intent（可微調字句） | Xu response intent | Stats / flags | Rejoin |
| --- | --- | --- | --- | --- |
| `com01x_match_dry` | 「可能還在讀取住戶資料。」 | 她看一眼男主，回「那你還在新手教學。」短笑，不延伸成科技嘴砲。 | `mc_tone_humorous += 1` | 01X.6 |
| `com01x_check_panel` | 「面板還有電。再幾秒，沒動我就按通話。」 | 她點頭，接受這個判斷；不稱讚他冷靜可靠。 | `mc_tone_practical += 1` | 01X.6 |
| `com01x_wait_quietly` | 往旁邊讓半步，安靜等重啟。 | 她也靠回原位；短暫沉默不被寫成失敗。恢復時她主動接下一句。 | `mc_tone_restrained += 1` | 01X.6 |

Branch guardrails：

- 三條一律取得本幕 base `F_XT +1`；不以「最會安慰」作最佳答案。
- 不出現牽手、護住、要求她靠近角落等肢體行動。
- 實際分支不把 6–8 秒寫成足以長談人生的時間。

## Locked playable script

### `common_elevator_restart_enter`

**Visual**：`BG-APT-ELEVATOR.normal`。許棠位於畫面右側，`XT-SPR-WEEKDAY.neutral_observant`。

**Action**：一樓電梯門將關時，許棠伸手擋住感應區進來。她看見男主，點了一下頭。

**Xu Tang**：晚上好。

**Protagonist**：晚上好。

**Action**：男主按下 17 樓；按鍵已亮。

**Xu Tang**：箱子清完了嗎？

**Protagonist**：已經能走路了。找東西還是得開三箱。

**Xu Tang**：聽起來很符合第三天的進度。

### `common_elevator_restart_stop`

**Audio**：電機聲停下；一聲短提示音。

**Visual**：切 `BG-APT-ELEVATOR.restart_dim`，許棠表情 `mild_surprise`。

**Action**：電梯輕頓，樓層數字停住。緊急通話燈與面板仍亮。

**Narration**：不是下墜。只是所有聲音突然少了一層。

**Xu Tang**：它偶爾會先想一下。

### `common_elevator_restart_choice`

1. `com01x_match_dry` — **「可能還在讀取住戶資料。」**
2. `com01x_check_panel` — **「面板還有電。再幾秒，沒動我就按通話。」**
3. `com01x_wait_quietly` — **往旁邊讓半步，安靜等重啟。**

#### Branch `com01x_match_dry`

**Visual**：`XT-SPR-WEEKDAY.dry_playful`。

**Protagonist**：可能還在讀取住戶資料。

**Xu Tang**：那你還在新手教學。

→ Rejoin `common_elevator_restart_resume`

#### Branch `com01x_check_panel`

**Protagonist**：面板還有電。再幾秒，沒動我就按通話。

**Xu Tang**：好。

**Action**：她向旁邊讓開，保留男主操作面板的空間；沒有靠近他。

→ Rejoin `common_elevator_restart_resume`

#### Branch `com01x_wait_quietly`

**Action**：男主往旁邊讓半步，沒有伸手碰她。兩人一起看著樓層面板。

**Narration**：六秒不長。也沒有長到需要找話填滿。

→ Rejoin `common_elevator_restart_resume`

### `common_elevator_restart_resume`

**Audio**：電機重新運轉。

**Visual**：回 `BG-APT-ELEVATOR.normal`。

**Xu Tang**：比上次快。

**Protagonist**：還有上次？

**Xu Tang**：兩秒。不要替它記錄績效。

**Visual**：`XT-SPR-WEEKDAY.polite_smile`。

### `common_elevator_restart_smalltalk`

**Xu Tang**：住得還習慣嗎？

**Protagonist**：大致上。垃圾室我找了兩次。

**Xu Tang**：過十點要走左邊那扇門。右邊那扇看起來比較像，實際上只通機房。

**Protagonist**：難怪。

**Xu Tang**：這棟樓有幾個地方，不太尊重直覺。

### `common_elevator_restart_exit`

**Audio**：17 樓到站提示音。

**Visual**：電梯門打開，露出 17 樓走廊。

**Action**：許棠按住開門鍵。男主先提著手上的袋子走出電梯。

**Protagonist**：垃圾室的事，謝了。

**Xu Tang**：那個資訊比電梯可靠。

**Protagonist**：晚安。

**Xu Tang**：晚安。

**Action**：兩人各自走向 1703 與 1702，不在門前續聊。

**End actions**：套用 choice tone；`relationship.xu.familiarity += 1`；設定可選的 building-tip callback。

## State contract

### Conditions

```yaml
requires:
  - met_xu_tang == true
forbids: []
```

### Stats

```yaml
relationship.xu.familiarity: +1
relationship.xu.trust: 0
relationship.xu.chemistry: 0
relationship.xu.compatibility: 0
```

- Choice 只記錄男主 tone；本幕不需要額外 heroine-specific pattern flag。

### Flags / knowledge

```yaml
set:
  xu_shared_building_tip: true
unchanged:
  contact_xu: false
  relationship.xu.romanticSignal: false
```

`xu_shared_building_tip` 可在 COM-03X 的包裹／大樓資訊對話中作一句 reactive callback；若 implementation 希望減少旗標，可由 choice history / scene completion 取代。

### Next structural targets

- 完成本幕後 common sequence 繼續 `COM-01J`。
- 許棠線解鎖 `COM-02X`。
- 不改 `recentFocus` 或 knowledge-of-other-heroine flags。

## Runtime / Memory intent

- 建議拆成 8–10 個 nodes，前綴 `common_elevator_restart_*`。
- Memory title：**電梯重啟**。
- Memory cover：使用 `BG-APT-ELEVATOR` + `XT-SPR-WEEKDAY` 的 authored composite；P2 CG 未生成時不得顯示 broken Gallery slot。
- 此 Memory 的價值是 voice / rhythm，不需用 CG 假裝大事件。

## Art needs

### Background

- `BG-APT-ELEVATOR` — P0。
- Locked variants：`normal`、`restart_dim`。兩版 camera/layout 必須完全相同，只改 practical light 與面板狀態。
- 電梯避免鏡面牆造成多重人物反射；可用霧面深灰金屬＋暖灰石材。

### Sprite

- `XT-SPR-WEEKDAY`，沿用 COM-00 Wardrobe A / Look 01。
- Required expressions：`neutral_observant`, `polite_smile`, `dry_playful`, `mild_surprise`, `soft_goodnight`。
- Position：許棠初始在畫面右側，與男主 POV 保持一般同乘距離；停頓時不主動靠近。

### CG

- 必需：none。
- P2 optional：手機／緊急燈下短近景，但目前 **不進首輪 generation queue**。原因：場景的情緒價值主要來自節奏與表情切換，CG 會不成比例地把小停頓拍成事故。

## Art shot lock

### Shot A — Shared elevator wide（locked）

- Camera：男主 POV，胸口至眼高；許棠位於右側 3/4 身，左側留無人物空間表現距離。
- UI safe zone：下方 25%；樓層面板放上半側邊，不能被 dialogue box 蓋住。
- Reflection：不得出現可辨認男主臉。

### Shot B — Restart lighting beat（locked）

- Trigger：面板樓層數字停住後立即切 `restart_dim`。
- Duration：最多 3 dialogue advances / 約 8 秒故事時間。
- Focal：許棠先看面板，再看男主是否要按通話；不是閉眼害怕。
- Sprite expression：`mild_surprise → dry_playful`。
- Sound cue intent：短促電機停止音、提示音；無恐怖低頻、無警報音樂。

### Shot C — Door opens at 17F（locked）

- 電梯恢復後回 wide；門開露出與 COM-00 同 layout 的 17F 走廊。
- 許棠只按開門鍵讓路，不伸手拿男主袋子；動作對應「尊重能力、提供小協助」。
- 不使用慢動作或背光 romantic reveal。

## Dialogue writing notes

### Xu Tang

- 她的笑點像對熟悉設備的吐槽，不像為陌生男性表演機智。
- 一次只給一項附近資訊；說完不追問「你一個人住嗎」。
- 她能主動開話題，但不快速親密。
- 真正好笑時也只是一個小笑，不用連續驚嘆號。

### Male protagonist

- 幽默選項保持一句，不延伸成工程師段子。
- 實際選項先看資訊再行動，不能寫成他神奇判斷電梯一定安全。
- 安靜選項不是木訥；用讓位、保持可操作空間等小動作表達社交能力。

### Sample line intents（非最終逐字稿）

- 許棠：「它偶爾會先想一下。」
- 男主：依 choice 回一句。
- 恢復後許棠：「比上次快。」——只暗示這不是第一次，避免 exposition。
- 到站收尾：「這次至少沒搬紙箱。」／「進步了。」可作 COM-00 輕回扣，但只保留一來一回。

### Prohibited beats

- 電梯長時間受困、消防救援或手機無訊號。
- 許棠有幽閉恐懼／靠男主安撫的新增設定。
- 男主修好電梯、推測故障根因或聯絡物業展現能力。
- 外貌稱讚、壁咚、失衡擁抱。
- 到 17 樓後站在門口繼續聊十分鐘。

## End state

- `F_XT +1`；兩人從「知道名字」進到「能聊幾句的鄰居」。
- 玩家辨識許棠的初期 voice：句短、乾、生活化，會主動但不逗留。
- 男主 tone 被記錄，但沒有任何選項替他取得不合理的情感洞察。
- 電梯成為可在 XT Distance coda 回收的 ordinary shared memory。

## Review log

- Player-perspective pass：事故尺度與 scene 長度相符；不會讓玩家期待災難型 romance。
- Character/continuity pass：沿用 COM-00 姓名／門牌 knowledge；未提前交換工作與聯絡資訊。
- Choice pass：三種 tone 都合理且同樣前進，不存在救援型明顯正解。
- Art economy pass：CG 明確降為 P2、不進首輪，避免與 scene stakes 不匹配。
- Locked unresolved items：實作時需確認 `restart_dim` 是同 BG lighting variant，而非新 layout。
