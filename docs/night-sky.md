# Night sky — implementation brief

Research and phased build, 12 October 2026. Stars are committed as 12a73f3; the planet
phase is built and verified. Transition committed as d21757f; planet work is uncommitted.

## Direction

Owner: day-wise accuracy, not hourly/minute-wise; keep the Moon framed and compose the
sky around it, with modest shifts allowed. Use roughly 21:00 IST for the daily snapshot.
The fixed observer is Tikamgarh (approximately 24.75° N, 78.83° E), at about 21:00 IST;
no visitor location, permission prompt or weather. City coordinates/daily time are not a
local visibility forecast. A public town-junction coordinate is documented by the
[government forestry portal](https://forestsclearance.nic.in/timeline.aspx?pid=FP%2FMP%2FROAD%2F34322%2F2018).

The owner has now asked to build in reviewable phases, with the darkest and most populated
star field near new Moon, progressively less visible at full Moon, phase-aware sea light,
and an actual mapped lunar surface in the optional detail view. Native zoom toward the
Moon should quietly reveal the extra detail, without an explicit telescope prompt.
The fixed Moon and authored horizon remain the agreed framing.

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
4. **Lunar detail.** Load a credited real lunar map only on demand, shade its sphere
   from the same daily phase, preserve the mapped unlit hemisphere with faint
   Earthshine and leave normal page zoom intact. Provide a keyboard-accessible way
   into and out of the detail. Validate texture orientation and memory disposal.
5. **Water motion review.** Preserve the owner's chosen wind-wave recipe across lunar
   phases. Confirm the coupled light reads naturally without implying that this scene
   predicts local tide height.

Each phase gets its own review point, isolated production verification and measured
desktop/phone rendering where available. Phase 2 planets are the current review target.

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

## Zoom Easter egg

Moon first. Use a real surface map from [NASA's CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/),
shade it for the same daily phase and retain the unlit face. This is mapped imagery, not a
live telescope photograph. Include source credit and retain per-asset third-party notices
([NASA usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)).

The current 2K JPEG is 2048×1024 and measured 457,942 bytes (~447 KiB). Decoded RGBA takes
8 MiB, ~10.7 MiB with a full mip chain. A small separate detail surface (e.g. capped at
512×512) can become sharp without raising the entire sea canvas's pixel budget. Lazy-load
only after a targeted zoom/detail trigger, cache while needed and release optional resources.
Full 4K/8K scientific TIFFs and detailed terrain meshes are unnecessary for this effect.

Do not take over normal page scroll or accessibility zoom. The surprise is a targeted
detail upgrade as the visitor zooms toward the Moon, without a visible instruction.
Native pinch exposes
[VisualViewport.scale](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport/scale);
desktop page zoom changes [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio),
which also changes across monitors. There is no single reliable cross-device “user zoomed
this object” signal. Observe targeted native zoom for an in-place detail upgrade where
reliable. Keyboard/browser zoom must be considered in the prototype; do not add a visible
telescope button unless native zoom proves insufficient and the owner revisits the design.
Avoid double-click (conflicts with the new reversible theme click) and a page-wide pinch trap.

Next: Jupiter/Saturn detail only on demand with credited source imagery. Most stars should
remain points or reveal catalogue information, not invented resolved surface photographs.
Gesture, loading/failure, resource disposal and keyboard escape/focus need a dedicated prototype.
