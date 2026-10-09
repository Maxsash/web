import test from "node:test";
import assert from "node:assert/strict";
import { projects } from "../content/projects.ts";
import { connect, layoutDrawing } from "../lib/system-drawing.ts";

const box = (x, y, width = 100, height = 40) => ({
  id: `${x},${y}`,
  label: "",
  x,
  y,
  width,
  height,
});
const inside = (b, x, y) => x > b.x && x < b.x + b.width && y > b.y && y < b.y + b.height;
const drawings = projects.flatMap((project) =>
  project.visual.kind === "drawing" ? [[project.slug, project.visual.drawing]] : [],
);

test("stacked boxes join with a vertical line between their edges", () => {
  const link = connect(box(0, 0), box(50, 100));
  assert.equal(link.x1, 75);
  assert.equal(link.x2, 75);
  assert.equal(link.y1, 43);
  assert.equal(link.y2, 97);
});

test("boxes side by side join with a horizontal line, in either direction", () => {
  assert.deepEqual(connect(box(0, 0), box(200, 10)), { x1: 103, y1: 25, x2: 197, y2: 25 });
  assert.deepEqual(connect(box(200, 10), box(0, 0)), { x1: 197, y1: 25, x2: 103, y2: 25 });
});

test("diagonal links start and end just outside their boxes", () => {
  const from = box(200, 0);
  const to = box(0, 100);
  const link = connect(from, to);
  assert.ok(!inside(from, link.x1, link.y1) && !inside(to, link.x2, link.y2));
  assert.ok(link.y1 > 40 && link.y2 < 100, "leaves the bottom edge, meets the top edge");
});

test("an unknown node is an error, not a missing arrow", () => {
  assert.throws(
    () =>
      layoutDrawing({
        bands: [{ label: "x", nodes: [{ id: "a", label: "A" }] }],
        links: [["a", "b"]],
      }),
    /Unknown node/,
  );
});

test("project drawings were found", () => {
  assert.equal(drawings.length, 2);
});

for (const [slug, drawing] of drawings) {
  test(`the ${slug} drawing fits, overlaps nothing and routes around its boxes`, () => {
    for (const band of drawing.bands)
      assert.ok(band.nodes.reduce((sum, node) => sum + (node.span ?? 2), 0) <= 4, band.label);
    const { width, height, bands, links } = layoutDrawing(drawing);
    const boxes = bands.flatMap((band) => band.boxes);
    for (const b of boxes)
      assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.width <= width && b.y + b.height <= height, b.id);
    for (const [i, a] of boxes.entries())
      for (const b of boxes.slice(i + 1))
        assert.ok(
          a.x + a.width <= b.x ||
            b.x + b.width <= a.x ||
            a.y + a.height <= b.y ||
            b.y + b.height <= a.y,
          `${a.id} overlaps ${b.id}`,
        );
    for (const link of links)
      for (let t = 0; t <= 1; t += 0.02) {
        const x = link.x1 + (link.x2 - link.x1) * t;
        const y = link.y1 + (link.y2 - link.y1) * t;
        const hit = boxes.find((b) => inside(b, x, y));
        assert.equal(hit, undefined, `a link crosses ${hit?.id}`);
      }
  });
}
