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
