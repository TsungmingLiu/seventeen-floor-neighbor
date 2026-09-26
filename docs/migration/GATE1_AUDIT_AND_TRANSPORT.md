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
| Actual browser story/network/console run | Not completed: Work Cloud Browser blocked the local preview URL with `ERR_BLOCKED_BY_CLIENT`. Source-level browser tests were reviewed; preview smoke is not a substitute for Chromium acceptance. |
| Cloudflare Pages project settings/deployed output | Not accessible from this repo; `dist/` build output was observed locally, but real Pages limits and cache behavior remain unverified. |

Commands ran in Work Cloud with Node 24.19 and FFmpeg 6.1.1; repository CI declares Node 22. The new branch should run its normal CI before integration. The expected offline failure, real browser test and deployed Pages check remain acceptance gates for the eventual provider cutover.

## Gate boundary and continuation

Gate 1 establishes the complete checked-in inventory/dependency baseline and proves authenticated Drive acquisition, conversion and Git binary readback. It does not accept a new image, convert the four PNG gameplay assets, switch a provider, retire the old package, implement Issue #16 tooling, or claim a network-free build. The next Work session can start at this branch and use the checked-in inventory/hashes, without this chat or its scratch files. Its first bounded engineering gate should implement and test the single approved Asset Ingest contract and begin a safe, reproducible batch of default-gameplay asset migration. Keep the old Drive objects until clean offline build, browser review and cutover gates pass.
