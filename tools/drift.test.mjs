import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  seaFragment,
  seaVertex,
  shipFragment,
  skyFragment,
} from "../components/observatory/ocean-shaders.ts";
import { driftShaders } from "../components/drift/drift-shaders.ts";
import { buildPageGrid, buildPlank, buildRaft } from "../components/drift/driftwood-mesh.ts";
import { DRIFT_SCENES, drifterPose, lightningAt } from "../components/drift/scenes.ts";
import { tornEdge } from "../components/drift/torn-edge.ts";
import { sampleDrift, scaleSwell } from "../components/drift/whirlpool.ts";
import { createSeaEdition } from "../lib/sea/edition.ts";
import { sampleSea } from "../lib/sea/sample.ts";

const digest = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);

test("the homepage shaders are byte-identical after becoming builders", () => {
  assert.deepEqual([seaVertex, seaFragment, skyFragment, shipFragment].map(digest), [
    "01d90267da202f98",
    "884541297ed3cea9",
    "2a723ecbb48bec6b",
    "0df202684c3ef2d6",
  ]);
});

test("error scenes never carry the homepage ship or its wake", () => {
  for (const scene of Object.values(DRIFT_SCENES)) {
    const { sea } = driftShaders(scene);
    assert.ok(!sea[1].includes("vec2 ship="));
  }
  assert.ok(driftShaders(DRIFT_SCENES.storm).sky[1].includes("fbm("), "the storm has clouds");
  assert.ok(!driftShaders(DRIFT_SCENES.horizon).sky[1].includes("fbm("), "clear skies have none");
  for (const scene of Object.values(DRIFT_SCENES))
    assert.ok(driftShaders(scene).sky[1].includes("sun*uOrb"), "the sun can step aside for text");
});

test("without a whirlpool the drifting sea is the ordinary sea", () => {
  const edition = createSeaEdition(DRIFT_SCENES.horizon.seed, "2");
  assert.deepEqual(sampleDrift(edition, undefined, 1.3, -2.1, 5), sampleSea(edition, 1.3, -2.1, 5));
});

test("a whirlpool sinks the centre and leaves distant water alone", () => {
  const edition = createSeaEdition(DRIFT_SCENES.storm.seed, "2");
  const { whirlpool } = DRIFT_SCENES.storm;
  const [cx, cz] = whirlpool.centre;
  const centre = sampleDrift(edition, whirlpool, cx, cz, 3);
  assert.ok(
    Math.abs(centre.height - (sampleSea(edition, cx, cz, 3).height - whirlpool.depth)) < 1e-9,
  );
  const far = sampleDrift(edition, whirlpool, cx + 40, cz, 3);
  const open = sampleSea(edition, cx + 40, cz, 3);
  assert.ok(Math.abs(far.height - open.height) < 1e-9 && Math.abs(far.dx - open.dx) < 1e-9);
});

test("swell scales every wave's height and nothing else", () => {
  const edition = createSeaEdition(DRIFT_SCENES.squall.seed, "2");
  const rough = scaleSwell(edition, 1.25);
  rough.waves.forEach((wave, i) => {
    assert.equal(wave.amplitude, edition.waves[i].amplitude * 1.25);
    assert.equal(wave.wavelength, edition.waves[i].wavelength);
  });
});

test("the plank circles the drain and floating things stay in view on narrow screens", () => {
  const { storm, horizon } = DRIFT_SCENES;
  for (let time = 0; time < 30; time += 0.7) {
    const [x, z] = drifterPose(storm, time, 1.6);
    const reach = Math.hypot(x - storm.whirlpool.centre[0], z - storm.whirlpool.centre[1]);
    assert.ok(reach > 2.3 && reach < 3.1, `${reach}`);
  }
  assert.equal(drifterPose(horizon, 0, 1.8)[0], horizon.pose[0]);
  assert.ok(drifterPose(horizon, 0, 0.5)[0] < horizon.pose[0] * 0.5);
});

test("lightning is one soft fading flash, never a flicker", () => {
  const samples = Array.from({ length: 1460 }, (_, i) => lightningAt(i / 100));
  assert.ok(Math.max(...samples) <= 0.55);
  assert.ok(samples.filter((v) => v > 0).length < samples.length * 0.1, "dark most of the time");
  const flash = samples.slice(670, 730);
  flash.slice(1).forEach((value, i) => assert.ok(value <= flash[i], "only ever fades"));
});

test("the torn edge is repeatable and the paper face sits above its fibres", () => {
  assert.deepEqual(tornEdge(11), tornEdge(11));
  assert.notDeepEqual(tornEdge(11), tornEdge(12));
  const depth = (polygon) => {
    const ys = [...polygon.matchAll(/% (\d+\.\d+)%/g)].map((m) => Number(m[1]));
    return ys.reduce((sum, y) => sum + y, 0) / ys.length;
  };
  const { face, fibre } = tornEdge(11);
  assert.ok(face.startsWith("polygon(0 0, 100% 0,"));
  assert.ok(depth(face) < depth(fibre));
});

test("driftwood meshes are whole triangles in the ship's vertex layout", () => {
  for (const mesh of [buildRaft(), buildPlank()]) {
    assert.equal(mesh.length % 36, 0);
    assert.ok(mesh.every(Number.isFinite));
  }
  const page = buildPageGrid(4, 3);
  assert.equal(page.uv.length, 5 * 4 * 2);
  assert.equal(page.indices.length, 4 * 3 * 6);
});
