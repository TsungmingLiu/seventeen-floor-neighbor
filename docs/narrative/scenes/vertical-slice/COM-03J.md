# COM-03J — 推薦 / Discord

## Current authorized weekend/weekday design — ND-ARC-001

- Lifecycle: **CANONICAL** task-local Narrative Design amendment, 2026-10-04. Source ref: `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9`. Human 授權本輪方向與必要改寫；本 pass 沒有新 final prose、QA、runtime 或 CG acceptance。
- Owning design: `docs/narrative/JYC_WEEKEND_WEEKDAY_REVISION.md`；current contract: `content/production/narrative/opening-ch1/COM-03J.json`。此 design section 與 current JSON 擁有時序／gate；下方 CW-COM-03J-002 Script Lock 保留相容原稿，按批准的 scene-local repair scope 局部修訂。歷史 writing identity 不作本輪 approval。
- 同平日晚間線上推薦，先檢查排除：不需 final dialogue rewrite；只改 design route labels／gate／callback selector。包裹後同平日晚間，現有「下午／晚上」與公開《折返月台》body、三個回复分支可保持。先 !jyc_permanently_excluded 再 true actual Discord contact；無 contact bypass。具體 callback 只在新 cafe dialogue 確曾談到時使用，book-focused reunion 缺動作／關圖層前事用既有 neutral；不寫或補造新推薦承諾。
- Stable ID plan：無新 IDs；common_recommend_discord_jyc_* 與 com03j_* 保留。
- 永久排除：本輪 `com01b_weekday_street_walk` 才寫 `jyc_permanently_excluded=true`。此 flag 先於 contact/history，永不由 merge、reload、scheduler、public shared scene 或 ordinary invite 清除。Memory replay 限自己的 snapshot，不向 live 主線寫入；改走前一分岔屬另一 playthrough，不是本輪 reopening。
- Semantic visual impact 與四個必要 dialogue units 見 owning design；現有 accepted image bytes、QA/Human 歷史都保留。獨立下游才裁決哪些畫面可重用。

## Current Script Lock — CW-COM-03J-002


> Lifecycle: **CANONICAL**（scene-local Locked Scene；writer-authored，獨立 Narrative QA 尚待審查）
>
> Scene / Dialogue task: `CW-COM-03J-002` / `jyc-weekend-weekday-20261004`。相容原稿沿用；本輪只修批准的 callback 與線上自然度。

## Status and boundary

- Production stage: `content_writer / scene_dialogue`；本幕 Script Lock，等待獨立 `content_qa / narrative_review`。Human narrative-preview、visual 與 runtime integration gates 仍待後續階段。
- Run: `jyc-weekend-weekday-20261004`; task `CW-COM-03J-002`; harness `content_writer` v1.4.1 / `scene_dialogue`; workflow v1.3.1。Dispatched ref: `0daaed06d5149ae9d6c98c2fbb8eed54a3a21c97`; input scene blob: `48d3a106fc8d4eafcea125c8f90997f8c1c7f93f`。
- Approved Narrative Design: `ND-COM-03J-003`，decision blob `f69563543a3a1b44ca2e277c0983af9939089927`；下方 source-local repair scope 為本輪批准範圍。JSON 不由本 dialogue pass 改動。
- COM-02J 擁有實際平日咖啡店相遇、互知姓名、共同話題、雙方同意與可用聯絡方式交換。週末書店 go 在後續平日 cafe 重逢；週末留家支在平日選 cafe 初遇或街頭永久排除。COM-03J 在同晚包裹後只承接已發生的事；COM-03X 的 common graph 位置不代表江雨澄又見過男主或知道許棠。
- `common_recommend_discord_jyc_*` 為既有穩定 authoring node IDs，三個 `com03j_*` 為既有穩定 reply choice IDs；此處沒有 runtime／save／Memory wiring。私訊 body 的具體渠道是 **Discord**，因此只在 COM-02J 實際雙方同意並交換 Discord 後使用。若前事實際交換其他管道，本稿不可假作 Discord 私訊；需由後續 bounded channel wording revision 解決，不得靜默改口。

