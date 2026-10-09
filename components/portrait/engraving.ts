import { sampleSea } from "../../lib/sea/sample.ts";
import type { SeaEdition } from "../../lib/sea/types.ts";

export type Shade = (x: number, y: number) => number;

export const PLATE = 1000;
export const SHADE_SIZE = 160;
export const ROWS = 72;

const STEP = 4;
const GAP = PLATE / ROWS;
const LIFT = GAP * 2.6;
const SWELL = GAP * 0.8;
const METRES_ACROSS = 60;
const METRES_PER_ROW = 1.8;
const MARGIN = 12;

const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

export function shadeFromPixels(rgba: Uint8ClampedArray, size: number): Shade {
  const luma = (column: number, row: number) => {
    const i = (row * size + column) * 4;
    return (0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]) / 255;
  };
  return (x, y) => {
    const fx = Math.min(size - 1.001, Math.max(0, x * (size - 1)));
    const fy = Math.min(size - 1.001, Math.max(0, y * (size - 1)));
    const column = Math.floor(fx);
    const row = Math.floor(fy);
    const tx = fx - column;
    const ty = fy - row;
    const top = luma(column, row) * (1 - tx) + luma(column + 1, row) * tx;
    const bottom = luma(column, row + 1) * (1 - tx) + luma(column + 1, row + 1) * tx;
    return top * (1 - ty) + bottom * ty;
  };
}

function rowLine(shade: Shade, sea: SeaEdition, row: number) {
  const base = (row + 0.5) * GAP + LIFT * 0.35;
  const points: string[] = [];
  for (let x = 0; x <= PLATE; x += STEP) {
    const light = smoothstep(0.16, 0.78, shade(x / PLATE, Math.min(1, base / PLATE)));
    const swell = sampleSea(sea, (x / PLATE) * METRES_ACROSS, row * METRES_PER_ROW, 0).height;
    points.push(`${x} ${(base - LIFT * light - SWELL * (1 - light) * swell).toFixed(1)}`);
  }
  return points;
}

export function engraveRows(shade: Shade, sea: SeaEdition): string[] {
  const below = PLATE + MARGIN * 4;
  return Array.from({ length: ROWS }, (_, row) => {
    const points = rowLine(shade, sea, row);
    const first = points[0].split(" ")[1];
    const last = points[points.length - 1].split(" ")[1];
    return `M${-MARGIN} ${first}L${points.join("L")}L${PLATE + MARGIN} ${last}L${PLATE + MARGIN} ${below}L${-MARGIN} ${below}Z`;
  });
}
