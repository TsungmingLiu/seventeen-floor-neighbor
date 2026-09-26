# Gate 3: Repository production references

> Lifecycle: migration checkpoint. The active authority is `content/assets/source-catalog.json`; this document reports its verified cutover.

The existing Opening accepted CG/background WebPs are now also the approved production reference representation. Character identity/wardrobe sheets keep exact source PNG bytes. The user-supplied Xu Tang body image is a distinct JPEG replacement and is optional; its pixels are not asserted equivalent to the unavailable historical PNG. Only four face/wardrobe sheets are bound by current Opening CG manifests.

The prior Drive ID → source ID mapping and old master hashes live **only** in `content/assets/ingest-receipts/repo-source-gate3-historical.json` (historical-only). The 15 accepted current source IDs, paths and hashes plus five character references are recorded in `repo-source-gate3-v1.json`. The Gate 2 runtime old → new mapping remains in `docs/migration/GATE2_REPO_RUNTIME_ASSETS.md`.

| Logical production source ID | Repo file | SHA-256 | Current consumer |
| --- | --- | --- | --- |
| `source.opening.ch1.bg.apt_17f_rain` | `assets-src/opening-ch1-demo/bg-apt-17f-rain-16x9-v1.webp` | `386c9003df0a6658a343907b646e912aa1e6a68254a01c2dfb89bdc838b33077` | COM00-S02-DOOR-ASSIST,COM00-S04-BASE-NEUTRAL |
| `source.opening.ch1.cg.com00_s02_door_assist` | `assets-src/opening-ch1-demo/cg-com00-s02-door-assist-v1.webp` | `3a2a340f275c8870840c2103ed3f8f235e5389bd635c87214aa3a48ec1eec59e` | cg.opening.com00.s02_door_assist |
| `source.opening.ch1.cg.com00_s04_base_neutral` | `assets-src/opening-ch1-demo/cg-com00-s04-base-neutral-v1.webp` | `7f18dccd8483498adc196c144cc6edafeff6bdd0f6db573bee288b32152862ea` | cg.opening.com00.s04_base_neutral |
| `source.opening.ch1.cg.com00_s04_r01_polite_smile` | `assets-src/opening-ch1-demo/cg-com00-s04-r01-polite-smile-v1.webp` | `51ab914e1d2cc294b7abcc2040520332c579abecaec80ebd9314a14d0e3452a0` | cg.opening.com00.s04_r01_polite_smile |
| `source.opening.ch1.bg.apt_elevator` | `assets-src/opening-ch1-demo/bg-apt-elevator-16x9-v1.webp` | `2e1882334057fbd08b4d2c301b7924efc34cd1875e3d0dc1176c6315525e195e` | COM01X-BASE-NORMAL |
| `source.opening.ch1.cg.com01x_base_normal` | `assets-src/opening-ch1-demo/cg-com01x-base-normal-v1.webp` | `c93cb5f8395839cef8d1d80f9402fe910f8cd0240dc1a10085f64421d41c95cf` | cg.opening.com01x.base_normal |
| `source.opening.ch1.cg.com01x_r01_restart` | `assets-src/opening-ch1-demo/cg-com01x-r01-restart-v1.webp` | `4da7ff3dcdc2a563890653125fd20e775a4c0af10dc260b8536c858a2542f0c9` | cg.opening.com01x.r01_restart |
| `source.opening.ch1.cg.com01x_r02_dry_smile` | `assets-src/opening-ch1-demo/cg-com01x-r02-dry-smile-v1.webp` | `62c77eba8430f620099a8bc9f7bd6e8d0939e77645129f12f1ec85cf83cfb924` | cg.opening.com01x.r02_dry_smile |
| `source.opening.ch1.bg.acg_shop` | `assets-src/opening-ch1-demo/bg-acg-shop-16x9-v1.webp` | `3f3a37c605ebbdb8a4a127c4298f435787ecdda40367802aa6d2a1eba8e0b3da` | COM01J-BASE-GUARDED |
| `source.opening.ch1.cg.com01j_base_guarded` | `assets-src/opening-ch1-demo/cg-com01j-base-guarded-v1.webp` | `da44c827e4f0839dc4b9885b3eca9df307660688e1e078b1cf5c8a5133e0b36b` | cg.opening.com01j.base_guarded |
| `source.opening.ch1.cg.com01j_r01_interested` | `assets-src/opening-ch1-demo/cg-com01j-r01-interested-v1.webp` | `3c3d1475a1ea1215f744870ba00c1127acd423141bbf4915ba9196e8e75d795f` | cg.opening.com01j.r01_interested |
| `source.opening.ch1.com01b.01` | `assets-src/opening-ch1-demo/opening-ch1-com01b-01.webp` | `38eff53cc0fecff024acb346c091706f6b74d98501e950ee47e1cb2c2e98c741` | cg.opening-ch1.com01b.01 |
| `source.opening.ch1.com01b.02` | `assets-src/opening-ch1-demo/opening-ch1-com01b-02.webp` | `4127f991bcaf31e0ebd7db9c35ca8d9cf30b8f24ad889bf0741614e3db7297b7` | cg.opening-ch1.com01b.02 |
| `source.opening.ch1.com01b.03` | `assets-src/opening-ch1-demo/opening-ch1-com01b-03.webp` | `aa6a236bceca59882edd5f3e1eded77b99347ca62fe5ed81ff74ee4d84bdcbc0` | cg.opening-ch1.com01b.03 |
| `source.opening.ch1.com01b.04` | `assets-src/opening-ch1-demo/opening-ch1-com01b-04.webp` | `6ade85b6b4f6ece1ee95923784fe8469bdc0a6b03acf6b9608f4466141a87f3a` | cg.opening-ch1.com01b.04 |
| `ref.xu_tang.face.01` | `assets-src/references/xu-tang/xt-ref-01-face.png` | `2fd137f796d0e7667a5913748158f75705b1a538b346b9e7f76aacb3c79acfd0` | COM00-S02-DOOR-ASSIST,COM00-S04-BASE-NEUTRAL,COM01X-BASE-NORMAL,COM-01B-CG-01,COM-01B-CG-02 |
| `ref.xu_tang.body.03` | `assets-src/references/xu-tang/xt-ref-03-body.jpeg` | `d436d6ceeda95a2cd8115087d6b49e39baa72ec2f7552909da2b9a2eb933cdd4` | optional; no current manifest binding |
| `ref.xu_tang.wardrobe.a` | `assets-src/references/xu-tang/xt-ref-05-wardrobe-a.png` | `aaf33f06f3e39fc476deee03ab261a43e0911b8393366ae7399c633abfadc716` | COM00-S02-DOOR-ASSIST,COM00-S04-BASE-NEUTRAL,COM01X-BASE-NORMAL,COM-01B-CG-01,COM-01B-CG-02 |
| `ref.jiang_yucheng.face.01` | `assets-src/references/jiang-yucheng/jyc-ref-01-face.png` | `9f16028a4f763779bc74b28c0524707cbcc77306f623674e8b8b49384a045d72` | COM01J-BASE-GUARDED |
| `ref.jiang_yucheng.wardrobe.a` | `assets-src/references/jiang-yucheng/jyc-ref-05-wardrobe-a.png` | `87abb71fa21c2cf939da5fc16741d26d67add479a5185d2140220c449340e0af` | COM01J-BASE-GUARDED |

Three date CG records remain in the same catalog as local regression fixtures, each pointing to an existing WebP. Five old private master metadata records (Xu identity v2 and four video keyframes) are historical-only; no active CG manifest references them. The seven other six-sheet character references are not currently available as repo files. A new manifest that requires one must wait for exact pixels and a verified catalog entry.

No output image was regenerated in this gate. The four COM-01B entries with `render_ready` status retain their candidate PNG output names; the already accepted playable COM-01B runtime WebPs are separate asset records.

Verification is enforced by `npm run validate`: all catalog entries must be present, match MIME signature, bytes, SHA-256 and dimensions, and fully decode; current manifest bindings must resolve exactly. `npm run assets:check` separately verifies all 48 runtime paths. A fresh checkout and remote binary readback are required before this checkpoint is complete.
