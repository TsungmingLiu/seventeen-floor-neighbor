# Gate 17: one repository candidate Visual QA packet

The existing COM-00 manifest usability review is a committed `CURRENT_PASS` for three render instructions, not an inspection of image pixels. This gate extends the **existing** `tools/context.mjs` with a separate `visual_review / candidate` Task Packet for exactly `COM00-S04-BASE-NEUTRAL`. It does not generate, edit, accept, ingest, or replace the image.

## Inputs and authority

- Upstream: `issue16-com00-mua-20260927/MUA-COM00-001`, checked against its ledger and committed decision. Its Manifest Usability PASS must be current.
- Candidate: `source.opening.ch1.cg.com00_s04_base_neutral` → `cg.opening.com00.s04_base_neutral` → `assets-src/opening-ch1-demo/cg-com00-s04-base-neutral-v1.webp`, SHA-256 `7f18dccd8483498adc196c144cc6edafeff6bdd0f6db573bee288b32152862ea`.
- Exact references: `ref.xu_tang.face.01` (`assets-src/references/xu-tang/xt-ref-01-face.png`), `ref.xu_tang.wardrobe.a` (`assets-src/references/xu-tang/xt-ref-05-wardrobe-a.png`), and `source.opening.ch1.bg.apt_17f_rain` (`assets-src/opening-ch1-demo/bg-apt-17f-rain-16x9-v1.webp`). Character references retain their original PNG bytes.
- Manifest/style excerpts, the Locked Scene, Narrative Contract, visual direction, character reference excerpt, and CG schema are selected from the current committed ref. The worker allowlist includes only the selected manifest entry and its style, never the whole chapter manifest or another heroine's references.
- The existing manifest, source catalog, asset manifest, source map and render-spec SHA are the only bindings. Source files must be actual committed bytes with the recorded MIME, dimensions, SHA-256 and complete decode. No new asset registry is introduced.

## Rebuild and dispatch

```sh
npm run context -- --task visual_review --review-scope candidate --scene COM-00 \
  --entry-id COM00-S04-BASE-NEUTRAL \
  --candidate-source-id source.opening.ch1.cg.com00_s04_base_neutral \
  --upstream-run-id issue16-com00-mua-20260927 --upstream-task-id MUA-COM00-001 \
  --run-id <new-run-id> --task-id <new-task-id>
npm run context -- --verify-packet generated/session-cache/<new-run-id>/<new-task-id>.packet.json
```

The packet and worker Handoff stay in ignored session cache. A fresh `content_qa / visual_review` worker must actually see the candidate and all three reference pixels; metadata alone cannot yield a Visual QA decision. `PASS` requires a separate verified worker Handoff and short persistent receipt. Human accepted-master selection is another gate. An existing manifest status of `accepted` and machine checks are insufficient for either decision. Run IDs belong to the real dispatched task, not this reproducibility example.

Fault injection covers changed candidate bytes, wrong candidate ID, a foreign scene/entry, forged image role/hash, and conflicting session packet content. `context.mjs --verify-packet` also re-runs the existing runtime/content and production machine validators before dispatch. The current builder is deliberately bounded to this one base CG; Reaction comparison and other entries require their own proven packet binding.
