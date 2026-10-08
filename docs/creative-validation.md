# Creative validation — evidence index

Updated: 5 October 2026. Exact evidence and historical comparisons are in
[creative-v2-validation.md](creative-v2-validation.md). Current scope and next
work are in [creative-v2-plan.md](creative-v2-plan.md).

## Keyboard and accessibility pass — 6 October 2026 (uncommitted)

Focus obscured by the pinned phone drawing, label-in-name mismatches, tab order,
live-region chatter and focus-ring contrast fixed; new `tools/check-keyboard.mjs`
(20/20), axe clean in day and night on four page types, 126 browser records. No
real screen-reader or physical keyboard test yet. Details:
[current validation](creative-v2-validation.md).

## GitHub commit log — 6 October 2026 (committed)

The shoreline's GitHub card is redesigned as this site's own commit log (three
latest commits, no counts or activity chart). 126 browser records, 26 Node tests, 20 SEO cases, axe
(day/night), build/types/lint pass; fallback exercised. Details:
[current validation](creative-v2-validation.md); decision: [roadmap](creative-roadmap.md).

## Random sea per visit — 6 October 2026 (committed)

A fresh, curated-random version 2 sea on each visit to `/`; no visitor data used.
26 Node tests, 125 browser records, 20 SEO cases, build/types/lint pass, and
GPU/CPU parity now covers a v2 sea. Details: [current validation](creative-v2-validation.md).

## Structure pass and sea studio — 6 October 2026 (committed, `223c7cd`)

Single Notebook entry point, Elsewhere limited to external places, named section
kickers, footer outside `<main>`, and a seed-driven sea studio with print/save/
sail/copy. 25 Node tests, 125 browser records, 20 SEO cases, build/types/lint and
axe pass locally. Details and limits: [current validation](creative-v2-validation.md);
decisions: [roadmap](creative-roadmap.md). Physical-device, paper-print and
screen-reader checks remain open.

## User acceptance — 6 October 2026

User accepted the shoreline, reports physical-device behaviour is fine, and
confirmed the homepage WhatsApp preview. These are user reports; no new
automated checks were run this turn. GitHub activity visual design is not
accepted and is tracked in [follow-ups](follow-ups.md). The "uncommitted"
shoreline wording below is historical (landed in `a8587eb`).

## Daytime sharing banner — 5 October 2026

User requested replacing the old WhatsApp banner with the daytime Living Atlas
and explicitly authorized commit/push. New 1200 × 630 static JPEG captures the
actual sunlit sea/ship renderer with site typography; all sharing metadata uses
`/images/living-atlas-day-v1.jpg`. The new filename changes the image URL for
fresh crawler requests. Compressed image visually reviewed; explicit day/WebGL2
capture, build, lint, types and 20 crawler/page checks pass. QA servers stopped.
Commit subject: `fix: refresh social banner with daytime Living Atlas`.
No manual deployment or actual WhatsApp app/cache refresh is claimed.
Remaining work and full evidence: [search and sharing](seo-and-sharing.md).

## Search and sharing checkpoint — 5 October 2026

User requested WhatsApp sharing checks, SEO and AI/LLM discovery. Local changes
add per-page social cards, shared canonical origin, robots/sitemap and accurate
homepage entity/project JSON-LD. Sample notebook pages remain noindex. The user approved this checkpoint and requested commit/push to `origin/main`
with its documentation. Commit subject: `feat: improve social sharing and search discovery`.
No manual deployment or post-push live verification is included; hosting may deploy on push. Production build, types,
lint and 20 crawler/page cases pass. Read-only live homepage/card checks pass;
actual WhatsApp app previews, Search Console and AI citation outcomes remain open.
Details, commands and next gates: [search and sharing](seo-and-sharing.md).


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

Before creative experiments, the working tree was clean at `2d5452a`.
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
