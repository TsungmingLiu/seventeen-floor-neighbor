# Repository guidance

This repository is the code/content source of truth for the game. Do not rely on an earlier chat for current repository state.

## Read order before editing

1. Read `PROJECT_STATE.md` — current milestone and superseding decisions.
2. Read `TODO.md` — current execution board and exact next step.
3. Read `ARCHITECTURE.zh-TW.md` — canonical target architecture and Codespaces-only workflow.
4. Read `ARCHITECTURE.md` only as the English mirror; if the architecture mirrors conflict, the Traditional Chinese file wins.
5. Read `IMPLEMENTATION.md` — current prototype implementation details.
6. For player UI, Memories, CG Gallery, replay, or save/frontier work, read `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`.
7. For node-specific work, run `npm run context -- --route <route-id> --node <node-id>` and read the route's `context.md`.

The repository may temporarily differ from the target architecture. Preserve the runnable prototype and migrate incrementally; do not invent a parallel architecture.

## Current migration caveat

W1/W2 are complete: `dist/` is disposable generated output, `dist/assets/` is no longer the source of truth, and the build can resolve Git-backed legacy sources plus Google Drive runtime objects.

W3 is complete. Run `35932727909` proved the fresh Codespace lifecycle; Browser Acceptance run `35933586244` proved the W3 browser flows. W4 player UI, Memories, journey v2 migration, and replay/frontier semantics are implemented on `main`; see `PROJECT_STATE.md` for the latest W4 acceptance runs. `npm run codespace:accept` remains the clean engineering gate when fresh environment proof is needed; `npm run codespace:review` is optional for subjective UX review.

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
