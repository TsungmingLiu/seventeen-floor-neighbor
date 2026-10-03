# Current COM-02X stale integration gate audit

Lifecycle: **GENERATED** engineering migration evidence; not production canon.
Task: `M0-CURRENT-SCENE-STALE-001`; audited 2026-10-02 against
`e0c3a86d9c395f3db7ec667a45b0301d26667d0b` with Node 22.23.3.

`production:integration:check` computes a fresh scene snapshot and impact from
explicit `--from` / `--to` inputs, then exits 1 if the impact invalidates
`integration:<scene>`. It removes the preceding check report before acquiring
sources; acquisition errors leave no success report. A fresh stale result has
`BLOCKED_STALE_INTEGRATION` and a new report. An unchanged comparison has
`NO_STALE_DIFF`. These are bounded version checks: QA/Human acceptance remains
`NOT_EVALUATED`, and no production ledger or decision is updated.

The current COM-02X comparison includes `COM02X-BG-01`, `COM02X-DLG-01`,
`COM02X-DLG-02-MICROWAVE`, and `COM02X-WALK-01`. The exact
`COM02X-ENV-CONVENIENCE-NIGHT-REFERENCE` is excluded only when its named receipt
establishes supporting-reference-only scope, its identities are absent from
runtime registry/config/nodes/Memory, and no manifest entry declares it as an
accepted base. There is no general exclusion of `render_ready` entries. Runtime
entries without accepted bindings fail closed.

Existing accepted/adopted-master receipt formats bind the PNG master, the WebP
runtime derivative, and exact recorded Human decision hashes/selections. Image
bytes and references are read only for hashes; creative prose and pixels are not
reviewed. The original independent Visual QA failures and accepted-as-is Human
scopes remain intact. Unsupported future receipt/decision formats require a
bounded adapter extension.

| Controlled case | Actual result |
| --- | --- |
| Current COM-02X, unchanged accepted bindings | CLI exit 0; four runtime entries; no stale diff |
| Material exit relationship contract edit | CLI exit 1; scene narrative/runtime and all four visual descendants invalidated |
| One recognition camera entry edit | CLI exit 1; only that entry's visual descendants plus scene integration/playable review |
| Unrelated scene and whole-manifest header edits | CLI exit 0; no scene stale diff; explicit provenance reconciliation warning |
| Runtime entry changed to `render_ready` | Acquisition rejected; exit 1; no report |
| Same-scene or other-scene accepted-base dependency on excluded reference | Acquisition rejected; exit 1 |
| Reference logical ID added as a registry key | Acquisition rejected; exit 1 |
| Missing source after a previous successful report | Exit 1; previous report removed |
| Tampered Human decision / receipt hash / rehashed mismatched selection | Acquisition rejected; exit 1 |
| Tampered accepted master / derivative / reference bytes | Acquisition rejected; exit 1 |
| Actual stale preflight followed conditionally by `tools/build.mjs` | Exit 1; build never runs; isolated `dist/` does not exist |

The audit at the source ref above records these exact check-report SHA-256s:

| Case | Report SHA-256 |
| --- | --- |
| Unchanged | `7c5b5e07be1327c25d599d6b45677242d150e4531f4249824239944833549ed1` |
| Material contract | `95d2878e4e6aa1b9065717c4ad3d138609097eeebaea63e47c2b11638d47fd72` |
| Recognition visual spec | `815eac2c2888fab95c175a751889847e76b28c75f8306bd258069f1ff2b2b564` |

The implementation hashes were `b5d5d2895f8420b0ad2220edb4481b55e36cacfe41a5c0c314c2306971663b26`
(`production-impact.mjs`), `0b108ace54f1ad1b174ca3d21186886ab8bdfcddf09be5715597a157f74cbee5`
(`production-integration-check.mjs`), and `91781185e37776d070652e5f4951c2f8b444b606d007ac80cbccf0b3b3b1a02b`
(`production-integration-check.test.mjs`). Future test runs bind their own HEAD;
the report hashes above identify this audit, not a universal PASS.

## Reproduce

Use Node 22 and full repository Git history. Select the actual adopted integration
checkpoint explicitly; a caller-selected baseline is not a substitute for
verifying upstream acceptance. PR #39's verification binds `ba5f832…`, with its
final Human playable gate still open. The parent also checked that exact commit
against this maintenance worktree: `NO_STALE_DIFF`, report SHA-256
`dc2b858d2484871ac3ef2de78906ec88df2828a9832bb57c55a79838a057dfd6`.

