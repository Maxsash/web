# Maxsash Studio

The public site of Maxsash Studio, <https://www.maxsash.com>: a WebGL sea that resolves
into its own mathematics, project spreads, a notebook, a sea studio where visitors build
and print their own sea, and a shoreline footer. Next.js 16, React 19 and TypeScript.
No database, accounts or cookies.

Working on this repository? Read [AGENTS.md](AGENTS.md), then
[docs/handoff.md](docs/handoff.md).

## Run it

Requires Node 24 (see `.nvmrc`) and pnpm.

```bash
nvm use
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm start
pnpm lint
pnpm format       # Prettier; `pnpm format:check` verifies without writing
```

Writing a notebook post? With `pnpm dev` running, open <http://localhost:3000/write>: a local
editor with the post's fields, a markdown box with a few insert buttons, autosave, and a live
preview of the real page. It exists only in development; a production build has no such route.

Optional environment variables: `NEXT_PUBLIC_SITE_URL` (canonical origin),
`GITHUB_TOKEN` (server-only, raises GitHub's rate limit for the commit-log card),
`NEXT_PUBLIC_BUILD_SHA` (short commit shown in the footer when the host gives none).

## Release

`main` is where work happens and never deploys. Only the `production` branch deploys to
the live site (Vercel → Settings → Environments → Production → Branch Tracking), and
`vercel.json` turns automatic deployments for `main` off. To release what is on `main`:

```bash
git push origin main:production
```

## Layout

| Path                      | What lives there                                                         |
| ------------------------- | ------------------------------------------------------------------------ |
| `app/`                    | Routes: `/`, `/plate`, `/blog`, the sea API, robots and sitemap          |
| `lib/sea/`                | The sea model: editions, seeds, sampling, the SVG plate, request parsing |
| `components/observatory/` | The hero: scene lifecycle, its pure rules, the WebGL engine and shaders  |
| `components/shore/`       | The shoreline footer, wave sound and the commit-log card                 |
| `components/studio/`      | The sea studio                                                           |
| `components/atlas/`       | The notebook's scoped styling and plates                                 |
| `content/`                | Copy and data: `site.ts`, `projects.ts`, `notebook.ts`                   |
| `tools/`                  | Node tests and browser checks; see [docs/testing.md](docs/testing.md)    |
| `docs/`                   | Architecture, decisions, testing, SEO, follow-ups and the handoff        |

To change copy, edit its content file: destinations and links in
[`content/site.ts`](content/site.ts), projects in
[`content/projects.ts`](content/projects.ts), essays in
[`content/notebook.ts`](content/notebook.ts). Keep sample status explicit until real
content exists. Shared typography and tokens are in
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

- [docs/architecture.md](docs/architecture.md): routes, the sea model, rendering, the footer
- [docs/decisions.md](docs/decisions.md): what was decided and why
- [docs/testing.md](docs/testing.md): the checks, and what has never been checked
- [docs/seo-and-sharing.md](docs/seo-and-sharing.md): search, link cards and owner setup
- [docs/follow-ups.md](docs/follow-ups.md): open items
- [SECURITY.md](SECURITY.md): reporting a vulnerability
