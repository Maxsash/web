/* Closed outlines with real per-corner fillets.
 *
 * The mark used to round its corners by stroking the fill: one radius for every
 * corner, the geometry pre-shrunk to compensate, and the rounding applied on the
 * *outside* of the vertex so a sharp corner such as the bow grew a blob.  That
 * also meant the painted shape depended on a stroke attribute, which is how the
 * favicon and the React component drifted apart.
 *
 * Here an outline is a ring of edges, each a dense polyline, and a fillet is a
 * real circle tangent to both edges: offset each edge inward by r, intersect the
 * offsets to get the centre, and the tangent points fall out of that same
 * intersection.  Every corner can carry its own radius, and the result is a
 * plain filled path with exact `A` arcs — no stroke anywhere.
 */
import { V, cubicAt, fitPath, chainToD, fmt, r2 } from "./geom.mjs";

const requireGeometry = (ok, message) => { if (!ok) throw new Error(message); };
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const rounded = (p) => p.map((x) => Number(r2(x)));

/** Signed area; positive means counter-clockwise in a y-up frame. */
export function signedArea(pts) {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/** Unit normal to the left of travel at each vertex of a polyline (y-up). */
function leftNormals(pts) {
  return pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const t = V.norm(V.sub(b, a));
    return [-t[1], t[0]];
  });
}

const offsetLeft = (pts, d) => {
  const n = leftNormals(pts);
  return pts.map((p, i) => V.add(p, V.mul(n[i], d)));
};

/** Intersection of segments p→p2 and q→q2, as {t, u, at} or null. */
function segCross(p, p2, q, q2) {
  const r = V.sub(p2, p), s = V.sub(q2, q);
  const den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-12) return null;
  const d = V.sub(q, p);
  const t = (d[0] * s[1] - d[1] * s[0]) / den;
  const u = (d[0] * r[1] - d[1] * r[0]) / den;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { t, u, at: V.add(p, V.mul(r, t)) };
}

const lerpPt = (a, b, t) => V.add(a, V.mul(V.sub(b, a), t));

/**
 * Fillet the corner where polyline `a` ends and polyline `b` begins.  Both must
 * run with the shape's interior on their left.  Returns the trimmed edges and
 * the arc between them, or throws if no tangent circle of radius `r` fits.
 */
export function filletCorner(a, b, r, name) {
  requireGeometry(Number.isFinite(r) && r >= 0, `${name}: invalid fillet radius`);
  requireGeometry(V.dist(a[a.length - 1], b[0]) < 1e-7,
    `${name}: the two corner edges do not share an endpoint`);
  if (!(r > 0)) return { a, b, arc: null };
  const ai = offsetLeft(a, r), bi = offsetLeft(b, r);
  const lengths = (pts) => {
    const d = [0];
    for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + V.dist(pts[i - 1], pts[i]));
    return d;
  };
  const aLengths = lengths(a), bLengths = lengths(b);

  // The offsets cross once near the corner; take the crossing closest to it,
  // which is the tangent circle that actually sits in this corner.
  let best = null;
  for (let i = ai.length - 2; i >= 0; i--) {
    for (let j = 0; j < bi.length - 1; j++) {
      const x = segCross(ai[i], ai[i + 1], bi[j], bi[j + 1]);
      if (!x) continue;
      // Measure travel, not sample indices: straight and curved edges can
      // have different densities without changing which circle is chosen.
      const cost = aLengths[aLengths.length - 1] - aLengths[i] -
        x.t * (aLengths[i + 1] - aLengths[i]) + bLengths[j] +
        x.u * (bLengths[j + 1] - bLengths[j]);
      if (!best || cost < best.cost) best = { cost, i, j, ...x };
    }
  }
  if (!best) {
    throw new Error(
      `no fillet of radius ${r} fits the ${name} corner: the inward offsets of ` +
      `its two edges never meet. Lower that radius, or open the corner.`,
    );
  }

  // Interpolating sampled unit normals introduces a small radius error. Bound
  // that error, project to the exact circle, then constrain the fitted edge's
  // end tangent to that circle when emitting it below. This keeps the emitted
  // union tangent rather than merely hoping the dense source samples are.
  const onCircle = (p) => {
    const spoke = V.sub(p, best.at);
    requireGeometry(Math.abs(V.len(spoke) - r) <= Math.max(1e-6, r * 0.001),
      `${name}: fillet sampling is too coarse to locate its tangent circle`);
    return V.add(best.at, V.mul(V.norm(spoke), r));
  };
  const ta = onCircle(lerpPt(a[best.i], a[best.i + 1], best.t));
  const tb = onCircle(lerpPt(b[best.j], b[best.j + 1], best.u));
  const ra = V.norm(V.sub(ta, best.at)), rb = V.norm(V.sub(tb, best.at));
  requireGeometry(cross(ra, rb) > 0,
    `${name}: the requested fillet is not a convex interior corner`);
  const aTangent = V.norm(V.sub(a[best.i + 1], a[best.i]));
  const bTangent = V.norm(V.sub(b[best.j + 1], b[best.j]));
  const tangentError = Math.max(Math.abs(V.dot(ra, aTangent)), Math.abs(V.dot(rb, bTangent)));
  requireGeometry(tangentError < 0.02,
    `${name}: fillet source edges are too coarse to resolve their tangents`);
  return {
    a: [...a.slice(0, best.i + 1), ta],
    b: [tb, ...b.slice(best.j + 1)],
    arc: { c: best.at, r, from: ta, to: tb, name, sourceTangentError: tangentError },
  };
}

