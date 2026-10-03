# M0 foundation acceptance

Lifecycle: **GENERATED** milestone evidence, not new narrative/art authority.
Recorded 2026-10-02.

PR #43 merged into main as
`c5251cd2ac58e8daca0d034a0799b60c456dd7d7`, with explicit Owner merge approval.
Its tree is identical to reviewed head
`386a0111b3714326db9117bcf9836103d97f4018`.
The clean Node 22 [PR Verify run 626](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/37004805613)
passed **132/132 tests**, source/asset checks, build, validation, coverage report,
preview smoke, tracked-source integrity, Cloudflare deployment and deployed smoke.
Main [Verify run 629](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/37008118459)
also passed **132/132 tests**, build/validation, coverage and source integrity;
its Cloudflare deployment and deployed smoke succeeded. These main results,
together with the actual Human acceptance below, close the M0 Exit Gates.
Local Node 22.23.3 build and preview smoke passed; the COM02X integration
preflight from `ba5f832…` remains `NO_STALE_DIFF`.

The Owner reported: **「我測了可玩性，沒有可見問題。繼續下一步。」**
This is recorded as `final_playable_acceptance` in
[HUMAN-COM02X-PLAYABLE-009](../../content/production/runs/com02x-visual-bindings-20261001/HUMAN-COM02X-PLAYABLE-009.decision.json).
The existing COM02X integration checkpoint is now `ACCEPTED`; its original tasks,
QA decisions, preview and earlier acceptance scopes remain historical records.
The report did not specify the tested URL or commit SHA. The receipt preserves
those values as unknown and binds its recording context to PR #43 head
`386a011…`, without claiming the Owner tested a particular deployment URL.
All eight runtime outputs match the original verified `ba5f832…` checkpoint.

| M0 exit criterion | Evidence |
| --- | --- |
| Accepted CG uses stable runtime identities | COM02X PR #39 verified checkpoint; runtime bytes unchanged; registry/coverage checks |
| Missing CG remains playable through canonical placeholder | Existing preview-stage tests and opt-in contract preserved; unused placeholder remains registered |
| Placeholder cannot imply release completion | Coverage report separates inventory/use; strict release coverage rejects preview/provisional/unverified/known issues |
| Real-scene changes block stale integration | COM02X material/entry controls and preflight, [stale audit](M0_CURRENT_SCENE_STALE_GATE.md) |
| One active source/build path and consistent documentation | Repo-native baseline plus merged scripts, architecture/source-map/CI and [coverage audit](M0_ASSET_COVERAGE.md) |
| Build/validation/tests/fresh playable acceptance | PR132/132 and actual Human report above; main result recorded separately |

The historical PR #43 strict release coverage snapshot was **blocked for seven known runtime
assets**: two provisional COM01J entries, accepted COM01B accessory drift, and
four COM02X accepted-as-is entries with original Visual QA failures. Release
readiness is not recorded. These are tracked art-quality scopes rather than
missing M0 engineering mechanisms; no image was regenerated or QA outcome
changed to close the playable gate.

## Latest-main metadata sync

PR #45 merged as main `e28e45de188d1d788e63217d467a0a1448e4d24b`,
adding title CG/default-name behavior and a prospective final derivative/display
QA policy. The verified [PR #45 Verify run 37034831902](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/37034831902)
binds exact PR head `43db3a2d186d71dcdc3db8dc4e6d74de90dc1127`:
Verify job `110930333722` and deploy/deployed-smoke job `110933137975`
succeeded. This is PR-head evidence; post-merge main CI and new pixel QA
are not asserted here. The PR #43 M0 verification and `ba5f832…` COM02X
acceptance scopes above remain historical and unchanged.

The [title checkpoint](../../content/production/runs/title-key-visual-20261002/ledger.json)
retains `READY_FOR_HUMAN_ACCEPTANCE`: Human selected the actual native master
and focus, while original VQA `NEEDS_REVIEW` and pending final Human playable
acceptance remain. The title adds a known art-quality issue beyond the historical
seven-asset coverage snapshot; current strict coverage counts were not rechecked
by this metadata task. The prospective policy does not widen or rewrite existing
QA/Human decisions, or imply release readiness.

The current milestone is **M1 Gameplay Validation**: select and produce a measured
30–60 minute slice, then use several players unfamiliar with the specification
to test choices, attention trade-offs, character appeal, friction and repair.
The Owner's M0 playable acceptance does not satisfy M1 external playtesting.
The scope proposal is [M1 Gameplay Validation Slice](../narrative/M1_GAMEPLAY_VALIDATION_SLICE.md);
it does not claim the proposed scenes are already written, reviewed or playable.

Full source/output hashes, acquisition audit and worker Handoff stay ignored
under `generated/session-cache/m0-human-acceptance/`. No new art-production run
was created for this maintenance work.
