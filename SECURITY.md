# Security

Report a vulnerability by email to yash@maxsash.com. Please do not open a public
issue for it. Machine-readable contact details are at
[/.well-known/security.txt](https://www.maxsash.com/.well-known/security.txt).

The production site serves authored content and a read-only sea API. It has no accounts,
database or cookies. Public inputs are a sea seed (eight hexadecimal characters) and a
model version, validated before use. The optional GitHub token is used only on the server.

The local post editor writes Markdown files only in development. Its routes are excluded
from production builds, and write requests require same-origin JSON from localhost.