const TWO_PI = Math.PI * 2;
const norm = (x) => ((x % TWO_PI) + TWO_PI) % TWO_PI;

/** `A` command for a fillet arc; always the minor arc, so large-arc is 0. */
function arcCmd({ c, r, from, to }) {
  const turn = cross(V.sub(from, c), V.sub(to, c));
  return `A${r2(r)},${r2(r)} 0 0,${turn > 0 ? 1 : 0} ${fmt(to)}`;
}

/** Points along a fillet arc, for bounds and clearance checks. */
function arcPoints({ c, r, from, to }, steps = 12) {
  const a0 = Math.atan2(from[1] - c[1], from[0] - c[0]);
  const a1 = Math.atan2(to[1] - c[1], to[0] - c[0]);
  let d = a1 - a0;
  while (d > Math.PI) d -= TWO_PI;
  while (d < -Math.PI) d += TWO_PI;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = a0 + (d * i) / steps;
    return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
  });
}

/** Reconstruct the minor CCW circle SVG renders after decimal serialization. */
function emittedFillet(arc) {
  const from = rounded(arc.from), to = rounded(arc.to), r = Number(r2(arc.r));
  const chord = V.sub(to, from), half = V.len(chord) / 2;
  requireGeometry(half > 0 && half <= r,
    `${arc.name}: decimal serialization collapsed or enlarged a fillet`);
  const c = V.add(V.mul(V.add(from, to), 0.5),
    V.mul(V.perp(V.norm(chord)), Math.sqrt(r * r - half * half)));
  return { ...arc, c, r, from, to };
}

/**
 * An arc that is made to pass through `via`, so a terminal ball may wrap past a
 * half turn without the sweep flags guessing wrong.
 */
export function arcThrough(c, r, from, via, to) {
  requireGeometry(r > 0 && Number.isFinite(r) && [from, via, to].every((p) =>
    Math.abs(V.dist(p, c) - r) < Math.max(1e-7, r * 1e-7)),
  "a terminal arc needs three distinct points on its circle");
  const ang = (p) => Math.atan2(p[1] - c[1], p[0] - c[0]);
  const a0 = ang(from), dv = norm(ang(via) - a0), dt = norm(ang(to) - a0);
  requireGeometry(dt > 1e-9 && dv > 1e-9 && Math.abs(dt - dv) > 1e-9,
    "a terminal arc needs three distinct points on its circle");
  const ccw = dv < dt;                       // going positive reaches `via` first
  const span = ccw ? dt : TWO_PI - dt;
  return `A${r2(r)},${r2(r)} 0 ${span > Math.PI ? 1 : 0},${ccw ? 1 : 0} ${fmt(to)}`;
}

const tangentsOf = (pts) => (i) =>
  V.norm(V.sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)]));

/**
 * Build a closed filled path from a ring of edges.
 *
 * `edges` is [{ pts, r }, ...] where `pts` is a dense polyline and `r` is the
 * fillet radius at the corner where that edge *starts*.  Consecutive edges must
 * share an endpoint.  The ring is reoriented counter-clockwise first, so every
 * fillet lands inside the shape whichever way it was written.
 */
