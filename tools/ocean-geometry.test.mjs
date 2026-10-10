import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cameraAt, seaPointAt } from "../components/observatory/camera.ts";
import { lookAt, multiply, perspective } from "../components/observatory/matrices.ts";
import { buildSeaGrid } from "../components/observatory/sea-grid.ts";

const digest = (values) =>
  createHash("sha256").update(Array.from(values).map(String).join(",")).digest("hex");

test("the view matrices are unchanged from the approved scene", () => {
  assert.equal(
    digest(perspective(1.7)) + digest(perspective(0.5)),
    "b05735ebd71022bdd00c3993ccc0972bf615b57dc5cff31cc974ebb92316b4f17996123493c0779f384c64cffe907185cb8e37adf104cb9cc4f46ae666d6b55c",
  );
  const view = lookAt([3, 5, 18], [0, 0.6, -7]);
  assert.equal(digest(view), "2555b395a785f12227d7aa6fd77e11ce9688cfed0267acb55a1ad49020b5804f");
  assert.equal(
    digest(multiply(perspective(1.7), view)),
    "3507cb28bc3361de83b37e9387ba639b37922f1cb48172111a5d8f409dced9b1",
  );
});

test("the camera starts low over the water and ends high above it", () => {
  assert.deepEqual(cameraAt(0, 1.7, [0, 0]), { eye: [0, 5, 18], target: [0, 0.6, -7] });
  assert.deepEqual(cameraAt(0, 0.5, [1, -1]), {
    eye: [0.75, 6.8 - 0.35, 24],
    target: [2.5, 0.6, -7],
  });
  assert.deepEqual(cameraAt(1, 1.7, [0, 0]), { eye: [10, 29, 16], target: [0, -0.4, -7] });
});

test("the sea grid is denser on desktop and indexes every vertex", () => {
  for (const [compact, nx, nz] of [
    [true, 120, 90],
    [false, 200, 150],
  ]) {
    const grid = buildSeaGrid(compact);
    assert.equal(grid.vertices.length, (nx + 1) * (nz + 1) * 2);
    assert.equal(grid.indices.length, nx * nz * 6);
    assert.ok(grid.indices.every((index) => index < (nx + 1) * (nz + 1)));
  }
});

test("a press on the screen finds the point of the sea under it", () => {
  for (const [reveal, aspect] of [
    [0, 1.7],
    [0.6, 0.5],
  ]) {
    const { eye, target } = cameraAt(reveal, aspect, [0, 0]);
    const viewProjection = multiply(perspective(aspect), lookAt(eye, target));
    for (const [x, z] of [
      [4.5, -5.5],
      [-6, -20],
    ]) {
      const clip = [0, 1, 2, 3].map(
        (row) => viewProjection[row] * x + viewProjection[8 + row] * z + viewProjection[12 + row],
      );
      const found = seaPointAt([clip[0] / clip[3], clip[1] / clip[3]], eye, target, aspect);
      assert.ok(Math.hypot(found[0] - x, found[1] - z) < 1e-4, `${found} for ${[x, z]}`);
    }
  }
  const { eye, target } = cameraAt(0, 1.7, [0, 0]);
  assert.equal(seaPointAt([0, 0.95], eye, target, 1.7), null, "the sky has no sea under it");
});
