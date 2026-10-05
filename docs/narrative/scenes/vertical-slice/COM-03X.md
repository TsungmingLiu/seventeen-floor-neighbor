# COM-03X — 包裹 / Line

## Current authorized weekend/weekday design — ND-ARC-001

- Lifecycle: **CANONICAL** task-local Narrative Design amendment, 2026-10-04. Source ref: `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9`. Human 授權本輪方向與必要改寫；本 pass 沒有新 final prose、QA、runtime 或 CG acceptance。
- Owning design: `docs/narrative/JYC_WEEKEND_WEEKDAY_REVISION.md`；current contract: `content/production/narrative/opening-ch1/COM-03X.json`。此 design section 與 current JSON 取代下方 baseline 的衝突時序／gate；下方舊 Locked prose 與其歷史 binding 完整保留作局部改寫或相容性參考，不是本輪新 Script Lock。
- 三條平日回家走法共同包裹：不需 dialogue rewrite。現有完整包裹／樣本／Line prose 可保留：她「上次／那天」deadline 指週末便利店；雙方工作與附近食物在兩支均已建立。入口在 cafe reunion、cafe first 或 street 回家後同一平日晚間；完整保留不同 Jiang knowledge/contact/exclusion。exit 只有真實 cafe contact 可接 COM-03J，其餘接 COM-03M Xu-only。
- Stable ID plan：無新 IDs；common_package_xu_* 與三個 com03x_* 保留。
- 永久排除：本輪 `com01b_weekday_street_walk` 才寫 `jyc_permanently_excluded=true`。此 flag 先於 contact/history，永不由 merge、reload、scheduler、public shared scene 或 ordinary invite 清除。Memory replay 限自己的 snapshot，不向 live 主線寫入；改走前一分岔屬另一 playthrough，不是本輪 reopening。
- Semantic visual impact 與四個必要 dialogue units 見 owning design；現有 accepted image bytes、QA/Human 歷史都保留。獨立下游才裁決哪些畫面可重用。

## Preserved pre-revision baseline


## Status

- Lifecycle: **CANONICAL** scene-local authoring artifact.
- Production stage: **Script Lock** — independent Narrative QA pending.
- Scope: exactly one COM-03X scene; Script Lock records the writer output, not Narrative QA or Human approval.
- Time / place: Week 2 平日晚間，17 樓 1702／1703 門口；門口互動約 7–10 分鐘，訊息在各自回家後稍晚發生。
- Memory intent: 可由 COM-03M 壓縮；不建立 standalone Memory card 或 Gallery unlock。

## Canonical inputs

