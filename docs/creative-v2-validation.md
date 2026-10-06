# Living Atlas — validation and limitations

Updated: 5 October 2026. The user **approved the foundation**, requested its
promotion to `/` and `/blog`, and explicitly authorized commit and push.
Physical-device and field-performance acceptance remain separate.

## Security, Node 24 and Next 16.3.8 — 6 October 2026

Uncommitted. On Node 24.21.0 with Next 16.3.8, a production build and a temporary
server on 127.0.0.1:3011 (stopped): types/lint/build pass; **26 Node tests**; 20 SEO
cases; **20/20 keyboard checks**; **126 browser records, 0 failures**; and the new
`node tools/check-headers.mjs` (22 checks: CSP and hardening headers on five pages,
no `X-Powered-By`, API headers intact, `security.txt` valid, **no CSP violations while
loading five pages, with WebGL2 working**). `pnpm audit --prod`: none. Earlier
"one keyboard run crashed" is explained and fixed: removing Chrome's temporary
profile raced with Chrome exiting (`ENOTEMPTY`); both tools now wait for exit and
retry. Limits: not tested on Vercel's runtime itself; CSP is production-only so the
dev server is unchanged.

## Keyboard and accessibility pass — 6 October 2026

Uncommitted. New permanent check: `node tools/check-keyboard.mjs [local url]` sends
real key events and passes **20/20**: Tab and Shift+Tab sweeps of home (desktop and
phone), notebook, essay and print page (each stop has a visible focus indicator, is
on screen, is not covered, is ≥ 24 px); hero tab order; skip link; arrow/End on
sliders; Enter/Space on presets; typing and invalid seeds; disclosure; theme and
shoreline toggles; focus ring colour. Before the fixes the phone Shift+Tab sweep
reported seven covered stops. Also on a production build: types/lint/build, 26
Node tests, 20 SEO cases, **126 browser records, 0 failures**, and axe-core (WCAG
2.x A/AA + best-practice) with no violations on `/`, `/blog`, an essay and `/plate`
in both day and night. One keyboard-check run errored (a Node exception whose output
was not captured); four later runs passed, cause unknown, likely a headless-Chrome
startup race. Limits: headless Chrome on a Mac only; automated checks find a
minority of accessibility problems; no screen reader or physical-device keyboard.

## GitHub commit log — 6 October 2026

