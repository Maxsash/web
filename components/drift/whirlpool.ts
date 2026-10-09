import { sampleSea } from "../../lib/sea/sample.ts";
import type { SeaEdition, SeaSample } from "../../lib/sea/types.ts";
import type { Whirlpool } from "./scenes.ts";

export const scaleSwell = (edition: SeaEdition, swell: number): SeaEdition => ({
  ...edition,
  waves: edition.waves.map((wave) => ({ ...wave, amplitude: wave.amplitude * swell })),
});

export function sampleDrift(
  edition: SeaEdition,
  whirlpool: Whirlpool | undefined,
  x: number,
  z: number,
  time: number,
): SeaSample {
  if (!whirlpool) return sampleSea(edition, x, z, time);
  const [cx, cz] = whirlpool.centre,
    ox = x - cx,
    oz = z - cz,
    spread = whirlpool.radius * whirlpool.radius;
  const pull = Math.exp(-(ox * ox + oz * oz) / spread),
    turn = whirlpool.twist * pull;
  const waves = sampleSea(
    edition,
    cx + Math.cos(turn) * ox - Math.sin(turn) * oz,
    cz + Math.sin(turn) * ox + Math.cos(turn) * oz,
    time,
  );
  const slope = (whirlpool.depth * pull * 2) / spread;
  return {
    height: waves.height - whirlpool.depth * pull,
    dx: waves.dx + slope * ox,
    dz: waves.dz + slope * oz,
  };
}
