# ARCHITECTURE.md

> English mirror of the canonical architecture and development workflow.
>
> **Canonical language:** `ARCHITECTURE.zh-TW.md`. If the English and Traditional Chinese versions conflict, the Traditional Chinese version wins.
>
> This file is the authoritative project specification. Historical Google Docs, chat transcripts, prototypes, and generated notes are reference material only. If they conflict with this file, follow this file unless the user explicitly approves an architecture change.

---

## 1. Project Goal

Build a reusable, web-first interactive visual novel / romance game platform optimized for a solo developer working with AI.

The product is not a one-off game. The long-term system is:

```text
Human + AI Authoring
        ↓
Structured Content
        ↓
Content Compiler
        ↓
Verified Manifest + Runtime Assets
        ↓
Web Player
        ↓
Preview / Distribution Adapters
        ↓
Sites / Pages / Other Platforms
```

The MVP is successful when one complete 10–15 minute route can be authored, generated, validated, played, revised, and released with low friction.

Do not expand the engine merely because a feature is technically interesting. New framework work must be justified by a real content requirement that the existing architecture cannot express.

---

## 2. Core Principles

### 2.1 Web First

- Primary device: mobile portrait, 9:16.
- Desktop: centered adaptive 9:16 viewport.
- Static hosting first.
- No permanent backend until a real requirement appears.
- The game must run independently in the browser; AI is an authoring/development tool, not a runtime dependency.

### 2.2 Content and Player Are Separate

The Player must not know:

- which AI authored the content;
- which character a route belongs to;
- where source assets were generated;
- which distribution platform is used.

The Player only understands:

- compiled story/state data;
- logical asset IDs;
- runtime asset manifest;
- generic visual primitives;
- audio commands;
- save data.

### 2.3 Disposable Build Outputs

The following must always be safe:

```bash
rm -rf dist
rm -rf generated
npm run build
```

No irreplaceable human or AI-generated source asset may exist only in `dist/` or another generated directory.

### 2.4 Browser Assets Are Extractable

Do not treat client-side encryption as DRM.

Content hashes are useful for:

- immutable URLs;
- cache busting;
- avoiding semantic filenames;
- integrity/version tracking.

They are not a security boundary.

---

## 3. Canonical Repository Shape

Target structure:

```text
game/
├── ARCHITECTURE.md
├── ARCHITECTURE.zh-TW.md
├── README.md
├── package.json
│
├── src/
│   ├── engine/
│   ├── components/
│   ├── services/
│   └── adapters/
│
├── content/
│   ├── characters/
│   ├── routes/
│   ├── chapters/
│   ├── shared/
│   ├── recipes/
│   └── schemas/
│
├── assets-src/
│   ├── characters/
│   ├── backgrounds/
│   ├── cg/
│   ├── video/
│   └── audio/
│
├── scripts/
│   ├── content-compile.*
│   ├── story-validate.*
│   ├── asset-check.*
│   ├── asset-build.*
│   ├── checkpoint.*
│   ├── asset-fetch.*
│   └── release.*
│
├── generated/
│   ├── runtime-assets/
│   ├── source-cache/
│   └── game.manifest.json
│
├── public/
└── dist/
```

### Directory Rules

`src/`
: Runtime player and generic engine code.

`content/`
: Structured source-of-truth for characters, routes, scenes, recipes, schemas, dialogue, branching, and metadata.

`assets-src/`
: Local high-frequency staging area for selected master images/video/audio while actively developing on the local machine.

`generated/`
: Disposable compiler/cache output. Must be reproducible.

`dist/`
: Disposable production build output. Never manually store irreplaceable source files here.

---

## 4. Story and Content Model

### 4.1 Stable Semantic IDs

Every saveable or jumpable story node must have a stable semantic ID.

Good:

```text
xu_ch01_elevator_intro_01
xu_ch01_noodle_choice
xu_ch02_rooftop_confession
```

Bad:

