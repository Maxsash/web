import { seededRandom } from "./random.ts";
import { DEFAULT_SEA_SEED, requireSeaSeed } from "./seed.ts";
import type { SeaEdition } from "./types.ts";
import { BASE_AMPLITUDES, BASE_DIRECTIONS, BASE_WAVELENGTHS, rounded } from "./wave-table.ts";

// Frozen: changing any coefficient or the generator changes every version 1 edition ever shared.
export function createSeaEditionV1(seed = DEFAULT_SEA_SEED): SeaEdition {
  const canonical = requireSeaSeed(seed);
  const random = seededRandom(Number.parseInt(canonical, 16));

  return {
    version: "1",
    seed: canonical,
    kind: "authored",
    waves: BASE_AMPLITUDES.map((amplitude, index) => ({
      amplitude: rounded(amplitude * (0.9 + random() * 0.2)),
      wavelength: BASE_WAVELENGTHS[index],
      direction: rounded(BASE_DIRECTIONS[index] + (random() - 0.5) * 0.45),
      phase: rounded(random() * Math.PI * 2),
    })),
  };
}
