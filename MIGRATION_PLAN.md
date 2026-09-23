# MIGRATION_PLAN.md

> Updated: 2026-09-23
>
> This file records the migration from the original prototype to the current **Codespaces-only** canonical workflow. For exact next actions, use `TODO.md`. For architecture, use `ARCHITECTURE.zh-TW.md`.

## 1. Canonical direction

The old Hybrid Local / Cloud model is retired.

```text
GitHub
= code/content/history

Google Drive source-private
= accepted private masters

Google Drive runtime-public
= optimized remote runtime objects

GitHub Codespaces
= canonical development/build/test environment

Codespaces forwarded preview
= high-frequency human/AI review surface

Sites / Distribution Adapter
= stable review and release
```

Local clones are unsupported fallbacks, not acceptance or release inputs.

## 2. Migration history

### W1 — Source Asset Boundary ✅

Completed and CI verified.

- source shell moved to `public/`;
- preservation/source files separated from `dist/`;
- `generated/` introduced as disposable workspace;
- `dist/` became clean-build reproducible output;
- logical asset IDs remained stable;
- GitHub Actions Verify established.

CI reference: `35807627568`.

### W2 — Asset Check + Asset Build ✅

Completed and CI verified.

- ffprobe/ffmpeg full-decode validation;
- asset mapping/recipe/context checks;
- damaged legacy media identified;
- eight full masters recovered;
- Google Drive `source-private` and `runtime-public` established;
- `source-catalog.json` and `source-map.json` track canonical source/runtime metadata;
- `gdrive-public` runtime objects download anonymously and verify byte size/SHA-256/full decode;
- `dist/assets/` remains generated/ignored.

CI reference: `35812177697`.

Drive-first storage is W2 infrastructure. It is **not** W4.

## 3. W3 — Codespaces Development & Preview

### Implemented core

- Node 22 + ffmpeg/ffprobe devcontainer;
- fixed forwarded preview port 4173;
- dependency-free Node static server;
- `npm run dev`;
- `npm run preview`;
- `npm run preview:smoke`;
- MIME, SPA-style extensionless fallback, 404 handling, HEAD, byte Range/HTTP 206;
- dev watch/rebuild for source/content;
- CI preview-server smoke.

### AI-operated acceptance

Human-driven fresh-Codespace setup is retired as a W3 requirement.

`npm run codespace:accept` now:

```text
authenticated gh operator
→ create ephemeral fresh Codespace
→ SSH
→ clean asset/build/validate/test
→ start preview
→ private port-forward smoke
→ delete on success
```

`npm run codespace:review` runs the same engineering acceptance, then temporarily exposes 4173 and prints a URL for AI cloud-browser review. The reviewer should smoke title/start/continue, reload persistence, Xu Tang, OL branch, gallery/history, cinematic, ending/return-to-title, and narrow/mobile layout, then delete the Codespace.

A new forwarded origin does not inherit another origin's `localStorage`; same-origin reload persistence is the behavior to validate.

Optional workflow `Codespace Acceptance` can execute the fresh environment path from GitHub Actions after one-time configuration of repository secret `CODESPACES_TOKEN`. Built-in Actions `GITHUB_TOKEN` is not sufficient for Codespaces lifecycle.

Fresh engineering acceptance is now proven by run `35932727909`: ephemeral Codespace creation, clean asset/build/validate/test, preview readiness, private tunnel smoke, and automatic deletion all passed. The acceptance effort also repaired the first-kiss cinematic portability bug by rebuilding the 10-second MP4/WebM from canonical Drive keyframes (`6455239542e950ea54686b434a1a6c52a76e1feb`).

W3 is complete. Browser Acceptance run `35933586244` uses a clean runtime plus Playwright Chromium and verifies fresh start, continue, same-origin reload/localStorage, mute persistence, the OL branch through real choice UI, branches/gallery, the 10-second cinematic and gallery playback, ending/completion persistence, return-to-title, 320px layout, and blocking console/page errors.

`codespace:review` remains available only for subjective UX/visual review. It is no longer an engineering acceptance gate. Human participation is not required for environment lifecycle or deterministic browser correctness.

## 4. W4 — Player UI / Memories / CG Gallery

**Current implementation milestone.** W3 acceptance is complete.

Canonical feature spec:

`docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`

Key contracts:

- one large Start/Continue plus Memories and CG;
- no player-facing New Game/save-slot model;
- one-page vertical Memories timeline;
- Memory Event != engine node;
- replay cursor != deepest story frontier;
- heroine events use faded face-focused event CG backdrops;
- common events use scene/background art;
- CG gallery stays a collection wall.

Do not mix W4 implementation into W3 environment acceptance.

## 5. W5 — Cloud-complete Verification

`checkpoint`, if retained as a command name, means **verification/provenance**, not “sync before turning off the Mac.”

Cloud-complete means:

```text
GitHub commit
+
all required accepted masters represented in canonical storage
+
all required runtime objects resolvable from metadata/hashes
+
fresh Codespace clean build succeeds
```

## 6. W6 — SFW / Full Build Profiles

Add compile-time pruning of content and binaries, dangling-target protection, and leakage tests.

## 7. W7 — Review / Release

- stable Sites review bound to a known commit/profile;
- deterministic release command/workflow;
- production runtime-provider decision;
- smoke/release record.

Cloudflare R2 remains deferred until commercial/CDN/cache-control/custom-domain/traffic needs justify migration. Logical IDs must survive provider migration.

## 8. Later scale test

Only after W3–W7 foundations are reliable:

```text
Character Bible
→ Story / Route
→ Generation Queue
→ Asset Generation
→ Canonical Asset Ingest
→ Codespace Integration
→ Forwarded Preview
→ Verified Commit
```

Scale to 3–4 heroines and change engine architecture only when measured complexity requires it.

## 9. Hard gates

- never delete the only safe master/source;
- never make `dist/` source of truth;
- never commit secrets;
- never let a new accepted master exist only on one Mac/PC/Codespace;
- never hardcode a Codespaces forwarded URL;
- never treat a temporary public dev port as production hosting;
- never call an input cloud-complete without fresh Codespace rebuild proof;
- never add heroine-specific engine hacks when content/data can express the feature;
- SFW must prune at build time, not merely hide UI.