```text
intro1
choice2
node37
c1a
```

Array positions and temporary indexes must never be permanent save identifiers.

### 4.2 Content Schema

The content model must support at least:

- character profile;
- outfit / hairstyle / makeup versions;
- route;
- chapter;
- scene;
- node;
- dialogue;
- narration;
- choices;
- conditions;
- actions;
- flags;
- numeric variables;
- affection;
- background;
- character layers;
- CG;
- scene video;
- BGM;
- SFX;
- schema/content metadata;
- Memory Section / Memory Event (player-facing narrative units that are not one-to-one with engine nodes).

### 4.3 Story Engine State

The runtime store should own only generic state such as:

```text
currentNodeId
variables
flags
characterState
affection
choiceHistory
dialogueQueue
settings
```

The store must not depend on React components, DOM structure, or source asset file formats.

---

## 5. Content Compiler

The Content Compiler is the required boundary between authoring and runtime.

It must perform:

- JSON/schema validation;
- stable ID uniqueness checks;
- `goto` / choice target validation;
- reachability checks;
- orphan node checks;
- illegal/dead terminal checks;
- condition/action validation;
- asset reference validation;
- build-profile filtering;
- runtime asset mapping;
- manifest generation;
- readable build errors.

It must fail loudly when required content is inconsistent.

### 5.1 Build Profiles

At minimum:

```text
sfw
full
```

Possible future profiles:

```text
demo
press
platform-specific
```

Excluded content must be removed at compile/build time, not merely hidden with runtime UI checks.

Do not scatter code such as:

```ts
if (mode === "sfw") { ... }
```

throughout React components.

---

## 6. Player and Rendering

### 6.1 MVP Stack

Use:

- React;
- TypeScript;
- Vite;
- CSS / Tailwind CSS;
- normal DOM media elements.

Do not use Unity, Godot, or PixiJS for the MVP.

### 6.2 Stage Boundary

`StageViewport` owns:

- background;
- character layers;
- CG;
- scene video;
- generic visual modifiers.

`DialogueOverlay` owns:

- speaker;
- dialogue;
- narration;
- choices;
- backlog;
- auto;
- skip;
- settings.

`AudioService` owns:

- BGM lifecycle;
- SFX;
- mute;
- volume;
- scene transitions.

### 6.3 Visual Primitives

The MVP should standardize around four primitives:

```text
background
characterLayer
cg
sceneVideo
```

Effects such as:

```text
fade
shake
slide
zoom
```

should be composable modifiers rather than custom rendering paths for individual scenes.

### 6.4 When to Consider PixiJS

Only consider PixiJS / WebGL after all of the following are true:

1. A real playable product exists.
2. DOM/CSS is a measured bottleneck or limitation.
3. A validated content requirement needs shaders, particles, skeletal animation, or many simultaneous sprites.

Renderer replacement must not require rewriting the story schema.

---

## 7. Visual Asset Pipeline

### 7.1 Images

Master source may be PNG/JPEG.

Runtime target:

```text
WebP
```

Pipeline:

```text
master source
    ↓
asset validation
    ↓
automatic conversion
    ↓
generated/runtime-assets/*.webp
    ↓
manifest
```

AVIF is optional and should only be added after measurement proves it useful.

### 7.2 Video

Do not make transparent-character video compositing the default architecture.

Normal dialogue:

```text
static background
+ static character art
```

Key emotional / cinematic moments:

```text
scene-based full-frame short video
```

Recommended runtime video:

- 9:16;
- 720×1280 by default;
- H.264 MP4;
- approximately 2–4 seconds for loops;
- silent by default;
- poster/static fallback;
- `playsinline`;
- `muted`;
- `loop`;
- `autoplay` where appropriate.

BGM belongs in `AudioService`, not inside scene video.

### 7.3 Composition Contract

Every generated visual must respect the game UI.

Each asset recipe should be able to specify:

