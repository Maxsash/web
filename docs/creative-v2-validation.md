# Living Atlas — validation and limitations

Updated: 5 October 2026. The user **approved the foundation**, requested its
promotion to `/` and `/blog`, and explicitly authorized commit and push.
Physical-device and field-performance acceptance remain separate.

## Latest checkpoint — three mobile stages

The user requested merging Waves and Structure because they looked too similar.
Started clean at `de12187`, matching `origin/main`. The selected flow is now
**Sea → Structure → Drawing**, at progress **0 / .55 / 1**. The combined middle
stage shows contours and vessel construction together. Two upward swipes reach
Drawing; the next gesture scrolls natively into Work. Desktop remains continuous.
The bounded 420 ms transition, reverse gestures, accessible controls, reduced
motion and no-JS behavior retain the preceding contract.

Changed `OceanScene.tsx`, gesture assertions and active documentation. Production
build (including TypeScript), lint, harness syntax and diff checks pass. The first
sandboxed build stalled and was terminated; the permitted retry completed.
Fresh full browser report: `tools/.out/creative-home/report.json`,
`2026-10-05T12:59:29.118Z`, temporary `http://localhost:3006/`.
**81 records pass: 40 captures, 40 assertions and one cadence run**, with no
runtime exceptions, GL errors or detected overflow. Actual dispatched swipes
advance 0→1→2 with exact three-stage labels and no page movement. Final native
exit, reversal to Structure, reduced-motion controls and fine-pointer continuous
desktop all pass. Visually inspected the 390 px Structure and Drawing captures:
readable copy, distinct states and reachable controls. The full matrix also
covers desktop, narrow/landscape, fallback and no-JS layouts.

Temporary QA server stopped via EXIT trap. No push or deployment. Commit subject:
`refactor: simplify mobile sea to three stages`. Physical iPhone Air Safari
smoothness, VoiceOver, rotation-session and real pinch zoom remain unqualified;
next step is deploying and checking this three-stage flow on that device.

## Previous checkpoint — four mobile stages

User explicitly requested mobile gesture stages and unchanged continuous
desktop scrolling. This authorizes the change at `/`; no exploratory sample or
further selection is required. Started clean at `39d5b42`, matching the local
tracking reference. No push or deployment in this turn.

`OceanScene.tsx` implements four states: Sea (0), Waves (.42), Structure (.68),
Drawing (1). A predominantly vertical >=35 px swipe advances one state; a
bounded 420 ms ease replaces finger-momentum/camera coupling. Reduced motion
uses immediate stills. Sea animation still respects pause, visibility and idle
budgets. Three upward swipes reach Drawing; another upward gesture uses native
page scrolling into Work. Back swipes reverse one stage when at scroll top;
partly scrolled content remains native, so returning from Work is not trapped.

Primary `(pointer: coarse)` selects mode at mount, not user-agent or width alone.
Fine-pointer desktop retains existing continuous reveal/camera equations and
255svh story. Staged hero uses one 100svh viewport. Scoped CSS adds a polite live
stage label and Previous/Next buttons; final Next becomes View work. Existing
navigation/skip remain direct exits. Listeners ignore links/buttons/inputs,
horizontal gestures and multitouch. A non-passive touchmove listener consumes
only in-range hero stage gestures. No global scroll lock, wheel override,
browser setting or dependency. No-JS keeps native-scroll server content and
plate. GL failure does not disable the independent stage controls.

Completed build (includes types), lint, browser script syntax and diff checks.
Full local report: `tools/.out/creative-home/report.json`,
`2026-10-05T12:45:24.953Z`, temporary `http://localhost:3006/`.
**83 records pass: 41 captures, 41 assertions, one cadence run**, with zero
runtime exceptions, GL errors or detected overflow. New checks include:

- Actual dispatched single-touch swipes advance 0→1→2→3, with scrollY staying 0.
- Browser-generated touch scroll exits Drawing; reverse swipe returns to stage 2.
- Horizontal/multitouch events do not advance stage (not full pinch-zoom QA).
- Stage-button exit reaches Work; reduced-motion stage idles without new draws.
- Fine-pointer desktop remains continuous and stage controls stay hidden.
- Staged 390 px four-state, 320 px and landscape captures have no overflow.

Visually inspected Waves/Drawing at 390 px and landscape opening: readable copy,
retained vessel/contours and reachable stage controls. 320 px/landscape captures
use reduced motion; portrait four-state captures use normal motion. Standard
no-JS/fallback and renderer lifecycle/parity assertions also pass; no physical
Safari, VoiceOver, real pinch zoom or rotation-session qualification is claimed.
The geometry/model/shaders/API did not change; pure/HTTP tests were not repeated.

