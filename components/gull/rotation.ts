import type { V3 } from "../observatory/vec3.ts";

export type Rotation = readonly number[];

export function aboutX(angle: number): Rotation {
  const c = Math.cos(angle),
    s = Math.sin(angle);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}

export function aboutY(angle: number): Rotation {
  const c = Math.cos(angle),
    s = Math.sin(angle);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}

export function aboutZ(angle: number): Rotation {
  const c = Math.cos(angle),
    s = Math.sin(angle);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

function multiply(a: Rotation, b: Rotation): Rotation {
  const product = new Array<number>(9);
  for (let row = 0; row < 3; row++)
    for (let column = 0; column < 3; column++)
      product[row * 3 + column] =
        a[row * 3] * b[column] + a[row * 3 + 1] * b[3 + column] + a[row * 3 + 2] * b[6 + column];
  return product;
}

export const compose = (...rotations: Rotation[]) => rotations.reduce(multiply);

export const turn = (r: Rotation, [x, y, z]: V3): V3 => [
  r[0] * x + r[1] * y + r[2] * z,
  r[3] * x + r[4] * y + r[5] * z,
  r[6] * x + r[7] * y + r[8] * z,
];

export const unturn = (r: Rotation, [x, y, z]: V3): V3 => [
  r[0] * x + r[3] * y + r[6] * z,
  r[1] * x + r[4] * y + r[7] * z,
  r[2] * x + r[5] * y + r[8] * z,
];