- aspect ratio;
- width / height;
- focal point;
- object position;
- dialogue safe zone;
- crop tolerance;
- important face/hand/object region.

The goal is route-wide consistency, not isolated image beauty.

---

## 8. Character Bible and Asset Recipes

Each major character should have a canonical Character Bible describing:

- physical identity;
- face characteristics;
- hair;
- body proportions;
- signature clothing;
- personality;
- speech style;
- emotional tells;
- behavioral constraints;
- relationship dynamics;
- route arc;
- outfit versions;
- hairstyle versions;
- makeup versions;
- identity/reference images;
- generation metadata.

Reference identity images are the canonical identity anchor.

Do not recursively use the previous CG as the only identity reference for the next CG; that causes generational drift.

### 8.1 Asset Recipe Contract

Every asset that requires manual third-party generation must have a complete recipe before handoff.

Minimum fields:

```text
assetId
type
character
designVersion
outfitVersion
hairstyleVersion
makeupVersion
referenceInputs
prompt
negativeConstraints
camera
headPose
action
lighting
aspectRatio
width
height
safeZone
focalPoint
objectPosition
sourcePath
runtimeId
runtimeFormat
```

Example:

```yaml
assetId: cg.xu_tang.ch03.window_confession
sourcePath: assets-src/cg/xu_tang/ch03/window_confession.png
aspectRatio: 9:16
width: 1080
height: 1920
runtimeId: cg.xu_tang.ch03.window_confession
runtimeFormat: webp
```

The human operator should only need to generate the asset, choose the preferred result, and save it at the requested location.

---

## 9. Human / AI Responsibility Split

The operating model is:

```text
Human Creative Director
+
AI Production Engineer
```

### 9.1 Human Responsibilities

The user decides:

- which character / route / scene to build;
- character concept;
- appearance;
- personality;
- chemistry;
- route direction;
- visual taste;
- pacing judgment;
- whether a CG/video is acceptable;
- whether a build is ready to release.

The user also performs currently manual third-party generation:

- upload character reference;
- paste prompt;
- generate candidates;
- choose the best result;
- save it to the requested path.

### 9.2 AI Responsibilities

AI owns:

- Character Bible updates;
- route design;
- scene design;
- dialogue;
- branching;
- JSON/content editing;
- stable IDs;
- asset planning;
- generation prompts;
- expected filenames/paths;
- validation;
- story graph testing;
- asset checking;
- asset conversion;
- build;
- preview preparation;
- bug fixing;
- iteration;
- Git commits/pushes when operating in an authorized environment;
- release pipeline execution.

The intended handoff is:

> “The assets are ready.”

After that point, AI should be able to perform the remaining integration work.

---

## 10. Standard Content Production Workflow

### Step 1 — Decide What to Build

Examples:

- new character;
- new route;
- new chapter;
- new scene;
- new branch.

Human and AI define:

- character hook;
- backstory;
- appearance;
- personality;
- relationship dynamic;
- route arc;
- outfits;
- key scenes;
- visual motifs;
- required identity/reference images.

### Step 2 — AI Builds Story + Asset Plan

AI updates:

- Character Bible;
- content JSON;
- route/chapter/scene data;
- stable semantic node IDs;
- dialogue;
- choices;
- conditions;
- state changes;
- endings;
- Asset Recipes.

AI also creates a Generation Queue.

Every queue item should answer:

```text
What must be generated?
Which character reference should be used?
Which prompt should be pasted?
What dimensions/aspect ratio are required?
Where must the selected output be saved?
```

### Step 3 — Human Generates Assets

The user:

1. Opens the chosen generation service.
2. Uploads the specified identity/reference image.
3. Uses the provided prompt/settings.
4. Generates candidates.
5. Chooses the preferred result.
6. Saves the final asset to the specified `assets-src/` path.

During high-frequency local iteration, not every candidate needs to be uploaded to cloud storage.

### Step 4 — AI Integrates and Validates

Target pipeline:

