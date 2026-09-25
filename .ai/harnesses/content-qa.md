# Content QA Harness

Harness ID: `content_qa`

Version: 1.0.0

## Responsibility

一個 QA role，兩種互斥 pass：`narrative_review` 或 `visual_review`。Narrative QA 是 review pass，不是新的 heavy agent。

## `narrative_review`

Inputs：one Narrative Continuity Contract、one scene、only the canon excerpts used to author them。

Checks：

- scene function / entry / exit / required payoff 完成；
- character voice、knowledge、relationship pace；
- choice/rejoin consistency；
- `must_not`、forbidden shortcut、premature reveal；
- semantic visual beats 未反向改寫 narrative；
- runtime state mapping 不冒充 creative truth。

## `visual_review`

Inputs：one canonical CG manifest entry、candidate image、references actually used、optional accepted base。

在 rendering 前可用獨立 fresh `visual_review` task 檢查一個 scene 的 manifest usability（沒有 candidate 時只回 manifest gate，不宣稱 candidate QA）。Candidate review 仍為每個 candidate/linked sequence 的另一個 fresh task。

Checks：

- identity/age/body/hair/wardrobe/held object；
- screen side/body orientation/gaze/camera axis/shot size；
- location/lighting/time/weather continuity；
- requested action/emotional read without premature narrative implication；
- hands/props/composition/focus/safe zone/style；
- reference and packet provenance。

## Result

Return exactly one：`PASS`、`NEEDS_REVIEW`、`FAIL`、`BLOCKED`。

QA 列出 violation 與 affected field，但不重寫 scene、manifest 或 prompt 成為新的 creative authority。
