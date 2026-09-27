# Gate 16 — precise impact for the actual COM-00 manifest review

The existing read-only `production:impact` reconciles the committed Gate 15 `visual_review / manifest_usability` decision using `--run-id issue16-com00-mua-20260927` and `--from` equal to that run's pinned `source_ref`. It first verifies the actual source Task Packet and decision receipt in a detached checkout. It then compares the target's selected input versions and three-entry render-spec output digest, ignoring excerpt line-number movement caused by unrelated entries. The report never edits a run ledger.

| Committed target change | COM-00 manifest usability task | Existing artifact scope |
| --- | --- | --- |
| None, dialogue-only runtime text, or another scene's manifest entry | `CURRENT_PASS` | COM-00 CG review remains current |
| COM-00 base visual spec | `STALE_PROPOSED` | Base and dependent reaction visual descendants |
| COM-00 relationship contract | `STALE_PROPOSED`, fresh upstream Narrative QA required | Narrative/state and scene visual review as applicable |
| COM-00 Locked Scene | `STALE_PROPOSED`, fresh upstream Narrative QA required | Conservative affected descendants |
| Previously reviewed upstream narrative canon input | `STALE_PROPOSED`, fresh upstream Narrative QA required | No scene diff need be visible |
| Wrong source ref, bad decision receipt, invalid selected binding | `BLOCKED` | No old impact report retained |

The target comparison with changed upstream Narrative QA inputs reports their recorded version mismatches first; further selected inputs require a fresh upstream narrative decision and are not asserted current. Upstream ledger/receipt changes block rather than silently invalidating accepted evidence. `VERIFIED_RECORDED_MANIFEST_USABILITY_QA` names the historical QA evidence only. This is not candidate-image Visual QA or Human acceptance. The original Drive archive and runtime assets are unchanged.
