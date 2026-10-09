# Decisions

What was decided, and why, so it is not re-argued or silently undone. Newest first within
each group. How the code is built: [architecture.md](architecture.md).

## Direction

- **A is the main site, B is the blog, C is an optional Easter egg.** A ("Living Atlas")
  is one authored sea that reveals its own mathematics as the visitor scrolls and
  becomes a printable plate. B (the Notebook) is a separate editorial composition in ink
  and bone. C is not built; there is no hidden entrance.
- **Sea, Ship, Math** is the idea. The first impression must work without a tutorial
  or any input; interaction is offered only where it has a rich, legible payoff.
- **Creative changes go directly into the main site.** No sample routes, no review
  gallery. Leave them uncommitted for review.
- **The first creative review was rejected** (notebook too similar to the home page;
  explicit ship controls too simple). The Wind-versus-Helm choice, harbour controls and
  voyage were removed and are not coming back.
- **Be honest in copy.** The two essays are labelled samples and `noindex` until real
  writing exists. Only real projects appear (Velora Rights, Household Hub,
  Wedding Photo Platform). The sea is an authored study, not
  an ocean observation, and nothing implies tilt, live data or fluid simulation.
- Real essays and projects come last.

## The sea

- **A fresh sea each visit**, chosen from four curated starting points with nudged
  settings (fully random settings reach ugly corners). **No device, location, IP or
  weather data is read**; the owner considered those signals and declined them.
- **Version 1 is frozen.** An unversioned seed or API request means version 1 forever;
  generated links carry `&version=2`. Version 2 exists because version 1 only jittered
  amplitude, direction and phase, so different seeds looked alike.
- **Four settings are the seed:** swell, heading, character, variation, one byte each.
  The studio's sliders, presets, dice and typed seed all edit that one recipe, and the
  live drawing is the very function that prints.
- Home water (`70806d5e`) is the studio's reset and the sea in the essays.

## Mobile hero

- **Sea → Structure → Drawing, one stage per swipe**, with continuous scrolling kept on
  desktop. Three stages (not four) because Waves and Structure looked too alike.
  Durations and curves are approved on a physical iPhone; see architecture.md and never
  change them while refactoring.
- Touch and narrow screens use a smaller rendering budget; Writing links straight to
  `/blog`. Scroll smoothness, not idle cadence, is the measure that matters.

## Structure and content

- **Client-first homepage (chosen 9 October 2026).** A visitor who might hire Yash should
  learn what is on offer, see proof, meet the person and find the email before the
  explorations. **Order:** Hero → Services → Work → About → Contact → Sea studio → Notebook →
  Elsewhere → shoreline. **Nav:** Services, Work, About, Notebook, Contact (the sea studio and
  Elsewhere left the nav). The blog's nav is derived from the same list. Section kickers are
  named, not numbered; numbers appear only inside lists.
- **One offer: web products, end to end** (the owner's choice; more offers add complexity).
  Backend and real-time work is mentioned in one line, not as a second service. The hero's
  line names the offer and says "Open to freelance work".
- **About:** Yash Shrivastava, founding engineer, 5+ years in backend and real-time systems,
  Tikamgarh, India, working remotely; the freelance projects named in one sentence; tools;
  links to the portfolio, LinkedIn and GitHub; and the headshot (the owner's GitHub and
  LinkedIn picture, from the 1254 px original, exported at 720 px with no metadata; approved for
  the repo on 9 October 2026). No employer, degrees or phone.
  Facts come from the owner's portfolio (`development/personal/portfolio`, live and current).
- **About's portrait is "the drawing underneath", in a round compass medal** (9 October 2026).
  The plain photo was "too vanilla"; a rectangular plate was "better but not it". The owner asked
  for a round frame (important), a monochrome photo and the same animation when scrolling away.
  - The photo is monochrome in the theme's own two colours (ink to paper by day, paper to ink by
    night), so it reads as a print, not a snapshot.
  - The frame is a compass bezel, echoing the compass in Elsewhere: a tick every 5°, a dotted
    ring, the name and title on the top arc, Tikamgarh and its coordinates on the bottom. The
    tick ring turns slightly as the medal passes.
  - The engraving: 72 lines of Home water lifted by the photo's light, drawn front to back. One
    scroll timeline covers the medal's whole pass: lines print as it enters, the photo surfaces
    around the middle and sinks back into lines as it leaves. Hover brings the lines back.
  - Explored and not chosen: a coin with a beaded rim, a porthole with bolts (more decorative), a
    navigator's log, and a wave squiggle (the face did not read on this dark background).
