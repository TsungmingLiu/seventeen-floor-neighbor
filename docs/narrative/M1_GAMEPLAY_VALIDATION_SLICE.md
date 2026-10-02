# M1 Gameplay Validation Slice：早期雙線與重新靠近

> Lifecycle: **GENERATED**
>
> 狀態：範圍提案；不是批准的 Scene Contract、Locked Scene、Narrative QA 或 playable acceptance。
>
> 來源基線：`c5251cd2ac58e8daca0d034a0799b60c456dd7d7`；2026-10-02。
>
> Task：`M1-SLICE-SCOPE-001`／`content_writer`／`narrative_design`。

## 1. 提案與要回答的問題

提案：從現有 Opening 連續推進至雙方 contact、OPEN-A、early 1-on-1、SH-01 與一次有條件的 RE-X／RE-J。
以既有四幕 major scenes `XT-04/05`、`JYC-05/06` 建立最小早期場景池；先不進 OPEN-B 的 midgame pool。
優先驗證兩條完整核心走法：`XT-04 → JYC-05 → JYC-06 → SH-01 → RE-X`，以及 `JYC-05 → XT-04 → XT-05 → RE-J → JYC-06 → SH-01`。
前者讓許棠感受到近期注意力轉移；後者讓雨澄重新進場，再把共同興趣帶回線下。
順序、投入與回覆要留下不同後果，不把兩位女主變成選一次就消失的攻略路線。

**30–60 分鐘是首輪完整閱讀的測量目標，尚無實測結果。**
範圍包含 Opening；不把作者閱讀時間、快速跳字或 Memory replay 當作首玩時長。
不足 30 分鐘時先檢查互動節奏與選擇理解，不靠補 exposition 或增加晚期場景湊時間。
超過 60 分鐘時先處理重複資訊、montage 與等待節奏，保留人物主動性及必要 payoff。

| 驗證項目 | 既有承載點 | 可觀察的問題 |
| --- | --- | --- |
| 雙女主吸引力 | XT-04、JYC-05 | 玩家能否說出具體生活／互動差異？ |
| 男主的需求與缺點 | XT-04 的行程、XT-05 的工作 incident | 玩家是否只是猜「體貼答案」？ |
| attention allocation | OPEN-A；後續 major investment；RE | 玩家是否記得延期／先投入誰？ |
| shared awareness | JYC-06 → SH-01 | 介紹之後是否感到兩條生活線開始交會？ |
| early friction | 行程節奏、代答、指導／故意讓 | 互動變化是否合理且可理解？ |
| repair opportunity | RE-X／RE-J 的重新投入或維持距離 | 能否改變注意力，且沒有免費恢復親密？ |
| 有意義的後果 | recentFocus、互動反應、後續 invitation momentum | 玩家是否感到選擇影響了相處？ |

## 2. 入口、出口與不可越界

入口沿用唯一 playable story entry；保留 `COM-00/01X/01B/01J/02X` 已整合內容及 stable IDs。
新內容從這個基線往後接，不重寫已接受 Opening 對白。
終點是已完成的 SH-01／RE 核心路徑；只提供明確的本次預覽停止位置，不新造結局或角色宣言。
RE 若積極重新投入，只恢復 invitation momentum；下一個尚未製作 major scene 不能被宣稱已可玩。

切片弧線：生活中的相識 → 開始期待訊息 → 分配有限時間 → 人格與步調差異 → 另一方仍在 → 重新選擇投入。
required payoff：兩方各有主動行為；玩家的近期投入可回溯；SH-01 knowledge 由真正介紹取得。
exit state：仍未 exclusivity；存在／鄰居 knowledge 可成立；focus 依實際投入改變；晚期衝突／repair 不成立。

must_not：

- 不加入 COMMIT、BRAID-C、XT-10、JYC-10、晚期 repair、SHURA、late lock 或 ending。
- 不把同時認識／約會自動等同 deception；`recentFocus` 不等同 exclusivity。
- 不讓 SH-01 揭露 date status、alias 或完整親密程度；存在、很親近、約會過必須分開。
- 不把提醒行程、單次代答或一次沒選直接轉成終止關係。
- 不把 RE 當成邊界侵犯已被原諒，不設 `xt_repair_completed/jyc_repair_completed`。
- 不新增 CG、校準研究、公開數值 UI、calendar simulator 或完整 model-checking framework。

