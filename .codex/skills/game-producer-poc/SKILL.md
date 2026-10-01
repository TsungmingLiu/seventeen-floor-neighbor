---
name: game-producer-poc
description: Use when the user asks conversationally to run, review, check, or QA one existing locked narrative scene in this game without manually running terminal commands. This experimental skill routes the parent Codex conversation to the subscription-backed fresh-worker Narrative QA POC and returns the result in the same conversation.
---

# Conversational Producer POC

This skill is a **control-plane adapter**, not a narrative reviewer.

Use it only for one existing Locked Scene and the current `content_qa / narrative_review` POC. Examples that should activate it include:

- "幫我對 COM-00 跑一次獨立 QA。"
- "Check COM-02X dialogue quality with a fresh reviewer."
- "這個 scene 我想再做一次 narrative review，不要改內容。"
- "幫我看看 COM-01X 的對話自然度，走正式 QA。"

Do not activate it for general coding questions, ordinary discussion, image generation, or a request that explicitly asks the parent to personally critique the prose.

## Parent boundary

The current conversation is the persistent Human-facing Producer. Keep the user's natural-language intent and follow-up feedback here.

Do **not** personally perform narrative QA, rewrite dialogue, or read the target scene/canon to substitute for the specialist worker.

Do not ask the Human to run shell commands.

## Dispatch

1. Resolve exactly one explicit scene ID from the user's request. If the user names one, use it. Do not guess a scene from unrelated repo history.
2. Do the normal repository bootstrap required by `AGENTS.md`, but remain control-plane only.
3. Run the subscription worker yourself from repo root:

   ```bash
   npm run subscription:poc -- --scene <SCENE_ID>
   ```

4. Do not set `OPENAI_API_KEY`, `CODEX_API_KEY`, or `CODEX_ACCESS_TOKEN`. The runner itself enforces ChatGPT authentication.
5. Treat a runner `BLOCKED` as a real POC result. Do not bypass isolation by reviewing the source yourself.
6. Do not retry automatically. A second worker requires an explicit Human follow-up or an existing orchestration rule that authorizes a new attempt.

## Return to the Human

Use only the runner's final `producer_report` plus control-plane metadata to summarize the result in the same conversation.

Report:

- scene;
- worker status;
- QA checks that are not PASS, or say all checks passed;
- concise known issues;
- whether anything was modified (for this POC: no canonical state should be modified);
- the next Human-relevant decision, if any.

Do not dump Task Packet JSON, hashes, run IDs, command lines, or internal worker mechanics unless the Human asks.

## Follow-up feedback

The conversation remains the durable interaction surface.

- If the Human asks what a QA finding means, explain the already-returned finding without reading creative source.
- If the Human accepts/rejects a finding, retain that directive in the conversation and route the next requested bounded task; do not edit canon inside this QA-only POC.
- If the Human asks for a rewrite, integration, CG, or a full end-to-end scene, state that the **current POC only automates Narrative QA** and do not silently widen the experiment. The future Producer loop will add those stages separately.

## Success condition

The Human should be able to initiate and steer this POC entirely through conversation. Terminal commands, Task Packets, `codex exec`, JSON handoffs, and authentication checks are implementation details owned by the Producer.
