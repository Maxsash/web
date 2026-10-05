# Sea, Ship, Math — implementation plan after the creative reset

Updated: 5 October 2026. Status: **Living Atlas A/B approved as the foundation;
public-route promotion and commit explicitly authorized**. Final promotion check
results belong in `creative-v2-validation.md`; the commit record is in the handoff.

This is the ordered plan for continuing without the conversation. It separates
what exists from what is proposed. Read the repository `AGENTS.md`,
[`creative-roadmap.md`](creative-roadmap.md), and
[`creative-validation.md`](creative-validation.md) before changes. The latter
indexes [current v2 validation](creative-v2-validation.md); no unchecked gate in
this plan is a result.

## 1. Decisions that must survive a handoff

1. The user rejected review set 01. Do not ask them to choose Wind versus Helm
   again. The notebook felt unchanged and the explicit controls felt too simple.
2. The creative standard is much higher: beautiful immediately, impressive to a
   casual visitor, and coherent enough to reward technical inspection. Avoid
   adding user effort without a substantial visible consequence.
3. The roles remain **A = main website; B = blog/publication; C = optional
   discovery/Easter egg**. The rejected implementations are not the approved
   meaning of those roles.
4. The current direction is **The Living Atlas**: a sea becomes its own drawing
   through ordinary scrolling. B is a distinctly composed engraved publication.
5. The user first authorized a working prototype and isolated headless Chrome
   QA. On 5 October they explicitly approved Living Atlas A/B as the foundation
   and requested its actual homepage/blog promotion, updated docs and a commit.
   Complete that authorized checkpoint without asking for the same approval again.
6. Future unselected explorations stay under `/samples/...` and uncommitted until
   selected. The accepted foundation belongs at `/` and `/blog`, with its related
   code, tests and documentation committed together. Foundation approval is not
   approval of every future sensor, backend, project or C experiment.
7. Keep performance proportional to the result. A tiny bundle alone is not a
   successful design; a spectacular desktop recording alone is not a mobile
   performance result.
8. Documentation must carry the full task state, including rejected choices,
   exact contracts, route map, evidence, known limits, and the next bounded task.

## 2. Approved foundation: exact scope

### Routes that exist

| Route | Implemented purpose |
| --- | --- |
| `/` | A: native-scroll scene from shaded water to an engineering-style drawing; introduction, retained Work/Elsewhere, edition explanation and notebook threshold |
| `/?seed=27c4b901` | Same scene, another reproducible authored edition; default seed is `5ea5cafe` |
| `/blog` | B: oversized upright publication masthead, warm bone/ink/vermilion palette, engraved sea plate, inverse dark mark spread, two sample essays |
| `/blog/three-waves-one-sea` | Sample essay explaining the implemented six-wave sea, shared derivatives and printed edition; the inherited slug is retained |
| `/blog/an-integral-under-sail` | Sample essay about the generated integral-mast brand mark, presented as a publication article |
| `/api/sea-edition?seed=5ea5cafe&version=1` | Deterministic authored coefficient JSON with validation, caching headers and ETag |
| `/api/sea-edition/print?seed=5ea5cafe&version=1` | Deterministic SVG plate from the same coefficients at scene time zero |

The approved foundation now targets the real homepage and blog. The homepage
retains Work and Elsewhere access while adopting the Living Atlas scene, edition
explanation and publication threshold. Two essays remain labelled samples.
`/samples` is the approved-foundation index. Old `/samples/observatory` and
`/samples/atlas` URLs, including article paths, redirect to public counterparts;
verify query/slug preservation as part of promotion QA.

The rejected first blog, harbour and voyage implementations were removed during
the 5 October cleanup. The new `/blog` is the accepted Atlas presentation. The obsolete original-home Hero/Sea/Wordmark/Writing/footer components and
their unused styles have also been retired after checking consumers. Work and
Elsewhere remain. The old SVG-home browser harness was removed; the generated
mark/wave artwork and their useful generator/cover consumers remain. Public integration is a foundation checkpoint, not completion
of real project spreads, the final port chart or the entire creative roadmap.

