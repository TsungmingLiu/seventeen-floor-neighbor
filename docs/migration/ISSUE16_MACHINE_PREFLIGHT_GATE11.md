# Issue #16: route and Locked Scene machine preflight

Gate 11 strengthens the existing validators run by `npm run validate` and by the `narrative_review` Task Packet preflight. It changes no creative source, route node ID, accepted asset or QA/Human decision.

## Before state

- `tools/content-lib.mjs` required at least one reachable `route` terminal, but a separate reachable choice could lead into a cycle without any path to a terminal while another choice kept the validator green. The old `xu-tang` route includes random pool `return` nodes, so a valid return must be treated as a control return to the caller's `after` target.
- An ending rule list needed at least one `default: true`, but two defaults were not rejected.
- `tools/validate-production-contracts.mjs` accepted any occurrence of the contract filename anywhere in a Locked Scene. An incidental or stale mention could pass even if its formal Narrative Continuity Contract binding was missing.

## Gate boundary

For both existing route packages, every node reachable from the chapter start must have a graph path to a route terminal or a valid random pool return. A random caller's `after` target must itself have a path onward. Ending rules require exactly one default. A Locked Scene must contain exactly one canonical contract field in its `## Narrative Continuity Contract` section, matching the exact bound repository path; incidental mentions elsewhere do not count. These are structural checks only: a semantic QA worker still judges voice, pacing, relationships, knowledge and visual meaning.

The negative tests change a real Opening choice to create a branch trapped in a cycle while the main route still reaches its end, duplicate the default ending rule, and replace a scene's formal contract binding with a decoy mention. Each must fail machine validation before independent Narrative QA dispatch. Both unchanged route packages and all four existing Narrative Continuity Contracts must still pass.

The gate is complete only after focused and full tests, asset check/build, content/production validation, preview smoke, a fresh GitHub checkout with no Drive credentials, and a verified remote checkpoint/CI. Failure leaves the last verified branch intact; no machine PASS can substitute for an accepted Narrative QA or Human decision.
