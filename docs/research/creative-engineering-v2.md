# Sea, Ship, Math — engineering research for review set 02

Research date: 4 October 2026. **The richer edition schema, NOAA ingestion,
archive, adaptive L/S/D quality tiers, and sensor instrument below are future
proposals. They are not the current implementation contract.**
Read `../creative-roadmap.md` and `../creative-validation.md` for the actual state.
This document does not approve any experimental code for commit.

## Current working v1 contract — use this when editing the prototype

The working prototype uses `lib/sea-edition.ts`, with this smaller contract:

```ts
type SeaEdition = {
  version: '1';
  seed: string; // exactly eight hexadecimal characters, normalized lowercase
  kind: 'authored';
  waves: Array<{
    amplitude: number;
    wavelength: number;
    direction: number; // radians from +x toward +z
    phase: number;
  }>;
};
createSeaEdition(seed = '5ea5cafe'): SeaEdition;
sampleSea(edition, x, z, time): { height: number; dx: number; dz: number };
normaliseSeaSeed(input: string): string | null;
renderSeaPlate(edition): string;
```

Units are metres/seconds. Let `k=2π/wavelength`, `d=(cos(direction),
sin(direction))`, `ω=sqrt(9.81*k)`, `a=k*dot(d,[x,z])-ω*time+phase`.
The returned height is `Σ amplitude*sin(a)`, and derivatives are
`Σ amplitude*k*cos(a)*d`. CPU `sampleSea` and shader `fieldGLSL` use this same
specification. `dx`/`dz` are slopes, not unit normals.

The authored generator uses Mulberry32, base wavelengths
`[14,8,4.5,2.5,1.2,.65]`, and base amplitudes `[.55,.32,.16,.085,.04,.02]`.
The seed changes phases, bounded direction offsets and amplitude within ±10%.
Resolved coefficients are rounded to eight decimals. Version 1 must remain
stable; a model change requires a new version rather than silently changing old
shared editions. No observed weather, forecast, or third-party data is involved.

Current HTTP surfaces:

- `/api/sea-edition?seed=5ea5cafe&version=1`: deterministic authored JSON.
- `/api/sea-edition/print?seed=5ea5cafe&version=1`: deterministic SVG field plate
  sampled at `t=0` from those exact coefficients.
- Both accept an omitted seed as the default; invalid seeds, duplicate seeds
  and an unsupported version return 400. They advertise cache headers and
  seed/version ETags; a matching single `If-None-Match` returns 304.
- `/samples/observatory?seed=5ea5cafe` passes the same edition into its scene and
  links that edition's plate/data. Its server-side field illustration is in
  `components/atlas/OceanPlate.tsx`.

At the initial audit, the renderer used three draws, a fixed 200×150-segment sea
mesh, no framebuffer textures/postprocessing, six wave evaluations per vertex
and per fragment, and 0.78/1.5 megapixel mobile/desktop caps. It started at the
higher quality and could lower resolution once after sustained slow frame
delivery. **That is not the proposed tier system below.** Consult the source and
the validation log for subsequent fixes and actual performance measurements.

The following research sections describe the target architecture and later
phases. In particular, their `SeaEditionV1` type is a proposed future data
schema—not an instruction to rename the current exports or expand the active
API while another agent is building against it.

## Recommendation

Build **one ocean with two ways of seeing it**. Initially it reads as a carefully
lit, deep, physical sea. As the visitor scrolls, the same crests become measured
contours, surface normals, and a ship-construction drawing. A crest must retain
its location throughout the transformation: this continuity is the signature.
Use this ocean on A, reveal its explanation in B, and reserve a genuinely deeper
navigation instrument for C. Do not put a steering slider, calibration panel,
or toy game in the main hero.

The first effect to prove is the transformation, not the number of particles or
the sophistication of a simulation. A single scene, excellent light and type,
and a visually exact correspondence between beauty and explanation can be more
surprising than a heavier, disconnected graphics demo.

