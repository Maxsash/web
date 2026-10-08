# Sea, Ship, Math — active roadmap

Updated: 5 October 2026. **The user approved Living Atlas A/B as the foundation,
requested promotion to the actual homepage/blog, and explicitly authorized a
commit.** This approval covers the foundation. It does not mean every planned
feature, real project content, or physical-device qualification is complete.

Start with [the handoff](creative-v2-handoff.md), then the
[ordered implementation plan](creative-v2-plan.md) and
[current validation](creative-v2-validation.md). The
[brief](creative-v2-brief.md) preserves the creative standard.

## Code cleanup, step 2: dead code and comments — 8 October 2026

**Uncommitted, awaiting review.** Removed: the brand-mark and wave generators and their
geometry tests (`tools/build-logo`, `build-waves`, `build-cover*`, `geom`, `outline`,
`preview-logo`, `render-logo`, `scan.py`, `geometry.test`), the unused legacy wave data
(`components/wave-paths.ts`), two unreferenced social cards, the icon set (only the
arrow was ever drawn; now `ArrowIcon`), dead content fields (`intro`, `links.blog`,
project `tags`/`repo`/`status`, destination `icon`/`external`), three unused CSS
classes, and about 40 unused design tokens plus unused `.shell`/`.eyebrow`/`.skip` rules
from `app/globals.css` (leftovers of the retired wave-band design). Comments: all
removed except eight that give a reason the code cannot (sample-sea invariants, a
security note, the WebGL buffer gotcha, the scroll-margin magic number and similar).
`AGENTS.md` now states the conventions: no needless comments, no repetition, one
responsibility per module, delete dead code, never commit unless told.
Verified in an isolated copy: types, lint, `pnpm format:check`, build, **16 Node tests**
(10 geometry tests went with their generator), 20 SEO, header checks, 20 keyboard, **126
browser records**. A pixel comparison against the previous build over 32 views
(8 pages, desktop and phone, day and night) matched exactly except an 18-pixel glyph
on the phone blog index and the Work screenshot image, which did not load in the old
baseline's phone capture but loads in the new build. Still to do: remove the repeated
code (sea request parsing, CDP test setup, Work content duplicated in JSX), split the
long components by responsibility, merge duplicated CSS rules, trim the process docs.

## Code cleanup, step 1: Prettier — 8 October 2026

The code read as minified (lines of 250–650 characters, one 200-line effect on a
single line). Prettier (`printWidth` 100) now formats everything except `docs/`,
`public/`, the lockfile and build output; `pnpm format` and `pnpm format:check`
exist. Proof it changed nothing: a clean production build of the parent commit and of
the formatted commit were compared byte by byte. 31 of 34 shipped files are
identical; the other three differ by 2–3 bytes (a space after commas inside two CSS
`clamp()` values, and one explicit `{" "}` at a JSX line break), with identical
rendering. The full suite also passes (26 Node tests, 20 SEO, header checks, 20
keyboard, 126 browser records). Remaining plan: remove dead code and comments,
de-duplicate, split the long components by responsibility, then trim the docs.

## Deployment control — 8 October 2026

Every push to `main` used to deploy. Now `main` is the working branch and **never
deploys**; only the `production` branch does. `production` was created at the live
commit `e285048`, Vercel's Production Branch Tracking is set to `production` by the user in the dashboard, and `vercel.json`
sets `git.deploymentEnabled.main` to `false`. Release with
`git push origin main:production`. Assumption to verify on the first push: that Vercel
reads `vercel.json` from the pushed commit, so a push to `main` creates no deployment
at all (a preview would be harmless but unexpected).

## Commit identity rewrite — 8 October 2026

Every commit used the author's personal email address, public in a public
repository. History was rewritten with `git filter-repo --mailmap`: all 55 commits
now carry the display name `maxsash` and GitHub's noreply address, with file contents
byte-identical (compared by tree hash). Every hash changed, and hashes cited in these
docs were remapped from the rewrite's commit map. A bundle backup of the old history
is kept outside the repository. The old commits remain reachable by their old hashes on
GitHub until it garbage-collects them, and anyone who already cloned has the old
address; the user accepted that residual exposure.

## Security audit, hardening and Node 24 — 6 October 2026

**Uncommitted, awaiting review.** Audit findings and actions:

