---
title: A face drawn as a sea
summary: Turning a dark portrait photo into 72 engraved lines: why darkness-as-squiggle failed, and why brightness-as-height with hidden lines worked.
topic: Generative drawing
date: 2026-10-19
status: published
caption: Seventy-two rows, each lifted by light and rippled by the same sea as the home page.
closing: Draw what the eye reads first: the light.
---

My About section has a round medal with my photo in it. As you scroll past, the photo sinks and
a line engraving of the same face surfaces in its place, drawn from the same sea that runs across
the top of the page. Getting a face to read as lines took two attempts, and the first one failed
for a reason worth knowing before you try it.

## Darkness as squiggle

> 54–72 rows / Beard and background / Same density

The usual way to draw a photo with lines is to let each row wiggle more where the picture is
darker: bigger and faster waves in the shadows, flat lines in the light. It works beautifully on a
pale face against a pale background.

My photo is a light face against a dark olive background, with a beard. At 54 to 72 rows the
background and the beard came out equally dense, and the face dissolved between them. The lines
were faithful to the darkness; the darkness was just not where the face was.

## Brightness as height

> Light lifts the line / Later rows hide earlier ones

The second approach inverts the question. Instead of drawing the dark, each row is **lifted where
the picture is light**, like a landscape seen from a low angle. Then the rows are drawn from the
top down, each as a filled shape, so that every row hides the parts of the rows behind it. It is
the look of the _Unknown Pleasures_ cover, and it gives the face what squiggles could not:
occlusion. A cheek in front hides the background behind it, the way a hill hides the valley.

At 72 rows it read as a face.

## Rippling the flat parts with the sea

> Home water / 60 m across / 1.8 m per row

Flat, dark areas still drew dead straight lines, which looked like a printer, not an engraving. So
where the picture is dark, each row borrows a little height from the site's sea model, the same
six-wave surface the home page renders, sampled 60 metres across the medal and 1.8 metres further
out for every row. Where the picture is light, the lift from the photo takes over.

```ts
function rowLine(shade: Shade, sea: SeaEdition, row: number) {
  const base = (row + 0.5) * GAP + LIFT * 0.35;
  const points: string[] = [];
  for (let x = 0; x <= PLATE; x += STEP) {
    const light = smoothstep(0.16, 0.78, shade(x / PLATE, Math.min(1, base / PLATE)));
    const swell = sampleSea(sea, (x / PLATE) * METRES_ACROSS, row * METRES_PER_ROW, 0).height;
    points.push(`${x} ${(base - LIFT * light - SWELL * (1 - light) * swell).toFixed(1)}`);
  }
  return points;
}
```

The shade comes from the photo scaled down to 160 pixels and converted to brightness. The
`smoothstep` between 0.16 and 0.78 matters more than it looks: it ignores the darkest shadows and
the brightest highlights, so noise in either does not wobble the lines, and it spends all the lift
on the middle tones where a face's shape lives.

## The details that made it a medal

> Closed outlines / One scroll / Paper and ink

Each row is closed into a shape that runs down past the bottom of the medal, so the fill that hides
the rows behind is a real area, not a stroke trick. The engraving and the photo share one scroll:
a single CSS custom property runs from 0 to 1 as the medal passes through the screen, printing the
lines in and sinking the photo, then the reverse. Without scroll-driven animation, under Reduce
Motion or without JavaScript, the property rests at the middle and the photo shows.

What I would keep from this:

1. Before choosing a line technique, look at where the subject is light and where it is dark,
   not just at the subject.
2. Occlusion does more for a face than detail does.
3. Clamp the tones you map. The extremes are mostly noise.
