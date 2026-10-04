# COM-02J — 咖啡店重逢／初遇

> **Rendering boundary:** this LOCKED scene owns narrative, state, dialogue and semantic visual beats. Render-ready framing belongs to the canonical CG planning stage; historical 9:16, sprite and composite notes do not bind new production art.

## Status and binding

- Production stage: **Scene/Dialogue — Script Lock / LOCKED**. This is the authored scene for the approved COM-02J Narrative Continuity Contract; independent Narrative QA, visual-impact review and Human narrative-preview review are pending.
- Approved design/source scene: this file's pinned predecessor, Git blob `9de22cbb30350bffc63d66eb1b5432156cd9f2ce`.
- Scene ownership: bookstore go → COM-01J → this cafe on the **same outing**, without another cafe choice. Bookstore skip + cafe go → this cafe as a **first meeting**. Bookstore skip + cafe skip bypasses this scene: `met_jiang_yucheng=false`, no names, topic or contact.
- Immediate continuity: COM-01B supplies only the ordinary clue that an exit has a cafe upstairs. COM-01J, if played, supplies the actual north-exit cafe recommendation and the spoken 《逆光航路》 topic. The approved COM-03M contacted-Jiang payoff names Discord, so an actual contact exchange here uses Discord. This scene adds no COM-03M conversation or COM-03J instruction.

## Canonical inputs

- `content/production/narrative/opening-ch1/COM-02J.json` — approved scene contract
- `content/production/narrative/opening-ch1/COM-01B.json` — visit decision and Xu's limited clue
- `content/production/narrative/opening-ch1/COM-01J.json` — actual bookstore knowledge
- `docs/narrative/scenes/vertical-slice/COM-01J.md` — immediate bookstore scene source for independent callback verification
- `content/production/narrative/opening-ch1/COM-03M.json` — Discord channel compatibility only
- `docs/art/characters/jiang-yucheng.md#L11-L62` — task-bounded character voice
- `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_COMMON.md` — immediate scene intent; this pass read only lines 136–160
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` — knowledge boundary; this pass read only lines 296–328
- `docs/narrative/NARRATIVE_INTERACTION_AND_STORY_MAP_SPEC.md` — action/knowledge authority; this pass read only lines 154–238 and 304–375
- Pinned predecessor `docs/narrative/scenes/vertical-slice/COM-02J.md` — compatible go-path dialogue and semantic beats

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-02J.json`
- Contract SHA-256: `f2cddc0d4c99c938cddd95d8cef543911135d4991de049a4ef9247221ce02106` (Git blob `c5c62394ecef934ff96159768a70c8787125730f`).

At entry, bookstore-go characters have just discussed a real work and remain unnamed acquaintances; bookstore-skip characters are strangers. The protagonist enters for his own rest, reading or work. Jiang is drawing her own character and owes him no conversation. Actual cafe interaction establishes both names, a particular shared-interest discussion, a question in each direction, and a brief interval of parallel activity. Contact is possible only after the local discussion and an explicit, mutually accepted exchange. The exit is an ordinary acquaintance with or without a usable channel, never a date or a romantic verdict. Her anonymous identity, precise job, home and commissions stay unknown. The skip-cafe route has no COM-02J event at all.

## Scene flow and semantic visual beats

| Path | Entry → shared work → exit | Semantic visual beat |
| --- | --- | --- |
| Bookstore go | `common_station_cafe_jyc_enter` → `common_station_cafe_jyc_drawing` → `common_station_cafe_jyc_names` → `common_station_cafe_jyc_choice` → `common_station_cafe_jyc_parallel` | Open seat/outlet, her focused drawing, recognition and her chosen greeting, consent to sit, then separate screens. |
| Bookstore skip + cafe go | `common_station_cafe_jyc_first_enter` → `common_station_cafe_jyc_first_drawing` → `common_station_cafe_jyc_first_names` → `common_station_cafe_jyc_first_choice` → `common_station_cafe_jyc_parallel` | Cafe sign above the exit, an ordinary free seat, her visible composition, a stranger's cautious response, consent to sit, then separate screens. |
| Either actual meeting | `common_station_cafe_jyc_parallel` → `common_station_cafe_jyc_reciprocity` → `common_station_cafe_jyc_share` → `common_station_cafe_jyc_contact_choice` → `common_station_cafe_jyc_exit` | Each works independently; she asks about his work; a specific observation creates a reason to share; departure is calm on either outcome. |