QA server used an EXIT trap; no persistent preview is intended. Commit subject:
`feat: add staged mobile sea gestures`. Next: deploy/recheck the same gestures on
iPhone Air Safari, including first/last boundaries, reversal, rotation and pinch
zoom. Bounded transitions are not proof of smoother physical presentation.

## iPhone Safari recording — current feedback and scheduling correction

User reports **MacBook Pro/Chrome is much better** on the latest build but
iPhone Air/Safari still stutters during the sea reveal. This records qualitative
physical Mac improvement, not full Mac qualification. The iPhone gate remains
open. Source: `/Users/yash/Downloads/ScreenRecording_10-05-2026 17-55-12_1.MP4`.
ffprobe: 8.17 seconds, HEVC, 1260 × 2736, nominal 60 fps. Decoded 490 frames;
reviewed 1-second overview and 20-fps forward/reversal frame sheets. Derived
images/analysis are ignored under `tools/.out/iphone-recording/`; source video
was not modified or copied into committed assets.

The reveal advances unevenly through quick down/up gestures while Safari's
bottom toolbar collapses/expands. The footage does not provide touch timestamps,
scroll offsets, callbacks or GPU timing. A coarse grayscale-difference check
found no ≥3-frame near-identical whole-content runs at its chosen threshold;
that cannot rule out jank, compositor lag, recording noise or layer-specific
stalls. Do not infer an FPS drop or a specific Safari defect from this alone.

Code inspection found an independent scheduling issue: the idle 60/30 Hz gate
also deferred newly changed scroll samples. Slightly early callbacks could skip
an extra frame because each draw restarted the interval. `OceanScene.tsx` now
prioritizes dirty/changed scroll on the next callback, with HTML/GPU still sharing
the same sample, and advances a deadline for idle pacing. Compact resolution,
adaptive downgrade, offscreen/pause/reduced-motion policy and v1 field are retained.
During scroll, drawing can exceed the idle ceiling if the browser supplies more
callbacks; this trades some temporary GPU headroom for direct response. This is
a candidate fix for a concrete input-delay path, not proof of the video's cause.

WebKit's [Safari 26.4 notes](https://webkit.org/blog/17862/webkit-features-for-safari-26-4/)
describe compositor-thread scroll-driven animations. That reinforces separating
browser-native scrolling from main-thread/canvas cadence; it does not establish
the user's Safari version or a matching bug. No user-agent workaround, forced
browser settings, scroll interception or invented physical trace was added.

Build/types and lint passed. Browser validation adds a synthetic low-quality
scroll test: after forcing slow callbacks to downgrade, it restores fast callbacks
and changes scroll each frame, verifying scroll draws are not held to the idle
30 Hz budget. Full production-build report at `2026-10-05T12:31:40.835Z` on
temporary port 3006 passes **67 records: 35 captures, 31 assertions, one cadence
run**. No runtime exceptions, GL errors or detected overflow. New synthetic
scroll test draws 21 times for 20 changed scroll samples in low quality; the
existing idle high-refresh test stays bounded at 30 draws in 500 ms. These are
scheduling assertions, not measured physical iPhone frames. QA server used an
EXIT trap and was closed; `lsof` confirms no listeners on repo ports including
3006. Build/types, lint, script syntax and diff whitespace pass.
No geometry/model/API byte changes or pure/HTTP test rerun in this checkpoint.
Commit subject: `fix: prioritize scroll input over idle sea cadence`.
Next: update production through the existing workflow, repeat the same iPhone
gesture/recording, and obtain iOS/Safari version plus a native Web Inspector
scroll/compositing trace if stutter persists. Keep Mac gains intact.

## Server shutdown and updated production qualification — latest state

5 October: user requested all servers shut down and continuation. Tree was clean
at `740b738`, with `main` matching the local `origin/main` tracking reference;
the three fixes have been pushed outside this agent turn. No push or deployment
was performed here. Live HTML now has Writing → `/blog`, and the production
diagnostic confirms compact phone rendering plus reduced scroll style cost.
This verifies live behavior, not an exact hosting deployment commit hash.

Confirmed working directories before sending TERM to this repo's dev server
and four preview servers. Closed ports **3000, 3001, 3002, 3004, 3005**;
`lsof` found no remaining listeners on those ports. No local server was restarted.
Earlier preview-running descriptions below are historical, not current state.

