# Subscription Producer POC

> Experiment only. Agents API is deliberately out of scope.

## Goal

Test whether the existing repo-native production protocol can execute one real fresh worker through local `codex exec` while consuming the user's ChatGPT/Codex subscription allowance rather than API-key billing.

The first experiment supports exactly:

```text
content_qa / narrative_review
```

## Boundary

The repository remains the control plane. The adapter:

1. generates the existing deterministic Task Packet with `tools/context.mjs`;
2. verifies the packet and existing machine QA before model execution;
3. copies only exact Task Packet allowlisted text or verified excerpts into a fresh worker workspace outside the Git repository;
4. starts one non-interactive `codex exec --ephemeral` run;
5. loads no user Codex config or repo rules;
6. applies a custom permission profile that denies the filesystem root, permits only minimal runtime reads plus read-only worker-workspace access, and disables command network;
7. disables web search, apps, memories and subagents for the specialist worker;
8. requires a JSON-schema-constrained final handoff;
9. validates immutable input/output versions locally;
10. copies only the validated handoff back into ignored `generated/session-cache/`.

No canonical file, ledger, decision receipt, PR, or CG is modified by the worker.

## Authentication contract

This POC is specifically for the subscription route.

Before a live run, the adapter executes:

```bash
codex login status
```

It rejects an active API-key login and removes `OPENAI_API_KEY`, `CODEX_API_KEY`, and `CODEX_ACCESS_TOKEN` from the child process environment. The supported path is a normal Codex CLI login through the user's ChatGPT account.

If status output cannot be positively identified as ChatGPT/OAuth authentication, the POC fails closed.

## Why an external worker workspace

The worker does not run at repo root. Its workspace contains only:

```text
control/
  task.packet.json
  harness.md
  handoff-schema.md
  handoff-output.schema.json
sources/
  index.json
  <only Task Packet allowlisted files/excerpts>
```

The permission profile then denies reads outside that workspace except Codex's minimal runtime paths. This makes source isolation an execution boundary rather than a prompt convention.

## Codex invocation

The live worker uses stable non-interactive primitives:

- `codex exec`
- `--ephemeral`
- `--output-schema`
- `--output-last-message`
- `--ignore-user-config`
- `--ignore-rules`
- custom permission profile
- prompt via stdin

It intentionally does **not** use legacy `--sandbox workspace-write`, because the newer permission-profile system can restrict filesystem reads as well as writes.

## Dry run

No Codex installation, authentication, or model allowance is consumed:

```bash
npm run subscription:poc -- \
  --scene COM-00 \
  --run-id subscription-poc-com00 \
  --task-id NQA-COM00-SUB-POC-001 \
  --dry-run
```

The dry run executes the real packet generator/verifier/machine preflight and prints the planned bounded worker sources and Codex command policy.

## Live run

First install/update Codex CLI and log in with the ChatGPT account that owns the subscription:

```bash
codex login
codex login status
```

Then:

```bash
npm run subscription:poc -- \
  --scene COM-00 \
  --run-id subscription-poc-com00-live \
  --task-id NQA-COM00-SUB-POC-001
```

Optional explicit model experiment:

```bash
CODEX_POC_MODEL="<model available to your plan>" npm run subscription:poc -- ...
```

The first POC deliberately leaves model-tier mapping unresolved. It tests execution isolation and orchestration economics before coupling repo policy to fast-changing product model names.

## Acceptance

Continue this architecture only if a live COM-00 run demonstrates all of the following:

- Codex authenticates through ChatGPT subscription, not an API key;
- a fresh non-interactive worker completes without Human prompt-copying;
- the worker sees only bounded Task Packet sources;
- unrelated repo files and the rest of the local filesystem are denied to model-generated commands;
- no worker network or web-search access is required;
- the JSON handoff passes local immutable-version validation;
- the semantic QA result is comparable in quality to the prior manual fresh-worker Narrative QA;
- Human operational effort is materially lower.

If accepted, the next experiment is **not** CG. Add a narrow Producer loop for Writer -> fresh QA -> at most one corrective Writer -> fresh QA, still stopping before ledger mutation and Human gates.
