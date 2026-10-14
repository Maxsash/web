# Visitor journeys and personalisation research

14 October 2026. Research and design options, not shipped behaviour.
Next: [telemetry plan](telemetry.md). Work queue: [follow-ups.md](follow-ups.md).

## The question

The owner wants a lighter, Notebook-first journey for casual exploration and a
Work-first journey for prospective clients. First collect behavioural evidence;
then decide whether different sequences help. Do not label visitors as clients
from their browser, device, orientation or local time.

## What signals actually mean

| Signal                              | Useful interpretation               | Limit                                   |
| ----------------------------------- | ----------------------------------- | --------------------------------------- |
| Viewport, orientation, pointer      | Layout and controls                 | Does not establish intent               |
| Browser and capabilities            | Compatibility and performance       | Does not establish profession or budget |
| Configured time/timezone            | Presentation context                | Not verified location or availability   |
| Preferred language                  | Language default                    | Not nationality                         |
| Reduced motion / colour scheme      | Respect presentation preferences    | Not a personal diagnosis                |
| Entry route / tagged campaign       | Interest in linked content          | A shared link can reach other audiences |
| Case-study, essay or studio actions | Observed interest during this visit | Interest is not identity                |
| Contact action                      | Possible interest in a conversation | Not proof of an enquiry or sale         |

Permission-free APIs are not automatic legal permission for tracking. Cross-visit
identification, storage, consent and disclosure need their own design. Prefer
bounded context and behavioural groups; retain an unknown group.

Browser references: [Navigator](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
[media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media),
[timezone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions),
[referrer limits](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer),
[W3C fingerprinting guidance](https://www.w3.org/TR/fingerprinting-guidance/).

## Documented implementations

Sources are vendor/implementation-partner accounts, not independent audits. Live
personalised variants and demo interactions were not reproduced. Reported lifts
are not forecasts for this site; exact audience rules are often unpublished.

| Example                                                                                                                                | Trigger and implementation                                                                                   | What changes                                                                                | What to study                                           |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [Saks](https://www.mastercard.com/global/en/news-and-trends/Insights/2025/saks-fifth-avenue.html)                                      | Dynamic Yield, first-party data and low/medium/high purchase-intent tiers; tiers can change within a session | Homepage layout, content, copy and campaigns                                                | Closest reference for different experiences by intent   |
| [Jacamo](https://www.madewithintent.ai/customer-stories/how-jacamo-increased-conversion-rate-by-6-with-multi-session-experiences)      | Made With Intent + AB Tasty; previous brand/category affinity                                                | Relevant brands and product types featured first on return                                  | Change emphasis while retaining a recognisable homepage |
| [Livestorm](https://clearbit.com/resources/books/drive-website-conversions/personalization-strategies-Livestorm-Dropbox-DocSend)       | Clearbit company industry/size + Mutiny                                                                      | Logos, copy, features, integrations; self-service/pricing less visible to large enterprises | Relevant evidence and fewer options for an audience     |
| [Dropbox DocSend](https://clearbit.com/resources/books/drive-website-conversions/personalization-strategies-Livestorm-Dropbox-DocSend) | Company size, behaviour and customer status; Clearbit, Mutiny and Salesforce                                 | Hero, proof, persona messaging and upsell experiences                                       | Different arguments for different visitors              |

These implementations use history, enrichment or known customer status. They do
not demonstrate reliable first-visit client detection from browser context alone.
Company enrichment is outside the proposed first telemetry phase.

## Demos to explore

- [Personyze SaaS](https://www.personyze.com/saas-b2b-personalization-example/):
  switch anonymous, target account, trial and customer; compare hero, proof and CTA.
- [Personyze returning visitor](https://www.personyze.com/returning-visitor-personalization-example/):
  compare first visit, abandoned cart, category interest and existing customer.

These are product demonstrations, not independent customer implementations.

## Options for this site after measurement

1. Keep a concise default: introduction, selected Work and Notebook highlights.
2. Use deliberate entry links for Work-first and Notebook-first journeys.
3. Let a natural first choice, such as exploring work or reading, guide subsequent suggestions.
4. Consider reordering only once evidence supports it; never move sections under a scrolling visitor.

Keep all destinations accessible. Evaluate groups such as work exploration,
reading, studio play and contact action, with overlap and an unknown group.
Compare actual paths and exposure before interpreting differences: the current
Work-first layout itself influences what visitors encounter.

## Blog backlog brief

Working title: **Before personalising my website, I needed to understand its visitors.**

- Start with the Notebook-first versus Work-first question.
- Explain why device and time signals cannot identify a prospective client.
- Compare the documented implementations above and their real data requirements.
- Show the measurement design, meaningful events, journey reports and blind spots.
- Once live data exists, describe findings and a tested change with honest limitations.

Use first-person research now; reserve measured results for actual evidence. No
article was drafted or published. The action lives in [follow-ups.md](follow-ups.md).