Completed the next read-only live qualification:
`node tools/check-creative-v2.mjs https://www.maxsash.com --diagnose --native-scroll`.
Report: `tools/.out/creative-production-native-scroll/report.json`, timestamp
`2026-10-05T12:18:17.091Z`. Two browser-gesture traversals reach the
atlas chapter, with no runtime exceptions or observed long tasks/overflow.
Desktop and phone-viewport callback/draw p95 both **16.7 ms**, 482 scene draws
in each 8-second window. Live style totals now **14.1 ms desktop / 18.8 ms phone
viewport**, versus 278.3/212.9 ms on the old production path. Phone canvas is
now compact at **329,160 pixels**, versus the old 740,610 pixels. This is a
single headless Chrome/M4 Pro sample, not actual iPhone Safari acceptance.

Physical MacBook Pro/Chrome and iPhone Air/Safari recheck is pending user
feedback after reload. Ask whether sea-reveal scrolling is smooth, improved
but stuttering, or still laggy. If improved, record the user's actual result;
if not, prioritize a native browser trace during the failing scroll before
new features. User's physical feedback is not replaced by these headless numbers.
Build/model checks were not repeated: no application code changed this turn.

## Scroll-specific feedback — current checkpoint

User clarified that **scrolling down through the sea reveal** is noticeably
less smooth at production on MacBook Pro/Chrome and iPhone Air/Safari. This
supersedes idle-only diagnostics. Started from clean local `df871c3`, two commits
ahead of the tracking reference. Production remains an older revision: the live
diagnostic still finds Writing → `#writing` and a 740,610-pixel/high-quality phone
canvas; local compact rendering is 329,160 pixels. Local fixes are not live yet.

`OceanScene.tsx` now queues scroll events and samples scroll position inside the
same animation frame as the GPU draw. Opacity is assigned directly to affected
layers, with unchanged-value and chapter guards, instead of rewriting four
inherited scene properties on each event. Fallback/no-engine, pause and reduced
motion still request finite updates. The covered static SVG is hidden only
while WebGL is active; context loss restores it. Only the two full-screen shade
layers receive explicit opacity compositor hints. Native browser scrolling is
retained; no wheel/touch hijack or scroll smoothing library was introduced.

Added `--diagnose --scroll` (two programmatic reveal cycles in 8 seconds) and
`--diagnose --native-scroll` (browser-generated wheel at desktop, touch at phone
viewport, traversing the reveal in ~7 seconds within an 8-second measurement).
Native diagnostics use 1440 × 1000 and 390 × 844 at DPR 2 on isolated headless
Chrome/Apple M4 Pro. They measure callback/draw intervals plus CDP style/layout
and task totals. Emulated touch is not iPhone Safari or physical-device testing.
The first native attempt failed because gesture speed must be an integer;
corrected and reran successfully. All comparison browser runs were sequential.

Before/after local native-scroll results, same mesh/pixel budgets:

| Viewport | Before style time | After style time | Before task time | After task time |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 267.7 ms | 17.9 ms | 717.8 ms | 446.5 ms |
| Phone viewport | 248.0 ms | 17.0 ms | 620.6 ms | 356.6 ms |

Each row covers one 8-second run, not per-frame cost. Style recalculation time
fell about 93% in these samples; callback/draw p95 remained ~16.7–16.8 ms and
there were no observed long tasks. This shows reduced main-thread style work,
not a measured phone FPS/GPU improvement or proof production lag is solved.
Native gestures reached the drawing chapter on both surfaces.

Evidence (ignored): local baseline `creative-local-native-scroll/baseline-df871c3.json`,
after `creative-local-native-scroll/report.json` at `2026-10-05T11:45:19.043Z`;
live `creative-production-native-scroll/report.json` at `2026-10-05T11:44:35.728Z`.
Live native callback/draw p95 was 16.8 ms desktop and 16.7 ms phone viewport,
with zero observed long tasks; style totals 278.3/212.9 ms. Production stutter
still was not reproduced in this headless environment. Programmatic reports
are under `creative-production-scroll/` and the preserved local
`creative-local-scroll/baseline-df871c3.json`. Live user evidence remains open.

