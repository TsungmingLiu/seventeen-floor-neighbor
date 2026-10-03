# COM-03J — 推薦 / Discord

> Lifecycle: **CANONICAL**（scene-local pre-dialogue design；尚無 Locked Scene）
>
> Narrative Design task: `ND-COM03J-004` / `opening-feedback-20261003`。

## Status and boundary

- Production stage: Narrative Design / pre-dialogue outline only。
- Memory ownership intent: `common`；沒有新增 runtime/Memory node、cover、CG binding 或 unlock。
- 下一個 production pass：fresh `content_writer / scene_dialogue`，須先由 Coordinator 核對並採用本 contract。
- Dialogue、independent Narrative QA、narrative preview、CG/Visual QA 和 Human review 皆 pending。COM-02J 的 Human 決定只適用該前事；不批准 COM-03J。
- 不宣稱 first-play 時長；聊天到較晚是劇情分支的時間感，不是測得的閱讀分鐘數。

## Canonical inputs

- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` — global POV/heroine-spine L30–64、Jiang L71–147、COM-03J L330–348。
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` — graph IDs L29–41、state envelope L170–186、relationship axes L253–269、Jiang flags L290–311、knowledge L325–344、COM-03J dependency row L355、implementation guardrails L688–704。
- `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_COMMON.md` — common opening rules L13–21、COM-03J L184–206。
- `docs/narrative/route-blueprints/SCRIPT_BLUEPRINT_JIANG_YUCHENG.md` — dramatic spine L13–32。
- `content/characters/jiang_yucheng.json` — identity L2–4、bounded voice facts L53–56。
- `content/production/narrative/opening-ch1/COM-02J.json` and `docs/narrative/scenes/vertical-slice/COM-02J.md` — approved immediate continuity only, scene L1–360/L409–456。
- `content/production/runs/com02j-m1-preview-20261002/HUMAN-COM02J-STORY-011.decision.json` — Human 接受前事及仍需另修的兩個 Opening feedback；本設計不改它們。

