# COM-02J — 咖啡店重逢／初遇

## Current authorized weekend/weekday design — ND-ARC-001

- Lifecycle: **CANONICAL** task-local Narrative Design amendment, 2026-10-04. Source ref: `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9`. Human 授權本輪方向與必要改寫；ND-ARC-001 design pass 本身沒有新 final prose、QA、runtime 或 CG acceptance。
- Owning design: `docs/narrative/JYC_WEEKEND_WEEKDAY_REVISION.md`；current contract: `content/production/narrative/opening-ch1/COM-02J.json`。此 design section 與 current JSON 擁有本輪時序／gate；下方是本輪新 Script Lock，相容舊台詞保留，舊 binding 僅列於歷史識別段，不作 current approval。
- 平日重逢談書／初遇談畫：四個 dialogue unit 之一。改為週末後平日下午工作疲累出門。重逢先禮貌問可否坐附近，聊週末實際購買之書與真正 first topic；初遇保留當下畫圖話題與陌生距離，僅改週末 skip／今天走到出口的舊 framing。兩支各自取得坐位同意、名字、具體話題，平行做事與互問後可實際交換 Discord；保留普通不交換出口。全接當晚 COM-03X。重逢仍可看到她在畫圖，但主話題是書；不要僅為 COM-03J 舊 callback 加虛假構圖討論。
- Stable ID plan：不需新前綴；保留 common_station_cafe_jyc_*／first_*、com02j_* topic／contact action IDs。
- 永久排除：本輪 `com01b_weekday_street_walk` 才寫 `jyc_permanently_excluded=true`。此 flag 先於 contact/history，永不由 merge、reload、scheduler、public shared scene 或 ordinary invite 清除。Memory replay 限自己的 snapshot，不向 live 主線寫入；改走前一分岔屬另一 playthrough，不是本輪 reopening。
- Semantic visual impact 與四個必要 dialogue units 見 owning design；現有 accepted image bytes、QA/Human 歷史都保留。獨立下游才裁決哪些畫面可重用。

## Current Script Lock — CW-COM-02J-001

> **Rendering boundary:** this LOCKED scene owns narrative, state, dialogue and semantic visual beats. Render-ready framing belongs to the canonical CG planning stage.

## Status and binding

- Production stage: **Scene/Dialogue — Script Lock / LOCKED**. Writing task `CW-COM-02J-001`: **PASS** against the approved contract. Independent Narrative QA: **PENDING**; visual-impact review / Visual QA: **PENDING**; runtime integration: **PENDING**; Human narrative-preview / final playable acceptance: **PENDING**.
- Run: `jyc-weekend-weekday-20261004`; harness `content_writer` v1.4.1, pass `scene_dialogue`; workflow v1.3.1. Dispatched source ref: `26c264c010994be2328bb45a09ece2c755bad9c6`; input scene Git blob: `fceadbbeddbf3c71fefa5869f16130254fcc2a0f`.
- Approved design: `ND-COM-02J-001`, exact decision Git blob `8618e60439ce638b8e5c805d2b9dec9f3e493d71`; owning arc `docs/narrative/JYC_WEEKEND_WEEKDAY_REVISION.md`. Human direction authorizes this rewrite, not later QA or acceptance.
- Scene ownership: following-weekday afternoon, after home work and fatigue. Weekend bookstore go → cafe reunion; weekend home + `com01b_weekday_cafe_first` → cafe first meeting. The upstream street branch bypasses this scene permanently. Every cafe exit returns home and hands off to **COM-03X**, the same weekday evening package event.

## Canonical inputs

- `content/production/narrative/opening-ch1/COM-02J.json` — approved Narrative Continuity Contract.
- `docs/narrative/NARRATIVE_INTERACTION_AND_STORY_MAP_SPEC.md` — narrative interaction and Story Map rules.

### Source-usage provenance

