# Start here — approved Living Atlas foundation

Updated: 5 October 2026. **The user approved A/B as the foundation and explicitly
requested promotion to the actual homepage/blog, updated documentation and a
commit.** Do not ask for that approval again. This is foundation promotion, not
a claim that the entire creative roadmap or release qualification is complete.

**Foundation commit:** `6adbb9a` — `feat: promote Living Atlas homepage and notebook`
(5 October 2026). The user also explicitly requested push to `origin/main` and wants
to deploy the domain themselves for real feedback. Original plan: `012e164`.

## Active exploration — day/night sea and shoreline

5 October 2026: the user requested light/dark sea, a beach footer, sand tracks,
optional wave sound, release details, and GitHub activity. Implemented directly
on `/`, **uncommitted and awaiting visual selection**. No sample route, commit,
push or deployment is part of this exploration. It supersedes the earlier
suggestion to deepen notebook writing as the immediate next task.

- The day/night switch is only in the shoreline footer. Theme follows the system
  by default, including OS preference changes, until an explicit choice is saved.
  Sea, ship, drawing phase,
  Work and Elsewhere palettes follow the choice; the blog keeps direction B.
  A shared screen anchor projects the sun/moon direction through the camera for
  both water highlights and ship lighting, including phone aspect ratios.
- One shoreline footer follows Elsewhere, with cached procedural sand/shells,
  a narrow tide (roughly 6–12% of footer height), foam, moving wet sand, and
  bounded fading mouse footprints. Water starts in Elsewhere’s exact day/night
  colour and blends into the beach instead of a large blue expanse.
  Touch keeps native scrolling; it adds no pointer trail. Shore animation is
  capped near 30 Hz and 420,000 canvas pixels, pauses offscreen/hidden, and
  respects reduced motion. These budgets are not physical-device qualification.
- Wave sound is explicitly opt-in via “Play waves” in both header and footer.
  Ordinary scrolling, tapping and key presses never start sound. One tap/click
  on either control starts it, and both become “Mute waves”. Mute is remembered;
  a previous enable does not automatically play on reload. Browser restrictions
  are respected, with retry available if playback is blocked. Hidden tabs suspend
  sound; no external audio asset or analytics is used.
- GitHub points to `ctrl-alt-yash`. The workbench shows three validated public
  events from GitHub, cached hourly with a 2.5-second fetch timeout and a usable
  profile-link fallback. It is neither a live feed nor a contributions chart.
- Release text uses the actual package version, currently `0.1.0`; a short commit
  is shown only when Vercel/build SHA environment metadata exists. Sea model v1
  is labelled separately, without inventing deployment or version data.

Next gate: review the day/night sea and beach on `/`, then repeat iPhone Air
Safari interaction checks for this additional footer before accepting the work.
The prior three-stage mobile sea was confirmed smooth by the user; that result
predates this exploration. Keep the 1,800/600 ms durations, with the revised responsive
opening curve/removal of its reveal hold, and continuous
fine-pointer desktop reveal unchanged. Stop temporary QA servers after checks.

## Previous accepted checkpoint and continuing workflow — main site only

The user selected Elsewhere and explicitly retired the sample-route workflow.
Elsewhere now lives in the homepage with numbered destination rows, direct email
contact and a colophon. The duplicate old homepage footer is removed. The sample
route tree, review-only stylesheet, old card/port stylesheet and sample redirect
configuration are deleted. Sample URL compatibility is intentionally retired.

Future creative work goes directly into the main site, stays uncommitted for
user review, and is committed only when accepted. Do not create sample pages or
review galleries. AGENTS.md records this instruction; it supersedes historical
sample workflow descriptions in research and validation. The labelled sample
essays in the notebook are writing-content status, not sample-route scaffolding;
they remain honest and noindex until actual authored writing is supplied.

The next task at that checkpoint was integrated homepage feedback and deeper
notebook writing; the day/night shoreline request above now takes priority. No sensor/C
feature or hosting deployment is included in this checkpoint.

## Latest selected checkpoint — three mobile sea stages

User explicitly chose stage-by-stage mobile gestures, keeping continuous
desktop scrolling. This is selected work at `/`, not a sample awaiting approval.
Three states Sea/Structure/Drawing (0/.55/1) use a 1,800 ms quadratic ease-out opening and 600 ms smootherstep for other moves:
two forward swipes reach Drawing, the next scroll gesture enters Work normally.
Reverse gestures visit the previous state. Previous/Next buttons and direct
Work/Writing/skip exits remain. Coarse primary pointer selects mobile at mount;
fine-pointer desktop remains continuous. Reduced motion uses immediate stills;
no-JS retains the original server/native-scroll fallback. Only local hero stage
gestures are consumed; horizontal/multitouch, links and lower page stay native.

The user requested three phases because Waves and Structure looked too similar.
The merged Structure stage uses midpoint progress .55; Sea and Drawing remain
the endpoints.

