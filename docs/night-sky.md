# Night sky — implementation brief

Research and phased build, 12 October 2026. The transition was committed as d21757f;
stars, planets and the temporary preview are committed through 54290fe; phase 3 sea
lighting is committed as 5654e61. Phase 4, the always-on mapped Moon, is built in the
working tree for review.

## Direction

Owner: day-wise accuracy, not hourly/minute-wise; keep the Moon framed and compose the
sky around it, with modest shifts allowed. Use roughly 21:00 IST for the daily snapshot.
The fixed observer is Tikamgarh (approximately 24.75° N, 78.83° E), at about 21:00 IST;
no visitor location, permission prompt or weather. City coordinates/daily time are not a
local visibility forecast. A public town-junction coordinate is documented by the
[government forestry portal](https://forestsclearance.nic.in/timeline.aspx?pid=FP%2FMP%2FROAD%2F34322%2F2018).

The owner has now asked to build in reviewable phases, with the darkest and most populated
star field near new Moon, progressively less visible at full Moon, phase-aware sea light,
and an actual mapped lunar surface in the Moon's original disc. The owner then chose to show
it whenever the night sky shows the Moon, so native zoom reveals its resolution in place,
without a swap or telescope prompt. The fixed Moon and authored horizon remain the framing.

## Delivery phases

1. **Dated stars.** Pin a real, attributed bright-star catalogue; compute one roughly
   21:00 IST sky orientation per India day; place genuine patterns relative to the framed
   Moon. Render sparse GPU points in the existing WebGL context. Let lunar illumination,
   angular distance from the Moon and authored sky glow progressively wash out faint
   stars. Preserve the brightest stars even at full Moon. Check new/quarter/full dates,
   daily rollover, daylight, Drawing/fallback, visual quality and integrated cost before
   reviewing this phase.
2. **Dated planets.** Add Mercury through Saturn from a pinned ephemeris, with correct
   daily relationships to Moon and stars. Render visible ones as steady points of
   suitable apparent brightness; retain the composed framing. Compare selected dates
   against an independent sky source.
3. **Moonlit sea.** Scale the Moon's reflection and near-surface light with its phase,
   taper reflection around the Moon's direction, and use only a little diffuse star
   ambient. Check black/new, quarters and full so moonless water stays readable and
   the existing day/night fade remains continuous. Avoid individual star glints.
4. **Mapped Moon.** Load a credited real lunar map only once the night Moon shows,
   shade its sphere from the same daily phase, preserve the mapped unlit hemisphere with
   faint Earthshine and leave normal page zoom intact. Keep its work off the main thread.
   Validate texture orientation, crossfade and memory disposal.
5. **Water motion review.** Preserve the owner's chosen wind-wave recipe across lunar
   phases. Confirm the coupled light reads naturally without implying that this scene
   predicts local tide height.

Each phase gets its own review point and isolated production verification. Phase 4, the
mapped Moon, is the current review target. Phone-width captures are desktop emulation, not
physical phone performance measurements.

The visibility curve is perceptual rather than an exact naked-eye limiting magnitude:
sky brightness also depends on the Moon's actual altitude, haze and artificial light,
which this composed scene does not observe. Full Moon still leaves prominent stars and
planets visible; "none" would overstate the effect. Brightness need not vary linearly
with the illuminated fraction.

[NOAA](https://www.noaa.gov/education/resource-collections/ocean-coasts/tides) says
the largest tidal range occurs near **both** new and full Moon. Tides change water
level over hours; their phase alone does not say whether the local water is high at
21:00 or set the size/choppiness of ordinary wind waves. The owner chose to keep waves
independent.

Compute a dated celestial arrangement, then rotate/frame it around the composed Moon.
Keep relative angular positions; latitude/time supply the reference orientation. The sea
horizon and enlarged Moon are authored. Some dates the real Moon is below Tikamgarh's
horizon at 21:00 (benchmark example: 12 October 2026, altitude about −29.7°), so do not call
this an exact local sky view. Align lunar phase/detail to the same daily timestamp.

## Rendering and budgets

- Phase 1 extracts 1,627 stars at visual magnitude ≤5 from
  [HYG v4.1](https://github.com/astronexus/HYG-Database/blob/main/hyg/README.md),
  whose positions and colour indices draw on established catalogues including Hipparcos.
  The 9,768-byte binary ships with [CC BY-SA 4.0 attribution](../public/stars-hyg-v41-LICENSE.txt).
  Its source CSV SHA-256 and quantization are pinned in `tools/build-star-catalog.py`.
- One sparse WebGL point/sprite pass in the existing context/loop. Do not loop over a star
  array in the full-screen fragment shader. Tiny circles, subdued brightness/colour, no DOM
  node per star or additional renderer. Mask stars behind the Moon and soften near the horizon.
- Mercury through Saturn use JPL's 1800–2050 fitted elements and Schlyter's visual-magnitude
  approximations, rendered as steady points. No giant planets/rings in the normal sky.
  Stars may twinkle weakly
  and slowly; planets stay steady ([NASA explanation](https://imagine.gsfc.nasa.gov/ask_astro/night_sky.html)).
- Compute the daily snapshot once and upload a tiny point buffer. No full ephemeris library
  is shipped and no per-frame orbit maths runs.
- Keep current 360k/1.5m pixel caps, frame governor, pause, hidden/offscreen and reduced-motion
  policy. Defer dense Milky Way textures, weather/cloud simulation, satellites and meteor showers.
- Proposed acceptance: ≤0.3 ms median added desktop GPU cost after warmup, record p95 and
  investigate frame-delivery regressions; ≤0.5 ms on a representative phone remains a target.
  No initial high-resolution downloads and no material startup/scroll regression. These
  budgets are not qualifications or guarantees; compare integrated builds and real devices.

[Astronomy Engine](https://github.com/cosinekitty/astronomy) 2.1.15 was used only as an
independent temporary test reference for three five-planet samples; it is not installed in
the visitor app. JPL's table is fitted only from 1800–2050. Solar conjunction filtering and
the authored horizon mean this scene is a composed evening sky, not an observing forecast.

Phase 2 production verification: 15 planet positions agree with Astronomy Engine within
0.15°; the actual renderer draws at most five steady point sprites in a separate night-only
pass. Day, date rollover, new/full dates and phone-width scene checks pass. A short desktop
Metal timer-query run measured a 0.166 ms median for the planet draw; p95 varied between
0.20 and 1.65 ms across short runs. The temporary development control exposes eight phases
and arbitrary dates in JPL's fit interval; production has no control or extra ephemeris asset.

Phase 3 passes the Moon's daily illuminated fraction into the hero sea shader. An authored
nonlinear curve reduces specular glints near new Moon; a soft screen column focuses them
below the composed Moon. Restrained sky/body light leaves moonless waves perceptible,
with a little diffuse ambient increasing as lunar glare falls. No star-by-star reflections
or change to wave motion. The focused production browser check finds new/quarter/full
reflection means of 17.0/19.5/37.1 luminance levels on one 1440 px frame; full-Moon
reflection is 1.76× an off-axis strip and daytime samples are identical across lunar
dates. Desktop and phone-width captures were inspected. This is perceptual lighting,
not calibrated Moon illuminance.

## Measurement evidence

Isolated Node 24 + native headless Chrome, Apple M4 Pro/ANGLE Metal. Synthetic star vectors
measure throughput only: no real catalogue or combined sea was drawn. Source SHA-256 and
full numbers: ignored tools/.out/sky-feasibility/report.json. Scratch benchmark copied beside it.

- Browser library: 116,485 bytes minified, 46,757 bytes gzip (~45.7 KiB); evaluation wall time
  about 7 ms in the desktop probe. Keep it off the initial visitor path.
- Seven-body refresh: median 0.1 ms, p95 0.2 ms. Rotation of 1,000 synthetic vectors: p95
  0.1 ms; median below the browser clock's resolution. Never report that as zero cost.
- GPU timer query, 1440×1000, clear + 1,000 three-pixel point sprites: median 0.026 ms,
  p95 0.045 ms. Clear-only median 0.0025 ms. 600 sprites: median 0.021 ms.
- Phone-sized 390×844 on the same desktop GPU: 1,000 sprites median 0.0044 ms. This is
  not a phone result. Batches of 32 passes, 12 timer samples/case; warm synthetic microbenchmark.
- No network parsing/startup profile, physical-device, battery, integrated sky/sea, atmosphere,
  actual catalogue, browser zoom gesture or visual realism qualification follows.

## Mapped Moon

The Moon uses the 2025 2K surface map from [NASA's CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/),
shaded for the same daily phase with faintly mapped unlit terrain. This is mapped imagery,
not a live telescope photograph. The footer credits NASA SVS; the asset has a separate
[credit notice](../public/moon-lroc-2k-CREDITS.txt) following
[NASA usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

Only the near side is ever drawn, so the site ships a lossless `jpegtran` crop of the 2K
map: 1024×1024 (longitudes ±90°), 215,631 bytes (~211 KiB) instead of 457,942, decoded
pixels identical to the original's middle half. It is requested at low priority only
after the night sky first shows the Moon, never in daytime. Decoding (4 MiB RGBA) and
shading happen in a worker that is terminated after each render; the page keeps only the
512×512 canvas (1 MiB), which does not raise the sea canvas's pixel budget. Browser HTTP
cache serves later days and visits.

Sizing: the disc is 0.038 × stage height, about 32–41 CSS px (70–110 device px at rest).
Mobile pinch reaches about 5×, about 480 device px on a phone, so a 512 px canvas fits.
At the disc centre one canvas pixel spans about 1.3 map pixels: the 2K source matches,
1K would soften at full zoom, and 4K/8K maps or terrain meshes would be wasted.

A zoom-triggered reveal was built first and dropped: there is no reliable cross-device
"zoomed at this object" signal, few visitors would find it, and it still swapped one Moon
for another. Now the shader's Moon crossfades once into the map. Pinch zoom then magnifies
the same disc, whose 512 px backing store holds the detail. Normal scroll and accessibility
zoom are untouched; there is no key shortcut, panel or instruction.

Production check: a daytime visit makes no request; at night the overlay's opacity equals
night × crossfade on every frame through the theme switch; four dated phases shade
correctly; geometry matches the original disc at desktop, retina, phone and 3× pinch.
Theme clicks pass through, scroll-away and context loss hide it, reduced motion swaps
without a fade, and a blocked map leaves the shader's Moon. Under 4× CPU throttling at phone
size, the map added no main-thread long task (all long tasks were in the first 0.5 s,
with or without the map). No physical iPhone/Safari, `plus-lighter` support survey or exact
lunar libration/terrain relief qualification follows.

Next: Jupiter/Saturn detail only on demand with credited source imagery. Most stars should
remain points or reveal catalogue information, not invented resolved surface photographs.
