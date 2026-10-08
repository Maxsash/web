---
title: The flag that only half works
summary: How to make a WebGL page give up gracefully when there is no GPU, and what I found when I tried to test it.
topic: WebGL & performance
date: 2026-10-08
status: draft
emphasis: only half works
caption: A sea drawn without a GPU: what a browser that can only render in software is left to show.
closing: Make the fallback a real page, not an apology.
---

My home page opens on a WebGL sea: sixty thousand triangles, redrawn every frame. On my
laptop it is smooth. Then I ran the page through PageSpeed Insights and got a Performance
score of 62 on desktop and 57 on mobile, with a Total Blocking Time of **27.7 seconds**.

The page was not slow. The test machine was. PageSpeed runs Lighthouse in headless Chrome
on a server, and a server has no GPU. WebGL still works there, but it falls back to a
software renderer, and a software renderer drawing a full-screen 3D scene every frame keeps
the browser busy for as long as the test lets it.

That is a lab artefact. But it is also a real situation: someone with hardware acceleration
turned off, an old laptop, a remote desktop, a blocklisted driver. They get the same janky
page, and it is my job to notice.

## The standard answer

> One attribute / One line / null on failure

WebGL has an option for exactly this. When you ask for a context, you can pass
`failIfMajorPerformanceCaveat: true`. The spec says that creation will then fail if the
implementation decides the context would perform dramatically worse than a native
application making the same calls. If it fails, `getContext` returns `null`, and you show
something else.

```ts
const gl = canvas.getContext("webgl2", {
  alpha: false,
  antialias: false,
  depth: true,
  powerPreference: "low-power",
  failIfMajorPerformanceCaveat: true,
});
if (!gl) throw new Error("Hardware-accelerated WebGL2 is unavailable");
```

My page already had a fallback for "no WebGL": a server-rendered SVG engraving of the same
sea sits under the canvas. So the whole change is one line.

The interesting part was proving it works.

## Testing it: which flag gives you a "slow" browser?

> Chrome 154 / macOS, M4 Pro / Five flag combinations

I do my browser checks in headless Chrome, so I needed a headless Chrome that counts as
software-rendered. I assumed `--use-angle=swiftshader` (SwiftShader is Chrome's software
renderer) was the flag. I wrote a probe that asks for a context twice, once plain and once
strict, and reads the renderer string:

```js
const make = (attrs) => {
  const gl = document.createElement("canvas").getContext("webgl2", attrs);
  if (!gl) return null;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
};
make({}); // plain
make({ failIfMajorPerformanceCaveat: true }); // strict
```

Here is what Chrome 154 on a Mac with an M4 Pro did with different launch flags:

| Launch flags                                   | Plain context     | Strict context |
| ---------------------------------------------- | ----------------- | -------------- |
| none                                           | Apple Metal (GPU) | created        |
| `--use-angle=swiftshader`                      | SwiftShader       | **created**    |
| `--disable-gpu`                                | SwiftShader       | **`null`**     |
| `--use-gl=angle --use-angle=swiftshader-webgl` | SwiftShader       | **`null`**     |
| `--disable-gpu --use-angle=swiftshader`        | Apple Metal (!)   | created        |

Two surprises.

**Forcing SwiftShader is not the same as having no GPU.** With `--use-angle=swiftshader` the
renderer really is SwiftShader, yet the strict context was created. My reading, which I have
not confirmed in the Chromium source, is that an explicitly chosen backend counts as a
decision, not a caveat. Only when Chrome ends up in software because there is no usable GPU
does the caveat fire. `--disable-gpu` does that.

**Combining flags can undo them.** `--disable-gpu --use-angle=swiftshader` gave me the real
GPU back. I did not dig into why.

This matters for anyone who tests WebGL in CI. If your tests run with an explicit
SwiftShader flag, they will happily exercise the WebGL path, and they will never hit your
fallback. To test the fallback you need the no-GPU case, and that is `--disable-gpu`.

## The check

> Twelve assertions / Desktop and phone / --disable-gpu

I added a small script that launches Chrome with `--disable-gpu`, loads the page at a desktop
and a phone size, and asserts that the scene reports itself as fallback, nothing was drawn,
the static plate is visible, the pause button is disabled and the heading is still
readable. Twelve assertions, all passing. The rest of my browser checks keep using
SwiftShader, which keeps their WebGL path and keeps their screenshots steady.

## Did it help?

> 0 ms desktop / 85 ms phone / Software, 4× CPU

Locally, with no GPU, the long tasks nearly vanish: 0 ms of blocking time on desktop and
85 ms on a phone profile with 4× CPU throttling. With the scene running in software, the
same page on the same machine blocked for 103 ms and 151 ms.

I should be honest about the gap. I never reproduced PageSpeed's 27.7 seconds locally. My
Mac's software renderer is far faster than whatever a PageSpeed worker has, so the numbers I
can produce are small either way. The part I can claim is the mechanism: a browser that can
only render in software now shows a plate instead of running the scene.

_[Update after the next release: paste the new PageSpeed scores here.]_

## Is this just gaming the score?

> The same condition / Real visitors too

Partly it will look that way, so it is worth saying plainly. The lab score improves because
the page does less work in the lab. But the same condition exists for real visitors, and
for them the page also improves. The trade is that someone with a blocklisted GPU driver
also gets the plate, even if their machine could have coped. I think that is the right side
to err on for a page whose main trick is a full-screen animation, and the plate is the same
sea, engraved.

## The takeaway

> Test with --disable-gpu / Chrome only

- `failIfMajorPerformanceCaveat: true` is a one-line way to turn "WebGL is technically
  available but terrible" into a code path you control.
- Test it with `--disable-gpu`, not with an explicit software backend.
- Make sure the fallback is a real page, not an apology.

I only tested Chrome. I have not tried Safari, Firefox or Windows, and I would not assume
they classify "major performance caveat" the same way.

---

## Notes for the editor (delete before publishing)

- Written in first person as the site's author; change if you want a different voice.
- Facts checked against my own measurements on 8 October 2026: Chrome 154.0.8037.98 on macOS
  (M4 Pro); PageSpeed ran HeadlessChromium 153 with Lighthouse 13.5.0.
- Spec wording paraphrased from the WebGL 1.0 spec, `WebGLContextAttributes`
  (<https://registry.khronos.org/webgl/specs/latest/1.0/>). The spec describes the attribute
  for WebGL 1; I used it with `webgl2`, where it behaves the same in Chrome.
- The sentence about "an explicit backend counts as a decision" is my inference. Soften it or
  check the Chromium source before publishing.
- To fill in after the release: the new PageSpeed numbers.
- Code in the post is from `components/observatory/ocean-engine.ts` and
  `tools/check-software-fallback.mjs`.
