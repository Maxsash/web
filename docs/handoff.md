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
- **Released:** `production` is at `383f6b4` (the error pages). Local `main` is one commit
  ahead, not pushed: `fd41303`, the client-first homepage (decisions.md, "Structure and
  content"): Hero → Services → Work → About → Contact → Sea studio → Notebook → Elsewhere; nav
  Services, Work, About, Notebook, Contact; `Services` with one offer and steps Chart / Build /
  Launch (`content/services.ts`); `Contact` out of Elsewhere; skip link, chapter link and the
  phone's last swipe lead to Services via `site.afterHero`; `components/Section.module.css`
  shared by the sections.
- **Uncommitted now: Velora Rights and an engraved About**, from the owner's local portfolio
  (`development/personal/portfolio`).
  - Velora Rights (client project, 2026, live site and case study) leads Work; the Work lede and
    the plate header (`plate: { title, note }`) changed; its image is a capture of the live site.
  - About: founding engineer, the freelance projects in one sentence, facts and Portfolio /
    LinkedIn / GitHub links on the left; on the right a round compass medal
    (`components/portrait/`): the monochrome headshot in the theme's colours, a ticked bezel
    with name, title and coordinates, and the photo engraved in 72 lines of Home water. Lines
    print as the medal enters, the photo surfaces mid-screen and sinks back into lines as it
    leaves; hover shows the lines. Headshot: `public/images/yash-shrivastava.webp`, 720 px from
    `~/Pictures/yash-portrait.png`. Plate styles moved into `Section.module.css` (shared with
    Work). About's top padding is smaller (the owner found the gap too big).
  - LinkedIn joins Elsewhere and JSON-LD (`sameAs`, `image`, `jobTitle`).
- **Suggested commit message:** `feat: lead with Velora Rights and a compass-medal portrait`
  — body: the client project first, with its live site and case study; About gains a round,
  monochrome headshot in a compass bezel that engraves into Home water's lines as it enters and
  leaves the screen, the freelance history and profile links; LinkedIn in Elsewhere and the
  structured data; no employer, degrees or phone; plate styles shared; engraving and bezel tests
  and a browser check; what was verified.
- **Verified** (scratch copy, Node 24, production build, everything uncommitted): `tsc`, `lint`,
  `format:check`; 65 Node tests (7 for the portrait); `check-seo`; `check-headers`;
  `check-keyboard` 20/20; `check-software-fallback`; `check-page-turn`; `check-creative-v2` (133
  records including the portrait check, no failures, no runtime exceptions). Homepage weight
  against `fd41303`, gzipped: JS +1.4 KB, CSS +0.7 KB, HTML +3.9 KB (the engraving is computed
  in the browser). The medal was checked frame by frame at 1440 × 900 and 390 × 844, day and
  night, entering, centred and leaving, plus hover (desktop: lines shown, photo opacity 0).
  Studies (not in the repo): the scratchpad's `portrait-studies/`.
- **Not verified:** a real phone, Safari or Firefox; a screen reader; the copy (the owner must
  confirm the step promises and the About sentence).
- **Posts:** three in `content/posts/`; the flag post is published and live, the other two are
  drafts ending in "Notes for the editor". Write at `/write` (dev only) or edit the `.md` files.
- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: review Work and About in `pnpm dev` and the copy (follow-ups.md, first item), commit,
   push `main`, release when ready. The portfolio's `AGENTS.md` should list `velora-rights.html` among the
   case studies maxsash.com deep-links.
2. Next: louder waves, then case-study pages on maxsash.com (follow-ups.md).
3. Owner's ideas parked in [follow-ups.md](follow-ups.md): the capsized red sea and ghost
   photos as Easter eggs (the ghost photos could sit by About); stars and birds in the sky.
4. Finish the two drafts. Step 6 and social content stay on hold
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
