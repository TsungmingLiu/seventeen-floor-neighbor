# Gate 19: display the recorded candidate Visual QA failure

`npm run production:review -- --scene COM-00` now reads the same committed run ledger and decision receipt that `production:run:check` verifies for `COM00-S04-BASE-NEUTRAL`. The generated, ignored Human Production Review Bundle shows **Visual QA `CURRENT_FAIL`** for that one candidate, with its source ref, run/task IDs, packet/receipt/input hashes, candidate SHA-256, failed QA codes and concise known issue. It shows Narrative QA `PASS_CURRENT` separately, while other candidate decisions and the Human accepted-master gate stay unrecorded. Scene readiness remains `NOT_READY`.

The existing runtime WebP and its manifest `accepted` value are displayed as source/asset facts, not promoted to fresh pixel QA. The earlier manifest usability PASS does not turn the candidate failure into a pass. The page does not create a new approval store or write a ledger.

If the committed candidate receipt is changed, the source bytes no longer match, the selected run is stale or the entry does not identify the scene WebP, generation blocks and deletes any previously generated review page. Another scene without such a recorded candidate decision still displays `UNRECORDED`. All candidate evidence is obtained through the existing run verifier; the generated HTML and thumbnails stay in ignored `generated/reviews/`.
