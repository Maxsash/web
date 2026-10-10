# Handoff — start here

Updated 10 October 2026. Read `AGENTS.md`, `architecture.md`, `decisions.md`
and `testing.md`. HEAD `a63f497`; owner committed the prior mobile stage fix.
Landscape studio changes are uncommitted. Nothing committed, pushed or deployed here.

## Current state

- Owner clarified landscape feedback concerns the lower “Make a sea” studio.
- Existing 32svh preview cap produced a 125 px-tall SVG at 844 × 390; it sat below
  the introduction and letterboxed the full drawing into a wide, shallow frame.
- Implemented two columns for landscape 560–960 px wide and ≤620 px high: introduction,
  settings and keep actions on the left; larger sticky drawing on the right. At
  844 × 390 the full drawing is 270 px tall. Preview height leaves room for its caption.
- CSS uses existing workbench/result wrappers as `display: contents` grid placement.
  No duplicate content, new assets, dependencies, routes or printable SVG changes.
- Portrait keeps its top-pinned drawing; large screens keep the existing workbench.
  The landscape focus scroll margin is 1rem since the drawing sits beside controls.
- Hero framing and the approved 1.8 s/0.6 s mobile transition timings are untouched.
  The committed Next/Back and offset-swipe fixes remain included in verification.
- Review: http://localhost:3013/#sea-studio, isolated production worktree
  `/private/tmp/maxsash-mobile-sea-review`, server tool session **76493**, left running.
  Replaced only the previous server started here; no user server was stopped.

## Next / open items

1. Owner review of the main studio in landscape, including editing and rotation.
2. Physical iPhone/Safari/Firefox and real screen readers remain unverified.
3. Commit/release only when the owner chooses. Main never deploys; production does.

## Verification

- Node 24 production build, lint, types, format, 109 Node tests, 20 SEO cases,
  headers, 20/20 keyboard checks and 193 creative records pass, with no failed
  assertions, overflow or runtime exceptions. Required checks completed.
- All 43 studio assertions pass across five landscape sizes: 568 × 320,
  667 × 375, 740 × 360, 844 × 390 and 932 × 430. They check full SVG transform/size,
  four live sliders, visible unobscured focus/save controls, sticky preview and rotation.
- Focus assertions allow 1 px for native scroll rounding measured at 0.28–0.35 px.
  Screenshots inspected at 568 × 320 and 844 × 390, including editing and night.
- The actual drawing geometry and seed change with edits. Night and live rotation
  pass as well. No claim of physical-device verification.
- Targeted evidence: `/private/tmp/maxsash-landscape/`; full suite outputs live in
  worktree `tools/.out/creative-home/`. Logs `/private/tmp/maxsash-landscape-*.log`.
- Builds/tests for this layout ran only in the separate worktree. Earlier stage-fix
  checks are recorded in `testing.md`; prior gull checks were not rerun here.

## Suggested commit message

```
feat: give the landscape sea studio a split layout

Put the studio introduction, settings and keep actions beside a larger sticky
preview on landscape phones. Preserve the complete printable plate and existing
portrait layout; keep keyboard focus clear of the drawing.

Verified on Node 24: production build, lint, types, format, 109 Node tests, SEO,
headers, 20 keyboard checks and 193 creative cases, including 43 landscape studio
assertions across five sizes, live settings, night and portrait rotation.
Physical iPhone/Safari checks remain open.
```

## Persistent constraints

- Never commit/push unless asked; release is the owner's action.
- Build/test only in separate worktrees on Node 24; stop only servers started here.
- Direction A main site, B Notebook, C unbuilt; no sample routes or review gallery.
- Public repo: no personal Gmail, phone, employer name or degrees; invent no outcomes.
