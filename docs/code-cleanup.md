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
| 5    | Cut the docs, rewrite the README                   | done, uncommitted              |
| 6    | Make it fun to read (needs the owner's approval)   | next, ideas only               |

## Step 6 — fun to read (ideas, nothing built)

Console greeting with a small ASCII ship, a custom response header, `humans.txt`, a hidden
`/api` sea poem or named hidden sea, playful naming. Constraints: no right-click blocking,
no obfuscation, no accessibility cost, nothing sensitive, no change for ordinary visitors.
