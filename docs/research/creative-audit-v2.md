# Creative audit v2 — give the sea an internal life

> Research record from before cleanup. References to rejected v1 routes/files
> describe the audit context; those experiments were removed on 5 October.
> [The current handoff](../creative-v2-handoff.md) and plan govern continuation.

Date: 4 October 2026. Status: research and proposed direction, not accepted UI.

This is the design audit for the user's rejection of review set 01. It does not
approve those prototypes or claim that new visual/browser tests occurred. Read
with `../creative-roadmap.md` and `../creative-validation.md`. The parent plan
decides which proposal below advances into implementation.

## Evidence and limits

Reviewed the homepage, section, notebook, harbour-control, and voyage source;
the global tokens; content records; and the existing roadmap/validation log.
Viewed the historical light desktop full-page and dark mobile full-page captures
in `tools/.out/responsive/`. Those captures predate the new prototypes. The
notebook/prototype conclusions below come from implementation structure and
the user's actual feedback, not fresh visual inspection. No CUA/browser or
physical-phone tests were performed for this audit.

The user has now supplied the missing qualitative result: the notebook does not
feel different, the interactions feel childish, and the work falls short of the
intended ambition. Passing asset budgets did not make review set 01 successful.

## Diagnosis

### The visual promise was larger than the change

`components/harbour/HarbourHero.tsx` reuses `Hero.module.css`, the original copy,
the original ship mark, and the original layered sea. Its principal addition is
a control panel under the buttons. Wind and helm are two interpretations of
horizontal displacement inside the same composition. They are implementation
variants, not two strong creative alternatives.

The control panel asks for attention, calibration, and learning before delivering
a response whose mechanism is immediately legible. The labels “Make a little
wind,” “Take the helm,” “Port,” “Starboard,” “Recenter,” and “Enable tilt” make a
small effect feel like a tool requiring operation. The conceptual problem is
the ratio of effort to reward, not that native sliders are inherently childish.

### B inherits almost all the identity of A

`Notebook.module.css` uses the same shell, display type, sans body, teal accent,
paper colour, global graph-paper backdrop, eyebrow styling, rules, and spacious
list rhythm as the homepage. The blog index is another title plus list of rows.
The article adds a narrow metadata rail and a bordered figure. Those are useful
publishing conventions, but do not establish a second visual world.

The stated plan explicitly constrained B to preserve the palette/typefaces.
Keeping the same font files is a useful performance choice; preserving the same
hierarchy, ink usage, background, image density, and composition was not.
Consistency was interpreted too literally.

### The mathematics is present as a label, not as a consequential system

The wave sliders redraw three simple curves. The mark slider translates three
paths. These are defensible educational fragments, but neither reveals an
unexpected relationship. The outcome is visible before interaction begins.
The harbour's “wind” changes ship displacement and wind strokes, while keeping
the ambient sea timing. The controls imply a world model that the visuals do
not share. A technical visitor quickly recognises independent animations.

### The rest of the site still looks like scaffolding

`Work.tsx` renders three equal rounded text cards. The data literally contains
“First project,” “Second project,” “Third project,” and `#` action targets.
`Elsewhere.tsx` says “This is the chart,” but draws an ordinary link-card grid.
Writing and Elsewhere repeat similar heading–lede–list rhythms. On mobile,
these repetitions create a very long column of uniformly weighted blocks.

There are no actual project images or outcomes to create visual variety. This
cannot be solved with more motion around the placeholders. Do not invent
projects, release metrics, clients, coordinates, expeditions, or scientific data.

### C currently has neither mystery nor depth

The voyage is a bounded rectangle, a heading slider, a fixed current vector,
and a lighthouse target. It immediately reveals its complete rule set. Calling
it an Easter egg does not create the discovery, tension, or perceptual surprise
that makes an Easter egg memorable. It is a mechanics sketch, not a release
candidate.

## Design thesis

**The sea should look like one thing and reveal that it is another.**

The first impression is atmospheric and beautiful. The second impression is
that several apparently unrelated details are responding to the same physical
or mathematical cause. The third is that the visitor can expose the underlying
construction without leaving the experience.

This gives two audiences a different entrance to the same work:

- A casual visitor sees water with depth, an exceptionally composed ship, and
  a change of scale from open sea to a printed navigator's atlas.
- A technical visitor discovers agreement among the water, reflection, wake,
  hull movement, annotations, and explanatory drawing. They need time to work
  out how the representations stay aligned.

“Hard to guess” is an artistic goal, not a mandate for obscure implementation.
A small, carefully coupled model can appear richer than several expensive,
unrelated effects. A screenful of particles, shaders, or equations by itself
does not meet this goal.

