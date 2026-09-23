# Asset Inventory — W1 Source Boundary

Updated: 2026-09-22 (America/New_York)

## Purpose

W1 separates source-side binary preservation from disposable runtime output.

All 36 files that were tracked under `dist/assets/` before W1 were copied into `assets-src/` by reusing their **existing Git blob SHA**. No binary was downloaded, re-encoded, or re-uploaded through the GitHub plugin.

This proves preservation and source/output separation. It does **not** prove that every pre-existing blob is a complete or original-quality master.

Runtime-to-source mapping is recorded in:

`content/assets/source-map.json`

## Preservation categories

- backgrounds → `assets-src/backgrounds/`
- sprites/character images → `assets-src/characters/`
- CG → `assets-src/cg/`
- cinematic poster/video → `assets-src/video/`
- UI fallback → `assets-src/ui/`

Existing authoring sources under `content/references/` and `content/cinematics/` remain in place.

## Known / suspected truncated binaries

The following files were already identified during prior project work as damaged/truncated or are strongly suspicious because unrelated binaries terminate at almost the same ~786,444–786,446 byte size.

### Date CG runtime files

| File | Git blob SHA | Size |
| --- | --- | ---: |
| `dist/assets/cg-date-bookstore.png` | `0850ac3e77d0ffc0871b0149e096f17cecfe7819` | 786,445 |
| `dist/assets/cg-date-riverwalk.png` | `46f7ee82486fe8c0b7d6f68d5ee9b9d50b1d2ac4` | 786,445 |
| `dist/assets/cg-date-night-market.png` | `1024c7457f6c8b17fb1b86fbe825c5e148a46d8c` | 786,446 |

W1 preservation copies under `assets-src/cg/` are byte-identical to these current Git blobs. They are **not repaired**.

### Xu Tang identity reference

| File | Git blob SHA | Size |
| --- | --- | ---: |
| `content/references/xu-tang-identity-v2.png` | `bce8886837a9b9609c7c6bcda3cd88e08fcb4a10` | 786,444 |

This file remains in its authoring/reference location and is **not repaired by W1**.

### First-kiss-v2 keyframes

| File | Git blob SHA | Size |
| --- | --- | ---: |
| `content/cinematics/first-kiss-v2/keyframe-01-look.png` | `fba2102d76be30a056df4d660d8ff1b2bab75129` | 786,446 |
| `content/cinematics/first-kiss-v2/keyframe-02-hair.png` | `026149e367f55c1357d9796f7f6a2f68e303b87a` | 786,446 |
| `content/cinematics/first-kiss-v2/keyframe-03-eyes-closed.png` | `f7a9c305d179390a1154736fd398e3ae995245e7` | 786,445 |
| `content/cinematics/first-kiss-v2/keyframe-04-approach.png` | `50b3bf6075c34b3f1965852f8daf8b61c0269e0b` | 786,446 |

These remain source-authoring files and are **not repaired by W1**.

### Existing first-kiss runtime video

| File | Git blob SHA | Size |
| --- | --- | ---: |
| `dist/assets/mv-first-kiss.mp4` | `83daceca01b89911f6ca1c8b0276fd7b16af970a` | 786,445 |
| `dist/assets/mv-first-kiss.webm` | `f87eba8ee03dc8a4319990c904c284e8f662e3b0` | 786,444 |

The near-identical cutoff is suspicious. Per prior project direction, W1 does not modify these videos. They are preserved byte-for-byte under `assets-src/video/`.

## Important interpretation

The repeated ~786 KB sizes across unrelated PNG, MP4, and WebM files are a strong truncation indicator, but W1 does not perform binary decode verification. W2 must add real decode/dimension/media validation.

If the Git blob is already truncated, copying its SHA to `assets-src/` preserves the damaged bytes. Recovery must come from an independent complete source such as:

- the user's local machine;
- a prior Library/Project original;
- a later regenerated master.

## W2 follow-up

W2 should:

1. decode every image and verify declared dimensions;
2. probe video container/duration;
3. reject incomplete files even when the path exists;
4. recover or regenerate known damaged sources;
5. replace preservation/runtime derivatives with true masters where available;
6. keep logical asset IDs stable while physical source/runtime paths evolve.
