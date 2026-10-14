# Telemetry setup and owner reports

15 October 2026. EU project 306242 in Maxsash Studio is connected. All five pinned
reports below exist, with 21 saved charts. Production 1.1.0
ingestion verified 14 October 19:07 UTC (page_view and section_view, schema 1);
the schema-0 installation test is excluded from reports. Design: [telemetry.md](telemetry.md).

## Where to see reports

- [Website overview](https://eu.posthog.com/project/306242/dashboard/1024506): visits, sources, section reach and contact actions.
- [Visitor journeys](https://eu.posthog.com/project/306242/dashboard/1024507): page/action paths, homepage onward and paths before email.
- [Contact journey](https://eu.posthog.com/project/306242/dashboard/1024508): work/article progression to contact intent.
- [Content and engagement](https://eu.posthog.com/project/306242/dashboard/1024509): exposure/open funnels, slugs and studio actions.
- [Experience health](https://eu.posthog.com/project/306242/dashboard/1024510): navigation outcomes/duration and technical issues.

Default window 28 days. Counts are recorded memory-only visits, not people. Reloads
and new tabs split journeys. Funnels use ordered session steps within 24 hours;
paths show up to 12 steps. Contact actions are not confirmed enquiries. Project
timezone is UTC; owner may change it to Asia/Kolkata in project settings.

## Configuration

Local ignored `.env` holds the token/host; `.env.example` has placeholders. Vercel
Production has all three variables, flag true:

| Variable                | Value                                            |
| ----------------------- | ------------------------------------------------ |
| `POSTHOG_PROJECT_TOKEN` | Public project ingestion token from local `.env` |
| `POSTHOG_HOST`          | `https://eu.i.posthog.com`                       |
| `TELEMETRY_ENABLED`     | `true` enables configured production measurement |

No `NEXT_PUBLIC_` prefix. No personal API key belongs in the app or repository.
Development/Vercel Preview stay disabled. Redeploy after env changes. Skip
PostHog’s browser SDK, autocapture and replay onboarding: no SDK ships. The
project’s own replay/autocapture/heatmap toggles are on but inert; changing
project settings is the owner’s call.

Privacy discloses EU hosting and PostHog’s current [retention policy](https://posthog.com/docs/data/events-retention):
one-year query history on free plans, seven years on paid plans. This is not a
promise of automatic deletion. A 90-day retention setting is not available.
Account billing tier/quota, alerts and any additional access controls remain owner
review; no billing or project settings were changed by the agent.

## Verify a release

Visit home → Work → case study; home → Notebook → article; studio → preset/setting.
Inspect PostHog Live events for page_view, section_view and the relevant actions.
Confirm the new site_release and schema_version 1; then check the reports above.
Do not send an email/WhatsApp message solely for QA; contact activation is sufficient.

Pause at `/privacy`: new requests stop and queued events drop. Resume/new tab/reload
starts a new ID. Reload forgets the pause. Ordinary Next navigation preserves the
current ID. No analytics cookies or browser storage, profile processing or replay.
Events omit raw URL queries/hashes, contact/input/clipboard contents and visitor IP.

Use a separate QA project for extended tests. Local browser checks intercept/block requests.
The relay cannot distinguish real people from scripted same-origin-shaped requests;
review Vercel rate limits and provider quota for the collection endpoint.

## Reproduce reports in another project

Definitions: `tools/telemetry/reports.mjs`; preview with `node tools/setup-telemetry.mjs`.
For another project, locally export a temporary `POSTHOG_PERSONAL_API_KEY` with dashboard/insight
read/write scopes, then run:

```sh
POSTHOG_APP_HOST=https://eu.posthog.com POSTHOG_PROJECT_ID=YOUR_NUMERIC_PROJECT_ID node tools/setup-telemetry.mjs --apply
```

Keep that key outside source/chat and revoke it afterward. The command creates
missing reports without overwriting existing owner edits. Current project is already
provisioned; no need to run it again. Verification: [testing.md](testing.md).
