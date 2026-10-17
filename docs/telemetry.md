# Website telemetry and reporting

The analytics contract. Why: [decisions.md](decisions.md) ("Visitor analytics"). Setup: [telemetry-setup.md](telemetry-setup.md). Research: [visitor-journeys.md](visitor-journeys.md).

## Current integration

Explicit events go to first-party `/api/telemetry`, then PostHog Cloud EU. The
public project token and host live under server-only names in ignored `.env`. No autocapture, cookies, saved analytics identity, person profiles or company
enrichment. An optional browser SDK supplies replay only after the policy below permits it.

A random visit ID lives only in memory. Ordinary Next navigation can continue the
journey; reload, new tab or closing the page loses it. It also rotates after 30
minutes without a recorded event or 24 hours. Pausing at `/privacy` stops capture,
drops queued events and aborts pending requests; resuming starts a new ID. The
pause choice is also memory-only and resets on reload. Events already received cannot be
retracted. No across-visit identity.

Production requires explicit configuration; development and Vercel previews are
excluded. One schema-0 installation event predates 1.1.0 and is excluded from reports.
PostHog’s starter **Analytics basics (wizard)** dashboard is separate.

## Where reports live

Six dashboards with 24 charts: [telemetry-setup.md](telemetry-setup.md). Definitions live in
`tools/telemetry/reports.mjs`; `tools/setup-telemetry.mjs` provisions them. Visit context and
testing separates declared roles/interests and replay choices. These are operational
definitions; current connector scopes do not allow verifying Data Catalog governance.

| Dashboard              | What it answers                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| Website overview       | Observed visits, acquisition categories, section reach, contact actions and first observed routes           |
| Visitor journeys       | Actual page/section/action transitions, homepage onward and paths before email contact                      |
| Contact journey        | Work exposure → case-study arrival → contact; engaged article → Work → contact; homepage contact separately |
| Content and engagement | Exposure-to-open funnels, content opened/engaged by slug and studio actions                                 |
| Experience health      | Navigation duration/outcomes and issues by browser/viewport; investigate Vercel performance/logs separately |

Queries count visits, not people. Funnels explicitly aggregate by `$session_id`,
with ordered steps and a maximum 24-hour window. Paths use meaningful labels and
up to 12 steps. The default reporting window is 28 days. Journey and funnel counts
can differ: transitions, visits and ordered completion are different measures.

## Version 1 event contract

Common fields: occurrence timestamp, normalised route/group, schema version, server
site release and ephemeral ID (UUID7; existing UUID4 payloads remain accepted). Context is
coarse browser family, pointer type, viewport bucket and fixed self-declared visit labels.
`studio_visit=owner|tester|visitor` and `studio_intent=work|read|play|unknown` set memory-only
`visit_role`/`declared_intent`; missing parameters preserve context, duplicates/invalid values
reset their field. Consumed labels leave the address bar; other query parameters stay.
Labels grant neither identity nor recording permission. Changing context starts a new visit.

| Event               | Meaning                                                                                                | Extra fields                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `page_view`         | Once per displayed route navigation, including Back/Forward; also first event of a new in-memory visit | Fixed source/campaign category                        |
| `section_view`      | Home section intersects viewport continuously for 1 s while tab visible; once per route visit          | Hero, Work, About, Contact, Notebook, shore           |
| `content_open`      | Deliberate known work/article link activation, separate from arrival                                   | Kind, published slug, fixed placement                 |
| `content_engaged`   | End marker reached and at least 30 foreground seconds; once per route visit                            | Kind and slug                                         |
| `contact_action`    | Email/WhatsApp activation or successful address copy                                                   | Channel, action, placement                            |
| `studio_action`     | Preset/randomisation, settled slider, successful copy, save/print/sail activation                      | Action and setting name; no seed/value stream         |
| `navigation_result` | Known internal navigation completion, 10 s timeout or late arrival                                     | Target, outcome, duration bucket, repeated activation |
| `replay_choice`     | Explicit start/stop or automatic start; a start means the browser recorder started, not confirmed ingestion | Action and voluntary/automatic reason                 |
| `experience_issue`  | Known error/not-found, static fallback or context loss                                                 | Allowlisted issue code                                |

