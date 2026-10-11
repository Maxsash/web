# Testing

What exists, how to run it, and what has never been checked. Rules: never build or test
inside the project folder (a dev server may be running there) and stop only servers you
started.

## WhatsApp by number (12 October 2026)

`wa.me/919183636567` resolves to a phone-number chat (`send/?phone=…`). The old username check
was void: wa.me's web page greets any well-formed username, real or not. Isolated build:
TypeScript, lint, format, 128/128 Node tests, 78 SEO cases, headers, keyboard 22/22, 191
creative cases (the shore-channels check reads the link from `site.ts`); both homepage links
served with the number. Gull, sound and studio-plate suites not rerun (untouched).

## Gull timing (11 October 2026)

`tools/gull.test.mjs` pins `arrivalEntry`: a 390 px sky keeps its left-edge entry; 844, 1440 and
1920 px skies start hidden above the top edge, fly left to right and land within 2.6 s. Measured
on a local production build (phase timestamps from `data-gull`): wait 2.0 s at every size;
flight 2.3 s at 1440, 1920 and 844 × 390 (was 3.9 s at 1440), 1.8 s at 390 (unchanged). A
1440 px film at 0.33 s steps shows it hidden for about 0.9 s, then gliding down into the pill.
Isolated Node 24 build: TypeScript, lint, format, 128/128 Node tests, 47 gull layout checks,
78 SEO cases, headers, keyboard 22/22, sound suite, 191 creative cases, zero failures and
runtime exceptions. Own server stopped. Not checked on a real phone.

## Sea studio page and studio channels (11 October 2026)

The checks follow the studio to `/sea`: `check-studio-plate` and `e2e/sea-studio.mjs` load it;
`check-keyboard` sweeps it (desktop forward, phone backward over the pinned drawing), operates
the studio there and reloads home for the hero focus ring; `check-sound` rolls the dice on `/sea`
after a first click; `e2e/content.mjs` asserts home order work, about, contact, notebook with no
studio and one "Make your own" link to `/sea?seed=`, the studio's controls on `/sea`, About's
portfolio and the shore's email plus WhatsApp, Instagram and LinkedIn Page; `check-seo` adds
`/sea` and `/sea?seed=…` (canonical `/sea`) for six crawlers and the Organization's founding
date. The rotation case now asserts one column with the preview first and focus clear: on a
phone the pinned drawing may cover the top of the form while editing, by design.
Final isolated Node 24 build: TypeScript, lint, format, 126/126 Node tests, 78 SEO cases,
headers/CSP, keyboard 22/22, 8 studio-plate cases, sound suite, 191 creative cases (two fewer
home snapshots) with zero failures and runtime exceptions. Own server stopped. Looked at `/sea`
(1440, 390), Contact, shore and Notebook footer (390); case-study header pixel-identical to live.
Not checked: `/sea` on a real phone, Safari, a screen reader.

## Brand icons, share card and manifest (11 October 2026)

`check-seo.mjs` now reads the default card from `site.shareImage`, asserts it is a JPEG under
WhatsApp's 600 KB preview limit, that `/manifest.webmanifest` names the studio and serves
each icon as PNG, and that the home graph's Organization has the studio's name, logo, founder
and `sameAs` profiles. Run twice (icons/card, then Organization), each a fresh worktree: Isolated Node 24 webpack build (detached worktree in the session scratchpad,
`rsync --delete` so removed files are gone), TypeScript, lint, format, 126/126 Node tests, 66 SEO
cases, headers/CSP, keyboard 20/20 and 193 creative cases with zero runtime exceptions. Own server
(:3019) stopped. Not checked: real WhatsApp/LinkedIn/Facebook previews (need the release),
home-screen install on a phone, Safari pinned tab.

## System drawing labels (11 October 2026)

`node tools/check-drawing-labels.mjs http://localhost:3035` measures SVG text bounds
with loaded production fonts on `/` and all three drawing case studies at 390/1440 px.
The “Buying” label replaces overflowing “Purchasing”; labels and notes have at least
3 SVG units of side clearance. Captured WebP unchanged; recapture after owner release.
Isolated Node 24 webpack build, lint/types/format, 126 Node tests, 66 SEO cases, headers,
keyboard 20/20 and 193 creative cases pass with zero runtime exceptions. Turbopack failed
on sandbox worker-port binding; webpack succeeds with the configured Google fonts.
Own production server stopped. No live or physical-device check.

