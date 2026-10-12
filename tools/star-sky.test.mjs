import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { indiaMoonDay, moonEquatorialAt } from "../components/observatory/moon-phase.ts";
import { decodeStarCatalogue, starFrameAt } from "../components/observatory/star-sky.ts";

const catalogue = await readFile(new URL("../public/stars-hyg-v41.bin", import.meta.url));
const stars = decodeStarCatalogue(
  catalogue.buffer.slice(catalogue.byteOffset, catalogue.byteOffset + catalogue.byteLength),
);

test("the compact catalogue retains actual bright HYG stars", () => {
  assert.equal(catalogue.byteLength, 9768);
  assert.equal(stars.length, 1627);
  assert.ok(stars.every((star) => Number.isFinite(star.rightAscension)));
  assert.ok(stars.every((star) => star.magnitude <= 5.02));
  const sirius = stars.find(
    (star) =>
      Math.abs(star.rightAscension - 101.287) < 0.01 && Math.abs(star.declination + 16.716) < 0.01,
  );
  assert.ok(sirius);
  assert.ok(Math.abs(sirius.magnitude + 1.44) < 0.04);
  assert.throws(() => decodeStarCatalogue(new ArrayBuffer(4)));
  assert.throws(() => decodeStarCatalogue(catalogue.buffer.slice(0, 7)));
});

test("lunar sky position agrees with independent Astronomy Engine geocentric samples", () => {
  for (const [date, rightAscension, declination] of [
    ["2026-10-12T15:30:00Z", 218.3225, -20.2095],
    ["2026-10-26T15:30:00Z", 35.1822, 19.0947],
    ["2027-01-15T15:30:00Z", 18.8396, 12.9704],
  ]) {
    const actual = moonEquatorialAt(Date.parse(date));
    const raError = Math.abs(actual.rightAscension - rightAscension);
    assert.ok(Math.min(raError, 360 - raError) < 0.7, date);
    assert.ok(Math.abs(actual.declination - declination) < 0.7, date);
  }
});

test("dated Tikamgarh frames preserve finite star data and change with the Moon", () => {
  const newMoonDay = indiaMoonDay(Date.parse("2026-10-10T15:30:00Z"));
  const fullMoonDay = indiaMoonDay(Date.parse("2026-10-26T15:30:00Z"));
  const first = starFrameAt(newMoonDay, stars);
  const second = starFrameAt(fullMoonDay, stars);
  assert.ok(first.length > 100 && first.length < stars.length * 4);
  assert.ok(second.length > 100 && second.length < stars.length * 4);
  assert.ok(first.every(Number.isFinite));
  assert.ok(second.every(Number.isFinite));
  assert.notDeepEqual(Array.from(first.slice(0, 32)), Array.from(second.slice(0, 32)));
});
