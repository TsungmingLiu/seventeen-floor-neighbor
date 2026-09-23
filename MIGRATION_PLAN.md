# MIGRATION_PLAN.md

> Execution plan for migrating the current prototype to the canonical Hybrid Local / Cloud workflow.
>
> Canonical architecture: `ARCHITECTURE.zh-TW.md`.
> Current implementation notes: `IMPLEMENTATION.md`.

## Goal

Move from the current runnable prototype to a workflow where:

- local Codex + local assets is the fast content-production loop;
- GitHub is canonical code/content history;
- private R2 stores cloud-checkpoint master assets;
- GitHub Codespaces + ChatGPT Work can rebuild and preview without the local Mac;
- ChatGPT Sites is used for stage-level review;
- public R2 / CDN serves production runtime binaries;
- adding new heroines/routes is primarily content production, not engine work.

Do not rewrite the engine unless a validated content requirement demands it.

---

## Today

### T1 — Canonical architecture in repo — DONE

**AI**
- Add `ARCHITECTURE.zh-TW.md` as canonical architecture.
- Keep `ARCHITECTURE.md` as English mirror.
- Preserve old implementation notes in `IMPLEMENTATION.md`.
- Update `AGENTS.md` read order.

**Acceptance**
- New conversations can distinguish target architecture from current prototype.

### T2 — Freeze the current milestone and inventory migration gaps

**AI**
- Treat current `main` as the pre-migration baseline.
- Preserve route package, resume, branch history, context tooling and current story behavior.
- Record the main gaps:
  - source binaries still live under `dist/assets/`;
  - validation still treats `dist/` as asset source;
  - no `assets-src/` → `generated/` asset pipeline;
  - no `assets:check`, `assets:build`, `preview`, `checkpoint`, `assets:fetch`, `release` commands;
  - no private-R2 source checkpoint;
  - no public-R2 runtime publishing;
  - no SFW/Full compile-time pruning;
  - many legacy node IDs are not semantic;
  - current runtime is plain JavaScript, not yet React/TypeScript/Vite.

**Decision**
- Do **not** migrate React/TypeScript/Vite this week.
- First make the existing runtime reproducible and cloud-capable.
- React migration is allowed later only if it materially improves maintainability or UI work.

---

## This Week — Milestone: Cloud-capable development pipeline

Complete in this order.

### W1 — Source asset boundary

**AI**
- Introduce `assets-src/` as the human/master asset source location.
- Introduce `generated/runtime-assets/` and `generated/source-cache/`.
- Refactor validators/build scripts so `dist/` is no longer the canonical source location.
- Preserve all logical asset IDs and current story references.
- Provide a safe migration path from current `dist/assets/` assets.

**Human**
- None unless a binary file is missing/corrupt locally.

**Acceptance**
- `rm -rf dist && npm run build` is safe.
- No irreplaceable asset exists only in `dist/`.

### W2 — Asset checking and runtime build

**AI**
- Add `npm run assets:check`.
- Add `npm run assets:build`.
- Validate filename, dimensions, aspect ratio and required source files.
- Convert image masters to runtime WebP where appropriate.
- Keep H.264 MP4 as the primary runtime video target; legacy WebM may remain temporarily for compatibility.
- Produce readable missing-asset errors.

**Human**
- Review only if an asset must be regenerated.

**Acceptance**
- Runtime assets can be regenerated from source assets.
- Missing/bad assets fail with a useful path and asset ID.

### W3 — Unified preview command

**AI**
- Add `npm run preview` / `npm run dev` using a lightweight static/dev server compatible with the existing runtime.
- Ensure it works locally and inside Codespaces.
- Document the expected forwarded port.

**Human**
- Open the preview and play the main flow.

**Acceptance**
- Local machine: one command starts preview.
- Codespace: same command produces a forwarded URL.

### W4 — Private R2 Cloud Checkpoint

**Human**
- Create or approve a Cloudflare R2 account/bucket if not already available.
- Create a private source bucket.
- Create least-privilege R2 credentials.
- Put credentials into local environment / GitHub Codespaces Secrets; never paste them into source files.

**AI**
- Add checkpoint metadata format.
- Add `npm run checkpoint`.
- Upload only referenced/accepted master assets to private R2.
- Record hashes/object keys and Git commit/content version.
- Verify cloud-complete invariants.

**Acceptance**
- A checkpoint is considered valid only when:
  - the GitHub commit exists; and
  - every referenced master asset exists in private R2.

### W5 — Remote restore

**AI**
- Add `npm run assets:fetch`.
- Restore required checkpoint assets into `generated/source-cache/` or another ignored cache.
- Verify a fresh Codespace can rebuild with no local Mac files.

**Human**
- None after R2 credentials are configured.

**Acceptance**
- Fresh Codespace:
  `git clone/pull → assets:fetch → build → preview`.

### W6 — Build profiles

