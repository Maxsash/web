# The Maxsash Studio mark

An integral sign rigged as the mast of a sailboat: mathematics and the sea, the
two things the studio is named around. The integral's stem is the mast and
forestay, its lower hook the stern, with a sail hung off the stem and a hull
beneath. The integral, sail, hull and two ball terminals remain the same mark.

The mark is **generated**, not drawn. [`tools/build-logo.mjs`](../tools/build-logo.mjs)
computes `components/Mark.tsx`, `app/icon.svg` and `public/mark.svg`. These outputs
are committed; a normal site build does not run the generator. Edit the dials
and construction, never the generated paths.

## The four relationships, now enforced on the outlines

1. **One integral, with 180° rotational symmetry.** `spineAt(s)` negates the
   opposite half-spine. `penAt(s)` depends on `|s|`. The emitted back outline is
   a rotation of the fitted front outline's control points, so fitting cannot
   introduce different terminals. The original's larger lower hook is not
   restored.
2. **One mast channel, shared by sail and hull.** The integral is swept by a
   round pen whose radius changes along the spine. `penEdge(s, side, grow)`
   computes its envelope, including the tangential displacement required by
   the changing radius. `luffAt(s)` uses the same pen grown by `GAP`; the sail's
   luff and hull's stern therefore follow one normal offset of the mast's ink.
   Fillets trim their ends, and the branch opening is separately bounded.
3. **The sail foot follows the deck at one constant normal distance.** These
   were straight parallel edges. At the owner's request, they now have a very
   gentle curve: `deckArc` and `footArc` are concentric circles with radii
   differing by exactly `GAP`. They are sampled and fitted with the same error
   bound. The keel has a shallow belly; the bow is barely curved too. Their
   sags are capped, so this cannot quietly become a different hull.
4. **The leech has no inflection.** All three pairwise cross products of its
   cubic control legs must have the same nonzero sign. Those are the terms of
   its curvature numerator, so this is a sufficient fairness condition; the
   head and clew handles cannot be tuned into an S.

The circular terminals are the swept pen's last discs. Their contacts follow
`c + r(-r'/|c'| T ± sqrt(1-(r'/|c'|)²) N)`, not `c ± rN`. Exact circular
endpoint tangents are supplied to the fitter. The pen swells into its terminal
instead of ending in a flat cap underneath a separately unioned circle.

[`tools/outline.mjs`](../tools/outline.mjs) constructs real inward circular
fillets, one radius per corner. It intersects the offset edges, trims at the
contacts and emits circular SVG arcs. It checks circle fit, source sampling,
forward tangents and the **serialized** joins, including decimal rounding.
Three filled paths are the entire mark; there is no outlining stroke.

## The dials

All live near the top of the generator. Integral dimensions are absolute units;
boat dimensions use the integral's own height. Corner radii use `STROKE_MAX`.

| Group | Dials |
| --- | --- |
| Pen | `STROKE_MAX` 73, `SHOULDER_F` 0.80, `WAIST_F` 0.66, `WAIST_AT` 0.52, `BALL_F` 1.10, `BALL_SWELL` 1.25 |
| Stem | `STEM_ANGLE_MID` 9°, `STEM_ANGLE_TOP` 18°, `SHOULDER` [76, 320] |
| Hook | `HOOK_R0` 68, `HOOK_R1` 60, `HOOK_SWEEP` 168° |
| Channel | `GAP_F` 0.035, paired tack/stern radius 0.04 × stroke |
| Hull | `DECK_ANGLE` 11°, `DECK_LEFT_YF` 0.808, `DECK_LEN_F` 0.650, `KEEL_YF` 0.960, `BOW_RAKE` 36° |
| Gentle curves | `DECK_SAG_F` 0.010, `KEEL_SAG_F` 0.008, `BOW_SAG_F` 0.003 |
| Sail | `SAIL_HEAD_YF` 0.212, `SAIL_FOOT_LEN_F` 0.452, leech angles 68°/12°, pulls 0.45/0.32 |
| Other fillets | head/clew 0.16 × stroke, bow 0.09, forefoot/keel-aft 0.20 |
| Safeguards | head daylight ≥ 1 gap, head distance ≥ 1.15 gaps, hook bay ≥ 1 gap, fork expansion ≤ 1.25 × its unfilleted opening, curve-fit bound 0.20 units |
| Framing | mark padding 0.04; browser tile inset 0.10; Apple tile inset 0.235 |

