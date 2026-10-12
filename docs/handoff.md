# Handoff — start here

Updated 12 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 54290fe on main: the owner committed phases 1 and 2 and the temporary dev preview.
No push or release. Phase 3 sea-light work is uncommitted for review.

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
The phase 3 shader is built: the hero sea now receives the Moon's daily illuminated
fraction. A nonlinear lunar brightness curve scales specular glints, and a column beneath
the Moon focuses the reflection; a small diffuse night baseline keeps dark water legible.
New/quarter/full and phone-width production frames were inspected. Wave motion and
error-scene shaders stay unchanged. Later: mapped lunar zoom detail, then water-motion review.

## Verification

Phase 2's final isolated Node 24 webpack production build passed lint, TypeScript, format check,
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
Phase 3's isolated Node 24 webpack production build passes 142 Node tests, lint,
TypeScript, format, 78 SEO cases, headers/CSP, keyboard 22/22 and creative 191 captures
with no runtime exceptions. Nine drift tests preserve the default/error sea shader digest.
The focused browser check passes new/quarter/full coupling, a directional full-Moon path,
exact day parity and no runtime exceptions. `check-moon`, `check-sky-theme`,
`check-planets` and `check-stars` pass. Desktop and phone-width captures were inspected;
the latter are desktop Chrome emulation. A repeated 37-query desktop Metal star draw
measured 0.191 ms median, 1.21 ms p95; a prior short run was noisier. No physical-phone,
Safari/Firefox, battery or calibrated sky-brightness evidence. Captures/report are in
ignored `tools/.out/moon-sea/`. The isolated server was stopped. Older detached
worktrees belong to prior sessions.

## Next

Review phase 3 sea lighting on the main site. Next, build phase 4 mapped lunar detail
revealed by native zoom toward the Moon, with a keyboard-accessible path and lazy texture.
The daily lit and unlit hemispheres must match the normal Moon. No new design choice is
pending. Do not commit phase 3 without a new explicit user request.

## Other open items

- Owner release and real social previews/crawler checks are separate.
- Physical device and field performance checks remain.
- Private-system production evidence, Vercel rate limits, and follow-ups.md remain.

## Suggested commit

```
feat: scale night sea light with lunar phase

Dim specular moonlight near new Moon, keep a subtle dark-sky ambient, and centre the
reflection beneath the composed Moon. Preserve day water and wave motion.
Verify new/quarter/full and day scenes plus the production browser gates.
```
