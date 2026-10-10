import { meshWriter } from "./mesh-writer.ts";
import { cross, normal, type V3 } from "./vec3.ts";

export type ShipPoint = { position: V3; flex: V3 };

export function shipBuilder() {
  const writer = meshWriter();
  const flex: number[] = [];
  const triangle = (a: V3, b: V3, c: V3, color: V3) => {
    writer.triangle(a, b, c, color);
    flex.push(...Array<number>(9).fill(0));
  };
  const cloth = (a: ShipPoint, b: ShipPoint, c: ShipPoint, color: V3) => {
    writer.triangle(a.position, b.position, c.position, color);
    flex.push(...a.flex, ...b.flex, ...c.flex);
  };
  const quad = (a: V3, b: V3, c: V3, d: V3, color: V3) => {
    triangle(a, b, c, color);
    triangle(a, c, d, color);
  };
  const spar = (a: V3, b: V3, radius: number, color: V3, sides = 6) => {
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
      quad(rim(a, i), rim(a, i + 1), rim(b, i + 1), rim(b, i), color);
      triangle(a, rim(a, i + 1), rim(a, i), color);
      triangle(b, rim(b, i), rim(b, i + 1), color);
    }
  };
  const box = (center: V3, size: V3, color: V3) => {
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
      quad(corners[a], corners[b], corners[c], corners[d], color);
  };
  return {
    triangle,
    cloth,
    quad,
    spar,
    box,
    build: () => ({ vertices: writer.build(), flex: new Float32Array(flex) }),
  };
}

export type ShipBuilder = ReturnType<typeof shipBuilder>;
