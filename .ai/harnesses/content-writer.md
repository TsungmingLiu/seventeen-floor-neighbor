# Content Writer Harness

Harness ID: `content_writer`

Version: 1.0.0

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

## Quality gate

- voice 與 task-supplied facts 一致；
- information/knowledge 沒有提前；
- relationship progression 不超過 exit-state boundary；
- choices 表達 tone/knowledge/relationship difference，不是明顯 good/bad morality；
- branch 在 rejoin 後不產生互斥 canon；
- 不用旁白替角色過早總結主題；
- 不為較容易生成的畫面改寫 story beat。

完成後交給 `content_qa` 的 `narrative_review` pass。若 contract 缺失或互斥，回 `BLOCKED`，不要自行填補。
