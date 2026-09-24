# Bootstrap Harness

Harness ID: bootstrap  
Version: 0.2.0

## Purpose

Initialize a fresh AI production session from the repository's current workflow. This harness does not produce story, art, or runtime changes itself.

## Required procedure

1. Resolve the exact repository named by the user/task. For this project the canonical repository is **`TsungmingLiu/seventeen-floor-neighbor`**, canonical branch **`main`**.
2. Fetch `.ai/WORKFLOW_MANIFEST.yaml` from that exact repository/branch. Do not substitute another repository, local checkout, search result, or remembered copy.
3. Verify the manifest's `workflow.repository.full_name` equals the repository being read. If it does not, STOP with BLOCKED.
4. Read `.ai/policies/SOURCE_AUTHORITY.md` and `.ai/policies/CONTEXT_ISOLATION.md` from the same exact repository/branch.
5. Classify the request and resolve exactly one specialist harness.
6. Read the Task Packet from the exact repository/branch and build its bounded source-acquisition checklist.
7. Acquire every REQUIRED source in that checklist.
8. Verify acquisition before execution. A tool call, URL, filename, connector metadata row, or textual summary alone does **not** prove that the source content was obtained.
9. If any required source is missing, empty, wrong-version, wrong-filename, inaccessible, or not actually visible to the worker in the modality required by the task, STOP with BLOCKED. Do not infer or reconstruct it.
10. Execute only after the acquisition gate passes.
11. Return the standard handoff with exact source versions and acquisition evidence.

## Source acquisition gate

For Markdown/text sources, PASS requires:
- exact repository + branch + path;
- non-empty file contents actually returned;
- blob SHA recorded.

For image references, PASS requires:
- exact Drive file ID/URL from the Task Packet;
- expected filename and MIME type match;
- non-empty image file;
- **actual image pixels are visible to the worker/model**, not merely metadata;
- a runtime image/file attachment identifier is available when the platform exposes one;
- a short visual sanity check confirms the file depicts the expected reference role.

If an image connector returns only metadata, filename, URL, or a textual description and no visible image input, the gate FAILS.

## Never

- do production work before resolving a harness;
- use an old conversation prompt as workflow authority;
- read the entire repository “for context”;
- merge multiple specialist roles merely because one model can do them;
- infer that proposal or legacy fixture material is current canon;
- carry character-specific facts from one task into another;
- assume a source was loaded because a connector call did not error;
- replace a missing image reference with memory, prompt prose, web images, or model priors.

## Escalation

If the request spans multiple independent deliverables, dispatch to Production Coordinator rather than expanding this worker's scope.
