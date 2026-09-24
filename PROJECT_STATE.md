# Project state

Updated: 2026-09-23

## Current milestone

**W4 — Player UI / Memories / CG Gallery is complete on `main`.** W4 uses explicit Memory Events, journey v2 cursor/frontier saves, v1 migration, the one-page Memories timeline, a Start/Continue + Memories + CG title, a smaller dialogue/choice layout, and the simple gallery viewer. The 123-node Xu Tang/OL playable package remains an engine and migration fixture; Opening Vertical Slice production content is tracked separately. W4 Verify run `35948336731` and Chromium Browser Acceptance run `35948336719` passed. W3 fresh Codespace proof is run `35932727909`.


## Canonical narrative plan

2026-09-23 已確認雙女主 prototype 採 **Braided Narrative v0.5**，取代「早期 route lock 後兩條完全分離」的舊劇情方向。

Canonical planning docs：

- `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md` — 完整約 66 個 authoring-level scene/gate/ending/after-story 規格、每幕目的、choice/state、conflict/repair/endings。
- `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md` — route graph、attention windows、re-approach、crossover、knowledge flags、honest overlap / deception / commitment gate 與 implementation guardrails。
- `docs/art/PROTOTYPE_ART_REQUIREMENTS.md` — scene backgrounds、Xu/JYC sprite sets、38+ CG / after-story slots、逐 node asset mapping 與 production priority。

核心 narrative decisions：

- 前中期不使用單一 `route_primary` 關閉另一位女主；
- 玩家可以在未 exclusivity 前自然同時約會兩人；
- `recentFocus`、heroine-specific relationship state 與 knowledge flags 製造低成本交織感；
- late commitment 才真正鎖線；
- honest overlap 與 deliberate deception 必須分開；
- 修羅場 tone 是安靜、成人、以誠實與責任為核心，不做兩女爭男喜劇；
- 舊 123-node playable story 仍只視為 engine / W3/W4 migration fixture，不代表新 production story ordering。
- 許棠 canonical profile 已同步為 **27 歲 / 約 170 cm**；approved 6-sheet reference pack 已鎖定。
- 江雨澄 canonical profile 已同步為 **23 歲 / 約 160 cm**，纖細小骨架、腿相對偏長；approved 6-sheet reference pack 已鎖定。
- Ending 不再等同 runtime terminal：Good 解鎖 3 段 Relationship After Story；Friend / Distance 各有短 coda。
- After Story 是玩家 reward phase，會提高親密度與 fan-service 密度；`full` profile 可加入 profile-gated mature-only extension，`sfw` 必須 compile-time prune 並維持完整自然流程。

後續 narrative work 應先讀上述三份文件，再讀 setting proposal；後續 art generation 以 `docs/art/PROTOTYPE_ART_REQUIREMENTS.md` + `docs/art/CHARACTER_REFERENCE_PACK_SPEC.md` 的 canonical references 為準。Opening Vertical Slice CG 可直接使用 `docs/art/VERTICAL_SLICE_CG_GENERATION_PROMPTS.md`。

Creative production 進度不要塞進 root `TODO.md`。獨立使用 `docs/narrative/CONTENT_PRODUCTION_TODO.md`；root `TODO.md` 繼續只追 W3/W4/engine/tooling。建議一個 content production batch 對應一個新 session。


## W4 player-facing implementation

The accepted behavior and data contract are documented in `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`.

Key approved decisions:

- title becomes one large Start/Continue button plus two smaller Memories and CG buttons;
- replaying old content happens through Memories; there is no separate New Game entry;
- player-facing branch UI becomes one vertically scrolling Memories timeline, not a second-level route detail screen or a giant pan/zoom graph;
- Memory Events are narrative units and are not one-to-one with engine nodes;
- replay cursor and deepest story frontier must be separate so replay never regresses Continue;
- single-heroine memory scenes use the event CG as a faded, face-focused backdrop; common scenes use scene/background art;
- CG remains a simple unlocked/locked gallery with full viewer.

The current runtime implements these contracts for the existing fixture. New production scenes will need their own stable Memory Event metadata and asset mapping during integration.

## Playable content

