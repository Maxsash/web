# Architecture

How the site is put together and which contracts must not change. Why it looks this
way: [decisions.md](decisions.md). How it is checked: [testing.md](testing.md).

## Routes

| Route                              | What it is                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/`                                | Hero sea, Work, sea studio, notebook, Elsewhere, shoreline footer. Dynamic: a fresh sea per visit. |
| `/?seed=…&version=2`               | A fixed, shareable sea. A seed without `version` means version 1, forever.                     |
| `/plate?seed=…&version=2`          | Print page for one sea (`noindex`).                                                            |
| `/blog`, `/blog/[slug]`            | The notebook: two labelled sample essays and any written posts (`noindex`).                    |
| `/api/sea-edition`                 | The sea's six waves as JSON. No `version` means version 1.                                     |
| `/api/sea-edition/print`           | The same sea as an SVG plate (`&download=1` to save).                                          |
| `/robots.txt`, `/sitemap.xml`      | Discovery files; the sitemap lists the homepage only.                                          |

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
- The context is requested with `failIfMajorPerformanceCaveat`, so a browser that can
  only render in software (hardware acceleration off, no GPU, a blocklisted driver) gets
  the SVG plate instead of a janky scene. Context creation failure and context loss also
  fall back to the plate; there is no restoration path.

### Scroll and the mobile stages

Desktop scroll maps continuously to progress 0–1 (sea, structure, drawing). When the
primary pointer is coarse, the hero is staged instead: Sea (0), Structure (0.55),
Drawing (1), one stage per vertical swipe (≥ 35 px, 1.25× vertical dominance) or button,
and the next swipe after Drawing scrolls into Work. Sea → Structure eases out over
1,800 ms (`t·(2−t)`); every other move is a 600 ms smootherstep. Below progress 0.55 the
reveal is `progress / 0.55 · (0.55 − 0.14) / 0.75`. Reduced motion shows stills. Without
JavaScript the page is readable and scrolls natively. These timings were approved on a
physical iPhone: refactor around them, never change them.

## Shoreline footer

`components/shore/`: `Shoreline` owns the canvas lifecycle; `sand` paints the cached
sand and shells, `tide` the shore line, wet sand and surf, `footprints` the mouse-only
fading tracks, `palette` the day and night colours. Budgets: 30 Hz, 420,000 pixels, paused
when hidden or offscreen, still under reduced motion. `WaveSound` synthesises wave sound
and stays silent until a visitor presses "Play waves"; mute is remembered and reload
never starts audio. Theme follows the system until the footer switch saves an override
(`ThemeControl`).

`GitHubActivity` shows this site's three newest commits (`maxsash/web`, public),
fetched on the server, cached for an hour, with a 2.5 s timeout and a plain link as
fallback. It shows no counts or charts. `ShoreFooter` prints the package version and,
when the host provides one, a short commit.

## Page-turn sound

Going into the notebook (any link to `/blog`, from the home page, the notebook index, an essay or
the "Keep looking" link) plays a synthesised page turn: a very soft, low swell that builds and fades into a barely-there landing, deliberately gentler than a real page (the owner chose this "hush" tuning by ear). There are four slight variations of it (length, pitch, landing), chosen at random without repeating the last one, and each play shifts speed by up to ±4% and volume by up to ±15%, so it does not sound mechanical. `lib/page-turn.ts` makes it (pure, deterministic, no
audio file); `components/NotebookLink.tsx` plays it. **It only plays after the visitor has
switched sound on** with "Play waves" (the module remembers that until the page is reloaded)
and stays silent after "Mute waves", on modified clicks, and when the link points at the page
already open. `node tools/render-page-turn.mjs` writes `tools/.out/page-turn-1…4.wav` to listen to; the
`PAGE_TURNS` in `lib/page-turn.ts` tune them, and a test keeps it soft (low hissiness) rather than a
tearing sound.

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

- `components/studio/`: `SeaStudio` composes `SettingSlider`, `SeedField`, `KeepActions`
  and the `useSeaSettings` hook. The drawing it redraws is the same `renderSeaPlate` that
  prints.
- `content/`: `site.ts` (destinations, nav, links), `projects.ts` (the two project
  spreads), `notebook.ts` (essay copy and captions). `components/Work.tsx` renders
  projects through `ProjectFeature`; `components/atlas/` holds the notebook's scoped
  styling, `MarkPlate` and `OceanPlate`.
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
  `ArticleParts.tsx` (header, cover, sections, next link) and `NoteFeature.tsx` (the big
  light and dark features on `/blog`) are shared with the sample essays. `status: draft` posts appear in development and are
  absent from production builds (no page, no link); set `status: published` to ship one.
  They stay `noindex` and out of the sitemap either way.
- The studio mark lives in `components/Mark.tsx`, `app/icon.svg` and `public/mark.svg`.

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
