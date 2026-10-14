# Upkeep log

One line per upkeep run, newest first: `- YYYY-MM-DD job: what it found and what changed`.
The jobs and their cadence are in [AGENTS.md](../AGENTS.md#record).

- 2026-10-15 docs: testing, follow-ups, code-cleanup, architecture and seo had grown into dated
  session logs with stale claims and facts in two or three places. Rewrote them as current state
  within new budgets; code-cleanup went into follow-ups, night-sky and architecture's sky into
  sky.md. AGENTS.md gained the budgets, the record and a public-repository rule, enforced by
  `tools/docs.test.mjs`. Also found: check builds carried the real `.env` (now a placeholder
  token) and the sea API tests failed without a server (now skip). Lint, types, format and
  163 Node tests pass.