- One registered package: `xu-tang`, retaining `chapter-01` storage keys.
- 123 nodes: original 118 Xu Tang nodes plus a 5-node OL branch.
- `choice1` offers the OL entry; `officeRoute` selects the separate `office_teaser` ending. Original Xu Tang path and four endings remain available.
- 23 active assets and recipes, including 18 gallery entries.
- OL uses existing `sprite-neutral.webp`, `sprite-playful.webp`, and `cg-hallway-meet.jpg`. These are temporary reused office/black-stocking references, not the final character design.
- Old Lin Cheng source files and images remain archived and unregistered. The validator counts that archived character definition; it is not a third playable heroine.

## Runtime and save contracts

- Title: one large Start/Continue, two smaller Memories/CG actions, and a sound icon. A completed run returns the primary action to Start; an explicitly started fresh run can then be Continued from its cursor without erasing the historical frontier. There is no player-facing Branches or standalone restart entry.
- Title backdrop resolves from frontier Memory Event metadata, unlocked highlights, and visual fallback; cinematic nodes use posters and completed stories can show selected ending art.
- `src/progress.js` saves journey v2 node-entry snapshots, cursor, monotonic frontier rank/event, checkpoints, flags, stats, return stack, and explored edges. V1 journeys migrate without clearing CG or endings.
- `src/memories.js` renders one vertical Memory Event timeline with locked spoiler-safe cards, same-page filters, a frontier marker, and replay. `src/branches.js` remains for developer graph helpers only.
- Replay at the root resets the active playthrough. Gallery/endings and explored checkpoints remain. Ordinary Memories replay does not regress Continue's frontier; the explicit post-ending fresh run is the one exception, resuming its own cursor while retaining the historical frontier.
- A node stores its latest arrival snapshot, not multiple historical save slots. Resume restarts that node's text/video.
- Incompatible or damaged snapshots are ignored. Existing pre-refactor CG/endings remain; the old version did not save node positions.
- Image failures use an interface fallback; this does not repair missing or damaged originals.
- Builds stamp module/style URLs with content hashes to prevent mixed cached runtime versions.

## Start a new conversation

1. Read this file, `TODO.md`, `AGENTS.md`, and `ARCHITECTURE.zh-TW.md`.
2. For prototype narrative / scene / branching work, also read:
   - `docs/narrative/PROTOTYPE_BRAIDED_NARRATIVE_SPEC.md`
   - `docs/narrative/PROTOTYPE_ROUTE_GRAPH_AND_STATE.md`
   - `docs/art/PROTOTYPE_ART_REQUIREMENTS.md`
   - `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md` when Memory/replay/frontier/UI is involved.
3. Treat the existing 123-node playable story as a migration/engine fixture, not the canonical production narrative.
4. For an existing runtime node: run `npm run context -- --route xu-tang --node <node-id>`.
5. For OL continuity also read `content/routes/office-ol/context.md`.
6. Change the source file named by the packet, keeping stable IDs stable once they enter implementation/save contracts.
7. Build, validate, test runtime changes, and check the diff. Keep source and generated output together.

## Verification

- W4 source and generated runtime passed 44/44 media checks, build, content validation, preview smoke, and 20/20 Node tests.
- Playwright Browser Acceptance exercises v1 save migration, old and same-event replay without frontier regression, Start/Continue, Memories, OL choice flow, gallery/cinematic, ending persistence, and 320px overflow/touch targets.
- W4 final implementation: Verify run `35948336731` and Browser Acceptance run `35948336719`, both successful on commit `1c53504`.
- Post-demo fixes on `1bf2cb6`: completed runs return the title to Start while explicit new runs resume from their own cursor; cinematic playback prefers MP4 and reveals the poster after ending. The original kiss MP4 and a temporary `runtime-public/test.mp4` swap both advanced normally in browser playback; the test clip was removed from the demo, and no production asset was replaced. Verify `35951991571` and Browser Acceptance `35951991567` passed; Node tests are 22/22.

## Migration status

