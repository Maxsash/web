/*
 * Maxsash Studio mark — an integral sign rigged as the mast of a sailboat.
 *
 * The silhouette is the one that already existed; what is derived rather than
 * drawn by hand is every relationship in it:
 *
 *   - the integral is a single spine with exact 180 degree rotational symmetry
 *     about its inflection, so the two ball terminals are the same shape and
 *     the stem's S reverses precisely at the middle;
 *   - the mast is the region swept by a round pen whose radius varies smoothly
 *     along that spine, so the ball terminals are the pen itself at its widest
 *     and join the stroke tangentially — there is no circle unioned on and no
 *     notch where it lands;
 *   - the white channel is the same pen grown by one gap width, so the sail's
 *     luff and the hull's stern rail are exactly one gap off the mast's ink for
 *     untrimmed length; bounded fillets finish the channel's branching ends;
 *   - the gently curved deck and sail foot are concentric normal offsets;
 *   - sail and hull carry real per-corner fillets, so the bow can stay sharp
 *     while the clew stays soft, and nothing depends on a stroke attribute;
 *   - the boat is positioned in fractions of the integral's own height, so the
 *     proportions hold at any size.
 *
 * Run: node tools/build-logo.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { V, rad, fromVertical, cubicAt, fitPath, chainToD, fmt } from "./geom.mjs";
import { ringToPath, arcThrough, distToPolyline, assertSimpleOutline } from "./outline.mjs";

mkdirSync(new URL(".out", import.meta.url), { recursive: true });

/* ------------------------------------------------------- the integral -- */

/* The pen. Its width is the mark's only weight: thickest at the inflection,
 * waisted where the hook turns hardest, swelling into a ball at each terminal.
 * That waist is what opens the hook's counter — thinning the curl shrinks the
 * hook's outer edge and its inner edge at the same time, so the counter grows
 * without the hook growing. */
const STROKE_MAX = 73; // pen width at the inflection
const SHOULDER_F = 0.8; // pen width where the stem hands off, x STROKE_MAX
const WAIST_F = 0.66; // pen width at the waist of the hook
const WAIST_AT = 0.52; // where that waist falls, as a share of the hook
const BALL_F = 1.1; // pen width at the terminal: the ball's diameter
const BALL_SWELL = 1.25; // how hard the pen is still opening at the tip

const STEM_ANGLE_MID = 9; // degrees off vertical at the inflection
const STEM_ANGLE_TOP = 18; // degrees off vertical at the shoulder
const SHOULDER = [76, 320]; // where the stem hands off to the hook

const HOOK_R0 = 68; // hook radius at the shoulder
const HOOK_R1 = 60; // radius where it closes into the ball
const HOOK_SWEEP = 168; // degrees of turn

/* --- the boat, in fractions of the integral's height (y measured downward
       from the top of the mark, matching how the mark is read) ------------ */

const GAP_F = 0.035; // white channel, everywhere

const DECK_ANGLE = 11; // the deck and the sail's foot share this rise
const DECK_LEFT_YF = 0.808;
const DECK_LEN_F = 0.65;
const DECK_SAG_F = 0.01; // very slight sheer, below the deck's chord
const KEEL_YF = 0.96; // keel endpoints; the belly sits just below them
const KEEL_SAG_F = 0.008;
const BOW_RAKE = 36; // degrees off vertical
const BOW_SAG_F = 0.003; // barely perceptible fullness in the bow

const SAIL_HEAD_YF = 0.212; // the sail's *virtual* peak, before it is blunted
const SAIL_FOOT_LEN_F = 0.452;
const LEECH_HEAD_ANGLE = 68; // degrees off straight-down leaving the head
const LEECH_CLEW_ANGLE = 12; // degrees off straight-down at the clew
const LEECH_HEAD_PULL = 0.45; // handle lengths as a share of the head-to-clew chord
const LEECH_CLEW_PULL = 0.32;

/* Corner radii, in fractions of the pen's widest. One value per corner: a bow
 * wants to stay a bow and a clew wants to stay soft, and the two corners that
 * face each other across the fork carry the same radius so it reads as one
 * deliberate junction rather than two accidents. */
const R_HEAD_F = 0.16; // sail: blunts the head into a headboard
const R_TACK_F = 0.04; // sail: the fork's upper jaw
const R_CLEW_F = 0.16;
const R_STERN_F = R_TACK_F; // hull: the fork's lower jaw
const R_BOW_F = 0.09; // hull: kept small so the bow stays a bow
const R_FOREFOOT_F = 0.2;
const R_KEEL_AFT_F = 0.2;