- **Next.js 16.2.9 had known vulnerabilities, three critical** (remote code execution
  in the image optimisation API, `next/og` and Windows-hosted servers; plus several
  high: middleware bypass, server-action DoS/SSRF, rewrite SSRF). The site uses none
  of server actions, middleware, rewrites or `next/og`, and uses `next/image` only on
  two local files, so practical exposure was low, but it is upgraded to **16.3.8**
  (patched). Four transitive build-tool advisories (browserslist, source-map-js,
  baseline-browser-mapping) are pinned past their fixes with pnpm overrides.
  `pnpm audit --prod`: **no known vulnerabilities**. Development-only tooling (the
  eslint chain) still reports advisories; it is never shipped.
- **Node 24 (Active LTS, "Krypton") is now the target.** `engines.node` is `24.x`
  (Vercel reads this), `.nvmrc` says 24, `@types/node` is 24. The whole suite was
  run on 24.21.0. The development machine previously ran 22.23.1 (maintenance LTS).
  **Action for the user:** confirm Vercel → Project Settings → Node.js Version is 24.x
  (the `engines` field should select it) and watch the next deployment.
- **Headers:** `X-Powered-By` removed; production CSP (`default-src 'self'`, no
  `unsafe-eval`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri` and
  `form-action` self; scripts keep `'unsafe-inline'` because Next inlines its
  bootstrap and a per-request nonce would make every static page dynamic), nosniff,
  `X-Frame-Options: DENY`, strict referrer policy, `Cross-Origin-Opener-Policy:
  same-origin`, and a Permissions-Policy that disables camera, microphone,
  geolocation, payment, USB, serial, Bluetooth and HID. API routes keep their own
  headers. HSTS is already sent by the host.
- **Disclosure:** `/.well-known/security.txt` (expires 6 October 2027; renew it) and
  `SECURITY.md`.
- **Checked, nothing found:** no `.env` or key files tracked; no secret patterns in
  the tree or history; no browser source maps shipped; no client calls to third
  parties (the GitHub request is server-side); every `dangerouslySetInnerHTML` is
  escaped JSON-LD or a plate built from validated numbers.
- **Open, for the user:** (1) every commit's author email is the personal Gmail
  address, public in the repository history. Future commits can use GitHub's
  `…@users.noreply.github.com` address; removing it from history means rewriting and
  force-pushing, which needs explicit approval. (2) Rate limits for `/api/sea-edition*`
  and `/plate` need a Vercel Firewall rule (a cache miss costs about 6 ms CPU and a
  228 KB response, responses are cacheable). (3) The commit log card publishes
  commit messages by design.

## Keyboard and accessibility pass — 6 October 2026

**Uncommitted, awaiting review.** Real key events (Tab, Shift+Tab, Enter, Space,
arrows, End) in headless Chrome, plus the browser's accessibility tree, found and
fixed:

- **Pinned phone drawing covered focus.** Arriving with Shift+Tab put sliders,
  buttons and links under the sticky plate (WCAG 2.2 *Focus Not Obscured*). Studio
  controls now carry a scroll margin sized to the drawing.
- **Visible label not in the accessible name** (WCAG *Label in Name*): "Play waves"
  was named "Play wave sound", and the theme button was named "Switch to night sea"
  while showing "Day sea". Wave sound, shoreline, hero and theme buttons no longer
  override their names; their visible text is the name. Buttons whose text changes
  no longer also use `aria-pressed` (the label and the state said the same thing
  twice). The theme button still shows the current sea, and its name adds the
  action: "Night sea: switch to day".
- **Tab order:** the hero's "Still the sea" button used to come before the site
  navigation; it now follows it.
- **Chatter:** slider read-outs (`<output>`) were each a live region; they are
  silent now, the sliders already announce their value.
- **Focus ring contrast:** hero rings follow the text colour (they flip with the
  sky/paper); the dark contact panel, the notebook panel and the shoreline (day and
  night) use rings that hold against their own backgrounds.
- **Meaningless landmark name:** the Elsewhere list was labelled "Choose a heading";
  it is now "Set a course". Links that open a new tab say so to screen readers;
  the chapter arrow and decorative arrows are hidden from them.
- Forced-colours (high contrast) emulation reviewed: text and controls stay visible.

Not covered, and not claimed: a real screen reader (VoiceOver, NVDA, TalkBack), the
phone's own keyboard/switch control, speech input, and Reader mode in a real browser.

## GitHub activity redesign — 6 October 2026

**Uncommitted, awaiting review.** Supersedes the "three public events" widget in
the shoreline notes below (the user disliked its look). Why the data changed: GitHub's
public-events feed no longer includes commit messages or counts, so the old card
showed "Pushed code · Maxsash/web" three times. The footer now shows **this site's
own commit log** (`maxsash/web`, public): the three newest commits, grouped by
day, with a type tag (feat/fix/docs…), message and short SHA linking to the commit.
**Deliberately no counts or activity chart** (user feedback: a first version with a
14-day strip and "24 commits in the last 14 days" would read as neglect once the
site is stable). Styled as a ruled
log page on the sand; day and night. Fetched server-side, cached hourly, 2.5 s
timeout; any failure, or an empty list, falls back to a plain link to the
repository. Optional: set a server-only `GITHUB_TOKEN` in hosting to lift GitHub's
60-requests-an-hour limit for shared hosting addresses (not required, not set).
If the repository ever goes private the card shows the fallback. Not a live feed;
dates are UTC and it is not a contributions chart.

## A new sea every visit — 6 October 2026

**Uncommitted, awaiting review.** The user asked for a random sea on each visit.
They considered real device/location/weather signals and declined them: **no
device, location, IP or weather data is read or used** (documented so it is not
re-proposed without being asked). Choice made: *considered* random, not fully
random. `pickVisitSea` picks one of four starting points (Home water, Trade wind,
Glass, Squall; weighted toward the calmer ones), nudges swell, heading and
character, and picks the variation freely. Fully random settings reach legal but
unattractive corners. `/` with no seed is now a fresh version 2 sea per request
(production responds `private, no-store`, so no CDN caches one); `/?seed=…` links
stay fixed and shareable, and the studio opens on the visit's sea. Home water
(`70806d5e`) remains the studio's reset and the fixed sea in the essays. Social
cards are unaffected (static image).

## Structure pass and sea studio — 6 October 2026

**Committed by the user as `223c7cd` after review.** The user flagged repeated
Writing callouts (header, "For the curious mind", Elsewhere), an unclear seed/print
story, and two seed options that looked identical. Decisions:

- **One name, two entry points.** The publication is the **Notebook** everywhere
  (it was Writing / notebook / publication). It appears once in the header nav and
  once as a homepage section that now lists the two sample essays. It is removed
  from Elsewhere, which is now only places that leave the site (Portfolio, GitHub)
  plus email. Dead `#writing` / `#the-notebook` anchors are gone.
- **Order and numbering.** Hero → Work → Sea studio → Notebook → Elsewhere →
  shoreline. Section-level kickers are named, not numbered (the duplicate "02"
  labels are gone); numbers remain only inside lists (projects, destinations).
  Header nav: Work · Sea studio · Notebook · Elsewhere (the blog header matches
  and marks the current page).
- **Landmarks and reading.** Skip link, one `<main id="main">`, and the shore
  `<footer>` is now outside `<main>` so it is the page's contentinfo landmark.
  Notebook headings no longer sit inside a whole-section link. Headings that use
  `<br />` now have a real space so they read "Wonder has a structure", not
  "Wonder hasa structure". Essays are one `<article>` (header, cover, body) with a
  `<time>`; margin notes are paragraphs (nested `<aside>` landmarks removed).
  Mozilla Readability extracts the essay headings and body.
- **Sea studio replaces "An edition of the sea".** Four settings — Swell, Heading,
  Character, Variation — are the seed: eight hex characters = four bytes. Sliders,
  presets (Glass, Trade wind, Squall, Home water), a dice roll and a typed seed all
  edit the same recipe. A live drawing redraws using the very function that prints.
  "Keep it": **Print this plate** (opens `/plate`, a print-ready page that offers the
  dialog), **Save as SVG**, **Sail this sea** (loads it into the hero above) and
  **Copy link**. On phones the drawing stays pinned while the settings move.
- **Why the old seeds looked the same:** version 1 only jittered amplitude ±10%,
  direction ±13° and phase around fixed wavelengths. Version 2 (new, opt-in) lets
  settings change height, heading, long-versus-short balance and wavelength.
  **Version 1 is untouched**: its digest test passes, an unversioned seed or API
  request still means version 1, and `?seed=27c4b901` still works. Version 2 links
  carry `&version=2`. The homepage with no seed now uses v2 `70806d5e`.
- Fixed while auditing (night theme): Elsewhere contact text was nearly invisible
  (contrast 1.39) and day-rust text was too dim on dark paper.

Remaining after commit: physical-device check of the sticky mobile drawing and slider feel, an actual
print on paper, and a screen-reader pass.

## Status update — 6 October 2026

User accepted the day/night sea and shoreline footer ("good to go") and reports
the staged mobile sea, shoreline and revised opening curve work fine on physical
devices; this is the user's report, not a measured trace. The earlier
"uncommitted / awaiting visual selection" wording below is historical: that work
landed in `a8587eb` and later commits. The user also confirmed the homepage
WhatsApp share preview works with the new banner.

Open items from this review:

- **GitHub activity look — not accepted.** The user is unhappy with how the
  workbench's GitHub activity currently looks. Redesign it later (see
  [follow-ups](follow-ups.md)); data fetching is unchanged and not at fault.
