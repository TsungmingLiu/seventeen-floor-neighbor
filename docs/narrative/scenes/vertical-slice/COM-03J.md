# COM-03J — 推薦 / Discord

> Lifecycle: **CANONICAL**（scene-local Locked Scene；writer-authored，獨立 Narrative QA 尚待審查）
>
> Scene / Dialogue task: `SC-COM03J-009` / `opening-feedback-20261003`。

## Status and boundary

- Production stage: `content_writer / scene_dialogue`；一幕 Script Lock（Locked Scene），等待 `content_qa / narrative_review` 採用。
- Upstream Narrative Design: `ND-COM03J-004`；approved contract 與 beat／choice intent 不變。
- Memory ownership intent: `common`。以下確立本幕 authoring node／choice IDs，尚未寫入 runtime／save／Memory contract。
- 本幕不綁 CG、cover 或 visual asset；只有 Semantic Visual Beat。敘事預覽 integration、Human narrative-preview review、後續 visual gates 皆 pending。
- COM-02J Human 決定只批准該前事，不批准本幕；不宣稱實測 first-play 時長。

## Canonical inputs

- `docs/narrative/CONTENT_PRODUCTION_SPEC.md` — Narrative Design／Locked Scene／review boundary。
- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` — global POV／heroine-spine L30–64、Jiang L71–147、COM-03J L330–348。
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` — graph IDs L29–41、state envelope L170–186、relationship axes L253–269、Jiang flags L290–311、knowledge L325–344、dependency row L355、implementation guardrails L688–704。
- `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_COMMON.md` — common opening L13–21、COM-03J L184–206。
- `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_JIANG_YUCHENG.md` — dramatic spine L13–32。
- `docs/narrative/scenes/vertical-slice/COM-02J.md` — approved immediate continuity L1–360、dialogue／state notes L409–456；其餘場景內容不作本幕新事實。

## Bounded supporting inputs

Voice／identity 只用 `content/characters/jiang_yucheng.json` L2–4、L53–56。前事狀態由 `content/production/narrative/opening-ch1/COM-02J.json` 綁定；`content/production/runs/com02j-m1-preview-20261002/HUMAN-COM02J-STORY-011.decision.json` 是前事 Human 決定。`docs/narrative/DIALOGUE_CALIBRATION.md` 只用作程序；本 packet 沒有批准樣本節錄，不讀 bank 或其他角色參考。完整 exact input identities／acquisition／writer sweep evidence 留在 ignored task cache。

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-03J.json`。
- Verified contract SHA-256: `582918460ef2cef867a9c009e97d003313c05e236c3d814af80fe68949c3c1ce`。
- Schema: `1.0.0`；JSON bytes 保持 approved ND 版本。本幕完成其 pre-dialogue outline 所要求的 dialogue，不把 JSON 內的 upstream-stage 狀態敘述改成下游 approval。
- Entry：`acquaintances_with_specific_shared_context`。已知姓名、她會畫圖及男主科技工作／可攜工作的有限資訊；有共同作品脈絡，尚無聯絡方式。
- Exit：`acquaintances_with_shared_interest_and_contact`。Discord 分享已發生，男主已接住一項當下內容，她在線上展開；各支自然收束，保留本次 reply style。
- Contract 的 scene function、character intent、knowledge timing、required payoffs、exit constraints 與 `must_not` 均為 binding；獨立 Narrative QA／preview／Human acceptance pending。

## Entry and scene premise

```yaml
requires:
  - COM-02J completed
  - player_knows_jyc_name == true
  - jyc_knows_player_name == true
  - jyc_creator_work_seen == true
forbids:
  - contact_jyc == true
