# Search, AI discovery and link sharing

What is in place, and what only the owner can do. The crawler checks are in
[testing.md](testing.md) (`tools/check-seo.mjs`, expanded crawler/page matrix; see testing.md for verification).

## In place

- **One origin.** `NEXT_PUBLIC_SITE_URL` (default `https://www.maxsash.com`) supplies
  metadata, canonical URLs, discovery files and JSON-LD (`lib/seo.ts`).
- **Per-page cards.** The home page, notebook pages and five case studies have their own
  Open Graph and Twitter title, description and URL; approved essays carry their own summaries. Screenshot-backed case studies use their
  existing 1200 × 750 covers. Other pages use the static 1200 × 630 daytime JPEG `/images/living-atlas-day-v1.jpg`,
  with dimensions and alternative text. It was captured from the real renderer; the
  capture script was removed, and the versioned filename makes crawlers fetch it fresh.
- **WhatsApp, Facebook and Twitter** are recognised by Next.js as HTML-limited bots, so
  metadata stays in the head.
- **`/robots.txt`** allows public crawling, excludes the API and points at
  `/sitemap.xml`. **The sitemap lists home, the Notebook listing, two approved essays, five case studies
  and published markdown posts**. Drafts do not ship.
- **Seeds.** `/?seed=…&version=2` canonicalises to `/`. `/plate` is `noindex, nofollow`
  and not in the sitemap. The home page without a seed shows a different sea on every
  request (`private, no-store`); crawlers see varying artwork but identical headings,
  copy, canonical URL and structured data.
- **Structured data.** The home page describes the website, Yash, verified external
  profiles (LinkedIn, GitHub, portfolio), the headshot and five real projects, using the visible descriptions. Case studies have
  Article JSON-LD and self-canonicals. It invents no
  ratings, credentials or business claims, and it is escaped for HTML embedding.

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
membership, canonical URLs, cards and robots directives across four crawler agents.

Not tested: the real WhatsApp app preview, a schema validator run, Search Console and
indexing outcomes, and AI citations.

## Review — 11 October 2026

Owner PageSpeed report: mobile performance 85, LCP 3.5 s, FCP 1.8 s, TBT 190 ms,
CLS 0; desktop performance 97, LCP 0.7 s, FCP 0.4 s, TBT 50 ms, CLS 0. Both:
accessibility 97 (contrast), best practices/SEO 100; no field data. Investigate document
latency first (estimated 680–740 ms savings). Follow-up details identify the shared
30%-opacity heading arrival as the contrast cause; corrected locally with 128 passing
contrast checks, awaiting owner release and a fresh PageSpeed audit. The supplied latency
audit passes redirects/compression and reports server response 835 ms. LCP element is
Math text: TTFB 780 ms + render delay 1610 ms (2.39 s total; differs from summary 3.5 s).
Unattributed reflow 52 ms and hashed long-task chunks still need trace attribution.
These are supplied lab results, not a fresh run by this session.
