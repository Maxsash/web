import { SEA_LIGHT_SCREEN } from "./ocean-light.ts";

type Bounds = { left: number; right: number; top: number; bottom: number };

export function skyControlBounds(width: number, height: number): Bounds {
  const halfSize = Math.max(44, height * 0.056) / 2;
  const x = SEA_LIGHT_SCREEN[0] * width;
  const y = (1 - SEA_LIGHT_SCREEN[1]) * height;
  return { left: x - halfSize, right: x + halfSize, top: y - halfSize, bottom: y + halfSize };
}

export function boundsOverlap(a: Bounds, b: Bounds) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