## Owner live preview-release results (11 October 13:44–13:50 IST)

Three mobile runs: performance 87/96/95; LCP 2.6 s throughout; FCP 1.8/1.7/1.7 s;
TBT 330/50/140 ms; CLS 0; accessibility/best practices/SEO 100. Median score 95
(previous 90), LCP 2.6 s (previous 3.0), FCP 1.7 s (previous 2.0). TTFB breakdown
360/290/300 ms, no document-latency warning. First run has larger startup blocking;
not diagnosed from pasted reports. Owner evidence, no fresh local tests this review.
No field data or physical-device qualification. Released HEAD be20ef1.

## Progressive studio preview (11 October 2026)

Lighthouse 13.5.0 installed only in `/private/tmp/maxsash-lighthouse`, disabled GPU,
default simulated mobile throttling, fixed seed, fresh Chrome per audit. Three rounds:
current median FCP/LCP 2555/4203 ms (score 82); body-font preload 2407/4415 (82);
inline CSS 2253/4203 (84), +47 KiB HTML. Rejected both alternatives.
Final-build confirmation after aspect-containment styling: FCP 2104 ms, LCP 3753 ms,
score 87, CLS 0, no runtime error (`/private/tmp/maxsash-lh-preview-final.json`).
Three new alternating baseline/preview rounds: median FCP 2555 → 2105 ms,
LCP 4203 → 3754 ms, score 82 → 87; HTML transfer ~168 → 84 KiB. Local comparison,
not predicted live scores. Reports `/private/tmp/maxsash-lh-preview-*.json`.

Final isolated build `/private/tmp/maxsash-loading-text` :3024.
`tools/check-studio-plate.mjs` passes eight cases: no-JS real vector image loads at
390/1440 in day/night, has seed/label/containment and no overflow; hydrated SVG
polylines equal print endpoint before/after a real keyboard slider edit. Phone day
and desktop night screenshots inspected under `tools/.out/studio-plate/`.
Native cold three-pair median LCP/FCP 1548 → 1500 ms, last CSS 1465 → 1381 ms.
Warm two-pair median LCP 740 → 740 ms, FCP 622 → 626 ms; no material warm regression.
Both use disabled GPU, 390×844, 4× CPU and request-level Slow 4G. Reports in candidate
`tools/.out/font-loading{,-warm}/`; comparison harness accepts `--warm`.
Node 24 build/lint/types/format, 126 Node tests, 44 SEO cases, 128 contrast, headers,
keyboard 20/20 and creative 193 records/129 assertions pass with zero failures/exceptions.
Completed creative process lingered and was stopped. All own experiment servers stopped. Ship/gull/sound-specific suites not
rerun. Physical devices, real screen readers and fresh live PageSpeed not verified.

## Owner post-preload PageSpeed (11 October 13:06–13:07 IST)

Performance 90/90/90; LCP 3.0/3.0/3.3 s; FCP 2.0 s throughout; TBT 170/170/30 ms;
CLS 0; accessibility/best practices/SEO 100. Median LCP improves 3.2 → 3.0 s while
FCP worsens 1.6 → 2.0 s and performance 91 → 90. First two files share identical
metrics and capture time (13:06); independence uncertain. TTFB breakdown 390 ms, no
latency warning. Blocking CSS estimates 930–1130 ms; normal text/mono fonts follow CSS
in critical tree. Owner evidence only: no fresh local checks or changes for this review.

## Font preload experiment (11 October 2026)

