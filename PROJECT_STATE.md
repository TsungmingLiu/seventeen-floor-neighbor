# Project state

Updated: 2026-09-22

## Current milestone

Milestone 1: one branching story, seamless resume title, independent branch history, modular runtime and temporary office OL content. See REFACTOR_PLAN.md for the next milestones. Finish verification and push this milestone, then stop for the user's review.

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

1. Read `AGENTS.md`, this file, and `ARCHITECTURE.md`.
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
- Known/suspected truncated binaries are documented in `content/assets/ASSET_INVENTORY.md`; W1 preserves current bytes but does not claim to repair them.
- Next migration step: W2 asset decode/dimension checking and runtime asset build/optimization.

## Remaining work

Milestone 2: split the large original story file, audit actual image decoding and GitHub file integrity, deepen focused context packets, and add graph folding/filtering for scale. Full CG/sprite regeneration and final OL character design are intentionally later. Do not assume earlier chat images are available: the project's synced `sources/` directory was empty during this milestone.
