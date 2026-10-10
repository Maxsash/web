# Testing

What exists, how to run it, and what has never been checked. Rules: never build or test
inside the project folder (a dev server may be running there) and stop only servers you
started.

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
wingtips cross the tail, a head-on glide is symmetric), error-page scenes (homepage shaders byte-identical, no ship on error seas, whirlpool sampling, drifting poses, lightning never flickers, torn edge, driftwood meshes), the Work system drawings (straight and diagonal arrows, every project drawing fits, overlaps nothing and routes no arrow through a box), markdown parser, post structure, post files and the editor's request guard, and every post's frontmatter, sea model (v1 digest, v2, plate, request parsing), the two API routes, sun and moon lighting, stage easing, reveal mapping, frame pacing, swipes, ship mesh, matrices, camera. `sea-api.test.mjs` needs `SEA_TEST_BASE`. |
| `check-seo.mjs`             | 20 crawler and page combinations (WhatsApp, Facebook, Twitter, Google bots): canonical, cards, images, index and noindex, structured data; discovery files; unknown-article 404. |
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
