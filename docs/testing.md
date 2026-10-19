# Testing

How the site is checked, the latest result of each check, and what has never been checked.
What a change verified belongs in its commit body; this file keeps only the latest result.

## Rules

- Node 24 and a production build in a detached worktree, never in the project folder (a dev
  server may be running there). Stop only servers you started; delete the worktree, captures
  and logs when done.
- Every change runs the core checks: types, lint, format, Node tests, `check-seo`,
  `check-headers`, `check-keyboard` and `check-creative-v2`. Add the focused checks for the
  area it touches. Acquisition changes run `check-acquisition`; replay changes run `check-replay`. The `testing` upkeep job (AGENTS.md) runs all of them.
- Automated checks never reach the real PostHog project: the worktree copy leaves out `.env`,
  and the build and server get a placeholder token instead. Analytics is decided at build time
  (static pages are prerendered), so the token must be set for `pnpm build` too.
  `SEA_TEST_BLOCK_TELEMETRY=1` also blocks analytics requests in every browser check except
  `check-telemetry` and `check-replay`, which intercept their own.

## Run everything

```bash
nvm use
CHECK_DIR=$(mktemp -d /tmp/maxsash-check.XXXXXX)
git worktree add --detach "$CHECK_DIR/wt" HEAD
rsync -a --delete --exclude node_modules --exclude .next --exclude .git --exclude tools/.out \
  --exclude .env ./ "$CHECK_DIR/wt/"
export TELEMETRY_ENABLED=true POSTHOG_PROJECT_TOKEN=phc_placeholder_for_checks
cd "$CHECK_DIR/wt" && pnpm install --frozen-lockfile && pnpm build
(pnpm exec next start -p 3012 &)
URL=http://localhost:3012

pnpm exec tsc --noEmit && pnpm lint && pnpm format:check
SEA_TEST_BASE=$URL node --test tools/*.test.mjs
node tools/check-acquisition.mjs $URL
node tools/check-telemetry.mjs $URL
node tools/check-replay.mjs $URL
export SEA_TEST_BLOCK_TELEMETRY=1
node tools/check-seo.mjs http://127.0.0.1:3012
for check in headers keyboard creative-v2 ship gull sound software-fallback browser-bars \
  sky-theme moon moon-detail moon-sea stars planets navigation studio-plate \
  heading-contrast drawing-labels; do node tools/check-$check.mjs $URL || echo "FAILED $check"; done

# Clean up at once: keep only captures the owner still has to review.
lsof -ti tcp:3012 -sTCP:LISTEN | xargs kill
cd - && git worktree remove --force "$CHECK_DIR/wt" && rm -rf "$CHECK_DIR"
```

`check-dev-sky` needs `pnpm dev` in its own worktree, opened at `localhost` (Next's dev server
blocks its resources from `127.0.0.1`).

## What each check covers

- **`tools/*.test.mjs`** (no browser): the sea model (v1 digest, v2, plate, request parsing),
  the two API routes and the analytics endpoint (skipped unless `SEA_TEST_BASE` names a server), shader defaults byte for byte, sun, Moon,
  stars, planets and daily atmosphere, the ship, gull, portrait and system drawings, stage
  easing, reveal mapping, frame pacing and swipes, sounds and feedback cues against a
  laptop-speaker model, the markdown parser, posts, case studies and the editor's request
  guard, telemetry schema and redaction, these documents (`docs.test.mjs`), and that no image
  in `public/` or `app/` carries EXIF, XMP, IPTC, text or time metadata (`image-metadata.test.mjs`).
- **`check-seo`**: 78 crawler and page cases (Google, Bing, OAI-SearchBot, social bots):
  canonicals, title and description lengths, cards, index and noindex, structured data, the exact sitemap, discovery files,
  share-card size, manifest icons, drafts and unknown pages 404, the `/work` redirect.
- **`check-headers`**: security headers, `security.txt`, no CSP violation on the main pages.
- **`check-keyboard`**: real Tab, Shift+Tab, Enter, Space and arrows: focus visible, on screen,
  not covered, at least 24 px, and the main controls work.
- **`check-creative-v2`**: content, viewports, lifecycle (pause, resume, context loss),
  shader-to-CPU parity, mobile stages, links, fallbacks, shore, theme, sound and asset sizes.
  Suites live in `tools/e2e/`. `--quick` takes fewer screenshots; `--diagnose` measures desktop
  cadence (may target `www.maxsash.com`); `--scroll` or `--native-scroll` measure the reveal.