/* Clearances the build refuses to emit without, as multiples of the gap. */
const BAY_MIN = 1.0; // terminal ball to the stem it curls back over
const HEAD_CLEAR_MIN = 1.15; // head's nearest distance to the mast
const HEAD_DAYLIGHT_MIN = 1; // vertical daylight below the hook's terminal
const FORK_FLARE_MAX = 1.25; // filleted / unfilleted branch opening along the rail
const OUTLINE_TOL = 0.2; // design units; applies to mast and boat alike

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

const SHOULDER_BLEND = 0.1; // half-width of the curvature-continuous transition
const STEM_SHARE = 0.5; // of the half-spine's parameter range

// A local quintic matches position, velocity and acceleration at both ends.
// Tangency alone left an abrupt jump from the almost straight stem to the hook.
const rawUpperAt = (t) =>
  t <= STEM_SHARE
    ? cubicAt(stem.p0, stem.c1, stem.c2, stem.p3, t / STEM_SHARE)
    : hookAt((t - STEM_SHARE) / (1 - STEM_SHARE));
const blendLo = STEM_SHARE - SHOULDER_BLEND;
const blendHi = STEM_SHARE + SHOULDER_BLEND;
const blendSpan = blendHi - blendLo;
const jet = (f, t) => {
  const h = 1e-4;
  const a = f(t - h),
    b = f(t),
    c = f(t + h);
  return [
    b,
    V.mul(V.sub(c, a), blendSpan / (2 * h)),
    V.mul(V.add(V.sub(c, V.mul(b, 2)), a), blendSpan ** 2 / h ** 2),
  ];
};
const [bp0, bv0, ba0] = jet(rawUpperAt, blendLo);
const [bp1, bv1, ba1] = jet(rawUpperAt, blendHi);
const blendCoefficients = [0, 1].map((i) => {
  const a = bp0[i],
    b = bv0[i],
    c = ba0[i] / 2;
  const d = bp1[i] - a - b - c;
  const e = bv1[i] - b - 2 * c;
  const f = ba1[i] - 2 * c;
  return [a, b, c, 10 * d - 4 * e + f / 2, -15 * d + 7 * e - f, 6 * d - 3 * e + f / 2];
});
const upperAt = (t) => {
  if (t <= blendLo || t >= blendHi) return rawUpperAt(t);
  const u = (t - blendLo) / blendSpan;
  return blendCoefficients.map((coefficients) =>
    coefficients.reduceRight((value, coefficient) => value * u + coefficient, 0),
  );
};
const curvature = (f, t) => {
  const h = 1e-5;
  const a = f(t - h),
    b = f(t),
    c = f(t + h);
  const d = V.mul(V.sub(c, a), 1 / (2 * h));
  const dd = V.mul(V.add(V.sub(c, V.mul(b, 2)), a), 1 / h ** 2);
  return (d[0] * dd[1] - d[1] * dd[0]) / V.dist([0, 0], d) ** 3;
};
for (const t of [blendLo, blendHi]) {
  if (Math.abs(curvature(upperAt, t - 2e-5) - curvature(upperAt, t + 2e-5)) > 2e-5)
    throw new Error("Shoulder curvature discontinuity");
}

/** The whole spine: s in [-1,1]; the negative half is the 180 degree rotation. */
const spineAt = (s) => {
  if (s >= 0) return upperAt(s);
  const p = upperAt(-s);
  return [-p[0], -p[1]];
};

const H = 1e-4;
const clampS = (s) => Math.max(-1, Math.min(1, s));
const spineTangent = (s) => V.norm(V.sub(spineAt(clampS(s + H)), spineAt(clampS(s - H))));
const speedAt = (s) =>
  V.dist(spineAt(clampS(s + H)), spineAt(clampS(s - H))) / (clampS(s + H) - clampS(s - H));

/* ------------------------------------------------------------- the pen -- */

/* Quintic easing: both slope and acceleration vanish at each width knot. */
const smootherstep = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * t * (10 + t * (-15 + 6 * t)));
const between = (a, b, t) => a + (b - a) * smootherstep(t);

const R_MAX = STROKE_MAX / 2;
const R_SHOULDER = R_MAX * SHOULDER_F;
const R_WAIST = R_MAX * WAIST_F;
const R_BALL = R_MAX * BALL_F;
const S_WAIST = STEM_SHARE + (1 - STEM_SHARE) * WAIST_AT;

/* The last run is a quintic Hermite so the pen can still be
 * opening when it reaches the tip. That is what makes a ball read as a ball:
 * the terminal arc then wraps past a half turn instead of stopping at one. */
const hermiteUp = (y0, y1, m1, t) => {
  const t2 = t * t,
    t3 = t2 * t;
  const d = y1 - y0;
  return y0 + (10 * d - 4 * m1) * t3 + (-15 * d + 7 * m1) * t3 * t + (6 * d - 3 * m1) * t3 * t2;
};

