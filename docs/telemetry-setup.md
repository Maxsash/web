# Telemetry setup and owner reports

How analytics is configured, where its reports are, and how to check a release. EU project
306242 in Maxsash Studio is connected and receives production events (verified 14 October
2026; [testing.md](testing.md)). The contract: [telemetry.md](telemetry.md).

## Where to see reports

- [Visit context and testing](https://eu.posthog.com/project/306242/dashboard/1025313): self-declared roles, interests and recording choices.
- [Website overview](https://eu.posthog.com/project/306242/dashboard/1024506): visits, sources, section reach and contact actions.
- [Visitor journeys](https://eu.posthog.com/project/306242/dashboard/1024507): page/action paths, homepage onward and paths before email.
- [Contact journey](https://eu.posthog.com/project/306242/dashboard/1024508): work/article progression to contact intent.
- [Content and engagement](https://eu.posthog.com/project/306242/dashboard/1024509): exposure/open funnels, slugs and studio actions.
- [Experience health](https://eu.posthog.com/project/306242/dashboard/1024510): navigation outcomes/duration and technical issues.

Default window 28 days; project timezone UTC. Interpretation and limitations:
[telemetry.md](telemetry.md#how-to-interpret-the-baseline).

## Configuration

Local ignored `.env` holds the token/host; `.env.example` has placeholders. Vercel
Production has all three variables, flag true:

| Variable                | Value                                            |
| ----------------------- | ------------------------------------------------ |
| `POSTHOG_PROJECT_TOKEN` | Public project ingestion token from local `.env` |
| `POSTHOG_HOST`          | `https://eu.i.posthog.com`                       |
| `TELEMETRY_ENABLED`     | `true` enables configured production measurement |

No `NEXT_PUBLIC_` prefix. No personal API key belongs in the app or repository.
Development/Vercel Preview stay disabled. Redeploy after env changes. Autocapture and
heatmap toggles do not enable those features in our code; replay has its separate gate.

## Replay and visit labels
Production 1.2.0 and its enabled replay policy were verified on 17 October.
`REPLAY_ENABLED=true` gates replay; false/missing leaves it off after redeploy.
Project 306242 replay has 30-day retention; actual live replay ingestion remains unverified.
India’s reviewed 10% rule expires at 2027-04-30T00:00:00Z; other/unknown regions and expired
rules use voluntary testing. Footer settings offer region correction and saved refusal.
See [telemetry.md](telemetry.md#replay-and-country-policy) for precedence and data boundaries.

Use `/?studio_visit=owner` for owner QA and `/?studio_visit=tester` to invite a volunteer.
These only label visits; no URL opens a prompt or grants recording permission. Normal regional
policy and saved preferences still apply. Visitors can start testing through footer settings. Add
`&studio_intent=work`, `read` or `play` for declared interest. These are public labels,
not secrets or authentication. Filter owner/tester visits out of audience reports.
The sixth dashboard has three validated queries for the 1.2.0 labels.

Managed proxy stays off: current events already use a validating relay; optional replay
connects directly to EU ingestion. A proxy may reduce blocking but adds DNS/CSP setup and
Cloudflare processing. It does not enable recording. [PostHog proxy docs](https://posthog.com/docs/advanced/proxy).

## Verify a release

Visit home → Work → case study; home → Notebook → article; studio → preset/setting.
Inspect PostHog Live events for page_view, section_view and the relevant actions.
Confirm the new site_release and schema_version 1; then check the reports above.
Do not send an email/WhatsApp message solely for QA; contact activation is sufficient.

Pause at `/privacy`: new requests stop and queued events drop. Resume/new tab/reload
starts a new ID. Reload forgets the pause. Ordinary Next navigation preserves the
current ID. No analytics cookies, saved visitor IDs or profile processing.
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

Keep that key outside source and chat, and revoke it afterward. The command creates
missing reports without overwriting the owner's edits.