完整 acquisition/provenance 與 machine diagnostics 保存在 ignored task cache；這裡只列 creative authority，不把 M1 scope proposal 當 scene canon。

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-03J.json`。
- Verified contract SHA-256: `582918460ef2cef867a9c009e97d003313c05e236c3d814af80fe68949c3c1ce`。
- Schema: `1.0.0`；以下是 contract 的 pre-dialogue execution outline，不是 locked playable script。

## Scene premise and causal bridge

COM-02J 之後的下一次短碰面，沿既有車站附近生活脈絡。兩人並未約會；不用新住處、工作場所、活動或中間相處 montage 來補熟悉度。她主動提起自己回去找到一個適合共同作品脈絡的遊戲／作品。這是**在咖啡店之後才找到的新推薦**，不是回填咖啡店曾有約定傳連結。

為了讓男主收到作品頁連結與一張可公開分享的內容截圖，兩人交換 Discord。此 scene 選定單一媒介，避免 Discord/Line 同時交換造成多餘關係進展。帳號只是私訊管道；不得聯到她的匿名 creator 身份或公開作品頁。兩人線下普通道別；當晚她真的傳來推薦，從克制到展開，再讓玩家決定今晚的交流節奏。

新推薦只需要一個可共同觀察、可分析的遊戲／作品細節。Scene/Dialogue 可填 task-local 虛構名稱及當下可見內容；不得增設作者／發售史／商業委託／創作身份、把 recommendation 寫成她自己的匿名作品，或把男主未玩过的作品寫成既有共同履歷。男主第一個懂內容的回覆應源自本幕收到的頁面／截圖，不能靠捏造已通關／深度知識。

## Entry and prerequisites

- Narrative prerequisite: route row `COM-03J | COM-02J | interest choice | contact_jyc`；interest choice 承接既有共同作品及 local topic，不要求某一個 COM-02J branch。`COM-02J completed`，姓名交換、看到她畫圖及她主動第二次接觸已成立；`contact_jyc=false`。
- Global sequence: `COM-02J → COM-03X → COM-03J → COM-03M`。COM-03X 是 common sequence 前位，非雨澄獲取他人 knowledge 的場景；本幕不需要其 prose 或 `contact_xu` 作本地人物互動條件。
- 玩家知道：江雨澄姓名、會畫圖、對圖像與作品有判斷；不知道 alias、商業委託、完整 creator 身份、住處。
- 雨澄知道：男主姓名、在科技公司工作、部分工作可帶到外面／回家；不知道精確職稱、住處或未披露私人關係。
- Choice stats/history 原樣繼承。`jyc_second_topic` 不代表所有 COM-02J 分支都發生；可信具體 callback 與中性 fallback 如下。

## Beat outline

| Design beat | Action / dialogue intent（非逐字稿） | Required payoff / boundary |
| --- | --- | --- |
| 03J.1 她接回題目 | 普通短碰面，她先表示後來找到了推薦；先確認男主還想看。按 local history 用一項回扣，不倒出履歷。 | Agency 在她；不把 COM-02J 改成早有約定或邀約。 |
| 03J.2 交換管道 | 推薦適合傳頁面連結／截圖，不適合線下把內容講完；兩人同意加 Discord，完成可接收訊息的必要確認。 | 全路徑 contact earned；不展示 creator profile/private community。 |
| 03J.3 普通道別 | 她仍只有幾句話，兩人回各自行程；不以尷尬說明或 guardrail narration 證明非約會。 | 與下一段的時間／媒介轉換明確。 |
| 03J.4 晚上克制首訊息 | 她先送推薦頁／一張相關截圖，附短說明；不一開場就大量轟炸。男主先看內容。 | 推薦真的送出，平台交換不是空 payoff。 |
| 03J.5 真正接住內容 | 男主對可見內容回一個具體可討論的點，允許暫定觀察；她接住或補正。 | 所有路徑有 mutual content uptake；非最懂作品者才能解鎖她。 |
| 03J.6 文字展開 | 她接著分析，傳 meme／截圖，補充並改正前一句。訊息有回合、間隔和男主正常回應，非一整頁 character essay。 | 同一主見／幽默在不同媒介展開；不是另一人格。 |
| 03J.7 當下小停頓 | 男主從收到的文字感到她打字比當面熱鬧；旁白只停在親眼看見的節奏差異。 | 不診斷她、宣稱真正的她、當治好社恐的成就。 |
| 03J.8 她確認節奏／玩家選擇 | 她確認自己是否講多了；三種回覆 intent 均合理。接著聊可延長到較晚，另兩支自然收束並保留分享。 | 本地 choice 差異、她的反應與下次主動餘裕，無數值獎懲。 |
| 03J.9 Rejoin / exit | 每支完成自己的反應與道別，合流只交付可继续分享的聯絡狀態及一次 base familiarity。 | 無新 exposition；不抹平三支 reply style，不設 major/open-dating/alias state。 |

## Callback selectors and missing-history behavior

只讀 mainline 的可信 topic 或 replay-local snapshot；replay 不借 live state。下表是 intent selector，不是新選項或三段都要播放。

| Available local history | Permitted opening callback | Must not imply |
| --- | --- | --- |
| `jyc_second_topic=her_art` | 輪廓／姿態／重心如何讓同一角色仍可辨認，轉到推薦內可見內容。 | 男主看過她完整作品、知 creator 身份、講過所有 shared_work 細節。 |
| `shared_work` + trustworthy `jyc_first_topic=visual_design` | COM-02J 的暗部／少量亮處與視線閱讀。 | 已深入研究本幕的新作品。 |
| `shared_work` + trustworthy `worldbuilding` | COM-02J 的環境分區、氣氛參考與角色原創的區別。 | 推薦是她原創作品，或知道未披露世界設定。 |
| `shared_work` + trustworthy `edition_value` | COM-02J 的註釋可讀性與反面教材幽默。 | 已有別的版本購買／分享承諾。 |
| `shared_work` without trustworthy first topic | 已共同談過設定集可供構圖／色塊參考，或退為共同作品推薦。 | 倒填 `jyc_first_topic`，或推定 first choice。 |
| `general_praise` | 她當時把亂圖層關掉的普通小幽默，然後由她把新推薦說明白。 | 當時也完成了 her_art 的深聊／技術盤問。 |
| missing / unknown / untrusted `jyc_second_topic` | 只用已成立的共同作品／咖啡店脈絡及她本次找到推薦。 | 前次選項、統計或具體 first topic；不得自動按最高 familiarity 猜 history。 |

若兩個 topic 欄位可信性不同，只在其各自授權範圍使用；`jyc_first_topic` 本身不覆蓋可信 second-topic 分支。缺歷史是可用的中性呈現，不是 blocked 或把玩家踢出 scene。若 COM-02J 真正未完成／姓名與相識前置不成立，是 entry gate failure，不能用 fallback 捏造相識。

## Local choice / rejoin semantics

只設一組晚間收束 choice；前面的首則接住內容在全路徑成立，避免把 required online contrast 藏成考題。以下是 provisional design keys，Scene/Dialogue 才確立尚未入 save contract 的 stable choice/node IDs；本 pass 不改既有 IDs。

| Design key | Player intent | Her response / pacing | Next initiative residue | Common rejoin |
| --- | --- | --- | --- | --- |
| `continue_content` | 真的還想聊，挑一個目前內容點請她接著說／提出自己的看法。 | 她回到同一題目多展開幾個回合，兩人聊到較晚；仍可自然各自休息。 | 下次她可較直接接續作品分享，不解讀成隨時可打擾。 | 本支完成反應和晚一點的普通道別後，03J.9。 |
| `warm_close` | 清楚接住分享與一項內容，但今晚需要收束。 | 她確認收到，收好當前話題，普通道別；不受傷、不因短回補償更多 exposition。 | 下次可主動分享，但先短訊息確認節奏；不是降低關係或懲罰。 | 本支完成收束反應後，03J.9。 |
| `save_for_later` | 對資料仍有興趣，想自己看過／消化後再接，不承諾時刻。 | 她把已發的連結／截圖留在對話裡，當晚停下；不要求男主給進度。 | 她先給這個題目空間，下次可用另一小點或簡短確認，不視作拒絕本人。 | 本支完成留待之後的回應後，03J.9。 |

Choice wording 不設「妳終於肯說話／我最懂妳」等明顯道德題。三支都維持 contact_jyc，不額外加 F/T/C/K、不設拒絕／違規旗標。`jyc_com03j_reply_style` 是為下一次訊息 initiative 保留語意的 proposed runtime enum（上述三值）；不是 intimacy meter，也不是本 pass 已完成 wiring。後續 COM-03M 若使用它，只能調整訊息開頭／分量與當地 acknowledgement，不免費授予邀約或親密、不自動改 focus。

Rejoin 相同的是必要事實：管道已建立、推薦已送出、男主具體回應、她線上展開、普通收束。不同的是這次對話延長／今晚收束／留待內容；共用 exit 不能插入另一支才发生的 chat-until-late 或未承諾的下次安排。

## State mapping and successor hook

```yaml
requires:
  - COM-02J completed
  - player_knows_jyc_name == true
  - jyc_knows_player_name == true
