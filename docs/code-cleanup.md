# Code cleanup plan

Goal: a public repository worth reading. Rules: [AGENTS.md](../AGENTS.md). State:
[handoff.md](handoff.md). After each step: verify, update both docs (deleting what is no
longer true), suggest a commit message, and do not commit.

| Step | What                                               | Status                         |
| ---- | -------------------------------------------------- | ------------------------------ |
| 1    | Prettier                                           | done, committed                |
| 2    | Delete dead code, generators, comments             | done, committed                |
| 3    | Remove repetition                                  | done, committed                |
| 4    | Split by responsibility                            | done, committed                |
| 5    | Cut the docs, rewrite the README                   | done, committed                |
| 6    | Make it fun to read (needs the owner's approval)   | next, ideas only               |

## Step 6 — fun to read (ideas, nothing built)

Console greeting with a small ASCII ship, a custom response header, `humans.txt`, a hidden
`/api` sea poem or named hidden sea, playful naming. Constraints: no right-click blocking,
no obfuscation, no accessibility cost, nothing sensitive, no change for ordinary visitors.

## Gull refinement (10 October 2026)

Seat sizing and projected contact (`placement.ts`) and rest policy (`rest.ts`) are pure modules shared by the
lifecycle and meaningful geometry/behaviour checks. Theme changes reuse the habit seed.
Flight, model, notes and painting stay separate; no new dependencies or assets.
The renderer reuses its facets for contact; `check-gull.mjs` shares viewport/motion/phase
setup across its matrix and keeps pixel/collision assertions independent of placement code.

Tooling follow-up: keyboard/creative Node harness processes lingered after all results
were printed and Chrome exited. Completed processes were stopped; investigate browser
cleanup separately, without mixing it into the gull refinement.

## Mobile sea controls (10 October 2026)

React owns stage labels and button state; the scene lifecycle owns animation and the
stage dataset. Removed DOM mutations of React-owned controls. Browser regressions use
native touch emulation and taps, including Back independently and a small scroll offset.

## Landscape sea studio (10 October 2026)

The existing studio grid and wrappers supply the two columns through CSS. No duplicated
content, new component, new asset or change to the shared printable SVG.

## Survey cutter (10 October 2026)

Hull/deck, rig, geometry writer, motion, placement and shaders have separate
responsibilities. Removed the obsolete fixed `modelMatrix` and its mesh snapshot;
new checks assert useful geometry, cloth and buoyancy contracts instead. The
error-page shaders retain their pinned defaults. Cloth uses one static flex buffer,
freed with every other GL resource; context-loss checks assert all four buffers
are released. Placement and drawing-camera fitting share projected bounds and
composition rules. No dependencies or assets added.

## SEO coverage (11 October 2026)

Crawler checks read the project catalog and parse post files with the existing pure
frontmatter/slug helpers. No duplicate project URL list or separate status parser.
Sitemap uses the existing published-post loader; sample routes stay excluded.

## Heading contrast (11 October 2026)

Deleted the shared heading-dimming rule and its now-unused transition. Kicker reveal
remains the one source; the browser check reads real computed CSS, opacity and backgrounds
in both themes and arrival states rather than pinning palette strings.

## Font request priority (11 October 2026)

Two next/font options change request priority; no new face, CSS override or dependency.
The comparison harness reuses the browser lifecycle and alternates cleared-cache loads
with a fixed sea; output stays ignored under tools/.out/.

## Progressive studio preview (11 October 2026)

StudioPlate owns hydration and rendering; useSeaSettings supplies edition/settings.
One renderSeaPlate implementation still generates both print and live preview; the
initial image uses its existing endpoint. No new API, font asset or dependency.
Sizing/night rules share one SVG/image selector; comparison tool now supports warm loads.

## Publication and sharing (11 October 2026)

Original essays keep their existing source/layout. Sitemap and crawler checks read the
Notebook catalog; share images derive from project visuals through `projectShareImage`.
No duplicated screenshot catalog, new asset or dependency.

Backend review (11 October): shared API query extraction removes inconsistent handling
of repeated version parameters; seed/version parsing remains pure. Security/README scope
now reflects dynamic read-only APIs and the development-only writer.

Private-project case studies keep their mechanisms in content data and Markdown: one source for
the prose, project card and system plate. They state supplied architecture boundaries and avoid
inventing operational metrics, protocols or security properties.

Notebook BlogPosting uses one pure helper over source article facts; the crawler harness derives
its expected fields from the same Notebook catalog and post frontmatter, including Bingbot and
OAI-SearchBot initial-HTML coverage.

## Moon phases (12 October 2026)

Astronomy is pure and separate from lifecycle/GL rendering. Only the hero opts into the
phase shader; shared default strings/error scenes are unchanged. The existing scene effect
owns the minute timer and cleanup. No dependency, remote request, new route or bitmap asset.
The browser harness reuses `tools/lib/browser.mjs`, reads real shader pixels and exercises
reduced-motion date rollover; tests use published USNO dates, not a mean-month approximation.
The follow-up reconstructs sphere normals in the same sky pass: one complete disc, with
phase-derived sunlight and a dim unlit surface. One albedo supplies both sides; a shared
basin function gives restrained surface markings, evaluated only inside the night disc.
No separate crescent geometry or downloaded texture.

## Sky theme interaction (12 October 2026)

Theme authority/persistence/OS tracking lives once in theme.ts; useStudioTheme owns React
subscription/lifecycle, ThemeControl and the sky button render controls. Pure theme-blend and
sky-control geometry stay independent of DOM/React. Existing text measurements and ripple
shader are reused. One frame loop still draws; the canvas records actual blend/ripple counts
for integration checks. No new route, dependency or asset.

## Navigation feedback (13 October 2026)

PageLink is the shared public navigation wrapper. NavigationStatus alone renders the
pending badge; no click timers, global DOM listeners or duplicate per-page loading UI.

## Daylight shaders (13 October 2026)

Sky/glitter additions live together in `daylight-shaders.ts`; existing factories
opt the homepage in and leave pinned error-page defaults intact. Reuse the
existing scene clock, paused lifecycle and draw passes; no dependencies/assets.