Uncommitted. Production build + temporary server on 127.0.0.1:3011 (stopped):
types/lint/build pass; 26 Node tests; 20 SEO cases; **126 browser records, 0
failures** (new: 1–3 log entries each ≥44 px tall with no commit counts, or an
honest fallback; every link is to github.com and the repository link is present).
axe-core: no violations on `/` in day and night. Fallback path exercised by
temporarily pointing at a missing repository (shows "The log is unavailable right
now" plus a repository link), then restored. Follow-up the same day removed the 14-day strip and count; checks above were rerun
after it. Limits: desktop and 390 px headless captures only; real-device
look and GitHub rate limiting under production traffic are unverified.

## Random sea per visit — 6 October 2026

Uncommitted. Production build and temporary server on 127.0.0.1:3011 (stopped):
build/types/lint pass; **26 Node tests** (new: 400 picked seas are valid, ≥380
distinct, calm and rough both occur, steepness < 3, deterministic given the same
randomness); 20 SEO cases; **125 browser records, 0 failures**. Three requests to
`/` returned three different editions with `Cache-Control: private, no-store`.
The GPU/CPU parity check now covers two editions (v1 default and v2 squall,
384 samples), maximum error 4.2e-5 against a 2e-4 tolerance. Limits: visual
variety was judged from earlier renders of the four starting points, not from every
possible seed; no physical-device check.

## Structure pass and sea studio — 6 October 2026

Committed as `a5381a5`. Local checks on the changed tree (dev server for page captures,
a temporary production server on 127.0.0.1:3011 for suites, since stopped):

- `tsc --noEmit`, `pnpm lint` and `pnpm build` pass.
- Node tests: **25 pass** (v1 digest alarm unchanged; 6 new for v2 round-trip,
  independent effect of each setting, steepness at all eight extreme corners,
  recipe on the plate, `version` handling, `download=1`, unversioned = v1).
- `tools/check-seo.mjs`: 20 crawler/page cases pass.
- `tools/check-creative-v2.mjs`: **125 browser records, 0 failures, 0 runtime
  exceptions**, including new assertions: Notebook is linked exactly twice and not
  under Elsewhere, exactly one footer outside `<main>`, four labelled sliders,
  moving a slider changes both plate and seed, presets, and Sail/Print/Save links.
- axe-core 4.10.2 (WCAG 2.0–2.2 A/AA + best-practice) on `/` (day, night, 390 px),
  `/blog`, both essays and `/plate`: no violations after fixes (found and fixed a
  nested complementary landmark in essays and two night contrast failures).
- Readability extraction of essays, and PDF render of `/plate` (one landscape page,
  controls hidden). Squall/Glass seas rendered in the real WebGL2 hero; ship holds.
- Visual review: desktop and 390 px studio, notebook, Elsewhere, blog pages.

Limits: headless Chrome on a Mac only. Not tested: touch feel of sliders, the
sticky mobile drawing, real paper printing, Safari print, VoiceOver/NVDA, or Reader
mode in an actual browser. Cross-origin clipboard may refuse "Copy link"; it then
shows nothing rather than claiming success.

## Current refinement — responsive long mobile opening

The user reported that Sea → Structure held still for too long and then rushed.
The 1,800 ms opening now uses quadratic ease-out `t * (2 - t)` instead of the
flat-start quintic smootherstep. Mobile progress below .55 maps directly from
reveal 0 to the original Structure endpoint `(0.55 - 0.14) / 0.75`, eliminating
the initial desktop scroll hold in that mobile range. The mappings meet exactly
at Structure. Stage 2 → 3 retains its 600 ms smootherstep and original reveal
path; desktop continuous scrolling is unchanged. Reverse moves retain their
600 ms smootherstep but use the continuous mobile opening mapping. Reduced
motion still jumps immediately to the same stage endpoints.

Validation on 5 October 2026: production build/types, lint, harness syntax and
diff checks pass. Full isolated Chrome report `tools/.out/creative-home/report.json`,
`2026-10-05T16:21:27.691Z`: **121 records pass**, no runtime exceptions, GL errors
or detected overflow. A new regression reads the actual WebGL `uReveal` uniform
at roughly 200/800/1600/1880 ms after an opening swipe. Two passes returned:

| Sample | First opening | Repeated opening |
| --- | --- | --- |
| 200 ms | .1102 | .1139 |
| 800 ms | .3751 | .3774 |
| 1600 ms | .5393 | .5398 |
| Settled | .5467 | .5467 |

This verifies an early reveal, continued progress across the longer interval,
and the original settled endpoint. Existing 2 → 3, rotation, interrupted reverse,
pause, reduced-motion, lifecycle, field parity, controls, fallback and no-JS
checks pass. Sampling timings include browser/tool overhead; these are not a
physical Safari animation trace. Port 3006 verified closed after temporary QA.
Documentation updated with the revised easing and unchanged durations. Changes
remain uncommitted for review, with no push/deploy. Physical iPhone Air Safari
acceptance must be repeated for this revised curve.

## Current controls — visitor opt-in audio and footer-only system-default theme

User prioritizes visitor choice and browser policy compliance while keeping wave
sound easy to play. Audio now requires selecting “Play waves” in either header or
footer. The previous automatic interaction unlock described below is superseded:
all global click/touch/key/wheel/scroll unlock listeners are removed. No audio
context is created until that sound control is selected; a saved enable never
autoplays on reload. Both controls stay synchronized and offer immediate “Mute
waves”. Muting closes the context, cancels pending resume updates and is remembered.
Browser failures stay ready for explicit retry; no autoplay restrictions are bypassed.
Hidden-tab suspension and unmount cleanup remain. This follows
[browser autoplay guidance](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
and makes playback an explicit visitor choice; it is not a universal legal or
accessibility certification.

Removed the theme button from the header; exactly one remains in the footer.
Without a saved manual choice, the theme follows system preference on load and
on OS changes. The footer switch saves an override and takes priority thereafter.
Invalid saved values are ignored. System listeners are cleaned up on unmount.

Build/types and lint pass. Focused Chrome report
`tools/.out/creative-home/report.json`, `2026-10-05T15:10:53.538Z`: **51 records pass**,
no runtime exceptions, GL errors or detected overflow. Checks cover silent ordinary
click/touch/scroll, explicit play including trusted touch on the button, shared
control state, persisted mute, exactly one footer theme button/two audio buttons,
system dark default, live system changes and saved manual priority. Final header
capture was visually reviewed. Harness syntax/diff checks pass; port 3006 verified
closed. Previous full sea geometry/lifecycle run remains historical
coverage of the renderer, which is unchanged here. Physical iPhone Safari sound,
keyboard/screen-reader and complete contrast checks remain open. Changes are
uncommitted for review; no push/deploy is performed.

## Previous refinement — aligned light, shallow blended tide, automatic ambient sound

The user identified a right-hand sun/moon with left-hand wave lighting, requested
less footer water blended into Elsewhere, and selected sound enabled on the first
interaction. This changes the earlier opt-in audio contract below. All exploration
code remains uncommitted on `/`; no sample route, push or deployment is introduced.

`ocean-light.ts` shares a screen anchor with the sky shader and projects its ray
through the same camera basis/FOV/aspect used by the scene. Water specular light
and ship diffuse light use that direction; the sky disc now compensates for aspect
ratio to remain circular on phones. Geometry/model coefficients are unchanged.
`allowImportingTsExtensions` supports the shared typed shader dependency in the
existing direct Node browser/GPU probe; TypeScript remains no-emit.

The shoreline baseline is now 8.5% of footer height, with small oscillations
(about 5.5–11.5% total), versus the preceding 25% baseline. Wet sand extends
another 3.5%. Its water gradient starts at Elsewhere's exact `#eae7d9` day /
`#122126` night, fading toward translucent-looking shallows, rather than a large
blue region. Desktop/mobile top padding and fallback gradients shrink with it.
Existing sand/shells, tracks, bounds, offscreen pause and reduced motion remain.

A single `WaveSoundController` serves synchronized header/footer controls. Sound
is enabled by default but no AudioContext is created on load. Trusted touch/click,
key or scroll/wheel input attempts the unlock in the input handler; browser policy
may require a tap/click rather than scrolling alone. A blocked resume stays ready
and can retry on a qualifying gesture or the control. Scroll retries are bounded
to one attempt per mount, avoiding repeated pending promises during scrolling.
The generated graph/volume/swell stays the same. Muting closes the context,
prevents pending-resume races, and persists `studio-wave-sound=off`; further input
or a reload cannot override that choice. Manual enable is always available.
Hidden tabs suspend audio; leaving the homepage closes it and removes listeners.
See [browser autoplay rules](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

Validation, 5 October 2026:

- Final production build/types and lint pass. Harness syntax/diff checks pass.
- `node --test tools/ocean-light.test.mjs`: one projection regression passes
  across 36 aspect/camera/pointer combinations, verifying normalized direction
  and its exact projection to the sky anchor, rather than a copied sign check.
- Full isolated Chrome run at temporary `http://localhost:3006/`, saved in
  `tools/.out/creative-home/coastal-full-report.json`,
  `2026-10-05T15:01:40.636Z`: **112 records pass**, no runtime exceptions, GL
  errors or detected horizontal overflow. Existing three-stage/timing, geometry,
  GPU parity, lifecycle, Work/Elsewhere, no-JS and fallback checks remain passing.
- New real trusted mouse/touch input checks verify ready before interaction,
  first-click/touch sound start, synchronized controls, no restart after mute,
  and mute persistence across reload. Manual enable/off checks still pass.
- Final quick rerun after aspect-correct discs and bounded scroll retries:
  `tools/.out/creative-home/report.json`, `2026-10-05T15:02:53.001Z`: **44 records
  pass**, no runtime exceptions/GL errors/overflow. Visually inspected final
  desktop/phone shore and hero captures. Port 3006 is verified closed.

Remaining gates: user's visual selection and physical iPhone Air Safari audio
unlock/scroll smoothness, perceived volume, complete accessibility/contrast review.
Simulated touch in Chrome is not a Safari test. Temporary servers are stopped
at the end of review; no commit/push/deploy is performed.

## Previous checkpoint — first day/night shoreline exploration

User requested light/dark sea, a beach footer with sand/shells/wet tide and mouse
tracks, optional wave sound, version details, and GitHub activity for
`ctrl-alt-yash`. This is implemented directly on `/` and remains **uncommitted
for visual review**. No samples, push, deployment or physical acceptance claimed.

Implementation: header/footer theme buttons read initial system preference and
persist an explicit selection. A `uNight` uniform changes sea/sky/ship/drawing
palettes without new geometry or GL resources. Homepage sections follow the
palette; blog B keeps its publication treatment. Three-stage coarse-pointer
flow and 1,800/600 ms timings are unchanged. A darker upper sky overlay preserves
small navigation readability; no complete contrast audit is claimed.

One new semantic footer replaces the simple Elsewhere colophon. Cached procedural
sand/shells are rendered to a bounded Canvas2D shoreline; water/foam/wet sand move,
mouse tracks fade or are washed away. At most 48 tracks; no touch trail or scroll
interception. Canvas budget is about 420,000 pixels, 30 Hz while visible; pauses
when offscreen/hidden or selected by the user. Reduced motion draws a still.
Sound uses local filtered noise with a slow gain swell, explicitly enabled by a
button, and closes on off/unmount; hidden tabs suspend it. No audio request or
autoplay is made. Tests validate controls/state, not perceived sound quality.

The server workbench retrieves three validated public events from the requested
GitHub account, with hourly caching, a 2.5-second timeout, Suspense loading text,
and a profile-link fallback on failure. No access token, browser polling, private
data or fabricated contributions. Public events can be delayed; see
[GitHub event API](https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28).
The local live API returned public `Maxsash/web` push events during review; the
repository owner differs from the requested profile login legitimately.
Release label uses package version `0.1.0`, with a short revision only if
`VERCEL_GIT_COMMIT_SHA` / `NEXT_PUBLIC_BUILD_SHA` is present and valid. It is not a
claim of a new production release. Sea model version is labelled separately.

Validation on 5 October 2026:

- Production build/types and lint pass on the final implementation. Harness
  syntax and `git diff --check` pass. Route inventory contains only homepage,
  blog/articles, edition APIs and icons; homepage remains server-rendered.
- Full isolated Chrome run at temporary `http://localhost:3006/`, report
  `tools/.out/creative-home/coastal-full-report.json`,
  `2026-10-05T14:44:08.694Z`: **107 records pass** (47 captures, 59 assertions,
  one cadence run), zero runtime exceptions, GL errors or detected overflow.
  Existing edition/model GPU parity, resource cleanup, mobile gesture flow,
  Work/Elsewhere, fallback and no-JS checks pass.
- Final quick run after navigation shading/system-preference fallback refinements,
  `tools/.out/creative-home/report.json`, `2026-10-05T14:45:20.270Z`:
  **39 records pass**, zero exceptions/GL errors/overflow. Shore-specific checks
  cover visible rendering, offscreen stop, pause, tracks, synchronized/persistent
  theme, explicit sound on/off and reduced-motion still/bounded pixels. Sound
  uses a simulated user activation, matching browser autoplay requirements.
- Initially one audio assertion failed because a programmatic click had no user
  activation. Corrected the test to supply user activation; on/off passes.
  Visual review also found and fixed a left-edge water polygon gap. Theme shots
  now wait for the existing canvas entrance fade before capturing final colors.
- Visually inspected final day/night hero, desktop shore and complete phone shore
  screenshots in `tools/.out/creative-home/coast-*.png`. Two additional
  `coast-day-mobile-full.png` / `coast-night-mobile-full.png` show the entire
  footer without cropping its water. Captures are ignored local review evidence.
- Temporary server stopped after each run; port 3006 verified closed. No server
  is left running for review. No commit, push or deploy performed.

Open gates: user's design selection, iPhone Air Safari footer/theme/sound feel,
actual audio listening, keyboard/screen-reader and full contrast review. The
user's earlier smooth iPhone result covers the preceding staged sea release,
not the new shore. Headless Chrome does not measure physical Safari cadence.

## Latest checkpoint — Elsewhere promoted; sample workflow removed

User selected Elsewhere and explicitly requested removing sample scaffolding,
with future changes made directly in the main site and left uncommitted until
accepted. Updated AGENTS.md and active roadmap/plan/handoff/brief accordingly.
Historical validation/research remains a record, not a current instruction.

Homepage Elsewhere now contains the selected destination rows, decorative
compass, email contact panel and colophon. Semantic hierarchy is Elsewhere h2
and subsection h3; one homepage h1 and one footer remain. The duplicate old
footer and its CSS are removed. The entire `app/samples` tree, review-only CSS,
old shared card/port CSS and sample-only `next.config.ts` redirects are deleted.
No sample-route references remain in runtime app/components or the browser
harness. Removed unused ignored sample check adapters and sample capture folders.
Shared artwork/model/generator tools and honest sample essay labels remain.
Former sample URLs now have no route; compatibility redirects are intentionally
retired per user request, not silently preserved as extra scaffolding.

Production build (includes types), lint, harness syntax and diff checks pass.
Build route inventory contains only homepage, blog/articles, edition APIs and
icons. Full local browser report `tools/.out/creative-home/report.json`,
`2026-10-05T14:07:01.999Z`, temporary `http://localhost:3006/`: **92 records pass**
(41 captures, 50 assertions, one cadence run), no runtime exceptions, GL errors
or detected overflow. Five obsolete sample redirect assertions were removed;
new checks cover Elsewhere semantics/contact, 44 px link targets at desktop and
phone widths, and scoped 200% text bounds. Two additional full-section captures
`home-1440-elsewhere-spread.png` and `home-390-elsewhere-spread.png` were visually
reviewed. Existing Work, Writing, mobile stages, lifecycle, fallback and no-JS
checks pass. CSS text enlargement is not a physical VoiceOver/browser zoom test.

QA server stopped via EXIT trap. No push or hosting deploy. Commit subject:
`feat: promote Elsewhere and remove sample scaffolding`. Next work is directly
in the main site, with review before committing new creative changes.

## Elsewhere composition study — awaiting selection

Built `/samples/elsewhere` with existing destinations, decorative compass,
numbered text links, email contact panel and colophon. Metadata is noindex;
no JavaScript/client engine or external content dependency is introduced. Public
homepage remains unchanged. Route/CSS and `/samples` discovery card are uncommitted
until selection; documentation records this working-tree review state.

Production build (includes types), lint, diff checks and sample-specific isolated
browser checks pass. Report `tools/.out/elsewhere-study/report.json`,
`2026-10-05T13:51:35.118Z`, temporary `http://localhost:3006/`: **13 records pass** including
five captures (320/390/844/1440 px and 390 px at 200% root text size), sample link/
noindex assertions and inherited compatibility redirects. No runtime exceptions
or detected overflow. Visually inspected 1440 px and 390 px captures: clear row
hierarchy, preserved destination descriptions, readable contact and colophon.
The text-size check is CSS enlargement, not physical browser zoom or VoiceOver.
The ignored checker adapts the existing CDP harness; the 93-record public-site
checkpoint remains the latest full public result and was not needlessly repeated.

QA server stopped automatically. No commit, push or deployment. Next is selecting
or revising the concrete study before moving it into homepage Elsewhere.

## Latest checkpoint — approved Work spreads on the homepage

User explicitly requested promoting the revised sample into production Work.
`components/Work.tsx` now replaces the old cards with the selected lead Household
Hub spread (populated light expense Insights) and the wedding companion spread.
Images moved to `public/images/work/`; presentation moved to `Work.module.css`.
The homepage retains one h1, Work h2, project h3 and a single `#work` anchor.
All demo/case-study links, privacy captions and Portfolio access remain. No
review labels, sample navigation or new animation/client engine are introduced.

The old `/samples/work` page is a permanent 308 redirect to `/#work`; its sample
CSS and `/samples` review card are removed. The user selection authorizes this
code/assets/documentation commit. No other unselected experiment is included.

Fresh production build (includes types), lint, harness syntax and diff checks
pass. Full local browser report `tools/.out/creative-home/report.json`,
`2026-10-05T13:42:42.507Z`, temporary `http://localhost:3006/`: **93 records pass**
(41 captures, 51 assertions, one cadence run), no runtime exceptions, GL errors
or detected overflow. Two additional full Work-section images are saved as
`home-1440-work-spreads.png` and `home-390-work-spreads.png`; both were visually
inspected for correct Insights image, readable content and reachable links.
New assertions verify promoted figure sources, semantic hierarchy, figure
bounds and the old sample redirect. Existing mobile progression/rotation,
reversal, reduced motion, desktop, fallback and no-JS checks pass.

The user's previously reported iPhone smoothness acceptance remains recorded;
this Work promotion is not a fresh physical-device measurement. QA server stopped
via EXIT trap. No push or hosting deployment. Commit subject:
`feat: promote approved project spreads into Work`. Next is feedback on the
integrated production build, then remaining publication/Elsewhere refinements.

## Work study revision — light Insights preview

User requested the Household Hub Insights view instead of Log and asked about
light mode. Captured the public `/expense` Insights page in an isolated browser
with `prefers-color-scheme: light`, using its openly published family demo PIN
for a temporary viewing session. No household records or system settings changed.
The populated Need again view now replaces the rent dashboard image at
`/images/work-study/household-insights-light.webp`; its distinct URL avoids stale
Next image-optimization cache. Alt text and plate label match the new view.

The tenant app stylesheet follows system color preference; no theme override
was added to either app. The whole Work composition remains unselected and
uncommitted. Production build/types, lint and diff checks pass. Fresh sample
report `2026-10-05T13:37:59.775Z` contains 12 passing records at 320/390/844/1440 px with no
runtime errors or detected overflow. Visually verified the desktop spread shows
the light, populated Insights view. External capture checker still flags the
intentionally offscreen skip link; no external layout-audit success is claimed.
Temporary preview server stopped; no commit, push or deploy for this revision.

## Latest checkpoint — accepted phone feedback, real projects and Work study

User confirms the latest production three-stage reveal feels smooth on iPhone
Air Safari, including the slow first transition. This closes the reported
scrolling issue by user acceptance, not measured FPS or broad device qualification.
Mac Chrome was already reported much better. No renderer/timing change this turn.

The user supplied two demos and their professional portfolio, asking us to
explore their local repositories and add the portfolio. Read-only public review:
- [Household Hub](https://tenant-management-2my6.vercel.app/), plus `/tenant` and
  `/expense`: public invented demo household, rent dashboard and spending.
- [Wedding demo](https://wedding-demo-teal.vercel.app/), plus `/story`: chapter
  narrative, reels/albums, sample names/dates and faces hidden for privacy.
- [Portfolio](https://ctrl-alt-yash.github.io/portfolio/) and both linked tenant
  and wedding case-study pages: HTTP 200, dates/stack and implementation facts.

Read relevant README/demo documentation and package manifests in the local
`personal/whats-app/tenant-manager` and `personal/akrati/wedding` repos. No secret
files, app data changes or source publication. Tenant repo states it is private;
therefore no Source link is added. No unsupported adoption/result metrics are
copied. Browser connector and web reader were unavailable for these pages;
HTTP reads and isolated headless captures provided the evidence instead. The
external capture checker flagged intentionally offscreen skip links in tenant
pages; that is not evidence of a demo defect or a passing external layout audit.

Accepted public changes: replace placeholder projects with Household Hub and
Wedding Photo Platform, provide View demo/Case study links, and replace the
self-link/missing résumé PDF with Portfolio. Existing public card composition
is retained. Extended the browser harness with actual-session rotation and
portrait return, interrupted long reveal/reversal, paused finite transition,
real project links and removal of placeholder destinations.

Fresh production build (including types), lint, harness syntax and diff checks
pass. Full report: `tools/.out/creative-home/report.json`, `2026-10-05T13:22:31.381Z`,
temporary `http://localhost:3006/`: **89 records pass** (41 captures, 47 assertions,
one cadence run), with zero runtime exceptions, GL errors or detected overflow.
Rotation retains Structure and compact budget; rapid reversal stays at Sea after
the old opening duration; paused transitions settle and stop drawing. These are
Chrome emulations, not physical rotation/VoiceOver/pinch tests.

Unselected Work spread study: `/samples/work`, its CSS, local optimized public
demo captures under `public/images/work-study/`, and `/samples` discovery link
remain **uncommitted** under AGENTS.md. A lead Household Hub spread is followed
by a smaller wedding entry. No new client engine or dependency. Sample-specific
isolated check report `tools/.out/work-study/report.json`, `2026-10-05T13:22:33.303Z`:
12 passing records, captures at 320/390/844/1440 px, noindex, ordinary valid links,
no canvas, no runtime errors or detected overflow. Visually inspected desktop
and 390 px real-project captures. The temporary ignored check script was adapted
from the existing CDP harness. Public and sample evidence are kept separate.

Temporary server stopped automatically; no push or deployment. Accepted content,
QA and documentation commit subject: `feat: add real studio projects and portfolio`.
Next: user selection of the spread study before promotion. Broader physical
accessibility/thermal checks remain open; optional sensors and C stay deferred.

## Latest checkpoint — linger on Sea → Structure

The user requested a substantially slower first transition to appreciate the
3D-to-2D reveal, keeping Structure → Drawing as it is. Sea → Structure now takes
**1,800 ms**; all other moves, including reverse gestures, remain **600 ms**.
Quintic smootherstep easing is retained. Reduced motion remains immediate and
desktop continuous scrolling is unchanged. An interrupted transition still
starts the next move from the current displayed progress.

Production build (including types), lint, harness syntax and diff checks pass.
The swipe harness waits for the longer opening reveal before checking its state.
Full isolated Chrome report: `tools/.out/creative-home/report.json`,
`2026-10-05T13:08:58.055Z`, temporary `http://localhost:3006/`.
**81 records pass: 40 captures, 40 assertions and one cadence run**, with no
runtime exceptions, GL errors or detected overflow. Forward/reverse progression,
final native exit and reduced-motion controls pass. Physical iPhone Air Safari
smoothness still requires device verification after deployment. Temporary server
stopped automatically; no push or deployment. Commit subject:
`refactor: linger on the first mobile sea reveal`.

## Previous checkpoint — gentler mobile transition pacing

User requested slightly slower animation and an easing curve that allows the
design to be appreciated. Mobile stage transitions now take **600 ms** (previously
420 ms), using quintic smootherstep `6t⁵ − 15t⁴ + 10t³`. Its zero velocity and
acceleration at both endpoints give a gentle start and settle without overshoot.
The three stages stay 0/.55/1; reverse transitions use the same curve. Desktop
continuous scrolling and ambient sea speed remain unchanged. Reduced motion
still switches immediately. Gesture QA waits now allow the full 600 ms transition.

Production build (including types), lint, harness syntax and diff checks pass.
Full isolated Chrome report: `tools/.out/creative-home/report.json`,
`2026-10-05T13:02:23.362Z`, temporary `http://localhost:3006/`.
**81 records pass: 40 captures, 40 assertions and one cadence run**, with no
runtime exceptions, GL errors or detected overflow. Forward/reverse stage
progression, native Work exit and reduced-motion controls pass. This validates
behavior, not physical Safari smoothness. Temporary server stopped automatically;
no push or deployment. Commit subject: `refactor: soften mobile sea transition pacing`.

## Previous checkpoint — three mobile stages

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
