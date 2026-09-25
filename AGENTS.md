# Repository guidance

This repository is the code/content source of truth for the game. Do not rely on an earlier chat for current repository state.

## Mandatory AI bootstrap

For any new AI production or development session:

1. Read `.ai/WORKFLOW_MANIFEST.yaml`.
2. Follow `.ai/harnesses/bootstrap.md`.
3. Read `.ai/policies/SOURCE_AUTHORITY.md` and `.ai/policies/CONTEXT_ISOLATION.md`.
4. Read `docs/CONTENT_PRODUCTION_SOURCE_MAP.md`; read `PROJECT_STATE.md` only when the resolved stage requires current milestone context.
5. Resolve exactly one active harness/pass. Multi-stage work uses sequential bounded Task Packets; there is no separate coordinator role.
6. Load only the sources allowed by the resulting Task Packet.

**Do not start by reading the entire repo. Do not reuse a stale production prompt from an earlier conversation.**

For engineering work, the specialist may additionally use `TODO.md`, `ARCHITECTURE.zh-TW.md`, and task-specific implementation files.

## Current visual-production decision

New production art is **CG-first, 16:9 landscape-first, responsive full viewport**. The canonical contract is `docs/art/PRODUCTION_VISUAL_DIRECTION.md`.

- New production scenes do not require sprites.
- Existing sprite assets still referenced by the runtime remain legacy/regression fixtures until intentionally migrated.
- Ordinary motion should use tightly related CG sequences when appropriate.
- MP4/WebM support remains; production video is reserved for special events.
- Old 9:16/sprite/operator/pilot guidance is archived or experimental and cannot be used as production input.

## Current migration caveat

W1/W2/W3/W4 foundation is complete. Preserve runnable runtime fixtures while migrating production content. Check actual manifest/source-map/build references before deleting binary assets; an unreferenced local candidate is not a required runtime fixture.

The old `xu-tang` playable story and its remaining sprite-heavy visual data remain engine/migration fixtures; they are not the canonical production story or art pipeline.

## Story and asset invariants

- There is one playable story entry; character branches join the default package through story content, not a title-screen route selector.
- Keep node IDs and logical asset IDs stable once they enter implementation/save contracts.
- A route may only use assets listed in its `assetIds`.
- CG and cinematic nodes cannot also declare composite fields.
- Character identity/design versions must match their explicit asset dependencies.
- A specialist worker must never load unrelated heroine data merely for “context”.

## Required verification

After code/content integration changes, run at minimum:

```bash
npm run build
npm run validate
git diff --check
```

Run `npm test` for runtime/save changes.

Never force-push. Finish and push one verified milestone at a time.