The first-meet branch has no recognition shot or bookstore callback. The reunion retains the creator-focus → recognition beat. If later visual planning uses one shared drawing/work image, the first-meet presentation must omit any recognition meaning. No random availability roll or extra empty-cafe route exists.

## Locked playable script

### Bookstore-go reunion

#### `common_station_cafe_jyc_enter`

**Semantic Visual Beat**：我先確認空位、插座與窗邊區域，再找可坐下翻書、處理事情的位置。

**Narration**：剛才在書店翻過的那幾頁還在腦子裡。我本來就想找個地方坐下，順便回掉手上的事。

**Narration**：她說的北邊出口咖啡店就在上面。窗邊還真有空位。

**Action**：我拿著筆記本電腦包走向窗邊，才看見熟悉的短髮側影。

#### `common_station_cafe_jyc_drawing`

**Semantic Visual Beat**：雨澄低頭畫圖，平板上是她正在處理的虛構角色構圖；她停筆抬眼，認出我，猶豫片刻後自行開口。

**Narration**：她在畫圖。不是隨手記幾筆；幾個相似輪廓排在一起，旁邊還有反覆調整過的色塊。

**Action**：她停筆喝水，抬眼看見我。我們的視線碰上。她停了兩秒。

**Jiang Yucheng**：欸。你也上來了。那本後來有買嗎？

**Protagonist**：還在想。先上來坐一下。妳說這裡好坐，是真的。

**Jiang Yucheng**：我可沒保證這個時間也安靜。

**Protagonist**：目前還算過關。

#### `common_station_cafe_jyc_names`

**Protagonist**：上次忘了問。我叫 [PLAYER_NAME]。

**Jiang Yucheng**：江雨澄。

**Action**：我們沒有握手。我指向她旁邊的空位。

**Protagonist**：這裡有人嗎？如果妳要專心，我坐別邊。

**Jiang Yucheng**：沒有人。我等一下還要畫，可能不太說話。

**Protagonist**：正好。我也要工作。

**Action**：我坐在斜對角，不直接面向她的平板電腦。

#### `common_station_cafe_jyc_choice`

這三個既有 choice ID 均可接到後面的共同興趣與聯絡行動；沒有正解。玩家只看見一個可信的 `com02j_continue_topic` 文案。

1. `com02j_ask_drawing` — 「這幾張是在抓同一個角色的動作嗎？」
2. `com02j_continue_topic` — 依下表顯示一個上次確實談過的切口。
3. `com02j_simple_praise` — 「看起來很厲害。線很乾淨。」

| Trustworthy replay-local COM-01J topic | Exact label and first spoken line |
| --- | --- |
| `visual_design` | 「妳這張夜景，也是在處理上次說的暗部嗎？」 |
| `worldbuilding` | 「這個角色的環境，看起來也有雨港那種分區。」 |
| `edition_value` | 「妳自己的圖，註釋會放到看得清楚嗎？」 |
| Missing, unknown or untrustworthy | 「上次那套設定集，妳畫自己的圖時也會拿來參考嗎？」 |

`com02j_continue_topic` reads only actual COM-01J history, including replay-local history. Its neutral version does not create `jyc_first_topic` or pretend a particular earlier choice. It never appears on the bookstore-skip route.

##### Branch `com02j_ask_drawing`

**Protagonist**：這幾張是在抓同一個角色的動作嗎？

