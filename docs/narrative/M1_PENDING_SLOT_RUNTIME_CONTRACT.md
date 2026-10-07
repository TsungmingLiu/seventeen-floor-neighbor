# M1 C1 pending outing / slot / save contract

> Lifecycle: **CANONICAL** bounded engineering proposal; 2026-10-07.
> Specifies a future C1 extension. No runtime implementation or scene, QA, CG, or Human acceptance is established by this document.
> Baseline: `a2967d98cd7118c690cc1adada8035182594cc55`. Existing GAME snapshots remain the sole gameplay authority.

## Existing behavior

`OPEN-A-ENTRY` adds `open_a_entered`. The two pending route endpoints add respectively `open_a_entry_outcome:pending_xu` and `open_a_entry_outcome:pending_jyc`; neither consumes window 1. `OPEN-A-ENTRY-SOLO`, `REST`, and `WAIT` add their respective outcome and `open_a_window1_consumed`. Outcomes are string flags, not a runtime enum/stat. These are preview stops, not completed outings or OPEN-A completion. Acceptance/counteroffer choices lead through confirmation to the same pending-X endpoint; declining returns to own-life choices.

`GameEngine.render` applies additive `entryEffects` and `entryFlags` once per live snapshot using `entry-effect:<nodeId>`, then captures visible/route nodes; branch nodes dispatch recursively without their own capture. Choice effects apply on click before rendering the destination. Guards currently use branch conditions, flag presence, and chapter-specific exclusions; there is no generic completion transaction or scheduler. A completion entry marker alone cannot prove an outing occurred.

`ProgressStore` serializes v2 journey data in one localStorage value. Snapshots contain `nodeId`, numeric initial-state stats, string `flags`, and `returnNodes`. Capture stores post-entry-effect state at the current node before a choice is made. Cursor can follow replay; frontier retains formal progress. All current `OPEN-A-*` nodes have continuation rank 260. In normal play, equal-rank continuation capture can update frontier; continuation capture is disabled for ordinary replay. General Memory replay can still advance frontier at a higher Memory rank if `canExtendMain` retains existing facts, and can overwrite checkpoints/unlocks. Therefore general replay is not inherently isolated from every main write.

Current route stops set `runComplete=true`; title Continue explicitly resumes the five exact OPEN-A review endpoints despite that value. `runComplete` is a UI/run marker, never outing or slot proof. Restore reconstructs flags as a Set. Missing/invalid nodes are rejected; v1 migration and additive-stat defaults already exist. `flush` catches storage failures and reports `persisted=false`; saving is not a durable exactly-once guarantee.

## Proposed C1 state: one additional fact family

Keep existing outcome, consumed, and entry-effect flags. Add only one mutually exclusive completion identity in the same snapshot `flags` array:

| New exact flag | Meaning |
| --- | --- |
| `open_a_window1_completed:xt04` | Actual XT-04 outing reached its approved completion boundary in OPEN-A window 1. |
| `open_a_window1_completed:jyc05` | Actual JYC-05 outing reached its approved completion boundary in OPEN-A window 1. |

Absence means no proven completed outing. Both flags, an identity inconsistent with the original pending outcome, or a completion identity without `open_a_window1_consumed` are invalid C1 state: stop at a safe review boundary and report, never infer or repair completion. Solo/rest/wait remain consumed with neither outing flag. Keep the pending outcome as historical confirmed-plan evidence after completion; active pending is derived as pending outcome plus unconsumed window 1 plus no completion identity. No duplicate pending object, completion ledger, scheduler, date/timer, score, or global progress store is added.

## Entry and exactly-once completion transition

The future integrator must bind each approved outing's actual stable entry and completion node IDs; none are fabricated here. An unproduced successor remains the original exact pending preview stop. A produced entry requires the matching pending outcome, `open_a_entered`, unconsumed window 1, no window-1 completion identity, and the scene's approved local prerequisites. Xu requires real `contact_xu`; Jiang requires real mutual `contact_jyc`, completed COM-02J and COM-03J online prerequisites, and effective non-exclusion. Earned discovery eligibility alone never supplies local contact, knowledge, consent, or investment. Validate stale direct-entry saves as well as outgoing choices. Closed/harm/availability prerequisites come from the approved scene contract, not invented here.

At the approved completion boundary, validate matching outing identity and entry prerequisites before effects. For a valid uncommitted snapshot, add the matching completion identity, existing `open_a_window1_consumed`, and stable `entry-effect:<completionNodeId>` together; capture the resulting boundary snapshot before allowing any successor. Never consume on acceptance, confirmation, entry, short message, hook, or partial scene. Prefer flag additions only: repeated render is Set-idempotent. Any future numeric investment effect must share the same commit guard and cannot be implemented by a separate unguarded effect.

