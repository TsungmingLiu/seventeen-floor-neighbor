# Frozen dialogue calibration baseline

> Lifecycle: **CANONICAL** control-plane baseline; no new character or scene canon.
> Version: 1.0.0. Frozen: 2026-09-30.

Freeze current writer **1.4.0**, QA **1.4.0**, policy **1.2.1**, source map **1.4.0**, and approved bank storage schema **1.2.0** (original bank schema **1.1.0** at the pinned source). These are working-byte pins; do not add voice rules or change the bank during this application cycle. Recheck any changed input before dispatch. This migration only changes storage representation and provenance links; the original approval scope, writer/QA rules and Human decisions remain pinned to the immutable source commit in Git history.

| Fixed source | SHA-256 |
| --- | --- |
| `.ai/harnesses/content-writer.md` | `7259701451d2ee7af2fd6dd804dac8dfe8a2d4f406b05ab2f5e28a97f2c9b8bd` |
| `.ai/harnesses/content-qa.md` | `7e53a7f97f17355f6c7f474080bb6d7806ab0e000d87e7a646a340e4266cd281` |
| `docs/narrative/DIALOGUE_CALIBRATION.md` | `38230fc50b984bf43c31c4f1c94817b284f951eb5a80fe16ebca325180490c5e` |
| `docs/CONTENT_PRODUCTION_SOURCE_MAP.md` | `a0e4e828c70dc9eb44651fd9b58689a262dd4089f968726abc2f65f84272f609` |
| `content/production/voice/approved-examples.json` | `2ebc5b7b4a30f853d59edd27ae36c3249f7407d76433ef4d746aff489b81a3b0` |
| `content/production/voice/receipts/human-reference-001.json` | `97e424d54f2648fd36483be50fdcf6675d6dd599ee3f8e80f6716ccc0a3323ae` |

The COM-00 Human reading feedback of 80 concerns only the displayed short name-exchange/farewell excerpt. It supports retaining this direction and trying a longer interaction. It is not blanket scene approval, bank approval, general effectiveness, or a numeric pass threshold. Raw feedback evidence and displayed candidate snapshot are preserved at 15f8383220d13a4530cfa4141bbda01cfeac08af:.ai/experiments/dialogue-calibration/evidence/human-feedback-003.json and 15f8383220d13a4530cfa4141bbda01cfeac08af:.ai/experiments/dialogue-calibration/evidence/com00-short-positive-20260930.md. These immutable pointers are provenance only, not authoring inputs. Excerpt SHA-256 `0f1e70979ec234043dc53343c0511f7d9592fa549344f21ada50e461325a2ef0`.

The longer COM-00 interaction is a coherent same-scene stress test, not an independent held-out scene. COM-01X was corrective material; COM-02X supplied references. The policy's two-scene held-out evaluation remains incomplete.

| Preserved approved entry | Interaction SHA-256 | Original decision SHA-256 |
| --- | --- | --- |
| `voice.xu_tang.early.com02x.human.01` v1 | `183cfa7e3771e70f317d9a8db480650955cbd9f23d9dcfb8f1f58d765a884053` | `a19550a5eea09410e25af7097712a326cb08601d0f8c02a0405bc23583da3cf8` |
| `voice.xu_tang.early.com02x.human.02` v1 | `67f3b65fc667a4e0fd28084a6a26175cd8c64a4234e0935d49667ec74a32f42b` | `39b03d88008dabfb028b93f36ac59b1bde3f046dd9ee45558dde36a305e5aa79` |

The current bank is a storage projection of the original bank at `15f8383220d13a4530cfa4141bbda01cfeac08af:content/production/voice/approved-examples.json`. Both ordered interactions, IDs/versions/statuses, complete approved_scope objects, all non-evidence context values/certainties, Human reason strings, and original decision hashes are preserved exactly. The full original entries, duplicated context evidence, and candidate descriptors remain reconstructable from the pinned source bank. The receipt's original policy **1.1.0** binding (`850d0bf6a476a110350817e2de12c5f6a5d01b50be7ee5960fca01195711259c`) stays unchanged historical provenance; it is not rewritten to policy1.2.0. Both references are narrowly for Xu Tang/protagonist early-neighbor contexts, with separate knowledge conditions for occupational clarification. They do not supply Jiang Yucheng voice. Unknown trust/attraction/energy cannot establish eligibility.

Use one small cycle: verify approved contract and exact applicable inputs; one fresh bounded scene pass; exactly one naturalization sweep; machine checks and independent fresh QA; at most one focused correction if needed; Human reads the fixed scene/playable version. Reasons are optional and Human rewriting is not required. No score threshold replaces qualitative judgment or hard checks. Stop for diagnosis if the bounded correction does not resolve failures.

Only selected, applicable, pinned approved excerpts may be manually allowlisted. Formal generated narrative-review packets still exclude policy/bank; verifier boundaries remain intact. A separate calibration preflight is advisory only. There is no claim of fully automatic injection, new schema, scoring engine, or new QA framework.
