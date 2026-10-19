---
title: Imports that moved the headings
summary: A refactor that was supposed to change nothing, a pixel-diff tool that disagreed, and a CSS rule that had been losing a fight all along.
topic: Refactoring & CSS
date: 2026-10-19
status: published
caption: Two rules, one specificity, and an import order that decided between them.
closing: No behaviour change is a claim, and a claim needs a tool.
---

I was cleaning up my site's code. The rule for that kind of work is simple: **no behaviour
change**. Split big files, remove duplication, and the page should look exactly the same.

"Exactly the same" is a claim, and I wanted a tool to back it up, so I wrote one. It builds
the previous commit and the new commit, serves them on two ports, loads eight pages at
desktop and phone sizes in day and night themes (32 views), screenshots each, and compares
them pixel by pixel with a small tolerance.

Most of the refactor passed. One section did not.

## The diff

> 32 views / Two builds / One section differs

After I moved a few imports around the home page, the "Work" section differed from the old
build: about 30,000 pixels, with the largest colour difference at 211 out of 255. That is not
rounding noise. I opened both screenshots side by side. The headings had different widths:
"Ideas, made" ended roughly a dozen pixels further left in one build than the other.

Nothing in that component had changed. The HTML was identical, once I stripped the generated
class names. The built CSS looked identical too: I sorted every rule, removed the generated
hashes from the class names, and the two lists were the same.

## Same rules, different order

> -0.055em or -0.06em / A tie, broken by order

The giveaway was reading the computed style in a real browser:

```
old build:  letter-spacing: -6.336px   (that is -0.055em at 115.2px)
new build:  letter-spacing: -6.912px   (that is -0.06em)
```

My stylesheet said both. The home page's stylesheet has a rule for all headings in the page:

```css
.page h1,
.page h2,
.page h3 {
  font-weight: 450;
  letter-spacing: -0.055em;
}
```

and the Work section's stylesheet has its own:

```css
.header h2 {
  font-weight: 400;
  letter-spacing: -0.06em;
}
```

Both selectors have the same specificity: one class and one element. When specificity ties,
the rule that appears **later in the final CSS wins**. My best explanation is that the order of
the stylesheets follows the order the bundler meets the imports, so by moving imports around I
had flipped it. It fits everything I saw (identical rules, a different winner, nothing changed
but imports), but I did not read the bundler's ordering code to prove it.

The surprising part is the direction. The old build, the one I had approved, was using the home
page's rule. The Work section's own heading styles had been losing the tie all along, so they were
dead code. The "wrong" rule was the approved design.

## The fix is to delete, not to reorder

> Four declarations deleted / 28 to 31 of 32

My first instinct was to restore the order. That would have worked until the next time I
touched an import. The real problem was that two rules disagreed and the outcome depended on
the order of imports. I deleted the four losing declarations from the Work section, the
look stayed exactly what it had been, and the dependence on bundle order went away for those
headings. The comparison went from 28 of 32 identical views to 31 of 32.

I have not found a way to make this impossible, and I would be wary of anyone who claims to.
CSS modules scope the class names, not the cascade: an element selector like `.page h2`
reaches into every component inside `.page`. I now check for this by comparing computed
styles, not by trusting the stylesheet.

## The same trap, smaller

> .actions .sailing / More specific wins

Later in the same clean-up I hit the cousin of this bug. A "you are sailing this sea" pill was
failing a contrast check because I had dimmed it with `opacity: 0.65`. I replaced the opacity
with a muted text colour, rebuilt, and the contrast measurement did not change. The pill's
colour was still the full ink colour.

An earlier rule, `.actions .sailing { color: inherit }`, has higher specificity than my
`.sailing` and was overriding it. I had changed the right property in the wrong place. The
fix was to use the same selector. Check the **computed** colour, not the line you edited.

## Text nodes and sub-pixels

> One string, three nodes / Five pixels

Two more diffs in the same exercise taught me something smaller. When I moved the "01 /
Everyday operations" label into a component, the output looked identical, but the tool found
a five-pixel-wide difference on one glyph. The old JSX was one string. My new JSX was
`{label} / {text}`, which React renders as three text nodes. The browser shaped them
slightly differently. Building the label as one template string made the diff disappear. The
same thing happened later with an arrow character at the end of a link.

You would never see it. The tool did, and that was the point.

## When the page above moves, everything below changes

> 0.8 px / Tens of thousands of pixels / Zero real changes

A later refactor taught me the limit of the whole approach. One section grew to 1180.8 px tall,
so everything under it, Work, the studio and the Notebook, moved down by 0.8 px. The pixel diff
lit up: tens of thousands of text pixels differed, with channel differences around 200.

Nothing below had changed. I compared every element's computed style and its box relative to its
section instead: 309 of 311 matched exactly, and the other two were zero-size SVG nodes. A shift
of a fraction of a pixel makes the browser antialias every glyph differently, so a pixel diff
cannot prove "unchanged" once anything above moves. For that, compare computed styles and
relative boxes.

## Controls, or you will chase ghosts

> Build against itself / Then trust the diff

The tool also gave me false alarms, and the lesson there is the part I would pass on.
Occasionally one phone view of an image differed, even when I compared a build **with
itself**. Lazy-loaded images finish at slightly different moments.

So the rule is: before trusting a diff, run the same build against itself. If it differs
there, the tool is the problem. Once I added that habit, I could tell a real change from a
flaky one in a minute.

## What I would tell myself

> A tool / A reason / A control / A limit

1. "No behaviour change" needs a tool. Eyeballing would not have caught a dozen pixels of
   heading width.
2. A pixel diff tells you _that_ something changed. A computed-style comparison tells you
   _why_.
3. Dead CSS can hide behind a tie. If a declaration has never mattered, delete it before it
   starts to.
4. Always run the control: build against itself.
5. Once a section above changes height, stop trusting pixels and compare styles and boxes.