### What the implementation actually does

- The scene uses a native WebGL2 renderer, procedural geometry and shaders. No
  Three.js, physics engine, 3D model download, new font or texture library was
  added for v2.
- The client boundary defers importing the engine. The server-rendered SVG plate
  and HTML remain available around/under the canvas.
- Ordinary scrolling changes camera/material appearance and text choreography.
  It does not replace the browser's scroll physics.
- One six-wave authored height field supplies water geometry and CPU samples
  used for ship height/attitude. The notebook plate and export use that field at
  `t = 0`. Fine visual ripples, light and wake are rendering approximations.
- The procedural 3D sailboat is a visual vessel. It is not an exact extrusion of
  the generated integral-mast brand mark. The real mark remains in branding and
  the notebook construction plate.
- Desktop pointer movement introduces restrained viewing variation. There is
  an explicit pause/resume button. Offscreen/hidden rendering is suspended;
  reduced motion uses finite still drawing changes instead of continuous time.
- Context creation failure has a printed fallback. Context loss exposes the
  fallback; do not claim full context-restoration recovery unless code and tests
  later establish it.
- B's page composition and figures are server-rendered. The current B articles
  are readable static essays; no new article slider, lens or scroll-scrubbed
  construction has been implemented.
- The server endpoints produce authored editions and printable SVGs. They do
  not fetch observations, forecasts, visitor data or external content.

### Specifically not implemented

- No new accelerometer/device-orientation feature in v2.
- No wave disturbance from a finger, pressure impulse, buoyancy solver, FFT
  ocean, fluid simulation, underwater caustic system or physically traced optics.
- No observation ingestion, daily scheduler, edition database or live sea state.
- No redesigned project spreads, real project-content replacement or final port
  chart. Homepage/blog foundation promotion is authorized and part of the current
  checkpoint; these richer whole-site treatments remain next-stage work.
- No new C experience or hidden entrance. The old mini-game is not the chosen C.
- No physical iOS/Android quality, thermal, battery or sensor acceptance.
- No production field Web Vitals result or deployment.

Do not make marketing copy imply any of these features exists.

## 3. The v1 field contract — authoritative implementation

`lib/sea-edition.ts` is the shared source. The richer proposal in
`research/creative-engineering-v2.md` is **not** the current schema.

```ts
type SeaWave = {
  amplitude: number;
  wavelength: number;
  direction: number; // radians from +x toward +z
  phase: number;
};

type SeaEdition = {
  version: "1";
  seed: string;      // canonical eight lowercase hexadecimal characters
  kind: "authored";
  waves: SeaWave[];  // six waves in the current generator
};

type SeaSample = { height: number; dx: number; dz: number };

createSeaEdition(seed = "5ea5cafe"): SeaEdition;
sampleSea(edition, x, z, time): SeaSample;
renderSeaPlate(edition): string;
normaliseSeaSeed(input): string | null;
```

Coordinates are `x/z` horizontal, `y` up; physical-scale units are metres and
seconds. Direction is angular, not a stored vector. Normal vectors are derived
by the caller; `sampleSea` does not return a `normal` member.

For each component, `k = 2π / wavelength`, `ω = sqrt(9.81 k)`, and
`θ = k(cos(direction)x + sin(direction)z) − ωt + phase`. Height is the sum of
`amplitude × sin(θ)`. `dx` and `dz` are its analytic partial derivatives.

The generator uses a deterministic 32-bit PRNG. Its baseline wavelengths are
`14, 8, 4.5, 2.5, 1.2, 0.65`; baseline amplitudes are
`0.55, 0.32, 0.16, 0.085, 0.04, 0.02`, with seeded variation. Coefficients are
rounded to eight decimal places. `00000000` is a valid seed.

