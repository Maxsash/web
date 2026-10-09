# Feedback run

**The owner's brief (9 October 2026).** Every action, and inaction such as waiting on a screen,
gets an acknowledgement: "I got what you did there". Nothing breaks immersion. Sound for every
little thing that can have one, plus other channels. Maximalist first; the owner then removes or
dials down after trying it. The model is the compass dial's tick: small, exactly on the action,
and could not belong to any other site.

**State:** built and kept as it is (9 October 2026: the owner tried it and wants nothing toned
down). Every answer sounds by default; only the waves wait for "Play waves". Uncommitted.

## Changing an answer

- **Any action's sound, level, pitch, spacing, buzz or words:** one line in
  `lib/feedback/vocabulary.ts` (`FEEDBACK`). Remove `sound` to silence an action, `haptic` to stop
  a buzz, `say` to drop a notice; lower `gain`; raise `spacing` to answer less often.
- **What a cue sounds like:** its recipe in `lib/sound/cues.ts` (layers of filtered noise and
  tones, each a strike with attack and decay, optionally repeated or gliding).
- **Visual responses:** each is one block in the file named in the table below.
- **Listen first:** `node tools/render-sounds.mjs` writes `tools/.out/action-<name>.wav` for each
  action at its level and `actions-over-waves.wav` (one per second, in the table's order, over the
  surf) to judge on laptop speakers.

## Principles

- **A vocabulary, not a pile:** one answer per kind of action, the same everywhere.
- **Immediate and proportional:** small actions get small sounds (focus < hover < the dial's
  tick < a press < a roll); a burst inside an action's spacing is dropped, never queued.
- **Every answer sounds by default** (owner, 9 October 2026), from the visitor's first click, tap
  or key press (browsers allow none before). Only the waves wait for "Play waves". "Mute sounds"
  on the shore silences everything and is remembered.
- **Nothing is only audible:** what a sound tells (copied, refused, offline, mail) is also shown.
- **Reduced motion** keeps every response but makes it still (the global rule makes transitions
  instant; the sea ripple is skipped because the sea itself is still).
- **Costs nothing on scroll**, with one measured exception (below).

## What answers what

