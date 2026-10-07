# JYC-05 — ACG：她的主場

> Lifecycle: **CANONICAL**
> Production stage: Scene / Dialogue — **Script Lock**
> Status: complete Locked Scene awaiting independent Narrative QA; no Human or preview integration acceptance.
> Scope: exactly JYC-05；較晚下午的首次限定展同行。

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/JYC-05.json`
- Approved contract unchanged: SHA-256 `b0d5d69a30a55457e441c6ea18718d4f2ff6d1d33f9ae94f005e1c2beb408d0b`。
- entry：`contacted_acquaintances_with_shared_interests`；exit：`shared_outing_acquaintances_with_boundaries`。作品觀察成立不等於親密／浪漫承諾；代答結果依實際 branch 保存。

## Exact predecessor and entry

只接 `OPEN-A-ENTRY-PENDING-J`：雙方已確認第一 window 較晚下午看限定展，她先處理手上那張畫，男主先做自己的事。原第一 major slot 尚未消耗；不重送已完成的訊息或重新邀約。需 COM-02J mutual contact、COM-03J 真實線上前事、`contact_jyc=true` 及當地 eligibility／consent／harm／closure 容許成行。累積初遇資格不能補這些事實。本稿不含 return、RE 或其他入口。

## Writer-owned wardrobe

- Character: `jiang_yucheng`
- wardrobe_key: `JYC-WARDROBE-A-ACG-OUTING`
- Existing look: `ACG Outing`
- 由 task-character-only writer-safe options 選取；Planner unchanged carry-through。無 image、provider 或 reference metadata，也不新增 wardrobe runtime state 或故事 lore。

## Dialogue／choice／state contract

下列 IDs 是待編譯 semantic IDs；人物台詞與「旁白」為完整玩家可見文字，導向、條件、表格、製作說明不顯示為 narration。

- 主路徑：`JYC-05-ENTRY` → `JYC-05-EXHIBIT` → expression `JYC-05-COMPARE` → `JYC-05-COUNTER` → action `JYC-05-SUPPORT` → 對應 shop branch → `JYC-05-REWARD` → 對應 exit branch → `JYC-05-COMPLETE`。
- expression：三種 stance 各一次，僅 Local 討論差異與 optional Echo；不裁決未來 scene eligibility。
- action：玩家是否在她停頓時代答，Local 影響立即可見；後續相鄰 continuation 的 repair obligation 有條件差異，不能壓成真 merge。
- 每條完成路徑都看見她帶路、比較、糾正記憶與選周邊。只有到 `JYC-05-COMPLETE` 才 apply approved completion flags、記一次實際 anchor／major investment並消耗第一 major slot。無新 runtime schema／mutation 實作。

## Locked Scene

### JYC-05-ENTRY — 限定展入口

**旁白**

下午晚一點，入口前排了幾個人。我走到展覽立牌旁，雨澄正低頭看手機。

**我**

嗨。等很久了嗎？

**雨澄**

沒有，我也剛到。

**旁白**

她把手機收起來。我看了看排隊的人，又看向旁邊敞開的門。

**我**

是排這邊？我剛剛差點直接走進去。

**雨澄**

那邊是出口。這邊才對。

**我**

喔，好。

**雨澄**

你之前有來過這裡嗎？

**我**

沒有。剛剛還在找入口，繞到另一邊去了。

**雨澄**

我也走錯過。外面那個箭頭有點……算了，反正到了。

**旁白**

隊伍往前挪，我跟著她走進展區。她在入口拿了一張導覽紙，展開後停了停。

**雨澄**

我想先看前面那區。後面那些小物可以等一下再逛，可以嗎？

**我**

可以，妳帶路。我還不知道裡面有什麼。

→ `JYC-05-EXHIBIT`。

### JYC-05-EXHIBIT — 比較的地方

**旁白**

雨澄沿著展櫃往裡走，比我快了幾步。她在兩張並排的圖前停下，回頭確認我有跟上。

**雨澄**

這個。我想看的是這個。

**我**

右邊是最早那版吧？我記得以前看過。

**雨澄**

不是，左邊才是。右邊是後來改的。

**我**

欸，是喔？

**雨澄**

你看手。左邊袖口這裡留了一點，右邊直接蓋掉了。還有背景，後來那版把後面的東西都清掉了。

**旁白**

我往前站了一點。只看大圖時沒注意的細節，現在被她一一指出來。

**我**

真的。我是記反了，還是根本沒看清楚。

**雨澄**

縮圖很難看啦。可是你剛剛講得很肯定。

**我**

對，這個我認。

**旁白**

她笑了一下，重新低頭對照導覽紙。那個「不是」接得很快，和訊息裡談到作品時的節奏有些像。

**雨澄**

我比較喜歡最早這張。後來那張是比較乾淨，可是左邊這個人好像真的待在什麼地方，不是只有擺一個姿勢。

**我**

因為後面那些東西？

**雨澄**

嗯，也有姿勢。你看，他不是整個人朝向你，手還在弄自己的東西。我會想多看一下旁邊發生什麼事。

**旁白**

我順著她說的位置看，過了一會兒才重新看回人物的臉。

**Expression choice `JYC-05-COMPARE`**

| Option ID | 玩家可見台詞 | Internal stance | 導向 |
| --- | --- | --- | --- |
| `JYC-05-CANDID` | 我反而比較喜歡右邊。第一眼就看得到人，不過左邊可以看比較久。 | candid | `JYC-05-COMPARE-C` |
| `JYC-05-PLAYFUL` | 我現在看哪張都不敢說自己以前看過了。先從袖口補課。 | playful | `JYC-05-COMPARE-P` |
| `JYC-05-WARM` | 妳這樣講，我懂一點了。左邊那個手勢，真的比較像做到一半被看到。 | warm | `JYC-05-COMPARE-W` |

### JYC-05-COMPARE-C — 不同的第一眼

**雨澄**

右邊也好看啊。我只是看完會想回去看左邊。

**我**

嗯，我大概是先看臉。

**雨澄**

我也會。只是這張的臉沒有改很多，你看眼睛就知道了。

**旁白**

我看了兩眼，還是不太確定。

**我**

這個我就看不出來了。

**雨澄**

很小的差別。沒關係，不用硬看。

→ `JYC-05-COUNTER`。

### JYC-05-COMPARE-P — 先看袖口

**雨澄**

也不用只看袖口吧。

**我**

我現在至少認得這個。

**雨澄**

嗯……也是。

**旁白**

她又看了看兩張圖。我本來還想接一句，最後也只是跟著看。

**雨澄**

旁邊有印成小冊子的版本，可以翻。那個比較好比。

→ `JYC-05-COUNTER`。

### JYC-05-COMPARE-W — 做到一半

**雨澄**

對，就是那種感覺。不是特地在等你看他。

**我**

我剛剛只覺得東西很多，沒想到這個。

**雨澄**

東西是很多。印太小就有點糊在一起，所以我才想來看大的。

**旁白**

她轉回圖前。我也站著再看一會兒，這次沒有急著找一句評語。

→ `JYC-05-COUNTER`。

### JYC-05-COUNTER — 書架與櫃台

**旁白**

展櫃旁有一個放樣書的架子。雨澄拿起一本，翻到剛才那兩張圖，將書往我這邊偏了一點。

**雨澄**

看，放在一起就差很多。

**我**

這本就是等一下賣的那個？

**雨澄**

對。一般版跟特裝版內容一樣，特裝多一個外盒。我想買一般版，翻起來比較方便。

**我**

特裝是不是比較值得收？

**雨澄**

看你收什麼吧。盒子是好看，可是我想看的都在裡面。這本的大小也比較適合看細節，不是多一個盒子就比較好。

**我**

也是。妳很懂欸。

**雨澄**

就……我有在看這個啊。

**旁白**

我點點頭，翻回前一頁。她的手還托在書背底下，我把書放回架子，她才收回手。

**雨澄**

我去問一下那邊。

**旁白**

我們走到櫃台前。店員把展示的兩個版本各往前挪了一點。

**店員**

妳要一般版，還是有外盒的特裝版？

**旁白**

雨澄看了一眼一般版，嘴唇動了動。

**雨澄**

我……

**Action choice `JYC-05-SUPPORT`**

| Option ID | 玩家可見行動 | 導向 |
| --- | --- | --- |
| `JYC-05-WAIT` | 站在旁邊，等她把話說完。 | `JYC-05-SHOP-WAIT` |
| `JYC-05-ANSWER` | 想讓交易快一點，先替她說要一般版。 | `JYC-05-SHOP-ANSWER` |

### JYC-05-SHOP-WAIT — 她的問題

**旁白**

我往旁邊讓了一點，留出她看展示本的位置。

**雨澄**

一般版。想問一下，內頁也是這種紙嗎？展示本好像比較舊。

**店員**

是一樣的，那本只是翻得比較多。紙沒有換。

**雨澄**

喔，好。那我要一本一般版，謝謝。

**旁白**

她拿出付款的東西，等店員把書裝好。

**雨澄**

我剛剛摸到那頁邊緣有點翹，還以為紙不一樣。原來只是被翻很多次。

**我**

我完全沒注意。

**雨澄**

嗯，我買之前會想摸一下。太薄的翻起來有點怕。

**旁白**

她接過袋子，往旁邊的小物架看去。

→ `JYC-05-REWARD`；保留 `waited_for_her_answer`。

### JYC-05-SHOP-ANSWER — 我先接了話

**我**

一般版就好。

**旁白**

店員轉身去拿書。雨澄原本抬起的手放了下來。

**雨澄**

嗯，一般版。

**旁白**

她拿出付款的東西，等店員把書裝進袋子。

**店員**

一本一般版，謝謝。

**雨澄**

謝謝。

**旁白**

離開櫃台後，我看了一眼她手上的袋子。

**我**

買到了。

**雨澄**

嗯。剛剛還想問一下裡面的紙是不是跟展示本一樣。

**我**

喔……

**旁白**

她將袋口折了一下，轉去看旁邊的小物架。我跟過去，原本想問她下一區有什麼，沒有馬上開口。

→ `JYC-05-REWARD`；保留 `answered_for_her` 與本次 substitution unresolved。此段沒有道歉／support 協商／接受，不構成 repair。

### JYC-05-REWARD — 小東西

**旁白**

小物架上擺著幾款徽章。雨澄蹲低一點，看最下面那一排，又拿起旁邊的樣品。

**雨澄**

欸，這個有單賣。

**我**

徽章？

**雨澄**

嗯，我想要這個。

**旁白**

她把樣品放回去，拿了一個同款包裝。結完帳，她走到不擋人的地方，隔著袋子摸摸徽章邊緣。

**雨澄**

比我想的小。這樣比較好，我怕那種太大顆的。

**我**

放在包上？

**雨澄**

可能吧。先不要拆。

**旁白**

她將徽章往亮一點的地方移，包裝裡的小圖案一下變得清楚。她笑了，低頭再看一眼，才把它收好。

依 shop history 導向對應 exit；徽章由她自主購買，所有完成支均演出，不以 expression 或代答 outcome 解鎖。

### JYC-05-EXIT-WAIT — 離展後的話題

**旁白**

走向出口時，雨澄又停下來看了一眼入口旁的海報。

**雨澄**

今天有看到想看的，還買到這個。可以了。

**我**

我倒是多看了很多剛剛沒注意的。

**雨澄**

那兩張嗎？

**我**

對。還有一般版跟特裝，原來真的不用都買。

**雨澄**

本來就不用啊。

**旁白**

她說完笑了一下。出了展區，走道上的聲音忽然比裡面大。

**雨澄**

下次有另一個……不是展，是可以一起玩的，合作過關那種。

**我**

喔，兩個人一起玩？

**雨澄**

嗯。不過我也還沒仔細看，只是看到有人在講。就隨便提一下。

**我**

可以先看看。我也想知道是玩什麼的。

**雨澄**

嗯，我再看一下。

→ `JYC-05-COMPLETE`；沒有本次代答事件或 unresolved，不新增已確認安排。

### JYC-05-EXIT-ANSWER — 少了一點的分享

**旁白**

走向出口時，雨澄將購物袋換到另一隻手。她看了一眼入口旁的海報，沒再停下。

**我**

今天想看的都有看到嗎？

**雨澄**

嗯，有。

**旁白**

出了展區，我們並排走了一小段。她摸到袋子裡的徽章，低頭看了一眼。

**雨澄**

下次有另一個可以一起玩的。合作過關那種。

**我**

喔，是遊戲？

**雨澄**

嗯。只是看到，還沒看清楚。隨便講一下。

**我**

好。有興趣的話可以先看看。

**雨澄**

嗯。

**旁白**

她把袋子提好。我想起櫃台前那句沒說完的話，跟著她繼續往出口走。

→ `JYC-05-COMPLETE`；分享較少及 `answered_for_her` unresolved 保留，興趣 hook 不構成她接受 repair 或 gaming／家訪邀約。

### JYC-05-COMPLETE — 本次同行完成

**旁白**

走到展覽立牌外，我回頭看了一眼。剛才排過的隊伍更短了，已經有新的入場者站到我們之前等的位置。

**我**

那今天就先這樣。回去小心。

**雨澄**

嗯，你也是。掰掰。

**旁白**

我向她揮了下手，往另一邊走。她手上的袋子輕輕晃了一下。

**Preview interface at boundary（非 narration）**

本段預覽到此。下一段尚未製作。

## Branch consequences／rejoin／save contract

| History | 當地可觀察差異 | 後續保存與邊界 |
| --- | --- | --- |
| `JYC-05-CANDID` | 坦白偏好右版、承認看不出微小差別；她知道男主這次說出的偏好 | Local／optional 具體 Echo，不寫成 general competence／route score |
| `JYC-05-PLAYFUL` | 借記錯做輕鬆改口、玩笑普通落地，轉去樣書 | Local／optional 袖口 callback；不能推定 candid 的偏好或 warm 的理解 |
| `JYC-05-WARM` | 具體接住手勢判斷，她補充印刷大小的考量 | Local／optional 具體 Echo，不授予高親密 |
| `waited_for_her_answer` | 她自行問內頁、完成交易，繼續分享紙張觀察 | 無本次 substitution evidence；後續不能虛構 repair history，也不保證未來邀請 |
| `answered_for_her` | 店員向她問版本時男主先說「一般版就好」；她完成交易但問題未問出，後續收斂 | 保存 exact JYC-05 櫃台代答 evidence 與 early friction unresolved；交易／reward／共同 completion 不清除 |

- 共用 reward 與 completion 只建立一次展覽已發生與她的主場被看見；兩條 exit 必須依 history 分別演出。未走分支的主觀偏好、台詞 knowledge 與摩擦不匯入。
- `jyc_seen_in_element=true`、`open_a_window1_consumed=true` 只在 actual `JYC-05-COMPLETE` 一次性 apply。保持 `open_a_entry_outcome=pending_jyc` 的入口歷史，不創 outcome enum、不重算確認訊息為 major investment。
- integrator 依既有框架記錄 actual scene completion／major investment與 scene-local choice history；本稿的 history 名稱是 authoring consequences，不創 relationship score／runtime flag schema。不新增 contact、romanticSignal、late `repair_completed`、scheduler／reservation／slot grants。
- Save/load 保留本地 semantic node、expression/action history、當地 knowledge 與 completion；不重跑入口、重新付款、重送訊息或再次消耗 slot。Memory replay 使用 replay-local snapshot，不寫 live flags。
- 代答支在家訪邀約前的同次後段／相鄰短 continuation，必須具體承認搶答、問她希望何時／如何 support、停止代答並在下一次店員／訊息回覆讓她自己完成。她實際接受才 addressed；拒絕不進家訪，可保留普通聊天或明確 closure。此 successor 尚未 authored，不把 JYC-05 的短 hook 當 repair，不挪用 late repair scene。
- 沒有可玩 JYC-06／OPEN-B／第二 window。completion 停在上述 preview boundary，後續尚待獨立 authoring 與 gates。

## Semantic Visual Beats

1. 入口客氣確認排隊方向；她拿導覽紙選先看的區域，我跟上。
2. 她先到並排版本前，指袖口／背景／手勢差別，直接更正我的記憶；共同看圖與樣書的停頓保留。
3. 店員直接向她問版本。wait branch 她自行問內頁並完成回覆；answer branch 她抬起的手收回、話沒說完，稍後提到未問的問題。
4. 她自主選徽章、付款、看清包裝裡的小圖案並笑；各支相同小物快樂，不替代 branch boundary。
5. 未代答支停看海報、較多接話；代答支收斂，短小 co-op hook 後停住。兩支都告別，尚無新安排。

## Source and acceptance boundary

來源限 DIALOGUE-JYC-05 packet pinned `8d2a22fe4a1242f66aa25c57b6bc3a83f19353dd` 的下列 exact excerpts、continuity schemas、批准 contract／decision 與原 ND outline。沒有 approved dialogue calibration reference。完整對話已做 exactly one bounded naturalization sweep。Narrative QA／Human／preview acceptance 尚未取得；下一 gate 為 fresh `content_qa / narrative_review`。

## Canonical inputs

- `docs/narrative/CONTENT_PRODUCTION_SPEC.md#L13-L53`
- `docs/narrative/CONTENT_PRODUCTION_SPEC.md#L60-L91`
- `docs/narrative/CONTENT_PRODUCTION_SPEC.md#L135-L137`
- `docs/narrative/NARRATIVE_INTERACTION_AND_STORY_MAP_SPEC.md#L80-L190`
- `docs/narrative/NARRATIVE_INTERACTION_AND_STORY_MAP_SPEC.md#L191-L353`
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L400-L415`
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L437-L439`
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L344-L345`
- `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_JIANG_YUCHENG.md#L1-L74`
- `docs/art/characters/jiang-yucheng.md#L1-L62`
- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md#L441-L463`
- `docs/narrative/scenes/vertical-slice/OPEN-A.md#L3-L11`
- `docs/narrative/scenes/vertical-slice/OPEN-A.md#L40-L50`
- `docs/narrative/scenes/vertical-slice/OPEN-A.md#L241-L293`
- `docs/narrative/scenes/vertical-slice/OPEN-A.md#L398-L413`
