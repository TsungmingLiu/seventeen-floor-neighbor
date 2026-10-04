# JYC weekend / weekday entrance revision

> Lifecycle: **CANONICAL** task-local Narrative Design amendment.
>
> Task: `ND-ARC-001`, run `jyc-weekend-weekday-20261004`; source ref `013b3f73e75d8f00bbd2fa53a6cd2d885fecb9a9`; 2026-10-04.
>
> Human explicitly authorizes this direction and affected dialogue rewrites. This artifact owns only this revision's entrance topology and exclusion invariant; it does not certify new Script Lock, independent QA, runtime, visuals or Human preview acceptance. Existing unrelated route rules remain authoritative. Historical scene prose and evidence remain preserved below each scene's current design amendment.

## Finite topology and true merges

| Time / owner | Action and content | Exact handoff |
| --- | --- | --- |
| Weeknight before weekend / COM-01B | Existing separate-night Xu encounter, three ordinary directions questions, same recommendation and farewell. | Existing weekend decision, without extending COM-01X or COM-00. |
| Sunny weekend, before leaving home / COM-01B | `com01b_bookstore_go`: own desired setting-book purpose. `com01b_bookstore_skip`: stay home unpack and work, with actual lived content. | Go → COM-01J; home → common_weekend_home_* → COM-02X. |
| Same weekend ~15:40 / COM-01J | Retain bookstore encounter core, genuine topic, no names/contact. Cafe recommendation is future geography. After she leaves, I buy the desired world-setting supplement and return home. | COM-02X that weekend ~23:00; no weekend cafe. |
| Same weekend ~23:00 / COM-02X | Bookstore route talks about the wanted book actually purchased; home route talks about unpacking/work. Xu responds to the actual day. Both establish the same bounded work outlines, Xu's print deadline and nearby food knowledge. | common_weekday_outing_work, owned by COM-01B. |
| Following weekday afternoon / COM-01B | Work at home, get tired, take the computer and go out. Bookstore-met route goes directly to the cafe. Home route chooses cafe or solo Taipei streets. | Met → COM-02J reunion; home+cafe → COM-02J first meet; home+street → street content → COM-03X. |
| Same weekday cafe / COM-02J | Reunion: ask permission to sit nearby, discuss actual purchased book and weekend topic. First meet: ask permission to sit nearby, discuss her visible drawing. Each has names, local uptake, parallel activity, reciprocal interest and an actual mutual Discord exchange opportunity. Ordinary nonexchange remains valid. | Both cafe outcomes → same weekday evening COM-03X. |
| Same weekday street / COM-01B | Solo walk through familiar yet unfamiliar Taipei; ordinary first-person perception, no invented old acquaintance or flashback character. Street choice permanently excludes Jiang for this playthrough. | Return home → COM-03X; no Jiang encounter. |
| Same weekday evening / COM-03X | Existing intact parcel return, samples, Line and later useful information. | Actual contacted cafe → COM-03J that evening; no contact or street → Xu-only COM-03M. |
| Existing week / free time | Existing COM-03J recommendation, contact-gated COM-03M, then OPEN-A first window. | Existing slots, prerequisites and autonomy; no additional major investment awarded by discovery/contact. |

COM-02X is a true event merge with conditional recollection of the day. COM-03X is a true event merge with different Jiang knowledge and availability preserved. Neither merge makes unknown names, topics, contact or exclusion equal. Both cafe entries may merge into a truthful shared contact body only after equivalent local facts are actually established; they do not share invented bookstore or drawing callbacks.

## State and permanent exclusion

Use concrete choice history and one new boolean, `jyc_permanently_excluded`. `weekend_book_purchased` denotes an actual completed purchase, never a reward or familiarity score. Weekend and weekday route strings in JSON are implementation descriptions, not requirements to create redundant runtime fields when trustworthy local history suffices.