Build, separate types, lint, script syntax and diff checks passed. Full local
production regression report at `2026-10-05T11:46:44.605Z` on port 3005 passes
**66 records: 35 captures, 30 assertions and one cadence run**, with zero
runtime exceptions, GL errors or overflow. The new paused-scroll assertion
dispatches 100 events: no synchronous opacity change, one finite draw, correct
middle chapter, and no inherited opacity writes. Covered fallback hiding and
visibility restoration after context loss pass. Reviewed desktop/390 px reveal
and static fallback captures for readable composition and retained drawing.
Geometry/model and API
were unchanged; pure/HTTP tests were not repeated for this scroll-only change.
Final preview: `pnpm start --hostname localhost --port 3005`.
Commit subject: `fix: synchronize sea reveal with scroll frames`.
Next: deploy local revisions via the user's workflow, then verify the actual
scroll reveal on Mac Chrome/iPhone Safari. If lag persists, collect the native
browser performance/compositing trace during scrolling, including refresh,
power settings and warm/cold state. Keep this ahead of new creative features.

## Production feedback checkpoint — Writing and rendering cost

5 October: user reports lag on physical **iPhone Air** and **MacBook Pro** at
`maxsash.com`, while localhost is smooth. User confirmed **Chrome on Mac,
Safari on iPhone**. This is reported physical evidence of a problem,
not a completed qualification. Navigation/performance now precede new creative
features. Started with clean tree at lifecycle commit `86f1589` (one ahead of
the local tracking reference); no deployment or remote push performed here.

Implemented:

- Studio **Writing → `/blog`** directly via Next Link, with prefetch disabled.
  Work/Elsewhere remain anchors; `#writing` still resolves the optional homepage
  publication section and legacy links. No extra click is required by navigation.
- At mount, coarse-pointer or <760 px stage uses 120 × 90 sea segments:
  **21,600 triangles, 64% fewer** than desktop's unchanged 60,000. Compact DPR
  cap is 1, pixel cap 360,000 (previous narrow cap 780,000/DPR 1.5). Portrait
  and touch landscape keep the same compact geometry across resizes. This is a
  conservative workload budget, not a device-speed classification.
- Edition wave vectors/frequencies are calculated once on the CPU. GLSL no
  longer calculates fixed direction trigonometry, wave number or dispersion in
  each vertex/fragment. Height/slope equations, v1 coefficients, CPU ship pose
  and export remain unchanged. No GPU speedup percentage is claimed.
- Normal animation has a 60 Hz draw ceiling; slow delivery reduces resolution
  by 0.7 and uses a 30 Hz ceiling. The 1.6-second downgrade window now accepts
  12 samples; its prior >30 requirement excluded sub-20-fps devices. Actual
  callback interval is sampled separately from clamped simulation time.
- Resize avoids assigning unchanged canvas dimensions (which reset the buffer).

Read-only live diagnostics used isolated headless Chrome on Apple M4 Pro,
1440 × 1000/DPR 1. Reports: `tools/.out/creative-production-diagnostic/report.json`
at `2026-10-05T11:30:54.589Z`, and `creative-local-diagnostic/report.json` at
`2026-10-05T11:31:47.505Z`. Sequential commands:

```sh
node tools/check-creative-v2.mjs https://www.maxsash.com --diagnose
node tools/check-creative-v2.mjs http://localhost:3003 --diagnose
```

Both stationary 30-second runs: callback median/p95 **16.7/16.7 ms**, 1,802
scene draws, zero observed long tasks. Cold document load completion was
787.5 ms live versus 123.5 ms local; final response headers 404.1 versus 69.6 ms.
These individual loads are not statistically established latency, Core Web
Vitals or GPU-time results. The local comparison used the earlier compact-budget
revision before final shader/pacing changes; desktop mesh was unchanged.
Production Writing still pointed to `#writing`. A separate curl confirmed the
apex redirects to `www` and both respond successfully. Production sustained lag
was **not reproduced** by this desktop Chrome stationary test; Safari/physical
device, scrolling, thermal state, high-refresh presentation and extensions remain
unresolved. Do not substitute this result for the user's experience.

Final full local production report: `tools/.out/creative-home/report.json`,
`2026-10-05T11:34:42.266Z`, `http://localhost:3004/`. **64 records pass**:
35 captures, 28 assertions, one cadence run. Zero runtime exceptions, GL errors
or detected overflow. Added checks verify actual one-click Writing navigation,
portrait and DPR-3 touch-landscape budgets, synthetic 65 ms callback downgrade
(161,343 pixels, low quality), and synthetic high-refresh draw bounds (28 draws
in 500 ms). CPU/GPU maximum component error across 192 samples: **0.0000177263**
(tolerance 0.0002). Final desktop callback median/p95: 16.7/16.7 ms; no long tasks.
Synthetic timers test scheduling policy, not real phone performance/GPU cost.

