# Living Atlas — validation and limitations

Updated: 5 October 2026. The user **approved the foundation**, requested its
promotion to `/` and `/blog`, and explicitly authorized commit and push.
Physical-device and field-performance acceptance remain separate.

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