The backend should give the scene a visible identity: a cached real observation
can set the swell, wind texture, and direction of an edition of the sea. Its
printed field plate, shared link, and animated scene use the same immutable
parameters. That is a useful reason to have a backend. A live visitor counter,
invented telemetry, or an LLM generating arbitrary nautical copy adds little.

## What the primary sources establish

These references were read as technical/design research. They have not been
profiled on this project's reference phone, and their budgets cannot be borrowed.

| Primary reference | Useful mechanism | What we should take |
| --- | --- | --- |
| [Evan Wallace: WebGL Water](https://www.madebyevan.com/webgl-water/) and [source](https://github.com/evanw/webgl-water) | Coupled surface, reflections, refraction, and caustics make an interaction feel materially consequential. | Causal coherence: a disturbance should affect the light and the object sitting on it. Do not reproduce its entire multipass pool renderer for a hero. |
| [Mark Finch / NVIDIA: Effective Water Simulation from Physical Models](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models) | Low-frequency geometry and finer normal detail solve different visual problems; Gerstner displacement sharpens crests. | Spend vertices on silhouette and shading on detail; share wave parameters across views. The recommended architecture below is our own scope/budget proposal. |
| [NVIDIA: Rendering Water Caustics](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-2-rendering-water-caustics) | Concentrated refracted light can be reasoned about geometrically. | A later underwater reveal can use surface-derived light, rather than a disconnected looping caustic video. Not required in the first proof. |
| [NDBC measurement definitions](https://www.ndbc.noaa.gov/faq/measdes.shtml) | Observed height, period, direction, and spectral data have explicit units and meanings. | Keep raw observations distinct from the art-directed wave model. A summary observation cannot reconstruct the exact sea at the buoy. |
| [GPUWeb implementation status](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status) | Actual support varies by browser, OS, and GPU. | WebGPU is a possible optional lab capability, not the sole route to the main site's visual identity. |

Do not copy original code or assets without checking that repository's license.
The effects and mathematical relationships are inspiration; implementation and
art direction should be specific to this site's integral-mast ship.

## Browser choice, verified on the research date

The GPUWeb maintainers' status page was updated 2 October 2026. It reports Safari
26 support on Apple platforms; Chromium support on its main desktop platforms,
selected Android hardware/OS combinations, and some Linux combinations; Firefox
support on Windows and Apple Silicon macOS, with other cases still qualified.
This is substantially better than the old blanket statement “Safari has no
WebGPU,” but it is still not universal. Check the [current table](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status)
when implementing rather than copying an old browser matrix.

`navigator.gpu` requires a secure context and an adapter request can return
`null`. A GPU device may also be lost. Feature detection, request success, and
recovery remain necessary even in a supported browser. These are specified by
[GPUWeb](https://gpuweb.github.io/gpuweb/).

**First renderer: WebGL2**, no mandatory Three.js, React Three Fiber, animation
framework, physics engine, float render targets, or compute API. This is a
deliberately small rendering problem: one ocean mesh, one ship mark/mesh, one
analytic material, one camera. A small library can be justified later by a
measured maintenance benefit; raw WebGL is not itself a virtue.

**Do not implement both WebGL and WebGPU renderers initially.** It doubles
shader validation and device-loss maintenance without establishing that the
visual is better. C may later justify WebGPU for an actual compute-dependent
effect. No user should need a browser flag.

## The visible sequence

1. **Arrival:** server-rendered typography and a beautiful static plate are
   immediately visible. The sea occupies a composed area, not an arbitrary
   fullscreen dark shader background. The integral-mast ship is readable at a
   glance. The first usable frame blends in without moving any content.
2. **Surface:** a restrained light streak travels through swell. Ship heave and
   attitude agree with the water under its hull. Pointer movement slightly
   changes the viewing/light angle; there is no “move your mouse” instruction.
3. **Revelation through ordinary scrolling:** the sea's color drains into ink;
   contours and the generating grid become visible on those exact waves; the
   ship resolves into measured construction geometry. Keep native scrolling.
4. **Notebook:** a strong new composition—issue masthead, oversized numbered
   plates, offset diagrams, margin findings—uses the frozen mathematical plate
   as its visual grammar. Reading needs no animation. A chosen article can
   unfold the same model, so the transition feels like an answer to the hero.
5. **Optional depth:** a small, labelled instrument opens the deeper view.
   Only here should the visitor be asked to enable tilt or manipulate a model.
   The reward must be an unmistakable change in perspective/material, not a
   boat moving a few pixels.

Desktop can add a local “inspection lens” that reveals the analytic drawing
inside a soft aperture. It samples the exact same frame/geometry; do not render
a second disconnected scene. Touch can toggle that lens with one tap and move
it without intercepting vertical page scrolling. This is optional after the
scroll reveal itself succeeds.

### Effects considered and ranked

| Effect | Visual return | Cost/complexity | Decision |
| --- | --- | --- | --- |
| Surface → measured drawing, preserving each crest | Signature relationship between Sea and Math | Medium; a shared material and camera, no new simulation | Prove first |
| Surface-derived ship pose and light/reflection | Makes the scene feel physically connected | Low/medium with analytic derivatives | Required for credibility |
| Optical typography: a reflected/deformed echo of a large title in the water | Strong composition if restrained | Medium; one prebuilt title mask/atlas, extra sampling | Second proof; real HTML title stays intact |
| Touch/tilt reveals depth behind the measured plate | A phone becomes a viewing instrument | Medium; permission/fallback work, modest camera movement | Optional, after visual proof |
| Real-observation sea editions with reproducible printed plates | Gives visits and sharing a meaningful identity | Low client cost; modest ingestion/storage work | Backend phase after visual selection |
| FFT spectrum plus nonlinear breaking/foam | Excellent ocean fidelity if expertly art directed | Higher validation, memory, and shader complexity | Isolated future lab, not first hero |
| Fluid typography or thousands of particles everywhere | Familiar creative-tech spectacle | Can obscure reading and burn fill rate | Not the site's organizing idea |
| Multiplayer fleet, public drawings, or visitor trails | Only useful with a real social concept | Persistent state, abuse handling, live connections | Defer; presently unjustified |

## One renderer, explicit quality tiers

All numbers in this section are **proposed ceilings**, not measurements.
The existing validation log contains the only measured payload baseline.

| Tier | Entry condition | Geometry/detail | Output and workload |
| --- | --- | --- | --- |
| P: printed plate | No JS; reduced motion default; context creation/compile failure; user chose still | Server SVG or optimized raster + semantic HTML | No animation loop. Blueprint and content remain complete. Finite view changes can use static states. |
| L: lean motion | Default when WebGL2 succeeds | 64×48 segments, four geometric waves, two fine normal waves, one material pass | Max 0.55 megapixel drawing buffer; target 30 fps; no scene texture/postprocessing. |
| S: standard motion | L is stable in visible foreground samples and user has not asked for reduced motion | 96×64 segments, six geometric waves, four fine normal waves | Max 1.1 megapixels; target 60 fps; same single material pass. |
| D: optional instrument | Explicitly opened separate route/panel | Start with S; additional passes only with their own budget | Separately loaded; max 1.6 megapixels; never background-load from a normal visit. |

Choose wave count through shader variants compiled once, not an unbounded
dynamic loop. Start at L on every device rather than parsing the user agent or
collecting GPU identifiers. A high-end phone can qualify for S; an overloaded
desktop can remain at L. Prefer stability over rapid oscillation between tiers.

Resolution is `scale = min(dprCap, sqrt(pixelCap/(cssWidth*cssHeight)))`, then
`width = max(1, floor(cssWidth*scale))`, similarly for height. Clamp `scale` to
a tested lower bound only if that lower bound still respects the pixel cap.
Recompute on resize, not per frame. Avoid full native DPR: modern phones often
have DPR greater than two. The [MDN WebGL guidance](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
also explains the cost of large buffers and mobile tiled rendering.

Initial adaptive policy to validate: evaluate 120 foreground frames; downgrade
after three bad windows, with a five-second cooldown; require ten stable seconds
before one upgrade. A “bad window” is >20% delivered frames taking more than
1.5× the target interval, excluding visibility/resize interruptions. Frame
delivery is an experience signal, not a GPU timing measurement. If available,
nonblocking timer queries can inform profiling; never wait synchronously for
GPU results. Use a single active rAF controller, no per-frame React state.

Run only while visible, intersecting the viewport, and motion-enabled. Resume
from the last scene time rather than jumping ahead by hidden wall-clock time.
Unsubscribe orientation sensors at the same boundary. Delete buffers, programs,
textures, observers, and listeners on disposal.

### Failure policy

- The printed plate remains underneath until the first valid rendered frame.
  Never hide it merely because `getContext()` returned an object.
- On shader compile/link failure, log diagnostics in development and keep P.
  User-facing copy and navigation do not mention shader implementation details.
- On `webglcontextlost`, stop work and expose P; on restoration, recreate the
  renderer once from immutable scene inputs. Old resources are invalid after
  restoration, as the [WebGL specification](https://registry.khronos.org/webgl/specs/latest/1.0/)
  explains. Repeated loss keeps P until a fresh route visit or explicit retry.
- Prefer P over a CPU animation with poor frame pacing. Canvas2D animation is
  not a mandatory third renderer to maintain.
- Denied/missing sensor data leaves the same experience reachable by scroll,
  tap and keyboard. No content is locked behind hardware.

### Acceptance budgets

| Surface | Proposed budget/gate |
| --- | --- |
| Main route enhancement | Added JS ≤35 KB gzip, CSS ≤8 KB gzip over the recorded original homepage; no new font. This deliberately revises the earlier 15 KB target to buy a materially better result. Parent roadmap must approve/record the revision before adoption. |
| Above-fold fallback | Optimized plate ≤80 KB transferred, preferably SVG if its visual quality and size are suitable; width/height reserved. |
| Active renderer | Main-thread animation work p95 ≤2 ms/frame on reference phone; GPU rendering p95 ≤8 ms/frame when measurable; ≥95% frames within target cadence during a 30-second interaction. |
| Inactive scene | No scheduled rAF, no active device-orientation subscription, no continued GL draws. |
| Optional D | Separate initial code ≤100 KB gzip as a starting ceiling, asset budgets measured separately; no D chunk/request on ordinary homepage visits. |
| Content metrics | Compare field p75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1; lab tests are regression evidence, not field claims. |

If the effect misses budgets, reduce buffer pixels and fine normal waves before
degrading typography, geometry continuity, or ship-water agreement. If it still
fails, keep a beautiful plate and rebuild the renderer; do not ship a jittering
“premium” mode. Capture both cold and warm loads because shader compilation and
first interaction can dominate the experience.

## Shared math contract

The first model is an analytic directional height field. It is intentionally
smaller and easier to verify than FFT water. Rendering, ship placement, contour
art, diagrams, and poster generation **must call the same specification**.
This is an art-directed surface with physically meaningful parameters, not a
forecast or a reconstruction of every real wave.

### Coordinates, time, and wave parameters

World coordinates: `x=east`, `z=north`, `y=up`, metres. Angles are radians inside
the renderer. `t` is scene seconds from its own zero; it does not equal UTC.
The source observation UTC timestamp is provenance and seed input only.

```ts
type Wave = {
  amplitudeM: number;         // A >= 0
  wavelengthM: number;        // L > 0
  directionX: number;         // unit propagation vector
  directionZ: number;
  phaseRad: number;           // [0, 2π)
};
type SurfaceSample = {
  heightM: number;
  derivativeX: number;        // dh/dx
  derivativeZ: number;        // dh/dz
  normal: [number, number, number];
};
```

For each wave `i`, let `k_i=2π/L_i`, `ω_i=sqrt(g*k_i)` with `g=9.81`, and
`θ_i=k_i*(d_ix*x+d_iz*z)-ω_i*t+φ_i`. Then:

```text
h(x,z,t) = Σ A_i sin θ_i
hx = Σ A_i k_i d_ix cos θ_i
hz = Σ A_i k_i d_iz cos θ_i
n = normalize((-hx, 1, -hz))
```

Use CPU double precision as the reference implementation and GLSL highp for
geometry. Geometry waves determine actual position and ship attitude. Fine
normal-only waves influence highlights only; do not make the ship chase them.
Match shader and CPU using a small fixed array uploaded when the edition changes.
Keep scene time bounded/rebased before precision loss becomes visible.

Unit tests: analytic derivatives versus central differences; unit normal and
finite output over seed/parameter extrema; deterministic arrays for fixed
edition; no discontinuity when a scene resumes. A shader parity check can render
encoded sampled outputs to a tiny test framebuffer outside the animation loop.

### Ship pose

Sample bow, stern, port, and starboard offsets on the geometric field rather
than using an unrelated bobbing animation. Their mean supplies heave; bow-stern
and port-starboard differences supply pitch/roll. For a very small icon, the
single-point analytic normal is an acceptable first implementation. Clamp
visual attitude for legibility but record that art-direction clamp.

For an exact tangent pose, take desired horizontal forward `f0`, project it onto
the tangent plane `f=normalize(f0-n*dot(f0,n))`, and compute right
`r=normalize(cross(n,f))`. The model basis columns are `(r,n,f)`. Keep the keel's
local pivot consistent with the mesh/mark geometry. Add wake geometry only after
pose and reveal match visibly.

### Optional Gerstner upgrade

If sharper crests are visually necessary, use a parametric surface, not a
shading trick that breaks ship agreement. For material coordinate `q=(x,z)`:

```text
P.x = x + Σ Q_i A_i d_ix cos θ_i
P.y =     Σ     A_i      sin θ_i
P.z = z + Σ Q_i A_i d_iz cos θ_i
```

Keep `Σ Q_i A_i k_i ≤ 0.65` as our conservative proposal to avoid folding in this
art direction. Derive both tangents analytically and use
`normalize(cross(∂P/∂z, ∂P/∂x))`. A boat attached to material coordinate `q` uses
`P(q)` and that normal. A boat commanded to a fixed world x/z needs an inverse
solve for q; do not simply feed displaced world coordinates into the old height
function. The [GPU Gems model](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models)
is the reference for displacement and steepness; the numerical margin above is
a project choice to validate, not a theorem or source recommendation.

### Blueprint continuity

Use one displaced mesh and one view/projection transform. Shade it twice inside
the same material calculation and blend with `reveal` in [0,1]:

```text
surfaceColor = artDirectedSea(normal, view, light, height)
drawingColor = paper + gridLines(materialXZ) + contours(height) + slopeAccents
color = mix(surfaceColor, drawingColor, smoothstep(0,1,reveal))
```

Use derivative-based antialiasing (`fwidth`) for grid/contour lines, and cap line
density in distant geometry to prevent shimmer. Any separate labels/normals are
projected from the same matrix. Large type remains real HTML; a distorted echo
may be a separately authored mask but must not replace accessible text.

Normal scroll supplies `reveal`. Reserve a short scene track, approximately
1.4–1.8 viewport heights for the complete narrative, then release to ordinary
content. This is an initial design constraint, not a reason to enforce a pinned
section if mobile review finds it laborious. Reduced motion displays the two
states as finite plates; no camera animation is necessary to understand them.

### Input that earns its existence

Pointer parallax should be restrained and discoverable through the response,
not through instructions. Do not add spring-driven motion to every UI element.
If water touch is included, create a localized wave packet that affects surface
normals and the ship; cap it at two active packets. This needs a new derivative
contract and bounded lifetime before implementation, not arbitrary SVG circles.

Mobile orientation uses relative `DeviceOrientationEvent`, not raw acceleration
integrated into a guessed position. A physical peephole/parallax effect is a
better match than steering a logo. Permission must be requested from a direct
activation and in a secure context on browsers requiring it, per
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static).
Calibrate first valid orientation, account for screen rotation, use a dead zone,
clamp view displacement, recenter, and unsubscribe when inactive. Do not put the
permission prompt in the initial visit. Prototype exact angle conventions on
physical portrait and landscape iOS/Android before calling this accepted.

## A backend whose output is visible

### Phase 0: deterministic authored editions, no upstream dependency

Prove the look using two or three explicit authored seas: long Atlantic swell,
crossed wind sea, glassy harbour. Label them “study,” not “live.” Implement an
edition schema and pure parameter generator first. A screenshot or SVG poster
at `t=0` must agree with the animated scene's initial geometry.

```ts
type SeaEditionV1 = {
  schemaVersion: 1;
  modelVersion: 'heightfield-1';
  id: string;                 // content hash of canonical immutable payload
  seed: number;               // unsigned 32-bit seed
  kind: 'authored' | 'observation-inspired';
  palette: 'ink' | 'dawn';
  waves: Wave[];              // final resolved parameters, not just a seed
  visualScale: number;        // explicit art-direction scaling
  source: null | {
    provider: 'NOAA NDBC';
    stationId: string;
    stationName: string;
    latitude: number;
    longitude: number;
    observedAt: string;       // ISO UTC from actual observation row
    retrievedAt: string;      // ISO UTC from ingestion
    sourceUrl: string;
    waveHeightM: number | null;
    dominantPeriodS: number | null;
    waveFromDegTrue: number | null;
    windSpeedMps: number | null;
    windFromDegTrue: number | null;
    imputedFields: string[];
  };
};
```

Store the resolved waves as well as a seed, so improving the PRNG or synthesis
algorithm later does not mutate old shared editions. Canonical JSON uses stable
key order and documented fixed decimal precision. Hash all visual/provenance
inputs except `retrievedAt`, which is operational metadata and can otherwise
create duplicate editions from identical observations. Never use `Math.random()`
on either side of hydration for a shared scene.

### Phase 1: observations, cached once for everyone

NDBC station 41002 is an example candidate: its [station record](https://www.ndbc.noaa.gov/station_realtime.php?station=41002)
identifies it as NDBC-owned and distinguishes its real-time data from subsequent
quality-controlled archives. Do not label this as the user's local sea. Choose
the final station for its story and reliable reported fields, not merely because
it was the first API found. Station locations/payloads can change.

Use server-side HTTP retrieval of the station's standard meteorological `.txt`
file. Do not fetch its 45-day feed into every visitor's browser. NDBC asks users
to minimize retrievals and notes that most stations report hourly; this is not
a promise that every station or field has the same cadence. No numeric public
request quota was established in this research. Our proposal is **one shared
fetch per hour per selected station**, with bounded backoff on failure, after
checking that station's actual cadence. [NDBC retrieval guidance](https://www.ndbc.noaa.gov/faq/rt_data_access.shtml)

The renderer is observation-inspired. A forecast endpoint is a different data
product and must say “forecast,” including its valid time and model/source. Do
not quietly substitute a commercial marine forecast and retain a buoy label.
Keep spectral reconstruction for a later phase: separate directional spectral
files can be much larger and have additional interpretation requirements.

NWS information is generally reusable unless marked otherwise, subject to its
conditions about attribution, endorsement, and altered material. Preserve the
provider/source link and describe the output as an independent visualization;
do not apply a NOAA/NWS logo to imply partnership. Check the actual selected
station's ownership and third-party metadata rather than assuming everything
hosted by NOAA is NOAA-authored. [NWS use statement](https://www.weather.gov/disclaimer)

### Parser and freshness rules

1. Allowlist station identifiers and upstream URL templates server-side. An
   arbitrary URL or station from a query string must never become an upstream
   request.
2. Parse column names from the header rather than fixed character offsets. Skip
   comment/unit rows. Reject impossible dates and nonfinite values. Treat `MM`
   and each documented missing-data sentinel as null, never zero.
3. Select the newest row containing the required wave-height/period pair. Keep
   optional direction/wind null if missing; do not borrow a newer timestamp
   from another row without recording the field's own observation time.
4. Preserve raw values. Normalization and aesthetic caps belong in a separate
   pure synthesis function. Tests cover malformed rows, partial columns, stale
   rows, direction wrap, missing values, and upstream failure.
5. `observedAt` determines freshness. Proposed UI classification: ≤3 h “Observed
   [time]”; >3 h “Last observation [time]”; >24 h default to an authored study and
   retain the last edition in the archive. These thresholds are product choices
   to validate with the final station, not provider guarantees.
6. Ingestion failure keeps the last valid immutable edition and its true date;
   never stamp old data with the current time. The hero renders a local fallback
   if there has never been a valid edition. Upstream availability cannot block
   the title, navigation, or primary content.

### Deterministic synthesis from summary observations

This is a proposed art model, not scientific reconstruction. Use it only after
the authored edition is attractive and stable.

- Use `T = clamp(dominantPeriodS ?? 9, 4, 18)` and deep-water wavelength
  `L0 = g*T²/(2π)`. Keep the raw period in provenance, including whether it was
  substituted. Direction of travel is `(waveFromDegTrue + 180) mod 360`;
  with our coordinates, `d=(sin(angle), cos(angle))`.
- Use six components with wavelength ratios `[1, .73, .51, .31, .18, .10]` and
  positive initial weights `[1, .56, .31, .18, .10, .06]`. Seed their phases and
  bounded directional offsets. These ratios/weights are design choices.
- For a target wave variance `m0=(Hs/4)²`, scale weights so
  `Σ A_i²/2 = m0`. This gives a useful energy correspondence for the illustrative
  model; the finite deterministic realization does not have to exhibit an exact
  measured significant wave height over every visible patch.
- Cap the visual `Hs` independently of the raw measurement, e.g. 0.3–4 m, and
  record the scaling factor. Storm measurements should not destroy reading.
  Wind may set small-wave roughness and highlight breakup within bounded limits.
- Use a specified unsigned 32-bit PRNG such as a fixed xorshift32 sequence with
  a nonzero seed, and publish test vectors. Persist the resolved result. Phase
  seed can be derived from a content hash of station, observed timestamp, model
  version and source values. Palette must not claim local daylight unless a
  real location/time-to-light calculation is deliberately implemented.

Before adopting the variance correspondence, independently verify the chosen
definition of `Hs` and normalization against the selected source. Do not merge
NDBC's published statistics, visual clamps, and model parameters under one
unqualified UI number.

### Phase 2: edition archive and shareable field plates

Suggested endpoints and responsibilities:

| Contract | Responsibility |
| --- | --- |
| `GET /api/sea/current` | Small validated summary + current immutable edition ID; cached shared response, optional ETag; no upstream fetch per visitor. |
| `GET /sea/[editionId]` | Server-rendered explanation, provenance, scene, and accessible static plate. Invalid IDs 404. |
| `GET /sea/[editionId]/plate.svg` | Deterministic poster made from stored parameters and fixed time/camera; long-lived immutable cache. |
| `GET /sea/[editionId]/opengraph-image` | Optional pre-generated raster share image. This should reuse the same sampled surface, not an unrelated AI illustration. |

Start with build-generated editions/assets in the repo. A durable KV/object
store becomes necessary only when live ingestion creates new immutable editions
outside builds. Process-local maps are not durable storage and are not shared
across server instances. Deployment and paid infrastructure need separate scope;
this research does not select a provider or authorize deployment.

Use a scheduled ingestion job if available in the eventual hosting environment:
fetch → validate → synthesize → persist immutable edition → atomically advance
the current pointer. A failed step cannot replace a good pointer. Limit edition
creation to scheduled inputs; public requests cannot trigger arbitrary rendering
or storage growth. Deduplicate by content hash. Serialize or lease ingestion so
multiple instances do not amplify upstream requests.

An SVG field plate can be CPU-generated from the same analytic surface and
projection: sample rows into polylines, use a constrained color palette, place
the existing ship geometry, add issue identifier and provenance. Pre-generate
it at ingestion/build time. No headless Chromium or GPU is required merely to
make an attractive share artifact. Raster output can be a later cached export.

### Next.js constraints from this installed version

Read on 4 October 2026: installed Next 16.2.9 `fetch.md`, route-handler guide,
and lazy-loading guide. The current `next.config.ts` does not enable Cache
Components.

- Route Handlers are not cached by default. Decide route response caching and
  upstream data caching explicitly; do not assume a GET handler is static.
- The current server `fetch` API supports `next: { revalidate: seconds }`; do
  not combine a positive revalidation interval with `cache: 'no-store'`.
  That cache helps reuse, but it is not an immutable edition archive.
- Do not make every prerendered route depend on a successful third-party
  request during builds. Supply a bundled edition/fallback and keep ingestion
  out of the page's critical rendering path.
- Lazy-load the renderer through a small Client Component boundary. A dynamic
  import of a Client Component from a Server Component does not currently
  supply automatic client code splitting in the way one might assume.
- Keep article text, sample notices, metadata, navigation, and fallback plates
  server-rendered. Inspect actual production chunks and network requests to
  verify that optional depth is genuinely absent before activation.

## Implementation sequence and objective gates

1. **Art-direction proof:** one static sea plate, one matching blueprint plate,
   one clearly different notebook index. View at 390 and 1440 widths. Reject if
   the silhouette/type/composition is not impressive before motion.
2. **Math core:** implement `Wave`, deterministic authored editions, sample
   function/derivatives, ship pose and tests. No backend fetch, permissions, or
   game yet. This is infrastructure for the chosen effect, not the deliverable.
3. **One WebGL2 scene:** match the plate, then implement same-mesh surface/drawing
   material. Capture a video of the reveal. Gate: no crease jump, disconnected
   ship movement, alias shimmer, unreadable mobile title, or scroll interception.
4. **Quality/fallback proof:** forced context failure, disabled JS, reduced
   motion, hidden/offscreen suspension, physical midrange Android/iPhone,
   cold/warm loading, 30-second traces and production assets. Record actual
   devices/browser versions and measurements.
5. **Notebook narrative:** server-first reading layout; one article explains
   that exact sea. Embed the renderer only where it adds explanatory value.
   The blog's static design must stand alone without moving diagrams.
6. **Optional sensor instrument:** add only if step 3 passes; test explicit
   permission grant/denial, screen rotation, background return and missing data.
   Its reward is seeing into the model, with equivalent tap/keyboard controls.
7. **Backend phase 0 → 1:** first stable authored editions, then one vetted
   observation source with parser fixtures, freshness/attribution, shared cache,
   failure behavior, and no external dependency on the critical path.
8. **Archive/printed plate:** add deterministic links/posters only after the
   edition contract is stable. Test identical ID → identical geometry/artifact,
   model upgrades preserve prior editions, and upstream outages preserve truth.

Each step ends with updated roadmap/validation evidence. Experimental work
remains under `/samples/...` and uncommitted until user review. Passing lint or
a production build does not establish that the visual transformation succeeds.

## Research limitations and handoff warnings

- The public NDBC station page and data documentation were retrieved. Direct
  `.spec`/realtime text retrieval through the research browser returned an
  internal fetch error; no production ingestion or parser was exercised here.
  A later implementation must use a fixture from an actual successfully fetched
  raw file and preserve its retrieval date.
- WebGPU support was checked against the maintainers' current matrix; none of
  the referenced demos was performance-profiled in this task.
- Browser/physical-device visual testing is still a prerequisite. The old
  implementation's asset counts and geometry checks cannot validate a new GL
  renderer or a visually redesigned notebook.
- The proposed frontend ceilings revise the earlier SVG-only budget. This is
  an explicit design tradeoff that needs to be recorded in the parent plan,
  followed by actual measurement. It must not be presented as a measured cost.
- If time/context runs low, finish a coherent static proof plus this contract
  before adding a half-implemented GPU or “live” badge. A smaller complete proof
  gives the next model something precise to preserve and improve.
