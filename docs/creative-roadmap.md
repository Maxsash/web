# Sea, Ship, Math — creative roadmap

Last updated: 4 October 2026. This is the source of truth for creative work.
Read alongside [creative-validation.md](creative-validation.md), which records
what was actually checked. Update both at each logical checkpoint.

## Confirmed direction

- **A / Living Harbour:** the main website. An editorial harbour with a sea the
  visitor can influence, a ship they can steer, individual project treatments,
  and a chart of destinations. Keep content and navigation directly available.
- **B / Navigator's Notebook:** the blog. Mathematical field notes, annotated
  drawings, and small interactive explanations. Add two clearly labelled sample
  articles to establish the format; replace them with real writing later.
- **C / Pocket Voyage:** an optional Easter egg. A separately loaded sailing
  experience. Its eventual discoverable entrance and mechanics need review.
- **Soul:** Sea is the environment, Ship is agency, Math is the explanation.
  Reuse the generated integral-mast mark and the existing wave artwork.

These directions were selected by the user on 4 October 2026. Individual visual
and interaction choices still need review through working samples.

## Workflow and commit policy

1. Work in small, reviewable slices. Keep the plan, decisions, routes, remaining
   issues, and validation evidence current before each handoff or commit.
2. Commit the confirmed plan and stable, approved foundations at logical points.
3. **Do not commit exploratory UI or interactions before the user confirms the
   choice.** Keep alternatives available at separate `/samples/...` routes.
4. Each review should identify what differs, what to try on desktop/mobile, and
   the decision needed. Record the choice here before promoting it to `/`.
5. A route being implemented or a build passing does not establish visual,
   physical-device, accessibility, or performance acceptance. Track those
   separately. Do not claim checks that were not run.
6. A release commit should include the relevant documentation. Keep deployment
   separate from local implementation and review; no deployment is requested.

## Stages

| Stage | Deliverable | Acceptance / intended commit | Status |
| --- | --- | --- | --- |
| 00 | Confirmed direction, task list, review policy, validation log | `docs: record Sea Ship Math creative roadmap` | Complete |
| 01 | Production baseline and comparison gallery | Record sizes and reproducible checks; gallery stays uncommitted while choices are open | Next |
| 02 | Two A hero samples: wind influence and direct helm | User chooses input/visual behaviour before integration and commit | Planned |
| 03 | B blog index and two sample articles with small mathematical interactives | Review readability, mobile layout, and explanation design; then `feat: add navigator notebook blog` | Planned |
| 04 | Chosen A hero on `/`, touch, keyboard, optional tilt | Verify scene boundaries and physical phone behaviour; then `feat: bring the harbour to life` | Planned |
| 05 | A project shipyard: distinctive previews and inspection | Requires real project content; review before `feat: add project shipyard` | Planned |
| 06 | A port chart, active navigation, noon/dusk choice, footer | Review alternatives and keyboard/mobile behaviour; commit accepted features separately | Planned |
| 07 | C sailing prototype, then hidden discoverable entrance | Review game and entrance; then `feat: add pocket voyage easter egg` | Planned |
| 08 | Full production, responsive, accessibility, and performance pass | Record results and remaining limitations before release checkpoint | Planned |

Stages 02 and 03 can be previewed together because they use independent routes.
Do not implement every optional flourish in the first iteration.

## First review slice

- [ ] Capture a production asset-size baseline before code changes.
- [ ] Create `/samples` as a central, noindex review gallery.
- [ ] Create `/samples/harbour/wind` for gentle pointer/touch wind influence.
- [ ] Create `/samples/harbour/helm` for more direct ship steering.
- [ ] Share one water-following controller rather than competing animation loops.
- [ ] Add accessible controls, pause/recenter, reduced motion, and bounded motion.
- [ ] Add optional orientation input only after a visitor explicitly enables it.
- [ ] Create `/blog` in the Navigator's Notebook direction.
- [ ] Add `/blog/three-waves-one-sea`, a labelled sample about wave composition.
- [ ] Add `/blog/an-integral-under-sail`, a labelled sample about the generated mark.
- [ ] Connect the homepage Writing entries to the two sample articles.
- [ ] Create `/samples/voyage`, a standalone playable C concept.
- [ ] Keep the final C entrance unselected until the user reviews it.
- [ ] Run lint, type checking, a production build, and relevant geometry checks.
- [ ] Verify route responses and record initial asset-size comparison.
- [ ] Review desktop/mobile captures and record unverified hardware checks.
- [ ] Give the user working links; leave experimental code uncommitted.

## Interaction specifications

### A: responsive harbour

- Pointer, horizontal touch drag, keyboard controls, and optional phone tilt
  should drive the same bounded input model. Text and horizon remain stable.
- Wind sample: a soft directional influence that settles when released.
- Helm sample: a direct ship position, making the visitor's control clearer.
- Keep the keel attached to the rendered foreground surface. A steering offset
  must be included when measuring the water under the ship.