## 3. 現況與精確依賴

下表的「製作階段」採 packet 的基線資訊；沒有讀取未 allowlist 的 scene prose 或 QA receipt。
本輪 Human acceptance 由獨立工作記錄；這份提案不代填其結果，也不改寫既有 Visual QA 歷史。
`COM-01B` 是現有 integrated bridge；route dependency table 沒有另列它，不能據此自行新增 gate。

| 節點 | 製作階段 | hard predecessor／必要資訊 | 本切片角色與出口 |
| --- | --- | --- | --- |
| COM-00 | integrated、locked | root | 認識許棠；既有入口 |
| COM-01X | integrated、locked | COM-00 | 許棠初期熟悉度 |
| COM-01B | integrated bridge、locked | 現有 Opening flow；獨立 gate 未由本來源定義 | 沿用 elevator bridge |
| COM-01J | integrated、locked | COM-00；現有 bridge flow 沿用 | 認識江雨澄；姓名不能提前 |
| COM-02X | integrated、locked | COM-01X | 後續 package/contact 的相處基礎 |
| COM-02J | locked；未接 Chapter 1 demo | COM-01J；先前提到安靜咖啡店 | 正式交換名字、作品脈絡；F_JYC |
| COM-03X | S1 candidate；未 integrated | COM-02X；錯放樣本／工作線索 | contact_xu；不是戀愛 milestone |
| COM-03J | blueprint-only | COM-02J；共同作品／推薦脈絡 | contact_jyc；offline/online 對比 |
| COM-03M | blueprint-only | contact_xu + contact_jyc | 一週訊息；open_dating_unlocked |
| OPEN-A | blueprint-only scheduler | COM-03M | 兩個 major slots；focus history |
| XT-04 | blueprint-only | OPEN-A；contact_xu | pace compatibility；xt_respected_pace |
| XT-05 | blueprint-only | XT-04 或足夠 Xu familiarity | support mode／incident；xt_saw_competence_mask |
| JYC-05 | blueprint-only | OPEN-A；contact_jyc；穩定線上聊天 | 她帶路的 major interaction；jyc_seen_in_element |
| JYC-06 | blueprint-only | JYC-05 或足夠 JYC familiarity；線上已玩一兩次 | 家中遊戲；jyc_home_space_comfort |
| SH-01 | blueprint-only | JYC-06 + contact_xu | mutual existence；jyc_knows_xu_is_neighbor |
| RE-X | blueprint-only reactive family | recentFocus=jyc；Xu viable／足夠 familiarity | 玩家實際投入才改 focus；恢復邀約動能 |
| RE-J | blueprint-only reactive family | recentFocus=xu；JYC viable／仍有 contact | 重開 major invitation；不送免費親密 |

正式製作採顯式 predecessor，不用「足夠 familiarity」跳過 XT-04／JYC-05。
JYC-06 的一兩次線上 co-op 是既有 setup 必要資訊，必須在其 bounded design 明確交代承接；不能無前事直接到家。
COM-03M 的先回誰是 reply tendency，不能直接當作兩個 major investments。
SH-01 及其他 shared/common events 不改 recentFocus。

## 4. attention 路徑與尚待決定的排程缺口

canon 的 OPEN-A 允許 `XT→JYC`、`JYC→XT`、`XT→XT`、`JYC→JYC`；本提案不取消後兩種。
兩個不同 anchor 通常是 balanced，單靠「先選誰」不足以觸發 RE。
本切片用後續既有 major continuation 形成真正近期傾向；不把順序硬寫成 exclusivity。
下列 X/J 指 major investment 的 heroine，不是訊息長短或誰說話較多。

