import { meshWriter } from "./mesh-writer.ts";
import type { V3 } from "./vec3.ts";

export function buildShipMesh() {
  const { triangle, build } = meshWriter();
  const hull: V3 = [0.39, 0.22, 0.12],
    deck: V3 = [0.84, 0.78, 0.63],
    sail: V3 = [0.94, 0.91, 0.78];
  const rows: V3[][] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16,
      z = (t - 0.5) * 3.6,
      width = 0.64 * Math.pow(Math.sin(Math.PI * t), 0.6) + 0.035;
    rows.push(
      Array.from({ length: 9 }, (_, j) => {
        const a = (j / 8) * Math.PI;
        return [Math.cos(a) * width, 0.14 - Math.sin(a) * 0.52, z] as V3;
      }),
    );
  }
  for (let i = 0; i < 16; i++)
    for (let j = 0; j < 8; j++) {
      triangle(rows[i][j], rows[i + 1][j], rows[i][j + 1], hull);
      triangle(rows[i][j + 1], rows[i + 1][j], rows[i + 1][j + 1], hull);
    }
  for (let i = 0; i < 16; i++) {
    triangle(rows[i][0], rows[i][8], rows[i + 1][0], deck);
    triangle(rows[i + 1][0], rows[i][8], rows[i + 1][8], deck);
  }
  for (let i = 0; i < 24; i++)
    for (let j = 0; j < 6; j++) {
      const mast = (u: number, v: number): V3 => [
        Math.sin(u * 1.3) * 0.09 + Math.cos(v) * 0.035,
        0.15 + u * 3.4,
        Math.sin(v) * 0.035,
      ];
      const a = mast(i / 24, (j * Math.PI) / 3),
        b = mast((i + 1) / 24, (j * Math.PI) / 3),
        c = mast(i / 24, ((j + 1) * Math.PI) / 3),
        d = mast((i + 1) / 24, ((j + 1) * Math.PI) / 3);
      triangle(a, b, c, deck);
      triangle(c, b, d, deck);
    }
  for (const side of [-1, 1]) {
    const n = 10;
    const point = (i: number, j: number): V3 => {
      const u = i / n,
        v = j / n;
      return [
        Math.sin(v * Math.PI) * 0.28 * (1 - u) + 0.045,
        0.35 + u * 3.1,
        side * v * (1 - u) * (side === 1 ? 1.55 : 1.2),
      ];
    };
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        triangle(point(i, j), point(i + 1, j), point(i, j + 1), sail);
        triangle(point(i, j + 1), point(i + 1, j), point(i + 1, j + 1), sail);
      }
  }
  return build();
}
