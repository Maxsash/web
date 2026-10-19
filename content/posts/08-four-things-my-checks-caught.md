---
title: Four things my checks caught
summary: A stale computed style, a recorder that said it was recording, a link that was not local, and a dev server that wrote files for my AI assistant.
topic: Testing
date: 2026-10-19
status: published
caption: Four small surprises, each caught by asking the browser what it actually did.
closing: Ask the system what it did, not what it said it would do.
---

Most of what my automated checks catch is boring: a label that no longer fits, a link that moved.
These four were not. None of them is big enough for a post of its own, and each one changed how I
write checks.

## A computed style that lagged the screen

> --progress: 1 / The screenshot disagreed / Pixels win

The medal in my About section is animated by scroll: a registered CSS custom property runs from 0
to 1 on a scroll-driven timeline. My check scrolled the page to a point mid-way through the medal
and read the property with `getComputedStyle`, expecting a value in the middle.

Right after a large programmatic scroll, Chrome reported `1`. The screenshot taken in the same
moment showed the correct mid-animation frame. A moment later, the computed value agreed with the
screen. I do not know whether that is a bug or a timing detail of how scroll timelines update
style, but the practical lesson is clear: for scroll-driven states, check the pixels, or wait and
read twice. The style is a report about the frame, and it can be late.

## "Recording started" was not a recording

> Recorder on / Nothing sent / A bot filter

My site can record masked session replays when its rules and the visitor allow it. The check for that feature
started a browser, opted in, and asserted that the recorder said it had started. It passed.

Then I looked at what was actually sent. Nothing. The replay library's bot filter had recognised
the headless test browser and suppressed capture before my own outgoing hook ever saw an event.
The recorder's "started" flag was true the whole time.

The fix was in the test, not the product: the check now presents an ordinary browser user agent
and hides the automation flag, so the filter treats it like a visitor, while production keeps the
filter on. And it no longer trusts the flag. It intercepts the outgoing requests and asserts that
compressed snapshots arrive, that the text in them is masked and that they carry the right IDs.
A feature that reports its own success needs a check that looks at the output.

## A link that only looked local

> /about is local / //evil.test is not

My Notebook posts are Markdown, and the parser keeps only links that look safe. My first draft of
that rule was "starts with `http`, `mailto:`, `#` or `/`". Before it ever shipped, a test listing
hostile links caught the hole:

```js
test("links with unsafe schemes are reduced to their text", () => {
  for (const href of ["javascript:void", "data:text/html,x", "vbscript:x", "//evil.test"]) {
    assert.deepEqual(parseInline(`[click](${href})`), [text("click")]);
  }
});
```

`//evil.test` starts with a slash, and it is not a path on my site. It is a protocol-relative URL:
the browser fills in `https:` and goes to another domain. The rule now refuses a second slash:

```js
const SAFE_HREF = /^(https?:\/\/|mailto:|\/(?!\/)|#)/;
```

Write the hostile cases down as tests before you trust an allow-list. The one you miss will be the
one that looks most like the safe case.

## A dev server that wrote files

> Next.js 16.3 / AGENTS.md / CLAUDE.md

One day `next dev` printed "Generated AGENTS.md for AI agents". Since version 16.3, when the dev
server detects that an AI coding agent is running it, it writes a managed block of instructions
into `AGENTS.md` and points `CLAUDE.md` at it. The block tells the assistant to read the
documentation bundled in `node_modules` instead of trusting what it learned in training, which is
good advice for a framework that changes this quickly.

Two details are worth knowing. The block is fenced by `<!-- BEGIN:nextjs-agent-rules -->` and an
`END` marker, and Next.js rewrites only what is between them, so an `AGENTS.md` that already has the
same text **without** the markers gets a second copy. Adopting the markers stops that. And if you
do not want it at all, `agentRules: false` in `next.config` turns it off. Both are in the AI-agents
guide that ships with Next.js; I had simply not read it until my files changed under me.
