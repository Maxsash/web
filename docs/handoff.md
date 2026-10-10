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
  the gull, and the research follow-ups with this handoff. **Uncommitted on top of that (10
  October, the second gull step):** the changes below.
- **The gull** (the owner's idea, 9 October: a bird flies in and sits on "Play waves" as the only
  hint to press it). What it does, its rules and how to change or remove it:
  [feedback.md](feedback.md), "The gull"; why: [decisions.md](decisions.md) (Feedback); how:
  [architecture.md](architecture.md) ("The gull"). Code: `components/gull/`, the `gull` prop of
  `WaveSoundControl` (hero only), `OceanScene` (`data-still`).
- **Second gull step (10 October, uncommitted, the owner's requests):** it comes whatever the
  visitor chose before (`wavesDeclined` deleted); it sings (`song.ts`, `paintNotes`); it lands
  inside the pill, which widens for it (`data-room`), instead of on top; the turn-round habit and
  the hit-area span are gone. Why inside, not over the label: [decisions.md](decisions.md).
- **Research done: "Website feedback beyond sound"** (9 October). Report and notes live outside
  this public repo in `../web-research/`; a private Claude doc of the same title exists. Its ideas
  are in [follow-ups.md](follow-ups.md).
- **Servers:** the owner's dev server on :3000 was left running (page loads only, for
  screenshots; it shows the gull). No scratch servers are running. Scratch scripts that render
  the gull's poses, flight and states: the session scratchpad's `gull/`.
- **Posts:** three in `content/posts/`; the flag post is published and live, the other two are
  drafts ending in "Notes for the editor". Write at `/write` (dev only) or edit the `.md` files.
- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the project
  folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. **Owner: look at the second gull step** on the dev server (load `/`, wait about 3 s without
   scrolling; the pill widens and the gull lands and sings; also with the sounds muted, which
   used to keep it away). Tune in `song.ts` (`SONG`, `REACH`) and the pill's placement in
   `Gull.module.css`. Then release when happy (`git push origin main:production`), ideally after
   an iPhone and Safari. Suggested commit message below.
2. **Then, if wanted:** a post from the research (draft in `content/posts/`), a takeoff sound
   (needs listening), the shore's gull, birds in the skies, and the research ideas, cheapest first
   ([follow-ups.md](follow-ups.md)).
3. Still open from before: physical-device checks (speakers, an iPhone, Safari, a screen reader),
   PageSpeed after the 9 October release, the function region.

## Verified

Scratch copy, Node 24, clean production build of the second gull step: `tsc`, `lint`,
`format:check`, 104 Node tests (12 for the gull), SEO 20, headers, keyboard 20/20, software
fallback, sound checks, `check-creative-v2` 132 records and no exceptions. Watched in headless
Chrome against the dev server: desktop and phone arrival, the pill widening and the landing, the
notes, arrival with `studio-wave-sound` and `studio-sound` both remembered `off`, a press (waves
and sounds turn on, the gull leaves, the pill closes), night, reduced motion (still notes), the
hover stand, keyboard focus and the drawing chapters (ink gull, ink notes). **Not verified:** a real iPhone, Safari, Firefox; a screen reader; scroll cost against
the released build; whether visitors press the button more.

## Suggested commit message

```
feat: the gull sings, sits inside the button, and comes to everyone

It stayed away from visitors who had muted the sounds or turned the waves off, so a
returning visitor who might want them never saw the hint. It now arrives whenever the
waves are off, and amber notes leave its beak so the invitation reads as deliberate. It
lands inside the pill (which widens for it): on top there were 21 px of room, none for
notes, and covering the label would hide the accessible signal.

Verified: tsc, lint, format, 104 node tests, SEO, headers, keyboard, sound, creative-v2
on a Node 24 build; watched in headless Chrome on desktop and phone, muted, night,
reduced motion, hover, focus, a press and the drawing chapters.
```

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
