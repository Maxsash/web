# Handoff — start here

Updated 12 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD ff92a4b on main: the owner committed phases 1–4 (phase 4 is the always-on mapped
Moon) and the temporary dev preview. No push or release.

## Current state

[night-sky.md](night-sky.md) tracks the phased build. Phases 1–3 (dated stars, dated
planets, phase-aware sea light) are committed. The temporary `next dev` sky preview picks
any date or eight nearby phases; production has no control.

Phase 4: the owner first had detail revealed on targeted zoom, then chose always on after
pros and cons. NASA SVS's 2025 2K LRO map, cropped losslessly to its near side
(`public/moon-lroc-2k-near-side.jpg`, 1024×1024, 215,631 bytes; provenance and both
SHA-256s in `public/moon-lroc-2k-CREDITS.txt`), replaces the shader's Moon whenever the
night sky shows it, at the original size and position. Zoom magnifies the 512 px canvas.

- `OceanScene` mounts `MoonDetail` in a `data-moon-map` overlay on the first night frame
  and reuses the engine's India day (`engine.moonDay()`); daytime never fetches the map.
- `MoonDetail` fetches at low priority and hands the blob to `moon-detail.worker.ts`, which
  decodes, shades (`moon-detail.ts`, longitudes ±90° span the crop) and transfers a 512 px
  image, then is terminated.
- The overlay uses `plus-lighter`, so the unlit side is sky plus Earthshine. The frame loop
  crossfades the shader Moon (`uMoonMap`) into the map; opacity = night × crossfade ×
  paper fade (`moonVisibility`). A failed map leaves the shader Moon.
- Shared constants: `MOON_SCREEN_RADIUS` and `SKY_PAPER_FADE` (GLSL literals, keeping the
  pinned error-sea shader bytes) in `ocean-light.ts`.
- Removed: zoom detection (`moon-zoom.ts`), Z/Escape, the lazy chunk and status text.
- New rule in AGENTS.md: clean up immediately, including files outside git.

## Verification

Final isolated Node 24 Turbopack production build of the cropped version, identical to
the working copy file for file: TypeScript, lint, format, 145 Node tests, 78 SEO cases,
headers/CSP, keyboard 22/22, creative 191 captures with 0 runtime exceptions, and the
Moon detail, Moon, Moon-sea, sky-theme, star, software-fallback and planet checks
(planets alone: median 0.168 ms). The crop decodes byte-identical to the original's
middle half; phase readings and zoomed captures match the uncropped build. Before the
crop: `check-dev-sky.mjs` and a dev probe showed the preview redrawing the mapped Moon,
and a 4× CPU-throttled phone probe found no main-thread long task from the map. Desktop,
retina, phone, 3× pinch and four zoomed phases were inspected. The worktree, servers,
captures and scratch files were deleted afterwards.

Not verified: physical phones, Safari/Firefox (`plus-lighter`, worker, OffscreenCanvas),
battery, calibrated brightness, exact libration; dev preview after the crop.

## Next

Phase 5, the water-motion review, keeping wind waves independent of lunar phase. Then
decide the dev sky preview's removal (it was for sky review). Priorities across the repo
are in [follow-ups.md](follow-ups.md): real-phone checks, release and discovery come
before new decorative work.

## Open items

- Cleanup the agent was not permitted to do (shared temp folders): 360 stale
  `/private/tmp/maxsash*` logs/reports/scripts (44 MB) and three Chrome test profiles
  from 10 October in `$TMPDIR/maxsash-*` (159 MB). Delete when convenient.
- Owner decision: five files in ignored `tools/.out/` are not in git history: early logo
  drafts `start/build-logo.mjs`, `start/outline.mjs`, `start/mark.svg` (10 September) and
  scratch `diagnose.mjs`, `contour-diagnosis.mjs`. Keep elsewhere or delete.
- Turbopack also emits a raw copy of the worker source under `/_next/static/media/`;
  harmless (public source) but noted.
- Owner release, real social previews, physical devices, private-system production
  evidence, Vercel rate limits and follow-ups.md remain.

## Suggested commit

```
docs: record the committed Moon work in the handoff

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
