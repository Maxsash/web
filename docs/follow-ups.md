# Follow-ups

Open items for the owner or a later session. Done work is in [decisions.md](decisions.md).

## Before applying to freelance listings (review, 11 October 2026)

A review of the live site as a talent-directory reviewer or client would read it (Freelance
India Club profile links here). The site is good enough to apply with; these are what a careful
reviewer could notice, most visible first. Content was read; nothing was tested on a phone.

- [ ] **Notebook still reads as a template.** Two of its three posts show "Sample essay"
      (`app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `content/posts.ts`), and the notebook's
      share description says "Sample studies in sea, ship, and mathematics" (`app/blog/layout.tsx`).
      A reviewer who opens Notebook sees placeholder work. Either relabel them ("Essay", "Study")
      once you approve their text, or hide them until real writing replaces them; the WebGL field
      note is real and should stay. Ties in with **Sample essays** below.
- [ ] **"From the workbench" log fails on some loads.** Seen on 11 October: one page showed
      "Loading the log…" and another "The log is unavailable right now." (`components/shore/GitHubActivity.tsx`).
      It is in the footer of every page. Likely cause: GitHub's 60 requests an hour limit for
      unauthenticated calls from shared Vercel addresses; check that `GITHUB_TOKEN` is set in
      Vercel. Either way, when the fetch fails, show only the repo link (or nothing) instead of
      an error.
- [ ] **Missing "When" on two case studies.** `business-operations` and `intrusion-detection`
      have no `period` in `content/projects.ts`; the other three do. Add the dates.
- [ ] **Household Hub's title repeats.** Its `headline` is "Household Hub." so the page title
      reads "Household Hub: Household Hub | Maxsash Studio". Give it a subtitle-style headline
      like the others ("Built to be found.", "Off paper, into one system.").
- [ ] **Phone check before applying.** Open the home page and one case study on a real phone
      (and a slow one if possible): the WebGL sea, scroll length and the gull. Reviewers often
      click a profile link on mobile. See **Phone length** and **Feedback on real devices**.
- [ ] **Per-project share images.** Every case study shares the sea image, so a case study link
      pasted in WhatsApp or LinkedIn does not show the project. Use each project's own cover
      (the Freelance India Club samples already use `/images/work/wedding-platform.webp` and
      `/images/work/household-insights-light.webp`). Same item as the share image in
      **Case-study extras** below.

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
      to make a blog out of it"). Material: the report (`../web-research/reports/Website feedback
      beyond sound.md`, also published as the owner's private doc "Make the sea answer every
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
- [ ] **Release progressive studio preview and remeasure.** Font-preload live result was
      mixed; restoring body preload and inlining CSS failed to give reliable simulated LCP
      gains. Lazy initial print image halves HTML transfer and improves local Lighthouse
      median FCP/LCP by about 450 ms; editing remains exact SVG. Await production checks
      and owner release, then compare fresh independent PageSpeed mobile reports.
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
- [ ] **Vercel.** Add a rate-limit rule for `/api/sea-edition*` and `/plate` (Node 24.x was
      confirmed by the owner on 9 October 2026).
- [ ] **security.txt** expires on 6 October 2027; renew it.
- [ ] **Social content.** Instagram and LinkedIn posts, profile banners and related assets.
      Needs the owner's answers (brand name, handles, tone, first assets). Use only the three
      real projects; invent nothing.
- [ ] **Owner read of the five case studies** (`content/work/*.md`, 10 October 2026). Drafted
      in the owner's first person from the portfolio case studies and his figures, nothing added;
      edit freely into his own voice. Each must keep "The brief" first and "The outcome" last,
      and read in 2–5 minutes (`tools/case-studies.test.mjs`).
- [ ] **Case-study extras, if wanted:** a share image per case study (all pages use the sea
      image today; now also listed under *Before applying* above); a more detailed system drawing on the two private case studies; a second
      screenshot for the three with public sites.
- [ ] **Sample essays.** The two samples remain `noindex`; replace them with approved real
      writing before indexing. Their visible "Sample essay" labels are now a reviewer-facing issue
      (see *Before applying* above). Real published posts now enter the sitemap automatically.
- [ ] **Night plate tone.** The night drawing keeps the earlier invert filter and reads
      slightly brown; consider native night colours in the SVG.
- [ ] **Ghost photos (Easter egg idea).** Metal Gear Solid style "ghost" photos of the dev team,
      shown behind an Easter egg (Konami code, or maybe when a screenshot is detected; undecided),
      near the homepage's About section. The ghost photo is kept outside this public repo (Claude
      memory, `ghost-photo-yash.png`); only the headshot in About is approved for the repo.
- [ ] **Capsized sea (Easter egg idea).** The red, upside-down sea from the error-page
      exploration, parked for a hidden moment (the owner's suggestion). Not built.
- [ ] **Stars at night, birds by day (owner's plan).** The gull now exists (`components/gull/`, on
      "Play waves"), and its model can fly in any sky: `gullFacets` with the flying poses, or three
      to nine boids hanging in the wind (the research's calmest ambient motion). Where a sky shows:
      the hero (day birds; night stars inside the WebGL pass), the 404's open horizon (birds fit),
      the notebook 404 and the half-drawn plate (maybe, as drawings), the crash and storm pages
      (no: overcast). Stars should twinkle slowly, far below three flashes a second; the real moon
      phase needs only the date.
- [ ] **Ideas from the feedback research** (`../web-research/reports/Website feedback beyond
      sound.md`, 10 October 2026; nothing built). Cheapest first: scroll speed as one shader
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