- Search Console and sitemap submission are user-side; the user requested
  indexing and submitted the sitemap (Google showed "Couldn't fetch" on first
  read; waiting). The user reports making the apex-to-www redirect permanent
  (308); not re-verified here. Guide: [search and sharing](seo-and-sharing.md).
- Real project/essay content waits until dev work is finished. Remaining dev
  work (notebook depth, edition backend, orientation, C) comes first.
- New: social content (Instagram, LinkedIn, banners) for the studio's pages.

## Daytime sharing banner — 5 October 2026

User requested replacing the old WhatsApp banner with the daytime Living Atlas
and explicitly authorized commit/push. New 1200 × 630 static JPEG captures the
actual sunlit sea/ship renderer with site typography; all sharing metadata uses
`/images/living-atlas-day-v1.jpg`. The new filename changes the image URL for
fresh crawler requests. Compressed image visually reviewed; explicit day/WebGL2
capture, build, lint, types and 20 crawler/page checks pass. QA servers stopped.
Commit subject: `fix: refresh social banner with daytime Living Atlas`.
No manual deployment or actual WhatsApp app/cache refresh is claimed.
Remaining work and full evidence: [search and sharing](seo-and-sharing.md).

## Search and sharing checkpoint — 5 October 2026

User requested WhatsApp sharing checks, SEO and AI/LLM discovery. Local changes
add per-page social cards, shared canonical origin, robots/sitemap and accurate
homepage entity/project JSON-LD. Sample notebook pages remain noindex. The user approved this checkpoint and requested commit/push to `origin/main`
with its documentation. Commit subject: `feat: improve social sharing and search discovery`.
No manual deployment or post-push live verification is included; hosting may deploy on push. Production build, types,
lint and 20 crawler/page cases pass. Read-only live homepage/card checks pass;
actual WhatsApp app previews, Search Console and AI citation outcomes remain open.
Details, commands and next gates: [search and sharing](seo-and-sharing.md).


