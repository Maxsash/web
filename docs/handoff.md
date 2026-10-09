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
- **Released:** `production` is at `383f6b4` (the error pages). Local `main` is two commits
  ahead, not pushed: `fd41303` (client-first homepage) and `169c3ae` (Velora Rights and the
  compass-medal portrait).
- **Uncommitted now: sound** (owner, 9 October 2026; rules in decisions.md "Sound", code map in
  architecture.md "Sound"). Louder surf for laptop speakers (about -32 LUFS, was -46; never
  silent; page turns duck it 9 dB). One `AudioContext` per visit (`components/sound/`); the choice
  is kept both ways: waves fade out in the notebook and return with the shore without a click,
  resume at the first gesture after a reload, mute remembered. The compass bezel ticks once per
  degree (sharp ticks; the first version sounded "underwater, bubbly"). Browser back/forward into
  or within the notebook plays the page turn (`components/sound/PageTurns.tsx` in the root
  layout; costs the site 404 +3.2 KB gzipped JS, the notebook +0.4 KB). Moved: `lib/page-turn.ts`
  to `lib/sound/`, `WaveSound.tsx` to `components/sound/`; renamed `check-page-turn` to
  `check-sound`, `render-page-turn` to `render-sounds`, `page-turn.test` to `sound.test`. Page
  turns are unchanged (within 4e-12). Renames are staged (`git mv`); nothing is committed.
- **Suggested commit message:** `feat: louder surf, a remembered sound choice and a ticking
  compass` — body: the waves were inaudible on laptop speakers and lost after a trip to the
  notebook, and a remembered "on" was ignored; one audio context now lives for the visit, the
  choice (and mute) holds across pages and reloads, resuming at the first gesture; the surf is
  re-synthesised for small speakers and ducks under page turns; the browser's back and forward
  turn pages too; the compass bezel ticks once per degree; what was verified.
- **Verified** (scratch copy, Node 24, production build) before the back/forward change: `tsc`,
  `lint`, `format:check`, 74 Node tests, `check-seo`, `check-headers`, `check-keyboard` 20/20,
  `check-software-fallback`, `check-creative-v2` (133 records, no failures or exceptions). After
  it: build OK, `sound.test` 16/16, `check-sound` 19/19 twice. **Not re-run after it:** `tsc`,
  `lint`, `format:check` of the whole tree, the other suites.
- **Not verified:** how it sounds (owner: `node tools/render-sounds.mjs`, then `tools/.out/*.wav`;
  `waves-before.wav` is the old level); Safari, Firefox, iPhone (silent switch mutes Web Audio).
  In `pnpm dev`, reload the page fully to hear new tick buffers (they are cached per visit).
- **Not started, owner's side notes (9 October); plans:**
  1. **Phone hero in two stages, less text** ("empty words"). `stage-director.ts`: `STAGES` Sea 0,
     Drawing 1 (Sea→Drawing keeps the 1.8 s ease-out, back stays 0.6 s). `reveal-mapping.ts`:
     staged reveal = progress (drop `STAGED_STRUCTURE`). `Hero.tsx`: delete the `.middle` block
     ("02 / Beneath the impression", "Wonder has a structure…") and `.technical` list; keep
     `sceneMeta`'s "Authored sea / seed" only; chapter rail reads "View {afterHero.label}"; keep
     the end block (next candidate to cut). `layer-opacity.ts` → `[intro, end, veil]`;
     `OceanScene.tsx` opacity groups; delete `.middle`/`.technical` CSS and `--middle-opacity`.
     Update `tools/ocean-scene.test.mjs`, `tools/e2e/staged-sea.mjs` (two stages, labels
     "n / 2", stage indexes), `tools/e2e/lifecycle.mjs` (looks for the "Wonder" heading), and
     decisions.md "Mobile hero" (the owner revised the approved three stages) and
     architecture.md "Scroll and the mobile stages".
  2. **Same-page links scroll smoothly** (section links, and links back to the top, both ways).
     Next 16 no longer overrides `scroll-behavior` on navigation unless `<html
     data-scroll-behavior="smooth">` (`node_modules/next/dist/docs/01-app/02-guides/upgrading/
     version-16.md`). So `html { scroll-behavior: smooth }` (globals.css already forces `auto`
     under reduced motion) plus that attribute in `app/layout.tsx`. `Link href="/"` on `/`
     ("Maxsash Studio" in the hero and the shore) re-renders and draws a new random sea: on the
     same path, prevent it and scroll to the top instead; same for "Notebook" on `/blog`. Check
     the phone hero's touch handling and `check-keyboard` (focus after anchors).
- **Servers:** the owner's dev server on :3000 was left alone; the scratch server on :3012 was
  stopped. Scratch copy: the session scratchpad's `wt/` (gone with the session).
- **Posts:** three in `content/posts/`; the flag post is published and live, the other two are
  drafts ending in "Notes for the editor". Write at `/write` (dev only) or edit the `.md` files.
- **Node 24** (`nvm use`; the owner's default is 22). Never build or test inside the
  project folder (it stopped the owner's dev server twice); never `pkill`.

## Next

1. Run `tsc`, `lint`, `format:check` and the suites once more (see "Not re-run"), then side
   notes 1 and 2 above; update decisions, architecture, testing and this file.
2. Owner: listen, review, commit (sound; hero; scrolling can be separate commits), push `main`,
   release. The portfolio's `AGENTS.md` should list `velora-rights.html` among the deep-links.
3. Later: case-study pages on maxsash.com, the two drafts, the parked Easter eggs
   ([follow-ups.md](follow-ups.md)).

## Performance report

PageSpeed (8 October, lab only): mobile 92, desktop 99 after the software-rendering fallback.
Open: the function region (`iad1` vs India) and the cached-page decision; see decisions.md.

## Settled (details in decisions.md)

- Commit only when told; at review points suggest a commit message.
- The staged phone sea's durations and curves are approved; the owner asked on 9 October to cut
  it from three stages to two (side note 1). Version 1 of the sea is frozen.
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
