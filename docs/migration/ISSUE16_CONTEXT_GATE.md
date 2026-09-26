# Issue #16 — deterministic Task Packet gate

> Engineering evidence, 2026-09-26. This is not a scene approval, production run ledger, or new creative authority.

## Before state: real Opening scene

Baseline: `main` `3a9ab8fa449b4d3485d695d7debbea58f2f90a49`; work branch `c06e3f57445cdaed0d5569ff8591aeefdeb07346` before this gate.

Trace: `content/production/narrative/opening-ch1/COM-00.json` binds `docs/narrative/scenes/vertical-slice/COM-00.md` → `content/production/cg-manifests/opening-ch1.json` entries for COM-00 → repository accepted WebP/source catalog → `content/routes/opening-demo/chapter-01.json`, `route.json` and `memories.json` → `npm run production:validate`. This existing playable route is the real production path; no new CG is generated here.

`npm run context -- --route opening-demo --node common_movein_rain_open` returned 3,143 bytes of runtime node context, with no Task Packet, Git input versions, explicit narrative source allowlist or dependency check. The Task Packet schema existed, but no real `content/production/runs/` ledger or packet existed. A fresh narrative QA worker would have had to discover the Locked Scene, continuity contract and the relevant portions of macro narrative/route state. Reading those four whole files would load 88,057 bytes, mostly unrelated to COM-00. The existing orchestration dry run is hypothetical and cannot serve as approval evidence.

## This gate

`tools/context.mjs` now creates one `narrative_review` Task Packet from `--scene COM-00`, `--run-id` and `--task-id`. It discovers the unique Narrative Continuity Contract by `scene_id`, follows its `source_scene` binding, and uses that Locked Scene's declared narrative canon. The packet names exact paths, committed Git blob SHAs, and explicit one-based line ranges plus SHA-256 for the COM-00 macro section and relevant knowledge/state rows. The four bounded source selections total 19,609 bytes; the generated packet is 4,676 bytes. This is an allowlist, not a cached copy of canon or another registry.

```bash
npm run context -- --task narrative_review --scene COM-00 --run-id issue16-context-gate --task-id NQA-COM00-001
npm run context -- --verify-packet generated/session-cache/issue16-context-gate/NQA-COM00-001.packet.json
```

The generator writes the packet atomically under the gitignored session cache and rejects the same run/task destination with changed bytes. Verification rebuilds the packet against committed source bytes and rejects missing, changed, forbidden or mismatched bindings. Existing `--route`/`--node` output stays intact. This packet starts an independent review of an already Locked Scene; it does not assert an earlier worker PASS, semantic QA approval, Human acceptance, or an active production run. The Coordinator still checks its DAG and gate evidence before dispatch. In a later session, regenerate this cache artifact from the Git ref and canonical source hashes.

## Gate evidence and scope

- COM-00 generation and `--verify-packet`: PASS. Canonical input ref before this gate: `c06e3f57445cdaed0d5569ff8591aeefdeb07346`.
- Tampered allowlist, input SHA, missing source and scene binding: BLOCKED by focused tests. Modified or missing committed source bytes: BLOCKED by the same preflight.
- Legacy route context: byte-for-byte unchanged at 3,143 bytes.
- This gate covers deterministic worker context for one real `narrative_review` task. Production machine QA beyond these acquisition/binding checks, Human Review Bundle, artifact-level invalidation, and fresh-session run recovery remain later independent gates under Issue #16.
