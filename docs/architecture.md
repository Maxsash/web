# Architecture

How the site is put together and which contracts must not change. Why it looks this
way: [decisions.md](decisions.md). How it is checked: [testing.md](testing.md).

## Routes

| Route                           | What it is                                                                                                                                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                             | Hero sea, Work, About, Contact, notebook, shoreline footer. Dynamic: a fresh sea per visit.                                                                                                                                      |
| `/sea`, `/sea?seed=…&version=2` | The sea studio on its own page (indexed; seeds canonicalise to `/sea`). The hero's "Make your own" opens it with the visitor's sea.                                                                                              |
| `/?seed=…&version=2`            | A fixed, shareable sea. A seed without `version` means version 1, forever.                                                                                                                                                       |
| `/plate?seed=…&version=2`       | Print page for one sea (`noindex`).                                                                                                                                                                                              |
| `/blog`, `/blog/[slug]`         | The notebook: two approved essays and written posts (published indexed, drafts dev-only); listing indexed. Unknown slugs render on demand so they reach the notebook 404.                                                        |
| `/work/[slug]`, `/work`         | A case study per Work project (indexed, in the sitemap; unknown slugs 404). `/work` redirects to `/#work`.                                                                                                                       |
| `/api/sea-edition`              | The sea's six waves as JSON. No `version` means version 1.                                                                                                                                                                       |
| `/api/sea-edition/print`        | The same sea as an SVG plate (`&download=1` to save).                                                                                                                                                                            |
| `/privacy`                      | Privacy explanation and optional analytics preference (`noindex`, follow).                                                                                                                                                       |
| `/api/telemetry`                | POST-only, bounded/validated event batches relayed to PostHog when configured; otherwise no-op.                                                                                                                                  |
| `/robots.txt`, `/sitemap.xml`   | Discovery files; the sitemap lists the homepage, the Notebook listing, the sea studio, two essays, five case studies and published markdown posts.                                                                               |
| Error pages                     | `app/not-found.tsx` (any unknown address), `app/blog/not-found.tsx` (unknown or draft note), `app/plate/not-found.tsx` (bad seed or version), `app/error.tsx` (a page crashed), `app/global-error.tsx` (the root layout failed). |

No database, accounts or cookies. Optional replay calls PostHog EU from the browser. Local theme/sound
preferences remain. Optional configured analytics keeps a random visit ID and pause
choice in memory only; saved recording refusal/region contain no cross-visit identity.
Server inputs include the sea query, optional GitHub request below and bounded
telemetry batches.

## Behaviour measurement

`lib/telemetry/schema.ts` owns pure route/property allowlisting and validation;
`catalog.ts` derives known slugs from published source content. `config.ts` gates
production with explicit env/token/approved-host checks. `posthog.ts` builds the
personless payload. `/api/telemetry` checks origin/type/body limits and forwards
rebuilt fields only; no visitor IP/raw URLs/raw user agents, GeoIP or profiles.
CSP permits EU ingestion connections. Optional replay uses a dynamically imported, locally
bundled PostHog SDK with external script loading and automatic analytics disabled.
`replay-policy.ts` owns reviewed country approvals and expiry; the no-store
`/api/telemetry/replay-policy?region=…` separately gates replay and honours DNT/GPC.
Coarse region corrections override detection; the endpoint never accepts arbitrary country text.
`visit-labels.ts` owns role/intent allowlists; consumed URL tags never establish identity.
`components/telemetry/replay*` separate state, recording lifecycle, redaction and controls.
Footer Privacy & recordings leads to the inline region/recording controls at `/privacy`.
`replay-preferences.ts` separates pure parsing from browser storage/events. Local preferences
store only region and automatic choice. Changes cancel capture before requesting a new policy;
storage failure disables automatic capture. Only the visitor’s test button opens a Start dialog;
URL labels never open one. Rules/preferences take precedence; required opt-in stays off until Start.
Recordings join events using a UUID7 and get no persistent visitor identity.

`components/telemetry/` separates in-memory preference/identity, bounded transport,
observers, action bridge and React lifecycle. Only configured production measures.
Section exposure needs 1 visible second; engagement needs end marker + 30 foreground
seconds. Copies use success hooks; slider events settle for 500 ms. Navigation
separates timeout/late arrival. Unknown paths collapse to `/unknown`.

`lib/telemetry/acquisition.ts` owns UTM allowlists and referrer fallback; browser acquisition
caches the initial page entry in memory across observer resets. Transport/replay share it;
the relay validates every field. Visit identity, rotation and pause behaviour are the contract in [telemetry.md](telemetry.md).
Report definitions and the setup command live in `tools/telemetry/reports.mjs` and
`tools/setup-telemetry.mjs`; [telemetry-setup.md](telemetry-setup.md) is the guide.

