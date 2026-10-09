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
- **Released:** `main` and `production` are both at `383f6b4` (the error pages).
- **Uncommitted now: a client-first homepage** (decisions.md, "Structure and content"). Order:
  Hero → Services → Work → About → Contact → Sea studio → Notebook → Elsewhere. Nav: Services,
  Work, About, Notebook, Contact (the blog nav now derives from it). New: `Services` (one
  offer, "Web products, end to end", three steps Chart / Build / Launch from
  `content/services.ts`, one line on backend work), `About` (name, 5+ years, Tikamgarh and
  remote, tools from `content/about.ts`, portfolio link), `Contact` (moved out of Elsewhere;
  "Open to freelance work", the email). Hero line: "Web apps, built end to end. Open to
  freelance work. By Yash." The skip link, the hero's chapter link and the phone's last swipe
  ("View services ↓") lead to Services via `site.afterHero`. `site.owner` is the full name and
  JSON-LD gains `jobTitle`; the description names the offer. `components/Section.module.css`
  is the one copy of the paper palette, header, kicker, facts and link that Work, Elsewhere
  and the new sections compose from.
- **Suggested commit message:** `feat: put the services first for potential clients` — body:
  the new order and nav; one offer with three steps; About with name, years, location and
  tools only; contact as its own section; hero line and skip link lead to Services; shared
  section styles replace the copies in Work and Elsewhere; checks updated for the new order;
  what was verified.
- **Verified** (scratch copy, Node 24, production build): `tsc`, `lint`, `format:check`; 58 Node
  tests with `SEA_TEST_BASE`; `check-seo` (20 cases, Person name now "Yash Shrivastava");
  `check-headers`; `check-keyboard` 20/20 (skip link now reaches Services, tab order Services,
  Work, About, Notebook, Contact); `check-software-fallback`; `check-page-turn`;
  `check-creative-v2` (132 records, no failures, no runtime exceptions; the phone's last stage
  now scrolls to Services). `compare-builds` against `383f6b4`: only the plate matches (4/44);
  expected, since the blog nav, Elsewhere and the new sections changed and everything below
  Services sits a fraction of a pixel lower (Services is 1180.8 px tall), which re-antialiases
  the text. To prove Work, the studio and the notebook did not change, every element's
  computed style and relative box were compared in both builds: 309 of 311 identical, the
  other two zero-size SVG `title`/`desc`. Screenshots at 1440 × 900 and 390 × 844, day and
  night: no horizontal overflow; the hero line fits the phone.
- **Not verified:** a real phone, Safari or Firefox; a screen reader; the copy itself (the
  owner must confirm the step promises match how they work).
- **Posts:** three in `content/posts/`; the flag post is published and live, the other two are
  drafts ending in "Notes for the editor". Write at `/write` (dev only) or edit the `.md` files.
- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: review the homepage in `pnpm dev` and the copy (follow-ups.md, first item), update
   the portfolio's location, commit, release when ready.
2. Owner's ideas parked in [follow-ups.md](follow-ups.md): the capsized red sea and ghost
   photos as Easter eggs (the ghost photos could sit by About); stars and birds in the sky.
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
  portfolio (<https://ctrl-alt-yash.github.io/portfolio/>). Invent nothing else. From the
  portfolio, only name, role, years and tools may appear; never its Gmail, phone, employer or
  degrees. Location is Tikamgarh (the portfolio's Mumbai is stale).
- The owner's photo for the ghost-photo idea lives outside the repo; never commit a face.

## Limits of what was verified

Headless Chrome on a Mac only; see [testing.md](testing.md) for what has never been
checked. The fallback was tested with `--disable-gpu`, not on a real GPU-less phone.
`compare-builds` can flag one phone Work image in a single run (lazy-image timing).

Latent risk: several module stylesheets style `h1`–`h3` under `.page`, so equal-specificity
rules elsewhere can win or lose by CSS bundle order.