The hook remains a spiral, with radius `R0 → R1` as `u²`, making its start
join tangent to the stem. The pen eases from full stem to shoulder and hook
waist, then a Hermite profile swells into the ball. The waist opens the counter;
it is not a smaller terminal used to disguise a notch.

## Refinement decisions

The first two defects were treated together. The hook has a more open turn and
a lighter waist, and the sail's blunted head sits **below the entire upper
hook**, with daylight between them. Merely checking the nearest mast distance
was insufficient: that nearest point could be the stem beside the head while
the head still occupied the counter. Both checks now apply. Lowering the head
initially narrowed the upper sail too much; the silhouette scan caught that,
and a fuller, still convex leech restored the body of the sail.

The three-way junction cannot have the same width in every direction: a channel
has to open where it branches. The construction now controls that opening.
Tack and stern share a small radius, and the distance between their contact
points along the common rail may grow by at most 25% over the unfilleted
junction. The current increase is **21.2%**. The rail is oblique to the deck,
so this along-rail measure is distinct from the normal channel width.

The inherited weight targets were reconsidered against **rendered ink**. The
9°/18° lean still provides the mathematical stem and forward motion, so it stays.
The opened hook and pen profile earn their changes through a clearer counter
and tangent ball joins. At midheight, actual stem weight is now almost the same
as the original. The boat's small curves answer the owner's request for a less
ruler-straight hull while preserving its endpoint layout and restrained lean.

Additional defects surfaced:

- **The shared Bézier fitter reversed the final handle.** It solved an incoming
  tangent and then negated it again when emitting `c2`, producing little
  reversals and protrusions. [`tools/geom.mjs`](../tools/geom.mjs) now preserves
  forward tangents, rejects backtracking, checks G1 joins, and bounds the entire
  fitted curve against its source polyline using difference control points.
  The wave paths use this helper too and were regenerated with the correction.
- **Preview and production did not paint the same ink.** The old preview and
  standalone mark applied the sail/hull rounding stroke to the integral too.
  That inflated the displayed mast beyond the old calibration numbers. Preview,
  React component, SVG tiles and cover now consume the same three-path body.
- **The leech check was incomplete.** Two neighbouring control-leg turns can
  agree while the curve still inflects. The outer pair is now checked too, so
  every term of the curvature numerator has the same sign.

## Calibration and evidence

[`mark-original.svg`](mark-original.svg) is the pre-refinement reference.
[`tools/scan.py`](../tools/scan.py) scans rendered ink at 23 heights, normalized
by ink height and measured from the mast's centre at half-height. Both marks
are rendered by Chrome at 900 × 900, black on white. These reproducible rendered
values supersede the old record's 0.957 aspect and nominal 0.093 stem weight.

| Rendered measure | Original | Previous committed output | Refined |
| --- | ---: | ---: | ---: |
| Aspect W/H | 0.962 | 0.919 | 0.949 |
| Midheight mast span / height | 0.092 | 0.114 | 0.094 |
| Midheight horizontal channel / height | 0.036 | 0.022 | 0.036 |
| Leech right edge at 30% height, relative to mast centre | +0.311 | +0.273 | +0.281 |
| Leech right edge at 40% height | +0.388 | +0.347 | +0.367 |
| Leech right edge at 50% height | +0.424 | +0.404 | +0.416 |
| Leech right edge at 60% height | +0.451 | +0.442 | +0.448 |

The differences are concentrated in the intentionally opened hooks, separated
head and deck/foot junction. At 25% height the sail's right edge is +0.210
versus the original's +0.246; matching that spike exactly would undo the head
clearance. From 40–66% the mast and luff are within about 0.006 of mark height
of the original. The bow remains at a nominal 0.684 fraction down. The curved
foot's virtual clew is now at 0.692 rather than the old 0.665 target: removing
stroke expansion and deriving the actual channel shifts that endpoint. This is
recorded rather than passed off as an exact raster trace.

Current generator diagnostics include:

- Integral height 780.5 units; channel 27.3 units.
- Hook bay 2.121 gaps; vertical head daylight 1.172 gaps.
- Nearest head clearance 1.312 gaps; foot/deck clearance 1.000 gap.
- Pen slope/travel at most 0.252; minimum forward envelope cosine 0.968.
- Whole-curve fit bound at most 0.182 units before 0.01-unit serialization.
- Analytic terminal tangent error 0°; rendered terminal error 0.084° (limit 0.1°).
  Serialized boat corner joins are checked below 0.5°.

