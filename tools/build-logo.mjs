/*
 * Maxsash Labs mark — an integral sign rigged as the mast of a sailboat.
 *
 * The silhouette is the one that already existed; what changed is that every
 * relationship in it is now derived rather than drawn by hand:
 *
 *   - the integral is a single spine with exact 180 degree rotational symmetry
 *     about its inflection, so the two ball terminals are the same shape and
 *     the stem's S reverses precisely at the middle;
 *   - the sail's luff and the hull's stern both ride one offset of that spine,
 *     so the white channel beside the mast is a constant width top to bottom;
 *   - the deck line, the sail's foot and the keel are mutually parallel;
 *   - the boat is positioned in fractions of the integral's own height, so the
 *     proportions hold at any size.
 *
 * Run: node tools/build-logo.mjs
 */
import { writeFileSync } from "node:fs";
import { V, rad, fromVertical, cubicAt, fitPath, chainToD, fmt } from "./geom.mjs";

/* ------------------------------------------------------- the integral -- */

const STROKE_MAX = 76;        // pen width at the inflection
const STROKE_END = 0.82;      // fraction of that at the terminals
const TAPER_POW = 2.1;        // keeps the stem full, tapering late
const BALL_R = 44;            // ball terminal radius

const STEM_ANGLE_MID = 9;     // degrees off vertical at the inflection
const STEM_ANGLE_TOP = 18;    // degrees off vertical at the shoulder
const SHOULDER = [78, 337];   // where the stem hands off to the hook

const HOOK_R0 = 56;           // hook radius at the shoulder
const HOOK_R1 = 50;           // radius where it closes into the ball
const HOOK_SWEEP = 176;       // degrees of turn

/* --- the boat, in fractions of the integral's height (y measured downward
       from the top of the mark, matching how the mark is read) ------------ */

const GAP_F = 0.033;          // white channel, everywhere
const ROUND = 9;              // corner rounding on sail + hull

const DECK_ANGLE = 11;        // the deck and the sail's foot share this rise
const DECK_LEFT_YF = 0.805;
const DECK_LEN_F = 0.645;
const KEEL_YF = 0.962;        // the keel runs level, so the hull deepens forward
const BOW_RAKE = 36;          // degrees off vertical

const SAIL_HEAD_YF = 0.17;
const SAIL_FOOT_LEN_F = 0.444;
const LEECH_HEAD_ANGLE = 40;  // degrees off straight-down leaving the head
const LEECH_CLEW_ANGLE = 17;  // degrees off straight-down at the clew
const LEECH_HEAD_PULL = 0.52; // handle lengths as a share of the head-to-clew chord
const LEECH_CLEW_PULL = 0.36;

/* ------------------------------------------------- the integral's spine -- */

const C = [0, 0];
const tanMid = fromVertical(STEM_ANGLE_MID);
const tanTop = fromVertical(STEM_ANGLE_TOP);
const stem = {
  p0: C,
  c1: V.add(C, V.mul(tanMid, SHOULDER[1] * 0.52)),
  c2: V.add(SHOULDER, V.mul(tanTop, -SHOULDER[1] * 0.47)),
  p3: SHOULDER,
};

// Hook: a spiral tangent to the stem at the shoulder, tightening as it closes.
const hookCentre = V.add(SHOULDER, V.mul([tanTop[1], -tanTop[0]], HOOK_R0));
const PHI0 = Math.atan2(SHOULDER[1] - hookCentre[1], SHOULDER[0] - hookCentre[0]);
const PHI1 = PHI0 - rad(HOOK_SWEEP);

const hookAt = (u) => {
  const phi = PHI0 + (PHI1 - PHI0) * u;
  const r = HOOK_R0 + (HOOK_R1 - HOOK_R0) * u * u; // r'(0)=0 keeps the join smooth
  return [hookCentre[0] + r * Math.cos(phi), hookCentre[1] + r * Math.sin(phi)];
};

const STEM_SHARE = 0.5; // of the half-spine's parameter range

const upperAt = (t) =>
  t <= STEM_SHARE
    ? cubicAt(stem.p0, stem.c1, stem.c2, stem.p3, t / STEM_SHARE)
    : hookAt((t - STEM_SHARE) / (1 - STEM_SHARE));

