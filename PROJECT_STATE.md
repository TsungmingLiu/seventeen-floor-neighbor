# Project state

Updated: 2026-09-23

## Current milestone

W3 — Codespaces Development & Preview. Core preview/devcontainer tooling is implemented, and AI-operated ephemeral Codespace lifecycle tooling is now implemented. Remaining gates are: run `codespace:accept` once under a real authenticated Codespaces-capable `gh` operator, then run `codespace:review` + AI cloud-browser UI/localStorage smoke. Human no longer needs to create/rebuild Codespaces; W4 waits for these W3 gates.

## Approved W4 UX target (not implemented yet)

The next player-facing UX direction is now documented in `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`.

Key approved decisions:

- title becomes one large Start/Continue button plus two smaller Memories and CG buttons;
- replaying old content happens through Memories; there is no separate New Game entry;
- player-facing branch UI becomes one vertically scrolling Memories timeline, not a second-level route detail screen or a giant pan/zoom graph;
- Memory Events are narrative units and are not one-to-one with engine nodes;
- replay cursor and deepest story frontier must be separate so replay never regresses Continue;
- single-heroine memory scenes use the event CG as a faded, face-focused backdrop; common scenes use scene/background art;
- CG remains a simple unlocked/locked gallery with full viewer.

This is a target specification, not a claim about the current runtime. Preserve current behavior until W4 is implemented and migrated with tests.

## Playable content

- One registered package: `xu-tang`, retaining `chapter-01` storage keys.
- 123 nodes: original 118 Xu Tang nodes plus a 5-node OL branch.
- `choice1` offers the OL entry; `officeRoute` selects the separate `office_teaser` ending. Original Xu Tang path and four endings remain available.
- 23 active assets and recipes, including 18 gallery entries.
- OL uses existing `sprite-neutral.webp`, `sprite-playful.webp`, and `cg-hallway-meet.jpg`. These are temporary reused office/black-stocking references, not the final character design.
- Old Lin Cheng source files and images remain archived and unregistered. The validator counts that archived character definition; it is not a third playable heroine.

## Runtime and save contracts

- Title: continue/start, CG, branches, sound. No standalone restart button.
- Title preview resolves the current node's visual using `src/visuals.js`; cinematic nodes show the poster, completed stories show the selected ending art.
- `src/progress.js` saves versioned node-entry snapshots, flags, stats, return stack, and explored edges.
- `src/branches.js` displays a vertically scrolling node graph with explicit destination references, CG state, locked nodes, and latest checkpoints.
- Starting at the root resets only the current playthrough. Gallery/endings and explored checkpoints remain.
- A node stores its latest arrival snapshot, not multiple historical save slots. Resume restarts that node's text/video.
- Incompatible or damaged snapshots are ignored. Existing pre-refactor CG/endings remain; the old version did not save node positions.
- Image failures use an interface fallback; this does not repair missing or damaged originals.
- Builds stamp module/style URLs with content hashes to prevent mixed cached runtime versions.

## Start a new conversation

1. Read this file, `TODO.md`, `AGENTS.md`, and `ARCHITECTURE.zh-TW.md`.
2. For a node: run `npm run context -- --route xu-tang --node <node-id>`.
3. For OL continuity also read `content/routes/office-ol/context.md`.
4. Change the source file named by the packet, keeping node and asset IDs stable.
5. Build, validate, test runtime changes, and check the diff. Keep source and generated output together.

## Verification

- Build and content validation pass.
- Nine Node tests cover save isolation/corruption, branch graph and spoiler locks, choice resume, and random-scene return stacks.
- Browser acceptance covers title/start/resume, reload persistence, identical preview/game visual sources, OL branch, branch navigation, and 320px layout; see the milestone handoff for the final result.

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
- W3 is **not complete yet**, but the Human environment-lifecycle gate has been removed. `npm run codespace:accept` now creates/deletes ephemeral fresh Codespaces and performs clean engineering acceptance via SSH/private tunnel; `npm run codespace:review` prepares a temporary public review URL for AI cloud-browser testing.
- The current chat's GitHub connector does not expose Codespace lifecycle actions, so it cannot itself perform the first live run. The next capable AI operator (for example Work with authenticated GitHub CLI/cloud computer) should execute these commands rather than asking the Human to build the environment manually.
- Optional zero-interaction GitHub Actions path exists as `Codespace Acceptance` workflow_dispatch once the repository has a one-time `CODESPACES_TOKEN` secret with sufficient Codespaces permission.
- The old TODO milestone name “W4 Google Drive Asset Store” is retired. Drive-first storage is W2 foundation; after W3 Human acceptance, the actual W4 is the approved Player UI / Memories / CG Gallery implementation in `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`.
- Canonical workflow docs are being synchronized to Codespaces-only in the same W3 milestone; Local Working is no longer a supported acceptance path.

## Remaining work

Milestone 2: split the large original story file, audit actual image decoding and GitHub file integrity, deepen focused context packets, and add graph folding/filtering for scale. Full CG/sprite regeneration and final OL character design are intentionally later. Do not assume earlier chat images are available: the project's synced `sources/` directory was empty during this milestone.