The seed and version identify a repeatable authored sea. **Do not change the
PRNG, coefficients or interpretation of an existing version silently.** Either
preserve v1 or introduce a new model version and retain the ability to render
shared v1 links. Scene time is animation time, not observation UTC time.

The research schema proposes IDs, units in names, source/provider/time metadata,
raw observations, quality tiers, multi-point hull sampling and other fields.
They must not be added merely to make the implementation resemble the proposal.
Introduce them only when an approved feature needs them, with tests and version
handling that preserve existing links.

## 4. File map for the next implementer

| Area | Files | Responsibility |
| --- | --- | --- |
| A page / art direction | `app/page.tsx`, `components/observatory/Observatory.module.css` | Readable HTML, composition, native scroll chapters, edition and notebook links |
| A lifecycle | `components/observatory/OceanScene.tsx` | Engine import, input, scroll progress, visibility, resize, reduced motion, pause and fallback |
| A graphics | `components/observatory/ocean-engine.ts`, `ocean-shaders.ts` | Camera, procedural mesh, water/ship/sky drawing and resource disposal |
| Shared mathematical state | `lib/sea-edition.ts` | Seed/version contract, coefficient generation, analytic samples, export SVG |
| B routes | `app/blog/layout.tsx`, `page.tsx`, `[slug]/page.tsx` | Publication chrome, index, sample articles and metadata |
| B figures / styles | `components/atlas/Atlas.module.css`, `OceanPlate.tsx`, `MarkPlate.tsx` | Distinct printed art direction, server-rendered shared-field plate, original-mark plate |
| Current sample content | `content/notebook.ts` | Canonical v2 titles, prose, captions and margin notes; static essays with no obsolete slider instructions |
| Legacy review links | `next.config.ts`, `app/samples/page.tsx` | Old sample URL redirects and the approved-foundation index |
| Edition endpoints | `app/api/sea-edition/route.ts`, `print/route.ts` | Parameter validation, authored JSON/SVG, caching and deterministic representation |
| Browser evidence | `tools/check-creative-v2.mjs`, ignored `tools/.out/creative-home/` | Isolated headless captures and actual recorded browser assertions |
| Geometry / payload | `tools/sea-edition.test.mjs`, `sea-api.test.mjs`, `sea-gpu-probe.mjs`, `geometry.test.mjs`, `measure-routes.mjs` | Mathematical regression checks, original mark geometry, route asset inventory |

Read the relevant installed Next 16.2.9 guides in `node_modules/next/dist/docs/`
before changing route, rendering, metadata or cache behaviour. In particular,
route `params`/`searchParams` are promises. Do not “fix” this to older Next
examples. CSS for B stays scoped; do not force its ink/paper tokens onto A.

## 5. Ordered continuation

### Checkpoint 0 — approved foundation promotion and commit

**Status:** completed on 5 October in `6adbb9a`, with the accepted checkpoint
recorded in `5eddf76`. Public-route QA evidence is in the validation document.

Tasks in this checkpoint:

1. Serve the accepted Living Atlas at `/`; retain direct Work, notebook and
   contact/Elsewhere access. Do not discard the real site's useful sections to
   leave only an isolated graphics demonstration.
2. Serve the accepted publication at `/blog` and both sample essay paths. Keep
   sample labels, readable server-rendered text and appropriate noindex metadata.
3. Redirect the former observatory/atlas review URLs to their public counterparts.
   Preserve an edition's seed and an article's slug; verify the actual responses.
4. Keep `/samples` as an approved-foundation index and a place for future
   alternatives. It should not describe the accepted design as awaiting approval.
5. Remove only obsolete components with no remaining consumers. Preserve the
   shared mathematical model, original mark, useful artwork generators and tests.
6. Run fresh production checks against `/` and `/blog`, including retained
   section navigation, edition APIs and the compatibility redirects. Earlier
   sample-route evidence is useful history, not proof of the promoted routes.
7. Update roadmap, brief, plan, handoff, README and validation, then commit the
   accepted foundation and its related tests/docs. Stage explicit related files.
   The user has already authorized this commit; no renewed permission is needed.