## Site-wide composition

Use three expressions of a common world, each with a different role.

| Place | Visual language | Main visitor activity | Memorable event |
| --- | --- | --- | --- |
| A / Harbour | Light, depth, broad water, one sculptural ship | Discover the maker and the work | Water, ship and its optical image behave as one system |
| B / Notebook | Ink, huge publication type, engraved plates, precise margins | Read and inspect a mechanism | A finished image opens into its mathematical construction |
| C / Hidden observatory | Darkness, navigation instruments, one unresolved phenomenon | Discover and investigate | A pattern only makes sense from the right alignment or time state |

Keep the integral-mast mark as the family signature. Repeat a small vocabulary:
a crosshair, a double rule, one tiny figure number, the same mathematical sea.
Do not cover every surface in nautical icons, compass roses, grids, coordinates,
rope borders, or aged parchment. The subject matter supplies the character.

Use a clear contrast in density. A is spatial and sparse. B is printed and
information-rich. C is intimate and concentrated. Consistency comes from the
same objects and relationships, not identical page templates.

## A: what a stronger harbour must do

### Initial view

At a desktop reference viewport of 1440 × 900:

- A restrained top bar occupies roughly 64–80 px; it has real readable links.
- The wordmark/title takes the upper left third, with a short concrete statement
  of the maker's work and one main content action. Do not let a long maritime
  metaphor dominate the explanation of what this website is.
- The sea occupies roughly the lower half, with the ship and its surrounding
  water forming the visual centre of gravity to the right. Its silhouette must
  be readable at thumbnail size.
- One restrained caption at the lower edge may identify the surface as a
  mathematical study. There is no full control panel in the initial view.
- The next section is visibly present near the fold, inviting normal scrolling.

At 390 × 844:

- Navigation, title, clear introduction, and a content link appear before the
  scene. Title spacing must not force the scene entirely below the first view.
- Aim for a composition with approximately 300–360 px of meaningful water and
  ship, not a thin animation strip. Adjust to text enlargement rather than
  locking content into viewport units.
- Ship and reflected/light-distorted structure remain recognizable without
  moving the phone. Touch changes something only after an obvious response can
  be delivered, and never prevents vertical page scrolling.

### Interaction choreography

1. The scene is convincing at rest. The visitor does not need to start it.
2. Pointer proximity or a brief touch produces a local, bounded disturbance.
   It spreads; changes in reflection/normal/wake agree with the disturbed
   surface; the ship reacts only if the disturbance reaches it. This causal
   delay is more interesting than a ship following the cursor.
3. A secondary “Inside the sea” action reveals the structure: a short transition
   between the finished surface and its lines/normals or sectional view. It is
   an optional disclosure, not required onboarding.
4. If tilt makes the rendering materially richer, introduce it inside that
   expanded view. A phone moves the viewpoint/light relationship by a small
   bounded amount; body copy and navigation remain still. The default view
   already works without permission.

This is a visual acceptance proposal, not a promise that a given fluid solver
is required. An analytic wave field plus a few decaying impulse terms may be
sufficient. The implementation team must document which effects are physically
coupled, which are approximations, and which are simply art direction.

### Below the hero

- **Work:** replace equal cards with a sequence of project plates. One dominant
  visual demonstrates an actual behaviour; supporting details occupy a quiet
  technical caption. Use alternating scale and layout only when content earns
  it. Until real project assets arrive, one clearly labelled specimen page can
  show the layout without claiming invented achievements.
- **Writing:** make this the threshold into B. A strip of dark ink or a cropped
  engraved plate and oversized folio number previews the different publication.
  Two links are enough; avoid reproducing the full blog index.
- **Elsewhere:** a restrained port chart can relate genuine destinations through
  routes, but labels remain normal links in DOM order. No arbitrary geographic
  coordinates. On mobile, a clear vertical route/list uses the same marks.
- **Footer:** one quiet colophon explains the integral mark and offers direct
  contact. Reserve one clearly focusable curiosity for C only after C is good.

## B: Navigator's Notebook as a publication, not a renamed section

### Art direction: The Engraved Atlas

Think of a contemporary mathematical journal printed in two inks, with the
scale of an atlas and the clarity of a well-made technical plate. This is not a
literal notebook UI: no faux binding, page curl, coffee stain, handwritten font,
or drag-to-turn-page navigation.

The title remains Navigator's Notebook. “Atlas” describes the visual language.

### Colour and typography

