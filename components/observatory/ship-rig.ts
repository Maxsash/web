import { buildSailEmblem } from "./ship-emblem.ts";
import type { ShipBuilder, ShipPoint } from "./ship-builder.ts";
import { tint, type Finish } from "./ship-surfaces.ts";
import { mix, type V3 } from "./vec3.ts";

type RigFinishes = Record<"teak" | "brass" | "rope" | "canvas" | "pennant" | "ink", Finish>;
type SailPoint = (u: number, v: number) => ShipPoint;
type Range = [number, number];

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

const MAIN_OUTLINE: Range[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
const JIB_OUTLINE: Range[] = [
  [0, 0],
  [1, 0],
  [0, 1],
];
const PATCH_REACH = 0.22;

const REEF = 0.16;
const REEF_POINTS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

const lifted = (point: ShipPoint, lift: number) => {
  point.position[0] += lift;
  return point;
};

const region =
  (sail: SailPoint, [u0, u1]: Range, [v0, v1]: Range, lift: number): SailPoint =>
  (s, t) =>
    lifted(sail(mix(u0, u1, s), mix(v0, v1, t)), lift);

function clothGrid(
  mesh: ShipBuilder,
  point: SailPoint,
  columns: number,
  rows: number,
  finish: (column: number) => Finish,
) {
  for (let i = 0; i < columns; i++)
    for (let j = 0; j < rows; j++) {
      const a = point(i / columns, j / rows),
        b = point((i + 1) / columns, j / rows),
        c = point((i + 1) / columns, (j + 1) / rows),
        d = point(i / columns, (j + 1) / rows);
      mesh.cloth(a, b, c, finish(i));
      mesh.cloth(a, c, d, finish(i));
    }
}

function clothTriangle(mesh: ShipBuilder, point: SailPoint, divisions: number, finish: Finish) {
  for (let i = 0; i < divisions; i++)
    for (let j = 0; j < divisions - i; j++) {
      const a = point(i / divisions, j / divisions),
        b = point((i + 1) / divisions, j / divisions),
        c = point(i / divisions, (j + 1) / divisions);
      mesh.cloth(a, b, c, finish);
      if (i + j < divisions - 1)
        mesh.cloth(b, point((i + 1) / divisions, (j + 1) / divisions), c, finish);
    }
}

function reinforceCorners(mesh: ShipBuilder, sail: SailPoint, outline: Range[], finish: Finish) {
  outline.forEach((at, index) => {
    const [along, toward] = [outline.at(index - 1)!, outline[(index + 1) % outline.length]].map(
      (neighbour) => {
        const [from, to] = [at, neighbour].map((corner) => sail(...corner).position);
        const reach = PATCH_REACH / Math.hypot(...to.map((v, i) => v - from[i]));
        return neighbour.map((v, i) => (v - at[i]) * reach);
      },
    );
    for (const side of [-1, 1])
      clothTriangle(
        mesh,
        (s, t) =>
          lifted(
            sail(at[0] + along[0] * s + toward[0] * t, at[1] + along[1] * s + toward[1] * t),
            side * 0.007,
          ),
        2,
        finish,
      );
  });
}

export function buildShipRig(mesh: ShipBuilder, finishes: RigFinishes) {
  const { teak, brass, rope, canvas, pennant, ink } = finishes;
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
  const seam = () => tint(canvas, 0.8);
  clothGrid(mesh, mainPoint, columns, rows, (column) => tint(canvas, column % 2 ? 0.98 : 1));
  clothTriangle(mesh, jibPoint, columns, canvas);
  reinforceCorners(mesh, mainPoint, MAIN_OUTLINE, tint(canvas, 0.92));
  reinforceCorners(mesh, jibPoint, JIB_OUTLINE, tint(canvas, 0.92));
  for (const side of [-1, 1]) {
    for (const u of [0.2, 0.4, 0.6, 0.8])
      clothGrid(
        mesh,
        region(mainPoint, [u - 0.002, u + 0.002], [0, 1], side * 0.006),
        1,
        rows,
        seam,
      );
    clothGrid(
      mesh,
      region(mainPoint, [0, 1], [REEF - 0.003, REEF + 0.003], side * 0.0065),
      columns,
      1,
      seam,
    );
    for (const u of REEF_POINTS)
      clothGrid(
        mesh,
        region(mainPoint, [u - 0.004, u + 0.004], [REEF - 0.035, REEF], side * 0.009),
        1,
        1,
        () => rope,
      );
    buildSailEmblem(mesh, (u, v, lift) =>
      lifted(mainPoint(0.53 + side * u * 0.13, 0.62 + v * 0.09), side * lift),
    );
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
    mesh.cloth(a, b, i < 7 ? c : d, i < 2 ? ink : pennant);
    if (i < 7) mesh.cloth(a, c, d, i < 2 ? ink : pennant);
  }
}