- **One page for the pitch, own pages for depth** (9 October 2026, after reviewing the
  evidence: NN/g attention studies, Chartbeat, long-page A/B tests, Google's handling of URL
  fragments). The homepage stays a single scroll for one offer; case studies will move onto
  `maxsash.com/work/<project>` later so clients stay on the site and each project can rank. The
  2.5-screen hero is the main attention risk; judge it with field data.
- **Velora Rights leads Work** (9 October 2026): the one client project, with a measured outcome
  (enquiries from organic search), is the strongest proof for a potential client. Its image is
  a 1200 × 750 capture of the live homepage after the disclaimer; the advocate's name stays off
  this site.
- **One name:** the publication is the **Notebook**. It appears once in the header and
  once as a home section. Elsewhere lists only places that leave the site (Portfolio,
  GitHub); the email lives in Contact.
- **One `<main>`**, the footer outside it as the contentinfo landmark, no whole-section
  links around headings, one `<article>` per essay.
- **The commit-log card** shows the three newest commits and no counts or charts: a
  14-day strip and "24 commits in the last 14 days" reads as neglect once the site is
  stable. It publishes commit messages by design.
- **Wave sound is opt-in.** Scrolling, tapping and key presses never start audio; mute is
  remembered; reload never plays.
- **Theme follows the system** until the visitor picks day or night in the
  footer.

## Writing

- **Posts are markdown, drafts are development-only.** A post marked `draft` is visible in
  `pnpm dev` and cannot ship by accident: the production build has no page and no link for
  it, and `check-seo` fails if one is served. Publishing is a one-word edit.
- **The page-turn sound respects the existing sound rule.** It plays only after the visitor has
  switched sound on (the owner chose this over always-on and a separate toggle), so ordinary
  clicks stay silent by default.
- **The editor is a development tool, enforced by the build.** Its routes use `.dev.tsx`
  extensions that only exist outside production, rather than a runtime `if` that could be
  forgotten. The save endpoint refuses anything but same-origin JSON from localhost.
- **Posts are not indexed yet**, like the sample essays, until the owner decides otherwise.

## Error pages

- **Chosen 9 October 2026.** Each error page splits in half: the message centred on top, the
  real WebGL sea below (the plate when there is no GPU). **What floats tells how bad it is:**
  the homepage ship means all is well and never appears on an error page; a torn page or bare
  driftwood for a missing page, a log raft for trouble, a single plank for disaster.
- **Which page gets which scene:** unknown address, "Nothing on the horizon" (glassy sea, one
  plank, no paper); unknown or draft note, "Torn from the notebook" (ruled paper torn across, the
  scrap floating below); bad `/plate` seed, "Half drawn" (the sea stuck mid-way into its
  engraving, a raft); a page crash (`error.tsx`), "Rogue wave" (night squall, tilted horizon,
  raft); the whole site down (`global-error.tsx`), "Caught in the storm" (a whirlpool under a
  turning storm, lightning, a plank circling the drain).
- **Rejected:** wireframe-only seas, the "torn out" printed page for the site 404 (the owner
  preferred the open horizon), and a torpedo hitting the raft. The red upside-down sea
  ("Capsized") is parked as an Easter egg idea ([follow-ups.md](follow-ups.md)).
- Lightning is one soft flash every few seconds, never a flicker, and no motion at all under
  reduced motion.
- **Unknown notes render on demand** (`dynamicParams` removed from `/blog/[slug]`), because
  with only prebuilt slugs an unknown note never reached the notebook 404. The page still
  calls `notFound()`, so the status stays 404.
- **Error-page weight on every route is kept to the message:** Next loads the error
  boundaries with every page, so the sea behind them loads lazily (measured on the
  homepage: about +6 KB gzipped JS and CSS, down from +24 KB when the sea loaded eagerly).
- After a crash, "Back to the studio" is a full page load, not a client navigation, so the
  studio starts from a clean state.

## Accessibility

