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
- schema/content metadata.

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

## 11. Hybrid Local / Cloud Development Model

This section defines how development continues whether the user is at the local Mac or away from it.

### 11.1 System Responsibilities

#### GitHub

Canonical remote history for:

- code;
- content JSON;
- Character Bible;
- recipes;
- prompts;
- schemas;
- tests;
- tooling;
- metadata;
- this `ARCHITECTURE.md`.

GitHub is not the primary storage location for large CG/video binaries.

#### Local Git Working Copy

Primary high-frequency working environment while the user is at the computer.

Used with:

```text
Codex
local assets-src/
local preview
optional Sites review preview
```

#### GitHub Codespace

Remote working copy used when the local computer is unavailable.

A Codespace is disposable.

It is not the canonical code source.

Completed changes still need:

```bash
git commit
git push
```

#### ChatGPT Work

Remote operator for:

- Codespace;
- web interfaces;
- previews;
- related cloud tools.

Work itself is not permanent code storage.

#### Private R2 Source Store

Cloud storage for selected master assets that belong to a cloud checkpoint.

Examples:

- character identity sheets;
- approved CG masters;
- keyframes;
- source video;
- other selected binary masters.

This bucket is private.

#### Public R2 Runtime Store

Production delivery storage for optimized assets:

- WebP;
- poster images;
- optimized MP4;
- other runtime binaries.

These objects should use immutable/versioned/content-hashed paths.

#### ChatGPT Sites

Review / presentation / deployment surface.

Sites is not a source of truth.

A Sites build should be traceable to:

```text
Git commit
+ checkpoint/build identifier
```

---

## 12. Operating Modes

### Mode A — Local Working

Use when the user is at the local computer.

```text
Codex
+ local Git working copy
+ local assets-src/
+ local preview
```

Optional:

```text
ChatGPT Sites review preview
```

Rules:

- New images/videos can stay local while they are changing frequently.
- Do not upload every candidate generation.
- Local preview is the fastest iteration loop.
- Source assets can temporarily exist only locally during active work.

### Mode B — Cloud Checkpoint

Use before:

- shutting down the local machine;
- handing work to ChatGPT Work;
- treating the current version as a recoverable milestone;
- remote release.

Target command:

```bash
npm run checkpoint
```

The checkpoint should:

1. Validate code/content/assets.
2. Find newly selected or changed referenced master assets.
3. Upload them to private R2.
4. Record hashes/object keys.
5. Record the relevant Git commit/content version.
6. Push code/content/metadata to GitHub.
7. Verify that the version can be rebuilt without the local `assets-src/`.

A version is **cloud-complete** only when both exist:

```text
GitHub commit
+
all referenced master assets in private R2
```

Only a cloud-complete version guarantees that the Mac can remain off while the project is rebuilt, previewed, or released.

### Mode C — Remote Working

Use when the local Mac is unavailable.

```text
ChatGPT Work
    ↓
GitHub Codespace
    ↓
GitHub code/spec
+ private R2 checkpoint assets
```

Typical flow:

```bash
git pull
npm run assets:fetch
npm run content:validate
npm run dev
```

Then use the Codespaces forwarded HTTPS preview.

After changes:

```bash
npm run content:validate
npm run build
git commit
git push
```

Remote work can modify:

- dialogue;
- branches;
- routes;
- scene JSON;
- UI;
- engine code;
- compiler;
- validators;
- prompts;
- recipes;
- metadata.

If a change requires a brand-new CG/video that does not exist in private R2, AI should create a Generation Queue item and mark the asset missing.

Do not fake the missing asset or mutate the architecture merely to make the build pass.

### Mode D — Sites Review

Use after a batch of changes is reasonably stable.

Purpose:

- play inside ChatGPT;
- perform a more formal review;
- gather user feedback;
- validate a known build.

Sites review is not required after every small dialogue edit.

### Mode E — Cloud Release

A cloud-complete version may be released without the local Mac.

Release input:

```text
GitHub commit
+
private R2 checkpoint
```

Release pipeline:

```text
GitHub code/content
+ private R2 masters
        ↓
validation
        ↓
runtime optimization
        ↓
content-hashed/versioned runtime objects
        ↓
public R2
        ↓
production asset manifest
        ↓
production build
        ↓
Distribution Adapter
        ↓
Sites / Cloudflare Pages / another platform
```

If any required production master exists only on the powered-off local Mac, release must stop and request a checkpoint first.

---

## 13. Preview Model

There are three different preview surfaces.

### 13.1 Local Preview

Fastest inner loop while working locally.

### 13.2 Codespaces Forwarded Preview

Default remote-development preview.

Typical flow:

```bash
npm run dev
```

A forwarded HTTPS URL is then opened from ChatGPT Work / browser.

This is not the same thing as ChatGPT Sites Preview.

### 13.3 ChatGPT Sites Review Preview

Used for stage-level review and validation inside ChatGPT.

Treat this as a review/deployment adapter, not as canonical storage.
---

## 14. Asset Storage Model

There are four asset layers.

### 14.1 Local `assets-src/`

Purpose:

- active working master staging;
- rapid replacements;
- candidate iteration.

May contain assets that have not yet been checkpointed.

### 14.2 Private R2 Source Store

Purpose:

- recoverable cloud copy of selected master assets;
- remote rebuild input;
- release input.

This is the canonical cloud master asset backup for cloud-complete versions.

### 14.3 `generated/` / `source-cache/`

Purpose:

- temporary/cache/intermediate data.

Always disposable.

### 14.4 Public R2 Runtime Store

Purpose:

- runtime delivery.

Contains optimized production objects only.

