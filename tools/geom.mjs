/* Shared 2D helpers: vectors, cubic sampling, and least-squares Bezier fitting.
   Used by the logo and wave generators so both emit compact, smooth paths. */

export const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, k) => [a[0] * k, a[1] * k],
  len: (a) => Math.hypot(a[0], a[1]),
  norm: (a) => {
    const l = Math.hypot(a[0], a[1]) || 1;
    return [a[0] / l, a[1] / l];
  },
  dot: (a, b) => a[0] * b[0] + a[1] * b[1],
  // +90 degrees counter-clockwise in a y-up frame
  perp: (a) => [-a[1], a[0]],
  dist: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]),
};

export const rad = (deg) => (deg * Math.PI) / 180;

/** Direction that is `deg` clockwise from straight up, in a y-up frame. */
export const fromVertical = (deg) => [Math.sin(rad(deg)), Math.cos(rad(deg))];

export function cubicAt(p0, c1, c2, p3, t) {
  const u = 1 - t;
  const a = u * u * u,
    b = 3 * u * u * t,
    c = 3 * u * t * t,
    d = t * t * t;
  return [
    a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0],
    a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1],
  ];
}

/**
 * Fit one cubic through `pts`, solving the two handle lengths by least squares
 * (Schneider). t0 points forward; t1 points backwards, into the curve from its
 * endpoint. Keep that convention both in the solve and in the emitted handle.
 */
function fitOne(pts, t0, t1) {
  const p0 = pts[0],
    p3 = pts[pts.length - 1];
  // chord-length parametrisation
  const u = [0];
  for (let i = 1; i < pts.length; i++) u.push(u[i - 1] + V.dist(pts[i], pts[i - 1]));
  const total = u[u.length - 1] || 1;
  for (let i = 0; i < u.length; i++) u[i] /= total;

  let c00 = 0,
    c01 = 0,
    c11 = 0,
    x0 = 0,
    x1 = 0;
  for (let i = 0; i < pts.length; i++) {
    const t = u[i],
      s = 1 - t;
    const b0 = s * s * s,
      b1 = 3 * s * s * t,
      b2 = 3 * s * t * t,
      b3 = t * t * t;
    const a0 = V.mul(t0, b1),
      a1 = V.mul(t1, b2);
    c00 += V.dot(a0, a0);
    c01 += V.dot(a0, a1);
    c11 += V.dot(a1, a1);
    const tmp = V.sub(pts[i], [
      p0[0] * (b0 + b1) + p3[0] * (b2 + b3),
      p0[1] * (b0 + b1) + p3[1] * (b2 + b3),
    ]);
    x0 += V.dot(a0, tmp);
    x1 += V.dot(a1, tmp);
  }
  const det = c00 * c11 - c01 * c01;
  let alpha0, alpha1;
  if (Math.abs(det) < 1e-12) {
    alpha0 = alpha1 = V.dist(p0, p3) / 3;
  } else {
    alpha0 = (x0 * c11 - x1 * c01) / det;
    alpha1 = (c00 * x1 - c01 * x0) / det;
  }
  const floor = V.dist(p0, p3) / 100;
  if (!(alpha0 > floor) || !(alpha1 > floor)) {
    alpha0 = alpha1 = V.dist(p0, p3) / 3;
  }
  return { c1: V.add(p0, V.mul(t0, alpha0)), c2: V.add(p3, V.mul(t1, alpha1)), u };
}

function cubicDerivative(p0, c1, c2, p3, t) {
  const s = 1 - t;
  return V.mul(
    V.add(
      V.add(V.mul(V.sub(c1, p0), s * s), V.mul(V.sub(c2, c1), 2 * s * t)),
      V.mul(V.sub(p3, c2), t * t),
    ),
    3,
  );
}

