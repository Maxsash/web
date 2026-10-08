# Decisions

What was decided, and why, so it is not re-argued or silently undone. Newest first within
each group. How the code is built: [architecture.md](architecture.md).

## Direction

- **A is the main site, B is the blog, C is an optional Easter egg.** A ("Living Atlas")
  is one authored sea that reveals its own mathematics as the visitor scrolls and
  becomes a printable plate. B (the Notebook) is a separate editorial composition in ink
  and bone. C is not built; there is no hidden entrance.
- **Sea, Ship, Math** is the idea. The first impression must work without a tutorial
  or any input; interaction is offered only where it has a rich, legible payoff.
- **Creative changes go directly into the main site.** No sample routes, no review
  gallery. Leave them uncommitted for review.
- **The first creative review was rejected** (notebook too similar to the home page;
  explicit ship controls too simple). The Wind-versus-Helm choice, harbour controls and
  voyage were removed and are not coming back.
- **Be honest in copy.** The two essays are labelled samples and `noindex` until real
  writing exists. Only the two real projects appear. The sea is an authored study, not
  an ocean observation, and nothing implies tilt, live data or fluid simulation.
- Real essays and projects come last.

## The sea

- **A fresh sea each visit**, chosen from four curated starting points with nudged
  settings (fully random settings reach ugly corners). **No device, location, IP or
  weather data is read**; the owner considered those signals and declined them.
- **Version 1 is frozen.** An unversioned seed or API request means version 1 forever;
  generated links carry `&version=2`. Version 2 exists because version 1 only jittered
  amplitude, direction and phase, so different seeds looked alike.
- **Four settings are the seed:** swell, heading, character, variation, one byte each.
  The studio's sliders, presets, dice and typed seed all edit that one recipe, and the
  live drawing is the very function that prints.
- Home water (`70806d5e`) is the studio's reset and the sea in the essays.

## Mobile hero

- **Sea → Structure → Drawing, one stage per swipe**, with continuous scrolling kept on
  desktop. Three stages (not four) because Waves and Structure looked too alike.
  Durations and curves are approved on a physical iPhone; see architecture.md and never
  change them while refactoring.
- Touch and narrow screens use a smaller rendering budget; Writing links straight to
  `/blog`. Scroll smoothness, not idle cadence, is the measure that matters.

## Structure and content

- **One name:** the publication is the **Notebook**. It appears once in the header and
  once as a home section. Elsewhere lists only places that leave the site (Portfolio,
  GitHub) plus email.
- **Order:** Hero → Work → Sea studio → Notebook → Elsewhere → shoreline. Section kickers
  are named, not numbered; numbers appear only inside lists.
- **One `<main>`**, the footer outside it as the contentinfo landmark, no whole-section
  links around headings, one `<article>` per essay.
- **The commit-log card** shows the three newest commits and no counts or charts: a
  14-day strip and "24 commits in the last 14 days" reads as neglect once the site is
  stable. It publishes commit messages by design.
- **Wave sound is opt-in.** Scrolling, tapping and key presses never start audio; mute is
  remembered; reload never plays.
- **Theme follows the system** until the visitor picks day or night in the
  footer.

## Accessibility

Keyboard and automated checks led to: focus never hidden by the pinned phone drawing
(studio controls carry a scroll margin), visible text is the accessible name (no
overriding `aria-label` on buttons), the hero pause button follows the site navigation in
tab order, slider read-outs are not live regions, focus rings hold their contrast on every
background, and links that open a new tab say so. Forced-colours emulation was reviewed.
A real screen reader has not been tried.

## Security and hosting

- **Next.js 16.3.8** (16.2.9 had critical advisories; the site used none of the affected
  features). `pnpm audit --prod` reports no known vulnerabilities.
- **Node 24** is the target (`engines.node`, `.nvmrc`, `@types/node`).
- **Production CSP and hardening headers**, no `X-Powered-By`, `security.txt` and
  `SECURITY.md`. No secrets, source maps or third-party client calls.
- **Open:** rate-limit `/api/sea-edition*` and `/plate` with a Vercel Firewall rule (a
  cache miss costs about 6 ms of CPU and a 228 KB response).
- **`main` never deploys; only `production` does.** Release with
  `git push origin main:production`. `vercel.json` disables deployments for `main`.
  Vercel's Production Branch Tracking is set to `production`.
- **Commit identity:** history was rewritten so every commit carries
  `maxsash <16003409+ctrl-alt-yash@users.noreply.github.com>`; the personal address must
  never appear in the repository. The old hashes stay reachable on GitHub until garbage
  collection, which the owner accepted.

## Code quality

Conventions are in [AGENTS.md](../AGENTS.md). The cleanup in [code-cleanup.md](code-cleanup.md)
(Prettier, dead code removed, repetition removed, long modules split, docs cut) was done
without changing behaviour: every step was compared against the previous build.

## Open

Physical-device checks beyond the approved iPhone flow, a real screen reader, field Web
Vitals, a paper print, social content and real essays are tracked in
[follow-ups.md](follow-ups.md) and [handoff.md](handoff.md).