- **`check-telemetry`**: configured capture with requests intercepted, no analytics storage,
  section qualification, content and contact events, pause and resume, redaction, failures.
- **`check-acquisition`**: Instagram/WhatsApp/LinkedIn entry links and contact attribution,
  with requests intercepted and no external email activation.
- **`check-replay`**: mocked country/privacy policies and intercepted PostHog requests;
  no arrival/URL prompts, deliberate footer opt-in, snapshots, masking, joined IDs; stop/restart/pause, region correction,
  real second-tab refusal sync, storage failure, rapid corrections, expiry and voluntary
  Start after expiry; disabled recording, browser privacy signals and CSP.
- **`check-ship`**: rendered triangles clear text and edges at six sizes, day and night, Drawing,
  150% text, rotation, paused and reduced-motion cloth, native mobile reveal.
- **`check-gull`**: contact with the pill border, label clearance and no clipping across live
  resizes, DPR 1–3, larger text, day and night, standing, sleeping and Drawing.
- **`check-sound`**: every sound against the visitor's choices with Web Audio spied on. How it
  sounds is not tested: listen to `node tools/render-sounds.mjs` (WAV files in `tools/.out/`).
- **`check-software-fallback`**: with `--disable-gpu` the static plate shows and the page reads.
- **`check-browser-bars`**: the colour Safari 26+ takes for each bar matches `theme-color` and
  the rendered edge rows, across the hero, Notebook, error pages and a no-GPU fallback.
- **Sky:** `check-sky-theme` (sun and Moon toggle: ripple, blend, reversal, saved choice,
  reduced motion), `check-moon` (phase shading from real shader pixels, India midnight),
  `check-moon-detail` (mapped Moon request, crossfade, geometry, fallbacks), `check-moon-sea`
  (moonlight on the water by phase), `check-stars` and `check-planets` (dated points, day hiding).
- **`check-navigation`**: the "Opening page…" badge while a page's requests are held, keyboard
  and touch; a case study prefetched in view opens without another request; home is not prefetched.
- **`check-studio-plate`**: the no-JS print image and the hydrated SVG agree, in both themes.
- **`check-heading-contrast`**: rendered heading contrast in every arrival state and theme.
- **`check-drawing-labels`**: system-drawing labels fit their boxes with loaded fonts.
- **Comparisons:** `compare-builds <old> <new>` pixel-compares 36 views (prove a refactor changed
  nothing); `compare-font-loading <a> <b> [rounds] [--warm]` alternates cold loads;
  `measure-routes` lists gzipped assets per route (not Web Vitals).

## Latest results

Each check appears once, under the date it last passed; move it up when it runs again.

- **19 October, 1.4.3** (isolated build): types, lint, format, 173 Node tests, SEO 78 (title
  ≤ 65, description 25–160, JPEG cards), headers, keyboard 22/22, navigation 3, creative 191
  without exceptions.
- **19 October, 1.4.1:** taps at 4× CPU 0.05–0.08 s on 4G and 3G (were 0.5 s and 1 s).
- **19 October, 1.4.0** (isolated production build on the Mac, Node 24.21):
  `check-browser-bars` 30/30 and `check-sky-theme` 12 cases, both on the Open water palette.
- **17 October, 1.4.0:** acquisition 6, telemetry 20 and replay 38, provider traffic
  intercepted; all seven live acquisition queries run without warnings. No synthetic events.
- **17 October, 1.3.0** (sandbox with local copies of the same font faces): heading contrast
  128 (lowest 5.33:1), studio plate 8, drawing labels.
- **17 October, 1.2.0:** privacy controls inspected at 390×844; native select, Tab/Space
  refusal and no horizontal overflow verified. Real production replay ingestion unverified.
- **14 October, 1.0.0:** `check-ship` 36/36.
- **12 October:** `check-moon`, `check-moon-detail`, `check-moon-sea`, `check-stars`,
  `check-planets`, `check-software-fallback`; `check-dev-sky` before the Moon map was cropped.
- **11 October:** `check-gull` (47), `check-sound`.

