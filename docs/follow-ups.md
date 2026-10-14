# Follow-ups

Open items for the owner or a later session. Done work is in [decisions.md](decisions.md).

## Behaviour measurement before personalisation (14 October 2026)

- [ ] Release1.1.0 and verify real ingestion. Memory-only tracker and privacy page
      are built; EU project306242 has five validated dashboards/21charts. See
      [telemetry-setup.md](telemetry-setup.md). Owner added production env, flag true;
      billing quota/alerts and Vercel rate limits remain owner review.
- [ ] Review observed paths and exposure before defining behavioural groups or
      experimenting with Notebook-first versus Work-first. No adaptive order yet.
- [ ] **Blog: before personalising, understand visitors.** Research and outline in
      [visitor-journeys.md](visitor-journeys.md). Cover browser-signal limits, Saks,
      Jacamo, Livestorm/DocSend, event design and eventual findings. Draft later;
      do not invent measurements or imply telemetry is already running.

## Owner device report (13 October 2026)

Deployment includes 3261a8d; iPhone Air/iOS 27 Safari bars, Notebook, touch/gull,
scrolling, sounds, case studies and sea studio reported good. Owner reports all supplied VoiceOver points pass and Reduce
Motion works well; page length is somewhat long and still under review.
Owner reports supplied links work on WhatsApp. LinkedIn description-length warning
remains (both original essay summaries under 100 characters); copy polish pending.
Google screenshot: integral essay unknown/no crawl. Live sitemap has all 11 public
URLs; both essays are indexable with self-canonicals. Owner completed live tests/request indexing for all eight supplied case-study/article
URLs; await indexing outcomes and check sitemap last-read/count. Owner confirms sitemap appears on Bing; indexing outcomes pending. Owner confirms Vercel rule published and intended URLs work; excess-limit 429
enforcement has not been measured.

- [ ] Investigate long Notebook wait/home link appearing unresponsive on iPhone.
      d803c16 confirmed live. Throttled/reduced-motion Chrome touch round trip worked
      with return-home badge; no runtime errors. Cause unresolved; next incident needs
      approximate IST time/page/network/recording to correlate Vercel logs.
- [ ] Explore softer wooden taps for controls if requested; paper turns suit Notebook.

## Backend credibility review (11 October 2026)

- Hero and metadata now name backend/real-time specialism using existing evidence.
  Project order/layout remain the owner-approved client sequence.
- Tightened absolutes: shared PINs describe server enforcement, not blanket security;
  offline ML stays out of request path, rather than claiming no computation on visits;
  enquiry drafting no longer claims measured revenue gains.
- [x] Add concrete mechanisms and tradeoffs for private projects (owner, 11 October): modular
      analytics works with intentionally absent data; local detection keeps private data on the
      LAN while notifications receive only what they need; RTSP conversion is isolated because it
      adds delay. The case studies and drawings now show these boundaries.
- [x] Replace the private case studies' “60% of code” claim with specific ownership: module and
      data architecture, reporting/insights, local deployment and the hardware/software boundary.
- [ ] Add measured operational evidence when it is available: a verified invariant, load/latency,
      incident or recovery path, and the resulting observed behaviour. Do not invent it.
- [ ] Consider leading Work with business operations if backend clients become the main
      audience. Current Velora lead was explicitly approved; no reorder made in this review.
- [ ] Technical follow-up: ETag helper only matches one exact tag; review list/weak/wildcard
      conditional requests separately. API repeated-version ambiguity is fixed in this work.
- [ ] Physical-phone/site reliability and release discovery fixes stay higher priority
      than adding decorative interactions. Current review is source-based, not a live demo audit.

## AI discovery priorities (review, 11 October 2026)

- [ ] Release verified publication work: live listing/essays still noindex, sitemap seven
      URLs vs ten locally. Inspect all public pages after release.
- [x] Bing Webmaster Tools setup/sitemap presence (owner, 13 October).
- [ ] Bing URL indexing inspections and AI Performance report.
- [x] Bingbot and OAI-SearchBot coverage asserts substantial initial HTML, metadata and schema
      on every public route in the local production harness.
- [ ] Check real crawler logs/WAF after release; a locally supplied user-agent string does not
      prove genuine crawler-IP access.
- [x] Published Notebook BlogPosting JSON-LD uses source title, summary, topic, author, URL and
      visible publication date; it emits only for indexable articles.
- [ ] Firsthand writing on actual client questions, tied to case-study evidence.
      Review details/sources: [seo-and-sharing.md](seo-and-sharing.md).

## Before applying to freelance listings (review, 11 October 2026)

A review of the live site as a talent-directory reviewer or client would read it (Freelance
India Club profile links here). The site is good enough to apply with; these are what a careful
reviewer could notice, most visible first. Content was read; nothing was tested on a phone.

- [x] **Approved essays published in code** (owner, 11 October): Essay labels, indexed
      Notebook/essays, sitemap entries and current sharing copy. Awaiting owner release.
