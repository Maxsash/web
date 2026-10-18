# Telemetry setup and owner reports

EU project 306242 receives production events (verified 14 October 2026; [testing.md](testing.md)).
Configuration, reports and release checks follow; contract: [telemetry.md](telemetry.md).

## Where to see reports

- [Acquisition](https://eu.posthog.com/project/306242/dashboard/1031898): source, five UTM tags and contact visits by source; owner/tester excluded.
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

No `NEXT_PUBLIC_` prefix or personal API key in the app. Development/Preview stay disabled.
Redeploy after env changes. Autocapture/heatmap toggles are inert; replay has its own gate.

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

Managed proxy stays off: current events already use a validating relay; optional replay
connects directly to EU ingestion. A proxy may reduce blocking but adds DNS/CSP setup and
Cloudflare processing. It does not enable recording. [PostHog proxy docs](https://posthog.com/docs/advanced/proxy).

## Verify a release

Check real page/section/contact actions in Live events, plus release/schema fields.
Verify privacy pause stops queued/new requests and resume rotates the ID. Local browser
checks intercept analytics; do not generate synthetic activity in the live project.
Review relay rate limits and provider quota; no client identity establishes a real person.

## Tagged public links

Use the same destination with distinct entry tags; never add owner/tester to public links:

| Placement | Query after `https://www.maxsash.com/` |
| --- | --- |
| Instagram bio | `?utm_source=instagram&utm_medium=social&utm_campaign=social&utm_content=link_in_bio` |
| WhatsApp messages | `?utm_source=whatsapp&utm_medium=messaging&utm_campaign=outreach&utm_content=message` |
| LinkedIn profile | `?utm_source=linkedin&utm_medium=social&utm_campaign=social&utm_content=profile` |

For LinkedIn Featured or posts use `utm_content=featured` or `post`. Optional `utm_term`
accepts brand/web_design/web_development/software_development. Exact supported labels live
in [acquisition.ts](../lib/telemetry/acquisition.ts); unapproved/duplicate tags become none.
Tags work in 1.4.0 after release. Reports do not backfill historical missing UTM values.
Entry attribution lasts in memory for the open page, including navigation and pause/resume;
reload/new tabs start fresh. `source` includes referrer fallback; `utm_source` means explicit tag.

## Reproduce reports

Definitions: `tools/telemetry/reports.mjs`; preview with `node tools/setup-telemetry.mjs`.
For another project, follow the environment validation in that script and use `--apply` with
an external temporary personal API key. It creates missing reports, preserving existing edits.
