# Decisions

What was decided, and why, so it is not re-argued or silently undone. Newest first within
each group. How the code is built: [architecture.md](architecture.md).

## Direction

- **Structure first, then feedback** (owner, 9 October 2026). The structure run (below,
  "Structure and content") settled what goes where and why, and is released. The feedback run
  was built maximalist and the owner kept all of it (below, "Feedback";
  [feedback.md](feedback.md)).
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
- **Squall is "Heavy · choppy", not storm-high** (owner, 9 October 2026: "too wild"). The
  preset was swell 245, character 225, which half-buried the ship; it is now 190 and 200, one
  step down on each. The sliders still reach 255. The crash page's "Rogue wave" keeps the old
  storm-high sea on purpose; one draft's cover sea, which started from Squall, calmed with it.

## Mobile hero

- **Sea → Drawing, one stage per swipe**, with continuous scrolling kept on desktop. Two
  stages since 9 October 2026: the owner found the Structure stage and its text ("Wonder has a
  structure", the numbered list) "empty words", so the middle text is gone on desktop too, and
  the scene note is only "Authored sea / seed". Four stages became three earlier because Waves
  and Structure looked too alike. The 1.8 s opening and 0.6 s moves were approved on a physical
  iPhone; see architecture.md and never change them while refactoring.
- Touch and narrow screens use a smaller rendering budget; Writing links straight to
  `/blog`. Scroll smoothness, not idle cadence, is the measure that matters.

## Structure and content

- **Every section has one job, said once (structure run, 9 October 2026).** A review measured
  the page (13.1 desktop screens, 15.1 phone) and found the offer said four times, Services
  asking for trust before any proof, the strongest work missing from Work, Elsewhere repeating
  About's links, and the real post missing from the home Notebook. The owner answered its
  questions and the page was rebuilt. **Order:** Hero → Work → About → Contact → Notebook →
  Sea studio → shore (the sea studio sits last so the sea ends at the shore). **Nav:** Work,
  About, Notebook, Contact; the blog's nav is derived from it. Section kickers are named, not
  numbered; numbers appear only inside lists. Measured after: 11.1 desktop screens, 15.4 on a
  phone (Work grew from three projects to five).
- **Services is gone.** Its offer is the hero's line; its steps became "What to expect" in
  Contact (Plan, Build, Launch). Plan carries the owner's promise (9 October): advice on what
  will work for the client's business, not what looks fancy or costs too much. Contact also
  holds the backend and real-time line and a "Copy address" button (a `mailto:` link does
  nothing without a mail app).
- **Elsewhere is gone.** Its links live in About (they belong to the person) and in the shore,
  which also shows the email, so the end of every page has a way to write. Its compass moved
  into the home Notebook band (desktop only, 72rem and up).
- **Work shows five projects** (owner, 9 October: "yes, definitely"). For clients: Velora
  Rights as the lead spread, then the real-time intrusion detection platform and the
  business-operations SaaS. Those two were backend systems with no screenshots worth showing,
  so each is drawn as a system plate ("the drawing underneath") from its portfolio case study;
  nothing beyond the case studies is claimed. Then "Of my own": Household Hub and the wedding
  platform. Smaller cards fold role and stack into one line; the lead keeps a facts list.
- **Desktop hero 180svh** (was 255svh; the owner agreed). Phone timings are untouched. Its
  seed label links to the sea studio ("Make your own").
- **Every post ends with an author line**: who wrote it, what the studio builds, "See the
  work" and the email, so a reader arriving at a post can find the offer.
- **Links within a page glide; nothing else does** (owner, 9 October 2026). Section links and
  a link to the page already open (the "Maxsash Studio" links on `/`, "Notebook" on `/blog`)
  scroll smoothly; the latter scroll to the top and keep the sea instead of drawing a new one,
  and focus moves to the page's first control. Not a global `scroll-behavior: smooth`, which
  also glides every Tab focus. Reduced motion jumps. Other pages open at their top at once.
- **One offer: websites and web apps, built end to end** (the owner's choice of one offer;
  on 9 October the wording moved from "web products" to the plainer "websites and web apps",
  which a client understands at once and which covers both kinds of work). One source:
  `site.offer` and `site.promise`. Backend and real-time work is one line in Contact, not a
  second service. The hero's line names the offer and says "Open to freelance work".
- **About:** Yash Shrivastava, founding engineer, 5+ years in backend and real-time systems,
  Tikamgarh, India, working remotely; experience as "Java, then full-stack developer at a
  product SaaS company, 2021–2026. Founding engineer on two freelance platforms" (the company
  unnamed; owner, 9 October); tools;
  links to the portfolio, LinkedIn and GitHub; and the headshot (the owner's GitHub and
  LinkedIn picture, from the 1254 px original, exported at 720 px with no metadata; approved for
  the repo on 9 October 2026). No employer, degrees or phone.
  Facts come from the owner's portfolio (`development/personal/portfolio`, live and current).
