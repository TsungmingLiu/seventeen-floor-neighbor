# Narrative Continuity Contract

Version: 1.0.0

Machine schema：`.ai/schemas/narrative-continuity.schema.json`。

## Purpose

用少量 semantic labels + natural-language constraints 保存跨 scene 的 relationship、knowledge、intent 與 payoff boundary。它不是 runtime stat table，也不是用 score 模擬創作判斷。

## Required shape

```json
{
  "schema_version": "1.0.0",
  "scene_id": "COM-00",
  "lifecycle": "CANONICAL",
  "source_scene": "docs/narrative/scenes/vertical-slice/COM-00.md",
  "entry_state": {
    "relationships": [
      {
        "subject": "xu_tang",
        "toward": "protagonist",
        "label": "strangers",
        "constraints": ["不知道姓名；只知道 1703 今晚有人搬入。"]
      }
    ],
    "knowledge": [],
    "constraints": []
  },
  "scene_function": [],
  "character_intent": [],
  "player_information_gain": [],
  "emotional_arc": [],
  "required_payoffs": [],
  "exit_state": {
    "relationships": [],
    "knowledge": [],
    "constraints": []
  },
  "must_not": [],
  "implementation_mapping": {
    "runtime_only": true,
    "flags": {}
  }
}
```

## Label rule

Labels 要 semantic、可讀、數量少，例如：

- `strangers`
- `strangers_with_specific_shared_context`
- `recognizable_neighbors`
- `familiar_neighbors_with_boundaries`
- `interested_but_bounded`

不要建立通用十級 intimacy ladder。若 label 不足以表達界線，在相鄰 `constraints` 寫自然語言。

## Runtime mapping boundary

`implementation_mapping.flags` 可以保存 engine 所需的 boolean/numeric/enum，但必須 `runtime_only: true`。例如 `F_XT: 1` 只表示 current runtime mutation，不代表 creative contract 把 familiarity 定義成數字一。