- W1 source/output boundary is implemented and CI-verified: static shell source lives in `public/`, binary preservation sources in `assets-src/`, runtime mapping in `content/assets/source-map.json`, and `dist/` is clean-build reproducible.
- CI run `35807627568` passed build, validate, tests, diff check, and generated-output reproducibility.
- W2 strict media validation and Drive provider are implemented and CI-verified.
- The three date CGs, Xu Tang identity v2, and four first-kiss keyframes were proven truncated by full decode, recovered from ChatGPT Library, decoded successfully, and stored in Google Drive `source-private`.
- The three date CG runtime images are WebP objects in `runtime-public`; CI anonymously downloads, SHA-checks, full-decodes, and rebuilds them.
- `dist/assets/` is generated/ignored and no longer carries committed runtime binaries.
- CI run `35812177697`: 44/44 asset checks passed, 3 Drive downloads succeeded, build/validate/reproducibility passed, and 9/9 tests passed.
- Storage decision: Google Drive is the current pre-commercial source/runtime store; Cloudflare R2 is deferred until commercialization needs justify it.
- 2026-09-23 workflow decision: canonical development is now **Codespaces-only**. GitHub is code/content/history truth; Google Drive remains the asset store; Codespaces is the supported build/test/dev environment; local development is an unsupported fallback and is not an acceptance target.
- W3 core implementation is now on `main`: Node 22 + ffmpeg/ffprobe devcontainer, fixed port 4173, dependency-free preview server, `npm run dev`, `npm run preview`, and CI preview smoke.
- GitHub Actions run `35870496211` first proved the W3 preview-server path; latest Verify run `35871522230` also passed asset check/build, build, preview smoke, validate, 9/9 tests, diff check, and generated-output reproducibility.
- Devcontainer run `35871522272` successfully built `.devcontainer/Dockerfile` and verified Node 22, ffmpeg, and ffprobe inside the actual container image.
- W3 Human environment-lifecycle gate has been removed. `npm run codespace:accept` creates/deletes ephemeral fresh Codespaces and performs clean engineering acceptance via SSH/private tunnel; `npm run codespace:review` prepares a temporary public review URL for AI cloud-browser testing.
- Repository secret `CODESPACES_TOKEN` is configured and empirically requires `Codespaces: read/write` plus `Codespaces metadata: read`. The workflow performs a permission preflight before creating anything.
- Codespace creation is fully non-interactive: the script queries available machine types, selects the smallest available machine, calls the Codespaces REST API, waits for `Available`, and only then SSHs in.
- Live engineering acceptance run `35932727909` is the canonical W3 proof: 44/44 media checks, 3 Drive runtime downloads, build/validate, 9/9 tests, 4173 preview readiness, private forwarded-tunnel HTTP smoke, and successful automatic Codespace deletion.
- During that acceptance work, the old `mv-first-kiss.mp4/webm` were proven non-portable/truncated for ffmpeg 5.1. They were rebuilt from the four canonical Drive keyframes into true 10-second H.264/AAC and VP9/Opus files; commit `6455239542e950ea54686b434a1a6c52a76e1feb` passes both ffmpeg 5.1 devcontainer and ffmpeg 6.1 Actions full-decode.
- W3 is **complete**. Chromium Browser Acceptance run `35933586244` deterministically exercised start/continue/reload/localStorage, mute persistence, OL branch choice, branches/gallery, cinematic metadata/skip/gallery playback, ending persistence, return-to-title, 320px layout, and blocking browser errors.
- `npm run codespace:review` remains an optional temporary-public subjective review surface; it is no longer required to prove runtime correctness or close W3.
- The old TODO milestone name “W4 Google Drive Asset Store” is retired. Drive-first storage is W2 foundation; after W3 Human acceptance, the actual W4 is the approved Player UI / Memories / CG Gallery implementation in `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`.
- Canonical workflow docs are being synchronized to Codespaces-only in the same W3 milestone; Local Working is no longer a supported acceptance path.

## Remaining work

The next creative convergence is integrating the Opening Vertical Slice with W4 runtime and Memory metadata, then a human pacing/composition review. W5 cloud-complete verification, W6 build profiles, and W7 release follow the technical roadmap. Full CG/sprite regeneration and final OL character design are later content work; the old 123-node fixture is not the production narrative.
