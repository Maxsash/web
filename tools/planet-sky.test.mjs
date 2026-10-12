import test from "node:test";
import assert from "node:assert/strict";
import { indiaMoonDay } from "../components/observatory/moon-phase.ts";
import { planetFrameAt, planetsAt, PLANET_NAMES } from "../components/observatory/planet-sky.ts";

const references = [
  [
    "2026-10-12T15:30:00Z",
    [
      [220.575, -18.805],
      [211.406, -20.779],
      [130.704, 19.457],
      [143.79, 15.027],
      [10.518, 1.577],
    ],
  ],
  [
    "2026-10-26T15:30:00Z",
    [
      [227.0, -20.431],
      [204.574, -16.717],
      [138.426, 17.609],
      [145.823, 14.397],
      [9.567, 1.191],
    ],
  ],
  [
    "2027-01-15T15:30:00Z",
    [
      [306.469, -21.352],
      [247.213, -18.553],
      [162.877, 11.367],
      [147.493, 14.159],
      [8.92, 1.239],
    ],
  ],
];

test("JPL-element planet positions agree with independent Astronomy Engine 2.1.15 samples", () => {
  for (const [date, expected] of references) {
    const planets = planetsAt(Date.parse(date));
    assert.deepEqual(
      planets.map((planet) => planet.name),
      PLANET_NAMES,
    );
    planets.forEach((planet, index) => {
      const [rightAscension, declination] = expected[index];
      assert.ok(
        Math.abs(planet.rightAscension - rightAscension) < 0.15,
        `${date} ${planet.name} RA`,
      );
      assert.ok(Math.abs(planet.declination - declination) < 0.15, `${date} ${planet.name} Dec`);
      assert.ok(Number.isFinite(planet.magnitude));
      assert.ok(planet.elongation >= 0 && planet.elongation <= 180);
    });
  }
  assert.throws(() => planetsAt(NaN), RangeError);
});

test("dated planet frames use the same Moon-centred projection and change by day", () => {
  const first = planetFrameAt(indiaMoonDay(Date.parse("2026-10-12T15:30:00Z")));
  const second = planetFrameAt(indiaMoonDay(Date.parse("2026-10-26T15:30:00Z")));
  assert.equal(first.points.length, first.names.length * 4);
  assert.equal(second.points.length, second.names.length * 4);
  assert.ok(first.points.every(Number.isFinite));
  assert.ok(second.points.every(Number.isFinite));
  assert.notDeepEqual(first.names, second.names);
});
