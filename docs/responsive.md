# Responsive layout and animated sea

The mobile pass preserves the generated mark and the maths-and-sea direction.
It changes how the page reflows and how its decorative layers cover the scene.

## Layout decisions

- **Navigation stays available.** Work, Writing and Elsewhere remain visible at
  every width. They form a second row on narrow screens and wrap for enlarged
  text. Three direct links do not need a menu or extra JavaScript.
- **The hero follows its content on mobile and tablet.** Below 64rem, its height
  comes from the header, copy, actions and a reserved scene. It no longer forces
  a full viewport of empty sky or reserves space using phone height. The scene
  is at least 1.45 times the boat width, leaving clearance even during pitching.
  Desktop retains the full-height composition with a bounded text column.
- **The boat fits the usable width.** Its size is capped by the space between
  the gutters and safe areas. Its placement and the wave positions use the same
  scene dimensions. Independent left/right shell margins handle a landscape
  notch without centring content back underneath it.
- **Touch targets have room.** Navigation, card links, wordmarks, writing and
  footer links have at least 44px targets; hero actions have at least 48px height
  and stack when necessary. The home link has one accessible name.
- **Content can reflow.** Grid tracks may shrink, long text can wrap, project
  status rows wrap, and destination descriptions use a full row on phones.
  Card and note descriptions use body-sized text. Secondary light-theme ink
  is darker for readability on sand and sky.
- **Font variables resolve where they are consumed.** Next's font classes now
  live on `html`, alongside the root tokens. Previously the classes were on
  `body`, leaving root font aliases unresolved and producing fallback fonts.

The main layout changes live in `Hero.module.css`, `Sections.module.css`,
`Wordmark.module.css` and `app/globals.css`. The logo generator and its artwork
are unchanged by this pass.

## Why gaps appeared between the waves

Each wave was a finite SVG strip. Adjacent strips drift and heave independently,
so a strip's flat lower edge could become exposed before the next strip covered
it. Increasing overlap at one viewport or animation frame did not guarantee
coverage at other sizes or phases.

Every `.band` now extends its own water colour downward using `::after`, starting
2px inside the SVG's solid bottom edge. The extension is at least the greater
of the large viewport height and the reserved scene height. It moves with the
same heave as the surface, stays in the same stacking layer, and reaches below
the hero. The 2px overlap covers fractional-pixel seams. The sea container clips
only decorative overflow; page overflow is not hidden to disguise layout bugs.

Wave height and vertical placement share a bounded scene scale. At ultrawide
sizes, the SVG still spans the moving strip but stops gaining height. Its affine
horizontal stretch preserves smoothness and periodic endpoints. The three-tile
strip still travels exactly one third of its width; the width remaining after
that translation covers the viewport. Reduced-motion preferences stop heave,
drift and boat movement.

## Follow-up: seat the boat in the water

The previous independent boat animation could leave the keel 32px above the
foreground surface on a 390px phone and 73px above it at 1440px desktop in the
sampled frames. Those offsets read as hovering, even though the mark overlapped
a more distant water layer.

`SeaMotion.tsx` now samples the **rendered near-wave path**, reusing its emitted
curve without shipping a second set of wave coordinates. The boat's anchor is
derived from the generated hull bounds. Its height follows the water at that
anchor with immersion equal to 2% of boat width; its pitch follows a wider span
of the surface, attenuated and limited to ±2.4°. CSS drift, heave and responsive
stretch are included through the SVG's current screen transform. The generator
now asserts that fitted wave control points remain monotone in x, so there is
one surface height at each horizontal position.

A small client controller writes transforms directly, without React renders per
frame. It stops continuous work offscreen, in hidden tabs and for reduced motion;
resize and preference changes reposition the boat. Server-rendered CSS provides
a lower fallback position and shares the foreground heave period. Water-fill
extensions and responsive content layout are preserved. This is a decorative
surface follower, not a fluid or buoyancy simulation.

## Reproducing verification

With the development server running:

```bash
npm run dev
# In another terminal:
node tools/check-responsive.mjs http://localhost:3000
node tools/check-responsive.mjs http://localhost:3000 --no-fill
npx tsc --noEmit
npm run lint
npm run build
```

Use the development server’s advertised hostname: a server started on
`localhost` can reject the HMR connection from `127.0.0.1` before hydration.
The checker now verifies hydration instead of accepting the CSS fallback.

The browser checker requires Node 22 and Chrome, with `CHROME_BIN` available for
custom executable paths. It opens an isolated local Chrome profile and writes
screenshots and JSON reports under ignored `tools/.out/responsive/`. The
`--baseline` option captures current failures without failing the process.

The matrix covers **38 cases** across light/dark themes: widths 320, 360, 390,
430, 600, 768, 820, 821, 1024, 1025, 1440, 1920 and 2560px; short desktop and
phone landscape viewports; 200% root text at 320/390px; and an asymmetric 59px
landscape safe area. Checks cover actual touch/click navigation, 44px target
sizes, overflow/clipping, resolved fonts, boat/copy separation and boat bounds.
Selected viewports are also captured at full page height without changing the
layout viewport, so viewport-relative styles are not distorted by the capture.

The animation probe checks **312 frames** across six widths and both themes:
ten timeline positions plus every high/low combination of the four heaving
layers, including drift endpoints. It probes the transformed SVG fill and its
extension down each sampled screen column, requiring continuous coverage below
the first water surface. It also checks the animated boat against the text and
viewport. It now also waits for the boat controller to initialize, yields two
animation frames after every timeline seek, and requires the hull anchor to
track the actual water fill within 1px of its intended immersion. This is
sampled browser geometry plus visual inspection, not an exhaustive raster proof
for every device and browser.

`--no-fill` is a negative control: it temporarily disables the extension only
inside the test browser. The old gaps must then be detected. This succeeded at
320, 390 and 768px on both grounds; the final coverage check passes with the
extension restored. Normal/reduced-motion renders, TypeScript, ESLint and the
production build pass. Physical iOS/Android hardware was not used for this QA.