**Complete when:** the public routes and redirect checks pass, known limitations
remain explicit, documentation matches the implemented scope, and the actual
foundation commit is recorded. No deployment is part of this authorization.

### Checkpoint 1 — refine the accepted art direction

**Status:** the A/B foundation is selected. Follow-up refinements build on it;
they are not a reason to hold the authorized foundation promotion/commit.

Tasks, driven by actual feedback and observations:

1. Refine composition, lighting, scale, camera, timing or hierarchy within the
   accepted direction. Put materially different alternatives under `/samples`
   and keep them uncommitted until selected.
2. Make the relationship between integral branding and procedural ship a
   deliberate decision. The current vessel is not an exact extrusion of the mark.
   Possible later treatments include a mark on its sail or a recognisable
   integral-mast interpretation; those choices remain open.
3. Compress any scroll stretch where no useful visual or editorial change occurs.
   Content links remain direct and keyboard reachable.
4. Keep the ship clear of title/copy at all target widths. Fine details support
   a strong silhouette rather than replace it.
5. Preserve B's distinct masthead, plate scale, density, margins and colour.

**Done when:** the specific refinement addresses its stated problem and passes
fresh layout/motion checks. Record any newly selected alternatives and commit
accepted work with updated evidence. The broad A/B choice is already settled.

### Checkpoint 2 — harden renderer and graceful states

**Depends on:** the selected foundation. Some local lifecycle and parity checks
already passed; consult current validation before repeating them. Physical-phone
and deeper recovery/quality work remain open after the foundation commit.

5 October continuation: focused context-loss disposal and late-import rejection
hardening, with new browser assertions for cleanup, stopped drawing and forced
shader-link failure. This does not implement context restoration or qualify
physical devices; actual outcomes belong in current validation.

Tasks in this order:

1. Profile the actual current mesh and draw count. The foundation currently uses
   a denser surface than the proposed lean/standard research tiers; do not claim
   those tiers already exist. Establish what density is visibly necessary.
2. Verify compile/link failure, missing WebGL2, context loss, reduced motion,
   explicit pause, tab hiding, offscreen suspension, route navigation and resize.
3. If recovery is needed, implement context restoration from the immutable
   edition with bounded retry. Release old resources; repeated failure keeps
   the designed fallback. Do not obscure content behind an error panel.
4. Add measured resolution/geometry tiers only as required. Current adaptation
   adjusts resolution based on delivered frames; it is not GPU timing or a fully
   qualified device-tier policy. Avoid user-agent or GPU-brand assumptions.
5. Validate CPU/shader agreement at sampled points and derivative correctness.
   If adding multi-point hull support or response smoothing, retain the same
   field and test bounds/continuity; call it an approximation, not buoyancy.
6. Make reduced motion and no-JS layouts independently good. A fallback must
   look intentional; it is not acceptable merely because it prevents a crash.

**Commit boundary:** the current renderer and shared field belong in the
authorized foundation commit. Later hardening gets focused commits with tests
and evidence. Keep dependent page/design changes together when separating them
would produce a broken or misleading intermediate state.

### Checkpoint 3 — deepen the public notebook

**Foundation status:** the accepted Atlas presentation is promoted to `/blog`
with two sample essays as part of checkpoint 0. Migration is no longer awaiting
creative approval. These tasks deepen that publication after the foundation.

1. Keep article metadata, semantic headings, known-slug handling, accessible link
   names and logical reading order. Sample articles remain clearly labelled and
   noindex until real authored writing is ready.
2. Maintain canonical article copy/figures in `content/notebook.ts` and focused
   components. Do not add a CMS/MDX dependency until authoring needs justify it.
3. Develop one richer explanatory plate only if it improves the argument:
   finished surface → separated wave contribution → local slope/normal → same
   surface reunited. Preserve marked probe/crest identity between stages.