## Active exploration — day/night sea and shoreline

5 October 2026: the user requested light/dark sea, a beach footer, sand tracks,
optional wave sound, release details, and GitHub activity. Implemented directly
on `/`, **uncommitted and awaiting visual selection**. No sample route, commit,
push or deployment is part of this exploration. It supersedes the earlier
suggestion to deepen notebook writing as the immediate next task.

- The day/night switch is only in the shoreline footer. Theme follows the system
  by default, including OS preference changes, until an explicit choice is saved.
  Sea, ship, drawing phase,
  Work and Elsewhere palettes follow the choice; the blog keeps direction B.
  A shared screen anchor projects the sun/moon direction through the camera for
  both water highlights and ship lighting, including phone aspect ratios.
- One shoreline footer follows Elsewhere, with cached procedural sand/shells,
  a narrow tide (roughly 6–12% of footer height), foam, moving wet sand, and
  bounded fading mouse footprints. Water starts in Elsewhere’s exact day/night
  colour and blends into the beach instead of a large blue expanse.
  Touch keeps native scrolling; it adds no pointer trail. Shore animation is
  capped near 30 Hz and 420,000 canvas pixels, pauses offscreen/hidden, and
  respects reduced motion. These budgets are not physical-device qualification.
- Wave sound is explicitly opt-in via “Play waves” in both header and footer.
  Ordinary scrolling, tapping and key presses never start sound. One tap/click
  on either control starts it, and both become “Mute waves”. Mute is remembered;
  a previous enable does not automatically play on reload. Browser restrictions
  are respected, with retry available if playback is blocked. Hidden tabs suspend
  sound; no external audio asset or analytics is used.
