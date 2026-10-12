import test from "node:test";
import assert from "node:assert/strict";
import { THEME_BLEND_MS, themeBlendAt } from "../components/observatory/theme-blend.ts";
import { boundsOverlap, skyControlBounds } from "../components/observatory/sky-control.ts";
import { SEA_LIGHT_SCREEN, SEA_REFLECTION_SCREEN } from "../components/observatory/ocean-light.ts";
import { cameraAt, seaPointAt } from "../components/observatory/camera.ts";

test("theme fades smoothly for one second and stays bounded before/after it", () => {
  const blend = { from: 0, target: 1, started: 100 };
  assert.equal(THEME_BLEND_MS, 1000);
  assert.deepEqual(themeBlendAt(blend, 99), { value: 0, finished: false });
  assert.equal(themeBlendAt(blend, 600).value, 0.5);
  assert.deepEqual(themeBlendAt(blend, 1100), { value: 1, finished: true });
  assert.deepEqual(themeBlendAt(blend, 2100), { value: 1, finished: true });
  let previous = -1;
  for (let at = 100; at <= 1100; at += 10) {
    const value = themeBlendAt(blend, at).value;
    assert.ok(value >= previous && value <= 1);
    previous = value;
  }
});

test("reversing a theme fade starts at its current brightness without jumping", () => {
  const current = themeBlendAt({ from: 0, target: 1, started: 0 }, 370).value;
  const reverse = { from: current, target: 0, started: 370 };
  assert.equal(themeBlendAt(reverse, 370).value, current);
  assert.ok(themeBlendAt(reverse, 500).value < current);
  assert.deepEqual(themeBlendAt(reverse, 1370), { value: 0, finished: true });
});

test("sky targets match the actual disc and keep a 44 px minimum at every viewport", () => {
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [844, 390],
    [1440, 1000],
    [1920, 1080],
  ]) {
    const bounds = skyControlBounds(width, height);
    assert.equal((bounds.left + bounds.right) / 2, width * SEA_LIGHT_SCREEN[0]);
    assert.equal((bounds.top + bounds.bottom) / 2, height * (1 - SEA_LIGHT_SCREEN[1]));
    assert.ok(bounds.right - bounds.left >= 44);
    assert.ok(bounds.bottom - bounds.top >= 44);
    assert.ok(!boundsOverlap(bounds, { left: 0, right: 40, top: 0, bottom: 40 }));
    assert.ok(boundsOverlap(bounds, bounds));
  }
});

test("the sky ripple projects onto water beneath the light across portrait and landscape", () => {
  for (const aspect of [320 / 568, 390 / 844, 844 / 390, 1440 / 1000]) {
    const { eye, target } = cameraAt(0, aspect, [0, 0]);
    const point = seaPointAt(
      [SEA_REFLECTION_SCREEN[0] * 2 - 1, SEA_REFLECTION_SCREEN[1] * 2 - 1],
      eye,
      target,
      aspect,
    );
    assert.ok(point?.every(Number.isFinite));
    assert.ok(point[0] > 0 && point[0] < 174 && point[1] > -222 && point[1] < 32);
  }
});
