# Code cleanup plan

Goal: a public repository worth reading. Rules: [AGENTS.md](../AGENTS.md). State:
[handoff.md](handoff.md). After each step: verify, update both docs (deleting what is no
longer true), suggest a commit message, and do not commit.

| Step | What                                               | Status                         |
| ---- | -------------------------------------------------- | ------------------------------ |
| 1    | Prettier                                           | done, committed locally        |
| 2    | Delete dead code, generators, comments             | done, committed                |
| 3    | Remove repetition                                  | done, committed                |
| 4    | Split by responsibility                            | done, uncommitted              |
| 5    | Cut the docs, rewrite the README                   | next                           |
| 6    | Make it fun to read (needs the owner's approval)   | last                           |

## Step 5 — documentation

`docs/` is about 3,000 lines of dated process log. **Delete what is no longer true or no
longer useful instead of archiving it**; keep only what a new reader or a future session
needs. Targets: README under 120 lines (what it is, run, release, layout, tests); add a
short `docs/architecture.md`; keep `handoff.md` (under ~100 lines), this file,
`creative-roadmap.md` cut to a decision record, `seo-and-sharing.md`, `follow-ups.md`.
Replace the old `lib/sea-edition.ts` paths in `creative-v2-*` and `research/`, and
reduce `creative-v2-*`, `responsive.md`, `mark.md` and `research/` to what still matters,
or remove them.

## Step 6 — fun to read (ideas, nothing built)

Console greeting with a small ASCII ship, a custom response header, `humans.txt`, a hidden
`/api` sea poem or named hidden sea, playful naming. Constraints: no right-click blocking,
no obfuscation, no accessibility cost, nothing sensitive, no change for ordinary visitors.
