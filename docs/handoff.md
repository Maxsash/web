# Handoff — start here

Updated 15 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
1.1.0 is released: origin/production is a9239cb (deployed 14 Oct 18:55 UTC) and
live telemetry ingestion was verified 14 Oct 19:07 UTC (00:37 IST 15 Oct).
PostHog docs cleanup and the commit-splitting rule (AGENTS.md) were committed
separately at the owner’s request on 15 October; nothing else is pending commit.
Main never deploys. SemVer: AGENTS.md; release history: CHANGELOG.md.

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

Earlier checks: testing.md. Owner’s `/home` 404 has no source reference; no
redirect added. No genuine crawler-IP/WAF test.

## Creative state — 13 October

Committed by owner: daylight cirrus/haze/halo/glitter (56c7195), four-star Dragon
Ball, shared sky clouds and daily atmosphere (0a4a18e, three authored India-day
moods; not weather data). Cloud sea shadows and the first water pass were rejected
and removed; no replacement approved. No physical phone qualification.

## Visitor telemetry — 1.1.0, live

First-party redacted events relayed to PostHog EU project 306242; no SDK, replay,
profiles or persistent IDs. Design: telemetry.md; dashboards and setup:
telemetry-setup.md; checks: testing.md. Production ingestion verified 14 October
19:07 UTC (page_view and section_view, schema 1, redacted). Not checked live:
contact/studio/navigation events, pause, Vercel limits. PostHog project settings
are untouched; its replay/autocapture/heatmap toggles are on but inert.

## Next / owner pending

- Owner: review PostHog quota/alerts and Vercel rate limits; optionally switch off
  the inert project toggles. Let traffic accumulate before reading dashboards.

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

- The three old Chrome profiles from earlier sessions remain unlocated/unremoved.
- Owner decision on five ignored `tools/.out/` early logo/scratch files remains.
- Turbopack emits a raw worker source copy under `/_next/static/media/`.
- Weathering review servers, worktree, scratch files, captures and sheet removed.
- Android, private-system evidence, real print, field metrics and follow-ups.md remain.