function maxError(pts, u, p0, c1, c2, p3) {
  // On each source interval, compare the restricted cubic with that interval's
  // straight interpolation, expressed as a cubic too. Their difference stays
  // in the convex hull of its four control points. This is a conservative,
  // two-sided bound for the entire curve, not a one-way nearest-sample test
  // that could miss a bulge or a reversed handle between source points.
  let worst = 0,
    reverses = false;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i],
      b = pts[i + 1],
      span = (u[i + 1] - u[i]) / 3;
    const q0 = cubicAt(p0, c1, c2, p3, u[i]);
    const q3 = cubicAt(p0, c1, c2, p3, u[i + 1]);
    const q1 = V.add(q0, V.mul(cubicDerivative(p0, c1, c2, p3, u[i]), span));
    const q2 = V.sub(q3, V.mul(cubicDerivative(p0, c1, c2, p3, u[i + 1]), span));
    // Also check the quadratic velocity, including its interior extremum.
    // A fit may be close to a densely sampled edge yet still double back in a
    // tiny loop. It must progress along every corresponding source interval.
    const chord = V.sub(b, a);
    const da = V.dot(V.sub(q1, q0), chord),
      db = V.dot(V.sub(q2, q1), chord);
    const dc = V.dot(V.sub(q3, q2), chord),
      bend = da - 2 * db + dc;
    const t = Math.abs(bend) > 1e-12 ? (da - db) / bend : -1;
    const mid = t > 0 && t < 1 ? da * (1 - t) ** 2 + 2 * db * t * (1 - t) + dc * t * t : Infinity;
    if (Math.min(da, dc, mid) < -1e-10) reverses = true;
    worst = Math.max(
      worst,
      V.dist(q0, a),
      V.dist(q3, b),
      V.dist(q1, V.add(a, V.mul(V.sub(b, a), 1 / 3))),
      V.dist(q2, V.add(a, V.mul(V.sub(b, a), 2 / 3))),
    );
  }
  return { error: worst, reverses };
}

/**
 * Fit a chain of cubics to a dense polyline, splitting where the error is too
 * large. `tangentAt(i)` supplies the analytic unit tangent at sample i.
 */
export function fitPath(pts, tangentAt, tol = 0.25) {
  if (
    pts.length < 2 ||
    !(tol > 0) ||
    !Number.isFinite(tol) ||
    pts.some((p) => p.length !== 2 || p.some((x) => !Number.isFinite(x)))
  ) {
    throw new Error("a fitted path needs finite points and a positive tolerance");
  }
  const chain = fitSpan(pts, tangentAt, tol);
  for (let i = 1; i < chain.length; i++) {
    const a = chain[i - 1],
      b = chain[i];
    const into = V.norm(V.sub(a.p3, a.c2)),
      out = V.norm(V.sub(b.c1, b.p0));
    if (V.dist(a.p3, b.p0) > 1e-9 || V.dot(into, out) < 1 - 1e-10) {
      throw new Error("a fitted path lost position or forward tangency at a join");
    }
  }
  return chain;
}

function fitSpan(pts, tangentAt, tol) {
  const p0 = pts[0],
    p3 = pts[pts.length - 1];
  const t0 = V.norm(tangentAt(0));
  const t1 = V.norm(tangentAt(pts.length - 1));
  if (!(V.len(t0) >= 0.99) || !(V.len(t1) >= 0.99)) {
    throw new Error("a fitted path has a zero or invalid endpoint tangent");
  }
  const { c1, c2, u } = fitOne(pts, t0, V.mul(t1, -1));
  const { error, reverses } = maxError(pts, u, p0, c1, c2, p3);
  if (error <= tol && !reverses) {
    if (!(V.dot(V.sub(c1, p0), t0) > 0) || !(V.dot(V.sub(p3, c2), t1) > 0)) {
      throw new Error("a fitted path reverses direction at an endpoint");
    }
    return [{ p0, c1, c2, p3, error }];
  }
  if (pts.length <= 2) {
    throw new Error(
      `a fitted path ${reverses ? "doubles back" : `cannot meet tolerance ${tol}`} ` +
        `between source samples (bound ${error.toFixed(3)}); sample the source more densely`,
    );
  }
  const mid = Math.floor(pts.length / 2);
  const left = pts.slice(0, mid + 1);
  const right = pts.slice(mid);
  return [
    ...fitSpan(left, (i) => tangentAt(i), tol),
    ...fitSpan(right, (i) => tangentAt(i + mid), tol),
  ];
}

const r2 = (n) => {
  const s = n.toFixed(2);
  return s.replace(/\.?0+$/, "") || "0";
};

export const fmt = (p) => `${r2(p[0])},${r2(p[1])}`;

/** Serialise a fitted chain as SVG path commands (no leading M). */
export function chainToD(chain) {
  return chain.map((s) => `C${fmt(s.c1)} ${fmt(s.c2)} ${fmt(s.p3)}`).join("");
}

export { r2 };