const penAt = (s) => {
  const a = Math.abs(s);
  if (a <= STEM_SHARE) return between(R_MAX, R_SHOULDER, a / STEM_SHARE);
  if (a <= S_WAIST) {
    return between(R_SHOULDER, R_WAIST, (a - STEM_SHARE) / (S_WAIST - STEM_SHARE));
  }
  const t = (a - S_WAIST) / (1 - S_WAIST);
  return hermiteUp(R_WAIST, R_BALL, BALL_SWELL * (R_BALL - R_WAIST), t);
};

// Guard the profile's acceleration continuity as well as its visible width.
const penAcceleration = (t) => (penAt(t + 1e-5) - 2 * penAt(t) + penAt(t - 1e-5)) / 1e-10;
for (const t of [0, STEM_SHARE, S_WAIST]) {
  if (Math.abs(penAcceleration(t - 2e-5) - penAcceleration(t + 2e-5)) > 2)
    throw new Error("Pen width acceleration discontinuity");
}
const rawShoulder = Array.from({ length: 1001 }, (_, i) =>
  rawUpperAt(blendLo + (blendSpan * i) / 1000),
);
const shoulderDisplacement = Math.max(
  ...Array.from({ length: 201 }, (_, i) => {
    const t = blendLo + (blendSpan * i) / 200;
    return distToPolyline(upperAt(t), rawShoulder);
  }),
);
if (shoulderDisplacement > STROKE_MAX * 0.1)
  throw new Error("Shoulder blend changes the silhouette by more than a tenth of a stroke");

const dPen = (s) => (penAt(clampS(s + H)) - penAt(clampS(s - H))) / (clampS(s + H) - clampS(s - H));

/**
 * The boundary of the region swept by the pen.
 *
 * For a disc of radius r(s) riding a curve c(s), the swept region touches each
 * disc at c + r(-r'/|c'| T ± sqrt(1-(r'/|c'|)^2) N): a plain offset only when
 * the pen is not changing width. Using it rather than c ± rN is what makes the
 * terminals tangent, and — with `grow` — what makes the channel beside the mast
 * a true constant distance from the ink rather than from the spine.
 */
const penEdge = (s, side, grow = 0) => {
  const c = spineAt(s),
    t = spineTangent(s);
  const n = [t[1], -t[0]]; // screen-right of the upward spine
  const r = penAt(s) + grow;
  const k = -dPen(s) / speedAt(s);
  const m = Math.sqrt(Math.max(0, 1 - k * k));
  return V.add(c, V.add(V.mul(t, r * k), V.mul(n, side * r * m)));
};

/* ------------------------------------------------------- stroke outline -- */

const N = 1400;
const sampleS = Array.from({ length: N + 1 }, (_, i) => -1 + (2 * i) / N);
const sailSide = sampleS.map((s) => penEdge(s, 1));
const backSide = sampleS.map((s) => penEdge(s, -1));

const tangentsOf = (pts) => (i) =>
  V.norm(V.sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)]));

// Exact circular tangents at the terminal contacts, including in the fitted
// output. Chord estimates here would merely make the old notch very small.
const edgeTangent = (i) => {
  const chord = tangentsOf(sailSide)(i);
  if (i !== 0 && i !== N) return chord;
  const spoke = V.sub(sailSide[i], spineAt(sampleS[i]));
  const tangent = V.norm(V.perp(spoke));
  return V.dot(tangent, chord) > 0 ? tangent : V.mul(tangent, -1);
};
const sailChain = fitPath(sailSide, edgeTangent, OUTLINE_TOL);
// Rotate the emitted control points themselves: symmetry must survive fitting.
const backChain = sailChain.map((seg) => ({
  ...seg,
  p0: V.mul(seg.p0, -1),
  c1: V.mul(seg.c1, -1),
  c2: V.mul(seg.c2, -1),
  p3: V.mul(seg.p3, -1),
}));

/** The terminal: the pen's own last disc, closed around its tip. */
const terminal = (s) => {
  const c = spineAt(s),
    t = V.mul(spineTangent(s), Math.sign(s));
  const r = penAt(s);
  return { c, r, tip: V.add(c, V.mul(t, r)) };
};
const topBall = terminal(1);
const botBall = terminal(-1);

const integralD =
  `M${fmt(sailSide[0])}${chainToD(sailChain)}` +
  arcThrough(topBall.c, topBall.r, sailSide[N], topBall.tip, backSide[N]) +
  chainToD(backChain) +
  arcThrough(botBall.c, botBall.r, backSide[0], botBall.tip, sailSide[0]) +
  "Z";

