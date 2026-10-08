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
- **Committed and pushed:** cleanup steps 1–4 (`main` at `23586a7`).
- **Uncommitted:** cleanup step 5 (documentation). The owner reviews and commits.
  Suggested message:

  ```
  docs: replace the process log with architecture, decisions and testing

  The docs were about 5,000 lines of dated checkpoints, two of them describing code that
  no longer exists. Replace them with docs/architecture.md (routes, the sea model, the
  frozen version 1 contract, rendering, footer), docs/decisions.md (what was decided and
  why), docs/testing.md (the checks, and what has never been checked), a trimmed
  seo-and-sharing.md and follow-ups.md, and a 78-line README. Delete the creative-v2
  plan, handoff, brief and validation, the responsive and mark records, the research
  notes and the roadmap; AGENTS.md points at the new files.

  Docs only: no code changed. Every command and number in the new docs was checked
  against the repository.
  ```

- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: review and commit step 5.
2. Step 6, "fun to read": ideas only, nothing built until the owner approves them
   ([code-cleanup.md](code-cleanup.md)).
3. Owner-side and content items: [follow-ups.md](follow-ups.md). Social content is blocked
   on the owner's answers; real essays and projects come last.

## Settled (details in decisions.md)

- Commit only when told; at review points suggest a commit message.
- The staged mobile sea and its timings are approved: refactor around them, never change
  them. Version 1 of the sea is frozen.
- No right-click blocking and no obfuscation. The personal Gmail must never appear in the
  repository (identity is `maxsash <16003409+ctrl-alt-yash@users.noreply.github.com>`).
- Projects: Household Hub and Wedding Photo Platform, with case studies on the owner's
  portfolio (<https://ctrl-alt-yash.github.io/portfolio/>). Invent nothing else.

## Limits of what was verified

Step 5 changed documents only, so no build or browser check was re-run for it; the
format check and a search for dangling links were. The code was last verified at step 4
(29 Node tests, 20 SEO, headers, 20 keyboard, 126 browser records, 32 of 32 views
pixel-identical). Checks run in headless Chrome on a Mac; see
[testing.md](testing.md) for what has never been checked.

Latent risk: several module stylesheets style `h1`–`h3` under `.page`, so equal-specificity
rules elsewhere can win or lose by CSS bundle order. The pixel comparison shows no section
depending on it today.
