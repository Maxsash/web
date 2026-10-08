import type { SeaEdition, SeaSample } from "./types.ts";

export const SEA_GRAVITY = 9.81;

export function sampleSea(edition: SeaEdition, x: number, z: number, time: number): SeaSample {
  let height = 0;
  let dx = 0;
  let dz = 0;
  for (const wave of edition.waves) {
    const k = (Math.PI * 2) / wave.wavelength;
    const directionX = Math.cos(wave.direction);
    const directionZ = Math.sin(wave.direction);
    const omega = Math.sqrt(SEA_GRAVITY * k);
    const phase = k * (directionX * x + directionZ * z) - omega * time + wave.phase;
    height += wave.amplitude * Math.sin(phase);
    const slope = wave.amplitude * k * Math.cos(phase);
    dx += slope * directionX;
    dz += slope * directionZ;
  }
  return { height, dx, dz };
}
