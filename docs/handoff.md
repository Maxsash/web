# Handoff — start here

Updated 10 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 014a375. Ship changes are uncommitted. Nothing committed, pushed or deployed.

## Current state

- Owner asked for a unique, refined ship reflecting the whole website.
- Main hero now has an authored survey cutter in the atlas palette: shaped ink
  hull, rust sheer stripe, brass trim, plank deck, skylight, cockpit and tiller.
- Gaff mainsail, jib, bowsprit and fine rigging give it a distinct silhouette.
  Bone canvas has seams and a sewn rust compass rose on both faces; a narrow
  pennant follows the breeze. GPU cloth movement keeps the fittings rigid.
- Five hull stations sampled at three times soften short chop while following
  long swell. Heel/pitch are bounded; heading and drift are restrained.
  The directional shadow and wake follow the actual ship position and heading.
- Opening placement fits the projected model around actual copy and controls.
  Drawing camera frames the same vessel, keeping its construction legible.
  Enlarged portrait copy uses open water on the left when the right is crowded.
- Approved mobile timings (1.8 s/0.6 s), sea versions, page structure, fallback
  plate and error-page shader defaults are retained. No dependencies/assets added.
- Pure geometry, motion and composition are separate from rendering/lifecycle.
  Removed the obsolete fixed modelMatrix and replaced its ship snapshot with
  meaningful geometry/behaviour checks. Context loss releases the cloth buffer.
- Production review: http://localhost:3014/?seed=70806d5e&version=2
  Detached worktree /private/tmp/maxsash-ship-review, server session 39633,
  left running. Only this turn's port 3014 server was restarted.
  Existing servers 3000/3012/3013 were not stopped.

## Next / open items

1. Owner review of the ship in the main hero, both themes and the drawing reveal.
2. Physical iPhone/Safari/Firefox, screen readers and battery/GPU qualification
   remain unverified. Existing mobile timings stay as approved.
3. Owner chooses commit/release; main never deploys, production does.

## Verification

- Node 24 production build, lint, types, format, 114 Node tests, 20 SEO cases,
  headers, 20/20 keyboard checks and 193 creative records pass.
  No failed assertions, overflow, GL errors or runtime exceptions.
- 36/36 ship browser checks pass: actual geometry clear of text/viewport,
  day/night/Drawing at six sizes from 320 × 568 to 2560 × 1440, 150% text,
  live rotation, reduced motion, pause/resume and native touch-emulated
  intermediate reveal/return. Inspected desktop, phone, landscape and large text.
- Five new pure checks cover finite/nondegenerate triangles, cloth/rigid
  separation, bounded continuous buoyancy, chop damping and composition.
- Full creative suite's Mac GPU desktop sample: 1,801 frames over 30 s,
  p95 16.7 ms, zero long tasks, high quality. Not physical-device evidence.
  Ship-specific browser checks use SwiftShader. Gull/sound suites not rerun.
- All builds/tests ran only in the detached worktree on Node 24.
  Dependencies are local APFS copies of the identical installed node_modules.
- Evidence: worktree tools/.out/ship/ and tools/.out/creative-home/.
  Logs: /private/tmp/maxsash-ship-*.log. Details in testing.md.

## Suggested commit message

```
feat: craft an atlas survey cutter

Replace the basic sailboat with a procedural cutter in ink, rust, brass and
bone canvas. Add useful deck fittings, rigging, compass stitching and restrained
cloth motion. Sample buoyancy across the hull, align its wake and fit both the
opening composition and drawing camera around copy and controls.

Verified on Node 24: production build, lint, types, format, 114 Node tests,
SEO, headers, 20 keyboard checks, 193 creative records and 36 ship checks.
Physical iPhone/Safari verification remains open.
```
