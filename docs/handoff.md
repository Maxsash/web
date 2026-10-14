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

## Image metadata scrub (history rewrite pending)

The owner asked that no committed image carry identifying metadata, history included. The
current tree was clean. History was not: older `public/images/cover.png` and
`cover-compressed.png` had XMP with the owner's name as author and Canva user, brand and
document IDs; two older `app/apple-icon.png` had Canva IDs or a macOS screenshot tag, ICC
profile and capture times. No image had GPS. SVGs, fonts and media were clean; the stock
create-next-app favicon's 62-byte EXIF was left (not the owner's).

- Stripped copies of those five blobs exist with identical pixels (`magick compare` AE 0).
  Replacing them throughout history (`git filter-repo --blob-callback`) changes every commit
  hash, including `production` and the `v1.0.0` and `v1.1.0` tags. The agent's permission
  check blocked the rewrite in this repository; a rewritten mirror was made in the agent's
  scratchpad but not verified. It waits on the owner's go-ahead.
- New rule in AGENTS.md ("Public repository"): strip image metadata before committing;
  `tools/image-metadata.test.mjs` fails on EXIF, XMP, IPTC, text or time metadata in any
  PNG, JPEG, WebP or ICO under `public/` or `app/` (caught all five planted examples).
- After the rewrite, the remote keeps the old history until a force push of `main`,
  `production` and both tags. Even then GitHub keeps old commits reachable by hash until
  GitHub Support purges them (cached views and any forks).

Verified on Node 24.21.0: docs and image-metadata tests pass; `pnpm format:check` passes. No
build: no served code changed.

## Next

1. Owner: approve the history rewrite and force push (above).
2. In Noether's repo (not edited from here): tick "web: adopt the record"; its open item about
   web's "test workbench" line is resolved.
3. Noether will show `testing` and `code` as never run; the first full run refreshes testing.md.
4. Then the top of [follow-ups.md](follow-ups.md): the owner's PostHog and Vercel review,
   indexing outcomes, the iPhone navigation report.
