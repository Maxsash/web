import test from "node:test";
import assert from "node:assert/strict";
import { createSeaEdition } from "../lib/sea/edition.ts";
import { sampleSea } from "../lib/sea/sample.ts";
import { buildShipMesh } from "../components/observatory/ship-mesh.ts";
import { shipPoseAt } from "../components/observatory/ship-motion.ts";
import { placeShip } from "../components/observatory/ship-placement.ts";

test("the cutter contains finite, lit triangles and a matching cloth buffer", () => {
  const { vertices, flex } = buildShipMesh();
  assert.equal(vertices.length % 36, 0);
  assert.equal(flex.length, vertices.length / 4);
  assert.ok(vertices.length / 36 < 3500, "keep the procedural model small");
  assert.ok(vertices.every(Number.isFinite));
  assert.ok(flex.every(Number.isFinite));
  for (let i = 0; i < vertices.length; i += 36) {
    const a = vertices.slice(i, i + 3),
      b = vertices.slice(i + 12, i + 15),
      c = vertices.slice(i + 24, i + 27);
    const ab = b.map((v, axis) => v - a[axis]),
      ac = c.map((v, axis) => v - a[axis]);
    const area = Math.hypot(
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0],
    );
    assert.ok(area > 1e-10, "no collapsed triangle at " + i / 36);
    assert.ok(Math.abs(Math.hypot(...vertices.slice(i + 3, i + 6)) - 1) < 1e-6);
  }
});

test("cloth can breathe while deck and spars keep their shape", () => {
  const { vertices, flex } = buildShipMesh();
  let moving = 0;
  for (let i = 0; i < flex.length; i += 3) {
    const height = vertices[i * 4 + 1];
    if (height < 0.75) assert.deepEqual(Array.from(flex.slice(i, i + 3)), [0, 0, 0]);
    assert.ok(flex[i] >= 0 && flex[i] <= 0.09);
    assert.ok(flex[i + 2] >= 0 && flex[i + 2] <= 0.04);
    if (flex[i] > 0.01) moving++;
  }
  assert.ok(moving > 300, "sails carry the motion");
});

test("the hull follows long swell and damps short chop without extreme heel", () => {
  const placement = { x: 4.5, z: -5.5, scale: 1 };
  for (const wavelength of [0.65, 18]) {
    const edition = {
      ...createSeaEdition("70806d5e", "2"),
      waves: [{ wavelength, amplitude: 0.5, direction: 0.4, phase: 0 }],
    };
    let heave = 0,
      pointHeave = 0;
    for (let time = 0; time < 20; time += 0.02) {
      const pose = shipPoseAt(edition, time, placement);
      assert.ok(
        Object.values(pose)
          .flatMap((value) => (value instanceof Float32Array ? Array.from(value) : value))
          .every(Number.isFinite),
      );
      assert.ok(Math.abs(pose.pitch) < 0.48 && Math.abs(pose.roll) < 0.36);
      heave += (pose.height - 0.075) ** 2;
      pointHeave += sampleSea(edition, pose.x, pose.z, time).height ** 2;
      const next = shipPoseAt(edition, time + 1 / 60, placement);
      assert.ok(Math.abs(next.height - pose.height) < 0.06, "continuous heave");
    }
    assert.ok(heave / pointHeave < (wavelength < 1 ? 0.35 : 1.1));
    if (wavelength > 1) assert.ok(heave / pointHeave > 0.5, "long swell still lifts the hull");
  }
});

test("calm water holds the waterline and ship transforms stay orthogonal", () => {
  const edition = { ...createSeaEdition("70806d5e", "2"), waves: [] };
  for (const scale of [0.25, 1, 1.7]) {
    const pose = shipPoseAt(edition, 12, { x: 5, z: -6, scale });
    assert.equal(pose.height, 0.075 * scale);
    const axes = [0, 4, 8].map((start) => Array.from(pose.matrix.slice(start, start + 3)));
    for (const axis of axes) assert.ok(Math.abs(Math.hypot(...axis) - scale) < 1e-6);
    assert.ok(Math.abs(axes[0].reduce((sum, v, i) => sum + v * axes[1][i], 0)) < 1e-6);
  }
});

test("responsive placement remains finite with short, tall and enlarged copy", () => {
  for (const [width, height, right, bottom] of [
    [1440, 1000, 370, 740],
    [390, 844, 235, 448],
    [320, 568, 230, 426],
    [844, 390, 420, 300],
    [390, 844, 355, 670],
  ]) {
    const placement = placeShip(
      { width, height, copy: { right, bottom } },
      buildShipMesh().vertices,
    );
    assert.ok(Object.values(placement).every(Number.isFinite));
    assert.ok(placement.scale >= 0.2 && placement.scale <= 1.7);
    assert.ok(placement.z > -60 && placement.z < 25);
  }
});
