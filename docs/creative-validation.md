# Creative validation log

Last updated: 4 October 2026.

This file records evidence, not aspirations. The work list and decisions live in
[creative-roadmap.md](creative-roadmap.md).

## Before implementation

- Git working tree was clean at `d10c21a`.
- Current source has one homepage and one application client component:
  `components/SeaMotion.tsx`.
- Existing saved responsive report contains 38 cases with no recorded failures.
  Captures date from 11 September 2026; this is historical QA, not a fresh run.
- Fresh browser visual inspection was unavailable during the preceding research
  because computer permissions were pending. Physical phones were not tested.
- Read installed Next 16.2.9 routing, server/client component, static parameter,
  metadata, and lazy-loading guides before implementation.

## Baseline

Pending: production build and route asset-size inventory before UI changes.
Record raw/gzip HTML, route JS/CSS, and whether shared dependencies are counted.
Do not present these numbers as LCP, INP, CLS, frame time, or battery measurements.

## First review slice

Pending implementation and validation. Record exact commands, routes checked,
failures and fixes, desktop/mobile visual evidence, and checks left to the user.

## Acceptance still required

- User selection of main-site wind/helm interaction and blog treatment.
- Desktop/mobile visual review, keyboard/zoom/screen-reader review.
- Physical iOS/Android permission, calibration, tilt, and fallback checks.
- Performance traces on a reference phone and field Web Vitals after release.
- C mechanics and hidden entrance selection.
