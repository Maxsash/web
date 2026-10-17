# Handoff — start here

Updated 17 October 2026. Read [AGENTS.md](../AGENTS.md) (the rules, the document map and the
record), then only the documents the task needs. Tasks: [follow-ups.md](follow-ups.md);
upkeep runs: [log.md](log.md).

## Current state

1.1.0 is live (deployed 14 October 18:55 UTC; production analytics ingestion verified at
19:07 UTC). `main` never deploys; releasing is the owner's action. The owner's iPhone report
and every check's latest result are in [testing.md](testing.md).

On 15 October, at the owner's request, `main` gained the documentation review (three
commits) and then three more: the ghost photo, [blog-ideas.md](blog-ideas.md), and
`tools/image-metadata.test.mjs`. No version bump: nothing a visitor reaches changed (the
photo is not linked yet).

## Image metadata scrub (history rewritten)

The owner asked that no committed image carry identifying metadata, history included. The
current tree was clean. History was not: older `public/images/cover.png` and
`cover-compressed.png` had XMP with the owner's name as author and Canva user, brand and
document IDs; two older `app/apple-icon.png` had Canva IDs or a macOS screenshot tag, ICC
profile and capture times. No image had GPS. SVGs, fonts and media were clean; the stock
create-next-app favicon's 62-byte EXIF and NASA's Photoshop history in an old Moon JPEG (only
in local Codex snapshot refs, never pushed) were left.

- `git filter-repo --blob-callback` replaced those five blobs throughout history with
  stripped copies of identical pixels (`magick compare` AE 0). Every commit hash changed,
  `production` and the `v1.0.0` and `v1.1.0` tags included; each ref's tree and commit count
  match the old history. Commit messages were remapped by filter-repo; the one hash cited in
  a file (CHANGELOG's 1.0.0 base, now c794689) was updated by hand.
- `main`, `production` and both tags were force-pushed at the owner's request. GitHub keeps
  old commits reachable by hash until GitHub Support purges them (cached views, any forks).
- New rule in AGENTS.md ("Public repository"): strip image metadata before committing;
  `tools/image-metadata.test.mjs` fails on EXIF, XMP, IPTC, text or time metadata in any
  PNG, JPEG, WebP or ICO under `public/` or `app/` (caught all five planted examples).
- Another clone of this repository (or a Codex worktree) still holds the old history: reset
  it to `origin` rather than pull or merge, or the old commits come back.

Verified on Node 24.21.0: docs and image-metadata tests pass; `pnpm format:check` passes. No
build: no served code changed.

## Visit context and regional replay (uncommitted)

Ready for review as 1.2.0: explicit owner/tester labels and work/read/play interests;
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
Old dashboards unchanged. No account settings, DNS, env flags, commits or deployment changed.
Before release, the owner must enable `REPLAY_ENABLED=true`, verify provider terms/DPA status,
and confirm a real recording with 30-day retention. Tasks: [follow-ups.md](follow-ups.md).

Suggested feature commit: `feat: add regional replay and persistent privacy controls`.
Body: Add self-declared visit context, an expiring India replay rule and voluntary testing.
Let visitors correct geolocation and save recording refusal without identity. Offer voluntary
Start through footer settings with no arrival prompts. Stop capture
before policy changes; keep recordings masked and enforce expiry during startup/uploads.
Verified: isolated production build, types/lint/format, 170 Node tests, replay 37, telemetry
16, SEO 78, keyboard 22, headers, creative 191 and phone privacy controls. Version 1.2.0;
suggested tag after commit: `git tag -a v1.2.0 -m "Release 1.2.0"`.

## Next

1. Owner, optional: ask GitHub Support to purge the old commits' cached views.
2. In Noether's repo (not edited from here): tick "web: adopt the record"; its open item about
   web's "test workbench" line is resolved.
3. Noether will show `testing` and `code` as never run; the first full run refreshes testing.md.
4. Then the top of [follow-ups.md](follow-ups.md): the owner's PostHog and Vercel review,
   indexing outcomes, the iPhone navigation report.
