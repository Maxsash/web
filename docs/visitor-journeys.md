# Visitor journeys and personalisation research

Research and design options, not shipped behaviour. Measurement: [telemetry.md](telemetry.md); tasks: [follow-ups.md](follow-ups.md).

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

Browser references: [Navigator](https://developer.mozilla.org/en-US/docs/Web/API/Navigator), [media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media), [timezone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions), [referrer limits](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer), [fingerprinting](https://www.w3.org/TR/fingerprinting-guidance/).

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

[Personyze SaaS](https://www.personyze.com/saas-b2b-personalization-example/) switches anonymous,
target account, trial and customer. [Returning visitor](https://www.personyze.com/returning-visitor-personalization-example/)
compares first visit, abandoned cart, category interest and customer. These are vendor demos.

## Replay choice references

Company practices below are disclosures, not network audits; browser inspection was unavailable and Canva account controls require login. India legal conclusion: [replay-review.md](replay-review.md).
[Adobe location notice](https://www.adobe.com/privacy/location-specific-notice.html#how-to) distinguishes cookie-based advertising opt-out (per browser/device), customer-record sale/sharing requests, GPC for targeted ads, and other rights requests. It does not specify replay gating or say GPC stops all analytics. [Privacy Choices](https://www.adobe.com/privacy/opt-out.html) separates website, web-service, desktop and mobile controls; cookie-based choices reset when cookies are cleared.
[Adobe policy](https://www.adobe.com/privacy/policy.html) discloses replay partners; [cookie settings](https://www.adobe.com/privacy/cookies.html) offer Don't enable, Enable all and Confirm my choices, plus a footer link. No dedicated replay toggle/country matrix was established.
[Canva India policy](https://www.canva.com/en_in/policies/privacy-policy/) sections 1(d/e), 7 and 11 describe automatic activity/clickstream collection, cookie/device and account controls, and multiple European processing grounds, including legitimate interests for usage-data analytics. Its [original English](https://www.canva.com/policies/privacy-policy/) governs translation differences. Neither specifies replay start timing by country.
[Canva cookie policy](https://www.canva.com/en_in/policies/cookies-policy/) provides nonessential-cookie management and FullStory opt-out; refusal stops new collection through disabled cookies, not automatic deletion of prior data. [ICO](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-the-pecr-rules-relate-to-the-uk-gdpr/) distinguishes device-access consent from the personal-data processing ground.
Developer discussions: [GTM consent wiring](https://www.reddit.com/r/GoogleTagManager/comments/1akbdnq/consent_mode_v2_query/), [Clarity setup](https://www.reddit.com/r/Blogging/comments/1beld5u/how_to_setup_cookie_consent_for_microsoft_clarity/), [PostHog beta-testing split](https://www.reddit.com/r/gdpr/comments/1w5yd5n/what_if_analytics_is_essential_during_testing/), [rendered-data masking risks](https://www.reddit.com/r/webdev/comments/1vem1hc/why_do_people_not_freak_out_about_session_replays/). Anecdotes, not legal authority; memory-only/no-email does not establish exemption, nor does self-hosting.
[Clarity](https://learn.microsoft.com/clarity/faq/) documents EEA/UK/Swiss consent signals, not Microsoft.com's implementation. Help test is our design choice; company policies do not establish a requirement for a separate replay prompt.

## Options for this site after measurement

1. Keep a concise default: introduction, selected Work and Notebook highlights.
2. Use deliberate entry links for Work-first and Notebook-first journeys.
3. Let a natural first choice, such as exploring work or reading, guide subsequent suggestions.
4. Consider reordering only once evidence supports it; never move sections under a scrolling visitor.

Keep all destinations accessible. Evaluate groups such as work exploration,
reading, studio play and contact action, with overlap and an unknown group.
Compare actual paths and exposure before interpreting differences: the current
Work-first layout itself influences what visitors encounter.

Explicit owner/tester visit types and work/read/play interests in 1.2.0 separate declared
context from observed paths. Optional replay adds a country-policy/consent design example;
India has an expiring, sampled automatic rule and saved refusal; [telemetry.md](telemetry.md).

## Blog backlog brief

Working title: **Before personalising my website, I needed to understand its visitors.**

- Start with the Notebook-first versus Work-first question.
- Explain why device and time signals cannot identify a prospective client.
- Compare the documented implementations above and their real data requirements.
- Show the measurement design, meaningful events, journey reports and blind spots.
- Once live data exists, describe findings and a tested change with honest limitations.

Use first-person research; reserve measured results for evidence. No draft or publication. Task: [follow-ups.md](follow-ups.md).