Passed: build (includes types), separate TypeScript check, lint, 13 geometry/model
tests, browser script syntax and diff whitespace. Model/API representation bytes
did not change; HTTP tests were not rerun. Visually inspected new desktop sea
and 390 px sea/drawing captures: readable composition, vessel/contours retained.
Compact geometry further under-resolves the smallest wave; analytic fragment
normals/contours retain all six components. Real phone shimmer/crispness remains
an acceptance gate. Prior report sections below are historical checkpoints.

Commit subject: `fix: streamline Writing and reduce sea rendering cost`.
Final preview: `pnpm start --hostname localhost --port 3004`.
Stopped this task's temporary comparison server on 3003; retained the final
3004 preview and left preexisting 3000/3001/3002 servers intact.
**Next bounded task:** put this revision on production through the user's hosting
workflow, then compare the same revision/browser on iPhone Air and MacBook Pro:
initial load, 30 seconds idle sea, scroll through reveal, pause/resume and Writing.
Record Chrome/Safari versions, OS, refresh/Low Power setting and warm/cold results;
capture a Chrome trace if production-only Mac lag persists and a Safari trace
where available on iPhone;
do not mark performance solved merely from headless 60 Hz results. New portfolio,
notebook, backend, sensors and C features remain lower priority.

## Renderer lifecycle continuation — 5 October

Started from a clean tree at `5eddf76`; `main` matched the local `origin/main`
tracking reference (no fresh fetch). Foundation promotion was already done.
Fixed `OceanScene.tsx` to dispose the engine before dropping its reference on
context loss, and ignore a delayed import rejection after unmount. Context loss
already invalidates GPU resources; this closes explicit ownership cleanup
rather than proving a GPU memory leak. Fallback remains in place until reload.

Added three browser assertions: loss invokes deletion for all three buffers,
three vertex arrays and three programs; loss stops drawing; forced shader-link
failure exposes fallback, disables pause and retains Work without drawing.
The import-rejection guard was reviewed/typechecked, not tested by injecting a
rejected module fetch. Visual design and the versioned sea model did not change.

Fresh full production report: `tools/.out/creative-home/report.json`,
`2026-10-05T11:22:08.079Z`, `http://localhost:3002/`. **57 records pass**:
35 captures, 21 assertions and one cadence run, with zero runtime exceptions,
GL errors or detected horizontal overflows. Cleanup counters are 3/3/3.
Desktop callback median/p95: 16.7/16.7 ms over 30 seconds; 1,802 scene draws,
zero long tasks. Captures are automated regression evidence, not a new visual
composition review or physical-phone qualification.

Completed: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`,
`node --check tools/check-creative-v2.mjs`, 13 geometry/model tests,
`node tools/check-creative-v2.mjs http://localhost:3002`, and `git diff --check`.
The sandboxed build stalled at compile with no CPU activity; stopped only this
task's identified build processes and retried outside the sandbox successfully.
Port 3001 was occupied and left intact. This preview remains running on 3002,
started with `pnpm start --hostname localhost --port 3002`. API tests were not
rerun because endpoints/model did not change.

Focused commit subject: `fix: dispose ocean engine on context loss`.
Next: physical iOS/Android qualification and remaining lifecycle checks
(hidden initialization/tab visibility, repeated SPA navigation/resizes,
sustained downgrade). Authentic project facts/links remain needed. No deployment
or automatic context restoration is claimed.

## Public foundation promotion — final checkpoint

The Living Atlas is now `app/page.tsx`; the publication is `app/blog/`. Work and
Elsewhere remain, Writing opens the accepted notebook, and existing navigation
anchors are preserved. Old sample URLs return 308 redirects, preserving article
slugs and the sea seed. The homepage is indexable with canonical `/`; sample
writing remains noindex, follow with per-page canonicals.

Final public-route report: `tools/.out/creative-home/report.json`,
`2026-10-05T11:08:37.461Z`, production preview `http://localhost:3001`.
**54 records pass**: 35 captures, 18 explicit assertions, one cadence run.
No recorded runtime/GL errors or horizontal overflows. This includes six viewport
sizes, both articles, retained Work/Writing/Elsewhere, four redirects, metadata,
keyboard skip, fallback/no-JS, reduced motion and CPU/GPU parity. Desktop/mobile
Work and Elsewhere captures were also visually inspected.

Build, TypeScript, ESLint, 13 geometry/model tests, seven production API tests,
and diff whitespace checks pass. Renderer/model code did not change in promotion.
Final 30-second desktop run: median 16.7 ms / p95 16.8 ms callback intervals,
100% within 20 ms, 1,802 scene draws and no long tasks. This remains desktop
headless evidence, not a physical-phone or GPU-time qualification.

