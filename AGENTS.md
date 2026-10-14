<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Creative iteration workflow

Read `docs/decisions.md` and `docs/architecture.md` before creative changes, and keep
them, `docs/testing.md` and the routes they describe current at every logical
checkpoint. The confirmed direction is A for the main
website, B for the blog, and C as an optional Easter egg. Make creative changes
directly in the main site. Do not create sample routes or a separate review gallery.
Do not claim unperformed checks.

# Documentation is king

Assume the session can end at any moment (battery, token limit, lost device). Anything
important that exists only in the conversation or in memory is lost.

- `docs/handoff.md` is the start-here file. After **every step**, before reporting back,
  rewrite it: current state, what is next, open items, new decisions and facts, and what
  was and was not verified. Update `docs/code-cleanup.md`, `docs/decisions.md`,
  `docs/architecture.md` and `docs/testing.md` when they are affected.
- Keep documents small. Delete what is no longer true or no longer useful instead of
  appending to it; the handoff stays under about 100 lines.

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
  model. A redesign is MINOR while the contract holds.
- PATCH refines what exists: bug fixes, copy, tuning, performance, accessibility,
  dependency updates.
- No bump when production would serve nothing different: docs, tests, tooling.

Every commit that changes what production serves bumps the version in that commit:
`package.json`, a dated CHANGELOG entry and a matching commit type (`feat` is MINOR,
`fix`, `perf` or a shipped `refactor` is PATCH, `!` is MAJOR). Work left for review
includes its bump; suggest the tag command with the commit message.

# Code conventions

This repository is public. Write code that is a pleasure to read.

- No comments unless the reason is not visible in the code. Express intent through
  names, small functions and types. A comment explains why, never what.
- No repetition. Extract the second copy of anything; one source of truth for content,
  parsing, setup and styling.
- One responsibility per module. Keep pure logic (no DOM, no React) apart from
  rendering and lifecycle code so it can be tested directly.
- Delete dead code, unused exports, CSS and assets instead of keeping them for later.
- Format with `pnpm format`; `pnpm format:check` must pass.
- Run builds and tests in a separate git worktree, never inside the folder where a dev
  server may be running, and stop only servers you started.

# Verification

Run on Node 24 (`.nvmrc`). Against a production build: `node --test tools/*.test.mjs`
(with `SEA_TEST_BASE`), `tools/check-seo.mjs`, `tools/check-headers.mjs`,
`tools/check-keyboard.mjs`, `tools/check-creative-v2.mjs`. Also `pnpm lint`,
`pnpm exec tsc --noEmit` and `pnpm format:check`.
