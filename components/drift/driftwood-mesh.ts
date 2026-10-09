import { meshWriter } from "../observatory/mesh-writer.ts";
import { gridIndices } from "../observatory/sea-grid.ts";
import { cross, normal, type V3 } from "../observatory/vec3.ts";

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];

type Triangle = ReturnType<typeof meshWriter>["triangle"];

function log(triangle: Triangle, from: V3, to: V3, radius: number, bark: V3, endGrain: V3) {
  const segments = 9;
  const axis = normal(add(to, scale(from, -1)));
  const side = normal(cross(axis, [0, 1, 0])),
    up = cross(axis, side);
  const rim = (centre: V3, angle: number) =>
    add(centre, scale(add(scale(side, Math.cos(angle)), scale(up, Math.sin(angle))), radius));
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2,
      a1 = ((i + 1) / segments) * Math.PI * 2;
    const shade = scale(bark, 0.88 + 0.12 * Math.sin(i * 2.3));
    triangle(rim(from, a0), rim(to, a0), rim(from, a1), shade);
    triangle(rim(from, a1), rim(to, a0), rim(to, a1), shade);
    triangle(from, rim(from, a1), rim(from, a0), endGrain);
    triangle(to, rim(to, a0), rim(to, a1), endGrain);
  }
}

function slab(
  triangle: Triangle,
  outline: [x: number, z: number][],
  thickness: number,
  face: V3,
  edge: V3,
) {
  const top = thickness / 2,
    bottom = -top;
  const cx = outline.reduce((sum, [x]) => sum + x, 0) / outline.length,
    cz = outline.reduce((sum, [, z]) => sum + z, 0) / outline.length;
  outline.forEach(([ax, az], i) => {
    const [bx, bz] = outline[(i + 1) % outline.length];
    triangle([cx, top, cz], [bx, top, bz], [ax, top, az], face);
    triangle([cx, bottom, cz], [ax, bottom, az], [bx, bottom, bz], edge);
    triangle([ax, bottom, az], [ax, top, az], [bx, top, bz], edge);
    triangle([ax, bottom, az], [bx, top, bz], [bx, bottom, bz], edge);
  });
}

const BARK: V3[] = [
  [0.42, 0.29, 0.17],
  [0.36, 0.25, 0.15],
  [0.47, 0.33, 0.2],
  [0.39, 0.27, 0.16],
  [0.44, 0.31, 0.18],
];
const END_GRAIN: V3 = [0.66, 0.53, 0.36];
const ROPE: V3 = [0.72, 0.62, 0.42];
const STICK: V3 = [0.5, 0.38, 0.24];
const RAG: V3 = [0.78, 0.74, 0.64];
const BOARD: V3 = [0.52, 0.42, 0.3];
const BOARD_EDGE: V3 = [0.4, 0.31, 0.21];
const PLANK_LENGTH = 2.7;

export function buildRaft() {
  const { triangle, build } = meshWriter();
  const ragged = [-0.08, 0.14, -0.18, 0.06, -0.02];
  BARK.forEach((bark, i) => {
    const x = -0.7 + i * 0.35;
    log(
      triangle,
      [x, 0, -1.35 + ragged[i]],
      [x, 0, 1.4 + ragged[(i + 2) % 5]],
      0.17,
      bark,
      END_GRAIN,
    );
  });
  for (const z of [-0.85, 0.8])
    log(triangle, [-0.98, 0.16, z], [0.98, 0.16, z + 0.04], 0.045, ROPE, ROPE);
  log(triangle, [0.2, 0.1, 0.2], [0.05, 1.5, 0.05], 0.045, STICK, STICK);
  triangle([0.07, 1.45, 0.06], [0.1, 0.85, 0.1], [0.12, 1.25, 0.75], RAG);
  triangle([0.1, 0.85, 0.1], [0.12, 1.25, 0.75], [0.14, 0.95, 0.6], scale(RAG, 0.93));
  return build();
}

export function buildPlank() {
  const { triangle, build } = meshWriter();
  const end = PLANK_LENGTH / 2;
  const splintered: [number, number][] = [
    [-0.18, -end],
    [0.18, -end],
    [0.18, end - 0.25],
    [0.09, end - 0.05],
    [0.03, end - 0.3],
    [-0.06, end],
    [-0.12, end - 0.18],
    [-0.18, end - 0.1],
  ];
  slab(triangle, splintered, 0.1, BOARD, BOARD_EDGE);
  return build();
}

export function buildPageGrid(columns = 28, rows = 36) {
  const uv: number[] = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= columns; i++) uv.push(i / columns, j / rows);
  return { uv: new Float32Array(uv), indices: gridIndices(columns, rows) };
}