| Public route | HTML gzip bytes | Loaded JS gzip bytes | CSS gzip bytes |
| --- | ---: | ---: | ---: |
| `/` | 86,252 | 154,969 | 10,436 |
| `/blog` | 47,143 | 149,117 | 10,436 |
| Wave essay | 46,870 | 149,117 | 10,436 |
| Mark essay | 7,840 | 149,117 | 10,436 |
| `/samples` | 41,802 | 149,117 | 10,436 |

The public home includes restored Work/Elsewhere content, adding 5,759 gzip HTML
bytes versus the earlier scene-only sample. Its total HTML is now 84.23 KiB,
above the proposed 80 KiB scene target; record this as a content-inclusive
foundation tradeoff, not a passed 80 KiB gate. JS is +8,044 gzip bytes over the
original baseline, CSS +3,869. No dependencies or font files were added.

Removed the nine unused original Hero/Sea/Wordmark/Writing/Footer source/style
files and the obsolete SVG-only browser harness, in addition to the prior v1
cleanup. Trimmed unused section CSS and redundant note metadata. Generated brand
artwork and its tools remain used and retained.

The foundation commit includes code, research, tests, plan and handoff. The user
requested push to the existing repository; no hosting/deployment tool is run.
Project entries, project `#` URLs, personal-site destination and résumé remain
inherited placeholders requiring real content in a follow-up. Sample essay labels
remain visible. No new sensors, live feed or Easter egg was added in this pass.

The following measurements preserve the earlier prototype as historical evidence;
the public-route results above supersede its route and commit-state descriptions.

## Environment and reproducibility

- Next 16.2.9, React 19.2.4, Node 22.23.1.
- Production build served at `http://localhost:3001` using
  `pnpm start --hostname localhost --port 3001`.
- Isolated headless Google Chrome 154.0.8037.97 on macOS.
- Reported graphics backend: ANGLE Metal Renderer, **Apple M4 Pro**.
- User explicitly authorized isolated headless Chrome. Existing personal browser
  sessions were not used. Temporary browser profiles are removed by the tool.
- Final browser report: `tools/.out/creative-v2/report.json`, timestamp
  `2026-10-05T03:39:43.807Z`. These generated files are intentionally ignored.

Commands actually completed:

```sh
pnpm lint
pnpm build
pnpm exec tsc --noEmit
node --test tools/geometry.test.mjs tools/sea-edition.test.mjs
SEA_TEST_BASE=http://localhost:3001 node --test tools/sea-api.test.mjs
node tools/check-creative-v2.mjs http://localhost:3001
node tools/measure-routes.mjs --output=tools/.out/creative-v2/static-assets.json
git diff --check
```

Build, TypeScript and ESLint pass. The final build itself reruns TypeScript.
Node's test-only TypeScript import prints the existing module-type warning;
production does not use that loader. No new dependencies were installed.
An earlier approval-review quota failure and later timeout were resolved on
retry; no validation remains blocked by those transient tool failures.

## Mathematical and HTTP checks

**13 pure tests pass:** ten existing geometry regressions and three authored-sea
tests. The new tests check canonical/deterministic coefficients, zero/maximum
seeds, malformed input, field bounds, analytic derivatives against independent
finite differences at 120 samples, reproducible SVG, and the v1 coefficient
digest. Changing the seeded model silently will fail its version-contract test.

**7 HTTP tests pass** against the production preview. They cover:

- Identical JSON/SVG for omitted/default/canonical/uppercase seeds; a changed
  seed changes actual coefficients and paths, not just a label.
- Printed coordinates reconstructed independently from served coefficients.
- Invalid/repeated seeds, unsupported versions, authored provenance and safe
  standalone SVG headers/content.
- Cache headers, representation-specific ETags, matching 304 with empty body,
  and fresh 200 responses for unrelated/changed-edition validators.

HTTP validation was rerun after cleanup; the API did not change in subsequent
CSS/inline-plate adjustments. These tests do not qualify CDN behaviour under
production load. The current validator implementation handles the single exact
ETag comparison; do not claim full conditional-header parsing.

**Actual CPU/GPU comparison passes:** the test compiles the production
`fieldGLSL` into a separate transform-feedback probe, samples 64 coordinates at
three times (192 samples), and compares height and both slopes against CPU
`sampleSea`. Largest absolute component error: **0.0000427781**, below the
0.0002 tolerance. Blocking GPU readback occurs only in this QA probe.

This verifies the analytic equations/coefficient transfer, not exact equality
between a continuous surface and the finite displaced triangle mesh.

