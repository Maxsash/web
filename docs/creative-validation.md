# Creative validation — evidence index

Updated: 5 October 2026. Exact evidence and historical comparisons are in
[creative-v2-validation.md](creative-v2-validation.md). Current scope and next
work are in [creative-v2-plan.md](creative-v2-plan.md).

## Latest work — mobile opening curve

The first stage transition now starts promptly and decelerates across its existing
1.8-second duration. The mobile opening reveal hold is removed; 2 → 3 keeps its
600 ms smootherstep/reveal path. Exact timed GPU-uniform checks and remaining
iPhone acceptance are in [current validation](creative-v2-validation.md).

## Previous evidence — sea/shore/audio refinement

Current uncommitted work aligns wave/ship lighting with the sky disc, narrows the
shore and blends it into Elsewhere. Audio is now explicitly opt-in via one-tap
“Play waves” in header/footer; ordinary gestures remain silent. Theme is system
default with only a footer switch. Exact latest checks and physical-device limits are in
[creative-v2-validation.md](creative-v2-validation.md).

## Previous evidence — Elsewhere and sample cleanup

Approved Elsewhere is in the homepage; the sample route tree and review-only
scaffolding are removed. Future changes go directly into the main site and stay
uncommitted until accepted. Fresh build/types/lint and **92 browser records**
pass, with desktop/phone Elsewhere captures visually reviewed and enlarged-text
bounds checked. Temporary QA servers are stopped. User reports the staged sea
is smooth on iPhone Air Safari; broader physical qualification remains separate.

## Original comparison baseline

Before creative experiments, the working tree was clean at `d10c21a`.
`tools/measure-routes.mjs` inventoried the production homepage:

| Asset | Bytes |
| --- | ---: |
| HTML gzip, including inline RSC | 21,943 |
| Initial modern-browser JS gzip | 146,925 |
| CSS gzip | 6,567 |
| Preloaded fonts, raw | 209,712 |

This is a static referenced-asset inventory. It excludes runtime-requested
chunks and non-preloaded fonts. The current v2 browser inventory includes
actual requested assets, including the deferred renderer. Compare like with
like; neither number measures GPU cost or field Web Vitals.

Historical evidence in ignored `tools/.out/creative/baseline-assets.json`
preserves the complete baseline. The old 38-case responsive captures dated
11 September are for the original homepage, not the v2 prototype.

## Rejected review 01

The earlier harbour controls, notebook sliders and small voyage passed a
build and 14 model/geometry checks. The user rejected their creative quality.
They were uncommitted and removed on 5 October as requested. Their passing
checks do not qualify the new renderer. Four tests specific to those removed
experiments were removed too; original geometry tests remain.

## Current interpretation

Use the v2 validation document for exact commands, environment, screenshots,
math/API/lifecycle assertions, payload measurements, cleanup, and open gates.
Do not resurrect old Wind/Helm selection tasks or claim physical phone,
screen-reader, field performance, or release acceptance from headless Chrome.

## Day/night shoreline exploration

The active uncommitted exploration is documented in `creative-v2-validation.md`.
The previous release checks are historical evidence; they do not qualify the new
shoreline or opt-in audio on physical iPhone Safari.
