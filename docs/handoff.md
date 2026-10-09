# Handoff — start here

Updated 9 October 2026. Rewrite (don't append to) the sections below after every step.
Read order: `AGENTS.md` → this file → [architecture.md](architecture.md) →
[decisions.md](decisions.md). Checks and their limits: [testing.md](testing.md). Open
items: [follow-ups.md](follow-ups.md). Cleanup plan: [code-cleanup.md](code-cleanup.md).
The feedback run, and how to change any answer: [feedback.md](feedback.md).

**Project:** Maxsash Studio's public site (<https://www.maxsash.com>), Yash Shrivastava's
one-person studio for websites and web apps built end to end: a WebGL sea that resolves into
its own maths, the work, about, contact (with what to expect), a notebook, a sea studio where
visitors build and print their own sea, and a shoreline footer. Next.js 16, React 19,
TypeScript; no database, accounts or cookies.

## State

- **Repo:** public, `github.com/Maxsash/web` (an organization; the owner's account is
  `ctrl-alt-yash`). Folder: `/Users/yash/WithAIAssistant/development/maxsashlabs/web`.
- **Branches:** `main` never deploys. `production` is live; the owner releases with
  `git push origin main:production`. `main`, `origin/main` and `origin/production` are all at
  `27d539a` (the structure run), released 9 October 16:05 IST; the owner confirmed Vercel runs
  Node 24.x.
- **Uncommitted, done and verified, for the owner's review:**
  - **Squall calmed** (owner: "too wild"): `lib/sea/presets.ts` swell 245 → 190, character
    225 → 200 ("Heavy · choppy"); the sliders still reach 255; the crash page's rogue wave keeps
    the old sea (`components/drift/scenes.ts`); one draft's cover sea calmed with it.
  - **The feedback run, built maximalist and kept** (the owner wants nothing toned down). Every
    action answers; the map, the levels and how to change each are in [feedback.md](feedback.md).
    **Every answer sounds by default** from the visitor's first click, tap or key (browsers allow
    none before); only the waves wait for "Play waves"; "Mute sounds" sits on the shore only (the
    owner's choice) and silences everything, remembered. The one table is
    `lib/feedback/vocabulary.ts`; cues are synthesised in `lib/sound/cues.ts`; the listeners are
    in `components/feedback/`; site-wide visual answers in `app/feedback.css`. Also: the sea
    ripples where pressed and slows when the visitor idles, the studio has a die and a pressed
    preset, system drawings ink in box by box, kickers type in, the compass ticks, posts have a
    ribbon and a quill at the end, the tab shows "At anchor" when hidden, fog when offline.
  - On the way: the dial sound is reusable, `--progress` is global (`[data-voyage]`), the
    loudness meter is shared (`tools/lib/loudness.mjs`), `README.md` lists the new folders.
- **Verified** (scratch copy, Node 24, clean production build): `tsc`, `lint`, `format:check`,
  no build warnings, 92 Node tests, SEO 20, headers, keyboard 20/20, software fallback, sound
  23/23 (answers by default, "Mute sounds"; stable over four runs), `check-creative-v2` 132
  records. Screenshots: ripple, fog and notice, arrivals, drawings inking in, studio, ribbon,
  shore controls (desktop and phone). Hidden tab and idle checked headless (hidden faked). Scroll
  cost against `27d539a`: frame pacing unchanged (feedback.md, "Measured"). Tests changed on
  purpose: the shader digest (ripple), Squall's seed, the studio check's plate selector (the die
  is an `svg`), page turns told apart by length, coast checks renamed "waves off".
  **Not verified:** how any of it sounds on real speakers (render and listen); a real phone
  (vibration, a tap's press, the ripple under a finger); Safari; a screen reader with the notices.
- **Suggested commit:** `feat: every action answers` — body: the owner asked that every action,
  and waiting, be acknowledged; one table maps each action to a synthesised cue, a haptic and
  words, and the page adds ink, type, the sea, cursors, arrivals, idle, the hidden tab and
  offline; the answers sound by default (the waves stay opt-in) with "Mute sounds" on the shore;
  Squall calmed to "Heavy · choppy"; what was verified (above). Files: everything in
  `git status`, docs included (`components/sound/WaveSound.tsx` became `SoundControls.tsx`).
- **Last released run: structure** (`27d539a`). **Never verified since:** a physical iPhone;
  Safari; PageSpeed after the release.
- **Servers:** the owner's dev server on :3000 was left running (page loads only). The scratch
  servers on :3012 (this build) and :3013 (the released build) were stopped.
  Scratch copies: the session scratchpad's `wt/` and `old/`.
- **Posts:** three in `content/posts/`; the flag post is published and live, the other two are
  drafts ending in "Notes for the editor". Write at `/write` (dev only) or edit the `.md` files.
- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Owner: review and commit, then release. Optionally listen first (`tools/.out/action-*.wav`
   and `actions-over-waves.wav`, rendered by `node tools/render-sounds.mjs`).
2. Owner: check the site on the iPhone and in Safari (sound after the first tap, the ripple,
   the shore's "Mute sounds"), and re-run PageSpeed after the release (last: mobile 92, desktop 99).
3. Later: what the feedback run did not build (feedback.md), case-study pages for the five
   projects, the two drafts, the samples in the owner's words, the parked Easter eggs.

## Performance report

PageSpeed (8 October, lab only): mobile 92, desktop 99 after the software-rendering fallback.
Open: the function region (`iad1` vs India) and the cached-page decision; see decisions.md.

## Settled (details in decisions.md)

- Commit only when told; at review points suggest a commit message.
- Structure first (released), then feedback: built maximalist and kept; answers sound by default.
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

Headless Chrome on a Mac only; see [testing.md](testing.md) for what has never been checked.

Latent risk: several module stylesheets style `h1`–`h3` under `.page`, so equal-specificity
rules elsewhere can win or lose by CSS bundle order.
