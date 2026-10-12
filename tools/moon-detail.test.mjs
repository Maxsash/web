import assert from "node:assert/strict";
import { test } from "node:test";
import {
  moonMapPoint,
  moonSurfaceLight,
  renderMoonSurface,
} from "../components/observatory/moon-detail.ts";
import { moonVisibility } from "../components/observatory/layer-opacity.ts";
import { skyFragment } from "../components/observatory/ocean-shaders.ts";

test("the near-side map centre, limbs and poles project onto a complete lunar disc", () => {
  const centre = moonMapPoint(0, 0);
  assert.ok(centre);
  assert.ok(Math.abs(centre.u - 0.5) < 1e-10);
  assert.ok(Math.abs(centre.v - 0.5) < 1e-10);
  assert.ok(moonMapPoint(0.5, 0).u > 0.5);
  assert.ok(moonMapPoint(0, 0.5).v < 0.5);
  assert.ok(moonMapPoint(-0.99999, 0).u < 0.01, "the cropped map's left edge is the west limb");
  assert.ok(moonMapPoint(0.99999, 0).u > 0.99, "the cropped map's right edge is the east limb");
  assert.equal(moonMapPoint(1, 0), null);
});

test("the mapped Moon keeps its terrain on the unlit side and reverses quarter lighting", () => {
  const width = 64;
  const height = 32;
  const map = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const at = (y * width + x) * 4;
      map[at] = x < width / 2 ? 180 : 90;
      map[at + 1] = 150;
      map[at + 2] = 140;
      map[at + 3] = 255;
    }
  }
  const waxing = { illumination: 0.5, cycle: 0.25 };
  const waning = { illumination: 0.5, cycle: 0.75 };
  const left = [-0.5, 0, Math.sqrt(0.75)];
  const right = [0.5, 0, Math.sqrt(0.75)];
  assert.ok(moonSurfaceLight(waxing, right) > moonSurfaceLight(waxing, left) * 3);
  assert.ok(moonSurfaceLight(waning, left) > moonSurfaceLight(waning, right) * 3);
  assert.ok(moonSurfaceLight(waxing, left) > 0);
  const pixels = renderMoonSurface({ width, height, data: map }, waxing, 64);
  const unlit = (32 * 64 + 16) * 4;
  const lit = (32 * 64 + 48) * 4;
  assert.ok(pixels[unlit] > 2);
  assert.ok(pixels[lit] > pixels[unlit]);
  assert.equal(pixels[0 + 3], 0);
});

test("the Moon fades exactly as the shader's night sky turns to paper", () => {
  assert.ok(skyFragment.includes("smoothstep(.05,.8,uReveal)"));
  assert.equal(moonVisibility(0, 0), 0);
  assert.equal(moonVisibility(1, 0), 1);
  assert.equal(moonVisibility(0.4, 0.05), 0.4);
  assert.equal(moonVisibility(1, 0.425), 0.5);
  assert.equal(moonVisibility(1, 0.8), 0);
  assert.ok(moonVisibility(1, 0.2) > moonVisibility(1, 0.3));
});
