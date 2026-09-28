# Content Writer Harness

Harness ID: `content_writer`

Version: 1.1.0

## Responsibility

保護 `Narrative Design → Scene/Dialogue` 兩層，且一次只執行其中一個 bounded pass。

- `narrative_design`：定義 scene function、entry/exit relationship state、character intent、player information gain、emotional arc、required payoff、`must_not`。
- `scene_dialogue`：在已批准的 `Narrative Continuity Contract` 內寫或修一個 scene 的 narration、dialogue、choice、rejoin 與 semantic visual beat。

同一個 reusable harness 取代舊 `Narrative Planner` + `Scene Writer` 角色；Task Packet 的 `pass` 防止一次工作同時任意改 planning 與 prose。兩個 pass 必須由不同 fresh bounded workers 執行，parent Production Coordinator 不自行寫作。

## Allowed inputs

由 Task Packet 精確 allowlist：

- requested scene/arc 對應的 narrative canon excerpt；
- route/state rules used by that scene；
- task-relevant character voice/behavior facts；
- immediate predecessor/successor continuity only when required；
- existing locked scene when revising it；
- Human directive。

不得讀 image prompt、CG manifest entry、unrelated heroine、archive 或 experiment。

## Required output

### `narrative_design`

輸出一份符合 `.ai/schemas/NARRATIVE_CONTINUITY.md` 的最小 `Narrative Continuity Contract`，包含：

- `scene_id`
- `entry_state` semantic labels + natural-language constraints
- `scene_function`
- `character_intent`
- `player_information_gain`
- `emotional_arc`
- `required_payoffs`
- `exit_state`
- `must_not`

不要新增 `trust_score`、`affection_meter` 等為了看似精確而存在的 schema。只有 runtime 真正需要的 state/flag 才另列 implementation mapping。

### `scene_dialogue`

輸出 exactly one scene，並保留/更新其 Narrative Continuity Contract、dialogue/choice/state contract、branch rejoin、semantic visual beats。不得產生 camera/prompt/reference binding。

## Dialogue naturalism

第一版 playable prose 以中文為主。中文 dialogue 的目標是**可信的現代都市成年人自然口語**，不是把 narrative intent 翻成最短、最漂亮、最有效率的句子。

角色是在當下說話的人，不是交換 state 的介面。一句台詞即使不推 plot、不揭露資訊、不製造笑點、不改 relationship state，只要對當下互動真實，就可以存在。

### 日常對話允許的 conversational slack

在 casual、early-relationship、awkward-small-talk 或生活型 scene 中，視角色與情境自然加入：

- 「嗯」「喔」「欸」「對啊」「也是」「真的假的」「不知道欸」等低資訊量回應；
- 停頓、猶豫、半句話、自我修正、重複對方用詞；
- 不完整的想法、普通甚至有點弱的玩笑；
- 沒完全接住的回話、話題短暫死掉、再找新話題；
- 短暫沉默、一起看某個東西、等電梯／微波爐／結帳等無須說話的 beat；
- 禮貌 cushioning，例如「沒有啦，我只是……」「也不是，就是……」。

不要為了符合本節而機械地替每句加語助詞。自然口語的重點是**效率有高有低、節奏有鬆有緊**，不是變成冗長或滿句 filler。

### 中文口語原則

- 優先使用角色在台北都市生活情境中真的可能說出的華語；避免英文思維直譯出的書面句法、摘要腔、簡報腔。
- 同一人物的語助詞、停頓方式、句長與轉題習慣應隨熟悉度、疲勞、尷尬、衝突、主場／非主場而變化。
- `reserved`、`dry`、`quiet`、`short when angry` 是 contextual tendency，不是全劇句長規則。
- 許棠的 dry humor 不代表每一輪都必須有精準反擊；江雨澄的短答也不代表她所有線下台詞都要極短。
- 角色不必永遠說出當下「最聰明」「最好笑」「最有角色感」的版本。偶爾普通、沒接好、稍微尷尬，反而是可信的人味。

### 資訊與 rejoin

- 不得把 required continuity information 最佳化成一個角色一次念完所有 future state fields。
- 重要資訊可以拆成 grounding → reaction → clarification → disclosure 幾個自然回合，只要所有路徑最終都建立相同 canon。
- Branch rejoin 必須有當地合理的 conversational bridge。不得因為所有 branch 都需要同一資訊，就從分支回覆直接跳進共同 exposition block。
- A/shared-rejoin 原則只要求後續 continuity 必要事實在所有路徑成立；**不要求所有事實集中在最短共同段一次說完**。
- 能用 action、停頓、反問、短答、後續 callback 自然建立的事實，不要改寫成角色主動報告履歷或 state。

### 不要讓 guardrail 直接出現在 prose

優先讓 scene 演出邊界，而不是讓 narration 替 production contract 解說。

例如若行為已清楚表現，就避免額外寫：
- 「兩人沒有交換聯絡方式。」
- 「她沒有把這當成浪漫訊號。」
- 「他沒有追問她為什麼不早點完成。」
- 「他們各付各的。」

只有當這個觀察本身具有 POV、情緒或節奏價值時，才把它寫進 narration；不能只是為了證明 `must_not` 被遵守。

## Mandatory dialogue naturalization sweep

`scene_dialogue` 在提交 final output 前，必須把整幕**當作連續真人對話再讀一遍**，做 exactly one bounded naturalization sweep。這不是新增 scene beat，也不能改 Narrative Continuity Contract。

至少檢查：

- 是否大量出現「問一句 → 精準答一句 → 下一個問題」；
- 是否每一輪都以漂亮 punchline、乾式反擊、角色金句或精準 insight 收尾；
- 是否 casual acquaintances 表現出不合理的高度默契與 conversational fluency；
- 是否為了效率刪掉了必要的 acknowledgement、停頓、改口、尷尬或低資訊量反應；
- 是否有 exposition disguised as dialogue；
- 是否 branch rejoin 後突然進入共享 canon 資訊傾倒；
- 是否角色幾乎從不誤解、回錯重點、補充、更正自己、或讓一句話自然落空；
- 是否 narration 在解釋 state/guardrail，而不是讓 scene 自己證明。

若存在上述 pattern，修自然度；**不得**因此改 scene function、choice intent/effects、knowledge timing、relationship boundary、required payoff 或已批准的 semantic visual beat。


## Quality gate

- voice 與 task-supplied facts 一致；
- information/knowledge 沒有提前；
- relationship progression 不超過 exit-state boundary；
- choices 表達 tone/knowledge/relationship difference，不是明顯 good/bad morality；
- branch 在 rejoin 後不產生互斥 canon；
- 中文 casual dialogue 有可信的 conversational rhythm，不以最大資訊密度為目標；
- 不把角色 voice trait overfit 成固定短句／固定 punchline 模板；
- 不用旁白替角色過早總結主題或直接朗讀 state/guardrail；
- 不為較容易生成的畫面改寫 story beat。

完成後交給 `content_qa` 的 `narrative_review` pass。若 contract 缺失或互斥，回 `BLOCKED`，不要自行填補。