Baseline `/private/tmp/maxsash-contrast-check` :3021 versus candidate
`/private/tmp/maxsash-font-check` :3022. Five alternating pairs, fixed seed, 390×844 /
DPR 2, 4× CPU, 180 KB/s and 562.5 ms latency, disabled GPU (static fallback), cleared
and disabled cache. Median LCP/FCP 2884 → 1552 ms; final CSS 2814 → 1467 ms.
Four eager font links become one. Font descriptors (13) and unique woff2 content hashes
(10) match both builds. This is a local controlled experiment, not a predicted live PSI
score or device qualification. An extra cold pair measured layout-shift sum
0.000884 baseline / 0.000925 candidate (both about 0.0009); these are raw sums, not
field CLS. Node 24 build/lint/types/format, 126 tests, 44 SEO and 128 contrast checks pass.
Headers, keyboard 20/20 and creative 193 records/129 assertions pass with zero
failures or exceptions. Servers :3021/:3022 stopped; creative process lingered after
writing its completed report and was stopped. Ship/gull/sound-specific suites not rerun;
physical devices and fresh live PageSpeed not checked.
Reports: candidate `tools/.out/font-loading/five-pairs*.json`; log
`/private/tmp/maxsash-font-comparison.log`. Reproduce:
`node tools/compare-font-loading.mjs http://localhost:3021 http://localhost:3022`.

## Owner uncached mobile trace (11 October 12:19 IST)

`Trace-20261011T121919.json.gz`: 4× CPU, Slow 4G, viewport settles to 390×844,
zero cached requests. CSS requests +623 ms; last/main stylesheet finishes +2347 ms.
Initial style/layout 127 ms starts +2348 ms (style 32 ms, layout 83 ms); FCP/LCP
+2504 ms. Fonts finish after LCP (four preloaded faces +2897–3643 ms; another
Montagu subset +4715 ms). Later React/engine long tasks cannot explain this LCP.
Embedded CSS maps preloads to Montagu normal, Rethink normal/italic and Reddit Mono.
Trace analysis only; no code or fresh tests. Next: controlled preload/CSS experiment.

## Owner exported trace (11 October 12:14 IST)

`Trace-20261011T121438.json.gz` (Downloads, not copied into public repo): CPU 4×,
Slow 4G, viewport 1245×1043 / DPR 2. Primary navigation response event +587 ms,
FCP +704 ms, text LCP +738 ms. Four CSS files and five fonts explicitly marked cached;
22 cached requests within first 2 s. This verifies a warm desktop load, not PageSpeed
first mobile load. Main-thread 65 ms task at +1480 ms is after LCP. Corrected capture
requires phone viewport and Disable cache; no code/build/tests from this review.

## Owner production response baseline (11 October 2026)

Five direct-www curl GETs: TTFB 976/675/618/628/394 ms, median 628 ms; all HTTP 200.
Gzip, private/no-store and CDN MISS in all; x-vercel-id bom1::iad1 throughout. Dashboard
confirms iad1. First request has higher DNS/TLS costs. These are owner measurements,
not pure server durations or proof of cold starts. Owner then moved function to Mumbai: five headers bom1::bom1, TTFB
1164/660/625/556/539 ms (median 625 ms), median post-TLS wait 400 ms (previous 544 ms),
median total 742 ms (previous 1374 ms). All 200/gzip/no-store/MISS. Region change confirmed;
small separate batches do not isolate its performance effect. New owner mobile PageSpeed reports at 11:59:03/11:59:46/12:00:51 IST:
performance 91/91/91; LCP 3.2/3.2/3.3 s; TBT 90/90/50 ms; CLS 0; other scores 100.
TTFB breakdown 380 ms throughout; document-latency warning absent. First two reports
have identical supplied metrics/details; independence uncertain. CSS savings 320/320/340
ms; Math render delays 1190/1190/520 ms; unattributed reflow 45/45/50 ms. Owner evidence
only, no fresh tests or profiling trace this review.

## Owner live PageSpeed reruns (11 October 2026)

Three mobile reports at 11:16:57, 11:18:28 and 11:21:36 IST: performance 85/92/91,
LCP 3.8/3.2/3.2 s, FCP 1.6/1.5/1.6 s, TBT 120/70/120 ms, CLS 0.
Accessibility, best practices and SEO 100 throughout; contrast failure absent. Median
performance 91, LCP 3.2 s. No field data or desktop reruns supplied. These are owner
reports, not this agent running PageSpeed; no fresh tests during report review.

## Heading contrast (11 October 2026)

