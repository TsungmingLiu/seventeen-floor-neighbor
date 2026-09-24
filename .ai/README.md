# AI Production Control Layer

This directory is the single entry point for AI-assisted production work.

## Start here

Every new production session MUST:

1. Read `.ai/WORKFLOW_MANIFEST.yaml`.
2. Run the Bootstrap Harness in `.ai/harnesses/bootstrap.md`.
3. Resolve exactly one specialist harness for the current task.
4. Load only the bounded inputs allowed by that harness.
5. Return a structured handoff using `.ai/schemas/HANDOFF.md`.

Do not begin by reading the whole repository. Do not use an old chat prompt as workflow authority.

## Design rule

**Harnesses are reusable specialists. Data packs are replaceable content.**

A harness must not embed Xu Tang, Jiang Yucheng, a route, a scene, or any other task-specific content. Character, environment, scene, shot, and continuity facts are injected per task.

## Why this exists

The repository contains historical prototype material, runtime fixtures, proposals, and production canon. Reading all of it indiscriminately causes identity bleed, style drift, stale-spec conflicts, and oversized context. The control layer defines source authority, context isolation, worker contracts, and handoff rules so each session operates from the current method.

## Current phase

Workflow v0.1 is a manual/semiautomated proving layer. It is NOT the automated Content Factory. Human review remains required for creative direction, accepted image selection, and final playable acceptance.
