# Handoff — start here

Updated 9 October 2026. Rewrite (don't append to) the sections below after every step.
Read order: `AGENTS.md` → this file → [architecture.md](architecture.md) →
[decisions.md](decisions.md). Checks and their limits: [testing.md](testing.md). Open
items: [follow-ups.md](follow-ups.md). Cleanup plan: [code-cleanup.md](code-cleanup.md).

**Project:** Maxsash Studio's public site (<https://www.maxsash.com>): a WebGL sea that
resolves into its own maths, project spreads, a notebook, a sea studio where visitors
build and print their own sea, and a shoreline footer. Next.js 16, React 19, TypeScript;
no database, accounts or cookies.

## State

- **Repo:** public, `github.com/Maxsash/web` (an organization; the owner's account is
  `ctrl-alt-yash`). Folder: `/Users/yash/WithAIAssistant/development/maxsashlabs/web`.
- **Branches:** `main` never deploys. `production` is live; the owner releases with
  `git push origin main:production`.
- **Released:** `production` is at `9bd133f` (the WebGL-flag post). Local `main` is one commit
  ahead (`9787313`: notebook newest first, the symbol note as 001, the flag post's own plate);
  not pushed yet.
- **Uncommitted now: the error pages**, built from the owner's picks (decisions.md, "Error
  pages"). Unknown address: "Nothing on the horizon" (glassy sea, one plank). Unknown or draft
  note: "This note was torn out" (ruled paper torn across, the scrap floating below). Bad plate
  link: "That sea can't be drawn" (half engraved, a raft). Page crash: "A rogue wave" (night
  squall, tilted, a raft). Whole site down: "Caught in the storm" (whirlpool, storm clouds,
  soft lightning, a plank circling). Code: `components/drift/` and the five files in `app/`.
  The homepage engine was refactored to share `sea-gl.ts` and shader builders; its shader
  strings and ship mesh are byte-identical (pinned by tests).
- **Suggested commit message:** `feat: give every error page its own sea` — body: the five
  pages and their scenes; what floats encodes severity; shared sea-gl and shader builders
  with the homepage byte-identical; unknown notes now render on demand to reach the notebook
  404; the sea loads lazily so every route carries only about 6 KB more; what was verified.
- **Verified** (scratch copy, Node 24, production build): `tsc`, `lint`, `format:check`; 58 Node
  tests with `SEA_TEST_BASE`; `check-seo` (20 cases, unknown-article 404, drafts kept out);
  `check-headers`; `check-keyboard` 20/20; `check-software-fallback`; `check-page-turn`;
  `check-creative-v2` (126 cases, no runtime exceptions, no failed record); `compare-builds`
  against `9787313`: 31/32 views identical, the 32nd the known phone Work-image flake (its
  differing pixels moved between reruns). All five error pages rendered with WebGL in headless
  Chrome at 1280×800 and 390×844 with no horizontal overflow (the crash pages through a
  throwaway scratch build with a throwing page and layout); with `--disable-gpu` the 404s show
  the static plate and stay readable. The last change (the fallback plate's colour) was
  re-checked with `check-seo`, `check-headers`, the Node tests and a no-GPU screenshot only.
- **Not verified:** the error pages on a real GPU, a phone, Safari or Firefox; a screen reader;
  the whirlpool shader against `sampleDrift` (no parity test); `error.tsx` "Try again"
  actually recovering. No automated check covers the error pages.
- **Posts:** three in `content/posts/`; the flag post is published and live, the other two are
  drafts ending in "Notes for the editor". Write at `/write` (dev only) or edit the `.md` files.
- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: review the error pages (`/nope`, `/blog/nope`, `/plate?seed=zz` in `pnpm dev`), commit,
   push `main`, release when ready.
2. Owner's ideas parked in [follow-ups.md](follow-ups.md): the capsized red sea and ghost
   photos as Easter eggs; stars and birds in the sky (add them to every sky where they fit,
   error pages included).
3. Finish the two drafts. Step 6 and social content stay on hold
   ([code-cleanup.md](code-cleanup.md), [follow-ups.md](follow-ups.md)).

## Performance report (PageSpeed Insights, 8 October 2026)

Lab only, no field data. Before the release (09:25 IST) mobile 57, desktop 62; after it (14:41 IST)
mobile 92, desktop 99. The loss was Total Blocking Time on a GPU-less lab machine; software
rendering now falls back to the plate. Still open: the function-region choice (first byte is the
biggest lever; function in `iad1`) and the cached-page decision (leaning no). The error pages add
about 6 KB gzipped JS and CSS to each route (homepage measured 214.9 vs 208.6 KB).

## Settled (details in decisions.md)

- Commit only when told; at review points suggest a commit message.
- The staged mobile sea and its timings are approved: refactor around them, never change
  them. Version 1 of the sea is frozen.
- No right-click blocking and no obfuscation. The personal Gmail must never appear in the
  repository (identity is `maxsash <16003409+ctrl-alt-yash@users.noreply.github.com>`).
- Projects: Household Hub and Wedding Photo Platform, with case studies on the owner's
  portfolio (<https://ctrl-alt-yash.github.io/portfolio/>). Invent nothing else.
- The owner's photo for the ghost-photo idea lives outside the repo; never commit a face.

## Limits of what was verified

Headless Chrome on a Mac only; see [testing.md](testing.md) for what has never been
checked. The fallback was tested with `--disable-gpu`, not on a real GPU-less phone.
`compare-builds` can flag one phone Work image in a single run (lazy-image timing).

Latent risk: several module stylesheets style `h1`–`h3` under `.page`, so equal-specificity
rules elsewhere can win or lose by CSS bundle order.