**Semantic Visual Beat**：談話轉到她手上的角色動作練習。

**Jiang Yucheng**：嗯。要讓她換衣服、換姿勢，還是看得出來是同一個人。

**Protagonist**：所以先找不會變的地方。

**Jiang Yucheng**：輪廓、重心，還有她站著的習慣。臉反而不是第一個。

**Jiang Yucheng**：你怎麼看出來是同一個角色？

**Protagonist**：肩膀和手的位置很像。也可能我猜錯。

**Jiang Yucheng**：沒有，猜對了。

→ Rejoin `common_station_cafe_jyc_parallel`.

##### Branch `com02j_continue_topic`

**Variant — `visual_design`**

**Protagonist**：妳這張夜景，也是在處理上次說的暗部嗎？

**Jiang Yucheng**：有一點。但我不想把東西藏在黑色裡，所以亮的地方要更少。

**Protagonist**：讓視線自己走過去。

**Jiang Yucheng**：對。不是把整張圖拉亮。

**Variant — `worldbuilding`**

**Protagonist**：這個角色的環境，看起來也有雨港那種分區。

**Jiang Yucheng**：氣氛有參考，設定不是。她住的地方更乾，而且更窄。

**Protagonist**：所以不是同人圖。

**Jiang Yucheng**：不是。是我自己的。

**Variant — `edition_value`**

**Protagonist**：妳自己的圖，註釋會放到看得清楚嗎？

**Jiang Yucheng**：會。被那本機械稿氣過之後一定會。

**Protagonist**：這樣就不用靠猜字了。

**Jiang Yucheng**：對，反面教材。

**Variant — `neutral`**

**Protagonist**：上次那套設定集，妳畫自己的圖時也會拿來參考嗎？

**Jiang Yucheng**：會啊，像構圖、色塊怎麼放，我會翻一下。

**Protagonist**：這個角色也是裡面的？

**Jiang Yucheng**：不是，角色是我自己的。只是參考畫面怎麼安排。

→ Exactly one variant rejoins `common_station_cafe_jyc_parallel`.

##### Branch `com02j_simple_praise`

**Protagonist**：看起來很厲害。線很乾淨。

**Semantic Visual Beat**：雨澄以一個小笑回應普通稱讚。

**Jiang Yucheng**：還沒畫完。現在看起來乾淨，是因為我把亂的圖層關掉了。

**Protagonist**：我剛剛還以為快畫完了。

**Jiang Yucheng**：沒有，還早。

**Action**：她重新打開參考圖層，畫面變得複雜；她沒有急著證明自己。

→ Rejoin `common_station_cafe_jyc_parallel`.

### Bookstore-skip, cafe-go first meeting

#### `common_station_cafe_jyc_first_enter`

**Semantic Visual Beat**：出口上層有咖啡店；我選一處能休息和處理事情的座位，沒有尋人的視線。

**Narration**：剛剛沒去書店。許棠說過出口上面有咖啡，我走到這裡，剛好想坐一會兒，把訊息回完。

**Action**：窗邊還有空位。我先看桌面夠不夠放筆記本電腦，才注意到鄰桌有人在畫圖。

#### `common_station_cafe_jyc_first_drawing`

**Semantic Visual Beat**：陌生女孩專注調整自己角色的姿勢和色塊；只看得見公開朝向座位的一角，沒有偷看螢幕或認人。

**Narration**：她把平板轉了一點避開反光。畫面角落露出幾個相似的角色輪廓，動作卻不一樣。

**Protagonist**：不好意思，這個位子有人嗎？

**Jiang Yucheng**：沒有。你要插座的話，這邊有一個。

**Protagonist**：喔，謝謝。我坐這裡會不會擋到妳畫圖？

**Jiang Yucheng**：不會。我只是要調一下光。

**Action**：我坐在斜對角，打開自己的筆記本電腦。她把畫筆重新落到平板上。

#### `common_station_cafe_jyc_first_names`