## The sea model

One height field serves everything: the GPU surface, the ship's attitude, the printed
plate and the API. `lib/sea/` holds it, with no DOM and no React:

| Module                 | Responsibility                                                        |
| ---------------------- | --------------------------------------------------------------------- |
| `types`                | `SeaEdition`, `SeaSettings`, `SeaVersion`                             |
| `seed`                 | Seed parsing, the four settings as four bytes, default seeds          |
| `random`, `wave-table` | The 32-bit PRNG and the baseline wave table                           |
| `edition-v1`           | **Frozen.** Never change its PRNG, coefficients or interpretation     |
| `edition-v2`           | Settings-driven edition (swell, heading, character, variation)        |
| `edition`              | `createSeaEdition(seed, version)`                                     |
| `presets`              | Glass, Trade wind, Squall, Home water; `pickVisitSea` for a new visit |
| `describe`, `sample`   | Words for a setting; `sampleSea(edition, x, z, t)` height and slope   |
| `plate`                | `renderSeaPlate`, the SVG engraving                                   |
| `request`              | Seed and version parsing for pages and APIs; repeated values rejected |

`sampleSea` sums six waves: `k = 2π / wavelength`, `ω = √(9.81 k)`,
`θ = k(cos(direction)·x + sin(direction)·z) − ωt + phase`, height `Σ amplitude·sin θ`,
with analytic slopes. Units are metres and seconds, `y` is up, directions are radians from
`+x` toward `+z`. Baseline wavelengths are `14, 8, 4.5, 2.5, 1.2, 0.65`; amplitudes
`0.55, 0.32, 0.16, 0.085, 0.04, 0.02`; coefficients are rounded to eight decimals.

**Version 1 is a public contract.** Old links, the API default and the notebook essays
depend on it; `tools/sea-edition.test.mjs` pins its digest. A change to the model is a
new version, with v1 still rendering. Version 2 maps the four settings to height,
heading, long-versus-short balance and wavelength. The seed is those four bytes in hex.

A new visit to `/` picks one of four starting seas, nudges swell, heading and character,
and draws variation freely. Nothing about the visitor is read.

## Rendering

Native WebGL2, no 3D library or downloaded model. The deferred engine sits
behind a server-rendered SVG plate, which is also the fallback.

- `components/observatory/OceanScene.tsx` owns lifecycle only (events, observers, frame
  loop). Its pure rules are separate modules: `stage-director`, `reveal-mapping`,
  `layer-opacity`, `frame-governor`, `touch-stages`, `clamp`.
- `ocean-engine.ts` draws; `ocean-shaders.ts` holds the GLSL; `ocean-light.ts` projects
  the sun or moon into the scene; `camera`, `matrices`, `vec3`, `ship-mesh`,
  `sea-grid` and `gl-resources` are its parts. The ship is an authored survey cutter,
  distinct from the brand mark. `ship-builder` writes rigid/cloth triangles and
  fittings; `ship-mesh` owns the shaped hull and planked deck; `ship-rig` owns the gaff
  mainsail (reef band and points), jib, corner patches, spars, rigging and pennant; its sail,
  seam, reef and patch strips share `clothGrid` and `clothTriangle` (2,747 triangles).
  Every triangle carries a `Finish` (colour plus a `ship-surfaces` surface: topsides,
  brightwork, deck, metal, canvas, rope or plain), written as a per-vertex surface
  buffer. `ship-weathering` turns surface and object-space position into restrained
  wear: sun-faded topsides with a waterline grime line and faint salt streaks,
  bleached varnish tops, tarnished brass with polished tops, mottled canvas with a
  dirtier foot and greyed rope. Deck planks get their silvered tone on the CPU
  (`plankFinish`). Emblem, pennant, caulking and ink parts stay plain. Detail that
  would fall under a few pixels fades out; Drawing mode is unaffected. `ship-emblem.ts` builds the orange four-star Dragon Ball disc/rim/stars as
  cloth geometry mapped onto both sail faces. `ship-motion` samples five hull stations
  at three times to soften short chop, with bounded heel, pitch and heading.
  `ship-placement` fits the projected mesh around actual copy and reserved controls,
  and frames the drawing camera around the same vessel. Enlarged portrait copy
  can use open water on the left. Only resize/text layout refits the composition;
  the home position stays fixed through the reveal. `ship-shaders`
  breathes only the cloth, lights both faces of canvas, engraves the same mesh and
  places the directional shadow/wake with the actual vessel. Shared error shaders
  retain their existing defaults. No downloaded assets or extra animation loop.
