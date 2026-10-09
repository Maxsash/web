# Follow-ups

Open items for the owner or a later session. Done work is in [decisions.md](decisions.md).

- [ ] **Review the client-facing copy** (Services steps, About, Contact, hero line). The step
      promises (a short plan before code, shown as it takes shape, handed over with the code
      and accounts) are written from the chosen offer, not from a stated process; change any
      that do not match how you work. Update the portfolio's location (it still says Mumbai).
- [ ] **Edit and publish the two remaining drafts** in `content/posts/` (each ends with "Notes for the
      editor": delete it, fill the placeholders, then set `status: published`).
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
- [ ] **PageSpeed after the release** (8 October 14:41 IST): desktop 99, mobile 92, accessibility
      100. The remaining mobile loss is Largest Contentful Paint (3.2 s); see the function-region
      item above. Re-run after any change to the hero or the region.
- [ ] **Hero length without WebGL.** The hero is 255svh tall because its text changes with
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
- [ ] **Vercel.** Confirm Node.js Version 24.x after the next release; add a rate-limit rule
      for `/api/sea-edition*` and `/plate`.
- [ ] **security.txt** expires on 6 October 2027; renew it.
- [ ] **Social content.** Instagram and LinkedIn posts, profile banners and related assets.
      Needs the owner's answers (brand name, handles, tone, first assets). Use only the two
      real projects; invent nothing.
- [ ] **Real essays and projects.** The two essays are samples (`noindex`); replace them,
      then enable indexing and add them to the sitemap.
- [ ] **Night plate tone.** The night drawing keeps the earlier invert filter and reads
      slightly brown; consider native night colours in the SVG.
- [ ] **Ghost photos (Easter egg idea).** Metal Gear Solid style "ghost" photos of the dev team,
      shown behind an Easter egg (Konami code, or maybe when a screenshot is detected; undecided),
      near the homepage's About section. The owner's photo is kept outside this public repo (Claude
      memory, `ghost-photo-yash.png`); do not commit any face until the owner says where it goes.
- [ ] **Capsized sea (Easter egg idea).** The red, upside-down sea from the error-page
      exploration, parked for a hidden moment (the owner's suggestion). Not built.
- [ ] **Stars at night, birds by day (owner's plan).** When they are built, add them wherever the
      sky shows and it makes sense: the hero, and consider each error page (the storm and squall
      skies are overcast, so probably not there; the open horizon of the 404 may suit birds).
