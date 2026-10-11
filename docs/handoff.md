# Handoff — start here

Updated 11 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD be20ef1. Work is uncommitted; the owner commits and releases; only `production` deploys.

## Current work — published writing, discovery and backend evidence

- Both owner-approved essays are indexable, listed in Notebook and sitemap, with their authored
  URLs/layouts unchanged. Two Markdown drafts remain development-only.
- Screenshot-backed case studies now use their existing 1200 × 750 covers for social cards.
  Private-system cards retain the fallback sea until drawing-card artwork is made.
- GitHub commit dates group in Asia/Kolkata and display IST. Footer failures show only the
  repository link. Household Hub's headline is “Less to remember.”
- Business Operations shows an approximate six-month build; Intrusion Detection shows eight
  months. No calendar ranges were invented.
- Hero/metadata name the backend and real-time focus. The sea API rejects repeated seed and
  version parameters through shared parsing. README and security wording reflect the read-only API.
- Published Notebook articles now emit factual BlogPosting JSON-LD from their source title,
  summary, topic, author, URL and visible publication date. Drafts do not emit it.
- The local crawler harness now covers Bingbot and OAI-SearchBot metadata, schema and substantial
  initial HTML across 66 crawler/page cases.

## Owner-supplied project details now reflected

- Business Operations: clients choose and pay for modules; selected modules share private,
  business-separated data; insights adapt when data is intentionally absent; accessible workflows
  use iteration, iconography, colour and bilingual or multilingual options. Its approach informs
  Household Hub's tenant/expense insights.
- Intrusion Detection: local Raspberry Pi compute stays on the private LAN; the admin server gets
  only the alert detail needed for notifications; a separate service converts RTSP video for the
  browser, selectable cameras and webcam inputs; deployments work only on defined networks.
- System drawings and case-study prose use these facts, not invented metrics, protocols or blanket
  security claims. The intrusion plate keeps its LAN-to-notification and video-to-monitor paths
  separate instead of implying an unverified event-feed route. Moon phases are a documented visual
  follow-up, not part of either project.

## Verification

- Final isolated production verification passed on Node 24.21.0: build, lint, TypeScript, format,
  126 Node tests, 66 crawler/page cases, headers/CSP, keyboard 20/20, and 193 creative records
  with no runtime exceptions. The final Bingbot/OAI coverage changed only the crawler harness;
  its 66-case rerun plus lint, TypeScript and format passed after the full browser/test suite.
- The default build needed network access for the configured Google Fonts. The sandbox-only
  fallback failed DNS lookup; the network-enabled Node 24 build completed successfully. Localhost
  access was likewise enabled only for production-server checks.
- Focused 390 px headless captures after scroll-arrival were inspected for both updated private
  system plates. The labels, boxes and arrows are legible and unclipped.
- The local production server used for verification was stopped. No live release, social-app
  preview or physical-device check happened in this work.
- Local dependencies were restored after an incomplete `node_modules` install. Under Node 24,
  `pnpm dev` reached Next 16.3.8 and became ready on localhost before being stopped. Run
  `nvm use` before normal development; the prior Node 22 shell only produced an engine warning.

## Next

1. Owner review/commit/release; then inspect the ten published URLs and social cards, request
   indexing, and set up Bing Webmaster Tools/AI Performance.
2. Gather measurable production evidence for private systems when available; do not invent it.
3. Real phone/Safari/Firefox/screen-reader checks, Vercel rate limits, and the full backlog in
   follow-ups.md. A is the main site, B Notebook, C remains optional/unbuilt.

## Suggested commit message

```
feat: publish essays and clarify backend case studies

Publish the approved Notebook essays and expose them to discovery. Strengthen project evidence
with the owner-supplied module, privacy, local-compute and video-service architecture details.
Use IST in the commit log, reject duplicate sea API versions consistently, and add truthful
BlogPosting schema for published Notebook articles.

Verified in an isolated Node 24 production build: lint, TypeScript, format, 126 Node tests,
66 crawler/page cases, headers/CSP, 20 keyboard checks and 193 creative records.
```
