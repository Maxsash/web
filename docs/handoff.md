# Handoff — start here

Updated 9 October 2026. Rewrite (don't append to) the sections below after every step.
Read order: `AGENTS.md` → this file → [architecture.md](architecture.md) →
[decisions.md](decisions.md). Checks and their limits: [testing.md](testing.md). Open
items: [follow-ups.md](follow-ups.md). Cleanup plan: [code-cleanup.md](code-cleanup.md).

**Project:** Maxsash Studio's public site (<https://www.maxsash.com>), Yash Shrivastava's
one-person studio for web products built end to end: a WebGL sea that resolves into its own
maths, services, project spreads, about, contact, a sea studio where visitors build and print
their own sea, a notebook, and a shoreline footer. Next.js 16, React 19, TypeScript; no
database, accounts or cookies.

## State

- **Repo:** public, `github.com/Maxsash/web` (an organization; the owner's account is
  `ctrl-alt-yash`). Folder: `/Users/yash/WithAIAssistant/development/maxsashlabs/web`.
- **Branches:** `main` never deploys. `production` is live; the owner releases with
  `git push origin main:production`.
- **Released:** `production` and `main` are both at `06fc3b4` (sound). The owner approved the
  sounds on 9 October. Re-checked on `06fc3b4` (scratch copy, Node 24, production build): all
  green, including `tsc`, `lint`, `format:check` and `check-creative-v2` (133 records).
- **Uncommitted, two steps, both done and verified** (owner's side notes, 9 October):
  1. **Two-stage phone hero, fewer words.** Phone: Sea → Drawing (1.8 s ease-out, back 0.6 s;
     reveal = progress). Every screen lost the middle text ("Wonder has a structure…") and the
     numbered list; the scene note is "Authored sea / seed" only; the rail reads "View
     services".
  2. **Links within a page glide.** New `components/SmoothLinks.tsx` (root layout; smooth only
     for the scroll a `#` link click starts) and `components/PageLink.tsx` (a link to the page
     already open scrolls to the top, keeps the sea, drops the hash, focuses the first
     control); used by the hero brand, the shore's "Maxsash Studio ↗" and `NotebookLink`.
     A global `scroll-behavior: smooth` was tried first and dropped: it glided every Tab focus
     and failed 7 keyboard checks. New `tools/e2e/links.mjs` (in `check-creative-v2`);
     `check-keyboard` waits 1.2 s after the skip link.
- **Verified after both** (scratch copy, Node 24, production build): `tsc`, `lint`,
  `format:check`, 75 Node tests, SEO, headers, keyboard 20/20, fallback, sound 19/19,
  `check-creative-v2` 135 records with no failures; phone and desktop screenshots looked at.
  **Not verified:** a physical iPhone; Safari (no `scrollend` before Safari 26, so the glide
  ends on the 1.5 s timer); "Notebook" on `/blog` in a browser (same code path as the tested
  home link); the JS size change (not measured).
- **Open question for the owner:** the desktop hero is still 255svh, and its middle now shows
  the sea turning into the drawing with no text over it. Shorten it?
- **Suggested commits** (two, in this order; docs go with either):
  - `feat: a two-stage phone hero with fewer words` — body: the owner found the Structure stage
    and its copy empty; phones now go Sea → Drawing with the approved 1.8 s opening, the middle
    text and numbered list are gone on every screen, the rail names where it goes; what was
    verified. Files: `components/observatory/` except the brand link in `Hero.tsx`,
    `tools/ocean-scene.test.mjs`, `tools/e2e/staged-sea.mjs`, `tools/e2e/lifecycle.mjs`.
  - `feat: links within a page glide to their place` — body: section links scroll smoothly and
    a link to the open page returns to its top without drawing a new sea; smoothness is scoped
    to link clicks so Tab focus stays instant, and reduced motion jumps; what was verified.
    Files: `components/SmoothLinks.tsx`, `PageLink.tsx`, `NotebookLink.tsx`, the brand link in
    `Hero.tsx`, `components/shore/Shoreline.tsx`, `app/layout.tsx`, `app/globals.css`,
    `tools/e2e/links.mjs`, `tools/check-creative-v2.mjs`, `tools/check-keyboard.mjs`.
- **Servers:** the owner's dev server on :3000 was left alone; the scratch server on :3012 was
  stopped. Scratch copy: the session scratchpad's `wt/` (gone with the session).
- **Posts:** three in `content/posts/`; the flag post is published and live, the other two are
  drafts ending in "Notes for the editor". Write at `/write` (dev only) or edit the `.md` files.
- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: answer the desktop-hero question; review and commit the two steps; release
   (`git push origin main:production`). Try the phone hero on the iPhone.
2. Owner: rework the Services steps and the Work showcase (not happy with either); then
   About, Contact and the hero line. The portfolio's `AGENTS.md` should list
   `velora-rights.html` among the deep-links.
3. Later: case-study pages on maxsash.com, the two drafts, the parked Easter eggs
   ([follow-ups.md](follow-ups.md)).

## Performance report

PageSpeed (8 October, lab only): mobile 92, desktop 99 after the software-rendering fallback.
Open: the function region (`iad1` vs India) and the cached-page decision; see decisions.md.

## Settled (details in decisions.md)

- Commit only when told; at review points suggest a commit message.
- The staged phone sea's durations and curves are approved; since 9 October it has two stages.
  Version 1 of the sea is frozen.
- No right-click blocking and no obfuscation. The personal Gmail must never appear in the
  repository (identity is `maxsash <16003409+ctrl-alt-yash@users.noreply.github.com>`).
- Projects: Velora Rights, Household Hub, Wedding Photo Platform, with case studies on the
  owner's portfolio (<https://ctrl-alt-yash.github.io/portfolio/>; local source
  `development/personal/portfolio`). Invent nothing else. Never publish the portfolio's phone,
  the personal Gmail, the employer or degrees.
- The headshot in About is approved; the ghost-photo image stays outside the repo.

## Limits of what was verified

Headless Chrome on a Mac only; see [testing.md](testing.md) for what has never been
checked. The fallback was tested with `--disable-gpu`, not on a real GPU-less phone.
`compare-builds` can flag one phone Work image in a single run (lazy-image timing).

Latent risk: several module stylesheets style `h1`–`h3` under `.page`, so equal-specificity
rules elsewhere can win or lose by CSS bundle order.
