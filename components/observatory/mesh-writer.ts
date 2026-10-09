import { cross, normal, type V3 } from "./vec3.ts";

export function meshWriter() {
  const output: number[] = [];
  const triangle = (a: V3, b: V3, c: V3, color: V3) => {
    const n = normal(cross(b.map((v, i) => v - a[i]) as V3, c.map((v, i) => v - a[i]) as V3));
    [a, b, c].forEach((p, i) =>
      output.push(...p, ...n, ...color, ...[0, 1, 2].map((j) => Number(i === j))),
    );
  };
  return { triangle, build: () => new Float32Array(output) };
}
