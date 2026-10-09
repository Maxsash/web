import test from "node:test";
import assert from "node:assert/strict";
import { PLATE, ROWS, engraveRows, shadeFromPixels } from "../components/portrait/engraving.ts";
import { FACE_INSET, MEDAL, legendArc, tickMarks } from "../components/portrait/medal.ts";
import { createSeaEdition } from "../lib/sea/edition.ts";

const homeWater = createSeaEdition("70806d5e", "2");
const visiblePoints = (outline) =>
  outline
    .slice(1, -1)
    .split("L")
    .map((pair) => pair.split(" ").map(Number))
    .filter(([x, y]) => x >= 0 && x <= PLATE && y <= PLATE);
const heightAt = (outline, x) => visiblePoints(outline).find(([px]) => px === x)[1];

test("every row of the plate is one closed outline that hides the rows behind it", () => {
  const rows = engraveRows(() => 0.5, homeWater);
  assert.equal(rows.length, ROWS);
  for (const outline of rows) {
    assert.match(outline, /^M-\d+ [\d.-]+L0 /);
    assert.match(outline, /Z$/);
  }
});

test("a dark photograph leaves only the sea's own ripples", () => {
  const rows = engraveRows(() => 0, homeWater);
  const gap = PLATE / ROWS;
  for (const [row, outline] of rows.entries()) {
    const heights = visiblePoints(outline).map(([, y]) => y);
    const spread = Math.max(...heights) - Math.min(...heights);
    assert.ok(spread > 0.5, `row ${row} is ruled flat, not drawn in waves`);
    assert.ok(spread < gap * 2, `row ${row} swells past its neighbours`);
  }
});

test("light lifts the lines, so a bright face rises out of calm water", () => {
  const disc = (x, y) => (Math.hypot(x - 0.5, y - 0.5) < 0.2 ? 0.9 : 0.05);
  const middle = engraveRows(disc, homeWater)[Math.floor(ROWS / 2)];
  const lifted = heightAt(middle, 100) - heightAt(middle, PLATE / 2);
  assert.ok(lifted > (PLATE / ROWS) * 2, `the centre rose by only ${lifted.toFixed(1)}`);
});

test("the engraving is deterministic", () => {
  const shade = (x, y) => (x + y) / 2;
  assert.deepEqual(engraveRows(shade, homeWater), engraveRows(shade, homeWater));
});

test("shade is read as luma and blended between pixels", () => {
  const pixels = new Uint8ClampedArray([
    0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255,
  ]);
  const shade = shadeFromPixels(pixels, 2);
  assert.equal(shade(0, 0), 0);
  assert.ok(Math.abs(shade(1, 0) - 1) < 0.01);
  assert.ok(Math.abs(shade(0.5, 0.5) - 0.5) < 0.01);
});

test("the bezel is a compass card: a tick every 5 degrees, a long one every 30", () => {
  const ticks = tickMarks(206, 212, 219).split("M").filter(Boolean);
  assert.equal(ticks.length, 72);
  const length = (tick) => {
    const [[x1, y1], [x2, y2]] = tick.split("L").map((pair) => pair.split(" ").map(Number));
    return Math.hypot(x2 - x1, y2 - y1);
  };
  assert.equal(ticks.filter((tick) => length(tick) > 10).length, 12);
  assert.match(ticks[0], /^260\.0 54\.0L260\.0 41\.0$/);
});

test("the face sits inside the bezel and the legend arcs span the medal", () => {
  assert.equal(FACE_INSET, "12.308%");
  assert.equal(legendArc(232, true), `M28 ${MEDAL / 2}A232 232 0 0 1 492 ${MEDAL / 2}`);
  assert.match(legendArc(244, false), / 0 0 0 504 260$/);
});
