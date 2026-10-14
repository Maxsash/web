# Handoff — start here

Updated 15 October 2026. Read [AGENTS.md](../AGENTS.md) (the rules, the document map and the
record), then only the documents the task needs. Tasks: [follow-ups.md](follow-ups.md);
upkeep runs: [log.md](log.md).

## Current state

1.1.0 is live: `origin/production` is a9239cb (deployed 14 October 18:55 UTC) and production
analytics ingestion was verified at 19:07 UTC. `main` never deploys; releasing is the
owner's action. The owner's iPhone report and every check's latest result are in
[testing.md](testing.md).

The documentation review below was committed on `main` at the owner's request on 15
October, as three commits (content, rules, sea API test). Not pushed. No version bump:
production serves nothing different.

## Documentation review

The owner asked for a review of every document against the rules and the code. "Keep
documents small" had no measure or check, and AGENTS.md told every step to update
code-cleanup.md, so testing, code-cleanup, architecture and seo-and-sharing grew into dated
session logs, with stale claims (ingestion "pending", three projects, the US-East region, an
"open" rate limit, dimming headings, an unreleased badge) and facts kept in several places.

- **testing.md** 790 → 171 lines: one procedure with all 21 checks, what each covers, its
  latest result, harness notes, the phone checklist, the gaps. Its coverage table was broken
  markdown and listed check-seo as 28 cases (it is 78).
- **decisions.md** 636 → 414 (filed by topic, duplicates merged, stale facts fixed);
  **architecture.md** 642 → 475 (dated sections folded in, analytics variables added);
  **sky.md** replaces night-sky.md and architecture's sky sections; **code-cleanup.md**
  deleted (plan done, open items in follow-ups); **follow-ups.md** 204 → 118 (done items
  gone); feedback, seo-and-sharing and the telemetry docs corrected and de-duplicated.
- **Rules found unwritten:** a published post needs its card at
  `public/images/notebook/<slug>.webp`; nothing private may be committed (AGENTS.md "Public
  repository"); check builds must not carry the real `.env` (analytics is fixed at build
  time, so the procedure builds and serves with a placeholder token); the worktree copy needs
  `rsync --delete`, or files deleted in the working tree survive in the check build.
- **AGENTS.md:** the document map with jobs and line budgets; rules (describe now, one home
  per fact, supersede, tasks only in follow-ups, prune then split); Noether's record with
  `docs`, `testing` and `code` upkeep jobs (the owner's choice). Verification points to
  testing.md. **`tools/docs.test.mjs`** enforces the map, budgets, undated headings and every
  relative link and anchor.
- **`tools/sea-api.test.mjs`** skips without `SEA_TEST_BASE`, as README always said and
  `telemetry.test.mjs` already does; it used to fail on a missing `localhost:3001`.
- **README / SECURITY:** README points to the document map and config table and lists the
  drift, portrait and editor folders; SECURITY.md names the analytics relay as an input.
- **Outside the repo:** the five old `tools/.out/` scratch files are in
  `../brand/source/early-scratch/` (the owner's choice; `diagnose.mjs` there is an old
  responsive check, not logo work). No `maxsash-*` Chrome profiles remain under
  `/private/tmp` or `/private/var/folders`; that item is closed. Agent memory updated.

**Nothing lost:** every backticked name, URL, commit hash and measurement in the old documents
was compared against the new set. What was missing and still true was restored: pause cannot
retract received events; star twinkle and steady planets (NASA); the USNO and
Astronomy Engine sources; theme-control details; the iPhone navigation evidence (home hydrated
in about 2.4 s); the surf's 150 Hz reason; the post-Mumbai first byte; a Safari-bars gap. The
rest is superseded or history (old runs, hashes, ports, traces), which stays in git at c87ff2b.

## Verification

Isolated worktree, Node 24.21.0: `tsc`, lint and `format:check` pass. The docs test passes,
and each of its four checks fails on a planted problem (unlisted doc, over budget, dated
heading, missing file and bad anchor). Production build with the placeholder token: 163 Node
tests pass with `SEA_TEST_BASE`; without it 154 pass and 9 skip, none fail. `check-telemetry`
passes 16/16 with the placeholder token, nothing sent to PostHog. Not run: the other browser
checks (no served code changed). Worktrees, server and logs removed.

## Next

1. Owner: push `main` when ready (`git push origin main`); nothing to release.
2. In Noether's repo (not edited from here): tick "web: adopt the record"; its open item about
   web's "test workbench" line is resolved.
3. Noether will show `testing` and `code` as never run; the first full run refreshes testing.md.
4. Then the top of [follow-ups.md](follow-ups.md): the owner's PostHog and Vercel review,
   indexing outcomes, the iPhone navigation report.