```

Common sequence 為 `COM-02J → COM-03X → COM-03J → COM-03M`；COM-03X 只提供 sequence ID，不作本幕人物 knowledge 或 `contact_xu` gate。前事真正未完成／姓名未取得屬 entry failure，不能用 neutral callback 補造相識。

COM-02J 後的一個平日下午，在同一車站附近的咖啡店外短碰面。男主剛買完咖啡走出來，她路過時認出他、先開口。沒有中間約會、私下邀約或額外相處 montage。當晚回到男主自己的螢幕前，以 Discord 私訊接起推薦。

《折返月台》是本幕 task-local 虛構遊戲推薦；只呈現公開作品頁及兩張內容截圖。兩張圖都是同一個月台／候車區域：一張有站立與坐著的角色輪廓，另一張移動至柱子旁，站牌、指向出口的箭頭及地面反光仍可見。不新增作者／發售史／匿名創作或既有通關履歷。Meme 是她將同一張推薦截圖加文字後送出的訊息，非她的 creator 帳號或私人作品。

## Beat sheet

| Beat | Playable location | Semantic Visual Beat / payoff |
| --- | --- | --- |
| 03J.1 她先接回推薦 | `common_recommend_discord_jyc_enter` → `callback` | 咖啡店外認出男主，她先開口；依可信 history 只播一個 callback。 |
| 03J.2 有用途的交換 | `contact` | 她拿手機找作品頁、雙方同意加 Discord，確認可私訊。 |
| 03J.3 普通告別 | `offline_exit` | 她收手機，兩人各自離開。 |
| 03J.4 克制首訊息 | `first_message` | 當晚一則短訊息、作品頁與第一張截圖。 |
| 03J.5 接住當下內容 | `content_uptake` | 男主讀圖再回一項具體觀察；她補正他的局部誤讀。 |
| 03J.6 文字展開 | `analysis` → `meme` → `correction` | 第二張截圖、分析、meme、補充與自我更正分回合到達。 |
| 03J.7 小停頓 | `notice` | 男主停下打字，看見她仍在輸入；只觀察此刻節奏差異。 |
| 03J.8 她確認節奏 | `choice` → 三支 | 「我是不是講太多」；每支有她的反應及自己的道別。 |
| 03J.9 合流 | `exit` | 對話停住、螢幕保留推薦；一次 completion effects，不新增 exposition。 |

## Locked playable script

製作標籤 `Jiang Yucheng`／`Protagonist` 不是 spoken address。姓名已由 COM-02J 取得；當面不必每回合稱全名。`Discord — Jiang Yucheng` 是私訊 sender 語意標籤，不設定新 creator alias 或帳號字串。時間標記只呈現故事時間。所有 callback variant 與 branch 是同一幕中的互斥局部分支。

### `common_recommend_discord_jyc_enter`

**Semantic Visual Beat**：男主拿著剛買的咖啡走出店門；雨澄在門外認出他，停下來先開口。

**Narration**：我推開咖啡店的門，先把杯子換到另一隻手。門外有人停了一下。

**Jiang Yucheng**：欸，你好。

**Protagonist**：喔，妳好。

**Jiang Yucheng**：我回去找到了。上次在咖啡店聊完，我想到一個遊戲，一時忘了叫什麼。

**Protagonist**：嗯？哪個？

→ `common_recommend_discord_jyc_callback`

### `common_recommend_discord_jyc_callback`

**Selector**：按下方 Callback selector 表只執行一個完整 variant，再到 `common_recommend_discord_jyc_contact`。各版都在本次才提出新推薦。

#### Variant `her_art`

**Jiang Yucheng**：《折返月台》。裡面有個角色，坐著跟站著都很好認。我想到上次你問的那幾張動作。

**Protagonist**：看輪廓跟重心那個？

**Jiang Yucheng**：嗯。截圖比較好講，我找一下。

#### Variant `shared_visual_design`

**Jiang Yucheng**：《折返月台》。上次說亮的地方少一點，視線才會過去——它有幾個畫面是這樣。

**Protagonist**：不是把整張拉亮。

**Jiang Yucheng**：對。我有留一張截圖。

#### Variant `shared_worldbuilding`

**Jiang Yucheng**：《折返月台》。它也是用畫面把環境分開，讓你知道現在在哪裡。

**Protagonist**：像上次說雨港的分區？

**Jiang Yucheng**：有一點那種感覺。場景不一樣，我找圖給你看。

#### Variant `shared_edition_value`

**Jiang Yucheng**：《折返月台》。我有留一張截圖，字看得清楚的。

**Protagonist**：這次不用拿反面教材了。

**Jiang Yucheng**：嗯，省得又要放大找字。

#### Variant `shared_neutral`

**Jiang Yucheng**：《折返月台》。上次說設定集的構圖跟色塊可以拿來參考，我想到它有幾張畫面可以一起看。

**Protagonist**：喔，好。是遊戲裡的畫面？

**Jiang Yucheng**：嗯，我有截圖。

#### Variant `general_praise`

**Jiang Yucheng**：《折返月台》。我有留截圖。這次不用關掉亂的圖層。

**Protagonist**：這次是完整的？

**Jiang Yucheng**：它的畫面啦，不是我的圖。月台那邊，我覺得你可以看一下。

#### Variant `neutral`

**Jiang Yucheng**：《折返月台》。也是看畫面細節會比較有意思的那種。我有留一張截圖。

**Protagonist**：喔，好。妳有連結嗎？

**Jiang Yucheng**：有，我找一下。

### `common_recommend_discord_jyc_contact`

**Semantic Visual Beat**：她在自己手機上找公開作品頁。男主仍拿著杯子，等她找完。

**Action**：她滑了幾下，停在作品頁。店門又開了一次，我往旁邊讓了半步。

**Jiang Yucheng**：我傳給你？這邊講可能講不完。

**Protagonist**：好啊。妳用 Discord 嗎？

**Jiang Yucheng**：有。你給我帳號就好。

**Action**：我把自己的 Discord 加好友資訊打開給她看。她送出邀請，我確認後接受。

**Protagonist**：有了。

**Jiang Yucheng**：那我晚上傳。截圖在電腦裡。

**Protagonist**：好，我再看。

→ `common_recommend_discord_jyc_offline_exit`

### `common_recommend_discord_jyc_offline_exit`

**Semantic Visual Beat**：雨澄收起手機；咖啡店門口重新讓出通道。

**Jiang Yucheng**：那我先走了。

**Protagonist**：嗯，掰掰。

**Jiang Yucheng**：掰掰。

**Narration**：她往車站那邊走。我換回拿咖啡的手，杯蓋上沾了一點水。

→ 當晚 `common_recommend_discord_jyc_first_message`

### `common_recommend_discord_jyc_first_message`

**Time**：20:48。

**Semantic Visual Beat**：Discord 私訊裡出現公開作品頁連結及第一張月台截圖，前後沒有其他新帳號／群組資訊。

**Narration**：晚上，Discord 跳出一則訊息。我把手邊的視窗縮小。

**Discord — Jiang Yucheng**：下午說的遊戲。這張是月台那邊，你可以先看圖。

**Message attachment**：《折返月台》公開作品頁連結；第一張截圖：月台立柱旁一個站著的角色、候車椅上一個坐著的角色；遠處出口亮著，地面留有反光。

**Action**：我點開連結，再把截圖放大。角色的臉只佔一小塊，站姿跟坐姿倒很清楚。

→ `common_recommend_discord_jyc_content_uptake`

### `common_recommend_discord_jyc_content_uptake`

**Protagonist — message**：後面坐著那個，就算臉看不清楚也認得出來。手的位置差很多。

**Discord — Jiang Yucheng**：對，他一直把手夾在膝蓋中間。

**Protagonist — message**：前面站著的，看起來快走到出口了。

**Discord — Jiang Yucheng**：他其實站著沒動。那個亮的地方有點騙人。

**Protagonist — message**：喔，我剛剛以為他在往外走。

→ `common_recommend_discord_jyc_analysis`

### `common_recommend_discord_jyc_analysis`

**Semantic Visual Beat**：第二張公開內容截圖接著出現；同一月台中視點已移至立柱旁，人物、站牌、箭頭和反光可以對照。

**Discord — Jiang Yucheng**：看這張。換個位置，出口就沒那麼搶眼了。

**Message attachment**：第二張同一場景截圖，站牌及地上的箭頭更容易分辨，出口亮處被柱子遮住一部分。

**Discord — Jiang Yucheng**：第一張很容易先看到出口，再看人。但地上那個箭頭是往另一邊，跟亮的地方方向相反。

**Protagonist — message**：真的欸。我一直看上面那塊亮的，沒看到箭頭。

**Discord — Jiang Yucheng**：我也是第二次才看到。第一次以為路很好找。

**Discord — Jiang Yucheng**：然後走錯。

**Protagonist — message**：所以那個光不是帶路用的？

**Discord — Jiang Yucheng**：不一定。那只是出口的燈。要往哪邊走，還是要看箭頭。

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

**Discord — Jiang Yucheng**：而且亮的地方也不是沒用。它在地上留了一條反光，剛好把站著那個人的腳分出來。

**Protagonist — message**：難怪背景也很暗，還是看得清楚人在哪。

**Discord — Jiang Yucheng**：對。要是全部都亮，就看不到這個差別了。

**Discord — Jiang Yucheng**：等一下，我剛剛說第一次以為路很好找，講得不太對。

**Discord — Jiang Yucheng**：是我看到出口亮著，就以為一定能往那邊走。路其實一直有標，是我沒看。

**Protagonist — message**：我也看錯了。剛剛一直覺得他在走，現在看手又不像。

**Discord — Jiang Yucheng**：嗯，你再看他手的位置就會發現。他站得滿僵的。

→ `common_recommend_discord_jyc_notice`

### `common_recommend_discord_jyc_notice`

**Semantic Visual Beat**：男主停下打字，兩張截圖與分段到達的訊息仍在對話中。

**Narration**：我本來想回一個「嗯」，游標停了一下。她已經又補了一句，還把自己前面說的話改掉了。

**Narration**：下午在門口，她說截圖在電腦裡就收起手機。現在我往上滑，才發現已經聊了這麼多。

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

**Mainline completion intent**：`contact_jyc=true`；`relationship.jyc.familiarity +=1`，一次；保存所選 `jyc_com03j_reply_style`。

**Replay completion intent**：結束本幕 replay-local flow；丟棄 local choice mutation，返回 Memory，不寫主線。

→ Mainline structural successor `COM-03M`；由全局 sequence 檢查其完整前置，本幕不設 `open_dating_unlocked`。

## Callback selector

`common_recommend_discord_jyc_callback` 不是 choice。Selector 輸入是各自具可信 provenance 的 scene-local history。Mainline 用目前這次 playthrough 的 COM-02J／COM-01J 記錄；Memory 只用 replay-local snapshot。Unknown／missing／untrusted 不從數值、其他 choice 或 live 主線推回。

| Trustworthy local `jyc_second_topic` | Trustworthy local `jyc_first_topic` | Execute only | Then |
| --- | --- | --- | --- |
| `her_art` | 不使用 | `her_art` | `contact` |
| `shared_work` | `visual_design` | `shared_visual_design` | `contact` |
| `shared_work` | `worldbuilding` | `shared_worldbuilding` | `contact` |
| `shared_work` | `edition_value` | `shared_edition_value` | `contact` |
| `shared_work` | 缺失／未知／不可信 | `shared_neutral` | `contact` |
| `general_praise` | 不使用 | `general_praise` | `contact` |
| 缺失／未知／不可信 second topic | 任意，不使用 | `neutral` | `contact` |

Second topic 有效時不被 first topic 覆蓋；shared_work 本身不證明 first topic。`general_praise` 只回扣關圖層的幽默，不借用 her_art 深聊。Neutral 不聲稱前次特定 choice。Selector read-only，不回填任何 topic；選哪個 callback 都到同一個有用途的 Discord exchange。

## Choice / rejoin contract

| Stable choice ID | Reply style | 本支完成的當地反應與道別 | Next initiative residue（給後續 writer／integrator） |
| --- | --- | --- | --- |
| `com03j_continue_content` | `continue_content` | 她接著說站牌／線條，允許男主沒看懂及她自己可能想多；較晚由男主提休息，雙方晚安。 | 可較直接接續作品分享；不推定隨時有空。 |
| `com03j_warm_close` | `warm_close` | 她收到今晚想休息的意思、停止加圖，雙方晚安。 | 下次分享可先用一則短訊息確認節奏；沒有數值懲罰。 |
| `com03j_save_for_later` | `save_for_later` | 她把已發資料留在對話，讓男主自己看，雙方晚安。 | 先留這個題目空間；之後可簡短確認或換一小點，不催進度。 |

全部 rejoin `common_recommend_discord_jyc_exit`；共同出口只記對話停在晚安和資料仍在，不插入另一支的聊晚／未承諾的下次時間。各支 stats 均為 `0`，必要 online uptake／analysis 在 choice 前已成立。

## Runtime mapping

此節是 authoring-to-runtime 的確切規格，尚無 wiring／runtime QA。表內 shorthand `enter` 等都指完整前綴 `common_recommend_discord_jyc_`，`COM-03M` 為 scene-level structural target，後續 integrator 才解析其 entry node。

| Authoring node suffix | Next / selector | Local state / effect timing |
| --- | --- | --- |
| `enter` | `callback` | 無 mutation。 |
| `callback` | 執行七個 variant 中一個 → `contact` | Read-only `jyc_second_topic`；只有可信 `shared_work` 才再讀 `jyc_first_topic`。 |
| `contact` | `offline_exit` | 演出交換及接受好友；state finalization 留到 `exit`，勿另加 F。 |
| `offline_exit` | `first_message` | 明確時間轉換，沒有 knowledge bonus。 |
| `first_message` | `content_uptake` | 推薦頁／第一張圖已收到。 |
| `content_uptake` | `analysis` | 男主具體回應成立於本幕可見資料。 |
| `analysis` | `meme` | 第二張圖／分析已收到。 |
| `meme` | `correction` | 同一推薦的 meme。 |
| `correction` | `notice` | 補充與自我更正，無私人身份 reveal。 |
| `notice` | `choice` | POV 只記當下文字節奏。 |
| `choice` | 三個 `com03j_*` choice 按下方 Exact choice target 映射到各 branch | 記錄本次局部選擇，尚不向主線 commit。 |
| `continue` | `continue_close` | Local reply style `continue_content`。 |
| `continue_close` | `exit` | 本支普通晚安，保留時間差異。 |
| `warm_close` | `exit` | Local reply style `warm_close`；本支晚安。 |
| `save_for_later` | `exit` | Local reply style `save_for_later`；本支晚安。 |
| `exit` | Mainline `COM-03M`；replay 返回 Memory | 只在 mainline completion 執行以下一次效果。 |

Exact choice target：`com03j_continue_content → common_recommend_discord_jyc_continue`；`com03j_warm_close → common_recommend_discord_jyc_warm_close`；`com03j_save_for_later → common_recommend_discord_jyc_save_for_later`。七個 callback variants inline 在 `callback` node 下，非七個連續 nodes，也非新的玩家選項。

```yaml
set_on_mainline_completion_once:
  contact_jyc: true
  relationship.jyc.familiarity: increment 1
  jyc_com03j_reply_style: chosen continue_content | warm_close | save_for_later
