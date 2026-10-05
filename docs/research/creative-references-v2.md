# Creative references, second pass

> Research record from before cleanup. References to rejected v1 routes/files
> describe the audit context; those experiments were removed on 5 October.
> [The current handoff](../creative-v2-handoff.md) and plan govern continuation.

Research date: 4 October 2026. Status: research and proposed art direction; no
direction in this file is an accepted implementation. Read the active roadmap
and validation log before building. This report does not change the user's
confirmed A/main, B/blog, C/optional-Easter-egg structure.

## The problem to solve

The first review set added controls to substantially the same composition. That
increases the effort required of a visitor without delivering a corresponding
visual reward. Small independent demos also make the mathematics feel like a
collection of toys rather than the design intelligence behind the site.

The new target should be a memorable transformation that works during ordinary
browsing, followed by optional depth. The visitor should understand the scene
before being asked to manipulate it. A technically informed visitor should find
consistent relationships between the sea, its rendering, the ship, and the
drawings, rather than recognize a set of unrelated hover effects.

An interaction cannot guarantee that a developer will be impressed. We can set
a more useful standard: an arresting still composition, a coherent response
across several visual systems, a reveal that changes the viewer's understanding,
and sufficient implementation depth to reward inspection.

## Research method and limits

The evidence below comes from creator websites, creator-authored case studies,
and original repositories. The sites' complete interaction and mobile behavior
were not exercised in a live browser during this research task. "Evidence"
therefore means a statement in the creator's publication or inspected source,
not an independent performance measurement. Recommendations and proposed
techniques are explicitly our synthesis. Awards, social posts, and third-party
teardowns are not treated as technical evidence.

These references span older foundational work and current creator accounts.
Their age is less important than whether they demonstrate a useful principle.
Do not copy a legacy dependency stack simply because the result is excellent.

## Eight references worth learning from

### 1. Evan Wallace — WebGL Water

