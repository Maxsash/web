# Handoff — start here

Updated 15 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
Telemetry 1.1.0 committed as 2264c72 and pushed to origin/main on 15 October, with
annotated v1.1.0 tag. Working tree clean after release commit; own QA artifacts
removed. Production release remains owner’s `git push origin main:production`.
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

## Visitor telemetry — 1.1.0, verified 15 October

Explicit first-party redacted events and bounded PostHog relay. Owner selected no
persistent tracking: visit IDs/pause stay in memory; ordinary Next navigation
joins a journey, reload/new tab/resume starts a new ID. No analytics storage,
SDK/autocapture, replay or profiles. Wizard duplicate SDK path removed; no install
needed. Real token/host remain only in ignored .env under server-only names.
Owner added Vercel Production env with TELEMETRY_ENABLED=true. Dev/Preview disabled.
EU Maxsash Studio project 306242 connected through PostHog plugin. Five pinned
Maxsash dashboards 1024506–1024510 with 21 saved charts execute successfully.
Links: telemetry-setup.md. One schema-0 synthetic event query-visible; no visitor
events yet. Wizard dashboard preserved. Timezone UTC; no account settings changed.
Privacy discloses EU Cloud and plan-based history (free 1 year / paid 7 years),
which is not automatic deletion. Billing tier/quota/alerts remain owner review.
Final isolated Node 24 build/lint/types/format, 159 tests, SEO 78, telemetry 16,
keyboard 22/22, headers/CSP and creative 191 pass; zero runtime exceptions.
Final phone privacy disclosure capture inspected; earlier day/night/desktop
captures inspected. Browser QA intercepted/blocked; no extra live test events.
Chrome port-file startup race fixed in harness. An accidental main-folder harness
attempt failed before browser tests; successful checks ran in isolated worktree.
No physical phone, field metrics, bundle delta or production ingestion verified.
Own QA server/worktree/logs/captures removed. Production /privacy returned 404
before this commit: source has not been released. Owner release is next.
Commit: `feat: instrument visitor journeys without persistent IDs`
Body: Add redacted first-party analytics, memory-only visits/pause and privacy
policy; provision 21 charts across five dashboards before journey segmentation.
Verified Node 24 build/lint/types/format, tests159, SEO78, telemetry16, keys22,
headers and creative191 plus all saved PostHog queries; production pending.
Annotated v1.1.0 tag is pushed and points to 2264c72.

## Next / owner pending

- After owner release, verify schema_version 1 / site_release 1.1.0 in Live events
  and confirm reports populate; review quota/alerts and Vercel rate limits.

0. Release 1.1.0 when ready (owner): `git push origin main:production`, then confirm
   footer v1.1.0, /privacy and telemetry ingestion.
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

- Telemetry QA artifacts removed (14 October); the three old Chrome profiles
  from earlier sessions remain unlocated/unremoved.
- Owner decision on five ignored `tools/.out/` early logo/scratch files remains.
- Turbopack emits a raw worker source copy under `/_next/static/media/`.
- Weathering review servers, worktree, scratch files, captures and sheet removed.
- Android, private-system evidence, real print, field metrics and follow-ups.md remain.
