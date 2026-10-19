# Handoff — start here

Updated 19 October 2026. Read [AGENTS.md](../AGENTS.md) (the rules, the document map and the
record), then only the documents the task needs. Tasks: [follow-ups.md](follow-ups.md);
upkeep runs: [log.md](log.md).

## Current state

1.4.2 is live (`982e42e` on `main` and `production`). Its subject line carries a stray "then
run git tag…" phrase; it is pushed, so it stays. `v1.4.2` is tagged locally, not pushed.
1.4.3 (LinkedIn cards) is committed on `main` (`bfeb5de`, tagged `v1.4.3`) by the agent at the
owner's request, not pushed. 1.5.0 (seven Notebook notes) is uncommitted, for the owner's
review. Every check's latest result is in [testing.md](testing.md).

## Seven notes for review (1.5.0, uncommitted)

The owner asked for every blog idea written and marked live. `content/posts/02`–`08` are all
`status: published`, dated 19 October, written in the owner's first person from recorded
evidence only (this repo's docs and code, the research report, and the 19 October probes).
Drafts 02 and 03 lost their editor notes; the claims those notes flagged are now hedged or
resolved (bundle order is "my best explanation"; the LCP breakdown is "one run's"; the
function move and the after-fix scores are added). The visitors note covers the brief without
results. Each has a card from `tools/capture-cards.mjs`. Read especially: the voice, the
personal details (Jio, the photo's description) and anything you would phrase differently.

Verified in an isolated build: types, lint, format, 173 Node tests, SEO 120, headers, keyboard
22/22, navigation 3, heading contrast 128, creative 191 without exceptions, no overflow at
390 px. Suggested commit: `feat: publish seven Notebook notes`, body: the list in
CHANGELOG 1.5.0, written from recorded evidence; the checks above. Then
`git tag -a v1.5.0 -m "Release 1.5.0"`.

## Recent changes

- **DNS (live).** Random 5 s+ waits were the Jio route to Vercel's `64.29.17.x` and
  `216.198.79.x`; `www` now points at `cname.vercel-dns.com`, the apex at `76.76.21.21`
  ([details](seo-and-sharing.md#owner-setup)). Ignore Vercel's "DNS Change Recommended".
- **Prefetch (1.4.1).** `PageLink` prefetches only `/blog`, notes and `/work/*`
  (`lib/prefetch.ts`); taps 0.05–0.08 s, ~102 KB per full home scroll.
- **Bing lengths (1.4.2).** Case-study titles drop the studio suffix; four pages get search
  descriptions under 160 characters; `check-seo` enforces both. Velora's Bing "Indexing
  allowed: No" dates from its 13 October crawl, not from the site.
- **LinkedIn cards (1.4.3).** Every case study and note has a 1200 × 630 JPEG card in
  `public/images/cards/`, recaptured sharp at 2× in the Open water palette by the new
  `tools/capture-cards.mjs`; the old WebP cards are deleted. Verified in an isolated build:
  types, lint, format, 173 Node tests, SEO 78, headers, keyboard 22/22, navigation 3,
  creative 191 without exceptions. After release, re-inspect a case study and an article in
  LinkedIn's Post Inspector.

Not yet possible: no real tagged visit or voluntary replay recording has arrived, so UTM
ingestion, contact attribution and production replay ingestion stay unverified.

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

1. Owner: review the seven notes, commit 1.5.0; push `main` and tags `v1.4.2`, `v1.4.3`,
   `v1.5.0`; release; re-inspect cards on LinkedIn; Request indexing for the new notes and for
   Velora on Bing.
2. Once real visits arrive: a tagged Instagram/WhatsApp/LinkedIn visit in the Acquisition
   dashboard, then a voluntary replay recording with 30-day retention. Do not fake visits.
3. Before relying on replay: PostHog provider terms/DPA status.
4. Upkeep: `testing` and `code` have never run (Noether shows them due); `docs` last ran
   15 October.
5. In Noether's repo, tick "web: adopt the record".
6. Then the top of [follow-ups.md](follow-ups.md).
