# Handoff — start here

Updated 10 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD 0d76507. Font and theme sprint is implemented and **uncommitted** for owner review.
Nothing committed, pushed or deployed.

## Font and theme sprint (awaiting owner review)

- Why: headings were hard to read (Fraunces at −0.055 to −0.08em) and the site carried the
  stock Claude/AI look (Fraunces + Inter + JetBrains Mono, mono kickers, roman line + accent
  italic line, bone paper + rust). Decision: decisions.md "Type and colour of their own".
  Specimen (both rounds): https://claude.ai/artifact/FDizE3EAiy2JvQaKiBuqzJ
- Final type ("Logbook slab", round 2): Montagu Slab (display and essay text), Rethink Sans
  (text, labels), Reddit Mono (data only). All have next/font fallback metrics: clean build.
  Montagu has no italic; *Math.* and essay emphasis use the browser's slanted roman.
  Preloaded fonts 185 KB (was 206 KB with Fraunces).
- Palette: Admiralty chart, one token layer in `globals.css` (night via
  `html[data-studio-theme]`; fixed `--chart-*` for day-only pages); sea/hero colours untouched.
- Also: decorative italics removed (Math. kept); project and error-page headlines are single
  strings; kicker arrival inks headings in by opacity; Notebook masthead sized per breakpoint;
  About name capped at 14cqi; hero section links have a 24 px minimum width; night studio
  plate uses invert + 180° hue + screen; shore water and printable plate recoloured.
- Owner judgement wanted: essays' paragraphs are set in Montagu Slab (wide, characterful);
  if they feel heavy for long reading, switch `.readingCopy` text to Rethink Sans.
- Not changed: the private `/write` editor (own cream colours); hero fallback night filter.
- Review: http://localhost:3015/?seed=70806d5e&version=2 (worktree
  /private/tmp/maxsash-type-review, server started this session). Screenshots in the
  scratchpad shots/ (before-*, slab-*, slabnight-*). Servers 3000/3012/3013/3014 untouched.

## Next / open items

1. Owner review of the type and theme (home day/night, Notebook, an essay, phone), the
   slashed zero, then commit. Ship review in both themes is still open too.
2. Physical iPhone/Safari/Firefox checks: ship/gull, stage controls, studio, sound,
   screen-reader notices and battery/GPU behaviour. Review phone page length too.
3. Performance/hosting: rerun PageSpeed after hero changes, decide function region,
   consider a shorter static-fallback hero, and add the recorded Vercel rate limits.
4. Search: recheck Search Console's sitemap fetch and indexing; real share previews.
5. Content: edit/publish two drafts, replace sample essays before enabling indexing,
   and later bring the five case studies onto `/work/<project>`.
6. Engineering: investigate browser harness processes lingering after completion;
   add error-page browser coverage and whirlpool shader/CPU parity coverage.
7. Optional creative backlog: Notebook treatments, night SVG colours, stars/birds,
   feedback refinements and Easter eggs. Code cleanup step 6 remains ideas only.
8. Owner handles release through production; main never deploys. Current release
   state is unknown. Full backlog: [follow-ups.md](follow-ups.md).

## Verification (font and theme sprint)

- Node 24 production build, no warnings; lint, types, format; 114 Node tests; 20 SEO cases;
  headers; keyboard 20/20; ship 36/36; gull 47; software fallback; sound; creative 193
  records, 0 exceptions, no overflow. Headline fit rechecked after the final 14cqi tweak.
- Not verified: physical devices, screen readers, `/write`, hero fallback plate at night.
- Logs: /private/tmp/maxsash-type-*.log. Details in testing.md.

## Suggested commit message

```
feat: give the site its own type and Admiralty chart palette

Headings were hard to read (Fraunces tracked to -0.08em) and the stack,
mono kickers, accent italics and bone-and-rust paper read as a stock AI look.
Switch to Montagu Slab, Rethink Sans and Reddit Mono (data only), all with
next/font fallback metrics; move every theme colour into one token layer in the
chart palette, keep italic only for Math., refit headline sizes and ink kicker
headings in by opacity.

Verified on a Node 24 production build: lint, types, format, 114 Node tests,
SEO, headers, keyboard 20/20, ship 36/36, gull, fallback, sound, creative 193.
```
