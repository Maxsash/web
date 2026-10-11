# Handoff — start here

Updated 11 October 2026, evening. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 73fa720, which is also `production` (the owner released the essays and drawing-label work).
This step is uncommitted; the owner commits and releases.

## Current work — brand, icons, share card and social profiles

The owner asked for on-brand icons, metadata and WhatsApp share image, plus images and copy for
the LinkedIn Page, Instagram and WhatsApp Business, as a brand identity to carry into Canva.

**Website (uncommitted, in this repo)**

- `app/icon.svg`, `app/favicon.ico` (64/48/32/16), `app/apple-icon.png`, `public/at-anchor.svg`:
  same geometry, recoloured from the old `#0C3D55`/`#F7EFDF` to chart ink `#10303A` + cream `#F5F0DF`.
- Default share card `public/images/studio-card-v1.jpg` (1200 × 630, 117 KB) replaces
  `living-atlas-day-v1.jpg`, which still had the old type, ship and "Software, games, and
  experiments" copy. One source: `site.shareImage` (used by `lib/seo.ts` and `check-seo`).
- `app/manifest.ts` + `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`;
  `theme-color` now `site.colors` (chart paper / night) instead of old-palette blues.
- `public/mark.svg` deleted (unreferenced since 11 September).
- `check-seo.mjs`: card under WhatsApp's 600 KB limit; manifest names the studio; icons are PNG.

**Brand kit (outside the repo, `../brand/`, not under git)**

- Renderer: live-sea captures + HTML templates in the site's fonts → `export/` per platform.
  README there explains every script and how to regenerate.
- Private page for the owner: https://claude.ai/artifact/NcRFgKvfm9PBXGaH3ps4w1 (source
  `../brand/kit/index.html`; `downloads` capability for Save buttons and a client-side zip).
  It holds: seven brand lines, logo files, 12-colour palette, type, voice and usage rules;
  LinkedIn logo, cover, overview (1556/2000), tagline, specialties and personal-profile extras;
  Instagram profile picture, name, bio (132/150), five highlight covers, three launch posts with
  captions and alt text; WhatsApp photo, cover, description (432/512), about, catalog, greeting,
  away, quick replies, labels; Canva Brand Kit steps, brand-voice text and six backgrounds.
- All copy reuses the site's own lines and owner-approved figures. No phone number anywhere.

**LinkedIn check not done.** Claude in Chrome tools never appeared in this session (the owner
said Chrome should be available; ToolSearch found no `mcp__claude-in-chrome__*` tools).

## Verification

- Isolated Node 24 webpack build in a scratchpad worktree (`rsync --delete`), TypeScript, lint,
  format, 126/126 Node tests, 66 SEO cases (new assertions included), headers/CSP, keyboard 20/20,
  193 creative cases with zero runtime exceptions. Own server :3019 stopped; worktree removed.
- Served head checked: new theme colours, manifest link, card URL and alt, new icon links.
- Every exported image was inspected; profile field counts computed with the page's own
  normalisation, all within limits.
- Not checked: real WhatsApp/LinkedIn/Facebook previews (need the release), phone home-screen
  install, Save/zip buttons inside the claude.ai viewer (needs a viewer click), Canva font
  availability, handle availability.

## Next

1. Owner: review, commit, release. Then Facebook Sharing Debugger (Scrape Again), LinkedIn Post
   Inspector and a WhatsApp message to self for the home page.
2. Owner: fill the profiles from the kit page. Decisions listed there: handles
   (`maxsash.studio`, `maxsash-studio`), founded year and organization type, WhatsApp hours,
   whether the business number may show on Instagram.
3. With the final profile URLs: add an Organization node (name, logo, url, founder `#yash`,
   `sameAs` LinkedIn Page and Instagram) to `studioStructuredData`. This opens the SEO / LLM-SEO
   step in seo-and-sharing.md.
4. Connect Claude in Chrome (`/chrome`, or start with `claude --chrome`) and check the Maxsash
   Studio Page against the kit.
5. Recapture `public/images/work/business-operations-drawing.webp` now that "Buying" is live.
6. Still open from before: Search Console inspections, Bing Webmaster Tools, production evidence
   for private systems, real phone/Safari/Firefox/screen-reader checks, Vercel rate limits,
   and follow-ups.md.
7. Housekeeping: 11 old detached worktrees under `/private/tmp/maxsash-*` from earlier sessions
   (`git worktree list`); remove them when no longer needed.

## Suggested commit message

```
feat: bring icons and the share card onto the current brand

Recolour the favicon, SVG, Apple and away icons from the old navy and cream to chart ink
and cream, keeping the mark's geometry. Replace the default share card, which still showed
the old type, ship and copy, with the live hero's sea, cutter, headline and offer. Add a web
manifest with 192, 512 and maskable icons, set theme-color to chart paper and night, and keep
the default card in one place (site.shareImage). Delete the unreferenced mark.svg.

Verified in an isolated Node 24 production build: TypeScript, lint, format, 126 Node tests,
66 crawler/page cases (now with the card's 600 KB WhatsApp limit and the manifest icons),
headers/CSP, 20 keyboard checks and 193 creative records with no runtime exceptions.
```