| Where       | Action                          | Sound (action)            | Also                                                            | Wired in                                   |
| ----------- | ------------------------------- | ------------------------- | --------------------------------------------------------------- | ------------------------------------------ |
| Everywhere  | Hover a link, button or slider  | soft tick (`hover`)       | Underline inks in (thicker, closer)                             | `components/feedback/actions.ts`, `app/feedback.css` |
| Everywhere  | Press a button                  | firm click (`press`)      | Letterpress: 1 px down, inset shadow                            | same                                       |
| Everywhere  | Keyboard focus moves            | fainter tick (`focus`)    | Focus ring inks in from transparent, 8 px out                   | same                                       |
| Everywhere  | Link within the page            | whoosh (`glide`)          | The glide (existed)                                             | same                                       |
| Everywhere  | Link off the site or a new tab  | sail filling, creak (`leave`) |                                                             | same                                       |
| Everywhere  | Email link                      | ship's bell (`mail`)      | Notice: "Opening your mail app. The address is …"               | same                                       |
| Everywhere  | Select text; copy it            | pen scratch (`select`, `copy`) | Rust highlighter; notice "Copied."                         | same                                       |
| Everywhere  | Open or close a disclosure      | latch (`unfold`, `fold`)  | Studio's "Inside the sea" unfolds                               | same, `SeaStudio.module.css`               |
| Everywhere  | Cross into a section            | passing swell (`cross`)   |                                                                 | `components/feedback/arrivals.ts`          |
| Everywhere  | Tab hidden, then back           | (waves fade, existed)     | Title "At anchor · …" and an anchor favicon; "Welcome back · …" for 3 s | `components/feedback/presence.ts`  |
| Everywhere  | Idle 10, 30, 60 s               |                           | `html[data-idle]`; the hero sea slows to 0.6, 0.4, 0.3 pace     | same, `observatory/sea-pace.ts`            |
| Everywhere  | Offline, back online            | foghorn; bell (`offline`, `online`) | Fog over the hero sea and the shore; notices           | same, module CSS                           |
| Home        | Scroll                          |                           | Depth line with 10 vh marks at the right edge                   | `components/feedback/ScrollMark.tsx`       |
| Hero        | Press the sea                   | water drop (`drop`)       | A ring spreads from the point pressed; crosshair cursor         | `OceanScene.tsx`, `ocean-shaders.ts`       |
| Hero        | Scroll fast                     |                           | The sea quickens (wind), up to 1.6 pace                         | `sea-pace.ts`                              |
| Hero        | Scroll from sea to drawing      | nib trill, one per 1/60 of the reveal (`draw`) |                                            | `OceanScene.tsx`                           |
| Hero        | Phone: swipe a stage            | swell, 10 ms buzz (`swipe`) |                                                               | `OceanScene.tsx`                           |
| Hero, shore | Still or resume the sea, shore  | wind drops, rises (`still`, `stir`) |                                                       | `OceanScene.tsx`, `Shoreline.tsx`          |
| Hero        | "Make your own"                 | rope pulled taut (`rope`) | Nav underlines draw in left to right and retract                | `Hero.tsx`, `Observatory.module.css`       |
| Sections    | A section's kicker arrives      |                           | Kicker types in; the heading under it sets from soft to crisp in three steps | `Kicker.tsx`, `Section.module.css` |
| Work        | Hover a project image           | paper slide (`slide`)     | The plate lifts 4 px; its head rule inks in                     | `ProjectFeature.tsx`, `Work.module.css`    |
| Work        | A system drawing arrives        | pen, box by box (`drawing`) | Boxes ink in one by one, then the arrows draw along the data | `SystemPlate.tsx`, `Work.module.css`       |
| About       | Hover the medal                 | engraving scratch (`engrave`) | Lines return (existed)                                      | `Portrait.tsx`                             |
| Contact     | Copy the address                | stamp (`success`) or thud (`refusal`) | "Address copied." (existed); copy cursor            | `copy-text.ts`                             |
| Notebook    | The compass passes (desktop)    | dial ticks, like the medal | The needle swings 60° across the pass                          | `Compass.tsx`                              |
| Notebook    | The band's rule arrives         |                           | The rule draws left to right                                    | `Section.module.css` (`drawnRule`)         |
| Posts       | Reading                         |                           | A rust bookmark ribbon lengthens with the page                  | `ScrollMark.tsx`                           |
| Posts       | The author line arrives         | quill flourish (`end`)    |                                                                 | `ArticleParts.tsx`                         |
| Studio      | A starting sea                  | chart pin, 8 ms (`preset`) | The chip for the current sea stays pressed (`aria-pressed`)    | `SeaStudio.tsx`                            |
| Studio      | Roll the dice                   | dice rattle, buzzes (`dice`) | A drawn die tumbles and shows a face of the new sea          | `SeaStudio.tsx`, `Die.tsx`                 |
| Studio      | A slider step                   | dial detent per step (`detent`), 2 ms buzz | Resize cursor                                  | `SettingSlider.tsx`                        |
| Studio      | Type a seed                     | typewriter key; stamp when valid; thud at eight wrong characters | Field state (existed)    | `SeedField.tsx`                            |
| Studio      | The plate redraws               | a nib (`redraw`)          | After a preset or roll, the plate inks in left to right         | `SeaStudio.tsx`                            |
| Studio      | Print, save SVG, sail, copy link | stamp, slide, long swell, bell | "Link copied…" (existed)                                   | `KeepActions.tsx`                          |
| Shore       | Walk on the sand                | soft step per footprint (`step`) | Footprints (existed)                                     | `Shoreline.tsx`                            |
| Shore       | Day or night                    | swell, brighter or darker (`dawn`, `dusk`) | The theme (existed)                             | `ThemeControl.tsx`                         |

Buttons whose result speaks for itself carry `data-press="none"` (the copy buttons, the pause
buttons, the theme switch), so they do not also click.

## Measured

Programmatic scroll through the hero, released build against this one, headless Chrome on an M4
Pro: frame pacing unchanged (p95 16.7 ms, no long tasks), layouts 1–2 → 4–5 (the heading's three
settle steps; a smooth settle cost 95 layouts and was changed). **The one exception:** the depth
line (and the ribbon on posts) is a scroll-driven animation, and Chrome recalculates style once per
frame for it (357 recalcs against 125 without it, about 0.1 ms a frame here). The medal's timeline
already does the same. If that is too much, delete `<ScrollMark kind="depth" />` from
`app/page.tsx` first.

## Not built

The ship turning toward a hovered nav item; the surf rising slightly when idle; the sail trimming;
gulls by day and stars by night ([follow-ups.md](follow-ups.md)); a page curl and marginalia in the
notebook; a designed print view for every page; thunder and a raft's creak on the error pages; the
iOS Safari switch haptic (unverified); the nav marking the section in view (the nav stays in the
hero); headings that "wonk" on hover.
