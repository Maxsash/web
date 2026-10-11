# Handoff — start here

Updated 11 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD be20ef1. Work is uncommitted; owner commits/releases, production only deploys.
Existing docs edits retained. No commit, push or release by this agent.

## Current work — approved essays and client-facing polish

- Owner approved both original essays: Essay labels, indexed pages and Notebook listing,
  three sitemap additions, current share descriptions. Existing URLs/layouts preserved.
  Two unfinished markdown drafts remain development-only.
- Footer GitHub-log failure now shows only the repository link; loading label retained.
  Hosting token/rate-limit cause was not diagnosed.
- Household Hub headline: “Less to remember.” Shortened after phone screenshot showed
  an orphaned full stop with the first version. Final title build and phone screenshot pass.
- Owner supplied approximate build durations: business operations six months, intrusion
  detection eight months. Displayed as Build time; no invented calendar dates.
  Intrusion detection’s deployment history remains separate.
- Three screenshot-backed case studies use their own existing 1200 × 750 covers for
  Open Graph/Twitter. Two private-system drawing cards remain open. No new assets/deps.
- Metadata/sitemap implementation follows local Next guides; SEO and creative harnesses
  updated for publication. Docs/README updated.

## Verification this session

- Isolated worktree: `/private/tmp/maxsash-publication-check`, Node 24.21.0.
- Production build, lint/types/format pass; 126 Node tests, 44 crawler/page cases, exact
  sitemap, two drafts excluded, screenshot responses, headers/CSP, keyboard 20/20 pass.
- Full creative rerun: 193 records/129 assertions, zero failures/exceptions. First run’s
  three failures were obsolete noindex expectations; corrected and rerun successfully.
- Direct rendered footer checks pass: network failure, non-OK response, loading state.
- Six case-study duration/layout checks pass at 390/1440; no horizontal overflow.
  Notebook phone and case-study phone screenshots inspected. Final shortened title
  rebuild, 44 SEO cases and six layout checks pass; phone screenshot inspected. Full
  creative suite predates only that final copy shortening.
- Logs: `/private/tmp/maxsash-publication-*.log`; reports/screenshots: worktree `tools/.out/`.
- Own production server stopped after verification. No other servers touched.
- An accidental main-folder build was promptly interrupted (exit 130). An isolated
  dependency symlink failed Turbopack; replaced with copied dependencies. No checks
  claimed from failed/interrupted builds. Successful builds needed font network access.
- No live deployment, social-app previews or physical-device checks this session.

## Released performance baseline

- Owner released progressive StudioPlate preview and hero-only font preload.
  Studio initially uses a lazy image from the existing print SVG endpoint, then hydrates
  to the same live inline drawing. Model/API/font assets and no-JS drawing preserved.
- Owner’s latest mobile runs: performance 87/96/95; LCP 2.6 s throughout; FCP median
  1.7 s, CLS 0, other scores 100. First run TBT 330 ms vs 50/140; trace before tuning.
- Body font preloads and experimental inline CSS rejected by measurements. Details in
  decisions/testing docs. No further performance changes in this publication work.
- Owner confirms Mumbai bom1 deployment, sitemap success and homepage indexing.

## Next / open items

1. Owner review/commit/release; test real WhatsApp/LinkedIn previews and request indexing
   for approved essays/listing after release. Three screenshot covers are wired.
2. Two private-system drawing share cards; owner review of case-study prose.
3. Physical iPhone/Safari/Firefox, screen readers, sound, battery/GPU and phone length.
4. Edit two markdown drafts; startup consistency only with trace-confirmed evidence.
5. Vercel rate limits; optional shorter fallback hero; browser harness cleanup, error-page
   browser coverage and whirlpool shader/CPU parity. Full backlog: follow-ups.md.
6. A remains main site, B Notebook, C optional/unbuilt. No new review/sample routes.

## Suggested commit message

```
feat: publish approved essays and polish project discovery

Index approved essays and Notebook, add sitemap entries and remove sample labels.
Use project screenshot share cards, simplify log failures and add owner build durations.
Refine Household Hub headline; keep unfinished drafts development-only.
Verified production build, lint/types/format, 126 tests, 44 SEO cases, headers,
20 keyboard checks, 193 creative records and targeted footer/case-study checks.
```
