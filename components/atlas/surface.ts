import { sampleSea } from "@/lib/sea/sample";
import type { SeaEdition } from "@/lib/sea/types";

type Damping = (across: number) => number;

const full: Damping = () => 1;

export function surfaceLines(edition: SeaEdition, damping: Damping = full) {
  const point = (x: number, z: number) => {
    const { height } = sampleSea(edition, x, z, 0);
    const lift = height * damping(x - z);
    return `${(400 + 19 * (x - z)).toFixed(1)},${(255 + 8.3 * (x + z) - lift * 39).toFixed(1)}`;
  };
  const rows = Array.from({ length: 35 }, (_, row) => {
    const z = -8 + (16 * row) / 34;
    return Array.from({ length: 81 }, (_, i) => point(-10 + (20 * i) / 80, z)).join(" ");
  });
  const columns = Array.from({ length: 9 }, (_, col) => {
    const x = -10 + (20 * col) / 8;
    return Array.from({ length: 61 }, (_, i) => point(x, -8 + (16 * i) / 60)).join(" ");
  });
  const section = Array.from({ length: 161 }, (_, i) => point(-10 + (20 * i) / 160, 0)).join(" ");
  return { rows, columns, section };
}
