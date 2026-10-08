import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cameraAt } from "../components/observatory/camera.ts";
import { lookAt, modelMatrix, multiply, perspective } from "../components/observatory/matrices.ts";
import { buildSeaGrid } from "../components/observatory/sea-grid.ts";
import { buildShipMesh } from "../components/observatory/ship-mesh.ts";

const digest = (values) =>
  createHash("sha256").update(Array.from(values).map(String).join(",")).digest("hex");

test("the ship mesh and view matrices are unchanged from the approved scene", () => {
  const mesh = buildShipMesh();
  assert.equal(mesh.length, 35136);
  assert.equal(digest(mesh), "4a110b0c52d63eb6540454b3177cc6a0e4b187601293f3b2522a26ee752871fb");
  assert.equal(
    digest(perspective(1.7)) + digest(perspective(0.5)),
    "b05735ebd71022bdd00c3993ccc0972bf615b57dc5cff31cc974ebb92316b4f17996123493c0779f384c64cffe907185cb8e37adf104cb9cc4f46ae666d6b55c",
  );
  const view = lookAt([3, 5, 18], [0, 0.6, -7]);
  assert.equal(digest(view), "2555b395a785f12227d7aa6fd77e11ce9688cfed0267acb55a1ad49020b5804f");
  assert.equal(
    digest(modelMatrix(0.3, 0.2, -0.4)),
    "bda81dfc7e67adf7c4075f6a789fd8e5a07bbce6b1f33c7e4d89615977da99ab",
  );
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
