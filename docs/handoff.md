# Handoff — start here

Updated 10 October 2026. Read `AGENTS.md`, then this file, `architecture.md` and
`decisions.md`. Verification: `testing.md`; open work: `follow-ups.md`.

## Current state

- Direction A for the main site, B for the Notebook; C remains unbuilt. HEAD `6e065c6`.
- The owner staged the prior gull refinement before this correction. That index was
  preserved; this step's changes are unstaged. Nothing committed, pushed or deployed.
- The gull is a procedural coastal character inside the hero's wave pill. Prior
  refinement: clearer model, slower/smoother flight, one brief night invitation and
  a resting pose. Details: `feedback.md`, `decisions.md`, `components/gull/`.
- **Owner correction:** seated gull floated above the border; make it work across
  orientations/resolutions without narrow-screen overlaps. Implemented in the main site.
- **Contact:** removed the 10 px floor inset. Body/feet contact facets determine the
  lowest projected point; the renderer places that point on the border centreline.
  Standing, sitting, sleeping and touchdown use the same reference. Head/wing motion
  does not move it. No second geometry pass; departure starts from the drawn contact.
- **Responsive:** stage grid reserves the header's actual height before hero copy;
  narrow headers use two rows, with wrapping branding/navigation. Short wide screens
  use compact copy columns; the secondary seed link hides at ≤620 px viewport height
  to keep copy and controls clear. The sea studio remains in the page.
- **Resize:** control-height, viewport and DPR changes refit the canvas. An arrival
  interrupted by rotation settles quietly onto the new perch. Approved sea timings stay.
- **Review:** http://localhost:3012, production build in detached worktree
  `/private/tmp/maxsash-gull-review`, PID **38433**, started here and left for review.
  Only review servers started here were replaced; no user server was stopped.

## Next

1. Owner review on the preview: sitting/hover/focus, night and a rotation while arriving.
2. Physical iPhone, Safari/Firefox and a screen reader remain unverified.
3. Commit/release only when the owner chooses. Main never deploys; production does.

## Verification

- Node 24 build in the isolated worktree, types, lint, format, 109 Node tests (17 gull),
  SEO 20, headers and keyboard 20/20 pass. Creative: 132 records, no failed assertions or exceptions;
  all required checks completed against the final build. No build or test in the main folder this step.
- `tools/check-gull.mjs`: all 47 pixel/contact and layout checks pass. Live resizes:
  widths 320–2560, heights 320–1440, DPR 1/1.25/2/3, plus density-only changes at
  fixed viewport dimensions; 125%/150% root text sizes; day/night,
  standing/sleeping/drawing and portrait-to-landscape during arrival.
- DPR is checked before every draw as well as by the resolution listener, so late
  media events cannot leave a resized display using the old backing density.
- Measures actual drawn pixels, label clearance, visible text/control collisions,
  clipping and canvas density. Contact is within 0.36 CSS px of the border centreline
  (raster antialiasing); no tested overlap/clipping. Inspected screenshots and the
  corrected gull over WebGL on desktop and phone, not only the static fallback.
- Browser harness note: gull/keyboard printed complete passing results, then
  lingered. Gull exited after a delay; stopped only the completed keyboard process.
- Reports/screenshots: worktree `tools/.out/gull/` and `tools/.out/creative-home/`;
  logs `/private/tmp/maxsash-gull-edge-*.log`; WebGL screenshots `/private/tmp/gull-webgl-*.png`.
- Not checked: physical devices/browsers above, field performance, audio listening or
  whether the gull improves clicks. No claim that finite checks prove every device.

## Suggested commit message

```
fix: anchor the gull to the pill edge across screen sizes

Replace the fixed bottom inset with projected belly/feet contact on the border.
Reserve space for wrapped hero controls and compact short-screen copy, and refit
on viewport/display changes so rotation cannot leave the gull misplaced.

Verified on Node 24: production build, types, lint, format, 109 Node tests, SEO,
headers, keyboard, 132 creative cases and 47 gull contact/collision/rotation checks.
Inspected desktop and phone WebGL views; real-device checks remain open.
```

## Persistent constraints

- Never commit/push unless asked; release is the owner's action.
- Approved mobile sea timings and sea version 1 stay fixed.
- Public repo: no personal Gmail, phone, employer name or degrees; invent no outcomes.
- Prior research lives in `../web-research/`; no database, accounts or cookies.
