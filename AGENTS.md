<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Creative iteration workflow

Before a creative change, read the sections of `docs/decisions.md` and
`docs/architecture.md` that cover the area. The confirmed direction is A for the main
website, B for the blog, and C as an optional Easter egg. Make creative changes directly in
the main site. Do not create sample routes or a separate review gallery. Do not claim
unperformed checks.

# Documentation is king

Assume the session can end at any moment (battery, token limit, lost device). Anything
important that exists only in the conversation or in memory is lost. After **every step**,
before reporting back, rewrite `docs/handoff.md` and update every document the step
affected.

Each document has one job and a line budget:

| Document                   | Its job                                                              | Lines |
| -------------------------- | -------------------------------------------------------------------- | ----- |
| `docs/handoff.md`          | Now: work in progress, next steps, what was verified, the commit     | 100   |
| `docs/follow-ups.md`       | Every open task and idea, as `- [ ]` lines under headings            | 150   |
| `docs/log.md`              | One line per upkeep run, newest first                                | 40    |
| `docs/decisions.md`        | Each live decision once: who decided, when and why                   | 450   |
| `docs/architecture.md`     | How the code is built now and the contracts it keeps                 | 500   |
| `docs/testing.md`          | How to verify, what each check covers, its latest result, the gaps   | 200   |
| `docs/sky.md`              | How the sky is drawn, its accuracy, sources and budgets              | 180   |
| `docs/feedback.md`         | What answers each visitor action, and how to change it               | 160   |
| `docs/seo-and-sharing.md`  | Search, link cards and the owner's account setup                     | 120   |
| `docs/telemetry.md`        | The analytics contract, its data boundaries and how to read it       | 120   |
| `docs/telemetry-setup.md`  | Analytics configuration, dashboards and release checks               | 80    |
| `docs/replay-review.md`    | India replay assessment, evidence, limits and recommended safeguards | 120   |
| `docs/visitor-journeys.md` | Personalisation research and its blog brief                          | 90    |
| `docs/blog-ideas.md`       | Findings and post ideas for the Notebook                             | 120   |
| `AGENTS.md`                | These rules                                                          | 170   |
| `README.md`                | What the site is, how to run it and where things live                | 120   |

- **Describe now; git holds history.** Rewrite or delete what stops being true instead of
  appending. No heading carries a date, and no document keeps a session's story. What a
  change verified goes in its commit body (and the handoff until it is committed);
  `docs/testing.md` keeps only each check's latest result.
- **One home per fact.** Write it once, in the document whose job it is, and link to it.
- **Supersede, don't stack.** A changed decision rewrites its entry. A rejected idea keeps
  one line saying why, so it is not tried again.
- **Tasks live in `docs/follow-ups.md`.** The handoff may name the next few and link there.
  Delete a done task once its outcome is recorded where it belongs.
- **Over budget: prune, then split.** If pruning is not enough, split the document by its
  sections into `docs/<name>/`, and update this table and the links. A new document needs a
  row here; prefer a section of an existing one.
- `node --test tools/docs.test.mjs` checks this table against `docs/`, the budgets, dated
  headings, and every relative link and anchor.

# Record

