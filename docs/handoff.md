# Handoff — start here

Updated 12 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 11b3718 on main (night sky phases 1–4 committed, see [night-sky.md](night-sky.md)).
Uncommitted: the browser-bar fix below and docs. No push or release.

## Current state

**Browser bars match the page** (owner asked: the phone's top-bar area should match the
site). Before: every page gave Safari and `theme-color` cream paper, so a cream band sat
above the blue hero, the 404's sky and (for OS-dark visitors) a navy band over the light
Notebook. Now (architecture.md, Browser bars):

- Hero: `.barTop`/`.barBottom` in the sticky stage declare the measured sky top and sea
  bottom per theme for Safari 26+ without painting; paper in the drawing chapters.
- Error pages: a whole-page drift page is sticky; plate and storm skies' first gradient
  stops moved to their rendered colours (`#bcd1d0`, `#1d272f`; only visible before WebGL).
- Notebook: the body keeps the Notebook paper after a night page.
- `components/ThemeColor.tsx` keeps `theme-color` on the same rule for Chrome/Android and
  Safari 15–18.
- The theme is applied before the first paint (`initial-theme.ts`, inlined in `<head>`),
  so night visitors no longer flash day and Safari reads night colours; `/plate` keeps
  its paper behind it.
- New check `tools/check-browser-bars.mjs`.

**Test workbench, under discussion, nothing built.** Proposed order: a manifest of checks
with a common result format and a runner (worktree → build → server → checks → cleanup);
GitHub Actions CI on `main` with `production` protected to accept only commits that
passed; then a smaller local dashboard (screenshot review, LAN/QR link for real-phone
checks); an in-page dev scene panel maybe later. Production admin panel ruled out.
Unknown: full-suite duration and which WebGL checks pass on CI's software rendering.

## Verification (browser bars)

Isolated Node 24 Turbopack production build: format, lint, TypeScript, 145/145 Node tests,
`check-browser-bars` (incl. a night load with the theme set before the body is parsed),
12 sky-theme cases, keyboard 22/22, 78 SEO cases, headers/CSP, software fallback, creative
191 captures with 0 runtime exceptions. (An earlier keyboard run failed the hero focus ring
once under heavy load; not reproduced since; unmodified HEAD showed the same CDP timeouts.)

iOS 27 and 26.5 Safari simulators (temporary, deleted): before, cream bands above and
below the hero; after, day load sky `#48869d` above and sea `#0f3b45` below, night load
`#030b15`/`#06141a`, 404 sky/sea, Notebook paper. Not verified: real finger scrolls,
Chrome on a real Android device.

## Next

1. **Owner check after release, on the iPhone:** scroll from the hero into Work; the top
   band should turn paper. Safari did not update its bars after a theme switch or the
   Drawing stage in the simulator (programmatic changes only); finger input may differ.
2. Known limits: the 404's bottom band takes its CSS sea (`#0d3a44`), rendered `#1b4e54`;
   no-GPU hero bars use the plate's unshaded colours; Squall seas' bottom is ~14 levels
   lighter than the band.
3. Test workbench direction; then phase 5 (water motion) and the dev sky preview's
   removal. Repo priorities: [follow-ups.md](follow-ups.md).

## Open items

- Shared temp folders the agent may not clean: 360 stale `/private/tmp/maxsash*` files
  (44 MB) and three Chrome profiles from 10 October in `$TMPDIR/maxsash-*` (159 MB).
- Owner decision: five ignored `tools/.out/` files not in git (early logo drafts in
  `start/`, scratch `diagnose.mjs`, `contour-diagnosis.mjs`). Keep elsewhere or delete.
- Turbopack also emits a raw copy of the worker source under `/_next/static/media/`.
- Owner release, real social previews, physical devices, private-system evidence, Vercel
  rate limits and follow-ups.md remain.

## Suggested commit

```
fix: match phone browser bars to the page

Safari 26+ ignores theme-color and tints its bars from the first plain
background colour at a stuck element's edge, else the body, so every page
showed cream above the blue hero. The hero now declares its measured sky
and sea edge colours, whole-page error seas are sticky, the Notebook and
plate bodies keep their paper, and ThemeColor keeps theme-color on the
same rule for other browsers. The theme is now applied before the first
paint, because Safari reads its colours once around load; night visitors
also lose the day-to-night flash.

Verified on an isolated production build (types, lint, format, 145 Node
tests, bars, sky theme, keyboard, SEO, headers, software fallback,
creative) and by hand in iOS 26.5/27 Safari simulators, day and night.
Not verified: real devices and finger scrolls.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
