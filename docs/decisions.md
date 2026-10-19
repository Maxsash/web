# Decisions

What was decided, and why, so it is not re-argued or silently undone. Newest first within
each group. A changed decision rewrites its entry; a rejected idea keeps one line saying why.
How the code is built: [architecture.md](architecture.md).

## Direction

- **A is the main site, B is the blog, C is an optional Easter egg.** A ("Living Atlas")
  is one authored sea that reveals its own mathematics as the visitor scrolls and
  becomes a printable plate. B (the Notebook) is a separate editorial composition in ink
  on chart paper. C is not built; there is no hidden entrance.
- **Sea, Ship, Math** is the idea. The first impression must work without a tutorial
  or any input; interaction is offered only where it has a rich, legible payoff.
- **Creative changes go directly into the main site.** No sample routes, no review
  gallery. Leave them uncommitted for review.
- **The first creative review was rejected** (notebook too similar to the home page;
  explicit ship controls too simple). The Wind-versus-Helm choice, harbour controls and
  voyage were removed and are not coming back.
- **Be honest in copy.** Only real projects appear (the five in Work) and only
  owner-approved writing is published. The sea is an authored study, not an ocean
  observation, and nothing implies tilt, live data or fluid simulation.

## Brand, type and colour

- **One brand everywhere, from the site's own sources** (owner, 11 October 2026). Icons keep
  the mark's geometry in hero cream `#F5F0DF` on sea `#1C6894`. The default share card
  is the live hero (Home water sea and cutter, Montagu Slab headline, the offer). Social
  images use the same captures and fonts; profile copy reuses the site's lines verbatim, with
  real figures only and the phone number only inside the WhatsApp link. The kit lives beside
  the repo in `../brand/`. The manifest uses `display: browser` because the site is a
  website, not an installable app. The home page's Organization data names the LinkedIn
  Page (`/company/maxsash`), Instagram (`@maxsashstudio`) and the founding date (June 2026).