```text
assets-src
    ↓
asset check
    ↓
size / aspect / filename validation
    ↓
image / video optimization
    ↓
generated runtime assets
    ↓
content compile
    ↓
story graph tests
    ↓
build
    ↓
preview
```

Missing-asset errors must state:

- logical asset ID;
- corresponding scene/recipe;
- expected source path;
- expected size/aspect ratio;
- whether the missing asset blocks the build.

### Step 5 — Human Playtest

The user gives natural-language feedback such as:

- “This line does not sound like her.”
- “The relationship progresses too fast here.”
- “This choice is meaningless.”
- “Replace this CG.”
- “This button is covered on mobile.”
- “This scene does not advance.”

AI must fix the correct layer:

```text
Content
Asset
Compiler
Player
```

Do not hide architecture defects behind one-off hardcoded fixes.

### Step 6 — Version / Release

After acceptance:

- run validation;
- run build;
- run smoke tests;
- commit;
- push;
- ensure a cloud-complete checkpoint exists if remote release is required;
- deploy via a Distribution Adapter.

---


## 11. Codespaces-only Development Model

The canonical development environment is **GitHub Codespaces**. The project no longer maintains equivalent Local Working and Remote Working paths.

### 11.1 System Responsibilities

#### GitHub

Canonical history/source for code, structured content, tooling, devcontainer configuration, asset metadata, and Git history.

#### GitHub Codespaces

The only supported development/build/test working environment.

A Codespace must be able to complete:

```text
edit
→ validate
→ build
→ preview
→ test
→ commit / push
```

from a GitHub checkout plus remotely resolvable runtime asset metadata. A Codespace is disposable; accepted masters must never exist only on its filesystem.

#### Google Drive `source-private/`

Current pre-commercial canonical master vault: Restricted, with file ID/hash/dimensions/provenance recorded in the catalog.

#### Google Drive `runtime-public/`

Current remote-build runtime store: optimized objects only, accessible by URL/file ID and verified by byte size/SHA-256/full decode. It contains no secrets.

#### ChatGPT Work / other AI operators

Operate GitHub, the Codespace, and review surfaces. They are not separate working copies and must not assume Mac-only sources exist.

From W3 onward, an AI operator should manage Codespace lifecycle itself instead of delegating create/rebuild to the Human:

```text
npm run codespace:accept
```

for private ephemeral engineering acceptance, and:

```text
npm run codespace:review
```

when a cloud browser needs a temporary public 4173 review URL. These commands require the execution environment's `gh` authentication to have Codespaces lifecycle permissions. A Human may perform one-time authorization, but lifecycle is not a per-change Human responsibility.

#### ChatGPT Sites / Distribution Adapter

Stable review/release surfaces; they do not replace the Codespaces inner loop.

### 11.2 Role of the Local Machine

A local machine is no longer the canonical dev environment.

When at a computer, the user may use browser Codespaces or Desktop VS Code connected to the same Codespace.

A local clone may exist as an emergency/advanced fallback, but it is not an acceptance target, need not match the dev environment, must not contain the only accepted source, and is never release provenance.

### 11.3 Reproducible Codespace

The repository provides `.devcontainer/` with:

- Node major aligned with CI;
- ffmpeg/ffprobe installed;
- an SSH server for AI lifecycle operations through `gh codespace ssh`;
- a fixed forwarded preview port;
- no project-specific system dependency requiring manual installation.

W3 currently pins Node 22 and port 4173.

---

## 12. Operating Modes

### Mode A — Codespace Working

The single canonical daily development mode:

```text
GitHub
→ Codespace
→ npm run dev
→ forwarded preview
→ edit / playtest
→ verify
→ commit / push
```

### Mode B — AI-operated Ephemeral Acceptance

After a coherent change is pushed, the AI operator should verify a fresh environment itself:

```text
npm run codespace:accept
→ create fresh Codespace
→ SSH clean restore/build/test
→ start preview
→ private forwarded-port smoke
→ delete on success
```