- Keep controls outside the current `aria-hidden` decorative sea.
- Preserve vertical scrolling and pinch zoom over the scene, including handling
  pointer cancellation. Retain native links and focus indicators.
- Tilt uses relative device orientation, feature detection, explicit permission
  when required, calibration, bounded/smoothed input, and touch fallback.
- Pause offscreen/hidden work; provide an explicit motion pause. Reduced motion
  provides a stationary sea and immediate, finite input changes.
- Investigate wave rates without phase jumps. First samples can retain ambient
  wave timing while varying ship influence; document this approximation.

### B: navigator's notebook

- Server-render titles, summaries, article bodies, metadata, and navigation.
- Preserve the current three typefaces and palette. Use diagrams, paper rules,
  marginal annotations, and spacious reading measures rather than added fonts.
- Every article should be readable without operating an interactive.
- Sample articles are clearly identified as layout/content samples and noindex.
  Explain real existing geometry; do not invent biography or project claims.
- Use native labelled sliders/buttons and SVG. Keep finite illustrations idle
  until input. Separate continuous animation controls from article reading.
- Start with two posts; no CMS or MDX dependency is needed for this slice.

### C: pocket voyage

- A compact, optional 2D nautical game with visible course and a destination.
- Start explicitly, pause when hidden/offscreen, reset, and exit easily.
- Mouse/touch/keyboard should work independently of sensors.
- Keep code out of the homepage bundle and avoid prefetching the game there.
- Candidates for the eventual entrance: the footer sextant or a small unusual
  mark on the port chart. The entrance needs an accessible name and focus state.

## Performance guardrails

These are proposed budgets, not measurements or guarantees:

- A: added initial JS <= 15 KB gzip and CSS <= 5 KB gzip versus the baseline,
  including any dependencies. Keep the hero vector-based.
- B: interaction JS on article routes only; optional deeper workbench <= 30 KB
  gzip. Keep article text statically renderable.
- C: its own route/activation boundary; no game code loaded by a normal homepage
  visit. Set the game budget after the first playable prototype is measured.
- One shared hero animation loop, no React state updates every animation frame.
- Explicitly pause CSS animation as well as JavaScript offscreen/when hidden.
- Aim for interaction JS < 3 ms/frame on an agreed reference phone. Profile the
  2,049-point startup sampling, geometry reads, shadows, and compositing layers.
- Preserve content/space during hydration and deferred loading. Audit existing
  fonts before adding assets.
- Field goals: p75 LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1, separately for mobile
  and desktop. Lab asset counts/builds are not field measurements.

The installed Next 16.2.9 guides are authoritative. `params` are promises;
deferred client modules must be loaded from a suitable client entry to achieve
the intended code splitting.

## Content and remaining dependencies

- Real projects, individual visuals, and real Visit/Source links are still needed.
- Personal-site URL and resume destination need correction/confirmation.
- Replace sample blog articles with authored writing when available.
- Choose wind versus helm (or request a blend) after using both samples.
- Choose the C entrance after the standalone game and chart design are reviewed.
- Physical iOS/Android sensor feel, battery behaviour, and field Web Vitals remain
  separate acceptance gates.

## Research and rationale

- [Naval Architecture](https://ciechanow.ski/naval-architecture/) and
  [Curves and Surfaces](https://ciechanow.ski/curves-and-surfaces/): reveal geometry
  and physical relationships through manipulation.
- [Bruno Simon](https://bruno-simon.com/): agency through a vehicle; inspires C.
- [Unseen Studio case studies](https://tympanus.net/codrops/2026/07/20/the-craft-behind-memorable-digital-experiences-inside-unseen-studio/):
  subject matter can become the interface.
- [Tomasz Szmajda](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/):
  pointer and phone orientation can be alternative inputs.
- [Matsuoka's water experiments](https://tympanus.net/codrops/2025/02/26/webgpu-fluid-simulations-high-performance-real-time-rendering/):
  water response is compelling; real fluid simulation has a different cost.
- [Orientation permissions](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static),
  [touch action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action),
  [animation performance](https://web.dev/articles/animations-guide), and
  [Web Vitals](https://web.dev/articles/vitals): input and validation constraints.

## Decision and checkpoint log

| Date | Decision / checkpoint | Commit state |
| --- | --- | --- |
| 2026-10-04 | User selected A for main website, B for blog with two sample posts, C as an Easter egg. | Confirmed direction |
| 2026-10-04 | User requested current repository documentation, logical commits, and uncommitted review samples before choosing experiments. | Confirmed workflow |

## Next handoff

First handoff should provide the gallery, both harbour variants, blog and article
links, and the standalone voyage prototype. Ask for the user's selection only
after those routes are usable. Record the choice, integrate the accepted version,
and commit its code and documentation together.