| 核心走法 | recent major history | 後果與重新靠近 | qualification coverage |
| --- | --- | --- | --- |
| X04 → J05 → J06 → SH01 → RE-X | X,J,J | 最近兩次 J；X 留在生活中；可重新投資 X 或只聊天 | 雙 major、shared、early friction、RE |
| J05 → X04 → X05 → RE-J → J06 → SH01 | J,X,X；RE 投入後再算 | 最近兩次 X；J 有聯絡且重回前景；J06 再建立 domestic comfort | 同上；額外男主 incident |
| X04 → X05 | X,X | 可 RE-J；J05/J06/SH01 尚須合法到達 | 同方雙 slot 的 return scheduling 尚待設計 |
| J05 → J06 → SH01 | J,J | 可 RE-X；但 contact_xu 不等於已玩 XT-04 | 同方雙 slot 的 Xu anchor return 尚待設計 |

**精確缺口：**兩個同方 slots 用完後，RE 如何恢復尚未玩的 XT-04／JYC-05，不能只靠一句「重新解鎖」假定成立。
這兩個 anchors 在 route table 依賴 OPEN-A；Xu blueprint 也明列第一／第二 slot。後續 OPEN-B pool 沒有它們。
需要 coordinator 在後續 scheduler Narrative Design 決定 OPEN-A prerequisite 是已經歷 window 還是仍有 slot，以及返回邀約的合法位置。
這是排程與 eligibility 的待設計契約，不能由整合 worker 臨時 hardcode，不能新增第三 slot 冒充已有 canon。
若同方路徑無法合法回收兩個 anchors，該路徑只能標 coverage gap；M1 完整無指引 pilot 前必須解決，不宣稱全分支完成。
核心兩條 cross-order 路徑可先分批建成內部測試切片；不能用強制玩家選另一位掩蓋缺口。

focus mapping 也須明定：canon 建議最近兩個同方為該方，一人一個 balanced，語意覆蓋最近 2–3 次。
本提案以最近兩次 major investment 作核心測試期待；採用前必須在 scheduler/state task 記錄精確規則與測試。
RE 點開訊息／碰面不算投入；積極重新約才可更新。不同 choice 的 rejoin 要保留不同 momentum。
「缺席／注意力下降 → 願意重新投入」是本切片的早期關係修復機會。
對 XT-04/JYC-05/JYC-06 的具體摩擦，allowed canon 沒有完整道歉／修復幕；不要聲稱 RE 已修復這些錯誤。
若 M1 要求這類明確衝突修復，應另派 bounded canon-gap 決策；不能挪用晚期 repair 機制。

## 5. 下一個 scene task 與有界 batches

**第一個新的 Narrative Design task：COM-03X。**
交付真正的單 scene continuity contract；本文件不充當該 contract。
packet 必須綁定 actual COM-03X S1 candidate／已有 contract（若存在）、accepted COM-02X immediate continuity，以及 COM-03X macro/blueprint/dependency 節錄。
entry：數次生活互動之後；尚未 contact。function：以錯放樣本具體化工作與自然交換 Line。
required payoff：所有可用 branches 取得 contact_xu；店家／收件資訊後續真的送出；不靠偷看包裹。
exit：熟悉鄰居多一個聯絡管道；沒有 date label、承諾或另一女主的額外 knowledge。
不重新寫 accepted COM-02X；candidate 內容經下一 task 比對後才能採用，不能推定它已 approved。
COM-02J 已 locked：先核對有效 contract／QA；缺的 gate 補相應 task，並接 narrative preview，不無故重寫 locked prose。

| Batch | 本批節點與順序 | 必要 upstream／停點 |
| --- | --- | --- |
| A：雙 contact | COM-03X；COM-02J gate/preview；COM-03J | 兩方 immediate continuity verified；兩個 contact 成立 |
| B：共同期待 | COM-03M → OPEN-A scheduler design | A current QA／preview；明定 slots/focus/return gap，未決不進完整 pilot |
| C：首個 major | XT-04；JYC-05 | B approved window contract；各自 contact 與邀約理由 |
| D：continuation／shared | XT-05；JYC-06 → SH-01 | 對應 anchor；co-op 前事；SH 無過度 knowledge |
| E：重新靠近 | RE-X；RE-J；精確 eligibility/return wiring | focus/viability 可驗證；momentum 與下一 major 可用性一致 |
| F：切片 pilot | 核心走法、四種 allocation、friction/RE variants | 所有可見 choices 有合法 target；缺口已處理；首玩計時 |