For browser UI review:

```text
npm run codespace:review
→ same engineering acceptance
→ temporary public 4173
→ AI cloud browser
→ delete after review
```

### Mode C — Verified Milestone

For stable review/release, verify an explicit commit as cloud-complete:

```text
GitHub commit
+
accepted master catalog/storage
+
runtime object metadata/hashes
+
fresh clean-build proof
```

This is not a “before shutting down the Mac” sync step.

### Mode D — Sites Review

```text
verified commit
→ review build
→ Sites
→ Human playtest
```

### Mode E — Release

```text
verified commit
→ production build/profile
→ runtime distribution provider
→ Distribution Adapter
→ smoke test
→ release record
```

---

## 13. Preview Model

### 13.1 Codespaces Forwarded Preview

Default high-frequency development preview:

```bash
npm run dev
```

It binds `0.0.0.0`, serves fixed port `4173`, and rebuilds after source/content changes.

Production-like acceptance:

```bash
npm run preview
```

This performs a clean build and serves the same `dist/` contract on port 4173 without a watch loop.

Forwarded ports stay private by default. Make a port public only temporarily when a reviewer without the Codespace owner's GitHub authentication needs direct access; restore privacy/stop the service after review.

The forwarded URL is temporary: never hardcode it or treat it as production hosting.

### 13.2 AI-operated Codespace Acceptance

Engineering acceptance:

```bash
npm run codespace:accept
```

An authenticated GitHub CLI operator creates a fresh disposable Codespace, SSHs in for clean asset/build/validate/test, verifies 4173 through a private tunnel, and deletes the Codespace on success.

UI review:

```bash
npm run codespace:review
```

Only after engineering acceptance does it temporarily expose 4173 and print a URL for Work/cloud-browser review. Delete the Codespace after review.

### 13.3 Preview Smoke

CI runs:

```bash
npm run preview:smoke -- --skip-build
```

to verify HTML/CSS/JS/route JSON, extensionless fallback, missing-asset 404 behavior, and MP4 Range/HTTP 206 support when video exists.

### 13.4 ChatGPT Sites Review Preview

Sites is a stable milestone review surface for full/mobile playtesting against a known commit/build, not the high-frequency dev server.

---

## 14. Asset Storage Model

### 14.1 Git-backed `assets-src/`

Existing legacy/preservation sources and small sources appropriate for Git may remain here. Because they are Git-backed, they do not depend on one Mac.

Do not delete a unique source merely to make storage look uniform.

### 14.2 Google Drive `source-private/`

Default canonical vault for new accepted masters:

```text
Restricted
canonical master
not shipped directly to browser
```

Accepted masters must not live only on a local computer, ephemeral Codespace disk, or generation-tool staging.

### 14.3 `generated/` / `source-cache/`

Disposable cache/output only.

### 14.4 Google Drive `runtime-public/`

Optimized runtime store for remote builds. `content/assets/source-map.json` records provider/file ID/URL/bytes/SHA-256; CI/Codespace revalidates downloaded bytes/full decode before creating `generated/runtime-assets/` and `dist/assets/`.

### 14.5 Provider Abstraction

Story/content depends only on logical asset IDs.

```text
Git-backed source / Google Drive
→ future R2/CDN
```

Changing provider or physical filename must not require story JSON changes.

## 15. Save System

MVP save storage may use `localStorage`.

It is convenience storage, not a permanent guarantee.

Minimum save payload:

```json
{
  "schemaVersion": 1,
  "gameVersion": "0.1.0",
  "contentVersion": "0.1.0",
  "currentNodeId": "xu_ch01_elevator_intro_01",
  "variables": {},
  "flags": {},
  "affection": {},
  "choiceHistory": []
}
```

### Save Rules

- `currentNodeId` must be a stable semantic ID.
- Save schema changes require an explicit migration path.
- Removed node IDs require a migration/fallback rule.
- Future save codes should use compression before Base64URL encoding.
- Base64 is not compression and not security.