**AI**
- Add build profile support.
- Implement at least `sfw` and `full` compile-time filtering.
- Ensure excluded content and assets do not ship in the SFW output.

**Human**
- Decide which content is explicitly SFW vs full when ambiguous.

**Acceptance**
- SFW build contains no excluded text/assets.

### W7 — Sites review

**AI**
- Build the migrated version.
- Publish a review build to ChatGPT Sites.
- Record the Git commit/checkpoint identifier used.

**Human**
- Play through:
  - title/start/continue;
  - Xu Tang main route;
  - OL branch;
  - branch history;
  - CG gallery;
  - cinematic;
  - mobile layout.

**Joint**
- Fix blocking or obvious regression issues.

**Acceptance**
- No major regression in core play loop.
- Review build is traceable to a known commit/checkpoint.

### W8 — Migration milestone

**AI**
- Run:
  - `npm run build`
  - `npm run validate`
  - `npm test`
  - `git diff --check`
- Update `PROJECT_STATE.md`.
- Commit and push one verified migration milestone to `main`.
- Tag/release note if useful.

**Human**
- Approve milestone after Sites review.

**Acceptance**
- From this point forward, use the canonical workflow:
  - Local Working;
  - Cloud Checkpoint;
  - Remote Working;
  - Sites Review;
  - Cloud Release.

---

## This Month — Content scaling test

Goal: prove that adding heroines is mostly content production.

### M1 — Character roster

Target total: 3–4 heroines.

**Human + AI**
- Decide character concepts, visual hooks, personality contrasts and route roles.

**AI**
- Create/normalize Character Bible for each heroine.
- Define stable character IDs and route/context structure.

**Human**
- Approve appearance/personality before large-scale generation.

### M2 — Identity references

**AI**
- Produce generation specs for each heroine:
  - identity sheet;
  - multi-angle reference;
  - core outfit;
  - hair/makeup versions;
  - invariants.

**Human**
- Generate/select final identity references in the chosen image service.

**AI**
- Register them in recipes/metadata and asset plan.

### M3 — Full art refresh

**AI**
- Produce Generation Queues for sprites, major CGs and key cinematic moments.
- Keep logical asset IDs stable where replacing existing art.
- Use versioned physical filenames and dependency versions.

**Human**
- Generate and select images/videos.

**AI**
- Ingest, validate, optimize and preview every accepted batch.

### M4 — Dialogue and route branches

**AI**
- Add each heroine's branch using existing story primitives.
- Add dialogue, choices, state changes, endings and context files.
- Prefer content-only changes.
- Use semantic node IDs for new content.

**Human**
- Playtest character voice, chemistry and pacing.

### M5 — Scale validation

**AI**
- Validate that adding heroine #3/#4 does not require engine changes.
- Improve context tooling / branch filtering only if scale actually causes friction.
- Measure initial-load/runtime asset size and optimize where necessary.

**Acceptance**
- 3–4 heroines coexist in one playable build.
- No route-specific engine hacks.
- New heroine workflow follows Character Bible → Generation Queue → assets → content → preview.

---

## Public SFW Friend Test

After the 3–4 heroine scale test passes:

### P1 — SFW release candidate

**AI**
- Produce SFW profile build.
- Verify content pruning.
- Publish runtime binaries to public R2/CDN if the production pipeline is ready.
- Deploy the static app to the selected public host.

**Human**
- Decide the public URL/audience.
- Send to friends.

### P2 — Friend-test checklist

Collect feedback on:

- whether the first 5 minutes are engaging;
- character appeal and differentiation;
- pacing;
- confusing choices;
- mobile usability;
- loading performance;
- save/resume reliability;
- broken media;
- whether players want to continue another route.

Do not optimize monetization or advanced engine features before this feedback.

---

## Responsibility Summary

| Task | AI | Human | Joint |
| --- | --- | --- | --- |
| Architecture/docs | ✓ | approve | |
| Asset/build scripts | ✓ | | |
| Codespace-compatible preview | ✓ | | |
| R2 bucket/account/credential approval | | ✓ | |
| R2 integration scripts | ✓ | | |
| Character concepts | draft | final judgment | ✓ |
| Image/video generation in third-party tools | prompt/spec | generate/select | |
| Story/dialogue/branch JSON | ✓ | creative feedback | ✓ |
| Sites publish | ✓ when capability is available | playtest | ✓ |
| Git verification/commit/push | ✓ | milestone approval | |
| Public friend-test release | ✓ | audience/approval | ✓ |

## Hard Gates

1. Do not delete/move irreplaceable binaries until a verified source copy exists.
2. Do not call a version cloud-complete without GitHub + private R2.
3. Do not release remotely if a required master asset exists only on the local Mac.
4. Do not add a new engine primitive merely to implement a character-specific scene.
5. Do not publish the public SFW friend-test until the Sites review passes.
