# 目前可玩版本驗收證據索引

> Lifecycle: **GENERATED** engineering audit snapshot（不新增 production authority 或批准）
>
> 核對時間：2026-09-30 10:25 EDT；GitHub job 時間使用 UTC。
>
> 基線：執行時 `git fetch origin main` 取得的 [`9b0066ff7240c918c87cb8d5ab38affef44cddb4`](https://github.com/TsungmingLiu/seventeen-floor-neighbor/commit/9b0066ff7240c918c87cb8d5ab38affef44cddb4)。M0 仍為 NOW。

本次只核對工程狀態與證據、修改 backlog。遵循 repo `AGENTS.md`、workflow/bootstrap、source/context policies、source map、`ARCHITECTURE.md` 及 orchestration 的 provenance／playable DoD；未修改 creative、runtime、art 或 harness。下列有效性是版本比對與既有 receipt 的工程索引，不宣稱 multi-task run checker 回傳 `PASS_CURRENT`。

## 1. 已完成且有有效證據

| 項目 | 目前結果 | 有效證據／範圍 |
| --- | --- | --- |
| COM-02X 可玩整合 | `opening-demo` 唯一可玩入口，234 nodes；便利店 83 nodes，四個 choice 匯流至 `common_convenience_xu_work`，最後至 `opening_demo_complete` | [route](../../content/routes/opening-demo/route.json)、[chapter](../../content/routes/opening-demo/chapter-01.json)、[COM-02X tests](../../tests/com02x-preview.test.mjs)；下方 main Node 22 Verify 已執行相關 tests |
| 敘事與 POV | 已接受的 dialogue 經五個 bounded POV QA 保留 choice/state/knowledge/visual meaning | [PR #33 ledger](../../content/production/runs/pr33-first-person-20260929/ledger.json)、[NQA-COM02X-POV-001](../../content/production/runs/pr33-first-person-20260929/NQA-COM02X-POV-001.decision.json)：scene blob `938edf40f2f34a9faee054971f72747e213c73ee`、contract blob `5f85482b7c420a5f7726035e369679360f83cfd5`，所記當前 input/output blobs 全相符；`no_visual_impact` 不是 Visual QA |
| 預覽圖標記 | `bg.narrative_preview.placeholder` 為 background、`previewOnly: true`，route allowlist 與 `allowPreviewArt: true` 明示使用；COM-02X 用 composite、無 sprites | [asset manifest](../../content/assets/manifest.json)、[route](../../content/routes/opening-demo/route.json)、[INT-POV-001](../../content/production/runs/pr33-first-person-20260929/INT-POV-001.decision.json)。圖 SHA-256 `9dc448840d09cf38718710881991c9f251e01eefd44eb94980d7dd9743778145`；main asset/media checks 26/26 |
| Memory／Gallery | `mem.opening.ch1.convenience-xu` rank 160、replay 從 `common_convenience_xu_enter`；cover 用 preview，`galleryAssets: []`，不新增假 CG 收藏 | [Memory library](../../content/routes/opening-demo/memories.json)、COM-02X tests、[browser tests](../../tests/browser-acceptance.spec.mjs)；Node 22 結構測試通過，瀏覽器證據為下列已核對的本地 receipt |
| 整合與姓名／舊存檔修正 | 整合 chapter 輸出 blob `36a1e0c0e1518caff665bf703967be0a274ea240` 相符；姓名、Continue／Memory、舊存檔 additive defaults 有驗證 | INT-POV-001 的 input chapter 是改動前版本，不要求與 output 相同；[RUNTIME-FIX-001](../../content/production/runs/pr33-first-person-20260929/RUNTIME-FIX-001.decision.json) 所記 output SHA-256 全相符 |
| 本地 final verification | 82/82、Chromium 5/5、build／validate／preview smoke／diff PASS；完整 Opening、320px、姓名 Continue／Memory、pre-PR saves | [VERIFY-FINAL-001](../../content/production/runs/pr33-first-person-20260929/VERIFY-FINAL-001.decision.json)，執行 ref `792e4a0a0c4381b1768678daee90f4f032a59739`，Node 24.19.0／Chromium1187。所記 10 個 input blobs 全相符；該 ref 到 main 只有 final receipt 與 ledger 變動。可沿用於同一 runtime；不冒充 Node 22 遠端 Chromium |
| 人工接受 | 既有 dialogue 已接受，POV correction 已檢查，姓名輸入已批准；必要修正與驗證後合併已授權，PR #33 已合併 | ledger `human_request.gate_status`、final receipt `human_acceptance`、[PR #33](https://github.com/TsungmingLiu/seventeen-floor-neighbor/pull/33)。沿用原範圍，不重問；不涵蓋 final art／M0 exit |

## 2. GitHub CI／Cloudflare 遠端查證

PR head 為 `08e997adf1eba3e898aa52e17e66641e79fd9adb`；pull_request job 實際 checkout／部署的是合成 merge `0fb56d210dc0166195ec4be58ae73bccb35073fb`。main、PR head 及 [合成 merge 的 tree](https://api.github.com/repos/TsungmingLiu/seventeen-floor-neighbor/git/commits/0fb56d210dc0166195ec4be58ae73bccb35073fb) 均為 `77eee3204a3d2551e7ee8910dc48f4ec0fb20aa9`，不是三個不同的遊戲內容版本。

| 對象／commit | 結果與來源 | 環境／限制 |
| --- | --- | --- |
| main `9b0066f…` | [Verify 36666840951](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36666840951) **success**；[verify job](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36666840951/job/109733212997) 確認 asset check/build、build、validate、preview smoke、82/82 tests、diff／tracked-source checks 通過 | 原始 log：Ubuntu 24.04.5、Node **22.23.2**、npm 10.9.8。Codespace command 僅 **dry-run** |
| main `9b0066f…` | [Deploy job](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36666840951/job/109735233509) **success**；log 明示 `--branch=main --commit-hash=9b0066ff7240c918c87cb8d5ab38affef44cddb4`，取得 [41c1af51 部署](https://41c1af51.seventeen-floor-neighbor.pages.dev/playable-review/) | Node 22.23.2。部署後 HTTP／deep-link／built-file byte comparison smoke **success**；不是 browser acceptance |
| PR #33 head `08e997a…`／實際 `0fb56d2…` | [Verify 36666049080](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36666049080) **success**；[verify job](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36666049080/job/109730832899) 記錄實際 checkout `0fb56d2…` 與 82/82 | 原始 log：Node **22.23.2**、npm 10.9.8；此 success 不應標成 head SHA 的直接 checkout |
| PR preview `0fb56d2…` | [Deploy job](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36666049080/job/109732783113) **success**；log 明示 `--branch=pr-33 --commit-hash=0fb56d210dc0166195ec4be58ae73bccb35073fb`，取得 [1cff9168 部署](https://1cff9168.seventeen-floor-neighbor.pages.dev/playable-review/) 與 [PR alias](https://pr-33.seventeen-floor-neighbor.pages.dev/playable-review/) | 部署後 smoke **success**。deploy logs 中 transient npx install error 由 action 後續成功完成；不把中途訊息當作最終 failure |
| main `9b0066f…` Browser Acceptance | [Run 36666841060](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36666841060) **failure**；[chromium job](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36666841060/job/109733213029) 在前置 `npm test` 得 80/82，Playwright install／Chromium step **skipped** | Node **22.23.2**。checkout `fetch-depth: 1`；兩個失敗為 historical QA wrapper／live review，log 明示缺 `bfe5058a46ac9eab0d860b921fc8cf7a20f6abe2` 與 `ea788a958c83851cfa0cca235825552fa66f2cb2`。Verify 的 full-history checkout 同版 82/82 通過 |

查證方式為 GitHub API 的 run/job/原始 logs；commit combined-status 查詢為空，不等於 Actions 沒有成功紀錄。未直接讀取 Cloudflare account API；部署與 smoke 的來源是上述 GitHub deploy jobs。

**尚未查證：目前 alias 的可達性與對應內容。** 10:25 EDT 用 Python HTTP GET 讀取 [main alias](https://seventeen-floor-neighbor.pages.dev/playable-review/) 及 PR alias 的 deep link、chapter／Memory／asset JSON、preview WebP，10 個請求全回 HTTP 403；web reader 也無法開啟兩個固定 deployment deep link。缺少可讀的 HTTP response／當前瀏覽器結果，無法比對 alias 內容或判定 403 原因。這不撤銷已查證的部署當時 smoke，也不把本地 receipt 當作即時遠端驗證。

## 3. 歷史證據與後續版本

- `qa-com02x-preview-independent-20260928` 及 early fresh-worker FAIL／NEEDS_REVIEW 是舊 scene 的判定。`qa-com02x-postcorrective-20260929` PASS 之後，又經 `opening-ch1-voice-20260929` naturalization／[NQA-COM02X-FINAL-001](../../content/production/runs/opening-ch1-voice-20260929/NQA-COM02X-FINAL-001.decision.json)，最後由上述 POV QA 保留 approved dialogue/state。舊 hash 不同表示審查對象不同，不是目前版本自動失敗。
- `opening-ch1-voice-20260929` 的 [INT-OPENING-CORRECT-001](../../content/production/runs/opening-ch1-voice-20260929/INT-OPENING-CORRECT-001.decision.json) 曾因無 browser executable／Human URL 而 BLOCKED。後續 INT-POV → RUNTIME-FIX → VERIFY-FINAL → 遠端 deployment 已提供對應證據；不把舊 BLOCKED 當作目前仍未整合。
- PR #33 ledger 仍保留 `remote_status: Pending deployment…`，INT／runtime-fix receipt 也保留當時 pending browser 的限制。這些是原始時間點紀錄，不改寫；後續證據由本索引對齊。
- [invalidation gate](ISSUE16_INVALIDATION_GATE.md) 與 [run reconciliation gate](ISSUE16_RUN_IMPACT_RECONCILIATION_GATE12.md) 的受控檢查、`tests/*.historical.mjs` 是 pinned 歷史工具／資料證據。main 82/82 包含 11 個 pinned suites wrapper，但不等於目前 scene 的 material-change／整合阻擋實證。唯讀 impact report、舊 run `STALE_PROPOSED` 或 review UI 的 `REVIEW_REQUIRED` 也不是撤銷 PR #33 人工接受。

## 4. 已實作但缺少當前版本的驗證證據

| 缺口 | 已有部分／還缺什麼 |
| --- | --- |
| main Node 22 遠端 Chromium | browser tests／workflow 已有，本地同 runtime 5/5 可引用；遠端 job 停在缺歷史 commit 的前置測試，缺一次真正執行且通過的 Chromium run |
| fresh Codespace | acceptance command 已有；main CI 只 dry-run。本次未取得當前 main 的實際 Codespace name/ref、Node 22 receipt、forwarded URL／visibility 與 acceptance 結果，**尚未查證** |
| 當前 material-change stale gate | policy／read-only impact／source hashes／reconciliation 已實作，受控歷史證據見 §3；缺目前 scene 受控 material change 的 machine report、相關 visual 範圍與實際整合停止使用 stale artifact 的證據。PR #33 `no_visual_impact` 只涵蓋該輪 POV，不能填補此缺口 |
| preview → final CG 替換 | stable IDs／visual binding／final validator 已有；缺 COM-02X accepted CG 與實際替換後 node/save/Memory/Gallery/final validation 的同版本證據 |

## 5. 尚未實作／尚未完成的產品成果

- COM-02X 正式 CG production／Visual QA／accepted-master／final runtime art replacement 尚未完成；目前沒有該 scene 的 canonical CG manifest entries 或 accepted CG binding。敘事接受不把 preview 升格成正式 CG。
- release-oriented 的完整 placeholder／provisional／accepted coverage 分類尚未完成；現有 `validate:final` 已拒絕 preview allowlist／`allowPreviewArt`，不能因此宣稱所有 final visuals 已通過。
- COM-02J 尚未接入 Opening；COM-03X 仍未整合。後續 scope 留在 Content TODO；本次不生產新內容、不宣告 M0 完成。

## 6. 本次補查與下一個最小工作單位

本地版本為基線 commit 的獨立 `docs/playable-evidence-alignment-20260930` worktree；環境 Darwin 27.0.0 arm64、Git 2.54.0、Python 3.9.6。補查 receipt 的 Git blobs／SHA-256、final-verification → main diff 與 PR/main tree identity，結果如 §1–2；相關文件連結／文件範圍與 `git diff --check` 通過。系統 Node 25.9.0 未用於 game tests；本次沒有重跑整套敘事 QA、build 或 full tests，已有 main Node 22 證據可引用。

**下一個最小工程單位：修正 Browser Acceptance 的 checkout history。** 在 `.github/workflows/browser-acceptance.yml` 的 checkout 加 `fetch-depth: 0`（對齊 Verify），使兩個 pinned historical refs 可取得；以 Node 22 驗證前置測試後，在後續獲准提交／遠端執行時取得該 commit 的 Chromium 結果與 job link。只解決這個已定位的證據缺口，無需重寫 dialogue、重審敘事或擴建框架。Cloudflare alias 403／fresh Codespace 另保留待查證，不由這個修復推定通過。