- Budgets: a 60,000-triangle sea and 1.5 million pixels (DPR up to 1.25) on desktop;
  21,600 triangles and 360,000 pixels at DPR 1 when the pointer is coarse or the stage
  is under 760 px at mount. Draws are capped at 60 Hz; sustained slow delivery drops
  to 30 Hz and 70% resolution. Hidden or offscreen scenes do not draw.
- The GPU surface and `sampleSea` must agree; a parity test checks the shader against
  the CPU for a version 1 and a version 2 sea.
- **Answers to the visitor:** a press on the sea sets `uRipple` (where, and when in sea time) and
  the homepage fragment shader draws a fading ring there (`camera.ts` `seaPointAt` finds the point
  of the sea under the pointer); error seas have no ripple. Sea time runs at a pace
  (`sea-pace.ts`): slower as the visitor idles (`html[data-idle]`), faster with scroll speed.
- The context is requested with `failIfMajorPerformanceCaveat`, so a browser that can
  only render in software (hardware acceleration off, no GPU, a blocklisted driver) gets
  the SVG plate instead of a janky scene. Context creation failure and context loss also
  fall back to the plate; there is no restoration path.
- `sea-gl.ts` holds what every sea engine shares (context options, program compilation,
  the grid and solid-mesh arrays, wave uniforms, canvas resizing); `mesh-writer.ts` writes
  the ship-layout vertices (position, normal, colour, barycentric). `ocean-shaders.ts`
  exports builders; shared defaults are pinned byte for byte by `tools/drift.test.mjs`.
  The homepage supplies its moving ship wake; error seas keep their own surfaces.
  `noise-glsl.ts` is the one copy of the value-noise and fbm GLSL (ship wear, storms).

### The sky

Daylight, clouds, the theme toggle, the dated Moon, stars and planets, the moonlit sea
and the mapped Moon: [sky.md](sky.md).

### Error-page seas (`components/drift/`)

Each error page is `DriftFrame` (message on top, sea below; `DriftPage` adds the
server-rendered plate for the 404s) over a fixed-camera scene from `scenes.ts`:
`horizon`, `notebook`, `plate`, `squall`, `storm`. `drift-engine.ts` draws one with the
homepage shaders plus `drift-shaders.ts` (a whirlpool in the field, spiral foam, storm
clouds, tint and lightning) and a floating raft, plank or paper scrap
(`driftwood-mesh.ts`); `whirlpool.ts` is the matching CPU sample for placing them.
Only the message, buttons and torn paper load on every page: the boundaries lazy-load
`DriftFrame`, and the canvas, engine and meshes load only when an error page renders.
Next ships error-boundary code with every route, so keep these files small. The sun and
moon hide when the sky is narrower than 1.1:1, where they would sit behind the text.

### Scroll and the mobile stages

On desktop the hero is 180svh (at least 1,100 px; 170svh in a narrow window) and scroll maps
continuously to progress 0–1 (sea, structure, drawing); the reveal is
`(progress − 0.14) / 0.75`, and the text has two layers, the intro and the end ("Look closer").
When the primary pointer is coarse, the hero is staged instead: Sea (0) and Drawing (1), one
stage per vertical swipe (≥ 35 px, 1.25× vertical dominance) or button, and the next swipe
after Drawing scrolls into Work (`site.afterHero`). Sea → Drawing eases out over 1,800 ms
(`t·(2−t)`) with the reveal equal to progress; the way back is a 600 ms smootherstep. Reduced
motion shows stills. Without
JavaScript the page is readable and scrolls natively. These timings were approved on a
physical iPhone: refactor around them, never change them. Stage labels and button enabled
states are React state, so displayed and clickable controls agree. Touch gestures are
accepted while at least half the hero remains visible, including small scroll offsets
and returning from Work; a confirmed stage change aligns the hero to its start. A
swipe past Drawing and scrolling outside that region stay native.

### Hero controls and short screens

The stage grid reserves the larger of the authored copy offset or the header's actual
height plus its bottom margin. The intro, and the drawing copy on narrow/short screens,
therefore stay below the controls even when they wrap. The secondary seed link stays
clear of the pause/stage controls and hides below 620 px viewport height; the shore's
colophon still links `/sea`. Mobile title sizing also accommodates larger text. Narrow headers place the brand
and wave pill in the first row, navigation in the second; the name can wrap. Short wide
screens use one header row and put the offer beside the title. Approved sea timings stay.