- **WhatsApp links the business number** (owner, 12 October 2026: usernames "aren't currently
  working"). `wa.me/919183636567`, from `whatsappNumber` in `content/site.ts`, never shown as
  text; the username `@maxsash` stays reserved. A username check cannot prove anything:
  WhatsApp's web page accepts any well-formed username.
- **Type and colour of their own** (owner, 10 October 2026). The Fraunces/Inter/JetBrains
  stack read as the generic AI look and its headings were hard to read; a first pick (Besley +
  Atkinson Hyperlegible) was replaced for fresher faces. **Montagu Slab** for display and essay
  text, **Rethink Sans** for text and labels, **Reddit Mono** only for data. Montagu Slab has
  no italic, so _Math._ and essay emphasis use the browser's slanted roman. Palette **Open
  water** (owner, 17 October 2026; the dark teal-navy "Admiralty chart" read as neither sea,
  ship nor maths): chart paper, day-sea blue `#1C6894` for bands and tiles with sail cream on
  it, deep-sea ink `#0E3B4E`, sun `#F2C46B` for _Math._ (sunlight `#F9E0A8` for small text on
  blue), the pennant red `#B13D1A` as the accent on paper; night stays dark, tinted blue. A
  pale sky with dark text and a sky gradient lost; chart magenta is retired. Display tracking
  stays between −0.02em and +0.01em. **Italic only where it means something**: _Math._.

## The sea

- **Weather the cutter, used but never damaged** (owner, 14 October 2026; in 1.0.0). Sun-faded
  paint, a waterline grime line, faint salt streaks, silvered deck planks, weathered varnish,
  tarnished brass with polished touch points, slightly uneven canvas with a dirtier foot,
  sail corner patches and one reef band. No rust, cracks, holes, patches over tears or
  missing parts. Emblem, pennant, outline, motion and Drawing mode stay as approved.
- **A gentle atmosphere for each India day** (owner, 13 October 2026). A deterministic daily
  choice sets one of three restrained moods (clearer, wispier, slightly hazier) shifting
  clouds, cirrus, horizon haze, halo and daylight glitter; night shares the clouds and a faint
  haze. It follows the Moon's day, including the preview and midnight refresh. Authored
  variety, not weather data.
- **Clouds live in the sky only** (owner, 13 October 2026). A few soft irregular clusters
  shared by day and night, warm daylight edges, subdued moonlight, slow drift on the paused
  scene clock; stars and planets soften behind them. Their sea shadows and reflection dimming
  were built and removed: not enough visible value. No replacement is approved.
- **The first water pass was rejected** (owner, 13 October 2026: "they aren't looking any
  good"). Heading-aligned micro-normals, crest foam and a thin wake were removed with their
  modules and tests. A future water pass needs a different visual approach, not more of this.
- **Restrained daylight atmosphere and glitter** (owner, 13 October 2026): sparse feathered
  cirrus, luminous horizon haze, a soft solar halo and a broken sun-reflection path from
  wave-facing normals, keeping headline space, sea mathematics, stage timings and night.
- **A Dragon Ball on the sail** (owner, 13 October 2026): the orange four-star ball (amber
  disc, darker orange rim, four red stars) on both sail faces, replacing the interim MS
  initials and compass marks.
- **The night sky is a dated daily snapshot around a framed Moon** (owner, 12 October 2026).
  Accuracy is day-wise: about 21:00 IST over Tikamgarh, not a live sky. The Moon stays
  composed in its place, even on nights it is below the real horizon, and the dated sky is
  drawn around it. Built in phases: stars dimming with lunar light (most near new Moon, the
  brightest still at full), planets, moonlit sea, a mapped Moon, then a water-motion review.
  Wind waves stay independent of lunar phase: the largest tidal range comes near both new and
  full Moon and does not set wind-wave height. How it is built and its limits: [sky.md](sky.md).
- **The mapped Moon shows whenever the night sky shows the Moon** (owner, 12 October 2026).
  A zoom-gated reveal still swapped one Moon for another, so it is always on: the 2025 NASA
  SVS 2K map at the shader Moon's size and place, near-side crop only, never requested by
  day, shaded in a worker. Native zoom reveals the detail already there; no zoom detection,
  shortcut or panel. Credit in the footer.
- **The Moon lights the sea, not the waves** (12 October 2026). The night specular path
  follows the dated illuminated fraction with an authored curve beneath the framed Moon;
  moonless water stays readable. Visual lighting, not measured moonlight or a tide model.
- **The development sky preview is temporary** (owner, 12 October 2026). In `next dev` only,
  a control picks any date from 1800–2050 or one of eight nearby phases and switches to night.
  Remove it after the owner's sky review.
- **Touch the sun or Moon to change the sea** (owner, 12 October 2026). A click, tap or key
  starts one restrained ripple beneath the light's reflection and blends sky, water and ship
  over one second. The labelled shore control and its saved choice stay. Reduced motion or a
  stilled sea changes at once. The target is at least 44 px, keyboard accessible, hidden in
  Drawing, fallback or over text; hover feedback only on devices that hover.
- **The hero Moon follows the India calendar date** (owner, 12 October 2026). Orbits and
  illumination are computed locally at noon IST for the whole date and refresh at India
  midnight, even in a still scene. Northern-hemisphere orientation (waxing right). The whole
  disc stays: the unlit side looks unlit, with faint earthshine across the boundary, never a
  black cover. Date-correct phase, not a local observation; the fallback plate and error-page
  moons stay fixed.
- **An authored survey cutter** (10 October 2026, for the owner's ask of a unique ship): a
  gaff cutter in ink, rust, brass and bone canvas with a shaped hull, deck fittings, jib,
  bowsprit, rigging and a narrow pennant. It softens short chop, fits around the actual copy
  and controls, and frames the Drawing camera on the same vessel. Not a sailing simulator.
- **Landscape sea studio uses two columns** (owner, 10 October 2026). At 560–960 px wide and
  ≤620 px high the introduction, settings and keep actions sit left and the whole drawing
  right, visible while editing. Portrait and large screens are unchanged.
- **A fresh sea each visit**, from four curated starting points with nudged settings (fully
  random settings reach ugly corners). **No device, location, IP or weather data is read**;
  the owner considered those signals and declined them.
- **Version 1 is frozen.** An unversioned seed or API request means version 1 forever;
  generated links carry `&version=2`. Version 2 exists because version 1 only jittered
  amplitude, direction and phase, so different seeds looked alike.
- **Four settings are the seed:** swell, heading, character, variation, one byte each. The
  studio's sliders, presets, dice and typed seed edit that one recipe, and the live drawing is
  the very function that prints. Home water (`70806d5e`) is the reset and the essays' sea.
- **Squall is "Heavy · choppy", not storm-high** (owner, 9 October 2026: "too wild"): swell
  190 and character 200, one step down from 245 and 225. The sliders still reach 255; the crash
  page's "Rogue wave" keeps the storm-high sea on purpose.

## Mobile hero

- **Browser bars match the page** (owner, 12 October 2026). The hero's bars take the sky above
  and the sea below; other pages take their own paper or sky. Colours are measured from the
  render, verified in iOS 26.5 and 27 simulators and headless Chrome.
- **Mobile stages tolerate scroll offsets** (10 October 2026 fix). Swipes work while most of
  the hero is visible, and a confirmed stage change aligns it to the top. Back's enabled state
  belongs to React; mutating it in the DOM silently blocked clicks.
- **Sea → Drawing, one stage per swipe**, continuous scrolling on desktop. Two stages since 9
  October 2026: the owner found the Structure stage's text "empty words", so it is gone on
  desktop too. The 1.8 s opening and 0.6 s moves were approved on a physical iPhone; see
  architecture.md and never change them while refactoring.
- Touch and narrow screens use a smaller rendering budget; Writing links straight to `/blog`.
  Scroll smoothness, not idle cadence, is the measure that matters.

## Structure and content

- **Every section has one job, said once** (structure run, 9 October 2026). A review found the
  offer said four times, Services asking for trust before any proof, the strongest work missing
  from Work, Elsewhere repeating About's links and the real post missing from the home Notebook.
  **Order:** Hero → Work → About → Contact → Notebook → shore. **Nav:** Work, About, Notebook,
  Contact; the blog's nav derives from it. Kickers are named, not numbered.
- **The sea studio has its own page, `/sea`** (owner, 11 October 2026: "this playground is
  adding confusion to the homepage"). It opens with "Make your own sea.", a plain paragraph
  and three numbered steps matching the controls. The hero's "Make your own →", the print page
  and the shore's colophon link it; "Sail this sea →" opens the homepage with the seed.
- **The shore holds the studio's channels, About holds the person's** (owner, 11 October 2026).
  Contact offers WhatsApp beside the email; the shore and the Notebook footer list WhatsApp,
  Instagram and the LinkedIn Page, and the shore the email. Portfolio, personal LinkedIn and
  GitHub stay in About.
- **Services is gone.** Its offer is the hero's line; its steps became "What to expect" in
  Contact (Plan, Build, Launch). Plan carries the owner's promise: advice on what will work
  for the client's business, not what looks fancy or costs too much. Contact also holds the
  backend and real-time line and "Copy address" (a `mailto:` link does nothing without a
  mail app).
- **Elsewhere is gone.** Its links live in About; the shore shows the email and the studio's
  channels, so every page ends with a way to write. Its compass moved into the home Notebook
  band (desktop only, 72rem and up).
- **One offer: websites and web apps, built end to end** (the owner's choice, 9 October 2026,
  plainer than "web products"). One source: `site.offer` and `site.promise`. Backend and
  real-time work is one line in Contact, not a second service. The hero says "Open to
  freelance work".
- **Make backend credibility explicit** (owner, 11 October 2026). Hero and metadata name
  backend and real-time systems. Show mechanisms, tradeoffs and known production evidence; no
  superlatives or invented operational metrics.
- **Work shows five projects** (owner, 9 October 2026). Client work: Velora Rights as the lead
  spread, then business operations and real-time intrusion detection (order from 10 October:
  closest to what a small-business client buys). Then "Of my own": the wedding platform, then
  Household Hub.
- **Velora Rights leads Work** (9 October 2026, reconfirmed 11 October): the offer itself, a
  paying client and a business outcome. The wedding platform's strengths are engineering, which
  a client buys less; its story suits an essay. Leading with business operations is an open
  option if backend clients become the main audience.
- **Three cards, two rows** (owner, 10 October 2026). The client projects keep full cards; the
  personal ones are compact ruled rows, all one click from home. The measure is the distance
  to Contact, not page length. Rejected: all work behind a click (the proof is the pitch), and
  lead plus four rows (loses both system drawings). `/work` stays a redirect until there are
  more than about six projects.
- **A card is a hook, the case study is the depth** (10 October 2026). Each card: plate,
  headline, one summary, one **proof** line and "Read the case study →". Role, stack, dates
  and demo links live on the case study. Proof lines use the owner's figures; small numbers are
  shown as evidence that the work is real and used, while headline and summary carry scope.
- **Every client card is a system drawing** (owner, 11 October 2026). Velora's pale screenshot
  moved under its drawing on the case study. The Work lede says why: "I am a backend engineer
  first, so the client work is shown as the system underneath".
- **Show private systems through their real boundaries** (owner, 11 October 2026). Business
  operations: selectable modules, adaptable insights, privacy, accessible workflows, a build
  of about six months. Intrusion detection: local LAN computing, a minimum-data notification
  boundary, the RTSP-to-browser video service, about eight months. Do not infer encryption,
  protocols, metrics or calendar dates the owner did not supply. The narrow drawing label is
  "Buying" (purchasing stays in the module ID and prose).
- **The website is for clients, the portfolio for recruiters** (owner, 10 October 2026). Case
  studies at `/work/<slug>` are written for a client (brief, what was built, the decisions
  and why, the outcome; 2–5 minutes) and are not copies of the portfolio's, which keep their
  own framing and URLs (no cross-canonicals). About keeps the portfolio link.
- **One page for the pitch, own pages for depth** (9 October 2026, after NN/g attention
  studies, Chartbeat, long-page A/B tests and Google's handling of fragments). The homepage
  stays one scroll for one offer; case studies have their own URLs so each can rank. The hero
  is the main attention risk; judge it with field data.
- **Desktop hero 180svh** (was 255svh; the owner agreed). Phone timings are untouched.
- **Every post ends with an author line**: who wrote it, what the studio builds, "See the
  work" and the email, so a reader arriving at a post finds the offer.
- **Links within a page glide; nothing else does** (owner, 9 October 2026). Section links and
  links to the page already open scroll smoothly; the latter go to the top, keep the sea and
  move focus to the page's first control. Not a global `scroll-behavior: smooth`, which also
  glides every Tab focus. Reduced motion jumps.
- **About:** Yash Shrivastava, founding engineer, 5+ years in backend and real-time systems,
  Tikamgarh, India, working remotely; "Java, then full-stack developer at a product SaaS
  company, 2021–2026. Founding engineer on two freelance platforms" (company unnamed); tools;
  portfolio, LinkedIn and GitHub; the approved headshot (720 px, no metadata). No employer,
  degrees or phone. Facts come from the owner's portfolio (`development/personal/portfolio`).
- **The ghost photo may be public** (owner, 15 October 2026): the Easter egg's photo of the
  owner is committed at `public/images/ghost-photos/yash-shrivastava.webp` (no metadata),
  ready for the Metal Gear Solid style ghost photos.
- **About's portrait is "the drawing underneath", in a round compass medal** (9 October 2026;
  the plain photo was "too vanilla", a rectangular plate "better but not it"). A monochrome
  photo in the theme's two colours, a compass bezel (tick every 5°, name and title on the top
  arc, Tikamgarh and coordinates below) whose ring turns as it passes, and an engraving of 72
  lines of Home water lifted by the photo's light that prints in and sinks back as the medal
  scrolls. Not chosen: a beaded coin, a bolted porthole, a navigator's log, a wave squiggle.
- **One name:** the publication is the **Notebook**, once in the header and once as a home
  section showing the three newest entries.
- **One `<main>`**, the footer outside it as contentinfo, no whole-section links around
  headings, one `<article>` per essay.
- **The commit-log card** shows the three newest commits, no counts or charts (a "24 commits
  in 14 days" strip reads as neglect once the site is stable). It publishes commit messages by
  design. Dates group and are labelled in IST (owner, 11 October 2026: based in India).
- **Theme follows the system** until a visitor picks day or night (footer or hero sun/Moon).

## Feedback

- **Pending navigation shows** (owner, 13 October 2026): a fixed "Opening page…" badge from
  `useLinkStatus`, no layout shift or fake progress, still under Reduce Motion; route status
  codes kept. **Reading pages prefetch** (owner, 19 October): `/blog`, notes and case studies
  load in view (taps 0.05 s, were 0.5–1 s; ~100 KB a full home scroll). Home, the sea studio,
  plate and privacy stay on demand, sparing the WebGL engine.
- **Headings keep full contrast during arrivals** (11 October 2026 correction). The kicker
  still reveals, but its heading no longer dims; the PageSpeed contrast failures matched that
  rule, and readable text comes before its fade.
- **One table, one vocabulary** (9 October 2026). Every action's answer lives in
  `lib/feedback/vocabulary.ts`, so a review turns into one-line edits; the same kind of action
  answers the same way everywhere. The owner tried the maximalist build and kept all of it
  ([feedback.md](feedback.md)).
- **Every channel answers every visitor**: sound (after the first press; see "Sound"), ink,
  type, the sea, cursors, notices and haptics (after a first interaction; only Android
  vibrates).
- **Levels are relative, and measured** on a laptop-speaker model: focus < hover < the dial's
  tick < a press < a roll, every cue under a page turn and none lost (above −56 LUFS). Touch
  has no hover, so a tap answers with the press.
- **What a sound tells is also shown:** copy, mail, offline and online use one polite notice;
  refusals mark the field. Buttons whose result speaks (`data-press="none"`) do not also click.
- **Responses before arrival exist only with JavaScript** (`html[data-feedback]`), so a reader
  without it sees everything at once.
- **A gull is the only moving hint for "Play waves"** (owner's idea, 10 October 2026: a bird
  that "flies in and sits on that button … without doing it on their face"). Research
  (`../web-research/reports/Website feedback beyond sound.md`) set the rules: motion onset
  catches the eye but travelling motion distracts, so it arrives once, after the button has been
  in view and scrolling has stopped, then moves only in place, rarely, and is still after 45 s.
  It sings amber notes until 36 s so the invitation is obvious. It leaves when the waves start;
  nothing is stored. No study shows a creature on a control raises clicks; it is kept for
  delight and is one prop to remove. What a visitor sees: [feedback.md](feedback.md).
- **It comes on every page load while the waves are off** (owner, 10 October 2026), even for a
  visitor who muted sounds or turned the waves off before: they may want them today.
- **It sits inside the pill, touching its edge** (owner, 10 October 2026). On top there was no
  room for notes; over the label it would hide the words that are the accessible signal. The
  pill widens as it lands, and its belly or feet meet the border centreline in every pose. On
  screens 620 px high or less the secondary seed link hides to keep the offer clear.
- **It comes sooner and travels less** (owner, 11 October 2026). It waits 2 s (the research's
  2–3 s), still after the phone's 1.8 s opening and at a scroll pause; on wide skies it drops in
  from just above the top edge, so every flight is about 2.3 s or less. Not later: fewer
  visitors would see it. Not at load: it would compete with the opening.
- **One gull by day and night** (10 October 2026). Gulls are active after dark
  ([Australian Museum](https://australian.museum/learn/species-identification/ask-an-expert/harbour-bridge-birds/),
  [Rutgers](https://www.researchwithrutgers.com/en/publications/nocturnal-behavior-of-gulls-in-coastal-new-jersey)),
  so at night the same gull gets moonlight, one phrase, fewer habits and a tucked rest after
  12 s unless engaged. An authored coastal scene, not a wildlife simulation.
- **Scroll cost is measured, not assumed.** A smooth settle of the headings' font axes reflowed
  them every frame (95 layouts in one scroll) and was dropped. The depth line and reading ribbon
  cost one style recalculation per frame (about 0.1 ms on an M4 Pro, frame pacing unchanged);
  the owner kept them.

## Sound

- **The waves are opt-in; every other sound is feedback and plays by default** (owner, 9 October
  2026: "everything else is feedback by design"). Browsers allow no sound before a visitor's
  first click, tap or key press, so hovers and scrolling are silent until then. The waves wait
  for "Play waves", and that choice holds across pages and visits: they fade out in the
  notebook, come back with the shore, and after a reload resume at the first press.
- **"Mute sounds" lives on the shore only** (owner's choice, 9 October 2026). A screen-reader
  user cannot mute the device without silencing the reader. It silences every sound and is
  remembered (`studio-sound`); "Unmute sounds" brings back the answers, not the waves. "Play
  waves" also unmutes.
- **No cue lasts 3 seconds or more**, so nothing that can play unasked (the foghorn when the
  connection drops) needs a stop control.
- **The surf is mixed for laptop speakers** (9 October 2026: the owner could not hear it without
  maxing a MacBook's volume). The old waves sat near −46 LUFS with most energy below 150 Hz,
  which small speakers cannot play. Now a 33-second loop of three breakers, washed between 300 and 1,600 Hz
  with the rumble below 90 Hz removed: about −32 LUFS, never silent, crests 5–6 dB over lulls.
  A page turn ducks the waves by 9 dB. Levels are pinned by tests.
- **The waves belong to the shore.** They play on the home page only; the notebook is quiet but
  for page turns, which also play on back and forward into or within it.
- **The compass bezel ticks like a dial** (owner's idea, 9 October 2026): one tick per degree the
  ring turns, at most 32 a second, so a fast scroll is a "trrrr", never a buzz. Jumps turn
  silently; reduced motion turns neither ring nor sound. Sharp mechanical ticks (over in 3 ms,
  mostly above 2 kHz) replaced pitched ones that sounded "underwater, bubbly".

## Writing

- **Posts are markdown, drafts are development-only.** A `draft` post shows in `pnpm dev` and
  cannot ship by accident: production has no page and no link for it, and `check-seo` fails if
  one is served. Publishing is a one-word edit.
- **The editor is a development tool, enforced by the build.** Its routes use `.dev.tsx`
  extensions that exist only outside production, not a runtime `if` that could be forgotten.
  The save endpoint refuses anything but same-origin JSON from localhost.
- **Published writing is indexed** (owner, 11 October 2026). The two original essays keep their
  URLs and authored layouts, are labelled Essay and join the listing and published markdown
  posts in search and the sitemap. Published articles expose only their visible title, summary,
  topic, author, URL and date as BlogPosting JSON-LD.

## Business audience and public-site boundary

- **India-based studio, public site only** (owner, 15 October 2026). Maxsash Studio is
  legally based in India, expects mostly Indian clients and welcomes clients worldwide.
  Intended visitors are adult prospective clients and readers. No visitor accounts,
  checkout, personal-data collection forms or sensitive/private pages, with no planned
  exceptions. Any proposal that crosses this boundary must be brought to the owner's
  attention explicitly before implementation; do not silently introduce it.
- **Replay purpose and UX constraint** (owner, reaffirmed 17 October 2026): diagnose
  navigation and interaction problems and study intent/section order. Rules and visitor
  preferences take precedence over collection. No arrival prompts, including tester URLs.
  Opt-in is initiated through footer settings; nothing requiring permission runs before Start.
  If noninterruptive controls cannot satisfy a requirement, leave that recording off.
  Use reviewed regional rules with expiry/sampling; URL labels never open consent dialogs.
  Owner/tester labels are self-declared context; work/read/play expresses intent. Neither is
  authentication or consent. Keep a visible recording stop control and honour DNT/GPC.
- **India automatic replay and regional correction** (owner approved, 17 October 2026). The
  [India review](replay-review.md) supports a prompt-free, non-SPDI pilot under the current
  framework. The official 2011 clarification narrows the earlier reading of prior-refusal
  duties; that was not a demonstrated blanket requirement for this public-site telemetry.
  Ship accurate disclosure, persistent refusal and footer region correction with 10% India
  sampling until 2027-04-30T00:00:00Z. Explicit correction takes precedence over detection;
  it declares current location and is not identity or an analytics field. May DPDP fallback is
  voluntary replay with consent evidence and withdrawal/deletion handling; exemptions need
  separate assessment. Evidence, provider-transfer interpretation and residual limits live
  in the review; do not infer anonymity merely from masking or cookie-free operation.
- **Other country defaults** (research, 17 October 2026). UK stays voluntary:
  [ICO](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
  excludes individual recordings from its statistics exception. No blanket US approval:
  [Javier](https://cdn.ca9.uscourts.gov/datastore/memoranda/2022/05/31/21-16351.pdf) (nonprecedential; other defences unresolved) and [Popa](https://www2.ca3.uscourts.gov/opinarch/212203p.pdf)
  require state analysis. Worldwide access alone is not EU targeting; assess the [EDPB monitoring test](https://www.edpb.europa.eu/documents/guideline/guidelines-32018-on-the-territorial-scope-of-the-gdpr-article-3-version-adopted_en).

## Visitor analytics

- **Measure behaviour before changing journeys, without persistent identity** (owner, 14 October
  2026). Explicit events through a first-party relay to PostHog; in-memory random visit IDs and
  pause only, reset on reload or a new tab; no analytics storage, profiles or autocapture.
  1.2.0 adds optional browser replay under the policy above. Released in 1.1.0 with five
  dashboards. Owner approved five allowlisted UTM tags and acquisition reports on 17 October;
  no arbitrary campaign text or click IDs. No adaptive order until data supports it. Contract:
  [telemetry.md](telemetry.md); research: [visitor-journeys.md](visitor-journeys.md).

## Error pages

- **Chosen 9 October 2026.** Each error page splits in half: the message on top, the real WebGL
  sea below (the plate without a GPU). **What floats tells how bad it is:** the homepage ship
  means all is well and never appears on an error page; a torn page or driftwood for a missing
  page, a log raft for trouble, a single plank for disaster.
- **Which page gets which scene:** unknown address, "Nothing on the horizon" (glassy sea, one
  plank); unknown or draft note, "Torn from the notebook" (ruled paper torn across, the scrap
  floating below); bad `/plate` seed, "Half drawn" (the sea stuck mid-engraving, a raft); a page
  crash, "Rogue wave" (night squall, tilted horizon, raft); the whole site down, "Caught in the
  storm" (a whirlpool under a turning storm, lightning, a plank circling the drain).
- **Rejected:** wireframe-only seas, the "torn out" printed page for the site 404 (the owner
  preferred the open horizon), a torpedo hitting the raft. The red upside-down sea
  ("Capsized") is parked as an Easter egg idea.
- Lightning is one soft flash every few seconds, never a flicker, and none under reduced motion.
- **Unknown notes render on demand** (`dynamicParams` removed from `/blog/[slug]`), so an unknown
  note reaches the notebook 404; `notFound()` keeps the status 404.
- **Error pages cost every route little:** Next loads error boundaries with every page, so their
  sea loads lazily (about +6 KB gzipped on the homepage, down from +24 KB).
- After a crash, "Back to the studio" is a full page load, so the studio starts clean.

## Accessibility

Keyboard and automated checks led to: focus never hidden by the pinned phone drawing (studio
controls carry a scroll margin), visible text is the accessible name (no overriding
`aria-label` on buttons), the hero pause button follows the navigation in tab order, slider
read-outs are not live regions, focus rings hold their contrast on every background, and links
that open a new tab say so. Forced-colours emulation was reviewed. The owner reports the iPhone
VoiceOver checklist passing (13 October 2026); no other screen reader has been tried.

## Performance

Latest lab baseline, the owner's live PageSpeed mobile runs on 11 October 2026 (13:44–13:50
IST): performance 87/96/95, LCP 2.6 s, FCP 1.7 s, TBT 330/50/140 ms, CLS 0; accessibility,
best practices and SEO 100. No field data yet.

- **Deliver the studio drawing progressively** (11 October 2026). The complete inline SVG made
  the initial HTML large. A lazy image of the print SVG comes first and hydrates to the same
  inline drawing for editing. Local Lighthouse: median FCP 2.555 → 2.105 s, LCP 4.203 → 3.754
  s, transferred HTML halved. Rejected: restoring body-font preloads (no help) and inlining
  CSS (+47 KiB, no reliable LCP gain).
- **Preload the hero font only** (11 October 2026). Montagu Slab stays eager; Rethink Sans and
  Reddit Mono load when used. Four early font files competed with CSS on an uncached phone;
  five alternating local cold pairs improved median LCP 2.884 → 1.552 s.
- **Software rendering gets the static plate** (`failIfMajorPerformanceCaveat`, 8 October 2026).
  The PageSpeed loss was Total Blocking Time from a continuous WebGL scene on a GPU-less lab
  machine; real visitors without a GPU benefit too.
- **The function runs in Mumbai** (owner, 11 October 2026). `x-vercel-id` showed the edge in
  Mumbai but the function in US East (`bom1::iad1`); it is now `bom1::bom1`. PageSpeed's
  first-byte share fell to 290–360 ms with no document-latency warning.
- **Cached home page: not done, leaning no.** The server picks the random sea, so `/` is
  `private, no-store`. A cacheable page whose browser picks the sea would give a faster first
  byte, but no-JavaScript visitors and crawlers would always see the default sea, the plate and
  "Authored sea" text would change after load, `?seed=` would move to the client, and the
  approved "a fresh sea from the first byte" would change. Revisit only if field data shows a
  slow first byte.
- **Forced reflow** in the report is the initial hero layout (about 130 ms at 4× CPU).
  `content-visibility: auto` below changed it by under 10%, so it is not worth doing.

## Security and hosting

- **Next.js 16.3.8** (16.2.9 had critical advisories; the site used none of the affected
  features). **Node 24** (`engines.node`, `.nvmrc`, `@types/node`).
- **No admin panel in production** (owner, 12 October 2026: "too much for a public repo"). Test,
  debugging and performance tooling stays local or in CI; no accounts, login sessions or cookies.
- **Production CSP and hardening headers**, no `X-Powered-By`, `security.txt` and
  `SECURITY.md`. No secrets, source maps or third-party client calls.
- **A Vercel Firewall rate limit** covers `/api/sea-edition*` and `/plate` (owner published it,
  13 October 2026; a cache miss costs about 6 ms of CPU and a 228 KB response). Setup:
  [seo-and-sharing.md](seo-and-sharing.md).
- **Semantic Versioning from 1.0.0** (owner, 14 October 2026). The site has a public contract
  (URLs, the sea API, reproducible sea links), so SemVer says what a version means; CalVer would
  only date it. Already in production, so it started at 1.0.0. Rules:
  [AGENTS.md](../AGENTS.md#versioning).
- **`main` never deploys; only `production` does.** `vercel.json` disables deployments for
  `main`; Vercel's Production Branch Tracking is `production`.
- **Commit identity:** every commit carries
  `maxsash <16003409+ctrl-alt-yash@users.noreply.github.com>`; the personal address must never
  appear in the repository. History was rewritten for it; the old hashes stay reachable on
  GitHub until garbage collection, which the owner accepted.

## Code quality

Conventions are in [AGENTS.md](../AGENTS.md#code-conventions). The first cleanup (Prettier,
dead code, repetition, long modules split, docs cut) changed no behaviour: every step was
compared against the previous build.
