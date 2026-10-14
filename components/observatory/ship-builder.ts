import { meshWriter } from "./mesh-writer.ts";
import { surfaceIndex, type Finish } from "./ship-surfaces.ts";
import { cross, normal, type V3 } from "./vec3.ts";

export type ShipPoint = { position: V3; flex: V3 };

export function shipBuilder() {
  const writer = meshWriter();
  const flex: number[] = [];
  const surfaces: number[] = [];
  const write = (a: V3, b: V3, c: V3, { color, surface }: Finish) => {
    writer.triangle(a, b, c, color);
    surfaces.push(...Array<number>(3).fill(surfaceIndex(surface)));
  };
  const triangle = (a: V3, b: V3, c: V3, finish: Finish) => {
    write(a, b, c, finish);
    flex.push(...Array<number>(9).fill(0));
  };
  const cloth = (a: ShipPoint, b: ShipPoint, c: ShipPoint, finish: Finish) => {
    write(a.position, b.position, c.position, finish);
    flex.push(...a.flex, ...b.flex, ...c.flex);
  };
  const quad = (a: V3, b: V3, c: V3, d: V3, finish: Finish) => {
    triangle(a, b, c, finish);
    triangle(a, c, d, finish);
  };
  const spar = (a: V3, b: V3, radius: number, finish: Finish, sides = 6) => {
    const direction = normal(b.map((v, i) => v - a[i]) as V3);
    const right = normal(cross(direction, Math.abs(direction[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]));
    const up = cross(direction, right);
    const rim = (center: V3, index: number): V3 => {
      const angle = (index / sides) * Math.PI * 2;
      return center.map(
        (v, i) => v + radius * (right[i] * Math.cos(angle) + up[i] * Math.sin(angle)),
      ) as V3;
    };
    for (let i = 0; i < sides; i++) {
      quad(rim(a, i), rim(a, i + 1), rim(b, i + 1), rim(b, i), finish);
      triangle(a, rim(a, i + 1), rim(a, i), finish);
      triangle(b, rim(b, i), rim(b, i + 1), finish);
    }
  };
  const box = (center: V3, size: V3, finish: Finish) => {
    const corners = Array.from(
      { length: 8 },
      (_, index) =>
        center.map((v, axis) => v + size[axis] * (index & (1 << axis) ? 0.5 : -0.5)) as V3,
    );
    for (const [a, b, c, d] of [
      [0, 1, 3, 2],
      [4, 6, 7, 5],
      [0, 4, 5, 1],
      [2, 3, 7, 6],
      [0, 2, 6, 4],
      [1, 5, 7, 3],
    ])
      quad(corners[a], corners[b], corners[c], corners[d], finish);
  };
  return {
    triangle,
    cloth,
    quad,
    spar,
    box,
    build: () => ({
      vertices: writer.build(),
      flex: new Float32Array(flex),
      surfaces: new Float32Array(surfaces),
    }),
  };
}

export type ShipBuilder = ReturnType<typeof shipBuilder>;