`tools/check-heading-contrast.mjs <local production URL>` tests pending/arrived headings,
day/night, 390/1440 px, normal/reduced motion using rendered CSS and ancestor opacity.
It reproduces the old 0.3-opacity failure on the previous production build. Corrected
Node 24 production build in `/private/tmp/maxsash-contrast-check` passes all 128 heading
checks (lowest ratio 10.33:1), 126 Node tests, 44 SEO cases, lint, types and format.
Headers, keyboard 20/20 and creative (193 records, 129 assertions, zero failures and
exceptions) pass. Servers :3019/:3020 stopped. Completed keyboard/creative processes
lingered and were stopped. Not a full axe audit or fresh
PageSpeed run; no field performance claim.

## SEO expansion (11 October 2026)

Node 24 production build in `/private/tmp/maxsash-seo-check`, server :3018 (stopped):
126 Node tests, 44 SEO cases, headers, keyboard 20/20, lint, types and format pass.
Creative report: 193 records, zero failed assertions and zero runtime exceptions. The
creative process lingered after writing its completed report and was stopped. Expanded
harness derives all five case studies and real published posts, checks exact sitemap
membership and index/noindex directives across four crawlers. Samples/listing remain
noindex; drafts must 404. Owner confirms sitemap success and supplied homepage-indexed
screenshot. Owner supplied PageSpeed: mobile 85 / desktop 97, accessibility 97, SEO 100.
These are owner evidence; no fresh PageSpeed or Search Console access by this session.

## Case studies (10 October 2026)

