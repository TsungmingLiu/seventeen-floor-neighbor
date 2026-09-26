# Gate 1 — baseline audit and Git binary transport

> Status: **PASS for this bounded gate**; the repo-native provider migration and Issue #16 implementation are **not complete**. Base `main`: `084e7519dfcf76265d192f0a6c3a60042e4a0438` (merged Chapter 1 bookstore PR #20). Work branch: `work/asset-migration-gate1-audit`. No open PR existed at the audit start. This is a checkpoint for the next independent Work session, not a production cutover.

## Scope and architecture finding

- Read `AGENTS.md`, workflow manifest/bootstrap, source/context policies, source map and orchestration contract. The full open [Issue #16](https://github.com/TsungmingLiu/seventeen-floor-neighbor/issues/16) was checked via the GitHub connector and is part of the same migration scope. The current canonical path already contains five harnesses, Task Packet/Handoff/run-ledger schemas, `tools/context.mjs` and deterministic CG packet projection; see [dependency/workflow audit](DRIVE_DEPENDENCY_AND_WORKFLOW_AUDIT.md) for gaps and a real COM-00 trace.
- The [asset inventory](ASSET_INVENTORY.md) records the 35 manifest logical IDs, their 48 physical runtime paths (30 local, 18 Drive), receipts, source-catalog masters, consumers, file hashes or clearly labeled unchecked assertions, and tracked unregistered binaries. The 18 Drive paths comprise 15 default `opening-demo` runtime images and 3 old `xu-tang` date CGs. Four COM-01B images are currently PNG and require an approved WebP ingest rather than a blind filename edit.
- `opening-demo` is the default route. The old `xu-tang` package is a separately addressable regression fixture via `?route=xu-tang`, outside the new narrative route graph. By the user's scope decision, its video does not require a new CG sequence. At cutover, either retire the fixture, its exclusive assets and video assertions together while retaining useful generic coverage, or keep a deliberately isolated, tested fixture that has no Drive build dependency. Nothing was deleted in this gate.
- Browser runtime uses built same-origin asset paths through logical IDs. The Drive dependency is primarily build-time/source-reference acquisition, with active providers also present in validators and workflow docs. No provider, registry, renderer, route or gameplay code was changed here.

## Work Cloud binary round trip

| Check | Evidence |
| --- | --- |
| Approved asset | `bg.opening.ch1.apt_17f_rain` → `assets/opening-ch1-demo/bg-apt-17f-rain-16x9-v1.webp`, source-map Drive file `1XYtSjsITajiefIqY2cgvpvQv-rut89Sr`; existing accepted runtime SHA-256 `386c9003df0a6658a343907b646e912aa1e6a68254a01c2dfb89bdc838b33077` |
| Original bytes | Authenticated Drive raw-file fetch produced 125,184 bytes, `image/webp`, 1536×864, VP8/yuv420p. SHA-256 matched the checked-in source-map assertion. Full `ffmpeg -xerror` decode passed. |
| Git object | Copied exact bytes to `assets-src/opening-ch1-demo/bg-apt-17f-rain-16x9-v1.webp` with no transform or provider switch. Git blob SHA `bdd62c66c5b1dc78966a9d98f337cd499a243295`; remote commit `b16df9296c3a380e6906e29f09753eba45e20740`. The shell clone could read but lacked a GitHub push credential, so the authenticated GitHub connector created the binary blob/tree/commit and advanced the branch without force. |
| Independent readback | A fresh GitHub clone of the work branch returned commit `b16df9296c3a380e6906e29f09753eba45e20740`, 125,184 actual WebP bytes (not an LFS pointer), the exact SHA-256 and blob SHA above, and a passing complete decode. |
| Conversion capability | The existing accepted JPEG master (`1vdXT7-IySy1sWnIu82FQ7nL-HJvSn3JP`, SHA-256 `34782d241269690df55a96a666cb46ee57675176ed8e4e3a42f533af9aea2b64`) was independently fetched and converted in scratch with FFmpeg 6.1.1/libwebp quality 82. The 1536×864 output SHA-256 was `94e2ec716d52886d278c394cecdf14601e0cdbcc90a2ec06b57fe7867d40ec26`; full decode and visual crop comparison passed. This new encoding was **not** selected or committed because an accepted WebP already exists. |

The committed WebP is an inert preservation copy at this gate: the active source map still points to Drive. Its future mapping must be updated by the single Asset Ingest/cutover path after all required files and validators are ready.

## Baseline verification

| Check on base code plus inert binary | Result |
| --- | --- |
| `npm run assets:check` | PASS, 71/71 media checks |
| `npm run assets:build` | PASS with Drive available: 48 runtime files, 30 local copies and 18 Drive downloads |
| `npm run build` | PASS, 2 route packages and 48 assets in `dist/` |
| `npm run validate` | PASS, 2 routes, 35 assets, 180 nodes, 4 narrative contracts and 8 Opening CG entries |
| `npm test` | PASS, 37/37 |
| `npm run preview:smoke -- --skip-build` | PASS |
| Fresh checkout, Drive requests blocked, `npm run assets:build` | Expected **FAIL**, 18 blocking Drive sources (53/71 other media checks passed); proves current build is not offline. The one committed WebP does not mask this failure. |
| Fresh checkout binary SHA-256, blob SHA and complete decode | PASS |
| Static output | `npm run build` emitted `dist/`; route asset bindings and built file existence still need to be rechecked after source-map cutover. |

Commands ran in Work Cloud with Node 24.19 and FFmpeg 6.1.1; repository CI declares Node 22. GitHub Verify passed on a bounded rerun after two existing Drive URLs returned transient HTTP 500 on the first attempt. The expected offline failure remains an acceptance gate for the provider cutover.

## Gate boundary and continuation

Gate 1 establishes the checked-in inventory/dependency baseline and proves authenticated Drive acquisition, conversion capability and Git binary readback. It does not accept a new image, convert the four PNG gameplay assets, switch a provider, retire the old package, implement Issue #16 tooling, or claim a network-free build. The next Work session can start at this branch and use the checked-in inventory/hashes, without this chat or its scratch files.

## Revised next gate (user decision, 2026-09-25)

Gate 2 is the **actual asset migration**. For all 18 current `gdrive-public` runtime entries, first obtain the real bytes from Drive into Work Cloud, verify each against its checked-in byte count/SHA-256 and full decode, and place approved outputs in the Git repository. Copy already accepted WebP byte-for-byte; use the single approved Asset Ingest entry for PNG/JPG conversion, including the four COM-01B PNGs, with explicit dimensions/alpha/crop checks and new output hashes. Do not treat a session cache file or a Git LFS pointer as a repository asset.

Once every referenced asset has a verified repository file, update the **existing** manifest/source-map/recipes/receipts and relevant validators together so logical IDs resolve locally. Include the three old `xu-tang` date CGs among the 18 byte-copy/localization entries while that regression fixture remains registered; its already local video needs no replacement sequence. The gate passes only when a fresh Git checkout with Drive credentials absent and Drive network blocked runs `assets:check`, `assets:build`, `build`, `validate`, `test`, `preview:smoke` and `git diff --check`, and every referenced asset path exists with the expected bytes and decodes. The current 18 blocked downloads are an expected **pre-migration baseline**, not a conversion failure.

No Cloudflare-specific deployment check or real browser story test is required for this migration. Validate the built `dist/` asset files and logical bindings with deterministic checks instead. Keep the old Drive objects until the repository migration passes; Issue #16 workflow optimization remains part of the later shared implementation scope.
