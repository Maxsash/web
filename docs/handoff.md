# Handoff — start here

Updated 11 October 2026, evening. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 73fa720, which is also `production` (the owner released the essays and drawing-label work).
The owner staged the icons/card step; the Organization data below is unstaged on top of it.

## Current work — brand, icons, share card and social profiles

The owner asked for on-brand icons, metadata and share image, and images and copy for the
LinkedIn Page, Instagram and WhatsApp Business, as a brand identity to carry into Canva.

**Website (staged by the owner)**

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

- Live-sea captures + HTML templates in the site's fonts → `export/` per platform (README there).
- Owner's private page https://claude.ai/artifact/NcRFgKvfm9PBXGaH3ps4w1 (source
  `../brand/kit/index.html`, Save buttons via `downloads`): brand lines, logos, palette, type,
  voice; every LinkedIn, Instagram and WhatsApp image and field (counts within limits); Canva
  setup and backgrounds. Copy reuses site lines and approved figures; no phone number.

**Profiles (owner, 11 October):** LinkedIn Page `linkedin.com/company/maxsash`, Instagram
`@maxsashstudio`, WhatsApp Business username `@maxsash`. Both web URLs resolve. The kit page now
uses them (version 2).

- **Organization data (unstaged):** `site.links.studioLinkedin`, `site.links.instagram` and
  `site.logo` in `content/site.ts`; the home graph gains an Organization `#studio` (logo, email,
  founder `#yash`, `sameAs` both profiles) and the WebSite names it publisher; the manifest's
  512 icon reads `site.logo`; `check-seo` asserts the Organization.
- **LinkedIn Page today** (public HTML, since Claude in Chrome tools never appeared here): name
  "Maxsash", tagline "Independent software studio.", website `https://maxsash.com`, a watercolour
  beach logo, no overview, specialties, founded year or cover. Industry, 1 employee and Self-Owned
  are right. The kit lists the changes; renaming the Page to Maxsash Studio is the owner's call.

## Verification

- Twice (icons/card, then with the Organization), each in a fresh scratchpad worktree with
  `rsync --delete`: Node 24 webpack build, TypeScript, lint, format, 126/126 Node tests, 66 SEO
  cases (new assertions included), headers/CSP, keyboard 20/20, 193 creative cases with zero
  runtime exceptions. Own server :3019 stopped both times; worktrees removed.
- Served head and home graph inspected: theme colours, manifest, card, icons, Organization.
- Every exported image was inspected; profile field counts computed with the page's own
  normalisation, all within limits.
- Not checked: real WhatsApp/LinkedIn/Facebook previews (need the release), phone home-screen
  install, Save/zip buttons inside the claude.ai viewer (needs a viewer click), Canva font
  availability, handle availability.

## Next

1. Owner: review, commit, release. Then Facebook Sharing Debugger (Scrape Again), LinkedIn Post
   Inspector and a WhatsApp message to self for the home page.
2. Owner: fill the profiles from the kit page. Open decisions there: rename the LinkedIn Page to
   Maxsash Studio, founded year, WhatsApp hours, whether the number may show on Instagram.
3. Optional, owner's call: visible links to the LinkedIn Page and Instagram (the shore is the
   natural place; About's links belong to Yash). Not done, as it changes the approved layout.
4. After release: Rich Results Test on the home page (Organization, ProfilePage), then the
   SEO / LLM-SEO step in seo-and-sharing.md. Claude in Chrome (`/chrome`) would allow checking
   the profiles directly.
5. Recapture `public/images/work/business-operations-drawing.webp` now that "Buying" is live.
6. Still open from before: Search Console inspections, Bing Webmaster Tools, production evidence
   for private systems, real phone/Safari/Firefox/screen-reader checks, Vercel rate limits,
   and follow-ups.md.
7. Housekeeping: 11 old detached worktrees under `/private/tmp/maxsash-*` from earlier sessions
   (`git worktree list`); remove them when no longer needed.

## Suggested commit messages

For the staged set:

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

For the unstaged Organization data:

```
feat: describe the studio and its profiles in structured data

Add Maxsash Studio as an Organization on the home page, with its logo, email, Yash as founder,
publisher of the website, and its LinkedIn Page and Instagram as sameAs profiles, so search
engines can tie the site to the new profiles. Keep the logo path in one place for the
manifest and the check.

Verified in an isolated Node 24 production build: TypeScript, lint, format, 126 Node tests,
66 crawler/page cases (asserting the Organization), headers/CSP, 20 keyboard checks and 193
creative records with no runtime exceptions.
```