**Production, public reads:** 19 Oct: the footer shows 1.4.0 (the owner's check). 17 Oct:
enabled India replay policy, 10% sampling and 30 April expiry verified; actual live recording
ingestion not checked.

**Link previews (the owner, 19 Oct, 1.4.0):** Facebook Sharing Debugger, LinkedIn Post
Inspector and WhatsApp show the new cards for home, a case study and an article. On LinkedIn the
case-study and article images look slightly soft; see [follow-ups.md](follow-ups.md).

**Production, by hand:** 14 Oct 19:07 UTC, schema-1 `page_view` and `section_view` reached
PostHog redacted; the live relay answers 403 to a missing or foreign Origin, 400 to a bad batch,
415 to a wrong type and 405 to GET. 13 Oct: the live sitemap lists 11 URLs, and both essays
are indexable with self-canonicals. Live contact, studio and navigation events, pause and
Vercel rate limits are not checked.

**Network path (19 Oct, Jio):** new `www` addresses 0 stalls in 480; [why](seo-and-sharing.md#owner-setup).

**Owner, iPhone Air on iOS 27 (13 Oct, the owner's report):** Safari day and night, Notebook,
touch, gull, rotation, sounds, case studies, sea studio, Reduce Motion and the VoiceOver
checklist below all work; WhatsApp previews work. The page feels somewhat long.

## Harness notes

- Turbopack needs `node_modules` installed in the worktree (a symlink fails its root check).
  The build fetches Google Fonts, and in a sandbox Turbopack also needs to bind worker ports;
  the checks need localhost.
- `check-seo` refuses anything but a local server. Captures and reports go to ignored
  `tools/.out/<check>/`; delete them once reviewed.
- Mobile-stage checks use Chrome's real touch emulation, not a `matchMedia` override.
- Replay checks emulate ordinary Chrome UA/automation properties because the SDK filters
  bots before its outgoing event hook. Production bot filtering stays on. Core event-blocking
  harnesses also block the policy path; `check-replay` separately covers the enabled UI.
- Each browser tool makes and removes its own Chrome profile (`tools/lib/browser.mjs`), and
  waits for a populated DevTools port file. Some Node processes (keyboard, creative, gull) have
  lingered after printing their result; stop them once the report is written.
- `--use-angle=swiftshader` still counts as WebGL, so the tools keep it for steady rendering;
  only `--disable-gpu` triggers the fallback.
- `compare-builds` cannot prove "unchanged" once a section above changes height: a fractional
  shift re-antialiases text. Compare computed styles and relative boxes instead. A lazy phone
  Work image can differ even between identical builds; repeat the run.
- **Scroll cost:** build the previous commit (`git archive HEAD | tar -x -C <dir>`) and run
  `check-creative-v2 --diagnose --scroll` against both, at least twice; compare p95, long tasks,
  `RecalcStyleCount` and `LayoutCount`.

## Error pages

See them at `/nope`, `/blog/nope` and `/plate?seed=zz` on any build. The crash pages need a
throw: in a scratch copy only, add a page that throws (for `error.tsx`) and make the root
layout throw (for `global-error.tsx`); never commit either. No automated browser check
covers the error pages, and no parity test compares the whirlpool shader with `sampleDrift`.

## Phone checklist

For a physical iPhone on the production site (the owner ran it on 13 October):

1. **Reduce Motion** (Settings → Accessibility → Motion), then reload home: sea, ship and gull
   stay still; stage controls still reach Drawing and Work; the theme swaps without a fade or
   ripple; all text shows. Check Notebook, a case study and `/sea`, then toggle the setting
   with home open and return without reloading.
2. **VoiceOver** (set the Accessibility Shortcut to VoiceOver; triple-click the side button).
   Swipe through "Skip to work", the navigation, sea, stage and theme controls, a case-study
   link, the Notebook and back, the copy-email notice and the shore's mute control. Rotor
   Headings should reach every section. On `/sea`, sliders announce name and value and adjust
   with one-finger up and down; presets, dice, copy link and notices are reachable. Report the
   page, the control and the exact words spoken.

## Never checked

- Screen readers beyond the owner's iPhone VoiceOver pass: VoiceOver on Mac, NVDA, TalkBack,
  Reader mode; the "Opening page…" badge with VoiceOver.
- Android and other physical browsers; battery, thermal or phone GPU measurements.
- Safari's bars on a real phone: whether finger scrolls out of the hero restore the body
  colour, and whether the theme switch and Drawing stage update them.
- Field Web Vitals and the Vercel runtime (headers and the sea API are tested locally).
- A printed plate on paper.
- Speaker and headphone listening, Firefox audio, Android vibration.
- The hidden tab's title and icon in a real browser (tested by faking `document.hidden`), and
  idle and offline beyond headless Chrome's emulation.
- Search Console indexing, real crawler-IP access and AI citations.