Rerun after the three-cards-two-rows change and again after Velora's drawing (126 Node tests: the drawing count became "every client project leads with a system drawing"), same results otherwise. Node 24 production build with no
warnings (detached worktree `/private/tmp/maxsash-cases-review`, server :3016, stopped), lint, types, format, 125 Node tests (11 new in `case-studies.test.mjs`),
28 SEO cases (now with two case studies, the six-entry sitemap, `/work/<unknown>` 404 and the
`/work` redirect), headers, keyboard 20/20 (the first Tab inside Work now reaches the Velora case
study link), and the creative suite (193 records, 129 assertions, 0 failed, 0 exceptions, no
overflow). Screenshots of `/` Work and two case studies at 1440 and 390, and a phone case study
at night, were inspected on the owner's dev server. Not run this time: ship, gull, software
fallback and sound (no code they cover changed except the shore's sea-model line). Not
verified: physical devices, screen readers, a case study's plate draw-in at night.

## Font and theme sprint (10 October 2026)

Final fonts: Montagu Slab, Rethink Sans, Reddit Mono. Node 24 production build with no
warnings (detached worktree `/private/tmp/maxsash-type-review`, server :3015), lint, types,
format, 114 Node tests, 20 SEO cases, headers, keyboard 20/20, ship 36/36, gull 47, software
fallback, sound and 193 creative records pass, with no runtime exceptions or overflow.
Scratchpad checks: no headline word wider than its box on six pages at 1440/1100/820/600/
390/320 px (rerun after the About name moved from 15cqi to 14cqi; the suite above ran on the
15cqi build, the only difference); kicker arrival settles to opacity 1; day, night and phone
screenshots inspected; the hero brand sits on the gutter at 390 px. Earlier rounds found and
fixed: phone "Work" link under 24 px, brand centred on phones by that fix, night studio plate
turning brown, Notebook masthead and About name breaking mid-word.
Not checked: physical devices, real screen readers, the private `/write` editor, the hero
fallback plate at night.

## Ship refinement (10 October 2026)

Node 24 production build, lint, types, format, 114 Node tests, 20 SEO cases, headers,
20/20 keyboard checks and all 193 creative records pass, with no failed assertions,
overflow or runtime exceptions. Context loss releases all four buffers, including
the cloth-flex buffer. Shared shader defaults, sea parity and mobile timings pass.

The five tests in `tools/ship.test.mjs` cover nondegenerate geometry, rigid/cloth
separation, bounded continuous buoyancy, short-chop damping and finite composition.
`tools/check-ship.mjs` passes 36/36 checks: actual rendered triangles clear text and
viewport edges by day/night and in Drawing at 320 × 568, 390 × 844, 768 × 1024,
844 × 390, 1440 × 1000 and 2560 × 1440; 150% text, live rotation, reduced motion,
pause/resume and native touch-emulated intermediate reveal/return frames. Screenshots
inspected at desktop/phone/landscape sizes, both themes, Drawing and enlarged text.
The ship harness uses SwiftShader; the full creative suite uses the Mac GPU.
Its 30-second desktop sample delivered 1,801 frames, p95 16.7 ms, zero long tasks,
high quality. This is headless Chrome evidence, not a physical-device qualification.

Evidence: `/private/tmp/maxsash-ship-review/tools/.out/ship/` and
`tools/.out/creative-home/` in that worktree. Logs: `/private/tmp/maxsash-ship-*.log`.
All builds/tests ran in that detached worktree; no main-folder test/build was run.
Physical iPhone/Safari/Firefox, screen readers and battery/GPU qualification remain
unverified. Gull and sound-specific browser suites were not rerun for this ship work.

## Run everything

Use Node 24 and a production build in a detached git worktree:

```bash
nvm use
CHECK_DIR=$(mktemp -d /tmp/maxsash-check.XXXXXX)
git worktree add --detach "$CHECK_DIR/wt" HEAD
rsync -a --exclude node_modules --exclude .next --exclude .git --exclude tools/.out ./ "$CHECK_DIR/wt/"
cd "$CHECK_DIR/wt" && pnpm install --frozen-lockfile && pnpm build
(pnpm exec next start -p 3012 &)

pnpm exec tsc --noEmit && pnpm lint && pnpm format:check
SEA_TEST_BASE=http://localhost:3012 node --test tools/*.test.mjs
node tools/check-seo.mjs http://127.0.0.1:3012
node tools/check-headers.mjs http://localhost:3012
node tools/check-keyboard.mjs http://localhost:3012
node tools/check-ship.mjs http://localhost:3012
node tools/check-gull.mjs http://localhost:3012
node tools/check-software-fallback.mjs http://localhost:3012
node tools/check-sound.mjs http://localhost:3012
node tools/check-creative-v2.mjs http://localhost:3012
```

Landscape studio (10 October 2026): 43 browser assertions pass across 568 × 320,
667 × 375, 740 × 360, 844 × 390 and 932 × 430, checking the actual SVG transform
(full plate visible and larger), all four live sliders, keyboard focus/keep actions,
sticky preview and rotation back to portrait. Focus visibility allows 1 px for native
scroll rounding (observed 0.28–0.35 px). Screenshots inspected at 568 × 320 and 844 × 390, including night and editing.
Also checked the 844 × 390 night view. The seed and actual drawing geometry both change
with edits. Node 24 production build, lint, types, format, 109 Node tests, 20 SEO cases,
headers, 20/20 keyboard checks and all 193 creative records pass, without failed assertions,
overflow or runtime exceptions. Reports/screenshots: worktree
`tools/.out/creative-home/`; initial targeted evidence `/private/tmp/maxsash-landscape/`.
`tools/e2e/sea-studio.mjs` is part of the creative suite. The existing keyboard sweeps
continue to cover portrait and desktop studio focus.

Mobile stage correction (10 October 2026): native mobile emulation reproduced an
enabled-looking Back that ignored taps and a swipe that bypassed the transition at
just 5 px of scroll. The new browser regressions fail against the baseline and all
20 targeted assertions pass against the fix. They cover independent Next/Back taps,
interrupted button/swipe reversal, offsets and a partially visible returning hero,
rotation, paused/reduced-motion stages, horizontal/multitouch rejection and exit to
Work. `runStagedSea` now uses Chrome's actual touch emulation rather than overriding
`matchMedia`. Targeted report/screenshots: isolated worktree `tools/.out/mobile-sea/`.
Node 24 production build, lint, types, format, 109 Node tests, 20 SEO checks, headers,
20/20 keyboard checks and 137 creative records pass, with no failed assertions or
runtime exceptions. Full report: worktree `tools/.out/creative-home/report.json`.
This is headless Chrome, not physical iPhone/Safari.

Prior gull correction (10 October 2026): Node 24 production build, `tsc`, `lint`,
`format:check`, 109 Node tests (17 gull), 20 SEO cases, headers and 20/20 keyboard
checks pass. Creative passed 132 records with no failed assertions or exceptions. Inspected corrected gull over WebGL at desktop/phone sizes.

`check-gull.mjs` passes 47 pixel/contact and visible-layout checks across live resizes:
widths 320–2560, heights 320–1440, DPR 1/1.25/2/3 (including density-only changes at fixed viewport size), root text sizes 16/20/24 px,
day/night, standing/sleeping/drawing and rotation during arrival. It checks the actual
alpha footprint against the border, label clearance, viewport clipping, visible
text/control collisions and refreshed canvas density. Contact error stays within
0.36 CSS px (raster antialiasing); no tested overlap/clipping. Reports/screenshots:
`tools/.out/gull/`. Headless focus tests explicitly focus the page. Gull/keyboard
harnesses printed passing results but their Node processes lingered; gull exited after
a delay and only the completed keyboard process was stopped. Creative, static, Node, SEO and header checks exited normally.

The previous refinement also passed software fallback and 23 sound checks, and
verified night rest with no redraws, live theme switching and reduced-motion changes.
Those sound checks were not rerun for this placement-only correction.

The earlier geometry timing (~0.1 ms/frame on an M4 Pro) predates this refinement;
geometry cost and scroll cost were not re-measured. No physical-device conclusions.
`compare-builds` cannot prove "unchanged" across a change in section heights: a section above
that ends on a fractional pixel shifts everything below it by a sub-pixel and re-antialiases the
text. Compare computed styles and relative boxes instead.

**Scroll cost before and after a change:** build the previous commit
(`git archive HEAD | tar -x -C $SCRATCH/old`) and run `node tools/check-creative-v2.mjs <url>
--diagnose --scroll` against both; compare p95, long tasks and the `RecalcStyleCount` and
`LayoutCount` metrics, at least twice each.

## What each check covers

| Check                       | Covers                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `tools/*.test.mjs`          | Feedback (every cue deterministic, finite, silent at its edges, heard on the laptop model and under a page turn; focus < hover < the dial < a press < a roll; every action names a real cue, a short buzz and a sentence; spacing drops bursts; idle levels; activation classification), the press point on the sea and the sea's pace, sound (page turns soft and varied; the surf seamless, heard on a laptop-speaker model at a -34 LUFS median, never silent, under a ducked page turn, a wash not a hiss; detents sharp, over in 3 ms, mostly above 2 kHz, a trill under the page turn; the ratchet and tick spacing), the About portrait (engraving: rows, light lifts the lines, the sea's ripples, luma sampling; bezel: ticks, face inset, legend arcs), the gull (the sitting gull fits inside the 44 px pill and rests on its floor, reserved seats
fit sitting and standing sizes with label clearance, short approaches do not reverse, the arrival
starts where planned, never jumps and ends at rest on the perch, wingbeats come in bursts with glides,
every frame of a visit is finite, habits are seeded, spaced at least 4 s, peck at most once and stop
after 45 s, the beak tip is the bill's end, the song comes in phrases with quiet between and ends
before the gull sleeps, notes rise from the beak and fade in and out, the head lifts for each note,
the takeoff stands first, climbs and fades out at
the exit, departure begins at the current pose during flight/hover, night gets one phrase,
fewer quiet habits and rests unless engaged, hover stands it up, idling puts it to sleep, the head follows the pointer, the folded
wingtips cross the tail, a head-on glide is symmetric), error-page scenes (homepage shaders byte-identical, no ship on error seas, whirlpool sampling, drifting poses, lightning never flickers, torn edge, driftwood meshes), every project's case study (one file per project, opens with the brief, ends with the outcome, 2–5 minutes), the Work system drawings (straight and diagonal arrows, every project drawing fits, overlaps nothing and routes no arrow through a box), markdown parser, post structure, post files and the editor's request guard, and every post's frontmatter, sea model (v1 digest, v2, plate, request parsing), the two API routes, sun and moon lighting, stage easing, reveal mapping, frame pacing, swipes, ship mesh, matrices, camera. `sea-api.test.mjs` needs `SEA_TEST_BASE`. |
| `check-seo.mjs`             | 28 crawler and page combinations (WhatsApp, Facebook, Twitter, Google bots): canonical, cards, images, index and noindex, structured data (Organization with logo and profiles on home, Article on case studies); discovery files; share card under 600 KB; manifest and its icons; unknown-article and unknown-case-study 404; `/work` redirect. |
| `check-headers.mjs`         | Security headers, `security.txt`, and no CSP violation on the main pages in headless Chrome.             |
| `check-ship.mjs`             | Rendered ship triangles versus visible text and viewport bounds: six sizes, day/night, Drawing, 150% text, live rotation, paused/reduced-motion cloth and native mobile reveal/return. Outputs to `tools/.out/ship/`. |
| `check-gull.mjs`            | Live portrait/landscape resize matrix, DPR 1/1.25/2/3, larger text, day/night, standing/sleeping/drawing: pixel contact with the pill border, label clearance, no clipped bird/control, no visible text/control overlap and refreshed canvas density. Outputs to `tools/.out/gull/`. |
| `check-keyboard.mjs`        | Real Tab, Shift+Tab, Enter, Space and arrow events: visible focus, on screen, not covered, 24 px minimum, and the main controls. |
| `check-software-fallback.mjs` | A browser with no GPU (`--disable-gpu`) must show the static plate: renderer marked fallback, nothing drawn, plate visible, page readable. |
| `check-sound.mjs`           | Every sound against the visitor's choices, with the Web Audio calls spied on: nothing before the first click; after it the answers sound (a hover, the dice, the compass) and the waves do not; "Play waves" starts the loop and remembers it; page turns into and within the notebook (by link and by back and forward), never the same variation twice in a row, none on the page already open; the waves leave with the shore and come back without a click; after a reload a remembered choice waits for the first click (and a first click on the button plays); muting the waves keeps the answers; "Mute sounds" silences everything and outlasts a reload; "Unmute sounds" answers and leaves the waves off. Sounds are told apart by their length (page turns 0.8–0.95 s, detents 0.015 s). How it sounds is not tested: listen to `node tools/render-sounds.mjs`. |
| `check-creative-v2.mjs`     | Browser behaviour in isolated headless Chrome: content, viewports, lifecycle (pause, resume, context loss), shader-to-CPU parity, mobile stages, links (a section link glides, the home link on `/` glides to the top and keeps the sea, another page opens at its top, reduced motion jumps), fallbacks, shore, theme, sound, asset sizes. The suites live in `tools/e2e/`. |
| `compare-builds.mjs`        | Pixel comparison of two builds over 36 views (9 pages and homepage sections, desktop and phone, day and night). The way to prove a refactor changed nothing. |
| `measure-routes.mjs`        | Gzipped inventory of the assets each route references. Not Web Vitals.                                   |

