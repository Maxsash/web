# Creative validation — evidence index

Updated: 5 October 2026. Current evidence is in
[creative-v2-validation.md](creative-v2-validation.md).
The current scope and ordered work are in
[creative-v2-plan.md](creative-v2-plan.md).

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