This refinement changes `OceanScene.tsx`, browser harness and active docs;
the existing scoped Observatory CSS is retained.
Build/types/lint and 81 browser records pass (40 captures, 40 assertions, cadence).
Actual touch-event progression, reversal, native final exit and reduced-motion
button flow pass; 390 px Structure/Drawing captures reviewed. Physical Safari smoothness,
VoiceOver, rotation-session and real pinch zoom remain open. No field/model/API
change, push or deploy. Commit subject: `refactor: linger on the first mobile sea reveal`.
All temporary QA servers are closed after this checkpoint. Next bounded task:
deploy and verify this selected mobile flow on iPhone Air Safari, preserving the
user-reported Mac Chrome gains. See latest validation for exact evidence.
Earlier checkpoint descriptions below preserve history.

## User intent and decisions

The soul is **Sea. Ship. Math.** A serves the main site, B the blog, and C an
optional discovery. The user rejected the first version as insufficiently
distinctive and its controls too childish. They authorized the ambitious Living
Atlas prototype, thorough documentation and isolated headless Chrome validation,
then requested removal of superseded files. That cleanup is complete.

On 5 October they approved the Living Atlas A/B foundation and asked to move it
to the real site and commit. Public-route validation is complete: build/types/lint, 20 tests and a 54-record
browser run pass. Do not reopen the settled creative choice. Future unselected experiments
still require review before their own commits. Commit and push were requested; domain hosting is the user’s next action.

## Read these in order

1. This handoff and repository `AGENTS.md`.
2. [Validation](creative-v2-validation.md): actual checks, public-promotion
   evidence, historical prototype comparisons and unverified gates.
3. [Implementation plan](creative-v2-plan.md): exact contracts, files, ordered
   tasks and commit boundaries.
4. Research only for the relevant next task:
   [references](research/creative-references-v2.md),
   [whole-site audit](research/creative-audit-v2.md),
   [engineering](research/creative-engineering-v2.md).

The research's larger data/quality-tier architecture remains proposed. The
smaller `lib/sea-edition.ts` v1 contract is authoritative. Read installed Next
docs before changing Next-specific APIs; params/searchParams are promises.

## Public foundation routes

The rejected v1 blog/harbour/voyage implementations were removed. The new `/blog`
is the accepted Atlas publication. Unused original-home components and the old
SVG-home browser harness were retired; Work/Elsewhere and useful generated
artwork remain. Two essays remain sample content and noindex;
public routing does not turn sample prose into final authored writing.

**Current server state: all repo servers are stopped at user request**, including
dev 3000 and previews 3001/3002/3004/3005; listener checks confirmed closure.
Do not restart a preview as part of a handoff. The current test target is live
`https://www.maxsash.com`. Earlier preview references below are historical.

## Mechanism and limits

Six seeded directional sine waves share coefficients between CPU sampling, GPU
surface geometry, ship attitude and server SVG. Direction is radians, x/z
horizontal, y up. Dispersion uses `sqrt(9.81 * 2π / wavelength)`. Preserve the
v1 PRNG/coefficient contract for reproducible links.

`OceanScene.tsx` owns lifecycle and chapter progress; dynamically imported
`ocean-engine.ts` owns rendering/resources; `ocean-shaders.ts` owns GLSL.
`OceanPlate.tsx` is a lower-density server illustration; the print export is a
separate projection of the same t=0 field. `content/notebook.ts` owns essay copy,
metadata and captions. Atlas components own the scoped publication CSS.

The renderer has no new dependency, texture or downloaded model. Its current
three draws include a 60,000-triangle desktop sea or 21,600-triangle compact
sea. Coarse pointer or <760 px at mount chooses compact, retained across resize:
360,000 pixels/DPR 1 versus desktop 1.5 million/DPR 1.25. Fixed wave constants
are prepared once for shaders. Animation is bounded to 60 Hz, with sustained
slow delivery reducing resolution and ceiling to 30 Hz. These are workload
budgets, not qualified GPU tiers. Latest scheduler correction applies these
ceilings to idle motion; new scroll samples draw at the next browser callback.
Context loss stays on fallback until reload. The vessel is a
procedural sailboat, not the exact integral brand mark. Fine light ripples and
wake are approximations; this is not a fluid simulation or live ocean feed.

Still outstanding: real project facts/assets/spreads; final port treatment;
richer explanatory plates; meaningful optional phone tilt; real observation
ingestion; C; physical-phone GPU/thermal/battery qualification; full accessibility;
field Web Vitals. Foundation approval and a commit do not close those gates.

## Evidence and checkpoint discipline

[Current validation](creative-v2-validation.md) is the evidence source. The
prototype previously passed build/types/lint, 13 geometry/model tests, seven HTTP
tests and a 40-record headless browser run. Those results describe that version;
the integrating agent records fresh public-route/redirect checks separately.
Do not carry earlier payload or browser counts forward as new measurements.

Fresh public-route evidence lives in ignored `tools/.out/creative-home/`;
`tools/.out/creative-v2/` retains earlier prototype evidence. Do not commit
browser profiles, captures or build output by default. Desktop-GPU testing at a
phone viewport is not physical-device validation. Commands are in README and
validation; rerun checks justified by the actual changes.

## Immediate and subsequent tasks

