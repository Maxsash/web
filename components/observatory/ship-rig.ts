import type { ShipBuilder, ShipPoint } from "./ship-builder.ts";
import { mix, type V3 } from "./vec3.ts";

type RigColors = Record<"teak" | "brass" | "rope" | "canvas" | "rust" | "ink", V3>;

const mainPoint = (u: number, v: number): ShipPoint => {
  const fullness = Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
  return {
    position: [
      0.035 + fullness * 0.36,
      mix(0.93 + u * 0.04, 3.4 + u * 0.8, v),
      mix(0.3 - u * 2.35, 0.3 - u * 1.75, v),
    ],
    flex: [fullness * 0.085, u * 2.4 + v * 1.5, 0],
  };
};

const jibPoint = (u: number, v: number): ShipPoint => {
  const fullness = 27 * u * v * Math.max(0, 1 - u - v);
  return {
    position: [0.02 + fullness * 0.23, 0.76 + u * 3.31 + v * 0.07, 3.24 - u * 2.88 - v * 2.18],
    flex: [fullness * 0.06, u * 2 + v * 3, 0],
  };
};

export function buildShipRig(mesh: ShipBuilder, colors: RigColors) {
  const { teak, brass, rope, canvas, rust, ink } = colors;
  mesh.spar([0, 0.4, 0.3], [0, 4.6, 0.3], 0.047, teak, 8);
  mesh.spar([0, 0.91, 0.3], [0, 0.95, -2.12], 0.031, teak);
  mesh.spar([0, 3.37, 0.3], [0, 4.23, -1.5], 0.031, teak);
  mesh.spar([0, 0.57, 1.78], [0, 0.75, 3.4], 0.038, teak);
  for (const height of [0.68, 0.94, 3.37, 4.47])
    mesh.spar([0, height, 0.3], [0, height + 0.045, 0.3], 0.056, brass, 8);
  for (const end of [
    [-0.63, 0.48, -0.58],
    [0.63, 0.48, -0.58],
    [0, 0.74, 3.4],
    [0, 0.59, -2.07],
  ] as V3[])
    mesh.spar([0, 4.48, 0.3], end, 0.009, rope, 3);
  mesh.spar([0, 4.48, 0.3], [0, 4.23, -1.5], 0.008, rope, 3);
  mesh.spar([0, 0.74, 3.4], [0, -0.05, 2.1], 0.009, rope, 3);
  mesh.spar([0, 0.95, -2.12], [0.33, 0.57, -1.62], 0.008, rope, 3);
  const columns = 10,
    rows = 9;
  for (let i = 0; i < columns; i++)
    for (let j = 0; j < rows; j++) {
      const a = mainPoint(i / columns, j / rows),
        b = mainPoint((i + 1) / columns, j / rows),
        c = mainPoint((i + 1) / columns, (j + 1) / rows),
        d = mainPoint(i / columns, (j + 1) / rows);
      const shade = canvas.map((v) => v * (i % 2 ? 0.98 : 1)) as V3;
      mesh.cloth(a, b, c, shade);
      mesh.cloth(a, c, d, shade);
    }
  for (let i = 0; i < columns; i++)
    for (let j = 0; j < columns - i; j++) {
      const a = jibPoint(i / columns, j / columns),
        b = jibPoint((i + 1) / columns, j / columns),
        c = jibPoint(i / columns, (j + 1) / columns);
      mesh.cloth(a, b, c, canvas);
      if (i + j < columns - 1)
        mesh.cloth(b, jibPoint((i + 1) / columns, (j + 1) / columns), c, canvas);
    }
  for (const side of [-1, 1]) {
    for (const u of [0.2, 0.4, 0.6, 0.8])
      for (let j = 0; j < rows; j++) {
        const a = mainPoint(u - 0.002, j / rows),
          b = mainPoint(u + 0.002, j / rows),
          c = mainPoint(u + 0.002, (j + 1) / rows),
          d = mainPoint(u - 0.002, (j + 1) / rows);
        for (const point of [a, b, c, d]) point.position[0] += side * 0.006;
        const seam = canvas.map((v) => v * 0.8) as V3;
        mesh.cloth(a, b, c, seam);
        mesh.cloth(a, c, d, seam);
      }
    const emblem = (angle: number, radius: number): ShipPoint => {
      const point = mainPoint(0.53 + Math.cos(angle) * radius, 0.62 + Math.sin(angle) * radius);
      point.position[0] += side * 0.009;
      return point;
    };
    const center = emblem(0, 0);
    for (let i = 0; i < 16; i++) {
      const radius = (index: number) => (index % 2 ? 0.018 : index % 4 ? 0.047 : 0.075);
      mesh.cloth(
        center,
        emblem((i * Math.PI) / 8, radius(i)),
        emblem(((i + 1) * Math.PI) / 8, radius(i + 1)),
        rust,
      );
    }
  }
  for (let i = 0; i < 8; i++) {
    const point = (t: number, top: boolean): ShipPoint => ({
      position: [
        0.04 + Math.sin(t * 4) * t * 0.08,
        4.48 - (top ? 0 : 0.21 * (1 - t)) - t * 0.1,
        0.3 - t * 0.83,
      ],
      flex: [0.04 * t, t * 4, 0.035 * t],
    });
    const a = point(i / 8, true),
      b = point((i + 1) / 8, true),
      c = point((i + 1) / 8, false),
      d = point(i / 8, false);
    mesh.cloth(a, b, i < 7 ? c : d, i < 2 ? ink : rust);
    if (i < 7) mesh.cloth(a, c, d, i < 2 ? ink : rust);
  }
}