```bash
npm run production:impact -- --scene COM-02X --from e0c3a86d9c395f3db7ec667a45b0301d26667d0b --to WORKTREE
npm run production:integration:check -- --scene COM-02X --from e0c3a86d9c395f3db7ec667a45b0301d26667d0b --to WORKTREE
npm run production:integration:check -- --scene COM-02X --from ba5f8322d607f6e0cb1a65dc373aed6926ef9af2 --to WORKTREE
node --test tests/production-integration-check.test.mjs
```

The controlled-edit harness creates a temporary detached checkout at current
HEAD, copies the current engineering implementation into it, performs only
isolated material edits, invokes the real CLI, restores sources, and removes the
checkout. The focused result is **13 tests passed, 0 failed**. Full runtime/build
validation is recorded below.

## Parent maintenance verification

Node **22.23.3** completed build (21/21 media checks), `validate`,
`validate:final`, `production:storage:check`, and staged `git diff --check`.
The legacy current COM-01X impact comparison also completed with zero changes.

The full suite executed **117 tests: 115 passed, 2 failed** while the workflow
manifest registration was uncommitted. Both failures were the existing COM-00
packet integrity guard, `source differs from committed ref: .ai/WORKFLOW_MANIFEST.yaml`;
the guard was preserved. After saving implementation checkpoint
`268fe252e07d1badddcb6948e8ad5dc5e26d8914`, its four context-packet tests passed
**4/4**, including both failed cases. The other 115 tests, including the eleven
pinned historical suites and the new current-scene controls, passed in the full
run; they were not rerun after this metadata checkpoint. This is local engineering
evidence, not a fresh main CI or Human playable acceptance.

PR #43's clean Node 22 Verify subsequently passed **117/117 tests, 0 failed**
on the merge-test ref for head `720843ec9cc6914ede5ef45d5515a9cf705d4d1e`
and base `e0c3a86d9c395f3db7ec667a45b0301d26667d0b`:
[Verify run 624](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/36966607788).
Build, asset/source checks, preview smoke, validation, tracked-source integrity,
Cloudflare deployment and deployed-site smoke all succeeded. This closes the
local dirty-manifest test caveat for that PR head; it is PR CI evidence, not a
merged-main or Human acceptance decision.

For actual integration, invoke the check before wiring/build work and continue
only on exit 0. For an already prepared integration checkout, the conditional
build sequence is:

```bash
npm run production:integration:check -- --scene COM-02X --from <accepted-baseline-commit> --to WORKTREE && npm run build
```

This is an explicit pre-integration invocation gate; `npm run build` alone does
not automatically perform it. The impact command remains read-only reporting.
A whole-manifest hash reconciliation warning is not automatic approval, QA PASS,
Human acceptance, or an instruction to regenerate assets. Changes outside the
selected scene remain outside the comparison scope. No DAG/orchestration engine
or automatic reruns were introduced.

Full evidence stays ignored under `generated/session-cache/`:

- `m0-current-scene-stale/controlled-edit.audit.json`: actual exit codes, bounded
  invalidation hashes/scopes, implementation/input hashes and cleanup evidence.
- `m0-current-scene-stale/current-baseline.identities.json`: current source,
  accepted master/derivative/reference, receipt and Human-decision hashes.
- `m0-current-scene-stale/focused-tests.log`: focused test output.
- `impact/COM-02X/impact.json`: baseline impact SHA-256
  `5121f4e6b05b222a10788d48a99d79ccb1978dc7cb0276aec6917b99c029bd49`.
- `integration-check/COM-02X/check.json`: latest freshly computed check; audit
  baseline hashes are pinned above.
- `m0-current-scene-stale/verified-checkpoint-preflight.json`: exact PR #39
  checkpoint-to-worktree check, SHA-256 `dc2b858d2484871ac3ef2de78906ec88df2828a9832bb57c55a79838a057dfd6`.

Creative, runtime, art, QA and Human record bytes remain at the audited baseline.

## Subsequent milestone checkpoint

PR #43 head `386a011…` later passed clean [Verify run 626](https://github.com/TsungmingLiu/seventeen-floor-neighbor/actions/runs/37004805613)
with **132/132 tests** and Cloudflare deployment/smoke, then merged as main
`c5251cd…`. The Owner subsequently reported no visible playable issues.
See [M0 foundation acceptance](M0_FOUNDATION_ACCEPTANCE.md) for the new Human
receipt and main verification. These later facts supersede pending-gate wording
at the original audit checkpoint; they do not alter its historical QA evidence.