**Evidence.** The demo documents a heightfield simulation, reflection/refraction,
caustics, and object interaction. Its source uses two 256 × 256 textures, stores
height, velocity, and surface-normal components, and swaps simulation buffers.
These are linked responses to one water state, which explains much of the
effect's coherence. Sources: [creator's demo](https://madebyevan.com/webgl-water/),
[original water simulation source](https://raw.githubusercontent.com/evanw/webgl-water/master/water.js).

**Borrow.** Make the same disturbance affect the surface, the ship's reflection,
and the visible light beneath it. A small gesture can feel consequential when
its consequences propagate through the entire image.

**Avoid.** A pool toy as the page's main purpose, permanent instructions, and
copying the entire optical renderer into the initial page. The demo itself
states graphics/extension requirements; it provides no promise about current
midrange-phone performance.

**Our adaptation.** An art-directed ocean may use a small analytic wave basis
and approximate reflection instead of this simulation. Describe that honestly;
visual coherence matters more here than claiming fluid dynamics.

### 2. Bartosz Ciechanowski — Naval Architecture

**Evidence.** The essay explains pressure, buoyancy, hulls, stability, cargo, and
propulsion with manipulable diagrams. The hull is repeatedly examined under
different physical relationships, including righting arms and changes in
displaced volume. Source: [Naval Architecture](https://ciechanow.ski/naval-architecture/).

**Borrow.** Keep a recognizable object through a sequence of explanations.
Reveal the hidden relationship behind an already compelling image. The
interesting part is the physical consequence, not the presence of a slider.

**Avoid.** Diluting the lesson into one arbitrary amplitude control or a decorative
formula. Also avoid casually importing the scientific authority of the essay:
our simplified ship/sea model must explain its own assumptions.

**Our adaptation.** The main-site sea becomes a section drawing, then a spectrum;
the blog takes over precisely where curiosity about that transformation begins.
This is an editorial relationship between routes, not an unrelated demo card.

### 3. Cameron Beccario — Earth Nullschool

**Evidence.** The official About page identifies weather/ocean model providers
and update schedules. The public original repository describes preprocessing
weather data into JSON, static hosting, canvas particle animation over a map,
interpolation, and simplified geometry for animation. The deployed site and
public original source must not be assumed identical. Sources:
[current data notes](https://earth.nullschool.net/about.html),
[creator's repository](https://github.com/cambecc/earth).

**Borrow.** Real measurements or forecasts can supply visual authorship. A sea
with a named place, observation time, and provenance is more interesting than
random ambient movement. Deliver compact derived data rather than the source
scientific dataset to each phone.

**Avoid.** A fake "live" badge, a fresh upstream request per page view, and global
mapping infrastructure when one carefully chosen offshore point would suffice.
Model-derived conditions are not an instrument reading or navigation advice.

**Our adaptation.** A cached daily sea-state signature can parameterize the same
scene and seed a replayable edition, without making page rendering depend on an
external API being available.

### 4. Amit Patel / Red Blob Games — Mapgen4

**Evidence.** Mapgen4 lets visitors paint terrain and recomputes rainfall,
biomes, and rivers. Its creator explicitly describes a custom projection and
outlines chosen to achieve a drawn-map appearance, plus multithreading work and
later renderer revisions. Sources: [project and development index](https://www.redblobgames.com/maps/mapgen4/),
[creator's threading account](https://simblob.blogspot.com/2018/09/mapgen4-threads.html).

**Borrow.** Let art direction determine the algorithm's output. Procedural work
need not look like a generic noise texture, neon particle cloud, or engine demo.
An engraved coast, an oblique hull, and contour lines can belong to one style.

**Avoid.** An exhaustive generator settings panel on the homepage. Rich terrain
regeneration belongs in a separately loaded exploration, if it earns its place.

**Our adaptation.** Precompute a beautiful chart and reveal the relationship
between its contours and the sea. Use controlled seeds and composition anchors,
so a random instance cannot cover the headline or hide project labels.

### 5. Bruno Simon — Folio 2025

**Evidence.** Bruno's site names Three.js/TSL, Rapier, and Howler. Its source
README specifies an ordered game loop whose systems include input, physics,
vehicle state, weather, wind, tracks, foliage, rendering, and monitoring. It
also documents texture/model compression. Sources:
[creator's site](https://bruno-simon.com/),
[source and loop documentation](https://github.com/brunosimon/folio-2025).

**Borrow.** A world is convincing when systems react to one another. The trace
of passage, environmental response, and changing viewpoint matter as much as
the controllable vehicle. This is especially useful for C.

**Avoid.** Making the user learn navigation controls to reach ordinary work or
contact information; reproducing an open-world game as a cheap add-on. Its
integrated scope is much larger than a ship moving around a rectangle.

**Our adaptation.** A brief optional uncharted expedition can reuse an existing
sea and discover one surprising physical or geometric phenomenon. Do not
introduce achievements, a leaderboard, or multiplayer merely to add systems.

### 6. The Pudding — visual essays and scrollytelling

**Evidence.** The Pudding's creator guide distinguishes monitoring native scroll
from changing scroll mechanics. It explains text steps that change a persistent
graphic and records the use of IntersectionObserver in Scrollama. Its Film
Dialogue essay builds an argument from a documented dataset. Sources:
[creator's implementation guide](https://pudding.cool/process/how-to-implement-scrollytelling/),
[Film Dialogue](https://pudding.cool/2017/03/film-dialogue/).

**Borrow.** Treat a visual as a developing argument. Each section changes what
the reader can see, instead of inserting another isolated interactive. A
finite sequence can be deep without imposing controls on every paragraph.

**Avoid.** A long pinned animation with thin content, artificially slowed
scrolling, and a desktop chart squeezed into the upper third of a phone.

**Our adaptation.** B gets a large authored frontispiece and a short sequence of
meaningful diagram states. On mobile, use full-width plates between passages
when a persistent graphic would compromise reading space.

### 7. The Digital Panda — The Spark

**Evidence.** The creator's 2026 account starts with a storyboard, describes
projecting detailed imagery onto light geometry, and says only one scene is
active at a time. It also reports mid-scene loading tradeoffs and that phones
were gated because the intended composition and behavior did not hold up.
Source: [creator's making-of](https://tympanus.net/codrops/2026/01/09/the-spark-engineering-an-immersive-story-first-web-experience/).

**Borrow.** Design an emotional arc before selecting a renderer. Let typography,
environment, and interface transform together. Use a decisive calibration
scene to determine whether the execution earns further investment.

**Avoid.** Treating a cinematic desktop case study as evidence of mobile
success. Also avoid mandatory sound, long initial waits, and a continuous film
that makes real content inaccessible.

**Our adaptation.** One responsive sea-to-diagram transition is the calibration
scene. If that scene is not compelling on an actual phone, revise its framing
before adding more chapters.

### 8. Unseen Studio — subject matter as interface

**Evidence.** The studio's 2026 article describes CLOU's architectural project
ring, which combines imagery and geometry to communicate project attributes;
The Sea We Breathe uses an underwater journey to organize related ocean
stories. This article establishes design intent, not detailed renderer
implementation or performance. Source: [creator-authored studio account](https://tympanus.net/codrops/2026/07/20/the-craft-behind-memorable-digital-experiences-inside-unseen-studio/).

**Borrow.** Give work a representation that reflects what it contains. A chart
can express relationships between projects; a shipyard inspection can reveal
how one was built. The metaphor must carry information.

**Avoid.** Literal nautical dressing on conventional cards, obligatory treasure
collection, or navigation whose novelty obscures project names and links.

**Our adaptation.** The project section begins with a composed survey plate;
each project opens a large, specific inspection view with its actual artifact
and engineering evidence. Until real work is supplied, use plainly labelled
examples without invented success metrics.

## Principles extracted from the research

1. **Make the first still image worth looking at.** Motion cannot rescue a weak
   layout. Review screenshots before discussing sensors or physics.
2. **One model, several consequences.** Water position, surface normals,
   reflection, ship attitude, and diagram coordinates should agree.
3. **A transformation needs a reason.** Sea to survey to explanation expresses
   Sea, Ship, Math. Random distortion does not.
4. **Reward attention before requesting effort.** Native scroll gives the
   initial reveal. Direct input unlocks a deeper layer after that reward.
5. **A phone needs its own composition.** Portrait framing, touch ergonomics,
   heat, and battery are design constraints from the first prototype.
6. **Build depth, then explain it.** A discreet technical note can reveal a real
   model, source provenance, and tradeoffs. Fake telemetry undermines the work.
7. **Spend complexity on the signature.** Ordinary navigation should remain
   ordinary. Reserve rendering, choreography, and backend work for a result
   visitors can actually perceive.

## Direction 1 — Sea of Proof (recommended)

**Promise:** a beautiful sea gradually exposes the mathematics that makes it
possible. This is the strongest fit for the existing identity and for the
request that both ordinary visitors and developers notice the craft.

### Entrance: a scene with scale

The first viewport pairs large, carefully set editorial type with an oblique
ocean occupying most of the lower/right composition. A small ivory ship and
its dark reflection establish scale. Fine light follows wave crests; the water
has a convincing horizon, depth, and restrained variation. The ship is a
designed object within the scene, not a logo sticker on a translating SVG.
Normal work and writing links are immediately usable.

There is no wind slider, steering panel, or request to "try" a minor effect.
Pointer movement softly changes the angle of a narrow reflective region or
the view, not the position of the entire page. A deliberate pointer pass over
the sea can leave one bounded disturbance. The surrounding image reacts
consistently. A static poster already captures the intended composition.

### Middle: the sea becomes its own explanation

Across a short ordinary-scroll section, the viewpoint tilts toward a survey.
The water sheds its material while retaining its exact shape. Crest lines
remain, a ruled coordinate field appears beneath them, and the ship's hull
becomes a sparse construction drawing. One cross-section rises from the sea
and resolves into a wave trace. The same trace separates into a small number
of components, then rejoins the scene.

The transition reveals the site's proposition: attractive surfaces have
structures beneath them. A single sentence accompanies each state. Avoid a
wall of formulas or a gratuitous explanation of the renderer. The visual
continuity must be real: the trace should be sampled from the same function as
the sea, not an unrelated sine animation crossfaded on top.

### End: the survey becomes work

The grid resolves into a spacious project survey. Work receives distinct
large illustrations or captured artifacts, direct names and links, and
concise engineering outcomes backed by actual content. The ship has led the
eye to the work; it does not become a navigation requirement.

Near Writing, one plate opens into the notebook's clearly different visual
language. At the footer, the last contour continues beyond the chart frame.
That small anomaly can lead to C, with an accessible link and a useful exit.

### B: a true folio, visually distinct at a glance

Use a **deep blue cover and warm-paper article interiors**, oversized editorial
titles, small red registration marks, generous empty space, numbered full-page
plates, and fine engraved diagrams. This changes composition, hierarchy,
palette, and pacing; merely adding marginal lines is insufficient. Reuse the
existing font families initially; art direction does not require more fonts.

The index should feel like opening a folio: one featured plate occupies roughly
half the desktop opening, with title and issue details opposing it. Two sample
essays get genuinely different images and scales, rather than matching cards.
On a phone, show a commanding title followed by a nearly full-width plate.

Sample essay 1, **The sea is a sum**, begins with the ocean just encountered,
then lifts a cut through it, separates its components, and recombines them.
The reader gets the story without controls. An optional "Inspect the model"
opens a proper workbench for phase, spectrum, and cross-section comparison.

Sample essay 2, **A ship hiding in an integral**, begins with a dramatic
large-scale construction plate. Its sequence explains the integral spine,
geometric offsets/joins, sail and hull, then optical correction at tiny sizes.
Use the actual generator and its facts. The meaningful reveal is how the
continuous mathematical idea becomes a workable small mark, not just three
shapes sliding apart.

### C: an uncharted mathematical place

A short optional expedition visits one spatial impossibility: for example, a
ship traverses a periodic sea and its wake reveals that the world wraps, or a
calm surface unfolds into a strange geometric field. A coherent visual ending
matters more than winning. Keep this on its own route; deeper simulation loads
only after entry. Do not copy the old direction slider game into a new skin.

### Desktop and phone

- Desktop: ordinary scroll provides the main transformation. Fine pointer
  motion adds small parallax/light changes. Direct inspection is optional.
- Phone: frame the ship and ocean vertically, with the horizon lower in the
  composition and larger nearby crests. Native scroll drives the same story.
  Touch effects must not block scrolling or pinch zoom.
- Optional orientation: offer "Look around" only where a change in view is
  substantial and legible. After permission, calibrated device tilt shifts the
  view/light within tight limits. It should feel like looking into a scene,
  not operating a novelty controller. Provide an equivalent drag view.
- Reduced motion: use distinct composed plates for sea, survey, and spectrum;
  all information and links remain available without continuous transitions.

### Technical shape and honest risk

Start with a small GPU-rendered analytic surface, rather than a full fluid
simulation or a general game engine. Share wave parameters with CPU samples
used for the ship and SVG diagrams. A reflection approximation plus carefully
chosen light may outperform a physically broader but poorly art-directed
renderer. Investigate one disturbance layer only after the base sea succeeds.

The difficult part is art direction and continuity, not generating a plane.
Transparent water, high-resolution full-screen effects, and excessive shader
layers can consume substantial GPU time despite a small JS bundle. The static
fallback and actual-phone prototype must be designed together. Do not promise
the old 15 KB incremental JS target before measuring this new signature.

**Calibration prototype:** one 2–3-screen sequence showing sea → survey → trace,
with desktop and portrait stills plus a recorded interaction. It must stand on
its own before the rest of the site is rebuilt.

## Direction 2 — Tidal Observatory

**Promise:** the website is an instrument looking at a particular patch of the
real ocean. The technical surprise is that the visual world has an explainable
connection to an external physical system.

### Entrance

A monumental sea surface sits behind a sparse observatory composition. One
small line identifies the place, data/model time, and source. The typography is
precise and editorial, not a dashboard grid. The visitor immediately sees a
distinct sea rather than a loading screen or an array of readings.

### Middle

As the visitor scrolls, the sea separates into its related measurements:
dominant wave direction, period, and amplitude treatment. A restrained ghost
outline shows a previous cached edition, making the passage of time visible.
The ship and its wake respond to the chosen model. A "Yesterday" comparison
is optional and causes an intelligible environmental transformation.

### End

The site's work is presented as instruments and systems built by the author,
each with real evidence. Writing is an observatory journal with substantial
diagram plates and dated notes. C is a replay of an unusual, explicitly
identified archived sea state, or a constructed mathematical anomaly plainly
labelled as such.

### Backend contribution

The backend periodically fetches a narrowly scoped public data product,
validates units and timestamps, derives compact render parameters, and
publishes an immutable edition. Browser requests read cached data. A known
last-good edition preserves the composition during an upstream outage. A
shareable edition identifier makes a scene reproducible, and its notebook
page explains exactly how data became geometry. The data pipeline is part of
the authored work rather than an invisible technical ornament.

Source/provider choice, availability, terms, cache policy, and the physical
meaning of a derived spectrum require a separate technical review. Three
summary readings cannot recover the actual full directional wave spectrum;
the scene must be described as a visualization informed by those readings.
Do not imply a direct simulation of an observed location.

### Phone and cost

An edge-to-edge portrait instrument replaces the wide desktop layout. Only a
single scene remains active. Ambient motion pauses offscreen, and optional
tilt changes the inspection angle. Daily cached data adds little transfer if
carefully scoped, but operational upkeep, source changes, renderer cost, and
data explanation are real work.

**Assessment:** potentially excellent second phase for Direction 1. It should
not delay the first visual breakthrough or be added merely because a backend
sounds impressive.

## Direction 3 — The Impossible Chart

**Promise:** an exquisite engraved nautical chart seems flat until it reveals
depth, hidden construction, and continuity beyond its own edges.

### Entrance

An oversized chart dominates a warm, near-white page. Restrained dark ink,
one vermilion accent, strong serif type, and a meticulously drawn ship create
a collectible-plate impression. Bathymetric contours, graticule lines, and
sparse labels share a real underlying coordinate model. The static design
must have enough craft to work as a print.

### Middle

Native scroll lifts one section of the chart into an oblique relief. The ship
becomes a measured cutaway while nearby contour lines remain connected to
their original positions. An inspection lens reveals construction geometry
within a bounded area; it has a meaningful reveal, unlike a generic custom
cursor. The lens can become a tap-to-inspect region on phones.

### End

The chart's plates become large project spreads. The notebook opens as a
sequence of distinct illustrated folios, with margin notes and foldout-like
diagram reveals. At the chart boundary, C unfolds the paper into a looping
topological surface: the familiar drawn world turns out to have unexpected
connectivity.

### Implementation and tradeoffs

Most of the appearance can be precomputed SVG, static artwork, and a few
finite transforms. A custom lightweight projection can produce depth without
a dense 3D world. This is the strongest low-GPU direction, but it is not
automatically cheap: thousands of SVG nodes, large filters, and complex
clipping can still be expensive. Draw the artwork carefully, combine paths,
and bound any moving region.

**Assessment:** choose if distinctive graphic craft is preferred to luminous
water. It has a lower continuous-rendering ceiling, but needs much stronger
illustration work than the previous review set. A generic contour background
with the current layout will not satisfy this direction.

## Recommendation and what to retain

Recommend **Direction 1 for A**, its folio treatment for B, and a short
mathematical discovery for C. Consider Direction 2's cached real sea editions
only after the visual proof succeeds. Direction 3 is a coherent alternative,
not a bag of extra decorations to combine with the first two.

Retain the brand's integral-mast geometry, content routing, static article
foundation, reduced-motion and visibility plumbing where appropriate, asset
inventory tool, and useful pure geometry checks. Retain the old review routes
only as clearly labelled history while work is underway. Retire their control
panels and rectangular voyage from the proposed final experience.

Do not spend another iteration refining the old wind/helm choice. The user's
feedback rejected its level of ambition. The next review must show a different
composition and a materially deeper effect.

## Prototype quality gates

These are proposed acceptance gates, not completed checks or measured budgets.

1. **Still image:** at 1440px desktop and 390px portrait, the opening reads as a
   new authored visual identity. The notebook is unmistakably a different
   editorial experience from the main site.
2. **First five seconds:** no instruction or control manipulation is required
   to see the signature composition and a purposeful response.
3. **Continuity:** at three checkpoints, surface, section trace, ship pose, and
   diagram agree. There is no visible substitute diagram during the reveal.
4. **Mobile:** native scrolling, tap targets, text, and the central subject
   survive portrait and landscape. Tilt is optional, calibrated, and valuable.
5. **Performance:** compare production transfer, rendering traces, main-thread
   work, and sustained behavior on a named phone. Small gzip deltas alone do
   not establish acceptable cost. Prototype adaptive pixel ratio, an activity
   cap, and a composed static fallback before polishing expensive effects.
6. **Content:** work titles, navigation, and reading remain direct and readable;
   placeholder articles are labelled, and no invented project metrics appear.
7. **Depth:** an optional technical note explains a real shared model and its
   approximations. It should answer curiosity created by the result.
8. **Review:** publish separate local sample routes, record real evidence in
   the validation log, and leave experimental code uncommitted for selection.

## Handoff to implementation

Before coding, confirm the active roadmap's selected prototype scope. Preserve
the user's uncommitted work unless deliberately replacing a documented portion.
Read installed Next.js guides for any relevant routing or client-loading work.

The first useful implementation is the smallest **complete visual argument**:
an excellent sea composition, one truthful transformation, and one radically
redesigned notebook opening. Building more tiny controls or a scaffold of every
future chapter would repeat the previous mistake.

Record the exact model equations and limits, coordinate conventions, animation
ownership, visual-state checkpoints, fallback behavior, tested devices, and
remaining gaps as the prototype develops. A follow-up model should not have
to reconstruct the concept from component names or conversation fragments.
