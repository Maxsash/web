import test from "node:test";
import assert from "node:assert/strict";
import { moonForIndiaDay } from "../components/observatory/moon-phase.ts";
import {
  PHASES,
  previewDate,
  previewDay,
  previewPhaseDay,
} from "../components/observatory/phase-preview.ts";

test("the temporary selector finds all eight distinct nearby phase dates", () => {
  const today = previewDay("2026-10-12");
  const dates = PHASES.map(([, target]) => previewPhaseDay(target, today));
  assert.equal(new Set(dates).size, 8);
  dates.forEach((day, index) => {
    const cycle = moonForIndiaDay(day).cycle;
    const difference = Math.abs(((cycle - PHASES[index][1] + 1.5) % 1) - 0.5);
    assert.ok(difference < 0.02, PHASES[index][0]);
    assert.ok(Math.abs(day - today) <= 16);
    assert.equal(previewDay(previewDate(day)), day);
  });
  assert.equal(previewDay("2026-02-30"), null);
});
