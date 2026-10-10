import { SEA_HALF_FOV } from "./ocean-light.ts";
import { cross, mix, normal, type V3 } from "./vec3.ts";

export function cameraAt(
  reveal: number,
  aspect: number,
  pointer: [number, number],
  destination: { eye: V3; target: V3 } = { eye: [10, 29, 16], target: [0, -0.4, -7] },
) {
  const orbit = reveal * reveal * (3 - 2 * reveal),
    narrow = aspect < 0.8;
  const eye: V3 = [
    mix(0, destination.eye[0], orbit) + pointer[0] * 0.75,
    mix(narrow ? 6.8 : 5, destination.eye[1], orbit) + pointer[1] * 0.35,
    mix(narrow ? 24 : 18, destination.eye[2], orbit),
  ];
  const target: V3 = [
    mix(narrow ? 2.5 : 0, destination.target[0], orbit),
    mix(0.6, destination.target[1], orbit),
    mix(-7, destination.target[2], orbit),
  ];
  return { eye, target };
}

export function seaPointAt(
  [x, y]: [number, number],
  eye: V3,
  target: V3,
  aspect: number,
): [number, number] | null {
  const forward = normal([target[0] - eye[0], target[1] - eye[1], target[2] - eye[2]]);
  const right = normal(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);
  const spread = Math.tan(SEA_HALF_FOV);
  const ray = normal(
    forward.map((f, i) => f + right[i] * x * spread * aspect + up[i] * y * spread) as V3,
  );
  if (ray[1] > -1e-3) return null;
  const distance = -eye[1] / ray[1];
  return [eye[0] + ray[0] * distance, eye[2] + ray[2] * distance];
}