const ballArc = (b, from, to) => {
  const a0 = Math.atan2(from[1] - b.c[1], from[0] - b.c[0]);
  const a1 = Math.atan2(b.tip[1] - b.c[1], b.tip[0] - b.c[0]);
  const a2 = Math.atan2(to[1] - b.c[1], to[0] - b.c[0]);
  const unwrap = (a, ref) => {
    let d = a - ref;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return ref + d;
  };
  const m = unwrap(a1, a0),
    e = unwrap(a2, m);
  const steps = Math.max(24, Math.ceil((Math.abs(e - a0) * b.r) / 0.5));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = a0 + ((e - a0) * i) / steps;
    return [b.c[0] + b.r * Math.cos(a), b.c[1] + b.r * Math.sin(a)];
  });
};

const iPts = [
  ...sailSide,
  ...backSide,
  ...ballArc(topBall, sailSide[N], backSide[N]),
  ...ballArc(botBall, backSide[0], sailSide[0]),
];

const sampleChain = (chain) =>
  chain.flatMap((seg) => {
    const points = [seg.p0, seg.c1, seg.c2, seg.p3].map((p) => p.map((n) => +n.toFixed(2)));
    const length =
      V.dist(points[0], points[1]) + V.dist(points[1], points[2]) + V.dist(points[2], points[3]);
    const steps = Math.max(8, Math.ceil(length / 0.5));
    return Array.from({ length: steps + 1 }, (_, i) => cubicAt(...points, i / steps));
  });
const iTop = Math.max(...iPts.map((p) => p[1]));
const iBottom = Math.min(...iPts.map((p) => p[1]));
const Hi = iTop - iBottom;

/** Convert a "fraction down from the top of the mark" into design-space y. */
const atFrac = (f) => iTop - f * Hi;

const GAP = GAP_F * Hi;
const DECK_LEN = DECK_LEN_F * Hi;
const SAIL_FOOT_LEN = SAIL_FOOT_LEN_F * Hi;

const R_HEAD = R_HEAD_F * R_MAX * 2;
const R_TACK = R_TACK_F * R_MAX * 2;
const R_CLEW = R_CLEW_F * R_MAX * 2;
const R_STERN = R_STERN_F * R_MAX * 2;
const R_BOW = R_BOW_F * R_MAX * 2;
const R_FOREFOOT = R_FOREFOOT_F * R_MAX * 2;
const R_KEEL_AFT = R_KEEL_AFT_F * R_MAX * 2;

/* ------------------------------------------------- the luff / stern rail -- */

/** Everywhere exactly GAP from the mast's ink: the same pen, one gap fatter. */
const luffAt = (s) => penEdge(s, 1, GAP);

// The luff doubles back inside each hook, so a plain bisection can latch onto a
// spurious crossing.  Walk down from the top and take the first one instead.
const SEARCH_HI = 0.6,
  SEARCH_LO = -0.8,
  SEARCH_STEPS = 3000;

const firstCrossing = (f) => {
  let prev = SEARCH_HI,
    fprev = f(prev);
  for (let i = 1; i <= SEARCH_STEPS; i++) {
    const s = SEARCH_HI + ((SEARCH_LO - SEARCH_HI) * i) / SEARCH_STEPS;
    const fs = f(s);
    if (Math.sign(fs) !== Math.sign(fprev)) {
      let lo = s,
        hi = prev;
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2;
        if (Math.sign(f(mid)) === Math.sign(fprev)) hi = mid;
        else lo = mid;
      }
      return (lo + hi) / 2;
    }
    prev = s;
    fprev = fs;
  }
  throw new Error("luff never crosses the target line");
};

const luffAtY = (y) => firstCrossing((s) => luffAt(s)[1] - y);

const luffSegment = (a, b, steps = 600) =>
  Array.from({ length: steps + 1 }, (_, i) => luffAt(a + ((b - a) * i) / steps));

/** A shallow circular arc, sagging to the right of its chord's travel. */
const shallowArc = (a, b, sag) => {
  const chord = V.sub(b, a),
    length = V.len(chord);
  if (!(sag > 0 && sag < length / 20 && sag <= 0.015 * Hi)) {
    throw new Error("boat curvature must stay gentle: sag <= 1.5% height and < 5% chord");
  }
  const r = (length * length) / (8 * sag) + sag / 2;
  const c = V.add(V.mul(V.add(a, b), 0.5), V.mul(V.perp(V.norm(chord)), r - sag));
  const start = Math.atan2(a[1] - c[1], a[0] - c[0]);
  const sweep = 2 * Math.asin(length / (2 * r));
  return { c, r, start, sweep };
};
const circleAt = (c, r, angle) => V.add(c, [r * Math.cos(angle), r * Math.sin(angle)]);
const sampleArc = ({ c, r, start, sweep }, steps = 400) =>
  Array.from({ length: steps + 1 }, (_, i) => circleAt(c, r, start + (sweep * i) / steps));

/* --------------------------------------------------------------- the hull -- */