- `content/production/narrative/opening-ch1/COM-03X.json` — verified upstream Narrative Continuity Contract.
- `content/production/narrative/opening-ch1/COM-02X.json` — immediate predecessor knowledge and relationship boundary.
- `docs/narrative/CONTENT_PRODUCTION_SPEC.md` — production layer boundaries and fixed terminology.
- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md#L30-L70`, `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md#L129-L147`, `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md#L309-L329` — protagonist, dialogue intent and COM-03X function.
- `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_COMMON.md#L161-L183` — package, client deadline, practical contact and later information payoff.
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L170-L186`, `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L253-L289`, `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L335-L344`, `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L354-L354`, `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md#L410-L410` — state semantics, knowledge and dependency boundaries.
- `content/characters/xu_tang.json#L2-L4`, `content/characters/xu_tang.json#L14-L21` — task-local identity and behavior facts.
- Prior unapproved COM-03X S1 candidate, pinned at `a2ff5e369b304249a84788a1a6e603dc0a00c44b`: `docs/narrative/scenes/vertical-slice/COM-03X.md#L1-L449`, `docs/narrative/scenes/vertical-slice/COM-03X.md#L577-L615` — existing narrative and branch IDs only within the verified contract; superseded by this Script Lock.

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-03X.json`
- Contract SHA-256: `81b6c71fedb43b4d32c025a2d190dea9c1138905680a99562efa417b522d507c`.
- Entry / exit relationship labels: both directions remain `familiar_neighbors_with_boundaries`.
- Entry: COM-02X completed, limited work outlines and one nearby late-night food fact known; `contact_xu` not yet established.
- Function / intent: return the intact misdelivered envelope; Xu willingly shows her print samples and explains the current client deadline; ordinary doorstep conversation creates a practical reason for Line.
- Required payoff: all three choices rejoin into the same sample discussion; doorstep conversation exceeds five minutes; Xu thanks him before closing; she later sends the offered nearby information.
- Exit: both have Line; samples / print checks / client deadline become concrete; both return to their own homes. Base familiarity +1, `contact_xu=true`, `romanticSignal=false`.
- Boundary: no work takeover, regular parcel service, private client information, invitation, date, private emotional interpretation or additional relationship/knowledge meters. Existing pattern telemetry and counters are preserved.
- The canonical JSON owns all continuity values; this section is its scene binding and implementation-facing summary.

## Complete playable script

### common_package_xu_arrive

**Narration**：電梯門在身後關上。我拿出鑰匙，才看到 1703 門邊靠著一個硬紙封套。

**Action**：我低頭看外面的物流標籤。收件人是許棠，地址最後一行寫著 1702。封口還貼著膠帶。

**Narration**：隔壁的。

**Action**：我拿起封套，走到 1702 敲了兩下門。

→ `common_package_xu_door`

### common_package_xu_door

**Action**：門開了。許棠看向我手上的封套。

**Xu Tang**：喔，放你那邊了？

**Protagonist**：對，就靠在我門口。

**Action**：我把封套遞給她。她接過去，看了看四角，再沿著封口摸了一下。

**Xu Tang**：謝謝。我剛剛還在找物流訊息……還好沒折到。

**Protagonist**：這是上次要送印刷的？

**Xu Tang**：嗯，那個案子的打樣。來，給你看一下。

**Action**：她站在自己門邊撕開膠帶，抽出兩張樣本，把有色塊的那一面轉向我。

**Xu Tang**：同一個版面，試兩種紙。

**Protagonist**：喔，摸起來不一樣？

**Xu Tang**：對，印出來也會不一樣。

→ `common_package_xu_choice`

### common_package_xu_choice

**Choice prompt**：她把兩張樣本疊齊，又分開看。

1. `com03x_recall_deadline` — **「上次妳趕到那麼晚，就是在改這個？」**
2. `com03x_ask_proof` — **「打樣是在看螢幕上看不準的地方嗎？」**
3. `com03x_joke_building` — **「快遞大概也靠直覺在找門。」**

#### Branch com03x_recall_deadline

**Protagonist**：上次妳趕到那麼晚，就是在改這個？

**Xu Tang**：對啊。那天先把檔案交出去，今天才收到紙本。

**Protagonist**：原來還沒結束。

**Xu Tang**：還沒，這一輪也要給客戶看。看完才能排後面的印刷。

**Protagonist**：嗯。

**Action**：她把樣本移到走廊燈下。

**Xu Tang**：這邊亮一點。你看這兩塊灰色。

→ Rejoin `common_package_xu_proof`

#### Branch com03x_ask_proof

**Protagonist**：打樣是在看螢幕上看不準的地方嗎？

**Xu Tang**：嗯，顏色、紙的效果，還有字印出來會不會太小。螢幕可以一直放大，拿到手就不是那回事了。

**Protagonist**：對喔。

**Action**：她指了一下其中一行小字，我稍微湊近看紙。

**Protagonist**：這行我就得湊近一點。

**Xu Tang**：是有點小。還有這裡，你看這兩塊灰色。

→ Rejoin `common_package_xu_proof`

#### Branch com03x_joke_building

**Protagonist**：快遞大概也靠直覺在找門。

**Xu Tang**：嗯，差一扇。

**Action**：她看了一眼隔壁的門牌，笑了一下。

**Protagonist**：至少樓層對了。

**Xu Tang**：也是。還好是送到你這邊。

**Action**：她把手上滑開的兩張樣本重新拿好。

**Xu Tang**：等一下，這邊亮一點。你看這兩塊灰色。

→ Rejoin `common_package_xu_proof`

### common_package_xu_proof

**Action**：她把兩張紙並排，指著同一個位置。我站在門外，看她指出來的色塊。

**Xu Tang**：這張有點偏綠。

**Protagonist**：我看不太出來欸。

**Xu Tang**：這邊。跟旁邊這張比。

**Action**：我看了幾秒。

**Protagonist**：好像有一點……也可能是妳講了，我才覺得有。

**Xu Tang**：嗯，其實很接近，不太容易看出來。

**Action**：她低頭比較了一會兒，又把兩張紙換了位置。我把鑰匙放回口袋。

**Protagonist**：所以要重印？

**Xu Tang**：先拍給客戶看。明早要回覆印刷廠，今晚得先確認用哪張。

**Protagonist**：喔。

**Xu Tang**：如果要調，再調一點色值。紙應該不用換了。

**Action**：她從封套裡拿出同批的另一張樣本，翻到背面。我等她看完。

**Protagonist**：兩面都要看？

**Xu Tang**：要，看會不會透。這張還可以。

**Action**：她把紙舉了一下，再放回去。我跟著看，這次看見背面的字淡淡透過來。

**Protagonist**：我以前好像都只看摸起來怎麼樣。

**Xu Tang**：也會看那個啊。有時候挑好紙，印出來又不一樣，還是要拿到才知道。

**Action**：她將幾張樣本一張張收齊，留了兩張在外面。我們安靜了一會兒。

**Narration**：手機在口袋裡震了一下。我看了眼時間，從剛才出電梯到現在，已經過了六、七分鐘。

→ `common_package_xu_callback`

### common_package_xu_callback

**Action**：她把封套立在身側，低頭看了一眼上面的地址。

**Xu Tang**：明明有寫 1702。你那邊之前也收過別人的？

**Protagonist**：搬來以後，這是第一次。

**Xu Tang**：喔。我之前有一件放到樓下，找了一陣子。

**Protagonist**：那妳今天算快的。

**Xu Tang**：對，今天省事多了。

→ `common_package_xu_line`

### common_package_xu_line

**Xu Tang**：我這週還有兩批會來。要不要加個 Line？如果又送到你那邊，傳我一下就好，不用一直敲門。

**Protagonist**：好啊。

**Action**：她拿出手機，打開 Line QR。我拿出手機掃碼，完成新增。

**Xu Tang**：有了。

**Protagonist**：嗯，我這邊也有。

**Xu Tang**：欸，之前跟你說的那間粥店，我把位置傳你。店名跟另一家很像。

**Protagonist**：好，謝謝。

**Action**：她看了眼手上的兩張紙，把手機先放回口袋。

→ `common_package_xu_exit`

### common_package_xu_exit

**Xu Tang**：我先去拍這兩張，等一下再傳。

**Protagonist**：好，妳忙。

**Action**：她收好封套，往門內退了一步。

**Xu Tang**：剛剛謝了。

**Protagonist**：不會。晚安。

**Xu Tang**：晚安。

**Action**：她關上門。我回到 1703，把鑰匙放在玄關。

→ 稍晚 `common_package_xu_first_message`

### common_package_xu_first_message

**Narration**：換好衣服後，我正要把手機插上充電，螢幕亮了一下。

**Xu Tang (message)**：剛剛說的粥店，在這裡。

**Action**：訊息附著店家的地圖位置。

**Xu Tang (message)**：記得週三沒開。

**Protagonist (message)**：收到，謝謝。

**Action**：我點開地圖看了一眼，把手機接上充電線。

**End actions**：本幕結束時套用一次 base state；只有實際 cafe contact 且未永久排除江雨澄時才接 `COM-03J`；無 contact 或街頭路徑接許棠專屬的 `COM-03M`。

## Player choice / rejoin contract

| Choice ID | Intent | Telemetry only | Local bridge | Rejoin |
| --- | --- | --- | --- | --- |
| `com03x_recall_deadline` | 記得前幕印刷 deadline，詢問是不是同一案子 | `mc_tone_observant +=1` | 交檔之後收到紙本；她把樣本移到燈下請他看灰色 | `common_package_xu_proof` |
| `com03x_ask_proof` | 對樣本用途好奇 | `mc_tone_practical +=1` | 她示範小字，再指出灰色 | `common_package_xu_proof` |
| `com03x_joke_building` | 用放錯一扇門的生活小事開玩笑 | `mc_tone_humorous +=1` | 看門牌後重新拿好樣本，移到燈下 | `common_package_xu_proof` |

三個選項均無額外 heroine stat delta；所有路徑共享完整交回、樣本／client deadline knowledge、Line 與稍後訊息。COM-02X 的食物資訊是共同 knowledge，回扣不聲稱玩家曾選特定提問。共同段才建立本幕的明早回覆期限；分支資訊不造成互斥 canon。

## State contract

- Requires: `COM-02X completed`; preserve established `met_xu_tang=true` and `player_knows_xu_freelance_creative_work=true` dependency.
- Forbids on entry: `contact_xu=true`.
- Base, exactly once on completed scene: `contact_xu=true`; `relationship.xu.familiarity +=1` (`F_XT +1`).
- Choice-local: only the three existing protagonist tone telemetry increments above; no heroine stat deltas.
- Preserve current values: `relationship.xu.trust`, `chemistry`, `compatibility`, `romanticSignal`, `recentFocus`, `overlapLevel`, `exclusiveWith`, `deception`; `romanticSignal` remains false.
- Preserve all prior pattern telemetry and boundary counters, including `xt_advice_tendency` and `xt_boundary_strikes`; no increments, resets or contact penalty from COM-02X's one unsolicited suggestion.
- Narrative knowledge: Xu's voluntarily shown paper/color checks, client deadline and Line; later nearby shop position. Xu knows the envelope was returned intact and has the protagonist's Line.
- No print-process flag or duplicate Line booleans; `contact_xu` remains the single contact gate. No new focus, exclusivity or cross-character knowledge.
- Conditional structural successor: actual cafe contact with Jiang not permanently excluded → `COM-03J`; no contact or street path → Xu-only `COM-03M`. Preserve actual Jiang contact/exclusion state; do not unlock OPEN-A here.
- Integration is deferred; no runtime nodes or package data are changed by this authoring output.

## Semantic Visual Beats

| Beat ID | Anchor | Observable event | Narrative meaning |
| --- | --- | --- | --- |
| 03X.1 | `common_package_xu_arrive` | Intact envelope at 1703; exterior label says 許棠／1702 | Wrong-door delivery supplies the immediate task |
| 03X.2 | `common_package_xu_door` | Xu accepts it and checks corners/seal before opening it herself | The package returns to its recipient |
| 03X.3 | door / choice | Xu turns two print samples toward him from her own doorway | Previously known design work becomes concrete through her choice to show it |
| 03X.4 | three choice branches | Recall, practical question or small delivery joke; each ends by directing attention to the samples | Different conversational tone, same shared work context |
| 03X.5 | `common_package_xu_proof` | She compares colors, changes paper position and checks the reverse; he follows what she points out; pauses and a glance at time | Voluntary conversation and sample handling carry a six-to-seven-minute doorstep stay |
| 03X.6 | `common_package_xu_callback` | She glances at the envelope address; they discuss delivery trouble | Immediate bridge from samples to ordinary logistics |
| 03X.7 | `common_package_xu_line` | Xu offers Line; both verify contact on their own phones | Practical contact channel for another wrong delivery and nearby information |
| 03X.8 | `common_package_xu_exit` | She gathers samples, thanks him and closes her door; he returns to 1703 | Work and separate evening routines continue |
| 03X.9 | `common_package_xu_first_message` | Later a map location and Wednesday closure note arrive; he checks the map | The offered information is actually sent |

Only semantic staging is specified here; visual production follows independent Narrative QA.
