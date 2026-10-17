# Security

Report a vulnerability by email to yash@maxsash.com. Please do not open a public
issue for it. Machine-readable contact details are at
[/.well-known/security.txt](https://www.maxsash.com/.well-known/security.txt).

The production site serves authored content and a read-only sea API. It has no accounts,
database or cookies. Public inputs are a sea seed (eight hexadecimal characters) and a
model version, validated before use, and, when analytics is configured, event batches
posted to `/api/telemetry`: same-origin JSON only, bounded in size and count, with every
field rebuilt from an allowlist before it is relayed. Only the public project ingestion token reaches the optional browser recorder; personal API
keys remain outside the app. Replay captures public page interactions under the country/
voluntary policy, with masked inputs and explicit stop controls; URL labels are not
authentication. The policy endpoint returns no visitor IP or precise location.

The local post editor writes Markdown files only in development. Its routes are excluded
from production builds, and write requests require same-origin JSON from localhost.
