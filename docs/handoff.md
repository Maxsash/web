# Handoff — start here

Updated 13 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD d803c16 on main (owner committed shared navigation feedback). Tested deployment
confirmed through browser-bar fix; Owner confirms d803c16 deployed; live chunks also contain navigation status. Uncommitted:
owner-report documentation. No commit, push or release performed by the agent.

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
Night sky phases 1–4 built; phase 5 water motion and temporary dev preview removal remain.

## Verification

Existing browser-bar automated/simulator results remain in testing.md. Owner physical
results above are reported evidence, not fresh agent checks. Isolated Node 24 build, lint, types and format pass. Focused navigation checks pass:
delayed keyboard Notebook/day and touch case-study/night, stable link layout, badge
clears on arrival, Reduce Motion icon still. Desktop/day and phone/night captures
inspected and deleted. 145 Node tests, 78 SEO cases, headers/CSP and keyboard 22/22
pass. Creative report: 191 records, zero failures/runtime exceptions. Harness
printed its finished report but lingered; stopped after inspecting report.json.
13 October follow-up: read live sitemap and both essay metadata plus official Vercel,
Google and Bing guides. Owner's later screenshot shows `/home` 404, last crawled
1 October. Source search in app/components/content/lib/public/config found no `/home`
reference; prior live sitemap omitted it. Discovery source unknown; no redirect added.
No fresh local build/tests; no genuine crawler-IP/WAF test.

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
- Live-diagnostic worktree, scratch script and log removed; browser closed.
- Own loopback server stopped. Temporary worktree, build/check logs and captures
  removed. Process inspection found no browsers left from this verification run.
- Android, private-system evidence, real print, field metrics and follow-ups.md remain.

## Suggested commit

```
fix: show feedback while pages open

Confirm slow Notebook and case-study clicks with a shared navigation status,
without shifting content or changing route loading/status behaviour.
Record owner iPhone Air/iOS 27 results and remaining hosting/device checks.

Verified isolated Node 24 production build, lint/types/format, 145 Node tests,
78 SEO cases, headers/CSP, keyboard 22/22, creative 191/191 and delayed
keyboard/touch navigation in day/night and Reduce Motion. Captures inspected.
Owner committed navigation badge separately; deployment identity and navigation
regression remains unresolved after a live Chrome diagnostic. New accessibility pass is owner-reported.
```