**Protagonist**：剛剛那幾個姿勢，是同一個角色嗎？看得到一點，不方便說也沒關係。

**Jiang Yucheng**：是同一個。欸，剛才那張呢？我把重心畫偏了，現在在修。

**Protagonist**：我還以為是她要轉身跑。肩膀好像先動了。

**Jiang Yucheng**：有點接近。她是想回頭，又不想真的停下來。這個動作很難，畫太開就變成在擺姿勢。

**Protagonist**：原來差在這裡。我是 [PLAYER_NAME]。剛才問得有點突然。

**Jiang Yucheng**：江雨澄。沒事，你是看畫才問的。

**Action**：她把平板轉回自己的角度。我們各自坐好，沒有要求她把整張圖拿來看。

#### `common_station_cafe_jyc_first_choice`

這是本地表達分支，不讀 `jyc_first_topic`、不借 COM-01J 的三個 choice ID。三項都從當場可見的圖開始，也都接同一個後續分享機會。

1. `com02j_first_warm` — 「妳說她想回頭，這一下真的看得出來。」
2. `com02j_first_candid` — 「我剛剛以為她要跑，完全猜反了。」
3. `com02j_first_playful` — 「難怪我看了半天，替她急著找方向。」

**Warm**

**Protagonist**：妳說她想回頭，這一下真的看得出來。

**Jiang Yucheng**：嗯，肩膀如果再多轉一點，就太明顯了。我還在試。

**Candid**

**Protagonist**：我剛剛以為她要跑，完全猜反了。

**Jiang Yucheng**：也不算反。她本來就在走，只是腦袋還留在後面。

**Playful**

**Protagonist**：難怪我看了半天，替她急著找方向。

**Jiang Yucheng**：先別幫她選，我自己都還沒選好。

**Shared first-meet continuation**

**Jiang Yucheng**：你平常會看這種角色設定嗎？

**Protagonist**：會看一些。我本來想去找《逆光航路》的新版設定集，今天走到出口就先找地方坐了。角色怎麼用姿勢講故事，我滿愛看。

**Jiang Yucheng**：我也會翻設定集。可是有時候一頁塞太多註解，反而看不到人站在哪裡。

**Protagonist**：對。我會先看圖在講什麼，再回頭看字。妳這張剛好是我會停下來看的那種。

**Jiang Yucheng**：那我先把她的肩膀修好，不然你下次看還是會以為她要跑。

**Action**：她笑了一下，回去調那條線；我也把自己的訊息打完。

→ Rejoin `common_station_cafe_jyc_parallel`.

### Shared continuation after either actual meeting

#### `common_station_cafe_jyc_parallel`

**Semantic Visual Beat**：雨澄用平板，我用筆記本電腦，在窗邊各自工作，座位並不正面相對。

**Narration**：接下來十幾分鐘，我們各自看著自己的螢幕。

**Narration**：她改了幾次線。我回完兩封訊息。沒有人負責把沉默變成話題。

**Audio**：咖啡機、遠處人流、畫筆輕觸聲。

**Action**：我闔上筆記本電腦，準備收東西；雨澄先抬頭。

#### `common_station_cafe_jyc_reciprocity`

**Jiang Yucheng**：你的工作都可以這樣帶著走？

**Protagonist**：大部分。我在科技公司工作，像剛剛那些就能在外面處理。

**Jiang Yucheng**：那你回家是不是也在做？

**Protagonist**：嗯，有時候回家還是會打開電腦。

**Jiang Yucheng**：那好像也沒比較輕鬆。

**Protagonist**：是啊。妳那個角色呢，剛才那幾張都要用在同一頁？

**Jiang Yucheng**：還不知道。我想先讓她站得像同一個人，再決定哪張放進去。

**Semantic Visual Beat**：雨澄抬頭主動問工作能否帶著走；我也回問她眼前的創作，兩人的注意力各有來處。

#### `common_station_cafe_jyc_share`