Cloud save/account/OAuth is deferred until actual user demand exists.

### 15.1 Replay Cursor and Story Frontier

Once the player can replay earlier content from Memories, the currently played node and the deepest historical story progress must be separate concepts.

- `cursorSnapshot`: the snapshot currently being played; replay may move it to earlier content.
- `frontierSnapshot`: the deepest formal story progress reached so far; replaying old content must not regress it.
- Continue and the title backdrop resolve from the frontier, not from the most recent replay cursor.
- A replay only advances the frontier after it reaches a genuinely deeper Memory Event with a higher content-defined progression rank.
- Progression rank belongs to player-facing Memory Event metadata; do not infer it from recency or raw node count.
- Save migrations must preserve existing CG unlocks, ending unlocks, checkpoints, and recoverable progress.

The player-facing Memories UI renders Memory Events rather than the raw engine graph. Detailed behavior and the W4 data contract are in `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`.

---

## 16. Responsive UI

### Mobile

Use:

- `100dvh`;
- `env(safe-area-inset-top)`;
- `env(safe-area-inset-bottom)`;
- touch-friendly controls;
- safe dialogue/choice placement.

`object-fit: cover` is acceptable only if asset composition rules protect important content.

### Desktop

Prefer height-constrained 9:16 layout.

Conceptually:

```css
height: 100dvh;
max-height: 100dvh;
aspect-ratio: 9 / 16;
width: auto;
max-width: 100vw;
```

Do not rely only on a fixed `max-width` because it can create excessive height on short laptop screens.

### 16.1 Player-facing Memories

The player Memories experience is a single vertically scrolling timeline:

- do not expose a giant free-pan/free-zoom story DAG;
- do not require a Memories Overview → Route Detail secondary navigation layer;
- Story Nodes are runtime primitives, while Memory Events are player-facing narrative primitives;
- small meaningful branches may render inline, while large fan-outs are compressed into clusters;
- unexplored subtrees stay hidden to avoid spoilers and horizontal explosion;
- single-heroine Memory Events may reuse their event CG as a faded face-focused backdrop, while common events use scene/background art;
- prefer lazy-loaded `<img>` layers with focus metadata over eagerly loaded CSS background images;
- mobile must not produce page-level horizontal scrolling.

See `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md` for the detailed feature and acceptance specification.

---

## 17. Audio

Prototype:

- `AudioService` may initially be a stub.

First external playable MVP should include at least:

- one normal BGM;
- one emotional/alternate BGM;
- one basic UI/choice SFX.

Do not add:

- voice acting;
- advanced mixing;
- complex Web Audio scheduling

until real content requirements justify them.

---

## 18. Validation and Release Gates

### Automated Story / Content Checks

At minimum:

- schema validation;
- duplicate IDs;
- dangling targets;
- unreachable/orphan nodes;
- invalid terminal states;
- missing assets;
- build-profile leakage;
- manifest completeness;
- save migration fixtures.

### Device QA

Before public release:

- iPhone Safari;
- Android Chrome;
- desktop Chrome;
- desktop Safari;
- changing viewport height;
- autoplay;
- video loop;
- poster fallback;
- reload/back behavior;
- long dialogue;
- multiple-choice layouts;
- slow network transitions.

### Content QA

Every route should be checked for:

- character consistency;
- visual consistency;
- meaningful branching;
- pacing;
- CG/video placement;
- UI obstruction of faces/hands/important objects.

---


## 19. Secrets

Never commit secrets.

The canonical development environment uses:

```text
GitHub Codespaces Secrets
environment secrets
```

The repository may document secret names, never secret values.

The current Drive-first runtime build needs no private Google credential; `runtime-public` must be anonymously resolvable by CI/Codespace through recorded metadata.

Future R2 migration may add:

```text
CLOUDFLARE_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
```

Preview/release scripts read credentials only from environment state.

---

