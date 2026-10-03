# Production dispatch and return tools

Lifecycle: **CANONICAL** technical dispatch/return procedure. These gates verify identities and declared prerequisites. They never run semantic QA, prove visible pixels, generate art, award task status, select a Human master, or modify a ledger.

## Dispatch

Keep the full JSON packet in ignored session cache. Existing `context --verify-packet` gates remain required for their generated packets; the production preflight also invokes their original exact canonical verifiers and content/production validators. Run immediately before dispatch:

```bash
npm run production:preflight -- --packet generated/session-cache/<run>/<task>.packet.json --scene <scene> --out generated/session-cache/<run>/<task>.preflight.json
```

Omit `--scene` only for tasks without a scene (for example governance maintenance). A scene-scoped dispatch requires the Coordinator's explicit expected scene. Nonzero exit or `dispatch_allowed: false` blocks dispatch. A short JSON summary goes to stdout; the exact packet/input/source/tool/mandatory instruction identities, full validator logs and bounded diagnostics stay in the cache report. A passing report is a momentary dispatch check: re-run after any packet, source, dependency, capability or profile change. Never reuse its path/digest as a durable approval.

Existing generated routes are all canonical `narrative_review` packets, `COM-00` `cg_plan`, `COM-00` manifest-usability review, and the registered `COM00-S04-BASE-NEUTRAL` candidate review. They cannot bypass their original verifier with `--kind manual`, `packet_origin`, or extra declarations. An explicit generator route outside that boundary is blocked. The `context:preflight`, compact-context and delta PoCs remain experimental technical audits; this tool does not adopt their semantic or production claims.

## Manual v1 boundary

A manual packet declares `packet_origin: manual-v1` and `preflight_requirements: {version: 1, dependencies: []}`. Supported extensions are bounded `narrative_design`, `scene_dialogue`, other scene `cg_plan`, one-entry `cg_render`, other scene one-entry `visual_review`, and `integrate` with its existing mode. This is an identity/prerequisite check, not a universal creative schema or DAG/resume implementation. Continue using each active harness and domain validator. Unresolvable identities or evidence shapes block instead of weakening an existing validator.

Every allowed source has a required acquisition. Canonical prose/technical sources require committed Git blobs; optional SHA-256 and exact line excerpts are verified too. Explicit transient artifacts follow the SHA-only boundary below. Every manual input version resolves to an acquired exact file, `#Lx-Ly` excerpt, or exact transient SHA-256 identity. Mandatory bootstrap/policy/source-map/Handoff/active-harness context is separately bound to the source commit, so each packet need not repeat that boilerplate. Sources and required instruction bytes must equal the dispatch ref; pending source changes need a new pinned packet. Worktree symlinks, path traversal, archive/experiment roots, missing inputs and stale hashes block. Acquisition/hash checking is programmatic; the worker still reads its minimum declared context and mandatory instructions. Hashing an image never proves it was visible.

Transient inputs are limited to explicitly allowlisted, untracked paths under ignored `generated/session-cache/` or `generated/job-artifacts/`. They declare `sha256` and `artifact_role`, without a fake `git_blob_sha` or creative-canon excerpt. Renderer technical acquisitions support `deterministic_render_packet` and `renderer_capability`; independent candidate visual review/final integration image acquisitions support `candidate_original`, `runtime_derivative` and `runtime_screenshot`. Images also declare exact source ID/role, filename, MIME, width/height and visibility requirement; signature, dimensions and full image decode are checked, while actual visible pixels remain a worker fact. Cache artifacts cannot become canonical prose, a committed dependency approval, or evidence of an unreported generation. Changes to any artifact bytes/hash, undeclared roles, wrong task scope, tracked artifacts and symlinks block. Both compact and legacy Handoff verification rehash these transient inputs.

Registered canonical image references additionally declare `preflight_requirements.reference_catalog: {path, version}`; the machine resolves only selected catalog rows, verifies exact current source/catalog identity and invokes the existing signature/dimension/full-decode validator. That catalog is machine acquisition evidence, not permission for workers to load unrelated images or catalog context. Transient new candidates/evidence do not need fabricated catalog registrations before review/adoption.

For a scene dialogue/planning or non-maintenance integration task, acquire and declare `inputs.narrative_contract` and `inputs.locked_scene`; contract `scene_id`/`source_scene` must match. Other-scene visual review declares `review_scope`, one `inputs.cg_entry_id`/`inputs.cg_manifest`, and an acquired image with role `candidate`/matching `inputs.candidate_source_id` for candidate scope. Fresh independent QA remains required.

Each applicable prior approval is explicit, for example:

