# Handoff — start here

Updated 12 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 12a73f3 on main: owner committed phase 1 dated stars after transition commit d21757f.
No push or release. Phase 2 planet and dev-preview work is uncommitted for review.

## Current state

[night-sky.md](night-sky.md) tracks the phased build. Phase 2 places Mercury through Saturn
around the composed Moon for Tikamgarh at 21:00 IST each India day. `planet-sky.ts` uses
JPL's 1800–2050 orbital elements, geocentric J2000 coordinates and phase/distance-based
apparent magnitudes. `skyProjectionAt` keeps stars and planets in one Moon-centred frame.
The steady planet point pass allocates only at night and follows the existing day/reveal
blend. Objects too close to the Sun or fainter than magnitude 5 are omitted. The authored
horizon/enlarged Moon remain a composition, not a local visibility forecast.

The owner also requested a temporary development-only sky preview. In `next dev`, the
collapsible control offers eight nearby Moon phases, a date input and Live date. A choice
activates night and changes Moon, stars and planets together. Production has no control.
The existing star catalogue and lunar phase rendering are unchanged. Phase 3 remains
Moon-dependent sea reflection/ambient light: new-Moon sea light is currently too bright.
Later: mapped lunar zoom detail, then water-motion review; wind waves stay independent
of lunar phase.

## Verification

Final isolated Node 24 webpack production build passes lint, TypeScript, format check,
142 Node tests, 78 SEO cases, headers/CSP, keyboard 22/22, creative 191 captures with no
runtime exceptions, the existing star regression and `check-planets.mjs`. All 15 sampled
planet positions match independent Astronomy Engine 2.1.15 within 0.15°. The production
browser confirms actual planet draw, date changes, day hiding and absence of dev controls.
The dev control passes Full, custom date, Live reset, night activation and phone fit in a
separate development worktree. Desktop, phone and dev-control captures were inspected.

Actual desktop Metal planet draw, final 37-query run: median 0.166 ms, p95 0.201 ms;
other short runs had similar median and p95 as high as 1.65 ms. This is not phone GPU
evidence. No physical-phone, Safari/Firefox, battery, calibrated sky-brightness or exact
horizon claim. Captures/reports: ignored `tools/.out/planets/` and `tools/.out/dev-sky/`.
Both own servers were stopped. Older detached worktrees belong to prior sessions.

## Next

Review planet placement and the dev control on the main site. Then phase 3 should scale
the Moon reflection and near-surface ambient with lunar phase and direction, without
changing wind-wave motion. No new design choice is pending. Do not commit phase 2 without
a new explicit user request.

## Other open items

- Owner release and real social previews/crawler checks are separate.
- Physical device and field performance checks remain.
- Private-system production evidence, Vercel rate limits, and follow-ups.md remain.

## Suggested commit

```
feat: add dated planets and a development sky preview

Place Mercury through Saturn using JPL daily orbital elements in the existing Moon-centred
field. Add a development-only date and Moon-phase preview control for visual review.
Verify positions, renderer lifecycle, phase selection and the production browser gates.
```
