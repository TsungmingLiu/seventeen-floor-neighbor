# assets-src

This directory is the source-side boundary for binary assets.

## W1 migration state

The files added here during W1 are **byte-identical Git blob copies** of the pre-migration `dist/assets/` files. This avoids re-uploading or re-encoding binaries and therefore avoids the truncation problem previously seen with binary writes.

Important: an initial W1 copy is not automatically the original high-quality generation master. Some files are already runtime derivatives (for example WebP sprites or compressed video). The goal of W1 is first to ensure that no irreplaceable file exists only under disposable `dist/`.

The mapping from runtime path to source path lives in:

`content/assets/source-map.json`

Existing source references such as `content/references/` and `content/cinematics/` remain valid source material and are not deleted by this migration.

## Categories

- `backgrounds/` — background images
- `characters/` — sprite/character runtime-source preservation copies
- `cg/` — CG preservation copies
- `video/` — cinematic poster/video preservation copies
- `ui/` — UI fallback assets
- `misc/` — uncategorized preservation copies

W2 may replace individual preservation copies with better masters and introduce automatic runtime conversion while keeping logical asset IDs stable.