Scope B's tokens to the notebook route wrapper. Reuse existing font files but
change their roles so the page is immediately different:

- Light paper approximately `#F1EADD`, dense near-black ink `#20241F`, restrained
  vermilion/copper `#A4482A` for editorial marks. Final combinations must pass
  measured contrast; these values are starting swatches, not verified tokens.
- Large titles in Fraunces with upright, high-contrast forms, little softness,
  deliberate line breaks, and no default teal italic second line.
- Body prose in the existing Fraunces at comfortable optical settings if its
  reading texture tests well; Inter remains an alternative for very technical
  passages. Either way, use approximately 18–20 px desktop and 17–18 px mobile,
  1.65–1.8 line height, and about 60–68 characters per line.
- JetBrains Mono appears in marginalia, figure references, and numeric scales.
  It should not turn whole paragraphs into code or simulate false precision.
- Dark B is charcoal ink/paper with warm off-white lines, not the homepage's
  cyan-on-deep-blue. Preserve the publication hierarchy in both schemes.
- Remove B's inherited `main::before` graph paper. Use purposeful rules and
  occasional plate grids only where the diagram needs them.
- Squared corners, hairline/double rules, page numbers, and strong edges replace
  rounded cards. Texture comes from the engraving itself, not a large noise
  bitmap or expensive SVG filter.

### Index: desktop first viewport

Reference 1440 × 900, not a rigid pixel-perfect template:

1. A 50–64 px running head: small Maxsash mark and Harbour link left, edition /
   sample indication right. A thin top/bottom rule frames the publication.
2. The masthead occupies roughly 180–220 px. “Navigator's” is large; “Notebook”
   establishes a second, deliberate baseline. A compact two-line editorial
   statement sits beside or below it. Title scale is editorial, not a hero CTA.
3. Below a strong rule, a 55/45 or 60/40 spread: one full-height engraved sea
   plate on the left; featured note number, title, deck and read link on the
   right. The plate has enough area to be an image, not a 17rem thumbnail.
4. A narrow margin contains a real figure identifier and a concise, truthful
   description of what the plate depicts. Tiny details reward proximity without
   becoming mandatory reading.
5. The lower edge exposes the second note as a distinct typographic/graphic
   strip, establishing an index rather than a single landing-page hero.

There are only two sample notes. Do not fake a twenty-article archive, issue
history, editorial staff, publication date history, or status counters.

### Index: mobile first viewport

Reference 390 × 844:

- A 48 px running head with one return link.
- Two or three confident masthead lines, approximately 48–62 px subject to fit.
- A full-width engraved plate approximately 240–300 px high, clipped to its own
  composition rather than shrinking the desktop spread wholesale.
- Featured title and reading link visible at or close to the first fold.
- Secondary notes become folio entries below. The number, short topic, and title
  keep a compact hierarchy. No rotated margin text, tiny desktop labels, or
  horizontal carousels are required to find the second article.

### Article: read an argument, watch a construction emerge

Use a compact running head, huge article title, a short deck, a full-width plate,
then a legible reading column. On desktop, selected explanatory sections may
pair that column with one sticky figure. On mobile, figures remain in ordinary
document flow; the prose must not get trapped behind a pinned stage.

The key change is choreography across the argument. Do not insert an isolated
slider widget into otherwise unrelated text. A scroll sequence can expose
well-defined stages, with buttons for direct access and reduced-motion use:

1. **Observe:** a compelling finished surface or ship drawing.
2. **Disassemble:** the exact same object opens into components/sections.
3. **Explain:** a small set of terms and visible relationships show why the
   final object behaves that way.
4. **Reassemble:** the image returns, now understood differently.

Keep headings and figures server-rendered; geometry must have a meaningful
static frame. Scroll progress enhances an already-readable article. No forced
scroll speed, scroll locking, or fake page-turn transitions.

### Signature plate: water becomes an engraving

A promising B effect uses the same analytic surface as A in a different
representation. At rest it reads as a dense, beautiful engraved sea, formed by
many fine projected cross-section lines. Each line comes from the surface's
height field. As the explanation advances, the projection opens, the component
waves separate in depth, and their contributions reunite into the final sea.

The important visual detail is preservation of identity: the crest, probe point,
and slope highlighted in the finished water must survive the transformation to
the construction view. Otherwise it is a fancy dissolve between two drawings.

An optional inspection lens can reveal a cross-section and local tangent around
the pointer. The rest of the plate remains calm. On touch, tap a few marked
locations or use a visible Inspect button; do not require long-press, precision
drag, or hover. Keyboard focus on the same locations changes the same view.
Inspection should teach a relationship, not display meaningless live numbers.