const along = fromVertical(90 - DECK_ANGLE); // unit vector up the deck line

const sDl = luffAtY(atFrac(DECK_LEFT_YF));
const Dl = luffAt(sDl);
const Bt = V.add(Dl, V.mul(along, DECK_LEN));
const deckArc = shallowArc(Dl, Bt, DECK_SAG_F * Hi);
const deck = sampleArc(deckArc);

const sKl = luffAtY(atFrac(KEEL_YF));
const Kl = luffAt(sKl);

const lineIntersect = (p, d, q, e) => {
  const t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / (d[0] * e[1] - d[1] * e[0]);
  return V.add(p, V.mul(d, t));
};
const Kr = lineIntersect(Bt, fromVertical(180 + BOW_RAKE), Kl, [1, 0]);
const bow = sampleArc(shallowArc(Kr, Bt, BOW_SAG_F * Hi)).reverse();
const keel = sampleArc(shallowArc(Kl, Kr, KEEL_SAG_F * Hi)).reverse();

const hull = ringToPath(
  [
    { pts: luffSegment(sKl, sDl), r: R_KEEL_AFT, name: "keel-aft" },
    { pts: deck, r: R_STERN, name: "stern-top" },
    { pts: bow, r: R_BOW, name: "bow" },
    { pts: keel, r: R_FOREFOOT, name: "forefoot" },
  ],
  OUTLINE_TOL,
  "hull",
);

/* --------------------------------------------------------------- the sail -- */

// One circle, two radii: the sail foot is the deck's exact normal offset.
// The luff intersects that circle, so all three parts meet one channel system.
const footRadius = deckArc.r - GAP;
const sTack = firstCrossing((s) => V.dist(luffAt(s), deckArc.c) - footRadius);
const tack = luffAt(sTack);
const footStart = Math.atan2(tack[1] - deckArc.c[1], tack[0] - deckArc.c[0]);
const footArc = {
  c: deckArc.c,
  r: footRadius,
  start: footStart,
  sweep: SAIL_FOOT_LEN / footRadius,
};
const foot = sampleArc(footArc);
const clew = foot.at(-1);

const sHead = luffAtY(atFrac(SAIL_HEAD_YF));
const head = luffAt(sHead);

const leechLen = V.dist(head, clew);
const leechC1 = V.add(
  head,
  V.mul(fromVertical(180 - LEECH_HEAD_ANGLE), leechLen * LEECH_HEAD_PULL),
);
const leechC2 = V.add(
  clew,
  V.mul(fromVertical(180 - LEECH_CLEW_ANGLE), -leechLen * LEECH_CLEW_PULL),
);

/* The cubic's curvature numerator is a positive-weighted sum of the three
 * pairwise cross products of its control legs. Require all three to agree:
 * two neighbouring turns alone could miss a polygon winding past 180 degrees.
 * The leech is the mark's longest free curve, so enforce fairness here. */
{
  const legs = [V.sub(leechC1, head), V.sub(leechC2, leechC1), V.sub(clew, leechC2)];
  const turns = [
    [0, 1],
    [0, 2],
    [1, 2],
  ].map(([i, j]) => Math.sign(legs[i][0] * legs[j][1] - legs[i][1] * legs[j][0]));
  if (!turns[0] || !turns.every((turn) => turn === turns[0])) {
    const deg = (v) => (Math.atan2(v[1], v[0]) * 180) / Math.PI;
    throw new Error(
      "leech control polygon is not convex: the curve would carry an " +
        `inflection. Its legs run ${legs.map((l) => deg(l).toFixed(1)).join(", ")} ` +
        "degrees, and the middle one has to lie between the outer two. Shorten " +
        "LEECH_HEAD_PULL or LEECH_CLEW_PULL, or widen the angle between " +
        "LEECH_HEAD_ANGLE and LEECH_CLEW_ANGLE.",
    );
  }
}

const leech = Array.from({ length: 401 }, (_, i) =>
  cubicAt(head, leechC1, leechC2, clew, 1 - i / 400),
); // clew -> head

const sail = ringToPath(
  [
    { pts: luffSegment(sHead, sTack), r: R_HEAD, name: "head" },
    { pts: foot, r: R_TACK, name: "tack" },
    { pts: leech, r: R_CLEW, name: "clew" },
  ],
  OUTLINE_TOL,
  "sail",
);

/* ------------------------------------------------------- what must hold -- */

/** Signed distance from a point to the mast's ink (negative means inside). */
const inkClearance = (p) => {
  let best = Infinity;
  for (let i = 0; i <= 900; i++) {
    const s = -1 + (2 * i) / 900;
    best = Math.min(best, V.dist(p, spineAt(s)) - penAt(s));
  }
  return best;
};