Re-render/restore of an already committed matching boundary is a no-op; it resumes that boundary or an explicitly produced successor, never replays the outing to earn another slot. A consumed life outcome or other completed outing cannot enter this outing. Completion flags are per playthrough snapshot, not lifetime unlocks. Fresh runs start without them; historical frontier remains historical. Do not union completion flags from frontier, checkpoints, unlock history, or another replay into current state.

The semantic pair and node snapshot must be flushed in one v2 journey write. Existing `connect` can flush an edge before capture; that intermediate write must leave the pre-completion snapshot resumable, not a half-committed pair. A successful saved completion reload is idempotent. On storage failure, retain truthful in-memory state and expose the existing persistence failure; after process loss the last successful snapshot may resume earlier. This contract does not promise cross-tab, crash-proof, or external exactly-once execution.

## Replay, old saves, and remaining slots

C1 ordinary Memory replay must keep completion/slot effects replay-local and leave the main frontier, its flags, run status, and canonical completion checkpoints unchanged, including when an appended scene has a higher rank. Do not rely solely on today's rank or `canExtendMain` (which does not retain these new flags). Bound the replay at its approved endpoint and restore the main return snapshot; persist replay/return state through the existing journey envelope if reload is supported. This is a required bounded future engine/save integration gap, not an implemented capability. Existing collection unlock behavior does not authorize main slot writes. Explicit fresh-run playback is a new playthrough, not this replay mode.

Old v1/v2 saves with no new completion flags keep that absence. Exact pending endpoints retain their confirmed plan and unconsumed window; produced C1 content may continue only through the entry guard. Pre-C1 consumed life endpoints stay life-complete, without invented outing identity. Never infer completion from `runComplete`, `open_a_entered`, contact, encounter eligibility, rank, Memory/CG unlocks, or missing flags. Existing known-contact/no-contact and exclusion migrations remain effective. Malformed imported pending prerequisites block rather than mint contact or silently consume a slot. Keep all five existing node IDs stable.

Window 2 is a separate finite authored opportunity, not automatically available because `open_a_entered` is true. This task adds no window-2 state: until its approved selector/life scenes exist, stop. Later integration must supply a window-2 consumed fact and guard using actual predecessor completion, scene prerequisites, and window-2 availability before displaying choices. It must retain window-1 identity, reject repeated same anchor, and reject any third OPEN-A slot. OPEN-B's three slots are outside this C1 contract. Consumed slot alone does not confer OPEN-A completion, OPEN-B entry, continuation knowledge, RE history, or invitation acceptance. Actual major-investment history/focus required by route authority belongs to its bounded later integration; contact/pending cannot substitute for it.

## Regression checklist for implementation (not executed by this document)

| Case | Required assertion |
| --- | --- |
| Pending X / J reload; X counteroffer | Exact pending endpoint/outcome survives; no completion identity or consumption; no repeated sent-message effects. |
| Mid-outing reload | Same semantic position and flags; no premature completion or slot use. |
| Actual X / J completion | Only matching identity plus consumed flag appears at approved completion; capture contains the pair and marker. |
| Completion reload / repeated render / duplicate callback | Same completion identity and stats; zero second consumption/investment; no repeated anchor entry. |
| Completion storage failure | `persisted=false`; no claimed durable save; reload uses last successful complete snapshot. |
| Ordinary replay, including higher rank and reload mid-replay | Replay-local completion; main frontier, completion checkpoints, and run state unchanged; return restores main snapshot. |
| No contact / refused Jiang contact | No Jiang invite/entry/completion; missing contact is never reconstructed from encounter history. |
| Never met / effectively excluded Jiang | Existing redirect and no-Jiang path remain; imported contact cannot override effective exclusion. |
| Old v1/v2 pending and consumed-life saves | No synthesized outing; unrelated flags/stats preserved; exact review boundary remains resumable. |
| Wrong outing / mixed identities / partial pair | Reject without new effects, consumption, or invented prerequisites. |
| Second slot / no slot / attempted third slot | Window-1 used once; only independently produced legal window-2 selector proceeds; missing/unavailable slot stops before choices; no third OPEN-A slot. |
| Explicit fresh run | New current snapshot has no completion identity; historical frontier/unlocks do not mint current completion. |

Evidence sources: `ARCHITECTURE.md`; `src/engine.js`, `src/progress.js`, `src/branches.js`; `tests/opening-entry-batch.test.mjs`; programmatically extracted OPEN-A node/choice metadata from `content/routes/opening-demo/chapter-01.json` (no dialogue context); `OPEN-A.md` lines 398–413; `PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` lines 400–415; `ROADMAP.md` lines 450–520.
