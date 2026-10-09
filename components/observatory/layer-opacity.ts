import { clamp01 } from "./clamp.ts";

export function layerOpacities(progress: number) {
  const intro = 1 - clamp01((progress - 0.06) / 0.24);
  const end = clamp01((progress - 0.75) / 0.2);
  const veil = clamp01((progress - 0.17) / 0.3);
  return [intro, end, veil];
}
