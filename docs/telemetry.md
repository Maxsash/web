# Website telemetry and reporting plan

14 October 2026. Owner direction: measure behaviour before segmentation or
personalisation. This is a concrete setup plan; tracking is not installed.
Research: [visitor journeys](visitor-journeys.md). Queue: [follow-ups.md](follow-ups.md).

## Current evidence and recommendation

Owner knows of Vercel and Google/Bing Search Console, but no other analytics account.
Source has no analytics dependency or integration in the root layout. Production
CSP currently permits only same-origin scripts/connections. Dashboard enablement,
existing traffic data, billing and account access have not been checked.

Use **PostHog Cloud** as the recommended reporting workspace for explicit events,
paths, funnels and behavioural cohorts. Start with replay and broad autocapture
OFF. Account, region, collection/identity mode and cost limits remain to be chosen.
Use one behaviour provider, not parallel trackers. Keep a provider-neutral event
contract so the measurement design survives a provider change.

Alternative: **Plausible Business** for a simpler aggregate dashboard, events,
journeys and funnels. Its Explore journey report supports forward/backward paths
and filters; do not mistake aggregate journeys for per-person timelines.

[Vercel Speed Insights](https://vercel.com/docs/speed-insights) serves performance;
Vercel runtime logs serve server failures. Search Console serves search discovery.
These complement behaviour analytics and do not substitute for on-site journeys.
Existing logs cannot reconstruct historic clicks or section exposure.

## Where the owner looks

| Workspace / saved report                                     | What to see                                                                                                                 | Question it answers                       |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| PostHog: dashboard **Website overview**                      | Observed sessions, entry routes, source/campaign, section reach, content opens, contact actions; counts and rates           | What is happening overall?                |
| Product Analytics: saved **Visitor journeys** Paths insights | Home and direct-entry paths, mixed page/section/action events, exits and loops; reverse exploration toward contact          | What do visitors actually do next?        |
| Saved **Contact journey** funnels                            | Section reach → case study → contact action; article → Work → contact; direct contact separately                            | Where does interest stop progressing?     |
| Dashboard **Content and engagement**                         | Work/Notebook exposure-to-open rates, article engagement, studio-to-save/copy/print paths                                   | Which material earns attention when seen? |
| Dashboard **Experience health**                              | Navigation duration/failure, route errors, fallback/context loss, mobile/browser breakdown; link to Vercel performance/logs | Could friction explain a drop-off?        |

Paths discover sequences; funnels test predefined sequences. Their counts need not
match. Explicitly use session-bounded funnels for this phase, with a documented
window, and count observed sessions rather than claiming unique people. If the
provider cannot enforce same-session behaviour in the UI, use a saved session-keyed
query; do not silently accept a multi-day user-based default.

Optional later: an anonymised session event timeline to investigate a reported
incident. Session replay is a separate, more intrusive capability; it is not
required for the first dashboards and is not a video of the WebGL sea.

## Event contract for phase one

Send an event only when its semantic condition occurs. Event names below are a
proposed schema, not existing implementation. Include schema version, site release,
normalised route, route group and occurrence time. Use a per-visit random identifier
only in the approved identity mode. Provider receive time is separate.

| Event               | Exact meaning                                                                                                          | Allowed extra properties                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `page_view`         | Route successfully displayed, once per navigation including Back/Forward                                               | Known route/content slug, entry source on initial visit                  |
| `section_view`      | Home section visibly intersecting viewport for 1 continuous second while tab visible; once per section per route visit | `hero`, `work`, `about`, `contact`, `notebook`, `shore`                  |
| `content_open`      | Deliberate case-study or article link activation; kept distinct from arrival                                           | Content kind/slug, fixed placement enum                                  |
| `content_engaged`   | Article/case-study end marker reached AND at least 30 s accumulated foreground engagement; once per route visit        | Content kind/slug; threshold version                                     |
| `contact_action`    | Email/WhatsApp activation or successful address copy                                                                   | Channel, action, fixed placement enum                                    |
| `studio_action`     | Settled preset/setting change, copy success, SVG activation, print-page open or sail activation                        | Action enum, setting name; no seed/value stream                          |
| `navigation_result` | Deliberate internal navigation completed or timed out after 10 s                                                       | Known target route, outcome, duration bucket, repeated-activation bucket |
| `experience_issue`  | Known route error, static fallback or WebGL context-loss condition                                                     | Allowlisted issue code, route group                                      |

The engagement threshold is a proxy, not proof of reading. A section exposure uses
viewport intersection, not percentage of a very tall section. Navigation timeout
means no arrival observed within the threshold, not a proven failed request; record
late completion separately if it arrives. Do not infer dwell from an unload event.

No continuous scroll, pointer positions, frame-by-frame shader state, slider input
stream, DOM text, contact values or clipboard contents. Sound/theme engagement can
be added later if a named report needs it; not required to answer section order.

## Safe dimensions and acquisition

- Route group: home, work, notebook, studio, print, error. Allowlist known slugs;
  collapse unknown paths to error/unknown so user-supplied URL text is not collected.
- Device class, coarse browser family and viewport bucket for compatibility comparisons.
  Skip precise hardware, timezone, local time and orientation unless a report needs them.
- Referrer hostname only; never the full external URL. Keep missing source as unknown.
- Allowlisted, bounded campaign codes assigned by us. Strip every other query/hash,
  including sea seeds, before the SDK sees the URL; scrub automatically attached fields too.
- Do not transmit full outgoing URLs: email and WhatsApp URLs contain contact values.
- Exclude development, previews, automated checks and owner QA via explicit opt-out;
  report available bot filtering without claiming it detects every bot.

Tagged links distinguish editorial, portfolio, social and outreach sources; they
are not proof of visitor role. Use consistent campaign naming, not recipient names.

## Collection and identity decision

Browser access without a prompt does not establish permission to store, identify
or replay visitors. Resolve deployment requirements before sending real traffic;
no claim that either provider configuration is automatically lawful everywhere.

Proposed first phase: aggregate/session behaviour, no names, emails, account
identification, company enrichment, persistent marketing profile or cross-device
stitching. Decide whether session continuity across page reloads/tabs is necessary:
random visit IDs and their storage mechanism must be documented and validated.
In-memory IDs lose continuity on reload; do not present them as complete journeys.

PostHog offers a [cookieless mode](https://posthog.com/tutorials/cookieless-tracking)
that derives a server-side hash. It is not equivalent to collecting no identity
signals; verify its retention and session semantics before choosing it. If using
consent-based persistent analytics, start only after the applicable choice and
support withdrawal. Replay stays off independently.

Proposed raw-event retention: 90 days, review before activation; restrict account
access, support deletion, and keep exports outside this public repository. Confirm
provider controls/plan support instead of assuming this retention is available.
Never add private account identifiers or management keys to source/docs.

## How to read the reports well

1. Weekly: review last 7 and 28 days with counts, denominators and release annotations.
2. Start with entry route/source, then inspect actual paths rather than only a preferred funnel.
3. Compare Work and Notebook opens per qualified exposure, not raw click totals.
4. Investigate mobile friction before attributing low contact activity to intent.
5. Inspect contact actions by their preceding content. An email click or copy is not
   a sent message; downloads/printing likewise record intent, not completed external actions.
6. Keep small cohorts descriptive. More weeks alone do not establish adequate evidence;
   show sample sizes/uncertainty and define a useful effect before an experiment.

Observed traffic is incomplete: blockers, consent choices, disabled JS, bots,
background tabs and multiple devices affect measurement. Exits mean no next observed
step. Zero events may mean broken collection, not zero visitors. SDK health and
synthetic QA are separate from real visitor reports.

## Segmentation after baseline

Use overlapping behavioural groups first: work exploration, reading engagement,
studio play, contact action, mixed and unknown. Define rules from observed paths
and version them. Do not call these customers/recruiters/clients without explicit
evidence. Do not use the contact event both to define a cohort and then claim that
cohort predicts contact. Validate predictions on later visits/time periods.

The existing homepage order biases exposure. Data can inform a hypothesis; a
controlled Work-first versus Notebook-first experiment is needed for causal claims.
Keep alternative content accessible and do not reorder beneath a scrolling visitor.

## Setup sequence and acceptance

1. Inspect actual Vercel/Search Console reports with the owner; preserve existing tools.
2. Create/select provider project; choose region, privacy/identity mode, retention,
   dashboard timezone (IST), quotas and billing limits. Account setup is still pending.
3. Implement schema/redaction as pure modules, provider adapter separately, and small
   lifecycle/action hooks; read installed Next guides first. Permit only required CSP hosts.
4. Build the five saved reports with explicit definitions and session boundaries.
5. Validate isolated production build on Node 24: exact events for home → Work →
   case study → contact, home → Notebook → article → home, studio → copy/save/print,
   and direct entries. Cover keyboard, touch, Back/Forward, modified/new-tab clicks,
   deduplication, blocked provider, opt-out/withdrawal and sensitive URL scrubbing.
6. Verify ingestion and reports in a separate QA project, then smoke-test a real device;
   measure SDK network/bundle/interaction cost against baseline. Run repository checks.
7. Owner releases through production; verify ingestion/health and begin baseline.

No tracker, account, dashboard, privacy page or segmentation has been created yet.
This docs-only change does not bump the site version; integration will be a feature.

## Official product references

- [PostHog paths](https://posthog.com/docs/product-analytics/paths) and
  [insights](https://posthog.com/docs/product-analytics/insights).
- [PostHog sessions](https://posthog.com/docs/data/sessions) and
  [replay](https://posthog.com/docs/session-replay).
- [Plausible journeys](https://plausible.io/docs/user-journeys): Business plan;
  Explore supports forward/backward paths, filters and up to 20 steps.
- [Plausible event measurements](https://plausible.io/docs/script-extensions).
- [Vercel analytics privacy](https://vercel.com/docs/analytics/privacy-policy).
