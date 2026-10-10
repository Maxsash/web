import { shipBuilder } from "./ship-builder.ts";
import { buildShipRig } from "./ship-rig.ts";
import type { V3 } from "./vec3.ts";

const COLORS = {
  hull: [0.12, 0.27, 0.28],
  rust: [0.66, 0.29, 0.18],
  teak: [0.49, 0.31, 0.19],
  deck: [0.72, 0.65, 0.48],
  brass: [0.78, 0.59, 0.29],
  ink: [0.08, 0.16, 0.17],
  rope: [0.42, 0.4, 0.31],
  canvas: [0.94, 0.9, 0.76],
} satisfies Record<string, V3>;

export function buildShipMesh() {
  const mesh = shipBuilder();
  const { hull, rust, teak, deck, brass, ink } = COLORS;
  const sections = 18;
  const edge = (t: number, side: number): V3 => {
    const width = 0.024 + 0.7 * Math.pow(Math.sin(Math.PI * (0.09 + t * 0.91)), 0.72);
    return [side * width, 0.47 + 0.17 * Math.pow(t * 2 - 1, 2), -2.15 + t * 4.55];
  };
  const section = (t: number, side: number): V3[] => {
    const [x, y, z] = edge(t, side);
    return [
      [x, y, z],
      [x * 1.01, y - 0.13, z],
      [x * 0.96, 0.12, z],
      [x * 0.7, -0.29, z],
      [x * 0.12, -0.63, z],
    ];
  };
  for (let i = 0; i < sections; i++) {
    const t = i / sections,
      next = (i + 1) / sections;
    for (const side of [-1, 1]) {
      const a = section(t, side),
        b = section(next, side);
      for (let level = 0; level < 4; level++)
        mesh.quad(a[level], b[level], b[level + 1], a[level + 1], [rust, hull, hull, teak][level]);
      mesh.spar(edge(t, side), edge(next, side), 0.026, brass, 4);
    }
    const left = edge(t, -1),
      right = edge(t, 1),
      nextLeft = edge(next, -1),
      nextRight = edge(next, 1);
    mesh.quad(section(t, -1)[4], section(t, 1)[4], section(next, 1)[4], section(next, -1)[4], teak);
    for (const point of [left, right, nextLeft, nextRight]) point[1] -= 0.12;
    mesh.quad(left, right, nextRight, nextLeft, deck);
    for (const fraction of [-0.66, -0.33, 0, 0.33, 0.66])
      mesh.spar(
        [right[0] * fraction, right[1] + 0.004, right[2]],
        [nextRight[0] * fraction, nextRight[1] + 0.004, nextRight[2]],
        0.005,
        teak,
        3,
      );
  }
  const sternLeft = section(0, -1),
    sternRight = section(0, 1);
  for (let level = 0; level < 4; level++)
    mesh.quad(
      sternLeft[level],
      sternLeft[level + 1],
      sternRight[level + 1],
      sternRight[level],
      level === 0 ? rust : hull,
    );
  const bowLeft = section(1, -1),
    bowRight = section(1, 1);
  for (let level = 0; level < 4; level++)
    mesh.quad(bowLeft[level], bowRight[level], bowRight[level + 1], bowLeft[level + 1], hull);
  mesh.box([0, 0.58, -0.35], [0.76, 0.38, 0.95], teak);
  mesh.box([0, 0.79, -0.35], [0.83, 0.07, 1.02], deck);
  mesh.box([0, 0.84, -0.32], [0.48, 0.06, 0.52], brass);
  mesh.box([0, 0.88, -0.32], [0.4, 0.025, 0.44], ink);
  mesh.spar([-0.22, 0.9, -0.32], [0.22, 0.9, -0.32], 0.015, brass);
  mesh.spar([0, 0.9, -0.57], [0, 0.9, -0.07], 0.015, brass);
  mesh.box([0, 0.45, -1.38], [0.74, 0.12, 0.72], teak);
  mesh.box([0, 0.52, -1.38], [0.6, 0.035, 0.59], ink);
  for (const side of [-1, 1]) {
    mesh.box([side * 0.37, 0.56, -1.42], [0.16, 0.12, 0.8], deck);
    mesh.spar([side * 0.4, 0.5, 1.45], [side * 0.4, 0.64, 1.45], 0.032, brass);
    mesh.spar([side * 0.31, 0.61, 1.45], [side * 0.49, 0.61, 1.45], 0.019, brass);
  }
  mesh.box([0, 0.37, -2.2], [0.08, 0.65, 0.28], hull);
  mesh.spar([0, 0.58, -2.12], [0.2, 0.62, -1.2], 0.027, teak);
  buildShipRig(mesh, COLORS);
  return mesh.build();
}