Implementation options, in increasing complexity:

- **Precomputed SVG plate:** generate line positions at build time and prepare
  three/four semantic drawing states. Small CSS/JS transforms reveal the layers.
  Good static quality and lowest risk; less continuous freedom.
- **Canvas2D analytic plate:** evaluate a bounded grid/line set while visible;
  redraw only during a finite transition or input. This supports a coherent
  surface-to-section transformation without hundreds of DOM mutations.
- **Share an optional WebGL surface renderer:** only if A already earns that
  cost and B demonstrably benefits. Do not make B's article reading depend on a
  graphics context. Reuse geometry/model, not necessarily the whole renderer.

Do not describe the projected lines as measured bathymetry. They are a generated
illustrative surface. A separate bathymetric treatment could be added if there
is a real source dataset and a content reason to use it.

### Two sample articles with stronger substance

Keep the explicitly labelled sample status and noindex behaviour.

**“Three waves, one sea”** can remain, but the current two sliders are insufficient
as the central event. Build an argument around the surprise that a complex sea
can arise from a small sum. Show individual terms, shared phase/probe markers,
the combined slope/normal, and why a boat's orientation follows local geometry.
Be precise about the difference between the illustrative model and real fluid
dynamics. Use the exact implemented field rather than a disconnected plot.

**“An integral under sail”** can remain if it becomes an actual construction.
Trace the spine, reveal offsets, tangent joins, and the negative space that
makes the mast read as both symbol and vessel. At the decisive moment, the
construction lines recede and the unchanged final mark remains. There should
be at least one geometric insight the reader did not already know. Translating
three whole outlines apart may remain as a minor state, not the main effect.

The generated mark's master geometry lives in the tools and docs. Use its true
construction, including documented caveats. Do not invent exact golden ratios,
symmetry claims, or parametric constraints just to decorate the illustration.

## C: suspend the current game; develop an actual discovery

The default recommendation is to archive the current voyage UI. Do not put it
behind a hidden link merely to preserve sunk effort.

One stronger direction is a **Celestial Observatory**: a small instrument on
the chart opens a dark sky/sea study. The same wave that was merely beautiful
becomes a signal. Aligning a horizon/reticle or revealing a frequency relationship
causes a concealed image or route to resolve. It should have one surprising
payoff and a 30–90 second discovery arc, with clues and an accessible reveal.

Another is a **Wake Atlas**: the visitor sketches one route and the site turns
its curvature/speed into an engraved wake with coherent interference, then
offers a shareable deterministic chart. This is purposeful creation with a
keepsake, not steering an icon through a blank rectangle. It can be an optional
export/share feature without requiring accounts or a persistence backend.

These are candidates only. Prove a short high-quality clip/static storyboard of
the reveal before building navigation, controls, score, audio, or permissions.

## Keep, retire, and change: file map

| Files / area | Recommendation | Reason / next action |
| --- | --- | --- |
| `components/Mark.tsx`, mark generation tools, `docs/mark.md` | Keep | A real distinctive brand asset with documented geometry |
| `components/wave-paths.ts`, wave generator/geometry tests | Keep as baseline/fallback | Reliable static/no-JS visual material and useful tests |
| `components/sea-surface.ts`, `SeaMotion.tsx` | Keep as reference; evaluate reuse | Water attachment, visibility handling, and cleanup are useful; new rendering may use analytic sampling instead |
| `components/harbour/HarbourControls.tsx` | Retire from new primary view | A large UI for a small effect; accessible actions can live in an optional expanded view |
| `components/harbour/HarbourMotion.tsx` | Salvage input/lifecycle lessons | Permission/calibration/fallback knowledge is valuable; do not keep the steering interaction as the concept |
| `components/harbour/HarbourHero.tsx` | Replace for v2 sample | Reusing the original layout masks the intended change |
| `components/notebook/Notebook.module.css` | Replace within a new scoped sample | It embodies the same hierarchy and palette as A |
| `app/blog/*` | Keep server routing/metadata pattern; replace composition after review | Static content and known-slug handling are sound foundations |
| `components/notebook/WaveWorkbench.tsx` | Replace central experiment | A disconnected height-only plot does not reveal the new surface's construction |
| `components/notebook/MarkWorkbench.tsx` | Retire as main event | Whole-shape translation alone is visually predictable |
| `content/notebook.ts` | Keep sample labels/accurate claims; revise structure | Richer figures need staged content and figure references |
| `components/voyage/*`, `lib/voyage-model.ts` | Archive/relegate to review-set-01 | Mechanics sketch is not ready to be the Easter egg |
| `components/Work.tsx`, `Sections.module.css` | Redesign in stages | Equal card/list repetition limits the rest of the site |
| `content/site.ts` | Keep honest; flag missing real content | Do not replace placeholders with invented project evidence |
| `components/review/*`, `/samples` | Keep as review infrastructure | Label v1 rejected; make v2 the primary comparison with specific review goals |
| `tools/measure-routes.mjs`, creative/geometry tests | Keep and extend only where meaningful | Preserves actual baseline and catches geometric regressions |