## 20. Target Tooling Interface

Currently implemented command surface:

```bash
npm run validate
npm run assets:check
npm run assets:build
npm run build
npm run dev
npm run preview
npm run preview:smoke
npm run codespace:accept
npm run codespace:review
npm run context -- --route <route-id> --node <node-id>
```

`validate`
: Current structured-content/story/asset contract validation.

`assets:check`
: Validate source/runtime media, mappings, hashes/metadata, and full decode.

`assets:build`
: Build `generated/runtime-assets/` from Git-backed sources or remote runtime providers.

`build`
: Clean rebuild `dist/`.

`dev`
: Canonical Codespaces inner loop; build, serve port 4173, and rebuild on source/content changes.

`preview`
: Production-like clean build followed by static serving on port 4173.

`preview:smoke`
: CI contract test for the preview server.

`codespace:accept`
: Create a one-off fresh Codespace from an authenticated AI/`gh` operator, run clean restore/build/test plus private-tunnel smoke, and delete it on success.

`codespace:review`
: Optional subjective review surface: run the same engineering acceptance, then temporarily expose 4173 and print a browser-review URL. Deterministic browser correctness is covered by the GitHub Actions `Browser Acceptance` workflow with Playwright Chromium.

Future additions:

```bash
npm run checkpoint
npm run release
```

`checkpoint`
: W5 cloud-complete verification/provenance, not local-to-cloud synchronization.

`release`
: Build/deploy production from cloud-complete verified input only.

A separate `assets:fetch` command is not a W3 blocker; current `assets:build` already retrieves `gdrive-public` runtime objects.

---

## 21. Current Prototype Migration Strategy

Do not rewrite the working prototype wholesale.

Completed/current:

1. **W1 Source Asset Boundary** — established `public/`, `assets-src/`, `generated/`, and disposable `dist/`.
2. **W2 Asset Check + Asset Build** — full-decode validation, Drive master/runtime storage, remote hash verification.
3. **W3 complete** — Node 22 + ffmpeg + SSH devcontainer, port 4173 forwarded preview, `dev/preview/preview:smoke`, and AI-operated `codespace:accept/review` lifecycle tooling are complete. Run `35932727909` proved fresh Codespace create → SSH → clean asset/build/validate/test → preview readiness → private tunnel smoke → automatic deletion. Browser Acceptance run `35933586244` proved reload/localStorage, OL branch, branches/gallery, cinematic behavior, ending persistence, 320px layout, and blocking browser-error behavior in Chromium. `codespace:review` remains optional for subjective UX review, not as an engineering gate.

Next:

4. **W4 Player UI / Memories / CG Gallery** from `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`.
5. **W5 Cloud-complete verification** for commit + canonical assets + clean-build provenance.
6. **W6 SFW / Full profiles** with compile-time pruning/leakage tests.
7. **W7 Review / Release pipeline** with Sites review and deterministic release.
8. Then 3–4 heroine scale testing and only the semantic-ID/refactor work proven necessary.

React/TypeScript/Vite is not a W3 prerequisite.

## 22. MVP Non-Goals

Do not add these unless a validated requirement appears:

- Unity;
- Godot;
- PixiJS as primary renderer;
- transparent alpha video composition pipeline;
- WebM/HEVC multi-format matrix;
- full AVIF migration;
- voice acting;
- advanced Web Audio mixing;
- OAuth;
- cloud save;
- analytics platform without a defined question;
- general backend;
- client-side AES DRM;
- speculative scaling architecture.

Cloudflare R2 migration is currently deferred. Drive-first supports development, Sites review, and small-scale friend testing; migrate when commercialization or CDN/cache-control/custom-domain/traffic requirements justify it.

---


## 23. Version Concepts

Always distinguish three states.

### Working Latest

The current Codespace working tree, which may contain uncommitted or experimental changes. It is not release provenance.

### Verified Latest

The latest cloud-complete verified commit:

```text
GitHub commit
+
required accepted masters safely represented in canonical storage
+
required runtime objects resolvable from metadata/hashes
+
fresh Codespace clean-build proof
```

### Release Latest

The latest production manifest/build, traceable to an explicit Verified Latest commit/profile.

---

## 24. New Conversation / New AI Handoff Protocol

Before editing, every new ChatGPT / Claude / Gemini / Codex session must:

1. Read `PROJECT_STATE.md`.
2. Read `TODO.md`.
3. Read `ARCHITECTURE.zh-TW.md`; use the English mirror when needed.
4. Read `IMPLEMENTATION.md`.
5. For Player UI / Memories / CG / replay/frontier work, read `docs/W4_PLAYER_UI_MEMORIES_GALLERY_SPEC.md`.
6. Inspect current Git branch/commit/status; do not treat earlier chat as current repository state.
7. For node-specific work, run `npm run context -- --route <route-id> --node <node-id>`.
8. Determine whether the task needs a new binary master; accepted masters must enter canonical storage.
9. Develop/test in Codespaces; do not invent a second Local-vs-Remote workflow.
10. When fresh-environment acceptance is needed and the AI environment has authenticated `gh`, run `npm run codespace:accept`; use `npm run codespace:review` for browser review. Do not first hand create/rebuild back to the Human.
11. If GitHub authentication/authorization is the only blocker, Human involvement is one-time authorization only; subsequent lifecycle returns to AI.
12. Preserve the working prototype and migrate incrementally.

Rebuildable project source is:

```text
GitHub
+
Google Drive canonical asset metadata/storage
```

For normal content work, the first useful question is not “which framework?” but “which character, route, scene, or pipeline capability changes?”

## 25. Architecture Change Policy

This document is canonical.

Architecture changes should happen only when:

1. a new requirement is concrete;
2. the current architecture cannot express it cleanly;
3. the impact on Content / Compiler / Player / Storage / Preview / Distribution is understood;
4. the user explicitly accepts the change.

After approval:

1. update `ARCHITECTURE.md`;
2. then update code/tooling;
3. then migrate existing content incrementally.

Do not let implementation drift silently redefine the architecture.

---


## 26. Quick Decision Rules

Before adding a feature, classify it:

```text
Content?
Compiler?
Player?
Asset Pipeline?
Preview?
Distribution?
```

Daily development:

```text
GitHub
→ Codespace
→ npm run dev
→ forwarded preview
→ verify
→ commit / push
```

New character:

```text
Character Bible
→ Story / Route
→ Generation Queue
→ Asset Generation
→ Canonical Asset Ingest
→ Codespace Integration
→ Playtest
→ Verified Commit
```

Fresh-environment acceptance:

```text
npm run codespace:accept
→ ephemeral Codespace
→ private tunnel smoke
→ auto delete
```

Direct AI/external review of a forwarded preview:

```text
npm run codespace:review
→ engineering acceptance first
→ 4173 temporarily public
→ AI browser review
→ delete Codespace
```

Stable review:

```text
Verified commit
→ Sites review preview
```

Release:

```text
cloud-complete verified inputs only
```

---

## 27. Final Architecture Summary

```text
Human Creative Direction
        +
AI Content / Engineering
        ↓
Character Bible
        ↓
Story / Route / Scene Specs
        ↓
Asset Recipes + Generation Queue
        ↓
Asset Generation
        ↓
Canonical Master Storage
        ↓
Content + Asset Validation
        ↓
Content Compiler
        ↓
Verified Manifest
        ↓
Web Player
        ↓
GitHub Codespace
        ↓
Forwarded Preview
        ↓
Verified Git Commit + Google Drive Assets
        ↓
Sites Review / Distribution Adapter
        ↓
Production
```

The durable value is not the renderer. The reusable pipeline to optimize is:

```text
character idea
→ structured story
→ consistent assets
→ validated build
→ playable episode
```

while minimizing manual effort for each new character, route, and scene.