/** The whole spine: s in [-1,1]; the negative half is the 180 degree rotation. */
const spineAt = (s) => {
  if (s >= 0) return upperAt(s);
  const p = upperAt(-s);
  return [-p[0], -p[1]];
};

const H = 1e-4;
const spineTangent = (s) =>
  V.norm(V.sub(spineAt(Math.min(1, s + H)), spineAt(Math.max(-1, s - H))));

// Width tapers from the inflection out to each terminal, symmetric in |s|.
const widthAt = (s) => STROKE_MAX * (1 - (1 - STROKE_END) * Math.pow(Math.abs(s), TAPER_POW));

// Normal pointing to the sail side: screen-right of the upward-running spine.
const sailNormal = (s) => { const t = spineTangent(s); return [t[1], -t[0]]; };

/* ------------------------------------------------------- stroke outline -- */

const N = 1400;
const sailSide = [];
const backSide = [];
for (let i = 0; i <= N; i++) {
  const s = -1 + (2 * i) / N;
  const p = spineAt(s), n = sailNormal(s), h = widthAt(s) / 2;
  sailSide.push(V.add(p, V.mul(n, h)));
  backSide.push(V.add(p, V.mul(n, -h)));
}

const tangentsOf = (pts) => (i) =>
  V.norm(V.sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)]));

const backReversed = [...backSide].reverse();
const sailChain = fitPath(sailSide, tangentsOf(sailSide), 0.9);
const backChain = fitPath(backReversed, tangentsOf(backReversed), 0.9);

const integralD =
  `M${fmt(sailSide[0])}${chainToD(sailChain)}L${fmt(backSide[N])}${chainToD(backChain)}Z`;

const ballTop = spineAt(1);
const ballBottom = spineAt(-1);

// The integral's own bounds set the scale everything else is measured against.
const iPts = [...sailSide, ...backSide,
  [ballTop[0] - BALL_R, ballTop[1] - BALL_R], [ballTop[0] + BALL_R, ballTop[1] + BALL_R],
  [ballBottom[0] - BALL_R, ballBottom[1] - BALL_R], [ballBottom[0] + BALL_R, ballBottom[1] + BALL_R]];
const iTop = Math.max(...iPts.map((p) => p[1]));
const iBottom = Math.min(...iPts.map((p) => p[1]));
const Hi = iTop - iBottom;

/** Convert a "fraction down from the top of the mark" into design-space y. */
const atFrac = (f) => iTop - f * Hi;

const GAP = GAP_F * Hi;
const DECK_LEN = DECK_LEN_F * Hi - 2 * ROUND;
const SAIL_FOOT_LEN = SAIL_FOOT_LEN_F * Hi - 2 * ROUND;

/* ------------------------------------------------- the luff / stern rail -- */

// Sail and hull are painted fill + stroke (width 2*ROUND) so they grow by
// ROUND; the geometry is pulled in by that much to keep the channel at GAP.
const luffAt = (s) => V.add(spineAt(s), V.mul(sailNormal(s), widthAt(s) / 2 + GAP + ROUND));

// The luff doubles back inside each hook, so a plain bisection can latch onto a
// spurious crossing.  Walk down from the top and take the first one instead.
const SEARCH_HI = 0.62, SEARCH_LO = -0.78, SEARCH_STEPS = 3000;

const firstCrossing = (f) => {
  let prev = SEARCH_HI, fprev = f(prev);
  for (let i = 1; i <= SEARCH_STEPS; i++) {
    const s = SEARCH_HI + ((SEARCH_LO - SEARCH_HI) * i) / SEARCH_STEPS;
    const fs = f(s);
    if (Math.sign(fs) !== Math.sign(fprev)) {
      let lo = s, hi = prev;
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2;
        if (Math.sign(f(mid)) === Math.sign(fprev)) hi = mid; else lo = mid;
      }
      return (lo + hi) / 2;
    }
    prev = s; fprev = fs;
  }
  throw new Error("luff never crosses the target line");
};

const luffAtY = (y) => firstCrossing((s) => luffAt(s)[1] - y);

const luffAtLine = (pt, dir) => {
  const n = V.perp(dir);
  return firstCrossing((s) => V.dot(V.sub(luffAt(s), pt), n));
};