`check-creative-v2.mjs` also takes `--quick` (a small screenshot subset), `--diagnose`
(read-only desktop cadence; may target `www.maxsash.com`), and `--scroll` or
`--native-scroll` to measure the sea reveal. Reports and screenshots go to ignored
`tools/.out/`. `--use-angle=swiftshader` is an explicit software backend that Chrome still accepts as
WebGL, so the other tools keep it for steadier rendering; only `--disable-gpu` triggers the
fallback. Every browser tool creates its own Chrome profile and removes it on exit
(`tools/lib/browser.mjs`).

For a refactor, build the previous commit on another port and run
`node tools/compare-builds.mjs <old url> <new url>`. The phone Work image can be flagged
in a single run, even when a build is compared with itself (lazy-image timing); repeat the
run. Servers that just started also have a cold image cache.

## Error pages

See them at `/nope`, `/blog/nope` and `/plate?seed=zz` on any build. The crash pages need a
throw: in a scratch copy only, add a page that throws (for `error.tsx`) and make the root
layout throw (for `global-error.tsx`); never commit either. No automated browser check
covers the error pages yet, and no parity test compares the whirlpool shader with
`sampleDrift`.

## Never checked

Everything above runs in headless Chrome on a Mac. Not covered, so do not claim it:

- a real screen reader (VoiceOver on Mac and iPhone, NVDA, TalkBack) and Reader mode;
- physical phones beyond the owner's own report that the staged mobile sea is smooth on
  an iPhone, and battery, thermal or GPU qualification;
