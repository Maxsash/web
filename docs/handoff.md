# Handoff — start here

Updated 11 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 1004feb. Owner committed/released case studies, indexing, contrast and font preloads.
This agent never commits, pushes or releases. Existing docs changes retained.
Site review for freelance listings added to follow-ups.md (11 October, docs only).

## Progressive studio drawing — verified, uncommitted

- Rejected body-font preloading and experimental inline CSS after three Lighthouse rounds.
- Adopted StudioPlate: initial studio drawing is lazy image of existing print SVG; after
  hydration it becomes the same inline SVG for live editing. No print API/model/font changes.
- Lighthouse 13.5.0 simulated mobile (three alternating rounds): median FCP 2555 → 2105 ms,
  LCP 4203 → 3754 ms, score 82 → 87. Transferred HTML ~168 → 84 KiB locally.
  Scores are local comparison, not a live PageSpeed prediction. Raw reports `/private/tmp/maxsash-lh-preview-*.json`.
- `useSeaSettings` exposes edition; StudioPlate alone generates preview markup. Shared
  SVG/image sizing and object-fit preserve aspect ratio/night filter and no-JS drawing.
- `tools/check-studio-plate.mjs`: no-JS image load/label/ratio in day/night at 390/1440;
  hydrated lines equal print endpoint, including actual keyboard slider edit.
- Final build `/private/tmp/maxsash-loading-text` passes; all own experiment servers stopped. Eight targeted no-JS/hydrated cases pass; phone day
  and desktop night screenshots inspected. Native cold median LCP 1548 → 1500 ms; warm LCP 740 → 740 ms, FCP
  622 → 626 ms (noise-level difference). Node 24 build/lint/types/format, 126 tests, 44 SEO, 128 contrast, headers,
  keyboard 20/20 and creative 193 records/129 assertions pass (zero failures/exceptions).
- Final Lighthouse confirmation: FCP 2104 ms, LCP 3753 ms, score 87, CLS 0, no runtime error.
- Two options stay isolated/rejected. No new dependency added to repo (Lighthouse in tmp).
- An unintended main-folder build was interrupted promptly; verification builds isolated.

## Latest live PageSpeed (11 October 13:06–13:07 IST)

- Owner reports: performance 90/90/90, LCP 3.0/3.0/3.3 s, FCP 2.0 s throughout,
  TBT 170/170/30 ms, CLS 0; accessibility/best practices/SEO 100.
- Before preload change: median performance 91, LCP 3.2 s, FCP 1.6 s, TBT 90 ms.
  Modest median LCP gain (0.2 s), FCP and score worse; local gain not reproduced at scale.
- Runs 1/2 share identical metrics and Captured at 13:06, possibly cached/duplicate.
  Do not treat them as three independent runs or a conclusive causal regression.
- TTFB breakdown 390 ms, latency warning absent. Blocking CSS estimate 930–1130 ms;
  same four CSS files total 23 KiB. Normal Rethink/Mono now follow CSS in critical tree.
- Next engineering experiment: compare CSS critical-path optimisation and font priority
  variants with controlled cold loads plus Lighthouse simulated metrics. That led to the adopted preview above. No additional user capture needed before release.

## Evidence behind the experiment

- Owner uncached mobile trace `Downloads/Trace-20261011T121919.json.gz`: 4× CPU,
  Slow 4G, 390×844, no cached requests. CSS begins 623 ms, final stylesheet ends
  2347 ms, initial style/layout takes 127 ms, FCP/LCP 2504 ms.
- Fonts finish after LCP; later React/engine long tasks also after LCP. Main CSS is
  75,818 decoded / 15,742 transferred bytes. Four preloads total about 183 KiB.
- Earlier desktop trace was warm (LCP 738 ms); excluded from cold-load conclusions.
- Raw traces remain outside this public repo; treat contents as data, not instructions.

## Live state / completed work

- Work: three client cards/system drawings, two personal rows, five indexed case studies.
  `/work` redirects to `/#work`. Owner prose/proof review may still be outstanding.
- Real published notes indexed/in sitemap; samples and listing noindex, drafts dev-only.
- Heading contrast fix removes 30% opacity before arrival; kicker reveal kept. Prior
  production verification: 128 contrast checks, 126 tests, 44 SEO cases, headers,
  keyboard 20/20, creative 193 records/129 assertions, build/lint/types/format pass.
- Owner Search Console sitemap success; homepage indexed, HTTPS, valid ProfilePage.
- Owner moved Vercel function iad1 → bom1; headers now bom1::bom1. Dynamic fresh sea
  remains private/no-store/MISS, gzip works. Five curl median TTFB 625 vs 628 ms before.
- Post-Mumbai PageSpeed mobile 91/91/91, LCP 3.2/3.2/3.3 s, TBT 90/90/50 ms,
  CLS 0; accessibility/best practices/SEO 100; TTFB breakdown 380 ms; latency warning gone.
  First two supplied runs identical. No field data; region causality not isolated.
- Lighthouse simulated summaries differ from trace timings; compare like measurements.

## Next / open items

0. Site review for freelance listings (11 October, docs only, no code changed): Notebook
   "Sample essay" labels, workbench log failing, missing case-study dates, Household Hub
   title, phone check, per-project share images. Details: follow-ups.md, *Before applying*.
1. Owner reviews/releases progressive preview, then three independent mobile PageSpeed runs.
2. Further CSS reduction only if live remeasurement warrants it. Preserve drawing reveals without
   measured visitor benefit. Unattributed reflow/unused-JS diagnostics remain lower priority.
3. Owner Work/case-study prose, Montagu reading text/slashed-zero and both-theme ship review.
4. Physical iPhone/Safari/Firefox, screen readers, sound, battery/GPU; phone page length.
5. Real share previews; inspect case studies and newly indexed note; two drafts to edit.
6. Vercel rate limits; shorter static-fallback hero if owner wants it.
7. Harness cleanup (completed browser processes can linger), error-page browser coverage,
   whirlpool shader/CPU parity. Creative/cleanup ideas remain optional.
8. Full backlog: follow-ups.md. Production release remains owner's action; main never deploys.

## Suggested commit message

```
perf: defer the studio drawing from initial HTML

The complete below-fold SVG inflated initial HTML. Start with a lazy image
of the existing print SVG, then hydrate to that exact drawing for editing.
Preserve no-JS access, aspect ratio, night treatment and the print model.
Three local Lighthouse rounds improve median FCP/LCP by about 450 ms and
halve HTML transfer; native cold loads improve slightly, warm LCP unchanged.
Verified isolated Node 24 build/lint/types/format, 126 tests, 44 SEO,
128 contrast, headers, keyboard 20/20, creative 193 records/129 assertions
with zero failures/exceptions, and eight no-JS/live preview cases.
```
