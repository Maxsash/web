import assert from "node:assert/strict";
import test from "node:test";
import { V, cubicAt, fitPath } from "./geom.mjs";
import { assertSimpleOutline, distToPolyline, filletCorner, ringToPath } from "./outline.mjs";

const sample = (at, steps = 400) => Array.from({ length: steps + 1 }, (_, i) => at(i / steps));
const line = (a, b, steps = 120) => sample((t) => V.add(a, V.mul(V.sub(b, a), t)), steps);
const at = (curve, t) => cubicAt(curve.p0, curve.c1, curve.c2, curve.p3, t);

test("a fitted straight edge reaches its endpoint without overshoot or reversal", () => {
  const chain = fitPath(line([0, 0], [100, 0], 4), () => [1, 0]);
  assert.equal(chain.length, 1);
  const points = sample((t) => at(chain[0], t));
  assert.deepEqual(points[0], [0, 0]);
  assert.deepEqual(points.at(-1), [100, 0]);
  for (let i = 1; i < points.length; i++) {
    assert(points[i][0] > points[i - 1][0]);
    assert(Math.abs(points[i][1]) < 1e-9);
  }
});

test("a fitted wave stays within tolerance and has forward tangent continuity", () => {
  const points = sample((t) => [800 * t, 40 * Math.sin(t * Math.PI * 8)], 800);
  const tangent = (i) => V.norm(V.sub(points[Math.min(800, i + 1)], points[Math.max(0, i - 1)]));
  const chain = fitPath(points, tangent, 0.25);
  assert(chain.length > 1, "the example must exercise joins between fitted cubics");
  let previousX = -Infinity;
  for (let i = 0; i < chain.length; i++) {
    const curve = chain[i];
    for (const p of sample((t) => at(curve, t), 80)) {
      assert(p[0] >= previousX - 1e-9, "the curve must not double back between source samples");
      assert(distToPolyline(p, points) <= 0.25, "the fitted outline must not bulge outside tolerance");
      previousX = p[0];
    }
    if (i > 0) {
      const previous = chain[i - 1];
      assert.deepEqual(at(previous, 1), at(curve, 0));
      const into = V.norm(V.sub(at(previous, 1), at(previous, 1 - 1e-5)));
      const out = V.norm(V.sub(at(curve, 1e-5), at(curve, 0)));
      assert(V.dot(into, out) > 0.999999, "the rendered curve must leave a join in its incoming direction");
    }
  }
});

test("unresolvable sparse fitting fails instead of silently exceeding tolerance", () => {
  assert.throws(() => fitPath([[0, 0], [100, 0]], () => [0, 1], 0.01),
    /cannot meet tolerance|doubles back/);
});

test("reversing ring winding preserves each corner's radius and tangent circle", () => {
  const corners = [
    { p: [0, 0], r: 5, name: "sw", centre: [5, 5] },
    { p: [120, 0], r: 10, name: "se", centre: [110, 10] },
    { p: [120, 120], r: 15, name: "ne", centre: [105, 105] },
    { p: [0, 120], r: 20, name: "nw", centre: [20, 100] },
  ];
  for (const order of [corners, [...corners].reverse()]) {
    const ring = ringToPath(order.map((c, i) => ({
      pts: line(c.p, order[(i + 1) % order.length].p), r: c.r, name: c.name,
    })));
    assert.equal(ring.fillets.length, 4);
    for (const c of corners) {
      const arc = ring.fillets.find((a) => a.name === `${c.name}/shape`);
      assert(arc, `missing ${c.name} corner after winding normalization`);
      assert.equal(arc.r, c.r);
      assert(V.dist(arc.c, c.centre) < 1e-9);
      assert(Math.abs(V.dist(arc.from, arc.c) - c.r) < 1e-9);
      assert(Math.abs(V.dist(arc.to, arc.c) - c.r) < 1e-9);
    }
    assertSimpleOutline(ring.pts, "rounded rectangle");
  }
});

test("fillet construction is independent of the two edges' sample densities", () => {
  for (const [aSteps, bSteps] of [[1, 500], [500, 1], [100, 100]]) {
    const { arc } = filletCorner(line([0, 0], [100, 0], aSteps),
      line([100, 0], [100, 100], bSteps), 20, "right angle");
    assert(V.dist(arc.c, [80, 20]) < 1e-9);
    assert(V.dist(arc.from, [80, 0]) < 1e-9);
    assert(V.dist(arc.to, [100, 20]) < 1e-9);
  }
});

for (const [name, points] of [
  ["bow-tie crossing", [[0, 0], [4, 4], [0, 4], [4, 0]]],
  ["nonadjacent touch", [[0, 0], [4, 0], [4, 4], [2, 0], [0, 4]]],
  ["collinear overlap", [[0, 0], [4, 0], [4, 4], [1, 4], [1, 0], [3, 0], [3, 2], [0, 2]]],
  ["adjacent reversal", [[0, 0], [4, 0], [2, 0], [4, 4], [0, 4]]],
]) {
  test(`a closed outline rejects a ${name}`, () => {
    assert.throws(() => assertSimpleOutline(points, name), /cross|touch|overlap|double back/);
  });
}

test("a simple concave outline permits duplicate joins and a repeated closing point", () => {
  const points = [[0, 0], [3, 0], [3, 3], [2, 3], [2, 1], [1, 1], [1, 3], [0, 3]];
  assert.deepEqual(assertSimpleOutline([points[0], ...points, points[0]]), points);
  const circle = sample((t) => [400 * Math.cos(t * Math.PI * 2), 400 * Math.sin(t * Math.PI * 2)], 8000);
  assert.equal(assertSimpleOutline(circle).length, 8000);
});
