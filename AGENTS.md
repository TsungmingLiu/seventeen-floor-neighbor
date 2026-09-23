# Repository guidance

This repository is the code/content source of truth for the game. Do not rely on an earlier chat for current repository state.

## Read order before editing

1. Read `ARCHITECTURE.zh-TW.md` — canonical target architecture and workflow.
2. Read `ARCHITECTURE.md` only as the English mirror; if the two conflict, the Traditional Chinese file wins.
3. Read `IMPLEMENTATION.md` — current prototype implementation details.
4. Read `PROJECT_STATE.md` — current milestone and pending decisions.
5. For node-specific work, run `npm run context -- --route <route-id> --node <node-id>` and read the route's `context.md`.

The repository may temporarily differ from the target architecture. Preserve the runnable prototype and migrate incrementally; do not invent a parallel architecture.

## Current prototype caveat

The current repository still has legacy behavior that the canonical architecture explicitly plans to migrate, including source/runtime assets under `dist/assets/` and build validation tied to current generated files. Treat these as current implementation constraints, not long-term architectural rules.

Do not move or delete binary assets merely to make the repository resemble the target architecture. First implement the asset pipeline/checkpoint migration defined in the canonical architecture.

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
