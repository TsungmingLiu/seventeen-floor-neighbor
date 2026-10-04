# OPEN-A — 第一個空檔

> Lifecycle: **CANONICAL** task-local design artifact
>
> Status: **DESIGN / DRAFT — NOT LOCKED**
>
> Pass: `content_writer / narrative_design`; scene dialogue、independent Narrative QA、narrative preview Human review 均尚未完成。

## Narrative Continuity Contract

- Canonical contract: `content/production/narrative/opening-ch1/OPEN-A.json`
- 本文只界定第一 window 的實際入口及 invitation/life outcome；JSON contract 為 continuity authority。沒有 final narration／dialogue、camera、CG 或 runtime node implementation。

## 有限範圍與入口

COM-03M 的約一週普通訊息收束之後，男主有一段自己的空檔，仍有搬家箱、工作與想看的作品。接回已 contact 方實際收到的活動話題。此時才實際進 OPEN-A，記 `open_a_entered=true`。OPEN-A 整體固定兩個 major windows，這次只演第一個；第二個未開，沒有自由行事曆。

`contact_xu=true` 才有許棠的 Line 與中山設計書入口；`contact_jyc=true` 才有雨澄的 Discord 與限定展入口。未見／見過卻未 contact 雨澄都不顯示她。前置 harm/closure 若不容許邀約，該邀約入口略過，不能靠本幕修復或重開。單 contact 仍有完整生活入口；雙 contact 沒有 route selector，所選實際互動不替另一人發訊息。

## 第一 window authored beats

1. **自己的生活與當地 action**：男主確認空檔、看到未整理箱子，想找書／看作品，也可能只想休息。依 available contact 呈現接許棠同行提議或主動問她、問雨澄同行、先安排自己生活等具體行動。選項數依 contact variant；不另設全域「選誰」選單。
2. **許棠 entry**：她本來就要在第一 window 下午到中山看設計書，可主動問同行；若男主先問也合流到同一下午提議。可答應原時段、問能否提早、或婉拒。她不接受提早，維持自己的安排並保留下午提議；玩家可接原時段或說這次不約。不強加 deadline 工作、客戶事件或既往共同外出。
3. **雨澄 entry**：男主引用收到的限定展資訊問下午同行。她要先完成手邊作品，拒絕所問較早時段，提出同 window 較晚的下午；玩家可接受替代時間或說時間不合。先演她回應實際邀請，再給玩家決定；不把「邀雨澄」按鈕視為她同意。不新增展覽名稱、營業時間、票務、商業委託或匿名身份。COM-03J reply style 最多調整接話主動性，未知 history 使用中性版。
4. **收束邀約**：同意是双方實際確認活動與同 window 時段，停在 pending arrangement；婉拒／替代時間不合有對方當地 acknowledgement，再回到男主生活。拒絕不合時段不表示拒絕關係。第一 window 最多一個邀約 thread，不反覆試遍另一人，不預設另一人知道結果。
5. **未成行的生活片段**：不邀或未成行後給三個具體 action，選一次即演完第一 window：solo 整理剩下搬家箱、把住處收出能用的空間；rest 完成手邊工作、收好電腦並早睡；wait 看完已收到的作品、放下手機轉回晚間生活。各支要有實際 action、男主當下感受與自然結尾，不能只顯示 outcome label。wait 不保證有人傳訊息，rest 不需女主批准。

回覆期限是第一 window 開始出門／安排自己的下午前的當地確認，不是遊戲外計時器；玩家在這段 authored sequence 內明確回覆或不邀，再進 outcome。這次不提供「答應後不回／失約」行動，所以沒有 cooling。counteroffer 只換第一 window 已寫出的時段，不借第二 window、不另送 slot。

## Outcome boundary 與保存／恢復

下列是尚待 integrator 建立的 **distinct reachable semantic boundary IDs**，不是聲稱已有 runtime nodes。每個 endpoint 均須保存結果，不能全部跳到丟失 outcome 的共用展示終點。

| Boundary ID | `open_a_entry_outcome` | `open_a_window1_consumed` | 本次真實發生與下一步 |
| --- | --- | --- | --- |
| `OPEN-A-ENTRY-PENDING-X` | `pending_xu` | false | 同意中山設計書、第一 window 原下午；停在未 authored XT-04 前。 |
| `OPEN-A-ENTRY-PENDING-J` | `pending_jyc` | false | 同意限定展、第一 window 較晚下午；停在未 authored JYC-05 前。 |
| `OPEN-A-ENTRY-SOLO` | `solo` | true | 搬家箱片段完成；停在第二 window 前。 |
| `OPEN-A-ENTRY-REST` | `rest` | true | 工作收束／早睡片段完成；停在第二 window 前。 |
| `OPEN-A-ENTRY-WAIT` | `wait` | true | 看完作品、放下手機片段完成；停在第二 window 前。 |

所有 boundary 都保留 `open_a_entered=true`。首次 entry 才初始化 `unresolved`／未消耗；resume 不能重設。中途存檔保留当下 choice/node position，不在重新 load 時自動重送訊息。outcome commit 和生活 completion 消耗是一次性 boundary mutation；resume 回到已選的 exact boundary，Memory replay 不向主線寫旗標。

pending 活動／時段由 outcome 固定還原，不另存自由日期或雙方 scheduler。接受還不是 major investment、anchor completion 或 window consumption。將來真正 XT-04／JYC-05 completion 才消耗第一 window 一次；本次 preview 不能用假 date stub 代替。生活 outcome 已消耗第一 window，第二 window 仍未開。`open_a_entered` 是歷史 gate，不是 OPEN-A 已完成／還有新 slot／可直接進 OPEN-B。不得預留第二 window、生成第三 slot 或宣稱全 OPEN-A 可玩。

## Author checks 與下游界線

需由 author 確認 JSON schema／canonical binding、contact variants、許棠主動／男主主動合流、雨澄 counteroffer／婉拒、三種生活 outcome、所有 boundary 的 pending versus consumed 差異。這些是 design author checks，不能冒充 independent Narrative QA。

後續 fresh scene-dialogue worker 只在本 contract 寫第一 window 的訊息、生活片段與自然收束；pending endpoints 停在 anchor 前，生活 endpoints 停在第二 window 前。台詞以第一人稱當下視角保持 knowledge boundary，不能把這份守則朗讀成 narration。獨立 Narrative QA、整合後 preview 及 Human narrative review 均由下游處理。