**Foundation checkpoint is complete:** `6adbb9a`, followed by documentation
checkpoint `5eddf76`; both were present locally and `main` matched the local
`origin/main` tracking reference at the start of the continuation. No remote
fetch or deployment is implied by that comparison.

**Completed continuation:** renderer lifecycle hardening on `/`: explicit
context-loss disposal and ignoring import rejection after unmount. Build,
types, lint, 13 geometry/model tests and 57 production browser records pass,
including loss cleanup/stopped drawing and shader-link failure fallback.
Changed `OceanScene.tsx`, the browser harness and checkpoint docs. Commit
subject: `fix: dispose ocean engine on context loss`. Preview is running on
`http://localhost:3002`; existing 3000/3001 servers were left intact.
The fallback-on-loss policy remains; automatic restoration is not introduced.
This checkpoint is committed as `86f1589`.

**Completed feedback checkpoint (`df871c3`):** user reported Writing's extra click and lag on
production `maxsash.com`: iPhone Air/Safari and MacBook Pro/Chrome, despite smooth
localhost. Writing now opens `/blog` directly. Smaller compact mesh/pixel budget,
precomputed shader constants, bounded draw cadence, reachable slow-frame
downgrade and unchanged-size canvas resize guard address unnecessary work.
Changed homepage/nav content, scene lifecycle, engine/shaders, GPU probe,
browser harness and active docs. Final build/types/lint, 13 model/geometry tests
and 64 browser records pass; phone/desktop captures reviewed. Local and live
stationary Chrome diagnostics both had steady 16.7 ms median/p95 callbacks;
production load was slower, but sustained user-reported lag was not reproduced.
Full evidence and approximation limits are in validation.
Commit subject: `fix: streamline Writing and reduce sea rendering cost`.
Final preview is `http://localhost:3004`; no remote push/deployment in this session.

**Latest clarification/checkpoint:** lag occurs specifically while scrolling
down through the sea reveal on Mac Chrome and iPhone Air Safari. Opacity updates
now share the GPU's scroll sample/frame, scroll events queue work, unchanged
values are skipped, and the covered SVG fallback is hidden while WebGL is active
(restored on loss). Changes: `OceanScene.tsx`, scoped Observatory CSS, browser
harness and checkpoint docs. Build/types/lint and 66 browser records pass;
desktop/phone reveal and fallback captures reviewed. Native browser-gesture
local before/after measurements cut style recalculation by ~93% in the samples;
GPU/physical-phone improvement is not established. Production still has the
older Writing link and larger phone canvas; live headless gesture tests did not
reproduce visible stutter. Commit subject:
`fix: synchronize sea reveal with scroll frames`. Final preview is now
`http://localhost:3005`; read current validation for exact commands/reports.

**Updated release checkpoint:** `740b738` matches local `origin/main`; Writing
and compact rendering are observable live. Fresh production native-scroll
diagnostics show 16.7 ms draw p95, zero observed long tasks and 14.1/18.8 ms
style totals for desktop/phone viewport. All repo servers stopped. Only active
docs changed this turn; no application edits, push or hosting action. Exact
evidence and physical limits are in current validation.

**Next bounded task:** obtain the user's reloaded production scroll result on
Mac Chrome and iPhone Air Safari,
prioritizing wheel/touch scroll through the reveal and warm/cold runs. Record browser/OS/version, refresh
and Low Power settings; trace persistent production-only Mac stalls. Performance
remains open until actual physical-device evidence improves. This precedes
new creative features and portfolio work. Authentic content still needs facts.

**Latest physical feedback:** user supplied an 8.17 s iPhone Air Safari recording
and says Mac Chrome is much better. Recording frames reviewed; Safari reveal
stutter remains open, without a measured root cause. Changed `OceanScene.tsx`
to let new scroll samples bypass idle cadence and to advance idle deadlines,
plus the browser regression and active docs. GPU/model/composition stay intact;
scroll can now draw faster than the idle ceiling. Commit subject:
`fix: prioritize scroll input over idle sea cadence`. Consult latest validation
for actual checks: build/types/lint and 67 browser records pass, including scroll
priority in low quality (21 draws for 20 synthetic scroll samples). Temporary QA
server closed, with no repo listeners; no persistent
preview. Next is deploy/repeat the same iPhone gestures, then a native Safari
trace/version investigation if it still stutters. Mac gains must be preserved.

At each handoff update: user decision, public/review route, changed files, checks
actually run, known limits, commit state and next bounded task. Stage deliberate
related paths rather than mass-staging an unknown tree.

## Mobile opening curve refinement

The user reported that the 1 → 2 animation seemed idle and then rushed. The long
opening now uses `t * (2 - t)` instead of a flat-start quintic smootherstep.
Mobile progress 0–.55 maps directly onto reveal 0–.5466667, removing the desktop
intro hold for this range. That mapping meets the original mapping exactly at
Structure, so 2 → 3 keeps its original 600 ms curve and reveal path. Desktop
continuous scroll, stage targets, pauses, reduced-motion stills and reversals stay
intact. Actual GPU uniform samples and regression evidence are recorded in current
validation; physical iPhone acceptance must be repeated for this curve.
