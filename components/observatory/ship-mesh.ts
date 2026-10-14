import { shipBuilder } from "./ship-builder.ts";
import { buildShipRig } from "./ship-rig.ts";
import { finish, type Finish } from "./ship-surfaces.ts";
import { mix, type V3 } from "./vec3.ts";

const RUST: V3 = [0.66, 0.29, 0.18];
const TEAK: V3 = [0.49, 0.31, 0.19];
const DECK: V3 = [0.72, 0.65, 0.48];
const SILVERED_DECK: V3 = [0.63, 0.62, 0.57];

const FINISHES = {
  hull: finish([0.12, 0.27, 0.28], "topsides"),
  sheer: finish(RUST, "topsides"),
  bottom: finish(TEAK, "topsides"),
  teak: finish(TEAK, "brightwork"),
  caulk: finish(TEAK, "plain"),
  deck: finish(DECK, "deck"),
  brass: finish([0.78, 0.59, 0.29], "metal"),
  ink: finish([0.08, 0.16, 0.17], "plain"),
  pennant: finish(RUST, "plain"),
  rope: finish([0.42, 0.4, 0.31], "rope"),
  canvas: finish([0.94, 0.9, 0.76], "canvas"),
};

const PLANK_EDGES = [-1, -0.66, -0.33, 0, 0.33, 0.66, 1];
const PLANK_LENGTH = 5;

const scatter = (a: number, b: number) => {
  const value = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

export function plankFinish(plank: number, section: number): Finish {
  const run = Math.floor((section + plank * 2) / PLANK_LENGTH);
  const grey = scatter(plank, run);
  const outboard = plank === 0 || plank === PLANK_EDGES.length - 2;
  const silvering = 0.15 + grey * 0.3 + (outboard ? 0.15 : 0);
  const shade = outboard ? 0.88 : 0.9 + grey * 0.14;
  return finish(DECK.map((v, i) => mix(v, SILVERED_DECK[i], silvering) * shade) as V3, "deck");
}

export function buildShipMesh() {
  const mesh = shipBuilder();
  const { hull, sheer, bottom, teak, caulk, deck, brass, ink } = FINISHES;
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
  const across = (point: V3, fraction: number, offset = 0, lift = 0): V3 => [
    point[0] * fraction + offset,
    point[1] + lift,
    point[2],
  ];
  for (let i = 0; i < sections; i++) {
    const t = i / sections,
      next = (i + 1) / sections;
    for (const side of [-1, 1]) {
      const a = section(t, side),
        b = section(next, side);
      for (let level = 0; level < 4; level++)
        mesh.quad(
          a[level],
          b[level],
          b[level + 1],
          a[level + 1],
          [sheer, hull, hull, bottom][level],
        );
      mesh.spar(edge(t, side), edge(next, side), 0.026, brass, 4);
    }
    const right = edge(t, 1),
      nextRight = edge(next, 1);
    mesh.quad(
      section(t, -1)[4],
      section(t, 1)[4],
      section(next, 1)[4],
      section(next, -1)[4],
      bottom,
    );
    for (const point of [right, nextRight]) point[1] -= 0.12;
    for (let plank = 0; plank < PLANK_EDGES.length - 1; plank++) {
      const [inner, outer] = PLANK_EDGES.slice(plank, plank + 2);
      mesh.quad(
        across(right, inner),
        across(right, outer),
        across(nextRight, outer),
        across(nextRight, inner),
        plankFinish(plank, i),
      );
    }
    for (const seam of PLANK_EDGES.slice(1, -1))
      mesh.quad(
        across(right, seam, -0.0065, 0.004),
        across(right, seam, 0.0065, 0.004),
        across(nextRight, seam, 0.0065, 0.004),
        across(nextRight, seam, -0.0065, 0.004),
        caulk,
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
      level === 0 ? sheer : hull,
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
  buildShipRig(mesh, FINISHES);
  return mesh.build();
}
