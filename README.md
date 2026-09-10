# Maxsash Studio

The front door for everything built under the Maxsash Studio name, plus links out
to the personal site, résumé and writing.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
```

## What to edit

Almost all of the copy and every link lives in [`content/site.ts`](content/site.ts):
the intro, the nav, the project cards, the writing list and the outbound
destinations. Nothing else reads from it, so adding a project is one entry.

## Generated artwork

Two pieces of the design are computed rather than drawn, because the qualities
that matter about them are numeric. Both write files that **are** committed, so
a normal build never needs to run them:

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

The palette, the type scale and the motion timings are all in
[`app/globals.css`](app/globals.css) as custom properties. Light is a bright
noon offshore, dark is the same water at dusk; the two share one blue ramp.