const check = (ok, message) => {
  if (!ok) throw new Error(message);
};

/* 1. The pen must never widen faster than it travels, or its envelope contact
 *    ceases to exist. That alone cannot exclude curvature-induced folds: also
 *    check forward progression on both dense sides and simple emitted rings. */
let penSlope = 0;
for (let i = 0; i <= 600; i++) {
  const s = -1 + (2 * i) / 600;
  penSlope = Math.max(penSlope, Math.abs(dPen(s)) / speedAt(s));
}
check(
  penSlope < 0.9,
  `the pen opens at ${penSlope.toFixed(2)} of its own travel: past 1 the swept ` +
    `region has no envelope and the outline self-intersects. Lower BALL_SWELL, ` +
    `raise WAIST_F, or move WAIST_AT earlier.`,
);
let envelopeAdvance = Infinity;
for (const side of [sailSide, backSide]) {
  for (let i = 1; i < side.length; i++) {
    const direction = spineTangent((sampleS[i] + sampleS[i - 1]) / 2);
    envelopeAdvance = Math.min(
      envelopeAdvance,
      V.dot(V.norm(V.sub(side[i], side[i - 1])), direction),
    );
  }
}
check(envelopeAdvance > 0.1, "the pen envelope folds back along the spine");
// Reconstruct the terminal circles SVG gets after decimal serialization,
// selecting the centre nearest the design circle (the same sweep/large flags).
const rounded = (p) => p.map((n) => +n.toFixed(2));
const renderedTerminal = (ball, from, to) => {
  from = rounded(from);
  to = rounded(to);
  const r = +ball.r.toFixed(2),
    chord = V.sub(to, from);
  check(V.len(chord) < 2 * r, "rounding collapsed a terminal's circular arc");
  const mid = V.mul(V.add(from, to), 0.5);
  const offset = V.mul(V.perp(V.norm(chord)), Math.sqrt(r * r - V.dot(chord, chord) / 4));
  const c = [V.add(mid, offset), V.sub(mid, offset)].sort(
    (a, b) => V.dist(a, ball.c) - V.dist(b, ball.c),
  )[0];
  const tip = V.add(c, V.mul(V.norm(V.sub(ball.tip, ball.c)), r));
  const b = { c, r, tip },
    pts = ballArc(b, from, to);
  pts[0] = from;
  pts[pts.length - 1] = to;
  return { ...b, pts };
};
const topRendered = renderedTerminal(topBall, sailSide[N], backSide[N]);
const bottomRendered = renderedTerminal(botBall, backSide[0], sailSide[0]);
const topArc = topRendered.pts,
  bottomArc = bottomRendered.pts;
assertSimpleOutline(
  [...sampleChain(sailChain), ...topArc, ...sampleChain(backChain), ...bottomArc],
  "integral",
);
assertSimpleOutline(sail.pts, "sail");
assertSimpleOutline(hull.pts, "hull");

/* 2. A terminal is a ball only while the pen is still opening when it lands;
 *    let it taper instead and the arc shrinks below a half turn and reads as a
 *    cut-off stroke. */
check(
  dPen(1 - 1e-3) > 0,
  "the pen is closing at the terminal, so the ball is a taper. Raise BALL_F " +
    "above WAIST_F, or raise BALL_SWELL.",
);

/* 3. Check all four emitted Bezier-to-ball joins, not a chord on the source
 *    outline. Both balls must be tangent after fitting as well as before it. */
let terminalOff = 0;
let renderedTerminalOff = 0;
{
  for (const [chain, start, end] of [
    [sailChain, botBall, topBall],
    [backChain, topBall, botBall],
  ]) {
    const first = chain[0],
      last = chain.at(-1);
    for (const [p, handle, ball] of [
      [first.p0, first.c1, start],
      [last.p3, last.c2, end],
    ]) {
      terminalOff = Math.max(
        terminalOff,
        Math.abs(V.dot(V.norm(V.sub(handle, p)), V.norm(V.sub(p, ball.c)))),
      );
    }
  }
  check(terminalOff < 1e-8, "a fitted terminal join is not tangent to its ball");
  for (const [chain, start, end] of [
    [sailChain, bottomRendered, topRendered],
    [backChain, topRendered, bottomRendered],
  ]) {
    const first = chain[0],
      last = chain.at(-1);
    for (const [p, handle, ball] of [
      [first.p0, first.c1, start],
      [last.p3, last.c2, end],
    ]) {
      renderedTerminalOff = Math.max(
        renderedTerminalOff,
        Math.abs(
          V.dot(V.norm(V.sub(rounded(handle), rounded(p))), V.norm(V.sub(rounded(p), ball.c))),
        ),
      );
    }
  }
  check(
    (Math.asin(renderedTerminalOff) * 180) / Math.PI < 0.1,
    "decimal serialization loses the terminal's tangent join",
  );
}