forbids:
  - contact_jyc == true
set_on_mainline_completion:
  contact_jyc: true
  relationship.jyc.familiarity: increment 1, once
  jyc_com03j_reply_style: continue_content | warm_close | save_for_later  # proposed runtime-only persistence
read_only_callback:
  - jyc_second_topic
  - jyc_first_topic, only for trustworthy shared_work detail
unchanged:
  - relationship.jyc.trust/chemistry/compatibility/romanticSignal
  - jyc_alias_private/jyc_alias_exposed
  - jyc_seen_in_element/jyc_home_space_comfort
  - all repair/pressure flags
  - focusHistory/recentFocus/lastMajorDate
  - exclusivity/deception and all other-character knowledge
```

`unchanged` means preserve entry values, not force false. Mid-scene save/reload later must not grant another base increment; Memory replay holds local choice state and returns without mutating the mainline. These are required downstream verification intents, not tests executed in this design pass.

COM-03M may consume contact_jyc and the actual reply style; this scene does not grant its complete prerequisites or set `open_dating_unlocked`. No scheduler, major invitation, voice call/co-op, home-space or late-route setup is authored here.

## Must not and verification boundary

Canonical contract `must_not` is binding. Names/work facts and COM-02J choices are preserved; all callback branches remain faithful to the actually played history; neither phone account nor outgoing meme reveals anonymous creator identity. Other heroine facts are not creative input.

Own-stage review checks contract schema, predecessor facts, callback/fallback coverage, three intent branches/rejoin, full-path contact/F+1, and knowledge/relationship limits. It does not replace independent Narrative QA. No dialogue naturalization sweep, build/runtime test, image review or Human preview is claimed before its respective stage actually runs.
