# Follow-ups

Open items for the owner or a later session. Done work is in [decisions.md](decisions.md).

- [ ] **Function region.** The home page renders in Vercel's `iad1` (US East) while the
      owner and likely audience are in India (`bom1` edge). Decide on a region, then compare
      first-byte time. See [decisions.md](decisions.md).
- [ ] **Re-run PageSpeed after the next release** to confirm the software-rendering
      fallback and the contrast fix; expect Accessibility 100 and a much lower blocking time.
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