export function ringToPath(edges, tol = 0.25, label = "shape") {
  let ring = edges.map((e) => ({ pts: [...e.pts], r: e.r ?? 0, name: e.name ?? label }));

  requireGeometry(ring.length >= 3 && ring.every((e) => e.pts.length >= 2 &&
    e.pts.every((p) => p.length === 2 && p.every(Number.isFinite))),
  `${label}: an outline needs at least three finite edges`);
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    requireGeometry(V.dist(a.pts[a.pts.length - 1], b.pts[0]) < 1e-7,
      `${label}: consecutive outline edges do not share an endpoint`);
  }

  const all = ring.flatMap((e) => e.pts);
  requireGeometry(Math.abs(signedArea(all)) > 1e-7, `${label}: the outline has zero area`);
  if (signedArea(all) < 0) {
    // Reverse: each edge flips, the order flips, and a corner radius belongs to
    // the edge that now starts there — which is the one that used to end there.
    const corners = ring.map((e) => ({ r: e.r, name: e.name }));
    ring = ring.map((e, i) => ({
      pts: [...e.pts].reverse(),
      ...corners[(i + 1) % corners.length],
    })).reverse();
  }

  for (let i = 0; i < ring.length; i++) {
    const j = (i + 1) % ring.length;
    const cut = filletCorner(ring[i].pts, ring[j].pts, ring[j].r,
      `${ring[j].name}/${label}`);
    ring[i].pts = cut.a;
    ring[j].pts = cut.b;
    ring[j].arc = cut.arc;
  }

  let d = `M${fmt(ring[0].pts[0])}`;
  const pts = [], sourcePts = [], fillets = [];
  for (let i = 0; i < ring.length; i++) {
    const e = ring[i];
    const next = ring[(i + 1) % ring.length];
    const sourceTangents = tangentsOf(e.pts);
    const startTangent = e.arc && V.norm(V.perp(V.sub(e.arc.to, e.arc.c)));
    const endTangent = next.arc && V.norm(V.perp(V.sub(next.arc.from, next.arc.c)));
    const tangentAt = (j) => j === 0 && startTangent ? startTangent
      : j === e.pts.length - 1 && endTangent ? endTangent : sourceTangents(j);
    const straight = e.pts.length <= 2 || isStraight(e.pts);
    if (straight) {
      const t = V.norm(V.sub(e.pts[e.pts.length - 1], e.pts[0]));
      requireGeometry((!startTangent || V.dot(t, startTangent) > 1 - 1e-6) &&
        (!endTangent || V.dot(t, endTangent) > 1 - 1e-6),
      `${e.name}/${label}: a straight edge loses tangency at its fillet`);
      d += `L${fmt(e.pts[e.pts.length - 1])}`;
      const from = rounded(e.pts[0]), to = rounded(e.pts[e.pts.length - 1]);
      const steps = Math.max(1, Math.ceil(V.dist(from, to) / 0.5));
      for (let j = 0; j <= steps; j++) pts.push(lerpPt(from, to, j / steps));
    } else {
      const chain = fitPath(e.pts, tangentAt, tol);
      d += chainToD(chain);
      // Clearance and silhouette probes must inspect the fitted outline too.
      // The fitter bounds every point of it against the source to `tol`.
      e.emittedChain = chain.map((s) => ({
        p0: rounded(s.p0), c1: rounded(s.c1), c2: rounded(s.c2), p3: rounded(s.p3),
      }));
      for (const s of e.emittedChain) {
        const length = V.dist(s.p0, s.c1) + V.dist(s.c1, s.c2) + V.dist(s.c2, s.p3);
        const steps = Math.max(8, Math.ceil(length / 0.5));
        for (let j = 0; j <= steps; j++) pts.push(cubicAt(s.p0, s.c1, s.c2, s.p3, j / steps));
      }
      e.chain = chain;
    }
    sourcePts.push(...e.pts);
    if (next.arc) {
      d += arcCmd(next.arc);
      const emitted = emittedFillet(next.arc);
      const steps = Math.max(12, Math.ceil(Math.PI * next.arc.r / 0.5));
      pts.push(...arcPoints(emitted, steps)); sourcePts.push(...arcPoints(next.arc, steps));
      fillets.push({ ...next.arc, emitted });
    }
  }
  // Finally check what SVG actually receives, including decimal rounding of
  // both handles and circles. Keep the error well below one degree at a join.
  const edgeTangent = (edge, end) => {
    if (!edge.emittedChain) return V.norm(V.sub(rounded(edge.pts[edge.pts.length - 1]), rounded(edge.pts[0])));
    const s = end ? edge.emittedChain[edge.emittedChain.length - 1] : edge.emittedChain[0];
    return V.norm(end ? V.sub(s.p3, s.c2) : V.sub(s.c1, s.p0));
  };
  const joinAngles = [];
  for (let i = 0; i < ring.length; i++) {
    if (!ring[i].arc) continue;
    const arc = emittedFillet(ring[i].arc);
    const angle = (a, b) => Math.abs(Math.atan2(cross(a, b), V.dot(a, b))) * 180 / Math.PI;
    const into = angle(edgeTangent(ring[(i + ring.length - 1) % ring.length], true), V.perp(V.sub(arc.from, arc.c)));
    const out = angle(V.perp(V.sub(arc.to, arc.c)), edgeTangent(ring[i], false));
    requireGeometry(Math.max(into, out) < 0.5,
      `${arc.name}: the emitted outline loses tangency at its fillet (${Math.max(into, out).toFixed(2)} degrees)`);
    joinAngles.push({ name: arc.name, into, out });
  }
  return { d: `${d}Z`, pts, sourcePts, fillets, edges: ring, joinAngles };
}

