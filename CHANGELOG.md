# Changelog

Every version of the site, newest first. Versions follow
[Semantic Versioning](https://semver.org/); the rules are in [AGENTS.md](AGENTS.md#versioning).

## 1.4.2 — 2026-10-19

### Fixed

- Search titles and descriptions fit Bing's limits: case-study titles drop the studio suffix,
  and the home page and three case studies get descriptions under 160 characters. Page text
  is unchanged.

## 1.4.1 — 2026-10-19

### Performance

- Links to the Notebook, its notes and the case studies load those pages in the background as
  they scroll into view, so a tap opens them at once. Home and the sea studio still load on
  demand, keeping their sea engine off the network until a visitor heads there.

## 1.4.0 — 2026-10-17

### Added

- Privacy-bounded UTM attribution for source, medium, campaign, content and term. Entry tags
  persist in memory across navigation, visit-label changes and analytics pause/resume, and
  accompany events and recordings. Audience acquisition reports exclude owner/tester visits.

## 1.3.0 — 2026-10-17

### Changed

- The "Open water" palette replaces "Admiralty chart": day-sea blue panels and icons with
  sail-cream type, deep-sea ink, a sun-gold _Math._ and the cutter's pennant red as the accent.
  Night stays dark, tinted blue. New icons and share card (`studio-card-v2.jpg`).

## 1.2.0 — 2026-10-17

### Added

- Explicit, memory-only owner/tester visit labels and work/read/play interests, with URL
  entry links and privacy-page controls. Labels declare context; they do not verify identity.
- Location-based masked replay: up to 10% of eligible India visits, with automatic expiry
  on 30 April 2027 and voluntary testing elsewhere. Footer privacy controls offer a saved
  region correction and persistent recording refusal; no saved visitor identity. Tester links
  only label visits. Opt-in is offered through footer settings, with no arrival prompts.
  Recording has visible Stop; browser privacy signals override it.

## 1.1.0 — 2026-10-15

### Added

- Anonymous journey analytics without persistent visitor identity: explicit page, section, content, contact,
  studio and experience events, validated through a first-party PostHog relay.
  Analytics is disabled until configured; visit IDs stay in memory and reset
  on reload. No analytics storage, replay, profiles or visitor IP forwarding.
- A privacy page with a visit-level analytics pause control, linked from the site and Notebook footers.

## 1.0.0 — 2026-10-14

First versioned release: the site as on `production` at c794689, plus:

### Added

- A weathered survey cutter: sun-faded topsides with a waterline line, silvered deck
  planks, weathered varnish and brass, slightly used canvas, sail corner patches and a
  reef band. Nothing reads as damage; the emblem, motion and Drawing view are unchanged.