choice_local_stats:
  com03j_continue_content: { familiarity: 0, trust: 0, chemistry: 0, compatibility: 0 }
  com03j_warm_close: { familiarity: 0, trust: 0, chemistry: 0, compatibility: 0 }
  com03j_save_for_later: { familiarity: 0, trust: 0, chemistry: 0, compatibility: 0 }
read_only_callback:
  - jyc_second_topic
  - jyc_first_topic  # only trustworthy shared_work detail
preserve_entry_values:
  - player_knows_jyc_name/jyc_knows_player_name/jyc_creator_work_seen
  - relationship.jyc.trust/chemistry/compatibility/romanticSignal
  - jyc_alias_private/jyc_alias_exposed
  - jyc_seen_in_element/jyc_home_space_comfort
  - all repair/pressure flags
  - focusHistory/recentFocus/lastMajorDate
  - exclusivity/deception and all other-character knowledge
```

`F_JYC` 在 contract 中對應 runtime `relationship.jyc.familiarity`；本幕僅 base +1。`jyc_com03j_reply_style` 是 contract-approved proposed runtime enum，用於下一次 initiative 語意；不宣稱已接入 engine。`preserve_entry_values` 保留現值，不能全部強制 false。只有本幕實際傳圖、回覆與同意管道的 knowledge 成立，不新增 creator alias、職稱、住處或其他人知識。

Mainline completion 必須用既有 scene completion 去重機制；中途 save／reload 需保留當地 node、callback variant 和所選 reply style，不能從 `contact` 或恢復 node 再加 F。已完成 scene 不再重授同一 increment。Memory replay 只讀 replay-local history，local flags／reply style／stats 在 replay 範圍內，離開時不寫主線。若 replay 無 history snapshot，選 `neutral`，不是讀 live state。這些是後續 integration 的必要檢查，writer 不聲稱已測試 engine/save 行為。

## Verification boundary

Writer 已完成一次 bounded continuous-dialogue naturalization sweep，exact draft／final hashes 與修改 evidence 留在 ignored cache。Own-stage source／contract／callback／mapping checks 與機器 production/schema/storage/diff 結果由 structured Handoff 報告。這不代替 fresh independent `content_qa / narrative_review`，也不批准 Human playable story。後續先 Narrative QA，再按 accepted scene 做 narrative preview；本 pass 無 runtime／CG／camera／render／Human 決策變更。