### Browser bars

Phone browsers paint a band above the page (Safari 26+ also below). One rule serves both
kinds of browser: the colour of a stuck `[data-bar-tint]` element's `--bar-top` (and
`--bar-bottom`), else the body's background.

- **Safari 26+** ignores `theme-color`. It hit-tests 8 px inside each viewport edge, walks
  up to the first fixed or sticky ancestor and uses the first plain `background-color` on
  the way (never a gradient or canvas), else snapshots the edge once, else uses the body.
  In the iOS 26.5 and 27 simulators it decided when the page loaded and kept that through
  later style changes and programmatic scrolls; real finger scrolls were not tested.
- **Other browsers** (Chrome on Android, Safari 15–18) read `theme-color`.
  `components/ThemeColor.tsx` applies the rule to it and resyncs on theme, rendering and
  chapter attribute changes, when Next swaps head tags, and when the tinted element stops
  being stuck (an `IntersectionObserver`, no scroll listener). The server default follows
  the OS preference, as the first paint does without a saved choice.
- **Hero:** `.barTop`/`.barBottom` declare the stage's `--bar-top`/`--bar-bottom` without
  painting (an empty content box); the stage itself can't be sampled because `.shade`
  darkens its edge unevenly. The values are the rendered sky top and sea bottom at phone
  width (`--sky-edge`, `--sea-edge` per theme; constant across width and Moon phase; the
  day sea bottom varies by starting sea and matches Home water and Trade wind), the plate's
  on renderer fallback, and paper in the drawing chapters.
- **Error pages:** a drift page that is the whole page is sticky, so Safari snapshots its
  sky gradient; each scene's `--bar-top` is the rendered sky top and the gradient's first stop.
- **Notebook and `/plate`:** `body:has(…)` keeps their paper, because the night attribute is
  set on every page.

## Shoreline footer

`components/shore/`: `Shoreline` owns the canvas lifecycle; `sand` paints the cached
sand and shells, `tide` the shore line, wet sand and surf, `footprints` the mouse-only
fading tracks, `palette` the day and night colours. Budgets: 30 Hz, 420,000 pixels, paused
when hidden or offscreen, still under reduced motion. `<Waves />` holds the wave sound while the
shore is mounted (see Sound). Theme follows the system until the footer switch or hero sky control saves an
override through the shared theme authority.

`GitHubActivity` shows this site's three newest commits (`maxsash/web`, public),
fetched on the server, cached for an hour, with a 2.5 s timeout; on failure only the
repository link remains. Dates group in Asia/Kolkata and are labelled IST. It shows no
counts or charts. `ShoreFooter` prints the package version and,
when the host provides one, a short commit.

## Sound

Every sound is synthesised in the browser from pure, deterministic code; there are no audio
files. The rules are in decisions.md ("Sound").

- `lib/sound/` (pure): `synth` (the state-variable filter, easing, peak scaling and the take
  chooser that never repeats the last variation), `page-turn` (four variations of a soft page
  turn), `surf` (the 33-second wave loop and `BED`, its fades and the duck), `dial` (three
  variations of a sharp detent tick, `ratchet` that counts degrees turned, and `clickTimes` that
  spaces ticks at most 32 a second and never queues them more than 0.1 s ahead).
- `components/sound/sound.ts` owns the one `AudioContext` for the whole visit and the visitor's
  two choices: the waves (`studio-wave-sound`, off unless chosen) and every other sound
  (`studio-sound`, on unless muted). The context is created only inside a click, tap or key
  press, outlives client navigation, is suspended while the tab is hidden or everything is muted,
  and is never closed. `listenForFirstGesture` (started by `Feedback`) creates it at the visit's
  first gesture, except on the two sound buttons, which handle their own click. `playClip` plays
  only while sounds are on, caches each synthesised buffer by name and never throws.
- `components/sound/waves.ts` is the wave bed: `holdWaves()` (used by `<Waves />` in the shore)
  starts the loop with a slow fade-in when sound is on, fades it out when the last holder
  unmounts and stops it at once on mute. The loop is synthesised once per visit at 22,050 Hz,
  after the click that asks for it (about 16 ms on an M-series Mac). `duckWaves()` dips it under
  a page turn.
- `components/sound/SoundControls.tsx`: `WaveSoundControl` (the "Play waves" / "Mute waves"
  buttons in the hero and the shore, kept in step by one store), `MuteControl` ("Mute sounds" /
  "Unmute sounds", shore only) and `Waves`.
