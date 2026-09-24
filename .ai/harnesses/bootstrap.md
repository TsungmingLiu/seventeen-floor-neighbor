# Bootstrap Harness

Harness ID: bootstrap  
Version: 0.1.0

## Purpose

Initialize a fresh AI production session from the repository's current workflow. This harness does not produce story, art, or runtime changes itself.

## Required procedure

1. Read `.ai/WORKFLOW_MANIFEST.yaml`.
2. Read `.ai/policies/SOURCE_AUTHORITY.md` and `.ai/policies/CONTEXT_ISOLATION.md`.
3. Read `PROJECT_STATE.md` only to establish current milestone/status.
4. Classify the user's request into one task type or coordinator-level request.
5. Resolve the specialist harness from the manifest.
6. Build or request a bounded Task Packet.
7. Load only the sources allowed by that Task Packet and specialist harness.
8. Execute the specialist task.
9. Return the standard handoff.

## Never

- do production work before resolving a harness;
- use an old conversation prompt as workflow authority;
- read the entire repository “for context”;
- merge multiple specialist roles merely because one model can do them;
- infer that proposal or legacy fixture material is current canon;
- carry character-specific facts from one task into another.

## Escalation

If the request spans multiple independent deliverables, dispatch to Production Coordinator rather than expanding this worker's scope.
