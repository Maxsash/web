# The sky

How the hero's sky is drawn, how accurate it is, and what it may cost. Why it looks this way:
[decisions.md](decisions.md) ("The sea"). Checks: [testing.md](testing.md).

## Accuracy

- **Day-wise, not live.** One snapshot per India day at about 21:00 IST over Tikamgarh
  (about 24.75° N, 78.83° E; a public town-junction coordinate from the
  [government forestry portal](https://forestsclearance.nic.in/timeline.aspx?pid=FP%2FMP%2FROAD%2F34322%2F2018)).
  No visitor location, permission prompt or weather.
- **The Moon is framed.** It keeps its authored place and size even on nights the real Moon
  is below Tikamgarh's horizon (12 October 2026: about −29.7°). The dated sky is rotated
  around it, keeping relative angular positions; latitude and time give the orientation.
  Never call it an exact local sky view.
- **Visibility is perceptual.** Faint stars fade as lunar illumination rises and near the Moon;
  full Moon still leaves the bright stars and planets. Not a limiting-magnitude model: the
  Moon's altitude, haze and artificial light are not observed.
- **Tides are not modelled.** The largest tidal range comes near both new and full Moon
  ([NOAA](https://www.noaa.gov/education/resource-collections/ocean-coasts/tides)), and the phase
  alone neither says whether the water is high at 21:00 nor sets wind-wave height, so the
  waves stay independent of the Moon. The moonlit sea is lighting, not calibrated illuminance.

## Sky and daylight

`daily-atmosphere.ts` hashes the India Moon day into a bounded four-value recipe (cloud
shift and opacity, cirrus strength, haze). The engine refreshes it with the Moon on date or
preview changes and sends the same values to the sky, sea, star and planet shaders: by day
cirrus, horizon, halo and a small glitter change; by night cloud placement, horizon haze and
faint-star visibility. Authored daily variety, not observed weather.

`cloud-shaders.ts` owns two sparse soft clusters (six analytic lobes each) and their shared
opacity and light field. The homepage sky opts in through `skyFragmentSource`; star and
planet vertex shaders sample the same field and clock to dim points behind clouds. A compact
layout moves the main cluster away from the headline; colours follow day, night and lunar
illumination.

`daylight-shaders.ts` adds, through the same sky and sea factories, three cirrus veils on
the paused scene clock, a horizon wash, a solar halo, and a fine normal-based specular lobe
with a reflection column beneath the framed sun. Night lighting and the error-page defaults
stay separate; the reveal fades all of it into paper, and lifecycle owns Reduce Motion and
stilling. None of this adds a pass, an asset or a change to the waves.

## Theme interaction

`theme.ts` is the one theme authority: it applies `html[data-studio-theme]`, persists manual
choices, emits `studio-theme` with an origin and follows OS changes until a manual choice.
`initial-theme.ts` runs inline in the root layout's `<head>` (the saved choice, else the OS
preference), so the first paint has the visitor's theme, and again in `followTheme`; `<html>` carries
`suppressHydrationWarning` for the attribute it sets. `useStudioTheme` gives React a snapshot
and a reference-counted lifecycle for the shore's `ThemeControl` and the hero.

`OceanScene` places a labelled `data-sky-theme` button over `SEA_LIGHT_SCREEN`, with
`sky-control.ts` giving it a 44 px minimum square. Text measurements hide it where copy,
header or meta overlap, and Drawing and fallback hide it too; its transparent hit area leaves
the shader's disc visible; its hover ring shows only on devices that hover, and focus is
explicit. An activation calls `engine.ripple` at `SEA_REFLECTION_SCREEN` (buttons never
trigger the canvas pointer ripple) and `theme-blend.ts` samples an interruptible 1,000 ms
smootherstep in the existing frame loop, sending sky, sea and ship one floating `uNight`.
Initial loads, hidden scenes, reduced motion and paused seas snap; a preference or pause
change mid-blend settles on the next draw.

## Moon phase

`moon-phase.ts` is pure: Schlyter's solar and lunar orbital elements, Kepler's equation and
lunar perturbations give the geocentric cycle and a distance-corrected illuminated fraction
([algorithm](https://stjarnhimlen.se/comp/ppcomp.html), sections 3–9 and 15). `indiaMoonDay`
picks the calendar day and `moonForIndiaDay` samples noon IST. The engine caches the day and
supplies `uMoon` to `skyFragmentSource({ moonPhase: true })`, which rebuilds the sphere's
normals inside one antialiased disc: a phase-derived sunlight vector sets the boundary, and the
unlit side stays faintly legible with earthshine instead of a black cover. Ordinary phases are
sunlight geometry, not an eclipse ([NASA](https://science.nasa.gov/moon/moon-phases/)). Default
shader strings stay byte-identical for error scenes.

The frame refreshes the date cheaply, and `OceanScene` checks once a minute so paused and
reduced-motion scenes redraw after India midnight; hidden scenes refresh on their next draw.
The static fallback has no astronomical sky.

## Stars

`star-sky.ts` decodes the bright-star subset (`public/stars-hyg-v41.bin`) and builds a
Moon-centred tangent frame for Tikamgarh at 21:00 IST, using the local zenith to keep each
day's pattern oriented while the Moon stays at `SEA_LIGHT_SCREEN`. The engine fetches the file
on the first night draw, uploads one dated point buffer and draws a single blended point pass
after the sky and before the sea. The point shader fades faint stars with lunar illumination,
suppresses those near the Moon, and follows `uNight` and `uReveal`. Stars may twinkle weakly
and slowly; planets stay steady ([NASA](https://imagine.gsfc.nasa.gov/ask_astro/night_sky.html)). Midnight rebuilds the
buffer; a failed fetch leaves the sea intact. The shore's colophon links the attribution.

## Planets and the development preview

`planet-sky.ts` places Mercury through Saturn from
[JPL's 1800–2050 orbital elements](https://ssd.jpl.nasa.gov/planets/approx_pos.html) at the same
instant, with brightness from Sun and observer distance and phase angle (Saturn adds ring
tilt). `skyProjectionAt` keeps planets and stars in one Moon-centred orientation. Planets within
12° of the Sun or fainter than magnitude 5 are left out. The steady point pass allocates on the
first night draw and refreshes after India midnight. The elements omit full light-time,
atmospheric and topocentric corrections.

`DevSkyPreview` exists only under `NODE_ENV === "development"`: it picks any date or one of
eight nearby phases, sets the engine's preview day and switches to night. Production has no
control and no extra ephemeris asset.

## Moonlit sea

The hero opts into `seaFragmentSource({ moonlight: true })` with the same daily illuminated
fraction. An authored nonlinear curve scales the night specular glint and confines it to a soft
column under `SEA_LIGHT_SCREEN`; a small diffuse baseline keeps the water readable near new
Moon. Daylight, the waves and the error seas' default path are unchanged, and the theme blend
applies through `uNight`.

## Mapped Moon

The first frame that shows the night Moon mounts `MoonDetail` in a `data-moon-map` overlay at
the shader Moon's position and diameter (`MOON_SCREEN_RADIUS`, shared with the shader). It
fetches the near-side crop of the 2025 NASA SVS 2K map at low priority and hands it to
`moon-detail.worker.ts`, which shades it for the engine's day with the pure `moon-detail.ts`,
returns a 512 px image and is terminated, so the 4 MiB decoded map never stays in memory. A
daytime sea never requests it; a new day repeats the round trip from the HTTP cache.

The overlay is composited with `plus-lighter`, adding lunar light to the WebGL sky, so the
unlit side is sky plus faint earthshine. Once drawn, the frame loop crossfades the shader's Moon
(`uMoonMap`) into it; its opacity is night × map blend × the sky's paper fade (`moonVisibility`,
literals shared through `SKY_PAPER_FADE`). If the map or worker fails, the shader's Moon stays.
The overlay has no hit target, so the theme button still works, and it hides with the scene in
fallback.

**Why this size:** the disc is 0.038 × stage height, about 32–41 CSS px (70–110 device px).
Pinch zoom reaches about 5×, about 480 device px on a phone, so a 512 px canvas holds the
detail; at the disc centre one canvas pixel spans about 1.3 map pixels. The 2K source matches,
1K would soften at full zoom, and 4K or 8K maps would be wasted. Only the near side is drawn,
so the site ships a lossless `jpegtran` crop: 1024 × 1024 (longitudes ±90°), 215,631 bytes
instead of 457,942, its pixels identical to the original's middle half.

## Sources

- **Stars:** 1,627 stars at magnitude 5 or brighter from
  [HYG v4.1](https://github.com/astronexus/HYG-Database/blob/main/hyg/README.md) (Hipparcos and
  other catalogues), 9,768 bytes, [CC BY-SA 4.0](../public/stars-hyg-v41-LICENSE.txt). The
  source CSV's SHA-256 and the quantization are pinned in `tools/build-star-catalog.py`.
- **Planets:** JPL's fitted elements and Schlyter's magnitude approximations.
  [Astronomy Engine](https://github.com/cosinekitty/astronomy) 2.1.15 was used only as an
  independent test reference; it is not installed, because it would add 45.7 KiB gzipped and
  about 7 ms of evaluation for what a daily snapshot needs.
- **Moon phases:** `tools/moon-phase.test.mjs` checks against the
  [USNO primary phases for October–November 2026](https://aa.usno.navy.mil/calculated/moon/phases?date=2026-10-01&format=p&nump=6)
  (within 0.2° and 0.5% illumination); not an ephemeris certification.
- **Moon:** the 2025 2K map from [NASA's CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), credited
  in the footer and in [its notice](../public/moon-lroc-2k-CREDITS.txt), per the
  [NASA usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). Mapped
  imagery, not a live photograph.

## Budgets

- One sparse point pass per layer in the existing context and frame loop; no DOM node per star,
  no star loop in the full-screen shader, no per-frame orbit maths; the daily buffer is tiny.
- The 360k and 1.5M pixel caps, frame governor, pause, hidden, offscreen and reduced-motion
  policies apply unchanged. No high-resolution download at startup.
- Acceptance: at most 0.3 ms median added desktop GPU time after warmup, and 0.5 ms on a
  representative phone as a target. Measured on desktop Metal (12 October 2026): stars 0.18 ms
  and planets 0.17 ms median; short-run p95 was noisy (up to 2 ms). No phone measurement exists.
- Deferred: dense Milky Way textures, weather simulation, satellites, meteor showers.
