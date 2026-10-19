# Handoff — start here

Updated 19 October 2026. Read [AGENTS.md](../AGENTS.md) (the rules, the document map and the
record), then only the documents the task needs. Tasks: [follow-ups.md](follow-ups.md);
upkeep runs: [log.md](log.md).

## Current state

1.4.0 is live: `main` and `production` are both at `6bb2115`, and the footer on production
shows 1.4.0 (the owner checked 19 October). It carries the Open water palette (1.3.0,
[decisions](decisions.md#brand-type-and-colour)) and UTM attribution with the
[Acquisition dashboard](https://eu.posthog.com/project/306242/dashboard/1031898) (1.4.0,
[setup](telemetry-setup.md#tagged-public-links)). The working tree holds only the docs updates
below. Every check's latest result is in [testing.md](testing.md).

**Missing tags.** Only `v1.0.0`, `v1.1.0` and `v1.3.0` exist. The owner's action:

```bash
git tag -a v1.2.0 9b4b8c9 -m "Release 1.2.0"
git tag -a v1.4.0 6bb2115 -m "Release 1.4.0"
git push origin v1.2.0 v1.4.0
```

## Verified after the release

- 19 October: `check-browser-bars` 30/30 and `check-sky-theme` 12 cases pass on the Mac against an
  isolated 1.4.0 production build. These two had failed only in the 1.3.0 sandbox (identically
  on 1.2.0). Worktree, server and logs removed.
- The owner re-scraped home, a case study and an article in Facebook's Sharing Debugger and
  LinkedIn's Post Inspector, and tested WhatsApp: all show the new cards. LinkedIn renders the
  case-study and article images slightly soft (minor; [follow-ups](follow-ups.md#investigate)).

Not yet possible: no real tagged visit or voluntary replay recording has arrived, so UTM
ingestion, contact attribution and production replay ingestion stay unverified.

## Standing context

- **History rewrite (15 October).** `git filter-repo` replaced five images that carried
  metadata, and every branch and tag was force-pushed. Any other clone or Codex worktree must be
  reset to `origin`, never merged. GitHub keeps the old commits reachable by hash until Support
  purges them. `tools/image-metadata.test.mjs` enforces stripped images.
- **Replay.** Regional masked replay with persistent refusal; India samples 10% until
  2027-04-30T00:00:00Z. No arrival prompts. Rationale in [replay-review.md](replay-review.md),
  contract in [telemetry.md](telemetry.md#replay-and-country-policy).
- **Owner QA URL:** `https://www.maxsash.com/?studio_visit=owner` (add `&studio_intent=play`).
  Labels appear on events and snapshots, never grant recording, and are excluded from the
  overview source chart.

## Suggested commit

Docs only, no version bump:

```
docs: record the 1.4.0 release checks

Production serves 1.4.0. Browser-bars (30) and sky-theme (12) pass on the Mac
against an isolated production build, closing the 1.3.0 sandbox gap. The owner
checked Facebook, LinkedIn and WhatsApp previews; LinkedIn's case-study and
article cards look slightly soft, now a follow-up.
```

## Next

1. Owner: add and push the missing `v1.2.0` and `v1.4.0` tags (above).
2. Once real visits arrive: a tagged Instagram/WhatsApp/LinkedIn visit in the Acquisition
   dashboard, then a voluntary replay recording with 30-day retention. Do not fake visits.
3. Before relying on replay: PostHog provider terms/DPA status.
4. Upkeep: `testing` and `code` have never run (Noether shows them due); `docs` last ran
   15 October.
5. Optional: ask GitHub Support to purge the old commits' cached views; in Noether's repo,
   tick "web: adopt the record".
6. Then the top of [follow-ups.md](follow-ups.md).
