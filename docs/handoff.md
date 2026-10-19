# Handoff — start here

Updated 19 October 2026. Read [AGENTS.md](../AGENTS.md) (the rules, the document map and the
record), then only the documents the task needs. Tasks: [follow-ups.md](follow-ups.md);
upkeep runs: [log.md](log.md).

## Current state

1.4.0 is live: `production` is at `6bb2115` (`main` is ahead by docs only), and the footer
shows 1.4.0 (the owner checked 19 October). It carries the Open water palette (1.3.0,
[decisions](decisions.md#brand-type-and-colour)) and UTM attribution with the
[Acquisition dashboard](https://eu.posthog.com/project/306242/dashboard/1031898) (1.4.0,
[setup](telemetry-setup.md#tagged-public-links)). Tags `v1.0.0`–`v1.4.0` are all pushed; the
release checks are recorded in `c7fbe73`. Every check's latest result is in [testing.md](testing.md).

## Verified after the release

- 19 October: `check-browser-bars` 30/30 and `check-sky-theme` 12 cases pass on the Mac against an
  isolated 1.4.0 production build. These two had failed only in the 1.3.0 sandbox (identically
  on 1.2.0). Worktree, server and logs removed.
- The owner re-scraped home, a case study and an article in Facebook's Sharing Debugger and
  LinkedIn's Post Inspector, and tested WhatsApp: all show the new cards. LinkedIn renders the
  case-study and article images slightly soft (minor; [follow-ups](follow-ups.md#investigate)).

Not yet possible: no real tagged visit or voluntary replay recording has arrived, so UTM
ingestion, contact attribution and production replay ingestion stay unverified.

## Slow page loads: DNS fixed, prefetch ready for review (1.4.1, uncommitted)

**DNS (done, live).** The random 5 s+ waits were the Jio route to Vercel's `64.29.17.x` and
`216.198.79.x`, not the site ([details](seo-and-sharing.md#owner-setup)). On 19 October the
owner pointed `www` at `cname.vercel-dns.com` and the apex at `76.76.21.21`; the new `www`
addresses then served 480 probe requests without a stall while the old one timed out again.
Ignore Vercel's "DNS Change Recommended" banners: its suggested record is the stalling range.

**Prefetch (1.4.1, uncommitted).** `PageLink` prefetches only `/blog`, notes and `/work/*`
(`lib/prefetch.ts`, tested by `tools/prefetch.test.mjs`); the scattered `prefetch={false}`
props are gone. `check-navigation` now holds requests from before the reload and adds a
prefetch case. Verified in an isolated build: types, lint, format, 173 Node tests, SEO 78,
headers, keyboard 22/22, navigation 3, creative 191 without exceptions; taps 0.05–0.08 s at
4× CPU on 4G and 3G (were 0.5 s and 1 s); a full home scroll prefetches 8 pages for ~102 KB
of data and 10 KB of code. Worktree, server and scripts removed.

**Blog** "My site was fast; the road to it wasn't" is in [blog-ideas.md](blog-ideas.md).

Suggested commits (split by change):

1. `docs/seo-and-sharing.md` and `docs/blog-ideas.md`: `docs: record the DNS fix for slow
   navigation`, body: the probe results above; the blog idea the owner asked for.
2. Everything else: `perf: prefetch the Notebook and case studies`, body: taps 0.05–0.08 s
   (were 0.5–1 s) for ~100 KB per full home scroll; home and the sea studio stay on demand;
   the checks above. Then `git tag -a v1.4.1 -m "Release 1.4.1"`.

## Standing context

- **History rewrite (15 October).** `git filter-repo` replaced five images that carried
  metadata, and every branch and tag was force-pushed. Any other clone or Codex worktree must be
  reset to `origin`, never merged. `tools/image-metadata.test.mjs` enforces stripped images.
- **Replay.** Regional masked replay with persistent refusal; India samples 10% until
  2027-04-30T00:00:00Z. No arrival prompts. Rationale in [replay-review.md](replay-review.md),
  contract in [telemetry.md](telemetry.md#replay-and-country-policy).
- **Owner QA URL:** `https://www.maxsash.com/?studio_visit=owner` (add `&studio_intent=play`).
  Labels appear on events and snapshots, never grant recording, and are excluded from the
  overview source chart.

## Next

1. Owner: review and commit 1.4.1 (above), release, then tap through on the iPhone.
2. Once real visits arrive: a tagged Instagram/WhatsApp/LinkedIn visit in the Acquisition
   dashboard, then a voluntary replay recording with 30-day retention. Do not fake visits.
3. Before relying on replay: PostHog provider terms/DPA status.
4. Upkeep: `testing` and `code` have never run (Noether shows them due); `docs` last ran
   15 October.
5. In Noether's repo, tick "web: adopt the record".
6. Then the top of [follow-ups.md](follow-ups.md).
