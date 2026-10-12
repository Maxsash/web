import test from "node:test";
import assert from "node:assert/strict";
import {
  indiaMoonDay,
  moonForIndiaDay,
  moonPhaseAt,
} from "../components/observatory/moon-phase.ts";

const referencePhases = [
  ["2026-10-03T13:25:00Z", 0.75, 0.5],
  ["2026-10-10T15:50:00Z", 0, 0],
  ["2026-10-18T16:12:00Z", 0.25, 0.5],
  ["2026-10-26T04:12:00Z", 0.5, 1],
  ["2026-11-01T20:28:00Z", 0.75, 0.5],
  ["2026-11-09T07:02:00Z", 0, 0],
];

test("published USNO primary phases agree within 0.2 degrees and 0.5% illumination", () => {
  for (const [date, cycle, illumination] of referencePhases) {
    const actual = moonPhaseAt(Date.parse(date));
    const error = Math.abs(actual.cycle - cycle);
    assert.ok(Math.min(error, 1 - error) * 360 < 0.2, `${date}: ${actual.cycle}`);
    assert.ok(
      Math.abs(actual.illumination - illumination) < 0.005,
      `${date}: ${actual.illumination}`,
    );
  }
});

test("the India date changes at 18:30 UTC, independently of the browser timezone", () => {
  const before = Date.parse("2026-10-11T18:29:59.999Z");
  const after = before + 1;
  assert.equal(indiaMoonDay(after), indiaMoonDay(before) + 1);
  assert.equal(indiaMoonDay(after), indiaMoonDay(Date.parse("2026-10-12T18:29:59Z")));
  assert.deepEqual(
    moonForIndiaDay(indiaMoonDay(after)),
    moonPhaseAt(Date.parse("2026-10-12T06:30:00Z")),
  );
});

test("October's new moon waxes through full and then wanes", () => {
  const samples = [12, 18, 22, 26, 29].map((day) =>
    moonForIndiaDay(indiaMoonDay(Date.UTC(2026, 9, day))),
  );
  assert.ok(samples[0].illumination > 0 && samples[0].illumination < 0.1);
  assert.ok(samples[0].cycle < 0.25);
  assert.ok(samples[2].cycle > 0.25 && samples[2].cycle < 0.5);
  assert.ok(samples[2].illumination > samples[1].illumination);
  assert.ok(samples[3].illumination > 0.99);
  assert.ok(samples[4].cycle > 0.5 && samples[4].illumination < samples[3].illumination);
});

test("phase remains finite and bounded across 2000–2100, including leap days", () => {
  for (let time = Date.UTC(2000, 0, 1); time < Date.UTC(2101, 0, 1); time += 86_400_000 * 7) {
    const phase = moonPhaseAt(time);
    assert.ok(phase.cycle >= 0 && phase.cycle < 1);
    assert.ok(phase.illumination >= 0 && phase.illumination <= 1);
  }
  assert.throws(() => moonPhaseAt(NaN), RangeError);
});
