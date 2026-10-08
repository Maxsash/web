# Handoff — start here

Updated 8 October 2026. Rewrite (don't append to) the sections below after every step.
Read order: `AGENTS.md` → this file → [code-cleanup.md](code-cleanup.md). Decision
history, newest first: [creative-roadmap.md](creative-roadmap.md).

**Project:** Maxsash Studio's public site (<https://www.maxsash.com>): a WebGL sea that
resolves into its own maths, project spreads, a notebook, a sea studio where visitors
build and print their own sea, and a shoreline footer. Next.js 16, React 19, TypeScript;
no database, accounts or cookies.

## State

- **Repo:** public, `github.com/Maxsash/web` (an organization; the owner's account is
  `ctrl-alt-yash`). Folder: `/Users/yash/WithAIAssistant/development/maxsashlabs/web`.
- **Branches:** `main` never deploys. `production` is live; the owner releases with
  `git push origin main:production`.
- **Unpushed:** two local commits on `main` (`style: format the codebase with Prettier`,
  `docs: note the formatter and the cleanup plan`).
- **Uncommitted:** cleanup step 2 (dead code, generators, comments removed), this
  handoff, `tools/compare-builds.mjs`. The owner reviews and commits. Suggested message:

  ```
  refactor: remove dead code, generators and comments

  Delete the brand-mark and wave generators with their tests, unused wave data,
  unreferenced social cards, the single-icon icon set, dead content fields and about
  forty unused CSS tokens. Strip comments that restate the code, write the conventions
  into AGENTS.md, and add a build-comparison tool and the handoff.

  No behaviour change: build, 16 Node tests, 20 keyboard checks, header checks and 126
  browser records pass; 29 of 32 views are pixel-identical to the previous build.
  ```

- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: review and commit step 2.
2. Cleanup steps 3–6: [code-cleanup.md](code-cleanup.md).
3. Social content for Instagram and LinkedIn: blocked on the owner's answers (brand name,
   handles, tone, first assets). Use only the two real projects; invent nothing.
4. Real essays and projects come last; the two notebook essays are samples (`noindex`).

## Owner-side items

- Vercel: confirm Node.js Version 24.x after the next release; add a rate-limit rule for
  `/api/sea-edition*` and `/plate`.
- Search Console: sitemap showed "Couldn't fetch" at first; recheck.
- `public/.well-known/security.txt` expires 6 October 2027.
- Try the site with VoiceOver (Mac and iPhone); only automated and keyboard checks exist.

## Settled decisions

- Commit only when told; at review points suggest a commit message.
- The staged mobile sea and its timings are approved and smooth on the owner's iPhone:
  refactor around them, never change them.
- A fresh sea each visit from four curated starting points; no device, location, IP or
  weather data is read. `/?seed=…` without `version` means version 1 forever; generated
  links carry `&version=2`; version 1 is frozen (a digest test guards it).
- The commit-log card shows the latest three commits and no counts or charts.
- No right-click blocking and no obfuscation. The personal Gmail must never appear in
  the repository (history was rewritten; identity is
  `maxsash <16003409+ctrl-alt-yash@users.noreply.github.com>`).

## Verify (production build in a scratch copy, Node 24)

```bash
rsync -a --exclude node_modules --exclude .next --exclude .git --exclude tools/.out ./ $SCRATCH/wt/
cd $SCRATCH/wt && pnpm install --frozen-lockfile && pnpm build && (pnpm exec next start -p 3012 &)
pnpm exec tsc --noEmit && pnpm lint && pnpm format:check
SEA_TEST_BASE=http://localhost:3012 node --test tools/*.test.mjs
node tools/check-seo.mjs http://127.0.0.1:3012
node tools/check-headers.mjs http://localhost:3012
node tools/check-keyboard.mjs http://localhost:3012
node tools/check-creative-v2.mjs http://localhost:3012
```

For refactors, build the previous commit on another port and run
`node tools/compare-builds.mjs <old> <new>` (32 views). Stop only servers you started.
Last result: 16 Node tests, 20 SEO, headers, 20 keyboard, 126 browser records, 0 failures.

## Facts not in the code

- Hosting is Vercel; `maxsash.com` redirects (308) to `www`. Optional server-only
  `GITHUB_TOKEN` raises GitHub's rate limit (unset).
- Projects: Household Hub and Wedding Photo Platform (case studies on the owner's
  portfolio, <https://ctrl-alt-yash.github.io/portfolio/>).

## Limits of what was verified

Headless Chrome on a Mac only: no Vercel runtime, real screen reader or physical-device
run by the assistant. Three of the 32 compared views differed (an 18-pixel glyph on the
phone blog index; the phone Work image, which never loaded in the old baseline); not
fully explained.
