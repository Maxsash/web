# Handoff — start here

Updated 11 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 9dbc487 (`feat: index published notes and expand SEO coverage`). The owner committed
the earlier SEO work. Current heading contrast correction is uncommitted; no release by this agent.

## Latest: PageSpeed contrast correction (11 October)

- Owner supplied exact failures: Work headings, About name, Contact title.
- Cause: shared Section kicker reveal dimmed the following h2/h3 to opacity 0.3.
  Original production build reproduces contrast failure (day paper about 1.80:1).
- Removed heading opacity/reveal transition; kicker animation and palette unchanged.
- New `tools/check-heading-contrast.mjs` measures computed foreground/background and
  ancestor opacity for pending/arrived headings, day/night, two widths, reduced motion.
- Node 24 production build in `/private/tmp/maxsash-contrast-check`: 128 contrast
  checks pass (lowest 10.33:1), 126 tests, 44 SEO cases, lint/types/format and headers pass.
  Keyboard 20/20 and creative 193 records/129 assertions pass, no failures/exceptions.
  Servers :3019/:3020 stopped; completed keyboard/creative processes lingered and stopped.
- Report says redirect and compression pass; server response 835 ms. LCP is Math text:
  TTFB 780 ms, render delay 1610 ms. These sum to 2390 ms, not earlier 3500 ms;
  preserve the distinction rather than treating the pasted reports as one exact trace.
- Hero text has no opening animation; sea timings unchanged. Fonts/CSS/startup need tracing.
- Unattributed forced reflow 52 ms and hashed chunk tasks need trace/source mapping;
  no component blamed or performance improvement claimed from those lists alone.

## Next / open items

1. Owner review of Work (three cards, two rows) and the five case studies (day/night, phone),
   if still outstanding; the implementation is already committed.
2. Owner judgement still open from the type sprint: essay paragraphs in Montagu Slab (switch
   `.readingCopy` to Rethink Sans if heavy); the slashed zero; ship review in both themes.
3. Physical iPhone/Safari/Firefox checks: ship/gull, stage controls, studio, sound,
   screen-reader notices and battery/GPU behaviour. Review phone page length too.
4. Performance/hosting: diagnose latest PageSpeed latency and contrast, decide function region,
   consider a shorter static-fallback hero, and add the recorded Vercel rate limits.
5. Search: sitemap success confirmed; inspect case-study indexing and the real post
   after release (the sitemap now has seven entries); real share previews, perhaps an image per case study.
6. Content: edit/publish two drafts, replace sample essays before enabling indexing.
7. Engineering: investigate browser harness processes lingering after completion;
   add error-page browser coverage and whirlpool shader/CPU parity coverage.
8. Optional creative backlog: Notebook treatments, night SVG colours, stars/birds,
   feedback refinements and Easter eggs. Code cleanup step 6 remains ideas only.
9. Owner handles release through production; main never deploys. Full backlog:
   [follow-ups.md](follow-ups.md).

## Verification (case studies)

- Node 24 production build, no warnings (worktree /private/tmp/maxsash-cases-review, server
  :3016 started and stopped in the case-study session), rerun after the rows change and Velora's drawing;
  lint, types, format; 126 Node tests; 28 SEO cases;
  headers; keyboard 20/20; creative 193 records, 129 assertions, 0 failed, 0 exceptions.
  (The last server run failed only the old drawing count; after replacing it, the 118
  offline tests pass and `sea-api` had passed in that run.)
- Not run: ship, gull, software fallback, sound. Not verified: physical devices, screen
  readers. Logs: /private/tmp/maxsash-cases-*.log. Details in testing.md.

## SEO and indexing (11 October 2026)

- Owner confirms sitemap success; screenshot confirms homepage indexed, HTTPS, valid ProfilePage.
- Published real posts now indexable and in sitemap; currently the half-works article.
- Samples/listing stay noindex; drafts stay dev-only. Sitemap now seven URLs.
- SEO harness expanded to all five case studies and all published posts, four crawlers,
  exact sitemap membership and explicit robots assertions. 44 SEO cases and 126 Node tests pass;
  build, lint, types and format pass; headers, keyboard 20/20 and creative 193 records
  (zero failed assertions, zero exceptions) pass. Server :3018 stopped; completed creative
  process lingered and was stopped.
- Owner PageSpeed: mobile 85 (LCP 3.5 s, TBT 190 ms), desktop 97 (LCP 0.7 s),
  accessibility 97 (contrast), SEO/best practices 100; CLS 0, no field data.
- Owner reports SEO updates submitted; waiting for search changes to reflect.
- Next: verify contrast fix, cold/warm server latency and LCP text render-delay trace.
  Real share previews remain unchecked.
- Build accidentally started in main, stopped; verification moved to isolated worktree
  `/private/tmp/maxsash-seo-check`. Symlink build failed; copied dependencies resolved it.
- Nothing committed, pushed or deployed this session.

## Suggested commit message

```
fix: keep section headings readable before arrival

The kicker reveal dimmed following headings to 30% opacity and failed
contrast before scrolling. Keep heading text fully opaque while retaining
the kicker reveal. Add browser coverage across themes and arrival states.
Verified on isolated Node 24 production: 128 contrast checks (baseline fails),
126 tests, 44 SEO cases, headers, keyboard 20/20, creative 193 records with
no failures/exceptions, build, lint, types and format. No fresh PageSpeed run.
```
