# Follow-ups

Every open task and idea. Delete an item once it is done and its outcome is recorded where it
belongs ([decisions.md](decisions.md), [architecture.md](architecture.md) or
[testing.md](testing.md)). Reliability and discovery come before decorative additions.

## Owner

- [ ] Review PostHog billing quota and alerts, and Vercel limits for `/api/telemetry`;
      review unused autocapture and heatmap toggles; keep replay enabled while in use
      ([telemetry-setup.md](telemetry-setup.md)).
- [ ] Optional: report the stalling Vercel ranges to Vercel Support
      ([evidence](seo-and-sharing.md#owner-setup)).
- [ ] Search indexing: Google outcomes for the eight case-study and article URLs requested on
      13 October (sitemap last read and count); Bing URL inspections and its AI Performance
      report ([seo-and-sharing.md](seo-and-sharing.md)).
- [ ] LinkedIn warns that both original essays' descriptions are under 100 characters.
- [ ] Read the five case studies (`content/work/*.md`, drafted in the owner's first person
      from the portfolio and his figures) and edit them into his own voice. Each keeps "The
      brief" first and "The outcome" last and reads in 2–5 minutes.
- [ ] Edit and publish the two remaining drafts in `content/posts/` (delete "Notes for the
      editor", fill the placeholders, set `status: published`, and add the post's 1200 × 630
      card at `public/images/notebook/<slug>.webp`, which its link card points to).
- [ ] Social content: Instagram and LinkedIn posts and banners from the brand kit
      (`../brand/`); only real projects, nothing invented.
- [ ] The portfolio's `AGENTS.md` still lists deep links from maxsash.com, which now links only
      the portfolio's home. Another repository: the owner's call.
- [ ] Renew `public/.well-known/security.txt` before it expires on 6 October 2027.

## Investigate

- [ ] **Phone length.** Smooth, but somewhat long on the owner's iPhone. After three cards and
      two rows: phone 14.7 screens, Work 4.8, Contact at 8.1; the remaining weight is the hero
      (1.7 screens) and three plates. Keep the approved stage timings.
- [ ] **Performance.** Field data first (none yet). Then, from the owner's traces: four blocking
      CSS files (23 KiB, est. 310–410 ms), Math render delay varying 620–1630 ms, a first-run
      TBT outlier (330 ms against 50/140), unused JS 54 KiB, legacy JS 14 KiB. Trace before
      blaming a component; estimates do not add up.
- [ ] **Soft LinkedIn cards.** In Post Inspector the case-study and article images look
      slightly blurry; home is fine (owner, 19 October, minor). Home's card is a 1200 × 630 JPEG;
      the others are WebP, and case studies are 1200 × 750, which LinkedIn crops to 1.91:1.
      Suspect LinkedIn re-encoding WebP; try dedicated 1200 × 630 JPEG share cards.
- [ ] Hero length without WebGL: in fallback the 180svh hero scrolls a lot for little change;
      consider a shorter hero there.
- [ ] Real crawler logs and WAF: a user-agent string from our network does not prove genuine
      Bingbot or OAI-SearchBot access.
- [ ] Optionally confirm the Vercel rate limit answers 429 past its budget.

## Devices and accessibility

- [ ] Screen readers beyond the owner's iPhone VoiceOver pass (VoiceOver on Mac, NVDA,
      TalkBack, Safari Reader), and the "Opening page…" badge with VoiceOver.
- [ ] Replay on the owner's iPhone and Android: controls, readability and animation cost;
      headless browser checks do not qualify physical-device performance.
- [ ] Feedback on real hardware: speakers and headphones, Android vibration and taps.
- [ ] A real print of a sea plate on paper.

## Telemetry recordings

- [ ] 1.4.0 is live; verify a real tagged Instagram/WhatsApp/LinkedIn visit in the
      [Acquisition dashboard](https://eu.posthog.com/project/306242/dashboard/1031898), then
      confirm contact attribution when real activity exists. Do not invent visits for QA.

- [ ] Production replay is enabled: confirm a real voluntary recording arrives and has
      30-day retention; owner review remains necessary.
- [ ] Before release, verify PostHog provider terms/DPA status and the configured production
      replay setting. India safeguards: [review](replay-review.md#implemented-safeguards-and-release-checks).
- [ ] Before the May 2027 transition, review retained recordings, consent evidence and
      withdrawal/deletion handling; use voluntary replay unless another ground is established.
- [ ] Exclude owner/tester labels when interpreting audience journeys; the new context
      dashboard is ready ([telemetry-setup.md](telemetry-setup.md)).

## Content and discovery

- [ ] Firsthand writing on real client questions (modules versus off-the-shelf, edge versus
      cloud alerts, deployment tradeoffs), linked to the case studies; approved evidence only.
- [ ] Measured operational evidence for the private systems when it exists (a verified
      invariant, load or latency, an incident and recovery). Do not invent it.
- [ ] Consider leading Work with business operations if backend clients become the main
      audience (Velora's lead is approved).
- [ ] Case-study extras if wanted: more detailed drawings for the two private systems, a
      second screenshot for the three with public sites.
- [ ] Blog: "Before personalising my website, I needed to understand its visitors"
      ([visitor-journeys.md](visitor-journeys.md)). Findings only from real data.
- [ ] Review observed paths and exposure before defining behavioural groups or testing
      Notebook-first against Work-first. No adaptive order yet.
- [ ] Blog: "My site was fast; the road to it wasn't", the DNS stall and prefetch story
      ([blog-ideas.md](blog-ideas.md)). Draft it when the owner asks.
- [ ] Blog: "Make the sea answer every scroll", from the feedback research and the gull's
      build ([blog-ideas.md](blog-ideas.md)). Write it as a draft when the owner asks.
- [ ] Blog: turn a finding in [blog-ideas.md](blog-ideas.md) into a post when the owner asks.

## Ideas (need the owner's approval)

- [ ] **Notebook:** plates that draw themselves in like ink; arrow keys and swipes between
      notes (links stay the accessible route); a short page curl entering the Notebook (riskiest
      on iPhone); paper grain, ink bleed and a page-edge shadow; hand-drawn marginalia. All
      respect reduced motion, keep sound opt-in and cost nothing in accessibility.
- [ ] **Sky life:** birds by day, reusing the gull model (`gullFacets` with flying poses, or a
      few boids in the wind), and stars or birds in every other sky where they fit: the 404's
      open horizon (birds), the notebook 404 and half-drawn plate (as drawings), not the storm
      pages. Stars twinkle far below three flashes a second.
- [ ] **Sky detail:** Jupiter and Saturn detail on demand, from credited imagery only.
- [ ] **Water:** a different approach to wave detail, if wanted (the first pass was rejected).
- [ ] **Gull:** a takeoff sound, sounding notes, a gull on the shore's waves button, landing
      into the sea's wind.
- [ ] **Sound:** restrained wooden taps for controls; Notebook keeps paper turns.
- [ ] **From the feedback research** (cheapest first): scroll speed as one shader uniform (foam
      and ink bleed that dry at rest) and a `scrollend` settle; the sea's mathematics as
      feedback (marks riding phase and group velocity, scrubbable wave terms, a swell-sorting
      question, a float tracing orbits); the ship rolling and recovering; a ship's log of
      distance run; other visitors as faint footprints (needs a socket service and a privacy
      line).
- [ ] **Haptics:** only Chromium on Android vibrates, and Android advises 10–20 ms ticks, so
      today's 2–5 ms pulses are probably not felt. An iPhone tick needs a real tap on a native
      switch. One tick per deliberate action, none on scroll.
- [ ] **Fun to read:** a console greeting with a small ASCII ship, a custom response header,
      `humans.txt`, a hidden sea poem. No right-click blocking, obfuscation or accessibility cost.
- [ ] **Easter eggs:** Metal Gear Solid style ghost photos of the team near About (trigger
      undecided; the owner's photo is `public/images/ghost-photos/yash-shrivastava.webp`, not
      yet used); the red upside-down "Capsized" sea.

## Code and tooling

- [ ] Remove the development sky preview after the owner's sky review.
- [ ] Night plate tone: the night drawing keeps the old invert filter and reads slightly
      brown; consider native night colours in the SVG.
- [ ] Compositor-only scroll animation: the medal and compass animate a registered
      `--progress` on the main thread; keyframes on the `view()` timeline would be threaded in
      Chrome and Safari 26.4+. Safari 27.0 still has two scroll-timeline bugs (view timelines
      freezing inside a sticky ancestor, fades to `opacity: 0` staying visible); check the iPhone.
- [ ] The ETag helper matches one exact tag only; review list, weak and wildcard conditionals.
- [ ] Turbopack emits a raw copy of the Moon worker's source under `/_next/static/media/`.
- [ ] Some browser harness processes (keyboard, creative, gull) linger after printing their
      result; find the open handle.
- [ ] No automated browser check covers the error pages; no parity test compares the
      whirlpool shader with `sampleDrift`.