This repository keeps a record of where it stands for people, agents and Noether (the
owner's dashboard across repositories): state in `docs/handoff.md`, tasks in
`docs/follow-ups.md`, upkeep runs in `docs/log.md`.

```noether
state = "docs/handoff.md"
tasks = ["docs/follow-ups.md"]
log = "docs/log.md"
state_lines = 100

[upkeep]
docs = { every = "14d", commits = 40 }
testing = { every = "14d", commits = 40 }
code = { every = "30d", commits = 80 }
```

A job is due once its days or commits have passed since its last log line; `docs` and
`testing` also run before every release.

- **docs:** read every document against the code and against each other; delete what is
  stale, duplicated or done; bring each within budget; move any rule that lives only in an
  agent's memory into this file.
- **testing:** all of "Run everything" in `docs/testing.md`, then update its latest results.
- **code:** the code conventions below across the tree: comments that say what, repetition,
  dead code and unused exports, modules with more than one job.

After a run, add one line at the top of `docs/log.md`: `- YYYY-MM-DD job: what it found and
what changed`, even when it found nothing. Keep the last five runs of each job.

# Clean up immediately

Delete anything as soon as it is no longer needed, whether or not git tracks it:
temporary worktrees, build and test output, scratch scripts, backups, downloads, logs
and screenshots. Stop the servers you started. Before reporting a step, remove what the
step created. Anything that must stay for now (for example, captures awaiting the
owner's review) goes in `docs/handoff.md` with when to delete it. Leftovers that are not
dealt with at once are lost track of and go stale.

# Git and deployment

Never commit or push unless the user explicitly asks in the current session. Leave
work uncommitted for review; the user commits it. At each review point, suggest a
commit message (conventional style: a type, a short summary, a body explaining why and
what was verified) and put it in `docs/handoff.md`. `main` never deploys; only the
`production` branch does, and releasing is the user's action.

A commit holds one logical change, not everything in the working tree. When the
work spans unrelated changes (a feature and a docs fix, a process rule and a
refactor), stage and commit them separately, each with its own message, so every
commit can be reviewed, reverted and versioned on its own. Suggest the split at
the review point.

# Versioning

The site follows [Semantic Versioning](https://semver.org/). `package.json` holds the
version (the footer shows it), [CHANGELOG.md](CHANGELOG.md) records each one, and each
version commit carries an annotated `vX.Y.Z` tag.

The public contract is what visitors and other programs rely on: page URLs, the
`/api/sea-edition` JSON and SVG responses and their parameters, and shared sea links
(a seed and sea model always draw the same sea). The sea model `version` in those URLs
is separate from the site version.

- MAJOR breaks the contract: a URL removed or moved without a redirect, an API field
  or parameter removed or changed, a published sea model redrawn.
- MINOR adds without breaking: a feature, page, creative pass, API field or new sea
  model. A redesign is MINOR while the contract holds, and so is removing or replacing
  something outside it (the gull, a sound, a creative pass).
- PATCH refines what exists: bug fixes, copy, tuning, performance, accessibility,
  dependency updates.
- No bump when production would serve nothing different: docs, tests, tooling.

Every commit that changes what production serves bumps the version in that commit:
`package.json`, a dated CHANGELOG entry and a matching commit type (`feat` is MINOR,
`fix`, `perf` or a shipped `refactor` is PATCH, `!` is MAJOR). Work left for review
includes its bump; suggest the tag command with the commit message.

# Public repository

Everything committed here is public. Never commit the owner's personal email, a phone number
as visible text (the studio's WhatsApp number appears only inside its link), the employer's
name, degrees, private photos, keys, or the owner's traces, exports and account screenshots.
Strip every image's metadata before committing it (`magick <file> -strip <file>`); Canva and
screenshots embed the author's name and account IDs. `tools/image-metadata.test.mjs` checks.
Research lives in `../web-research/` and the brand kit in `../brand/`, beside the repository.
Commits use the studio identity in `docs/decisions.md` ("Security and hosting").

# Code conventions

Follow the [public-site and replay constraints](docs/decisions.md#business-audience-and-public-site-boundary): flag boundary changes; honour rules/preferences; no arrival consent prompts.

Write code that is a pleasure to read.

- No comments unless the reason is not visible in the code. Express intent through
  names, small functions and types. A comment explains why, never what.
- No repetition. Extract the second copy of anything; one source of truth for content,
  parsing, setup and styling.
- One responsibility per module. Keep pure logic (no DOM, no React) apart from
  rendering and lifecycle code so it can be tested directly.
- Delete dead code, unused exports, CSS and assets instead of keeping them for later.
- Format with `pnpm format`; `pnpm format:check` must pass.

# Verification

Run on Node 24 (`.nvmrc`), against a production build in a separate git worktree, never in
the folder where a dev server may be running, and stop only servers you started. What to run
for each change, and what each check covers, is in `docs/testing.md`.
