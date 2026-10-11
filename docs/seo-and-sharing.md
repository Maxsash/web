# Search, AI discovery and link sharing

What is in place, and what only the owner can do. The crawler checks are in
[testing.md](testing.md) (`tools/check-seo.mjs`, expanded crawler/page matrix; see testing.md for verification).

## In place

- **One origin.** `NEXT_PUBLIC_SITE_URL` (default `https://www.maxsash.com`) supplies
  metadata, canonical URLs, discovery files and JSON-LD (`lib/seo.ts`).
- **Per-page cards.** The home page, notebook pages and five case studies have their own
  Open Graph and Twitter title, description and URL; approved essays carry their own summaries. Screenshot-backed case studies use their
  existing 1200 × 750 covers; the two private case studies and the Notebook articles use
  1200 × 630 cards captured from their own drawings (`lib/note-share.ts`,
  `projectShareImage`). Recapture a card when its drawing changes. Other pages use `site.shareImage`
  (`/images/studio-card-v1.jpg`, 1200 × 630, 117 KB): the live hero's sea and cutter with the
  hero's headline, offer and type, rendered by the brand kit (`../brand/`). WhatsApp needs it
  under 600 KB (`check-seo` asserts it). Bump the version in the filename when it changes so
  crawlers fetch it fresh. The old `living-atlas-day-v1.jpg` (earlier type, ship and copy) is gone.
- **Icons and manifest.** SVG, ICO (16–64), Apple 180 and manifest 192/512/maskable icons are
  the mark in cream on chart ink; `theme-color` is chart paper by day and night by night.
- **WhatsApp, Facebook and Twitter** are recognised by Next.js as HTML-limited bots, so
  metadata stays in the head.
- **`/robots.txt`** allows public crawling, excludes the API and points at
  `/sitemap.xml`. **The sitemap lists home, the Notebook listing, the sea studio (`/sea`), two approved essays,
  five case studies and published markdown posts**. `/sea?seed=…` canonicalises to `/sea`. Drafts do not ship.
- **Seeds.** `/?seed=…&version=2` canonicalises to `/`. `/plate` is `noindex, nofollow`
  and not in the sitemap. The home page without a seed shows a different sea on every
  request (`private, no-store`); crawlers see varying artwork but identical headings,
  copy, canonical URL and structured data.
- **Structured data.** The home page describes the website, Yash, verified external
  profiles (LinkedIn, GitHub, portfolio), the headshot and five real projects, using the visible descriptions.
  Maxsash Studio is an Organization (`#studio`): logo `/icon-512.png`, email, founding date
  (`2026-06`), Yash as founder,
  publisher of the website, and `sameAs` its LinkedIn Page (`/company/maxsash`) and Instagram
  (`@maxsashstudio`), both checked to resolve on 11 October 2026. Case studies have
  Article JSON-LD and published Notebook articles have BlogPosting JSON-LD derived from their
  visible title, summary, topic, author, URL and publication date. It invents no ratings,
  credentials, modified dates or business claims, and it is escaped for HTML embedding.

## AI discovery

Clear, crawlable, server-rendered content, accurate entity information, canonical URLs
and real project evidence are the foundation. Google documents that ordinary SEO applies
to AI search and that `llms.txt` neither helps nor harms visibility
(<https://developers.google.com/search/docs/fundamentals/ai-optimization-guide>), so there
is no `llms.txt`, no AI-specific schema and no ranking promise. The GPU sea is
decorative; project facts are in the HTML.

## Owner setup

Hosting is Vercel; `maxsash.com` redirects to `www.maxsash.com` (reported as 308; the
dashboard path is Project → Settings → Domains → Edit `maxsash.com` → redirect to
`www.maxsash.com` with **308 Permanent Redirect**; verify with `curl -sI https://maxsash.com`).

**Search Console:** owner confirms sitemap success on 11 October 2026. The supplied
screenshot confirms home is indexed, HTTPS and one valid ProfilePage. Inspect each case
study: successful fetch, crawling/indexing allowed, self-canonical and Google-selected
canonical matching the www URL. Use Test Live URL for current availability; request indexing
for new or changed pages after release. The real post is now indexable in code and enters
the sitemap; inspect it after the owner releases this change.

**Sharing:** [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
and [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/). Paste the www home,
a case study and the real article. Test WhatsApp in a chat with yourself. Check title,
description and the shared sea image; existing message cards may remain cached.

**Notebook policy:** the listing and approved essays are indexed; published markdown
posts are indexed, while drafts stay development-only. The SEO harness
derives every essay, case study and published post from source content and asserts exact sitemap
membership, canonical URLs, cards, BlogPosting fields and robots directives across Google,
social, Bing and OAI-SearchBot user agents. Bingbot and OAI-SearchBot also receive a substantial
server-rendered `<main>` in the local harness.

Not tested: the real WhatsApp app preview, a schema validator run, Search Console and
indexing outcomes, and AI citations.

## AI discovery review — 11 October 2026

Read-only live requests using OAI-SearchBot user agent returned 200 for robots, sitemap,
home, Notebook listing, wave essay and business-operations case study. This checks a
user-agent string from our network, not verified crawler IP access or Vercel WAF policy.
Live robots allows all public pages and excludes `/api/`. Since the owner's release (checked
11 October, evening) the live sitemap has ten URLs and the essays are `index, follow`. No
indexing/citation outcome verified.

Priority todos:

1. Inspect all ten URLs in Google Search Console and request indexing.
2. Set up Bing Webmaster Tools, submit sitemap and inspect pages. Its AI Performance
   report can measure citations: [official announcement](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/).
3. Inspect hosting logs/WAF for genuine Bingbot and OAI-SearchBot access after release. The local
   matrix covers their supplied user-agent strings and server-rendered initial HTML, but not
   crawler-IP access. Search permission and training permission are separate:
   [OpenAI crawler guidance](https://developers.openai.com/api/docs/bots).
4. Publish firsthand material around actual client questions: decisions behind modules vs
   off-the-shelf software, edge vs cloud alerts, and concrete deployment tradeoffs. Link to
   existing case studies; owner-approved evidence only. Current essays establish craft;
   business-specific material can broaden relevant coverage. Keep structure/layout approved.
5. Monitor indexed pages, relevant enquiries and AI referrals/citations. IndexNow optional
   later for update notification; not needed to make this small site crawlable.

[Google guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
confirms normal SEO and useful original content remain the foundation; Google does not
use llms.txt. Keep the existing no-llms.txt decision. No special AI schema or markdown
mirror is required for Google AI features; other systems may differ.
