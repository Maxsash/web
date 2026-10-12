# Handoff — start here

Updated 12 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD d21757f on main. The owner explicitly requested and received the verified sun/moon
transition commit. No push or release. All night-sky work remains uncommitted for review.

## Current state

Phase 1 of [night-sky.md](night-sky.md) is built: 1,627 real HYG v4.1 stars in a 9,768-byte
attributed catalogue, framed around the Moon for Tikamgarh at about 21:00 IST each India day.
`star-sky.ts` holds the pure projection; `star-shaders.ts` draws one sparse point pass with
fainter stars progressively hidden by lunar light and proximity. The catalogue and star GPU
resources load only when night appears. India midnight refreshes the frame. The home shore
links the CC BY-SA data/adaptation notice. Bright stars persist at full Moon.

Owner decisions: fixed Tikamgarh and day-wise accuracy; keep the Moon composed in place even
when it would be below the real horizon. Native zoom toward the Moon should quietly reveal
a high-resolution mapped, phase-shaded surface; no visible telescope prompt. Keep the chosen
wind-wave recipe independent of lunar phase. Both new and full Moon increase tidal range;
phase does not set local high water at 21:00 or wind-wave height.

Later phases: dated planets, phase-aware Moon reflection/sea ambient, mapped lunar detail,
then a water-motion review. The present new-Moon sea reflection is still too bright; phase 3
will address it. Planet points, sea-light coupling and the zoom Easter egg are not built.
The authored horizon/enlarged Moon are a composition, not an exact local visibility forecast.

## Verification

Final isolated Node 24 webpack production build passed lint, TypeScript, format check,
139 Node tests, 78 SEO cases, headers/CSP, keyboard 22/22, creative 191/191, and a live
200/200 home-to-catalogue-license link. `check-stars.mjs` captured new/quarter/full and
phone scenes. With one fixed star frame, visible pixels fell 527 → 236 → 48 as illumination
increased; day drew zero. Moon and sky-switch regressions also passed on the same sky code
before the last colophon-link edit. No runtime exceptions reported.

Actual desktop Metal star draw: most recent 37-query run median 0.178 ms, p95 1.40 ms,
max 2.05 ms. Other short runs had median ~0.18 ms and p95 0.192–2.02 ms; p95 is variable.
Synthetic feasibility benchmark and source details live in `docs/night-sky.md`. Browser
screenshots/report: ignored `tools/.out/stars/`; full gate logs under `/private/tmp/maxsash-stars-*`.
The own production server is stopped.
No physical-phone, Safari/Firefox, battery, screen-reader, or calibrated sky-brightness claim.

## Next

Review this first star phase on the main site, including new/full and mobile views. Next build
dated planets as phase 2, validate positions against independent dates, then phase 3 water
light. Prototype native zoom discovery in phase 4 across browser/device behavior. Do not
commit the uncommitted sky work without a new explicit user request.

## Other open items

- Owner release and real social previews/crawler checks are separate.
- Physical device and field performance checks remain.
- Private-system production evidence, Vercel rate limits, and follow-ups.md remain.
- Old detached worktrees belong to prior sessions; leave them alone.

## Suggested commit

```
feat: render a dated Moon-aware star field

Place attributed HYG stars in a Tikamgarh evening frame around the composed Moon.
Fade faint stars as moonlight grows and load the compact GPU pass only at night.
Verify phases, mobile captures, renderer lifecycle and the production browser gates.
```