4. Provide direct finite stage controls and readable static frames. Desktop may
   use a sticky figure; mobile uses full-width plates in reading flow when that
   is more legible. Do not pin paragraphs behind a canvas.
5. Replace samples with actual authored essays when available. Decide indexing
   and canonical publication metadata from the real content, not layout status.

**Done when:** the selected improvement reads comfortably at 320/390 px and 200%
text, keyboard/screen-reader order is sensible, and optional diagram work
respects the B budget. No tutorial is required to read an essay.

**Commit:** focused accepted publication improvements with docs and evidence.

### Checkpoint 4 — redesign the whole main-site journey

**Foundation status:** accepted A is promoted to `/` with Work and Elsewhere
retained, plus the edition and publication sections. The foundation is not the
complete project portfolio or final treatment of every section.

1. Preserve direct Work, notebook and contact access while refining the journey.
2. Replace equal placeholder cards with project spreads/plates. Each real
   project needs: name, useful one-sentence purpose, owner-approved facts, status,
   screenshot or authentic behavioural demo, and working Visit/Source links.
3. Ask for missing real project content when this stage is reached. Continue
   independent layout work with clearly labelled specimens; never invent
   clients, shipped products, adoption metrics or results.
4. Alternate visual rhythm based on content: one dominant project plate plus
   concise technical caption, then a compact secondary entry. Do not force
   every project into a bespoke graphics engine.
5. Make the writing threshold visually announce B's different publication world.
6. Turn Elsewhere into a compact route/port composition if it materially helps
   scanning. Preserve ordinary links and their text-list equivalent on mobile.
   Do not assign fictional geographic coordinates to destinations.
7. Verify résumé and personal-site destinations; remove dead `#` project links.
8. Finish footer/colophon and light/dark art direction deliberately. The current
   Atlas proof is intentionally bone/ink even under OS dark preference; a future
   dark publication needs an explicit design decision, not automatic inversion.

**Commit boundaries:** the current home/blog integration belongs to the
authorized foundation commit. Later authentic project spreads and final
port/footer treatments get their own accepted, coherent commits and evidence.
Do not reintroduce rejected v1 experiments as incidental staged content.

### Checkpoint 5 — qualify the useful backend

**Current value:** a reproducible authored sea, inspectable coefficients and a
vector keepsake already exist. They are part of the accepted foundation; richer
data infrastructure remains optional future work.

Before extending it:

1. Test canonical seed normalization, invalid/repeated parameters, version
   rejection, deterministic payload/export bytes, ETag/304 and cache semantics.
2. Decide how to retain immutable versioned editions across future changes.
   Do not give cacheable v1 URLs different meanings after a deployment.
3. Profile SVG generation cost and output size; bound accepted input. There are
   no arbitrary complexity controls in the current API, and that is useful.
4. Ensure exported metadata clearly says authored study and identifies seed,
   model version and scene time. No fictional station or observation timestamp.

**Optional next step, requiring a visible product reason:** real-observation
editions. Choose one trustworthy source/site only after reading provider terms
and measurement definitions. Fetch on a schedule, validate units/ranges, retain
provenance and last-good data, derive compact art-directed coefficients, cache
the edition, and preserve an authored fallback. The homepage must never wait
for an upstream observation fetch. Label observations versus forecasts versus
art-directed transformations accurately.

**Do not build yet:** public visitor trails, multiplayer, accounts, leaderboards,
generative copy or analytics displays just to make the backend sound complex.

### Checkpoint 6 — earn the mobile sensor interaction

**Depends on:** a compelling nonsensor mobile experience and successful physical
phone performance checks. No permission request appears on initial page load.

Prototype one optional instrument view where tilt reveals an appreciable depth
or optical relationship. Relative `DeviceOrientationEvent` may be the suitable
input; “accelerometer” is the user's inspiration, not a requirement to integrate
raw acceleration into unstable position estimates.

Requirements:

- Explicit activation; synchronous gesture-bound permission request where the
  platform requires it. HTTPS/secure context in physical-device tests.