## Browser and visual checks

The final run contains **40 records**: 29 captures, ten explicit assertions,
and one 30-second cadence measurement. All assertions pass, with **zero
recorded runtime exceptions, GL errors, or detected horizontal overflows**.

| Viewport | Captured surfaces |
| --- | --- |
| 1440 × 1000 | Sea / reveal / drawing; complete notebook index |
| 390 × 844 | Same, plus both complete sample essays |
| 320 × 568 | Sea / reveal / drawing; complete notebook index |
| 768 × 1024 | Sea / reveal / drawing; complete notebook index |
| 1024 × 768 | Sea / reveal / drawing; complete notebook index |
| 844 × 390 | Sea / reveal / drawing; complete notebook index |
| 390 × 844, reduced motion | Stationary GPU sea, idle frame-count check |
| 390 × 844, WebGL2 unavailable | Static engraved fallback |
| 390 × 844, page JavaScript disabled | Static opening and server-rendered content |

Assertions exercised:

1. Pause stops drawing, and resume starts it again.
2. Leaving the scene stops drawing; returning resumes it.
3. Deliberate context loss exposes fallback and disables the unusable pause UI.
4. CPU/GPU field agreement described above.
5. Tab reaches the skip link, and Enter navigates to the notebook threshold.
6. Reduced-motion idle frame count stays unchanged.
7. Without page JavaScript, the heading and publication link remain present and
   no application renderer initializes.

The screenshot helper queries GL capability for diagnostic purposes; a GPU name
on a no-JS capture is not evidence that page JavaScript rendered the scene.

Reviewed desktop/mobile compositions, the reveal/drawing checkpoints, notebook
index, both essays, short portrait/landscape, and fallback captures. Corrections
during review included:

- Replaced interpolated water normals/contours with analytic fragment samples.
- Corrected mirrored boat basis and reduced overly dense sail wire detail.
- Added a paper veil and relocated final copy for legibility over contours.
- Adjusted short-screen staging and narrow navigation.
- Waited for a real draw before hiding fallback; keyed the scene by edition.
- Removed stale slider instructions from the static essays.
- Reduced inline engraving density without changing the field coefficients.

Useful local captures:

- [Desktop sea](../tools/.out/creative-v2/observatory-1440-sea.png)
- [Desktop drawing](../tools/.out/creative-v2/observatory-1440-drawing.png)
- [Phone sea](../tools/.out/creative-v2/observatory-390-sea.png)
- [Phone reveal](../tools/.out/creative-v2/observatory-390-reveal.png)
- [Notebook desktop](../tools/.out/creative-v2/atlas-1440.png)
- [Notebook phone](../tools/.out/creative-v2/atlas-390.png)
- [Wave essay](../tools/.out/creative-v2/article-390.png)
- [Mark essay](../tools/.out/creative-v2/mark-article-390.png)
- [No-JS fallback](../tools/.out/creative-v2/no-js-390.png)

Captures are reproducible evidence, not committed source assets. Full-page stills
of sticky scenes can misrepresent the experience; A is captured at three actual
native-scroll positions instead.

## Prototype payload before promotion

The browser inventory `assets.json` collects static asset URLs actually requested
during normal route loads, including the deferred engine. Each response is
gzipped separately for a comparable inventory. These are reconstructed gzip
sizes, not measured wire bytes or Brotli transfer. HTML includes inline RSC.
No adjacent experimental route is prefetched by these prototype links.

| Route | HTML gzip bytes | Loaded JS gzip bytes | CSS gzip bytes |
| --- | ---: | ---: | ---: |
| Original homepage baseline | 21,943 | 146,925 | 6,567 |
| Current homepage | 22,183 | 147,955 | 6,567 |
| Review gallery | 41,911 | 149,118 | 9,463 |
| Living Atlas | 80,493 | 154,961 | 9,463 |
| Notebook index | 47,220 | 149,118 | 9,463 |
| Wave essay | 46,899 | 149,118 | 9,463 |
| Mark essay | 7,864 | 149,118 | 9,463 |

The Living Atlas adds **8,036 bytes JS gzip (7.85 KiB)** and **2,896 bytes CSS gzip
(2.83 KiB)** versus the original baseline. Its loaded JS includes a **3,998-byte
gzip deferred engine chunk**. No GL engine is requested for the notebook.

The inline plates dominate the HTML increase: **+58,550 bytes** over the original
home. Density reduction brought the prototype's HTML down from an earlier
127,983 to **80,493 bytes gzip (78.61 KiB)**, within the clarified 80 KiB initial
HTML/fallback target. The full printable SVG is requested only when opened.