- `components/NotebookLink.tsx` plays the page turn on a plain click into the notebook (a link to
  `/blog…` that is not the page already open, `turnsPage`), ducking the waves;
  `components/sound/PageTurns.tsx` (in the root layout) does the same on the browser's back and
  forward, using only an audio context that already exists.
- `components/sound/useDialSound.ts` reads an element's own `--progress` while it is on screen
  and sound is playing, turns it into degrees with that dial's turn (the same constant its CSS
  rotation uses) and plays one tick per degree: the medal (40°) and the home notebook's compass
  (60°). `ticker.ts` holds the shared scheduling (`createTicker`, never more than 32 a second,
  never queued) and `createDetentTicker`, also used by the studio's sliders.
- `lib/sound/cues.ts` (pure) synthesises the feedback cues from recipes: layers of filtered noise
  or tones, each a strike with an attack and a decay, optionally repeated (dice, a creak) or
  gliding in pitch. Each layer is normalised before mixing, the mix is warmed by a one-pole filter
  and scaled to the cue's peak.

`node tools/render-sounds.mjs` writes every sound to `tools/.out/` as WAV files (page turns, the
wave loop twice so the seam can be heard, the dial alone and over the waves).

## Feedback

Every action gets a small answer; the brief and the full map are in [feedback.md](feedback.md).

- `lib/feedback/vocabulary.ts` (pure) is the one table, `FEEDBACK`: each action's cue, gain, rate,
  spacing (a burst inside it is dropped), haptic pattern and words. `classify.ts` reads an
  activated element into an action (a `#` link glides, `mailto:` rings, a download saves, another
  origin or a new tab leaves, a button presses, `data-press` names its own or `"none"`); `idle.ts`
  holds the idle thresholds.
- `components/feedback/respond.ts` plays an action: the cue (unless sounds are muted), a vibration
  (only after the visitor has interacted; Android only) and a notice. Cues are synthesised once per
  visit, ahead of need once sound is on.
- `Feedback.tsx` (root layout) sets `html[data-feedback]` and starts the listeners: `actions.ts`
  (hover, press, focus, click, toggle, copy, selection; one set of capture listeners on the
  document), `arrivals.ts` (marks `[data-arrive]` elements `data-arrived` once, playing
  `data-arrive-cue`; a swell when a section crosses the middle of the screen; re-run per path),
  and `presence.ts` (idle levels, the hidden tab's title and anchor icon, offline and online).
  `Announcer` is the one visible, polite status line for notices.
- Section kickers reveal with clip-path; adjacent headings stay fully opaque in both
  pending and arrived states so scrolling is never needed for readable contrast.
- Styling a response before arrival uses `html[data-feedback] …:not([data-arrived])`, so without
  JavaScript everything is simply shown. `app/feedback.css` holds the site-wide visual responses;
  section responses sit in their modules. `ScrollMark` is the depth line (home) and the reading
  ribbon (posts), scroll-driven CSS only.

## The gull

`components/gull/` lands a herring gull in the hero's "Play waves" (`<WaveSoundControl gull />`);
the story is in [feedback.md](feedback.md), the rules in decisions.md.

- **Pure:** `rotation` (3×3 rotations), `pose` (each wing's joints: lift, sweep, twist, reach, wrist
  lift and sweep, and `fold`, which blends the wing into a designed folded shape on the body's
  flank; tail, legs, neck, head, eye, fluff; named poses and `mixPose`), `body` (`gullFacets(pose,
view)`: an eight-sided lofted body, head and bill, two-panel wings with black tips and white primary spots, a lofted tail,
  legs; groups sorted by depth, then facets; flat light; `lookTowards`; `beakTip`, the projected end
  of the bill), `flight` (pure timelines: `planArrival`/`arrivalAt` along a cubic Bézier with
  flap-and-glide bursts and a smootherstep velocity brake, touchdown, wings raised then folded, sitting;
  `habitsFor(seed, night)` and `perchedAt`; `withMoods` for standing and sleeping; `withGaze`;
  `planDeparture`/`departureAt`), `song` (the notes: a fixed schedule of phrases from 0.7 s after
  landing until 36 s by day, one phrase by night, `notesAt`, `restingNotes` for reduced motion, `withSong` which lifts the head
  with each note), `paint` (canvas colours by theme and an ink mode that fades to paper with ink
  edges; `paintNotes`), `placement` (scale, canvas and reserved seat from button height; contact offset from
  the body/feet facets),
  `rest` (night rest after 12 s unless engaged, idle rest in either theme). Units are body lengths, `x` forward, `y` up, `z` the bird's right; a
  frame's `x`, `y` are pixels from the perch.
- **Lifecycle:** `visit.ts` (called by `Gull.tsx`) owns timing, observers and the frame loop. The
  canvas sits inside the button, `aria-hidden`, anchored to the pill's inner floor near its right
  end, 20 px inset and anchored on the bottom border centreline (`Gull.module.css`) and moved with `transform`; its size follows the button's height (1.18
  body lengths per button height, 2.8 lengths a side). The button makes room by setting `data-room`
  (`SoundControls.module.css` adds the gull's width, `--perch-seat`, to its right padding, with a
  transition) about 1.4 s before landing, and removes it once the gull has gone. It flies within the
  nearest `[data-gull-sky]` (the hero stage, which clips it), reads `data-chapter` and `data-still`
  on `[data-observatory]` (`OceanScene` sets `data-still` while stilled), `html[data-idle]` and the
  theme (resampling the same habit seed on a theme change), and dips the button with `--perch-dip`. It draws only while something moves (flight,
  habits, a note in the air) and keeps a paused clock while hidden, offscreen or stilled.
  Contact facets identify the belly and feet; the renderer uses their lowest projected point
  to align the landed bird with the border, without a second geometry pass. Head and wing
  motion do not move the contact reference. Viewport, control-height and display-density
  changes refit the canvas; every draw also checks DPR to cover late media events; rotation during arrival settles quietly onto the perch.
  A live reduced-motion preference is enforced in the frame sampler as well as the
  media listener: arrival settles, departure vanishes, and habits stop.