const luffSegment = (a, b, steps = 400) =>
  Array.from({ length: steps + 1 }, (_, i) => luffAt(a + ((b - a) * i) / steps));

/* --------------------------------------------------------------- the hull -- */

const along = fromVertical(90 - DECK_ANGLE);   // unit vector up the deck line
const upNormal = V.perp(along);                 // off the deck, up and to the left

const sDl = luffAtY(atFrac(DECK_LEFT_YF));
const Dl = luffAt(sDl);
const Bt = V.add(Dl, V.mul(along, DECK_LEN));

const sKl = luffAtY(atFrac(KEEL_YF) + ROUND);
const Kl = luffAt(sKl);

const lineIntersect = (p, d, q, e) => {
  const t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / (d[0] * e[1] - d[1] * e[0]);
  return V.add(p, V.mul(d, t));
};
const Kr = lineIntersect(Bt, fromVertical(180 + BOW_RAKE), Kl, [1, 0]);

const hullEdge = luffSegment(sKl, sDl);
const hullD = `M${fmt(Kl)}${chainToD(fitPath(hullEdge, tangentsOf(hullEdge), 0.25))}L${fmt(Bt)}L${fmt(Kr)}Z`;

/* --------------------------------------------------------------- the sail -- */

const sTack = luffAtLine(V.add(Dl, V.mul(upNormal, GAP + 2 * ROUND)), along);
const tack = luffAt(sTack);
const clew = V.add(tack, V.mul(along, SAIL_FOOT_LEN));

const sHead = luffAtY(atFrac(SAIL_HEAD_YF));
const head = luffAt(sHead);

const leechLen = V.dist(head, clew);
const leechC1 = V.add(head, V.mul(fromVertical(180 - LEECH_HEAD_ANGLE), leechLen * LEECH_HEAD_PULL));
const leechC2 = V.add(clew, V.mul(fromVertical(180 - LEECH_CLEW_ANGLE), -leechLen * LEECH_CLEW_PULL));

/* A cubic bends one way for its whole length exactly when its control polygon
 * is convex.  The leech is the mark's longest free curve, so an inflection
 * there is the first thing that reads as unfair — check it rather than trust
 * the numbers above. */
{
  const legs = [V.sub(leechC1, head), V.sub(leechC2, leechC1), V.sub(clew, leechC2)];
  const turns = [0, 1].map((i) => Math.sign(
    legs[i][0] * legs[i + 1][1] - legs[i][1] * legs[i + 1][0],
  ));
  if (turns[0] !== turns[1]) {
    throw new Error(
      "leech control polygon is not convex: the curve would carry an " +
      "inflection. Raise LEECH_HEAD_PULL or lower LEECH_CLEW_PULL.",
    );
  }
}

const luffEdge = luffSegment(sTack, sHead);
const sailD =
  `M${fmt(tack)}${chainToD(fitPath(luffEdge, tangentsOf(luffEdge), 0.25))}` +
  `C${fmt(leechC1)} ${fmt(leechC2)} ${fmt(clew)}Z`;

/* ------------------------------------------------------------- assemble -- */

const grown = (p, dx, dy) => [p[0] + dx, p[1] + dy];
const probe = [...iPts,
  grown(Bt, ROUND, ROUND), grown(Kr, 0, -ROUND), grown(Kl, -ROUND, -ROUND),
  grown(clew, ROUND, 0), grown(head, 0, ROUND), grown(tack, -ROUND, -ROUND)];
const minX = Math.min(...probe.map((p) => p[0]));
const maxX = Math.max(...probe.map((p) => p[0]));
const minY = Math.min(...probe.map((p) => p[1]));
const maxY = Math.max(...probe.map((p) => p[1]));

const PAD_F = 0.04;
const w = maxX - minX, h = maxY - minY;
const box = Math.max(w, h) * (1 + PAD_F * 2);
const offX = -minX + (box - w) / 2;
const offY = -minY + (box - h) / 2;

const B = (n) => +n.toFixed(2);
const out = {
  integralD, sailD, hullD,
  ballTop: ballTop.map(B), ballBottom: ballBottom.map(B),
  ballR: BALL_R, round: ROUND,
  box: B(box), offX: B(offX), offY: B(offY),
};
writeFileSync(new URL(".out/logo.json", import.meta.url), JSON.stringify(out, null, 2));

