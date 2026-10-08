# Handoff — start here

Updated 8 October 2026. Rewrite (don't append to) the sections below after every step.
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
- **Committed:** cleanup steps 1–5 and the performance fixes (`main` at `47e867e`; push it and
  release with `git push origin main` then `git push origin main:production`; `production`
  is still at `e285048`).
- **Uncommitted:** the notebook work. The owner reviews and commits. Suggested message:

  ```
  feat: write notebook posts in markdown, with a local editor and a page-turn sound

  The notebook renders markdown posts (lib/markdown.ts, content/posts/) with the same
  header, cover plate, numbered sections, margin notes and closing as the two sample
  essays, and the same light and dark features on /blog (NoteFeature, ArticleParts).
  Drafts exist only in development. A local editor at /write (autosave, snippets, a live
  preview of the real page) is built from .dev.tsx files that Next only treats as routes
  outside production; a check fails if it, or a draft, is served. Entering the notebook
  plays a soft synthesised page turn (four variations at random), only after the visitor
  switched sound on. AGENTS.md
  adopts Next's managed block so `next dev` stops duplicating it.

  Verified on Node 24: tsc, lint, format, build, 49 Node tests, 20 SEO, headers, 20
  keyboard, 12 fallback and 8 page-turn checks, 126 browser records; 32 of 32 views
  pixel-identical to the previous build.
  ```

- **The drafts:** three posts in `content/posts/` (WebGL flag, headings that moved, reading
  PageSpeed). Write them at `/write` (dev only) or edit the `.md` files; read them at `/blog`.
  Each ends with "Notes for the editor". Drafts never ship (see decisions.md).
- **Page turn:** the owner chose the "hush" tuning by ear (very soft, low, quiet) and asked for
  a few variations picked at random; there are four. Hear them with
  `node tools/render-page-turn.mjs` (`tools/.out/page-turn-1…4.wav`). Notebook ideas for next session
  are in follow-ups.md. One `check-headers` run crashed once under load (no output captured)
  and passed in six later runs; cause unknown.

- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: review and commit the performance fixes.
2. Step 6 and social content are on hold. Step 6, "fun to read": ideas only, nothing built until the owner approves them
   ([code-cleanup.md](code-cleanup.md)).
3. Owner-side and content items: [follow-ups.md](follow-ups.md). Social content is blocked
   on the owner's answers; real essays and projects come last.

## Performance report (PageSpeed Insights, 8 October 2026)

Lab only, no field data. Mobile 57, desktop 62; LCP 3.3 s / 0.7 s, CLS 0; the loss is Total
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
