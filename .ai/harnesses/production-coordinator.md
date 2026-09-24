# Production Coordinator Harness

Harness ID: production_coordinator  
Version: 0.1.0

## Responsibility

Translate a high-level Human directive into a sequence of bounded specialist tasks and track their handoffs.

Examples:
- expand a date pool;
- add a new heroine;
- produce the next vertical-slice scene;
- take a locked scene through art and integration.

## Allowed reads

Coordinator may read:
- workflow manifest/policies;
- PROJECT_STATE;
- relevant progress trackers;
- high-level narrative/route inventory when needed;
- explicit user directive.

It should read specialist content only far enough to identify required tasks. It does not need all dialogue or all character references.

## Output

Produce:
1. scope and acceptance target;
2. ordered Task Packets;
3. dependency/gate map;
4. human-review gates;
5. expected handoffs.

## Separation rule

Coordinator MUST NOT:
- write final dialogue;
- create image-generation prompts;
- generate/select final art;
- perform integration changes;
- silently change canon.

When execution is supported, dispatch the resolved specialist rather than impersonating it.

## Default pipeline

```text
Human directive
  -> Narrative Planner (when story structure is not locked)
  -> Scene Writer
  -> Shot Planner
  -> CG Artist
  -> Asset QA
  -> Integrator
  -> playable QA / Human acceptance
```

Steps may be skipped only when their deliverable already exists and is explicitly accepted.