- field Web Vitals and the Vercel runtime (headers and the sea API are tested locally);
- a printed plate on paper, and the real WhatsApp app's preview;
- how the sounds sound on real speakers and headphones, and audio in Safari, Firefox or on an
  iPhone (its silent switch mutes Web Audio);
- the feedback run on a real phone: vibration on Android, a tap's press sound, the sea's ripple
  under a finger, and the notices with a screen reader;
- the gull on a real iPhone and in Safari or Firefox (it was watched only in headless Chrome: desktop
  and phone sizes, day, night, the drawing chapters, reduced motion, hover, keyboard focus, the
  pointer, a press on the button and on the gull, arrival with the waves and sounds remembered
  off), and how often visitors actually press it;
- the hidden tab's title and icon in a real browser (tested by faking `document.hidden`), and
  idle and offline beyond headless Chrome's emulation;
- Search Console, indexing and AI citation outcomes.

## Approved essays and client-facing polish (11 October 2026)

Node 24.21.0 production build in `/private/tmp/maxsash-publication-check`, lint/types/format,
126 Node tests, 44 crawler/page cases, headers/CSP and 20/20 keyboard checks pass.
Full creative rerun passes 193 records/129 assertions with no failures/exceptions. Initial
three failures expected obsolete noindex policy; corrected harness then rerun.
SEO checks listing/approved essays are indexed and in exact sitemap, no sample labels,
project screenshot card dimensions/asset responses, owner Build time and two drafts absent.
Direct component rendering covers footer network/non-OK failure and loading state.
Six case-study duration/layout checks pass at 390/1440 with no horizontal overflow;
Notebook phone and case-study phone screenshots inspected. Final shortened Household Hub
headline rebuild, 44 SEO cases and six layout checks pass, with phone screenshot inspected;
full creative result predates only that final copy shortening.
Logs: `/private/tmp/maxsash-publication-*.log`; screenshots/reports: worktree `tools/.out/`.
No live, social-app or physical-device review. Accidental main-folder build interrupted;
all reported passing builds/checks above ran in isolated worktree.

