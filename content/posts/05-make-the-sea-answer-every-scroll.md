---
title: Make the sea answer every scroll
summary: What award-winning sites, interaction designers and attention research say about feedback, and the gull I built to invite one click without nagging.
topic: Interaction & motion
date: 2026-10-19
status: published
caption: A gull on a button: one arrival, then motion only in place, and nothing after it is ignored.
closing: Let the world answer the visitor, then let it fall quiet.
---

My home page has a sea in it, and a button that says "Play waves". Sound is the obvious way to
make a site like this feel alive, and it is the one channel I cannot rely on. Browsers keep audio
suspended until a click, tap or key press, and scrolling does not count
([Chrome](https://developer.chrome.com/blog/autoplay)). On an iPhone in Silent mode, web audio is
muted by default ([WebKit bug 237322](https://bugs.webkit.org/show_bug.cgi?id=237322)). Whatever
tells a visitor "this responds to you" has to work in silence, in the first seconds, before any
click.

So before adding anything I read: the award juries' recent winners, the interaction designers
whose work I admire, and the attention research behind notifications. This is what I took from
it, and what I built.

## The best sites change the world, not the interface

> Speed into colour / Wet cloth / A wake

The juried winners of the last few years answer input by changing the substance of a scene. In
Igloo Inc, particles **change colour with their speed**
([case study](https://awwwards.com/igloo-inc-case-study.html)). In Messenger, the 2025 Developer
Site of the Year, your character's clothes get wet and "slowly 'dry off'"
([case study](https://www.awwwards.com/messenger.html)). OceanX's annual report steers a ship that
keeps forward momentum through a wake driven by the mouse
([Communication Arts](https://www.commarts.com/webpicks/oceanx-2025)). None of them adds an
arrow or a tooltip. The world responds, and you notice that it did.

Awards are not usability evidence, and the juries' own scores say so: Igloo Inc scored 9.60 for
animation and 6.60 for accessibility ([Awwwards](https://www.awwwards.com/sites/igloo-inc)). What
transfers is the principle, not the spectacle: **input moves the material**. For my site that
means scroll speed could become foam and ink bleed in the sea, drying back to crisp lines at rest.

## Ration the flourishes

> Rare is delightful / Frequent is noise

Interaction designers agree on one rule more than any other: motion the visitor causes is cheap
and rarely annoying, while motion that happens _to_ the visitor must be rationed. Apple's advice
is to "work with behavior rather than animation"
([WWDC18](https://developer.apple.com/videos/play/wwdc2018/803/)) and to let "the resting state
stay visually quiet" until touched ([WWDC25](https://developer.apple.com/videos/play/wwdc2025/219/)). Family's
delight-impact curve says delight grows as a feature gets used _less_ often
([Family Values](https://benji.org/family-values)). Stripe's test is the sharpest: remove the
animation, and keep it only if the flow then feels broken
([Villar, via translation](https://www.inside.com.tw/article/3671-how-does-stripe-improve-their-checkout-flow-by-animations)).

The research agrees in its own terms. People in NN/g's tests called an animation "nice the first
time, but now it's getting annoying" ([NN/g](https://www.nngroup.com/articles/animation-usability/)),
and irrelevant animation measurably hurts information seeking, most of all when it looks like the
task ([Zhang 2000](https://aisel.aisnet.org/jais/vol1/iss1/1)).

## A gull, by the rules

> Arrive once / Move in place / Leave when ignored

I wanted one moving hint that "Play waves" exists. My idea was a bird that flies in and sits on the
button: enough of a signal, without doing it in anyone's face. Before drawing it, I looked for
evidence that a creature on a control makes people click it. I found none: no case study, no A/B
test. So the gull is a bet on delight, and the research decided its shape.

The onset of motion catches attention even when it means nothing
([Abrams & Christ 2003](https://pubmed.ncbi.nlm.nih.gov/12930472/)). Bartram, Ware and Calvert
found motion cues were missed less than 2% of the time, against 6–25% for colour; that travelling
motion distracts far more than motion anchored in place; and that cues distract more during
reading ([2003](https://www.interruptions.net/literature/Bartram-IJHCS03.pdf)). Interruptions at a
natural break cost less ([Iqbal & Bailey 2007](https://www.interruptions.net/literature/Iqbal_Bailey-CHI07.pdf)),
and WCAG's own example of an acceptable attention cue stops after five seconds
([W3C](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

That gave me the gull's life:

| Phase          | What it does                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Wait           | Comes once per page load, about 2 s after the button is fully in view and scrolling has stopped |
| Arrive         | One short flight, about 2.3 s, with flapping, gliding and a braking flare                       |
| Perch          | Lands inside the pill beside the label, which it never covers; sings a few amber notes          |
| Settle         | Turns its head, blinks, shakes its feathers, then keeps still after 45 s                        |
| Pressed        | Takes off as the waves start; pressing the gull is pressing the button                          |
| Reduced motion | Already perched and still, two still notes by its beak                                          |

The button's words still say what it does. Screen-reader users never perceive the gull, and anyone
with Reduce Motion never sees it arrive, so the gull can only be the only _moving_ hint, never the
only hint. It sits inside the button, so it can never hide the focus ring. Nothing about it is
stored: a visitor who turned the waves off yesterday gets the invitation again today, and the press
is still their choice.

## What drawing a gull taught me

> 44 px / Two canvases / A zero time step

The gull is drawn from geometry, a faceted body with jointed wings, not from a sprite. A few things
went wrong on the way, and each is general:

- **A folded wing is a shape, not a pose.** Folding the wing by its skeleton alone left it hanging
  below the belly. Blending each wing panel towards a hand-placed folded shape on the body's flank
  read as a gull even at 44 px.
- **A second canvas silently changes old tests.** My checks found the sea with
  `querySelector('canvas')`. The gull's canvas came first in the page, so they started reading a 2D
  canvas as if it were WebGL. Select by a name, never by position.
- **"Stop when nothing changed" never starts.** A frame loop that sleeps when nothing moved
  this frame never begins an ease, because the first frame after rest has a zero time step.
  Compare the state against its target instead.
- **Screenshot clips are in page coordinates.** After scrolling, a clip built from
  `getBoundingClientRect()` needs `scrollY` added, or it captures the wrong place.

## Vibration has gone quiet too

> Chromium on Android only / 10–20 ms / One tick on iPhone

I had hoped a phone could buzz a little. As of October 2026 only Chromium-based browsers on
Android still vibrate, WebKit opposes the API and Firefox removed it
([W3C](https://www.w3.org/TR/2026/CRD-vibration-20260521/)). Android's own guidance puts a good
click at 10–20 ms and says "choose no haptics" over buzzy ones
([Android](https://developer.android.com/develop/ui/views/haptics/haptics-principles)). An iPhone
gives one system tick when someone really taps a native switch, and since iOS 26.5 that tick can
no longer be triggered from script. So the vibration on my site should be visual: the ship rolling
and recovering, not a button shaking for attention.

## What I have not measured

> No click data yet / No tests with real people

Everything above is design from evidence, not a result. I do not know yet whether the gull draws
presses, how short pulses feel on real phones, or how people with vestibular or attention
disorders experience a sea that reacts to scrolling. My analytics do not count presses of
"Play waves" yet, so even the first question needs a small change before it can be answered. The
others need people, not dashboards.
