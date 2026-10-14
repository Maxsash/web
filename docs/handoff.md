# Handoff — start here

Updated 15 October 2026. Read [AGENTS.md](../AGENTS.md) (the rules, the document map and the
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

## Next

1. Owner, optional: ask GitHub Support to purge the old commits' cached views.
2. In Noether's repo (not edited from here): tick "web: adopt the record"; its open item about
   web's "test workbench" line is resolved.
3. Noether will show `testing` and `code` as never run; the first full run refreshes testing.md.
4. Then the top of [follow-ups.md](follow-ups.md): the owner's PostHog and Vercel review,
   indexing outcomes, the iPhone navigation report.