- Set `jyc_permanently_excluded=true` once, at actual `com01b_weekday_street_walk` selection. The route then has never met Jiang, no names, no contact, no drawing or shared-topic evidence. Keep those actual facts; do not award a Jiang Friend/Distance ending for absence.
- Require `!jyc_permanently_excluded` before all later Jiang reachability and content checks. Contact/met/history alone is insufficient, including stale or imported flags. An inconsistent legacy save needs explicit migration/validation; the guard must not clear the exclusion to accommodate it.
- The guard covers COM-01J second discovery, COM-02J/03J, every Jiang message and notification in common content, OPEN-A/B and BRAID-C invitations/slots, contextual first invitations, RE-J, the one-window player reopening, JYC-05–14, Jiang endings/afterstories/codas, SH-01/02 and every shared overlap/deception scene or coda with Jiang presence. It covers ordinary public rediscovery as well as romance. For a common scene with Jiang-dependent prerequisites, bypass it or use an already authored truthful solo/Xu variant; do not silently display her as background presence.
- The task-local Human direction makes street a permanent exception to the general second-discovery opportunity in route/state §8 and the common blueprint. These global files are outside this packet's write scope. Future authoring must carry this amendment; never apply their optional rediscovery text to street.
- Merge, reload, save restoration, scheduler entry, RE, invitations, public art content and ordinary friendship must not clear the flag. Returning to the earlier choice in another playthrough may create a different history; that is not reopening this history. Memory replay uses its own snapshot and writes no live discovery/contact/exclusion state.
- On non-street paths preserve the existing discovery/contact distinctions, actual shared familiarity, necessary arc sequence, finite OPEN-A two slots / OPEN-B three slots, heroine consent, harm/closure/clarity gates, one natural RE and its immediately following unique reopening window. Ordinary contact does not equal prior investment, rest does not create cooling, and a new invite does not repair harm or bypass clarity.
- Preserve missed characters and opportunity costs across the cast. Old familiarity and a new acquaintance require their own actual shared history; this entrance revision neither grants unknown old relationships nor automatically displaces existing/new relationships. No additional heroine, route selector, active-character cap or numeric relationship authority is introduced.

## Minimum scene-dialogue work: exactly four scene units

| Scene unit | Exact changed scope | Retained compatibility |
| --- | --- | --- |
| COM-01B | Weekend decision framing, home content, post-COM-02X weekday work/tired transition and home-only cafe/street fork. | Entire preweekend Xu bridge, three directions choices and farewell. |
| COM-01J | Cafe-seed/exit immediate-visit wording; completed purchase and home-return coda. | Enter through rejoin, all three work/topic branches and all usable stable IDs. |
| COM-02X | Weekend temporal framing; book vs home-work conversation; route-aware share_work and shared work wording. | Recognition, meal comparisons, compatible food/boundary/checkout/return content, all old choice IDs and Xu work payoff. |
| COM-02J | Weekday entry, book-centered reunion with permission to sit, first-meet temporal framing, matching share bridge. | First-meet drawing discussion where factual, parallel activity, reciprocal interest, names/consent/contact actions and all usable stable IDs. |

COM-03X, COM-03J, COM-03M and OPEN-A require design/state guards and selector/route reconciliation, not new final dialogue. COM-03X's “上次／那天” truth survives because Xu's weekend print deadline is common. COM-03J's “下午／晚上” truth survives on the same weekday after the package; its existing neutral first message covers book-focused cafe variants whose exact drawing callbacks no longer fit. Preserve the existing online body and three reply-style outcomes. COM-03M and OPEN-A already have truthful Xu-only and contacted-Jiang text; strengthen the conditions. Independent joint QA must verify actual newly authored callback facts; never mark retained text automatically approved.

## Exact new node proposal and stable ID treatment

New semantic nodes, each within an existing scene unit:

- `common_weekend_home_enter`, `common_weekend_home_work`, `common_weekend_home_exit`.
- `common_acg_first_meet_purchase`, `common_acg_first_meet_home_return`.
- `common_convenience_xu_weekend_book`, `common_convenience_xu_weekend_home`, `common_convenience_xu_weekend_merge`.
- `common_weekday_outing_work`, `common_weekday_outing_tired`, `common_weekday_outing_decision`, `common_weekday_outing_street_enter`, `common_weekday_outing_street_return`.
- New actions: `com01b_weekday_cafe_first`, `com01b_weekday_street_walk`.

