# Handoff — start here

Updated 13 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD b311e52 on main (owner committed cloud-shadow removal notes). Tested deployment
confirmed through browser-bar fix; Owner confirms d803c16 deployed; live chunks also contain navigation status. Uncommitted:
daily atmosphere implementation and its docs/test. No commit, push or release performed by the agent.

## Current state

Owner tested iPhone Air/iOS 27: Safari day/night scrolling and Notebook look good;
touch interactions, gull, rotation, scrolling and sounds work as expected. Pages and
sea studio work well. No exact Safari bar-colour measurement supplied. Homepage sharing
previews for supplied links work in WhatsApp (owner report); LinkedIn warns that a
description should be at least 100 characters. Owner now reports Reduce Motion and all supplied VoiceOver points work well. Page length feels
somewhat long, though not clearly bad; preserve approved stage timings.

**Navigation feedback implemented and locally verified:** shared public PageLink
uses Next useLinkStatus; pending links show a fixed “Opening page…” badge via a body
portal. No layout shift, focus change, fake timer or route loading boundary. Reduce
Motion stops the icon. Notebook/case-study and public error/print return links share it.
See architecture.md and decisions.md. Sound unchanged: owner floated softer wooden
control taps; Notebook paper turns remain appropriate. No sound redesign approved.

**Test workbench remains discussion only:** manifest/common result format and isolated
runner, then CI/protected production, then local review dashboard; no production admin.
Night sky phases 1–4 built; phase 5’s first water pass was rejected and removed.
Temporary dev preview removal remains after owner sky review.

## Verification

Earlier browser-bar/navigation automated results remain in testing.md. Physical
results above are owner-reported, not fresh agent checks. Latest creative verification
is below; navigation’s earlier isolated checks passed and output was removed.
13 October follow-up: read live sitemap and both essay metadata plus official Vercel,
Google and Bing guides. Owner's later screenshot shows `/home` 404, last crawled
1 October. Source search in app/components/content/lib/public/config found no `/home`
reference; prior live sitemap omitted it. Discovery source unknown; no redirect added.
No genuine crawler-IP/WAF test.

## Creative state — 13 October

Daylight options 1 + 2 committed by owner in 56c7195: sparse cirrus/haze/solar
halo and richer sun glitter; prior verification/cleanup recorded in testing.md.

Four-star Dragon Ball and shared sky clouds committed by owner. Cloud sea
shadows and temporary borders were rejected/removed; no replacement approved.
New daily atmosphere uses the India Moon date: three restrained authored moods
vary cloud placement/strength, cirrus, horizon haze, halo and slight daylight
glitter; night shares the cloud field and gains faint haze/star attenuation.
No observed weather, new assets/passes, sea geometry or wake change. Preview
dates and midnight refresh use the same daily recipe.
Isolated Node 24 build, lint, types, format, 147 tests, 78 SEO, headers,
keyboard 22/22 and creative 191 cases pass. Sixteen day/night desktop/phone
date captures (including full Moon) show zero WebGL errors; ten inspected.
No physical phone qualification.

## Next / owner pending

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
3. Google screenshot: `an-integral-under-sail` unknown to Google, no crawl recorded.
   Live sitemap returns 200 with 11 public URLs including all three articles and five
   case studies. Both essays return 200, index/follow and self-canonicals. Owner completed Test Live URL → Request Indexing for all eight previously supplied
   case-study/article URLs. Indexing outcome remains pending; check sitemap last-read/count.
   Prior sitemap submission does not establish article indexing. Owner confirms Bing setup complete and sitemap appears there. Bing crawling/indexing
   outcomes remain pending.
4. LinkedIn description warning: two live essay descriptions under 100 characters;
   copy polish remains open, no metadata change made. VoiceOver/Reduce Motion/Reader.
5. Owner reports all VoiceOver checklist points validated and Reduce Motion works
   well. These are owner results, not an independent accessibility audit.
6. Revisit phone length and wooden sound idea separately from navigation feedback.

## Open items / cleanup

- Shared old temp files/profiles from earlier sessions remain unverified/unremoved;
  prior handoff counted 360 `/private/tmp/maxsash*` files and three Chrome profiles.
- Owner decision on five ignored `tools/.out/` early logo/scratch files remains.
- Turbopack emits a raw worker source copy under `/_next/static/media/`.
- Prior navigation/sky review servers/worktrees/captures removed. Daily atmosphere
  review server, worktree, scratch script, captures and logs removed after checks.
- Android, private-system evidence, real print, field metrics and follow-ups.md remain.

## Suggested commit

```
feat: add gentle daily atmosphere to the sea sky

Give each India day a bounded sky mood shared by daylight and night.
Keep the authored sea and rejected shadow/wake effects unchanged.
Isolated Node 24 build, 147 tests, route/browser checks, lint, types and format pass.
```
