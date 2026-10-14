# Website telemetry and reporting

15 October 2026. Owner chose **no persistent visitor tracking**, accepting limited
journeys. Measure behaviour before segmentation or Work/Notebook reordering.
Setup/report access: [telemetry-setup.md](telemetry-setup.md).
Research/blog: [visitor-journeys.md](visitor-journeys.md).

## Current integration

Explicit events go to first-party `/api/telemetry`, then PostHog Cloud EU. The
public project token and host live under server-only names in ignored `.env`. No browser SDK, autocapture, replay, cookies, analytics
local storage/session storage, person profiles or company enrichment.

A random visit ID lives only in memory. Ordinary Next navigation can continue the
journey; reload, new tab or closing the page loses it. It also rotates after 30
minutes without a recorded event or 24 hours. Pausing at `/privacy` stops capture,
drops queued events and aborts pending requests; resuming starts a new ID. The
pause choice is also memory-only and resets on reload. No across-visit identity.

Production requires explicit configuration; development and Vercel previews are
excluded. Production 1.1.0 ingestion was verified on 14 October: schema-1
page_view and section_view events arrived redacted. One schema-0 installation
event predates it and is excluded from reports. PostHog’s own starter dashboard,
**Analytics basics (wizard)**, remains in the project and is not ours.

## Where reports live

Five pinned Maxsash dashboards (1024506–1024510) contain 21 charts in EU project
306242 and read live events. Links are in telemetry-setup.md. Definitions in `tools/telemetry/reports.mjs` remain the
reproducible source; tools/setup-telemetry.mjs can provision another project.
No approved Data Catalog metrics exist; these operational definitions are not governed.

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

Google/Bing Search Console describe search discovery. Vercel runtime logs describe
server requests/failures; Speed Insights describes field performance if enabled.
Those account views have not been inspected and cannot reconstruct historic clicks.

## Version 1 event contract

Common fields: occurrence timestamp, normalised route/group, schema version, server
site release and ephemeral ID. Context is coarse browser family, pointer type and
viewport bucket. No exact device model, hardware, timezone or local-time profiling.

| Event               | Meaning                                                                                                | Extra fields                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `page_view`         | Once per displayed route navigation, including Back/Forward; also first event of a new in-memory visit | Fixed source/campaign category                        |
| `section_view`      | Home section intersects viewport continuously for 1 s while tab visible; once per route visit          | Hero, Work, About, Contact, Notebook, shore           |
| `content_open`      | Deliberate known work/article link activation, separate from arrival                                   | Kind, published slug, fixed placement                 |
| `content_engaged`   | End marker reached and at least 30 foreground seconds; once per route visit                            | Kind and slug                                         |
| `contact_action`    | Email/WhatsApp activation or successful address copy                                                   | Channel, action, placement                            |
| `studio_action`     | Preset/randomisation, settled slider, successful copy, save/print/sail activation                      | Action and setting name; no seed/value stream         |
| `navigation_result` | Known internal navigation completion, 10 s timeout or late arrival                                     | Target, outcome, duration bucket, repeated activation |
| `experience_issue`  | Known error/not-found, static fallback or context loss                                                 | Allowlisted issue code                                |

A reading threshold does not prove reading. Contact clicks/copies do not prove
messages were sent; save/print activations do not prove external completion.
Navigation timeout means no arrival observed within 10 s, not a proven request
failure. Page leave/unload is not a dependable dwell measure. Unknown URLs collapse
to `/unknown`; global layout failures can prevent telemetry from starting at all.

## Data boundaries

Known route slugs derive from existing project/published-post catalogs. The server
rebuilds allowlisted fields; arbitrary keys, DOM text, typed/clipboard/contact
contents, raw user-agent, URL queries/hashes/seeds and visitor IP are not forwarded.
Referrers become fixed source categories; campaign codes are explicitly allowlisted.
Unknown source/campaign remains unknown/none. No continuous mouse/scroll/frame or
slider stream. Batches have at most 20 events and 16 KB; provider timeout is 3 s.
CSP remains same-origin; outbound server hosts are limited to EU/US ingestion.

PostHog stores captured events in EU Cloud. Its current plan-based query history
is one year on free plans and seven years on paid plans; this is not automatic
deletion and cannot be shortened to 90 days. The privacy page discloses the policy
without claiming the project’s unverified billing tier. Memory-only identity does
not mean events are never stored. Billing quota/alerts remain owner review.
No universal consent/legal exemption is claimed for this setup.
No cookieless hash/fingerprint option is used. Owner exports/keys stay outside git.

## How to interpret the baseline

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

Fresh chosen-mode coverage is recorded in [testing.md](testing.md); setup, actual
dashboards and synthetic query visibility verified; production ingestion remains pending.
Official references: [PostHog capture](https://posthog.com/docs/api/capture),
[sessions](https://posthog.com/docs/data/sessions),
[paths](https://posthog.com/docs/product-analytics/paths),
[insights](https://posthog.com/docs/product-analytics/insights),
[dashboard API](https://posthog.com/docs/api/dashboards),
[Plausible journeys](https://plausible.io/docs/user-journeys) (researched alternative),
[Vercel Speed Insights](https://vercel.com/docs/speed-insights).
