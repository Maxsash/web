# Search, AI discovery and link sharing

Updated: 5 October 2026. User approved this checkpoint and requested commit/push to `origin/main`.
Commit subject: `feat: improve social sharing and search discovery`. No manual
deployment or post-push live verification is included; hosting may deploy on push.

## Completed

- One production origin (`NEXT_PUBLIC_SITE_URL`, default `https://www.maxsash.com`) supplies metadata, canonical URLs, discovery files and JSON-LD.
- Homepage, notebook index and both sample essays have their own Open Graph/Twitter title, description and URL. Essay cards explicitly say sample essay. The existing visually inspected 1200 × 630 PNG remains the shared image, with explicit dimensions and alternative text.
- Next.js 16.2.9 already recognizes WhatsApp, Facebook and Twitter as HTML-limited bots; no custom bot override is necessary. Metadata stays in the head for these crawlers.
- `/robots.txt` allows public crawling, excludes API endpoints and advertises `/sitemap.xml`. The sitemap includes the homepage only: the notebook remains noindex while its writing is sample content. Seed variants canonicalize to `/`.
- Homepage JSON-LD describes the website, Yash, verified external profiles and two real projects using the visible project descriptions. It invents no ratings, credentials or business claims. JSON-LD is escaped for HTML embedding.

## Evidence

- `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` passed. The production build required network access for existing Google font downloads.
- `node tools/check-seo.mjs` against a temporary production server at `127.0.0.1:3010` passed 20 crawler/page combinations: WhatsApp, facebookexternalhit, Twitterbot and Googlebot across the homepage, a seed variant, notebook index and two essays. Checks cover canonical/card URLs, titles, descriptions, image dimensions/alt, card type, index/noindex and homepage structured-data JSON.
- Discovery files, PNG HTTP/content type and unknown-article 404 also passed. Local output: ignored `tools/.out/seo/report.json`. The temporary server was stopped after checks.
- Read-only live checks: `https://maxsash.com` returns 307 to `https://www.maxsash.com/`, which returns 200. Existing live WhatsApp HTML includes Open Graph/Twitter tags in the head. The public preview PNG returns 200, `image/png`, 209,381 bytes. Live results precede this local change.
- The actual WhatsApp app preview/cache, schema validator, Search Console, indexing, field Web Vitals and AI citations were not tested or claimed.

## AI discovery strategy and next gates

Clear crawlable server-rendered content, accurate entity information, canonical URLs and authentic project evidence are the foundation. Google documents that ordinary SEO practices apply to AI search and that llms.txt neither helps nor harms Google visibility: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

No speculative ranking promises or AI-specific schema were added. An llms.txt file is not part of this checkpoint. The main content already renders on the server; the GPU sea is decorative, not the sole source of project facts.

After deployment: check fresh WhatsApp shares of the homepage and both essay URLs; verify Search Console ownership and submit the sitemap; inspect canonical/indexing status. Hosting should use a permanent apex-to-www redirect if configurable (current live redirect is 307; hosting configuration was not changed). Replace sample writing with approved original essays before enabling notebook indexing and adding those URLs to the sitemap. Original case studies and authored explanations are the next content work; do not invent them.