/* 4. The hook has to stay open. The bay is the passage between the terminal
 *    ball and the stem it curls back over; once it closes past the channel
 *    width the counter closes and the whole top goes solid at small sizes. */
let bay = Infinity;
for (let i = 0; i <= 900; i++) {
  const s = -1 + (STEM_SHARE + 1) * (i / 900);
  bay = Math.min(bay, V.dist(topBall.c, spineAt(s)) - topBall.r - penAt(s));
}
check(
  bay >= BAY_MIN * GAP,
  `the hook's bay is ${bay.toFixed(1)} against a gap of ${GAP.toFixed(1)}: the ` +
    `ball has closed the counter. Raise HOOK_R1, lower BALL_F, or shorten ` +
    `HOOK_SWEEP.`,
);

/* 5. Nothing may come nearer the mast than the channel. The luff is exactly one
 *    gap out by construction; this catches the ends that are not — above all
 *    the sail's head, which used to run up into the hook. */
const headClear = Math.min(...sail.pts.map(inkClearance));
check(
  headClear >= 0.98 * GAP,
  `the sail comes within ${headClear.toFixed(1)} of the mast against a gap of ` +
    `${GAP.toFixed(1)}.`,
);
const hullClear = Math.min(...hull.pts.map(inkClearance));
check(
  hullClear >= 0.98 * GAP,
  `the hull comes within ${hullClear.toFixed(1)} of the mast against a gap of ` +
    `${GAP.toFixed(1)}.`,
);

/* 6. Nearest distance alone cannot keep the head out of the counter: the
 *    nearest ink can be the stem beside it. Its highest point must ALSO sit a
 *    full gap below the lowest hook ink. This gives the counter its own sky. */
const headTip = sail.pts.reduce((a, b) => (b[1] > a[1] ? b : a));
const headGap = inkClearance(headTip);
check(
  headGap >= HEAD_CLEAR_MIN * GAP,
  `the sail's head clears the hook by ${headGap.toFixed(1)} against a gap of ` +
    `${GAP.toFixed(1)}. Increase SAIL_HEAD_YF or blunt the head further.`,
);
let hookBottom = Infinity;
for (let i = 0; i <= 600; i++) {
  const s = STEM_SHARE + ((1 - STEM_SHARE) * i) / 600;
  hookBottom = Math.min(hookBottom, spineAt(s)[1] - penAt(s));
}
const headDaylight = hookBottom - headTip[1];
check(
  headDaylight >= HEAD_DAYLIGHT_MIN * GAP,
  `the head sits only ${headDaylight.toFixed(1)} below the hook against a gap ` +
    `of ${GAP.toFixed(1)}. Increase SAIL_HEAD_YF to leave the counter clear.`,
);

/* 7. Concentric arcs keep the curved foot/deck channel constant along its
 *    normals. Check their offset cannot fold and that corner fillets or fitted
 *    curves have not eaten the gap. */
check(
  footRadius > 0 && GAP / deckArc.r < 0.02,
  "the deck is too curved for a gentle, regular foot offset",
);
check(
  Math.abs(deckArc.r - footRadius - GAP) < 1e-8,
  "the foot and deck must share a centre and differ by exactly one gap",
);
let deckGap = Infinity;
for (const p of sail.pts) {
  deckGap = Math.min(deckGap, distToPolyline(p, deck));
}
check(
  deckGap >= 0.98 * GAP,
  `the sail's foot comes within ${deckGap.toFixed(1)} of the deck against a gap ` +
    `of ${GAP.toFixed(1)}.`,
);

/* 8. A three-way channel necessarily opens where it branches. Bound that
 *    opening, instead of claiming a minimum-clearance check prevents a flare.
 *    Measure along the shared rail between the two fillets' contact points. */
const rail = luffSegment(sHead, sKl, 1800);
const railContact = (shape, name) => {
  const arc = shape.edges.find((e) => e.name === name).arc;
  return [arc.from, arc.to].sort((a, b) => distToPolyline(a, rail) - distToPolyline(b, rail))[0];
};
const tackContact = railContact(sail, "tack");
const sternContact = railContact(hull, "stern-top");
const forkRail = luffSegment(luffAtY(tackContact[1]), luffAtY(sternContact[1]), 100);
const railLength = (pts) => pts.slice(1).reduce((sum, p, i) => sum + V.dist(p, pts[i]), 0);
const forkWidth = railLength(forkRail);
const forkBase = railLength(luffSegment(sTack, sDl, 100));
check(R_TACK === R_STERN, "the two corners facing the fork must share a radius");
check(
  forkWidth <= FORK_FLARE_MAX * forkBase,
  `fillets widen the fork by ${(forkWidth / forkBase).toFixed(2)} times; ` +
    `limit is ${FORK_FLARE_MAX}. Reduce the paired tack/stern radius.`,
);

