# Maxsash Studio

The front door for everything built under the Maxsash Studio name, plus links out
to the personal site, résumé and writing.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
```

## What to edit

Site copy and destinations live in [`content/site.ts`](content/site.ts): the
site destinations, project cards and outbound links. The Living Atlas homepage
is composed in `app/page.tsx`; its scene styles and renderer live in
`components/observatory/`. The notebook articles live in
[`content/notebook.ts`](content/notebook.ts). Public publication routes live in
`app/blog/`, with their own
layout and styling in `components/atlas/`. Add a project or note at its content
source; keep placeholder/sample status explicit until real content is supplied.

## Generated artwork

The brand mark and legacy vector wave artwork are computed rather than drawn.
Their generated files are committed, so a normal build does not need to run
these tools. The Living Atlas ocean instead uses `lib/sea-edition.ts` and the
procedural renderer; the legacy wave generator is not its geometry source.

| Command | Writes | Why it is generated |
| --- | --- | --- |
| `node tools/build-logo.mjs` | `components/Mark.tsx`, `app/icon.svg`, `public/mark.svg` | The mark's integral is one spine with exact 180° rotational symmetry, and the sail's luff and the hull's stern both ride a single offset of it, so the white channel beside the mast is a constant width. Hand-drawn, none of that stays true. |
| `node tools/build-waves.mjs` | `components/wave-paths.ts` | Each wave band is a Gerstner surface whose component wavelengths all divide the tile exactly, so scrolling the strip by one tile loops with no seam and no drift. |

Re-run `build-logo.mjs` after changing a dial at the top of that file; it checks
the leech, tangent terminals, head daylight, channel width and branch opening.
The sail foot and deck share a gently curved normal offset; the mark is three
filled outlines with real fillets. Re-run
`build-waves.mjs` after changing a band, and it will refuse a steepness that
folds the surface over itself.

`node tools/preview-logo.mjs` writes both grounds at display size and
120 / 56 / 32 / 16px, enlarged junctions, monochrome stamps and actual favicon
tiles. `node tools/render-logo.mjs --pixels` renders that proof and 900px
comparison images using Chrome. `tools/scan.py` compares them by proportion.
Run `node --test tools/geometry.test.mjs` for the geometry regressions.

[`docs/mark.md`](docs/mark.md) is the design record for the mark: what it
means, which relationships are enforced and where, how it was measured, and a
frank list of what is still weak in it.

`node tools/render-logo.mjs --assets` regenerates `app/apple-icon.png`,
`app/favicon.ico` and both social-card PNGs from the same generated mark and
waves. It needs Chrome and ImageMagick; use `CHROME_BIN` for a custom browser
path. `tools/build-cover.mjs` writes the card's page for that step.

## Design tokens

Shared typography and inherited site tokens live in
[`app/globals.css`](app/globals.css). The Living Atlas scene is art-directed in
`components/observatory/Observatory.module.css` and its shaders. The publication
uses scoped ink/bone/vermilion tokens in `components/atlas/Atlas.module.css`; its
identity deliberately differs from the homepage. Existing font files are reused.

## Responsive verification

Use `tools/check-creative-v2.mjs` for current homepage/blog production checks;
commands appear below. It records screenshots, actual loaded assets and specific
browser assertions. See [current validation](docs/creative-v2-validation.md) for
what was actually run and what remains unverified.

[The earlier responsive record](docs/responsive.md) documents the retired vector
home treatment at commit `d10c21a`. Its saved captures are historical evidence,
not qualification of the new homepage; the retired wave-coverage harness has
been removed from the current tree.

## Open follow-ups

Keyboard support, cursor effects and the broader accessibility review are
tracked in [docs/follow-ups.md](docs/follow-ups.md).

## Approved Living Atlas foundation

On **5 October 2026**, the user approved Living Atlas A/B as the foundation and
requested promotion to the actual site, current documentation and a commit.
Start with [the handoff](docs/creative-v2-handoff.md), then the
[ordered plan](docs/creative-v2-plan.md) and
[measured validation](docs/creative-v2-validation.md).

Public routes:

- `/` — Living Atlas sea-to-drawing scene, Work/Elsewhere access and notebook link
- `/blog` — engraved Navigator's Notebook with two labelled sample essays
- `/blog/three-waves-one-sea` — the six-wave study, retaining its original slug
- `/blog/an-integral-under-sail` — the studio mark construction essay
- `/samples` — approved-foundation index and future review entry point
- `/api/sea-edition/print?seed=5ea5cafe&version=1` — reproducible vector engraving

Old observatory/atlas sample URLs redirect to the corresponding public routes.
The earlier Wind/Helm, blog workbenches and voyage were removed. The foundation
commit is authorized; its actual record is in the handoff. Future unselected
experiments remain uncommitted until approved. The user has deployed the
foundation to `maxsash.com`; direct Writing and compact/optimized scroll rendering
are now observable live. Local dev/preview servers were stopped at user request.

Production feedback prioritizes direct Writing navigation and smoothness on
iPhone Air/MacBook Pro. Writing now opens `/blog` directly. Touch/narrow screens
use a smaller rendering budget; physical rechecks remain open. See current
validation for the production/local comparison and exact limits.

Latest selected mobile interaction: Sea → Structure → Drawing, one
stage per vertical swipe or stage button, with gentle smootherstep easing: 1.8 seconds
for Sea → Structure and 600 ms for every other move. The next swipe after Drawing continues
into Work. Desktop remains continuous. Reduced motion uses immediate stills;
no-JS retains the readable native-scroll fallback. The user confirmed the latest
flow feels smooth on iPhone Air Safari; broader device qualification remains open.

Work now lists Household Hub and Wedding Photo Platform, linking their public
demos and portfolio case studies. Elsewhere includes the professional Portfolio.
The user reports the latest staged flow is smooth on iPhone Air Safari.
A new spread composition is under review at `/samples/work` in the working tree;
its route/assets stay uncommitted until selected.

This is a foundation: project spread design, optional sensors, a deeper
mathematical Easter egg and physical-device qualification remain separate tasks.

```bash
pnpm lint
node --test tools/geometry.test.mjs tools/sea-edition.test.mjs
pnpm build
pnpm start --hostname localhost --port 3001
# In another terminal, with that production server running:
SEA_TEST_BASE=http://localhost:3001 node --test tools/sea-api.test.mjs
node tools/check-creative-v2.mjs http://localhost:3001
node tools/measure-routes.mjs --output=tools/.out/creative-home/static-assets.json
```

The browser tool creates its own temporary Chrome profile, removes it on exit,
and leaves public-route screenshots/reports in ignored `tools/.out/creative-home/`.
Earlier prototype evidence remains under `tools/.out/creative-v2/`. It captures
actual loaded JS, including the deferred renderer; `--quick` is only a small
screenshot subset. Physical phone GPU/battery, full accessibility, and field Web
Vitals are separate gates. Read the validation record before repeating checks.

Read-only desktop production diagnostics (isolated Chrome, never phone QA):

```bash
node tools/check-creative-v2.mjs https://www.maxsash.com --diagnose
node tools/check-creative-v2.mjs http://localhost:3005 --diagnose
node tools/check-creative-v2.mjs https://www.maxsash.com --diagnose --native-scroll
node tools/check-creative-v2.mjs http://localhost:3005 --diagnose --native-scroll
```

Run sequentially to avoid competing for GPU time. Diagnostic reports live in
`tools/.out/creative-production-diagnostic/` and `creative-local-diagnostic/`.
Remote diagnostics are restricted to HTTPS `maxsash.com`/`www.maxsash.com`;
the full regression/failure matrix still requires a local server.
`--native-scroll` measures browser-generated wheel/touch gestures through the
sea reveal at desktop/phone viewports, including style/layout totals; reports
use `creative-{production,local}-native-scroll/`. `--scroll` uses programmatic
scroll instead. Neither is physical Safari testing. The user's latest feedback
concerns scrolling specifically; prioritize that check over idle cadence.