All measured routes requested the same four existing font files, **315,188 raw
bytes** (315,342 under the tool's individual gzip calculation). The original
static inventory counted only the three preloads, 209,712 bytes; the extra
105,476-byte file is also requested on the current ordinary homepage. Do not
present preload-only totals as the complete font download or invent a font
saving. No font was added for this prototype.

The old v1 controller/notebook CSS no longer spills into the homepage: its CSS
is back to the original 6,567-byte gzip baseline.

## Rendering cost: actual result and limit

Final desktop measurement: 1440 × 1000 viewport, capped drawing buffer,
30,015.5 ms of observation, high quality:

| Measurement | Result |
| --- | ---: |
| Browser rAF intervals | 1,801 |
| Median / p95 interval | 16.7 / 16.7 ms |
| Intervals within 20 ms | 100% in this run |
| Scene draw iterations | 1,802 |
| PerformanceObserver long tasks (≥50 ms) | 0 |

This is roughly 60 Hz **browser callback delivery** on this Mac. It does not
measure GPU elapsed time, physical display presentation, per-frame JS p95,
battery use, thermal throttling, or midrange phone behaviour. No claim that the
phone cadence/GPU budgets have passed follows from this run.

Actual implementation cost controls:

- Three draw calls; no textures, downloaded 3D model, framebuffer effects or
  post-processing; no animation framework or general 3D engine.
- Fixed 200 × 150 sea segments: 30,351 vertices / 60,000 triangles.
- Six analytic waves evaluated in vertex and fragment shading. The fragment
  evaluation is real GPU work despite the small JS payload.
- Pixel cap 1.5 million desktop / 780,000 narrow viewport; DPR caps 1.25 / 1.5.
- One-way resolution reduction after sustained slow frame delivery, using a
  0.7 scale factor. This is not a measured hardware tier or GPU timer.
- One scene rAF owner, no React frame updates, pause/offscreen/visibility
  lifecycle handling. Reduced motion draws on finite state changes.
- Compile failure/unsupported context falls back; context loss remains on the
  fallback until reload. No automatic restoration is claimed.

## Remaining gates and known approximations

The user has accepted A/B as a foundation. Remaining refinement and release
checks below are still open; the complete portfolio content/design is not done.

Remaining quality and refinement work:

- Physical iOS Safari and midrange Android Chrome, sustained interaction,
  frame/CPU/GPU traces where supported, battery/thermal behaviour, orientation,
  safe areas and pinch zoom. No phone sensor feature exists in v2 yet.
- Full keyboard flow, screen reader, measured contrast, browser/text zoom,
  dark-preference review, and broader accessibility checks. Only the specific
  keyboard assertions above were automated.
- Tab-hiding, initialization while hidden, repeated SPA navigation, repeated
  resizes, forced compile failure, context restoration policy and low-quality
  downgrade under real sustained load. Code paths exist for some of these;
  this run did not assert all of them.
- LCP/INP/CLS lab comparison and post-release field Web Vitals. Not measured here.
- The smallest 0.65 m / 0.02 m wave is under-resolved by parts of the geometric
  grid, especially in the distance; fragment normals/contours remain analytic.
  Specular shimmer and line density need physical-device art/performance review.
- The boat follows one sampled height and attenuated slope, not multi-point
  buoyancy. The decorative wake is not physically coupled to a moving hull.
  The boat is not the exact integral mark extruded into 3D.
- The printed sea freezes the same edition at t=0; it is not a screenshot of
  whatever time the visitor last saw. No live observations are used.
- Shared v1 coefficients are stable. If print layout changes after release,
  revise its representation validator/version; do not silently reuse an ETag
  for different SVG bytes. Scheduled data ingestion and immutable archives
  remain proposed work.

## Cleanup and commit state

At the user's explicit cleanup request, removed **19 superseded untracked
files**: the old blog/harbour/voyage routes, workbenches/controllers/styles,
review bar, obsolete surface extraction, v1 model helpers and tests. Restored
the original three tracked Sea files, retained generated brand artwork, and
pointed current Writing links to Atlas. Canonical sample prose now lives in one
content file. Current gallery contains only working routes.

No broad reset, dependency churn, model-asset download or deployment occurred.
Research, the original baseline, current QA tools and useful generated evidence
remain. These experiments remained uncommitted until the user approved foundation
promotion, commit and push. See [the handoff](creative-v2-handoff.md) for the
current accepted checkpoint and next bounded tasks.
