# Search, AI discovery and link sharing

What is in place, and what only the owner can do. The crawler checks are `tools/check-seo.mjs`
([testing.md](testing.md)); open tasks are in [follow-ups.md](follow-ups.md).

## In place

- **Lengths fit Bing** (owner, 19 October): `<title>` at most 65 characters, description 25–160;
  `check-seo` enforces both on every public page. Case-study titles are `caseStudyTitle`
  without the studio suffix; a project's optional `description` overrides its visible
  `summary` for search, cards and JSON-LD (`searchDescription`).
- **One origin.** `NEXT_PUBLIC_SITE_URL` (default `https://www.maxsash.com`) supplies
  metadata, canonical URLs, discovery files and JSON-LD (`lib/seo.ts`).
- **Per-page cards.** The home page, Notebook pages and five case studies have their own Open
  Graph and Twitter title, description and URL, and a 1200 × 630 JPEG card at
  `public/images/cards/<slug>.jpg` (`projectShareImage`, `lib/note-share.ts`); LinkedIn
  softened the earlier WebP and 1200 × 750 cards. `node tools/capture-cards.mjs <local base>
  blog/<slug> work/<slug>` captures a note's cover or a case study's drawing at 2× with reduced
  motion and fits it on its own edge colour. Screenshot-backed case studies are cut from their
  screenshot by hand (`magick <shot> -gravity north -crop 1200x630+0+0`, or fit with the edge
  colour when a crop would cut text, as for the wedding site). **Publishing a post needs its
  card**, and a card is recaptured when its drawing or the palette changes. Other pages use `site.shareImage` (`/images/studio-card-v2.jpg`, 1200 × 630,
  117 KB): the live hero's sea, cutter, headline and offer, rendered by the brand kit
  (`../brand/`). WhatsApp needs it under 600 KB (`check-seo` asserts it). Bump the version in
  the filename when it changes so crawlers fetch it fresh.
- **Icons and manifest.** SVG, ICO (16–64), Apple 180 and manifest 192/512/maskable icons are
  the mark in cream on chart ink; `theme-color` starts as chart paper and then follows the
  page (architecture.md, Browser bars).
- **WhatsApp, Facebook and Twitter** are recognised by Next.js as HTML-limited bots, so
  metadata stays in the head.
- **`/robots.txt`** allows public crawling, excludes `/api/` and points at `/sitemap.xml`.
  **The sitemap lists home, the Notebook listing, `/sea`, the two essays, five case studies
  and published markdown posts.** `/sea?seed=…` canonicalises to `/sea`. Drafts do not ship.
- **Seeds.** `/?seed=…&version=2` canonicalises to `/`. `/plate` is `noindex, nofollow` and
  not in the sitemap. The home page without a seed shows a different sea on every request
  (`private, no-store`); crawlers see varying artwork but identical headings, copy, canonical
  URL and structured data.
- **Structured data.** The home page describes the website, Yash, verified external profiles
  (LinkedIn, GitHub, portfolio), the headshot and five real projects, from the visible
  descriptions. Maxsash Studio is an Organization (`#studio`): logo `/icon-512.png`, email,
  founding date (`2026-06`), Yash as founder, publisher of the website, and `sameAs` its
  LinkedIn Page (`/company/maxsash`) and Instagram (`@maxsashstudio`), both checked to resolve
  on 11 October 2026. Case studies have Article JSON-LD and published Notebook articles have
  BlogPosting JSON-LD from their visible title, summary, topic, author, URL and date. It
  invents no ratings, credentials, modified dates or business claims, and is escaped for HTML.
- **Notebook policy.** The listing, the essays and published markdown posts are indexed;
  drafts stay development-only. The SEO harness derives every essay, case study and post from
  source content and asserts exact sitemap membership, canonicals, cards, BlogPosting fields
  and robots directives for Google, social, Bing and OAI-SearchBot user agents, including a
  substantial server-rendered `<main>` for Bingbot and OAI-SearchBot.