AI discovery review (11 October): read-only live OAI-SearchBot user-agent requests pass
200 for robots/sitemap/home/listing/wave essay/business-operations. Live listing/essay
remain noindex and sitemap seven URLs: latest publication changes unreleased. These
requests do not prove genuine crawler-IP access, WAF settings, indexing or AI citations.
No fresh build/browser/Node suite in this review; prior verification remains above.

GitHub IST change (11 October): isolated Node 24 rendered-component check passes across
18:29:59/18:30 UTC (India midnight), same-local-day grouping and IST label. First scratch
assertion assumed a comma in en-GB output; corrected expected formatting and reran. Types,
targeted ESLint and format pass. No fresh production build/full browser suite for this edit.

Backend credibility and IST review (11 October): final isolated Node 24.21.0 production build,
lint, TypeScript and format pass in `/private/tmp/maxsash-publication-check`. The full suite passes:
126 Node tests with `SEA_TEST_BASE`, 44 crawler/page SEO cases, headers/CSP, keyboard 20/20 and
193 creative records with no runtime exceptions. This includes hero/metadata, repeated-version
rejection, IST grouping, and current business/intrusion system drawings and prose. The sandbox
could not resolve Google Fonts or reach its own local server; the successful build/checks used
narrowly enabled network/localhost access. Focused 390 px headless captures after the drawing
arrival were inspected: both updated private system plates have legible, unclipped labels, boxes
and arrows. No live, social-app or physical-device claim follows.

BlogPosting and crawler addition (11 October): source and crawler harness cover factual
BlogPosting fields plus Bingbot/OAI-SearchBot initial HTML. The focused local production rerun
passes 66 crawler/page cases; format, lint and TypeScript pass. The same production build had
already passed the 126 Node tests, headers/CSP, keyboard 20/20 and 193-record creative matrix
before this test-only crawler expansion. No live crawler-IP, WAF or citation claim follows.
