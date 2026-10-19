# Handoff — start here

Updated 19 October 2026. Read [AGENTS.md](../AGENTS.md) (the rules, the document map and the
record), then only the documents the task needs. Tasks: [follow-ups.md](follow-ups.md);
upkeep runs: [log.md](log.md).

## Current state

1.4.1 is live: `main` and `production` are at `c881014`, and the footer shows 1.4.1. It adds
prefetching to 1.4.0's Open water palette ([decisions](decisions.md#brand-type-and-colour)) and
UTM attribution ([Acquisition dashboard](https://eu.posthog.com/project/306242/dashboard/1031898),
[setup](telemetry-setup.md#tagged-public-links)). `v1.4.1` is tagged locally but not pushed
(`git push origin v1.4.1`). Every check's latest result is in [testing.md](testing.md).

## Verified after the release

- 19 October: `check-browser-bars` 30/30 and `check-sky-theme` 12 cases pass on the Mac against an
  isolated 1.4.0 production build. These two had failed only in the 1.3.0 sandbox (identically
  on 1.2.0). Worktree, server and logs removed.
- The owner re-scraped home, a case study and an article in Facebook's Sharing Debugger and
  LinkedIn's Post Inspector, and tested WhatsApp: all show the new cards. LinkedIn renders the
  case-study and article images slightly soft (minor; [follow-ups](follow-ups.md#investigate)).

Not yet possible: no real tagged visit or voluntary replay recording has arrived, so UTM
ingestion, contact attribution and production replay ingestion stay unverified.

## Slow page loads: DNS fixed, prefetch live (1.4.1)

**DNS (done, live).** The random 5 s+ waits were the Jio route to Vercel's `64.29.17.x` and
`216.198.79.x`, not the site ([details](seo-and-sharing.md#owner-setup)). On 19 October the
owner pointed `www` at `cname.vercel-dns.com` and the apex at `76.76.21.21`; the new `www`
addresses then served 480 probe requests without a stall while the old one timed out again.
Ignore Vercel's "DNS Change Recommended" banners: its suggested record is the stalling range.

**Prefetch (1.4.1, `c881014`).** `PageLink` prefetches only `/blog`, notes and `/work/*`
(`lib/prefetch.ts`, tested by `tools/prefetch.test.mjs`); the scattered `prefetch={false}`
props are gone. `check-navigation` now holds requests from before the reload and adds a
prefetch case. Verified in an isolated build: types, lint, format, 173 Node tests, SEO 78,
headers, keyboard 22/22, navigation 3, creative 191 without exceptions; taps 0.05–0.08 s at
4× CPU on 4G and 3G (were 0.5 s and 1 s); a full home scroll prefetches 8 pages for ~102 KB
of data and 10 KB of code. Worktree, server and scripts removed.

**Blog** "My site was fast; the road to it wasn't" is in [blog-ideas.md](blog-ideas.md).

## Bing title and description fixes (1.4.2, uncommitted)

Owner chose (19 October): case-study titles drop " | Maxsash Studio" (all ≤ 60 characters);
the home page, Velora, Business Operations and Intrusion Detection get search descriptions
under 160 characters, leaving page text unchanged. `check-seo` now enforces both limits.
Verified in an isolated build: types, lint, format, 173 Node tests, SEO 78, headers, keyboard
22/22, navigation 3, creative 191 without exceptions. Velora's Bing "Indexing allowed: No"
dates from its 13 October crawl; the site served `index, follow` then, so no code caused it
([seo-and-sharing](seo-and-sharing.md#current-state)).

Suggested commit: `fix: fit search titles and descriptions to Bing`, body: Bing flagged
Business Operations' 73-character title and 179-character description; case-study titles
drop the suffix, four pages get descriptions under 160, check-seo enforces both; the checks
above. Tag: `git tag -a v1.4.2 -m "Release 1.4.2"`. The handoff edit marking 1.4.1 released
can go in the same commit or its own `docs:` commit.

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

1. Owner: push `v1.4.1`; review, commit and release 1.4.2; then Bing's Live URL test and
   Request indexing for Velora; tap through the Notebook on the iPhone.
2. Once real visits arrive: a tagged Instagram/WhatsApp/LinkedIn visit in the Acquisition
   dashboard, then a voluntary replay recording with 30-day retention. Do not fake visits.
3. Before relying on replay: PostHog provider terms/DPA status.
4. Upkeep: `testing` and `code` have never run (Noether shows them due); `docs` last ran
   15 October.
5. In Noether's repo, tick "web: adopt the record".
6. Then the top of [follow-ups.md](follow-ups.md).
