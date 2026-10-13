# Handoff — start here

Updated 13 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD a55dd42 on main (owner committed shared cloud depth). Tested deployment
confirmed through browser-bar fix; Owner confirms d803c16 deployed; live chunks also contain navigation status. Uncommitted:
cloud-shadow removal documentation only. No commit, push or release performed by the agent.

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

Four-star Dragon Ball and shared sky clouds committed by owner. Owner rejected
sea shadows as not worth keeping; removed their canopy projection, reflection/body
attenuation and temporary red borders. Three rendering files now match a55dd42
byte for byte. Sky clouds, star/planet masking and approved water remain.
Candidate automated passes did not establish visual value. Border verification
interrupted; no development-border visual check or fresh rollback build/browser
review. Documentation format check passes. Own server stopped; review worktree,
script, captures/build output and logs removed.
No replacement shadow effect approved; daily variation remains a proposal.

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
- Prior navigation/sky review servers/worktrees/captures removed; latest cleanup above.
- Android, private-system evidence, real print, field metrics and follow-ups.md remain.

## Suggested commit

```
docs: record removal of rejected cloud shadows

Restore the accepted sky-cloud rendering and remove shadow/debug-border code.
Rendering files match a55dd42; no fresh rollback build/browser review.
Documentation format check passes; own server and all review output removed.
```