Keyboard and automated checks led to: focus never hidden by the pinned phone drawing
(studio controls carry a scroll margin), visible text is the accessible name (no
overriding `aria-label` on buttons), the hero pause button follows the site navigation in
tab order, slider read-outs are not live regions, focus rings hold their contrast on every
background, and links that open a new tab say so. Forced-colours emulation was reviewed.
A real screen reader has not been tried.

## Performance

PageSpeed Insights, 8 October 2026 (lab only, no field data yet): mobile 57, desktop 62;
LCP 3.3 s mobile and 0.7 s desktop, CLS 0, FCP 1.6 s and 0.4 s. The loss was almost all
Total Blocking Time, from a continuous WebGL scene on a GPU-less lab machine.

- **Software rendering gets the static plate** (`failIfMajorPerformanceCaveat`). Real
  visitors without a GPU benefit, and the lab no longer measures software rasterising.
  Locally, with no GPU, blocking time is 0 ms on desktop and 85 ms on the phone profile.
  After release (8 October 14:41 IST, one run): desktop 99, mobile 92, TBT 20 ms and 100 ms.
- **Cached home page: not done, leaning no.** Today the server picks the random sea, so `/`
  is `private, no-store` and every visit renders (Lighthouse estimates 510–720 ms on the
  document request). The alternative is a cacheable page whose browser picks one of the
  four starting seas. Pros: edge-cached HTML, faster first byte, less server work, and
  `?seed=` links could stay shareable. Cons: no-JavaScript visitors and crawlers always
  see the default sea; the plate and "Authored sea" text change after load (or are hidden
  until chosen); `?seed=` would have to be read on the client; hydration mismatch risk
  around randomness; a real refactor of the hero, the plate and the studio; and it
  changes the approved "a fresh sea from the first byte". Revisit only if field data
  shows a slow first byte.
- **Where the time goes** (PageSpeed mobile LCP breakdown: first byte 820 ms, element render
  delay 780 ms). First byte: the home page is rendered per request, and the response header
  `x-vercel-id: bom1::iad1` shows the edge is in Mumbai but the function runs in **iad1 (US
  East)**; live timings from India were 0.4–1.8 s. Moving the function region closer to the
  audience (Vercel project settings, or `regions` in `vercel.json`) is a cheaper lever than
  caching the page, but it depends on where visitors are, so it is the owner's call. Render
  delay: with Slow 4G and no server latency, the heading paints at about 0.9 s; the two
  render-blocking stylesheets and 206 KB of preloaded fonts share the link with the HTML.
  The font axes (`SOFT`, `WONK`, `opsz`) are all in use, so trimming them is not free.
- **Forced reflow (168 ms in the report)** is the initial hero layout (about 130 ms at 4×
  CPU throttle locally). `content-visibility: auto` on the sections below changed it by
  under 10%, so it is not worth doing.
- The "sailing" pill used `opacity: 0.65` and failed contrast; it now uses the muted ink
  colour (5.2:1 day, 7.8:1 night).

## Security and hosting

- **Next.js 16.3.8** (16.2.9 had critical advisories; the site used none of the affected
  features). `pnpm audit --prod` reports no known vulnerabilities.
- **Node 24** is the target (`engines.node`, `.nvmrc`, `@types/node`).
- **Production CSP and hardening headers**, no `X-Powered-By`, `security.txt` and
  `SECURITY.md`. No secrets, source maps or third-party client calls.
- **Open:** rate-limit `/api/sea-edition*` and `/plate` with a Vercel Firewall rule (a
  cache miss costs about 6 ms of CPU and a 228 KB response).
- **`main` never deploys; only `production` does.** Release with
  `git push origin main:production`. `vercel.json` disables deployments for `main`.
  Vercel's Production Branch Tracking is set to `production`.
- **Commit identity:** history was rewritten so every commit carries
  `maxsash <16003409+ctrl-alt-yash@users.noreply.github.com>`; the personal address must
  never appear in the repository. The old hashes stay reachable on GitHub until garbage
  collection, which the owner accepted.

## Code quality

Conventions are in [AGENTS.md](../AGENTS.md). The cleanup in [code-cleanup.md](code-cleanup.md)
(Prettier, dead code removed, repetition removed, long modules split, docs cut) was done
without changing behaviour: every step was compared against the previous build.

## Open

Physical-device checks beyond the approved iPhone flow, a real screen reader, field Web
Vitals, a paper print, social content and real essays are tracked in
[follow-ups.md](follow-ups.md) and [handoff.md](handoff.md).
