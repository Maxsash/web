# India automatic replay assessment

Reviewed 17 October 2026 for Maxsash Studio's public, adult-facing portfolio.
Business boundary: [decisions.md](decisions.md#business-audience-and-public-site-boundary).
Implementation contract: [telemetry.md](telemetry.md#replay-and-country-policy).

## Recommendation

Proceed with an India-only, non-sensitive automatic replay pilot without an arrival
consent popup, with the safeguards below. This is a bounded product
recommendation from the sources, not an official approval of this recorder or a court ruling.
The research supports an opt-out model now; a country code alone does not establish lawfulness.
The owner approved implementation on 17 October; the code includes India’s expiring rule.

The previous assessment overextended Rule 5(7)'s pre-collection refusal language without
considering the government's SPDI clarification. It is not established as a blanket prior
choice requirement for ordinary, non-sensitive portfolio interactions. The opt-out is a
transparency/control safeguard, not a substitute for consent wherever consent is required.

## Evidence and its authority

| Source | Finding | Limit |
| --- | --- | --- |
| [SPDI Rules, Rules 2–7](https://www.wipo.int/wipolex/en/text/494931) | Rule 3 lists sensitive categories; Rule 5(1) requires consent before collecting SPDI; Rule 4 provides for a published privacy policy. | Rule 5(7) and Rule 7 contain broader-looking wording when read in isolation. |
| [Official government clarification, 24 August 2011](https://www.pib.gov.in/newsite/erelcontent.aspx?lang=2&reg=48&relid=74990) | Says the rules concern SPDI and defines information providers as natural persons providing SPDI. Supports reading the collection/refusal provisions in that context. | Administrative clarification, not a repeal or binding judicial interpretation of every ambiguous phrase. We are not relying on its outsourcing-processor exception. |
| [CMS India legal guide, section 14](https://cms.law/en/int/expert-guides/cms-expert-guide-to-data-protection-and-cyber-security-laws/india) | No standalone cookie/adtech law; current cookie rules concern SPDI; India does not mandate cookie banners as such. Sections 8–9 describe transfer conditions for SPDI. | Expert interpretation; no approval of session replay, nor exemption after DPDP commencement. |
| [AZB legal analysis, question 24](https://www.azbpartners.com/bank/qa-on-data-protection-and-cybersecurity/) | No specific IT Act restriction on monitoring/profiling/tracking technologies; typically governed by website conditions. | Older analysis; corroborates the IT/SPDI position, not the later DPDP regime. |
| [FPF/ABLI transfer comparison, India row](https://fpf.org/wp-content/uploads/2020/10/Asia_Comparative-Table-of-Laws-and-Regulations-on-Cross-Border-Personal-Data-Flows-in-Asia_.pdf) | Distinguishes restricted sensitive-data transfers from free non-sensitive transfers under the IT/SPDI framework. | Research interpretation from 2020; sector-specific duties can override it. |
| [DPDP commencement notification](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf) | Main notice, consent and fiduciary duties commence eighteen months after publication, in May 2027. | Recheck for amendments before release; current assessment is not a permanent exemption. |

## Application to this recorder

Public page structure, clicks, scrolls, known routes, coarse device context and temporary
session IDs are not the passwords, financial details, health information, sexual orientation,
medical records or authentication biometrics listed by Rule 3. This supports the current
non-SPDI interpretation; it does not establish that all of the data is anonymous.

Reviewed `components/telemetry/replay-recorder.ts`, `replay.ts`, `ReplayControls.tsx`,
`lib/telemetry/replay-redaction.ts` and `app/privacy/page.tsx`. The recorder masks inputs,
blocks contact links/canvases/scripts/iframes, strips URL queries/fragments, disables network
bodies/headers and console capture, uses memory IDs and disables profiles and GeoIP.
PostHog's network infrastructure still sees connection IPs; this is disclosed, not anonymised
away by configuration. No account, checkout, personal-data form or sensitive page is planned.

The conclusion fails if a later feature introduces sensitive information, visitor-specific
rendered content or sensitive inferences. Raise that boundary change before implementation.
Masking inputs alone would be insufficient for such a site.

Rule 7's wording is a residual interpretive uncertainty, but the government clarification,
CMS's current guidance and the transfer comparison support applying its restrictions to
SPDI. EU hosting is not, by itself, a reason ordinary non-SPDI replay needs prior permission.
Provider terms, safeguards and accurate disclosure still matter. [PostHog DPA](https://posthog.com/dpa)
assigns responsibility for necessary authorisations/consents to the customer; its published
page is not itself a countersigned agreement. Do not claim an executed DPA without checking.

## Documented practice

These are published practices, not network audits or legal precedents:

- [ProTherapy, sections 3.6, 11 and 16](https://protherapy.in/privacy): Clarity replay on its
  public marketing homepage, masking the enquiry form; excludes booking/client/clinical
  pages and discloses processing outside India. Supports separating public UX from private data.
- [MathuraNow](https://mathuranow.in/privacy-policy/): published policy describes Clarity
  recordings, masking, overseas processing and opt-out via browser controls/contact.
  Its text was available in search; direct page retrieval failed. Not proof of a live consent flow.
- [Zoho PageSense](https://www.zoho.com/pagesense/cookie-policy.html) documents opt-in/opt-out
  recording controls and recommends visitor choice. A product capability, not an India exemption.
- Canva/Adobe disclosures and developer discussions: [visitor-journeys.md](visitor-journeys.md#replay-choice-references).
  Their absence of a popup on one visit does not establish what was recorded or why.

No Indian judgment or regulator decision specifically approving footer-only session replay
was found in the searches. The recommendation rests on data classification and current
rules, not on claiming that others' practice establishes legality. Reddit does not close
that legal question; implementation anecdotes can help wire and test controls.

## Implemented safeguards and release checks

1. Clear public disclosure: replay purpose, content/actions captured, masking limits,
   PostHog EU processing, connection IP exposure, 30-day retention and studio contact.
   Footer entry should say Privacy & recordings; a visitor should not need to infer replay
   from a generic advertising or cookie notice. No click-through agreement is proposed.
2. Persistent, identifier-free recording opt-out, checked before recorder import/start and
   every upload; apply across reloads/tabs and honour DNT/GPC. Stop saves refusal.
   Saving refusal is not tracking identity; storage failure disables automatic replay.
3. Keep the public-site/data exclusions above; no ad use, cross-site identity or sensitive
   profiling. Retain existing visible recording status/Stop; no unsolicited modal on arrival.
4. Start with 10% of eligible India visits; sampling limits collection, not legal obligations.
   Unknown/other countries remain voluntary. This is the approved operating setting, not a
   measured optimal sample or an approval of US/UK/EU automatic replay. A visitor may correct
   detected location in footer settings; only bounded policy regions are accepted.
5. Expire the India rule at `2027-04-30T00:00:00Z`, ahead of the May transition; review retained
   recordings and provider terms before release. Verify a real production recording only
   after the owner's release, without claiming mocked ingestion proves provider receipt.

## May transition

Do not carry this opt-out rationale into May 2027 unchanged. The broader
[DPDP Act](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf)
covers identifiable digital personal data, not just the old sensitive categories. There is
no general GDPR-style legitimate-interest basis to copy from Canva. The recommended
fallback is voluntary replay with affirmative Start, consent evidence and withdrawal/deletion
handling. Research/statistics under section 17(2)(b) and
[Rule 16/Second Schedule](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)
is a conditional alternative to assess, not an approved blanket analytics exemption.
