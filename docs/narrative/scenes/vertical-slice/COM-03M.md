# COM-03M — 一週訊息 montage → OPEN-A

> Lifecycle: **CANONICAL**（scene-local design binding）
>
> Status: **DESIGN / DRAFT — 非 LOCKED**。只含 narrative design／outline；沒有 final dialogue、Narrative QA、CG 或 Human narrative preview acceptance。
>
> Task: ND-COM03M-001 / content_writer / narrative_design；source ref: `b193e5056d64c3b200dae784fad4d05fc383943e`。

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/COM-03M.json`
- 這份 stub 綁定後續 scene-dialogue source_scene；不以 CANONICAL lifecycle 推定 Locked Scene 或已獨立驗收。

## Entry / exact predecessors

至少一個已取得的 contact。Xu 訊息讀 `COM-03X` exit；Jiang 訊息讀 `COM-03J` exit，兩者互不補造。Jiang never_met／known-but-not-contacted 均略過她的整段訊息；已 contact 才讀 Discord 與當次 reply style。單 Jiang contact 同樣可成立，不強制新增 Xu contact。

| Immediate contract | SHA-256 at source ref | Owns |
| --- | --- | --- |
| `content/production/narrative/opening-ch1/COM-03X.json` | `81b6c71fedb43b4d32c025a2d190dea9c1138905680a99562efa417b522d507c` | Xu Line、普通鄰居邊界、有限印刷／設計與附近資訊 |
| `content/production/narrative/opening-ch1/COM-03J.json` | `582918460ef2cef867a9c009e97d003313c05e236c3d814af80fe68949c3c1ce` | Jiang Discord、作品訊息與可信 local topic/reply history；非匿名創作身份 |

這些是 continuity inputs，並不宣稱 prior Human story acceptance。Xu/Jiang 的 narrative preview／integration gates 仍由各自後續 production 記錄核對。

## Outline（非 playable prose）

1. **第一兩天，有理由接話。** 已 contact Xu：收件／附近資訊延續。已 contact Jiang：已收到的作品推薦延續。兩邊都沒有的 entry 不執行本幕，不能在此補交換帳號。
2. **各自的生活穿插。** 男主處理工作後吃飯、整理尚未收完的搬家箱或讀自己的作品；至少兩種生活內容，不能都是加班。Xu 偶爾分享生活小事／輕問候；Jiang 從作品延伸 meme、遊戲或小抱怨。內容以當下傳來的資訊為限，不代看她们不在場的生活。
3. **忙碌一天。** 雙 contact 才有兩則通知與一次具體 action choice，先回 Xu／先回 Jiang／先完成手邊工作再回。每支有實際 local 回覆節奏與反應，再自然合流；另則可以稍晚接上。不是另一方受傷、被選掉或 cooling。單 contact 保留工作／回訊息節奏，不造選人 UI。
4. **男主也想分享。** 由他主動傳一件生活小事或對作品的真實看法；他能表達自己今晚想休息、想繼續或留待之後。許棠不只照顧人，雨澄不只輸出長分析；回應可以普通、稍遲、短暫落空，不硬湊 punchline。
5. **收束與下一件可做的事。** 已 contact Xu 接週末中山設計書話題；已 contact Jiang 接限定展資訊。不是宣告約好，讓下一幕能依當地條件問同行。雙 contact 才雙入口；單方／個人生活亦接 OPEN-A。

以上為段落功能，具體 narration 與 dialogue 留給 fresh scene-dialogue pass；第一人稱當下 POV 不讀心，不用 guardrail 旁白解釋關係狀態。

## Choice / rejoin boundary

只規劃忙碌 beat 的一次 action choice，不是 warm/candid/playful expression choice。若後續 writer 有必要增加 expression choice，須 exactly 三 stance 且三個都是合理成年人回應，不能為了湊 interaction 增加無意義選擇。先後差異為 Local；若保留 callback，只能依真實 choice history 作 Echo，不能改 Story Map 可達集合。單 contact 變體不需要這個選人節點；三種 contact 走法均合流同一 OPEN-A entry，保留各自 contact knowledge。

回覆先後不形成 major attention investment。訊息／生活小事不能被回填成已接受邀約、共同外出或 missed plan。這裏不製作整個 week calendar，也不設回覆 quota／streak。

## Implementation mapping / handoff

Contract 只列 `contact_xu || contact_jyc` prerequisite、既有兩 contact 的 read-only gating、完成時 `open_dating_unlocked=true`。若需要呈現 COM-03J 主動餘裕，讀可信 `jyc_com03j_reply_style`；未知則中性。具體 choice/node IDs 與 replay-local snapshot 由 dialogue／integration pass 在 stable-ID 規則下確定；Memory replay 不借 live state 補另一方 contact／前事，也不向主線寫入 completion。

`open_dating_unlocked` 是 OPEN-A entry，不是 date approval、eligible heroine 清單或 slot reservation。下一幕擁有兩個有限 authored major slots、當地邀約與接受／counteroffer／婉拒、solo/rest/wait 及 slot consumption；本幕不新增 scheduler／focus／RE／reopening／repair 欄位。後續活動仍遵循 XT-04、JYC-05 各自 prerequisites，無第三 slot。

Fresh scene-dialogue worker 應取得本 contract、這份 stub、適用 voice facts 與必要 contact/local-history boundary；只在本設計內產出對白，再交 independent narrative_review。沒有 final dialogue 或視覺規劃由本輪交付。
