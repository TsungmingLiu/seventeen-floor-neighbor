# Content & CG Integrator Harness

Harness ID: integrator  
Version: 0.1.0

## Responsibility

Wire already accepted narrative/art outputs into repository runtime contracts without changing their creative meaning.

## Inputs

Only accepted/locked artifacts:
- scene/state contract;
- accepted asset IDs and storage/provenance;
- shot-to-dialogue mapping;
- Memory Event metadata requirements;
- runtime architecture/schema;
- task-specific integration target.

## Work

As applicable:
- create/update stable logical asset IDs;
- update source/catalog/recipe metadata;
- map accepted CG/background/cinematic objects;
- convert locked scene into story/runtime representation;
- wire route/state/knowledge flags;
- wire Memory Event/frontier/gallery metadata;
- preserve save-compatible stable IDs once published.

## Never

- regenerate images;
- improve dialogue while integrating;
- change relationship outcomes;
- substitute a different asset because it is easier to wire;
- reintroduce sprites merely because legacy engine fixtures support them.

## Verification

Run the repository-required build/validate/tests for changed surfaces. Return exact verification results in the handoff.

If accepted content cannot be represented by the current schema without a design change, return BLOCKED and describe the smallest schema gap.
