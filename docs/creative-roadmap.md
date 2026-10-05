# Sea, Ship, Math — active roadmap

Updated: 5 October 2026. **The user approved Living Atlas A/B as the foundation,
requested promotion to the actual homepage/blog, and explicitly authorized a
commit.** This approval covers the foundation. It does not mean every planned
feature, real project content, or physical-device qualification is complete.

Start with [the handoff](creative-v2-handoff.md), then the
[ordered implementation plan](creative-v2-plan.md) and
[current validation](creative-v2-validation.md). The
[brief](creative-v2-brief.md) preserves the creative standard.

## Latest selected interaction — staged mobile sea

The user explicitly selected stage-by-stage mobile gestures and unchanged
continuous desktop scrolling. This is approved work on `/`, not an unselected
sample alternative. Three states: **Sea → Structure → Drawing** at
progress 0/.55/1, with bounded 600 ms smootherstep transitions. Two upward swipes reach
Drawing; the next upward gesture scrolls into Work normally. Reverse swipes
visit the previous stage. Previous/Next buttons, direct Work/Writing and skip
links remain available. Coarse primary pointer selects mobile mode at mount;
fine-pointer desktops retain continuous scrolling. Reduced motion uses immediate
stills; no-JS retains the existing readable/native-scroll fallback.

The user requested three phases because Waves and Structure looked too similar.
The merged Structure stage uses midpoint progress .55; Sea and Drawing remain
the endpoints.

This selection supersedes the earlier native-only hero gesture rule specifically
within the staged mobile hero. Full local validation passes 81 browser records,
with actual touch-event progression/reversal and final native exit. Physical
Safari smoothness remains open. Commit subject: `refactor: soften mobile sea transition pacing`.
Next: deploy/recheck this three-stage flow on iPhone Air Safari, preserving Mac
Chrome improvement. All temporary QA servers are closed after validation.

## Approved foundation and current routes

A is the main website; B is its distinct publication; C remains an optional
mathematical discovery to develop later. **The Living Atlas** uses one authored
sea that reveals its construction through native scrolling and becomes a
reproducible printed plate. The notebook has its own editorial composition.

| Route | Purpose |
| --- | --- |
| `/` | Living Atlas homepage: ocean/ship → drawing, existing Work and Elsewhere access, edition explanation, notebook threshold and contact |
| `/?seed=27c4b901` | Another deterministic authored sea edition |
| `/blog` | Engraved Navigator's Notebook index |
| `/blog/three-waves-one-sea` | Six-wave sample essay; inherited slug |
| `/blog/an-integral-under-sail` | Brand construction sample essay |
| `/samples` | Index of the approved foundation and a home for future explorations |
| `/samples/observatory` | Redirect to `/`; retains old review links |
| `/samples/atlas` and `/samples/atlas/:slug` | Redirect to `/blog` and `/blog/:slug` |
| `/api/sea-edition` | Reproducible authored coefficients |
| `/api/sea-edition/print` | Printable SVG at model time zero |

Two articles remain clearly labelled samples. Main Work/Elsewhere functionality
is retained while authentic project spreads and the final port treatment remain
future work. No new sensor interaction, real ocean feed or C experience is
claimed. The user has deployed the foundation to `maxsash.com`; this session
does not change hosting or deploy new revisions.

## Decision record

- Review 01 was rejected: notebook too similar; explicit controls too simple.
  Wind versus Helm is no longer a decision to ask.
- On 5 October the user requested a sensible working tree and removal of
  superseded files. The rejected harbour, earlier blog workbenches, voyage,
  helpers/tests and temporary review bar were removed. Research preserves the
  reasons; rejected UI is not carried forward as an accepted feature.
- On 5 October the user **approved Living Atlas A/B as the foundation** and
  requested **actual homepage/blog integration, current documentation and a
  commit**. No further creative approval is needed to complete that checkpoint.
- The original plan foundation is commit `012e164`. The new foundation's final
  commit record is maintained in [the handoff](creative-v2-handoff.md); do not
  invent a hash before it exists.
- [Reference research](research/creative-references-v2.md),
  [whole-site audit](research/creative-audit-v2.md), and
  [engineering research](research/creative-engineering-v2.md) remain useful.
  Their larger proposals are not implemented features; the plan names the
  actual smaller v1 wave contract.

## Sequence and commit boundaries

1. **Current priority, clarified feedback:** sea reveal stutters while scrolling
   on iPhone Air/Safari; user says latest MacBook Pro/Chrome is much better. Writing's one-click
   fix and scroll optimizations are now observable live; qualify physical scrolling before
   new features. Idle cadence alone does not qualify this interaction.
