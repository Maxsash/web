# Architecture

How the site is put together and which contracts must not change. Why it looks this
way: [decisions.md](decisions.md). How it is checked: [testing.md](testing.md).

## Routes

| Route                              | What it is                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/`                                | Hero sea, Work, About, Contact, notebook, sea studio, shoreline footer. Dynamic: a fresh sea per visit. |
| `/?seed=…&version=2`               | A fixed, shareable sea. A seed without `version` means version 1, forever.                     |
| `/plate?seed=…&version=2`          | Print page for one sea (`noindex`).                                                            |
| `/blog`, `/blog/[slug]`            | The notebook: two labelled sample essays and any written posts (`noindex`). Unknown slugs render on demand so they reach the notebook 404. |
| `/api/sea-edition`                 | The sea's six waves as JSON. No `version` means version 1.                                     |
| `/api/sea-edition/print`           | The same sea as an SVG plate (`&download=1` to save).                                          |
| `/robots.txt`, `/sitemap.xml`      | Discovery files; the sitemap lists the homepage only.                                          |
| Error pages                        | `app/not-found.tsx` (any unknown address), `app/blog/not-found.tsx` (unknown or draft note), `app/plate/not-found.tsx` (bad seed or version), `app/error.tsx` (a page crashed), `app/global-error.tsx` (the root layout failed). |

No database, accounts, cookies or client calls to third parties. The only server-side
inputs are a sea seed (eight hex characters) and the optional GitHub request below.

## The sea model

One height field serves everything: the GPU surface, the ship's attitude, the printed
plate and the API. `lib/sea/` holds it, with no DOM and no React:

| Module                 | Responsibility                                                        |
| ---------------------- | --------------------------------------------------------------------- |
| `types`                | `SeaEdition`, `SeaSettings`, `SeaVersion`                              |
| `seed`                 | Seed parsing, the four settings as four bytes, default seeds           |
| `random`, `wave-table` | The 32-bit PRNG and the baseline wave table                            |
| `edition-v1`           | **Frozen.** Never change its PRNG, coefficients or interpretation       |
| `edition-v2`           | Settings-driven edition (swell, heading, character, variation)         |
| `edition`              | `createSeaEdition(seed, version)`                                      |
| `presets`              | Glass, Trade wind, Squall, Home water; `pickVisitSea` for a new visit  |
| `describe`, `sample`   | Words for a setting; `sampleSea(edition, x, z, t)` height and slope     |
| `plate`                | `renderSeaPlate`, the SVG engraving                                    |
| `request`              | Seed and version parsing for pages and API routes                      |

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

Native WebGL2, no 3D library, no downloaded model or texture. The deferred engine sits
behind a server-rendered SVG plate, which is also the fallback.

- `components/observatory/OceanScene.tsx` owns lifecycle only (events, observers, frame
  loop). Its pure rules are separate modules: `stage-director`, `reveal-mapping`,
  `layer-opacity`, `frame-governor`, `touch-stages`, `clamp`.
- `ocean-engine.ts` draws; `ocean-shaders.ts` holds the GLSL; `ocean-light.ts` projects
  the sun or moon into the scene; `camera`, `matrices`, `vec3`, `ship-mesh`,
  `sea-grid` and `gl-resources` are its parts. The ship is a procedural sailboat, not
  the brand mark.
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
  exports builders; the homepage strings are their defaults, pinned byte for byte by
  `tools/drift.test.mjs`.

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
physical iPhone: refactor around them, never change them.

## Shoreline footer

`components/shore/`: `Shoreline` owns the canvas lifecycle; `sand` paints the cached
sand and shells, `tide` the shore line, wet sand and surf, `footprints` the mouse-only
fading tracks, `palette` the day and night colours. Budgets: 30 Hz, 420,000 pixels, paused
when hidden or offscreen, still under reduced motion. `<Waves />` holds the wave sound while the
shore is mounted (see Sound). Theme follows the system until the footer switch saves an
override (`ThemeControl`).

`GitHubActivity` shows this site's three newest commits (`maxsash/web`, public),
fetched on the server, cached for an hour, with a 2.5 s timeout and a plain link as
fallback. It shows no counts or charts. `ShoreFooter` prints the package version and,
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
- Styling a response before arrival uses `html[data-feedback] …:not([data-arrived])`, so without
  JavaScript everything is simply shown. `app/feedback.css` holds the site-wide visual responses;
  section responses sit in their modules. `ScrollMark` is the depth line (home) and the reading
  ribbon (posts), scroll-driven CSS only.

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

- `components/studio/`: `SeaStudio` composes `SettingSlider`, `SeedField`, `KeepActions`,
  `Die` (the dice button's drawn die) and the `useSeaSettings` hook. The starting seas are the
  presets plus Home water, and the chip for the current sea is pressed. The drawing it redraws is
  the same `renderSeaPlate` that prints.
- `content/`: `site.ts` (identity; the offer as `offer` and `promise`, joined in `tagline`; the
  email; nav; links; `profiles` for About and the shore; and `afterHero`, the section the skip
  link, the hero's chapter link, the phone's last swipe and the posts' "See the work" lead to),
  `contact.ts` (the three "What to expect" steps), `projects.ts` (five projects: `kind` client
  or personal, a screenshot or a system drawing as `visual`; the first is the lead),
  `about.ts` (the about facts), `notebook.ts` (the sample essays' copy and captions).
- Homepage sections are one component each: `Work` (the lead through `ProjectFeature`, then a
  grid per kind), `About`, `Contact` (with `CopyButton`, which shares `copy-text.ts` with the
  studio's "Copy link"), `NotebookSection` (the three newest entries from `latestNotes`, and the
  compass). `components/Section.module.css` is their one copy of the paper palette (day and
  night), section header, kicker (and its arrival), lede, a rule that draws itself
  (`drawnRule`), rust index numbers, facts list, plate (head and caption) and link; the section
  modules `composes` from it. `Kicker` is the kicker paragraph that arrives.
- **System drawings:** `lib/system-drawing.ts` (pure) lays a drawing out on a 340 × 330 plate:
  labelled bands, each a four-column grid of boxes (span 1, 2 or 4), and arrows that run
  straight where two boxes overlap horizontally or vertically and diagonally otherwise, clipped
  to the box edges. `components/SystemPlate.tsx` draws it in the section's ink, paper and rust
  (night colours follow the palette); the drawing is one `role="img"` with the project's `alt`.
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
  line)). They are laid out like the sample essays: the first paragraph is the large
  opening, each `##` heading is a numbered section, a `>` quote straight after a heading
  becomes that section's margin note, and a section called "Notes for the editor" is shown
  only on drafts. Each post's cover plate is its own sea, derived from its slug. `lib/markdown.ts` parses a small subset (headings,
  paragraphs, fenced code, tables, lists, rules, and inline code, bold, italic and links with
  safe schemes only); `content/posts.ts` loads them; `components/atlas/Prose.tsx` and
  `WrittenArticle.tsx` render them; `lib/post-structure.ts` groups the blocks.
  `ArticleParts.tsx` (header, cover, sections, and `ArticleEnd`: the author line and the next
  note) and `NoteFeature.tsx` (the big
  light and dark features on `/blog`) are shared with the sample essays. `status: draft` posts appear in development and are
  absent from production builds (no page, no link); set `status: published` to ship one.
  They stay `noindex` and out of the sitemap either way. `postsDirectory` is a literal path
  (`process.cwd()`, `content`, `posts`) so the build traces only that folder; a path built from
  an imported constant made Turbopack trace the whole project into every route that reads
  posts (353 files for `/`, 153 now). The editor's `post-files.ts` imports the same constant.
- The studio mark lives in `components/Mark.tsx`, `app/icon.svg` and `public/mark.svg`.
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

| Variable                               | Use                                                       |
| -------------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | Canonical origin; defaults to `https://www.maxsash.com`   |
| `GITHUB_TOKEN`                         | Optional, server-only; raises GitHub's rate limit         |
| `VERCEL_GIT_COMMIT_SHA`, `NEXT_PUBLIC_BUILD_SHA` | Short commit in the footer; omitted when absent  |

## Not implemented

No device tilt, no real ocean data or forecasts, no observation ingestion, no fluid
simulation, no live sea state, no hidden "C" experience. Do not write copy that implies
any of these.
