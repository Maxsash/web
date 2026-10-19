---
title: Know the visitors before personalising
summary: Why a browser cannot tell me who is a client, what real personalisation runs on, and how I am measuring journeys without cookies before changing anything.
topic: Analytics & privacy
date: 2026-10-19
status: published
caption: Two journeys through one page: Work first for someone hiring, the Notebook first for someone exploring.
closing: Measure the paths before you redraw them.
---

My home page leads with Work. That suits someone deciding whether to hire me. It suits someone who
arrived from an essay much less: they have to scroll past five case studies to find more of what
they came for. I would like a lighter, Notebook-first journey for people exploring and a
Work-first one for people hiring.

The tempting next step is to guess which visitor is which and rearrange the page. This post is
about why I have not done that yet, and what I am doing first.

## A browser does not know who is hiring

> Device / Time / Language / None of them is intent

Every browser hands a page plenty of context without asking. None of it says what the person
wants.

| Signal                            | What it is good for           | What it cannot tell me         |
| --------------------------------- | ----------------------------- | ------------------------------ |
| Screen size, orientation, pointer | Layout and controls           | Intent                         |
| Browser and its capabilities      | Compatibility and performance | Profession or budget           |
| Time and time zone                | Presentation                  | Real location or availability  |
| Preferred language                | A language default            | Nationality                    |
| Reduced motion, colour scheme     | Respecting preferences        | Anything personal              |
| The link they arrived by          | Interest in that content      | Who they are: links get shared |

A laptop at 11 a.m. on a weekday is not a client, and a phone at midnight is not a casual reader.
Treating them that way would be guessing with extra steps, and storing those guesses to use on the
next visit would need consent I have no reason to ask for.

## What real personalisation runs on

> Purchase history / Company data / Known customers

I read the documented cases I could find. They are accounts by vendors and their partners, not
independent audits, but they agree on one thing.

[Saks](https://www.mastercard.com/global/en/news-and-trends/Insights/2025/saks-fifth-avenue.html)
changes its home page by purchase-intent tiers built from first-party data, and those tiers can
change within a visit.
[Jacamo](https://www.madewithintent.ai/customer-stories/how-jacamo-increased-conversion-rate-by-6-with-multi-session-experiences)
features the brands and categories a visitor showed interest in before, on their return.
[Livestorm and Dropbox DocSend](https://clearbit.com/resources/books/drive-website-conversions/personalization-strategies-Livestorm-Dropbox-DocSend)
change logos, copy and proof by company size and industry, which they buy from a data-enrichment
service, plus whether the visitor is already a customer.

Every one of them runs on history, bought company data or a known customer. None shows that a first
visit can be classified reliably from the browser alone. A one-person studio has none of those
inputs, and I do not want the ones I would have to buy.

## Measuring journeys without knowing anyone

> No cookies / A visit, not a person / Thirty minutes

So the first step is to look at what visitors actually do. The analytics I added are deliberately
narrow:

- **No cookies, no saved identity.** A random visit ID lives only in memory. A reload or a new tab
  starts a new one, and so do thirty minutes without activity. Counts are visits, not people.
- **Meaningful events only.** A page shown; a home section on screen for a second; a case study or
  note deliberately opened; a note read to its end with at least thirty seconds in the foreground;
  a contact action. No automatic capture of every click, no text from the page.
- **Declared context, kept separate.** A link can say who is visiting (me, a tester) and what they
  came for (work, reading, play). Those labels go on the events and never decide anything about the
  person.
- **Recordings are separate and disclosed.** Some visits can be recorded as masked session
  replays under rules set out on the site's privacy page, which also lets a visitor refuse them.
  Replays help me see where a page confuses people; they are not how journeys are counted.

From those, a few reports answer the question directly: the paths visitors take from the home page,
how many who see Work open a case study, and what people do before they get in touch.

## The blind spots I know about

> Exposure / Engagement / An unknown group

The page shapes the data. Work comes first, so more people see it, so more people open a case
study. That says nothing yet about whether Notebook-first would do better. Comparing groups needs
the paths and what each visitor was shown, not just the totals.

Engagement is not reading. Reaching the end of a note after thirty seconds is a better signal than
a page view, but it is not proof. Contact is not a sale. And there will always be visitors who fit
no group, so the reports keep an "unknown" group instead of forcing everyone into one.

## What happens after

> Nothing moves under a reader

I have no results yet. When there is enough real traffic, the options in order of how little they
risk:

1. Keep one concise home page, with Work and Notebook highlights both near the top.
2. Use deliberate entry links: a Work-first route for proposals, a Notebook-first route for essays.
3. Let a visitor's first real choice, opening a case study or a note, shape what is suggested next.
4. Reorder the page itself only if the evidence supports it, and never while someone is scrolling.

Every destination stays one link away for everyone. I will write the follow-up when the data says
something, including if it says the current page is fine.