- **About's portrait is "the drawing underneath", in a round compass medal** (9 October 2026).
  The plain photo was "too vanilla"; a rectangular plate was "better but not it". The owner asked
  for a round frame (important), a monochrome photo and the same animation when scrolling away.
  - The photo is monochrome in the theme's own two colours (ink to paper by day, paper to ink by
    night), so it reads as a print, not a snapshot.
  - The frame is a compass bezel, echoing the compass in the home Notebook: a tick every 5°, a dotted
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
  once as a home section, which shows the three newest entries: written notes first, then the
  two sample essays. The owner keeps the samples as placeholder content, to judge the look
  and feel, until he rewrites them in his own words (9 October).
- **One `<main>`**, the footer outside it as the contentinfo landmark, no whole-section
  links around headings, one `<article>` per essay.
- **The commit-log card** shows the three newest commits and no counts or charts: a
  14-day strip and "24 commits in the last 14 days" reads as neglect once the site is
  stable. It publishes commit messages by design.
- **Theme follows the system** until the visitor picks day or night in the
  footer.

## Feedback

- **One table, one vocabulary** (9 October 2026). Every action's answer lives in
  `lib/feedback/vocabulary.ts`, so the owner's review turns into one-line edits. The same kind of
  action answers the same way everywhere.
- **Every channel answers every visitor**: sound (after the first press; see "Sound"), ink,
  type, the sea, cursors, notices and haptics. Haptics need a first interaction and only Android
  vibrates.
- **Levels are relative, and measured** on the laptop-speaker model: focus < hover < the dial's
  tick < a press < a roll, every cue under a page turn and none lost (above -56 LUFS). Touch has
  no hover, so a tap answers with the press.
- **What a sound tells is also shown:** copy, mail, offline and online use one polite notice;
  refusals mark the field. Buttons whose result speaks (`data-press="none"`) do not also click.
- **Responses before arrival exist only with JavaScript** (`html[data-feedback]`), so a reader
  without it sees everything at once.
