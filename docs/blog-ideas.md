# Blog ideas

Material for the Notebook: findings that needed an experiment because they could not be found
documented online, and posts the owner asked for. Each finding says what was true and how it
was found. Add to it whenever something similar turns up; when a finding becomes a post, move
it under "Written" as one line. Writing a post is a task in [follow-ups.md](follow-ups.md).

This is the source of truth for blog ideas; agent memory should point here rather than keep
a separate backlog. Record new angles and the evidence needed here, with open writing tasks
in follow-ups. An idea is not permission to publish, and recorded findings are not new checks.

## Written

- WebGL's `failIfMajorPerformanceCaveat` only rejects a truly GPU-less browser:
  `content/posts/01-the-webgl-flag-that-half-works.md` (published).
- CSS bundle order decided which equal-specificity rule won:
  `content/posts/02-i-moved-some-imports-and-my-headings-changed.md` (draft).
- PageSpeed's 27.7 s Total Blocking Time did not reproduce locally:
  `content/posts/03-reading-pagespeed-with-a-webgl-hero.md` (draft).

## Posts the owner asked for

- **"Make the sea answer every scroll": feedback beyond sound, and the gull.** From the research
  report `../web-research/reports/Website feedback beyond sound.md` and the gull's build on
  "Play waves" (`components/gull/`). Angle: what award sites and craft practitioners do, why a
  nudge must land once and then keep still (Bartram 2003, WCAG 2.2.2), vibration's retreat
  (iOS 26.5), and a gull drawn from maths. Experiments from that build:
  - A folded wing built from a skeleton alone hung below the belly; blending each wing panel
    toward a hand-placed folded shape on the body's flank (a `fold` amount) read as a gull at
    44 px.
  - A second canvas in the hero silently changed an existing check: `querySelector('canvas')`
    found the gull's 2D canvas (`getContext('webgl2')` null, triangles NaN). Select by name.
  - A frame loop that stops when "nothing changed this frame" never starts an ease, because
    the first frame after rest has a zero time step; compare against the targets instead.
  - CDP `Page.captureScreenshot` clips are in document coordinates: after scrolling, a clip
    built from `getBoundingClientRect()` needs `scrollY` added or it shows the wrong area.
- **"My site was fast; the road to it wasn't": random 5–26 s page loads traced to DNS.**
  The owner asked for it (19 October). Taps on Notebook and case-study links sometimes hung,
  though every page is a cache HIT in Mumbai. The method is the post: reproduce in a real
  browser against production (16.5 s and 26.4 s taps, ~1 in 15); read the timings (first byte
  waited, later requests on the same HTTP/2 connection were fast); decode `x-vercel-id`'s
  timestamp (the request reached the edge ~5 s late, so the server was innocent); probe one
  connection per address. The domain's project CNAME (`64.29.17.x`, `216.198.79.x`) stalled
  together about every 70 s from Jio; Vercel's legacy `cname.vercel-dns.com` and
  `76.76.21.21` did not, though Vercel's dashboard keeps recommending the stalling record.
  Then the second half: links that never prefetched (0.5 s on 4G, 1 s on 3G) now open in
  0.05 s for about 100 KB per full home scroll. Evidence in
  [seo-and-sharing.md](seo-and-sharing.md#owner-setup); approved figures only.
- **"Before personalising my website, I needed to understand its visitors":** the brief is in
  [visitor-journeys.md](visitor-journeys.md).

## Findings

- **Pixel diffs can't prove "unchanged" once a section above changes height.** A 1180.8 px
  section shifted Work, the studio and the Notebook by 0.8 px; their screenshots differed in
  tens of thousands of text pixels (channel deltas about 200) while every element's computed
  style and relative box were identical (309 of 311; the rest zero-size SVG nodes). Sub-pixel
  offsets re-antialias glyphs.
- **Splitting one JSX text node into several shifts a glyph by a sub-pixel** (seen in a pixel
  diff at the "↗" after a case-study link), though the text is identical.
- **Pixel-diff tools flake on lazy images:** the same build compared with itself sometimes
  differed on one phone image; fresh-browser captures were identical.
- **A more specific earlier rule can swallow a later fix:** replacing `opacity` with a colour
  on `.sailing` did nothing, because `.actions .sailing { color: inherit }` was more specific.
  Related: Lighthouse reports the contrast failure on `.sailing` only when the random sea
  matches the studio's seed.
- **`getComputedStyle` of a scroll-timeline-animated registered property can be stale.**
  Right after a large programmatic scroll, Chrome reported `--progress: 1` while the
  screenshot showed the correct mid-animation frame; later reads agreed. Check scroll-driven
  states by pixels.
- **`content-visibility: auto` below the fold changed hero layout cost by under 10%** (about
  130 ms at 4x CPU throttle), so the report's "forced reflow" is just the first layout.
  Measured with `Performance.getMetrics` over three runs each.
- **The `x-vercel-id` header shows where a page really renders:** `bom1::iad1` means a Mumbai
  edge but a function in US East, which can dominate first byte for a dynamic page (0.4–1.8 s
  from India). Found by reading headers, not docs.
- **Next 16.3's `next dev` writes `AGENTS.md` and `CLAUDE.md` when it detects an AI coding
  agent**, appending a managed `<!-- BEGIN:nextjs-agent-rules -->` block. An existing file with
  the same text but no markers gets a duplicate; adopting the markers stops it. Opt out with
  `agentRules: false`. Found when the dev server printed "Generated AGENTS.md for AI agents".
- **A markdown subset parser needs a safe-link allow-list:** `//evil.test` slips through a
  naive "starts with /" rule (a protocol-relative URL). A test caught it.
- **Line portraits: brightness as height beats darkness as squiggle on a dark photo.** A wave
  squiggle (amplitude and frequency by darkness) of the portrait (light face, dark olive
  background) was unreadable at 54–72 rows: background and beard were equally dense. Lifting
  each row by luma, drawn top to bottom with a filled outline so later rows hide earlier ones
  (Joy Division style), read as a face at 72 rows. Rippling the flat parts with the site's own
  `sampleSea` (Home water, 60 m across) kept it "sea" (`components/portrait/`).

- **An SDK's “recording started” state is not proof of uploaded, playable snapshots.**
  In headless replay checks, the recorder produced DOM snapshots but the SDK's bot filter
  suppressed capture before the outgoing event hook. Test with an ordinary browser user
  agent and automation flag while keeping production bot filtering enabled; verify actual
  snapshot requests, not just the recorder-started boolean. The isolated browser check
  verified initial snapshots, redaction, joined IDs and stop/restart without uploading to PostHog.