`assertSimpleOutline()` also checks dense output samples for crossings, touches,
overlaps and reversals. This complements the continuous fit bound and forward
envelope check; it is not a claim of an exact symbolic intersection proof.

## What was weak, and what remains open

1. ~~**The sail's head is a fragile spike inside the hook counter.**~~ Blunted,
   separated, and guarded by a hook-specific vertical daylight assertion.
2. ~~**The ball terminals meet the stem in a hard notch.**~~ One swept pen and
   exact terminal tangents replace the circle union.
3. ~~**Corner rounding is a fill-plus-stroke workaround.**~~ Real per-corner
   fillets, with small bow and branch radii, replace all outlining strokes.
4. ~~**The channel flares without control at the corners.**~~ One ink offset,
   concentric foot/deck arcs, shared branch radii and an explicit maximum branch
   expansion. The unavoidable opening of a three-way junction remains.
5. **Optical centring remains open.** Standalone art still centres its bounding
   box. The existing wordmark's small vertical nudge stays; circular avatars
   and different lockups need their own optical evaluation.
6. **No separate small-size pen profile.** The new taper serves the hook counter
   and ball transition. It has been inspected at small sizes, but this is still
   one master, not a set of optical sizes.
7. ~~**All targets were inherited uncritically from the raster.**~~ Actual weight,
   hook-to-stem ratio and sail fullness have now been reconsidered. The lean is
   retained deliberately; silhouette continuity still constrains every change.
8. ~~**Untested at 16px and as a single-colour stamp.**~~ Both are now in the
   proof, including actual favicon tiles and enlarged pixel views. At 32px the
   full mark's counters/channel survive on both grounds. At 16px recognition
   survives but the channels depend on antialiasing, especially inside the
   favicon tile. **Ink spread, embroidery and engraving remain unqualified.**
   Use 32px or larger when internal detail matters; the digital stamp preview
   does not certify fabrication tolerances.
9. **No complete lockup specification.** The existing `Wordmark` pairing stays.
   Clear-space rules, a stacked version and optical avatar placement still need
   a dedicated pass.

The wider site keeps the maths-and-sea direction: accurate generated waves,
sand and ocean grounds, and the shared mark in the navigation and hero. The
wave generator's corrected fitter is part of this refinement. On mobile, the
hero boat has been moved inward slightly so its bow is no longer clipped by
the viewport. The site's copy and type choices stay as they were.

## Reproducing the checks

```bash
node tools/build-logo.mjs
node tools/build-waves.mjs     # needed when the shared fitter changes
node --test tools/geometry.test.mjs
node tools/preview-logo.mjs
node tools/render-logo.mjs --pixels --assets
python3 tools/scan.py tools/.out/candidate.png 900 900 tools/.out/original.png 900 900
npx tsc --noEmit
npm run lint
npm run build
```

The renderer needs Chrome and ImageMagick (`CHROME_BIN` can specify Chrome).
It writes the proof and 900px scan inputs to ignored `tools/.out/`. It captures
`HEAD:public/mark.svg` as `baseline.svg` once; remove that intermediate to start
a comparison with a later committed baseline. `--pixels` expands the pixel
proof; `--assets` also regenerates `app/favicon.ico`, `app/apple-icon.png`,
`public/images/cover.png` and `cover-compressed.png`. ICO sizes are rendered
natively at 64/48/32/16px, avoiding a second resampling step. Cover rendering
checks that its display and monospace fonts loaded before saving.

Open `tools/.out/preview.html`: inspect 32px first, on both grounds, then
120/56px and the display versions. The enlarged hook/head, lower terminal and
three-way junction views expose defects hidden at thumbnail scale. The proof
also contains original/previous/current silhouettes, monochrome stamps and
actual browser tiles. The geometry regressions cover the fitter's reversed
handle, tangent continuity, winding, mixed sampling density and invalid outlines.

This pass was verified with both generators, all 10 geometry regressions,
`tsc --noEmit`, ESLint and the production Next build. Mark and wave outputs
also regenerate byte-for-byte identically. Desktop and mobile integration was
rendered on both colour schemes, with the complete mobile bow visible.