- Calibrate neutral from a valid reading, smooth and clamp changes, handle
  portrait/landscape correctly, and make recalibration discoverable.
- Text/navigation stay stable. The world/view changes within a bounded scene.
- Denial, missing events, background/offscreen state, reduced motion and exit
  all have defined behaviour. Unsubscribe sensors while inactive.
- Equivalent tap/drag/keyboard controls expose the same meaningful information.
  Touch interaction preserves vertical scrolling and pinch zoom.
- Do not add it if the final response feels like a minor parallax trick after
  asking for a privileged input. The rich visual consequence is the gate.

**Commit:** only the selected, physical-device-qualified enhancement with docs.

### Checkpoint 7 — C: one brief discovery with a payoff

**Depends on:** the normal website works fully without it. The rejected voyage
prototype was removed and is not a required foundation.

Choose one of the researched directions with a static storyboard and a short
proof before expanding scope:

1. **Celestial observatory:** align an instrument/horizon or expose a hidden
   frequency relationship until an unexpected image/route resolves. Provide
   accessible clues and a finite reveal alternative.
2. **Wake atlas:** sketch a route and turn its geometry into a coherent engraved
   wake/interference keepsake. A shareable deterministic record is useful here;
   persistent accounts or global social systems are not automatically needed.

The reveal should fit a deliberate short experience, around 30–90 seconds in
initial storyboards. Time is a creative target, not a forced timer. There is an
obvious exit. No control tutorial is required for ordinary portfolio navigation.

Only after the payoff succeeds, choose an accessible entrance in the footer or
chart. Do not hide the only path from keyboard/screen-reader users. C has its own
loading boundary and must not be prefetched on ordinary main/blog visits.

**Commit:** selected C and entrance together after its own review and budgets.

### Checkpoint 8 — cleanup, release qualification and later observation

1. Completed on 5 October: removed rejected v1 UI, unused helpers/CSS and
   obsolete sample links at the user’s request. Keep later experiments similarly
   bounded and preserve concise rejection records in docs.
2. Check the actual public route bundle graph, including lazy chunks and CSS
   merging. A static HTML-referenced asset report alone omits deferred runtime
   requests, so pair it with cold-load browser network evidence.
3. Complete the matrix below on production builds. Record devices, OS/browser,
   date, route, mode and limitations with traces/captures.
4. Commit accepted release-ready changes at logical points. Deployment remains
   a separate action; this task has not requested publication to a host.
5. After an authorized release, collect real field Web Vitals before making
   population claims. Keep lab and field evidence separate.

## 6. Performance and experience gates

These are working ceilings/targets, not automatically measured achievements.
The v2 research proposes spending more than the old v1 motion budget because
the signature effect is materially different. Keep the original baseline and
record both the comparison and every revised target in the active roadmap.

| Area | Gate |
| --- | --- |
| A added JS | Start with ≤35 KB gzip over the original production homepage, counting the deferred engine actually requested during a normal visit |
| A added CSS | Start with ≤8 KB gzip over the original baseline; account for Next's shared CSS behaviour |
| Font additions | None for this direction unless a later measured/approved typographic need justifies one |
| Initial fallback | Aim ≤80 KiB for gzip initial HTML including fallback, dimensions reserved; optimize the inline/static SVG representation and count HTML/RSC duplication |
| B | Reading and index remain server-rendered; no GL engine merely to view the publication; optional deep figure code ≤30 KB gzip as an initial target |
| C | Separate load; starting optional-code ceiling ≤100 KB gzip plus explicit asset accounting; no C request during normal A/B visits |
| Main thread | Aim animation work p95 ≤2 ms/frame on an agreed reference phone, excluding unrelated browser work; capture how it was measured |
| Frame cadence | Aim ≥95% of frames within the selected 30/60 fps cadence over a 30-second visible interaction on that device |
| GPU | If a supported nonblocking measurement is available, aim p95 ≤8 ms/frame; otherwise report the limitation instead of inventing a value |
| Inactive | No continuous scene frame loop or GL drawing while paused/offscreen/hidden; no active optional sensor subscription |
| Content | Lab regression checks, then field p75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 after release |