## Canonical inputs

- `content/production/narrative/opening-ch1/COM-03J.json` — exact approved COM-03J continuity contract.
- `docs/narrative/scenes/vertical-slice/COM-02J.md` — exact upstream Locked Scene, including actual book/map praise and small-annotation response.
- `docs/narrative/NARRATIVE_INTERACTION_AND_STORY_MAP_SPEC.md` — choice/consequence and no-score authority.
- `docs/art/characters/jiang-yucheng.md` — Jiang character/voice boundary.

### Source-usage provenance

The exact packet additionally supplies the current scene, approved ND-COM-03J-003 decision, task-local weekend/weekday amendment, continuity schemas and Production Workflow Tools. No other scene, contract, voice bank, runtime, CG or image was acquired. The original writing task `CW-CONTACT-CONTINUATION-001` / `m1-com03m-20261003` is retained as prose provenance only; discarded CW001 supplies no edits or lineage.

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-03J.json`。
- Verified contract SHA-256: `2b8aa83da0638dbba3e6526ede81313e5b05afeb9e0d0db63bd9876671dc5678`。Git blob: `79dfbcdd38ab5a17098112e969a8c2941bf66172`；contract bytes unchanged.

- Entry：COM-02J 實際平日 cafe reunion 或 first meeting 後，雙方才知道當場交換的姓名和具體話題。聯絡可能已實際交換，也可能普通未交換；平日街頭永久排除支仍互不相識，本幕 Jiang content bypass。
- Contacted exit：只在 COM-02J 實際 Discord 交換、姓名和具體共同話題均成立時，從同次 cafe 討論接《折返月台》公開推薦及當晚訊息。雨澄的線上反應隨熟悉內容展開；三種收束只記 local reply rhythm，沒有邀約或戀愛承諾。
- No-contact exit：實際 cafe 相遇但未交換聯絡時，只保留 COM-02J 已演出的姓名與話題，普通告別後不播私訊。未見者沒有姓名、話題、訊息或聯絡。
- Knowledge：只按 COM-01J／COM-02J 真正演出且具可信 provenance 的 history 回扣。首次 cafe 相遇不承接書架、雨澄的咖啡推薦或前次作品話題。無創作匿名身分、商業委託、住處與跨人物知識揭露。
- State：`contact_jyc`、`met_jiang_yucheng`、雙方姓名與 cafe topic 全部 read-only 承接 COM-02J；本幕不補設 contact，不增加 `relationship.jyc.familiarity`，不設 RE、romanticSignal、focus／calendar／slot authority。

## Entry and branch contract

```yaml
route_inputs:
  bookstore_go: weekend COM-01J completed -> weekday COM-02J reunion
  bookstore_skip_cafe_go: weekend home -> weekday COM-02J first meeting, no COM-01J history
  weekday_street: permanent exclusion -> bypass all COM-03J Jiang content
contacted_discord_requires:
  - actual COM-02J cafe encounter and completed name exchange
  - actual concrete common topic and public-recommendation bridge
  - explicit mutual consent and actual usable Discord exchange in COM-02J
  - contact_jyc == true
no_contact_cafe:
  - actual COM-02J cafe encounter
  - contact_jyc == false
  - skip private-message and reply-choice nodes
never_met:
  - met_jiang_yucheng == false
  - contact_jyc == false
  - skip all Jiang nodes
