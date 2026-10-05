# Creative validation — evidence index

Updated: 5 October 2026. Current evidence is in
[creative-v2-validation.md](creative-v2-validation.md).
The latest scroll-synchronization checkpoint passes 66 browser records.
Browser-gesture before/after tests reduced measured style work by about 93% in
the local samples. Read-only live scrolling still did not reproduce visible
lag in headless Chrome; the user's iPhone Air/MacBook Pro scroll report remains
an open physical-device gate. Production now shows direct Writing and compact
rendering; fresh live gesture diagnostics measure 14.1/18.8 ms style totals at
desktop/phone viewport. All repo dev/preview servers are stopped.
Exact commands, scope, changes and next rechecks are recorded there.
Latest physical feedback: Mac Chrome is much better; supplied iPhone Air Safari
recording shows the remaining scroll issue. The current checkpoint prioritizes
new scroll samples over idle cadence limits; actual validation is in v2 evidence.
The current scope and ordered work are in
[creative-v2-plan.md](creative-v2-plan.md).

## Latest evidence — selected mobile stages

The user selected three mobile gesture stages; desktop remains continuous.
Fresh local build/types/lint and **81 browser records** pass, including touch
progression/reversal, native final exit and reduced-motion stage buttons.
Exact report, command scope and physical Safari limitations are at the top of
`creative-v2-validation.md`. This supersedes earlier counts as current evidence.

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
