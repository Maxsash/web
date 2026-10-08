import { createSeaEditionV1 } from "./edition-v1.ts";
import { createSeaEditionV2 } from "./edition-v2.ts";
import { DEFAULT_SEA_SEED } from "./seed.ts";
import type { SeaEdition, SeaVersion } from "./types.ts";

export function createSeaEdition(seed = DEFAULT_SEA_SEED, version: SeaVersion = "1"): SeaEdition {
  return version === "2" ? createSeaEditionV2(seed) : createSeaEditionV1(seed);
}