**Condition — bookstore go**

**Protagonist**：剛剛在書店聽妳講版本差異，再看這幾張，我有點懂妳為什麼會在意畫面要先讓人看懂。

**Jiang Yucheng**：也不是每張都要一眼看完啦。至少第一眼別讓人找不到主角。

**Condition — bookstore skip**

**Protagonist**：我剛才真的把她看成要跑的人。聽妳講完，再看肩膀就不一樣了。

**Jiang Yucheng**：我也還在試。你講的「先看圖再看字」滿有用，我等一下可以拿那個順序檢查一遍。

**Shared**

**Protagonist**：我有一頁公開的遊戲介紹，最近也在想畫面要先讓人看到哪裡。妳如果有興趣，可以傳妳看；妳這張之後想給人看，也有地方回我。

**Jiang Yucheng**：喔，遊戲頁？那跟我這張不太一樣，但我想看你怎麼排。

**Jiang Yucheng**：我那張改完，你會想看嗎？不用現在決定啦。

**Action**：我已經把包背起一邊；她也把畫筆擱下，沒有催我留下。

#### `common_station_cafe_jyc_contact_choice`

這是實際行動選擇，兩個入口與所有先前話題／表達版本都可見；沒有分數、語氣或術語門檻。

1. `com02j_offer_discord` — 「問她要不要用 Discord 交換作品連結。」
2. `com02j_leave_without_contact` — 「婉拒現在交換帳號，先道別。」

##### `com02j_offer_discord` — mutual agreement and actual exchange

**Protagonist**：要不要用 Discord？我可以把那頁遊戲介紹傳給妳；妳想分享那張圖的時候再傳就好。

**Jiang Yucheng**：可以啊。不過那張我還要修，可能不是今天。

**Protagonist**：沒問題，我先把我的帳號給妳？

**Jiang Yucheng**：好，我加你。

**Action**：我打開自己的 Discord 聯絡頁，讓她確認帳號；她用自己的帳號送出好友邀請。我看到邀請，按下接受，並把公開遊戲頁連結傳進同一個對話。

**Jiang Yucheng**：收到了。我晚點看，不保證馬上回。

**Protagonist**：好，妳慢慢看。

→ Rejoin `common_station_cafe_jyc_exit` with `contact_jyc=true` only after the invitation is accepted and the channel is usable.

##### `com02j_leave_without_contact` — ordinary non-exchange

**Protagonist**：謝謝，先不用傳給我啦。今天聊到這裡就很好。

**Jiang Yucheng**：好啊，沒關係。謝謝你剛剛聊我的圖，還有遊戲頁的事。

**Protagonist**：我也謝謝妳講那張圖。

→ Rejoin `common_station_cafe_jyc_exit` with `contact_jyc=false`. He declines the offered sharing in ordinary terms; the page was a topic, not sent, and neither person owes a later meeting.

#### `common_station_cafe_jyc_exit`

**Condition — `contact_jyc=true`**

**Protagonist**：今天謝謝妳讓我坐這裡。

**Jiang Yucheng**：不會，反正有空位。我看完那頁再回你。

**Shared**

**Action**：我背起筆記本電腦包。雨澄把畫筆放回筆槽。

**Protagonist**：那妳慢慢畫，我先走了。

**Jiang Yucheng**：好，掰掰。

**Semantic Visual Beat**：窗邊留下空位；她可繼續自己的畫，沒有追出店外的告白或被拒絕的特寫。

## Choice, state and successor mapping

