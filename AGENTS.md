# Repository guidance

This repository is the code/content source of truth for the game. Do not rely on an earlier chat for current repository state.

## Read order before editing

1. Read `PROJECT_STATE.md` — current milestone and superseding decisions.
2. Read `TODO.md` — current execution board and exact next step.
3. Read `ARCHITECTURE.zh-TW.md` — canonical target architecture. Until W3 documentation sync is complete, its older Local/Hybrid workflow sections are superseded by the Codespaces-only decision recorded in `PROJECT_STATE.md` and `TODO.md`.
4. Read `ARCHITECTURE.md` only as the English mirror; if the architecture mirrors conflict, the Traditional Chinese file wins.
5. Read `IMPLEMENTATION.md` — current prototype implementation details.
6. For player UI, Memories, CG Gallery, replay, or save/frontier work, read `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`.
7. For node-specific work, run `npm run context -- --route <route-id> --node <node-id>` and read the route's `context.md`.

The repository may temporarily differ from the target architecture. Preserve the runnable prototype and migrate incrementally; do not invent a parallel architecture.

## Current migration caveat

W1/W2 are complete: `dist/` is disposable generated output, `dist/assets/` is no longer the source of truth, and the build can resolve Git-backed legacy sources plus Google Drive runtime objects.

W3 core tooling is implemented: the repository contains a Node 22 + ffmpeg devcontainer, `npm run dev`, `npm run preview`, fixed port 4173, and CI preview smoke. W3 is not fully accepted until a fresh Codespace and browser playtest pass. The canonical development decision is Codespaces-only: do not add Local-vs-Remote workflow branches or require the user's Mac.

Do not move or delete binary assets merely to make the repository resemble a future target. Preserve existing Git-backed legacy sources until their canonical replacements are safely recorded.

## Story and asset invariants

- There is one playable story entry; character branches join the default package through `storyFiles` and in-story choices, not a title-screen route selector.
- Keep node IDs and logical asset IDs stable. Changing physical image paths must not require engine changes.
- A route may only use assets listed in its `assetIds`.
- CG and cinematic nodes cannot also declare composite fields.
- Character design, outfit, hairstyle, and makeup versions must match their asset dependencies.

## Required verification

After code/content changes, run at minimum:

```bash
npm run build
npm run validate
git diff --check
```

Run `npm test` for runtime/save changes, including title → continue, node resume, and branch restart behavior.

Never force-push. Finish and push one verified milestone at a time.
