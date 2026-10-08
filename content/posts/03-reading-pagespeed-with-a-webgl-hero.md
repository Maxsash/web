---
title: What PageSpeed saw in the sea
summary: Which numbers to worry about, which to ignore, and the header that told me my server was on the wrong continent.
topic: Performance & hosting
date: 2026-10-08
status: draft
emphasis: in the sea
caption: A lab report read slowly: first byte, render delay, and the number that would not reproduce.
closing: Treat the lab as a list of leads, not a verdict.
---

I ran my home page through PageSpeed Insights for the first time and got this.

| Lab result               | Mobile   | Desktop   |
| ------------------------ | -------- | --------- |
| Performance              | 57       | 62        |
| First Contentful Paint   | 1.6 s    | 0.4 s     |
| Largest Contentful Paint | 3.3 s    | 0.7 s     |
| Total Blocking Time      | 3,160 ms | 27,700 ms |
| Cumulative Layout Shift  | 0        | 0         |
| Speed Index              | 5.7 s    | 3.1 s     |

Accessibility was 97, Best Practices 100, SEO 100. The "real users" section said **No Data**,
because the site does not have enough real traffic yet for Chrome's field data.

That last point matters. Google's page-experience signals come from field data. This
report was a lab test, one run on a machine I do not control. It is useful for finding
things, and a poor thing to be anxious about.

## Where the score went

> Mobile 57 / Desktop 62 / TBT 27.7 s

Look at what each metric contributes. On desktop, paint timings and layout shift were fine.
Nearly all the missing points were one metric: Total Blocking Time, worth about a third of
the score. 27.7 seconds, with 33.9 seconds of main-thread work.

My page runs a WebGL scene continuously. Lighthouse waits for the page to go quiet, and mine
never does. On a machine with no GPU, WebGL falls back to a software renderer, and that is
slow enough to keep the browser busy for the whole test. I wrote about that
[separately](/blog/the-webgl-flag-that-half-works); the short version is one line of code
that makes software-rendered browsers show a static plate instead.

What I want to talk about here is what I did **not** know, and how I checked.

## I could not reproduce it

> 103 ms desktop / 151 ms mobile / Locally

I replayed the situation locally: headless Chrome, no GPU, a phone-sized screen, CPU slowed
4×. The blocking time came out at 103 ms on desktop and 151 ms on mobile, not 27 seconds.
My laptop's software renderer is much faster than whatever PageSpeed's worker has.

So I could not prove the cause. I could show the mechanism (the scene was the main work, and
turning it off dropped mobile blocking from 151 ms to 21 ms) and fix it, but the proof will
be the next report. That is an uncomfortable position, and it is the honest one.

## First byte: read the headers

> bom1 edge / iad1 function / 0.4–1.8 s

The LCP breakdown said **time to first byte 820 ms** and **element render delay 780 ms**.
The first number was the larger, and it was a surprise: my page is simple.

I asked my own site for its response headers:

```
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
x-vercel-cache: MISS
x-vercel-id: bom1::iad1::kwxnc-...
```

Two things. The page is never cached, which I knew: the server picks a random sea for every
visit. And `x-vercel-id` lists the regions that handled the request: `bom1` is the edge
that received it, in Mumbai, and `iad1` is where the function **ran**, in Washington, D.C.
Three requests from India took 1.8, 0.57 and 0.38 seconds to the first byte.

I would not have found that from the PageSpeed report. It does not name regions. The header
did. If your site is dynamic, check where your function runs against where your readers
are. There is a setting for it, and I left it alone for now because I do not yet know where
the readers are.

## Render delay: not my code

> Slow 4G / 206 KB of fonts / 0.9 s

With the first byte out of the way I wanted to see what the 780 ms was. I replayed a Slow-4G
load locally (1.6 Mbps, 150 ms latency, 4× CPU) with no server latency at all. The heading
painted at about 0.9 seconds. During that time the page was pulling two blocking stylesheets,
a 137 KB (gzipped) document, and three preloaded fonts totalling 206 KB, all over the same
thin link. That is a bandwidth story, not a code story. I looked at trimming the font
axes and found that every one is in use, so I left it.

## "Forced reflow: 168 ms"

> About 130 ms / Under ten percent

Lighthouse flagged a forced reflow. I knew my code reads layout sizes when it starts, so I
expected a real problem. I measured it instead.

With the browser's own metrics, layout took about 130 ms at 4× throttling, close to the
report's 168 ms. Then I tried the obvious cure, `content-visibility: auto` on the sections
below the fold, so the browser could skip them. Three runs each:

| Layout time    | Baseline      | With `content-visibility` |
| -------------- | ------------- | ------------------------- |
| three runs, ms | 143, 131, 129 | 130, 126, 127             |

Under ten percent. The expensive layout was the hero itself, not the sections below, and
it had to happen once anyway. I did not ship it. A change that saves a few milliseconds and
touches find-in-page, anchors and scroll behaviour is not a good trade.

## The one fix that was plain old accessibility

> 5.2:1 day / 7.8:1 night

The contrast failure turned out to be a pill that says "You are sailing this sea". I had
dimmed it with `opacity: 0.65`. Opacity quietly lowers contrast, and it is easy to forget
because the colour you wrote is fine. I swapped it for a muted text colour, and measured
5.2:1 in day mode and 7.8:1 at night, above the 4.5:1 requirement.

The same report flagged two links with identical text ("Read the case study") that go to
different places. A screen-reader user hears them as the same. I added the project name to
each as visually hidden text.

## What I would do again

> Leads / Headers / Measure first

- Treat a lab report as a list of leads, not a verdict.
- When you cannot reproduce a number, say so, and fix the mechanism you can show.
- Read your response headers. `x-vercel-id` told me more than the report did.
- Measure the cure before you ship it. My best guess for the reflow was wrong.

---

## Notes for the editor (delete before publishing)

- All numbers are from the PageSpeed report pasted on 8 October 2026 (Lighthouse 13.5.0,
  HeadlessChromium 153; mobile profile "Emulated Moto G Power", Slow 4G) and my local runs.
- Which run produced the LCP breakdown (820 ms / 780 ms) was not labelled in the paste;
  I assumed mobile. Check before publishing, and drop the sentence if unsure.
- "Time to first byte from India: 1.8, 0.57, 0.38 s" came from three `curl` requests to the
  live site from my machine on 8 October 2026.
- Decide whether to keep "the wrong continent" in the subtitle: the audience's location is
  unknown. The function region is still `iad1` and the decision is open.
- "A third of the score" for TBT is the Lighthouse desktop and mobile weighting of 30%.
- "Lighthouse waits for the page to go quiet, and mine never does" is my understanding of why
  the blocking time keeps growing; I did not read Lighthouse's source. Soften or verify.
- Link to draft 1 should become the real URL once published.
- To fill in after release: new PageSpeed scores (and whether a region change was made).
