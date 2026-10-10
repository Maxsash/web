# Handoff — start here

Updated 10 October 2026. Read `AGENTS.md`, `architecture.md`, `decisions.md`
and `testing.md`. HEAD `c382aa9`; tree was clean at task start. Changes are uncommitted.

## Current state

- Fixed the owner's reported mobile sea Back and scroll-transition failures.
- Back looked enabled but React suppressed its click because its prop was always
  disabled. React now owns the stage label, Back enabled state and Next text;
  removed the lifecycle's DOM mutations of those controls.
- A swipe at just 5 px of scroll bypassed the transition. Gestures now work while
  at least half the hero is visible; a confirmed transition aligns it to its start.
  Scrolling past Drawing and outside that region stays native.
- Sea → Drawing keeps the approved 1.8 s opening and 0.6 s return. Desktop continuous
  scroll and sea version 1 are unchanged. Direction A main site, B Notebook, C unbuilt.
- Native-touch regressions replace the mocked coarse-pointer media query; Back is
  asserted independently. Baseline failures were reproduced before checking the fix.
- Review: http://localhost:3013, production build in detached worktree
  `/private/tmp/maxsash-mobile-sea-review`, tool server session **85034**, left running.
  The baseline server started here was replaced; no user server was stopped.
- Prior gull worktree `/private/tmp/maxsash-gull-review` was not modified or stopped.

## Next / open items

1. Owner review: Next, Back, swiping after a slight scroll, then scrolling into Work.
2. Physical iPhone and Safari/Firefox remain unverified; also real screen readers.
3. Commit/release only when the owner chooses. Main never deploys; production does.

## Verification

- Node 24 production build, types, lint, format, 109 Node tests, 20 SEO cases,
  headers and 20/20 keyboard checks pass. Creative: 137 records, no failed assertions,
  overflow or runtime exceptions. Required checks completed against the fixed build.
- All 20 targeted mobile assertions pass: native Next/Back taps, reversal during
  opening, swipes from 5 px offset, returning to a partially visible hero, rotation,
  paused/reduced-motion stages, horizontal/multitouch rejection and exit to Work.
- Inspected the phone drawing screenshot; approved reveal timing is checked by
  sampling the actual shader uniform throughout the opening.
- Reports/screenshots: worktree `tools/.out/mobile-sea/` and
  `tools/.out/creative-home/`; baseline `/private/tmp/maxsash-mobile-baseline.json`.
  Check logs: `/private/tmp/maxsash-mobile-{node-tests,seo,headers,keyboard,creative}.log`.
- Two temporary diagnostic scripts were removed; no new dependencies or routes.
- One build was accidentally started in the main folder and immediately interrupted;
  no test ran there. All subsequent builds/checks used the separate worktree.
- No physical-device, Safari/Firefox, sound-listening or field-performance claims.
  Prior gull checks remain in `testing.md`; they were not rerun for this change.

## Suggested commit message

```
fix: restore mobile sea back and swipe transitions

Keep stage controls in React so an enabled Back button accepts taps. Allow stage
swipes from small scroll offsets and align the hero on a confirmed transition,
preserving the approved timings and native scrolling into Work.

Verified on Node 24: production build, types, lint, format, 109 Node tests, SEO,
headers, 20 keyboard checks and 137 creative cases, including native mobile taps
and offset swipes. Physical iPhone and Safari checks remain open.
```

## Persistent constraints

- Never commit/push unless asked; release is the owner's action.
- Build/test only in separate worktrees on Node 24; stop only servers started here.
- Public repo: no personal Gmail, phone, employer name or degrees; invent no outcomes.
