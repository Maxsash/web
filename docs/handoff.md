# Handoff — start here

Updated 12 October 2026. Read AGENTS.md, architecture.md, decisions.md and testing.md.
HEAD d83de8b on main; owner committed the moon work before this turn. Owner authorizes committing the verified transition in this turn; no push/release.

## Current work

Owner requested factually correct moon phases in night mode, if no higher-priority work is
ready. Priorities remain owner release/social previews, physical-phone/accessibility checks,
and search-console/Bing inspections; no identified urgent source fix blocks the moon work.
The previous handoff's staged/unstaged account is obsolete: those changes are committed.

Implemented the approved sky interaction: native mouse/touch/keyboard activation of the sun or
moon gives one sea ripple beneath its reflection column and a one-second day/night palette fade.
Rapid clicks reverse continuously. Shared theme authority keeps the sky and labelled shore
control synchronized; manual choices persist and override OS changes. Dated lunar surface stays.

44 px minimum transparent sky target matches the rendered disc, with hover-device-only feedback
and a focus ring. It hides in Drawing/fallback and if it would cover copy/header/meta. Still,
reduced-motion, initial/hidden/offscreen scenes snap; a live reduced preference settles a fade.
One existing frame loop and ripple shader; no new route, dependency, asset or sound.
Architecture/decisions/testing/cleanup are current. Transition source matches the verified
version; committing only this set now on the owner's explicit request.

## Verification

Final isolated Node 24 webpack build, lint, TypeScript, format and 136/136 Node tests pass.
12 native sky cases pass: mouse/touch/Enter/Space, one ripple, intermediate/final/reversed fade,
saved/OS choice, live reduced preference, still/reduced immediate changes, phone stage,
viewport alignment, Drawing hiding and no-GPU fallback with the labelled toggle working.
Moon surface/area/date/midnight checks pass. 78 SEO cases, headers/CSP, keyboard 22/22 and
creative 191 records pass with zero failed assertions/runtime exceptions. Header browser first
hit a transient empty Chrome DevTools port file (localhost:80); clean rerun passed.
Inspected desktop transition/night and phone day captures. Own :3041 server stopped; previews
saved in tools/.out/sky-theme/. Own isolated worktree removed.
Not checked: physical phone, Safari/Firefox, real screen reader or production release.

## Next

After the transition commit: research a realistic sky (stars/planets), fixed Tikamgarh location,
clock/view-direction compromises, rendering budgets and a lazy high-resolution lunar Easter
egg. No new sky implementation approved yet; source/performance research next.

## Open items

- Owner: review/release, then real social previews and crawler/indexing inspections.
- Physical phone, Safari/Firefox, screen reader, audio and field performance checks.
- Private-system production evidence, Vercel rate limits, and remaining follow-ups.md items.
- Old detached worktrees belong to prior sessions; leave them alone.

## Suggested commit

```
feat: switch the sea between day and night by touching the sky

Make the rendered sun/moon a keyboard-accessible 44 px target. Each activation creates
one sea ripple and a one-second interruptible palette fade. Share saved/manual theme
tracking with the labelled shore control; respect pauses, reduced motion and fallback.

Verified in an isolated Node 24 production build: types, lint, format, 136 Node tests,
12 native sky interaction cases, lunar checks, 78 SEO cases, headers/CSP, keyboard 22/22
and creative 191 records with no failures/runtime exceptions. Desktop/phone captures inspected.
```
