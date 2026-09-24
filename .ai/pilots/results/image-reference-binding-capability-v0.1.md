# Image Reference Binding Capability Test v0.1

Date: 2026-09-24  
Status: **BLOCKED — capability boundary confirmed**

## Test

Minimal single-reference test using Xu Tang primary face reference:

- Drive file ID: `1Oynvxve61ipxr9Z7UhaSsZE_8OzVVPRS`
- Expected filename: `xt-ref-01-face.png`

## Observed result

```yaml
reference_runtime_id: file_000000003cd8822f93c10fa64b240241
runtime_reference_acquired: true
pixels_verified: true
explicit_binding_parameter_visible: yes_but_deprecated
hard_binding_guarantee: false
automatic_reference_selection_can_be_excluded: false
gate: BLOCKED
blocker: explicit_reference_binding_unavailable
```

## Conclusion

The connector/runtime can acquire the intended Drive image and expose its actual pixels to the worker.

However, the current ChatGPT image-generation surface cannot provide an auditable guarantee that the exact connector-acquired runtime image ID is hard-bound into the generation call, and automatic reference selection cannot be excluded.

Therefore:

- do not use autonomous Drive/connector → image-generator reference transport for production CG;
- do not keep retrying stronger text prompts as a substitute for transport guarantees;
- base CG production uses a Human Reference Attachment Gate in a fresh chat;
- Reaction CG production should prefer editing an accepted base CG.

A future capability test may supersede this result if the image-generation interface exposes a supported, verifiable hard-binding mechanism.
