import { seededRandom } from "./random.ts";
import { seedFromSettings, settingsFromSeed } from "./seed.ts";
import type { SeaEdition } from "./types.ts";
import { BASE_AMPLITUDES, BASE_DIRECTIONS, BASE_WAVELENGTHS, rounded } from "./wave-table.ts";

export function createSeaEditionV2(seed: string): SeaEdition {
  const settings = settingsFromSeed(seed);
  const swell = settings.swell / 255;
  const heading = settings.heading / 255;
  const character = settings.character / 255;
  const random = seededRandom(0x9e3779b1 ^ Math.imul(settings.variation + 1, 0x85ebca6b));

  const height = 0.55 + 1.0 * swell;
  const gain = 0.5 + 1.2 * character;
  const weights = BASE_AMPLITUDES.map((_, index) => Math.pow(gain, (index - 2.5) / 2.5));
  const energy = BASE_AMPLITUDES.reduce(
    (sum, amplitude, index) => sum + amplitude * weights[index],
    0,
  );
  const normal = BASE_AMPLITUDES.reduce((sum, amplitude) => sum + amplitude, 0) / energy;
  const lengthScale = 1.45 - 0.45 * character;
  const spread = 0.35 + 1.0 * character;
  const turn = (heading - 0.5) * 2.0;

  return {
    version: "2",
    seed: seedFromSettings(settings),
    kind: "authored",
    settings,
    waves: BASE_AMPLITUDES.map((amplitude, index) => ({
      amplitude: rounded(amplitude * weights[index] * normal * height * (0.92 + random() * 0.16)),
      wavelength: rounded(BASE_WAVELENGTHS[index] * lengthScale * (0.95 + random() * 0.1)),
      direction: rounded(turn + BASE_DIRECTIONS[index] * spread + (random() - 0.5) * 0.2),
      phase: rounded(random() * Math.PI * 2),
    })),
  };
}