Engagement does not prove reading; contact/save/print actions do not prove completion.
Navigation timeout means no arrival observed within 10 s; unknown paths become `/unknown`.

## Data boundaries

Known route slugs derive from existing project/published-post catalogs. The server
rebuilds allowlisted fields; arbitrary keys, DOM text, typed/clipboard/contact
contents, raw user-agent, URL queries/hashes/seeds and visitor IP are not forwarded.
Referrers become fixed source categories; campaign codes are explicitly allowlisted.
Unknown source/campaign remains unknown/none. No continuous mouse/scroll/frame or
slider stream in the event relay. Batches have at most 20 events and 16 KB; timeout is 3 s.
Server hosts are limited to EU/US ingestion. Replay browser connections allow EU ingestion.

Events are stored in EU Cloud with plan-based query history (one year free, seven paid),
not promised automatic deletion. Billing tier/quota remain owner review. No universal
consent exemption, fingerprints or private exports/keys. [Retention policy](https://posthog.com/docs/data/events-retention).

## Replay and country policy

`REPLAY_ENABLED=true` separately gates replay. The no-store endpoint trusts the Vercel
country header only on Vercel; local/unknown detection is voluntary. An explicit region
correction takes precedence, is validated against coarse policy regions and is not sent to
analytics. It is self-declared location, not authentication. The footer links to `/privacy`.
India samples 10% until `2027-04-30T00:00:00Z`; expiry switches to voluntary, including open
pages. Other/unknown regions are voluntary. Rationale: [India review](replay-review.md).
`studio-privacy` stores only version, region (`auto|IN|GB|EU|US|other`) and automatic-choice
boolean. No identifier. Changes stop capture before policy refresh; storage events synchronize
tabs. Unavailable storage disables automatic replay. Stop saves refusal; DNT/GPC override all.
Only the visitor’s privacy-page test action opens the explanation; no arrival or URL prompt.
Start grants one visit of voluntary replay without changing saved refusal;
permission/labels reset on reload.
Pausing analytics also stops replay. Already transmitted data cannot be recalled.
Replay uses memory IDs, no person profiles or automatic analytics. It records public DOM,
clicks and scrolling; masks inputs/contact links, drops URL queries/fragments and unknown
paths, excludes canvases/scripts/iframes, console/plugin events and network bodies.
The local SDK connects directly to EU services, exposing connection IP to infrastructure;
IP recording/GeoIP are disabled. Replay retention is 30 days. It cannot show sea smoothness.

## How to interpret the baseline

- Exclude self-declared owner/tester visits with `visit_role`; anyone can copy these labels.
- Review 7/28-day counts, denominators and release annotations; small samples stay descriptive.
- Explore paths first, then validate hypotheses with funnels. Compare content opens per exposure.
- Check mobile friction before calling lower contact activity low intent.
- Reloads, new tabs, pausing, blockers, bots and disabled JS split or hide journeys.
  A missing next event is not proof the person left. Zero may mean broken collection.
- Do not count unique people, returning visitors or cross-device journeys. Memory-only
  analytics cannot support those claims. Ignore owner QA outside explicit verification.
- Behavioural groups can overlap: work exploration, reading, studio play, contact,
  mixed and unknown. They are not verified client/recruiter/customer identities.
- Current order biases exposure; a later controlled Work-first/Notebook-first test
  is required for causal claims. Keep destinations accessible; no mid-scroll reordering.

## Verification and references

Checks and live ingestion: [testing.md](testing.md). References:
[PostHog capture](https://posthog.com/docs/api/capture), [sessions](https://posthog.com/docs/data/sessions), [paths](https://posthog.com/docs/product-analytics/paths), [insights](https://posthog.com/docs/product-analytics/insights), [dashboards](https://posthog.com/docs/api/dashboards), [Plausible journeys](https://plausible.io/docs/user-journeys), [Vercel Speed Insights](https://vercel.com/docs/speed-insights).
