# Feedback run

**The owner's brief (9 October 2026).** Every action, and inaction such as waiting on a screen,
gets an acknowledgement: "I got what you did there". Nothing breaks immersion. Sound for every
little thing that can have one, plus other channels. Maximalist first; the owner then removes or
dials down after trying it. The model is the compass dial's tick: small, exactly on the action,
and could not belong to any other site.

**State:** built, kept and released (`b65671e`, 9 October 2026: the owner tried it and wants
nothing toned down). Every answer sounds by default; only the waves wait for "Play waves". Next:
the gull (below), built; its second step (singing, inside the pill) is uncommitted.

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
| Hero        | Waves off, the button in view   |                           | A gull lands on "Play waves", watches the pointer, takes off when pressed | `components/gull/`               |
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

## The gull (10 October 2026)

**The owner's idea:** "a bird or whatever makes sense flies in and sits on that button... that is all
the signal we need to give the user to click it without doing it on their face." A herring gull
lands **inside** the hero's "Play waves" pill, sings, and is the only moving hint that the button
exists. Pressing the button, or the gull, starts the waves, and the gull takes off. The button's
words still say what it does, for everyone who cannot see the gull.

**What a visitor sees:** about 3 s after the button is fully on screen, once scrolling has been
still for 1 s, a gull enters from the left of the sky (on a phone, above the eyebrow), flaps and
glides across with slower wingbeats, and brakes with its legs down and tail fanned. About
1.4 s before it lands the pill widens by one gull's width, at its right end, to make room. The gull
lands directly on the pill's bottom border (the button dips 1.5 px), raises and folds its wings, looks at the
visitor, and sits beside the label, which is never covered. A beat after landing it **sings**:
a phrase of three amber musical notes (a single note, a beamed pair, a single note) leaves the
beak, one every 0.4 s with a small lift of the head, and floats up and forward out of the pill,
fading as it goes. By day a phrase repeats every 7 s until 36 s. At night there is just the first phrase,
with fewer, quieter head movements; after 12 s it tucks its head and rests unless the
button is hovered, focused or a mouse pointer is nearby. Perched, it also turns its head now and
then, blinks, shakes its feathers, and may peck the button once (a 1 px dip); after 45 s it keeps
still. Its head follows a mouse pointer within 280 px; hovering the button or focusing it from the
keyboard makes it stand. At the third idle level (60 s) it tucks its head and sleeps. In the
hero's drawing chapters the gull and its notes are drawn as ink, light on dark at night; by day and
night it is lit like the ship. The fuller chest, hooked bill and red bill mark, black
primaries with white spots, and inset seat make it readable at button size. Its projected belly or feet touch the
border centreline in every resting posture. The header wraps above the hero copy, and
turning the device during arrival settles the gull quietly onto its newly placed perch. Landing
brakes smoothly, folds the wings and settles in 1.8 s; takeoff climbs, starting from
the current pose even when pressed during arrival or while standing. After it leaves, the pill closes again.

**Rules:** it comes once per page load (a revisit within the same page life finds it already
perched; nothing is stored), and only while the waves are off. **It comes whatever the visitor chose
before** (owner, 10 October 2026: someone who muted the sounds or turned the waves off may want them
on another visit; the notes make the invitation obvious, the press is the choice, and pressing
turns every sound back on). It leaves when the waves start. "Still the sea" freezes it with the sea;
offscreen and in a hidden tab it does not draw or move. Reduced motion shows it perched and still
(no flight, no habits, no singing: two still notes rest by the beak) and fades it out on press. It
sits inside the button, so it never covers the focus ring and pressing it is pressing the button.
The research behind these timings (one short arrival, then anchored motion; nothing after being
ignored) is in `../web-research/reports/Website feedback beyond sound.md`.

**Change it:** timings and distances are named constants at the top of `components/gull/visit.ts`
(`WAIT_MS`, `QUIET_MS`, `ROOM_LEAD`, `LOOK`, `DIP`) and `flight.ts` (`BEAT`, `BURST`, `BRAKE`,
`HABITS`); the song (when, how often, how far the notes rise) in `song.ts` (`SONG`, `REACH`); the
notes' look and all colours in `paint.ts`; the shape in `body.ts`; poses in `pose.ts`; seat sizing in `placement.ts`, rest policy in `rest.ts`; where it sits
in the pill in `Gull.module.css` and `SoundControls.module.css`. To remove it, drop the `gull` prop
from `WaveSoundControl` in `components/observatory/Hero.tsx`.

**Why inside the pill, not on top (owner, 10 October 2026):** on desktop the button is 21 px below
the top of the page, so a gull standing on its top edge filled the margin and left no room for
notes. A gull on the bottom edge would have had to cover the label, the words that are the
accessible signal. The pill makes room for the gull instead.

**Open:** a takeoff sound (wingbeats, perhaps a call), which needs listening, and whether the
notes should also sound; the shore version (the waves button there could have its own gull,
standing on the sand); landing into the sea's own wind (the research's idea); birds in every sky
([follow-ups.md](follow-ups.md)).

## Not built

The ship turning toward a hovered nav item; the surf rising slightly when idle; the sail trimming;
gulls in the sky by day and stars by night ([follow-ups.md](follow-ups.md)); a page curl and marginalia in the
notebook; a designed print view for every page; thunder and a raft's creak on the error pages; the
iOS Safari switch haptic (closed to scripts since iOS 26.5, per the research; only a real tap on a
native switch ticks); the nav marking the section in view (the nav stays in the hero); headings that
"wonk" on hover.
