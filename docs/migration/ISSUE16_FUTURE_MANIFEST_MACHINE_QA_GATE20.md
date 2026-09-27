# Issue #16 — future CG manifest machine preflight

> Engineering evidence for Gate 20. This check makes no creative or Human acceptance decision.

## Gap and change

At the Gate 19 checkpoint (`f96d3ded953ebc4c9133c81fc8d20b8e74b11feb`), `validateProductionContracts()` loaded two named Chapter 1 manifest files. A newly added manifest file, including a nested chapter directory, was invisible to `npm run production:validate`, `npm run validate`, and the `context.mjs` Task Packet preflight. Its entries could point at another real scene file or reuse an existing entry/output ID without a machine failure.

The existing production validator now discovers every `*.json` under `content/production/cg-manifests/`. It applies the existing manifest, Narrative Continuity Contract scene/source, and repo reference binding checks to each file; it rejects duplicate manifest, entry, canonical asset and logical asset IDs across files. The two existing Opening files remain required. The historical Opening migration receipt and its exact eight accepted CG checks stay scoped to `opening-ch1.json`; a future render-ready manifest requires no fabricated acceptance receipt. Active-source retirement checks also cover discovered manifests. `context.mjs` already calls this validator before creating or verifying a production Task Packet, so no parallel authoring system or new registry is introduced.

## Controlled error injection

The focused test creates an isolated checkout with a third manifest under `cg-manifests/future/`, based on the real COM-01B render-ready structure. A wrong existing `source_scene` must fail with its file/entry named; reusing existing entry/output identities must fail with both manifest paths; unique IDs and correct bindings must pass. Before this change, the two invalid fixtures passed because the new file was not loaded. None of these fixtures changes canonical story, accepted CG bytes, runtime IDs or Visual QA status.

Focused injection tests: **3/3 PASS** after the change. Complete local regression: `npm run assets:check` **49/49**, `npm run assets:build` **49**, `npm run build` **2 routes / 49 assets**, `npm run validate` **4 narrative contracts / 12 discovered CG entries**, `npm test` **104/104**, `npm run preview:smoke`, and `git diff --check`: **PASS**.

## Boundary

The machine can verify declared identities and bindings. It cannot judge whether a new manifest covers every semantic visual beat, whether a candidate image looks right, or whether Human has selected an accepted master. The deferred COM-00 S04 image issue remains recorded separately in Issue #25 with its Visual QA `FAIL`.
