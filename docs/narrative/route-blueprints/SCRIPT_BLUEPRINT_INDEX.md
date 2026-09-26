# Prototype Route Script Blueprint Index

> Lifecycle: **CANONICAL**
>
> Version: 0.1
>
> Updated: 2026-09-26
>
> Scope: 許棠 / 江雨澄 braided prototype 的 **pre-script treatment layer**。本層位於 macro narrative / route graph 之下、Locked Scene / final dialogue 之上。

## 1. Why this layer exists

現有 `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` 已經定義完整雙女主 macro arc、scene purpose、relationship pacing；`PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` 已定義 dependencies、dating state、knowledge state 與 ending topology。

但許多節點仍只有 scene intent + short beats。這會讓 final dialogue worker 需要重新推導：

- 今天為什麼會發生這一幕；
- 誰主動、誰被動；
- choice 如何真正改變 interaction；
- branch 如何 rejoin；
- 另一位女主存在時哪些資訊可被知道；
- scene 怎麼自然接到下一幕。

本 blueprint 把這些空白補成 **可直接轉成 Narrative Continuity Contract / Locked Scene 的 detailed treatment**，但不搶 final dialogue 的工作。

## 2. Authority / conflict order

1. 已批准的 `docs/narrative/scenes/vertical-slice/*.md` 對同 scene 擁有最高 scene-local authority。
2. `PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` 擁有 macro arc、角色弧線與 relationship pacing。
3. `PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` 擁有 dependencies、structural branch、knowledge/state semantics。
4. 本 blueprint 擁有 **pre-dialogue scene progression、branch intent、rejoin logic、transition hook**。
5. final Locked Scene 可以在不改變上述 contract 的前提下改寫 wording、micro-beat、節奏與具體 dialogue。

若本 blueprint 與 1–3 衝突，以 1–3 為準並回報需修正 blueprint。

## 3. Text-first production rule

本 blueprint **不把 CG 視為 narrative prerequisite**。

一個 route 可以依序完成：

```text
macro / route canon
→ detailed pre-script blueprint
→ Narrative Continuity Contract
→ Locked Scene + dialogue
→ narrative QA
→ playable text/content integration
→ visual production later
```

原則：

- 不為「目前沒有 CG」縮短 scene 或改掉 relationship beat。
- scene 可先以 runtime 已有的 background / sprite / message UI / text presentation 完成可玩版本。
- visual beat 只記 semantic event；是否值得做 CG 由後續 Visual Production 決定。
- missing CG 不得成為下一個 narrative scene 的 blocker。
- reaction / optional / reward CG 尤其應在 script 與 gameplay 穩定後再補。

本文件只定 narrative authoring 方向，不自行修改 runtime fallback implementation contract。

## 4. Blueprint files

- `SCRIPT_BLUEPRINT_COMMON.md`
  - COM-00 → COM-03M
  - OPEN-A / OPEN-B / BRAID-C
  - SH-01 / SH-02
  - RE-X / RE-J
  - 共通 transition logic
- `SCRIPT_BLUEPRINT_XU_TANG.md`
  - XT-04 → XT-14
  - XT-G / XT-F / XT-D
  - XT-AF-01 → XT-AF-03
  - XT-FC / XT-DC
- `SCRIPT_BLUEPRINT_JIANG_YUCHENG.md`
  - JYC-05 → JYC-14
  - JYC-G / JYC-F / JYC-D
  - JYC-AF-01 → JYC-AF-03
  - JYC-FC / JYC-DC
- `SCRIPT_BLUEPRINT_OVERLAP_AND_ENDINGS.md`
  - TENSION / COMMIT
  - HONEST-X / HONEST-J
  - BOTH-H / BOTH-L
  - OV-01 / OV-02
  - SHURA-01 / SHURA-02
  - DECIDE / BOTH-D / BOTH-DC
  - path-level playthrough contracts

## 5. Required treatment shape

每個 major scene treatment 至少包含：

- **Entry condition**：這一幕發生前已知什麼、關係在哪。
- **Immediate setup**：為什麼是今天、為什麼在這裡。
- **Dramatic job**：這一幕非存在不可的原因。
- **Scene progression**：通常 6–10 個能自然轉成 runtime nodes 的 beats。
- **Choice forks**：玩家行為差異；避免 obvious moral quiz。
- **Reactive variants**：只列會改 subtext 的重要 state，不複製整幕。
- **Rejoin**：不同 choice 在哪裡重新匯合。
- **Exit state**：關係、knowledge、flag 或 intent 的變化。
- **Next hook**：下一幕怎麼從人物行為自然發生。

## 6. Writing constraints

- 角色不能替作者朗讀主題。
- conflict 不靠單一愚蠢誤會維持。
- 好路徑也允許 awkwardness、停頓、說錯半句再修正。
- bad/weak choice 通常留下 pattern evidence，而不是立刻 game over。
- 女主都必須有主動、拒絕、照顧男主、看穿男主的時刻。
- 另一位女主只能知道實際 scene 中取得的資訊。
- 同時 dating 在 exclusivity 前不是道德失敗；欺瞞才是。
- Friendship 是完整結局；Distance 是 closure，不是 punishment。
- late lock 以前避免讓任一女主突然從世界消失。
- reactive variants 盡量在同 scene 用少量台詞/旁白變體解決，避免 route combinatorial explosion。

## 7. How the next production pass should use this

下一步不要一次把整條 route 寫成 monolithic script。

建議一個 fresh bounded worker 一次處理 exactly one scene：

1. 讀本 index。
2. 讀該 heroine / shared blueprint 中該 scene。
3. 讀 macro spec 對應 excerpt。
4. 讀 route/state 對應 dependency excerpt。
5. 若該 scene 已有 Locked Scene，讀它並以它為 scene-local authority。
6. 先產 Narrative Continuity Contract。
7. approval 後由另一 fresh worker 寫 Locked Scene / dialogue。
8. narrative QA 通過後即可進 text-first playable integration；CG 另排 downstream batch。