- **Contract for checks:** the hero now holds two canvases and the gull's comes first, so a check
  must select the sea as `canvas[data-ocean]`, never the first canvas.

## Local post editor

`/write` (with `/api/dev/posts` behind it) is a writing tool for the owner's machine only. Its
files use the extension `.dev.tsx` / `.dev.ts` (`page.dev.tsx`, `route.dev.ts`), which
`next.config.ts` accepts as routes **only outside production**, so a production build contains no
such route, bundle or API (`check-seo` fails if either answers). The editor lists posts, edits
the frontmatter fields and the markdown, inserts snippets (section, code, table, list), creates a
new post, autosaves about a second after typing (or on Ctrl/Cmd+S) and shows the real notebook
page in an iframe (dev sends `X-Frame-Options: SAMEORIGIN`; production keeps `DENY`). Saving only
writes `content/posts/NN-slug.md`: the file name must match `POST_FILE`, fields are collapsed to
single lines, sizes are capped, and a request is accepted only from a localhost page of the same
origin sending JSON (so another website cannot write files while the dev server runs).
`lib/post-file.ts` holds the pure parts; `content/post-files.ts` does the file access;
`outputFileTracingExcludes` keeps the editor out of deployment traces.

## Studio and content

- `components/PageShell.tsx` is the paper page frame shared by case studies and `/sea`: skip
  link, brand and `StudioNav` header, `main`, shore footer; its `--page-gutter` sets the side
  margins for both.
