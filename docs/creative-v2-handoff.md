# Start here — approved Living Atlas foundation

Updated: 5 October 2026. **The user approved A/B as the foundation and explicitly
requested promotion to the actual homepage/blog, updated documentation and a
commit.** Do not ask for that approval again. This is foundation promotion, not
a claim that the entire creative roadmap or release qualification is complete.

**Foundation commit:** `feat: promote Living Atlas homepage and notebook`
(5 October 2026). This handoff travels with that commit; use Git history for its
identifier. The user also explicitly requested push to `origin/main` and wants
to deploy the domain themselves for real feedback. Original plan: `012e164`.

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

- `/`: native-scroll sea → moving drawing, procedural ship, shared wave field,
  edition explanation/export, notebook threshold, retained Work/Elsewhere access
  and contact.
- `/?seed=27c4b901`: alternate authored edition.
- `/blog`: distinct engraved Navigator's Notebook.
- `/blog/three-waves-one-sea`: six-wave sample essay; inherited slug retained.
- `/blog/an-integral-under-sail`: original mark construction sample essay.
- `/samples`: approved-foundation index and future review entry point.
- Old `/samples/observatory`, `/samples/atlas` and atlas article URLs redirect to
  their public counterparts. Check seed/slug preservation in promotion QA.
- `/api/sea-edition` and `/api/sea-edition/print`: JSON and standalone SVG,
  default seed `5ea5cafe`, optional `version=1`.

The rejected v1 blog/harbour/voyage implementations were removed. The new `/blog`
is the accepted Atlas publication. Unused original-home components and the old
SVG-home browser harness were retired; Work/Elsewhere and useful generated
artwork remain. Two essays remain sample content and noindex;
public routing does not turn sample prose into final authored writing.

The production preview has used **http://localhost:3001**. Check whether it is
running before starting another: `pnpm build`, then
`pnpm start --hostname localhost --port 3001`. The preexisting dev server on 3000
was left intact. Current server state and check results belong in validation.

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
three draws include a 60,000-triangle sea, with bounded pixels and paused/reduced
motion stills. Context loss stays on fallback until reload. The vessel is a
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

**Immediate authorized task:** complete promotion checks on `/` and `/blog`,
verify existing sections and old-URL redirects, update validation, stage the
coherent approved foundation with its docs/tests, and commit. Fill the commit
record at the top from the actual result. No renewed approval is required.

**After the foundation commit:** qualify on named physical phones, then continue
authentic project/content work and focused refinements from the implementation
plan. Put new materially different alternatives under `/samples`; sensors,
external data and C each need a visible payoff and their own review.

At each handoff update: user decision, public/review route, changed files, checks
actually run, known limits, commit state and next bounded task. Stage deliberate
related paths rather than mass-staging an unknown tree.