/* ------------------------------------------------------------- assemble -- */

const probe = [...iPts, ...sail.pts, ...hull.pts];
const minX = Math.min(...probe.map((p) => p[0]));
const maxX = Math.max(...probe.map((p) => p[0]));
const minY = Math.min(...probe.map((p) => p[1]));
const maxY = Math.max(...probe.map((p) => p[1]));

const PAD_F = 0.04;
const w = maxX - minX,
  h = maxY - minY;
const box = Math.max(w, h) * (1 + PAD_F * 2);
const offX = -minX + (box - w) / 2;
const offY = -minY + (box - h) / 2;

const B = (n) => +n.toFixed(2);

/* One body string, used verbatim by the component, the icons, the preview and
 * the social card.  They used to rebuild it each from the pieces, and the mast
 * quietly picked up an 18-unit stroke in three of the four. */
const body = `<path d="${integralD}"/>` + `<path d="${sail.d}"/>` + `<path d="${hull.d}"/>`;

const out = {
  body,
  integralD,
  sailD: sail.d,
  hullD: hull.d,
  box: B(box),
  offX: B(offX),
  offY: B(offY),
};
writeFileSync(new URL(".out/logo.json", import.meta.url), JSON.stringify(out, null, 2));

/* --- emit the React component and the standalone icon ------------------- */

const component = `/* Generated by tools/build-logo.mjs — edit the dials there, not this file.
 *
 * The mark is authored y-up (the integral's inflection at the origin) and
 * flipped into SVG's y-down space by the group transform.  Three filled paths,
 * no stroke: every corner is a real fillet in the outline, so the mark cannot
 * render differently here than it does in the favicon.
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
      <g transform="translate(${B(offX)} ${B(offY)}) scale(1 -1)" fill="currentColor">
        <path d="${integralD}" />
        <path d="${sail.d}" />
        <path d="${hull.d}" />
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
    `translate(${B(offX)} ${B(offY)}) scale(1 -1)" fill="${fg}">${body}</g></svg>`
  );
};

writeFileSync(
  new URL("../app/icon.svg", import.meta.url),
  iconSvg({ fg: "#F7EFDF", bg: "#0C3D55", radius: 215, inset: 0.1 }),
);
writeFileSync(
  new URL(".out/apple-icon.svg", import.meta.url),
  iconSvg({ fg: "#F7EFDF", bg: "#0C3D55", radius: 0, inset: 0.235 }),
);
writeFileSync(
  new URL("../public/mark.svg", import.meta.url),
  iconSvg({ fg: "currentColor", inset: 0 }),
);

const f = (n) => +n.toFixed(3);
console.log(
  JSON.stringify(
    {
      shoulderDisplacement: f(shoulderDisplacement),
      integralHeight: +Hi.toFixed(1),
      strokeOverHeight: f(STROKE_MAX / Hi), // original 0.092
      ballOverStroke: f(BALL_F),
      waistOverStroke: f(WAIST_F),
      gap: +GAP.toFixed(1),
      markAspect: f(w / h), // original 0.957
      segments: sailChain.length + backChain.length,
      bowTipFrac: f((iTop - Bt[1]) / Hi), // original 0.685
      keelFrac: f((iTop - Kl[1]) / Hi),
      clewFrac: f((iTop - clew[1]) / Hi), // original 0.665
      headFrac: f((iTop - headTip[1]) / Hi), // original 0.170, blunted
      penSlope: f(penSlope), // must stay under 1
      bayOverGap: f(bay / GAP), // must stay over BAY_MIN
      headClearOverGap: f(headGap / GAP), // must stay over HEAD_CLEAR_MIN
      headDaylightOverGap: f(headDaylight / GAP),
      forkWidthOverGap: f(forkWidth / GAP),
      forkExpansion: f(forkWidth / forkBase),
      terminalTangentErrorDeg: f((Math.asin(terminalOff) * 180) / Math.PI),
      renderedTerminalTangentErrorDeg: f((Math.asin(renderedTerminalOff) * 180) / Math.PI),
      fitErrorBound: f(
        Math.max(
          ...sailChain.map((s) => s.error),
          ...[sail, hull].flatMap((shape) =>
            shape.edges.flatMap((e) => (e.chain ?? []).map((s) => s.error)),
          ),
        ),
      ),
      deckSagOverHeight: DECK_SAG_F,
      keelSagOverHeight: KEEL_SAG_F,
      bowSagOverHeight: BOW_SAG_F,
      deckClearOverGap: f(deckGap / GAP),
      envelopeMinForwardCos: f(envelopeAdvance),
    },
    null,
    2,
  ),
);
