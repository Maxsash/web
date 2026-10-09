# Feedback run (planned)

**The owner's brief (9 October 2026).** Every action, and inaction such as waiting on a screen,
gets an acknowledgement: "I got what you did there". Nothing breaks immersion. Sound for every
little thing that can have one, plus other channels. Go maximalist first; the owner then
removes or dials down after trying it. The compass dial's tick is the model: a response that
follows the action exactly, is small, and could not belong to any other site. **It runs after
the structure run** (done 9 October; see decisions.md, "Structure and content"), so feedback is
built for the sections as they now stand.

## Principles

- **A vocabulary, not a pile.** One response per kind of action, the same everywhere: hover,
  press, select, drag step, arrive, leave the site, success, refusal. Learn it once.
- **Immediate and proportional.** Within about 100 ms; a small action gets a small response.
  Never queue (the dial's 32-per-second cap is the pattern).
- **Sound stays behind the one "Play waves" switch** (decided). Every other channel works for
  every visitor, so the acknowledgement never depends on sound.
- **Nothing is only audible.** If a sound carries information (copied, invalid seed), the page
  shows it too.
- **Reduced motion** turns motion responses into still ones (a colour or weight change), not
  nothing. Respect `prefers-reduced-transparency` and forced colours too.
- **Built to be dialled down.** One table maps each action to its responses and levels, so the
  owner's review turns into one-line edits, not refactors. Pure rules apart from DOM code.
- **Costs nothing on scroll.** No new main-thread work per scroll frame beyond what exists;
  measure before and after.

## Channels other than sound

1. **Ink.** Underlines that draw in on hover and retract on leave, focus rings that ink in,
   buttons that press like letterpress into paper, rules that draw as a section arrives.
2. **Type.** The display font's variable axes (`SOFT`, `WONK`, `opsz`, already loaded) can
   soften or "wonk" a heading on hover or as it arrives. No extra download.
3. **The sea itself.** The WebGL sea as a response surface: a ripple where the pointer
   presses, the ship turning toward a hovered nav item, the wind rising with scroll speed, the
   sea calming when the visitor stops.
4. **Scroll.** A progress mark (a depth line, a log line filling), the nav marking the section
   in view, section kickers typing in, a cue when a section is crossed.
5. **Cursor.** A pointer that changes over the sea, the sliders and links (a crosshair over
   the sea). Risky for accessibility; keep the system cursor available.
6. **Haptics.** `navigator.vibrate` works on Android Chrome, not on iOS Safari. iOS 18 Safari
   reportedly gives a haptic tick on a native `<input type="checkbox" switch>`; unverified, try
   it on the iPhone before relying on it.
7. **Idle and absence.** After a pause: the sea settles, gulls cross by day and stars appear by
   night (already planned: [follow-ups.md](follow-ups.md)), the ship trims its sail. When the tab
   is hidden: the title and favicon change (the ship at anchor); on return, a brief "welcome
   back" in the title.
8. **Words.** Microcopy that answers the action, like "Link copied. Anyone who opens it sails
   this sea." Status lines for the slider read-outs and the seed field.
9. **Page state.** Offline turns the sea foggy (`online`/`offline` events), and back online
   clears it. A designed print view when someone presses Ctrl/Cmd+P on any page.
10. **Selection and copy.** A styled text selection (ink or rust highlighter); copying the email
    confirms it.

## Every action on the site, with candidates

| Where           | Action                              | Sound candidate                   | Other candidates                          |
| --------------- | ----------------------------------- | --------------------------------- | ----------------------------------------- |
| Everywhere      | Hover a link or button              | Soft tick, quieter than the dial  | Ink underline draws in; font axis shifts  |
| Everywhere      | Press a button                      | Firm click                        | Letterpress press; ripple                 |
| Everywhere      | Keyboard focus moves                | Faint tick (maybe too much)       | Focus ring inks in                        |
| Everywhere      | Scroll; cross a section             | A passing swell                   | Progress mark; nav marks the section      |
| Everywhere      | Idle 10 s / 30 s / 60 s             | Surf rises slightly               | Sea settles; gulls or stars; sail trims   |
| Everywhere      | Tab hidden, tab back                | Waves fade out and back (exists)  | Title and favicon at anchor; welcome back |
| Everywhere      | Offline, back online                | Foghorn, far off                  | Fog over the sea                          |
| Everywhere      | Select text, copy                   | Pen scratch                       | Styled selection                          |
| Everywhere      | Follow a link off the site          | Sail filling, a rope creak        | Arrow sets sail                           |
| Hero            | Load                                | (none: sound needs a click)       | The sea fades in (exists)                 |
| Hero            | Scroll from sea to drawing          | Ink lines being drawn             | The drawing (exists)                      |
| Hero (phone)    | Swipe a stage                       | One swell                         | Haptic on Android                         |
| Hero            | Nav link, brand link                | A glide whoosh                    | Glide (exists)                            |
| Hero, shore     | Play waves, mute                    | Waves fade in or out (exists)     | Icon state                                |
| Hero            | Still the sea                       | Wind dropping                     | The sea stops (exists)                    |
| Work            | Hover a project image               | Paper slide                       | The image lifts, the plate head inks in   |
| Work            | A system drawing comes into view    | Pen on paper, box by box          | Boxes ink in, arrows flow along the data  |
| About           | Medal passes                        | Dial ticks (exists)               | Ring turns (exists)                       |
| About           | Hover the medal                     | Engraving scratch                 | Lines return (exists)                     |
| Contact         | Hover, click the email; copy it     | Ship's bell; a soft stamp         | "Address copied." (exists); button press  |
| Hero            | The seed link ("Make your own")     | A rope pulled taut                | Glide down to the studio (exists)         |
| Notebook (home) | The compass passes                  | Dial ticks, like the medal        | The needle swings toward the entries      |
| Notebook        | Into or within the notebook         | Page turn (exists)                | A page curl (follow-ups idea 3)           |
| Notebook        | Reading a post; its end             | Quill flourish at the end         | A reading ribbon (follow-ups idea 5)      |
| Studio          | Preset chip                         | Chart pin                         | Chip presses                              |
| Studio          | Roll the dice                       | Dice rattle                       | Dice tumble                               |
| Studio          | Slider step                         | Detent tick per step, like the dial | Haptic on Android                       |
| Studio          | Type a seed: key, valid, invalid    | Typewriter key; confirm; dull thud | Field state; plate redraws              |
| Studio          | Plate redraws                       | Ink scratch                       | Lines draw in (follow-ups idea 1)         |
| Studio          | Print, save SVG, copy link          | Press stamp; paper; bell          | Confirmation line (copy exists)           |
| Studio          | Sail this sea                       | A long swell                      | The hero redraws                          |
| Studio          | Open "Inside the sea"               | A latch                           | Unfolds                                   |
| Shore           | Walk on the sand                    | A soft step per footprint         | Footprints (exist)                        |
| Shore           | Day or night                        | Dawn or dusk swell                | The theme changes (exists)                |
| Shore           | Pause the shoreline                 | Surf hushes                       | The shore stops (exists)                  |
| Error pages     | Arrive                              | Thunder with the lightning, a raft's creak, wind | The scene (exists)     |
| Plate page      | Print                               | Press stamp                       | Print view                                |

## Open for the run

- Which sounds start before "Play waves"? Today none do, by decision; keep it.
- Hover sounds on touch devices: no hover, so none; decide what press gives instead.
- Levels: everything sits under the waves and the dial; render each with
  `tools/render-sounds.mjs` and check on laptop speakers, as was done for the surf.
- Screen readers: decorative responses stay silent to them; informative ones use the existing
  status lines.
