# Subscription Producer POC

> Experiment only. Agents API is deliberately out of scope.

## Goal

The Human-facing entrypoint is a normal repo-scoped Codex conversation, not a terminal command. The Human describes the desired review in natural language; the persistent parent conversation acts as control-plane-only Producer, invokes the backend itself, and returns the worker result to the same conversation.

Under that conversational surface, test whether the existing repo-native production protocol can execute one real fresh worker through local `codex exec` while consuming the user's ChatGPT/Codex subscription allowance rather than API-key billing.

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

## Conversational entrypoint

The target surface is a **repo-scoped Codex conversation**, including Codex Remote controlled from the ChatGPT mobile app. An arbitrary ordinary ChatGPT conversation with no development host/repo execution context is not considered a successful execution surface for this POC.

The repo-scoped skill lives at:

```text
.codex/skills/game-producer-poc/SKILL.md
```

Representative Human prompt:

> 幫我對 COM-00 跑一次獨立 Narrative QA，不要改內容。

The parent Producer should resolve the explicit scene ID, invoke the subscription POC itself, and return only the conversation-friendly `producer_report`. The Human should not need to know the generated run ID, Task Packet, `npm`, `codex exec`, or handoff path.

A follow-up such as:

> 那個 pacing 的問題用白話解釋一下。

should be answered from the already-returned QA result in the same conversation. It must not cause the parent to open the creative source and redo the specialist judgment itself.

The POC remains deliberately narrow: a request to rewrite, integrate, render CG, or run a full production loop must not silently widen this experiment.

### Two-turn acceptance benchmark

Start a fresh repo-scoped Codex/Remote conversation on this branch and send only:

> 幫我對 COM-00 跑一次獨立 Narrative QA，不要改內容。

Pass only if the parent invokes the backend itself and returns the compact review result without asking the Human to open a terminal.

Then send:

> 把剛才沒有 PASS 的項目用白話解釋一下；先不要改任何東西。

Pass only if the same parent conversation explains the already-returned findings without opening creative source to perform a second shadow review and without dispatching an unauthorized retry.

This two-turn benchmark tests the actual product UX: natural-language start plus conversational steering, not merely backend executability.

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

## Backend live run

The commands below are developer diagnostics for the execution primitive. They are **not the intended Human workflow** once the conversational skill is active.

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

Continue this architecture only if a live COM-00 conversational run demonstrates all of the following:

- the Human initiates the run from a normal Codex conversation without manually opening a terminal;
- the same parent conversation can explain the result and accept follow-up feedback;
- Codex authenticates through ChatGPT subscription, not an API key;
- a fresh non-interactive worker completes without Human prompt-copying;
- the worker sees only bounded Task Packet sources;
- unrelated repo files and the rest of the local filesystem are denied to model-generated commands;
- no worker network or web-search access is required;
- the JSON handoff passes local immutable-version validation;
- the semantic QA result is comparable in quality to the prior manual fresh-worker Narrative QA;
- Human operational effort is materially lower.

If accepted, the next experiment is **not** CG. Add a narrow Producer loop for Writer -> fresh QA -> at most one corrective Writer -> fresh QA, still stopping before ledger mutation and Human gates.
