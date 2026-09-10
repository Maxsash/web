# The Maxsash Labs mark

An integral sign rigged as the mast of a sailboat: mathematics and the sea, the
two things the studio is named around. The integral's stem is the mast and
forestay, its lower hook the stern, with a sail hung off the stem and a hull
beneath.

The mark is **generated**, not drawn. [`tools/build-logo.mjs`](../tools/build-logo.mjs)
computes it and writes `components/Mark.tsx`, `app/icon.svg` and
`public/mark.svg`; the outputs are committed, so a normal build never runs it.

## Why it is generated

The qualities that make this mark work are relationships, and hand-drawn
relationships drift. Four of them are now structural rather than aspirational:

1. **The integral is one spine with exact 180° rotational symmetry** about its
   inflection. `spineAt(s)` returns `upperAt(s)` for positive `s` and the
   negated `upperAt(-s)` for negative, so the two ball terminals cannot differ.
   In the original they did: the lower one was noticeably fatter and reached
   further left.
2. **The sail's luff and the hull's stern ride one offset of that spine.**
   Both come from `luffAt(s)`, so the white channel beside the mast is a
   constant width from the sail's head to the keel.
3. **The deck line and the sail's foot are parallel**, both built off `along`.
4. **The sail's leech carries no inflection.** A cubic bends one way for its
   whole length exactly when its control polygon is convex; the build asserts
   this and throws rather than emit an unfair curve.

The wave bands are generated for the same kind of reason — see the README.

## The dials

All at the top of the generator. The integral is in absolute units; the boat is
in fractions of the integral's own height, so changing the mast rescales the
boat with it.

| Group | Dials |
| --- | --- |
| Stroke | `STROKE_MAX` 76, `STROKE_END` 0.82, `TAPER_POW` 2.1, `BALL_R` 44 |
| Stem | `STEM_ANGLE_MID` 9°, `STEM_ANGLE_TOP` 18°, `SHOULDER` [78, 337] |
| Hook | `HOOK_R0` 56, `HOOK_R1` 50, `HOOK_SWEEP` 176° |
| Channel | `GAP_F` 0.033, `ROUND` 9 |
| Hull | `DECK_ANGLE` 11°, `DECK_LEFT_YF` 0.805, `DECK_LEN_F` 0.645, `KEEL_YF` 0.962, `BOW_RAKE` 36° |
| Sail | `SAIL_HEAD_YF` 0.17, `SAIL_FOOT_LEN_F` 0.444, `LEECH_*_ANGLE` 40°/17°, `LEECH_*_PULL` 0.52/0.36 |

The hook is a spiral, not an arc: its radius runs `R0 → R1` as `u²` so that
`r'(0) = 0` and it joins the stem tangentially. Sail and hull are painted
fill-plus-stroke at `2 × ROUND` to round their corners, which grows them by
`ROUND`, so their geometry is pulled in by that much to keep the channel at
`GAP_F`.

## How it was calibrated

The refinement was meant to keep the original's silhouette and fix only what
was inconsistent, so the targets were measured rather than guessed.
[`tools/scan.py`](../tools/scan.py) renders a mark to a threshold mask and
reports, for each of 23 heights, the ink spans crossed at that height — scaled
by the mark's own height and measured out from the mast's centre line, so two
renders compare directly regardless of size or position.

[`mark-original.svg`](mark-original.svg) is the pre-refinement mark, kept so the
comparison stays reproducible:

```bash
# render both to PNG at 900x900 with any headless browser, then
python3 tools/scan.py candidate.png 900 900 original.png 900 900
```

Where the current mark lands against the original:

| Measure | Original | Now |
| --- | --- | --- |
| Stroke ÷ mark height | 0.092 | 0.093 |
| Bow tip, as a fraction down | 0.685 | 0.686 |
| Clew, as a fraction down | 0.665 | 0.665 |
| Channel ÷ mark height | 0.036 | 0.033 |
| Aspect (W/H) | 0.957 | 0.927 |

The stem and sail track the original within a few thousandths from 25% to 66%
of the height. The aspect differs because the original's oversized lower hook
was widening it; making the terminals symmetric necessarily pulled the left
edge in.

## What is still weak

Known and unfixed, roughly in order of how much they cost:

1. **The sail's head is a fragile spike.** It runs up into the hook's counter,
   so the counter, the channel beside the mast and the gap under the hook merge
   into one irregular negative shape instead of reading as distinct counters.
   Lowering `SAIL_HEAD_YF`, blunting the head, or reshaping the hook would each
   help, and they interact.
2. **The ball terminals meet the stem in a hard notch.** The ball is a circle
   unioned onto a flat-capped tapered stroke; where the two meet, the outline
   has a concave corner. It wants a proper fillet, or a taper and radius tuned
   so the union comes out tangent.
3. **Corner rounding is a workaround.** One `ROUND` value applied by stroking
   the fill, with the geometry pre-shrunk to compensate. Real per-corner fillets
   would let the bow stay sharper than the clew, which is what the shapes want.
4. **The channel flares at the corners.** It is genuinely constant between the
   parallel edges, but where the sail's foot and the hull's deck run into the
   curved luff, the gap opens into a wedge.
5. **The mark centres its bounding box, not its optical mass.** Weight sits low
   and right; in a circular avatar or a tight lockup it will read slightly off.
6. **The taper is unproven.** `STROKE_END` 0.82 is subtle enough that below
   about 24px it may be doing nothing but softening the stem.
7. **The targets were inherited.** They come from the original raster, which was
   not itself drawn by a type designer. Stroke weight, lean and hook-to-stem
   ratio are all worth questioning rather than matching.
8. **Untested at 16px, and as a single-colour stamp** — engraving, embroidery,
   anywhere the channel has to survive ink spread.
9. **No lockup rules.** [`components/Wordmark.tsx`](../components/Wordmark.tsx)
   pairs mark and name, but there is no defined clear space, minimum size, or
   stacked variant.

## Checking a change

```bash
node tools/build-logo.mjs      # prints the calibration numbers; throws on an unfair leech
node tools/preview-logo.mjs    # writes tools/.out/preview.html
```

The preview shows the mark on both grounds at display size and again at
120 / 56 / 32px. The hook counters and the channel beside the mast are what
give out first, so judge a change there before judging it large.
