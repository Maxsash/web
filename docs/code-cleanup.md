# Code cleanup plan

Goal: a public repository worth reading. Rules: [AGENTS.md](../AGENTS.md). State:
[handoff.md](handoff.md). After each step: verify, update both docs (deleting what is no
longer true), suggest a commit message, and do not commit.

| Step | What                                               | Status                         |
| ---- | -------------------------------------------------- | ------------------------------ |
| 1    | Prettier                                           | done, committed locally        |
| 2    | Delete dead code, generators, comments             | done, uncommitted              |
| 3    | Remove repetition                                  | next                           |
| 4    | Split by responsibility                            | after 3                        |
| 5    | Cut the docs, rewrite the README                   | after 4                        |
| 6    | Make it fun to read (needs the owner's approval)   | last                           |

## Step 3 — remove repetition

1. **Sea requests:** one `lib/sea/request.ts` with shared seed and version parsing, and
   two small policies. Page and print page: no seed → a fresh (or default) version 2 sea,
   a seed without version → version 1. API: unversioned is always version 1, repeated
   `seed` rejected. Replaces copies in `app/page.tsx`, `app/plate/page.tsx`, both routes.
2. **Browser tools:** `tools/lib/browser.mjs` (launch, CDP client, key helpers, local-only
   guard, cleanup that waits for Chrome to exit before deleting the profile) used by every
   `check-*` tool and `compare-builds`.
3. **Work:** move its copy and facts from JSX into `content/projects.ts`; one
   `ProjectFeature` component; rewrite `Work.module.css` (duplicate `.plate`, `.secondary`).
4. One `formatIndex(n)` for the `01`, `02` labels.
5. Merge duplicate CSS selectors (`Observatory`: `.skip:focus-visible`, `.shade`;
   `SeaStudio`: `.controls`); un-export types used in one file.

## Step 4 — split by responsibility

Keep the approved mobile and desktop sea behaviour exactly: extract pure helpers, leave
the frame loop's structure and numbers alone, and test the extracted code.

- `lib/sea-edition.ts` → `lib/sea/` (`types`, `seed`, `random`, `edition-v1` frozen,
  `edition-v2`, `presets`, `describe`, `sample`, `plate`, `request`). Node tests import
  `lib/*.ts` directly, so internal imports need `.ts` extensions and
  `allowImportingTsExtensions`; no `@/` alias in those files.
- `OceanScene` → `stage-director` (opening `t * (2 - t)` over 1,800 ms, other moves
  smootherstep over 600 ms), `reveal-mapping` (mobile progress below 0.55 maps to
  `progress / 0.55 * (0.55 - 0.14) / 0.75`), `layer-opacity`, `frame-governor`,
  `touch-stages` (≥35 px, 1.25× vertical dominance); the component keeps lifecycle only.
- `Shoreline` → `sand`, `tide`, `footprints`, `palette` (budgets stay: 30 Hz, 420,000 px).
- `SeaStudio` → `SettingSlider`, `SeedField`, `KeepActions`, `useSeaSettings`.
- `ocean-engine` → GL helpers, `ship-mesh`, engine. `app/page.tsx` → `Hero`,
  `NotebookSection`.
- `tools/check-creative-v2.mjs` (1,700 lines) → themed suites in `tools/e2e/`.

Gate: unit tests for extracted code, full suite, `compare-builds` identical.

## Step 5 — documentation

`docs/` is about 3,000 lines of dated process log. **Delete what is no longer true or no
longer useful instead of archiving it**; keep only what a new reader or a future session
needs. Targets: README under 120 lines (what it is, run, release, layout, tests); add a
short `docs/architecture.md`; keep `handoff.md` (under ~100 lines), this file,
`creative-roadmap.md` cut to a decision record, `seo-and-sharing.md`, `follow-ups.md`.
Reduce `creative-v2-*`, `responsive.md`, `mark.md` and `research/` to what still matters,
or remove them.

## Step 6 — fun to read (ideas, nothing built)

Console greeting with a small ASCII ship, a custom response header, `humans.txt`, a hidden
`/api` sea poem or named hidden sea, playful naming. Constraints: no right-click blocking,
no obfuscation, no accessibility cost, nothing sensitive, no change for ordinary visitors.