Avoid deleting uncommitted v1 files until a record identifies what was preserved
or superseded. The user permits scrapping them; an archive route or explicit
documentation is useful for reasoning history, not a requirement to carry old
code forever. Keep all v2 exploratory UI uncommitted until the user selects it.

## Review sequence and acceptance rubric

### First: reject weak compositions before adding motion

Prepare actual 1440 × 900 and 390 × 844 screenshots of A and B. The notebook must
look recognizably different with JavaScript disabled and with the title hidden.
If it still reads as the homepage with another heading, stop and change the
composition. Show the whole page too; do not approve a hero that collapses into
generic cards immediately below it.

### Then: prove one signature interaction

The following are review gates, not claims already established:

| Dimension | Pass evidence | Failure pattern |
| --- | --- | --- |
| Immediate identity | Sea/ship/math recognizable in a static first frame | Theme is only labels, icons, or background grid |
| B distinction | Different hierarchy, density, ink and plate scale at a glance | Same serif/teal/list with “Notebook” substituted |
| Causal richness | One input visibly affects at least three related properties in agreement | Cursor follower plus unrelated looping waves |
| Effort/reward | Beautiful without input; deliberate action yields a substantial discovery | Several controls to move one object a few pixels |
| Technical credibility | Shared values/probe positions remain consistent across visual representations | Equations/numbers are decoration or fake physical claims |
| Layperson readability | The result can be described without knowing the algorithm | Interesting only after a technical explanation |
| Mobile specificity | Composition and input are deliberately adapted; scrolling remains easy | Desktop canvas shrunk, essential hover, permission before value |
| Reading quality | Long paragraphs remain comfortable; diagrams aid the argument | Pinning, movement, or texture competes with text |
| Rest/absence | Static/no-JS/reduced-motion views remain designed | Blank canvas, collapsed layout, disabled primary navigation |
| Performance restraint | Measured payload and frame traces fit agreed gates on reference devices | “No dependency” treated as proof of low runtime cost |
| Whole-site quality | Work/writing/contact remain useful and visually intentional | Spectacular hero above placeholder scaffolding |

For the human review, ask the user what they remember after ten seconds and
whether they explored without being instructed. A technical observer should be
able to name a relationship they needed time to understand, not just recognise
the graphics API. Do not promise that every experienced developer will be fooled.

### Limit simultaneous experimentation

Build one ambitious A scene and one visibly distinct B spread first. A single
surface model shared between them can create the strong connection. Do not
simultaneously ship a tilt controller, a new project system, a procedural globe,
an audio engine, a multiplayer backend, and a mini-game. More parallel gimmicks
would recreate the same problem at higher cost.

Each sample should state its decision clearly: “Does this atmosphere and causal
response earn being the homepage?” / “Does this feel like a publication you
want to read?” Those questions matter more than choosing between two sliders.

## Primary references consulted

- [Bartosz Ciechanowski, Naval Architecture](https://ciechanow.ski/naval-architecture/)
  builds explanations through linked cause and visible consequence: pressure,
  buoyancy, stability and propulsion. The relevant lesson is that manipulations
  reveal a relationship, not merely that a slider exists. Proposed application:
  use a shared surface/probe model so visual refinement has explanatory depth.
- [Bartosz Ciechanowski, Curves and Surfaces](https://ciechanow.ski/curves-and-surfaces/)
  develops rich surfaces from simpler geometric controls. Proposed application:
  the mark and water should open into their actual construction, preserving
  correspondence between the finished image and each explanatory stage.
- [The Pudding, They Won't Play a Lady-O on Country Radio](https://pudding.cool/2023/05/country-radio/)
  is a primary interactive publication reference for staging an argument around
  visual evidence. Proposed application: give each notebook story its own strong
  plate and narrative sequence rather than inserting generic widgets into a
  uniform blog template. This audit reviewed the available page content, not a
  live rendered interaction session.

These references are principles to adapt. Do not copy their authored text,
artwork, code, or a recognisable entire visual identity into the site.
