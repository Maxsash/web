# Sea, Ship, Math — active roadmap

Updated: 5 October 2026. **The user approved Living Atlas A/B as the foundation,
requested promotion to the actual homepage/blog, and explicitly authorized a
commit.** This approval covers the foundation. It does not mean every planned
feature, real project content, or physical-device qualification is complete.

Start with [the handoff](creative-v2-handoff.md), then the
[ordered implementation plan](creative-v2-plan.md) and
[current validation](creative-v2-validation.md). The
[brief](creative-v2-brief.md) preserves the creative standard.

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
claimed. Deployment has not been requested.

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

1. **Current authorized checkpoint:** promote approved A/B to `/` and `/blog`,
   preserve useful main-site sections, redirect old review URLs, validate public
   routes, update docs and commit the coherent foundation.
2. Qualify renderer/fallbacks on named physical phones; refine measured quality
   tiers and accessibility from actual evidence.
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