2. Recheck the updated revision on those physical devices in the same browser;
   qualify renderer/fallbacks, quality budgets and accessibility from evidence.
3. Develop authentic project spreads and refine the whole main-site journey.
   Real project facts/assets/links are required; do not invent them.
4. Deepen one notebook explanation when it improves the essay, retaining
   comfortable static reading and mobile composition.
5. Extend the edition backend only when it adds visible value.
6. Earn optional phone orientation with a worthwhile inspection view.
7. Prototype and review one strong C discovery independently.
8. Complete release qualification; deploy only when requested.

Each step's dependencies, files and acceptance gates are in
[the implementation plan](creative-v2-plan.md). Commit accepted work together
with its documentation. Future unselected experiments remain under `/samples`
and uncommitted until approved. That rule does **not** block the explicitly
authorized Living Atlas foundation commit. Stage related files deliberately.

Fresh promotion checks belong in [current validation](creative-v2-validation.md).
The earlier prototype measurements are historical comparisons until rerun on
public routes. Physical-device performance and field Web Vitals remain separate
from local/headless checks.

## Accepted foundation checkpoint

5 October: public `/` and `/blog` promotion completed, with inherited Work and
Elsewhere retained and legacy sample redirects verified. Build/types/lint, 20
tests and 54 browser records pass. The user explicitly requested commit and
push to the existing repository, then intends domain deployment for feedback.
Commit subject: `feat: promote Living Atlas homepage and notebook`. Next work
starts from feedback, real project/link content and documented device checks.

## Renderer hardening continuation

5 October: completed explicit context-loss disposal and a late-import rejection
guard. Full local production browser validation passes 57 records, including
three new failure/cleanup assertions; build, types, lint and 13 model/geometry
tests pass. Details and limitations are in current validation. Focused commit:
`fix: dispose ocean engine on context loss`. Physical-device qualification,
remaining lifecycle gates and authentic project/link content remain next.

## Production feedback — navigation and performance first

5 October: user reported the extra Writing click and production lag on iPhone
Air/Safari, also visible on MacBook Pro/Chrome despite smooth localhost. These take priority
over new project layouts, notebook features, sensors and C. Writing now routes
directly to `/blog`; its homepage publication section remains optional.
Touch/narrow startup uses a 21,600-triangle sea and a 360,000-pixel budget;
desktop retains 60,000 triangles/1.5 million pixels. Fixed wave constants are
prepared once, animation draw rate is bounded, and the slow-frame downgrade no
longer excludes sub-20-fps devices. Validation and exact limits belong in
`creative-v2-validation.md`; no physical-device improvement is claimed yet.

## Scroll-specific continuation

User clarified the lag appears when scrolling down through the sea reveal on
both devices. Current local work coalesces scroll updates with the GPU draw,
sets only affected opacity layers (instead of inherited scene variables), avoids
unchanged chapter/style writes, and hides the covered SVG fallback after a GPU
draw. Added programmatic and browser-gesture scrolling diagnostics. Actual
results, local/production revision distinction and physical limits belong in
current validation. This clarification supersedes idle-only smoothness checks.

## Current release state and next gate

5 October: all repo dev/preview servers stopped at user request (ports
3000/3001/3002/3004/3005 verified closed). Local `740b738` matches the tracking
reference; live Writing goes directly to `/blog` and phone viewport uses the
compact renderer. Fresh live browser-gesture diagnostics reach the drawing with
16.7 ms draw p95 and no observed long tasks; style work is 14.1/18.8 ms across
desktop/phone-viewport runs. No deploy or push performed in this turn.
Next gate is the user's updated production scroll result on Mac Chrome and
iPhone Air Safari, then a native trace if it still stutters. New features remain
lower priority. Headless results do not close physical-device acceptance.

## iPhone recording and scroll-priority scheduling

User supplied an 8.17-second Safari recording of continued iPhone Air stutter
on the latest build, while reporting Mac Chrome is much better. Reviewed decoded
frames across forward/reverse reveal and Safari toolbar expansion/collapse.
This does not identify GPU time, actual callback cadence or a confirmed browser
bug. Current fix removes the idle frame-budget gate from new scroll samples and
uses deadline-based idle pacing to avoid repeatedly skipping early/variable
callbacks. Idle animation budgets and compact resolution remain; fast scrolling
can draw at browser callback cadence. The recording, validation and remaining
physical acceptance are documented in current validation. No new features take
priority over this iPhone issue; local servers must be closed after temporary QA.
