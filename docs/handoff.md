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
- **Released:** everything up to the notebook work is committed and live. `main` and
  `production` are both at `495f879` (pushed 8 October 14:35 IST). Uncommitted now: the published
  WebGL-flag post, the notebook ordering below and the docs. Suggested message: `docs: publish the
  WebGL-flag post` (ordering as its own `feat: list the notebook newest first`, body: why and what
  was verified).
- **Notebook order:** newest first on `/blog` and the home list. Numbers follow writing order: the
  integral note is 001, the wave study 002, written posts 003 onward (`content/notebook.ts` is in
  number order; `app/blog/page.tsx` reverses it). Light/dark features alternate by display position.
- **Flag-post plate:** the WebGL-flag post has its own drawing (`FlagPlate`): the engraved sea
  stormy on the left (waves 2.6× taller) and flat on the right, dropping away at the dashed "flag" line. `PostPlate` picks it
  by slug; other posts keep the seeded `OceanPlate`; both draw through `surface.ts`. Verified: `tsc`,
  `lint`, `format:check` (Node 22), and the lines rendered in a standalone SVG screenshot. The
  labels and the real page were not rendered and nothing was built.

- **The posts:** three in `content/posts/`. The WebGL-flag post is **published** (dated
  2026-10-09, no editor notes, eight reference links: spec, MDN, SwiftShader, Chromium 154 source
  at the tag, PageSpeed, TBT); it is not yet released, because the file is uncommitted. The other
  two (headings that moved, reading PageSpeed) are drafts that end with "Notes for the editor".
  Write at `/write` (dev only) or edit the `.md` files; read at `/blog`. Drafts never ship
  (decisions.md). Findings behind the flag post: the strict request fires only when Chrome's own
  software-WebGL fallback writes `--use-gl=angle --use-angle=swiftshader-webgl` for the GPU
  process; PageSpeed 62/57 to 99/92 after release (one run each, 09:25 vs 14:41 IST on 8 Oct).
  Unknown: why `--use-gl` is not forwarded when passed by hand; Safari, Firefox, Linux, Windows
  untested. Verified in a separate worktree on Node 24: build, `check-seo` (20 cases, 2 drafts
  kept out), `check-headers`, and the published page renders its links and no editor notes.
- **Page turn:** the owner chose the "hush" tuning by ear (very soft, low, quiet) and asked for
  a few variations picked at random; there are four. Hear them with
  `node tools/render-page-turn.mjs` (`tools/.out/page-turn-1…4.wav`). Notebook ideas for next session
  are in follow-ups.md. One `check-headers` run crashed once under load (no output captured)
  and passed in six later runs; cause unknown.

- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: commit the post, release it (`git push origin main:production`), then finish the two drafts.
2. Step 6 and social content are on hold. Step 6, "fun to read": ideas only, nothing built until the owner approves them
   ([code-cleanup.md](code-cleanup.md)).
3. Owner-side and content items: [follow-ups.md](follow-ups.md). Social content is blocked
   on the owner's answers; real essays and projects come last.

## Performance report (PageSpeed Insights, 8 October 2026)

Lab only, no field data. Before the release (09:25 IST) mobile 57, desktop 62; after it (14:41 IST)
mobile 92, desktop 99. The first run: LCP 3.3 s / 0.7 s, CLS 0; the loss is Total
Blocking Time on a GPU-less lab machine. A local run did not reproduce the huge TBT with
software GL on this Mac, so the cause is likely, not proven. Done: software rendering now
falls back to the plate (0 ms blocking desktop, 85 ms phone profile with no GPU); the
identical-links finding is fixed. Also fixed: the "sailing" pill contrast. Measured: layout is the
initial hero (about 130 ms at 4× throttle), the first byte is the biggest lever (function
runs in `iad1`; edge in Mumbai). Still open: the function-region choice and the
cached-page decision (leaning no); see [follow-ups.md](follow-ups.md) and [decisions.md](decisions.md). The
home page HTML is 385 KB (137 KB gzipped); 228 KB of it is the studio's drawing.

## Settled (details in decisions.md)

- Commit only when told; at review points suggest a commit message.
- The staged mobile sea and its timings are approved: refactor around them, never change
  them. Version 1 of the sea is frozen.
- No right-click blocking and no obfuscation. The personal Gmail must never appear in the
  repository (identity is `maxsash <16003409+ctrl-alt-yash@users.noreply.github.com>`).
- Projects: Household Hub and Wedding Photo Platform, with case studies on the owner's
  portfolio (<https://ctrl-alt-yash.github.io/portfolio/>). Invent nothing else.

## Limits of what was verified

Headless Chrome on a Mac only; see [testing.md](testing.md) for what has never been
checked. The fallback was tested with `--disable-gpu`, not on a real GPU-less phone.
`compare-builds` can flag one phone Work image in a single run (lazy-image timing).

Latent risk: several module stylesheets style `h1`–`h3` under `.page`, so equal-specificity
rules elsewhere can win or lose by CSS bundle order.