Resolution, fine shading detail and mesh density are the first knobs to reduce.
Keep shared-field continuity, readable type and ship silhouette. A bad frame
rate is not redeemed by lower JavaScript transfer size. A headless screenshot
with a desktop GPU does not qualify sustained mobile GPU work or battery cost.

## 7. Verification matrix and review evidence

Before accepting an implementation, record pass/fail/unverified for:

- Layout: 320, 390, 768, 1024 and 1440 px; mobile landscape; 200% text; long copy;
  light/dark preference; safe areas. Inspect whole pages as well as first views.
- Scene: sea/reveal/drawing identity, ship visibility, pointer behaviour, native
  scroll, pause/resume, finite reduced-motion changes and absent-JS composition.
- Lifecycle: hidden/offscreen suspension, route navigation/disposal, resize,
  context creation failure, compile/link failure, loss and any supported recovery.
- Reading: keyboard order and focus, headings, link names, screen-reader reading
  order, contrast, touch target sizes, article measure and diagrams at small sizes.
- API: deterministic coefficients/export, seed/version validation, cache headers,
  ETag handling, safe SVG content and bounded generation work.
- Devices: at least one physical iOS Safari and one midrange Android Chrome on
  HTTPS for motion/sensor evaluation. Name actual hardware; do not call viewport
  emulation “tested on mobile.” Include a sustained 30-second scene run.
- Runtime/network: cold and warm production loads; deferred engine/request
  inventory; execution/long-task and rendering traces; no unnecessary optional
  route prefetch; fallback visible while initialization proceeds.

Useful existing commands (record the actual server/base URL and outcomes):

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build
node --test tools/sea-edition.test.mjs tools/geometry.test.mjs
SEA_TEST_BASE=http://localhost:3001 node --test tools/sea-api.test.mjs
node tools/measure-routes.mjs --output=tools/.out/creative-home/static-assets.json
node tools/check-creative-v2.mjs http://localhost:3001
git diff --check
```

The browser script's `--quick` option is a limited capture subset. It must not
be reported as the full matrix. The current script creates an isolated browser
profile; the user's existing browsing session is unrelated to these tests.
Only the actual assertions in the script are automated checks. Inspect captures
visually as well; “no overflow” is not a composition review.

## 8. How to continue with a smaller model/context window

At the beginning of a new work session:

1. Read this document and the active roadmap/validation/handoff documents.
2. Read `git status --short`; distinguish preexisting uncommitted experiments
   from the current task. Do not reset, commit, or mass-stage that tree blindly.
3. Preserve the latest explicit decision: on 5 October the user approved the
   Living Atlas A/B foundation, public promotion and commit. Do not ask again.
   Read the handoff commit record to determine whether that checkpoint is done.
   Future unselected alternatives still belong under samples and remain uncommitted.
4. Read the actual files listed for that task and relevant installed Next docs.
   Do not rebuild the app from the research prose or assume proposed APIs exist.
5. Take one bounded checkpoint. Run checks appropriate to what changed, record
   new evidence and remaining gaps, and update the next action before handoff.
6. For any geometry/model modification, preserve edition version behaviour and
   explain the exact approximation. For any visual change, take fresh desktop
   and mobile captures. For sensors, keep the physical-device gate explicit.

At each handoff, write these six facts: **user decision; current route; files
changed; checks actually run; known limitations; next bounded task**. Include
the local server command/port and commit state when relevant. A list of generic
aspirations is not a sufficient handoff.

The foundation checkpoint is complete. Follow the current bounded task in the
handoff: renderer lifecycle hardening, then physical-device qualification and authentic
project/content work, with further creative choices reviewed independently. Do
not restart broad research, resurrect the old steering choice, or treat sensors,
live data and C as prerequisites for committing the already approved foundation.
