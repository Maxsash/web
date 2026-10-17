# Maxsash Studio

The public site of Maxsash Studio, <https://www.maxsash.com>, a one-person studio for websites
and web apps built end to end: a WebGL sea that resolves into its own mathematics, the work
(screenshots, and drawings of systems that have none), an about and a contact section, a
notebook, a sea studio where visitors build and print their own sea, and a shoreline footer.
Every action gets a small answer of its own, in sound from the first click. Next.js 16,
React 19 and TypeScript. No database, accounts or cookies. Explicitly configured visitor analytics uses in-memory visits without saved
visitor identifiers or person profiles, with separately configured, masked session replay.
Footer privacy controls save recording refusal and a coarse region correction without identity.

Working on this repository? Read [AGENTS.md](AGENTS.md), then
[docs/handoff.md](docs/handoff.md).

## Run it

Requires Node 24 (see `.nvmrc`) and pnpm.

```bash
nvm use
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm format       # Prettier; `pnpm format:check` verifies without writing
```

Writing a notebook post? With `pnpm dev` running, open <http://localhost:3000/write>: a local
editor with the post's fields, a markdown box with a few insert buttons, autosave, and a live
preview of the real page. It exists only in development; a production build has no such route.

No environment variable is required. The optional ones (canonical origin, GitHub token,
build commit, visitor analytics) are listed in
[docs/architecture.md](docs/architecture.md#headers-security-and-configuration); analytics is
off unless configured, and `.env.example` lists its server settings.

## Engineering contracts

The sea model is shared by WebGL, the JSON API and printable SVG. Version 1 is pinned
by a digest so old links stay reproducible; new editions use version 2. Both API routes
validate seed/version parameters, serve deterministic output and support ETag responses.
Pure model/parsing modules are tested apart from rendering. The local editor is excluded
from production, and its writes require same-origin localhost requests.

Builds and tests run in an isolated worktree; see [docs/testing.md](docs/testing.md) for
the production verification procedure.

## Release

`main` is where work happens and never deploys. Only the `production` branch deploys to
the live site (Vercel → Settings → Environments → Production → Branch Tracking), and
`vercel.json` turns automatic deployments for `main` off. To release what is on `main`:

```bash
git push origin main:production
```

The released version is the one in `package.json`, shown in the footer. Versions follow
[Semantic Versioning](https://semver.org/); the rules are in [AGENTS.md](AGENTS.md#versioning)
and the history in [CHANGELOG.md](CHANGELOG.md).

## Layout

| Path                      | What lives there                                                                 |
| ------------------------- | -------------------------------------------------------------------------------- |
| `app/`                    | Routes (`/`, `/sea`, `/work`, `/blog`, `/plate`, `/privacy`), the APIs, sitemap  |
| `lib/telemetry/`          | Event/visit schemas, replay policy, redaction and provider payloads              |
| `lib/sea/`                | The sea model: editions, seeds, sampling, the SVG plate, request parsing         |
| `lib/sound/`              | The synthesised sounds: page turn, surf, compass ticks, feedback cues            |
| `lib/feedback/`           | The feedback vocabulary: what every action answers with, and at what level       |
| `components/observatory/` | The hero: scene lifecycle, its pure rules, the WebGL engine and shaders          |
| `components/drift/`       | The error pages' seas and what floats on them                                    |
| `components/portrait/`    | About's engraved portrait and its compass medal                                  |
| `components/editor/`      | The development-only post editor behind `/write`                                 |
| `components/feedback/`    | The page's answers to the visitor: listeners, arrivals, notices                  |
| `components/shore/`       | The shoreline footer and the commit-log card                                     |
| `components/gull/`        | The gull that lands on "Play waves": its low-poly body, flight and lifecycle     |
| `components/sound/`       | The visit's one audio context, the sound choice, the wave bed and its buttons    |
| `components/telemetry/`   | Memory-only visit context, observations, replay and visitor controls             |
| `components/studio/`      | The sea studio                                                                   |
| `components/atlas/`       | The notebook's scoped styling and plates                                         |
| `content/`                | Copy and data: `site.ts`, `contact.ts`, `projects.ts`, `about.ts`, `notebook.ts` |
| `tools/`                  | Node tests and browser checks; see [docs/testing.md](docs/testing.md)            |
| `docs/`                   | The handoff, follow-ups, decisions, architecture and testing; see AGENTS.md      |

To change copy, edit its content file: identity, the offer, navigation, profiles and links in
[`content/site.ts`](content/site.ts), the "What to expect" steps in
[`content/contact.ts`](content/contact.ts), the about facts in
[`content/about.ts`](content/about.ts), projects in
[`content/projects.ts`](content/projects.ts) (a system drawing is data there too), essays in
[`content/notebook.ts`](content/notebook.ts). The original essays are approved for publication; markdown drafts stay development-only. Shared typography and tokens are in
[`app/globals.css`](app/globals.css); each area scopes the rest in its own CSS module.

## Test

```bash
pnpm exec tsc --noEmit && pnpm lint && pnpm format:check
node --test tools/*.test.mjs        # SEA_TEST_BASE=<url> also runs the API tests
```

The browser checks (`check-seo`, `check-headers`, `check-keyboard`, `check-creative-v2`,
`compare-builds`) run against a production build; how, and what they do not cover, is in
[docs/testing.md](docs/testing.md).

## Further reading

Every document and what it holds is listed in
[AGENTS.md](AGENTS.md#documentation-is-king); start with [docs/handoff.md](docs/handoff.md).
To report a vulnerability, see [SECURITY.md](SECURITY.md).
