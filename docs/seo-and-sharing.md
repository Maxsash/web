# Search, AI discovery and link sharing

What is in place, and what only the owner can do. The crawler checks are in
[testing.md](testing.md) (`tools/check-seo.mjs`, 20 cases).

## In place

- **One origin.** `NEXT_PUBLIC_SITE_URL` (default `https://www.maxsash.com`) supplies
  metadata, canonical URLs, discovery files and JSON-LD (`lib/seo.ts`).
- **Per-page cards.** The home page, the notebook index and both essays have their own
  Open Graph and Twitter title, description and URL; essay cards say "sample essay". The
  shared image is the static 1200 × 630 daytime JPEG `/images/living-atlas-day-v1.jpg`,
  with dimensions and alternative text. It was captured from the real renderer; the
  capture script was removed, and the versioned filename makes crawlers fetch it fresh.
- **WhatsApp, Facebook and Twitter** are recognised by Next.js as HTML-limited bots, so
  metadata stays in the head.
- **`/robots.txt`** allows public crawling, excludes the API and points at
  `/sitemap.xml`. **The sitemap lists the home page only**; the notebook stays `noindex`
  while its writing is sample content.
- **Seeds.** `/?seed=…&version=2` canonicalises to `/`. `/plate` is `noindex, nofollow`
  and not in the sitemap. The home page without a seed shows a different sea on every
  request (`private, no-store`); crawlers see varying artwork but identical headings,
  copy, canonical URL and structured data.
- **Structured data.** The home page describes the website, Yash, verified external
  profiles (LinkedIn, GitHub, portfolio), the headshot and the three real projects, using the visible descriptions. It invents no
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

**Search Console:** add a *Domain* property for `maxsash.com`, add the TXT record at the
DNS host, verify, submit `https://www.maxsash.com/sitemap.xml`, then run URL Inspection on
`https://www.maxsash.com/` and request indexing. The sitemap first showed "Couldn't
fetch"; recheck it.

**Before enabling notebook indexing:** replace the sample essays with approved writing,
remove `noindex`, and add the URLs to the sitemap. After a release, check fresh WhatsApp
shares of the home page and both essays (existing message cards may stay cached).

Not tested: the real WhatsApp app preview, a schema validator run, Search Console and
indexing outcomes, and AI citations.
