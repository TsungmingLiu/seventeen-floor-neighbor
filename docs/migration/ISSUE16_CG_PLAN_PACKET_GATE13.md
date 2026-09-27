# Gate 13 — bounded COM-00 CG planning packet

> Engineering packet capability, not a new CG plan, artwork, Visual QA result, or Human approval. The default playable scene and accepted CG manifest remain unchanged.

Baseline: `7deb94c7c22d201eb0e3f68dbc2ce63f0b969d36`. The independent COM-00 Narrative QA run `issue16-com00-nqa-20260926` recorded `NQA-COM00-001` PASS. `tools/verify-production-run.mjs` checks that persisted decision, its packet SHA and the current approved Locked Scene before this packet can be constructed.

## Exact input boundary

The Coordinator supplies the selected reference IDs explicitly. The current CG manifest is planner output and is not a source for this selection. The three required IDs resolve through the **existing** repo source catalog:

| Source ID | Role | Repo file | SHA-256 |
| --- | --- | --- | --- |
| `ref.xu_tang.face.01` | Xu Tang face | `assets-src/references/xu-tang/xt-ref-01-face.png` | `2fd137f796d0e7667a5913748158f75705b1a538b346b9e7f76aacb3c79acfd0` |
| `ref.xu_tang.wardrobe.a` | Xu Tang wardrobe | `assets-src/references/xu-tang/xt-ref-05-wardrobe-a.png` | `aaf33f06f3e39fc476deee03ab261a43e0911b8393366ae7399c633abfadc716` |
| `source.opening.ch1.bg.apt_17f_rain` | environment | `assets-src/opening-ch1-demo/bg-apt-17f-rain-16x9-v1.webp` | `386c9003df0a6658a343907b646e912aa1e6a68254a01c2dfb89bdc838b33077` |

`ref.xu_tang.body.03` remains an optional original JPEG and is omitted from this selection. The packet rejects unrelated heroine references. It checks exact source row role/status, background asset binding, committed Git blobs, byte hashes, MIME, dimensions and full image decode. The planner's text allowlist contains the narrative contract, Locked Scene, visual direction, CG schema and **only the Xu Tang excerpt** from the character reference pack. Selected image paths and hashes are listed separately; the execution adapter must actually deliver these pixels to a fresh planner worker. The full source catalog, asset manifest, workflow manifest, existing CG manifest and other heroine material are not worker sources.

## Rebuild and dispatch boundary

```bash
npm run context -- --task cg_plan --scene COM-00 --run-id <new-run-id> --task-id CGP-COM00-001 --upstream-run-id issue16-com00-nqa-20260926 --upstream-task-id NQA-COM00-001 --reference-ids ref.xu_tang.face.01,ref.xu_tang.wardrobe.a,source.opening.ch1.bg.apt_17f_rain --ref <current-HEAD>
npm run context -- --verify-packet generated/session-cache/<new-run-id>/CGP-COM00-001.packet.json
```

The packet is written atomically to ignored session cache; a conflicting same run/task file blocks. Its `inputs.accepted_outputs` binds the earlier **external** QA run and approved scene blob. `depends_on` is empty because it names only tasks in the new run. `input_versions` contains the selected source row digests, selected image Git blobs, the one background registry row, accepted scene and QA decision receipt. An unrelated source-catalog row is not a planning input. The packet is pinned to the current committed HEAD for its complete source binding; after a new commit, rebuild and review exact affected versions before dispatch. A different Git ref alone is not evidence that an already accepted CG needs redrawing.

The output target is a proposed CG manifest in session cache. An independent manifest usability review precedes any canonical adoption; this gate records no new production ledger, task PASS, Human choice, generated image or accepted asset. Other scene types and downstream worker packets still need separate bounded gates.

## Verification

The focused tests inject a changed committed QA receipt, changed Locked Scene, corrupt image bytes, mismatched catalog role, missing/duplicate/unrelated reference ID, altered packet content and conflicting cache destination. Each case must fail closed. `--verify-packet` also runs the existing content and production machine validators. A clean checkout and the full repository checks are recorded in the Gate 13 PR checkpoint.
