# Content Production Specification

> Lifecycle: **CANONICAL**
>
> Version: 1.1.0
>
> Updated: 2026-09-25

本文件定義 production content 的單一路徑。語言規則是中文 prose + English canonical schema/identifier/production terminology；固定術語不得自行換成近義翻譯。

完整 Human request 的 parent Work session 依 `.ai/PRODUCTION_ORCHESTRATION.md` 只做 Production Coordinator control plane；各層由 fresh bounded worker 執行，從 dependency DAG、Task Packet、Handoff、Production Run Ledger 推進。Continuity lives in canonical artifacts, not worker memory。

## 1. Canonical pipeline

```text
Narrative Design
  → Scene / Dialogue
  → Narrative Review
  → Visual Production / Canonical CG Manifest
  → Deterministic Render Packet
  → Render / Visual Review
  → Asset Ingest / Runtime Integration
  → Playable Review
```

CG 成本目前是 immediate blocker，但它不擁有 narrative。若 CG 數量需要下降，先調整 shot economy；不得把「較容易生成」當成改寫 scene purpose、character decision 或 relationship pace 的理由。

## 2. Layer ownership

### Narrative Design

輸出 `Narrative Continuity Contract`，回答：

- 本 scene 為什麼存在；
- entry/exit relationship state；
- character intent；
- player information gain；
- emotional arc；
- required payoff；
- forbidden shortcut / `must_not`。

這層使用少量 semantic labels + natural-language constraints。禁止為了量化而新增 `trust_score`、`attraction_score`、`intimacy_level: 37` 等不必要 schema。

### Scene / Dialogue

`Locked Scene` 在 Narrative Continuity Contract 內完成 narration、dialogue、choices、branch/rejoin、state mapping 與 `Semantic Visual Beat`。它可以寫「她先看書再抬眼」「兩人保持普通陌生人距離」，但不寫 image prompt、reference transport 或 adapter instructions。

### Visual Production

`CG Planner` 只從 approved Locked Scene 選擇值得 render 的 beat，建立 `Canonical CG Manifest`。每個 `CG Manifest Entry` 必須 render-ready and self-contained；任何未決 creative ambiguity 都退回前一層。

`CG Renderer` 只接收 entry、deterministic `Render Packet` 與 entry-declared refs；不得重新讀 narrative/project policy 做二次解讀。

## 3. Narrative continuity rule

`Narrative Continuity Contract` 的 canonical schema：`.ai/schemas/NARRATIVE_CONTINUITY.md` 與 `.ai/schemas/narrative-continuity.schema.json`。

Required semantic states：

- `entry_state.relationships[]` / `exit_state.relationships[]`：例如 `strangers_with_specific_shared_context`、`familiar_neighbors_with_boundaries`；
- `entry_state.knowledge[]` / `exit_state.knowledge[]`：誰知道／不知道什麼；
- `constraints[]`：natural-language boundary；
- `scene_function[]`、`character_intent[]`、`player_information_gain[]`、`required_payoffs[]`、`must_not[]`。

Runtime boolean/numeric flags 只放在 `implementation_mapping`。它們必須可追溯到 semantic contract，但不能反過來取代 contract。

## 4. Review gates

### Narrative Review

在 visual planning 前確認：

- entry/exit relationship pace 沒有跳級；
- character knowledge 與 reveal timing 正確；
- dialogue voice 與 choice intent 成立；
- branch 在 rejoin 後相容；
- required payoff 已完成；
- `must_not` 無違反；
- semantic visual beat 沒有增加新故事事實。

### Manifest Review

在 rendering 前確認：

- entry 能在不讀 scene 的情況下被執行；
- narrative purpose / `must_show` / `must_not_imply` 清楚；
- reference bindings exact and minimal；
- `Visual Continuity State` 完整；
- camera/composition/include/exclude/output/acceptance 無互斥；
- reaction entry 鎖定 base，且 `allowed_changes` 足夠窄。

### Visual Review

Candidate 僅對 manifest entry、refs、accepted base 評估，不回頭自由解讀整個 route。

## 5. Fixed terminology

| Canonical term | 中文說明 |
| --- | --- |
| `Narrative Continuity Contract` | scene 的故事邊界與跨 scene 承接 |
| `Locked Scene` | 已批准的 scene/dialogue/choice artifact |
| `Semantic Visual Beat` | writer 可標記、但尚未 render-ready 的視覺事件 |
| `Canonical CG Manifest` | visual production 的 source of truth |
| `CG Manifest Entry` | exactly one render deliverable/sequence keyframe 的完整 spec |
| `Visual Continuity State` | 人物、camera、environment 的連貫狀態 |
| `Reference Binding` | exact role → source identity/filename 的綁定 |
| `Render Packet` | deterministic projection 的 generated execution artifact |
| `Deterministic Projection` | 無自由摘要、固定欄位順序的 mechanical conversion |
| `Execution Adapter` | Chat manual / Work batch / API 的 transport envelope |
| `Reference Preflight` | 確認 manifest 指定的 image pixels、role、filename；Chat manual 由 Human 附圖，Work batch 可從 connected source 取得 |
| `Accepted Base` | reaction edit 的 approved source image |

文件與 code 只使用右側說明來解釋，不另創「鏡頭包」「繪圖指令集」「提示詞編譯器」等同義名。

## 6. Explicit non-goals

- orchestration engine；
- automatic retry / image scoring；
- new UI / W5；
- character reference system redesign；
- Chat/Work/API 各自維護 creative prompt；
- 用 schema score 取代 Human narrative judgment。
