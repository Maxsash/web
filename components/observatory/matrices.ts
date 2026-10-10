import { SEA_HALF_FOV } from "./ocean-light.ts";
import { cross, dot, normal, type V3 } from "./vec3.ts";

export function multiply(a: Float32Array, b: Float32Array) {
  const result = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) result[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return result;
}
export function perspective(aspect: number) {
  const f = 1 / Math.tan(SEA_HALF_FOV),
    near = 0.1,
    far = 450;
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0,
  ]);
}
export function lookAt(eye: V3, target: V3) {
  const z = normal(eye.map((v, i) => v - target[i]) as V3),
    x = normal(cross([0, 1, 0], z)),
    y = cross(z, x);
  return new Float32Array([
    x[0],
    y[0],
    z[0],
    0,
    x[1],
    y[1],
    z[1],
    0,
    x[2],
    y[2],
    z[2],
    0,
    -dot(x, eye),
    -dot(y, eye),
    -dot(z, eye),
    1,
  ]);
}
