---
title: The flag that only half works
summary: How to make a WebGL page give up gracefully when there is no GPU, and what I found when I tried to test it.
topic: WebGL & performance
date: 2026-10-09
status: published
emphasis: only half works
caption: A sea drawn without a GPU: what a browser that can only render in software is left to show.
closing: Make the fallback a real page, not an apology.
---

My home page opens on a WebGL sea: sixty thousand triangles, redrawn every frame. It's smooth on my MacBook, then I ran the page through [PageSpeed Insights](https://pagespeed.web.dev/) and got a Performance
score of 62 on desktop and 57 on mobile. The desktop run reported a
[Total Blocking Time](https://web.dev/articles/tbt) of **27.7 seconds**; mobile, 3.2 seconds.

The page was not slow. The test machine was. PageSpeed runs Lighthouse in headless Chrome
on a server, and a server has no GPU. WebGL still works there, but it falls back to a
software renderer, and a software renderer drawing a full-screen 3D scene every frame keeps
the browser busy for as long as the test lets it.

It's an edge case but a real situation none-the-less: someone with hardware acceleration
turned off, an old laptop, a remote desktop, a blocklisted driver. They will get the same janky
page, and it is my job to do something about that.

## The one-line answer

> One attribute / One line / null on failure

A word I will keep using is _context_. To draw 3D graphics a page calls
[`canvas.getContext("webgl2")`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext),
and what comes back is the context: your handle to the
graphics system, the object every draw call goes through. Behind it, the browser has asked
a separate GPU process to set up a drawing surface and all its state. Normally that is the real
GPU. When the machine has none, the browser will usually still hand you a context, backed by a
software renderer that does the same arithmetic on the CPU. Your code cannot tell the difference
unless it checks, and the page just gets slow.

`failIfMajorPerformanceCaveat` is that check, made at the moment of asking. Pass `true` in the
options and [the WebGL specification](https://registry.khronos.org/webgl/specs/latest/1.0/#WebGLContextAttributes)
says creation will fail if the implementation decides the context would
perform dramatically worse than a native application making the same calls. If it fails,
`getContext` returns `null`, and you show something else.

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

My page already had a fallback for "no WebGL": an SVG engraving of the same sea
right under the canvas. So the whole change is one line. The interesting part was proving it
works.

## Proving it, and what the flag really checks

> Chrome 154 / macOS, M4 Pro / Five flag combinations

I do my browser checks in headless Chrome, so I needed a headless Chrome that counts as
software-rendered. I assumed `--use-angle=swiftshader` ([SwiftShader](https://github.com/google/swiftshader) is Chrome's software
renderer) was the flag. I wrote a probe that asks for a context twice and reads the renderer
string each time. The **ordinary request** is a plain `getContext("webgl2")`: the browser gives
me a context no matter what is behind it, hardware or software. The **strict request** adds
`failIfMajorPerformanceCaveat: true`: the browser must refuse, by returning `null`, if it would
have to give me a software-backed one. So the ordinary request tells me what the browser is
really rendering with, and the strict request tells me whether the flag would have caught it.

```js
const make = (attrs) => {
  const gl = document.createElement("canvas").getContext("webgl2", attrs);
  if (!gl) return null;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
};
make({}); // ordinary request
make({ failIfMajorPerformanceCaveat: true }); // strict request
```

Here is what Chrome 154 on a Mac with an M4 Pro did with different launch flags, each run
three times with the same result. In the table, the ordinary column is the renderer I got, and
the strict column is whether the strict request was created or refused:

| Launch flags                                   | Ordinary request | Strict request |
| ---------------------------------------------- | ---------------- | -------------- |
| none                                           | Apple Metal      | created        |
| `--use-angle=swiftshader`                      | SwiftShader      | **created**    |
| `--disable-gpu`                                | SwiftShader      | **`null`**     |
| `--use-gl=angle --use-angle=swiftshader-webgl` | SwiftShader      | **created**    |
| `--disable-gpu --use-angle=swiftshader`        | SwiftShader      | **created**    |

Every row also had `--enable-unsafe-swiftshader`, which my test harness always adds. Without
it, `--disable-gpu` does not give a slow context at all: the ordinary request returns `null`
too, because Chrome no longer falls back to software WebGL unless you
[opt in](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.98/ui/gl/gl_features.cc). That is worth
knowing before you copy the flag from a table like this one.

The surprise is that three rows are plainly rendering in SwiftShader and the strict request
still succeeds. My first guess was that an explicitly chosen backend counts as a decision rather
than a caveat. The truth, which I found by reading the Chromium source for this exact version,
is duller and more useful: the flag does not measure performance. When a strict context is
requested, the GPU process looks at its own launch switches
([`gles2_command_buffer_stub.cc`](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.98/gpu/ipc/service/gles2_command_buffer_stub.cc))
and fails only if `--use-gl` is `angle` and `--use-angle` is exactly `swiftshader-webgl`. That
value is not one you would normally type. It is what Chrome itself writes for the GPU process
when it has decided there is no usable GPU and falls back to software WebGL
([`SetSoftwareWebGLCommandLineSwitches`](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.98/ui/gl/gl_implementation.cc)). I confirmed it by reading the GPU process's command
line while each browser ran: under `--disable-gpu` it was launched with
`--use-gl=angle --use-angle=swiftshader-webgl`, and Chrome logged `fail_if_major_perf_caveat +
software gl`; under `--use-angle=swiftshader` it got only `--use-angle=swiftshader`, a different
value, so nothing fired. On Windows the same check also covers the D3D11 WARP fallback.

That also explains the last row, where combining the flags seemed to undo `--disable-gpu`. Chrome
only writes its own software-WebGL switches if you have not already requested a GL
implementation, so an explicit `--use-angle` replaces the route `--disable-gpu` would have
taken, and the caveat never fires. The browser is still rendering in software; it just got
there by the route the check does not recognise. When I passed the whole pair
`--use-gl=angle --use-angle=swiftshader-webgl` myself, the GPU process received only the
`--use-angle` half, so the pair the check wants never appeared. I did not find where `--use-gl`
is dropped.

All of this matters for anyone who tests WebGL in CI. If your tests run with an explicit
SwiftShader flag, they will happily exercise the WebGL path and never hit your fallback. To test
the fallback you need the no-GPU case, and that is `--disable-gpu`. I added a small script that
launches Chrome that way, loads the page at a desktop and a phone size, and asserts that the
scene reports itself as fallback, nothing was drawn, the static plate is visible, the pause
button is disabled and the heading is still readable. Twelve assertions, all passing. The rest of
my browser checks keep using SwiftShader, which keeps their WebGL path and keeps their
screenshots steady.

## Did it help, and is it fair?

> 62 → 99 desktop / 57 → 92 mobile / One run each

Locally, with no GPU, the long tasks nearly vanish: 0 ms of blocking time on desktop and
85 ms on a phone profile with 4× CPU throttling. With the scene running in software, the
same page on the same machine blocked for 103 ms and 151 ms. I should be honest about the gap:
I never reproduced PageSpeed's 27.7 seconds locally. My Mac's software renderer is far faster
than whatever a PageSpeed worker has, so the numbers I can produce are small either way.

Then I released it and ran PageSpeed again.

| Lab run (PageSpeed Insights) | Desktop before | Desktop after | Mobile before | Mobile after |
| ---------------------------- | -------------- | ------------- | ------------- | ------------ |
| Performance                  | 62             | **99**        | 57            | **92**       |
| Total Blocking Time          | 27,700 ms      | **20 ms**     | 3,160 ms      | **100 ms**   |
| Speed Index                  | 3.1 s          | 1.0 s         | 5.7 s         | 2.4 s        |
| Largest Contentful Paint     | 0.7 s          | 0.8 s         | 3.3 s         | 3.2 s        |
| First Contentful Paint       | 0.4 s          | 0.5 s         | 1.6 s         | 1.5 s        |
| Accessibility                | 97             | 100           | 97            | 100          |

The release between those two runs included the strict request, which sends a browser that can
only render in software to the engraved plate, along with some unrelated clean-up.

It will partly look like gaming the score, so it is worth saying plainly. The lab score improves
because the page does less work in the lab. But the same condition exists for real visitors, and
for them the page also improves. The trade is that someone with a blocklisted GPU driver also
gets the plate, even if their machine could have coped. I think that is the right side to err on
for a page whose main trick is a full-screen animation, and the plate is the same sea, engraved.

The source reading also sets the limit of the claim. The flag catches the case where Chrome has
itself fallen back to software WebGL, which is the PageSpeed case and the "hardware acceleration
turned off" case. By my reading of the code it is not a general "this machine is slow" test, so
a device that is merely weak, or one that reaches software rendering by another route, would
still get the full scene. I only tested Chrome, on a Mac. I have not tried Safari, Firefox,
Windows or Linux, and I would not assume they classify "major performance caveat" the same way.