```

COM-02J already completes the cafe goodbye on both actual-contact and no-contact paths. This scene starts later that same evening. Its first Discord message introduces the related recommendation from the actual cafe conversation; nobody promised to send 《折返月台》 earlier. The shared online body may play on either contacted cafe route because COM-02J has established real names, a concrete shared visual-interest topic, mutual consent and an actually exchanged Discord channel. The no-contact exit is a structural pass-through only.

《折返月台》是 task-local 虛構遊戲推薦；只呈現公開作品頁及兩張內容截圖。兩圖都在同一月台／候車區：一張有站立與坐著的角色輪廓，另一張視點移到柱旁，站牌、出口箭頭與地面反光仍可見。Meme 是同一推薦截圖上的加字，不是她的創作帳號或私人作品。

## Beat sheet

| Beat | Authoring node | Semantic payoff |
| --- | --- | --- |
| 03J.0 真實路徑檢查 | scene gate / `no_contact_exit` | 未見者直接 bypass；已見但未交換者沿 cafe 普通告別離開。 |
| 03J.1 當晚承接 | `enter` → `callback` | 從實際 cafe 話題選一則克制的公開遊戲推薦首訊，無第三次碰面或重複告別。 |
| 03J.2 公開圖 | `first_message` | 同則 Discord 訊息附公開頁與第一張圖。 |
| 03J.4 接住內容 | `content_uptake` | 男主先讀圖、回具體觀察，她局部補正。 |
| 03J.5 文字展開 | `analysis` → `meme` → `correction` | 第二張圖、分析、meme 與自我更正分回合到達。 |
| 03J.6 確認節奏 | `notice` → `choice` → 三支 | 玩家按今晚節奏回覆，三支各自道別後合流。 |
| 03J.7 合流 | `exit` | 只保存實際訊息支的 reply style，接 common successor。 |

## Locked playable script

製作標籤 `Jiang Yucheng`／`Protagonist` 並非 spoken address。`Discord — Jiang Yucheng` 是實際交換的私訊 sender 語意標籤，不設定匿名創作帳號。時間標記只呈現故事時間。所有 callback variants 互斥，只在事實條件具備時使用。

### `common_recommend_discord_jyc_no_contact_exit`

**Condition**：COM-02J 已實際 cafe 相遇，但未交換任何可用聯絡方式。COM-02J 已完成普通道別，這裡不重演、不添加第三次見面或私訊。保留已取得的姓名和當場話題，直接前往下一個有效 common structural target；不設 reply style。從未見面的路徑連此 node 也不執行。

### `common_recommend_discord_jyc_enter`

**Condition**：COM-02J 已實際交換 Discord 並完成咖啡店道別，雙方姓名及當場具體共同話題均成立。這裡開始於同日晚間，沒有新的線下見面。

**Narration**：晚上，我把下午帶去咖啡店的筆記本電腦打開，桌面還留著沒關完的視窗。

**Action**：Discord 出現江雨澄的訊息。我把手邊的視窗縮小。

→ `common_recommend_discord_jyc_callback`

### `common_recommend_discord_jyc_callback`

**Selector**：按下方 Callback selector 只執行一個與 COM-02J 實際 cafe 交談相符的 **Discord 首訊** variant，再到 `common_recommend_discord_jyc_first_message` 的同則訊息附件。沒有任何 variant 假稱下午已提過《折返月台》或答應傳圖。

#### Variant `her_art`

**Discord — Jiang Yucheng**：下午說到你看我那幾張動作，我想到《折返月台》。裡面有個角色，坐著跟站著都很好認。我傳一張圖給你看。

#### Variant `shared_visual_design`

**Discord — Jiang Yucheng**：下午說到亮的地方少一點，視線反而會過去，我想到《折返月台》。它有幾個畫面也是這樣。我有截圖。

#### Variant `shared_worldbuilding`

**Discord — Jiang Yucheng**：下午聊雨港的分區，我想到《折返月台》。它也是用畫面讓你知道自己走到哪裡，場景不一樣。我傳張圖給你看。

#### Variant `shared_edition_value`

**Discord — Jiang Yucheng**：下午講到那本書字太小，我想到《折返月台》有個畫面也可以放大找細節。不過這張的字看得清楚。我有截圖。

#### Variant `shared_neutral`

**Discord — Jiang Yucheng**：下午聊到畫面怎麼安排，我想到《折返月台》。有一張圖我覺得你可以看一下。

#### Variant `general_praise`

**Discord — Jiang Yucheng**：下午你說雨港那張分區圖翻了好幾次，我想到《折返月台》的一張圖。不是書後面那種小註解啦，這張可以放大看。我傳給你看。

#### Variant `neutral`

**Discord — Jiang Yucheng**：下午聊到畫面怎麼安排，我想到《折返月台》。有張月台的圖，細節滿有意思的。我傳給你看。

### `common_recommend_discord_jyc_first_message`

**Time**：20:48。

**Semantic Visual Beat**：Discord 私訊裡出現公開作品頁連結及第一張月台截圖，前後沒有其他新帳號／群組資訊。

**Message attachment**：《折返月台》公開作品頁連結；第一張截圖：月台立柱旁一個站著的角色、候車椅上一個坐著的角色；遠處出口亮著，地面留有反光。

**Action**：我點開連結，再把截圖放大。角色的臉只佔一小塊，站姿跟坐姿倒很清楚。

→ `common_recommend_discord_jyc_content_uptake`

### `common_recommend_discord_jyc_content_uptake`

**Protagonist — message**：後面坐著那個，就算臉看不清楚也認得出來。手的位置差很多。

**Discord — Jiang Yucheng**：對，他一直把手夾在膝蓋中間。

**Protagonist — message**：前面站著的，看起來快走到出口了。

**Discord — Jiang Yucheng**：他其實沒動。我知道，看起來很像要走。

**Protagonist — message**：喔，我剛剛以為他在往外走。

→ `common_recommend_discord_jyc_analysis`

### `common_recommend_discord_jyc_analysis`

**Semantic Visual Beat**：第二張公開內容截圖接著出現；同一月台中視點已移至立柱旁，人物、站牌、箭頭和反光可以對照。

**Discord — Jiang Yucheng**：看這張。換個位置，出口就沒那麼搶眼了。

**Message attachment**：第二張同一場景截圖，站牌及地上的箭頭更容易分辨，出口亮處被柱子遮住一部分。

**Discord — Jiang Yucheng**：你往下看，地上有個箭頭。它跟出口那塊亮的地方，方向剛好相反。

**Protagonist — message**：真的欸。我一直看上面那塊亮的，沒看到箭頭。

**Discord — Jiang Yucheng**：我也是第二次才看到。第一次以為路很好找。

**Discord — Jiang Yucheng**：然後走錯。

**Protagonist — message**：所以那個光不是帶路用的？

**Discord — Jiang Yucheng**：嗯……那只是出口的燈，不一定是帶路用的。要走哪邊還是看箭頭。

→ `common_recommend_discord_jyc_meme`

### `common_recommend_discord_jyc_meme`

**Semantic Visual Beat**：她傳來同一張月台截圖加字的 meme；對話內容仍在同一推薦內。

**Message attachment — meme text**：出口那塊亮處上方寫「看起來像答案」；地上箭頭旁寫「你漏看的題目」。

**Discord — Jiang Yucheng**：差不多是這樣。

**Protagonist — message**：箭頭就在我腳邊，我還看不到。

**Discord — Jiang Yucheng**：它也沒多大。我不是每個畫面都看得到。

**Action**：我回頭看第一張圖。剛讀完她這句，輸入提示又亮了。

→ `common_recommend_discord_jyc_correction`

### `common_recommend_discord_jyc_correction`

**Discord — Jiang Yucheng**：啊，剛剛那個亮的地方，也不是沒用啦。你看地上那條反光，站著那個人的腳就分出來了。

**Protagonist — message**：喔，看到了。背景這麼暗，腳還是看得清楚。

**Discord — Jiang Yucheng**：對。要是全部都亮，就看不到這個差別了。

**Discord — Jiang Yucheng**：等一下，我剛剛說第一次以為路很好找，講得不太對。

**Discord — Jiang Yucheng**：是我看到出口亮著，就以為一定能往那邊走。路其實一直有標，是我沒看。

**Protagonist — message**：我還是覺得他像在走。可是看他的手……好像又不是。

**Discord — Jiang Yucheng**：嗯，你再看他手的位置就會發現。他站得滿僵的。

→ `common_recommend_discord_jyc_notice`

### `common_recommend_discord_jyc_notice`

**Semantic Visual Beat**：男主停下打字，兩張截圖與分段到達的訊息仍在對話中。

**Narration**：我本來想回一個「嗯」，游標停了一下。她已經又補了一句，還把自己前面說的話改掉了。

**Narration**：下午在咖啡店，她講畫面時還會停一下找詞。現在我往上滑，才發現已經聊了這麼多。

**Discord — Jiang Yucheng**：這張還有別的地方，不過我先停一下。

→ `common_recommend_discord_jyc_choice`

### `common_recommend_discord_jyc_choice`

**Discord — Jiang Yucheng**：我是不是講太多？你如果在忙，可以晚點再看。

1. `com03j_continue_content` — **「我還想看。站牌那邊呢？我剛剛一直沒注意它。」**
2. `com03j_warm_close` — **「沒有，箭頭那邊我有看懂。只是我今天想早點休息，先聊到這裡？」**
3. `com03j_save_for_later` — **「我想先自己看一下這兩張，消化完再跟妳聊。」**

三項 label 就是該 branch 的第一句 spoken message；只播放所選分支，不追加 stats。她的反應與道別在各 branch 中完成後才 rejoin。

#### Branch `com03j_continue_content`

##### `common_recommend_discord_jyc_continue`

**Protagonist — message**：我還想看。站牌那邊呢？我剛剛一直沒注意它。

**Discord — Jiang Yucheng**：喔，好。那你看第二張，站牌旁邊那條線。

**Protagonist — message**：柱子右邊？

**Discord — Jiang Yucheng**：嗯。那條線會把視線拉回人身上。不一定是先看臉。

**Action**：我把第二張圖放大，往右挪了一點。

**Protagonist — message**：我剛剛以為妳在說站牌上面的字。

**Discord — Jiang Yucheng**：喔，不是。我指旁邊的直線，打字好難指。

**Protagonist — message**：找到啦。它跟人的背幾乎平行。

**Discord — Jiang Yucheng**：對，就是那裡。

**Narration**：我們拿兩張圖來回對照。她說哪裡，我再找一下，有一處怎麼看都覺得只是柱子。

**Protagonist — message**：這個我真的看不出來。

**Discord — Jiang Yucheng**：也可能我想太多。那個先算了。

→ `common_recommend_discord_jyc_continue_close`

##### `common_recommend_discord_jyc_continue_close`

**Time**：23:06。

**Semantic Visual Beat**：聊天視窗還停在同一推薦；男主看一眼時間，兩人把話題停下。

**Protagonist — message**：欸，十一點了。我先去睡，剩下的我自己再看一下。

**Discord — Jiang Yucheng**：已經十一點？我也沒注意。

**Protagonist — message**：嗯，今天先這樣。謝謝妳傳圖。

**Discord — Jiang Yucheng**：好，那先停。晚安。

**Protagonist — message**：晚安。

**Local choice state**：`jyc_com03j_reply_style=continue_content`。

→ Rejoin `common_recommend_discord_jyc_exit`

#### Branch `com03j_warm_close`

##### `common_recommend_discord_jyc_warm_close`

**Protagonist — message**：沒有，箭頭那邊我有看懂。只是我今天想早點休息，先聊到這裡？

**Discord — Jiang Yucheng**：好啊。那其他的先不傳了。

**Protagonist — message**：嗯，謝謝。妳傳的那兩張我留著。

**Discord — Jiang Yucheng**：好，你休息吧。晚安。

**Protagonist — message**：晚安。

**Semantic Visual Beat**：輸入提示停住，推薦連結與兩張圖留在對話裡。

**Local choice state**：`jyc_com03j_reply_style=warm_close`。

→ Rejoin `common_recommend_discord_jyc_exit`

#### Branch `com03j_save_for_later`

##### `common_recommend_discord_jyc_save_for_later`

**Protagonist — message**：我想先自己看一下這兩張，消化完再跟妳聊。

**Discord — Jiang Yucheng**：好，那先看這兩張。我先不補了。

**Protagonist — message**：嗯，我先從第一張看。連結也留著。

**Discord — Jiang Yucheng**：對，都在上面。你慢慢看，我先去弄別的。

**Protagonist — message**：好，謝謝。晚安。

**Discord — Jiang Yucheng**：晚安。

**Semantic Visual Beat**：她停下補充，男主重新點開第一張已收到的圖。

**Local choice state**：`jyc_com03j_reply_style=save_for_later`。

→ Rejoin `common_recommend_discord_jyc_exit`

### `common_recommend_discord_jyc_exit`

**Semantic Visual Beat**：私訊安靜下來；頁面、截圖及當次聊天仍可往上翻看。

**Narration**：對話底下停在晚安。我把視窗縮小，連結還留在裡面。

**Mainline completion intent**：保留 COM-02J 已成立的 `contact_jyc=true` 與 encounter 狀態；僅保存所選 `jyc_com03j_reply_style`，不增加 familiarity。

**Replay completion intent**：結束本幕 replay-local flow；丟棄 local choice mutation，返回 Memory，不寫主線。

→ Mainline structural successor `COM-03M`；由全局 sequence 檢查其完整前置，本幕不設 `open_dating_unlocked`。

## Callback selector

`common_recommend_discord_jyc_callback` 是 read-only local history selector，不是玩家 choice。它挑選同晚首訊措詞；七個 variant 都附同一公開作品頁與月台截圖。Mainline 讀本次 playthrough 的可信 COM-02J history；僅 bookstore-go 且 COM-01J 確實發生時讀可信 first topic。Memory 只讀 replay-local encounter/contact/topic snapshot；缺失、不可信或別的 save history 不得以 live state 補全。以下各 variant 均到 `first_message` 的附件；無 contact 時不進 selector。

| Trustworthy COM-02J topic / spoken detail | Additional trustworthy fact | Execute only | Factual limit |
| --- | --- | --- | --- |
| `her_art`，實際談動作／輪廓 | 不使用 first topic | `her_art` | 可用於 reunion 或 first cafe meet，語句只回扣當日下午實際畫圖。 |
| `shared_work`，當場確實談明暗安排 | bookstore go + COM-01J `visual_design`，且本次 cafe 也回扣 | `shared_visual_design` | 兩場實際說過才提此前設定。 |
| `shared_work`，當場確實談雨港分區 | bookstore go + COM-01J `worldbuilding`，且本次 cafe 也回扣 | `shared_worldbuilding` | first cafe meet 絕不使用。 |
| `shared_work`，當場確實回扣字／版本笑話 | bookstore go + COM-01J `edition_value`，且本次 cafe 也回扣 | `shared_edition_value` | first cafe meet 絕不使用。 |
| `shared_work`，當場只談一般畫面安排 | first topic 缺失／未知或無當地特定 callback | `shared_neutral` | 不提書店作品或未說過的設定集。 |
| `general_praise`，當場確實稱讚書／雨港分區圖，且她回應後面註解變小 | 不使用 first topic | `general_praise` | 只回扣本次 cafe 的書／圖／註解；缺失或不可信時用 `neutral`。 |
| 當場具體共同視覺興趣成立，detail 缺失／未知／不可信 | 不使用 first topic | `neutral` | 不主張選過某 topic；若連共同話題也無可信證據，停止線上 path 並交 Narrative QA／integration 查明，不憑空推薦。 |

### Executable authoring selector

This is a compileable authoring projection for later integration, not a runtime change. All arguments belong to the same verified playthrough or replay snapshot. `cafeEvidence` contains verified spoken/event evidence, not new saved flags: `commonVisualTopic` and `usableDiscordExchange` cover the actual shared topic and completed mutual exchange; `details` lists only callback facts actually spoken. A topic enum alone supplies none of those facts. `trustworthyFirstTopic` is read only for `shared_work` on bookstore-go. Detail keys below describe the table's exact spoken requirements; missing/untrusted details select the existing neutral message.

```js
function selectCom03j({ flags, choiceHistory, cafeEvidence,
  trustworthySecondTopic, trustworthyFirstTopic }) {
  if (flags.jyc_permanently_excluded === true) return null;
  if (flags.jyc_permanently_excluded !== false) {
    throw new Error('COM-03J: missing exclusion guard');
  }
  const chosen = new Set(Object.values(choiceHistory));
  if (chosen.has('com01b_weekday_street_walk')) return null;
  if (flags.met_jiang_yucheng === false) return null;
  if (flags.met_jiang_yucheng !== true) {
    throw new Error('COM-03J: missing encounter evidence');
  }
  if (flags.contact_jyc === false) {
    return { entryNode: 'common_recommend_discord_jyc_no_contact_exit',
      callbackVariant: null };
  }
  if (flags.contact_jyc !== true || flags.player_knows_jyc_name !== true ||
      flags.jyc_knows_player_name !== true ||
      cafeEvidence?.commonVisualTopic !== true ||
      cafeEvidence?.usableDiscordExchange !== true) {
    throw new Error('COM-03J: incomplete actual cafe/Discord evidence');
  }
  const details = new Set(cafeEvidence.details ?? []);
  let callbackVariant = 'neutral';
  if (trustworthySecondTopic === 'general_praise') {
    if (details.has('rain_port_map_praise_and_small_annotations')) {
      callbackVariant = 'general_praise';
    }
  } else if (trustworthySecondTopic === 'her_art') {
    if (details.has('her_character_poses')) callbackVariant = 'her_art';
  } else if (trustworthySecondTopic === 'shared_work') {
    const variants = {
      visual_design: ['less_bright_area_draws_attention', 'shared_visual_design'],
      worldbuilding: ['rain_port_districts', 'shared_worldbuilding'],
      edition_value: ['small_book_text', 'shared_edition_value']
    };
    const specific = chosen.has('com01b_bookstore_go')
      ? variants[trustworthyFirstTopic] : null;
    callbackVariant = specific && details.has(specific[0])
      ? specific[1] : 'shared_neutral';
  }
  return { entryNode: 'common_recommend_discord_jyc_enter', callbackVariant };
}
```

Select once on scene entry; save/resume retains that selection and chosen reply branch. All contacted nodes require a non-null contacted selection. The callback plays only its selected variant and then the same `first_message` attachments. The general-praise path never consults first-topic history. Reply state remains exactly the three branch-local markers above; replay discards them on return. Integration must derive evidence from actual authored history, never fill a missing replay fact from live state.

## Choice / rejoin contract

| Stable choice ID | Local reply style | Reaction and goodbye | Next initiative residue |
| --- | --- | --- | --- |
| `com03j_continue_content` | `continue_content` | 她接站牌／線條，容許男主看不出一處；晚些時由男主提休息，雙方晚安。 | 可直接再分享一點作品，不推定隨時有空。 |
| `com03j_warm_close` | `warm_close` | 她接到今晚想休息，停止加圖，雙方晚安。 | 下次可先短訊確認節奏，沒有懲罰。 |
| `com03j_save_for_later` | `save_for_later` | 她把已傳的兩張圖留給男主自己看，雙方晚安。 | 留出自己看的空間，不催進度。 |

三支都 rejoin `common_recommend_discord_jyc_exit`。玩家回覆的是自己的今晚節奏；並不改變是否有 contact、姓名、knowledge、romantic eligibility 或其他 scene gate。

## Runtime / Memory mapping intent

Authoring graph for actual contacted Discord path: `enter → callback (one true variant) → first_message → content_uptake → analysis → meme → correction → notice → choice → chosen branch → exit → COM-03M`。`continue` 再經 `continue_close`。Exact targets：`com03j_continue_content → common_recommend_discord_jyc_continue`；`com03j_warm_close → common_recommend_discord_jyc_warm_close`；`com03j_save_for_later → common_recommend_discord_jyc_save_for_later`。

Actual cafe/no-contact: COM-02J normal goodbye → `no_contact_exit` → next valid common structural target, with no `first_message`／choice／Jiang reply style. Never met: bypass all COM-03J Jiang nodes. COM-03M only emits its Jiang message when `contact_jyc=true`; this script adds no such flag. Whether another common scene may play depends on its own structural prerequisites.

```yaml
read_only_from_actual_COM02J:
  - met_jiang_yucheng
  - player_knows_jyc_name/jyc_knows_player_name/jyc_creator_work_seen
  - actual_cafe_common_topic
  - contact_jyc
  - actual_exchanged_channel == Discord  # required to use this retained body
