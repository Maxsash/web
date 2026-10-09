# Testing

What exists, how to run it, and what has never been checked. Rules: never build or test
inside the project folder (a dev server may be running there) and stop only servers you
started.

## Run everything

Use Node 24 and a production build in a scratch copy:

```bash
rsync -a --exclude node_modules --exclude .next --exclude .git --exclude tools/.out ./ $SCRATCH/wt/
cd $SCRATCH/wt && pnpm install --frozen-lockfile && pnpm build
(pnpm exec next start -p 3012 &)

pnpm exec tsc --noEmit && pnpm lint && pnpm format:check
SEA_TEST_BASE=http://localhost:3012 node --test tools/*.test.mjs
node tools/check-seo.mjs http://127.0.0.1:3012
node tools/check-headers.mjs http://localhost:3012
node tools/check-keyboard.mjs http://localhost:3012
node tools/check-software-fallback.mjs http://localhost:3012
node tools/check-page-turn.mjs http://localhost:3012
node tools/check-creative-v2.mjs http://localhost:3012
```

Last full result (9 October 2026, the compass-medal portrait): 65 Node tests, 20 SEO cases (including that drafts and the editor routes are not served), header checks, 20 keyboard checks, software fallback, page turn, 133 browser records, no failures. `compare-builds` cannot prove "unchanged" across a change in section heights: a section above that ends on a fractional pixel shifts everything below it by a sub-pixel and re-antialiases the text. Compare computed styles and relative boxes instead (done for Work, the studio and the notebook: identical).

## What each check covers

| Check                       | Covers                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `tools/*.test.mjs`          | The About portrait (engraving: rows, light lifts the lines, the sea's ripples, luma sampling; bezel: ticks, face inset, legend arcs), error-page scenes (homepage shaders byte-identical, no ship on error seas, whirlpool sampling, drifting poses, lightning never flickers, torn edge, driftwood meshes), markdown parser, post structure, post files and the editor's request guard, and every post's frontmatter, sea model (v1 digest, v2, plate, request parsing), the two API routes, sun and moon lighting, stage easing, reveal mapping, frame pacing, swipes, ship mesh, matrices, camera. `sea-api.test.mjs` needs `SEA_TEST_BASE`. |
| `check-seo.mjs`             | 20 crawler and page combinations (WhatsApp, Facebook, Twitter, Google bots): canonical, cards, images, index and noindex, structured data; discovery files; unknown-article 404. |
| `check-headers.mjs`         | Security headers, `security.txt`, and no CSP violation on the main pages in headless Chrome.             |
| `check-keyboard.mjs`        | Real Tab, Shift+Tab, Enter, Space and arrow events: visible focus, on screen, not covered, 24 px minimum, and the main controls. |
| `check-software-fallback.mjs` | A browser with no GPU (`--disable-gpu`) must show the static plate: renderer marked fallback, nothing drawn, plate visible, page readable. |
| `check-page-turn.mjs`       | The page turn: silent by default, plays on entering and moving within the notebook once sound is on, silent on the same page and after muting. The shape (and low hissiness) of the sound is unit-tested; how it sounds is not. |
| `check-creative-v2.mjs`     | Browser behaviour in isolated headless Chrome: content, viewports, lifecycle (pause, resume, context loss), shader-to-CPU parity, mobile stages, fallbacks, shore, theme, sound, asset sizes. The suites live in `tools/e2e/`. |
| `compare-builds.mjs`        | Pixel comparison of two builds over 44 views (11 pages and homepage sections, desktop and phone, day and night). The way to prove a refactor changed nothing. |
| `measure-routes.mjs`        | Gzipped inventory of the assets each route references. Not Web Vitals.                                   |

`check-creative-v2.mjs` also takes `--quick` (a small screenshot subset), `--diagnose`
(read-only desktop cadence; may target `www.maxsash.com`), and `--scroll` or
`--native-scroll` to measure the sea reveal. Reports and screenshots go to ignored
`tools/.out/`. `--use-angle=swiftshader` is an explicit software backend that Chrome still accepts as
WebGL, so the other tools keep it for steadier rendering; only `--disable-gpu` triggers the
fallback. Every browser tool creates its own Chrome profile and removes it on exit
(`tools/lib/browser.mjs`).

For a refactor, build the previous commit on another port and run
`node tools/compare-builds.mjs <old url> <new url>`. The phone Work image can be flagged
in a single run, even when a build is compared with itself (lazy-image timing); repeat the
run. Servers that just started also have a cold image cache.

## Error pages

See them at `/nope`, `/blog/nope` and `/plate?seed=zz` on any build. The crash pages need a
throw: in a scratch copy only, add a page that throws (for `error.tsx`) and make the root
layout throw (for `global-error.tsx`); never commit either. No automated browser check
covers the error pages yet, and no parity test compares the whirlpool shader with
`sampleDrift`.

## Never checked

Everything above runs in headless Chrome on a Mac. Not covered, so do not claim it:

- a real screen reader (VoiceOver on Mac and iPhone, NVDA, TalkBack) and Reader mode;
- physical phones beyond the owner's own report that the staged mobile sea is smooth on
  an iPhone, and battery, thermal or GPU qualification;
- field Web Vitals and the Vercel runtime (headers and the sea API are tested locally);
- a printed plate on paper, and the real WhatsApp app's preview;
- Search Console, indexing and AI citation outcomes.
