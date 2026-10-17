# Handoff — start here

Updated 17 October 2026. Read [AGENTS.md](../AGENTS.md) (the rules, the document map and the
record), then only the documents the task needs. Tasks: [follow-ups.md](follow-ups.md);
upkeep runs: [log.md](log.md).

## Current state

1.2.0 is live (public page and enabled replay policy checked 17 October 2026). `main` holds
1.3.0, the Open water palette, committed and pushed at the owner's request; production serves
it once the owner releases.
Production event ingestion was last verified 14 October at 19:07 UTC. `main` never deploys; releasing is the owner's action. The owner's iPhone report
and every check's latest result are in [testing.md](testing.md).

On 15 October, at the owner's request, `main` gained the documentation review (three
commits) and then three more: the ghost photo, [blog-ideas.md](blog-ideas.md), and
`tools/image-metadata.test.mjs`. No version bump: nothing a visitor reaches changed (the
photo is not linked yet).

## Open water palette (1.3.0)

The owner replaced "Admiralty chart" on 17 October ([decisions](decisions.md#brand-type-and-colour)).
`globals.css`: band `#1C6894` with cream, mist and sunlight text; ink `#0E3B4E`; accent
`--chart-pennant` `#B13D1A` (was `--chart-magenta`); water `#D6E9F0`; gold `#F2C46B`; night
tinted blue (paper `#0A1B2A`). The plate SVG, shore night water, night browser bar, hero meta
text, icons (rendered in `../brand/`) and `studio-card-v2.jpg` follow. After the release,
re-scrape the home page in Facebook's Sharing Debugger and LinkedIn's Post Inspector.

Verified on Node 24.22 in an isolated copy whose sandbox blocks Google Fonts, so the build used
local copies of the same three faces: build, types, lint, format (only that substitute
`fonts.ts` differs), 170 Node tests, SEO 78, headers, heading contrast 128 (lowest 5.33:1, cream
on the new band), creative 191 with no exceptions, studio plate 8, drawing labels. Keyboard
16/22, browser bars (no-GPU plate) and sky theme (SwiftShader timing) failed identically on an
unmodified 1.2.0 build in the same sandbox; rerun them on the Mac before releasing.

## Image metadata scrub (history rewritten)

On 15 October `git filter-repo` replaced five historical images carrying the owner's name,
Canva IDs or capture times with stripped copies of identical pixels; every hash changed and
`main`, `production`, `v1.0.0` and `v1.1.0` were force-pushed. GitHub keeps old commits
reachable by hash until Support purges them. Any other clone or Codex worktree must be reset
to `origin`, never merged. AGENTS.md now requires stripping metadata, and
`tools/image-metadata.test.mjs` enforces it.

## Visit context and regional replay

Committed as `9b4b8c9` and publicly served as 1.2.0: explicit owner/tester labels and work/read/play interests;
regional masked replay and one footer Privacy & recordings link. Settings offer detected
region, explicit correction and saved automatic-recording refusal, without saved identity.
Stop saves refusal; other tabs/reloads honour it. Storage failure and DNT/GPC disable automatic
replay. Owner reaffirmed rules/preferences first and no arrival prompts. Removed tester-URL
auto-opening; only a visitor’s deliberate footer testing action opens the Start explanation.
If a requirement cannot be met noninterruptively, recording stays off.
India samples 10% until 2027-04-30T00:00:00Z. Expiry ends automatic capture in open/future
visits and leaves voluntary testing available. No post-transition exemption is presumed.
The [review](replay-review.md) records the rationale; the [contract](telemetry.md#replay-and-country-policy)
records region precedence, privacy boundaries and storage. Removed duplicate footer test CTA
and unused regional state. Recorder transitions serialize cleanup before another startup.

Verified on Node 24.21.0 in an isolated production worktree: build, types, lint, format,
170 Node tests; telemetry 16, replay 37, SEO 78, keyboard 22/22, headers and creative 191
records with no runtime exceptions. Replay checks cover no arrival/URL prompts, deliberate
footer opt-in, actual compressed snapshots, masking, IDs, persistent refusal, real second-tab
sync, rapid corrections, storage failure, expiry and voluntary Start after expiry. Previous
phone 390×844 visual/native keyboard checks pass; layout unchanged in this refinement.
Provider traffic was intercepted; production replay ingestion remains unverified.
Temporary verification worktree, server, captures and logs removed.

The sixth PostHog dashboard, Visit context and testing (1025313), has three validated queries.
Old dashboards unchanged. Public policy responds enabled, detects IN from this request and
returns 10% sampling with the expected expiry. Actual production replay ingestion and
provider terms/DPA review remain unverified; see [follow-ups.md](follow-ups.md).
Owner QA URL: `https://www.maxsash.com/?studio_visit=owner`; add `&studio_intent=play`
for declared interest. Labels appear on events/snapshots, not person profiles, and never
grant recording permission. Footer testing offers deliberate voluntary Start.

The replay-configuration docs are committed as `42326fd`.

## Next

1. Owner: review 1.3.0 on a preview or locally, then release it (merge `main` into
   `production`) and tag it: `git tag -a v1.3.0 -m "1.3.0: Open water palette" && git push --tags`.
2. Owner, optional: ask GitHub Support to purge the old commits' cached views.
3. In Noether's repo (not edited from here): tick "web: adopt the record"; its open item about
   web's "test workbench" line is resolved.
4. Noether will show `testing` and `code` as never run; the first full run refreshes testing.md.
5. Then the top of [follow-ups.md](follow-ups.md): the owner's PostHog and Vercel review,
   indexing outcomes, the iPhone navigation report.