/* --- emit the React component and the standalone icon ------------------- */

const shapes =
  `<path d="${integralD}" />` +
  `<circle cx="${B(ballTop[0])}" cy="${B(ballTop[1])}" r="${BALL_R}" />` +
  `<circle cx="${B(ballBottom[0])}" cy="${B(ballBottom[1])}" r="${BALL_R}" />` +
  `<path d="${sailD}" />` +
  `<path d="${hullD}" />`;

const component = `/* Generated by tools/build-logo.mjs — edit the dials there, not this file.
 *
 * The mark is authored y-up (the integral's inflection at the origin) and
 * flipped into SVG's y-down space by the group transform.  Sail and hull carry
 * a stroke of their own so their corners round; the mast needs none because it
 * is already an outline with circular terminals.
 */

type MarkProps = {
  className?: string;
  /** Give it an accessible name; omit for a purely decorative mark. */
  title?: string;
};

export default function Mark({ className, title }: MarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 ${B(box)} ${B(box)}"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <g
        transform="translate(${B(offX)} ${B(offY)}) scale(1 -1)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={${ROUND * 2}}
        strokeLinejoin="round"
      >
        <path d="${integralD}" strokeWidth={0} />
        <circle cx={${B(ballTop[0])}} cy={${B(ballTop[1])}} r={${BALL_R}} strokeWidth={0} />
        <circle cx={${B(ballBottom[0])}} cy={${B(ballBottom[1])}} r={${BALL_R}} strokeWidth={0} />
        <path d="${sailD}" />
        <path d="${hullD}" />
      </g>
    </svg>
  );
}
`;
writeFileSync(new URL("../components/Mark.tsx", import.meta.url), component);

/**
 * Icon tiles.  `inset` is the share of the tile left empty around the mark:
 * browser tabs render the artwork as given, while iOS applies its own squircle
 * mask on top, so the Apple tile is drawn square and holds the mark further in.
 */
const iconSvg = ({ fg, bg = null, radius = 0, inset = 0.17 }) => {
  const tile = 1000;
  const scale = (1 - inset * 2) * (tile / box);
  const shift = (tile - box * scale) / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tile} ${tile}">` +
    (bg ? `<rect width="${tile}" height="${tile}" rx="${radius}" fill="${bg}"/>` : "") +
    `<g transform="translate(${B(shift)} ${B(shift)}) scale(${B(scale)}) ` +
    `translate(${B(offX)} ${B(offY)}) scale(1 -1)" fill="${fg}" stroke="${fg}" ` +
    `stroke-width="${ROUND * 2}" stroke-linejoin="round">${shapes}</g></svg>`
  );
};

writeFileSync(
  new URL("../app/icon.svg", import.meta.url),
  iconSvg({ fg: "#F7EFDF", bg: "#0C3D55", radius: 215, inset: 0.19 }),
);
writeFileSync(
  new URL(".out/apple-icon.svg", import.meta.url),
  iconSvg({ fg: "#F7EFDF", bg: "#0C3D55", radius: 0, inset: 0.235 }),
);
writeFileSync(new URL("../public/mark.svg", import.meta.url), iconSvg({ fg: "currentColor", inset: 0 }));


console.log(JSON.stringify({
  integralHeight: +Hi.toFixed(1),
  strokeOverHeight: +(STROKE_MAX / Hi).toFixed(4),  // target 0.092
  ballOverStroke: +((BALL_R * 2) / STROKE_MAX).toFixed(3),
  gap: +GAP.toFixed(1),
  markAspect: +(w / h).toFixed(3),                  // target 0.957
  segments: sailChain.length + backChain.length,
  bowTipFrac: +((iTop - Bt[1]) / Hi).toFixed(3),    // target 0.685
  keelFrac: +((iTop - Kl[1]) / Hi).toFixed(3),      // target 0.966
  headFrac: +((iTop - head[1]) / Hi).toFixed(3),
  clewFrac: +((iTop - clew[1]) / Hi).toFixed(3),    // target 0.665
}, null, 2));
