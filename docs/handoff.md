# Handoff — start here

Updated 12 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD d686843 on main; tree was clean when this session started. Do not commit or release.

## Current work

Owner requested factually correct moon phases in night mode, if no higher-priority work is
ready. Priorities remain owner release/social previews, physical-phone/accessibility checks,
and search-console/Bing inspections; no identified urgent source fix blocks the moon work.
The previous handoff's staged/unstaged account is obsolete: those changes are committed.

The night hero now shows a factually dated phase on a complete lunar surface. Pure orbital
calculation supplies the noon-IST phase for the date; sphere normals and phase-derived sunlight
supply the lit/unlit boundary. One subtly marked material continues through lunar night, revealed
by dim viewer-facing Earthshine, with atmospheric sky beneath both sides. It no longer reads as
a black cover over the bright portion. Markings/brightness are authored, not a lunar map or
calibrated photometry. Material work is limited to pixels inside the night disc.

Still/reduced-motion scenes refresh the date after India midnight; visible draws refresh on
return from a hidden tab. Fixed size/position/orientation and sea lighting. No location, remote
request, dependency or asset. Shared error shader bytes/fallback remain fixed. Docs are current.
Work is uncommitted. Sun/moon click-to-toggle was discussed, not requested for implementation.

## Verification

Final isolated Node 24 webpack build, lint, TypeScript, format and 132/132 Node tests pass.
USNO phase fixtures agree within 0.2 degrees / 0.5% illumination; India-date rollover is pinned.
Moon browser check passes 14 supersampled lit-area cases within 1.5 percentage points,
Earthshine/night-surface RGB above equivalent sky (no black overlay), spherical shading,
unchanged daylight and dated hero/reduced-motion midnight redraw. Inspected final desktop
crescent/quarters/full and phone crescent. 78 SEO cases, headers/CSP, keyboard 22/22 and creative
191 records pass with zero failed assertions/runtime exceptions. Own :3041 server stopped;
latest captures/report saved in tools/.out/moon/. Own isolated worktree removed.
Not checked: physical devices, Safari/Firefox, real screen reader, production release.

## Next

Owner: review the main site's night mode; commit/release remain the owner's actions.
Optional preview: tools/.out/moon/crescent.png and phone-crescent.png.

## Open items

- Owner: review/release, then real social previews and crawler/indexing inspections.
- Physical phone, Safari/Firefox, screen reader, audio and field performance checks.
- Private-system production evidence, Vercel rate limits, and remaining follow-ups.md items.
- Old detached worktrees belong to prior sessions; leave them alone.

## Suggested commit

```
feat: show date-correct phases on a continuous lunar surface

Calculate lunar illumination locally at noon IST. Shade one marked lunar surface with
phase-derived sunlight and dim Earthshine so its night face continues around the bright
portion. Refresh the date in still scenes and preserve fixed error-page skies.

Verified in an isolated Node 24 production build: types, lint, format, 132 Node tests,
USNO fixtures, moon surface/area/shading/date/midnight checks, 78 SEO cases, headers/CSP,
keyboard 22/22 and creative 191 records with no failures/runtime exceptions.
Desktop/phone phase captures inspected.
```