- **Keep one coastal character by day and night** (10 October 2026 refinement). The owner
  asked whether night needs a different creature. One gull is the working design choice:
  night activity is plausible ([Australian Museum](https://australian.museum/learn/species-identification/ask-an-expert/harbour-bridge-birds/)
  describes Silver Gulls flying and feeding after dark;
  [Rutgers](https://www.researchwithrutgers.com/en/publications/nocturnal-behavior-of-gulls-in-coastal-new-jersey)
  studied nocturnal coastal gull activity). These sources support plausibility, not identical
  behaviour in every gull species. At night the same stylised herring gull gets moonlight,
  one brief note phrase, fewer habits and a tucked resting pose after 12 s unless engaged.
  Hover, keyboard focus and a nearby pointer keep it awake. By day its existing invitation
  schedule stays. This is an authored coastal scene, not a location-specific wildlife simulation.
- **The gull touches the pill's edge** (owner, 10 October 2026 correction): remove the 10 px
  bottom inset and align the projected belly/feet with the border centreline, including standing
  and sleeping. A responsive header reserves space above the hero copy; short screens use
  compact copy, without changing the approved sea timing. Resize/DPR changes refit the gull;
  an arrival interrupted by rotation settles rather than jumping across the new layout.
  On short screens (620 px or less), hide the secondary seed link to keep the
  offer and controls clear; the sea studio remains in the page.
- **Refine the gull at button size** (owner, 10 October 2026): fuller chest and crown,
  hooked bill with red mark, visible eyes and white primary spots on black wingtips. More
  inset space separates it from the label and the pill's curved end. Wingbeats are slower;
  braking eases smoothly to zero, wing-folding and sitting finish in 1.8 s, and takeoff climbs.
  A press during arrival or while standing begins departure from its current pose.
- **A gull is the only moving hint for "Play waves"** (the owner's idea, 10 October 2026: a bird
  that "flies in and sits on that button ... without doing it on their face"). It is a low-poly
  herring gull in the ship's style, drawn on a small canvas inside the hero's button. Research
  (`../web-research/reports/Website feedback beyond sound.md`) shaped the rules: motion onset
  catches the eye but travelling motion distracts most, so it arrives once, after the button has
  been in view for 3 s and scrolling has stopped, flies in under 5 s, then moves only in place,
  rarely, and is still after 45 s; it leaves when the waves start and nothing about it is stored.
  **It comes on every page load while the waves are off, even for a visitor who muted the sounds
  or turned the waves off before** (owner, 10 October 2026: that visitor may be happy to hear them
  today); it used to stay away from them. To make it an obvious, deliberate invitation it sings:
  amber notes leave its beak in phrases until 36 s. It sits **inside** the pill, on its floor, and
  the pill widens for it as it lands: on top there were 21 px of room (none for notes), and over
  the label it would hide the words that are the accessible signal. Pressing the gull is pressing
  the button (it is inside it). "Still the sea" freezes it; reduced motion shows it perched and
  still, with two still notes. In the drawing chapters it becomes its own ink wireframe. No study
  shows a creature on a control raises clicks; it is kept for delight and is one prop to remove.
- **Scroll cost is measured, not assumed.** A smooth settle of the headings' font axes reflowed
  them every frame (95 layouts in one scroll), so they settle in three steps. The depth line and
  the reading ribbon cost one style recalculation per frame (about 0.1 ms on an M4 Pro, frame
  pacing unchanged); the owner kept them.

## Sound

- **The waves are opt-in; every other sound is feedback and plays by default** (owner, 9 October
  2026: "everything else is feedback by design"). Replaced rule: "one switch for every sound",
  where page turns and the compass waited for "Play waves". Browsers allow no sound before a
  visitor's first click, tap or key press, so hovers and scrolling are silent until then; from
  that press on, every answer sounds. The waves still wait for "Play waves", and that choice holds
  across pages and visits: they fade out in the notebook, come back with the shore without
  another click, and after a reload resume at the first click, tap or key press (a first click on
  the wave button itself plays rather than mutes).
- **"Mute sounds" lives on the shore only** (owner's choice, 9 October 2026, over no button and
  over one in the hero too). Earphones and a muted device cover most visitors, but a
  screen-reader user cannot mute the device without silencing the reader. It silences every
  sound, waves included, and is remembered (`studio-sound`); "Unmute sounds" brings back the
  answers, not the waves, and answers with a press. "Play waves" also unmutes.
- **No cue lasts 3 seconds or more**, so nothing that can play unasked (the foghorn when the
  connection drops) needs a stop control.
- **The surf is mixed to be heard on laptop speakers** (9 October 2026: the owner could not hear
  it without maxing a MacBook's volume). The old waves sat at about -46 LUFS with most of their
  energy below 150 Hz, which small speakers cannot play. The surf is now a 33-second loop of
  three breakers, washed between 300 and 1,600 Hz with the rumble below 90 Hz removed: about
  -32 LUFS, never fading to silence, its crests 5-6 dB over its lulls. A page turn ducks the
  waves by 9 dB so it stays on top. Levels are pinned by tests on a laptop-speaker model.
- **The waves belong to the shore.** They play on the home page only; the notebook is quiet but
  for page turns, which also play on the browser's back and forward into or within it.
- **The compass bezel ticks like a dial** (the owner's idea, 9 October 2026): one tick per
  degree the ring turns as the medal scrolls past, at most 32 a second so a fast scroll is a
  "trrrr", never a buzz. Jumps (a link, a restored scroll) turn silently. The ring does not turn
  under reduced motion, so neither does the sound. The first ticks were pitched and muffled and
  sounded "underwater, bubbly"; they are now sharp mechanical ticks: a snap with resonances
  shorter than a millisecond and a softer catch, over in 3 ms, mostly above 2 kHz.

## Writing

- **Posts are markdown, drafts are development-only.** A post marked `draft` is visible in
  `pnpm dev` and cannot ship by accident: the production build has no page and no link for
  it, and `check-seo` fails if one is served. Publishing is a one-word edit.
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