read_only_callback:
  - jyc_second_topic  # only when local history is trustworthy and spoken
  - jyc_first_topic   # only bookstore go + actual COM-01J history + cafe callback
set_on_mainline_message_completion_once:
  jyc_com03j_reply_style: chosen continue_content | warm_close | save_for_later
unchanged:
  - contact_jyc/met_jiang_yucheng and both name flags
  - relationship.jyc.familiarity/trust/chemistry/compatibility/romanticSignal
  - jyc_alias_private/jyc_alias_exposed
  - jyc_seen_in_element/jyc_home_space_comfort
  - focusHistory/recentFocus/lastMajorDate
  - exclusivity/deception and all other-character knowledge
```

Replay reads only its own trustworthy route, encounter, contact, topic and channel snapshot. Without proven cafe contact and actual Discord, it does not play the online body. It applies no mainline mutation; replay-local reply choice is discarded on return. Mainline completion deduplicates the local reply-style save. The later integrator must preserve node, variant and branch across save/load; this writer has not claimed engine/save tests.

## Scene-local repair scope — ND-COM-03J-001

- Preserve the Narrative Continuity Contract byte-for-byte; it already matches the authorized arc, route/state boundaries, contact eligibility and stable IDs. Repair only the `general_praise` callback semantics: bind it to the actual COM-02J book/map praise and rain-port map discussion (including her comment that later annotations are small). Do not refer to a layer joke or imply an unsupported earlier line; keep first-topic history out of this variant. If that actual history is absent or untrustworthy, use the existing neutral callback.
- In the affected contacted-online exchange, perform exactly one bounded naturalization sweep over the consecutive polished visual interpretations. Keep the same public recommendation, screenshots, grounded visual facts, knowledge timing, one-message callback structure, semantic visual beats and three existing reply choices/rejoins. Let the discussion sound like an unfolding exchange rather than a run of polished readings; do not add events, scene beats, state effects or dialogue here.
- This repair does not change route/contact gates, preview eligibility, reusable content outside the affected callback/online passage, stable node or choice IDs, runtime mapping, accepted image bytes, QA/Human history, or the approved arc. This design note supplies scope only; final dialogue remains for a separate `scene_dialogue` task.

## Verification boundary

CW-COM-03J-002 completed exactly one bounded continuous-dialogue naturalization sweep over the affected online exchange, retaining ordinary uptake, misunderstanding, meme, self-correction and all three branch reactions/goodbyes. Only six existing messages in uptake/analysis/correction were softened; the general-praise first message and its selector were repaired against the exact COM-02J book/map/annotation exchange. Other callback prose, narration, actions, attachments, choices, times and rejoin targets remain reusable and unchanged. Scene metadata now binds this packet and the unchanged contract; the authoring selector makes the existing guards and factual fallback explicit.

Modified semantic visual beats: **none authored**. Every existing Semantic Visual Beat line remains byte-for-byte identical; independent Narrative QA still owns any no-visual-impact decision. Contract, runtime, art and prior QA/Human evidence were not modified. Writer own-stage checks and exact output identity are in this task's ignored Handoff; independent Narrative QA, Human preview, visual review and runtime integration remain **PENDING**.
