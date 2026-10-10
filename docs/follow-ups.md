# Follow-ups

Open items for the owner or a later session. Done work is in [decisions.md](decisions.md).

- [ ] **Feedback on real devices.** Built and kept; listen on real speakers and headphones, and
      try a phone (a tap's press, the ripple under a finger, Android vibration, the gull landing
      and taking off) and a screen reader with the notices. What was not built is listed in
      [feedback.md](feedback.md).
- [ ] **Phone length.** After the structure run the phone page is 15.4 screens, Work alone 6.3
      (five projects). If it feels long on the iPhone, the four smaller cards are the place to
      cut (a shorter summary, or the screenshots smaller).
- [ ] **Portfolio deep links.** maxsash.com now links `velora-rights.html`,
      `intrusion-detection.html` and `modular-saas.html` as well as the two it listed before;
      the portfolio's `AGENTS.md` ("Links in from maxsash.com") should name all five. Another
      repository: the owner's call.
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
- [ ] **Function region.** The home page renders in Vercel's `iad1` (US East) while the
      owner and likely audience are in India (`bom1` edge). Decide on a region, then compare
      first-byte time. See [decisions.md](decisions.md).
- [ ] **PageSpeed** (last run 8 October 14:41 IST): desktop 99, mobile 92, accessibility 100.
      The remaining mobile loss is Largest Contentful Paint (3.2 s); see the function-region
      item above. Due again: the hero changed in the 9 October release.
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
- [ ] **Search Console.** Sitemap showed "Couldn't fetch" at first; recheck. See
      [seo-and-sharing.md](seo-and-sharing.md).
- [ ] **Vercel.** Add a rate-limit rule for `/api/sea-edition*` and `/plate` (Node 24.x was
      confirmed by the owner on 9 October 2026).
- [ ] **security.txt** expires on 6 October 2027; renew it.
- [ ] **Social content.** Instagram and LinkedIn posts, profile banners and related assets.
      Needs the owner's answers (brand name, handles, tone, first assets). Use only the three
      real projects; invent nothing.
- [ ] **Case studies on maxsash.com** (owner agreed, 9 October 2026, as a later step).
      `/work/<project>` pages for the five projects in Work, moved
      from the GitHub Pages portfolio; add them to the sitemap and point the Work links there.
- [ ] **Real essays and projects.** The two essays are samples (`noindex`); replace them,
      then enable indexing and add them to the sitemap.
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
