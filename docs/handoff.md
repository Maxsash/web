# Handoff — start here

Updated 11 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 8bac0d0 (`feat: bring the case studies onto maxsash.com`). Working tree was clean
at the start of this review. Deployment was not verified; this session made docs-only changes.

## Case studies on maxsash.com (committed; owner content review still listed)

- Why: every Work card sent clients to the GitHub Pages portfolio (written for recruiters),
  and the strongest proof sat only there. Decisions: decisions.md "A card is a hook, the case
  study is the depth" and "The website is for clients, the portfolio for recruiters".
- Owner answers (10 October): Velora brought 5 internship applications and 1 client from an
  enquiry in a single month, all organic, no outreach; business operations onboarded 4
  businesses with teams of 2 to 12; intrusion detection runs at 5 sites over 1.5 years; order
  Velora → Business Operations → Intrusion "for now"; no cross-canonicals with the portfolio.
- Work: Velora lead spread, then Business Operations and Intrusion as cards (plate, headline,
  one summary, proof line, one link); "Of my own" is two compact ruled rows (Wedding, Household
  Hub) linking to their case studies (owner's choice after the length review; decisions.md
  "Three cards, two rows"). The Work footer's Portfolio link is gone (About and shore keep it).
- `/work/<slug>`: head (case study number, headline, summary, proof, facts: For, Role, When,
  Built with, Reading; live or demo link), the plate large, prose from `content/work/<slug>.md`
  (brief, what I built, the decisions that mattered, outcome; 2–3 min), next case study, the
  home Contact section, the shore. Follows day/night. Indexed, in the sitemap, Article JSON-LD.
  `/work` redirects to `/#work`.
- Refactors on the way: `StudioNav` (was `app/blog/BlogNav.tsx`), `components/Prose.tsx` (was
  in `atlas/`, table class passed in), `ProjectPlate`, `JsonLd`, `readingMinutes`.
- Measured on the owner's dev server: Work 3.1 desktop screens (was 3.9 before this work) and
  4.9 on a phone (was 6.1; the drawing is taller than the screenshot on a phone); Contact now
  starts at 5.9 desktop / 8.2 phone screens (was ≈ 9).
- 11 October: Velora stays the lead (owner agreed); its card is now a system drawing like the
  other two, its screenshot moved under the drawing on its case study, and the Work lede says
  "I am a backend engineer first, so the client work is shown as the system underneath". No
  demo links on the personal rows (owner).
- Owner judgement wanted: the case-study prose is drafted in his first person from the
  portfolio facts; read all five (`content/work/`) and edit into his own voice. Also the proof
  wording on each card (`proof` in `content/projects.ts`).
- Review: owner's dev server http://localhost:3000/#work and /work/velora-rights. Screenshots
  in the session scratchpad (new-*.png, phone-*.png).

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
- Next: owner release, inspect case studies and real post; diagnose document latency and
  contrast (need failing elements). Real share previews remain unchecked.
- Build accidentally started in main, stopped; verification moved to isolated worktree
  `/private/tmp/maxsash-seo-check`. Symlink build failed; copied dependencies resolved it.
- Nothing committed, pushed or deployed this session.

## Suggested commit message

```
feat: index published notes and expand SEO coverage

Add approved real writing to search and the sitemap while excluding samples
and drafts. Check every case study and published post across four crawlers.
Record successful Search Console evidence and current PageSpeed results.
Verified so far: Node 24 production build, lint, types, format, 126 tests,
44 SEO crawler/page checks, headers, keyboard 20/20 and creative 193 records
with no failed assertions or runtime exceptions.
```