- [x] **Workbench failure fallback:** repository link only. Hosting token/rate-limit cause
      remains unverified; loading still has its status label.
- [x] **Private-system build times:** owner supplied approximate durations, six months for
      business operations and eight months for intrusion detection. Shown as Build time;
      calendar dates were not supplied.
- [x] **Household Hub title:** uses “Less to remember.” as its headline.
- [x] **iPhone check before applying** (owner, 13 October): iPhone Air/iOS 27 home,
      Notebook, case studies and studio work well; scrolling/touch/gull smooth. A slow
      device, VoiceOver and Reduce Motion remain untested; see **Phone length**.
- [x] **Per-project share images:** screenshot-backed case studies use their covers; the two
      private systems and all three Notebook articles now use 1200 × 630 cards captured from
      their own drawings (`public/images/work/*-drawing.webp`, `public/images/notebook/`).
      Real WhatsApp/LinkedIn previews remain an owner check after release.
- [x] **Article titles:** Notebook article tabs now end "| Maxsash Studio" like the rest.
- [x] **“Purchasing” overflow fixed in source** (11 October): drawing label is now “Buying”.
      All three system drawings' labels and notes fit with at least 3 units of side clearance
      in local production Chrome at 390/1440 px. Release remains the owner's action.
- [x] Recaptured `public/images/work/business-operations-drawing.webp` with the “Buying”
      label from a local production build (11 October); every label fits its box.

- [ ] **Feedback on real devices.** Built and kept; listen on real speakers and headphones, and
      try a phone (a tap's press, the ripple under a finger, Android vibration, the gull landing
      and taking off) and a screen reader with the notices. What was not built is listed in
      [feedback.md](feedback.md).
- [ ] **Phone length.** After three cards and two rows (10 October 2026): phone page 14.7
      screens, Work 4.8, Contact starts at 8.1; desktop Work 3.2, Contact at 5.9. Judge it on
      the iPhone; the remaining weight is the hero (1.7 screens) and the three plates.
- [ ] **Portfolio's "Links in from maxsash.com".** maxsash.com no longer deep-links the
      portfolio's case studies; it links only the portfolio's home (About and the shore). The
      portfolio's `AGENTS.md` still lists deep links. Another repository: the owner's call.