/** True when every sample sits on the chord, so the edge can be one `L`. */
function isStraight(pts, tol = 0.05) {
  const a = pts[0], b = pts[pts.length - 1];
  const ab = V.sub(b, a), l = V.len(ab) || 1;
  return pts.every((p) => {
    const d = V.sub(p, a);
    return Math.abs((d[0] * ab[1] - d[1] * ab[0]) / l) <= tol;
  });
}

/** Shortest distance from `p` to a polyline, for clearance checks. */
export function distToPolyline(p, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], ab = V.sub(pts[i + 1], a);
    const l2 = V.dot(ab, ab) || 1;
    const t = Math.max(0, Math.min(1, V.dot(V.sub(p, a), ab) / l2));
    best = Math.min(best, V.dist(p, V.add(a, V.mul(ab, t))));
  }
  return best;
}

/**
 * Assert that dense samples form one simple closed boundary. Adjacent duplicate
 * samples (including a repeated closing point) are harmless and are stripped;
 * all other crossings, touches and collinear overlaps are errors. Returns the
 * cleaned ring so callers can reuse precisely the boundary that was checked.
 *
 * This checks the sampled outline, not an analytic curve between its samples.
 * Call it on samples of the emitted geometry, with a density appropriate to
 * its smallest feature, alongside the fitter's whole-curve error bound.
 */
export function assertSimpleOutline(pts, label = "outline") {
  requireGeometry(pts.length >= 3 && pts.every((p) => p.length === 2 && p.every(Number.isFinite)),
    `${label}: a closed outline needs at least three finite points`);
  const minX = Math.min(...pts.map((p) => p[0])), maxX = Math.max(...pts.map((p) => p[0]));
  const minY = Math.min(...pts.map((p) => p[1])), maxY = Math.max(...pts.map((p) => p[1]));
  const eps = Math.max(1e-8, Math.max(maxX - minX, maxY - minY) * 1e-9);
  const ring = [];
  for (const p of pts) if (!ring.length || V.dist(p, ring[ring.length - 1]) > eps) ring.push(p);
  if (ring.length > 1 && V.dist(ring[0], ring[ring.length - 1]) <= eps) ring.pop();
  requireGeometry(ring.length >= 3, `${label}: its closed outline collapses after duplicate removal`);

  const segments = ring.map((a, i) => {
    const b = ring[(i + 1) % ring.length];
    // Neighbouring segments may meet at their common vertex, but may not turn
    // back and overlap one another. The ordinary nonadjacent test skips them.
    const prev = V.sub(ring[(i + ring.length - 1) % ring.length], a), next = V.sub(b, a);
    requireGeometry(!(V.dot(prev, next) > 0 && Math.abs(cross(prev, next)) <= eps * Math.max(V.len(prev), V.len(next))),
      `${label}: adjacent segments double back at ${fmt(a)}`);
    return { a, b, i, minX: Math.min(a[0], b[0]), maxX: Math.max(a[0], b[0]),
      minY: Math.min(a[1], b[1]), maxY: Math.max(a[1], b[1]) };
  }).sort((a, b) => a.minX - b.minX);

  const side = (a, b, p) => {
    const value = cross(V.sub(b, a), V.sub(p, a)), tolerance = eps * V.dist(a, b);
    return value > tolerance ? 1 : value < -tolerance ? -1 : 0;
  };
  const on = (p, s) => side(s.a, s.b, p) === 0 && p[0] >= s.minX - eps &&
    p[0] <= s.maxX + eps && p[1] >= s.minY - eps && p[1] <= s.maxY + eps;
  const touches = (a, b) => {
    const a0 = side(a.a, a.b, b.a), a1 = side(a.a, a.b, b.b);
    const b0 = side(b.a, b.b, a.a), b1 = side(b.a, b.b, a.b);
    return (a0 * a1 < 0 && b0 * b1 < 0) || on(a.a, b) || on(a.b, b) || on(b.a, a) || on(b.b, a);
  };
  // Sorting by x bounds lets most distant segment pairs be skipped, without
  // assuming that a hook or a strongly curved luff is monotone in either axis.
  for (let i = 0; i < segments.length; i++) {
    const a = segments[i];
    for (let j = i + 1; j < segments.length && segments[j].minX <= a.maxX + eps; j++) {
      const b = segments[j], delta = Math.abs(a.i - b.i);
      if (delta === 1 || delta === ring.length - 1 || a.maxY + eps < b.minY || b.maxY + eps < a.minY) continue;
      requireGeometry(!touches(a, b),
        `${label}: nonadjacent segments ${a.i} and ${b.i} cross, touch or overlap ` +
        `near ${fmt(a.a)} / ${fmt(b.a)}`);
    }
  }
  requireGeometry(Math.abs(signedArea(ring)) > eps * eps,
    `${label}: its closed outline has no enclosed area`);
  return ring;
}
