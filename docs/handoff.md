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
- **Pushed:** `main` and `origin/main` match at `e656e20` (cleanup steps 1 and 2).
- **Uncommitted:** cleanup step 3 (remove repetition). The owner reviews and commits.
  Suggested message:

  ```
  refactor: remove repetition in sea requests, browser tools and Work

  Parse seed and version once (lib/sea/request.ts) for the home page, the print page
  and both API routes, and share the conditional-response code between the routes.
  Move the Chrome launcher, DevTools client and key helpers into tools/lib/browser.mjs
  for every browser check. Move the Work copy into content/projects.ts behind one
  ProjectFeature component, add formatIndex, merge duplicate CSS selectors and
  un-export types used by one file.

  Verified on Node 24: tsc, lint, format, build, 19 Node tests (3 new), 20 SEO, headers,
  20 keyboard, 126 browser records; 28 of 32 views pixel-identical to the previous build.
  ```

- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: review and commit step 3.
2. Cleanup steps 4–6: [code-cleanup.md](code-cleanup.md).
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
Last result: 19 Node tests, 20 SEO, headers, 20 keyboard, 126 browser records, 0 failures.

## Facts not in the code

- Hosting is Vercel; `maxsash.com` redirects (308) to `www`. Optional server-only
  `GITHUB_TOKEN` raises GitHub's rate limit (unset).
- Projects: Household Hub and Wedding Photo Platform (case studies on the owner's
  portfolio, <https://ctrl-alt-yash.github.io/portfolio/>).

## Limits of what was verified

Headless Chrome on a Mac only: no Vercel runtime, real screen reader or physical device.
Of 32 compared views, four differed: phone essay section numbers (`01` was two text
nodes, now one). `compare-builds` can also flag the phone Work image even when a build
meets itself; fresh-browser captures of old and new were identical.

Step 3 edge-case changes: `/plate?version=1` without a seed now shows the default
version 1 sea; the API's version error is `no-store`, like its seed error.
