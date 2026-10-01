# Agents API Producer POC

> Status: experiment branch only. This is an execution adapter, not a replacement production workflow.

## Question

Can the existing repository-native production protocol execute one real bounded worker through the OpenAI Agents API without weakening Task Packet isolation, machine preflight, provenance, or Human gates?

## Scope

The first POC supports exactly one existing task type:

```text
content_qa / narrative_review
```

The local process remains the control plane. It:

1. uses the existing `tools/context.mjs` generator;
2. verifies the Task Packet and current machine QA before dispatch;
3. packages only the Task Packet's exact markdown allowlist into an OpenAI-hosted sandbox;
4. disables sandbox network access;
5. starts one fresh Agents API session;
6. receives exactly one `/workspace/outputs/handoff.json`;
7. validates the handoff against immutable packet input versions;
8. writes the validated handoff only to `generated/session-cache/`.

The POC does **not** update a Production Run Ledger, create a committed decision receipt, modify canon, integrate content, open a PR, or render CG.

## Why hosted files instead of cloning the repository

The experiment is specifically testing the repository's bounded-context contract. Giving the worker a repository clone would allow source discovery outside `allowed_sources`. Instead, the adapter uploads only:

- `task.packet.json`;
- the active worker harness;
- the handoff schema;
- an index of canonical source bindings;
- full files or exact line excerpts already allowed by the verified Task Packet.

The hosted sandbox has `network.access: disabled`.

## Model routing

The adapter preserves the workflow's abstract model tier:

- `economical` -> `gpt-6-luna`
- `capable` -> `gpt-6.1-sol`

Set `AGENTS_POC_MODEL` to override this mapping for an explicit experiment.

## Setup

Create an OpenAI Platform application API key with Agents API session permissions and Responses inference permission, then keep it outside the sandbox:

```bash
export OPENAI_API_KEY="..."
```

No OpenAI SDK package is required; the POC uses Node 22's built-in `fetch` against the beta Agents API.

## Dry run

This exercises the real packet generator, packet verifier, machine preflight, and bounded sandbox packaging without spending API tokens:

```bash
npm run agents:poc -- --scene COM-00 --run-id agents-poc-com00 --task-id NQA-COM00-AGENTS-POC-001 --dry-run
```

The output must show a network-disabled worker bundle and only the allowlisted source entries.

## Live run

```bash
npm run agents:poc -- --scene COM-00 --run-id agents-poc-com00-live --task-id NQA-COM00-AGENTS-POC-001 --verbose
```

A successful run writes:

```text
generated/session-cache/<run-id>/<task-id>.packet.json
generated/session-cache/<run-id>/<task-id>.handoff.json
```

These remain ignored cache artifacts. The Agents API session is deleted after artifact retrieval unless `--keep-session` is explicitly set.

## Acceptance

Keep the POC only if all are true:

- the agent receives no unrelated narrative or heroine source;
- machine preflight happens before API dispatch;
- every live task uses a fresh Agents API session;
- a stale/mismatched handoff is rejected locally;
- the agent cannot directly write canonical repo state;
- a real narrative review reaches the same class of QA decision as the existing manual fresh-worker workflow;
- Human operation is materially lower than opening and coordinating a separate worker chat manually.

If these fail, do not expand this experiment to writers, integration, CG, or automatic ledger mutation.

## Deliberate non-goals

- no generic workflow engine;
- no dashboard;
- no database;
- no self-hosted executor;
- no GitHub MCP;
- no nested subagents inside specialist workers;
- no automatic corrective retry;
- no image generation;
- no automatic acceptance or merge.

The next experiment, only after this one is accepted, is a thin Coordinator loop that reads the existing run DAG, dispatches the next `READY` bounded task, validates its handoff, and stops at an existing Human gate.
