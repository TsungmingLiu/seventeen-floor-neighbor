# COM00-S04 CG Artist v0.1 — Failure Record

> Lifecycle: **EXPERIMENTAL — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical pilot material. Do not execute as a production task.

Status: **FAIL — invalid candidate, do not reuse**

Observed failure:
- generated image was unrelated to COM00-S04;
- scene became an outdoor sunset city panorama rather than the bound indoor 17F corridor;
- wardrobe and character presentation did not match the Xu Tang reference pack;
- rendering drifted strongly toward anime/manga illustration despite the explicit visual contract.

Important diagnostic:
- the v0.1 preflight claimed all five Drive references were fetched and visible;
- later coordinator verification confirmed the bound Drive IDs themselves are correct and point to the intended Xu Tang reference sheets and indoor corridor;
- therefore a textual/metadata preflight PASS is insufficient evidence that image pixels were actually bound into the generation context.

Corrective action:
- workflow v0.2 uses exact repo/ref/Drive binding;
- image acquisition is fail-closed;
- each image requires filename/MIME/byte verification, runtime-visible image/file identity when available, and pixel-level visual sanity check;
- if any actual pixel input is unavailable, generation must stop with BLOCKED.

Do not use the failed candidate as identity, style, continuity, or composition reference.
