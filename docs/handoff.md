# Handoff — start here

Updated 9 October 2026. Rewrite (don't append to) the sections below after every step.
Read order: `AGENTS.md` → this file → [architecture.md](architecture.md) →
[decisions.md](decisions.md). Checks and their limits: [testing.md](testing.md). Open
items: [follow-ups.md](follow-ups.md). Cleanup plan: [code-cleanup.md](code-cleanup.md).
The next run's plan: [feedback.md](feedback.md).

**Project:** Maxsash Studio's public site (<https://www.maxsash.com>), Yash Shrivastava's
one-person studio for websites and web apps built end to end: a WebGL sea that resolves into
its own maths, the work, about, contact (with what to expect), a notebook, a sea studio where
visitors build and print their own sea, and a shoreline footer. Next.js 16, React 19,
TypeScript; no database, accounts or cookies.

## State

- **Repo:** public, `github.com/Maxsash/web` (an organization; the owner's account is
  `ctrl-alt-yash`). Folder: `/Users/yash/WithAIAssistant/development/maxsashlabs/web`.
- **Branches:** `main` never deploys. `production` is live; the owner releases with
  `git push origin main:production`. `main` is at `67da916` (two-stage phone hero, gliding
  links; pushed). `production` is still at `06fc3b4` (sound): `67da916` is not released.
- **Uncommitted: the structure run, done and verified.** The owner asked for a structural
  review before the feedback run, answered its six questions, and asked for the changes. What
  was decided and why is in decisions.md ("Structure and content"); the review file itself was
  deleted once recorded. In short:
  - Order Hero → Work → About → Contact → Notebook → Sea studio → shore; nav Work · About ·
    Notebook · Contact. Services and Elsewhere deleted (and `ArrowIcon`, `content/services.ts`).
  - Contact: "What to expect" (Plan, Build, Launch; Plan carries the owner's "what will work
    for your business, not what looks fancy or costs too much"), the backend line, a copy button.
  - Work: Velora lead; the intrusion detection and business-operations platforms drawn as
    system plates (`lib/system-drawing.ts`, `components/SystemPlate.tsx`); then the two
    personal projects; smaller cards with role and stack on one line; "Form" dropped.
  - About: shorter lede; experience "Java, then full-stack developer at a product SaaS
    company, 2021–2026. Founding engineer on two freelance platforms" (company unnamed).
  - Hero: "Websites and web apps, / built end to end." (`site.offer`, `site.promise`); seed
    label links to the studio; desktop 180svh (was 255svh). Phone timings untouched.
  - Home Notebook: three newest entries, written notes first (`latestNotes`), samples kept as
    the owner asked; compass from Elsewhere (desktop ≥ 72rem). Studio: the repeated list cut.
  - Shore: email and profile links. Posts end with an author line (`ArticleEnd`).
  - Found and fixed on the way: `content/posts.ts` built its folder path from an imported
    constant, so Turbopack traced the whole project into every route reading posts (a build
    warning that predates this run; `/` would have shipped 353 files, now 153). The path is now
    literal and the editor imports it.
- **Verified** (scratch copy, Node 24, production build, after the last change): `tsc`,
  `lint`, `format:check`, build with no warnings, 82 Node tests (7 new for the drawings), SEO 20
  cases, headers, keyboard 20/20, software fallback, sound 19/19, `check-creative-v2` 132
  records with no failures. Screenshots looked at: every home section on desktop and phone,
  the drawings by night, the end of a post on a phone, the phone hero. The editor's listing at
  `/write` read the posts on the owner's dev server. Measured on the dev server: 11.1 desktop
  screens (was 13.1), 15.4 on a phone (was 15.1; Work now shows five projects).
  **Not verified:** a physical iPhone; Safari; the editor's save (it writes files); a
  screen reader on the drawings; the JS size change (not measured).
- **Suggested commit:** `feat: a page where every section has one job` — body: the owner's
  structural review found the offer said four times, Services asking for trust before proof,
  the strongest work missing and Elsewhere repeating About; Services and Elsewhere are gone,
  Contact says what to expect, Work shows five projects with the two backend platforms drawn
  as system plates, the hero is shorter and plainer, the home notebook leads with real notes,
  the shore and every post carry the email; posts are traced from a literal folder; what was
  verified (above). Files: everything in `git status`, docs included.
- **Servers:** the owner's dev server on :3000 was left running (page loads only). The scratch
  server on :3012 was stopped. Scratch copy: the session scratchpad's `wt/`.
- **Posts:** three in `content/posts/`; the flag post is published and live, the other two are
  drafts ending in "Notes for the editor". Write at `/write` (dev only) or edit the `.md` files.
- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: review the structure run in the browser (phone too), commit it, release when ready
   (`67da916` and this run are both unreleased).
2. Feedback run: [feedback.md](feedback.md), maximalist first, then the owner dials it down.
3. Later: case-study pages on maxsash.com for the five projects, the two drafts, the samples
   rewritten in the owner's words, the parked Easter eggs ([follow-ups.md](follow-ups.md)).

## Performance report

PageSpeed (8 October, lab only): mobile 92, desktop 99 after the software-rendering fallback.
Open: the function region (`iad1` vs India) and the cached-page decision; see decisions.md.

## Settled (details in decisions.md)

- Commit only when told; at review points suggest a commit message.
- Structure first (done), then feedback, maximalist and dialled down after review.
- The staged phone sea's durations and curves are approved; since 9 October it has two stages.
  Version 1 of the sea is frozen.
- No right-click blocking and no obfuscation. The personal Gmail must never appear in the
  repository (identity is `maxsash <16003409+ctrl-alt-yash@users.noreply.github.com>`).
- Projects: Velora Rights, the real-time intrusion detection platform, the business-operations
  SaaS, Household Hub and the wedding platform, each with a case study on the owner's portfolio
  (<https://ctrl-alt-yash.github.io/portfolio/>; local source `development/personal/portfolio`).
  Invent nothing beyond it. Never publish the portfolio's phone, the personal Gmail, the
  employer's name or degrees.
- The headshot in About is approved; the ghost-photo image stays outside the repo.

## Limits of what was verified

Headless Chrome on a Mac only; see [testing.md](testing.md) for what has never been
checked. The fallback was tested with `--disable-gpu`, not on a real GPU-less phone.
`compare-builds` can flag one phone Work image in a single run (lazy-image timing).

Latent risk: several module stylesheets style `h1`–`h3` under `.page`, so equal-specificity
rules elsewhere can win or lose by CSS bundle order.
