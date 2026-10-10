# Handoff — start here

Updated 10 October 2026. Rewrite (don't append to) the sections below after every step.
Read order: `AGENTS.md` → this file → [architecture.md](architecture.md) →
[decisions.md](decisions.md). Checks and their limits: [testing.md](testing.md). Open
items: [follow-ups.md](follow-ups.md). Cleanup plan: [code-cleanup.md](code-cleanup.md).
The feedback run, the gull, and how to change any answer: [feedback.md](feedback.md).

**Project:** Maxsash Studio's public site (<https://www.maxsash.com>), Yash Shrivastava's
one-person studio for websites and web apps built end to end: a WebGL sea that resolves into
its own maths, the work, about, contact (with what to expect), a notebook, a sea studio where
visitors build and print their own sea, and a shoreline footer. Next.js 16, React 19,
TypeScript; no database, accounts or cookies.

## State

- **Repo:** public, `github.com/Maxsash/web` (an organization; the owner's account is
  `ctrl-alt-yash`). Folder: `/Users/yash/WithAIAssistant/development/maxsashlabs/web`.
- **Branches:** `main` never deploys. `production` is live; the owner releases with
  `git push origin main:production`. `origin/production` is still `b65671e` ("feat: every action
  answers", released 9 October). `main` and `origin/main` are four commits ahead (pushed 10
  October, **not released**): shared easing curves, checks that find the sea's canvas by name,
  the gull, and the research follow-ups with this handoff.
- **The gull** (the owner's idea, 9 October: a bird flies in and sits on "Play waves" as the only
  hint to press it). What it does, its rules and how to change or remove it:
  [feedback.md](feedback.md), "The gull"; why: [decisions.md](decisions.md) (Feedback); how:
  [architecture.md](architecture.md) ("The gull"). Code: `components/gull/`, the `gull` prop of
  `WaveSoundControl` (hero only), `sound.ts` (`wavesDeclined`), `OceanScene` (`data-still`).
- **Research done: "Website feedback beyond sound"** (the owner asked on 9 October). Report:
  `../web-research/reports/Website feedback beyond sound.md` ("Make the sea answer every scroll"),
  notes beside it in `../web-research/research_notes/`; both kept outside this public repo on
  purpose. Published for the owner as a private Claude doc of the same title (two accessibility
  claims corrected there: `aria-hidden` children inside a button are allowed; a toggle that changes
  its label should not also carry `aria-pressed`). Its ideas are items in
  [follow-ups.md](follow-ups.md), including a post from it.
- **Servers:** the owner's dev server on :3000 was left running (page loads only, for
  screenshots; it shows the gull). No scratch servers are running. Scratch scripts that render
  the gull's poses, flight and states: the session scratchpad's `gull/`.
- **Posts:** three in `content/posts/`; the flag post is published and live, the other two are
  drafts ending in "Notes for the editor". Write at `/write` (dev only) or edit the `.md` files.
- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the project
  folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. **Owner: release when happy** (`git push origin main:production`), after trying the gull on
   the dev server (load `/`, wait about 3 s without scrolling; hover or Tab to "Play waves"; press
   it or the gull) and ideally on an iPhone and in Safari.
2. **Then, if wanted:** a post from the research (draft in `content/posts/`), a takeoff sound
   (needs listening), the shore's gull, birds in the skies, and the research ideas, cheapest first
   ([follow-ups.md](follow-ups.md)).
3. Still open from before: physical-device checks (speakers, an iPhone, Safari, a screen reader),
   PageSpeed after the 9 October release, the function region.

## Verified

Scratch copy, Node 24, clean production build: `tsc`, `lint`, `format:check`, 101 Node tests (9
new for the gull), SEO 20, headers (WebGL on the sea's canvas), keyboard 20/20, software fallback,
sound 23/23, `check-creative-v2` 132 records with nothing flagged. The gull was watched in headless
Chrome: desktop and phone arrival, landing, sitting, the head following the pointer, hover and
keyboard-focus stand, takeoff on pressing the button and on pressing the gull, night, the drawing
chapters, reduced motion, and arrival waiting for scrolling to stop. Its geometry costs about 0.1
ms a frame. After the full suite, small refactors (renames, private names un-exported, the head's
"look at the viewer" made to respect which way it faces) were checked with `tsc`, `eslint`, the gull
tests and a live arrival. **Not verified:** a real iPhone, Safari, Firefox; a screen reader; scroll cost against
the released build; whether visitors press the button more.

## Settled (details in decisions.md)

- Commit only when told; at review points suggest a commit message.
- Structure, then feedback (both released); answers sound by default, the waves stay opt-in.
- The staged phone sea's durations and curves are approved; it has two stages. Version 1 of the
  sea is frozen.
- No right-click blocking and no obfuscation. The personal Gmail must never appear in the
  repository (identity is `maxsash <16003409+ctrl-alt-yash@users.noreply.github.com>`).
- Projects: Velora Rights, the real-time intrusion detection platform, the business-operations
  SaaS, Household Hub and the wedding platform, each with a case study on the owner's portfolio
  (<https://ctrl-alt-yash.github.io/portfolio/>; local source `development/personal/portfolio`).
  Invent nothing beyond it. Never publish the portfolio's phone, the personal Gmail, the
  employer's name or degrees.
- The headshot in About is approved; the ghost-photo image stays outside the repo.

## Limits of what was verified

Headless Chrome on a Mac only; see [testing.md](testing.md) for what has never been checked.

Latent risk: several module stylesheets style `h1`–`h3` under `.page`, so equal-specificity
rules elsewhere can win or lose by CSS bundle order.