- GitHub points to `ctrl-alt-yash`. The workbench shows three validated public
  events from GitHub, cached hourly with a 2.5-second fetch timeout and a usable
  profile-link fallback. It is neither a live feed nor a contributions chart.
- Release text uses the actual package version, currently `0.1.0`; a short commit
  is shown only when Vercel/build SHA environment metadata exists. Sea model v1
  is labelled separately, without inventing deployment or version data.

Next gate: review the day/night sea and beach on `/`, then repeat iPhone Air
Safari interaction checks for this additional footer before accepting the work.
The prior three-stage mobile sea was confirmed smooth by the user; that result
predates this exploration. Keep the 1,800/600 ms durations, with the revised responsive
opening curve/removal of its reveal hold, and continuous
fine-pointer desktop reveal unchanged. Stop temporary QA servers after checks.

## Previous accepted checkpoint and continuing workflow — main site only

The user selected Elsewhere and explicitly retired the sample-route workflow.
Elsewhere now lives in the homepage with numbered destination rows, direct email
contact and a colophon. The duplicate old homepage footer is removed. The sample
route tree, review-only stylesheet, old card/port stylesheet and sample redirect
configuration are deleted. Sample URL compatibility is intentionally retired.

Future creative work goes directly into the main site, stays uncommitted for
user review, and is committed only when accepted. Do not create sample pages or
review galleries. AGENTS.md records this instruction; it supersedes historical
sample workflow descriptions in research and validation. The labelled sample
essays in the notebook are writing-content status, not sample-route scaffolding;
they remain honest and noindex until actual authored writing is supplied.

The next task at that checkpoint was integrated homepage feedback and deeper
notebook writing; the day/night shoreline request above now takes priority. No sensor/C
feature or hosting deployment is included in this checkpoint.

## Latest selected interaction — staged mobile sea

The user explicitly selected stage-by-stage mobile gestures and unchanged
continuous desktop scrolling. This is approved work on `/`, not an unselected
sample alternative. Three states: **Sea → Structure → Drawing** at
progress 0/.55/1, with a responsive quadratic ease-out for the 1,800 ms Sea → Structure
opening and smootherstep for the 600 ms for other moves. Two upward swipes reach
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
Safari smoothness remains open. Commit subject: `refactor: linger on the first mobile sea reveal`.
Next: deploy/recheck this three-stage flow on iPhone Air Safari, preserving Mac
Chrome improvement. All temporary QA servers are closed after validation.

## Approved foundation and current routes

A is the main website; B is its distinct publication; C remains an optional
mathematical discovery to develop later. **The Living Atlas** uses one authored
sea that reveals its construction through native scrolling and becomes a
reproducible printed plate. The notebook has its own editorial composition.

Two articles remain clearly labelled samples. Work now has two verified real
projects; their proposed spreads and the final port treatment remain under review. No new sensor interaction, real ocean feed or C experience is
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
- The original plan foundation is commit `0feaacc`. The new foundation's final
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
3000/3001/3002/3004/3005 verified closed). Local `fa15491` matches the tracking
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

## Mobile opening curve refinement

The user reported that the 1 → 2 animation seemed idle and then rushed. The long
opening now uses `t * (2 - t)` instead of a flat-start quintic smootherstep.
Mobile progress 0–.55 maps directly onto reveal 0–.5466667, removing the desktop
intro hold for this range. That mapping meets the original mapping exactly at
Structure, so 2 → 3 keeps its original 600 ms curve and reveal path. Desktop
continuous scroll, stage targets, pauses, reduced-motion stills and reversals stay
intact. Actual GPU uniform samples and regression evidence are recorded in current
validation; physical iPhone acceptance must be repeated for this curve.
