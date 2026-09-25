# Harness Pilot Runbook — COM-00 Shot Planner

> Lifecycle: **EXPERIMENTAL — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical pilot material. Do not execute as a production task.

Status: ready  
Workflow: 0.1.0

## Purpose

Test whether a completely fresh ChatGPT session can:

1. discover the current workflow from the repository;
2. obey the Bootstrap Harness;
3. resolve the Shot Planner role;
4. stay inside an explicit source allowlist;
5. supersede stale 9:16/sprite rendering notes correctly;
6. produce a useful CG-first shot plan without touching narrative canon.

## New-session command

Use exactly this level of instruction; do not paste the old production context:

> 按 repo 最新 AI production workflow，執行 `.ai/experiments/pilots/tasks/COM-00-shot-planner-v0.1.md`。嚴格遵守 Task Packet 的 source allowlist，不要生圖；完成後把 deliverable 寫回 task 指定的位置並回報 handoff。

The fresh session should be able to discover everything else from the repository.

## Pass criteria

PASS only if:
- it starts from the workflow manifest/bootstrap rather than improvising a workflow;
- it reads no forbidden production source;
- it produces 3–6 CG-first 16:9 shots;
- it does not preserve sprite dependencies;
- it does not alter the script/state contract;
- it records a source audit;
- it nominates one isolated single-Xu-Tang shot for the next CG Artist pilot.

## Failure signals

Treat any of these as a harness failure:
- reading the setting proposal “for context”;
- loading Jiang Yucheng data;
- loading the full character-reference catalog for this planning-only task;
- copying 9:16 composition into new output;
- saying a sprite is required;
- generating image prompts/art during the Shot Planner task;
- rewriting dialogue or choices;
- producing one image per dialogue line;
- using prior chat memory to fill missing facts.

## After PASS

Do not automate further yet.

Next:
1. convert the nominated single-character shot into a dedicated CG Artist Task Packet;
2. derive an isolated Xu Tang Character Pack containing only the references needed for that shot;
3. run the CG Artist in another fresh session;
4. run Asset QA separately;
5. compare result against the previous mixed/batch generation failure mode.

Only after this loop is stable should we generalize pack generation or orchestration.