- [ ] **Edit and publish the two remaining drafts** in `content/posts/` (each ends with "Notes for the
      editor": delete it, fill the placeholders, then set `status: published`).
- [ ] **A post from the feedback research and the gull** (owner, 10 October 2026: "we might be able
      to make a blog out of it"). Material: the report (`../web-research/reports/Website feedback beyond sound.md`, also published as the owner's private doc "Make the sea answer every
      scroll") and the gull's build ([feedback.md](feedback.md), `components/gull/`). Write it as a
      draft in `content/posts/` when the owner asks.
- [ ] **Notebook ideas for the next session** (the owner wants a navigator's-notebook feel; all
      must respect reduced motion, keep sound opt-in, and cost nothing in accessibility):
  1. **Draw the plate in:** the engraving's lines draw themselves on first view, like ink.
  2. **Turn pages with arrows and swipes:** left and right move between field notes, with the
     page turn when sound is on; the links stay as the accessible route.
  3. **A visual page turn:** a short curl or slide when entering the notebook, matched to the
     sound. Most striking, riskiest on iPhone (needs view transitions to behave).
  4. **Paper feel:** subtle grain, ink bleed on headings, a faint page-edge shadow.
  5. **Reading ribbon:** a bookmark ribbon that fills as a post is read.
  6. **Hand-drawn marginalia:** small ink arrows and underlines beside the margin notes.
  7. **A share card per post:** an Open Graph image made from each post's own sea.
- [ ] **Region follow-up.** Owner moved iad1 → Mumbai bom1 and redeployed (11 October);
      all five new response headers show bom1::bom1. Median curl TTFB 625 vs 628 ms;
      post-TLS wait 400 vs 544 ms, total 742 vs 1374 ms. Small separate batches, no isolated
      causal conclusion. Post-move PageSpeed TTFB 380 ms and document-latency warning absent.
      LCP median stays 3.2 s; proceed to CSS/font trace.
- [ ] **PageSpeed** (three owner mobile runs, 11 October 11:17–11:21 IST):
      post-Mumbai performance 91/91/91; median LCP 3.2 s, TBT 90 ms; CLS 0. Accessibility,
      best practices and SEO 100; contrast fixed in live audits. No field data.
- [ ] **Startup consistency.** Progressive preview released: owner mobile scores 87/96/95,
      LCP 2.6 s throughout, FCP median 1.7 s, other scores 100, CLS 0. Median performance
      improves 90 → 95. First run TBT 330 ms versus 50/140 ms; trace before blaming a
      component or changing animations. Prioritise real-phone experience and field data.
- [ ] **PageSpeed investigation order:** CSS/font/LCP trace now that Mumbai is active
      and the server-latency warning is absent (TTFB breakdown 380 ms). Four blocking CSS files
      total 23 KiB (estimated 310–410 ms savings); Math render delay varies 620–1630 ms.
      Keep trace/observed timings separate from simulated summary metrics. Defer changes
      to SVG draw-in and rule reveals unless profiling proves a visitor problem. Unused JS
      54 KiB and legacy JS 14 KiB remain lower priority. Estimates are not additive.
- [ ] **Hero length without WebGL.** The hero is 180svh tall because its text changes with
      scroll. When the static plate is shown (slow or software-rendered devices) that is a
      lot of scrolling for little change. Consider a shorter hero when the scene is in
      fallback.
- [ ] **Cached home page (decision, leaning no).** Pros and cons are in
      [decisions.md](decisions.md).
- [ ] **Accessibility with a real screen reader.** Automated and keyboard checks are done;
      try VoiceOver on Mac and iPhone (ideally NVDA too) and Safari's Reader mode.
- [ ] **Sea studio on real devices.** Slider feel, the pinned drawing on a phone, and a real
      print on paper. Version 2 is new; keep version 1 stable.
- [ ] **Search Console.** Owner confirms sitemap success and screenshot confirms homepage
      indexed with valid ProfilePage (11 October). Inspect case studies and, after release,
      the newly indexable real article. See
      [seo-and-sharing.md](seo-and-sharing.md).
- [x] **Vercel rate-limit rule:** owner confirms published and URLs still work
      (13 October). Excess-limit 429 enforcement not measured; Node 24 already confirmed.
- [ ] **security.txt** expires on 6 October 2027; renew it.
- [ ] **Social content.** Instagram and LinkedIn posts, profile banners and related assets.
      Needs the owner's answers (brand name, handles, tone, first assets). Use only the three
      real projects; invent nothing.
- [ ] **Owner read of the five case studies** (`content/work/*.md`, 10 October 2026). Drafted
      in the owner's first person from the portfolio case studies and his figures, nothing added;
      edit freely into his own voice. Each must keep "The brief" first and "The outcome" last,
      and read in 2–5 minutes (`tools/case-studies.test.mjs`).
- [ ] **Case-study extras, if wanted:** a share image per case study (three screenshot covers now wired; two drawing cards remain,
      also listed under _Before applying_ above); a more detailed system drawing on the two private case studies; a second
      screenshot for the three with public sites.
- [ ] **Night plate tone.** The night drawing keeps the earlier invert filter and reads
      slightly brown; consider native night colours in the SVG.
- [ ] **Ghost photos (Easter egg idea).** Metal Gear Solid style "ghost" photos of the dev team,
      shown behind an Easter egg (Konami code, or maybe when a screenshot is detected; undecided),
      near the homepage's About section. The ghost photo is kept outside this public repo (Claude
      memory, `ghost-photo-yash.png`); only the headshot in About is approved for the repo.
- [ ] **Capsized sea (Easter egg idea).** The red, upside-down sea from the error-page
      exploration, parked for a hidden moment (the owner's suggestion). Not built.
- [ ] **Stars at night and birds by day (owner's plan).** The gull now exists (`components/gull/`, on
      "Play waves"), and its model can fly in any sky: `gullFacets` with the flying poses, or three
      to nine boids hanging in the wind (the research's calmest ambient motion). Where a sky shows:
      the hero (day birds; night stars inside the WebGL pass), the 404's open horizon (birds fit),
      the notebook 404 and the half-drawn plate (maybe, as drawings), the crash and storm pages
      (no: overcast). Stars should twinkle slowly, far below three flashes a second. Hero moon phases are now
      implemented from the India calendar date (12 October); error scenes remain fixed.
- [ ] **Ideas from the feedback research** (`../web-research/reports/Website feedback beyond sound.md`, 10 October 2026; nothing built). Cheapest first: scroll speed as one shader
      uniform (foam and ink bleed that dry back at rest) and a `scrollend` settle (the compass
      settling on a heading); then the sea's own mathematics as feedback (marks riding phase and
      group velocity, scrubbable wave terms held to the dispersion curve, a "which waves arrive
      first?" swell-sorting question, a float tracing the water's orbits beside the pointer); the
      ship rolling and recovering instead of a shaking field; a ship's log of distance run; other
      visitors as faint footprints in the sand (needs a socket service and a privacy line).
- [ ] **Haptics, per the research.** Only Chromium on Android vibrates; Android recommends 10–20
      ms ticks, so the 2–5 ms pulses in today's 2–18 ms range are probably not felt. Since iOS
      26.5 a script cannot fire the switch haptic; an iPhone tick needs a real tap on a native
      switch (the sound control could become one). One tick per deliberate action, none on scroll.
- [ ] **Compositor-only scroll animation.** The medal and compass animate a registered
      `--progress`, which runs on the main thread in every browser; `rotate` and `opacity`
      keyframes placed directly on the `view()` timeline would be threaded in Chrome and Safari
      26.4+. Safari 27.0 still has two scroll-timeline bugs (view timelines freezing inside a
      sticky ancestor; fades to `opacity: 0` staying visible), fixed only in Technology Preview
      254: check the iPhone.