Retain `common_bookstore_bridge_weekend_decision`, `com01b_bookstore_go`, `com01b_bookstore_skip`, all compatible `common_acg_first_meet_*`, `common_convenience_xu_*`, `common_station_cafe_jyc_*` / `first_*`, `common_package_xu_*`, `common_recommend_discord_jyc_*`, `COM03M-*`, `OPEN-A-*` and existing topic/contact/reply choice IDs. Their scene meaning, rather than an unchanged next pointer, governs use. Expanded dialogue beats may add deterministic suffix nodes under these prefixes; do not rename accepted/save IDs to match chapter ordering.

Keep the old weekend `common_bookstore_bridge_cafe_decision` and its cafe-go/skip choice IDs as historical compatibility identities, unplayed by the new topology. Do not reuse the old single-visit cafe-skip action as the new irreversible street decision, or derive permanent exclusion retroactively from old skip history. The integrator owns explicit legacy-save/memory migration, exact compiled node suffixes and graph wiring. This design edits none of them.

## Material semantic visual impact

| Beat | Meaningful change / review scope |
| --- | --- |
| COM-01B weekend | Decision now occurs inside home in sunny daylight, not after departure. New unpack/work content. Existing night directions and go-only storefront retain their event meaning. |
| COM-01J coda | Completed purchase, carrying the book and home return replace immediate cafe intent. The accepted bookstore encounter itself keeps its identity and action meaning. |
| COM-02X | Same-weekend sunny-day continuity replaces the old later wet-night setup; do not silently reuse wet pavement/window evidence as today's weather. Book-topic uptake may show a bought book; home-work uptake is separate. Night casual recognition can remain a reuse candidate if pixels fit. |
| COM-01B weekday | New home-work fatigue, daytime departure and solo Taipei street/return beats, with no Jiang image or silhouette in street content. |
| COM-02J | Reunion is after days, and book discussion / purchased-book prop replace a drawing-dominated same-outing beat; permission precedes sitting. First-meet still uses focused drawing without recognition meaning. Daylight cafe staging must match the weekday setting. |
| COM-03X/03J/03M/OPEN-A | Existing parcel, same-afternoon-to-evening screen content, truthful montage and free-time visuals are reuse candidates; conditions must remove all Jiang material from excluded history. No automatic no-visual-impact claim. |

Do not alter accepted image bytes or remove historical receipts. Revised semantic meaning/conditions require downstream independent narrative and visual-impact review; new image generation is outside scope. New prose can enter the registered narrative-preview flow only after its own Narrative QA; Human preview and final visual/playable gates remain outstanding.

## Verification matrix for downstream workers

1. Bookstore → purchase/home → weekend Xu book talk → weekday work → cafe book reunion/contact → package → truthful online/montage/free time.
2. Home unpack/work → weekend Xu work talk → weekday work → cafe drawing first meet/contact → package → truthful online/montage/free time, no COM-01J callbacks.
3. Home → weekend Xu → weekday street/return → package → Xu-only montage/free time. Exhaustively assert no later Jiang node, message, invitation, rediscovery, shared presence, ending or coda can be reached.
4. Both cafe entries' ordinary noncontact outcome → package → Xu-only montage; preserve known-but-not-contacted state, no forced third encounter or online content.
5. Save/resume on each divergence and true merge preserves the actual day and exclusion; replay uses local snapshots and never live-state fallback. Old cafe-skip history alone never creates the new flag.
6. Non-street ordinary contact can first-invite the next unplayed prerequisite; actual invested/missed plans alone can use bounded RE and exactly one reopening window. Closed/unresolved-harm/clarity-due paths remain blocked.

These are required implementation/QA cases, not claims of executed runtime tests. This pass checks schema and source-local design consistency only.
