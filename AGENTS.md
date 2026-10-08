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

# Git and deployment

Never commit or push unless the user explicitly asks in the current session. Leave
work uncommitted for review; the user commits it. At each review point, suggest a
commit message (conventional style: a type, a short summary, a body explaining why and
what was verified) and put it in `docs/handoff.md`. `main` never deploys; only the
`production` branch does, and releasing is the user's action.

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
