# Handoff — start here

Updated 14 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD is the 1.0.0 commit on main (owner asked the agent to commit and push it), tagged
`v1.0.0`. `production` is still at 0a4a18e: releasing 1.0.0 is the owner's
`git push origin main:production`. The site now follows SemVer: every commit that
changes what production serves bumps `package.json` and CHANGELOG.md (AGENTS.md).

## Ship weathering — 14 October (accepted, in 1.0.0)

Owner accepted the used-but-never-damaged cutter: per-triangle surfaces
(`ship-surfaces.ts`) and `ship-weathering.ts` GLSL wear (faded topsides, waterline
line, salt streaks, bleached varnish, tarnished brass, mottled canvas, faded rope),
silvered per-plank deck tones, sail corner patches and a mainsail reef band.
Emblem, pennant, motion and Drawing unchanged. Verification is in testing.md; the
version bump and docs added after it change no rendering code.

## Current state

Owner tested iPhone Air/iOS 27 (owner reports, not agent checks): Safari day/night,
Notebook, touch, gull, rotation, sounds, pages, sea studio, Reduce Motion and all
supplied VoiceOver points work; WhatsApp previews work. Page length feels somewhat
long; preserve approved stage timings. Navigation feedback (shared PageLink pending
badge) is built and verified; see architecture.md. Sound unchanged; softer wooden
control taps only floated. Test workbench is discussion only. Night sky phases 1–4
built; temporary dev sky preview can go after owner sky review.

## Verification

Earlier automated results live in testing.md. 13 October: live sitemap and essay
metadata read; owner's `/home` 404 (crawled 1 October) has no source reference and
no redirect was added. No genuine crawler-IP/WAF test.

## Creative state — 13 October

Committed by owner: daylight cirrus/haze/halo/glitter (56c7195), four-star Dragon
Ball, shared sky clouds and daily atmosphere (0a4a18e, three authored India-day
moods; not weather data). Cloud sea shadows and the first water pass were rejected
and removed; no replacement approved. No physical phone qualification.

## Visitor journey research — 14 October

Owner is exploring Notebook-first casual visits versus Work-first client visits;
no implementation approved. Researched vendor-documented implementations, not live
personalized variants: Saks (Dynamic Yield intent tiers/layout), Jacamo (previous
category/brand affinities), Livestorm/DocSend (Clearbit + Mutiny audience content).
Sources: [Saks](https://www.mastercard.com/global/en/news-and-trends/Insights/2025/saks-fifth-avenue.html),
[Jacamo](https://www.madewithintent.ai/customer-stories/how-jacamo-increased-conversion-rate-by-6-with-multi-session-experiences),
[Livestorm/DocSend](https://clearbit.com/resources/books/drive-website-conversions/personalization-strategies-Livestorm-Dropbox-DocSend).
[Personyze demo](https://www.personyze.com/saas-b2b-personalization-example/) offers
visitor switches; demo interaction not tested. Browser context alone is weak intent
evidence; these examples use behavior/history, enrichment or CRM. No code/build/tests.
Included in the 1.0.0 commit (docs only).

## Next / owner pending

0. Release 1.0.0 when ready (owner): `git push origin main:production`, then confirm
   the footer reads "Release v1.0.0".
1. Investigate owner navigation report: huge Notebook wait; top-left return-home
   appeared unresponsive after repeated taps, owner used Back. d803c16 confirmed live.
   Live Chrome touch diagnostic (390 px, reduced motion, 4× CPU, 150 ms latency,
   180 KB/s, cache disabled) did not reproduce: Notebook RSC ~0.62 s; immediate
   top-left home tap showed badge and reached home in ~0.4 s; no runtime errors.
   This is desktop Chrome emulation, not iPhone Safari. Cause remains unresolved;
   next occurrence needs approximate IST time/page/network and ideally recording,
   then correlate Vercel request logs. No speculative code fix made.
2. Owner confirms Vercel rule published and intended URLs still work (13 October).
   Normal-use smoke check complete; excess-request 429 enforcement not measured.
3. Indexing: live sitemap lists 11 URLs; essays are indexable with self-canonicals.
   Owner requested indexing for all eight case-study/article URLs and set up Bing;
   Google and Bing outcomes pending (check sitemap last-read/count).
4. LinkedIn: two essay descriptions under 100 characters; copy polish open.
5. Revisit phone length and wooden sound idea separately from navigation feedback.

## Open items / cleanup

- `/private/tmp/maxsash*` now matches nothing (14 October); the three old Chrome
  profiles from earlier sessions remain unlocated/unremoved.
- Owner decision on five ignored `tools/.out/` early logo/scratch files remains.
- Turbopack emits a raw worker source copy under `/_next/static/media/`.
- Weathering review servers, worktree, scratch files, captures and sheet removed.
- Android, private-system evidence, real print, field metrics and follow-ups.md remain.