```json
{
  "gate": "narrative_review",
  "run_id": "upstream-run",
  "task_id": "NQA-001",
  "receipt": "content/production/runs/upstream-run/NQA-001.decision.json",
  "version": "<exact receipt Git blob or SHA-256>",
  "input_versions": ["<the exact receipt input_versions objects>"],
  "required_qa_codes": ["NQA-EXAMPLE"],
  "output_versions": ["<optional exact receipt output_versions objects>"]
}
```

The tool compares committed receipt run/task/scene/status, all QA inputs against the dispatch commit, and explicitly requested passing QA codes/harness. Manual dependency identities currently resolve files and exact line excerpts; metadata selectors or omitted historical evidence requiring a specialized resolver block. Same-run `depends_on` and declared `inputs.accepted_outputs` must resolve through these dependencies; accepted outputs require exact declared output identities. Canonical durable schema-2 decisions use their existing `qa_codes`, `harness`, `human_gate_required` and input/output versions; no new receipt fields are required. A Human master approval requires an existing `human_decision` receipt with its actual accepted outcome/gate. `HUMAN_ACCEPTED_AS_IS` remains that Human outcome; it does not become Visual QA PASS.

Required prior gates: scene dialogue → narrative design; CG plan and manifest review → narrative review; renderer and candidate review → manifest usability; narrative preview → narrative review; final integration → narrative review, visual review and accepted-master selection. Maintenance adds no art-production approvals or run. Additional applicable dependencies remain the Coordinator's explicit responsibility; this does not discover the entire DAG.

Renderer packets declare a single manifest entry plus deterministic render packet and the exact image/reference IDs. Existing `buildPackets` verifies the canonical manifest/projection and selected scene/entry. Multi-entry manifests require exact acquisition excerpts containing only the selected entry; linked-sequence orchestration is not implemented by manual v1. Declare `preflight_requirements.renderer: {adapter, max_reference_images, capability_source}`. The capability source is an acquired, version-bound technical JSON artifact (committed Git or explicitly SHA-bound transient capability snapshot) with exact `adapter`/`max_reference_images`; absence, inconsistent capability or an attachment count above the limit blocks. The limit is supplied by the actual adapter capability, never guessed from worker/model tier. This does not make an image tool callable or prove generation/attachments happened.

For final integration, or explicit `display_profiles_required: true`, supply all three profile kinds (`desktop`, `mobile_landscape`, `mobile_portrait`) under `preflight_requirements.display_profiles`; each has `id`, `kind`, CSS `width`/`height`, `dpr` and `orientation`. `display_profiles_source: {path, version}` binds an acquired canonical technical JSON source whose `display_profiles` contains those exact profile objects. The profile dimensions come from that approved task-specific technical artifact, not invented universal values. No additional Human profile approval gate is introduced. Missing/conflicting profiles block; profiles/hashes alone never prove screenshots, crop, compression or independent display QA.

## Worker return and Coordinator verification

The worker writes a small facts file containing actual `status`, `inputs_used`, `outputs`, `qa`, actual `attachments_used`, issues, invalidation and next-stage advice. Status has no default. `inputs_used` accepts explicit used source IDs/locations as strings (the tool resolves exact versions), or existing `{source, version}` objects. Mandatory context paths can be reported too. The generator adds no unreported used source or pixels claim. Output paths must match a declared deliverable or the packet's exact write allowlist. A wildcard is supported only as a trailing `/**` directory boundary.

```bash
npm run production:handoff -- --packet generated/session-cache/<run>/<task>.packet.json --facts generated/session-cache/<run>/<task>.facts.json --binding generated/session-cache/<run>/<task>.binding.json --out generated/session-cache/<run>/<task>.handoff.json
npm run production:handoff -- --packet generated/session-cache/<run>/<task>.packet.json --verify generated/session-cache/<run>/<task>.handoff.json
```

Generation writes a compact Handoff with exact packet/input digest and binding path/hash, automatic source/output hashes and pinned workflow/harness version. Exclusive cache writes reject existing targets and symlinks. The Coordinator verifier expands the complete binding, checks the exact packet bytes and all input identities, rehashes output bytes and preserves the worker's actual status. For authorized authoring/integration outputs that overlap inputs, input provenance remains pinned to the dispatched Git source; changed output bytes are verified separately. Legacy already-dispatched manual packets may return without prospective preflight fields; that return-only compatibility path cannot dispatch. Legacy full Handoffs with complete `input_versions` and exact SHA/Git-blob output versions remain accepted. Verification never turns `NEEDS_REVIEW` into PASS, retries a task, or grants a Human gate.

Parent summaries retain only task/status, packet/input digest, output count/necessary identities, short QA issues and gate. Compact cache bindings are disposable, not future dependencies or durable QA evidence. Before recording a durable decision, verify the full result and project only necessary existing receipt/checkpoint fields through the storage boundary. A fresh session recovers approvals from canonical sources/committed decisions; missing cache blocks verification of that session's compact return rather than substituting a summary as proof. Independent QA and every existing Human gate remain unchanged.