### 14.5 Logical Asset IDs

Story JSON must reference logical IDs:

```text
cg.xu_tang.ch03.window_confession
```

It must not directly reference provider URLs:

```text
https://assets.example.com/.../window_confession.webp
```

Resolution is:

```text
logical asset ID
    ↓
compiler / manifest
    ↓
runtime URL
```

This allows storage/CDN providers to change without changing story content.

---

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

Local environment:

```text
.env
OS secret store
```

Remote environment:

```text
GitHub Codespaces Secrets
environment secrets
```

The repository may document secret names, never secret values.

Examples:

```text
CLOUDFLARE_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
```

Preview and release scripts must read credentials from the environment.

---

## 20. Target Tooling Interface

The long-term command surface should converge toward:

```bash
npm run content:validate
npm run assets:check
npm run assets:build
npm run preview
npm run checkpoint
npm run assets:fetch
npm run build
npm run release
```

Semantics:

`content:validate`
: Validate structured game content and story graph.

`assets:check`
: Validate required source assets, paths, dimensions, and formats.

`assets:build`
: Produce optimized runtime assets.

`preview`
: Start the fastest preview supported in the current environment.

`checkpoint`
: Convert the current accepted working state into a cloud-complete version.

`assets:fetch`
: Restore checkpoint assets into a fresh machine/Codespace cache.

`build`
: Produce the application build.

`release`
: Accept only cloud-complete inputs and produce/deploy a production build.

---

## 21. Current Prototype Migration Strategy

Do not rewrite the entire prototype.

Preserve working concepts already present:

- `content/characters` Character Bible structure;
- data-driven chapter/choice/branch model;
- Asset Recipes;
- logical asset IDs;
- versioned character design dependencies;
- asset impact planning;
- dangling target / reachability / missing asset validation;
- generic CG/cinematic render abstractions.

Priority migration work:

1. Stop treating `dist/` as source asset storage.
2. Establish `assets-src/ → generated/ → dist/`.
3. Add automatic WebP/image and video optimization.
4. Add Cloud Checkpoint.
5. Add private-R2 fetch/cache for remote rebuilds.
6. Replace hard-coded single-chapter loading with discovery.
7. Migrate temporary node IDs to stable semantic IDs.
8. Add versioned save schema/migrations.
9. Add SFW/Full compile-time pruning.
10. Add preview adapters:
   - local;
   - Codespaces forwarded URL;
   - Sites review.
11. Add cloud release pipeline:
   - private R2 masters;
   - optimized public R2 runtime;
   - production manifest;
   - Distribution Adapter.

Do not rewrite the renderer merely to support a second character.

---

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

R2 itself is not a non-goal anymore because the Hybrid Cloud Checkpoint architecture uses it for source checkpoints and runtime distribution.

---

## 23. Version Concepts

Always distinguish:

### Working Latest

The newest local working state.

May contain:

- unpushed code;
- local-only assets;
- experiments.

Not guaranteed recoverable.

### Cloud Latest

Newest cloud-complete version:

```text
GitHub commit
+
private R2 checkpoint
```

Can be rebuilt without the local Mac.

### Release Latest

Newest officially deployed production manifest/build.

---

## 24. New Conversation / New AI Handoff Protocol

Before changing the project, a new ChatGPT / Claude / Gemini / Codex session must:

1. Read `ARCHITECTURE.md`.
2. Inspect the current repository instead of assuming the code already matches the target architecture.
3. Determine the current operating mode:
   - Local Working;
   - Cloud Checkpoint;
   - Remote Working;
   - Sites Review;
   - Release.
4. Confirm the current Git branch and commit.
5. Confirm the latest cloud-complete checkpoint if one exists.
6. Determine whether required master assets exist only locally.
7. Determine whether the requested task requires new binary assets.
8. Choose the correct preview surface.
9. Preserve the working prototype and migrate incrementally.
10. Avoid inventing a parallel architecture when the repo has not yet fully reached this specification.

When the user is remote, do not assume local `assets-src/` is accessible.

Use:

```text
GitHub
+
private R2 checkpoint
```

as the available reconstructible source.

For a normal content task, the first useful question is not “which framework should we use?”

It is:

> Which character, route, scene, or pipeline capability are we changing?

---

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

When adding a feature, ask:

```text
Is this Content?
Is this Compiler?
Is this Player?
Is this Asset Pipeline?
Is this Preview?
Is this Distribution?
```

If the answer is unclear, do not code yet.

When adding a new route:

```text
prefer content-only changes
```

When adding a new character:

```text
Character Bible
→ Story / Route
→ Generation Queue
→ Human Asset Generation
→ AI Integration
→ Playtest
→ Checkpoint / Release
```

When the Mac will be shut down:

```text
checkpoint first
```

When working remotely:

```text
GitHub + private R2
→ Codespace
→ forwarded preview
```

When reviewing a stable build:

```text
Sites review preview
```

When releasing:

```text
cloud-complete inputs only
```

---

## 27. Final Architecture Summary

The project should converge toward:

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
Human Third-Party Asset Generation
        ↓
Content + Asset Validation
        ↓
Content Compiler
        ↓
Verified Manifest
        ↓
React / TypeScript Web Player
        ↓
Local / Codespaces / Sites Preview
        ↓
Cloud Checkpoint
        ↓
GitHub + Private R2
        ↓
Public Runtime R2
        ↓
Distribution Adapter
        ↓
Production
```

The long-term value is not the renderer.

The valuable system is the repeatable pipeline that turns:

```text
character idea
→ structured story
→ consistent assets
→ validated build
→ playable episode
```

with as little manual engineering overhead as possible.