每個 scene 是獨立 fresh bounded worker：`Narrative Design → 批准 → Scene/Dialogue → Narrative QA → narrative preview`。
已 locked scene 只補缺 gate；不同 stage 不共用 worker，不把 batch 表當 QA PASS 或假的 run ledger。
每次只納入該 scene、即時 predecessor/successor 與必要 state；兩女主共享內容只在 SH／scheduler／RE task 明列。
CG 不在本批；預覽使用已登記或明示 preview-only 畫面，保留後續 final visual gate。
整合只補當前 choices、conditions、state 與最低限度 graph 檢查；不先蓋新 framework。

## 6. 分支與 playtest coverage

| 檢查組 | 必覆蓋 variants | 判讀／證據 |
| --- | --- | --- |
| Opening → contact | 既有 Opening branches；COM03X/J rejoin | accepted 前事不變；兩個 contacts 只在正確 scene 後成立 |
| OPEN-A | XJ、JX、XX、JJ | 有限 slots；未 focus 方仍存在；無 impossible return gate |
| XT-04／05 | 慢看、提醒、幽默；support mode；incident 後反應 | 提醒非道德失敗；男主需求可見；無越級 romance |
| JYC-05／06 | 帶路／參與／代答；競爭／讓／指導／接受 | 人物反應與已有 effects 一致；單次錯誤不終止 |
| SH-01 | romantic signal 低／較高；不同焦點歷史 | 三個 knowledge flags；不推導 date/alias；shared 不改 focus |
| RE-X／J | 主動重新投入、只聊天／短回、維持模糊 | 改 focus 的條件明確；不重置深度；不設 repairCompleted |
| 保存／重播 | allocation 前後、SH 前後、RE choice 後 reload；Memory replay | stable IDs；state 不洩漏；未觸發 shared Memory 不提前 |
| graph／knowledge | 所有 visible targets；錯前置的負測試 | reachability、dangling target、impossible gate、非法 knowledge 更新 |

先由內部走完分支矩陣，再建議邀 **3–5 位未讀 spec 的外部玩家**作小規模 pilot；目前沒有批准／招募的參與者。
外部玩家第一遍自行選擇、不看攻略；不安排每人必選某女主以假造自然體驗。
以矩陣補測罕見分支；受指引的 coverage run 和外部首玩回饋分開標記。

計時記錄：入口開始、Opening 結束、雙 contact、OPEN-A slots 結束、SH-01、RE choice／切片停止時間。
記錄總首玩時間、有效遊玩時間、每段選擇停留與中斷；扣除中斷另報，但保留原始 elapsed。
另記每位玩家走法與首次注意到的 consequence；尚未發生的 SH／RE 以未觸發標記。
報 min／median／max 與每條實際走法，不從少數玩家外推穩定 30–60 分鐘。

首玩後先請玩家回想：最記得哪幕、哪裡失去興趣、喜歡／不喜歡兩人的具體行為、是否想繼續。
再問：哪些 choice 像標準答案；哪個後果有感／看不懂；最近選誰是否影響相處；重新靠近是否像真實人際互動。
若玩家只記得「選對就加分」，先改 choice 表達／consequence 可讀性；不以新的好感計量 UI 代替人物反應。

## 7. 提案驗收界線與來源

完成範圍決策需確認：可到達的兩條核心走法、同方 allocation return、focus 算法、RE 的修復含義。
正式 pilot 前：所有 visible 分支合法且可重播；兩方 major／SH／RE coverage 有實際證據；30–60 分鐘以實測核對。
Narrative QA、Human narrative preview 與 final playable decisions 由對應任務／receipt 記錄；本提案沒有新增 acceptance。
重大玩法問題先修正再往 M2；新圖、校準研究與晚期 route production 分別排 downstream。

來源範圍：ROADMAP L107–180；CONTENT_PRODUCTION_TODO L14–62；macro spec L30–64、79–128、148–185、289–528、530–552、677–714。
route/state L15–28、137–202、253–344、345–375、414–489、688–704；COMMON blueprint L136–351；Xu L31–122；JYC L35–114。
另核對 packet 明列的 AGENTS、manifest、bootstrap/content-writer harness、source/context policy、Task Packet/Handoff schema、source map、blueprint index。
來源身份與17份 blob／17段 excerpt 核對保存在 ignored task audit；此處不複製 canon 或完整 Handoff。