## AI discovery

Clear, crawlable, server-rendered content, accurate entity information, canonical URLs and
real project evidence are the foundation. Google documents that ordinary SEO applies to AI
search and that `llms.txt` neither helps nor harms
(<https://developers.google.com/search/docs/fundamentals/ai-optimization-guide>), so there is
no `llms.txt`, no AI-specific schema or markdown mirror, and no ranking promise; other systems
may differ. The GPU sea is decorative; project facts are in the HTML. Search permission and
training permission are separate ([OpenAI crawler guidance](https://developers.openai.com/api/docs/bots)).
Bing's [AI Performance report](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)
can measure citations. IndexNow is optional and not needed for a site this small.

## Current state

As of 13 October 2026: the live sitemap lists all 11 public URLs; both essays return 200,
`index, follow`, self-canonical. The owner ran Test Live URL and Request Indexing in Google
Search Console for the eight case-study and article URLs; by 19 October Google showed 9 URLs
indexed (owner). Bing (19 October): Business Operations indexed with title and description
warnings (fixed in 1.4.2); Velora Rights "cannot appear" from its only crawl, 13 October
08:32, "Indexing allowed: No", though the page served `index, follow` then and now. The owner
requested indexing; Bing's Live URL tab shows what it reads today. A Search Console screenshot shows a `/home` 404 crawled on 1
October; nothing in the source or any earlier sitemap references `/home`, so it stays a
genuine 404 unless evidence shows a meaningful old URL. WhatsApp previews work (owner);
LinkedIn warns on the essays' short descriptions.

Not verified: schema validator results, indexing beyond the owner's screenshots, real
crawler-IP or WAF access, AI citations.

## Owner setup

**Domain:** `maxsash.com` redirects to `www.maxsash.com` with **308 Permanent Redirect**
(Vercel → Project → Settings → Domains → Edit `maxsash.com`); verify with
`curl -sI https://maxsash.com`.

**DNS** (Hostinger, owner, 19 October): `www` CNAME `cname.vercel-dns.com`; apex A
`76.76.21.21`. Both draw Vercel's "DNS Change Recommended"; ignore it. Do not take Vercel's "DNS Change Recommended" project CNAME
(`…vercel-dns-017.com`): it resolves to `64.29.17.x` and `216.198.79.x`, which from the owner's
Jio connection stalled requests 2–60 s about every 70 s and killed connections (the random
Notebook and case-study waits). Vercel's ID timestamps showed requests reaching its edge late,
so the loss is on the route. `cname.vercel-dns.com` (`76.76.21.x`, `66.33.60.x`) never stalled;
Vercel says it keeps working. Re-check by pinning one HTTP/2 connection per address and
requesting `/favicon.ico` every 1.5 s for 6 minutes, with `64.29.17.1` as control.

**Sea rate limit** (published by the owner, 13 October 2026; normal use works, 429
enforcement past the budget is unmeasured): Vercel → Project → Firewall → Configure → New
Rule. Rate Limit, Fixed Window, 100 requests per 60 seconds keyed by IP, default 429, for
Request Path starting with `/api/sea-edition` OR equal to `/plate` (not AND). Hobby allows
one rate-limit rule, so the paths share it. To remove grouping ambiguity, use one Request
Path "Is any of" condition (`/api/sea-edition`, `/api/sea-edition/print`, `/plate`) AND the
rate limiter. A starting proposal, not a traffic-qualified threshold.
[Vercel's guide](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

**Search Console:** for each case study and article, check a successful fetch, crawling and
indexing allowed, and the Google-selected canonical matching the www URL. Use Test Live URL
for current availability and request indexing for new or changed pages after a release.

**Sharing:** [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/). Paste the www home, a case
study and an article; test WhatsApp in a chat with yourself. Existing message cards may stay
cached.
