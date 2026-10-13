import test from "node:test";
import assert from "node:assert/strict";
import { atmosphereForIndiaDay } from "../components/observatory/daily-atmosphere.ts";
import { indiaMoonDay } from "../components/observatory/moon-phase.ts";

test("the same India date keeps its atmosphere through the day and in preview", () => {
  const morning = indiaMoonDay(Date.parse("2026-10-13T01:00:00Z"));
  const evening = indiaMoonDay(Date.parse("2026-10-13T17:00:00Z"));
  assert.equal(morning, evening);
  assert.deepEqual(atmosphereForIndiaDay(morning), atmosphereForIndiaDay(evening));
  assert.notDeepEqual(atmosphereForIndiaDay(morning), atmosphereForIndiaDay(morning + 1));
});

test("daily changes stay within the restrained sky ranges", () => {
  const moods = new Set();
  for (
    let day = indiaMoonDay(Date.UTC(2026, 0, 1));
    day < indiaMoonDay(Date.UTC(2027, 0, 1));
    day++
  ) {
    const [offset, clouds, cirrus, haze] = atmosphereForIndiaDay(day);
    assert.ok(Math.abs(offset) <= 0.04);
    assert.ok(clouds >= 0.55 && clouds <= 1.05);
    assert.ok(cirrus >= 0.7 && cirrus <= 1.1);
    assert.ok(haze >= 0.65 && haze <= 1.25);
    moods.add(`${clouds},${cirrus},${haze}`);
  }
  assert.equal(moods.size, 3);
});
