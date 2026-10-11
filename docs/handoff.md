# Handoff — start here

Updated 11 October 2026, night. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 73fa720, which is also `production`. The owner staged the icons/card step; everything
since (Organization data, socials, the sea studio's own page) is unstaged on top of it.

## Current work

**Staged: icons and share card.** Icons recoloured to chart ink `#10303A` + cream `#F5F0DF`
(same geometry); default card `public/images/studio-card-v1.jpg` (live hero, 117 KB) in
`site.shareImage`; `app/manifest.ts` with 192/512/maskable icons; `theme-color` from
`site.colors`; unreferenced `public/mark.svg` deleted; `check-seo` checks card size and manifest.

**Unstaged: studio profiles, socials and `/sea`.**

- Profiles (owner): LinkedIn Page `/company/maxsash`, Instagram `@maxsashstudio`, WhatsApp
  username `@maxsash` (`https://wa.me/maxsash` opens "Chat on WhatsApp with @maxsash"; no
  number). Founded June 2026; WhatsApp hours Monday–Friday 9–5 (the owner said "9 to 5";
  weekdays assumed).
- Home graph: Organization `#studio` (logo, email, `foundingDate` 2026-06, founder `#yash`,
  `sameAs` LinkedIn Page and Instagram); WebSite publisher is the studio.
- Socials: Contact adds "Or message @maxsash on WhatsApp ↗"; the shore lists email, WhatsApp,
  Instagram, LinkedIn Page plus a colophon link "The sea studio ↗"; the Notebook footer lists
  the three channels. Portfolio, personal LinkedIn and GitHub now live only in About.
- Sea studio moved to `/sea` (owner chose this after visitors needed it explained in person).
  `components/PageShell.tsx` (header, main, shore; `--page-gutter`) now frames case studies and
  `/sea`. Studio heading "Make your own sea." with a plain paragraph and three steps; the
  "sailing" pill is gone; "Sail this sea →" opens home with the seed. Hero "Make your own →",
  plate links and sitemap point to `/sea`. Checks moved with it (testing.md).
- Gull (owner approved after a measured check): waits 2 s instead of 3; on skies wider than a
  phone it drops in from just above the top edge (`arrivalEntry` in `flight.ts`), so desktop
  flight is 2.3 s instead of 3.9 s. Phones unchanged. See decisions.md, Feedback.

**Brand kit (outside the repo, `../brand/`, not under git).** Owner's private page
https://claude.ai/artifact/NcRFgKvfm9PBXGaH3ps4w1 (source `../brand/kit/index.html`, version 3):
every LinkedIn, Instagram and WhatsApp image and field, Canva setup, voice, palette. It now has
the real handles, founded year, 9–5 hours, `wa.me/maxsash` as Instagram link 3, and the
LinkedIn Page's current state (name "Maxsash", old tagline, `maxsash.com` without www, a
watercolour logo; read from public HTML because Claude in Chrome tools never appeared).

## Verification

- Final isolated Node 24 build of the full working tree: TypeScript, lint, format, 128/128 Node
  tests, 47 gull layout checks, 78 SEO cases, headers/CSP, keyboard 22/22, sound suite, 191
  creative cases, zero failures and runtime exceptions (studio-plate's 8 cases passed on the
  previous build; the gull change does not touch it). Own server :3019 stopped; worktree removed.
- Looked at `/sea` (1440 and 390), Contact, shore and Notebook footer; the case-study header is
  pixel-identical to live after the PageShell extraction.
- Not checked: `/sea` on a real phone or Safari, real WhatsApp/LinkedIn previews (need the
  release), Save/zip buttons inside the claude.ai viewer, Canva font availability.

## Next

1. Owner: review, commit, release. Then Facebook Sharing Debugger, LinkedIn Post Inspector and a
   WhatsApp message to self for the home page and `/sea`; Rich Results Test on the home page.
2. Owner: fill the profiles from the kit page; renaming the LinkedIn Page to Maxsash Studio is
   recommended for one name everywhere (the URL stays).
3. Then the SEO / LLM-SEO and content step (seo-and-sharing.md).
4. Recapture `public/images/work/business-operations-drawing.webp` now that "Buying" is live.
5. Still open: Search Console inspections, Bing Webmaster Tools, production evidence for private
   systems, real phone/Safari/Firefox/screen-reader checks, Vercel rate limits, follow-ups.md.
6. Housekeeping: 11 old detached worktrees under `/private/tmp/maxsash-*` from earlier sessions.

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

For the unstaged set:

```
feat: give the sea studio its own page and link the studio's profiles

Visitors needed the sea studio explained in person, so it moves from the end of the homepage
to /sea, opening with a plain explanation and three steps; the hero, print page and shore
link to it with the visitor's sea. Case studies and /sea share one page shell. Add WhatsApp
(by username, no number) to Contact, and the studio's WhatsApp, Instagram and LinkedIn Page to
the shore and Notebook footers; describe the studio as an Organization with its logo,
founding date and profiles. The gull now waits 2 s and, on wide screens, drops in from above
the top edge, so its desktop flight is 2.3 s instead of 3.9 s.

Verified in an isolated Node 24 production build: TypeScript, lint, format, 128 Node tests,
47 gull layout checks, 78 crawler/page cases, headers/CSP, 22 keyboard checks, studio plate
and sound suites, and 191 creative records with no failures or runtime exceptions.
```
