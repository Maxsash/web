import { hashText, seededRandom } from "./random.ts";
import { clampByte, seedFromSettings } from "./seed.ts";
import type { SeaSettings } from "./types.ts";

export const SEA_PRESETS: { name: string; settings: SeaSettings }[] = [
  { name: "Glass", settings: { swell: 30, heading: 128, character: 20, variation: 7 } },
  { name: "Trade wind", settings: { swell: 140, heading: 200, character: 110, variation: 7 } },
  { name: "Squall", settings: { swell: 190, heading: 50, character: 200, variation: 7 } },
];
export const HOME_WATER: SeaSettings = { swell: 112, heading: 128, character: 109, variation: 94 };

export function pickVisitSea(random: () => number = Math.random): string {
  const starts = [
    { settings: HOME_WATER, weight: 3 },
    { settings: SEA_PRESETS[1].settings, weight: 3 },
    { settings: SEA_PRESETS[0].settings, weight: 2 },
    { settings: SEA_PRESETS[2].settings, weight: 2 },
  ];
  let ticket = random() * starts.reduce((sum, start) => sum + start.weight, 0);
  const start = (starts.find((candidate) => (ticket -= candidate.weight) < 0) ?? starts[0])
    .settings;
  const nudge = (value: number, range: number) => clampByte(value + (random() * 2 - 1) * range);
  return seedFromSettings({
    swell: nudge(start.swell, 28),
    heading: nudge(start.heading, 70),
    character: nudge(start.character, 32),
    variation: Math.floor(random() * 256),
  });
}

export const seaSeedForName = (name: string) => pickVisitSea(seededRandom(hashText(name)));
