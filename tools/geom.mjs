/* Shared 2D helpers: vectors, cubic sampling, and least-squares Bezier fitting.
   Used by the logo and wave generators so both emit compact, smooth paths. */

export const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, k) => [a[0] * k, a[1] * k],
  len: (a) => Math.hypot(a[0], a[1]),
  norm: (a) => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; },
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
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [
    a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0],
    a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1],
  ];
}

/**
 * Fit one cubic through `pts` with the given unit end tangents, solving the two
 * handle lengths by least squares (Schneider). Returns [c1, c2].
 */
function fitOne(pts, t0, t1) {
  const p0 = pts[0], p3 = pts[pts.length - 1];
  // chord-length parametrisation
  const u = [0];
  for (let i = 1; i < pts.length; i++) u.push(u[i - 1] + V.dist(pts[i], pts[i - 1]));
  const total = u[u.length - 1] || 1;
  for (let i = 0; i < u.length; i++) u[i] /= total;

  let c00 = 0, c01 = 0, c11 = 0, x0 = 0, x1 = 0;
  for (let i = 0; i < pts.length; i++) {
    const t = u[i], s = 1 - t;
    const b0 = s * s * s, b1 = 3 * s * s * t, b2 = 3 * s * t * t, b3 = t * t * t;
    const a0 = V.mul(t0, b1), a1 = V.mul(t1, b2);
    c00 += V.dot(a0, a0); c01 += V.dot(a0, a1); c11 += V.dot(a1, a1);
    const tmp = V.sub(pts[i], [
      p0[0] * (b0 + b1) + p3[0] * (b2 + b3),
      p0[1] * (b0 + b1) + p3[1] * (b2 + b3),
    ]);
    x0 += V.dot(a0, tmp); x1 += V.dot(a1, tmp);
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
  return [V.add(p0, V.mul(t0, alpha0)), V.add(p3, V.mul(t1, -alpha1))];
}

function maxError(pts, p0, c1, c2, p3) {
  // Dense reference sampling of the candidate curve, then nearest-point search.
  const M = Math.max(120, pts.length * 2);
  const ref = [];
  for (let j = 0; j <= M; j++) ref.push(cubicAt(p0, c1, c2, p3, j / M));
  let worst = 0;
  let guess = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    let best = Infinity, bestJ = guess;
    for (let j = Math.max(0, guess - 8); j <= M; j++) {
      const d = V.dist(pts[i], ref[j]);
      if (d < best) { best = d; bestJ = j; }
      else if (j > bestJ + 8) break; // distance is rising again; stop walking
    }
    guess = bestJ;
    if (best > worst) worst = best;
  }
  return worst;
}

/**
 * Fit a chain of cubics to a dense polyline, splitting where the error is too
 * large. `tangentAt(i)` supplies the analytic unit tangent at sample i.
 */
export function fitPath(pts, tangentAt, tol = 0.25, depth = 0) {
  const p0 = pts[0], p3 = pts[pts.length - 1];
  const t0 = tangentAt(0);
  const t1 = tangentAt(pts.length - 1);
  const [c1, c2] = fitOne(pts, t0, V.mul(t1, -1));
  if (depth > 9 || pts.length < 5 || maxError(pts, p0, c1, c2, p3) <= tol) {
    return [{ p0, c1, c2, p3 }];
  }
  const mid = Math.floor(pts.length / 2);
  const left = pts.slice(0, mid + 1);
  const right = pts.slice(mid);
  return [
    ...fitPath(left, (i) => tangentAt(i), tol, depth + 1),
    ...fitPath(right, (i) => tangentAt(i + mid), tol, depth + 1),
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
