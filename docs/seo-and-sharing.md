# Search, AI discovery and link sharing

Updated: 5 October 2026. User approved this checkpoint and requested commit/push to `origin/main`.
Commit subject: `feat: improve social sharing and search discovery`. No manual
deployment or post-push live verification is included; hosting may deploy on push.

## Completed

- One production origin (`NEXT_PUBLIC_SITE_URL`, default `https://www.maxsash.com`) supplies metadata, canonical URLs, discovery files and JSON-LD.
- Homepage, notebook index and both sample essays have their own Open Graph/Twitter title, description and URL. Essay cards explicitly say sample essay. The shared image is now the visually inspected 1200 × 630 daytime Living Atlas JPEG (`/images/living-atlas-day-v1.jpg`), with explicit dimensions and alternative text. This replaces the old flat-wave artwork.
- Next.js 16.2.9 already recognizes WhatsApp, Facebook and Twitter as HTML-limited bots; no custom bot override is necessary. Metadata stays in the head for these crawlers.
- `/robots.txt` allows public crawling, excludes API endpoints and advertises `/sitemap.xml`. The sitemap includes the homepage only: the notebook remains noindex while its writing is sample content. Seed variants canonicalize to `/`.
- Homepage JSON-LD describes the website, Yash, verified external profiles and two real projects using the visible project descriptions. It invents no ratings, credentials or business claims. JSON-LD is escaped for HTML embedding.

## Daytime banner correction — 5 October 2026

The initial SEO checkpoint (`32f9815`) retained the old banner artwork. The user
requested replacement with the daytime site theme and explicitly authorized
commit/push. Commit subject: `fix: refresh social banner with daytime Living Atlas`.

The new card captures the real homepage WebGL2 sea, sailboat, sun and site fonts.
Capture-only layout removes interactive controls, enlarges the studio identity
and adds the domain. These styles do not change the public homepage. The theme
is explicitly day regardless of system preference. The image is a static JPEG,
1200 × 630, 198803 bytes, visually inspected after compression. It uses a new
versioned filename so new crawler fetches do not reuse the old image URL.
Existing WhatsApp message cards may remain cached; no actual app refresh is claimed.

Regenerate with a local production server and
`node tools/build-living-atlas-cover.mjs`; requires Chrome and ImageMagick. The
script uses an isolated browser profile, waits for fonts and the real renderer,
pauses the sea before capture and closes Chrome/removes its temporary profile.
The rendered wave moment may vary slightly between captures.

Fresh validation: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` and
`node tools/check-seo.mjs` pass. All 20 crawler/page cases point both Open Graph
and Twitter images to the new JPEG, which returns HTTP 200 with `image/jpeg`.
Dimensions verified with `sips`; day/WebGL2/high renderer confirmed in ignored
`tools/.out/seo/cover-report.json`. Production QA server stopped after checks.
No manual deployment or post-push live/app verification is included.

## Initial SEO checkpoint evidence

- `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` passed. The production build required network access for existing Google font downloads.
- `node tools/check-seo.mjs` against a temporary production server at `127.0.0.1:3010` passed 20 crawler/page combinations: WhatsApp, facebookexternalhit, Twitterbot and Googlebot across the homepage, a seed variant, notebook index and two essays. Checks cover canonical/card URLs, titles, descriptions, image dimensions/alt, card type, index/noindex and homepage structured-data JSON.
- Discovery files, PNG HTTP/content type and unknown-article 404 also passed. Local output: ignored `tools/.out/seo/report.json`. The temporary server was stopped after checks.
- Read-only live checks: `https://maxsash.com` returns 307 to `https://www.maxsash.com/`, which returns 200. Existing live WhatsApp HTML includes Open Graph/Twitter tags in the head. The public preview PNG returns 200, `image/png`, 209,381 bytes. Live results precede this local change.
- The actual WhatsApp app preview/cache, schema validator, Search Console, indexing, field Web Vitals and AI citations were not tested or claimed.

## AI discovery strategy and next gates

Clear crawlable server-rendered content, accurate entity information, canonical URLs and authentic project evidence are the foundation. Google documents that ordinary SEO practices apply to AI search and that llms.txt neither helps nor harms Google visibility: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

No speculative ranking promises or AI-specific schema were added. An llms.txt file is not part of this checkpoint. The main content already renders on the server; the GPU sea is decorative, not the sole source of project facts.

After deployment: check fresh WhatsApp shares of the homepage and both essay URLs; verify Search Console ownership and submit the sitemap; inspect canonical/indexing status. Hosting should use a permanent apex-to-www redirect if configurable (current live redirect is 307; hosting configuration was not changed). Replace sample writing with approved original essays before enabling notebook indexing and adding those URLs to the sitemap. Original case studies and authored explanations are the next content work; do not invent them.

## User-side setup guide — 6 October 2026

Live state read on 6 October (read-only): hosting is Vercel; `maxsash.com`
returns a **307** to `https://www.maxsash.com/`; the registrar's nameservers are
`solar/lunar.dns-parking.com`; `www` is a CNAME to Vercel; `/sitemap.xml` is live.
The user confirmed the homepage WhatsApp preview shows the new banner. Nothing
below has been performed yet.

**Permanent redirect (307 → 308):** Vercel dashboard → project → Settings →
Domains. Find `maxsash.com`, Edit, set "Redirect to" `www.maxsash.com` with
status **308 Permanent Redirect**, Save. Verify: `curl -sI https://maxsash.com`
shows `308` and `location: https://www.maxsash.com/`.

**Search Console:** use a *Domain* property for `maxsash.com`; add the TXT record
at the DNS host (Vercel DNS if nameservers move there, otherwise the registrar's
DNS panel); verify; submit `https://www.maxsash.com/sitemap.xml`; use URL
Inspection on `https://www.maxsash.com/` and request indexing.
