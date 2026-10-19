---
title: My site was fast; the road to it wasn't
summary: Random five-second page loads that no profiler explained, traced to one DNS record, and the prefetching that makes the rest of the wait disappear.
topic: Performance & hosting
date: 2026-10-19
status: published
caption: The same request, sent to five addresses of the same host: three went quiet together, two never did.
closing: When the page is innocent, look at the road.
---

Every so often, tapping the Notebook or a case study on my own site did nothing for five seconds
or more. Not every time. Not on any page in particular. Often enough that I stopped believing it
was my phone.

The pages themselves are about as cheap as a page can be. They are built in advance and served
from Vercel's cache in Mumbai. When I asked for them from my laptop they arrived in a fifth of a
second. So either something on the page was slow some of the time, or something between the page
and me was.

## The page was innocent

> Cache HIT / 0.2 s / 27–75 KB

I started with what I could measure on the server's side. Every page I tried was a cache **HIT**
at the `bom1` edge, with the first byte back in about 0.2 s. The data a tap fetches (Next.js calls
it the RSC payload) was 27 KB for a case study and 75 KB for the Notebook, compressed.

Then I measured a tap the way a phone makes it: headless Chrome at phone size, the CPU slowed
four times, the network throttled to 4G and then 3G. A tap took 0.5 s on 4G and 1 s on 3G, and
every repeat agreed to within a few hundredths of a second. That is slower than it should be (more
on that later), but it is not five seconds, and it is not random.

## Catching it

> 16.5 s / 26.4 s / About 1 tap in 15

So I stopped emulating and pointed the same script at the live site: open the home page, wait like
a reader, tap a link, time it, repeat. Most taps took 0.1–0.3 s. Then one took **16.5 seconds**,
and in another run one took **26.4**.

Chrome records the timing of each request, and the slow one was strange. The request went out
immediately, on a connection that was already open, and then waited 16.4 s for the first byte of
the answer. The answer, when it came, said `x-vercel-cache: HIT`. Requests sent on the same
connection right afterwards came back in 40–150 ms. Whatever happened, it happened to every
request in flight at that moment and then cleared.

## The header that kept time

> Sent at :50 / Seen at :55.9 / The edge was not slow

To rule out the browser I wrote a small HTTP/2 client in Node that opens one connection and
requests a cached file every couple of seconds for a few minutes. It caught a stall too: a tiny
favicon took 5.8 s.

Vercel stamps every response with an `x-vercel-id` such as `bom1::rddp4-1792394995918-6f3e…`. The
middle number looks like a Unix time in milliseconds, and on normal requests it matched the
moment I sent them to within the same second. On the slow one it did not:

```js
const sentAt = Date.now(); // 07:29:50
// …
const seenAt = Number(headers["x-vercel-id"].split("-").at(-2));
new Date(seenAt).toISOString(); // "…T07:29:55.918Z"
```

The request reached Vercel almost six seconds after I sent it, and was then answered at once. That
reading of the header is my own, not something I found documented, but it fits every request I
checked. It moved the problem off my site and off Vercel's cache, onto the road between them.

## Five addresses, one host

> 0 stalls / 2–5 stalls each / Same seconds

Next I ran the same probe against several sites at the same time from the same laptop: my site,
Google, Cloudflare, and two sites that Vercel hosts for itself. Over five minutes, only my site
stalled, once for 53 seconds until the connection gave up. Vercel's own sites resolved to
different addresses from mine, so I pinned the probe to each of Vercel's addresses in turn, still
asking for my site every time:

| Address my site was reached through         | Stalls in 200 requests | Worst |
| ------------------------------------------- | ---------------------- | ----- |
| `64.239.109.1`, `64.239.109.65`             | 0                      | 0.6 s |
| `64.29.17.1`, `64.29.17.65`, `216.198.79.1` | 2–5 each, then dead    | 60 s  |

The second row is where my domain's DNS pointed. Worse than the counts was the timing: the
stalls on those three addresses happened in the **same seconds**, about every seventy seconds, as
if they shared one bad link somewhere along the way. A `traceroute` showed my provider, Jio, and
then nothing useful. I cannot see whose link it is, only that it is on the way to those addresses
and not the others.

## The fix was one DNS record

> One CNAME / 0 in 480 / Ignore the banner

My `www` record pointed at a project-specific name Vercel had given me, which resolves to the
stalling addresses. Vercel still supports its older, shared name, `cname.vercel-dns.com`, which
resolved to two other ranges. I pinned the probe to those first: no stalls. I changed the record,
and after it propagated I measured again, with one of the old addresses as a control so that a
quiet evening could not fool me:

| Address                     | Stalls in 240 requests | Worst  |
| --------------------------- | ---------------------- | ------ |
| `76.76.21.164` (new)        | 0                      | 0.29 s |
| `66.33.60.34` (new)         | 0                      | 0.27 s |
| `64.29.17.1` (old, control) | 3                      | 60 s   |

The bare domain got the same treatment, pointed at Vercel's long-standing `76.76.21.21`.

Vercel's dashboard now shows a yellow **DNS Change Recommended** badge on both, suggesting a new
project-specific record. That record resolves to the same addresses that stalled, so I am leaving
the badge yellow. The banner itself says the older records "will continue to work".

## Then make the wait disappear

> prefetch={false} / 0.05 s / About 100 KB

The DNS change removed the random stalls. It did not remove the 0.5–1 s every tap was paying,
and that one was my own doing. Every internal link on the site went through one component, and
that component switched Next.js's prefetching off, a setting left over from the first scaffold
that nobody had questioned. So nothing was fetched until a finger landed.

Now links to the Notebook, its notes and the case studies prefetch when they scroll into view.
Home and the sea studio still load only on demand, because they carry the WebGL engine. On the
same throttled phone a tap now takes **0.05–0.08 s** on 4G and on 3G, and scrolling the whole
home page costs about 100 KB of prefetched data for eight pages. Prefetching also hides a stall
when it happens in the background, before anyone taps.

## What this does not prove

> One connection / One evening / One provider

All of this comes from my home connection, on one evening, through one provider. I do not know
whether visitors on other networks ever saw the stalls, whether the cause sits with my provider
or with Vercel, or whether it will still be there next month. What I do know is how to tell
quickly: the site records how long each navigation takes, and anything that has not arrived
within ten seconds is counted as a timeout. If those start appearing from one network, the probe
above is a ten-minute test.

The lessons I would keep:

1. When a slow page is a cache hit, stop profiling the page and look at the network.
2. Timestamps in response headers can tell you when the request arrived, not just when it left.
3. Pin your probe to each address the host offers. Different addresses can take different roads.
4. Run a control alongside the fix, or a quiet hour will look like a cure.