- `components/studio/`: `SeaStudio` (rendered by `app/sea/page.tsx`) composes `SettingSlider`, `SeedField`, `KeepActions`,
  `Die` (the dice button's drawn die) and the `useSeaSettings` hook. The starting seas are the
  presets plus Home water, and the chip for the current sea is pressed. The drawing it redraws is
  the same `renderSeaPlate` that prints. In landscape viewports 560–960 px wide and ≤620 px
  high, the studio grid puts its introduction, form and keep actions in the left column;
  `display: contents` on the workbench/result places the sticky figure in the right column
  beside the introduction and form. Its full SVG is capped at `100svh − 7.5rem`, keeping
  room for the seed/caption. Controls use a 1rem focus scroll margin because the preview
  sits beside them. Portrait keeps the top-pinned drawing (capped at 32svh) and its larger focus margin.
  `StudioPlate` first renders a lazy image from `/api/sea-edition/print` with the same seed
  and version, then after hydration the same drawing as inline SVG for editing; both share
  sizing, aspect containment and the night filter, so the large SVG stays out of the
  initial HTML and no-JavaScript visitors still get the printable drawing.
- `content/`: `site.ts` (identity; the offer as `offer` and `promise`, joined in `tagline`; the
  email; nav; links; `profiles` for About and the shore; and `afterHero`, the section the skip
  link, the hero's chapter link, the phone's last swipe and the posts' "See the work" lead to),
  `contact.ts` (the three "What to expect" steps), `projects.ts` (five projects: `kind` client
  or personal; `visuals`, one or more screenshots or system drawings, each with its plate
  title and note (the first is the card's, the case study shows all); a `proof` line; facts (`period` for calendar dates, `duration` for approximate Build time);
  the first project is the lead; `caseStudyPath` and `caseStudyTitle`), `work/<slug>.md` (each case study's prose,
  body only: the file name is the slug; loaded by `case-studies.ts` with `parseMarkdown`),
  `about.ts` (the about facts), `notebook.ts` (the approved essays' copy and captions).
- Homepage sections are one component each: `Work` (the lead through `ProjectFeature`, then a
  grid of the other client projects, then the personal ones as `ProjectRow`s; a card is plate,
  headline, one summary, the proof line and `CaseStudyLink`; `ProjectPlate` is the figure,
  shared with the case-study page), `About`, `Contact` (with `CopyButton`, which shares `copy-text.ts` with the
  studio's "Copy link"), `NotebookSection` (the three newest entries from `latestNotes`, and the
  compass). `components/Section.module.css` is their one copy of the section header (its size
  in `--title-size`), kicker (and its arrival), lede, a rule that draws itself (`drawnRule`),
  accent index numbers, facts list, plate (head and caption) and link; the section modules
  `composes` from it. `Kicker` is the kicker paragraph that arrives.
- **Case studies** (`app/work/[slug]/page.tsx`, `app/work/CaseStudy.module.css`): a running head
  (`StudioNav`, shared with the Notebook; it marks Work on `/work/*` and Notebook on `/blog*`),
  the headline with summary, proof and facts (reading time from `readingMinutes` in
  `lib/format.ts`, shared with posts), the plate large, the prose (`components/Prose.tsx`, shared
  with posts; the Notebook passes its table class), next case study, the home `Contact` section,
  then `ShoreFooter` (its sea-model line shows only where a sea is passed). They follow the
  day/night theme; the shore's `ThemeControl` sets it on a direct load. Article JSON-LD comes
  from `caseStudyStructuredData` through `components/JsonLd.tsx`, also used by the homepage.
- **Notebook articles** (`app/blog/[slug]/page.tsx`, `components/atlas/`): the original essays
  and published Markdown notes share `ArticleHead`, their plate and their reading layout. The
  route passes source facts to `blogPostingStructuredData` through `components/JsonLd.tsx`;
  development-only drafts never emit it.
- **Type and colour:** `app/fonts.ts` loads Montagu Slab (display and essay text, `opsz`
  follows font size), Rethink Sans (text and labels) and Reddit Mono (data only: seeds, code,
  tables, plate notation) as `--typeface-*`; `globals.css` maps them to `--font-display`,
  `--font-sans` and `--font-mono`. next/font generates the fallback metrics for all three.
  Only Montagu Slab is preloaded (the hero title); the others use `preload: false` and load
  when used, with `display: swap`. `globals.css` is the one palette (Open water): theme tokens
  (`--paper`, `--sheet`, `--water`, `--ink`, `--ink-2/3`, `--accent`, `--buff`, `--gold`,
  `--band*`, rules) switch with `html[data-studio-theme="night"]`. Day-only pages (the
  Notebook, `/plate`, error pages) read the fixed `--chart-*` constants, because the night
  attribute is set on every page. The Notebook's `--atlas-*` palette in
  `Atlas.module.css` is built from them. The hero's colours over the sea are its own.
- **System drawings:** `lib/system-drawing.ts` (pure) lays a drawing out on a 340 × 330 plate:
  labelled bands, each a four-column grid of boxes (span 1, 2 or 4), and arrows that run
  straight where two boxes overlap horizontally or vertically and diagonally otherwise, clipped
  to the box edges. `components/SystemPlate.tsx` draws it in the section's ink, paper and accent
  (night colours follow the palette); the drawing is one `role="img"` with the project's `alt`.
  `tools/check-drawing-labels.mjs` measures loaded-font labels and notes against their boxes
  on home and all drawing case studies at 390/1440 px (3-unit side clearance).
  `tools/system-drawing.test.mjs` checks that every project drawing fits, overlaps nothing and
  routes no arrow through a box.
- `components/portrait/`: `engraving.ts` (pure) turns the photo's shade into 72 closed row
  outlines lifted by light and rippled by Home water (`sampleSea`); `medal.ts` (pure) is the
  bezel's geometry (face inset, ticks, legend arcs) drawn by `Bezel.tsx`; `Portrait.tsx` reads
  the loaded image through a 160 px canvas and layers the monochrome photo (grayscale, then
  `screen` and `multiply` with the theme's two colours) and the engraving in a round face. One
  registered CSS property, `--progress`, runs 0 to 1 over the medal's whole pass (`view()`
  timeline, `cover 0%` to `cover 100%`): it prints and unprints the lines (clip), surfaces and
  sinks the photo (opacity) and turns the tick ring; `--look` on hover shows the lines. Without
  scroll timelines, under reduced motion or without JavaScript, `--progress` stays at 0.5 and the
  photo shows. `--progress` and its view timeline are global (`[data-voyage]` in `globals.css`),
  shared with the compass.
  `components/atlas/` holds the notebook's scoped styling, `MarkPlate` and `OceanPlate`.
- **Written posts** are markdown files in `content/posts/` (`NN-slug.md`, frontmatter: `title`,
  `summary`, `topic`, `date`, `status`, and optionally `emphasis` (the last words of the title,
  set in red italics), `caption` (the cover plate's caption) and `closing` (the red closing
  line)). They are laid out like the original essays: the first paragraph is the large
  opening, each `##` heading is a numbered section, a `>` quote straight after a heading
  becomes that section's margin note, and a section called "Notes for the editor" is shown
  only on drafts. Each post's cover plate is its own sea, derived from its slug. `lib/markdown.ts` parses a small subset (headings,
  paragraphs, fenced code, tables, lists, rules, and inline code, bold, italic and links with
  safe schemes only); `content/posts.ts` loads them; `components/Prose.tsx` and
  `WrittenArticle.tsx` render them; `lib/post-structure.ts` groups the blocks.
  `ArticleParts.tsx` (header, cover, sections, and `ArticleEnd`: the author line and the next
  note) and `NoteFeature.tsx` (the big
  light and dark features on `/blog`) are shared with the original essays. `status: draft` posts appear in development and are
  absent from production builds (no page, no link); set `status: published` to ship one.
  Published posts are indexed and included in the sitemap; drafts are excluded. `postsDirectory` is a literal path
  (`process.cwd()`, `content`, `posts`) so the build traces only that folder; a path built from
  an imported constant made Turbopack trace the whole project into every route that reads
  posts (353 files for `/`, 153 now). The editor's `post-files.ts` imports the same constant.
- The studio mark lives in `components/Mark.tsx`. `app/icon.svg`, `app/favicon.ico`,
  `app/apple-icon.png`, the manifest icons in `public/` and the default share card
  (`site.shareImage`, `public/images/studio-card-v2.jpg`) are rendered from it and the live sea by
  the brand kit beside the repo (`../brand/`, see its README). `app/manifest.ts` and the
  theme colour read `site.colors`.
- **Navigation feedback:** PageLink renders NavigationStatus inside Next Link;
  useLinkStatus supplies the actual pending state. Only pending links portal a fixed,
  pointer-transparent “Opening page…” status to body, outside transformed/sticky link
  ancestors. It does not shift layout or take focus; CSS honours Reduce Motion and print.
  Public Next links share PageLink, including NotebookLink and error/print return links.
  No loading route boundary is added, preserving missing-route HTTP status behaviour.
- **Links:** `SmoothLinks` (root layout) sets `html[data-glide]` (`scroll-behavior: smooth`)
  for the one scroll a click on a `#` link starts, until `scrollend` or 1.5 s. `PageLink` wraps
  `Link`: pointing at the page already open (path and query), a plain click scrolls to the top
  instead, dropping any `#hash` with `pushState`. `NotebookLink` (page turns) builds on it.

## Headers, security and configuration

`next.config.ts` sends a production CSP (no `unsafe-eval`; scripts keep `unsafe-inline`
because Next inlines its bootstrap), `nosniff`, `X-Frame-Options: DENY`, a strict
referrer policy, `Cross-Origin-Opener-Policy`, and a Permissions-Policy that disables
camera, microphone, geolocation and similar. API routes set their own headers.
`public/.well-known/security.txt` expires on 6 October 2027.

| Variable                                                     | Use                                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                       | Canonical origin; defaults to `https://www.maxsash.com`               |
| `GITHUB_TOKEN`                                               | Optional, server-only; raises GitHub's rate limit                     |
| `VERCEL_GIT_COMMIT_SHA`, `NEXT_PUBLIC_BUILD_SHA`             | Short commit in the footer; omitted when absent                       |
| `TELEMETRY_ENABLED`, `POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST`, `REPLAY_ENABLED` | Event relay and separate replay gate; [telemetry-setup.md](telemetry-setup.md) |

## Not implemented

No device tilt, no real ocean data or forecasts, no observation ingestion, no fluid
simulation, no live sea state, no hidden "C" experience. Do not write copy that implies
any of these. The night sky ships a compact star catalogue and a night-only lunar map, and
no ephemeris library.