| Entry/action | Fact established | State effect |
| --- | --- | --- |
| Bookstore go, after completed COM-01J | Mandatory same-visit reunion; she recognizes him and initiates greeting | Preserve `met_jiang_yucheng=true`, `heard_station_cafe_from_jyc=true`, trustworthy `jyc_first_topic`; set `jyc_initiated_second_contact=true` at her greeting. |
| Bookstore skip + cafe go | One actual first encounter; no earlier Jiang context | Set `met_jiang_yucheng=true` on actual encounter; leave `heard_station_cafe_from_jyc=false` and `jyc_initiated_second_contact=false` or unset. Do not create `jyc_first_topic`. |
| Either actual encounter, drawing and name exchange | Her own character work is visible; both say their names | Set `jyc_creator_work_seen=true`, `player_knows_jyc_name=true`, `jyc_knows_player_name=true` after the corresponding on-screen events. |
| Reunion `com02j_ask_drawing` | Her art is discussed | `jyc_second_topic=her_art`; keep legacy `T_JYC +1` as local texture/telemetry only. |
| Reunion `com02j_continue_topic` | Actual COM-01J topic or neutral shared book is discussed | `jyc_second_topic=shared_work`; keep legacy `F_JYC +1` as local texture/telemetry only. |
| Reunion `com02j_simple_praise` | Praise leads to her own concrete explanation | `jyc_second_topic=general_praise`; keep legacy `C_JYC +1` as local texture/telemetry only. |
| First-meet `com02j_first_warm` / `com02j_first_candid` / `com02j_first_playful` | Same observed posture, character and shared-interest facts | `jyc_second_topic=her_art` from the spoken drawing discussion for all three; no `jyc_first_topic` or numerical gate. |
| Shared parallel work and reciprocity | She asks about portable work; he says he works in a technology company; he asks about her drawing | The limited work and craft knowledge is available afterward on both actual-meeting routes. Apply existing actual-encounter familiarity baseline, never as contact eligibility. |
| `com02j_offer_discord` | She agrees, sends a Discord request; he accepts; the page is sent | Set `contact_jyc=true` only after that exchange. Discord is the actual usable channel for subsequent contacted-Jiang content. |
| `com02j_leave_without_contact` | Ordinary goodbye; no account, invitation or page transfer | `contact_jyc=false`; no RE, `romanticSignal`, negative relationship effect or forced later encounter. |
| Bookstore skip + cafe skip | COM-02J is bypassed altogether | `met_jiang_yucheng=false`, no names, `jyc_creator_work_seen=false`, `contact_jyc=false`; no COM-02J choice history. |

The established go-path `common_station_cafe_jyc_*` and three `com02j_*` topic identities remain stable. Contact action IDs and `common_station_cafe_jyc_first_*` nodes are new, scene-local IDs. `jyc_alias_private`, `jyc_alias_exposed`, `relationship.jyc.romanticSignal` and all other-character knowledge remain unchanged. F/T/C counters, if retained for existing telemetry, never decide whether the contact choice appears. Replay reads only its local COM-01J snapshot. A missing snapshot uses the neutral reunion text, not another run's choice. The skip route never reads it.

Both actual-meeting exits supply truthful names and one discussed topic for the later branch. Only the contacted exit supplies Discord and a sent game-page link; a later recommendation must be newly spoken when used. The noncontact exit carries no latent permission to message her. The never-met route bypasses Jiang events and may reach common continuation only with its real Xu/personal-life facts. COM-03J remains a separate bounded successor review; this file does not claim that old successor prose has been repaired.

## Writer checks and handoff boundary

- Checked both entries against the approved COM-01B/COM-01J facts: no first-meet recognition, bookstore purchase, cafe recommendation or past topic is invented; bookstore go continues on the same outing.
- Checked all local expression/topic branches and the common rejoin: each supplies an observed work detail and reaches the same two contact actions. The channel is actually exchanged only on explicit mutual assent; ordinary departure leaves no contact.
- Performed one bounded naturalization read of the continuous dialogue: ordinary hesitation, correction and work silence remain; names, craft discussion, reciprocal question and page-sharing proposal arise in that order. The existing go-path lines and semantic beats are retained where their facts still fit.
- `git diff --check` and handoff/preflight verification are mechanical checks only. Independent Narrative QA, visual-impact review and Human preview remain separate gates.