Only the packet's sources: the approved COM-02J contract and decision; this scene's dispatched predecessor; the task-local weekend/weekday amendment; Jiang's canonical profile; the Narrative Interaction and Story Map Spec; narrative continuity schemas and Production Workflow Tools. Other scenes, runtime, voice bank, CGs and images were not acquired. Immediate predecessor/successor facts are used only as supplied by the approved contract and amendment.

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-02J.json`
- Contract SHA-256: `0bc3e9ba29ca3d2dadc0d9f258fd8dba27f2bee0fa508b410363bba784b09ae3` (Git blob `bfcd20c4279079c4ab1676061edc99ddb0ca2371`). Contract bytes unchanged by this writing pass.

The reunion has a weekend bookstore encounter, an actual world-setting supplement purchase and no prior name/contact exchange. The first meeting has none of those Jiang facts. Both enter for rest or their own work, ask to sit nearby, receive permission, exchange names, discuss a concrete subject and spend time doing separate things. Contact requires an explicit proposal, assent and a completed Discord exchange. Either result remains ordinary acquaintance, with no date, alias reveal, romantic verdict or promised future encounter.

## Exact branch selectors

The following executable authoring selector is a deterministic projection for the integrator, **not an engine patch or new persistent state**. `choiceHistory` is the current playthrough / replay snapshot's node-to-choice-ID map; `flags` is that same snapshot. `trustworthyFirstTopic` is supplied only from verified actual COM-01J history, never another run or live-state fallback. Missing topic selects `neutral`; missing/contradictory entry evidence must block integration rather than invent a meeting.

```js
function selectCom02j({ flags, choiceHistory, trustworthyFirstTopic,
  bookstoreEverEarned, initialEncounterEverEarned }) {
  if (flags.jyc_permanently_excluded === true && !initialEncounterEverEarned) return null;
  if (typeof flags.jyc_permanently_excluded !== 'boolean') {
    throw new Error('COM-02J: missing exclusion guard');
  }
  const chosen = new Set(Object.values(choiceHistory));
  if (chosen.has('com01b_weekday_street_walk') && !bookstoreEverEarned) return null;
  if (bookstoreEverEarned === true) {
    const topics = ['visual_design', 'worldbuilding', 'edition_value'];
    return {
      entryNode: flags.weekend_book_purchased === true
        ? 'common_station_cafe_jyc_enter' : 'common_station_cafe_jyc_enter_02',
      route: 'weekday_reunion_after_weekend_bookstore',
      continueTopicVariant: topics.includes(trustworthyFirstTopic)
        ? trustworthyFirstTopic : 'neutral',
      exitScene: 'COM-03X'
    };
  }
  if (!chosen.has('com01b_weekday_cafe_first')) return null;
  if (flags.met_jiang_yucheng === true || flags.contact_jyc === true ||
      flags.heard_station_cafe_from_jyc === true) {
    throw new Error('COM-02J: first meeting has prior Jiang evidence');
  }
  return {
    entryNode: 'common_station_cafe_jyc_first_enter',
    route: 'weekday_first_after_weekend_home',
    continueTopicVariant: null,
    exitScene: 'COM-03X'
  };
}
```

Evaluate the selector at fresh scene entry, not again after a first-meet event has set `met_jiang_yucheng=true`; save/resume must preserve the already selected route from its own actual history. Every authored node requires a non-null selection and the shared effective exclusion guard: local street exclusion blocks only while no genuinely earned initial encounter (bookstore or cafe first) exists. Cafe reunion requires `bookstoreEverEarned`; eligibility never supplies local purchase, recommendation, topic or contact facts. `route` and `continueTopicVariant` below refer to this transient selection; they do not introduce saved flags. A street selection never acquires a cafe node, name, topic, contact or later Jiang content. Street prose/state is owned upstream and is not rewritten here.

## Scene flow and semantic visual beats

| Path | Entry → local conversation → shared body | Semantic visual beat |
| --- | --- | --- |
| Weekend bookstore go | `common_station_cafe_jyc_enter` → `common_station_cafe_jyc_drawing` → `common_station_cafe_jyc_names` → `common_station_cafe_jyc_choice` → `common_station_cafe_jyc_parallel` | Weekday daylight; recognition after days, purchased book, explicit permission before sitting; book pages carry the main conversation while her own drawing remains visible. |
| Weekend home + weekday cafe | `common_station_cafe_jyc_first_enter` → `common_station_cafe_jyc_first_drawing` → `common_station_cafe_jyc_first_names` → `common_station_cafe_jyc_first_choice` → `common_station_cafe_jyc_parallel` | Work fatigue precedes entry; nearby seat, visible drawing, no recognition or bookstore memory; permission precedes sitting. |
| Either actual meeting | `common_station_cafe_jyc_parallel` → `common_station_cafe_jyc_reciprocity` → `common_station_cafe_jyc_share` → `common_station_cafe_jyc_contact_choice` → `common_station_cafe_jyc_exit` → COM-03X | Separate work, reciprocal interest, optional actual phone exchange; ordinary daylight departure and return home before the evening package event. |

Changed semantic beats: reunion after days instead of one outing; purchased world-setting supplement and book-centered discussion; weekday fatigue/daylight; route-specific book/drawing share bridge; direct home/package handoff. First-meet drawing, nearby-seat consent, parallel activity, reciprocal questions and actual contact consent retain their compatible meanings. Downstream independent review decides visual reuse; no image was inspected or accepted here.

## Locked playable script

### Bookstore-go reunion

#### `common_station_cafe_jyc_enter`

**Semantic Visual Beat**：我先確認空位、插座與窗邊區域，再找可坐下翻書、處理事情的位置。

**Narration**：在家盯著電腦一下午，出門後眼睛才舒服一點。我把週末買的《逆光航路》世界設定增補版也帶了出來，想換個地方翻幾頁。

**Narration**：週末她說的北邊出口咖啡店就在上面。窗邊還真有空位。

**Action**：我拿著筆記本電腦包走向窗邊，才看見熟悉的短髮側影。

#### `common_station_cafe_jyc_drawing`

**Semantic Visual Beat**：雨澄低頭畫圖，平板上是她正在處理的虛構角色構圖；她停筆抬眼，認出我，猶豫片刻後自行開口。

**Narration**：她在畫圖。不是隨手記幾筆；幾個相似輪廓排在一起，旁邊還有反覆調整過的色塊。

**Action**：她停筆喝水，抬眼看見我。我們的視線碰上。她停了兩秒。

**Jiang Yucheng**：欸，是你。

**Protagonist**：欸，這麼巧。

#### `common_station_cafe_jyc_names`

**Action**：我指向她旁邊的空位。

**Protagonist**：這裡有人嗎？我可以坐這邊嗎？如果妳要專心，我坐別邊。

**Jiang Yucheng**：沒有人，可以坐。我等一下還要畫，可能不太說話。

**Protagonist**：正好。我也有幾封訊息要回，回完再看書。

**Action**：我坐在斜對角，不直接面向她的平板電腦。

**Protagonist**：上次忘了問。我叫 [PLAYER_NAME]。

**Jiang Yucheng**：江雨澄。那本後來有買嗎？

**Protagonist**：有，買了世界設定增補版。週末回去翻了一些，今天也帶著。

**Action**：我從包裡拿出書，放在自己的桌面。

**Jiang Yucheng**：喔，那本。你看到雨港那邊了？

**Protagonist**：看到分區圖。我本來只想翻一下，結果一直對著地圖找舊版出現過的地方。

**Jiang Yucheng**：那張我也看很久。小字好多。

**Protagonist**：對。今天在家又盯了一下午電腦，眼睛有點累。妳說這裡好坐，是真的。

**Jiang Yucheng**：我可沒保證這個時間也安靜。

**Protagonist**：目前還算過關。

#### `common_station_cafe_jyc_choice`

這三個既有 choice ID 保留作本地話題行動（`action`，Local；可信週末 callback 為 Echo），不改為語氣評分。ID 中的 `ask_drawing` 是 compatibility identity，本輪實際切口為書頁視覺。三項均接相同聯絡機會；普通稱讚不是壞答案。玩家只看見一個可信的 `com02j_continue_topic` 文案。

1. `com02j_ask_drawing` — 「這張分區圖，妳會先看哪裡？」
2. `com02j_continue_topic` — 依下表顯示週末確實談過的切口，否則 neutral。
3. `com02j_simple_praise` — 「這本滿好看的。那張分區圖我翻了好幾次。」

| `continueTopicVariant` | Exact label and first spoken line |
| --- | --- |
| `visual_design` | 「上次妳說暗部別全看成黑的，我回去有再翻舊版。」 |
| `worldbuilding` | 「妳上次說雨港的分區，我在這本找到那張圖了。」 |
| `edition_value` | 「買回去看，這本那些地圖註解真的比較好找。」 |
| `neutral` | 「這本多了不少地方設定。妳有比較喜歡哪一段嗎？」 |

##### Branch `com02j_ask_drawing`

**Protagonist**：這張分區圖，妳會先看哪裡？

**Semantic Visual Beat**：我把自己買的書翻到雨港分區圖，放在自己的桌面，她願意抬眼看。

**Jiang Yucheng**：先看港邊，再往住宅區。它把很密的地方留在同一邊，另一邊反而空很多。

**Protagonist**：我一開始只顧著找地名，沒注意那個空的地方。

**Jiang Yucheng**：嗯，先別看字，會比較明顯。

**Action**：我把手指從註解移開，重新看了一遍。

**Protagonist**：喔，真的。我剛剛還以為這一塊是沒畫完。

**Jiang Yucheng**：不是漏畫啦。都塞滿的話，你反而不知道先看哪裡。

→ Set `jyc_second_topic=shared_work`; rejoin `common_station_cafe_jyc_parallel`.

##### Branch `com02j_continue_topic`

**Variant — `continueTopicVariant === 'visual_design'`**

**Protagonist**：上次妳說暗部別全看成黑的，我回去有再翻舊版。

**Jiang Yucheng**：有看出差別嗎？

**Protagonist**：有一點。這張分區圖我也試著先找亮的地方，沒一直追著字看。

**Jiang Yucheng**：對。不是把整張圖拉亮。

**Protagonist**：但小巷那幾頁我還是看得很慢。

**Jiang Yucheng**：那幾頁本來就不好讀。我也要翻回去對。

**Variant — `continueTopicVariant === 'worldbuilding'`**

**Protagonist**：妳上次說雨港的分區，我在這本找到那張圖了。

**Jiang Yucheng**：你覺得呢？

**Protagonist**：對著圖看才知道，原來舊版那幾個地方離得這麼近。以前我以為隔很遠。

**Jiang Yucheng**：對啊。光看場景很容易以為是不同區。

**Protagonist**：我還來回翻了好幾次，想確認是不是記錯了。

**Jiang Yucheng**：我第一次看也是。你可以先夾著地圖那頁，不用一直找。

**Variant — `continueTopicVariant === 'edition_value'`**

**Protagonist**：買回去看，這本那些地圖註解真的比較好找。

**Jiang Yucheng**：至少不用猜它在指哪裡。

**Protagonist**：嗯。我還是會漏看，但翻回去就找得到。

**Jiang Yucheng**：那就有差。機械稿那本是翻回去也看不清楚。

**Protagonist**：這樣就不用靠猜字了。

**Jiang Yucheng**：對，反面教材。

**Variant — `continueTopicVariant === 'neutral'`**

**Protagonist**：這本多了不少地方設定。妳有比較喜歡哪一段嗎？

**Jiang Yucheng**：雨港那段。尤其是把幾個區放在一起的圖。

**Protagonist**：我也是先停在那張。比一頁一頁看場景好懂。

**Jiang Yucheng**：會知道它們怎麼接起來。單看其中一張，好看是好看，可是容易看完就忘了在哪裡。

→ Exactly one variant sets `jyc_second_topic=shared_work` and rejoins `common_station_cafe_jyc_parallel`. Neutral creates no past topic.

##### Branch `com02j_simple_praise`

**Protagonist**：這本滿好看的。那張分區圖我翻了好幾次。

**Semantic Visual Beat**：我指向自己書上的分區圖；雨澄以一個小笑回應普通稱讚。

**Jiang Yucheng**：嗯，那張我也喜歡。不過不是每頁都那麼好找，後面有幾張註解又變小了。

**Protagonist**：我還沒看到那裡。現在只翻到雨港。

**Jiang Yucheng**：那先慢慢看，不用急著翻完。

**Action**：我把書留在自己這邊，沒有把它推到她的平板前。

→ Set `jyc_second_topic=general_praise`; rejoin `common_station_cafe_jyc_parallel`.

### Bookstore-skip, cafe-go first meeting

#### `common_station_cafe_jyc_first_enter`

**Semantic Visual Beat**：出口上層有咖啡店；我選一處能休息和處理事情的座位，沒有尋人的視線。

**Narration**：在家工作一下午，最後同一段訊息看了兩次還沒看進去。我帶著電腦出門，想起許棠提過出口上面有咖啡，決定先坐一會兒。

**Action**：窗邊還有空位。我先看桌面夠不夠放筆記本電腦，才注意到鄰桌有人在畫圖。

#### `common_station_cafe_jyc_first_drawing`

**Semantic Visual Beat**：陌生女孩專注調整自己角色的姿勢和色塊；只看得見公開朝向座位的一角，沒有偷看螢幕或認人。

**Narration**：她把平板轉了一點避開反光。畫面角落露出幾個相似的角色輪廓，動作卻不一樣。

**Protagonist**：不好意思，這個位子有人嗎？

**Jiang Yucheng**：沒有。你要插座的話，這邊有一個。

**Protagonist**：喔，謝謝。我可以坐這裡嗎？會不會擋到妳畫圖？妳要專心的話，我坐別邊。

**Jiang Yucheng**：可以，不會擋到。我只是要調一下光。

**Action**：我坐在斜對角，打開自己的筆記本電腦。她把畫筆重新落到平板上。

#### `common_station_cafe_jyc_first_names`

**Protagonist**：剛剛那幾個姿勢，是同一個角色嗎？看得到一點，不方便說也沒關係。

**Jiang Yucheng**：是同一個。剛才那張我把重心畫偏了，現在在修。

**Protagonist**：我還以為是她要轉身跑。肩膀好像先動了。

**Jiang Yucheng**：有點接近。她是想回頭，又不想真的停下來。這個動作很難，畫太開就變成在擺姿勢。

**Protagonist**：原來差在這裡。我是 [PLAYER_NAME]。剛才問得有點突然。

**Jiang Yucheng**：江雨澄。沒事，你是看畫才問的。

**Action**：她把平板轉回自己的角度，我也把電腦往自己這邊挪了一點。

#### `common_station_cafe_jyc_first_choice`

這是 `expression` / Local 分支，三個 stance 各一次；不讀 `jyc_first_topic`、不借 COM-01J 的三個 choice ID。三項都從當場可見的圖開始，也都接同一個後續分享機會。

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

**Protagonist**：會看一些。角色怎麼用姿勢講故事，我滿愛看。我今天在家工作到有點累，出來坐一下，剛好看到妳在調那個動作。

**Jiang Yucheng**：我也會翻設定集。可是有時候一頁塞太多註解，反而看不到人站在哪裡。

**Protagonist**：對。我會先看圖在講什麼，再回頭看字。妳這張剛好是我會停下來看的那種。

**Jiang Yucheng**：那我先把她的肩膀修好，不然你下次看還是會以為她要跑。

**Action**：她笑了一下，回去調那條線；我也把自己的訊息打完。

→ Set `jyc_second_topic=her_art` for all three first-meet expressions; rejoin `common_station_cafe_jyc_parallel`.

### Shared continuation after either actual meeting

#### `common_station_cafe_jyc_parallel`

**Semantic Visual Beat**：雨澄用平板，我用筆記本電腦，在窗邊各自工作，座位並不正面相對。

**Narration**：接下來十幾分鐘，我們各自看著自己的螢幕。

**Narration**：她改了幾次線。我回完兩封訊息，聽著咖啡機又響了一輪。

**Condition — `route === 'weekday_reunion_after_weekend_bookstore'`**

**Action**：我把電腦推開一點，接著翻書。看了幾頁，才把書闔起來收進包裡。

**Shared**

**Audio**：咖啡機、遠處人流、畫筆輕觸聲。

**Action**：我闔上筆記本電腦，準備收東西；雨澄先抬頭。

#### `common_station_cafe_jyc_reciprocity`

**Jiang Yucheng**：你的工作都可以這樣帶著走？

**Protagonist**：大部分。我在科技公司工作，像剛剛那些就能在外面處理。

**Jiang Yucheng**：那你回家是不是也在做？

**Protagonist**：嗯，今天就在家做。坐太久了，才想說出來換個地方。

**Jiang Yucheng**：那好像也沒比較輕鬆。

**Protagonist**：是啊。

**Action**：她低頭把畫筆放下，我才又看向剛才露出的一角。

**Protagonist**：妳那個角色呢，剛才那幾張都要用在同一頁？

**Jiang Yucheng**：還不知道。我想先讓她站得像同一個人，再決定哪張放進去。

**Semantic Visual Beat**：雨澄抬頭主動問工作能否帶著走；我也回問她眼前的創作，兩人的注意力各有來處。

#### `common_station_cafe_jyc_share`

**Condition — `route === 'weekday_reunion_after_weekend_bookstore'`**

**Protagonist**：這本我應該還會翻很久。那張分區圖我剛剛又看了一次，先看整張、再找字，跟我一開始看的感覺不太一樣。

**Jiang Yucheng**：也不是每張都要一眼看完啦。先看整張，再挑你想看的地方就好。

**Protagonist**：嗯。我平常看遊戲介紹也常常直接找文字，今天才發現自己真的很少先看整頁。

**Condition — `route === 'weekday_first_after_weekend_home'`**

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

**Jiang Yucheng**：好啊，沒關係。

**Condition — `route === 'weekday_reunion_after_weekend_bookstore'`**

**Protagonist**：也謝謝妳講那本書，我回去再慢慢看。

**Jiang Yucheng**：嗯，慢慢看。

**Condition — `route === 'weekday_first_after_weekend_home'`**

**Jiang Yucheng**：謝謝你剛剛聊我的圖，還有遊戲頁的事。

**Protagonist**：我也謝謝妳講那張圖。

→ Rejoin `common_station_cafe_jyc_exit` with `contact_jyc=false`. He declines the offered sharing in ordinary terms; the page was a topic, not sent, and neither person owes a later meeting.

#### `common_station_cafe_jyc_exit`

**Condition — `flags.contact_jyc === true`**

**Protagonist**：今天謝謝妳讓我坐這裡。

**Jiang Yucheng**：不會，反正有空位。我看完那頁再回你。

**Shared**

**Action**：我背起筆記本電腦包。雨澄把畫筆放回筆槽。

**Protagonist**：那妳慢慢畫，我先走了。

**Jiang Yucheng**：好，掰掰。

**Semantic Visual Beat**：窗邊留下空位；她繼續自己的畫，我帶走自己的電腦包。

**Narration**：下樓時天還亮著。我揉了揉肩膀，沿著來時的路往公寓走。

→ Both contact outcomes, on either entry: return home → **COM-03X**, same weekday evening package event. No COM-02X / evening convenience detour; no third cafe meeting.

## Choice, state and successor mapping

| Entry/action | Exact event / state marker | Next |
| --- | --- | --- |
| `weekday_reunion_after_weekend_bookstore` | Preserve actual `met_jiang_yucheng=true`, `heard_station_cafe_from_jyc=true`, `weekend_book_purchased=true` and trustworthy `jyc_first_topic`; set `jyc_initiated_second_contact=true` only at her greeting. | Reunion enter → drawing/greeting → seat consent/names/book uptake → reunion choice. |
| `weekday_first_after_weekend_home` | Set `met_jiang_yucheng=true` on actual encounter; `heard_station_cafe_from_jyc=false`, `jyc_initiated_second_contact=false` or unset. No `jyc_first_topic` creation. | First enter → drawing/seat consent → names → first choice. |
| Corresponding visible drawing | `jyc_creator_work_seen=true` only after the drawing is visible; even book reunion establishes no unseen work detail. | Continue local body. |
| Corresponding actual name exchange | `player_knows_jyc_name=true`, `jyc_knows_player_name=true` only after both speak. | Continue local body. |
| `com02j_ask_drawing` | Now book-page visual discussion, so `jyc_second_topic=shared_work`; legacy ID retained, no fabricated her-art callback. | `common_station_cafe_jyc_parallel` |
| `com02j_continue_topic` | Exactly selected actual-history variant or neutral: `jyc_second_topic=shared_work`; neutral creates no first-topic history. | `common_station_cafe_jyc_parallel` |
| `com02j_simple_praise` | Book praise and her concrete response: `jyc_second_topic=general_praise`; no drawing-layer fact. | `common_station_cafe_jyc_parallel` |
| `com02j_first_warm` / `com02j_first_candid` / `com02j_first_playful` | Same visible posture and actual discussion: `jyc_second_topic=her_art`; no bookstore/topic history. | Shared first-meet continuation → `common_station_cafe_jyc_parallel` |
| Parallel / reciprocity / share | Limited technology-company / portable-work facts actually spoken; reciprocal question about her own character. Route-specific bridge selected exactly as above. | parallel → reciprocity → share → contact choice |
| `com02j_offer_discord` | After her assent, friend request, his acceptance and sent link: `contact_jyc=true`. Before completion, no usable channel is awarded. | `common_station_cafe_jyc_exit` → COM-03X |
| `com02j_leave_without_contact` | `contact_jyc=false`; no account request, sent link, RE, romantic refusal, `romanticSignal` or negative score. | `common_station_cafe_jyc_exit` → COM-03X |
| Upstream `com01b_weekday_street_walk` / `jyc_permanently_excluded=true` | Selector returns null; no COM-02J node, choice history or state mutation. No scene-local reopening. | Upstream street owner supplies its own return → COM-03X. |

Every local branch has concrete prose above. Contact choice is `action` / Structural: selecting an actual mutual exchange establishes a usable channel for later contacted content. It appears on both entrances after all local choices, with no score, stance, terminology or topic gate. Name exchange and sitting do not imply a date. Existing F/T/C/K compatibility counters, if retained by integration, are telemetry only; this writer introduces no numeric mutation or eligibility authority.

All existing `common_station_cafe_jyc_*`, `common_station_cafe_jyc_first_*`, reunion topic IDs, first-meet expression IDs and contact action IDs remain stable; no new node prefix or scene is required. Additional compiled line suffixes, existing encounter-baseline compatibility and runtime/save wiring belong to the integrator. `jyc_alias_private`, `jyc_alias_exposed`, `relationship.jyc.romanticSignal`, permanent exclusion and other-character knowledge are unchanged by this scene.

No-contact exits go to the package with known-but-not-contacted Jiang facts, then the approved Xu-only continuation; they do not invent a third meeting or online permission. Contact exits go to that same package with the actual channel and sent page; the later COM-03J review must use truthful neutral messaging for book branches that lack its old drawing callbacks. No topic enum substitutes for actual spoken evidence. The package merge preserves these differences.

Outside this scene, non-street paths retain actual familiarity, heroine consent, prerequisites, finite attention windows, one natural reapproach and its immediately following single reopening window, with harm/closure/clarity gates intact. Contact here grants neither prior investment nor repair. This scene authors no RE/invitation and never clears street exclusion.

## Writer checks and handoff boundary

- Own writing acceptance: **PASS**. Checked weekday home-work fatigue, actual purchase on reunion only, nearby-seat consent before sitting, concrete book/drawing uptake, names, independent activity and reciprocal interest against the exact approved contract.
- Checked all three reunion choices, all four callback variants, all three first-meet expressions, both share bridges and both contact outcomes for truthful local rejoin; every cafe exit goes directly home to the same weekday COM-03X package event.
- Exactly **one bounded naturalization sweep** of the complete new draft: retained compatible ordinary replies, drawing misunderstanding/correction, small humor and work silence; softened abrupt topic changes and kept branch-specific thanks. No contract, choice intent, knowledge timing or accepted semantic beat was changed by the sweep.
- The write is restricted to this scene. Narrative contract, other scenes, runtime, art and prior QA/Human receipts are unchanged. Source acquisition/preflight, production validation and diff checks are mechanical evidence; independent Narrative QA, visual-impact / Visual QA, runtime integration and Human review remain **PENDING**.

## Historical binding — provenance only

The pre-revision scene retained a prior design/source blob `9de22cbb30350bffc63d66eb1b5432156cd9f2ce` and contract SHA-256 `f2cddc0d4c99c938cddd95d8cef543911135d4991de049a4ef9247221ce02106` (blob `c5c62394ecef934ff96159768a70c8787125730f`). Those identities describe historical same-outing / drawing-centered prose, not the current weekday contract or an approval of this rewrite. Compatible first-meet drawing, reciprocal work, page-sharing, Discord assent/exchange and farewell lines remain in the current script; affected same-outing, unpurchased-book and reunion-drawing claims were rewritten for the approved semantic reason. No historical source or receipt was acquired or modified.
